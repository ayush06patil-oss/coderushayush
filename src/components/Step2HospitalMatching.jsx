import React from 'react';
import { Building2, CheckCircle2, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Step2HospitalMatching({ 
  currentEmergency, 
  evaluationResult, 
  onSelectDestination 
}) {
  const reqType = currentEmergency?.type || "Cardiology";
  const evaluationList = evaluationResult?.evaluationList || [];
  const selectedHospital = evaluationResult?.selectedHospital || null;
  const isSelectable = !!selectedHospital;

  // Filter to show eligible hospitals and key demo comparison candidate (Hospital B)
  const displayedMatches = evaluationList.filter(item => 
    item.isEligible || item.hospital.id === "node_h_b" || item.hospital.name.includes("Hospital B")
  );

  return (
    <div className="card step-card step-2-card">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <Building2 size={18} className="text-primary" />
          Step 2: Healthcare Matching
        </h3>
        <span className="badge badge-purple">Medical & Road Reachability</span>
      </div>

      <div className="emergency-summary-banner">
        <span>Active Emergency: <strong>{currentEmergency?.id || "#101"}</strong> ({currentEmergency?.village || "Village D"} → <strong>{reqType}</strong>)</span>
      </div>

      {/* Scrollable Matching Candidates List */}
      <div className="hospital-matching-scroll-container">
        <div className="hospital-matching-list">
          {displayedMatches.map((item) => {
            const h = item.hospital;
            const isSelected = selectedHospital && selectedHospital.id === h.id;

            return (
              <div 
                key={h.id} 
                className={`hospital-match-item ${isSelected ? 'available-card highlighted-match' : item.isEligible ? 'available-card' : 'unavailable-card'}`}
              >
                <div className="hosp-match-header">
                  <span className="hosp-match-name">{h.name}</span>
                  <span className="hosp-match-dist">{item.distanceFormatted}</span>
                </div>
                <div className={`hosp-match-status ${item.isEligible ? 'text-success' : 'text-danger'}`}>
                  {item.isEligible ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>On-Duty {reqType} Specialist Available ({h.bedsAvailable || 72} beds)</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      <span>{item.rejectionReason}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isSelectable ? (
        <button 
          onClick={() => onSelectDestination && onSelectDestination(selectedHospital.id)}
          className="btn btn-primary btn-full mt-3"
        >
          <span>SELECT {selectedHospital.name.toUpperCase()}</span>
          <ArrowRight size={16} />
        </button>
      ) : (
        <button 
          disabled
          className="btn btn-danger btn-full mt-3 disabled cursor-not-allowed"
        >
          <AlertTriangle size={16} />
          <span>❌ NO SUITABLE HOSPITAL AVAILABLE</span>
        </button>
      )}
    </div>
  );
}
