import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EditMessageModalProps {
  isOpen: boolean
  onClose: () => void
  currentMessage: string
  onSave: (newMessage: string) => void
}

export function EditMessageModal({ isOpen, onClose, currentMessage, onSave }: EditMessageModalProps) {
  const [editedMessage, setEditedMessage] = useState("")

  useEffect(() => {
    if (isOpen) {
      setEditedMessage(currentMessage)
    }
  }, [isOpen, currentMessage])

  const handleSave = () => {
    if (editedMessage.trim()) {
      onSave(editedMessage.trim())
    }
    onClose()
  }

  const handleCancel = () => {
    setEditedMessage(currentMessage)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              placeholder="Enter your message"
              className="min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleSave()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
