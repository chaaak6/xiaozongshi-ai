import { z } from 'zod';
import { authedProcedure } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const pluginAdminProcedure = authedProcedure.use(serverDatabase);

export const adminPluginRouter = {
  /** 管理员列出所有插件（简化版，返回空数据骨架） */
  listAllPlugins: pluginAdminProcedure
    .input(z.object({
      type: z.enum(['plugin', 'mcp', 'skill', 'all']).default('all'),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async () => {
      // 插件/MCP/Skill 的管理依赖于具体的表结构
      // 目前返回空骨架，后续可接入实际表
      return { data: [], total: 0 };
    }),
};
