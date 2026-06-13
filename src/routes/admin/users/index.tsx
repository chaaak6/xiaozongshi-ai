'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { SearchBar } from '@lobehub/ui';
import { Table, Tag } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { lambdaQuery } from '@/libs/trpc/client';

const AdminUsersPage = memo(() => {
  const { t } = useTranslation('admin');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = lambdaQuery.admin.listUsers.useQuery({
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const columns = [
    { title: t('users.name'), dataIndex: 'name', key: 'name' },
    { title: t('users.email'), dataIndex: 'email', key: 'email' },
    {
      title: t('users.status'), dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'red'}>{v}</Tag>,
    },
    { title: t('users.createdAt'), dataIndex: 'created_at', key: 'created_at',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
  ];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('users.title')}</Text>
      <SearchBar placeholder={t('users.searchPlaceholder')} value={search}
        onChange={(v: any) => setSearch(v.target?.value ?? v)}
        style={{ width: 300 }}
      />
      <Table columns={columns} dataSource={(data?.data ?? []) as any[]} loading={isLoading}
        pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage }} rowKey="id" />
    </Flexbox>
  );
});

export default AdminUsersPage;
