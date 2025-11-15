import { DEFAULT_OVERLAY, type OverlaySettings } from '../../types/overlay';
import { type AppSettings } from '../../constants/defaults';
import { useMonitoring } from '../../hooks/useMonitoring';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useConfig } from '../../hooks/useConfig';
import MediaRenderer from './MediaRenderer';
import SingleInfographic from './SingleInfographic';
import DualInfographic from './DualInfographic';
import TripleInfographic from './TripleInfographic';
import styles from './styles/KrakenOverlay.module.css';

export default function KrakenOverlay() {
  const { mediaUrl } = useMediaUrl();
  const { settings } = useConfig();
  const metrics = useMonitoring();

  const overlayConfig: OverlaySettings = settings.overlay || DEFAULT_OVERLAY;
  const lcdSize = 640;
  const overlayOffsetX = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual') ? 0 : (overlayConfig.x || 0);
  const overlayOffsetY = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual') ? 0 : (overlayConfig.y || 0);

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
            top: 0,
            left: 0,
            width: `${lcdSize}px`,
            height: `${lcdSize}px`,
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
