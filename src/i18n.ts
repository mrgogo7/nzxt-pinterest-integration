// Simple i18n helper with localStorage persistence.
// All inline comments are in English as requested.

export type Lang = "en" | "tr";
export const LANG_KEY = "nzxtLang";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    appTitle: "NZXT Media Config",
    language: "Language",
    reset: "Reset",
    resetConfirm: "Are you sure? This will reset ALL settings including the URL.",
    urlLabel: "Media URL",
    urlPlaceholder: "https://...mp4 / ...jpg / ...gif",
    save: "Save / Update",
    note:
      "Enter the URL you want to display on your device. After entering the URL, you can fine-tune the position in the preview below.",
    previewTitle: "Background Preview",
    overlayPreviewTitle: "Overlay Preview",
    settingsTitle: "Background Settings",
    overlaySettingsTitle: "Overlay Options",
    backgroundSectionTitle: "Background Settings",
    overlaySectionTitle: "Overlay Settings",
    scale: "Scale",
    xOffset: "X Offset",
    yOffset: "Y Offset",
    overlayXOffset: "Overlay X Offset",
    overlayYOffset: "Overlay Y Offset",
    align: "Align",
    fit: "Fit",
    alignCenter: "center",
    alignTop: "top",
    alignBottom: "bottom",
    alignLeft: "left",
    alignRight: "right",
    fitCover: "cover",
    fitContain: "contain",
    fitFill: "fill",
    overlayGuide: "Overlay Guide",
    overlayMode: "Overlay",
    primaryReading: "Primary Reading",
    secondaryReading: "Secondary Reading",
    tertiaryReading: "Tertiary Reading",
    numberColor: "Number Color",
    textColor: "Text Color",
    numberSize: "Number Size",
    textSize: "Text Size",
  },
  tr: {
    appTitle: "NZXT Medya Ayarları",
    language: "Dil",
    reset: "Sıfırla",
    resetConfirm: "Emin misiniz? Bu işlem URL dahil TÜM ayarları sıfırlar.",
    urlLabel: "Medya URL",
    urlPlaceholder: "https://...mp4 / ...jpg / ...gif",
    save: "Kaydet / Güncelle",
    note:
      "Cihazınızda göstermek istediğiniz URL’yi giriniz. URL’yi girdikten sonra konumu aşağıdaki önizlemede ayarlayabilirsiniz.",
    previewTitle: "Arka Plan Önizleme",
    overlayPreviewTitle: "Overlay Önizleme",
    settingsTitle: "Arka Plan Ayarları",
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
    overlayMode: "Overlay",
    primaryReading: "Ana Metrik",
    secondaryReading: "İkincil Metrik",
    tertiaryReading: "Üçüncül Metrik",
    numberColor: "Sayı Rengi",
    textColor: "Metin Rengi",
    numberSize: "Sayı Boyutu",
    textSize: "Metin Boyutu",
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
