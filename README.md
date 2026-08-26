# Rural Healthcare Routing & Dispatch System

An interactive, graph-based healthcare dispatch control system designed for rural emergency management, specialist availability matching, ambulance tracking, dynamic road closure simulation, custom shortest-path routing (Dijkstra & A*), and algorithm benchmarking.

---

## System Architecture

The core system architecture follows a clean, unidirectional data flow:

```
DATA (data.js)
  ↓
GRAPH (graph.js)
  ↓
ROUTING ALGORITHM (dijkstra.js / astar.js / minHeap.js)
  ↓
SIMULATION ENGINE (simulation.js)
  ↓
USER INTERFACE (React Components & SVG Map)
```

---

## Phase 2 Core Routing Implementation

Custom shortest-path algorithms built from scratch without external routing APIs or third-party dependencies:

- **Custom MinHeap Priority Queue (`minHeap.js`)**: Binary min-heap implementation enabling $O(\log V)$ node extraction.
- **Dijkstra Shortest Path Algorithm (`dijkstra.js`)**: Custom implementation finding the exact shortest distance path over adjacency-list graph edges while avoiding blocked roads (`blocked === true`).
- **A\* Search Algorithm (`astar.js`)**: Custom $f(n) = g(n) + h(n)$ search algorithm using an admissible straight-line geographic distance heuristic.
- **Routing Engine & Validator (`routingEngine.js` & `routeValidator.js`)**: Standardized interface & path validation checker verifying path continuity, start/target match, weight sums, and non-blocked road status.
- **Dual Benchmark Comparison (`benchmark.js`)**: Executes Dijkstra and A* sequentially on the exact same graph and measures execution time (in ms), distance, travel time, and nodes visited using `performance.now()`.
- **Dynamic Map Path Visualization (`Map.jsx`)**: Highlights calculated path edges in real-time on the interactive SVG canvas.

---

## Algorithmic Complexity Analysis

### Dijkstra's Shortest Path Algorithm
- **Time Complexity**: $O((V + E) \log V)$
  - $V$: Number of vertices (nodes/villages/hospitals).
  - $E$: Number of edges (roads).
  - MinHeap operations (`push`/`pop`) take $O(\log V)$ time for each vertex and edge relaxation.
- **Space Complexity**: $O(V)$
  - Stores distance maps, previous node pointers, and MinHeap entries.

### A* Search Algorithm
- **Evaluation Function**: $$f(n) = g(n) + h(n)$$
  - $g(n)$: Actual road path distance from source to node $n$.
  - $h(n)$: Admissible straight-line Euclidean distance heuristic from node $n$ to target.
  - $f(n)$: Estimated total cost of path through node $n$.
- **Time Complexity**:
  - **Typical**: $O((V + E) \log V)$ with significantly fewer nodes visited than Dijkstra because $h(n)$ guides the search towards the target destination.
  - **Worst-Case**: $O((V + E) \log V)$ when heuristic values are uninformative (approaching 0).
- **Space Complexity**: $O(V)$ for open/closed sets and distance maps.
- **Admissibility**: The straight-line heuristic $h(n)$ never overestimates the actual road distance ($\forall n, h(n) \le h^*(n)$), guaranteeing optimal distance paths.

---

## Phase Roadmap

- [x] **Phase 1**: Desktop UI + Graph Data Structure + Mock Healthcare Data + Simulation Controls.
- [x] **Phase 1.5**: Full UI State Management, Interactive Dispatch, Telemetry, and Map Selection.
- [x] **Phase 2 (Completed)**: Dijkstra, A*, MinHeap, Routing Engine, Route Validator, Benchmarking, and SVG Path Visualization.
- [ ] **Phase 3**: Healthcare Specialist & Facility Matching Engine.
- [ ] **Phase 4**: Automated Multi-Ambulance Dispatch & Fleet Optimization.
- [ ] **Phase 5**: Dynamic Road Blockage Auto-Rerouting & Fallback Navigation.
- [ ] **Phase 6**: Priority Queue Management for Simultaneous Emergencies.
- [ ] **Phase 7**: Hospital Bed & Medicine Inventory Capacity Constraints.
- [ ] **Phase 8**: Large-Scale Graph Benchmarking (50,000+ nodes & 200,000+ edges).

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev
```

### Production Build

```bash
npm run build
```
