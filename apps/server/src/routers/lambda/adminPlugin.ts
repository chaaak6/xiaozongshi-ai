import { desc } from 'drizzle-orm';
import { z } from 'zod';

import { agentSkills } from '@/database/schemas/agentSkill';
import { userInstalledPlugins } from '@/database/schemas/connector';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { withRbacPermission } from '@/business/server/trpc-middlewares/rbacPermission';

const pluginAdminProcedure = authedProcedure
  .use(serverDatabase)
  .use(withRbacPermission('admin:access'));

export const adminPluginRouter = router({
  /** 管理员列出所有插件（从 agent_skills + user_installed_plugins 合并） */
  listAllPlugins: pluginAdminProcedure
    .input(
      z.object({
        type: z.enum(['plugin', 'mcp', 'skill', 'all']).default('all'),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      // Query agent_skills (skills)
      const skillsRows = await serverDB
        .select({
          id: agentSkills.id,
          name: agentSkills.name,
          description: agentSkills.description,
          identifier: agentSkills.identifier,
          source: agentSkills.source,
          createdAt: agentSkills.createdAt,
          userId: agentSkills.userId,
        })
        .from(agentSkills)
        .orderBy(desc(agentSkills.createdAt));

      // Query user_installed_plugins (plugins/MCP)
      const pluginsRows = await serverDB
        .select({
          id: userInstalledPlugins.identifier,
          name: userInstalledPlugins.identifier,
          identifier: userInstalledPlugins.identifier,
          type: userInstalledPlugins.type,
          source: userInstalledPlugins.source,
          createdAt: userInstalledPlugins.createdAt,
          userId: userInstalledPlugins.userId,
        })
        .from(userInstalledPlugins)
        .orderBy(desc(userInstalledPlugins.createdAt));

      // Merge: skills are type 'skill', plugins have their own type
      const allItems = [
        ...skillsRows.map((s) => ({
          description: s.description || '',
          id: s.id,
          name: s.name || s.identifier,
          source: s.source || 'manual',
          type: 'skill' as const,
          userId: s.userId,
        })),
        ...pluginsRows.map((p) => ({
          description: '',
          id: p.id || p.identifier,
          name: p.name || p.identifier,
          source: p.source || 'manual',
          type: (p.type || 'plugin') as 'plugin' | 'mcp' | 'skill',
          userId: p.userId,
        })),
      ];

      // Filter by type
      let filtered = allItems;
      if (input.type !== 'all') {
        filtered = allItems.filter((i) => i.type === input.type);
      }
      if (input.search) {
        const s = input.search.toLowerCase();
        filtered = filtered.filter(
          (i) => i.name?.toLowerCase().includes(s) || i.description?.toLowerCase().includes(s),
        );
      }

      const total = filtered.length;
      const data = filtered.slice(input.offset, input.offset + input.limit);

      return { data, total };
    }),

  /** 创建 Skill（写入 agent_skills 表） */
  createSkill: pluginAdminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        identifier: z.string().min(1).max(100),
        manifest: z.any().optional(),
        content: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const id = 'skill_' + Date.now().toString(36);
      await serverDB.insert(agentSkills).values({
        id,
        name: input.name,
        description: input.description || '',
        identifier: input.identifier,
        manifest: input.manifest || {},
        content: input.content || '',
        source: 'admin',
        userId: ctx.userId,
      });
      return { id };
    }),

  /** 删除 Skill */
  deleteSkill: pluginAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const { eq } = await import('drizzle-orm');
      await serverDB.delete(agentSkills).where(eq(agentSkills.id, input.id));
      return { success: true };
    }),
});
