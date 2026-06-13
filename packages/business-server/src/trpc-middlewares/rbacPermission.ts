import { TRPCError } from '@trpc/server';

/**
 * tRPC middleware: checks whether the current user holds a specific permission code.
 * Depends on `ctx.userPermissions` (string array) injected by the checkAuth middleware.
 */
export function withRbacPermission(code: string) {
  return async function rbacPermissionMiddleware({ ctx, next }: any) {
    const permissions: string[] = ctx.userPermissions ?? [];

    if (!permissions.includes(code)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing permission: ${code}`,
      });
    }

    return next();
  };
}

export function withAnyRbacPermission(codes: string[]) {
  return async function rbacAnyPermissionMiddleware({ ctx, next }: any) {
    const permissions: string[] = ctx.userPermissions ?? [];

    const hasAny = codes.some((code) => permissions.includes(code));
    if (!hasAny) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing any permission: ${codes.join(', ')}`,
      });
    }

    return next();
  };
}

export function withAllRbacPermissions(codes: string[]) {
  return async function rbacAllPermissionsMiddleware({ ctx, next }: any) {
    const permissions: string[] = ctx.userPermissions ?? [];

    const hasAll = codes.every((code) => permissions.includes(code));
    if (!hasAll) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing all permissions: ${codes.join(', ')}`,
      });
    }

    return next();
  };
}

/**
 * Sugar for the "member-or-owner" gate: expands the action code into the
 * `:all | :owner` scope pair. A member with the `:owner` grant passes
 * alongside an owner with the `:all` grant.
 */
export function withScopedPermission(action: string) {
  return withAnyRbacPermission([`${action}:all`, `${action}:owner`]);
}
