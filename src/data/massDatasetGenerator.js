import { RuralGraph } from '../graph/graph.js';
import { MEDICAL_TAXONOMY } from '../engine/taxonomy.js';
import { analyzeGraphConnectivity } from '../graph/graphConnectivity.js';

/**
 * Deterministic 50,000+ Node Organic Geographic Network Topology Generator
 * Generates:
 * - 50,000 Organic Routing Nodes (Regional Towns, Hub Junctions, Villages, Hospitals)
 * - 208,652 Weighted Road Edges with Organic Geometry & Realistic Distance Weights
 * - 5,000 Geographic Locations (4,000 Villages, 250 Hospitals, 400 Health Centers, 250 Clinics, 100 Emergency Centers)
 * - Demo Node Aliases (node_v_a, node_v_d, node_h_c) registered in graph with organic connections
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

const REGIONAL_TOWN_NAMES = [
  "Mahe", "Kalpetta", "Kottakal", "Shoranur", "Malampuzha", "Palghat", "Trichur", "Angamali", 
  "Aluva", "Muvattupuzha", "Munnar", "Kottayam", "Changanassery", "Chenganur", "Alleppey", 
  "Kayamkulam", "Pathanamthitta", "Kottarakara", "Kollam", "Trivandrum", "Coimbatore", "Ooty", 
  "Bangalore", "Chennai", "Kattapana", "Kumily", "Peerumedu", "Ponnani", "Guruvayoor", "Kodungalloor", "Parur", "Ernakulam"
];

const ROAD_TYPES = ["Highway", "State Highway", "District Road", "Rural Road", "Village Road"];

export function generateMassSimulationDataset() {
  const startTime = performance.now();
  const graph = new RuralGraph();
  const spatialIndex = new GridSpatialIndex(50, 50);

  const COLS = 250;
  const ROWS = 200;
  const TOTAL_NODES = COLS * ROWS; // Exactly 50,000 nodes

  const nodes = [];
  const roads = [];

  // 1. Generate 50,000 Organic Routing Nodes with Organic Curvatures
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const index = r * COLS + c;
      const nodeId = `node_50k_${index}`;

      // Organic spatial jitter for natural network topology (non-grid curvature)
      const jitterX = Math.sin(r * 0.15 + c * 0.1) * 0.8;
      const jitterY = Math.cos(c * 0.15 + r * 0.1) * 0.8;

      const rawX = (c / (COLS - 1)) * 88 + 6 + jitterX;
      const rawY = (r / (ROWS - 1)) * 88 + 6 + jitterY;

      const x = parseFloat(Math.min(96, Math.max(4, rawX)).toFixed(2));
      const y = parseFloat(Math.min(96, Math.max(4, rawY)).toFixed(2));

      const townName = REGIONAL_TOWN_NAMES[index % REGIONAL_TOWN_NAMES.length];
      const nodeName = index < REGIONAL_TOWN_NAMES.length ? townName : `${townName} #${Math.floor(index / REGIONAL_TOWN_NAMES.length) + 1}`;

      const nodeObj = {
        id: nodeId,
        name: nodeName,
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

  // Demo Node Aliases Mapping for Seamless Backwards Compatibility
  const aliasMap = {
    "node_v_a": "node_50k_0",
    "node_v_b": "node_50k_249",
    "node_v_d": "node_50k_250",
    "node_v_c": "node_50k_1250",
    "node_v_e": "node_50k_18750",
    "node_v_f": "node_50k_20500",
    "node_v_g": "node_50k_40000",
    "node_v_h": "node_50k_41000",
    "node_hc_1": "node_50k_125",
    "node_h_a": "node_50k_25000",
    "node_h_b": "node_50k_25249",
    "node_h_c": "node_50k_49999",
    "node_h_d": "node_50k_30000",
    "node_h_e": "node_50k_45000"
  };

  // Add alias nodes to graph
  Object.entries(aliasMap).forEach(([aliasId, actualId]) => {
    const orig = nodes.find(n => n.id === actualId);
    if (orig) {
      graph.addNode({ ...orig, id: aliasId });
    }
  });

  // 2. Generate 208,652 Weighted Road Edges with Organic Road Distances
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
        // Deterministic organic distance weight (e.g. 24, 48, 56, 73, 94, 34, 69, 45, 18, 31, 47)
        const dist = 12 + ((uIndex * 17 + 5) % 85);
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

      // 2. Vertical Edge (Down)
      if (r < ROWS - 1) {
        const vId = `node_50k_${(r + 1) * COLS + c}`;
        const roadType = ROAD_TYPES[(uIndex + 2) % ROAD_TYPES.length];
        const speed = roadType === "Highway" ? 80 : roadType === "State Highway" ? 60 : 45;
        const dist = 15 + ((uIndex * 23 + 11) % 80);
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

      // 3. Diagonal Right-Down Edge (Organic Network Connection)
      if (c < COLS - 1 && r < ROWS - 1) {
        const vId = `node_50k_${(r + 1) * COLS + (c + 1)}`;
        const roadType = "Rural Road";
        const speed = 40;
        const dist = 18 + ((uIndex * 31 + 7) % 75);
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

      // 4. Diagonal Left-Down Edge (Organic Network Connection)
      if (c > 0 && r < ROWS - 1) {
        const vId = `node_50k_${(r + 1) * COLS + (c - 1)}`;
        const roadType = "District Road";
        const speed = 50;
        const dist = 14 + ((uIndex * 41 + 13) % 70);
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

      // 5. Additional Cross-Skip Edge for Organic Mesh
      if (c < COLS - 2 && uIndex % 5 === 0) {
        const vId = `node_50k_${r * COLS + (c + 2)}`;
        const roadType = "State Highway";
        const speed = 65;
        const dist = 28 + ((uIndex * 19 + 3) % 65);
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

  // Add alias bidirectional edges connecting demo alias IDs to grid neighbors
  Object.entries(aliasMap).forEach(([aliasId, actualId]) => {
    const neighbors = graph.getNeighbors(actualId) || [];
    neighbors.forEach(edge => {
      const targetId = edge.node.id;
      graph.addEdge({
        id: `E_alias_${aliasId}_${targetId}`,
        from: aliasId,
        to: targetId,
        distance: edge.distance,
        travelTime: edge.travelTime,
        speed: edge.speed || 40,
        roadType: edge.roadType || "Rural Road",
        blocked: false,
        trafficFactor: 1.0
      });
      graph.addEdge({
        id: `E_alias_${targetId}_${aliasId}`,
        from: targetId,
        to: aliasId,
        distance: edge.distance,
        travelTime: edge.travelTime,
        speed: edge.speed || 40,
        roadType: edge.roadType || "Rural Road",
        blocked: false,
        trafficFactor: 1.0
      });
    });
  });

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

    const name = i === 0 ? "Village A" : i === 1 ? "Village B" : i === 2 ? "Village D" : `${REGIONAL_TOWN_NAMES[i % REGIONAL_TOWN_NAMES.length]} ${i + 1}`;
    const nearestNodeId = i === 0 ? "node_v_a" : i === 1 ? "node_v_b" : i === 2 ? "node_v_d" : nearestNode.id;

    villages.push({
      id: `VIL-${1000 + i}`,
      name,
      x,
      y,
      lat: parseFloat((17.659 + (y / 100) * 0.5).toFixed(5)),
      lng: parseFloat((75.906 + (x / 100) * 0.5).toFixed(5)),
      population: 500 + (i % 30) * 200,
      demandLevel: i % 4 === 0 ? "High" : "Normal",
      nearestNodeId
    });
  }

  // 250 Hospitals — Multi-Specialty Taxonomy Coverage
  const ALL_TAXONOMY_KEYS = Object.values(MEDICAL_TAXONOMY);

  for (let i = 0; i < 250; i++) {
    const x = parseFloat(((i * 73 + 43) % 90 + 5).toFixed(2));
    const y = parseFloat(((i * 97 + 61) % 90 + 5).toFixed(2));
    const nearestNode = spatialIndex.findNearestNode(x, y, nodes);

    const specs = [MEDICAL_TAXONOMY.GENERAL_EMERGENCY];
    const spec1 = ALL_TAXONOMY_KEYS[i % ALL_TAXONOMY_KEYS.length];
    const spec2 = ALL_TAXONOMY_KEYS[(i * 3 + 1) % ALL_TAXONOMY_KEYS.length];
    const spec3 = ALL_TAXONOMY_KEYS[(i * 7 + 2) % ALL_TAXONOMY_KEYS.length];
    if (!specs.includes(spec1)) specs.push(spec1);
    if (!specs.includes(spec2)) specs.push(spec2);
    if (!specs.includes(spec3)) specs.push(spec3);

    const isHospitalB = i === 1;
    const hasCardio = !isHospitalB;
    const hospId = i === 0 ? "node_h_a" : i === 1 ? "node_h_b" : i === 2 ? "node_h_c" : `HOSP-${100 + i}`;
    const hospName = i === 0 ? "Hospital A" : i === 1 ? "Hospital B" : i === 2 ? "Hospital C" : `${REGIONAL_TOWN_NAMES[i % REGIONAL_TOWN_NAMES.length]} Hospital`;

    const targetNearestNodeId = (i === 0 || i === 1 || i === 2) ? hospId : nearestNode.id;

    hospitals.push({
      id: hospId,
      name: hospName,
      type: "hospital",
      x,
      y,
      lat: parseFloat((17.659 + (y / 100) * 0.5).toFixed(5)),
      lng: parseFloat((75.906 + (x / 100) * 0.5).toFixed(5)),
      bedsTotal: 120,
      bedsAvailable: 45,
      icuBedsTotal: 15,
      icuBedsAvailable: 8,
      traumaCapability: specs.includes(MEDICAL_TAXONOMY.TRAUMA),
      cardiacCapability: hasCardio,
      maternityCapability: true,
      operatingStatus: "OPEN",
      operational: true,
      hasCardiologist: hasCardio,
      specialists: specs,
      nearestNodeId: targetNearestNodeId
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

  // 5. Generate 5,000 Patient Emergency Requests
  const patients = [];
  const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const emergencyTypes = Object.values(MEDICAL_TAXONOMY);
  const slaWindows = { CRITICAL: 8, HIGH: 15, MEDIUM: 30, LOW: 60 };

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

  // Audit Connected Components with BFS
  const connectivityAudit = analyzeGraphConnectivity(graph);

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
    connectivityAudit,
    initTimeMs,
    totalNodes: connectivityAudit.totalNodes,
    totalEdges: connectivityAudit.totalEdges,
    totalFacilities: villages.length + hospitals.length + healthCenters.length + clinics.length + emergencyCenters.length
  };
}
