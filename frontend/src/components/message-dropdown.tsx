import { Edit, Trash2 } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface IMessageDropdownProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  setIsDropdownOpen: (value: boolean) => void;
}

export function MessageDropdown({ children, onEdit, onDelete, setIsDropdownOpen }: IMessageDropdownProps) {

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger className="w-8" asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          Edit message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
