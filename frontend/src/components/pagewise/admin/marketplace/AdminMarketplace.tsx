import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAdminPrompts, useUpdatePromptStatus, useUpdatePromptDetails, useCreatePrompt, useDeleteAdminPrompt } from '@/hooks/useApi';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Plus,
  Download,
  Heart,
  DollarSign,
  Users,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  description: string;
  content?: string;
  author: {
    name: string;
    email: string;
  };
  category: string;
  type: 'free' | 'premium';
  price: number;
  status: 'draft' | 'published' | 'archived' | 'rejected';
  analytics: {
    views: number;
    downloads: number;
    likes: number;
    revenue: number;
  };
  createdAt: string;
  featured: boolean;
  trending: boolean;
}

const AdminMarketplace = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    type: 'free' as 'free' | 'premium',
    price: 0,
    status: 'draft' as 'draft' | 'published' | 'archived' | 'rejected',
    featured: false,
    trending: false
  });
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Build query parameters for API
  const queryParams = {
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    page: 1,
    limit: 50
  };

  // Use React Query for real-time data
  const {
    data: promptsData,
    isLoading,
    error,
    refetch
  } = useAdminPrompts(queryParams);

  const updatePromptStatusMutation = useUpdatePromptStatus();
  const updatePromptDetailsMutation = useUpdatePromptDetails();
  const createPromptMutation = useCreatePrompt();
  const deletePromptMutation = useDeleteAdminPrompt();

  const prompts = promptsData?.data?.prompts || [];
  const loading = isLoading;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading prompts...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Failed to load prompts</h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }



  const handleStatusUpdate = async (promptId: string, newStatus: string, notes?: string) => {
    try {
      await updatePromptStatusMutation.mutateAsync({
        promptId,
        status: newStatus,
        notes
      });
      toast({
        title: "Status Updated",
        description: `Prompt status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update prompt status:', error);
      toast({
        title: "Error",
        description: "Failed to update prompt status",
        variant: "destructive"
      });
    }
  };

  const handleFeatureToggle = async (promptId: string, currentFeatured: boolean) => {
    try {
      await updatePromptDetailsMutation.mutateAsync({
        promptId,
        updates: { featured: !currentFeatured }
      });
      toast({
        title: "Featured Status Updated",
        description: "Prompt featured status has been toggled",
      });
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive"
      });
    }
  };

  const handleTrendingToggle = async (promptId: string, currentTrending: boolean) => {
    try {
      await updatePromptDetailsMutation.mutateAsync({
        promptId,
        updates: { trending: !currentTrending }
      });
      toast({
        title: "Trending Status Updated",
        description: "Prompt trending status has been toggled",
      });
    } catch (error) {
      console.error('Failed to toggle trending status:', error);
      toast({
        title: "Error",
        description: "Failed to update trending status",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditForm({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content || prompt.description, // Fallback to description if content not available
      category: prompt.category,
      type: prompt.type,
      price: prompt.price,
      status: prompt.status,
      featured: prompt.featured,
      trending: prompt.trending
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setEditForm({
      title: '',
      description: '',
      content: '',
      category: '',
      type: 'free',
      price: 0,
      status: 'draft',
      featured: false,
      trending: false
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!editForm.title?.trim()) {
        toast({
          title: "Validation Error",
          description: "Title is required",
          variant: "destructive"
        });
        return;
      }

      if (!editForm.description?.trim()) {
        toast({
          title: "Validation Error",
          description: "Description is required",
          variant: "destructive"
        });
        return;
      }

      if (!editForm.category?.trim()) {
        toast({
          title: "Validation Error",
          description: "Category is required",
          variant: "destructive"
        });
        return;
      }

      if (!editForm.content?.trim()) {
        toast({
          title: "Validation Error",
          description: "Content is required (minimum 10 characters)",
          variant: "destructive"
        });
        return;
      }

      if (editForm.content.trim().length < 10) {
        toast({
          title: "Validation Error",
          description: "Content must be at least 10 characters long",
          variant: "destructive"
        });
        return;
      }

      // Validate category is in allowed list
      const allowedCategories = ['writing', 'development', 'marketing', 'education', 'business', 'analytics'];
      if (!allowedCategories.includes(editForm.category.toLowerCase())) {
        toast({
          title: "Validation Error",
          description: "Please select a valid category",
          variant: "destructive"
        });
        return;
      }

      // Map frontend form to backend schema
      const promptData = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        content: editForm.content.trim(),
        category: editForm.category.toLowerCase(),
        tags: [], // Empty array for now
        isPaid: editForm.type === 'premium',
        price: editForm.type === 'premium' ? editForm.price : 0,
        status: editForm.status || 'published',
        featured: editForm.featured || false,
        trending: editForm.trending || false
      };

      console.log('Sending prompt data:', JSON.stringify(promptData, null, 2));

      if (selectedPrompt) {
        // Update existing prompt
        await updatePromptDetailsMutation.mutateAsync({
          promptId: selectedPrompt.id,
          updates: {
            status: editForm.status,
            featured: editForm.featured,
            trending: editForm.trending
          }
        });
      } else {
        // Create new prompt
        await createPromptMutation.mutateAsync(promptData);
      }

      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      setSelectedPrompt(null);

      // Refetch data to get updated list
      refetch();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save prompt",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedPrompt) {
        await deletePromptMutation.mutateAsync(selectedPrompt.id);
        setIsDeleteDialogOpen(false);
        setSelectedPrompt(null);
        refetch();
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete prompt",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDeleteDialogOpen(true);
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prompt.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || prompt.category === categoryFilter;
    const matchesType = typeFilter === 'all' || prompt.type === typeFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: prompts.length,
    published: prompts.filter(p => p.status === 'published').length,
    pending: prompts.filter(p => p.status === 'draft').length,
    revenue: prompts.reduce((sum, p) => sum + p.analytics.revenue, 0),
    totalViews: prompts.reduce((sum, p) => sum + p.analytics.views, 0),
    totalDownloads: prompts.reduce((sum, p) => sum + p.analytics.downloads, 0)
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline',
      rejected: 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load prompts</h3>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'Please try refreshing the page'}
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Management</h1>
          <p className="text-muted-foreground">
            Manage prompts, reviews, and marketplace content
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.published} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From premium prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              Total downloads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>
            Filter and search through {prompts.length} prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts, authors, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prompts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prompts ({filteredPrompts.length})</CardTitle>
          <CardDescription>
            Manage and review marketplace prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Analytics</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{prompt.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {prompt.description.substring(0, 60)}...
                      </div>
                      <div className="flex gap-1">
                        {prompt.featured && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {prompt.trending && (
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prompt.author.name}</div>
                      <div className="text-sm text-muted-foreground">{prompt.author.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{prompt.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={prompt.type === 'premium' ? 'default' : 'secondary'}>
                        {prompt.type}
                      </Badge>
                      {prompt.type === 'premium' && (
                        <span className="text-sm font-medium">${prompt.price}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(prompt.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>{prompt.analytics.views} views</div>
                      <div>{prompt.analytics.downloads} downloads</div>
                      {prompt.type === 'premium' && (
                        <div className="font-medium">${prompt.analytics.revenue}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(prompt)}
                        title="Edit prompt"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeatureToggle(prompt.id, prompt.featured)}
                        title="Toggle featured"
                      >
                        <Star className={`h-4 w-4 ${prompt.featured ? 'fill-current text-yellow-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTrendingToggle(prompt.id, prompt.trending)}
                        title="Toggle trending"
                      >
                        <TrendingUp className={`h-4 w-4 ${prompt.trending ? 'text-green-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(prompt)}
                        title="Delete prompt"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen || isCreateDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditDialogOpen(false);
          setIsCreateDialogOpen(false);
          setSelectedPrompt(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            </DialogTitle>
            <DialogDescription>
              {selectedPrompt ? 'Update the prompt details below.' : 'Fill in the details to create a new prompt.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter prompt title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter prompt description"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter the actual prompt content (minimum 10 characters)"
                rows={5}
                required
              />
              <p className="text-xs text-muted-foreground">
                This is the actual prompt content that users will see and use.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="writing">Writing</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={editForm.type} onValueChange={(value: 'free' | 'premium') => setEditForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editForm.type === 'premium' && (
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={editForm.status} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={editForm.featured}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="trending"
                  checked={editForm.trending}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, trending: checked }))}
                />
                <Label htmlFor="trending">Trending</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setIsCreateDialogOpen(false);
              setSelectedPrompt(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedPrompt ? 'Update' : 'Create'} Prompt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPrompt?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMarketplace;
