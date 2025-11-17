# PROJE ANALİZ RAPORU - Overlay Mimarisini Sadeleştirme

**Tarih:** Analiz Aşaması  
**Amaç:** Mevcut overlay mimarisini analiz etmek ve refactoring stratejisi belirlemek

---

## 1. MEVCUT MİMARİ ANALİZİ

### 1.1 Overlay Options Mimarisi

**Mevcut Durum:**
- Overlay sistemi **mode-based** bir yapıya sahip: `"none" | "single" | "dual" | "triple" | "custom"`
- Her mode için ayrı render component'leri var:
  - `SingleInfographic.tsx` (133 satır)
  - `DualInfographic.tsx` (220 satır)
  - `TripleInfographic.tsx` (280 satır)
- Her component kendi CSS modülüne sahip:
  - `SingleInfographic.module.css`
  - `DualInfographic.module.css`
  - `TripleInfographic.module.css`

**Sorunlar:**
1. **Kod Tekrarı:** Her component'te `renderMetric` fonksiyonu benzer mantıkla tekrar ediyor
2. **Bakım Zorluğu:** Yeni bir özellik eklemek için 3 dosyayı birden güncellemek gerekiyor
3. **Tutarsızlık Riski:** Değişikliklerin tüm modlarda aynı şekilde uygulanması zor

### 1.2 Custom InfoGraphic Yapısı

**Mevcut Durum:**
- Custom mode, `CustomReading[]` ve `CustomText[]` array'leri kullanıyor
- Her reading/text kendi `id`, `x`, `y`, `order`, `labelIndex` değerlerine sahip
- Custom mode'da render işlemi `KrakenOverlay.tsx` içinde yapılıyor (satır 73-131)
- Custom readings, `SingleInfographic` component'ini tekrar kullanıyor (satır 85-97)

**Sorunlar:**
1. Custom mode render mantığı `KrakenOverlay.tsx` içinde dağınık
2. Custom mode için ayrı bir render pipeline yok, mevcut component'leri hack'liyor
3. Custom mode ile diğer modlar arasında tutarsızlık var

### 1.3 Overlay Elementlerinin Veri Modeli

**Mevcut Veri Modeli (`types/overlay.ts`):**

```typescript
interface OverlaySettings {
  mode: OverlayMode;
  primaryMetric: OverlayMetricKey;
  secondaryMetric?: OverlayMetricKey;
  tertiaryMetric?: OverlayMetricKey;
  
  // Single mode için
  numberColor: string;
  textColor: string;
  numberSize: number;
  textSize: number;
  x?: number;
  y?: number;
  
  // Dual/Triple mode için
  primaryNumberColor?: string;
  primaryTextColor?: string;
  secondaryNumberColor?: string;
  secondaryTextColor?: string;
  tertiaryNumberColor?: string;
  tertiaryTextColor?: string;
  secondaryNumberSize?: number;
  secondaryTextSize?: number;
  tertiaryNumberSize?: number;
  tertiaryTextSize?: number;
  
  // Divider ayarları
  showDivider?: boolean;
  dividerWidth?: number;
  dividerThickness?: number;
  dividerColor?: string;
  gap?: number;
  gapSecondaryTertiary?: number;
  dividerGap?: number;
  
  // Position ayarları
  secondaryOffsetX?: number;
  secondaryOffsetY?: number;
  dualReadersOffsetX?: number;
  dualReadersOffsetY?: number;
  
  // Custom mode için
  customReadings?: CustomReading[];
  customTexts?: CustomText[];
}

interface CustomReading {
  id: string;
  metric: OverlayMetricKey;
  numberColor: string;
  numberSize: number;
  x: number;
  y: number;
  order: number;
  labelIndex: number;
}

interface CustomText {
  id: string;
  text: string;
  textColor: string;
  textSize: number;
  x: number;
  y: number;
  order: number;
  labelIndex: number;
}
```

**Sorunlar:**
1. **Mode-specific fields:** Her mode için farklı field'lar var, bu karmaşık bir model oluşturuyor
2. **Optional fields:** Çok fazla optional field var, hangi field'ın hangi mode'da kullanıldığı belirsiz
3. **Tutarsız naming:** `numberColor` vs `primaryNumberColor` gibi isimlendirme tutarsızlıkları
4. **Custom mode ayrı:** Custom mode tamamen farklı bir yapı kullanıyor

