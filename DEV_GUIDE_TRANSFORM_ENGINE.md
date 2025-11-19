# TransformEngine v1 - Developer Guide

**Versiyon:** 1.0.0  
**Son Güncelleme:** 2025.01.19  
**Amaç:** TransformEngine mimarisi, frozen zone'lar, matematik formülleri için tek referans dokümanı

---

## 🔴 KRİTİK UYARI

**TransformEngine matematiğine KESİNLİKLE dokunulamaz.**  
Bu doküman, TransformEngine'in nasıl çalıştığını ve neden değiştirilmemesi gerektiğini açıklar.

---

## 1. TRANSFORMENGINE v1 MİMARİSİ

### 1.1 Genel Bakış

TransformEngine v1, tüm transform işlemlerini (move, resize, rotate) rotasyonlu elementler için doğru şekilde yöneten katmanlı bir mimaridir.

**Layer Structure:**

1. **Core & Utility Layer** (`src/transform/engine/`)
   - `TransformMatrix.ts` - 2D transform matrix utilities
   - `CoordinateSystem.ts` - Coordinate space conversions (LCD ↔ Preview ↔ Screen ↔ Local)
   - `BoundingBox.ts` - AABB and RBox calculations
   - `HandlePositioning.ts` - Handle position calculations (8 resize + 1 rotation)

2. **Operations Layer** (`src/transform/operations/`)
   - `MoveOperation.ts` - Element movement
   - `ResizeOperation.ts` - Element resizing
   - `RotateOperation.ts` - Element rotation

3. **History Layer** (`src/transform/history/`)
   - `ActionHistory.ts` - Command pattern-based undo/redo system
   - `commands/` - Command implementations (MoveCommand, ResizeCommand, RotateCommand)

4. **Hook Layer** (`src/transform/hooks/`)
   - `useTransformEngine.ts` - React hook wrapper (optional, for future use)
   - `useUndoRedo.ts` - Undo/redo hook with keyboard shortcuts

5. **UI Integration** (`src/hooks/`, `src/ui/components/`)
   - `useDragHandlers.ts` - Drag handlers with MoveOperation integration
   - `useResizeHandlers.ts` - Resize handlers with ResizeOperation integration
   - `useRotationHandlers.ts` - Rotation handlers with RotateOperation integration
   - `OverlayPreview.tsx` - UI component with HandlePositioning integration
   - `UnifiedOverlayRenderer.tsx` - Renderer with correct transform order

### 1.2 Coordinate System Flow

**Coordinate System Flow:**

1. **User Interaction (Screen Coordinates)**
   - Mouse events occur in screen coordinates (browser viewport)
   - Events are captured by React event handlers

2. **Coordinate Conversion (Screen → Preview → LCD)**
   - `CoordinateSystem.screenToLcd()` converts mouse position to LCD coordinates
   - LCD coordinates are the canonical coordinate system (640x640)
   - All state is stored in LCD coordinates

3. **Transform Operations (LCD Coordinates)**
   - `MoveOperation`: Converts screen delta to LCD delta, applies directly
   - `ResizeOperation`: Converts screen delta to LCD delta, transforms to local space, calculates resize
   - `RotateOperation`: Converts mouse position to LCD, calculates angle in LCD space

4. **Local Coordinate Space (For Rotated Elements)**
   - When element is rotated, resize operations work in local coordinate space
   - Delta is transformed by rotating by -angle to "undo" element rotation
   - This ensures resize happens relative to element's orientation

5. **State Update (LCD → Preview)**
   - Element state is updated in LCD coordinates
   - UI components convert LCD to Preview for rendering
   - `lcdToPreview()` converts LCD coordinates to preview coordinates (200px circle)

### 1.3 Transform Order

**CSS Transform Order:** `translate(...) rotate(...)` (applied right-to-left)

**Why:** Position element first, then rotate around center

**Result:** Rotated elements appear at correct position

### 1.4 Bounding Box System

**AABB (Axis-Aligned Bounding Box):** Used for visual bounding box (Figma-style)

**RBox (Rotated Bounding Box):** Used for handle positioning

