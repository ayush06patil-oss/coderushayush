import React, { useState, useMemo, useEffect } from 'react';
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
import { calculateRoute } from './algorithms/routingEngine';
import { runBenchmark } from './algorithms/benchmark';
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
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("astar");
  const [targetHospitalId, setTargetHospitalId] = useState("node_h_c");

  // Routing State
  const [routeResult, setRouteResult] = useState(null);
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  // Unified Application State
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

  // Active emergency & node helper
  const activeSelectedEmergency = appState.emergencies.find(e => e.id === selectedEmergencyId) || appState.emergencies[0];

  // Helper to map village name to node ID
  const getStartNodeIdForEmergency = (emergency) => {
    const villageName = emergency?.village || "Village A";
    const foundNode = appState.nodes.find(n => n.name.toLowerCase() === villageName.toLowerCase());
    return foundNode ? foundNode.id : "node_v_a";
  };

  // Execution Handler: Run Routing Engine
  const handleRunRouting = (customAlgorithm, customStartId, customTargetId) => {
    const algo = customAlgorithm || selectedAlgorithm;
    const startId = customStartId || getStartNodeIdForEmergency(activeSelectedEmergency);
    const targetId = customTargetId || targetHospitalId;

    const startNode = appState.nodes.find(n => n.id === startId);
    const targetNode = appState.nodes.find(n => n.id === targetId);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    // 1. Calculate Primary Route using selected algorithm
    const res = calculateRoute({
      algorithm: algo,
      startNodeId: startId,
      targetNodeId: targetId,
      graph
    });

    // 2. Calculate Dual Algorithm Benchmark
    const bench = runBenchmark(startId, targetId, graph);

    setRouteResult(res);
    setBenchmarkResult(bench);

    // 3. Add Real Decision Logs
    const log1 = {
      id: Date.now(),
      time: timestamp,
      type: "route",
      text: `Routing request received (${startNode?.name || startId} → ${targetNode?.name || targetId})`
    };
    const log2 = {
      id: Date.now() + 1,
      time: timestamp,
      type: "info",
      text: `Algorithm selected: ${res.algorithm}`
    };
    const log3 = {
      id: Date.now() + 2,
      time: timestamp,
      type: res.status === "FOUND" ? "assign" : "warning",
      text: res.status === "FOUND" 
        ? `Route found: ${res.distance} km (${res.travelTime} min) | Visited nodes: ${res.visitedNodes}`
        : `No valid route available between ${startNode?.name} and ${targetNode?.name}`
    };

    // 4. Update Emergency Object details if route found
    const updatedEmergencies = appState.emergencies.map(e => {
      if (e.id === activeSelectedEmergency.id) {
        return {
          ...e,
          distance: res.status === "FOUND" ? `${res.distance} km` : "--",
          estimatedTime: res.status === "FOUND" ? `${res.travelTime} min` : "--",
          via: res.path.length > 2 ? res.path.slice(1, -1).map(id => appState.nodes.find(n => n.id === id)?.name || id).join(" → ") : "Direct Path"
        };
      }
      return e;
    });

    setAppState(prev => ({
      ...prev,
      emergencies: updatedEmergencies,
      logs: [log1, log2, log3, ...prev.logs]
    }));
  };

  // Auto-run routing on initial mount or emergency selection change
  useEffect(() => {
    const startId = getStartNodeIdForEmergency(activeSelectedEmergency);
    handleRunRouting(selectedAlgorithm, startId, targetHospitalId);
  }, [selectedEmergencyId, selectedAlgorithm, targetHospitalId]);

  // Handler: Dispatch Emergency
  const handleDispatchEmergency = (newReq) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const nextNum = appState.emergencies.length + 104;
    const newId = `#${nextNum}`;

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
    }

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

  // Handler: Simulation Trigger & Auto-Reroute
  const handleTriggerSimulation = (eventType) => {
    simEngine.triggerEvent(eventType, appState, setAppState);

    // If road blockage event, re-calculate routing and log alternative path
    if (eventType === "road_block_r17") {
      setTimeout(() => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const startId = getStartNodeIdForEmergency(activeSelectedEmergency);

        const newRes = calculateRoute({
          algorithm: selectedAlgorithm,
          startNodeId: startId,
          targetNodeId: targetHospitalId,
          graph
        });

        const bench = runBenchmark(startId, targetHospitalId, graph);

        setRouteResult(newRes);
        setBenchmarkResult(bench);

        const rerouteLog1 = {
          id: Date.now(),
          time: timestamp,
          type: "warning",
          text: `Recalculating route using ${selectedAlgorithm} due to road blockage`
        };
        const rerouteLog2 = {
          id: Date.now() + 1,
          time: timestamp,
          type: newRes.status === "FOUND" ? "assign" : "warning",
          text: newRes.status === "FOUND"
            ? `Alternative route found: ${newRes.distance} km (${newRes.travelTime} min)`
            : `NO ROUTE AVAILABLE after road blockage`
        };

        setAppState(prev => ({
          ...prev,
          logs: [rerouteLog1, rerouteLog2, ...prev.logs]
        }));
      }, 50);
    }
  };

  // Derived metrics
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

          {/* Grid Layout: Live Map & Right Panels */}
          <div className="dashboard-grid-row">
            {/* Interactive Map */}
            <div className="grid-col-map">
              <Map 
                nodes={appState.nodes} 
                roads={appState.roads} 
                selectedNodeId={selectedNodeId}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                calculatedPath={routeResult?.path || []}
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

          {/* Bottom Cards Row 1: Active Emergency, Route Summary & Benchmarking, Assigned Resources */}
          <div className="bottom-cards-grid">
            <ActiveEmergencyCard 
              emergencies={appState.emergencies}
              selectedEmergencyId={selectedEmergencyId}
              onSelectEmergency={(id) => setSelectedEmergencyId(id)}
              hospitals={appState.hospitals}
            />
            <RouteSummary 
              routeResult={routeResult}
              benchmarkResult={benchmarkResult}
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmChange={(algo) => setSelectedAlgorithm(algo)}
              targetHospitalId={targetHospitalId}
              onTargetHospitalChange={(targetId) => setTargetHospitalId(targetId)}
              hospitals={appState.hospitals}
              onRunRouting={() => handleRunRouting()}
            />
            <AssignedResources 
              emergency={activeSelectedEmergency}
            />
          </div>

          {/* Bottom Cards Row 2: Recent Logs, Capacity Cards, Simulation Controls */}
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
