'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { SearchBar } from '@lobehub/ui';
import { Table } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { lambdaQuery } from '@/libs/trpc/client';

const AdminSessionsPage = memo(() => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = lambdaQuery.admin.querySessions.useQuery({
    search: search || undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const columns = [
    { title: t('sessions.user'), dataIndex: 'user_email', key: 'user_email' },
    { title: t('sessions.messages'), dataIndex: 'message_count', key: 'message_count' },
    { title: t('sessions.updatedAt'), dataIndex: 'updated_at', key: 'updated_at', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
  ];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('sessions.title')}</Text>
      <SearchBar placeholder={t('sessions.searchPlaceholder')} value={search}
        onChange={(v: any) => setSearch(v.target?.value ?? v)}
        style={{ width: 300 }}
      />
      <Table
        columns={columns}
        dataSource={(data?.data ?? []) as any[]}
        loading={isLoading}
        onRow={(record: any) => ({ onClick: () => navigate(`/admin/sessions/${record.id}`), style: { cursor: 'pointer' } })}
        pagination={{ current: page, pageSize, total: data?.total ?? 0, onChange: setPage }}
        rowKey="id"
      />
    </Flexbox>
  );
});

export default AdminSessionsPage;
