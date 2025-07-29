import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, Zap, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import heroImage from "@/assets/hero-image.jpg"

const Index = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Prompts",
      description: "Create intelligent prompts with our AI-assisted tools"
    },
    {
      icon: Zap,
      title: "Interactive Playground",
      description: "Test and refine your prompts in real-time"
    },
    {
      icon: Users,
      title: "Community Marketplace",
      description: "Share and discover prompts from creators worldwide"
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "Access curated, high-quality prompts for every need"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90"></div>
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Prompt Creation Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              Create Amazing
              <span className="bg-gradient-ai bg-clip-text text-transparent block">
                AI Prompts
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in">
              Discover, create, and share intelligent prompts that unlock the full potential of AI. 
              Join thousands of creators building the future of AI interaction.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth/login">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <Button variant="outline" size="xl" asChild>
                <Link to="/marketplace">
                  Browse Prompts
                </Link>
              </Button>
            </div>
            
            {/* Additional Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm animate-fade-in">
              <Link 
                to="/auth/signup" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Don't have an account? Sign up
              </Link>
              <span className="hidden sm:block text-muted-foreground">•</span>
              <Button variant="link" className="text-primary font-semibold" asChild>
                <Link to="/pricing">
                  Premium Prompts
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Promptify?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, test, and share exceptional AI prompts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-card hover:shadow-ai transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-ai text-white mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your AI Experience?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the community of creators building the future of AI interaction
          </p>
          <Button variant="ai" size="xl" asChild>
            <Link to="/auth/signup">
              Start Creating Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
