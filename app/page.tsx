import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { ChatbotDemo } from "@/components/chatbot-demo"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <ChatbotDemo />
      </main>
      <Footer />
    </div>
  )
}

