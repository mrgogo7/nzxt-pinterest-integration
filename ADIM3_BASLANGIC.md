# ADIM 3 - FAZ1 IMPLEMENTASYONUNA BAŞLA

**Durum:** Planlama tamamlandı, implementasyona başlanıyor

## ÖNEMLİ KURALLAR (FAZ1)

1. ✅ **Model Sade:** `OverlayElement` sadece `id, type, x, y, zIndex?, data` (rotation, opacity YOK)
2. ✅ **Divider:** Sadece migration'da kullanılabilir, UI'da "Add Divider" butonu YOK
3. ✅ **UI Minimum:** Mevcut Custom Editing UI görünümü aynı kalacak
4. ✅ **Drag Korunacak:** Mevcut custom drag davranışı korunacak (agresif optimizasyon YOK)
5. ✅ **Görsel Tutarlılık:** Render sonuçları mevcut görünümle birebir aynı olmalı
6. ✅ **Migration Basit:** Single/Dual/Triple için basit migration (detaylı hesaplama YOK)
7. ✅ **Custom Migration Doğru:** Custom mode migration'ı tüm detayları koruyacak (KRİTİK)
8. ✅ **Tutarsız Data:** Eski overlay datası tutarsız görünüyorsa DEFAULT_OVERLAY ile sıfırlanabilir

## UYGULAMA SIRASI

1. TASK 1 - Type definitions (sade model)
2. TASK 2 - Migration utilities (basit Single/Dual/Triple, doğru Custom)
3. TASK 3 - Unified renderer (görsel tutarlılık)
4. TASK 4 - Hook update
5. TASK 5 - KrakenOverlay update
6. TASK 6 - OverlayPreview update
7. TASK 7 - Drag handlers update
8. TASK 8 - UI settings update (minimum)
9. TASK 9 - Helpers update
10. TASK 10 - Domain logic cleanup
11. TASK 11 - Storage migration
12. TASK 12 - File cleanup
13. TASK 13 - Testing

## HAZIR

FAZ1 implementasyonuna başlamak için hazır. Her task adım adım uygulanacak.

