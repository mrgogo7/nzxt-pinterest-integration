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

/* ------------------------------------------------------------------
   Overlay Settings (Global Shape)
-------------------------------------------------------------------*/
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

  numberFont: string;
  textFont: string;

  numberSize: number;
  textSize: number;
}

/* ------------------------------------------------------------------
   Main Settings
-------------------------------------------------------------------*/
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

/* ------------------------------------------------------------------
   Defaults
-------------------------------------------------------------------*/
const DEFAULT_OVERLAY: OverlaySettings = {
  mode: "none",
  primaryMetric: "cpuTemp",
  numberColor: "#ffffff",
  textColor: "#cccccc",
  numberFont: "arial-bold",
  textFont: "arial-bold",
  numberSize: 80,
  textSize: 26,
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
  overlay: DEFAULT_OVERLAY,
};

const CFG_KEY = "nzxtPinterestConfig";
const CFG_COMPAT = "nzxtMediaConfig";
const URL_KEY = "media_url";

export default function ConfigPreview() {
  /* ------------------------------------------------------------------
     State
  -------------------------------------------------------------------*/
  const [lang, setLang] = useState<Lang>(getInitialLang());
  const [mediaUrl, setMediaUrl] = useState("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const hasLoadedRef = useRef(false);
  const hasInteractedRef = useRef(false);

  /* ------------------------------------------------------------------
     LCD + Preview Scaling (unchanged original correct logic)
  -------------------------------------------------------------------*/
  const lcdResolution = (window as any)?.nzxt?.v1?.width || 640;
  const previewSize = 200; // preview circle size
  const offsetScale = previewSize / lcdResolution;

  /* ------------------------------------------------------------------
     Load FROM localStorage on mount
  -------------------------------------------------------------------*/
  useEffect(() => {
    const savedUrl = localStorage.getItem(URL_KEY);
    const savedCfg =
      localStorage.getItem(CFG_KEY) || localStorage.getItem(CFG_COMPAT);

    if (savedCfg) {
      try {
        const parsed = JSON.parse(savedCfg);

        const cleaned = Object.fromEntries(
          Object.entries(parsed).filter(([_, v]) => v !== undefined && v !== null),
        );

        const mergedOverlay: OverlaySettings = {
          ...DEFAULT_OVERLAY,
          ...(cleaned.overlay || {}),
        };

        setSettings({ ...DEFAULTS, ...cleaned, overlay: mergedOverlay });
        setMediaUrl(cleaned.url || savedUrl || "");
      } catch {
        console.warn("⚠️ Failed to parse saved config.");
        setSettings(DEFAULTS);
        setMediaUrl(savedUrl || "");
      }
    } else {
      setSettings(DEFAULTS);
      setMediaUrl(savedUrl || "");
    }

    const langStored = localStorage.getItem(LANG_KEY);
    if (!langStored) setLang(getInitialLang());

    hasLoadedRef.current = true;
  }, []);

  /* ------------------------------------------------------------------
     Enable real-time sync AFTER user interaction
  -------------------------------------------------------------------*/
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

  /* ------------------------------------------------------------------
     Sync TO localStorage (throttled ~100ms)
  -------------------------------------------------------------------*/
  const lastSyncRef = useRef(0);
  useEffect(() => {
    if (!hasLoadedRef.current || !hasInteractedRef.current) return;

    const now = Date.now();
    if (now - lastSyncRef.current < 100) return;
    lastSyncRef.current = now;

    const save = { url: mediaUrl, ...settings };
    const payload = JSON.stringify(save);

    localStorage.setItem(CFG_KEY, payload);
    localStorage.setItem(CFG_COMPAT, payload);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CFG_KEY,
        newValue: payload,
      }),
    );
  }, [mediaUrl, settings]);

  /* ------------------------------------------------------------------
     Listen for storage events from KrakenOverlay
  -------------------------------------------------------------------*/
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === URL_KEY && e.newValue !== null) setMediaUrl(e.newValue);

      if (e.key === CFG_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);

          const mergedOverlay: OverlaySettings = {
            ...DEFAULT_OVERLAY,
            ...(parsed.overlay || {}),
          };

          setSettings((p) => ({ ...p, ...parsed, overlay: mergedOverlay }));
        } catch {}
      }

      if (e.key === LANG_KEY && e.newValue) {
        setLang(e.newValue as Lang);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ------------------------------------------------------------------
     Helpers
  -------------------------------------------------------------------*/
  const isVideo = /\.mp4($|\?)/i.test(mediaUrl);

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

  /* ------------------------------------------------------------------
     Drag Move
  -------------------------------------------------------------------*/
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
  }, [isDragging]);

  /* ------------------------------------------------------------------
     Wheel Zoom
  -------------------------------------------------------------------*/
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
        scale: Math.min(Math.max(parseFloat((p.scale + delta).toFixed(2)), 0.1), 5),
      }));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  /* ------------------------------------------------------------------
     Reset Field
  -------------------------------------------------------------------*/
  const resetField = (field: keyof Settings) =>
    setSettings((p) => ({ ...p, [field]: DEFAULTS[field] }));

  /* ------------------------------------------------------------------
     Render
  -------------------------------------------------------------------*/
  return (
    <div className="config-wrapper">

      {/* LEFT SIDE - PREVIEW */}
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
            <button onClick={() => setSettings((p) => ({ ...p, scale: Math.max(0.1, p.scale - 0.1) }))}>−</button>
            <button onClick={() => setSettings((p) => ({ ...p, scale: Math.min(5, p.scale + 0.1) }))}>＋</button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - SETTINGS */}
      <div className="settings-column">
        <div className="panel">

          {/* PANEL HEADER */}
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

          {/* MAIN SETTINGS */}
          <div className="settings-grid-modern">
            {/* Scale / X / Y */}
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
                {[
                  { key: "center", icon: <AlignVerticalSpaceAround size={16} /> },
                  { key: "top", icon: <AlignStartHorizontal size={16} /> },
                  { key: "bottom", icon: <AlignEndHorizontal size={16} /> },
                  { key: "left", icon: <AlignStartVertical size={16} /> },
                  { key: "right", icon: <AlignEndVertical size={16} /> },
                ].map(({ key, icon }) => (
                  <button
                    key={key}
                    className={`icon-btn ${settings.align === key ? "active" : ""}`}
                    onClick={() => setSettings((p) => ({ ...p, align: key as any }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <button
                className="reset-icon"
                onClick={() => resetField("align")}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* FIT */}
            <div className="setting-row">
              <label>{t("fit", lang)}</label>
              <div className="icon-group">
                {[
                  { key: "cover", icon: <Move size={16} /> },
                  { key: "contain", icon: <MoveDiagonal size={16} /> },
                  { key: "fill", icon: <MoveHorizontal size={16} /> },
                ].map(({ key, icon }) => (
                  <button
                    key={key}
                    className={`icon-btn ${settings.fit === key ? "active" : ""}`}
                    onClick={() => setSettings((p) => ({ ...p, fit: key as any }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <button
                className="reset-icon"
                onClick={() => resetField("fit")}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------------
               OVERLAY SETTINGS PANEL
          -------------------------------------------------------------------*/}
          <div style={{ marginTop: 20, borderTop: "1px solid #2c2f3a", paddingTop: 16 }}>
            <h3 style={{ color: "#dce2f5", fontSize: 14, marginBottom: 8 }}>
              Overlay Options
            </h3>

            {/* Overlay Mode */}
            <div className="setting-row">
              <label>Overlay Mode</label>
              <select
                value={settings.overlay.mode}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    overlay: { ...p.overlay, mode: e.target.value as OverlayMode },
                  }))
                }
                style={{
                  flex: 1,
                  background: "#181a21",
                  border: "1px solid #2d3140",
                  color: "#fff",
                  padding: "6px 8px",
                  borderRadius: 8,
                }}
              >
                <option value="none">None</option>
                <option value="single">Single Infographic</option>
                <option value="dual" disabled>Dual (coming soon)</option>
                <option value="triple" disabled>Triple (coming soon)</option>
              </select>
            </div>

            {/* Only show when Single Infographic */}
            {settings.overlay.mode === "single" && (
              <>
                {/* Primary Metric */}
                <div className="setting-row" style={{ marginTop: 12 }}>
                  <label>Primary Metric</label>
                  <select
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
                    style={{
                      flex: 1,
                      background: "#181a21",
                      border: "1px solid #2d3140",
                      color: "#fff",
                      padding: "6px 8px",
                      borderRadius: 8,
                    }}
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

                {/* Number Color */}
                <div className="setting-row" style={{ marginTop: 10 }}>
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
                    style={{ width: 60, height: 30 }}
                  />
                </div>

                {/* Text Color */}
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
                    style={{ width: 60, height: 30 }}
                  />
                </div>

                {/* Number Font */}
                <div className="setting-row" style={{ marginTop: 10 }}>
                  <label>Number Font</label>
                  <select
                    value={settings.overlay.numberFont}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        overlay: { ...p.overlay, numberFont: e.target.value },
                      }))
                    }
                    style={{
                      flex: 1,
                      background: "#181a21",
                      border: "1px solid #2d3140",
                      color: "#fff",
                      padding: "6px 8px",
                      borderRadius: 8,
                    }}
                  >
                    <option value="arial-bold">Arial Bold</option>
                    <option value="gotham-bold">Gotham Bold</option>
                  </select>
                </div>

                {/* Text Font */}
                <div className="setting-row">
                  <label>Text Font</label>
                  <select
                    value={settings.overlay.textFont}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        overlay: { ...p.overlay, textFont: e.target.value },
                      }))
                    }
                    style={{
                      flex: 1,
                      background: "#181a21",
                      border: "1px solid #2d3140",
                      color: "#fff",
                      padding: "6px 8px",
                      borderRadius: 8,
                    }}
                  >
                    <option value="arial-bold">Arial Bold</option>
                    <option value="gotham-bold">Gotham Bold</option>
                  </select>
                </div>

                {/* Number Size */}
                <div className="setting-row" style={{ marginTop: 10 }}>
                  <label>Number Size</label>
                  <input
                    type="number"
                    value={settings.overlay.numberSize}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        overlay: {
                          ...p.overlay,
                          numberSize: parseInt(e.target.value || "80", 10),
                        },
                      }))
                    }
                    style={{ width: 80 }}
                  />
                </div>

                {/* Text Size */}
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
                          textSize: parseInt(e.target.value || "26", 10),
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
