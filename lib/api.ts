import { createClient } from '@/lib/supabase/client'

// Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  statusCode: number
  data: T
  timestamp: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Environment
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5283/api'

// Options for API methods
export interface ApiRequestOptions {
  requireAuth?: boolean // default: true
  headers?: Record<string, string>
}

// Auth fetch helper
async function fetchWithAuth(url: string, options: RequestInit = {}, reqOptions: ApiRequestOptions = {}) {
   const { requireAuth = true } = reqOptions

   const authHeader: Record<string, string> = {}
   if (requireAuth) {
     const supabase = createClient()
     const { data: { session } } = await supabase.auth.getSession()
     if (session?.access_token) {
       authHeader['Authorization'] = `Bearer ${session.access_token}`
     }
   }

  // Add profile and team context headers
  const contextHeaders: Record<string, string> = {}
  if (typeof window !== 'undefined') {
    const activeProfileId = localStorage.getItem('activeProfileId')
    const activeTeamId = localStorage.getItem('activeTeamId')

    if (activeProfileId) {
      contextHeaders['X-Profile-Id'] = activeProfileId
    }
    if (activeTeamId) {
      contextHeaders['X-Team-Id'] = activeTeamId
    }
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' }
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string> || {}),
    ...(reqOptions.headers || {}),
    ...authHeader,
    ...contextHeaders,
  }

  try {
    return await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    })
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

// API methods
export const api = {
  // GET
  get: async <T>(url: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {}, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  },

  // POST
  post: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  },

  // POST multipart/form-data
  postForm: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    // Let browser set the multipart boundary; do not set Content-Type
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: formData,
      headers: {},
    }, { ...options, headers: {} })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // PUT
  put: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // PUT multipart/form-data
  putForm: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: formData,
      headers: {},
    }, { ...options, headers: {} })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // DELETE
  delete: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const requestOptions: RequestInit = { method: 'DELETE' }

    if (data) {
      requestOptions.body = JSON.stringify(data)
      requestOptions.headers = { 'Content-Type': 'application/json' }
    }

    const response = await fetchWithAuth(url, requestOptions, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // PATCH
  patch: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // POST Multipart (for file uploads)
  postMultipart: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const { requireAuth = true } = options || {}

    const authHeader: Record<string, string> = {}
    if (requireAuth) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        authHeader['Authorization'] = `Bearer ${session.access_token}`
      }
    }

    // Don't set Content-Type for FormData, let browser set it with boundary
    const headers: Record<string, string> = {
      ...(options?.headers || {}),
      ...authHeader,
    }
    
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      body: formData,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error ${response.status}:`, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    return response.json()
  },

  // PUT Multipart (for file uploads)
  putMultipart: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const { requireAuth = true } = options || {}

    const authHeader: Record<string, string> = {}
    if (requireAuth) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        authHeader['Authorization'] = `Bearer ${session.access_token}`
      }
    }

    // Don't set Content-Type for FormData, let browser set it with boundary
    const headers: Record<string, string> = {
      ...(options?.headers || {}),
      ...authHeader,
    }

    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      body: formData,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error ${response.status}:`, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    return response.json()
  },

}

