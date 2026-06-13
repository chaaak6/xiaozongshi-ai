import { index, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { createdAt } from './_helpers';
import { users } from './user';
import { workspaces } from './workspace';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id').references(() => workspaces.id, {
      onDelete: 'set null',
    }),
    category: varchar('category', { length: 32 }).notNull(),
    action: varchar('action', { length: 32 }).notNull(),
    target: text('target'),
    detail: text('detail'),
    ip: varchar('ip', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: createdAt(),
  },
  (table) => [
    index('audit_logs_user_id_idx').on(table.userId),
    index('audit_logs_workspace_id_idx').on(table.workspaceId),
    index('audit_logs_category_idx').on(table.category),
    index('audit_logs_created_at_idx').on(table.createdAt),
  ],
);

export type AuditLogItem = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
