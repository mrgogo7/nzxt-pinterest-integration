/**
 * Remove Confirmation Modal
 * 
 * Modal for confirming removal of an overlay element.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import type { Lang } from '../../../i18n';
import { t } from '../../../i18n';
import '../PresetManager/PresetManager.css';

export interface RemoveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lang: Lang;
  elementType: 'metric' | 'text' | 'divider';
}

export default function RemoveConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  lang,
  elementType,
}: RemoveConfirmationModalProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getElementTypeLabel = () => {
    if (elementType === 'metric') {
      return t('reading', lang) || 'Reading';
    } else if (elementType === 'text') {
      return t('text', lang) || 'Text';
    } else {
      return t('divider', lang) || 'Divider';
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
            tabIndex={-1}
          >
            <div className="preset-modal-header">
              <div className="preset-conflict-header-content">
                <AlertTriangle size={20} className="preset-conflict-icon" />
                <h3>{t('removeElementConfirmTitle', lang) || `Remove ${getElementTypeLabel()}`}</h3>
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
                {t('removeElementConfirm', lang) || `Are you sure you want to remove this ${getElementTypeLabel().toLowerCase()}? This action cannot be undone.`}
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
                onClick={handleConfirm}
              >
                {t('remove', lang) || 'Remove'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

