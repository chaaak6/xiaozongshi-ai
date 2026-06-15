import { and, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';

import { roles, permissions, rolePermissions } from '@/database/schemas/rbac';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { withRbacPermission } from '@/business/server/trpc-middlewares/rbacPermission';

const rbacAdminProcedure = authedProcedure
  .use(serverDatabase)
  .use(withRbacPermission('admin:access'));

export const rbacAdminRouter = router({
  /** 列出所有角色及其权限 */
  listRoles: rbacAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      const total = await serverDB
        .select({ count: sql<number>`count(*)` })
        .from(roles)
        .then((r) => Number(r[0]?.count ?? 0));

      const roleList = await serverDB
        .select()
        .from(roles)
        .orderBy(roles.createdAt)
        .limit(input.limit)
        .offset(input.offset);

      // Fetch permissions for all roles
      const permRows = await serverDB
        .select({
          roleId: rolePermissions.roleId,
          code: permissions.code,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(
          inArray(
            rolePermissions.roleId,
            roleList.map((r) => r.id),
          ),
        );

      const permsByRole: Record<string, string[]> = {};
      for (const row of permRows) {
        if (!permsByRole[row.roleId]) permsByRole[row.roleId] = [];
        permsByRole[row.roleId].push(row.code);
      }

      return {
        data: roleList.map((r) => ({
          ...r,
          permissions: permsByRole[r.id] ?? [],
        })),
        total,
      };
    }),

  /** 创建角色 */
  createRole: rbacAdminProcedure
    .input(z.object({
      name: z.string().min(1),
      displayName: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const id = 'role_' + Date.now().toString(36);
      await serverDB.insert(roles).values({
        id,
        name: input.name,
        displayName: input.displayName,
        isSystem: false,
        isActive: true,
      });
      return { id };
    }),

  /** 删除角色 */
  deleteRole: rbacAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      await serverDB.delete(roles).where(eq(roles.id, input.id));
      return { success: true };
    }),

  /** 更新角色权限 */
  updateRolePermissions: rbacAdminProcedure
    .input(
      z.object({
        roleId: z.string(),
        permissionCodes: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      // Ensure all provided codes exist as permission records
      const existingPerms = await serverDB
        .select()
        .from(permissions)
        .where(inArray(permissions.code, input.permissionCodes));

      const existingIds = existingPerms.map((p) => p.id);

      // Delete existing role-permission associations
      await serverDB
        .delete(rolePermissions)
        .where(eq(rolePermissions.roleId, input.roleId));

      // Insert new associations
      if (existingIds.length > 0) {
        await serverDB.insert(rolePermissions).values(
          existingIds.map((permId) => ({
            roleId: input.roleId,
            permissionId: permId,
          })),
        );
      }

      return { success: true };
    }),
});