### 1.4 Overlay Render Pipeline

**Mevcut Render Akışı:**

1. **KrakenOverlay.tsx** (LCD render):
   - Mode kontrolü yapıyor
   - Her mode için ayrı component render ediyor
   - Custom mode için özel render mantığı var

2. **OverlayPreview.tsx** (Preview render):
   - Aynı mode kontrolü tekrar ediyor
   - Aynı component'leri tekrar kullanıyor
   - Custom mode için ayrı render mantığı var

3. **Single/Dual/Triple Infographic Components:**
   - Her biri kendi `renderMetric` fonksiyonuna sahip
   - Her biri kendi CSS modülünü kullanıyor
   - Benzer mantık farklı implementasyonlarda

**Sorunlar:**
1. **Duplication:** Render mantığı iki yerde (KrakenOverlay + OverlayPreview) tekrar ediyor
2. **Mode branching:** Her yerde `if (mode === 'single')` gibi kontroller var
3. **Custom mode exception:** Custom mode her yerde özel durum olarak ele alınıyor

### 1.5 UI Editing Panel

**Mevcut Durum:**
- `OverlaySettings.tsx` (1726 satır) - Çok büyük bir dosya
- Mode'a göre conditional rendering yapıyor
- Her mode için ayrı form field'ları gösteriyor
- `OverlayField.tsx` component'i ile tekrar eden kod azaltılmış (87 satır)

**Sorunlar:**
1. **Büyük dosya:** 1726 satırlık bir component, bakımı zor
2. **Mode-specific UI:** Her mode için ayrı UI blokları var
3. **Tutarsız field handling:** Bazı field'lar `OverlayField` kullanıyor, bazıları inline

### 1.6 Kod Tekrarları

**Tespit Edilen Tekrarlar:**

1. **renderMetric fonksiyonu:**
   - `DualInfographic.tsx` (satır 48-127)
   - `TripleInfographic.tsx` (satır 58-137)
   - Her ikisi de neredeyse aynı kod

2. **Unit size hesaplama:**
   - Her component'te aynı mantık:
   ```typescript
   const unitSize = valueUnitType === "temp"
     ? numberSize * 0.49
     : valueUnitType === "percent"
     ? numberSize * 0.35
     : numberSize * 0.2;
   ```

3. **Clock rendering:**
   - Her component'te aynı clock rendering mantığı

4. **Mode checking:**
   - Her render noktasında mode kontrolü yapılıyor

### 1.7 Single/Dual/Triple Infographic Dosyaları

**Dosya Boyutları:**
- `SingleInfographic.tsx`: 133 satır
- `DualInfographic.tsx`: 220 satır
- `TripleInfographic.tsx`: 280 satır
- **Toplam:** 633 satır

**Ortak Özellikler:**
- Hepsi `AnimateNumber` component'ini kullanıyor
- Hepsi `getOverlayLabelAndValue` fonksiyonunu kullanıyor
- Hepsi benzer CSS yapısına sahip
- Hepsi benzer unit rendering mantığına sahip

**Farklılıklar:**
- Single: Tek metric, basit offset
- Dual: İki metric, divider, iki offset sistemi
- Triple: Üç metric, divider, üç offset sistemi

### 1.8 Overlay State Yönetimi

**Mevcut State Yönetimi:**
- **Zustand YOK:** Projede Zustand kullanılmıyor
- **React useState + localStorage:** `useConfig` hook'u ile yönetiliyor
- **Storage:** `localStorage` ile persist ediliyor
- **Sync:** Storage events ile cross-tab sync yapılıyor

**State Yapısı:**
```typescript
AppSettings {
  overlay?: OverlaySettings
}
```

**Sorunlar:**
1. **Nested state:** Overlay settings, AppSettings içinde nested
2. **Update pattern:** Her overlay field update'inde tüm settings merge ediliyor
3. **Type safety:** Optional overlay field, her yerde null check gerekiyor

### 1.9 Kodun Hangi Kısımları Yeni Mimariden Etkilenecek

**Etkilenecek Dosyalar:**

