import { mutation, query } from "../convex/_generated/server";
import { v } from "convex/values";

export const createUserModel = mutation({
  args: {
    userId: v.id("users"),
    masterPrompt: v.string(),
    trainerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Create an avatar record for this user
    return await ctx.db.insert("avatars", {
      ownerId: args.userId,
      avatarName: "default",
      masterPrompt: args.masterPrompt,
      trainerId: args.trainerId,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
export const addMasterPrompt = mutation({
  args: {
    userId: v.id("users"),
    masterPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the user already has at least one avatar; update its masterPrompt
    const existingAvatar = await ctx.db
      .query("avatars")
      .filter((q) => q.eq(q.field("ownerId"), args.userId))
      .first();

    if (existingAvatar) {
      await ctx.db.patch(existingAvatar._id, {
        masterPrompt: args.masterPrompt,
        updatedAt: Date.now(),
      });
      return existingAvatar._id;
    } else {
      // Create a new avatar for the owner
      return await ctx.db.insert("avatars", {
        ownerId: args.userId,
        avatarName: "default",
        masterPrompt: args.masterPrompt,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const getMasterPrompt = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("avatars")
      .filter((q) => q.eq(q.field("ownerId"), args.userId))
      .first();
  },
});
