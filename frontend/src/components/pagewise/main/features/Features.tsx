import { 
  Bot, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Palette, 
  Code, 
  Globe,
  Star,
  CheckCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const Features = () => {
  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI-Powered Playground",
      description: "Test and refine your prompts with our advanced AI playground powered by CatGPT. Get instant feedback and optimize your prompts for better results.",
      category: "Core Feature",
      benefits: ["Real-time AI responses", "Session tracking", "Usage analytics"]
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Creative Prompt Library",
      description: "Access thousands of professionally crafted prompts for writing, coding, marketing, and more. Find inspiration and save time with proven templates.",
      category: "Content",
      benefits: ["Curated prompts", "Multiple categories", "Community contributions"]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Track your prompt performance, usage patterns, and optimization opportunities with detailed analytics and insights.",
      category: "Analytics",
      benefits: ["Performance metrics", "Usage tracking", "Optimization insights"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Marketplace",
      description: "Share your best prompts with the community and discover amazing prompts created by other users. Monetize your creativity.",
      category: "Community",
      benefits: ["Share prompts", "Discover content", "Monetization options"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Built with enterprise-grade security features including data encryption, secure authentication, and privacy protection.",
      category: "Security",
      benefits: ["Data encryption", "Secure auth", "Privacy protection"]
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Developer Tools",
      description: "Integrate with your workflow using our comprehensive API, webhooks, and developer-friendly tools for automation.",
      category: "Developer",
      benefits: ["REST API", "Webhooks", "SDK support"]
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Optimized for speed with instant responses, real-time updates, and a smooth user experience across all devices.",
      category: "Performance",
      benefits: ["Instant responses", "Real-time updates", "Mobile optimized"]
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Accessibility",
      description: "Available worldwide with multi-language support, responsive design, and accessibility features for all users.",
      category: "Accessibility",
      benefits: ["Multi-language", "Responsive design", "WCAG compliant"]
    }
  ]

  const stats = [
    { label: "Active Users", value: "10,000+", icon: <Users className="h-5 w-5" /> },
    { label: "Prompts Created", value: "50,000+", icon: <Bot className="h-5 w-5" /> },
    { label: "Success Rate", value: "98%", icon: <Star className="h-5 w-5" /> },
    { label: "Response Time", value: "<2s", icon: <Zap className="h-5 w-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            ✨ Powerful Features
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Everything You Need for AI Prompts
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Discover the comprehensive suite of tools and features that make Promptify 
            the ultimate platform for creating, testing, and sharing AI prompts.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
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
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {feature.icon}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your AI Workflow?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators, developers, and businesses who are already 
            using Promptify to enhance their AI interactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Features
