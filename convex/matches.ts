import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Record a swipe
export const swipeOpportunity = mutation({
  args: {
    userId: v.id("users"),
    opportunityId: v.id("opportunities"),
    swipeType: v.union(v.literal("right"), v.literal("left"), v.literal("super")),
  },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) throw new Error("Opportunity not found");

    // Record swipe
    const swipeId = await ctx.db.insert("swipes", {
      userId: args.userId,
      opportunityId: args.opportunityId,
      ngoId: opportunity.ngoId,
      swipeType: args.swipeType,
      createdAt: Date.now(),
    });

    // Only right swipe creates a pending match (immediate application)
    // Super like saves for later without creating a match
    if (args.swipeType === "right") {
      const matchId = await ctx.db.insert("matches", {
        userId: args.userId,
        opportunityId: args.opportunityId,
        ngoId: opportunity.ngoId,
        status: "pending",
        createdAt: Date.now(),
      });

      // Create notification for NGO
      const ngo = await ctx.db.get(opportunity.ngoId);
      if (ngo) {
        await ctx.db.insert("notifications", {
          userId: ngo.userId,
          type: "new_applicant",
          title: "New Volunteer Application!",
          message: `A volunteer has applied to your opportunity: ${opportunity.title}`,
          isRead: false,
          relatedId: matchId,
          createdAt: Date.now(),
        });
      }

      return { matchId, swipeId };
    }

    return { swipeId };
  },
});

// NGO accepts/rejects a match
export const respondToMatch = mutation({
  args: {
    matchId: v.id("matches"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    const newStatus = args.accept ? "accepted" : "rejected";
    await ctx.db.patch(args.matchId, {
      status: newStatus,
      acceptedAt: args.accept ? Date.now() : undefined,
    });

    // Create notification for volunteer
    const opportunity = await ctx.db.get(match.opportunityId);
    const ngo = await ctx.db.get(match.ngoId);
    
    if (args.accept && opportunity && ngo) {
      await ctx.db.insert("notifications", {
        userId: match.userId,
        type: "match_accepted",
        title: "Match Confirmed!",
        message: `${ngo.organizationName} has accepted your application for ${opportunity.title}`,
        isRead: false,
        relatedId: args.matchId,
        createdAt: Date.now(),
      });
    }

    return args.matchId;
  },
});

// Get pending matches for NGO
export const getPendingMatchesForNGO = query({
  args: { ngoId: v.id("ngos") },
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_ngo", (q) => q.eq("ngoId", args.ngoId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return await Promise.all(
      matches.map(async (match) => {
        const user = await ctx.db.get(match.userId);
        const opportunity = await ctx.db.get(match.opportunityId);
        return {
          ...match,
          volunteer: user,
          opportunity,
        };
      })
    );
  },
});

// Get active matches for volunteer
export const getMatchesForVolunteer = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "accepted"),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    return await Promise.all(
      matches.map(async (match) => {
        const ngo = await ctx.db.get(match.ngoId);
        const opportunity = await ctx.db.get(match.opportunityId);
        return {
          ...match,
          ngo,
          opportunity,
        };
      })
    );
  },
});

// Get all matches for volunteer (including pending and rejected)
export const getAllMatchesForVolunteer = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return await Promise.all(
      matches.map(async (match) => {
        const ngo = await ctx.db.get(match.ngoId);
        const opportunity = await ctx.db.get(match.opportunityId);
        return {
          ...match,
          ngo,
          opportunity,
        };
      })
    );
  },
});

// Get match details
export const getMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) return null;

    const user = await ctx.db.get(match.userId);
    const ngo = await ctx.db.get(match.ngoId);
    const opportunity = await ctx.db.get(match.opportunityId);

    return {
      ...match,
      volunteer: user,
      ngo,
      opportunity,
    };
  },
});

// Update match status
export const updateMatchStatus = mutation({
  args: {
    matchId: v.id("matches"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("active"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.matchId, { status: args.status });
    return args.matchId;
  },
});

// Get saved opportunities for user (super likes)
export const getSavedOpportunitiesForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const swipes = await ctx.db
      .query("swipes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("swipeType"), "super"))
      .collect();

    // Filter out swipes that have already been applied to (have a match)
    const swipesWithOpportunities = await Promise.all(
      swipes.map(async (swipe) => {
        // Check if there's already a match for this opportunity
        const existingMatch = await ctx.db
          .query("matches")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .filter((q) => q.eq(q.field("opportunityId"), swipe.opportunityId))
          .first();

        if (existingMatch) {
          return null; // Already applied, don't show in saved
        }

        const opportunity = await ctx.db.get(swipe.opportunityId);
        if (!opportunity || !opportunity.isActive) return null;

        const ngo = await ctx.db.get(opportunity.ngoId);

        return {
          ...swipe,
          opportunity: {
            ...opportunity,
            ngo: ngo ? {
              name: ngo.organizationName,
              logo: ngo.logo,
            } : null,
          },
        };
      })
    );

    return swipesWithOpportunities.filter(swipe => swipe !== null);
  },
});

// Remove saved opportunity
export const removeSavedOpportunity = mutation({
  args: { swipeId: v.id("swipes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.swipeId);
  },
});

// Get matches for user (both volunteer and NGO) with last message info
export const getMatchesForUser = query({
  args: { 
    userId: v.optional(v.id("users")),
    ngoId: v.optional(v.id("ngos")),
  },
  handler: async (ctx, args) => {
    let matches;
    
    if (args.userId) {
      // Get matches for volunteer
      matches = await ctx.db
        .query("matches")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => 
          q.or(
            q.eq(q.field("status"), "accepted"),
            q.eq(q.field("status"), "active")
          )
        )
        .collect();
    } else if (args.ngoId) {
      // Get matches for NGO
      matches = await ctx.db
        .query("matches")
        .withIndex("by_ngo", (q) => q.eq("ngoId", args.ngoId))
        .filter((q) => 
          q.or(
            q.eq(q.field("status"), "accepted"),
            q.eq(q.field("status"), "active")
          )
        )
        .collect();
    } else {
      return [];
    }

    // Get last message for each match
    const matchesWithMessages = await Promise.all(
      matches.map(async (match) => {
        const ngo = await ctx.db.get(match.ngoId);
        const volunteer = await ctx.db.get(match.userId);
        const opportunity = await ctx.db.get(match.opportunityId);
        
        // Get last message for this match
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_match", (q) => q.eq("matchId", match._id))
          .order("desc")
          .first();

        return {
          ...match,
          ngo,
          volunteer,
          opportunity,
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.createdAt || match.createdAt,
        };
      })
    );

    // Sort by last message time
    return matchesWithMessages.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  },
});