1. **Type Definitions:**
   - `src/types/overlay.ts` - Tamamen yeniden yazılacak

2. **Render Components:**
   - `src/ui/components/SingleInfographic.tsx` - **SİLİNECEK**
   - `src/ui/components/DualInfographic.tsx` - **SİLİNECEK**
   - `src/ui/components/TripleInfographic.tsx` - **SİLİNECEK**
   - `src/ui/components/KrakenOverlay.tsx` - Render pipeline değişecek
   - `src/ui/components/ConfigPreview/OverlayPreview.tsx` - Render pipeline değişecek

3. **CSS Modules:**
   - `src/ui/styles/SingleInfographic.module.css` - **SİLİNECEK**
   - `src/ui/styles/DualInfographic.module.css` - **SİLİNECEK**
   - `src/ui/styles/TripleInfographic.module.css` - **SİLİNECEK**
   - Yeni unified CSS modülü oluşturulacak

4. **UI Components:**
   - `src/ui/components/ConfigPreview/OverlaySettings.tsx` - Büyük değişiklikler
   - `src/ui/components/ConfigPreview/OverlayField.tsx` - Muhtemelen aynı kalacak

5. **Helpers:**
   - `src/utils/overlaySettingsHelpers.ts` - Güncellenecek
   - `src/domain/overlayModes.ts` - Mode transition logic değişecek

6. **Hooks:**
   - `src/hooks/useOverlayConfig.ts` - Muhtemelen aynı kalacak

### 1.10 Refactoring Risk Noktaları

**Yüksek Risk:**
1. **Custom mode migration:** Custom mode'un yeni mimariye uyarlanması kritik
2. **Positioning logic:** Offset hesaplamaları karmaşık, bozulma riski yüksek
3. **Divider rendering:** Dual/Triple mode'daki divider mantığı hassas
4. **Storage migration:** Mevcut localStorage'daki overlay data'nın yeni modele uyarlanması
5. **UI editing panel:** 1726 satırlık component'in refactor edilmesi riskli

**Orta Risk:**
1. **CSS migration:** Mevcut CSS'lerin yeni unified component'e uyarlanması
2. **Preview scaling:** Preview'daki scale hesaplamaları korunmalı
3. **Drag handlers:** Custom mode'daki drag logic'i yeni mimariye uyarlanmalı

**Düşük Risk:**
1. **Metric definitions:** `domain/metrics.ts` değişmeyecek
2. **AnimateNumber component:** Değişmeyecek
3. **Storage hooks:** `useConfig` hook'u aynı kalacak

### 1.11 Refactoring Sırasında Bozulabilecek Yerler

**Potansiyel Break Points:**
1. **Mode switching:** Mode değiştirirken default değerlerin uygulanması
2. **Custom mode rendering:** Custom readings/texts'in render edilmesi
3. **Offset calculations:** X/Y offset'lerin doğru hesaplanması
4. **Divider positioning:** Divider'ın doğru konumlanması
5. **Preview vs LCD render:** İki render noktasının tutarlı olması
6. **Storage persistence:** Ayarların doğru kaydedilmesi ve yüklenmesi

---

## 2. FAZ1 VE FAZ2 İÇİN TEKNİK STRATEJİ

### 2.1 FAZ1: Overlay Mimarisini Sadeleştirme

**Hedef:**
- Overlay Options mimarisini tamamen kaldırmak (Single/Dual/Triple ayrımı)
- Overlay'i tek model altında toplamak
- Tüm overlay render işlemlerini tek pipeline ile yapmak
- Editing UI'yı yeni modele bağlamak
- Eski dosyaları temizlemek

**Yeni Mimari Tasarımı:**

#### 2.1.1 Yeni OverlayElement Modeli

```typescript
type OverlayElementType = "metric" | "text" | "divider" | "icon" | "weather"; // Future-proof

interface OverlayElement {
  id: string;
  type: OverlayElementType;
  
  // Position
  x: number;
  y: number;
  zIndex?: number; // Render order
  
  // Common styling
  opacity?: number;
  rotation?: number; // Future: rotate support
  
  // Type-specific data
  data: MetricElementData | TextElementData | DividerElementData | IconElementData | WeatherElementData;
}

interface MetricElementData {
  metric: OverlayMetricKey;
  numberColor: string;
  numberSize: number;
  textColor: string;
  textSize: number;
  showLabel?: boolean;
}

interface TextElementData {
  text: string;
  textColor: string;
  textSize: number;
}

interface DividerElementData {
  width: number; // Percentage of height
  thickness: number;
  color: string;
  orientation: "vertical" | "horizontal"; // Future support
}
```

