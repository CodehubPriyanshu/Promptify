import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  Crown,
  Star,
  Zap,
  Shield
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limitations: string[];
  maxUsers: number;
  maxProjects: number;
  maxStorage: number; // in GB
  priority: number; // for ordering
  isActive: boolean;
  isPopular: boolean;
  createdAt: string;
  subscribers: number;
  revenue: number;
}

const AdminPlans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [] as string[],
    limitations: [] as string[],
    maxUsers: 1,
    maxProjects: 10,
    maxStorage: 5,
    priority: 1,
    isActive: true,
    isPopular: false
  });
  const [newFeature, setNewFeature] = useState('');
  const [newLimitation, setNewLimitation] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockPlans: Plan[] = [
        {
          id: '1',
          name: 'Free',
          description: 'Perfect for getting started',
          monthlyPrice: 0,
          annualPrice: 0,
          features: [
            '10 playground sessions per month',
            'Access to free prompts',
            'Basic analytics',
            'Community support'
          ],
          limitations: [
            'Limited AI interactions',
            'No premium prompts',
            'Basic features only'
          ],
          maxUsers: 1,
          maxProjects: 3,
          maxStorage: 1,
          priority: 1,
          isActive: true,
          isPopular: false,
          createdAt: '2024-01-01',
          subscribers: 8500,
          revenue: 0
        },
        {
          id: '2',
          name: 'Pro',
          description: 'For serious creators and professionals',
          monthlyPrice: 29,
          annualPrice: 290,
          features: [
            'Unlimited playground sessions',
            'Access to all premium prompts',
            'Advanced analytics & insights',
            'Priority support',
            'Faster response times',
            'Custom prompt templates',
            'Export capabilities'
          ],
          limitations: [],
          maxUsers: 1,
          maxProjects: 50,
          maxStorage: 10,
          priority: 2,
          isActive: true,
          isPopular: true,
          createdAt: '2024-01-01',
          subscribers: 1200,
          revenue: 34800
        },
        {
          id: '3',
          name: 'Enterprise',
          description: 'For teams and organizations',
          monthlyPrice: 99,
          annualPrice: 990,
          features: [
            'Everything in Pro',
            'Team collaboration tools',
            'Advanced admin controls',
            'Custom integrations',
            'Dedicated account manager',
            'SLA guarantee',
            'Custom training',
            'White-label options'
          ],
          limitations: [],
          maxUsers: 50,
          maxProjects: 500,
          maxStorage: 100,
          priority: 3,
          isActive: true,
          isPopular: false,
          createdAt: '2024-01-01',
          subscribers: 85,
          revenue: 8415
        }
      ];

      setPlans(mockPlans);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setEditForm({
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      features: [...plan.features],
      limitations: [...plan.limitations],
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      maxStorage: plan.maxStorage,
      priority: plan.priority,
      isActive: plan.isActive,
      isPopular: plan.isPopular
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setEditForm({
      name: '',
      description: '',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [],
      limitations: [],
      maxUsers: 1,
      maxProjects: 10,
      maxStorage: 5,
      priority: 1,
      isActive: true,
      isPopular: false
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedPlan) {
        // Update existing plan
        setPlans(prev => prev.map(plan => 
          plan.id === selectedPlan.id 
            ? { ...plan, ...editForm }
            : plan
        ));
        toast({
          title: "Plan Updated",
          description: "Plan has been successfully updated",
        });
      } else {
        // Create new plan
        const newPlan: Plan = {
          id: Date.now().toString(),
          ...editForm,
          createdAt: new Date().toISOString().split('T')[0],
          subscribers: 0,
          revenue: 0
        };
        setPlans(prev => [...prev, newPlan]);
        toast({
          title: "Plan Created",
          description: "New plan has been successfully created",
        });
      }
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Failed to save plan:', error);
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedPlan) {
        setPlans(prev => prev.filter(plan => plan.id !== selectedPlan.id));
        toast({
          title: "Plan Deleted",
          description: "Plan has been successfully deleted",
        });
        setIsDeleteDialogOpen(false);
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setEditForm(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addLimitation = () => {
    if (newLimitation.trim()) {
      setEditForm(prev => ({
        ...prev,
        limitations: [...prev.limitations, newLimitation.trim()]
      }));
      setNewLimitation('');
    }
  };

  const removeLimitation = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      limitations: prev.limitations.filter((_, i) => i !== index)
    }));
  };

  // Calculate statistics
  const stats = {
    totalPlans: plans.length,
    activePlans: plans.filter(p => p.isActive).length,
    totalSubscribers: plans.reduce((sum, p) => sum + p.subscribers, 0),
    totalRevenue: plans.reduce((sum, p) => sum + p.revenue, 0)
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Star className="h-5 w-5" />;
      case 'pro':
        return <Zap className="h-5 w-5" />;
      case 'enterprise':
        return <Crown className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
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
          <h1 className="text-3xl font-bold">Plans Management</h1>
          <p className="text-muted-foreground">
            Manage subscription plans, pricing, and features
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePlans} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all plans
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From paid plans
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.2%</div>
            <p className="text-xs text-muted-foreground">
              Free to paid conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            Manage your subscription plans and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.sort((a, b) => a.priority - b.priority).map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getPlanIcon(plan.name)}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {plan.name}
                          {plan.isPopular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {plan.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        ${plan.monthlyPrice}/month
                      </div>
                      {plan.annualPrice > 0 && (
                        <div className="text-sm text-muted-foreground">
                          ${plan.annualPrice}/year
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>{plan.maxUsers} user{plan.maxUsers > 1 ? 's' : ''}</div>
                      <div>{plan.maxProjects} projects</div>
                      <div>{plan.maxStorage}GB storage</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {plan.subscribers.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${plan.revenue.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        title="Edit plan"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(plan)}
                        title="Delete plan"
                        disabled={plan.subscribers > 0}
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
          setSelectedPlan(null);
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan ? 'Update the plan details below.' : 'Fill in the details to create a new plan.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter plan name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  value={editForm.priority}
                  onChange={(e) => setEditForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter plan description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.monthlyPrice}
                  onChange={(e) => setEditForm(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="annualPrice">Annual Price ($)</Label>
                <Input
                  id="annualPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.annualPrice}
                  onChange={(e) => setEditForm(prev => ({ ...prev, annualPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="1"
                  value={editForm.maxUsers}
                  onChange={(e) => setEditForm(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxProjects">Max Projects</Label>
                <Input
                  id="maxProjects"
                  type="number"
                  min="1"
                  value={editForm.maxProjects}
                  onChange={(e) => setEditForm(prev => ({ ...prev, maxProjects: parseInt(e.target.value) || 1 }))}
                  placeholder="10"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxStorage">Storage (GB)</Label>
                <Input
                  id="maxStorage"
                  type="number"
                  min="1"
                  value={editForm.maxStorage}
                  onChange={(e) => setEditForm(prev => ({ ...prev, maxStorage: parseInt(e.target.value) || 1 }))}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPopular"
                  checked={editForm.isPopular}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isPopular: checked }))}
                />
                <Label htmlFor="isPopular">Popular</Label>
              </div>
            </div>

            {/* Features */}
            <div className="grid gap-2">
              <Label>Features</Label>
              <div className="space-y-2">
                {editForm.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={feature} readOnly className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add new feature"
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button onClick={addFeature} disabled={!newFeature.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Limitations */}
            <div className="grid gap-2">
              <Label>Limitations</Label>
              <div className="space-y-2">
                {editForm.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={limitation} readOnly className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLimitation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newLimitation}
                    onChange={(e) => setNewLimitation(e.target.value)}
                    placeholder="Add new limitation"
                    onKeyPress={(e) => e.key === 'Enter' && addLimitation()}
                  />
                  <Button onClick={addLimitation} disabled={!newLimitation.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setIsCreateDialogOpen(false);
              setSelectedPlan(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedPlan ? 'Update' : 'Create'} Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{selectedPlan?.name}" plan?
              {selectedPlan?.subscribers && selectedPlan.subscribers > 0
                ? " This plan has active subscribers and cannot be deleted."
                : " This action cannot be undone."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={selectedPlan?.subscribers && selectedPlan.subscribers > 0}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlans;
