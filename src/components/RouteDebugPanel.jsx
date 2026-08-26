import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { calculatePathMetrics } from '../algorithms/routeValidator';

export default function RouteDebugPanel({ routeResult, graph }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!routeResult || !routeResult.path || routeResult.path.length === 0) return null;

  const metrics = calculatePathMetrics(routeResult.path, graph);

  return (
    <div className="card debug-panel-card mt-3">
      <div 
        className="card-header-row cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="card-title inline-flex items-center gap-2 text-warning">
          <Bug size={18} />
          ROUTE DEBUG (Dev Audit Panel)
        </h3>
        <button className="log-toggle-btn">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="debug-body mt-2">
          <div className="debug-row">
            <span className="debug-label">Algorithm:</span>
            <span className="debug-val font-semibold text-primary">{routeResult.algorithm}</span>
          </div>

          <div className="debug-row">
            <span className="debug-label">Raw Path IDs:</span>
            <span className="debug-val code-text">[{routeResult.path.join(", ")}]</span>
          </div>

          <div className="debug-row">
            <span className="debug-label">Evaluated Distance:</span>
            <span className="debug-val font-semibold">{metrics.distance} km (Result: {routeResult.distance} km)</span>
          </div>

          <div className="debug-row">
            <span className="debug-label">Evaluated Travel Time:</span>
            <span className="debug-val font-semibold">{metrics.travelTime} min (Result: {routeResult.travelTime} min)</span>
          </div>

          {!metrics.isValid && (
            <div className="no-route-banner mt-2">
              <AlertTriangle size={16} className="text-danger flex-shrink-0" />
              <span>ERROR: {metrics.error}</span>
            </div>
          )}

          <div className="debug-edges-list mt-2">
            <span className="debug-label font-semibold">Edge Traversal Breakdown:</span>
            {metrics.edges.map((e, idx) => (
              <div key={idx} className="debug-edge-item">
                <span>{e.from} → {e.to}</span>
                <span className="font-semibold">{e.distance} km ({e.travelTime} min)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
