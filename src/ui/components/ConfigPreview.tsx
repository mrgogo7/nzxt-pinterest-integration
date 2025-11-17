import { useEffect, useState } from 'react';
import '../styles/ConfigPreview.css';
import { LANG_KEY, Lang, t, getInitialLang } from '../../i18n';
import { Tooltip } from 'react-tooltip';
import { DEFAULT_SETTINGS, type AppSettings } from '../../constants/defaults';
import { DEFAULT_OVERLAY } from '../../types/overlay';
import { useConfig } from '../../hooks/useConfig';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useMonitoring, useMonitoringMock } from '../../hooks/useMonitoring';
import { usePreviewScaling } from '../../hooks/usePreviewScaling';
import { useSettingsSync } from '../../hooks/useSettingsSync';
import { useDragHandlers } from '../../hooks/useDragHandlers';
import { useOverlayConfig } from '../../hooks/useOverlayConfig';
import { hasRealMonitoring } from '../../environment';
import { lcdToPreview, getBaseAlign } from '../../utils/positioning';
import { isVideoUrl } from '../../utils/media';
import BackgroundPreview from './ConfigPreview/BackgroundPreview';
import BackgroundSettings from './ConfigPreview/BackgroundSettings';
import OverlayPreview from './ConfigPreview/OverlayPreview';
import OverlaySettingsComponent from './ConfigPreview/OverlaySettings';

/**
 * ConfigPreview component.
 * Provides interactive preview and settings panel for media configuration.
 * 
 * CRITICAL: offsetScale formula must be preserved (previewSize / lcdResolution)
 * 
 * Structure:
 * - Background Section: Main title + 2 columns (Preview | Settings)
 * - Overlay Section: Main title + 2 columns (Preview | Options)
 */
