import './registry-patch'; // MUST BE FIRST
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './components/ThemeProvider'
import '@google/model-viewer';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="antigravity-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
