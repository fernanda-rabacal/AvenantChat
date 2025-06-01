import { type RefObject } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/utils/utils"; 
import { type IChatMessage } from "@/@types/interfaces";

interface IChatMessageItemProps {
  message: IChatMessage;
  shouldGroup: boolean;
  isLastMessage: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function ChatMessageItem({ message, shouldGroup, isLastMessage, messagesEndRef }: IChatMessageItemProps) {
  const isSystem = message.user?.name === 'System';

  return (
    <div 
      key={message.id_message} 
      ref={isLastMessage ? messagesEndRef : null}
      className={cn(
        "group flex",
        shouldGroup ? "mt-1 pt-0" : "pt-5",
        isSystem ? "bg-gray-200 p-2 m-4 rounded-3xl" : "",
      )}>
      {
        !isSystem && (
          !shouldGroup ? (
            <Avatar className="h-10 w-10 mt-0.5 mr-3 flex-shrink-0">
              <AvatarImage src={message.user?.avatar_url || "/user.png"} />
            </Avatar>
          ) : (
            <div className="w-10 mr-3 flex-shrink-0"></div>
          )
        )
      }

      <div className="flex-1 min-w-0">
        {!shouldGroup && !isSystem && (
          <div className="flex items-center">
            <span className="font-semibold mr-2">{message.user?.name}</span>
            <span className="text-xs text-muted-foreground">{formatTimestamp(message.sent_at)}</span>
          </div>
        )}
        <div className={cn("text-sm", isSystem ? "text-center" : 'mt-0.5 break-words')}>
          {message.content}
        </div>
      </div>
    </div>
  );
}