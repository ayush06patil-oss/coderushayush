import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import TopStats from './components/TopStats';
import Map from './components/Map';
import EmergencyPanel from './components/EmergencyPanel';
import AmbulanceTracking from './components/AmbulanceTracking';
import ActiveEmergencyCard from './components/ActiveEmergencyCard';
import RouteSummary from './components/RouteSummary';
import AssignedResources from './components/AssignedResources';
import Logs from './components/Logs';
import CapacityCard from './components/CapacityCard';
import SimulationControls from './components/SimulationControls';

import { RuralGraph } from './graph/graph';
import { SimulationEngine } from './simulation/simulation';
import { 
  MOCK_NODES, 
  MOCK_ROADS, 
  MOCK_AMBULANCES, 
  MOCK_DOCTORS,
  INITIAL_EMERGENCY, 
  INITIAL_LOGS,
  INITIAL_CAPACITY 
} from './data/data';

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState("node_v_a");
  const [selectedEmergencyId, setSelectedEmergencyId] = useState("#101");

  // Single Application State
  const [appState, setAppState] = useState({
    nodes: MOCK_NODES,
    roads: MOCK_ROADS,
    ambulances: MOCK_AMBULANCES,
    hospitals: MOCK_NODES.filter(n => n.type === 'hospital'),
    doctors: MOCK_DOCTORS,
    emergencies: [
      INITIAL_EMERGENCY,
      {
        id: "#102",
        village: "Village D",
        type: "Trauma",
        urgency: "High",
        requestedAt: "10:30 AM",
        assignedAmbulance: "Ambulance #06",
        assignedDoctor: "Dr. Singh",
        assignedHospital: "Hospital B",
        status: "En Route",
        distance: "--",
        estimatedTime: "--",
        via: "--"
      }
    ],
    logs: INITIAL_LOGS,
    capacity: INITIAL_CAPACITY
  });

  // Graph instance initialization
  const graph = useMemo(() => {
    const g = new RuralGraph();
    appState.nodes.forEach(n => g.addNode(n));
    appState.roads.forEach(r => g.addEdge(r));
    return g;
  }, [appState.nodes, appState.roads]);

  // Simulation Engine instance
  const simEngine = useMemo(() => {
    return new SimulationEngine(graph);
  }, [graph]);

  // Handler: Create Emergency submission
  const handleDispatchEmergency = (newReq) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const nextNum = appState.emergencies.length + 104;
    const newId = `#${nextNum}`;

    // Find available ambulance
    const availableAmb = appState.ambulances.find(a => a.status === 'Available');

    let assignedAmbCode = null;
    let assignedDocName = null;
    let assignedHospName = null;
    let newStatus = "Waiting for Unit";

    const logList = [
      { id: Date.now(), time: timestamp, type: 'create', text: `Emergency ${newId} Created (${newReq.village} - ${newReq.type})` },
      { id: Date.now() + 1, time: timestamp, type: 'info', text: `${newReq.type} requirement detected` }
    ];

    let updatedAmbulances = appState.ambulances;

    if (availableAmb) {
      assignedAmbCode = availableAmb.code;
      assignedDocName = "Dr. Patel";
      assignedHospName = "Hospital C";
      newStatus = "En Route";

      logList.push({
        id: Date.now() + 2,
        time: timestamp,
        type: 'assign',
        text: `${availableAmb.code} Assigned to Emergency ${newId}`
      });

      // Update ambulance status to BUSY / En Route
      updatedAmbulances = appState.ambulances.map(a => 
        a.id === availableAmb.id 
          ? { ...a, status: 'En Route', from: newReq.village, to: assignedHospName, patientType: newReq.urgency, progressPct: 20, speed: 55, eta: "15 min" }
          : a
      );
    } else {
      logList.push({
        id: Date.now() + 2,
        time: timestamp,
        type: 'warning',
        text: `No ambulance available for Emergency ${newId}`
      });
      logList.push({
        id: Date.now() + 3,
        time: timestamp,
        type: 'engine',
        text: `Dispatch waiting for available unit`
      });
    }

    logList.push({
      id: Date.now() + 4,
      time: timestamp,
      type: 'engine',
      text: `Routing Engine: Waiting for Phase 2`
    });

    const newEmergencyObj = {
      id: newId,
      village: newReq.village,
      type: newReq.type,
      urgency: newReq.urgency,
      requestedAt: timestamp,
      assignedAmbulance: assignedAmbCode,
      assignedDoctor: assignedDocName,
      assignedHospital: assignedHospName,
      status: newStatus,
      distance: "--",
      estimatedTime: "--",
      via: "--",
      isDemoScenario: false
    };

    setAppState(prev => ({
      ...prev,
      ambulances: updatedAmbulances,
      emergencies: [newEmergencyObj, ...prev.emergencies],
      logs: [...logList, ...prev.logs]
    }));

    setSelectedEmergencyId(newId);
  };

  // Handler: Simulation Trigger
  const handleTriggerSimulation = (eventType) => {
    simEngine.triggerEvent(eventType, appState, setAppState);
  };

  // Derived state values
  const activeSelectedEmergency = appState.emergencies.find(e => e.id === selectedEmergencyId) || appState.emergencies[0];

  const assignedAmbulanceData = appState.ambulances.find(a => a.code === activeSelectedEmergency?.assignedAmbulance) || appState.ambulances[0];

  const availableAmbulancesCount = appState.ambulances.filter(a => a.status === 'Available').length;
  const totalAmbulancesCount = appState.ambulances.length;
  const roadsBlockedCount = appState.roads.filter(r => r.blocked).length;
  const hospitalsOnlineCount = appState.hospitals.length;

  const isRoadR17Blocked = appState.roads.find(r => r.id === "road_r17")?.blocked;

  return (
    <div className="app-layout">
      {/* Header Bar */}
      <Header systemTime="10:32 AM" />

      <div className="app-body">
        {/* Main Workspace */}
        <main className="main-content">
          {/* Top Stat Cards */}
          <TopStats 
            activeEmergencies={appState.emergencies.length}
            ambulancesAvailable={`${availableAmbulancesCount} / ${totalAmbulancesCount}`}
            hospitalsOnline={hospitalsOnlineCount}
            roadsBlocked={roadsBlockedCount}
          />

          {/* Grid Layout: Live Map & Right Side Panels */}
          <div className="dashboard-grid-row">
            {/* Interactive Map */}
            <div className="grid-col-map">
              <Map 
                nodes={appState.nodes} 
                roads={appState.roads} 
                selectedNodeId={selectedNodeId}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
              />
            </div>

            {/* Right Side Column */}
            <div className="grid-col-sidebar">
              <EmergencyPanel 
                villages={appState.nodes.filter(n => n.type === 'village')}
                onDispatchEmergency={handleDispatchEmergency}
              />
              <AmbulanceTracking 
                ambulanceData={assignedAmbulanceData}
                selectedEmergency={activeSelectedEmergency}
              />
            </div>
          </div>

          {/* Bottom Cards Row 1: Active Emergency, Route Summary, Assigned Resources */}
          <div className="bottom-cards-grid">
            <ActiveEmergencyCard 
              emergencies={appState.emergencies}
              selectedEmergencyId={selectedEmergencyId}
              onSelectEmergency={(id) => setSelectedEmergencyId(id)}
              hospitals={appState.hospitals}
            />
            <RouteSummary 
              emergency={activeSelectedEmergency}
            />
            <AssignedResources 
              emergency={activeSelectedEmergency}
            />
          </div>

          {/* Bottom Cards Row 2: Recent Logs, Capacity Meters, Simulation Controls */}
          <div className="secondary-cards-grid">
            <Logs logs={appState.logs} />
            <CapacityCard capacity={appState.capacity} />
            <SimulationControls 
              onTriggerSimulation={handleTriggerSimulation}
              isRoadR17Blocked={isRoadR17Blocked}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
