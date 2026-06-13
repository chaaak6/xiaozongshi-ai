// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { params } from './index';

describe('NewAPI RouterRuntime routers() 函数', () => {
  it('应该正确拼接 baseURL 和 OpenAI 路由', () => {
    const routes = params.routers({ apiKey: 'sk-test', baseURL: 'https://newapi.example.com' });

    const openaiRoute = routes.find((r: any) => r.apiType === 'openai');
    expect(openaiRoute?.options?.baseURL).toContain('newapi.example.com/v1');
  });

  it('应该去除用户输入 URL 中的 /v1 后缀然后重新拼接', () => {
    const routes = params.routers({ apiKey: 'sk-test', baseURL: 'https://newapi.example.com/v1' });

    const openaiRoute = routes.find((r: any) => r.apiType === 'openai');
    // 去掉 /v1 后重新拼接 /v1，结果应该相同
    expect(openaiRoute?.options?.baseURL).toContain('newapi.example.com/v1');
  });

  it('Anthropic 路由不应拼接 /v1', () => {
    const routes = params.routers({ apiKey: 'sk-test', baseURL: 'https://newapi.example.com' });

    const anthropicRoute = routes.find((r: any) => r.apiType === 'anthropic');
    expect(anthropicRoute?.options?.baseURL).toBe('https://newapi.example.com');
  });

  it('应该生成 5 个子路由（openai, anthropic, google, xai, deepseek）', () => {
    const routes = params.routers({ apiKey: 'sk-test', baseURL: 'https://newapi.example.com' });

    expect(routes).toHaveLength(5);
    const apiTypes = routes.map((r: any) => r.apiType);
    expect(apiTypes).toEqual(['anthropic', 'google', 'xai', 'deepseek', 'openai']);
  });
});
