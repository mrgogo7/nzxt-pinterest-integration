import { useState, useRef, useEffect } from 'react';
import { HexColorPicker, RgbaColorPicker, HexColorInput } from 'react-colorful';
import type { RgbaColor } from 'react-colorful';
import '../styles/ColorPicker.css';

interface ColorPickerProps {
  value: string; // RGBA or HEX color
  onChange: (color: string) => void;
  showInline?: boolean; // If true, show picker inline without trigger button
  enableAlpha?: boolean; // If true, show alpha slider (default: true)
  popupPosition?: 'auto' | 'bottom-right'; // Popup position preference
}

/**
 * ColorPicker component using react-colorful.
 * Returns color in rgba() format.
 * Positioned to avoid viewport overflow, prioritizing top-left for NZXT CAM compatibility.
 * Can be used inline (showInline=true) or as a popup (showInline=false).
 * Supports alpha channel when enableAlpha=true (default).
 */
export default function ColorPicker({ 
  value, 
  onChange, 
  showInline = false,
  enableAlpha = true,
  popupPosition = 'auto'
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popupStyle, setPopupStyle] = useState<{ top?: string; bottom?: string; left?: string; right?: string }>({});
  const [colorInput, setColorInput] = useState<string>('');

  // Parse color value to RGBA object or hex string
  const parseColor = (color: string): RgbaColor | string => {
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = match[4] ? parseFloat(match[4]) : 1;
        
        if (enableAlpha) {
          return { r, g, b, a };
        } else {
          // Convert to hex if alpha is disabled
          const hex = `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('')}`;
          return hex;
        }
      }
    } else if (color.startsWith('#')) {
      if (enableAlpha) {
        // Convert hex to RGBA
        const cleanHex = color.replace('#', '');
        if (cleanHex.length === 6) {
          const r = parseInt(cleanHex.substring(0, 2), 16);
          const g = parseInt(cleanHex.substring(2, 4), 16);
          const b = parseInt(cleanHex.substring(4, 6), 16);
          return { r, g, b, a: 1 };
        } else if (cleanHex.length === 8) {
          // #rrggbbaa format
          const r = parseInt(cleanHex.substring(0, 2), 16);
          const g = parseInt(cleanHex.substring(2, 4), 16);
          const b = parseInt(cleanHex.substring(4, 6), 16);
          const a = parseInt(cleanHex.substring(6, 8), 16) / 255;
          return { r, g, b, a };
        }
      }
      return color;
    }
    
    // Default color
    if (enableAlpha) {
      return { r: 255, g: 255, b: 255, a: 1 };
    }
    return '#ffffff';
  };

  // Convert RGBA object to rgba() string
  const rgbaToString = (rgba: RgbaColor): string => {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  };

  // Convert RGBA to hex string (with or without alpha)
  const rgbaToHex = (rgba: RgbaColor, includeAlpha: boolean): string => {
    const r = rgba.r.toString(16).padStart(2, '0');
    const g = rgba.g.toString(16).padStart(2, '0');
    const b = rgba.b.toString(16).padStart(2, '0');
    if (includeAlpha && rgba.a < 1) {
      const a = Math.round(rgba.a * 255).toString(16).padStart(2, '0');
      return `#${r}${g}${b}${a}`;
    }
    return `#${r}${g}${b}`;
  };

  // Convert hex to rgba string
  const hexToRgba = (hex: string): string => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  };

  const currentColor = parseColor(value);

  // Update color input when value changes
  useEffect(() => {
    if (enableAlpha && typeof currentColor === 'object') {
      setColorInput(rgbaToHex(currentColor, true));
    } else if (typeof currentColor === 'string') {
      setColorInput(currentColor);
    }
  }, [value, enableAlpha, currentColor]);

  // Handle color change from react-colorful
  const handleColorChange = (color: RgbaColor | string) => {
    if (enableAlpha && typeof color === 'object') {
      onChange(rgbaToString(color));
    } else if (typeof color === 'string') {
      onChange(hexToRgba(color));
    }
  };

  // Handle color input change
  const handleInputChange = (inputValue: string) => {
    setColorInput(inputValue);
    
    // Validate and convert input
    if (inputValue.startsWith('#')) {
      const cleanHex = inputValue.replace('#', '');
      if (cleanHex.length === 6 || cleanHex.length === 8) {
        if (enableAlpha) {
          // Convert to RGBA
          const r = parseInt(cleanHex.substring(0, 2), 16);
          const g = parseInt(cleanHex.substring(2, 4), 16);
          const b = parseInt(cleanHex.substring(4, 6), 16);
          const a = cleanHex.length === 8 ? parseInt(cleanHex.substring(6, 8), 16) / 255 : 1;
          onChange(`rgba(${r}, ${g}, ${b}, ${a})`);
        } else {
          onChange(hexToRgba(inputValue));
        }
      }
    } else if (inputValue.startsWith('rgba')) {
      onChange(inputValue);
    }
  };

  // Calculate popup position to avoid viewport overflow
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popupWidth = 232; // Color picker width (200px + padding)
      const popupHeight = enableAlpha ? 300 : 280; // Color picker approximate height (with alpha slider and input)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const spacing = 8; // gap between trigger and popup

      const position: { top?: string; bottom?: string; left?: string; right?: string } = {};

      // Special positioning for background color picker
      if (popupPosition === 'bottom-right') {
        position.top = 'calc(100% + 8px)';
        position.left = '0';
      } else {
        // Default positioning: prefer left and top (for NZXT CAM compatibility)
        // Horizontal positioning: prefer left
        if (triggerRect.left >= popupWidth + spacing) {
          // Enough space on left, open to the left
          position.right = '0';
        } else {
          // Not enough space on left, try right
          if (triggerRect.right + popupWidth + spacing <= viewportWidth) {
            position.left = '0';
          } else {
            // Not enough space on either side, open to the left anyway
            position.right = '0';
          }
        }

        // Vertical positioning: prefer top
        if (triggerRect.top >= popupHeight + spacing) {
          // Enough space above, open above
          position.bottom = 'calc(100% + 8px)';
        } else {
          // Not enough space above, try below
          if (triggerRect.bottom + popupHeight + spacing <= viewportHeight) {
            position.top = 'calc(100% + 8px)';
          } else {
            // Not enough space on either side, open above anyway
            position.bottom = 'calc(100% + 8px)';
          }
        }
      }

      setPopupStyle(position);
    }
  }, [isOpen, enableAlpha, popupPosition]);

  // Close picker when clicking outside
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

  // Color input component
  const ColorInput = () => {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all text on focus for easy editing
      // Use setTimeout to ensure the input is fully focused
      setTimeout(() => {
        e.target.select();
      }, 0);
    };

    return (
      <div className="color-picker-input-wrapper">
        <HexColorInput
          color={colorInput}
          onChange={handleInputChange}
          alpha={enableAlpha}
          prefixed
          className="color-picker-input"
          onFocus={handleFocus}
        />
      </div>
    );
  };

  // If showInline is true, show picker directly without trigger button
  if (showInline) {
    return (
      <div className="color-picker-wrapper color-picker-inline" ref={pickerRef}>
        <div className="color-picker-container">
          {enableAlpha ? (
            <RgbaColorPicker
              color={currentColor as RgbaColor}
              onChange={handleColorChange as (color: RgbaColor) => void}
            />
          ) : (
            <HexColorPicker
              color={currentColor as string}
              onChange={handleColorChange as (color: string) => void}
            />
          )}
          <ColorInput />
        </div>
      </div>
    );
  }

  // Default popup behavior
  return (
    <div className="color-picker-wrapper" ref={pickerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="color-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
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
          style={popupStyle}
        >
          <div className="color-picker-container">
            {enableAlpha ? (
              <RgbaColorPicker
                color={currentColor as RgbaColor}
                onChange={handleColorChange as (color: RgbaColor) => void}
              />
            ) : (
              <HexColorPicker
                color={currentColor as string}
                onChange={handleColorChange as (color: string) => void}
              />
            )}
            <ColorInput />
          </div>
        </div>
      )}
    </div>
  );
}
