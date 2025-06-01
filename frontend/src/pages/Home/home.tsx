import { MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { AuthModal } from "@/components/auth-modal"
import { useAuthModal } from "@/hooks/useAuthModal"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export default function HomePage() {
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()
  const { setIsOpen, isOpen } = useAuthModal()
  const { isAuthenticated } = useAuth();

  const handleJoinChat = () => {
    if (isAuthenticated) {
     return navigate('/rooms')
    }

    setIsOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
      <Header />
      <AuthModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
            Connect, Chat, Collaborate
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Where conversations flow freely and communities thrive. Join thousands of users already connecting in
            real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="h-14 text-lg relative group flex items-center gap-2" onClick={handleJoinChat}>
                Join a Chat
                <ArrowRight className="h-5 w-5 transition-transform duration-300 hover:translate-x-1" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-center">
            <div>
              <p className="text-3xl font-bold">10k+</p>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-muted-foreground">Chat Rooms</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-bold">Avenant</span>
            </div>
            <p className="text-sm text-muted-foreground">© {currentYear} Avenant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
