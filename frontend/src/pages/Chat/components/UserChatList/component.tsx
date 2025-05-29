import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatRoom, User } from "@/@types/interfaces";
import { NavLink } from "react-router-dom";

interface UserChatListProps {
  user: User;
  chatRooms: ChatRoom[];
  showChatList: boolean;
  isMobile: boolean;
  toggleUserChatList: () => void;
}

export function UserChatList({ user, chatRooms, showChatList, isMobile, toggleUserChatList }: UserChatListProps) {
  return (
    <>
       {isMobile && (
        <Button 
          size="icon" 
          className={cn("fixed top-15 -left-3 z-50", isMobile && showChatList ? "left-68" : "")} 
          onClick={toggleUserChatList}
        >
          {showChatList ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      )}

      <section
        className={cn(
          "h-full bg-muted/90 w-70 flex-shrink-0 flex flex-col border-r transition-all duration-300 ease-in-out",
          showChatList ? "translate-x-0 w-70" : "-translate-x-full w-0",
          isMobile && showChatList ? "fixed inset-y-0 left-0 z-40 w-72" : "",
        )}
      >
        <NavLink to="/chat-rooms" className="flex justify-center">
          <Button variant="link">
            <ChevronLeft size={20}/>
            Chat rooms list 
          </Button>
        </NavLink>

        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm text-muted-foreground">Chats</h3>
        </div>
        <ScrollArea className="flex-1 overflow-y-auto custom-scroll">
          {chatRooms.map(chatRoom => {
            return (
              <div key={chatRoom.id} className="w-full mx-2 border-b p-4 flex items-center cursor-pointer hover:">
                <Avatar className="h-8 w-8 mt-0.5 mr-3 flex-shrink-0">
                  <AvatarImage src={chatRoom.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{chatRoom.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{chatRoom.name}</p>
                  <span className="text-zinc-400 text-xs">{chatRoom.lastActivity}</span>
                </div>
              </div>
            )
          })}
        </ScrollArea>

        <div className={cn("p-4 border-t bg-muted/70 flex items-center transition-all duration-300 ease-in-out", 
          isMobile && !showChatList ? "element-hidden" : "element-visible")}>
          <div className="flex-1 min-w-0">
            <p className="text-md font-bold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings size={16} />
          </Button>
        </div>
      </section>
    </>
  )
}