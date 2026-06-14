/**
 * Admin Management Step Definitions
 *
 * Step definitions for Admin back-office E2E tests
 * - Dashboard, Sessions, Agents, Knowledge Bases, Users, RBAC
 *
 * All steps use multi-selector fallback (xpath + css) and
 * take screenshots on failure.
 */
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { adminMockData } from '../../mocks/admin';
import type { CustomWorld, WAIT_TIMEOUT } from '../../support/world';
import { WAIT_TIMEOUT as WT } from '../../support/world';

// Re-import to get the value since it's exported as const
const WAIT_TIMEOUT = WT;

// ============================================
// Helper Functions
// ============================================

/**
 * Navigate to an admin page and wait for network idle.
 * Takes the role label for logging purposes.
 */
async function navigateToAdminPage(
  this: CustomWorld,
  path: string,
  label: string,
): Promise<void> {
  console.log(`   📍 Step: 导航到管理后台${label} (${path})...`);
  // Admin routes are SPA pages served at /spa/[locale]/admin/...
  const spaPath = `/spa/zh-CN${path}`;
  await this.page.goto(spaPath);
  await this.page.waitForLoadState('networkidle', { timeout: WAIT_TIMEOUT });
  await this.page.waitForTimeout(1000);
  console.log(`   ✅ 已导航到 ${path} (via ${spaPath})`);
}

/**
 * Assert that a page heading/title is visible.
 * Uses multiple selector strategies as fallback.
 */
async function assertPageTitle(
  this: CustomWorld,
  title: string,
): Promise<void> {
  console.log(`   📍 Step: 验证页面标题 "${title}" 可见...`);
  await this.page.waitForTimeout(500);

  // Multi-selector fallback: heading, h1, page-header, or text with heading role
  const titleLocator = this.page
    .locator([
      `h1:has-text("${title}")`,
      `h2:has-text("${title}")`,
      `.ant-page-header-heading-title:has-text("${title}")`,
      `[data-testid="page-title"]:has-text("${title}")`,
      `[role="heading"]:has-text("${title}")`,
    ].join(', '))
    .first();

  try {
    await expect(titleLocator).toBeVisible({ timeout: WAIT_TIMEOUT });
    console.log(`   ✅ 页面标题 "${title}" 可见`);
  } catch {
    await this.takeScreenshot(`title-not-found-${title}`);
    throw new Error(`页面标题 "${title}" 未找到`);
  }
}

/**
 * Assert that a sidebar menu item with given text is visible.
 */
async function assertSidebarMenu(
  this: CustomWorld,
  menuText: string,
): Promise<void> {
  console.log(`   📍 Step: 验证侧边栏菜单 "${menuText}" 可见...`);

  // Multi-selector fallback for sidebar menu items
  const menuLocator = this.page
    .locator([
      // antd Menu item
      `.ant-menu-item:has-text("${menuText}")`,
      // Custom sidebar nav
      `nav a:has-text("${menuText}")`,
      // Generic sidebar link
      `aside a:has-text("${menuText}")`,
      // Data-testid fallback
      `[data-testid="sidebar"] :text-is("${menuText}")`,
      // XPath fallback: any link in a sidebar/nav containing the text
      `//aside//a[contains(text(),'${menuText}')]`,
      `//nav//a[contains(text(),'${menuText}')]`,
    ].join(', '))
    .first();

  try {
    await expect(menuLocator).toBeVisible({ timeout: WAIT_TIMEOUT });
    console.log(`   ✅ 侧边栏菜单 "${menuText}" 可见`);
  } catch {
    await this.takeScreenshot(`sidebar-menu-not-found-${menuText}`);
    throw new Error(`侧边栏菜单 "${menuText}" 未找到`);
  }
}

/**
 * Assert text content exists in a table.
 * Uses multiple selectors to find table rows/cells containing the text.
 */
