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
    save: "Update",
    // Clear button text - clears the URL input field
    clear: "Clear",
    // Label for Background URL input field - shown above URL input
    backgroundMediaUrlLabel: "URL",
    // Description text shown below Background Settings title - explains URL usage and background color fallback
    backgroundSectionDescription:
      "You can add a media URL (video/image) for the background or use only a background color. You can adjust media and overlay position settings in real-time from the preview areas below.",
    // Generic "Background" label (used in tab navigation if implemented)
    background: "Background",
    // Media tab label (used in tab navigation if implemented)
    mediaTab: "Media",
    // Color tab label (used in tab navigation if implemented)
    colorTab: "Color",
    // Label for Background Color picker - shown next to color picker trigger button
    colorPickerTitle: "Color",
    // Tooltip text for Background Color picker
    colorPickerTooltip: "This selection determines your background color.",
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
    overlayOptionsDescription: "Settings take effect immediately. Use the plus button to add sensors, text, and other elements.",
    overlayOptionsResetLink: "Click to reset all element values to their default settings.",
    // Message shown when overlay is disabled - prompts user to activate overlay first
    overlayActivateFirst: "Please activate the overlay first. ",
    // Switch status when overlay is off
    overlayStatusOff: "Off",
    // Switch status when overlay is active
    overlayStatusActive: "Active",
    // Button to reset overlay settings to default values
    revertToDefaults: "Reset all element values to their default settings",
    resetElementsConfirmTitle: "Reset Element Values",
    resetElementsConfirm: "Are you sure you want to reset all element values to their default settings? This action cannot be undone.",
    removeElementConfirmTitle: "Remove Element",
    removeElementConfirm: "Are you sure you want to remove this element? This action cannot be undone.",
    remove: "Remove",
    // Warning message shown when NZXT CAM API is unavailable - displayed in preview when using mock data
    mockDataWarning: "⚠️ Running in browser mode. NZXT CAM API is not available. Displayed values are mock data and do not reflect actual system metrics.",
    // Copy button tooltip - copies color code to clipboard (used in ColorPicker component)
    copy: "Copy",
    // Cut button tooltip - cuts text to clipboard (used in context menu)
    cut: "Cut",
    // Paste button tooltip - pastes color code from clipboard (used in ColorPicker component)
    paste: "Paste",
    // Select All button tooltip - selects all text in input field (used in context menu)
    selectAll: "Select All",
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
    sensor: "Sensor",
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
    // Tooltips for element settings
    tooltipSensor: "Select which system metric to display",
    tooltipAngle: "Rotation angle in degrees (0-360)",
    tooltipSize: "Font size for the displayed value",
    tooltipXOffset: "Horizontal position offset",
    tooltipYOffset: "Vertical position offset",
    tooltipText: "Text content to display",
    tooltipColor: "Color of the element",
    tooltipThickness: "Line thickness for divider",
    tooltipDividerLength: "Length of the divider line",
    // Reset tooltips
    resetToDefault: "Reset to default value",
    // Social media link tooltips
    tooltipGitHub: "GitHub",
    tooltipInstagram: "Instagram",
    tooltipLinkedIn: "LinkedIn",
    tooltipSponsor: "Sponsor",
    // Preset Profiles
    presetProfiles: "Preset Profiles",
    presetManager: "Preset Manager",
    presetExport: "Export",
    presetImport: "Import",
    presetExportTitle: "Export Preset",
    presetNameLabel: "Preset Name",
    presetNamePlaceholder: "Enter preset name...",
    presetExportError: "Failed to export preset file",
    presetImportError: "Failed to import preset file. Please check the file format.",
    presetImportSuccess: "Preset imported successfully",
    presetImportValidationErrors: "Preset validation failed. Please check the file.",
    presetImportWarnings: "Preset imported with warnings. Some values were adjusted.",
    presetImportNormalized: "Some preset values were normalized to valid ranges.",
    presetApply: "Apply",
    presetRename: "Rename",
    presetDuplicate: "Duplicate",
    presetDelete: "Delete",
    presetMoreActions: "More actions",
    presetActive: "Active",
    presetDefault: "Default",
    presetDefaultPresets: "Default Presets",
    presetUserPresets: "Your Presets",
    presetListEmpty: "No presets yet. Export your current settings to create one.",
    presetDeleteConfirm: "Are you sure you want to delete \"{name}\"?",
    presetConflictTitle: "Preset Already Exists",
    presetConflictMessage: "A preset named \"{name}\" already exists. What would you like to do?",
    presetOverwrite: "Overwrite",
    presetCreateDuplicate: "Create Duplicate",
    cancel: "Cancel",
    close: "Close",
    export: "Export",
  },
  tr: {
    language: "Dil",
    reset: "Sıfırla",
    resetConfirm: "Emin misiniz? Bu işlem URL dahil TÜM ayarları sıfırlar.",
    urlPlaceholder: "https://...mp4 / ...jpg / ...gif",
    save: "Güncelle",
    clear: "Temizle",
    backgroundMediaUrlLabel: "URL",
    backgroundSectionDescription:
      "Arka plan için bir medya URL'si (video/resim) ekleyebilir veya yalnızca arka plan rengi kullanabilirsiniz. Medya ve overlay konum ayarlarını, aşağıdaki önizleme alanları üzerinden gerçek zamanlı olarak düzenleyebilirsiniz.",
    background: "Arka Plan",
    mediaTab: "Medya",
    colorTab: "Renk",
    colorPickerTitle: "Arkaplan",
    // Tooltip text for Background Color picker
    colorPickerTooltip: "Bu seçim arkaplan renginizi belirler",
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
    overlayOptionsDescription: "Ayarlar anında geçerli olur. Artı butonunu kullanarak sensör, metin ve diğer elementleri ekleyebilirsiniz.",
    overlayOptionsResetLink: "Tüm element değerlerini varsayılan ayarlara sıfırlamak için tıklayın.",
    overlayActivateFirst: "Lütfen önce overlay'ı aktif ediniz. ",
    overlayStatusOff: "Kapalı",
    overlayStatusActive: "Aktif",
    revertToDefaults: "Tüm element değerlerini varsayılan ayarlara sıfırla",
    resetElementsConfirmTitle: "Element Değerlerini Sıfırla",
    resetElementsConfirm: "Tüm element değerlerini varsayılan ayarlara sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    removeElementConfirmTitle: "Element Kaldır",
    removeElementConfirm: "Bu elementi kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    remove: "Kaldır",
    mockDataWarning: "⚠️ Tarayıcı modunda çalışıyor. NZXT CAM API'sine erişilemiyor. Görüntülenen değerler mock veridir ve gerçek sistem metriklerini yansıtmaz.",
    copy: "Kopyala",
    cut: "Kes",
    paste: "Yapıştır",
    selectAll: "Tümünü Seç",
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
    sensor: "Sensör",
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
    // Tooltips for element settings
    tooltipSensor: "Gösterilecek sistem metriklerini seçin",
    tooltipAngle: "Derece cinsinden döndürme açısı (0-360)",
    tooltipSize: "Gösterilen değer için font boyutu",
    tooltipXOffset: "Yatay konum ofseti",
    tooltipYOffset: "Dikey konum ofseti",
    tooltipText: "Gösterilecek metin içeriği",
    tooltipColor: "Element rengi",
    tooltipThickness: "Divider için çizgi kalınlığı",
    tooltipDividerLength: "Divider çizgisinin uzunluğu",
    // Reset tooltips
    resetToDefault: "Varsayılan değere sıfırla",
    // Social media link tooltips
    tooltipGitHub: "GitHub",
    tooltipInstagram: "Instagram",
    tooltipLinkedIn: "LinkedIn",
    tooltipSponsor: "Sponsor",
    // Preset Profiles
    presetProfiles: "Preset Profilleri",
    presetManager: "Preset Yöneticisi",
    presetExport: "Dışa Aktar",
    presetImport: "İçe Aktar",
    presetExportTitle: "Preset Dışa Aktar",
    presetNameLabel: "Preset Adı",
    presetNamePlaceholder: "Preset adını girin...",
    presetExportError: "Preset dosyası dışa aktarılamadı",
    presetImportError: "Preset dosyası içe aktarılamadı. Lütfen dosya formatını kontrol edin.",
    presetImportSuccess: "Preset başarıyla içe aktarıldı",
    presetImportValidationErrors: "Preset doğrulaması başarısız. Lütfen dosyayı kontrol edin.",
    presetImportWarnings: "Preset uyarılarla içe aktarıldı. Bazı değerler ayarlandı.",
    presetImportNormalized: "Bazı preset değerleri geçerli aralıklara normalize edildi.",
    presetApply: "Uygula",
    presetRename: "Yeniden Adlandır",
    presetDuplicate: "Kopyala",
    presetDelete: "Sil",
    presetMoreActions: "Daha fazla işlem",
    presetActive: "Aktif",
    presetDefault: "Varsayılan",
    presetDefaultPresets: "Varsayılan Preset'ler",
    presetUserPresets: "Hazır Ayarlar",
    presetListEmpty: "Henüz preset yok. Mevcut ayarlarınızı dışa aktararak bir tane oluşturun.",
    presetDeleteConfirm: "\"{name}\" adlı preset'i silmek istediğinize emin misiniz?",
    presetConflictTitle: "Preset Zaten Var",
    presetConflictMessage: "\"{name}\" adında bir preset zaten mevcut. Ne yapmak istersiniz?",
    presetOverwrite: "Üzerine Yaz",
    presetCreateDuplicate: "Kopya Oluştur",
    cancel: "İptal",
    close: "Kapat",
    export: "Dışa Aktar",
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
