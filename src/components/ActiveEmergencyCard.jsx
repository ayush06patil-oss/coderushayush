import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ActiveEmergencyCard({ 
  emergencies = [], 
  selectedEmergencyId, 
  onSelectEmergency,
  hospitals = [] 
}) {
  const currentEmergency = emergencies.find(e => e.id === selectedEmergencyId) || emergencies[0] || {
    id: "#101",
    village: "Village A",
    type: "Cardiology",
    urgency: "Critical",
    requestedAt: "10:32 AM"
  };

  const hospitalB = hospitals.find(h => h.id === "node_h_b") || { hasCardiologist: false, distanceKm: 10 };
  const hospitalC = hospitals.find(h => h.id === "node_h_c") || { hasCardiologist: true, distanceKm: 25 };

  const isCardiologyReq = currentEmergency.type === "Cardiology";

  return (
    <div className="card active-emergency-card">
      <div className="card-header-row">
        <h3 className="card-title">Active Emergency</h3>
        <span className={`badge ${currentEmergency.urgency === 'Critical' ? 'badge-danger' : 'badge-purple'}`}>
          {currentEmergency.urgency}
        </span>
      </div>

      {/* Emergency Queue Selection Bar */}
      {emergencies.length > 1 && (
        <div className="emergency-queue-selector">
          <span className="selector-label">Active Queue:</span>
          <div className="queue-chips font-semibold">
            {emergencies.map(e => (
              <button
                key={e.id}
                className={`queue-chip ${e.id === currentEmergency.id ? 'active' : ''}`}
                onClick={() => onSelectEmergency && onSelectEmergency(e.id)}
              >
                {e.id}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="emergency-info-grid">
        <div className="info-row">
          <span className="info-label">ID:</span>
          <span className="info-value font-semibold">{currentEmergency.id}</span>
        </div>
        <div className="info-row">
          <span className="info-label">From:</span>
          <span className="info-value">{currentEmergency.village}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Type:</span>
          <span className="info-value">{currentEmergency.type}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Requested At:</span>
          <span className="info-value">{currentEmergency.requestedAt}</span>
        </div>
      </div>

      {/* Specialist Match Scenario Box */}
      <div className="specialist-scenario-box">
        <div className="scenario-title">Healthcare Specialist Matching Scenario</div>
        <div className="scenario-hospitals">
          <div className="hospital-option unavailable">
            <span className="hosp-name">Hospital B ({hospitalB.distanceKm || 10} km)</span>
            <span className="hosp-status text-danger">
              {isCardiologyReq && !hospitalB.hasCardiologist ? (
                <><XCircle size={14} /> Cardiologist unavailable</>
              ) : (
                <><CheckCircle2 size={14} /> General Available</>
              )}
            </span>
          </div>
          <div className="hospital-option available">
            <span className="hosp-name">Hospital C ({hospitalC.distanceKm || 25} km)</span>
            <span className="hosp-status text-success">
              {hospitalC.bedsAvailable === 0 ? (
                <span className="text-danger font-semibold"><XCircle size={14} /> Bed Capacity FULL</span>
              ) : (
                <><CheckCircle2 size={14} /> On-Duty Cardiologist</>
              )}
            </span>
          </div>
        </div>
        <div className="phase2-pending-badge">
          <Clock size={14} />
          <span>Routing Engine: Waiting for Phase 2</span>
        </div>
      </div>
    </div>
  );
}
