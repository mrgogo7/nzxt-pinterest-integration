import { useState } from 'react';
import GradientColorPicker from 'react-best-gradient-color-picker';
import ColorPicker from './components/ColorPicker';
import './styles/TestColorPicker.css';

/**
 * react-best-gradient-color-picker için kapsamlı test sayfası.
 * ?test=1 URL parametresi ile erişilebilir.
 * 
 * Test 6'nın çalışan yapısına göre tüm testler güncellendi.
 */
export default function TestColorPicker() {
  // Test 1: Gradient string ile başla (Test 6 gibi)
  const [color1, setColor1] = useState('linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,0,0,1) 100%)');
  
  // Test 2: Alpha testi - Gradient string ile başla
  const [color2, setColor2] = useState('linear-gradient(90deg, rgba(0,255,0,0.5) 0%, rgba(0,255,0,0.5) 100%)');
  
  // Test 3: Gradient testi - Gradient string ile başla
  const [color3, setColor3] = useState('linear-gradient(90deg, rgba(0,0,255,1) 0%, rgba(0,0,255,1) 100%)');
  
  // Test 4: Alpha + Gradient - Gradient string ile başla
  const [color4, setColor4] = useState('linear-gradient(90deg, rgba(255,255,0,0.8) 0%, rgba(255,255,0,0.8) 100%)');
  
  // Test 5: Temel renk - Gradient string ile başla
  const [color5, setColor5] = useState('linear-gradient(90deg, rgba(128,128,128,1) 0%, rgba(128,128,128,1) 100%)');
  
  // Test 6: Çalışan örnek (referans)
  const [color6, setColor6] = useState('linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)');
  
  // Test 7: Wrapper ColorPicker - Popup açılma testi
  const [color7, setColor7] = useState('rgba(255, 0, 255, 1)');

  // Test 9: Gradient String Handling - allowGradient=false olduğunda RGBA'ya dönüşüm
  const [color9, setColor9] = useState('rgba(255, 0, 0, 1)');

  // Test 10: EyeDropper detaylı testi
  const [eyeDropColor, setEyeDropColor] = useState('rgba(18, 19, 23, 1)');

  // EyeDropper testi için renk örnekleri
  const renkOrnekleri = [
    { isim: 'Kırmızı', renk: '#ff0000' },
    { isim: 'Yeşil', renk: '#00ff00' },
    { isim: 'Mavi', renk: '#0000ff' },
    { isim: 'Sarı', renk: '#ffff00' },
    { isim: 'Cyan', renk: '#00ffff' },
    { isim: 'Magenta', renk: '#ff00ff' },
    { isim: 'Turuncu', renk: '#ffa500' },
    { isim: 'Mor', renk: '#800080' },
  ];

  return (
    <div className="test-color-picker-page">
      <h1>react-best-gradient-color-picker Kapsamlı Test Sayfası</h1>
      <p className="test-intro">
        Test 6'nın çalışan yapısına göre tüm testler güncellendi. 
        Tüm testler gradient string ile başlıyor (Test 6 gibi).
        EyeDropper hariç tüm özellikler Test 6'da çalışıyor.
      </p>

      {/* Renk Örnekleri - EyeDropper Testi İçin */}
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
              <span className="color-sample-value">{ornek.renk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test 1: Tüm Özellikler Açık (Test 6 gibi gradient string ile) */}
      <div className="test-section">
        <h2>Test 1: Tüm Özellikler Açık (Test 6 Yapısı)</h2>
        <p className="test-description">
          Test 6 gibi gradient string ile başlıyor. hideAlpha=false, hideGradient=false
          <br />
          <strong>⚠️ Kontrol:</strong> Alpha slider, Gradient kontrolleri ve EyeDropper görünmeli. Eğer görünmüyorsa, paket prop'ları doğru okumuyor demektir.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <div className="picker-container">
              <GradientColorPicker
                value={color1}
                onChange={setColor1}
                hideAlpha={false}
                hideGradient={false}
              />
            </div>
            <div className="test-info">
              <p><strong>Mevcut değer:</strong> <code>{color1}</code></p>
              <p><strong>Props:</strong> hideAlpha=false, hideGradient=false</p>
              <p className="test-note">✅ Gösterilmeli: Alpha slider, Gradient kontrolleri, EyeDropper</p>
              <p className="test-warning">⚠️ Eğer Alpha slider veya Gradient kontrolleri görünmüyorsa, paket prop'ları doğru okumuyor demektir.</p>
            </div>
          </div>
          <div className="test-preview-area">
            <div 
              className="test-box" 
              style={{ 
                background: color1.includes('gradient') ? color1 : color1 
              }}
            >
              Önizleme Kutusu 1
            </div>
          </div>
        </div>
      </div>

      {/* Test 2: Alpha Testi (Şeffaflık Önizlemesi ile) */}
      <div className="test-section">
        <h2>Test 2: Alpha Testi (Şeffaflık Önizlemesi ile)</h2>
        <p className="test-description">
          Test 6 gibi gradient string ile başlıyor. hideAlpha=false, hideGradient=true
          Alpha slider çalışmalı. Şeffaflığı görmek için üst üste 2 kutu kullanılıyor.
          <br />
          <strong>⚠️ Kontrol:</strong> Alpha slider görünmeli, Gradient kontrolleri gizlenmeli. Eğer Gradient kontrolleri görünüyorsa, hideGradient prop'u çalışmıyor demektir.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <div className="picker-container">
              <GradientColorPicker
                value={color2}
                onChange={setColor2}
                hideAlpha={false}
                hideGradient={true}
              />
            </div>
            <div className="test-info">
              <p><strong>Mevcut değer:</strong> <code>{color2}</code></p>
              <p><strong>Props:</strong> hideAlpha=false, hideGradient=true</p>
              <p className="test-note">✅ Gösterilmeli: Alpha slider, EyeDropper | ❌ Gizlenmeli: Gradient</p>
              <p className="test-warning">⚠️ Şeffaflık testi: Alpha değerini değiştirin ve üst kutunun şeffaflaştığını görün.</p>
              <p className="test-warning">⚠️ Eğer Gradient kontrolleri görünüyorsa, hideGradient prop'u çalışmıyor demektir.</p>
            </div>
          </div>
          <div className="test-preview-area">
            {/* Şeffaflık önizlemesi - üst üste 2 kutu */}
            <div className="test-box-alpha-container">
              <div className="test-box-alpha-background" />
              <div 
                className="test-box-alpha-foreground" 
                style={{ 
                  background: color2.includes('gradient') ? color2 : color2 
                }}
              >
                Alpha Önizleme (Üst Kutu)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test 3: Gradient Testi */}
      <div className="test-section">
        <h2>Test 3: Gradient Testi</h2>
        <p className="test-description">
          Test 6 gibi gradient string ile başlıyor. hideAlpha=true, hideGradient=false
          Gradient kontrolleri çalışmalı.
          <br />
          <strong>⚠️ Kontrol:</strong> Gradient kontrolleri görünmeli, Alpha slider gizlenmeli. Eğer Alpha slider görünüyorsa, hideAlpha prop'u çalışmıyor demektir.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <div className="picker-container">
              <GradientColorPicker
                value={color3}
                onChange={setColor3}
                hideAlpha={true}
                hideGradient={false}
              />
            </div>
            <div className="test-info">
              <p><strong>Mevcut değer:</strong> <code>{color3}</code></p>
              <p><strong>Props:</strong> hideAlpha=true, hideGradient=false</p>
              <p className="test-note">✅ Gösterilmeli: Gradient kontrolleri, EyeDropper | ❌ Gizlenmeli: Alpha slider</p>
              <p className="test-warning">⚠️ Eğer Alpha slider görünüyorsa, hideAlpha prop'u çalışmıyor demektir.</p>
            </div>
          </div>
          <div className="test-preview-area">
            <div 
              className="test-box" 
              style={{ 
                background: color3.includes('gradient') ? color3 : color3 
              }}
            >
              Gradient Önizleme
            </div>
          </div>
        </div>
      </div>

      {/* Test 4: Alpha + Gradient (Şeffaflık Önizlemesi ile) */}
      <div className="test-section">
        <h2>Test 4: Alpha + Gradient (Şeffaflık Önizlemesi ile)</h2>
        <p className="test-description">
          Test 6 gibi gradient string ile başlıyor. hideAlpha=false, hideGradient=false
          Her ikisi de çalışmalı.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <div className="picker-container">
              <GradientColorPicker
                value={color4}
                onChange={setColor4}
                hideAlpha={false}
                hideGradient={false}
              />
            </div>
            <div className="test-info">
              <p><strong>Mevcut değer:</strong> <code>{color4}</code></p>
              <p className="test-note">✅ Gösterilmeli: Alpha slider, Gradient kontrolleri, EyeDropper</p>
            </div>
          </div>
          <div className="test-preview-area">
            {/* Şeffaflık önizlemesi */}
            <div className="test-box-alpha-container">
              <div className="test-box-alpha-background" />
              <div 
                className="test-box-alpha-foreground" 
                style={{ 
                  background: color4.includes('gradient') ? color4 : color4 
                }}
              >
                Alpha + Gradient Önizleme
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test 5: Temel Renk */}
      <div className="test-section">
        <h2>Test 5: Temel Renk (Tüm Özellikler Kapalı)</h2>
        <p className="test-description">
          Test 6 gibi gradient string ile başlıyor. hideAlpha=true, hideGradient=true
          Sadece temel renk seçici görünmeli.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <div className="picker-container">
              <GradientColorPicker
                value={color5}
                onChange={setColor5}
                hideAlpha={true}
                hideGradient={true}
              />
            </div>
            <div className="test-info">
              <p><strong>Mevcut değer:</strong> <code>{color5}</code></p>
              <p className="test-note">✅ Gösterilmeli: Temel renk seçici, EyeDropper | ❌ Gizlenmeli: Alpha, Gradient</p>
            </div>
          </div>
          <div className="test-preview-area">
            <div 
              className="test-box" 
              style={{ 
                background: color5.includes('gradient') ? color5 : color5 
              }}
            >
              Temel Renk Önizleme
            </div>
          </div>
        </div>
      </div>

      {/* Test 6: Çalışan Örnek (Referans) */}
      <div className="test-section test-highlight">
        <h2>Test 6: Çalışan Örnek ⭐ (Referans - Her Şey Çalışıyor, EyeDropper Hariç)</h2>
        <p className="test-description">
          Bu test gösteriyor ki alpha, gradient ve tüm özellikler doğru çalışıyor.
          Sadece EyeDropper yukarıdaki renk örnekleri ile test edilmeli.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <div className="picker-container">
              <GradientColorPicker
                value={color6}
                onChange={setColor6}
                hideAlpha={false}
                hideGradient={false}
              />
            </div>
            <div className="test-info">
              <p><strong>Mevcut değer:</strong> <code>{color6}</code></p>
              <p className="test-success">✅ Alpha slider çalışıyor | ✅ Gradient kontrolleri çalışıyor | ⚠️ EyeDropper test edilmeli</p>
            </div>
          </div>
          <div className="test-preview-area">
            <div 
              className="test-box" 
              style={{ 
                background: color6.includes('gradient') 
                  ? color6 
                  : color6 
              }}
            >
              Gradient Önizleme (Çalışan Örnek)
            </div>
          </div>
        </div>
      </div>

      {/* Test 7: Wrapper ColorPicker - Popup Açılma Testi */}
      <div className="test-section">
        <h2>Test 7: Wrapper ColorPicker - Popup Açılma Testi</h2>
        <p className="test-description">
          ColorPicker wrapper component'inin popup pozisyonlama ve açılma davranışını test edin.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <ColorPicker
              value={color7}
              onChange={setColor7}
              showInline={false}
              allowAlpha={true}
              allowGradient={true}
            />
            <div className="test-info">
              <p><strong>Mevcut değer:</strong> <code>{color7}</code></p>
              <p className="test-note">✅ Tetik butonuna tıklayın - popup butonun yanında açılmalı</p>
              <p className="test-note">✅ Aşağıdaki farklı ekran konumlarında popup pozisyonunu test edin</p>
            </div>
          </div>
          <div className="test-preview-area">
            <div className="test-box" style={{ backgroundColor: color7 }}>
              Wrapper ColorPicker Önizleme
            </div>
          </div>
        </div>
      </div>

      {/* Test 8: Popup Pozisyon Testi - Farklı Konumlar */}
      <div className="test-section">
        <h2>Test 8: Popup Pozisyon Testi - Farklı Ekran Konumları</h2>
        <p className="test-description">
          Farklı ekran konumlarında popup pozisyonlamasını test edin. Her ColorPicker'a tıklayarak popup'ın nerede açıldığını görün.
        </p>
        <div className="position-test-grid">
          <div className="position-test-item">
            <ColorPicker
              value={color1}
              onChange={setColor1}
              showInline={false}
              allowAlpha={false}
              allowGradient={false}
            />
            <span>Sol Üst Köşe</span>
            <small>Popup doğru konumlanmalı</small>
          </div>
          <div className="position-test-item">
            <ColorPicker
              value={color2}
              onChange={setColor2}
              showInline={false}
              allowAlpha={true}
              allowGradient={false}
            />
            <span>Sağ Üst Köşe</span>
            <small>Popup doğru konumlanmalı</small>
          </div>
          <div className="position-test-item">
            <ColorPicker
              value={color3}
              onChange={setColor3}
              showInline={false}
              allowAlpha={false}
              allowGradient={true}
            />
            <span>Sol Alt Köşe</span>
            <small>Popup doğru konumlanmalı</small>
          </div>
          <div className="position-test-item">
            <ColorPicker
              value={color4}
              onChange={setColor4}
              showInline={false}
              allowAlpha={true}
              allowGradient={true}
            />
            <span>Sağ Alt Köşe</span>
            <small>Popup doğru konumlanmalı</small>
          </div>
        </div>
      </div>

      {/* Test 9: Gradient String Handling - allowGradient=false olduğunda RGBA'ya dönüşüm */}
      <div className="test-section">
        <h2>Test 9: Gradient String Handling (allowGradient=false)</h2>
        <p className="test-description">
          allowGradient=false olduğunda, paket gradient string döndürse bile RGBA'ya dönüştürülmeli.
          Wrapper component'inin gradient string handling'ini test edin.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <div className="picker-container">
              <GradientColorPicker
                value={color9}
                onChange={(newColor) => {
                  console.log('[Test 9] Package returned:', newColor);
                  setColor9(newColor);
                }}
                hideAlpha={false}
                hideGradient={true}
              />
            </div>
            <div className="test-info">
              <p><strong>Mevcut değer (Package):</strong> <code>{color9}</code></p>
              <p className="test-note">
                ⚠️ Paket hideGradient=true olduğunda bile bazen gradient string döndürebilir. 
                Wrapper component bunu RGBA'ya dönüştürmeli.
              </p>
            </div>
          </div>
          <div className="test-controls">
            <ColorPicker
              value={color9}
              onChange={(newColor) => {
                console.log('[Test 9] Wrapper returned:', newColor);
                setColor9(newColor);
              }}
              showInline={false}
              allowAlpha={true}
              allowGradient={false}
            />
            <div className="test-info">
              <p><strong>Wrapper Component (allowGradient=false):</strong></p>
              <p className="test-note">
                ✅ Wrapper her zaman RGBA döndürmeli (gradient string olsa bile)
              </p>
            </div>
          </div>
          <div className="test-preview-area">
            <div className="test-box" style={{ backgroundColor: color9 }}>
              Gradient String Handling Testi
            </div>
          </div>
        </div>
      </div>

      {/* Test 10: EyeDropper Detaylı Testi */}
      <div className="test-section test-highlight">
        <h2>Test 10: EyeDropper Detaylı Testi</h2>
        <p className="test-description">
          EyeDropper sorununu detaylı test edin. EyeDropper butonuna tıklayın, sonra yukarıdaki Renk Örnekleri'nden veya ekrandaki herhangi bir renge tıklayın.
          Console'da seçilen rengi kontrol edin.
        </p>
        <div className="test-row">
          <div className="test-controls">
            <div className="picker-container">
              <GradientColorPicker
                value={eyeDropColor}
                onChange={(newColor) => {
                  console.log('[Test 10 - EyeDropper] Package returned:', newColor);
                  setEyeDropColor(newColor);
                }}
                hideAlpha={false}
                hideGradient={false}
              />
            </div>
            <div className="test-info">
              <p><strong>Seçilen Renk:</strong> <code>{eyeDropColor}</code></p>
              <p className="test-note">
                ⚠️ EyeDropper yanlış renk seçiyor: 121317 rengini seçiyor ama farklı bir renk seçiliyor.
                Console'da seçilen gerçek rengi kontrol edin.
              </p>
              <p className="test-note">
                🔍 Test Adımları:
              </p>
              <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
                <li>EyeDropper butonuna tıklayın</li>
                <li>Yukarıdaki Renk Örnekleri'nden birine tıklayın (örn: Kırmızı #ff0000)</li>
                <li>Console'da dönen değeri kontrol edin</li>
                <li>Aşağıdaki önizleme kutusunda seçilen rengi görün</li>
              </ol>
            </div>
          </div>
          <div className="test-preview-area">
            <div className="test-box-alpha-container">
              <div className="test-box-alpha-background" />
              <div 
                className="test-box-alpha-foreground" 
                style={{ background: eyeDropColor }}
              >
                EyeDropper Önizleme
                <div style={{ marginTop: '10px', fontSize: '12px' }}>
                  Beklenen: Renk Örnekleri'nden seçtiğiniz renk<br />
                  Gerçek: {eyeDropColor}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Özellik Kontrol Listesi */}
      <div className="test-section">
        <h2>Özellik Kontrol Listesi</h2>
        <div className="checklist">
          <div className="checklist-item">
            <input type="checkbox" id="check-alpha" />
            <label htmlFor="check-alpha">Alpha slider çalışıyor (hideAlpha=false olduğunda) - Üst üste kutularla test edin</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check-gradient" />
            <label htmlFor="check-gradient">Gradient kontrolleri çalışıyor (hideGradient=false olduğunda) - Test 6 bunu doğruluyor</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check-eyedropper" />
            <label htmlFor="check-eyedropper">EyeDropper butonu çalışıyor - Yukarıdaki Renk Örnekleri bölümünden renk seçin</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check-rgba-input" />
            <label htmlFor="check-rgba-input">RGBA input alanı alpha değerlerini kabul ediyor - Test 2 ve 4'te test edin</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check-hex-input" />
            <label htmlFor="check-hex-input">HEX input alanı çalışıyor</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check-pointer" />
            <label htmlFor="check-pointer">Renk pointer/slider çalışıyor - Renk paletinde sürükleyin</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check-onchange" />
            <label htmlFor="check-onchange">onChange callback doğru çalışıyor - Aşağıdaki Debug Bilgisi'ni kontrol edin</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check-popup" />
            <label htmlFor="check-popup">Popup doğru açılıyor - Test 7 ve 8'i test edin</label>
          </div>
        </div>
      </div>

      {/* Debug Bilgisi */}
      <div className="test-section">
        <h2>Debug Bilgisi</h2>
        <div className="debug-info">
          <p><strong>Renk 1 (Tümü):</strong> {color1}</p>
          <p><strong>Renk 2 (Alpha):</strong> {color2}</p>
          <p><strong>Renk 3 (Gradient):</strong> {color3}</p>
          <p><strong>Renk 4 (Alpha+Gradient):</strong> {color4}</p>
          <p><strong>Renk 5 (Temel):</strong> {color5}</p>
          <p><strong>Renk 6 (Çalışan Örnek):</strong> {color6}</p>
          <p><strong>Renk 7 (Wrapper):</strong> {color7}</p>
          <p><strong>Renk 9 (Gradient Handling):</strong> {color9}</p>
          <p><strong>EyeDropper Renk:</strong> {eyeDropColor}</p>
        </div>
        <div className="test-info" style={{ marginTop: '20px' }}>
          <p className="test-note">
            🔍 Console'u açın (F12) ve şu log'ları kontrol edin:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li><code>[ColorPicker] onChange called with:</code> - Paket'in döndürdüğü ham değer</li>
            <li><code>[ColorPicker] Final value to parent onChange:</code> - Wrapper'ın döndürdüğü işlenmiş değer</li>
            <li><code>[ColorPicker] Popup position calculated:</code> - Popup pozisyon hesaplaması</li>
            <li><code>[Test 9] Package returned:</code> - Test 9'da paket'in döndürdüğü değer</li>
            <li><code>[Test 10 - EyeDropper] Package returned:</code> - EyeDropper'ın seçtiği renk</li>
          </ul>
        </div>
      </div>

      {/* Test Talimatları */}
      <div className="test-section">
        <h2>Test Talimatları</h2>
        <ol className="instructions">
          <li>En üstteki <strong>Renk Örnekleri</strong> bölümüne gidin - EyeDropper testi için bunları kullanın</li>
          <li>Her ColorPicker'ı açın ve hangi kontrollerin görünür olduğunu kontrol edin</li>
          <li>Alpha slider'ı test edin - hareket ettirin ve üst üste kutularda şeffaflığı kontrol edin (Test 2, 4)</li>
          <li>Gradient kontrollerini test edin - gradient butonuna tıklayın ve gradient oluşturun (Test 3, 4, 6)</li>
          <li>EyeDropper'ı test edin - eyedropper butonuna tıklayın, sonra yukarıdaki Renk Örnekleri'nden birine tıklayın</li>
          <li>RGBA input'u test edin - manuel olarak alpha değeri girin (örn: 0.5) Test 2 ve 4'te</li>
          <li>HEX input'u test edin - manuel olarak hex değeri girin</li>
          <li>Renk pointer'ı test edin - renk paletinde sürükleyin</li>
          <li>Popup açılmasını test edin - Test 7 ve 8'de tetik butonlarına tıklayın</li>
          <li>Debug Bilgisi bölümünü kontrol ederek dönen gerçek değerleri görün</li>
          <li>Kontrol listesindeki öğeleri test ederken işaretleyin</li>
        </ol>
      </div>
    </div>
  );
}
