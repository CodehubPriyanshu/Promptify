import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
  Plus
} from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  description: string;
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
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Creative Writing Assistant',
          description: 'A comprehensive prompt for creative writing assistance',
          author: { name: 'John Doe', email: 'john@example.com' },
          category: 'writing',
          type: 'premium',
          price: 9.99,
          status: 'published',
          analytics: { views: 1250, downloads: 89, likes: 156, revenue: 890.11 },
          createdAt: '2024-01-15',
          featured: true,
          trending: false
        },
        {
          id: '2',
          title: 'Code Review Helper',
          description: 'AI prompt for comprehensive code reviews',
          author: { name: 'Jane Smith', email: 'jane@example.com' },
          category: 'development',
          type: 'free',
          price: 0,
          status: 'draft',
          analytics: { views: 45, downloads: 12, likes: 8, revenue: 0 },
          createdAt: '2024-01-20',
          featured: false,
          trending: true
        }
      ];

      setPrompts(mockPrompts);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (promptId: string, newStatus: string) => {
    try {
      // API call to update prompt status
      setPrompts(prev => prev.map(prompt => 
        prompt.id === promptId ? { ...prompt, status: newStatus as any } : prompt
      ));
    } catch (error) {
      console.error('Failed to update prompt status:', error);
    }
  };

  const handleFeatureToggle = async (promptId: string) => {
    try {
      setPrompts(prev => prev.map(prompt => 
        prompt.id === promptId ? { ...prompt, featured: !prompt.featured } : prompt
      ));
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
    }
  };

  const handleTrendingToggle = async (promptId: string) => {
    try {
      setPrompts(prev => prev.map(prompt => 
        prompt.id === promptId ? { ...prompt, trending: !prompt.trending } : prompt
      ));
    } catch (error) {
      console.error('Failed to toggle trending status:', error);
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prompt.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || prompt.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Management</h1>
          <p className="text-muted-foreground">
            Manage prompts, reviews, and marketplace content
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Prompt
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
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
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
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
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFeatureToggle(prompt.id)}
                      >
                        <Star className={`h-4 w-4 ${prompt.featured ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMarketplace;
