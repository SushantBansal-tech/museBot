import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TicketSelector } from "@/components/ticket-selector"

export default function TicketsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-6 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Museum Tickets</h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Select your tickets and proceed to checkout. You can also use our chatbot for a more interactive booking
              experience.
            </p>
          </div>

          <TicketSelector />
        </div>
      </main>
      <Footer />
    </div>
  )
}

