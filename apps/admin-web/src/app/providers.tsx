'use client';

import { App, ConfigProvider } from 'antd';
import { AdminStoreProvider } from '../lib/admin-store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#155eef',
          colorInfo: '#155eef',
          colorSuccess: '#039855',
          colorWarning: '#dc6803',
          colorError: '#d92d20',
          borderRadius: 10,
          fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          colorBgLayout: '#f5f7fb',
        },
      }}
    >
      <App>
        <AdminStoreProvider>{children}</AdminStoreProvider>
      </App>
    </ConfigProvider>
  );
}
