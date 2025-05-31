export interface CreateRoomData {
  name: string;
  category: string;
  description?: string;
}

export interface Message {
  id_message: string
  content: string
  sent_at: Date
  user: User
  isNew?: boolean
}

export interface User {
  id_user: string
  name: string
  avatar_url?: string
  is_online: boolean
}

export interface ChatRoomMember {
  id_chat_room_member: number
  id_chat_room: number
  user?: User
}

export interface Channel {
  id: string
  name: string
  unread?: boolean
  isActive?: boolean
}

export interface ChatRoom {
  id_chat_room?: string
  name: string
  description: string
  membersCount?: number
  isOnline: boolean
  lastActivity: string
  category: string
  avatar?: string
}
