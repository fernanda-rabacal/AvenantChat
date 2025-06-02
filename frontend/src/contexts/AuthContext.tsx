/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { 
  createContext,  
  useEffect, 
  useMemo, 
  useState, 
  type ReactNode 
} from "react";
import { setCookie, destroyCookie, parseCookies } from 'nookies';

import { api, setAuthInterceptor } from "@/lib/axios";
import type { ILoginData, IRegisterData } from "@/@types/auth";
import type { IUser } from "@/@types/interfaces";
import { manageError } from "@/utils/manageError";

interface IAuthProps {
  children: ReactNode;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: IUser | null;
  signUp: (data: IRegisterData) => Promise<boolean>;
  signIn: (data: ILoginData) => Promise<boolean>;
  signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider({ children } : IAuthProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const isAuthenticated = !!user;

  function signOut() {
    if (!user) return;

    const cookies = parseCookies();
    for (const cookieName in cookies) {
      if (cookieName.startsWith('avenant_token_')) {
        destroyCookie(undefined, cookieName);
      }
    }

    const storageKey = `avenant_active_room_${user.id_user}`;
    localStorage.removeItem(storageKey);

    setUser(null);
  };

  async function signUp(data: IRegisterData) {
    try {
      await api.post('/users', data);
      await signIn({ email: data.email, password: data.password });

      return true;
    } catch (err: unknown) {
      manageError(err, 'signUp', 'sign user up');

      return false;
    }
  };

  async function signIn(data: ILoginData) {
    try {
      const response = await api.post('/login', data);
      const { token } = response.data;
      
      return getUserByToken(token);
    } catch (err: unknown) {
      manageError(err, 'signIn', 'sign user in');

      return false;
    }
  };

  async function getUserByToken(token: string) {
    try {
      const response = await api.get("/users/token", {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const user = response.data;

      setCookie(undefined, `avenant_token_${user.id_user}`, token, {
        maxAge: 60 * 60 * 24 * 7
      });

      setAuthInterceptor(user.id_user);
      setUser(user);
      return true;
    } catch(err: unknown) {
      manageError(err, 'getUserByToken', 'getting user by token');
      return false;
    }
  };

  useEffect(() => {
    const cookies = parseCookies();

    for (const cookieName in cookies) {
      if (cookieName.startsWith('avenant_token_')) {
        getUserByToken(cookies[cookieName]);
        return;
      }
    }
  }, []); 

  const value = useMemo(
      () => ({
        user, 
        isAuthenticated, 
        signIn, 
        signOut, 
        signUp
      }),
      [
        user, 
        isAuthenticated, 
        signIn, 
        signOut, 
        signUp
      ]
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}