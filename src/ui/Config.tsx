import React, { useEffect, useState } from 'react';
import { LANG_KEY, Lang, t, getInitialLang, setLang } from '../i18n';
import ConfigPreview from './components/ConfigPreview';
import './styles/ConfigPreview.css';
import { DEFAULT_MEDIA_URL, DEFAULT_SETTINGS } from '../constants/defaults';
import { useMediaUrl } from '../hooks/useMediaUrl';
import { useConfig } from '../hooks/useConfig';

export default function Config() {
  const [lang, setLangState] = useState<Lang>(getInitialLang());
  const { mediaUrl, setMediaUrl } = useMediaUrl();
  const { setSettings } = useConfig();
  const [urlInput, setUrlInput] = useState<string>(mediaUrl);

  // Sync urlInput with mediaUrl changes
  useEffect(() => {
    setUrlInput(mediaUrl);
  }, [mediaUrl]);

  // language sync listener
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY && e.newValue) {
        setLangState(e.newValue as Lang);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Lang;
    setLangState(newLang);
    setLang(newLang);
  };

  const handleSave = () => {
    // Update media URL (useMediaUrl hook handles storage sync)
    setMediaUrl(urlInput);
  };

  const handleReset = () => {
    if (!window.confirm(t('resetConfirm', lang))) return;

    // Reset to defaults
    setMediaUrl(DEFAULT_MEDIA_URL);
    setUrlInput(DEFAULT_MEDIA_URL);
    
    // Reset settings to defaults (including overlay)
    // Note: url is stored separately via useMediaUrl, not in settings
    setSettings(DEFAULT_SETTINGS);
  };


  return (
    <div className="config-page">
      {/* top header */}
      <header className="config-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 className="config-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700, lineHeight: '1.2' }}>
            NZXT Elite Screen Customizer v5.11.15
          </h1>
          <div style={{ fontSize: '12px', color: '#9aa3ad', fontWeight: 400, lineHeight: '1.2' }}>
            by Gokhan AKGUL (mRGogo)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <a
              href="https://github.com/mrgogo7"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#bfc6d4', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#bfc6d4'}
              title="GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23 1.957-.544 4.06-.544 6.13.205 2.12-1.552 3.168-1.23 3.168-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/mrgogo_/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#bfc6d4', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#bfc6d4'}
              title="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/gokhanakgul/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3BI91N3P7USemf6aEYxYSnjA%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#bfc6d4', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#bfc6d4'}
              title="LinkedIn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="header-actions">
          {/* Language - En üst sağ köşe */}
          <div className="header-actions-top">
            <label className="lang-label" htmlFor="lang-select">
              {t("language", lang)}
            </label>
            <select
              id="lang-select"
              className="lang-select"
              value={lang}
              onChange={handleLangChange}
            >
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>

          {/* Quick Presets ve Reset - Altında */}
          <div className="header-actions-bottom">
            <button className="quick-presets-btn" disabled title={t("quickPresets", lang)}>
              {t("quickPresets", lang)}
            </button>
            <button className="reset-btn" onClick={handleReset}>
              {t("reset", lang)}
            </button>
          </div>
        </div>
      </header>

      {/* URL Section */}
      <section className="url-section">
        <label className="url-label">
          {t("urlLabel", lang)}
        </label>
        <div className="url-row">
          <input
            id="mediaUrl"
            type="text"
            className="url-input"
            placeholder={t("urlPlaceholder", lang)}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button onClick={handleSave} className="save-btn">
            {t("save", lang)}
          </button>
        </div>
        <p className="hint">{t("note", lang)}</p>
      </section>

      {/* Preview + Settings */}
      <ConfigPreview />
    </div>
  );
}
