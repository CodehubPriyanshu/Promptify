import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Store,
  Users,
  FileText,
  DollarSign,
  Settings,
  Menu,
  LogOut,
  TrendingUp,
  Home,
  ExternalLink,
  Search,
  User,
  ChevronDown
} from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/admin/dashboard'
    },
    {
      name: 'Marketplace',
      href: '/admin/marketplace',
      icon: Store,
      current: location.pathname === '/admin/marketplace'
    },
    {
      name: 'Plans',
      href: '/admin/plans',
      icon: DollarSign,
      current: location.pathname === '/admin/plans'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Prompts',
      href: '/admin/prompts',
      icon: FileText,
      current: location.pathname === '/admin/prompts',
      badge: '5' // Pending reviews
    },
    {
      name: 'Revenue',
      href: '/admin/revenue',
      icon: TrendingUp,
      current: location.pathname === '/admin/revenue'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname === '/admin/settings'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Smart search redirection based on query
    const query = searchQuery.toLowerCase().trim();

    // Check for specific keywords and redirect accordingly
    if (query.includes('user') || query.includes('member') || query.includes('customer')) {
      navigate('/admin/users');
    } else if (query.includes('prompt') || query.includes('marketplace') || query.includes('template')) {
      navigate('/admin/marketplace');
    } else if (query.includes('plan') || query.includes('subscription') || query.includes('pricing')) {
      navigate('/admin/plans');
    } else if (query.includes('dashboard') || query.includes('analytics') || query.includes('stats')) {
      navigate('/admin/dashboard');
    } else if (query.includes('setting') || query.includes('config') || query.includes('preference')) {
      navigate('/admin/settings');
    } else {
      // Default to marketplace search with query parameter
      navigate(`/admin/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }

    setSearchQuery('');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <div>
            <div className="font-semibold">Promptify</div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${item.current
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Admin User</div>
            <div className="text-xs text-muted-foreground">admin@promptify.com</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center border-b bg-background px-6 gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users, prompts, plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </form>
          </div>

          <div className="flex-1" />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">{user?.name || 'Admin User'}</div>
                  <div className="text-xs text-muted-foreground">{user?.email || 'admin@promptify.com'}</div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
