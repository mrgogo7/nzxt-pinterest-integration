import React, { useState, useEffect, useRef } from "react";
import "../styles/ConfigPreview.css";

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
  resolution: `${window.innerWidth}x${window.innerHeight}`,
};

export default function ConfigPreview() {
  const [mediaUrl, setMediaUrl] = useState("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [showGuide, setShowGuide] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const lcdResolution = (window as any)?.nzxt?.v1?.width || 640;
  const previewSize = 200;
  const offsetScale = previewSize / lcdResolution;

  // ✅ 1. İlk yükleme — kalıcı ayarlar
  useEffect(() => {
    const cfgRaw =
      localStorage.getItem("nzxtPinterestConfig") ||
      localStorage.getItem("nzxtMediaConfig");
    const savedUrl = localStorage.getItem("media_url");
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
  }, []);

  // ✅ 2. Her değişiklikte kaydet (iki anahtara birden)
  useEffect(() => {
    const save = { url: mediaUrl, ...settings };
    localStorage.setItem("nzxtPinterestConfig", JSON.stringify(save));
    localStorage.setItem("nzxtMediaConfig", JSON.stringify(save));
  }, [mediaUrl, settings]);

  const handleChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => setSettings((p) => ({ ...p, [key]: value }));

  const isVideo =
    /\.mp4($|\?)/i.test(mediaUrl) || mediaUrl.toLowerCase().includes("mp4");

  // Align → base pozisyon
  const base =
    settings.align === "top"
      ? { x: 50, y: 0 }
      : settings.align === "bottom"
      ? { x: 50, y: 100 }
      : settings.align === "left"
      ? { x: 0, y: 50 }
      : settings.align === "right"
      ? { x: 100, y: 50 }
      : { x: 50, y: 50 };

  const adjX = settings.x * offsetScale;
  const adjY = settings.y * offsetScale;
  const objectPosition = `calc(${base.x}% + ${adjX}px) calc(${base.y}% + ${adjY}px)`;

  // 🖱️ Drag
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

  // 🧭 Mouse wheel zoom
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
        scale: Math.min(Math.max(p.scale + delta, 0.1), 5),
      }));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const adjustScale = (delta: number) =>
    setSettings((p) => ({
      ...p,
      scale: Math.min(Math.max(p.scale + delta, 0.1), 5),
    }));

  return (
    <div className="config-wrapper">
      <div className="preview-column">
        <div className="preview-title">LCD Preview</div>
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

          {showGuide && (
            <div
              className="overlay-guide"
              style={{
                transform: `translate(${settings.x * offsetScale}px, ${
                  settings.y * offsetScale
                }px) scale(${settings.scale})`,
              }}
            >
              <div className="crosshair horizontal" />
              <div className="crosshair vertical" />
            </div>
          )}

          {/* ✅ Zoom butonları dairenin içinde */}
          <div className="zoom-buttons-bottom">
            <button onClick={() => adjustScale(-0.1)}>−</button>
            <button onClick={() => adjustScale(0.1)}>＋</button>
          </div>
        </div>
      </div>

      <div className="settings-column">
        <div className="overlay-toggle">
          <label>
            <input
              type="checkbox"
              checked={showGuide}
              onChange={(e) => setShowGuide(e.target.checked)}
            />{" "}
            Overlay Guide
          </label>
        </div>

        <div className="settings-grid">
          <label>Scale</label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={settings.scale}
            onChange={(e) =>
              handleChange("scale", parseFloat(e.target.value || "1"))
            }
          />
          <label>X Offset</label>
          <input
            type="number"
            value={settings.x}
            onChange={(e) =>
              handleChange("x", parseInt(e.target.value || "0", 10))
            }
          />
          <label>Y Offset</label>
          <input
            type="number"
            value={settings.y}
            onChange={(e) =>
              handleChange("y", parseInt(e.target.value || "0", 10))
            }
          />
          <label>Align</label>
          <select
            value={settings.align}
            onChange={(e) =>
              handleChange("align", e.target.value as Settings["align"])
            }
          >
            <option>center</option>
            <option>top</option>
            <option>bottom</option>
            <option>left</option>
            <option>right</option>
          </select>
          <label>Fit</label>
          <select
            value={settings.fit}
            onChange={(e) =>
              handleChange("fit", e.target.value as Settings["fit"])
            }
          >
            <option>cover</option>
            <option>contain</option>
            <option>fill</option>
          </select>
        </div>
      </div>
    </div>
  );
}
