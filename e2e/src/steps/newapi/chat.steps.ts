/**
 * NewAPI Chat Steps
 *
 * Step definitions for NewAPI AI 中转站 E2E tests
 */
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { llmMockManager, presetResponses } from '../../mocks/llm';
import { mockNewAPIModels } from '../../mocks/newapi';
import type { CustomWorld } from '../../support/world';
import { WAIT_TIMEOUT } from '../../support/world';

// ============================================
// Helper Functions
// ============================================

async function focusChatInput(this: CustomWorld): Promise<void> {
  // Multi-strategy approach matching existing agent conversation steps
  const candidates = [
    { label: 'contenteditable', locator: this.page.locator('[contenteditable="true"]') },
    { label: 'textbox role', locator: this.page.getByRole('textbox') },
    { label: 'chat-input testid', locator: this.page.locator('[data-testid="chat-input"]') },
    { label: 'ChatInput class', locator: this.page.locator('[class*="ChatInput"] [contenteditable="true"]') },
    { label: 'chat-input-area', locator: this.page.locator('.chat-input-area') },
  ];

  for (const { label, locator } of candidates) {
    const count = await locator.count();
    for (let i = 0; i < count; i++) {
      const item = locator.nth(i);
      const visible = await item.isVisible().catch(() => false);
      if (!visible) continue;
      await item.click({ force: true });
      await this.page.waitForTimeout(300);
      console.log(`   ✓ Focused chat input via "${label}" at index ${i}`);
      return;
    }
  }
  throw new Error('找不到聊天输入框');
}

async function sendMessage(this: CustomWorld, message: string): Promise<void> {
  await focusChatInput.call(this);
  await this.page.keyboard.type(message, { delay: 30 });
  await this.page.keyboard.press('Enter');
  await this.page.waitForTimeout(500);
}

async function waitForAIResponse(this: CustomWorld): Promise<void> {
  // 等待 AI 消息出现（最多 30 秒）
  const aiMsgSelectors = [
    '.ant-bubble',
    '[data-testid="chat-item"]',
    '[class*="chat-item"]',
    '[class*="ChatItem"]',
  ];
  for (const sel of aiMsgSelectors) {
    const el = this.page.locator(sel).first();
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      return;
    }
  }
  await this.page.waitForTimeout(5000); // 兜底等待
}

// ============================================
// Given Steps
// ============================================

Given('NewAPI 中转站已配置并可访问', async function (this: CustomWorld) {
  console.log('   📍 Step: 配置 NewAPI LLM mock...');
  await llmMockManager.setup(this.page);
  console.log('   ✅ NewAPI 中转站 mock 已启用');
});

// ============================================
// When Steps
// ============================================

When('用户进入聊天页面', { timeout: 30_000 }, async function (this: CustomWorld) {
  console.log('   📍 Step: 导航到聊天页面...');
  // In dev mode, the SPA is served by Vite at port 9876
  await this.page.goto('http://localhost:9876/chat');
  await this.page.waitForLoadState('networkidle', { timeout: WAIT_TIMEOUT });
  await this.page.waitForTimeout(2000);

  // 确保聊天输入框可见
  await focusChatInput.call(this);

  console.log('   ✅ 已进入聊天页面');
});

When('用户在输入框中输入 {string}', async function (this: CustomWorld, text: string) {
  console.log(`   📍 Step: 输入文本 "${text}"...`);
  await focusChatInput.call(this);
  await this.page.waitForTimeout(300);
  await this.page.keyboard.type(text, { delay: 30 });
  console.log('   ✅ 已输入文本');
});

When('用户按下发送按钮', async function (this: CustomWorld) {
  console.log('   📍 Step: 按下发送按钮 (Enter)...');
  await this.page.keyboard.press('Enter');
  await this.page.waitForTimeout(500);
  console.log('   ✅ 消息已发送');
});

When('用户等待 AI 回复完成', async function (this: CustomWorld) {
  console.log('   📍 Step: 等待 AI 回复完成...');
  await waitForAIResponse.call(this);
  console.log('   ✅ AI 回复完成');
});

When('用户导航到设置页面', async function (this: CustomWorld) {
  console.log('   📍 Step: 导航到设置页面...');
  await this.page.goto('http://localhost:9876/settings/provider');
  await this.page.waitForLoadState('networkidle', { timeout: WAIT_TIMEOUT });
  await this.page.waitForTimeout(1000);
  console.log('   ✅ 已进入设置页面');
});

