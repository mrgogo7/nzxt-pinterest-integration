/**
 * NZXT Web Integration API Type Definitions
 */

export interface NZXTMonitoringData {
  cpus?: Array<{
    temperature?: number;
    currentTemperature?: number;
    packageTemperature?: number;
    load?: number;
    usage?: number;
    totalLoad?: number;
    processorLoad?: number;
    clockSpeed?: number;
    frequency?: number;
    frequencyMHz?: number;
    frequencyMhz?: number;
    processorFrequency?: number;
  }>;
  gpus?: Array<{
    temperature?: number;
    currentTemperature?: number;
    gpuTemperature?: number;
    load?: number;
    usage?: number;
    totalLoad?: number;
    coreFrequency?: number;
    clockSpeed?: number;
    frequency?: number;
    frequencyMHz?: number;
    frequencyMhz?: number;
    gpuFrequency?: number;
  }>;
  kraken?: {
    liquidTemperature?: number;
    temperature?: number;
    liquidTemp?: number;
  };
}

export interface NZXTV1API {
  width?: number;
  height?: number;
  shape?: 'circle' | 'rectangle';
  onMonitoringDataUpdate?: (data: NZXTMonitoringData) => void;
}

declare global {
  interface Window {
    nzxt?: {
      v1?: NZXTV1API;
    };
  }
}

export {};

