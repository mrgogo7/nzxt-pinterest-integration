@font-face {
  font-family: "nzxt-extrabold";
  src: url("./fonts/NZXTExtraBold-Regular.otf") format("opentype");
  font-weight: 800;
  font-style: normal;
}
import React, { useEffect, useRef, useState } from "react";
import "../styles/ConfigPreview.css";
import { LANG_KEY, Lang, t, getInitialLang } from "../../i18n";
import {
  RefreshCw,
  Move,
  MoveDiagonal,
  MoveHorizontal,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignEndVertical,
  AlignVerticalSpaceAround,
} from "lucide-react";

/* ====================================================================================================
   OVERLAY SETTINGS
   Matches KrakenOverlay.tsx exactly
==================================================================================================== */

type OverlayMode = "none" | "single" | "dual" | "triple";

type OverlayMetricKey =
  | "cpuTemp"
  | "cpuLoad"
  | "cpuClock"
  | "liquidTemp"
  | "gpuTemp"
  | "gpuLoad"
  | "gpuClock";

interface OverlaySettings {
  mode: OverlayMode;
  primaryMetric: OverlayMetricKey;
  numberColor: string;
  textColor: string;
  numberSize: number;
  textSize: number;
}

/* ====================================================================================================
   MAIN SETTINGS MODEL
==================================================================================================== */

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

  overlay: OverlaySettings;
};

/* ====================================================================================================
   DEFAULTS
==================================================================================================== */

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

  overlay: {
    mode: "none",
    primaryMetric: "cpuTemp",
    numberColor: "#ffffff",
    textColor: "#ffffff",
    numberSize: 180,
    textSize: 80,
	fontFamily: "nzxt-extrabold",
  },
};

const CFG_KEY = "nzxtPinterestConfig";
const CFG_COMPAT = "nzxtMediaConfig";
const URL_KEY = "media_url";

/* ====================================================================================================
   COMPONENT
==================================================================================================== */

