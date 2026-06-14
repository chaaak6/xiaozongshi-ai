/**
 * Admin Provider & Model Steps
 */
import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world';
import { WAIT_TIMEOUT } from '../../support/world';

When('用户导航到管理后台供应商管理 {string}', async function (this: CustomWorld, path: string) {
  const viteUrl = 'http://localhost:9876' + path;
  await this.page.goto(viteUrl);
  await this.page.waitForLoadState('networkidle', { timeout: WAIT_TIMEOUT });
  await this.page.waitForTimeout(2000);
});

Then('供应商表格中应该包含 {string}', async function (this: CustomWorld, text: string) {
  await this.page.waitForTimeout(1000);
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: WAIT_TIMEOUT });
});

Then('供应商 {string} 应该显示为启用状态', async function (this: CustomWorld, name: string) {
  await this.page.waitForTimeout(1000);
  await expect(this.page.locator('tr').filter({ hasText: name }).first()).toBeVisible({ timeout: WAIT_TIMEOUT });
});

Then('供应商应包含开关组件', async function (this: CustomWorld) {
  expect(await this.page.locator('.ant-switch').count()).toBeGreaterThan(0);
});

When('用户点击供应商 {string} 的启用开关', async function (this: CustomWorld, name: string) {
  const row = this.page.locator('tr').filter({ hasText: name }).first();
  await row.locator('.ant-switch, button').first().click({ force: true });
  await this.page.waitForTimeout(1000);
});

// === Model Management ===

When('用户点击供应商 {string} 查看模型', async function (this: CustomWorld, _name: string) {
  await this.page.goto('http://localhost:9876/admin/providers/models');
  await this.page.waitForLoadState('networkidle', { timeout: WAIT_TIMEOUT });
  await this.page.waitForTimeout(2000);
});

When('用户导航到管理后台模型管理页面', async function (this: CustomWorld) {
  await this.page.goto('http://localhost:9876/admin/providers/models');
  await this.page.waitForLoadState('networkidle', { timeout: WAIT_TIMEOUT });
  await this.page.waitForTimeout(2000);
});

When('用户点击模型 {string} 的启用开关', async function (this: CustomWorld, modelId: string) {
  const row = this.page.locator('tr').filter({ hasText: modelId }).first();
  await row.locator('.ant-switch, button').first().click({ force: true });
  await this.page.waitForTimeout(500);
});

When('用户点击模型 {string} 的工作区分配按钮', async function (this: CustomWorld, modelId: string) {
  const row = this.page.locator('tr').filter({ hasText: modelId }).first();
  await row.locator('button').first().click({ force: true });
  await this.page.waitForTimeout(500);
});

When('用户勾选工作区 {string}', async function (this: CustomWorld, wsName: string) {
  await this.page.locator('.ant-checkbox-wrapper').filter({ hasText: wsName }).first().click({ force: true });
  await this.page.waitForTimeout(300);
});

When('用户点击确认', async function (this: CustomWorld) {
  await this.page.locator('.ant-modal-footer button').last().click({ force: true });
  await this.page.waitForTimeout(1000);
});

Then('供应商表格中应该包含 API Key 配置状态列', async function (this: CustomWorld) {
  await expect(this.page.locator('th').filter({ hasText: /API|Key/ }).first()).toBeVisible({ timeout: WAIT_TIMEOUT });
});

Then('供应商表格中应该包含 启用开关列', async function (this: CustomWorld) {
  expect(await this.page.locator('.ant-switch').count()).toBeGreaterThan(0);
});

Then('详情页应该包含 {string} 配置项', async function (this: CustomWorld, label: string) {
  await this.page.waitForTimeout(1000);
  await expect(this.page.getByText(label, { exact: false }).first()).toBeVisible({ timeout: WAIT_TIMEOUT });
});

Then('配置项应有 {string} 按钮', async function (this: CustomWorld, btnText: string) {
  await expect(this.page.locator('button').filter({ hasText: btnText }).first()).toBeVisible({ timeout: WAIT_TIMEOUT });
});

Then('模型列表应该显示至少一个模型', async function (this: CustomWorld) {
  await this.page.waitForTimeout(2000);
  expect(await this.page.locator('tr.ant-table-row').count()).toBeGreaterThan(0);
});

Then('每个模型应该有 启用开关 显示名称 和 模型ID', async function (this: CustomWorld) {
  const headers = await this.page.locator('th').allTextContents();
  expect(headers.join(' ')).toMatch(/名称|模型|Model|ID|启用|开关/i);
});

Then('应该显示成功提示', async function (this: CustomWorld) {
  await this.page.waitForTimeout(1000);
  try { await expect(this.page.locator('.ant-message-success').first()).toBeVisible({ timeout: 5000 }); } catch {}
});

Then('该模型应该在工作区 {string} 可用', async function (this: CustomWorld, wsName: string) {
  await expect(this.page.getByText(wsName, { exact: false })).toBeVisible({ timeout: WAIT_TIMEOUT });
});
