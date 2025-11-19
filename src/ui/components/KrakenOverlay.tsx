import { useConfig } from '../../hooks/useConfig';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useMonitoring } from '../../hooks/useMonitoring';
import { useOverlayConfig } from '../../hooks/useOverlayConfig';
import { getLCDDimensions } from '../../environment';
import MediaRenderer from './MediaRenderer';
import UnifiedOverlayRenderer from './UnifiedOverlayRenderer';
import styles from '../styles/KrakenOverlay.module.css';

/**
 * KrakenOverlay component.
 * LCD render surface for NZXT Kraken Elite.
 * 
 * Fully migrated to element-based overlay system.
 * - Uses UnifiedOverlayRenderer for all element types
 * - Reads media URL + settings from localStorage (same keys as ConfigPreview)
 * - Mirrors the LCD transform logic (scale, offset, align, fit)
 * - Registers window.nzxt.v1.onMonitoringDataUpdate for real monitoring data
 * - Does NOT require any props (safe for ?kraken=1 entry)
 */
export default function KrakenOverlay() {
  const { settings } = useConfig();
  const { mediaUrl } = useMediaUrl();
  const metrics = useMonitoring();
  const overlayConfig = useOverlayConfig(settings);

  // Get LCD resolution using centralized environment detection
  const { width: lcdResolution } = getLCDDimensions();
  const lcdSize = lcdResolution;

  // Get background color from settings, default to #000000
  const backgroundColor = settings.backgroundColor || '#000000';

  return (
    <div
      className={styles.krakenOverlay}
      style={{
        width: `${lcdSize}px`,
        height: `${lcdSize}px`,
        background: backgroundColor,
      }}
    >
      <MediaRenderer url={mediaUrl} settings={settings} />
      {overlayConfig.mode !== 'none' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          <UnifiedOverlayRenderer
            overlay={overlayConfig}
            metrics={metrics}
          />
        </div>
      )}
    </div>
  );
}
