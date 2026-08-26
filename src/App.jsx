import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import WorkflowStepper from './components/WorkflowStepper';
import Step1Emergency from './components/Step1Emergency';
import Step2HospitalMatching from './components/Step2HospitalMatching';
import Step3RoutingControls from './components/Step3RoutingControls';
import RouteResultCard from './components/RouteResultCard';
import AlgorithmComparisonCard from './components/AlgorithmComparisonCard';
import RoadFailureDemo from './components/RoadFailureDemo';
import AmbulanceDispatchPanel from './components/AmbulanceDispatchPanel';
import DecisionLogCollapsible from './components/DecisionLogCollapsible';
import Map from './components/Map';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState("node_v_a");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("astar");
  const [targetHospitalId, setTargetHospitalId] = useState("node_h_c");

  // Active Emergency State
  const [currentEmergency, setCurrentEmergency] = useState(INITIAL_EMERGENCY);

  // Routing Results State
  const [routeResult, setRouteResult] = useState(null);
  const [benchmarkResult, setBenchmarkResult] = useState(null);

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

  // Helper: Get node ID for emergency village
  const getStartNodeId = (emergency) => {
    const villageName = emergency?.village || "Village A";
    const foundNode = appState.nodes.find(n => n.name.toLowerCase() === villageName.toLowerCase());
    return foundNode ? foundNode.id : "node_v_a";
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
      text: `${hospitalNode?.name || "Hospital C"} selected as destination (${currentEmergency?.type} available)`
    };

    setAppState(prev => ({
      ...prev,
      logs: [log, ...prev.logs]
    }));

    // Advance to Step 3: Routing Engine
    setCurrentStep(3);
  };

  // STEP 3 HANDLER: Calculate Route
  const handleCalculateRoute = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const startId = getStartNodeId(currentEmergency);

    // Run primary algorithm calculation
    const res = calculateRoute({
      algorithm: selectedAlgorithm,
      startNodeId: startId,
      targetNodeId: targetHospitalId,
      graph
    });

    // Run dual benchmark execution
    const bench = runBenchmark(startId, targetHospitalId, graph);

    setRouteResult(res);
    setBenchmarkResult(bench);

    const log1 = {
      id: Date.now(),
      time: timestamp,
      type: "route",
      text: `${res.algorithm} routing started for ${currentEmergency?.id || "#101"}`
    };
    const log2 = {
      id: Date.now() + 1,
      time: timestamp,
      type: res.status === "FOUND" ? "assign" : "warning",
      text: res.status === "FOUND" 
        ? `Route found: ${res.distance} km (${res.travelTime} min) | Visited nodes: ${res.visitedNodes}`
        : `No valid route available`
    };

    setAppState(prev => ({
      ...prev,
      logs: [log1, log2, ...prev.logs]
    }));
  };

  // RESILIENCE HANDLER: Block Route Road
  const handleBlockRouteRoad = () => {
    simEngine.triggerEvent("road_block_r17", appState, setAppState);
  };

  // RESILIENCE HANDLER: Re-Calculate Route
  const handleRecalculateRoute = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const startId = getStartNodeId(currentEmergency);

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

  // DISPATCH HANDLER: Dispatch Ambulance
  const handleDispatchAmbulance = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const log = {
      id: Date.now(),
      time: timestamp,
      type: "assign",
      text: `Ambulance #02 assigned and dispatched to ${currentEmergency?.village || "Village A"}`
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

  const isRoadR17Blocked = appState.roads.find(r => r.id === "road_r17")?.blocked;

  const currentPathNodeNames = (routeResult?.path || ["node_v_a", "node_v_b", "node_v_d", "node_h_c"])
    .map(id => appState.nodes.find(n => n.id === id)?.name || id);

  return (
    <div className="app-layout">
      {/* Header Bar */}
      <Header systemTime="10:32 AM" />

      <div className="app-body">
        <main className="main-content demo-flow-content">
          {/* Section 2: 3-Step Demo Workflow Stepper */}
          <WorkflowStepper 
            currentStep={currentStep} 
            onStepClick={(stepNum) => setCurrentStep(stepNum)}
          />

          {/* Main 2-Column Grid: Step Panels & Live Map */}
          <div className="demo-main-grid">
            {/* Left Column: Interactive Step Panels */}
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

              {/* Step 3: Routing Engine */}
              {currentStep >= 3 && (
                <Step3RoutingControls 
                  selectedAlgorithm={selectedAlgorithm}
                  onAlgorithmChange={(algo) => {
                    setSelectedAlgorithm(algo);
                    handleRunRouting(algo);
                  }}
                  fromLocation={currentEmergency?.village || "Village A"}
                  toLocation="Hospital C"
                  onCalculateRoute={handleCalculateRoute}
                />
              )}

              {/* Prominent Route Result Card */}
              {routeResult && (
                <RouteResultCard routeResult={routeResult} />
              )}

              {/* Compact Ambulance Dispatch Panel */}
              {routeResult && routeResult.status === "FOUND" && (
                <AmbulanceDispatchPanel 
                  ambulanceCode="Ambulance #02"
                  status="En Route"
                  from={currentEmergency?.village || "Village A"}
                  to="Hospital C"
                  onDispatch={handleDispatchAmbulance}
                />
              )}
            </div>

            {/* Right Column: Main Live Map */}
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

          {/* Middle Row: Algorithm Comparison (Dijkstra vs A*) */}
          {benchmarkResult && (
            <AlgorithmComparisonCard benchmarkResult={benchmarkResult} />
          )}

          {/* Bottom Row: Test Resilience (Road Block & Re-Routing Demo) */}
          <RoadFailureDemo 
            currentPathNames={currentPathNodeNames}
            isRoadBlocked={isRoadR17Blocked}
            onBlockRoad={handleBlockRouteRoad}
            onRecalculateRoute={handleRecalculateRoute}
            hasAlternativeRoute={routeResult?.status === "FOUND"}
          />

          {/* Bottom Collapsible Decision Log Stream */}
          <DecisionLogCollapsible logs={appState.logs} />
        </main>
      </div>
    </div>
  );
}
