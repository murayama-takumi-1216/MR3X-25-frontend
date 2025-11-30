import apiClient from './client';

// Dashboard API
export const dashboardAPI = {
  getDashboard: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  getDueDates: async () => {
    const response = await apiClient.get('/dashboard/due-dates');
    return response.data;
  },
};

// Properties API
export const propertiesAPI = {
  getProperties: async (params?: { search?: string }) => {
    const query = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
    const response = await apiClient.get(`/properties${query}`);
    // Backend returns { data: [...], total, page, limit }, extract the data array
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  getPropertyById: async (id: string) => {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  },

  createProperty: async (property: any) => {
    const response = await apiClient.post('/properties', property);
    return response.data;
  },

  updateProperty: async (id: string, property: any) => {
    const response = await apiClient.put(`/properties/${id}`, property);
    return response.data;
  },

  deleteProperty: async (id: string) => {
    const response = await apiClient.delete(`/properties/${id}`);
    return response.data;
  },

  assignBroker: async (propertyId: string, brokerId: string | null) => {
    const response = await apiClient.put(`/properties/${propertyId}/assign-broker`, { brokerId });
    return response.data;
  },

  uploadPropertyImages: async (propertyId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    const response = await apiClient.post(`/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPropertyImages: async (propertyId: string) => {
    const response = await apiClient.get(`/properties/${propertyId}/images`);
    return response.data;
  },

  setPrimaryImage: async (propertyId: string, imageId: string) => {
    const response = await apiClient.patch(`/properties/${propertyId}/images/${imageId}/primary`);
    return response.data;
  },

  deletePropertyImage: async (propertyId: string, imageId: string) => {
    const response = await apiClient.delete(`/properties/${propertyId}/images/${imageId}`);
    return response.data;
  },
};

// Contracts API
export const contractsAPI = {
  getContracts: async () => {
    const response = await apiClient.get('/contracts');
    // Backend returns { data: [...], total, page, limit }, extract the data array
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  getContractById: async (id: string) => {
    const response = await apiClient.get(`/contracts/${id}`);
    return response.data;
  },

  createContract: async (contract: any) => {
    const response = await apiClient.post('/contracts', contract);
    return response.data;
  },

  updateContract: async (id: string, contract: any) => {
    const response = await apiClient.put(`/contracts/${id}`, contract);
    return response.data;
  },

  deleteContract: async (id: string) => {
    const response = await apiClient.delete(`/contracts/${id}`);
    return response.data;
  },

  downloadContract: async (id: string) => {
    const response = await apiClient.get(`/contracts/download/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  uploadContractPDF: async (contractId: string, pdfFile: File) => {
    const formData = new FormData();
    formData.append('contract', pdfFile);
    formData.append('contractId', contractId);
    const response = await apiClient.post('/contracts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Sign contract
  signContract: async (id: string, data: {
    signature: string;
    signatureType: 'tenant' | 'owner' | 'agency' | 'witness';
    witnessName?: string;
    witnessDocument?: string;
  }) => {
    const response = await apiClient.post(`/contracts/${id}/sign`, data);
    return response.data;
  },

  // Get tenant's own contract
  getMyContract: async () => {
    const response = await apiClient.get('/contracts/my-contract/tenant');
    return response.data;
  },
};

// Contract Templates API
export const contractTemplatesAPI = {
  getTemplates: async () => {
    const response = await apiClient.get('/contract-templates');
    return response.data;
  },

  getTemplateById: async (id: string) => {
    const response = await apiClient.get(`/contract-templates/${id}`);
    return response.data;
  },

  getTemplatesByType: async (type: 'CTR' | 'ACD' | 'VST') => {
    const response = await apiClient.get(`/contract-templates/type/${type}`);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  getPayments: async () => {
    const response = await apiClient.get('/payments');
    return response.data;
  },

  getPaymentsByProperty: async (propertyId: string) => {
    const response = await apiClient.get(`/payments/property/${propertyId}`);
    return response.data;
  },

  createPayment: async (payment: any) => {
    const response = await apiClient.post('/payments', payment);
    return response.data;
  },

  updatePayment: async (id: string, payment: any) => {
    const response = await apiClient.put(`/payments/${id}`, payment);
    return response.data;
  },

  deletePayment: async (id: string) => {
    const response = await apiClient.delete(`/payments/${id}`);
    return response.data;
  },

  getAnnualReport: async (year?: number) => {
    const query = year ? `?year=${year}` : '';
    const response = await apiClient.get(`/payments/reports/annual${query}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  listUsers: async (params: { search?: string; role?: string; status?: string; plan?: string; page?: number; pageSize?: number } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    const query = qs.toString();
    const response = await apiClient.get(`/users${query ? `?${query}` : ''}`);
    // Backend returns { data: [...], total, page, limit }, map to { items: [...], total }
    const result = response.data;
    return {
      items: result.data || [],
      total: result.total || 0,
      page: result.page,
      limit: result.limit,
    };
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  getUserDetails: async () => {
    const response = await apiClient.get('/users/details');
    return response.data;
  },

  checkEmailExists: async (email: string) => {
    const response = await apiClient.get(`/users/check-email?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  getTenants: async () => {
    const response = await apiClient.get('/users/tenants');
    return response.data;
  },

  createTenant: async (tenant: any) => {
    const response = await apiClient.post('/users/tenants', tenant);
    return response.data;
  },

  updateTenant: async (id: string, tenant: any) => {
    const response = await apiClient.put(`/users/tenants/${id}`, tenant);
    return response.data;
  },

  deleteTenant: async (id: string) => {
    const response = await apiClient.delete(`/users/tenants/${id}`);
    return response.data;
  },

  createUser: async (payload: any) => {
    const response = await apiClient.post('/users', payload);
    return response.data;
  },

  updateUser: async (id: string, payload: any) => {
    const response = await apiClient.put(`/users/${id}`, payload);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  changeStatus: async (id: string, status: 'ACTIVE' | 'SUSPENDED', reason: string) => {
    const response = await apiClient.patch(`/users/${id}/status`, { status, reason });
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  getChats: async () => {
    const response = await apiClient.get('/chats');
    return response.data;
  },

  getMessages: async (chatId: string) => {
    const response = await apiClient.get(`/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId: string, content: string) => {
    const response = await apiClient.post(`/chats/${chatId}/messages`, { content });
    return response.data;
  },

  createChat: async (participantId: string) => {
    const response = await apiClient.post('/chats', { participantId });
    return response.data;
  },

  getAvailableUsers: async () => {
    const response = await apiClient.get('/chats/available-users');
    return response.data;
  },

  deleteChat: async (chatId: string) => {
    const response = await apiClient.delete(`/chats/${chatId}`);
    return response.data;
  },

  markAsRead: async (chatId: string) => {
    const response = await apiClient.patch(`/chats/${chatId}/read`);
    return response.data;
  },
};

// Address API
export const addressAPI = {
  getByCep: async (cep: string) => {
    const response = await apiClient.get(`/validation/cep/${cep}`);
    return response.data;
  },
};

// Agencies API
export const agenciesAPI = {
  getAgencies: async () => {
    const response = await apiClient.get('/agencies');
    return response.data;
  },

  getAgencyById: async (id: string) => {
    const response = await apiClient.get(`/agencies/${id}`);
    return response.data;
  },

  createAgency: async (agency: any) => {
    const response = await apiClient.post('/agencies', agency);
    return response.data;
  },

  updateAgency: async (id: string, agency: any) => {
    const response = await apiClient.put(`/agencies/${id}`, agency);
    return response.data;
  },

  deleteAgency: async (id: string) => {
    const response = await apiClient.delete(`/agencies/${id}`);
    return response.data;
  },

  // Plan Enforcement APIs
  getPlanUsage: async (id: string) => {
    const response = await apiClient.get(`/agencies/${id}/plan-usage`);
    return response.data;
  },

  getFrozenEntities: async (id: string) => {
    const response = await apiClient.get(`/agencies/${id}/frozen-entities`);
    return response.data;
  },

  previewPlanChange: async (id: string, newPlan: string) => {
    const response = await apiClient.get(`/agencies/${id}/preview-plan-change?newPlan=${newPlan}`);
    return response.data;
  },

  switchActiveProperty: async (id: string, newActivePropertyId: string) => {
    const response = await apiClient.post(`/agencies/${id}/switch-active-property`, { newActivePropertyId });
    return response.data;
  },

  enforcePlanLimits: async (id: string) => {
    const response = await apiClient.post(`/agencies/${id}/enforce-plan`);
    return response.data;
  },

  checkPropertyCreationAllowed: async (id: string) => {
    const response = await apiClient.get(`/agencies/${id}/check-property-creation`);
    return response.data;
  },

  checkUserCreationAllowed: async (id: string) => {
    const response = await apiClient.get(`/agencies/${id}/check-user-creation`);
    return response.data;
  },
};

// Plans API
export const plansAPI = {
  getPlans: async () => {
    const response = await apiClient.get('/plans');
    return response.data;
  },

  getPlanById: async (id: string) => {
    const response = await apiClient.get(`/plans/${id}`);
    return response.data;
  },

  updatePlan: async (id: string, plan: any) => {
    const response = await apiClient.put(`/plans/${id}`, plan);
    return response.data;
  },

  updatePlanByName: async (name: string, plan: any) => {
    const response = await apiClient.put(`/plans/name/${name}`, plan);
    return response.data;
  },

  updateSubscriberCounts: async () => {
    const response = await apiClient.post('/plans/update-counts');
    return response.data;
  },

  // Modification requests
  getPendingModificationRequests: async () => {
    const response = await apiClient.get('/plans/modification-requests/pending');
    return response.data;
  },

  getAllModificationRequests: async () => {
    const response = await apiClient.get('/plans/modification-requests');
    return response.data;
  },

  approveModificationRequest: async (id: string) => {
    const response = await apiClient.post(`/plans/modification-requests/${id}/approve`);
    return response.data;
  },

  rejectModificationRequest: async (id: string, reason?: string) => {
    const response = await apiClient.post(`/plans/modification-requests/${id}/reject`, { reason });
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  createNotification: async (notification: any) => {
    const response = await apiClient.post('/notifications', notification);
    return response.data;
  },

  updateNotification: async (id: string, notification: any) => {
    const response = await apiClient.put(`/notifications/${id}`, notification);
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  getPaymentConfig: async () => {
    const response = await apiClient.get('/settings/payment-config');
    return response.data;
  },

  updatePaymentConfig: async (config: { platformFee: number; agencyFee: number }) => {
    const response = await apiClient.put('/settings/payment-config', config);
    return response.data;
  },

  getSetting: async (key: string) => {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data;
  },

  updateSetting: async (key: string, value: string, description?: string) => {
    const response = await apiClient.put(`/settings/${key}`, { value, description });
    return response.data;
  },

  getAllSettings: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },
};

// Audit API
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
    const response = await apiClient.get(`/audit${query ? `?${query}` : ''}`);
    return response.data;
  },

  getAuditLogById: async (id: string) => {
    const response = await apiClient.get(`/audit/${id}`);
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  generateReceipt: async (data: any) => {
    const response = await apiClient.post('/documents/receipt', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  generateInvoice: async (data: any) => {
    const response = await apiClient.post('/documents/invoice', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  generateReceiptFromPayment: async (paymentId: string) => {
    const response = await apiClient.post(`/documents/receipt/payment/${paymentId}`, null, {
      responseType: 'blob',
    });
    return response.data;
  },

  generateAutoInvoice: async (contractId: string) => {
    const response = await apiClient.post(`/documents/invoice/auto/${contractId}`, null, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Inspections API
export const inspectionsAPI = {
  getInspections: async (params?: {
    propertyId?: string;
    contractId?: string;
    type?: string;
    status?: string;
    inspectorId?: string;
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
    const response = await apiClient.get(`/inspections${query ? `?${query}` : ''}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  getInspectionById: async (id: string) => {
    const response = await apiClient.get(`/inspections/${id}`);
    return response.data;
  },

  createInspection: async (inspection: any) => {
    const response = await apiClient.post('/inspections', inspection);
    return response.data;
  },

  updateInspection: async (id: string, inspection: any) => {
    const response = await apiClient.put(`/inspections/${id}`, inspection);
    return response.data;
  },

  deleteInspection: async (id: string) => {
    const response = await apiClient.delete(`/inspections/${id}`);
    return response.data;
  },

  signInspection: async (id: string, signatures: {
    tenantSignature?: string;
    ownerSignature?: string;
    agencySignature?: string;
    inspectorSignature?: string;
  }) => {
    const response = await apiClient.patch(`/inspections/${id}/sign`, signatures);
    return response.data;
  },

  approveInspection: async (id: string) => {
    const response = await apiClient.patch(`/inspections/${id}/approve`);
    return response.data;
  },

  rejectInspection: async (id: string, rejectionReason: string) => {
    const response = await apiClient.patch(`/inspections/${id}/reject`, { rejectionReason });
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/inspections/${id}/status`, { status });
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/inspections/statistics');
    return response.data;
  },

  // Templates
  getTemplates: async (params?: { type?: string; isDefault?: boolean }) => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qs.append(k, String(v));
        }
      });
    }
    const query = qs.toString();
    const response = await apiClient.get(`/inspections/templates${query ? `?${query}` : ''}`);
    return response.data;
  },

  getTemplateById: async (id: string) => {
    const response = await apiClient.get(`/inspections/templates/${id}`);
    return response.data;
  },

  createTemplate: async (template: any) => {
    const response = await apiClient.post('/inspections/templates', template);
    return response.data;
  },

  updateTemplate: async (id: string, template: any) => {
    const response = await apiClient.put(`/inspections/templates/${id}`, template);
    return response.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await apiClient.delete(`/inspections/templates/${id}`);
    return response.data;
  },
};

// Agreements API
export const agreementsAPI = {
  getAgreements: async (params?: {
    propertyId?: string;
    contractId?: string;
    type?: string;
    status?: string;
    tenantId?: string;
    ownerId?: string;
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
    const response = await apiClient.get(`/agreements${query ? `?${query}` : ''}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  getAgreementById: async (id: string) => {
    const response = await apiClient.get(`/agreements/${id}`);
    return response.data;
  },

  createAgreement: async (agreement: any) => {
    const response = await apiClient.post('/agreements', agreement);
    return response.data;
  },

  updateAgreement: async (id: string, agreement: any) => {
    const response = await apiClient.put(`/agreements/${id}`, agreement);
    return response.data;
  },

  deleteAgreement: async (id: string) => {
    const response = await apiClient.delete(`/agreements/${id}`);
    return response.data;
  },

  signAgreement: async (id: string, signatures: {
    tenantSignature?: string;
    ownerSignature?: string;
    agencySignature?: string;
  }) => {
    const response = await apiClient.patch(`/agreements/${id}/sign`, signatures);
    return response.data;
  },

  sendForSignature: async (id: string) => {
    const response = await apiClient.patch(`/agreements/${id}/send-for-signature`);
    return response.data;
  },

  approveAgreement: async (id: string) => {
    const response = await apiClient.patch(`/agreements/${id}/approve`);
    return response.data;
  },

  rejectAgreement: async (id: string, rejectionReason: string) => {
    const response = await apiClient.patch(`/agreements/${id}/reject`, { rejectionReason });
    return response.data;
  },

  cancelAgreement: async (id: string) => {
    const response = await apiClient.patch(`/agreements/${id}/cancel`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/agreements/${id}/status`, { status });
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/agreements/statistics');
    return response.data;
  },

  // Templates
  getTemplates: async (params?: { type?: string; isDefault?: boolean }) => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qs.append(k, String(v));
        }
      });
    }
    const query = qs.toString();
    const response = await apiClient.get(`/agreements/templates${query ? `?${query}` : ''}`);
    return response.data;
  },

  getTemplateById: async (id: string) => {
    const response = await apiClient.get(`/agreements/templates/${id}`);
    return response.data;
  },

  createTemplate: async (template: any) => {
    const response = await apiClient.post('/agreements/templates', template);
    return response.data;
  },

  updateTemplate: async (id: string, template: any) => {
    const response = await apiClient.put(`/agreements/templates/${id}`, template);
    return response.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await apiClient.delete(`/agreements/templates/${id}`);
    return response.data;
  },
};

// Invoices API
export const invoicesAPI = {
  getInvoices: async (params?: {
    propertyId?: string;
    contractId?: string;
    tenantId?: string;
    ownerId?: string;
    type?: string;
    status?: string;
    referenceMonth?: string;
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
    const response = await apiClient.get(`/invoices${query ? `?${query}` : ''}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  getInvoiceById: async (id: string) => {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoice: any) => {
    const response = await apiClient.post('/invoices', invoice);
    return response.data;
  },

  updateInvoice: async (id: string, invoice: any) => {
    const response = await apiClient.put(`/invoices/${id}`, invoice);
    return response.data;
  },

  markAsPaid: async (id: string, data: {
    paymentMethod?: string;
    paidValue?: number;
    paidAt?: string;
    notes?: string;
  }) => {
    const response = await apiClient.patch(`/invoices/${id}/mark-paid`, data);
    return response.data;
  },

  cancelInvoice: async (id: string, reason?: string) => {
    const response = await apiClient.patch(`/invoices/${id}/cancel`, { reason });
    return response.data;
  },

  resendToTenant: async (id: string, email?: string) => {
    const response = await apiClient.post(`/invoices/${id}/resend`, { email });
    return response.data;
  },

  downloadInvoice: async (id: string) => {
    const response = await apiClient.get(`/invoices/${id}/download`);
    return response.data;
  },

  downloadReceipt: async (id: string) => {
    const response = await apiClient.get(`/invoices/${id}/receipt`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/invoices/statistics');
    return response.data;
  },
};

export { authApi } from './auth';
export { default as apiClient } from './client';
