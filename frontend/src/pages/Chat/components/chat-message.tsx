import { type RefObject, useRef, useState } from "react"
import { SmilePlusIcon } from "lucide-react"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { MessageDropdown } from "@/components/message-dropdown" 
import { EditMessageModal } from "@/components/edit-message" 
import { ConfirmModal } from "@/components/confirm-modal"
import { cn } from "@/utils/utils"
import { formatTimestamp } from "@/utils/formatTimestamp"
import { useChat } from "@/hooks/useChat"
import type { IChatMessage } from "@/@types/interfaces"
import { useAuth } from "@/hooks/useAuth"

interface IChatMessageItemProps {
  message: IChatMessage
  shouldGroup: boolean
  isLastMessage: boolean
  messagesEndRef?: RefObject<HTMLDivElement | null>
  className?: string
}

export function ChatMessageItem({
  message,
  shouldGroup,
  isLastMessage,
  messagesEndRef,
  className
}: IChatMessageItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { editMessage, deleteMessage } = useChat();
  const isSystem = message.user?.name === "System";
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { user } = useAuth();
  const isOwnMessage = message.user?.id_user === user?.id_user;

  const handleHideEditButton = (hide: boolean) => {
    if (hide) {
      setIsDropdownOpen(hide);
      return;
    } 
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(hide)
    }, 75)
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }
  
  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteMessage(message.id_message)
    setIsDeleteModalOpen(false)
  }

  const handleSaveEdit = (newContent: string) => {
    editMessage(message.id_message, newContent)
    setIsEditModalOpen(false)
  }

  const messageContent = (
    <div
      key={message.id_message}
      ref={isLastMessage ? messagesEndRef : null}
      className={cn(
        "group flex flex-1 relative",
        shouldGroup ? "mt-1 pt-0" : "pt-5",
        isSystem ? "bg-gray-200 p-1 m-4 rounded-3xl" : "",
        isOwnMessage ? "justify-end" : "justify-start",
        className
      )}
    >
      {!isSystem &&
        (!shouldGroup ? (
          <Avatar className="h-10 w-10 mt-0.5 mr-3 flex-shrink-0">
            <AvatarImage src={message.user?.avatar_url || "/user.png"} />
          </Avatar>
        ) : (
          <div className="w-10 mr-3 flex-shrink-0"></div>
        ))}

      <div className="flex-1 min-w-0">
        {!shouldGroup && !isSystem && (
          <div className="flex items-center">
            <span className="font-semibold mr-2">{message.user?.name}</span>
            <span className="text-xs text-muted-foreground">{formatTimestamp(message.sent_at)}</span>
          </div>
        )}
        <div className={cn(
          "text-sm relative", 
          isSystem ? "text-center" : "mt-1 break-words", 
          message.edited_at && !message.is_deleted && "my-2 pb-2",
          message.is_deleted && "text-md text-gray-600 italic"
          )}>
            {message.is_deleted ? "Message Deleted" : message.content}
            {message.edited_at && (
              <span className="text-xs text-muted-foreground absolute top-5 left-0">Edited</span>
            )}
        </div>
      </div>
    </div>
  )

  if (isSystem) {
    return messageContent
  }

  return (
    <div 
      key={message.id_message}
      onMouseEnter={() => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
        setShowEditButton(true)
      }}
      onMouseLeave={() => setShowEditButton(false)}
      className={cn(
        "flex items-center pb-1 border-b-2 border-transparent hover:border-gray-100 transition-border",
        isOwnMessage ? "justify-end" : "justify-start",
        className
      )}
      >
      {messageContent}
      <div className={cn("invisible", (showEditButton || isDropdownOpen) ? "visible" : "invisible")}>
        <MessageDropdown 
          onEdit={handleEdit} 
          onDelete={handleDelete}
          setIsDropdownOpen={handleHideEditButton}
          >
          <SmilePlusIcon size={24} className="cursor-pointer"/>
        </MessageDropdown>
      </div>

      <EditMessageModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentMessage={message.content}
        onSave={handleSaveEdit}
      />

      <ConfirmModal 
        title="Are you sure that you want to delete this message?"
        buttonConfirmTitle="Delete"
        buttonLoadingTitle="Deleting..."
        onConfirm={handleConfirmDelete}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        />
    </div>
  )
}
