import { runDijkstra } from './dijkstra.js';
import { runAStar } from './astar.js';

/**
 * Dual Algorithm Benchmarking Utility
 * Runs Dijkstra and A* sequentially on the exact same graph, source, and target.
 */
export function runBenchmark(startNodeId, targetNodeId, graph) {
  if (!graph || !startNodeId || !targetNodeId) {
    return null;
  }

  // 1. Execute Dijkstra
  const dijkstraResult = runDijkstra(graph, startNodeId, targetNodeId);

  // 2. Execute A*
  const astarResult = runAStar(graph, startNodeId, targetNodeId);

  const sameDistance = dijkstraResult.distance === astarResult.distance;
  const nodesSaved = dijkstraResult.visitedNodes - astarResult.visitedNodes;
  const timeDiff = parseFloat((dijkstraResult.executionTime - astarResult.executionTime).toFixed(3));

  return {
    dijkstra: dijkstraResult,
    astar: astarResult,
    comparison: {
      sameDistance,
      nodesSaved,
      timeDifferenceMs: timeDiff
    }
  };
}
