import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '研学宝 · AI Agent 新版设备端',
  description: '研学宝新版 AI Agent 手表设备端独立原型',
  icons: {
    icon: 'data:image/svg+xml,%3Csvg viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2218%22 fill=%22%231f70f2%22/%3E%3Cpath d=%22M20 34c0-7 5-12 12-12s12 5 12 12-5 12-12 12-12-5-12-12Z%22 fill=%22white%22 opacity=%22.95%22/%3E%3Cpath d=%22M26 32h12v5H26z%22 fill=%22%231f70f2%22/%3E%3Ccircle cx=%2228%22 cy=%2229%22 r=%222%22 fill=%22%231f70f2%22/%3E%3Ccircle cx=%2236%22 cy=%2229%22 r=%222%22 fill=%22%231f70f2%22/%3E%3C/svg%3E',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
