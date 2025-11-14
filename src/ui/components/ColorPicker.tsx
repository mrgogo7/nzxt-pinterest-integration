import { useState, useRef, useEffect } from 'react';
import '../styles/ColorPicker.css';

/**
 * Preset colors for quick selection
 */
const PRESET_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#ffc0cb', '#a52a2a', '#808080', '#c0c0c0', '#008000',
  '#000080', '#800000', '#808000', '#008080', '#ff6347',
];

interface ColorPickerProps {
  value: string; // RGBA or HEX color
  onChange: (color: string) => void;
}

/**
 * ColorPicker component with alpha support and preset colors.
 * Returns color in rgba() format for alpha support.
 */
export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(1);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse color value (supports hex, rgb, rgba)
  useEffect(() => {
    let r = 255, g = 255, b = 255, a = 1;

    if (value.startsWith('rgb')) {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
        a = match[4] ? parseFloat(match[4]) : 1;
      }
    } else if (value.startsWith('#')) {
      const hex = value.slice(1);
      if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16) / 255;
      }
    }

    // Convert RGB to HSL
    const hsl = rgbToHsl(r, g, b);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    setAlpha(a);
  }, [value]);

  // Convert RGB to HSL
  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  // Convert HSL to RGB
  function hslToRgb(h: number, s: number, l: number) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  // Update color when HSL or alpha changes
  const updateColor = (newHue: number, newSat: number, newLight: number, newAlpha: number) => {
    const rgb = hslToRgb(newHue, newSat, newLight);
    const color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${newAlpha})`;
    onChange(color);
  };

  // Handle saturation/lightness area click
  const handleSaturationLightnessClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    setSaturation(x * 100);
    setLightness((1 - y) * 100);
    updateColor(hue, x * 100, (1 - y) * 100, alpha);
  };

  // Handle hue slider
  const handleHueChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newHue = x * 360;
    setHue(newHue);
    updateColor(newHue, saturation, lightness, alpha);
  };

  // Handle alpha slider
  const handleAlphaChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newAlpha = x;
    setAlpha(newAlpha);
    updateColor(hue, saturation, lightness, newAlpha);
  };

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

  // Get current color for display
  const currentRgb = hslToRgb(hue, saturation, lightness);
  const currentColor = `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, ${alpha})`;
  const currentColorHex = `#${[currentRgb.r, currentRgb.g, currentRgb.b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;

  return (
    <div className="color-picker-wrapper" ref={pickerRef}>
      <button
        type="button"
        className="color-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: currentColor,
        }}
      >
        <span className="color-picker-preview" />
      </button>

      {isOpen && (
        <div className="color-picker-popup">
          {/* Saturation/Lightness area */}
          <div
            className="color-picker-saturation-lightness"
            style={{
              backgroundColor: `hsl(${hue}, 100%, 50%)`,
            }}
            onMouseDown={(e) => {
              handleSaturationLightnessClick(e);
              const move = (moveEvent: MouseEvent) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                const y = Math.max(0, Math.min(1, (moveEvent.clientY - rect.top) / rect.height));
                setSaturation(x * 100);
                setLightness((1 - y) * 100);
                updateColor(hue, x * 100, (1 - y) * 100, alpha);
              };
              const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
              };
              document.addEventListener('mousemove', move);
              document.addEventListener('mouseup', up);
            }}
          >
            <div
              className="color-picker-pointer"
              style={{
                left: `${saturation}%`,
                top: `${100 - lightness}%`,
              }}
            />
          </div>

          {/* Hue slider */}
          <div
            className="color-picker-hue"
            onMouseDown={(e) => {
              handleHueChange(e);
              const move = (moveEvent: MouseEvent) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                const newHue = x * 360;
                setHue(newHue);
                updateColor(newHue, saturation, lightness, alpha);
              };
              const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
              };
              document.addEventListener('mousemove', move);
              document.addEventListener('mouseup', up);
            }}
          >
            <div
              className="color-picker-pointer"
              style={{
                left: `${(hue / 360) * 100}%`,
              }}
            />
          </div>

          {/* Alpha slider */}
          <div
            className="color-picker-alpha"
            style={{
              background: `linear-gradient(to right, transparent, ${currentColorHex})`,
            }}
            onMouseDown={(e) => {
              handleAlphaChange(e);
              const move = (moveEvent: MouseEvent) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                const newAlpha = x;
                setAlpha(newAlpha);
                updateColor(hue, saturation, lightness, newAlpha);
              };
              const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
              };
              document.addEventListener('mousemove', move);
              document.addEventListener('mouseup', up);
            }}
          >
            <div
              className="color-picker-pointer"
              style={{
                left: `${alpha * 100}%`,
              }}
            />
          </div>

          {/* Preset colors */}
          <div className="color-picker-presets">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="color-picker-preset"
                style={{ backgroundColor: color }}
                onClick={() => {
                  // Convert hex to rgba
                  const r = parseInt(color.slice(1, 3), 16);
                  const g = parseInt(color.slice(3, 5), 16);
                  const b = parseInt(color.slice(5, 7), 16);
                  onChange(`rgba(${r}, ${g}, ${b}, ${alpha})`);
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

