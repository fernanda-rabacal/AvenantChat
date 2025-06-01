import { useState, useRef, useEffect } from "react"
import { Send, Search, MessageCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"

import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserChatList } from "@/components/user-chat-list-component"
import { ChatMembersList } from "./components/chat-members-list-component" 
import { ChatMessageItem } from "./components/chat-message"

import { sendMessageSchema } from "@/utils/validationSchemas"
import { verifyShoudGroupMessage } from "@/utils/verifyShouldGroupMessage"
import { useMobile } from "@/hooks/useMobile" 
import { useChat } from "@/hooks/useChat"

type SendMessageFormData = z.infer<typeof sendMessageSchema>;

export default function ChatRoom() {
  const [showMembers, setShowMembers] = useState(true);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const { messages, sendMessage, activeRoom } = useChat();
  const { 
      register,
      handleSubmit,
      reset,
      watch,
      formState: { isSubmitting }
    } = useForm<SendMessageFormData>({
      resolver: zodResolver(sendMessageSchema)
    });

  const message = watch('message');

  const toggleUserChatList = () => {
    setShowChatList(!showChatList)

    if (isMobile && !showChatList) {
      setShowMembers(false);
    }
  };

  const handleSendMessage = async (data: SendMessageFormData) => {
    sendMessage(data.message);
    reset();
  };

  const toggleMembersList = () => {
    setShowMembers(!showMembers);

    if (isMobile && !showMembers) {
      setShowChatList(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]);

  useEffect(() => {
    if (isMobile) {
      setShowMembers(false)
      setShowChatList(false)
    } else {
      setShowMembers(true)
      setShowChatList(true)
    }
  }, [isMobile]);

  return (
    <main className="flex h-screen bg-background">
      <UserChatList 
        showChatList={showChatList}
        isMobile={isMobile}
        toggleUserChatList={toggleUserChatList}
      />

      <section className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
          <div className="flex items-center">
            <MessageCircle size={20} className="mr-2 text-muted-foreground" />
            <h3 className="font-semibold">{activeRoom?.name}</h3>
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
              const { shouldGroup, isLastMessage } = verifyShoudGroupMessage(message, index, messages);

              return (
                <ChatMessageItem
                  key={message.id_message}
                  message={message}
                  shouldGroup={shouldGroup}
                  isLastMessage={isLastMessage}
                  messagesEndRef={messagesEndRef}
                />
              );
            })}
            <div ref={messagesEndRef} />
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
            </div>
            <Button type="submit" size="lg" className="flex-shrink-0" disabled={isSubmitting || !message}>
              <Send size={22} />
            </Button>
          </form>
        </div>
      </section>

      <ChatMembersList 
        toggleMembersList={toggleMembersList} 
        isMobile={isMobile} 
        showMembers={showMembers} 
        />
    </main>
  )
}
