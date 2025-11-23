/**
 * Import Overlay Modal
 * 
 * Modal for choosing Replace/Append mode after successful file import.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import type { OverlayElement } from '../../../types/overlay';
import type { Lang } from '../../../i18n';
import { t } from '../../../i18n';
import { MAX_OVERLAY_ELEMENTS, wouldExceedElementLimit } from '../../../utils/overlaySettingsHelpers';
import '../PresetManager/PresetManager.css';

export interface ImportOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (elements: OverlayElement[], mode: 'replace' | 'append') => void;
  importedElements: OverlayElement[];
  currentElementCount: number;
  lang: Lang;
}

export default function ImportOverlayModal({
  isOpen,
  onClose,
  onImport,
  importedElements,
  currentElementCount,
  lang,
}: ImportOverlayModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Handle Replace button click
  const handleReplace = () => {
    if (importedElements.length > 0) {
      onImport(importedElements, 'replace');
      onClose();
    }
  };

  // Handle Append button click
  const handleAppend = () => {
    if (importedElements.length === 0) return;
    
    // Check element limit for append mode
    if (wouldExceedElementLimit(currentElementCount, importedElements.length)) {
      const message = t('overlayMaxElementsWarning', lang)
        .replace('{max}', String(MAX_OVERLAY_ELEMENTS))
        .replace('{count}', String(importedElements.length));
      alert(message);
      return; // Don't close modal, just show warning
    }
    
    onImport(importedElements, 'append');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="preset-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="preset-import-conflict-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            tabIndex={-1}
          >
            <div className="preset-modal-header">
              <div className="preset-conflict-header-content">
                <Upload size={20} className="preset-conflict-icon" />
                <h3>{t('overlayImportModalTitle', lang)}</h3>
              </div>
              <button
                className="preset-modal-close"
                onClick={onClose}
                aria-label={t('close', lang)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="preset-modal-content">
              <p className="preset-conflict-message">
                {t('overlayImportModalDescription', lang)}
              </p>
            </div>

            <div className="preset-modal-actions">
              <button
                type="button"
                className="preset-modal-button preset-modal-button-secondary"
                onClick={onClose}
              >
                {t('cancel', lang)}
              </button>
              <button
                type="button"
                className="preset-modal-button preset-modal-button-primary"
                onClick={handleReplace}
              >
                {t('overlayImportReplace', lang)}
              </button>
              <button
                type="button"
                className="preset-modal-button preset-modal-button-primary"
                onClick={handleAppend}
              >
                {t('overlayImportAppend', lang)}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

