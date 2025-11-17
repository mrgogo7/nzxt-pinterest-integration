import { useEffect, useRef } from 'react';
import type { AppSettings } from '../constants/defaults';

/**
 * Hook for managing settings synchronization with throttling.
 * 
 * CRITICAL: Throttled save (100ms) for real-time sync
 * 
 * @param settings - Current settings
 * @param setSettings - Settings setter function
 * @param mediaUrl - Current media URL (for backward compatibility)
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
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Mark as loaded after initial render
  useEffect(() => {
    hasLoadedRef.current = true;
  }, []);

  // Enable realtime after first user action
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
  useEffect(() => {
    if (!hasLoadedRef.current || !hasInteractedRef.current) return;

    const now = Date.now();
    if (now - lastSync.current < 100) return;
    lastSync.current = now;

    // Save settings with URL for backward compatibility
    const save: AppSettings & { url?: string } = {
      ...settings,
      url: mediaUrl || undefined, // Include URL in config for backward compatibility
    };

    setSettings(save);
  }, [mediaUrl, settings, setSettings]);

  return {
    settingsRef,
  };
}

