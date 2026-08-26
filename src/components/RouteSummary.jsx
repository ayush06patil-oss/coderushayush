import React, { useState } from 'react';
import { Clock, Info } from 'lucide-react';

export default function RouteSummary({ emergency }) {
  const [showModal, setShowModal] = useState(false);

  const isDemo = emergency?.isDemoScenario;

  const distance = isDemo ? (emergency.distance || "14.2 km") : "--";
  const estimatedTime = isDemo ? (emergency.estimatedTime || "12 min") : "--";
  const via = isDemo ? (emergency.via || "Village B → Village D") : "--";

  return (
    <div className="card route-summary-card">
      <div className="card-header-row">
        <h3 className="card-title">Route Summary</h3>
        {!isDemo && (
          <span className="badge badge-purple inline-flex items-center gap-1">
            <Clock size={12} /> Waiting for Phase 2
          </span>
        )}
      </div>

      <div className="summary-info-grid">
        <div className="info-row">
          <span className="info-label">Distance:</span>
          <span className="info-value font-semibold">{distance}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Estimated Time:</span>
          <span className="info-value font-semibold">{estimatedTime}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Via:</span>
          <span className="info-value">{via}</span>
        </div>
      </div>

      {isDemo && (
        <div className="demo-notice-box">
          <Info size={14} className="text-primary flex-shrink-0" />
          <span>Initial Demo Scenario Data (Dijkstra/A* to be implemented in Phase 2)</span>
        </div>
      )}

      <button 
        onClick={() => setShowModal(true)} 
        className="btn btn-primary btn-full mt-auto"
      >
        View Full Route
      </button>

      {showModal && (
        <div className="simple-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Route Calculation Engine</h4>
            <p>Full route optimization, path step nodes, and shortest-path graph calculations (Dijkstra / A*) will be enabled in <strong>Phase 2</strong>.</p>
            <button className="btn btn-primary mt-4" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
