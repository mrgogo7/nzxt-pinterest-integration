# 🎨 NZXT Elite Screen Customizer (NZXT-ESC) v5.11.15

**The Ultimate Customization Tool for NZXT Kraken Elite LCD Displays**

Transform your NZXT Kraken Elite LCD into a personalized information hub with real-time system monitoring, custom media display, and advanced overlay configurations. NZXT-ESC provides complete control over your LCD screen with drag-and-drop positioning, live preview, and instant synchronization.

---

<p>
  <img src="https://raw.githubusercontent.com/mrgogo7/nzxt-esc/main/docs/demo.gif" width="540" alt="NZXT Elite Screen Customizer Preview">
  <img src="https://raw.githubusercontent.com/mrgogo7/nzxt-esc/main/docs/demolive.gif" width="240" alt="NZXT Elite Screen Customizer Live Preview">
  <br>
  <em>Live NZXT LCD and configuration preview</em>
</p>

---

## ✨ Key Features

### 🎥 Media Display
- **Multi-format support** — MP4, JPG, GIF
- **Real-time circular preview** — See exactly how your media will appear on the LCD
- **Drag & drop positioning** — Intuitive visual positioning
- **Advanced scaling** — Precise scale, offset, and alignment controls
- **Fit modes** — `cover`, `contain`, `fill` for perfect media display

### 📊 System Monitoring Overlays
- **Single, Dual, and Triple infographic modes** — Display 1, 2, or 3 metrics simultaneously
- **Real-time monitoring** — CPU/GPU temperature, load, clock speeds, liquid temperature
- **Customizable appearance** — Individual colors, sizes, and positioning for each metric
- **Smart positioning** — Independent offset controls for primary and secondary/tertiary groups
- **Divider customization** — Adjustable width, thickness, color, and gap
- **Live data sync** — Real monitoring data in NZXT CAM, animated mock data in browser

### 🎨 Advanced Customization
- **Independent metric groups** — Primary, secondary, and tertiary metrics with separate controls
- **Precise positioning** — X/Y offset controls for each metric group
- **Visual dividers** — Customizable dividers between metric groups
- **Color customization** — Individual colors for numbers and labels
- **Size controls** — Separate font sizes for numbers and text labels
- **Gap management** — Fine-tune spacing between metrics and dividers

### ⚡ Real-time Synchronization
- **100ms update interval** — Instant feedback on all changes
- **Cross-process sync** — Seamless synchronization between Config and Display pages
- **Persistent storage** — Auto-save via localStorage with cookie fallback
- **Live preview** — See changes instantly in both preview and actual LCD

### 🌍 User Experience
- **Multi-language support** — English and Turkish
- **Sticky preview** — Overlay preview stays visible while scrolling
- **Revert to defaults** — One-click reset for current mode settings
- **Visual feedback** — Mock data warnings when running in browser mode
- **Responsive design** — Optimized for NZXT CAM integration

---

## 🚀 Quick Start

### Method 1: Direct Launch (via NZXT CAM)

Copy and paste this into your browser's address bar:

```
nzxt-cam://action/load-web-integration?url=https://mrgogo7.github.io/nzxt-esc/
```

Press **Enter** to launch NZXT CAM and load the integration automatically.

### Method 2: Manual Installation

1. Open **NZXT CAM** → **Settings** → **Web Integrations** → **+ Add Custom Integration**
2. Paste this URL: `https://mrgogo7.github.io/nzxt-esc/`
3. Click **Add**, then open the integration from the list
4. Your NZXT Kraken Elite LCD will now display **NZXT Elite Screen Customizer**

---

## 📖 Usage Guide

### Setting Up Media Display

1. **Enter Media URL** — Paste your MP4, JPG, or GIF URL
2. **Position Media** — Drag the preview circle to position your media
3. **Adjust Scale** — Use the zoom buttons or scale input
4. **Choose Fit Mode** — Select `cover`, `contain`, or `fill`
5. **Fine-tune Alignment** — Use X/Y offset controls for pixel-perfect positioning

### Configuring System Monitoring Overlays

#### Single Mode
- Display one metric (CPU/GPU temp, load, clock, or liquid temp)
- Simple, focused display
- Full customization of colors, sizes, and position

#### Dual Mode
- Display two metrics side by side
- **Primary group** (left): Moves with divider, customizable gap
- **Secondary group** (right): Independent positioning
- Separate colors, sizes, and offsets for each metric

#### Triple Mode
- Display three metrics: one primary (large) and two secondary/tertiary (smaller)
- **Primary group** (left): Moves with divider, customizable gap
- **Dual Readers group** (right): Secondary and tertiary metrics move together
- Complete independent control over all three metrics

### Advanced Overlay Features

- **Divider Controls** — Show/hide, adjust width, thickness, color, and gap
- **Offset Management** — Primary X/Y offset for primary+divider, separate offsets for secondary/tertiary
- **Visual Grouping** — Labeled dividers show "1st Reader Options", "2nd Reader Options"
- **Real-time Updates** — All changes reflect instantly on the LCD

---

## 🧰 Technical Details

### Architecture

NZXT-ESC uses the same storage event system as NZXT Web Integration, enabling instant synchronization between the **Config Page** and the **LCD Display**. When you adjust settings, updates are throttled to 100ms intervals for optimal performance.

### Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | Modern UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Fast build tool and dev server |
| **Lucide Icons** | Modern icon library |
| **CSS Modules** | Scoped styling |
| **NZXT API** | Real-time monitoring data and LCD sync |

