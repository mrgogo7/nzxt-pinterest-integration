/**
 * Type declarations for react-best-gradient-color-picker
 * Based on npm package documentation: https://www.npmjs.com/package/react-best-gradient-color-picker
 */

declare module 'react-best-gradient-color-picker' {
  import { ComponentType } from 'react';

  interface ColorPickerProps {
    value?: string; // Color value in HEX format (e.g., "#ffffff")
    onChange?: (color: string) => void; // Callback with HEX color string
    hideAlpha?: boolean; // If true, hides alpha channel control
    hideGradient?: boolean; // If true, hides gradient control
  }

  // Default export is the ColorPicker component
  const ColorPicker: ComponentType<ColorPickerProps>;
  export default ColorPicker;
}

