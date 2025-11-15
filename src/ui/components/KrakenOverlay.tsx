import { useState, useEffect } from 'react';
import { DEFAULT_OVERLAY, type OverlaySettings } from '../../types/overlay';
import { NZXT_DEFAULTS } from '../../constants/nzxt';
import { useConfig } from '../../hooks/useConfig';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useMonitoring } from '../../hooks/useMonitoring';
import MediaRenderer from './MediaRenderer';
import SingleInfographic from './SingleInfographic';
import DualInfographic from './DualInfographic';
import TripleInfographic from './TripleInfographic';
import styles from '../styles/KrakenOverlay.module.css';

/**
 * KrakenOverlay component.
 * LCD render surface for NZXT Kraken Elite.
 * 
 * - Reads media URL + settings from localStorage (same keys as ConfigPreview)
 * - Mirrors the LCD transform logic (scale, offset, align, fit)
 * - Adds overlay support via dedicated overlay components
 * - Registers window.nzxt.v1.onMonitoringDataUpdate for real monitoring data
 * - Does NOT require any props (safe for ?kraken=1 entry)
 */
export default function KrakenOverlay() {
  const { settings } = useConfig();
  const { mediaUrl } = useMediaUrl();
  const metrics = useMonitoring();

  // Get activeTab from localStorage (default to 'media')
  // Use state to ensure re-render when localStorage changes
  const [activeTab, setActiveTab] = useState<'media' | 'color'>(() => {
    if (typeof window === 'undefined') return 'media';
    const saved = localStorage.getItem('nzxtActiveTab');
    return (saved === 'media' || saved === 'color') ? saved : 'media';
  });

  // Listen to localStorage changes for activeTab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nzxtActiveTab' && e.newValue) {
        const newTab = (e.newValue === 'media' || e.newValue === 'color') ? e.newValue : 'media';
        setActiveTab(newTab);
      }
    };

    // Also poll for changes (in case storage event doesn't fire)
    const pollInterval = setInterval(() => {
      const saved = localStorage.getItem('nzxtActiveTab');
      if (saved) {
        const newTab = (saved === 'media' || saved === 'color') ? saved : 'media';
        if (newTab !== activeTab) {
          setActiveTab(newTab);
        }
      }
    }, 500);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [activeTab]);

  // Get LCD resolution from NZXT API or use default
  const lcdResolution = window.nzxt?.v1?.width || NZXT_DEFAULTS.LCD_WIDTH;
  const lcdSize = lcdResolution;

  // Merge overlay settings with defaults
  const overlayConfig: OverlaySettings = {
    ...DEFAULT_OVERLAY,
    ...(settings.overlay || {}),
  };

  // Apply overlay offset if present (only for single mode)
  // Dual and triple modes handle offsets internally
  const overlayOffsetX = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual') ? 0 : (overlayConfig.x || 0);
  const overlayOffsetY = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual') ? 0 : (overlayConfig.y || 0);

  // Determine if we should force color mode
  // Force color mode if: activeTab is 'color' OR mediaUrl is empty (show black/color background)
  const forceColorMode = activeTab === 'color' || !mediaUrl;

  return (
    <div
      className={styles.krakenOverlay}
      style={{
        width: `${lcdSize}px`,
        height: `${lcdSize}px`,
      }}
    >
      <MediaRenderer url={mediaUrl} settings={settings} />
      {overlayConfig.mode !== 'none' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${overlayOffsetX}px, ${overlayOffsetY}px)`,
            pointerEvents: 'none',
          }}
        >
          {overlayConfig.mode === 'single' && (
            <SingleInfographic overlay={overlayConfig} metrics={metrics} />
          )}
          {overlayConfig.mode === 'dual' && (
            <DualInfographic overlay={overlayConfig} metrics={metrics} />
          )}
          {overlayConfig.mode === 'triple' && (
            <TripleInfographic overlay={overlayConfig} metrics={metrics} />
          )}
        </div>
      )}
    </div>
  );
}
