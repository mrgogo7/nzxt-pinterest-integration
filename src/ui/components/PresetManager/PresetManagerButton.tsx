/**
 * Preset Manager Button with Quick Favorites Dropdown
 * 
 * Features:
 * - Button text: "Preset Manager"
 * - Hover: Shows quick favorites dropdown
 * - Click: Opens full Preset Manager
 * - Glow animation on preset apply
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check } from 'lucide-react';
import type { Lang } from '../../../i18n';
import { t } from '../../../i18n';
import type { AppSettings } from '../../../constants/defaults';
import { 
  getPresets, 
  getActivePresetId, 
  setActivePresetId,
  type StoredPreset 
} from '../../../preset/storage';
import { isFavorite } from '../../../preset/storage';

export interface PresetManagerButtonProps {
  lang: Lang;
  onOpenManager: () => void;
  setSettings: (settings: Partial<AppSettings>) => void;
  setMediaUrl: (url: string) => void;
}

export default function PresetManagerButton({
  lang,
  onOpenManager,
  setSettings,
  setMediaUrl,
}: PresetManagerButtonProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get favorite presets
  const favoritePresets = getPresets().filter(p => isFavorite(p));
  const activePresetId = getActivePresetId();

  // Handle hover with delay
  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Open dropdown if there are favorite presets
    if (favoritePresets.length > 0) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    // Set delayed close timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsHovering(false);
      hoverTimeoutRef.current = null;
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsHovering(false);
      }
    };

    if (isHovering) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isHovering]);

  const handlePresetApply = (preset: StoredPreset) => {
    // Disable autosave during preset apply
    if (typeof window !== 'undefined') {
      window.__disableAutosave = true;
    }

    // Apply preset to config state
    setSettings({
      ...preset.preset.background.settings,
      overlay: preset.preset.overlay,
      showGuide: preset.preset.misc?.showGuide,
    });
    setMediaUrl(preset.preset.background.url);
    
    // Set active preset ID
    setActivePresetId(preset.id);

    // Close dropdown
    setIsHovering(false);

    // Trigger glow animation
    setIsGlowing(true);
    setTimeout(() => {
      setIsGlowing(false);
    }, 500);

    // Re-enable autosave after 300ms
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.__disableAutosave = false;
      }
    }, 300);
  };

  const handleButtonClick = () => {
    setIsHovering(false);
    onOpenManager();
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        className="preset-profiles-button"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        title={t('presetManager', lang)}
        style={{
          boxShadow: isGlowing 
            ? '0 0 20px rgba(138, 43, 226, 0.6), 0 0 40px rgba(138, 43, 226, 0.4)' 
            : 'none',
          transition: 'box-shadow 0.5s ease',
        }}
      >
        {t('presetManager', lang)}
      </motion.button>

      <AnimatePresence>
        {isHovering && favoritePresets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              minWidth: '200px',
              background: '#1f1f1f',
              border: '1px solid #3a3a3a',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              overflow: 'hidden',
            }}
            onMouseEnter={() => {
              // Cancel close timeout when entering dropdown
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
            }}
            onMouseLeave={handleMouseLeave}
          >
            {/* Favorite presets list */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {favoritePresets.map((preset) => {
                const isActive = preset.id === activePresetId;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handlePresetApply(preset)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      borderBottom: '1px solid #2a2a2a',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2a2a2a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" style={{ flexShrink: 0 }} />
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#e5e5e5',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {preset.name}
                      </span>
                    </div>
                    {isActive && (
                      <span style={{
                        fontSize: '11px',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0,
                      }}>
                        <Check size={12} />
                        {t('activeLabel', lang)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Open Preset Manager link */}
            <div
              onClick={handleButtonClick}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderTop: '1px solid #2a2a2a',
                fontSize: '12px',
                color: '#9CA3AF',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a2a2a';
                e.currentTarget.style.color = '#e5e5e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              {t('openPresetManager', lang)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

