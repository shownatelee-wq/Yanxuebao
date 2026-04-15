import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '研学宝 · 设备端外壳',
  description: '研学宝 V1 设备端 H5 / WebView Shell',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <div className="watch-shell">
            <div className="watch-frame">
              <div className="watch-screen">{children}</div>
            </div>
          </div>
        </AntdRegistry>
      </body>
    </html>
  );
}
