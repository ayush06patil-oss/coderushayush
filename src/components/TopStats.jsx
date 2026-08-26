import React, { useState } from 'react';
import { Activity, Truck, Building2, AlertTriangle } from 'lucide-react';

export default function TopStats({ 
  activeEmergencies = 2,
  ambulancesAvailable = "5 / 8",
  hospitalsOnline = 6,
  roadsBlocked = 3
}) {
  const [modalTitle, setModalTitle] = useState(null);

  const cards = [
    {
      id: 'active_emergencies',
      title: 'Active Emergencies',
      value: activeEmergencies,
      color: 'danger',
      icon: Activity,
      details: `${activeEmergencies} emergencies currently active in system dispatch queue.`
    },
    {
      id: 'ambulances_available',
      title: 'Ambulances Available',
      value: ambulancesAvailable,
      color: 'success',
      icon: Truck,
      details: `${ambulancesAvailable} fleet units available for dispatch across regional health posts.`
    },
    {
      id: 'hospitals_online',
      title: 'Hospitals Online',
      value: hospitalsOnline,
      color: 'primary',
      icon: Building2,
      details: `${hospitalsOnline} primary, secondary & trauma facilities online in system node map.`
    },
    {
      id: 'road_blocked',
      title: 'Road Blocked',
      value: roadsBlocked,
      color: 'purple',
      icon: AlertTriangle,
      details: `${roadsBlocked} road network segments currently flagged as blocked/impassable.`
    },
  ];

  return (
    <div className="top-stats-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={`stat-card ${card.color}`}>
            <div className="stat-info">
              <span className="stat-title">{card.title}</span>
              <span className="stat-value">{card.value}</span>
              <button 
                className="stat-link"
                onClick={() => setModalTitle({ title: card.title, details: card.details })}
              >
                View status
              </button>
            </div>
            <div className={`stat-icon-wrapper ${card.color}`}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}

      {modalTitle && (
        <div className="simple-modal-overlay" onClick={() => setModalTitle(null)}>
          <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
            <h4>{modalTitle.title}</h4>
            <p>{modalTitle.details}</p>
            <button className="btn btn-primary mt-4" onClick={() => setModalTitle(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
