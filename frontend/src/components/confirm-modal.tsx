import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IConfirmModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  title: string;
  description: string;
  buttonLoadingTitle: string;
  buttonConfirmTitle: string;
  onConfirm: () => void;
}

export function ConfirmModal({ 
  isOpen, 
  setIsOpen, 
  title, 
  description, 
  buttonLoadingTitle, 
  buttonConfirmTitle,
  onConfirm
}: IConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    onConfirm();
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-muted-foreground" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isLoading} 
            className="gap-2"
            >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {buttonLoadingTitle}
              </>
            ) : (
              <>
                <LogOut size={16} />
                {buttonConfirmTitle}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
