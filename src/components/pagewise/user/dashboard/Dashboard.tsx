import { useState } from "react"
import { Plus, Upload, BarChart3, Eye, Heart, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Dashboard = () => {
  const [promptForm, setPromptForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    tags: "",
    isPaid: false,
    price: ""
  })

  // Mock data for analytics
  const analytics = {
    totalViews: 12450,
    totalLikes: 892,
    totalRevenue: 2340,
    growthRate: 15.3
  }

  const myPrompts = [
    {
      id: 1,
      title: "Creative Writing Assistant",
      category: "Writing",
      status: "Published",
      views: 2340,
      likes: 156,
      revenue: 0,
      isPaid: false
    },
    {
      id: 2,
      title: "Code Review Expert",
      category: "Development", 
      status: "Published",
      views: 1890,
      likes: 234,
      revenue: 145.50,
      isPaid: true
    },
    {
      id: 3,
      title: "Marketing Copy Generator",
      category: "Marketing",
      status: "Draft",
      views: 0,
      likes: 0,
      revenue: 0,
      isPaid: false
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Prompt submission:", promptForm)
    // Reset form
    setPromptForm({
      title: "",
      description: "",
      content: "",
      category: "",
      tags: "",
      isPaid: false,
      price: ""
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your prompts, track performance, and grow your audience
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">Upload Prompt</TabsTrigger>
          <TabsTrigger value="prompts">My Prompts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +{analytics.growthRate}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalLikes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across all your prompts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  From paid prompts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myPrompts.filter(p => p.status === "Published").length}</div>
                <p className="text-xs text-muted-foreground">
                  Active prompts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest prompt performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myPrompts.slice(0, 3).map((prompt) => (
                  <div key={prompt.id} className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                      <h4 className="font-medium">{prompt.title}</h4>
                      <p className="text-sm text-muted-foreground">{prompt.category}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {prompt.views}
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {prompt.likes}
                      </div>
                      <Badge variant={prompt.status === "Published" ? "default" : "secondary"}>
                        {prompt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Prompt Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload New Prompt
              </CardTitle>
              <CardDescription>
                Create and publish a new prompt for the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Prompt Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter a catchy title"
                      value={promptForm.title}
                      onChange={(e) => setPromptForm({...promptForm, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={promptForm.category} onValueChange={(value) => setPromptForm({...promptForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your prompt does and how it helps users"
                    value={promptForm.description}
                    onChange={(e) => setPromptForm({...promptForm, description: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Prompt Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your prompt content here..."
                    value={promptForm.content}
                    onChange={(e) => setPromptForm({...promptForm, content: e.target.value})}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas (e.g., creative, writing, storytelling)"
                    value={promptForm.tags}
                    onChange={(e) => setPromptForm({...promptForm, tags: e.target.value})}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPaid"
                      checked={promptForm.isPaid}
                      onCheckedChange={(checked) => setPromptForm({...promptForm, isPaid: checked})}
                    />
                    <Label htmlFor="isPaid">Paid Prompt</Label>
                  </div>

                  {promptForm.isPaid && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={promptForm.price}
                        onChange={(e) => setPromptForm({...promptForm, price: e.target.value})}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" variant="ai" className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Publish Prompt
                  </Button>
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Prompts Tab */}
        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>My Prompts</CardTitle>
              <CardDescription>Manage all your created prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myPrompts.map((prompt) => (
                  <div key={prompt.id} className="p-6 border rounded-xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{prompt.title}</h3>
                        <p className="text-muted-foreground">{prompt.category}</p>
                      </div>
                      <Badge variant={prompt.status === "Published" ? "default" : "secondary"}>
                        {prompt.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-semibold">{prompt.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Likes</p>
                        <p className="font-semibold">{prompt.likes}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-semibold">${prompt.revenue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-semibold">{prompt.isPaid ? "Paid" : "Free"}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Analytics</Button>
                      <Button variant="outline" size="sm">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your prompts' performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Impressions</span>
                    <span className="font-semibold">45,231</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Click-through Rate</span>
                    <span className="font-semibold">12.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conversion Rate</span>
                    <span className="font-semibold">3.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Rating</span>
                    <span className="font-semibold">4.7/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Track your earnings and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-semibold">$456.78</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Month</span>
                    <span className="font-semibold">$321.45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Growth</span>
                    <span className="font-semibold text-green-600">+42.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Earnings</span>
                    <span className="font-semibold">${analytics.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard