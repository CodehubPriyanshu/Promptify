import { useState, useEffect } from "react"
import { ArrowRight, Play, Star, Users, Zap, Bot, Heart, Eye, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { useMarketplacePrompts } from "@/hooks/useApi"
import { showErrorToast } from "@/utils/errorHandler"
import { Link } from "react-router-dom"

const Home = () => {
  const { isAuthenticated } = useAuth()
  const { data: marketplaceData, isLoading, error } = useMarketplacePrompts({ page: 1, limit: 6 }) // Get first 6 prompts for preview
  
  const [typedText, setTypedText] = useState("")
  const fullText = "Transform your ideas into powerful AI prompts"
  
  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 100)
    
    return () => clearInterval(timer)
  }, [])

  const stats = [
    { label: "Active Users", value: "10,000+", icon: <Users className="h-5 w-5" /> },
    { label: "Prompts Created", value: "50,000+", icon: <Bot className="h-5 w-5" /> },
    { label: "Success Rate", value: "98%", icon: <Star className="h-5 w-5" /> },
    { label: "Response Time", value: "<2s", icon: <Zap className="h-5 w-5" /> }
  ]

  const features = [
    {
      title: "AI-Powered Playground",
      description: "Test and refine your prompts with real-time AI responses",
      icon: <Bot className="h-8 w-8" />
    },
    {
      title: "Community Marketplace",
      description: "Discover and share amazing prompts with the community",
      icon: <Users className="h-8 w-8" />
    },
    {
      title: "Advanced Analytics",
      description: "Track performance and optimize your prompt strategies",
      icon: <Zap className="h-8 w-8" />
    }
  ]

  // Handle error state
  useEffect(() => {
    if (error) {
      showErrorToast(error, 'Loading marketplace prompts');
    }
  }, [error]);

  const handleRetryMarketplace = () => {
    window.location.reload();
  };

  const marketplacePrompts = marketplaceData?.data?.prompts || [
    {
      id: 1,
      title: "Creative Writing Assistant",
      description: "Generate compelling stories and creative content with this versatile writing prompt.",
      category: "Writing",
      type: "free",
      likes: 156,
      views: 2340,
      author: "Sarah Johnson"
    },
    {
      id: 2,
      title: "Code Review Expert",
      description: "Get detailed code reviews and improvement suggestions for any programming language.",
      category: "Development",
      type: "premium",
      likes: 234,
      views: 1890,
      author: "Alex Chen"
    },
    {
      id: 3,
      title: "Marketing Copy Generator",
      description: "Create persuasive marketing copy that converts visitors into customers.",
      category: "Marketing",
      type: "free",
      likes: 189,
      views: 3210,
      author: "Emma Davis"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  ✨ Welcome to the Future of AI
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {typedText}
                  </span>
                  <span className="animate-pulse">|</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Create, test, and share powerful AI prompts with our intuitive platform. 
                  Join thousands of creators who are already transforming their AI interactions.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8" asChild>
                  <Link to={isAuthenticated ? "/playground" : "/auth/signup"}>
                    <Play className="mr-2 h-5 w-5" />
                    Start Creating
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                  <Link to="/features">
                    Learn More
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2 text-primary">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">User:</div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      Write a compelling product description for a smart home device
                    </div>
                    <div className="text-sm text-muted-foreground">AI Response:</div>
                    <div className="bg-primary/10 rounded-lg p-3 text-sm">
                      Transform your living space into a smart sanctuary with our revolutionary 
                      home automation hub. Experience seamless control, energy efficiency, 
                      and unparalleled convenience at your fingertips...
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and features you need 
              to create, test, and optimize your AI prompts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto p-4 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Discover Amazing Prompts
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our curated marketplace of high-quality prompts created by the community. 
              Find inspiration and accelerate your projects.
            </p>
          </div>
          
          {error && !isLoading && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Failed to load marketplace prompts. Showing sample data instead.</span>
                <Button variant="outline" size="sm" onClick={handleRetryMarketplace}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-5 w-16 bg-muted rounded"></div>
                      <div className="h-5 w-20 bg-muted rounded"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="flex space-x-4">
                        <div className="h-4 w-12 bg-muted rounded"></div>
                        <div className="h-4 w-12 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="h-10 w-full bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              marketplacePrompts.slice(0, 6).map((prompt) => (
              <Card key={prompt.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={prompt.type === 'premium' ? 'default' : 'secondary'}>
                      {prompt.type === 'premium' ? 'Premium' : 'Free'}
                    </Badge>
                    <Badge variant="outline">{prompt.category}</Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {prompt.title}
                  </CardTitle>
                  <CardDescription>{prompt.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>by {prompt.author}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {prompt.likes}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {prompt.views}
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={!isAuthenticated}
                    asChild={isAuthenticated}
                  >
                    {isAuthenticated ? (
                      <Link to="/playground">
                        Try on Playground
                      </Link>
                    ) : (
                      "Login to Try"
                    )}
                  </Button>
                </CardContent>
              </Card>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/marketplace">
                View All Prompts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to transform your AI workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators, developers, and businesses who are already 
            using Promptify to enhance their AI interactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to={isAuthenticated ? "/dashboard" : "/auth/signup"}>
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
