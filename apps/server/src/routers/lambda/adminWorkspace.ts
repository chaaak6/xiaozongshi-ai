import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

import { workspaces } from '@/database/schemas/workspace';
import { workspaceMembers } from '@/database/schemas/workspace';
import { users } from '@/database/schemas/user';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { withRbacPermission } from '@/business/server/trpc-middlewares/rbacPermission';

const wsAdminProcedure = authedProcedure
  .use(serverDatabase)
  .use(withRbacPermission('admin:access'));

export const adminWorkspaceRouter = router({
  /** 列出所有工作区 */
  listAll: wsAdminProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      let conditions = [];
      if (input.search) {
        conditions.push(or(
          ilike(workspaces.name, `%${input.search}%`),
          ilike(workspaces.description, `%${input.search}%`),
        ));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const data = await serverDB
        .select({
          id: workspaces.id,
          name: workspaces.name,
          description: workspaces.description,
          createdAt: workspaces.createdAt,
        })
        .from(workspaces)
        .where(where)
        .orderBy(desc(workspaces.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Count members per workspace
      const enriched = await Promise.all(data.map(async (ws) => {
        const [memberRow] = await serverDB
          .select({ count: count() })
          .from(workspaceMembers)
          .where(eq(workspaceMembers.workspaceId, ws.id));
        return { ...ws, memberCount: Number(memberRow?.count ?? 0) };
      }));

      return { data: enriched, total: enriched.length };
    }),

  /** 创建工作区 */
  create: wsAdminProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const id = 'ws_' + Date.now().toString(36);
      const slug = input.name.toLowerCase().replace(/\s+/g, '-');

      await serverDB.insert(workspaces).values({
        id,
        slug,
        name: input.name,
        description: input.description || '',
        primaryOwnerId: ctx.userId,
      });

      // Auto-add creator as workspace owner
      await serverDB.insert(workspaceMembers).values({
        workspaceId: id,
        userId: ctx.userId,
        role: 'workspace_owner',
      });

      return { id, name: input.name };
    }),

  /** 列出工作区成员 */
  listMembers: wsAdminProcedure
    .input(z.object({
      workspaceId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      const data = await serverDB
        .select({
          id: workspaceMembers.userId,
          userId: workspaceMembers.userId,
          userName: users.fullName,
          userEmail: users.email,
          role: workspaceMembers.role,
          joinedAt: workspaceMembers.joinedAt,
        })
        .from(workspaceMembers)
        .innerJoin(users, eq(workspaceMembers.userId, users.id))
        .where(eq(workspaceMembers.workspaceId, input.workspaceId))
        .orderBy(asc(workspaceMembers.joinedAt));

      return { data };
    }),

  /** 邀请成员 */
  inviteMember: wsAdminProcedure
    .input(z.object({
      workspaceId: z.string(),
      email: z.string().email(),
      role: z.enum(['workspace_owner', 'workspace_member', 'workspace_viewer']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      // Find user by email
      const [user] = await serverDB
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user) {
        return { success: false, message: '用户不存在' };
      }

      await serverDB.insert(workspaceMembers).values({
        workspaceId: input.workspaceId,
        userId: user.id,
        role: input.role,
      }).onConflictDoUpdate({
        target: [workspaceMembers.workspaceId, workspaceMembers.userId],
        set: { role: input.role },
      });

      return { success: true };
    }),

  /** 更新工作区模型白名单 */
  updateModelWhitelist: wsAdminProcedure
    .input(z.object({
      workspaceId: z.string(),
      modelIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      // Store model whitelist in workspace settings JSON
      const [ws] = await serverDB
        .select({ settings: workspaces.settings })
        .from(workspaces)
        .where(eq(workspaces.id, input.workspaceId))
        .limit(1);

      const settings = (ws?.settings as any) || {};
      settings.modelWhitelist = input.modelIds;

      await serverDB
        .update(workspaces)
        .set({ settings })
        .where(eq(workspaces.id, input.workspaceId));

      return { success: true };
    }),

  /** 更新工作区 Token 配额 */
  updateQuota: wsAdminProcedure
    .input(z.object({
      workspaceId: z.string(),
      tokenQuota: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;

      const [ws] = await serverDB
        .select({ settings: workspaces.settings })
        .from(workspaces)
        .where(eq(workspaces.id, input.workspaceId))
        .limit(1);

      const settings = (ws?.settings as any) || {};
      settings.tokenQuota = input.tokenQuota;

      await serverDB
        .update(workspaces)
        .set({ settings })
        .where(eq(workspaces.id, input.workspaceId));

      return { success: true };
    }),

  /** 更新工作区 */
  update: wsAdminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      const { id, ...fields } = input;
      if (Object.keys(fields).length === 0) return { success: true };
      await serverDB.update(workspaces).set(fields).where(eq(workspaces.id, id));
      return { success: true };
    }),

  /** 删除工作区 */
  delete: wsAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      await serverDB.delete(workspaces).where(eq(workspaces.id, input.id));
      return { success: true };
    }),

  /** 移除成员 */
  removeMember: wsAdminProcedure
    .input(z.object({ workspaceId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { serverDB } = ctx;
      await serverDB.delete(workspaceMembers).where(
        and(eq(workspaceMembers.workspaceId, input.workspaceId), eq(workspaceMembers.userId, input.userId))
      );
      return { success: true };
    }),
});
