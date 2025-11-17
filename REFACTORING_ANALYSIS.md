# ConfigPreview Refactoring Analizi ve Planı

## Önceki Refactoring'in Başarısız Olma Nedenleri

### 1. **Çok Fazla State ve Ref'in Bölünmesi**
- 8+ useState hook'u (isDragging, isDraggingOverlay, selectedReadingId, vb.)
- 7+ useRef (dragStart, overlayDragStart, settingsRef, vb.)
- Bu state'ler birbirine sıkı bağlı ve senkronize çalışması gerekiyor
- Bölünme sırasında closure ve stale state sorunları oluştu

### 2. **Kritik Bağımlılıkların Yanlış Paylaşımı**
- `offsetScale` hesaplaması CRITICAL - her drag handler'da kullanılıyor
- `settingsRef` - real-time sync için kritik
- `overlayConfig` - her yerde kullanılıyor
- Bu değerler component'ler arasında doğru şekilde paylaşılamadı

### 3. **Drag Handler'ların Karmaşıklığı**
- 6 farklı drag handler tipi:
  - Background drag
  - Overlay drag (single mode)
  - Secondary/Tertiary drag (dual/triple mode)
  - Custom reading drag
  - Custom text drag
- Her biri farklı state güncellemesi yapıyor
- useCallback ile memoize edilmiş ama closure dependencies karmaşık

### 4. **Prop Drilling Sorunu**
- Çok fazla prop geçişi gerekti (settings, setSettings, lang, offsetScale, overlayConfig, vb.)
- Her component'e 10+ prop geçmek zorunda kaldık
- Type safety kayboldu

### 5. **Throttled Save Mekanizması**
- 100ms throttled save - real-time sync için kritik
- hasLoadedRef ve hasInteractedRef kontrolü
- Bu mekanizma bölünürken bozuldu

## Mevcut Yapı Analizi

### Dosya Boyutu
- **3983 satır** - tek bir dosyada
- **419 JSX elementi** - çok fazla nested structure

### Ana Bölümler
1. **Background Section** (~600 satır)
   - Preview circle (drag support)
   - Settings panel (scale, x, y, align, fit, backgroundColor, showGuide)

2. **Overlay Section** (~3300 satır)
   - Preview (single/dual/triple/custom mode support)
   - Settings panel (mode-specific settings, custom readings/texts)

### Kritik Bağımlılıklar
- `offsetScale = previewSize / lcdResolution` - CRITICAL formula
- `settingsRef` - stale closure önlemek için
- `overlayConfig` - computed from settings.overlay
- `metrics` - monitoring data (real or mock)
- `lang` - i18n support

## Yeni Refactoring Stratejisi

### Prensip: "Incremental Extraction, Preserve State"

### Faz 1: Custom Hooks Extraction (State Korunur)
**Hedef:** Logic'i ayır ama state'i merkezi tut

1. **usePreviewScaling** hook
   - offsetScale hesaplaması
   - overlayPreviewScale hesaplaması
   - LCD resolution detection

2. **useDragHandlers** hook
   - Tüm drag handler'ları bir araya topla
   - State'leri props olarak al (isDragging, setIsDragging, vb.)
   - offsetScale'i dependency olarak al

3. **useOverlayConfig** hook
   - overlayConfig computation
   - Mode switching logic

4. **useSettingsSync** hook
   - Throttled save logic
   - hasLoadedRef, hasInteractedRef management
   - settingsRef sync

### Faz 2: UI Component Extraction (Presentation Only)
**Hedef:** Sadece JSX'i böl, state logic'i hook'larda tut

1. **BackgroundPreview** component
   - Sadece preview circle JSX
   - Props: mediaUrl, settings, offsetScale, drag handlers
   - No state management

2. **BackgroundSettings** component
   - Sadece settings panel JSX
   - Props: settings, setSettings, lang
   - No state management

3. **OverlayPreview** component
   - Preview JSX (mode-specific rendering)
   - Props: overlayConfig, metrics, offsetScale, drag handlers
   - No state management

4. **OverlaySettings** component
   - Settings panel JSX (mode-specific)
   - Props: overlayConfig, settings, setSettings, lang
   - No state management

### Faz 3: Shared Components
**Hedef:** Tekrar eden UI pattern'lerini extract et

1. **SettingRow** component
   - Label + Input/ColorPicker + Reset button pattern
   - Props: label, value, onChange, onReset, type

2. **ResetButton** component
   - Reset icon button with tooltip
   - Props: onReset, tooltipContent

### Faz 4: Mode-Specific Components (Optional)
**Hedef:** Custom mode'un karmaşıklığını izole et

1. **CustomModePreview** component
   - Custom readings/texts preview rendering
   - Props: overlayConfig, metrics, offsetScale, drag handlers

2. **CustomModeSettings** component
   - Custom readings/texts settings UI
   - Props: overlayConfig, settings, setSettings, lang

## Refactoring Adımları (Sıralı)

