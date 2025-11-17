# FAZ1 UYGULAMA PLANI (REVİZE) - Overlay Mimarisini Sadeleştirme

**Tarih:** Planlama Aşaması (Revize)  
**Amaç:** Mode-based overlay mimarisini element-based mimariye dönüştürmek (MINIMAL DEĞİŞİKLİK)

---

## GENEL STRATEJİ (REVİZE)

### Hedefler
1. ✅ Overlay Options mimarisini (single/dual/triple) tamamen kaldırmak
2. ✅ Tek bir overlay yapısı: `overlay: { elements: OverlayElement[] }`
3. ✅ Custom mode mantığını yeni standart yapmak
4. ✅ **UI'da MINIMUM değişiklik** - Mevcut Custom Editing UI sadece element-array kullanacak kadar güncellenecek
5. ✅ Drag & drop davranışını korumak (custom drag bozulmayacak)

### Yapılmayacaklar (FAZ1)
- ❌ Multi-scene sistemi
- ❌ Rotation, opacity gibi future-proof field'lar (model sade kalacak)
- ❌ UI redesign
- ❌ Preset UI (FAZ2'de gelecek)
- ❌ "Add Divider" butonu (divider sadece migration'dan gelecek)
- ❌ Yeni element türleri ekleme
- ❌ Storage key'lerini kökten değiştirme

### FAZ1'in Tek Hedefi
**Mode-based overlay yapısını element-based yapıya dönüştürmek.**  
UI redesign, preset UI, multi-scene veya yeni element türleri FAZ1'e dahil değil.

---

## TASK LİSTESİ (REVİZE)

### TASK 1: Yeni Overlay Type Definitions Oluştur (SADE MODEL)

**Hedef:**
- Eski `OverlaySettings` yerine yeni `Overlay` ve `OverlayElement` type'larını tanımlamak
- **SADE MODEL:** Sadece gerekli field'lar (rotation, opacity YOK)
- TypeScript type safety sağlamak

**Etkilenecek Dosyalar:**
- `src/types/overlay.ts` - **TAMAMEN YENİDEN YAZILACAK**

**Yapılacaklar:**
1. `OverlayElementType` union type tanımla: `"metric" | "text" | "divider"` (icon, weather YOK - FAZ2'de)
2. `OverlayElement` interface tanımla (**SADE MODEL**):
   - `id: string`
   - `type: OverlayElementType`
   - `x: number, y: number` (position - zorunlu)
   - `zIndex?: number` (render order, default: element index)
   - **rotation YOK**
   - **opacity YOK**
   - `data: MetricElementData | TextElementData | DividerElementData` (discriminated union)
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
   - `orientation: "vertical"` (şimdilik sadece vertical, horizontal YOK)
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
- ⚠️ **Düşük:** Type definitions basit, TypeScript compile-time hataları yakalanır

**Sıralama:**
- **1. sırada** - Diğer tüm task'ler buna bağımlı

**Doğrulama:**
- TypeScript compile hatası olmamalı
- Eski type'lar hala mevcut olmalı (deprecated)
- Model sade olmalı (rotation, opacity YOK)

---

### TASK 2: Migration Utilities Oluştur (BASİT VE MİNİMAL)

**Hedef:**
- Eski `OverlaySettings` modelinden yeni `Overlay` modeline dönüştürme fonksiyonları
- **BASİT VE MİNİMAL migration** - Single/Dual/Triple için detaylı migration YOK
- Custom mode migration'ı doğru yapılacak (kritik)

**Etkilenecek Dosyalar:**
- `src/utils/overlayMigration.ts` - **YENİ DOSYA**

**Yapılacaklar:**
1. `migrateOverlaySettingsToOverlay(oldSettings: OverlaySettings): Overlay` fonksiyonu:
   - `mode === "none"` → `{ mode: "none", elements: [] }`
   - `mode === "single"` → **BASİT:** Tek metric element oluştur (default değerlerle)
   - `mode === "dual"` → **BASİT:** İki metric element oluştur (default değerlerle)
   - `mode === "triple"` → **BASİT:** Üç metric element oluştur (default değerlerle)
   - `mode === "custom"` → **DOĞRU:** Custom readings/texts'i element'lere dönüştür (tüm detaylar korunacak)
2. Single mode migration (BASİT):
   - `primaryMetric` → `MetricElementData` (metric korunacak)
   - `x: 0, y: 0` → basit position (detaylı offset hesaplama YOK)
   - Default colors ve sizes kullan (mevcut değerler korunmaya çalışılabilir ama kritik değil)
3. Dual mode migration (BASİT):
   - Primary metric → element (basit position)
   - Secondary metric → element (basit position, yan yana)
   - **Divider element EKLENMEYECEK** (FAZ2'de preset'lerde olacak)
4. Triple mode migration (BASİT):
   - Primary metric → element (basit position)
   - Secondary metric → element (basit position)
   - Tertiary metric → element (basit position)
   - **Divider element EKLENMEYECEK** (FAZ2'de preset'lerde olacak)
5. Custom mode migration (DOĞRU - KRİTİK):
   - `customReadings[]` → `MetricElement` array (TÜM DETAYLAR korunacak)
   - `customTexts[]` → `TextElement` array (TÜM DETAYLAR korunacak)
   - `order` → `zIndex` (korunacak)
   - `labelIndex` korunmalı (metadata olarak saklanabilir, FAZ2 için)
   - `x, y` position'lar korunacak
   - Tüm renk, boyut, metrik değerleri korunacak
6. Helper fonksiyonlar:
   - `isLegacyOverlaySettings(obj: any): boolean` - Eski model mi kontrolü
   - `ensureOverlayFormat(overlay: OverlaySettings | Overlay): Overlay` - Her iki formatta da çalışır
   - `resetToDefaultOverlay(): Overlay` - Tutarsız data için sıfırlama

**Kritik Kurallar:**
- **Single/Dual/Triple migration BASİT olacak** - Detaylı position/renk/offset hesaplama YOK
- **Custom mode migration DOĞRU olacak** - Tüm detaylar korunacak (KRİTİK)
- **Eğer eski overlay datası tutarsız görünüyorsa DEFAULT_OVERLAY ile sıfırlanabilir**
- **FAZ2'de Single/Dual/Triple preset tasarımlarının gerçek değerlerini kullanıcı verecek**

**Riskler:**
- ⚠️ **Düşük:** Single/Dual/Triple migration basit olduğu için risk düşük
- ⚠️ **Yüksek:** Custom mode migration yanlış olursa kullanıcı verisi kaybolur (KRİTİK)

**Sıralama:**
- **2. sırada** - TASK 1'den sonra, TASK 3'ten önce

**Doğrulama:**
- Single/Dual/Triple migration basit element listesi oluşturmalı (detay doğruluğu kritik değil)
- **Custom mode'daki tüm readings/texts korunmalı (KRİTİK)**
- Custom mode position'ları doğru korunmalı (KRİTİK)
- Tutarsız data durumunda DEFAULT_OVERLAY ile sıfırlanabilmeli

---

### TASK 3: Unified Overlay Renderer Component Oluştur (GÖRSEL TUTARLILIK)

**Hedef:**
- Tek bir component ile tüm overlay elementlerini render etmek
- **GÖRSEL SONUÇLAR MEVCUT GÖRÜNÜMDEN SAPMAMALI**
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
   - **Görsel tutarlılık:** Mevcut Single/Dual/Triple render mantığını koru
2. `OverlayElementRenderer.tsx` component:
   - Props: `element: OverlayElement`, `metrics: OverlayMetrics`, `scale?: number`
   - `element.type`'a göre switch:
     - `"metric"` → Metric renderer (SingleInfographic mantığını KORU)
     - `"text"` → Text renderer (custom text mantığını KORU)
     - `"divider"` → Divider renderer (dual/triple divider mantığını KORU)
3. Metric renderer:
   - **Mevcut `SingleInfographic.tsx` mantığını BİREBİR kullan**
   - `AnimateNumber` component'ini kullan
   - Unit rendering logic'i KORU
   - Clock rendering logic'i KORU
   - **Görsel sonuç aynı olmalı**
4. Text renderer:
   - **Mevcut custom text rendering mantığını BİREBİR kullan**
   - Font family: `nzxt-extrabold`
   - **Görsel sonuç aynı olmalı**
5. Divider renderer:
   - **Mevcut dual/triple divider mantığını BİREBİR kullan**
   - Vertical divider (şimdilik)
   - **Görsel sonuç aynı olmalı**
6. CSS modülü:
   - **Mevcut `SingleInfographic.module.css` stillerini BİREBİR kopyala**
   - `.numberContainer`, `.unitContainer`, `.label` gibi class'ları koru
   - **Stil değişikliği YOK**

**Kritik Kural:**
- **Renderer sadece tek pipeline sağlamak için yazılacak**
- **Görsel sonuçlar mevcut görünümden SAPMAMALI**
- Mevcut render mantığını birebir koru

**Riskler:**
- ⚠️ **Orta:** Render mantığı değişirse görsel tutarsızlıklar olabilir (KORUNMALI)
- ⚠️ **Düşük:** CSS migration'ı sırasında styling bozulabilir (BİREBİR KOPYALANMALI)

**Sıralama:**
- **3. sırada** - TASK 2'den sonra, TASK 4'ten önce

**Doğrulama:**
- Her element type'ı doğru render edilmeli
- Position'lar doğru olmalı
- **Görsel sonuç mevcut görünümle BİREBİR aynı olmalı**
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
- ⚠️ **Orta:** Offset logic'i kaldırılırsa element'ler yanlış konumlanabilir (migration'da düzeltilmeli)
- ⚠️ **Düşük:** Render pipeline değişirse görsel sorunlar olabilir (renderer mevcut mantığı koruyor)

**Sıralama:**
- **5. sırada** - TASK 3 ve TASK 4'ten sonra

**Doğrulama:**
- Overlay'ler doğru render edilmeli
- Position'lar doğru olmalı
- LCD render ile preview render tutarlı olmalı

---

### TASK 6: OverlayPreview Component'ini Güncelle (DRAG LOGIC KORUNACAK)

**Hedef:**
- Preview'da da yeni `UnifiedOverlayRenderer` kullanmak
- **Mevcut custom drag logic'ini KORUMAK** (agresif optimizasyon YOK)
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
   - **Mevcut custom drag logic'ini KORU** (agresif değişiklik YOK)
   - Element type'ına göre hit area hesapla (mevcut mantığı koru)
   - Selection state'i element ID'ye göre yönet
5. **Custom mode'daki drag logic'ini genelleştir ama KORU:**
   - Artık tüm element'ler için aynı drag logic'i kullan
   - **Mevcut davranışı bozma**
   - `handleElementMouseDown(elementId, elementType)` gibi genel handler
6. Preview scale logic'ini koru
7. Label gösterimi logic'ini koru (drag/select sırasında)

**Kritik Kural:**
- **Drag & drop logic genelleştirilecek ama mevcut custom drag davranışını BOZMAMALI**
- **Agresif optimizasyon YAPILMAYACAK**
- Mevcut drag logic'i birebir koru

**Riskler:**
- ⚠️ **Yüksek:** Drag & drop logic'i değişirse kullanıcı deneyimi bozulabilir (KORUNMALI)
- ⚠️ **Orta:** Hit area hesaplamaları yanlış olursa drag çalışmayabilir (MEVCUT MANTIK KORUNMALI)

**Sıralama:**
- **6. sırada** - TASK 5'ten sonra, TASK 7'den önce

**Doğrulama:**
- Tüm element'ler drag edilebilmeli
- **Mevcut custom drag davranışı korunmalı**
- Selection state doğru çalışmalı
- Preview görünümü LCD render ile uyumlu olmalı

---

### TASK 7: useDragHandlers Hook'unu Güncelle (MEVCUT DAVRANIŞ KORUNACAK)

**Hedef:**
- Yeni element-based model için drag handlers'ı güncellemek
- **Mevcut custom drag davranışını KORUMAK** (agresif optimizasyon YOK)
- Single/Dual/Triple mode-specific drag logic'ini kaldırmak

**Etkilenecek Dosyalar:**
- `src/hooks/useDragHandlers.ts` - **GÜNCELLENECEK**

**Yapılacaklar:**
1. Eski overlay drag handlers'ı kaldır:
   - `handleOverlayMouseDown` (single mode için)
   - `handleSecondaryTertiaryMouseMove` (dual/triple mode için)
   - `isDraggingOverlay`, `isDraggingSecondaryTertiary` state'leri
2. **Mevcut custom drag handlers'ı KORU ve genelleştir:**
   - `handleCustomReadingMouseDown` → `handleElementMouseDown(elementId: string, e: React.MouseEvent)`
   - `handleCustomTextMouseDown` → aynı `handleElementMouseDown` kullan
   - **Mevcut davranışı koru:** Selection logic, drag start logic aynı kalmalı
3. Yeni unified element drag handlers:
   - `handleElementMouseMove(e: MouseEvent)` - element ID'ye göre update
   - `handleElementMouseUp()`
   - `draggingElementId: string | null` state (mevcut `draggingReadingId`, `draggingTextId` yerine)
   - `selectedElementId: string | null` state (mevcut `selectedReadingId`, `selectedTextId` yerine)
4. Element position update logic:
   - `overlay.elements` array'inde element'i bul
   - `x, y` değerlerini güncelle
   - **Mevcut `previewToLcd` conversion'ı KORU**
5. **Agresif optimizasyon YAPILMAYACAK:**
   - Mevcut custom reading/text drag logic'ini birebir koru
   - Sadece genelleştir (element type'a göre ayrım yok)
6. Background drag logic'i aynı kalacak

**Kritik Kural:**
- **Mevcut custom drag davranışını BOZMAMALI**
- **Agresif optimizasyon YAPILMAYACAK**
- Mevcut drag logic'i birebir koru, sadece genelleştir

**Riskler:**
- ⚠️ **Yüksek:** Drag logic'i değişirse kullanıcı deneyimi bozulabilir (KORUNMALI)
- ⚠️ **Orta:** Position update'leri yanlış olursa element'ler kaybolabilir (MEVCUT MANTIK KORUNMALI)

**Sıralama:**
- **7. sırada** - TASK 6 ile paralel çalışabilir

**Doğrulama:**
- Tüm element'ler drag edilebilmeli
- **Mevcut custom drag davranışı korunmalı**
- Position update'leri doğru çalışmalı
- Selection state doğru yönetilmeli

---

### TASK 8: OverlaySettings UI Component'ini Güncelle (MINIMUM DEĞİŞİKLİK)

**Hedef:**
- **UI'da MINIMUM değişiklik** - Mevcut Custom Editing UI sadece element-array kullanacak kadar güncellenecek
- Mode-specific UI bloklarını kaldırmak
- **"Add Divider" butonu EKLENMEYECEK** (divider sadece migration'dan gelecek)

**Etkilenecek Dosyalar:**
- `src/ui/components/ConfigPreview/OverlaySettings.tsx` - **MINIMUM GÜNCELLEME**

**Yapılacaklar:**
1. Mode selector'ı güncelle:
   - `"none"` ve `"custom"` seçenekleri kalacak
   - `"single"`, `"dual"`, `"triple"` seçenekleri kaldırılacak
   - FAZ2'de `"preset"` eklenecek (şimdilik yok)
2. Mode-specific UI bloklarını kaldır:
   - Single mode settings (satır 962-1026) - **KALDIR**
   - Dual mode settings (satır 270-670) - **KALDIR**
   - Triple mode settings (satır 671-959) - **KALDIR**
3. **Custom mode UI'ını KORU ve sadece element-array kullanacak kadar güncelle:**
   - Mevcut Custom Mode UI'ı aynı kalacak
   - `overlay.customReadings` → `overlay.elements.filter(e => e.type === 'metric')`
   - `overlay.customTexts` → `overlay.elements.filter(e => e.type === 'text')`
   - **UI görünümü aynı kalacak**
4. Element editing panel (mevcut custom reading/text editing mantığını koru):
   - Metric element: metric select, colors, sizes, position (mevcut custom reading UI'ı)
   - Text element: text input, color, size, position (mevcut custom text UI'ı)
   - **Divider element: editing YOK** (sadece migration'dan gelecek, kullanıcı oluşturamaz)
5. Add element buttons (mevcut custom mode buttons'ı koru):
   - "Add Reading" button (mevcut) → "Add Metric" olarak rename (opsiyonel)
   - "Add Text" button (mevcut) → aynı kalacak
   - **"Add Divider" button EKLENMEYECEK** (FAZ1'de)
6. Element list management (mevcut custom mode mantığını koru):
   - Move up/down (order/zIndex değiştir) - mevcut mantık
   - Remove element - mevcut mantık
   - Element selection (preview'da highlight) - mevcut mantık
7. Helper fonksiyonları güncelle (minimum):
   - `updateCustomReading` → `updateOverlayElement` (genel, ama mevcut mantık korunacak)
   - `updateCustomText` → `updateOverlayElement` (genel, ama mevcut mantık korunacak)

**Kritik Kurallar:**
- **UI'da MINIMUM değişiklik**
- **Mevcut Custom Editing UI görünümü aynı kalacak**
- **"Add Divider" butonu EKLENMEYECEK**
- **Preset UI ve tam liste düzenleme FAZ2'de gelecek**

**Riskler:**
- ⚠️ **Orta:** UI değişiklikleri kullanıcı deneyimini etkileyebilir (MINIMUM değişiklik yapılmalı)
- ⚠️ **Düşük:** Element editing logic'i karmaşık olabilir (mevcut mantık korunacak)

**Sıralama:**
- **8. sırada** - TASK 7'den sonra

**Doğrulama:**
- Element'ler eklenebilmeli, düzenlenebilmeli, silinebilmeli
- **UI mevcut custom mode UI'ına BİREBİR benzer olmalı**
- Tüm field'lar doğru çalışmalı
- **"Add Divider" butonu olmamalı**

---

### TASK 9: overlaySettingsHelpers Utilities'ini Güncelle (MINIMUM)

**Hedef:**
- Yeni element-based model için helper fonksiyonları güncellemek (minimum)
- Mevcut helper mantığını korumak

**Etkilenecek Dosyalar:**
- `src/utils/overlaySettingsHelpers.ts` - **MINIMUM GÜNCELLEME**

**Yapılacaklar:**
1. `updateOverlayField` fonksiyonunu deprecated işaretle (hala kullanılabilir)
2. Yeni helper fonksiyonları ekle (mevcut mantığı koru):
   - `updateOverlayElement(settings, overlay, elementId, updates): AppSettings`
   - `addOverlayElement(settings, overlay, element): AppSettings`
   - `removeOverlayElement(settings, overlay, elementId): AppSettings`
   - `reorderOverlayElements(settings, overlay, elementId, newIndex): AppSettings`
3. `updateCustomReading` ve `updateCustomText` fonksiyonlarını:
   - **Mevcut mantığı koru**
   - `updateOverlayElement`'e delegate et (internal olarak)
   - Veya deprecated işaretle ve yeni fonksiyona delegate et
4. Element-specific helpers (minimum):
   - `updateMetricElementData(element, data): OverlayElement`
   - `updateTextElementData(element, data): OverlayElement`
   - Divider helpers YOK (kullanıcı divider oluşturamaz)

**Riskler:**
- ⚠️ **Düşük:** Helper fonksiyonları değişirse UI update'leri bozulabilir (mevcut mantık korunacak)

**Sıralama:**
- **9. sırada** - TASK 8 ile paralel çalışabilir

**Doğrulama:**
- Tüm helper fonksiyonları doğru çalışmalı
- Element update'leri doğru yapılmalı
- Mevcut helper mantığı korunmalı

---

### TASK 10: overlayModes Domain Logic'ini Temizle

**Hedef:**
- Mode transition logic'ini kaldırmak (artık mode switching yok)
- Dosyayı temizlemek veya kaldırmak

**Etkilenecek Dosyalar:**
- `src/domain/overlayModes.ts` - **GÜNCELLENECEK VEYA SİLİNECEK**

**Yapılacaklar:**
1. `getModeTransitionDefaults` fonksiyonunu kaldır (artık gerekli değil)
2. `MODE_TRANSITIONS` constant'ını kaldır
3. `validateModeSettings` fonksiyonunu kaldır
4. Dosyayı tamamen kaldırabiliriz veya:
   - FAZ2'de preset logic'i için kullanabiliriz (şimdilik boş bırak)
5. Import eden yerleri kontrol et ve temizle

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
3. Migration'ı `useOverlayConfig` hook'unda yap (TASK 4'te zaten yapılıyor)
4. Storage'a kaydet:
   - Migrated overlay'i localStorage'a kaydet
   - Eski format'ı silme (backward compatibility için)

**Riskler:**
- ⚠️ **Yüksek:** Migration yanlış yapılırsa kullanıcı verileri kaybolabilir
- ⚠️ **Orta:** Her load'da migration yapılırsa performance sorunu olabilir (useMemo ile çözülür)

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
- **Görsel tutarlılığı doğrulamak**

**Test Senaryoları:**
1. **Migration Test:**
   - Eski single mode overlay → yeni element array
   - Eski dual mode overlay → yeni element array (divider dahil)
   - Eski triple mode overlay → yeni element array (divider dahil)
   - Eski custom mode overlay → yeni element array
   - Position'ların doğru migrate edildiğini kontrol et
2. **Render Test:**
   - Metric element render (görsel mevcut ile aynı olmalı)
   - Text element render (görsel mevcut ile aynı olmalı)
   - Divider element render (görsel mevcut ile aynı olmalı)
   - Multiple elements render
   - Z-index sıralaması
3. **UI Editing Test:**
   - Element ekleme (mevcut custom mode gibi)
   - Element düzenleme (mevcut custom mode gibi)
   - Element silme (mevcut custom mode gibi)
   - Element reordering (mevcut custom mode gibi)
   - Field update'leri
   - **"Add Divider" butonu olmamalı**
4. **Drag & Drop Test:**
   - Element drag (mevcut custom drag davranışı korunmalı)
   - Element selection (mevcut davranış korunmalı)
   - Position update'leri (mevcut mantık korunmalı)
   - Preview vs LCD tutarlılığı
5. **Storage Test:**
   - Overlay'in localStorage'a kaydedilmesi
   - Overlay'in localStorage'dan yüklenmesi
   - Migration'ın otomatik yapılması
6. **Görsel Tutarlılık Test:**
   - Mevcut single mode görünümü vs yeni element-based görünümü
   - Mevcut dual mode görünümü vs yeni element-based görünümü
   - Mevcut triple mode görünümü vs yeni element-based görünümü
   - Mevcut custom mode görünümü vs yeni element-based görünümü
   - **Görsel fark olmamalı**

**Riskler:**
- ⚠️ **Yüksek:** Test edilmeyen edge case'ler production'da sorun yaratabilir

**Sıralama:**
- **13. sırada** - Tüm task'ler tamamlandıktan sonra

**Doğrulama:**
- Tüm test senaryoları geçmeli
- Kullanıcı deneyimi bozulmamalı
- Veri kaybı olmamalı
- **Görsel tutarlılık sağlanmalı**

---

## FAZ1 SONUNDA ORTAYA ÇIKACAK MİMARİ (REVİZE)

### 1. Veri Modeli
- **Tek Overlay Yapısı:** `overlay: { mode: "none" | "custom", elements: OverlayElement[] }`
- **Sade Model:** `OverlayElement` sadece `id, type, x, y, zIndex?, data` (rotation, opacity YOK)
- **Element-Based:** Her overlay bir element array'i
- **Backward Compatible:** Eski overlay data'sı otomatik migrate ediliyor
- **Divider:** Sadece migration'dan gelecek, kullanıcı oluşturamaz

### 2. Render Pipeline
- **Unified Renderer:** Tek bir `UnifiedOverlayRenderer` component'i
- **Element Renderers:** Her element type için ayrı renderer
- **Z-Index Sorting:** Element'ler z-index'e göre sıralanıyor
- **Position-Based:** Her element kendi x, y position'ına sahip
- **Görsel Tutarlılık:** Mevcut görünümle birebir aynı

### 3. Editing UI
- **Mevcut Custom UI Korundu:** UI görünümü aynı kalacak
- **Element Management:** Add, edit, remove, reorder (mevcut custom mode gibi)
- **Type-Specific Fields:** Element type'ına göre farklı field'lar (mevcut mantık)
- **Drag & Drop:** Tüm element'ler drag edilebilir (mevcut custom drag davranışı korunacak)
- **"Add Divider" YOK:** Divider sadece migration'dan gelecek

### 4. Kod Yapısı
- **Sadeleştirme:** 633 satırlık component'ler → tek unified renderer
- **Tekrar Azaltma:** `renderMetric` fonksiyonu tek yerde
- **Bakım Kolaylığı:** Yeni element type eklemek kolay (FAZ2'de)
- **Temizlik:** Eski mode-specific kod kaldırıldı

---

## KRİTİK BAŞARI FAKTÖRLERİ (REVİZE)

1. ✅ **Custom Mode Migration:** Custom readings/texts'in element'lere dönüştürülmesi
2. ✅ **Position Accuracy:** Element position'larının doğru hesaplanması
3. ✅ **Storage Compatibility:** Eski data'nın kaybolmaması
4. ✅ **UI Consistency:** Editing UI'ın mevcut custom mode deneyimine birebir benzer olması
5. ✅ **Drag & Drop:** Mevcut custom drag davranışının korunması
6. ✅ **Görsel Tutarlılık:** Render sonuçlarının mevcut görünümle birebir aynı olması

---

## RİSK YÖNETİMİ (REVİZE)

### Yüksek Riskli Task'ler
- **TASK 2:** Migration logic'i yanlış olursa veri kaybı
- **TASK 6:** Drag & drop logic'i değişirse UX bozulur (MEVCUT DAVRANIŞ KORUNMALI)
- **TASK 7:** Drag handlers değişirse UX bozulur (MEVCUT DAVRANIŞ KORUNMALI)
- **TASK 8:** UI refactor büyük, hata riski yüksek (MINIMUM DEĞİŞİKLİK YAPILMALI)
- **TASK 11:** Storage migration yanlış olursa veri kaybı

### Orta Riskli Task'ler
- **TASK 3:** Render logic değişirse görsel sorunlar (MEVCUT MANTIK KORUNMALI)
- **TASK 5:** LCD render pipeline değişirse tutarsızlık (RENDERER MEVCUT MANTIĞI KORUYOR)

### Düşük Riskli Task'ler
- **TASK 1:** Type definitions, compile-time hatalar yakalanır
- **TASK 4:** Hook update, migration logic zaten var
- **TASK 9:** Helper functions, test edilebilir
- **TASK 10:** Domain logic cleanup, düşük risk
- **TASK 12:** Dosya silme, import temizleme

---

## UYGULAMA SIRASI ÖZET (REVİZE)

1. **TASK 1** - Type definitions (sade model, rotation/opacity YOK)
2. **TASK 2** - Migration utilities (divider migration'da kullanılacak)
3. **TASK 3** - Unified renderer (görsel tutarlılık kritik)
4. **TASK 4** - Hook update
5. **TASK 5** - KrakenOverlay update
6. **TASK 6** - OverlayPreview update (drag logic korunacak)
7. **TASK 7** - Drag handlers update (mevcut davranış korunacak)
8. **TASK 8** - UI settings update (minimum değişiklik, "Add Divider" YOK)
9. **TASK 9** - Helpers update (minimum)
10. **TASK 10** - Domain logic cleanup
11. **TASK 11** - Storage migration
12. **TASK 12** - File cleanup
13. **TASK 13** - Testing (görsel tutarlılık dahil)

---

## SONUÇ (REVİZE)

Bu revize plan, mode-based overlay mimarisini element-based mimariye dönüştürmek için **minimal değişiklik** yaklaşımıyla hazırlanmıştır. Her task bağımsız test edilebilir ve küçük adımlarla ilerlenebilir.

**Kritik Noktalar:**
- ✅ Model sade (rotation, opacity YOK)
- ✅ Divider sadece migration'da (UI'da "Add Divider" YOK)
- ✅ UI minimum değişiklik (mevcut custom UI korunacak)
- ✅ Drag & drop mevcut davranış korunacak (agresif optimizasyon YOK)
- ✅ Görsel tutarlılık kritik (mevcut görünümle birebir aynı)
- ✅ FAZ1'in tek hedefi: mode-based → element-based dönüşüm

**FAZ1'de Yapılmayacaklar:**
- ❌ UI redesign
- ❌ Preset UI
- ❌ Yeni element türleri
- ❌ Multi-scene
- ❌ Future-proof field'lar (rotation, opacity)

