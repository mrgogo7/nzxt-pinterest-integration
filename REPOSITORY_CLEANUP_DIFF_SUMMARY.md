# Repository Cleanup - Planned Changes Summary

This document outlines all planned changes to align the repository with the new README.md rules and Personal Use License.

---

## 1. LICENSE File

**File:** `LICENSE`

**Change:** Replace MIT License with Personal Use License from README.md

**Diff:**
```diff
-MIT License
-
-Copyright (c) 2025 Gökhan Akgül (mRGogo)
-
-Permission is hereby granted, free of charge, to any person obtaining a copy
-of this software and associated documentation files (the "Software"), to deal
-in the Software without restriction, including without limitation the rights
-to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
-copies of the Software, and to permit persons to whom the Software is
-furnished to do so, subject to the following conditions:
-
-The above copyright notice and this permission notice shall be included in all
-copies or substantial portions of the Software.
-
-THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
-IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
-FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
-AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
-LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
-OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
-SOFTWARE.
+Personal Use License
+
+Copyright (c) 2025 Gökhan Akgül (mRGogo)
+
+Allowed:
+
+- Personal use
+- Personal modifications
+- Redistribution with credit
+
+Not Allowed:
+
+- Commercial use
+- Selling, bundling, renting, or monetizing in any form
+
+NZXT-ESC is a hobby and community-driven project intended only for personal use.
```

---

## 2. package.json

**File:** `package.json`

**Changes:**
- Add `"license": "Personal-Use-Only"`
- Update `"description"` to match README
- Add `"keywords"` array with relevant terms
- Keep `"private": true`

**Diff:**
```diff
 {
   "name": "nzxt-esc",
   "private": true,
   "version": "0.0.1",
   "type": "module",
+  "description": "A browser-based media and overlay editor for NZXT Kraken Elite LCD screens",
+  "license": "Personal-Use-Only",
+  "keywords": [
+    "nzxt",
+    "kraken-elite",
+    "lcd-screen",
+    "overlay-editor",
+    "web-integration",
+    "customization"
+  ],
   "scripts": {
     "dev": "vite",
     "build": "tsc --noEmit && vite build",
     "preview": "vite preview --port 5173",
     "type-check": "tsc --noEmit"
   },
   ...
 }
```

---

## 3. CONTRIBUTING.md

**File:** `CONTRIBUTING.md`

**Changes:**
- Remove/replace "open source" references
- Update architecture description to reflect "inside NZXT CAM" workflow
- Remove explicit references to config.html as external workflow
- Add Personal Use License acknowledgment

**Key Updates:**
1. Line 5: Remove "open source" reference
2. Line 29: Update architecture description
3. Line 108: Update testing instructions (config.html still exists but workflow is internal)

**Diff (Key Sections):**
```diff
-This document provides guidelines and instructions for contributing to the project. Following these guidelines helps communicate that you respect the time of the developers managing and developing this open source project.
+This document provides guidelines and instructions for contributing to the project. Following these guidelines helps communicate that you respect the time of the developers managing and developing this project.

 ...

-## Getting Started
+## Getting Started
+
+**Important:** This project is licensed under the Personal Use License. All contributions must respect this license. No contributions intended for commercial deployment will be accepted.

 ...

-- **Architecture**: Dual entry points (config.html and index.html) with localStorage-based synchronization
+- **Architecture**: Web Integration that runs inside NZXT CAM with localStorage-based synchronization

 ...

-**Important**: Test your changes in both environments:
-- **Config Page**: `http://localhost:5173/config.html`
-- **LCD Display**: `http://localhost:5173/?kraken=1`
+**Important**: Test your changes inside NZXT CAM Web Integration. The application has two entry points:
+- **Config Page**: `http://localhost:5173/config.html` (for development/testing)
+- **LCD Display**: `http://localhost:5173/?kraken=1` (LCD display mode)
+Note: In production, everything runs inside NZXT CAM via Web Integration.
```

---

## 4. vite.config.ts

**File:** `vite.config.ts`

**Changes:**
- Update comment to reflect that config.html exists but workflow is internal

**Diff:**
```diff
 /**
- * Vite configuration for NZXT Web Integration.
- * Supports multi-entry build (index.html + config.html).
+ * Vite configuration for NZXT Web Integration.
+ * Supports multi-entry build (index.html + config.html).
+ * Note: The application runs inside NZXT CAM via Web Integration.
+ * config.html is used for configuration, index.html is for LCD display.
  */
```

---

## Files That Will NOT Be Changed

The following files/directories will remain unchanged:

1. **package-lock.json** - This is auto-generated by npm and contains dependency licenses (not project license)
2. **SECURITY.md** - General security policy, no license-specific content
3. **CODE_OF_CONDUCT.md** - Standard Contributor Covenant, no license-specific content
4. **Source code files** - No license headers found in source files
5. **Documentation report files** (*.md in root) - Historical/analysis documents, kept for reference
6. **README_DRAFT.md** - Can be removed if desired, but keeping for now

---

## Summary

**Files to be Modified:**
1. ✅ LICENSE
2. ✅ package.json
3. ✅ CONTRIBUTING.md
4. ✅ vite.config.ts

**Files to be Reviewed (but not changed in this pass):**
- Documentation report files (historical records)

**No changes needed:**
- Source code files (no license headers found)
- SECURITY.md
- CODE_OF_CONDUCT.md
- package-lock.json (dependency licenses)

---

## Verification Checklist

After changes, verify:
- [ ] LICENSE file matches README.md Personal Use License text exactly
- [ ] package.json has correct license field and description
- [ ] CONTRIBUTING.md reflects Personal Use License and updated workflow
- [ ] vite.config.ts comments are updated
- [ ] No MIT license references remain in project files (except package-lock.json)
- [ ] No outdated "open source" references in documentation
- [ ] All URLs in README.md are correct (already verified)

---

**Ready for review and approval before committing changes.**

