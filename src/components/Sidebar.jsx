import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  AlertCircle, 
  Truck, 
  Building2, 
  UserCheck, 
  Construction, 
  BarChart3, 
  FileText, 
  Settings,
  Wifi,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab,
  activeEmergenciesCount = 2,
  ambulancesAvailableStr = "5 / 8"
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'emergencies', label: 'Emergencies', icon: AlertCircle },
    { id: 'ambulances', label: 'Ambulances', icon: Truck },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'doctors', label: 'Doctors', icon: UserCheck },
    { id: 'road_status', label: 'Road Status', icon: Construction },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar-container">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Bottom System Summary Widget */}
      <div className="sidebar-bottom-widget">
        <div className="widget-row">
          <div className="widget-label-group">
            <span className="widget-title">Active Emergencies</span>
            <span className="widget-value danger-text">{activeEmergenciesCount}</span>
          </div>
          <div className="widget-icon-bg danger-bg">
            <ShieldAlert size={16} />
          </div>
        </div>

        <div className="widget-row">
          <div className="widget-label-group">
            <span className="widget-title">Ambulances Available</span>
            <span className="widget-value success-text">{ambulancesAvailableStr}</span>
          </div>
          <div className="widget-icon-bg success-bg">
            <Truck size={16} />
          </div>
        </div>

        <div className="widget-row">
          <div className="widget-label-group">
            <span className="widget-title">System Status</span>
            <span className="widget-value online-text">Online</span>
          </div>
          <div className="widget-icon-bg online-bg">
            <Wifi size={16} />
          </div>
        </div>
      </div>
    </aside>
  );
}
