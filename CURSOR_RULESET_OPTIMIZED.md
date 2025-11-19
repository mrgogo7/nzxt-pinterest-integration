# CURSOR RULESET OPTIMIZED — Cursor AI İçin Güvenli Çalışma Protokolü

**Versiyon:** 3.0.0  
**Son Güncelleme:** 2025.01.19  
**Amaç:** TransformEngine davranışını koruyarak güvenli ve kontrollü geliştirme yapmak

Cursor AI; bu projede tüm çalışmalarını BU kurallar doğrultusunda yapmalıdır.  
Bu dosya, Cursor için bir **"güvenlik duvarı"**, **"çalışma rehberi"** ve **"operasyon protokolü"**dür.

---

## 🔴 ÖNCELİK SIRASI (KESİN SIRALAMA)

1. **TransformEngine davranışı korunmalı** (MUTLAK ÖNCELİK — SIFIR TOLERANS)
2. **Frozen zone'lara dokunulmamalı** (MUTLAK KURAL)
3. **Patch workflow'u takip edilmeli** (ZORUNLU PROTOKOL)
4. **Tüm çıktılar TÜRKÇE olmalı** (DEĞİŞTİRİLEMEZ KURAL)

Bu sıralama **kesindir** ve ihlali durumunda **işlem anında durdurulmalıdır**.

---

## 0. SIFIR RİSK POLİTİKASI

### 0.1 TransformEngine İçin Sıfır Tolerans

**TransformEngine matematiğine KESİNLİKLE dokunulamaz.**  
Bu politika **hiçbir koşulda ihlal edilemez**.

**Sıfır Risk Tanımı:**
- TransformEngine davranışını **hiçbir şekilde** etkilemeyen değişiklikler
- Sadece **görsel/styling** değişiklikleri (UI tarafında)
- Sadece **dead code cleanup** (kullanılmayan kod kaldırma)
- Sadece **tip güvenliği** düzeltmeleri (davranışı değiştirmeyen)

**Sıfır Risk Dışı:**
- ❌ TransformEngine ile ilgili herhangi bir davranış değişikliği
- ❌ "İyileştirme" adı altında matematiksel formül değişikliği
- ❌ Koordinat dönüşüm mantığı değişikliği
- ❌ "Optimizasyon" adı altında algoritma değişikliği

### 0.2 Davranış Değişikliği Tanımı

**Davranış değişikliği:** Kodu çalıştırdığımızda sonucun veya sürecin farklı olması.

**Davranış Değişikliği Örnekleri:**
- Fonksiyonun çıktısının değişmesi
- Hesaplama sonucunun değişmesi
- UI'da elementlerin konumunun farklı görünmesi
- Mouse event'lerinin farklı davranması
- Koordinat dönüşümlerinin farklı sonuç vermesi

**Davranış Değişikliği OLMAYAN Örnekler:**
- Sadece kod formatlaması (prettier/eslint)
- Sadece yorum ekleme/düzenleme
- Sadece kullanılmayan import kaldırma
- Sadece değişken isim değişikliği (semantik aynı)
- Sadece CSS/styling değişikliği (görsel değişiklik hariç)

---

## 1. DİL KURALI (DEĞİŞTİRİLEMEZ)

Cursor AI **HER ZAMAN TÜRKÇE** cevap vermelidir.

**Kapsam:**
- Planlar
- QA raporları
- Patch açıklamaları
- Commit mesajları
- Kod yorumları (mümkün olduğunca)
- Hata mesajları (kullanıcıya gösterilenler)
- Dokümantasyon

**İstisna:** Sadece teknik terimler, API isimleri ve değişken isimleri İngilizce olabilir.

---

## 2. FROZEN ZONE — KİTLİ ALANLAR (MUTLAK KURAL)

Aşağıdaki dosyalar ve fonksiyonlar **TAMAMEN DONMUŞTUR (FROZEN)**.  
Bu alanlarda **hiçbir davranış değişikliği** yapılamaz.

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

### 2.4 Frozen Zone'da İZİN VERİLEN DEĞİŞİKLİKLER (ÖZEL ONAY GEREKTİRİR)

**Sadece şu değişiklikler yapılabilir ve ÖZEL ONAY GEREKTİRİR:**

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

---

## 3. ALLOWED ZONE — SERBEST ALANLAR

