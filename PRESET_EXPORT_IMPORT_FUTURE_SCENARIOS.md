# Preset Export/Import Sisteminin Gelecek Senaryoları ve Mimari Önerileri

## 📋 Genel Bakış

Bu rapor, preset export/import sisteminin gelecekteki değişikliklere nasıl adapte olması gerektiğini analiz eder. Proje ilerledikçe ortaya çıkabilecek senaryoları ve bu senaryolara karşı alınması gereken mimari önlemleri içerir.

---

## 🔍 Mevcut Sistem Analizi

### Mevcut Schema Yapısı

**Schema Version**: 1

**Mevcut PresetFile Yapısı**:
```typescript
{
  schemaVersion: 1
  exportedAt: string
  appVersion: string
  presetName: string
  background: {
    url: string
    settings: {
      scale, x, y, fit, align, loop, autoplay, mute, resolution, backgroundColor
    }
  }
  overlay: {
    mode: "none" | "custom"
    elements: OverlayElement[]
  }
  misc?: {
    showGuide?: boolean
    language?: string
    [key: string]: unknown
  }
}
```

### Mevcut Migration Sistemi

- ✅ Version 0 → 1 migration mevcut
- ✅ `migratePreset()` fonksiyonu var
- ✅ Backward compatibility için fallback değerler kullanılıyor

---

## 🎯 Senaryo 1: Yeni Alan Ekleme (Non-Breaking Change)

### Senaryo Açıklaması

**Durum**: Projeye yeni bir background ayarı eklendi (örn: `brightness`, `contrast`, `saturation`)

**Örnek**:
```typescript
// Yeni AppSettings
interface AppSettings {
  // ... mevcut alanlar
  brightness?: number;  // YENİ
  contrast?: number;    // YENİ
  saturation?: number; // YENİ
}
```

### Etkiler

**Export**:
- ✅ Yeni alanlar export edilir (varsa)
- ✅ Eski preset dosyaları hala geçerli (yeni alanlar optional)

**Import**:
- ✅ Eski preset dosyaları import edilebilir (yeni alanlar default değerlerle doldurulur)
- ✅ Yeni preset dosyaları yeni alanları içerir

### Mimari Öneriler

1. **Optional Fields Kullanımı**
   - Yeni alanlar her zaman optional olmalı
   - Default değerler migration layer'da tanımlanmalı

2. **Migration Stratejisi**
   ```typescript
   function migrate1To2(file: PresetFile): PresetFile {
     return {
       ...file,
       schemaVersion: 2,
       background: {
         ...file.background,
         settings: {
           ...file.background.settings,
           brightness: file.background.settings.brightness ?? 1.0,  // Default
           contrast: file.background.settings.contrast ?? 1.0,
           saturation: file.background.settings.saturation ?? 1.0,
         }
       }
     };
   }
   ```

3. **Schema Güncelleme**
   - Schema version artırılmalı (1 → 2)
   - TypeScript interface güncellenmeli
   - Migration fonksiyonu eklenmeli

---

## 🎯 Senaryo 2: Alan Kaldırma (Breaking Change)

### Senaryo Açıklaması

**Durum**: Bir alan deprecated oldu ve kaldırıldı (örn: `resolution` artık kullanılmıyor)

**Örnek**:
```typescript
// Eski AppSettings
interface AppSettings {
  resolution: string;  // KALDIRILACAK
  // ... diğer alanlar
}

// Yeni AppSettings
interface AppSettings {
  // resolution kaldırıldı
  // ... diğer alanlar
}
```

### Etkiler

**Export**:
- ✅ Yeni export'larda alan yok
- ⚠️ Eski export'larda alan var (backward compatibility)

**Import**:
- ⚠️ Eski preset dosyaları import edilirken alan ignore edilmeli
- ✅ Yeni preset dosyaları alan içermez

### Mimari Öneriler

1. **Deprecation Stratejisi**
   - Önce deprecate et, sonra kaldır
   - Migration layer'da eski alanları ignore et

