import { handleError, withRetry, AppError, ErrorTypes } from '@/utils/errorHandler';

// Construct API URL based on environment
const getApiBaseUrl = () => {
  // Use VITE_API_URL if directly set (for development)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Use VITE_BACKEND_URL with /api appended (for Render production)
  if (import.meta.env.VITE_BACKEND_URL) {
    return `${import.meta.env.VITE_BACKEND_URL}/api`;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:8002/api';
};

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token (check both regular and admin tokens)
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      return await withRetry(async () => {
        const response = await fetch(url, config);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Create appropriate error based on status
          let errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
          let errorCode = ErrorTypes.SERVER_ERROR;

          switch (response.status) {
            case 400:
              errorCode = ErrorTypes.VALIDATION_ERROR;
              break;
            case 401:
              errorCode = ErrorTypes.AUTHENTICATION_ERROR;
              // Clear invalid token
              localStorage.removeItem('authToken');
              break;
            case 403:
              errorCode = ErrorTypes.AUTHORIZATION_ERROR;
              break;
            case 404:
              errorCode = ErrorTypes.NOT_FOUND_ERROR;
              break;
            case 429:
              errorCode = ErrorTypes.RATE_LIMIT_ERROR;
              break;
            case 500:
            case 502:
            case 503:
            case 504:
              errorCode = ErrorTypes.SERVER_ERROR;
              break;
          }

          throw new AppError(errorMessage, response.status, errorCode, errorData);
        }

        const data = await response.json();
        return {
          success: true,
          data: data.data || data,
          message: data.message,
        };
      }, 3, 1000);
    } catch (error) {
      const appError = handleError(error, `API ${options.method || 'GET'} ${endpoint}`);
      // For backward compatibility, return error response format
      return {
        success: false,
        error: appError.message,
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(name: string, email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  // User endpoints
  async getDashboard() {
    return this.request<any>('/user/dashboard');
  }

  async getUserPrompts(page = 1, limit = 10) {
    return this.request<any>(`/user/prompts?page=${page}&limit=${limit}`);
  }

  async getUserAnalytics(period = '30d') {
    return this.request<any>(`/user/analytics?period=${period}`);
  }

  async updatePrompt(id: string, data: any) {
    return this.request<any>(`/user/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePrompt(id: string) {
    return this.request<any>(`/user/prompts/${id}`, {
      method: 'DELETE',
    });
  }

  // Marketplace endpoints
  async getMarketplacePrompts(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    type?: string;
    sort?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request<any>(`/marketplace/prompts?${queryParams}`);
  }

  async getPromptById(id: string) {
    return this.request<any>(`/marketplace/prompts/${id}`);
  }

  async likePrompt(id: string) {
    return this.request<any>(`/marketplace/prompts/${id}/like`, {
      method: 'POST',
    });
  }

  async downloadPrompt(id: string) {
    return this.request<any>(`/marketplace/prompts/${id}/download`, {
      method: 'POST',
    });
  }

  // Playground endpoints
  async sendPlaygroundMessage(message: string, sessionId?: string, model?: string) {
    return this.request<any>('/playground/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, model }),
    });
  }

  async getPlaygroundSessions() {
    return this.request<any>('/playground/sessions');
  }

  async getPlaygroundSession(sessionId: string) {
    return this.request<any>(`/playground/sessions/${sessionId}`);
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  async getAdminRecentActivity(limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    return this.request<any>(`/admin/recent-activity?${params}`);
  }

  async getAdminUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    plan?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request<any>(`/admin/users?${queryParams}`);
  }

  async updateUserStatus(userId: string, status: string) {
    return this.request<any>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminPrompts(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request<any>(`/admin/prompts?${queryParams}`);
  }

  async updatePromptStatus(promptId: string, status: string, notes?: string) {
    return this.request<any>(`/admin/prompts/${promptId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async updatePromptDetails(promptId: string, updates: { featured?: boolean; trending?: boolean; status?: string; rejectionReason?: string }) {
    return this.request<any>(`/admin/prompts/${promptId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async createPrompt(promptData: {
    title: string;
    description: string;
    content: string;
    category: string;
    tags?: string[];
    isPaid: boolean;
    price?: number;
    status?: string;
    featured?: boolean;
    trending?: boolean;
  }) {
    return this.request<any>('/admin/prompts', {
      method: 'POST',
      body: JSON.stringify(promptData),
    });
  }

  async deleteAdminPrompt(promptId: string) {
    return this.request<any>(`/admin/prompts/${promptId}`, {
      method: 'DELETE',
    });
  }

  // Admin Plans endpoints
  async getAdminPlans() {
    return this.request<any>('/admin/plans');
  }

  async getAdminPlansAnalytics() {
    return this.request<any>('/admin/plans/analytics');
  }

  async createPlan(planData: any) {
    return this.request<any>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updatePlan(planId: string, planData: any) {
    return this.request<any>(`/admin/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deletePlan(id: string) {
    return this.request<any>(`/admin/plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Payment endpoints
  async createPaymentOrder(planId: string) {
    return this.request<any>('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async verifyPayment(paymentData: any) {
    return this.request<any>('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getSubscriptionPlans() {
    return this.request<any>('/payment/plans');
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
