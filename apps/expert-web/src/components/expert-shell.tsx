'use client';

import {
  BookOutlined,
  FireOutlined,
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
  { href: '/dashboard', label: '首页', icon: HomeOutlined },
  { href: '/agents', label: '智能体', icon: RobotOutlined },
  { href: '/courses', label: '课程', icon: BookOutlined },
  { href: '/challenges', label: '挑战', icon: FireOutlined },
  { href: '/me', label: '我的', icon: UserOutlined },
];

const TITLE_RULES = [
  { match: '/onboarding', title: '入驻申请', subtitle: '提交资料并等待运营审核' },
  { match: '/agents/new', title: '智能体', subtitle: '一个账号运营一个智能体' },
  { match: '/agents/questions/new', title: '新增问题', subtitle: '维护专家问题库' },
  { match: '/agents/questions', title: '问题库', subtitle: '专家问题与标准答案' },
  { match: '/agents/tests/new', title: '新增测试', subtitle: '测试智能体回复效果' },
  { match: '/agents/tests', title: '测试记录', subtitle: '问题测试与调优记录' },
  { match: '/agents/knowledge/new', title: '新增知识', subtitle: '标准问答沉淀到智能体' },
  { match: '/agents/knowledge', title: '知识库', subtitle: '标准问答与资料沉淀' },
  { match: '/agents/qa/import', title: '新增问题', subtitle: '兼容旧入口，进入问题库维护' },
  { match: '/agents/news/new', title: '发布资讯', subtitle: '内容运营归入智能体' },
  { match: '/agents/news', title: '资讯', subtitle: '图文与短视频内容' },
  { match: '/agents/skills/import', title: '导入技能', subtitle: '增强智能体运营能力' },
  { match: '/agents/skills', title: '技能', subtitle: '技能列表与生效状态' },
  { match: '/agents/voice/new', title: '专家语音', subtitle: '录音样本与试听模拟' },
  { match: '/agents/voice', title: '专家语音', subtitle: '语音样本列表' },
  { match: '/agents/', title: '智能体', subtitle: '资料、内容、技能与语音' },
  { match: '/agents', title: '智能体', subtitle: '资料、内容、技能与语音' },
  { match: '/courses/new', title: '新建课程', subtitle: '线上课程、直播与活动' },
  { match: '/courses/orders', title: '销售与订单', subtitle: '已迁移到我的' },
  { match: '/courses/writeoff', title: '课程核销', subtitle: '已迁移到我的' },
  { match: '/courses/distribution', title: '分销配置', subtitle: '课程佣金与推广表现' },
  { match: '/courses/', title: '课程详情', subtitle: '产品信息与数据看板' },
  { match: '/courses', title: '课程', subtitle: '产品总览与经营入口' },
  { match: '/content/qa/import', title: '导入提问', subtitle: '学员问题进入待补答列表' },
  { match: '/content/qa', title: '问答记录', subtitle: '补答并回写知识库' },
  { match: '/content/knowledge/new', title: '录入知识', subtitle: '创建分组与标准问答' },
  { match: '/content/knowledge/import', title: '上传资料', subtitle: '资料解析与知识沉淀' },
  { match: '/content/knowledge', title: '知识库', subtitle: '维护专家知识条目' },
  { match: '/content/news/collection', title: '采集设置', subtitle: '关键词、来源与采集频率' },
  { match: '/content/news/new', title: '新增资讯', subtitle: '图文或短视频内容发布' },
  { match: '/content/news', title: '资讯管理', subtitle: '采集、编辑与发布' },
  { match: '/content/challenges/new', title: '创建挑战', subtitle: '题目、要求与评分规则' },
  { match: '/content/challenges', title: '难题挑战', subtitle: '发布真实世界探究任务' },
  { match: '/content/submissions', title: '作品审核', subtitle: '评分与成长值奖励' },
  { match: '/content/evaluations/new', title: '创建评价批次', subtitle: '上传资料并生成报告' },
  { match: '/content/evaluations', title: '学生评价', subtitle: '评价批次与成长日记同步' },
  { match: '/content', title: '内容', subtitle: '问答、知识、资讯、挑战与评价' },
  { match: '/challenges/tasks', title: '挑战任务', subtitle: '发布、编辑与状态管理' },
  { match: '/challenges/new', title: '发布挑战', subtitle: '模板、内容、要求与评分' },
  { match: '/challenges/works/import', title: '导入作品', subtitle: '作品进入专家审核队列' },
  { match: '/challenges/works/', title: '作品详情', subtitle: '专家评分与个性化评价' },
  { match: '/challenges/teams/', title: '团队详情', subtitle: '成员、作品与挑战进展' },
  { match: '/challenges/students/', title: '学员详情', subtitle: '资料与作品列表' },
  { match: '/challenges/', title: '编辑挑战', subtitle: '题目、要求与评分规则' },
  { match: '/challenges', title: '挑战', subtitle: '团队、学员与作品审核' },
  { match: '/me/orders', title: '销售与订单', subtitle: '订单、退款与核销' },
  { match: '/me/bank-card', title: '收款银行卡', subtitle: '设置提现收款账户' },
  { match: '/me/invoice', title: '发票资料', subtitle: '维护结算开票信息' },
  { match: '/me/settlement', title: '结算中心', subtitle: '提现、账户与记录' },
  { match: '/me/settings', title: '系统设置', subtitle: '通知、显示与数据恢复' },
  { match: '/me/profile', title: '专家资料', subtitle: '个人资料与专业领域' },
  { match: '/me/organization', title: '机构资料', subtitle: '合作机构与资质信息' },
  { match: '/me/account', title: '账户与资质', subtitle: '收款账户和发票资料' },
  { match: '/me', title: '我的', subtitle: '资料、账户与设置入口' },
  { match: '/dashboard', title: '首页', subtitle: '待办、提醒与常用操作' },
];

