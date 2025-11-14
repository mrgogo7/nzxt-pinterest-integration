import { DEFAULT_OVERLAY, type OverlaySettings } from '../../types/overlay';
import { NZXT_DEFAULTS } from '../../constants/nzxt';
import { useConfig } from '../../hooks/useConfig';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useMonitoring } from '../../hooks/useMonitoring';
import MediaRenderer from './MediaRenderer';
import SingleInfographic from './SingleInfographic';
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

  // Get LCD resolution from NZXT API or use default
  const lcdResolution = window.nzxt?.v1?.width || NZXT_DEFAULTS.LCD_WIDTH;
  const lcdSize = lcdResolution;

  // Merge overlay settings with defaults
  const overlayConfig: OverlaySettings = {
    ...DEFAULT_OVERLAY,
    ...(settings.overlay || {}),
  };

  // Apply overlay offset if present
  const overlayOffsetX = overlayConfig.x || 0;
  const overlayOffsetY = overlayConfig.y || 0;

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
          <SingleInfographic overlay={overlayConfig} metrics={metrics} />
        </div>
      )}
    </div>
  );
}
