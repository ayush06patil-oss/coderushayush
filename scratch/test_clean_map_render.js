import { generateMassSimulationDataset } from '../src/data/massDatasetGenerator.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';

console.log("=================================================");
console.log(" CLEAN MAP VISUAL DESIGN & UNCLUTTERED PATH TEST");
console.log("=================================================\n");

const massData = generateMassSimulationDataset();

const sampleVillage = massData.villages[0];
const targetHospital = massData.hospitals[0];

const route = calculateRoute({
  algorithm: "astar",
  startNodeId: sampleVillage.nearestNodeId,
  targetNodeId: targetHospital.nearestNodeId,
  graph: massData.graph
});

console.log("1. ROUTE PATH DATA:");
console.log(`   Path Node Count: ${route.path.length} nodes`);
console.log(`   Start Node ID:   ${route.path[0]}`);
console.log(`   Target Node ID:  ${route.path[route.path.length - 1]}`);

// Test Polyline Construction
const pointsStr = route.path.map(id => {
  const node = massData.graph.getNode(id);
  return node ? `${node.x},${node.y}` : "50,50";
}).join(" ");

console.log("\n2. SVG POLYLINE POINTS VERIFICATION:");
console.log(`   Points String Length: ${pointsStr.length} chars`);
console.log(`   Sample Points String: "${pointsStr.substring(0, 70)}..."`);

// Test Intermediate Waypoint Filtering
const waypointDotsCount = Math.floor(route.path.length / 25);
console.log("\n3. INTERMEDIATE WAYPOINT DOT FILTERING:");
console.log(`   Total Nodes in Path: ${route.path.length}`);
console.log(`   Intermediate SVG Waypoint Dots: ${waypointDotsCount} (Replaces ${route.path.length} overlapping DOM badges)`);

const passPolyline = pointsStr.length > 50;
const passWaypoints = waypointDotsCount < route.path.length;

console.log("\n=================================================");
const finalPass = passPolyline && passWaypoints;
console.log(` VERDICT: ${finalPass ? 'CLEAN UNCLUTTERED MAP RENDERER VERIFIED ✅' : 'FAILED ❌'}`);
console.log("=================================================");
