import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Send, MessageCircle, MessageCircleX } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import type { IChatMessage } from "@/@types/interfaces"

import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserChatList } from "@/components/user-chat-list-component"
import { ChatMembersList } from "./components/chat-members-list-component" 
import { ChatMessageItem } from "./components/chat-message"

import { sendMessageSchema } from "@/utils/validationSchemas"
import { verifyShoudGroupMessage } from "@/utils/verifyShouldGroupMessage"
import { useMobile } from "@/hooks/useMobile" 
import { useChat } from "@/hooks/useChat"
import { ConfirmModal } from "@/components/confirm-modal"

type SendMessageFormData = z.infer<typeof sendMessageSchema>;

export default function ChatRoom() {
  const [showMembers, setShowMembers] = useState(true);
  const [showChatList, setShowChatList] = useState(true);
  const [openConfirmLeaveChatModal, setOpenConfirmLeaveChatModal] = useState(false);
  const [isAtTop, setIsAtTop] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [olderMessages, setOlderMessages] = useState<IChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const navigate = useNavigate();
  const { 
    messages, 
    sendMessage, 
    activeRoom, 
    leaveChatRoom,
    hasMoreMessages,
    isLoadingMoreMessages,
    loadMoreMessages 
  } = useChat();

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

  const handleLeaveChat = async () => {
    if (!activeRoom) return;

    leaveChatRoom(activeRoom.id_chat_room);
    navigate('/rooms');
  };

  const handleLoadMore = async () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Save current viewport state
    const firstChild = container.firstElementChild as HTMLElement;
    const initialHeight = firstChild?.offsetTop || 0;
    
    setShouldScrollToBottom(false);
    await loadMoreMessages();

    // After loading, restore viewport position
    requestAnimationFrame(() => {
      if (container && firstChild) {
        const newHeight = firstChild.offsetTop;
        const scrollOffset = newHeight - initialHeight;
        container.scrollTop += scrollOffset;
      }
    });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    setIsAtTop(container.scrollTop === 0);
    
    // Check if we're near bottom to enable auto-scroll
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShouldScrollToBottom(isNearBottom);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldScrollToBottom]);

  // Reset scroll behavior when changing rooms
  useEffect(() => {
    setShouldScrollToBottom(true);
  }, [activeRoom]);

  useEffect(() => {
    if (isMobile) {
      setShowMembers(false)
      setShowChatList(false)
    } else {
      setShowMembers(true)
      setShowChatList(true)
    }
  }, [isMobile]);

  useEffect(() => {
    setOlderMessages([]);
  }, [activeRoom]);

  return (
    <main className="flex h-screen w-screen bg-background">
      <UserChatList 
        showChatList={showChatList}
        isMobile={isMobile}
        toggleUserChatList={toggleUserChatList}
      />

      <section className="flex-1 h-screen flex flex-col min-w-0">
        <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
          <div className="flex items-center">
            <MessageCircle size={20} className="mr-2 text-muted-foreground" />
            <h3 className="font-semibold">{activeRoom?.name}</h3>
          </div>

          <div className="flex items-center space-x-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild onClick={() => setOpenConfirmLeaveChatModal(true)}>
                  <MessageCircleX size={24}  className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>Leave Chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <ConfirmModal 
            isOpen={openConfirmLeaveChatModal}
            setIsOpen={setOpenConfirmLeaveChatModal}
            title={`Confirm Leave ${activeRoom?.name} Chat`}
            description="Are you sure you want to leave the chat? You will need to rejoin this chat again to access it"
            buttonLoadingTitle="Leaving..." 
            buttonConfirmTitle="Leave Chat"
            onConfirm={handleLeaveChat}           
          />
        </div>

        <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto custom-scroll">
          {hasMoreMessages && isAtTop && (
            <div className="flex justify-center mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMoreMessages}
              >
                {isLoadingMoreMessages ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More Messages'
                )}
              </Button>
            </div>
          )}

          <div className="older-messages">
            {olderMessages.map((message, index) => {
              const { shouldGroup } = verifyShoudGroupMessage(message, index, olderMessages);
              return (
                <ChatMessageItem
                  key={message.id_message}
                  message={message}
                  shouldGroup={shouldGroup}
                  isLastMessage={false}
                  className="message-item"
                />
              );
            })}
          </div>

          <div className="current-messages">
            {messages.map((message, index) => {
              const { shouldGroup, isLastMessage } = verifyShoudGroupMessage(message, index, messages);
              return (
                <ChatMessageItem
                  key={message.id_message}
                  message={message}
                  shouldGroup={shouldGroup}
                  isLastMessage={isLastMessage}
                  messagesEndRef={messagesEndRef}
                  className="message-item"
                />
              );
            })}
          </div>
          <div ref={messagesEndRef} className="w-0 h-0"/>
        </div>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit(handleSendMessage)} className="flex items-center space-x-2">
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
