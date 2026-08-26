import { RuralGraph } from '../src/graph/graph.js';
import { MOCK_NODES, MOCK_ROADS } from '../src/data/data.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';

console.log("=================================================");
console.log(" STANDARD CLEAN MAP & ROUTING VERIFICATION TEST");
console.log("=================================================\n");

const graph = new RuralGraph();
MOCK_NODES.forEach(n => graph.addNode(n));
MOCK_ROADS.forEach(r => graph.addEdge(r));

console.log("1. STANDARD DATASET AUDIT:");
console.log(`   Nodes:     ${MOCK_NODES.length}`);
console.log(`   Roads:     ${MOCK_ROADS.length}`);
console.log(`   Hospitals: ${MOCK_NODES.filter(n => n.type === 'hospital').length}`);
console.log(`   Villages:  ${MOCK_NODES.filter(n => n.type === 'village').length}`);

// Test A* Route Calculation from Village D to Hospital C
const route = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_v_d",
  targetNodeId: "node_h_c",
  graph
});

console.log("\n2. A* ROUTE CALCULATION (Village D -> Hospital C):");
console.log(`   Status:         ${route.status}`);
console.log(`   Distance:       ${route.distance} km`);
console.log(`   Travel Time:    ${route.travelTime} min`);
console.log(`   Path:           ${route.path.join(" -> ")}`);

const passRoute = route.status === "FOUND" && route.distance > 0 && route.path.length > 1;

console.log("\n=================================================");
const finalPass = passRoute;
console.log(` VERDICT: ${finalPass ? 'STANDARD CLEAN MAP VERIFIED ✅' : 'FAILED ❌'}`);
console.log("=================================================");
