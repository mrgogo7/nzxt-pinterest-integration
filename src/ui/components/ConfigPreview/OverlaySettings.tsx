import type { MouseEvent, ChangeEvent } from 'react';
import { useState } from 'react';
import { ChevronUp, ChevronDown, Plus, X, ChevronRight } from 'lucide-react';
import type { AppSettings } from '../../../constants/defaults';
import { DEFAULT_OVERLAY, type Overlay, type OverlayMetricKey, type OverlayElement, type MetricElementData, type TextElementData, type DividerElementData } from '../../../types/overlay';
import type { Lang, t as tFunction } from '../../../i18n';
import { addOverlayElement, removeOverlayElement, reorderOverlayElements, updateMetricElementData, updateTextElementData, updateDividerElementData, updateOverlayElementPosition, updateOverlayElementAngle } from '../../../utils/overlaySettingsHelpers';
import OverlayField from './OverlayField';
import ResetButton from './ResetButton';

interface OverlaySettingsProps {
  overlayConfig: Overlay;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  lang: Lang;
  t: typeof tFunction;
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
}: OverlaySettingsProps) {
  // Helper: Get metric, text, and divider element counts
  const metricElements = overlayConfig.elements.filter(el => el.type === 'metric');
  const textElements = overlayConfig.elements.filter(el => el.type === 'text');
  const dividerElements = overlayConfig.elements.filter(el => el.type === 'divider');
  const metricCount = metricElements.length;
  const textCount = textElements.length;
  const dividerCount = dividerElements.length;
  const totalCount = overlayConfig.elements.length;

  // State for Add Element menu expansion
  const [isAddElementExpanded, setIsAddElementExpanded] = useState(false);

  // Helper: Generate unique element ID
  const generateElementId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

  // Helper: Reset overlay to DEFAULT_OVERLAY
  const handleResetToDefaults = () => {
    setSettings({
      ...settings,
      overlay: { ...DEFAULT_OVERLAY },
    });
  };

  return (
    <div className="settings-column overlay-options-area">
      <div className="panel">
        {/* Header with Mode Switch */}
        <div className="panel-header">
          <h3>{overlayConfig.mode === 'custom' ? t('overlaySettingsTitle', lang) : t('overlayTitle', lang)}</h3>
          <div className="overlay-toggle-compact">
            <span>{overlayConfig.mode === 'custom' ? t('overlayStatusActive', lang) : t('overlayStatusOff', lang)}</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={overlayConfig.mode === 'custom'}
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
          <p style={{ margin: 0, color: '#a0a0a0', fontSize: '12px', lineHeight: '1.5' }}>
            {overlayConfig.mode === 'none' 
              ? t('overlayActivateFirst', lang) + t('overlayOptionsDescription', lang)
              : t('overlayOptionsDescription', lang)}
          </p>
        </div>

        {/* Custom Mode Content */}
        {overlayConfig.mode === 'custom' && (
          <>
            {/* Add Element Grouped Menu */}
            <div style={{ 
              marginBottom: '20px',
            }}>
              {/* Add Element Header */}
              <button
                onClick={() => setIsAddElementExpanded(!isAddElementExpanded)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#2c2c2c',
                  border: '1px solid #3a3a3a',
                  color: '#f2f2f2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={16} />
                  {t('addElement', lang) || 'Add Element'}
                </span>
                <ChevronRight 
                  size={16} 
                  style={{ 
                    transform: isAddElementExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                  }} 
                />
              </button>

              {/* Add Element Options (Expandable) */}
              {isAddElementExpanded && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  background: '#252525',
                  borderRadius: '6px',
                  border: '1px solid #2e2e2e',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  <button
                onClick={() => {
                  if (metricCount < 8 && totalCount < 8) {
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
                  }
                }}
                disabled={metricCount >= 8 || totalCount >= 8}
                style={{
                  background: metricCount >= 8 || totalCount >= 8 ? '#252525' : '#2c2c2c',
                  border: '1px solid #3a3a3a',
                  color: metricCount >= 8 || totalCount >= 8 ? '#a0a0a0' : '#f2f2f2',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: metricCount >= 8 || totalCount >= 8 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                  if (metricCount < 8 && totalCount < 8) {
                    e.currentTarget.style.background = '#3a3a3a';
                    e.currentTarget.style.borderColor = '#8a2be2';
                  }
                }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                  if (metricCount < 8 && totalCount < 8) {
                    e.currentTarget.style.background = '#2c2c2c';
                    e.currentTarget.style.borderColor = '#3a3a3a';
                  }
                }}
              >
                <Plus size={16} />
                {t('addReading', lang)}
              </button>
              <button
                onClick={() => {
                  if (textCount < 8 && totalCount < 8) {
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
                  }
                }}
                disabled={textCount >= 8 || totalCount >= 8}
                style={{
                  background: textCount >= 8 || totalCount >= 8 ? '#252525' : '#2c2c2c',
                  border: '1px solid #3a3a3a',
                  color: textCount >= 8 || totalCount >= 8 ? '#a0a0a0' : '#f2f2f2',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: textCount >= 8 || totalCount >= 8 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                  if (textCount < 8 && totalCount < 8) {
                    e.currentTarget.style.background = '#3a3a3a';
                    e.currentTarget.style.borderColor = '#8a2be2';
                  }
                }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                  if (textCount < 8 && totalCount < 8) {
                    e.currentTarget.style.background = '#2c2c2c';
                    e.currentTarget.style.borderColor = '#3a3a3a';
                  }
                }}
              >
                <Plus size={16} />
                {t('addText', lang)}
              </button>
              <button
                onClick={() => {
                  if (dividerCount < 8 && totalCount < 8) {
                    const newElement: OverlayElement = {
                      id: generateElementId(),
                      type: 'divider',
                      x: 0,
                      y: 0,
                      zIndex: overlayConfig.elements.length,
                      data: {
                        width: 2, // Rectangle width in pixels (thickness)
                        height: 384, // Rectangle height in pixels (length) - 60% of 640px LCD
                        color: 'rgba(255, 255, 255, 0.3)',
                      } as DividerElementData,
                    };
                    setSettings(addOverlayElement(settings, overlayConfig, newElement));
                  }
                }}
                disabled={dividerCount >= 8 || totalCount >= 8}
                style={{
                  background: dividerCount >= 8 || totalCount >= 8 ? '#252525' : '#2c2c2c',
                  border: '1px solid #3a3a3a',
                  color: dividerCount >= 8 || totalCount >= 8 ? '#a0a0a0' : '#f2f2f2',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: dividerCount >= 8 || totalCount >= 8 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                  if (dividerCount < 8 && totalCount < 8) {
                    e.currentTarget.style.background = '#3a3a3a';
                    e.currentTarget.style.borderColor = '#8a2be2';
                  }
                }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                  if (dividerCount < 8 && totalCount < 8) {
                    e.currentTarget.style.background = '#2c2c2c';
                    e.currentTarget.style.borderColor = '#3a3a3a';
                  }
                }}
              >
                <Plus size={16} />
                {t('addDivider', lang)}
                  </button>
                </div>
              )}
            </div>

            {/* Reset to Defaults Button */}
            {overlayConfig.elements.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={handleResetToDefaults}
                  data-tooltip-id="revert-to-defaults-tooltip"
                  data-tooltip-content={t('revertToDefaults', lang)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
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
                  {t('revertToDefaults', lang)}
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
                background: '#252525',
                borderRadius: '6px',
                border: '1px solid #2e2e2e',
              }}>
                {t('noElements', lang)}
              </div>
            )}

            {/* Elements List */}
            {overlayConfig.elements.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

                      return (
                        <div 
                          key={element.id} 
                          style={{ 
                            padding: '16px',
                            background: '#252525',
                            borderRadius: '6px',
                            border: '1px solid #2e2e2e',
                          }}
                        >
                          {/* Element Header */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '16px',
                              paddingBottom: '12px',
                              borderBottom: '1px solid #2e2e2e',
                            }}
                          >
                            <span style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
                              {readingLabels[metricIndex] || `${metricIndex + 1}${metricIndex === 0 ? 'st' : metricIndex === 1 ? 'nd' : metricIndex === 2 ? 'rd' : 'th'} ${t('reading', lang)}`}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {/* Move Up Button */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex > 0) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex - 1));
                                  }
                                }}
                                disabled={unifiedIndex === 0}
                                style={{
                                  background: unifiedIndex === 0 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === 0 ? '#a0a0a0' : '#f2f2f2',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === 0 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.15s ease',
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
                                <ChevronUp size={14} />
                              </button>
                              {/* Move Down Button */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex + 1));
                                  }
                                }}
                                disabled={unifiedIndex === sortedElements.length - 1}
                                style={{
                                  background: unifiedIndex === sortedElements.length - 1 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === sortedElements.length - 1 ? '#a0a0a0' : '#f2f2f2',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === sortedElements.length - 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.15s ease',
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
                                <ChevronDown size={14} />
                              </button>
                              {/* Remove Button */}
                              <button
                                onClick={() => {
                                  setSettings(removeOverlayElement(settings, overlayConfig, element.id));
                                }}
                                style={{
                                  background: '#3a1f1f',
                                  border: '1px solid #5a2a2a',
                                  color: '#ff6b6b',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.15s ease',
                                  marginLeft: '6px',
                                }}
                                data-tooltip-id="remove-reading-tooltip"
                                data-tooltip-content={t('removeReading', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.background = '#4a2f2f';
                                  e.currentTarget.style.borderColor = '#6a3a3a';
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.background = '#3a1f1f';
                                  e.currentTarget.style.borderColor = '#5a2a2a';
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Element Settings */}
                          <div className="settings-grid-modern">
                            {/* Metric Selection */}
                            <OverlayField
                              type="select"
                              label={t('reading', lang)}
                              value={data.metric}
                              onChange={(value) => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { metric: value as OverlayMetricKey }))}
                              onReset={() => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { metric: 'cpuTemp' as OverlayMetricKey }))}
                              options={getMetricOptions()}
                              lang={lang}
                              t={t}
                            />

                            {/* Number Color */}
                            <OverlayField
                              type="color"
                              label={t('color', lang)}
                              value={data.numberColor}
                              onChange={(color) => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberColor: color }))}
                              onReset={() => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberColor: 'rgba(255, 255, 255, 1)' }))}
                              lang={lang}
                              t={t}
                            />

                            {/* Number Size */}
                            <OverlayField
                              type="number"
                              label={t('size', lang)}
                              value={data.numberSize}
                              onChange={(value) => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberSize: value }))}
                              onReset={() => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberSize: 180 }))}
                              lang={lang}
                              t={t}
                            />

                            {/* X Offset */}
                            <OverlayField
                              type="number"
                              label={t('customXOffset', lang)}
                              value={element.x}
                              onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, value, element.y))}
                              onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, 0, element.y))}
                              lang={lang}
                              t={t}
                            />

                            {/* Y Offset */}
                            <OverlayField
                              type="number"
                              label={t('customYOffset', lang)}
                              value={element.y}
                              onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, value))}
                              onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, 0))}
                              lang={lang}
                              t={t}
                            />

                            {/* Angle */}
                            <OverlayField
                              type="number"
                              label={t('angle', lang)}
                              value={element.angle ?? 0}
                              onChange={(value) => setSettings(updateOverlayElementAngle(settings, overlayConfig, element.id, value))}
                              onReset={() => setSettings(updateOverlayElementAngle(settings, overlayConfig, element.id, 0))}
                              lang={lang}
                              t={t}
                              min={0}
                              max={360}
                            />
                          </div>
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

                      return (
                        <div 
                          key={element.id} 
                          style={{ 
                            padding: '16px',
                            background: '#252525',
                            borderRadius: '6px',
                            border: '1px solid #2e2e2e',
                          }}
                        >
                          {/* Element Header */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '16px',
                              paddingBottom: '12px',
                              borderBottom: '1px solid #2e2e2e',
                            }}
                          >
                            <span style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
                              {textLabels[textIndex] || `${textIndex + 1}${textIndex === 0 ? 'st' : textIndex === 1 ? 'nd' : textIndex === 2 ? 'rd' : 'th'} ${t('text', lang)}`}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {/* Move Up Button */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex > 0) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex - 1));
                                  }
                                }}
                                disabled={unifiedIndex === 0}
                                style={{
                                  background: unifiedIndex === 0 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === 0 ? '#a0a0a0' : '#f2f2f2',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === 0 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.15s ease',
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
                                <ChevronUp size={14} />
                              </button>
                              {/* Move Down Button */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex + 1));
                                  }
                                }}
                                disabled={unifiedIndex === sortedElements.length - 1}
                                style={{
                                  background: unifiedIndex === sortedElements.length - 1 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === sortedElements.length - 1 ? '#a0a0a0' : '#f2f2f2',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === sortedElements.length - 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.15s ease',
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
                                <ChevronDown size={14} />
                              </button>
                              {/* Remove Button */}
                              <button
                                onClick={() => {
                                  setSettings(removeOverlayElement(settings, overlayConfig, element.id));
                                }}
                                style={{
                                  background: '#3a1f1f',
                                  border: '1px solid #5a2a2a',
                                  color: '#ff6b6b',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.15s ease',
                                  marginLeft: '6px',
                                }}
                                data-tooltip-id="remove-text-tooltip"
                                data-tooltip-content={t('removeText', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.background = '#4a2f2f';
                                  e.currentTarget.style.borderColor = '#6a3a3a';
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.background = '#3a1f1f';
                                  e.currentTarget.style.borderColor = '#5a2a2a';
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Element Settings */}
                          <div className="settings-grid-modern">
                            {/* Text Input */}
                            <div className="setting-row">
                              <label>{t('text', lang)}</label>
                              <input
                                type="text"
                                value={data.text}
                                maxLength={120}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                  const sanitized = sanitizeText(e.target.value);
                                  setSettings(updateTextElementData(settings, overlayConfig, element.id, { text: sanitized }));
                                }}
                                className="url-input"
                                placeholder={t('textInputPlaceholder', lang)}
                              />
                              <ResetButton
                                onClick={() => setSettings(updateTextElementData(settings, overlayConfig, element.id, { text: '' }))}
                                tooltipContent={t('resetToDefault', lang)}
                              />
                            </div>

                            {/* Text Color */}
                            <OverlayField
                              type="color"
                              label={t('color', lang)}
                              value={data.textColor}
                              onChange={(color) => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textColor: color }))}
                              onReset={() => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textColor: 'rgba(255, 255, 255, 1)' }))}
                              lang={lang}
                              t={t}
                            />

                            {/* Text Size */}
                            <OverlayField
                              type="number"
                              label={t('size', lang)}
                              value={data.textSize}
                              onChange={(value) => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textSize: Math.max(6, value) }))}
                              onReset={() => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textSize: 45 }))}
                              min={6}
                              lang={lang}
                              t={t}
                            />

                            {/* X Offset */}
                            <OverlayField
                              type="number"
                              label={t('customXOffset', lang)}
                              value={element.x}
                              onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, value, element.y))}
                              onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, 0, element.y))}
                              lang={lang}
                              t={t}
                            />

                            {/* Y Offset */}
                            <OverlayField
                              type="number"
                              label={t('customYOffset', lang)}
                              value={element.y}
                              onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, value))}
                              onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, 0))}
                              lang={lang}
                              t={t}
                            />

                            {/* Angle */}
                            <OverlayField
                              type="number"
                              label={t('angle', lang)}
                              value={element.angle ?? 0}
                              onChange={(value) => setSettings(updateOverlayElementAngle(settings, overlayConfig, element.id, value))}
                              onReset={() => setSettings(updateOverlayElementAngle(settings, overlayConfig, element.id, 0))}
                              lang={lang}
                              t={t}
                              min={0}
                              max={360}
                            />
                          </div>
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

                      return (
                        <div 
                          key={element.id} 
                          style={{ 
                            padding: '16px',
                            background: '#252525',
                            borderRadius: '6px',
                            border: '1px solid #2e2e2e',
                          }}
                        >
                          {/* Element Header */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '16px',
                              paddingBottom: '12px',
                              borderBottom: '1px solid #2e2e2e',
                            }}
                          >
                            <span style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
                              {dividerLabels[dividerIndex] || `${dividerIndex + 1}${dividerIndex === 0 ? 'st' : dividerIndex === 1 ? 'nd' : dividerIndex === 2 ? 'rd' : 'th'} ${t('divider', lang)}`}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {/* Move Up Button */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex > 0) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex - 1));
                                  }
                                }}
                                disabled={unifiedIndex === 0}
                                style={{
                                  background: unifiedIndex === 0 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === 0 ? '#a0a0a0' : '#f2f2f2',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === 0 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.15s ease',
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
                                <ChevronUp size={14} />
                              </button>
                              {/* Move Down Button */}
                              <button
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (unifiedIndex < sortedElements.length - 1) {
                                    setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex + 1));
                                  }
                                }}
                                disabled={unifiedIndex === sortedElements.length - 1}
                                style={{
                                  background: unifiedIndex === sortedElements.length - 1 ? '#252525' : '#2c2c2c',
                                  border: '1px solid #3a3a3a',
                                  color: unifiedIndex === sortedElements.length - 1 ? '#a0a0a0' : '#f2f2f2',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: unifiedIndex === sortedElements.length - 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.15s ease',
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
                                <ChevronDown size={14} />
                              </button>
                              {/* Remove Button */}
                              <button
                                onClick={() => {
                                  setSettings(removeOverlayElement(settings, overlayConfig, element.id));
                                }}
                                style={{
                                  background: '#3a1f1f',
                                  border: '1px solid #5a2a2a',
                                  color: '#ff6b6b',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.15s ease',
                                  marginLeft: '6px',
                                }}
                                data-tooltip-id="remove-divider-tooltip"
                                data-tooltip-content={t('removeDivider', lang)}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.background = '#4a2f2f';
                                  e.currentTarget.style.borderColor = '#6a3a3a';
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                  e.currentTarget.style.background = '#3a1f1f';
                                  e.currentTarget.style.borderColor = '#5a2a2a';
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Element Settings */}
                          <div className="settings-grid-modern">
                            {/* Divider Color */}
                            <OverlayField
                              type="color"
                              label={t('color', lang)}
                              value={data.color}
                              onChange={(color) => setSettings(updateDividerElementData(settings, overlayConfig, element.id, { color }))}
                              onReset={() => setSettings(updateDividerElementData(settings, overlayConfig, element.id, { color: 'rgba(255, 255, 255, 0.3)' }))}
                              lang={lang}
                              t={t}
                            />

                            {/* Divider Width (Thickness) */}
                            <OverlayField
                              type="number"
                              label={t('thickness', lang) || 'Width'}
                              value={data.width}
                              onChange={(value) => setSettings(updateDividerElementData(settings, overlayConfig, element.id, { width: Math.max(1, Math.min(400, value)) }))}
                              onReset={() => setSettings(updateDividerElementData(settings, overlayConfig, element.id, { width: 2 }))}
                              min={1}
                              max={400}
                              lang={lang}
                              t={t}
                            />

                            {/* Divider Height (Length) */}
                            <OverlayField
                              type="number"
                              label={t('dividerLength', lang) || 'Length'}
                              value={data.height}
                              onChange={(value) => setSettings(updateDividerElementData(settings, overlayConfig, element.id, { height: Math.max(10, Math.min(640, value)) }))}
                              onReset={() => setSettings(updateDividerElementData(settings, overlayConfig, element.id, { height: 384 }))}
                              min={10}
                              max={640}
                              lang={lang}
                              t={t}
                            />

                            {/* X Offset */}
                            <OverlayField
                              type="number"
                              label={t('customXOffset', lang)}
                              value={element.x}
                              onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, value, element.y))}
                              onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, 0, element.y))}
                              lang={lang}
                              t={t}
                            />

                            {/* Y Offset */}
                            <OverlayField
                              type="number"
                              label={t('customYOffset', lang)}
                              value={element.y}
                              onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, value))}
                              onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, 0))}
                              lang={lang}
                              t={t}
                            />

                            {/* Angle */}
                            <OverlayField
                              type="number"
                              label={t('angle', lang)}
                              value={element.angle ?? 0}
                              onChange={(value) => setSettings(updateOverlayElementAngle(settings, overlayConfig, element.id, value))}
                              onReset={() => setSettings(updateOverlayElementAngle(settings, overlayConfig, element.id, 0))}
                              lang={lang}
                              t={t}
                              min={0}
                              max={360}
                            />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
