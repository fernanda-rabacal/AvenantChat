/* eslint-disable react-refresh/only-export-components */
import { api } from "@/lib/axios";
import { type ReactNode, createContext, useEffect, useState } from "react"
import { setCookie, destroyCookie, parseCookies } from 'nookies'
import type { LoginData, RegisterData } from "@/@types/auth";
import { toast } from "sonner";
import axios from "axios";

interface AuthProps {
  children: ReactNode
}

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  signUp: (data: RegisterData) => Promise<boolean>
  signIn: (data: LoginData) => Promise<boolean>;
  signOut: () => void
}

export const AuthContext = createContext({} as AuthContextType)

export function AuthContextProvider({ children } : AuthProps) {
  const { avenant_token } = parseCookies()
  const [user, setUser] = useState<User | null>(null)

  const isAuthenticated = !!user;

  function signOut() {
    destroyCookie(undefined, 'avenant_token')
    setUser(null)
  }

  async function signUp(data: RegisterData) {
    try {
      await api.post('/users', data)
      await signIn({ email: data.email, password: data.password })

      return true
    } catch (err: unknown) {
     if (axios.isAxiosError(err)) {          
        toast.error(err.response?.data.message)
      } 

      return false
    }
  }

  async function signIn(data: LoginData) {
    try {
      const response = await api.post('/login', data)
      const { token } = response.data
      
      setCookie(undefined, 'avenant_token', token)
      
      await getUserByToken(token)

      return true
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {          
        toast.error(err.response?.data.message)
      }

      return false
    }
  }

  async function getUserByToken(token: string) {
    try {
      const response = await api.get("/users/token", {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      const user = response.data

      setUser(user)
    } catch(err: unknown) {
      if (axios.isAxiosError(err)) {          
        toast.error(err.response?.data.message)

        if (err.response?.status === 401) {
          return destroyCookie(undefined, 'avenant_token')
        }
      }
    }
  }

  useEffect(() => {
    if (avenant_token) {
      getUserByToken(avenant_token)
    }
  }, [avenant_token])
  

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}