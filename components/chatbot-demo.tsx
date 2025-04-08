// File: components/ChatbotDemo.tsx
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/hooks/use-translation"
import { Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Museum = {
  _id: string;
  name: string;
  description: string;
  location: string;
  ticketPrice: number;
  timeStart: string;
  timeEnd: string;
  ratings: number;
}

type Message = {
  role: "user" | "assistant"
  content: string
}

type ChatState = {
  step: 'welcome' | 'askName' | 'askAge' | 'showMuseums' | 'conversation' | 'bookingProcess';
  userName: string | null;
  userAge: number | null;
  museums: Museum[];
  selectedMuseum?: Museum;
  bookingStep?: 'askVisitDate' | 'askVisitorCount' | 'confirmBooking' | 'bookingComplete' | null;
  bookingDetails?: {
    visitDate?: string;
    visitorCount?: number;
    totalAmount?: number;
    bookingId?: string;
  };


}

export function ChatbotDemo() {
  const { t } = useTranslation()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Chat state to manage conversation flow
  const [chatState, setChatState] = useState<ChatState>({
    step: 'welcome',
    userName: null,
    userAge: null,
    museums: []
  })
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t("chatbot_welcome"),
    },
  ])

  useEffect(() => {
    // Initial chatbot prompt for name
    if (chatState.step === 'welcome') {
      setTimeout(() => {
        const botPrompt: Message = {
          role: "assistant",
          content: "Hi there! I'm your museum guide. Could you tell me your name?",
        }
        setMessages(prev => [...prev, botPrompt])
        setChatState(prev => ({ ...prev, step: 'askName' }))
      }, 1000)
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to the most recent message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Enhanced fetchMuseums function for ChatbotDemo.tsx
  const fetchMuseums = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching museums from API...")
      
      const response = await fetch('/api/museum')
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("API response:", data)
      
      if (data.success && data.museums && Array.isArray(data.museums)) {
        console.log(`Found ${data.museums.length} museums`)
        
        setChatState(prev => ({ ...prev, museums: data.museums }))
        
        // Create museums list message with more attractive formatting
        let museumListContent = `Great! Here are some museums you might be interested in:\n\n`
        
        if (data.museums.length === 0) {
          museumListContent = "I couldn't find any museums at the moment. Would you like to try again later?"
          
          const noMuseumsResponse: Message = {
            role: "assistant",
            content: museumListContent,
          }
          setMessages(prev => [...prev, noMuseumsResponse])
        } else {
          // First, add a simple text introduction
          const introMessage: Message = {
            role: "assistant",
            content: "Great! Here are some museums you might be interested in:",
          }
          setMessages(prev => [...prev, introMessage])
          
          // Then, for each museum, add a separate message with card-like formatting
          data.museums.forEach((museum: Museum, index: number) => {
            const museumCard: Message = {
              role: "assistant",
              content: 
                `${index + 1}. ${museum.name} - ${museum.location}\n` +
                `   Price: $${museum.ticketPrice} | Hours: ${museum.timeStart}-${museum.timeEnd}\n` +
                `   Rating: ${museum.ratings}/5\n`,
            }
            setMessages(prev => [...prev, museumCard])
          })
          
          // Add a follow-up question
          const followUpMessage: Message = {
            role: "assistant",
            content: "Would you like more information about any of these museums? Or would you like to book tickets for one of them?",
          }
          setMessages(prev => [...prev, followUpMessage])
        }
        
        setChatState(prev => ({ ...prev, step: 'conversation' }))
      } else {
        throw new Error("Invalid response format or no museums found")
      }
    } catch (error) {
      console.error("Error fetching museums:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I couldn't retrieve museum information at the moment. Please try again later.",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  // Add this function to your ChatbotDemo component
const createBooking = async () => {
  if (!chatState.selectedMuseum || !chatState.bookingDetails) {
    return false;
  }
  
  try {
    const bookingData = {
      museumId: chatState.selectedMuseum._id,
      visitDate: chatState.bookingDetails.visitDate,
      visitorCount: chatState.bookingDetails.visitorCount,
      // Generate a unique chat session ID
      chatSessionId: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.booking;
    } else {
      throw new Error(data.message || 'Unknown error');
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    return false;
  }
}

 // Enhanced process function to handle museum selection and booking
const processUserInput = async (userInput: string) => {

  // Handle responses based on conversation stage
  switch (chatState.step) {
    case 'askName':
      // Save name and ask for age
      setChatState(prev => ({ 
        ...prev, 
        userName: userInput,
        step: 'askAge' 
      }))
      
      setTimeout(() => {
        const botResponse: Message = {
          role: "assistant",
          content: `Nice to meet you, ${userInput}! Could you tell me your age?`,
        }
        setMessages(prev => [...prev, botResponse])
      }, 1000)
      break
      
    case 'askAge':
      const age = parseInt(userInput)
      if (isNaN(age)) {
        // Handle invalid age input
        setTimeout(() => {
          const botResponse: Message = {
            role: "assistant",
            content: "I'm sorry, I couldn't understand that age. Could you please provide a number?",
          }
          setMessages(prev => [...prev, botResponse])
        }, 1000)
      } else {
        // Save age and fetch museums
        setChatState(prev => ({ 
          ...prev, 
          userAge: age,
          step: 'showMuseums' 
        }))
        
        setTimeout(() => {
          const botResponse: Message = {
            role: "assistant",
            content: `Thanks! I'm fetching museum information for you...`,
          }
          setMessages(prev => [...prev, botResponse])
          fetchMuseums()
        }, 1000)
      }
      break
      
    case 'conversation':
      // Enhanced handling for museum selection and booking
      setIsLoading(true)
      
      try {
        const userQuery = userInput.toLowerCase()
        
        // Check if user wants to visit a specific museum
        if (userQuery.includes('visit') || userQuery.includes('book') || userQuery.includes('ticket')) {
          // Try to identify which museum they're interested in
          const matchedMuseums = chatState.museums.filter(museum => 
            userQuery.includes(museum.name.toLowerCase()) || 
            userQuery.includes(museum.location.toLowerCase())
          )
          
          if (matchedMuseums.length > 0) {
            // Found a specific museum mentioned
            const selectedMuseum = matchedMuseums[0]
            
            // Update chat state to include selected museum
            setChatState(prev => ({
              ...prev,
              selectedMuseum: selectedMuseum,
              tep: 'bookingProcess',
              bookingStep: 'askVisitDate'
            }))

            setTimeout(() => {
              const botResponse: Message = {
                role: "assistant",
                content: `Great choice! The ${selectedMuseum.name} is an excellent museum to visit. When would you like to visit? Please provide a date (e.g., "tomorrow", "next Saturday", or "May 15").`
              }
              console.log("Selected museum:", selectedMuseum);
              setMessages(prev => [...prev, botResponse])
              setIsLoading(false)
            }, 1000)
          } else {
            // User wants to book but didn't specify which museum
            setTimeout(() => {
              const botResponse: Message = {
                role: "assistant",
                content: "I'd be happy to help you book tickets! Which museum from the list would you like to visit?"
              }
              setMessages(prev => [...prev, botResponse])
              setIsLoading(false)
            }, 1000)
          }
        } else {
          // Process general queries about museums
          const matchedMuseums = chatState.museums.filter(museum => 
            museum.name.toLowerCase().includes(userQuery) || 
            museum.location.toLowerCase().includes(userQuery)
          )
          
          setTimeout(() => {
            let responseContent = ""
            console.log("Matched museums:", matchedMuseums);
            
            if (matchedMuseums.length > 0) {
              const museum = matchedMuseums[0]
              responseContent = `Here's more information about ${museum.name}:\n\n` +
                `📍 Location: ${museum.location}\n` +
                `💰 Ticket Price: $${museum.ticketPrice}\n` +
                `🕒 Hours: ${museum.timeStart} - ${museum.timeEnd}\n` +
                `⭐ Rating: ${museum.ratings}/5\n\n` +
                `${museum.description}\n\n` +
                `Would you like to book tickets for this museum?`
            } else if (userQuery.includes("list") || userQuery.includes("show") || userQuery.includes("museums")) {
              // User wants to see the list again
              responseContent = "Here are the museums again:\n\n"
              chatState.museums.forEach((museum, index) => {
                responseContent += `${index + 1}. ${museum.name} - ${museum.location}\n` +
                  `   Price: $${museum.ticketPrice} | Hours: ${museum.timeStart}-${museum.timeEnd}\n` +
                  `   Rating: ${museum.ratings}/5\n\n`
              })
              responseContent += "Would you like more information about any of these museums?"
            } else {
              responseContent = `I'm not sure I understood that. Would you like to know more about a specific museum, or would you like to book tickets?`
            }
            
            const botResponse: Message = {
              role: "assistant",
              content: responseContent
            }
            setMessages(prev => [...prev, botResponse])
            setIsLoading(false)
          }, 1000)
        }
      } catch (error) {
        console.error("Error processing user query:", error)
        setTimeout(() => {
          const botResponse: Message = {
            role: "assistant",
            content: "I'm sorry, I had trouble processing your request. Could you try asking in a different way?"
          }
          setMessages(prev => [...prev, botResponse])
          setIsLoading(false)
        }, 1000)
      }
      break
      
    // New booking process steps
    case 'bookingProcess':
      handleBookingProcess(userInput)
      break
      
    default:
      // Fallback response
      setTimeout(() => {
        const botResponse: Message = {
          role: "assistant",
          content: "I'm not sure how to respond to that. Could you please try again?"
        }
        setMessages(prev => [...prev, botResponse])
      }, 1000)
  }
}

// New function to handle the booking process
const handleBookingProcess = async (userInput: string) => {
  const bookingStep = chatState.bookingStep || 'askVisitDate'
  setIsLoading(true)
  
  switch (bookingStep) {
    case 'askVisitDate':
      // Process the provided date
      // For demo purposes, we'll accept any date format
      setChatState(prev => ({
        ...prev,
        bookingDetails: {
          ...prev.bookingDetails,
          visitDate: userInput
        },
        bookingStep: 'askVisitorCount'
      }))
      
      setTimeout(() => {
        const botResponse: Message = {
          role: "assistant",
          content: `Great! How many visitors will be attending? (Please provide a number)`
        }
        setMessages(prev => [...prev, botResponse])
        setIsLoading(false)
      }, 1000)
      break
      
    case 'askVisitorCount':
      const visitorCount = parseInt(userInput)
      if (isNaN(visitorCount) || visitorCount < 1) {
        setTimeout(() => {
          const botResponse: Message = {
            role: "assistant",
            content: "I'm sorry, I need a valid number of visitors. Please provide a number greater than 0."
          }
          setMessages(prev => [...prev, botResponse])
          setIsLoading(false)
        }, 1000)
      } else {
        // Calculate total amount based on the museum's ticket price
        const selectedMuseum = chatState.selectedMuseum
        const totalAmount = selectedMuseum ? visitorCount * selectedMuseum.ticketPrice : 0
        
        setChatState(prev => ({
          ...prev,
          bookingDetails: {
            ...prev.bookingDetails,
            visitorCount,
            totalAmount
          },
          bookingStep: 'confirmBooking'
        }))
        
        setTimeout(() => {
          const botResponse: Message = {
            role: "assistant",
            content: `Perfect! Here's your booking summary:\n\n` +
              `Museum: ${selectedMuseum?.name || "Unknown Museum"}\n` +
              `Date: ${chatState.bookingDetails?.visitDate ?? "Not specified"}\n` +
              `Number of visitors: ${visitorCount}\n` +
              `Total price: $${totalAmount}\n\n` +
              `Would you like to confirm this booking? (Yes/No)`
          }
          setMessages(prev => [...prev, botResponse])
          setIsLoading(false)
        }, 1000)
      }
      break
      
    case 'confirmBooking':
      if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('confirm')) {
        // Process the booking
        try {
          setIsLoading(true);
          // Call the createBooking function instead of just simulating
          const bookingResult = await createBooking();
          
          if (bookingResult) {
            setChatState(prev => ({
              ...prev,
              bookingStep: 'bookingComplete',
              bookingDetails: {
                ...prev.bookingDetails,
                bookingId: bookingResult._id || bookingResult.bookingId
              }
            }));
            
            setTimeout(() => {
              const botResponse: Message = {
                role: "assistant",
                content: `Great! Your booking has been confirmed.\n\n` +
                  `Booking reference: ${bookingResult._id || bookingResult.bookingId}\n` +
                  `We've sent the details to your email address.\n\n` +
                  `Is there anything else I can help you with?`
              }
              setMessages(prev => [...prev, botResponse]);
              setIsLoading(false);
            }, 1000);
          } else {
            throw new Error("Booking creation failed");
          }
        } catch (error) {
          console.error("Error creating booking:", error);
          setTimeout(() => {
            const botResponse: Message = {
              role: "assistant",
              content: "I'm sorry, there was an error processing your booking. Please try again later."
            }
            setMessages(prev => [...prev, botResponse]);
            setIsLoading(false);
          }, 1000);
        }
      } else {
        // User declined the booking
        setChatState(prev => ({
          ...prev,
          bookingStep: null,
          step: 'conversation'
        }))
        
        setTimeout(() => {
          const botResponse: Message = {
            role: "assistant",
            content: "No problem! Your booking has been cancelled. Is there something else you'd like to know about our museums?"
          }
          setMessages(prev => [...prev, botResponse])
          setIsLoading(false)
        }, 1000)
      }
      break
      
    default:
      setTimeout(() => {
        const botResponse: Message = {
          role: "assistant",
          content: "I'm not sure what information you're providing. Let's start over with the booking process."
        }
        setMessages(prev => [...prev, botResponse])
        setChatState(prev => ({
          ...prev,
          bookingStep: 'askVisitDate'
        }))
        setIsLoading(false)
      }, 1000)
  }
}

  const handleSend = () => {
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = input
    setInput("")
    
    // Process the user's message
    processUserInput(userInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">{t("chatbot_demo_title")}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("chatbot_demo_description")}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl mt-12">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("chatbot_title")}</CardTitle>
              <CardDescription>{t("chatbot_subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={chatContainerRef} className="space-y-4 h-[400px] overflow-y-auto p-4 rounded-lg border">
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
                        } whitespace-pre-wrap`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[80%] flex-row">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>M</AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <div className="flex items-center space-x-1">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
                          <div className="h-2 w-2 animate-bounce rounded-full bg-current" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-2 w-2 animate-bounce rounded-full bg-current" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder={t("chatbot_input_placeholder")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  onClick={handleSend} 
                  disabled={isLoading}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">{t("send")}</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}