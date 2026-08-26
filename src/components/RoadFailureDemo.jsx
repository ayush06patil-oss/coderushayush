import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RoadFailureDemo({ 
  currentPathNames = ["Village A", "Village B", "Village D", "Hospital C"], 
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
        <h3 className="card-title inline-flex items-center gap-2">
          <ShieldAlert size={18} className="text-warning" />
          🚧 Test Resilience & Road Failure
        </h3>
        <span className="badge badge-purple">Edge-Case Simulation</span>
      </div>

      <div className="current-route-display">
        <span className="route-display-label">Active Path:</span>
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
          <span>⚠ ROAD BLOCKED ON ACTIVE ROUTE</span>
        </div>
      )}

      {hasRecalculated && hasAlternativeRoute && (
        <div className="alt-route-found-banner">
          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
          <span>✓ ALTERNATIVE ROUTE FOUND (Avoids Blocked Road)</span>
        </div>
      )}

      <div className="resilience-actions">
        <button 
          onClick={handleBlockClick} 
          className={`btn ${isRoadBlocked ? 'btn-danger' : 'btn-warning'} flex-1`}
        >
          <AlertTriangle size={16} />
          <span>{isRoadBlocked ? 'ROAD ALREADY BLOCKED' : 'BLOCK A ROUTE ROAD'}</span>
        </button>

        <button 
          onClick={handleRecalculateClick} 
          disabled={!isRoadBlocked}
          className="btn btn-primary flex-1"
        >
          <RefreshCw size={16} />
          <span>RE-CALCULATE ROUTE</span>
        </button>
      </div>
    </div>
  );
}
