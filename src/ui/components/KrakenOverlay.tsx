import { DEFAULT_OVERLAY, type OverlaySettings } from '../../types/overlay';
import { useConfig } from '../../hooks/useConfig';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useMonitoring } from '../../hooks/useMonitoring';
import { getLCDDimensions } from '../../environment';
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

  // Get LCD resolution using centralized environment detection
  const { width: lcdResolution } = getLCDDimensions();
  const lcdSize = lcdResolution;

  // Merge overlay settings with defaults
  const overlayConfig: OverlaySettings = {
    ...DEFAULT_OVERLAY,
    ...(settings.overlay || {}),
  };

  // Apply overlay offset if present (only for single mode)
  // Dual, triple, and custom modes handle offsets internally
  const overlayOffsetX = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual' || overlayConfig.mode === 'custom') ? 0 : (overlayConfig.x || 0);
  const overlayOffsetY = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual' || overlayConfig.mode === 'custom') ? 0 : (overlayConfig.y || 0);

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
          {overlayConfig.mode === 'custom' && overlayConfig.customReadings && overlayConfig.customReadings.length > 0 && (
            <>
              {overlayConfig.customReadings.map((reading) => (
                <div
                  key={reading.id}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `translate(${reading.x}px, ${reading.y}px)`,
                    pointerEvents: 'none',
                  }}
                >
                  <SingleInfographic
                    overlay={{
                      ...overlayConfig,
                      mode: 'single',
                      primaryMetric: reading.metric,
                      numberColor: reading.numberColor,
                      numberSize: reading.numberSize,
                      textColor: 'transparent',
                      textSize: 0,
                    }}
                    metrics={metrics}
                  />
                </div>
              ))}
            </>
          )}
          {overlayConfig.mode === 'custom' && overlayConfig.customTexts && overlayConfig.customTexts.length > 0 && (
            <>
              {overlayConfig.customTexts.map((text) => (
                <div
                  key={text.id}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${text.x}px), calc(-50% + ${text.y}px))`,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: `${text.textSize}px`,
                      color: text.textColor,
                      fontFamily: 'nzxt-extrabold',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                    }}
                  >
                    {text.text}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
