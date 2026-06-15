'use client';

import { Drawer } from 'antd';
import { type ReactNode } from 'react';

interface EditDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}

export function AdminEditDrawer({ open, title, onClose, children, width = 520, footer }: EditDrawerProps) {
  return (
    <Drawer open={open} title={title} onClose={onClose} width={width} footer={footer} destroyOnClose>
      {children}
    </Drawer>
  );
}
