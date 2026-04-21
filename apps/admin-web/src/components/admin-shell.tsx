'use client';

import { BellOutlined, DownOutlined, LogoutOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { clearSession, type AdminRole, type AdminSession } from '../lib/admin-auth';
import { useAdminStore } from '../lib/admin-store';
import { cityNavigation, operatorNavigation } from '../lib/navigation';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

type Props = {
  role: AdminRole;
  session: AdminSession;
  children: React.ReactNode;
};

function getOperatorMenuItems(): MenuProps['items'] {
  return operatorNavigation.map((section) => ({
    key: section.section,
    type: 'group',
    label: section.section,
    children: section.items.map((item) => ({
      key: item.key,
      icon: item.icon,
      label: <Link href={`/${item.key}`}>{item.title}</Link>,
    })),
  }));
}

function getCityMenuItems(): MenuProps['items'] {
  return cityNavigation.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: <Link href={`/city-workbench/${item.key}`}>{item.title}</Link>,
  }));
}

export function AdminShell({ role, session, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef<HTMLElement | null>(null);
  const { actions } = useAdminStore();

  const isCity = role === 'city_maintainer';
  const currentKey = isCity ? pathname.split('/')[2] ?? 'bases' : pathname.slice(1) || 'dashboard';

  const accountMenuItems: MenuProps['items'] = [
    {
      key: 'workspace',
      label: isCity ? '城市维护工作台' : '运营管理后台',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'reset',
      icon: <ReloadOutlined />,
      label: '恢复初始台账',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出',
    },
  ];

  function handleLogout() {
    clearSession();
    router.replace(isCity ? '/city-login' : '/login');
  }

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <Layout className="console-root">
      <Sider width={268} theme="light" className="console-sider">
        <div className="console-brand">
          <Text className="eyebrow">{isCity ? '城市维护工作台' : '研学宝运营管理后台'}</Text>
          <Title level={4} style={{ margin: 0 }}>
            {isCity ? '城市数据维护台' : '运营总控台'}
          </Title>
          <Text type="secondary">{session.user.displayName}</Text>
        </div>
        <Menu
          className="console-menu"
          mode="inline"
          selectedKeys={[currentKey]}
          items={isCity ? getCityMenuItems() : getOperatorMenuItems()}
          style={{ borderInlineEnd: 'none', background: 'transparent' }}
        />
      </Sider>
      <Layout className="console-main">
        <header className="console-header">
          <div />
          <Space size={22} align="center">
            <Badge dot color="#155eef" offset={[-3, 4]}>
              <BellOutlined className="console-bell" />
            </Badge>
            <Dropdown
              menu={{
                items: accountMenuItems,
                onClick: ({ key }) => {
                  if (key === 'reset') {
                    actions.resetSeed();
                  }
                  if (key === 'logout') {
                    handleLogout();
                  }
                },
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <button className="account-trigger" type="button">
                <Avatar className="account-avatar" size={30} icon={<UserOutlined />} />
                <span className="account-name">{session.user.displayName}</span>
                <DownOutlined className="account-arrow" />
              </button>
            </Dropdown>
          </Space>
        </header>
        <Content ref={contentRef} className="console-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
