'use client';

import {
  ApartmentOutlined,
  AppstoreOutlined,
  BookOutlined,
  BuildOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  FileProtectOutlined,
  FundProjectionScreenOutlined,
  HistoryOutlined,
  MessageOutlined,
  NodeIndexOutlined,
  NotificationOutlined,
  PicCenterOutlined,
  RadarChartOutlined,
  SafetyOutlined,
  ScheduleOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  TeamOutlined,
  ToolOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

export type OperatorPageKey =
  | 'dashboard'
  | 'organizations'
  | 'mentors'
  | 'team-assignments'
  | 'team-tasks'
  | 'team-photos'
  | 'students'
  | 'sos'
  | 'bases'
  | 'task-library'
  | 'task-types'
  | 'task-builder'
  | 'task-import'
  | 'part-timers'
  | 'audits'
  | 'performance'
  | 'rental-orders'
  | 'inventory'
  | 'devices'
  | 'sales-online'
  | 'sales-enterprise'
  | 'courses'
  | 'qa-records'
  | 'knowledge'
  | 'agents'
  | 'capability-elements'
  | 'question-bank'
  | 'growth-rules'
  | 'growth-goods'
  | 'assessment-settings';

export type CityPageKey = 'bases' | 'tasks' | 'audits' | 'performance';

export type NavigationItem<T extends string> = {
  key: T;
  title: string;
  subtitle: string;
  icon: ReactNode;
};

export const operatorNavigation: Array<{
  section: string;
  items: NavigationItem<OperatorPageKey>[];
}> = [
  {
    section: '经营总览',
    items: [
      {
        key: 'dashboard',
        title: '经营看板',
        subtitle: '关键指标、趋势与待办事项',
        icon: <FundProjectionScreenOutlined />,
      },
    ],
  },
  {
    section: '业务运营',
    items: [
      { key: 'organizations', title: '合作机构', subtitle: '机构档案与订单往来', icon: <ApartmentOutlined /> },
      { key: 'mentors', title: '研学导师', subtitle: '导师台账与带队表现', icon: <SolutionOutlined /> },
      { key: 'team-assignments', title: '团队安排', subtitle: '为团队安排导师与助理', icon: <TeamOutlined /> },
      { key: 'team-tasks', title: '团队任务', subtitle: '任务代操作与执行进度', icon: <ScheduleOutlined /> },
      { key: 'team-photos', title: '团队照片', subtitle: '上传、关联与人工修正', icon: <PicCenterOutlined /> },
      { key: 'students', title: '学员档案', subtitle: '成长记录与能力图表', icon: <UserSwitchOutlined /> },
      { key: 'sos', title: 'SOS 报警', subtitle: '安全事件与处理闭环', icon: <SafetyOutlined /> },
    ],
  },
  {
    section: '内容运营',
    items: [
      { key: 'bases', title: '研学基地', subtitle: '基地台账、热度与 POI', icon: <DeploymentUnitOutlined /> },
      { key: 'task-library', title: '任务库', subtitle: '任务模板与标签体系', icon: <AppstoreOutlined /> },
      { key: 'task-types', title: '任务类型', subtitle: '任务类型与默认规则', icon: <ClusterOutlined /> },
      { key: 'task-builder', title: '任务配置', subtitle: '区块编排与扫码预览', icon: <NodeIndexOutlined /> },
      { key: 'task-import', title: '智能录入', subtitle: '批量导入与智能入库流程', icon: <HistoryOutlined /> },
      { key: 'part-timers', title: '兼职人员', subtitle: '授权城市与工作权限', icon: <TeamOutlined /> },
      { key: 'audits', title: '数据审核', subtitle: '基地与任务审核队列', icon: <FileProtectOutlined /> },
      { key: 'performance', title: '业绩统计', subtitle: '维护数量、通过率与导出', icon: <FundProjectionScreenOutlined /> },
    ],
  },
  {
    section: '设备与订单',
    items: [
      { key: 'rental-orders', title: '租赁订单', subtitle: '租赁、交付、回收与收款', icon: <ShoppingCartOutlined /> },
      { key: 'inventory', title: '进销存总览', subtitle: '库存日报与状态汇总', icon: <DatabaseOutlined /> },
      { key: 'devices', title: '设备台账', subtitle: '序列号池与生命周期', icon: <DatabaseOutlined /> },
      { key: 'sales-online', title: '在线销售', subtitle: '商城订单与发货', icon: <ShopOutlined /> },
      { key: 'sales-enterprise', title: '企业销售', subtitle: '对公订单与收款', icon: <ShoppingCartOutlined /> },
    ],
  },
  {
    section: '专家内容运营',
    items: [
      { key: 'courses', title: '课程管理', subtitle: '审核、上架与数据看板', icon: <BookOutlined /> },
      { key: 'qa-records', title: '问答记录', subtitle: '匹配情况与补充答案', icon: <MessageOutlined /> },
      { key: 'knowledge', title: '知识库', subtitle: '知识条目与资讯发布', icon: <NotificationOutlined /> },
      { key: 'agents', title: '智能体管理', subtitle: '参数、统计与知识库关联', icon: <ToolOutlined /> },
    ],
  },
  {
    section: '系统配置',
    items: [
      { key: 'capability-elements', title: '能力元素', subtitle: '16 项能力与映射规则', icon: <RadarChartOutlined /> },
      { key: 'question-bank', title: '能力题库', subtitle: '题库维护与批量导入', icon: <BookOutlined /> },
      { key: 'growth-rules', title: '成长值规则', subtitle: '场景积分与即时生效', icon: <BuildOutlined /> },
      { key: 'growth-goods', title: '成长值商品', subtitle: '兑换商品与库存', icon: <ShopOutlined /> },
      { key: 'assessment-settings', title: '评测设置', subtitle: '年龄段答题时长配置', icon: <ScheduleOutlined /> },
    ],
  },
];

export const cityNavigation: NavigationItem<CityPageKey>[] = [
  { key: 'bases', title: '基地维护', subtitle: '维护授权城市研学基地', icon: <DeploymentUnitOutlined /> },
  { key: 'tasks', title: '任务维护', subtitle: '维护授权城市任务库', icon: <AppstoreOutlined /> },
  { key: 'audits', title: '审核记录', subtitle: '查看本人提交记录', icon: <FileProtectOutlined /> },
  { key: 'performance', title: '业绩统计', subtitle: '查看录入与通过数量', icon: <FundProjectionScreenOutlined /> },
];

export const operatorPageMap = Object.fromEntries(
  operatorNavigation.flatMap((section) =>
    section.items.map((item) => [item.key, item] as const),
  ),
) as Record<OperatorPageKey, NavigationItem<OperatorPageKey>>;

export const cityPageMap = Object.fromEntries(cityNavigation.map((item) => [item.key, item] as const)) as Record<
  CityPageKey,
  NavigationItem<CityPageKey>
>;

export function isOperatorPageKey(value: string): value is OperatorPageKey {
  return value in operatorPageMap;
}

export function isCityPageKey(value: string): value is CityPageKey {
  return value in cityPageMap;
}
