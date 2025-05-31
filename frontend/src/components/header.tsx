import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { NavLink } from "react-router-dom";

export function Header() {
  return (
    <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <NavLink to='/' className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Avenant</span>
        </NavLink>
        <div className="flex items-center gap-4">
          <Button size="sm">Sign In</Button>
        </div>
      </header>
  )
}