import { After, AfterAll, Before, BeforeAll, setDefaultTimeout, Status } from '@cucumber/cucumber';

import { createTestSession, seedTestUser } from '../support/seedTestUser';
import { startWebServer, stopWebServer } from '../support/webServer';
import type { CustomWorld } from '../support/world';
import { mockManager } from '../mocks';
import { llmMockManager, presetResponses } from '../mocks/llm';

process.env['E2E'] = '1';
// Set default timeout for all steps to 30 seconds
setDefaultTimeout(30_000);

// Store base URL and cached session token
let baseUrl: string;
let sessionToken: string | null = null;

BeforeAll({ timeout: 600_000 }, async function () {
  console.log('🚀 Starting E2E test suite...');

  const PORT = process.env.PORT ? Number(process.env.PORT) : 3006;
  baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;

  console.log(`Base URL: ${baseUrl}`);

  // Seed test user and create session via DB (bypasses BetterAuth UI login)
  await seedTestUser();
  sessionToken = await createTestSession();

  if (!sessionToken) {
    console.log('⚠️  Could not create DB session — tests requiring auth will fail');
  } else {
    console.log('✅ DB session created successfully');
  }

  // Start web server if not using external BASE_URL
  if (!process.env.BASE_URL) {
    await startWebServer({
      command: `bunx next start -p ${PORT}`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    });
  }
});

Before(async function (this: CustomWorld, { pickle }) {
  await this.init();

  const testId = pickle.tags.find(
    (tag) =>
      tag.name.startsWith('@COMMUNITY-') ||
      tag.name.startsWith('@AGENT-') ||
      tag.name.startsWith('@HOME-') ||
      tag.name.startsWith('@PAGE-') ||
      tag.name.startsWith('@ROUTES-') ||
      tag.name.startsWith('@ADMIN-') ||
      tag.name.startsWith('@NEWAPI-'),
  );
  console.log(`\n📝 Running: ${pickle.name}${testId ? ` (${testId.name.replace('@', '')})` : ''}`);

  // Setup Admin API mocks when @admin tag is present
  const isAdminTest = pickle.tags.some((tag) => tag.name.startsWith('@admin'));
  if (isAdminTest) {
    await mockManager.setup(this.page);
    console.log('   🔧 Admin mocks enabled');
  }

  // Setup NewAPI LLM mocks when @newapi tag is present
  const isNewapiTest = pickle.tags.some((tag) => tag.name.startsWith('@newapi'));
  if (isNewapiTest || isAdminTest) {
    // LLM Mock + tRPC mocks
    await mockManager.setup(this.page);
    if (isNewapiTest) {
      await llmMockManager.setup(this.page);
      // 预设 NewAPI 回复
      llmMockManager.setResponse('你好', presetResponses.greeting);
      llmMockManager.setResponse(
        '你好，请介绍一下自己',
        '你好！我是小宗师AI，企业内部的智能助手。我由 NewAPI 中转站提供技术支持，可以接入多种大模型为您服务。',
      );
      llmMockManager.setResponse('帮我写一段代码', presetResponses.codeHelp);
      console.log('   🤖 NewAPI LLM mocks enabled');
    }
  }

  // Set cached session token cookie to skip login
  if (sessionToken) {
    await this.browserContext.addCookies([
      {
        domain: new URL(baseUrl).hostname,
        httpOnly: true,
        name: 'better-auth.session_token',
        path: '/',
        sameSite: 'Lax' as const,
        secure: false,
        value: sessionToken,
      },
    ]);
    console.log('🍪 Session cookies restored');
  }
});

After(async function (this: CustomWorld, { pickle, result }) {
  const testId = pickle.tags
    .find(
      (tag) =>
        tag.name.startsWith('@COMMUNITY-') ||
        tag.name.startsWith('@AGENT-') ||
        tag.name.startsWith('@HOME-') ||
        tag.name.startsWith('@PAGE-') ||
        tag.name.startsWith('@ROUTES-') ||
        tag.name.startsWith('@ADMIN-') ||
        tag.name.startsWith('@NEWAPI-'),
    )
    ?.name.replace('@', '');

  if (result?.status === Status.FAILED) {
    const screenshot = await this.takeScreenshot(`${testId || 'failure'}-${Date.now()}`);
    this.attach(screenshot, 'image/png');

    const html = await this.page.content();
    this.attach(html, 'text/html');

    if (this.testContext.jsErrors.length > 0) {
      const errors = this.testContext.jsErrors.map((e) => e.message).join('\n');
      this.attach(`JavaScript Errors:\n${errors}`, 'text/plain');
    }

    console.log(`❌ Failed: ${pickle.name}`);
    if (result.message) {
      console.log(`   Error: ${result.message}`);
    }
  } else if (result?.status === Status.PASSED) {
    console.log(`✅ Passed: ${pickle.name}`);
  }

  await this.cleanup();
});

AfterAll(async function () {
  console.log('\n🏁 Test suite completed');

  // Stop web server if we started it
  if (!process.env.BASE_URL && process.env.CI) {
    await stopWebServer();
  }
});
