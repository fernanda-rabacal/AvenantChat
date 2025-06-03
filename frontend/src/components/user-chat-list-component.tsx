import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { SettingsDropdown } from "./settings-dropdown";

import type { IChatRoom } from "@/@types/interfaces";
import { cn } from "@/utils/utils";
import { formatTimestamp } from "@/utils/formatTimestamp";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";

interface IUserChatListProps {
  showChatList: boolean;
  isMobile: boolean;
  toggleUserChatList: () => void;
}

export function UserChatList({ showChatList, isMobile, toggleUserChatList }: IUserChatListProps) {
  const { userRooms, enterChatRoom } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const isChatRoom = currentPath.includes('/rooms/chat');

  const handleEnterChat = (room: IChatRoom) => {
    enterChatRoom(room)
    toggleUserChatList()

    if (!isChatRoom) {
      navigate('/rooms/chat')
    }
  }

  return (
    <>
       {isMobile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                className={cn("fixed top-20 -left-3 z-50", isMobile && showChatList ? "left-66" : "")} 
                onClick={toggleUserChatList}
              >
                {showChatList ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {showChatList ? "Hide Chat List" : "Show Chat List"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <section
        className={cn(
          "h-full bg-muted/100 w-80 flex-shrink-0 flex flex-col border-r transition-all duration-300 ease-in-out",
          showChatList ? "translate-x-0 w-80" : "-translate-x-full w-0",
          isMobile && showChatList ? "fixed inset-y-0 left-0 z-40 w-70" : isMobile ? "fixed" : "",
        )}
      >
        <NavLink 
          to={isChatRoom ? "/rooms" : "/"} 
          className={cn(
            "flex justify-center my-6", 
            isMobile && !showChatList ? "element-hidden" : "element-visible")}
          >
          <Button className="w-[80%]">
            <ChevronLeft size={24} />
            {isChatRoom ? "Chat Rooms" : "Home" }
          </Button>
        </NavLink>

        <div className="p-4 border-b">
          <h3 className={cn(
            "font-semibold text-sm text-muted-foreground",
            isMobile && !showChatList ? "element-hidden" : "element-visible")}>
              Your Chats
            </h3>
        </div>
        <ScrollArea className="flex-1 overflow-y-auto custom-scroll">
          {userRooms.map(chatRoom => {
            return (
              <div 
                key={chatRoom.id_chat_room} 
                onClick={() => handleEnterChat(chatRoom)} 
                className="w-full border-b p-4 flex items-center cursor-pointer hover:shadow-lg transition-shadow"
                >
                <Avatar className="h-8 w-8 mt-0.5 mr-3 flex-shrink-0">
                  <AvatarImage src={"/placeholder.svg"} />
                  <AvatarFallback>{chatRoom.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{chatRoom.name}</p>
                  <span className="text-zinc-400 text-xs">{formatTimestamp(chatRoom.last_activity)}</span>
                </div>
              </div>
            )
          })}
        </ScrollArea>

        <div 
          className={cn(
            "p-4 border-t bg-muted/70 flex items-center transition-all duration-300 ease-in-out", 
            isMobile && !showChatList ? "element-hidden" : "element-visible")}
            >
          <div className="flex-1 min-w-0">
            <p className="text-md font-bold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <SettingsDropdown onEditName={() => {}} />
        </div>
      </section>
    </>
  )
}