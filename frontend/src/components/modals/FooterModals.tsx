import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useModal } from "@/contexts/ModalContext"
import { useState } from "react"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle,
  Star,
  Users,
  Zap,
  Shield
} from "lucide-react"

const FooterModals = () => {
  const { isOpen, modalType, closeModal } = useModal()
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setContactForm({ name: '', email: '', company: '', message: '' })
      closeModal()
    }, 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      {/* Contact Sales Modal */}
      <Dialog open={isOpen && modalType === 'contact'} onOpenChange={closeModal}>
        <DialogContent className="w-[90vw] max-w-[80vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Contact Sales</DialogTitle>
            <DialogDescription>
              Get in touch with our sales team to discuss enterprise solutions and custom pricing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Get in Touch</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">sales@promptify.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="font-medium mb-2">Enterprise Features</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Custom integrations
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Dedicated support
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    SLA guarantees
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Volume discounts
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">
                    Thank you for your interest. Our sales team will contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={contactForm.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us about your requirements..."
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={isOpen && modalType === 'privacy'} onOpenChange={closeModal}>
        <DialogContent className="w-[90vw] max-w-[80vw] sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Privacy Policy</DialogTitle>
            <DialogDescription>
              Last updated: {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-lg mb-2">1. Information We Collect</h3>
              <p className="text-muted-foreground mb-2">
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Account information (name, email, password)</li>
                <li>Usage data and analytics</li>
                <li>Payment information (processed securely by Razorpay)</li>
                <li>Communications with our support team</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">2. How We Use Your Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide and improve our services</li>
                <li>Process payments and transactions</li>
                <li>Send important updates and notifications</li>
                <li>Provide customer support</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">3. Information Sharing</h3>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                except as described in this policy. We may share information with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Service providers who assist in our operations</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your explicit consent</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">4. Data Security</h3>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">5. Your Rights</h3>
              <p className="text-muted-foreground">
                You have the right to access, update, or delete your personal information. 
                Contact us at privacy@promptify.com for any privacy-related requests.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog open={isOpen && modalType === 'terms'} onOpenChange={closeModal}>
        <DialogContent className="w-[90vw] max-w-[80vw] sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Terms of Service</DialogTitle>
            <DialogDescription>
              Last updated: {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing and using Promptify, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">2. Use License</h3>
              <p className="text-muted-foreground mb-2">
                Permission is granted to temporarily use Promptify for personal and commercial purposes. 
                This license shall automatically terminate if you violate any of these restrictions.
              </p>
              <p className="text-muted-foreground">You may not:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for commercial purposes without permission</li>
                <li>Attempt to reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">3. User Accounts</h3>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account and password. 
                You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">4. Payment Terms</h3>
              <p className="text-muted-foreground">
                Subscription fees are billed in advance on a monthly or annual basis. 
                All payments are processed securely through Razorpay.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">5. Limitation of Liability</h3>
              <p className="text-muted-foreground">
                In no event shall Promptify be liable for any damages arising out of the use or 
                inability to use the service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">6. Contact Information</h3>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at 
                legal@promptify.com.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={isOpen && modalType === 'support'} onOpenChange={closeModal}>
        <DialogContent className="w-[90vw] max-w-[80vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Support Center</DialogTitle>
            <DialogDescription>
              Get help with Promptify and find answers to common questions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50">
                <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-xs text-muted-foreground">Support</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <Zap className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">&lt;2h</div>
                <div className="text-xs text-muted-foreground">Response</div>
              </div>
            </div>

            {/* Support Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">📚 Documentation</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive guides and tutorials to help you get started.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Docs
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">💬 Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Chat with our support team for immediate assistance.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Start Chat
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">📧 Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Send us a detailed message and we'll get back to you.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Send Email
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">🎥 Video Tutorials</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Watch step-by-step video guides for common tasks.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Watch Videos
                </Button>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">How do I upgrade my plan?</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-3 text-sm text-muted-foreground">
                    You can upgrade your plan anytime from the Pricing page or your Dashboard. 
                    Changes take effect immediately.
                  </div>
                </details>
                
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Can I cancel my subscription?</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-3 text-sm text-muted-foreground">
                    Yes, you can cancel your subscription anytime from your account settings. 
                    You'll continue to have access until the end of your billing period.
                  </div>
                </details>
                
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">How does the AI playground work?</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-3 text-sm text-muted-foreground">
                    The playground allows you to test prompts with our AI models in real-time. 
                    Simply enter your prompt and get instant responses to refine your approach.
                  </div>
                </details>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FooterModals
