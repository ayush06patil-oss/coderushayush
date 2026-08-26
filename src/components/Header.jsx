import React from 'react';
import { Activity, Bell, ChevronDown, Radio } from 'lucide-react';

export default function Header({ systemTime = "10:32 AM" }) {
  return (
    <header className="header-container">
      {/* Left Branding */}
      <div className="header-brand">
        <div className="logo-icon-bg">
          <Activity className="logo-icon" size={24} />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">Rural Healthcare</h1>
          <span className="brand-subtitle">Routing System</span>
        </div>
      </div>

      {/* System Status Indicator */}
      <div className="header-status">
        <span className="status-pill online">
          <span className="status-dot"></span>
          System Online
        </span>
      </div>

      {/* Right Controls / User Profile */}
      <div className="header-actions">
        <div className="simulation-time">
          <span>{systemTime}</span>
        </div>

        <div className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </div>

        <div className="user-profile">
          <div className="avatar-circle">AD</div>
          <span className="user-name">Admin</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}