2. **Migration Stratejisi**
   ```typescript
   function migrate2To3(file: PresetFile): PresetFile {
     const { resolution, ...settingsWithoutResolution } = file.background.settings;
     // resolution alanı kaldırıldı, ignore ediliyor
     
     return {
       ...file,
       schemaVersion: 3,
       background: {
         ...file.background,
         settings: settingsWithoutResolution
       }
     };
   }
   ```

3. **Backward Compatibility**
   - Eski preset dosyaları import edilebilir olmalı
   - Kaldırılan alanlar migration sırasında temizlenmeli

---

## 🎯 Senaryo 3: Alan Tipi Değişikliği (Breaking Change)

### Senaryo Açıklaması

**Durum**: Bir alanın tipi değişti (örn: `fit` artık string array yerine enum object)

**Örnek**:
```typescript
// Eski
fit: 'cover' | 'contain' | 'fill'

// Yeni
fit: {
  mode: 'cover' | 'contain' | 'fill'
  customScale?: number
}
```

### Etkiler

**Export**:
- ✅ Yeni export'larda yeni format kullanılır
- ⚠️ Eski export'larda eski format var

**Import**:
- ⚠️ Eski preset dosyaları import edilirken format dönüştürülmeli
- ✅ Yeni preset dosyaları yeni formatı kullanır

### Mimari Öneriler

1. **Type Transformation**
   - Migration layer'da tip dönüşümü yapılmalı
   - Eski format → Yeni format mapping

2. **Migration Stratejisi**
   ```typescript
   function migrate3To4(file: PresetFile): PresetFile {
     const oldFit = file.background.settings.fit;
     const newFit = typeof oldFit === 'string' 
       ? { mode: oldFit }  // Eski format → Yeni format
       : oldFit;            // Zaten yeni format
     
     return {
       ...file,
       schemaVersion: 4,
       background: {
         ...file.background,
         settings: {
           ...file.background.settings,
           fit: newFit
         }
       }
     };
   }
   ```

3. **Validation**
   - Import sırasında tip kontrolü yapılmalı
   - Geçersiz formatlar için fallback değerler

---

## 🎯 Senaryo 4: Yeni Bölüm Ekleme (Non-Breaking Change)

### Senaryo Açıklaması

**Durum**: Preset'e yeni bir bölüm eklendi (örn: `animations`, `effects`, `themes`)

**Örnek**:
```typescript
// Yeni PresetFile
interface PresetFile {
  // ... mevcut alanlar
  animations?: {  // YENİ BÖLÜM
    fadeIn?: boolean
    fadeOut?: boolean
    duration?: number
  }
  effects?: {  // YENİ BÖLÜM
    blur?: number
    sharpen?: number
  }
}
```

### Etkiler

**Export**:
- ✅ Yeni bölümler export edilir (varsa)
- ✅ Eski preset dosyaları hala geçerli

**Import**:
- ✅ Eski preset dosyaları import edilebilir (yeni bölümler optional)
- ✅ Yeni preset dosyaları yeni bölümleri içerir

### Mimari Öneriler

1. **Modular Schema Design**
   - Her bölüm ayrı interface olmalı
   - Optional bölümler için `?` kullanılmalı

2. **Schema Güncelleme**
   ```typescript
   interface PresetFile {
     // ... mevcut alanlar
     animations?: AnimationSettings;  // Yeni bölüm
     effects?: EffectSettings;       // Yeni bölüm
   }
   ```

3. **Migration Stratejisi**
   ```typescript
   function migrate4To5(file: PresetFile): PresetFile {
     return {
       ...file,
       schemaVersion: 5,
       animations: file.animations ?? DEFAULT_ANIMATIONS,
       effects: file.effects ?? DEFAULT_EFFECTS,
     };
   }
   ```

---

## 🎯 Senaryo 5: Bölüm Yapısı Değişikliği (Breaking Change)

### Senaryo Açıklaması

**Durum**: Mevcut bir bölümün yapısı değişti (örn: `overlay` artık farklı bir yapıda)