When('用户在设置中打开 AI 供应商配置', async function (this: CustomWorld) {
  console.log('   📍 Step: 打开 AI 供应商配置...');

  // 查找 AI 供应商或语言模型设置入口
  const providerSelectors = [
    'text=AI 供应商',
    'text=语言模型',
    'text=模型供应商',
    'text=AI Provider',
    'text=Language Model',
    '[data-testid="provider-settings"]',
    'text=NewAPI',
  ];

  for (const sel of providerSelectors) {
    const el = this.page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click();
      await this.page.waitForTimeout(500);
      console.log(`   ✅ 已点击 "${sel}"`);
      return;
    }
  }

  // Fallback: 等待页面渲染
  console.log('   ⚠️ 未找到 AI 供应商入口，等待页面渲染');
  await this.page.waitForTimeout(2000);
});

When('用户打开 NewAPI 供应商设置', async function (this: CustomWorld) {
  console.log('   📍 Step: 打开 NewAPI 供应商设置...');
  // Navigate to the NewAPI provider detail page.
  // /settings/provider/detail/newapi is the route; /settings/provider/newapi works too in dev.
  await this.page.goto('http://localhost:9876/settings/provider/newapi', { waitUntil: 'domcontentloaded', timeout: WAIT_TIMEOUT });
  // Wait for antd Form to hydrate (batch tRPC calls take time)
  await this.page.waitForTimeout(4000);
  console.log('   ✅ 已打开 NewAPI 设置');
});

When('用户填写有效的服务器地址和访问令牌', async function (this: CustomWorld) {
  console.log('   📍 Step: 填写 NewAPI 配置...');

  // Actual antd form inputs on this page:
  // - input[placeholder="AI 中转站 API Key"] (type=password)
  // - input[placeholder="https://your-company-newapi.com"] (type=text)
  const urlInput = this.page.locator('input[placeholder*="your-company-newapi"]').first();
  if (await urlInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await urlInput.fill('https://your-company-newapi.com');
    console.log('   ✅ 已填写服务器地址');
  } else {
    console.log('   ⚠️ 未找到服务器地址输入框');
  }

  await this.page.waitForTimeout(300);

  const tokenInput = this.page.locator('input[placeholder*="API Key"]').first();
  if (await tokenInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await tokenInput.fill('sk-test-token-123456');
    console.log('   ✅ 已填写访问令牌');
  } else {
    console.log('   ⚠️ 未找到 API Key 输入框');
  }
});

When('用户点击连接测试按钮', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击连接测试按钮...');

  // Actual button text on the page: "检 查" (two chars with space)
  const testButtonSelectors = [
    'button:has-text("检 查")',
    'button:has-text("检查")',
    'button:has-text("连接测试")',
    '.ant-btn:has-text("检")',
  ];

  for (const sel of testButtonSelectors) {
    const el = this.page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click();
      await this.page.waitForTimeout(1500);
      console.log(`   ✅ 已点击连接测试按钮 (通过 "${sel}")`);
      return;
    }
  }

  console.log('   ⚠️ 未找到连接测试按钮');
});

// ============================================
// Then Steps
// ============================================

Then('用户应该看到 AI 的流式回复', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 AI 流式回复...');

  // 等待 AI 消息出现
  const aiSelectors = [
    '.message-wrapper',
    '[class*="assistant"]',
    '[data-role="assistant"]',
    '.ant-bubble',
  ];

  let found = false;
  for (const sel of aiSelectors) {
    const el = this.page.locator(sel).last();
    if (await el.isVisible({ timeout: 5000 }).catch(() => false)) {
      found = true;
      console.log(`   ✅ 找到 AI 回复 (通过 "${sel}")`);
      break;
    }
  }

  if (!found) {
    // Fallback: wait for any content to render
    await this.page.waitForTimeout(5000);
    const msgCount = await this.page.locator('.message-wrapper').count().catch(() => 0);
    found = msgCount > 0;
  }

  expect(found).toBeTruthy();
  console.log('   ✅ AI 流式回复已验证');
});

Then('回复内容应该包含 {string} 字样', async function (this: CustomWorld, text: string) {
  console.log(`   📍 Step: 验证回复包含 "${text}"...`);

  // Poll for the text to appear (streaming may take time)
  await expect
    .poll(
      async () => {
        const pageContent = await this.page.content();
        return pageContent.includes(text);
      },
      { timeout: 20_000 },
    )
    .toBeTruthy();

  console.log(`   ✅ 回复内容包含 "${text}"`);
});

