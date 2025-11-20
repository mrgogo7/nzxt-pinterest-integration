/**
 * Preset Migration Tests
 * 
 * Tests for sequential migration pipeline.
 * 
 * Note: These are manual test cases. For automated testing,
 * install a test framework like Vitest or Jest.
 */

import { migratePreset, getSchemaVersion } from '../migration';
import { CURRENT_SCHEMA_VERSION, MIN_SUPPORTED_VERSION } from '../constants';
import type { PresetFile } from '../schema';

/**
 * Test case: Migrate version 0 to version 1
 */
export function testMigrate0To1() {
  const v0File = {
    exportedAt: '2024-01-01T00:00:00.000Z',
    appVersion: '0.0.1',
    background: {
      url: 'https://example.com/video.mp4',
      settings: {
        scale: 1.5,
        x: 10,
        y: 20,
        fit: 'cover',
        align: 'center',
        loop: true,
        autoplay: true,
        mute: true,
        resolution: '640x640',
        backgroundColor: '#000000',
      },
    },
    overlay: {
      mode: 'none',
      elements: [],
    },
  };

  const migrated = migratePreset(v0File);

  // Assertions
  if (migrated.schemaVersion !== 1) {
    throw new Error(`Expected schemaVersion 1, got ${migrated.schemaVersion}`);
  }

  if (!migrated.presetName) {
    throw new Error('Expected presetName to be set');
  }

  if (migrated.background.settings.scale !== 1.5) {
    throw new Error('Scale value should be preserved');
  }

  console.log('✅ testMigrate0To1: PASSED');
}

/**
 * Test case: Handle missing fields gracefully
 */
export function testMissingFields() {
  const incompleteFile = {
    schemaVersion: 0,
    background: {
      url: '',
      settings: {},
    },
  };

  const migrated = migratePreset(incompleteFile);

  // Should not throw, should use defaults
  if (migrated.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    throw new Error(`Expected schemaVersion ${CURRENT_SCHEMA_VERSION}, got ${migrated.schemaVersion}`);
  }

  if (typeof migrated.background.settings.scale !== 'number') {
    throw new Error('Scale should have default value');
  }

  console.log('✅ testMissingFields: PASSED');
}

/**
 * Test case: Idempotent migration (running migration twice should produce same result)
 */
export function testIdempotentMigration() {
  const v0File = {
    exportedAt: '2024-01-01T00:00:00.000Z',
    appVersion: '0.0.1',
    background: {
      url: 'https://example.com/video.mp4',
      settings: {
        scale: 2.0,
        x: 0,
        y: 0,
        fit: 'cover',
        align: 'center',
        loop: true,
        autoplay: true,
        mute: true,
        resolution: '640x640',
        backgroundColor: '#000000',
      },
    },
    overlay: {
      mode: 'none',
      elements: [],
    },
  };

  const firstMigration = migratePreset(v0File);
  const secondMigration = migratePreset(firstMigration);

  // Should produce same result
  if (firstMigration.schemaVersion !== secondMigration.schemaVersion) {
    throw new Error('Migration should be idempotent');
  }

  if (firstMigration.background.settings.scale !== secondMigration.background.settings.scale) {
    throw new Error('Values should be preserved in idempotent migration');
  }

  console.log('✅ testIdempotentMigration: PASSED');
}

/**
 * Test case: Version detection
 */
export function testVersionDetection() {
  const v0File = {};
  const v1File = { schemaVersion: 1 };

  if (getSchemaVersion(v0File) !== 0) {
    throw new Error('Should detect version 0 for missing schemaVersion');
  }

  if (getSchemaVersion(v1File) !== 1) {
    throw new Error('Should detect version 1');
  }

  console.log('✅ testVersionDetection: PASSED');
}

/**
 * Run all migration tests
 */
export function runMigrationTests() {
  console.log('🧪 Running Migration Tests...\n');
  
  try {
    testMigrate0To1();
    testMissingFields();
    testIdempotentMigration();
    testVersionDetection();
    
    console.log('\n✅ All migration tests passed!');
  } catch (error) {
    console.error('\n❌ Migration test failed:', error);
    throw error;
  }
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).runMigrationTests = runMigrationTests;
}

