'use client';

import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from 'antd';
import { ExpertStoreProvider } from '../lib/expert-store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      button={{ autoInsertSpace: false }}
      theme={{
        token: {
          colorPrimary: '#0f766e',
          colorInfo: '#0f766e',
          colorSuccess: '#0c8a5b',
          colorWarning: '#d38a10',
          colorError: '#d14d41',
          borderRadius: 8,
          fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        },
      }}
    >
      <ExpertStoreProvider>{children}</ExpertStoreProvider>
    </ConfigProvider>
  );
}
