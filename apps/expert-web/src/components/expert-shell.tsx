'use client';

import {
  AppstoreOutlined,
  BookOutlined,
  HomeOutlined,
  LeftOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Spin } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getStoredSession } from '../lib/api';
import { useExpertStore } from '../lib/expert-store';

const NAV_ITEMS = [
  { href: '/dashboard', label: '工作台', icon: HomeOutlined },
  { href: '/courses', label: '课程', icon: BookOutlined },
  { href: '/content', label: '内容', icon: AppstoreOutlined },
  { href: '/agents', label: '智能体', icon: RobotOutlined },
  { href: '/me', label: '我的', icon: UserOutlined },
];

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: '专家工作台', subtitle: '课程、知识与挑战的统一工作区' },
  '/courses': { title: '课程管理', subtitle: '线上与线下课程的发布和经营看板' },
  '/content': { title: '内容管理', subtitle: '问答、知识、资讯、挑战与作品审核' },
  '/agents': { title: '智能体管理', subtitle: '主智能体配置、知识绑定与运营数据' },
  '/me': { title: '我的', subtitle: '专家资料、设置和数据恢复' },
};

export function ExpertWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated } = useExpertStore();
  const session = getStoredSession();
  const titleMeta = TITLES[pathname] ?? TITLES['/dashboard'];

  useEffect(() => {
    if (hydrated && !session) {
      router.replace('/login');
    }
  }, [hydrated, router, session]);

  if (!hydrated) {
    return (
      <main className="expert-app-bg">
        <div className="expert-phone expert-loading">
          <Spin />
          <span>正在整理专家工作台</span>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="expert-app-bg">
      <div className="expert-phone">
        <header className="expert-shell-header">
          {pathname === '/dashboard' ? (
            <div className="expert-shell-side" />
          ) : (
            <Button
              aria-label="返回"
              className="expert-header-button"
              icon={<LeftOutlined />}
              shape="circle"
              type="text"
              onClick={() => router.back()}
            />
          )}
          <div className="expert-shell-title">
            <span>{session.user.organization}</span>
            <strong>{titleMeta.title}</strong>
            <small>{titleMeta.subtitle}</small>
          </div>
          <div className="expert-shell-side" />
        </header>

        <section className="expert-shell-content">{children}</section>

        <nav className="expert-bottom-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`expert-bottom-link${active ? ' active' : ''}`}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
