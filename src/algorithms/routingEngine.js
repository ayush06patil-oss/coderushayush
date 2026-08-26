import { runDijkstra } from './dijkstra.js';
import { runAStar } from './astar.js';
import { validateRoute } from './routeValidator.js';

/**
 * Standardized Routing Engine Wrapper
 * Executes chosen algorithm (Dijkstra or A*) against graph abstraction.
 */
export function calculateRoute({ algorithm = "astar", startNodeId, targetNodeId, graph }) {
  if (!graph || !startNodeId || !targetNodeId) {
    return {
      algorithm,
      path: [],
      distance: Infinity,
      travelTime: Infinity,
      visitedNodes: 0,
      executionTime: 0,
      status: "NO_ROUTE"
    };
  }

  let result;
  if (algorithm.toLowerCase() === "dijkstra") {
    result = runDijkstra(graph, startNodeId, targetNodeId);
  } else {
    result = runAStar(graph, startNodeId, targetNodeId);
  }

  const validation = validateRoute(graph, result, startNodeId, targetNodeId);
  result.validation = validation;

  return result;
}
