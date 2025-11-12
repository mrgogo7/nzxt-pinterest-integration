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

1. Enter your **media URL** (MP4, JPG, or GIF).  
2. Adjust **Scale / X / Y Offset / Align / Fit** parameters.  
3. Instantly see the effect in both preview and your NZXT LCD.  
4. Settings are saved automatically and restored on reload.

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

