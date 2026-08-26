import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RouteResultCard({ routeResult }) {
  if (!routeResult) return null;

  const isNoRoute = routeResult.status === "NO_ROUTE";

  return (
    <div className={`card route-result-card ${isNoRoute ? 'result-no-route' : 'result-success'}`}>
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          {isNoRoute ? (
            <span className="text-danger inline-flex items-center gap-2">
              <AlertTriangle size={20} /> ⚠ NO ROUTE AVAILABLE
            </span>
          ) : (
            <span className="text-success inline-flex items-center gap-2">
              <CheckCircle2 size={20} /> ✓ ROUTE FOUND
            </span>
          )}
        </h3>
        <span className="badge badge-purple">{routeResult.algorithm}</span>
      </div>

      <div className="result-metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Algorithm</span>
          <span className="metric-val text-primary">{routeResult.algorithm}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Distance</span>
          <span className={`metric-val ${isNoRoute ? 'text-danger' : ''}`}>
            {isNoRoute ? 'Infinity' : `${routeResult.distance} km`}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Estimated Time</span>
          <span className="metric-val">
            {isNoRoute ? 'Infinity' : `${routeResult.travelTime} min`}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Nodes Visited</span>
          <span className="metric-val">{routeResult.visitedNodes}</span>
        </div>

        <div className="metric-box span-full">
          <span className="metric-label">Execution Time</span>
          <span className="metric-val text-success">{routeResult.executionTime} ms</span>
        </div>
      </div>
    </div>
  );
}
