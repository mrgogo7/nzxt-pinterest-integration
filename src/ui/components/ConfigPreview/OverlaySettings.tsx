import type { MouseEvent, ChangeEvent } from 'react';
import { ChevronUp, ChevronDown, Plus, X } from 'lucide-react';
import type { AppSettings } from '../../../constants/defaults';
import { type Overlay, type OverlayMetricKey, type OverlayElement, type MetricElementData, type TextElementData } from '../../../types/overlay';
import type { Lang, t as tFunction } from '../../../i18n';
import { addOverlayElement, removeOverlayElement, reorderOverlayElements, updateMetricElementData, updateTextElementData, updateOverlayElementPosition } from '../../../utils/overlaySettingsHelpers';
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
 * FAZ1: Element-based overlay settings - uses unified element array.
 */
export default function OverlaySettingsComponent({
  overlayConfig,
  settings,
  setSettings,
  lang,
  t,
}: OverlaySettingsProps) {
  // Helper: Get metric and text element counts
  const metricElements = overlayConfig.elements.filter(el => el.type === 'metric');
  const textElements = overlayConfig.elements.filter(el => el.type === 'text');
  const metricCount = metricElements.length;
  const textCount = textElements.length;
  const totalCount = overlayConfig.elements.length;

  // Helper: Generate unique element ID
  const generateElementId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="settings-column overlay-options-area">
      <div className="panel">
        <div className="panel-header">
          <h3>{t('overlaySettingsTitle', lang)}</h3>
          {/* Overlay Mode - FAZ1: Only none and custom modes */}
          <select
            className="url-input select-narrow"
            value={overlayConfig.mode}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              const newMode = e.target.value as "none" | "custom";
              setSettings({
                ...settings,
                overlay: {
                  ...overlayConfig,
                  mode: newMode,
                  elements: newMode === 'none' ? [] : overlayConfig.elements,
                },
              });
            }}
          >
            <option value="none">None</option>
            <option value="custom">{t('customMode', lang)}</option>
          </select>
        </div>

        {/* Description and Revert button */}
        <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, color: '#9aa3ad', fontSize: '12px', lineHeight: '1.4' }}>
            {t('overlayOptionsDescription', lang)}
          </p>
          {overlayConfig.mode === 'custom' && (
            <span
              data-tooltip-id="revert-to-defaults-tooltip"
              data-tooltip-content={overlayConfig.mode === 'custom' ? t('revertToDefaultsCustom', lang) : t('revertToDefaults', lang)}
              onClick={() => {
                // Custom mode: reset all element data to defaults, keep elements
                const resetElements = overlayConfig.elements.map((element, index) => {
                  if (element.type === 'metric') {
                    const data = element.data as MetricElementData;
                    return {
                      ...element,
                      x: 0,
                      y: 0,
                      zIndex: index,
                      data: {
                        ...data,
                        metric: 'cpuTemp' as OverlayMetricKey,
                        numberColor: 'rgba(255, 255, 255, 1)',
                        numberSize: 180,
                        textColor: 'transparent',
                        textSize: 0,
                        showLabel: false,
                      },
                    };
                  } else if (element.type === 'text') {
                    const data = element.data as TextElementData;
                    return {
                      ...element,
                      x: 0,
                      y: 0,
                      zIndex: index,
                      data: {
                        ...data,
                        text: '',
                        textColor: 'rgba(255, 255, 255, 1)',
                        textSize: 45,
                      },
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
              onMouseEnter={(e: MouseEvent<HTMLSpanElement>) => {
                e.currentTarget.style.color = '#7ab3ff';
              }}
              onMouseLeave={(e: MouseEvent<HTMLSpanElement>) => {
                e.currentTarget.style.color = '#5a9aff';
              }}
            >
              {t('revertToDefaults', lang)}
            </span>
          )}
        </div>

        <div className="settings-grid-modern">
          {/* FAZ1: Mode-specific settings (single/dual/triple) removed - only custom mode UI remains */}
          {/* CUSTOM MODE UI - Element-based */}
          {overlayConfig.mode === 'custom' && (
            <>
              {/* Add Reading and Add Text Buttons */}
              <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
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
                    background: metricCount >= 8 || totalCount >= 8 ? '#1a1f2e' : '#263146',
                    border: '1px solid #3b5a9a',
                    color: metricCount >= 8 || totalCount >= 8 ? '#5a6b7d' : '#d9e6ff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: metricCount >= 8 || totalCount >= 8 ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                    flex: 1,
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    if (metricCount < 8 && totalCount < 8) {
                      e.currentTarget.style.background = '#2e3a55';
                    }
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    if (metricCount < 8 && totalCount < 8) {
                      e.currentTarget.style.background = '#263146';
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
                    background: textCount >= 8 || totalCount >= 8 ? '#1a1f2e' : '#263146',
                    border: '1px solid #3b5a9a',
                    color: textCount >= 8 || totalCount >= 8 ? '#5a6b7d' : '#d9e6ff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: textCount >= 8 || totalCount >= 8 ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                    flex: 1,
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    if (textCount < 8 && totalCount < 8) {
                      e.currentTarget.style.background = '#2e3a55';
                    }
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    if (textCount < 8 && totalCount < 8) {
                      e.currentTarget.style.background = '#263146';
                    }
                  }}
                >
                  <Plus size={16} />
                  {t('addText', lang)}
                </button>
              </div>

              {/* Unified Elements List */}
              {overlayConfig.elements.length > 0 && (
                <>
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
                          <div key={element.id} style={{ marginBottom: '24px' }}>
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
                                  {readingLabels[metricIndex] || `${metricIndex + 1}${metricIndex === 0 ? 'st' : metricIndex === 1 ? 'nd' : metricIndex === 2 ? 'rd' : 'th'} ${t('reading', lang)}`}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (unifiedIndex < sortedElements.length - 1) {
                                      setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex + 1));
                                    }
                                  }}
                                  disabled={unifiedIndex === sortedElements.length - 1}
                                  style={{
                                    background: unifiedIndex === sortedElements.length - 1 ? '#1a1f2e' : '#263146',
                                    border: '1px solid #3b5a9a',
                                    color: unifiedIndex === sortedElements.length - 1 ? '#5a6b7d' : '#d9e6ff',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: unifiedIndex === sortedElements.length - 1 ? 'not-allowed' : 'pointer',
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
                                    setSettings(removeOverlayElement(settings, overlayConfig, element.id));
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
                                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.currentTarget.style.background = '#4a2f2f';
                                  }}
                                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
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
                              <OverlayField
                                type="select"
                                label={t('reading', lang)}
                                value={data.metric}
                                onChange={(value) => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { metric: value as OverlayMetricKey }))}
                                onReset={() => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { metric: 'cpuTemp' as OverlayMetricKey }))}
                                options={[
                                  { value: 'cpuTemp', label: 'CPU Temperature' },
                                  { value: 'cpuLoad', label: 'CPU Load' },
                                  { value: 'cpuClock', label: 'CPU Clock' },
                                  { value: 'liquidTemp', label: 'Liquid Temperature' },
                                  { value: 'gpuTemp', label: 'GPU Temperature' },
                                  { value: 'gpuLoad', label: 'GPU Load' },
                                  { value: 'gpuClock', label: 'GPU Clock' },
                                ]}
                              />

                              {/* Number Color */}
                              <OverlayField
                                type="color"
                                label={t('color', lang)}
                                value={data.numberColor}
                                onChange={(color) => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberColor: color }))}
                                onReset={() => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberColor: 'rgba(255, 255, 255, 1)' }))}
                              />

                              {/* Number Size */}
                              <OverlayField
                                type="number"
                                label={t('size', lang)}
                                value={data.numberSize}
                                onChange={(value) => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberSize: value }))}
                                onReset={() => setSettings(updateMetricElementData(settings, overlayConfig, element.id, { numberSize: 180 }))}
                              />

                              {/* X Offset */}
                              <OverlayField
                                type="number"
                                label={t('customXOffset', lang)}
                                value={element.x}
                                onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, value, element.y))}
                                onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, 0, element.y))}
                              />

                              {/* Y Offset */}
                              <OverlayField
                                type="number"
                                label={t('customYOffset', lang)}
                                value={element.y}
                                onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, value))}
                                onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, 0))}
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
                          <div key={element.id} style={{ marginBottom: '24px' }}>
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
                                  {textLabels[textIndex] || `${textIndex + 1}${textIndex === 0 ? 'st' : textIndex === 1 ? 'nd' : textIndex === 2 ? 'rd' : 'th'} ${t('text', lang)}`}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (unifiedIndex < sortedElements.length - 1) {
                                      setSettings(reorderOverlayElements(settings, overlayConfig, element.id, unifiedIndex + 1));
                                    }
                                  }}
                                  disabled={unifiedIndex === sortedElements.length - 1}
                                  style={{
                                    background: unifiedIndex === sortedElements.length - 1 ? '#1a1f2e' : '#263146',
                                    border: '1px solid #3b5a9a',
                                    color: unifiedIndex === sortedElements.length - 1 ? '#5a6b7d' : '#d9e6ff',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: unifiedIndex === sortedElements.length - 1 ? 'not-allowed' : 'pointer',
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
                                    setSettings(removeOverlayElement(settings, overlayConfig, element.id));
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
                                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.currentTarget.style.background = '#4a2f2f';
                                  }}
                                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.currentTarget.style.background = '#3a1f1f';
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Text Options */}
                            <div className="settings-grid-modern">
                              {/* Text Input - Special case: text input, not using OverlayField */}
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
                                />
                                <ResetButton
                                  onClick={() => setSettings(updateTextElementData(settings, overlayConfig, element.id, { text: '' }))}
                                  tooltipContent={t('reset', lang)}
                                />
                              </div>

                              {/* Text Color */}
                              <OverlayField
                                type="color"
                                label={t('color', lang)}
                                value={data.textColor}
                                onChange={(color) => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textColor: color }))}
                                onReset={() => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textColor: 'rgba(255, 255, 255, 1)' }))}
                              />

                              {/* Text Size */}
                              <OverlayField
                                type="number"
                                label={t('size', lang)}
                                value={data.textSize}
                                onChange={(value) => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textSize: Math.max(6, value) }))}
                                onReset={() => setSettings(updateTextElementData(settings, overlayConfig, element.id, { textSize: 45 }))}
                                min={6}
                              />

                              {/* X Offset */}
                              <OverlayField
                                type="number"
                                label={t('customXOffset', lang)}
                                value={element.x}
                                onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, value, element.y))}
                                onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, 0, element.y))}
                              />

                              {/* Y Offset */}
                              <OverlayField
                                type="number"
                                label={t('customYOffset', lang)}
                                value={element.y}
                                onChange={(value) => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, value))}
                                onReset={() => setSettings(updateOverlayElementPosition(settings, overlayConfig, element.id, element.x, 0))}
                              />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
