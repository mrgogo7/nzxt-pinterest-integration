/**
 * Preset Validation Tests
 * 
 * Tests for validation layer.
 */

import { validatePresetFile } from '../validation';
import type { PresetFile } from '../schema';

/**
 * Test case: Valid preset should pass validation
 */
export function testValidPreset() {
  const validPreset: PresetFile = {
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

  const result = validatePresetFile(validPreset);

  if (!result.valid) {
    throw new Error('Valid preset should pass validation');
  }

  if (result.errors.length > 0) {
    throw new Error('Valid preset should have no errors');
  }

  console.log('✅ testValidPreset: PASSED');
}

/**
 * Test case: Invalid enum values should fail validation
 */
export function testInvalidEnumValues() {
  const invalidPreset: any = {
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
        fit: 'invalid-fit', // Invalid enum
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

  const result = validatePresetFile(invalidPreset);

  if (result.valid) {
    throw new Error('Invalid enum should fail validation');
  }

  if (result.errors.length === 0) {
    throw new Error('Should have validation errors for invalid enum');
  }

  const fitError = result.errors.find(e => e.field === 'background.settings.fit');
  if (!fitError) {
    throw new Error('Should have error for invalid fit value');
  }

  console.log('✅ testInvalidEnumValues: PASSED');
}

/**
 * Test case: Out-of-range values should generate warnings
 */
export function testOutOfRangeValues() {
  const outOfRangePreset: PresetFile = {
    schemaVersion: 1,
    exportedAt: '2024-01-01T00:00:00.000Z',
    appVersion: '0.0.1',
    presetName: 'Test Preset',
    background: {
      url: 'https://example.com/video.mp4',
      settings: {
        scale: 10, // Out of range (should be 0.1-5.0)
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

  const result = validatePresetFile(outOfRangePreset);

  // Should still be valid (warnings don't block)
  if (!result.valid) {
    throw new Error('Out-of-range values should only generate warnings, not errors');
  }

  if (result.warnings.length === 0) {
    throw new Error('Should have warnings for out-of-range values');
  }

  const scaleWarning = result.warnings.find(w => w.field === 'background.settings.scale');
  if (!scaleWarning) {
    throw new Error('Should have warning for out-of-range scale');
  }

  console.log('✅ testOutOfRangeValues: PASSED');
}

/**
 * Test case: Missing required fields should fail validation
 */
export function testMissingRequiredFields() {
  const missingFieldsPreset: any = {
    schemaVersion: 1,
    exportedAt: '2024-01-01T00:00:00.000Z',
    appVersion: '0.0.1',
    // Missing presetName
    background: {
      url: 'https://example.com/video.mp4',
      settings: {
        scale: 1.0,
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

  const result = validatePresetFile(missingFieldsPreset);

  if (result.valid) {
    throw new Error('Missing required fields should fail validation');
  }

  if (result.errors.length === 0) {
    throw new Error('Should have errors for missing required fields');
  }

  const presetNameError = result.errors.find(e => e.field === 'presetName');
  if (!presetNameError) {
    throw new Error('Should have error for missing presetName');
  }

  console.log('✅ testMissingRequiredFields: PASSED');
}

/**
 * Run all validation tests
 */
export function runValidationTests() {
  console.log('🧪 Running Validation Tests...\n');
  
  try {
    testValidPreset();
    testInvalidEnumValues();
    testOutOfRangeValues();
    testMissingRequiredFields();
    
    console.log('\n✅ All validation tests passed!');
  } catch (error) {
    console.error('\n❌ Validation test failed:', error);
    throw error;
  }
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).runValidationTests = runValidationTests;
}

