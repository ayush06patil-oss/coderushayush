import React from 'react';
import { BarChart2, Info } from 'lucide-react';

export default function AlgorithmComparisonCard({ benchmarkResult }) {
  if (!benchmarkResult) return null;

  const { dijkstra, astar } = benchmarkResult;

  return (
    <div className="card benchmark-card">
      <div className="card-header-row">
        <h3 className="card-title inline-flex items-center gap-2">
          <BarChart2 size={18} className="text-primary" />
          Algorithm Comparison
        </h3>
        <span className="badge badge-purple">Real Benchmark Execution</span>
      </div>

      <table className="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Dijkstra</th>
            <th>A* Search</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Distance</td>
            <td>{dijkstra.distance} km</td>
            <td>{astar.distance} km</td>
          </tr>
          <tr>
            <td>Travel Time</td>
            <td>{dijkstra.travelTime} min</td>
            <td>{astar.travelTime} min</td>
          </tr>
          <tr>
            <td>Nodes Visited</td>
            <td>{dijkstra.visitedNodes}</td>
            <td className="text-success font-semibold">{astar.visitedNodes}</td>
          </tr>
          <tr>
            <td>Execution Time</td>
            <td>{dijkstra.executionTime} ms</td>
            <td className="text-success font-semibold">{astar.executionTime} ms</td>
          </tr>
        </tbody>
      </table>

      <div className="comparison-note">
        <Info size={14} className="text-primary flex-shrink-0" />
        <span>Both algorithms find the same optimal route; A* uses a heuristic to guide the search.</span>
      </div>
    </div>
  );
}
