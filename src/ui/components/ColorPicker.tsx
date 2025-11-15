import { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/ColorPicker.css';
import { normalizeToRgba, parseColorToRgba, rgbaObjectToString } from '../../utils/color';
import GradientColorPicker from 'react-best-gradient-color-picker';

/**
 * ColorPicker component props.
 * Wraps react-best-gradient-color-picker with project-specific functionality.
 */
interface ColorPickerProps {
  /** Current color value in RGBA or HEX format */
  value: string;
  /** Callback when color changes, receives RGBA string */
  onChange: (color: string) => void;
  /** If true, show picker inline without trigger button */
  showInline?: boolean;
  /** If true, allow alpha channel (default: false) */
  allowAlpha?: boolean;
  /** If true, allow gradient selection (default: false for text colors, true for background) */
  allowGradient?: boolean;
}

/**
 * ColorPicker component using react-best-gradient-color-picker.
 * 
 * Features:
 * - Returns color in rgba() format for alpha support
 * - Positioned to avoid viewport overflow, prioritizing top-left for NZXT CAM compatibility
 * - Supports inline (showInline=true) or popup (showInline=false) modes
 * - Handles both solid colors and gradients (when allowGradient=true)
 * 
 * @param props - ColorPicker component props
 */
export default function ColorPicker({ 
  value, 
  onChange, 
  showInline = false,
  allowAlpha = false,
  allowGradient = false,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popupPosition, setPopupPosition] = useState<{ 
    top?: string; 
    bottom?: string; 
    left?: string; 
    right?: string 
  }>({});

  // Normalize color to RGBA format (package expects rgba format)
  const currentColor = normalizeToRgba(value);

  /**
   * Handle color change from the picker.
   * Package returns string format (RGBA or gradient string).
   * Converts to project standard RGBA format.
   */
  const handleColorChange = useCallback((color: string) => {
    // Package returns string in format: 'rgba(r,g,b,a)' or 'linear-gradient(...)'
    let rgbaString: string;

    if (typeof color === 'string') {
      // Check if it's a gradient string
      if (color.includes('gradient') || color.includes('linear-gradient')) {
        // Extract first rgba color from gradient
        const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbaMatch) {
          rgbaString = `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${rgbaMatch[4] || 1})`;
        } else {
          // Fallback to current value if gradient parsing fails
          rgbaString = normalizeToRgba(value);
        }
      } else {
        // Regular color string (RGBA or HEX)
        rgbaString = normalizeToRgba(color);
      }

      // If alpha is not allowed, ensure alpha is 1
      if (!allowAlpha) {
        const parsed = parseColorToRgba(rgbaString);
        rgbaString = rgbaObjectToString({
          r: parsed.r,
          g: parsed.g,
          b: parsed.b,
          a: 1,
        });
      }
    } else {
      // Fallback - use current value
      rgbaString = normalizeToRgba(value);
    }

    onChange(rgbaString);
  }, [value, allowAlpha, onChange]);

  /**
   * Calculate popup position to avoid viewport overflow.
   * Prioritizes top-left positioning for NZXT CAM compatibility.
   */
  useEffect(() => {
    if (isOpen && triggerRef.current && pickerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const wrapperRect = pickerRef.current.getBoundingClientRect();
      const popupWidth = 280;
      const popupHeight = 400;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const spacing = 8;

      const position: { top?: string; bottom?: string; left?: string; right?: string } = {};

      // Calculate relative position from wrapper
      const triggerLeft = triggerRect.left - wrapperRect.left;
      const triggerTop = triggerRect.top - wrapperRect.top;
      const triggerBottom = triggerRect.bottom - wrapperRect.top;

      // Horizontal positioning: prefer left
      if (triggerRect.left >= popupWidth + spacing) {
        position.right = `${wrapperRect.width - triggerLeft}px`;
      } else {
        if (triggerRect.right + popupWidth + spacing <= viewportWidth) {
          position.left = `${triggerLeft}px`;
        } else {
          position.right = `${wrapperRect.width - triggerLeft}px`;
        }
      }

      // Vertical positioning: prefer top, but ensure popup stays within viewport
      const spaceAbove = triggerRect.top;
      
      if (spaceAbove >= popupHeight + spacing) {
        position.bottom = `${wrapperRect.height - triggerTop + spacing}px`;
      } else {
        const popupTopInViewport = triggerRect.bottom + spacing;
        
        if (popupTopInViewport + popupHeight <= viewportHeight) {
          position.top = `${triggerBottom + spacing}px`;
        } else {
          const maxTopInViewport = viewportHeight - popupHeight;
          const maxTopRelative = maxTopInViewport - (triggerRect.top - wrapperRect.top);
          position.top = `${Math.max(triggerBottom + spacing, maxTopRelative)}px`;
        }
      }

      setPopupPosition(position);
    }
  }, [isOpen]);

  /**
   * Close picker when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Inline mode: show picker directly without trigger button
  if (showInline) {
    return (
      <div className="color-picker-wrapper color-picker-inline" ref={pickerRef}>
        <GradientColorPicker
          value={currentColor}
          onChange={handleColorChange}
          hideAlpha={!allowAlpha}
          hideGradient={!allowGradient}
        />
      </div>
    );
  }

  // Popup mode: show trigger button with popup
  return (
    <div className="color-picker-wrapper" ref={pickerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="color-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open color picker"
      >
        <span 
          className="color-picker-preview" 
          style={{
            backgroundColor: value || '#ffffff',
          }}
        />
      </button>

      {isOpen && (
        <div 
          className="color-picker-popup"
          style={popupPosition}
        >
          <GradientColorPicker
            value={currentColor}
            onChange={handleColorChange}
            hideAlpha={!allowAlpha}
            hideGradient={!allowGradient}
          />
        </div>
      )}
    </div>
  );
}
