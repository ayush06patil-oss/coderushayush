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
import HospitalEvaluationCard from './components/HospitalEvaluationCard';
import ScalabilityBenchmarkCard from './components/ScalabilityBenchmarkCard';
import MassDashboardCard from './components/MassDashboardCard';
import RoadFailureDemo from './components/RoadFailureDemo';
import DecisionLogCollapsible from './components/DecisionLogCollapsible';
import RouteDebugPanel from './components/RouteDebugPanel';
import Map from './components/Map';

import { RuralGraph } from './graph/graph';
import { generateMassSimulationDataset } from './data/massDatasetGenerator';
import { SimulationEngine } from './simulation/simulation';
import { calculateRoute } from './algorithms/routingEngine';
import { runBenchmark } from './algorithms/benchmark';
import { findActivePathEdge } from './algorithms/routeValidator';
import { evaluateHospitals, selectBestAmbulance } from './engine/healthcareMatcher';
import { interpolatePathPosition } from './utils/pathInterpolator';

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

  // 50,000-Node Network Scale Toggle State
  const [networkMode, setNetworkMode] = useState("standard"); // "standard" or "50k"

  // Active Emergency State
  const [currentEmergency, setCurrentEmergency] = useState(INITIAL_EMERGENCY);

  // Routing Results & Resilience State
  const [routeResult, setRouteResult] = useState(null);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [blockedEdgeInfo, setBlockedEdgeInfo] = useState(null);
  const [previousDistance, setPreviousDistance] = useState(null);
  const [previousPathNames, setPreviousPathNames] = useState([]);

  // Live Ambulance Telemetry & Simulation State
  const [ambulanceSimState, setAmbulanceSimState] = useState({
    isDispatched: false,
    isPaused: false,
    progressPct: 0,
    assignedAmbulanceCode: "Ambulance #04"
  });

  // Standard Application Data State
  const [appState, setAppState] = useState({
    nodes: MOCK_NODES,
    roads: MOCK_ROADS,
    ambulances: MOCK_AMBULANCES,
    hospitals: MOCK_NODES.filter(n => n.type === 'hospital'),
    doctors: MOCK_DOCTORS,
    logs: INITIAL_LOGS,
    capacity: INITIAL_CAPACITY,
    bedsAvailableCount: 72,
    medicineStockPct: 82
  });

  // Memoized 50,000-Node & 208,652-Edge Mass Simulation Dataset Generation
  const massData = useMemo(() => {
    return generateMassSimulationDataset();
  }, []);

  // Standard 10-Node Graph initialization
  const standardGraph = useMemo(() => {
    const g = new RuralGraph();
    appState.nodes.forEach(n => g.addNode(n));
    appState.roads.forEach(r => g.addEdge(r));
    return g;
  }, [appState.nodes, appState.roads]);

  // Active Graph Instance based on networkMode ("standard" vs "50k")
  const activeGraph = useMemo(() => {
    return networkMode === "50k" ? massData.graph : standardGraph;
  }, [networkMode, massData.graph, standardGraph]);

  const activeNodes = useMemo(() => {
    return networkMode === "50k" ? massData.nodes : appState.nodes;
  }, [networkMode, massData.nodes, appState.nodes]);

  const activeRoads = useMemo(() => {
    return networkMode === "50k" ? massData.roads : appState.roads;
  }, [networkMode, massData.roads, appState.roads]);

  const activeHospitals = useMemo(() => {
    return networkMode === "50k" ? massData.hospitals : appState.hospitals;
  }, [networkMode, massData.hospitals, appState.hospitals]);

  // Simulation Engine instance
  const simEngine = useMemo(() => {
    return new SimulationEngine(activeGraph);
  }, [activeGraph]);

  // Robust start node resolution across standard & 50k mass mode
  const getStartNodeId = (emergency) => {
    const villageName = emergency?.village || "Village D";
    if (networkMode === "50k" && massData.villages) {
      const foundVillage = massData.villages.find(v => v.name.toLowerCase() === villageName.toLowerCase());
      if (foundVillage && foundVillage.nearestNodeId) return foundVillage.nearestNodeId;
    }
    const foundNode = activeNodes.find(n => n.name.toLowerCase() === villageName.toLowerCase());
    if (foundNode) return foundNode.id;
    return networkMode === "50k" ? "node_v_d" : "node_v_d";
  };

  // Phase 3: Dynamic Healthcare Evaluation Result
  const evaluationResult = useMemo(() => {
    const startId = getStartNodeId(currentEmergency);
    return evaluateHospitals(
      currentEmergency,
      activeHospitals,
      { cardiacMedicine: { availablePct: appState.medicineStockPct } },
      activeGraph,
      startId
    );
  }, [currentEmergency, activeHospitals, appState.medicineStockPct, activeGraph]);

  // Dynamic calculation of live ambulance coordinates on map
  const ambulancePos = useMemo(() => {
    const path = routeResult?.path || [];
    return interpolatePathPosition(path, ambulanceSimState.progressPct, activeNodes);
  }, [routeResult?.path, ambulanceSimState.progressPct, activeNodes]);

  // Live Animation Loop for Ambulance Transit
  useEffect(() => {
    let intervalId = null;

    if (ambulanceSimState.isDispatched && !ambulanceSimState.isPaused && ambulanceSimState.progressPct < 100) {
      intervalId = setInterval(() => {
        setAmbulanceSimState(prev => {
          const nextPct = Math.min(100, prev.progressPct + 1.2);
          
          if (nextPct >= 100 && prev.progressPct < 100) {
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
            setAppState(aPrev => ({
              ...aPrev,
              logs: [
                {
                  id: Date.now(),
                  time: timestamp,
                  type: "assign",
                  text: `${prev.assignedAmbulanceCode} arrived at Hospital C — Patient transferred successfully`
                },
                ...aPrev.logs
              ]
            }));
          }

          return { ...prev, progressPct: nextPct };
        });
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ambulanceSimState.isDispatched, ambulanceSimState.isPaused, ambulanceSimState.progressPct]);

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
    setAmbulanceSimState({ isDispatched: false, isPaused: false, progressPct: 0, assignedAmbulanceCode: "Ambulance #04" });

    const log1 = { id: Date.now(), time: timestamp, type: "create", text: `Emergency ${newId} created (${req.village})` };
    const log2 = { id: Date.now() + 1, time: timestamp, type: "info", text: `Required specialist: ${req.type}` };

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
    const hospitalNode = activeNodes.find(n => n.id === hospitalId);

    setTargetHospitalId(hospitalId);

    // Dynamic Phase 3 Ambulance Selection based on route travel time to emergency
    const startId = getStartNodeId(currentEmergency);
    const ambSelect = selectBestAmbulance(startId, appState.ambulances, activeGraph);

    const assignedCode = ambSelect.bestAmbulance ? ambSelect.bestAmbulance.code : "Ambulance #04";

    const log1 = {
      id: Date.now(),
      time: timestamp,
      type: "warning",
      text: "Hospital B rejected — cardiologist unavailable"
    };

    const log2 = {
      id: Date.now() + 1,
      time: timestamp,
      type: "assign",
      text: `${hospitalNode?.name || "Hospital C"} selected — cardiologist & bed available`
    };

    const log3 = {
      id: Date.now() + 2,
      time: timestamp,
      type: "assign",
      text: `${assignedCode} selected based on nearest route travel time`
    };

    setAppState(prev => ({
      ...prev,
      bedsAvailableCount: Math.max(0, prev.bedsAvailableCount - 1),
      medicineStockPct: Math.max(0, prev.medicineStockPct - 2),
      hospitals: prev.hospitals.map(h => h.id === hospitalId ? { ...h, bedsAvailable: Math.max(0, h.bedsAvailable - 1) } : h),
      logs: [log1, log2, log3, ...prev.logs]
    }));

    setAmbulanceSimState(prev => ({ ...prev, assignedAmbulanceCode: assignedCode }));

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
      graph: activeGraph
    });

    // Run dual benchmark
    const bench = runBenchmark(startId, targetHospitalId, activeGraph);

    setRouteResult(res);
    setBenchmarkResult(bench);
    setAmbulanceSimState(prev => ({ ...prev, isDispatched: false, isPaused: false, progressPct: 0 }));

    const log1 = {
      id: Date.now(),
      time: timestamp,
      type: "route",
      text: `${res.algorithm} routing started (${networkMode === "50k" ? "50,000 Nodes / 208,652 Edges" : "Standard Graph"})`
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
    const activeEdge = findActivePathEdge(routeResult.path, activeRoads, activeNodes);

    if (!activeEdge) return;

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    setPreviousDistance(routeResult.distance);
    setPreviousPathNames(
      routeResult.path.map(id => activeNodes.find(n => n.id === id)?.name || id)
    );

    setBlockedEdgeInfo(activeEdge);

    if (networkMode === "50k") {
      massData.graph.setRoadBlocked(activeEdge.roadId, true);
    }

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

    const newRes = calculateRoute({
      algorithm: selectedAlgorithm,
      startNodeId: startId,
      targetNodeId: targetHospitalId,
      graph: activeGraph
    });

    const bench = runBenchmark(startId, targetHospitalId, activeGraph);

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

    if (blockedEdgeInfo) {
      activeGraph.setRoadBlocked(blockedEdgeInfo.roadId, false);
    }

    const unblockedRoads = appState.roads.map(r => ({ ...r, blocked: false }));

    const originalRes = calculateRoute({
      algorithm: selectedAlgorithm,
      startNodeId: startId,
      targetNodeId: targetHospitalId,
      graph: activeGraph
    });

    const bench = runBenchmark(startId, targetHospitalId, activeGraph);

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

  // DISPATCH HANDLERS: Dispatch, Pause/Resume, Reset Ambulance Simulation
  const handleDispatchAmbulance = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setAmbulanceSimState(prev => ({
      ...prev,
      isDispatched: true,
      isPaused: false,
      progressPct: 0
    }));

    const log = {
      id: Date.now(),
      time: timestamp,
      type: "assign",
      text: `${ambulanceSimState.assignedAmbulanceCode} dispatched to ${currentEmergency?.village || "Village D"}`
    };
    setAppState(prev => ({
      ...prev,
      logs: [log, ...prev.logs]
    }));
  };

  const handlePauseResumeAmbulance = () => {
    setAmbulanceSimState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleResetAmbulance = () => {
    setAmbulanceSimState(prev => ({ ...prev, isDispatched: false, isPaused: false, progressPct: 0 }));
  };

  // Auto-calculate initial demo route on mount and when networkMode changes
  useEffect(() => {
    const startId = getStartNodeId(currentEmergency);
    const res = calculateRoute({
      algorithm: selectedAlgorithm,
      startNodeId: startId,
      targetNodeId: targetHospitalId,
      graph: activeGraph
    });
    const bench = runBenchmark(startId, targetHospitalId, activeGraph);
    setRouteResult(res);
    setBenchmarkResult(bench);
  }, [networkMode]);

  const isRoadBlockedState = !!blockedEdgeInfo;

  const currentPathNodeNames = (routeResult?.path || [])
    .map(id => activeNodes.find(n => n.id === id)?.name || id);

  return (
    <div className="app-layout">
      {/* 1. Header with Network Scale Selector */}
      <Header 
        systemTime="10:32 AM" 
        networkMode={networkMode}
        onToggleNetworkMode={(mode) => setNetworkMode(mode)}
      />

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
                  evaluationResult={evaluationResult}
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

              {/* Step 4: Ambulance Dispatch & Telemetry Panel */}
              {currentStep >= 4 && (
                <AmbulanceDispatchPanel 
                  ambulanceCode={ambulanceSimState.assignedAmbulanceCode}
                  from={currentEmergency?.village || "Village D"}
                  to="Hospital C"
                  totalDistance={routeResult?.distance || 19.6}
                  totalTravelTime={routeResult?.travelTime || 25}
                  isDispatched={ambulanceSimState.isDispatched}
                  isPaused={ambulanceSimState.isPaused}
                  progressPct={ambulanceSimState.progressPct}
                  onDispatch={handleDispatchAmbulance}
                  onPauseResume={handlePauseResumeAmbulance}
                  onReset={handleResetAmbulance}
                />
              )}
            </div>

            {/* Right Column: Live Map Canvas with Dynamic DOM-Light Ambulance Positioning */}
            <div className="demo-map-col">
              <Map 
                nodes={appState.nodes} 
                roads={appState.roads} 
                selectedNodeId={selectedNodeId}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                calculatedPath={routeResult?.path || []}
                ambulancePos={ambulancePos}
                isAmbulanceDispatched={ambulanceSimState.isDispatched}
              />
            </div>
          </div>

          {/* Mass Simulation Live Dashboard Card (50,000 Nodes, 208,652 Edges, 5,000 Locations) */}
          {networkMode === "50k" && (
            <MassDashboardCard massData={massData} />
          )}

          {/* 50,000-Node Scalability Benchmark Card */}
          {networkMode === "50k" && (
            <ScalabilityBenchmarkCard 
              totalNodes={massData.totalNodes}
              totalEdges={massData.totalEdges}
              initTimeMs={massData.initTimeMs}
              benchmarkResult={benchmarkResult}
              activeAlgorithm={selectedAlgorithm}
            />
          )}

          {/* 4. Live Resource Status Summary Card */}
          <LiveResourcesCard 
            ambulancesAvailableStr={ambulanceSimState.isDispatched ? "4 / 8" : "5 / 8"}
            hospitalsOnline={appState.hospitals.length}
            bedsAvailable={appState.bedsAvailableCount}
            bedsTotal={100}
            medicinePct={appState.medicineStockPct}
          />

          {/* 5. Algorithm Comparison Card (Dijkstra vs A*) */}
          {benchmarkResult && (
            <AlgorithmComparisonCard benchmarkResult={benchmarkResult} />
          )}

          {/* Transparent Hospital Evaluation Card (Phase 3 Constraint Display) */}
          <HospitalEvaluationCard 
            evaluationResult={evaluationResult}
            currentEmergency={currentEmergency}
          />

          {/* Dev Debug Panel for Path & Metric Audit */}
          <RouteDebugPanel 
            routeResult={routeResult} 
            graph={activeGraph} 
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
