'use client';

import { Flexbox } from '@lobehub/ui';
import { Form, Input, Switch, Select, Button, Card, message, Space, Tag } from 'antd';
import { memo, useState } from 'react';
import { AdminPageHeader } from '@/features/Admin/components';

const OAUTH_PROVIDERS = [
  { key: 'github', name: 'GitHub', type: 'builtin' },
  { key: 'google', name: 'Google', type: 'builtin' },
  { key: 'microsoft', name: 'Microsoft', type: 'builtin' },
  { key: 'apple', name: 'Apple', type: 'builtin' },
  { key: 'cognito', name: 'AWS Cognito', type: 'builtin' },
  { key: 'auth0', name: 'Auth0', type: 'generic' },
  { key: 'authentik', name: 'Authentik', type: 'generic' },
  { key: 'casdoor', name: 'Casdoor', type: 'generic' },
  { key: 'cloudflare-zero-trust', name: 'Cloudflare Zero Trust', type: 'generic' },
  { key: 'feishu', name: '飞书', type: 'generic' },
  { key: 'keycloak', name: 'Keycloak', type: 'generic' },
  { key: 'logto', name: 'Logto', type: 'generic' },
  { key: 'okta', name: 'Okta', type: 'generic' },
  { key: 'zitadel', name: 'Zitadel', type: 'generic' },
  { key: 'wechat', name: '企业微信', type: 'generic' },
  { key: 'generic-oidc', name: '通用 OIDC', type: 'generic' },
];

const AdminAuthPage = memo(() => {
  const [enabledProviders, setEnabledProviders] = useState<string[]>([]);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);

  return (
    <Flexbox gap={16}>
      <AdminPageHeader title="认证配置" breadcrumb={[{ title: '认证' }]} />

      <Card title="登录策略" size="small">
        <Form layout="vertical" initialValues={{ emailWhitelist: '' }}>
          <Form.Item label="邮箱域名白名单" name="emailWhitelist" help="例如 @your-company.com，留空表示允许所有邮箱">
            <Input placeholder="@your-company.com" />
          </Form.Item>
          <Form.Item label="允许用户注册" name="allowRegister" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="允许" unCheckedChildren="禁止" />
          </Form.Item>
          <Form.Item label="邮箱验证" name="emailVerification" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Button type="primary">保存设置</Button>
        </Form>
      </Card>

      <Card title="OAuth 2.0 / OIDC 单点登录" size="small">
        <div style={{ marginBottom: 12, color: 'var(--colorTextSecondary)', fontSize: 13 }}>
          启用第三方登录提供商后，用户可在登录页面选择对应方式登录。
          支持 17 种 SSO 提供商，企业微信需配置 CorpID + Secret。
        </div>
        <Flexbox horizontal gap={8} wrap="wrap" style={{ marginBottom: 16 }}>
          {OAUTH_PROVIDERS.map(p => {
            const enabled = enabledProviders.includes(p.key);
            return (
              <Tag
                key={p.key}
                color={enabled ? 'blue' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 12px' }}
                onClick={() => {
                  if (enabled) {
                    setEnabledProviders(prev => prev.filter(k => k !== p.key));
                  } else {
                    setEnabledProviders(prev => [...prev, p.key]);
                    setEditingProvider(p.key);
                  }
                }}
              >
                {enabled ? '✓ ' : ''}{p.name}
              </Tag>
            );
          })}
        </Flexbox>

        {editingProvider && (
          <Card title={`配置 ${OAUTH_PROVIDERS.find(p => p.key === editingProvider)?.name}`} size="small" style={{ marginTop: 12 }}>
            <Form layout="vertical" onFinish={(v: any) => { message.success('配置已保存'); setEditingProvider(null); }}>
              <Form.Item name="clientId" label="Client ID" rules={[{ required: true }]}>
                <Input placeholder="{PROVIDER}_CLIENT_ID" />
              </Form.Item>
              <Form.Item name="clientSecret" label="Client Secret" rules={[{ required: true }]}>
                <Input.Password placeholder="{PROVIDER}_CLIENT_SECRET" />
              </Form.Item>
              {editingProvider !== 'github' && editingProvider !== 'google' && editingProvider !== 'microsoft' && editingProvider !== 'apple' && (
                <Form.Item name="issuer" label="Issuer URL">
                  <Input placeholder="https://sso.your-company.com" />
                </Form.Item>
              )}
              <Space>
                <Button type="primary" htmlType="submit">保存</Button>
                <Button onClick={() => setEditingProvider(null)}>取消</Button>
              </Space>
            </Form>
          </Card>
        )}
      </Card>
    </Flexbox>
  );
});

export default AdminAuthPage;
