import React, { useState } from 'react';
import { Navigation, Play, BarChart2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RouteSummary({ 
  routeResult, 
  benchmarkResult,
  selectedAlgorithm, 
  onAlgorithmChange,
  targetHospitalId,
  onTargetHospitalChange,
  hospitals = [],
  onRunRouting 
}) {
  const [showBenchmarkTable, setShowBenchmarkTable] = useState(true);

  const isNoRoute = routeResult?.status === "NO_ROUTE";
  const isFound = routeResult?.status === "FOUND";

  return (
    <div className="card route-summary-card">
      <div className="card-header-row">
        <h3 className="card-title">Route Summary</h3>
        <span className={`badge ${isFound ? 'badge-success' : isNoRoute ? 'badge-danger' : 'badge-purple'}`}>
          {isFound ? 'Route Found' : isNoRoute ? 'NO ROUTE AVAILABLE' : 'Ready'}
        </span>
      </div>

      {/* Algorithm & Target Controls */}
      <div className="routing-controls-group">
        <div className="form-group flex-1">
          <label className="form-label">Algorithm</label>
          <select 
            className="form-select"
            value={selectedAlgorithm}
            onChange={(e) => onAlgorithmChange && onAlgorithmChange(e.target.value)}
          >
            <option value="astar">A* Search (Recommended)</option>
            <option value="dijkstra">Dijkstra Shortest Path</option>
          </select>
        </div>

        <div className="form-group flex-1">
          <label className="form-label">Target Hospital</label>
          <select 
            className="form-select"
            value={targetHospitalId}
            onChange={(e) => onTargetHospitalChange && onTargetHospitalChange(e.target.value)}
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name} ({h.distanceKm || '--'} km)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Run Routing Action Button */}
      <button 
        onClick={() => onRunRouting && onRunRouting()} 
        className="btn btn-primary btn-full mb-3"
      >
        <Play size={16} />
        <span>Run Routing Engine</span>
      </button>

      {/* Actual Algorithm Output Summary */}
      <div className="summary-info-grid">
        <div className="info-row">
          <span className="info-label">Algorithm:</span>
          <span className="info-value font-semibold text-primary">
            {routeResult?.algorithm || (selectedAlgorithm === 'astar' ? 'A*' : 'Dijkstra')}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Distance:</span>
          <span className={`info-value font-semibold ${isNoRoute ? 'text-danger' : ''}`}>
            {isNoRoute ? 'Infinity' : routeResult?.distance ? `${routeResult.distance} km` : '--'}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Estimated Time:</span>
          <span className="info-value font-semibold">
            {isNoRoute ? 'Infinity' : routeResult?.travelTime ? `${routeResult.travelTime} min` : '--'}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Nodes Visited:</span>
          <span className="info-value font-semibold">{routeResult?.visitedNodes ?? '--'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Execution Time:</span>
          <span className="info-value font-semibold">{routeResult?.executionTime !== undefined ? `${routeResult.executionTime} ms` : '--'}</span>
        </div>
      </div>

      {/* No Route Warning Banner */}
      {isNoRoute && (
        <div className="no-route-banner">
          <AlertTriangle size={16} className="text-danger flex-shrink-0" />
          <span>All available roads to target are blocked. No valid route found.</span>
        </div>
      )}

      {/* Benchmark Side-by-Side Comparison Section */}
      {benchmarkResult && (
        <div className="benchmark-box">
          <div className="benchmark-header">
            <span className="benchmark-title">
              <BarChart2 size={14} /> Algorithmic Benchmark
            </span>
            <button 
              className="text-link text-xs" 
              onClick={() => setShowBenchmarkTable(!showBenchmarkTable)}
            >
              {showBenchmarkTable ? 'Hide' : 'Show'}
            </button>
          </div>

          {showBenchmarkTable && (
            <table className="benchmark-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Dijkstra</th>
                  <th>A*</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Distance</td>
                  <td>{benchmarkResult.dijkstra.distance} km</td>
                  <td>{benchmarkResult.astar.distance} km</td>
                </tr>
                <tr>
                  <td>Travel Time</td>
                  <td>{benchmarkResult.dijkstra.travelTime} min</td>
                  <td>{benchmarkResult.astar.travelTime} min</td>
                </tr>
                <tr>
                  <td>Nodes Visited</td>
                  <td>{benchmarkResult.dijkstra.visitedNodes}</td>
                  <td className="text-success font-semibold">{benchmarkResult.astar.visitedNodes}</td>
                </tr>
                <tr>
                  <td>Execution Time</td>
                  <td>{benchmarkResult.dijkstra.executionTime} ms</td>
                  <td className="text-success font-semibold">{benchmarkResult.astar.executionTime} ms</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
