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
