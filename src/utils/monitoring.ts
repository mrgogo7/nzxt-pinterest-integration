import type { OverlayMetrics } from '../types/overlay';
import type { NZXTMonitoringData } from '../types/nzxt';

/**
 * Safely picks first numeric value from a list of candidates.
 * Makes the code resilient to small API changes on NZXT side.
 * 
 * @param values - Array of candidate values
 * @returns First valid number, or 0 if none found
 */
function pickNumeric(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === 'number' && !Number.isNaN(v)) {
      return v;
    }
  }
  return 0;
}

/**
 * Maps NZXT MonitoringData into OverlayMetrics shape.
 * CRITICAL: Load values may be in 0-1 range, must convert to 0-100.
 * 
 * @param data - Raw NZXT monitoring data
 * @returns Normalized overlay metrics
 */
export function mapMonitoringToOverlay(data: NZXTMonitoringData): OverlayMetrics {
  const cpu0 = data?.cpus?.[0];
  const gpu0 = data?.gpus?.[0];
  const kraken = data?.kraken;

  // Raw loads
  const rawCpuLoad = pickNumeric(
    cpu0?.load,
    cpu0?.usage,
    cpu0?.totalLoad,
    cpu0?.processorLoad
  );

  const rawGpuLoad = pickNumeric(
    gpu0?.load,
    gpu0?.usage,
    gpu0?.totalLoad
  );

  // CRITICAL CONVERSION: 0-1 range values must be converted to 0-100
  const cpuLoad = rawCpuLoad <= 1 ? rawCpuLoad * 100 : rawCpuLoad;
  const gpuLoad = rawGpuLoad <= 1 ? rawGpuLoad * 100 : rawGpuLoad;

  return {
    // CPU Temp
    cpuTemp: pickNumeric(
      cpu0?.temperature,
      cpu0?.currentTemperature,
      cpu0?.packageTemperature
    ),

    // CPU Load (converted if needed)
    cpuLoad,

    // CPU Clock
    cpuClock: pickNumeric(
      cpu0?.clockSpeed,
      cpu0?.frequency,
      cpu0?.frequencyMHz,
      cpu0?.frequencyMhz,
      cpu0?.processorFrequency
    ),

    // Liquid Temp
    liquidTemp: pickNumeric(
      kraken?.liquidTemperature,
      kraken?.temperature,
      kraken?.liquidTemp
    ),

    // GPU Temp
    gpuTemp: pickNumeric(
      gpu0?.temperature,
      gpu0?.currentTemperature,
      gpu0?.gpuTemperature
    ),

    // GPU Load (converted if needed)
    gpuLoad,

    // GPU Clock
    gpuClock: pickNumeric(
      gpu0?.coreFrequency,
      gpu0?.clockSpeed,
      gpu0?.frequency,
      gpu0?.frequencyMHz,
      gpu0?.frequencyMhz,
      gpu0?.gpuFrequency
    ),
  };
}

