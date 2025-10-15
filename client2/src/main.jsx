import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NilDataWalletProvider } from './components/NilDataWalletProvider.jsx'

import { EXTENSION_ID } from '../keys.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NilDataWalletProvider extensionId={EXTENSION_ID}>
      <App />
    </NilDataWalletProvider>
  </StrictMode>,
)
