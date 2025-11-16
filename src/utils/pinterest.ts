/**
 * Pinterest URL parsing and media extraction utilities.
 * TEST ONLY - This file will be removed after testing.
 */

/**
 * Normalizes Pinterest URL to standard format.
 * Supports:
 * - https://tr.pinterest.com/pin/685391637080855586/
 * - https://de.pinterest.com/pin/685391637080855586/
 * - https://pin.it/2h7rjiNxi
 */
export function normalizePinterestUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  url = url.trim();
  
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  
  // Handle pin.it short URLs - these need to be resolved via redirect
  const pinItMatch = url.match(/pin\.it\/([a-zA-Z0-9]+)/);
  if (pinItMatch) {
    // pin.it URLs redirect to full Pinterest URLs
    // We'll handle the redirect in fetchPinterestMedia
    // Ensure it has https:// protocol
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  }
  
  // Handle standard Pinterest URLs: *.pinterest.com/pin/{id}
  // Supports: tr.pinterest.com, de.pinterest.com, www.pinterest.com, pinterest.com
  const standardMatch = url.match(/(?:https?:\/\/)?(?:[a-z]{2}\.)?pinterest\.com\/pin\/(\d+)/);
  if (standardMatch) {
    // Normalize to www.pinterest.com format (works across all locales)
    return `https://www.pinterest.com/pin/${standardMatch[1]}/`;
  }
  
  return null;
}

/**
 * Resolves pin.it short URLs to full Pinterest URLs by following redirects.
 * Uses CORS proxy to get the HTML and extract the final Pinterest URL.
 */
async function resolvePinItUrl(shortUrl: string): Promise<string | null> {
  try {
    // Use a CORS proxy to get the HTML content
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(shortUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data.contents) {
        // Extract Pinterest URL from HTML
        // pin.it redirects usually have the full URL in the HTML
        const html = data.contents;
        
        // Try to find Pinterest URL in various places:
        // 1. In meta tags
        const metaMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        if (metaMatch) {
          const pinterestMatch = metaMatch[1].match(/pinterest\.com\/pin\/(\d+)/);
          if (pinterestMatch) {
            return `https://www.pinterest.com/pin/${pinterestMatch[1]}/`;
          }
        }
        
        // 2. In canonical link
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
        if (canonicalMatch) {
          const pinterestMatch = canonicalMatch[1].match(/pinterest\.com\/pin\/(\d+)/);
          if (pinterestMatch) {
            return `https://www.pinterest.com/pin/${pinterestMatch[1]}/`;
          }
        }
        
        // 3. Direct match in HTML
        const directMatch = html.match(/pinterest\.com\/pin\/(\d+)/);
        if (directMatch) {
          return `https://www.pinterest.com/pin/${directMatch[1]}/`;
        }
      }
    }
  } catch (error) {
    console.warn('[Pinterest] Failed to resolve pin.it URL:', error);
  }
  
  return null;
}

/**
 * Extracts media URL from Pinterest HTML content.
 * Tries multiple methods:
 * 1. JSON from <script id="initial-state">
 * 2. JSON from window.__initialData__
 * 3. DOM scraping for video/image tags
 */
