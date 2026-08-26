import React, { useState } from 'react';
import { Truck } from 'lucide-react';

export default function EmergencyPanel({ villages = [], onDispatchEmergency }) {
  const [selectedVillage, setSelectedVillage] = useState(villages[0]?.name || "Village A");
  const [emergencyType, setEmergencyType] = useState("Cardiology");
  const [urgency, setUrgency] = useState("Critical");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onDispatchEmergency) {
      onDispatchEmergency({
        village: selectedVillage,
        type: emergencyType,
        urgency: urgency
      });
    }
  };

  return (
    <div className="card emergency-panel-card">
      <h3 className="card-title">Create Emergency</h3>
      <form onSubmit={handleSubmit} className="emergency-form">
        <div className="form-group">
          <label className="form-label">Village / Location</label>
          <select 
            className="form-select"
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
          >
            {villages.map((v) => (
              <option key={v.id} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Emergency Type</label>
          <select 
            className="form-select"
            value={emergencyType}
            onChange={(e) => setEmergencyType(e.target.value)}
          >
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Trauma">Trauma</option>
            <option value="General Emergency">General Emergency</option>
            <option value="Medicine Delivery">Medicine Delivery</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Urgency</label>
          <div className="select-with-status">
            <span className={`urgency-dot ${urgency.toLowerCase()}`}></span>
            <select 
              className="form-select"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full">
          <Truck size={16} />
          <span>Dispatch Ambulance</span>
        </button>
      </form>
    </div>
  );
}
