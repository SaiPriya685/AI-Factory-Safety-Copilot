/**
 * API Service Layer - AI Industrial Safety Copilot
 * 
 * Junaid and Priya: Configure these parameters to link the frontend to your services.
 */

// Toggle this to false to stop simulation and connect to the real backend server!
export const USE_MOCK_DATA = true;

export const BACKEND_HTTP_URL = 'http://localhost:8000';
export const BACKEND_WS_URL = 'ws://localhost:8000';

/**
 * Helper to fetch data or fallback to mock if USE_MOCK_DATA is true
 */
const apiRequest = async (endpoint, options = {}, mockFallback) => {
  if (USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
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
 */
export const fetchZones = async () => {
  return apiRequest('/api/zones', {}, () => ({
    A: { id: 'A', name: 'Assembly Line 1', status: 'safe', workers: 14, machines: 5, alertCount: 0 },
    B: { id: 'B', name: 'Loading Dock', status: 'safe', workers: 8, machines: 2, alertCount: 0 },
    C: { id: 'C', name: 'Warehouse B', status: 'safe', workers: 5, machines: 3, alertCount: 0 },
    D: { id: 'D', name: 'Power Plant Annex', status: 'safe', workers: 3, machines: 2, alertCount: 0 }
  }));
};

/**
 * 2. Fetch Active Incident Logs
 */
export const fetchIncidentLogs = async () => {
  return apiRequest('/api/incidents', {}, () => [
    { id: 1, time: '09:05:12', type: 'System', message: 'Safety monitoring engine online', zone: 'ALL', level: 'safe' },
    { id: 2, time: '09:12:45', type: 'Calibration', message: 'YOLO camera feed self-check passed', zone: 'ALL', level: 'safe' }
  ]);
};

/**
 * 3. AI Copilot Chat Interface
 */
export const sendCopilotQuery = async (promptUser) => {
  return apiRequest('/api/copilot/query', {
    method: 'POST',
    body: JSON.stringify({ query: promptUser })
  }, () => {
    const lowercasePrompt = promptUser.toLowerCase();
    
    // Priya: Adjust this parsing router or keep it isolated in the backend.
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
 */
export const fetchTelemetry = async () => {
  return apiRequest('/api/telemetry', {}, () => ({
    vibration: 1.6 + (Math.random() * 0.4),
    temperature: 40.5 + (Math.random() * 1.0),
    pressure: 118.0 + (Math.random() * 4 - 2)
  }));
};
