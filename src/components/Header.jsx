import React from 'react';
import { HeartPulse, Bell, ChevronDown, Layers } from 'lucide-react';

export default function Header({ 
  systemTime = "10:32 AM", 
  networkMode = "standard", 
  onToggleNetworkMode 
}) {
  return (
    <header className="header-container">
      {/* LEFT: Branding */}
      <div className="header-brand">
        <div className="logo-icon-bg">
          <HeartPulse size={20} />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">Rural Healthcare</h1>
          <span className="brand-subtitle">Routing & Dispatch System</span>
        </div>
      </div>

      {/* CENTER: System Online Pill & Network Scale Mode Toggle */}
      <div className="header-status">
        <div className="status-pill online">
          <span className="status-dot"></span>
          <span>System Online</span>
        </div>

        {/* Network Scale Mode Dropdown Toggle */}
        <div className="network-toggle-wrapper ml-3">
          <select 
            value={networkMode} 
            onChange={(e) => onToggleNetworkMode && onToggleNetworkMode(e.target.value)}
            className="form-select scale-toggle-select"
            title="Toggle Network Scale Mode"
          >
            <option value="standard">Standard Demo Network (10 Nodes)</option>
            <option value="50k">50,000-Node Scalability Engine (50k Nodes)</option>
          </select>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="header-actions">
        <span className="simulation-time">{systemTime}</span>
        
        <div className="notification-btn" title="3 System Notifications">
          <Bell size={16} />
          <span className="notification-badge">3</span>
        </div>

        <div className="user-profile">
          <div className="avatar-circle">AD</div>
          <span className="user-name">Admin</span>
          <ChevronDown size={14} className="text-muted" />
        </div>
      </div>
    </header>
  );
}