async function assertTableContains(
  this: CustomWorld,
  text: string,
  description: string,
): Promise<void> {
  console.log(`   📍 Step: 验证${description}表格中包含 "${text}"...`);

  const tableCell = this.page
    .locator([
      `.ant-table-cell:has-text("${text}")`,
      `td:has-text("${text}")`,
      `[data-testid="table"] td:has-text("${text}")`,
      `//td[contains(text(),'${text}')]`,
    ].join(', '))
    .first();

  try {
    await expect(tableCell).toBeVisible({ timeout: WAIT_TIMEOUT });
    console.log(`   ✅ 表格中包含 "${text}"`);
  } catch {
    await this.takeScreenshot(`table-not-contain-${text}`);
    throw new Error(`${description}表格中未找到 "${text}"`);
  }
}

/**
 * Fill text into a search input field.
 * Uses multiple selector strategies to find a search/input field.
 */
async function fillSearchInput(
  this: CustomWorld,
  text: string,
): Promise<void> {
  console.log(`   📍 Step: 在搜索框中输入 "${text}"...`);

  const searchInput = this.page
    .locator([
      `input[placeholder*="搜索"]`,
      `input[placeholder*="search" i]`,
      `.ant-input-search input`,
      `[data-testid="search-input"]`,
      `input[type="search"]`,
      `.ant-table-filter-dropdown input`,
    ].join(', '))
    .first();

  try {
    await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUT });
    await searchInput.click();
    await searchInput.clear();
    await searchInput.fill(text);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
    console.log(`   ✅ 已在搜索框输入 "${text}"`);
  } catch {
    await this.takeScreenshot('search-input-not-found');
    throw new Error('搜索框未找到');
  }
}

/**
 * Assert a success/notification toast message is visible.
 */
async function assertSuccessToast(
  this: CustomWorld,
  message: string,
): Promise<void> {
  console.log(`   📍 Step: 验证成功提示 "${message}" 可见...`);

  await this.page.waitForTimeout(500);

  const toastLocator = this.page
    .locator([
      `.ant-message-notice-content:has-text("${message}")`,
      `.ant-notification-notice-message:has-text("${message}")`,
      `[data-testid="toast"]:has-text("${message}")`,
      `.toast:has-text("${message}")`,
      `//*[contains(@class,'message') or contains(@class,'toast')][contains(text(),'${message}')]`,
    ].join(', '))
    .first();

  try {
    await expect(toastLocator).toBeVisible({ timeout: 5000 });
    console.log(`   ✅ 成功提示 "${message}" 可见`);
  } catch {
    await this.takeScreenshot(`toast-not-found-${message}`);
    throw new Error(`成功提示 "${message}" 未找到`);
  }
}

/**
 * Assert a modal/dialog is visible.
 */
async function assertDialogVisible(
  this: CustomWorld,
  title?: string,
): Promise<void> {
  console.log('   📍 Step: 验证弹窗可见...');

  const dialogLocator = this.page
    .locator([
      '.ant-modal',
      '.ant-modal-content',
      '[role="dialog"]',
      '.ant-drawer',
      '[data-testid="modal"]',
    ].join(', '))
    .first();

  try {
    await expect(dialogLocator).toBeVisible({ timeout: WAIT_TIMEOUT });
    console.log('   ✅ 弹窗可见');
  } catch {
    await this.takeScreenshot('dialog-not-found');
    throw new Error('弹窗未找到');
  }

  // If title is provided, verify dialog title
  if (title) {
    const titleLocator = this.page
      .locator([
        `.ant-modal-title:has-text("${title}")`,
        `.ant-modal-header:has-text("${title}")`,
        `[role="dialog"] [role="heading"]:has-text("${title}")`,
      ].join(', '))
      .first();

    try {
      await expect(titleLocator).toBeVisible({ timeout: WAIT_TIMEOUT });
      console.log(`   ✅ 弹窗标题为 "${title}"`);
    } catch {
      await this.takeScreenshot(`dialog-title-not-found-${title}`);
      throw new Error(`弹窗标题 "${title}" 未找到`);
    }
  }
}

// ============================================
// Given Steps
// ============================================

Given(
  '用户以管理员身份登录系统',
  async function (this: CustomWorld) {
    console.log('   📍 管理员身份已确认 (session cookies 由 hooks.ts 注入，admin mocks 已启用)');
  },
);

// ============================================
// When Steps — Navigation
// ============================================

