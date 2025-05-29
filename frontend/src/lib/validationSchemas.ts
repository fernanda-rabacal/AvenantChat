import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(5, "Name is required"),
  category: z.string().min(5, "Category is required"),
  description: z.string().optional().nullable(),
})