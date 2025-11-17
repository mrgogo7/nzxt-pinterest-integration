import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface ResetButtonProps {
  onClick: () => void;
  tooltipContent: string;
  tooltipId?: string;
}

/**
 * Reset button component with tooltip support.
 * Used throughout ConfigPreview for resetting settings to defaults.
 */
export default function ResetButton({ 
  onClick, 
  tooltipContent, 
  tooltipId = 'reset-tooltip' 
}: ResetButtonProps) {
  return (
    <motion.button
      className="reset-icon"
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltipContent}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <RefreshCw size={14} />
    </motion.button>
  );
}

