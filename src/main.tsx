import React from "react";
import ReactDOM from "react-dom/client";
import Config from "./ui/Config";
import KrakenOverlay from "./ui/components/KrakenOverlay";
import { isNZXTCAM } from "./environment";
import { initAntiCache } from "./utils/useAntiCache";

/**
 * Main entry point for index.html.
 * 
 * Detects environment and renders either Config page (browser) or KrakenOverlay (NZXT CAM).
 * Uses centralized environment detection module.
 */

// Initialize anti-cache system before rendering
initAntiCache();

const rootElement = document.getElementById("root");

if (!rootElement) {
  // Fail fast in case root element is missing
  throw new Error("Root element #root not found");
}

// Use centralized environment detection
const isKraken = isNZXTCAM();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {isKraken ? <KrakenOverlay /> : <Config />}
  </React.StrictMode>
);