Aşağıdaki yapılar üzerinde gelişim **SERBESTTİR** ancak **patch workflow'u** takip edilmelidir.

### 3.1 UI Bileşenleri

```
/src/ui/components/**
/src/ui/styles/**
```

**İzin Verilen İşlemler:**
- ✅ Component split/refactor (UI tarafında)
- ✅ CSS animasyonları ekleme/düzenleme
- ✅ Hover/active state'ler
- ✅ Handle styling
- ✅ Tooltip/label eklemeleri
- ✅ Micro-UX iyileştirmeleri
- ✅ Component organizasyonu

**YASAK:**
- ❌ TransformEngine davranışını etkileyen değişiklikler
- ❌ Koordinat hesaplamalarını etkileyen değişiklikler

### 3.2 Type Definitions (UI ile ilgili)

```
/src/types/overlay.ts (UI ile ilgili tip eklemeleri)
```

**İzin Verilen İşlemler:**
- ✅ Yeni UI state type'ları ekleme
- ✅ Component prop type'ları ekleme
- ✅ UI helper type'ları ekleme

**YASAK:**
- ❌ TransformEngine ile ilgili type'ları değiştirmek
- ❌ OverlayElement yapısını değiştirmek (Phase planları hariç)

### 3.3 TypeScript İyileştirmeleri

**İzin Verilen İşlemler:**
- ✅ TypeScript strict mode iyileştirmeleri
- ✅ Type guard eklemeleri
- ✅ `as any` azaltma (davranışı değiştirmeyen)
- ✅ Generic type iyileştirmeleri

**YASAK:**
- ❌ Davranışı değiştiren tip dönüşümleri

### 3.4 Production Cleanup

**İzin Verilen İşlemler:**
- ✅ Dead code removal
- ✅ Unused import cleanup
- ✅ Console.log removal (production için)
- ✅ Code formatting (prettier/eslint)

**YASAK:**
- ❌ Davranışı değiştiren her türlü cleanup

---

## 4. PATCH WORKFLOW PROTOKOLÜ

Her patch işlemi **bu adımları takip etmelidir**. Bu protokol **ZORUNLUDUR**.

### 4.1 Pre-Patch Validation (ÖN KONTROL)

Patch'e başlamadan önce **ön kontrol** yapılmalıdır.

**Kontrol Listesi:**
1. [ ] Frozen zone'lara dokunulacak mı? (EVET/HAYIR)
2. [ ] Eğer EVET, özel onay gerektiren değişiklik mi? (Bölüm 2.4)
3. [ ] TransformEngine davranışı etkilenecek mi? (**HAYIR olmalı**)
4. [ ] Risk seviyesi belirlendi mi? (DÜŞÜK/ORTA/YÜKSEK)
5. [ ] Risk seviyesi YÜKSEK ise, gerekçesi nedir?

**Başarısız kontrol = Patch başlatılamaz**

### 4.2 Patch Öncesi Planlama (ZORUNLU)

Cursor AI, patch'e başlamadan önce **Mini Plan** hazırlamalıdır.

**Mini Plan İçeriği:**

1. **Patch Kapsamı:**
   - Hangi dosyalara dokunulacak? (tam liste)
   - Hangi fonksiyonlar değişecek? (tam liste)
   - Hangi className'ler veya CSS eklemeleri yapılacak?
   - Dosya başına kaç satır değişiklik bekleniyor?

2. **Frozen Zone Kontrolü:**
   - Frozen zone'lara dokunulacak mı? (EVET/HAYIR)
   - Eğer EVET:
     - Hangi frozen zone? (TransformEngine/DragHandlers/Utilities)
     - Hangi dosyalar? (tam liste)
     - Neden? (Sadece cleanup mu?)
     - İzin verilen değişiklik türü nedir? (Bölüm 2.4)
     - Davranışı etkiler mi? (**HAYIR olmalı**)
     - Özel onay gerekli mi? (**EVET olmalı**)

