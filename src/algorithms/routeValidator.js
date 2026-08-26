/**
 * Route Validation & Path Metrics Debugger Engine
 * Calculates exact totalDistance, totalTravelTime, and edge breakdown from path node pairs.
 */

export function calculatePathMetrics(path, graph) {
  if (!path || !Array.isArray(path) || path.length < 2 || !graph) {
    return {
      isValid: false,
      distance: 0,
      travelTime: 0,
      edges: [],
      error: "Invalid or empty path"
    };
  }

  let totalDistance = 0;
  let totalTravelTime = 0;
  const edges = [];

  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];

    const uNode = graph.getNode(u);
    const vNode = graph.getNode(v);

    const neighbors = graph.getNeighbors(u);
    const edgeObj = neighbors.find(n => n.node && n.node.id === v)?.edge;

    if (!edgeObj) {
      return {
        isValid: false,
        distance: 0,
        travelTime: 0,
        edges: [],
        error: `Edge missing between ${uNode?.name || u} and ${vNode?.name || v}`
      };
    }

    if (edgeObj.blocked) {
      return {
        isValid: false,
        distance: totalDistance,
        travelTime: totalTravelTime,
        edges,
        error: `Traverses blocked edge ${edgeObj.name || edgeObj.id}`
      };
    }

    totalDistance += edgeObj.distance;
    totalTravelTime += edgeObj.travelTime;
    edges.push({
      from: uNode?.name || u,
      to: vNode?.name || v,
      distance: edgeObj.distance,
      travelTime: edgeObj.travelTime,
      blocked: edgeObj.blocked
    });
  }

  return {
    isValid: true,
    distance: parseFloat(totalDistance.toFixed(2)),
    travelTime: totalTravelTime,
    edges,
    error: null
  };
}

export function validateRoute(graph, result, startNodeId, targetNodeId) {
  if (!result || result.status === "NO_ROUTE" || !result.path || result.path.length === 0) {
    return {
      isValid: false,
      reason: "No route path to validate."
    };
  }

  const { path, distance, travelTime } = result;

  if (path[0] !== startNodeId) {
    return { isValid: false, reason: `Path does not start at requested node ${startNodeId}` };
  }
  if (path[path.length - 1] !== targetNodeId) {
    return { isValid: false, reason: `Path does not end at target node ${targetNodeId}` };
  }

  const metrics = calculatePathMetrics(path, graph);
  if (!metrics.isValid) {
    return { isValid: false, reason: metrics.error };
  }

  if (Math.abs(metrics.distance - distance) > 0.1) {
    return { isValid: false, reason: `Distance sum mismatch: expected ${distance} km, calculated ${metrics.distance} km` };
  }

  if (metrics.travelTime !== travelTime) {
    return { isValid: false, reason: `Travel time sum mismatch: expected ${travelTime} min, calculated ${metrics.travelTime} min` };
  }

  return {
    isValid: true,
    reason: "Route is fully valid and verified."
  };
}
