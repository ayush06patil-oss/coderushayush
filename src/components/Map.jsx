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

  const getNodePos = (nodeId) => {
    const node = nodeDict[nodeId];
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
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

  // Intermediate path nodes for subtle SVG waypoint dots (excluding start/end)
  const intermediateWaypoints = useMemo(() => {
    if (!calculatedPath || calculatedPath.length <= 2) return [];
    const step = Math.max(1, Math.floor(calculatedPath.length / 25));
    const waypoints = [];
    for (let i = 1; i < calculatedPath.length - 1; i += step) {
      const pos = getNodePos(calculatedPath[i]);
      waypoints.push({ id: calculatedPath[i], ...pos });
    }
    return waypoints;
  }, [calculatedPath, nodeDict]);

  // Midpoint coordinate of active route
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

  // Key Facility Badges (HTML Pill Overlay) — Origin, Selected Target Hospital, and Key Facilities
  const displayBadges = useMemo(() => {
    if (!Array.isArray(nodes)) return [];

    const keyBadges = [];

    // 1. Origin Node Badge (Start of Route)
    if (calculatedPath && calculatedPath.length > 0) {
      const startId = calculatedPath[0];
      const startNode = nodeDict[startId];
      if (startNode) {
        keyBadges.push({
          ...startNode,
          badgeLabel: startNode.name.startsWith("Node ") ? "Origin Village" : startNode.name,
          isOrigin: true
        });
      }
    }

    // 2. Target Node Badge (Destination Hospital)
    if (calculatedPath && calculatedPath.length > 1) {
      const targetId = calculatedPath[calculatedPath.length - 1];
      const targetNode = nodeDict[targetId];
      if (targetNode) {
        keyBadges.push({
          ...targetNode,
          badgeLabel: targetNode.name.startsWith("Node ") ? "Destination Hospital" : targetNode.name,
          isDestination: true
        });
      }
    }

    // 3. Render Top Hospitals in viewport for interactive click routing
    const displayHospitals = networkMode === "50k" ? (hospitals || []).slice(0, 12) : (hospitals || []).slice(0, 5);
    displayHospitals.forEach(h => {
      const targetId = h.nearestNodeId || h.id;
      const node = nodeDict[targetId] || h;
      if (node && !keyBadges.some(b => b.id === node.id)) {
        keyBadges.push({
          ...node,
          id: h.id,
          name: h.name,
          badgeLabel: h.name,
          type: "hospital",
          hospitalObj: h
        });
      }
    });

    return keyBadges;
  }, [networkMode, nodes, hospitals, calculatedPath, nodeDict]);

  // Background road network mesh with GIS hierarchy styling
  const backgroundRoads = useMemo(() => {
    if (!Array.isArray(roads)) return [];
    const sampleStep = networkMode === "50k" ? Math.max(1, Math.floor(roads.length / 350)) : 1;
    return roads.filter((r, idx) => r && idx % sampleStep === 0);
  }, [networkMode, roads]);

  const handleNodeClick = (node) => {
    setActivePopupNode(node);
    if (onSelectNode) onSelectNode(node.id);
    // If clicking a hospital node, trigger destination selection
    if ((node.type === "hospital" || node.hospitalObj) && onSelectDestination) {
      const targetHospId = node.hospitalObj ? node.hospitalObj.id : node.id;
      onSelectDestination(targetHospId);
    }
  };

  // Helper for GIS Road Color & Line Weight Hierarchy
  const getRoadStyle = (road) => {
    if (road.blocked) {
      return { stroke: "#EF4444", strokeWidth: "2.2", strokeDasharray: "4,4", opacity: "0.9" };
    }
    const type = road.roadType || "Rural Road";
    if (type === "Highway") {
      return { stroke: "#F59E0B", strokeWidth: "2.0", strokeDasharray: "none", opacity: "0.85" }; // Gold
    } else if (type === "State Highway") {
      return { stroke: "#06B6D4", strokeWidth: "1.6", strokeDasharray: "none", opacity: "0.8" }; // Cyan/Teal
    } else if (type === "District Road") {
      return { stroke: "#64748B", strokeWidth: "1.2", strokeDasharray: "none", opacity: "0.6" }; // Slate
    }
    return { stroke: "#CBD5E1", strokeWidth: "0.8", strokeDasharray: "none", opacity: "0.5" }; // Default
  };

  // Fallback initial position for ambulance marker if ambulancePos not yet calculated
  const startNodePos = calculatedPath && calculatedPath.length > 0 ? getNodePos(calculatedPath[0]) : { x: 51, y: 56 };
  const currentAmbX = ambulancePos ? ambulancePos.x : startNodePos.x;
  const currentAmbY = ambulancePos ? ambulancePos.y : startNodePos.y;

  return (
    <div className="map-card primary-demo-map">
      <div className="map-header">
        <h2 className="map-title inline-flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <span>Live Interactive Map</span>
          <span className={`badge ${networkMode === "50k" ? "badge-purple" : "badge-success"}`}>
            {networkMode === "50k" ? `50,000 Nodes (${hospitals.length} Hospitals)` : "Live Animated Canvas"}
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
        {/* SVG Network Mesh & GIS Canvas */}
        <svg className="map-svg-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Layer 1: Background GIS Road Hierarchy Mesh */}
          {backgroundRoads.map((road) => {
            if (!road) return null;
            const from = getNodePos(road.from);
            const to = getNodePos(road.to);
            if (!from.x || !to.x) return null;

            const style = getRoadStyle(road);

            return (
              <line
                key={road.id || `bg_road_${Math.random()}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
                opacity={style.opacity}
              />
            );
          })}

          {/* Layer 2: Glowing Neon Active A* Path Polyline (#2563EB, 4.5px width) */}
          {pathPolylinePoints && (
            <polyline
              points={pathPolylinePoints}
              fill="none"
              stroke="#2563EB"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="active-route-polyline"
            />
          )}

          {/* Layer 3: Intermediate SVG Waypoint Dots */}
          {intermediateWaypoints.map((pt) => (
            <circle
              key={`dot_${pt.id}`}
              cx={pt.x}
              cy={pt.y}
              r="1.2"
              fill="#2563EB"
              stroke="#FFFFFF"
              strokeWidth="0.4"
            />
          ))}
        </svg>

        {/* Clean Single Travel Time Tag at Route Midpoint */}
        {routeMidpointPos && (
          <div
            className="map-time-label active-path-label midpoint-time-tag"
            style={{ left: `${routeMidpointPos.x}%`, top: `${routeMidpointPos.y - 3}%` }}
          >
            {totalRouteTravelTime} min ETA
          </div>
        )}

        {/* Interactive Hospital & Facility HTML Pill Badges */}
        {displayBadges.map((node) => {
          if (!node) return null;
          let nodeIcon = <Home size={13} />;
          let nodeClass = "node-badge village";

          if (node.type === "hospital" || node.isDestination) {
            nodeIcon = <Building2 size={13} />;
            nodeClass = "node-badge hospital";
          } else if (node.type === "health_center") {
            nodeIcon = <PlusSquare size={13} />;
            nodeClass = "node-badge health-center";
          }

          const isSelected = selectedNodeId === node.id;
          const isInPath = (calculatedPath || []).includes(node.id);

          return (
            <div
              key={`badge_${node.id}`}
              className={`${nodeClass} ${isSelected ? 'selected-node-highlight' : ''} ${isInPath ? 'in-path-node' : ''} ${node.isOrigin ? 'origin-badge' : ''} ${node.isDestination ? 'destination-badge' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => handleNodeClick(node)}
              title="Click to select this hospital for emergency routing"
            >
              <span className="node-badge-icon">{nodeIcon}</span>
              <span className="node-badge-text">{node.badgeLabel || node.name}</span>
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

      {/* GIS Road Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: "#F59E0B", height: "3px" }}></span>
          <span>Highway</span>
        </div>
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: "#06B6D4", height: "2.5px" }}></span>
          <span>State Highway</span>
        </div>
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: "#64748B", height: "2px" }}></span>
          <span>District Road</span>
        </div>
        <div className="legend-item">
          <span className="legend-line blocked-line"></span>
          <span>Blocked Road</span>
        </div>
        <div className="legend-item">
          <span className="legend-line selected-line"></span>
          <span>Active Route</span>
        </div>
      </div>
    </div>
  );
}
