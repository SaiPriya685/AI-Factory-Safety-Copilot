import React from 'react';
import { useSafety } from '../context/SafetyContext';

const Sidebar = ({ activePage, setActivePage }) => {
  const {
    triggerHelmetViolation,
    triggerRestrictedArea,
    triggerFallDetection,
    triggerFireAlert,
    triggerMachineFailure,
    resetAllZones,
    activeAlertsCount
  } = useSafety();

  const menuItems = [
    { 
      id: 'overview', 
      name: 'Dashboard Overview', 
      icon: (
        <svg className="nav-item-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      ) 
    },
    { 
      id: 'cameras', 
      name: 'Live Monitors', 
      icon: (
        <svg className="nav-item-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      ) 
    },
    { 
      id: 'telemetry', 
      name: 'Machine Telemetry', 
      icon: (
        <svg className="nav-item-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ) 
    },
    { 
      id: 'copilot', 
      name: 'AI Safety Copilot', 
      icon: (
        <svg className="nav-item-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ) 
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo-container">
          <svg className="logo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <h1 className="logo-text">
            Safety <span className="logo-sub">Copilot</span>
          </h1>
          <span className="logo-version">v1.2.0</span>
        </div>

        <nav>
          <ul className="nav-menu">
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => setActivePage(item.id)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {item.id === 'overview' && activeAlertsCount > 0 && (
                    <span 
                      className="mono" 
                      style={{ 
                        marginLeft: 'auto', 
                        fontSize: '9px', 
                        background: 'var(--color-critical)', 
                        color: 'white', 
                        padding: '1px 5px', 
                        borderRadius: '10px',
                        fontWeight: 'bold' 
                      }}
                    >
                      {activeAlertsCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="simulator-panel">
        <span className="simulator-title">Demo Controls</span>
        <div className="simulator-grid">
          <button 
            className="simulator-btn"
            onClick={() => triggerHelmetViolation('A')}
          >
            <span>Trigger Helmet Off</span>
            <span className="simulator-btn-icon">▶</span>
          </button>
          <button 
            className="simulator-btn critical"
            onClick={() => triggerRestrictedArea('B')}
          >
            <span>Trigger Zone Trespass</span>
            <span className="simulator-btn-icon">▶</span>
          </button>
          <button 
            className="simulator-btn critical"
            onClick={() => triggerFallDetection('C')}
          >
            <span>Trigger Slip / Fall</span>
            <span className="simulator-btn-icon">▶</span>
          </button>
          <button 
            className="simulator-btn critical"
            onClick={() => triggerFireAlert('D')}
          >
            <span>Trigger Fire Threat</span>
            <span className="simulator-btn-icon">▶</span>
          </button>
          <button 
            className="simulator-btn"
            onClick={() => triggerMachineFailure('A', 'SYS-HP-DRILL-04')}
          >
            <span>Trigger Unit Temperature</span>
            <span className="simulator-btn-icon">▶</span>
          </button>
        </div>
        <button 
          className="simulator-reset-btn"
          onClick={resetAllZones}
        >
          Reset Simulation
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
