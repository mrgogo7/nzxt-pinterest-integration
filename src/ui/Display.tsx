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
    const saved = localStorage.getItem('nzxtMediaConfig')
    if (saved) {
      try { return { ...DEFAULTS, ...JSON.parse(saved) } } catch { return DEFAULTS }
    }
    return DEFAULTS
  })

  // storage event’lerini dinle (URL veya ayarlar değişince)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'media_url' && e.newValue !== null) {
        setUrl(e.newValue)
      }
      if (e.key === 'nzxtMediaConfig' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setSettings((prev) => ({ ...prev, ...parsed }))
          if (parsed.url && parsed.url !== url) setUrl(parsed.url)
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)

    // İlk yüklemede senkron:
    const initCfg = localStorage.getItem('nzxtMediaConfig')
    if (initCfg) {
      try {
        const parsed = JSON.parse(initCfg)
        setSettings((prev) => ({ ...prev, ...parsed }))
        if (parsed.url && parsed.url !== url) setUrl(parsed.url)
      } catch {}
    } else {
      const legacy = localStorage.getItem('media_url')
      if (legacy && legacy !== url) setUrl(legacy)
    }

    return () => window.removeEventListener('storage', onStorage)
  }, [url])

  const isVideo = /\.mp4($|\?)/i.test(url) || url.toLowerCase().includes('mp4')

  const objectPosition =
    settings.align === 'center' ? '50% 50%' :
    settings.align === 'top'    ? '50% 0%'  :
    settings.align === 'bottom' ? '50% 100%' :
    settings.align === 'left'   ? '0% 50%' :
                                  '100% 50%'

  // Ekranı dairesel maske ile sun (Kraken LCD’ye benzer)
  // Not: gerçek LCD boyutu CAM tarafından verilir; burada simülasyon yapıyoruz.
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
          width: 320,           // simülasyon çapı (px) – CAM tarafında gerçek LCD çözünürlüğüne göre gelebilir
          height: 320,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #222',
          backgroundColor: '#000',
          position: 'relative',
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
              transform: `translate(${settings.x}px, ${settings.y}px) scale(${settings.scale})`,
              transformOrigin: 'center center',
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
                transform: `translate(${settings.x}px, ${settings.y}px) scale(${settings.scale})`,
                transformOrigin: 'center center',
              }}
            />
          )
        )}
      </div>
    </div>
  )
}
