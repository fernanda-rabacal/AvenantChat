/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { api, setAuthInterceptor } from "@/lib/axios";
import { type ReactNode, createContext, useEffect, useState } from "react"
import { setCookie, destroyCookie, parseCookies } from 'nookies'
import type { LoginData, RegisterData } from "@/@types/auth";
import { toast } from "sonner";
import axios from "axios";

interface AuthProps {
  children: ReactNode
}

type User = {
  id_user: number;
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
  const [user, setUser] = useState<User | null>(null)

  const isAuthenticated = !!user;

  function signOut() {
    if (!user) return;

    const cookies = parseCookies();
      for (const cookieName in cookies) {
        if (cookieName.startsWith('avenant_token_')) {
          destroyCookie(undefined, cookieName);
        }
      }

    const storageKey = `avenant_active_room_${user.id_user}`
    localStorage.removeItem(storageKey)

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
      setCookie(undefined, `avenant_token_${user.id_user}`, token, {
        maxAge: 60 * 60 * 24 * 7
      })
      setAuthInterceptor(user.id_user);
      setUser(user)
    } catch(err: unknown) {
      if (axios.isAxiosError(err)) {          
        toast.error(err.response?.data.message)

        if (err.response?.status === 401) {
          const cookies = parseCookies();
          for (const cookieName in cookies) {
            if (cookieName.startsWith('avenant_token_')) {
              destroyCookie(undefined, cookieName);
            }
          }
        }
      }
    }
  }

  useEffect(() => {
    const cookies = parseCookies();
    for (const cookieName in cookies) {
      console.log(cookies)
      if (cookieName.startsWith('avenant_token_')) {
        getUserByToken(cookies[cookieName]);
        return;
      }
    }
  }, []); 

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}