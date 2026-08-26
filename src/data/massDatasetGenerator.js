import { RuralGraph } from '../graph/graph.js';

/**
 * Deterministic 50,000+ Node & 200,000+ Edge Mass Simulation Generator
 * Generates:
 * - 50,000 Routing Nodes
 * - 200,000+ Weighted Road Edges (Highways, State Highways, District & Rural Roads)
 * - 5,000 Geographic Locations (4,000 Villages, 250 Hospitals, 400 Health Centers, 250 Clinics, 100 Emergency Centers)
 * - 100 Ambulances
 * - 5,000 Patient Emergency Requests with SLA Time-Window Tracking
 * - Sub-millisecond Grid Spatial Indexing for Node Snapping
 */

export class GridSpatialIndex {
  constructor(cols = 50, rows = 50) {
    this.cols = cols;
    this.rows = rows;
    this.grid = new Map();
  }

  getKey(x, y) {
    const c = Math.min(this.cols - 1, Math.max(0, Math.floor((x / 100) * this.cols)));
    const r = Math.min(this.rows - 1, Math.max(0, Math.floor((y / 100) * this.rows)));
    return `${c}_${r}`;
  }

  insert(node) {
    const key = this.getKey(node.x, node.y);
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key).push(node);
  }

  findNearestNode(x, y, nodes) {
    const key = this.getKey(x, y);
    const bucket = this.grid.get(key);

    if (bucket && bucket.length > 0) {
      let minDist = Infinity;
      let nearest = bucket[0];
      for (const node of bucket) {
        const dx = node.x - x;
        const dy = node.y - y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          nearest = node;
        }
      }
      return nearest;
    }

    // Fallback: scan sample nodes
    let minDist = Infinity;
    let nearest = nodes[0];
    const sampleStep = Math.max(1, Math.floor(nodes.length / 500));
    for (let i = 0; i < nodes.length; i += sampleStep) {
      const node = nodes[i];
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    }
    return nearest;
  }
}

const INDIAN_VILLAGE_PREFIXES = ["Khed", "Vadgaon", "Pangri", "Shirol", "Barsi", "Mohol", "Aundh", "Pirangut", "Chakan", "Manchar", "Junur", "Saswad", "Indapur", "Malshiras", "Sangola", "Pandharpur", "Karmala", "Phaltan", "Wai", "Karad"];
const INDIAN_FACILITY_NAMES = ["District Civil Hospital Solapur", "Shri Chhatrapati Shivaji Hospital", "Sanjivani Multispecialty Hospital", "Dhanwantari Rural Hospital", "Apex Trauma Center", "Anand Rural Clinic", "Sub-District Health Center Mohol", "Shree Emergency Clinic"];
const ROAD_TYPES = ["Highway", "State Highway", "District Road", "Rural Road", "Village Road", "Narrow Road"];

