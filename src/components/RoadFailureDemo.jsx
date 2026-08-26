import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2, Info, RotateCcw } from 'lucide-react';

export default function RoadFailureDemo({ 
  currentPathNames = ["Village D", "Hospital B", "Hospital C"], 
  previousPathNames = [],
  previousDistance = null,
  newDistance = null,
  blockedEdgeInfo = null,
  isRoadBlocked = false,
  onBlockRoad, 
  onRecalculateRoute,
  onResetRoad,
  hasAlternativeRoute = true
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

  const handleResetClick = () => {
    setHasRecalculated(false);
    if (onResetRoad) onResetRoad();
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
        <span className={`badge ${isRoadBlocked ? 'badge-danger' : 'badge-success'}`}>
          {isRoadBlocked ? 'Road Block Active' : 'Roads Operational'}
        </span>
      </div>

      {/* Current Active Route Display */}
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

      {/* Road Blocked Banner */}
      {isRoadBlocked && blockedEdgeInfo && (
        <div className="road-blocked-status-banner">
          <AlertTriangle size={16} className="text-danger flex-shrink-0" />
          <span>
            ⚠ ROAD BLOCKED — Road <strong>{blockedEdgeInfo.fromName} → {blockedEdgeInfo.toName}</strong> is unavailable.
          </span>
        </div>
      )}

      {/* Recalculated Results Banner */}
      {hasRecalculated && (
        hasAlternativeRoute ? (
          <div className="alt-route-found-banner">
            <CheckCircle2 size={16} className="text-success flex-shrink-0" />
            <div className="flex-flex-col">
              <span className="font-semibold">✓ ALTERNATIVE ROUTE FOUND</span>
              {previousDistance && newDistance && (
                <div className="route-comparison-text">
                  <span>Previous: {previousDistance} km</span>
                  <span className="mx-2">→</span>
                  <span className="text-success font-semibold">New: {newDistance} km</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="road-blocked-status-banner">
            <AlertTriangle size={16} className="text-danger flex-shrink-0" />
            <span>❌ NO ALTERNATIVE ROUTE AVAILABLE — Destination unreachable without blocked edge.</span>
          </div>
        )
      )}

      {/* Control Buttons */}
      <div className="resilience-actions mt-2">
        <button 
          onClick={handleBlockClick} 
          disabled={isRoadBlocked}
          className={`btn ${isRoadBlocked ? 'btn-secondary disabled' : 'btn-warning'} flex-1`}
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

        <button 
          onClick={handleResetClick}
          disabled={!isRoadBlocked && !hasRecalculated}
          className="btn btn-outline-secondary"
          title="Reset Road & Restore Route"
        >
          <RotateCcw size={16} />
          <span>RESET ROAD</span>
        </button>
      </div>

      <div className="resilience-explanation-note mt-3">
        <Info size={14} className="text-primary flex-shrink-0" />
        <span><strong>Why this matters:</strong> Rural roads can become unavailable due to flooding, construction or emergencies. The routing engine must adapt without losing the patient destination.</span>
      </div>
    </div>
  );
}
