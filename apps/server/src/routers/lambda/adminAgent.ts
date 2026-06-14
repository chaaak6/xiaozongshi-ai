import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { agents } from '@/database/schemas/agent';
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

      const data = await serverDB.select({
        id: agents.id,
        title: agents.title,
        model: agents.model,
        provider: agents.provider,
        description: agents.description,
        createdAt: agents.createdAt,
        userId: agents.userId,
        pinned: agents.pinned,
      })
      .from(agents)
      .orderBy(desc(agents.createdAt))
      .limit(input.limit)
      .offset(input.offset);

      return { data, total: data.length };
    }),

  /** 管理员置顶/取消置顶智能体 */
  togglePinned: agentAdminProcedure
    .input(z.object({
      agentId: z.string(),
      pinned: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      await serverDB.update(agents)
        .set({ pinned: input.pinned })
        .where(eq(agents.id, input.agentId));

      return { success: true };
    }),
});
