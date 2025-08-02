import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { showErrorToast, handleError } from '@/utils/errorHandler';
import { useToast } from '@/hooks/use-toast';

// Query keys for consistent caching
export const queryKeys = {
  // Auth
  profile: ['profile'],
  
  // User
  dashboard: ['user', 'dashboard'],
  userPrompts: (page: number, limit: number) => ['user', 'prompts', page, limit],
  userAnalytics: (period: string) => ['user', 'analytics', period],
  
  // Marketplace
  marketplacePrompts: (params: any) => ['marketplace', 'prompts', params],
  prompt: (id: string) => ['prompt', id],
  
  // Playground
  playgroundSessions: ['playground', 'sessions'],
  playgroundSession: (id: string) => ['playground', 'session', id],
  
  // Admin
  adminDashboard: ['admin', 'dashboard'],
  adminUsers: (params: any) => ['admin', 'users', params],
  adminPrompts: (params: any) => ['admin', 'prompts', params],
  
  // Payment
  subscriptionPlans: ['payment', 'plans'],
};

// Global error handler for React Query
const defaultQueryOptions = {
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors (except 429)
    if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
      return false;
    }
    // Retry up to 3 times for other errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  staleTime: 5 * 60 * 1000, // 5 minutes
};

// Auth hooks
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiService.getProfile(),
    ...defaultQueryOptions,
  });
};

// User hooks
export const useDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiService.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserPrompts = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.userPrompts(page, limit),
    queryFn: () => apiService.getUserPrompts(page, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUserAnalytics = (period = '30d') => {
  return useQuery({
    queryKey: queryKeys.userAnalytics(period),
    queryFn: () => apiService.getUserAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.updatePrompt(id, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ['user', 'prompts'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'prompts'] });
      toast({
        title: "Success",
        description: "Prompt updated successfully!",
      });
    },
    onError: (error) => {
      showErrorToast(error, 'Updating prompt');
    },
  });
};

export const useDeletePrompt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => apiService.deletePrompt(id),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ['user', 'prompts'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'prompts'] });
      toast({
        title: "Success",
        description: "Prompt deleted successfully!",
      });
    },
    onError: (error) => {
      showErrorToast(error, 'Deleting prompt');
    },
  });
};

// Marketplace hooks
export const useMarketplacePrompts = (params: any = {}) => {
  return useQuery({
    queryKey: queryKeys.marketplacePrompts(params),
    queryFn: () => apiService.getMarketplacePrompts(params),
    ...defaultQueryOptions,
    staleTime: 2 * 60 * 1000, // 2 minutes (override default)
  });
};

export const usePrompt = (id: string) => {
  return useQuery({
    queryKey: queryKeys.prompt(id),
    queryFn: () => apiService.getPromptById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLikePrompt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (promptId: string) => apiService.likePrompt(promptId),
    onSuccess: (data, promptId) => {
      // Invalidate and refetch marketplace prompts
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'prompts'] });
      // Update specific prompt cache
      queryClient.invalidateQueries({ queryKey: queryKeys.prompt(promptId) });
      toast({
        title: "Success",
        description: "Prompt liked successfully!",
      });
    },
    onError: (error) => {
      showErrorToast(error, 'Liking prompt');
    },
  });
};

export const useDownloadPrompt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (promptId: string) => apiService.downloadPrompt(promptId),
    onSuccess: (data, promptId) => {
      // Invalidate marketplace prompts to update download count
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'prompts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.prompt(promptId) });
      // Invalidate user dashboard to update usage
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast({
        title: "Success",
        description: "Prompt downloaded successfully!",
      });
    },
    onError: (error) => {
      showErrorToast(error, 'Downloading prompt');
    },
  });
};

// Playground hooks
export const usePlaygroundSessions = () => {
  return useQuery({
    queryKey: queryKeys.playgroundSessions,
    queryFn: () => apiService.getPlaygroundSessions(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const usePlaygroundSession = (sessionId: string) => {
  return useQuery({
    queryKey: queryKeys.playgroundSession(sessionId),
    queryFn: () => apiService.getPlaygroundSession(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useSendPlaygroundMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
      apiService.sendPlaygroundMessage(message, sessionId),
    onSuccess: (data, variables) => {
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: queryKeys.playgroundSessions });
      // If we have a session ID, invalidate that specific session
      if (variables.sessionId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.playgroundSession(variables.sessionId) 
        });
      }
      // Update user dashboard for usage tracking
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

// Admin hooks
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => apiService.getAdminDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminUsers = (params: any = {}) => {
  return useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn: () => apiService.getAdminUsers(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      apiService.updateUserStatus(userId, status),
    onSuccess: () => {
      // Invalidate admin users queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      // Invalidate admin dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
};

export const useAdminPrompts = (params: any = {}) => {
  return useQuery({
    queryKey: queryKeys.adminPrompts(params),
    queryFn: () => apiService.getAdminPrompts(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUpdatePromptStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ promptId, status, notes }: { promptId: string; status: string; notes?: string }) =>
      apiService.updatePromptStatus(promptId, status, notes),
    onSuccess: () => {
      // Invalidate admin prompts queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'prompts'] });
      // Invalidate marketplace prompts
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'prompts'] });
      // Invalidate admin dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
};

// Payment hooks
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: queryKeys.subscriptionPlans,
    queryFn: () => apiService.getSubscriptionPlans(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: (planId: string) => apiService.createPaymentOrder(planId),
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentData: any) => apiService.verifyPayment(paymentData),
    onSuccess: () => {
      // Invalidate user profile and dashboard to reflect subscription changes
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};
