import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  isAgencyManagedOwner,
  isIndependentOwner,
  isOwner,
  getOwnerPermissions,
  canOwnerPerformAction,
  isReadOnlyForModule,
  getRestrictionMessage,
} from '../lib/owner-permissions';
import type { OwnerAction } from '../lib/owner-permissions';

export function useOwnerPermissions(module: string) {
  const { user } = useAuth();
  const role = user?.role;

  return useMemo(() => {
    const permissions = getOwnerPermissions(role, module);
    const readOnly = isReadOnlyForModule(role, module);
    const restrictionMessage = readOnly ? getRestrictionMessage(module) : undefined;

    return {
      
      canView: permissions.canView,
      canCreate: permissions.canCreate,
      canEdit: permissions.canEdit,
      canDelete: permissions.canDelete,
      canSign: permissions.canSign,
      canApprove: permissions.canApprove,
      canExport: permissions.canExport,

      isReadOnly: readOnly,
      restrictionMessage,
      permissions,

      isAgencyManagedOwner: isAgencyManagedOwner(role),
      isIndependentOwner: isIndependentOwner(role),
      isOwner: isOwner(role),

      canPerform: (action: OwnerAction) => canOwnerPerformAction(role, module, action),
    };
  }, [role, module]);
}

export function useOwnerRole() {
  const { user } = useAuth();
  const role = user?.role;

  return useMemo(
    () => ({
      isAgencyManagedOwner: isAgencyManagedOwner(role),
      isIndependentOwner: isIndependentOwner(role),
      isOwner: isOwner(role),
      role,
    }),
    [role]
  );
}

export default useOwnerPermissions;
