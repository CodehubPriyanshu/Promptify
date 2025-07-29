import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/common/theme-provider";
import { Layout } from "@/common/layout";
import Index from "./components/pagewise/user/index/Index";
import Login from "./components/pagewise/auth/user/login/Login";
import Signup from "./components/pagewise/auth/user/signup/Signup";
import Marketplace from "./components/pagewise/user/marketplaces/Marketplace";
import Playground from "./components/pagewise/user/playground/Playground";
import Dashboard from "./components/pagewise/user/dashboard/Dashboard";
import Pricing from "./components/pagewise/user/pricing/Pricing";
import NotFound from "./components/pagewise/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
