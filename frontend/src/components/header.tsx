import { LogOut, MessageCircle } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "./ui/button";
import { AuthModal } from "./auth-modal";
import { ConfirmModal } from "./confirm-modal"; 
import { useAuthModal } from "@/hooks/useAuthModal";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function Header() {
  const { setIsOpen, isOpen, isOpenLogout, setIsOpenLogout } = useAuthModal();
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

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
    <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <NavLink to='/' className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Avenant</span>
        </NavLink>
        {
          isAuthenticated ? (
            <div className="flex items-center gap-4">

              <Button size="sm" className="flex items-center gap-2" onClick={() => setIsOpenLogout(true)}>
                <LogOut /> Log out
              </Button>
              <ConfirmModal 
                isOpen={isOpenLogout} 
                setIsOpen={setIsOpenLogout} 
                title="Confirm Logout"
                description="Are you sure you want to log out? You will need to log in again to access your account."
                buttonLoadingTitle="Logging out..."
                buttonConfirmTitle="Logout"
                onConfirm={handleConfirm}
                />
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