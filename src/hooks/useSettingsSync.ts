import { useEffect, useRef } from 'react';
import type { AppSettings } from '../constants/defaults';

/**
 * Hook for managing settings synchronization with throttling.
 * 
 * CRITICAL: Throttled save (100ms) for real-time sync
 * 
 * This hook manages automatic saving of settings with throttling to prevent
 * performance issues while maintaining real-time synchronization between
 * Config page and Display page (LCD).
 * 
 * ARCHITECTURAL DECISION:
 * - Settings are saved automatically on every change (drag, input, etc.)
 * - Throttling prevents excessive localStorage writes during rapid changes
 * - 100ms interval balances responsiveness and performance
 * - Realtime sync only enabled after user interaction (prevents unnecessary saves on load)
 * 
 * WHY 100ms THROTTLING:
 * - Too fast (< 50ms): Causes performance issues, too many localStorage writes
 * - Too slow (> 200ms): Noticeable lag in real-time preview updates
 * - 100ms: Sweet spot for responsiveness without performance cost
 * 
 * SYNC MECHANISM:
 * - Settings saved to localStorage trigger storage events
 * - Display page listens to storage events for instant updates
 * - URL included in settings for backward compatibility
 * - settingsRef provided for drag handlers to access latest settings
 * 
 * AI CONTRIBUTORS:
 * - DO NOT change 100ms throttle without performance testing
 * - DO NOT remove hasInteractedRef check (prevents saves on initial load)
 * - settingsRef MUST be kept in sync (used by drag handlers for latest state)
 * 
 * @param settings - Current settings (trigger save on change)
 * @param setSettings - Settings setter function (writes to localStorage)
 * @param mediaUrl - Current media URL (for backward compatibility in saved config)
 * @returns Object with settingsRef (for drag handlers)
 */
export function useSettingsSync(
  settings: AppSettings,
  setSettings: (settings: AppSettings & { url?: string }) => void,
  mediaUrl: string | null
) {
  const hasLoadedRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const lastSync = useRef(0);
  const settingsRef = useRef(settings);

  // Keep settings ref in sync
  // CRITICAL: Drag handlers use settingsRef to avoid stale closure issues
  // This ref always has the latest settings value
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Mark as loaded after initial render
  // Prevents saving during initial load (only save after user interaction)
  useEffect(() => {
    hasLoadedRef.current = true;
  }, []);

  // Enable realtime after first user action
  // Prevents unnecessary saves when component mounts with default settings
  // Only start saving after user interacts (drag, input, etc.)
  useEffect(() => {
    const enableRealtime = () => (hasInteractedRef.current = true);
    window.addEventListener('mousedown', enableRealtime, { once: true });
    window.addEventListener('wheel', enableRealtime, { once: true });
    window.addEventListener('keydown', enableRealtime, { once: true });

    return () => {
      window.removeEventListener('mousedown', enableRealtime);
      window.removeEventListener('wheel', enableRealtime);
      window.removeEventListener('keydown', enableRealtime);
    };
  }, []);

  // Throttled save (100ms) - CRITICAL for real-time sync
  // Saves settings to localStorage every 100ms (at most) when settings change
  // Storage events trigger cross-tab/process sync (Config → Display)
  useEffect(() => {
    // Don't save on initial load or before user interaction
    if (!hasLoadedRef.current || !hasInteractedRef.current) return;

    // Throttle: Only save if 100ms has passed since last save
    const now = Date.now();
    if (now - lastSync.current < 100) return;
    lastSync.current = now;

    // Save settings with URL for backward compatibility
    // Note: URL is also stored separately in storage.ts (media_url key)
    // But we include it here for legacy config format compatibility
    const save: AppSettings & { url?: string } = {
      ...settings,
      url: mediaUrl || undefined, // Include URL in config for backward compatibility
    };

    setSettings(save);
  }, [mediaUrl, settings, setSettings]);

  return {
    settingsRef, // Latest settings ref for drag handlers
  };
}