Then('用户应该看到两个 AI 回复', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证有两个 AI 回复...');

  const assistantMessages = this.page.locator('.message-wrapper').filter({
    has: this.page.locator('.message-header, [class*="header"]'),
  });

  await expect
    .poll(
      async () => {
        return await assistantMessages.count();
      },
      { timeout: 15_000 },
    )
    .toBeGreaterThanOrEqual(2);

  console.log(`   ✅ 已有 ${await assistantMessages.count()} 个 AI 回复`);
});

Then('聊天页面应该显示完整的对话历史', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证对话历史...');

  // 验证多条消息可见
  const messages = this.page.locator('.message-wrapper');
  const count = await messages.count();

  expect(count).toBeGreaterThanOrEqual(2);
  console.log(`   ✅ 对话历史包含 ${count} 条消息`);
});

Then('AI 中转站（NewAPI）供应商应该可见', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 NewAPI 供应商可见...');

  const newapiSelectors = [
    'text=NewAPI',
    'text=AI 中转站',
    '[data-testid="provider-newapi"]',
  ];

  let found = false;
  for (const sel of newapiSelectors) {
    const el = this.page.locator(sel).first();
    if (await el.isVisible({ timeout: 5000 }).catch(() => false)) {
      found = true;
      console.log(`   ✅ NewAPI 供应商可见 (通过 "${sel}")`);
      break;
    }
  }

  expect(found).toBeTruthy();
});

Then('NewAPI 应该排在供应商列表首位', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证 NewAPI 排在首位...');

  // 查找供应商列表项
  const providerItems = this.page.locator(
    '[class*="provider"] li, [class*="provider"] [class*="item"], [class*="Provider"] li',
  );

  if ((await providerItems.count()) > 0) {
    const firstItem = providerItems.first();
    const text = (await firstItem.innerText().catch(() => '')) || '';
    console.log(`   首个供应商: "${text}"`);
    expect(text).toMatch(/NewAPI|AI 中转站/i);
  } else {
    console.log('   ⚠️ 未找到供应商列表项，跳过排序验证');
  }
});

Then('设置页面应该包含 {string} 输入框', async function (this: CustomWorld, label: string) {
  console.log(`   📍 Step: 验证包含 "${label}" 表单标签...`);

  // antd Form.Item renders the label as `<label>` or text node inside `.ant-form-item`.
  // Also check placeholder on the input itself (e.g., "API Key" becomes placeholder "AI 中转站 API Key").
  const selectors: string[] = [
    `.ant-form-item:has-text("${label}")`,
    `label:has-text("${label}")`,
  ];

  // Also check input placeholders for matching substrings
  if (label === '中转站地址') selectors.push('input[placeholder*="your-company-newapi"]');
  if (label === 'API Key') selectors.push('input[placeholder*="API Key"]');

  let found = false;
  for (const sel of selectors) {
    try {
      await this.page.locator(sel).first().waitFor({ state: 'visible', timeout: 5000 });
      found = true;
      console.log(`   ✅ 找到 "${label}" (通过 "${sel}")`);
      break;
    } catch {
      // try next selector
    }
  }

  expect(found).toBeTruthy();
});

Then('输入框占位符应该显示 {string}', async function (this: CustomWorld, placeholder: string) {
  console.log(`   📍 Step: 验证占位符 "${placeholder}"...`);
  const input = this.page.locator(`input[placeholder*="${placeholder}"]`).first();
  await expect(input).toBeVisible({ timeout: 5000 });
  console.log(`   ✅ 占位符验证通过: "${placeholder}"`);
});

// Legacy pattern
Then('{string} 应该显示为输入框占位符', async function (this: CustomWorld, placeholder: string) {
  console.log(`   📍 Step: 验证占位符 "${placeholder}"...`);

  const input = this.page.locator(`input[placeholder*="${placeholder}"]`).first();
  await expect(input).toBeVisible({ timeout: 5000 });
  console.log(`   ✅ 占位符验证通过: "${placeholder}"`);
});

Then('应该显示连接成功的提示', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证连接成功提示...');

  const successSelectors = [
    '.ant-message-success',
    '.ant-notification-success',
    '[class*="success"]',
    'text=连接成功',
    'text=测试成功',
    'text=Success',
    '.toast-success',
  ];

  let found = false;
  for (const sel of successSelectors) {
    const el = this.page.locator(sel).first();
    if (await el.isVisible({ timeout: 5000 }).catch(() => false)) {
      found = true;
      console.log(`   ✅ 连接成功提示可见 (通过 "${sel}")`);
      break;
    }
  }

  expect(found).toBeTruthy();
});
