import { useState, useRef, useEffect, type FormEvent } from "react"
import { Send, Search, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/useMobile" 
import type { ChatRoom, Message } from "@/@types/interfaces"
import { ChatMembersList } from "./components/ChatMembersList/component"
import { UserChatList } from "./components/UserChatList/component"
import { mockMessages, mockChatRooms, mockUsers } from "@/data/mocks"

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [messageInput, setMessageInput] = useState("")
  const [showMembers, setShowMembers] = useState(true)
  const [showChatList, setShowChatList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  useEffect(() => {
    if (isMobile) {
      setShowMembers(false)
      setShowChatList(false)
    } else {
      setShowMembers(true)
      setShowChatList(true)
    }
  }, [isMobile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: messageInput,
      timestamp: new Date(),
      user: mockUsers[0],
      isNew: true,
    }

    setMessages([...messages, newMessage])
    setMessageInput("")
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24 && date.getDate() === now.getDate()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffInHours < 48 && date.getDate() === now.getDate() - 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        ` at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      )
    }
  }

  const toggleUserChatList = () => {
    setShowChatList(!showChatList)
    if (isMobile && !showChatList) {
      setShowMembers(false)
    }
  }

  const toggleMembersList = () => {
    setShowMembers(!showMembers)
    if (isMobile && !showMembers) {
      setShowChatList(false)
    }
  }

  return (
    <main className="flex h-screen bg-background">
      <UserChatList 
        user={mockUsers[0]}
        chatRooms={mockChatRooms}
        showChatList={showChatList}
        isMobile={isMobile}
        toggleUserChatList={toggleUserChatList}
      />

      <section className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
          <div className="flex items-center">
            <MessageCircle size={20} className="mr-2 text-muted-foreground" />
            <h3 className="font-semibold">Chat Server</h3>
          </div>
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Search size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4 h-[75%]">
          <div>
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null
              const isLastMessage = messages.length - index === 1
              const shouldGroup =
                prevMessage &&
                prevMessage.user.id === message.user.id &&
                message.timestamp.getTime() - prevMessage.timestamp.getTime() < 5 * 60 * 1000 // 5 minutes

              return (
                <div
                  key={message.id}
                  className={cn("group flex", shouldGroup ? "mt-1 pt-0" : "pt-5", message.isNew && "animate-highlight")}
                  ref={isLastMessage ? messagesEndRef : null}
                >
                  {!shouldGroup ? (
                    <Avatar className="h-10 w-10 mt-0.5 mr-3 flex-shrink-0">
                      <AvatarImage src={message.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{message.user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 mr-3 flex-shrink-0"></div>
                  )}

                  <div className="flex-1 min-w-0">
                    {!shouldGroup && (
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">{message.user.name}</span>
                        <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                      </div>
                    )}
                    <div className="text-sm mt-0.5 break-words">{message.content}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            {/* <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() =>
                toast("File uploads are not implemented in this demo")
              }
            >
              <Plus size={20} />
            </Button> */}

            <div className="relative flex-1">
              <Input
                placeholder="Type here"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="pr-20 py-5"
              />
              {/* <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <AtSign size={18} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Smile size={18} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Paperclip size={18} />
                </Button>
              </div> */}
            </div>

            <Button type="submit" size="lg" className="flex-shrink-0">
              <Send size={22} />
            </Button>
          </form>
        </div>
      </section>

      <ChatMembersList 
        members={mockUsers} 
        toggleMembersList={toggleMembersList} 
        isMobile={isMobile} 
        showMembers={showMembers} />
    </main>
  )
}
