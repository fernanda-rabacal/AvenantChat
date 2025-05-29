import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";

export function CreateRoomModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const allCategories = ["All" ]

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsCreating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsModalOpen(false)
    setIsCreating(false)

    // Simulate navigation to the new chat room
    // In a real app: router.push(`/chat/${newRoom.id}`)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(field, value)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="flex items-center gap-2">
          <Plus size={20} />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Chat Room</DialogTitle>
          <DialogDescription>
            Create a new chat room for your community. Fill in the details below to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div className="space-y-4">
            {/* Room Name */}
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name *</Label>
              <Input
                id="room-name"
                placeholder="Enter room name..."
                value={''}
                onChange={(e) => handleInputChange("name", e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">{}/50 characters</p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="room-category">Category *</Label>
              <Select value={''} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                placeholder="Describe what this room is about..."
                value={''}
                onChange={(e) => handleInputChange("description", e.target.value)}
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{''}/200 characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}