import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Tour de bienvenida deshabilitado para esta release.
// import 'shepherd.js/dist/css/shepherd.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
