'use client';

import {
  BookOutlined,
  BulbOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Button, Layout, Menu, Typography } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getStoredSession } from '../../lib/api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const items = [
  { key: '/courses', label: <Link href="/courses">课程管理</Link>, icon: <BookOutlined /> },
  { key: '/knowledge', label: <Link href="/knowledge">知识库</Link>, icon: <BulbOutlined /> },
  { key: '/challenges', label: <Link href="/challenges">难题挑战</Link>, icon: <FileSearchOutlined /> },
  { key: '/news', label: <Link href="/news">资讯管理</Link>, icon: <NotificationOutlined /> },
];

export default function ExpertWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = getStoredSession();

  function logout() {
    clearSession();
    router.push('/login');
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={240}>
        <div style={{ padding: 20 }}>
          <Title level={4} style={{ margin: 0 }}>
            研学宝专家端
          </Title>
          <Text type="secondary">{session?.user.displayName ?? '未登录'}</Text>
        </div>
        <Menu mode="inline" selectedKeys={[pathname]} items={items} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: 24,
          }}
        >
          <Breadcrumb items={[{ title: '专家端' }, { title: pathname.replace('/', '') || '首页' }]} />
          <Button icon={<LogoutOutlined />} onClick={logout}>
            退出
          </Button>
        </Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
