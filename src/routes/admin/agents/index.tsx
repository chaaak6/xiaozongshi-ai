'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { SearchBar } from '@lobehub/ui';
import { Switch, Table, Tag, message } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { lambdaQuery } from '@/libs/trpc/client';

const AdminAgentsPage = memo(() => {
  const { t } = useTranslation('admin');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = lambdaQuery.adminAgent.listAll.useQuery({
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const toggleMutation = lambdaQuery.adminAgent.toggleEnabled.useMutation({
    onSuccess: () => { message.success(t('agents.toggleSuccess')); refetch(); },
  });

  const columns = [
    { title: t('agents.name'), dataIndex: 'name', key: 'name' },
    { title: t('agents.model'), dataIndex: 'model', key: 'model' },
    { title: t('agents.category'), dataIndex: 'category', key: 'category', render: (v: string) => v ? <Tag>{v}</Tag> : '-' },
    {
      title: t('agents.enabled'), dataIndex: 'enabled', key: 'enabled',
      render: (v: boolean, record: any) => (
        <Switch checked={v} onChange={(checked) => toggleMutation.mutate({ agentId: record.id, enabled: checked })} />
      ),
    },
  ];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('agents.title')}</Text>
      <SearchBar placeholder={t('agents.searchPlaceholder')} value={search}
        onChange={(v: any) => setSearch(v.target?.value ?? v)}
        style={{ width: 300 }}
      />
      <Table columns={columns} dataSource={(data?.data ?? []) as any[]} loading={isLoading}
        pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage }} rowKey="id" />
    </Flexbox>
  );
});

export default AdminAgentsPage;
