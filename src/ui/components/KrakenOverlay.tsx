import React, { useEffect, useMemo, useState, CSSProperties } from "react";

/**
 * KrakenOverlay
 *
 * This component is rendered only on the Kraken Browser (?kraken=1).
 * It reads the persisted media configuration from localStorage and
 * draws the background media (video/image) plus a Single Infographic
 * overlay that uses NZXT CAM monitoring data via window.nzxt.v1.onMonitoringDataUpdate.
 *
 * When running outside NZXT CAM (e.g. normal browser), monitoring data
 * will not be available and the overlay will gracefully fall back to "--".
 */

// Storage keys shared with the configuration UI
const CFG_KEY = "nzxtPinterestConfig";
const CFG_COMPAT = "nzxtMediaConfig";
const URL_KEY = "media_url";

type FitMode = "cover" | "contain" | "fill";
type AlignMode = "center" | "top" | "bottom" | "left" | "right";

type OverlayMode = "none" | "single" | "dual" | "triple";

// These keys must match what the configuration UI writes
export type PrimaryReadingKey =
  | "cpuTemp"
  | "cpuLoad"
  | "cpuClock"
  | "liquidTemp"
  | "gpuTemp"
  | "gpuLoad"
  | "gpuClock";

type Settings = {
  scale: number;
  x: number;
  y: number;
  fit: FitMode;
  align: AlignMode;
  loop: boolean;
  autoplay: boolean;
  mute: boolean;
  resolution: string;
  showGuide?: boolean;

  // Overlay-related fields (added by configuration UI)
  overlayMode?: OverlayMode;
  overlayPrimaryReading?: PrimaryReadingKey;
  overlayNumberColor?: string;
  overlayTextColor?: string;
};

// Reasonable defaults in case localStorage is empty or incomplete
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
  showGuide: false,
  overlayMode: "none",
  overlayPrimaryReading: "cpuTemp",
  overlayNumberColor: "#ffffff",
  overlayTextColor: "#ffffff",
};

// Very relaxed monitoring data type – we do not depend on exact typings here.
// Users can inspect the console to refine mappings if NZXT changes something.
type MonitoringData = any;

// Detect media type by URL
const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  return /\.mp4($|\?)/i.test(url) || url.toLowerCase().includes("mp4");
};

// Map reading key -> human readable label
const readingLabelMap: Record<PrimaryReadingKey, string> = {
  cpuTemp: "CPU Temperature",
  cpuLoad: "CPU Load",
  cpuClock: "CPU Clock Speed",
  liquidTemp: "Liquid Temperature",
  gpuTemp: "GPU Temperature",
  gpuLoad: "GPU Load",
  gpuClock: "GPU Clock Speed",
};

