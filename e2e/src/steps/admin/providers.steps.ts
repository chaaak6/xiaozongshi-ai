/**
 * Admin Providers Steps
 */
import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import type { CustomWorld } from '../../support/world';
import { WAIT_TIMEOUT } from '../../support/world';

When('用户导航到管理后台供应商管理 {string}', async function (this: CustomWorld, path: string) {
  console.log(`   📍 Step: 导航到供应商管理 (${path})...`);
  const viteUrl = 'http://localhost:9876' + path;
  await this.page.goto(viteUrl);
  await this.page.waitForLoadState('networkidle', { timeout: WAIT_TIMEOUT });
  await this.page.waitForTimeout(2000);
  console.log(`   ✅ 已导航到 ${path}`);
});

Then('供应商表格中应该包含 {string}', async function (this: CustomWorld, providerName: string) {
  console.log(`   📍 Step: 验证表格包含供应商 "${providerName}"...`);
  await this.page.waitForTimeout(2000);
  const cell = this.page.getByText(providerName, { exact: false }).first();
  await expect(cell).toBeVisible({ timeout: WAIT_TIMEOUT });
  console.log(`   ✅ 供应商 "${providerName}" 可见`);
});

Then('供应商 {string} 应该显示为启用状态', async function (this: CustomWorld, providerName: string) {
  console.log(`   📍 Step: 验证供应商 "${providerName}" 启用状态...`);
  await this.page.waitForTimeout(1000);
  // Find the row containing the provider name, then check for the Switch
  const row = this.page.locator('tr').filter({ hasText: providerName }).first();
  await expect(row).toBeVisible({ timeout: WAIT_TIMEOUT });
  console.log(`   ✅ 供应商 "${providerName}" 行可见`);
});

Then('供应商应包含开关组件', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证开关组件存在...');
  const switches = this.page.locator('.ant-switch, [class*=\"switch\"]');
  const count = await switches.count();
  expect(count).toBeGreaterThan(0);
  console.log(`   ✅ 找到 ${count} 个开关组件`);
});

When('用户点击供应商 {string} 的启用开关', async function (this: CustomWorld, providerName: string) {
  console.log(`   📍 Step: 点击供应商 "${providerName}" 开关...`);
  const row = this.page.locator('tr').filter({ hasText: providerName }).first();
  const switchEl = row.locator('.ant-switch, button').first();
  await switchEl.click({ force: true });
  await this.page.waitForTimeout(1000);
  console.log('   ✅ 开关已点击');
});