// Endpoints
export const endpoints = {
  // User endpoints
  userProfile: "/users/profile/me",
  userSearch: (params?: { page?: number; pageSize?: number; searchTerm?: string; sortBy?: string; sortDescending?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDescending !== undefined) searchParams.append('sortDescending', params.sortDescending.toString());
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/users${queryString}`;
  },
  userById: (userId: string) => `/users/${userId}`,

  // Social Auth endpoints
  socialAuth: (provider: string) => `/social-auth/${provider}`,
  socialCallback: (provider: string) => `/social-auth/${provider}/callback`,

  // Social Accounts endpoints
  socialAccountsMe: () => '/social/accounts/me',
  socialAccountsUser: (userId: string) => `/social/accounts/user/${userId}`,
  socialAccountsWithTargets: () => '/social/accounts/me/accounts-with-targets',
  socialUnlinkAccount: (socialAccountId: string) => `/social/accounts/unlink/${socialAccountId}`,

  // Social Targets endpoints
  availableTargets: (socialAccountId: string) => `/social/accounts/${socialAccountId}/available-targets`,
  linkedTargets: (socialAccountId: string) => `/social/accounts/${socialAccountId}/linked-targets`,
  linkTargets: (socialAccountId: string) => `/social/accounts/${socialAccountId}/link-targets`,
  unlinkTarget: (socialIntegrationId: string) => `/social/accounts/unlink-target/${socialIntegrationId}`,

  // Ad Accounts endpoints
  adAccounts: (socialAccountId: string) => `/social/accounts/${socialAccountId}/ad-accounts`,

  // Brands endpoints
  brands: () => '/brands',
  brandsByTeam: (teamId: string) => `/brands/team/${teamId}`,
  brandById: (brandId: string) => `/brands/${brandId}`,

  // Products endpoints
  products: () => '/products',
  productById: (productId: string) => `/products/${productId}`,
  createProduct: () => '/products',
  updateProduct: (productId: string) => `/products/${productId}`,
  deleteProduct: (productId: string) => `/products/${productId}`,
  restoreProduct: (productId: string) => `/products/${productId}/restore`,

  // Profile endpoints
  profiles: () => '/profiles',
  profileById: (profileId: string) => `/profiles/${profileId}`,
  profilesMe: () => '/users/profile/me',

  // Approval endpoints
  approvals: () => '/approvals',
  approvalsPending: () => '/approvals/pending',
  approvalById: (approvalId: string) => `/approvals/${approvalId}`,
  approvalApprove: (approvalId: string) => `/approvals/${approvalId}/approve`,
  approvalReject: (approvalId: string) => `/approvals/${approvalId}/reject`,
  approvalsByContent: (contentId: string) => `/approvals/content/${contentId}`,
  approvalsByApprover: (approverId: string) => `/approvals/approver/${approverId}`,
  approvalRestore: (approvalId: string) => `/approvals/${approvalId}/restore`,
  approvalContentPending: (contentId: string) => `/approvals/content/${contentId}/pending`,

  // Content endpoints
  contents: () => '/content',
  contentById: (contentId: string) => `/content/${contentId}`,
  contentSubmit: (contentId: string) => `/content/${contentId}/submit`,
  contentPublish: (contentId: string, integrationId: string) => `/content/${contentId}/publish/${integrationId}`,
  contentRestore: (contentId: string) => `/content/${contentId}/restore`,

  // Social Integration endpoints
  socialIntegrations: () => '/social/integrations',
  socialIntegrationsByBrand: (brandId: string) => `/social/integrations/brand/${brandId}`,
  // AI Chat endpoints
  aiChat: () => '/ai/chat',

  // Conversation Management endpoints
  conversations: () => '/conversations',
  conversationById: (id: string) => `/conversations/${id}`,
  profilesByUser: (userId: string, search?: string, isDeleted?: boolean) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (isDeleted !== undefined) params.append('isDeleted', isDeleted.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return `/profiles/user/${userId}${queryString}`;
  },
  createProfile: (userId: string) => `/profiles/user/${userId}`,
  updateProfile: (profileId: string) => `/profiles/${profileId}`,
  deleteProfile: (profileId: string) => `/profiles/${profileId}`,
  restoreProfile: (profileId: string) => `/profiles/${profileId}/restore`,

  // Campaign endpoints
  campaigns: (params?: { brandId?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.brandId) searchParams.append('brandId', params.brandId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ad-campaigns${queryString}`;
  },
  campaignById: (campaignId: string) => `/ad-campaigns/${campaignId}`,
  createCampaign: () => '/ad-campaigns',
  updateCampaign: (campaignId: string) => `/ad-campaigns/${campaignId}`,
  deleteCampaign: (campaignId: string) => `/ad-campaigns/${campaignId}`,

  // Ad Set endpoints
  adSets: (params?: { campaignId?: string; page?: number; pageSize?: number; search?: string; status?: string; sortBy?: string; sortOrder?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.campaignId) searchParams.append('campaignId', params.campaignId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ad-sets${queryString}`;
  },
  adSetById: (adSetId: string) => `/ad-sets/${adSetId}`,
  createAdSet: () => '/ad-sets',
  updateAdSet: (adSetId: string) => `/ad-sets/${adSetId}`,
  deleteAdSet: (adSetId: string) => `/ad-sets/${adSetId}`,

  // Creative endpoints
  creatives: (params?: { adSetId?: string; page?: number; pageSize?: number; search?: string; type?: string; tags?: string[]; sortBy?: string; sortOrder?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.adSetId) searchParams.append('adSetId', params.adSetId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.tags && params.tags.length > 0) searchParams.append('tags', params.tags.join(','));
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ad-creatives${queryString}`;
  },
  creativeById: (creativeId: string) => `/ad-creatives/${creativeId}`,
  createCreative: () => '/ad-creatives',
  updateCreative: (creativeId: string) => `/ad-creatives/${creativeId}`,
  deleteCreative: (creativeId: string) => `/ad-creatives/${creativeId}`,
  creativeMetrics: (creativeId: string) => `/ad-creatives/${creativeId}/metrics`,

  // Ad endpoints
  ads: (params: { adSetId: string; status?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.append('adSetId', params.adSetId);
    if (params.status) searchParams.append('status', params.status);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ads${queryString}`;
  },
  adById: (adId: string) => `/ads/${adId}`,
  createAd: () => '/ads',
  updateAd: (adId: string) => `/ads/${adId}`,
  deleteAd: (adId: string) => `/ads/${adId}`,
  adStatus: (adId: string) => `/ads/${adId}/status`,
  bulkAdStatus: () => `/ads/status/bulk`,

  // Notification endpoints
  notifications: () => '/notifications',
  notificationById: (notificationId: string) => `/notifications/${notificationId}`,
  markNotificationAsRead: (notificationId: string) => `/notifications/${notificationId}/read`,
  markAllNotificationsAsRead: () => '/notifications/read/all',
  getUnreadNotificationCount: () => '/notifications/unread/count',

  // Content Calendar endpoints
  contentCalendar: {
    schedule: (contentId: string) => `/content-calendar/schedule/${contentId}`,
    scheduleRecurring: (contentId: string) => `/content-calendar/schedule-recurring/${contentId}`,
    cancelSchedule: (scheduleId: string) => `/content-calendar/schedule/${scheduleId}`,
    updateSchedule: (scheduleId: string) => `/content-calendar/schedule/${scheduleId}`,
    upcoming: (limit?: number, brandId?: string) => {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (brandId) params.append('brandId', brandId)
      return `/content-calendar/upcoming${params.toString() ? `?${params.toString()}` : ''}`
    },
    byTeam: (teamId: string, limit?: number) => `/content-calendar/team/${teamId}${limit ? `?limit=${limit}` : ''}`,
  },

  // Posts endpoints
  posts: {
    list: (params?: { page?: number; pageSize?: number; status?: string; platform?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
      if (params?.status) searchParams.append('status', params.status);
      if (params?.platform) searchParams.append('platform', params.platform);
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return `/posts${queryString}`;
    },
    byId: (postId: string) => `/posts/${postId}`,
    byContent: (contentId: string) => `/posts/content/${contentId}`,
    byIntegration: (integrationId: string) => `/posts/integration/${integrationId}`,
  },

  // Teams endpoints
  teams: () => '/teams',
  userTeams: () => '/team/user-teams',

  // Admin endpoints
  // Payment endpoints
  paymentsHistory: () => '/payment/history',
  paymentsAll: () => '/payment/admin/all',
  userPayments: (userId: string) => `/payment/admin/user/${userId}/payments`,
  
  // Subscription endpoints
  subscriptions: () => '/payment/subscriptions',
  subscriptionsAll: () => '/payment/admin/subscriptions',
  userSubscriptions: (userId: string) => `/payment/admin/user/${userId}/subscriptions`,
}

// User types matching backend DTOs
export interface User {
  id: string;
  email: string;
  createdAt: string;
  socialAccountsCount: number;
  role?: string; // Added for admin checks
}

export interface Payment {
  id: string;
  userId: string;
  userEmail?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: string | number;
  paymentMethod?: string;
  transactionId?: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  profileId: string;
  plan: string;
  quotaPostsPerMonth: number;
  quotaStorageGb: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  profileType: string;
  subscriptionId?: string;
  companyName?: string;
  bio?: string;
  avatarUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private async request(endpoint: string, options?: RequestInit) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Don't throw error, return null to let individual methods handle fallback
      return null as any;
    }

    return response.json();
  }

  // Users
  async getUsers(): Promise<User[]> {
    return await this.request('/users');
  }

  async getUser(id: string): Promise<User> {
    return await this.request(`/users/${id}`);
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return await this.request('/payments');;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return await this.request(`/payments/user/${userId}`);
  }

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    return await this.request('/subscriptions');
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await this.request(`/subscriptions/user/${userId}`);
  }

  // Profiles
  async getUserProfiles(userId: string): Promise<Profile[]> {
    return await this.request(`/profiles/user/${userId}`);
  }
}

export const apiService = new ApiService();