/**
 * Media utility functions for detecting and handling media types.
 */

/**
 * Checks if a URL points to a video file.
 * 
 * @param url - Media URL to check
 * @returns True if URL is a video (MP4)
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  return /\.mp4($|\?)/i.test(url) || url.toLowerCase().includes('mp4');
}

/**
 * Determines the media type from URL.
 * 
 * @param url - Media URL to analyze
 * @returns Media type: 'video', 'image', or 'unknown'
 */
export function getMediaType(url: string): 'video' | 'image' | 'unknown' {
  if (!url) return 'unknown';
  if (isVideoUrl(url)) return 'video';
  if (/\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(url)) return 'image';
  return 'unknown';
}