**Why AABB for visual:** Consistent visual feedback regardless of rotation

**Why RBox for handles:** Handles need to be at actual rotated corners/edges

### 1.5 Handle Positioning

**8 Resize Handles:** 4 corners (NW, NE, SW, SE) + 4 edges (N, E, S, W)

**1 Rotation Handle:** Top-middle, slightly outside bounding box

**All handles:** Positioned using RBox corners/edges, offset outward

**Handle rotation:** Handles rotate with element to stay upright

### 1.6 Undo/Redo System

**Command Pattern:** Each transform operation is a command

**History Limit:** Maximum 50 actions (prevents memory issues)

**Redo Stack Reset:** New action after undo clears redo stack

**Keyboard Shortcuts:** Ctrl+Z (undo), Ctrl+Y / Ctrl+Shift+Z (redo)

---

## 2. FROZEN ZONE — KİTLİ ALANLAR

### 2.1 TransformEngine Çekirdek (TAM KİLİT — SIFIR TOLERANS)

**Dosyalar:**
```
/src/transform/engine/**
/src/transform/hooks/useTransformEngine.ts
/src/transform/operations/**
/src/transform/history/ActionHistory.ts
```

**Korunan Fonksiyonlar:**
- `calculateOffsetScale()` — offsetScale hesaplama formülü (previewSize / lcdResolution)
- `lcdToPreview()` — LCD → Preview koordinat dönüşümü
- `previewToLcd()` — Preview → LCD koordinat dönüşümü
- `lcdPointToPreview()` — Point dönüşümü (LCD → Preview)
- `previewPointToLcd()` — Point dönüşümü (Preview → LCD)
- `screenToPreview()` — Screen → Preview dönüşümü
- `screenToLcd()` — Screen → LCD dönüşümü
- `localToGlobal()` — Local → Global transform
- `globalToLocal()` — Global → Local transform
- `screenDeltaToLocal()` — Screen delta → Local delta
- `applyMatrixToPoint()` — Transform matrix uygulama
- `applyInverseMatrixToPoint()` — Inverse transform matrix

**YASAK İŞLEMLER (KESİN):**
- ❌ Koordinat matematik formüllerini değiştirmek
- ❌ `offsetScale` hesaplama formülünü değiştirmek (previewSize / lcdResolution)
- ❌ `lcdToPreview` / `previewToLcd` mantığını değiştirmek
- ❌ Transform matrix hesaplamalarını değiştirmek
- ❌ Rotation/resize/move formüllerini değiştirmek
- ❌ AABB (Axis-Aligned Bounding Box) hesaplamalarını değiştirmek
- ❌ Pivot/anchor davranışını değiştirmek
- ❌ Handle positioning mantığını değiştirmek
- ❌ Action history mekanizmasını değiştirmek

**TransformEngine matematiğine dokunmak = OTOMATIK İŞLEM DURDURMA**

### 2.2 Drag/Resize/Rotate Handlers (KORUNMUŞ)

**Dosyalar:**
```
/src/hooks/useDragHandlers.ts
/src/hooks/useResizeHandlers.ts
/src/hooks/useRotationHandlers.ts
```

**Korunan Davranışlar:**
- Drag delta hesaplama (`previewToLcd` kullanımı)
- Element selection mantığı (ilk tıklama seç, ikinci tıklama drag başlat)
- Background drag davranışı
- Element drag davranışı
- Resize handle davranışı
- Rotate handle davranışı

**YASAK İŞLEMLER:**
- ❌ Drag delta hesaplama mantığını değiştirmek
- ❌ Selection davranışını değiştirmek
- ❌ Mouse event handling mantığını değiştirmek
- ❌ Drag başlatma/bitirme davranışını değiştirmek

### 2.3 Utility Fonksiyonları (KORUNMUŞ)

**Dosyalar:**
```
/src/utils/positioning.ts (previewToLcd, lcdToPreview fonksiyonları)
/src/utils/snapping.ts
/src/utils/boundaries.ts
```

