import { useEffect, useState } from 'react'

export default function Display() {
  const [url, setUrl] = useState(localStorage.getItem('media_url') || '')

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'media_url' && e.newValue) {
        setUrl(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (!url) {
    return (
      <div style={{
        color: 'white',
        textAlign: 'center',
        marginTop: '40%',
        fontFamily: 'sans-serif'
      }}>
        No media URL found.<br />Open config and add one.
      </div>
    )
  }

  const isVideo = url.endsWith('.mp4')

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: 'black'
    }}>
      {isVideo ? (
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <img
          src={url}
          alt="Media"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  )
}
