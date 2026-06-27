import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Admin from './Admin.jsx'

const isAdmin = window.location.pathname.startsWith('/admin')

if (isAdmin) {
  // Admin gets its own full page root
  document.body.innerHTML = '<div id="admin-root"></div>'
  createRoot(document.getElementById('admin-root')).render(
    <StrictMode><Admin /></StrictMode>
  )
} else {
  // Chat bubble mounts on homepage
  const chatRoot = document.getElementById('chat-root')
  if (chatRoot) {
    createRoot(chatRoot).render(
      <StrictMode><App /></StrictMode>
    )
  }
}