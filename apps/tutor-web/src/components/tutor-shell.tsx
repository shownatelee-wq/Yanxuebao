'use client';

import {
  BellOutlined,
  FileTextOutlined,
  HomeOutlined,
  LeftOutlined,
  MessageOutlined,
  PicCenterOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Spin } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getStoredSession } from '../lib/api';
import { getCurrentTeam, getTeamById, useTutorStore } from '../lib/mock-store';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: '工作台',
    icon: HomeOutlined,
    matches: ['/dashboard', '/ranking', '/reports', '/photos', '/safety'],
  },
  { href: '/messages', label: '消息', icon: MessageOutlined, matches: ['/messages', '/broadcasts'] },
  {
    href: '/teams',
    label: '团队',
    icon: TeamOutlined,
    matches: ['/teams', '/groups', '/team-detail', '/team-switch', '/works', '/scores'],
  },
  { href: '/tasks', label: '任务', icon: ScheduleOutlined, matches: ['/tasks'] },
  { href: '/me', label: '我的', icon: UserOutlined, matches: ['/me', '/common-classes'] },
];

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: '导师工作台', subtitle: '当前团队的执行中心' },
  '/teams': { title: '团队管理', subtitle: '筛选、创建并查看研学团队' },
  '/groups': { title: '小组管理', subtitle: '分组、岗位、队名与队徽' },
  '/team-detail': { title: '团队详情', subtitle: '查看当前研学团队详细信息' },
  '/team-switch': { title: '切换团队', subtitle: '选择执行中的研学团队' },
  '/tasks': { title: '任务管理', subtitle: '配置学员任务与小组任务' },
  '/works': { title: '任务作品', subtitle: '查看当前团队的学员与任务作品' },
  '/ranking': { title: '排行榜', subtitle: '学员与小组得分快速查看' },
  '/reports': { title: '研学报告', subtitle: '生成、推送与成长值发放' },
  '/messages': { title: '消息', subtitle: 'SoS、问询、通知与群组消息' },
  '/broadcasts': { title: '消息', subtitle: '团队、小组、学员消息统一处理' },
  '/photos': { title: '团队照片', subtitle: '拍照、相册与研学回顾素材' },
  '/safety': { title: '安全中心', subtitle: '位置查看与 SoS 处理' },
  '/me': { title: '我的', subtitle: '导师信息与常用工具' },
  '/common-classes': { title: '常用班级', subtitle: '维护班级与学生名单' },
  '/scores': { title: '评分入口', subtitle: '兼容旧链接，跳转到评分工作区' },
};

function isTeamsSection(pathname: string) {
  return pathname === '/teams' || pathname.startsWith('/teams/') || pathname === '/groups' || pathname === '/team-detail';
}

function resolveTitleMeta(
  pathname: string,
  state: ReturnType<typeof useTutorStore>['state'],
  currentTeamName?: string,
): { title: string; subtitle: string } {
  if (pathname.startsWith('/teams/')) {
    const segments = pathname.split('/').filter(Boolean);
    const teamId = segments[1];
    const subRoute = segments[2];
    const team = teamId ? getTeamById(state, teamId) : null;
    const teamName = team?.name ?? currentTeamName;

    if (!subRoute) {
      return {
        title: '团队详情',
        subtitle: teamName ? `${teamName} · 查看团队资料与管理入口` : '查看团队资料与管理入口',
      };
    }

    if (subRoute === 'students') {
      return {
        title: '学生管理',
        subtitle: teamName ? `${teamName} · 学员名单与导入维护` : '学员名单与导入维护',
      };
    }

    if (subRoute === 'groups') {
      return {
        title: '小组管理',
        subtitle: teamName ? `${teamName} · 分组、岗位与队名队徽` : '分组、岗位与队名队徽',
      };
    }

    if (subRoute === 'assistants') {
      return {
        title: '助理管理',
        subtitle: teamName ? `${teamName} · 助理老师列表与新增` : '助理老师列表与新增',
      };
    }

    if (subRoute === 'materials') {
      return {
        title: '资料管理',
        subtitle: teamName ? `${teamName} · 研学资料列表与新增` : '研学资料列表与新增',
      };
    }

    if (subRoute === 'works') {
      return {
        title: '任务作品',
        subtitle: teamName ? `${teamName} · 学员列表与任务作品查看` : '学员列表与任务作品查看',
      };
    }
  }

  return TITLES[pathname] ?? { title: '导师端', subtitle: '手机工作台' };
}

export function TutorWorkspaceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, state } = useTutorStore();
  const session = getStoredSession();
  const currentTeam = getCurrentTeam(state);
  const titleMeta = resolveTitleMeta(pathname, state, currentTeam?.name);

  useEffect(() => {
    if (hydrated && !session) {
      router.replace('/login');
    }
  }, [hydrated, router, session]);

  if (!hydrated) {
    return (
      <main className="tutor-app-shell">
        <div className="tutor-phone" style={{ display: 'grid', placeItems: 'center' }}>
          <Spin />
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  function goBack() {
    if (pathname === '/dashboard') {
      return;
    }
    router.back();
  }

  return (
    <main className="tutor-app-shell">
      <div className="tutor-phone">
        <header className="tutor-shell-bar">
          {pathname === '/dashboard' ? (
            <div className="tutor-shell-side" />
          ) : (
            <Button aria-label="返回" icon={<LeftOutlined />} shape="circle" type="text" onClick={goBack} />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="tutor-shell-title">{titleMeta.title}</div>
            <div className="tutor-shell-subtitle">{isTeamsSection(pathname) ? titleMeta.subtitle : currentTeam ? `${currentTeam.name} · ${titleMeta.subtitle}` : titleMeta.subtitle}</div>
          </div>
          <div className="tutor-shell-side" />
        </header>
        <div className="tutor-shell-content">{children}</div>
        <nav className="tutor-bottom-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.matches.some((match) =>
              match === '/teams' ? isTeamsSection(pathname) || pathname === '/team-switch' || pathname === '/works' || pathname === '/scores' : pathname === match,
            );
            return (
              <Link key={item.href} href={item.href} className={`tutor-bottom-link${active ? ' active' : ''}`}>
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

export function QuickMenuLinks() {
  const { state } = useTutorStore();
  const currentTeam = getCurrentTeam(state);
  const teamHref = currentTeam ? `/teams/${currentTeam.id}` : '/teams';
  const items = [
    { href: '/messages', label: '消息', desc: 'SoS/群聊', icon: BellOutlined },
    { href: '/works', label: '任务进度', desc: '个人/小组', icon: ScheduleOutlined },
    { href: '/reports', label: '报告模版', desc: '生成/配置', icon: FileTextOutlined },
    { href: '/ranking', label: '排行', desc: '学员/小组', icon: TeamOutlined },
    { href: teamHref, label: currentTeam ? '团队详情' : '团队管理', desc: currentTeam ? '团队总控' : '查看团队', icon: TeamOutlined },
    { href: '/photos', label: '照片', desc: '批量素材', icon: PicCenterOutlined },
  ];

  return (
    <div className="tutor-actions-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={`${item.href}-${item.label}`} href={item.href} className="tutor-action-tile">
            <span className="tutor-action-icon">
              <Icon />
            </span>
            <strong style={{ fontSize: 13 }}>{item.label}</strong>
            <span className="tutor-section-note" style={{ marginTop: 4 }}>
              {item.desc}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
