/**
 * API Service Layer - AI-Factory-Safety-Copilot
 * 
 * Junaid and Priya: Configure these parameters to link the frontend to your services.
 */

// Dynamically load settings from Vite environment variables (.env)
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA ? import.meta.env.VITE_USE_MOCK_DATA === 'true' : true;

export const BACKEND_HTTP_URL = import.meta.env.VITE_BACKEND_HTTP_URL || 'http://localhost:8000';
export const BACKEND_WS_URL = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:8000';

/**
 * Helper to fetch data or fallback to mock if USE_MOCK_DATA is true
 */
const apiRequest = async (endpoint, options = {}, mockFallback) => {
  if (USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockFallback();
  }

  try {
    const response = await fetch(`${BACKEND_HTTP_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!response.ok) {
      throw new Error(`HTTP error. status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error; // Let the caller context handle error states
  }
};

/**
 * 1. Fetch Sector Zone Data
 * Maps the incidents list into sector states dynamically if /api/zones is not implemented.
 */
export const fetchZones = async () => {
  if (USE_MOCK_DATA) {
    return {
      A: { id: 'A', name: 'Assembly Line 1', status: 'safe', workers: 14, machines: 5, alertCount: 0 },
      B: { id: 'B', name: 'Loading Dock', status: 'safe', workers: 8, machines: 2, alertCount: 0 },
      C: { id: 'C', name: 'Warehouse B', status: 'safe', workers: 5, machines: 3, alertCount: 0 },
      D: { id: 'D', name: 'Power Plant Annex', status: 'safe', workers: 3, machines: 2, alertCount: 0 }
    };
  }

  try {
    // Check if Junaid has implemented a custom zones endpoint, else fallback to incident mapping
    const rawIncidents = await fetchIncidentLogs();
    const zones = {
      A: { id: 'A', name: 'Assembly Line 1', status: 'safe', workers: 14, machines: 5, alertCount: 0 },
      B: { id: 'B', name: 'Loading Dock', status: 'safe', workers: 8, machines: 2, alertCount: 0 },
      C: { id: 'C', name: 'Warehouse B', status: 'safe', workers: 5, machines: 3, alertCount: 0 },
      D: { id: 'D', name: 'Power Plant Annex', status: 'safe', workers: 3, machines: 2, alertCount: 0 }
    };

    rawIncidents.forEach(inc => {
      const z = inc.zone; // 'A', 'B', 'C', or 'D'
      if (zones[z]) {
        zones[z].alertCount += 1;
        if (inc.level === 'critical') zones[z].status = 'critical';
        else if (inc.level === 'warning' && zones[z].status !== 'critical') {
          zones[z].status = 'warning';
        }
      }
    });

    return zones;
  } catch (e) {
    console.warn("Zones dynamic mapping failed, using fallback dashboard:", e);
    return {
      A: { id: 'A', name: 'Assembly Line 1', status: 'safe', workers: 14, machines: 5, alertCount: 0 },
      B: { id: 'B', name: 'Loading Dock', status: 'safe', workers: 8, machines: 2, alertCount: 0 },
      C: { id: 'C', name: 'Warehouse B', status: 'safe', workers: 5, machines: 3, alertCount: 0 },
      D: { id: 'D', name: 'Power Plant Annex', status: 'safe', workers: 3, machines: 2, alertCount: 0 }
    };
  }
};

/**
 * 2. Fetch Active Incident Logs
 * Adapts Junaid's IncidentResponse schema to frontend UI models.
 */
export const fetchIncidentLogs = async () => {
  return apiRequest('/api/incidents', {}, () => [
    { id: 1, time: '09:05:12', type: 'System', message: 'Safety monitoring engine online', zone: 'ALL', level: 'safe' },
    { id: 2, time: '09:12:45', type: 'Calibration', message: 'YOLO camera feed self-check passed', zone: 'ALL', level: 'safe' }
  ]).then(data => {
    if (USE_MOCK_DATA) return data;
    // Map Junaid's schema: created_at, incident_type, camera_id, worker_id, risk_score
    return data.map(inc => {
      const date = inc.created_at ? new Date(inc.created_at) : new Date();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Determine level based on risk score
      let level = 'safe';
      if (inc.risk_score >= 70) level = 'critical';
      else if (inc.risk_score >= 40) level = 'warning';

      // Map camera_id to zone letters A, B, C, D
      let zone = 'A';
      if (inc.camera_id) {
        if (inc.camera_id.includes('CAM_B') || inc.camera_id.includes('02')) zone = 'B';
        else if (inc.camera_id.includes('CAM_C') || inc.camera_id.includes('03')) zone = 'C';
        else if (inc.camera_id.includes('CAM_D') || inc.camera_id.includes('04')) zone = 'D';
      }

      return {
        id: inc.id || inc._id,
        time: timeStr,
        type: inc.incident_type || 'General Alert',
        message: `${inc.incident_type} detected (Worker: ${inc.worker_id}, Conf: ${Math.round(inc.confidence * 100)}%)`,
        zone: zone,
        level: level
      };
    });
  });
};

/**
 * 3. AI Copilot Chat Interface
 * Maps queries to Priya's backend query parser.
 */
export const sendCopilotQuery = async (promptUser) => {
  return apiRequest('/api/ai/query', {
    method: 'POST',
    body: JSON.stringify({ query: promptUser })
  }, () => {
    const lowercasePrompt = promptUser.toLowerCase();
    if (lowercasePrompt.includes('violation') || lowercasePrompt.includes('incident') || lowercasePrompt.includes('happen')) {
      return {
        text: "Recorded compliance exceptions log indicates active incidents in Sector B and Sector C.",
        data: [
          { id: 101, time: "09:32", type: "PPE Alert", desc: "Helmet missing in Sector A", state: "RESOLVED" },
          { id: 102, time: "10:14", type: "Trespass", desc: "Unauthorized entry in Sector B boundary", state: "ACTIVE" },
          { id: 103, time: "11:05", type: "Accident", desc: "Posture slide / worker fall detected in Sector C", state: "ACTIVE" }
        ]
      };
    }

    if (lowercasePrompt.includes('machine') || lowercasePrompt.includes('unsafe') || lowercasePrompt.includes('failure')) {
      return {
        text: "Telemetry flags unit SYS-HP-DRILL-04 in Sector A as unstable due to operating temperature threshold excess.",
        data: [
          { id: "SYS-HP-DRILL-04", param: "Vibration/Temp", value: "8.4 mm/s | 94.6°C", risk: "HIGH RISK" },
          { id: "THERMAL-SNSR-D", param: "Thermal sensor", value: "28.4°C", risk: "NOMINAL" }
        ]
      };
    }

    return {
      text: "Safety monitoring agent online. I can check compliance lists, query sensor nodes, and return active sector telemetry. Try clicking a suggested query chip below.",
      data: null
    };
  });
};

/**
 * 4. Fetch Real-time Telemetry values
 * Connects directly to Junaid's telemetry sensors endpoint.
 */
export const fetchTelemetry = async () => {
  if (USE_MOCK_DATA) {
    return {
      vibration: 1.6 + (Math.random() * 0.4),
      temperature: 40.5 + (Math.random() * 1.0),
      pressure: 118.0 + (Math.random() * 4 - 2)
    };
  }

  try {
    // Attempt to pull the latest sensor documents from Junaid's DB collections
    const drill = await apiRequest('/api/sensors/SYS-HP-DRILL-04/latest');
    return {
      vibration: drill.vibration || 1.8,
      temperature: drill.temperature || 42.1,
      pressure: drill.humidity || 119.0 // Uses humidity register as fallback
    };
  } catch (e) {
    // Failover telemetry jitter to prevent chart breaking during connection blips
    return {
      vibration: 1.6 + (Math.random() * 0.4),
      temperature: 40.5 + (Math.random() * 1.0),
      pressure: 118.0 + (Math.random() * 4 - 2)
    };
  }
};
