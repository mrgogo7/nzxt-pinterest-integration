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
import { DEFAULT_OVERLAY, type OverlayMode, type OverlayMetricKey, type OverlaySettings } from '../../types/overlay';
import { NZXT_DEFAULTS } from '../../constants/nzxt';
import { useConfig } from '../../hooks/useConfig';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useMonitoring, useMonitoringMock } from '../../hooks/useMonitoring';
import { calculateOffsetScale, previewToLcd, lcdToPreview, getBaseAlign } from '../../utils/positioning';
import { isVideoUrl } from '../../utils/media';
import SingleInfographic from './SingleInfographic';
import DualInfographic from './DualInfographic';
import TripleInfographic from './TripleInfographic';
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
export default function ConfigPreview({ activeTab = 'media' }: { activeTab?: 'media' | 'color' }) {
  const [lang, setLang] = useState<Lang>(getInitialLang());
  const { settings, setSettings } = useConfig();
  const { mediaUrl } = useMediaUrl();
  // Use real monitoring data if NZXT API is available, otherwise use mock data
  // Check if NZXT API exists and has monitoring capability
  const hasNzxtApi = typeof window !== 'undefined' && 
    window.nzxt?.v1 && 
    typeof window.nzxt.v1.onMonitoringDataUpdate === 'function';
  
  const realMetrics = useMonitoring();
  const mockMetrics = useMonitoringMock();
  
  // Use mock data if API is not available or if real metrics are still at defaults (no data received)
  const isRealDataReceived = hasNzxtApi && (
    realMetrics.cpuTemp > 0 || 
    realMetrics.gpuTemp > 0 || 
    realMetrics.cpuLoad > 0 || 
    realMetrics.gpuLoad > 0
  );
  
  const metrics = isRealDataReceived ? realMetrics : mockMetrics;
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [isDraggingSecondaryTertiary, setIsDraggingSecondaryTertiary] = useState(false);

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const overlayDragStart = useRef<{ x: number; y: number } | null>(null);
  const secondaryTertiaryDragStart = useRef<{ x: number; y: number } | null>(null);
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
    
    // For triple and dual modes, determine which section to drag based on click position
    if (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const centerX = rect.width / 2;
      
      // If clicked on right half, drag secondary (dual) or secondary/tertiary (triple)
      if (clickX > centerX) {
        secondaryTertiaryDragStart.current = { x: e.clientX, y: e.clientY };
        setIsDraggingSecondaryTertiary(true);
      } else {
        // Left half or center: drag primary/divider
        overlayDragStart.current = { x: e.clientX, y: e.clientY };
        setIsDraggingOverlay(true);
      }
    } else {
      // For single mode, drag entire overlay
      overlayDragStart.current = { x: e.clientX, y: e.clientY };
      setIsDraggingOverlay(true);
    }
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

  const handleSecondaryTertiaryMouseMove = useCallback((e: MouseEvent) => {
    if (!secondaryTertiaryDragStart.current) return;

    const dx = e.clientX - secondaryTertiaryDragStart.current.x;
    const dy = e.clientY - secondaryTertiaryDragStart.current.y;
    secondaryTertiaryDragStart.current = { x: e.clientX, y: e.clientY };

    // CRITICAL: Convert preview pixels to LCD pixels
    const lcdDx = previewToLcd(dx, offsetScale);
    const lcdDy = previewToLcd(dy, offsetScale);

    // Use ref to get current settings value
    const currentSettings = settingsRef.current;
    const currentOverlay = currentSettings.overlay || DEFAULT_OVERLAY;
    
    // For dual mode, update secondaryOffsetX/Y; for triple mode, update dualReadersOffsetX/Y
    if (currentOverlay.mode === 'dual') {
      setSettings({
        ...currentSettings,
        overlay: {
          ...currentOverlay,
          secondaryOffsetX: (currentOverlay.secondaryOffsetX || 0) + lcdDx,
          secondaryOffsetY: (currentOverlay.secondaryOffsetY || 0) + lcdDy,
        },
      });
    } else if (currentOverlay.mode === 'triple') {
      setSettings({
        ...currentSettings,
        overlay: {
          ...currentOverlay,
          dualReadersOffsetX: (currentOverlay.dualReadersOffsetX || 0) + lcdDx,
          dualReadersOffsetY: (currentOverlay.dualReadersOffsetY || 0) + lcdDy,
        },
      });
    }
  }, [offsetScale, setSettings]);

  const handleOverlayMouseUp = useCallback(() => {
    setIsDraggingOverlay(false);
    overlayDragStart.current = null;
  }, []);

  const handleSecondaryTertiaryMouseUp = useCallback(() => {
    setIsDraggingSecondaryTertiary(false);
    secondaryTertiaryDragStart.current = null;
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

  useEffect(() => {
    if (isDraggingSecondaryTertiary) {
      window.addEventListener('mousemove', handleSecondaryTertiaryMouseMove);
      window.addEventListener('mouseup', handleSecondaryTertiaryMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleSecondaryTertiaryMouseMove);
        window.removeEventListener('mouseup', handleSecondaryTertiaryMouseUp);
      };
    }
  }, [isDraggingSecondaryTertiary, handleSecondaryTertiaryMouseMove, handleSecondaryTertiaryMouseUp]);

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
  // Overlay offset for preview (only for single mode)
  // Dual and triple modes handle offsets internally
  const overlayAdjX = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual') ? 0 : lcdToPreview(overlayConfig.x || 0, offsetScale);
  const overlayAdjY = (overlayConfig.mode === 'triple' || overlayConfig.mode === 'dual') ? 0 : lcdToPreview(overlayConfig.y || 0, offsetScale);

  return (
    <div className="config-wrapper-vertical">
      {/* Background Section - Only show when Media tab is active */}
      {(activeTab === undefined || activeTab !== 'color') && (
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

                {/* Show color background if Color tab is active */}
                {(activeTab === 'color') ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: settings.backgroundColor || '#000000',
                    }}
                  />
                ) : (
                  <>
                    {/* Show media if URL exists, otherwise show black */}
                    {mediaUrl ? (
                      isVideo ? (
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
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#000000',
                        }}
                      />
                    )}
                  </>
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

            {/* Media Settings - Only show when Media tab is active */}
            <div className="settings-column">
              <div className="panel">
                <div className="panel-header">
                  <h3>{t('mediaOptionsTitle', lang)}</h3>

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
                {([
                  { field: 'scale' as const, label: t('scale', lang), step: 0.1 },
                  { field: 'x' as const, label: t('xOffset', lang), step: 1 },
                  { field: 'y' as const, label: t('yOffset', lang), step: 1 },
                ] as const).map(({ field, label, step }) => {
                  // Type-safe access to numeric settings
                  const numericValue = settings[field];
                  
                  return (
                    <div className="setting-row" key={field}>
                      <label>{label}</label>

                      <input
                        type="number"
                        step={step}
                        value={numericValue}
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
                        onClick={() => resetField(field)}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  );
                })}

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
      )}

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
                  className={`preview-circle overlay-preview ${isDraggingOverlay || isDraggingSecondaryTertiary ? 'dragging' : ''}`}
                  onMouseDown={handleOverlayMouseDown}
                  style={{ position: 'relative', width: '200px', height: '200px' }}
                >
                  {(overlayConfig.mode === 'single' ||
                    overlayConfig.mode === 'dual' ||
                    overlayConfig.mode === 'triple') && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        transform: `translate(${overlayAdjX}px, ${overlayAdjY}px)`,
                        pointerEvents: 'none',
                      }}
                    >
                      {overlayConfig.mode === 'single' && (
                        <SingleInfographic overlay={overlayConfig} metrics={metrics} scale={overlayPreviewScale} />
                      )}
                      {overlayConfig.mode === 'dual' && (
                        <DualInfographic overlay={overlayConfig} metrics={metrics} scale={overlayPreviewScale} />
                      )}
                      {overlayConfig.mode === 'triple' && (
                        <TripleInfographic overlay={overlayConfig} metrics={metrics} scale={overlayPreviewScale} />
                      )}
                    </div>
                  )}
                </div>
                {/* Mock data warning */}
                {!isRealDataReceived && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: 'rgba(255, 193, 7, 0.15)',
                      border: '1px solid rgba(255, 193, 7, 0.3)',
                      borderRadius: '8px',
                      color: '#ffc107',
                      fontSize: '11px',
                      lineHeight: '1.4',
                      textAlign: 'center',
                      maxWidth: '200px',
                    }}
                  >
                    {t('mockDataWarning', lang)}
                  </div>
                )}
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
                {/* Overlay Mode - moved to header */}
                <select
                  className="url-input select-narrow"
                  value={overlayConfig.mode}
                    onChange={(e) => {
                      const newMode = e.target.value as OverlayMode;
                      const updates: Partial<OverlaySettings> = { mode: newMode };
                      
                      // Set default values when switching to dual mode
                      if (newMode === 'dual') {
                        updates.numberSize = 120;
                        updates.textSize = 35;
                        updates.secondaryNumberSize = 120;
                        updates.secondaryTextSize = 35;
                        updates.dividerGap = 32;
                        updates.x = 0; // Primary X Offset
                        updates.y = 0; // Primary Y Offset
                        updates.secondaryOffsetX = 50; // Secondary X Offset
                        updates.secondaryOffsetY = 0; // Secondary Y Offset
                        updates.primaryNumberColor = overlayConfig.primaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor;
                        updates.primaryTextColor = overlayConfig.primaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor;
                        updates.secondaryNumberColor = overlayConfig.secondaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor;
                        updates.secondaryTextColor = overlayConfig.secondaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor;
                      }
                      
                      // Set default values when switching to triple mode
                      if (newMode === 'triple') {
                        updates.numberSize = 155; // Primary Number Size
                        updates.textSize = 35; // Primary Text Size
                        updates.secondaryNumberSize = 80;
                        updates.secondaryTextSize = 20;
                        updates.tertiaryNumberSize = 80;
                        updates.tertiaryTextSize = 20;
                        updates.gapSecondaryTertiary = 20;
                        updates.dividerGap = 27;
                        updates.x = 18; // Primary X Offset
                        updates.y = 0; // Primary Y Offset
                        updates.dualReadersOffsetX = 60; // Dual Readers X Offset
                        updates.dualReadersOffsetY = 0; // Dual Readers Y Offset
                        updates.primaryNumberColor = overlayConfig.primaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor;
                        updates.primaryTextColor = overlayConfig.primaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor;
                        updates.secondaryNumberColor = overlayConfig.secondaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor;
                        updates.secondaryTextColor = overlayConfig.secondaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor;
                        updates.tertiaryNumberColor = overlayConfig.tertiaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor;
                        updates.tertiaryTextColor = overlayConfig.tertiaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor;
                      }
                      
                      setSettings({
                        ...settings,
                        overlay: {
                          ...overlayConfig,
                          ...updates,
                        },
                      });
                    }}
                  >
                    <option value="none">None</option>
                    <option value="single">Single Infographic</option>
                    <option value="dual">Dual Infographic</option>
                    <option value="triple">Triple Infographic</option>
                  </select>
              </div>

              {/* Description and Revert button */}
              <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, color: '#9aa3ad', fontSize: '12px', lineHeight: '1.4' }}>
                  {t('overlayOptionsDescription', lang)}
                </p>
                {(overlayConfig.mode === 'single' || overlayConfig.mode === 'dual' || overlayConfig.mode === 'triple') && (
                  <button
                    onClick={() => {
                      const mode = overlayConfig.mode;
                      const defaults = { ...DEFAULT_OVERLAY };
                      
                      // Set mode-specific defaults
                      if (mode === 'dual') {
                        defaults.numberSize = 120;
                        defaults.textSize = 35;
                        defaults.secondaryNumberSize = 120;
                        defaults.secondaryTextSize = 35;
                        defaults.dividerGap = 32;
                        defaults.x = 0;
                        defaults.y = 0;
                        defaults.secondaryOffsetX = 50;
                        defaults.secondaryOffsetY = 0;
                      } else if (mode === 'triple') {
                        defaults.numberSize = 155;
                        defaults.textSize = 35;
                        defaults.secondaryNumberSize = 80;
                        defaults.secondaryTextSize = 20;
                        defaults.tertiaryNumberSize = 80;
                        defaults.tertiaryTextSize = 20;
                        defaults.gapSecondaryTertiary = 20;
                        defaults.dividerGap = 27;
                        defaults.x = 18;
                        defaults.y = 0;
                        defaults.dualReadersOffsetX = 60;
                        defaults.dualReadersOffsetY = 0;
                      }
                      
                      setSettings({
                        ...settings,
                        overlay: {
                          ...defaults,
                          mode: overlayConfig.mode,
                          primaryMetric: overlayConfig.primaryMetric,
                          secondaryMetric: overlayConfig.secondaryMetric || defaults.secondaryMetric,
                          tertiaryMetric: overlayConfig.tertiaryMetric || defaults.tertiaryMetric,
                        },
                      });
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      background: '#263146',
                      border: '1px solid #3b5a9a',
                      color: '#d9e6ff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2e3a55';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#263146';
                    }}
                  >
                    {t('revertToDefaults', lang)}
                  </button>
                )}
              </div>

              <div className="settings-grid-modern">

                {/* PRIMARY READING */}
                {(overlayConfig.mode === 'single' ||
                  overlayConfig.mode === 'dual' ||
                  overlayConfig.mode === 'triple') && (
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
                )}

                {/* SECONDARY READING */}
                {(overlayConfig.mode === 'dual' ||
                  overlayConfig.mode === 'triple') && (
                  <div className="setting-row">
                    <label>{t('secondaryReading', lang)}</label>
                    <select
                      className="url-input select-narrow"
                      value={overlayConfig.secondaryMetric || overlayConfig.primaryMetric}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          overlay: {
                            ...overlayConfig,
                            secondaryMetric: e.target.value as OverlayMetricKey,
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
                )}

                {/* TERTIARY READING */}
                {overlayConfig.mode === 'triple' && (
                  <div className="setting-row">
                    <label>{t('tertiaryReading', lang)}</label>
                    <select
                      className="url-input select-narrow"
                      value={overlayConfig.tertiaryMetric || overlayConfig.primaryMetric}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          overlay: {
                            ...overlayConfig,
                            tertiaryMetric: e.target.value as OverlayMetricKey,
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
                )}

                {/* Overlay Settings - grouped by Primary/Secondary/Tertiary for better UX */}
                    {overlayConfig.mode === 'dual' ? (
                      <>
                        {/* Horizontal divider with label */}
                        <div className="settings-divider">
                          <span className="settings-divider-label">{t('firstReaderOptions', lang)}</span>
                        </div>
                        
                        {/* PRIMARY GROUP */}
                        {/* Primary X/Y Offset (at the beginning) */}
                        <div className="setting-row">
                          <label>{t('primaryXOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.x ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  x: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  x: DEFAULT_OVERLAY.x,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('primaryYOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.y ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  y: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  y: DEFAULT_OVERLAY.y,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* PRIMARY SETTINGS */}
                        <div className="setting-row">
                          <label>{t('primaryNumberColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.primaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  primaryNumberColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  primaryNumberColor: DEFAULT_OVERLAY.primaryNumberColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('primaryTextColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.primaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  primaryTextColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  primaryTextColor: DEFAULT_OVERLAY.primaryTextColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('primaryNumberSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.numberSize}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  numberSize: parseInt(e.target.value || '120', 10),
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
                          <label>{t('primaryTextSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.textSize}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  textSize: parseInt(e.target.value || '35', 10),
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

                        {/* Divider Gap - Space between primary and divider */}
                        <div className="setting-row">
                          <label>{t('dividerGap', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dividerGap ?? DEFAULT_OVERLAY.dividerGap ?? 32}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerGap: parseInt(e.target.value || '32', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerGap: 32,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Divider Width */}
                        <div className="setting-row">
                          <label>{t('dividerWidth', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dividerWidth || 60}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerWidth: parseInt(e.target.value || '60', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerWidth: DEFAULT_OVERLAY.dividerWidth,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Divider Thickness */}
                        <div className="setting-row">
                          <label>{t('dividerThickness', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dividerThickness || 2}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerThickness: parseInt(e.target.value || '2', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerThickness: DEFAULT_OVERLAY.dividerThickness,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Divider Color */}
                        <div className="setting-row">
                          <label>{t('dividerColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.dividerColor || DEFAULT_OVERLAY.dividerColor || 'rgba(255, 255, 255, 0.3)'}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerColor: DEFAULT_OVERLAY.dividerColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Horizontal divider with label */}
                        <div className="settings-divider">
                          <span className="settings-divider-label">{t('secondReaderOptions', lang)}</span>
                        </div>

                        {/* SECONDARY GROUP */}
                        {/* Secondary X/Y Offset (at the beginning) */}
                        <div className="setting-row">
                          <label>{t('secondaryXOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.secondaryOffsetX ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryOffsetX: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryOffsetX: DEFAULT_OVERLAY.secondaryOffsetX,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('secondaryYOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.secondaryOffsetY ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryOffsetY: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryOffsetY: DEFAULT_OVERLAY.secondaryOffsetY,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* SECONDARY SETTINGS */}
                        <div className="setting-row">
                          <label>{t('secondaryNumberColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.secondaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryNumberColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryNumberColor: DEFAULT_OVERLAY.secondaryNumberColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('secondaryTextColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.secondaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryTextColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryTextColor: DEFAULT_OVERLAY.secondaryTextColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('secondaryNumberSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.secondaryNumberSize || 120}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryNumberSize: parseInt(e.target.value || '120', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryNumberSize: DEFAULT_OVERLAY.secondaryNumberSize,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('secondaryTextSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.secondaryTextSize || 35}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryTextSize: parseInt(e.target.value || '35', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryTextSize: DEFAULT_OVERLAY.secondaryTextSize,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>
                      </>
                    ) : overlayConfig.mode === 'triple' ? (
                      <>
                        {/* Horizontal divider with label */}
                        <div className="settings-divider">
                          <span className="settings-divider-label">{t('firstReaderOptions', lang)}</span>
                        </div>
                        
                        {/* PRIMARY GROUP */}
                        {/* Primary X/Y Offset (at the beginning) */}
                        <div className="setting-row">
                          <label>{t('primaryXOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.x ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  x: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  x: DEFAULT_OVERLAY.x,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('primaryYOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.y ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  y: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  y: DEFAULT_OVERLAY.y,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* PRIMARY SETTINGS */}
                        <div className="setting-row">
                          <label>{t('primaryNumberColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.primaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  primaryNumberColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  primaryNumberColor: DEFAULT_OVERLAY.primaryNumberColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('primaryTextColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.primaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  primaryTextColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  primaryTextColor: DEFAULT_OVERLAY.primaryTextColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('primaryNumberSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.numberSize}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  numberSize: parseInt(e.target.value || '155', 10),
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
                          <label>{t('primaryTextSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.textSize}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  textSize: parseInt(e.target.value || '35', 10),
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

                        {/* Divider Gap - Space between primary and divider */}
                        <div className="setting-row">
                          <label>{t('dividerGap', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dividerGap ?? DEFAULT_OVERLAY.dividerGap ?? 8}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerGap: parseInt(e.target.value || '8', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerGap: DEFAULT_OVERLAY.dividerGap,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Divider Width */}
                        <div className="setting-row">
                          <label>{t('dividerWidth', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dividerWidth || 60}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerWidth: parseInt(e.target.value || '60', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerWidth: DEFAULT_OVERLAY.dividerWidth,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Divider Thickness */}
                        <div className="setting-row">
                          <label>{t('dividerThickness', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dividerThickness || 2}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerThickness: parseInt(e.target.value || '2', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerThickness: DEFAULT_OVERLAY.dividerThickness,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Divider Color */}
                        <div className="setting-row">
                          <label>{t('dividerColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.dividerColor || DEFAULT_OVERLAY.dividerColor || 'rgba(255, 255, 255, 0.3)'}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dividerColor: DEFAULT_OVERLAY.dividerColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Horizontal divider with label */}
                        <div className="settings-divider">
                          <span className="settings-divider-label">{t('secondReaderOptions', lang)}</span>
                        </div>

                        {/* SECONDARY/TERTIARY GROUP */}
                        {/* Dual Readers X/Y Offset (at the beginning) */}
                        <div className="setting-row">
                          <label>{t('dualReadersXOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dualReadersOffsetX ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dualReadersOffsetX: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dualReadersOffsetX: DEFAULT_OVERLAY.dualReadersOffsetX,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('dualReadersYOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dualReadersOffsetY ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dualReadersOffsetY: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dualReadersOffsetY: DEFAULT_OVERLAY.dualReadersOffsetY,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* SECONDARY SETTINGS */}
                        <div className="setting-row">
                          <label>{t('secondaryNumberColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.secondaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryNumberColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryNumberColor: DEFAULT_OVERLAY.secondaryNumberColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('secondaryTextColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.secondaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryTextColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryTextColor: DEFAULT_OVERLAY.secondaryTextColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('secondaryNumberSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.secondaryNumberSize || DEFAULT_OVERLAY.secondaryNumberSize || 80}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryNumberSize: parseInt(e.target.value || '80', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryNumberSize: DEFAULT_OVERLAY.secondaryNumberSize,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('secondaryTextSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.secondaryTextSize || DEFAULT_OVERLAY.secondaryTextSize || 20}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryTextSize: parseInt(e.target.value || '20', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  secondaryTextSize: DEFAULT_OVERLAY.secondaryTextSize,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* TERTIARY SETTINGS */}
                        <div className="setting-row">
                          <label>{t('tertiaryNumberColor', lang)}</label>
                          <ColorPicker
                            value={overlayConfig.tertiaryNumberColor || overlayConfig.numberColor || DEFAULT_OVERLAY.numberColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  tertiaryNumberColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  tertiaryNumberColor: DEFAULT_OVERLAY.tertiaryNumberColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('tertiaryTextColor', lang) || 'Tertiary Text Color'}</label>
                          <ColorPicker
                            value={overlayConfig.tertiaryTextColor || overlayConfig.textColor || DEFAULT_OVERLAY.textColor}
                            onChange={(color) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  tertiaryTextColor: color,
                                },
                              })
                            }
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  tertiaryTextColor: DEFAULT_OVERLAY.tertiaryTextColor,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('tertiaryNumberSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.tertiaryNumberSize || DEFAULT_OVERLAY.tertiaryNumberSize || 80}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  tertiaryNumberSize: parseInt(e.target.value || '80', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  tertiaryNumberSize: DEFAULT_OVERLAY.tertiaryNumberSize,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('tertiaryTextSize', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.tertiaryTextSize || DEFAULT_OVERLAY.tertiaryTextSize || 20}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  tertiaryTextSize: parseInt(e.target.value || '20', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  tertiaryTextSize: DEFAULT_OVERLAY.tertiaryTextSize,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Gap (Secondary-Tertiary) */}
                        <div className="setting-row">
                          <label>{t('gapSecondaryTertiary', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.gapSecondaryTertiary ?? DEFAULT_OVERLAY.gapSecondaryTertiary ?? 20}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  gapSecondaryTertiary: parseInt(e.target.value || '20', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  gapSecondaryTertiary: DEFAULT_OVERLAY.gapSecondaryTertiary,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        {/* Dual Readers X/Y Offset */}
                        <div className="setting-row">
                          <label>{t('dualReadersXOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dualReadersOffsetX ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dualReadersOffsetX: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dualReadersOffsetX: DEFAULT_OVERLAY.dualReadersOffsetX,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>

                        <div className="setting-row">
                          <label>{t('dualReadersYOffset', lang)}</label>
                          <input
                            type="number"
                            value={overlayConfig.dualReadersOffsetY ?? 0}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dualReadersOffsetY: parseInt(e.target.value || '0', 10),
                                },
                              })
                            }
                            className="input-narrow"
                          />
                          <button
                            className="reset-icon"
                            title="Reset"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                overlay: {
                                  ...overlayConfig,
                                  dualReadersOffsetY: DEFAULT_OVERLAY.dualReadersOffsetY,
                                },
                              });
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>
                      </>
                    ) : null}

                {/* SINGLE MODE SPECIFIC SETTINGS */}
                {overlayConfig.mode === 'single' && (
                  <>
                    {/* Horizontal divider with label */}
                    <div className="settings-divider">
                      <span className="settings-divider-label">{t('readerOptions', lang)}</span>
                    </div>

                    {/* Overlay X/Y Offset for single mode (at the beginning) */}
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
                              textSize: parseInt(e.target.value || '45', 10),
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

                    {/* Overlay X/Y Offset for single mode */}
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
