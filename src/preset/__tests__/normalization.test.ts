/**
 * Preset Normalization Tests
 * 
 * Tests for normalization and value clamping.
 */

import { normalizePresetFile } from '../normalization';
import type { PresetFile } from '../schema';

/**
 * Test case: Clamp out-of-range values
 */
export function testClampValues() {
  const outOfRangePreset: PresetFile = {
    schemaVersion: 1,
    exportedAt: '2024-01-01T00:00:00.000Z',
    appVersion: '0.0.1',
    presetName: 'Test Preset',
    background: {
      url: 'https://example.com/video.mp4',
      settings: {
        scale: 10, // Should be clamped to 5.0
        x: 2000, // Should be clamped to 1000
        y: -2000, // Should be clamped to -1000
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

  const result = normalizePresetFile(outOfRangePreset);

  // Check that values were clamped
  if (result.normalized.background.settings.scale !== 5.0) {
    throw new Error(`Scale should be clamped to 5.0, got ${result.normalized.background.settings.scale}`);
  }

  if (result.normalized.background.settings.x !== 1000) {
    throw new Error(`X should be clamped to 1000, got ${result.normalized.background.settings.x}`);
  }

  if (result.normalized.background.settings.y !== -1000) {
    throw new Error(`Y should be clamped to -1000, got ${result.normalized.background.settings.y}`);
  }

  // Check that changes were recorded
  if (result.changes.length === 0) {
    throw new Error('Should have normalization changes');
  }

  const scaleChange = result.changes.find(c => c.field === 'background.settings.scale');
  if (!scaleChange) {
    throw new Error('Should have change record for scale');
  }

  if (scaleChange.oldValue !== 10 || scaleChange.newValue !== 5.0) {
    throw new Error('Scale change record should match actual change');
  }

  console.log('✅ testClampValues: PASSED');
}

/**
 * Test case: Fix invalid enum values
 */
export function testFixInvalidEnums() {
  const invalidEnumPreset: any = {
    schemaVersion: 1,
    exportedAt: '2024-01-01T00:00:00.000Z',
    appVersion: '0.0.1',
    presetName: 'Test Preset',
    background: {
      url: 'https://example.com/video.mp4',
      settings: {
        scale: 1.0,
        x: 0,
        y: 0,
        fit: 'invalid-fit', // Should be fixed to 'cover'
        align: 'invalid-align', // Should be fixed to 'center'
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

  const result = normalizePresetFile(invalidEnumPreset);

  if (result.normalized.background.settings.fit !== 'cover') {
    throw new Error('Invalid fit should be fixed to cover');
  }

  if (result.normalized.background.settings.align !== 'center') {
    throw new Error('Invalid align should be fixed to center');
  }

  // Check that changes were recorded
  const fitChange = result.changes.find(c => c.field === 'background.settings.fit');
  if (!fitChange) {
    throw new Error('Should have change record for fit');
  }

  console.log('✅ testFixInvalidEnums: PASSED');
}

/**
 * Test case: No changes for valid values
 */
export function testNoChangesForValidValues() {
  const validPreset: PresetFile = {
    schemaVersion: 1,
    exportedAt: '2024-01-01T00:00:00.000Z',
    appVersion: '0.0.1',
    presetName: 'Test Preset',
    background: {
      url: 'https://example.com/video.mp4',
      settings: {
        scale: 1.0, // Valid
        x: 0, // Valid
        y: 0, // Valid
        fit: 'cover', // Valid
        align: 'center', // Valid
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

  const result = normalizePresetFile(validPreset);

  // Should have no changes
  if (result.changes.length > 0) {
    throw new Error('Valid preset should have no normalization changes');
  }

  // Values should be unchanged
  if (result.normalized.background.settings.scale !== 1.0) {
    throw new Error('Valid scale should not be changed');
  }

  console.log('✅ testNoChangesForValidValues: PASSED');
}

/**
 * Run all normalization tests
 */
export function runNormalizationTests() {
  console.log('🧪 Running Normalization Tests...\n');
  
  try {
    testClampValues();
    testFixInvalidEnums();
    testNoChangesForValidValues();
    
    console.log('\n✅ All normalization tests passed!');
  } catch (error) {
    console.error('\n❌ Normalization test failed:', error);
    throw error;
  }
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).runNormalizationTests = runNormalizationTests;
}

