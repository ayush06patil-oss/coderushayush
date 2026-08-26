/**
 * Initial Mock Dataset for Rural Healthcare Routing System
 * Contains mock geographic nodes, road network edges, ambulance telemetry,
 * doctor roster, and inventory state for Phase 1.5 state management.
 */

export const MOCK_NODES = [
  { id: "node_v_a", name: "Village A", type: "village", x: 22, y: 32, population: 1450 },
  { id: "node_v_b", name: "Village B", type: "village", x: 42, y: 32, population: 2100 },
  { id: "node_v_d", name: "Village D", type: "village", x: 51, y: 56, population: 980 },
  { id: "node_v_c", name: "Village C", type: "village", x: 15, y: 65, population: 1200 },
  { id: "node_v_e", name: "Village E", type: "village", x: 75, y: 28, population: 850 },
  { id: "node_v_f", name: "Village F", type: "village", x: 82, y: 68, population: 1650 },
  { id: "node_v_g", name: "Village G", type: "village", x: 30, y: 82, population: 720 },
  { id: "node_v_h", name: "Village H", type: "village", x: 62, y: 82, population: 1100 },

  // Hospitals with specialty & bed state
  { 
    id: "node_h_a", 
    name: "Hospital A", 
    type: "hospital", 
    x: 64, 
    y: 38, 
    bedsTotal: 60, 
    bedsAvailable: 45,
    distanceKm: 18,
    specialists: ["General", "Orthopedics", "Pediatrics"],
    hasCardiologist: false
  },
  { 
    id: "node_h_b", 
    name: "Hospital B", 
    type: "hospital", 
    x: 68, 
    y: 65, 
    bedsTotal: 40, 
    bedsAvailable: 18,
    distanceKm: 10,
    specialists: ["Trauma", "General"],
    hasCardiologist: false // Key constraint for Cardiology demo scenario
  },
  { 
    id: "node_h_c", 
    name: "Hospital C", 
    type: "hospital", 
    x: 88, 
    y: 42, 
    bedsTotal: 100, 
    bedsAvailable: 72,
    distanceKm: 25,
    specialists: ["Cardiology", "Neurology", "ICU", "Trauma"],
    hasCardiologist: true // Key constraint for Cardiology demo scenario
  },
  { 
    id: "node_h_d", 
    name: "Hospital D", 
    type: "hospital", 
    x: 10, 
    y: 20, 
    bedsTotal: 50, 
    bedsAvailable: 22, 
    distanceKm: 14,
    specialists: ["General", "Pediatrics"],
    hasCardiologist: false 
  },
  { 
    id: "node_h_e", 
    name: "Regional Trauma Center", 
    type: "hospital", 
    x: 85, 
    y: 88, 
    bedsTotal: 150, 
    bedsAvailable: 95, 
    distanceKm: 32,
    specialists: ["Trauma", "Cardiology", "Neurology", "Orthopedics"],
    hasCardiologist: true 
  },

  // Health Centers
  { id: "node_hc_1", name: "Health Center", type: "health_center", x: 29, y: 55, capacity: 12 },
  { id: "node_hc_2", name: "North Clinic", type: "health_center", x: 48, y: 15, capacity: 8 },
  { id: "node_hc_3", name: "Valley Health Post", type: "health_center", x: 45, y: 78, capacity: 10 },

  // Pharmacies
  { id: "node_ph_1", name: "Central Meds Store", type: "pharmacy", x: 38, y: 45 },
  { id: "node_ph_2", name: "East Regional Pharmacy", type: "pharmacy", x: 78, y: 52 },
  { id: "node_ph_3", name: "Apex Pharma Hub", type: "pharmacy", x: 20, y: 40 }
];

