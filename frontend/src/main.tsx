import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes.tsx';
import { ChatContextProvider } from './contexts/ChatContext.tsx';
import { Toaster } from "@/components/ui/sonner.tsx"
import './index.css'
import { AuthContextProvider } from './contexts/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <ChatContextProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ChatContextProvider>
    </AuthContextProvider>
  </StrictMode>
)
