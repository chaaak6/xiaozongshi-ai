'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { Skeleton, Tag, Button, Space } from 'antd';
import { UserOutlined, RobotOutlined, ClockCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { cssVar } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

import { lambdaQuery } from '@/libs/trpc/client';

const AdminSessionDetailPage = memo(() => {
  const { t } = useTranslation('admin');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = lambdaQuery.admin.getSessionMessages.useQuery(
    { sessionId: id! }, { enabled: !!id }
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;

  const messages = (data ?? []) as any[];
  const sessionInfo = messages[0] || {};

  const exportConversation = () => {
    const text = messages.map((m: any) =>
      `[${new Date(m.createdAt || m.created_at).toLocaleString('zh-CN')}] ${m.role === 'user' ? '👤 用户' : `🤖 ${m.model || 'AI'}`}\n${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}\n`
    ).join('\n---\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `session-${id?.slice(0, 8)}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = (content: any) => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) return content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
    return JSON.stringify(content, null, 2);
  };

  return (
    <Flexbox gap={16}>
      {/* Header */}
      <Flexbox horizontal justify="space-between" align="center">
        <Flexbox gap={4}>
          <Button type="link" onClick={() => navigate('/admin/sessions')} style={{ padding: 0, width: 'fit-content' }}>
            &larr; {t('sessions.back')}
          </Button>
          <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('sessions.detail')}</Text>
        </Flexbox>
        <Button icon={<ExportOutlined />} onClick={exportConversation}>
          导出对话
        </Button>
      </Flexbox>

      {/* Session metadata */}
      <Flexbox horizontal gap={12} align="center" style={{ flexWrap: 'wrap' }}>
        <Tag icon={<ClockCircleOutlined />}>
          {messages.length > 0 ? new Date(messages[0].createdAt || messages[0].created_at).toLocaleDateString('zh-CN') : '-'}
        </Tag>
        {sessionInfo.model && <Tag color="blue">{sessionInfo.model}</Tag>}
        <Text type="secondary" style={{ fontSize: 13 }}>
          共 {messages.length} 条消息
        </Text>
      </Flexbox>

      {/* Message list — chat style */}
      <Flexbox gap={4} style={{ maxWidth: 900 }}>
        {messages.length === 0 ? (
          <Text type="secondary">暂无用话记录</Text>
        ) : (
          messages.map((msg: any, idx: number) => (
            <div
              key={msg.id || idx}
              style={{
                borderRadius: 12,
                marginBottom: 8,
                padding: '14px 18px',
                ...(msg.role === 'user'
                  ? { background: cssVar.colorFillSecondary, marginLeft: 80 }
                  : { background: 'var(--colorFillQuaternary)', marginRight: 40 }
                ),
              }}
            >
              {/* Role + time header */}
              <Flexbox horizontal gap={8} align="center" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>
                  {msg.role === 'user'
                    ? <><UserOutlined style={{ marginRight: 4 }} />用户</>
                    : <><RobotOutlined style={{ marginRight: 4 }} />{msg.model || 'AI'}</>
                  }
                </span>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(msg.createdAt || msg.created_at).toLocaleString('zh-CN')}
                </Text>
                {msg.usage && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {msg.usage.totalTokens || (msg.usage.totalInputTokens + (msg.usage.totalOutputTokens || 0))} tokens
                  </Text>
                )}
              </Flexbox>

              {/* Content */}
              <div style={{
                fontSize: 14,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {renderContent(msg.content)}
              </div>

              {/* Error indicator */}
              {msg.error && (
                <Tag color="red" style={{ marginTop: 8 }}>
                  发送失败: {typeof msg.error === 'string' ? msg.error : JSON.stringify(msg.error)}
                </Tag>
              )}
            </div>
          ))
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default AdminSessionDetailPage;
