import React, { useEffect, useRef, useState } from "react";
import "../styles/ConfigPreview.css";
import { LANG_KEY, Lang, t, getInitialLang } from "../../i18n";
import {
  RefreshCw,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignLeft,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Square,
  StretchHorizontal,
} from "lucide-react";

// Persisted settings shape (kept backward compatible)
type Settings = {
  scale: number;
  x: number;
  y: number;
  fit: "cover" | "contain" | "fill";
  align: "center" | "top" | "bottom" | "left" | "right";
  loop: boolean;
  autoplay: boolean;
  mute: boolean;
  resolution: string;
  showGuide?: boolean;
};

const DEFAULTS: Settings = {
  scale: 1,
  x: 0,
  y: 0,
  fit: "cover",
  align: "center",
  loop: true,
  autoplay: true,
  mute: true,
  resolution: `${window.innerWidth} x ${window.innerHeight}`,
  showGuide: true,
};

const CFG_KEY = "nzxtPinterestConfig";
const CFG_COMPAT = "nzxtMediaConfig";
const URL_KEY = "media_url";

export default function ConfigPreview() {
  const [lang, setLang] = useState<Lang>(getInitialLang());
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  // Keep LCD vs preview offset parity
  const lcdResolution = (window as any)?.nzxt?.v1?.width || 640;
  const previewSize = 200;
  const offsetScale = previewSize / lcdResolution;

  // Load persisted state (config + url + lang)
  useEffect(() => {
    const cfgRaw = localStorage.getItem(CFG_KEY) || localStorage.getItem(CFG_COMPAT);
    const savedUrl = localStorage.getItem(URL_KEY);
    if (cfgRaw) {
      try {
        const parsed = JSON.parse(cfgRaw);
        setSettings({ ...DEFAULTS, ...parsed });
        setMediaUrl(parsed.url || savedUrl || "");
      } catch {
        setSettings(DEFAULTS);
        setMediaUrl(savedUrl || "");
      }
    } else {
      setSettings(DEFAULTS);
      setMediaUrl(savedUrl || "");
    }
    setLang(getInitialLang());
  }, []);

  // Listen storage changes for live sync (url/config/lang)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === URL_KEY && e.newValue !== null) setMediaUrl(e.newValue);
      if (e.key === CFG_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings((p) => ({ ...p, ...parsed }));
        } catch {}
      }
      if (e.key === LANG_KEY && e.newValue) setLang(e.newValue as Lang);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist everything on any change (keeps Overlay Guide and others sticky)
  useEffect(() => {
    const save = { url: mediaUrl, ...settings };
    localStorage.setItem(CFG_KEY, JSON.stringify(save));
    localStorage.setItem(CFG_COMPAT, JSON.stringify(save));
    // optional: broadcast for any passive listeners
    window.dispatchEvent(
      new StorageEvent("storage", { key: CFG_KEY, newValue: JSON.stringify(save) })
    );
  }, [mediaUrl, settings]);

  const isVideo =
    /\.mp4($|\?)/i.test(mediaUrl) || mediaUrl.toLowerCase().includes("mp4");

  // Compute object-position based on align + offsets
  const base = (() => {
    switch (settings.align) {
      case "top": return { x: 50, y: 0 };
      case "bottom": return { x: 50, y: 100 };
      case "left": return { x: 0, y: 50 };
      case "right": return { x: 100, y: 50 };
      default: return { x: 50, y: 50 };
    }
  })();
  const adjX = settings.x * offsetScale;
  const adjY = settings.y * offsetScale;
  const objectPosition = `calc(${base.x}% + ${adjX}px) calc(${base.y}% + ${adjY}px)`;

  // --- Drag to move (LCD-pixel-accurate via offsetScale) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setSettings((p) => ({
      ...p,
      x: p.x + Math.round(dx / offsetScale),
      y: p.y + Math.round(dy / offsetScale),
    }));
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // --- Mouse wheel zoom (with passive:false to prevent page scroll) ---
  useEffect(() => {
    const circle = document.querySelector(".preview-circle");
    if (!circle) return;

    const onWheel = (e: WheelEvent) => {
      if (!circle.contains(e.target as Node)) return;
      e.preventDefault();
      const step = e.shiftKey ? 0.05 : e.ctrlKey ? 0.2 : 0.1;
      const delta = e.deltaY < 0 ? step : -step;
      setSettings((p) => ({
        ...p,
        scale: Math.min(Math.max(parseFloat((p.scale + delta).toFixed(2)), 0.1), 5),
      }));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const adjustScale = (delta: number) =>
    setSettings((p) => ({
      ...p,
      scale: Math.min(Math.max(parseFloat((p.scale + delta).toFixed(2)), 0.1), 5),
    }));

  // Reset helper for any field
  const resetField = (field: keyof Settings) => {
    setSettings((p) => ({ ...p, [field]: DEFAULTS[field] }));
  };

  const alignIcons = [
    { key: "center", icon: <AlignCenterHorizontal size={16} /> },
    { key: "top", icon: <ArrowUp size={16} /> },
    { key: "bottom", icon: <ArrowDown size={16} /> },
    { key: "left", icon: <AlignLeft size={16} /> },
    { key: "right", icon: <AlignRight size={16} /> },
  ];

  const fitIcons = [
    { key: "cover", icon: <Maximize2 size={16} /> },
    { key: "contain", icon: <Square size={16} /> },
    { key: "fill", icon: <StretchHorizontal size={16} /> },
  ];

  return (
    <div className="config-wrapper">
      {/* LEFT: circular LCD preview */}
      <div className="preview-column">
        <div className="preview-title">{t("previewTitle", lang)}</div>

        <div
          className={`preview-circle ${isDragging ? "dragging" : ""}`}
          onMouseDown={handleMouseDown}
        >
          <div className="scale-label">Scale: {settings.scale.toFixed(2)}×</div>

          {isVideo ? (
            <video
              src={mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: settings.fit,
                objectPosition,
                transform: `scale(${settings.scale})`,
                transformOrigin: "center center",
              }}
            />
          ) : (
            mediaUrl && (
              <img
                src={mediaUrl}
                alt="preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: settings.fit,
                  objectPosition,
                  transform: `scale(${settings.scale})`,
                  transformOrigin: "center center",
                }}
              />
            )
          )}

          {settings.showGuide && (
            <div
              className="overlay-guide"
              style={{
                transform: `translate(${settings.x * offsetScale}px, ${
                  settings.y * offsetScale
                }px) scale(${settings.scale})`,
                transformOrigin: "center center",
              }}
            >
              <div className="crosshair horizontal" />
              <div className="crosshair vertical" />
            </div>
          )}

          {/* Zoom buttons (centered bottom inside the circle) */}
          <div className="zoom-buttons-bottom">
            <button onClick={() => adjustScale(-0.1)}>−</button>
            <button onClick={() => adjustScale(0.1)}>＋</button>
          </div>
        </div>
      </div>

      {/* RIGHT: modern "Preview Settings" panel */}
      <div className="settings-column">
        <div className="panel">
          {/* header: left-aligned title, right-aligned compact overlay toggle */}
          <div className="panel-header">
            <h3>{t("settingsTitle", lang)}</h3>

            <div className="overlay-toggle-compact">
              <span>{t("overlayGuide", lang)}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!!settings.showGuide}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, showGuide: e.target.checked }))
                  }
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          {/* compact rows: Label | Control | Reset */}
          <div className="settings-grid-modern">
            {/* Scale */}
            <div className="setting-row">
              <label>{t("scale", lang)}</label>
              <input
                type="number"
                step={0.1}
                min={0.1}
                value={settings.scale}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    scale: parseFloat(e.target.value || "1"),
                  }))
                }
              />
              <button
                className="reset-icon"
                title="Reset"
                onClick={() => resetField("scale")}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* X Offset */}
            <div className="setting-row">
              <label>{t("xOffset", lang)}</label>
              <input
                type="number"
                value={settings.x}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    x: parseInt(e.target.value || "0", 10),
                  }))
                }
              />
              <button
                className="reset-icon"
                title="Reset"
                onClick={() => resetField("x")}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Y Offset */}
            <div className="setting-row">
              <label>{t("yOffset", lang)}</label>
              <input
                type="number"
                value={settings.y}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    y: parseInt(e.target.value || "0", 10),
                  }))
                }
              />
              <button
                className="reset-icon"
                title="Reset"
                onClick={() => resetField("y")}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Align as icon group */}
            <div className="setting-row">
              <label>{t("align", lang)}</label>
              <div className="icon-group">
                {alignIcons.map(({ key, icon }) => (
                  <button
                    key={key}
                    className={`icon-btn ${settings.align === key ? "active" : ""}`}
                    title={t(`align${key[0].toUpperCase() + key.slice(1)}`, lang)}
                    onClick={() =>
                      setSettings((p) => ({ ...p, align: key as Settings["align"] }))
                    }
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <button
                className="reset-icon"
                title="Reset"
                onClick={() => resetField("align")}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Fit as icon group */}
            <div className="setting-row">
              <label>{t("fit", lang)}</label>
              <div className="icon-group">
                {fitIcons.map(({ key, icon }) => (
                  <button
                    key={key}
                    className={`icon-btn ${settings.fit === key ? "active" : ""}`}
                    title={t(`fit${key[0].toUpperCase() + key.slice(1)}`, lang)}
                    onClick={() =>
                      setSettings((p) => ({ ...p, fit: key as Settings["fit"] }))
                    }
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <button
                className="reset-icon"
                title="Reset"
                onClick={() => resetField("fit")}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
