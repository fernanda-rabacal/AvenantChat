import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Settings, Edit, LogOut } from "lucide-react"
import { ConfirmLogoutModal } from "./confirm-logout-modal"
import { useState } from "react"

interface SettingsDropdownProps {
  onEditName: () => void
}

export function SettingsDropdown({ onEditName }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleIsOpen = () => {
    setIsOpen(true)
  }

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
        <ConfirmLogoutModal isOpen={isOpen} setIsOpen={setIsOpen} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
