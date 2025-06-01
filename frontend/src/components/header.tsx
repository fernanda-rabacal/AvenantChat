import { MessageCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "./ui/button";
import { AuthModal } from "./auth-modal";
import { ConfirmLogoutModal } from "./confirm-logout-modal";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { setIsOpen, isOpen, isOpenLogout, setIsOpenLogout } = useAuthModal();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <NavLink to='/' className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Avenant</span>
        </NavLink>
        {
          isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Button size="sm" className="flex items-center gap-2" onClick={() => setIsOpenLogout(true)}>
                {user?.name}
              </Button>
              <ConfirmLogoutModal isOpen={isOpenLogout} setIsOpen={setIsOpenLogout} />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button size="sm" className="flex items-center gap-2" onClick={() => setIsOpen(true)}>
                Sign In
              </Button>
              <AuthModal isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>
          )
        }
      </header>
  )
}