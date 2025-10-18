import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users (Volunteers)
  users: defineTable({
    email: v.string(),
    name: v.string(),
    userType: v.union(v.literal("volunteer"), v.literal("ngo"), v.literal("admin")),
    profilePicture: v.optional(v.string()),
    bio: v.optional(v.string()),
    personalStatement: v.optional(v.string()),
    portfolioLink: v.optional(v.string()),
    
    // Skills and interests
    technicalSkills: v.array(v.string()),
    softSkills: v.array(v.string()),
    interests: v.array(v.string()),
    customSkills: v.optional(v.array(v.string())),
    
    // Availability
    hoursPerWeek: v.optional(v.number()),
    availableDays: v.optional(v.array(v.string())),
    preferredLocation: v.optional(v.union(v.literal("remote"), v.literal("in-person"), v.literal("hybrid"))),
    
    // Gamification stats
    totalHoursVolunteered: v.number(),
    tasksCompleted: v.number(),
    achievements: v.array(v.string()),
    badges: v.array(v.string()),
    
    createdAt: v.number(),
  })
  .index("by_email", ["email"])
  .index("by_userType", ["userType"]),

  // NGOs
  ngos: defineTable({
    userId: v.id("users"), // Reference to user account
    organizationName: v.string(),
    logo: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    mission: v.string(),
    vision: v.optional(v.string()),
    description: v.string(),
    
    // Verification
    isVerified: v.boolean(),
    verificationDocuments: v.optional(v.array(v.string())),
    
    // Contact & social
    website: v.optional(v.string()),
    socialMedia: v.optional(v.object({
      facebook: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      linkedin: v.optional(v.string()),
    })),
    
    // Stats
    totalVolunteers: v.number(),
    totalHoursReceived: v.number(),
    
    createdAt: v.number(),
  })
  .index("by_userId", ["userId"])
  .index("by_verified", ["isVerified"]),

  // Volunteer Opportunities
  opportunities: defineTable({
    ngoId: v.id("ngos"),
    title: v.string(),
    description: v.string(),
    coverImage: v.optional(v.string()),
    
    // Requirements
    requiredSkills: v.array(v.string()),
    timeCommitment: v.string(), // e.g., "5 hours/week", "One-time"
    duration: v.optional(v.string()),
    location: v.string(), // "Remote" or specific location
    locationType: v.union(v.literal("remote"), v.literal("in-person"), v.literal("hybrid")),
    
    // Categorization
    cause: v.array(v.string()), // e.g., "Environment", "Education"
    
    // Status
    isActive: v.boolean(),
    spotsAvailable: v.optional(v.number()),
    
    createdAt: v.number(),
  })
  .index("by_ngo", ["ngoId"])
  .index("by_active", ["isActive"]),

  // Swipes/Interest
  swipes: defineTable({
    userId: v.id("users"), // Volunteer
    opportunityId: v.id("opportunities"),
    ngoId: v.id("ngos"),
    swipeType: v.union(v.literal("right"), v.literal("left"), v.literal("super")),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_opportunity", ["opportunityId"])
  .index("by_user_and_opportunity", ["userId", "opportunityId"]),

  // Matches (mutual acceptance)
  matches: defineTable({
    userId: v.id("users"), // Volunteer
    opportunityId: v.id("opportunities"),
    ngoId: v.id("ngos"),
    status: v.union(
      v.literal("pending"), // Volunteer swiped right, waiting for NGO
      v.literal("accepted"), // NGO accepted
      v.literal("rejected"), // NGO rejected
      v.literal("active"), // Currently working together
      v.literal("completed") // Finished
    ),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
  .index("by_user", ["userId"])
  .index("by_ngo", ["ngoId"])
  .index("by_opportunity", ["opportunityId"])
  .index("by_status", ["status"]),

  // Tasks
  tasks: defineTable({
    ngoId: v.id("ngos"),
    matchId: v.optional(v.id("matches")), // Specific to a volunteer or general
    assignedTo: v.optional(v.id("users")), // If assigned to specific volunteer
    
    title: v.string(),
    description: v.string(),
    category: v.string(), // Skill category
    
    // Task details
    deadline: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
    
    // Status
    status: v.union(
      v.literal("available"), // On task board, unclaimed
      v.literal("claimed"), // Volunteer claimed it
      v.literal("in_progress"), // Being worked on
      v.literal("submitted"), // Waiting for review
      v.literal("completed"), // Approved by NGO
      v.literal("revision_requested") // NGO requested changes
    ),
    
    // Submission
    submissionText: v.optional(v.string()),
    submissionFiles: v.optional(v.array(v.string())),
    submittedAt: v.optional(v.number()),
    
    // Feedback
    feedback: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    
    createdAt: v.number(),
  })
  .index("by_ngo", ["ngoId"])
  .index("by_assignedTo", ["assignedTo"])
  .index("by_status", ["status"])
  .index("by_match", ["matchId"]),

  // Achievements/Medals
  achievements: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("medal"), v.literal("badge")),
    tier: v.optional(v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold"))),
    icon: v.string(),
    category: v.optional(v.string()), // For skill badges
    
    // Criteria
    criteriaType: v.string(), // "tasks_completed", "hours_volunteered", "skill_tasks"
    criteriaValue: v.number(),
    criteriaSkill: v.optional(v.string()), // For skill-specific badges
  }),

  // User Achievements (earned)
  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    earnedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_achievement", ["achievementId"]),

  // Messages/Chat
  messages: defineTable({
    matchId: v.id("matches"),
    senderId: v.id("users"),
    senderType: v.union(v.literal("volunteer"), v.literal("ngo")),
    content: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
  .index("by_match", ["matchId"])
  .index("by_sender", ["senderId"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "new_match", "task_assigned", "achievement_unlocked", "new_message"
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()), // ID of related entity
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_read", ["isRead"]),
});

