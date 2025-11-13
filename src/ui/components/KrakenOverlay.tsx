import React, { useEffect, useState } from "react";

/*
  ================================================================
   KrakenOverlay
   LCD render surface for NZXT Kraken Elite.

   - Reads media URL + settings from localStorage (same keys as ConfigPreview)
   - Mirrors the LCD transform logic (scale, offset, align, fit)
   - Adds basic "Single Infographic" overlay support
   - Uses REAL NZXT API when available
   - Falls back to MOCK animation only when API is missing
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
  overlay?: OverlaySettings;
}

const DEFAULT_OVERLAY: OverlaySettings = {
  mode: "none",
  primaryMetric: "cpuTemp",
  numberColor: "#ffffff",
  textColor: "#cccccc",
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
  resolution: "640 x 640",
  showGuide: false,
  overlay: DEFAULT_OVERLAY,
};

const CFG_KEY = "nzxtPinterestConfig";
const CFG_COMPAT = "nzxtMediaConfig";
const URL_KEY = "media_url";

/* --------------------------------------------------------------- */
/* Alignment mapping                                               */
/* --------------------------------------------------------------- */
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
      return { x: 50, y: 50 };
  }
}

/* --------------------------------------------------------------- */
/* REAL + MOCK metrics                                             */
/* --------------------------------------------------------------- */
function useMockOrRealMetrics() {
  const [data, setData] = useState({
    cpuTemp: 0,
    cpuLoad: 0,
    cpuClock: 0,
    liquidTemp: 0,
    gpuTemp: 0,
    gpuLoad: 0,
    gpuClock: 0,
  });

  const [hasRealAPI, setHasRealAPI] = useState(false);

  useEffect(() => {
    const nzxt = (window as any)?.nzxt?.v1;

    /* ---------------------------------------------------------------
       REAL NZXT CAM API (new v1 event-based system)
       If available → use real values and DISABLE mock entirely.
    --------------------------------------------------------------- */
    if (nzxt && typeof nzxt.onMonitoringDataUpdate === "function") {
      setHasRealAPI(true);

      nzxt.onMonitoringDataUpdate((packet: any) => {
        setData({
          cpuTemp: packet.cpu?.temperature ?? 0,
          cpuLoad: packet.cpu?.load ?? 0,
          cpuClock: packet.cpu?.clock ?? 0,
          liquidTemp: packet.liquid?.temperature ?? 0,
          gpuTemp: packet.gpu?.temperature ?? 0,
          gpuLoad: packet.gpu?.load ?? 0,
          gpuClock: packet.gpu?.clock ?? 0,
        });
      });

      return; // IMPORTANT — mock is skipped
    }

    /* ---------------------------------------------------------------
       MOCK MODE — only used in browser preview (!CAM)
    --------------------------------------------------------------- */
    setHasRealAPI(false);

    const interval = setInterval(() => {
      setData((prev) => ({
        cpuTemp: (prev.cpuTemp + 0.3) % 90,
        cpuLoad: (prev.cpuLoad + 1) % 100,
        cpuClock: 4500 + (prev.cpuClock % 200),
        liquidTemp: (prev.liquidTemp + 0.1) % 50,
        gpuTemp: (prev.gpuTemp + 0.2) % 80,
        gpuLoad: (prev.gpuLoad + 1.5) % 100,
        gpuClock: 1800 + (prev.gpuClock % 150),
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return data;
}

/* --------------------------------------------------------------- */
/* SINGLE overlay render                                           */
/* --------------------------------------------------------------- */
function SingleOverlay({
  overlay,
  metrics,
}: {
  overlay: OverlaySettings;
  metrics: ReturnType<typeof useMockOrRealMetrics>;
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
          fontSize: "24px",
          marginTop: -4,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: overlay.textColor,
        }}
      >
        {key}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- */
/* MAIN COMPONENT                                                  */
/* --------------------------------------------------------------- */
export default function KrakenOverlay() {
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const metrics = useMockOrRealMetrics();

  const lcdResolution = (window as any)?.nzxt?.v1?.width || 640;
  const lcdSize = lcdResolution;

  /* Load from storage on mount */
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
        setSettings(DEFAULTS);
        setMediaUrl(savedUrl || "");
      }
    } else {
      setSettings(DEFAULTS);
      setMediaUrl(savedUrl || "");
    }
  }, []);

  /* Listen for ConfigPreview changes */
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
        } catch {}
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isVideo =
    /\.mp4($|\?)/i.test(mediaUrl) || mediaUrl.toLowerCase().includes("mp4");

  const base = getBaseAlign(settings.align);
  const objectPosition = `calc(${base.x}% + ${settings.x}px) calc(${base.y}% + ${settings.y}px)`;

  const overlayCfg = {
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

      {/* Overlay */}
      <SingleOverlay overlay={overlayCfg} metrics={metrics} />
    </div>
  );
}
