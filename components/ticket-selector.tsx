"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/hooks/use-translation"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MinusCircle, PlusCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type TicketType = {
  id: string
  name: string
  description: string
  price: number
  count: number
}

export function TicketSelector() {
  const { t } = useTranslation()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [tickets, setTickets] = useState<TicketType[]>([
    {
      id: "adult",
      name: "Adult",
      description: "Ages 18-64",
      price: 15,
      count: 0,
    },
    {
      id: "senior",
      name: "Senior",
      description: "Ages 65+",
      price: 12,
      count: 0,
    },
    {
      id: "student",
      name: "Student",
      description: "With valid student ID",
      price: 10,
      count: 0,
    },
    {
      id: "child",
      name: "Child",
      description: "Ages 6-17",
      price: 8,
      count: 0,
    },
    {
      id: "toddler",
      name: "Toddler",
      description: "Ages 0-5",
      price: 0,
      count: 0,
    },
  ])

  const handleIncrement = (id: string) => {
    setTickets(tickets.map((ticket) => (ticket.id === id ? { ...ticket, count: ticket.count + 1 } : ticket)))
  }

  const handleDecrement = (id: string) => {
    setTickets(
      tickets.map((ticket) => (ticket.id === id && ticket.count > 0 ? { ...ticket, count: ticket.count - 1 } : ticket)),
    )
  }

  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price * ticket.count, 0)

  const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.count, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Select Date & Tickets</CardTitle>
          <CardDescription>Choose your visit date and the number of tickets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Visit Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => {
                    // Disable dates in the past and Mondays (museum closed)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today || date.getDay() === 1
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <Label>Tickets</Label>
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium">{ticket.name}</h3>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  <p className="text-sm font-medium">${ticket.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDecrement(ticket.id)}
                    disabled={ticket.count === 0}
                  >
                    <MinusCircle className="h-4 w-4" />
                    <span className="sr-only">Decrease</span>
                  </Button>
                  <span className="w-8 text-center">{ticket.count}</span>
                  <Button variant="outline" size="icon" onClick={() => handleIncrement(ticket.id)}>
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only">Increase</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Review your order details before proceeding to checkout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {date ? (
            <div className="flex justify-between">
              <span>Visit Date:</span>
              <span className="font-medium">{format(date, "PPP")}</span>
            </div>
          ) : (
            <div className="text-muted-foreground">Please select a visit date</div>
          )}

          <div className="space-y-2">
            {tickets.map(
              (ticket) =>
                ticket.count > 0 && (
                  <div key={ticket.id} className="flex justify-between">
                    <span>
                      {ticket.name} x {ticket.count}
                    </span>
                    <span>${(ticket.price * ticket.count).toFixed(2)}</span>
                  </div>
                ),
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!date || totalTickets === 0}
            onClick={() => alert("Proceeding to checkout...")}
          >
            Proceed to Checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