**Korunan Fonksiyonlar:**
- `previewToLcd()` — Preview → LCD dönüşümü
- `lcdToPreview()` — LCD → Preview dönüşümü
- Snap-to-guide mantığı
- Boundary constraint mantığı

**YASAK İŞLEMLER:**
- ❌ Snap davranışını değiştirmek
- ❌ Boundary hesaplamalarını değiştirmek
- ❌ Koordinat dönüşüm mantığını değiştirmek

---

## 3. KRİTİK FORMÜLLER

### 3.1 offsetScale Formülü (CRITICAL)

**Formül:** `offsetScale = previewSize / lcdResolution`

**Örnek:** 200 / 640 = 0.3125 (1 LCD pixel = 0.3125 preview pixels)

**Neden Kritik:**
- Bu formül geçmişte sürekli drag pozisyon sorunlarını çözdü
- Bu formüle yapılacak herhangi bir değişiklik drag pozisyon doğruluğunu bozar
- Hem ConfigPreview hem de KrakenOverlay bu hesaplamaya bağımlı

**Kullanım:**
- `previewToLcd(previewPixel, offsetScale)` — Preview → LCD dönüşümü
- `lcdToPreview(lcdPixel, offsetScale)` — LCD → Preview dönüşümü

**DOKUNULMAYACAK:** Bu formül frozen durumda.

### 3.2 Transform Matrix

**2D Affine Transform Matrix (3x3 homogeneous):**

```
[a c tx]   [scaleX * cos(θ)  -scaleY * sin(θ)  tx]
[b d ty] = [scaleX * sin(θ)   scaleY * cos(θ)   ty]
[0 0 1 ]   [0                  0                 1 ]
```

**Transform Sırası:**
1. Scale
2. Rotate
3. Translate

**CSS Transform Order:** `translate(...) rotate(...)` (applied right-to-left)

### 3.3 AABB Hesaplama

**Rotated Element için AABB:**

1. Element'in 4 köşesini hesapla (unrotated)
2. Her köşeyi rotation matrix ile döndür:
   - `x' = x*cos(θ) - y*sin(θ)`
   - `y' = x*sin(θ) + y*cos(θ)`
3. Döndürülmüş köşelerden min/max X ve Y değerlerini bul
4. AABB = `{ left: minX, top: minY, right: maxX, bottom: maxY, width: maxX - minX, height: maxY - minY }`

**Design Decision:** AABB is used for visual bounding box (Figma-style). Even when elements are rotated, the bounding box remains axis-aligned.

### 3.4 Local Coordinate Space Transformation

**Resize işlemi için local coordinate space:**

1. Mouse delta'sını screen coordinates'ten LCD coordinates'e çevir
2. Element'in rotation açısını al
3. Delta'yı -angle ile döndür (element rotation'unu geri al):
   - `localDx = dx*cos(-angle) - dy*sin(-angle)`
   - `localDy = dx*sin(-angle) + dy*cos(-angle)`
4. Local coordinate space'de resize hesapla
5. Sonucu global coordinate space'e geri döndür

**Why:** Resize işlemi element'in local coordinate space'inde yapılmalı ki rotasyonlu elementlerde doğru çalışsın.

---

## 4. NASIL DOKUNULUR / NASIL DOKUNULMAZ

### 4.1 İzin Verilen Değişiklikler (Özel Onay Gerektirir)

1. **Dead Code Cleanup:**
   - Kullanılmayan kod kaldırma (fonksiyon çağrılmıyor, import edilmiyor)
   - Önkoşul: Kullanılmadığını kanıtla (grep/ag ile arama)

2. **Unused Variable Prefix:**
   - Unused variable'ları `_` prefix ile işaretleme
   - Önkoşul: TypeScript uyarısı var

3. **Type Guard Dönüşümü:**
   - `as any` → type guard dönüşümü
   - Önkoşul: Davranış değişmez, sadece tip güvenliği artar

4. **Import Cleanup:**
   - Kullanılmayan import'ları kaldırma
   - Önkoşul: Import kullanılmıyor (grep ile doğrula)

5. **Küçük Tip Güvenliği Düzeltmeleri:**
   - Sadece tip hataları düzeltme (davranışı değiştirmeyen)
   - Önkoşul: Davranış değişmez, sadece compile-time tip kontrolü

