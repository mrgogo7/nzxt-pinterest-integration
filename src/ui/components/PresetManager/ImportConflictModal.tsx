/**
 * Import Conflict Modal
 * 
 * Modal for handling preset name conflicts during import.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import type { Lang } from '../../../i18n';
import { t } from '../../../i18n';
import './PresetManager.css';

export interface ImportConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOverwrite: () => void;
  onDuplicate: () => void;
  presetName: string;
  lang: Lang;
}

export default function ImportConflictModal({
  isOpen,
  onClose,
  onOverwrite,
  onDuplicate,
  presetName,
  lang,
}: ImportConflictModalProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
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
            onKeyDown={handleKeyDown}
          >
            <div className="preset-modal-header">
              <div className="preset-conflict-header-content">
                <AlertTriangle size={20} className="preset-conflict-icon" />
                <h3>{t('presetConflictTitle', lang)}</h3>
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
                {t('presetConflictMessage', lang).replace('{name}', presetName)}
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
                className="preset-modal-button preset-modal-button-warning"
                onClick={onOverwrite}
              >
                {t('presetOverwrite', lang)}
              </button>
              <button
                type="button"
                className="preset-modal-button preset-modal-button-primary"
                onClick={onDuplicate}
              >
                {t('presetCreateDuplicate', lang)}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