### Adım 1: Backup ve Test
- ✅ Backup alındı (backup/nzxt-esc)
- ✅ Mevcut sistem çalışıyor

### Adım 2: usePreviewScaling Hook
- `src/hooks/usePreviewScaling.ts` oluştur
- offsetScale ve overlayPreviewScale hesaplamasını taşı
- Test: offsetScale değeri aynı mı?

### Adım 3: useSettingsSync Hook
- `src/hooks/useSettingsSync.ts` oluştur
- Throttled save logic'i taşı
- Test: Settings sync çalışıyor mu?

### Adım 4: useDragHandlers Hook
- `src/hooks/useDragHandlers.ts` oluştur
- Tüm drag handler'ları taşı
- State'leri props olarak al
- Test: Tüm drag işlemleri çalışıyor mu?

### Adım 5: useOverlayConfig Hook
- `src/hooks/useOverlayConfig.ts` oluştur
- overlayConfig computation ve mode switching
- Test: Mode değişimleri çalışıyor mu?

### Adım 6: SettingRow Component
- `src/ui/components/ConfigPreview/SettingRow.tsx` oluştur
- Tekrar eden setting row pattern'ini extract et
- Test: UI görünümü aynı mı?

### Adım 7: ResetButton Component
- `src/ui/components/ConfigPreview/ResetButton.tsx` oluştur
- Reset button pattern'ini extract et
- Test: Reset butonları çalışıyor mu?

### Adım 8: BackgroundPreview Component
- `src/ui/components/ConfigPreview/BackgroundPreview.tsx` oluştur
- Preview circle JSX'ini taşı
- Test: Background preview çalışıyor mu?

### Adım 9: BackgroundSettings Component
- `src/ui/components/ConfigPreview/BackgroundSettings.tsx` oluştur
- Background settings JSX'ini taşı
- Test: Background settings çalışıyor mu?

### Adım 10: OverlayPreview Component
- `src/ui/components/ConfigPreview/OverlayPreview.tsx` oluştur
- Overlay preview JSX'ini taşı
- Test: Overlay preview çalışıyor mu?

### Adım 11: OverlaySettings Component
- `src/ui/components/ConfigPreview/OverlaySettings.tsx` oluştur
- Overlay settings JSX'ini taşı
- Test: Overlay settings çalışıyor mu?

### Adım 12: CustomModePreview Component (Optional)
- `src/ui/components/ConfigPreview/CustomModePreview.tsx` oluştur
- Custom mode preview JSX'ini taşı
- Test: Custom mode preview çalışıyor mu?

### Adım 13: CustomModeSettings Component (Optional)
- `src/ui/components/ConfigPreview/CustomModeSettings.tsx` oluştur
- Custom mode settings JSX'ini taşı
- Test: Custom mode settings çalışıyor mu?

### Adım 14: ConfigPreview.tsx Refactor
- Ana component'i sadece orchestration için kullan
- Hook'ları ve component'leri birleştir
- Test: Tüm özellikler çalışıyor mu?

## Kritik Kontrol Noktaları

### Her Adımda Test Edilmesi Gerekenler:
1. ✅ offsetScale değeri doğru mu? (200 / 640 = 0.3125)
2. ✅ Background drag çalışıyor mu?
3. ✅ Overlay drag çalışıyor mu? (tüm modlar)
4. ✅ Custom reading drag çalışıyor mu?
5. ✅ Custom text drag çalışıyor mu?
6. ✅ Settings sync çalışıyor mu? (throttled save)
7. ✅ Mode switching çalışıyor mu?
8. ✅ Language switching çalışıyor mu?
9. ✅ Monitoring data gösteriliyor mu?
10. ✅ Tüm reset butonları çalışıyor mu?

## Risk Yönetimi

### Yüksek Riskli Adımlar:
- **Adım 4 (useDragHandlers)**: Closure ve state senkronizasyonu
- **Adım 5 (useOverlayConfig)**: Mode switching logic karmaşık
- **Adım 10 (OverlayPreview)**: Çok fazla conditional rendering

### Risk Azaltma:
- Her adımda commit yap
- Her adımda test et
- Bir adım başarısız olursa geri al
- Backup'tan geri dönme prosedürü hazır

## Başarı Kriterleri

1. ✅ Kod 3983 satırdan ~500 satıra düşmeli
2. ✅ Her component < 300 satır olmalı
3. ✅ Tüm özellikler çalışmalı (yukarıdaki test listesi)
4. ✅ Type safety korunmalı
5. ✅ Performance aynı veya daha iyi olmalı
6. ✅ Maintainability artmalı

## Notlar

- **State'i merkezi tut**: State management'i ana component'te bırak
- **Logic'i hook'lara taşı**: Reusable logic'i custom hook'lara extract et
- **UI'ı component'lere böl**: Sadece presentation layer'ı böl
- **Adım adım ilerle**: Her adımda test et, başarısız olursa geri al
- **Backup'ı unutma**: Her zaman geri dönebilmek için backup hazır

