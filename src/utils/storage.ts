/**
 * Shared Storage Layer for NZXT Web Integration
 * 
 * Provides robust storage mechanism for Config and Display pages.
 * Uses localStorage with cookie fallback for cross-process compatibility in NZXT CAM.
 * 
 * Storage priority: localStorage (primary) → cookie (fallback)
 */
const KEY = 'media_url';
const COOKIE = 'media_url';

/**
 * Persist media URL (image/video) to both localStorage and cookie.
 * This ensures maximum compatibility inside NZXT CAM.
 */
export function setMediaUrl(url: string) {
  const oldVal = lastVal
  
  try {
    localStorage.setItem(KEY, url)
  } catch (e) {
    console.warn('[NZXT] localStorage write failed:', e)
  }

  // CAM requires secure cookie attributes to allow cross-process sharing.
  document.cookie = `${COOKIE}=${encodeURIComponent(url)}; path=/; SameSite=None; Secure`
  
  // CRITICAL: Update lastVal immediately to trigger listeners in same tab
  // The storage event only fires for cross-tab changes, not same-tab changes
  if (url !== lastVal) {
    lastVal = url
    listeners.forEach((fn) => fn(url))
  }
  
  // Also dispatch a custom storage event for same-tab listeners
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: KEY,
      newValue: url,
      oldValue: oldVal,
    })
  )
}

/**
 * Retrieve the stored media URL.
 * Priority:
 *   1. localStorage
 *   2. cookie fallback (used when CAM isolates localStorage)
 */
export function getMediaUrl(): string {
  try {
    const v = localStorage.getItem(KEY)
    if (v) return v
  } catch (e) {
    console.warn('[NZXT] localStorage read failed:', e)
  }

  const match = document.cookie.match(/(?:^|;\s*)media_url=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

/**
 * Observer System – Sync Config → Display
 * 
 * CAM sometimes does NOT trigger the normal "storage" event.
 * To avoid desync, we implement a polling fallback to detect changes.
 */

type Listener = (value: string) => void
const listeners = new Set<Listener>()

let lastVal = ''

/** Poll for changes every 500ms (NZXT CAM fallback - faster for better UX). */
function poll() {
  const v = getMediaUrl()
  if (v !== lastVal) {
    lastVal = v
    listeners.forEach((fn) => fn(v))
  }
}

// Initialize lastVal on first poll
lastVal = getMediaUrl()

setInterval(poll, 500)

// Native browser storage event (fires instantly outside of CAM)
window.addEventListener('storage', (e) => {
  if (e.key === KEY) poll()
})

/**
 * Subscribe to media URL updates.
 * Immediately calls listener with current value.
 */
export function subscribe(fn: Listener) {
  listeners.add(fn)
  fn(getMediaUrl()) // send initial state
  return () => listeners.delete(fn)
}

/**
 * Helper Functions
 */

/**
 * Retrieve CAM LCD viewstate (expected resolution or scale factor).
 * Stored as "viewstate=<number>" inside a cookie.
 */
export function getViewState(): number {
  const match = document.cookie.match(/viewstate=(\d+)/)
  return match ? Number(match[1]) : 640
}

/**
 * Determine if running inside NZXT CAM (kraken=1 query flag).
 */
export function isKraken(): boolean {
  const sp = new URLSearchParams(location.search)
  return sp.get('kraken') === '1'
}
