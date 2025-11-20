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
 * 
 * IMPORTANT: NZXT CAM uses two separate browsers:
 * - Config Browser: URL without query parameters (aggressive anti-cache)
 * - Kraken Browser: URL + ?kraken=1 (conservative anti-cache)
 * 
 * CAM does not track navigations, so redirects/reloads are not tracked by CAM.
 * Version sync should be handled primarily by Config Browser.
 */

declare const __APP_VERSION__: string;

const VERSION_STORAGE_KEY = 'nzxt_esc_app_version';
const SESSION_START_KEY = 'nzxt_esc_session_start';
const ANTI_CACHE_INITIALIZED_KEY = 'nzxt_esc_anti_cache_initialized';
const MAX_SESSION_AGE_MS = 60 * 60 * 1000; // 1 hour (Config Browser)
const MAX_SESSION_AGE_KRAKEN_MS = 12 * 60 * 60 * 1000; // 12 hours (Kraken Browser)
const SELF_HEAL_TIMEOUT_MS = 1500; // 1.5 seconds

/**
 * Check if running in Kraken Browser (LCD display context).
 * Kraken Browser has ?kraken=1 query parameter.
 */
function isKrakenBrowser(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('kraken') === '1';
}

/**
 * Check if running in Config Browser (settings page context).
 * Config Browser has no kraken query parameter.
 */
function isConfigBrowser(): boolean {
  return !isKrakenBrowser();
}

/**
 * Check if running in local development environment.
 * 
 * Returns true if any of the following conditions are met:
 * - Vite dev mode (import.meta.env.DEV === true)
 * - HTTP protocol (not HTTPS)
 * - Hostname is localhost, 127.0.0.1, or private IP range (192.168.*.*, 10.*.*.*)
 * 
 * This is used to disable redirects in local dev to prevent NZXT CAM LCD
 * from entering strict security mode with HTTP.
 */
function isLocalDev(): boolean {
  // Check Vite dev mode
  try {
    // @ts-ignore - import.meta.env is a Vite-specific feature
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV === true) {
      return true;
    }
  } catch {
    // import.meta not available (e.g., in some build contexts)
  }
  
  // Check HTTP protocol
  if (window.location.protocol === 'http:') {
    return true;
  }
  
  // Check hostname
  const hostname = window.location.hostname.toLowerCase();
  
  // localhost or 127.0.0.1
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  
  // Private IP ranges: 192.168.*.*
  if (/^192\.168\.\d+\.\d+$/.test(hostname)) {
    return true;
  }
  
  // Private IP ranges: 10.*.*.*
  if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) {
    return true;
  }
  
  return false;
}

/**
 * Check if redirects should be disabled.
 * 
 * Redirects are disabled if:
 * - URL has ?http=1 parameter (manual override to force HTTP/local dev mode)
 * - Local dev mode is active (auto-detection when no parameter)
 * 
 * Redirects are enabled if:
 * - URL has ?http=0 parameter (manual override to force production mode)
 * - HTTPS environment (production, auto-detection when no parameter)
 * 
 * @returns True if redirects should be disabled
 */
function shouldDisableRedirect(): boolean {
  const params = new URLSearchParams(window.location.search);
  const httpParam = params.get('http');
  
  // Manual override: ?http=1 forces HTTP/local dev mode (redirects disabled)
  if (httpParam === '1') {
    return true;
  }
  
  // Manual override: ?http=0 forces production mode (redirects enabled)
  if (httpParam === '0') {
    return false;
  }
  
  // Auto-disable in local dev mode (when no parameter)
  if (isLocalDev()) {
    return true;
  }
  
  // Enable redirects in HTTPS/production (when no parameter)
  return false;
}

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
 * 
 * Respects local dev safe mode - redirects are disabled in local dev
 * unless explicitly enabled via ?http=1 parameter.
 */
function reloadWithVersion(version: string): void {
  if (shouldDisableRedirect()) {
    // Redirect disabled (local dev safe mode)
    // Update localStorage silently to keep version in sync
    localStorage.setItem(VERSION_STORAGE_KEY, version);
    return;
  }
  
  const url = new URL(window.location.href);
  url.searchParams.set('v', version);
  window.location.href = url.toString();
}

