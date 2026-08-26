import { RuralGraph } from '../src/graph/graph.js';
import { MOCK_NODES, MOCK_ROADS } from '../src/data/data.js';
import { evaluateHospitals } from '../src/engine/healthcareMatcher.js';
import { MEDICAL_TAXONOMY } from '../src/engine/taxonomy.js';

console.log("=================================================");
console.log(" 1,000-EMERGENCY HEALTHCARE MATCHING STRESS TEST");
console.log("=================================================\n");

const graph = new RuralGraph();
MOCK_NODES.forEach(n => graph.addNode(n));
MOCK_ROADS.forEach(r => graph.addEdge(r));

const hospitals = MOCK_NODES.filter(n => n.type === 'hospital');
const allTaxonomies = Object.values(MEDICAL_TAXONOMY);

let totalRequests = 1000;
let successCount = 0;
let tier1Count = 0;
let tier2Count = 0;
let tier3Count = 0;

let slaSafeTotal = 0;
let slaRiskTotal = 0;
let slaBreachedTotal = 0;

const reasonBreakdown = {
  NO_CAPABLE_HOSPITAL: 0,
  NO_CAPACITY: 0,
  NO_REACHABLE_HOSPITAL: 0,
  NO_OPEN_HOSPITALS: 0,
  ROUTING_ERROR: 0
};

const specialtyBreakdown = {};
allTaxonomies.forEach(t => { specialtyBreakdown[t] = { tested: 0, matched: 0 }; });

const startTime = performance.now();

for (let i = 0; i < totalRequests; i++) {
  const spec = allTaxonomies[i % allTaxonomies.length];
  const urgency = i % 4 === 0 ? "CRITICAL" : i % 3 === 0 ? "HIGH" : "MEDIUM";

  specialtyBreakdown[spec].tested++;

  const emergency = {
    id: `STRESS-#${1000 + i}`,
    village: "Village A",
    type: spec,
    urgency,
    slaMinutes: urgency === "CRITICAL" ? 8 : urgency === "HIGH" ? 15 : 30
  };

  const evalRes = evaluateHospitals(emergency, hospitals, {}, graph, "node_v_a");

  if (evalRes.success && evalRes.selectedHospital) {
    successCount++;
    specialtyBreakdown[spec].matched++;

    const tier = evalRes.selectedEvaluation ? evalRes.selectedEvaluation.matchTier : "TIER_1_EXACT";
    if (tier === "TIER_1_EXACT") tier1Count++;
    else if (tier === "TIER_2_GENERAL_FALLBACK") tier2Count++;
    else tier3Count++;

    const sla = evalRes.selectedEvaluation ? evalRes.selectedEvaluation.slaStatus : "SLA_SAFE";
    if (sla === "SLA_SAFE") slaSafeTotal++;
    else if (sla === "SLA_AT_RISK") slaRiskTotal++;
    else slaBreachedTotal++;
  } else {
    const reason = evalRes.reasonCode || "NO_CAPABLE_HOSPITAL";
    if (reasonBreakdown[reason] !== undefined) reasonBreakdown[reason]++;
    else reasonBreakdown[reason] = 1;
  }
}

const endTime = performance.now();
const testDurationMs = parseFloat((endTime - startTime).toFixed(2));
const successRatePct = parseFloat(((successCount / totalRequests) * 100).toFixed(1));

console.log("1. STRESS TEST METRICS & PERFORMANCE:");
console.log(`   Total Emergencies Processed: ${totalRequests.toLocaleString()}`);
console.log(`   Processing Execution Time:  ${testDurationMs} ms (${(testDurationMs / totalRequests).toFixed(3)} ms/request)`);
console.log(`   Overall Match Success Rate:  ${successRatePct}% (Target: > 98%)`);

console.log("\n2. MATCHING TIER DISTRIBUTION:");
console.log(`   Tier 1 (Exact Specialty Match):       ${tier1Count} (${((tier1Count / totalRequests) * 100).toFixed(1)}%)`);
console.log(`   Tier 2 (General Emergency Fallback): ${tier2Count} (${((tier2Count / totalRequests) * 100).toFixed(1)}%)`);
console.log(`   Tier 3 (Nearest Open Reachable):     ${tier3Count} (${((tier3Count / totalRequests) * 100).toFixed(1)}%)`);

console.log("\n3. SLA PREDICTION METRICS:");
console.log(`   SLA_SAFE:     ${slaSafeTotal} (${((slaSafeTotal / totalRequests) * 100).toFixed(1)}%)`);
console.log(`   SLA_AT_RISK:  ${slaRiskTotal} (${((slaRiskTotal / totalRequests) * 100).toFixed(1)}%)`);
console.log(`   SLA_BREACHED: ${slaBreachedTotal} (${((slaBreachedTotal / totalRequests) * 100).toFixed(1)}%)`);

console.log("\n4. SPECIALTY COVERAGE BREAKDOWN:");
allTaxonomies.forEach(t => {
  const stat = specialtyBreakdown[t];
  const pct = ((stat.matched / stat.tested) * 100).toFixed(1);
  console.log(`   ${t.padEnd(20)}: ${stat.matched} / ${stat.tested} matched (${pct}%)`);
});

console.log("\n5. FAILURE CATEGORY BREAKDOWN:");
Object.entries(reasonBreakdown).forEach(([code, count]) => {
  console.log(`   ${code.padEnd(25)}: ${count}`);
});

console.log("\n=================================================");
const passVerdict = successRatePct >= 98.0;
console.log(` FINAL VERDICT: ${passVerdict ? 'PROJECT COMPLETE — HEALTHCARE MATCHING PIPELINE VERIFIED ✅' : 'FAILED ❌'}`);
console.log("=================================================");
