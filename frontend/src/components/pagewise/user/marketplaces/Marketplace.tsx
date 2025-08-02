import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Lock, Play, Star, Tag, Loader2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMarketplacePrompts } from "@/hooks/useApi"
import { useToast } from "@/hooks/use-toast"
import marketplaceBg from "@/assets/marketplace-bg.jpg"

interface MarketplacePrompt {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  type: 'free' | 'premium';
  price: number;
  analytics: {
    views: number;
    downloads: number;
    likes: number;
    rating: {
      average: number;
      count: number;
    };
  };
  author: {
    name: string;
    _id: string;
  };
  metadata: {
    featured: boolean;
    trending: boolean;
  };
  createdAt: string;
}

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [type, setType] = useState("all")
  const [sort, setSort] = useState("latest")
  const { toast } = useToast()

  // Fetch real marketplace data with real-time updates
  const {
    data: marketplaceData,
    isLoading,
    error,
    refetch
  } = useMarketplacePrompts({
    search: searchQuery || undefined,
    category: category !== "all" ? category : undefined,
    type: type !== "all" ? type : undefined,
    sort,
    page: 1,
    limit: 50
  }, true) // Enable real-time polling

  const prompts: MarketplacePrompt[] = marketplaceData?.data?.prompts || []

  // Show error toast if API fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading prompts",
        description: "Failed to load marketplace prompts. Please try again.",
        variant: "destructive",
      })
    }
  }, [error, toast])

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

          {/* Filter Controls */}
          <div className="max-w-4xl mx-auto mt-8 flex flex-wrap gap-4 justify-center">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="downloads">Most Downloaded</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Prompts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2 text-lg">Loading prompts...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2 text-destructive">Failed to load prompts</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the marketplace prompts.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Prompts Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <Card key={prompt._id} className="shadow-card hover:shadow-ai transition-all duration-300 hover:-translate-y-1 border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="rounded-full">
                        <Tag className="w-3 h-3 mr-1" />
                        {prompt.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{prompt.analytics.rating.average.toFixed(1)}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {prompt.title}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      by {prompt.author.name}
                    </div>
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

                    {/* Featured/Trending Badges */}
                    <div className="flex gap-1">
                      {prompt.metadata.featured && (
                        <Badge variant="default" className="text-xs">
                          ⭐ Featured
                        </Badge>
                      )}
                      {prompt.metadata.trending && (
                        <Badge variant="default" className="text-xs">
                          🔥 Trending
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{prompt.analytics.downloads.toLocaleString()} downloads</span>
                      <span className="font-semibold text-lg text-primary">
                        {prompt.type === 'free' ? 'Free' : `$${prompt.price}`}
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {prompt.type === 'premium' ? (
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
          )}

          {!isLoading && !error && filteredPrompts.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms or browse all prompts' : 'No prompts available in the marketplace yet.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Marketplace