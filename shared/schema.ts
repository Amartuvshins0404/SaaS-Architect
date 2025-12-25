import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: text("subscription_tier").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  hideTrialModal: boolean("hide_trial_modal").default(false),
  hasUsedTrial: boolean("has_used_trial").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brandVoices = pgTable("brand_voices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users
  name: text("name").notNull(),
  guidelines: text("guidelines").notNull(),
  toneTags: text("tone_tags").array(), // Array of strings
  aiLearnedGuidelines: text("ai_learned_guidelines").array(), // Array of strings - AI learned rules from feedback
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewrites = pgTable("rewrites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users
  brandVoiceId: integer("brand_voice_id"), // Foreign key to brand_voices (optional)
  originalText: text("original_text").notNull(),
  rewrittenText: text("rewritten_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemPrompts = pgTable("system_prompts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  instructionsList: text("instructions_list").array(), // Specific bullet points
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const promptFeedback = pgTable("prompt_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User who gave feedback
  rewriteId: integer("rewrite_id"), // Optional: linked to specific generation
  feedback: text("feedback").notNull(),
  isPositive: boolean("is_positive").default(false), // Sentiment
  createdAt: timestamp("created_at").defaultNow(),
});

export const refinedFeedback = pgTable("refined_feedback", {
  id: serial("id").primaryKey(),
  originalFeedbackId: integer("original_feedback_id").notNull(), // Link to raw feedback
  refinedContent: text("refined_content").notNull(),
  score: integer("score").default(0), // 0-100 Quality Score
  status: text("status").default("pending"), // 'pending', 'rejected', 'implemented'
  rejectionReason: text("rejection_reason"),
  isIncorporated: boolean("is_incorporated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  category: text("category").default("general").notNull(), // 'bug', 'feature', 'general'
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBrandVoiceSchema = createInsertSchema(brandVoices).omit({
  id: true,
  userId: true,
  createdAt: true
});

export const insertRewriteSchema = createInsertSchema(rewrites).omit({
  id: true,
  userId: true,
  createdAt: true
});

export const insertSystemPromptSchema = createInsertSchema(systemPrompts).omit({
  id: true,
  createdAt: true
});

export const insertPromptFeedbackSchema = createInsertSchema(promptFeedback).omit({
  id: true,
  createdAt: true
});

export const insertRefinedFeedbackSchema = createInsertSchema(refinedFeedback).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BrandVoice = typeof brandVoices.$inferSelect;
export type InsertBrandVoice = z.infer<typeof insertBrandVoiceSchema>;

export type Rewrite = typeof rewrites.$inferSelect;
export type InsertRewrite = z.infer<typeof insertRewriteSchema>;

export type SystemPrompt = typeof systemPrompts.$inferSelect;
export type InsertSystemPrompt = z.infer<typeof insertSystemPromptSchema>;

export type PromptFeedback = typeof promptFeedback.$inferSelect;
export type InsertPromptFeedback = z.infer<typeof insertPromptFeedbackSchema>;

export type RefinedFeedback = typeof refinedFeedback.$inferSelect;
export type InsertRefinedFeedback = z.infer<typeof insertRefinedFeedbackSchema>;

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true
});

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;

// API Request Types
export type CreateBrandVoiceRequest = InsertBrandVoice;
export type UpdateBrandVoiceRequest = Partial<InsertBrandVoice>;
export type CreateRewriteRequest = Omit<InsertRewrite, "rewrittenText"> & {
  // Frontend sends this to trigger generation
  brandVoiceId: number;
  originalText: string;
  mode?: "enhance" | "generate";
  platform?: "twitter" | "linkedin" | "general";
};

export type GenerateGuidelinesRequest = {
  currentText: string;
  toneKeywords: string[];
};

export type GenerateGuidelinesResponse = {
  guidelines: string;
};
