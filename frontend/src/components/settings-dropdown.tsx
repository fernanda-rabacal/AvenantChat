import { Settings, Edit, LogOut } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ConfirmModal } from "./confirm-modal"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface ISettingsDropdownProps {
  onEditName: () => void
}

export function SettingsDropdown({ onEditName }: ISettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleIsOpen = () => {
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    try {
      signOut()
      toast.success('Logged out successfully')
      setIsOpen(false)
      navigate("/")
    } catch (err: unknown) {
      console.error("signOut - confirmLogout err>> ", err)
      toast.error('There was an error logging out. Please try again.')
    } 
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Open settings menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEditName} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          Edit Name
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleIsOpen} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
        <ConfirmModal 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
          title="Confirm Logout"
          description="Are you sure you want to log out? You will need to log in again to access your account."
          buttonLoadingTitle="Logging out..."
          buttonConfirmTitle="Logout"
          onConfirm={handleConfirm}
          />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
