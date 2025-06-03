
import { useEffect, useState } from "react"
import { Search, MessageCircle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserChatList } from "@/components/user-chat-list-component"
import { CreateRoomModal } from "./components/create-room-modal"
import { Header } from "@/components/header"
import { RoomCardItem } from "./components/room-card"
import { useChat } from "@/hooks/useChat"
import { useMobile } from "@/hooks/useMobile"
import { categories } from "@/data/categories"

export default function ChatRoomsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showChatList, setShowChatList] = useState(true);
  const { rooms, getChatRooms } = useChat();
  const isMobile = useMobile();

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || room.category === selectedCategory
    return matchesSearch && matchesCategory
  });

  useEffect(() => {
    if (isMobile) {
      setShowChatList(false);
    } else {
      setShowChatList(true);
    }
  }, [isMobile]);


  const toggleUserChatList = () => {
    setShowChatList(!showChatList);
  };

  useEffect(() => {
    getChatRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex h-screen w-screen bg-background md:gap-12">
      <UserChatList 
        showChatList={showChatList} 
        isMobile={isMobile}
        toggleUserChatList={toggleUserChatList}
        />
        
      <div className="flex-1 px-4 md:pr-12 max-h-screen flex flex-col justify-between">
        <Header />

        <div className="container mx-auto px-4 py-4">
          <div className="mb-8 flex items-center justify-between flex-col md:flex-row">
            <div>
              <h1 className="text-4xl font-bold mb-2">Chat Rooms</h1>
              <p className="text-muted-foreground text-lg mb-6 md:mb-0">Join conversations and connect with communities</p>
            </div>

            <CreateRoomModal />
          </div>

          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search chat rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-6 pl-10 max-w-md"
              />
            </div>

            <div className="flex flex-wrap gap-4 md:gap-2 mt-8">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {filteredRooms.length > 0 ? (
          <div className="flex-1 overflow-y-auto custom-scroll p-3 mb-4 flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCardItem key={room.id_chat_room} room={room} />
            ))}
          </div>
        ) : (
          <div className="flex-1 text-center py-6">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No chat rooms found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </main>
  )
}
