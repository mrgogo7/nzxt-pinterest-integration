import React, { useEffect, useState } from "react";

/*
  ================================================================
   KrakenOverlay
   LCD render surface for NZXT Kraken Elite.

   - Reads media URL + settings from localStorage (same keys as ConfigPreview)
   - Mirrors the LCD transform logic (scale, offset, align, fit)
   - Adds basic "Single Infographic" overlay support
   - Uses REAL NZXT API if available
   - If NZXT API is not available (browser), metrics stay static (no auto-increase)
  ================================================================
*/

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
}

interface Settings {
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
  overlay?: OverlaySettings; // keep optional for backward compatibility
}

/**
 * Default overlay config when none is stored yet.
 */
const DEFAULT_OVERLAY: OverlaySettings = {
  mode: "none",
  primaryMetric: "cpuTemp",
  numberColor: "#ffffff",
  textColor: "#cccccc",
};

/**
 * Default visual settings (must match ConfigPreview logic).
 */
const DEFAULTS: Settings = {
  scale: 1,
  x: 0,
  y: 0,
  fit: "cover",
  align: "center",
  loop: true,
  autoplay: true,
  mute: true,
  resolution: "640 x 640",
  showGuide: false,
  overlay: DEFAULT_OVERLAY,
};

/**
 * Storage keys shared with the ConfigPreview component.
 */
const CFG_KEY = "nzxtPinterestConfig";
const CFG_COMPAT = "nzxtMediaConfig";
const URL_KEY = "media_url";

/**
 * Convert alignment setting to base percentage anchor.
 */
function getBaseAlign(align: Settings["align"]) {
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
      return { x: 50, y: 50 }; // center
  }
}

/**
 * Metrics hook:
 * - If NZXT CAM API is present → subscribe to onMonitoringDataUpdate
 * - If not present (plain browser) → keep defaults, DO NOT animate
 */
