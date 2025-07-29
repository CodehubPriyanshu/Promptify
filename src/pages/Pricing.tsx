import { Check, Crown, Zap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with AI prompts",
      icon: Zap,
      features: [
        "Access to 100+ free prompts",
        "10 playground sessions per month",
        "Basic prompt creation tools",
        "Community support",
        "Standard response time"
      ],
      limitations: [
        "Limited premium prompts",
        "Basic analytics",
        "Standard support"
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Premium",
      price: "$19",
      period: "per month",
      description: "Unlock your creative potential with advanced features",
      icon: Crown,
      features: [
        "Access to ALL prompts (1000+)",
        "Unlimited playground sessions",
        "Advanced prompt creation tools",
        "Detailed analytics & insights",
        "Priority support",
        "Custom prompt categories",
        "Export & import prompts",
        "Team collaboration (up to 3 members)"
      ],
      limitations: [],
      buttonText: "Start Free Trial",
      buttonVariant: "ai" as const,
      popular: true
    },
    {
      name: "Business",
      price: "$99",
      period: "per month",
      description: "Scale your AI operations with enterprise features",
      icon: Users,
      features: [
        "Everything in Premium",
        "Unlimited team members",
        "Advanced team analytics",
        "Custom integrations & API access",
        "Dedicated account manager",
        "Priority prompt review",
        "White-label options",
        "Advanced security & compliance",
        "Custom training sessions"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ]

  return (
    <div className="min-h-screen py-20">
      {/* Header */}
      <div className="container mx-auto px-4 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Choose Your
          <span className="bg-gradient-ai bg-clip-text text-transparent block">
            Perfect Plan
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Unlock the full potential of AI with our flexible pricing plans designed for creators, teams, and businesses
        </p>
        
        {/* Plan Toggle (Optional) */}
        <div className="inline-flex items-center p-1 bg-muted rounded-2xl">
          <button className="px-6 py-2 rounded-xl bg-background shadow-sm font-medium text-sm">
            Monthly
          </button>
          <button className="px-6 py-2 rounded-xl font-medium text-sm text-muted-foreground">
            Annual
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative shadow-card hover:shadow-ai transition-all duration-300 hover:-translate-y-1 border-0 ${
                plan.popular ? 'ring-2 ring-primary shadow-ai' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-ai text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-ai text-white mb-4 mx-auto">
                  <plan.icon className="w-6 h-6" />
                </div>
                
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* CTA Button */}
                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full" 
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions? We've got answers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What's included in the free trial?</h3>
              <p className="text-muted-foreground text-sm">
                The free trial gives you full access to Premium features for 14 days, no credit card required.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, we offer a 30-day money-back guarantee for all paid plans.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How does team collaboration work?</h3>
              <p className="text-muted-foreground text-sm">
                Team members can share prompts, collaborate in real-time, and access shared analytics dashboards.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Is there an API available?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, Business plan includes full API access to integrate Promptify with your existing workflows.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Absolutely. You can cancel your subscription at any time with no penalties or fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 mt-20 text-center">
        <Card className="bg-gradient-ai text-white border-0 shadow-glow">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already building amazing AI experiences with Promptify
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="text-primary">
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Pricing