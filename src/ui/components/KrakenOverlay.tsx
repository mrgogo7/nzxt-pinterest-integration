import React, { useEffect, useState } from "react";

/*
  ================================================================
   KrakenOverlay
   LCD render surface for NZXT Kraken Elite.

   - Reads media URL + settings from localStorage (same keys as ConfigPreview)
   - Mirrors the LCD transform logic (scale, offset, align, fit)
   - Adds basic "Single Infographic" overlay support
   - Registers window.nzxt.v1.onMonitoringDataUpdate so that CAM can
     push real monitoring data into this component on the Kraken Browser.
   - Does NOT require any props (safe for ?kraken=1 entry)
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
  numberSize: number;
  textSize: number;
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
  overlay?: OverlaySettings; // optional to stay compatible with old saved configs
}

/**
 * Default overlay config when none is stored yet.
 */
const DEFAULT_OVERLAY: OverlaySettings = {
  mode: "none",
  primaryMetric: "cpuTemp",
  numberColor: "#ffffff",
  textColor: "#cccccc",
  numberSize: 180,
  textSize: 80,
};

/**
 * Default visual settings (must match ConfigPreview logic).
 * NOTE: overlay is optional and will be merged with DEFAULT_OVERLAY at runtime.
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
 * Helper to safely pick first numeric value from a list of candidates.
 * This makes us resilient to small API changes on NZXT side.
 */
function pickNumeric(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === "number" && !Number.isNaN(v)) {
      return v;
    }
  }
  return 0;
}

/**
 * Shape of the metrics we care about inside the overlay.
 */
type OverlayMetrics = {
  cpuTemp: number;
  cpuLoad: number;
  cpuClock: number;
  liquidTemp: number;
  gpuTemp: number;
  gpuLoad: number;
  gpuClock: number;
};

/**
 * Default metrics used before the first monitoring payload arrives.
 */
const DEFAULT_METRICS: OverlayMetrics = {
  cpuTemp: 0,
  cpuLoad: 0,
  cpuClock: 0,
  liquidTemp: 0,
  gpuTemp: 0,
  gpuLoad: 0,
  gpuClock: 0,
};

/**
 * Map NZXT MonitoringData into the OverlayMetrics shape.
 * The field names are inferred from the public docs & types and guarded with
 * pickNumeric() so that missing properties simply become 0 instead of crashing.
 */
function mapMonitoringToOverlay(data: any): OverlayMetrics {
  const cpu0 = data?.cpus?.[0];
  const gpu0 = data?.gpus?.[0];
  const kraken = data?.kraken;

  // Raw loads
  const rawCpuLoad = pickNumeric(
    cpu0?.load,
    cpu0?.usage,
    cpu0?.totalLoad,
    cpu0?.processorLoad
  );

  const rawGpuLoad = pickNumeric(
    gpu0?.load,
    gpu0?.usage,
    gpu0?.totalLoad
  );

  // Convert if needed (0–1 → 0–100)
  const cpuLoad = rawCpuLoad <= 1 ? rawCpuLoad * 100 : rawCpuLoad;
  const gpuLoad = rawGpuLoad <= 1 ? rawGpuLoad * 100 : rawGpuLoad;

  return {
    // CPU Temp
    cpuTemp: pickNumeric(
      cpu0?.temperature,
      cpu0?.currentTemperature,
      cpu0?.packageTemperature
    ),

    // CPU Load (converted if needed)
    cpuLoad,

    // CPU Clock
    cpuClock: pickNumeric(
      cpu0?.clockSpeed,
      cpu0?.frequency,
      cpu0?.frequencyMHz,
      cpu0?.frequencyMhz,
      cpu0?.processorFrequency
    ),

    // Liquid Temp
    liquidTemp: pickNumeric(
      kraken?.liquidTemperature,
      kraken?.temperature,
      kraken?.liquidTemp
    ),

    // GPU Temp
    gpuTemp: pickNumeric(
      gpu0?.temperature,
      gpu0?.currentTemperature,
      gpu0?.gpuTemperature
    ),

    // GPU Load (converted if needed)
    gpuLoad,

    // GPU Clock
    gpuClock: pickNumeric(
      gpu0?.coreFrequency,
      gpu0?.clockSpeed,
      gpu0?.frequency,
      gpu0?.frequencyMHz,
      gpu0?.frequencyMhz,
      gpu0?.gpuFrequency
    ),
  };
}

