import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/common/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/common/layout";
import AdminLayout from "@/common/admin/AdminLayout";
import Index from "./components/pagewise/user/index/Index";
import Login from "./components/pagewise/auth/user/login/Login";
import Signup from "./components/pagewise/auth/user/signup/Signup";
import Marketplace from "./components/pagewise/user/marketplaces/Marketplace";
import Playground from "./components/pagewise/user/playground/Playground";
import Dashboard from "./components/pagewise/user/dashboard/Dashboard";
import Pricing from "./components/pagewise/user/pricing/Pricing";
import AdminLogin from "./components/pagewise/auth/admin/login/AdminLogin";
import AdminDashboard from "./components/pagewise/admin/dashboard/AdminDashboard";
import AdminMarketplace from "./components/pagewise/admin/marketplace/AdminMarketplace";
import AdminUsers from "./components/pagewise/admin/users/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/pagewise/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/auth/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
            <Route path="/auth/signup" element={<ProtectedRoute requireAuth={false}><Signup /></ProtectedRoute>} />
            <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
            <Route path="/playground" element={<ProtectedRoute><Playground /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/marketplace" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminMarketplace /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
