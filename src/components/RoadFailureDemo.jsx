import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function RoadFailureDemo({ 
  currentPathNames = ["Village D", "Village B", "Hospital C"], 
  isRoadBlocked, 
  onBlockRoad, 
  onRecalculateRoute,
  hasAlternativeRoute
}) {
  const [hasRecalculated, setHasRecalculated] = useState(false);

  const handleBlockClick = () => {
    setHasRecalculated(false);
    if (onBlockRoad) onBlockRoad();
  };

  const handleRecalculateClick = () => {
    setHasRecalculated(true);
    if (onRecalculateRoute) onRecalculateRoute();
  };

  return (
    <div className="card road-failure-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title inline-flex items-center gap-2">
            <ShieldAlert size={18} className="text-warning" />
            🚧 Test Routing Resilience
          </h3>
          <p className="card-subtitle-text">
            Simulate a blocked road and verify that the routing engine finds an alternative path.
          </p>
        </div>
        <span className="badge badge-purple">Optional Demo</span>
      </div>

      <div className="current-route-display">
        <span className="route-display-label">Current Route:</span>
        <div className="route-path-chips">
          {currentPathNames.map((name, idx) => (
            <React.Fragment key={idx}>
              <span className="path-chip">{name}</span>
              {idx < currentPathNames.length - 1 && <span className="chip-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {isRoadBlocked && (
        <div className="road-blocked-status-banner">
          <AlertTriangle size={16} className="text-danger flex-shrink-0" />
          <span>⚠ ROAD BLOCKED — Road R17 on the current route is unavailable.</span>
        </div>
      )}

      {hasRecalculated && hasAlternativeRoute && (
        <div className="alt-route-found-banner">
          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
          <span>✓ ALTERNATIVE ROUTE FOUND (Algorithm rerouted around blocked road)</span>
        </div>
      )}

      <div className="resilience-actions">
        <button 
          onClick={handleBlockClick} 
          className={`btn ${isRoadBlocked ? 'btn-danger' : 'btn-warning'} flex-1`}
        >
          <AlertTriangle size={16} />
          <span>{isRoadBlocked ? 'ROAD BLOCKED' : 'SIMULATE ROAD BLOCK'}</span>
        </button>

        <button 
          onClick={handleRecalculateClick} 
          disabled={!isRoadBlocked}
          className="btn btn-primary flex-1"
        >
          <RefreshCw size={16} />
          <span>RECALCULATE ROUTE</span>
        </button>
      </div>

      <div className="resilience-explanation-note mt-3">
        <Info size={14} className="text-primary flex-shrink-0" />
        <span><strong>Why this matters:</strong> Rural roads can become unavailable due to flooding, construction or emergencies. The routing engine must adapt without losing the patient destination.</span>
      </div>
    </div>
  );
}