export default function ConfigPreview() {
  const [lang, setLang] = useState<Lang>(getInitialLang());
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const hasLoadedRef = useRef(false);
  const hasInteractedRef = useRef(false);

  /* ====================================================================================================
     REAL LCD WIDTH + PREVIEW SIZE
  ==================================================================================================== */

  const lcdResolution = (window as any)?.nzxt?.v1?.width || 640;
  const previewSize = 200;
  const offsetScale = previewSize / lcdResolution; // ★ ESKİ DOĞRU FORMÜL

  /* ====================================================================================================
     LOAD SETTINGS
  ==================================================================================================== */

  useEffect(() => {
    const savedUrl = localStorage.getItem(URL_KEY);
    const savedCfg =
      localStorage.getItem(CFG_KEY) || localStorage.getItem(CFG_COMPAT);

    if (savedCfg) {
      try {
        const parsed = JSON.parse(savedCfg);
        const merged: Settings = {
          ...DEFAULTS,
          ...parsed,
          overlay: {
            ...DEFAULTS.overlay,
            ...(parsed.overlay || {}),
          },
        };
        setSettings(merged);
        setMediaUrl(parsed.url || savedUrl || "");
      } catch {
        setSettings(DEFAULTS);
        setMediaUrl(savedUrl || "");
      }
    } else {
      setSettings(DEFAULTS);
      setMediaUrl(savedUrl || "");
    }

    if (!localStorage.getItem(LANG_KEY)) {
      setLang(getInitialLang());
    }

    hasLoadedRef.current = true;
  }, []);

  /* ====================================================================================================
     ENABLE REALTIME AFTER FIRST USER ACTION
  ==================================================================================================== */

  useEffect(() => {
    const enableRealtime = () => (hasInteractedRef.current = true);
    window.addEventListener("mousedown", enableRealtime, { once: true });
    window.addEventListener("wheel", enableRealtime, { once: true });
    window.addEventListener("keydown", enableRealtime, { once: true });

    return () => {
      window.removeEventListener("mousedown", enableRealtime);
      window.removeEventListener("wheel", enableRealtime);
      window.removeEventListener("keydown", enableRealtime);
    };
  }, []);

  /* ====================================================================================================
     LISTEN FOR EXTERNAL UPDATES
  ==================================================================================================== */

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === URL_KEY && e.newValue) setMediaUrl(e.newValue);

      if (e.key === CFG_KEY || e.key === CFG_COMPAT) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setSettings((prev) => ({
              ...prev,
              ...parsed,
              overlay: {
                ...prev.overlay,
                ...(parsed.overlay || {}),
              },
            }));
          } catch {}
        }
      }

      if (e.key === LANG_KEY && e.newValue) {
        setLang(e.newValue as Lang);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ====================================================================================================
     THROTTLED SAVE
  ==================================================================================================== */

  const lastSync = useRef(0);

  useEffect(() => {
    if (!hasLoadedRef.current || !hasInteractedRef.current) return;

    const now = Date.now();
    if (now - lastSync.current < 100) return;
    lastSync.current = now;

    const save = {
      url: mediaUrl,
      ...settings,
    };

    localStorage.setItem(CFG_KEY, JSON.stringify(save));
    localStorage.setItem(CFG_COMPAT, JSON.stringify(save));

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CFG_KEY,
        newValue: JSON.stringify(save),
      })
    );
  }, [mediaUrl, settings]);

  /* ====================================================================================================
     VIDEO DETECT
  ==================================================================================================== */

  const isVideo =
    /\.mp4($|\?)/i.test(mediaUrl) || mediaUrl.toLowerCase().includes("mp4");

  /* ====================================================================================================
     POSITIONING (ESKİ DOĞRU SİSTEM)
  ==================================================================================================== */

  const base = (() => {
    switch (settings.align) {
      case "top":
        return { x: 50, y: 0 };
      case "bottom":
        return { x: 50, y: 100 };
      case "left":
        return { x: 0, y: 50 };
      case "right":
        return { x: 100, y: 50 };
      default:
        return { x: 50, y: 50 };
    }
  })();

  // ★ ESKİ DOĞRU FORMÜL
  const adjX = settings.x * offsetScale;
  const adjY = settings.y * offsetScale;

  const objectPosition = `calc(${base.x}% + ${adjX}px) calc(${base.y}% + ${adjY}px)`;

  /* ====================================================================================================
     DRAG (ESKİ DOĞRU FORMÜL)
  ==================================================================================================== */

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

    // ★ LCD PIXEL OFFSET = dx / offsetScale
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
  }, [isDragging]);

  /* ====================================================================================================
     ZOOM
  ==================================================================================================== */

  useEffect(() => {
    const circle = document.querySelector(".preview-circle");
    if (!circle) return;

    const onWheel = (e: WheelEvent) => {
      if (!circle.contains(e.target as Node)) return;

      e.preventDefault();
      const step = e.ctrlKey ? 0.2 : 0.1;
      const delta = e.deltaY < 0 ? step : -step;

      setSettings((p) => ({
        ...p,
        scale: Math.min(
          Math.max(parseFloat((p.scale + delta).toFixed(2)), 0.1),
          5
        ),
      }));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  /* ====================================================================================================
     HELPERS
  ==================================================================================================== */

  const adjustScale = (d: number) =>
    setSettings((p) => ({
      ...p,
      scale: Math.min(
        Math.max(parseFloat((p.scale + d).toFixed(2)), 0.1),
        5
      ),
    }));

  const resetField = (field: keyof Settings) =>
    setSettings((p) => ({
      ...p,
      [field]: DEFAULTS[field],
    }));

  /* ====================================================================================================
     ICON DATA
  ==================================================================================================== */

  const alignIcons = [
    { key: "center", icon: <AlignVerticalSpaceAround size={16} /> },
    { key: "top", icon: <AlignStartHorizontal size={16} /> },
    { key: "bottom", icon: <AlignEndHorizontal size={16} /> },
    { key: "left", icon: <AlignStartVertical size={16} /> },
    { key: "right", icon: <AlignEndVertical size={16} /> },
  ];

  const fitIcons = [
    { key: "cover", icon: <Move size={16} /> },
    { key: "contain", icon: <MoveDiagonal size={16} /> },
    { key: "fill", icon: <MoveHorizontal size={16} /> },
  ];

  /* ====================================================================================================
     RENDER
  ==================================================================================================== */

  return (
    <div className="config-wrapper">
      {/* LEFT PREVIEW */}
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

          <div className="zoom-buttons-bottom">
            <button onClick={() => adjustScale(-0.1)}>−</button>
            <button onClick={() => adjustScale(0.1)}>＋</button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="settings-column">
        {/* ============================================================================================
            MAIN PANEL
        ============================================================================================ */}
        <div className="panel">
          <div className="panel-header">
            <h3>{t("settingsTitle", lang)}</h3>

            <div className="overlay-toggle-compact">
              <span>{t("overlayGuide", lang)}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!!settings.showGuide}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      showGuide: e.target.checked,
                    }))
                  }
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          <div className="settings-grid-modern">
            {/* SCALE / X / Y */}
            {[
              { field: "scale", label: t("scale", lang), step: 0.1 },
              { field: "x", label: t("xOffset", lang) },
              { field: "y", label: t("yOffset", lang) },
            ].map(({ field, label, step }) => (
              <div className="setting-row" key={field}>
                <label>{label}</label>

                <input
                  type="number"
                  step={step || 1}
                  value={(settings as any)[field]}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      [field]: parseFloat(e.target.value || "0"),
                    }))
                  }
                />

                <button
                  className="reset-icon"
                  title="Reset"
                  onClick={() => resetField(field as keyof Settings)}
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            ))}

            {/* ALIGN */}
            <div className="setting-row">
              <label>{t("align", lang)}</label>
              <div className="icon-group">
                {alignIcons.map(({ key, icon }) => (
                  <button
                    key={key}
                    className={`icon-btn ${
                      settings.align === key ? "active" : ""
                    }`}
                    title={t(`align${key[0].toUpperCase() + key.slice(1)}`, lang)}
                    onClick={() =>
                      setSettings((p) => ({
                        ...p,
                        align: key as any,
                      }))
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

            {/* FIT */}
            <div className="setting-row">
              <label>{t("fit", lang)}</label>
              <div className="icon-group">
                {fitIcons.map(({ key, icon }) => (
                  <button
                    key={key}
                    className={`icon-btn ${
                      settings.fit === key ? "active" : ""
                    }`}
                    title={t(`fit${key[0].toUpperCase() + key.slice(1)}`, lang)}
                    onClick={() =>
                      setSettings((p) => ({
                        ...p,
                        fit: key as any,
                      }))
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

        {/* ============================================================================================
            OVERLAY PANEL
        ============================================================================================ */}
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-header">
            <h3>Overlay Options</h3>
          </div>

          <div className="settings-grid-modern">
            {/* Overlay Mode */}
            <div className="setting-row">
              <label>Overlay</label>
              <select
                className="url-input"
                style={{ maxWidth: 180 }}
                value={settings.overlay.mode}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    overlay: {
                      ...p.overlay,
                      mode: e.target.value as OverlayMode,
                    },
                  }))
                }
              >
                <option value="none">None</option>
                <option value="single">Single Infographic</option>
                <option value="dual">Dual Infographic</option>
                <option value="triple">Triple Infographic</option>
              </select>
            </div>

            {/* PRIMARY READING */}
            {settings.overlay.mode === "single" && (
              <>
                <div className="setting-row">
                  <label>Primary Reading</label>
                  <select
                    className="url-input"
                    style={{ maxWidth: 180 }}
                    value={settings.overlay.primaryMetric}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        overlay: {
                          ...p.overlay,
                          primaryMetric: e.target.value as OverlayMetricKey,
                        },
                      }))
                    }
                  >
                    <option value="cpuTemp">CPU Temperature</option>
                    <option value="cpuLoad">CPU Load</option>
                    <option value="cpuClock">CPU Clock</option>
                    <option value="liquidTemp">Liquid Temperature</option>
                    <option value="gpuTemp">GPU Temperature</option>
                    <option value="gpuLoad">GPU Load</option>
                    <option value="gpuClock">GPU Clock</option>
                  </select>
                </div>

                <div className="setting-row">
                  <label>Number Color</label>
                  <input
                    type="color"
                    value={settings.overlay.numberColor}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        overlay: {
                          ...p.overlay,
                          numberColor: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="setting-row">
                  <label>Text Color</label>
                  <input
                    type="color"
                    value={settings.overlay.textColor}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        overlay: {
                          ...p.overlay,
                          textColor: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="setting-row">
                  <label>Number Size</label>
                  <input
                    type="number"
                    value={settings.overlay.numberSize}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        overlay: {
                          ...p.overlay,
                          numberSize: parseInt(
                            e.target.value || "180",
                            10
                          ),
                        },
                      }))
                    }
                    style={{ width: 80 }}
                  />
                </div>

                <div className="setting-row">
                  <label>Text Size</label>
                  <input
                    type="number"
                    value={settings.overlay.textSize}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        overlay: {
                          ...p.overlay,
                          textSize: parseInt(e.target.value || "80", 10),
                        },
                      }))
                    }
                    style={{ width: 80 }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
