/**
 * Path Interpolator Utility for Smooth Ambulance Trajectory Animation
 * Computes exact (x, y) coordinates along node paths based on percentage progress.
 */

export function interpolatePathPosition(path, progressPct, nodes) {
  if (!path || !Array.isArray(path) || path.length === 0 || !nodes) {
    return { x: 50, y: 50, fromNode: null, toNode: null };
  }

  // Map path node IDs to full node coordinate objects
  const pathNodes = path
    .map(id => nodes.find(n => n.id === id))
    .filter(Boolean);

  if (pathNodes.length === 0) return { x: 50, y: 50, fromNode: null, toNode: null };
  if (pathNodes.length === 1) return { x: pathNodes[0].x, y: pathNodes[0].y, fromNode: pathNodes[0], toNode: pathNodes[0] };

  // Calculate segment lengths in coordinate space
  const segments = [];
  let totalLength = 0;

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const from = pathNodes[i];
    const to = pathNodes[i + 1];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    segments.push({
      from,
      to,
      len,
      startDist: totalLength,
      endDist: totalLength + len
    });

    totalLength += len;
  }

  if (totalLength === 0) return { x: pathNodes[0].x, y: pathNodes[0].y, fromNode: pathNodes[0], toNode: pathNodes[0] };

  // Determine target distance along trajectory based on progressPct (0 to 100)
  const targetDist = (Math.max(0, Math.min(100, progressPct)) / 100) * totalLength;

  // Find active segment
  const activeSeg = segments.find(s => targetDist >= s.startDist && targetDist <= s.endDist) || segments[segments.length - 1];

  const segDist = targetDist - activeSeg.startDist;
  const segRatio = activeSeg.len > 0 ? segDist / activeSeg.len : 0;

  const currentX = activeSeg.from.x + (activeSeg.to.x - activeSeg.from.x) * segRatio;
  const currentY = activeSeg.from.y + (activeSeg.to.y - activeSeg.from.y) * segRatio;

  return {
    x: parseFloat(currentX.toFixed(2)),
    y: parseFloat(currentY.toFixed(2)),
    fromNode: activeSeg.from,
    toNode: activeSeg.to,
    segmentRatio: segRatio
  };
}