6. **Yorum Ekleme/Düzenleme:**
   - Açıklayıcı yorumlar ekleme
   - Mevcut yorumları düzenleme
   - Önkoşul: Kod mantığını değiştirmemeli

**ÖNEMLİ:** Bu değişiklikler bile **davranışı değiştirmemeli** ve **patch workflow'u** ile yapılmalıdır. **Özel onay gerektirir.**

### 4.2 Yasak Değişiklikler

- ❌ Koordinat matematik formüllerini değiştirmek
- ❌ `offsetScale` hesaplama formülünü değiştirmek
- ❌ Transform matrix hesaplamalarını değiştirmek
- ❌ Rotation/resize/move formüllerini değiştirmek
- ❌ AABB hesaplamalarını değiştirmek
- ❌ Handle positioning mantığını değiştirmek
- ❌ "İyileştirme" adı altında matematiksel formül değişikliği
- ❌ "Optimizasyon" adı altında algoritma değişikliği

---

## 5. DEVELOPER NOTES

### 5.1 Figma-Like Behaviors

**Transform Behaviors:**
- **Move:** Elements move in the direction of mouse drag, regardless of rotation
- **Resize:** Aspect ratio lock is always ON (default behavior)
- **Rotate:** Center-origin rotation with soft snap-to-angle (0°, 45°, 90°, etc.)
- **Bounding Box:** AABB (axis-aligned) for visual feedback, even for rotated elements
- **Handles:** 8 resize handles + 1 rotation handle (Figma-style)

**Coordinate System:**
- **Canonical System:** LCD coordinates (640x640)
- **Preview System:** Scaled representation (200x200)
- **Conversion:** `offsetScale = previewSize / lcdResolution` (CRITICAL formula)
- **Why:** Ensures consistency between preview and LCD displays

**Transform Order:**
- **CSS:** `translate(...) rotate(...)` (applied right-to-left)
- **Why:** Position first, then rotate (ensures correct positioning for rotated elements)

### 5.2 Custom Decisions

**Aspect Ratio Lock:**
- **Decision:** Always ON by default
- **Why:** Prevents accidental distortion, matches Figma behavior
- **Future:** Can be disabled per element type if needed

**Rotation Handle Position:**
- **Decision:** Top-middle, slightly outside bounding box
- **Why:** Compatible with circular LCD, doesn't interfere with resize handles
- **Alternative Considered:** Top-right corner (rejected - conflicts with NE handle)

**Multi-Select:**
- **Current:** Only "move together" supported
- **Future:** Rotate/Resize for multi-select can be added
- **Architecture:** Already supports multi-select internally

**Snapping:**
- **Current:** Minimal snapping (stage center, rotation snap)
- **Future:** Complex Figma-style snapping can be added
- **Architecture:** Snapping system is extensible

**Boundary Constraints:**
- **Current:** Elements can overflow circle boundary
- **Future:** Boundary constraints can be added
- **Architecture:** Boundary checking utilities exist

### 5.3 Architectural Choices

**Why Command Pattern for Undo/Redo:**
- **Reason:** Clean separation of operations, easy to extend
- **Benefit:** Each operation is self-contained, can be undone/redone independently
- **Alternative Considered:** State snapshots (rejected - too memory-intensive)

**Why AABB for Visual Bounding Box:**
- **Reason:** Figma-style behavior, consistent visual feedback
- **Benefit:** Users see predictable bounding box regardless of rotation
- **Alternative Considered:** Rotated bounding box (rejected - confusing for users)

**Why Local Coordinate Space for Resize:**
- **Reason:** Fixes Bug #2 (rotated element resize)
- **Benefit:** Resize works correctly regardless of element rotation
- **How:** Transform delta by -angle to get local space delta

**Why LCD Coordinates as Canonical System:**
- **Reason:** State is stored in LCD coordinates, ensures consistency
- **Benefit:** No coordinate system confusion, single source of truth
- **How:** All operations convert to LCD before processing

