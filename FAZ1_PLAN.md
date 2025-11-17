# FAZ1 UYGULAMA PLANI - Overlay Mimarisini Sadeleştirme

**Tarih:** Planlama Aşaması  
**Amaç:** Mode-based overlay mimarisini element-based mimariye dönüştürmek

---

## GENEL STRATEJİ

### Hedefler
1. ✅ Overlay Options mimarisini (single/dual/triple) tamamen kaldırmak
2. ✅ Tek bir overlay yapısı: `overlay: { elements: OverlayElement[] }`
3. ✅ Custom mode mantığını yeni standart yapmak
4. ✅ Editing UI'ı korumak, sadece altındaki veri modelini sadeleştirmek
5. ✅ Drag & drop davranışını custom mode'daki gibi genelleştirmek

### Yapılmayacaklar
- ❌ Multi-scene sistemi
- ❌ Rotate, icon, weather implementasyonu (sadece model future-proof)
- ❌ Büyük UI redesign
- ❌ Storage key'lerini kökten değiştirme

---

## TASK LİSTESİ

### TASK 1: Yeni Overlay Type Definitions Oluştur

**Hedef:**
- Eski `OverlaySettings` yerine yeni `Overlay` ve `OverlayElement` type'larını tanımlamak
- Future-proof bir model tasarlamak (rotate, icon, weather için yer bırakmak)
- TypeScript type safety sağlamak

**Etkilenecek Dosyalar:**
- `src/types/overlay.ts` - **TAMAMEN YENİDEN YAZILACAK**

**Yapılacaklar:**
1. `OverlayElementType` union type tanımla: `"metric" | "text" | "divider" | "icon" | "weather"`
2. `OverlayElement` interface tanımla:
   - `id: string`
   - `type: OverlayElementType`
   - `x: number, y: number` (position)
   - `zIndex?: number` (render order, default: element index)
   - `opacity?: number` (future)
   - `rotation?: number` (future, şimdilik tanımlı ama kullanılmayacak)
   - `data: MetricElementData | TextElementData | DividerElementData | ...` (discriminated union)
3. `MetricElementData` interface:
   - `metric: OverlayMetricKey`
   - `numberColor: string`
   - `numberSize: number`
   - `textColor: string`
   - `textSize: number`
   - `showLabel?: boolean` (default: true)
4. `TextElementData` interface:
   - `text: string`
   - `textColor: string`
   - `textSize: number`
5. `DividerElementData` interface:
   - `width: number` (percentage of height)
   - `thickness: number`
   - `color: string`
   - `orientation: "vertical" | "horizontal"` (şimdilik sadece vertical)
