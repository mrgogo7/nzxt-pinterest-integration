# i18n Çeviri Anahtarları Temizlik Raporu

## 📊 Özet

**Toplam Anahtar Sayısı:** ~142  
**Kullanılmayan Anahtar Sayısı:** ~50  
**Eksik Anahtar Sayısı:** 1  
**Temizlenebilir:** ~35%  

---

## 🗑️ Kullanılmayan Anahtarlar (Silinebilir)

### 1. Legacy Overlay Mode Sistemi (Eski Single/Dual/Triple Mode) - 33 anahtar

Bu anahtarlar artık kullanılmıyor çünkü overlay sistemi element-based custom mode'a geçti:

#### Primary/Secondary/Tertiary Reading Anahtarları:
- ❌ `primaryReading` - "Primary Reading" / "Ana Metrik"
- ❌ `secondaryReading` - "Secondary Reading" / "İkincil Metrik"
- ❌ `tertiaryReading` - "Tertiary Reading" / "Üçüncül Metrik"

#### Generic Color/Size Anahtarları (Eski Single Mode):
- ❌ `numberColor` - "Number Color" / "Sayı Rengi"
- ❌ `textColor` - "Text Color" / "Metin Rengi"
- ❌ `numberSize` - "Number Size" / "Sayı Boyutu"
- ❌ `textSize` - "Text Size" / "Metin Boyutu"

#### Primary/Secondary/Tertiary Specific Anahtarları:
- ❌ `primaryNumberSize` - "Primary Number Size" / "Ana Sayı Boyutu"
- ❌ `primaryTextSize` - "Primary Text Size" / "Ana Metin Boyutu"
- ❌ `secondaryNumberSize` - "Secondary Number Size" / "İkincil Sayı Boyutu"
- ❌ `secondaryTextSize` - "Secondary Text Size" / "İkincil Metin Boyutu"
- ❌ `primaryNumberColor` - "Primary Number Color" / "Ana Sayı Rengi"
- ❌ `primaryTextColor` - "Primary Text Color" / "Ana Metin Rengi"
- ❌ `secondaryNumberColor` - "Secondary Number Color" / "İkincil Sayı Rengi"
- ❌ `secondaryTextColor` - "Secondary Text Color" / "İkincil Metin Rengi"
- ❌ `tertiaryNumberColor` - "Tertiary Number Color" / "Üçüncül Sayı Rengi"
- ❌ `tertiaryTextColor` - "Tertiary Text Color" / "Üçüncül Metin Rengi"
- ❌ `tertiaryNumberSize` - "Tertiary Number Size" / "Üçüncül Sayı Boyutu"
- ❌ `tertiaryTextSize` - "Tertiary Text Size" / "Üçüncül Metin Boyutu"

