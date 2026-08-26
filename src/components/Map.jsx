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
  ShieldCheck
} from 'lucide-react';

export default function Map({ 
  nodes = [], 
  roads = [], 
  hospitals = [],
  villages = [],
  networkMode = "standard",
  selectedNodeId, 
  onSelectNode,
  onSelectDestination,
  calculatedPath = [], 
  ambulancePos = null,  
  isAmbulanceDispatched = false
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePopupNode, setActivePopupNode] = useState(null);

  // Fast lookup dictionary using plain JS Object
  const nodeDict = useMemo(() => {
    const dict = {};
    if (Array.isArray(nodes)) {
      nodes.forEach(n => {
        if (n && n.id) dict[n.id] = n;
      });
    }
    return dict;
  }, [nodes]);

  // Scale node percentage coordinates into 15%..85% viewport range so badges never overlap top header bar or spill out
  const getNodePos = (nodeId) => {
    const node = nodeDict[nodeId];
    if (!node) return { x: 50, y: 50 };
    return {
      x: 15 + (node.x / 100) * 70,
      y: 15 + (node.y / 100) * 70
    };
  };

  // Construct continuous SVG polyline points string for active calculated path
  const pathPolylinePoints = useMemo(() => {
    if (!calculatedPath || calculatedPath.length < 2) return "";
    return calculatedPath
      .map(id => {
        const pos = getNodePos(id);
        return `${pos.x},${pos.y}`;
      })
      .join(" ");
  }, [calculatedPath, nodeDict]);

  // Midpoint coordinate of active route for clean travel time tag
  const routeMidpointPos = useMemo(() => {
    if (!calculatedPath || calculatedPath.length < 2) return null;
    const midIndex = Math.floor(calculatedPath.length / 2);
    return getNodePos(calculatedPath[midIndex]);
  }, [calculatedPath, nodeDict]);

  // Total travel time along active path
  const totalRouteTravelTime = useMemo(() => {
    if (!calculatedPath || calculatedPath.length < 2 || !Array.isArray(roads)) return 25;
    const pathEdgeSet = new Set();
    for (let i = 0; i < calculatedPath.length - 1; i++) {
      pathEdgeSet.add(`${calculatedPath[i]}_${calculatedPath[i+1]}`);
      pathEdgeSet.add(`${calculatedPath[i+1]}_${calculatedPath[i]}`);
    }
    let totalTime = 0;
    roads.forEach(r => {
      if (r && pathEdgeSet.has(`${r.from}_${r.to}`)) {
        totalTime += (r.travelTime || 5);
      }
    });
    return totalTime > 0 ? totalTime : 25;
  }, [calculatedPath, roads]);

  // Filter display nodes for clean HTML DOM badges (Villages, Hospitals, Health Centers)
  const displayBadges = useMemo(() => {
    if (!Array.isArray(nodes)) return [];
    return nodes.filter(n => n && (n.type === "village" || n.type === "hospital" || n.type === "health_center" || ["node_v_a", "node_v_b", "node_v_d", "node_h_a", "node_h_b", "node_h_c"].includes(n.id)));
  }, [nodes]);

  const handleNodeClick = (node) => {
    setActivePopupNode(node);
    if (onSelectNode) onSelectNode(node.id);
    if ((node.type === "hospital" || node.hospitalObj) && onSelectDestination) {
      const targetHospId = node.hospitalObj ? node.hospitalObj.id : node.id;
      onSelectDestination(targetHospId);
    }
  };

  // Fallback initial position for ambulance marker if ambulancePos not yet calculated
  const startNodePos = calculatedPath && calculatedPath.length > 0 ? getNodePos(calculatedPath[0]) : { x: 51, y: 56 };
  const rawAmbX = ambulancePos ? ambulancePos.x : (calculatedPath && calculatedPath.length > 0 ? nodeDict[calculatedPath[0]]?.x || 50 : 50);
  const rawAmbY = ambulancePos ? ambulancePos.y : (calculatedPath && calculatedPath.length > 0 ? nodeDict[calculatedPath[0]]?.y || 50 : 50);
  const currentAmbX = 15 + (rawAmbX / 100) * 70;
  const currentAmbY = 15 + (rawAmbY / 100) * 70;

  return (
    <div className="map-card primary-demo-map">
      {/* 1. Top Header Bar */}
      <div className="map-header">
        <h2 className="map-title inline-flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <span>Live Interactive Map</span>
          <span className="badge badge-success">
            Live Animated Canvas
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

      {/* 2. Middle Constrained Viewport Canvas */}
      <div className="map-viewport" style={{ transform: `scale(${zoomLevel})` }}>
        {/* SVG Network Grid & Active A* Route Canvas strictly constrained with viewBox */}
        <svg className="map-svg-canvas" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Layer 1: Background Road Network Grid */}
          {(roads || []).map((road) => {
            if (!road) return null;
            const from = getNodePos(road.from);
            const to = getNodePos(road.to);
            if (!from.x || !to.x) return null;

            return (
              <line
                key={road.id || `road_${Math.random()}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={road.blocked ? "#DC2626" : "#CBD5E1"}
                strokeWidth={road.blocked ? "2.2" : "1.6"}
                strokeDasharray={road.blocked ? "3,3" : "none"}
                opacity={road.blocked ? "0.9" : "0.75"}
              />
            );
          })}

          {/* Layer 2: Bold Primary Blue Active A* Route Path Polyline (#2563EB, 4px width) */}
          {pathPolylinePoints && (
            <polyline
              points={pathPolylinePoints}
              fill="none"
              stroke="#2563EB"
              strokeWidth="4.0"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="active-route-polyline"
            />
          )}
        </svg>

        {/* Clean Single Travel Time Tag at Route Midpoint */}
        {routeMidpointPos && (
          <div
            className="map-time-label active-path-label midpoint-time-tag"
            style={{ left: `${routeMidpointPos.x}%`, top: `${routeMidpointPos.y - 4}%` }}
          >
            {totalRouteTravelTime} min ETA
          </div>
        )}

        {/* Clean HTML Badges (Villages, Hospitals, Health Centers) Safely Positioned Inside Canvas */}
        {displayBadges.map((node) => {
          if (!node) return null;
          const pos = getNodePos(node.id);
          let nodeIcon = <Home size={13} />;
          let nodeClass = "node-badge village";

          if (node.type === "hospital") {
            nodeIcon = <Building2 size={13} />;
            nodeClass = "node-badge hospital";
          } else if (node.type === "health_center") {
            nodeIcon = <PlusSquare size={13} />;
            nodeClass = "node-badge health-center";
          }

          const isSelected = selectedNodeId === node.id;
          const isInPath = (calculatedPath || []).includes(node.id);
          const isOrigin = calculatedPath && calculatedPath.length > 0 && calculatedPath[0] === node.id;
          const isDestination = calculatedPath && calculatedPath.length > 1 && calculatedPath[calculatedPath.length - 1] === node.id;

          return (
            <div
              key={`badge_${node.id}`}
              className={`${nodeClass} ${isSelected ? 'selected-node-highlight' : ''} ${isInPath ? 'in-path-node' : ''} ${isOrigin ? 'origin-badge' : ''} ${isDestination ? 'destination-badge' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
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
            details: isAmbulanceDispatched ? "En Route on active route path" : "Stationed at origin" 
          })}
        >
          <Truck size={14} />
        </div>

        {/* Interactive Node Info Popup */}
        {activePopupNode && (
          <div 
            className="map-popup-card"
            style={{ 
              left: `${Math.min(getNodePos(activePopupNode.id).x || 50, 70)}%`, 
              top: `${Math.max((getNodePos(activePopupNode.id).y || 50) - 15, 10)}%` 
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
                  Cardiology: {activePopupNode.hasCardiologist !== false ? (
                    <span className="text-success font-semibold inline-flex items-center gap-1"><CheckCircle2 size={12} /> Available</span>
                  ) : (
                    <span className="text-danger font-semibold inline-flex items-center gap-1"><XCircle size={12} /> Unavailable</span>
                  )}
                </p>
              )}
              {activePopupNode.type === "hospital" && (
                <button 
                  onClick={() => {
                    if (onSelectDestination) onSelectDestination(activePopupNode.id);
                    setActivePopupNode(null);
                  }}
                  className="btn btn-primary btn-full mt-2 text-xs"
                >
                  <ShieldCheck size={12} /> SELECT FOR ROUTING
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Legend Footer */}
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
