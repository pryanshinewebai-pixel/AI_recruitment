import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Font loading detection
if (typeof document !== 'undefined') {
  document.fonts.ready.then(() => {
    document.body.classList.add('fonts-loaded');
  });

  // Fallback: add class after a short delay even if fonts aren't fully loaded
  setTimeout(() => {
    document.body.classList.add('fonts-loaded');
  }, 500);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
      >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
)