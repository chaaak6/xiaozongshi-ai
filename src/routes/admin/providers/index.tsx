'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { SearchBar } from '@lobehub/ui';
import { Switch, Table, Tag, message } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { lambdaQuery } from '@/libs/trpc/client';

const AdminProvidersPage = memo(() => {
  const { t } = useTranslation('admin');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = lambdaQuery.adminProvider.listAll.useQuery({
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const toggleMutation = lambdaQuery.adminProvider.toggleEnabled.useMutation({
    onSuccess: () => { message.success(t('providers.toggleSuccess')); refetch(); },
  });

  const columns = [
    {
      title: t('providers.name'), dataIndex: 'name', key: 'name',
      render: (v: string) => v || t('providers.unnamed'),
    },
    {
      title: t('providers.source'), dataIndex: 'source', key: 'source',
      render: (v: string) => <Tag color={v === 'builtin' ? 'blue' : 'orange'}>{v || 'custom'}</Tag>,
    },
    {
      title: t('providers.apiKey'), dataIndex: 'hasApiKey', key: 'hasApiKey',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '已配置' : '未配置'}</Tag>,
    },
    {
      title: t('providers.baseURL'), dataIndex: 'hasBaseURL', key: 'hasBaseURL',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '已配置' : '默认'}</Tag>,
    },
    {
      title: t('providers.enabled'), dataIndex: 'enabled', key: 'enabled',
      render: (v: boolean, record: any) => (
        <Switch
          checked={!!v}
          checkedChildren="开"
          unCheckedChildren="关"
          onChange={(checked) =>
            toggleMutation.mutate({ providerId: record.id, userId: record.userId, enabled: checked })
          }
        />
      ),
    },
  ];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('providers.title')}</Text>
      <SearchBar placeholder={t('providers.searchPlaceholder')} value={search}
        onChange={(v: any) => setSearch(v.target?.value ?? v)}
        style={{ width: 300 }}
      />
      <Table columns={columns} dataSource={(data?.data ?? []) as any[]} loading={isLoading}
        pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage }}
        rowKey={(r: any) => `${r.id}_${r.userId}`}
      />
    </Flexbox>
  );
});

export default AdminProvidersPage;
