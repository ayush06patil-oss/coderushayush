import { generateMassSimulationDataset } from '../src/data/massDatasetGenerator.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';

console.log("=================================================");
console.log(" ORGANIC GEOGRAPHIC NETWORK TOPOLOGY MAP TEST");
console.log("=================================================\n");

const startTime = performance.now();
const massData = generateMassSimulationDataset();
const genTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

console.log("1. DATASET CAPACITY & TOPOLOGY METRICS:");
console.log(`   Generation Time: ${genTimeMs} ms`);
console.log(`   Nodes:     ${massData.totalNodes.toLocaleString()}`);
console.log(`   Roads:     ${massData.totalEdges.toLocaleString()}`);
console.log(`   Hospitals: ${massData.hospitals.length}`);
console.log(`   Villages:  ${massData.villages.length}`);

// Test Organic Distance Weights
const sampleRoadDistances = massData.roads.slice(0, 10).map(r => r.distance);
console.log("\n2. EXPLICIT ORGANIC ROAD DISTANCES (Matching Reference Image):");
console.log(`   Sample Distance Numbers: [ ${sampleRoadDistances.join(", ")} ] km`);

// Test A* Route Calculation along Network Edges
const route = calculateRoute({
  algorithm: "astar",
  startNodeId: massData.villages[0].nearestNodeId,
  targetNodeId: massData.hospitals[0].nearestNodeId,
  graph: massData.graph
});

console.log("\n3. CALCULATED ROUTE ALONG ORGANIC NETWORK EDGES:");
console.log(`   Status:         ${route.status}`);
console.log(`   Path Node Count: ${route.path.length} nodes`);
console.log(`   Total Distance:  ${route.distance} km`);
console.log(`   Travel Time:     ${route.travelTime} min`);

const passDistances = sampleRoadDistances.every(d => d > 0);
const passRoute = route.status === "FOUND" && route.distance > 0;

console.log("\n=================================================");
const finalPass = passDistances && passRoute;
console.log(` VERDICT: ${finalPass ? 'ORGANIC NETWORK TOPOLOGY MAP VERIFIED ✅' : 'FAILED ❌'}`);
console.log("=================================================");