**Örnek**:
```typescript
// Eski Overlay
interface Overlay {
  mode: "none" | "custom"
  elements: OverlayElement[]
}

// Yeni Overlay
interface Overlay {
  enabled: boolean
  groups: OverlayGroup[]  // Yeni yapı
  globalSettings: OverlayGlobalSettings
}
```

### Etkiler

**Export**:
- ✅ Yeni export'larda yeni yapı kullanılır
- ⚠️ Eski export'larda eski yapı var

**Import**:
- ⚠️ Eski preset dosyaları import edilirken yapı dönüştürülmeli
- ✅ Yeni preset dosyaları yeni yapıyı kullanır

### Mimari Öneriler

1. **Complex Migration**
   - Yapısal dönüşüm için özel migration fonksiyonları
   - Eski yapı → Yeni yapı mapping

2. **Migration Stratejisi**
   ```typescript
   function migrate5To6(file: PresetFile): PresetFile {
     const oldOverlay = file.overlay;
     
     // Eski yapı → Yeni yapı dönüşümü
     const newOverlay: NewOverlay = {
       enabled: oldOverlay.mode !== 'none',
       groups: oldOverlay.mode === 'custom' && oldOverlay.elements.length > 0
         ? convertElementsToGroups(oldOverlay.elements)
         : [],
       globalSettings: DEFAULT_OVERLAY_GLOBAL_SETTINGS
     };
     
     return {
       ...file,
       schemaVersion: 6,
       overlay: newOverlay
     };
   }
   ```

3. **Data Loss Handling**
   - Dönüşüm sırasında veri kaybı olabilir
   - Kullanıcıya uyarı verilmeli
   - Mümkün olduğunca veri korunmalı

---

## 🎯 Senaryo 6: Nested Structure Değişikliği

### Senaryo Açıklaması

**Durum**: İç içe yapı değişti (örn: `background.settings` artık `background.media` ve `background.position` olarak ayrıldı)

**Örnek**:
```typescript
// Eski
background: {
  url: string
  settings: { scale, x, y, fit, align, ... }
}

// Yeni
background: {
  media: {
    url: string
    fit: string
    align: string
  }
  position: {
    scale: number
    x: number
    y: number
  }
}
```

### Etkiler

**Export**:
- ✅ Yeni export'larda yeni nested yapı kullanılır
- ⚠️ Eski export'larda eski flat yapı var

**Import**:
- ⚠️ Eski preset dosyaları import edilirken nested yapıya dönüştürülmeli
- ✅ Yeni preset dosyaları yeni nested yapıyı kullanır

### Mimari Öneriler

1. **Nested Migration**
   - Deep merge stratejisi
   - Eski flat yapı → Yeni nested yapı mapping

2. **Migration Stratejisi**
   ```typescript
   function migrate6To7(file: PresetFile): PresetFile {
     const oldSettings = file.background.settings;
     
     return {
       ...file,
       schemaVersion: 7,
       background: {
         media: {
           url: file.background.url,
           fit: oldSettings.fit,
           align: oldSettings.align,
         },
         position: {
           scale: oldSettings.scale,
           x: oldSettings.x,
           y: oldSettings.y,
         }
       }
     };
   }
   ```

---

## 🎯 Senaryo 7: Enum Değer Değişikliği

### Senaryo Açıklaması

**Durum**: Enum değerleri değişti (örn: `fit` artık `'cover'` yerine `'fill-screen'` kullanıyor)

**Örnek**:
```typescript
// Eski
fit: 'cover' | 'contain' | 'fill'

// Yeni
fit: 'fill-screen' | 'fit-screen' | 'stretch'
```

### Etkiler

**Export**:
- ✅ Yeni export'larda yeni enum değerleri kullanılır
- ⚠️ Eski export'larda eski enum değerleri var

**Import**:
- ⚠️ Eski preset dosyaları import edilirken enum mapping yapılmalı
- ✅ Yeni preset dosyaları yeni enum değerlerini kullanır

### Mimari Öneriler

1. **Enum Mapping**
   - Eski değer → Yeni değer mapping tablosu
   - Bilinmeyen değerler için fallback