#### Divider Anahtarları (Eski Sistem):
- ❌ `showDivider` - "Show Divider" / "Ayırıcı Çizgi Göster"
- ❌ `dividerWidth` - "Divider Width" / "Ayırıcı Genişliği"
- ❌ `dividerThickness` - "Divider Thickness" / "Ayırıcı Kalınlığı"
- ❌ `dividerColor` - "Divider Color" / "Ayırıcı Rengi" (artık divider element'te color property)
- ❌ `dividerGap` - "Divider Gap" / "Ayırıcı Boşluğu"

#### Gap/Spacing Anahtarları:
- ❌ `gap` - "Gap" / "Mesafe"
- ❌ `gapSecondaryTertiary` - "Gap (Secondary-Tertiary)" / "Mesafe (İkincil-Üçüncül)"

#### Offset Anahtarları (Eski Sistem):
- ❌ `primaryXOffset` - "Primary X Offset" / "Birincil X Ofset"
- ❌ `primaryYOffset` - "Primary Y Offset" / "Birincil Y Ofset"
- ❌ `secondaryXOffset` - "Secondary X Offset" / "İkincil X Ofset"
- ❌ `secondaryYOffset` - "Secondary Y Offset" / "İkincil Y Ofset"
- ❌ `dualReadersXOffset` - "Dual Readers X Offset" / "İkili Okuyucular X Ofset"
- ❌ `dualReadersYOffset` - "Dual Readers Y Offset" / "İkili Okuyucular Y Ofset"

#### Reader Options Anahtarları:
- ❌ `readerOptions` - "Reader Options" / "Okuyucu Seçenekleri"
- ❌ `firstReaderOptions` - "1st Reader Options" / "1. Okuyucu Seçenekleri"
- ❌ `secondReaderOptions` - "2nd Reader Options" / "2. Okuyucu Seçenekleri"
- ❌ `thirdReaderOptions` - "3rd Reader Options" / "3. Okuyucu Seçeneki"

### 2. Kullanılmayan UI Anahtarları - 12 anahtar

- ❌ `urlLabel` - "Media URL" / "Medya URL" (Legacy, artık `backgroundMediaUrlLabel` kullanılıyor)
- ❌ `mediaOptionsTitle` - "Media Options" / "Medya Seçenekleri" (Duplicate of `settingsTitle`, kullanılmıyor)
- ❌ `background` - "Background" / "Arka Plan" (Tab navigation için, henüz implement edilmemiş)
- ❌ `mediaTab` - "Media" / "Medya" (Tab navigation için, henüz implement edilmemiş)
- ❌ `colorTab` - "Color" / "Renk" (Tab navigation için, henüz implement edilmemiş)
- ❌ `colorPickerDescription` - Tooltip/help text için, şu an kullanılmıyor
- ❌ `quickPresets` - "Quick Presets" / "Hızlı Ayarlar" (ColorPicker'da kullanılmıyor)
- ❌ `overlayXOffset` - "Overlay X Offset" / "Overlay X Ofset" (Artık element-based offset kullanılıyor)
- ❌ `overlayYOffset` - "Overlay Y Offset" / "Overlay Y Ofset" (Artık element-based offset kullanılıyor)
- ❌ `customMode` - "Custom InfoGraphic(s)" / "Özel Bilgi Grafiği(ler)" (Artık switch'te kullanılmıyor, overlayStatusActive/Off kullanılıyor)
- ❌ `textInput` - "Text" / "Text" (Duplicate of `text`, kullanılmıyor)
- ❌ `elementCount` - "Elements" / "Öğeler" (Kullanılmıyor)

### 3. Hardcoded Değerler (i18n'e gerek yok) - 8 anahtar

Bu değerler hardcoded olarak kullanılıyor, i18n'e gerek yok:

- ❌ `alignCenter` - "center" / "merkez"
- ❌ `alignTop` - "top" / "üst"
- ❌ `alignBottom` - "bottom" / "alt"
- ❌ `alignLeft` - "left" / "sol"
- ❌ `alignRight` - "right" / "sağ"
- ❌ `fitCover` - "cover" / "kapla"
- ❌ `fitContain` - "contain" / "içer"
- ❌ `fitFill` - "fill" / "doldur"

### 4. Kullanılmayan Diğer Anahtarlar - 2 anahtar

- ❌ `revertToDefaultsCustom` - "Reset all reading and text options to defaults (keeps items)" / "Tüm reading ve text seçeneklerini varsayılanlara sıfırla (öğeleri korur)" (Kullanılmıyor, sadece `revertToDefaults` kullanılıyor)
- ❌ `appTitle` - "NZXT Elite Screen Customizer" (Hiçbir yerde kullanılmıyor)

---

## ➕ Eksik Anahtarlar (Eklenmeli)

### Kullanılıyor ama tanımlı değil:

- ⚠️ **`angle`** - "Angle" / "Açı"
  - **Kullanım:** `OverlaySettings.tsx` dosyasında 3 yerde kullanılıyor
  - **Mevcut durum:** Fallback olarak `'Angle'` hardcoded string kullanılıyor
  - **Öneri:** Hemen eklenmeli

---

## 🔄 Opsiyonel: Gelecekte Kullanılabilir Anahtarlar (Korunabilir)

Bu anahtarlar şu an kullanılmıyor ama gelecekte kullanılabilir:

- 💡 `background` - Tab navigation implement edildiğinde
- 💡 `mediaTab` - Tab navigation implement edildiğinde
- 💡 `colorTab` - Tab navigation implement edildiğinde
- 💡 `colorPickerDescription` - Tooltip/help text için

**Öneri:** Bu anahtarları koruyabilirsiniz veya gelecekte ihtiyaç olduğunda ekleyebilirsiniz.

---

## 📝 Yapılacak Değişiklikler

### 1. Silinecek Anahtarlar (Toplam: ~55 anahtar)

**i18n.ts dosyasından silinecek:**

```typescript
// Legacy Overlay Mode (33 anahtar)
primaryReading, secondaryReading, tertiaryReading,
numberColor, textColor, numberSize, textSize,
primaryNumberSize, primaryTextSize, secondaryNumberSize, secondaryTextSize,
primaryNumberColor, primaryTextColor, secondaryNumberColor, secondaryTextColor,
tertiaryNumberColor, tertiaryTextColor, tertiaryNumberSize, tertiaryTextSize,
showDivider, dividerWidth, dividerThickness, dividerColor, dividerGap,
gap, gapSecondaryTertiary,
primaryXOffset, primaryYOffset, secondaryXOffset, secondaryYOffset,
dualReadersXOffset, dualReadersYOffset,
readerOptions, firstReaderOptions, secondReaderOptions, thirdReaderOptions

// Kullanılmayan UI (12 anahtar)
urlLabel, mediaOptionsTitle, background, mediaTab, colorTab,
colorPickerDescription, quickPresets, overlayXOffset, overlayYOffset,
customMode, textInput, elementCount

// Hardcoded değerler (8 anahtar)
alignCenter, alignTop, alignBottom, alignLeft, alignRight,
fitCover, fitContain, fitFill

// Diğer (2 anahtar)
revertToDefaultsCustom, appTitle
```

### 2. Eklenecek Anahtarlar

**i18n.ts dosyasına eklenecek:**

```typescript
// en:
angle: "Angle",

// tr:
angle: "Açı",
```

### 3. OverlaySettings.tsx Güncellemesi

`angle` anahtarı için fallback kaldırılacak:

```typescript
// ÖNCE:
label={t('angle', lang) || 'Angle'}

// SONRA:
label={t('angle', lang)}
```

---

## ✅ Temizlik Sonrası Beklenen Sonuçlar

- **Dosya boyutu:** ~%35 azalma
- **Bakım kolaylığı:** Artacak
- **Karışıklık:** Azalacak
- **Performans:** Minimal iyileşme (dictionary lookup)

---

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Migration kontrolü:** Eski overlay mode sisteminden migration yapan kodlar varsa kontrol edilmeli
2. **Test:** Tüm UI'lar test edilmeli, eksik çeviri olmamalı
3. **Backup:** Değişikliklerden önce backup alınmalı

---

## 📊 İstatistikler

- **Toplam Anahtar:** ~142
- **Kullanılan:** ~87
- **Kullanılmayan:** ~55
- **Eksik:** 1
- **Temizlenebilir Oran:** ~38.7%

---

**Rapor Tarihi:** 2024  
**Hazırlayan:** AI Assistant  
**Durum:** Hazır - Uygulanabilir

