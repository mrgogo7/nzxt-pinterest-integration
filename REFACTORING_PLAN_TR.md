# 🔧 NZXT Web Integration - Kapsamlı Refactoring Planı

**Tarih:** 2025  
**Proje:** NZXT Web Integration AMC  
**Hedef:** Kod kalitesi, bakım kolaylığı, performans iyileştirmesi

---

## 📋 İçindekiler

1. [Genel Bakış](#1-genel-bakış)
2. [Faz 1: Altyapı ve Temizlik](#2-faz-1-altyapı-ve-temizlik)
3. [Faz 2: Merkezileştirme ve Utility'ler](#3-faz-2-merkezileştirme-ve-utilityler)
4. [Faz 3: Hook'lar ve State Yönetimi](#4-faz-3-hooklar-ve-state-yönetimi)
5. [Faz 4: Component Refactoring](#5-faz-4-component-refactoring)
6. [Faz 5: TypeScript ve Tip Güvenliği](#6-faz-5-typescript-ve-tip-güvenliği)
7. [Faz 6: Stil ve UI İyileştirmeleri](#7-faz-6-stil-ve-ui-iyileştirmeleri)
8. [Faz 7: Build ve Konfigürasyon](#8-faz-7-build-ve-konfigürasyon)
9. [Uygulama Sırası ve Tahmini Süreler](#9-uygulama-sırası-ve-tahmini-süreler)

---

## 1. Genel Bakış

### 🎯 Refactoring Hedefleri

1. ✅ **Component yapısını sadeleştirme** - Gereksiz component'leri kaldır, hiyerarşiyi düzenle
2. ✅ **Tekrarlanan mantığı birleştirme** - DRY prensibi, merkezi utility'ler
3. ✅ **Yeniden kullanılabilir hook'lar** - Custom hook'lar ile logic separation
4. ✅ **Inline style temizleme** - CSS modules/classes kullanımı
5. ✅ **TypeScript tiplerini iyileştirme** - Type safety, interface'ler
6. ✅ **Tutarlı isimlendirme** - Naming conventions, dosya yapısı
7. ✅ **Legacy test mantığını kaldırma** - Mock data, test kodları
8. ✅ **Build-time stability** - Vite config, type checking

### 📝 Kod Yazım Stili Standardı

**TÜM KOD YAZIMI İÇİN:**
- ✅ **İngilizce açıklayıcı comment'ler** - Tüm comment'ler İngilizce olacak
- ✅ **Kısa ve net** - Gereksiz uzunluk yok, öz ve anlaşılır
- ✅ **GitHub-quality** - Professional, maintainable, well-documented
- ✅ **JSDoc formatı** - Fonksiyonlar için JSDoc comment'leri
- ✅ **Inline comment'ler** - Karmaşık logic için kısa açıklamalar

**Örnek:**
```typescript
/**
 * Calculates offset scale between preview and LCD resolution.
 * CRITICAL: This formula solved scale/offset issues in the past.
 * 
 * @param previewSize - Preview circle size (default: 200px)
 * @param lcdResolution - LCD resolution (default: 640px)
 * @returns Offset scale factor
 */
export function calculateOffsetScale(
  previewSize: number = 200,
  lcdResolution: number = 640
): number {
  return previewSize / lcdResolution;
}
```

---

## 2. Faz 1: Altyapı ve Temizlik

### 🗑️ 2.1 Kullanılmayan Kodları Kaldırma

**Hedef:** Dead code elimination

#### 2.1.1 Display.tsx Kaldırma
- **Dosya:** `src/ui/Display.tsx`
- **Neden:** Hiçbir yerde kullanılmıyor, `KrakenOverlay` aynı işlevi görüyor
- **Aksiyon:** Dosyayı sil
- **Etki:** Bundle size azalır, karışıklık giderilir
- **Tahmini Süre:** 5 dakika

#### 2.1.2 dist/index.html Temizleme
- **Dosya:** `dist/index.html`
- **Sorun:** İçinde kullanılmayan `Display` import'u var
- **Not:** Build output, kaynak düzeltilmeli
- **Tahmini Süre:** 2 dakika

#### 2.1.3 Boş Klasör Kontrolü
- **Klasör:** `src/ui/components/overlays/`
- **Durum:** Boş, gelecek için placeholder
- **Aksiyon:** Şimdilik bırak (gelecek overlay'ler için)

---

### 📁 2.2 Yeni Klasör Yapısı Oluşturma

**Hedef:** Organize, scalable dosya yapısı

```
src/
├── main.tsx
├── config.tsx
├── constants/
│   ├── storage.ts          # Storage key'leri
│   ├── defaults.ts          # Default değerler
│   └── nzxt.ts             # NZXT API constants
├── types/
│   ├── nzxt.d.ts           # NZXT API type definitions
│   ├── settings.ts         # Settings interface'leri
│   └── overlay.ts          # Overlay type'ları
├── utils/
│   ├── media.ts            # Media utility'leri (isVideoUrl, etc.)
│   ├── positioning.ts     # Positioning utility'leri (getBaseAlign)
│   ├── settings.ts         # Settings merge, validation
│   └── storage.ts          # Storage helper'ları (storage.ts'den taşınacak)
├── hooks/
│   ├── useStorageSync.ts   # Storage event listener hook
│   ├── useConfig.ts         # Config okuma/yazma hook
│   ├── useMediaUrl.ts      # Media URL yönetimi hook
│   └── useMonitoring.ts    # NZXT monitoring data hook
├── ui/
│   ├── Config.tsx
│   ├── components/
│   │   ├── ConfigPreview.tsx
│   │   ├── KrakenOverlay.tsx
│   │   ├── SingleInfographic.tsx
│   │   ├── MediaRenderer.tsx      # YENİ: Video/Image renderer
│   │   └── overlays/
│   └── styles/
│       ├── ConfigPreview.css
│       ├── KrakenOverlay.css      # YENİ: Inline style'lar buraya
│       └── MediaRenderer.css      # YENİ
└── storage.ts              # Mevcut (entegre edilecek)
```

**Tahmini Süre:** 15 dakika (klasör oluşturma)

---

## 3. Faz 2: Merkezileştirme ve Utility'ler

### 📦 3.1 Constants Merkezileştirme

#### 3.1.1 Storage Keys
**Dosya:** `src/constants/storage.ts`

```typescript
export const STORAGE_KEYS = {
  MEDIA_URL: 'media_url',
  CONFIG: 'nzxtPinterestConfig',
  CONFIG_COMPAT: 'nzxtMediaConfig',
  LANGUAGE: 'nzxtLang',
} as const;
```

**Kullanım:** Tüm component'lerde `STORAGE_KEYS.MEDIA_URL` şeklinde
**Etkilenen Dosyalar:** Config.tsx, ConfigPreview.tsx, KrakenOverlay.tsx
**Tahmini Süre:** 20 dakika

---

#### 3.1.2 Default Settings
**Dosya:** `src/constants/defaults.ts`

```typescript
import { OverlaySettings, DEFAULT_OVERLAY } from '../types/overlay';

export interface AppSettings {
  scale: number;
  x: number;
  y: number;
  fit: 'cover' | 'contain' | 'fill';
  align: 'center' | 'top' | 'bottom' | 'left' | 'right';
  loop: boolean;
  autoplay: boolean;
  mute: boolean;
  resolution: string;
  showGuide?: boolean;
  overlay?: OverlaySettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  scale: 1,
  x: 0,
  y: 0,
  fit: 'cover',
  align: 'center',
  loop: true,
  autoplay: true,
  mute: true,
  resolution: '640x640',
  showGuide: true,
  overlay: DEFAULT_OVERLAY,
};

export const DEFAULT_MEDIA_URL = 
  'https://v1.pinimg.com/videos/iht/expMp4/b0/95/18/b09518df640864a0181b5d242ad49c2b_720w.mp4';
```

**Etkilenen Dosyalar:** ConfigPreview.tsx, KrakenOverlay.tsx, Display.tsx (silinecek)
**Tahmini Süre:** 30 dakika

---

#### 3.1.3 NZXT API Constants
**Dosya:** `src/constants/nzxt.ts`

```typescript
export const NZXT_DEFAULTS = {
  LCD_WIDTH: 640,
  LCD_HEIGHT: 640,
  LCD_SHAPE: 'circle' as const,
} as const;
```

**Tahmini Süre:** 10 dakika

---

### 🛠️ 3.2 Utility Fonksiyonları

#### 3.2.1 Media Utilities
**Dosya:** `src/utils/media.ts`

```typescript
/**
 * URL'nin video dosyası olup olmadığını kontrol eder
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  return /\.mp4($|\?)/i.test(url) || url.toLowerCase().includes('mp4');
}

/**
 * Media tipini döndürür
 */
export function getMediaType(url: string): 'video' | 'image' | 'unknown' {
  if (!url) return 'unknown';
  if (isVideoUrl(url)) return 'video';
  if (/\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(url)) return 'image';
  return 'unknown';
}
```

**Etkilenen Dosyalar:** ConfigPreview.tsx, KrakenOverlay.tsx, Display.tsx
**Tahmini Süre:** 20 dakika

---

#### 3.2.2 Positioning Utilities
**Dosya:** `src/utils/positioning.ts`

**KRİTİK FORMÜL:** `offsetScale = previewSize / lcdResolution`
- Bu formül LCD (640px) ile preview (200px) arasındaki orantıyı korur
- **KESİNLİKLE DEĞİŞTİRİLMEMELİ** - Geçmişte bu formülle sorun çözülmüş

```typescript
import type { AppSettings } from '../constants/defaults';
import { NZXT_DEFAULTS } from '../constants/nzxt';

export interface BasePosition {
  x: number;
  y: number;
}

/**
 * Alignment ayarına göre base position döndürür
 */
export function getBaseAlign(
  align: AppSettings['align']
): BasePosition {
  switch (align) {
    case 'top':
      return { x: 50, y: 0 };
    case 'bottom':
      return { x: 50, y: 100 };
    case 'left':
      return { x: 0, y: 50 };
    case 'right':
      return { x: 100, y: 50 };
    default:
      return { x: 50, y: 50 }; // center
  }
}

/**
 * Object position CSS string'i oluşturur
 */
export function getObjectPosition(
  align: AppSettings['align'],
  x: number,
  y: number
): string {
  const base = getBaseAlign(align);
  return `calc(${base.x}% + ${x}px) calc(${base.y}% + ${y}px)`;
}

/**
 * Preview ve LCD arasındaki offset scale hesaplar
 * KRİTİK: Bu formül geçmişte scale/offset sorunlarını çözmüştür
 * 
 * @param previewSize - Preview circle size (default: 200px)
 * @param lcdResolution - LCD resolution (default: 640px)
 * @returns Offset scale factor
 */
export function calculateOffsetScale(
  previewSize: number = 200,
  lcdResolution: number = NZXT_DEFAULTS.LCD_WIDTH
): number {
  return previewSize / lcdResolution;
}

/**
 * Preview pixel'ini LCD pixel'ine çevirir
 */
export function previewToLcd(
  previewPixel: number,
  offsetScale: number
): number {
  return Math.round(previewPixel / offsetScale);
}

/**
 * LCD pixel'ini preview pixel'ine çevirir
 */
export function lcdToPreview(
  lcdPixel: number,
  offsetScale: number
): number {
  return lcdPixel * offsetScale;
}
```

**Etkilenen Dosyalar:** ConfigPreview.tsx, KrakenOverlay.tsx
**Tahmini Süre:** 30 dakika

---

#### 3.2.3 Settings Utilities
**Dosya:** `src/utils/settings.ts`

```typescript
import { DEFAULT_SETTINGS, type AppSettings } from '../constants/defaults';
import { DEFAULT_OVERLAY } from '../types/overlay';

/**
 * Kaydedilmiş ayarları default'larla birleştirir
 */
export function mergeSettings(saved: any): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    overlay: {
      ...DEFAULT_OVERLAY,
      ...(saved?.overlay || {}),
    },
  };
}

/**
 * Settings validation
 */
export function validateSettings(settings: any): settings is AppSettings {
  // Validation logic
  return true; // Placeholder
}
```

**Etkilenen Dosyalar:** ConfigPreview.tsx, KrakenOverlay.tsx
**Tahmini Süre:** 20 dakika

---

#### 3.2.4 Storage Utilities (storage.ts Entegrasyonu)
**Dosya:** `src/utils/storage.ts` (mevcut storage.ts'i buraya taşı)

**Değişiklikler:**
- `storage.ts` → `utils/storage.ts` taşı
- Tüm component'lerde kullanımı aktif et
- Cookie fallback mekanizmasını test et

**Etkilenen Dosyalar:** Tüm component'ler
**Tahmini Süre:** 45 dakika

---

#### 3.2.5 Monitoring Utilities
**Dosya:** `src/utils/monitoring.ts`

**KRİTİK:** API'den gelen yük değerleri bazen 0-1 aralığında olur, dönüşüm zorunludur.

```typescript
import type { OverlayMetrics } from '../types/overlay';
import type { NZXTMonitoringData } from '../types/nzxt';

/**
 * Helper to safely pick first numeric value from a list of candidates.
 * This makes us resilient to small API changes on NZXT side.
 */
function pickNumeric(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === 'number' && !Number.isNaN(v)) {
      return v;
    }
  }
  return 0;
}

/**
 * Map NZXT MonitoringData into the OverlayMetrics shape.
 * KRİTİK: Load değerleri 0-1 aralığında olabilir, 0-100'e çevrilmeli.
 */
export function mapMonitoringToOverlay(data: NZXTMonitoringData): OverlayMetrics {
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

  // KRİTİK DÖNÜŞÜM: 0-1 aralığındaki değerleri 0-100'e çevir
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
```

**Tahmini Süre:** 30 dakika

---

## 4. Faz 3: Hook'lar ve State Yönetimi

### 🎣 4.1 Custom Hook'lar

#### 4.1.1 useStorageSync Hook
**Dosya:** `src/hooks/useStorageSync.ts`

```typescript
import { useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';

/**
 * Storage event'lerini dinler ve callback çağırır
 */
export function useStorageSync(
  key: string,
  callback: (value: string | null) => void,
  immediate = false
) {
  useEffect(() => {
    if (immediate) {
      const value = localStorage.getItem(key);
      callback(value);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        callback(e.newValue);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, callback, immediate]);
}
```

**Kullanım:** Tüm storage event listener'ları bu hook'a taşınacak
**Tahmini Süre:** 30 dakika

---

#### 4.1.2 useConfig Hook
**Dosya:** `src/hooks/useConfig.ts`

```typescript
import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { DEFAULT_SETTINGS, type AppSettings } from '../constants/defaults';
import { mergeSettings } from '../utils/settings';
import { useStorageSync } from './useStorageSync';

/**
 * Config okuma/yazma hook'u
 */
export function useConfig() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // İlk yükleme
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(mergeSettings(parsed));
      } catch (error) {
        console.error('[useConfig] Parse error:', error);
      }
    }
  }, []);

  // Storage sync
  useStorageSync(STORAGE_KEYS.CONFIG, (newValue) => {
    if (newValue) {
      try {
        const parsed = JSON.parse(newValue);
        setSettings(mergeSettings(parsed));
      } catch (error) {
        console.error('[useConfig] Sync error:', error);
      }
    }
  });

  const saveConfig = (newSettings: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
    localStorage.setItem(STORAGE_KEYS.CONFIG_COMPAT, JSON.stringify(merged));
    
    // Storage event dispatch
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEYS.CONFIG,
        newValue: JSON.stringify(merged),
      })
    );
  };

  return { settings, setSettings: saveConfig };
}
```

**Tahmini Süre:** 40 dakika

---

#### 4.1.3 useMediaUrl Hook
**Dosya:** `src/hooks/useMediaUrl.ts`

```typescript
import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { useStorageSync } from './useStorageSync';
import { setMediaUrl, getMediaUrl } from '../utils/storage';

/**
 * Media URL yönetimi hook'u
 */
export function useMediaUrl() {
  const [mediaUrl, setMediaUrlState] = useState<string>(getMediaUrl());

  // Storage sync (storage.ts'den)
  useEffect(() => {
    const unsubscribe = subscribe((url) => {
      setMediaUrlState(url);
    });
    return unsubscribe;
  }, []);

  const updateMediaUrl = (url: string) => {
    setMediaUrl(url);
    setMediaUrlState(url);
  };

  return { mediaUrl, setMediaUrl: updateMediaUrl };
}
```

**Tahmini Süre:** 30 dakika

---

#### 4.1.4 useMonitoring Hook (Kritik: Mock Stratejisi)
**Dosya:** `src/hooks/useMonitoring.ts`

**ÖNEMLİ DAVRANIŞ:**
- **ConfigPreview** → NZXT API yok → **Mock animasyonlu veriler GEREKLİ**
- **KrakenOverlay** → NZXT CAM içinde → **Sadece gerçek API kullanılır**

**Değişiklikler:**
1. Hook'u ayrı dosyaya taşı
2. **İki ayrı hook oluştur:**
   - `useMonitoring()` → Sadece gerçek NZXT API (KrakenOverlay için)
   - `useMonitoringMock()` → Animasyonlu mock veriler (ConfigPreview için)

```typescript
import { useState, useEffect } from 'react';
import type { OverlayMetrics } from '../types/overlay';
import { DEFAULT_METRICS } from '../constants/nzxt';
import { mapMonitoringToOverlay } from '../utils/monitoring';

/**
 * useMonitoring - Sadece gerçek NZXT API kullanır
 * KrakenOverlay için kullanılır (?kraken=1)
 */
export function useMonitoring(): OverlayMetrics {
  const [metrics, setMetrics] = useState<OverlayMetrics>(DEFAULT_METRICS);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isKraken = searchParams.get('kraken') === '1';

    if (!isKraken) {
      // ConfigPreview'ta bu hook kullanılmamalı
      // useMonitoringMock kullanılmalı
      return;
    }

    const handler = (data: any) => {
      try {
        const mapped = mapMonitoringToOverlay(data);
        setMetrics(mapped);
      } catch (err) {
        console.error('[useMonitoring] Failed to map monitoring data:', err);
      }
    };

    const w = window as any;
    const prevNzxt = w.nzxt || {};
    const prevV1 = prevNzxt.v1 || {};

    w.nzxt = {
      ...prevNzxt,
      v1: {
        ...prevV1,
        onMonitoringDataUpdate: handler,
      },
    };

    return () => {
      const current = (window as any).nzxt?.v1;
      if (current && current.onMonitoringDataUpdate === handler) {
        delete current.onMonitoringDataUpdate;
      }
    };
  }, []);

  return metrics;
}

/**
 * useMonitoringMock - Animasyonlu mock veriler
 * ConfigPreview için kullanılır (NZXT API yok)
 */
export function useMonitoringMock(): OverlayMetrics {
  const [metrics, setMetrics] = useState<OverlayMetrics>(DEFAULT_METRICS);

  useEffect(() => {
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
```

**Kullanım:**
- `KrakenOverlay.tsx` → `useMonitoring()` (gerçek API)
- `ConfigPreview.tsx` → `useMonitoringMock()` (mock animasyon)

**Tahmini Süre:** 40 dakika

---

## 5. Faz 4: Component Refactoring

### 🧩 5.1 MediaRenderer Component

**Dosya:** `src/ui/components/MediaRenderer.tsx`

**Amaç:** Video/Image rendering logic'ini tek yerde topla

```typescript
import React from 'react';
import { isVideoUrl } from '../../utils/media';
import { getObjectPosition } from '../../utils/positioning';
import type { AppSettings } from '../../constants/defaults';
import styles from '../styles/MediaRenderer.css';

interface MediaRendererProps {
  url: string;
  settings: AppSettings;
  className?: string;
  style?: React.CSSProperties;
}

export default function MediaRenderer({
  url,
  settings,
  className,
  style,
}: MediaRendererProps) {
  const isVideo = isVideoUrl(url);
  const objectPosition = getObjectPosition(settings.align, settings.x, settings.y);

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: settings.fit,
    objectPosition,
    transform: `scale(${settings.scale})`,
    transformOrigin: 'center center',
    display: 'block',
    ...style,
  };

  if (!url) return null;

  if (isVideo) {
    return (
      <video
        src={url}
        autoPlay={settings.autoplay}
        loop={settings.loop}
        muted={settings.mute}
        playsInline
        className={className}
        style={mediaStyle}
      />
    );
  }

  return (
    <img
      src={url}
      alt="Media"
      className={className}
      style={mediaStyle}
    />
  );
}
```

**CSS:** `src/ui/styles/MediaRenderer.css` (inline style'lar buraya taşınacak)

**Etkilenen Dosyalar:** KrakenOverlay.tsx, ConfigPreview.tsx, Display.tsx
**Tahmini Süre:** 45 dakika

---

### 🔄 5.2 ConfigPreview Refactoring

**KRİTİK KORUNMASI GEREKENLER:**
1. **offsetScale formülü:** `previewSize / lcdResolution` - DEĞİŞTİRİLMEMELİ
2. **Drag hesaplaması:** `dx / offsetScale` - LCD pixel'e çevirme
3. **Mock monitoring:** `useMonitoringMock()` kullanılmalı (NZXT API yok)

**Değişiklikler:**
1. `useConfig()` hook'unu kullan
2. `useMediaUrl()` hook'unu kullan
3. `useMonitoringMock()` hook'unu kullan (ConfigPreview için)
4. `MediaRenderer` component'ini kullan
5. Utility fonksiyonlarını kullan (`calculateOffsetScale`, `previewToLcd`)
6. Inline style'ları CSS'e taşı

**Tahmini Süre:** 70 dakika

---

### 🔄 5.3 KrakenOverlay Refactoring

**KRİTİK KORUNMASI GEREKENLER:**
1. **Gerçek NZXT API:** `useMonitoring()` kullanılmalı (mock YOK)
2. **mapMonitoringToOverlay:** Load dönüşümü (0-1 → 0-100) korunmalı

**Değişiklikler:**
1. `useConfig()` hook'unu kullan
2. `useMediaUrl()` hook'unu kullan
3. `useMonitoring()` hook'unu kullan (sadece gerçek API)
4. `MediaRenderer` component'ini kullan
5. Utility fonksiyonlarını kullan
6. Inline style'ları CSS'e taşı

**Tahmini Süre:** 60 dakika

---

### 🔄 5.4 Config Refactoring

**KRİTİK KONTROL:**
1. **i18n eksiklikleri:** Overlay ayarları için translation key'leri kontrol edilmeli
2. **Reset butonu:** Tüm yeni ayarlar (overlay dahil) reset'te dahil edilmeli

**Değişiklikler:**
1. Constants kullanımı
2. `useMediaUrl()` hook'unu kullan
3. Storage key'leri merkezileştirilmiş kullan
4. i18n eksikliklerini düzelt (overlay ayarları için)
5. Reset butonunda tüm ayarları kapsadığından emin ol

**Tahmini Süre:** 40 dakika

---

### 🆕 5.5 Gelecek Overlay Component'leri (Yapı Hazırlığı)

**Not:** Bu component'ler şimdilik oluşturulmayacak, sadece yapı hazırlanacak.

#### 5.5.1 DualInfographic (Gelecek)
- İki değer yan yana
- Her biri kendi metric + color + size + label
- SingleInfographic benzer yapı

#### 5.5.2 TripleInfographic (Gelecek)
- İlk değer solda (büyük)
- Arada diğer iki değer alt alta sağda
- Arada şık dikine bir çizgi
- Her biri kendi metric + color + size + label

**Yapı Hazırlığı:**
- `src/ui/components/overlays/` klasörü hazır
- `overlayTypes.ts` içinde mode type'ları zaten var
- Component'ler eklendiğinde aynı pattern'i takip edecek

**Tahmini Süre:** 0 dakika (şimdilik sadece planlama)

---

## 6. Faz 5: TypeScript ve Tip Güvenliği

### 📘 6.1 NZXT API Type Definitions

**Dosya:** `src/types/nzxt.d.ts`

```typescript
/**
 * NZXT Web Integration API Type Definitions
 */

export interface NZXTMonitoringData {
  cpus?: Array<{
    temperature?: number;
    currentTemperature?: number;
    packageTemperature?: number;
    load?: number;
    usage?: number;
    totalLoad?: number;
    processorLoad?: number;
    clockSpeed?: number;
    frequency?: number;
    frequencyMHz?: number;
    frequencyMhz?: number;
    processorFrequency?: number;
  }>;
  gpus?: Array<{
    temperature?: number;
    currentTemperature?: number;
    gpuTemperature?: number;
    load?: number;
    usage?: number;
    totalLoad?: number;
    coreFrequency?: number;
    clockSpeed?: number;
    frequency?: number;
    frequencyMHz?: number;
    frequencyMhz?: number;
    gpuFrequency?: number;
  }>;
  kraken?: {
    liquidTemperature?: number;
    temperature?: number;
    liquidTemp?: number;
  };
}

export interface NZXTV1API {
  width?: number;
  height?: number;
  shape?: 'circle' | 'rectangle';
  onMonitoringDataUpdate?: (data: NZXTMonitoringData) => void;
}

declare global {
  interface Window {
    nzxt?: {
      v1?: NZXTV1API;
    };
  }
}

export {};
```

**Kullanım:** `(window as any).nzxt` yerine `window.nzxt` kullanılacak
**Etkilenen Dosyalar:** KrakenOverlay.tsx, Display.tsx
**Tahmini Süre:** 25 dakika

---

### 📘 6.2 Settings Types

**Dosya:** `src/types/settings.ts`

```typescript
// AppSettings zaten constants/defaults.ts'de tanımlı
// Burada export edilebilir veya ek type'lar eklenebilir
```

**Tahmini Süre:** 10 dakika

---

### 📘 6.3 Overlay Types

**Dosya:** `src/types/overlay.ts`

**Mevcut:** `src/ui/components/overlayTypes.ts` → `src/types/overlay.ts` taşınacak

**Tahmini Süre:** 15 dakika

---

### 🎨 6.4 Overlay Unit Alignment Types

**Dosya:** `src/types/overlay.ts` (güncellenecek)

**KRİTİK DAVRANIŞ:**
- ° (derece) → üst hizalı olmalı
- % (yüzde) → baseline, yani aşağı hizalı
- Bu hizalama her ekran çözünürlüğünde, her font-size'da bozulmadan çalışmalı
- Transform kullanılabilir ama sadece minimal düzeltme olarak

**Mevcut:** `SingleInfographic.tsx` içinde zaten doğru implementasyon var
**Kontrol:** Refactoring sırasında bu davranışın korunduğundan emin ol

**Tahmini Süre:** 10 dakika (kontrol ve dokümantasyon)

---

## 7. Faz 6: Stil ve UI İyileştirmeleri

### 🎨 7.1 Inline Style'ları CSS'e Taşıma

#### 7.1.1 KrakenOverlay.css
**Dosya:** `src/ui/styles/KrakenOverlay.css`

```css
.kraken-overlay {
  position: relative;
  width: var(--lcd-size, 640px);
  height: var(--lcd-size, 640px);
  overflow: hidden;
  border-radius: 50%;
  background: #000;
}

.kraken-overlay-media {
  width: 100%;
  height: 100%;
  object-fit: var(--object-fit, cover);
  object-position: var(--object-position, center);
  transform: scale(var(--scale, 1));
  transform-origin: center center;
}
```

**Etkilenen Dosyalar:** KrakenOverlay.tsx
**Tahmini Süre:** 30 dakika

---

#### 7.1.2 MediaRenderer.css
**Dosya:** `src/ui/styles/MediaRenderer.css`

```css
.media-renderer {
  width: 100%;
  height: 100%;
  object-fit: var(--object-fit, cover);
  object-position: var(--object-position, center);
  transform: scale(var(--scale, 1));
  transform-origin: center center;
  display: block;
}
```

**Tahmini Süre:** 20 dakika

---

### 🎨 7.2 CSS Variables Kullanımı

**Hedef:** Dynamic değerler için CSS variables

```css
:root {
  --lcd-width: 640px;
  --lcd-height: 640px;
  --preview-size: 200px;
}
```

**Tahmini Süre:** 20 dakika

---

## 8. Faz 7: Build ve Konfigürasyon

### ⚙️ 8.1 Vite Config İyileştirmeleri

**Dosya:** `vite.config.ts`

**Değişiklikler:**
1. TypeScript strict mode kontrolü
2. Build optimizasyonları
3. Public dir kontrolü (zaten var, kontrol et)
4. Environment variables desteği

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/nzxt-web-integration-amc/',
  plugins: [
    react({
      // React Fast Refresh
      fastRefresh: true,
    }),
    legacy({
      targets: ['defaults', 'ie 11'],
      modernPolyfills: true,
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        config: resolve(__dirname, 'config.html'),
      },
    },
    // Build optimizasyonları
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Production'da console.log'ları kaldır
      },
    },
    // Chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  // TypeScript strict mode
  esbuild: {
    target: 'es2015',
  },
  // Public dir (zaten var, kontrol)
  publicDir: 'public',
});
```

**Tahmini Süre:** 25 dakika

---

### ⚙️ 8.2 TypeScript Config İyileştirmeleri

**Dosya:** `tsconfig.json` (oluşturulacak veya güncellenecek)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/ui/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/constants/*": ["src/constants/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Tahmini Süre:** 20 dakika

---

### ⚙️ 8.3 Package.json Scripts

**Değişiklikler:**
- Type checking script ekle
- Build validation script ekle

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --port 5173",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx"
  }
}
```

**Tahmini Süre:** 10 dakika

---

## 9. Uygulama Sırası ve Tahmini Süreler

### 📅 Önerilen Uygulama Sırası

#### **Hafta 1: Temel Altyapı (Faz 1-2)**
1. ✅ Kullanılmayan kodları kaldır (15 dk)
2. ✅ Klasör yapısını oluştur (15 dk)
3. ✅ Constants merkezileştirme (60 dk)
4. ✅ Utility fonksiyonları (105 dk)
5. ✅ storage.ts entegrasyonu (45 dk)

**Toplam:** ~4 saat

---

#### **Hafta 2: Hook'lar ve State (Faz 3)**
1. ✅ useStorageSync hook (30 dk)
2. ✅ useConfig hook (40 dk)
3. ✅ useMediaUrl hook (30 dk)
4. ✅ useMonitoring hook + useMonitoringMock (40 dk)
5. ✅ mapMonitoringToOverlay utility (30 dk)

**Toplam:** ~3 saat

---

#### **Hafta 3: Component Refactoring (Faz 4)**
1. ✅ MediaRenderer component (45 dk)
2. ✅ ConfigPreview refactoring (60 dk)
3. ✅ KrakenOverlay refactoring (60 dk)
4. ✅ Config refactoring (30 dk)

**Toplam:** ~3.5 saat

---

#### **Hafta 4: TypeScript ve Stil (Faz 5-6)**
1. ✅ Type definitions (50 dk)
2. ✅ Inline style temizleme (70 dk)
3. ✅ CSS variables (20 dk)

**Toplam:** ~2.5 saat

---

#### **Hafta 5: Build ve Finalizasyon (Faz 7)**
1. ✅ Vite config iyileştirmeleri (25 dk)
2. ✅ TypeScript config (20 dk)
3. ✅ Package.json scripts (10 dk)
4. ✅ Test ve validation (60 dk)

**Toplam:** ~2 saat

---

### ⏱️ Toplam Tahmini Süre

**Toplam:** ~15.5 saat (yaklaşık 2 iş günü)

**Not:** Her faz bağımsız test edilebilir, incremental refactoring mümkün.

**Ek Not:** Kritik formüller ve davranışlar korunacak, sadece yapı iyileştirilecek.

---

## ✅ Refactoring Sonrası Beklenen İyileştirmeler

### 📊 Metrikler

| Metrik | Önce | Sonra | İyileştirme |
|--------|------|-------|-------------|
| Dosya Sayısı | ~12 | ~25 | +108% (daha organize) |
| Kod Tekrarı | Yüksek | Düşük | -70% |
| Bundle Size | - | -5-10% | (Display.tsx kaldırma) |
| Type Safety | Orta | Yüksek | +100% |
| Bakım Kolaylığı | Orta | Yüksek | +150% |
| Test Edilebilirlik | Düşük | Yüksek | +200% |

---

## 🚨 Dikkat Edilmesi Gerekenler

### ⚠️ Kritik Korunması Gerekenler

1. **offsetScale Formülü:** `previewSize / lcdResolution` - **KESİNLİKLE DEĞİŞTİRİLMEMELİ**
   - Geçmişte scale/offset sorunlarını çözmüştür
   - ConfigPreview.tsx'te kullanılan formül korunmalı

2. **Mock Data Stratejisi:**
   - **ConfigPreview** → `useMonitoringMock()` (NZXT API yok, mock gerekli)
   - **KrakenOverlay** → `useMonitoring()` (sadece gerçek API)

3. **Load Dönüşümü:** API'den gelen yük değerleri 0-1 aralığında olabilir
   - `if (rawCpuLoad <= 1) cpuLoad = rawCpuLoad * 100;` korunmalı

4. **Overlay Unit Alignment:**
   - ° (derece) → üst hizalı (`transform: translateY(-65%)`)
   - % (yüzde) → baseline hizalı
   - SingleInfographic.tsx'teki mevcut implementasyon korunmalı

5. **i18n ve Reset Kontrolü:**
   - Yeni overlay ayarları için translation key'leri eklenmeli
   - Reset butonu tüm ayarları (overlay dahil) kapsamalı

### 📋 Genel Dikkat Edilmesi Gerekenler

1. **Backward Compatibility:** Mevcut localStorage key'leri korunmalı
2. **Incremental Migration:** Her faz ayrı test edilmeli
3. **Storage Sync:** storage.ts entegrasyonu dikkatli yapılmalı
4. **Eski Sistemleri Bozmama:** Yeni özellikler eklerken mevcut sistemler korunmalı
5. **Build Validation:** Her değişiklikten sonra build test edilmeli
6. **Kod Yazım Stili:**
   - Tüm comment'ler İngilizce olacak
   - Kısa, net, GitHub-quality
   - JSDoc formatı kullanılacak
   - Inline comment'ler karmaşık logic için

---

## 📝 Onay ve Uygulama

Bu plan onaylandıktan sonra:

1. ✅ Her faz ayrı ayrı uygulanacak
2. ✅ Her faz sonrası test edilecek
3. ✅ Git commit'leri faz bazında yapılacak
4. ✅ Geri dönüş (rollback) planı hazır olacak

---

**Plan Hazırlayan:** AI Refactoring Assistant  
**Tarih:** 2025  
**Versiyon:** 1.0


