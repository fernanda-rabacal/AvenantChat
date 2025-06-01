/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import type { 
  IChatRoom, 
  IChatMember, 
  CreateRoomDataProps, 
  IChatMessage 
} from "@/@types/interfaces";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/axios";
import { createSocketInstance } from "@/lib/socket-io";
import axios from "axios";
import { parseCookies } from "nookies";
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";

interface ChatContextType {
  rooms: IChatRoom[];
  userRooms: IChatRoom[];
  chatRoomMembers: IChatMember[];
  messages: IChatMessage[];
  activeRoom: IChatRoom | null;
  getChatRooms: () => void;
  createChatRoom: (data: CreateRoomDataProps) => void;
  joinChatRoom: (room: IChatRoom) => void;
  enterChatRoom: (room: IChatRoom) => void;
  leaveChatRoom: (id: number) => void;
  sendMessage: (msg: string) => void;
}

interface ChatContextProviderProps {
  children: ReactNode;
}

export const ChatContext = createContext({} as ChatContextType);

export function ChatContextProvider({ children }: ChatContextProviderProps) {
  const [rooms, setRooms] = useState<IChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<IChatRoom | null>(null);
  const [chatRoomMembers, setChatRoomMembers] = useState<IChatMember[]>([]);
  const [userRooms, setUserRooms] = useState<IChatRoom[]>([]);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user?.id_user) {
      const cookieName = `avenant_token_${ user?.id_user}`;
      const cookies = parseCookies();
      const token = cookies[cookieName];

      console.log(token)

      if (token) {
        const newSocket = createSocketInstance(user.id_user);
        setSocketInstance(newSocket);
        newSocket.connect();
        
        return () => {
          newSocket.disconnect();
        };
      } else {
        if (socketInstance) {
          socketInstance.disconnect();
          setSocketInstance(null);
        }
      } 
    }
  }, [user?.id_user]);


  const joinChatRoom = useCallback((room: IChatRoom) => {
    socketInstance?.emit("join_chat", { id_chat_room: room.id_chat_room });

    setActiveRoom(room)
  }, [socketInstance]);

  const enterChatRoom = useCallback((room: IChatRoom) => {
    socketInstance?.emit("enter_chat", { id_chat_room: room.id_chat_room });

    setActiveRoom(room)
  }, [socketInstance]);

  const leaveChatRoom = useCallback((roomId: number) => {
    socketInstance?.emit("leave_chat", { id_user: user?.id_user, id_chat_room: roomId });

    setActiveRoom(null)
  }, [socketInstance, user?.id_user]);

  const sendMessage = useCallback((message: string) => {
    if (!activeRoom) return;

    socketInstance?.emit("message", { 
      message,
      id_chat_room: activeRoom?.id_chat_room,
      chat_room_name: activeRoom?.name
    });
  }, [socketInstance, activeRoom]);

  const createChatRoom = useCallback(
    async (data: CreateRoomDataProps) => {
      try {
        const response = await api.post("/chat-room", { ...data, created_by: user?.id_user });
        const createdRoom = response.data.created_room;
        
        toast.success("Chat room created successfully!");
        
        setRooms(response.data.rooms);
        joinChatRoom(createdRoom) 

        setActiveRoom(createdRoom)
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data.message || "Failed to create chat room");
        } else {
          toast.error("Unexpected error while creating chat room");
        }
      }
    }, [joinChatRoom, user]);

  const getChatRooms = useCallback(async () => {
    try {
      const response = await api.get('/chat-room');
      setRooms(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data.message || "Failed to get chat rooms");
      }
      return false;
    }
  }, []);

  const getUserChatRooms = useCallback(async (id_user: number) => {
    try {
      const response = await api.get(`/users/chats/${id_user}`);
      setUserRooms(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data.message || "Failed to get user chat rooms");
      }
      return false;
    }
  }, [api]);

  const getChatRoom = useCallback(async (id_chat_room: number) => {
    try {
      const response = await api.get(`/chat-room/${id_chat_room}`);
      setActiveRoom(response.data.chat_room);
      setChatRoomMembers(response.data.members)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data.message || "Failed to get chat room");
      }
      return false;
    }
  }, [api]);

  const value = useMemo(
    () => ({
      rooms,
      chatRoomMembers,
      messages,
      userRooms,
      activeRoom,
      joinChatRoom,
      leaveChatRoom,
      sendMessage,
      getChatRooms,
      createChatRoom,
      enterChatRoom
    }),
    [
      rooms, 
      chatRoomMembers, 
      messages,
      activeRoom, 
      userRooms, 
      joinChatRoom, 
      leaveChatRoom, 
      sendMessage, 
      getChatRooms, 
      createChatRoom,
      enterChatRoom
    ]
  );

  useEffect(() => {
    if (!socketInstance || !user) return;

    socketInstance.off("connect");
    socketInstance.off("user_rooms_list");
    socketInstance.off("chat_room_members_list");
    socketInstance.off("message");
    socketInstance.off("saved_messages");

    socketInstance.on("connect", () => {
      console.log("🔌 Connected to socket:", socketInstance.id);
    });

    socketInstance.on("user_rooms_list", (data) => {
      setUserRooms(data.rooms);
    });

    socketInstance.on("chat_room_members_list", (data) => {
      setChatRoomMembers(data.chat_room_members);
    });

    socketInstance.on("message", (msg: IChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketInstance.on("saved_messages", (messages: IChatMessage[]) => {
      setMessages(messages);
    });

    return () => {
      socketInstance.off("connect");
      socketInstance.off("user_rooms_list");
      socketInstance.off("chat_room_members_list");
      socketInstance.off("message");
      socketInstance.off("saved_messages");
    };
  }, [socketInstance, user]);

  useEffect(() => {
    if (!user?.id_user) return;

    const storageKey = `avenant_active_room_${user.id_user}`;

    if (activeRoom) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          id_chat_room: activeRoom.id_chat_room,
          name: activeRoom.name,
        })
      );
    } else {
      const savedActiveRoom = localStorage.getItem(storageKey);

      if (savedActiveRoom) {
        const room = JSON.parse(savedActiveRoom) as {
          id_chat_room: number;
          name: string;
        };
        getChatRoom(room.id_chat_room);
      }
    }
  }, [activeRoom, user?.id_user, getChatRoom]);

  useEffect(() => {
    if (user) {
      getUserChatRooms(user.id_user);
    }
  }, [user]);

  return (
     <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}