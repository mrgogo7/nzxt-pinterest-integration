import type { MouseEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Plus, X, BarChart3, Type, Minus, Layout } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import type { AppSettings } from '../../../constants/defaults';
import type { Overlay, OverlayMetricKey, OverlayElement, MetricElementData, TextElementData, DividerElementData } from '../../../types/overlay';
import type { Lang, t as tFunction } from '../../../i18n';
import { addOverlayElement, removeOverlayElement, reorderOverlayElements, updateMetricElementData, updateTextElementData, updateDividerElementData, updateOverlayElementPosition, updateOverlayElementAngle, MAX_OVERLAY_ELEMENTS, wouldExceedElementLimit } from '../../../utils/overlaySettingsHelpers';
import OverlayField from './OverlayField';
import ResetConfirmationModal from './ResetConfirmationModal';
import RemoveConfirmationModal from './RemoveConfirmationModal';
import ImportOverlayModal from './ImportOverlayModal';
import OverlayPresetPickerModal from '../modals/OverlayPresetPickerModal';
import ColorPicker from '../ColorPicker';
import CombinedTextColorInput from './CombinedTextColorInput';
import { exportOverlayPreset, importOverlayPreset } from '../../../overlayPreset';
import { getTemplateElements } from '../../../overlayPreset/templates';
import { normalizeZIndexForAppend, generateElementId } from '../../../overlayPreset/utils';

interface OverlaySettingsProps {
  overlayConfig: Overlay;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  lang: Lang;
  t: typeof tFunction;
  selectedElementId: string | null;
  setSelectedElementId: (elementId: string | null) => void;
}

/**
 * Overlay settings component.
 * Provides controls for overlay mode and element-based settings.
 * 
 * Modernized UI with improved grouping, spacing, and i18n support.
 * - Uses unified element array (Overlay.elements)
 * - Element-based add/remove/reorder operations
 * - Element-specific settings (metric, text, divider)
 * - Full i18n support (EN/TR)
 * - Reset button restores DEFAULT_OVERLAY
 */
