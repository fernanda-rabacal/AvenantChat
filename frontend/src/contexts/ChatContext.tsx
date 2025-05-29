import { createContext, type ReactNode } from "react";

interface ChatContextType {
  rooms: []
}

interface ChatContextProviderProps {
  children: ReactNode;
}

const ChatContext = createContext({} as ChatContextType);

export function ChatContextProvider({ children }: ChatContextProviderProps) {
  return (
     <ChatContext.Provider 
      value={{ rooms: [] }}>
      {children}
    </ChatContext.Provider>
  )
}