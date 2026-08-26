# Rural Healthcare Routing & Dispatch System

An interactive, graph-based healthcare dispatch control system designed for rural emergency management, specialist availability matching, ambulance tracking, dynamic road closure simulation, and algorithm benchmarking.

---

## System Architecture

The core system architecture follows a clean, unidirectional data flow:

```
DATA (data.js)
  ↓
GRAPH (graph.js)
  ↓
ROUTING ALGORITHM (dijkstra.js / astar.js)
  ↓
SIMULATION ENGINE (simulation.js)
  ↓
USER INTERFACE (React Components)
```

---

## Phase 1 Deliverables (Completed)

- **Visual Dashboard**: Desktop healthcare control dashboard matching design specification.
- **Interactive Simulated Map**: Dynamic SVG canvas visualizing villages, hospitals, health centers, ambulances, normal roads, blocked roads, travel times, and selected dispatch routes.
- **Adjacency-List Graph Foundation (`graph.js`)**: Scalable node and edge graph data structure with helper functions (`getNode`, `getNeighbors`, `setRoadBlocked`, `addNode`, `addEdge`).
- **Emergency Dispatch Panel**: Interactive form to dispatch ambulances with village selection, emergency type (Cardiology, Trauma, etc.), and urgency levels.
- **Live Telemetry & Ambulance Tracking**: Progress bar, ETA, speed, and en-route status.
- **Healthcare Specialist Matching Demo Scenario**: Visual representation of Village A emergency requiring Cardiology, highlighting constraints between Hospital B (10 km, no cardiologist) vs Hospital C (25 km, cardiologist on-duty).
- **Edge-Case Simulation Engine**: Toggleable simulation events (Road R17 Blocked, Specialist Unavailable, Bed Capacity Full, Medicine Depleted) updating graph edge states and logging timestamped events.
- **Zero Algorithm Faking**: Clearly marks routing engine phase readiness ("Routing Engine: Waiting for Phase 2") without claiming pre-computed Dijkstra/A* paths.

---

## Development Roadmap (Phases 1 — 8)

1. **Phase 1 (Current)**: UI + Graph Data Structure + Mock Healthcare Data + Simulation Controls.
2. **Phase 2**: Dijkstra & A* Shortest-Path Algorithms implementation.
3. **Phase 3**: Healthcare Resource & Specialist Matching Engine.
4. **Phase 4**: Automated Multi-Ambulance Dispatch & Fleet Optimization.
5. **Phase 5**: Dynamic Road Blockage Auto-Rerouting & Fallback Navigation.
6. **Phase 6**: Priority Queue Management for Simultaneous Emergencies.
7. **Phase 7**: Hospital Bed & Medicine Inventory Capacity Constraints.
8. **Phase 8**: Large-Scale Graph Benchmarking (50,000+ nodes & 200,000+ edges).

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

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
