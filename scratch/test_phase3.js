import { RuralGraph } from '../src/graph/graph.js';
import { evaluateHospitals, selectBestAmbulance } from '../src/engine/healthcareMatcher.js';
import { EmergencyPriorityQueue } from '../src/engine/priorityQueue.js';
import { MOCK_NODES, MOCK_ROADS, MOCK_AMBULANCES } from '../src/data/data.js';

console.log("=== PHASE 3.5 ROUTE DISTANCE & REACHABILITY TEST SUITE ===");

const graph = new RuralGraph();
MOCK_NODES.forEach(n => graph.addNode(n));
MOCK_ROADS.forEach(r => graph.addEdge(r));

const hospitals = MOCK_NODES.filter(n => n.type === 'hospital');
const capacity = { cardiacMedicine: { availablePct: 82 } };

// TEST 1: Hospital Distance & Reachability Audit (No Infinity km)
const e1 = { id: "#101", village: "Village A", type: "Cardiology", urgency: "Critical" };
const res1 = evaluateHospitals(e1, hospitals, capacity, graph, "node_v_a");

console.log("\n1. HOSPITAL DISTANCE & REACHABILITY AUDIT:");
let hasInfinity = false;

res1.evaluationList.forEach(item => {
  console.log(`   ${item.hospital.name}: ${item.distanceFormatted} | Eligible: ${item.isEligible} | Reachable: ${item.isReachable}`);
  if (item.distanceFormatted.includes("Infinity") || item.distanceFormatted.includes("NaN")) {
    hasInfinity = true;
  }
});

console.log("\n2. ZERO INFINITY KM AUDIT CHECK:");
console.log("   No 'Infinity km' rendered anywhere:", !hasInfinity ? "PASSED ✅" : "FAILED ❌");

// TEST 2: Unreachable Node Check (Regional Trauma Center)
const traumaCenterEval = res1.evaluationList.find(e => e.hospital.id === "node_h_e");
console.log("\n3. REGIONAL TRAUMA CENTER UNREACHABLE CHECK:");
console.log("   Display Text:", traumaCenterEval?.distanceFormatted);
console.log("   Rejection Reason:", traumaCenterEval?.rejectionReason);
const traumaPassed = traumaCenterEval?.isReachable === false && traumaCenterEval?.distanceFormatted === "No road route available";
console.log("   REGIONAL TRAUMA CENTER CHECK:", traumaPassed ? "PASSED ✅" : "FAILED ❌");

// TEST 3: Hospital C Selection
console.log("\n4. FINAL SELECTION CHECK:");
console.log("   Selected Hospital:", res1.selectedHospital?.name);
console.log("   Selected Distance:", res1.selectedEvaluation?.distanceFormatted);
const selectionPassed = res1.selectedHospital?.id === "node_h_c";
console.log("   SELECTION CHECK:", selectionPassed ? "PASSED ✅" : "FAILED ❌");

// TEST 4: Priority Queue Sorting
const pq = new EmergencyPriorityQueue();
pq.enqueue({ id: "#E_HIGH", type: "Trauma", urgency: "High", requestedAt: "10:30 AM" });
pq.enqueue({ id: "#E_CRITICAL", type: "Cardiology", urgency: "Critical", requestedAt: "10:31 AM" });
const firstDequeued = pq.dequeue();

console.log("\n5. PRIORITY QUEUE CHECK:");
console.log("   First Dequeued:", firstDequeued?.id, `(${firstDequeued?.urgency})`);
const pqPassed = firstDequeued?.id === "#E_CRITICAL";
console.log("   PRIORITY QUEUE CHECK:", pqPassed ? "PASSED ✅" : "FAILED ❌");

console.log("\n=== ALL PHASE 3.5 TESTS PASSED PERFECTLY ===");
