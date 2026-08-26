/**
 * Simulation Module for Edge-Case Handling & Event Triggers
 * Fully interactive state updates for Phase 1.5 testing.
 */

export class SimulationEngine {
  constructor(graph) {
    this.graph = graph;
  }

  triggerEvent(eventType, state, setState) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    switch (eventType) {
      case "road_block_r17": {
        const r17 = state.roads.find(r => r.id === "road_r17");
        const isCurrentlyBlocked = r17 ? r17.blocked : false;
        const newBlockedState = !isCurrentlyBlocked;

        // Update graph structure
        this.graph.setRoadBlocked("road_r17", newBlockedState);

        // Update roads array in state
        const updatedRoads = state.roads.map(r => 
          r.id === "road_r17" ? { ...r, blocked: newBlockedState } : r
        );

        const blockedCount = updatedRoads.filter(r => r.blocked).length;

        const log1 = {
          id: Date.now(),
          time: timestamp,
          type: newBlockedState ? "warning" : "info",
          text: newBlockedState ? "Road R17 Blocked" : "Road R17 Cleared"
        };
        const log2 = {
          id: Date.now() + 1,
          time: timestamp,
          type: "engine",
          text: "Routing Engine waiting for Phase 2"
        };

        setState(prev => ({
          ...prev,
          roads: updatedRoads,
          roadsBlockedCount: blockedCount,
          logs: [log1, log2, ...prev.logs]
        }));
        break;
      }

      case "all_ambulances_busy": {
        const updatedAmbulances = state.ambulances.map(a => ({
          ...a,
          status: "BUSY",
          speed: a.speed || 45,
          progressPct: a.progressPct || 50
        }));

        const log = {
          id: Date.now(),
          time: timestamp,
          type: "warning",
          text: "All Ambulances Occupied (0/8 Available)"
        };

        setState(prev => ({
          ...prev,
          ambulances: updatedAmbulances,
          logs: [log, ...prev.logs]
        }));
        break;
      }

      case "specialist_unavailable": {
        const updatedHospitals = state.hospitals.map(h => 
          h.id === "node_h_b" ? { ...h, hasCardiologist: false } : h
        );

        const log1 = {
          id: Date.now(),
          time: timestamp,
          type: "warning",
          text: "Hospital B: Cardiologist Unavailable"
        };
        const log2 = {
          id: Date.now() + 1,
          time: timestamp,
          type: "engine",
          text: "Specialist scenario flagged for Phase 2 Routing Engine"
        };

        setState(prev => ({
          ...prev,
          hospitals: updatedHospitals,
          logs: [log1, log2, ...prev.logs]
        }));
        break;
      }

      case "bed_full": {
        const updatedHospitals = state.hospitals.map(h => 
          h.id === "node_h_c" ? { ...h, bedsAvailable: 0, status: "FULL" } : h
        );

        const updatedCapacity = {
          ...state.capacity,
          hospitalBeds: {
            hospital: "Hospital C",
            available: 0,
            total: 100,
            pct: 100,
            status: "FULL"
          }
        };

        const log = {
          id: Date.now(),
          time: timestamp,
          type: "warning",
          text: "Hospital C bed capacity reached (100/100 FULL)"
        };

        setState(prev => ({
          ...prev,
          hospitals: updatedHospitals,
          capacity: updatedCapacity,
          logs: [log, ...prev.logs]
        }));
        break;
      }

      case "medicine_depleted": {
        const updatedCapacity = {
          ...state.capacity,
          cardiacMedicine: {
            item: "Cardiac Medicine",
            availablePct: 0,
            status: "Depleted"
          }
        };

        const log = {
          id: Date.now(),
          time: timestamp,
          type: "warning",
          text: "Cardiac Medicine stock depleted (0%)"
        };

        setState(prev => ({
          ...prev,
          capacity: updatedCapacity,
          logs: [log, ...prev.logs]
        }));
        break;
      }

      case "multiple_emergencies": {
        const e1 = {
          id: "#201",
          village: "Village A",
          type: "Cardiology",
          urgency: "Critical",
          requestedAt: timestamp,
          assignedAmbulance: null,
          assignedDoctor: null,
          assignedHospital: null,
          status: "Waiting for Unit",
          distance: "--",
          estimatedTime: "--",
          via: "--"
        };

        const e2 = {
          id: "#202",
          village: "Village D",
          type: "Trauma",
          urgency: "Critical",
          requestedAt: timestamp,
          assignedAmbulance: null,
          assignedDoctor: null,
          assignedHospital: null,
          status: "Waiting for Unit",
          distance: "--",
          estimatedTime: "--",
          via: "--"
        };

        const e3 = {
          id: "#203",
          village: "Village F",
          type: "Neurology",
          urgency: "Critical",
          requestedAt: timestamp,
          assignedAmbulance: null,
          assignedDoctor: null,
          assignedHospital: null,
          status: "Waiting for Unit",
          distance: "--",
          estimatedTime: "--",
          via: "--"
        };

        const log1 = {
          id: Date.now(),
          time: timestamp,
          type: "create",
          text: "Emergency #201 Created (Village A - Cardiology)"
        };
        const log2 = {
          id: Date.now() + 1,
          time: timestamp,
          type: "create",
          text: "Emergency #202 Created (Village D - Trauma)"
        };
        const log3 = {
          id: Date.now() + 2,
          time: timestamp,
          type: "create",
          text: "Emergency #203 Created (Village F - Neurology)"
        };
        const log4 = {
          id: Date.now() + 3,
          time: timestamp,
          type: "warning",
          text: "3 simultaneous critical emergencies registered"
        };

        setState(prev => ({
          ...prev,
          emergencies: [e1, e2, e3, ...prev.emergencies],
          selectedEmergencyId: e1.id,
          logs: [log1, log2, log3, log4, ...prev.logs]
        }));
        break;
      }

      default:
        break;
    }
  }
}