**Why Separate Operations Layer:**
- **Reason:** Clean separation of concerns, testable, reusable
- **Benefit:** Operations can be used independently, easy to test
- **How:** Pure functions, no React dependencies

### 5.4 Performance Considerations

**HandlePositioning:**
- **Optimization:** Only calculated for selected elements
- **Why:** Handle calculations are expensive (matrix operations)
- **Result:** No performance impact for unselected elements

**UnifiedOverlayRenderer:**
- **Optimization:** Memoized with `React.memo`
- **Why:** Prevents unnecessary re-renders
- **Result:** Only re-renders when overlay data changes

**ActionHistory:**
- **Optimization:** Maximum 50 actions, oldest removed automatically
- **Why:** Prevents memory issues with long editing sessions
- **Result:** Constant memory usage

### 5.5 Known Limitations & Future Enhancements

**Current Limitations:**
- Multi-select: Only move supported (rotate/resize deferred)
- Snapping: Minimal (complex snapping deferred)
- Boundary: No constraints (can be added)
- Pointer Capture: Not used (window-level listeners sufficient)

**Future Enhancements:**
- Multi-select rotate/resize
- Complex snapping (element-to-element, guides)
- Boundary constraints
- Custom transform origins
- Flip operations (horizontal/vertical)

---

## 6. TEST SENARYOLARI

### 6.1 TransformEngine Doğrulama Test Senaryoları

**Manuel Test Senaryoları (ZORUNLU):**

1. **Drag İşlemi:**
   - [ ] Element drag edildiğinde pozisyon doğru mu?
   - [ ] Preview ve LCD pozisyonları tutarlı mı?
   - [ ] Drag sonrası koordinatlar doğru mu?
   - [ ] Drag sırasında flicker var mı?

2. **Resize İşlemi:**
   - [ ] Element resize edildiğinde boyut doğru mu?
   - [ ] Resize handle'lar doğru konumda mı?
   - [ ] Resize sırasında drift var mı?
   - [ ] Resize sonrası AABB doğru mu?

3. **Rotate İşlemi:**
   - [ ] Element rotate edildiğinde açı doğru mu?
   - [ ] Rotate handle doğru konumda mı?
   - [ ] Rotate sırasında drift var mı?
   - [ ] Rotate sonrası transform matrix doğru mu?

4. **Koordinat Dönüşümleri:**
   - [ ] `previewToLcd` doğru çalışıyor mu?
   - [ ] `lcdToPreview` doğru çalışıyor mu?
   - [ ] `offsetScale` hesaplama doğru mu?
   - [ ] Point dönüşümleri doğru mu?

5. **Snap-to-Guide:**
   - [ ] Snap çalışıyor mu?
   - [ ] Snap threshold doğru mu?
   - [ ] Alignment davranışı doğru mu?

6. **Boundaries:**
   - [ ] Boundary constraints çalışıyor mu?
   - [ ] Element sınır kontrolleri doğru mu?
   - [ ] Boundary hesaplamaları doğru mu?

**Otomatik Test Senaryoları (Önerilir):**
- Unit testler (koordinat dönüşümleri)
- Integration testler (transform işlemleri)
- Visual regression testler (UI davranışı)

**Başarısız olursa:**
- Patch **hemen geri alınır**
- Hata analizi yapılır
- Plan revize edilir
- Kullanıcıya bildirilir

---

## 7. BUG FIX ROUND ÖZETİ (Faz 6)

### Tüm 10 Bug Düzeltildi

**Bug #1: Rotated Element Move**
- **Çözüm:** `MoveOperation.ts` - Screen delta LCD koordinatlarına dönüştürülüyor
- **Test:** Rotasyonlu elementler mouse hareketi yönünde doğru şekilde taşınıyor

**Bug #2: Rotated Element Resize**
- **Çözüm:** `ResizeOperation.ts` - Resize delta element'in local coordinate space'inde hesaplanıyor
- **Test:** Rotasyonlu elementler doğru yönde resize ediliyor

**Bug #3: Transform Order**
- **Çözüm:** `UnifiedOverlayRenderer.tsx` - Transform sırası: translate → rotate
- **Test:** Rotasyonlu elementler doğru pozisyonda render ediliyor

