import { MinHeap } from './minHeap';

/**
 * Admissible Straight-Line Distance Heuristic h(n)
 * Estimates distance from nodeA to nodeB based on coordinate positions.
 * Ensures h(n) <= actual road path distance (admissible).
 */
function heuristicDistance(nodeA, nodeB) {
  if (!nodeA || !nodeB) return 0;
  const dx = (nodeA.x || 0) - (nodeB.x || 0);
  const dy = (nodeA.y || 0) - (nodeB.y || 0);
  // Scale factor ensures heuristic never overestimates actual road distance
  return Math.sqrt(dx * dx + dy * dy) * 0.25;
}

/**
 * A* Search Algorithm
 * f(n) = g(n) + h(n)
 * g(n) = actual distance from start to node
 * h(n) = admissible straight-line distance heuristic to target
 */
export function runAStar(graph, startNodeId, targetNodeId) {
  const startTime = performance.now();

  const startNode = graph.getNode(startNodeId);
  const targetNode = graph.getNode(targetNodeId);

  if (!startNode || !targetNode) {
    const endTime = performance.now();
    return {
      algorithm: "A*",
      path: [],
      distance: Infinity,
      travelTime: Infinity,
      visitedNodes: 0,
      executionTime: parseFloat((endTime - startTime).toFixed(3)),
      status: "NO_ROUTE"
    };
  }

  const gScore = new Map();
  const fScore = new Map();
  const previous = new Map();
  const edgeUsed = new Map();
  const visited = new Set();

  const allNodes = graph.getAllNodes();
  for (const node of allNodes) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  }

  gScore.set(startNodeId, 0);
  const initialH = heuristicDistance(startNode, targetNode);
  fScore.set(startNodeId, initialH);

  const openSet = new MinHeap();
  openSet.push(startNodeId, initialH);

  let visitedCount = 0;

  while (!openSet.isEmpty()) {
    const currentId = openSet.pop();

    if (visited.has(currentId)) continue;
    visited.add(currentId);
    visitedCount++;

    if (currentId === targetNodeId) {
      break;
    }

    const currentG = gScore.get(currentId);
    const neighbors = graph.getNeighbors(currentId);

    for (const { node: neighborNode, edge } of neighbors) {
      if (!neighborNode || edge.blocked) continue;

      const tentativeG = currentG + edge.distance;
      if (tentativeG < gScore.get(neighborNode.id)) {
        previous.set(neighborNode.id, currentId);
        edgeUsed.set(neighborNode.id, edge);
        gScore.set(neighborNode.id, tentativeG);

        const h = heuristicDistance(neighborNode, targetNode);
        const f = tentativeG + h;
        fScore.set(neighborNode.id, f);

        openSet.push(neighborNode.id, f);
      }
    }
  }

  const endTime = performance.now();
  const executionTime = parseFloat((endTime - startTime).toFixed(3));

  if (gScore.get(targetNodeId) === Infinity) {
    return {
      algorithm: "A*",
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

  const totalDistance = parseFloat(gScore.get(targetNodeId).toFixed(2));

  return {
    algorithm: "A*",
    path,
    distance: totalDistance,
    travelTime: totalTravelTime,
    visitedNodes: visitedCount,
    executionTime,
    status: "FOUND"
  };
}
