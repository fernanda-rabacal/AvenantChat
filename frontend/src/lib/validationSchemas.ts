import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(5, "Name is required"),
  category: z.string().min(5, "Category is required"),
  description: z.string().optional(),
})

export const sendMessageSchema = z.object({
  message: z.string().min(1)
})