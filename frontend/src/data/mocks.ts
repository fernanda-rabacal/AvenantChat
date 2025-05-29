import type { ChatRoom, Message, User } from "@/@types/interfaces"

export const mockUsers: User[] = [
  { id: "1", name: "Alex Johnson", status: "online", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Taylor Smith", status: "online", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "3", name: "Jordan Lee", status: "offline" },
  { id: "4", name: "Casey Wilson", status: "online" },
  { id: "5", name: "Riley Brown", status: "offline" },
  { id: "7", name: "Morgan Davis", status: "online" },
  { id: "9", name: "Quinn Thompson", status: "offline" },
  { id: "10", name: "Avery Garcia", status: "online" },
]

export const mockChatRooms: ChatRoom[] = [
  {
    id: "1",
    name: "General Discussion",
    description: "Open chat for general topics and casual conversation",
    memberCount: 1247,
    isOnline: true,
    lastActivity: "2 minutes ago",
    category: "General",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Tech Talk",
    description: "Discuss the latest in technology, programming, and innovation",
    memberCount: 892,
    isOnline: true,
    lastActivity: "5 minutes ago",
    category: "Technology",
  },
  {
    id: "3",
    name: "Design Studio",
    description: "Share designs, get feedback, and discuss UI/UX trends",
    memberCount: 456,
    isOnline: true,
    lastActivity: "12 minutes ago",
    category: "Design",
  },
  {
    id: "4",
    name: "Gaming Hub",
    description: "Connect with fellow gamers and discuss your favorite games",
    memberCount: 2103,
    isOnline: true,
    lastActivity: "1 minute ago",
    category: "Gaming",
  },
  {
    id: "5",
    name: "Project Alpha",
    description: "Private workspace for Project Alpha team members",
    memberCount: 12,
    isOnline: true,
    lastActivity: "30 minutes ago",
    category: "Work",
  },
  {
    id: "6",
    name: "Music Lovers",
    description: "Share your favorite tracks and discover new music",
    memberCount: 678,
    isOnline: false,
    lastActivity: "2 hours ago",
    category: "Music",
  },
  {
    id: "7",
    name: "Book Club",
    description: "Monthly book discussions and reading recommendations",
    memberCount: 234,
    isOnline: true,
    lastActivity: "45 minutes ago",
    category: "Literature",
  },
  {
    id: "8",
    name: "Fitness & Health",
    description: "Share workout tips, healthy recipes, and motivation",
    memberCount: 567,
    isOnline: true,
    lastActivity: "15 minutes ago",
    category: "Health",
  },
]

export const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey everyone! Welcome to our new chat room 👋",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    user: mockUsers[0],
  },
  {
    id: "2",
    content: "Thanks for setting this up! Excited to chat with everyone here.",
    timestamp: new Date(Date.now() - 82800000), // 23 hours ago
    user: mockUsers[1],
  },
  {
    id: "3",
    content: "I'm working on the new project. Anyone want to collaborate?",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    user: mockUsers[2],
  },
  {
    id: "4",
    content: "Just checking in. How's everyone doing today?",
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    user: mockUsers[3],
  },
  {
    id: "5",
    content: "I found this interesting article about React 19: https://example.com/react-19-features",
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    user: mockUsers[0],
  },
  {
    id: "6",
    content: "Hello! I'm the chat assistant. Ask me anything about this project!",
    timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    user: mockUsers[5],
  },
  {
    id: "7",
    content: "Can someone help me with a Tailwind CSS question?",
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    user: mockUsers[4],
  },
  {
    id: "8",
    content: "Sure, what's your question about Tailwind?",
    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    user: mockUsers[6],
  },
]