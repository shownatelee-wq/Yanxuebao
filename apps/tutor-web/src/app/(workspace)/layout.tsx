'use client';

import {
  FileTextOutlined,
  FormOutlined,
  LogoutOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Button, Layout, Menu, Typography } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getStoredSession } from '../../lib/api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const items = [
  { key: '/teams', label: <Link href="/teams">团队与小组</Link>, icon: <TeamOutlined /> },
  { key: '/tasks', label: <Link href="/tasks">任务管理</Link>, icon: <ScheduleOutlined /> },
  { key: '/scores', label: <Link href="/scores">评分确认</Link>, icon: <FormOutlined /> },
  { key: '/reports', label: <Link href="/reports">研学报告</Link>, icon: <FileTextOutlined /> },
];

export default function TutorWorkspaceLayout({ children }: { children: React.ReactNode }) {
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
            研学宝导师端
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
          <Breadcrumb items={[{ title: '导师端' }, { title: pathname.replace('/', '') || '首页' }]} />
          <Button icon={<LogoutOutlined />} onClick={logout}>
            退出
          </Button>
        </Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}

