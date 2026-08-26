import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function SimulationControls({ onTriggerSimulation, isRoadR17Blocked }) {
  const [selectedEvent, setSelectedEvent] = useState("road_block_r17");

  const handleSimulate = () => {
    if (onTriggerSimulation) {
      onTriggerSimulation(selectedEvent);
    }
  };

  return (
    <div className="card simulation-controls-card">
      <div className="card-header-row">
        <h3 className="card-title">Road Status / Edge Case Simulation</h3>
        <span className="badge badge-purple">Phase 1 Control</span>
      </div>

      <div className="sim-form-row">
        <div className="form-group flex-1">
          <label className="form-label">Simulation Event</label>
          <select 
            className="form-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="road_block_r17">
              {isRoadR17Blocked ? "Toggle Cleared Road R17" : "Road R17 Blocked"}
            </option>
            <option value="specialist_unavailable">Specialist Unavailable (Hospital B)</option>
            <option value="all_ambulances_busy">All Ambulances Occupied</option>
            <option value="bed_full">Hospital Bed Full</option>
            <option value="medicine_depleted">Medicine Depleted</option>
          </select>
        </div>

        <button 
          onClick={handleSimulate}
          className="btn btn-warning sim-btn"
        >
          <Play size={16} />
          <span>Simulate</span>
        </button>
      </div>
    </div>
  );
}
