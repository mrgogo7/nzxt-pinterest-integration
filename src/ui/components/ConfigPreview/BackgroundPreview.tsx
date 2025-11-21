import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { AppSettings } from '../../../constants/defaults';

interface BackgroundPreviewProps {
  mediaUrl: string | null;
  settings: AppSettings;
  isVideo: boolean;
  objectPosition: string;
  adjX: number;
  adjY: number;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onScaleChange: (delta: number) => void;
  previewTitle: string;
}

/**
 * Background preview component.
 * Displays the media preview with drag support and zoom controls.
 */
export default function BackgroundPreview({
  mediaUrl,
  settings,
  isVideo,
  objectPosition,
  adjX,
  adjY,
  isDragging,
  onMouseDown,
  onScaleChange,
  previewTitle,
}: BackgroundPreviewProps) {
  const [showScaleLabel, setShowScaleLabel] = useState(false);
  const [showOffsetLabel, setShowOffsetLabel] = useState(false);

  // Show scale label when scale changes, hide after 1 second
  useEffect(() => {
    setShowScaleLabel(true);
    const timer = setTimeout(() => {
      setShowScaleLabel(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [settings.scale]);

  // Show offset label when x or y changes, hide after 1 second
  useEffect(() => {
    setShowOffsetLabel(true);
    const timer = setTimeout(() => {
      setShowOffsetLabel(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [settings.x, settings.y]);

  return (
    <div className="preview-column">
      <div className="preview-title">{previewTitle}</div>
      <div className="nzxt-glow-wrapper">
        {showScaleLabel && (
          <div className="scale-label">Scale: {settings.scale.toFixed(2)}×</div>
        )}
        {showOffsetLabel && (
          <div className="offset-label">X: {settings.x} Y: {settings.y}</div>
        )}
        <div
          className={`preview-circle ${isDragging ? 'dragging' : ''}`}
          onMouseDown={onMouseDown}
          style={{
            backgroundColor: settings.backgroundColor || '#000000',
          }}
        >

        {isVideo ? (
          <video
            src={mediaUrl || undefined}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: settings.fit,
              objectPosition,
              transform: `scale(${settings.scale})`,
              transformOrigin: 'center center',
            }}
          />
        ) : (
          mediaUrl && (
            <img
              src={mediaUrl}
              alt="preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: settings.fit,
                objectPosition,
                transform: `scale(${settings.scale})`,
                transformOrigin: 'center center',
              }}
            />
          )
        )}

        {/* Overlay guide - only for alignment reference */}
        {settings.showGuide && (
          <div
            className="overlay-guide"
            style={{
              transform: `translate(${adjX}px, ${adjY}px) scale(${settings.scale})`,
              transformOrigin: 'center center',
            }}
          >
            <div className="crosshair horizontal" />
            <div className="crosshair vertical" />
          </div>
        )}

        <div className="zoom-buttons-bottom">
          <motion.button
            onClick={() => onScaleChange(-0.1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            −
          </motion.button>
          <motion.button
            onClick={() => onScaleChange(0.1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            ＋
          </motion.button>
        </div>
        </div>
      </div>
    </div>
  );
}