#### 2.1.2 Yeni Overlay Modeli

```typescript
interface Overlay {
  mode: "none" | "preset" | "custom";
  presetId?: string; // For preset mode
  elements: OverlayElement[];
  
  // Global settings (optional, can be overridden per element)
  defaultNumberColor?: string;
  defaultTextColor?: string;
  defaultNumberSize?: number;
  defaultTextSize?: number;
}
```

#### 2.1.3 Render Pipeline

**Yeni Unified Render Component:**
- `UnifiedOverlayRenderer.tsx` - Tek bir component, tüm elementleri render eder
- Her element type için ayrı render fonksiyonu
- Position, rotation, zIndex'e göre sıralama

**Migration Strategy:**
1. Eski `OverlaySettings` → Yeni `Overlay` modeline dönüştürme fonksiyonu
2. Single/Dual/Triple mode'ları preset olarak tanımlama
3. Custom mode'u direkt yeni modele mapping

#### 2.1.4 Dosya Değişiklikleri

**Silinecek Dosyalar:**
- `src/ui/components/SingleInfographic.tsx`
- `src/ui/components/DualInfographic.tsx`
- `src/ui/components/TripleInfographic.tsx`
- `src/ui/styles/SingleInfographic.module.css`
- `src/ui/styles/DualInfographic.module.css`
- `src/ui/styles/TripleInfographic.module.css`

**Yeni Dosyalar:**
- `src/types/overlay.ts` - Yeniden yazılacak
- `src/ui/components/UnifiedOverlayRenderer.tsx` - Yeni unified renderer
- `src/ui/components/OverlayElementRenderer.tsx` - Element-specific renderers
- `src/ui/styles/UnifiedOverlay.module.css` - Yeni unified CSS
- `src/utils/overlayMigration.ts` - Eski modelden yeni modele migration

**Güncellenecek Dosyalar:**
- `src/ui/components/KrakenOverlay.tsx`
- `src/ui/components/ConfigPreview/OverlayPreview.tsx`
- `src/ui/components/ConfigPreview/OverlaySettings.tsx`
- `src/utils/overlaySettingsHelpers.ts`
- `src/domain/overlayModes.ts`

### 2.2 FAZ2: Overlay Preset Sistemi

**Hedef:**
- Overlay Preset sistemini eklemek
- Presetler minimal UI ile seçilebilmeli
- Preset seçildiğinde overlay tamamen preset ile değişmeli
- Single/Dual/Triple preset olarak geri gelmeli
- Presetler TS/JSON içinde statik tanımlı olacak

**Preset Yapısı:**

```typescript
interface OverlayPreset {
  id: string;
  name: string;
  description?: string;
  elements: OverlayElement[];
  thumbnail?: string; // Future: preset preview
}

const OVERLAY_PRESETS: Record<string, OverlayPreset> = {
  "single-cpu": {
    id: "single-cpu",
    name: "Single - CPU Temperature",
    elements: [
      {
        id: "metric-1",
        type: "metric",
        x: 0,
        y: 0,
        data: {
          metric: "cpuTemp",
          numberColor: "rgba(255, 255, 255, 1)",
          numberSize: 180,
          textColor: "rgba(255, 255, 255, 1)",
          textSize: 45,
          showLabel: true,
        }
      }
    ]
  },
  // ... diğer presetler
};
```

**UI Değişiklikleri:**
- OverlaySettings'e preset seçim dropdown'u eklenecek
- Preset seçildiğinde `overlay.mode = "preset"` ve `overlay.presetId` set edilecek
- Preset apply fonksiyonu ile overlay tamamen preset ile değiştirilecek

**Dosya Değişiklikleri:**
- `src/constants/overlayPresets.ts` - Yeni preset definitions
- `src/utils/overlayPresets.ts` - Preset apply/get fonksiyonları
- `src/ui/components/ConfigPreview/OverlaySettings.tsx` - Preset selector eklenecek

