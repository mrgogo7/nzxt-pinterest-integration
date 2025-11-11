import { useState, useEffect } from 'react'

export default function Config() {
  const [url, setUrl] = useState(localStorage.getItem('media_url') || '')

  useEffect(() => {
    // Giriş yapıldığında anında kaydet
    localStorage.setItem('media_url', url)
  }, [url])

  return (
    <div style={{
      padding: '1rem',
      fontFamily: 'sans-serif',
      color: 'white',
      backgroundColor: '#111',
      minHeight: '100vh'
    }}>
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
          color: 'white'
        }}
      />
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
        LCD’de anında önizlenir. Girmek istediğin görselin doğrudan .jpg veya .mp4 bağlantısını kullan.
      </p>
    </div>
  )
}
