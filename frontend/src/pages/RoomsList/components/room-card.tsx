import { useNavigate } from "react-router-dom";
import { MessageCircle, Users } from "lucide-react";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { formatTimestamp } from "@/utils/formatTimestamp";
import type { IChatRoom } from "@/@types/interfaces";

interface IRoomCardItemProps {
  room: IChatRoom
}

export function RoomCardItem({ room }: IRoomCardItemProps) {
  const navigate = useNavigate();
  const { userRooms, joinChatRoom, enterChatRoom } = useChat();
  const userAlreadyInRoom = userRooms.find(r => r.id_chat_room === room.id_chat_room);

  const handleJoinRoom = (room: IChatRoom) => {
    joinChatRoom(room);
    navigate(`/rooms/chat`);
  };
  
  const handleEnterRoom = (room: IChatRoom) => {
    enterChatRoom(room);
    navigate(`/rooms/chat`);
  };

  return (
    <Card key={room.id_chat_room} className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg truncate">{room.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="mb-4 line-clamp-2">{room.description}</CardDescription>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{room.members_count} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{formatTimestamp(room.last_activity)}</span>
          </div>
        </div>
        {
          userAlreadyInRoom ? (
            <Button className="w-full" onClick={() => handleEnterRoom(room)} variant ={"ghost"}>
              Enter Room
            </Button>
          ) : (
            <Button className="w-full" onClick={() => handleJoinRoom(room)} variant ={"default"}>
              Join Room
            </Button>
          )
        }    
      </CardContent>
    </Card>
  )
}