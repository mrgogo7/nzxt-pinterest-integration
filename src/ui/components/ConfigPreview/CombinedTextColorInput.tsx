import { useRef } from 'react';
import ColorPicker from '../ColorPicker';
import { Tooltip } from 'react-tooltip';

interface CombinedTextColorInputProps {
  text: string;
  onTextChange: (text: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  placeholder?: string;
  maxLength?: number;
  id?: string;
  sanitizeText?: (text: string) => string;
  colorTooltipContent?: string;
}

/**
 * Combined text input with inline color picker.
 * Displays a color preview box on the left and text input on the right.
 * Used in text elements for a more compact and integrated UI.
 */
export default function CombinedTextColorInput({
  text,
  onTextChange,
  color,
  onColorChange,
  placeholder,
  maxLength = 120,
  id,
  sanitizeText,
  colorTooltipContent,
}: CombinedTextColorInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitized = sanitizeText ? sanitizeText(value) : value;
    onTextChange(sanitized);
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#2c2c2c',
        border: '1px solid #3a3a3a',
        borderRadius: '6px',
        padding: '6px 10px',
        height: '20px',
        transition: 'all 0.15s ease',
        boxShadow: 'none',
      }}
      onMouseEnter={(e) => {
        if (e.currentTarget !== document.activeElement?.closest('div')) {
          e.currentTarget.style.background = '#353535';
        }
      }}
      onMouseLeave={(e) => {
        if (e.currentTarget !== document.activeElement?.closest('div')) {
          e.currentTarget.style.background = '#2c2c2c';
        }
      }}
    >
      {/* Color picker with custom trigger styling */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
        className="combined-text-color-picker-wrapper"
        data-tooltip-id={colorTooltipContent ? `text-color-tooltip-${id}` : undefined}
        data-tooltip-content={colorTooltipContent}
      >
        <ColorPicker
          value={color || '#ffffff'}
          onChange={onColorChange}
        />
        {colorTooltipContent && <Tooltip id={`text-color-tooltip-${id}`} />}
      </div>

      {/* Text input */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={text}
        onChange={handleTextChange}
        maxLength={maxLength}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#f2f2f2',
          fontSize: '12px',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          padding: 0,
          minWidth: 0,
        }}
        onFocus={(e) => {
          const container = e.currentTarget.parentElement;
          if (container) {
            container.style.borderColor = '#8a2be2';
            container.style.boxShadow = 'none';
            container.style.background = '#2c2c2c';
          }
        }}
        onBlur={(e) => {
          const container = e.currentTarget.parentElement;
          if (container) {
            container.style.borderColor = '#3a3a3a';
            container.style.boxShadow = 'none';
            container.style.background = '#2c2c2c';
          }
        }}
      />
    </div>
  );
}

