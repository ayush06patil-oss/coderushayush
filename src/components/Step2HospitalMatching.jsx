import React from 'react';
import { Building2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function Step2HospitalMatching({ 
  currentEmergency, 
  hospitals = [], 
  onSelectDestination 
}) {
  const hospitalB = hospitals.find(h => h.id === "node_h_b") || { name: "Hospital B", distanceKm: 10, hasCardiologist: false };
  const hospitalC = hospitals.find(h => h.id === "node_h_c") || { name: "Hospital C", distanceKm: 25, hasCardiologist: true, bedsAvailable: 72 };

  const isCardiology = (currentEmergency?.type || "Cardiology") === "Cardiology";

  return (
    <div className="card step-card step-2-card">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <Building2 size={18} className="text-primary" />
          Step 2: Healthcare Matching
        </h3>
        <span className="badge badge-purple">Medical Constraint</span>
      </div>

      <div className="emergency-summary-banner">
        <span>Active Emergency: <strong>{currentEmergency?.id || "#101"}</strong> ({currentEmergency?.village || "Village A"} → <strong>{currentEmergency?.type || "Cardiology"}</strong>)</span>
      </div>

      <div className="hospital-matching-list">
        {/* Hospital B Option */}
        <div className="hospital-match-item unavailable-card">
          <div className="hosp-match-header">
            <span className="hosp-match-name">{hospitalB.name}</span>
            <span className="hosp-match-dist">{hospitalB.distanceKm || 10} km</span>
          </div>
          <div className="hosp-match-status text-danger">
            <XCircle size={16} />
            <span>{isCardiology ? "Cardiologist unavailable" : "Specialist unavailable"}</span>
          </div>
        </div>

        {/* Hospital C Option (Highlighted Destination) */}
        <div className="hospital-match-item available-card highlighted-match">
          <div className="hosp-match-header">
            <span className="hosp-match-name">{hospitalC.name}</span>
            <span className="hosp-match-dist">{hospitalC.distanceKm || 25} km</span>
          </div>
          <div className="hosp-match-status text-success">
            <CheckCircle2 size={16} />
            <span>On-Duty Cardiologist Available ({hospitalC.bedsAvailable || 72} beds)</span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onSelectDestination && onSelectDestination("node_h_c")}
        className="btn btn-primary btn-full mt-3"
      >
        <span>SELECT HOSPITAL C</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
