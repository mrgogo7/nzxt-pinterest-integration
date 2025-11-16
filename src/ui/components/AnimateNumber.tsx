import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";

interface AnimateNumberProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
  decimalPlaces?: number;
  as?: "span" | "div";
}

/**
 * AnimateNumber component
 * Animates numeric values smoothly using Framer Motion's spring physics.
 * The number animates from its previous value to the new value, creating a
 * smooth counting effect rather than instant changes.
 */
export default function AnimateNumber({
  value,
  className,
  style,
  decimalPlaces = 0,
  as = "span",
}: AnimateNumberProps) {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  });

  const [displayValue, setDisplayValue] = useState<string>(() => {
    // Handle invalid values
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "-";
    }

    // Round to specified decimal places
    const rounded = decimalPlaces > 0 
      ? Number(value.toFixed(decimalPlaces))
      : Math.round(value);

    return `${rounded}`;
  });

  // Update display value when spring value changes
  useMotionValueEvent(springValue, "change", (latest) => {
    // Handle invalid values
    if (typeof latest !== "number" || Number.isNaN(latest)) {
      setDisplayValue("-");
      return;
    }

    // Round to specified decimal places
    const rounded = decimalPlaces > 0 
      ? Number(latest.toFixed(decimalPlaces))
      : Math.round(latest);

    setDisplayValue(`${rounded}`);
  });

  // Update motion value when prop value changes
  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  const Component = as === "div" ? motion.div : motion.span;

  return (
    <Component
      className={className}
      style={style}
    >
      {displayValue}
    </Component>
  );
}

