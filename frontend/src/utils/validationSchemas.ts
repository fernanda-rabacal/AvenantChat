import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(5, "Name is required"),
  category: z.string().nonempty("Category is required"),
  description: z.string().optional(),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1)
});

export const loginFormSchema = z.object({
    email: z
    .string()
    .min(1, { message: "E-mail is required" })
    .email("Inform a valid e-mail"),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

export const registerFormSchema = loginFormSchema.extend({
  name: z
    .string()
    .min(3, { message: "Name is required"}),
  confirm_password: z
    .string()
    .min(1, { message: "Confirm your password" }),
})
.refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm"],
});