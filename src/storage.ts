const KEY = 'pinterest_url'
const COOKIE = 'media_url'

export function setMediaUrl(url: string) {
  try { localStorage.setItem(KEY, url) } catch {}
  // cookie yedeği (session cookie yeterli)
  document.cookie = `${COOKIE}=${encodeURIComponent(url)}; path=/; SameSite=None; Secure`
}

export function getMediaUrl(): string {
  // 1) localStorage
  try {
    const v = localStorage.getItem(KEY)
    if (v) return v
  } catch {}

  // 2) cookie
  const m = document.cookie.match(/(?:^|;\s*)media_url=([^;]+)/)
  if (m) return decodeURIComponent(m[1])

  return ''
}

type Listener = (val: string) => void
const listeners = new Set<Listener>()

// CAM bazen storage event yaymıyor → hem event hem polling
let lastVal = ''
function poll() {
  const v = getMediaUrl()
  if (v !== lastVal) {
    lastVal = v
    listeners.forEach((fn) => fn(v))
  }
}
setInterval(poll, 2000) // 2 sn

// storage event (web tarayıcıda anlık)
window.addEventListener('storage', (e) => {
  if (e.key === KEY) poll()
})

export function subscribe(fn: Listener) {
  listeners.add(fn)
  fn(getMediaUrl()) // ilk değer
  return () => listeners.delete(fn)
}

// NZXT viewstate (çözünürlük) yardımcı
export function getViewState(): number {
  const m = document.cookie.match(/viewstate=(\d+)/)
  return m ? Number(m[1]) : 640
}

export function isKraken(): boolean {
  const sp = new URLSearchParams(location.search)
  return sp.get('kraken') === '1'
}
