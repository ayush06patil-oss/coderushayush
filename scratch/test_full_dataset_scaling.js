import { MOCK_NODES, MOCK_ROADS } from '../src/data/data.js';
import { generateMassSimulationDataset } from '../src/data/massDatasetGenerator.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';

console.log("=================================================");
console.log(" FULL DATASET MULTI-ENTITY SCALE VERIFICATION");
console.log("=================================================\n");

// 1. STANDARD DEMO MODE DATASET AUDIT
const stdNodes = MOCK_NODES.length;
const stdRoads = MOCK_ROADS.length;
const stdHospitals = MOCK_NODES.filter(n => n.type === 'hospital').length;
const stdVillages = MOCK_NODES.filter(n => n.type === 'village').length;

console.log("1. STANDARD DEMO DATASET:");
console.log(`   Nodes:     ${stdNodes}`);
console.log(`   Roads:     ${stdRoads}`);
console.log(`   Hospitals: ${stdHospitals}`);
console.log(`   Villages:  ${stdVillages}`);

// 2. 50,000-NODE MASS SCALE DATASET AUDIT
const startTime = performance.now();
const massData = generateMassSimulationDataset();
const genTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

const massNodes = massData.totalNodes;
const massRoads = massData.totalEdges;
const massHospitals = massData.hospitals.length;
const massVillages = massData.villages.length;

console.log("\n2. MASS SIMULATION SCALE DATASET:");
console.log(`   Generation Time: ${genTimeMs} ms`);
console.log(`   Nodes:     ${massNodes.toLocaleString()}`);
console.log(`   Roads:     ${massRoads.toLocaleString()}`);
console.log(`   Hospitals: ${massHospitals.toLocaleString()}`);
console.log(`   Villages:  ${massVillages.toLocaleString()}`);

// 3. SAMPLE ROUTING ACROSS SCALED VILLAGES & HOSPITALS
const sampleVillage1 = massData.villages[0];
const sampleVillage2 = massData.villages[100];
const targetHospital = massData.hospitals[0];

const route1 = calculateRoute({
  algorithm: "astar",
  startNodeId: sampleVillage1.nearestNodeId,
  targetNodeId: targetHospital.nearestNodeId,
  graph: massData.graph
});

const route2 = calculateRoute({
  algorithm: "astar",
  startNodeId: sampleVillage2.nearestNodeId,
  targetNodeId: targetHospital.nearestNodeId,
  graph: massData.graph
});

console.log("\n3. SAMPLE ROUTE QUERIES:");
console.log(`   Route 1 (${sampleVillage1.name} -> ${targetHospital.name}): ${route1.status} (${route1.distance} km, ${route1.travelTime} min)`);
console.log(`   Route 2 (${sampleVillage2.name} -> ${targetHospital.name}): ${route2.status} (${route2.distance} km, ${route2.travelTime} min)`);

const passStd = stdNodes > 0 && stdRoads > 0 && stdHospitals > 0 && stdVillages > 0;
const passMass = massNodes >= 50000 && massRoads >= 200000 && massHospitals >= 200 && massVillages >= 4000;
const passRouting = route1.status === "FOUND" && route2.status === "FOUND";

console.log("\n=================================================");
const finalPass = passStd && passMass && passRouting;
console.log(` VERDICT: ${finalPass ? 'FULL DATASET SCALING VERIFIED (NODES, ROADS, HOSPITALS, VILLAGES) ✅' : 'FAILED ❌'}`);
console.log("=================================================");
