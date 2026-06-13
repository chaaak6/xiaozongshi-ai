import { useMemo } from 'react';

import { useAiInfraStore } from '@/store/aiInfra';

interface Permission {
  allowed: boolean;
  reason: string;
}

export const usePermission = (action: string): Permission => {
  const userPermissions = useAiInfraStore((s) => s.userPermissions ?? []);

  return useMemo(() => {
    const scopedPermissions = [`${action}:all`, `${action}:owner`, action];
    const hasPermission = scopedPermissions.some((perm) => userPermissions.includes(perm));

    return {
      allowed: hasPermission,
      reason: hasPermission ? '' : `缺少权限: ${action}`,
    };
  }, [action, userPermissions]);
};
