import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create task
export const createTask = mutation({
  args: {
    ngoId: v.id("ngos"),
    matchId: v.optional(v.id("matches")),
    assignedTo: v.optional(v.id("users")),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    deadline: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      ngoId: args.ngoId,
      matchId: args.matchId,
      assignedTo: args.assignedTo,
      title: args.title,
      description: args.description,
      category: args.category,
      deadline: args.deadline,
      estimatedHours: args.estimatedHours,
      status: args.assignedTo ? "claimed" : "available",
      createdAt: Date.now(),
    });

    // Create notification if assigned to specific volunteer
    if (args.assignedTo) {
      await ctx.db.insert("notifications", {
        userId: args.assignedTo,
        type: "task_assigned",
        title: "New Task Assigned!",
        message: `You have been assigned a new task: ${args.title}`,
        isRead: false,
        relatedId: taskId,
        createdAt: Date.now(),
      });
    }

    return taskId;
  },
});

// Get available tasks (task board)
export const getAvailableTasks = query({
  args: { ngoId: v.optional(v.id("ngos")) },
  handler: async (ctx, args) => {
    let tasksQuery = ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "available"));

    const tasks = await tasksQuery.collect();

    // If ngoId provided, filter by it
    const filteredTasks = args.ngoId 
      ? tasks.filter(t => t.ngoId === args.ngoId)
      : tasks;

    return await Promise.all(
      filteredTasks.map(async (task) => {
        const ngo = await ctx.db.get(task.ngoId);
        return {
          ...task,
          ngo: ngo ? { name: ngo.organizationName, logo: ngo.logo } : null,
        };
      })
    );
  },
});

// Get tasks for volunteer
export const getTasksForVolunteer = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.userId))
      .collect();

    return await Promise.all(
      tasks.map(async (task) => {
        const ngo = await ctx.db.get(task.ngoId);
        return {
          ...task,
          ngo: ngo ? { name: ngo.organizationName, logo: ngo.logo } : null,
        };
      })
    );
  },
});

// Get tasks for NGO
export const getTasksForNGO = query({
  args: { ngoId: v.id("ngos") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_ngo", (q) => q.eq("ngoId", args.ngoId))
      .collect();

    return await Promise.all(
      tasks.map(async (task) => {
        const volunteer = task.assignedTo ? await ctx.db.get(task.assignedTo) : null;
        return {
          ...task,
          volunteer,
        };
      })
    );
  },
});

// Claim a task
export const claimTask = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (task.status !== "available") throw new Error("Task is not available");

    await ctx.db.patch(args.taskId, {
      assignedTo: args.userId,
      status: "claimed",
    });

    return args.taskId;
  },
});

// Submit task
export const submitTask = mutation({
  args: {
    taskId: v.id("tasks"),
    submissionText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      submissionText: args.submissionText,
      status: "submitted",
      submittedAt: Date.now(),
    });

    const task = await ctx.db.get(args.taskId);
    if (task) {
      const ngo = await ctx.db.get(task.ngoId);
      if (ngo) {
        await ctx.db.insert("notifications", {
          userId: ngo.userId,
          type: "task_submitted",
          title: "Task Submitted",
          message: `A volunteer has submitted: ${task.title}`,
          isRead: false,
          relatedId: args.taskId,
          createdAt: Date.now(),
        });
      }
    }

    return args.taskId;
  },
});

// Review task (NGO)
export const reviewTask = mutation({
  args: {
    taskId: v.id("tasks"),
    approve: v.boolean(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const newStatus = args.approve ? "completed" : "revision_requested";
    
    await ctx.db.patch(args.taskId, {
      status: newStatus,
      feedback: args.feedback,
      completedAt: args.approve ? Date.now() : undefined,
    });

    // Update volunteer stats if completed
    if (args.approve && task.assignedTo) {
      const user = await ctx.db.get(task.assignedTo);
      if (user) {
        await ctx.db.patch(task.assignedTo, {
          tasksCompleted: user.tasksCompleted + 1,
          totalHoursVolunteered: user.totalHoursVolunteered + (task.estimatedHours || 0),
        });
      }

      // Update NGO stats
      const ngo = await ctx.db.get(task.ngoId);
      if (ngo) {
        await ctx.db.patch(task.ngoId, {
          totalHoursReceived: ngo.totalHoursReceived + (task.estimatedHours || 0),
        });
      }

      // Create notification
      await ctx.db.insert("notifications", {
        userId: task.assignedTo,
        type: "task_completed",
        title: "Task Approved!",
        message: `Your task "${task.title}" has been approved!`,
        isRead: false,
        relatedId: args.taskId,
        createdAt: Date.now(),
      });
    }

    return args.taskId;
  },
});

// Get task by ID
export const getTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    const ngo = await ctx.db.get(task.ngoId);
    const volunteer = task.assignedTo ? await ctx.db.get(task.assignedTo) : null;

    return {
      ...task,
      ngo,
      volunteer,
    };
  },
});

