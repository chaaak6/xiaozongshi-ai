'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { cssVar } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

import { lambdaQuery } from '@/libs/trpc/client';

const AdminSessionDetailPage = memo(() => {
  const { t } = useTranslation('admin');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = lambdaQuery.admin.getSessionMessages.useQuery({ sessionId: id! }, { enabled: !!id });

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;

  return (
    <Flexbox gap={16}>
      <Text style={{ color: cssVar.colorPrimary, cursor: 'pointer', fontSize: 14 }} onClick={() => navigate('/admin/sessions')}>
        &larr; {t('sessions.back')}
      </Text>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('sessions.detail')}</Text>
      <Flexbox gap={12}>
        {(data ?? []).map((msg: any) => (
          <div key={msg.id} style={{
            padding: 12,
            borderRadius: 8,
            background: msg.role === 'user' ? 'var(--colorFillSecondary)' : 'var(--colorFillQuaternary)',
          }}>
            <Text style={{ fontSize: 12, color: 'var(--colorTextSecondary)', marginBottom: 4 }}>
              {msg.role === 'user' ? 'User' : msg.model || 'AI'} · {new Date(msg.createdAt || msg.created_at).toLocaleString('zh-CN')}
            </Text>
            <Text>{typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}</Text>
          </div>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default AdminSessionDetailPage;
