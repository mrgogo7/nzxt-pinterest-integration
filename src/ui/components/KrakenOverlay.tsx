import React, { useEffect, useRef, useState } from "react";

/*
  ================================================================
   KrakenOverlay
   This component renders the media + overlay onto the LCD panel.
   Resolution is ALWAYS 640x640 for Kraken Elite LCD.
   Matching the exact behavior of ConfigPreview is critical.
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
  scale: number;      // same as preview
  x: number;          // REAL LCD px offset (same as preview)
  y: number;
  fit: "cover" | "contain" | "fill";
  align: "center" | "top" | "bottom" | "left" | "right";
  loop: boolean;
  autoplay: boolean;
  mute: boolean;
  resolution: string;
  showGuide?: boolean;
  overlay: OverlaySettings;
}

interface Props {
  mediaUrl: string;
  settings: Settings;
}

/* 
   ================================================================
   Mapping to NZXT alignment
   ================================================================
*/
function getBaseAlign(align: Settings["align"]) {
  switch (align) {
    case "top": return { x: 50, y: 0 };
    case "bottom": return { x: 50, y: 100 };
    case "left": return { x: 0, y: 50 };
    case "right": return { x: 100, y: 50 };
    default: return { x: 50, y: 50 }; // center
  }
}

/*
   ================================================================
   MOCK API: When web-based (not inside NZXT CAM),
   return dummy metrics so the overlay works.
   ================================================================
*/
function useMockOrRealMetrics() {
  const [data, setData] = useState({
    cpuTemp: 42,
    cpuLoad: 17,
    cpuClock: 4520,
    liquidTemp: 38,
    gpuTemp: 55,
    gpuLoad: 34,
    gpuClock: 1780,
  });

  useEffect(() => {
    let interval = setInterval(() => {
      // If NZXT API is present → use it
      if ((window as any)?.nzxt?.v1?.cpu?.temperature) {
        const api = (window as any).nzxt.v1;

        setData({
          cpuTemp: api.cpu.temperature,
          cpuLoad: api.cpu.load,
          cpuClock: api.cpu.clock,
          liquidTemp: api.liquid.temperature,
          gpuTemp: api.gpu.temperature,
          gpuLoad: api.gpu.load,
          gpuClock: api.gpu.clock,
        });
      } else {
        // otherwise cycle mock data (smooth animation)
        setData((prev) => ({
          cpuTemp: (prev.cpuTemp + 0.3) % 90,
          cpuLoad: (prev.cpuLoad + 1) % 100,
          cpuClock: 4500 + (prev.cpuClock % 200),
          liquidTemp: (prev.liquidTemp + 0.1) % 50,
          gpuTemp: (prev.gpuTemp + 0.2) % 80,
          gpuLoad: (prev.gpuLoad + 1.5) % 100,
          gpuClock: 1800 + (prev.gpuClock % 150),
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return data;
}

/*
   ================================================================
   OVERLAY RENDER (SINGLE MODE)
   ================================================================
*/
function SingleOverlay({
  settings,
  metrics,
}: {
  settings: Settings;
  metrics: any;
}) {
  if (settings.overlay.mode !== "single") return null;

  const key = settings.overlay.primaryMetric;
  const value = metrics[key];

  const numberColor = settings.overlay.numberColor;
  const textColor = settings.overlay.textColor;

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "80px",
          fontWeight: "700",
          color: numberColor,
          lineHeight: "0.9",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "28px",
          color: textColor,
          marginTop: "-8px",
        }}
      >
        {key}
      </div>
    </div>
  );
}

/*
   ================================================================
   MAIN LCD RENDER COMPONENT
   ================================================================
*/
export default function KrakenOverlay({ mediaUrl, settings }: Props) {
  const metrics = useMockOrRealMetrics();

  const isVideo =
    /\.mp4($|\?)/i.test(mediaUrl) ||
    mediaUrl.toLowerCase().includes("mp4");

  /*
    =====================================================================
    Media Positioning Logic (MUST MATCH CONFIGPREVIEW EXACTLY)
    =====================================================================
    LCD panel is 640x640 px.
    settings.x / settings.y are REAL LCD px offsets.
    objectPosition must be:
      baseAlign + x px
      baseAlign + y px
  */
  const lcdSize = 640;
  const base = getBaseAlign(settings.align);

  const objectPosition = `calc(${base.x}% + ${settings.x}px) calc(${base.y}% + ${settings.y}px)`;

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
            alt="LCD"
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
      <SingleOverlay settings={settings} metrics={metrics} />
    </div>
  );
}