6. `Overlay` interface:
   - `mode: "none" | "custom"` (FAZ2'de "preset" eklenecek)
   - `elements: OverlayElement[]`
7. Eski `OverlaySettings` type'ını deprecated olarak işaretle ama silme (migration için gerekli)
8. `DEFAULT_OVERLAY` constant'ını yeni modele göre güncelle:
   ```typescript
   export const DEFAULT_OVERLAY: Overlay = {
     mode: "none",
     elements: [],
   };
   ```

**Riskler:**
- ⚠️ **Orta:** Type definitions'ın eksik olması durumunda migration zorlaşır
- ⚠️ **Düşük:** TypeScript compile-time hataları yakalanır

**Sıralama:**
- **1. sırada** - Diğer tüm task'ler buna bağımlı

**Doğrulama:**
- TypeScript compile hatası olmamalı
- Eski type'lar hala mevcut olmalı (deprecated)

---

### TASK 2: Migration Utilities Oluştur

**Hedef:**
- Eski `OverlaySettings` modelinden yeni `Overlay` modeline dönüştürme fonksiyonları
- Single/Dual/Triple/Custom mode'ları element array'ine dönüştürme
- Backward compatibility sağlama

**Etkilenecek Dosyalar:**
- `src/utils/overlayMigration.ts` - **YENİ DOSYA**

**Yapılacaklar:**
1. `migrateOverlaySettingsToOverlay(oldSettings: OverlaySettings): Overlay` fonksiyonu:
   - `mode === "none"` → `{ mode: "none", elements: [] }`
   - `mode === "single"` → Tek metric element oluştur
   - `mode === "dual"` → İki metric element + divider element oluştur
   - `mode === "triple"` → Üç metric element + divider element oluştur
   - `mode === "custom"` → Custom readings/texts'i element'lere dönüştür
2. Single mode migration:
   - `primaryMetric` → `MetricElementData`
   - `x, y` → element position
   - `numberColor, numberSize, textColor, textSize` → element data
3. Dual mode migration:
   - Primary metric → element (x, y offset ile)
   - Divider → element (center'da, primary ile ilişkili)
   - Secondary metric → element (secondaryOffsetX/Y ile)
4. Triple mode migration:
   - Primary metric → element (x, y offset ile)
   - Divider → element (center'da)
   - Secondary metric → element (dualReadersOffsetX/Y ile)
   - Tertiary metric → element (dualReadersOffsetX/Y + gapSecondaryTertiary ile)
5. Custom mode migration:
   - `customReadings[]` → `MetricElement` array
   - `customTexts[]` → `TextElement` array
   - `order` → `zIndex`
   - `labelIndex` korunmalı (FAZ2'de preset için gerekebilir, metadata olarak saklanabilir)
6. Helper fonksiyonlar:
   - `isLegacyOverlaySettings(obj: any): boolean` - Eski model mi kontrolü
   - `ensureOverlayFormat(overlay: OverlaySettings | Overlay): Overlay` - Her iki formatta da çalışır

**Riskler:**
- ⚠️ **Yüksek:** Position hesaplamaları yanlış olursa overlay'ler yanlış konumlanır
- ⚠️ **Yüksek:** Custom mode'daki `order` ve `labelIndex` mantığı kaybolmamalı
- ⚠️ **Orta:** Divider positioning logic'i karmaşık

**Sıralama:**
- **2. sırada** - TASK 1'den sonra, TASK 3'ten önce

**Doğrulama:**
- Her mode için migration test edilmeli
- Custom mode'daki tüm readings/texts korunmalı
- Position'lar doğru hesaplanmalı

---

### TASK 3: Unified Overlay Renderer Component Oluştur

**Hedef:**
- Tek bir component ile tüm overlay elementlerini render etmek
- Element type'ına göre doğru renderer'ı çağırmak
- Z-index sıralamasına göre render etmek

**Etkilenecek Dosyalar:**
- `src/ui/components/UnifiedOverlayRenderer.tsx` - **YENİ DOSYA**
- `src/ui/components/OverlayElementRenderer.tsx` - **YENİ DOSYA** (element-specific renderers)
- `src/ui/styles/UnifiedOverlay.module.css` - **YENİ DOSYA**

**Yapılacaklar:**
1. `UnifiedOverlayRenderer.tsx` component:
   - Props: `overlay: Overlay`, `metrics: OverlayMetrics`, `scale?: number`
   - `overlay.mode === "none"` → `null` return
   - `overlay.elements` array'ini `zIndex`'e göre sırala
   - Her element için `OverlayElementRenderer` çağır
   - Element'leri absolute position ile render et
2. `OverlayElementRenderer.tsx` component:
   - Props: `element: OverlayElement`, `metrics: OverlayMetrics`, `scale?: number`
   - `element.type`'a göre switch:
     - `"metric"` → Metric renderer (SingleInfographic mantığı)
     - `"text"` → Text renderer (custom text mantığı)
     - `"divider"` → Divider renderer (dual/triple divider mantığı)
     - `"icon"` → Placeholder (şimdilik null)
     - `"weather"` → Placeholder (şimdilik null)
3. Metric renderer:
   - Mevcut `SingleInfographic.tsx` mantığını kullan
   - `AnimateNumber` component'ini kullan
   - Unit rendering logic'i koru
   - Clock rendering logic'i koru
4. Text renderer:
   - Mevcut custom text rendering mantığını kullan
   - Font family: `nzxt-extrabold`
5. Divider renderer:
   - Mevcut dual/triple divider mantığını kullan
   - Vertical divider (şimdilik)
6. CSS modülü:
   - Mevcut `SingleInfographic.module.css` stillerini birleştir
   - `.numberContainer`, `.unitContainer`, `.label` gibi class'ları koru
   - Element-specific class'lar ekle

**Riskler:**
- ⚠️ **Orta:** Render mantığı değişirse görsel tutarsızlıklar olabilir
- ⚠️ **Düşük:** CSS migration'ı sırasında styling bozulabilir

**Sıralama:**
- **3. sırada** - TASK 2'den sonra, TASK 4'ten önce

**Doğrulama:**
- Her element type'ı doğru render edilmeli
- Position'lar doğru olmalı
- Styling mevcut görünümle uyumlu olmalı

---

### TASK 4: useOverlayConfig Hook'unu Güncelle

**Hedef:**
- Yeni `Overlay` modelini kullanacak şekilde hook'u güncellemek
- Migration logic'ini hook içine entegre etmek
- Backward compatibility sağlamak

**Etkilenecek Dosyalar:**
- `src/hooks/useOverlayConfig.ts` - **GÜNCELLENECEK**

**Yapılacaklar:**
1. Hook'un return type'ını `Overlay` olarak değiştir
2. `settings.overlay` değerini kontrol et:
   - Eğer `Overlay` formatındaysa direkt kullan
   - Eğer `OverlaySettings` formatındaysa migration yap
3. Migration'ı `useMemo` içinde yap (performance)
4. Default overlay'i `DEFAULT_OVERLAY` (yeni model) olarak kullan

**Riskler:**
- ⚠️ **Düşük:** Migration logic'i hook içinde olursa her render'da çalışabilir (useMemo ile çözülür)

**Sıralama:**
- **4. sırada** - TASK 2 ve TASK 3'ten sonra

**Doğrulama:**
- Eski ve yeni format'ta overlay'ler doğru çalışmalı
- Performance sorunu olmamalı

---

### TASK 5: KrakenOverlay Component'ini Güncelle

**Hedef:**
- Yeni `UnifiedOverlayRenderer` component'ini kullanmak
- Eski Single/Dual/Triple component import'larını kaldırmak
- Mode branching logic'ini kaldırmak

**Etkilenecek Dosyalar:**
- `src/ui/components/KrakenOverlay.tsx` - **GÜNCELLENECEK**

**Yapılacaklar:**
1. Eski import'ları kaldır:
   - `SingleInfographic`
   - `DualInfographic`
   - `TripleInfographic`
2. Yeni import ekle:
   - `UnifiedOverlayRenderer`
3. `overlayConfig` değişkenini `useOverlayConfig` hook'undan al (zaten yapılıyor)
4. Mode kontrolü yapma, direkt `UnifiedOverlayRenderer` kullan:
   ```tsx
   {overlayConfig.mode !== 'none' && (
     <UnifiedOverlayRenderer
       overlay={overlayConfig}
       metrics={metrics}
     />
   )}
   ```
5. Eski offset logic'ini kaldır (artık element'ler kendi position'larına sahip)
6. Container div'i sadeleştir

**Riskler:**
- ⚠️ **Orta:** Offset logic'i kaldırılırsa element'ler yanlış konumlanabilir
- ⚠️ **Düşük:** Render pipeline değişirse görsel sorunlar olabilir

**Sıralama:**
- **5. sırada** - TASK 3 ve TASK 4'ten sonra

**Doğrulama:**
- Overlay'ler doğru render edilmeli
- Position'lar doğru olmalı
- LCD render ile preview render tutarlı olmalı

---

### TASK 6: OverlayPreview Component'ini Güncelle

**Hedef:**
- Preview'da da yeni `UnifiedOverlayRenderer` kullanmak
- Drag & drop logic'ini yeni element modeline uyarlamak
- Preview-specific logic'i korumak

**Etkilenecek Dosyalar:**
- `src/ui/components/ConfigPreview/OverlayPreview.tsx` - **GÜNCELLENECEK**

**Yapılacaklar:**
1. Eski import'ları kaldır:
   - `SingleInfographic`
   - `DualInfographic`
   - `TripleInfographic`
2. Yeni import ekle:
   - `UnifiedOverlayRenderer`
3. Mode branching logic'ini kaldır
4. `overlayConfig.elements` array'ini iterate et:
   - Her element için drag handler bağla
   - Element type'ına göre hit area hesapla
   - Selection state'i element ID'ye göre yönet
5. Custom mode'daki drag logic'ini genelleştir:
   - Artık tüm element'ler için aynı drag logic'i kullan
   - `handleElementMouseDown(elementId, elementType)` gibi genel handler
6. Preview scale logic'ini koru
7. Label gösterimi logic'ini koru (drag/select sırasında)

**Riskler:**
- ⚠️ **Yüksek:** Drag & drop logic'i değişirse kullanıcı deneyimi bozulabilir
- ⚠️ **Orta:** Hit area hesaplamaları yanlış olursa drag çalışmayabilir

**Sıralama:**
- **6. sırada** - TASK 5'ten sonra, TASK 7'den önce

**Doğrulama:**
- Tüm element'ler drag edilebilmeli
- Selection state doğru çalışmalı
- Preview görünümü LCD render ile uyumlu olmalı

---

### TASK 7: useDragHandlers Hook'unu Güncelle

**Hedef:**
- Yeni element-based model için drag handlers'ı güncellemek
- Single/Dual/Triple mode-specific drag logic'ini kaldırmak
- Unified element drag logic'i oluşturmak

**Etkilenecek Dosyalar:**
- `src/hooks/useDragHandlers.ts` - **GÜNCELLENECEK**

**Yapılacaklar:**
1. Eski overlay drag handlers'ı kaldır:
   - `handleOverlayMouseDown` (single mode için)
   - `handleSecondaryTertiaryMouseMove` (dual/triple mode için)
   - `isDraggingOverlay`, `isDraggingSecondaryTertiary` state'leri
2. Yeni unified element drag handlers ekle:
   - `handleElementMouseDown(elementId: string, e: React.MouseEvent)`
   - `handleElementMouseMove(e: MouseEvent)` - element ID'ye göre update
   - `handleElementMouseUp()`
   - `draggingElementId: string | null` state
   - `selectedElementId: string | null` state
3. Element position update logic:
   - `overlay.elements` array'inde element'i bul
   - `x, y` değerlerini güncelle
   - `previewToLcd` conversion'ı koru
4. Custom reading/text drag logic'ini genelleştir:
   - Artık tüm element'ler için aynı logic
   - Element type'a göre özel işlem yok (şimdilik)
5. Background drag logic'i aynı kalacak

**Riskler:**
- ⚠️ **Yüksek:** Drag logic'i değişirse kullanıcı deneyimi bozulabilir
- ⚠️ **Orta:** Position update'leri yanlış olursa element'ler kaybolabilir

**Sıralama:**
- **7. sırada** - TASK 6 ile paralel çalışabilir

**Doğrulama:**
- Tüm element'ler drag edilebilmeli
- Position update'leri doğru çalışmalı
- Selection state doğru yönetilmeli

---

### TASK 8: OverlaySettings UI Component'ini Güncelle

**Hedef:**
- Mode-specific UI bloklarını kaldırmak
- Unified element editing UI'ı oluşturmak
- Mevcut custom mode UI'ını genelleştirmek

**Etkilenecek Dosyalar:**
- `src/ui/components/ConfigPreview/OverlaySettings.tsx` - **BÜYÜK GÜNCELLEME**

**Yapılacaklar:**
1. Mode selector'ı güncelle:
   - `"none"` ve `"custom"` seçenekleri kalacak
   - `"single"`, `"dual"`, `"triple"` seçenekleri kaldırılacak
   - FAZ2'de `"preset"` eklenecek (şimdilik yok)
2. Mode-specific UI bloklarını kaldır:
   - Single mode settings (satır 962-1026)
   - Dual mode settings (satır 270-670)
   - Triple mode settings (satır 671-959)
3. Custom mode UI'ını genelleştir:
   - Artık "Custom Mode" değil, sadece "Overlay Elements"
   - `overlay.elements` array'ini iterate et
   - Her element için editing panel göster
4. Element editing panel:
   - Element type'a göre farklı field'lar göster
   - Metric element: metric select, colors, sizes, position
   - Text element: text input, color, size, position
   - Divider element: width, thickness, color, position
5. Add element buttons:
   - "Add Metric" button
   - "Add Text" button
   - "Add Divider" button (şimdilik, FAZ2'de preset'lerden gelecek)
6. Element list management:
   - Move up/down (order/zIndex değiştir)
   - Remove element
   - Element selection (preview'da highlight)
7. Helper fonksiyonları güncelle:
   - `updateOverlayField` → `updateOverlayElement`
   - `updateCustomReading` → `updateOverlayElement` (genel)
   - `updateCustomText` → `updateOverlayElement` (genel)

**Riskler:**
- ⚠️ **Yüksek:** 1726 satırlık component'in refactor edilmesi riskli
- ⚠️ **Orta:** UI değişiklikleri kullanıcı deneyimini etkileyebilir
- ⚠️ **Orta:** Element editing logic'i karmaşık olabilir

**Sıralama:**
- **8. sırada** - TASK 7'den sonra

**Doğrulama:**
- Element'ler eklenebilmeli, düzenlenebilmeli, silinebilmeli
- UI mevcut custom mode UI'ına benzer olmalı
- Tüm field'lar doğru çalışmalı

---

### TASK 9: overlaySettingsHelpers Utilities'ini Güncelle

**Hedef:**
- Yeni element-based model için helper fonksiyonları güncellemek
- Eski mode-specific helpers'ı kaldırmak

**Etkilenecek Dosyalar:**
- `src/utils/overlaySettingsHelpers.ts` - **GÜNCELLENECEK**

**Yapılacaklar:**
1. `updateOverlayField` fonksiyonunu kaldır veya deprecated işaretle
2. Yeni helper fonksiyonları ekle:
   - `updateOverlayElement(settings, overlay, elementId, updates): AppSettings`
   - `addOverlayElement(settings, overlay, element): AppSettings`
   - `removeOverlayElement(settings, overlay, elementId): AppSettings`
   - `reorderOverlayElements(settings, overlay, elementId, newIndex): AppSettings`
3. `updateCustomReading` ve `updateCustomText` fonksiyonlarını:
   - `updateOverlayElement` olarak genelleştir
   - Veya deprecated işaretle ve yeni fonksiyona delegate et
4. Element-specific helpers:
   - `updateMetricElementData(element, data): OverlayElement`
   - `updateTextElementData(element, data): OverlayElement`
   - `updateDividerElementData(element, data): OverlayElement`

**Riskler:**
- ⚠️ **Düşük:** Helper fonksiyonları değişirse UI update'leri bozulabilir

**Sıralama:**
- **9. sırada** - TASK 8 ile paralel çalışabilir

**Doğrulama:**
- Tüm helper fonksiyonları doğru çalışmalı
- Element update'leri doğru yapılmalı

---

### TASK 10: overlayModes Domain Logic'ini Güncelle

**Hedef:**
- Mode transition logic'ini kaldırmak veya sadeleştirmek
- Artık mode switching yok, sadece element manipulation var

**Etkilenecek Dosyalar:**
- `src/domain/overlayModes.ts` - **GÜNCELLENECEK VEYA SİLİNECEK**

**Yapılacaklar:**
1. `getModeTransitionDefaults` fonksiyonunu kaldır (artık gerekli değil)
2. `MODE_TRANSITIONS` constant'ını kaldır
3. `validateModeSettings` fonksiyonunu kaldır veya `validateOverlay` olarak güncelle
4. Dosyayı tamamen kaldırabiliriz veya:
   - Element validation helpers'a dönüştürebiliriz
   - FAZ2'de preset logic'i için kullanabiliriz

**Riskler:**
- ⚠️ **Düşük:** Bu dosya artık kullanılmıyorsa silinmesi sorun yaratmaz

**Sıralama:**
- **10. sırada** - TASK 8'den sonra

**Doğrulama:**
- Import eden yerlerde hata olmamalı
- Eğer kullanılıyorsa deprecated işaretle

---

### TASK 11: Storage Migration Logic'ini Eklemek

**Hedef:**
- localStorage'daki eski overlay data'sını yeni modele migrate etmek
- Backward compatibility sağlamak
- Migration'ı otomatik yapmak

**Etkilenecek Dosyalar:**
- `src/hooks/useConfig.ts` - **GÜNCELLENECEK**
- `src/utils/overlayMigration.ts` - **GÜNCELLENECEK** (TASK 2'de oluşturuldu)

**Yapılacaklar:**
1. `useConfig` hook'unda initial load sırasında:
   - `settings.overlay` değerini kontrol et
   - Eğer eski format (`OverlaySettings`) ise migration yap
   - Yeni format'a dönüştür ve kaydet
2. Migration flag ekle (opsiyonel):
   - `overlay._migrated?: boolean` gibi bir flag
   - İlk migration'dan sonra flag set et
   - Tekrar migration yapma
3. Migration'ı `useConfig` içinde yap veya:
   - `useOverlayConfig` hook'unda yap (zaten yapılıyor TASK 4'te)
4. Storage'a kaydet:
   - Migrated overlay'i localStorage'a kaydet
   - Eski format'ı silme (backward compatibility için)

**Riskler:**
- ⚠️ **Yüksek:** Migration yanlış yapılırsa kullanıcı verileri kaybolabilir
- ⚠️ **Orta:** Her load'da migration yapılırsa performance sorunu olabilir

**Sıralama:**
- **11. sırada** - TASK 2 ve TASK 4'ten sonra

**Doğrulama:**
- Eski overlay data'sı yeni formata dönüştürülmeli
- Veri kaybı olmamalı
- Performance sorunu olmamalı

---

### TASK 12: Eski Dosyaları Temizlemek

**Hedef:**
- Artık kullanılmayan component'leri ve CSS'leri silmek
- Import'ları temizlemek
- Dead code'u kaldırmak

**Silinecek Dosyalar:**
- `src/ui/components/SingleInfographic.tsx` - **SİLİNECEK**
- `src/ui/components/DualInfographic.tsx` - **SİLİNECEK**
- `src/ui/components/TripleInfographic.tsx` - **SİLİNECEK**
- `src/ui/styles/SingleInfographic.module.css` - **SİLİNECEK**
- `src/ui/styles/DualInfographic.module.css` - **SİLİNECEK**
- `src/ui/styles/TripleInfographic.module.css` - **SİLİNECEK**

**Güncellenecek Dosyalar:**
- Tüm import statement'ları kontrol et
- Kullanılmayan import'ları kaldır

**Yapılacaklar:**
1. Dosyaları sil
2. Tüm projede import'ları ara:
   - `grep -r "SingleInfographic" src/`
   - `grep -r "DualInfographic" src/`
   - `grep -r "TripleInfographic" src/`
3. Bulunan import'ları kaldır
4. TypeScript compile hatası olmamalı

**Riskler:**
- ⚠️ **Düşük:** Eğer tüm import'lar temizlendiyse sorun olmaz
- ⚠️ **Düşük:** CSS import'ları unutulursa styling bozulabilir

**Sıralama:**
- **12. sırada** - Tüm diğer task'ler tamamlandıktan sonra

**Doğrulama:**
- TypeScript compile hatası olmamalı
- Tüm import'lar temizlenmeli
- Dead code kalmamalı

---

### TASK 13: Test ve Doğrulama

**Hedef:**
- Tüm overlay modlarının çalıştığını doğrulamak
- Migration'ın doğru çalıştığını test etmek
- UI editing'in çalıştığını test etmek
- Drag & drop'un çalıştığını test etmek

**Test Senaryoları:**
1. **Migration Test:**
   - Eski single mode overlay → yeni element array
   - Eski dual mode overlay → yeni element array
   - Eski triple mode overlay → yeni element array
   - Eski custom mode overlay → yeni element array
   - Position'ların doğru migrate edildiğini kontrol et
2. **Render Test:**
   - Metric element render
   - Text element render
   - Divider element render
   - Multiple elements render
   - Z-index sıralaması
3. **UI Editing Test:**
   - Element ekleme
   - Element düzenleme
   - Element silme
   - Element reordering
   - Field update'leri
4. **Drag & Drop Test:**
   - Element drag
   - Element selection
   - Position update'leri
   - Preview vs LCD tutarlılığı
5. **Storage Test:**
   - Overlay'in localStorage'a kaydedilmesi
   - Overlay'in localStorage'dan yüklenmesi
   - Migration'ın otomatik yapılması

**Riskler:**
- ⚠️ **Yüksek:** Test edilmeyen edge case'ler production'da sorun yaratabilir

**Sıralama:**
- **13. sırada** - Tüm task'ler tamamlandıktan sonra

**Doğrulama:**
- Tüm test senaryoları geçmeli
- Kullanıcı deneyimi bozulmamalı
- Veri kaybı olmamalı

---

## FAZ1 SONUNDA ORTAYA ÇIKACAK MİMARİ

### 1. Veri Modeli
- **Tek Overlay Yapısı:** `overlay: { mode: "none" | "custom", elements: OverlayElement[] }`
- **Element-Based:** Her overlay bir element array'i
- **Future-Proof:** Icon, weather, rotate için type tanımları mevcut ama implementasyon yok
- **Backward Compatible:** Eski overlay data'sı otomatik migrate ediliyor

### 2. Render Pipeline
- **Unified Renderer:** Tek bir `UnifiedOverlayRenderer` component'i
- **Element Renderers:** Her element type için ayrı renderer
- **Z-Index Sorting:** Element'ler z-index'e göre sıralanıyor
- **Position-Based:** Her element kendi x, y position'ına sahip

### 3. Editing UI
- **Unified Interface:** Tüm element'ler için aynı editing UI
- **Element Management:** Add, edit, remove, reorder
- **Type-Specific Fields:** Element type'ına göre farklı field'lar
- **Drag & Drop:** Tüm element'ler drag edilebilir

### 4. Kod Yapısı
- **Sadeleştirme:** 633 satırlık component'ler → tek unified renderer
- **Tekrar Azaltma:** `renderMetric` fonksiyonu tek yerde
- **Bakım Kolaylığı:** Yeni element type eklemek kolay
- **Temizlik:** Eski mode-specific kod kaldırıldı

---

## KRİTİK BAŞARI FAKTÖRLERİ

1. ✅ **Custom Mode Migration:** Custom readings/texts'in element'lere dönüştürülmesi
2. ✅ **Position Accuracy:** Element position'larının doğru hesaplanması
3. ✅ **Storage Compatibility:** Eski data'nın kaybolmaması
4. ✅ **UI Consistency:** Editing UI'ın mevcut deneyime benzer olması
5. ✅ **Drag & Drop:** Tüm element'lerin drag edilebilmesi

---

## RİSK YÖNETİMİ

### Yüksek Riskli Task'ler
- **TASK 2:** Migration logic'i yanlış olursa veri kaybı
- **TASK 6:** Drag & drop logic'i değişirse UX bozulur
- **TASK 8:** UI refactor büyük, hata riski yüksek
- **TASK 11:** Storage migration yanlış olursa veri kaybı

### Orta Riskli Task'ler
- **TASK 3:** Render logic değişirse görsel sorunlar
- **TASK 5:** LCD render pipeline değişirse tutarsızlık

### Düşük Riskli Task'ler
- **TASK 1:** Type definitions, compile-time hatalar yakalanır
- **TASK 4:** Hook update, migration logic zaten var
- **TASK 9:** Helper functions, test edilebilir
- **TASK 12:** Dosya silme, import temizleme

---

## UYGULAMA SIRASI ÖZET

1. **TASK 1** - Type definitions (temel)
2. **TASK 2** - Migration utilities (temel)
3. **TASK 3** - Unified renderer (temel)
4. **TASK 4** - Hook update (temel)
5. **TASK 5** - KrakenOverlay update (render)
6. **TASK 6** - OverlayPreview update (render + drag)
7. **TASK 7** - Drag handlers update (drag)
8. **TASK 8** - UI settings update (UI)
9. **TASK 9** - Helpers update (UI support)
10. **TASK 10** - Domain logic cleanup (cleanup)
11. **TASK 11** - Storage migration (compatibility)
12. **TASK 12** - File cleanup (final)
13. **TASK 13** - Testing (validation)

---

## SONUÇ

Bu plan, mode-based overlay mimarisini element-based mimariye dönüştürmek için adım adım bir yol haritası sunuyor. Her task bağımsız test edilebilir ve küçük adımlarla ilerlenebilir. Kritik noktalar migration logic'i, drag & drop functionality ve UI refactoring'dir.

**Önemli Notlar:**
- Custom mode mantığı yeni standart olacak
- Editing UI genel olarak aynı kalacak
- Storage backward compatibility korunacak
- FAZ2'de preset sistemi eklenecek

