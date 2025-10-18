import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get notifications for user
export const getNotifications = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return notifications;
  },
});

// Get unread notifications count
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return notifications.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

