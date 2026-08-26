import React from 'react';
import { Navigation, Play } from 'lucide-react';

export default function Step3RoutingControls({ 
  selectedAlgorithm, 
  onAlgorithmChange, 
  fromLocation = "Village A",
  toLocation = "Hospital C",
  onCalculateRoute 
}) {
  return (
    <div className="card step-card step-3-card">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <Navigation size={18} className="text-primary" />
          Step 3: Routing Engine
        </h3>
        <span className="badge badge-success">Algorithm Execution</span>
      </div>

      <div className="route-origin-dest-banner">
        <div className="banner-point">
          <span className="point-label">From:</span>
          <span className="point-val">{fromLocation}</span>
        </div>
        <span className="banner-arrow">→</span>
        <div className="banner-point">
          <span className="point-label">To:</span>
          <span className="point-val font-semibold text-primary">{toLocation}</span>
        </div>
      </div>

      <div className="form-group mt-2">
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

      <button 
        onClick={() => onCalculateRoute && onCalculateRoute()}
        className="btn btn-primary btn-full mt-3"
      >
        <Play size={16} />
        <span>CALCULATE ROUTE</span>
      </button>
    </div>
  );
}