export const MOCK_ROADS = [
  { id: "road_ab", name: "Route A-B", from: "node_v_a", to: "node_v_b", distance: 9.5, travelTime: 12, blocked: false, isSelected: true },
  { id: "road_bd", name: "Route B-D", from: "node_v_b", to: "node_v_d", distance: 5.2, travelTime: 7, blocked: false, isSelected: true },
  { id: "road_db", name: "Route D-HospB", from: "node_v_d", to: "node_h_b", distance: 4.1, travelTime: 5, blocked: false, isSelected: true },

  // Blocked Road R17 (Village B -> Hospital A)
  { id: "road_r17", name: "R17 Highway", from: "node_v_b", to: "node_h_a", distance: 11.0, travelTime: 14, blocked: true, isSelected: false },

  // Alternative Roads
  { id: "road_ahc", name: "Route A-HC", from: "node_v_a", to: "node_hc_1", distance: 6.8, travelTime: 8, blocked: false, isSelected: false },
  { id: "road_hc_d", name: "Route HC-D", from: "node_hc_1", to: "node_v_d", distance: 8.0, travelTime: 10, blocked: false, isSelected: false },
  { id: "road_hab", name: "Route HospA-HospB", from: "node_h_a", to: "node_h_b", distance: 12.3, travelTime: 15, blocked: false, isSelected: false },
  { id: "road_hac", name: "Route HospA-HospC", from: "node_h_a", to: "node_h_c", distance: 14.0, travelTime: 18, blocked: false, isSelected: false },
  { id: "road_hbc", name: "Route HospB-HospC", from: "node_h_b", to: "node_h_c", distance: 15.5, travelTime: 20, blocked: false, isSelected: false },
  { id: "road_ve_ha", name: "Route E-HospA", from: "node_v_e", to: "node_h_a", distance: 7.2, travelTime: 9, blocked: false, isSelected: false },
  { id: "road_ve_hc", name: "Route E-HospC", from: "node_v_e", to: "node_h_c", distance: 8.8, travelTime: 11, blocked: false, isSelected: false },
  { id: "road_vf_hb", name: "Route F-HospB", from: "node_v_f", to: "node_h_b", distance: 10.4, travelTime: 13, blocked: false, isSelected: false },
  { id: "road_vg_hc1", name: "Route G-HC", from: "node_v_g", to: "node_hc_1", distance: 5.5, travelTime: 7, blocked: false, isSelected: false },
  { id: "road_vh_vd", name: "Route H-D", from: "node_v_h", to: "node_v_d", distance: 9.0, travelTime: 11, blocked: false, isSelected: false },
  { id: "road_vc_ahc", name: "Route C-HC", from: "node_v_c", to: "node_hc_1", distance: 4.2, travelTime: 6, blocked: false, isSelected: false },
  { id: "road_hd_va", name: "Route HospD-A", from: "node_h_d", to: "node_v_a", distance: 11.2, travelTime: 14, blocked: false, isSelected: false }
];

export const MOCK_AMBULANCES = [
  { id: "amb_04", code: "Ambulance #04", status: "En Route", driver: "Ramesh Kumar", locationNode: "node_v_d", targetNode: "node_h_b", speed: 58, eta: "12 min", progressPct: 75, patientType: "Critical" },
  { id: "amb_01", code: "Ambulance #01", status: "Available", driver: "Suresh P.", locationNode: "node_h_a", speed: 0, eta: "--", progressPct: 0 },
  { id: "amb_02", code: "Ambulance #02", status: "Available", driver: "Vikram S.", locationNode: "node_hc_1", speed: 0, eta: "--", progressPct: 0 },
  { id: "amb_03", code: "Ambulance #03", status: "Available", driver: "Anil M.", locationNode: "node_h_d", speed: 0, eta: "--", progressPct: 0 },
  { id: "amb_05", code: "Ambulance #05", status: "Available", driver: "Mohan K.", locationNode: "node_h_c", speed: 0, eta: "--", progressPct: 0 },
  { id: "amb_06", code: "Ambulance #06", status: "Available", driver: "Deepak R.", locationNode: "node_v_b", speed: 0, eta: "--", progressPct: 0 },
  { id: "amb_07", code: "Ambulance #07", status: "Available", driver: "Rajesh N.", locationNode: "node_h_b", speed: 0, eta: "--", progressPct: 0 },
  { id: "amb_08", code: "Ambulance #08", status: "Available", driver: "Pravin B.", locationNode: "node_h_e", speed: 0, eta: "--", progressPct: 0 }
];

export const MOCK_DOCTORS = [
  { id: "doc_1", name: "Dr. Patel", specialty: "Cardiology", hospital: "Hospital C", status: "On-Duty" },
  { id: "doc_2", name: "Dr. Sharma", specialty: "Neurology", hospital: "Hospital C", status: "On-Call" },
  { id: "doc_3", name: "Dr. Rao", specialty: "Orthopedics", hospital: "Hospital A", status: "On-Duty" },
  { id: "doc_4", name: "Dr. Gupta", specialty: "General Medicine", hospital: "Hospital B", status: "On-Duty" },
  { id: "doc_5", name: "Dr. Singh", specialty: "Trauma Surgery", hospital: "Hospital B", status: "On-Duty" }
];

export const INITIAL_EMERGENCY = {
  id: "#101",
  village: "Village A",
  type: "Cardiology",
  urgency: "Critical",
  requestedAt: "10:32 AM",
  assignedAmbulance: "Ambulance #04",
  assignedDoctor: "Dr. Patel",
  assignedHospital: "Hospital B",
  status: "En Route",
  distance: "14.2 km",
  estimatedTime: "12 min",
  via: "Village B → Village D",
  isDemoScenario: true
};

export const INITIAL_LOGS = [
  { id: 1, time: "10:32:01", type: "create", text: "Emergency #101 Created (Village A - Cardiology)" },
  { id: 2, time: "10:32:05", type: "assign", text: "Ambulance #04 Assigned to Emergency #101" },
  { id: 3, time: "10:32:10", type: "route", text: "Route Request Created" },
  { id: 4, time: "10:33:20", type: "warning", text: "Road R17 Blocked" },
  { id: 5, time: "10:33:21", type: "engine", text: "Routing Engine Waiting for Phase 2" }
];

export const INITIAL_CAPACITY = {
  hospitalBeds: { hospital: "Hospital C", available: 72, total: 100, pct: 72 },
  cardiacMedicine: { item: "Cardiac Medicine", availablePct: 82, status: "Available" }
};