3. **Risk Analizi:**
   - Risk seviyesi: **DÜŞÜK** / **ORTA** / **YÜKSEK**
   - Risk seviyesi kriteri:
     - **DÜŞÜK:** Sadece UI/styling değişikliği, dead code cleanup, import cleanup
     - **ORTA:** UI refactor, component splitting, type definitions ekleme
     - **YÜKSEK:** Multi-file operations, frozen zone cleanup, behavior-affecting changes
   - TransformEngine davranışı etkilenecek mi? (**HAYIR olmalı**)
   - UI/UX bozulması riski var mı?
   - Veri kaybı riski var mı?
   - Build break riski var mı?

4. **Geliştirme Kapsamı:**
   - Ne yapılacak? (açık ve net, madde madde)
   - Neden yapılıyor? (gerekçe)
   - Alternatif çözümler düşünüldü mü?

5. **Test Stratejisi:**
   - Hangi senaryolar test edilecek?
   - TransformEngine davranışı nasıl doğrulanacak? (Bölüm 10.3)
   - Manual test gerekli mi?
   - Edge case'ler düşünüldü mü?

6. **Rollback Planı:**
   - Patch başarısız olursa ne yapılacak?
   - Hangi commit'e geri dönülecek?
   - Veri kaybı olursa nasıl kurtarılacak?

**Mini Plan, kullanıcı tarafından onaylanmadan patch başlatılamaz.**

### 4.3 Patch Uygulama Kuralları

**Patch sırasında:**

1. **Dosya Bazlı İşlem:**
   - ✅ Sadece planda belirtilen dosyalar düzenlenir
   - ✅ Her dosya değişikliği atomik olmalı (tamamen çalışır durumda)
   - ✅ Her dosya sonrası build kontrolü yapılmalı

2. **Frozen Zone Kontrolü:**
   - ✅ Frozen zone'lara dokunulmaz (plan onaylandıysa sadece izin verilen değişiklikler)
   - ✅ Frozen zone değişiklikleri için özel onay gerekli

3. **Davranış Koruma:**
   - ✅ Kod davranışı değiştirilmez (UI patch değilse)
   - ✅ TransformEngine davranışı korunmalı

4. **Minimum Risk İlkesi:**
   - ✅ Tüm değişiklikler minimum risk ilkesine uygun yapılır
   - ✅ Gereksiz değişiklikler yapılmaz
   - ✅ "Just in case" değişiklikleri yapılmaz

5. **Code Review Checkpoints:**
   - ✅ Her 3 dosya değişikliğinden sonra kontrol yapılmalı
   - ✅ Risk seviyesi YÜKSEK ise her dosya sonrası kontrol

**Multi-File Operations:**

Birden fazla dosyada değişiklik yapılacaksa:

1. **Dependency Analizi:**
   - Dosyalar arası bağımlılıklar analiz edilmeli
   - Dependency graph oluşturulmalı
   - Değişiklik sırası dependency order'a göre belirlenmeli

2. **Dosya Sıralaması:**
   - En az riskli dosyalar önce değiştirilir
   - TransformEngine ile ilgili dosyalar en son değiştirilir
   - Her dosya sonrası ara kontrol yapılır

3. **Atomic Changes:**
   - Her dosya değişikliği atomik olmalı (tamamen çalışır durumda)
   - Bir dosyada birden fazla görev yapılmaz
   - Her dosya değişikliği bağımsız test edilebilir olmalı

4. **Rollback Stratejisi:**
   - Her dosya için rollback planı olmalı
   - Her adımda geri dönüş imkanı olmalı

**Experimental Patch Engelleme:**

- ❌ Deneysel veya test amaçlı patch'ler yapılamaz
- ❌ "Belki işe yarar" mantığıyla değişiklik yapılamaz
- ❌ Kullanıcı onayı olmadan yeni özellik eklenemez
- ❌ TransformEngine üzerinde "iyileştirme" adı altında değişiklik yapılamaz
- ❌ "Optimizasyon" adı altında davranış değişikliği yapılamaz

### 4.4 Patch Sonrası Kontroller (ZORUNLU)

Patch tamamlandığında **otomatik kontrol** yapılmalıdır.

**Kontrol Listesi:**

1. **TypeScript Kontrolleri:**
   - [ ] TypeScript hata var mı? (olmamalı)
   - [ ] TS6133 (unused variable) uyarıları prefix ile çözülmüş mü?
   - [ ] Import path'ler doğru mu?
   - [ ] Type inference doğru mu?

