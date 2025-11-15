import { useState, useRef, useEffect } from 'react';
import '../styles/ColorPicker.css';
import { normalizeToRgba, parseColorToRgba, rgbaObjectToString } from '../../utils/color';

// Import ColorPicker component from react-best-gradient-color-picker
import ColorPickerComponent from 'react-best-gradient-color-picker';

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

  // Package expects RGBA format in value prop (e.g., 'rgba(255,255,255,1)')
  // Convert to RGBA if needed
  const currentColor = normalizeToRgba(value);
  
  // Debug: Log the color being passed to picker
  useEffect(() => {
    console.log('[ColorPicker] Value prop:', value);
    console.log('[ColorPicker] Normalized to RGBA:', currentColor);
  }, [value, currentColor]);

  // Handle color change from picker
  // Package v3.0.14 returns string format (RGBA or gradient string)
  const handleColorChange = (color: string | { r: number; g: number; b: number; a?: number }) => {
    console.log('[ColorPicker] handleColorChange CALLED!');
    console.log('[ColorPicker] Received color:', color);
    console.log('[ColorPicker] Color type:', typeof color);
    console.log('[ColorPicker] Color is string?', typeof color === 'string');
    console.log('[ColorPicker] Color is object?', typeof color === 'object' && color !== null);
    
    let rgbaString: string;
    
    // Check if color is an object (RGBA object) or string (HEX/RGBA/gradient string)
    if (typeof color === 'object' && color !== null && 'r' in color) {
      // Color object with r, g, b, a
      console.log('[ColorPicker] Processing as RGBA object');
      rgbaString = rgbaObjectToString({
        r: color.r,
        g: color.g,
        b: color.b,
        a: allowAlpha ? (color.a ?? 1) : 1,
      });
    } else if (typeof color === 'string') {
      // Color string - could be RGBA, HEX, or gradient
      console.log('[ColorPicker] Processing as string:', color);
      
      // Check if it's a gradient string (package supports gradients)
      if (color.includes('gradient') || color.includes('linear-gradient')) {
        // For gradients, we need to extract the first color or use a fallback
        console.warn('[ColorPicker] Gradient detected, extracting first color');
        // Extract first rgba from gradient if possible
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
      console.warn('[ColorPicker] Unknown color format, using current value');
      rgbaString = normalizeToRgba(value);
    }
    
    console.log('[ColorPicker] Final RGBA string:', rgbaString);
    console.log('[ColorPicker] Calling onChange with:', rgbaString);
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

  // Check if ColorPickerComponent is available
  if (!ColorPickerComponent) {
    console.error('[ColorPicker] ColorPickerComponent is not available');
    return (
      <div className="color-picker-wrapper">
        <button
          type="button"
          className="color-picker-trigger"
          disabled
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
        >
          <span 
            className="color-picker-preview" 
            style={{
              backgroundColor: value || '#ffffff',
            }}
          />
        </button>
        <div style={{ fontSize: '10px', color: '#ff6b6b', marginTop: '4px' }}>
          Color picker not available
        </div>
      </div>
    );
  }

  // Debug: Log component and props
  useEffect(() => {
    console.log('[ColorPicker] Component available:', !!ColorPickerComponent);
    console.log('[ColorPicker] Current color:', currentColor);
    console.log('[ColorPicker] Props:', { allowAlpha, allowGradient, showInline });
  }, [currentColor, allowAlpha, allowGradient, showInline]);

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
          {ColorPickerComponent ? (
            <ColorPickerComponent
              value={currentColor}
              onChange={handleColorChange}
              hideAlpha={!allowAlpha}
              hideGradient={!allowGradient}
            />
          ) : (
            <div style={{ padding: '20px', color: '#fff', background: '#121317' }}>
              ColorPicker component not loaded
            </div>
          )}
        </div>
      )}
    </div>
  );
}
