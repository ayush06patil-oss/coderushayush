import React, { useState } from 'react';
import { Truck, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AmbulanceDispatchPanel({ 
  ambulanceCode = "Ambulance #02", 
  from = "Village D", 
  to = "Hospital C", 
  distance = "25.4 km",
  eta = "15 min",
  onDispatch 
}) {
  const [isDispatched, setIsDispatched] = useState(false);

  const handleDispatchClick = () => {
    setIsDispatched(true);
    if (onDispatch) onDispatch();
  };

  return (
    <div className="card ambulance-dispatch-panel">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <Truck size={18} className="text-primary" />
          🚑 Ambulance Dispatch & Telemetry
        </h3>
        <span className={`badge ${isDispatched ? 'badge-success' : 'badge-purple'}`}>
          {isDispatched ? 'EN ROUTE' : 'Ready to Dispatch'}
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
            onClick={handleDispatchClick}
            className="btn btn-primary btn-full mt-3"
          >
            <Truck size={16} />
            <span>DISPATCH AMBULANCE</span>
          </button>
        </>
      ) : (
        <>
          {/* After Dispatch Active Telemetry View */}
          <div className="amb-active-telemetry">
            <div className="telemetry-top">
              <h4 className="amb-unit-title">🚑 {ambulanceCode}</h4>
              <span className="badge badge-success">EN ROUTE</span>
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
                <span className="dispatch-label">ETA:</span>
                <span className="dispatch-val font-semibold">{eta}</span>
              </div>
              <div className="amb-dispatch-item">
                <span className="dispatch-label">Distance Remaining:</span>
                <span className="dispatch-val font-semibold">{distance}</span>
              </div>
            </div>

            <div className="amb-progress-section mt-3">
              <div className="progress-label-row">
                <span>Dispatch Progress</span>
                <span className="font-semibold text-primary">20%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill bg-primary" style={{ width: '20%' }}></div>
              </div>
            </div>

            <div className="fleet-status-footer mt-3">
              <div className="fleet-stat-badge">
                <span className="stat-num text-success">4 / 8</span>
                <span className="stat-txt">Available</span>
              </div>
              <div className="fleet-stat-badge">
                <span className="stat-num text-primary">1</span>
                <span className="stat-txt">En Route</span>
              </div>
              <div className="fleet-stat-badge">
                <span className="stat-num text-muted">3</span>
                <span className="stat-txt">Occupied</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
