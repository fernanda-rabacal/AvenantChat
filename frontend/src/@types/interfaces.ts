export interface Message {
  id: string
  content: string
  timestamp: Date
  user: User
  isNew?: boolean
}

export interface User {
  id: string
  name: string
  avatar?: string
  status: "online" | "offline"
}

export interface Channel {
  id: string
  name: string
  unread?: boolean
  isActive?: boolean
}

export interface ChatRoom {
  id?: string
  name: string
  description: string
  memberCount: number
  isOnline: boolean
  lastActivity: string
  category: string
  avatar?: string
}
