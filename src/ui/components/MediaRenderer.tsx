import React from 'react';
import { isVideoUrl } from '../../utils/media';
import { getObjectPosition } from '../../utils/positioning';
import type { AppSettings } from '../../constants/defaults';

interface MediaRendererProps {
  url: string;
  settings: AppSettings;
  className?: string;
  style?: React.CSSProperties;
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

  if (!url) return null;

  if (isVideo) {
    return (
      <video
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
      src={url}
      alt="Media"
      className={className}
      style={mediaStyle}
    />
  );
}