export default function ConfigPreview() {
  const [lang, setLang] = useState<Lang>(getInitialLang());
  const { settings, setSettings } = useConfig();
  const { mediaUrl } = useMediaUrl();
  
  // Use centralized environment detection to determine if real monitoring is available
  const hasRealMonitoringAPI = hasRealMonitoring();
  
  const realMetrics = useMonitoring();
  const mockMetrics = useMonitoringMock();
  
  // Use real data if API is available and metrics have been received (non-zero values)
  // Use mock data otherwise (for browser testing)
  const isRealDataReceived = !!(hasRealMonitoringAPI && (
    realMetrics.cpuTemp > 0 || 
    realMetrics.gpuTemp > 0 || 
    realMetrics.cpuLoad > 0 || 
    realMetrics.gpuLoad > 0
  ));
  
  const metrics = isRealDataReceived ? realMetrics : mockMetrics;

  // CRITICAL: offsetScale formula - must be preserved
  const { offsetScale, overlayPreviewScale } = usePreviewScaling(200);

  // Settings sync with throttling
  const { settingsRef } = useSettingsSync(settings, setSettings, mediaUrl);

  // Overlay config
  const overlayConfig = useOverlayConfig(settings);

  // Drag handlers
  const {
    isDragging,
    handleBackgroundMouseDown,
    isDraggingOverlay,
    isDraggingSecondaryTertiary,
    handleOverlayMouseDown,
    draggingReadingId,
    selectedReadingId,
    handleCustomReadingMouseDown,
    draggingTextId,
    selectedTextId,
    handleCustomTextMouseDown,
  } = useDragHandlers(offsetScale, settingsRef, setSettings, overlayConfig);

  // Language sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY && e.newValue) {
        setLang(e.newValue as Lang);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Video detection
  const isVideo = isVideoUrl(mediaUrl);

  // Background positioning - CRITICAL: offsetScale must be used
  const base = getBaseAlign(settings.align);
  const adjX = lcdToPreview(settings.x, offsetScale);
  const adjY = lcdToPreview(settings.y, offsetScale);
  const objectPosition = `calc(${base.x}% + ${adjX}px) calc(${base.y}% + ${adjY}px)`;

  // Zoom handler for background
  useEffect(() => {
    const circle = document.querySelector('.preview-circle');
    if (!circle) return;

    const onWheel = (e: WheelEvent) => {
      if (!circle.contains(e.target as Node)) return;

      e.preventDefault();
      const step = e.ctrlKey ? 0.2 : 0.1;
      const delta = e.deltaY < 0 ? step : -step;

      setSettings({
        ...settings,
        scale: Math.min(
          Math.max(parseFloat((settings.scale + delta).toFixed(2)), 0.1),
          5
        ),
      });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [settings, setSettings]);

  // Helper functions
  const adjustScale = (d: number) =>
    setSettings({
      ...settings,
      scale: Math.min(
        Math.max(parseFloat((settings.scale + d).toFixed(2)), 0.1),
        5
      ),
    });

  const resetField = (field: keyof AppSettings) => {
    const defaultValue = DEFAULT_SETTINGS[field];
    setSettings({
      ...settings,
      [field]: defaultValue,
    });
  };

  const resetOverlayField = (field: keyof typeof DEFAULT_OVERLAY) => {
    const defaultValue = DEFAULT_OVERLAY[field];
    setSettings({
      ...settings,
      overlay: {
        ...overlayConfig,
        [field]: defaultValue,
      },
    });
  };


  // Overlay positioning for preview
  // Overlay offset for preview (only for single mode)
  // Dual and triple modes handle offsets internally
  const overlayAdjX = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual' || overlayConfig.mode === 'custom') ? 0 : lcdToPreview(overlayConfig.x || 0, offsetScale);
  const overlayAdjY = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual' || overlayConfig.mode === 'custom') ? 0 : lcdToPreview(overlayConfig.y || 0, offsetScale);

  return (
    <div className="config-wrapper-vertical">
      {/* Background Section */}
      <div className="section-group">
        <h2 className="section-title">{t('backgroundSectionTitle', lang)}</h2>
        <div className="section-content">
          {/* Background Preview */}
          <BackgroundPreview
            mediaUrl={mediaUrl}
            settings={settings}
            isVideo={isVideo}
            objectPosition={objectPosition}
            adjX={adjX}
            adjY={adjY}
            isDragging={isDragging}
            onMouseDown={handleBackgroundMouseDown}
            onScaleChange={adjustScale}
            previewTitle={t('previewTitle', lang)}
          />

          {/* Background Settings */}
          <BackgroundSettings
            settings={settings}
            setSettings={setSettings}
            lang={lang}
            t={t}
            resetField={resetField}
          />
        </div>
      </div>

      {/* Overlay Section */}
      <div className="section-group">
        <h2 className="section-title">{t('overlaySectionTitle', lang)}</h2>
        <div className="section-content">
          {/* Overlay Preview */}
          <OverlayPreview
            overlayConfig={overlayConfig}
            metrics={metrics}
            overlayPreviewScale={overlayPreviewScale}
            offsetScale={offsetScale}
            overlayAdjX={overlayAdjX}
            overlayAdjY={overlayAdjY}
            isDraggingOverlay={isDraggingOverlay}
            isDraggingSecondaryTertiary={isDraggingSecondaryTertiary}
            draggingReadingId={draggingReadingId}
            draggingTextId={draggingTextId}
            selectedReadingId={selectedReadingId}
            selectedTextId={selectedTextId}
            onOverlayMouseDown={handleOverlayMouseDown}
            onCustomReadingMouseDown={handleCustomReadingMouseDown}
            onCustomTextMouseDown={handleCustomTextMouseDown}
            isRealDataReceived={isRealDataReceived}
            lang={lang}
            t={t}
          />

          {/* Overlay Options */}
          <OverlaySettingsComponent
            overlayConfig={overlayConfig}
            settings={settings}
            setSettings={setSettings}
            lang={lang}
            t={t}
            resetOverlayField={resetOverlayField}
          />
        </div>
      </div>
      <Tooltip id="reset-tooltip" />
      <Tooltip id="align-center-tooltip" />
      <Tooltip id="align-top-tooltip" />
      <Tooltip id="align-bottom-tooltip" />
      <Tooltip id="align-left-tooltip" />
      <Tooltip id="align-right-tooltip" />
      <Tooltip id="fit-cover-tooltip" />
      <Tooltip id="fit-contain-tooltip" />
      <Tooltip id="fit-fill-tooltip" />
      <Tooltip id="move-up-tooltip" />
      <Tooltip id="move-down-tooltip" />
      <Tooltip id="remove-reading-tooltip" />
      <Tooltip id="move-text-up-tooltip" />
      <Tooltip id="move-text-down-tooltip" />
      <Tooltip id="remove-text-tooltip" />
      <Tooltip id="revert-to-defaults-tooltip" />
    </div>
  );
}
