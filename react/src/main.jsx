import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import App from './App.jsx'

// Register service worker for offline/PWA support (reusing the original main.js logic)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Use import.meta.env.BASE_URL so the path is correct on
    // both localhost ('/') and GitHub Pages ('/ps_react_website/')
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + "service-worker.js")
      .catch(err => {
        console.error("Service worker registration failed:", err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
