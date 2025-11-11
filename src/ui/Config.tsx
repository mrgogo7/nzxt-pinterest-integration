import { useState, useEffect } from 'react'
import ConfigPreview from './components/ConfigPreview'

export default function Config() {
  // Tek URL kaynağı
  const [url, setUrl] = useState(
    () => JSON.parse(localStorage.getItem('nzxtMediaConfig') || '{}').url || localStorage.getItem('media_url') || ''
  )

  // LocalStorage güncellemesi (her değişiklikte)
  useEffect(() => {
    const currentConfig = JSON.parse(localStorage.getItem('nzxtMediaConfig') || '{}')
    const newConfig = { ...currentConfig, url }
    localStorage.setItem('nzxtMediaConfig', JSON.stringify(newConfig))
    localStorage.setItem('media_url', url)
  }, [url])

  return (
    <div
      style={{
        padding: '1rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#111',
        minHeight: '100vh',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Pinterest Media URL</h2>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://...jpg veya .mp4"
        style={{
          width: '100%',
          padding: '0.5rem',
          marginTop: '1rem',
          borderRadius: '6px',
          border: '1px solid #555',
          backgroundColor: '#222',
          color: 'white',
        }}
      />
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
        LCD’de ve aşağıdaki önizlemede anında görüntülenir. Görselin doğrudan .jpg veya .mp4 bağlantısını kullan.
      </p>

      {/* Thumbnail ve medya ayarları */}
      <hr style={{ margin: '2rem 0', borderColor: '#333' }} />
      <ConfigPreview />
    </div>
  )
}