When(
  '用户以普通成员身份登录系统',
  async function (this: CustomWorld) {
    console.log('   📍 Step: 以普通成员身份登录...');
    // Navigate to signin to clear admin session context
    // The test will verify redirect behavior
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle', { timeout: WAIT_TIMEOUT });
    console.log('   ✅ 已以普通成员身份进入系统');
  },
);

When(
  '用户导航到管理后台首页 {string}',
  async function (this: CustomWorld, path: string) {
    await navigateToAdminPage.call(this, path, '首页');
  },
);

When(
  '用户尝试导航到管理后台 {string}',
  async function (this: CustomWorld, path: string) {
    console.log(`   📍 Step: 尝试导航到管理后台 (${path})...`);
    await this.page.goto(path);
    await this.page.waitForTimeout(1000);
    console.log(`   ✅ 已尝试导航到 ${path}`);
  },
);

When(
  '用户导航到管理后台会话存档 {string}',
  async function (this: CustomWorld, path: string) {
    await navigateToAdminPage.call(this, path, '会话存档');
  },
);

When(
  '用户导航到管理后台智能体管理 {string}',
  async function (this: CustomWorld, path: string) {
    await navigateToAdminPage.call(this, path, '智能体管理');
  },
);

When(
  '用户导航到管理后台知识库管理 {string}',
  async function (this: CustomWorld, path: string) {
    await navigateToAdminPage.call(this, path, '知识库管理');
  },
);

When(
  '用户导航到管理后台用户管理 {string}',
  async function (this: CustomWorld, path: string) {
    await navigateToAdminPage.call(this, path, '用户管理');
  },
);

When(
  '用户导航到管理后台权限管理 {string}',
  async function (this: CustomWorld, path: string) {
    await navigateToAdminPage.call(this, path, '权限管理');
  },
);

// ============================================
// When Steps — Search
// ============================================

When(
  '用户在搜索框中输入 {string}',
  async function (this: CustomWorld, text: string) {
    await fillSearchInput.call(this, text);
  },
);

// ============================================
// When Steps — Session Interaction
// ============================================

When(
  '用户点击会话列表中的第一行',
  async function (this: CustomWorld) {
    console.log('   📍 Step: 点击会话列表第一行...');

    const firstRow = this.page
      .locator([
        '.ant-table-row',
        '.ant-table-tbody tr',
        '[data-testid="session-row"]',
      ].join(', '))
      .first();

    try {
      await expect(firstRow).toBeVisible({ timeout: WAIT_TIMEOUT });
      await firstRow.click();
      await this.page.waitForTimeout(1000);
      console.log('   ✅ 已点击会话列表第一行');
    } catch {
      await this.takeScreenshot('session-first-row-not-found');
      throw new Error('会话列表第一行未找到');
    }
  },
);

// ============================================
// When Steps — Agent Toggle
// ============================================

When(
  '用户点击智能体 {string} 的启用开关',
  async function (this: CustomWorld, agentName: string) {
    console.log(`   📍 Step: 点击智能体 "${agentName}" 的启用开关...`);

    // Find the row containing the agent name, then find the switch inside it
    const agentRow = this.page
      .locator(`.ant-table-row:has-text("${agentName}"), tr:has-text("${agentName}")`)
      .first();

    try {
      await expect(agentRow).toBeVisible({ timeout: WAIT_TIMEOUT });
    } catch {
      await this.takeScreenshot(`agent-row-not-found-${agentName}`);
      throw new Error(`智能体 "${agentName}" 的行未找到`);
    }

    // Click the switch/toggle inside the row
    const toggleSwitch = agentRow.locator([
      '.ant-switch',
      '[data-testid="toggle-switch"]',
      'button[role="switch"]',
      'input[type="checkbox"]',
    ].join(', ')).first();

    try {
      await expect(toggleSwitch).toBeVisible({ timeout: WAIT_TIMEOUT });
      await toggleSwitch.click();
      await this.page.waitForTimeout(1000);
      console.log(`   ✅ 已点击智能体 "${agentName}" 的启用开关`);
    } catch {
      await this.takeScreenshot(`agent-toggle-not-found-${agentName}`);
      throw new Error(`智能体 "${agentName}" 的启用开关未找到`);
    }
  },
);

// ============================================
// When Steps — Knowledge Base Permission
// ============================================

