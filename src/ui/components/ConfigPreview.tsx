import { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/ConfigPreview.css';
import { LANG_KEY, Lang, t, getInitialLang } from '../../i18n';
import {
  RefreshCw,
  Move,
  MoveDiagonal,
  MoveHorizontal,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignEndVertical,
  AlignVerticalSpaceAround,
} from 'lucide-react';
import { DEFAULT_SETTINGS, type AppSettings } from '../../constants/defaults';
import { DEFAULT_OVERLAY, type OverlayMode, type OverlayMetricKey } from '../../types/overlay';
import { NZXT_DEFAULTS } from '../../constants/nzxt';
import { useConfig } from '../../hooks/useConfig';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useMonitoringMock } from '../../hooks/useMonitoring';
import { calculateOffsetScale, previewToLcd, lcdToPreview, getBaseAlign } from '../../utils/positioning';
import { isVideoUrl } from '../../utils/media';
import SingleInfographic from './SingleInfographic';
import ColorPicker from './ColorPicker';

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
  const metrics = useMonitoringMock(); // Mock data for preview (NZXT API not available)
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const overlayDragStart = useRef<{ x: number; y: number } | null>(null);
  const hasLoadedRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const lastSync = useRef(0);
  const settingsRef = useRef(settings);

  // CRITICAL: offsetScale formula - must be preserved
  const lcdResolution = window.nzxt?.v1?.width || NZXT_DEFAULTS.LCD_WIDTH;
  const previewSize = 200;
  const offsetScale = calculateOffsetScale(previewSize, lcdResolution);
  // Scale factor for overlay preview (200px preview / 640px LCD)
  const overlayPreviewScale = previewSize / lcdResolution;

  // Keep settings ref in sync
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Overlay config
  const overlayConfig = {
    ...DEFAULT_OVERLAY,
    ...(settings.overlay || {}),
  };

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

  // Enable realtime after first user action
  useEffect(() => {
    const enableRealtime = () => (hasInteractedRef.current = true);
    window.addEventListener('mousedown', enableRealtime, { once: true });
    window.addEventListener('wheel', enableRealtime, { once: true });
    window.addEventListener('keydown', enableRealtime, { once: true });

    return () => {
      window.removeEventListener('mousedown', enableRealtime);
      window.removeEventListener('wheel', enableRealtime);
      window.removeEventListener('keydown', enableRealtime);
    };
  }, []);

  // Mark as loaded after initial render
  useEffect(() => {
    hasLoadedRef.current = true;
  }, []);

  // Throttled save (100ms) - CRITICAL for real-time sync
  useEffect(() => {
    if (!hasLoadedRef.current || !hasInteractedRef.current) return;

    const now = Date.now();
    if (now - lastSync.current < 100) return;
    lastSync.current = now;

    // Save settings with URL for backward compatibility
    const save: AppSettings & { url?: string } = {
      ...settings,
      url: mediaUrl, // Include URL in config for backward compatibility
    };

    setSettings(save);
  }, [mediaUrl, settings, setSettings]);

  // Video detection
  const isVideo = isVideoUrl(mediaUrl);

  // Background positioning - CRITICAL: offsetScale must be used
  const base = getBaseAlign(settings.align);
  const adjX = lcdToPreview(settings.x, offsetScale);
  const adjY = lcdToPreview(settings.y, offsetScale);
  const objectPosition = `calc(${base.x}% + ${adjX}px) calc(${base.y}% + ${adjY}px)`;

  // Background drag handler - CRITICAL: LCD pixel conversion
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  // Use useCallback to memoize handlers and prevent stale closures
  const handleBackgroundMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStart.current) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };

    // CRITICAL: Convert preview pixels to LCD pixels
    const lcdDx = previewToLcd(dx, offsetScale);
    const lcdDy = previewToLcd(dy, offsetScale);

    // Use ref to get current settings value
    const currentSettings = settingsRef.current;
    setSettings({
      ...currentSettings,
      x: currentSettings.x + lcdDx,
      y: currentSettings.y + lcdDy,
    });
  }, [offsetScale, setSettings]);

  const handleBackgroundMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Overlay drag handler - FIXED: Use correct offsetScale
  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    overlayDragStart.current = { x: e.clientX, y: e.clientY };
    setIsDraggingOverlay(true);
  };

  const handleOverlayMouseMove = useCallback((e: MouseEvent) => {
    if (!overlayDragStart.current) return;

    const dx = e.clientX - overlayDragStart.current.x;
    const dy = e.clientY - overlayDragStart.current.y;
    overlayDragStart.current = { x: e.clientX, y: e.clientY };

    // CRITICAL: Convert preview pixels to LCD pixels for overlay (same as background)
    const lcdDx = previewToLcd(dx, offsetScale);
    const lcdDy = previewToLcd(dy, offsetScale);

    // Use ref to get current settings value
    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay || DEFAULT_OVERLAY;
    setSettings({
      ...currentSettings,
      overlay: {
        ...currentOverlay,
        x: (currentOverlay.x || 0) + lcdDx,
        y: (currentOverlay.y || 0) + lcdDy,
      },
    });
  }, [offsetScale, setSettings]);

  const handleOverlayMouseUp = useCallback(() => {
    setIsDraggingOverlay(false);
    overlayDragStart.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleBackgroundMouseMove);
      window.addEventListener('mouseup', handleBackgroundMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleBackgroundMouseMove);
        window.removeEventListener('mouseup', handleBackgroundMouseUp);
      };
    }
  }, [isDragging, handleBackgroundMouseMove, handleBackgroundMouseUp]);

  useEffect(() => {
    if (isDraggingOverlay) {
      window.addEventListener('mousemove', handleOverlayMouseMove);
      window.addEventListener('mouseup', handleOverlayMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleOverlayMouseMove);
        window.removeEventListener('mouseup', handleOverlayMouseUp);
      };
    }
  }, [isDraggingOverlay, handleOverlayMouseMove, handleOverlayMouseUp]);

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

  // Icon data
  const alignIcons = [
    { key: 'center', icon: <AlignVerticalSpaceAround size={16} /> },
    { key: 'top', icon: <AlignStartHorizontal size={16} /> },
    { key: 'bottom', icon: <AlignEndHorizontal size={16} /> },
    { key: 'left', icon: <AlignStartVertical size={16} /> },
    { key: 'right', icon: <AlignEndVertical size={16} /> },
  ];

  const fitIcons = [
    { key: 'cover', icon: <Move size={16} /> },
    { key: 'contain', icon: <MoveDiagonal size={16} /> },
    { key: 'fill', icon: <MoveHorizontal size={16} /> },
  ];

  // Overlay positioning for preview
  const overlayAdjX = lcdToPreview(overlayConfig.x || 0, offsetScale);
  const overlayAdjY = lcdToPreview(overlayConfig.y || 0, offsetScale);

  return (
    <div className="config-wrapper-vertical">
      {/* Background Section */}
      <div className="section-group">
        <h2 className="section-title">{t('backgroundSectionTitle', lang)}</h2>
        <div className="section-content">
          {/* Background Preview */}
          <div className="preview-column">
            <div className="preview-title">{t('previewTitle', lang)}</div>
            <div
              className={`preview-circle ${isDragging ? 'dragging' : ''}`}
              onMouseDown={handleBackgroundMouseDown}
            >
              <div className="scale-label">Scale: {settings.scale.toFixed(2)}×</div>

              {isVideo ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: settings.fit,
                    objectPosition,
                    transform: `scale(${settings.scale})`,
                    transformOrigin: 'center center',
                  }}
                />
              ) : (
                mediaUrl && (
                  <img
                    src={mediaUrl}
                    alt="preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: settings.fit,
                      objectPosition,
                      transform: `scale(${settings.scale})`,
                      transformOrigin: 'center center',
                    }}
                  />
                )
              )}

              {/* Overlay guide - only for alignment reference */}
              {settings.showGuide && (
                <div
                  className="overlay-guide"
                  style={{
                    transform: `translate(${adjX}px, ${adjY}px) scale(${settings.scale})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <div className="crosshair horizontal" />
                  <div className="crosshair vertical" />
                </div>
              )}

              <div className="zoom-buttons-bottom">
                <button onClick={() => adjustScale(-0.1)}>−</button>
                <button onClick={() => adjustScale(0.1)}>＋</button>
              </div>
            </div>
          </div>

          {/* Background Settings */}
          <div className="settings-column">
            <div className="panel">
              <div className="panel-header">
                <h3>{t('settingsTitle', lang)}</h3>

                <div className="overlay-toggle-compact">
                  <span>{t('overlayGuide', lang)}</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!!settings.showGuide}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          showGuide: e.target.checked,
                        })
                      }
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>

              <div className="settings-grid-modern">
                {/* SCALE / X / Y */}
                {[
                  { field: 'scale', label: t('scale', lang), step: 0.1 },
                  { field: 'x', label: t('xOffset', lang) },
                  { field: 'y', label: t('yOffset', lang) },
                ].map(({ field, label, step }) => (
                  <div className="setting-row" key={field}>
                    <label>{label}</label>

                    <input
                      type="number"
                      step={step || 1}
                      value={(settings as any)[field]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [field]: parseFloat(e.target.value || '0'),
                        })
                      }
                    />

                    <button
                      className="reset-icon"
                      title="Reset"
                      onClick={() => resetField(field as keyof AppSettings)}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ))}

                {/* ALIGN */}
                <div className="setting-row">
                  <label>{t('align', lang)}</label>
                  <div className="icon-group">
                    {alignIcons.map(({ key, icon }) => (
                      <button
                        key={key}
                        className={`icon-btn ${settings.align === key ? 'active' : ''}`}
                        title={t(`align${key[0].toUpperCase() + key.slice(1)}`, lang)}
                        onClick={() =>
                          setSettings({
                            ...settings,
                            align: key as AppSettings['align'],
                          })
                        }
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <button
                    className="reset-icon"
                    title="Reset"
                    onClick={() => resetField('align')}
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                {/* FIT */}
                <div className="setting-row">
                  <label>{t('fit', lang)}</label>
                  <div className="icon-group">
                    {fitIcons.map(({ key, icon }) => (
                      <button
                        key={key}
                        className={`icon-btn ${settings.fit === key ? 'active' : ''}`}
                        title={t(`fit${key[0].toUpperCase() + key.slice(1)}`, lang)}
                        onClick={() =>
                          setSettings({
                            ...settings,
                            fit: key as AppSettings['fit'],
                          })
                        }
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <button
                    className="reset-icon"
                    title="Reset"
                    onClick={() => resetField('fit')}
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay Section */}
      <div className="section-group">
        <h2 className="section-title">{t('overlaySectionTitle', lang)}</h2>
        <div className="section-content">
          {/* Overlay Preview */}
          <div className="preview-column">
            {overlayConfig.mode !== 'none' ? (
              <>
                <div className="preview-title">{t('overlayPreviewTitle', lang)}</div>
                <div
                  className={`preview-circle overlay-preview ${isDraggingOverlay ? 'dragging' : ''}`}
                  onMouseDown={handleOverlayMouseDown}
                  style={{ position: 'relative', width: '200px', height: '200px' }}
                >
                  {overlayConfig.mode === 'single' && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        transform: `translate(${overlayAdjX}px, ${overlayAdjY}px)`,
                        pointerEvents: 'none',
                      }}
                    >
                      <SingleInfographic overlay={overlayConfig} metrics={metrics} scale={overlayPreviewScale} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="preview-title" style={{ opacity: 0.5 }}>
                {t('overlayPreviewTitle', lang)} - {t('overlayMode', lang)}: None
              </div>
            )}
          </div>

          {/* Overlay Options */}
          <div className="settings-column">
            <div className="panel">
              <div className="panel-header">
                <h3>{t('overlaySettingsTitle', lang)}</h3>
              </div>

              <div className="settings-grid-modern">
                {/* Overlay Mode */}
                <div className="setting-row">
                  <label>{t('overlayMode', lang)}</label>
                  <select
                    className="url-input select-narrow"
                    value={overlayConfig.mode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        overlay: {
                          ...overlayConfig,
                          mode: e.target.value as OverlayMode,
                        },
                      })
                    }
                  >
                    <option value="none">None</option>
                    <option value="single">Single Infographic</option>
                    <option value="dual">Dual Infographic</option>
                    <option value="triple">Triple Infographic</option>
                  </select>
                </div>

                {/* PRIMARY READING */}
                {overlayConfig.mode === 'single' && (
                  <>
                    <div className="setting-row">
                      <label>{t('primaryReading', lang)}</label>
                      <select
                        className="url-input select-narrow"
                        value={overlayConfig.primaryMetric}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            overlay: {
                              ...overlayConfig,
                              primaryMetric: e.target.value as OverlayMetricKey,
                            },
                          })
                        }
                      >
                        <option value="cpuTemp">CPU Temperature</option>
                        <option value="cpuLoad">CPU Load</option>
                        <option value="cpuClock">CPU Clock</option>
                        <option value="liquidTemp">Liquid Temperature</option>
                        <option value="gpuTemp">GPU Temperature</option>
                        <option value="gpuLoad">GPU Load</option>
                        <option value="gpuClock">GPU Clock</option>
                      </select>
                    </div>

                    {/* Overlay X/Y Offset */}
                    <div className="setting-row">
                      <label>{t('overlayXOffset', lang)}</label>
                      <input
                        type="number"
                        value={overlayConfig.x || 0}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            overlay: {
                              ...overlayConfig,
                              x: parseFloat(e.target.value || '0'),
                            },
                          })
                        }
                        className="input-narrow"
                      />
                      <button
                        className="reset-icon"
                        title="Reset"
                        onClick={() => resetOverlayField('x')}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>

                    <div className="setting-row">
                      <label>{t('overlayYOffset', lang)}</label>
                      <input
                        type="number"
                        value={overlayConfig.y || 0}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            overlay: {
                              ...overlayConfig,
                              y: parseFloat(e.target.value || '0'),
                            },
                          })
                        }
                        className="input-narrow"
                      />
                      <button
                        className="reset-icon"
                        title="Reset"
                        onClick={() => resetOverlayField('y')}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>

                    <div className="setting-row">
                      <label>{t('numberColor', lang)}</label>
                      <ColorPicker
                        value={overlayConfig.numberColor}
                        onChange={(color) =>
                          setSettings({
                            ...settings,
                            overlay: {
                              ...overlayConfig,
                              numberColor: color,
                            },
                          })
                        }
                      />
                      <button
                        className="reset-icon"
                        title="Reset"
                        onClick={() => resetOverlayField('numberColor')}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>

                    <div className="setting-row">
                      <label>{t('textColor', lang)}</label>
                      <ColorPicker
                        value={overlayConfig.textColor}
                        onChange={(color) =>
                          setSettings({
                            ...settings,
                            overlay: {
                              ...overlayConfig,
                              textColor: color,
                            },
                          })
                        }
                      />
                      <button
                        className="reset-icon"
                        title="Reset"
                        onClick={() => resetOverlayField('textColor')}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>

                    <div className="setting-row">
                      <label>{t('numberSize', lang)}</label>
                      <input
                        type="number"
                        value={overlayConfig.numberSize}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            overlay: {
                              ...overlayConfig,
                              numberSize: parseInt(e.target.value || '180', 10),
                            },
                          })
                        }
                        className="input-narrow"
                      />
                      <button
                        className="reset-icon"
                        title="Reset"
                        onClick={() => resetOverlayField('numberSize')}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>

                    <div className="setting-row">
                      <label>{t('textSize', lang)}</label>
                      <input
                        type="number"
                        value={overlayConfig.textSize}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            overlay: {
                              ...overlayConfig,
                              textSize: parseInt(e.target.value || '80', 10),
                            },
                          })
                        }
                        className="input-narrow"
                      />
                      <button
                        className="reset-icon"
                        title="Reset"
                        onClick={() => resetOverlayField('textSize')}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