2. **Migration Stratejisi**
   ```typescript
   const FIT_MAPPING: Record<string, string> = {
     'cover': 'fill-screen',
     'contain': 'fit-screen',
     'fill': 'stretch'
   };
   
   function migrate7To8(file: PresetFile): PresetFile {
     const oldFit = file.background.settings.fit;
     const newFit = FIT_MAPPING[oldFit] || 'fill-screen';  // Fallback
     
     return {
       ...file,
       schemaVersion: 8,
       background: {
         ...file.background,
         settings: {
           ...file.background.settings,
           fit: newFit as any
         }
       }
     };
   }
   ```

---

## 🎯 Senaryo 8: Validation Kuralları Değişikliği

### Senaryo Açıklaması

**Durum**: Bir alanın geçerli değer aralığı değişti (örn: `scale` artık 0.1-5.0 yerine 0.5-3.0)

**Örnek**:
```typescript
// Eski
scale: number  // 0.1 - 5.0 geçerli

// Yeni
scale: number  // 0.5 - 3.0 geçerli
```

### Etkiler

**Export**:
- ✅ Yeni export'larda yeni aralıkta değerler
- ⚠️ Eski export'larda eski aralıkta değerler olabilir

**Import**:
- ⚠️ Eski preset dosyaları import edilirken değerler clamp edilmeli
- ✅ Yeni preset dosyaları yeni aralıkta değerler içerir

### Mimari Öneriler

1. **Value Clamping**
   - Import sırasında değerleri yeni aralığa clamp et
   - Kullanıcıya uyarı ver (değer değişti)

2. **Migration Stratejisi**
   ```typescript
   function migrate8To9(file: PresetFile): PresetFile {
     const oldScale = file.background.settings.scale;
     const newScale = Math.max(0.5, Math.min(3.0, oldScale));  // Clamp
     
     if (oldScale !== newScale) {
       console.warn(`Scale value ${oldScale} clamped to ${newScale}`);
     }
     
     return {
       ...file,
       schemaVersion: 9,
       background: {
         ...file.background,
         settings: {
           ...file.background.settings,
           scale: newScale
         }
       }
     };
   }
   ```

---

## 🎯 Senaryo 9: Çoklu Versiyon Desteği

### Senaryo Açıklaması

**Durum**: Sistem artık çoklu schema versiyonlarını destekliyor (v1, v2, v3 aynı anda)

### Mimari Öneriler

1. **Version Router**
   ```typescript
   function migratePreset(file: unknown): PresetFile {
     const version = getVersion(file);
     
     let migrated = file;
     
     // Sequential migration
     if (version < 1) migrated = migrate0To1(migrated);
     if (version < 2) migrated = migrate1To2(migrated);
     if (version < 3) migrated = migrate2To3(migrated);
     // ... continue for all versions
     
     return migrated as PresetFile;
   }
   ```

2. **Version Detection**
   - Schema version field'ı kontrol et
   - Yoksa version 0 kabul et

---

## 🎯 Senaryo 10: Partial Import/Export

### Senaryo Açıklaması

**Durum**: Kullanıcı sadece belirli bölümleri export/import etmek istiyor (örn: sadece overlay, sadece background)

### Mimari Öneriler

1. **Selective Export**
   ```typescript
   interface ExportOptions {
     includeBackground?: boolean
     includeOverlay?: boolean
     includeMisc?: boolean
   }
   
   export function exportPreset(
     settings: AppSettings,
     mediaUrl: string,
     presetName: string,
     options?: ExportOptions
   ): Promise<void>
   ```

2. **Selective Import**
   ```typescript
   interface ImportOptions {
     mergeMode: 'replace' | 'merge' | 'selective'
     selectedSections?: string[]
   }
   ```

---

## 🏗️ ÖNERİLEN MİMARİ YAPISI

### 1. Schema Versioning Strategy

```typescript
// Schema version management
const CURRENT_SCHEMA_VERSION = 1;
const MIN_SUPPORTED_VERSION = 0;  // En eski desteklenen versiyon

// Version history
const VERSION_HISTORY = {
  0: 'Initial version (no schemaVersion field)',
  1: 'Current version with presetName',
  // Future versions...
};
```

