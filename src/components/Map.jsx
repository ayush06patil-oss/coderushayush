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
  ShieldCheck,
  Compass,
  MapPin
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
  const [mapTheme, setMapTheme] = useState("gis-light"); // "gis-light" or "gis-dark"

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

  // Generate Continuous Road Network Grid Corridors (Highways, State Highways, Local Thoroughfares)
  const continuousRoadCorridors = useMemo(() => {
    if (!Array.isArray(roads)) return [];

    if (networkMode === "50k") {
      // Group roads into continuous road corridors by type and coordinate grid lines
      const corridors = [];
      const COLS = 250;
      const ROWS = 200;
      const step = 8; // Render continuous thoroughfare grid lines every 8th row/col for clean GIS aesthetic

      // Horizontal thoroughfare lines
      for (let r = 0; r < ROWS; r += step) {
        const y = parseFloat(((r / (ROWS - 1)) * 90 + 5).toFixed(2));
        const isHighway = r % 24 === 0;
        const isStateHwy = r % 16 === 0;
        corridors.push({
          id: `h_corridor_${r}`,
          type: isHighway ? "Highway" : isStateHwy ? "State Highway" : "District Road",
          x1: 5,
          y1: y,
          x2: 95,
          y2: y
        });
      }

      // Vertical thoroughfare lines
      for (let c = 0; c < COLS; c += step) {
        const x = parseFloat(((c / (COLS - 1)) * 90 + 5).toFixed(2));
        const isHighway = c % 24 === 0;
        const isStateHwy = c % 16 === 0;
        corridors.push({
          id: `v_corridor_${c}`,
          type: isHighway ? "Highway" : isStateHwy ? "State Highway" : "District Road",
          x1: x,
          y1: 5,
          x2: x,
          y2: 95
        });
      }

      // Diagonal arterial thoroughfares
      corridors.push({ id: "diag_1", type: "Highway", x1: 5, y1: 5, x2: 95, y2: 95 });
      corridors.push({ id: "diag_2", type: "State Highway", x1: 95, y1: 5, x2: 5, y2: 95 });

      return corridors;
    }

    // Standard Mode: Render standard roads
    return roads.map(r => ({
      id: r.id,
      type: r.roadType || "District Road",
      blocked: r.blocked,
      x1: getNodePos(r.from).x,
      y1: getNodePos(r.from).y,
      x2: getNodePos(r.to).x,
      y2: getNodePos(r.to).y
    }));
  }, [networkMode, roads, nodeDict]);

  // Key Facility Badges & Sleek GIS Map Pins
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

    // 3. Top Demo Hospitals & Key Villages as sleek GIS map pins
    const displayHospitals = networkMode === "50k" ? (hospitals || []).slice(0, 10) : (hospitals || []).slice(0, 5);
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
          hospitalObj: h,
          isPinOnly: true // Sleek circular pin icon instead of heavy white pill!
        });
      }
    });

    return keyBadges;
  }, [networkMode, nodes, hospitals, calculatedPath, nodeDict]);

  const handleNodeClick = (node) => {
    setActivePopupNode(node);
    if (onSelectNode) onSelectNode(node.id);
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
    const type = road.type || "District Road";
    if (type === "Highway") {
      return { stroke: mapTheme === "gis-dark" ? "#FBBF24" : "#F59E0B", strokeWidth: "2.2", strokeDasharray: "none", opacity: "0.9" }; // Vibrant Gold
    } else if (type === "State Highway") {
      return { stroke: mapTheme === "gis-dark" ? "#22D3EE" : "#06B6D4", strokeWidth: "1.6", strokeDasharray: "none", opacity: "0.8" }; // Cyan/Teal
    } else if (type === "District Road") {
      return { stroke: mapTheme === "gis-dark" ? "#64748B" : "#94A3B8", strokeWidth: "1.0", strokeDasharray: "none", opacity: "0.6" }; // Slate
    }
    return { stroke: "#CBD5E1", strokeWidth: "0.8", strokeDasharray: "none", opacity: "0.5" };
  };

  // Fallback initial position for ambulance marker if ambulancePos not yet calculated
  const startNodePos = calculatedPath && calculatedPath.length > 0 ? getNodePos(calculatedPath[0]) : { x: 51, y: 56 };
  const currentAmbX = ambulancePos ? ambulancePos.x : startNodePos.x;
  const currentAmbY = ambulancePos ? ambulancePos.y : startNodePos.y;

  return (
    <div className={`map-card primary-demo-map ${mapTheme}`}>
      {/* Map Header Controls */}
      <div className="map-header">
        <h2 className="map-title inline-flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <span>Interactive GIS Map</span>
          <span className={`badge ${networkMode === "50k" ? "badge-purple" : "badge-success"}`}>
            {networkMode === "50k" ? `50,000 Nodes (${hospitals.length} Hospitals)` : "Live Animated Canvas"}
          </span>
        </h2>
        <div className="map-controls">
          <button 
            className="map-ctrl-btn" 
            onClick={() => setMapTheme(prev => prev === "gis-light" ? "gis-dark" : "gis-light")}
            title="Toggle Map Style (Light/Dark GIS)"
          >
            <Compass size={16} />
          </button>
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
        {/* SVG Continuous Network Mesh & Smooth Route Canvas */}
        <svg className="map-svg-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Layer 1: Continuous Connected GIS Road Corridors */}
          {continuousRoadCorridors.map((road) => {
            if (!road) return null;
            const style = getRoadStyle(road);

            return (
              <line
                key={road.id}
                x1={road.x1}
                y1={road.y1}
                x2={road.x2}
                y2={road.y2}
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
              stroke={mapTheme === "gis-dark" ? "#00F0FF" : "#2563EB"}
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
              fill={mapTheme === "gis-dark" ? "#00F0FF" : "#2563EB"}
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

        {/* Sleek GIS Map Pins & Key Location Badges */}
        {displayBadges.map((node) => {
          if (!node) return null;

          // Render sleek circular map pin icon for secondary hospitals to eliminate heavy pill clutter!
          if (node.isPinOnly && !node.isOrigin && !node.isDestination) {
            return (
              <div
                key={`pin_${node.id}`}
                className="gis-hospital-icon-pin"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => handleNodeClick(node)}
                title={`${node.name} (Click to select for routing)`}
              >
                <Building2 size={12} />
              </div>
            );
          }

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

      {/* GIS Scale Bar & Legend Footer */}
      <div className="map-legend">
        <div className="gis-scale-bar inline-flex items-center gap-1">
          <span className="scale-line">0 km</span>
          <span className="scale-line-bar"></span>
          <span className="scale-line">5 km</span>
          <span className="scale-line-bar"></span>
          <span className="scale-line">10 km</span>
        </div>

        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: "#F59E0B", height: "3px" }}></span>
          <span>Highway</span>
        </div>
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: "#06B6D4", height: "2.5px" }}></span>
          <span>State Highway</span>
        </div>
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: "#94A3B8", height: "2px" }}></span>
          <span>Local Road</span>
        </div>
        <div className="legend-item">
          <span className="legend-line selected-line"></span>
          <span>Active Route</span>
        </div>
      </div>
    </div>
  );
}