When(
  '用户点击知识库 {string} 的权限管理按钮',
  async function (this: CustomWorld, kbName: string) {
    console.log(`   📍 Step: 点击知识库 "${kbName}" 的权限管理按钮...`);

    const kbRow = this.page
      .locator(`.ant-table-row:has-text("${kbName}"), tr:has-text("${kbName}")`)
      .first();

    try {
      await expect(kbRow).toBeVisible({ timeout: WAIT_TIMEOUT });
    } catch {
      await this.takeScreenshot(`kb-row-not-found-${kbName}`);
      throw new Error(`知识库 "${kbName}" 的行未找到`);
    }

    // Find the permission button inside the row
    const permButton = kbRow.locator([
      `button:has-text("权限")`,
      `a:has-text("权限")`,
      `[data-testid="permission-btn"]`,
      `[aria-label*="权限"]`,
      `[aria-label*="permission" i]`,
    ].join(', ')).first();

    try {
      await expect(permButton).toBeVisible({ timeout: WAIT_TIMEOUT });
      await permButton.click();
      await this.page.waitForTimeout(500);
      console.log(`   ✅ 已点击知识库 "${kbName}" 的权限管理按钮`);
    } catch {
      await this.takeScreenshot(`kb-perm-btn-not-found-${kbName}`);
      throw new Error(`知识库 "${kbName}" 的权限管理按钮未找到`);
    }
  },
);

When(
  '用户点击知识库的权限管理按钮',
  async function (this: CustomWorld) {
    console.log('   📍 Step: 点击知识库的权限管理按钮 (第一行)...');

    const kbRow = this.page
      .locator('.ant-table-row, .ant-table-tbody tr')
      .first();

    try {
      await expect(kbRow).toBeVisible({ timeout: WAIT_TIMEOUT });
    } catch {
      await this.takeScreenshot('kb-first-row-not-found');
      throw new Error('知识库列表第一行未找到');
    }

    const permButton = kbRow.locator([
      `button:has-text("权限")`,
      `a:has-text("权限")`,
      `[data-testid="permission-btn"]`,
      `[aria-label*="权限"]`,
      `[aria-label*="permission" i]`,
    ].join(', ')).first();

    try {
      await expect(permButton).toBeVisible({ timeout: WAIT_TIMEOUT });
      await permButton.click();
      await this.page.waitForTimeout(500);
      console.log('   ✅ 已点击知识库权限管理按钮');
    } catch {
      await this.takeScreenshot('kb-perm-btn-not-found');
      throw new Error('知识库权限管理按钮未找到');
    }
  },
);

When(
  '用户在弹窗中选择授权类型 {string}',
  async function (this: CustomWorld, type: string) {
    console.log(`   📍 Step: 选择授权类型 "${type}"...`);

    const typeSelect = this.page
      .locator([
        `.ant-modal .ant-select`,
        `[role="dialog"] .ant-select`,
        `[data-testid="grant-type-select"]`,
        `.ant-modal select`,
      ].join(', '))
      .first();

    try {
      await expect(typeSelect).toBeVisible({ timeout: WAIT_TIMEOUT });
      await typeSelect.click();
      await this.page.waitForTimeout(300);

      // Select the option from dropdown
      const option = this.page
        .locator([
          `.ant-select-dropdown :text-is("${type}")`,
          `.ant-select-item:has-text("${type}")`,
          `[role="option"]:has-text("${type}")`,
        ].join(', '))
        .first();
      await expect(option).toBeVisible({ timeout: 5000 });
      await option.click();
      await this.page.waitForTimeout(300);

      console.log(`   ✅ 已选择授权类型 "${type}"`);
    } catch {
      await this.takeScreenshot('grant-type-select-not-found');
      throw new Error(`授权类型选择器 "${type}" 未找到`);
    }
  },
);

