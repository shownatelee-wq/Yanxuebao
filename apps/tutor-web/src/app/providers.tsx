'use client';

import { ConfigProvider } from 'antd';
import { TutorStoreProvider } from '../lib/mock-store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0f766e',
          colorInfo: '#0f766e',
          colorSuccess: '#16a34a',
          colorWarning: '#ca8a04',
          colorError: '#dc2626',
          borderRadius: 8,
          fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        },
      }}
    >
      <TutorStoreProvider>{children}</TutorStoreProvider>
    </ConfigProvider>
  );
}