/**
 * Hook to provide monitoring data.
 *
 * - On **Kraken Browser** (`?kraken=1`):
 *   We register `window.nzxt.v1.onMonitoringDataUpdate = handler`.
 *   CAM will call this function every second with real monitoring data.
 *
 * - On **normal browser**:
 *   There is no CAM, so we fall back to a lightweight mock animation so
 *   that the overlay still looks alive during development.
 */
function useMonitoringMetrics(): OverlayMetrics {
  const [metrics, setMetrics] = useState<OverlayMetrics>(DEFAULT_METRICS);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isKraken = searchParams.get("kraken") === "1";

    // Kraken Browser path: rely on real NZXT monitoring callback.
    if (isKraken) {
      const handler = (data: any) => {
        try {
          const mapped = mapMonitoringToOverlay(data);
          setMetrics(mapped);
        } catch (err) {
          // In case of unexpected payload shape, keep previous metrics.
          // eslint-disable-next-line no-console
          console.warn("[KrakenOverlay] Failed to map monitoring data:", err);
        }
      };

      const w = window as any;
      const prevNzxt = w.nzxt || {};
      const prevV1 = prevNzxt.v1 || {};

      // Attach our callback following the official docs (@nzxt/web-integrations-types).
      w.nzxt = {
        ...prevNzxt,
        v1: {
          ...prevV1,
          onMonitoringDataUpdate: handler,
        },
      };

      // eslint-disable-next-line no-console
      console.log(
        "[KrakenOverlay] Registered window.nzxt.v1.onMonitoringDataUpdate callback (Kraken Browser)."
      );

      // Cleanup: if we are still the active callback, remove ourselves.
      return () => {
        const current = (window as any).nzxt?.v1;
        if (current && current.onMonitoringDataUpdate === handler) {
          delete current.onMonitoringDataUpdate;
        }
      };
    }

    // Configuration / normal browser path: simple mock animation for development.
    // This will NEVER run inside NZXT Kraken Browser (because of the check above).
    // We keep it lightweight so it does not interfere with real monitoring data.
    // eslint-disable-next-line no-console
    console.log(
      "[KrakenOverlay] Not running as Kraken Browser (?kraken=1 missing). Using mock overlay metrics."
    );

    let t = 0;
    const interval = setInterval(() => {
      t += 1;
      setMetrics({
        cpuTemp: 40 + 10 * Math.sin(t / 15),
        cpuLoad: (t * 3) % 100,
        cpuClock: 4500 + (t % 200),
        liquidTemp: 35 + 5 * Math.sin(t / 40),
        gpuTemp: 50 + 15 * Math.sin(t / 25),
        gpuLoad: (t * 2) % 100,
        gpuClock: 1800 + (t % 150),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

/**
 * Decide label + value string (with unit) for the given metric key.
 */
function getOverlayLabelAndValue(
  key: OverlayMetricKey,
  rawValue: number
): {
  label: string;
  valueNumber: string;
  valueUnit: string;
  valueUnitType: "temp" | "percent" | "clock" | "none";
} {
  let label: string;
  let unit = "";
  let unitType: "temp" | "percent" | "clock" | "none" = "none";

  // CPU / GPU / Liquid label mapping
  if (key.startsWith("cpu")) label = "CPU";
  else if (key.startsWith("gpu")) label = "GPU";
  else if (key === "liquidTemp") label = "Liquid";
  else label = key.toUpperCase();

  // Units
  if (key === "cpuTemp" || key === "gpuTemp" || key === "liquidTemp") {
    unit = "°";
    unitType = "temp";
  } else if (key === "cpuLoad" || key === "gpuLoad") {
    unit = "%";
    unitType = "percent";
  } else if (key === "cpuClock" || key === "gpuClock") {
    unit = "MHz";
    unitType = "clock";
  }

  const rounded = Math.round(rawValue);
  const valueNumber =
    typeof rounded === "number" && !Number.isNaN(rounded)
      ? `${rounded}`
      : "-";

  return {
    label,
    valueNumber,
    valueUnit: unit,
    valueUnitType: unitType,
  };
}


/**
 * Single infographic overlay rendered on top of the media.
 * This is the first overlay mode we support.
 */
function SingleOverlay({
  overlay,
  metrics,
}: {
  overlay: OverlaySettings;
  metrics: OverlayMetrics;
}) {
  if (overlay.mode !== "single") return null;

  const key = overlay.primaryMetric;
  const value = metrics[key];

  const {
    label,
    valueNumber,
    valueUnit,
    valueUnitType,
  } = getOverlayLabelAndValue(key, value);

  const numberColor = overlay.numberColor;
  const textColor = overlay.textColor;

  const numberSize = overlay.numberSize;
  const unitSize =
    valueUnitType === "temp"
      ? numberSize * 0.49
      : valueUnitType === "percent"
      ? numberSize * 0.4
      : numberSize * 0.2;

  const isClock = valueUnitType === "clock";

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        fontFamily: "nzxt-extrabold",
      }}
    >
      {/* Number + Unit (side-by-side if NOT clock) */}
      {!isClock ? (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            lineHeight: 0.9,
          }}
        >
          <div
            style={{
              fontSize: `${numberSize}px`,
              fontWeight: 700,
              color: numberColor,
            }}
          >
            {valueNumber}
          </div>

          <div
            style={{
              fontSize: `${unitSize}px`,
              color: numberColor,
            }}
          >
            {valueUnit}
          </div>
        </div>
      ) : (
        <>
          {/* CLOCK number */}
          <div
            style={{
              fontSize: `${numberSize}px`,
              fontWeight: 700,
              color: numberColor,
              lineHeight: 0.9,
            }}
          >
            {valueNumber}
          </div>

          {/* MHz below */}
          <div
            style={{
              fontSize: `${unitSize}px`,
              marginTop: -numberSize * 0.15,
              color: numberColor,
            }}
          >
            MHz
          </div>
        </>
      )}

      {/* Label (CPU / GPU / Liquid) */}
      <div
        style={{
          fontSize: `${overlay.textSize}px`,
          color: textColor,
          marginTop: 7,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}
/**
 * KrakenOverlay:
 * - No props
 * - Reads from localStorage (same data model as ConfigPreview)
 * - Renders the LCD-sized media (640x640) with the same transform logic
 * - Draws overlays on top of the media
 */
export default function KrakenOverlay() {
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const metrics = useMonitoringMetrics();

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

        const cleaned = Object.fromEntries(
          Object.entries(parsed).filter(
            ([, v]) => v !== undefined && v !== null
          )
        );

        const mergedOverlay: OverlaySettings = {
          ...DEFAULT_OVERLAY,
          ...(cleaned.overlay || {}),
        };

        setSettings({
          ...DEFAULTS,
          ...cleaned,
          overlay: mergedOverlay,
        });

        setMediaUrl(cleaned.url || savedUrl || "");
      } catch {
        console.warn(
          "[KrakenOverlay] Failed to parse saved config, using defaults."
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

          setSettings((prev) => ({
            ...prev,
            ...parsed,
            overlay: mergedOverlay,
          }));
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

  // IMPORTANT:
  // - settings.x / settings.y are stored in REAL LCD px (not scaled).
  // - Here we apply them directly as px offsets in objectPosition.
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
