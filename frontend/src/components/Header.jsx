import React from 'react';
import { useSafety } from '../context/SafetyContext';

const Header = () => {
  const { globalStatus, currentTime, uptime, isAudioMuted, setIsAudioMuted } = useSafety();

  const getStatusText = () => {
    switch (globalStatus) {
      case 'critical':
        return 'System status: Critical Hazard';
      case 'warning':
        return 'System status: Compliance Warning';
      default:
        return 'All systems nominal';
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className={`system-status-indicator status-${globalStatus}`}>
          <span className="status-dot-circle"></span>
          <span>{getStatusText()}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="clock-panel">
          {/* Edge Diagnostics Indicator */}
          <div className="clock-item">
            <span className="clock-label">Edge Pipeline</span>
            <span className="clock-value mono" style={{ color: 'var(--color-safe)' }}>12.4ms // LOSS: 0.00%</span>
          </div>
          {/* System Uptime Counter */}
          <div className="clock-item">
            <span className="clock-label">Uptime</span>
            <span className="clock-value mono">{uptime}</span>
          </div>
          <div className="clock-item">
            <span className="clock-label">Server Time</span>
            <span className="clock-value mono">{currentTime}</span>
          </div>
        </div>

        <button 
          className={`audio-mute-btn ${!isAudioMuted ? 'active' : ''}`}
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          title={isAudioMuted ? "UNMUTE AUDIO ALARMS" : "MUTE AUDIO ALARMS"}
        >
          {isAudioMuted ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
