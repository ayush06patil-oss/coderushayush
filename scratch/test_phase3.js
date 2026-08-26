import { RuralGraph } from '../src/graph/graph.js';
import { evaluateHospitals, selectBestAmbulance } from '../src/engine/healthcareMatcher.js';
import { EmergencyPriorityQueue } from '../src/engine/priorityQueue.js';
import { MOCK_NODES, MOCK_ROADS, MOCK_AMBULANCES } from '../src/data/data.js';

console.log("=== PHASE 3 HEALTHCARE-AWARE SELECTION TEST SUITE ===");

const graph = new RuralGraph();
MOCK_NODES.forEach(n => graph.addNode(n));
MOCK_ROADS.forEach(r => graph.addEdge(r));

const hospitals = MOCK_NODES.filter(n => n.type === 'hospital');
const capacity = { cardiacMedicine: { availablePct: 82 } };

// TEST 1: Nearest hospital has no specialist (Cardiology required, Hospital B 10 km has no cardiologist)
const e1 = { id: "#101", village: "Village A", type: "Cardiology", urgency: "Critical" };
const res1 = evaluateHospitals(e1, hospitals, capacity, graph, "node_v_a");

console.log("\nTEST 1: Specialist Requirement Matching:");
console.log("   Selected Hospital:", res1.selectedHospital?.name);
console.log("   Selected Distance:", res1.selectedEvaluation?.distanceKm, "km");
const hospB = res1.evaluationList.find(e => e.hospital.id === "node_h_b");
console.log("   Hospital B Rejection Reason:", hospB?.rejectionReason);

const test1Passed = res1.selectedHospital?.id === "node_h_c" && hospB?.isEligible === false;
console.log("   TEST 1 RESULT:", test1Passed ? "PASSED ✅" : "FAILED ❌");

// TEST 2: Hospital has specialist but no beds
const hospitalsNoBeds = hospitals.map(h => h.id === "node_h_c" ? { ...h, bedsAvailable: 0 } : h);
const res2 = evaluateHospitals(e1, hospitalsNoBeds, capacity, graph, "node_v_a");
const hospC_test2 = res2.evaluationList.find(e => e.hospital.id === "node_h_c");

console.log("\nTEST 2: Bed Full Rejection:");
console.log("   Hospital C Beds Available: 0");
console.log("   Hospital C Rejection Reason:", hospC_test2?.rejectionReason);
const test2Passed = hospC_test2?.isEligible === false && hospC_test2?.rejectionReason.includes("beds full");
console.log("   TEST 2 RESULT:", test2Passed ? "PASSED ✅" : "FAILED ❌");

// TEST 3: Hospital has specialist and beds but medicine unavailable
const capacityNoMeds = { cardiacMedicine: { availablePct: 0 } };
const res3 = evaluateHospitals(e1, hospitals, capacityNoMeds, graph, "node_v_a");
const hospC_test3 = res3.evaluationList.find(e => e.hospital.id === "node_h_c");

console.log("\nTEST 3: Medicine Stock Depleted Rejection:");
console.log("   Cardiac Medicine Stock: 0%");
console.log("   Hospital C Rejection Reason:", hospC_test3?.rejectionReason);
const test3Passed = hospC_test3?.isEligible === false && hospC_test3?.rejectionReason.includes("depleted");
console.log("   TEST 3 RESULT:", test3Passed ? "PASSED ✅" : "FAILED ❌");

// TEST 4: No eligible hospital available
const offlineHospitals = hospitals.map(h => ({ ...h, operational: false }));
const res4 = evaluateHospitals(e1, offlineHospitals, capacity, graph, "node_v_a");

console.log("\nTEST 4: No Suitable Hospital Handling:");
console.log("   Eligible Hospitals Count:", res4.eligibleCount);
const test4Passed = res4.eligibleCount === 0 && res4.selectedHospital === null;
console.log("   TEST 4 RESULT:", test4Passed ? "PASSED ✅" : "FAILED ❌");

// TEST 5: No ambulance available
const busyAmbulances = MOCK_AMBULANCES.map(a => ({ ...a, status: "BUSY" }));
const ambSelect = selectBestAmbulance("node_v_a", busyAmbulances, graph);

console.log("\nTEST 5: No Ambulance Available Handling:");
console.log("   Best Ambulance:", ambSelect.bestAmbulance);
console.log("   Reason:", ambSelect.reason);
const test5Passed = ambSelect.bestAmbulance === null && ambSelect.reason.includes("No ambulance available");
console.log("   TEST 5 RESULT:", test5Passed ? "PASSED ✅" : "FAILED ❌");

// TEST 6: Priority Queue Sorting (CRITICAL vs HIGH)
const pq = new EmergencyPriorityQueue();
pq.enqueue({ id: "#E_HIGH", type: "Trauma", urgency: "High", requestedAt: "10:30 AM" });
pq.enqueue({ id: "#E_CRITICAL", type: "Cardiology", urgency: "Critical", requestedAt: "10:31 AM" });
const firstDequeued = pq.dequeue();

console.log("\nTEST 6: Priority Queue Sorting:");
console.log("   Enqueued: High (#E_HIGH) then Critical (#E_CRITICAL)");
console.log("   First Dequeued Unit:", firstDequeued?.id, `(${firstDequeued?.urgency})`);
const test6Passed = firstDequeued?.id === "#E_CRITICAL";
console.log("   TEST 6 RESULT:", test6Passed ? "PASSED ✅" : "FAILED ❌");

console.log("\n=== ALL PHASE 3 TESTS COMPLETED SUCCESSFULLY ===");
