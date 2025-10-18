import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create opportunity
export const createOpportunity = mutation({
  args: {
    ngoId: v.id("ngos"),
    title: v.string(),
    description: v.string(),
    requiredSkills: v.array(v.string()),
    timeCommitment: v.string(),
    location: v.string(),
    locationType: v.union(v.literal("remote"), v.literal("in-person"), v.literal("hybrid")),
    cause: v.array(v.string()),
    coverImage: v.optional(v.string()),
    duration: v.optional(v.string()),
    spotsAvailable: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const opportunityId = await ctx.db.insert("opportunities", {
      ngoId: args.ngoId,
      title: args.title,
      description: args.description,
      requiredSkills: args.requiredSkills,
      timeCommitment: args.timeCommitment,
      location: args.location,
      locationType: args.locationType,
      cause: args.cause,
      coverImage: args.coverImage,
      duration: args.duration,
      spotsAvailable: args.spotsAvailable,
      isActive: true,
      createdAt: Date.now(),
    });

    return opportunityId;
  },
});

// Get opportunities for swipe deck
export const getOpportunitiesForUser = query({
  args: { 
    userId: v.id("users"),
    causeFilter: v.optional(v.array(v.string())),
    skillFilter: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Get all active opportunities
    const opportunities = await ctx.db
      .query("opportunities")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Get user's swipes to filter out already swiped
    const swipes = await ctx.db
      .query("swipes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const swipedOpportunityIds = new Set(swipes.map(s => s.opportunityId));

    // Filter out already swiped opportunities
    let filteredOps = opportunities.filter(op => !swipedOpportunityIds.has(op._id));

    // Apply filters
    if (args.causeFilter && args.causeFilter.length > 0) {
      filteredOps = filteredOps.filter(op => 
        op.cause.some(c => args.causeFilter!.includes(c))
      );
    }

    if (args.skillFilter && args.skillFilter.length > 0) {
      filteredOps = filteredOps.filter(op =>
        op.requiredSkills.some(s => args.skillFilter!.includes(s))
      );
    }

    // Get NGO details for each opportunity
    const opportunitiesWithNGO = await Promise.all(
      filteredOps.map(async (op) => {
        const ngo = await ctx.db.get(op.ngoId);
        return {
          ...op,
          ngo: ngo ? {
            name: ngo.organizationName,
            logo: ngo.logo,
            coverImage: ngo.coverImage,
          } : null,
        };
      })
    );

    return opportunitiesWithNGO;
  },
});

// Get opportunity by ID
export const getOpportunity = query({
  args: { opportunityId: v.id("opportunities") },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) return null;

    const ngo = await ctx.db.get(opportunity.ngoId);
    return {
      ...opportunity,
      ngo: ngo ? {
        name: ngo.organizationName,
        logo: ngo.logo,
        mission: ngo.mission,
      } : null,
    };
  },
});

// Get opportunities by NGO
export const getOpportunitiesByNGO = query({
  args: { ngoId: v.id("ngos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("opportunities")
      .withIndex("by_ngo", (q) => q.eq("ngoId", args.ngoId))
      .collect();
  },
});

// Update opportunity
export const updateOpportunity = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requiredSkills: v.optional(v.array(v.string())),
    timeCommitment: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { opportunityId, ...updates } = args;
    await ctx.db.patch(opportunityId, updates);
    return opportunityId;
  },
});

// Delete opportunity
export const deleteOpportunity = mutation({
  args: { opportunityId: v.id("opportunities") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.opportunityId);
  },
});

