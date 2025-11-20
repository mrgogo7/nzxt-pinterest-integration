/**
 * Preset List Component
 * 
 * Displays list of presets with actions (Apply, Rename, Duplicate, Delete).
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Edit2, 
  Copy, 
  Trash2, 
  Check
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import type { StoredPreset } from '../../../preset/storage';
import { presetNameExists } from '../../../preset/storage';
import type { Lang } from '../../../i18n';
import { t } from '../../../i18n';
import './PresetManager.css';

export interface PresetListProps {
  presets: StoredPreset[];
  activePresetId: string | null;
  onApply: (preset: StoredPreset) => void;
  onRename: (preset: StoredPreset) => void;
  onDuplicate: (preset: StoredPreset) => void;
  onDelete: (preset: StoredPreset) => void;
  lang: Lang;
}

export default function PresetList({
  presets,
  activePresetId,
  onApply,
  onRename,
  onDuplicate,
  onDelete,
  lang,
}: PresetListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleRenameStart = (preset: StoredPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(preset.id);
    setRenameValue(preset.name);
  };

  const handleRenameConfirm = (presetId: string) => {
    const trimmed = renameValue.trim();
    const preset = presets.find(p => p.id === presetId);
    if (trimmed && preset && trimmed !== preset.name) {
      // Check if name already exists (excluding current preset)
      if (!presetNameExists(trimmed, presetId)) {
        // Update preset name via parent
        onRename({ ...preset, name: trimmed });
      }
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const defaultPresets = presets.filter(p => p.isDefault);
  const userPresets = presets.filter(p => !p.isDefault);

  const renderPresetItem = (preset: StoredPreset) => {
    const isActive = preset.id === activePresetId;
    const isRenaming = renamingId === preset.id;
    const presetId = `preset-${preset.id}`;

    return (
      <div
        key={preset.id}
        className={`preset-list-item ${isActive ? 'active' : ''}`}
        onDoubleClick={(e) => {
          // Don't trigger on double-clicking action buttons
          if ((e.target as HTMLElement).closest('.preset-action-btn')) {
            return;
          }
          onApply(preset);
        }}
      >
        <div className="preset-item-main">
          <div className="preset-item-info">
            {isRenaming ? (
              <input
                ref={renameInputRef}
                type="text"
                className="preset-item-name-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRenameConfirm(preset.id);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleRenameCancel();
                  }
                }}
                onBlur={() => handleRenameConfirm(preset.id)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="preset-item-name">
                {preset.name}
                {isActive && (
                  <span className="preset-active-badge">
                    <Check size={12} />
                    {t('presetActive', lang)}
                  </span>
                )}
              </div>
            )}
            {preset.isDefault && (
              <span className="preset-default-badge">{t('presetDefault', lang)}</span>
            )}
          </div>
          
          <div className="preset-item-actions">
            {!preset.isDefault && (
              <button
                className="preset-action-btn preset-action-delete"
                onClick={(e) => handleActionClick(e, () => onDelete(preset))}
                data-tooltip-id={`${presetId}-delete`}
                data-tooltip-content={t('presetDelete', lang)}
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              className="preset-action-btn preset-action-duplicate"
              onClick={(e) => handleActionClick(e, () => onDuplicate(preset))}
              data-tooltip-id={`${presetId}-duplicate`}
              data-tooltip-content={t('presetDuplicate', lang)}
            >
              <Copy size={14} />
            </button>
            <button
              className="preset-action-btn preset-action-rename"
              onClick={(e) => handleRenameStart(preset, e)}
              data-tooltip-id={`${presetId}-rename`}
              data-tooltip-content={t('presetRename', lang)}
            >
              <Edit2 size={14} />
            </button>
            <button
              className="preset-action-btn preset-action-apply"
              onClick={(e) => handleActionClick(e, () => onApply(preset))}
              data-tooltip-id={`${presetId}-apply`}
              data-tooltip-content={t('presetApply', lang)}
            >
              <Play size={14} />
            </button>
            
            {/* Tooltips */}
            {!preset.isDefault && <Tooltip id={`${presetId}-delete`} />}
            <Tooltip id={`${presetId}-duplicate`} />
            <Tooltip id={`${presetId}-rename`} />
            <Tooltip id={`${presetId}-apply`} />
          </div>
        </div>
      </div>
    );
  };

  if (presets.length === 0) {
    return (
      <div className="preset-list-empty">
        <p>{t('presetListEmpty', lang)}</p>
      </div>
    );
  }

  return (
    <div className="preset-list">
      {defaultPresets.length > 0 && (
        <div className="preset-list-section">
          <h4 className="preset-list-section-title">{t('presetDefaultPresets', lang)}</h4>
          <div className="preset-list-items">
            {defaultPresets.map(renderPresetItem)}
          </div>
        </div>
      )}
      
      {userPresets.length > 0 && (
        <div className="preset-list-section">
          <h4 className="preset-list-section-title">{t('presetUserPresets', lang)}</h4>
          <div className="preset-list-items">
            {userPresets.map(renderPresetItem)}
          </div>
        </div>
      )}
    </div>
  );
}


