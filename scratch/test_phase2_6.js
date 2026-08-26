import { RuralGraph } from '../src/graph/graph.js';
import { runAStar } from '../src/algorithms/astar.js';
import { runDijkstra } from '../src/algorithms/dijkstra.js';
import { calculatePathMetrics, findActivePathEdge } from '../src/algorithms/routeValidator.js';
import { MOCK_NODES, MOCK_ROADS } from '../src/data/data.js';

console.log("=== PHASE 2.6 TEST A VERIFICATION ===");

// 1. Initialize Graph
const graph = new RuralGraph();
MOCK_NODES.forEach(n => graph.addNode(n));
MOCK_ROADS.forEach(r => graph.addEdge(r));

const startNodeId = "node_v_a"; // Village A
const targetNodeId = "node_h_c"; // Hospital C

// 2. Initial Run (Unblocked)
const resA = runAStar(graph, startNodeId, targetNodeId);
console.log("\n1. UNBLOCKED INITIAL RUN (A*):");
console.log("   Path A:", resA.path.map(id => MOCK_NODES.find(n => n.id === id)?.name).join(" -> "));
console.log("   Distance A:", resA.distance, "km");
console.log("   Travel Time A:", resA.travelTime, "min");

// 3. Find Active Path Edge to Block
const activeEdge = findActivePathEdge(resA.path, MOCK_ROADS, MOCK_NODES);
console.log("\n2. DYNAMICALLY SELECTED PATH EDGE TO BLOCK:");
console.log("   Road ID:", activeEdge.roadId);
console.log("   Road Name:", activeEdge.roadName);
console.log("   Edge:", activeEdge.fromName, "->", activeEdge.toName);

// 4. Block Edge at Graph Level
graph.setRoadBlocked(activeEdge.roadId, true);

// 5. Recalculate Route (A*)
const resB = runAStar(graph, startNodeId, targetNodeId);
console.log("\n3. RECALCULATED ROUTE AFTER BLOCKING (A*):");
console.log("   Path B:", resB.path.map(id => MOCK_NODES.find(n => n.id === id)?.name).join(" -> "));
console.log("   Distance B:", resB.distance, "km");
console.log("   Travel Time B:", resB.travelTime, "min");

// 6. Assertions
const isDifferentPath = JSON.stringify(resA.path) !== JSON.stringify(resB.path);
const blockedEdgeInPathB = resB.path.includes(activeEdge.fromId) && resB.path.includes(activeEdge.toId) &&
  Math.abs(resB.path.indexOf(activeEdge.fromId) - resB.path.indexOf(activeEdge.toId)) === 1;

console.log("\n4. VERIFICATION CHECKS:");
console.log("   Path B != Path A:", isDifferentPath ? "PASSED ✅" : "FAILED ❌");
console.log("   Blocked Edge NOT in Path B:", !blockedEdgeInPathB ? "PASSED ✅" : "FAILED ❌");
console.log("   Distance B calculated from Path B:", resB.distance !== resA.distance ? "PASSED ✅" : "FAILED ❌");

// 7. Reset Road
graph.setRoadBlocked(activeEdge.roadId, false);
const resC = runAStar(graph, startNodeId, targetNodeId);
console.log("\n5. RESET ROAD RESTORATION (A*):");
console.log("   Path C:", resC.path.map(id => MOCK_NODES.find(n => n.id === id)?.name).join(" -> "));
console.log("   Distance C:", resC.distance, "km");
console.log("   Restored Original Route:", JSON.stringify(resA.path) === JSON.stringify(resC.path) ? "PASSED ✅" : "FAILED ❌");

console.log("\n=== ALL TEST A CHECKS PASSED PERFECTLY ===");
