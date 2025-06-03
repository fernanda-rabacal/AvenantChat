/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { 
  createContext, 
  useCallback, 
  useEffect, 
  useMemo, 
  useState, 
  type ReactNode 
} from "react";
import { parseCookies } from "nookies";
import { toast } from "sonner";

import type { Socket } from "socket.io-client";
import type { 
  IChatRoom, 
  IChatMember, 
  ICreateRoomDataProps, 
  IChatMessage 
} from "@/@types/interfaces";
import { api } from "@/lib/axios";
import { createSocketInstance } from "@/lib/socket-io";
import { useAuth } from "@/hooks/useAuth";
import { manageError } from "@/utils/manageError";

interface ChatContextProviderProps {
  children: ReactNode;
}

type ChatContextType = {
  rooms: IChatRoom[];
  userRooms: IChatRoom[];
  chatRoomMembers: IChatMember[];
  messages: IChatMessage[];
  activeRoom: IChatRoom | null;
  hasMoreMessages: boolean;
  isLoadingMoreMessages: boolean;
  getChatRooms: () => void;
  createChatRoom: (data: ICreateRoomDataProps) => void;
  joinChatRoom: (room: IChatRoom) => void;
  enterChatRoom: (room: IChatRoom) => void;
  leaveChatRoom: (id: number) => void;
  sendMessage: (msg: string) => void;
  editMessage: (id_message: number, message: string) => void;
  deleteMessage: (id_message: number) => void;
  loadMoreMessages: () => Promise<{ messages: IChatMessage[]; hasMore: boolean } | undefined>;
}

export const ChatContext = createContext({} as ChatContextType);

