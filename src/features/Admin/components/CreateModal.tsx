'use client';

import { Modal } from 'antd';
import { type ReactNode } from 'react';

interface CreateModalProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onOk: () => void;
  loading?: boolean;
  children: ReactNode;
  width?: number;
}

export function AdminCreateModal({ open, title, onCancel, onOk, loading, children, width = 560 }: CreateModalProps) {
  return (
    <Modal open={open} title={title} onCancel={onCancel} onOk={onOk} confirmLoading={loading} width={width} destroyOnClose>
      {children}
    </Modal>
  );
}