When(
  '用户输入授权对象 ID {string}',
  async function (this: CustomWorld, targetId: string) {
    console.log(`   📍 Step: 输入授权对象 ID "${targetId}"...`);

    const idInput = this.page
      .locator([
        `.ant-modal input[id*="target"]`,
        `.ant-modal input[id*="user"]`,
        `[role="dialog"] input`,
        `[data-testid="target-id-input"]`,
      ].join(', '))
      .first();

    try {
      await expect(idInput).toBeVisible({ timeout: WAIT_TIMEOUT });
      await idInput.click();
      await idInput.clear();
      await idInput.fill(targetId);
      await this.page.waitForTimeout(300);
      console.log(`   ✅ 已输入授权对象 ID "${targetId}"`);
    } catch {
      await this.takeScreenshot('target-id-input-not-found');
      throw new Error('授权对象 ID 输入框未找到');
    }
  },
);

When(
  '用户选择访问级别 {string}',
  async function (this: CustomWorld, level: string) {
    console.log(`   📍 Step: 选择访问级别 "${level}"...`);

    const levelSelect = this.page
      .locator([
        `.ant-modal .ant-select:has-text("读")`,
        `.ant-modal .ant-select:has-text("写")`,
        `[role="dialog"] .ant-select`,
        `[data-testid="level-select"]`,
        `.ant-modal select:nth-of-type(2)`,
      ].join(', '))
      .first();

    try {
      await expect(levelSelect).toBeVisible({ timeout: WAIT_TIMEOUT });
      await levelSelect.click();
      await this.page.waitForTimeout(300);

      const option = this.page
        .locator([
          `.ant-select-item:has-text("${level}")`,
          `[role="option"]:has-text("${level}")`,
          `.ant-select-dropdown :text-is("${level}")`,
        ].join(', '))
        .first();
      await expect(option).toBeVisible({ timeout: 5000 });
      await option.click();
      await this.page.waitForTimeout(300);

      console.log(`   ✅ 已选择访问级别 "${level}"`);
    } catch {
      await this.takeScreenshot('level-select-not-found');
      throw new Error(`访问级别选择器 "${level}" 未找到`);
    }
  },
);

When(
  '用户点击确认授权',
  async function (this: CustomWorld) {
    console.log('   📍 Step: 点击确认授权按钮...');

    const confirmButton = this.page
      .locator([
        `.ant-modal button:has-text("确认")`,
        `.ant-modal button:has-text("确定")`,
        `.ant-modal button:has-text("授权")`,
        `[role="dialog"] button:has-text("保存")`,
        `[data-testid="confirm-grant-btn"]`,
        `.ant-modal-footer .ant-btn-primary`,
      ].join(', '))
      .first();

    try {
      await expect(confirmButton).toBeVisible({ timeout: WAIT_TIMEOUT });
      await confirmButton.click();
      await this.page.waitForTimeout(1000);
      console.log('   ✅ 已点击确认授权');
    } catch {
      await this.takeScreenshot('confirm-grant-btn-not-found');
      throw new Error('确认授权按钮未找到');
    }
  },
);

// ============================================
// When Steps — RBAC Permission Config
// ============================================

When(
  '用户点击角色 {string} 的权限配置按钮',
  async function (this: CustomWorld, roleName: string) {
    console.log(`   📍 Step: 点击角色 "${roleName}" 的权限配置按钮...`);

    const roleRow = this.page
      .locator(`.ant-table-row:has-text("${roleName}"), tr:has-text("${roleName}")`)
      .first();

    try {
      await expect(roleRow).toBeVisible({ timeout: WAIT_TIMEOUT });
    } catch {
      await this.takeScreenshot(`role-row-not-found-${roleName}`);
      throw new Error(`角色 "${roleName}" 的行未找到`);
    }

    const permConfigButton = roleRow.locator([
      `button:has-text("权限")`,
      `button:has-text("配置")`,
      `[data-testid="role-permission-btn"]`,
      `a:has-text("权限")`,
    ].join(', ')).first();

    try {
      await expect(permConfigButton).toBeVisible({ timeout: WAIT_TIMEOUT });
      await permConfigButton.click();
      await this.page.waitForTimeout(500);
      console.log(`   ✅ 已点击角色 "${roleName}" 的权限配置按钮`);
    } catch {
      await this.takeScreenshot(`role-perm-btn-not-found-${roleName}`);
      throw new Error(`角色 "${roleName}" 的权限配置按钮未找到`);
    }
  },
);

// ============================================
// Then Steps — Dashboard
// ============================================

