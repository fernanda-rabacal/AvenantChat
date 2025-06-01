import { useState, useRef, useEffect } from "react"
import { Send, Search, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/utils/utils"
import { useMobile } from "@/hooks/useMobile" 
import type { ChatRoom, Message } from "@/@types/interfaces"
import { ChatMembersList } from "./components/ChatMembersList/component"
import { UserChatList } from "./components/UserChatList/component"
import { mockMessages, mockChatRooms, mockUsers } from "@/data/mocks"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sendMessageSchema } from "@/utils/validationSchemas"
import type { z } from "zod"
import { formatTimestamp } from "@/utils/formatTimestamp"
import { verifyShoudGroupMessage } from "@/utils/verifyShouldGroupMessage"

type SendMessageFormData = z.infer<typeof sendMessageSchema>

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [showMembers, setShowMembers] = useState(true)
  const [showChatList, setShowChatList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const { 
      register,
      handleSubmit,
      reset,
      watch,
      formState: { isSubmitting }
    } = useForm<SendMessageFormData>({
      resolver: zodResolver(sendMessageSchema)
    })

  const message = watch('message')

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

  const handleSendMessage = (data: SendMessageFormData) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      content: data.message,
      timestamp: new Date(),
      user: mockUsers[0],
      chatId: 1
    }

    setMessages([...messages, newMessage])
    reset()
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
              const { shouldGroup, isLastMessage } = verifyShoudGroupMessage(message, index, messages)

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
          <form onSubmit={handleSubmit(handleSendMessage)} className="flex items-center space-x-2">
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
                id="message"
                placeholder="Type here"
                className="pr-20 py-5"
                {...register("message")}
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

            <Button type="submit" size="lg" className="flex-shrink-0" disabled={isSubmitting || !message}>
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
