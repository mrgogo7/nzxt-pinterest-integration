import { useState, useEffect } from 'react';
import { getMediaUrl, setMediaUrl, subscribe } from '../utils/storage';

/**
 * Hook for managing media URL.
 * Uses storage.ts module for cross-process compatibility.
 * 
 * @returns Media URL and setter function
 */
export function useMediaUrl() {
  const [mediaUrl, setMediaUrlState] = useState<string>(getMediaUrl());

  // Subscribe to storage changes (storage.ts handles cross-process sync)
  useEffect(() => {
    const unsubscribe = subscribe((url) => {
      setMediaUrlState(url);
    });
    return unsubscribe;
  }, []);

  const updateMediaUrl = (url: string) => {
    setMediaUrl(url);
    setMediaUrlState(url);
  };

  return { mediaUrl, setMediaUrl: updateMediaUrl };
}

