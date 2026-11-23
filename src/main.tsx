import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import { AuthLifecycle } from './auth/AuthBoundary.jsx'

const queryClient = new QueryClient()

const root = document.getElementById('root')
if (!root) throw new Error('Missing application root')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthLifecycle><App /></AuthLifecycle>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
