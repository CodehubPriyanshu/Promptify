import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useModal } from "@/contexts/ModalContext"
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  Bot,
  Heart
} from "lucide-react"

const Footer = () => {
  const { openModal } = useModal()

  const footerLinks = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Marketplace", href: "/marketplace" },
      { name: "Playground", href: "/playground" }
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Contact Sales", action: () => openModal('contact') }
    ],
    legal: [
      { name: "Privacy Policy", action: () => openModal('privacy') },
      { name: "Terms of Service", action: () => openModal('terms') },
      { name: "Cookie Policy", action: () => openModal('privacy') }
    ],

  }

  const socialLinks = [
    { name: "GitHub", icon: <Github className="h-5 w-5" />, href: "#" },
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, href: "#" },
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "#" },
    { name: "Email", icon: <Mail className="h-5 w-5" />, href: "mailto:hello@promptify.com" }
  ]

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">Promptify</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Transform your ideas into powerful AI prompts. Create, test, and share 
              with our comprehensive platform designed for creators and professionals.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  asChild
                >
                  <a 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.href ? (
                    <Link 
                      to={link.href} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className="text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {link.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={link.action}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>


        </div>



        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>
                © {new Date().getFullYear()} Promptify. All rights reserved.
              </p>
              <p className="flex items-center justify-center md:justify-start mt-1">
                Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by Priyanshu Kumar
              </p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>🌍 English</span>
              <span>💰 USD</span>
              <span>🔒 Secure</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
