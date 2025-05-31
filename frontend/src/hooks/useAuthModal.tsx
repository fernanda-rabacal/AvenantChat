import { useState } from "react";

export function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false) 

  return {
    isOpen,
    setIsOpen
  }
}