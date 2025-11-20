import { createRoot } from 'react-dom/client'
import Config from './ui/Config'
import { initAntiCache } from './utils/useAntiCache'

// Initialize anti-cache system before rendering
initAntiCache();

createRoot(document.getElementById('root')!).render(<Config />)