2. **Build Kontrolleri:**
   - [ ] Build çalışıyor mu? (`npm run build`)
   - [ ] Dev server çalışıyor mu? (`npm run dev`)
   - [ ] Build output doğru mu?
   - [ ] Bundle size kontrol edildi mi?

3. **Davranış Kontrolleri (KRİTİK):**
   - [ ] TransformEngine davranışı değişti mi? (**Değişmemeli**)
   - [ ] Drag davranışı doğru mu?
   - [ ] Resize davranışı doğru mu?
   - [ ] Rotate davranışı doğru mu?
   - [ ] Koordinat dönüşümleri doğru mu?
   - [ ] Snap-to-guide çalışıyor mu?
   - [ ] Boundary constraints çalışıyor mu?

4. **UI/UX Kontrolleri:**
   - [ ] UI/UX bozulması var mı?
   - [ ] Flicker / drift oluştu mu?
   - [ ] Visual regression var mı?
   - [ ] Responsive davranış doğru mu?

5. **Veri Kontrolleri:**
   - [ ] Veri kaybı var mı?
   - [ ] Storage migration doğru mu?
   - [ ] LocalStorage okuma/yazma doğru mu?

6. **Performance Kontrolleri:**
   - [ ] Performans düşüşü var mı?
   - [ ] Memory leak oluştu mu?
   - [ ] Render loop problemi var mı?

**Kontrol başarısız olursa:**
- Patch **hemen geri alınır** (Bölüm 12.2)
- Hata analizi yapılır
- Plan revize edilir
- Kullanıcıya bildirilir

### 4.5 Patch Raporu (ZORUNLU)

Patch tamamlandığında **detaylı rapor** hazırlanmalıdır.

**Rapor İçeriği:**

1. **Yapılan Değişiklikler:**
   - Dosya bazında liste (her dosya için)
   - Fonksiyon bazında liste (değişen fonksiyonlar)
   - Satır sayıları (eklenen/silinen)

2. **Test Sonuçları:**
   - Hangi testler yapıldı?
   - Test sonuçları (başarılı/başarısız)
   - Edge case testleri

3. **TransformEngine Davranışı Kontrolü:**
   - Bölüm 10.3'teki test senaryoları sonuçları
   - Davranış değişikliği var mı? (OLMAMALI)

4. **UI/UX Kontrolü:**
   - Görsel değişiklikler
   - UX iyileştirmeleri
   - Bozulan davranışlar (varsa)

5. **Kalan Riskler:**
   - Bilinen riskler
   - Edge case'ler
   - Gelecek iyileştirmeler

6. **Rollback Durumu:**
   - Patch başarılı mı?
   - Rollback gerekli mi?
   - Hangi commit'e dönülecek?

### 4.6 Patch Retry Mekanizması

Patch başarısız olursa:

1. **Hata Analizi:**
   - Hata nedeni belirlenmeli
   - Hata kaynağı tespit edilmeli
   - Hata kategorisi belirlenmeli (Build/Test/Davranış)

2. **Plan Revizyonu:**
   - Plan revize edilmeli
   - Hata kaynağı plana eklenmeli
   - Risk analizi güncellenmeli

3. **Retry Kararı:**
   - Retry yapılacak mı? (Kullanıcı onayı)
   - Retry planı oluşturulmalı
   - Önceki hatalar dikkate alınmalı

4. **Rollback:**
   - Patch geri alınmalı (Bölüm 12.2)
   - Son stable commit'e dönülmeli
   - Veri kaybı kontrol edilmeli

---

## 5. REFACTOR KURALLARI

### 5.1 Yasak Refactor'lar

**TransformEngine İle İlgili:**
- ❌ Koordinat matematiği değiştirmek
- ❌ Transform zincirine müdahale
- ❌ Snap davranışını değiştirmek
- ❌ Geometry hesaplarını etkilemek
- ❌ Handle positioning mantığını değiştirmek
- ❌ Action history mekanizmasını değiştirmek

**Genel:**
- ❌ Incremental auto-scale / auto-fit entegrasyonu (Phase 8.6 iptal edildi)
- ❌ Davranışı değiştiren her türlü refactor
- ❌ "İyileştirme" adı altında davranış değişikliği

### 5.2 Serbest Refactor'lar

**UI Tarafı:**
- ✅ UI component splitting
- ✅ CSS düzenleme
- ✅ Component yapısını sadeleştirme
- ✅ UI organizasyonu iyileştirme

