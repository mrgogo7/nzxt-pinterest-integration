import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { DEFAULT_SETTINGS, type AppSettings } from '../constants/defaults';
import { mergeSettings } from '../utils/settings';
import { useStorageSync } from './useStorageSync';

/**
 * Hook for managing application configuration.
 * Handles reading, writing, and syncing settings with localStorage.
 * 
 * @returns Settings object and setter function
 */
export function useConfig() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettingsState(mergeSettings(parsed));
      } catch (error) {
        console.error('[useConfig] Parse error:', error);
      }
    }
  }, []);

  // Storage sync
  useStorageSync(STORAGE_KEYS.CONFIG, (newValue) => {
    if (newValue) {
      try {
        const parsed = JSON.parse(newValue);
        setSettingsState(mergeSettings(parsed));
      } catch (error) {
        console.error('[useConfig] Sync error:', error);
      }
    }
  });

  const saveConfig = (newSettings: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettingsState(merged);
    
    const configJson = JSON.stringify(merged);
    localStorage.setItem(STORAGE_KEYS.CONFIG, configJson);
    localStorage.setItem(STORAGE_KEYS.CONFIG_COMPAT, configJson);
    
    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEYS.CONFIG,
        newValue: configJson,
      })
    );
  };

  return { settings, setSettings: saveConfig };
}

