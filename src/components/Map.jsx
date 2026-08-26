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

  // Expanded scrollable SVG canvas dimensions for clean, un-crowded layout
  const CANVAS_WIDTH = 1600;
  const CANVAS_HEIGHT = 1200;

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

  // Convert 0..100 percentage coordinates into 1600x1200 scrollable pixel coordinates
  const getNodePos = (nodeId) => {
    const node = nodeDict[nodeId];
    if (!node) return { x: 800, y: 600 };
    return {
      x: (node.x / 100) * (CANVAS_WIDTH - 160) + 80,
      y: (node.y / 100) * (CANVAS_HEIGHT - 160) + 80
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

  // Sample nodes for clean, simple network diagram rendering
  const displayNodes = useMemo(() => {
    if (!Array.isArray(nodes)) return [];
    const sampleStep = networkMode === "50k" ? Math.max(1, Math.floor(nodes.length / 50)) : 1;
    return nodes.filter((n, idx) => n && idx % sampleStep === 0);
  }, [networkMode, nodes]);

  const displayNodeSet = useMemo(() => {
    return new Set(displayNodes.map(n => n.id));
  }, [displayNodes]);

  // Sample straight line road edges connecting nodes directly
  const displayStraightRoads = useMemo(() => {
    if (!Array.isArray(roads)) return [];
    const list = [];
    roads.forEach(r => {
      if (r && displayNodeSet.has(r.from) && displayNodeSet.has(r.to)) {
        const fromPos = getNodePos(r.from);
        const toPos = getNodePos(r.to);
        list.push({
          ...r,
          fromPos,
          toPos
        });
      }
    });
    return list.slice(0, 60);
  }, [roads, displayNodeSet, nodeDict]);

  // Key Facility Badges (Start Village, Target Destination Hospital)
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
          isOrigin: true,
          pos: getNodePos(startId)
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
          isDestination: true,
          pos: getNodePos(targetId)
        });
      }
    }

    return keyBadges;
  }, [nodes, calculatedPath, nodeDict]);

  const handleNodeClick = (node) => {
    setActivePopupNode(node);
    if (onSelectNode) onSelectNode(node.id);
    if ((node.type === "hospital" || node.hospitalObj) && onSelectDestination) {
      const targetHospId = node.hospitalObj ? node.hospitalObj.id : node.id;
      onSelectDestination(targetHospId);
    }
  };

  // Fallback initial position for ambulance marker if ambulancePos not yet calculated
  const startNodePos = calculatedPath && calculatedPath.length > 0 ? getNodePos(calculatedPath[0]) : { x: 800, y: 600 };
  const currentAmbX = ambulancePos ? (ambulancePos.x / 100) * (CANVAS_WIDTH - 160) + 80 : startNodePos.x;
  const currentAmbY = ambulancePos ? (ambulancePos.y / 100) * (CANVAS_HEIGHT - 160) + 80 : startNodePos.y;

  return (
    <div className="map-card primary-demo-map clean-scrollable-map">
      {/* Map Header */}
      <div className="map-header">
        <h2 className="map-title inline-flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <span>Interactive Scrollable Map</span>
          <span className={`badge ${networkMode === "50k" ? "badge-purple" : "badge-success"}`}>
            {networkMode === "50k" ? "50,000 Nodes (Scrollable Viewport)" : "Live Network Canvas"}
          </span>
        </h2>
        <div className="map-controls">
          <button className="map-ctrl-btn" onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))} title="Zoom In">
            <Plus size={16} />
          </button>
          <button className="map-ctrl-btn" onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.7))} title="Zoom Out">
            <Minus size={16} />
          </button>
          <button className="map-ctrl-btn" onClick={() => setZoomLevel(1)} title="Recenter / Fit Route">
            <Navigation size={16} />
          </button>
        </div>
      </div>

      {/* Smooth 2-Axis Scrollable Viewport (Horizontal & Vertical Scrollbar) */}
      <div className="map-viewport scrollable-map-viewport" style={{ overflow: "auto", maxHeight: "540px" }}>
        <div 
          className="map-scroll-container" 
          style={{ 
            width: `${CANVAS_WIDTH}px`, 
            height: `${CANVAS_HEIGHT}px`, 
            position: "relative",
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top left"
          }}
        >
          {/* SVG Straight Line Network Canvas */}
          <svg className="map-svg-canvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}>
            {/* Layer 1: Straight Road Edge Lines Connecting Nodes Directly */}
            {displayStraightRoads.map((road) => {
              if (!road || !road.fromPos.x || !road.toPos.x) return null;

              return (
                <line
                  key={`road_straight_${road.id}`}
                  x1={road.fromPos.x}
                  y1={road.fromPos.y}
                  x2={road.toPos.x}
                  y2={road.toPos.y}
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={road.blocked ? "0.4" : "0.8"}
                  strokeDasharray={road.blocked ? "4,4" : "none"}
                />
              );
            })}

            {/* Layer 2: Bold Vibrant Blue Active A* Route Polyline Path (#2563EB, 4px width) */}
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

            {/* Layer 3: Golden Yellow Junction Node Dots (● fill=#F59E0B, r=6 - Straight Line Network) */}
            {displayNodes.map((node) => {
              if (!node) return null;
              const pos = getNodePos(node.id);
              const isInPath = (calculatedPath || []).includes(node.id);
              const isSelected = selectedNodeId === node.id;

              return (
                <g key={`clean_node_${node.id}`} onClick={() => handleNodeClick(node)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "8" : "6"}
                    fill={isInPath ? "#2563EB" : "#F59E0B"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="clean-golden-node"
                  />
                  {/* Clean Text Label beside node */}
                  <text
                    x={pos.x + 10}
                    y={pos.y + 4}
                    fill="#1E293B"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Clean Single Travel Time Tag at Route Midpoint */}
          {routeMidpointPos && (
            <div
              className="map-time-label active-path-label midpoint-time-tag"
              style={{ left: `${routeMidpointPos.x}px`, top: `${routeMidpointPos.y - 12}px` }}
            >
              {totalRouteTravelTime} min ETA
            </div>
          )}

          {/* Key Facility Badges (Start Village & Target Hospital) */}
          {displayBadges.map((node) => {
            if (!node || !node.pos) return null;
            let nodeIcon = <Home size={13} />;
            let nodeClass = "node-badge village";

            if (node.type === "hospital" || node.isDestination) {
              nodeIcon = <Building2 size={13} />;
              nodeClass = "node-badge hospital";
            }

            return (
              <div
                key={`badge_${node.id}`}
                className={`${nodeClass} ${node.isOrigin ? 'origin-badge' : ''} ${node.isDestination ? 'destination-badge' : ''}`}
                style={{ left: `${node.pos.x}px`, top: `${node.pos.y}px` }}
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
              left: `${currentAmbX}px`, 
              top: `${currentAmbY}px`,
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
                left: `${Math.min(getNodePos(activePopupNode.id).x, CANVAS_WIDTH - 240)}px`, 
                top: `${Math.max(getNodePos(activePopupNode.id).y - 80, 20)}px` 
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
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-icon" style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#F59E0B", border: "2px solid #FFFFFF" }}></span>
          <span>Junction Node</span>
        </div>
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: "#CBD5E1", height: "2px" }}></span>
          <span>Straight Road Connection</span>
        </div>
        <div className="legend-item">
          <span className="legend-line selected-line"></span>
          <span>Calculated A* Route</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon ambulance-color"><Truck size={14} /></span>
          <span>Live Ambulance</span>
        </div>
      </div>
    </div>
  );
}
