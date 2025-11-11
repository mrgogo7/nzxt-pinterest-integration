import React, { useState, useEffect } from "react";
import "../styles/ConfigPreview.css";

type Settings = {
  scale: number;
  x: number;
  y: number;
  fit: "cover" | "contain" | "fill";
  align: "center" | "top" | "bottom" | "left" | "right";
  // Aşağıdakiler kontrol olarak görünmeyecek ama davranış sabit:
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

  // Başlangıç: nzxtMediaConfig veya legacy media_url'den yükle
  useEffect(() => {
    const saved = localStorage.getItem("nzxtMediaConfig");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMediaUrl(parsed.url || localStorage.getItem("media_url") || "");
        setSettings({ ...DEFAULTS, ...parsed });
      } catch {
        setMediaUrl(localStorage.getItem("media_url") || "");
        setSettings(DEFAULTS);
      }
    } else {
      setMediaUrl(localStorage.getItem("media_url") || "");
      setSettings(DEFAULTS);
    }
  }, []);

  // Dışarıdan (Config.tsx) URL değişirse senkronize et
  useEffect(() => {
    const sync = setInterval(() => {
      const u = localStorage.getItem("media_url") || "";
      if (u !== mediaUrl) setMediaUrl(u);
    }, 400);
    return () => clearInterval(sync);
  }, [mediaUrl]);

  // Her değişiklikte kaydet (LCD ve diğer sayfalar da aynı veriyi okur)
  useEffect(() => {
    const cfg = { url: mediaUrl, ...settings };
    localStorage.setItem("nzxtMediaConfig", JSON.stringify(cfg));
    // legacy uyumluluk (Display eski anahtarı da dinleyebilir)
    localStorage.setItem("media_url", mediaUrl);
    // storage event tetikleme için (bazı ortamlar gerektiğinde)
    window.dispatchEvent(new StorageEvent("storage", { key: "nzxtMediaConfig", newValue: JSON.stringify(cfg) }));
    window.dispatchEvent(new StorageEvent("storage", { key: "media_url", newValue: mediaUrl }));
  }, [mediaUrl, settings]);

  const handleChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const isVideo = /\.mp4($|\?)/i.test(mediaUrl) || mediaUrl.toLowerCase().includes("mp4");

  // object-position eşlemesi
  const objectPosition =
    settings.align === "center" ? "50% 50%" :
    settings.align === "top"    ? "50% 0%"  :
    settings.align === "bottom" ? "50% 100%" :
    settings.align === "left"   ? "0% 50%" :
    /* right */                   "100% 50%";

  return (
    <div className="config-container">
      <h2>Media Configuration</h2>

      {/* URL alanını burada göstermiyoruz; tek kaynak Config.tsx’teki giriş */}
      <p className="hint">
        Aşağıdaki dairesel önizleme, Config’te girdiğin URL ve bu ayarlarla birebir LCD’deki görüntüyü simüle eder.
      </p>

      <div className="preview-section">
        <h3>Thumbnail Preview (Kraken-style)</h3>

        {/* Dairesel sabit maske */}
        <div className="preview-circle">
          {/* Medya elemanı dairenin içinde hareket edip ölçeklenecek */}
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
                transform: `translate(${settings.x}px, ${settings.y}px) scale(${settings.scale})`,
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
                  transform: `translate(${settings.x}px, ${settings.y}px) scale(${settings.scale})`,
                  transformOrigin: "center center",
                }}
              />
            )
          )}
        </div>
      </div>

      <div className="settings-grid">
        <label>Resolution</label>
        <input value={settings.resolution} readOnly />

        <label>Scale</label>
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={settings.scale}
          onChange={(e) => handleChange("scale", parseFloat(e.target.value || "1"))}
        />

        <label>X Offset (px)</label>
        <input
          type="number"
          value={settings.x}
          onChange={(e) => handleChange("x", parseInt(e.target.value || "0", 10))}
        />

        <label>Y Offset (px)</label>
        <input
          type="number"
          value={settings.y}
          onChange={(e) => handleChange("y", parseInt(e.target.value || "0", 10))}
        />

        <label>Align</label>
        <select
          value={settings.align}
          onChange={(e) => handleChange("align", e.target.value as Settings["align"])}
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
          onChange={(e) => handleChange("fit", e.target.value as Settings["fit"])}
        >
          <option>cover</option>
          <option>contain</option>
          <option>fill</option>
        </select>

        {/* Mute & Loop görünmez; varsayılan davranış zaten muted+loop */}
        {/* <label>…</label> */}
      </div>
    </div>
  );
}
