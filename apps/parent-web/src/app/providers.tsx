'use client';

import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from 'antd';
import { ParentStoreProvider } from '../lib/parent-store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      button={{ autoInsertSpace: false }}
      theme={{
        token: {
          colorPrimary: '#167c80',
          colorInfo: '#167c80',
          colorSuccess: '#249f68',
          colorWarning: '#d88721',
          colorError: '#d34b4b',
          borderRadius: 8,
          fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        },
      }}
    >
      <ParentStoreProvider>{children}</ParentStoreProvider>
    </ConfigProvider>
  );
}
