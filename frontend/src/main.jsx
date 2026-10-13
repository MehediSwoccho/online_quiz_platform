import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import './index.css'
import App from './App.jsx'

// Theme initialization script
const getStoredTheme = () => {
  const storedTheme = localStorage.getItem('theme-storage')
  if (storedTheme) {
    try {
      const parsed = JSON.parse(storedTheme)
      return parsed?.state?.theme || 'light'
    } catch (e) {
      return 'light'
    }
  }
  return 'light'
}

// Set initial theme class on document
document.documentElement.classList.remove('light', 'dark')
document.documentElement.classList.add(getStoredTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
