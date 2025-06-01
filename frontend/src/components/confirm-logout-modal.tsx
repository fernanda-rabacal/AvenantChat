import { useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

interface LogoutModalProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

export function ConfirmLogoutModal({ isOpen, setIsOpen }: LogoutModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signOut } = useAuth();
  const navigate = useNavigate()

  const handleConfirm = async () => {
    setIsLoading(true)

    try {
      signOut()
      toast.success('Logged out successfully')
      setIsOpen(false)
      navigate("/")
    } catch (err: unknown) {
      console.log(err)
      toast.error('There was an error logging out. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-muted-foreground" />
            Confirm Logout
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to log out? You will need to log in again to access your account.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
