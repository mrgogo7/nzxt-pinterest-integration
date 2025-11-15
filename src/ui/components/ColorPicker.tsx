import { useState, useRef, useEffect } from 'react';
import ColorPickerComponent from 'react-best-gradient-color-picker';
import '../styles/ColorPicker.css';
import { normalizeToRgba, normalizeToHex, parseColorToRgba, rgbaObjectToString } from '../../utils/color';

interface ColorPickerProps {
  value: string; // RGBA or HEX color
  onChange: (color: string) => void;
  showInline?: boolean; // If true, show picker inline without trigger button
  allowAlpha?: boolean; // If true, allow alpha channel (default: false)
  allowGradient?: boolean; // If true, allow gradient (default: false for text colors, true for background)
}

/**
 * ColorPicker component using react-best-gradient-color-picker.
 * Returns color in rgba() format for alpha support.
 * Positioned to avoid viewport overflow, prioritizing top-left for NZXT CAM compatibility.
 * Can be used inline (showInline=true) or as a popup (showInline=false).
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
  const [popupPosition, setPopupPosition] = useState<{ top?: string; bottom?: string; left?: string; right?: string }>({});

  // Normalize color to HEX for the picker (picker likely uses HEX internally)
  const currentColor = normalizeToHex(value);

  // Handle color change from picker
  const handleColorChange = (color: string | { r: number; g: number; b: number; a?: number }) => {
    let rgbaString: string;
    
    // Check if color is an object (RGBA) or string (HEX/RGBA)
    if (typeof color === 'object' && 'r' in color) {
      // Color object with r, g, b, a
      rgbaString = rgbaObjectToString({
        r: color.r,
        g: color.g,
        b: color.b,
        a: allowAlpha ? (color.a ?? 1) : 1,
      });
    } else if (typeof color === 'string') {
      // Color string - normalize to RGBA
      if (color.startsWith('rgba')) {
        // Already RGBA, but ensure alpha is correct
        const parsed = parseColorToRgba(color);
        rgbaString = rgbaObjectToString({
          r: parsed.r,
          g: parsed.g,
          b: parsed.b,
          a: allowAlpha ? parsed.a : 1,
        });
      } else if (color.startsWith('#')) {
        // HEX - convert to RGBA
        const parsed = parseColorToRgba(color);
        rgbaString = rgbaObjectToString({
          r: parsed.r,
          g: parsed.g,
          b: parsed.b,
          a: allowAlpha ? (parseColorToRgba(value).a || 1) : 1,
        });
      } else {
        // Unknown format, normalize
        rgbaString = normalizeToRgba(color);
      }
    } else {
      // Fallback
      rgbaString = normalizeToRgba(value);
    }
    
    onChange(rgbaString);
  };

  // Calculate popup position to avoid viewport overflow
  useEffect(() => {
    if (isOpen && triggerRef.current && pickerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const wrapperRect = pickerRef.current.getBoundingClientRect();
      const popupWidth = 280; // Approximate width for color picker
      const popupHeight = 400; // Approximate height for color picker
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const spacing = 8; // gap between trigger and popup

      const position: { top?: string; bottom?: string; left?: string; right?: string } = {};

      // Calculate relative position from wrapper
      const triggerLeft = triggerRect.left - wrapperRect.left;
      const triggerTop = triggerRect.top - wrapperRect.top;
      const triggerBottom = triggerRect.bottom - wrapperRect.top;

      // Horizontal positioning: prefer left (for NZXT CAM compatibility)
      if (triggerRect.left >= popupWidth + spacing) {
        // Enough space on left, open to the left
        position.right = `${wrapperRect.width - triggerLeft}px`;
      } else {
        // Not enough space on left, try right
        if (triggerRect.right + popupWidth + spacing <= viewportWidth) {
          position.left = `${triggerLeft}px`;
        } else {
          // Not enough space on either side, open to the left anyway
          position.right = `${wrapperRect.width - triggerLeft}px`;
        }
      }

      // Vertical positioning: prefer top (for NZXT CAM compatibility)
      // But ensure popup stays within viewport
      const spaceAbove = triggerRect.top;
      
      if (spaceAbove >= popupHeight + spacing) {
        // Enough space above, open above
        position.bottom = `${wrapperRect.height - triggerTop + spacing}px`;
      } else {
        // Not enough space above - open below
        // Calculate where popup would be in viewport
        const popupTopInViewport = triggerRect.bottom + spacing;
        
        // Check if popup would overflow viewport bottom
        if (popupTopInViewport + popupHeight <= viewportHeight) {
          // Fits below - use normal position
          position.top = `${triggerBottom + spacing}px`;
        } else {
          // Would overflow - position to fit in viewport
          // Place popup so its bottom aligns with viewport bottom
          const maxTopInViewport = viewportHeight - popupHeight;
          const maxTopRelative = maxTopInViewport - (triggerRect.top - wrapperRect.top);
          position.top = `${Math.max(triggerBottom + spacing, maxTopRelative)}px`;
        }
      }

      setPopupPosition(position);
    }
  }, [isOpen]);

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

  // If showInline is true, show picker directly without trigger button
  if (showInline) {
    return (
      <div className="color-picker-wrapper color-picker-inline" ref={pickerRef}>
        <ColorPickerComponent
          value={currentColor}
          onChange={handleColorChange}
          hideAlpha={!allowAlpha}
          hideGradient={!allowGradient}
        />
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
          style={popupPosition}
        >
          <ColorPickerComponent
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
