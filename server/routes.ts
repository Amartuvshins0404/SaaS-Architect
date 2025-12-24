import "./types";
import { SYSTEM_INSTRUCTION } from "./prompts";
import "dotenv/config";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { brandVoices } from "@shared/schema";
import { eq } from "drizzle-orm";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { insertPromptFeedbackSchema } from "@shared/schema";

// Routes registration
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  setupAuth(app);

  // Gemini Setup
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

  // Initial Prompt Seeding
  const activePrompt = await storage.getActiveSystemPrompt();
  if (!activePrompt) {
    console.log("No active system prompt found. Seeding with default.");
    await storage.createSystemPrompt(SYSTEM_INSTRUCTION);
  }

  const getAIModel = async () => {
    const prompt = await storage.getActiveSystemPrompt();
    return genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: prompt?.content || SYSTEM_INSTRUCTION
    });
  };

  // Middleware to ensure auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // --- Brand Voices ---

  app.get(api.brandVoices.list.path, requireAuth, async (req, res) => {
    const voices = await db.select().from(brandVoices).where(eq(brandVoices.userId, req.user!.id));
    res.json(voices);
  });

  app.post(api.brandVoices.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.brandVoices.create.input.parse(req.body);
      const voice = await storage.createBrandVoice(req.user!.id, input);
      res.status(201).json(voice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.brandVoices.update.path, requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getBrandVoice(id);
    if (!existing || existing.userId !== req.user!.id) {
      return res.status(404).json({ message: "Voice not found" });
    }
    const input = api.brandVoices.update.input.parse(req.body);
    const updated = await storage.updateBrandVoice(id, input);
    res.json(updated);
  });

  app.delete(api.brandVoices.delete.path, requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getBrandVoice(id);
    if (!existing || existing.userId !== req.user!.id) {
      return res.status(404).json({ message: "Voice not found" });
    }
    await storage.deleteBrandVoice(id);
    res.sendStatus(204);
  });

  // --- Rewrites / Gemini ---

  app.get(api.rewrites.list.path, requireAuth, async (req, res) => {
    const list = await storage.getRewrites(req.user!.id);
    res.json(list);
  });

  app.post(api.rewrites.create.path, requireAuth, async (req, res) => {
    try {
      const { brandVoiceId, originalText, mode = "enhance", platform = "twitter" } = api.rewrites.create.input.parse(req.body);

      const voice = await storage.getBrandVoice(brandVoiceId);
      if (!voice || voice.userId !== req.user!.id) {
        return res.status(404).json({ message: "Brand voice not found" });
      }

      // Call Gemini
      let prompt = "";
      const tone = voice.toneTags?.join(", ") || "standard";

      if (mode === "enhance") {
        prompt = `You are a social media expert. Rewrite the following text to match this brand voice.
Brand Guidelines: ${voice.guidelines}
Tone: ${tone}
Platform: ${platform} (Optimize for this platform's best practices).
${platform === "twitter" ? "- Ensure it's under 280 characters if possible, or threaded if longer.\n- Use engaging hooks.\n- Use minimal hashtags." : ""}

Original Text:
${originalText}

Output ONLY the rewritten text.`;
      } else {
        // Generate mode
        prompt = `You are a social media expert. Create a new post about the following topic/idea.
Topic: ${originalText}
Brand Guidelines: ${voice.guidelines}
Tone: ${tone}
Platform: ${platform} (Optimize for this platform's best practices).
${platform === "twitter" ? "- Create a viral quality tweet/thread.\n- Limit to 280 chars per tweet.\n- Focus on high engagement." : ""}

Output ONLY the generated post content.`;
      }

      let rewrittenText = "";

      if (!process.env.GOOGLE_API_KEY) {
        return res.status(400).json({ message: "GOOGLE_API_KEY not configured" });
      }

      try {
        const model = await getAIModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        rewrittenText = response.text();
      } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ message: "AI Generation failed" });
      }

      // Save to DB
      const rewrite = await storage.createRewrite(req.user!.id, {
        brandVoiceId,
        originalText,
        rewrittenText
      });

      res.status(201).json(rewrite);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      const { feedback, rewriteId, isPositive } = req.body;
      const userId = req.user!.id;

      // 1. Store Raw Feedback
      const rawFeedback = await storage.createPromptFeedback({
        userId,
        feedback,
        rewriteId: rewriteId ? Number(rewriteId) : undefined,
        isPositive: !!isPositive
      });

      const model = await getAIModel(); // Use current model for this admin task too

      // 2. Refine Feedback (AI Summary)
      let refinedContent = "";
      if (isPositive) {
        // Positive Logic: Analyze why it's good
        const reinforcementPrompt = `Analyze this positive user feedback about an AI writing assistant: "${feedback}". 
         Summarize the specific stylistic trait or rule that the user liked.
         Example: "User liked the concise tone. Instruction: Maintain a concise and direct tone."
         Output ONLY the instruction to preserve.`;

        const result = await model.generateContent(reinforcementPrompt);
        refinedContent = result.response.text();
      } else {
        // Negative Logic: Fix it
        const correctionPrompt = `Analyze this negative user feedback about an AI writing assistant: "${feedback}". 
         Summarize the core complaint into a single, clear corrective instruction.
         Example: "User complained about emojis. Instruction: Do not use emojis."
         Output ONLY the instruction.`;

        const result = await model.generateContent(correctionPrompt);
        refinedContent = result.response.text();
      }

      const refinedEntry = await storage.createRefinedFeedback({
        originalFeedbackId: rawFeedback.id,
        refinedContent,
        isIncorporated: true
      });

      // 3. Update System Prompt (Self-Improvement)
      const currentPromptEntry = await storage.getActiveSystemPrompt();
      const currentContent = currentPromptEntry?.content || SYSTEM_INSTRUCTION;
      const currentList = currentPromptEntry?.instructionsList || [];

      // We ask the AI to generate a JSON structure now to cleanly separate content from list
      const updatePrompt = `You are an expert AI system architect. 
      Your goal is to improve the System Instruction for an AI writer based on new feedback.
      
      mode: ${isPositive ? "REINFORCEMENT (Keep doing this)" : "CORRECTION (Stop/Start doing this)"}

      Current System Content:
      """
      ${currentContent}
      """

      Current Instructions List:
      ${JSON.stringify(currentList)}
      
      New Feedback Instruction:
      "${refinedContent}"
      
      Task: Rewrite the System Instruction to incorporate the new feedback.
      - If REINFORCEMENT: Ensure the "Current System Content" emphasizes this trait and add a supporting bullet point to the list if missing.
      - If CORRECTION: Modify "Current System Content" to fix the issue and add a specific corrective bullet point to the list.
      
      Output JSON ONLY:
      {
        "content": "The full, updated main system prompt text (long form)",
        "instructionsList": ["Array", "of", "specific", "rules", "including", "new", "one"]
      }`;

      // Force JSON output
      const jsonModel = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: { responseMimeType: "application/json" }
      });
      const updateResult = await jsonModel.generateContent(updatePrompt);
      const updateResponse = JSON.parse(updateResult.response.text());

      await storage.createSystemPrompt(updateResponse.content, updateResponse.instructionsList);

      const message = isPositive
        ? "Thanks! We've saved this preference to keep generating content you like."
        : "We apologize. We have updated our system permissions to avoid this in the future.";

      res.json({ message });

    } catch (err) {
      console.error("Feedback loop error:", err);
      res.status(500).json({ message: "Failed to process feedback" });
    }
  });

  app.post(api.ai.generateGuidelines.path, requireAuth, async (req, res) => {
    try {
      console.log("Guidelines generation request received:", req.body);
      const { currentText, toneKeywords } = api.ai.generateGuidelines.input.parse(req.body);

      if (!process.env.GOOGLE_API_KEY) {
        console.error("GOOGLE_API_KEY is missing");
        return res.status(400).json({ message: "GOOGLE_API_KEY not configured" });
      }

      console.log("Calling Gemini with keywords:", toneKeywords);

      const prompt = `You are an expert prompt engineer and social media strategist.
      Your task is to transform the following raw notes into clear, professional, and effective style guidelines for an LLM to generate high-quality X (Twitter) posts.
      
      Tone to emulate: ${toneKeywords.join(", ")}
      
      Raw Notes/Current Draft: 
      "${currentText}"
      
      Instructions:
      1. Analyze the raw notes and tone.
      2. Expansion: If the notes are sparse, infer the likely intent based on the tone.
      3. Format: Output a concise paragraph or bulleted list that tells an AI how to write.
      4. DO NOT output the tweet itself. Output INSTURCTIONS for writing the tweet.
      5. Output ONLY the guidelines text.`;

      const model = await getAIModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const guidelines = response.text();

      console.log("Gemini generation successful");
      res.json({ guidelines });
    } catch (error) {
      console.error("Gemini API Guidelines Error Details:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "AI Generation failed: " + (error as Error).message });
    }
  });

  return httpServer;
}