### 2. Migration Pipeline

```typescript
interface MigrationFunction {
  (file: any): PresetFile;
}

const MIGRATION_PIPELINE: Record<number, MigrationFunction> = {
  0: migrate0To1,
  1: migrate1To2,  // Future
  2: migrate2To3,  // Future
  // ...
};

function migratePreset(file: unknown): PresetFile {
  const version = getVersion(file);
  
  let migrated = file;
  
  // Apply all migrations sequentially
  for (let v = version; v < CURRENT_SCHEMA_VERSION; v++) {
    const migration = MIGRATION_PIPELINE[v];
    if (migration) {
      migrated = migration(migrated);
    }
  }
  
  return migrated as PresetFile;
}
```

### 3. Validation Layer

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validatePresetFile(file: PresetFile): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate required fields
  if (!file.presetName) {
    errors.push('presetName is required');
  }
  
  // Validate value ranges
  if (file.background.settings.scale < 0.1 || file.background.settings.scale > 5.0) {
    warnings.push('scale value is outside recommended range');
  }
  
  // Validate enum values
  const validFits = ['cover', 'contain', 'fill'];
  if (!validFits.includes(file.background.settings.fit)) {
    errors.push(`Invalid fit value: ${file.background.settings.fit}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

### 4. Error Handling Strategy

```typescript
interface ImportResult {
  success: boolean;
  preset?: PresetFile;
  settings?: Partial<AppSettings>;
  mediaUrl?: string;
  errors?: string[];
  warnings?: string[];
}

async function importPreset(file: File): Promise<ImportResult> {
  try {
    // 1. Parse JSON
    const parsed = JSON.parse(await file.text());
    
    // 2. Migrate to current version
    const migrated = migratePreset(parsed);
    
    // 3. Validate
    const validation = validatePresetFile(migrated);
    
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings
      };
    }
    
    // 4. Convert to settings
    const settings = convertPresetToSettings(migrated);
    
    return {
      success: true,
      preset: migrated,
      settings,
      mediaUrl: migrated.background.url,
      warnings: validation.warnings
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}
```

### 5. Backward Compatibility Strategy

```typescript
// Always support reading older versions
const SUPPORTED_VERSIONS = [0, 1, 2, 3];  // Extend as needed

// Always write current version
function exportPreset(...): PresetFile {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    // ... current structure
  };
}

// Always read any supported version
function importPreset(...): PresetFile {
  const migrated = migratePreset(parsed);
  // migrated is always in CURRENT_SCHEMA_VERSION format
  return migrated;
}
```

### 6. Forward Compatibility Strategy

```typescript
// Unknown fields should be preserved
interface PresetFile {
  // Known fields
  schemaVersion: number;
  // ...
  
  // Unknown fields (for forward compatibility)
  [key: string]: unknown;
}

// During migration, preserve unknown fields
function migrate1To2(file: PresetFile): PresetFile {
  const { unknownField1, unknownField2, ...knownFields } = file;
  
  return {
    ...knownFields,
    schemaVersion: 2,
    // Preserve unknown fields
    ...(unknownField1 && { unknownField1 }),
    ...(unknownField2 && { unknownField2 }),
  };
}
```

---

## 📋 MİMARİ PRENSİPLER

### 1. **Versioning Principles**

- ✅ Her breaking change schema version artırılmalı
- ✅ Non-breaking changes aynı version'da kalabilir
- ✅ Version history dokümante edilmeli
- ✅ Minimum supported version belirlenmeli

### 2. **Migration Principles**

- ✅ Sequential migration (0→1→2→3...)
- ✅ Her migration fonksiyonu tek bir versiyon atlamalı
- ✅ Migration fonksiyonları idempotent olmalı
- ✅ Migration sırasında veri kaybı minimize edilmeli

### 3. **Validation Principles**

- ✅ Import sırasında validation yapılmalı
- ✅ Geçersiz değerler için fallback değerler
- ✅ Kullanıcıya validation hataları/warnings gösterilmeli
- ✅ Validation kuralları version'a göre değişebilir

### 4. **Compatibility Principles**

- ✅ Backward compatibility: Eski dosyalar okunabilmeli
- ✅ Forward compatibility: Bilinmeyen alanlar korunmalı
- ✅ Graceful degradation: Eksik alanlar için default değerler
- ✅ Data preservation: Mümkün olduğunca veri korunmalı

### 5. **Error Handling Principles**

- ✅ Hata durumlarında kullanıcıya bilgi verilmeli
- ✅ Partial import/export desteklenmeli
- ✅ Recovery mekanizmaları olmalı
- ✅ Logging ve debugging bilgileri

---

## 🧪 TEST STRATEJİSİ

### 1. Migration Tests

```typescript
describe('Preset Migration', () => {
  it('should migrate version 0 to 1', () => {
    const v0File = { /* old structure */ };
    const migrated = migratePreset(v0File);
    expect(migrated.schemaVersion).toBe(1);
    expect(migrated.presetName).toBeDefined();
  });
  
  it('should handle missing fields gracefully', () => {
    const incompleteFile = { schemaVersion: 0 };
    const migrated = migratePreset(incompleteFile);
    expect(migrated).toBeDefined();
  });
});
```

### 2. Validation Tests

```typescript
describe('Preset Validation', () => {
  it('should reject invalid enum values', () => {
    const invalidFile = {
      ...validFile,
      background: { settings: { fit: 'invalid' } }
    };
    const result = validatePresetFile(invalidFile);
    expect(result.valid).toBe(false);
  });
});
```

### 3. Round-trip Tests

```typescript
describe('Export/Import Round-trip', () => {
  it('should preserve all settings after export/import', () => {
    const originalSettings = { /* ... */ };
    const exported = exportPreset(originalSettings, url, 'test');
    const imported = importPreset(exported);
    expect(imported.settings).toEqual(originalSettings);
  });
});
```

---

## 📊 ÖNCELİK MATRİSİ

### Yüksek Öncelik

1. ✅ **Migration Pipeline**: Sequential migration sistemi
2. ✅ **Validation Layer**: Import sırasında validation
3. ✅ **Error Handling**: Kullanıcı dostu hata mesajları
4. ✅ **Backward Compatibility**: Eski dosyaları okuma

### Orta Öncelik

1. ⚠️ **Forward Compatibility**: Bilinmeyen alanları koruma
2. ⚠️ **Value Clamping**: Geçersiz değerleri düzeltme
3. ⚠️ **Warning System**: Kullanıcıya uyarı gösterme

### Düşük Öncelik

1. 📝 **Partial Import/Export**: Seçici import/export
2. 📝 **Version History**: Detaylı versiyon geçmişi
3. 📝 **Migration Preview**: Migration öncesi önizleme

---

## 🎯 SONUÇ VE ÖNERİLER

### Kritik Öneriler

1. **Migration Pipeline Kurulumu**
   - Sequential migration sistemi kurulmalı
   - Her versiyon için migration fonksiyonu yazılmalı
   - Migration testleri yazılmalı

2. **Validation Sistemi**
   - Import sırasında validation yapılmalı
   - Geçersiz değerler için fallback mekanizması
   - Kullanıcıya validation sonuçları gösterilmeli

3. **Error Handling**
   - Tüm hata durumları handle edilmeli
   - Kullanıcı dostu hata mesajları
   - Recovery mekanizmaları

4. **Documentation**
   - Schema version history dokümante edilmeli
   - Migration kuralları dokümante edilmeli
   - Breaking changes listelenmeli

### Uzun Vadeli Strateji

1. **Schema Evolution Plan**
   - Gelecekteki değişiklikler için plan
   - Breaking change'ler için timeline
   - Deprecation policy

2. **Testing Strategy**
   - Migration testleri
   - Validation testleri
   - Round-trip testleri
   - Edge case testleri

3. **Monitoring**
   - Import/export hata oranları
   - Migration başarı oranları
   - Kullanıcı şikayetleri

---

**Rapor Tarihi**: 2024
**Hazırlayan**: AI Assistant
**Durum**: 📋 Analiz ve Öneriler Tamamlandı

