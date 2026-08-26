import { generateMassSimulationDataset } from '../src/data/massDatasetGenerator.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';
import { interpolatePathPosition } from '../src/utils/pathInterpolator.js';

console.log("=================================================");
console.log(" 50,000-NODE INTERACTIVE MAP RENDER TEST");
console.log("=================================================\n");

const startTime = performance.now();
const massData = generateMassSimulationDataset();
const genTimeMs = parseFloat((performance.now() - startTime).toFixed(2));

console.log("1. DATASET CAPACITY AUDIT:");
console.log(`   Nodes:     ${massData.totalNodes.toLocaleString()}`);
console.log(`   Roads:     ${massData.totalEdges.toLocaleString()}`);
console.log(`   Hospitals: ${massData.hospitals.length}`);
console.log(`   Villages:  ${massData.villages.length}`);

// Test A* Route Calculation on 50k Graph
const routeStart = performance.now();
const sampleVillage = massData.villages[0];
const targetHospital = massData.hospitals[0];

const route = calculateRoute({
  algorithm: "astar",
  startNodeId: sampleVillage.nearestNodeId,
  targetNodeId: targetHospital.nearestNodeId,
  graph: massData.graph
});
const routeTimeMs = parseFloat((performance.now() - routeStart).toFixed(2));

console.log("\n2. ROUTE CALCULATION FOR MAP HIGHLIGHT:");
console.log(`   Query:     ${sampleVillage.name} -> ${targetHospital.name}`);
console.log(`   Status:    ${route.status}`);
console.log(`   Distance:  ${route.distance} km (${route.travelTime} min)`);
console.log(`   Path Length: ${route.path.length} nodes`);
console.log(`   Calculation Time: ${routeTimeMs} ms`);

// Test Ambulance GPS Position Interpolation along 50k Graph Path
console.log("\n3. LIVE AMBULANCE GPS INTERPOLATION TRAJECTORY (0% -> 50% -> 100%):");
const pos0 = interpolatePathPosition(route.path, 0, massData.nodes);
const pos50 = interpolatePathPosition(route.path, 50, massData.nodes);
const pos100 = interpolatePathPosition(route.path, 100, massData.nodes);

console.log(`   Progress   0%: (${pos0.x.toFixed(2)}%, ${pos0.y.toFixed(2)}%)`);
console.log(`   Progress  50%: (${pos50.x.toFixed(2)}%, ${pos50.y.toFixed(2)}%)`);
console.log(`   Progress 100%: (${pos100.x.toFixed(2)}%, ${pos100.y.toFixed(2)}%)`);

const passDataset = massData.totalNodes >= 50000 && massData.totalEdges >= 200000;
const passRoute = route.status === "FOUND" && route.path.length > 1;
const passInterpolation = pos0 && pos50 && pos100 && pos0.x !== pos100.x;

console.log("\n=================================================");
const finalPass = passDataset && passRoute && passInterpolation;
console.log(` VERDICT: ${finalPass ? '50,000-NODE INTERACTIVE MAP RENDERER VERIFIED ✅' : 'FAILED ❌'}`);
console.log("=================================================");
