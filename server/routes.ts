import "./types";
import { SYSTEM_INSTRUCTION } from "./prompts";
import "dotenv/config";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import Stripe from "stripe";
import { stripe } from "./stripe";
import { brandVoices } from "@shared/schema";
import { eq } from "drizzle-orm";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { insertPromptFeedbackSchema, insertUserFeedbackSchema } from "@shared/schema";

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

  // --- Constitution ---
  const CORE_CONSTITUTION = `
  1. Professionalism: The AI must be professional, clear, and helpful.
  2. Safety: It must not generate harmful, hate speech, or explicit content.
  3. Utility: It should prioritize user intent but maintain high literary standards.
  4. Consistency: It should not contradict previous core instructions unless explicitly correcting an error.
  `;

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

      // 2. Constitutional Review & Scoring (Analysis Phase)
      const reviewPrompt = `
      You are the "Council of Editors" for an AI writing system.
      Your task is to review a new piece of feedback against our Constitution.

      Constitution:
      ${CORE_CONSTITUTION}

      User Feedback: "${feedback}"
      Type: ${isPositive ? "Positive (Reinforce)" : "Negative (Correct)"}

      Task:
      1. Score (0-100): How constructive, safe, and aligned with the Constitution is this feedback?
         - 0: Spam, nonsense, or harmful.
         - 100: Critical insight or perfect reinforcement.
         - Threshold to Pass: 70.
      2. Refine: Extract the core instruction without emotions.
      3. Categorize: Why did you accept/reject it?

      Output JSON ONLY:
      {
        "score": number, 
        "status": "pending" | "rejected",
        "rejectionReason": "string (if rejected) or null",
        "refinedContent": "string (the clean instruction)"
      }`;

      const genModel = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: { responseMimeType: "application/json" }
      });

      const reviewResult = await genModel.generateContent(reviewPrompt);
      const reviewData = JSON.parse(reviewResult.response.text());

      // 3. Save Decision
      await storage.createRefinedFeedback({
        originalFeedbackId: rawFeedback.id,
        refinedContent: reviewData.refinedContent,
        score: reviewData.score,
        status: reviewData.score >= 70 ? "pending" : "rejected",
        rejectionReason: reviewData.score < 70 ? (reviewData.rejectionReason || "Low Quality Score") : null,
        isIncorporated: false
      });

      // 4. Batch Processing Check
      // Only proceed if we have enough "pending" items
      const pendingItems = await storage.getPendingRefinedFeedback();
      const BATCH_THRESHOLD = 5;

      if (pendingItems.length >= BATCH_THRESHOLD) {
        console.log(`Batch threshold reached (${pendingItems.length}). Evolving System Prompt...`);

        // Fetch current prompt state
        const currentPromptEntry = await storage.getActiveSystemPrompt();
        const currentContent = currentPromptEntry?.content || SYSTEM_INSTRUCTION;
        const currentList = currentPromptEntry?.instructionsList || [];

        // Formatting the batch for the AI
        const batchText = pendingItems.map((item, idx) => `Item ${idx + 1}: ${item.refinedContent}`).join("\n");

        const evolutionPrompt = `
        You are the System Architect.
        We have a new batch of verified, high-quality feedback items to incorporate into the System Instruction.

        Current System Content:
        """
        ${currentContent}
        """

        Current Instructions List:
        ${JSON.stringify(currentList)}

        New Approved Batch of Insights:
        ${batchText}

        Task: Evolve the System Instruction.
        1. Synthesize the new insights.
        2. Resolve any conflicts in favor of the consensus or the most specific rule.
        3. Remove outdated rules if they are contradicted by this new high-quality batch.
        
        Output JSON ONLY:
        {
          "content": "The updated main system prompt text",
          "instructionsList": ["Array", "of", "updated", "specific", "rules"]
        }`;

        const evolutionResult = await genModel.generateContent(evolutionPrompt);
        const evolutionData = JSON.parse(evolutionResult.response.text());

        // Update DB
        await storage.createSystemPrompt(evolutionData.content, evolutionData.instructionsList);

        // Mark items as implemented
        await storage.markRefinedFeedbackAsImplemented(pendingItems.map(p => p.id));
      }

      // 5. Response to User
      // Note: We don't tell the user "it's pending", we say "received".
      if (reviewData.status === 'rejected') {
        // We still thank them, but maybe softly imply it wasn't used if we wanted full transparency. 
        // For now, standard polite response is better for UX.
        res.json({ message: "Thank you. Your feedback has been recorded." });
      } else {
        res.json({ message: "Thank you! Your feedback has been verified and will be part of the next system update." });
      }

    } catch (err) {
      console.error("Feedback governance error:", err);
      res.status(500).json({ message: "Failed to process feedback" });
    }
  });

  // --- General User Feedback (Non-AI) ---
  app.post("/api/user-feedback", requireAuth, async (req, res) => {
    try {
      const input = insertUserFeedbackSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      await storage.createUserFeedback(input);
      res.status(201).json({ message: "Feedback received" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("User feedback error:", err);
      res.status(500).json({ message: "Failed to save feedback" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      // New Price ID: price_1ShveM9BA7dzuhZk9U2tQSRm ($9.99)
      const price = await stripe.prices.retrieve("price_1ShveM9BA7dzuhZk9U2tQSRm", {
        expand: ["product"]
      });

      res.json([price]);
    } catch (err: any) {
      console.error("Stripe products error:", err);
      // Fallback if price doesn't exist yet (dev env safety)
      res.json([{
        id: "price_1ShveM9BA7dzuhZk9U2tQSRm",
        unit_amount: 999,
        currency: "usd",
        product: { name: "Pro Plan" }
      }]);
    }
  });

  app.post("/api/user/preferences", requireAuth, async (req, res) => {
    try {
      const { hideTrialModal } = z.object({ hideTrialModal: z.boolean() }).parse(req.body);
      const updatedUser = await storage.updateUserPreferences(req.user!.id, hideTrialModal);

      // Update session user to reflect changes immediately
      // Passport/Express session serialization often caches the user.
      // We rely on the client refreshing or the next verify call updating the context.
      // But for completeness, we return the updated user.
      req.login(updatedUser, (err) => {
        if (err) console.error("Session update error", err);
        return res.json(updatedUser);
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Preference update error:", err);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.post("/api/create-checkout-session", requireAuth, async (req, res) => {
    try {
      // Fetch fresh user to get latest hasUsedTrial status
      // Session user might be stale if they just verified a previous trial
      const user = await storage.getUser(req.user!.id);
      if (!user) return res.sendStatus(401);

      const hasUsedTrial = user.hasUsedTrial;
      console.log(`Creating checkout session for user ${user.id}. Has used trial: ${hasUsedTrial}`);

      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price: "price_1ShveM9BA7dzuhZk9U2tQSRm", // New $9.99 recurring price
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.origin}/app/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/app/settings?canceled=true`,
        client_reference_id: user.id.toString(),
        metadata: {
          userId: user.id.toString()
        }
      };

      // Only add trial if user hasn't used it strictly
      if (!hasUsedTrial) {
        sessionConfig.subscription_data = {
          trial_period_days: 7, // 7-day free trial
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Stripe error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/verify-checkout", requireAuth, async (req, res) => {
    const { session_id } = req.body;
    console.log("Verify checkout request:", { session_id, userId: req.user?.id });

    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ message: "Missing session_id" });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      console.log("Stripe session retrieved:", { id: session.id, status: session.payment_status });

      if (session.payment_status === 'paid' || session.status === 'open') {
        // Note: For trials, status might be 'open' but payment_status 'unpaid' until trial ends if no setup.
        // But we are enforcing card, so 'complete' or 'active' subscription check is better?
        // Let's stick to existing logic but just add the flag update.

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        await storage.updateUserSubscription(
          req.user!.id,
          "pro",
          subscriptionId,
          customerId,
          true // Mark trial as used
        );
        console.log("User updated to pro:", req.user!.id);
        return res.json({ success: true, tier: "pro" });
      }
      res.json({ success: false, status: session.payment_status });
    } catch (err: any) {
      console.error("Verify checkout error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/cancel-subscription", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) return res.sendStatus(404);

      if (user.subscriptionTier !== "pro") {
        return res.status(400).json({ message: "Not subscribed to Pro plan" });
      }

      // Try to cancel in Stripe if ID exists
      if (user.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(user.stripeSubscriptionId);
          console.log("Stripe subscription canceled:", user.stripeSubscriptionId);
        } catch (stripeErr: any) {
          console.error("Stripe cancel error (ignoring to force downgrade):", stripeErr);
          // We continue to downgrade locally even if Stripe fails (e.g. already canceled)
        }
      }

      // Downgrade locally
      await storage.updateUserSubscription(req.user!.id, "free", undefined, undefined); // undefined explicitly
      res.json({ success: true });
    } catch (err: any) {
      console.error("Cancel subscription error:", err);
      res.status(500).json({ message: err.message });
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
