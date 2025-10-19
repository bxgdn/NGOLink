import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Create achievement templates (admin function)
export const createAchievement = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("medal"), v.literal("badge")),
    tier: v.optional(v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold"))),
    icon: v.string(),
    category: v.optional(v.string()),
    criteriaType: v.string(),
    criteriaValue: v.number(),
    criteriaSkill: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("achievements", args);
  },
});

// Get all achievements
export const getAllAchievements = query({
  handler: async (ctx) => {
    return await ctx.db.query("achievements").collect();
  },
});

// Get user's earned achievements
export const getUserAchievements = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      userAchievements.map(async (ua) => {
        const achievement = await ctx.db.get(ua.achievementId);
        return {
          ...ua,
          achievement,
        };
      })
    );
  },
});

// Check and award achievements (can be called internally or externally)
export const checkAndAwardAchievements = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const allAchievements = await ctx.db.query("achievements").collect();
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
    const newlyEarned = [];

    for (const achievement of allAchievements) {
      // Skip if already earned
      if (earnedAchievementIds.has(achievement._id)) continue;

      let shouldAward = false;

      // Check criteria
      switch (achievement.criteriaType) {
        case "tasks_completed":
          shouldAward = user.tasksCompleted >= achievement.criteriaValue;
          break;
        case "hours_volunteered":
          shouldAward = user.totalHoursVolunteered >= achievement.criteriaValue;
          break;
        case "skill_tasks":
          // Check tasks in specific skill category
          if (achievement.criteriaSkill) {
            const skillTasks = await ctx.db
              .query("tasks")
              .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.userId))
              .filter((q) => 
                q.and(
                  q.eq(q.field("status"), "completed"),
                  q.eq(q.field("category"), achievement.criteriaSkill)
                )
              )
              .collect();
            shouldAward = skillTasks.length >= achievement.criteriaValue;
          }
          break;
      }

      if (shouldAward) {
        const userAchievementId = await ctx.db.insert("userAchievements", {
          userId: args.userId,
          achievementId: achievement._id,
          earnedAt: Date.now(),
        });

        newlyEarned.push(achievement);

        // Create notification
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "achievement_unlocked",
          title: "Achievement Unlocked!",
          message: `You've earned: ${achievement.name}`,
          isRead: false,
          relatedId: userAchievementId,
          createdAt: Date.now(),
        });
      }
    }

    return newlyEarned;
  },
});

// Award custom medal from NGO
export const awardCustomMedal = mutation({
  args: {
    userId: v.id("users"),
    ngoId: v.id("ngos"),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    // Create a custom achievement entry
    const achievementId = await ctx.db.insert("achievements", {
      name: args.name,
      description: args.description,
      type: "medal",
      tier: "gold", // NGO custom medals are always gold tier
      icon: args.icon,
      category: "NGO Special Award",
      criteriaType: "custom",
      criteriaValue: 0,
    });

    // Award it to the user immediately
    const userAchievementId = await ctx.db.insert("userAchievements", {
      userId: args.userId,
      achievementId,
      earnedAt: Date.now(),
    });

    // Create notification
    const ngo = await ctx.db.get(args.ngoId);
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "achievement_unlocked",
      title: "Special Award Received!",
      message: `${ngo?.organizationName} has awarded you: ${args.name}`,
      isRead: false,
      relatedId: userAchievementId,
      createdAt: Date.now(),
    });

    return userAchievementId;
  },
});

// Initialize default achievements
export const initializeDefaultAchievements = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("achievements").first();
    if (existing) return; // Already initialized

    const defaultAchievements = [
      // Medals
      {
        name: "First Mission Complete",
        description: "Complete your first volunteer task",
        type: "medal" as const,
        tier: "bronze" as const,
        icon: "🥉",
        criteriaType: "tasks_completed",
        criteriaValue: 1,
      },
      {
        name: "Dedicated Volunteer",
        description: "Complete 10 volunteer tasks",
        type: "medal" as const,
        tier: "silver" as const,
        icon: "🥈",
        criteriaType: "tasks_completed",
        criteriaValue: 10,
      },
      {
        name: "Community Champion",
        description: "Complete 50 volunteer tasks",
        type: "medal" as const,
        tier: "gold" as const,
        icon: "🥇",
        criteriaType: "tasks_completed",
        criteriaValue: 50,
      },
      {
        name: "Time Giver",
        description: "Volunteer for 10 hours",
        type: "medal" as const,
        tier: "bronze" as const,
        icon: "⏰",
        criteriaType: "hours_volunteered",
        criteriaValue: 10,
      },
      {
        name: "Century Volunteer",
        description: "Volunteer for 100 hours",
        type: "medal" as const,
        tier: "gold" as const,
        icon: "💯",
        criteriaType: "hours_volunteered",
        criteriaValue: 100,
      },
      // Skill Badges
      {
        name: "Graphic Design Guru",
        description: "Complete 5 graphic design tasks",
        type: "badge" as const,
        icon: "🎨",
        category: "Graphic Design",
        criteriaType: "skill_tasks",
        criteriaValue: 5,
        criteriaSkill: "Graphic Design",
      },
      {
        name: "Social Media Whiz",
        description: "Complete 5 social media tasks",
        type: "badge" as const,
        icon: "📱",
        category: "Social Media",
        criteriaType: "skill_tasks",
        criteriaValue: 5,
        criteriaSkill: "Social Media",
      },
      {
        name: "Content Creator",
        description: "Complete 5 content writing tasks",
        type: "badge" as const,
        icon: "✍️",
        category: "Content Writing",
        criteriaType: "skill_tasks",
        criteriaValue: 5,
        criteriaSkill: "Content Writing",
      },
    ];

    for (const achievement of defaultAchievements) {
      await ctx.db.insert("achievements", achievement);
    }
  },
});

