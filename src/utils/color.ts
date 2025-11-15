/**
 * Color format conversion utilities.
 * Handles conversion between RGBA, HEX, and other color formats.
 */

/**
 * Convert RGBA string to HEX string.
 * @param rgba - RGBA string like "rgba(255, 255, 255, 1)" or "rgba(255, 255, 255, 0.5)"
 * @returns HEX string like "#ffffff"
 */
export function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const hex = `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
    return hex;
  }
  return '#000000';
}

/**
 * Convert HEX string to RGBA string.
 * @param hex - HEX string like "#ffffff" or "#fff"
 * @param alpha - Alpha value (0-1), defaults to 1
 * @returns RGBA string like "rgba(255, 255, 255, 1)"
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle short hex (#fff -> #ffffff)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Parse color string to RGBA object.
 * @param color - Color string in RGBA or HEX format
 * @returns Object with r, g, b, a values
 */
export function parseColorToRgba(color: string): { r: number; g: number; b: number; a: number } {
  // Try RGBA format first
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    };
  }
  
  // Try HEX format
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const fullHex = hex.length === 3 
      ? hex.split('').map(char => char + char).join('')
      : hex;
    
    return {
      r: parseInt(fullHex.substring(0, 2), 16),
      g: parseInt(fullHex.substring(2, 4), 16),
      b: parseInt(fullHex.substring(4, 6), 16),
      a: 1,
    };
  }
  
  // Default to black
  return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Convert color object to RGBA string.
 * @param color - Color object with r, g, b, a values
 * @returns RGBA string
 */
export function rgbaObjectToString(color: { r: number; g: number; b: number; a?: number }): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 1})`;
}

/**
 * Normalize color to RGBA format (project standard).
 * @param color - Color string in any format
 * @returns RGBA string
 */
export function normalizeToRgba(color: string): string {
  if (color.startsWith('rgba')) {
    return color;
  }
  if (color.startsWith('#')) {
    return hexToRgba(color, 1);
  }
  // Default to black
  return 'rgba(0, 0, 0, 1)';
}

/**
 * Normalize color to HEX format.
 * @param color - Color string in any format
 * @returns HEX string
 */
export function normalizeToHex(color: string): string {
  if (color.startsWith('#')) {
    return color;
  }
  if (color.startsWith('rgba')) {
    return rgbaToHex(color);
  }
  // Default to black
  return '#000000';
}