export default function OverlaySettingsComponent({
  overlayConfig,
  settings,
  setSettings,
  lang,
  t,
  selectedElementId,
  setSelectedElementId,
}: OverlaySettingsProps) {
  // Helper: Get metric, text, and divider element counts
  const metricElements = overlayConfig.elements.filter(el => el.type === 'metric');
  const textElements = overlayConfig.elements.filter(el => el.type === 'text');
  const dividerElements = overlayConfig.elements.filter(el => el.type === 'divider');
  const metricCount = metricElements.length;
  const textCount = textElements.length;
  const dividerCount = dividerElements.length;
  const totalCount = overlayConfig.elements.length;

  // State for Floating Add Menu
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right?: number; left?: number } | null>(null);
  const floatingMenuRef = useRef<HTMLDivElement>(null);
  const floatingButtonRef = useRef<HTMLButtonElement>(null);

  // State for Reset Confirmation Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // State for Remove Confirmation Modal
  const [removeModalState, setRemoveModalState] = useState<{ isOpen: boolean; elementId: string | null; elementType: 'metric' | 'text' | 'divider' | null }>({
    isOpen: false,
    elementId: null,
    elementType: null,
  });

  // State for Import Overlay Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedElements, setImportedElements] = useState<OverlayElement[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Overlay Preset Picker Modal
  const [isOverlayPresetModalOpen, setIsOverlayPresetModalOpen] = useState(false);

  // State for collapsible elements (default: all open)
  const [collapsedElements, setCollapsedElements] = useState<Set<string>>(new Set());
  
  const toggleCollapse = (elementId: string) => {
    setCollapsedElements(prev => {
      const next = new Set(prev);
      if (next.has(elementId)) {
        next.delete(elementId);
      } else {
        next.add(elementId);
      }
      return next;
    });
  };

  // Calculate menu position based on button position
  useEffect(() => {
    if (isFloatingMenuOpen && floatingButtonRef.current) {
      // Use requestAnimationFrame to ensure menu is rendered before calculating position
      requestAnimationFrame(() => {
        if (!floatingButtonRef.current) return;
        
        const buttonRect = floatingButtonRef.current.getBoundingClientRect();
        const panelRect = floatingButtonRef.current.closest('.panel')?.getBoundingClientRect();
        if (panelRect) {
          // Menu dimensions
          const menuWidth = 180;
          // Dynamically calculate menu height from ref, fallback to 170px
          const menuHeight = floatingMenuRef.current?.offsetHeight ?? 170;
          const gap = 4;

          // Check if button is in empty state (centered)
          const emptyStateContainer = floatingButtonRef.current.closest('div[style*="textAlign: center"]');
          
          if (emptyStateContainer) {
            // Center the menu
            const buttonCenterX = buttonRect.left - panelRect.left + (buttonRect.width / 2);
            const relativeLeft = buttonCenterX - (menuWidth / 2);
            
            // Check if menu would overflow viewport bottom
            const menuBottom = buttonRect.bottom + gap + menuHeight;
            const wouldOverflow = menuBottom > window.innerHeight;
            
            if (wouldOverflow) {
              // Open menu upward
              const relativeTop = buttonRect.top - panelRect.top - menuHeight - gap;
              setMenuPosition({ top: relativeTop, left: relativeLeft });
            } else {
              // Open menu downward
              const relativeTop = buttonRect.bottom - panelRect.top + gap;
              setMenuPosition({ top: relativeTop, left: relativeLeft });
            }
          } else {
            // Align menu to the right of the button
            const relativeRight = panelRect.right - buttonRect.right;
            
            // Check if menu would overflow viewport bottom
            const menuBottom = buttonRect.bottom + gap + menuHeight;
            const wouldOverflow = menuBottom > window.innerHeight;
            
            if (wouldOverflow) {
              // Open menu upward
              const relativeTop = buttonRect.top - panelRect.top - menuHeight - gap;
              setMenuPosition({ top: relativeTop, right: relativeRight });
            } else {
              // Open menu downward
              const relativeTop = buttonRect.bottom - panelRect.top + gap;
              setMenuPosition({ top: relativeTop, right: relativeRight });
            }
          }
        }
      });
    }
  }, [isFloatingMenuOpen]);

  // Handle outside click and ESC key to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        floatingMenuRef.current &&
        floatingButtonRef.current &&
        !floatingMenuRef.current.contains(event.target as Node) &&
        !floatingButtonRef.current.contains(event.target as Node)
      ) {
        setIsFloatingMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFloatingMenuOpen) {
        setIsFloatingMenuOpen(false);
      }
    };

    if (isFloatingMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside as any);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside as any);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFloatingMenuOpen]);

  // Helper: Get metric option labels with i18n
  const getMetricOptions = () => [
    { value: 'cpuTemp', label: t('metricCpuTemp', lang) },
    { value: 'cpuLoad', label: t('metricCpuLoad', lang) },
    { value: 'cpuClock', label: t('metricCpuClock', lang) },
    { value: 'liquidTemp', label: t('metricLiquidTemp', lang) },
    { value: 'gpuTemp', label: t('metricGpuTemp', lang) },
    { value: 'gpuLoad', label: t('metricGpuLoad', lang) },
    { value: 'gpuClock', label: t('metricGpuClock', lang) },
  ];

  // Helper: Reset all element values to defaults (keep elements, reset their values)
  const handleResetToDefaults = () => {
    // Open confirmation modal
    setIsResetModalOpen(true);
  };

  // Helper: Actually perform the reset
  const performReset = () => {
    const resetElements = overlayConfig.elements.map((element) => {
      if (element.type === 'metric') {
        const data = element.data as MetricElementData;
        return {
          ...element,
          x: 0,
          y: 0,
          angle: 0,
          data: {
            ...data,
            metric: data.metric, // Keep current metric
            numberColor: 'rgba(255, 255, 255, 1)',
            numberSize: 180,
            textColor: 'transparent',
            textSize: 0,
            showLabel: false,
          } as MetricElementData,
        };
      } else if (element.type === 'text') {
        return {
          ...element,
          x: 0,
          y: 0,
          angle: 0,
          data: {
            text: 'Text',
            textColor: 'rgba(255, 255, 255, 1)',
            textSize: 45,
          } as TextElementData,
        };
      } else if (element.type === 'divider') {
        return {
          ...element,
          x: 0,
          y: 0,
          angle: 0,
          data: {
            width: 2,
            height: 384,
            color: 'rgba(255, 255, 255, 0.3)',
          } as DividerElementData,
        };
      }
      return element;
    });

    setSettings({
      ...settings,
      overlay: {
        ...overlayConfig,
        elements: resetElements,
      },
    });
  };

  // Handler: Export overlay preset
  const handleExportOverlay = async () => {
    try {
      const presetName = `overlay-preset-${new Date().toISOString().split('T')[0]}`;
      await exportOverlayPreset(overlayConfig.elements, presetName);
    } catch (error) {
      console.error('[OverlaySettings] Export error:', error);
      const errorMessage = t('overlayExportError', lang);
      alert(errorMessage);
    }
  };

  // Handler: File input change - triggers import and opens modal if valid
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      // Reset input if no file selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      const result = await importOverlayPreset(file);
      
      if (!result.success || !result.elements || result.elements.length === 0) {
        console.error('[OverlaySettings] Import error:', result.error);
        // Reset input on import failure
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Show error notification
        const errorMessage = t('overlayImportError', lang)
          .replace('{error}', result.error || 'Unknown error');
        alert(errorMessage);
        return;
      }

      // Store imported elements and open modal
      setImportedElements(result.elements);
      setIsImportModalOpen(true);
    } catch (error) {
      console.error('[OverlaySettings] Import error:', error);
      // Reset input on any error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Show error notification
      const errorMessage = t('overlayImportError', lang)
        .replace('{error}', error instanceof Error ? error.message : 'Unknown error');
      alert(errorMessage);
    }
  };

  // Handler: Apply imported elements (Replace or Append)
  const handleImportOverlay = (elements: OverlayElement[], mode: 'replace' | 'append') => {
    if (elements.length === 0) return;

    if (mode === 'replace') {
      // Replace all elements
      setSettings({
        ...settings,
        overlay: {
          ...overlayConfig,
          elements: [...elements],
        },
      });
    } else {
      // Append to existing elements with zIndex normalization
      const normalizedElements = normalizeZIndexForAppend(overlayConfig.elements, elements);
      setSettings({
        ...settings,
        overlay: {
          ...overlayConfig,
          elements: [...overlayConfig.elements, ...normalizedElements],
        },
      });
    }

    // Reset state
    setImportedElements([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handler: Overlay preset template selection
  const handleOverlayPresetSelect = (templateId: string) => {
    try {
      // Get template elements with assigned IDs
      const templateElements = getTemplateElements(templateId);
      
      if (templateElements.length === 0) {
        console.warn(`[OverlaySettings] Template elements empty for: ${templateId}`);
        return;
      }
      
      // Store in importedElements state
      setImportedElements(templateElements);
      
      // Open import modal (FAZ 1 modal - Replace/Append)
      setIsImportModalOpen(true);
    } catch (error) {
      console.error('[OverlaySettings] Template selection error:', error);
    }
  };

  return (
    <div className="settings-column overlay-options-area">
      <div className="panel" style={{ position: 'relative' }}>
        {/* Header with Mode Switch */}
        <div className="panel-header">
          <h3>{overlayConfig.mode === 'custom' ? t('overlaySettingsTitle', lang) : t('overlayTitle', lang)}</h3>
          <div className="overlay-toggle-compact">
            <span>{overlayConfig.mode === 'custom' ? t('overlayStatusActive', lang) : t('overlayStatusOff', lang)}</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={overlayConfig.mode === 'custom'}
                aria-label={overlayConfig.mode === 'custom' ? t('overlayStatusActive', lang) : t('overlayStatusOff', lang)}
                onChange={(e) => {
                  const newMode = e.target.checked ? 'custom' : 'none';
                  setSettings({
                    ...settings,
                    overlay: {
                      ...overlayConfig,
                      mode: newMode,
                      elements: newMode === 'none' ? [] : overlayConfig.elements,
                    },
                  });
                }}
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          {overlayConfig.mode === 'custom' && overlayConfig.elements.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, color: '#a0a0a0', fontSize: '12px', lineHeight: '1.5', flex: 1 }}>
                {t('overlayOptionsDescription', lang)}{' '}
                <span
                  onClick={handleResetToDefaults}
                  data-tooltip-id="reset-to-defaults-tooltip"
                  data-tooltip-content={t('revertToDefaults', lang)}
                  style={{
                    color: '#8a2be2',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLSpanElement>) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLSpanElement>) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {t('overlayOptionsResetLink', lang)}
                </span>
                <Tooltip id="reset-to-defaults-tooltip" />
              </p>
              <button
                ref={floatingButtonRef}
                onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
                aria-label={t('addElement', lang) || 'Add Element'}
                title={t('addElement', lang) || 'Add Element'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#2c2c2c',
                  border: '1px solid #3a3a3a',
                  color: '#f2f2f2',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = '#3a3a3a';
                }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = '#2c2c2c';
                }}
              >
                <Plus size={18} />
              </button>
            </div>
          ) : (
            <p style={{ margin: 0, color: '#a0a0a0', fontSize: '12px', lineHeight: '1.5' }}>
              {overlayConfig.mode === 'none' 
                ? t('overlayActivateFirst', lang) + t('overlayOptionsDescription', lang)
                : t('overlayOptionsDescription', lang)}
            </p>
          )}
        </div>

        {/* Custom Mode Content */}
        {overlayConfig.mode === 'custom' && (
          <>
            {/* Ultra Minimal Floating Add Menu */}
            {isFloatingMenuOpen && menuPosition && (
              <div
                ref={floatingMenuRef}
                style={{
                  position: 'absolute',
                  top: `${menuPosition.top}px`,
                  ...(menuPosition.left !== undefined 
                    ? { left: `${menuPosition.left}px` }
                    : { right: `${menuPosition.right}px` }
                  ),
                  width: '180px',
                  background: '#2c2c2c',
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px',
                  padding: '4px 0',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 1000,
                }}
              >
                {/* Add Reading */}
                <button
                  onClick={() => {
                    if (metricCount < MAX_OVERLAY_ELEMENTS && totalCount < MAX_OVERLAY_ELEMENTS) {
                      const newElement: OverlayElement = {
                        id: generateElementId(),
                        type: 'metric',
                        x: 0,
                        y: 0,
                        zIndex: overlayConfig.elements.length,
                        data: {
                          metric: 'cpuTemp' as OverlayMetricKey,
                          numberColor: 'rgba(255, 255, 255, 1)',
                          numberSize: 180,
                          textColor: 'transparent',
                          textSize: 0,
                          showLabel: false,
                        } as MetricElementData,
                      };
                      setSettings(addOverlayElement(settings, overlayConfig, newElement));
                      setIsFloatingMenuOpen(false);
                    }
                  }}
                  disabled={metricCount >= MAX_OVERLAY_ELEMENTS || totalCount >= MAX_OVERLAY_ELEMENTS}
                  style={{
                    height: '34px',
                    background: 'transparent',
                    border: 'none',
                    color: metricCount >= MAX_OVERLAY_ELEMENTS || totalCount >= MAX_OVERLAY_ELEMENTS ? '#a0a0a0' : '#f2f2f2',
                    cursor: metricCount >= MAX_OVERLAY_ELEMENTS || totalCount >= MAX_OVERLAY_ELEMENTS ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '10px',
                    padding: '0 12px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    if (metricCount < MAX_OVERLAY_ELEMENTS && totalCount < MAX_OVERLAY_ELEMENTS) {
                      e.currentTarget.style.background = '#3a3a3a';
                    }
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    if (metricCount < MAX_OVERLAY_ELEMENTS && totalCount < MAX_OVERLAY_ELEMENTS) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={16} />
                  </div>
                  <span>{t('addReading', lang)}</span>
                </button>

                {/* Add Text */}
                <button
                  onClick={() => {
                    if (textCount < MAX_OVERLAY_ELEMENTS && totalCount < MAX_OVERLAY_ELEMENTS) {
                      const newElement: OverlayElement = {
                        id: generateElementId(),
                        type: 'text',
                        x: 0,
                        y: 0,
                        zIndex: overlayConfig.elements.length,
                        data: {
                          text: 'Text',
                          textColor: 'rgba(255, 255, 255, 1)',
                          textSize: 45,
                        } as TextElementData,
                      };
                      setSettings(addOverlayElement(settings, overlayConfig, newElement));
                      setIsFloatingMenuOpen(false);
                    }
                  }}
                  disabled={textCount >= MAX_OVERLAY_ELEMENTS || totalCount >= MAX_OVERLAY_ELEMENTS}
                  style={{
                    height: '34px',
                    background: 'transparent',
                    border: 'none',
                    color: textCount >= MAX_OVERLAY_ELEMENTS || totalCount >= MAX_OVERLAY_ELEMENTS ? '#a0a0a0' : '#f2f2f2',
                    cursor: textCount >= MAX_OVERLAY_ELEMENTS || totalCount >= MAX_OVERLAY_ELEMENTS ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '10px',
                    padding: '0 12px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    if (textCount < MAX_OVERLAY_ELEMENTS && totalCount < MAX_OVERLAY_ELEMENTS) {
                      e.currentTarget.style.background = '#3a3a3a';
                    }
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    if (textCount < MAX_OVERLAY_ELEMENTS && totalCount < MAX_OVERLAY_ELEMENTS) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Type size={16} />
                  </div>
                  <span>{t('addText', lang)}</span>
                </button>

                {/* Add Divider */}
                <button
                  onClick={() => {
                    if (dividerCount < MAX_OVERLAY_ELEMENTS && totalCount < MAX_OVERLAY_ELEMENTS) {
                      const newElement: OverlayElement = {
                        id: generateElementId(),
                        type: 'divider',
                        x: 0,
                        y: 0,
                        zIndex: overlayConfig.elements.length,
                        data: {
                          width: 2,
                          height: 384,
                          color: 'rgba(255, 255, 255, 0.3)',
                        } as DividerElementData,
                      };
                      setSettings(addOverlayElement(settings, overlayConfig, newElement));
                      setIsFloatingMenuOpen(false);
                    }
                  }}
                  disabled={dividerCount >= MAX_OVERLAY_ELEMENTS || totalCount >= MAX_OVERLAY_ELEMENTS}
                  style={{
                    height: '34px',
                    background: 'transparent',
                    border: 'none',
                    color: dividerCount >= MAX_OVERLAY_ELEMENTS || totalCount >= MAX_OVERLAY_ELEMENTS ? '#a0a0a0' : '#f2f2f2',
                    cursor: dividerCount >= MAX_OVERLAY_ELEMENTS || totalCount >= MAX_OVERLAY_ELEMENTS ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '10px',
                    padding: '0 12px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    if (dividerCount < MAX_OVERLAY_ELEMENTS && totalCount < MAX_OVERLAY_ELEMENTS) {
                      e.currentTarget.style.background = '#3a3a3a';
                    }
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    if (dividerCount < MAX_OVERLAY_ELEMENTS && totalCount < MAX_OVERLAY_ELEMENTS) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={16} />
                  </div>
                  <span>{t('addDivider', lang)}</span>
                </button>

                {/* Divider */}
                <div style={{
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  margin: '4px 0',
                }} />

                {/* Add Overlay Presets */}
                <button
                  onClick={() => {
                    setIsOverlayPresetModalOpen(true);
                    setIsFloatingMenuOpen(false);
                  }}
                  style={{
                    height: '34px',
                    background: 'transparent',
                    border: 'none',
                    color: '#f2f2f2',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '10px',
                    padding: '0 12px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.background = '#3a3a3a';
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layout size={16} />
                  </div>
                  <span>{t('overlayPresetsButton', lang)}</span>
                </button>
              </div>
            )}


            {/* Empty State */}
            {overlayConfig.elements.length === 0 && (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#a0a0a0',
                fontSize: '13px',
                background: '#242424',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                position: 'relative',
              }}>
                <p style={{ margin: 0 }}>{t('noElements', lang)}</p>
                <button
                  ref={floatingButtonRef}
                  onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
                  aria-label={t('addElement', lang) || 'Add Element'}
                  title={t('addElement', lang) || 'Add Element'}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#2c2c2c',
                    border: '1px solid #3a3a3a',
                    color: '#f2f2f2',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.background = '#3a3a3a';
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.background = '#2c2c2c';
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
            )}

            {/* Elements List */}
            {overlayConfig.elements.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {overlayConfig.elements
                  .map((element, index) => ({ element, index }))
                  .sort((a, b) => (a.element.zIndex ?? a.index) - (b.element.zIndex ?? b.index))
                  .map(({ element }) => {
                    const sortedElements = [...overlayConfig.elements].sort((a, b) => (a.zIndex ?? overlayConfig.elements.indexOf(a)) - (b.zIndex ?? overlayConfig.elements.indexOf(b)));
                    const unifiedIndex = sortedElements.findIndex(el => el.id === element.id);

                    if (element.type === 'metric') {
                      const data = element.data as MetricElementData;
                      const metricIndex = metricElements.findIndex(el => el.id === element.id);
                      
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

                      const isCollapsed = collapsedElements.has(element.id);
                      const isSelected = selectedElementId === element.id;
                      
                      return (
                        <div 
                          key={element.id} 
                          className={isSelected ? 'overlay-element-item selected' : 'overlay-element-item'}
                          onClick={() => setSelectedElementId(element.id)}
                          style={{ 
                            padding: '8px',
                            background: '#242424',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {/* Compact Element Header */}
                          <div
                            onClick={() => setSelectedElementId(element.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: '36px',
                              marginBottom: isCollapsed ? '0' : '8px',
                              paddingBottom: isCollapsed ? '0' : '8px',
                              borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                              background: '#262626',
                              borderRadius: '4px',
                              padding: '0 4px',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCollapse(element.id);
                                }}
                                aria-label={isCollapsed ? t('expand', lang) || 'Expand' : t('collapse', lang) || 'Collapse'}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#a0a0a0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '2px',
                                  transition: 'transform 0.15s ease',
                                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                }}
                              >
                                <ChevronDown size={14} />
                              </button>
                              <span style={{ color: '#f2f2f2', fontSize: '13px', fontWeight: 600 }}>
                                {readingLabels[metricIndex] || `${metricIndex + 1}${metricIndex === 0 ? 'st' : metricIndex === 1 ? 'nd' : metricIndex === 2 ? 'rd' : 'th'} ${t('reading', lang)}`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {/* Remove Button - Outline Style with Red Icon */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  setRemoveModalState({
                                    isOpen: true,
                                    elementId: element.id,
                                    elementType: element.type,
                                  });
                                }}
                                aria-label={t('removeReading', lang) || t('removeText', lang) || t('removeDivider', lang) || 'Remove'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  background: 'transparent',
                                  border: '1px solid #3a3a3a',
                                  color: '#ff6b6b',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  padding: '0',
                                }}
                                data-tooltip-id="remove-reading-tooltip"
                                data-tooltip-content={t('removeReading', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.borderColor = '#ff6b6b';
                                  e.currentTarget.style.background = '#3a1f1f';
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.borderColor = '#3a3a3a';
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <X size={12} />
                              </button>
                              {/* Move Down Button - Icon Only */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex + 1));
                                  }
                                }}
                                disabled={unifiedIndex === sortedElements.length - 1}
                                aria-label={t('moveReadingDown', lang) || t('moveTextDown', lang) || t('moveDividerDown', lang) || 'Move Down'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  background: unifiedIndex === sortedElements.length - 1 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === sortedElements.length - 1 ? '#a0a0a0' : '#f2f2f2',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === sortedElements.length - 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  padding: '0',
                                }}
                                data-tooltip-id="move-down-tooltip"
                                data-tooltip-content={t('moveReadingDown', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    e.currentTarget.style.background = '#3a3a3a';
                                    e.currentTarget.style.borderColor = '#8a2be2';
                                  }
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    e.currentTarget.style.background = '#2c2c2c';
                                    e.currentTarget.style.borderColor = '#3a3a3a';
                                  }
                                }}
                              >
                                <ChevronDown size={12} />
                              </button>
                              {/* Move Up Button - Icon Only */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex > 0) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex - 1));
                                  }
                                }}
                                disabled={unifiedIndex === 0}
                                aria-label={t('moveReadingUp', lang) || 'Move Up'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  background: unifiedIndex === 0 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === 0 ? '#a0a0a0' : '#f2f2f2',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === 0 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  padding: '0',
                                }}
                                data-tooltip-id="move-up-tooltip"
                                data-tooltip-content={t('moveReadingUp', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex > 0) {
                                    e.currentTarget.style.background = '#3a3a3a';
                                    e.currentTarget.style.borderColor = '#8a2be2';
                                  }
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex > 0) {
                                    e.currentTarget.style.background = '#2c2c2c';
                                    e.currentTarget.style.borderColor = '#3a3a3a';
                                  }
                                }}
                              >
                                <ChevronUp size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Compact 2-Column Element Settings */}
                          {!isCollapsed && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {/* Sensor with Color on the right */}
                              <div className="setting-row">
                                <label 
                                  style={{ fontSize: '11px', cursor: 'help' }}
                                  data-tooltip-id={`sensor-tooltip-${element.id}`}
                                  data-tooltip-content={t('tooltipSensor', lang)}
                                >
                                  {t('sensor', lang) || t('reading', lang)}
                                </label>
                                <Tooltip id={`sensor-tooltip-${element.id}`} />
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                                  <select
                                    className="url-input"
                                    value={data.metric}
                                    onChange={(e) => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { metric: e.target.value as OverlayMetricKey }))}
                                    aria-label={t('sensor', lang) || t('reading', lang)}
                                    style={{ width: '134px' }}
                                  >
                                    {getMetricOptions().map(opt => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <div data-tooltip-id={`color-tooltip-${element.id}`} data-tooltip-content={t('tooltipColor', lang)}>
                                    <ColorPicker
                                      value={data.numberColor || '#ffffff'}
                                      onChange={(color) => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberColor: color }))}
                                    />
                                  </div>
                                  <Tooltip id={`color-tooltip-${element.id}`} />
                                </div>
                              </div>

                              {/* 2-Column Grid for other fields */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {/* Row 1: Size | Angle */}
                              <OverlayField
                                type="number"
                                label={t('size', lang)}
                                value={data.numberSize}
                                onChange={(value) => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberSize: value }))}
                                step={1}
                                labelTooltipId={`size-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipSize', lang)}
                              />
                              <OverlayField
                                type="number"
                                label={t('angle', lang)}
                                value={element.angle ?? 0}
                                onChange={(value) => setSettings(updateOverlayElementAngle(settings, overlayConfig, element.id, value))}
                                step={1}
                                min={0}
                                max={360}
                                labelTooltipId={`angle-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipAngle', lang)}
                              />

                              {/* Row 2: X Off | Y Off */}
                              <OverlayField
                                type="number"
                                label={t('customXOffset', lang)}
                                value={element.x}
                                onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, value, element.y))}
                                step={1}
                                labelTooltipId={`xoffset-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipXOffset', lang)}
                              />
                              <OverlayField
                                type="number"
                                label={t('customYOffset', lang)}
                                value={element.y}
                                onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, value))}
                                step={1}
                                labelTooltipId={`yoffset-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipYOffset', lang)}
                              />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else if (element.type === 'text') {
                      const data = element.data as TextElementData;
                      const textIndex = textElements.findIndex(el => el.id === element.id);
                      
                      const textLabels = [
                        t('firstText', lang),
                        t('secondText', lang),
                        t('thirdText', lang),
                        t('fourthText', lang),
                      ];

                      // Sanitize text input - remove HTML tags and dangerous characters
                      const sanitizeText = (input: string): string => {
                        let sanitized = input.replace(/<[^>]*>/g, '');
                        sanitized = sanitized.replace(/javascript:/gi, '');
                        sanitized = sanitized.replace(/on\w+\s*=/gi, '');
                        sanitized = sanitized.substring(0, 120);
                        return sanitized;
                      };

                      const isCollapsed = collapsedElements.has(element.id);
                      const isSelected = selectedElementId === element.id;
                      
                      return (
                        <div 
                          key={element.id} 
                          className={isSelected ? 'overlay-element-item selected' : 'overlay-element-item'}
                          onClick={() => setSelectedElementId(element.id)}
                          style={{ 
                            padding: '8px',
                            background: '#242424',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {/* Compact Element Header */}
                          <div
                            onClick={() => setSelectedElementId(element.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: '36px',
                              marginBottom: isCollapsed ? '0' : '8px',
                              paddingBottom: isCollapsed ? '0' : '8px',
                              borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                              background: '#262626',
                              borderRadius: '4px',
                              padding: '0 4px',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCollapse(element.id);
                                }}
                                aria-label={isCollapsed ? t('expand', lang) || 'Expand' : t('collapse', lang) || 'Collapse'}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#a0a0a0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '2px',
                                  transition: 'transform 0.15s ease',
                                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                }}
                              >
                                <ChevronDown size={14} />
                              </button>
                              <span style={{ color: '#f2f2f2', fontSize: '13px', fontWeight: 600 }}>
                                {textLabels[textIndex] || `${textIndex + 1}${textIndex === 0 ? 'st' : textIndex === 1 ? 'nd' : textIndex === 2 ? 'rd' : 'th'} ${t('text', lang)}`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {/* Remove Button - Outline Style with Red Icon */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  setRemoveModalState({
                                    isOpen: true,
                                    elementId: element.id,
                                    elementType: element.type,
                                  });
                                }}
                                aria-label={t('removeReading', lang) || t('removeText', lang) || t('removeDivider', lang) || 'Remove'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  background: 'transparent',
                                  border: '1px solid #3a3a3a',
                                  color: '#ff6b6b',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  padding: '0',
                                }}
                                data-tooltip-id="remove-text-tooltip"
                                data-tooltip-content={t('removeText', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.borderColor = '#ff6b6b';
                                  e.currentTarget.style.background = '#3a1f1f';
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.borderColor = '#3a3a3a';
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <X size={12} />
                              </button>
                              {/* Move Down Button - Icon Only */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex + 1));
                                  }
                                }}
                                disabled={unifiedIndex === sortedElements.length - 1}
                                aria-label={t('moveReadingDown', lang) || t('moveTextDown', lang) || t('moveDividerDown', lang) || 'Move Down'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  background: unifiedIndex === sortedElements.length - 1 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === sortedElements.length - 1 ? '#a0a0a0' : '#f2f2f2',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === sortedElements.length - 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  padding: '0',
                                }}
                                data-tooltip-id="move-text-down-tooltip"
                                data-tooltip-content={t('moveTextDown', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    e.currentTarget.style.background = '#3a3a3a';
                                    e.currentTarget.style.borderColor = '#8a2be2';
                                  }
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    e.currentTarget.style.background = '#2c2c2c';
                                    e.currentTarget.style.borderColor = '#3a3a3a';
                                  }
                                }}
                              >
                                <ChevronDown size={12} />
                              </button>
                              {/* Move Up Button - Icon Only */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex > 0) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex - 1));
                                  }
                                }}
                                disabled={unifiedIndex === 0}
                                aria-label={t('moveReadingUp', lang) || 'Move Up'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  background: unifiedIndex === 0 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === 0 ? '#a0a0a0' : '#f2f2f2',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === 0 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  padding: '0',
                                }}
                                data-tooltip-id="move-text-up-tooltip"
                                data-tooltip-content={t('moveTextUp', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex > 0) {
                                    e.currentTarget.style.background = '#3a3a3a';
                                    e.currentTarget.style.borderColor = '#8a2be2';
                                  }
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex > 0) {
                                    e.currentTarget.style.background = '#2c2c2c';
                                    e.currentTarget.style.borderColor = '#3a3a3a';
                                  }
                                }}
                              >
                                <ChevronUp size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Compact 2-Column Element Settings */}
                          {!isCollapsed && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {/* Combined Text + Color Input */}
                              <div className="setting-row">
                                <label 
                                  htmlFor={`text-input-${element.id}`} 
                                  style={{ fontSize: '11px', cursor: 'help' }}
                                  data-tooltip-id={`text-tooltip-${element.id}`}
                                  data-tooltip-content={t('tooltipText', lang)}
                                >
                                  {t('text', lang)}
                                </label>
                                <Tooltip id={`text-tooltip-${element.id}`} />
                                <CombinedTextColorInput
                                  id={`text-input-${element.id}`}
                                  text={data.text}
                                  onTextChange={(text) => {
                                    const sanitized = sanitizeText(text);
                                    setSettings(updateTextElementData(settings, overlayConfig, element.id, { text: sanitized }));
                                  }}
                                  color={data.textColor || '#ffffff'}
                                  onColorChange={(color) => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textColor: color }))}
                                  placeholder={t('textInputPlaceholder', lang)}
                                  maxLength={120}
                                  sanitizeText={sanitizeText}
                                  colorTooltipContent={t('tooltipColor', lang)}
                                />
                              </div>

                              {/* 2-Column Grid for other fields */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {/* Row 1: Size | Angle */}
                                <OverlayField
                                  type="number"
                                  label={t('size', lang)}
                                  value={data.textSize}
                                  onChange={(value) => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textSize: Math.max(6, value) }))}
                                  step={1}
                                  min={6}
                                  labelTooltipId={`text-size-tooltip-${element.id}`}
                                  labelTooltipContent={t('tooltipSize', lang)}
                                />
                                <OverlayField
                                  type="number"
                                  label={t('angle', lang)}
                                  value={element.angle ?? 0}
                                  onChange={(value) => setSettings(updateOverlayElementAngle(settings, overlayConfig, element.id, value))}
                                  step={1}
                                  min={0}
                                  max={360}
                                  labelTooltipId={`text-angle-tooltip-${element.id}`}
                                  labelTooltipContent={t('tooltipAngle', lang)}
                                />

                                {/* Row 2: X Off | Y Off */}
                                <OverlayField
                                  type="number"
                                  label={t('customXOffset', lang)}
                                  value={element.x}
                                  onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, value, element.y))}
                                  step={1}
                                  labelTooltipId={`text-xoffset-tooltip-${element.id}`}
                                  labelTooltipContent={t('tooltipXOffset', lang)}
                                />
                                <OverlayField
                                  type="number"
                                  label={t('customYOffset', lang)}
                                  value={element.y}
                                  onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, value))}
                                  step={1}
                                  labelTooltipId={`text-yoffset-tooltip-${element.id}`}
                                  labelTooltipContent={t('tooltipYOffset', lang)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else if (element.type === 'divider') {
                      const data = element.data as DividerElementData;
                      const dividerIndex = dividerElements.findIndex(el => el.id === element.id);
                      
                      const dividerLabels = [
                        t('firstDivider', lang),
                        t('secondDivider', lang),
                        t('thirdDivider', lang),
                        t('fourthDivider', lang),
                      ];

                      const isCollapsed = collapsedElements.has(element.id);
                      const isSelected = selectedElementId === element.id;
                      
                      return (
                        <div 
                          key={element.id} 
                          className={isSelected ? 'overlay-element-item selected' : 'overlay-element-item'}
                          onClick={() => setSelectedElementId(element.id)}
                          style={{ 
                            padding: '8px',
                            background: '#242424',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {/* Compact Element Header */}
                          <div
                            onClick={() => setSelectedElementId(element.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: '36px',
                              marginBottom: isCollapsed ? '0' : '8px',
                              paddingBottom: isCollapsed ? '0' : '8px',
                              borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                              background: '#262626',
                              borderRadius: '4px',
                              padding: '0 4px',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCollapse(element.id);
                                }}
                                aria-label={isCollapsed ? t('expand', lang) || 'Expand' : t('collapse', lang) || 'Collapse'}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#a0a0a0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '2px',
                                  transition: 'transform 0.15s ease',
                                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                }}
                              >
                                <ChevronDown size={14} />
                              </button>
                              <span style={{ color: '#f2f2f2', fontSize: '13px', fontWeight: 600 }}>
                                {dividerLabels[dividerIndex] || `${dividerIndex + 1}${dividerIndex === 0 ? 'st' : dividerIndex === 1 ? 'nd' : dividerIndex === 2 ? 'rd' : 'th'} ${t('divider', lang)}`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {/* Remove Button - Outline Style with Red Icon */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  setRemoveModalState({
                                    isOpen: true,
                                    elementId: element.id,
                                    elementType: element.type,
                                  });
                                }}
                                aria-label={t('removeReading', lang) || t('removeText', lang) || t('removeDivider', lang) || 'Remove'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  background: 'transparent',
                                  border: '1px solid #3a3a3a',
                                  color: '#ff6b6b',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  padding: '0',
                                }}
                                data-tooltip-id="remove-divider-tooltip"
                                data-tooltip-content={t('removeDivider', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.borderColor = '#ff6b6b';
                                  e.currentTarget.style.background = '#3a1f1f';
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.borderColor = '#3a3a3a';
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <X size={12} />
                              </button>
                              {/* Move Down Button - Icon Only */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex + 1));
                                  }
                                }}
                                disabled={unifiedIndex === sortedElements.length - 1}
                                aria-label={t('moveReadingDown', lang) || t('moveTextDown', lang) || t('moveDividerDown', lang) || 'Move Down'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  background: unifiedIndex === sortedElements.length - 1 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === sortedElements.length - 1 ? '#a0a0a0' : '#f2f2f2',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === sortedElements.length - 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  padding: '0',
                                }}
                                data-tooltip-id="move-divider-down-tooltip"
                                data-tooltip-content={t('moveDividerDown', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    e.currentTarget.style.background = '#3a3a3a';
                                    e.currentTarget.style.borderColor = '#8a2be2';
                                  }
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    e.currentTarget.style.background = '#2c2c2c';
                                    e.currentTarget.style.borderColor = '#3a3a3a';
                                  }
                                }}
                              >
                                <ChevronDown size={12} />
                              </button>
                              {/* Move Up Button - Icon Only */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex > 0) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex - 1));
                                  }
                                }}
                                disabled={unifiedIndex === 0}
                                aria-label={t('moveReadingUp', lang) || 'Move Up'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  background: unifiedIndex === 0 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === 0 ? '#a0a0a0' : '#f2f2f2',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === 0 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  padding: '0',
                                }}
                                data-tooltip-id="move-divider-up-tooltip"
                                data-tooltip-content={t('moveDividerUp', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex > 0) {
                                    e.currentTarget.style.background = '#3a3a3a';
                                    e.currentTarget.style.borderColor = '#8a2be2';
                                  }
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  if (unifiedIndex > 0) {
                                    e.currentTarget.style.background = '#2c2c2c';
                                    e.currentTarget.style.borderColor = '#3a3a3a';
                                  }
                                }}
                              >
                                <ChevronUp size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Compact 2-Column Element Settings */}
                          {!isCollapsed && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              {/* Row 1: Color | Width */}
                              <OverlayField
                                type="color"
                                label={t('color', lang)}
                                value={data.color}
                                onChange={(color) => setSettings(updateDividerElementData(settings, overlayConfig, element.id, { color }))}
                                labelTooltipId={`divider-color-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipColor', lang)}
                              />
                              <OverlayField
                                type="number"
                                label={t('thickness', lang) || 'Width'}
                                value={data.width}
                                onChange={(value) => setSettings(updateDividerElementData(settings, overlayConfig, element.id, { width: Math.max(1, Math.min(400, value)) }))}
                                step={1}
                                min={1}
                                max={400}
                                labelTooltipId={`thickness-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipThickness', lang)}
                              />

                              {/* Row 2: Height | Angle */}
                              <OverlayField
                                type="number"
                                label={t('dividerLength', lang) || 'Length'}
                                value={data.height}
                                onChange={(value) => setSettings(updateDividerElementData(settings, overlayConfig, element.id, { height: Math.max(10, Math.min(640, value)) }))}
                                step={1}
                                min={10}
                                max={640}
                                labelTooltipId={`divider-length-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipDividerLength', lang)}
                              />
                              <OverlayField
                                type="number"
                                label={t('angle', lang)}
                                value={element.angle ?? 0}
                                onChange={(value) => setSettings(updateOverlayElementAngle(settings, overlayConfig, element.id, value))}
                                step={1}
                                min={0}
                                max={360}
                                labelTooltipId={`divider-angle-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipAngle', lang)}
                              />

                              {/* Row 3: X Off | Y Off */}
                              <OverlayField
                                type="number"
                                label={t('customXOffset', lang)}
                                value={element.x}
                                onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, value, element.y))}
                                step={1}
                                labelTooltipId={`divider-xoffset-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipXOffset', lang)}
                              />
                              <OverlayField
                                type="number"
                                label={t('customYOffset', lang)}
                                value={element.y}
                                onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, value))}
                                step={1}
                                labelTooltipId={`divider-yoffset-tooltip-${element.id}`}
                                labelTooltipContent={t('tooltipYOffset', lang)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            )}

            {/* Overlay Preset Footer */}
            {overlayConfig.mode === 'custom' && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#242424',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".nzxt-esc-overlay-preset"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                }}>
                  <button
                    onClick={handleExportOverlay}
                    disabled={overlayConfig.elements.length === 0}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      background: overlayConfig.elements.length === 0 ? '#252525' : '#2c2c2c',
                      border: '1px solid #3a3a3a',
                      color: overlayConfig.elements.length === 0 ? '#a0a0a0' : '#f2f2f2',
                      borderRadius: '6px',
                      cursor: overlayConfig.elements.length === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                      if (overlayConfig.elements.length > 0) {
                        e.currentTarget.style.background = '#3a3a3a';
                        e.currentTarget.style.borderColor = '#8a2be2';
                      }
                    }}
                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                      if (overlayConfig.elements.length > 0) {
                        e.currentTarget.style.background = '#2c2c2c';
                        e.currentTarget.style.borderColor = '#3a3a3a';
                      }
                    }}
                  >
                    {t('overlayExportButton', lang)}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      background: '#2c2c2c',
                      border: '1px solid #3a3a3a',
                      color: '#f2f2f2',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = '#3a3a3a';
                      e.currentTarget.style.borderColor = '#8a2be2';
                    }}
                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = '#2c2c2c';
                      e.currentTarget.style.borderColor = '#3a3a3a';
                    }}
                  >
                    {t('overlayImportButton', lang)}
                  </button>
                </div>
                <p style={{
                  margin: 0,
                  color: '#a0a0a0',
                  fontSize: '11px',
                  lineHeight: '1.5',
                  textAlign: 'center',
                }}>
                  {t('overlayFooterDescription', lang)}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={performReset}
        lang={lang}
      />

      {/* Remove Confirmation Modal */}
      {removeModalState.elementId && removeModalState.elementType && (
        <RemoveConfirmationModal
          isOpen={removeModalState.isOpen}
          onClose={() => setRemoveModalState({ isOpen: false, elementId: null, elementType: null })}
          onConfirm={() => {
            if (removeModalState.elementId) {
              setSettings(removeOverlayElement(settings, overlayConfig, removeModalState.elementId));
            }
          }}
          lang={lang}
          elementType={removeModalState.elementType}
        />
      )}

      {/* Import Overlay Modal */}
      <ImportOverlayModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportedElements([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        onImport={handleImportOverlay}
        importedElements={importedElements}
        currentElementCount={overlayConfig.elements.length}
        lang={lang}
      />

      {/* Overlay Preset Picker Modal */}
      <OverlayPresetPickerModal
        isOpen={isOverlayPresetModalOpen}
        onClose={() => setIsOverlayPresetModalOpen(false)}
        onSelect={handleOverlayPresetSelect}
        lang={lang}
      />
    </div>
  );
}
