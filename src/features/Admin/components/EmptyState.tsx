'use client';

import { Result, Button } from 'antd';

interface EmptyStateProps {
  description?: string;
  createButtonText?: string;
  onCreate?: () => void;
}

export function AdminEmptyState({ description = '暂无数据', createButtonText, onCreate }: EmptyStateProps) {
  return (
    <Result
      status="info"
      title={description}
      extra={
        createButtonText && onCreate ? (
          <Button type="primary" onClick={onCreate}>
            {createButtonText}
          </Button>
        ) : undefined
      }
    />
  );
}
