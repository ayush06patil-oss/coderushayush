import { calculateRoute } from '../algorithms/routingEngine.js';

/**
 * Scalable Healthcare-Aware Resource Selection Engine
 * Evaluates candidate hospitals based on medical requirements:
 * 1. Operational status
 * 2. Required specialist availability (e.g. Cardiologist)
 * 3. Hospital bed availability
 * 4. Required medicine stock
 * 5. Road reachability and graph route cost/time using Routing Engine
 * 
 * SCALABILITY OPTIMIZATION: Medical checks run FIRST. Graph routing runs ONLY
 * on medically eligible candidates (and key demo comparison nodes), skipping unneeded A* searches.
 */
export function evaluateHospitals(emergency, hospitals = [], capacity = {}, graph, startNodeId = "node_v_a") {
  if (!emergency || !hospitals || hospitals.length === 0) {
    return {
      selectedHospital: null,
      evaluationList: [],
      error: "No emergency or hospital dataset available"
    };
  }

  const reqType = emergency.type || "Cardiology";

  // Phase 1: Fast Medical Eligibility Check (no A* overhead)
  const initialEvaluations = hospitals.map(h => {
    let isEligible = true;
    let rejectionReason = null;

    // Check 1: Operational Status
    if (h.operational === false) {
      isEligible = false;
      rejectionReason = "Hospital Offline / Non-operational";
    }

    // Check 2: Specialist Availability
    if (isEligible) {
      if (reqType === "Cardiology" && !h.hasCardiologist) {
        isEligible = false;
        rejectionReason = "Cardiologist unavailable";
      } else if (h.specialists && !h.specialists.includes(reqType) && !h.hasCardiologist) {
        isEligible = false;
        rejectionReason = `${reqType} specialist unavailable`;
      }
    }

    // Check 3: Bed Availability
    if (isEligible && (h.bedsAvailable === undefined || h.bedsAvailable <= 0)) {
      isEligible = false;
      rejectionReason = "Hospital beds full (0 available)";
    }

    // Check 4: Medicine Availability
    if (isEligible && capacity.cardiacMedicine) {
      if (reqType === "Cardiology" && capacity.cardiacMedicine.availablePct <= 0) {
        isEligible = false;
        rejectionReason = "Cardiac medicine stock depleted (0%)";
      }
    }

    return {
      hospital: h,
      isEligible,
      rejectionReason
    };
  });

  // Phase 2: Calculate Graph Route ONLY for Medically Eligible (and Key Demo) Hospitals
  const evaluationList = initialEvaluations.map(item => {
    const h = item.hospital;
    const isKeyDemoHospital = h.id === "node_h_b" || h.id === "node_h_c" || h.id === "node_h_e";

    let routeResult = null;
    let isReachable = false;
    let distanceKm = null;
    let travelTimeMin = null;

    // Only run expensive graph routing if medically eligible or key demo hospital
    if ((item.isEligible || isKeyDemoHospital) && graph && startNodeId && h.nearestNodeId || h.id) {
      const targetId = h.nearestNodeId || h.id;
      routeResult = calculateRoute({
        algorithm: "astar",
        startNodeId,
        targetNodeId: targetId,
        graph
      });

      if (routeResult && routeResult.status === "FOUND" && routeResult.distance !== Infinity) {
        isReachable = true;
        distanceKm = routeResult.distance;
        travelTimeMin = routeResult.travelTime;
      }
    }

    let isFinalEligible = item.isEligible && isReachable;
    let rejectionReason = item.rejectionReason;

    if (item.isEligible && !isReachable) {
      isFinalEligible = false;
      rejectionReason = "No road route available (Unreachable)";
    }

    const distanceFormatted = isReachable && distanceKm !== null 
      ? `${distanceKm} km` 
      : "No road route available";

    return {
      hospital: h,
      isEligible: isFinalEligible,
      isReachable,
      rejectionReason,
      routeResult,
      distanceKm,
      travelTimeMin: travelTimeMin || 0,
      distanceFormatted
    };
  });

  // Filter eligible hospitals and sort by graph route travel time
  const eligibleHospitals = evaluationList
    .filter(item => item.isEligible && item.isReachable)
    .sort((a, b) => a.travelTimeMin - b.travelTimeMin);

  const selectedHospitalItem = eligibleHospitals.length > 0 ? eligibleHospitals[0] : null;

  return {
    selectedHospital: selectedHospitalItem ? selectedHospitalItem.hospital : null,
    selectedEvaluation: selectedHospitalItem,
    evaluationList,
    eligibleCount: eligibleHospitals.length
  };
}

/**
 * Selects the best available ambulance based on actual route travel time to emergency village
 */
export function selectBestAmbulance(emergencyVillageNodeId, ambulances = [], graph) {
  const availableUnits = ambulances.filter(a => a.status === "Available" || a.status === "ONLINE" || a.status === "AVAILABLE");

  if (availableUnits.length === 0) {
    return {
      bestAmbulance: null,
      travelTimeMin: null,
      distanceKm: null,
      reason: "No ambulance available in fleet"
    };
  }

  // Evaluate top available units
  const sampleUnits = availableUnits.slice(0, 10);
  const evaluatedUnits = sampleUnits.map(unit => {
    const locNodeId = unit.locationNode || "node_v_d";
    const route = calculateRoute({
      algorithm: "astar",
      startNodeId: locNodeId,
      targetNodeId: emergencyVillageNodeId,
      graph
    });

    const isFound = route && route.status === "FOUND" && route.distance !== Infinity;

    return {
      unit,
      route,
      isFound,
      travelTimeMin: isFound ? route.travelTime : Infinity,
      distanceKm: isFound ? route.distance : Infinity
    };
  }).filter(u => u.isFound).sort((a, b) => a.travelTimeMin - b.travelTimeMin);

  const best = evaluatedUnits[0];

  return {
    bestAmbulance: best ? best.unit : null,
    travelTimeMin: best ? best.travelTimeMin : 0,
    distanceKm: best ? best.distanceKm : 0,
    route: best ? best.route : null
  };
}
