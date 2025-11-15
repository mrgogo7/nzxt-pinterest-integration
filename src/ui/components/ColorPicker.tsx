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
 * Adapts project to package API:
 * - Package expects RGBA format strings
 * - Package onChange receives RGBA strings directly
 * - Alpha control is managed by hideAlpha prop
 * - Internal state ensures controlled component behavior
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

  // Internal state - package works better with controlled component
  const [internalColor, setInternalColor] = useState(() => normalizeToRgba(value));

  // Sync internal state when external value changes
  useEffect(() => {
    const normalized = normalizeToRgba(value);
    if (normalized !== internalColor) {
      setInternalColor(normalized);
    }
  }, [value, internalColor]);

  /**
   * Handle color change from package.
   * Package returns RGBA string directly when allowAlpha is true.
   * Package returns RGBA string with alpha=1 when allowAlpha is false.
   */
  const handleColorChange = useCallback((color: string) => {
    let rgbaString: string;

    if (typeof color === 'string') {
      // Package returns RGBA string or gradient string
      if (color.includes('gradient') || color.includes('linear-gradient')) {
        // Extract first rgba from gradient
        const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbaMatch) {
          rgbaString = `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${rgbaMatch[4] || 1})`;
        } else {
          rgbaString = internalColor;
        }
      } else {
        // Regular RGBA string - use directly
        rgbaString = color;
      }
    } else {
      rgbaString = internalColor;
    }

    // Only override alpha if allowAlpha is false
    if (!allowAlpha) {
      const parsed = parseColorToRgba(rgbaString);
      rgbaString = rgbaObjectToString({
        r: parsed.r,
        g: parsed.g,
        b: parsed.b,
        a: 1,
      });
    }

    // Validate
    const parsed = parseColorToRgba(rgbaString);
    if (isNaN(parsed.r) || isNaN(parsed.g) || isNaN(parsed.b) || isNaN(parsed.a)) {
      rgbaString = internalColor;
    }

    // Update internal state
    setInternalColor(rgbaString);
    
    // Call parent onChange
    onChange(rgbaString);
  }, [internalColor, allowAlpha, onChange]);

  /**
   * Calculate popup position - opens next to trigger button.
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

      // Calculate relative positions
      const triggerLeft = triggerRect.left - wrapperRect.left;
      const triggerTop = triggerRect.top - wrapperRect.top;
      const triggerRight = triggerRect.right - wrapperRect.left;
      const triggerBottom = triggerRect.bottom - wrapperRect.top;

      // Horizontal: prefer right side of trigger
      if (triggerRect.right + popupWidth + spacing <= viewportWidth) {
        // Enough space on right - position to the right of trigger
        position.left = `${triggerRight - wrapperRect.left + spacing}px`;
      } else if (triggerRect.left >= popupWidth + spacing) {
        // Enough space on left - position to the left of trigger
        position.right = `${wrapperRect.width - triggerLeft + spacing}px`;
      } else {
        // Default to right, even if it overflows slightly
        position.left = `${triggerRight - wrapperRect.left + spacing}px`;
      }

      // Vertical: prefer below trigger, align top with trigger
      if (triggerRect.bottom + popupHeight + spacing <= viewportHeight) {
        // Enough space below - align top with trigger top
        position.top = `${triggerTop}px`;
      } else if (triggerRect.top >= popupHeight + spacing) {
        // Enough space above - position above trigger
        position.bottom = `${wrapperRect.height - triggerTop + spacing}px`;
      } else {
        // Adjust to fit in viewport
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        
        if (spaceBelow >= spaceAbove) {
          // More space below - use it
          position.top = `${triggerTop}px`;
        } else {
          // More space above - position above
          position.bottom = `${wrapperRect.height - triggerTop + spacing}px`;
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

  // Inline mode
  if (showInline) {
    return (
      <div className="color-picker-wrapper color-picker-inline" ref={pickerRef}>
        <GradientColorPicker
          value={internalColor}
          onChange={handleColorChange}
          hideAlpha={!allowAlpha}
          hideGradient={!allowGradient}
        />
      </div>
    );
  }

  // Popup mode
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
            value={internalColor}
            onChange={handleColorChange}
            hideAlpha={!allowAlpha}
            hideGradient={!allowGradient}
          />
        </div>
      )}
    </div>
  );
}
