import React from 'react';
import { Truck, AlertTriangle } from 'lucide-react';

export default function AmbulanceTracking({ ambulanceData, selectedEmergency }) {
  const isWaitingForUnit = !selectedEmergency?.assignedAmbulance || selectedEmergency?.status === "Waiting for Unit";

  const data = isWaitingForUnit
    ? {
        code: "No Ambulance Assigned",
        status: "Waiting for Available Unit",
        from: selectedEmergency?.village || "Village A",
        to: "Pending Dispatch",
        eta: "--",
        speed: "0 km/h",
        patient: selectedEmergency?.urgency || "Critical",
        progressPct: 0,
        isWaiting: true
      }
    : ambulanceData || {
        code: selectedEmergency?.assignedAmbulance || "Ambulance #04",
        status: "En Route",
        from: selectedEmergency?.village || "Village D",
        to: selectedEmergency?.assignedHospital || "Hospital B",
        eta: "12 min",
        speed: "58 km/h",
        patient: selectedEmergency?.urgency || "Critical",
        progressPct: 75
      };

  return (
    <div className="card ambulance-tracking-card">
      <div className="card-header-row">
        <h3 className="card-title">Ambulance Tracking</h3>
      </div>

      <div className="amb-top-row">
        <div className="amb-title-group">
          <h4 className="amb-code">{data.code}</h4>
          <span className={`badge ${data.isWaiting ? 'badge-danger' : 'badge-success'}`}>
            {data.status}
          </span>
        </div>
        <div className={`amb-avatar-icon ${data.isWaiting ? 'danger-bg' : ''}`}>
          {data.isWaiting ? <AlertTriangle size={20} className="text-danger" /> : <Truck size={20} />}
        </div>
      </div>

      <div className="amb-details-grid">
        <div className="amb-detail-item">
          <span className="detail-label">From:</span>
          <span className="detail-value">{data.from}</span>
        </div>

        <div className="amb-detail-item">
          <span className="detail-label">To:</span>
          <span className="detail-value">{data.to}</span>
        </div>

        <div className="amb-detail-item">
          <span className="detail-label">ETA:</span>
          <span className="detail-value">{data.eta}</span>
        </div>

        <div className="amb-detail-item">
          <span className="detail-label">Speed:</span>
          <span className="detail-value">{data.speed}</span>
        </div>

        <div className="amb-detail-item span-2">
          <span className="detail-label">Patient:</span>
          <span className="detail-value text-danger font-semibold">{data.patient}</span>
        </div>
      </div>

      <div className="amb-progress-section">
        <div className="progress-label-row">
          <span>{data.status}</span>
          <span className="font-semibold">{data.progressPct}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className={`progress-bar-fill ${data.isWaiting ? 'bg-warning' : 'bg-primary'}`}
            style={{ width: `${data.progressPct}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
