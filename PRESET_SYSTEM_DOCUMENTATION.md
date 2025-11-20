# Preset System Documentation

## 📋 Genel Bakış

Bu dokümantasyon, preset export/import sisteminin mimarisi, versiyonlama stratejisi, migration kuralları ve validation/normalization katmanlarını açıklar.

---

## 🏗️ Mimari Yapı

### Dosya Organizasyonu

```
src/preset/
├── constants.ts          # Versiyon sabitleri ve değer aralıkları
├── schema.ts             # PresetFile tip tanımları
├── migration.ts          # Sequential migration pipeline
├── validation.ts         # Validation katmanı
├── normalization.ts     # Value clamping ve normalization
├── errors.ts             # Error handling ve kullanıcı mesajları
├── importPipeline.ts     # End-to-end import pipeline
├── index.ts              # Export/Import fonksiyonları
├── storage.ts            # localStorage operasyonları
└── __tests__/            # Test dosyaları
    ├── migration.test.ts
    ├── validation.test.ts
    ├── normalization.test.ts
    └── roundTrip.test.ts
```

---

## 📊 Schema Versiyonları

### Version 0 (Legacy)
- **Durum**: Artık desteklenmiyor (migration ile v1'e yükseltiliyor)
- **Özellikler**: 
  - `schemaVersion` alanı yok
  - `presetName` alanı yok
  - Temel yapı mevcut

### Version 1 (Current)
- **Durum**: Mevcut versiyon
- **Özellikler**:
  - `schemaVersion: 1` zorunlu
  - `presetName` zorunlu
  - Standart yapı

### Gelecek Versiyonlar
- **Version 2+**: Gelecekteki breaking change'ler için hazır
- Migration pipeline sayesinde otomatik yükseltme

---

## 🔄 Migration Pipeline

### Sequential Migration Mantığı

Migration pipeline, preset dosyalarını sıralı olarak yükseltir:

```
Version 0 → migrate0To1() → Version 1
Version 1 → migrate1To2() → Version 2
Version 2 → migrate2To3() → Version 3
...
```

### Migration Prensipleri

1. **Idempotent**: Aynı migration'ı birden fazla çalıştırmak güvenlidir
2. **Sequential**: Her migration sadece bir versiyon atlar (N → N+1)
3. **Data Preservation**: Mümkün olduğunca veri korunur
4. **Forward Compatibility**: Bilinmeyen alanlar korunur

### Migration Fonksiyonu Ekleme

Yeni bir versiyon eklendiğinde:

```typescript
// src/preset/migration.ts

// 1. Migration fonksiyonu ekle
function migrate1To2(file: PresetFile): PresetFile {
  return {
    ...file,
    schemaVersion: 2,
    // Yeni alanlar veya yapı değişiklikleri
  };
}

// 2. Registry'ye ekle
const MIGRATION_REGISTRY: Record<number, MigrationFunction> = {
  0: migrate0To1,
  1: migrate1To2, // YENİ
};

// 3. Constants'ı güncelle
// src/preset/constants.ts
export const CURRENT_SCHEMA_VERSION = 2; // Güncelle
```

---

## ✅ Validation Kuralları

### Zorunlu Alanlar

- `presetName`: String, boş olamaz
- `background`: Object, zorunlu
- `background.url`: String, zorunlu
- `background.settings`: Object, zorunlu
- `overlay`: Object, zorunlu

### Değer Aralıkları

| Alan | Min | Max | Varsayılan |
|------|-----|-----|------------|
| `scale` | 0.1 | 5.0 | 1.0 |
| `x` | -1000 | 1000 | 0 |
| `y` | -1000 | 1000 | 0 |

### Enum Değerleri

**fit**: `'cover' | 'contain' | 'fill'`
- `cover`: Ekranı kaplar, oran korunur
- `contain`: Tamamen görünür, oran korunur
- `fill`: Ekranı doldurur, oran bozulabilir

**align**: `'center' | 'top' | 'bottom' | 'left' | 'right'`
- Hizalama pozisyonu

### Validation Sonuçları

```typescript
interface ValidationResult {
  valid: boolean;        // Hata varsa false
  errors: ValidationIssue[];   // Bloklayıcı hatalar
  warnings: ValidationIssue[];  // Uyarılar (bloklamaz)
}
```

**Errors**: Import başarısız olur
**Warnings**: Import başarılı olur, ancak kullanıcı bilgilendirilir

---

## 🎚️ Normalization

### Normalization İşlemleri

1. **Value Clamping**: Değerleri geçerli aralığa çeker
   - `scale: 10` → `scale: 5.0` (max)
   - `x: 2000` → `x: 1000` (max)
   - `y: -2000` → `y: -1000` (min)

2. **Enum Düzeltme**: Geçersiz enum değerlerini varsayılana çevirir
   - `fit: 'invalid'` → `fit: 'cover'`
   - `align: 'invalid'` → `align: 'center'`

3. **Type Conversion**: Yanlış tipleri düzeltir
   - `loop: 'true'` → `loop: true` (string to boolean)

### Normalization Sonuçları

```typescript
interface NormalizationResult {
  normalized: PresetFile;  // Normalize edilmiş preset
  changes: NormalizationChange[];  // Yapılan değişiklikler
}
```

Her değişiklik kaydedilir ve kullanıcıya bildirilir.

---

## ⚠️ Error Handling

### Error Kodları

```typescript
ERROR_CODES = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  PARSE_ERROR: 'PARSE_ERROR',
  INVALID_SCHEMA: 'INVALID_SCHEMA',
  MIGRATION_FAILED: 'MIGRATION_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNSUPPORTED_VERSION: 'UNSUPPORTED_VERSION',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
}
```

### Kullanıcı Mesajları

Tüm hata mesajları i18n desteklidir (İngilizce ve Türkçe).

```typescript
getUserFriendlyErrorMessage(error: PresetError, lang: 'en' | 'tr'): string
```

---

## 🔄 Import Pipeline

### Pipeline Adımları

1. **File Validation**: Dosya türü kontrolü
2. **JSON Parse**: JSON ayrıştırma
3. **Version Detection**: Versiyon tespiti
4. **Migration**: Sequential migration
5. **Validation**: Yapı ve değer doğrulama
6. **Normalization**: Değer düzeltme
7. **Conversion**: AppSettings'e dönüştürme
8. **Result**: Yapılandırılmış sonuç

### Import Sonucu

```typescript
interface ImportResult {
  success: boolean;
  preset?: PresetFile;
  settings?: Partial<AppSettings>;
  mediaUrl?: string;
  validation?: ValidationResult;
  normalization?: NormalizationResult;
  errors?: Array<{ code, message, field, userMessage }>;
  warnings?: Array<{ field, message }>;
  normalizationChanges?: Array<{ field, oldValue, newValue }>;
}
```

---

## 🔙 Backward & Forward Compatibility

### Backward Compatibility

- **Eski Versiyonlar**: Version 0+ preset dosyaları okunabilir
- **Migration**: Otomatik olarak current version'a yükseltilir
- **Data Loss**: Mümkün olduğunca minimize edilir

### Forward Compatibility

- **Bilinmeyen Alanlar**: Korunur (JSON'da tutulur)
- **Yeni Versiyonlar**: Mümkün olduğunca okunmaya çalışılır
- **Graceful Degradation**: Eksik alanlar için varsayılan değerler

---

## 🧪 Test Stratejisi

### Test Türleri

1. **Migration Tests**: Her versiyon için migration testleri
2. **Validation Tests**: Geçerli/geçersiz değer testleri
3. **Normalization Tests**: Clamping ve düzeltme testleri
4. **Round-Trip Tests**: Export → Import → Export döngüsü

### Test Çalıştırma

```typescript
// Browser console'da
runMigrationTests();
runValidationTests();
runNormalizationTests();
runRoundTripTests();
```

---

## 📝 Best Practices

### Yeni Versiyon Ekleme

1. **Breaking Change mi?**
   - Evet → Version artır
   - Hayır → Aynı version'da kal

2. **Migration Fonksiyonu Yaz**
   - Idempotent olmalı
   - Veri kaybını minimize et

3. **Test Ekle**
   - Migration testi
   - Round-trip testi

4. **Dokümantasyonu Güncelle**
   - Schema history
   - Breaking changes

### Validation Ekleme

1. **Yeni Alan İçin Validator Ekle**
   ```typescript
   // src/preset/validation.ts
   function validateNewField(value: unknown, field: string): ValidationIssue | null {
     // Validation logic
   }
   ```

2. **Normalization Ekle**
   ```typescript
   // src/preset/normalization.ts
   // Clamp veya düzeltme mantığı
   ```

---

## 🔮 Gelecek Senaryolar

### Senaryo 1: Yeni Alan Ekleme
- **Versiyon**: Aynı (non-breaking)
- **Migration**: Gerekmez
- **Validation**: Yeni validator ekle

### Senaryo 2: Alan Kaldırma
- **Versiyon**: Artır (breaking)
- **Migration**: Eski alanı ignore et
- **Validation**: Kaldırılan alanı kontrol etme

### Senaryo 3: Tip Değişikliği
- **Versiyon**: Artır (breaking)
- **Migration**: Tip dönüşümü yap
- **Validation**: Yeni tip için validator

### Senaryo 4: Nested Yapı Değişikliği
- **Versiyon**: Artır (breaking)
- **Migration**: Yapısal dönüşüm
- **Validation**: Yeni yapı için validator

---

## 📚 Referanslar

- [Preset Export/Import Analiz Raporu](./PRESET_EXPORT_IMPORT_ANALYSIS.md)
- [Gelecek Senaryolar](./PRESET_EXPORT_IMPORT_FUTURE_SCENARIOS.md)
- [Geliştirme Yol Haritası](./PRESET_SYSTEM_IMPROVEMENT_ROADMAP.md)

---

**Son Güncelleme**: 2024
**Versiyon**: 1.0
**Durum**: ✅ Production Ready

