import React from 'react';
import { Truck, Building2, BedDouble, Pill } from 'lucide-react';

export default function LiveResourcesCard({ 
  ambulancesAvailableStr = "4 / 8",
  hospitalsOnline = 5,
  bedsAvailable = 72,
  bedsTotal = 100,
  medicinePct = 82
}) {
  return (
    <div className="card live-resources-card">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <Building2 size={18} className="text-primary" />
          Live Resource Status
        </h3>
        <span className="badge badge-success">System State</span>
      </div>

      <div className="resources-mini-grid">
        <div className="resource-mini-box">
          <div className="mini-box-header">
            <Truck size={16} className="text-success" />
            <span className="mini-box-label">Ambulances</span>
          </div>
          <span className="mini-box-val text-success">{ambulancesAvailableStr} Available</span>
        </div>

        <div className="resource-mini-box">
          <div className="mini-box-header">
            <Building2 size={16} className="text-primary" />
            <span className="mini-box-label">Hospitals</span>
          </div>
          <span className="mini-box-val text-primary">{hospitalsOnline} Online</span>
        </div>

        <div className="resource-mini-box">
          <div className="mini-box-header">
            <BedDouble size={16} className="text-warning" />
            <span className="mini-box-label">Hospital Beds</span>
          </div>
          <span className="mini-box-val">{bedsAvailable} / {bedsTotal}</span>
        </div>

        <div className="resource-mini-box">
          <div className="mini-box-header">
            <Pill size={16} className="text-purple" />
            <span className="mini-box-label">Cardiac Stock</span>
          </div>
          <span className="mini-box-val">{medicinePct}% Available</span>
        </div>
      </div>
    </div>
  );
}