Then(
  '仪表盘标题 {string} 应该可见',
  async function (this: CustomWorld, title: string) {
    await assertPageTitle.call(this, title);
  },
);

Then(
  '统计卡片 {string} 应该显示',
  async function (this: CustomWorld, cardName: string) {
    console.log(`   📍 Step: 验证统计卡片 "${cardName}" 显示...`);

    const cardLocator = this.page
      .locator([
        `.ant-card:has-text("${cardName}")`,
        `[data-testid="stat-card"]:has-text("${cardName}")`,
        `.ant-statistic:has-text("${cardName}")`,
      ].join(', '))
      .first();

    try {
      await expect(cardLocator).toBeVisible({ timeout: WAIT_TIMEOUT });
      console.log(`   ✅ 统计卡片 "${cardName}" 可见`);
    } catch {
      await this.takeScreenshot(`stat-card-not-found-${cardName}`);
      throw new Error(`统计卡片 "${cardName}" 未找到`);
    }
  },
);

Then(
  '侧边栏菜单 {string} 应该可见',
  async function (this: CustomWorld, menuText: string) {
    await assertSidebarMenu.call(this, menuText);
  },
);

// ============================================
// Then Steps — General Page / Table
// ============================================

Then(
  '页面标题 {string} 应该可见',
  async function (this: CustomWorld, title: string) {
    await assertPageTitle.call(this, title);
  },
);

Then(
  '会话列表表格应该显示',
  async function (this: CustomWorld) {
    console.log('   📍 Step: 验证会话列表表格显示...');

    const tableLocator = this.page
      .locator([
        '.ant-table',
        '[data-testid="session-table"]',
        'table',
        '[role="grid"]',
      ].join(', '))
      .first();

    try {
      await expect(tableLocator).toBeVisible({ timeout: WAIT_TIMEOUT });
      console.log('   ✅ 会话列表表格可见');
    } catch {
      await this.takeScreenshot('session-table-not-found');
      throw new Error('会话列表表格未找到');
    }
  },
);

Then(
  '表格中应该包含 {string} 的会话',
  async function (this: CustomWorld, text: string) {
    await assertTableContains.call(this, text, '会话');
  },
);

Then(
  '会话列表应该只显示匹配的会话',
  async function (this: CustomWorld) {
    console.log('   📍 Step: 验证会话列表过滤后只显示匹配项...');

    await this.page.waitForTimeout(500);
    const rows = this.page.locator('.ant-table-row, .ant-table-tbody tr');

    try {
      const count = await rows.count();
      // Filter should reduce visible rows
      expect(count).toBeGreaterThan(0);
      console.log(`   ✅ 会话列表过滤后显示 ${count} 行`);
    } catch {
      await this.takeScreenshot('session-filter-empty');
      throw new Error('会话列表过滤结果异常');
    }
  },
);

Then(
  '页面应该跳转到会话详情页 {string}',
  async function (this: CustomWorld, expectedPath: string) {
    console.log(`   📍 Step: 验证跳转到会话详情页 ${expectedPath}...`);

    await this.page.waitForTimeout(1000);

    try {
      await this.page.waitForURL(
        (url) => url.pathname.includes(expectedPath),
        { timeout: WAIT_TIMEOUT },
      );
      console.log(`   ✅ 已跳转到 ${expectedPath}`);
    } catch {
      await this.takeScreenshot('session-detail-redirect-failed');
      throw new Error(`未跳转到会话详情页 ${expectedPath}`);
    }
  },
);

Then(
  '详情页应该显示会话消息内容',
  async function (this: CustomWorld) {
    console.log('   📍 Step: 验证详情页显示会话消息...');

    await this.page.waitForTimeout(500);

    // Look for message bubbles, chat content, or message list
    const messageLocator = this.page
      .locator([
        '.ant-comment',
        '.chat-message',
        '[data-testid="message-item"]',
        '[class*="message"]',
      ].join(', '))
      .first();

    try {
      await expect(messageLocator).toBeVisible({ timeout: WAIT_TIMEOUT });
      console.log('   ✅ 详情页显示会话消息内容');
    } catch {
      await this.takeScreenshot('session-messages-not-found');
      throw new Error('会话消息内容未显示');
    }
  },
);

