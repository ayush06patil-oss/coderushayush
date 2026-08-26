import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import WorkflowStepper from './components/WorkflowStepper';
import Step1Emergency from './components/Step1Emergency';
import Step2HospitalMatching from './components/Step2HospitalMatching';
import Step3RoutingControls from './components/Step3RoutingControls';
import RouteResultCard from './components/RouteResultCard';
import AmbulanceDispatchPanel from './components/AmbulanceDispatchPanel';
import LiveResourcesCard from './components/LiveResourcesCard';
import AlgorithmComparisonCard from './components/AlgorithmComparisonCard';
import RoadFailureDemo from './components/RoadFailureDemo';
import DecisionLogCollapsible from './components/DecisionLogCollapsible';
import RouteDebugPanel from './components/RouteDebugPanel';
import Map from './components/Map';

import { RuralGraph } from './graph/graph';
import { SimulationEngine } from './simulation/simulation';
import { calculateRoute } from './algorithms/routingEngine';
import { runBenchmark } from './algorithms/benchmark';
import { findActivePathEdge } from './algorithms/routeValidator';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState("node_v_d");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("astar");
  const [targetHospitalId, setTargetHospitalId] = useState("node_h_c");

  // Active Emergency State
  const [currentEmergency, setCurrentEmergency] = useState(INITIAL_EMERGENCY);

  // Routing Results & Resilience State
  const [routeResult, setRouteResult] = useState(null);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [blockedEdgeInfo, setBlockedEdgeInfo] = useState(null);
  const [previousDistance, setPreviousDistance] = useState(null);
  const [previousPathNames, setPreviousPathNames] = useState([]);

  // Unified Application State
  const [appState, setAppState] = useState({
    nodes: MOCK_NODES,
    roads: MOCK_ROADS,
    ambulances: MOCK_AMBULANCES,
    hospitals: MOCK_NODES.filter(n => n.type === 'hospital'),
    doctors: MOCK_DOCTORS,
    logs: INITIAL_LOGS,
    capacity: INITIAL_CAPACITY
  });

  // Graph instance initialization - updates automatically when appState.roads changes!
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

  // Helper: Get start node ID from emergency village
  const getStartNodeId = (emergency) => {
    const villageName = emergency?.village || "Village D";
    const foundNode = appState.nodes.find(n => n.name.toLowerCase() === villageName.toLowerCase());
    return foundNode ? foundNode.id : "node_v_d";
  };

  // STEP 1 HANDLER: Create Emergency
  const handleCreateEmergency = (req) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newId = `#${Math.floor(103 + Math.random() * 900)}`;

    const newEmergency = {
      id: newId,
      village: req.village,
      type: req.type,
      urgency: req.urgency,
      requestedAt: timestamp,
      status: "Created"
    };

    setCurrentEmergency(newEmergency);

    const log1 = { id: Date.now(), time: timestamp, type: "create", text: `Emergency ${newId} created (${req.village})` };
    const log2 = { id: Date.now() + 1, time: timestamp, type: "info", text: `${req.type} requirement detected` };

    setAppState(prev => ({
      ...prev,
      logs: [log1, log2, ...prev.logs]
    }));

    // Advance to Step 2: Hospital Matching
    setCurrentStep(2);
  };

  // STEP 2 HANDLER: Select Hospital Destination
  const handleSelectDestination = (hospitalId) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const hospitalNode = appState.nodes.find(n => n.id === hospitalId);

    setTargetHospitalId(hospitalId);

    const log = {
      id: Date.now(),
      time: timestamp,
      type: "assign",
      text: `${hospitalNode?.name || "Hospital C"} selected — cardiologist available`
    };

    setAppState(prev => ({
      ...prev,
      logs: [log, ...prev.logs]
    }));

    // Advance to Step 3: Routing Engine
    setCurrentStep(3);
  };

  // STEP 3 HANDLER: Calculate Route
  const handleCalculateRoute = (algoOverride) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const startId = getStartNodeId(currentEmergency);
    const algoToRun = algoOverride || selectedAlgorithm;

    // Run algorithm calculation
    const res = calculateRoute({
      algorithm: algoToRun,
      startNodeId: startId,
      targetNodeId: targetHospitalId,
      graph
    });

    // Run dual benchmark
    const bench = runBenchmark(startId, targetHospitalId, graph);

    setRouteResult(res);
    setBenchmarkResult(bench);

    const log1 = {
      id: Date.now(),
      time: timestamp,
      type: "route",
      text: `${res.algorithm} routing started`
    };
    const log2 = {
      id: Date.now() + 1,
      time: timestamp,
      type: res.status === "FOUND" ? "assign" : "warning",
      text: res.status === "FOUND" 
        ? `Optimal route found — ${res.distance} km (${res.travelTime} min)`
        : `No valid route available`
    };

    setAppState(prev => ({
      ...prev,
      logs: [log1, log2, ...prev.logs]
    }));

    // Automatically advance Step 3 -> Step 4 (Ambulance Dispatch)
    setCurrentStep(4);
  };

  // RESILIENCE HANDLER 1: Block a Road Actually Present on Active Route
  const handleBlockRouteRoad = () => {
    if (!routeResult || !routeResult.path || routeResult.path.length < 2) return;

    // Dynamically find an edge that is ACTUALLY present on the current algorithm path
    const activeEdge = findActivePathEdge(routeResult.path, appState.roads, appState.nodes);

    if (!activeEdge) return;

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Store previous metrics for comparison display
    setPreviousDistance(routeResult.distance);
    setPreviousPathNames(
      routeResult.path.map(id => appState.nodes.find(n => n.id === id)?.name || id)
    );

    // Save blocked edge details
    setBlockedEdgeInfo(activeEdge);

    // Update appState.roads to mark this specific edge as blocked
    setAppState(prev => ({
      ...prev,
      roads: prev.roads.map(r => 
        r.id === activeEdge.roadId ? { ...r, blocked: true } : r
      ),
      logs: [
        {
          id: Date.now(),
          time: timestamp,
          type: "warning",
          text: `Road ${activeEdge.roadName} (${activeEdge.fromName} → ${activeEdge.toName}) blocked on active route`
        },
        ...prev.logs
      ]
    }));
  };

  // RESILIENCE HANDLER 2: Re-Calculate Route Against Updated Graph
  const handleRecalculateRoute = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const startId = getStartNodeId(currentEmergency);

    // Run selected algorithm on updated graph with blocked edge
    const newRes = calculateRoute({
      algorithm: selectedAlgorithm,
      startNodeId: startId,
      targetNodeId: targetHospitalId,
      graph
    });

    const bench = runBenchmark(startId, targetHospitalId, graph);

    setRouteResult(newRes);
    setBenchmarkResult(bench);

    const log1 = {
      id: Date.now(),
      time: timestamp,
      type: "warning",
      text: `Re-routing started using ${selectedAlgorithm}`
    };
    const log2 = {
      id: Date.now() + 1,
      time: timestamp,
      type: newRes.status === "FOUND" ? "assign" : "warning",
      text: newRes.status === "FOUND"
        ? `Alternative route found: ${newRes.distance} km (${newRes.travelTime} min)`
        : `No valid route available after road blockage`
    };

    setAppState(prev => ({
      ...prev,
      logs: [log1, log2, ...prev.logs]
    }));
  };

  // RESILIENCE HANDLER 3: Reset Road to Unblocked State
  const handleResetRoad = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const startId = getStartNodeId(currentEmergency);

    // Reset all roads to unblocked in appState
    const unblockedRoads = appState.roads.map(r => ({ ...r, blocked: false }));

    // Re-build clean graph
    const cleanGraph = new RuralGraph();
    appState.nodes.forEach(n => cleanGraph.addNode(n));
    unblockedRoads.forEach(r => cleanGraph.addEdge(r));

    // Re-run algorithm on unblocked graph
    const originalRes = calculateRoute({
      algorithm: selectedAlgorithm,
      startNodeId: startId,
      targetNodeId: targetHospitalId,
      graph: cleanGraph
    });

    const bench = runBenchmark(startId, targetHospitalId, cleanGraph);

    setRouteResult(originalRes);
    setBenchmarkResult(bench);
    setBlockedEdgeInfo(null);
    setPreviousDistance(null);
    setPreviousPathNames([]);

    setAppState(prev => ({
      ...prev,
      roads: unblockedRoads,
      logs: [
        {
          id: Date.now(),
          time: timestamp,
          type: "assign",
          text: `Road unblocked, original optimal route restored (${originalRes.distance} km)`
        },
        ...prev.logs
      ]
    }));
  };

  // DISPATCH HANDLER: Dispatch Ambulance
  const handleDispatchAmbulance = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const log = {
      id: Date.now(),
      time: timestamp,
      type: "assign",
      text: `Ambulance #02 dispatched to ${currentEmergency?.village || "Village D"}`
    };
    setAppState(prev => ({
      ...prev,
      logs: [log, ...prev.logs]
    }));
  };

  // Auto-calculate initial demo route on mount
  useEffect(() => {
    const startId = getStartNodeId(currentEmergency);
    const res = calculateRoute({
      algorithm: selectedAlgorithm,
      startNodeId: startId,
      targetNodeId: targetHospitalId,
      graph
    });
    const bench = runBenchmark(startId, targetHospitalId, graph);
    setRouteResult(res);
    setBenchmarkResult(bench);
  }, []);

  const isRoadBlockedState = !!blockedEdgeInfo;

  const currentPathNodeNames = (routeResult?.path || [])
    .map(id => appState.nodes.find(n => n.id === id)?.name || id);

  return (
    <div className="app-layout">
      {/* 1. Header */}
      <Header systemTime="10:32 AM" />

      <div className="app-body">
        <main className="main-content demo-flow-content">
          {/* 2. 4-Step Workflow Stepper */}
          <WorkflowStepper 
            currentStep={currentStep} 
            onStepClick={(stepNum) => setCurrentStep(stepNum)}
          />

          {/* 3. Main 2-Column Grid: Step Panels & Live Map */}
          <div className="demo-main-grid">
            {/* Left Column: Active Step Controls */}
            <div className="demo-controls-col">
              {/* Step 1: Emergency Request */}
              {currentStep === 1 && (
                <Step1Emergency 
                  villages={appState.nodes.filter(n => n.type === 'village')}
                  onCreateEmergency={handleCreateEmergency}
                />
              )}

              {/* Step 2: Healthcare Matching */}
              {currentStep === 2 && (
                <Step2HospitalMatching 
                  currentEmergency={currentEmergency}
                  hospitals={appState.hospitals}
                  onSelectDestination={handleSelectDestination}
                />
              )}

              {/* Step 3: Routing Engine Controls */}
              {currentStep === 3 && (
                <Step3RoutingControls 
                  selectedAlgorithm={selectedAlgorithm}
                  onAlgorithmChange={(algo) => {
                    setSelectedAlgorithm(algo);
                    handleCalculateRoute(algo);
                  }}
                  fromLocation={currentEmergency?.village || "Village D"}
                  toLocation="Hospital C"
                  onCalculateRoute={() => handleCalculateRoute()}
                />
              )}

              {/* Step 4 / Route Found Summary */}
              {currentStep >= 3 && routeResult && (
                <RouteResultCard routeResult={routeResult} />
              )}

              {/* Step 4: Ambulance Dispatch Panel */}
              {currentStep >= 4 && (
                <AmbulanceDispatchPanel 
                  ambulanceCode="Ambulance #02"
                  from={currentEmergency?.village || "Village D"}
                  to="Hospital C"
                  distance={routeResult?.distance ? `${routeResult.distance} km` : "19.6 km"}
                  eta={routeResult?.travelTime ? `${routeResult.travelTime} min` : "25 min"}
                  onDispatch={handleDispatchAmbulance}
                />
              )}
            </div>

            {/* Right Column: Live Map Canvas */}
            <div className="demo-map-col">
              <Map 
                nodes={appState.nodes} 
                roads={appState.roads} 
                selectedNodeId={selectedNodeId}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                calculatedPath={routeResult?.path || []}
              />
            </div>
          </div>

          {/* 4. Live Resource Status Summary Card */}
          <LiveResourcesCard 
            ambulancesAvailableStr="4 / 8"
            hospitalsOnline={appState.hospitals.length}
            bedsAvailable={72}
            bedsTotal={100}
            medicinePct={82}
          />

          {/* 5. Algorithm Comparison Card (Dijkstra vs A*) */}
          {benchmarkResult && (
            <AlgorithmComparisonCard benchmarkResult={benchmarkResult} />
          )}

          {/* Dev Debug Panel for Path & Metric Audit */}
          <RouteDebugPanel 
            routeResult={routeResult} 
            graph={graph} 
            blockedEdgeInfo={blockedEdgeInfo}
          />

          {/* 6. Optional Test Routing Resilience (Road Block & Re-Routing Demo) */}
          <RoadFailureDemo 
            currentPathNames={currentPathNodeNames}
            previousPathNames={previousPathNames}
            previousDistance={previousDistance}
            newDistance={routeResult?.distance}
            blockedEdgeInfo={blockedEdgeInfo}
            isRoadBlocked={isRoadBlockedState}
            onBlockRoad={handleBlockRouteRoad}
            onRecalculateRoute={handleRecalculateRoute}
            onResetRoad={handleResetRoad}
            hasAlternativeRoute={routeResult?.status === "FOUND"}
          />

          {/* 7. Collapsible Decision Log Stream */}
          <DecisionLogCollapsible logs={appState.logs} />
        </main>
      </div>
    </div>
  );
}
