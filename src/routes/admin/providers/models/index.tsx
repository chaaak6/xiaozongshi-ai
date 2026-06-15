'use client';
import { Flexbox, Text } from '@lobehub/ui';
import { Switch, Table, Tag, message } from 'antd';
import { memo, useState } from 'react';
import { lambdaQuery } from '@/libs/trpc/client';

const AdminModelsPage = memo(() => {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = lambdaQuery.adminProvider.listModels.useQuery({ limit: 50, offset: 0 });
  // Fallback: if listModels doesn't exist, use the provider models
  const models = (data?.data ?? []) as any[];

  const columns = [
    { title: '显示名称', dataIndex: 'displayName', key: 'displayName', render: (v: string) => v || '-' },
    { title: '模型ID', dataIndex: 'id', key: 'id' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{v || 'chat'}</Tag> },
    { title: '上下文窗口', dataIndex: 'contextWindowTokens', key: 'ctx', render: (v: number) => v ? `${(v/1024).toFixed(0)}K` : '-' },
    { title: '启用', dataIndex: 'enabled', key: 'enabled',
      render: (v: boolean) => <Switch checked={!!v} disabled /> },
  ];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>模型管理</Text>
      <Table columns={columns} dataSource={models} loading={isLoading}
        pagination={{ current: page, pageSize: 20, total: models.length, onChange: setPage }} rowKey="id" />
    </Flexbox>
  );
});
export default AdminModelsPage;
