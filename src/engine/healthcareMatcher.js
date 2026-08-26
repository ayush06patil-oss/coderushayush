import { calculateRoute } from '../algorithms/routingEngine.js';

/**
 * Healthcare-Aware Resource Selection Engine
 * Evaluates candidate hospitals based on medical requirements:
 * 1. Operational status
 * 2. Required specialist availability (e.g. Cardiologist)
 * 3. Hospital bed availability
 * 4. Required medicine stock
 * 5. Actual graph route cost/time using existing Routing Engine
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

  const evaluationList = hospitals.map(h => {
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

    // Calculate actual graph route distance and travel time to hospital if graph provided
    let routeResult = null;
    if (graph) {
      routeResult = calculateRoute({
        algorithm: "astar",
        startNodeId,
        targetNodeId: h.id,
        graph
      });
    }

    return {
      hospital: h,
      isEligible,
      rejectionReason,
      routeResult,
      distanceKm: routeResult?.distance || h.distanceKm || 0,
      travelTimeMin: routeResult?.travelTime || 0
    };
  });

  // Filter eligible hospitals and sort by graph route travel time
  const eligibleHospitals = evaluationList
    .filter(item => item.isEligible && item.routeResult?.status === "FOUND")
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
  const availableUnits = ambulances.filter(a => a.status === "Available" || a.status === "ONLINE");

  if (availableUnits.length === 0) {
    return {
      bestAmbulance: null,
      travelTimeMin: null,
      distanceKm: null,
      reason: "No ambulance available in fleet"
    };
  }

  const evaluatedUnits = availableUnits.map(unit => {
    const locNodeId = unit.locationNode || "node_v_d";
    const route = calculateRoute({
      algorithm: "astar",
      startNodeId: locNodeId,
      targetNodeId: emergencyVillageNodeId,
      graph
    });

    return {
      unit,
      route,
      travelTimeMin: route.status === "FOUND" ? route.travelTime : Infinity,
      distanceKm: route.status === "FOUND" ? route.distance : Infinity
    };
  }).sort((a, b) => a.travelTimeMin - b.travelTimeMin);

  const best = evaluatedUnits[0];

  return {
    bestAmbulance: best ? best.unit : null,
    travelTimeMin: best ? best.travelTimeMin : 0,
    distanceKm: best ? best.distanceKm : 0,
    route: best ? best.route : null
  };
}