export function extractMediaFromHtml(html: string): string | null {
  if (!html) return null;
  
  try {
    // Method 1: Try to find <script id="initial-state">
    const initialStateMatch = html.match(/<script[^>]*id=["']initial-state["'][^>]*>(.*?)<\/script>/s);
    if (initialStateMatch) {
      try {
        const jsonData = JSON.parse(initialStateMatch[1]);
        const mediaUrl = findMediaInJson(jsonData);
        if (mediaUrl) return mediaUrl;
      } catch (e) {
        console.warn('[Pinterest] Failed to parse initial-state JSON:', e);
      }
    }
    
    // Method 2: Try to find window.__initialData__
    const initialDataMatch = html.match(/window\.__initialData__\s*=\s*({.*?});/s);
    if (initialDataMatch) {
      try {
        const jsonData = JSON.parse(initialDataMatch[1]);
        const mediaUrl = findMediaInJson(jsonData);
        if (mediaUrl) return mediaUrl;
      } catch (e) {
        console.warn('[Pinterest] Failed to parse __initialData__ JSON:', e);
      }
    }
    
    // Method 3: Try to find JSON in script tags
    // Collect all video URLs and pick the highest quality
    const scriptTags = html.match(/<script[^>]*>(.*?)<\/script>/gs);
    if (scriptTags) {
      const videoUrls: string[] = [];
      const imageUrls: string[] = [];
      
      for (const script of scriptTags) {
        // Collect all video URLs
        const videoMatches = script.matchAll(/https?:\/\/[^"'\s]+\.(mp4|webm)/gi);
        for (const match of videoMatches) {
          if (match[0] && !videoUrls.includes(match[0])) {
            videoUrls.push(match[0]);
          }
        }
        
        // Collect all image URLs
        const imageMatches = script.matchAll(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|gif|webp)/gi);
        for (const match of imageMatches) {
          if (match[0] && !imageUrls.includes(match[0])) {
            imageUrls.push(match[0]);
          }
        }
      }
      
      // If we found video URLs, pick the highest quality one
      if (videoUrls.length > 0) {
        videoUrls.sort((a, b) => getVideoQualityPriority(b) - getVideoQualityPriority(a));
        return videoUrls[0];
      }
      
      // If no videos, return first image
      if (imageUrls.length > 0) {
        return imageUrls[0];
      }
    }
    
    // Method 4: DOM scraping - look for video/image tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try video tag first
    const videoTag = doc.querySelector('video source, video[src]');
    if (videoTag) {
      const src = videoTag.getAttribute('src') || 
                  (videoTag as HTMLVideoElement).src;
      if (src && (src.includes('.mp4') || src.includes('.webm'))) {
        return src;
      }
    }
    
    // Try img tag with high resolution
    const imgTags = doc.querySelectorAll('img[src]');
    for (const img of Array.from(imgTags)) {
      const src = img.getAttribute('src') || '';
      // Prefer pinimg.com URLs (Pinterest's CDN)
      if (src.includes('pinimg.com') && (src.includes('.jpg') || src.includes('.png') || src.includes('.gif'))) {
        return src;
      }
    }
    
  } catch (e) {
    console.error('[Pinterest] Error extracting media from HTML:', e);
  }
  
  return null;
}

/**
 * Gets quality priority for video URLs.
 * Higher number = higher priority.
 */
function getVideoQualityPriority(url: string): number {
  if (!url || typeof url !== 'string') return 0;
  const lowerUrl = url.toLowerCase();
  
  // Priority order: 720p > 480p > 360p > expMp4 > hevcMp4V3 > others
  if (lowerUrl.includes('/720p/')) return 100;
  if (lowerUrl.includes('/480p/')) return 80;
  if (lowerUrl.includes('/360p/')) return 60;
  if (lowerUrl.includes('/expmp4/')) return 40;
  if (lowerUrl.includes('/hevcmp4v3')) return 20;
  if (lowerUrl.includes('.mp4') || lowerUrl.includes('.webm')) return 10;
  return 0;
}

/**
 * Collects all video URLs from an object and returns the highest quality one.
 */
function collectVideoUrls(obj: any, depth = 0, urls: string[] = []): string[] {
  if (depth > 10) return urls; // Prevent infinite recursion
  if (!obj || typeof obj !== 'object') return urls;
  
  if (typeof obj === 'object' && obj !== null) {
    // Check for video URLs in common structures
    if (obj.url && typeof obj.url === 'string') {
      if (obj.url.match(/\.(mp4|webm)/i) && !urls.includes(obj.url)) {
        urls.push(obj.url);
      }
    }
    
    if (obj.src && typeof obj.src === 'string') {
      if (obj.src.match(/\.(mp4|webm)/i) && !urls.includes(obj.src)) {
        urls.push(obj.src);
      }
    }
    
    // Common Pinterest JSON structures
    if (obj.videos && obj.videos.video_list) {
      const videoList = obj.videos.video_list;
      for (const key in videoList) {
        const video = videoList[key];
        if (video && video.url && typeof video.url === 'string') {
          if (!urls.includes(video.url)) {
            urls.push(video.url);
          }
        }
      }
    }
  }
  
  // Recursively search in nested objects and arrays
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      collectVideoUrls(obj[key], depth + 1, urls);
    }
  }
  
  return urls;
}

/**
 * Recursively searches JSON object for media URLs.
 * For videos, collects all URLs and returns the highest quality one.
 */
function findMediaInJson(obj: any, depth = 0): string | null {
  if (depth > 10) return null; // Prevent infinite recursion
  if (!obj || typeof obj !== 'object') return null;
  
  // Check if this object has a direct URL property
  if (typeof obj === 'object' && obj !== null) {
    // For videos, collect all URLs and pick the highest quality
    const videoUrls = collectVideoUrls(obj, 0, []);
    if (videoUrls.length > 0) {
      // Sort by quality priority (highest first)
      videoUrls.sort((a, b) => getVideoQualityPriority(b) - getVideoQualityPriority(a));
      return videoUrls[0];
    }
    
    // For images, use existing logic
    if (obj.images) {
      // Try to get highest quality image
      if (obj.images.orig) return obj.images.orig.url;
      if (obj.images['736x']) return obj.images['736x'].url;
      if (obj.images['564x']) return obj.images['564x'].url;
      // Get first available image
      const firstImage = Object.values(obj.images)[0] as any;
      if (firstImage && firstImage.url) return firstImage.url;
    }
    
    // Direct URL properties (non-video)
    if (obj.url && typeof obj.url === 'string') {
      if (obj.url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        return obj.url;
      }
    }
    
    if (obj.src && typeof obj.src === 'string') {
      if (obj.src.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        return obj.src;
      }
    }
  }
  
  // Recursively search in nested objects and arrays
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findMediaInJson(obj[key], depth + 1);
      if (result) return result;
    }
  }
  
  return null;
}

