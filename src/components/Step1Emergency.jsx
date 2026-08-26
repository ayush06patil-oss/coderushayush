import React, { useState } from 'react';
import { AlertCircle, MapPin, Stethoscope, Clock, ArrowRight } from 'lucide-react';
import { MEDICAL_TAXONOMY, formatSpecialtyName } from '../engine/taxonomy';

export default function Step1Emergency({ villages = [], onCreateEmergency }) {
  const [selectedVillage, setSelectedVillage] = useState(villages.length > 0 ? villages[0].name : "Village D");
  const [selectedSpecialty, setSelectedSpecialty] = useState(MEDICAL_TAXONOMY.CARDIOLOGY);
  const [selectedUrgency, setSelectedUrgency] = useState("Critical");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreateEmergency) {
      onCreateEmergency({
        village: selectedVillage,
        type: selectedSpecialty,
        urgency: selectedUrgency
      });
    }
  };

  // Specialty options from Taxonomy
  const specialtyOptions = [
    MEDICAL_TAXONOMY.CARDIOLOGY,
    MEDICAL_TAXONOMY.TRAUMA,
    MEDICAL_TAXONOMY.NEUROLOGY,
    MEDICAL_TAXONOMY.ORTHOPEDICS,
    MEDICAL_TAXONOMY.MATERNITY,
    MEDICAL_TAXONOMY.PEDIATRICS,
    MEDICAL_TAXONOMY.BURN_CARE,
    MEDICAL_TAXONOMY.RESPIRATORY,
    MEDICAL_TAXONOMY.SURGERY,
    MEDICAL_TAXONOMY.GENERAL_EMERGENCY
  ];

  // Limit sample dropdown items for UI performance while allowing full selection
  const displayedVillages = villages.length > 100 ? villages.slice(0, 100) : villages;

  return (
    <div className="card step-card step-1-card">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <AlertCircle size={18} className="text-danger" />
          Step 1: Emergency Request
        </h3>
        <span className="badge badge-danger">Patient Influx Event</span>
      </div>

      <form onSubmit={handleSubmit} className="emergency-form mt-2">
        {/* Village Selection Dropdown */}
        <div className="form-group">
          <label className="form-label inline-flex items-center gap-1">
            <MapPin size={13} className="text-primary" />
            Patient Village Location ({villages.length} Villages Available):
          </label>
          <select 
            value={selectedVillage} 
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="form-select"
          >
            {displayedVillages.map(v => (
              <option key={v.id || v.name} value={v.name}>
                {v.name} {v.population ? `(Pop: ${v.population})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Medical Specialty Selector */}
        <div className="form-group mt-2">
          <label className="form-label inline-flex items-center gap-1">
            <Stethoscope size={13} className="text-primary" />
            Required Medical Specialty:
          </label>
          <select 
            value={selectedSpecialty} 
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="form-select"
          >
            {specialtyOptions.map(spec => (
              <option key={spec} value={spec}>
                {formatSpecialtyName(spec)}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency Level Selector */}
        <div className="form-group mt-2">
          <label className="form-label inline-flex items-center gap-1">
            <Clock size={13} className="text-primary" />
            Emergency Urgency / Priority:
          </label>
          <select 
            value={selectedUrgency} 
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="form-select"
          >
            <option value="Critical">Critical (SLA &lt; 8 mins)</option>
            <option value="High">High (SLA &lt; 15 mins)</option>
            <option value="Medium">Medium (SLA &lt; 30 mins)</option>
            <option value="Low">Low (SLA &lt; 60 mins)</option>
          </select>
        </div>

        <button type="submit" className="btn btn-danger btn-full mt-3">
          <span>CREATE EMERGENCY REQUEST</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
