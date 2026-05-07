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
  { href: '/dashboard', label: '首页', icon: HomeOutlined },
  { href: '/agents', label: '智能体', icon: RobotOutlined },
  { href: '/courses', label: '课程', icon: BookOutlined },
  { href: '/content', label: '内容', icon: AppstoreOutlined },
  { href: '/me', label: '我的', icon: UserOutlined },
];

const TITLE_RULES = [
  { match: '/onboarding', title: '入驻申请', subtitle: '提交资料并等待运营审核' },
  { match: '/agents/new', title: '创建智能体', subtitle: '全屏流程配置专家陪伴入口' },
  { match: '/agents/', title: '智能体详情', subtitle: '资料、知识、测试与上架控制' },
  { match: '/agents', title: '智能体', subtitle: '列表、状态与运营数据' },
  { match: '/courses/new', title: '新建课程', subtitle: '线上、线下、PBL 与大咖面对面' },
  { match: '/courses/orders', title: '销售与订单', subtitle: '课程预约与支付数据' },
  { match: '/courses/writeoff', title: '课程核销', subtitle: '线下履约与预约码核销' },
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
              onClick={() => router.back()}
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
