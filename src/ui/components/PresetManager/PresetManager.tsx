/**
 * Preset Manager Component
 * 
 * Main component for managing presets (drawer/modal).
 * Provides full preset management interface.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, Settings } from 'lucide-react';
import { 
  getPresets, 
  addPreset, 
  updatePreset, 
  deletePreset, 
  duplicatePreset,
  getActivePresetId,
  setActivePresetId,
  presetNameExists,
  generateUniquePresetName,
  type StoredPreset
} from '../../../preset/storage';
import { exportPreset, importPreset, type ImportResult } from '../../../preset';
import type { AppSettings } from '../../../constants/defaults';
import type { Lang } from '../../../i18n';
import { t } from '../../../i18n';
import PresetList from './PresetList';
import ExportNameModal from './ExportNameModal';
import ImportConflictModal from './ImportConflictModal';
import './PresetManager.css';

export interface PresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  settings: AppSettings;
  setSettings: (settings: Partial<AppSettings>) => void;
  mediaUrl: string;
  setMediaUrl: (url: string) => void;
}

export default function PresetManager({
  isOpen,
  onClose,
  lang,
  settings,
  setSettings,
  mediaUrl,
  setMediaUrl,
}: PresetManagerProps) {
  const [presets, setPresets] = useState<StoredPreset[]>([]);
  const [activePresetId, setActivePresetIdState] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictPresetName, setConflictPresetName] = useState('');
  const [conflictPreset, setConflictPreset] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load presets and active preset
  useEffect(() => {
    if (isOpen) {
      loadPresets();
      setActivePresetIdState(getActivePresetId());
    }
  }, [isOpen]);

  // Listen to storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nzxtPresets') {
        loadPresets();
      } else if (e.key === 'nzxtActivePresetId') {
        setActivePresetIdState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadPresets = () => {
    setPresets(getPresets());
  };

  const handleApply = (preset: StoredPreset) => {
    // Tüm ayarları tek bir çağrıda birleştir (background + overlay + misc)
    setSettings({
      ...preset.preset.background.settings,
      overlay: preset.preset.overlay,
      showGuide: preset.preset.misc?.showGuide,
    });
    setMediaUrl(preset.preset.background.url);
    setActivePresetId(preset.id);
    setActivePresetIdState(preset.id);
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleExportConfirm = async (presetName: string) => {
    try {
      await exportPreset(settings, mediaUrl, presetName);
      
      // Add to preset list
      const { createPresetFromState } = await import('../../../preset/index');
      const presetFile = createPresetFromState(settings, mediaUrl, presetName);
      
      const newPreset: StoredPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: presetName,
        preset: presetFile,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      addPreset(newPreset);
      loadPresets();
    } catch (error) {
      console.error('[PresetManager] Export failed:', error);
      alert(t('presetExportError', lang));
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result: ImportResult = await importPreset(file, lang);
      
      // Check if import was successful
      if (!result.success) {
        // Build error message from errors
        const errorMessages = result.errors?.map(err => err.userMessage || err.message).join('\n') || t('presetImportError', lang);
        alert(errorMessages);
        return;
      }

      // Check if we have required data
      if (!result.preset || !result.settings || !result.mediaUrl) {
        alert(t('presetImportError', lang));
        return;
      }

      const presetName = result.preset.presetName || `Preset ${new Date().toISOString().slice(0, 10)}`;
      
      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        const warningMessages = result.warnings.map(w => `${w.field}: ${w.message}`).join('\n');
        console.warn('[PresetManager] Import warnings:', warningMessages);
        // Optionally show warnings to user (non-blocking)
        // Could show a toast or modal here
      }

      // Show normalization changes if any
      if (result.normalizationChanges && result.normalizationChanges.length > 0) {
        const changeMessages = result.normalizationChanges.map(c => 
          `${c.field}: ${c.oldValue} → ${c.newValue}`
        ).join('\n');
        console.info('[PresetManager] Normalization changes:', changeMessages);
        // Optionally inform user about changes
      }
      
      // Check for conflict
      if (presetNameExists(presetName)) {
        setConflictPresetName(presetName);
        setConflictPreset(result.preset);
        setIsConflictModalOpen(true);
      } else {
        // No conflict, add directly
        const newPreset: StoredPreset = {
          id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: presetName,
          preset: result.preset,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addPreset(newPreset);
        loadPresets();
      }
    } catch (error) {
      console.error('[PresetManager] Import failed:', error);
      alert(error instanceof Error ? error.message : t('presetImportError', lang));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConflictOverwrite = () => {
    if (!conflictPreset) return;
    
    const existingPresets = getPresets();
    const existing = existingPresets.find(p => p.name === conflictPresetName);
    
    if (existing) {
      updatePreset(existing.id, {
        preset: conflictPreset,
        updatedAt: new Date().toISOString(),
      });
      loadPresets();
    }
    
    setIsConflictModalOpen(false);
    setConflictPreset(null);
    setConflictPresetName('');
  };

  const handleConflictDuplicate = () => {
    if (!conflictPreset) return;
    
    const uniqueName = generateUniquePresetName(conflictPresetName);
    const newPreset: StoredPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: uniqueName,
      preset: conflictPreset,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addPreset(newPreset);
    loadPresets();
    
    setIsConflictModalOpen(false);
    setConflictPreset(null);
    setConflictPresetName('');
  };

  const handleRename = (preset: StoredPreset) => {
    // Rename is now handled inline in PresetList component
    const trimmed = preset.name.trim();
    if (trimmed && !presetNameExists(trimmed, preset.id)) {
      updatePreset(preset.id, { name: trimmed });
      loadPresets();
    }
  };

  const handleDuplicate = (preset: StoredPreset) => {
    duplicatePreset(preset.id);
    loadPresets();
  };

  const handleDelete = (preset: StoredPreset) => {
    if (window.confirm(t('presetDeleteConfirm', lang).replace('{name}', preset.name))) {
      deletePreset(preset.id);
      loadPresets();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  return (
    <>
      {/* Modals - rendered outside drawer to appear in center of viewport */}
      <ExportNameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        lang={lang}
      />

      <ImportConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => {
          setIsConflictModalOpen(false);
          setConflictPreset(null);
          setConflictPresetName('');
        }}
        onOverwrite={handleConflictOverwrite}
        onDuplicate={handleConflictDuplicate}
        presetName={conflictPresetName}
        lang={lang}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="preset-manager-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            
            {/* Drawer */}
            <motion.div
              className="preset-manager-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onKeyDown={handleKeyDown}
            >
              <div className="preset-manager-header">
                <div className="preset-manager-title">
                  <Settings size={20} />
                  <h2>{t('presetManager', lang)}</h2>
                </div>
                <button
                  className="preset-manager-close"
                  onClick={onClose}
                  aria-label={t('close', lang)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="preset-manager-actions">
                <button
                  className="preset-manager-action-btn"
                  onClick={handleExport}
                >
                  <Download size={16} />
                  <span>{t('presetExport', lang)}</span>
                </button>
                <button
                  className="preset-manager-action-btn"
                  onClick={handleImport}
                >
                  <Upload size={16} />
                  <span>{t('presetImport', lang)}</span>
                </button>
              </div>

              <div className="preset-manager-content">
                <PresetList
                  presets={presets}
                  activePresetId={activePresetId}
                  onApply={handleApply}
                  onRename={handleRename}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  lang={lang}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept=".nzxt-esc-preset"
        onChange={handleImportFile}
        style={{ display: 'none' }}
      />

    </>
  );
}

