'use client';

import { Result, Button } from 'antd';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function AdminErrorState({ message = '加载失败', onRetry }: ErrorStateProps) {
  return (
    <Result
      status="error"
      title={message}
      extra={onRetry ? <Button onClick={onRetry}>重试</Button> : undefined}
    />
  );
}
