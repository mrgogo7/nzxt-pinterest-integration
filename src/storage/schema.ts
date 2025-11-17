/**
 * Storage schema definition.
 * 
 * This file defines the complete storage schema for the application.
 * All storage keys and their types are documented here.
 * 
 * AI contributors: When adding new storage keys, update this schema first.
 */

import type { AppSettings } from '../constants/defaults';
import type { Lang } from '../i18n';

/**
 * Complete storage schema.
 * 
 * This interface represents all data stored by the application.
 * Schema versioning can be added in the future for migrations.
 */
export interface StorageSchema {
  /** Schema version (for future migrations) */
  version?: number;
  /** Media URL (image/video) */
  mediaUrl: string;
  /** Application settings (overlay, background, etc.) */
  settings: AppSettings;
  /** Language preference */
  language: Lang;
}

/**
 * Storage schema version.
 * 
 * Currently version 1. Increment this when making breaking changes.
 * Migration logic can be added in storage/index.ts.
 */
export const STORAGE_SCHEMA_VERSION = 1;

/**
 * Storage key names.
 * 
 * All storage keys used in the application are defined here.
 * This ensures consistency and prevents typos.
 */
export const STORAGE_KEYS = {
  /** Media URL storage key (with cookie fallback) */
  MEDIA_URL: 'media_url',
  /** Primary config storage key */
  CONFIG: 'nzxtPinterestConfig',
  /** Compatibility config storage key (legacy) */
  CONFIG_COMPAT: 'nzxtMediaConfig',
  /** Language preference storage key */
  LANGUAGE: 'nzxtLang',
} as const;

