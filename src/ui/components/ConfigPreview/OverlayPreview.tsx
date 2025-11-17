import SingleInfographic from '../SingleInfographic';
import DualInfographic from '../DualInfographic';
import TripleInfographic from '../TripleInfographic';
import type { OverlaySettings, OverlayMetrics } from '../../../types/overlay';
import type { Lang, t as tFunction } from '../../../i18n';
import { lcdToPreview } from '../../../utils/positioning';

interface OverlayPreviewProps {
  overlayConfig: OverlaySettings;
  metrics: OverlayMetrics;
  overlayPreviewScale: number;
  offsetScale: number;
  overlayAdjX: number;
  overlayAdjY: number;
  isDraggingOverlay: boolean;
  isDraggingSecondaryTertiary: boolean;
  draggingReadingId: string | null;
  draggingTextId: string | null;
  selectedReadingId: string | null;
  selectedTextId: string | null;
  onOverlayMouseDown: (e: React.MouseEvent) => void;
  onCustomReadingMouseDown: (e: React.MouseEvent, readingId: string) => void;
  onCustomTextMouseDown: (e: React.MouseEvent, textId: string) => void;
  isRealDataReceived: boolean;
  lang: Lang;
  t: typeof tFunction;
}

/**
 * Overlay preview component.
 * Displays overlay preview for single/dual/triple/custom modes with drag support.
 */
