import { 
  Target, 
  Users, 
  Lightbulb, 
  Heart,
  Code,
  Brain,
  Rocket,
  Award,
  Github,
  Linkedin,
  Mail
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const About = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            👨‍💻 About the Creator
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            About the Creator
          </h1>
        </div>
      </section>

      {/* About the Creator - Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-8">
                <div className="flex-shrink-0">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src="/api/placeholder/128/128" alt="Priyanshu Kumar" />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                      PK
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center max-w-3xl">
                  <h2 className="text-3xl font-bold mb-4">About the Creator</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Hi, I'm <strong>Priyanshu Kumar</strong>, a passionate BCA graduate from ITM University.
                    I aspire to learn and innovate in the field of technology, particularly in Data Science
                    and modern web applications. This project is built as a demonstration of continuous
                    learning and creativity in full-stack development.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      BCA Graduate
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Data Science Enthusiast
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      ITM University
                    </Badge>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  )
}

export default About