**Code Quality:**
- ✅ Type guard ekleme
- ✅ `as any` azaltma (davranışı değiştirmeyen)
- ✅ Dead code cleanup
- ✅ Dosya organizasyonu iyileştirme
- ✅ Import cleanup

### 5.3 Refactor-Safe Mod

**Refactor yaparken:**

1. **Davranış Korunmalı:**
   - Refactor öncesi ve sonrası davranış birebir aynı olmalı
   - Görsel sonuçlar aynı olmalı
   - Kullanıcı deneyimi aynı olmalı

2. **Test Yapılmalı:**
   - Refactor sonrası tüm senaryolar test edilmeli
   - Edge case'ler test edilmeli
   - Regression testleri yapılmalı

3. **TransformEngine Kontrolü:**
   - TransformEngine davranışı doğrulanmalı (Bölüm 10.3)
   - Koordinat dönüşümleri test edilmeli
   - Transform işlemleri test edilmeli

4. **Patch Workflow:**
   - Refactor da bir patch gibi planlanmalı ve uygulanmalı
   - Mini Plan hazırlanmalı
   - Patch raporu oluşturulmalı

---

## 6. VERSIONING STANDARDI

Commit mesajları **bu standartlara** uymalıdır.

**Format:**
```
<type>: <kapsam> — <açıklama>
```

**Type'lar:**
- `chore:` — Altyapı, cleanup, config değişiklikleri
- `fix:` — Hata düzeltmeleri
- `feat:` — Yeni özellikler (UI tarafında)
- `refactor:` — Refactor işlemleri (davranışı değiştirmeyen)
- `docs:` — Dokümantasyon değişiklikleri
- `style:` — Formatting, CSS değişiklikleri

**Örnekler:**
```
chore: Phase 1.2 — Overlay type definitions cleanup
fix: Drag handler — Element selection davranışı düzeltildi
feat: UI — Tooltip eklemeleri
refactor: ConfigPreview — Component splitting (davranış korundu)
```

**Önemli:**
- Commit mesajları **TÜRKÇE** olmalı
- Kapsam (scope) opsiyonel ama önerilir
- TransformEngine ile ilgili commit'lerde **"davranış korundu"** notu eklenmeli

---

## 7. KURAL/KOD ÇAKIŞMASI ÇÖZÜM MANTIĞI

Ruleset ile mevcut kod veya yorum çelişirse:

### 7.1 Öncelik Sırası

1. **KOD KAZANIR** (En yüksek öncelik)
   - Cursor önce kodu doğru kabul eder
   - Kurallar buna göre yeniden yorumlanır
   - Kod, mevcut davranışı tanımlar

2. **YORUM KAZANIR** (İkinci öncelik)
   - Kod ile yorum çelişirse yorum geçerlidir
   - Yorum, kodun amacını açıklıyorsa
   - Yorum, TransformEngine davranışını açıklıyorsa

3. **RULESET KAZANIR** (Son çare)
   - Sadece kod ve yorum belirsizse ruleset geçerlidir
   - Ruleset, güvenli varsayımları tanımlar

### 7.2 Çakışma Çözüm Süreci

**Çakışma tespit edildiğinde:**

1. **Çakışma Bildirimi:**
   - Kullanıcıya çakışma bildirilir
   - Çakışma detayları açıklanır
   - Çakışma konumu belirtilir (dosya, satır)

2. **Çelişki Analizi:**
   - Kod/yorum/ruleset arasındaki çelişki açıklanır
   - Her birinin ne dediği belirtilir
   - Çelişkinin nedeni analiz edilir

3. **Çözüm Önerisi:**
   - Çözüm önerisi sunulur
   - Önerinin gerekçesi açıklanır
   - Risk analizi yapılır

4. **Kullanıcı Onayı:**
   - Kullanıcı onayı alınır
   - Onay olmadan işlem yapılamaz

**Asla:**
- ❌ Sessizce birini seçip devam edilmez
- ❌ Çakışma görmezden gelinmez
- ❌ TransformEngine ile ilgili çakışmalarda varsayım yapılmaz

---

## 8. MULTI-FILE OPERATIONS GÜVENLİĞİ

Birden fazla dosyada değişiklik yapılacaksa:

