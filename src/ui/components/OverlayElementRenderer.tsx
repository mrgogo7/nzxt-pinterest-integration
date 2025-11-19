/**
 * OverlayElementRenderer
 * Renders individual overlay elements based on their type.
 * 
 * Simple rendering - visual accuracy is NOT critical.
 * The goal is to display elements on screen with basic features.
 * 
 * Performance optimization with memoization.
 */

import { memo } from 'react';
import type { OverlayElement, OverlayMetrics, MetricElementData, TextElementData, DividerElementData } from '../../types/overlay';
import { getOverlayLabelAndValue } from '../../types/overlay';
import AnimateNumber from './AnimateNumber';
import styles from '../styles/UnifiedOverlay.module.css';

interface OverlayElementRendererProps {
  element: OverlayElement;
  metrics: OverlayMetrics;
  scale?: number;
}

/**
 * Render a metric element.
 */
function renderMetricElement(
  _element: OverlayElement,
  data: MetricElementData,
  metrics: OverlayMetrics,
  scale: number
) {
  const value = metrics[data.metric];
  const info = getOverlayLabelAndValue(data.metric, value);
  
  const numberSize = data.numberSize * scale;
  const unitSize = info.valueUnitType === "temp"
    ? numberSize * 0.49
    : info.valueUnitType === "percent"
    ? numberSize * 0.35
    : numberSize * 0.2;
  
  const isClock = info.valueUnitType === "clock";
  
  return (
    <div className={styles.elementContainer}>
      {/* Number + unit */}
      {!isClock ? (
        <div className={styles.numberContainer}>
          <AnimateNumber
            value={value}
            className={styles.number}
            style={{
              fontSize: `${numberSize}px`,
              color: data.numberColor,
            }}
          />
          
          {/* Temperature unit */}
          {info.valueUnit && info.valueUnitType === "temp" && (
            <span className={styles.unitContainer}>
              <span
                className={styles.unit}
                style={{
                  fontSize: `${unitSize}px`,
                  color: data.numberColor,
                }}
              >
                {info.valueUnit}
              </span>
            </span>
          )}
          
          {/* Percentage unit */}
          {info.valueUnit && info.valueUnitType === "percent" && (
            <span
              className={styles.unitPercent}
              style={{
                fontSize: `${unitSize}px`,
                color: data.numberColor,
              }}
            >
              {info.valueUnit}
            </span>
          )}
        </div>
      ) : (
        <>
          {/* Clock number */}
          <AnimateNumber
            value={value}
            className={styles.clockNumber}
            style={{
              fontSize: `${numberSize}px`,
              color: data.numberColor,
            }}
            as="div"
          />
          
          {/* MHz label */}
          <div
            className={styles.clockLabel}
            style={{
              fontSize: `${unitSize}px`,
              marginTop: -numberSize * 0.15,
              marginBottom: 6,
              color: data.numberColor,
            }}
          >
            MHz
          </div>
        </>
      )}
      
      {/* Label */}
      {data.showLabel !== false && data.textSize > 0 && data.textColor !== 'transparent' && (
        <div
          className={styles.label}
          style={{
            fontSize: `${data.textSize * scale}px`,
            color: data.textColor,
          }}
        >
          {info.label}
        </div>
      )}
    </div>
  );
}

/**
 * Render a text element.
 */
function renderTextElement(
  _element: OverlayElement,
  data: TextElementData,
  scale: number
) {
  return (
    <div
      className={styles.textElement}
      style={{
        fontSize: `${data.textSize * scale}px`,
        color: data.textColor,
        fontFamily: 'nzxt-extrabold',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {data.text}
    </div>
  );
}

/**
 * Render a divider element.
 * Minimalist - divider renderer exists for completeness.
 */
function renderDividerElement(
  _element: OverlayElement,
  data: DividerElementData,
  _scale: number
) {
  // Simple vertical divider
  return (
    <div
      className={styles.dividerElement}
      style={{
        width: `${data.thickness}px`,
        height: `${data.width}%`,
        backgroundColor: data.color,
      }}
    />
  );
}

/**
 * OverlayElementRenderer
 * Renders a single overlay element based on its type.
 */
function OverlayElementRenderer({
  element,
  metrics,
  scale = 1,
}: OverlayElementRendererProps) {
  switch (element.type) {
    case 'metric':
      return renderMetricElement(element, element.data as MetricElementData, metrics, scale);
    
    case 'text':
      return renderTextElement(element, element.data as TextElementData, scale);
    
    case 'divider':
      return renderDividerElement(element, element.data as DividerElementData, scale);
    
    default:
      return null;
  }
}

// Memoize to prevent unnecessary re-renders
export default memo(OverlayElementRenderer);