**Bug #4: Rotation Handle Offset**
- **Çözüm:** `HandlePositioning.ts` - Rotation handle top-middle'da, doğru offset ile
- **Test:** Rotation handle doğru pozisyonda görünüyor

**Bug #5: Resize Handle Offset**
- **Çözüm:** `HandlePositioning.ts` - Tüm handle'lar rotasyonlu koordinatlarda doğru pozisyonlanıyor
- **Test:** Resize handle'ları doğru pozisyonda görünüyor

**Bug #6: NE Resize Handle Eksik**
- **Çözüm:** `HandlePositioning.ts` - Tüm 8 handle (NE dahil) eklendi
- **Test:** Top-right corner'dan resize yapılabiliyor

**Bug #7: Coordinate System Inconsistency**
- **Çözüm:** `RotateOperation.ts` - Tüm hesaplamalar LCD koordinatlarında yapılıyor
- **Test:** Rotasyon açısı doğru hesaplanıyor

**Bug #8: Bounding Box Dimensions**
- **Çözüm:** `BoundingBox.ts` - Gerçek render boyutları kullanılıyor
- **Test:** AABB bounding box gerçek element boyutlarına uygun

**Bug #9: Event Propagation**
- **Durum:** Kontrol edildi - Sorun yok
- **Test:** Handle'larda ve element hit area'da `stopPropagation` kullanılıyor

**Bug #10: Pointer Capture**
- **Durum:** Kontrol edildi - Şu an için yeterli
- **Test:** Window-level event listener'lar kullanılıyor, pointer capture yok

### Edge Case Testleri

**Undo/Redo Edge Cases:**
- Ardışık küçük move'lar: Her move ayrı command olarak kaydediliyor
- Hızlı drag-drop: Mouseup'ta command kaydediliyor
- Resize-Rotate-Move sırayla: Her işlem ayrı command olarak kaydediliyor
- History overflow (50 limit): Eski command'lar otomatik siliniyor
- Redo stack reset: Yeni action kaydedildiğinde redo stack temizleniyor

**Performans Testleri:**
- Gereksiz re-render: `UnifiedOverlayRenderer` memoize edilmiş
- HandlePositioning hesaplamaları: Sadece selected element için yapılıyor

---

## 8. SONUÇ

TransformEngine v1 stabil ve production-ready durumda. Tüm fazlar (0 → 8.5) başarıyla tamamlandı. Sistem matematiksel olarak doğru, UI/UX tutarlı, tip güvenliği yüksek seviyede.

**Implementation Status:**
- ✅ Phase 0: Complete (Report internalized, design decisions added)
- ✅ Phase 1: Complete (Plan updated and frozen)
- ✅ Phase 2: Complete (Core & Utility Layer)
- ✅ Phase 3: Complete (Operations Layer)
- ✅ Phase 4: Complete (Hook & UI Integration)
- ✅ Phase 5: Complete (Undo/Redo Integration)
- ✅ Phase 6: Complete (Bug Fix Round + Self-Heal)
- ✅ Phase 7: Complete (Cleanup, Documentation, Comments)

**All 10 Bugs Fixed:**
- ✅ Bug #1: Rotated element move (MoveOperation)
- ✅ Bug #2: Rotated element resize (ResizeOperation)
- ✅ Bug #3: Transform order (UnifiedOverlayRenderer)
- ✅ Bug #4: Rotation handle offset (HandlePositioning)
- ✅ Bug #5: Resize handle offset (HandlePositioning)
- ✅ Bug #6: NE resize handle missing (HandlePositioning - all 8 handles)
- ✅ Bug #7: Coordinate system inconsistency (RotateOperation)
- ✅ Bug #8: Bounding box dimensions (BoundingBox.ts)
- ✅ Bug #9: Event propagation (Verified - no issues)
- ✅ Bug #10: Pointer capture (Verified - window-level listeners sufficient)

**System is production-ready!**

---

**Son Güncelleme:** 2025.01.19  
**Versiyon:** 1.0.0

