"use client"
import React, { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { useTranslation } from "../hooks/use-translation"
import { Send } from "lucide-react"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
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
  role: "user" | "assistant";
  content: string;
  codeSnippet?: string;
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
  userId?: string;
}
export function ChatbotDemo() {
  const { t } = useTranslation()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Generate or retrieve userId for session persistence
  const [userId] = useState(() => {
    const storedId = localStorage.getItem('musebot_userId')
    if (storedId) return storedId
    const newId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('musebot_userId', newId)
    return newId
  })
  
  // Chat state to manage conversation flow
  const [chatState, setChatState] = useState<ChatState>({
    step: 'welcome',
    userName: null,
    userAge: null,
    museums: [],
    userId
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
  // Function to send message to backend API for code responses
  const sendMessageToBackend = async (userInput: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          userId: chatState.userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching response from backend:", error);
      return {
        response: "I'm sorry, I couldn't process your request. Please try again.",
        detectedLanguage: "en",
        languageName: "English",
        userId: chatState.userId || "",
      };
    } finally {
      setIsLoading(false);
    }
  };
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
        // For code-related requests, check if the input contains code-related keywords
        const codeKeywords = ['code', 'function', 'example', 'snippet', 'json', 'script', 'api'];
        const isCodeRequest = codeKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
        
        if (isCodeRequest) {
          // If it might be a code request, use the backend API
          const response = await sendMessageToBackend(userInput);
          
          const botResponse: Message = {
            role: "assistant",
            content: response.response,
            codeSnippet: response.codeSnippet
          };
          
          setMessages(prev => [...prev, botResponse]);
          
        } else {
          // Continue with normal conversation flow
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
                  step: 'bookingProcess',
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
        }
        break
        
      case 'bookingProcess':
        // Handle the booking process steps
        if (chatState.bookingStep === 'askVisitDate') {
          // Save the visit date and ask for visitor count
          setChatState(prev => ({
            ...prev,
            bookingDetails: {
              ...prev.bookingDetails,
              visitDate: userInput
            },
            bookingStep: 'askVisitorCount'
          }));
          
          setTimeout(() => {
            const botResponse: Message = {
              role: "assistant",
              content: "How many visitors will be attending?"
            };
            setMessages(prev => [...prev, botResponse]);
          }, 1000);
        } else if (chatState.bookingStep === 'askVisitorCount') {
          const count = parseInt(userInput);
          
          if (isNaN(count) || count <= 0) {
            setTimeout(() => {
              const botResponse: Message = {
                role: "assistant",
                content: "Please provide a valid number of visitors."
              };
              setMessages(prev => [...prev, botResponse]);
            }, 1000);
          } else {
            // Calculate total amount
            const totalAmount = count * (chatState.selectedMuseum?.ticketPrice || 0);
            
            setChatState(prev => ({
              ...prev,
              bookingDetails: {
                ...prev.bookingDetails,
                visitorCount: count,
                totalAmount
              },
              bookingStep: 'confirmBooking'
            }));
            
            setTimeout(() => {
              const botResponse: Message = {
                role: "assistant",
                content: `Your booking details: ${chatState.selectedMuseum?.name} on ${chatState.bookingDetails?.visitDate} for ${count} people. Total: $${totalAmount}. Would you like to confirm this booking?`
              };
              setMessages(prev => [...prev, botResponse]);
            }, 1000);
          }
        } else if (chatState.bookingStep === 'confirmBooking') {
          if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('confirm')) {
            // Process the booking
            setIsLoading(true);
            const booking = await createBooking();
            setIsLoading(false);
            
            if (booking) {
              setChatState(prev => ({
                ...prev,
                bookingDetails: {
                  ...prev.bookingDetails,
                  bookingId: booking.bookingId
                },
                bookingStep: 'bookingComplete'
              }));
              
              setTimeout(() => {
                const botResponse: Message = {
                  role: "assistant",
                  content: `Great! Your booking has been confirmed. Your booking ID is ${booking.bookingId}. I hope you enjoy your visit!`
                };
                setMessages(prev => [...prev, botResponse]);
              }, 1000);
            } else {
              setTimeout(() => {
                const botResponse: Message = {
                  role: "assistant",
                  content: "I'm sorry, there was an error processing your booking. Please try again later."
                };
                setMessages(prev => [...prev, botResponse]);
              }, 1000);
            }
          } else {
            // User declined the booking
            setChatState(prev => ({
              ...prev,
              bookingStep: null,
              step: 'conversation'
            }));
            
            setTimeout(() => {
              const botResponse: Message = {
                role: "assistant",
                content: "No problem! Is there anything else I can help you with regarding museums?"
              };
              setMessages(prev => [...prev, botResponse]);
            }, 1000);
          }
        }
        break;
        
      default:
        // For any other step, just use the backend API
        const defaultResponse = await sendMessageToBackend(userInput);
        
        const defaultMessage: Message = {
          role: "assistant",
          content: defaultResponse.response,
          codeSnippet: defaultResponse.codeSnippet
        };
        
        setMessages(prev => [...prev, defaultMessage]);
    }
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: "user",
      content: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Process the user input based on the current chat state
    await processUserInput(input);
  };
  // Helper function to render message content with code blocks
  const renderMessageContent = (message: Message) => {
    if (message.codeSnippet) {
      // If the message has a code snippet, split and render appropriately
      const parts = message.content.split('[CODE_BLOCK]');
      
      return (
        <>
          {parts[0] && <p className="text-sm mb-2">{parts[0]}</p>}
          
          <div className="bg-gray-800 rounded-lg p-3 text-gray-100 font-mono text-xs overflow-x-auto my-2">
            <pre>{message.codeSnippet}</pre>
          </div>
          
          {parts[1] && <p className="text-sm mt-2">{parts[1]}</p>}
        </>
      );
    }
    
    // Regular message without code
    return <p className="text-sm">{message.content}</p>;
  };
  return (
    <Card className="w-full shadow-md border border-gray-200 max-w-4xl mx-auto">
      <CardHeader className="bg-primary text-white p-4 flex flex-row items-center space-y-0 gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Avatar>
            <AvatarFallback className="bg-transparent text-white">MB</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <CardTitle>MuseBot</CardTitle>
          <CardDescription className="text-primary-foreground/80">Multilingual Museum Assistant</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          className="h-[60vh] overflow-y-auto p-4 space-y-4 custom-scrollbar"
          ref={chatContainerRef}
        >
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'space-x-2'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">MB</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )}
              
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-white ml-auto' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">MB</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="bg-gray-100 text-gray-800 max-w-[80%] rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-gray-50 border-t">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}