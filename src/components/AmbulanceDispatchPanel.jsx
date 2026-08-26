import React from 'react';
import { Truck } from 'lucide-react';

export default function AmbulanceDispatchPanel({ 
  ambulanceCode = "Ambulance #02", 
  status = "En Route", 
  from = "Village A", 
  to = "Hospital C", 
  onDispatch 
}) {
  return (
    <div className="card ambulance-dispatch-panel">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <Truck size={18} className="text-primary" />
          🚑 Ambulance Dispatch
        </h3>
        <span className="badge badge-success">{status}</span>
      </div>

      <div className="amb-dispatch-grid">
        <div className="amb-dispatch-item">
          <span className="dispatch-label">Ambulance:</span>
          <span className="dispatch-val font-semibold">{ambulanceCode}</span>
        </div>
        <div className="amb-dispatch-item">
          <span className="dispatch-label">Status:</span>
          <span className="dispatch-val text-success font-semibold">{status}</span>
        </div>
        <div className="amb-dispatch-item">
          <span className="dispatch-label">From:</span>
          <span className="dispatch-val">{from}</span>
        </div>
        <div className="amb-dispatch-item">
          <span className="dispatch-label">To:</span>
          <span className="dispatch-val font-semibold text-primary">{to}</span>
        </div>
      </div>

      <button 
        onClick={() => onDispatch && onDispatch()}
        className="btn btn-primary btn-full mt-2"
      >
        <Truck size={16} />
        <span>DISPATCH AMBULANCE</span>
      </button>
    </div>
  );
}
