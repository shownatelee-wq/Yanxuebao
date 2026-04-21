'use client';

import '@ant-design/v5-patch-for-react-19';
import { Spin } from 'antd';

export function ParentRouteFallback({ label = '正在进入家长端' }: { label?: string }) {
  return (
    <main className="parent-app-bg">
      <div className="parent-phone">
        <div className="parent-loading">
          <Spin />
          <span>{label}</span>
        </div>
      </div>
    </main>
  );
}
