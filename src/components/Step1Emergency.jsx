import React, { useState } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function Step1Emergency({ villages = [], onCreateEmergency }) {
  const [selectedVillage, setSelectedVillage] = useState("Village A");
  const [medicalReq, setMedicalReq] = useState("Cardiology");
  const [priority, setPriority] = useState("Critical");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreateEmergency) {
      onCreateEmergency({
        village: selectedVillage,
        type: medicalReq,
        urgency: priority
      });
    }
  };

  return (
    <div className="card step-card step-1-card">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <AlertCircle size={18} className="text-danger" />
          Step 1: Emergency Request
        </h3>
        <span className="badge badge-danger">Active Step</span>
      </div>

      <form onSubmit={handleSubmit} className="emergency-form">
        <div className="form-group">
          <label className="form-label">Village / Origin</label>
          <select 
            className="form-select"
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
          >
            <option value="Village A">Village A</option>
            <option value="Village B">Village B</option>
            <option value="Village D">Village D</option>
            <option value="Village C">Village C</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Medical Requirement</label>
          <select 
            className="form-select"
            value={medicalReq}
            onChange={(e) => setMedicalReq(e.target.value)}
          >
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Trauma">Trauma</option>
            <option value="Orthopedics">Orthopedics</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <div className="select-with-status">
            <span className={`urgency-dot ${priority.toLowerCase()}`}></span>
            <select 
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full mt-2">
          <span>CREATE EMERGENCY</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
