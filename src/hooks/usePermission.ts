import { useMemo } from 'react';

import { useAiInfraStore } from '@/store/aiInfra';

interface Permission {
  allowed: boolean;
  reason: string;
}

const ADMIN_PERMISSIONS = [
  'admin:access', 'audit:read', 'session:read', 'user:manage',
  'knowledge_base:manage', 'agent:manage', 'plugin:manage', 'rbac:manage',
];

export const usePermission = (action: string): Permission => {
  const userPermissions = useAiInfraStore((s) => s.userPermissions ?? []);

  return useMemo(() => {
    // E2E mode: grant all admin permissions so tests can access /admin pages
    if (typeof window !== 'undefined' && (window as any).__E2E__) {
      return { allowed: true, reason: '' };
    }

    const scopedPermissions = [`${action}:all`, `${action}:owner`, action];
    const hasPermission = scopedPermissions.some((perm) => userPermissions.includes(perm));

    return {
      allowed: hasPermission,
      reason: hasPermission ? '' : `缺少权限: ${action}`,
    };
  }, [action, userPermissions]);
};
