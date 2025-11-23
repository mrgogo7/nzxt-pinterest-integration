/**
 * Overlay Preset Picker Modal
 * 
 * Modal for selecting overlay preset templates (Single, Dual, Triple, Quadruple InfoGraphic).
 */

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layout } from 'lucide-react';
import type { Lang } from '../../../i18n';
import { t } from '../../../i18n';
import { OVERLAY_TEMPLATES } from '../../../overlayPreset/templates';
import '../PresetManager/PresetManager.css';

export interface OverlayPresetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  lang: Lang;
}

/**
 * Maps template ID to i18n label key.
 */
function getTemplateLabelKey(templateId: string): string {
  const mapping: Record<string, string> = {
    'single-infographic': 'overlayPresetSingle',
    'dual-infographic': 'overlayPresetDual',
    'triple-infographic': 'overlayPresetTriple',
    'quadruple-infographic': 'overlayPresetQuad',
  };
  return mapping[templateId] || templateId;
}

export default function OverlayPresetPickerModal({
  isOpen,
  onClose,
  onSelect,
  lang,
}: OverlayPresetPickerModalProps) {
  // Dynamically generate template list from OVERLAY_TEMPLATES
  const templates = useMemo(() => {
    return Object.keys(OVERLAY_TEMPLATES).map(templateId => ({
      id: templateId,
      labelKey: getTemplateLabelKey(templateId),
    }));
  }, []);

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

  const handleTemplateSelect = (templateId: string) => {
    onSelect(templateId);
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preset-modal-header">
              <div className="preset-conflict-header-content">
                <Layout size={20} className="preset-conflict-icon" />
                <h3>{t('overlayPresetPickerTitle', lang)}</h3>
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
              {/* 2x2 Grid Layout */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '8px 0',
              }}>
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    style={{
                      padding: '16px',
                      background: '#2c2c2c',
                      border: '1px solid #3a3a3a',
                      borderRadius: '8px',
                      color: '#f2f2f2',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                      minHeight: '80px',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = '#3a3a3a';
                      e.currentTarget.style.borderColor = '#8a2be2';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = '#2c2c2c';
                      e.currentTarget.style.borderColor = '#3a3a3a';
                    }}
                  >
                    <Layout size={24} style={{ color: '#8a2be2' }} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                      {t(template.labelKey, lang)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="preset-modal-actions">
              <button
                type="button"
                className="preset-modal-button preset-modal-button-secondary"
                onClick={onClose}
              >
                {t('cancel', lang)}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

