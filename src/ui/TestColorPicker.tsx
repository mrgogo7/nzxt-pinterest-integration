import { useState } from 'react';
import GradientColorPicker from 'react-best-gradient-color-picker';
import ColorPicker from './components/ColorPicker';
import './styles/TestColorPicker.css';

/**
 * react-best-gradient-color-picker için basit test sayfası.
 * ?test=1 URL parametresi ile erişilebilir.
 * 
 * Tek bir test sayfası ile tüm özellikleri test edin.
 */
export default function TestColorPicker() {
  // Ana test renkleri
  const [directColor, setDirectColor] = useState('rgba(255, 0, 0, 1)');
  const [wrapperColor, setWrapperColor] = useState('rgba(0, 255, 0, 1)');

  // Prop kontrolleri
  const [hideAlpha, setHideAlpha] = useState(false);
  const [hideGradient, setHideGradient] = useState(false);
  const [wrapperAllowAlpha, setWrapperAllowAlpha] = useState(false);
  const [wrapperAllowGradient, setWrapperAllowGradient] = useState(false);

  // EyeDropper testi için renk örnekleri
  const renkOrnekleri = [
    { isim: 'Kırmızı', renk: '#ff0000', rgba: 'rgba(255, 0, 0, 1)' },
    { isim: 'Yeşil', renk: '#00ff00', rgba: 'rgba(0, 255, 0, 1)' },
    { isim: 'Mavi', renk: '#0000ff', rgba: 'rgba(0, 0, 255, 1)' },
    { isim: 'Sarı', renk: '#ffff00', rgba: 'rgba(255, 255, 0, 1)' },
    { isim: 'Cyan', renk: '#00ffff', rgba: 'rgba(0, 255, 255, 1)' },
    { isim: 'Magenta', renk: '#ff00ff', rgba: 'rgba(255, 0, 255, 1)' },
    { isim: 'Turuncu', renk: '#ffa500', rgba: 'rgba(255, 165, 0, 1)' },
    { isim: 'Mor', renk: '#800080', rgba: 'rgba(128, 0, 128, 1)' },
  ];

  return (
    <div className="test-color-picker-page">
      <h1>react-best-gradient-color-picker Test Sayfası</h1>
      <p className="test-intro">
        Bu sayfa tek bir test ortamı sağlar. Aşağıdaki soruları yanıtlayarak tüm özellikleri test edin.
      </p>

      {/* Kontrol Paneli */}
      <div className="test-section test-control-panel">
        <h2>Kontrol Paneli</h2>
        <div className="control-grid">
          <div className="control-group">
            <h3>Doğrudan Paket (GradientColorPicker)</h3>
            <label>
              <input
                type="checkbox"
                checked={!hideAlpha}
                onChange={(e) => setHideAlpha(!e.target.checked)}
              />
              Alpha Slider Göster (hideAlpha={String(hideAlpha)})
            </label>
            <label>
              <input
                type="checkbox"
                checked={!hideGradient}
                onChange={(e) => setHideGradient(!e.target.checked)}
              />
              Gradient Kontrolleri Göster (hideGradient={String(hideGradient)})
            </label>
          </div>
          <div className="control-group">
            <h3>Wrapper Component (ColorPicker)</h3>
            <label>
              <input
                type="checkbox"
                checked={wrapperAllowAlpha}
                onChange={(e) => setWrapperAllowAlpha(e.target.checked)}
              />
              Alpha İzin Ver (allowAlpha={String(wrapperAllowAlpha)})
            </label>
            <label>
              <input
                type="checkbox"
                checked={wrapperAllowGradient}
                onChange={(e) => setWrapperAllowGradient(e.target.checked)}
              />
              Gradient İzin Ver (allowGradient={String(wrapperAllowGradient)})
            </label>
          </div>
        </div>
      </div>

      {/* Renk Örnekleri - EyeDropper Testi */}
      <div className="test-section">
        <h2>Renk Örnekleri - EyeDropper Testi İçin</h2>
        <p className="test-description">
          ColorPicker'da EyeDropper butonuna tıklayın, sonra bu renklerden birine tıklayarak rengi seçin.
        </p>
        <div className="color-samples-grid">
          {renkOrnekleri.map((ornek, index) => (
            <div
              key={index}
              className="color-sample"
              style={{ backgroundColor: ornek.renk }}
              title={`${ornek.isim} - ${ornek.renk}`}
            >
              <span className="color-sample-name">{ornek.isim}</span>
              <span className="color-sample-value">{ornek.rgba}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test 1: Doğrudan Paket */}
      <div className="test-section">
        <h2>Test 1: Doğrudan Paket Kullanımı (GradientColorPicker)</h2>
        <p className="test-description">
          Paketi doğrudan kullanarak test edin. Yukarıdaki kontrol panelinden hideAlpha ve hideGradient değerlerini değiştirin.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <div className="picker-container">
              <GradientColorPicker
                value={directColor}
                onChange={(newColor) => {
                  console.log('[Doğrudan Paket] onChange:', newColor);
                  setDirectColor(newColor);
                }}
                hideAlpha={hideAlpha}
                hideGradient={hideGradient}
              />
            </div>
            <div className="test-info">
              <p><strong>Mevcut Değer:</strong> <code>{directColor}</code></p>
              <p><strong>Props:</strong> hideAlpha={String(hideAlpha)}, hideGradient={String(hideGradient)}</p>
            </div>
          </div>
          <div className="test-preview-area">
            <div className="test-box-alpha-container">
              <div className="test-box-alpha-background" />
              <div 
                className="test-box-alpha-foreground" 
                style={{ background: directColor }}
              >
                Doğrudan Paket Önizleme
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test 2: Wrapper Component */}
      <div className="test-section">
        <h2>Test 2: Wrapper Component (ColorPicker)</h2>
        <p className="test-description">
          Wrapper component'i kullanarak test edin. Yukarıdaki kontrol panelinden allowAlpha ve allowGradient değerlerini değiştirin.
          Popup pozisyonunu test etmek için butona tıklayın.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <ColorPicker
              value={wrapperColor}
              onChange={(newColor) => {
                console.log('[Wrapper Component] onChange:', newColor);
                setWrapperColor(newColor);
              }}
              showInline={false}
              allowAlpha={wrapperAllowAlpha}
              allowGradient={wrapperAllowGradient}
            />
            <div className="test-info">
              <p><strong>Mevcut Değer:</strong> <code>{wrapperColor}</code></p>
              <p><strong>Props:</strong> allowAlpha={String(wrapperAllowAlpha)}, allowGradient={String(wrapperAllowGradient)}</p>
              <p className="test-note">⚠️ Popup pozisyonunu test etmek için butona tıklayın. Popup butonun yanında açılmalı.</p>
            </div>
          </div>
          <div className="test-preview-area">
            <div className="test-box-alpha-container">
              <div className="test-box-alpha-background" />
              <div 
                className="test-box-alpha-foreground" 
                style={{ background: wrapperColor }}
              >
                Wrapper Component Önizleme
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Pozisyon Testi */}
      <div className="test-section">
        <h2>Popup Pozisyon Testi</h2>
        <p className="test-description">
          Farklı ekran konumlarında popup pozisyonlamasını test edin. Her ColorPicker'a tıklayarak popup'ın nerede açıldığını görün.
        </p>
        <div className="position-test-grid">
          <div className="position-test-item">
            <ColorPicker
              value={wrapperColor}
              onChange={setWrapperColor}
              showInline={false}
              allowAlpha={false}
              allowGradient={false}
            />
            <span>Sol Üst</span>
          </div>
          <div className="position-test-item">
            <ColorPicker
              value={wrapperColor}
              onChange={setWrapperColor}
              showInline={false}
              allowAlpha={true}
              allowGradient={false}
            />
            <span>Sağ Üst</span>
          </div>
          <div className="position-test-item">
            <ColorPicker
              value={wrapperColor}
              onChange={setWrapperColor}
              showInline={false}
              allowAlpha={false}
              allowGradient={true}
            />
            <span>Sol Alt</span>
          </div>
          <div className="position-test-item">
            <ColorPicker
              value={wrapperColor}
              onChange={setWrapperColor}
              showInline={false}
              allowAlpha={true}
              allowGradient={true}
            />
            <span>Sağ Alt</span>
          </div>
        </div>
      </div>

      {/* Test Soruları */}
      <div className="test-section test-questions">
        <h2>Test Soruları</h2>
        <p className="test-description">
          Aşağıdaki soruları yanıtlayarak tüm özellikleri test edin. Console'u açık tutun (F12) ve log'ları kontrol edin.
        </p>
        
        <div className="questions-list">
          <div className="question-item">
            <h3>1. Alpha Slider Kontrolü</h3>
            <p><strong>Soru:</strong> Kontrol panelinde "Alpha Slider Göster"i işaretleyip kaldırdığınızda, Alpha slider görünüyor/gizleniyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, Alpha slider doğru şekilde gösteriliyor/gizleniyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, Alpha slider her zaman görünüyor veya hiç görünmüyor
            </label>
          </div>

          <div className="question-item">
            <h3>2. Gradient Kontrolleri</h3>
            <p><strong>Soru:</strong> Kontrol panelinde "Gradient Kontrolleri Göster"i işaretleyip kaldırdığınızda, Gradient kontrolleri görünüyor/gizleniyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, Gradient kontrolleri doğru şekilde gösteriliyor/gizleniyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, Gradient kontrolleri her zaman görünüyor veya hiç görünmüyor
            </label>
          </div>

          <div className="question-item">
            <h3>3. Renk Seçimi</h3>
            <p><strong>Soru:</strong> Renk paletinde renk seçtiğinizde, seçtiğiniz renk önizleme kutusunda görünüyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, seçtiğim renk doğru şekilde görünüyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, seçtiğim renk görünmüyor veya yanlış renk görünüyor
            </label>
          </div>

          <div className="question-item">
            <h3>4. RGBA Input</h3>
            <p><strong>Soru:</strong> RGBA input alanına manuel olarak değer girdiğinizde (örn: rgba(255, 0, 0, 0.5)), değer kabul ediliyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, RGBA değerleri doğru şekilde kabul ediliyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, RGBA değerleri kabul edilmiyor
            </label>
          </div>

          <div className="question-item">
            <h3>5. HEX Input</h3>
            <p><strong>Soru:</strong> HEX input alanına manuel olarak değer girdiğinizde (örn: #ff0000), değer kabul ediliyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, HEX değerleri doğru şekilde kabul ediliyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, HEX değerleri kabul edilmiyor
            </label>
          </div>

          <div className="question-item">
            <h3>6. EyeDropper</h3>
            <p><strong>Soru:</strong> EyeDropper butonuna tıklayıp yukarıdaki Renk Örnekleri'nden birine tıkladığınızda, doğru renk seçiliyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, EyeDropper doğru rengi seçiyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, EyeDropper yanlış renk seçiyor (Console'da log'u kontrol edin)
            </label>
            <p className="test-note">Console'da <code>[Doğrudan Paket] onChange:</code> log'unu kontrol edin.</p>
          </div>

          <div className="question-item">
            <h3>7. Popup Pozisyonu</h3>
            <p><strong>Soru:</strong> Wrapper Component'teki butona tıkladığınızda, popup butonun yanında açılıyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, popup butonun yanında doğru konumda açılıyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, popup sol üstte veya yanlış konumda açılıyor
            </label>
            <p className="test-note">Console'da <code>[ColorPicker] Popup position calculated:</code> log'unu kontrol edin.</p>
          </div>

          <div className="question-item">
            <h3>8. onChange Callback</h3>
            <p><strong>Soru:</strong> Renk değiştiğinde, Console'da onChange log'ları görünüyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, Console'da onChange log'ları görünüyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, Console'da onChange log'ları görünmüyor
            </label>
            <p className="test-note">Console'u açın (F12) ve <code>[Doğrudan Paket] onChange:</code> ve <code>[Wrapper Component] onChange:</code> log'larını kontrol edin.</p>
          </div>

          <div className="question-item">
            <h3>9. Wrapper Component - allowGradient=false</h3>
            <p><strong>Soru:</strong> Wrapper Component'te "Gradient İzin Ver"i kapatıp gradient oluşturduğunuzda, gradient string yerine RGBA döndürülüyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, allowGradient=false olduğunda RGBA döndürülüyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, gradient string döndürülüyor
            </label>
            <p className="test-note">Console'da <code>[Wrapper Component] onChange:</code> log'unu kontrol edin. Gradient string yerine RGBA görünmeli.</p>
          </div>

          <div className="question-item">
            <h3>10. Görsel Uyum</h3>
            <p><strong>Soru:</strong> ColorPicker görsel olarak demo sayfasındakine (https://gradient-package-demo.web.app/) benziyor mu?</p>
            <label>
              <input type="checkbox" />
              ✅ Evet, görsel olarak demo sayfasına benziyor
            </label>
            <label>
              <input type="checkbox" />
              ❌ Hayır, görsel olarak farklı (farklılıkları açıklayın)
            </label>
          </div>
        </div>
      </div>

      {/* Debug Bilgisi */}
      <div className="test-section">
        <h2>Debug Bilgisi</h2>
        <div className="debug-info">
          <p><strong>Doğrudan Paket Değeri:</strong> <code>{directColor}</code></p>
          <p><strong>Wrapper Component Değeri:</strong> <code>{wrapperColor}</code></p>
          <p><strong>Paket Props:</strong> hideAlpha={String(hideAlpha)}, hideGradient={String(hideGradient)}</p>
          <p><strong>Wrapper Props:</strong> allowAlpha={String(wrapperAllowAlpha)}, allowGradient={String(wrapperAllowGradient)}</p>
        </div>
        <div className="test-info" style={{ marginTop: '20px' }}>
          <p className="test-note">
            🔍 Console'u açın (F12) ve şu log'ları kontrol edin:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li><code>[Doğrudan Paket] onChange:</code> - Paket'in döndürdüğü değer</li>
            <li><code>[Wrapper Component] onChange:</code> - Wrapper'ın döndürdüğü değer</li>
            <li><code>[ColorPicker] Popup position calculated:</code> - Popup pozisyon hesaplaması</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
