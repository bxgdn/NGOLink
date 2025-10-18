import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create NGO profile
export const createNGO = mutation({
  args: {
    userId: v.id("users"),
    organizationName: v.string(),
    mission: v.string(),
    description: v.string(),
    logo: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ngoId = await ctx.db.insert("ngos", {
      userId: args.userId,
      organizationName: args.organizationName,
      mission: args.mission,
      description: args.description,
      logo: args.logo,
      coverImage: args.coverImage,
      website: args.website,
      isVerified: false,
      totalVolunteers: 0,
      totalHoursReceived: 0,
      createdAt: Date.now(),
    });

    return ngoId;
  },
});

// Update NGO profile
export const updateNGO = mutation({
  args: {
    ngoId: v.id("ngos"),
    organizationName: v.optional(v.string()),
    mission: v.optional(v.string()),
    vision: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    website: v.optional(v.string()),
    socialMedia: v.optional(v.object({
      facebook: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      linkedin: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { ngoId, ...updates } = args;
    await ctx.db.patch(ngoId, updates);
    return ngoId;
  },
});

// Get NGO by user ID
export const getNGOByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ngos")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Get NGO by ID
export const getNGO = query({
  args: { ngoId: v.id("ngos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ngoId);
  },
});

// Get all verified NGOs
export const getVerifiedNGOs = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("ngos")
      .withIndex("by_verified", (q) => q.eq("isVerified", true))
      .collect();
  },
});

// Get NGO stats
export const getNGOStats = query({
  args: { ngoId: v.id("ngos") },
  handler: async (ctx, args) => {
    const ngo = await ctx.db.get(args.ngoId);
    if (!ngo) return null;

    // Count active matches
    const activeMatches = await ctx.db
      .query("matches")
      .withIndex("by_ngo", (q) => q.eq("ngoId", args.ngoId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Count completed tasks
    const completedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_ngo", (q) => q.eq("ngoId", args.ngoId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Count opportunities
    const opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_ngo", (q) => q.eq("ngoId", args.ngoId))
      .collect();

    return {
      activeVolunteers: activeMatches.length,
      totalOpportunities: opportunities.length,
      completedTasks: completedTasks.length,
      totalHours: ngo.totalHoursReceived,
    };
  },
});

// Update NGO stats
export const updateNGOStats = mutation({
  args: {
    ngoId: v.id("ngos"),
    hoursToAdd: v.optional(v.number()),
    volunteersToAdd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ngo = await ctx.db.get(args.ngoId);
    if (!ngo) throw new Error("NGO not found");

    await ctx.db.patch(args.ngoId, {
      totalHoursReceived: ngo.totalHoursReceived + (args.hoursToAdd || 0),
      totalVolunteers: ngo.totalVolunteers + (args.volunteersToAdd || 0),
    });
  },
});

