import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/common/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/common/layout";
import AdminLayout from "@/common/admin/AdminLayout";
import Home from "./components/pagewise/main/home/Home";
import Features from "./components/pagewise/main/features/Features";
import About from "./components/pagewise/main/about/About";
import PricingPage from "./components/pagewise/main/pricing/Pricing";
import Login from "./components/pagewise/auth/user/login/Login";
import Signup from "./components/pagewise/auth/user/signup/Signup";
import ForgotPassword from "./components/pagewise/auth/user/forgot-password/ForgotPassword";
import ResetPassword from "./components/pagewise/auth/user/reset-password/ResetPassword";
import Marketplace from "./components/pagewise/user/marketplaces/Marketplace";
import Playground from "./components/pagewise/user/playground/Playground";
import Dashboard from "./components/pagewise/user/dashboard/Dashboard";
import Pricing from "./components/pagewise/user/pricing/Pricing";
import AdminLogin from "./components/pagewise/auth/admin/login/AdminLogin";
import AdminDashboard from "./components/pagewise/admin/dashboard/AdminDashboard";
import AdminMarketplace from "./components/pagewise/admin/marketplace/AdminMarketplace";
import AdminUsers from "./components/pagewise/admin/users/AdminUsers";
import AdminPlans from "./components/pagewise/admin/plans/AdminPlans";
import AdminSettings from "./components/pagewise/admin/settings/AdminSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/pagewise/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (except 429)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <Routes>
            {/* Main Application Routes (Public + Authenticated) */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/features" element={<Layout><Features /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />

            {/* Authentication Routes */}
            <Route path="/auth/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
            <Route path="/auth/signup" element={<ProtectedRoute requireAuth={false}><Signup /></ProtectedRoute>} />
            <Route path="/auth/forgot-password" element={<ProtectedRoute requireAuth={false}><ForgotPassword /></ProtectedRoute>} />
            <Route path="/auth/reset-password/:token" element={<ProtectedRoute requireAuth={false}><ResetPassword /></ProtectedRoute>} />

            {/* Authenticated User Routes */}
            <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
            <Route path="/playground" element={<ProtectedRoute><Layout><Playground /></Layout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

            {/* Legacy route for backward compatibility */}
            <Route path="/user/pricing" element={<Layout><Pricing /></Layout>} />

            {/* Admin Routes - Flexible navigation */}
            <Route path="/admin/login" element={<ProtectedRoute requireAuth={false}><AdminLogin /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/marketplace" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminMarketplace /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/plans" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminPlans /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
