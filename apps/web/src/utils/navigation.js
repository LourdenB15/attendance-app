// apps/web/src/utils/navigation.js

/**
 * Read URL Search Parameters safely in browser or SSR.
 */
export function getUrlParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/**
 * Updates URL search parameters without triggering a full page reload,
 * and maintains history so browser Back / Forward buttons work properly.
 * @param {Record<string, string | number | boolean | null | undefined>} params
 * @param {boolean} replace If true, replace current history state instead of pushing.
 */
export function updateUrlParams(params, replace = false) {
  if (typeof window === "undefined") return;
  const current = new URLSearchParams(window.location.search);

  Object.entries(params).forEach(([key, val]) => {
    if (val === null || val === undefined || val === "") {
      current.delete(key);
    } else {
      current.set(key, String(val));
    }
  });

  const query = current.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;

  const stateObj = { ...window.history.state, ...params };
  try {
    if (replace) {
      window.history.replaceState(stateObj, "", newUrl);
    } else {
      window.history.pushState(stateObj, "", newUrl);
    }
  } catch {
    // Ignore history error
  }
}

/**
 * Saves view state to sessionStorage as a fallback when query params are stripped.
 */
export function saveSessionState(key, data) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`attend_nav_${key}`, JSON.stringify(data));
  } catch {
    // Ignore quota or disabled storage
  }
}

/**
 * Retrieves saved view state from sessionStorage.
 */
export function getSessionState(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`attend_nav_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clears saved view state from sessionStorage.
 */
export function clearSessionState(key) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`attend_nav_${key}`);
  } catch {
    // Ignore
  }
}
