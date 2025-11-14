// ============================================================================
// NZXT Web Integration – Shared Storage Layer
// ----------------------------------------------------------------------------
// This module provides a robust shared storage mechanism for both the
// Config page (settings UI) and the Display page (LCD renderer).
//
// Why this exists:
// - NZXT CAM sometimes launches Config and Display in SEPARATE Chromium
//   processes, causing localStorage isolation.
// - To avoid desync, we mirror the URL into a cookie as a fallback layer.
// - Cookies work across CAM’s embedded browser instances when secure attributes
//   are applied (SameSite=None; Secure).
//
// Storage priority:
//  1. localStorage   (best performance)
//  2. cookie fallback (cross-process compatibility for CAM)
//
// This file also implements a small observer system so Display can react
// instantly when Config updates the media URL.
// ============================================================================

// Primary storage key used in both localStorage and storage events.
// NOTE: Changing this string will reset previously saved URLs.
// (CAM will treat it as a brand-new storage namespace.)
const KEY = 'media_url_primary'

// Cookie key for cross-process fallback
const COOKIE = 'media_url'

// ============================================================================
// Media URL – Read & Write
// ============================================================================

/**
 * Persist media URL (image/video) to both localStorage and cookie.
 * This ensures maximum compatibility inside NZXT CAM.
 */
export function setMediaUrl(url: string) {
  try {
    localStorage.setItem(KEY, url)
  } catch (e) {
    console.warn('[NZXT] localStorage write failed:', e)
  }

  // CAM requires secure cookie attributes to allow cross-process sharing.
  document.cookie = `${COOKIE}=${encodeURIComponent(url)}; path=/; SameSite=None; Secure`
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

// ============================================================================
// Observer System – Sync Config → Display
// ============================================================================
// CAM sometimes does NOT trigger the normal "storage" event.
// To avoid desync, we implement a polling fallback to detect changes.

type Listener = (value: string) => void
const listeners = new Set<Listener>()

let lastVal = ''

/** Poll for changes every 2 seconds (NZXT CAM fallback). */
function poll() {
  const v = getMediaUrl()
  if (v !== lastVal) {
    lastVal = v
    listeners.forEach((fn) => fn(v))
  }
}

setInterval(poll, 2000)

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

// ============================================================================
// Helpers
// ============================================================================

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
