import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignEndVertical,
  AlignVerticalSpaceAround,
  Move,
  MoveDiagonal,
  MoveHorizontal,
} from 'lucide-react';
import type { AppSettings } from '../../../constants/defaults';
import type { Lang, t as tFunction } from '../../../i18n';
import ResetButton from './ResetButton';
import NumericStepper from '../NumericStepper';

interface BackgroundSettingsProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  lang: Lang;
  t: typeof tFunction;
  resetField: (field: keyof AppSettings) => void;
}

/**
 * Background settings component.
 * Provides controls for scale, position, alignment, fit, and background color.
 */
export default function BackgroundSettings({
  settings,
  setSettings,
  lang,
  t,
  resetField,
}: BackgroundSettingsProps) {
  // Icon data
  const alignIcons = [
    { key: 'center', icon: <AlignVerticalSpaceAround size={16} /> },
    { key: 'top', icon: <AlignStartHorizontal size={16} /> },
    { key: 'bottom', icon: <AlignEndHorizontal size={16} /> },
    { key: 'left', icon: <AlignStartVertical size={16} /> },
    { key: 'right', icon: <AlignEndVertical size={16} /> },
  ];

  const fitIcons = [
    { key: 'cover', icon: <Move size={16} /> },
    { key: 'contain', icon: <MoveDiagonal size={16} /> },
    { key: 'fill', icon: <MoveHorizontal size={16} /> },
  ];

  return (
    <div className="settings-column">
      <div className="panel">
        <div className="panel-header">
          <h3>{t('settingsTitle', lang)}</h3>

          <div className="overlay-toggle-compact">
            <span>{t('overlayGuide', lang)}</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!settings.showGuide}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showGuide: e.target.checked,
                  })
                }
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        <div className="settings-grid-modern">
          {/* SCALE / X / Y */}
          {[
            { field: 'scale', label: t('scale', lang), step: 0.1, isInteger: false },
            { field: 'x', label: t('xOffset', lang), step: 1, isInteger: true },
            { field: 'y', label: t('yOffset', lang), step: 1, isInteger: true },
          ].map(({ field, label, step, isInteger }) => {
            return (
              <div className="setting-row" key={field}>
                <label>{label}</label>

                <NumericStepper
                  value={(settings as any)[field] ?? 0}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      [field]: isInteger 
                        ? Math.round(value)
                        : value,
                    })
                  }
                  step={step}
                  className="input-narrow"
                />

                <ResetButton
                  onClick={() => resetField(field as keyof AppSettings)}
                  tooltipContent={t('reset', lang)}
                />
              </div>
            );
          })}

          {/* ALIGN */}
          <div className="setting-row">
            <label>{t('align', lang)}</label>
            <div className="icon-group">
              {alignIcons.map(({ key, icon }) => (
                <motion.button
                  key={key}
                  className={`icon-btn ${settings.align === key ? 'active' : ''}`}
                  data-tooltip-id={`align-${key}-tooltip`}
                  data-tooltip-content={t(`align${key[0].toUpperCase() + key.slice(1)}`, lang)}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      align: key as AppSettings['align'],
                    })
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {icon}
                </motion.button>
              ))}
            </div>

            <ResetButton
              onClick={() => resetField('align')}
              tooltipContent={t('reset', lang)}
            />
          </div>

          {/* FIT */}
          <div className="setting-row">
            <label>{t('fit', lang)}</label>
            <div className="icon-group">
              {fitIcons.map(({ key, icon }) => (
                <motion.button
                  key={key}
                  className={`icon-btn ${settings.fit === key ? 'active' : ''}`}
                  data-tooltip-id={`fit-${key}-tooltip`}
                  data-tooltip-content={t(`fit${key[0].toUpperCase() + key.slice(1)}`, lang)}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      fit: key as AppSettings['fit'],
                    })
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {icon}
                </motion.button>
              ))}
            </div>

            <ResetButton
              onClick={() => resetField('fit')}
              tooltipContent={t('reset', lang)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

