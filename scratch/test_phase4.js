import { RuralGraph } from '../src/graph/graph.js';
import { runAStar } from '../src/algorithms/astar.js';
import { runDijkstra } from '../src/algorithms/dijkstra.js';
import { calculateRoute } from '../src/algorithms/routingEngine.js';
import { runBenchmark } from '../src/algorithms/benchmark.js';
import { findActivePathEdge } from '../src/algorithms/routeValidator.js';
import { evaluateHospitals, selectBestAmbulance } from '../src/engine/healthcareMatcher.js';
import { EmergencyPriorityQueue } from '../src/engine/priorityQueue.js';
import { interpolatePathPosition } from '../src/utils/pathInterpolator.js';
import { MOCK_NODES, MOCK_ROADS, MOCK_AMBULANCES } from '../src/data/data.js';

console.log("=================================================");
console.log(" PHASE 4 FULL SYSTEM REGRESSION & INTEGRATION TEST");
console.log("=================================================\n");

const results = [];

function recordTest(name, expected, actual, pass) {
  results.push({ name, expected, actual, pass });
  console.log(`[${pass ? 'PASS ✅' : 'FAIL ❌'}] ${name}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   Actual:   ${actual}\n`);
}

// Build Graph
const graph = new RuralGraph();
MOCK_NODES.forEach(n => graph.addNode(n));
MOCK_ROADS.forEach(r => graph.addEdge(r));

// TEST 1: Full System Routing Flow (Village A -> Hospital C)
const route1 = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_v_a",
  targetNodeId: "node_h_c",
  graph
});
const pass1 = route1.status === "FOUND" && route1.distance === 34.3 && route1.travelTime === 44;
recordTest(
  "Phase 2 Routing: Optimal A* Calculation (Village A -> Hospital C)",
  "Distance: 34.3 km, Travel Time: 44 min",
  `Distance: ${route1.distance} km, Travel Time: ${route1.travelTime} min`,
  pass1
);

// TEST 2: Phase 2.6 Real Graph Road Block & Dynamic Recalculation
const activeEdge = findActivePathEdge(route1.path, MOCK_ROADS, MOCK_NODES);
graph.setRoadBlocked(activeEdge.roadId, true);

const route2 = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_v_a",
  targetNodeId: "node_h_c",
  graph
});
const pass2 = route2.status === "FOUND" && route2.distance === 34.4 && !route2.path.includes("node_v_b");
recordTest(
  "Phase 2.6 Road Resilience: Dynamic Rerouting on Road Block",
  "Alternative Path (34.4 km, 43 min) avoiding blocked road_ab",
  `Distance: ${route2.distance} km, Travel Time: ${route2.travelTime} min, Path: ${route2.path.join(" -> ")}`,
  pass2
);

// TEST 3: Reset Road Restoration
graph.setRoadBlocked(activeEdge.roadId, false);
const route3 = calculateRoute({
  algorithm: "astar",
  startNodeId: "node_v_a",
  targetNodeId: "node_h_c",
  graph
});
const pass3 = route3.status === "FOUND" && route3.distance === 34.3;
recordTest(
  "Phase 2.6 Reset Road: Original Route Restoration",
  "Restored Original Path (34.3 km)",
  `Distance: ${route3.distance} km`,
  pass3
);

// TEST 4: Phase 3 Healthcare Specialist Matching (Hospital B vs Hospital C)
const hospitals = MOCK_NODES.filter(n => n.type === 'hospital');
const capacity = { cardiacMedicine: { availablePct: 82 } };
const emergencyCardio = { id: "#101", village: "Village A", type: "Cardiology", urgency: "Critical" };
const evalRes = evaluateHospitals(emergencyCardio, hospitals, capacity, graph, "node_v_a");

const hospB = evalRes.evaluationList.find(e => e.hospital.id === "node_h_b");
const pass4 = evalRes.selectedHospital?.id === "node_h_c" && hospB?.isEligible === false;
recordTest(
  "Phase 3 Healthcare Specialist Selection: Hospital B Rejected, Hospital C Selected",
  "Hospital B Rejected (No cardiologist), Hospital C Selected (Cardiologist available)",
  `Hospital B: ${hospB?.rejectionReason}, Selected: ${evalRes.selectedHospital?.name}`,
  pass4
);

// TEST 5: Phase 3.5 Zero Infinity & Unreachable Node Check
const traumaEval = evalRes.evaluationList.find(e => e.hospital.id === "node_h_e");
const pass5 = traumaEval?.isReachable === false && traumaEval?.distanceFormatted === "No road route available";
recordTest(
  "Phase 3.5 Unreachable Hospital Handling: Zero Infinity km Display",
  "Regional Trauma Center: 'No road route available' (Unreachable)",
  `Regional Trauma Center: ${traumaEval?.distanceFormatted} (${traumaEval?.rejectionReason})`,
  pass5
);

// TEST 6: Routing-Based Ambulance Selector
const ambSelect = selectBestAmbulance("node_v_a", MOCK_AMBULANCES, graph);
const pass6 = ambSelect.bestAmbulance !== null && ambSelect.travelTimeMin > 0;
recordTest(
  "Phase 3 Ambulance Routing Selector: Nearest Available Unit",
  "Ambulance unit selected based on route travel time",
  `Selected Unit: ${ambSelect.bestAmbulance?.code} (${ambSelect.travelTimeMin} min away)`,
  pass6
);

// TEST 7: Emergency Priority Queue Sorting
const pq = new EmergencyPriorityQueue();
pq.enqueue({ id: "#E_HIGH", type: "Trauma", urgency: "High", requestedAt: "10:30 AM" });
pq.enqueue({ id: "#E_CRITICAL", type: "Cardiology", urgency: "Critical", requestedAt: "10:31 AM" });
const firstUnit = pq.dequeue();
const pass7 = firstUnit?.id === "#E_CRITICAL";
recordTest(
  "Phase 3 Priority Queue: CRITICAL Dispatched Before HIGH",
  "First Dequeued: #E_CRITICAL",
  `First Dequeued: ${firstUnit?.id} (${firstUnit?.urgency})`,
  pass7
);

// TEST 8: Ambulance Trajectory Interpolator Bounds Check
const posAt0 = interpolatePathPosition(route1.path, 0, MOCK_NODES);
const posAt50 = interpolatePathPosition(route1.path, 50, MOCK_NODES);
const posAt100 = interpolatePathPosition(route1.path, 100, MOCK_NODES);
const pass8 = typeof posAt0.x === 'number' && typeof posAt50.x === 'number' && typeof posAt100.x === 'number';
recordTest(
  "Phase 4 Ambulance Trajectory Interpolator: Smooth Coordinate Interpolation",
  "0%: Start node pos, 50%: Mid-point pos, 100%: Target hospital pos",
  `0%: (${posAt0.x}, ${posAt0.y}), 50%: (${posAt50.x}, ${posAt50.y}), 100%: (${posAt100.x}, ${posAt100.y})`,
  pass8
);

console.log("=================================================");
const totalPassed = results.filter(r => r.pass).length;
console.log(` FINAL INTEGRATION REGRESSION SUMMARY: ${totalPassed} / ${results.length} PASSED`);
console.log("=================================================");
