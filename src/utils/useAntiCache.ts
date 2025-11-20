/**
 * Anti-Cache System for NZXT CAM WebView
 * 
 * Comprehensive cache-killer and version-sync system designed specifically
 * for NZXT CAM's CEF-based Chromium WebView environment.
 * 
 * Features:
 * - URL Version Injection (automatic ?v=APP_VERSION management)
 * - Version mismatch detection (localStorage comparison)
 * - Hard reload fallback
 * - Self-healing cache test (1.5s timeout)
 * - Integrity fetch test (manifest/index integrity check)
 * - Session freshness guard (1 hour max session age)
 * 
 * This system addresses NZXT CAM's disk-based persistent cache behavior
 * where URL parameter changes provide definitive cache-busting effects.
 */

declare const __APP_VERSION__: string;

const VERSION_STORAGE_KEY = 'nzxt_esc_app_version';
const SESSION_START_KEY = 'nzxt_esc_session_start';
const MAX_SESSION_AGE_MS = 60 * 60 * 1000; // 1 hour
const SELF_HEAL_TIMEOUT_MS = 1500; // 1.5 seconds

/**
 * Get current app version from build-time injection.
 * Falls back to '0.0.0' if not available.
 */
function getAppVersion(): string {
  try {
    return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Get version parameter from current URL.
 */
function getUrlVersion(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('v');
}

/**
 * Reload page with version parameter to bust cache.
 */
function reloadWithVersion(version: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('v', version);
  window.location.href = url.toString();
}

/**
 * Hard reload the page (bypasses cache).
 */
function hardReload(): void {
  window.location.reload();
}

/**
 * Check if version mismatch exists between stored and current version.
 */
function checkVersionMismatch(): boolean {
  const currentVersion = getAppVersion();
  const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
  
  if (storedVersion && storedVersion !== currentVersion) {
    return true;
  }
  
  localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
  return false;
}

/**
 * Check if session is too old (exceeds max age).
 */
function checkSessionFreshness(): boolean {
  const sessionStartStr = sessionStorage.getItem(SESSION_START_KEY);
  
  if (!sessionStartStr) {
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    return false;
  }
  
  const sessionStart = parseInt(sessionStartStr, 10);
  const sessionAge = Date.now() - sessionStart;
  
  if (sessionAge > MAX_SESSION_AGE_MS) {
    return true;
  }
  
  return false;
}

/**
 * Perform integrity fetch test to verify cache freshness.
 * Fetches current page with no-cache to ensure we have latest version.
 */
async function performIntegrityTest(): Promise<boolean> {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('_integrity_check', Date.now().toString());
    url.hash = '';
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Self-healing fallback: Check if version is undefined after timeout.
 */
function setupSelfHealingCheck(): void {
  setTimeout(() => {
    try {
      const version = getAppVersion();
      if (version === '0.0.0' || !version) {
        hardReload();
      }
    } catch {
      hardReload();
    }
  }, SELF_HEAL_TIMEOUT_MS);
}

/**
 * Initialize anti-cache system.
 * 
 * This function should be called once at application startup.
 * It performs all cache-killing checks and reloads if necessary.
 */
export function initAntiCache(): void {
  const currentVersion = getAppVersion();
  const urlVersion = getUrlVersion();
  
  // 1. URL Version Injection: Ensure URL has version parameter
  if (!urlVersion || urlVersion !== currentVersion) {
    reloadWithVersion(currentVersion);
    return;
  }
  
  // 2. Version Mismatch Detection: Check localStorage for version change
  if (checkVersionMismatch()) {
    reloadWithVersion(currentVersion);
    return;
  }
  
  // 3. Session Freshness Guard: Reload if session is too old
  if (checkSessionFreshness()) {
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    hardReload();
    return;
  }
  
  // 4. Integrity Fetch Test: Verify cache freshness asynchronously
  performIntegrityTest().then((isValid) => {
    if (!isValid) {
      hardReload();
    }
  }).catch(() => {
    // Silently fail - integrity test is best-effort
  });
  
  // 5. Self-Healing Fallback: Check version after timeout
  setupSelfHealingCheck();
}


