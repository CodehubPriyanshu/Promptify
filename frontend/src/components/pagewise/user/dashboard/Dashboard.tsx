import { useState } from "react"
import { Plus, Upload, BarChart3, Eye, Heart, DollarSign, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/AuthContext"
import { useDashboard, useUserPrompts, useUserAnalytics, useUpdatePrompt, useDeletePrompt } from "@/hooks/useApi"

const Dashboard = () => {
  const { user } = useAuth()
  const [promptForm, setPromptForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    tags: "",
    isPaid: false,
    price: ""
  })
  const [editingPrompt, setEditingPrompt] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch real data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboard()
  const { data: userPromptsData, isLoading: promptsLoading } = useUserPrompts(1, 10)
  const { data: analyticsData, isLoading: analyticsLoading } = useUserAnalytics('30d')

  // Mutations
  const updatePromptMutation = useUpdatePrompt()
  const deletePromptMutation = useDeletePrompt()

  // Use real data or fallback to mock data
  const analytics = dashboardData?.data?.analytics || {
    totalViews: 0,
    totalLikes: 0,
    totalRevenue: 0,
    growthRate: 0
  }

  const recentActivity = dashboardData?.data?.recentActivity || []

  const myPrompts = userPromptsData?.data?.prompts || [
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

  const handleEditPrompt = (prompt: any) => {
    setEditingPrompt(prompt)
    setPromptForm({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags?.join(', ') || '',
      isPaid: prompt.isPaid,
      price: prompt.price?.toString() || ''
    })
    setIsEditModalOpen(true)
  }

  const handleUpdatePrompt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPrompt) return

    updatePromptMutation.mutate({
      id: editingPrompt._id,
      data: {
        ...promptForm,
        tags: promptForm.tags
      }
    })
    setIsEditModalOpen(false)
    setEditingPrompt(null)
  }

  const handleDeletePrompt = (promptId: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      deletePromptMutation.mutate(promptId)
    }
  }

  // Show loading state
  if (dashboardLoading || analyticsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (dashboardError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Manage your prompts, track performance, and grow your audience
        </p>
        <div className="flex items-center space-x-2 mt-2">
          <Badge variant={user?.subscription.status === 'active' ? 'default' : 'secondary'}>
            {user?.subscription.plan} Plan
          </Badge>
          <Badge variant="outline">
            {user?.usage.playgroundSessions.current}/{user?.usage.playgroundSessions.limit} Sessions Used
          </Badge>
        </div>
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
              <CardDescription>Prompts you've tried in the playground</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-xl">
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Used {new Date(activity.usedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {activity.views}
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {activity.likes}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent playground activity</p>
                    <p className="text-sm">Try some prompts in the playground to see them here!</p>
                  </div>
                )}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPrompt(prompt)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePrompt(prompt._id || prompt.id)}
                        disabled={deletePromptMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {myPrompts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Analytics for your created prompts only</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Views</span>
                      <span className="font-semibold">{analytics.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Likes</span>
                      <span className="font-semibold">{analytics.totalLikes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Published Prompts</span>
                      <span className="font-semibold">{analytics.publishedPrompts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Growth Rate</span>
                      <span className="font-semibold text-green-600">+{analytics.growthRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Earnings from your prompts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Revenue</span>
                      <span className="font-semibold">${analytics.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Paid Prompts</span>
                      <span className="font-semibold">{myPrompts.filter(p => p.isPaid).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Free Prompts</span>
                      <span className="font-semibold">{myPrompts.filter(p => !p.isPaid).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Revenue</span>
                      <span className="font-semibold">
                        ${myPrompts.length > 0 ? (analytics.totalRevenue / myPrompts.length).toFixed(2) : '0.00'}
                      </span>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Analytics Available</CardTitle>
                <CardDescription>Create some prompts to see analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No prompts created yet</p>
                  <p>Upload your first prompt to start tracking analytics!</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Total Views</p>
                      <p className="font-semibold text-2xl">0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Total Likes</p>
                      <p className="font-semibold text-2xl">0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Total Revenue</p>
                      <p className="font-semibold text-2xl">$0.00</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Published Prompts</p>
                      <p className="font-semibold text-2xl">0</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Prompt Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Update your prompt details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePrompt} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Prompt Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter a catchy title"
                  value={promptForm.title}
                  onChange={(e) => setPromptForm({...promptForm, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
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
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe what your prompt does"
                value={promptForm.description}
                onChange={(e) => setPromptForm({...promptForm, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Prompt Content *</Label>
              <Textarea
                id="edit-content"
                placeholder="Enter your prompt here..."
                value={promptForm.content}
                onChange={(e) => setPromptForm({...promptForm, content: e.target.value})}
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                placeholder="Enter tags separated by commas"
                value={promptForm.tags}
                onChange={(e) => setPromptForm({...promptForm, tags: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isPaid"
                checked={promptForm.isPaid}
                onCheckedChange={(checked) => setPromptForm({...promptForm, isPaid: !!checked})}
              />
              <Label htmlFor="edit-isPaid">This is a paid prompt</Label>
            </div>

            {promptForm.isPaid && (
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={promptForm.price}
                  onChange={(e) => setPromptForm({...promptForm, price: e.target.value})}
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePromptMutation.isPending}>
                {updatePromptMutation.isPending ? 'Updating...' : 'Update Prompt'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Dashboard