import { generateMassSimulationDataset } from '../src/data/massDatasetGenerator.js';
import { evaluateHospitals } from '../src/engine/healthcareMatcher.js';

console.log("=================================================");
console.log(" MOCK DATA HOSPITAL AVAILABILITY & ROUTE TEST");
console.log("=================================================\n");

const massData = generateMassSimulationDataset();
const sampleHospitals = massData.hospitals.slice(0, 30);

const testScenarios = [
  { id: "#621", village: "Village A", type: "Cardiology", urgency: "Critical" },
  { id: "#622", village: "Village B", type: "Trauma", urgency: "High" },
  { id: "#623", village: "Village D", type: "Pregnancy", urgency: "Medium" }
];

let allPassed = true;

testScenarios.forEach((emergency) => {
  const evalRes = evaluateHospitals(emergency, sampleHospitals, {}, massData.graph, "node_50k_0");
  const selected = evalRes.selectedHospital;
  const isOk = !!selected && evalRes.eligibleCount > 0;

  if (!isOk) allPassed = false;

  console.log(`Emergency ${emergency.id} (${emergency.village} -> ${emergency.type}):`);
  console.log(`   Selected Hospital: ${selected ? selected.name : 'NONE ❌'}`);
  console.log(`   Eligible Count:    ${evalRes.eligibleCount}`);
  console.log(`   Route Distance:    ${evalRes.selectedEvaluation ? evalRes.selectedEvaluation.distanceFormatted : 'N/A'}`);
  console.log(`   Status:            ${isOk ? 'PASSED ✅' : 'FAILED ❌'}\n`);
});

console.log("=================================================");
console.log(` VERDICT: ${allPassed ? 'ALL MOCK HOSPITALS & ROUTES AVAILABLE ✅' : 'FAILED ❌'}`);
console.log("=================================================");
