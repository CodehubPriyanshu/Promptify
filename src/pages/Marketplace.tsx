import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Lock, Play, Star, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import marketplaceBg from "@/assets/marketplace-bg.jpg"

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for prompts
  const prompts = [
    {
      id: 1,
      title: "Creative Writing Assistant",
      category: "Writing",
      description: "Generate compelling stories, characters, and plot ideas with this versatile writing prompt.",
      price: "Free",
      rating: 4.8,
      downloads: 1240,
      tags: ["creative", "writing", "storytelling"],
      isPaid: false
    },
    {
      id: 2,
      title: "Code Review Expert",
      category: "Development",
      description: "Comprehensive code analysis and improvement suggestions for any programming language.",
      price: "$4.99",
      rating: 4.9,
      downloads: 890,
      tags: ["code", "development", "review"],
      isPaid: true
    },
    {
      id: 3,
      title: "Marketing Copy Generator",
      category: "Marketing",
      description: "Create persuasive marketing copy that converts. Perfect for ads, emails, and social media.",
      price: "Free",
      rating: 4.7,
      downloads: 2105,
      tags: ["marketing", "copywriting", "conversion"],
      isPaid: false
    },
    {
      id: 4,
      title: "Data Analysis Assistant",
      category: "Analytics",
      description: "Analyze datasets and generate insights with statistical analysis and visualization suggestions.",
      price: "$7.99",
      rating: 4.9,
      downloads: 654,
      tags: ["data", "analytics", "insights"],
      isPaid: true
    },
    {
      id: 5,
      title: "Language Learning Tutor",
      category: "Education",
      description: "Interactive language learning with personalized exercises and conversation practice.",
      price: "Free",
      rating: 4.6,
      downloads: 1876,
      tags: ["education", "language", "learning"],
      isPaid: false
    },
    {
      id: 6,
      title: "Business Strategy Advisor",
      category: "Business",
      description: "Strategic planning and business analysis for startups and established companies.",
      price: "$12.99",
      rating: 5.0,
      downloads: 432,
      tags: ["business", "strategy", "planning"],
      isPaid: true
    }
  ]

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${marketplaceBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/95" />
        
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing
            <span className="bg-gradient-ai bg-clip-text text-transparent block">
              AI Prompts
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore thousands of high-quality prompts created by our community of AI experts
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search prompts by title, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg rounded-2xl shadow-ai"
            />
          </div>
        </div>
      </section>

      {/* Prompts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="shadow-card hover:shadow-ai transition-all duration-300 hover:-translate-y-1 border-0">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="rounded-full">
                      <Tag className="w-3 h-3 mr-1" />
                      {prompt.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{prompt.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {prompt.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-3">
                    {prompt.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{prompt.downloads.toLocaleString()} downloads</span>
                    <span className="font-semibold text-lg text-primary">
                      {prompt.price}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <div className="pt-2">
                    {prompt.isPaid ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Buy Prompt
                      </Button>
                    ) : (
                      <Button variant="ai" className="w-full" asChild>
                        <Link to="/playground">
                          <Play className="w-4 h-4 mr-2" />
                          Try in Playground
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredPrompts.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse all prompts
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Marketplace