### Project Structure

```
src/
├── ui/
│   ├── components/
│   │   ├── ConfigPreview.tsx    # Main configuration UI
│   │   ├── SingleInfographic.tsx # Single metric overlay
│   │   ├── DualInfographic.tsx   # Dual metric overlay
│   │   ├── TripleInfographic.tsx # Triple metric overlay
│   │   ├── KrakenOverlay.tsx     # LCD display component
│   │   ├── MediaRenderer.tsx     # Media rendering
│   │   └── ColorPicker.tsx       # Color selection
│   └── styles/
│       └── ConfigPreview.css    # Main styles
├── hooks/
│   ├── useConfig.ts             # Configuration management
│   ├── useMediaUrl.ts           # Media URL management
│   ├── useMonitoring.ts         # Real monitoring data
│   └── useStorageSync.ts        # Cross-process sync
├── constants/
│   ├── defaults.ts              # Default settings
│   ├── nzxt.ts                 # NZXT API constants
│   └── storage.ts              # Storage keys
├── types/
│   ├── overlay.ts              # Overlay type definitions
│   └── nzxt.d.ts               # NZXT API types
└── utils/
    ├── monitoring.ts           # Data mapping utilities
    ├── positioning.ts          # Position calculations
    └── storage.ts              # Storage helpers
```

---

## 🧑‍💻 Developer Information

### Environment Detection

NZXT CAM automatically appends `?kraken=1` to the URL when running inside the application. This parameter identifies the LCD display environment.

**Development URLs:**
- 🖥️ **Config Page:** [https://mrgogo7.github.io/nzxt-esc/](https://mrgogo7.github.io/nzxt-esc/)
- ⚙️ **LCD Display:** [https://mrgogo7.github.io/nzxt-esc/?kraken=1](https://mrgogo7.github.io/nzxt-esc/?kraken=1)

### Data Flow

1. **Config Page** → User adjusts settings → `localStorage` updated
2. **Storage Events** → Broadcast changes across processes
3. **LCD Display** → Listens to storage events → Updates instantly
4. **Monitoring Data** → NZXT API provides real-time metrics → Displayed in overlays

### Key Design Decisions

- **Dual Entry Points** — Separate HTML files for Config (`config.html`) and Display (`index.html`)
- **Storage Events** — Cross-process synchronization via `localStorage` events
- **Fallback Strategy** — Cookie fallback for robust storage in isolated processes
- **Real-time Preview** — 200px circular preview with 1:1 scale mapping to 640px LCD
- **Offset Scale Formula** — Critical formula: `previewSize / lcdResolution` (must be preserved)

---

## 🔮 Future Potential

NZXT-ESC is designed to be extensible and future-proof:

- **Plugin System** — Potential for custom metric plugins
- **Theme Support** — Customizable color schemes and themes
- **Animation Support** — Smooth transitions and animations
- **Export/Import** — Share configurations with others
- **Preset Library** — Pre-configured setups for common use cases
- **API Integration** — Connect to external data sources
- **Widget System** — Modular widget-based architecture

---

## 🧑‍💻 Author

**Developed by Gökhan Akgül (mRGogo)**

*"Transforming NZXT Kraken Elite LCD into a personalized information center."*

🔗 [GitHub](https://github.com/mrgogo7) • [LinkedIn](https://www.linkedin.com/in/gokhanakgul/) • [Instagram](https://www.instagram.com/mrgogo_/)

---

## ☕️ Support

If you find NZXT-ESC useful, consider supporting the project:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://www.buymeacoffee.com/mrgogo)

---

## 🧭 Keywords

**NZXT Web Integration, NZXT LCD, Kraken Elite, NZXT-ESC, Screen Customizer, LCD Customization, System Monitoring, Overlay Configurator, Real-time Preview, React Configurator, NZXT CAM Integration**

---

## 🙌 Acknowledgements

This project was inspired by [brunoandradebr/nzxt](https://github.com/brunoandradebr/nzxt) — an open-source exploration of NZXT Web Integration capabilities.

**NZXT Elite Screen Customizer (NZXT-ESC)** builds upon that foundation, expanding it into a comprehensive customization platform with:
- Advanced overlay system with single, dual, and triple modes
- Real-time system monitoring integration
- Independent metric group positioning
- Complete visual customization
- Multi-language support
- Professional-grade user experience

Special thanks to the open-source community for keeping NZXT integrations alive and evolving.

---

## 🏷️ License

MIT © 2025 — Free for personal and non-commercial use.

---

## 📝 Version History

**v5.11.15** — Current version
- Complete rebranding to NZXT Elite Screen Customizer
- Enhanced overlay system with triple mode
- Independent positioning for metric groups
- Improved UI/UX with labeled dividers
- Real-time monitoring data integration
- Mock data support for browser testing

---

## 🔗 Links

- **Live Demo:** [https://mrgogo7.github.io/nzxt-esc/](https://mrgogo7.github.io/nzxt-esc/)
- **GitHub Repository:** [https://github.com/mrgogo7/nzxt-esc](https://github.com/mrgogo7/nzxt-esc)
- **NZXT CAM Protocol:** `nzxt-cam://action/load-web-integration?url=https://mrgogo7.github.io/nzxt-esc/`

---

**Note:** If you're accessing this project via the old URL (`nzxt-web-integration-amc`), you'll be automatically redirected to the new location.
