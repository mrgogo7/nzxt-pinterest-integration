// Simple i18n helper with localStorage persistence.
// All inline comments are in English as requested.

export type Lang = "en" | "tr";
export const LANG_KEY = "nzxtLang";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    // Language selector label
    language: "Language",
    // Reset button text - resets all settings to defaults
    reset: "Reset",
    // Confirmation message when reset button is clicked
    resetConfirm: "Are you sure? This will reset ALL settings including the URL.",
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
    // Title for Media Preview section - shows background media preview
    previewTitle: "Media Preview",
    // Title for Overlay Preview section - shows overlay metrics preview
    overlayPreviewTitle: "Overlay Preview",
    // Settings section title - shown above media positioning controls (scale, offset, align, fit)
    settingsTitle: "Media Options",
    // Overlay settings section title - shown above overlay configuration controls
    overlaySettingsTitle: "Overlay Options",
    // Overlay title when disabled
    overlayTitle: "Overlay",
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
    // Alignment control label - positions background media (center, top, bottom, left, right)
    align: "Align",
    // Fit mode control label - controls how background media fills screen (cover, contain, fill)
    fit: "Fit",
    // Align tooltips - shown on hover for alignment buttons
    alignCenter: "Center",
    alignTop: "Top",
    alignBottom: "Bottom",
    alignLeft: "Left",
    alignRight: "Right",
    // Fit tooltips - shown on hover for fit mode buttons
    fitCover: "Cover",
    fitContain: "Contain",
    fitFill: "Fill",
    // Overlay guide lines toggle label - shows/hides alignment guides in preview
    overlayGuide: "Overlay Guide",
    // Overlay mode selector label - choose between Single, Dual, or Triple metric display
    overlayMode: "Mode",
    // Description text shown in overlay options section - explains real-time updates
    overlayOptionsDescription: "Settings take effect immediately. Adjust overlay appearance and positioning in real-time.",
    // Message shown when overlay is disabled - prompts user to activate overlay first
    overlayActivateFirst: "Please activate the overlay first. ",
    // Switch status when overlay is off
    overlayStatusOff: "Off",
    // Switch status when overlay is active
    overlayStatusActive: "Active",
    // Button to reset overlay settings to default values
    revertToDefaults: "Revert to Defaults",
    // Warning message shown when NZXT CAM API is unavailable - displayed in preview when using mock data
    mockDataWarning: "⚠️ Running in browser mode. NZXT CAM API is not available. Displayed values are mock data and do not reflect actual system metrics.",
    // Copy button tooltip - copies color code to clipboard (used in ColorPicker component)
    copy: "Copy",
    // Paste button tooltip - pastes color code from clipboard (used in ColorPicker component)
    paste: "Paste",
    // Message shown when resolving Pinterest URL - displayed during URL extraction
    resolvingUrl: "Please wait, URL is being resolved...",
    // Success message when URL is resolved successfully
    urlResolved: "URL resolved successfully",
    // Error message when URL resolution fails
    urlResolveError: "Failed to resolve URL. Please check the URL or try again later.",
    // Timeout message when URL resolution takes too long
    urlResolveTimeout: "URL resolution timed out. Please try again.",
    // Custom mode specific translations
    addReading: "Add Reading",
    removeReading: "Remove Reading",
    firstReading: "1st Reading",
    secondReading: "2nd Reading",
    thirdReading: "3rd Reading",
    fourthReading: "4th Reading",
    fifthReading: "5th Reading",
    sixthReading: "6th Reading",
    seventhReading: "7th Reading",
    eighthReading: "8th Reading",
    moveReadingUp: "Move Up",
    moveReadingDown: "Move Down",
    // Custom mode simplified labels
    reading: "Reading",
    color: "Color",
    size: "Size",
    customXOffset: "X Offset",
    customYOffset: "Y Offset",
    // Custom text labels
    addText: "Add Text",
    removeText: "Remove Text",
    firstText: "1st Text",
    secondText: "2nd Text",
    thirdText: "3rd Text",
    fourthText: "4th Text",
    text: "Text",
    moveTextUp: "Move Up",
    moveTextDown: "Move Down",
    textInputPlaceholder: "Please enter text (max 120 characters)",
    // Metric selection options
    metricCpuTemp: "CPU Temperature",
    metricCpuLoad: "CPU Load",
    metricCpuClock: "CPU Clock",
    metricLiquidTemp: "Liquid Temperature",
    metricGpuTemp: "GPU Temperature",
    metricGpuLoad: "GPU Load",
    metricGpuClock: "GPU Clock",
    // Element management
    noElements: "No elements added yet. Use the buttons above to add readings or text.",
    // Element management
    addElement: "Add Element",
    // Divider labels
    addDivider: "Add Divider",
    removeDivider: "Remove Divider",
    divider: "Divider",
    firstDivider: "1st Divider",
    secondDivider: "2nd Divider",
    thirdDivider: "3rd Divider",
    fourthDivider: "4th Divider",
    moveDividerUp: "Move Up",
    moveDividerDown: "Move Down",
    thickness: "Thickness",
    dividerLength: "Length",
    // Angle control label - rotation angle for overlay elements
    angle: "Angle",
    // Reset tooltips
    resetToDefault: "Reset to default value",
    // Social media link tooltips
    tooltipGitHub: "GitHub",
    tooltipInstagram: "Instagram",
    tooltipLinkedIn: "LinkedIn",
    tooltipSponsor: "Sponsor",
  },
  tr: {
    language: "Dil",
    reset: "Sıfırla",
    resetConfirm: "Emin misiniz? Bu işlem URL dahil TÜM ayarları sıfırlar.",
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
    previewTitle: "Background Önizleme",
    overlayPreviewTitle: "Overlay Önizleme",
    settingsTitle: "Medya Seçenekleri",
    overlaySettingsTitle: "Overlay Seçenekleri",
    overlayTitle: "Overlay",
    backgroundSectionTitle: "Arka Plan Ayarları",
    overlaySectionTitle: "Overlay Ayarları",
    scale: "Ölçek",
    xOffset: "X Ofset",
    yOffset: "Y Ofset",
    align: "Hizalama",
    fit: "Sığdırma",
    // Align tooltips - shown on hover for alignment buttons
    alignCenter: "Merkez",
    alignTop: "Üst",
    alignBottom: "Alt",
    alignLeft: "Sol",
    alignRight: "Sağ",
    // Fit tooltips - shown on hover for fit mode buttons
    fitCover: "Kapla",
    fitContain: "İçer",
    fitFill: "Doldur",
    overlayGuide: "Rehber Çizgileri",
    overlayMode: "Mod",
    overlayOptionsDescription: "Ayarlar anında geçerli olur. Overlay görünümünü ve konumunu gerçek zamanlı olarak ayarlayın.",
    overlayActivateFirst: "Lütfen önce overlay'ı aktif ediniz. ",
    overlayStatusOff: "Kapalı",
    overlayStatusActive: "Aktif",
    revertToDefaults: "Varsayılana Döndür",
    mockDataWarning: "⚠️ Tarayıcı modunda çalışıyor. NZXT CAM API'sine erişilemiyor. Görüntülenen değerler mock veridir ve gerçek sistem metriklerini yansıtmaz.",
    copy: "Kopyala",
    paste: "Yapıştır",
    // Message shown when resolving Pinterest URL - displayed during URL extraction
    resolvingUrl: "Lütfen bekleyin, URL çözümleniyor...",
    // Success message when URL is resolved successfully
    urlResolved: "URL başarıyla çözümlendi",
    // Error message when URL resolution fails
    urlResolveError: "URL çözümlenemedi. Lütfen URL'yi kontrol edin veya daha sonra tekrar deneyin.",
    // Timeout message when URL resolution takes too long
    urlResolveTimeout: "URL çözümleme zaman aşımına uğradı. Lütfen tekrar deneyin.",
    // Custom mode specific translations
    addReading: "Reading Ekle",
    removeReading: "Reading Kaldır",
    firstReading: "1. Reading",
    secondReading: "2. Reading",
    thirdReading: "3. Reading",
    fourthReading: "4. Reading",
    fifthReading: "5. Reading",
    sixthReading: "6. Reading",
    seventhReading: "7. Reading",
    eighthReading: "8. Reading",
    moveReadingUp: "Yukarı Taşı",
    moveReadingDown: "Aşağı Taşı",
    // Custom mode simplified labels
    reading: "Reading",
    color: "Renk",
    size: "Boyut",
    customXOffset: "X Ofset",
    customYOffset: "Y Ofset",
    // Custom text labels
    addText: "Text Ekle",
    removeText: "Text Kaldır",
    firstText: "1. Text",
    secondText: "2. Text",
    thirdText: "3. Text",
    fourthText: "4. Text",
    text: "Text",
    moveTextUp: "Yukarı Taşı",
    moveTextDown: "Aşağı Taşı",
    textInputPlaceholder: "Lütfen metin giriniz (maksimum 120 karakter)",
    // Metric selection options
    metricCpuTemp: "CPU Sıcaklığı",
    metricCpuLoad: "CPU Yükü",
    metricCpuClock: "CPU Saat Hızı",
    metricLiquidTemp: "Sıvı Sıcaklığı",
    metricGpuTemp: "GPU Sıcaklığı",
    metricGpuLoad: "GPU Yükü",
    metricGpuClock: "GPU Saat Hızı",
    // Element management
    noElements: "Henüz öğe eklenmedi. Yukarıdaki butonları kullanarak reading veya text ekleyin.",
    // Element management
    addElement: "Element Ekle",
    // Divider labels
    addDivider: "Divider Ekle",
    removeDivider: "Divider Kaldır",
    divider: "Divider",
    firstDivider: "1. Divider",
    secondDivider: "2. Divider",
    thirdDivider: "3. Divider",
    fourthDivider: "4. Divider",
    moveDividerUp: "Yukarı Taşı",
    moveDividerDown: "Aşağı Taşı",
    thickness: "Kalınlık",
    dividerLength: "Uzunluk",
    // Angle control label - rotation angle for overlay elements
    angle: "Açı",
    // Reset tooltips
    resetToDefault: "Varsayılan değere sıfırla",
    // Social media link tooltips
    tooltipGitHub: "GitHub",
    tooltipInstagram: "Instagram",
    tooltipLinkedIn: "LinkedIn",
    tooltipSponsor: "Sponsor",
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
