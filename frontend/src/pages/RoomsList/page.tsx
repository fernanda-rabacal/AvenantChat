
import { useState } from "react"
import { Search, Users, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CreateRoomModal } from "./CreateRoomModal/component"
import { mockChatRooms } from "@/data/mocks"
import { Header } from "@/components/header"
import { useNavigate } from "react-router-dom"

export default function ChatRoomsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const navigate = useNavigate()
  const categories = ["All", ...Array.from(new Set(mockChatRooms.map((room) => room.category)))]

  const filteredRooms = mockChatRooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || room.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleJoinRoom = (roomId: string | undefined) => {
    navigate(`/rooms/${roomId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Chat Rooms</h1>
            <p className="text-muted-foreground text-lg">Join conversations and connect with communities</p>
          </div>

          <CreateRoomModal categories={categories} />
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search chat rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>

          <div className="flex flex-wrap gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={room.avatar || "/placeholder.svg"} alt={room.name} />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{room.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={room.isOnline ? "default" : "secondary"} className="text-xs">
                          {room.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-4 line-clamp-2">{room.description}</CardDescription>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{room.memberCount.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{room.lastActivity}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleJoinRoom(room?.id)}
                  variant={"default"}
                >
                  Join Room
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No chat rooms found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
