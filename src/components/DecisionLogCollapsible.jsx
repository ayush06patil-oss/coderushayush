import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function DecisionLogCollapsible({ logs = [] }) {
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default as requested

  // Deduplicate logs by unique text/time key
  const uniqueLogs = Array.from(
    new Map(logs.map(log => [`${log.time}_${log.text}`, log])).values()
  );

  const getDotClass = (type) => {
    switch (type) {
      case 'create': return 'dot-blue';
      case 'assign': return 'dot-green';
      case 'warning': return 'dot-red';
      case 'engine': return 'dot-purple';
      case 'route': return 'dot-blue';
      default: return 'dot-blue';
    }
  };

  return (
    <div className="card decision-log-collapsible">
      <div 
        className="card-header-row cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="card-title inline-flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          Decision Log ({uniqueLogs.length} events)
        </h3>
        <button className="log-toggle-btn">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="logs-list mt-2">
          {uniqueLogs.map((log) => (
            <div key={log.id} className="log-item">
              <span className="log-time">{log.time}</span>
              <span className={`log-dot ${getDotClass(log.type)}`}></span>
              <span className="log-text">{log.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
