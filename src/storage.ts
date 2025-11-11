// ------------------------------------------------------------
// NZXT Pinterest Integration - Shared Storage Layer
// ------------------------------------------------------------
// Bu dosya, hem Config hem Display sayfası için ortak depolama
// alanını yönetir. (localStorage + cookie yedekli yapı)
//
// - NZXT CAM’de bazen Config ve Display ayrı Chromium process’lerinde
//   açıldığı için localStorage paylaşımı olmaz.
// - Bu durumda cookie yedeği devreye girer.
// ------------------------------------------------------------

const KEY = 'pinterest_url'
const COOKIE = 'media_url'

// URL yaz (hem localStorage hem cookie olarak)
export function setMediaUrl(url: string) {
  try {
    localStorage.setItem(KEY, url)
  } catch (e) {
    console.warn('[NZXT] localStorage erişilemedi:', e)
  }

  // 👇 NZXT CAM güvenli context ister → SameSite=None; Secure eklenmeli
  document.cookie = `${COOKIE}=${encodeURIComponent(url)}; path=/; SameSite=None; Secure`
}

// URL oku (önce localStorage, sonra cookie fallback)
export function getMediaUrl(): string {
  try {
    const v = localStorage.getItem(KEY)
    if (v) return v
  } catch (e) {
    console.warn('[NZXT] localStorage okunamadı:', e)
  }

  const match = document.cookie.match(/(?:^|;\s*)media_url=([^;]+)/)
  if (match) return decodeURIComponent(match[1])

  return ''
}

// ------------------------------------------------------------
// Gözlemci mekanizması (Config → Display senkronizasyonu)
// ------------------------------------------------------------

type Listener = (val: string) => void
const listeners = new Set<Listener>()

let lastVal = ''
function poll() {
  const v = getMediaUrl()
  if (v !== lastVal) {
    lastVal = v
    listeners.forEach((fn) => fn(v))
  }
}

// NZXT CAM bazen storage event yaymaz → polling fallback
setInterval(poll, 2000)

// Standart storage event (normal tarayıcıda anlık tetiklenir)
window.addEventListener('storage', (e) => {
  if (e.key === KEY) poll()
})

export function subscribe(fn: Listener) {
  listeners.add(fn)
  fn(getMediaUrl()) // ilk değer
  return () => listeners.delete(fn)
}

// ------------------------------------------------------------
// Yardımcı fonksiyonlar
// ------------------------------------------------------------

// NZXT CAM viewstate (LCD çözünürlüğü) değerini cookie’den çek
export function getViewState(): number {
  const match = document.cookie.match(/viewstate=(\d+)/)
  return match ? Number(match[1]) : 640
}

// CAM tarafında mı çalışıyoruz?
export function isKraken(): boolean {
  const sp = new URLSearchParams(location.search)
  return sp.get('kraken') === '1'
}
