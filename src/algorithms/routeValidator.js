/**
 * Route Validation Engine
 * Validates path continuity, source/destination integrity, weight sums, and non-blocked road status.
 */
export function validateRoute(graph, result, startNodeId, targetNodeId) {
  if (!result || result.status === "NO_ROUTE" || !result.path || result.path.length === 0) {
    return {
      isValid: false,
      reason: "No route path to validate."
    };
  }

  const { path, distance, travelTime } = result;

  // 1. Source and Destination Check
  if (path[0] !== startNodeId) {
    return { isValid: false, reason: `Path does not start at requested node ${startNodeId}` };
  }
  if (path[path.length - 1] !== targetNodeId) {
    return { isValid: false, reason: `Path does not end at target node ${targetNodeId}` };
  }

  let calculatedDistance = 0;
  let calculatedTravelTime = 0;

  // 2. Pairwise Edge Integrity and Blocked Check
  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];

    const neighbors = graph.getNeighbors(fromId);
    const edgeObj = neighbors.find(n => n.node.id === toId)?.edge;

    if (!edgeObj) {
      return { isValid: false, reason: `Disconnected path: No edge exists between ${fromId} and ${toId}` };
    }

    if (edgeObj.blocked) {
      return { isValid: false, reason: `Invalid route: Path traverses blocked road ${edgeObj.id}` };
    }

    calculatedDistance += edgeObj.distance;
    calculatedTravelTime += edgeObj.travelTime;
  }

  const roundedCalcDist = parseFloat(calculatedDistance.toFixed(2));

  // 3. Weight Sum Consistency Check
  if (Math.abs(roundedCalcDist - distance) > 0.1) {
    return { 
      isValid: false, 
      reason: `Distance sum mismatch: expected ${distance} km, calculated ${roundedCalcDist} km` 
    };
  }

  if (calculatedTravelTime !== travelTime) {
    return { 
      isValid: false, 
      reason: `Travel time sum mismatch: expected ${travelTime} min, calculated ${calculatedTravelTime} min` 
    };
  }

  return {
    isValid: true,
    reason: "Route is fully valid and verified."
  };
}
