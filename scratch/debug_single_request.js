import { generateMassSimulationDataset } from '../src/data/massDatasetGenerator.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';
import { evaluateHospitals } from '../src/engine/healthcareMatcher.js';

console.log("=================================================");
console.log(" SINGLE REQUEST DIAGNOSTIC TRACE");
console.log("=================================================\n");

const massData = generateMassSimulationDataset();

const startId1 = "node_v_d";
const startId2 = "node_50k_0";
const targetId = massData.hospitals[0].nearestNodeId;

console.log(`1. NODE EXISTENCE CHECK:`);
console.log(`   Graph Node Count: ${massData.graph.nodeCount}`);
console.log(`   Graph Edge Count: ${massData.graph.edgeCount}`);
console.log(`   node_v_d exists in graph? ${massData.graph.getNode("node_v_d") ? "YES ✅" : "NO ❌ (ID MISMATCH!)"}`);
console.log(`   node_50k_0 exists in graph? ${massData.graph.getNode("node_50k_0") ? "YES ✅" : "NO ❌"}`);
console.log(`   Target Hospital Node (${targetId}) exists? ${massData.graph.getNode(targetId) ? "YES ✅" : "NO ❌"}`);

console.log(`\n2. ROUTE SEARCH WITH 'node_v_d':`);
const route1 = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_v_d",
  targetNodeId: targetId,
  graph: massData.graph
});
console.log(`   Route Status: ${route1.status}, Distance: ${route1.distance}`);

console.log(`\n3. ROUTE SEARCH WITH VALID 50K NODE 'node_50k_0':`);
const route2 = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_50k_0",
  targetNodeId: targetId,
  graph: massData.graph
});
console.log(`   Route Status: ${route2.status}, Distance: ${route2.distance} km, Travel Time: ${route2.travelTime} min, Visited: ${route2.visitedNodes}`);
