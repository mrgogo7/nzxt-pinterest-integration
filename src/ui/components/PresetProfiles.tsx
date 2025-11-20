/**
 * Preset Profiles Component
 * 
 * Dropdown menu for exporting and importing preset profiles.
 * Integrates with the preset system to save/load complete configurations.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportPreset, importPreset } from '../../preset';
import type { AppSettings } from '../../constants/defaults';
import type { Lang } from '../../i18n';
import { t } from '../../i18n';
import './PresetProfiles.css';

export interface PresetProfilesProps {
  /** Current language */
  lang: Lang;
  /** Current app settings */
  settings: AppSettings;
  /** Settings setter function */
  setSettings: (settings: Partial<AppSettings>) => void;
  /** Current media URL */
  mediaUrl: string;
  /** Media URL setter function */
  setMediaUrl: (url: string) => void;
  /** Optional callback when import starts (for showing loading state) */
  onImportStart?: () => void;
  /** Optional callback when import completes (for showing success/error) */
  onImportComplete?: (success: boolean, message?: string) => void;
}

export default function PresetProfiles({
  lang,
  settings,
  setSettings,
  mediaUrl,
  setMediaUrl,
  onImportStart,
  onImportComplete,
}: PresetProfilesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      await exportPreset(settings, mediaUrl);
      // Export success (file download triggered automatically)
    } catch (error) {
      console.error('[PresetProfiles] Export failed:', error);
      if (onImportComplete) {
        onImportComplete(false, t('presetExportError', lang));
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    setIsOpen(false);
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    onImportStart?.();

    try {
      const result = await importPreset(file);
      
      // Apply imported settings
      setSettings(result.settings);
      
      // Apply imported media URL
      setMediaUrl(result.mediaUrl);

      // Clear file input so same file can be imported again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onImportComplete?.(true, t('presetImportSuccess', lang));
    } catch (error) {
      console.error('[PresetProfiles] Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : t('presetImportError', lang);
      onImportComplete?.(false, errorMessage);

      // Clear file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="preset-profiles-container" ref={dropdownRef}>
      <button
        className="preset-profiles-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || isImporting}
        title={t('presetProfiles', lang)}
      >
        <span>{t('presetProfiles', lang)}</span>
        <ChevronDown 
          size={16} 
          className={`preset-profiles-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="preset-profiles-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <button
              className="preset-profiles-option"
              onClick={handleExport}
              disabled={isExporting || isImporting}
            >
              <Download size={16} />
              <span>{t('presetExport', lang)}</span>
              {isExporting && <span className="preset-profiles-loading">...</span>}
            </button>

            <button
              className="preset-profiles-option"
              onClick={handleImportClick}
              disabled={isExporting || isImporting}
            >
              <Upload size={16} />
              <span>{t('presetImport', lang)}</span>
              {isImporting && <span className="preset-profiles-loading">...</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept=".nzxt-esc-preset"
        onChange={handleImportFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}

