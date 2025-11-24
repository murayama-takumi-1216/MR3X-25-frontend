const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

// Helper to get token from cookies (client-side)
function getToken() {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('jwt_token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

// Fetch with authentication
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  // Handle errors
  if (response.status === 401) {
    // Clear token and redirect to login
    if (typeof window !== 'undefined') {
      document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    // Create error object with full details for better error handling
    const errorObj: any = new Error(error.message || `Error ${response.status}`);
    errorObj.status = response.status;
    errorObj.data = error;
    throw errorObj;
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let message = 'Invalid credentials';
      try {
        const errorBody = await response.json();
        if (errorBody?.message) {
          message = errorBody.message;
        }
      } catch (error) {
        if (response.status === 403) {
          message = 'Conta suspensa. Entre em contato com o suporte.';
        }
      }
      throw new Error(message);
    }

    const data = await response.json();
    
    // Store token in cookie with proper expiration (7 days)
    if (typeof window !== 'undefined') {
      document.cookie = `jwt_token=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
    }

    return data;
  },

  register: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  requestEmailCode: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Falha ao solicitar código' }));
      throw new Error(error.message || 'Falha ao solicitar código');
    }
    return response.json();
  },

  confirmEmailCode: async (requestId: string, code: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, code }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Código inválido' }));
      throw new Error(error.message || 'Código inválido');
    }
    return response.json();
  },

  completeRegistration: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Falha ao criar conta' }));
      throw new Error(error.message || 'Falha ao criar conta');
    }
    return response.json();
  },

  // Refresh token functionality removed - tokens now last 7 days

  logout: async () => {
    if (typeof window === 'undefined') return;
    
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear token from cookie
    document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  },

  logoutAll: async () => {
    try {
      await fetchWithAuth('/auth/logout-all', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout all error:', error);
    }

    // Clear tokens from cookies
    if (typeof window !== 'undefined') {
      document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to send reset email');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      throw new Error('Failed to reset password');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    return fetchWithAuth('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: async () => {
    return fetchWithAuth('/dashboard');
  },

  getDueDates: async () => {
    return fetchWithAuth('/dashboard/due-dates');
  },
};

// Properties API
export const propertiesAPI = {
  getProperties: async (params?: { search?: string }) => {
    const query = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
    return fetchWithAuth(`/properties${query}`);
  },

  getPropertyById: async (id: string) => {
    return fetchWithAuth(`/properties/${id}`);
  },

  createProperty: async (property: any) => {
    return fetchWithAuth('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  },

  updateProperty: async (id: string, property: any) => {
    return fetchWithAuth(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(property),
    });
  },

  deleteProperty: async (id: string) => {
    return fetchWithAuth(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  assignBroker: async (propertyId: string, brokerId: string | null) => {
    return fetchWithAuth(`/properties/${propertyId}/assign-broker`, {
      method: 'PUT',
      body: JSON.stringify({ brokerId }),
    });
  },

  // Property Images API
  uploadPropertyImages: async (propertyId: string, files: File[]) => {
    const token = getToken();
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/images`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload images');
    }

    return response.json();
  },

  getPropertyImages: async (propertyId: string) => {
    return fetchWithAuth(`/properties/${propertyId}/images`);
  },

  setPrimaryImage: async (propertyId: string, imageId: string) => {
    return fetchWithAuth(`/properties/${propertyId}/images/${imageId}/primary`, {
      method: 'PATCH',
    });
  },

  deletePropertyImage: async (propertyId: string, imageId: string) => {
    return fetchWithAuth(`/properties/${propertyId}/images/${imageId}`, {
      method: 'DELETE',
    });
  },
};

// Contracts API
export const contractsAPI = {
  getContracts: async () => {
    return fetchWithAuth('/contracts');
  },

  getContractById: async (id: string) => {
    return fetchWithAuth(`/contracts/${id}`);
  },

  createContract: async (contract: any) => {
    return fetchWithAuth('/contracts', {
      method: 'POST',
      body: JSON.stringify(contract),
    });
  },

  updateContract: async (id: string, contract: any) => {
    return fetchWithAuth(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contract),
    });
  },

  deleteContract: async (id: string) => {
    return fetchWithAuth(`/contracts/${id}`, {
      method: 'DELETE',
    });
  },

  downloadContract: async (id: string) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/contracts/download/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = 'Failed to download contract';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return response.blob();
  },

  uploadContractPDF: async (contractId: string, pdfFile: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('contract', pdfFile);
    formData.append('contractId', contractId);

    const response = await fetch(`${API_BASE_URL}/contracts/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type header - let browser set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload contract PDF' }));
      const errorObj: any = new Error(error.message || error.error || 'Failed to upload contract PDF');
      errorObj.status = response.status;
      errorObj.data = error;
      throw errorObj;
    }

    return response.json();
  },
};

// Contract Templates API
export const contractTemplatesAPI = {
  getTemplates: async () => {
    return fetchWithAuth('/contract-templates');
  },

  getTemplateById: async (id: string) => {
    return fetchWithAuth(`/contract-templates/${id}`);
  },

  getTemplatesByType: async (type: 'CTR' | 'ACD' | 'VST') => {
    return fetchWithAuth(`/contract-templates/type/${type}`);
  },
};

// Payments API
export const paymentsAPI = {
  getPayments: async () => {
    return fetchWithAuth('/payments');
  },

  createPayment: async (payment: any) => {
    return fetchWithAuth('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  },

  updatePayment: async (id: string, payment: any) => {
    return fetchWithAuth(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payment),
    });
  },

  deletePayment: async (id: string) => {
    return fetchWithAuth(`/payments/${id}`, {
      method: 'DELETE',
    });
  },

  getAnnualReport: async (year?: number) => {
    const query = year ? `?year=${year}` : '';
    return fetchWithAuth(`/payments/reports/annual${query}`);
  },
};

// Users/Tenants API
export const usersAPI = {
  listUsers: async (params: { search?: string; role?: string; status?: string; plan?: string; page?: number; pageSize?: number } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    const query = qs.toString();
    return fetchWithAuth(`/users${query ? `?${query}` : ''}`);
  },

  getUserById: async (id: string) => {
    return fetchWithAuth(`/users/${id}`);
  },

  getUserDetails: async () => {
    return fetchWithAuth('/users/details');
  },

  getTenants: async () => {
    return fetchWithAuth('/users/tenants');
  },

  createTenant: async (tenant: any) => {
    return fetchWithAuth('/users/tenants', {
      method: 'POST',
      body: JSON.stringify(tenant),
    });
  },

  updateTenant: async (id: string, tenant: any) => {
    return fetchWithAuth(`/users/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenant),
    });
  },

  deleteTenant: async (id: string) => {
    return fetchWithAuth(`/users/tenants/${id}`, {
      method: 'DELETE',
    });
  },

  createUser: async (payload: any) => {
    return fetchWithAuth('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateUser: async (id: string, payload: any) => {
    return fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteUser: async (id: string) => {
    return fetchWithAuth(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  changeStatus: async (id: string, status: 'ACTIVE' | 'SUSPENDED', reason: string) => {
    return fetchWithAuth(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },
};

// Chat API
export const chatAPI = {
  getChats: async () => {
    return fetchWithAuth('/chats');
  },

  getMessages: async (chatId: string) => {
    return fetchWithAuth(`/chats/${chatId}/messages`);
  },

  sendMessage: async (chatId: string, content: string) => {
    return fetchWithAuth(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  createChat: async (participantId: string) => {
    return fetchWithAuth('/chats', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  },

  getAvailableUsers: async () => {
    return fetchWithAuth('/chats/available-users');
  },

  deleteChat: async (chatId: string) => {
    return fetchWithAuth(`/chats/${chatId}`, {
      method: 'DELETE',
    });
  },

  markAsRead: async (chatId: string) => {
    return fetchWithAuth(`/chats/${chatId}/read`, {
      method: 'PATCH',
    });
  },
};

// Address API
export const addressAPI = {
  getByCep: async (cep: string) => {
    return fetchWithAuth(`/address/cep/${cep}`);
  },
};

// Companies API
export const companiesAPI = {
  getCompanies: async () => {
    return fetchWithAuth('/companies');
  },

  getCompanyById: async (id: string) => {
    return fetchWithAuth(`/companies/${id}`);
  },

  createCompany: async (company: any) => {
    return fetchWithAuth('/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
  },

  updateCompany: async (id: string, company: any) => {
    return fetchWithAuth(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(company),
    });
  },

  deleteCompany: async (id: string) => {
    return fetchWithAuth(`/companies/${id}`, {
      method: 'DELETE',
    });
  },

  validateCnpj: async (cnpj: string) => {
    return fetchWithAuth(`/companies/validate-cnpj/${cnpj}`);
  },
};

// Agencies API
export const agenciesAPI = {
  getAgencies: async () => {
    return fetchWithAuth('/agencies');
  },

  getAgencyById: async (id: string) => {
    return fetchWithAuth(`/agencies/${id}`);
  },

  createAgency: async (agency: any) => {
    return fetchWithAuth('/agencies', {
      method: 'POST',
      body: JSON.stringify(agency),
    });
  },

  updateAgency: async (id: string, agency: any) => {
    return fetchWithAuth(`/agencies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agency),
    });
  },

  deleteAgency: async (id: string) => {
    return fetchWithAuth(`/agencies/${id}`, {
      method: 'DELETE',
    });
  },
};

// Plans API
export const plansAPI = {
  getPlans: async () => {
    return fetchWithAuth('/plans');
  },

  getPlanById: async (id: string) => {
    return fetchWithAuth(`/plans/${id}`);
  },

  updatePlan: async (id: string, plan: any) => {
    return fetchWithAuth(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    });
  },

  updatePlanByName: async (name: string, plan: any) => {
    return fetchWithAuth(`/plans/name/${name}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    });
  },

  updateSubscriberCounts: async () => {
    return fetchWithAuth('/plans/update-counts', {
      method: 'POST',
    });
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async () => {
    return fetchWithAuth('/notifications');
  },

  createNotification: async (notification: any) => {
    return fetchWithAuth('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },

  updateNotification: async (id: string, notification: any) => {
    return fetchWithAuth(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notification),
    });
  },

  deleteNotification: async (id: string) => {
    return fetchWithAuth(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  markAsRead: async (id: string) => {
    return fetchWithAuth(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};

// Validation API
export const validationAPI = {
  validateCPF: async (cpf: string) => {
    return fetchWithAuth('/validation/cpf', {
      method: 'POST',
      body: JSON.stringify({ cpf }),
    });
  },

  validateCNPJ: async (cnpj: string) => {
    return fetchWithAuth('/validation/cnpj', {
      method: 'POST',
      body: JSON.stringify({ cnpj }),
    });
  },

  validateDocument: async (document: string) => {
    return fetchWithAuth('/validation/document', {
      method: 'POST',
      body: JSON.stringify({ document }),
    });
  },

  validateCEP: async (cep: string) => {
    return fetchWithAuth('/validation/cep', {
      method: 'POST',
      body: JSON.stringify({ cep }),
    });
  },

  fetchCEPData: async (cep: string) => {
    return fetchWithAuth(`/validation/cep/${cep}`);
  },

  formatCPF: async (cpf: string) => {
    return fetchWithAuth('/validation/format/cpf', {
      method: 'POST',
      body: JSON.stringify({ cpf }),
    });
  },

  formatCNPJ: async (cnpj: string) => {
    return fetchWithAuth('/validation/format/cnpj', {
      method: 'POST',
      body: JSON.stringify({ cnpj }),
    });
  },

  formatCEP: async (cep: string) => {
    return fetchWithAuth('/validation/format/cep', {
      method: 'POST',
      body: JSON.stringify({ cep }),
    });
  },
};

// Audit Logs API
export const auditAPI = {
  getAuditLogs: async (params?: {
    entity?: string;
    entityId?: string;
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qs.append(k, String(v));
        }
      });
    }
    const query = qs.toString();
    return fetchWithAuth(`/audit${query ? `?${query}` : ''}`);
  },

  getAuditLogById: async (id: string) => {
    return fetchWithAuth(`/audit/${id}`);
  },
};

// Documents API
// Settings API
export const settingsAPI = {
  getPaymentConfig: async () => {
    return fetchWithAuth('/settings/payment-config');
  },

  updatePaymentConfig: async (config: { platformFee: number; agencyFee: number }) => {
    return fetchWithAuth('/settings/payment-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  getSetting: async (key: string) => {
    return fetchWithAuth(`/settings/${key}`);
  },

  updateSetting: async (key: string, value: string, description?: string) => {
    return fetchWithAuth(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    });
  },

  getAllSettings: async () => {
    return fetchWithAuth('/settings');
  },
};

// Documents API
export const documentsAPI = {
  generateReceipt: async (data: any) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/documents/receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate receipt');
    }

    return response.blob();
  },

  generateInvoice: async (data: any) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/documents/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate invoice');
    }

    return response.blob();
  },

  generateReceiptFromPayment: async (paymentId: string) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/documents/receipt/payment/${paymentId}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate receipt from payment');
    }

    return response.blob();
  },

  generateAutoInvoice: async (contractId: string) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/documents/invoice/auto/${contractId}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate auto invoice');
    }

    return response.blob();
  },
};

