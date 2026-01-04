// convex/trainerAccess.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { randomBytes } from "crypto";

/**
 * Generate a secure, unguessable access token for a trainer-avatar relationship
 * This token allows read-only access to view the avatar they contributed to
 */
export const generateAccessToken = mutation({
  args: {
    avatarId: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate a cryptographically secure random token (32 bytes = 64 hex chars)
    const accessToken = randomBytes(32).toString("hex");
    
    // Check if a token already exists for this avatar
    const existing = await ctx.db
      .query("trainerAccess")
      .withIndex("by_avatarId", (q) => q.eq("avatarId", args.avatarId))
      .first();
    
    if (existing) {
      // Return existing token instead of creating duplicate
      return existing.accessToken;
    }
    
    // Store the token in database
    await ctx.db.insert("trainerAccess", {
      avatarId: args.avatarId,
      accessToken,
      createdAt: Date.now(),
    });
    
    return accessToken;
  },
});

/**
 * Validate a trainer access token and return avatar information if valid
 * Returns null if token is invalid or doesn't exist
 */
export const validateToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up the token
    const tokenRecord = await ctx.db
      .query("trainerAccess")
      .withIndex("by_token", (q) => q.eq("accessToken", args.token))
      .first();
    
    if (!tokenRecord) {
      return null; // Invalid token
    }
    
    // Get the avatar details
    const avatar = await ctx.db
      .query("avatarMasterPrompts")
      .withIndex("by_avatarId", (q) => q.eq("avatarId", tokenRecord.avatarId))
      .first();
    
    if (!avatar) {
      return null; // Avatar not found
    }
    
    // Return read-only avatar summary
    return {
      avatarId: avatar.avatarId,
      avatarName: avatar.avatarName,
      avatarImageUrl: avatar.avatarImageUrl,
      masterPrompt: avatar.masterPrompt,
      createdAt: avatar.createdAt,
    };
  },
});

/**
 * Get training memories contributed by the trainer for this avatar
 * Only returns memories for the avatar associated with the token
 */
export const getTrainerMemories = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // First validate the token
    const tokenRecord = await ctx.db
      .query("trainerAccess")
      .withIndex("by_token", (q) => q.eq("accessToken", args.token))
      .first();
    
    if (!tokenRecord) {
      return null; // Invalid token
    }
    
    // Get all training memories for this avatar
    const memories = await ctx.db
      .query("avatarTrainingMemories")
      .withIndex("by_avatarId", (q) => q.eq("avatarId", tokenRecord.avatarId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Return only the text content and creation date (no embeddings or sensitive data)
    return memories.map((memory) => ({
      text: memory.text,
      createdAt: memory.createdAt,
      source: memory.source,
    }));
  },
});

/**
 * Get memory count for the avatar (for display purposes)
 */
export const getMemoryCount = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("trainerAccess")
      .withIndex("by_token", (q) => q.eq("accessToken", args.token))
      .first();
    
    if (!tokenRecord) {
      return 0;
    }
    
    const memories = await ctx.db
      .query("avatarTrainingMemories")
      .withIndex("by_avatarId", (q) => q.eq("avatarId", tokenRecord.avatarId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return memories.length;
  },
});