export function generateMassSimulationDataset() {
  const startTime = performance.now();
  const graph = new RuralGraph();
  const spatialIndex = new GridSpatialIndex(50, 50);

  const COLS = 250;
  const ROWS = 200;
  const TOTAL_NODES = COLS * ROWS; // Exactly 50,000 nodes

  const nodes = [];
  const roads = [];

  // 1. Generate 50,000 Connected Nodes
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const index = r * COLS + c;
      const nodeId = `node_50k_${index}`;
      const x = parseFloat(((c / (COLS - 1)) * 90 + 5).toFixed(2));
      const y = parseFloat(((r / (ROWS - 1)) * 90 + 5).toFixed(2));

      const nodeObj = {
        id: nodeId,
        name: `Node ${index}`,
        type: "routing",
        x,
        y,
        lat: parseFloat((17.659 + (y / 100) * 0.5).toFixed(5)),
        lng: parseFloat((75.906 + (x / 100) * 0.5).toFixed(5))
      };

      nodes.push(nodeObj);
      spatialIndex.insert(nodeObj);
      graph.addNode(nodeObj);
    }
  }

  // 2. Generate 200,000+ Weighted Road Edges (Horizontal, Vertical, Diagonals & Cross-Mesh)
  let edgeCounter = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const uIndex = r * COLS + c;
      const uId = `node_50k_${uIndex}`;

      // 1. Horizontal Edge (Right)
      if (c < COLS - 1) {
        const vId = `node_50k_${r * COLS + (c + 1)}`;
        const roadType = ROAD_TYPES[(uIndex + 1) % ROAD_TYPES.length];
        const speed = roadType === "Highway" ? 80 : roadType === "State Highway" ? 60 : 40;
        const dist = parseFloat((1.2 + ((uIndex % 7) * 0.3)).toFixed(1));
        const travelTime = Math.max(1, Math.round((dist / speed) * 60));

        const roadObj = {
          id: `E${edgeCounter++}`,
          from: uId,
          to: vId,
          distance: dist,
          travelTime,
          speed,
          roadType,
          blocked: false,
          trafficFactor: 1.0 + ((uIndex % 5) * 0.1)
        };
        roads.push(roadObj);
        graph.addEdge(roadObj);
      }

      // 2. Vertical Edge (Down)
      if (r < ROWS - 1) {
        const vId = `node_50k_${(r + 1) * COLS + c}`;
        const roadType = ROAD_TYPES[(uIndex + 2) % ROAD_TYPES.length];
        const speed = roadType === "Highway" ? 80 : roadType === "State Highway" ? 60 : 45;
        const dist = parseFloat((1.5 + ((uIndex % 9) * 0.3)).toFixed(1));
        const travelTime = Math.max(1, Math.round((dist / speed) * 60));

        const roadObj = {
          id: `E${edgeCounter++}`,
          from: uId,
          to: vId,
          distance: dist,
          travelTime,
          speed,
          roadType,
          blocked: false,
          trafficFactor: 1.0 + ((uIndex % 4) * 0.1)
        };
        roads.push(roadObj);
        graph.addEdge(roadObj);
      }

      // 3. Diagonal Right-Down Edge
      if (c < COLS - 1 && r < ROWS - 1) {
        const vId = `node_50k_${(r + 1) * COLS + (c + 1)}`;
        const roadType = "Rural Road";
        const speed = 40;
        const dist = parseFloat((1.8 + ((uIndex % 3) * 0.4)).toFixed(1));
        const travelTime = Math.max(1, Math.round((dist / speed) * 60));

        const roadObj = {
          id: `E${edgeCounter++}`,
          from: uId,
          to: vId,
          distance: dist,
          travelTime,
          speed,
          roadType,
          blocked: false,
          trafficFactor: 1.1
        };
        roads.push(roadObj);
        graph.addEdge(roadObj);
      }

      // 4. Diagonal Left-Down Edge
      if (c > 0 && r < ROWS - 1) {
        const vId = `node_50k_${(r + 1) * COLS + (c - 1)}`;
        const roadType = "District Road";
        const speed = 50;
        const dist = parseFloat((1.9 + ((uIndex % 4) * 0.3)).toFixed(1));
        const travelTime = Math.max(1, Math.round((dist / speed) * 60));

        const roadObj = {
          id: `E${edgeCounter++}`,
          from: uId,
          to: vId,
          distance: dist,
          travelTime,
          speed,
          roadType,
          blocked: false,
          trafficFactor: 1.0
        };
        roads.push(roadObj);
        graph.addEdge(roadObj);
      }

      // 5. Additional Horizontal Cross-Skip Edge (Every 5th node)
      if (c < COLS - 2 && uIndex % 5 === 0) {
        const vId = `node_50k_${r * COLS + (c + 2)}`;
        const roadType = "State Highway";
        const speed = 65;
        const dist = parseFloat((2.4 + ((uIndex % 5) * 0.2)).toFixed(1));
        const travelTime = Math.max(1, Math.round((dist / speed) * 60));

        const roadObj = {
          id: `E${edgeCounter++}`,
          from: uId,
          to: vId,
          distance: dist,
          travelTime,
          speed,
          roadType,
          blocked: false,
          trafficFactor: 1.0
        };
        roads.push(roadObj);
        graph.addEdge(roadObj);
      }
    }
  }

  // 3. Generate 5,000+ Geographic Locations (4,000 Villages, 250 Hospitals, 400 Health Centers, 250 Clinics, 100 Emergency Centers)
  const villages = [];
  const hospitals = [];
  const healthCenters = [];
  const clinics = [];
  const emergencyCenters = [];

  // 4,000 Villages
  for (let i = 0; i < 4000; i++) {
    const x = parseFloat(((i * 23 + 7) % 90 + 5).toFixed(2));
    const y = parseFloat(((i * 47 + 11) % 90 + 5).toFixed(2));
    const nearestNode = spatialIndex.findNearestNode(x, y, nodes);

    villages.push({
      id: `VIL-${1000 + i}`,
      name: `${INDIAN_VILLAGE_PREFIXES[i % INDIAN_VILLAGE_PREFIXES.length]} ${i + 1}`,
      x,
      y,
      lat: parseFloat((17.659 + (y / 100) * 0.5).toFixed(5)),
      lng: parseFloat((75.906 + (x / 100) * 0.5).toFixed(5)),
      population: 500 + (i % 30) * 200,
      demandLevel: i % 4 === 0 ? "High" : "Normal",
      nearestNodeId: nearestNode.id
    });
  }

  // 250 Hospitals
  for (let i = 0; i < 250; i++) {
    const x = parseFloat(((i * 73 + 43) % 90 + 5).toFixed(2));
    const y = parseFloat(((i * 97 + 61) % 90 + 5).toFixed(2));
    const nearestNode = spatialIndex.findNearestNode(x, y, nodes);

    hospitals.push({
      id: `HOSP-${100 + i}`,
      name: i < INDIAN_FACILITY_NAMES.length ? INDIAN_FACILITY_NAMES[i] : `Rural Hospital #${i + 1}`,
      type: "hospital",
      x,
      y,
      lat: parseFloat((17.659 + (y / 100) * 0.5).toFixed(5)),
      lng: parseFloat((75.906 + (x / 100) * 0.5).toFixed(5)),
      bedsTotal: 120,
      bedsAvailable: 20 + (i % 40),
      icuBedsTotal: 15,
      icuBedsAvailable: 3 + (i % 8),
      traumaCapability: true,
      cardiacCapability: i % 2 === 0,
      maternityCapability: true,
      operatingStatus: "OPEN",
      hasCardiologist: i % 2 === 0,
      specialists: i % 2 === 0 ? ["Cardiology", "Trauma", "Maternity"] : ["Trauma", "Maternity"],
      nearestNodeId: nearestNode.id
    });
  }

  // 400 Health Centers
  for (let i = 0; i < 400; i++) {
    const x = parseFloat(((i * 41 + 19) % 90 + 5).toFixed(2));
    const y = parseFloat(((i * 59 + 37) % 90 + 5).toFixed(2));
    const nearestNode = spatialIndex.findNearestNode(x, y, nodes);

    healthCenters.push({
      id: `HC-${100 + i}`,
      name: `Primary Health Center #${i + 1}`,
      type: "health_center",
      x,
      y,
      nearestNodeId: nearestNode.id
    });
  }

  // 250 Clinics & 100 Emergency Centers
  for (let i = 0; i < 250; i++) {
    const x = parseFloat(((i * 67 + 29) % 90 + 5).toFixed(2));
    const y = parseFloat(((i * 83 + 53) % 90 + 5).toFixed(2));
    const nearestNode = spatialIndex.findNearestNode(x, y, nodes);

    clinics.push({
      id: `CLN-${100 + i}`,
      name: `Community Clinic #${i + 1}`,
      type: "clinic",
      x,
      y,
      nearestNodeId: nearestNode.id
    });
  }

  for (let i = 0; i < 100; i++) {
    const x = parseFloat(((i * 89 + 13) % 90 + 5).toFixed(2));
    const y = parseFloat(((i * 103 + 71) % 90 + 5).toFixed(2));
    const nearestNode = spatialIndex.findNearestNode(x, y, nodes);

    emergencyCenters.push({
      id: `EMC-${100 + i}`,
      name: `Emergency Medical Hub #${i + 1}`,
      type: "emergency_center",
      x,
      y,
      nearestNodeId: nearestNode.id
    });
  }

  // 4. Generate 100 Ambulances
  const ambulances = [];
  for (let i = 0; i < 100; i++) {
    const startNode = nodes[i * 450 % nodes.length];
    ambulances.push({
      id: `AMB-${101 + i}`,
      code: `Ambulance #${String(i + 1).padStart(2, '0')}`,
      locationNode: startNode.id,
      x: startNode.x,
      y: startNode.y,
      status: i < 70 ? "AVAILABLE" : i < 90 ? "EN_ROUTE" : "AT_HOSPITAL",
      speed: 45 + (i % 25),
      assignedPatientId: null,
      destinationHospitalId: null,
      currentRoute: []
    });
  }

  // 5. Generate 5,000 Patient Emergency Requests with SLA Windows
  const patients = [];
  const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const emergencyTypes = ["TRAUMA", "CARDIAC", "STROKE", "PREGNANCY", "ACCIDENT", "RESPIRATORY", "FEVER", "BURN", "OTHER"];
  const slaWindows = { CRITICAL: 8, HIGH: 15, MEDIUM: 30, LOW: 60 }; // minutes

  for (let i = 0; i < 5000; i++) {
    const village = villages[i % villages.length];
    const severity = severities[i % severities.length];
    const type = emergencyTypes[i % emergencyTypes.length];
    const slaMinutes = slaWindows[severity];

    patients.push({
      id: `PAT-${1001 + i}`,
      villageName: village.name,
      locationNode: village.nearestNodeId,
      x: village.x,
      y: village.y,
      type,
      severity,
      requestTime: "10:30:00",
      slaMinutes,
      slaStatus: i % 10 === 0 ? "AT_RISK" : i % 25 === 0 ? "BREACHED" : "SAFE",
      assignedAmbulanceId: null,
      assignedHospitalId: null,
      status: "WAITING"
    });
  }

  const endTime = performance.now();
  const initTimeMs = parseFloat((endTime - startTime).toFixed(2));

  return {
    graph,
    nodes,
    roads,
    villages,
    hospitals,
    healthCenters,
    clinics,
    emergencyCenters,
    ambulances,
    patients,
    spatialIndex,
    initTimeMs,
    totalNodes: TOTAL_NODES,
    totalEdges: roads.length,
    totalFacilities: villages.length + hospitals.length + healthCenters.length + clinics.length + emergencyCenters.length
  };
}
