'use client';
import { Flexbox, Text } from '@lobehub/ui';
import { Button, Checkbox, message } from 'antd';
import { memo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { lambdaQuery } from '@/libs/trpc/client';

const WorkspaceModelsPage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const [selected, setSelected] = useState<string[]>([]);

  const { data: models } = lambdaQuery.adminProvider.listModels.useQuery(
    { limit: 50, offset: 0 }, { enabled: !!id }
  );

  const whitelistMutation = lambdaQuery.adminWorkspace.updateModelWhitelist.useMutation({
    onSuccess: () => message.success('模型白名单已更新'),
  });

  const modelList = (models?.data ?? []) as any[];

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 20, fontWeight: 600 }}>模型白名单</Text>
      <Text type="secondary">勾选此工作区用户可使用的模型</Text>
      <Checkbox.Group value={selected} onChange={(v) => setSelected(v as string[])} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {modelList.map((m: any) => (
          <Checkbox key={m.id} value={m.id}>{m.displayName} ({m.id})</Checkbox>
        ))}
      </Checkbox.Group>
      <Button type="primary" onClick={() => whitelistMutation.mutate({ workspaceId: id!, modelIds: selected })}>
        保存白名单
      </Button>
    </Flexbox>
  );
});
export default WorkspaceModelsPage;
