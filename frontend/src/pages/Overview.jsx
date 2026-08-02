import React, { useState, useEffect } from 'react';
import { useSafety } from '../context/SafetyContext';
import Timeline from '../components/Timeline';

const Overview = () => {
  const { 
    zones, 
    totalWorkers, 
    activeMachines, 
    activeAlertsCount, 
    globalStatus, 
    alerts, 
    isLoading, 
    isError, 
    retryConnection,
    setActivePage,
    setSelectedCameraId
  } = useSafety();

  const handleCameraClick = (camIndex) => {
    setSelectedCameraId(camIndex);
    setActivePage('cameras');
  };

  // Telemetry fluctuations state for extreme realism
  const [telemetryValues, setTelemetryValues] = useState({
    drillVib: 2.15,
    drillTemp: 42.4,
    craneLoad: 14.2,
    valvePress: 120.0,
    thermalTemp: 28.4
  });

  // Active status triggers
  const isHelmetAlertActive = alerts.some(a => a.type === 'PPE Violation' && a.level === 'warning');
  const isTrespassAlertActive = alerts.some(a => a.type === 'Restricted Area Entry' && a.level === 'critical');
  const isFallAlertActive = alerts.some(a => a.type === 'Fall Detected' && a.level === 'critical');
  const isFireAlertActive = alerts.some(a => a.type === 'Fire Detector Triggered' && a.level === 'critical');
  const isMachineFailureActive = alerts.some(a => a.message.includes('SYS-HP-DRILL-04'));

  // Fluctuations tick loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryValues(prev => {
        const jitter = (val, maxRange = 0.05) => val + (Math.random() * maxRange - maxRange/2);
        
        return {
          drillVib: isMachineFailureActive ? jitter(8.4, 0.4) : jitter(2.1, 0.08),
          drillTemp: isMachineFailureActive ? jitter(94.6, 0.8) : jitter(42.1, 0.3),
          craneLoad: jitter(14.2, 0.1),
          valvePress: jitter(120.0, 1.2),
          thermalTemp: isFireAlertActive ? jitter(184.2, 1.5) : jitter(28.4, 0.4)
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMachineFailureActive, isFireAlertActive]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '80%', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        gap: '12px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTopColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div className="mono" style={{ fontSize: '10px' }}>SYNCING CENTRAL DATABASE OPERATIONS...</div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '80%', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        gap: '16px',
        border: '1px solid var(--color-critical)',
        padding: '32px',
        backgroundColor: 'rgba(226, 76, 76, 0.01)',
        textAlign: 'center'
      }}>
        <div style={{ fontFamily: 'var(--font-title)', fontWeight: '600', color: 'var(--color-critical)', fontSize: '12px', letterSpacing: '0.5px' }}>
          [CRITICAL] AI-FACTORY-SAFETY-COPILOT LINK DOWN
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: '1.5' }}>
          Real-time telemetry stream broke or host server is unreachable. Check network credentials or restart Junaid's FastAPI backend server.
        </div>
        <button 
          onClick={retryConnection} 
          className="simulator-reset-btn" 
          style={{ margin: 0, padding: '6px 12px' }}
        >
          RETRY CONNECTION LINK
        </button>
      </div>
    );
  }

  // Dynamic calculations based on active exceptions
  const warningCount = alerts.filter(a => a.level === 'warning').length;
  const criticalCount = alerts.filter(a => a.level === 'critical').length;
  const compliancePercentage = Math.max(0, 100 - (warningCount * 3.8) - (criticalCount * 14.5));
  const complianceString = compliancePercentage.toFixed(1);

  // SVG circular progress parameters
  const strokeDashoffset = 126 - (126 * compliancePercentage) / 100;

  // Get sector at risk
  const getSectorAtRisk = () => {
    if (isTrespassAlertActive) return 'Sector B';
    if (isFallAlertActive) return 'Sector C';
    if (isFireAlertActive) return 'Sector D';
    if (isHelmetAlertActive) return 'Sector A';
    return 'None (Operational)';
  };

  return (
    <div className="overview-grid">
      
      {/* LEFT COLUMN: Operations Maps & Active Telemetry */}
      <div className="left-panel">
        
        {/* Executive Summary deck - Answers the 5 key questions in 5 seconds */}
        <div className="panel" style={{
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
          gap: '16px',
          alignItems: 'center',
          backgroundColor: '#0c0e12',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>FACTORY HEALTH STATE</span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              marginTop: '4px',
              color: globalStatus === 'critical' ? 'var(--color-critical)' : globalStatus === 'warning' ? 'var(--color-warning)' : 'var(--color-safe)',
              fontWeight: '700',
              fontSize: '14px',
              fontFamily: 'var(--font-title)'
            }}>
              <span className={`status-dot ${globalStatus === 'critical' ? 'dot-critical blink-critical' : globalStatus === 'warning' ? 'dot-warning blink-warning' : 'dot-safe'}`}></span>
              <span>{globalStatus === 'critical' ? 'HAZARD EXCEPTIONS' : globalStatus === 'warning' ? 'COMPLIANCE WARNING' : 'SAFE / ONLINE'}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>ACTIVE INCIDENTS</span>
            <div className="mono" style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>
              {activeAlertsCount} active
            </div>
          </div>

          <div>
            <span style={{ fontSize: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>SECTOR AT RISK</span>
            <div className="mono" style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              marginTop: '4px',
              color: globalStatus !== 'safe' ? 'var(--color-warning)' : 'var(--text-primary)'
            }}>
              {getSectorAtRisk()}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>UNHEALTHY UNITS</span>
            <div className="mono" style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              marginTop: '4px',
              color: isMachineFailureActive ? 'var(--color-warning)' : 'var(--text-primary)'
            }}>
              {isMachineFailureActive ? 'SYS-HP-DRILL-04' : 'None'}
            </div>
          </div>
        </div>

        {/* Larger KPI Panel */}
        <div className="kpi-bar">
          <div className="kpi-item">
            <span className="kpi-item-label">TOTAL PERSONNEL ON-SITE</span>
            <span className="kpi-item-val mono" style={{ fontSize: '26px' }}>{totalWorkers}</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-item-label">ACTIVE TELEMETRY NODES</span>
            <span className="kpi-item-val mono" style={{ fontSize: '26px' }}>{activeMachines}</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-item-label">SAFETY SCORE INDEX</span>
            <span className="kpi-item-val mono" style={{ fontSize: '26px', color: compliancePercentage === 100 ? 'var(--color-safe)' : compliancePercentage >= 90 ? 'var(--color-warning)' : 'var(--color-critical)' }}>
              {complianceString}%
            </span>
          </div>
          <div className="kpi-item">
            <span className="kpi-item-label">SYSTEM HEALTH</span>
            <span className="kpi-item-val mono" style={{ fontSize: '26px', color: globalStatus === 'critical' ? 'var(--color-critical)' : globalStatus === 'warning' ? 'var(--color-warning)' : 'var(--color-safe)' }}>
              {globalStatus === 'safe' ? 'OPTIMAL' : 'RISK'}
            </span>
          </div>
        </div>

        {/* Floor Map & Zone List Row */}
        <div className="sectors-row">
          
          {/* Floor Map */}
          <div className="floor-map-card">
            <div className="panel-header-scada">
              <span className="panel-title-scada">FACTORY FLOOR OVERVIEW MAP</span>
              <span className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>SEC_A-D</span>
            </div>
            
            <div className="map-grid-container">
              {Object.values(zones).map(zone => (
                <div key={zone.id} className={`map-sector-block status-${zone.status}`}>
                  <span className="map-sector-label mono">SEC_{zone.id}</span>
                  <span className="map-sector-pop mono">P: {zone.workers} | A: {zone.alertCount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Details */}
          <div className="zone-list-card">
            <div className="panel-header-scada">
              <span className="panel-title-scada">SECTOR COMPLIANCE STATES</span>
            </div>
            
            <div className="zone-grid">
              {Object.values(zones).map(zone => (
                <div key={zone.id} className={`zone-scada-item status-${zone.status}`}>
                  <div className="zone-scada-header">
                    <span className="zone-scada-name">Sector {zone.id}</span>
                    <span className="zone-scada-badge">
                      {zone.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="zone-scada-details">
                    <span className="mono">Workers: {zone.workers}</span>
                    <span className="mono">Alerts: {zone.alertCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Instrument Telemetry Table */}
        <div className="equipment-card">
          <div className="panel-header-scada">
            <span className="panel-title-scada">FIELD UNIT INSTRUMENT TELEMETRY</span>
            <span className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>UPDATE RATE: 800ms</span>
          </div>
          
          <div className="table-container">
            <table className="scada-table">
              <thead>
                <tr>
                  <th>UNIT ID</th>
                  <th>SECTOR</th>
                  <th>SENSOR TYPE</th>
                  <th>VALUE</th>
                  <th>UNIT STATE</th>
                  <th>CALIBRATION</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: isMachineFailureActive ? 'rgba(224, 166, 60, 0.02)' : 'transparent' }}>
                  <td className="mono">SYS-HP-DRILL-04</td>
                  <td>Sector A</td>
                  <td>VIBRATION / TEMP</td>
                  <td className="mono" style={{ color: isMachineFailureActive ? 'var(--color-warning)' : 'var(--text-primary)' }}>
                    {telemetryValues.drillVib.toFixed(2)} mm/s | {telemetryValues.drillTemp.toFixed(1)}°C
                  </td>
                  <td>
                    <span className="mono" style={{ color: isMachineFailureActive ? 'var(--color-warning)' : 'var(--color-safe)' }}>
                      {isMachineFailureActive ? 'TELEM_ERR' : 'NOMINAL'}
                    </span>
                  </td>
                  <td className="mono">08-01-2026</td>
                </tr>
                <tr>
                  <td className="mono">CRANE-LOAD-02</td>
                  <td>Sector B</td>
                  <td>WEIGHT / BALANCE</td>
                  <td className="mono">
                    {telemetryValues.craneLoad.toFixed(2)} Tons
                  </td>
                  <td><span className="mono" style={{ color: 'var(--color-safe)' }}>NOMINAL</span></td>
                  <td className="mono">07-28-2026</td>
                </tr>
                <tr style={{ backgroundColor: isFireAlertActive ? 'rgba(226, 76, 76, 0.02)' : 'transparent' }}>
                  <td className="mono">THERMAL-SNSR-D</td>
                  <td>Sector D</td>
                  <td>THERMAL SPECTRA</td>
                  <td className="mono" style={{ color: isFireAlertActive ? 'var(--color-critical)' : 'var(--text-primary)' }}>
                    {telemetryValues.thermalTemp.toFixed(1)}°C
                  </td>
                  <td>
                    <span className="mono" style={{ color: isFireAlertActive ? 'var(--color-critical)' : 'var(--color-safe)' }}>
                      {isFireAlertActive ? 'OVER_TEMP' : 'NOMINAL'}
                    </span>
                  </td>
                  <td className="mono">07-15-2026</td>
                </tr>
                <tr>
                  <td className="mono">SYS-VALVE-PL-01</td>
                  <td>Sector A</td>
                  <td>PRESSURE METER</td>
                  <td className="mono">
                    {telemetryValues.valvePress.toFixed(1)} PSI
                  </td>
                  <td><span className="mono" style={{ color: 'var(--color-safe)' }}>NOMINAL</span></td>
                  <td className="mono">07-20-2026</td>
                </tr>
                <tr style={{ backgroundColor: isTrespassAlertActive ? 'rgba(226, 76, 76, 0.02)' : 'transparent' }}>
                  <td className="mono">PROXIMITY-B-09</td>
                  <td>Sector B</td>
                  <td>RADAR BOUNDARY</td>
                  <td className="mono" style={{ color: isTrespassAlertActive ? 'var(--color-critical)' : 'var(--text-primary)' }}>
                    {isTrespassAlertActive ? 'INTRUSION_DET' : 'SECURE'}
                  </td>
                  <td>
                    <span className="mono" style={{ color: isTrespassAlertActive ? 'var(--color-critical)' : 'var(--color-safe)' }}>
                      {isTrespassAlertActive ? 'ALERT' : 'NOMINAL'}
                    </span>
                  </td>
                  <td className="mono">07-30-2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Safety Compliance Ring & Video status logs */}
      <div className="right-panel">
        
        {/* Compliance Meter */}
        <div className="compliance-card">
          <div className="compliance-details">
            <span className="compliance-label">SAFETY COMPLIANCE</span>
            <span className="compliance-value mono">{complianceString}%</span>
            <div className="compliance-status-row">
              <span className={`status-dot ${globalStatus === 'critical' ? 'dot-critical blink-critical' : globalStatus === 'warning' ? 'dot-warning blink-warning' : 'dot-safe'}`}></span>
              <span className="mono" style={{ fontSize: '9px' }}>
                {globalStatus === 'safe' ? 'INDEX_NOMINAL' : 'INDEX_COMPROMISED'}
              </span>
            </div>
          </div>
          
          <div className="compliance-ring-container">
            <svg className="compliance-ring-svg" width="50" height="50">
              <circle className="compliance-ring-bg" cx="25" cy="25" r="20" />
              <circle 
                className={`compliance-ring-fill ${globalStatus}`} 
                cx="25" 
                cy="25" 
                r="20" 
                strokeDasharray="126" 
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <span className="compliance-ring-text mono">{Math.round(compliancePercentage)}%</span>
          </div>
        </div>

        {/* Camera Nodes */}
        <div className="cameras-status-card">
          <div className="panel-header-scada">
            <span className="panel-title-scada">ACTIVE MONITORS STATUS</span>
          </div>
          <div className="camera-status-list">
            <div className="camera-status-row" style={{ cursor: 'pointer' }} onClick={() => handleCameraClick(0)}>
              <span className="camera-status-meta">
                <span className={`status-dot ${isHelmetAlertActive ? 'dot-warning blink-warning' : 'dot-safe'}`}></span>
                <span>CAM_SEC_A (HELMET)</span>
              </span>
              <span className={`camera-state-badge ${isHelmetAlertActive ? 'active-alert' : ''}`}>
                {isHelmetAlertActive ? 'WARN' : 'NOMINAL'}
              </span>
            </div>
            <div className="camera-status-row" style={{ cursor: 'pointer' }} onClick={() => handleCameraClick(1)}>
              <span className="camera-status-meta">
                <span className={`status-dot ${isTrespassAlertActive ? 'dot-critical blink-critical' : 'dot-safe'}`}></span>
                <span>CAM_SEC_B (BOUNDARY)</span>
              </span>
              <span className={`camera-state-badge ${isTrespassAlertActive ? 'active-alert' : ''}`}>
                {isTrespassAlertActive ? 'ALERT' : 'NOMINAL'}
              </span>
            </div>
            <div className="camera-status-row" style={{ cursor: 'pointer' }} onClick={() => handleCameraClick(2)}>
              <span className="camera-status-meta">
                <span className={`status-dot ${isFallAlertActive ? 'dot-critical blink-critical' : 'dot-safe'}`}></span>
                <span>CAM_SEC_C (ACCIDENT)</span>
              </span>
              <span className={`camera-state-badge ${isFallAlertActive ? 'active-alert' : ''}`}>
                {isFallAlertActive ? 'ALERT' : 'NOMINAL'}
              </span>
            </div>
            <div className="camera-status-row" style={{ cursor: 'pointer' }} onClick={() => handleCameraClick(3)}>
              <span className="camera-status-meta">
                <span className={`status-dot ${isFireAlertActive ? 'dot-critical blink-critical' : 'dot-safe'}`}></span>
                <span>CAM_SEC_D (THERMAL)</span>
              </span>
              <span className={`camera-state-badge ${isFireAlertActive ? 'active-alert' : ''}`}>
                {isFireAlertActive ? 'ALERT' : 'NOMINAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Incident Timeline */}
        <Timeline />

      </div>

    </div>
  );
};

export default Overview;
