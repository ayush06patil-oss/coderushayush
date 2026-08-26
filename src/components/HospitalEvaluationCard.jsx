import React, { useState } from 'react';
import { Building2, CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertCircle, Filter } from 'lucide-react';

export default function HospitalEvaluationCard({ evaluationResult, currentEmergency }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showEligibleOnly, setShowEligibleOnly] = useState(true);

  if (!evaluationResult || !evaluationResult.evaluationList) return null;

  const { evaluationList, selectedHospital } = evaluationResult;
  const reqType = currentEmergency?.type || "Cardiology";

  // Find Hospital B & Hospital C for primary demo callout
  const hospB = evaluationList.find(e => e.hospital.id === "node_h_b" || e.hospital.name.includes("Hospital B")) || evaluationList[0];
  const hospC = evaluationList.find(e => e.hospital.id === "node_h_c" || e.hospital.name.includes("Hospital C")) || evaluationList[1];

  // Filter evaluation list based on showEligibleOnly toggle
  const displayedItems = showEligibleOnly 
    ? evaluationList.filter(item => item.isEligible || item.hospital.id === "node_h_b" || item.hospital.id === "node_h_c")
    : evaluationList;

  return (
    <div className="card hospital-evaluation-card mt-3">
      <div 
        className="card-header-row cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="card-title inline-flex items-center gap-2 text-primary">
            <Building2 size={18} />
            Hospital Evaluation (Specialist & Reachability Filter)
          </h3>
          <p className="card-subtitle-text">
            System evaluates medical requirements and road reachability before running graph routing.
          </p>
        </div>
        <button className="log-toggle-btn">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="evaluation-body mt-2">
          {/* Main Demo Callout Banner */}
          <div className="eval-demo-callout">
            <AlertCircle size={16} className="text-primary flex-shrink-0" />
            <span>
              <strong>Nearest hospital ≠ Always best hospital:</strong> Hospital B was closer ({hospB?.distanceFormatted || '18.9 km'}), but rejected because the required {reqType.toLowerCase()} specialist was unavailable. Hospital C ({hospC?.distanceFormatted || '34.3 km'}) was selected because it satisfies all medical and road reachability constraints.
            </span>
          </div>

          {/* Filter Toggle & Item Count Bar */}
          <div className="eval-filter-bar mt-3">
            <span className="font-semibold text-muted text-xs inline-flex items-center gap-1">
              <Filter size={12} /> Filter Mode:
            </span>
            <div className="filter-toggle-buttons">
              <button 
                className={`btn-filter-toggle ${showEligibleOnly ? 'active' : ''}`}
                onClick={() => setShowEligibleOnly(true)}
              >
                Show Eligible Only ({evaluationList.filter(e => e.isEligible).length})
              </button>
              <button 
                className={`btn-filter-toggle ${!showEligibleOnly ? 'active' : ''}`}
                onClick={() => setShowEligibleOnly(false)}
              >
                Show All ({evaluationList.length})
              </button>
            </div>
          </div>

          {/* Scrollable Hospital Evaluation Breakdown List */}
          <div className="eval-items-scroll-container mt-2">
            <div className="eval-items-list">
              {displayedItems.map((item) => {
                const h = item.hospital;
                const isSelected = selectedHospital && selectedHospital.id === h.id;

                return (
                  <div 
                    key={h.id} 
                    className={`eval-item-card ${isSelected ? 'eval-selected-card' : item.isEligible ? 'eval-eligible-card' : 'eval-rejected-card'}`}
                  >
                    <div className="eval-item-header">
                      <div className="eval-item-title">
                        <span className="font-semibold text-main">{h.name}</span>
                        <span className="eval-dist-tag">{item.distanceFormatted}</span>
                      </div>

                      <div className="eval-item-status">
                        {isSelected ? (
                          <span className="badge badge-success inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> SELECTED
                          </span>
                        ) : item.isEligible ? (
                          <span className="badge badge-purple inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> ELIGIBLE
                          </span>
                        ) : (
                          <span className="badge badge-danger inline-flex items-center gap-1">
                            <XCircle size={12} /> REJECTED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="eval-item-details">
                      {item.isEligible ? (
                        <span className="text-success font-semibold inline-flex items-center gap-1">
                          ✓ {reqType} Specialist Available ({h.bedsAvailable || 72} beds, {h.medicineStock || 82}% Meds)
                        </span>
                      ) : (
                        <span className="text-danger font-semibold inline-flex items-center gap-1">
                          ❌ {item.rejectionReason}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