export function ChatContextProvider({ children }: ChatContextProviderProps) {
  const [rooms, setRooms] = useState<IChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<IChatRoom | null>(null);
  const [chatRoomMembers, setChatRoomMembers] = useState<IChatMember[]>([]);
  const [userRooms, setUserRooms] = useState<IChatRoom[]>([]);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.id_user) {
      const cookieName = `avenant_token_${ user?.id_user}`;
      const cookies = parseCookies();
      const token = cookies[cookieName];

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
  }, [socketInstance]);

  const enterChatRoom = useCallback((room: IChatRoom) => {
    socketInstance?.emit("enter_chat", { id_chat_room: room.id_chat_room });

    setActiveRoom(room)
  }, [socketInstance]);

  const leaveChatRoom = useCallback((id_chat_room: number) => {
    socketInstance?.emit("leave_chat", { id_chat_room });

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

  const editMessage = useCallback((id_message: number, message: string) => {
    if (!id_message || !message || !activeRoom) return;

    socketInstance?.emit("edit_message", { new_message: message, id_message });
  }, [socketInstance, activeRoom]);

  const deleteMessage = useCallback((id_message: number) => {
    if (!id_message || !activeRoom) return;

    socketInstance?.emit("delete_message", { id_message });
  }, [socketInstance, activeRoom]);

  const createChatRoom = useCallback(
    async (data: ICreateRoomDataProps) => {
      try {
        const response = await api.post("/chat-room", { ...data, created_by: user?.id_user });
        const createdRoom = response.data.created_room;

        toast.success("Chat room created successfully!");
        setRooms(response.data.rooms);
        joinChatRoom(createdRoom);
      } catch (err: unknown) {
        manageError(err, 'createChatRoom', 'creating chat room');
      }
  }, [user, setActiveRoom, setRooms, joinChatRoom]);

  const getChatRooms = useCallback(async () => {
    try {
      const response = await api.get('/chat-room');

      setRooms(response.data);
    } catch (err: unknown) {
      manageError(err, 'getChatRooms', 'getting chat rooms list');
    }
  }, []);

  const getUserChatRooms = useCallback(async (id_user: number) => {
    try {
      const response = await api.get(`/users/chats/${id_user}`);

      setUserRooms(response.data);
    } catch (err: unknown) {
      manageError(err, 'getUserChatRooms', 'getting user chat rooms list');
    }
  }, [api]);

  const getChatRoom = useCallback(async (id_chat_room: number) => {
    try {
      const response = await api.get(`/chat-room/${id_chat_room}`);

      setActiveRoom(response.data.chat_room);
      setChatRoomMembers(response.data.members);
    } catch (err: unknown) {
      manageError(err, 'getChatRoom', 'getting chat room');
    }
  }, [api]);

  const loadMoreMessages = useCallback(async () => {
    if (!activeRoom || isLoadingMoreMessages) return;

    try {
      setIsLoadingMoreMessages(true);
      const nextPage = currentPage + 1;
      
      socketInstance?.emit('load_more_messages', { 
        id_chat_room: activeRoom.id_chat_room,
        page: nextPage 
      });

      return new Promise<{ messages: IChatMessage[]; hasMore: boolean }>((resolve) => {
        const handleMoreMessages = (data: { messages: IChatMessage[]; hasMore: boolean }) => {
          setHasMoreMessages(data.hasMore);
          setCurrentPage(prev => prev + 1);
          setIsLoadingMoreMessages(false);
          socketInstance?.off('more_messages', handleMoreMessages);
          resolve(data);
        };

        socketInstance?.on('more_messages', handleMoreMessages);
      });
    } catch (err: unknown) {
      manageError(err, 'loadMoreMessages', 'loading more messages');
      setIsLoadingMoreMessages(false);
    }
  }, [activeRoom, currentPage, isLoadingMoreMessages, socketInstance]);

  useEffect(() => {
    if (!socketInstance || !user) return;

    socketInstance.off("connect");
    socketInstance.off("user_rooms_list");
    socketInstance.off("chat_room_members_list");
    socketInstance.off("message");
    socketInstance.off("saved_messages");
    socketInstance.off("more_messages");
    socketInstance.off("joined_room");

    socketInstance.on("connect", () => {
      console.log("🔌 Connected to socket:", socketInstance.id);
    });

    socketInstance.on("joined_room", (room: IChatRoom) => {
      setActiveRoom(room); 
    });

    socketInstance.on("user_rooms_list", (data) => {
      setUserRooms(data.rooms);
    });

    socketInstance.on("chat_room_members_list", (data) => {
      setChatRoomMembers(data.chat_room_members);
    });

    socketInstance.on("message", (msg: IChatMessage) => {
      const messageIsEditedOrDeleted = msg.edited_at || msg.is_deleted;

      if (messageIsEditedOrDeleted) {
        return setMessages(prev => prev.map(m => {
          if (m.id_message === msg.id_message) {
            return msg;
          }

          return m;
        }))
      }

      setMessages((prev) => [...prev, msg]);
    });

    socketInstance.on("saved_messages", (data) => {
      if (data.messages) {
        setMessages(data.messages);
      }
      setHasMoreMessages(data.hasMore ? data.hasMore : false);
      setCurrentPage(1);
    });

    socketInstance.on("more_messages", (data) => {
      setMessages(prev => [...data.messages ? data.messages : [], ...prev]);
      setHasMoreMessages(data.hasMore ? data.hasMore : false);
      setCurrentPage(prev => prev + 1);
      setIsLoadingMoreMessages(false);
    });

    return () => {
      socketInstance.off("connect");
      socketInstance.off("user_rooms_list");
      socketInstance.off("chat_room_members_list");
      socketInstance.off("message");
      socketInstance.off("saved_messages");
      socketInstance.off("more_messages");
      socketInstance.off("joined_room");
    };
  }, [socketInstance, user]);

  useEffect(() => {
    if (!user?.id_user) return;

    const storageKey = `avenant_active_room_${user.id_user}`;
    let activeRoomStorage: { id_chat_room: number;
        name: string;
      };
    
    if (activeRoom) {
      activeRoomStorage = {
        id_chat_room: activeRoom.id_chat_room,
        name: activeRoom.name,
      };

      return localStorage.setItem(
        storageKey,
        JSON.stringify(activeRoomStorage)
      );
    } 

    const savedActiveRoom = localStorage.getItem(storageKey);

    if (savedActiveRoom) {
      const room = JSON.parse(savedActiveRoom) as typeof activeRoomStorage;

      getChatRoom(room.id_chat_room);
    }
  }, [activeRoom, user?.id_user, getChatRoom]);

  useEffect(() => {
    if (user) {
      getUserChatRooms(user.id_user);
    }
  }, [user]);

  useEffect(() => {
    if (activeRoom) {
      setCurrentPage(1);
      setHasMoreMessages(false);
    }
  }, [activeRoom?.id_chat_room]);

  const value = useMemo(
    () => ({
      rooms,
      chatRoomMembers,
      messages,
      userRooms,
      activeRoom,
      hasMoreMessages,
      isLoadingMoreMessages,
      joinChatRoom,
      leaveChatRoom,
      sendMessage,
      getChatRooms,
      createChatRoom,
      enterChatRoom,
      editMessage,
      deleteMessage,
      loadMoreMessages
    }),
    [
      rooms, 
      chatRoomMembers, 
      messages,
      activeRoom, 
      userRooms,
      hasMoreMessages,
      isLoadingMoreMessages,
      joinChatRoom, 
      leaveChatRoom, 
      sendMessage, 
      getChatRooms, 
      createChatRoom,
      enterChatRoom,
      editMessage,
      deleteMessage,
      loadMoreMessages
    ]
  );

  return (
     <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}