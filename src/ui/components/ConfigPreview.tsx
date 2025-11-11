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
  scale: 1.0,
  x: 0,
  y: 0,
  fit: "cover",
  align: "center",
  loop: true,
  autoplay: true,
  mute: true,
  resolution: `${window.innerWidth} x ${window.innerHeight}`,
};

export default function ConfigPreview() {
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const lcdResolution = (window as any)?.nzxt?.v1?.width || 640;
  const previewSize = 200;
  const offsetScale = previewSize / lcdResolution;

  useEffect(() => {
    const cfgRaw = localStorage.getItem("nzxtMediaConfig");
    const cfg = cfgRaw ? safeParse(cfgRaw) : {};
    const activeUrl =
      localStorage.getItem("media_url") || (cfg as any).url || "";
    setMediaUrl(activeUrl);
    setSettings({ ...DEFAULTS, ...(cfg || {}) });
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "media_url" && e.newValue !== null) setMediaUrl(e.newValue);
      if (e.key === "nzxtMediaConfig" && e.newValue) {
        const parsed = safeParse(e.newValue);
        if (parsed) setSettings((prev) => ({ ...prev, ...parsed }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const current =
      safeParse(localStorage.getItem("nzxtMediaConfig") || "{}") || {};
    const next = { ...current, ...settings, url: current.url ?? mediaUrl };
    localStorage.setItem("nzxtMediaConfig", JSON.stringify(next));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "nzxtMediaConfig",
        newValue: JSON.stringify(next),
      })
    );
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const isVideo =
    /\.mp4($|\?)/i.test(mediaUrl) || mediaUrl.toLowerCase().includes("mp4");

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

  const adjX = settings.x * offsetScale;
  const adjY = settings.y * offsetScale;
  const objectPosition = `calc(${base.x}% + ${adjX}px) calc(${base.y}% + ${adjY}px)`;

  // 🧭 fareyle sürükleme
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

    setSettings((prev) => ({
      ...prev,
      x: prev.x + Math.round(dx / offsetScale),
      y: prev.y + Math.round(dy / offsetScale),
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

  return (
    <div className="config-wrapper">
      <div className="preview-column">
        <div className="preview-title">LCD Preview</div>
        <div
          className={`preview-circle ${isDragging ? "dragging" : ""}`}
          onMouseDown={handleMouseDown}
        >
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
                display: "block",
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
                  display: "block",
                }}
              />
            )
          )}

          {showGuide && (
            <div
              className={`overlay-guide align-${settings.align}`}
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
            Overlay Guide Göster
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

          <label>X Offset (px)</label>
          <input
            type="number"
            value={settings.x}
            onChange={(e) =>
              handleChange("x", parseInt(e.target.value || "0", 10))
            }
          />

          <label>Y Offset (px)</label>
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

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
