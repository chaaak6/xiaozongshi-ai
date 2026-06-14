/**
 * Mock route handlers for Admin management tRPC endpoints
 */
import type { Route } from 'playwright';

import { type MockHandler, createTrpcResponse } from '../index';
import type { AdminMockData } from './types';

// ============================================
// Response Helpers
// ============================================

/**
 * Create a paged list response body:
 * { result: { data: { data: T[], total: number } } }
 */
function createTrpcListResponse<T>(data: T[], total?: number): string {
  return createTrpcResponse({ data, total: total ?? data.length });
}

// ============================================
// Handler Definitions
// ============================================

export function createAdminHandlers(mockData: AdminMockData): MockHandler[] {
  return [
    // --- Dashboard ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcResponse(mockData.dashboardStats),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/admin\.getDashboardStats/,
    },

    // --- Sessions ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcListResponse(mockData.sessions),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/admin\.querySessions/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcResponse(mockData.sessionMessages),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/admin\.getSessionMessages/,
    },

    // --- Agents ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcListResponse(mockData.agents),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/adminAgent\.listAll/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcResponse({ success: true }),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/adminAgent\.toggleEnabled/,
    },

    // --- Plugins ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcListResponse([]),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/adminPlugin\.listAllPlugins/,
    },

    // --- Knowledge Bases ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcListResponse(mockData.knowledgeBases),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/knowledgeBaseAdmin\.listAll/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcResponse({ success: true }),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/knowledgeBaseAdmin\.grantPermission/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcResponse({ success: true }),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/knowledgeBaseAdmin\.revokePermission/,
    },

    // --- Users ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcListResponse(mockData.users),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/admin\.listUsers/,
    },

    // --- Audit Logs ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcListResponse(mockData.auditLogs),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/auditLog\.query/,
    },

    // --- Admin Providers ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcListResponse(mockData.providers || []),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/adminProvider\.listAll/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({
          body: createTrpcResponse({ success: true }),
          contentType: 'application/json',
          status: 200,
        }),
      pattern: /\/trpc\/lambda\/adminProvider\.toggleEnabled/,
    },

    // --- Model Management ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcListResponse(mockData.models || []), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminProvider\.listModels/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcResponse({ success: true }), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminProvider\.toggleModel/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcResponse({ success: true }), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminProvider\.assignModelToWorkspace/,
    },

    // --- Workspace Management ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcListResponse(mockData.workspaces || []), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminWorkspace\.listAll/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcResponse({ id: 'ws-new-' + Date.now(), name: '新工作区' }), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminWorkspace\.create/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcListResponse(mockData.workspaceMembers || []), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminWorkspace\.listMembers/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcResponse({ success: true }), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminWorkspace\.inviteMember/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcResponse({ success: true }), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminWorkspace\.updateQuota/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcListResponse(mockData.workspaces?.[0]?.modelWhitelist || []), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminWorkspace\.getModelWhitelist/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcResponse({ success: true }), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/adminWorkspace\.updateModelWhitelist/,
    },

    // --- RBAC Management ---
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcListResponse(mockData.roleDetails || mockData.roles), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/rbacAdmin\.listRoles/,
    },
    {
      enabled: true,
      handler: async (route: Route) =>
        route.fulfill({ body: createTrpcResponse({ success: true }), contentType: 'application/json', status: 200 }),
      pattern: /\/trpc\/lambda\/rbacAdmin\.(updateRolePermissions|createRole|assignUserRole)/,
    },
  ];
}
