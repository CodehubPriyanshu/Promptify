import { useState } from "react"
import { Send, Bot, User, Save, History, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: number
  type: "user" | "ai"
  content: string
  timestamp: Date
}

const Playground = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "Welcome to the Promptify Playground! I'm your AI assistant ready to help you test and refine your prompts. What would you like to explore today?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Mock saved prompts
  const savedPrompts = [
    { id: 1, title: "Creative Writing Assistant", category: "Writing" },
    { id: 2, title: "Marketing Copy Generator", category: "Marketing" },
    { id: 3, title: "Language Learning Tutor", category: "Education" }
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        type: "ai",
        content: `Thank you for your message: "${inputMessage}". This is a simulated AI response to demonstrate the chat interface. In a real implementation, this would be connected to an actual AI service.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* User Plan Status */}
        <div className="p-4 border-b border-border">
          <Card className="bg-gradient-ai text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Free Plan</span>
              </div>
              <p className="text-sm opacity-90">
                5/10 playground sessions used this month
              </p>
              <Button variant="secondary" size="sm" className="mt-2 w-full text-primary">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Saved Prompts */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Saved Prompts</h3>
            <Button variant="ghost" size="icon">
              <Save className="w-4 h-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {savedPrompts.map((prompt) => (
                <Card key={prompt.id} className="p-3 cursor-pointer hover:bg-accent transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm line-clamp-1">{prompt.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {prompt.category}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Playground</h1>
              <p className="text-muted-foreground">Test and refine your prompts in real-time</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <History className="w-4 h-4" />
              </Button>
              <Button variant="outline">
                Clear Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gradient-ai text-white"
                  }`}>
                    {message.type === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-ai text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Type your message or prompt here..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-12 py-3 rounded-2xl resize-none min-h-[44px]"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                variant="ai"
                size="icon"
                className="h-11 w-11"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Playground