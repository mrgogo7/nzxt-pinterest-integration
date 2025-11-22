# NZXT Elite Screen Customizer (NZXT-ESC) v5.11.21

![License](https://img.shields.io/badge/License-Personal%20Use%20Only-red) ![NZXT CAM](https://img.shields.io/badge/NZXT%20CAM-Web%20Integration-purple) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Vite](https://img.shields.io/badge/Vite-Bundler-purple) ![GitHub release](https://img.shields.io/github/v/release/mrgogo7/nzxt-esc)

A modern, browser-based media and overlay editor for NZXT Kraken Elite LCD screens.

Create custom animated backgrounds, metric overlays, text layers, divider lines, and fully personalized layouts — all synchronized live inside NZXT CAM.

Free for personal use only — commercial use is strictly prohibited.

---

## 🚀 QUICK START

NZXT-ESC works INSIDE NZXT CAM using the "Web Integration" feature.

There are two ways to install it:

### METHOD 1 — DIRECT LAUNCH (RECOMMENDED)

1. Copy this into your browser's address bar:

   ```text
   nzxt-cam://action/load-web-integration?url=https://mrgogo7.github.io/nzxt-esc/
   ```

2. Press Enter.

3. Your browser will display a question:

   "Open nzxt-cam link with NZXT CAM?"

   → Approve / Allow

4. NZXT CAM will launch automatically.

5. You will see a confirmation window:

   Load Web Integration?

   Are you sure you would like to load the following web integration?

   ```text
   https://mrgogo7.github.io/nzxt-esc/
   ```

6. Press "Load".

7. After loading, open the "Custom Web Integration" card.

### METHOD 2 — MANUAL INSTALLATION (INSIDE NZXT CAM)

1. Open NZXT CAM.

2. Go to:

   Lighting → Kraken Elite V2 → LCD Display

3. Change the display mode to:

   Web Integration

4. Find the card named:

   Custom Web Integration

5. Click "Settings".

6. Enter the URL:

   ```text
   https://mrgogo7.github.io/nzxt-esc/
   ```

7. Press "Apply".

8. Then press:

   Add as Card

9. A new Web Integration card called "My Web Integration" will appear.

10. Select "My Web Integration".

11. Press "Configure" to open the NZXT-ESC editor.

### RECOMMENDED: RENAME THE INTEGRATION CARD

NZXT CAM assigns the default name "My Web Integration".

To rename:

1. Select "My Web Integration".

2. Press "Edit".

3. Change the fields to:

   Title:

   ```text
   Elite Screen Customizer
   ```

   Description:

   ```text
   NZXT Elite Screen Customizer (NZXT-ESC)
   ```

This helps distinguish the integration from others.

---

## 🎛 USING THE EDITOR (CONFIGURE BUTTON)

All editing is performed INSIDE NZXT CAM via the "Configure" button.

Inside the editor you can:

- Add / remove metric, text, and divider elements
- Adjust position, rotation, scale, opacity, and color
- Choose MP4 / GIF / PNG / JPG background media
- Manage presets (Import, Export, Duplicate, Delete, Rename, Apply)
- Preview all changes in real time on your Kraken Elite LCD

No external URL or config.html is required anymore.

---

## 💡 WHAT MAKES NZXT-ESC SPECIAL?

NZXT-ESC is not a theme pack — it is a full visual layout editor built specifically for the Kraken Elite LCD.

It focuses on:

- Creative freedom
- Precision positioning
- Real-time LCD feedback
- A clean and intuitive editing experience

### 1. DESIGN-ORIENTED EDITING EXPERIENCE

- Free drag-and-drop placement
- Rotation and scaling per element
- Transform handles around the circular LCD preview
- Arrow-key micro adjustments
- Minimal and distraction-free interface
- Accurate circular preview matching real hardware

### 2. FULL ELEMENT-BASED OVERLAY ENGINE

Legacy Single/Dual/Triple modes were removed entirely.

You can now freely add:

- Metric elements
- Text elements
- Divider elements

Each element supports:

- X/Y position
- Rotation
- Scale
- Color & opacity
- Selection highlight

### 3. REAL-TIME LCD SYNCHRONIZATION

- Updates ~100ms throttle for stability
- No manual refresh needed
- LCD screen updates instantly as you edit

### 4. ADVANCED MEDIA ENGINE

Supports:

- MP4 video
- GIF animations
- PNG and JPG images

Includes:

- Cover / Contain / Fill modes
- Scaling
- Offset controls

### 5. PRESET SYSTEM (EARLY ACCESS)

Available actions:

- Import
- Export
- Delete
- Duplicate
- Rename
- Apply

Presets store the full layout as JSON.

---

## 🧪 TECHNICAL DETAILS

- React 18
- TypeScript
- Vite bundler
- LocalStorage sync + event broadcasting
- Circular LCD-aware render engine
- AABB + rotation transform math
- English and Turkish UI support

---

## 🔧 DEVELOPER INFORMATION

Clone and Install:

```bash
git clone https://github.com/mrgogo7/nzxt-esc
cd nzxt-esc
npm install
```

Start Dev Server:

```bash
npm run dev
```

Expose on LAN for NZXT CAM testing:

```bash
npm run dev -- --host
```

Build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Contributing:

- Open an Issue before starting major changes
- Keep PRs small and focused
- Use clear commit messages
- Follow project structure

---

## 🕛 VERSION HISTORY

v5.11.21 (Current)

- Element-based layout engine
- Rotation & scale transform system
- Selection highlight
- Arrow-key movement
- Legacy modes removed
- Full preset manager (Import/Export/Duplicate/Delete/Rename/Apply)
- UX and stability improvements

See GitHub Releases for older versions.

---

## 🔗 LINKS

Repository:

https://github.com/mrgogo7/nzxt-esc/

Support:

- [GitHub Sponsors](https://github.com/sponsors/mrgogo7)
- [Patreon](https://www.patreon.com/mRGogo7)
- [Buy Me a Coffee](https://www.buymeacoffee.com/mrgogo)

Issues:

https://github.com/mrgogo7/nzxt-esc/issues

---

## 📜 LICENSE

Personal Use License

Allowed:

- Personal use
- Personal modifications
- Redistribution with credit

Not Allowed:

- Commercial use
- Selling, bundling, renting, or monetizing in any form

NZXT-ESC is a hobby and community-driven project intended only for personal use.
