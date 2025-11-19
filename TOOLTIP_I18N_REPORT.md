# Tooltip i18n Eksik Anahtarlar Raporu

## 🔍 Analiz Tarihi
2024

## 📊 Özet

**Toplam Tooltip Kullanımı:** 15+  
**Eksik i18n Anahtarları:** 10  
**Kullanılan ama Tanımlı Olmayan:** 10  

---

## ❌ Eksik Tooltip Anahtarları

### 1. BackgroundSettings.tsx - Align Tooltip'leri (5 anahtar)

**Dosya:** `src/ui/components/ConfigPreview/BackgroundSettings.tsx`  
**Satır:** 112

**Kullanım:**
```typescript
data-tooltip-content={t(`align${key[0].toUpperCase() + key.slice(1)}`, lang)}
```

**Eksik Anahtarlar:**
- ❌ `alignCenter` - "Center" / "Merkez"
- ❌ `alignTop` - "Top" / "Üst"
- ❌ `alignBottom` - "Bottom" / "Alt"
- ❌ `alignLeft` - "Left" / "Sol"
- ❌ `alignRight` - "Right" / "Sağ"

**Durum:** Bu anahtarlar daha önce silindi çünkü hardcoded değerler olarak kullanıldığı düşünüldü, ancak tooltip'ler için hala gerekli!

---

### 2. BackgroundSettings.tsx - Fit Tooltip'leri (3 anahtar)

**Dosya:** `src/ui/components/ConfigPreview/BackgroundSettings.tsx`  
**Satır:** 143

**Kullanım:**
```typescript
data-tooltip-content={t(`fit${key[0].toUpperCase() + key.slice(1)}`, lang)}
```

**Eksik Anahtarlar:**
- ❌ `fitCover` - "Cover" / "Kapla"
- ❌ `fitContain` - "Contain" / "İçer"
- ❌ `fitFill` - "Fill" / "Doldur"

**Durum:** Bu anahtarlar da daha önce silindi, ancak tooltip'ler için gerekli!

---

### 3. Config.tsx - Social Media Link Tooltip'leri (4 anahtar)

**Dosya:** `src/ui/Config.tsx`  
**Satırlar:** 158, 171, 184, 197

**Kullanım:**
```typescript
title="GitHub"
title="Instagram"
title="LinkedIn"
title="Sponsor"
```

**Eksik Anahtarlar:**
- ❌ `tooltipGitHub` - "GitHub" / "GitHub"
- ❌ `tooltipInstagram` - "Instagram" / "Instagram"
- ❌ `tooltipLinkedIn` - "LinkedIn" / "LinkedIn"
- ❌ `tooltipSponsor` - "Sponsor" / "Sponsor"

**Durum:** Bu tooltip'ler şu an hardcoded string olarak kullanılıyor, i18n'e taşınmalı.

**Not:** Bu tooltip'ler `title` attribute olarak kullanılıyor, `data-tooltip-content` değil. Ancak yine de çok dilli olmalı.

---

## ✅ Mevcut Tooltip Anahtarları (Kullanılıyor)

Aşağıdaki anahtarlar zaten i18n.ts'de tanımlı ve kullanılıyor:

- ✅ `reset` - Reset button tooltip
- ✅ `resetToDefault` - Reset to default tooltip
- ✅ `clear` - Clear button tooltip
- ✅ `copy` - Copy button tooltip (ColorPicker)
- ✅ `paste` - Paste button tooltip (ColorPicker)
- ✅ `revertToDefaults` - Revert to defaults tooltip
- ✅ `moveReadingUp` - Move reading up tooltip
- ✅ `moveReadingDown` - Move reading down tooltip
- ✅ `removeReading` - Remove reading tooltip
- ✅ `moveTextUp` - Move text up tooltip
- ✅ `moveTextDown` - Move text down tooltip
- ✅ `removeText` - Remove text tooltip
- ✅ `moveDividerUp` - Move divider up tooltip
- ✅ `moveDividerDown` - Move divider down tooltip
- ✅ `removeDivider` - Remove divider tooltip

---

## 📝 Yapılacak Değişiklikler

### 1. i18n.ts'ye Eklenecek Anahtarlar

**EN:**
```typescript
// Align tooltips
alignCenter: "Center",
alignTop: "Top",
alignBottom: "Bottom",
alignLeft: "Left",
alignRight: "Right",

// Fit tooltips
fitCover: "Cover",
fitContain: "Contain",
fitFill: "Fill",

// Social media tooltips
tooltipGitHub: "GitHub",
tooltipInstagram: "Instagram",
tooltipLinkedIn: "LinkedIn",
tooltipSponsor: "Sponsor",
```

**TR:**
```typescript
// Align tooltips
alignCenter: "Merkez",
alignTop: "Üst",
alignBottom: "Alt",
alignLeft: "Sol",
alignRight: "Sağ",

// Fit tooltips
fitCover: "Kapla",
fitContain: "İçer",
fitFill: "Doldur",

// Social media tooltips
tooltipGitHub: "GitHub",
tooltipInstagram: "Instagram",
tooltipLinkedIn: "LinkedIn",
tooltipSponsor: "Sponsor",
```

### 2. Config.tsx Güncellemesi

**Değiştirilecek:**
```typescript
// ÖNCE:
title="GitHub"
title="Instagram"
title="LinkedIn"
title="Sponsor"

// SONRA:
title={t('tooltipGitHub', lang)}
title={t('tooltipInstagram', lang)}
title={t('tooltipLinkedIn', lang)}
title={t('tooltipSponsor', lang)}
```

---

## ⚠️ Önemli Notlar

1. **Align ve Fit Anahtarları:** Bu anahtarlar daha önce silindi çünkü hardcoded değerler olarak kullanıldığı düşünüldü. Ancak tooltip'ler için hala gerekli! Bu yüzden geri eklenmeli.

2. **Social Media Tooltip'leri:** Bu tooltip'ler şu an `title` attribute olarak kullanılıyor. Bunlar da i18n'e taşınmalı.

3. **Tooltip ID'leri:** Tooltip ID'leri zaten tanımlı (ConfigPreview.tsx'te), sadece içerik anahtarları eksik.

---

## 📊 İstatistikler

- **Toplam Eksik Anahtar:** 12
- **Align Tooltip'leri:** 5
- **Fit Tooltip'leri:** 3
- **Social Media Tooltip'leri:** 4

---

**Rapor Durumu:** Hazır - Uygulanabilir

