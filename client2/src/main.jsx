import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './index.css'
import App from './App.jsx'
import { NillionProvider } from './context/NillionContext.jsx'
// import { NilDataWalletProvider } from './components/NilDataWalletProvider.jsx'
// import { EXTENSION_ID } from '../keys.js'
// import { NilDataWalletProvider } from 'nildata-wallet-connector';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NillionProvider>
        <App />
      </NillionProvider>
    </QueryClientProvider>
  </StrictMode>,
)