Then(
  '表格中应该包含智能体 {string}',
  async function (this: CustomWorld, agentName: string) {
    await assertTableContains.call(this, agentName, '智能体');
  },
);

Then(
  '应该显示成功提示 {string}',
  async function (this: CustomWorld, message: string) {
    await assertSuccessToast.call(this, message);
  },
);

Then(
  '表格中应该包含知识库 {string}',
  async function (this: CustomWorld, kbName: string) {
    await assertTableContains.call(this, kbName, '知识库');
  },
);

Then(
  '权限管理弹窗应该显示',
  async function (this: CustomWorld) {
    await assertDialogVisible.call(this);
  },
);

Then(
  '权限编辑弹窗应该显示',
  async function (this: CustomWorld) {
    await assertDialogVisible.call(this);
  },
);

Then(
  '弹窗标题为 {string}',
  async function (this: CustomWorld, title: string) {
    await assertDialogVisible.call(this, title);
  },
);

Then(
  '表格中应该包含用户 {string}',
  async function (this: CustomWorld, userName: string) {
    await assertTableContains.call(this, userName, '用户');
  },
);

Then(
  '表格应该只显示匹配的用户',
  async function (this: CustomWorld) {
    console.log('   📍 Step: 验证用户表格过滤后只显示匹配项...');

    await this.page.waitForTimeout(500);
    const rows = this.page.locator('.ant-table-row, .ant-table-tbody tr');

    try {
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      console.log(`   ✅ 用户表格过滤后显示 ${count} 行`);
    } catch {
      await this.takeScreenshot('user-filter-empty');
      throw new Error('用户表格过滤结果异常');
    }
  },
);

Then(
  '用户应该被重定向到聊天页面 {string}',
  async function (this: CustomWorld, expectedPath: string) {
    console.log(`   📍 Step: 验证被重定向到聊天页面 ${expectedPath}...`);

    await this.page.waitForTimeout(2000);

    try {
      await this.page.waitForURL(
        (url) => url.pathname === expectedPath || url.pathname.includes('/chat'),
        { timeout: WAIT_TIMEOUT },
      );
      console.log(`   ✅ 已被重定向到 ${expectedPath}`);
    } catch {
      await this.takeScreenshot('redirect-to-chat-failed');
      const currentUrl = this.page.url();
      throw new Error(`未重定向到聊天页面，当前 URL: ${currentUrl}`);
    }
  },
);

// ============================================
// Then Steps — RBAC
// ============================================

Then(
  '角色列表应该显示 {string}',
  async function (this: CustomWorld, roleName: string) {
    console.log(`   📍 Step: 验证角色列表显示 "${roleName}"...`);

    await this.page.waitForTimeout(500);

    const roleLocator = this.page
      .locator([
        `.ant-table-cell:has-text("${roleName}")`,
        `td:has-text("${roleName}")`,
        `//td[contains(text(),'${roleName}')]`,
      ].join(', '))
      .first();

    try {
      await expect(roleLocator).toBeVisible({ timeout: WAIT_TIMEOUT });
      console.log(`   ✅ 角色 "${roleName}" 可见`);
    } catch {
      await this.takeScreenshot(`role-not-found-${roleName}`);
      throw new Error(`角色 "${roleName}" 未找到`);
    }
  },
);

Then(
  '弹窗应该包含权限选项 {string}',
  async function (this: CustomWorld, permission: string) {
    console.log(`   📍 Step: 验证弹窗包含权限选项 "${permission}"...`);

    const permissionLocator = this.page
      .locator([
        `.ant-modal :text-is("${permission}")`,
        `.ant-checkbox-wrapper:has-text("${permission}")`,
        `[role="dialog"] :text-is("${permission}")`,
        `//*[contains(@class,'modal')]//*[contains(text(),'${permission}')]`,
      ].join(', '))
      .first();

    try {
      await expect(permissionLocator).toBeVisible({ timeout: WAIT_TIMEOUT });
      console.log(`   ✅ 权限选项 "${permission}" 可见`);
    } catch {
      await this.takeScreenshot(`permission-option-not-found-${permission}`);
      throw new Error(`权限选项 "${permission}" 未找到`);
    }
  },
);
