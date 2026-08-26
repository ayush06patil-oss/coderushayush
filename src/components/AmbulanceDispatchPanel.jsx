import React from 'react';
import { Truck, CheckCircle2, Pause, Play, RotateCcw } from 'lucide-react';

export default function AmbulanceDispatchPanel({ 
  ambulanceCode = "Ambulance #02", 
  from = "Village D", 
  to = "Hospital C", 
  totalDistance = 19.6,
  totalTravelTime = 25,
  isDispatched = false,
  isPaused = false,
  progressPct = 0,
  onDispatch,
  onPauseResume,
  onReset
}) {
  const isArrived = progressPct >= 100;

  // Calculate live countdown values from total metrics and progress percentage
  const distRemaining = isArrived ? 0 : Math.max(0, parseFloat((totalDistance * (1 - progressPct / 100)).toFixed(1)));
  const etaRemaining = isArrived ? 0 : Math.max(0, Math.ceil(totalTravelTime * (1 - progressPct / 100)));

  return (
    <div className="card ambulance-dispatch-panel">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <Truck size={18} className="text-primary" />
          🚑 Ambulance Dispatch & Live Telemetry
        </h3>
        <span className={`badge ${isArrived ? 'badge-success' : isDispatched ? 'badge-purple' : 'badge-primary'}`}>
          {isArrived ? 'PATIENT DELIVERED' : isDispatched ? (isPaused ? 'PAUSED' : 'EN ROUTE') : 'Ready to Dispatch'}
        </span>
      </div>

      {!isDispatched ? (
        <>
          {/* Before Dispatch View */}
          <div className="amb-dispatch-grid">
            <div className="amb-dispatch-item">
              <span className="dispatch-label">Available Ambulances:</span>
              <span className="dispatch-val font-semibold text-success">5 / 8</span>
            </div>
            <div className="amb-dispatch-item">
              <span className="dispatch-label">Assigned Unit:</span>
              <span className="dispatch-val font-semibold text-primary">{ambulanceCode}</span>
            </div>
            <div className="amb-dispatch-item">
              <span className="dispatch-label">After Dispatch:</span>
              <span className="dispatch-val font-semibold">4 / 8 Available</span>
            </div>
            <div className="amb-dispatch-item">
              <span className="dispatch-label">Target Facility:</span>
              <span className="dispatch-val font-semibold">{to}</span>
            </div>
          </div>

          <button 
            onClick={() => onDispatch && onDispatch()}
            className="btn btn-primary btn-full mt-3"
          >
            <Truck size={16} />
            <span>DISPATCH AMBULANCE</span>
          </button>
        </>
      ) : (
        <>
          {/* Active Dispatch Live Telemetry View */}
          <div className="amb-active-telemetry">
            <div className="telemetry-top">
              <h4 className="amb-unit-title">🚑 {ambulanceCode}</h4>
              <span className={`badge ${isArrived ? 'badge-success' : 'badge-purple'}`}>
                {isArrived ? 'PATIENT DELIVERED' : isPaused ? 'PAUSED' : 'EN ROUTE'}
              </span>
            </div>

            <div className="amb-dispatch-grid mt-2">
              <div className="amb-dispatch-item">
                <span className="dispatch-label">From:</span>
                <span className="dispatch-val">{from}</span>
              </div>
              <div className="amb-dispatch-item">
                <span className="dispatch-label">To:</span>
                <span className="dispatch-val font-semibold text-primary">{to}</span>
              </div>
              <div className="amb-dispatch-item">
                <span className="dispatch-label">ETA Remaining:</span>
                <span className={`dispatch-val font-semibold ${isArrived ? 'text-success' : ''}`}>
                  {isArrived ? '0 min (Arrived)' : `${etaRemaining} min`}
                </span>
              </div>
              <div className="amb-dispatch-item">
                <span className="dispatch-label">Dist. Remaining:</span>
                <span className={`dispatch-val font-semibold ${isArrived ? 'text-success' : ''}`}>
                  {isArrived ? '0 km' : `${distRemaining} km`}
                </span>
              </div>
            </div>

            {/* Live Animated Progress Bar */}
            <div className="amb-progress-section mt-3">
              <div className="progress-label-row">
                <span>Dispatch Transit Progress</span>
                <span className="font-semibold text-primary">{Math.min(100, Math.round(progressPct))}%</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className={`progress-bar-fill ${isArrived ? 'bg-success' : 'bg-primary'}`} 
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                ></div>
              </div>
            </div>

            {/* Telemetry Actions (Pause / Resume / Reset) */}
            <div className="telemetry-actions-row mt-3">
              {!isArrived && (
                <button 
                  onClick={() => onPauseResume && onPauseResume()}
                  className="btn btn-outline-secondary flex-1"
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                </button>
              )}

              <button 
                onClick={() => onReset && onReset()}
                className="btn btn-outline-secondary flex-1"
              >
                <RotateCcw size={14} />
                <span>RESET SIM</span>
              </button>
            </div>

            {/* Fleet Status Breakdown */}
            <div className="fleet-status-footer mt-3">
              <div className="fleet-stat-badge">
                <span className="stat-num text-success">4 / 8</span>
                <span className="stat-txt">Available</span>
              </div>
              <div className="fleet-stat-badge">
                <span className="stat-num text-primary">{isArrived ? '0' : '1'}</span>
                <span className="stat-txt">En Route</span>
              </div>
              <div className="fleet-stat-badge">
                <span className="stat-num text-muted">{isArrived ? '4' : '3'}</span>
                <span className="stat-txt">Occupied</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
