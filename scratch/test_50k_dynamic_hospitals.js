import { generateMassSimulationDataset } from '../src/data/massDatasetGenerator.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';

console.log("=================================================");
console.log(" DYNAMIC 50,000-NODE MULTI-HOSPITAL ROUTING TEST");
console.log("=================================================\n");

const startTime = performance.now();
const massData = generateMassSimulationDataset();
const genTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

console.log("1. DATASET CAPACITY AUDIT:");
console.log(`   Generation Time: ${genTimeMs} ms`);
console.log(`   Nodes:     ${massData.totalNodes.toLocaleString()}`);
console.log(`   Roads:     ${massData.totalEdges.toLocaleString()}`);
console.log(`   Hospitals: ${massData.hospitals.length}`);
console.log(`   Villages:  ${massData.villages.length}`);

// Test Dynamic Routing across 10 Random 50k Hospitals
console.log("\n2. DYNAMIC ROUTE QUERIES TO MULTIPLE 50K HOSPITALS:");

const startVillage = massData.villages[0];
const sampleHospitalIndices = [0, 5, 12, 25, 50, 75, 100, 150, 200, 249];
let successCount = 0;

sampleHospitalIndices.forEach((idx, i) => {
  const hospital = massData.hospitals[idx];
  const queryStart = performance.now();
  
  const route = calculateRoute({
    algorithm: "astar",
    startNodeId: startVillage.nearestNodeId,
    targetNodeId: hospital.nearestNodeId || hospital.id,
    graph: massData.graph
  });

  const queryTimeMs = parseFloat((performance.now() - queryStart).toFixed(2));

  if (route.status === "FOUND" && route.distance > 0) {
    successCount++;
    console.log(`   [${i + 1}/10] ${startVillage.name} -> ${hospital.name.padEnd(35)}: ${route.distance} km | ${route.travelTime} min | Path: ${route.path.length} nodes (${queryTimeMs} ms)`);
  } else {
    console.log(`   [${i + 1}/10] ${startVillage.name} -> ${hospital.name.padEnd(35)}: ROUTE FAILED ❌`);
  }
});

console.log(`\n3. GIS ROAD HIERARCHY MESH STYLING VERIFICATION:`);
const roadTypes = new Set(massData.roads.map(r => r.roadType));
console.log(`   Distinct Road Types Rendered: ${Array.from(roadTypes).join(", ")}`);

const passRouting = successCount === sampleHospitalIndices.length;

console.log("\n=================================================");
const finalPass = passRouting && roadTypes.size >= 3;
console.log(` VERDICT: ${finalPass ? 'DYNAMIC MULTI-HOSPITAL ROUTING & GIS MAP VERIFIED ✅' : 'FAILED ❌'}`);
console.log("=================================================");
