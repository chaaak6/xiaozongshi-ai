'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { SearchBar } from '@lobehub/ui';
import { Table, Tabs, Tag } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { lambdaQuery } from '@/libs/trpc/client';

const AdminPluginsPage = memo(() => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = lambdaQuery.adminPlugin.listAllPlugins.useQuery({
    type: activeTab as any,
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const columns = [
    { title: t('plugins.name'), dataIndex: 'name', key: 'name' },
    { title: t('plugins.type'), dataIndex: 'type', key: 'type', render: (v: string) => v ? <Tag>{v.toUpperCase()}</Tag> : '-' },
  ];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('plugins.title')}</Text>
      <Tabs activeKey={activeTab} onChange={setActiveTab}
        items={[
          { key: 'all', label: t('plugins.all') },
          { key: 'plugin', label: t('plugins.plugins') },
          { key: 'mcp', label: t('plugins.mcp') },
          { key: 'skill', label: t('plugins.skills') },
        ]}
      />
      <SearchBar placeholder={t('plugins.searchPlaceholder')} value={search}
        onChange={(v: any) => setSearch(v.target?.value ?? v)} style={{ width: 300 }}
      />
      <Table columns={columns} dataSource={(data?.data ?? []) as any[]} loading={isLoading}
        pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage }} rowKey="id"
      />
    </Flexbox>
  );
});

export default AdminPluginsPage;