export default function OverlayPreview({
  overlayConfig,
  metrics,
  overlayPreviewScale,
  offsetScale,
  overlayAdjX,
  overlayAdjY,
  isDraggingOverlay,
  isDraggingSecondaryTertiary,
  draggingReadingId,
  draggingTextId,
  selectedReadingId,
  selectedTextId,
  onOverlayMouseDown,
  onCustomReadingMouseDown,
  onCustomTextMouseDown,
  isRealDataReceived,
  lang,
  t,
}: OverlayPreviewProps) {
  return (
    <div className="preview-column">
      {overlayConfig.mode !== 'none' ? (
        <>
          <div className="preview-title">{t('overlayPreviewTitle', lang)}</div>
          <div
            className={`preview-circle overlay-preview ${isDraggingOverlay || isDraggingSecondaryTertiary || draggingReadingId ? 'dragging' : ''}`}
            onMouseDown={onOverlayMouseDown}
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
            {overlayConfig.mode === 'custom' && overlayConfig.customReadings && overlayConfig.customReadings.length > 0 && (
              <>
                {/* Render in order (reverse for z-index: higher order = higher z-index) */}
                {[...overlayConfig.customReadings]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .reverse()
                  .map((reading, reverseIndex) => {
                  // Use labelIndex for label, not order-based index
                  const readingLabelIndex = reading.labelIndex ?? reverseIndex;
                  const readingX = lcdToPreview(reading.x, offsetScale);
                  const readingY = lcdToPreview(reading.y, offsetScale);
                  const isDraggingThis = draggingReadingId === reading.id;
                  const zIndex = 10 + (reading.order ?? reverseIndex); // Higher z-index for higher order
                  
                  // Calculate hit area size based on numberSize
                  // Hit area should be slightly larger than content for easier interaction
                  // Note: Custom mode doesn't show text labels, so we don't need extra space for that
                  const scaledNumberSize = reading.numberSize * overlayPreviewScale;
                  const hitAreaWidth = scaledNumberSize * 1.5; // 1.5x multiplier for width (narrower)
                  const hitAreaHeight = scaledNumberSize * 0.85; // 0.85x multiplier for height (minimal vertical space, no text labels)
                  
                  // Get reading label based on labelIndex (creation order, not display order)
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
                  const readingLabel = readingLabels[readingLabelIndex] || `${readingLabelIndex + 1}${readingLabelIndex === 0 ? 'st' : readingLabelIndex === 1 ? 'nd' : readingLabelIndex === 2 ? 'rd' : 'th'} ${t('reading', lang)}`;
                  
                  const isSelected = selectedReadingId === reading.id;
                  
                  return (
                    <div
                      key={reading.id}
                      data-reading-id={reading.id}
                      onMouseDown={(e) => {
                        // Only handle if clicking on this specific reading's content area
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const clickY = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        
                        // Check if click is within hit area
                        const distanceX = Math.abs(clickX - centerX);
                        const distanceY = Math.abs(clickY - centerY);
                        
                        if (distanceX < hitAreaWidth / 2 && distanceY < hitAreaHeight / 2) {
                          onCustomReadingMouseDown(e, reading.id);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: `${hitAreaWidth}px`,
                        height: `${hitAreaHeight}px`,
                        transform: `translate(calc(-50% + ${readingX}px), calc(-50% + ${readingY}px))`,
                        cursor: isDraggingThis ? 'grabbing' : (isSelected ? 'move' : 'grab'),
                        pointerEvents: 'auto',
                        zIndex: zIndex,
                        // Visual feedback: show outline when dragging or selected
                        outline: (isDraggingThis || isSelected) ? '2px dashed rgba(255, 255, 255, 0.5)' : 'none',
                        outlineOffset: (isDraggingThis || isSelected) ? '4px' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // Asymmetric padding: less space at bottom (no text), slightly less at top
                        paddingTop: `${scaledNumberSize * 0.05}px`, // Small top padding
                        paddingBottom: `${scaledNumberSize * 0.02}px`, // Minimal bottom padding
                      }}
                    >
                      {/* Label outside bounding box - only visible when dragging or selected */}
                      {(isDraggingThis || isSelected) && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-18px',
                            left: '-4px',
                            fontSize: '8px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                            fontWeight: 500,
                            pointerEvents: 'none',
                            userSelect: 'none',
                            zIndex: zIndex + 1,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {readingLabel}
                        </div>
                      )}
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
                        scale={overlayPreviewScale}
                      />
                    </div>
                  );
                })}
              </>
            )}
            {overlayConfig.mode === 'custom' && overlayConfig.customTexts && overlayConfig.customTexts.length > 0 && (
              <>
                {/* Render texts in order (reverse for z-index: higher order = higher z-index) */}
                {[...overlayConfig.customTexts]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .reverse()
                  .map((text, reverseIndex) => {
                  // Use labelIndex for label, not order-based index
                  const textLabelIndex = text.labelIndex ?? reverseIndex;
                  const textX = lcdToPreview(text.x, offsetScale);
                  const textY = lcdToPreview(text.y, offsetScale);
                  const isDraggingThis = draggingTextId === text.id;
                  const zIndex = 20 + (text.order ?? reverseIndex); // Higher z-index than readings, based on order
                  
                  // Calculate hit area size based on textSize
                  const scaledTextSize = text.textSize * overlayPreviewScale;
                  const hitAreaWidth = Math.max(scaledTextSize * text.text.length * 0.6, scaledTextSize * 2); // Based on text length
                  const hitAreaHeight = scaledTextSize * 1.2;
                  
                  // Get text label based on labelIndex (creation order, not display order)
                  const textLabels = [
                    t('firstText', lang),
                    t('secondText', lang),
                    t('thirdText', lang),
                    t('fourthText', lang),
                  ];
                  const textLabel = textLabels[textLabelIndex] || `${textLabelIndex + 1}${textLabelIndex === 0 ? 'st' : textLabelIndex === 1 ? 'nd' : textLabelIndex === 2 ? 'rd' : 'th'} ${t('text', lang)}`;
                  const isSelected = selectedTextId === text.id;
                  
                  return (
                    <div
                      key={text.id}
                      data-text-id={text.id}
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const clickY = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        
                        const distanceX = Math.abs(clickX - centerX);
                        const distanceY = Math.abs(clickY - centerY);
                        
                        if (distanceX < hitAreaWidth / 2 && distanceY < hitAreaHeight / 2) {
                          onCustomTextMouseDown(e, text.id);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: `${hitAreaWidth}px`,
                        height: `${hitAreaHeight}px`,
                        transform: `translate(calc(-50% + ${textX}px), calc(-50% + ${textY}px))`,
                        cursor: isDraggingThis ? 'grabbing' : (isSelected ? 'move' : 'grab'),
                        pointerEvents: 'auto',
                        zIndex: zIndex,
                        outline: (isDraggingThis || isSelected) ? '2px dashed rgba(255, 255, 255, 0.5)' : 'none',
                        outlineOffset: (isDraggingThis || isSelected) ? '4px' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Label outside bounding box - only visible when dragging or selected */}
                      {(isDraggingThis || isSelected) && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-18px',
                            left: '-4px',
                            fontSize: '8px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                            fontWeight: 500,
                            pointerEvents: 'none',
                            userSelect: 'none',
                            zIndex: zIndex + 1,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {textLabel}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: `${scaledTextSize}px`,
                          color: text.textColor,
                          fontFamily: 'nzxt-extrabold',
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                          pointerEvents: 'none',
                        }}
                      >
                        {text.text}
                      </div>
                    </div>
                  );
                })}
              </>
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
  );
}

