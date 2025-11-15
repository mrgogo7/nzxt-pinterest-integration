import React, { useEffect, useRef } from 'react';
import { isVideoUrl } from '../../utils/media';
import { getObjectPosition } from '../../utils/positioning';
import type { AppSettings } from '../../constants/defaults';

interface MediaRendererProps {
  url: string;
  settings: AppSettings;
  className?: string;
  style?: React.CSSProperties;
  forceColorMode?: boolean; // If true, ignore URL and use backgroundColor
}

/**
 * MediaRenderer component.
 * Handles rendering of both video and image media with proper positioning and scaling.
 */
export default function MediaRenderer({
  url,
  settings,
  className,
  style,
  forceColorMode = false,
}: MediaRendererProps) {
  const isVideo = isVideoUrl(url);
  const objectPosition = getObjectPosition(settings.align, settings.x, settings.y);

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: settings.fit,
    objectPosition,
    transform: `scale(${settings.scale})`,
    transformOrigin: 'center center',
    display: 'block',
    ...style,
  };

  // If forceColorMode is true, use backgroundColor (ignore URL)
  if (forceColorMode) {
    const bgColor = settings.backgroundColor || '#000000';
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: bgColor,
          ...style,
        }}
      />
    );
  }

  // If no URL but backgroundColor exists, show color background
  if (!url && settings.backgroundColor) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: settings.backgroundColor,
          ...style,
        }}
      />
    );
  }

  // If no URL and no backgroundColor, show black
  if (!url) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          ...style,
        }}
      />
    );
  }

  if (isVideo) {
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Force video reload when URL changes
    useEffect(() => {
      if (videoRef.current && url) {
        videoRef.current.load();
      }
    }, [url]);

    return (
      <video
        ref={videoRef}
        key={url}
        src={url}
        autoPlay={settings.autoplay}
        loop={settings.loop}
        muted={settings.mute}
        playsInline
        className={className}
        style={mediaStyle}
      />
    );
  }

  return (
    <img
      key={url}
      src={url}
      alt="Media"
      className={className}
      style={mediaStyle}
    />
  );
}