function useMetrics() {
  const [data, setData] = useState({
    cpuTemp: 0,
    cpuLoad: 0,
    cpuClock: 0,
    liquidTemp: 0,
    gpuTemp: 0,
    gpuLoad: 0,
    gpuClock: 0,
  });

  useEffect(() => {
    // ---- FIND REAL NZXT API IN ALL POSSIBLE LOCATIONS ----
    const api =
      (window as any)?.nzxt?.v1 ||
      (window as any)?.NZXT?.v1 ||
      (window as any)?.NZXTV1 ||
      (window as any)?.NZXTv1;

    if (api) {
      console.log("[NZXT] API detected:", api);

      try {
        // Some CAM versions require initializing data stream
        if (typeof api.start === "function") {
          console.log("[NZXT] start() called");
          api.start();
        }

        // Some versions require explicit request for monitoring data
        if (typeof api.requestMonitoringData === "function") {
          console.log("[NZXT] requestMonitoringData() called");
          api.requestMonitoringData();
        }

        // Main listener for monitoring data
        if (typeof api.onMonitoringDataUpdate === "function") {
          console.log("[NZXT] onMonitoringDataUpdate registered");

          api.onMonitoringDataUpdate((packet: any) => {
            const cpu = packet.cpu || {};
            const gpu = packet.gpu || {};
            const liquid = packet.liquid || {};

            setData({
              cpuTemp: cpu.temperature ?? cpu.temp ?? 0,
              cpuLoad: cpu.load ?? 0,
              cpuClock: cpu.clockSpeed ?? cpu.clock ?? 0,

              gpuTemp: gpu.temperature ?? gpu.temp ?? 0,
              gpuLoad: gpu.load ?? 0,
              gpuClock: gpu.clockSpeed ?? gpu.clock ?? 0,

              liquidTemp: liquid.temperature ?? liquid.temp ?? 0,
            });
          });

          return; // <<--- IMPORTANT: stop mock mode
        }
      } catch (err) {
        console.error("[NZXT] API error:", err);
      }
    }

    // ---- FALLBACK MOCK (browser / unsupported CAM) ----
    console.warn("[NZXT] Monitoring API not found → using mock values");

    const interval = setInterval(() => {
      setData({
        cpuTemp: 41,
        cpuLoad: 28,
        cpuClock: 4490,
        liquidTemp: 36,
        gpuTemp: 52,
        gpuLoad: 30,
        gpuClock: 1770,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return data;
}
/**
 * Single infographic overlay rendered on top of the media.
 */
function SingleOverlay({
  overlay,
  metrics,
}: {
  overlay: OverlaySettings;
  metrics: ReturnType<typeof useMetrics>;
}) {
  if (overlay.mode !== "single") return null;

  const key = overlay.primaryMetric;
  const value = (metrics as any)[key];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "80px",
          fontWeight: 700,
          color: overlay.numberColor,
          lineHeight: 0.9,
        }}
      >
        {typeof value === "number" ? Math.round(value) : value}
      </div>
      <div
        style={{
          fontSize: "26px",
          color: overlay.textColor,
          marginTop: -6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {key}
      </div>
    </div>
  );
}

/**
 * KrakenOverlay:
 * - No props (safe for ?kraken=1 entry)
 * - Reads from localStorage (same data model as ConfigPreview)
 * - Renders the LCD-sized media (640x640) with the same transform logic
 * - Draws overlays on top of the media
 */
export default function KrakenOverlay() {
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const metrics = useMetrics();

  // Determine LCD size from NZXT if available, otherwise default to 640.
  const lcdResolution = (window as any)?.nzxt?.v1?.width || 640;
  const lcdSize = lcdResolution; // square LCD

  // Load from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(URL_KEY);
    const savedCfg =
      localStorage.getItem(CFG_KEY) || localStorage.getItem(CFG_COMPAT);

    if (savedCfg) {
      try {
        const parsed = JSON.parse(savedCfg);

        const mergedOverlay: OverlaySettings = {
          ...DEFAULT_OVERLAY,
          ...(parsed.overlay || {}),
        };

        setSettings({
          ...DEFAULTS,
          ...parsed,
          overlay: mergedOverlay,
        });

        setMediaUrl(parsed.url || savedUrl || "");
      } catch {
        console.warn(
          "[KrakenOverlay] Failed to parse saved config, using defaults.",
        );
        setSettings(DEFAULTS);
        setMediaUrl(savedUrl || "");
      }
    } else {
      setSettings(DEFAULTS);
      setMediaUrl(savedUrl || "");
    }
  }, []);

  // Listen for config changes (ConfigPreview updates localStorage + storage events)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === URL_KEY && e.newValue !== null) {
        setMediaUrl(e.newValue);
      }
      if (e.key === CFG_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const mergedOverlay: OverlaySettings = {
            ...DEFAULT_OVERLAY,
            ...(parsed.overlay || {}),
          };

          setSettings({
            ...DEFAULTS,
            ...parsed,
            overlay: mergedOverlay,
          });
        } catch {
          // ignore malformed payloads
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isVideo =
    /\.mp4($|\?)/i.test(mediaUrl) || mediaUrl.toLowerCase().includes("mp4");

  const base = getBaseAlign(settings.align);

  // settings.x / settings.y are REAL LCD px offsets
  const objectPosition = `calc(${base.x}% + ${settings.x}px) calc(${base.y}% + ${settings.y}px)`;

  const overlayConfig: OverlaySettings = {
    ...DEFAULT_OVERLAY,
    ...(settings.overlay || {}),
  };

  return (
    <div
      style={{
        position: "relative",
        width: `${lcdSize}px`,
        height: `${lcdSize}px`,
        overflow: "hidden",
        borderRadius: "50%",
        background: "#000",
      }}
    >
      {isVideo ? (
        <video
          src={mediaUrl}
          autoPlay={settings.autoplay}
          muted={settings.mute}
          loop={settings.loop}
          playsInline
          style={{
            width: `${lcdSize}px`,
            height: `${lcdSize}px`,
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
            alt="NZXT LCD"
            style={{
              width: `${lcdSize}px`,
              height: `${lcdSize}px`,
              objectFit: settings.fit,
              objectPosition,
              transform: `scale(${settings.scale})`,
              transformOrigin: "center center",
            }}
          />
        )
      )}

      {/* Single Infographic overlay (more modes will be added later) */}
      <SingleOverlay overlay={overlayConfig} metrics={metrics} />
    </div>
  );
}
