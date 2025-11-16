// Simple i18n helper with localStorage persistence.
// All inline comments are in English as requested.

export type Lang = "en" | "tr";
export const LANG_KEY = "nzxtLang";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    // Application title shown in header
    appTitle: "NZXT Elite Screen Customizer",
    // Language selector label
    language: "Language",
    // Reset button text - resets all settings to defaults
    reset: "Reset",
    // Confirmation message when reset button is clicked
    resetConfirm: "Are you sure? This will reset ALL settings including the URL.",
    // Legacy media URL label (may not be used in current UI)
    urlLabel: "Media URL",
    // Placeholder text for URL input field - shows accepted formats
    urlPlaceholder: "https://...mp4 / ...jpg / ...gif",
    // Save/Update button text - saves the URL input to storage
    save: "Save / Update",
    // Clear button text - clears the URL input field
    clear: "Clear",
    // Label for Background URL input field - shown above URL input
    backgroundMediaUrlLabel: "Background URL",
    // Description/hint text shown below Background URL section - explains URL usage and background color fallback
    note:
      "Enter the background media URL (video/image) you want to display. After entering the URL, you can fine-tune the position in the preview below. You can also set a background color that will be shown when no media URL is set or as a fallback.",
    // Generic "Background" label (used in tab navigation if implemented)
    background: "Background",
    // Media tab label (used in tab navigation if implemented)
    mediaTab: "Media",
    // Color tab label (used in tab navigation if implemented)
    colorTab: "Color",
    // Label for Background Color picker - shown next to color picker trigger button
    colorPickerTitle: "Background Color",
    // Description text for Background Color picker - explains when color is displayed (currently not used in UI, but available for tooltips/help text)
    colorPickerDescription: "Select a solid color for your LCD screen background. The color will be displayed when no media URL is set.",
    // Quick preset colors label (not currently used in ColorPicker component)
    quickPresets: "Quick Presets",
    // Title for Media Preview section - shows background media preview
    previewTitle: "Media Preview",
    // Title for Overlay Preview section - shows overlay metrics preview
    overlayPreviewTitle: "Overlay Preview",
    // Settings section title - shown above media positioning controls (scale, offset, align, fit)
    settingsTitle: "Media Options",
    // Alternative media options title (duplicate of settingsTitle, may be consolidated)
    mediaOptionsTitle: "Media Options",
    // Overlay settings section title - shown above overlay configuration controls
    overlaySettingsTitle: "Overlay Options",
    // Background settings section title - shown above background media positioning controls
    backgroundSectionTitle: "Background Settings",
    // Overlay section title - shown above overlay mode and metric selection controls
    overlaySectionTitle: "Overlay Settings",
    // Scale slider label - controls background media size
    scale: "Scale",
    // X-axis offset label - horizontal position adjustment for background media
    xOffset: "X Offset",
    // Y-axis offset label - vertical position adjustment for background media
    yOffset: "Y Offset",
    // Overlay X-axis offset label - horizontal position adjustment for overlay metrics
    overlayXOffset: "Overlay X Offset",
    // Overlay Y-axis offset label - vertical position adjustment for overlay metrics
    overlayYOffset: "Overlay Y Offset",
    // Alignment control label - positions background media (center, top, bottom, left, right)
    align: "Align",
    // Fit mode control label - controls how background media fills screen (cover, contain, fill)
    fit: "Fit",
    // Center alignment option
    alignCenter: "center",
    // Top alignment option
    alignTop: "top",
    // Bottom alignment option
    alignBottom: "bottom",
    // Left alignment option
    alignLeft: "left",
    // Right alignment option
    alignRight: "right",
    // Cover fit mode - fills screen, may crop content
    fitCover: "cover",
    // Contain fit mode - shows full content, may have letterboxing
    fitContain: "contain",
    // Fill fit mode - stretches to fill screen, may distort aspect ratio
    fitFill: "fill",
    // Overlay guide lines toggle label - shows/hides alignment guides in preview
    overlayGuide: "Overlay Guide",
    // Overlay mode selector label - choose between Single, Dual, or Triple metric display
    overlayMode: "Mode",
    // Primary metric selector label - first/main metric shown in overlay
    primaryReading: "Primary Reading",
    // Secondary metric selector label - second metric shown in Dual/Triple mode
    secondaryReading: "Secondary Reading",
    // Tertiary metric selector label - third metric shown in Triple mode
    tertiaryReading: "Tertiary Reading",
    // Generic number color label (used in Single mode)
    numberColor: "Number Color",
    // Generic text color label (used in Single mode)
    textColor: "Text Color",
    // Generic number size label (used in Single mode)
    numberSize: "Number Size",
    // Generic text size label (used in Single mode)
    textSize: "Text Size",
    // Primary metric number size label - controls size of main metric number
    primaryNumberSize: "Primary Number Size",
    // Primary metric text size label - controls size of main metric label text
    primaryTextSize: "Primary Text Size",
    // Secondary metric number size label - controls size of second metric number
    secondaryNumberSize: "Secondary Number Size",
    // Secondary metric text size label - controls size of second metric label text
    secondaryTextSize: "Secondary Text Size",
    // Toggle to show/hide divider line between primary and secondary metrics in Dual/Triple mode
    showDivider: "Show Divider",
    // Divider line width control - horizontal length of divider
    dividerWidth: "Divider Width",
    // Divider line thickness control - vertical thickness/height of divider
    dividerThickness: "Divider Thickness",
    // Primary metric number color picker label - color of main metric number
    primaryNumberColor: "Primary Number Color",
    // Primary metric text color picker label - color of main metric label text
    primaryTextColor: "Primary Text Color",
    // Secondary metric number color picker label - color of second metric number
    secondaryNumberColor: "Secondary Number Color",
    // Secondary metric text color picker label - color of second metric label text
    secondaryTextColor: "Secondary Text Color",
    // Tertiary metric number color picker label - color of third metric number
    tertiaryNumberColor: "Tertiary Number Color",
    // Tertiary metric text color picker label - color of third metric label text
    tertiaryTextColor: "Tertiary Text Color",
    // Tertiary metric number size label - controls size of third metric number
    tertiaryNumberSize: "Tertiary Number Size",
    // Tertiary metric text size label - controls size of third metric label text
    tertiaryTextSize: "Tertiary Text Size",
    // Gap control label - spacing between primary and divider in Dual/Triple mode
    gap: "Gap",
    // Gap between secondary and tertiary metrics in Triple mode
    gapSecondaryTertiary: "Gap (Secondary-Tertiary)",
    // Divider line color picker label - color of divider between metrics
    dividerColor: "Divider Color",
    // Spacing between divider line and secondary metrics
    dividerGap: "Divider Gap",
    // Horizontal offset for primary metric and divider group
    primaryXOffset: "Primary X Offset",
    // Vertical offset for primary metric and divider group
    primaryYOffset: "Primary Y Offset",
    // Horizontal offset for secondary metric in Dual mode
    secondaryXOffset: "Secondary X Offset",
    // Vertical offset for secondary metric in Dual mode
    secondaryYOffset: "Secondary Y Offset",
    // Horizontal offset for secondary and tertiary metrics group in Triple mode
    dualReadersXOffset: "Dual Readers X Offset",
    // Vertical offset for secondary and tertiary metrics group in Triple mode
    dualReadersYOffset: "Dual Readers Y Offset",
    // Description text shown in overlay options section - explains real-time updates
    overlayOptionsDescription: "Settings take effect immediately. Adjust overlay appearance and positioning in real-time.",
    // Button to reset overlay settings to default values
    revertToDefaults: "Revert to Defaults",
    // Generic reader options section title
    readerOptions: "Reader Options",
    // First reader options section title in Triple mode
    firstReaderOptions: "1st Reader Options",
    // Second reader options section title in Triple mode
    secondReaderOptions: "2nd Reader Options",
    // Third reader options section title in Triple mode
    thirdReaderOptions: "3rd Reader Options",
    // Warning message shown when NZXT CAM API is unavailable - displayed in preview when using mock data
    mockDataWarning: "⚠️ Running in browser mode. NZXT CAM API is not available. Displayed values are mock data and do not reflect actual system metrics.",
    // Copy button tooltip - copies color code to clipboard (used in ColorPicker component)
    copy: "Copy",
    // Paste button tooltip - pastes color code from clipboard (used in ColorPicker component)
    paste: "Paste",
  },
  tr: {
    appTitle: "NZXT Elite Screen Customizer",
    language: "Dil",
    reset: "Sıfırla",
    resetConfirm: "Emin misiniz? Bu işlem URL dahil TÜM ayarları sıfırlar.",
    urlLabel: "Medya URL",
    urlPlaceholder: "https://...mp4 / ...jpg / ...gif",
    save: "Kaydet / Güncelle",
    clear: "Temizle",
    backgroundMediaUrlLabel: "Arka Plan URL",
    note:
      "Göstermek istediğiniz arka plan medya URL'sini (video/resim) giriniz. URL'yi girdikten sonra konumu aşağıdaki önizlemede ayarlayabilirsiniz. Medya URL'si olmadığında veya yedek olarak gösterilecek bir arka plan rengi de ayarlayabilirsiniz.",
    background: "Arka Plan",
    mediaTab: "Medya",
    colorTab: "Renk",
    colorPickerTitle: "Arka Plan Rengi",
    colorPickerDescription: "LCD ekran arka planı için katı bir renk seçin. Medya URL'si ayarlanmadığında bu renk gösterilir.",
    quickPresets: "Hızlı Ayarlar",
    previewTitle: "Background Önizleme",
    overlayPreviewTitle: "Overlay Önizleme",
    settingsTitle: "Medya Seçenekleri",
    overlaySettingsTitle: "Overlay Seçenekleri",
    backgroundSectionTitle: "Arka Plan Ayarları",
    overlaySectionTitle: "Overlay Ayarları",
    scale: "Ölçek",
    xOffset: "X Ofset",
    yOffset: "Y Ofset",
    overlayXOffset: "Overlay X Ofset",
    overlayYOffset: "Overlay Y Ofset",
    align: "Hizalama",
    fit: "Sığdırma",
    alignCenter: "merkez",
    alignTop: "üst",
    alignBottom: "alt",
    alignLeft: "sol",
    alignRight: "sağ",
    fitCover: "kapla",
    fitContain: "içer",
    fitFill: "doldur",
    overlayGuide: "Rehber Çizgileri",
    overlayMode: "Mod",
    primaryReading: "Ana Metrik",
    secondaryReading: "İkincil Metrik",
    tertiaryReading: "Üçüncül Metrik",
    numberColor: "Sayı Rengi",
    textColor: "Metin Rengi",
    numberSize: "Sayı Boyutu",
    textSize: "Metin Boyutu",
    primaryNumberSize: "Ana Sayı Boyutu",
    primaryTextSize: "Ana Metin Boyutu",
    secondaryNumberSize: "İkincil Sayı Boyutu",
    secondaryTextSize: "İkincil Metin Boyutu",
    showDivider: "Ayırıcı Çizgi Göster",
    dividerWidth: "Ayırıcı Genişliği",
    dividerThickness: "Ayırıcı Kalınlığı",
    primaryNumberColor: "Ana Sayı Rengi",
    primaryTextColor: "Ana Metin Rengi",
    secondaryNumberColor: "İkincil Sayı Rengi",
    secondaryTextColor: "İkincil Metin Rengi",
    tertiaryNumberColor: "Üçüncül Sayı Rengi",
    tertiaryTextColor: "Üçüncül Metin Rengi",
    tertiaryNumberSize: "Üçüncül Sayı Boyutu",
    tertiaryTextSize: "Üçüncül Metin Boyutu",
    gap: "Mesafe",
    gapSecondaryTertiary: "Mesafe (İkincil-Üçüncül)",
    dividerColor: "Ayırıcı Rengi",
    dividerGap: "Ayırıcı Boşluğu",
    primaryXOffset: "Birincil X Ofset",
    primaryYOffset: "Birincil Y Ofset",
    secondaryXOffset: "İkincil X Ofset",
    secondaryYOffset: "İkincil Y Ofset",
    dualReadersXOffset: "İkili Okuyucular X Ofset",
    dualReadersYOffset: "İkili Okuyucular Y Ofset",
    overlayOptionsDescription: "Ayarlar anında geçerli olur. Overlay görünümünü ve konumunu gerçek zamanlı olarak ayarlayın.",
    revertToDefaults: "Varsayılana Döndür",
    readerOptions: "Okuyucu Seçenekleri",
    firstReaderOptions: "1. Okuyucu Seçenekleri",
    secondReaderOptions: "2. Okuyucu Seçenekleri",
    thirdReaderOptions: "3. Okuyucu Seçeneki",
    mockDataWarning: "⚠️ Tarayıcı modunda çalışıyor. NZXT CAM API'sine erişilemiyor. Görüntülenen değerler mock veridir ve gerçek sistem metriklerini yansıtmaz.",
    copy: "Kopyala",
    paste: "Yapıştır",
  },
};

export function getInitialLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY) as Lang | null;
  return saved === "en" || saved === "tr" ? saved : "en";
}

export function t(key: string, lang?: Lang): string {
  const l = lang ?? getInitialLang();
  return dict[l]?.[key] ?? dict.en[key] ?? key;
}

export function setLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang);
  window.dispatchEvent(
    new StorageEvent("storage", { key: LANG_KEY, newValue: lang })
  );
}
