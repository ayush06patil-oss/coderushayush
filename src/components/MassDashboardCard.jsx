import React from 'react';
import { Cpu, Layers, Activity, Truck, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export default function MassDashboardCard({ massData }) {
  if (!massData) return null;

  const {
    totalNodes = 50000,
    totalEdges = 200000,
    villages = [],
    hospitals = [],
    healthCenters = [],
    ambulances = [],
    patients = [],
    initTimeMs = 315
  } = massData;

  const safeCount = patients.filter(p => p.slaStatus === "SAFE").length;
  const atRiskCount = patients.filter(p => p.slaStatus === "AT_RISK").length;
  const breachedCount = patients.filter(p => p.slaStatus === "BREACHED").length;

  const availableAmbs = ambulances.filter(a => a.status === "AVAILABLE").length;
  const enRouteAmbs = ambulances.filter(a => a.status === "EN_ROUTE" || a.status === "DISPATCHED").length;

  return (
    <div className="card mass-dashboard-card mt-3">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2 text-primary">
          <Activity size={18} />
          🌐 50,000-Node & Mass Healthcare Simulation Live Dashboard
        </h3>
        <span className="badge badge-success">5,000+ Patient Influx Online</span>
      </div>

      <p className="card-subtitle-text">
        Real-time telemetry and SLA time-window tracking across 50,000 nodes, 200,000 road edges, 5,000 facilities & 100 ambulances.
      </p>

      {/* Main Stats Grid */}
      <div className="scalability-grid mt-3">
        {/* GRAPH */}
        <div className="sc-metric-box">
          <div className="sc-metric-header">
            <Layers size={14} className="text-primary" />
            <span className="sc-metric-label">Routing Graph</span>
          </div>
          <div className="sc-metric-val font-semibold">{totalNodes.toLocaleString()} Nodes</div>
          <span className="sc-metric-sub">{totalEdges.toLocaleString()} Weighted Edges ({initTimeMs} ms)</span>
        </div>

        {/* HEALTHCARE FACILITIES */}
        <div className="sc-metric-box">
          <div className="sc-metric-header">
            <Cpu size={14} className="text-purple" />
            <span className="sc-metric-label">Healthcare Points</span>
          </div>
          <div className="sc-metric-val font-semibold text-purple">5,000 Facilities</div>
          <span className="sc-metric-sub">4,000 Villages, {hospitals.length} Hospitals, {healthCenters.length} Health Centers</span>
        </div>

        {/* AMBULANCE FLEET */}
        <div className="sc-metric-box">
          <div className="sc-metric-header">
            <Truck size={14} className="text-success" />
            <span className="sc-metric-label">Ambulance Fleet</span>
          </div>
          <div className="sc-metric-val font-semibold text-success">{ambulances.length} Units</div>
          <span className="sc-metric-sub">{availableAmbs} Available, {enRouteAmbs} En Route</span>
        </div>

        {/* PATIENT INFLUX & SLA */}
        <div className="sc-metric-box">
          <div className="sc-metric-header">
            <Clock size={14} className="text-warning" />
            <span className="sc-metric-label">Patient Influx & SLA</span>
          </div>
          <div className="sc-metric-val font-semibold text-warning">{patients.length.toLocaleString()} Patients</div>
          <span className="sc-metric-sub">{safeCount} SAFE | {atRiskCount} AT RISK | {breachedCount} BREACHED</span>
        </div>
      </div>

      {/* SLA Status Pill Breakdown */}
      <div className="sla-breakdown-row mt-3">
        <div className="sla-pill safe-pill">
          <ShieldCheck size={14} />
          <span>SAFE (Within SLA): <strong>{safeCount}</strong></span>
        </div>
        <div className="sla-pill risk-pill">
          <AlertTriangle size={14} />
          <span>AT RISK (&lt;3m remaining): <strong>{atRiskCount}</strong></span>
        </div>
        <div className="sla-pill breach-pill">
          <AlertTriangle size={14} />
          <span>BREACHED (Deadline Exceeded): <strong>{breachedCount}</strong></span>
        </div>
      </div>
    </div>
  );
}
