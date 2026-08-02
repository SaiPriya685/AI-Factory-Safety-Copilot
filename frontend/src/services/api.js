/**
 * API Service Layer - AI Factory Safety Copilot
 */

// Environment Variables
export const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK_DATA === "true";

export const BACKEND_HTTP_URL =
  import.meta.env.VITE_BACKEND_HTTP_URL ||
  "https://ai-factory-safety-copilot.onrender.com";

export const BACKEND_WS_URL =
  import.meta.env.VITE_BACKEND_WS_URL ||
  "wss://ai-factory-safety-copilot.onrender.com";

// Debug (remove later if you want)
console.log("USE_MOCK_DATA:", USE_MOCK_DATA);
console.log("BACKEND_HTTP_URL:", BACKEND_HTTP_URL);

/**
 * Generic API Request
 */
const apiRequest = async (endpoint, options = {}, mockFallback) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockFallback();
  }

  try {
    const response = await fetch(`${BACKEND_HTTP_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};
