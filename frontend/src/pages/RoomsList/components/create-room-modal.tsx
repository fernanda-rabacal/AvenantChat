import { useState } from "react";
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom";
import z  from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRoomSchema } from "@/utils/validationSchemas";
import { useChat } from "@/hooks/useChat";
import type { ICreateRoomDataProps } from "@/@types/interfaces";

type CreateRoomFormData = z.infer<typeof createRoomSchema>;

export function CreateRoomModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { createChatRoom } = useChat();
  const { 
    register,
    handleSubmit,
    clearErrors,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      category: "",
    },
  });

  const categories = ["Tech", "Gaming", "Books"]

  const handleCreateRoom = async (data: ICreateRoomDataProps) => {
    createChatRoom(data);
    setIsModalOpen(false);
    navigate(`/rooms/chat`);
  };

  const handleCancelCreateRoom = () => {
     setIsModalOpen(false);
     clearErrors();
     reset();
  };

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

        <form onSubmit={handleSubmit(handleCreateRoom)} className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                placeholder="Enter room name..."
                maxLength={50}
                error={errors.name?.message}
                {...register("name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}>
                    <SelectTrigger className="w-full" error={errors.category?.message}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this room is about..."
                maxLength={200}
                rows={3}
                error={errors.description?.message}
                {...register("description")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelCreateRoom} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}