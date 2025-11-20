/**
 * Preset Storage System
 * 
 * Manages preset list persistence in localStorage.
 * Handles default presets and user-created presets.
 */

import type { PresetFile } from './schema';

export interface StoredPreset {
  id: string;
  name: string;
  preset: PresetFile;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'nzxtPresets';
const ACTIVE_PRESET_KEY = 'nzxtActivePresetId';

/**
 * Default presets (built-in, cannot be deleted).
 */
export const DEFAULT_PRESETS: Omit<StoredPreset, 'preset'>[] = [
  {
    id: 'default-minimal',
    name: 'Minimal',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-balanced',
    name: 'Balanced',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get all presets from localStorage.
 */
export function getPresets(): StoredPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('[PresetStorage] Failed to get presets:', error);
    return [];
  }
}

/**
 * Save presets to localStorage.
 */
export function savePresets(presets: StoredPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(presets),
      })
    );
  } catch (error) {
    console.error('[PresetStorage] Failed to save presets:', error);
  }
}

/**
 * Add a new preset.
 */
export function addPreset(preset: StoredPreset): void {
  const presets = getPresets();
  presets.push(preset);
  savePresets(presets);
}

/**
 * Update an existing preset.
 */
export function updatePreset(id: string, updates: Partial<StoredPreset>): void {
  const presets = getPresets();
  const index = presets.findIndex(p => p.id === id);
  if (index !== -1) {
    presets[index] = {
      ...presets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    savePresets(presets);
  }
}

/**
 * Delete a preset (cannot delete default presets).
 */
export function deletePreset(id: string): boolean {
  const presets = getPresets();
  const preset = presets.find(p => p.id === id);
  
  if (preset?.isDefault) {
    return false; // Cannot delete default presets
  }
  
  const filtered = presets.filter(p => p.id !== id);
  savePresets(filtered);
  
  // If deleted preset was active, clear active preset
  const activeId = getActivePresetId();
  if (activeId === id) {
    setActivePresetId(null);
  }
  
  return true;
}

/**
 * Get preset by ID.
 */
export function getPresetById(id: string): StoredPreset | null {
  const presets = getPresets();
  return presets.find(p => p.id === id) || null;
}

/**
 * Check if preset name exists.
 */
export function presetNameExists(name: string, excludeId?: string): boolean {
  const presets = getPresets();
  return presets.some(p => p.name === name && p.id !== excludeId);
}

/**
 * Generate unique preset name (e.g., "Preset Name (2)").
 */
export function generateUniquePresetName(baseName: string): string {
  let name = baseName;
  let counter = 1;
  
  while (presetNameExists(name)) {
    counter++;
    name = `${baseName} (${counter})`;
  }
  
  return name;
}

/**
 * Get active preset ID.
 */
export function getActivePresetId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PRESET_KEY);
  } catch {
    return null;
  }
}

/**
 * Set active preset ID.
 */
export function setActivePresetId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PRESET_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PRESET_KEY);
    }
    
    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: ACTIVE_PRESET_KEY,
        newValue: id,
      })
    );
  } catch (error) {
    console.error('[PresetStorage] Failed to set active preset:', error);
  }
}

/**
 * Duplicate a preset with a new name.
 */
export function duplicatePreset(id: string, newName?: string): StoredPreset | null {
  const preset = getPresetById(id);
  if (!preset) return null;
  
  const baseName = newName || preset.name;
  const uniqueName = generateUniquePresetName(baseName);
  
  const duplicated: StoredPreset = {
    ...preset,
    id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: uniqueName,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  addPreset(duplicated);
  return duplicated;
}

