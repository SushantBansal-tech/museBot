"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/hooks/use-translation"
import { Send, Mic, StopCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const { t } = useTranslation()
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t("chatbot_welcome"),
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        role: "assistant",
        content: simulateBotResponse(input),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const simulateBotResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("ticket") || lowerInput.includes("book") || lowerInput.includes("price")) {
      return t("chatbot_demo_response")
    } else if (lowerInput.includes("hour") || lowerInput.includes("open")) {
      return "The museum is open from 9:00 AM to 6:00 PM, Tuesday through Sunday. We're closed on Mondays and major holidays."
    } else if (lowerInput.includes("exhibition") || lowerInput.includes("show")) {
      return "We currently have several exhibitions: 'Modern Art Masterpieces', 'Ancient Civilizations', and our special exhibition 'Digital Futures'. Would you like information about any of these?"
    } else {
      return "I'm here to help with museum information and ticket booking. You can ask about ticket prices, opening hours, current exhibitions, or start the booking process."
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false)
        setInput("I'd like to book tickets for tomorrow")
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-6 md:py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("chatbot_title")}</CardTitle>
              <CardDescription>{t("chatbot_subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 h-[500px] overflow-y-auto p-4 rounded-lg border">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{message.role === "user" ? "U" : "M"}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder={t("chatbot_input_placeholder")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button type="button" size="icon" variant="outline" onClick={toggleRecording}>
                  {isRecording ? <StopCircle className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                  <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                </Button>
                <Button type="submit" size="icon" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">{t("send")}</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

