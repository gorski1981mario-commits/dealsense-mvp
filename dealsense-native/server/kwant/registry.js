/**
 * KWANT TASK REGISTRY STUB
 * Rejestr zadań dla KWANT workers
 */

const tasks = new Map();

// Rejestracja zadania
function registerTask(name, handler, options = {}) {
  tasks.set(name, {
    name,
    handler,
    options,
    registered: new Date().toISOString()
  });
  console.log(`[KWANT REGISTRY] Registered task: ${name}`);
}

// Pobranie zadania
function getTask(name) {
  return tasks.get(name) || null;
}

// Lista wszystkich zadań
function listTasks() {
  return Array.from(tasks.keys());
}

module.exports = {
  registerTask,
  getTask,
  listTasks
};
