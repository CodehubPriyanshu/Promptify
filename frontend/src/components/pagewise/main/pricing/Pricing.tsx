import { useState } from "react"
import { Check, Star, Zap, Crown, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useSubscriptionPlans } from "@/hooks/useApi"

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Pricing = () => {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isAnnual, setIsAnnual] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Live plans from backend
  const { data: plansResp } = useSubscriptionPlans()
  const plans = (plansResp?.data?.plans || []).map((p: any) => ({
    id: p._id,
    name: p.name,
    description: p.description,
    monthlyPrice: p.price?.monthly ?? 0,
    annualPrice: p.price?.yearly ?? 0,
    icon: p.metadata?.icon === 'star' ? <Star className="h-6 w-6" /> : p.metadata?.icon === 'crown' ? <Crown className="h-6 w-6" /> : <Zap className="h-6 w-6" />,
    features: Array.isArray(p.features) ? p.features.filter((f: any) => f.included !== false).map((f: any) => f.name) : [],
    limitations: [],
    popular: p.metadata?.popular ?? false,
    current: user?.subscription?.planId === p._id || user?.plan === p._id,
  })) as Array<any>;

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive"
      })
      return
    }

    if (planId === 'free') {
      toast({
        title: "Already on Free Plan",
        description: "You're already using the free plan!",
      })
      return
    }

    setIsLoading(true)

    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) throw new Error('Plan not found')

      const amount = isAnnual ? plan.annualPrice : plan.monthlyPrice
      
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Create order on backend
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          planId,
          billing: isAnnual ? 'annual' : 'monthly',
          amount: amount * 100 // Convert to paise
        })
      })

      const orderData = await response.json()
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order')
      }

      // Check for Razorpay key
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast({
          title: "Configuration Error",
          description: "Payment system is not configured. Please contact support.",
          variant: "destructive"
        });
        return;
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: amount * 100,
        currency: 'INR',
        name: 'Promptify',
        description: `${plan.name} Plan - ${isAnnual ? 'Annual' : 'Monthly'}`,
        order_id: orderData.data.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
                billing: isAnnual ? 'annual' : 'monthly'
              })
            })

            const verifyData = await verifyResponse.json()
            
            if (verifyData.success) {
              toast({
                title: "Payment Successful!",
                description: `Welcome to ${plan.name} plan! Your subscription is now active.`,
              })
              
              // Refresh user data
              window.location.reload()
            } else {
              throw new Error(verifyData.message || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if the amount was deducted.",
              variant: "destructive"
            })
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      
    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            💎 Pricing Plans
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Start free and upgrade as you grow. All plans include our core features 
            with different usage limits and advanced capabilities.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <Label htmlFor="billing-toggle" className={!isAnnual ? "font-semibold" : ""}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle" className={isAnnual ? "font-semibold" : ""}>
              Annual
            </Label>
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : plan.current
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-4 right-4">
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className="mx-auto p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  {isAnnual && plan.monthlyPrice > 0 && (
                    <div className="text-sm text-muted-foreground">
                      ${plan.monthlyPrice}/month billed annually
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading || plan.current}
                >
                  {plan.current ? (
                    "Current Plan"
                  ) : plan.id === 'free' ? (
                    "Get Started Free"
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and digital wallets through Razorpay.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Our Free plan gives you access to core features. You can upgrade anytime to unlock premium features.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Pricing
