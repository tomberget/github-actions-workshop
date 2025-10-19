/**
 * TaskManager class for managing tasks
 */

class TaskManager {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  addTask(title, priority = "medium") {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      throw new Error("Task title is required");
    }

    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      throw new Error("Priority must be one of: low, medium, high");
    }

    const task = {
      id: this.nextId++,
      title: trimmedTitle,
      priority,
      completed: false,
    };

    this.tasks.push(task);
    return task;
  }

  getTask(id) {
    return this.tasks.find((task) => task.id === id) || null;
  }

  getTasks(filters = {}) {
    return this.tasks.filter((task) => {
      if (
        filters.completed !== undefined &&
        task.completed !== filters.completed
      ) {
        return false;
      }
      if (
        filters.priority !== undefined &&
        task.priority !== filters.priority
      ) {
        return false;
      }
      return true;
    });
  }

  updateTask(id, updates) {
    const task = this.getTask(id);

    if (!task) {
      return null;
    }

    if (updates.title !== undefined) {
      const trimmedTitle = updates.title.trim();
      if (!trimmedTitle) {
        throw new Error("Title must be a non-empty string");
      }
      task.title = trimmedTitle;
    }

    if (updates.priority !== undefined) {
      task.priority = updates.priority;
    }

    if (updates.completed !== undefined) {
      task.completed = updates.completed;
    }

    return task;
  }

  completeTask(id) {
    return this.updateTask(id, { completed: true });
  }

  deleteTask(id) {
    const index = this.tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      return false;
    }

    this.tasks.splice(index, 1);
    return true;
  }

  getStats() {
    const stats = {
      total: this.tasks.length,
      completed: 0,
      pending: 0,
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
      },
    };

    this.tasks.forEach((task) => {
      if (task.completed) {
        stats.completed++;
      } else {
        stats.pending++;
      }
      stats.byPriority[task.priority]++;
    });

    return stats;
  }

  clearAllTasks() {
    this.tasks = [];
    this.nextId = 1;
  }
}

export default TaskManager;
