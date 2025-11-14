import { DEFAULT_OVERLAY, type OverlaySettings } from '../types/overlay';

/**
 * Application settings interface.
 */
export interface AppSettings {
  scale: number;
  x: number;
  y: number;
  fit: 'cover' | 'contain' | 'fill';
  align: 'center' | 'top' | 'bottom' | 'left' | 'right';
  loop: boolean;
  autoplay: boolean;
  mute: boolean;
  resolution: string;
  showGuide?: boolean;
  overlay?: OverlaySettings;
}

/**
 * Default media URL (Pinterest video example).
 */
export const DEFAULT_MEDIA_URL =
  'https://v1.pinimg.com/videos/iht/expMp4/b0/95/18/b09518df640864a0181b5d242ad49c2b_720w.mp4';

/**
 * Default application settings.
 * Used when no saved configuration exists.
 */
export const DEFAULT_SETTINGS: AppSettings = {
  scale: 1,
  x: 0,
  y: 0,
  fit: 'cover',
  align: 'center',
  loop: true,
  autoplay: true,
  mute: true,
  resolution: '640x640',
  showGuide: true,
  overlay: DEFAULT_OVERLAY,
};

/**
 * Default overlay metrics (used before real data arrives).
 */
export const DEFAULT_METRICS = {
  cpuTemp: 0,
  cpuLoad: 0,
  cpuClock: 0,
  liquidTemp: 0,
  gpuTemp: 0,
  gpuLoad: 0,
  gpuClock: 0,
} as const;

