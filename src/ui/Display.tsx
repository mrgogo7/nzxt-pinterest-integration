import { useEffect, useState } from 'react'

type Settings = {
  scale: number
  x: number
  y: number
  fit: 'cover' | 'contain' | 'fill'
  align: 'center' | 'top' | 'bottom' | 'left' | 'right'
  loop: boolean
  autoplay: boolean
  mute: boolean
  resolution: string
}

const DEFAULTS: Settings = {
  scale: 1.0,
  x: 0,
  y: 0,
  fit: 'cover',
  align: 'center',
  loop: true,
  autoplay: true,
  mute: true,
  resolution: `${window.innerWidth} x ${window.innerHeight}`,
}

export default function Display() {
  const [url, setUrl] = useState<string>(localStorage.getItem('media_url') || '')
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('nzxtMediaConfig')
      if (saved) return { ...DEFAULTS, ...JSON.parse(saved) }
    } catch {}
    return DEFAULTS
  })

  const [deviceSize, setDeviceSize] = useState<{ w: number; h: number }>({
    w: (window as any)?.nzxt?.v1?.width || 640,
    h: (window as any)?.nzxt?.v1?.height || 640,
  })

  useEffect(() => {
    const api = (window as any)?.nzxt?.v1
    if (api && (api.width || api.height)) {
      setDeviceSize({ w: api.width ?? 640, h: api.height ?? 640 })
    }
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'media_url' && e.newValue) setUrl(e.newValue)
      if (e.key === 'nzxtMediaConfig' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setSettings((prev) => ({ ...prev, ...parsed }))
          if (parsed.url && parsed.url !== url) setUrl(parsed.url)
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [url])

  const isVideo = /\.mp4($|\?)/i.test(url)
  const objectPosition =
    settings.align === 'center' ? '50% 50%' :
    settings.align === 'top'    ? '50% 0%'  :
    settings.align === 'bottom' ? '50% 100%' :
    settings.align === 'left'   ? '0% 50%' :
                                  '100% 50%'

  const diameter = Math.min(deviceSize.w, deviceSize.h)
  const radius = (window as any)?.nzxt?.v1?.shape === 'circle' ? '50%' : '0%'

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          width: diameter,
          height: diameter,
          borderRadius: radius,
          overflow: 'hidden',
          border: '2px solid #111',
          background: '#000',
          position: 'relative',
        }}
      >
        <div
          className="media-layer"
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${settings.x}px, ${settings.y}px) scale(${settings.scale})`,
            transformOrigin: 'center center',
          }}
        >
          {isVideo ? (
            <video
              src={url}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: settings.fit,
                objectPosition,
                display: 'block',
              }}
            />
          ) : (
            url && (
              <img
                src={url}
                alt="Media"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: settings.fit,
                  objectPosition,
                  display: 'block',
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
