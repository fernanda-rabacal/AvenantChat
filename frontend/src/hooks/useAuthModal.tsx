import { useState } from "react";

export function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenLogout, setIsOpenLogout] = useState(false);

  return {
    isOpen,
    setIsOpen,
    isOpenLogout,
    setIsOpenLogout
  }
}