import { generate50kGraph } from '../src/graph/largeGraphGenerator.js';
import { runAStar } from '../src/algorithms/astar.js';
import { runDijkstra } from '../src/algorithms/dijkstra.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';

console.log("=================================================");
console.log(" 50,000-NODE SCALABILITY BENCHMARK & TEST SUITE");
console.log("=================================================\n");

// 1. Measure Graph Generation & Initialization Time
const startInit = performance.now();
const largeGraphData = generate50kGraph();
const endInit = performance.now();
const initTimeMs = parseFloat((endInit - startInit).toFixed(2));

console.log("1. GRAPH INITIALIZATION & MEMORY METRICS:");
console.log(`   Nodes Count: ${largeGraphData.totalNodes.toLocaleString()}`);
console.log(`   Edges Count: ${largeGraphData.totalEdges.toLocaleString()}`);
console.log(`   Graph Init Time: ${initTimeMs} ms`);

// TEST 1: Nearby 50k Route (Short Distance - 10 Hops)
const start1 = performance.now();
const res1 = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_50k_0",
  targetNodeId: "node_50k_10",
  graph: largeGraphData.graph
});
const end1 = performance.now();
const time1 = parseFloat((end1 - start1).toFixed(2));

console.log("\n2. QUERY TEST 1 (Nearby 50k Route - 10 Hops):");
console.log(`   Distance: ${res1.distance} km`);
console.log(`   Search Time: ${time1} ms`);
console.log(`   Visited Nodes: ${res1.visitedNodes} / 50,000`);
const pass1 = res1.status === "FOUND" && time1 < 100;
console.log(`   TEST 1 RESULT: ${pass1 ? 'PASSED ✅' : 'FAILED ❌'}`);

// TEST 2: Far-Away 50k Route (Multi-Hop 25,000 Nodes Search)
const start2 = performance.now();
const res2 = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_50k_0",
  targetNodeId: "node_50k_25000",
  graph: largeGraphData.graph
});
const end2 = performance.now();
const time2 = parseFloat((end2 - start2).toFixed(2));

console.log("\n3. QUERY TEST 2 (Far-Away 50k Route - 25,000 Nodes Search):");
console.log(`   Distance: ${res2.distance} km`);
console.log(`   Search Time: ${time2} ms`);
console.log(`   Visited Nodes: ${res2.visitedNodes} / 50,000`);
const pass2 = res2.status === "FOUND" && time2 < 300;
console.log(`   TEST 2 RESULT: ${pass2 ? 'PASSED ✅' : 'FAILED ❌'}`);

// TEST 3: Dijkstra vs A* Execution Time Comparison on 50k Graph
const startDijk = performance.now();
const resDijk = runDijkstra(largeGraphData.graph, "node_50k_0", "node_50k_25000");
const endDijk = performance.now();
const timeDijk = parseFloat((endDijk - startDijk).toFixed(2));

console.log("\n4. DUAL ALGORITHM COMPARISON (Dijkstra vs A* on 50,000 Nodes):");
console.log(`   Dijkstra Search Time: ${timeDijk} ms | Visited Nodes: ${resDijk.visitedNodes.toLocaleString()}`);
console.log(`   A* Search Time:       ${time2} ms    | Visited Nodes: ${res2.visitedNodes.toLocaleString()}`);
const pass3 = res2.distance === resDijk.distance;
console.log(`   Same Optimal Distance Verified: ${pass3 ? 'PASSED ✅' : 'FAILED ❌'}`);

// TEST 4: Blocked Road Scenario on 50k Graph
const firstEdge = largeGraphData.roads[0];
largeGraphData.graph.setRoadBlocked(firstEdge.id, true);

const res4 = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_50k_0",
  targetNodeId: "node_50k_10",
  graph: largeGraphData.graph
});

console.log("\n5. ROAD FAILURE & RE-ROUTING ON 50K GRAPH:");
console.log(`   Blocked Edge: ${firstEdge.id} (${firstEdge.from} -> ${firstEdge.to})`);
console.log(`   New Alternative Distance: ${res4.distance} km`);
const pass4 = res4.status === "FOUND" && res4.distance !== Infinity;
console.log(`   TEST 4 RESULT: ${pass4 ? 'PASSED ✅' : 'FAILED ❌'}`);

// Reset Road
largeGraphData.graph.setRoadBlocked(firstEdge.id, false);

// TEST 5: Unreachable Node Handling on 50k Graph (Regional Trauma Center)
const res5 = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_50k_0",
  targetNodeId: "node_50k_45000", // Regional Trauma Center (disconnected)
  graph: largeGraphData.graph
});

console.log("\n6. UNREACHABLE NODE HANDLING ON 50K GRAPH:");
console.log(`   Status: ${res5.status}`);
console.log(`   Distance: ${res5.distance}`);
const pass5 = res5.distance === Infinity && res5.status === "NO_ROUTE";
console.log(`   TEST 5 RESULT: ${pass5 ? 'PASSED ✅ (Correctly returns Infinity & NO_ROUTE for internal engine)' : 'FAILED ❌'}`);

console.log("\n=================================================");
console.log(" 50,000-NODE SCALABILITY INTEGRATION BENCHMARK COMPLETED");
console.log("=================================================");
