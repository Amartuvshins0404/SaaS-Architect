import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: text("subscription_tier").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brandVoices = pgTable("brand_voices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users
  name: text("name").notNull(),
  guidelines: text("guidelines").notNull(),
  toneTags: text("tone_tags").array(), // Array of strings
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BrandVoice = typeof brandVoices.$inferSelect;
export type InsertBrandVoice = z.infer<typeof insertBrandVoiceSchema>;

export type Rewrite = typeof rewrites.$inferSelect;
export type InsertRewrite = z.infer<typeof insertRewriteSchema>;

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
