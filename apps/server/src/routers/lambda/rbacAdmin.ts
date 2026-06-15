import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { roles, permissions } from '@/database/schemas/rbac';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { withRbacPermission } from '@/business/server/trpc-middlewares/rbacPermission';

const rbacAdminProcedure = authedProcedure
  .use(serverDatabase)
  .use(withRbacPermission('admin:access'));

export const rbacAdminRouter = router({
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
});
