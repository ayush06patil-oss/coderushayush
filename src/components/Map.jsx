import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Minus, 
  Navigation, 
  Home, 
  Building2, 
  PlusSquare, 
  Truck, 
  X,
  CheckCircle2,
  XCircle,
  Activity,
  Maximize2
} from 'lucide-react';

export default function Map({ 
  nodes = [], 
  roads = [], 
  hospitals = [],
  villages = [],
  networkMode = "standard",
  selectedNodeId, 
  onSelectNode,
  calculatedPath = [], 
  ambulancePos = null,  
  isAmbulanceDispatched = false
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePopupNode, setActivePopupNode] = useState(null);

  // Fast Map lookup dictionary for sub-millisecond node coordinate retrieval
  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  const getNodePos = (nodeId) => {
    const node = nodeMap.get(nodeId);
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
  };

  // Determine if a road edge strictly belongs to consecutive pairs in calculatedPath
  const isEdgeInCalculatedPath = (road) => {
    if (!calculatedPath || calculatedPath.length < 2) return false;
    for (let i = 0; i < calculatedPath.length - 1; i++) {
      const u = calculatedPath[i];
      const v = calculatedPath[i + 1];
      if ((road.from === u && road.to === v) || (road.from === v && road.to === u)) {
        return true;
      }
    }
    return false;
  };

  // Filter nodes for map display
  const displayNodes = useMemo(() => {
    if (networkMode === "50k") {
      // In 50k mode, display key demo hospitals, key villages, and nodes in active calculated path
      const pathNodeSet = new Set(calculatedPath);
      const sampleHospitals = hospitals.slice(0, 15);
      const sampleVillages = villages.slice(0, 15);
      const combined = [...sampleHospitals, ...sampleVillages];
      
      const filtered = nodes.filter(n => pathNodeSet.has(n.id) || combined.some(c => c.nearestNodeId === n.id || c.id === n.id));
      return filtered.slice(0, 80); // Cap displayed DOM badges for 60 FPS performance
    }

    // Standard mode: primary demo nodes
    const primaryScenarioNodeIds = ["node_v_a", "node_v_b", "node_v_d", "node_h_b", "node_h_c", "node_hc_1"];
    return nodes.filter(n => primaryScenarioNodeIds.includes(n.id) || calculatedPath.includes(n.id));
  }, [networkMode, nodes, hospitals, villages, calculatedPath]);

  // Sample road edges for SVG network mesh background
  const displayRoads = useMemo(() => {
    if (networkMode === "50k") {
      // Sample subset of background road mesh + ALL edges in calculatedPath
      const pathEdgeSet = new Set();
      if (calculatedPath && calculatedPath.length >= 2) {
        for (let i = 0; i < calculatedPath.length - 1; i++) {
          pathEdgeSet.add(`${calculatedPath[i]}_${calculatedPath[i+1]}`);
          pathEdgeSet.add(`${calculatedPath[i+1]}_${calculatedPath[i]}`);
        }
      }

      const sampleStep = Math.max(1, Math.floor(roads.length / 400));
      return roads.filter((r, idx) => idx % sampleStep === 0 || pathEdgeSet.has(`${r.from}_${r.to}`));
    }
    return roads;
  }, [networkMode, roads, calculatedPath]);

  const handleNodeClick = (node) => {
    setActivePopupNode(node);
    if (onSelectNode) onSelectNode(node.id);
  };

  // Fallback initial position for ambulance marker if ambulancePos not yet calculated
  const startNodePos = calculatedPath.length > 0 ? getNodePos(calculatedPath[0]) : { x: 51, y: 56 };
  const currentAmbX = ambulancePos ? ambulancePos.x : startNodePos.x;
  const currentAmbY = ambulancePos ? ambulancePos.y : startNodePos.y;

  return (
    <div className="map-card primary-demo-map">
      <div className="map-header">
        <h2 className="map-title inline-flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <span>Live Interactive Map</span>
          <span className={`badge ${networkMode === "50k" ? "badge-purple" : "badge-success"}`}>
            {networkMode === "50k" ? "50,000-Node Live Network Mesh" : "Live Animated Canvas"}
          </span>
        </h2>
        <div className="map-controls">
          <button className="map-ctrl-btn" onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.4))} title="Zoom In">
            <Plus size={16} />
          </button>
          <button className="map-ctrl-btn" onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.8))} title="Zoom Out">
            <Minus size={16} />
          </button>
          <button className="map-ctrl-btn" onClick={() => setZoomLevel(1)} title="Recenter / Fit Route">
            <Navigation size={16} />
          </button>
        </div>
      </div>

      <div className="map-viewport" style={{ transform: `scale(${zoomLevel})` }}>
        {/* SVG Network Mesh Canvas */}
        <svg className="map-svg-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
          {displayRoads.map((road) => {
            const from = getNodePos(road.from);
            const to = getNodePos(road.to);
            if (!from.x || !to.x) return null;

            const isPathEdge = isEdgeInCalculatedPath(road);

            let strokeClass = "road-line-normal";
            if (road.blocked) strokeClass = "road-line-blocked";
            else if (isPathEdge) strokeClass = "road-line-selected";

            return (
              <g key={road.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className={strokeClass}
                />

                {/* Blocked Road Warning Marker */}
                {road.blocked && (
                  <g transform={`translate(${(from.x + to.x) / 2}, ${(from.y + to.y) / 2})`}>
                    <circle r="2.8" fill="#DC2626" />
                    <line x1="-1.5" y1="-1.5" x2="1.5" y2="1.5" stroke="#FFFFFF" strokeWidth="1" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Travel Time Labels for Active Route Edges */}
        {displayRoads.map((road) => {
          const isPathEdge = isEdgeInCalculatedPath(road);
          if (!isPathEdge) return null;

          const from = getNodePos(road.from);
          const to = getNodePos(road.to);
          if (!from.x || !to.x) return null;

          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2 - 2;

          return (
            <div
              key={`label_${road.id}`}
              className="map-time-label active-path-label"
              style={{ left: `${midX}%`, top: `${midY}%` }}
            >
              {road.travelTime || 5} min
            </div>
          );
        })}

        {/* HTML Node Badges */}
        {displayNodes.map((node) => {
          let nodeIcon = <Home size={14} />;
          let nodeClass = "node-badge village";

          if (node.type === "hospital") {
            nodeIcon = <Building2 size={14} />;
            nodeClass = "node-badge hospital";
          } else if (node.type === "health_center") {
            nodeIcon = <PlusSquare size={14} />;
            nodeClass = "node-badge health-center";
          }

          const isSelected = selectedNodeId === node.id;
          const isInPath = calculatedPath.includes(node.id);

          return (
            <div
              key={node.id}
              className={`${nodeClass} ${isSelected ? 'selected-node-highlight' : ''} ${isInPath ? 'in-path-node' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => handleNodeClick(node)}
            >
              <span className="node-badge-icon">{nodeIcon}</span>
              <span className="node-badge-text">{node.name}</span>
            </div>
          );
        })}

        {/* Live Animated Ambulance Marker Overlay */}
        <div 
          className={`map-ambulance-marker ${isAmbulanceDispatched ? 'dispatched-active' : ''}`}
          style={{ 
            left: `${currentAmbX}%`, 
            top: `${currentAmbY}%`,
            transition: 'left 0.15s linear, top 0.15s linear'
          }}
          title="Ambulance #02 (Live GPS Tracking)"
          onClick={() => handleNodeClick({ 
            id: "amb_02", 
            name: "Ambulance #02", 
            type: "ambulance", 
            details: isAmbulanceDispatched ? "En Route on active 50k graph path" : "Stationed at origin" 
          })}
        >
          <Truck size={14} />
        </div>

        {/* Interactive Node Info Popup */}
        {activePopupNode && (
          <div 
            className="map-popup-card"
            style={{ 
              left: `${Math.min(activePopupNode.x || 50, 70)}%`, 
              top: `${Math.max((activePopupNode.y || 50) - 15, 10)}%` 
            }}
          >
            <div className="popup-header">
              <strong>{activePopupNode.name}</strong>
              <button className="popup-close-btn" onClick={() => setActivePopupNode(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="popup-body">
              <p className="popup-type">Type: <span className="capitalize">{activePopupNode.type || "Routing Node"}</span></p>
              {activePopupNode.distanceKm && <p>Distance: {activePopupNode.distanceKm} km</p>}
              {activePopupNode.population && <p>Population: {activePopupNode.population}</p>}
              {activePopupNode.bedsTotal !== undefined && (
                <p>
                  Beds: <strong className={activePopupNode.bedsAvailable === 0 ? "text-danger" : ""}>
                    {activePopupNode.bedsAvailable} / {activePopupNode.bedsTotal}
                  </strong>
                  {activePopupNode.bedsAvailable === 0 && <span className="badge badge-danger ml-1">FULL</span>}
                </p>
              )}
              {activePopupNode.specialists && (
                <p>Specialties: {activePopupNode.specialists.join(", ")}</p>
              )}
              {activePopupNode.type === "hospital" && (
                <p className="popup-specialist-check">
                  Cardiology: {activePopupNode.hasCardiologist ? (
                    <span className="text-success font-semibold inline-flex items-center gap-1"><CheckCircle2 size={12} /> Available</span>
                  ) : (
                    <span className="text-danger font-semibold inline-flex items-center gap-1"><XCircle size={12} /> Unavailable</span>
                  )}
                </p>
              )}
              {activePopupNode.details && <p>{activePopupNode.details}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-icon village-color"><Home size={14} /></span>
          <span>Village</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon hospital-color"><Building2 size={14} /></span>
          <span>Hospital</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon health-center-color"><PlusSquare size={14} /></span>
          <span>Health Center</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon ambulance-color"><Truck size={14} /></span>
          <span>Ambulance</span>
        </div>
        <div className="legend-item">
          <span className="legend-line blocked-line"></span>
          <span>Blocked Road</span>
        </div>
        <div className="legend-item">
          <span className="legend-line selected-line"></span>
          <span>Selected Route</span>
        </div>
      </div>
    </div>
  );
}
