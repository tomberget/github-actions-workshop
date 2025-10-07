/**
 * TaskManager Class
 * Manages a collection of tasks with CRUD operations
 */

class TaskManager {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  /**
   * Add a new task
   * @param {string} title - The task title
   * @param {string} priority - Task priority: 'low', 'medium', 'high'
   * @returns {Object} The created task
   */
  addTask(title, priority = 'medium') {
    if (!title || typeof title !== 'string') {
      throw new Error('Task title is required and must be a string');
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      throw new Error(`Priority must be one of: ${validPriorities.join(', ')}`);
    }

    const task = {
      id: this.nextId++,
      title: title.trim(),
      priority,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.push(task);
    return task;
  }

  /**
   * Get a task by ID
   * @param {number} id - Task ID
   * @returns {Object|null} The task or null if not found
   */
  getTask(id) {
    return this.tasks.find(task => task.id === id) || null;
  }

  /**
   * Get all tasks
   * @param {Object} filters - Optional filters (completed, priority)
   * @returns {Array} Array of tasks
   */
  getTasks(filters = {}) {
    let result = [...this.tasks];

    if (filters.completed !== undefined) {
      result = result.filter(task => task.completed === filters.completed);
    }

    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }

    return result;
  }

  /**
   * Update a task
   * @param {number} id - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated task or null if not found
   */
  updateTask(id, updates) {
    const task = this.getTask(id);
    if (!task) {
      return null;
    }

    if (updates.title !== undefined) {
      if (typeof updates.title !== 'string' || !updates.title.trim()) {
        throw new Error('Title must be a non-empty string');
      }
      task.title = updates.title.trim();
    }

    if (updates.priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(updates.priority)) {
        throw new Error(`Priority must be one of: ${validPriorities.join(', ')}`);
      }
      task.priority = updates.priority;
    }

    if (updates.completed !== undefined) {
      task.completed = Boolean(updates.completed);
    }

    return task;
  }

  /**
   * Mark a task as completed
   * @param {number} id - Task ID
   * @returns {Object|null} Updated task or null if not found
   */
  completeTask(id) {
    return this.updateTask(id, { completed: true });
  }

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @returns {boolean} True if deleted, false if not found
   */
  deleteTask(id) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) {
      return false;
    }
    this.tasks.splice(index, 1);
    return true;
  }

  /**
   * Get task statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const byPriority = {
      high: this.tasks.filter(t => t.priority === 'high').length,
      medium: this.tasks.filter(t => t.priority === 'medium').length,
      low: this.tasks.filter(t => t.priority === 'low').length
    };

    return {
      total,
      completed,
      pending,
      byPriority
    };
  }

  /**
   * List all tasks to console
   */
  listTasks() {
    if (this.tasks.length === 0) {
      console.log('  No tasks found');
      return;
    }

    this.tasks.forEach(task => {
      const status = task.completed ? '✅' : '⬜';
      const priority = task.priority.toUpperCase().padEnd(6);
      console.log(`  ${status} [${priority}] ${task.title} (ID: ${task.id})`);
    });
  }

  /**
   * Clear all tasks
   */
  clearAllTasks() {
    this.tasks = [];
    this.nextId = 1;
  }
}

module.exports = TaskManager;
