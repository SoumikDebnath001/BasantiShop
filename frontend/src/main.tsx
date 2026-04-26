import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import faviconPng from './assets/logo.png'

const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
if (favicon) {
  favicon.href = faviconPng
  favicon.type = 'image/png'
} else {
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  link.href = faviconPng
  document.head.appendChild(link)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
