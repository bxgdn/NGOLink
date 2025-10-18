import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create or get user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    userType: v.union(v.literal("volunteer"), v.literal("ngo")),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      userType: args.userType,
      technicalSkills: [],
      softSkills: [],
      interests: [],
      totalHoursVolunteered: 0,
      tasksCompleted: 0,
      achievements: [],
      badges: [],
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Update volunteer profile
export const updateVolunteerProfile = mutation({
  args: {
    userId: v.id("users"),
    bio: v.optional(v.string()),
    personalStatement: v.optional(v.string()),
    portfolioLink: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
    technicalSkills: v.optional(v.array(v.string())),
    softSkills: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
    hoursPerWeek: v.optional(v.number()),
    availableDays: v.optional(v.array(v.string())),
    preferredLocation: v.optional(v.union(v.literal("remote"), v.literal("in-person"), v.literal("hybrid"))),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
    return userId;
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get volunteer leaderboard
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const volunteers = await ctx.db
      .query("users")
      .withIndex("by_userType", (q) => q.eq("userType", "volunteer"))
      .collect();

    // Sort by tasks completed
    const sorted = volunteers
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
      .slice(0, limit);

    return sorted.map((v, index) => ({
      rank: index + 1,
      name: v.name,
      profilePicture: v.profilePicture,
      tasksCompleted: v.tasksCompleted,
      totalHours: v.totalHoursVolunteered,
    }));
  },
});

// Update user stats
export const updateUserStats = mutation({
  args: {
    userId: v.id("users"),
    hoursToAdd: v.optional(v.number()),
    tasksToAdd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      totalHoursVolunteered: user.totalHoursVolunteered + (args.hoursToAdd || 0),
      tasksCompleted: user.tasksCompleted + (args.tasksToAdd || 0),
    });
  },
});

