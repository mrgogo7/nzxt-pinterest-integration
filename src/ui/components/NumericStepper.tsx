import { useRef, useEffect, useState, KeyboardEvent, FocusEvent } from 'react';
import '../styles/NumericStepper.css';

interface NumericStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Custom numeric stepper component with +/- buttons.
 * Replaces native number inputs with a custom UI that matches the design system.
 * 
 * Features:
 * - +/- buttons on left/right sides
 * - Keyboard input support (0-9, delete, backspace)
 * - Mouse wheel support (when focused)
 * - Arrow key support (ArrowUp/ArrowDown)
 * - Min/max constraints
 * - Integer/float support based on step value
 */
export default function NumericStepper({
  value,
  onChange,
  step = 1,
  min,
  max,
  className = '',
  disabled = false,
}: NumericStepperProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState<string>(String(value ?? ''));
  const [isEditing, setIsEditing] = useState(false);

  // Determine if this is an integer field (step >= 1 or undefined)
  const isIntegerField = !step || step >= 1;

  // Update display value when prop value changes (but not when user is editing)
  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(String(value ?? ''));
    }
  }, [value, isEditing]);

  // Handle mouse wheel and arrow keys
  useEffect(() => {
    if (!inputRef.current || disabled) return;
    
    const input = inputRef.current;
    
    const handleWheel = (e: WheelEvent) => {
      // Only handle wheel when input is focused
      if (document.activeElement !== input) return;
      
      e.preventDefault();
      const currentValue = typeof value === 'number' ? value : 0;
      const delta = e.deltaY < 0 ? 1 : -1;
      const newValue = isIntegerField 
        ? Math.round(currentValue + delta)
        : currentValue + delta * step;
      
      // Apply min/max constraints
      let constrainedValue = newValue;
      if (min !== undefined) constrainedValue = Math.max(constrainedValue, min);
      if (max !== undefined) constrainedValue = Math.min(constrainedValue, max);
      
      // Update display value immediately when using mouse wheel
      setDisplayValue(String(constrainedValue));
      onChange(constrainedValue);
    };
    
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Only handle arrow keys when input is focused
      if (document.activeElement !== input) return;
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentValue = typeof value === 'number' ? value : 0;
        const delta = e.key === 'ArrowUp' ? 1 : -1;
        const newValue = isIntegerField 
          ? Math.round(currentValue + delta)
          : currentValue + delta * step;
        
        // Apply min/max constraints
        let constrainedValue = newValue;
        if (min !== undefined) constrainedValue = Math.max(constrainedValue, min);
        if (max !== undefined) constrainedValue = Math.min(constrainedValue, max);
        
        // Update display value immediately when using arrow keys
        setDisplayValue(String(constrainedValue));
        onChange(constrainedValue);
      }
    };
    
    input.addEventListener('wheel', handleWheel, { passive: false });
    input.addEventListener('keydown', handleKeyDown);
    
    return () => {
      input.removeEventListener('wheel', handleWheel);
      input.removeEventListener('keydown', handleKeyDown);
    };
  }, [value, onChange, step, min, max, isIntegerField, disabled]);

  const handleDecrement = () => {
    if (disabled) return;
    const currentValue = typeof value === 'number' ? value : 0;
    const newValue = isIntegerField 
      ? Math.round(currentValue - step)
      : currentValue - step;
    
    let constrainedValue = newValue;
    if (min !== undefined) constrainedValue = Math.max(constrainedValue, min);
    if (max !== undefined) constrainedValue = Math.min(constrainedValue, max);
    
    onChange(constrainedValue);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const currentValue = typeof value === 'number' ? value : 0;
    const newValue = isIntegerField 
      ? Math.round(currentValue + step)
      : currentValue + step;
    
    let constrainedValue = newValue;
    if (min !== undefined) constrainedValue = Math.max(constrainedValue, min);
    if (max !== undefined) constrainedValue = Math.min(constrainedValue, max);
    
    onChange(constrainedValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // Allow empty string for editing
    if (inputValue === '' || inputValue === '-') {
      return;
    }
    
    // Parse the value
    const numValue = isIntegerField
      ? Math.round(parseFloat(inputValue || '0'))
      : parseFloat(inputValue || '0');
    
    if (!isNaN(numValue)) {
      let constrainedValue = numValue;
      if (min !== undefined) constrainedValue = Math.max(constrainedValue, min);
      if (max !== undefined) constrainedValue = Math.min(constrainedValue, max);
      onChange(constrainedValue);
    }
  };

  const handleInputFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsEditing(true);
    setDisplayValue(String(value ?? ''));
  };

  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    // Ensure display value matches the actual value on blur
    setDisplayValue(String(value ?? ''));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point, minus
    if ([46, 8, 9, 27, 13, 110, 190, 189].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <div className={`numeric-stepper ${className} ${disabled ? 'disabled' : ''}`}>
      <button
        type="button"
        className="numeric-stepper-button numeric-stepper-button-minus"
        onClick={handleDecrement}
        disabled={disabled || (min !== undefined && value <= min)}
        aria-label="Decrease value"
      >
        −
      </button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="numeric-stepper-input"
      />
      <button
        type="button"
        className="numeric-stepper-button numeric-stepper-button-plus"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        aria-label="Increase value"
      >
        +
      </button>
    </div>
  );
}

