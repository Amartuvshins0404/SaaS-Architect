import { db, pool } from "./db";
import {
  users, brandVoices, rewrites, systemPrompts, promptFeedback, refinedFeedback,
  type User, type InsertUser,
  type BrandVoice, type InsertBrandVoice,
  type Rewrite, type InsertRewrite,
  type SystemPrompt, type InsertPromptFeedback, type InsertRefinedFeedback,
  type PromptFeedback, type RefinedFeedback
} from "@shared/schema";
import { eq, desc, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;

  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Brand Voices
  getBrandVoices(userId: number): Promise<BrandVoice[]>;
  getBrandVoice(id: number): Promise<BrandVoice | undefined>;
  createBrandVoice(userId: number, voice: InsertBrandVoice): Promise<BrandVoice>;
  updateBrandVoice(id: number, voice: Partial<InsertBrandVoice>): Promise<BrandVoice>;
  deleteBrandVoice(id: number): Promise<void>;

  // Rewrites
  getRewrites(userId: number): Promise<Rewrite[]>;
  createRewrite(userId: number, rewrite: InsertRewrite): Promise<Rewrite>;

  // System Prompts & Feedback
  getActiveSystemPrompt(): Promise<SystemPrompt | undefined>;
  createSystemPrompt(content: string, instructionsList?: string[]): Promise<SystemPrompt>;
  createPromptFeedback(feedback: InsertPromptFeedback): Promise<PromptFeedback>;
  createRefinedFeedback(feedback: InsertRefinedFeedback): Promise<RefinedFeedback>;
  getPendingRefinedFeedback(): Promise<RefinedFeedback[]>;
  markRefinedFeedbackAsImplemented(ids: number[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Brand Voices
  async getBrandVoices(userId: number): Promise<BrandVoice[]> {
    return await db.select().from(brandVoices).where(eq(brandVoices.userId, userId));
  }

  async getBrandVoice(id: number): Promise<BrandVoice | undefined> {
    const [voice] = await db.select().from(brandVoices).where(eq(brandVoices.id, id));
    return voice;
  }

  async createBrandVoice(userId: number, voice: InsertBrandVoice): Promise<BrandVoice> {
    const [newVoice] = await db.insert(brandVoices).values({ ...voice, userId }).returning();
    return newVoice;
  }

  async updateBrandVoice(id: number, voice: Partial<InsertBrandVoice>): Promise<BrandVoice> {
    const [updated] = await db.update(brandVoices).set(voice).where(eq(brandVoices.id, id)).returning();
    return updated;
  }

  async deleteBrandVoice(id: number): Promise<void> {
    await db.delete(brandVoices).where(eq(brandVoices.id, id));
  }

  // Rewrites
  async getRewrites(userId: number): Promise<Rewrite[]> {
    return await db.select().from(rewrites).where(eq(rewrites.userId, userId)).orderBy(desc(rewrites.createdAt));
  }

  async createRewrite(userId: number, rewrite: InsertRewrite): Promise<Rewrite> {
    const [newRewrite] = await db.insert(rewrites).values({ ...rewrite, userId }).returning();
    return newRewrite;
  }

  // System Prompts & Feedback
  async getActiveSystemPrompt(): Promise<SystemPrompt | undefined> {
    const [prompt] = await db
      .select()
      .from(systemPrompts)
      .where(eq(systemPrompts.isActive, true))
      .limit(1);
    return prompt;
  }

  async createSystemPrompt(content: string, instructionsList?: string[]): Promise<SystemPrompt> {
    // Determine the instructions list. If not provided, try to extract it or default to empty.
    // Assuming simple content is passed, instructionsList might be null.
    // But the new logic will likely pass it.

    await db.update(systemPrompts).set({ isActive: false });
    const [prompt] = await db
      .insert(systemPrompts)
      .values({ content, instructionsList: instructionsList || [], isActive: true })
      .returning();
    return prompt;
  }

  async createPromptFeedback(feedback: InsertPromptFeedback): Promise<PromptFeedback> {
    const [entry] = await db
      .insert(promptFeedback)
      .values(feedback)
      .returning();
    return entry;
  }

  async createRefinedFeedback(feedback: InsertRefinedFeedback): Promise<RefinedFeedback> {
    const [entry] = await db.insert(refinedFeedback).values(feedback).returning();
    return entry;
  }

  async getPendingRefinedFeedback(): Promise<RefinedFeedback[]> {
    return db
      .select()
      .from(refinedFeedback)
      .where(eq(refinedFeedback.status, "pending"));
  }

  async markRefinedFeedbackAsImplemented(ids: number[]) {
    if (ids.length === 0) return;
    await db
      .update(refinedFeedback)
      .set({ status: "implemented", isIncorporated: true })
      .where(inArray(refinedFeedback.id, ids));
  }
}

export const storage = new DatabaseStorage();
