import React, { useEffect, useState } from 'react'
import { getMediaUrl, setMediaUrl } from '../storage'

export default function Config() {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(getMediaUrl())
  }, [])

  function save() {
    const u = url.trim()
    if (!u) {
      alert('Lütfen geçerli bir URL girin.')
      return
    }
    setMediaUrl(u)
    document.cookie = `media_url=${encodeURIComponent(u)}; path=/; SameSite=None; Secure`
    alert('URL kaydedildi! LCD ekran birkaç saniye içinde güncellenecek.')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#121212',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 680,
        maxWidth: '90vw',
        background: '#1e1e1e',
        padding: 20,
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,.35)',
      }}>
        <h2>NZXT Pinterest Integration</h2>
        <p>MP4 veya JPG/PNG/GIF URL’si girin (Pinterest dosya URL’si):</p>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…/file.mp4 veya file.jpg"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#0f0f0f',
            color: '#fff',
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={save}
            style={{
              background: '#e6007a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              cursor: 'pointer',
            }}
          >
            Kaydet
          </button>
          <a
            href="./"
            target="_blank"
            style={{
              background: '#2d2d2d',
              color: '#fff',
              borderRadius: 8,
              padding: '10px 16px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Display’i Aç
          </a>
        </div>
      </div>
    </div>
  )
}
