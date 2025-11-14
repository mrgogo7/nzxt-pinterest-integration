import { useEffect } from 'react';

/**
 * Hook to sync with storage events.
 * Listens for changes to a specific localStorage key and calls callback.
 * 
 * @param key - Storage key to listen for
 * @param callback - Function to call when value changes
 * @param immediate - If true, calls callback immediately with current value
 */
export function useStorageSync(
  key: string,
  callback: (value: string | null) => void,
  immediate = false
) {
  useEffect(() => {
    if (immediate) {
      const value = localStorage.getItem(key);
      callback(value);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        callback(e.newValue);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, callback, immediate]);
}

