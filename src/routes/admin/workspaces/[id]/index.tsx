'use client';
import { Flexbox, Text } from '@lobehub/ui';
import { Button, Select, InputNumber, Table, Tabs, Tag, Modal, message } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { lambdaQuery } from '@/libs/trpc/client';

const WorkspaceDetailPage = memo(() => {
  const { t } = useTranslation('admin');
  const { id } = useParams<{ id: string }>();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('workspace_member');
  const [tokenQuota, setTokenQuota] = useState(1000000);

  const { data: members, refetch: refetchMembers } = lambdaQuery.adminWorkspace.listMembers.useQuery(
    { workspaceId: id! }, { enabled: !!id }
  );

  const inviteMutation = lambdaQuery.adminWorkspace.inviteMember.useMutation({
    onSuccess: () => { message.success('邀请已发送'); setInviteOpen(false); refetchMembers(); },
  });

  const quotaMutation = lambdaQuery.adminWorkspace.updateQuota.useMutation({
    onSuccess: () => message.success('配额已更新'),
  });

  const memberColumns = [
    { title: '用户', dataIndex: 'userName', key: 'userName' },
    { title: '邮箱', dataIndex: 'userEmail', key: 'userEmail' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (v: string) => <Tag>{v}</Tag> },
    { title: '加入时间', dataIndex: 'joinedAt', key: 'joinedAt', render: (v: string) => new Date(v).toLocaleDateString('zh-CN') },
  ];

  const tabItems = [
    { key: 'members', label: '成员管理', children: (
      <Flexbox gap={12}>
        <Flexbox horizontal justify="space-between">
          <Text style={{ fontSize: 16, fontWeight: 500 }}>成员列表</Text>
          <Button type="primary" size="small" onClick={() => setInviteOpen(true)}>添加成员</Button>
        </Flexbox>
        <Table columns={memberColumns} dataSource={(members?.data ?? []) as any[]} rowKey="id" pagination={false} />
      </Flexbox>
    )},
    { key: 'models', label: '模型白名单', children: (
      <Flexbox gap={12}>
        <Text style={{ fontSize: 16, fontWeight: 500 }}>此工作区可使用的模型</Text>
        <Text type="secondary">模型白名单功能通过 /admin/providers 管理</Text>
      </Flexbox>
    )},
    { key: 'quota', label: '配额设置', children: (
      <Flexbox gap={12}>
        <Text style={{ fontSize: 16, fontWeight: 500 }}>Token 配额</Text>
        <Flexbox horizontal gap={12} align="center">
          <Text>每月 Token 上限：</Text>
          <InputNumber min={0} value={tokenQuota} onChange={v => v && setTokenQuota(v)} style={{ width: 200 }} />
          <Button type="primary" onClick={() => quotaMutation.mutate({ workspaceId: id!, tokenQuota })}>保存</Button>
        </Flexbox>
      </Flexbox>
    )},
  ];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 600 }}>工作区详情</Text>
      <Tabs items={tabItems} />
      <Modal open={inviteOpen} title="邀请成员" onCancel={() => setInviteOpen(false)}
        onOk={() => inviteEmail.trim() && inviteMutation.mutate({ workspaceId: id!, email: inviteEmail.trim(), role: inviteRole as any })}>
        <Flexbox gap={12}>
          <input placeholder="输入用户邮箱" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--colorBorder)', width: '100%' }} />
          <Select value={inviteRole} onChange={setInviteRole} style={{ width: '100%' }}
            options={[
              { value: 'workspace_owner', label: 'Owner' },
              { value: 'workspace_member', label: 'Member' },
              { value: 'workspace_viewer', label: 'Viewer' },
            ]} />
        </Flexbox>
      </Modal>
    </Flexbox>
  );
});
export default WorkspaceDetailPage;
