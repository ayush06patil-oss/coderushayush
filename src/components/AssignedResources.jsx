import React, { useState } from 'react';
import { Truck, User, Building2 } from 'lucide-react';

export default function AssignedResources({ emergency }) {
  const [showModal, setShowModal] = useState(false);

  const amb = emergency?.assignedAmbulance || "Unassigned (Waiting)";
  const doc = emergency?.assignedDoctor || "Unassigned";
  const hosp = emergency?.assignedHospital || "Unassigned";

  const isAssigned = !!emergency?.assignedAmbulance && emergency?.assignedAmbulance !== "Unassigned (Waiting)";

  return (
    <div className="card assigned-resources-card">
      <h3 className="card-title">Assigned Resources</h3>

      <div className="resources-list">
        <div className="resource-item">
          <div className="resource-label-group">
            <Truck size={16} className="resource-icon" />
            <span className="resource-type">Ambulance</span>
          </div>
          <span className={`resource-name font-semibold ${!isAssigned ? 'text-danger' : ''}`}>
            {amb}
          </span>
        </div>

        <div className="resource-item">
          <div className="resource-label-group">
            <User size={16} className="resource-icon" />
            <span className="resource-type">Doctor</span>
          </div>
          <span className="resource-name font-semibold">{doc}</span>
        </div>

        <div className="resource-item">
          <div className="resource-label-group">
            <Building2 size={16} className="resource-icon" />
            <span className="resource-type">Hospital</span>
          </div>
          <span className="resource-name font-semibold">{hosp}</span>
        </div>
      </div>

      <button 
        onClick={() => setShowModal(true)}
        className="btn btn-primary btn-full mt-auto"
      >
        View Details
      </button>

      {showModal && (
        <div className="simple-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Assigned Resource Details</h4>
            <div className="modal-body-list">
              <p><strong>Emergency Request:</strong> {emergency?.id || "#101"} ({emergency?.type || "Cardiology"})</p>
              <p><strong>Origin Village:</strong> {emergency?.village || "Village A"}</p>
              <p><strong>Assigned Ambulance:</strong> {amb}</p>
              <p><strong>Assigned Specialist:</strong> {doc}</p>
              <p><strong>Destination Facility:</strong> {hosp}</p>
            </div>
            <button className="btn btn-primary mt-4" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
