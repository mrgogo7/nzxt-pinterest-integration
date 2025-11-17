import { motion } from 'framer-motion';
import { RefreshCw, ChevronUp, ChevronDown, Plus, X } from 'lucide-react';
import type { AppSettings } from '../../../constants/defaults';
import { DEFAULT_OVERLAY, type OverlayMode, type OverlayMetricKey, type OverlaySettings, type CustomReading, type CustomText } from '../../../types/overlay';
import type { Lang, t as tFunction } from '../../../i18n';
import ColorPicker from '../ColorPicker';

interface OverlaySettingsProps {
  overlayConfig: OverlaySettings;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  lang: Lang;
  t: typeof tFunction;
  resetOverlayField: (field: keyof typeof DEFAULT_OVERLAY) => void;
}

/**
 * Overlay settings component.
 * Provides controls for overlay mode, metrics, colors, sizes, offsets, and custom mode settings.
 */
export default function OverlaySettingsComponent({
  overlayConfig,
  settings,
  setSettings,
  lang,
  t,
  resetOverlayField,
}: OverlaySettingsProps) {
  return (
    <div className="settings-column overlay-options-area">
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
                      
                      // Set default values when switching to custom mode
                      if (newMode === 'custom') {
                        updates.customReadings = overlayConfig.customReadings || [];
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
                    <option value="custom">{t('customMode', lang)}</option>
                  </select>
              </div>

              {/* Description and Revert button */}
              <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, color: '#9aa3ad', fontSize: '12px', lineHeight: '1.4' }}>
                  {t('overlayOptionsDescription', lang)}
                </p>
                {(overlayConfig.mode === 'single' || overlayConfig.mode === 'dual' || overlayConfig.mode === 'triple' || overlayConfig.mode === 'custom') && (
                  <span
                    data-tooltip-id="revert-to-defaults-tooltip"
                    data-tooltip-content={overlayConfig.mode === 'custom' ? t('revertToDefaultsCustom', lang) : t('revertToDefaults', lang)}
                    onClick={() => {
                      const mode = overlayConfig.mode;
                      
                      if (mode === 'custom') {
                        // Custom mode: only reset reading and text options, keep items
                        const currentReadings = overlayConfig.customReadings || [];
                        const currentTexts = overlayConfig.customTexts || [];
                        const resetReadings = currentReadings.map(reading => ({
                          ...reading,
                          metric: 'cpuTemp' as OverlayMetricKey,
                          numberColor: DEFAULT_OVERLAY.numberColor,
                          numberSize: 180,
                          x: 0,
                          y: 0,
                        }));
                        const resetTexts = currentTexts.map(text => ({
                          ...text,
                          text: '',
                          textColor: DEFAULT_OVERLAY.textColor,
                          textSize: 45,
                          x: 0,
                          y: 0,
                        }));
                        setSettings({
                          ...settings,
                          overlay: {
                            ...overlayConfig,
                            customReadings: resetReadings,
                            customTexts: resetTexts,
                          },
                        });
                      } else {
                        // Other modes: full reset
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
                      }
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      color: '#5a9aff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      textDecoration: 'underline',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#7ab3ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#5a9aff';
                    }}
                  >
                    {t('revertToDefaults', lang)}
                  </span>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => resetOverlayField('numberSize')}
                          >
                            <RefreshCw size={14} />
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => resetOverlayField('textSize')}
                          >
                            <RefreshCw size={14} />
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => resetOverlayField('numberSize')}
                          >
                            <RefreshCw size={14} />
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => resetOverlayField('textSize')}
                          >
                            <RefreshCw size={14} />
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                          <motion.button
                      className="reset-icon"
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                          </motion.button>
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
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
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
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
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
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
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
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
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
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
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
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
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
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
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
                      data-tooltip-id="reset-tooltip"
                      data-tooltip-content={t('reset', lang)}
                        onClick={() => resetOverlayField('y')}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </>
                )}

                {/* CUSTOM MODE UI */}
                {overlayConfig.mode === 'custom' && (
                  <>
                    {/* Add Reading and Add Text Buttons */}
                    <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => {
                          const currentReadings = overlayConfig.customReadings || [];
                          const currentTexts = overlayConfig.customTexts || [];
                          const totalItems = currentReadings.length + currentTexts.length;
                          if (currentReadings.length < 8 && totalItems < 8) {
                            const maxOrder = Math.max(
                              ...currentReadings.map(r => r.order ?? 0),
                              ...currentTexts.map(t => t.order ?? 0),
                              -1
                            );
                            // labelIndex should be based on reading count only (not text count)
                            const maxReadingLabelIndex = Math.max(
                              ...currentReadings.map(r => r.labelIndex ?? 0),
                              -1
                            );
                            const newReading: CustomReading = {
                              id: `reading-${Date.now()}-${Math.random()}`,
                              metric: 'cpuTemp',
                              numberColor: DEFAULT_OVERLAY.numberColor,
                              numberSize: 180,
                              x: 0, // Center point (same as single/dual/triple modes)
                              y: 0,
                              order: maxOrder + 1,
                              labelIndex: maxReadingLabelIndex + 1,
                            };
                            setSettings({
                              ...settings,
                              overlay: {
                                ...overlayConfig,
                                customReadings: [...currentReadings, newReading],
                              },
                            });
                          }
                        }}
                        disabled={(overlayConfig.customReadings || []).length >= 4 || ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) >= 8}
                        style={{
                          background: (overlayConfig.customReadings || []).length >= 4 || ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) >= 8 ? '#1a1f2e' : '#263146',
                          border: '1px solid #3b5a9a',
                          color: (overlayConfig.customReadings || []).length >= 4 || ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) >= 8 ? '#5a6b7d' : '#d9e6ff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: (overlayConfig.customReadings || []).length >= 4 || ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) >= 8 ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                          flex: 1,
                        }}
                        onMouseEnter={(e) => {
                          if ((overlayConfig.customReadings || []).length < 4 && ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) < 8) {
                            e.currentTarget.style.background = '#2e3a55';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if ((overlayConfig.customReadings || []).length < 4 && ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) < 8) {
                            e.currentTarget.style.background = '#263146';
                          }
                        }}
                      >
                        <Plus size={16} />
                        {t('addReading', lang)}
                      </button>
                      <button
                        onClick={() => {
                          const currentReadings = overlayConfig.customReadings || [];
                          const currentTexts = overlayConfig.customTexts || [];
                          const totalItems = currentReadings.length + currentTexts.length;
                          if (currentTexts.length < 4 && totalItems < 8) {
                            const maxOrder = Math.max(
                              ...currentReadings.map(r => r.order ?? 0),
                              ...currentTexts.map(t => t.order ?? 0),
                              -1
                            );
                            // labelIndex should be based on text count only (not reading count)
                            const maxTextLabelIndex = Math.max(
                              ...currentTexts.map(t => t.labelIndex ?? 0),
                              -1
                            );
                            const newText: CustomText = {
                              id: `text-${Date.now()}-${Math.random()}`,
                              text: 'Text',
                              textColor: DEFAULT_OVERLAY.textColor,
                              textSize: 45,
                              x: 0,
                              y: 0,
                              order: maxOrder + 1,
                              labelIndex: maxTextLabelIndex + 1,
                            };
                            setSettings({
                              ...settings,
                              overlay: {
                                ...overlayConfig,
                                customTexts: [...currentTexts, newText],
                              },
                            });
                          }
                        }}
                        disabled={(overlayConfig.customTexts || []).length >= 4 || ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) >= 8}
                        style={{
                          background: (overlayConfig.customTexts || []).length >= 4 || ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) >= 8 ? '#1a1f2e' : '#263146',
                          border: '1px solid #3b5a9a',
                          color: (overlayConfig.customTexts || []).length >= 4 || ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) >= 8 ? '#5a6b7d' : '#d9e6ff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: (overlayConfig.customTexts || []).length >= 4 || ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) >= 8 ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                          flex: 1,
                        }}
                        onMouseEnter={(e) => {
                          if ((overlayConfig.customTexts || []).length < 4 && ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) < 8) {
                            e.currentTarget.style.background = '#2e3a55';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if ((overlayConfig.customTexts || []).length < 4 && ((overlayConfig.customReadings || []).length + (overlayConfig.customTexts || []).length) < 8) {
                            e.currentTarget.style.background = '#263146';
                          }
                        }}
                      >
                        <Plus size={16} />
                        {t('addText', lang)}
                      </button>
                    </div>

                    {/* Unified Custom Items List (Readings + Texts) */}
                    {(() => {
                      // Merge readings and texts, add order/labelIndex if missing (migration), and sort by order
                      const readings = (overlayConfig.customReadings || []).map((r, idx) => ({
                        ...r,
                        order: r.order ?? idx,
                        labelIndex: r.labelIndex ?? idx,
                        type: 'reading' as const,
                      }));
                      const texts = (overlayConfig.customTexts || []).map((t, idx) => ({
                        ...t,
                        order: t.order ?? (readings.length + idx),
                        labelIndex: t.labelIndex ?? idx, // Text labelIndex: 0, 1, 2... (only among texts)
                        type: 'text' as const,
                      }));
                      const unifiedItems = [...readings, ...texts].sort((a, b) => a.order - b.order);
                      
                      const readingLabels = [
                        t('firstReading', lang),
                        t('secondReading', lang),
                        t('thirdReading', lang),
                        t('fourthReading', lang),
                        t('fifthReading', lang),
                        t('sixthReading', lang),
                        t('seventhReading', lang),
                        t('eighthReading', lang),
                      ];
                      
                      const textLabels = [
                        t('firstText', lang),
                        t('secondText', lang),
                        t('thirdText', lang),
                        t('fourthText', lang),
                      ];
                      
                      return unifiedItems.map((item, unifiedIndex) => {
                        if (item.type === 'reading') {
                          const reading = item as CustomReading & { type: 'reading' };
                          return (
                            <div key={reading.id} style={{ marginBottom: '24px' }}>
                              {/* Reading Header */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginBottom: '12px',
                                  padding: '8px 12px',
                                  background: '#1a1f2e',
                                  borderRadius: '6px',
                                  border: '1px solid #2a3441',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#d9e6ff', fontSize: '13px', fontWeight: 600 }}>
                                    {readingLabels[reading.labelIndex ?? unifiedIndex] || `${(reading.labelIndex ?? unifiedIndex) + 1}${(reading.labelIndex ?? unifiedIndex) === 0 ? 'st' : (reading.labelIndex ?? unifiedIndex) === 1 ? 'nd' : (reading.labelIndex ?? unifiedIndex) === 2 ? 'rd' : 'th'} ${t('reading', lang)}`}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {/* Move Up Button */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (unifiedIndex > 0) {
                                        const prevItem = unifiedItems[unifiedIndex - 1];
                                        const currentReadings = [...(overlayConfig.customReadings || [])];
                                        const currentTexts = [...(overlayConfig.customTexts || [])];
                                        
                                        // Swap orders
                                        const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                        if (readingIndex !== -1) {
                                          currentReadings[readingIndex] = {
                                            ...currentReadings[readingIndex],
                                            order: prevItem.order,
                                          };
                                        }
                                        
                                        if (prevItem.type === 'reading') {
                                          const prevReadingIndex = currentReadings.findIndex(r => r.id === prevItem.id);
                                          if (prevReadingIndex !== -1) {
                                            currentReadings[prevReadingIndex] = {
                                              ...currentReadings[prevReadingIndex],
                                              order: reading.order,
                                            };
                                          }
                                        } else {
                                          const prevTextIndex = currentTexts.findIndex(t => t.id === prevItem.id);
                                          if (prevTextIndex !== -1) {
                                            currentTexts[prevTextIndex] = {
                                              ...currentTexts[prevTextIndex],
                                              order: reading.order,
                                            };
                                          }
                                        }
                                        
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                    disabled={unifiedIndex === 0}
                                    style={{
                                      background: unifiedIndex === 0 ? '#1a1f2e' : '#263146',
                                      border: '1px solid #3b5a9a',
                                      color: unifiedIndex === 0 ? '#5a6b7d' : '#d9e6ff',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      cursor: unifiedIndex === 0 ? 'not-allowed' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'all 0.15s ease',
                                    }}
                                    data-tooltip-id="move-up-tooltip"
                                    data-tooltip-content={t('moveReadingUp', lang)}
                                  >
                                    <ChevronUp size={14} />
                                  </button>
                                  {/* Move Down Button */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (unifiedIndex < unifiedItems.length - 1) {
                                        const nextItem = unifiedItems[unifiedIndex + 1];
                                        const currentReadings = [...(overlayConfig.customReadings || [])];
                                        const currentTexts = [...(overlayConfig.customTexts || [])];
                                        
                                        // Swap orders
                                        const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                        if (readingIndex !== -1) {
                                          currentReadings[readingIndex] = {
                                            ...currentReadings[readingIndex],
                                            order: nextItem.order,
                                          };
                                        }
                                        
                                        if (nextItem.type === 'reading') {
                                          const nextReadingIndex = currentReadings.findIndex(r => r.id === nextItem.id);
                                          if (nextReadingIndex !== -1) {
                                            currentReadings[nextReadingIndex] = {
                                              ...currentReadings[nextReadingIndex],
                                              order: reading.order,
                                            };
                                          }
                                        } else {
                                          const nextTextIndex = currentTexts.findIndex(t => t.id === nextItem.id);
                                          if (nextTextIndex !== -1) {
                                            currentTexts[nextTextIndex] = {
                                              ...currentTexts[nextTextIndex],
                                              order: reading.order,
                                            };
                                          }
                                        }
                                        
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                    disabled={unifiedIndex === unifiedItems.length - 1}
                                    style={{
                                      background: unifiedIndex === unifiedItems.length - 1 ? '#1a1f2e' : '#263146',
                                      border: '1px solid #3b5a9a',
                                      color: unifiedIndex === unifiedItems.length - 1 ? '#5a6b7d' : '#d9e6ff',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      cursor: unifiedIndex === unifiedItems.length - 1 ? 'not-allowed' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'all 0.15s ease',
                                    }}
                                    data-tooltip-id="move-down-tooltip"
                                    data-tooltip-content={t('moveReadingDown', lang)}
                                  >
                                    <ChevronDown size={14} />
                                  </button>
                                  {/* Remove Button */}
                                  <button
                                    onClick={() => {
                                      const currentReadings = (overlayConfig.customReadings || []).filter(
                                        (r) => r.id !== reading.id
                                      );
                                      setSettings({
                                        ...settings,
                                        overlay: {
                                          ...overlayConfig,
                                          customReadings: currentReadings,
                                        },
                                      });
                                    }}
                                    style={{
                                      background: '#3a1f1f',
                                      border: '1px solid #5a2a2a',
                                      color: '#ff6b6b',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'all 0.15s ease',
                                      marginLeft: '8px',
                                    }}
                                    data-tooltip-id="remove-reading-tooltip"
                                    data-tooltip-content={t('removeReading', lang)}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#4a2f2f';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#3a1f1f';
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Reading Options */}
                              <div className="settings-grid-modern">
                                {/* Metric Selection */}
                                <div className="setting-row">
                                  <label>{t('reading', lang)}</label>
                                  <select
                                    className="url-input select-narrow"
                                    value={reading.metric}
                                    onChange={(e) => {
                                      const currentReadings = [...(overlayConfig.customReadings || [])];
                                      const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                      if (readingIndex !== -1) {
                                        currentReadings[readingIndex] = {
                                          ...currentReadings[readingIndex],
                                          metric: e.target.value as OverlayMetricKey,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                          },
                                        });
                                      }
                                    }}
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

                                {/* Number Color */}
                                <div className="setting-row">
                                  <label>{t('color', lang)}</label>
                                  <ColorPicker
                                    value={reading.numberColor}
                                    onChange={(color) => {
                                      const currentReadings = [...(overlayConfig.customReadings || [])];
                                      const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                      if (readingIndex !== -1) {
                                        currentReadings[readingIndex] = {
                                          ...currentReadings[readingIndex],
                                          numberColor: color,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                          },
                                        });
                                      }
                                    }}
                                  />
                                  <motion.button
                                    className="reset-icon"
                                    data-tooltip-id="reset-tooltip"
                                    data-tooltip-content={t('reset', lang)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => {
                                      const currentReadings = [...(overlayConfig.customReadings || [])];
                                      const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                      if (readingIndex !== -1) {
                                        currentReadings[readingIndex] = {
                                          ...currentReadings[readingIndex],
                                          numberColor: DEFAULT_OVERLAY.numberColor,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                </div>

                                {/* Number Size */}
                                <div className="setting-row">
                                  <label>{t('size', lang)}</label>
                                  <input
                                    type="number"
                                    value={reading.numberSize}
                                    onChange={(e) => {
                                      const currentReadings = [...(overlayConfig.customReadings || [])];
                                      const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                      if (readingIndex !== -1) {
                                        currentReadings[readingIndex] = {
                                          ...currentReadings[readingIndex],
                                          numberSize: parseInt(e.target.value || '180', 10),
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                          },
                                        });
                                      }
                                    }}
                                    className="input-narrow"
                                  />
                                  <motion.button
                                    className="reset-icon"
                                    data-tooltip-id="reset-tooltip"
                                    data-tooltip-content={t('reset', lang)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => {
                                      const currentReadings = [...(overlayConfig.customReadings || [])];
                                      const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                      if (readingIndex !== -1) {
                                        currentReadings[readingIndex] = {
                                          ...currentReadings[readingIndex],
                                          numberSize: 180,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                </div>

                                {/* X Offset */}
                                <div className="setting-row">
                                  <label>{t('customXOffset', lang)}</label>
                                  <input
                                    type="number"
                                    value={reading.x}
                                    onChange={(e) => {
                                      const currentReadings = [...(overlayConfig.customReadings || [])];
                                      const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                      if (readingIndex !== -1) {
                                        currentReadings[readingIndex] = {
                                          ...currentReadings[readingIndex],
                                          x: parseInt(e.target.value || '0', 10),
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                          },
                                        });
                                      }
                                    }}
                                    className="input-narrow"
                                  />
                                  <motion.button
                                    className="reset-icon"
                                    data-tooltip-id="reset-tooltip"
                                    data-tooltip-content={t('reset', lang)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => {
                                      const currentReadings = [...(overlayConfig.customReadings || [])];
                                      const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                      if (readingIndex !== -1) {
                                        currentReadings[readingIndex] = {
                                          ...currentReadings[readingIndex],
                                          x: 0,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                </div>

                                {/* Y Offset */}
                                <div className="setting-row">
                                  <label>{t('customYOffset', lang)}</label>
                                  <input
                                    type="number"
                                    value={reading.y}
                                    onChange={(e) => {
                                      const currentReadings = [...(overlayConfig.customReadings || [])];
                                      const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                      if (readingIndex !== -1) {
                                        currentReadings[readingIndex] = {
                                          ...currentReadings[readingIndex],
                                          y: parseInt(e.target.value || '0', 10),
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                          },
                                        });
                                      }
                                    }}
                                    className="input-narrow"
                                  />
                                  <motion.button
                                    className="reset-icon"
                                    data-tooltip-id="reset-tooltip"
                                    data-tooltip-content={t('reset', lang)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => {
                                      const currentReadings = [...(overlayConfig.customReadings || [])];
                                      const readingIndex = currentReadings.findIndex(r => r.id === reading.id);
                                      if (readingIndex !== -1) {
                                        currentReadings[readingIndex] = {
                                          ...currentReadings[readingIndex],
                                          y: 0,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          // Text rendering
                          const text = item as CustomText & { type: 'text' };
                          
                          // Sanitize text input - remove HTML tags and dangerous characters
                          const sanitizeText = (input: string): string => {
                            // Remove HTML tags
                            let sanitized = input.replace(/<[^>]*>/g, '');
                            // Remove script tags and event handlers
                            sanitized = sanitized.replace(/javascript:/gi, '');
                            sanitized = sanitized.replace(/on\w+\s*=/gi, '');
                            // Limit to 120 characters
                            sanitized = sanitized.substring(0, 120);
                            return sanitized;
                          };
                          
                          return (
                            <div key={text.id} style={{ marginBottom: '24px' }}>
                              {/* Text Header */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginBottom: '12px',
                                  padding: '8px 12px',
                                  background: '#1a1f2e',
                                  borderRadius: '6px',
                                  border: '1px solid #2a3441',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#d9e6ff', fontSize: '13px', fontWeight: 600 }}>
                                    {textLabels[text.labelIndex ?? unifiedIndex] || `${(text.labelIndex ?? unifiedIndex) + 1}${(text.labelIndex ?? unifiedIndex) === 0 ? 'st' : (text.labelIndex ?? unifiedIndex) === 1 ? 'nd' : (text.labelIndex ?? unifiedIndex) === 2 ? 'rd' : 'th'} ${t('text', lang)}`}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {/* Move Up Button */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (unifiedIndex > 0) {
                                        const prevItem = unifiedItems[unifiedIndex - 1];
                                        const currentReadings = [...(overlayConfig.customReadings || [])];
                                        const currentTexts = [...(overlayConfig.customTexts || [])];
                                        
                                        // Swap orders
                                        const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                        if (textIndex !== -1) {
                                          currentTexts[textIndex] = {
                                            ...currentTexts[textIndex],
                                            order: prevItem.order,
                                          };
                                        }
                                        
                                        if (prevItem.type === 'reading') {
                                          const prevReadingIndex = currentReadings.findIndex(r => r.id === prevItem.id);
                                          if (prevReadingIndex !== -1) {
                                            currentReadings[prevReadingIndex] = {
                                              ...currentReadings[prevReadingIndex],
                                              order: text.order,
                                            };
                                          }
                                        } else {
                                          const prevTextIndex = currentTexts.findIndex(t => t.id === prevItem.id);
                                          if (prevTextIndex !== -1) {
                                            currentTexts[prevTextIndex] = {
                                              ...currentTexts[prevTextIndex],
                                              order: text.order,
                                            };
                                          }
                                        }
                                        
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                    disabled={unifiedIndex === 0}
                                    style={{
                                      background: unifiedIndex === 0 ? '#1a1f2e' : '#263146',
                                      border: '1px solid #3b5a9a',
                                      color: unifiedIndex === 0 ? '#5a6b7d' : '#d9e6ff',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      cursor: unifiedIndex === 0 ? 'not-allowed' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'all 0.15s ease',
                                    }}
                                    data-tooltip-id="move-text-up-tooltip"
                                    data-tooltip-content={t('moveTextUp', lang)}
                                  >
                                    <ChevronUp size={14} />
                                  </button>
                                  {/* Move Down Button */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (unifiedIndex < unifiedItems.length - 1) {
                                        const nextItem = unifiedItems[unifiedIndex + 1];
                                        const currentReadings = [...(overlayConfig.customReadings || [])];
                                        const currentTexts = [...(overlayConfig.customTexts || [])];
                                        
                                        // Swap orders
                                        const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                        if (textIndex !== -1) {
                                          currentTexts[textIndex] = {
                                            ...currentTexts[textIndex],
                                            order: nextItem.order,
                                          };
                                        }
                                        
                                        if (nextItem.type === 'reading') {
                                          const nextReadingIndex = currentReadings.findIndex(r => r.id === nextItem.id);
                                          if (nextReadingIndex !== -1) {
                                            currentReadings[nextReadingIndex] = {
                                              ...currentReadings[nextReadingIndex],
                                              order: text.order,
                                            };
                                          }
                                        } else {
                                          const nextTextIndex = currentTexts.findIndex(t => t.id === nextItem.id);
                                          if (nextTextIndex !== -1) {
                                            currentTexts[nextTextIndex] = {
                                              ...currentTexts[nextTextIndex],
                                              order: text.order,
                                            };
                                          }
                                        }
                                        
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customReadings: currentReadings,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                    disabled={unifiedIndex === unifiedItems.length - 1}
                                    style={{
                                      background: unifiedIndex === unifiedItems.length - 1 ? '#1a1f2e' : '#263146',
                                      border: '1px solid #3b5a9a',
                                      color: unifiedIndex === unifiedItems.length - 1 ? '#5a6b7d' : '#d9e6ff',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      cursor: unifiedIndex === unifiedItems.length - 1 ? 'not-allowed' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'all 0.15s ease',
                                    }}
                                    data-tooltip-id="move-text-down-tooltip"
                                    data-tooltip-content={t('moveTextDown', lang)}
                                  >
                                    <ChevronDown size={14} />
                                  </button>
                                  {/* Remove Button */}
                                  <button
                                    onClick={() => {
                                      const currentTexts = (overlayConfig.customTexts || []).filter(
                                        (t) => t.id !== text.id
                                      );
                                      setSettings({
                                        ...settings,
                                        overlay: {
                                          ...overlayConfig,
                                          customTexts: currentTexts,
                                        },
                                      });
                                    }}
                                    style={{
                                      background: '#3a1f1f',
                                      border: '1px solid #5a2a2a',
                                      color: '#ff6b6b',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'all 0.15s ease',
                                      marginLeft: '8px',
                                    }}
                                    data-tooltip-id="remove-text-tooltip"
                                    data-tooltip-content={t('removeText', lang)}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#4a2f2f';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#3a1f1f';
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Text Options */}
                              <div className="settings-grid-modern">
                                {/* Text Input */}
                                <div className="setting-row">
                                  <label>{t('textInput', lang)}</label>
                                  <input
                                    type="text"
                                    value={text.text}
                                    maxLength={120}
                                    onChange={(e) => {
                                      const sanitized = sanitizeText(e.target.value);
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          text: sanitized,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                    className="input-narrow"
                                    placeholder={t('textInputPlaceholder', lang)}
                                  />
                                  <motion.button
                                    className="reset-icon"
                                    data-tooltip-id="reset-tooltip"
                                    data-tooltip-content={t('reset', lang)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => {
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          text: 'Text',
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                </div>

                                {/* Text Color */}
                                <div className="setting-row">
                                  <label>{t('color', lang)}</label>
                                  <ColorPicker
                                    value={text.textColor}
                                    onChange={(color) => {
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          textColor: color,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                  />
                                  <motion.button
                                    className="reset-icon"
                                    data-tooltip-id="reset-tooltip"
                                    data-tooltip-content={t('reset', lang)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => {
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          textColor: DEFAULT_OVERLAY.textColor,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                </div>

                                {/* Text Size */}
                                <div className="setting-row">
                                  <label>{t('size', lang)}</label>
                                  <input
                                    type="number"
                                    value={text.textSize}
                                    min={6}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value || '45', 10);
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          textSize: Math.max(6, value), // Minimum 6
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                    className="input-narrow"
                                  />
                                  <motion.button
                                    className="reset-icon"
                                    data-tooltip-id="reset-tooltip"
                                    data-tooltip-content={t('reset', lang)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => {
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          textSize: 45,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                </div>

                                {/* X Offset */}
                                <div className="setting-row">
                                  <label>{t('customXOffset', lang)}</label>
                                  <input
                                    type="number"
                                    value={text.x}
                                    onChange={(e) => {
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          x: parseInt(e.target.value || '0', 10),
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                    className="input-narrow"
                                  />
                                  <motion.button
                                    className="reset-icon"
                                    data-tooltip-id="reset-tooltip"
                                    data-tooltip-content={t('reset', lang)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => {
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          x: 0,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                </div>

                                {/* Y Offset */}
                                <div className="setting-row">
                                  <label>{t('customYOffset', lang)}</label>
                                  <input
                                    type="number"
                                    value={text.y}
                                    onChange={(e) => {
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          y: parseInt(e.target.value || '0', 10),
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                    className="input-narrow"
                                  />
                                  <motion.button
                                    className="reset-icon"
                                    data-tooltip-id="reset-tooltip"
                                    data-tooltip-content={t('reset', lang)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => {
                                      const currentTexts = [...(overlayConfig.customTexts || [])];
                                      const textIndex = currentTexts.findIndex(t => t.id === text.id);
                                      if (textIndex !== -1) {
                                        currentTexts[textIndex] = {
                                          ...currentTexts[textIndex],
                                          y: 0,
                                        };
                                        setSettings({
                                          ...settings,
                                          overlay: {
                                            ...overlayConfig,
                                            customTexts: currentTexts,
                                          },
                                        });
                                      }
                                    }}
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      });
                    })()}
                    
                    {/* Legacy lists removed - now using unified list above */}
                  </>
                )}
              </div>
            </div>
          </div>
  );
}