### 8.1 Planlama

1. **Dosya Listesi:**
   - Tüm etkilenecek dosyalar listelenmeli
   - Her dosyanın rolü belirtilmeli
   - Dosya bağımlılıkları analiz edilmeli

2. **Bağımlılık Analizi:**
   - Dosyalar arası bağımlılıklar kontrol edilmeli
   - Dependency graph oluşturulmalı
   - Import bağımlılıkları tespit edilmeli

3. **Sıralama:**
   - Değişiklik sırası belirlenmeli (dependency order)
   - En az riskli dosyalar önce
   - TransformEngine dosyaları en son

4. **Rollback Planı:**
   - Her dosya için rollback stratejisi olmalı
   - Her adımda geri dönüş imkanı olmalı
   - Commit checkpoint'leri belirlenmeli

### 8.2 Uygulama

1. **Adım Adım:**
   - Her dosya değişikliği ayrı ayrı yapılmalı
   - Her dosya sonrası build/test kontrolü yapılmalı
   - Her dosya sonrası commit yapılmalı (opsiyonel ama önerilir)

2. **Ara Kontroller:**
   - Her dosya sonrası build kontrolü
   - Her 3 dosya sonrası davranış kontrolü
   - Risk seviyesi YÜKSEK ise her dosya sonrası kontrol

3. **Atomic Changes:**
   - Her dosya değişikliği atomik olmalı (tamamen çalışır durumda)
   - Bir dosyada birden fazla görev yapılmaz
   - Her dosya değişikliği bağımsız test edilebilir olmalı

### 8.3 Risk Azaltma

- ✅ Önce en az riskli dosyalar değiştirilir
- ✅ TransformEngine ile ilgili dosyalar en son değiştirilir
- ✅ Her adımda geri dönüş imkanı olmalı
- ✅ Her adımda test yapılmalı
- ✅ Her adımda commit yapılmalı (opsiyonel)

---

## 9. EXPERIMENTAL PATCH ENGELLEME

**Yasak İşlemler:**
- ❌ Deneysel veya test amaçlı patch'ler
- ❌ "Belki işe yarar" mantığıyla değişiklik
- ❌ Kullanıcı onayı olmadan yeni özellik
- ❌ TransformEngine üzerinde "iyileştirme" adı altında değişiklik
- ❌ "Optimizasyon" adı altında davranış değişikliği
- ❌ "Refactor" adı altında davranış değişikliği

**Kural:**
- Her patch'in **net bir amacı** olmalı
- Her patch'in **onaylanmış bir planı** olmalı
- Her patch'in **test stratejisi** olmalı
- Her patch'in **rollback planı** olmalı

**Experimental Patch Tanımı:**
- Amacı belirsiz olan patch'ler
- Test edilmemiş patch'ler
- Risk analizi yapılmamış patch'ler
- Planı olmayan patch'ler

---

## 10. TRANSFORMENGINE DAVRANIŞ KORUMA İLKESİ

**En Yüksek Öncelik:** TransformEngine davranışı korunmalıdır.  
**Sıfır Tolerans:** TransformEngine matematiğine dokunmak **YASAKTIR**.

### 10.1 Korunan Davranışlar

1. **Koordinat Dönüşümleri:**
   - `previewToLcd()` / `lcdToPreview()` davranışı
   - `offsetScale` hesaplama formülü (previewSize / lcdResolution)
   - Point dönüşümleri
   - Screen koordinat dönüşümleri

2. **Transform İşlemleri:**
   - Move davranışı
   - Resize davranışı
   - Rotate davranışı
   - Transform matrix hesaplamaları

3. **Handle Positioning:**
   - Resize handle konumları
   - Rotate handle konumu
   - Handle tıklama davranışı
   - Handle dragging davranışı

4. **Snapping:**
   - Snap-to-guide davranışı
   - Alignment davranışı
   - Snap threshold değerleri

5. **Boundaries:**
   - Boundary constraint davranışı
   - Element sınır kontrolleri
   - Boundary hesaplamaları

6. **Action History:**
   - Undo/redo davranışı
   - History stack yönetimi
   - Command pattern implementasyonu

### 10.2 Doğrulama

TransformEngine davranışı **her patch sonrası** doğrulanmalıdır.

