
const executionTimes: Record<string, number[]> = {};

/**
 * Measures the execution time of an asynchronous function and records it under a given label.
 *
 * - Stores all execution times in milliseconds grouped by label.
 * - Useful for performance profiling and benchmarking async operations.
 *
 * @template T
 * @param {string} label - A label used to group execution times.
 * @param {() => Promise<T>} fn - The asynchronous function whose execution time is to be measured.
 * @returns {Promise<T>} - The result of the executed async function.
 */
export async function measureTime<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  if (!executionTimes[label]) {
    executionTimes[label] = [];
  }
  executionTimes[label].push(duration);

  return result;
}

/**
 * Prints a formatted summary of all recorded execution times to the console.
 * 
 * For each label, it logs:
 * - the number of times the function was called
 * - the average execution time in milliseconds
 * - the minimum and maximum execution times
 * 
 * Useful for performance analysis and debugging.
 *
 * Requires `executionTimes` to be defined in the global/module scope.
 */
export function printExecutionSummary(): void {
  console.log('\n⏱️ Execution Time Summary:\n----------------------------');
  Object.entries(executionTimes).forEach(([label, times]) => {
    const total = times.reduce((a, b) => a + b, 0);
    const avg = (total / times.length).toFixed(2);
    const count = times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);
    console.log(`${label}: called ${count}x | avg: ${avg}ms | min: ${min}ms | max: ${max}ms`);
  });
  console.log('----------------------------\n');
}