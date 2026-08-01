import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';

const SafetyContext = createContext();

const initialZones = {
  A: { id: 'A', name: 'Assembly Line 1', status: 'safe', workers: 14, machines: 5, alertCount: 0 },
  B: { id: 'B', name: 'Loading Dock', status: 'safe', workers: 8, machines: 2, alertCount: 0 },
  C: { id: 'C', name: 'Warehouse B', status: 'safe', workers: 5, machines: 3, alertCount: 0 },
  D: { id: 'D', name: 'Power Plant Annex', status: 'safe', workers: 3, machines: 2, alertCount: 0 }
};

export const SafetyProvider = ({ children }) => {
  const [zones, setZones] = useState(initialZones);
  const [alerts, setAlerts] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  // Connection & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Sync clock & uptime
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const zonesData = await api.fetchZones();
      const alertsData = await api.fetchIncidentLogs();
      setZones(zonesData);
      setAlerts(alertsData);
    } catch (e) {
      console.error("Initial data load failed:", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Polling data if USE_MOCK_DATA is false (real-time sync)
  useEffect(() => {
    if (api.USE_MOCK_DATA) return;

    const interval = setInterval(async () => {
      try {
        const zonesData = await api.fetchZones();
        const alertsData = await api.fetchIncidentLogs();
        setZones(zonesData);
        setAlerts(alertsData);
      } catch (e) {
        console.warn("Real-time polling sync lost connection:", e);
        setIsError(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const triggerAudioWarning = (isCritical) => {
    if (isAudioMuted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = isCritical ? 'sawtooth' : 'sine';
      oscillator.frequency.setValueAtTime(isCritical ? 880 : 440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, isCritical ? 500 : 200);
    } catch (e) {
      console.warn('Audio blocked', e);
    }
  };

  // Helper to append alerts locally (for mock) or route to Junaid/Priya's endpoints
  const handleAlertTrigger = async (type, message, zoneId, level) => {
    if (api.USE_MOCK_DATA) {
      const newAlert = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type,
        message,
        zone: zoneId,
        level
      };

      setAlerts(prev => [newAlert, ...prev]);

      if (zoneId && zones[zoneId]) {
        setZones(prev => {
          const zone = prev[zoneId];
          let newStatus = zone.status;
          if (level === 'critical') newStatus = 'critical';
          else if (level === 'warning' && zone.status !== 'critical') newStatus = 'warning';

          return {
            ...prev,
            [zoneId]: { ...zone, status: newStatus, alertCount: zone.alertCount + 1 }
          };
        });
      }
      triggerAudioWarning(level === 'critical');
    } else {
      try {
        await fetch(`${api.BACKEND_HTTP_URL}/api/simulator/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: type, zone: zoneId, level, message })
        });
      } catch (e) {
        console.error("API simulation trigger failed:", e);
      }
    }
  };

  const triggerHelmetViolation = (zoneId = 'A') => {
    handleAlertTrigger('PPE Violation', 'Worker detected without helmet near assembly line', zoneId, 'warning');
  };

  const triggerRestrictedArea = (zoneId = 'B') => {
    handleAlertTrigger('Restricted Area Entry', 'Unscheduled worker entered crane zone', zoneId, 'critical');
  };

  const triggerFallDetection = (zoneId = 'C') => {
    handleAlertTrigger('Fall Detected', 'Worker posture change indicates potential slip/fall', zoneId, 'critical');
  };

  const triggerFireAlert = (zoneId = 'D') => {
    handleAlertTrigger('Fire Detector Triggered', 'Thermal camera detected heat sign above 180°C', zoneId, 'critical');
  };

  const triggerMachineFailure = (zoneId = 'A', machineName = 'SYS-HP-DRILL-04') => {
    handleAlertTrigger('Telemetry Alert', `Machine ${machineName} vibration index exceeded limits`, zoneId, 'warning');
  };

  const resetAllZones = async () => {
    if (api.USE_MOCK_DATA) {
      setZones({
        A: { id: 'A', name: 'Assembly Line 1', status: 'safe', workers: 14, machines: 5, alertCount: 0 },
        B: { id: 'B', name: 'Loading Dock', status: 'safe', workers: 8, machines: 2, alertCount: 0 },
        C: { id: 'C', name: 'Warehouse B', status: 'safe', workers: 5, machines: 3, alertCount: 0 },
        D: { id: 'D', name: 'Power Plant Annex', status: 'safe', workers: 3, machines: 2, alertCount: 0 }
      });
      setAlerts([
        { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'Reset', message: 'All zone alerts resolved', zone: 'ALL', level: 'safe' }
      ]);
    } else {
      try {
        await fetch(`${api.BACKEND_HTTP_URL}/api/simulator/reset`, { method: 'POST' });
        loadData();
      } catch (e) {
        console.error("API reset failed:", e);
      }
    }
  };

  // derived stats
  const totalWorkers = Object.values(zones).reduce((acc, curr) => acc + curr.workers, 0);
  const activeMachines = Object.values(zones).reduce((acc, curr) => acc + curr.machines, 0);
  const activeAlertsCount = alerts.filter(a => a.level !== 'safe').length;

  const statuses = Object.values(zones).map(z => z.status);
  let globalStatus = 'safe';
  if (statuses.includes('critical')) globalStatus = 'critical';
  else if (statuses.includes('warning')) globalStatus = 'warning';

  return (
    <SafetyContext.Provider value={{
      zones,
      alerts,
      isAudioMuted,
      setIsAudioMuted,
      currentTime,
      uptime: formatUptime(uptimeSeconds),
      totalWorkers,
      activeMachines,
      activeAlertsCount,
      globalStatus,
      isLoading,
      isError,
      retryConnection: loadData,
      triggerHelmetViolation,
      triggerRestrictedArea,
      triggerFallDetection,
      triggerFireAlert,
      triggerMachineFailure,
      resetAllZones
    }}>
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) throw new Error('useSafety must be context bound');
  return context;
};
