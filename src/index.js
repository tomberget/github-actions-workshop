/**
 * Task Manager Application
 * A simple task management system for the GitHub Actions Workshop
 */

const TaskManager = require("./taskManager");

function main() {
  console.log("🚀 Task Manager Application");
  console.log("============================\n");

  const manager = new TaskManager();

  // Add some sample tasks
  const task1 = manager.addTask("Learn GitHub Actions basics", "high");
  const task2 = manager.addTask("Create first workflow", "high");
  const task3 = manager.addTask("Deploy to production", "medium");

  console.log("Added tasks:");
  manager.listTasks();

  // Complete a task
  console.log("\n📝 Completing task:", task1.title);
  manager.completeTask(task1.id);

  console.log("\nCurrent tasks:");
  manager.listTasks();

  console.log("\n✅ Application completed successfully!");
}

// Run the application
if (require.main === module) {
  main();
}

module.exports = { main };
