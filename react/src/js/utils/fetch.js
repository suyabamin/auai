/**
 * Utility for making API calls to the Google Apps Script backend.
 * The backend is expected to expose a single POST endpoint (the Web App URL)
 * that receives a JSON payload with an `action` field identifying the desired
 * operation. Additional parameters are spread into the payload.
 */

// TODO: Replace with the actual deployed Web App URL.
const BASE_URL = "https://script.google.com/macros/s/AKfycbwjZDL5ohGP7gCQ20m2ebb5uWE38_B2DObOuIqfclUO7-4WTHM7DiXjRvdU45V8mIV0pA/exec";

/**
 * Sends a request to the Apps Script backend.
 * @param {string} action - The action name that the backend will route.
 * @param {Object} [payload={}] - Additional data to send.
 * @returns {Promise<any>} - Parsed JSON response from the server.
 */
export async function apiFetch(action, payload = {}) {
  const body = JSON.stringify({ action, ...payload });
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Convenience wrapper for GET‑style requests (still POST to Apps Script).
 * @param {string} action
 * @param {Object} [params]
 */
export async function apiGet(action, params = {}) {
  return apiFetch(action, params);
}