---

## 3. RİSK ANALİZİ

### 3.1 Yüksek Riskli Alanlar

1. **Custom Mode Migration:**
   - Mevcut `CustomReading[]` ve `CustomText[]` yapısının yeni `OverlayElement[]` yapısına dönüştürülmesi
   - `order` ve `labelIndex` mantığının korunması
   - Drag & drop functionality'nin çalışmaya devam etmesi

2. **Positioning Logic:**
   - Dual/Triple mode'daki karmaşık offset hesaplamaları
   - Divider positioning
   - Preview vs LCD render tutarlılığı

3. **Storage Migration:**
   - Mevcut localStorage'daki overlay data'nın yeni modele uyarlanması
   - Backward compatibility

### 3.2 Orta Riskli Alanlar

1. **UI Editing Panel:**
   - 1726 satırlık component'in refactor edilmesi
   - Mode-specific UI'ların yeni modele uyarlanması

2. **CSS Migration:**
   - Mevcut CSS'lerin yeni unified component'e uyarlanması
   - Styling tutarlılığı

### 3.3 Düşük Riskli Alanlar

1. **Metric Definitions:**
   - `domain/metrics.ts` değişmeyecek
   - Metric rendering mantığı aynı kalacak

2. **AnimateNumber Component:**
   - Değişmeyecek, sadece kullanım şekli değişecek

---

## 4. UYGULAMA SIRASI ÖNERİSİ

### FAZ1: Adım Adım Uygulama

1. **Yeni Type Definitions Oluştur**
   - `OverlayElement` type'ı
   - `Overlay` type'ı
   - Migration helper types

2. **Migration Utilities Oluştur**
   - Eski `OverlaySettings` → Yeni `Overlay` dönüştürme
   - Test cases ile doğrulama

3. **Unified Renderer Component Oluştur**
   - `UnifiedOverlayRenderer.tsx`
   - Element-specific renderers
   - CSS modülü

4. **KrakenOverlay Güncelle**
   - Yeni renderer'ı kullan
   - Eski component import'larını kaldır

5. **OverlayPreview Güncelle**
   - Yeni renderer'ı kullan
   - Preview-specific logic'i koru

6. **OverlaySettings Güncelle**
   - Yeni model'e göre UI'ı güncelle
   - Mode-specific UI'ları kaldır
   - Unified element editing UI'ı ekle

7. **Eski Dosyaları Temizle**
   - Single/Dual/Triple component'leri sil
   - CSS modüllerini sil
   - Import'ları temizle

8. **Test ve Doğrulama**
   - Tüm modların çalıştığını doğrula
   - Custom mode'un çalıştığını doğrula
   - Storage persistence'ı test et

### FAZ2: Adım Adım Uygulama

1. **Preset Definitions Oluştur**
   - Single/Dual/Triple preset'lerini tanımla
   - Preset constants dosyası

2. **Preset Utilities Oluştur**
   - Preset apply fonksiyonu
   - Preset get fonksiyonu

3. **UI'ya Preset Selector Ekle**
   - Dropdown/select component
   - Preset seçim handler'ı

4. **Preset Apply Logic'i Bağla**
   - Preset seçildiğinde overlay'i güncelle
   - Mode'u "preset" olarak set et

5. **Test ve Doğrulama**
   - Preset seçiminin çalıştığını doğrula
   - Preset apply'in doğru çalıştığını doğrula

---

## 5. SONUÇ

Mevcut overlay mimarisi **mode-based** bir yapıya sahip ve önemli kod tekrarları içeriyor. FAZ1 ile bu yapıyı **element-based** bir mimariye dönüştürmek, kod tekrarını azaltacak ve gelecekteki özelliklerin (rotate, divider, weather, icon) eklenmesini kolaylaştıracak.

FAZ2 ile preset sistemi eklendiğinde, kullanıcılar hızlıca Single/Dual/Triple gibi hazır overlay'leri seçebilecek, ancak arka planda yeni unified mimari kullanılacak.

**Kritik Başarı Faktörleri:**
1. Custom mode'un doğru migration'ı
2. Positioning logic'in korunması
3. Storage backward compatibility
4. UI editing panel'in çalışmaya devam etmesi

