/**
 * Graph Data Structure
 * Adjacency-list based implementation designed for scalability.
 */

export class RuralGraph {
  constructor() {
    this.nodes = new Map(); // id -> node object
    this.adjacencyList = new Map(); // id -> Array of edge objects
    this.edges = new Map(); // edgeId -> edge object
  }

  addNode(node) {
    if (!node || !node.id) return;
    this.nodes.set(node.id, {
      ...node,
      latitude: node.latitude || 0,
      longitude: node.longitude || 0,
    });
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  addEdge(edge) {
    if (!edge || !edge.id || !edge.from || !edge.to) return;

    const edgeObj = {
      id: edge.id,
      from: edge.from,
      to: edge.to,
      distance: edge.distance || 0, // in km
      travelTime: edge.travelTime || 0, // in minutes
      blocked: !!edge.blocked,
    };

    this.edges.set(edge.id, edgeObj);

    // Bidirectional road network
    if (this.adjacencyList.has(edge.from)) {
      this.adjacencyList.get(edge.from).push(edgeObj);
    }
    
    // Add reverse edge representation for adjacency search
    if (this.adjacencyList.has(edge.to)) {
      this.adjacencyList.get(edge.to).push({
        ...edgeObj,
        from: edge.to,
        to: edge.from,
      });
    }
  }

  getNode(id) {
    return this.nodes.get(id) || null;
  }

  getNeighbors(nodeId) {
    const edges = this.adjacencyList.get(nodeId) || [];
    return edges.map((e) => ({
      node: this.getNode(e.to),
      edge: e,
    }));
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getAllEdges() {
    return Array.from(this.edges.values());
  }

  setRoadBlocked(edgeId, blocked) {
    const edge = this.edges.get(edgeId);
    if (edge) {
      edge.blocked = !!blocked;
      
      // Update instances in adjacency lists
      for (const list of this.adjacencyList.values()) {
        for (const e of list) {
          if (e.id === edgeId) {
            e.blocked = !!blocked;
          }
        }
      }
      return true;
    }
    return false;
  }
}
