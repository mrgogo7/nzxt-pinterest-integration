/**
 * Pinterest Media Extractor Test Page
 * TEST ONLY - This component will be removed after testing.
 * 
 * Access via: ?test=1
 */

import React, { useState } from 'react';
import { fetchPinterestMedia, normalizePinterestUrl } from '../../utils/pinterest';
import { getMediaType } from '../../utils/media';
import './PinterestTest.css';

export default function PinterestTest() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMediaUrl(null);

    try {
      const normalized = normalizePinterestUrl(url);
      if (!normalized) {
        setError('Geçersiz Pinterest URL formatı. Örnek: https://tr.pinterest.com/pin/685391637080855586/');
        setLoading(false);
        return;
      }

      const extractedUrl = await fetchPinterestMedia(url);
      
      if (extractedUrl) {
        setMediaUrl(extractedUrl);
      } else {
        setError('Medya URL\'si bulunamadı. Pinterest sayfasının yapısı değişmiş olabilir.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      console.error('[PinterestTest] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const mediaType = mediaUrl ? getMediaType(mediaUrl) : null;

  return (
    <div className="pinterest-test">
      <div className="pinterest-test-container">
        <h1>Pinterest Medya Çözücü Test</h1>
        <p className="pinterest-test-description">
          Pinterest pin URL'lerinden medya URL'lerini çıkarmak için test sayfası.
        </p>

        <form onSubmit={handleSubmit} className="pinterest-test-form">
          <div className="pinterest-test-input-group">
            <label htmlFor="pinterest-url">Pinterest Pin URL:</label>
            <input
              id="pinterest-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://tr.pinterest.com/pin/685391637080855586/ veya https://pin.it/2h7rjiNxi"
              disabled={loading}
              className="pinterest-test-input"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !url.trim()}
            className="pinterest-test-button"
          >
            {loading ? 'Çözülüyor...' : 'Çöz'}
          </button>
        </form>

        {error && (
          <div className="pinterest-test-error">
            <strong>Hata:</strong> {error}
          </div>
        )}

        {mediaUrl && (
          <div className="pinterest-test-result">
            <div className="pinterest-test-url-display">
              <strong>Bulunan Medya URL:</strong>
              <a 
                href={mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="pinterest-test-url-link"
              >
                {mediaUrl}
              </a>
            </div>

            <div className="pinterest-test-media-preview">
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  controls
                  className="pinterest-test-video"
                >
                  Tarayıcınız video oynatmayı desteklemiyor.
                </video>
              ) : mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt="Pinterest Medya"
                  className="pinterest-test-image"
                />
              ) : (
                <div className="pinterest-test-unknown">
                  Bilinmeyen medya türü. URL'yi doğrudan açmayı deneyin.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

