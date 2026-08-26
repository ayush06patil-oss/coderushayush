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

  // Sample Organic Network Nodes for clean Network Diagram rendering (matching reference image)
  const displayNetworkNodes = useMemo(() => {
    if (!Array.isArray(nodes)) return [];
    const sampleStep = networkMode === "50k" ? Math.max(1, Math.floor(nodes.length / 60)) : 1;
    return nodes.filter((n, idx) => n && idx % sampleStep === 0);
  }, [networkMode, nodes]);

  const displayNetworkNodeSet = useMemo(() => {
    return new Set(displayNetworkNodes.map(n => n.id));
  }, [displayNetworkNodes]);

  // Sample Organic Network Edges with explicit distance numbers (matching reference image)
  const displayNetworkRoads = useMemo(() => {
    if (!Array.isArray(roads)) return [];
    const roadsList = [];
    roads.forEach(r => {
      if (r && displayNetworkNodeSet.has(r.from) && displayNetworkNodeSet.has(r.to)) {
        const fromPos = getNodePos(r.from);
        const toPos = getNodePos(r.to);
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        roadsList.push({
          ...r,
          fromPos,
          toPos,
          midX,
          midY
        });
      }
    });
    return roadsList.slice(0, 80);
  }, [roads, displayNetworkNodeSet, nodeDict]);

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
  const currentAmbX = ambulancePos ? ambulancePos.x : startNodePos.x;
  const currentAmbY = ambulancePos ? ambulancePos.y : startNodePos.y;

  return (
    <div className="map-card primary-demo-map organic-network-canvas">
      {/* Map Header */}
      <div className="map-header">
        <h2 className="map-title inline-flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <span>Organic Network Topology Map</span>
          <span className={`badge ${networkMode === "50k" ? "badge-purple" : "badge-success"}`}>
            {networkMode === "50k" ? `50,000 Nodes (${hospitals.length} Hospitals)` : "Live Network Canvas"}
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
        {/* SVG Organic Geographic Network Topology (Matching User Reference Image Exactly) */}
        <svg className="map-svg-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Layer 1: Dark Clean Organic Network Road Lines */}
          {displayNetworkRoads.map((road) => {
            if (!road || !road.fromPos.x || !road.toPos.x) return null;

            return (
              <g key={`road_group_${road.id}`}>
                <line
                  x1={road.fromPos.x}
                  y1={road.fromPos.y}
                  x2={road.toPos.x}
                  y2={road.toPos.y}
                  stroke="#1E293B"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity={road.blocked ? "0.4" : "0.85"}
                  strokeDasharray={road.blocked ? "3,3" : "none"}
                />
                {/* Layer 2: Explicit Edge Distance Number (e.g. 24, 48, 56, 69, 70, 18, 31, 47) */}
                <text
                  x={road.midX}
                  y={road.midY - 1.2}
                  fill="#0F172A"
                  fontSize="2.8"
                  fontWeight="700"
                  textAnchor="middle"
                  className="network-edge-distance"
                >
                  {Math.round(road.distance || 25)}
                </text>
              </g>
            );
          })}

          {/* Layer 3: Bold Primary Blue Active A* Route Path Polyline (#2563EB, 4px width) */}
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

          {/* Layer 4: Golden Yellow Circular Junction Nodes (● fill=#EAB308, stroke=#1E293B - Matching Reference Image) */}
          {displayNetworkNodes.map((node) => {
            if (!node) return null;
            const isInPath = (calculatedPath || []).includes(node.id);
            const isSelected = selectedNodeId === node.id;

            return (
              <g key={`node_group_${node.id}`} onClick={() => handleNodeClick(node)} style={{ cursor: "pointer" }}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? "3.2" : "2.4"}
                  fill={isInPath ? "#2563EB" : "#EAB308"}
                  stroke="#1E293B"
                  strokeWidth="0.8"
                  className="golden-node-vertex"
                />
                {/* Node Location Text Label (e.g. Solapur, Mohol, Village A, Hospital C) */}
                <text
                  x={node.x + 3.0}
                  y={node.y + 1.0}
                  fill="#1E293B"
                  fontSize="2.6"
                  fontWeight="700"
                  className="network-node-label"
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
            style={{ left: `${routeMidpointPos.x}%`, top: `${routeMidpointPos.y - 3}%` }}
          >
            {totalRouteTravelTime} min ETA
          </div>
        )}

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

      {/* Network Topology Legend Footer */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-icon" style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#EAB308", border: "1.5px solid #1E293B" }}></span>
          <span>Junction Node</span>
        </div>
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: "#1E293B", height: "2px" }}></span>
          <span>Road Edge (Distance km)</span>
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
