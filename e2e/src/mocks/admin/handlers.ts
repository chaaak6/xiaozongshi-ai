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
  ];
}
