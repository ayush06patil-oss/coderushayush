import React from 'react';
import { BedDouble, Pill, Truck } from 'lucide-react';

export default function CapacityCard({ capacity }) {
  const beds = capacity?.hospitalBeds || { hospital: "Hospital C", available: 72, total: 100, pct: 72 };
  const meds = capacity?.cardiacMedicine || { item: "Cardiac Medicine", availablePct: 82 };
  const amb = capacity?.ambulances || { available: 5, total: 8 };

  return (
    <div className="card capacity-card">
      <h3 className="card-title">System Resource Capacity</h3>

      <div className="capacity-items-grid">
        {/* Hospital Beds Meter */}
        <div className="capacity-item">
          <div className="capacity-header">
            <span className="capacity-label">
              <BedDouble size={16} className="text-primary" />
              Hospital Beds ({beds.hospital})
            </span>
            <span className="capacity-val font-semibold">{beds.available} / {beds.total}</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill bg-primary"
              style={{ width: `${beds.pct}%` }}
            ></div>
          </div>
        </div>

        {/* Medicine Meter */}
        <div className="capacity-item">
          <div className="capacity-header">
            <span className="capacity-label">
              <Pill size={16} className="text-warning" />
              {meds.item} Stock
            </span>
            <span className="capacity-val font-semibold">{meds.availablePct}%</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill bg-warning"
              style={{ width: `${meds.availablePct}%` }}
            ></div>
          </div>
        </div>

        {/* Ambulances Meter */}
        <div className="capacity-item">
          <div className="capacity-header">
            <span className="capacity-label">
              <Truck size={16} className="text-success" />
              Ambulances Available
            </span>
            <span className="capacity-val font-semibold">{amb.available} / {amb.total}</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill bg-success"
              style={{ width: `${(amb.available / amb.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
