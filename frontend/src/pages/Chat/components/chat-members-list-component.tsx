import { ChevronLeft, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/utils";
import { useChat } from "@/hooks/useChat";

interface IChatMembersListProps {
  showMembers: boolean;
  isMobile: boolean;
  toggleMembersList: () => void;
}

export function ChatMembersList({ showMembers, isMobile, toggleMembersList }: IChatMembersListProps) {
  const { chatRoomMembers } = useChat();

  return (
    <>
      {isMobile && (
        <Button 
          size="icon" 
          className={cn("fixed top-15 -right-3 z-50", isMobile && showMembers ? "right-68" : "")} 
          onClick={toggleMembersList}
        >
          {showMembers ?  <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      )}
      
      <section
        className={cn(
          "bg-muted/90 w-60 flex-shrink-0 border-l transition-all duration-300 ease-in-out",
          showMembers ? "translate-x-0 w-60" : "translate-x-full w-0",
          isMobile && showMembers ? "fixed inset-y-0 right-0 z-40 w-72" : "",
          isMobile && !showMembers ? "element-hidden" : "element-visible"
        )}
      >  
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm text-muted-foreground">MEMBERS — {chatRoomMembers.length}</h3>
        </div>

        <ScrollArea className="p-2">
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">
              ONLINE — {chatRoomMembers.filter((member) => member.user?.is_online).length}
            </h4>
            {chatRoomMembers
              .filter((member) => member.user?.is_online)
              .map((member) => (
                <div
                  key={member.id_chat_room_member}
                  className="flex items-center px-2 py-2 rounded-md hover:bg-accent/50 cursor-pointer"
                  >
                  <div className="relative mr-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{member.user?.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.user?.name}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">
              OFFLINE — {chatRoomMembers.filter((member) => !member.user?.is_online).length}
            </h4>
            {chatRoomMembers
              .filter((member) => !member.user?.is_online)
              .map((member) => (
                <div
                  key={member.id_chat_room_member}
                  className="flex items-center px-2 py-2 rounded-md hover:bg-accent/50 cursor-pointer"
                >
                  <div className="relative mr-2">
                    <Avatar className="h-8 w-8 opacity-70">
                      <AvatarImage src={member.user?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{member.user?.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-gray-500 border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground truncate">{member.user?.name}</p>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </section>
    </>
  )
}