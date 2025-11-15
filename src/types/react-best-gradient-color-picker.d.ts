/**
 * Type declarations for react-best-gradient-color-picker
 * Since the package doesn't have TypeScript definitions, we provide our own.
 */

declare module 'react-best-gradient-color-picker' {
  import { Component } from 'react';

  interface ColorPickerProps {
    value: string; // Color value in HEX format (e.g., "#ffffff")
    onChange: (color: string | { r: number; g: number; b: number; a?: number }) => void;
    hideAlpha?: boolean; // If true, hides alpha channel control
    hideGradient?: boolean; // If true, hides gradient control
  }

  export default class ColorPicker extends Component<ColorPickerProps> {}
}

