import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Eye,
  Download,
  Star,
  AlertCircle,
  RefreshCw,
  UserPlus,
  CreditCard
} from 'lucide-react';
import { useAdminDashboard, useAdminRecentActivity } from '@/hooks/useApi';

interface DashboardStats {
  users: {
    total: number;
    new: number;
    premium: number;
    growth: number;
  };
  prompts: {
    total: number;
    published: number;
    pending: number;
    new: number;
  };
  revenue: {
    total: number;
    previous: number;
    growth: number;
  };
  analytics: {
    totalViews: number;
    totalDownloads: number;
  };
}

const AdminDashboard = () => {
  // Use React Query hook for real-time data
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useAdminDashboard();

  // Get recent activity data
  const {
    data: recentActivityData,
    isLoading: isLoadingActivity
  } = useAdminRecentActivity(10);

  const stats = dashboardData?.data;
  const recentActivities = recentActivityData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load dashboard</h3>
          <p className="text-muted-foreground">
            {error?.message || 'Please try refreshing the page'}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Promptify platform
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${stats.users.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {stats.users.growth > 0 ? '+' : ''}{stats.users.growth}%
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prompts.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.prompts.pending} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {stats.revenue.growth > 0 ? '+' : ''}{stats.revenue.growth}%
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.premium.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.users.premium / stats.users.total) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingActivity ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {recentActivities.map((activity: any) => {
                      const getIcon = () => {
                        switch (activity.icon) {
                          case 'user-plus':
                            return <UserPlus className="h-4 w-4 text-blue-500" />;
                          case 'file-text':
                            return <FileText className="h-4 w-4 text-green-500" />;
                          case 'credit-card':
                            return <CreditCard className="h-4 w-4 text-purple-500" />;
                          default:
                            return <Eye className="h-4 w-4 text-gray-500" />;
                        }
                      };

                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {getIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {activity.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent activity found
                  </div>
                )}

                {/* Summary Stats */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span>Total Views</span>
                    </span>
                    <Badge variant="secondary">{stats.analytics.totalViews.toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <Download className="h-4 w-4 text-green-500" />
                      <span>Total Downloads</span>
                    </span>
                    <Badge variant="secondary">{stats.analytics.totalDownloads.toLocaleString()}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Review Pending Prompts ({stats.prompts.pending})
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Revenue Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user statistics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                User analytics component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Analytics</CardTitle>
              <CardDescription>Prompt performance and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Prompt analytics component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Financial performance and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Revenue analytics component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
