import { useRef, useEffect } from 'react';
import ColorPicker from '../ColorPicker';
import { Tooltip } from 'react-tooltip';
import NumericStepper from '../NumericStepper';

interface OverlayFieldProps {
  field?: string; // Optional, kept for backward compatibility (no longer used for type safety)
  type: 'number' | 'color' | 'select';
  label: string;
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: string; label: string }>;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
  hideLabel?: boolean; // If true, don't render the label
  tooltipId?: string; // Optional tooltip ID for color picker
  tooltipContent?: string; // Optional tooltip content
  labelTooltipId?: string; // Optional tooltip ID for label
  labelTooltipContent?: string; // Optional tooltip content for label
}

/**
 * Generic overlay field component.
 * Handles number inputs, color pickers, and select dropdowns with reset functionality.
 * 
 * This component eliminates ~1500 lines of repetitive code in OverlaySettings.
 * 
 * Supports:
 * - Integer inputs (step=1) with automatic rounding
 * - Mouse wheel scrolling (+1/-1)
 * - Keyboard arrow keys (ArrowUp/ArrowDown for +1/-1)
 */
export default function OverlayField({
  field: _field,
  type,
  label,
  value,
  onChange,
  options,
  step,
  min,
  max,
  className = 'input-narrow',
  hideLabel = false,
  tooltipId,
  tooltipContent,
  labelTooltipId,
  labelTooltipContent,
}: OverlayFieldProps) {
  return (
    <div className="setting-row">
      {!hideLabel && (
        <label 
          data-tooltip-id={labelTooltipId} 
          data-tooltip-content={labelTooltipContent}
          style={{ cursor: labelTooltipId ? 'help' : 'default' }}
        >
          {label}
        </label>
      )}
      {labelTooltipId && <Tooltip id={labelTooltipId} />}
      
      {type === 'number' && (
        <NumericStepper
          value={value ?? 0}
          onChange={onChange}
          step={step ?? 1}
          min={min}
          max={max}
          className={className}
        />
      )}
      
      {type === 'color' && (
        <>
          <div data-tooltip-id={tooltipId} data-tooltip-content={tooltipContent}>
            <ColorPicker
              value={value || '#ffffff'}
              onChange={onChange}
            />
          </div>
          {tooltipId && <Tooltip id={tooltipId} />}
        </>
      )}
      
      {type === 'select' && (
        <select
          className={`url-input ${className}`}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      
      {/* Reset button removed - now handled at element level */}
    </div>
  );
}

