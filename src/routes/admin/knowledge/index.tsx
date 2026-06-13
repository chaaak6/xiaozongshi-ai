'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { SearchBar } from '@lobehub/ui';
import { Button, Modal, Select, Table, Tag, message } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { lambdaQuery } from '@/libs/trpc/client';

const AdminKnowledgePage = memo(() => {
  const { t } = useTranslation('admin');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedKB, setSelectedKB] = useState<string | null>(null);
  const [grantType, setGrantType] = useState<'user' | 'role'>('user');
  const [grantTarget, setGrantTarget] = useState('');
  const [accessLevel, setAccessLevel] = useState<'read' | 'write' | 'admin'>('read');

  const { data, isLoading, refetch } = lambdaQuery.knowledgeBaseAdmin.listAll.useQuery({
    search: search || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  });

  const grantMutation = lambdaQuery.knowledgeBaseAdmin.grantPermission.useMutation({
    onSuccess: () => { message.success(t('knowledge.grantSuccess')); refetch(); setPermModalOpen(false); },
  });

  const revokeMutation = lambdaQuery.knowledgeBaseAdmin.revokePermission.useMutation({
    onSuccess: () => { message.success(t('knowledge.revokeSuccess')); refetch(); },
  });

  const columns: any[] = [
    { title: t('knowledge.name'), dataIndex: 'name', key: 'name' },
    {
      title: t('knowledge.visibility'), dataIndex: 'visibility', key: 'visibility',
      render: (v: string) => <Tag color={v === 'workspace' ? 'green' : 'orange'}>{v}</Tag>,
    },
    {
      title: '操作', key: 'actions',
      render: (_: any, record: any) => (
        <Button size="small" onClick={() => { setSelectedKB(record.id); setPermModalOpen(true); }}>
          {t('knowledge.permissions')}
        </Button>
      ),
    },
  ];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>{t('knowledge.title')}</Text>
      <SearchBar placeholder={t('knowledge.searchPlaceholder')} value={search}
        onChange={(v: any) => setSearch(v.target?.value ?? v)} style={{ width: 300 }}
      />
      <Table columns={columns} dataSource={(data?.data ?? []) as any[]} loading={isLoading}
        onRow={(record: any) => ({ onClick: () => { setSelectedKB(record.id); setPermModalOpen(true); }, style: { cursor: 'pointer' } })}
        pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, onChange: setPage }} rowKey="id"
      />

      <Modal open={permModalOpen} title={t('knowledge.permissions')} onCancel={() => setPermModalOpen(false)}
        onOk={() => grantMutation.mutate({ knowledgeBaseId: selectedKB!, granteeType: grantType, granteeId: grantTarget, accessLevel })}
      >
        <Flexbox gap={12}>
          <Select options={[{ value: 'user', label: t('knowledge.user') }, { value: 'role', label: t('knowledge.role') }]}
            value={grantType} onChange={setGrantType} style={{ width: '100%' }}
          />
          <input placeholder="ID" value={grantTarget} onChange={e => setGrantTarget(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--colorBorder)' }}
          />
          <Select options={[{ value: 'read', label: 'Read' }, { value: 'write', label: 'Write' }, { value: 'admin', label: 'Admin' }]}
            value={accessLevel} onChange={setAccessLevel} style={{ width: '100%' }}
          />
        </Flexbox>
      </Modal>
    </Flexbox>
  );
});

export default AdminKnowledgePage;