/**
 * Fetches Pinterest page and extracts media URL.
 * Uses CORS proxy as fallback if direct fetch fails.
 */
export async function fetchPinterestMedia(pinterestUrl: string): Promise<string | null> {
  let normalizedUrl = normalizePinterestUrl(pinterestUrl);
  if (!normalizedUrl) {
    throw new Error('Invalid Pinterest URL format');
  }
  
  // If it's a pin.it short URL, try to resolve it first
  if (normalizedUrl.includes('pin.it/')) {
    const resolved = await resolvePinItUrl(normalizedUrl);
    if (resolved) {
      normalizedUrl = resolved;
    } else {
      // If resolution fails, try to use the short URL directly with proxy
      console.warn('[Pinterest] Could not resolve pin.it URL, trying direct fetch');
    }
  }
  
  // Method 1: Try direct fetch (will likely fail due to CORS, but worth trying)
  try {
    const response = await fetch(normalizedUrl, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    
    if (response.ok) {
      const html = await response.text();
      const mediaUrl = extractMediaFromHtml(html);
      if (mediaUrl) return mediaUrl;
    }
  } catch (error) {
    console.warn('[Pinterest] Direct fetch failed (expected due to CORS), trying proxy:', error);
  }
  
  // Method 2: Use CORS proxy (allorigins.win - free public CORS proxy)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data.contents) {
        const mediaUrl = extractMediaFromHtml(data.contents);
        if (mediaUrl) return mediaUrl;
      }
    }
  } catch (error) {
    console.warn('[Pinterest] allorigins.win proxy failed, trying alternative:', error);
  }
  
  // Method 3: Try alternative CORS proxy (corsproxy.io)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(normalizedUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const html = await response.text();
      const mediaUrl = extractMediaFromHtml(html);
      if (mediaUrl) return mediaUrl;
    }
  } catch (error) {
    console.warn('[Pinterest] corsproxy.io also failed:', error);
  }
  
  // Method 4: Try another proxy (cors-anywhere alternative)
  try {
    // Note: Many public CORS proxies have rate limits or require authentication
    // For production, you'd need your own proxy server
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(normalizedUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const html = await response.text();
      const mediaUrl = extractMediaFromHtml(html);
      if (mediaUrl) return mediaUrl;
    }
  } catch (error) {
    console.error('[Pinterest] All proxy methods failed:', error);
  }
  
  return null;
}

