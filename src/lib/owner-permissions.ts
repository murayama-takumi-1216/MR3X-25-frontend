
export type UserRole =
  | 'CEO'
  | 'ADMIN'
  | 'PLATFORM_MANAGER'
  | 'AGENCY_ADMIN'
  | 'AGENCY_MANAGER'
  | 'BROKER'
  | 'PROPRIETARIO'
  | 'INDEPENDENT_OWNER'
  | 'INQUILINO'
  | 'BUILDING_MANAGER'
  | 'LEGAL_AUDITOR'
  | 'REPRESENTATIVE'
  | 'API_CLIENT';

export type OwnerAction = 'view' | 'create' | 'edit' | 'delete' | 'sign' | 'approve' | 'export';

export interface ModulePermission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSign: boolean;
  canApprove: boolean;
  canExport: boolean;
  message?: string;
}

const PROPRIETARIO_PERMISSIONS: Record<string, ModulePermission> = {
  dashboard: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: false,
  },
  properties: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: false,
    message: 'Imóveis são gerenciados pela imobiliária',
  },
  tenant_analysis: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: false,
    message: 'Análise de inquilinos é realizada pela imobiliária',
  },
  payments: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: true,
    message: 'Pagamentos são gerenciados pela imobiliária',
  },
  invoices: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: true,
    message: 'Faturas são gerenciadas pela imobiliária',
  },
  contracts: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false, 
    canApprove: false,
    canExport: true,
    message: 'Contratos de aluguel são assinados pela imobiliária em nome do proprietário',
  },
  service_contracts: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: true, 
    canApprove: false,
    canExport: true,
    message: 'Imóvel assina apenas o contrato de prestação de serviços com a imobiliária',
  },
  inspections: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: false,
    message: 'Vistorias são realizadas pela imobiliária',
  },
  agreements: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: false,
    message: 'Acordos são gerenciados pela imobiliária',
  },
  reports: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: true,
  },
  notifications: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: false,
  },
  chat: {
    canView: true,
    canCreate: true, 
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: false,
  },
  profile: {
    canView: true,
    canCreate: false,
    canEdit: true, 
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: false,
  },
  documents: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSign: false,
    canApprove: false,
    canExport: true,
  },
};

const FULL_PERMISSIONS: ModulePermission = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canSign: true,
  canApprove: true,
  canExport: true,
};

export function isAgencyManagedOwner(role: string | undefined): boolean {
  return role === 'PROPRIETARIO';
}

export function isIndependentOwner(role: string | undefined): boolean {
  return role === 'INDEPENDENT_OWNER';
}

export function isOwner(role: string | undefined): boolean {
  return role === 'PROPRIETARIO' || role === 'INDEPENDENT_OWNER';
}

export function getOwnerPermissions(role: string | undefined, module: string): ModulePermission {
  if (role === 'PROPRIETARIO') {
    return PROPRIETARIO_PERMISSIONS[module] || {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canSign: false,
      canApprove: false,
      canExport: false,
    };
  }

  return FULL_PERMISSIONS;
}

export function canOwnerPerformAction(
  role: string | undefined,
  module: string,
  action: OwnerAction
): { allowed: boolean; message?: string } {
  const permissions = getOwnerPermissions(role, module);

  const actionMap: Record<OwnerAction, keyof ModulePermission> = {
    view: 'canView',
    create: 'canCreate',
    edit: 'canEdit',
    delete: 'canDelete',
    sign: 'canSign',
    approve: 'canApprove',
    export: 'canExport',
  };

  const permissionKey = actionMap[action];
  const allowed = permissions[permissionKey] as boolean;

  return {
    allowed,
    message: allowed ? undefined : permissions.message,
  };
}

export function isReadOnlyForModule(role: string | undefined, module: string): boolean {
  if (role !== 'PROPRIETARIO') return false;

  const permissions = getOwnerPermissions(role, module);
  return !permissions.canCreate && !permissions.canEdit && !permissions.canDelete;
}

export function getRestrictionMessage(module: string): string {
  const messages: Record<string, string> = {
    properties: 'Imóveis são gerenciados pela imobiliária',
    tenant_analysis: 'Análise de inquilinos é realizada pela imobiliária',
    payments: 'Pagamentos são gerenciados pela imobiliária',
    invoices: 'Faturas são gerenciadas pela imobiliária',
    contracts: 'Contratos de aluguel são assinados pela imobiliária em nome do proprietário',
    inspections: 'Vistorias são realizadas pela imobiliária',
    agreements: 'Acordos são gerenciados pela imobiliária',
    default: 'Esta ação é realizada pela imobiliária em seu nome',
  };

  return messages[module] || messages.default;
}