/**
 * Hard reload the page (bypasses cache).
 * 
 * Respects local dev safe mode - redirects are disabled in local dev
 * unless explicitly enabled via ?http=1 parameter.
 */
function hardReload(): void {
  if (shouldDisableRedirect()) {
    // Redirect disabled (local dev safe mode)
    // Non-destructive operations can continue (session updates, etc.)
    return;
  }
  
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
 * Uses different thresholds for Config vs Kraken Browser.
 */
function checkSessionFreshness(): boolean {
  const sessionStartStr = sessionStorage.getItem(SESSION_START_KEY);
  const maxAge = isKrakenBrowser() ? MAX_SESSION_AGE_KRAKEN_MS : MAX_SESSION_AGE_MS;
  
  if (!sessionStartStr) {
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    return false;
  }
  
  const sessionStart = parseInt(sessionStartStr, 10);
  const sessionAge = Date.now() - sessionStart;
  
  if (sessionAge > maxAge) {
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
 * In Kraken Browser, only triggers on critical failures (version undefined/0.0.0).
 * In Config Browser, triggers on any version issue.
 */
function setupSelfHealingCheck(): void {
  setTimeout(() => {
    try {
      const version = getAppVersion();
      const isKraken = isKrakenBrowser();
      
      // Kraken: Only reload on critical failure (version undefined/0.0.0)
      if (isKraken) {
        if (version === '0.0.0' || !version) {
          hardReload();
        }
      } else {
        // Config: Reload on any version issue
        if (version === '0.0.0' || !version) {
          hardReload();
        }
      }
    } catch {
      // Only reload in Config Browser on exception
      if (!isKrakenBrowser()) {
        hardReload();
      }
    }
  }, SELF_HEAL_TIMEOUT_MS);
}

/**
 * Initialize anti-cache system.
 * 
 * This function should be called once at application startup.
 * It performs all cache-killing checks and reloads if necessary.
 * 
 * Strategy:
 * - Config Browser: Aggressive anti-cache (all mechanisms active)
 * - Kraken Browser: Conservative anti-cache (minimal reloads, version sync via Config)
 */
export function initAntiCache(): void {
  const currentVersion = getAppVersion();
  const urlVersion = getUrlVersion();
  
  // Prevent infinite reload loops: Check if already initialized in this session
  const initializedUrl = sessionStorage.getItem(ANTI_CACHE_INITIALIZED_KEY);
  const currentUrl = window.location.href.split('?')[0]; // URL without query params
  
  if (initializedUrl === currentUrl && urlVersion === currentVersion) {
    // Already initialized for this URL with correct version - skip to avoid loops
    return;
  }
  
  // Mark as initialized for this URL
  sessionStorage.setItem(ANTI_CACHE_INITIALIZED_KEY, currentUrl);
  
  // ==========================================
  // CONFIG BROWSER: Aggressive Anti-Cache
  // ==========================================
  if (isConfigBrowser()) {
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
    
    // 3. Session Freshness Guard: Reload if session is too old (1 hour)
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
    return;
  }
  
  // ==========================================
  // KRAKEN BROWSER: Conservative Anti-Cache
  // ==========================================
  
  // 1. URL Version Injection: Only if v parameter is completely missing
  if (!urlVersion) {
    // First time load without version - do one-time reload with version
    // This ensures version is in URL, but won't loop because of initializedUrl check
    reloadWithVersion(currentVersion);
    return;
  }
  
  // If v exists but is different: DO NOT reload in Kraken Browser
  // Version sync will happen naturally when Config Browser updates
  // Just update localStorage silently
  if (urlVersion !== currentVersion) {
    localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
    // Continue without reload
  } else {
    // Version matches - update localStorage to keep in sync
    localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
  }
  
  // 2. Version Mismatch Detection: Only update localStorage, no reload
  // (Already handled above)
  
  // 3. Session Freshness Guard: Only for very old sessions (12 hours)
  // In Kraken, this is much more lenient
  if (checkSessionFreshness()) {
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    // Only reload if session is extremely old (12+ hours)
    hardReload();
    return;
  }
  
  // 4. Integrity Fetch Test: SKIPPED in Kraken Browser
  // Prevents false positives that could cause unnecessary reloads
  
  // 5. Self-Healing Fallback: Only for critical failures
  setupSelfHealingCheck();
}


