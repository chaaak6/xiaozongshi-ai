import { z } from 'zod';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { withRbacPermission } from '@/business/server/trpc-middlewares/rbacPermission';

const agentAdminProcedure = authedProcedure.use(serverDatabase).use(withRbacPermission('admin:access'));

export const adminAgentRouter = router({
  /** 管理员列出所有智能体 */
  listAll: agentAdminProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const { agents, users } = serverDB;
      const { eq, ilike, desc, count, sql } = await import('drizzle-orm');

      // 简化：直接查询 agents 表
      const data = await serverDB.select({
        id: agents.id,
        name: agents.name,
        model: agents.model,
        category: agents.category,
        enabled: agents.enabled,
        createdAt: agents.createdAt,
        userId: agents.userId,
      })
      .from(agents)
      .orderBy(desc(agents.createdAt))
      .limit(input.limit)
      .offset(input.offset);

      return { data, total: data.length };
    }),

  /** 管理员启用/禁用智能体 */
  toggleEnabled: agentAdminProcedure
    .input(z.object({
      agentId: z.string(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const { agents } = serverDB;
      const { eq } = await import('drizzle-orm');

      await serverDB.update(agents)
        .set({ enabled: input.enabled })
        .where(eq(agents.id, input.agentId));

      return { success: true };
    }),
});
