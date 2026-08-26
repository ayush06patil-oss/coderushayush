import { RuralGraph } from './graph.js';

/**
 * Deterministic 50,000-Node Graph Generator
 * Creates a reproducible 50,000-node grid-mesh road network (50,000 nodes, ~197,900 edges)
 * Seeded coordinates and edge weights ensure identical results across restarts.
 */
export function generate50kGraph() {
  const startTime = performance.now();
  const graph = new RuralGraph();
  
  const COLS = 250;
  const ROWS = 200;
  const TOTAL_NODES = COLS * ROWS; // Exactly 50,000 nodes

  const nodes = [];
  const roads = [];

  // 1. Generate 50,000 Nodes with Deterministic Grid Coordinates
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const index = r * COLS + c;
      const nodeId = `node_50k_${index}`;
      
      // Calculate normalized percentage coordinates (0 to 100%)
      const x = parseFloat(((c / (COLS - 1)) * 90 + 5).toFixed(2));
      const y = parseFloat(((r / (ROWS - 1)) * 90 + 5).toFixed(2));

      let type = "village";
      let name = `Node ${index}`;

      // Key Designated Nodes for Demo Mapping
      if (index === 0) {
        type = "village";
        name = "Village A";
      } else if (index === 249) {
        type = "village";
        name = "Village B";
      } else if (index === 250) {
        type = "village";
        name = "Village D";
      } else if (index === 125) {
        type = "health_center";
        name = "Health Center Alpha";
      } else if (index === 25000) {
        type = "hospital";
        name = "Hospital A";
      } else if (index === 25249) {
        type = "hospital";
        name = "Hospital B";
      } else if (index === 49999) {
        type = "hospital";
        name = "Hospital C";
      } else if (index === 30000) {
        type = "hospital";
        name = "Hospital D";
      } else if (index === 45000) {
        type = "hospital";
        name = "Regional Trauma Center";
      }

      const nodeObj = {
        id: nodeId,
        name,
        type,
        x,
        y,
        gridC: c,
        gridR: r
      };

      if (type === "hospital") {
        nodeObj.bedsTotal = 100;
        nodeObj.bedsAvailable = index === 25249 ? 20 : 72; // Hospital B has 20 beds, C has 72 beds
        nodeObj.hasCardiologist = index === 49999 || index === 45000; // Hospital C & Trauma Center have cardiologist
        nodeObj.specialists = index === 49999 ? ["Cardiology", "Trauma"] : ["Trauma"];
        nodeObj.operational = true;
      }

      nodes.push(nodeObj);
      graph.addNode(nodeObj);
    }
  }

  // Map key node alias IDs for seamless Phase 1-4 compatibility
  const aliasMap = {
    "node_v_a": "node_50k_0",
    "node_v_b": "node_50k_249",
    "node_v_d": "node_50k_250",
    "node_hc_1": "node_50k_125",
    "node_h_a": "node_50k_25000",
    "node_h_b": "node_50k_25249",
    "node_h_c": "node_50k_49999",
    "node_h_d": "node_50k_30000",
    "node_h_e": "node_50k_45000"
  };

  // Add alias nodes to graph so existing node IDs ("node_v_a", "node_h_c") route seamlessly!
  Object.entries(aliasMap).forEach(([aliasId, actualId]) => {
    const orig = nodes.find(n => n.id === actualId);
    if (orig) {
      const aliasNode = { ...orig, id: aliasId };
      graph.addNode(aliasNode);
    }
  });

  // 2. Generate Road Edges Connecting Grid Neighbors (Horizontal & Vertical)
  let edgeCounter = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const uIndex = r * COLS + c;
      const uId = `node_50k_${uIndex}`;

      // Disconnect Regional Trauma Center (index 45000) for unreachable node test
      if (uIndex === 45000) continue;

      // Horizontal Edge (Right)
      if (c < COLS - 1 && (uIndex + 1) !== 45000) {
        const vIndex = r * COLS + (c + 1);
        const vId = `node_50k_${vIndex}`;
        
        const dist = parseFloat((1.2 + ((uIndex % 7) * 0.4)).toFixed(1));
        const time = Math.max(2, Math.round(dist * 1.2));

        const roadObj = {
          id: `road_50k_${edgeCounter++}`,
          from: uId,
          to: vId,
          distance: dist,
          travelTime: time,
          blocked: false
        };

        roads.push(roadObj);
        graph.addEdge(roadObj);
      }

      // Vertical Edge (Down)
      if (r < ROWS - 1 && (uIndex + COLS) !== 45000) {
        const vIndex = (r + 1) * COLS + c;
        const vId = `node_50k_${vIndex}`;

        const dist = parseFloat((1.5 + ((uIndex % 9) * 0.3)).toFixed(1));
        const time = Math.max(2, Math.round(dist * 1.3));

        const roadObj = {
          id: `road_50k_${edgeCounter++}`,
          from: uId,
          to: vId,
          distance: dist,
          travelTime: time,
          blocked: false
        };

        roads.push(roadObj);
        graph.addEdge(roadObj);
      }
    }
  }

  // Connect alias nodes to neighboring grid nodes for seamless routing (excluding node_h_e)
  Object.entries(aliasMap).forEach(([aliasId, actualId]) => {
    if (aliasId === "node_h_e") return; // Keep Regional Trauma Center alias disconnected
    const neighborEdges = graph.getNeighbors(actualId);
    neighborEdges.forEach(edge => {
      const target = edge.node.id;
      graph.addEdge({
        id: `road_alias_${aliasId}_${target}`,
        from: aliasId,
        to: target,
        distance: edge.distance,
        travelTime: edge.travelTime,
        blocked: false
      });
    });
  });

  const endTime = performance.now();
  const initTimeMs = parseFloat((endTime - startTime).toFixed(2));

  return {
    graph,
    nodes,
    roads,
    initTimeMs,
    totalNodes: TOTAL_NODES,
    totalEdges: roads.length,
    hospitals: nodes.filter(n => n.type === 'hospital'),
    villages: nodes.filter(n => n.type === 'village')
  };
}
