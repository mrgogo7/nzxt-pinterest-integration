# 🔍 NZXT Web Integration - Kod Denetim Raporu

**Tarih:** 2025  
**Proje:** NZXT Elite Screen Customizer (NZXT-ESC)  
**Dil:** TypeScript + React + Vite

---

## 📋 İçindekiler

1. [Mimari Desenler](#1-mimari-desenler)
2. [Anti-Pattern'ler](#2-anti-patternler)
3. [Tekrarlanan Mantık](#3-tekrarlanan-mantık)
4. [Kullanılmayan Kod](#4-kullanılmayan-kod)
5. [State Akışı Analizi](#5-state-akışı-analizi)
6. [Storage.ts Sistemi](#6-storagets-sistemi)
7. [Öneriler](#7-öneriler)

---

## 1. Mimari Desenler

### ✅ Tespit Edilen İyi Desenler

#### 1.1 **Dual Entry Point Pattern**
- **Lokasyon:** `index.html` + `config.html`
- **Açıklama:** İki farklı entry point ile aynı uygulamanın farklı modlarda çalışması
- **Avantaj:** URL parametresi (`?kraken=1`) ile runtime routing

#### 1.2 **Observer Pattern (Storage Events)**
- **Lokasyon:** Tüm component'lerde `window.addEventListener('storage')`
- **Açıklama:** localStorage değişikliklerini dinleyerek cross-tab/cross-process senkronizasyon
- **Kullanım:** Config → Display real-time sync

#### 1.3 **Custom Hook Pattern**
- **Lokasyon:** `KrakenOverlay.tsx` → `useMonitoringMetrics()`
- **Açıklama:** Monitoring data yönetimi için özel hook
- **Avantaj:** Logic separation, test edilebilirlik

#### 1.4 **Configuration Object Pattern**
- **Lokasyon:** `DEFAULTS` objeleri her component'te
- **Açıklama:** Default değerlerin merkezi yönetimi
- **Sorun:** Tekrarlanıyor (bakınız: Tekrarlanan Mantık)

#### 1.5 **Fallback Strategy Pattern**
- **Lokasyon:** `storage.ts` → localStorage + cookie fallback
- **Açıklama:** CAM process isolation için çift katmanlı storage
- **Avantaj:** Güvenilirlik artışı

---

## 2. Anti-Pattern'ler

### ⚠️ Kritik Sorunlar

#### 2.1 **Dead Code: Display.tsx**
- **Lokasyon:** `src/ui/Display.tsx`
- **Sorun:** Component hiçbir yerde kullanılmıyor
- **Kanıt:** 
  - `main.tsx` sadece `KrakenOverlay` kullanıyor
  - `dist/index.html`'de import var ama render edilmiyor
  - `KrakenOverlay.tsx` zaten aynı işlevi görüyor
- **Etki:** Gereksiz bundle size, karışıklık
- **Öncelik:** 🔴 Yüksek

#### 2.2 **Unused Module: storage.ts**
- **Lokasyon:** `src/storage.ts`
- **Sorun:** Hiçbir yerde import edilmiyor
- **Kanıt:** 
  - `setMediaUrl()`, `getMediaUrl()`, `subscribe()` fonksiyonları tanımlı
  - Tüm component'ler doğrudan `localStorage` kullanıyor
- **Etki:** Kod tekrarı, merkezi storage yönetimi eksik
- **Öncelik:** 🔴 Yüksek

#### 2.3 **Magic String Repetition**
- **Lokasyon:** Her component'te aynı key'ler
- **Sorun:** Storage key'leri string literal olarak tekrarlanıyor:
  ```typescript
  const CFG_KEY = "nzxtPinterestConfig";  // 3 yerde
  const CFG_COMPAT = "nzxtMediaConfig";   // 3 yerde
  const URL_KEY = "media_url";             // 3 yerde
  ```
- **Etki:** Key değişikliğinde 3 yerde güncelleme gerekir
- **Öncelik:** 🟡 Orta

#### 2.4 **Duplicate Default Objects**
- **Lokasyon:** 
  - `ConfigPreview.tsx` → `DEFAULTS`
  - `KrakenOverlay.tsx` → `DEFAULTS`
  - `Display.tsx` → `DEFAULTS`
- **Sorun:** Aynı default değerler 3 farklı yerde tanımlı
- **Etki:** Senkronizasyon sorunları, bakım zorluğu
- **Öncelik:** 🟡 Orta

#### 2.5 **Inline Style Objects**
- **Lokasyon:** `KrakenOverlay.tsx`, `Display.tsx`
- **Sorun:** CSS class yerine inline style kullanımı
- **Etki:** Stil tekrarı, performans (her render'da yeni obje)
- **Öncelik:** 🟢 Düşük

#### 2.6 **Empty Error Handling**
- **Lokasyon:** Birçok `try-catch` bloğu
- **Sorun:** Hatalar sessizce yutuluyor:
  ```typescript
  try {
    // ...
  } catch {}  // ❌ Hata loglanmıyor
  ```
- **Etki:** Debug zorluğu, kullanıcı farkında olmuyor
- **Öncelik:** 🟡 Orta

#### 2.7 **Type Safety Issues**
- **Lokasyon:** `(window as any)?.nzxt?.v1`
- **Sorun:** Type assertion ile type safety bypass
- **Etki:** Runtime hataları, IDE desteği eksik
- **Öncelik:** 🟢 Düşük

---

## 3. Tekrarlanan Mantık

### 🔄 Tespit Edilen Tekrarlar

#### 3.1 **Storage Okuma/Yazma Mantığı**
**Tekrar Sayısı:** 3 (Config.tsx, ConfigPreview.tsx, KrakenOverlay.tsx)

**Ortak Pattern:**
```typescript
// Her component'te aynı kod:
const savedUrl = localStorage.getItem(URL_KEY);
const savedCfg = localStorage.getItem(CFG_KEY) || localStorage.getItem(CFG_COMPAT);
if (savedCfg) {
  try {
    const parsed = JSON.parse(savedCfg);
    // merge logic...
  } catch {}
}
```

**Çözüm:** `storage.ts` modülünü kullan veya custom hook oluştur

---

#### 3.2 **getBaseAlign Fonksiyonu**
**Tekrar Sayısı:** 3 (Display.tsx, KrakenOverlay.tsx, ConfigPreview.tsx)

**Ortak Pattern:**
```typescript
const base = (() => {
  switch (settings.align) {
    case 'top': return { x: 50, y: 0 };
    case 'bottom': return { x: 50, y: 100 };
    // ...
  }
})();
```

**Çözüm:** `utils/positioning.ts` dosyasına taşı

---

#### 3.3 **Video Detection**
**Tekrar Sayısı:** 3 (Display.tsx, KrakenOverlay.tsx, ConfigPreview.tsx)

**Ortak Pattern:**
```typescript
const isVideo = /\.mp4($|\?)/i.test(url) || url.toLowerCase().includes('mp4');
```

**Çözüm:** `utils/media.ts` → `isVideoUrl(url: string): boolean`

---

#### 3.4 **Storage Event Listener**
**Tekrar Sayısı:** 3 (Config.tsx, ConfigPreview.tsx, KrakenOverlay.tsx)

**Ortak Pattern:**
```typescript
useEffect(() => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === URL_KEY && e.newValue) setMediaUrl(e.newValue);
    if (e.key === CFG_KEY && e.newValue) {
      // parse logic...
    }
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}, []);
```

**Çözüm:** Custom hook: `useStorageSync(key: string, callback: Function)`

---

#### 3.5 **Settings Merge Logic**
**Tekrar Sayısı:** 2 (ConfigPreview.tsx, KrakenOverlay.tsx)

**Ortak Pattern:**
```typescript
const merged: Settings = {
  ...DEFAULTS,
  ...parsed,
  overlay: {
    ...DEFAULTS.overlay,
    ...(parsed.overlay || {}),
  },
};
```

**Çözüm:** `utils/settings.ts` → `mergeSettings(saved: any): Settings`

---

#### 3.6 **Media Rendering (Video/Image)**
**Tekrar Sayısı:** 2 (Display.tsx, KrakenOverlay.tsx)

**Ortak Pattern:**
```typescript
{isVideo ? (
  <video src={url} autoPlay loop muted playsInline style={...} />
) : (
  url && <img src={url} alt="..." style={...} />
)}
```

**Çözüm:** `<MediaRenderer url={url} settings={settings} />` component'i

---

## 4. Kullanılmayan Kod

### 🗑️ Tespit Edilen Kullanılmayan Öğeler

#### 4.1 **Display.tsx Component**
- **Dosya:** `src/ui/Display.tsx`
- **Durum:** ❌ Hiçbir yerde kullanılmıyor
- **Kullanım Yeri:** Yok
- **Alternatif:** `KrakenOverlay.tsx` aynı işlevi görüyor
- **Öneri:** Sil veya `KrakenOverlay`'e merge et

#### 4.2 **storage.ts Modülü**
- **Dosya:** `src/storage.ts`
- **Durum:** ❌ Hiçbir yerde import edilmiyor
- **Fonksiyonlar:**
  - `setMediaUrl()` - kullanılmıyor
  - `getMediaUrl()` - kullanılmıyor
  - `subscribe()` - kullanılmıyor
  - `getViewState()` - kullanılmıyor
  - `isKraken()` - kullanılmıyor
- **Öneri:** Ya kullan ya da sil (önerilen: kullan, çünkü iyi tasarlanmış)

#### 4.3 **dist/index.html**
- **Dosya:** `dist/index.html`
- **Durum:** ⚠️ Build output, ama içinde `Display` import'u var
- **Sorun:** `Display` component'i kullanılmıyor
- **Öneri:** Build sonrası otomatik oluşuyor, kaynak düzeltilmeli

#### 4.4 **overlays/ Klasörü**
- **Dosya:** `src/ui/components/overlays/`
- **Durum:** ⚠️ Boş klasör
- **Öneri:** Gelecek overlay'ler için placeholder, şimdilik sorun yok

---

## 5. State Akışı Analizi

### 📊 Sayfalar Arası State Yönetimi

#### 5.1 **index.html → main.tsx**

```
index.html
  └─> main.tsx
      ├─> URL Param Check: ?kraken=1
      │
      ├─> TRUE → KrakenOverlay.tsx (LCD Display)
      │   └─> localStorage'dan okur
      │   └─> window.nzxt.v1.onMonitoringDataUpdate dinler
      │
      └─> FALSE → Config.tsx (Configuration UI)
          └─> ConfigPreview.tsx (Preview + Controls)
```

**State Akışı:**
1. `Config.tsx` → URL input → `localStorage.setItem('media_url')`
2. `Config.tsx` → Settings → `localStorage.setItem('nzxtPinterestConfig')`
3. `StorageEvent` → `KrakenOverlay.tsx` dinler → State güncellenir
4. `ConfigPreview.tsx` → Throttled save (100ms) → `localStorage`

---

#### 5.2 **config.html → config.tsx**

```
config.html
  └─> config.tsx
      └─> Config.tsx (aynı component)
```

**Not:** `config.html` sadece alternatif entry point, aynı component'i render ediyor.

---

#### 5.3 **State Senkronizasyon Mekanizması**

```
┌─────────────────┐
│   Config.tsx    │
│  (User Input)   │
└────────┬────────┘
         │
         │ localStorage.setItem()
         │ StorageEvent dispatch
         ▼
┌─────────────────┐
│  localStorage   │
│  + Cookie       │
└────────┬────────┘
         │
         │ StorageEvent
         │ (cross-tab)
         ▼
┌─────────────────┐     ┌──────────────────┐
│ ConfigPreview   │     │  KrakenOverlay   │
│  (Preview UI)    │     │  (LCD Display)   │
└─────────────────┘     └──────────────────┘
```

**Senkronizasyon Yöntemleri:**
1. **StorageEvent** (native browser event)
2. **Cookie fallback** (CAM process isolation için)
3. **Polling** (storage.ts'de 2 saniyede bir, ama kullanılmıyor)

---

#### 5.4 **State Storage Keys**

| Key | Kullanım | Component'ler |
|-----|----------|---------------|
| `media_url` | Media URL | Config, ConfigPreview, KrakenOverlay, Display |
| `nzxtPinterestConfig` | Ana config objesi | Config, ConfigPreview, KrakenOverlay |
| `nzxtMediaConfig` | Compatibility key | Config, ConfigPreview, KrakenOverlay |
| `nzxtLang` | Dil tercihi | Config, ConfigPreview |

---

## 6. storage.ts Sistemi

### 🔧 Mevcut Tasarım (Kullanılmıyor)

#### 6.1 **Amaç**
`storage.ts` modülü, NZXT CAM'ın bazen Config ve Display sayfalarını **ayrı Chromium process'lerinde** çalıştırması sorununu çözmek için tasarlanmış.

#### 6.2 **Mimari**

```
┌─────────────────────────────────────┐
│         storage.ts Layer             │
├─────────────────────────────────────┤
│  Primary: localStorage               │
│  Fallback: Cookie (SameSite=None)   │
│  Observer: StorageEvent + Polling  │
└─────────────────────────────────────┘
```

#### 6.3 **Fonksiyonlar**

**6.3.1 `setMediaUrl(url: string)`**
- localStorage'a yazar
- Cookie'ye de yazar (cross-process için)
- Cookie: `SameSite=None; Secure`

**6.3.2 `getMediaUrl(): string`**
- Önce localStorage'dan okur
- Yoksa cookie'den okur
- Priority: localStorage > cookie

**6.3.3 `subscribe(fn: Listener)`**
- Media URL değişikliklerini dinler
- StorageEvent + Polling (2 saniye) kombinasyonu
- İlk değeri hemen callback'e gönderir

**6.3.4 `getViewState(): number`**
- Cookie'den `viewstate` değerini okur
- Default: 640

**6.3.5 `isKraken(): boolean`**
- URL'de `?kraken=1` parametresi var mı kontrol eder

---

#### 6.4 **Neden Kullanılmıyor?**

**Mevcut Durum:**
- Tüm component'ler doğrudan `localStorage` kullanıyor
- `storage.ts` hiçbir yerde import edilmiyor
- Cookie fallback mekanizması aktif değil

**Olası Nedenler:**
1. Geliştirme sırasında eklenmiş ama entegre edilmemiş
2. Test edilmiş, çalışmamış, alternatif çözüm kullanılmış
3. Gelecek için hazırlanmış ama henüz kullanılmamış

---

#### 6.5 **storage.ts vs Mevcut Sistem**

| Özellik | storage.ts | Mevcut Sistem |
|---------|------------|---------------|
| localStorage | ✅ | ✅ |
| Cookie fallback | ✅ | ❌ |
| Cross-process sync | ✅ | ⚠️ (sadece aynı process'te) |
| Polling fallback | ✅ | ❌ |
| Observer pattern | ✅ | ✅ (manuel) |
| Merkezi yönetim | ✅ | ❌ |

**Sonuç:** `storage.ts` daha gelişmiş, ama kullanılmıyor.

---

## 7. Öneriler

### 🎯 Öncelik Sırasına Göre

#### 🔴 Yüksek Öncelik

**1. storage.ts Entegrasyonu**
- Tüm `localStorage` kullanımlarını `storage.ts` modülüne taşı
- Cookie fallback aktif olacak
- Cross-process senkronizasyon çalışacak

**2. Display.tsx Kaldırma**
- Component kullanılmıyor
- `KrakenOverlay.tsx` zaten aynı işlevi görüyor
- Bundle size azalacak

**3. Storage Key Constants**
- `src/constants/storage.ts` dosyası oluştur
- Tüm key'leri merkezi yönet

**4. Error Handling İyileştirme**
- `try-catch` bloklarına console.error ekle
- Kullanıcıya hata mesajı göster (opsiyonel)

---

#### 🟡 Orta Öncelik

**5. Utility Fonksiyonları**
- `src/utils/positioning.ts` → `getBaseAlign()`
- `src/utils/media.ts` → `isVideoUrl()`
- `src/utils/settings.ts` → `mergeSettings()`

**6. Custom Hooks**
- `useStorageSync()` → Storage event listener
- `useConfig()` → Config okuma/yazma
- `useMediaUrl()` → Media URL yönetimi

**7. Shared Components**
- `<MediaRenderer />` → Video/Image rendering
- `<ConfigInput />` → URL input + save

**8. Default Settings Merkezileştirme**
- `src/constants/defaults.ts` → Tüm DEFAULTS objeleri

---

#### 🟢 Düşük Öncelik

**9. Type Safety**
- `window.nzxt` için type definition
- `src/types/nzxt.d.ts` dosyası

**10. CSS Modules**
- Inline style'ları CSS class'lara taşı
- Performans iyileştirmesi

**11. Testing**
- Unit test'ler (utils, hooks)
- Integration test'ler (storage sync)

---

### 📝 Refactoring Örnekleri

#### Örnek 1: storage.ts Kullanımı

**Önce:**
```typescript
// ConfigPreview.tsx
const savedUrl = localStorage.getItem('media_url');
localStorage.setItem('media_url', url);
```

**Sonra:**
```typescript
// ConfigPreview.tsx
import { getMediaUrl, setMediaUrl, subscribe } from '../../storage';

const [mediaUrl, setMediaUrlState] = useState(getMediaUrl());

useEffect(() => {
  const unsubscribe = subscribe((url) => {
    setMediaUrlState(url);
  });
  return unsubscribe;
}, []);
```

---

#### Örnek 2: Utility Fonksiyon

**Önce:**
```typescript
// Her component'te:
const isVideo = /\.mp4($|\?)/i.test(url) || url.toLowerCase().includes('mp4');
```

**Sonra:**
```typescript
// utils/media.ts
export function isVideoUrl(url: string): boolean {
  return /\.mp4($|\?)/i.test(url) || url.toLowerCase().includes('mp4');
}

// Component'te:
import { isVideoUrl } from '../../utils/media';
const isVideo = isVideoUrl(mediaUrl);
```

---

#### Örnek 3: Custom Hook

**Önce:**
```typescript
// Her component'te:
useEffect(() => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'media_url' && e.newValue) setMediaUrl(e.newValue);
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}, []);
```

**Sonra:**
```typescript
// hooks/useStorageSync.ts
export function useStorageSync(key: string, callback: (value: string) => void) {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) callback(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, callback]);
}

// Component'te:
useStorageSync('media_url', setMediaUrl);
```

---

## 📊 Özet İstatistikler

| Kategori | Sayı |
|----------|------|
| Toplam Component | 6 |
| Kullanılmayan Component | 1 (Display.tsx) |
| Kullanılmayan Modül | 1 (storage.ts) |
| Tekrarlanan Fonksiyon | 5+ |
| Storage Key Tekrarı | 3 yerde |
| Default Obje Tekrarı | 3 yerde |
| Anti-pattern | 7 |

---

## ✅ Sonuç

Proje genel olarak **iyi yapılandırılmış** ancak:

1. **Kod tekrarı** yüksek (refactoring gerekli)
2. **Kullanılmayan kod** var (temizlik gerekli)
3. **storage.ts** modülü hazır ama kullanılmıyor (entegrasyon gerekli)
4. **Merkezi yönetim** eksik (constants, utils, hooks)

**Önerilen Aksiyon Planı:**
1. `storage.ts` entegrasyonu (1-2 saat)
2. `Display.tsx` kaldırma (15 dakika)
3. Utility fonksiyonları oluşturma (2-3 saat)
4. Custom hook'lar oluşturma (2-3 saat)
5. Constants merkezileştirme (1 saat)

**Toplam Tahmini Süre:** 6-9 saat

---

**Rapor Hazırlayan:** AI Code Auditor  
**Tarih:** 2025