### 10.3 TransformEngine Doğrulama Test Senaryoları

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
- Patch **hemen geri alınır** (Bölüm 12.2)
- Hata analizi yapılır
- Plan revize edilir
- Kullanıcıya bildirilir

---

## 11. UZUN VADE NOTLAR

### 11.1 İptal Edilen Planlar

- ❌ **Phase 8.6:** İptal edilmiştir (Uygulanmaz)
- ❌ **LCD-native scale wrapper entegrasyonu:** Yapılmayacak
- ❌ **Incremental auto-scale / auto-fit:** Yapılmayacak

### 11.2 Gelecek Stratejisi

- ✅ Gelecek fazlar **UI merkezli** olacak
- ✅ TransformEngine **kalıcı şekilde frozen** kalacak
- ✅ Yeni özellikler **TransformEngine'i etkilemeyecek**
- ✅ TransformEngine matematik formülleri **hiçbir zaman değiştirilmeyecek**

---

## 12. ACİL DURUM PROTOKOLÜ

**Acil durum:** TransformEngine davranışı bozuldu veya kritik hata var.

### 12.1 Acil Durum Tespiti

- TransformEngine davranışı beklenmedik şekilde değişti
- Koordinat dönüşümleri hatalı
- Drag/Resize/Rotate çalışmıyor
- Veri kaybı riski var
- Build başarısız oluyor
- Runtime hata oluşuyor

### 12.2 Acil Durum Süreci (EMERGENCY ROLLBACK)

1. **DURDUR:**
   - Tüm patch işlemleri **anında durdurulur**
   - Yeni patch başlatılamaz
   - Mevcut patch işlemleri yarıda kesilir

2. **ANALİZ:**
   - Hata kaynağı analiz edilir
   - Hata kategorisi belirlenir (TransformEngine/Build/Test/Davranış)
   - Hata etkisi değerlendirilir

3. **RAPOR:**
   - Kullanıcıya detaylı rapor sunulur
   - Hata detayları açıklanır
   - Etkilenen dosyalar listelenir

4. **ROLLBACK:**
   - Son stable commit'e dönülür
   - `git reset --hard <commit-hash>` (kullanıcı onayı ile)
   - Veya `git revert` ile geri alınır
   - Veri kaybı kontrol edilir

5. **ONAY:**
   - Kullanıcı onayı alınır
   - Rollback sonrası doğrulama yapılır
   - TransformEngine davranışı kontrol edilir

6. **KURTARMA:**
   - Veri kaybı varsa kurtarma planı uygulanır
   - LocalStorage kontrol edilir
   - Backup'tan geri yükleme yapılır (varsa)

### 12.3 Acil Durum Sonrası

- Hata analizi yapılır
- Hata nedeni belirlenir
- Önleme stratejisi geliştirilir
- Ruleset güncellenir (gerekirse)

---

## 13. KURALLAR VERSİYONLAMA

**Mevcut Versiyon:** 3.0.0

**Versiyon Formatı:** `MAJOR.MINOR.PATCH`

- **MAJOR:** Büyük değişiklikler (frozen zone genişletme/daraltma, workflow değişikliği, politika değişikliği)
- **MINOR:** Yeni kurallar ekleme, mevcut kuralları güçlendirme, detaylandırma
- **PATCH:** Düzeltmeler, açıklamalar, typo düzeltmeleri

**Versiyon Geçmişi:**
- `3.0.0` — Optimized ruleset v3 (sıfır risk politikası, davranış değişikliği tanımı, detaylı test senaryoları, emergency rollback eklendi)
- `2.0.0` — Optimized ruleset v2 (multi-file operations, experimental patch engelleme, refactor-safe mod eklendi)
- `1.0.0` — İlk ruleset (CURSOR_RULESET.md)

---

## 14. SON NOTLAR

**Bu dosya yalnızca Cursor AI içindir. İnsanlar için değil.**

**Kurallar kesindir. İhlali durumunda:**
1. İşlem durdurulur
2. Kullanıcıya bildirilir
3. Onay alınır
4. Gerekirse rollback yapılır

**TransformEngine davranışını korumak her şeyden önceliklidir.**

**TransformEngine matematiğine dokunmak YASAKTIR.**

---

**Son Güncelleme:** 2025.01.19  
**Versiyon:** 3.0.0
