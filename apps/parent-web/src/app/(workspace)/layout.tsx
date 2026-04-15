'use client';

import {
  HeartOutlined,
  LogoutOutlined,
  ReadOutlined,
  SolutionOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Button, Layout, Menu, Typography } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getStoredSession } from '../../lib/api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const items = [
  { key: '/students', label: <Link href="/students">学员与设备</Link>, icon: <UsergroupAddOutlined /> },
  { key: '/growth', label: <Link href="/growth">能力成长</Link>, icon: <HeartOutlined /> },
  { key: '/family-tasks', label: <Link href="/family-tasks">家庭任务</Link>, icon: <SolutionOutlined /> },
  { key: '/ai-records', label: <Link href="/ai-records">AI 记录</Link>, icon: <ReadOutlined /> },
];

export default function ParentWorkspaceLayout({ children }: { children: React.ReactNode }) {
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
            研学宝家长端
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
          <Breadcrumb items={[{ title: '家长端' }, { title: pathname.replace('/', '') || '首页' }]} />
          <Button icon={<LogoutOutlined />} onClick={logout}>
            退出
          </Button>
        </Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
