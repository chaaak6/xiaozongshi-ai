/**
 * Mock data for Admin management module
 */
import type {
  AdminAgent,
  AdminAuditLog,
  AdminKnowledgeBase,
  AdminMockData,
  AdminRole,
  AdminSession,
  AdminSessionMessage,
  AdminUser,
  DashboardStats,
} from './types';

// ============================================
// Dashboard Stats
// ============================================

export const mockDashboardStats: DashboardStats = {
  monthlyActiveUsers: 28,
  totalKnowledgeBases: 15,
  totalMessages: 12_840,
  totalSessions: 358,
  totalUsers: 42,
  weeklyActiveSessions: 89,
};

// ============================================
// Sessions
// ============================================

export const mockSessions: AdminSession[] = [
  {
    created_at: '2026-06-10T08:00:00Z',
    id: 'sess-001',
    message_count: 12,
    updated_at: '2026-06-14T10:30:00Z',
    user_email: 'zhangsan@company.com',
    user_id: 'u1',
  },
  {
    created_at: '2026-06-11T09:00:00Z',
    id: 'sess-002',
    message_count: 5,
    updated_at: '2026-06-13T15:00:00Z',
    user_email: 'lisi@company.com',
    user_id: 'u2',
  },
  {
    created_at: '2026-06-12T14:00:00Z',
    id: 'sess-003',
    message_count: 28,
    updated_at: '2026-06-14T09:00:00Z',
    user_email: 'wangwu@company.com',
    user_id: 'u3',
  },
];

// ============================================
// Session Messages
// ============================================

export const mockSessionMessages: AdminSessionMessage[] = [
  {
    content: '帮我写一个排序算法',
    created_at: '2026-06-14T10:00:00Z',
    id: 'msg-001',
    model: 'gpt-4o',
    role: 'user',
  },
  {
    content: '好的，这是一个快速排序的实现...',
    created_at: '2026-06-14T10:00:05Z',
    id: 'msg-002',
    model: 'gpt-4o',
    role: 'assistant',
  },
  {
    content: '能优化一下吗',
    created_at: '2026-06-14T10:01:00Z',
    id: 'msg-003',
    model: 'gpt-4o',
    role: 'user',
  },
];

// ============================================
// Agents
// ============================================

export const mockAgents: AdminAgent[] = [
  {
    category: '编程',
    createdAt: '2026-06-01T00:00:00Z',
    enabled: true,
    id: 'agent-001',
    model: 'gpt-4o',
    name: '代码助手',
    userId: 'u1',
  },
  {
    category: '语言',
    createdAt: '2026-06-05T00:00:00Z',
    enabled: true,
    id: 'agent-002',
    model: 'claude-3-haiku',
    name: '翻译专家',
    userId: 'u2',
  },
  {
    category: '分析',
    createdAt: '2026-06-10T00:00:00Z',
    enabled: false,
    id: 'agent-003',
    model: 'gpt-4o-mini',
    name: '数据分析师',
    userId: 'u3',
  },
];

// ============================================
// Knowledge Bases
// ============================================

export const mockKnowledgeBases: AdminKnowledgeBase[] = [
  {
    file_count: 12,
    id: 'kb-001',
    name: '公司规章制度',
    user_email: 'zhangsan@company.com',
    visibility: 'workspace',
  },
  {
    file_count: 45,
    id: 'kb-002',
    name: '技术文档',
    user_email: 'lisi@company.com',
    visibility: 'restricted',
  },
  {
    file_count: 8,
    id: 'kb-003',
    name: '产品需求',
    user_email: 'wangwu@company.com',
    visibility: 'workspace',
  },
];

// ============================================
// Users
// ============================================

export const mockUsers: AdminUser[] = [
  {
    created_at: '2026-01-15T00:00:00Z',
    email: 'zhangsan@company.com',
    id: 'u1',
    name: '张三',
    status: 'active',
  },
  {
    created_at: '2026-02-20T00:00:00Z',
    email: 'lisi@company.com',
    id: 'u2',
    name: '李四',
    status: 'active',
  },
  {
    created_at: '2026-03-10T00:00:00Z',
    email: 'wangwu@company.com',
    id: 'u3',
    name: '王五',
    status: 'disabled',
  },
];

// ============================================
// Audit Logs
// ============================================

export const mockAuditLogs: AdminAuditLog[] = [
  {
    action: 'login',
    category: 'auth',
    created_at: '2026-06-14T09:00:00Z',
    id: 'log-001',
    target: 'user:u1',
    userId: 'u1',
  },
  {
    action: 'disable',
    category: 'agent',
    created_at: '2026-06-13T16:00:00Z',
    detail: '管理员手动禁用',
    id: 'log-002',
    target: 'agent:agent-003',
    userId: 'u3',
  },
  {
    action: 'create',
    category: 'knowledge',
    created_at: '2026-06-12T10:00:00Z',
    id: 'log-003',
    target: 'kb:kb-002',
    userId: 'u2',
  },
];

// ============================================
// RBAC Roles
// ============================================

export const mockRoles: AdminRole[] = [
  { displayName: '超级管理员', id: 'role-001', isSystem: true, name: 'super_admin' },
  { displayName: '管理员', id: 'role-002', isSystem: true, name: 'admin' },
  { displayName: '工作空间所有者', id: 'role-003', isSystem: true, name: 'workspace_owner' },
  { displayName: '工作空间成员', id: 'role-004', isSystem: true, name: 'workspace_member' },
  { displayName: '工作空间查看者', id: 'role-005', isSystem: true, name: 'workspace_viewer' },
];

// ============================================
// Permission Codes
// ============================================

export const mockPermissionCodes: string[] = [
  'admin:access',
  'audit:read',
  'session:read',
  'user:manage',
  'knowledge_base:manage',
  'agent:manage',
  'plugin:manage',
  'rbac:manage',
];

// ============================================
// Providers
// ============================================

export const mockProviders: AdminProvider[] = [
  { id: 'newapi', name: 'AI 中转站', userId: 'u1', enabled: true, source: 'builtin', checkModel: 'gpt-4o-mini', hasApiKey: true, hasBaseURL: true, createdAt: '2026-06-01T00:00:00Z', keyVaults: undefined },
  { id: 'openai', name: 'OpenAI', userId: 'u1', enabled: true, source: 'builtin', checkModel: null, hasApiKey: false, hasBaseURL: false, createdAt: '2026-06-01T00:00:00Z', keyVaults: undefined },
  { id: 'anthropic', name: 'Anthropic', userId: 'u1', enabled: true, source: 'builtin', checkModel: null, hasApiKey: false, hasBaseURL: false, createdAt: '2026-06-01T00:00:00Z', keyVaults: undefined },
  { id: 'deepseek', name: 'DeepSeek', userId: 'u1', enabled: false, source: 'builtin', checkModel: null, hasApiKey: false, hasBaseURL: false, createdAt: '2026-06-01T00:00:00Z', keyVaults: undefined },
];

// ============================================
// Aggregated Mock Data (used by handlers factory)
// ============================================

export const adminMockData: AdminMockData = {
  agents: mockAgents,
  auditLogs: mockAuditLogs,
  dashboardStats: mockDashboardStats,
  knowledgeBases: mockKnowledgeBases,
  permissionCodes: mockPermissionCodes,
  providers: mockProviders,
  roles: mockRoles,
  sessionMessages: mockSessionMessages,
  sessions: mockSessions,
  users: mockUsers,
};