function getTitleMeta(pathname: string) {
  return TITLE_RULES.find((rule) => pathname === rule.match || pathname.startsWith(rule.match)) ?? TITLE_RULES[TITLE_RULES.length - 1];
}

function getBackHref(pathname: string) {
  if (pathname === '/challenges/tasks') {
    return '/challenges';
  }
  if (pathname === '/challenges/new') {
    return '/challenges/tasks';
  }
  const challengeEditMatch = pathname.match(/^\/challenges\/([^/]+)\/edit$/);
  if (challengeEditMatch) {
    return '/challenges/tasks';
  }
  if (pathname.startsWith('/challenges/works/')) {
    return '/challenges?tab=works';
  }
  if (pathname.startsWith('/challenges/teams/')) {
    return '/challenges?tab=teams';
  }
  if (pathname.startsWith('/challenges/students/')) {
    return '/challenges?tab=students';
  }
  const courseChapterMatch = pathname.match(/^\/courses\/([^/]+)\/chapters\/[^/]+$/);
  if (courseChapterMatch) {
    return `/courses/${courseChapterMatch[1]}`;
  }
  const courseEditMatch = pathname.match(/^\/courses\/([^/]+)\/edit$/);
  if (courseEditMatch) {
    return `/courses/${courseEditMatch[1]}`;
  }
  if (/^\/courses\/[^/]+$/.test(pathname)) {
    return '/courses';
  }
  if (pathname.startsWith('/courses/new/chapters')) {
    return '/courses/new?step=chapters';
  }
  if (pathname === '/courses/new') {
    return '/courses';
  }
  return null;
}

export function ExpertWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, state } = useExpertStore();
  const session = getStoredSession();
  const titleMeta = getTitleMeta(pathname);
  const isTopLevel = NAV_ITEMS.some((item) => item.href === pathname);
  const isApproved = state.accountStatus === 'approved';
  const isPreOpenRoute =
    pathname === '/dashboard' ||
    pathname === '/me' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/me/profile') ||
    pathname.startsWith('/me/organization') ||
    pathname.startsWith('/me/account') ||
    pathname.startsWith('/me/orders') ||
    pathname.startsWith('/me/bank-card') ||
    pathname.startsWith('/me/invoice') ||
    pathname.startsWith('/me/settlement') ||
    pathname.startsWith('/me/settings');

  useEffect(() => {
    if (hydrated && !session) {
      router.replace('/login');
    }
  }, [hydrated, router, session]);

  useEffect(() => {
    if (hydrated && session && !isApproved && !isPreOpenRoute) {
      router.replace('/onboarding');
    }
  }, [hydrated, isApproved, isPreOpenRoute, router, session]);

  if (!hydrated) {
    return (
      <main className="expert-app-bg">
        <div className="expert-phone expert-loading">
          <Spin />
          <span>正在整理专家首页</span>
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
          {isTopLevel ? (
            <div className="expert-shell-side" />
          ) : (
            <Button
              aria-label="返回"
              className="expert-header-button"
              icon={<LeftOutlined />}
              shape="circle"
              type="text"
              onClick={() => {
                const backHref = getBackHref(pathname);
                if (backHref) {
                  router.replace(backHref);
                  return;
                }
                router.back();
              }}
            />
          )}
          <div className="expert-shell-title">
            <span>{state.expert.organization || session.user.organization}</span>
            <strong>{titleMeta.title}</strong>
            <small>{titleMeta.subtitle}</small>
          </div>
          <div className="expert-shell-side" />
        </header>

        <section className={`expert-shell-content${isTopLevel ? '' : ' expert-shell-content-subpage'}`}>{children}</section>

        {isTopLevel ? (
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
        ) : null}
      </div>
    </main>
  );
}
