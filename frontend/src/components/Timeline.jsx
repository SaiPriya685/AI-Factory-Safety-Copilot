import React from 'react';
import { useSafety } from '../context/SafetyContext';

const Timeline = () => {
  const { alerts } = useSafety();

  return (
    <div className="timeline-panel">
      <div className="timeline-header">
        <h3 className="timeline-title">
          <span className="live-beacon"></span>
          REAL-TIME INCIDENT STREAM
        </h3>
        <span className="timeline-count mono">{alerts.length} ITEMS</span>
      </div>

      <div className="timeline-scroll">
        {alerts.length === 0 ? (
          <div className="timeline-empty">
            <span>NO ACTIVE SAFETY INCIDENTS RECORDED</span>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`timeline-item ${alert.level}`}>
              <span className="timeline-time">{alert.time.split(' ')[0]}</span>
              
              <span className="timeline-type-badge">
                {alert.level === 'safe' ? 'OK' : alert.level === 'warning' ? 'WARN' : 'HALT'}
              </span>
              
              {alert.zone && alert.zone !== 'ALL' && (
                <span className="timeline-sector-badge mono">SEC_{alert.zone}</span>
              )}
              
              <span className="timeline-message-text" title={alert.message}>
                {alert.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Timeline;
