/**
 * Preset Error Handling
 * 
 * Defines error types and codes for preset import/export operations.
 * Provides user-friendly error messages with i18n support.
 */

/**
 * Error codes for preset operations.
 */
export const ERROR_CODES = {
  /** Invalid file type or extension */
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  /** JSON parse error */
  PARSE_ERROR: 'PARSE_ERROR',
  /** Invalid schema structure */
  INVALID_SCHEMA: 'INVALID_SCHEMA',
  /** Migration failed */
  MIGRATION_FAILED: 'MIGRATION_FAILED',
  /** Validation failed */
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  /** Unsupported schema version */
  UNSUPPORTED_VERSION: 'UNSUPPORTED_VERSION',
  /** Unknown/generic error */
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Custom error class for preset operations.
 */
export class PresetError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PresetError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PresetError);
    }
  }
}

/**
 * Creates a user-friendly error message based on error code.
 * 
 * @param error - PresetError instance
 * @param lang - Language code for i18n
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: PresetError, lang: 'en' | 'tr' = 'en'): string {
  const messages: Record<ErrorCode, { en: string; tr: string }> = {
    [ERROR_CODES.INVALID_FILE_TYPE]: {
      en: 'Invalid file type. Please select a .nzxt-esc-preset file.',
      tr: 'Geçersiz dosya türü. Lütfen bir .nzxt-esc-preset dosyası seçin.',
    },
    [ERROR_CODES.PARSE_ERROR]: {
      en: 'Failed to parse preset file. The file may be corrupted or invalid.',
      tr: 'Preset dosyası ayrıştırılamadı. Dosya bozuk veya geçersiz olabilir.',
    },
    [ERROR_CODES.INVALID_SCHEMA]: {
      en: 'Invalid preset file structure. The file format is not recognized.',
      tr: 'Geçersiz preset dosya yapısı. Dosya formatı tanınmıyor.',
    },
    [ERROR_CODES.MIGRATION_FAILED]: {
      en: 'Failed to migrate preset file to current version. The file may be from an incompatible version.',
      tr: 'Preset dosyası mevcut sürüme geçirilemedi. Dosya uyumsuz bir sürümden olabilir.',
    },
    [ERROR_CODES.VALIDATION_FAILED]: {
      en: 'Preset file validation failed. Some required fields are missing or invalid.',
      tr: 'Preset dosyası doğrulaması başarısız. Bazı gerekli alanlar eksik veya geçersiz.',
    },
    [ERROR_CODES.UNSUPPORTED_VERSION]: {
      en: 'Unsupported preset version. The file is from a version that is no longer supported.',
      tr: 'Desteklenmeyen preset sürümü. Dosya artık desteklenmeyen bir sürümden.',
    },
    [ERROR_CODES.UNKNOWN_ERROR]: {
      en: 'An unexpected error occurred while processing the preset file.',
      tr: 'Preset dosyası işlenirken beklenmeyen bir hata oluştu.',
    },
  };

  const messageSet = messages[error.code] || messages[ERROR_CODES.UNKNOWN_ERROR];
  return messageSet[lang];
}

/**
 * Creates a PresetError from a generic error.
 */
export function createPresetError(
  error: unknown,
  defaultCode: ErrorCode = ERROR_CODES.UNKNOWN_ERROR
): PresetError {
  if (error instanceof PresetError) {
    return error;
  }

  if (error instanceof Error) {
    return new PresetError(error.message, defaultCode, error);
  }

  return new PresetError(String(error), defaultCode, error);
}

