'use client';
import { Flexbox, Text } from '@lobehub/ui';
import { SearchBar } from '@lobehub/ui';
import { Button, Modal, Input, Table, Tag, message } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lambdaQuery } from '@/libs/trpc/client';

const AdminWorkspacesPage = memo(() => {
  const { t } = useTranslation('admin');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { data, isLoading, refetch } = lambdaQuery.adminWorkspace.listAll.useQuery({
    search: search || undefined, limit: 20, offset: (page - 1) * 20,
  });

  const createMutation = lambdaQuery.adminWorkspace.create.useMutation({
    onSuccess: () => { message.success('工作区已创建'); setCreateOpen(false); setNewName(''); setNewDesc(''); refetch(); },
  });

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description', render: (v: string) => v || '-' },
    { title: '成员数', dataIndex: 'memberCount', key: 'memberCount' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString('zh-CN') },
  ];

  return (
    <Flexbox gap={16}>
      <Flexbox horizontal justify="space-between" align="center">
        <Text style={{ fontSize: 24, fontWeight: 600 }}>工作区管理</Text>
        <Button type="primary" onClick={() => setCreateOpen(true)}>创建工作区</Button>
      </Flexbox>
      <SearchBar placeholder="搜索工作区..." value={search} onChange={(v: any) => setSearch(v.target?.value ?? v)} style={{ width: 300 }} />
      <Table columns={columns} dataSource={(data?.data ?? []) as any[]} loading={isLoading}
        pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage }} rowKey="id" />
      <Modal open={createOpen} title="创建工作区" onCancel={() => setCreateOpen(false)}
        onOk={() => newName.trim() && createMutation.mutate({ name: newName.trim(), description: newDesc.trim() || undefined })}>
        <Flexbox gap={12}>
          <Input placeholder="工作区名称" value={newName} onChange={e => setNewName(e.target.value)} />
          <Input placeholder="工作区描述（可选）" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
        </Flexbox>
      </Modal>
    </Flexbox>
  );
});
export default AdminWorkspacesPage;
