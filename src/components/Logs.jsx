import React, { useState } from 'react';

export default function Logs({ logs = [] }) {
  const [showAllModal, setShowAllModal] = useState(false);

  const getDotClass = (type) => {
    switch (type) {
      case 'create': return 'dot-blue';
      case 'assign': return 'dot-green';
      case 'warning': return 'dot-red';
      case 'engine': return 'dot-purple';
      default: return 'dot-blue';
    }
  };

  const displayLogs = logs.slice(0, 6);

  return (
    <div className="card recent-logs-card">
      <div className="card-header-row">
        <h3 className="card-title">Recent Logs</h3>
        <button onClick={() => setShowAllModal(true)} className="text-link">
          View all ({logs.length})
        </button>
      </div>

      <div className="logs-list">
        {displayLogs.map((log) => (
          <div key={log.id} className="log-item">
            <span className="log-time">{log.time}</span>
            <span className={`log-dot ${getDotClass(log.type)}`}></span>
            <span className="log-text">{log.text}</span>
          </div>
        ))}
      </div>

      {showAllModal && (
        <div className="simple-modal-overlay" onClick={() => setShowAllModal(false)}>
          <div className="simple-modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h4>All System Event Logs</h4>
            <div className="modal-logs-list">
              {logs.map((log) => (
                <div key={log.id} className="log-item">
                  <span className="log-time">{log.time}</span>
                  <span className={`log-dot ${getDotClass(log.type)}`}></span>
                  <span className="log-text">{log.text}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-4" onClick={() => setShowAllModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
