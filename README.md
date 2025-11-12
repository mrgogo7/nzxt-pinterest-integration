# 🌀 AMC — Advanced Media Configurator for NZXT Web Integration

**Drag • Scale • Align • Sync your media in real time.**

AMC is a modern, interactive configuration tool built to enhance the **NZXT Web Integration** ecosystem.  
It lets you instantly preview, position, and sync your media (MP4, JPG, GIF) directly to your NZXT LCD display — in real time.

---

## 🚀 Key Features

- ⚡ **Real-time LCD synchronization** (100 ms throttled updates)
- 🎥 **Live circular preview** (Kraken-style LCD simulation)
- 🖱️ **Drag, scale, offset & align controls**
- 🔁 **Fit modes** — `cover`, `contain`, `fill`
- 🌍 **Multi-language support**
- 💾 **Persistent configuration** (auto-save via localStorage)
- 🧭 **Overlay guide** for alignment
- 🔧 **Reset & fine-tune controls**
- 🧩 **Vite + React + TypeScript** base, optimized for NZXT CAM integration

---

## 🧰 How It Works

AMC reads and writes data through the same storage events used by NZXT Web Integration,  
allowing instant synchronization between your **Config Page** and the **LCD display**.

When you adjust **scale, position, or fit**, the preview updates every 100 ms —  
and the LCD instantly mirrors your configuration.

---

## 🖼️ Example Usage

### 🚀 Quick Launch (via NZXT CAM)
You can open this integration directly in the **NZXT CAM** app.

> **Step 1.** Copy and paste the following line into your web browser’s address bar:  
> ```
> nzxt-cam://action/load-web-integration?url=https://mrgogo7.github.io/nzxt-web-integration-amc/
> ```
> _(Direct links with the `nzxt-cam://` protocol are not clickable on GitHub — please paste it manually.)_

> **Step 2.** Press **Enter**, and NZXT CAM will automatically launch and load this Web Integration.

---

### 🧩 Manual Add (inside NZXT CAM)
If you prefer to add it manually:
1. Open **NZXT CAM** → go to **Settings → Web Integrations → + Add Custom Integration**  
2. Paste this URL: https://mrgogo7.github.io/nzxt-web-integration-amc/
3. Click **Add**, then open the integration from the list.  
4. You should now see **AMC — Advanced Media Configurator** appear on your NZXT device’s LCD.

---

### 🧠 Using AMC
Once opened inside NZXT CAM:
1. Enter your **media URL** (MP4, JPG, or GIF).  
2. Adjust **Scale**, **X / Y Offset**, **Align**, and **Fit** parameters.  
3. The LCD and on-screen preview update instantly (100 ms sync interval).  
4. Your settings are automatically saved and restored when you reopen CAM.  

---

## 🧩 Technologies

| Stack | Purpose |
|-------|----------|
| React + Vite | Frontend framework |
| TypeScript | Strict type safety |
| Lucide Icons | Modern icon set |
| CSS Modules | Compact visual design |
| NZXT API | LCD sync & device data |

---

## 📦 Project Structure
src/
├── ui/
│ ├── components/
│ │ └── ConfigPreview.tsx
│ ├── styles/
│ │ └── ConfigPreview.css
│ └── Config.tsx
├── i18n.ts
├── config.tsx
vite.config.ts

---

## 🧭 Keywords (for search engines)

**NZXT Web Integration, NZXT LCD, Kraken Elite, CAM Overlay, Media Configurator, Live Preview, Drag & Scale, React Configurator**

---

## 🧑‍💻 Author

Developed by **Gökhan Akgül**  
_“Because every pixel deserves precision.”_  
🔗 [GitHub Profile](https://github.com/mrgogo7)

---

## 🏷️ License

MIT © 2025 — free for personal and non-commercial use.

