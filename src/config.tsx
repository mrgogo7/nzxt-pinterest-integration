import React from 'react'
import { createRoot } from 'react-dom/client'
import Config from './ui/Config'
import ConfigPreview from './ui/components/ConfigPreview'

// Config ekranını ve thumbnail önizlemeyi birlikte render eder
function ConfigPage() {
  return (
    <div style={{ padding: '1rem' }}>
      <Config />
      <hr style={{ margin: '2rem 0', borderColor: '#333' }} />
      <ConfigPreview />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<ConfigPage />)
