import { db, pool } from "./db";
import {
  users, brandVoices, rewrites,
  type User, type InsertUser,
  type BrandVoice, type InsertBrandVoice,
  type Rewrite, type InsertRewrite
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();
