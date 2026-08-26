import { MinHeap } from './minHeap';

/**
 * Dijkstra Shortest Path Algorithm
 * Calculates the shortest path between startNodeId and targetNodeId based on edge distance.
 * Ignores blocked edges (edge.blocked === true).
 */
export function runDijkstra(graph, startNodeId, targetNodeId) {
  const startTime = performance.now();

  const startNode = graph.getNode(startNodeId);
  const targetNode = graph.getNode(targetNodeId);

  if (!startNode || !targetNode) {
    const endTime = performance.now();
    return {
      algorithm: "Dijkstra",
      path: [],
      distance: Infinity,
      travelTime: Infinity,
      visitedNodes: 0,
      executionTime: parseFloat((endTime - startTime).toFixed(3)),
      status: "NO_ROUTE"
    };
  }

  const distances = new Map();
  const previous = new Map();
  const edgeUsed = new Map();
  const visited = new Set();

  const allNodes = graph.getAllNodes();
  for (const node of allNodes) {
    distances.set(node.id, Infinity);
  }

  distances.set(startNodeId, 0);

  const pq = new MinHeap();
  pq.push(startNodeId, 0);

  let visitedCount = 0;

  while (!pq.isEmpty()) {
    const currentId = pq.pop();

    if (visited.has(currentId)) continue;
    visited.add(currentId);
    visitedCount++;

    if (currentId === targetNodeId) {
      break;
    }

    const currentDist = distances.get(currentId);
    const neighbors = graph.getNeighbors(currentId);

    for (const { node: neighborNode, edge } of neighbors) {
      if (!neighborNode || edge.blocked) continue;

      const altDist = currentDist + edge.distance;
      if (altDist < distances.get(neighborNode.id)) {
        distances.set(neighborNode.id, altDist);
        previous.set(neighborNode.id, currentId);
        edgeUsed.set(neighborNode.id, edge);
        pq.push(neighborNode.id, altDist);
      }
    }
  }

  const endTime = performance.now();
  const executionTime = parseFloat((endTime - startTime).toFixed(3));

  // Reconstruct path if target reached
  if (distances.get(targetNodeId) === Infinity) {
    return {
      algorithm: "Dijkstra",
      path: [],
      distance: Infinity,
      travelTime: Infinity,
      visitedNodes: visitedCount,
      executionTime,
      status: "NO_ROUTE"
    };
  }

  const path = [];
  let curr = targetNodeId;
  let totalTravelTime = 0;

  while (curr) {
    path.unshift(curr);
    const prevNode = previous.get(curr);
    if (prevNode) {
      const edge = edgeUsed.get(curr);
      if (edge) {
        totalTravelTime += edge.travelTime;
      }
    }
    curr = prevNode;
  }

  const totalDistance = parseFloat(distances.get(targetNodeId).toFixed(2));

  return {
    algorithm: "Dijkstra",
    path,
    distance: totalDistance,
    travelTime: totalTravelTime,
    visitedNodes: visitedCount,
    executionTime,
    status: "FOUND"
  };
}
