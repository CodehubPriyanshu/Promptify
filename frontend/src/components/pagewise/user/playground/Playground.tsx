import { useState, useEffect } from "react"
import { Send, Bot, User, Save, History, Crown, AlertCircle, Zap, Brain, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useSendPlaygroundMessage, usePlaygroundSessions } from "@/hooks/useApi"

type AIModel = 'claude' | 'chatgpt' | 'perplexity'

interface AIModelConfig {
  id: AIModel
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

interface Message {
  id: number
  type: "user" | "ai"
  content: string
  timestamp: Date
}

const Playground = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude')

  const sendMessageMutation = useSendPlaygroundMessage()
  const { data: sessionsData } = usePlaygroundSessions()

  // AI Model configurations
  const aiModels: AIModelConfig[] = [
    {
      id: 'claude',
      name: 'Claude',
      description: 'Best for coding and technical tasks',
      icon: <Bot className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      description: 'Great for general conversations',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Perfect for research and analysis',
      icon: <Search className="w-5 h-5" />,
      color: 'bg-blue-500'
    }
  ]

  // Check if user can use playground
  const canUsePlayground = () => {
    if (!user) return false
    if (user.subscription.status === 'active' && user.subscription.plan !== 'Free') {
      return true // Premium users have unlimited access
    }
    return user.usage.playgroundSessions.current < user.usage.playgroundSessions.limit
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Check usage limits
    if (!canUsePlayground()) {
      setError('You have reached your playground session limit. Please upgrade your plan to continue.')
      return
    }

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputMessage
    setInputMessage("")
    setError(null)

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: messageToSend,
        sessionId: currentSessionId || undefined,
        model: selectedModel
      })

      if (response.success && response.data) {
        const aiMessage: Message = {
          id: messages.length + 2,
          type: "ai",
          content: response.data.response || response.data.message || "I received your message but couldn't generate a response.",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])

        // Update session ID if this is a new session
        if (response.data.sessionId && !currentSessionId) {
          setCurrentSessionId(response.data.sessionId)
        }
      } else {
        throw new Error(response.error || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message')

      // Add error message to chat
      const errorMessage: Message = {
        id: messages.length + 2,
        type: "ai",
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
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
          <Card className={`text-white border-0 ${
            user?.subscription.plan === 'Free' ? 'bg-gradient-ai' :
            user?.subscription.plan === 'Pro' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
            'bg-gradient-to-r from-yellow-500 to-orange-500'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">{user?.subscription.plan || 'Free'} Plan</span>
              </div>
              <p className="text-sm opacity-90">
                {user?.usage.playgroundSessions.current || 0}/{user?.usage.playgroundSessions.limit || 10} playground sessions used this month
              </p>
              {user?.subscription.plan === 'Free' && (
                <Button variant="secondary" size="sm" className="mt-2 w-full text-primary">
                  Upgrade Plan
                </Button>
              )}
              {!canUsePlayground() && (
                <p className="text-xs mt-2 opacity-75">
                  Limit reached. Upgrade to continue.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Model Selector */}
        <div className="flex-1 p-4">
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">AI Model</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your AI assistant for this conversation
            </p>
          </div>

          <div className="space-y-3">
            {aiModels.map((model) => (
              <Card
                key={model.id}
                className={`p-3 cursor-pointer transition-all duration-200 border-2 ${
                  selectedModel === model.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg text-white ${model.color}`}>
                    {model.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{model.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {model.description}
                    </p>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Session History */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Recent Sessions</h3>
              <Button variant="ghost" size="icon">
                <History className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              No recent sessions
            </div>
          </div>
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
            {sendMessageMutation.isPending && (
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
            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Type your message or prompt here..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-12 py-3 rounded-2xl resize-none min-h-[44px]"
                  disabled={sendMessageMutation.isPending || !canUsePlayground()}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending || !canUsePlayground()}
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