export default function KrakenOverlay() {
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);

  // === Load saved settings (shared with configuration UI) ===
  useEffect(() => {
    try {
      const savedUrl = window.localStorage.getItem(URL_KEY) || "";
      const savedCfg =
        window.localStorage.getItem(CFG_KEY) ||
        window.localStorage.getItem(CFG_COMPAT);

      if (savedCfg) {
        const parsed = JSON.parse(savedCfg);
        const merged: Settings = { ...DEFAULTS, ...parsed };
        setSettings(merged);
        setMediaUrl(parsed.url || savedUrl || "");
      } else {
        setSettings(DEFAULTS);
        setMediaUrl(savedUrl || "");
      }
    } catch (err) {
      console.warn("[KrakenOverlay] Failed to read config from storage:", err);
      setSettings(DEFAULTS);
    }
  }, []);

  // === Listen for storage changes (from Configuration Browser) ===
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;

      try {
        if (event.key === URL_KEY && event.newValue !== null) {
          setMediaUrl(event.newValue);
        }

        if ((event.key === CFG_KEY || event.key === CFG_COMPAT) && event.newValue) {
          const parsed = JSON.parse(event.newValue);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.warn("[KrakenOverlay] Failed to parse storage event:", err);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // === Hook into NZXT CAM monitoring data (if available) ===
  useEffect(() => {
    // If NZXT CAM is not running, window.nzxt will be undefined.
    const w = window as any;
    const existingNzxt = w.nzxt || {};

    // We do not overwrite nzxt.v1, we only extend it with our callback.
    const existingV1 = existingNzxt.v1 || {};
    const previousHandler = existingV1.onMonitoringDataUpdate;

    const nextV1 = {
      ...existingV1,
      onMonitoringDataUpdate: (data: MonitoringData) => {
        // Log once to help developers inspect the payload structure
        // (You can comment this out if it is too noisy in production.)
        // eslint-disable-next-line no-console
        console.debug("[KrakenOverlay] Monitoring data:", data);

        setMonitoring(data);

        // Call any existing handler just in case the user added one
        if (typeof previousHandler === "function") {
          try {
            previousHandler(data);
          } catch (err) {
            console.warn(
              "[KrakenOverlay] Error while invoking previous monitoring handler:",
              err
            );
          }
        }
      },
    };

    w.nzxt = {
      ...existingNzxt,
      v1: nextV1,
    };

    return () => {
      // Restore original handler on unmount
      const currentNzxt = (window as any).nzxt || {};
      const currentV1 = currentNzxt.v1 || {};
      (window as any).nzxt = {
        ...currentNzxt,
        v1: {
          ...currentV1,
          onMonitoringDataUpdate: previousHandler,
        },
      };
    };
  }, []);

  // === Compute object-position based on align + offsets ===
  const objectPosition = useMemo(() => {
    const { align, x, y } = settings;

    const base = (() => {
      switch (align) {
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

    // On the real Kraken LCD we treat x/y as device-pixel offsets.
    return `calc(${base.x}% + ${x}px) calc(${base.y}% + ${y}px)`;
  }, [settings.align, settings.x, settings.y]);

  // === Extract numeric value + unit + label from monitoring payload ===
  const { value, unit, label } = useMemo(() => {
    const key: PrimaryReadingKey =
      settings.overlayPrimaryReading || "cpuTemp";

    const data = monitoring || {};
    const cpus = data.cpus || [];
    const gpus = data.gpus || [];
    const kraken = data.kraken || {};

    const cpu = cpus[0] || {};
    const gpu = gpus[0] || {};

    const safeNumber = (raw: any): number | null => {
      if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
      return null;
    };

    const result = {
      value: "--",
      unit: "",
      label: readingLabelMap[key] ?? "Monitoring",
    };

    switch (key) {
      case "cpuTemp": {
        const n =
          safeNumber(cpu.temperature) ??
          safeNumber(cpu.temp) ??
          safeNumber(kraken.cpuTemp);
        if (n !== null) {
          return {
            value: Math.round(n).toString(),
            unit: "°C",
            label: readingLabelMap[key],
          };
        }
        break;
      }

      case "cpuLoad": {
        const n =
          safeNumber(cpu.load) ??
          safeNumber(cpu.usage) ??
          safeNumber(kraken.cpuLoad);
        if (n !== null) {
          return {
            value: Math.round(n).toString(),
            unit: "%",
            label: readingLabelMap[key],
          };
        }
        break;
      }

      case "cpuClock": {
        const n =
          safeNumber(cpu.clockSpeed) ??
          safeNumber(cpu.clock) ??
          safeNumber(kraken.cpuClock);
        if (n !== null) {
          return {
            value: Math.round(n).toString(),
            unit: "MHz",
            label: readingLabelMap[key],
          };
        }
        break;
      }

      case "liquidTemp": {
        const n =
          safeNumber(kraken.liquidTemp) ??
          safeNumber(kraken.liquidTemperature);
        if (n !== null) {
          return {
            value: Math.round(n).toString(),
            unit: "°C",
            label: readingLabelMap[key],
          };
        }
        break;
      }

      case "gpuTemp": {
        const n =
          safeNumber(gpu.temperature) ??
          safeNumber(gpu.temp) ??
          safeNumber(kraken.gpuTemp);
        if (n !== null) {
          return {
            value: Math.round(n).toString(),
            unit: "°C",
            label: readingLabelMap[key],
          };
        }
        break;
      }

      case "gpuLoad": {
        const n =
          safeNumber(gpu.load) ??
          safeNumber(gpu.usage) ??
          safeNumber(kraken.gpuLoad);
        if (n !== null) {
          return {
            value: Math.round(n).toString(),
            unit: "%",
            label: readingLabelMap[key],
          };
        }
        break;
      }

      case "gpuClock": {
        const n =
          safeNumber(gpu.clockSpeed) ??
          safeNumber(gpu.clock) ??
          safeNumber(kraken.gpuClock);
        if (n !== null) {
          return {
            value: Math.round(n).toString(),
            unit: "MHz",
            label: readingLabelMap[key],
          };
        }
        break;
      }

      default:
        break;
    }

    // Fallback when no numeric value is available
    return result;
  }, [monitoring, settings.overlayPrimaryReading]);

  // === Styles (inline to avoid extra CSS files for Kraken view) ===
  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    overflow: "hidden",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const mediaStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: settings.fit,
    objectPosition,
    transform: `scale(${settings.scale})`,
    transformOrigin: "center center",
  };

  const overlayWrapperStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    padding: "8px",
    boxSizing: "border-box",
  };

  const numberColor = settings.overlayNumberColor || "#ffffff";
  const textColor = settings.overlayTextColor || "#ffffff";

  const numberStyle: CSSProperties = {
    fontSize: "40px",
    fontWeight: 700,
    lineHeight: 1.1,
    color: numberColor,
    textShadow: "0 0 6px rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
  };

  const unitStyle: CSSProperties = {
    fontSize: "16px",
    opacity: 0.85,
  };

  const labelStyle: CSSProperties = {
    marginTop: "6px",
    fontSize: "14px",
    fontWeight: 500,
    color: textColor,
    opacity: 0.9,
    textAlign: "center",
    textShadow: "0 0 4px rgba(0,0,0,0.8)",
  };

  const showSingleOverlay = settings.overlayMode === "single";

  const isVideo = isVideoUrl(mediaUrl);

  return (
    <div style={containerStyle}>
      {/* Background media layer */}
      {mediaUrl &&
        (isVideo ? (
          <video
            src={mediaUrl}
            autoPlay={settings.autoplay}
            muted={settings.mute}
            loop={settings.loop}
            playsInline
            style={mediaStyle}
          />
        ) : (
          <img src={mediaUrl} alt="" style={mediaStyle} />
        ))}

      {/* Single Infographic overlay */}
      {showSingleOverlay && (
        <div style={overlayWrapperStyle}>
          <div style={numberStyle}>
            <span>{value}</span>
            {unit && <span style={unitStyle}>{unit}</span>}
          </div>
          <div style={labelStyle}>{label}</div>
        </div>
      )}
    </div>
  );
}
