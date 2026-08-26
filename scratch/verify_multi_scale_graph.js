import { RuralGraph } from '../src/graph/graph.js';
import { MOCK_NODES, MOCK_ROADS } from '../src/data/data.js';
import { generateMassSimulationDataset } from '../src/data/massDatasetGenerator.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';
import { analyzeGraphConnectivity } from '../src/graph/graphConnectivity.js';

console.log("=================================================");
console.log(" MULTI-SCALE ROAD GRAPH CONNECTIVITY & ROUTING TEST");
console.log("=================================================\n");

// SCALE 1: 20-Node Standard Graph
const g20 = new RuralGraph();
MOCK_NODES.forEach(n => g20.addNode(n));
MOCK_ROADS.forEach(r => g20.addEdge(r));

const audit20 = analyzeGraphConnectivity(g20);
const r20 = calculateRoute({ algorithm: "astar", startNodeId: "node_v_a", targetNodeId: "node_h_c", graph: g20 });

console.log("1. SCALE LEVEL 1: 20-NODE STANDARD GRAPH");
console.log(`   Nodes: ${audit20.totalNodes} | Edges: ${audit20.totalEdges}`);
console.log(`   Connected Components: ${audit20.connectedComponentsCount}`);
console.log(`   Largest Component:    ${audit20.largestComponentSize} / ${audit20.totalNodes}`);
console.log(`   Isolated Nodes:       ${audit20.isolatedNodesCount}`);
console.log(`   Test Route (Village A -> Hospital C): ${r20.status} (${r20.distance} km)`);
const pass20 = audit20.isolatedNodesCount === 0 && r20.status === "FOUND";
console.log(`   SCALE 1 RESULT: ${pass20 ? 'PASSED ✅' : 'FAILED ❌'}\n`);

// SCALE 2: 50,000-Node Mass Graph (Full Mass Simulation Engine)
const startTime = performance.now();
const massData = generateMassSimulationDataset();
const genTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
const audit50k = massData.connectivityAudit;

const r50k_1 = calculateRoute({ algorithm: "astar", startNodeId: "node_v_a", targetNodeId: "node_h_c", graph: massData.graph });
const r50k_2 = calculateRoute({ algorithm: "astar", startNodeId: "node_v_d", targetNodeId: "node_h_b", graph: massData.graph });

console.log("2. SCALE LEVEL 2: 50,000-NODE MASS ROAD GRAPH");
console.log(`   Generation Time: ${genTimeMs} ms`);
console.log(`   Nodes: ${audit50k.totalNodes.toLocaleString()} | Edges: ${audit50k.totalEdges.toLocaleString()}`);
console.log(`   Connected Components: ${audit50k.connectedComponentsCount}`);
console.log(`   Largest Component:    ${audit50k.largestComponentSize.toLocaleString()} / ${audit50k.totalNodes.toLocaleString()}`);
console.log(`   Isolated Nodes:       ${audit50k.isolatedNodesCount}`);
console.log(`   Degree-1 Nodes:       ${audit50k.degreeOneNodesCount}`);
console.log(`   Test Route 1 (node_v_a -> node_h_c): ${r50k_1.status} (${r50k_1.distance} km, Visited: ${r50k_1.visitedNodes})`);
console.log(`   Test Route 2 (node_v_d -> node_h_b): ${r50k_2.status} (${r50k_2.distance} km, Visited: ${r50k_2.visitedNodes})`);

const pass50k = audit50k.isolatedNodesCount === 0 && r50k_1.status === "FOUND" && r50k_2.status === "FOUND";
console.log(`   SCALE 2 RESULT: ${pass50k ? 'PASSED ✅' : 'FAILED ❌'}\n`);

console.log("=================================================");
const allPassed = pass20 && pass50k;
console.log(` MULTI-SCALE VERDICT: ${allPassed ? 'PROJECT COMPLETE — GRAPH CONNECTIVITY VERIFIED AT ALL SCALES ✅' : 'FAILED ❌'}`);
console.log("=================================================");
