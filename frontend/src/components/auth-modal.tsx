import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner" 
import { useForm } from "react-hook-form"
import { loginFormSchema, registerFormSchema } from "@/utils/validationSchemas"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthModal } from "@/hooks/useAuthModal"

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  name: string;
  confirm_password: string;
}

type RegisterFormData = z.infer<typeof registerFormSchema>
type LoginFormData = z.infer<typeof loginFormSchema>


export function AuthModal() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
   const { isOpen, setIsOpen } = useAuthModal()
   
  const form = useForm<RegisterFormData | LoginFormData>({
    resolver: zodResolver(
      authMode === "register" ? registerFormSchema : loginFormSchema
    )
  })

  const { 
    register, 
    handleSubmit,
    reset, 
    formState: { errors, isSubmitting }
  } = form;

  useState(() => {
    if (isOpen) {
      setAuthMode("login")
    }
  })

  const handleAuth = async (data: LoginData | RegisterData) => {
    reset()

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast(
        authMode === "login"
          ? "You have been successfully logged in."
          : "Your account has been created successfully. Welcome to Avenant!")
    reset()

    setIsOpen(false)
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login")

    reset()
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{authMode === "login" ? "Welcome Back" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {authMode === "login"
              ? "Sign in to your account to continue"
              : "Create a new account to get started with Avenant"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
          {authMode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                disabled={isSubmitting}
                error={errors.name?.message}
                {...register("name")}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              disabled={isSubmitting}
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={isSubmitting}
                error={errors.password?.message}
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {authMode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={"password"}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                  error={errors.confirm_password?.message}
                  {...register("confirm_password")}
                />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : authMode === "login" ? "Sign In" : "Create Account"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <Button type="button" variant="link" className="p-0 h-auto" onClick={switchAuthMode} disabled={isSubmitting}>
              {authMode === "login" ? "Sign up" : "Sign in"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
