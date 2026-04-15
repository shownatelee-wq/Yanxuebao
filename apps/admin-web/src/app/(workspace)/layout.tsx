'use client';

import {
  ApartmentOutlined,
  BookOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Button, Layout, Menu, Typography } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getStoredSession } from '../../lib/api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const items = [
  { key: '/organizations', label: <Link href="/organizations">合作机构</Link>, icon: <ApartmentOutlined /> },
  { key: '/task-templates', label: <Link href="/task-templates">任务模板</Link>, icon: <ReadOutlined /> },
  { key: '/question-bank', label: <Link href="/question-bank">题库管理</Link>, icon: <BookOutlined /> },
  { key: '/inventory', label: <Link href="/inventory">库存管理</Link>, icon: <DatabaseOutlined /> },
];

export default function AdminWorkspaceLayout({ children }: { children: React.ReactNode }) {
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
            研学宝运营后台
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
          <Breadcrumb items={[{ title: '运营后台' }, { title: pathname.replace('/', '') || '首页' }]} />
          <Button icon={<LogoutOutlined />} onClick={logout}>
            退出
          </Button>
        </Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
