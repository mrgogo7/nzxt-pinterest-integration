import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { getMediaUrl, setMediaUrl, subscribe } from '../utils/storage';
import { useStorageSync } from './useStorageSync';

/**
 * Hook for managing media URL.
 * Uses storage.ts module for cross-process compatibility.
 * Also listens to direct localStorage 'media_url' key for backward compatibility.
 * 
 * @returns Media URL and setter function
 */
export function useMediaUrl() {
  // Try to get URL from multiple sources (priority order)
  const getInitialUrl = (): string => {
    // 1. Try storage.ts (with cookie fallback)
    const fromStorage = getMediaUrl();
    if (fromStorage) return fromStorage;
    
    // 2. Try direct localStorage 'media_url' key
    try {
      const fromLocalStorage = localStorage.getItem(STORAGE_KEYS.MEDIA_URL);
      if (fromLocalStorage) return fromLocalStorage;
    } catch (e) {
      console.warn('[useMediaUrl] localStorage read failed:', e);
    }
    
    // 3. Try config object (Config.tsx writes URL there too)
    try {
      const configStr = localStorage.getItem(STORAGE_KEYS.CONFIG) || 
                        localStorage.getItem(STORAGE_KEYS.CONFIG_COMPAT);
      if (configStr) {
        const config = JSON.parse(configStr);
        if (config.url) return config.url;
      }
    } catch (e) {
      // Ignore parse errors
    }
    
    return '';
  };

  const [mediaUrl, setMediaUrlState] = useState<string>(getInitialUrl());
  const lastCheckedUrlRef = useRef<string>('');

  // Subscribe to storage.ts changes (handles cross-process sync)
  useEffect(() => {
    const unsubscribe = subscribe((url) => {
      // Handle both empty and non-empty URLs (important for reset functionality)
      if (url !== mediaUrl) {
        setMediaUrlState(url);
        lastCheckedUrlRef.current = url;
      }
    });
    return () => {
      unsubscribe();
    };
  }, [mediaUrl]);

  // Also listen to direct localStorage 'media_url' key (for Config.tsx compatibility)
  // BUT: Don't call setMediaUrl() here to avoid circular updates
  // storage.ts is the source of truth, localStorage is just a mirror
  useStorageSync(STORAGE_KEYS.MEDIA_URL, (newValue) => {
    // Handle both empty and non-empty URLs (important for reset functionality)
    const urlValue = newValue || '';
    if (urlValue !== mediaUrl && urlValue !== lastCheckedUrlRef.current) {
      setMediaUrlState(urlValue);
      lastCheckedUrlRef.current = urlValue;
      // DON'T call setMediaUrl() here - it would create a circular update
      // storage.ts should be updated by updateMediaUrl() function only
    }
  }, true); // immediate = true to get initial value

  // Listen to config object changes (ConfigPreview writes URL there for backward compatibility)
  // But we prioritize storage.ts as the source of truth
  useEffect(() => {
    const checkConfigUrl = () => {
      try {
        const configStr = localStorage.getItem(STORAGE_KEYS.CONFIG) || 
                          localStorage.getItem(STORAGE_KEYS.CONFIG_COMPAT);
        if (configStr) {
          const config = JSON.parse(configStr);
          // Only sync from config if storage.ts is empty (backward compatibility)
          const currentFromStorage = getMediaUrl();
          if (config.url && !currentFromStorage && config.url !== mediaUrl && config.url !== lastCheckedUrlRef.current) {
            setMediaUrlState(config.url);
            lastCheckedUrlRef.current = config.url;
            // Sync to storage.ts (source of truth)
            setMediaUrl(config.url);
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    const onConfigChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CONFIG || e.key === STORAGE_KEYS.CONFIG_COMPAT) {
        checkConfigUrl();
      }
    };

    window.addEventListener('storage', onConfigChange);
    // Also check on mount
    checkConfigUrl();
    
    return () => window.removeEventListener('storage', onConfigChange);
  }, [mediaUrl]);

  const updateMediaUrl = (url: string) => {
    setMediaUrl(url); // storage.ts (with cookie fallback)
    // Also write directly to localStorage for backward compatibility
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA_URL, url);
    } catch (e) {
      console.warn('[useMediaUrl] localStorage write failed:', e);
    }
    setMediaUrlState(url);
  };

  return { mediaUrl, setMediaUrl: updateMediaUrl };
}

