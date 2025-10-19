import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Send message
export const sendMessage = mutation({
  args: {
    matchId: v.id("matches"),
    senderId: v.id("users"),
    senderType: v.union(v.literal("volunteer"), v.literal("ngo")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      matchId: args.matchId,
      senderId: args.senderId,
      senderType: args.senderType,
      content: args.content,
      isRead: false,
      createdAt: Date.now(),
    });

    // Get match to find recipient
    const match = await ctx.db.get(args.matchId);
    if (match) {
      const recipientId = args.senderType === "volunteer" 
        ? (await ctx.db.get(match.ngoId))?.userId 
        : match.userId;

      if (recipientId) {
        await ctx.db.insert("notifications", {
          userId: recipientId,
          type: "new_message",
          title: "New Message",
          message: args.content.substring(0, 50) + "...",
          isRead: false,
          relatedId: messageId,
          createdAt: Date.now(),
        });
      }
    }

    return messageId;
  },
});

// Get messages for a match
export const getMessagesForMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    return await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        let senderPicture = sender?.profilePicture;
        let senderName = sender?.name || "Unknown";

        // If sender is NGO type, fetch their logo from ngos table
        if (msg.senderType === "ngo") {
          const ngo = await ctx.db
            .query("ngos")
            .withIndex("by_userId", (q) => q.eq("userId", msg.senderId))
            .first();
          if (ngo) {
            senderPicture = ngo.logo;
            senderName = ngo.organizationName;
          }
        }

        return {
          ...msg,
          senderName,
          senderPicture,
        };
      })
    );
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: { matchId: v.id("matches"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => 
        q.and(
          q.neq(q.field("senderId"), args.userId),
          q.eq(q.field("isRead"), false)
        )
      )
      .collect();

    for (const message of messages) {
      await ctx.db.patch(message._id, { isRead: true });
    }
  },
});

// Get unread message count
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.neq(q.field("senderId"), args.userId),
          q.eq(q.field("isRead"), false)
        )
      )
      .collect();

    return messages.length;
  },
});

