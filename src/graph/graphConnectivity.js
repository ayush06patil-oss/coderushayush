/**
 * Connected Component Analyzer for Graph Networks
 * Performs Breadth-First Search (BFS) to audit graph connectivity:
 * - Total Nodes
 * - Total Edges
 * - Number of Connected Components
 * - Largest Component Size
 * - Isolated Nodes (degree 0)
 * - Degree-1 Nodes
 */
export function analyzeGraphConnectivity(graph) {
  if (!graph || !graph.nodes) {
    return {
      totalNodes: 0,
      totalEdges: 0,
      connectedComponentsCount: 0,
      largestComponentSize: 0,
      isolatedNodesCount: 0,
      degreeOneNodesCount: 0,
      isFullyConnected: false
    };
  }

  const nodes = Array.from(graph.nodes.values());
  const totalNodes = nodes.length;
  const visited = new Set();
  const components = [];

  let isolatedNodesCount = 0;
  let degreeOneNodesCount = 0;
  let totalEdgesCount = 0;

  // Calculate degrees and isolated nodes
  nodes.forEach(node => {
    const neighbors = graph.getNeighbors(node.id) || [];
    const degree = neighbors.length;
    totalEdgesCount += degree;

    if (degree === 0) isolatedNodesCount++;
    if (degree === 1) degreeOneNodesCount++;
  });

  // Directed/Undirected edge count adjustment
  const totalEdges = Math.round(totalEdgesCount / 2);

  // BFS Traversal to compute connected components
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const componentNodes = [];
      const queue = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const currId = queue.shift();
        componentNodes.push(currId);

        const neighbors = graph.getNeighbors(currId) || [];
        for (const edge of neighbors) {
          const neighborId = edge.node.id;
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
      components.push(componentNodes);
    }
  }

  // Sort components by size descending
  components.sort((a, b) => b.length - a.length);

  const largestComponentSize = components.length > 0 ? components[0].length : 0;
  const isFullyConnected = components.length === 1 && largestComponentSize === totalNodes;

  return {
    totalNodes,
    totalEdges,
    connectedComponentsCount: components.length,
    largestComponentSize,
    isolatedNodesCount,
    degreeOneNodesCount,
    isFullyConnected,
    mainComponentNodeIds: components.length > 0 ? new Set(components[0]) : new Set()
  };
}
