import React from 'react';
import { Activity, Bell, ChevronDown, Layers } from 'lucide-react';

export default function Header({ systemTime = "10:32 AM", networkMode = "standard", onToggleNetworkMode }) {
  return (
    <header className="header-container">
      {/* LEFT: Branding & Title */}
      <div className="header-brand">
        <div className="logo-icon-bg">
          <Activity size={20} className="text-white" />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">Rural Healthcare Routing System</h1>
          <span className="brand-subtitle">Emergency Dispatch & Medical Resource Optimization</span>
        </div>
      </div>

      {/* CENTER: Status Indicator & 50,000-Node Network Scale Selector */}
      <div className="header-status flex items-center gap-3">
        <div className="status-pill online">
          <span className="status-dot"></span>
          <span>System Online</span>
        </div>

        {/* Network Scale Dropdown Selector */}
        <div className="network-scale-selector inline-flex items-center gap-1">
          <Layers size={14} className="text-primary" />
          <select 
            className="scale-toggle-select"
            value={networkMode}
            onChange={(e) => onToggleNetworkMode && onToggleNetworkMode(e.target.value)}
          >
            <option value="standard">Standard Demo Network (20 Nodes | 22 Roads | 5 Hospitals | 8 Villages)</option>
            <option value="50k">50,000-Node Mass Scale Engine (50,000 Nodes | 208,652 Roads | 250 Hospitals | 4,000 Villages)</option>
          </select>
        </div>
      </div>

      {/* RIGHT: Clock, Notifications & Admin User Profile */}
      <div className="header-actions">
        <span className="simulation-time">{systemTime}</span>

        <button className="notification-btn" title="System Alerts">
          <Bell size={18} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-profile">
          <div className="avatar-circle">AD</div>
          <span className="user-name">Admin</span>
          <ChevronDown size={14} className="text-muted" />
        </div>
      </div>
    </header>
  );
}
