'use client';

import '@ant-design/v5-patch-for-react-19';
import {
  BookOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  MobileOutlined,
  RadarChartOutlined,
  ReadOutlined,
  ReloadOutlined,
  RightOutlined,
  RocketOutlined,
  SendOutlined,
  ShoppingOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Checkbox, Drawer, Empty, Form, Input, InputNumber, Progress, Rate, Segmented, Spin, Tag, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearSession } from '../lib/api';
import {
  getCapabilityOverview,
  getCapabilityLevel,
  getMessageTypeLabel,
  getPortfolioAiRecordsByStudent,
  getPortfolioWorksByStudent,
  getSortedMessageCenterItems,
  getStudyDiaryItemsByStudent,
  getStudyDiaryTypeLabel,
  useParentStore,
  type FamilyTask,
  type TaskWork,
} from '../lib/parent-store';
import { ParentCapabilityList, ParentCapabilityPlaneOverview, ParentGrowthFrameworkChart, ParentGrowthSourceBreakdown, ParentRadarCard } from './parent-growth-ui';
import { ParentPhoneFrame, ParentStudentSwitcher, useParentSessionReady } from './parent-mobile-shell';

export type ParentTabKey = 'home' | 'growth' | 'portfolio' | 'tasks' | 'me';
type PortfolioPanelKey = 'works' | 'diary' | 'qa' | 'creation';

const TAB_ITEMS: Array<{ key: ParentTabKey; label: string; icon: React.ComponentType; href: string }> = [
  { key: 'home', label: '首页', icon: HomeOutlined, href: '/home' },
  { key: 'growth', label: '成长', icon: RadarChartOutlined, href: '/growth' },
  { key: 'portfolio', label: '作品', icon: BookOutlined, href: '/portfolio' },
  { key: 'tasks', label: '任务', icon: CheckCircleOutlined, href: '/family-tasks' },
  { key: 'me', label: '我的', icon: UserOutlined, href: '/me' },
];

function formatDate(value: string) {
  return value.length > 10 ? value.slice(0, 16).replace('T', ' ') : value;
}

function getTaskWork(task: FamilyTask, works: TaskWork[], studentId: string) {
  return works.find((work) => work.taskId === task.id && work.studentId === studentId) ?? null;
}

function getTaskStatusLabel(status: FamilyTask['status']) {
  const labels: Record<FamilyTask['status'], string> = {
    draft: '创建',
    published: '已下发',
    submitted: '待评分',
    scored: '已评分',
  };
  return labels[status];
}

function getTaskStatusTone(status: FamilyTask['status']) {
  const tones: Record<FamilyTask['status'], string> = {
    draft: 'default',
    published: 'processing',
    submitted: 'warning',
    scored: 'success',
  };
  return tones[status];
}


function MetricCard({ label, value, note, icon }: { label: string; value: string | number; note: string; icon: React.ReactNode }) {
  return (
    <div className="parent-metric">
      <span className="parent-metric-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <em>{note}</em>
      </div>
    </div>
  );
}

function OnboardingPanel({
  title,
  description,
  primaryLabel,
  onPrimary,
  onSecondary,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}) {
  return (
    <section className="parent-empty-guide onboarding">
      <div className="parent-empty-guide-icon">
        <UserOutlined />
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      <div className="parent-empty-guide-actions">
        <Button type="primary" onClick={onPrimary}>
          {primaryLabel}
        </Button>
        {onSecondary ? (
          <Button onClick={onSecondary} icon={<ReloadOutlined />}>
            恢复演示数据
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export function ParentMobileApp({ initialTab }: { initialTab: ParentTabKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useParentStore();
  const sessionReady = useParentSessionReady();
  const [messageApi, messageHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState<ParentTabKey>(initialTab);
  const [publishOpen, setPublishOpen] = useState(false);
  const [scoreWorkItem, setScoreWorkItem] = useState<TaskWork | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskPanel, setTaskPanel] = useState<'tasks' | 'students' | 'works'>('tasks');
  const [portfolioPanel, setPortfolioPanel] = useState<PortfolioPanelKey>('works');
  const handledTaskQuery = useRef('');
  const growthReportsRef = useRef<HTMLElement | null>(null);

  const flash = searchParams.get('flash');
  const selectTaskId = searchParams.get('selectTaskId');
  const portfolioPanelParam = searchParams.get('panel');
  const growthFocusParam = searchParams.get('focus');

  const { state, selectedStudent, capabilityAverage } = store;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!portfolioPanelParam) {
      return;
    }
    if (
      portfolioPanelParam === 'works' ||
      portfolioPanelParam === 'diary' ||
      portfolioPanelParam === 'qa' ||
      portfolioPanelParam === 'creation'
    ) {
      setPortfolioPanel(portfolioPanelParam);
      return;
    }
    setPortfolioPanel('works');
  }, [portfolioPanelParam]);

  useEffect(() => {
    if (!flash && !selectTaskId) {
      return;
    }

    const querySignature = `${flash ?? ''}|${selectTaskId ?? ''}`;
    if (handledTaskQuery.current === querySignature) {
      return;
    }
    handledTaskQuery.current = querySignature;

    if (selectTaskId) {
      setSelectedTaskIds([selectTaskId]);
    }
    if (flash === 'task_created') {
      messageApi.success('任务草稿已创建');
    }
    if (flash === 'task_updated') {
      messageApi.success('任务已更新');
    }

    router.replace('/family-tasks');
  }, [flash, messageApi, router, selectTaskId]);

  const selectedStudentId = selectedStudent?.id ?? '';
  const tasksForStudent = useMemo(() => {
    if (!selectedStudentId) {
      return state.familyTasks.filter((task) => task.status === 'draft');
    }
    return state.familyTasks.filter((task) => task.status === 'draft' || task.assignedStudentIds.includes(selectedStudentId));
  }, [selectedStudentId, state.familyTasks]);

  const worksForStudent = useMemo(
    () => (selectedStudentId ? state.works.filter((work) => work.studentId === selectedStudentId) : []),
    [selectedStudentId, state.works],
  );

  const reportsForStudent = useMemo(
    () => (selectedStudentId ? state.reports.filter((report) => report.studentId === selectedStudentId) : []),
    [selectedStudentId, state.reports],
  );
  const portfolioWorksForStudent = useMemo(() => getPortfolioWorksByStudent(state, selectedStudentId || null), [selectedStudentId, state]);
  const studyDiaryItems = useMemo(() => getStudyDiaryItemsByStudent(state, selectedStudentId || null), [selectedStudentId, state]);
  const aiQaRecords = useMemo(() => getPortfolioAiRecordsByStudent(state, selectedStudentId || null, 'qa'), [selectedStudentId, state]);
  const aiCreationRecords = useMemo(
    () => getPortfolioAiRecordsByStudent(state, selectedStudentId || null, 'creation'),
    [selectedStudentId, state],
  );
  const messageCenterItems = useMemo(() => getSortedMessageCenterItems(state, selectedStudentId || null), [selectedStudentId, state]);

  const pendingWorks = worksForStudent.filter((work) => work.status === 'synced');
  const publishedTasks = tasksForStudent.filter((task) => task.status !== 'draft');
  const scoredTasks = tasksForStudent.filter((task) => task.status === 'scored');
  const progressPercent = publishedTasks.length ? Math.round((scoredTasks.length / publishedTasks.length) * 100) : 0;
  const growthOverview = useMemo(() => getCapabilityOverview(selectedStudent), [selectedStudent]);
  const unreadMessageCount = messageCenterItems.filter((item) => !item.read).length;
  const recentMessages = messageCenterItems.slice(0, 3);
  const shouldShowStudentContext = activeTab !== 'me' && Boolean(selectedStudent);

  useEffect(() => {
    if (activeTab !== 'growth' || growthFocusParam !== 'reports' || !growthReportsRef.current) {
      return;
    }

    window.requestAnimationFrame(() => {
      growthReportsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [activeTab, growthFocusParam, reportsForStudent.length, selectedStudentId]);

  if (!sessionReady || !store.hydrated) {
    return (
      <ParentPhoneFrame>
        <div className="parent-loading">
          <Spin />
          <span>正在进入家长端</span>
        </div>
      </ParentPhoneFrame>
    );
  }

  function navigate(tab: ParentTabKey) {
    setActiveTab(tab);
    router.push(TAB_ITEMS.find((item) => item.key === tab)?.href ?? '/home');
  }

  function submitPublish(values: { studentIds: string[] }) {
    if (selectedTaskIds.length === 0) {
      messageApi.warning('请先勾选任务');
      return;
    }
    store.publishTasks(selectedTaskIds, values.studentIds?.length ? values.studentIds : selectedStudentId ? [selectedStudentId] : []);
    setPublishOpen(false);
    setSelectedTaskIds([]);
    messageApi.success('任务已下发到研学宝');
  }

  function submitScore(values: { rating: number; score: number; comment: string }) {
    if (!scoreWorkItem) {
      return;
    }
    store.scoreWork(scoreWorkItem.id, values);
    setScoreWorkItem(null);
    messageApi.success('评分已保存，成长记录已更新');
  }

  function openTimelineEntry(target: { relatedKind?: 'work' | 'record' | 'report' | 'ai'; relatedId?: string; id: string }) {
    if (target.relatedKind === 'report' && target.relatedId) {
      router.push(`/portfolio/reports/${target.relatedId}`);
      return;
    }
    if (target.relatedKind === 'work' && target.relatedId) {
      router.push(`/portfolio/works/${target.relatedId}`);
      return;
    }
    if (target.relatedKind === 'ai' && target.relatedId) {
      router.push(`/portfolio/ai/${target.relatedId}`);
      return;
    }
    router.push(`/portfolio/records/${target.id}`);
  }

  function renderHome() {
    if (!selectedStudent) {
      return (
        <div className="parent-page">
          <section className="parent-home-empty-card">
            <div className="parent-home-empty-icon">
              <UserOutlined />
            </div>
            <strong>先添加学员，开启家庭研学闭环</strong>
            <p>创建学员后会自动生成账号，接着即可绑定研学宝、完成评测与家庭任务。</p>
            <div className="parent-home-empty-actions">
              <Button type="primary" size="large" onClick={() => router.push('/me/students/editor')}>
                添加第一位学员
              </Button>
              <button type="button" className="parent-ghost-action" onClick={store.resetDemoData}>
                <ReloadOutlined />
                <span>恢复演示数据</span>
              </button>
            </div>
          </section>
          <section className="parent-section">
            <div className="parent-section-head">
              <strong>首次使用</strong>
              <span>推荐顺序</span>
            </div>
            <div className="parent-step-list">
              <div className="parent-step-card">
                <span className="parent-step-index">1</span>
                <div className="parent-step-body">
                  <div className="parent-step-title">
                    <strong>添加学员</strong>
                    <UserOutlined />
                  </div>
                  <em>创建学员档案并自动生成账号</em>
                </div>
              </div>
              <div className="parent-step-card">
                <span className="parent-step-index">2</span>
                <div className="parent-step-body">
                  <div className="parent-step-title">
                    <strong>绑定设备</strong>
                    <MobileOutlined />
                  </div>
                  <em>扫码绑定学员专属研学宝</em>
                </div>
              </div>
              <div className="parent-step-card">
                <span className="parent-step-index">3</span>
                <div className="parent-step-body">
                  <div className="parent-step-title">
                    <strong>开始研学</strong>
                    <RocketOutlined />
                  </div>
                  <em>创建任务、同步作品并完成评分</em>
                </div>
              </div>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="parent-page">
        <section className="parent-hero">
          <div className="parent-hero-main">
            <span className="parent-eyebrow">当前学员</span>
            <h1>{selectedStudent.name}</h1>
            <p>
              {selectedStudent.school} · {selectedStudent.grade} · 研学宝 ID {selectedStudent.yxbId}
            </p>
            <div className="parent-hero-actions">
              <Button size="small" onClick={() => router.push('/me/students')}>
                学员管理
              </Button>
              <Button size="small" type="primary" icon={<RadarChartOutlined />} onClick={() => router.push('/growth/assessment')}>
                家长评测
              </Button>
            </div>
          </div>
          <div className="parent-avatar">{selectedStudent.avatar}</div>
        </section>

        <div className="parent-metric-grid">
          <MetricCard label="能力指数" value={capabilityAverage.toFixed(1)} note={getCapabilityLevel(capabilityAverage)} icon={<RadarChartOutlined />} />
          <MetricCard label="成长值" value={selectedStudent.growthValue} note="累计成长值" icon={<StarOutlined />} />
        </div>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>家庭任务进度</strong>
            <button type="button" onClick={() => navigate('tasks')}>
              查看
            </button>
          </div>
          <Progress percent={progressPercent} strokeColor="#167c80" trailColor="#dce7e2" />
          <div className="parent-status-row">
            <span>已下发 {publishedTasks.length}</span>
            <span>待评分 {pendingWorks.length}</span>
            <span>已评分 {scoredTasks.length}</span>
          </div>
        </section>

        {pendingWorks.length > 0 ? (
          <section className="parent-section parent-attention">
            <div className="parent-section-head">
              <strong>待评分作品</strong>
              <Badge count={pendingWorks.length} />
            </div>
            {pendingWorks.slice(0, 2).map((work) => {
              const task = state.familyTasks.find((item) => item.id === work.taskId);
              return (
                <button key={work.id} type="button" className="parent-list-card" onClick={() => setScoreWorkItem(work)}>
                  <span>{task?.title ?? '家庭研学作品'}</span>
                  <em>{formatDate(work.submittedAt)}</em>
                </button>
              );
            })}
          </section>
        ) : null}

        <section className="parent-shop-banner" onClick={() => router.push('/me/device')}>
          <div>
            <span>研学宝智能硬件</span>
            <strong>进入我的设备管理与购买入口</strong>
          </div>
          <ShoppingOutlined />
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>常用入口</strong>
            <button type="button" onClick={store.resetDemoData}>
              恢复演示数据
            </button>
          </div>
          <div className="parent-shortcut-grid">
            <button type="button" onClick={() => router.push('/family-tasks/quick-create')}>
              <RocketOutlined />
              AI 创建
            </button>
            <button type="button" onClick={() => navigate('portfolio')}>
              <ReadOutlined />
              作品档案
            </button>
            <button type="button" onClick={() => router.push(`/me/device/scan?studentId=${selectedStudent.id}`)}>
              <MobileOutlined />
              绑定设备
            </button>
            <button type="button" onClick={() => router.push('/messages')}>
              <MessageOutlined />
              消息中心
            </button>
          </div>
        </section>

        <section className="parent-section parent-home-message-panel">
          <div className="parent-section-head">
            <strong>消息提醒</strong>
            <button type="button" onClick={() => router.push('/messages')}>
              查看全部
            </button>
          </div>
          <div className="parent-home-message-summary">
            <div>
              <span>未读消息</span>
              <strong>{unreadMessageCount}</strong>
            </div>
            <Badge count={unreadMessageCount} />
          </div>
          <div className="parent-home-message-list">
            {recentMessages.length ? (
              recentMessages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="parent-home-message-item"
                  onClick={() => {
                    if (item.relatedKind && item.relatedId) {
                      openTimelineEntry({ id: item.id, relatedKind: item.relatedKind, relatedId: item.relatedId });
                      return;
                    }
                    router.push('/messages');
                  }}
                >
                  <div>
                    <Tag color={item.type === 'sos' ? 'red' : item.type === 'system' ? 'blue' : 'green'}>{getMessageTypeLabel(item.type)}</Tag>
                    {!item.read ? <Badge status="processing" /> : null}
                  </div>
                  <strong>{item.title}</strong>
                  <span>{item.content}</span>
                  <em>{formatDate(item.createdAt)}</em>
                </button>
              ))
            ) : (
              <Empty description="暂无消息提醒" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </section>
      </div>
    );
  }

  function renderGrowth() {
    if (!selectedStudent) {
      return (
        <div className="parent-page">
          <OnboardingPanel
            title="还没有可追踪的成长数据"
            description="先添加学员并完成一次家长评测，成长页才会出现能力指数、报告和雷达图。"
            primaryLabel="去添加学员"
            onPrimary={() => router.push('/me/students/editor')}
          />
        </div>
      );
    }

    const planeLabels = growthOverview.planes.map((plane) => plane.planeTitle);
    return (
      <div className="parent-page">
        <section className="parent-growth-summary-card">
          <div className="parent-growth-summary-heading">
            <strong>能力雷达</strong>
            <p>能力指数由学员自测、家长评测和研学评价共同生成，并持续动态更新。</p>
          </div>

          <div className="parent-growth-summary-stats">
            <div className="parent-growth-summary-stat-card">
              <span>当前总指数</span>
              <strong>{growthOverview.currentIndex.toFixed(1)}</strong>
              <em>16 项能力指标平均值</em>
            </div>
            <div className="parent-growth-summary-stat-card level">
              <span>当前能力水平</span>
              <strong>{growthOverview.currentLevel}</strong>
              <em>根据 9 / 8 / 6 分阈值分级</em>
            </div>
          </div>

          <div className="parent-growth-summary-actions">
            <Button type="primary" icon={<RadarChartOutlined />} onClick={() => router.push('/growth/assessment')}>
              家长评测
            </Button>
          </div>
        </section>

        <ParentGrowthFrameworkChart
          capabilities={selectedStudent.capabilities}
          onOpenCapability={(capabilityId) => router.push(`/growth/capabilities/${capabilityId}`)}
        />
        <ParentCapabilityPlaneOverview planes={growthOverview.planes} />
        <ParentRadarCard
          title="能力平面雷达图"
          labels={planeLabels}
          values={growthOverview.planes.map((plane) => plane.score)}
          compareValues={growthOverview.planes.map((plane) => plane.averageScore)}
        />
        <ParentRadarCard
          title="优势能力雷达图"
          labels={growthOverview.strongest.map((item) => item.elementKey)}
          values={growthOverview.strongest.map((item) => item.score)}
          compareValues={growthOverview.strongest.map((item) => item.averageScore)}
        />
        <ParentRadarCard
          title="弱势能力雷达图"
          labels={growthOverview.weakest.map((item) => item.elementKey)}
          values={growthOverview.weakest.map((item) => item.score)}
          compareValues={growthOverview.weakest.map((item) => item.averageScore)}
        />
        <ParentGrowthSourceBreakdown level={growthOverview.currentLevel} items={growthOverview.sourceBreakdown} />
        <ParentCapabilityList
          capabilities={selectedStudent.capabilities}
          onOpenCapability={(capabilityId) => router.push(`/growth/capabilities/${capabilityId}`)}
        />

        <section ref={growthReportsRef} className="parent-section">
          <div className="parent-section-head">
            <strong>评测记录</strong>
            <span>{reportsForStudent.length} 份</span>
          </div>
          <div className="parent-card-list">
            {reportsForStudent.length ? (
              reportsForStudent.map((report) => (
                <button key={report.id} type="button" className="parent-list-card" onClick={() => router.push(`/portfolio/reports/${report.id}`)}>
                  <span>{report.title}</span>
                  <em>
                    {report.date} · {report.planeTitle}
                  </em>
                </button>
              ))
            ) : (
              <section className="parent-empty-guide compact">
                <Empty description="还没有评测记录" />
              </section>
            )}
          </div>
        </section>
      </div>
    );
  }

  function renderPortfolio() {
    if (!selectedStudent) {
      return (
        <div className="parent-page">
          <OnboardingPanel
            title="作品档案还没有开始积累"
            description="学员创建、设备绑定、任务评分和家长评测之后，设备端成长记录、任务作品和 AI 记录会自动沉淀在这里。"
            primaryLabel="去添加学员"
            onPrimary={() => router.push('/me/students/editor')}
          />
        </div>
      );
    }

    const latestPortfolioUpdate = portfolioWorksForStudent[0]?.updatedAt ?? portfolioWorksForStudent[0]?.submittedAt ?? '--';
    const latestDiaryDate = studyDiaryItems[0]?.date ?? '--';
    const latestAiAgent = aiQaRecords[0]?.agentName ?? '--';
    const creationTypes = Array.from(new Set(aiCreationRecords.map((record) => record.workType).filter(Boolean))).join(' / ') || '--';

    return (
      <div className="parent-page">
        <section className="parent-portfolio-overview">
          <div>
            <span>学习作品</span>
            <strong>{portfolioWorksForStudent.length} 项</strong>
            <em>设备端同步创建</em>
          </div>
          <div>
            <span>研学日记</span>
            <strong>{studyDiaryItems.length} 篇</strong>
            <em>最近 {formatDate(latestDiaryDate)}</em>
          </div>
        </section>

        <Segmented
          block
          value={portfolioPanel}
          onChange={(value) => setPortfolioPanel(value as PortfolioPanelKey)}
          options={[
            { label: '学习作品', value: 'works' },
            { label: '研学日记', value: 'diary' },
            { label: 'AI问答', value: 'qa' },
            { label: 'AI创作', value: 'creation' },
          ]}
        />

        {portfolioPanel === 'works' ? (
          <section className="parent-card-list">
            <div className="parent-stat-strip multi">
              <span>累计作品 {portfolioWorksForStudent.length}</span>
              <span>已同步 {portfolioWorksForStudent.length}</span>
              <span>最近更新 {formatDate(latestPortfolioUpdate)}</span>
            </div>
            {portfolioWorksForStudent.length ? (
              portfolioWorksForStudent.map((work) => (
                <button key={work.id} type="button" className="parent-learning-work-card" onClick={() => router.push(`/portfolio/works/${work.id}`)}>
                  <div className="parent-learning-work-head">
                    <strong>{work.taskTitle}</strong>
                    <Tag color={work.status === 'scored' ? 'green' : 'gold'}>{work.rating ?? (work.status === 'scored' ? '已提交' : '待评分')}</Tag>
                  </div>
                  <div className="parent-learning-work-tags">
                    <Tag color={work.workCategory === '闪记日记' ? 'blue' : 'gold'}>{work.workCategory}</Tag>
                    <span>
                      {work.topicType} · {work.completionMode || '独立完成'} · {work.workKind}
                    </span>
                  </div>
                  <p>{work.summary}</p>
                  <em>当前内容：{work.currentContent || work.textContent || work.summary}</em>
                  <small>最近更新：{formatDate(work.updatedAt || work.submittedAt)}</small>
                </button>
              ))
            ) : (
              <Empty description="暂无学习作品" />
            )}
          </section>
        ) : null}

        {portfolioPanel === 'diary' ? (
          <section className="parent-card-list">
            <div className="parent-stat-strip multi">
              <span>累计日记 {studyDiaryItems.length}</span>
              <span>关联作品 {studyDiaryItems.filter((item) => item.type === 'work').length}</span>
              <span>最近日记 {formatDate(latestDiaryDate)}</span>
            </div>
            {studyDiaryItems.length ? (
              studyDiaryItems.map((item) => (
                <button key={item.id} type="button" className="parent-diary-card" onClick={() => router.push(`/portfolio/diaries/${item.id}`)}>
                  <div className="parent-diary-card-meta">
                    <Tag color={item.type === 'work' ? 'blue' : item.type === 'growth_value' ? 'green' : 'gold'}>
                      {getStudyDiaryTypeLabel(item.type)}
                    </Tag>
                    <em>{formatDate(item.date)}</em>
                  </div>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                  <span>
                    {item.source}
                    {item.media?.length ? ` · ${item.media.length} 项素材` : ''}
                  </span>
                </button>
              ))
            ) : (
              <Empty description="暂无研学日记" />
            )}
          </section>
        ) : null}

        {portfolioPanel === 'qa' ? (
          <section className="parent-card-list">
            <div className="parent-stat-strip multi">
              <span>累计问答 {aiQaRecords.length}</span>
              <span>最近智能体 {latestAiAgent}</span>
            </div>
            {aiQaRecords.length ? (
              aiQaRecords.map((item) => (
                <button key={item.id} type="button" className="parent-list-card" onClick={() => router.push(`/portfolio/ai/${item.id}`)}>
                  <span>{item.title}</span>
                  <em>
                    {item.agentName} · {formatDate(item.createdAt)} · {item.questionCount ?? 1} 问
                  </em>
                </button>
              ))
            ) : (
              <Empty description="暂无 AI 问答" />
            )}
          </section>
        ) : null}

        {portfolioPanel === 'creation' ? (
          <section className="parent-card-list">
            <div className="parent-stat-strip multi">
              <span>累计创作 {aiCreationRecords.length}</span>
              <span>创作类型 {creationTypes}</span>
            </div>
            {aiCreationRecords.length ? (
              aiCreationRecords.map((item) => (
                <button key={item.id} type="button" className="parent-list-card" onClick={() => router.push(`/portfolio/ai/${item.id}`)}>
                  <span>{item.title}</span>
                  <em>
                    {item.workType ?? 'AI 创作'} · {formatDate(item.createdAt)}
                  </em>
                </button>
              ))
            ) : (
              <Empty description="暂无 AI 创作" />
            )}
          </section>
        ) : null}
      </div>
    );
  }

  function renderTasks() {
    if (!selectedStudent) {
      return (
        <div className="parent-page">
          <OnboardingPanel
            title="还没有可下发任务的学员"
            description="先创建学员，再绑定研学宝设备，就可以把家庭任务下发到设备端并完成评分闭环。"
            primaryLabel="去添加学员"
            onPrimary={() => router.push('/me/students/editor')}
          />
        </div>
      );
    }

    return (
      <div className="parent-page">
        {!selectedStudent.device ? (
          <section className="parent-empty-guide compact">
            <MobileOutlined />
            <strong>请先绑定研学宝</strong>
            <p>家庭研学任务需要下发到学员研学宝设备，设备端完成后作品才会同步回来。</p>
            <Button type="primary" onClick={() => router.push(`/me/device/scan?studentId=${selectedStudent.id}`)}>
              去绑定设备
            </Button>
          </section>
        ) : null}

        <section className="parent-task-overview">
          <div>
            <span>家庭研学任务面板</span>
            <strong>{progressPercent}%</strong>
            <em>
              已完成 {scoredTasks.length}/{publishedTasks.length || 0}
            </em>
          </div>
          <Progress type="circle" percent={progressPercent} size={76} strokeColor="#167c80" />
        </section>

        <Segmented
          block
          value={taskPanel}
          onChange={(value) => setTaskPanel(value as typeof taskPanel)}
          options={[
            { label: '任务', value: 'tasks' },
            { label: '学员', value: 'students' },
            { label: '作品', value: 'works' },
          ]}
        />

        {taskPanel === 'tasks' ? (
          <section className="parent-card-list">
            <div className="parent-action-row">
              <Button icon={<RocketOutlined />} onClick={() => router.push('/family-tasks/quick-create')}>
                AI 创建
              </Button>
              <Button icon={<ReadOutlined />} onClick={() => router.push('/family-tasks/editor')}>
                自定义
              </Button>
              <Button type="primary" icon={<SendOutlined />} onClick={() => setPublishOpen(true)} disabled={selectedTaskIds.length === 0}>
                下发
              </Button>
            </div>
            <Checkbox.Group value={selectedTaskIds} onChange={(values) => setSelectedTaskIds(values.map(String))} className="parent-task-check-group">
              {tasksForStudent.length ? (
                tasksForStudent.map((task) => {
                  const work = getTaskWork(task, state.works, selectedStudent.id);
                  return (
                    <div key={task.id} className="parent-task-card">
                      <Checkbox value={task.id} disabled={task.status !== 'draft'} />
                      <div className="parent-task-main">
                        <div className="parent-task-title">
                          <strong>{task.title}</strong>
                          <Tag color={getTaskStatusTone(task.status)}>{getTaskStatusLabel(task.status)}</Tag>
                        </div>
                        <p>{task.description}</p>
                        <div className="parent-tag-row">
                          <Tag>{task.base}</Tag>
                          <Tag>{task.points} 分</Tag>
                          {task.capabilityTags.slice(0, 2).map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                        <div className="parent-action-row compact">
                          <Button size="small" onClick={() => router.push(`/family-tasks/editor?taskId=${task.id}`)} disabled={task.status !== 'draft'}>
                            编辑
                          </Button>
                          {task.status === 'published' ? (
                            <Button size="small" type="primary" onClick={() => store.syncDeviceWork(task.id, selectedStudent.id)}>
                              同步设备作品
                            </Button>
                          ) : null}
                          {work && work.status === 'synced' ? (
                            <Button size="small" onClick={() => setScoreWorkItem(work)}>
                              评分
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <section className="parent-empty-guide compact">
                  <Empty description="还没有家庭任务" />
                </section>
              )}
            </Checkbox.Group>
          </section>
        ) : null}

        {taskPanel === 'students' ? (
          <section className="parent-card-list">
            {state.students.map((student) => {
              const assigned = state.familyTasks.filter((task) => task.assignedStudentIds.includes(student.id));
              const completed = assigned.filter((task) => task.status === 'scored').length;
              return (
                <div key={student.id} className="parent-student-progress">
                  <div className="parent-avatar small">{student.avatar}</div>
                  <div>
                    <strong>{student.name}</strong>
                    <span>
                      任务进度 {completed}/{assigned.length}
                    </span>
                    <Progress percent={assigned.length ? Math.round((completed / assigned.length) * 100) : 0} showInfo={false} />
                  </div>
                </div>
              );
            })}
          </section>
        ) : null}

        {taskPanel === 'works' ? (
          <section className="parent-card-list">
            {worksForStudent.length ? (
              worksForStudent.map((work) => {
                const task = state.familyTasks.find((item) => item.id === work.taskId);
                return (
                  <div key={work.id} className="parent-work-card">
                    <button type="button" onClick={() => router.push(`/portfolio/works/${work.id}`)}>
                      <strong>{task?.title ?? '作品详情'}</strong>
                      <span>
                        {formatDate(work.submittedAt)} · AI {work.aiScore ?? '-'} 分
                      </span>
                    </button>
                    {work.status === 'synced' ? (
                      <Button size="small" type="primary" onClick={() => setScoreWorkItem(work)}>
                        评分
                      </Button>
                    ) : (
                      <Tag color="green">{work.rating} 星</Tag>
                    )}
                  </div>
                );
              })
            ) : (
              <Empty description="暂无设备端同步作品" />
            )}
          </section>
        ) : null}
      </div>
    );
  }

  function renderMe() {
    return (
      <div className="parent-page">
        <section className="parent-me-card">
          <div className="parent-me-top">
            <div className="parent-avatar">{state.parentProfile.avatar}</div>
            <div className="parent-me-main">
              <strong>{state.parentProfile.name}</strong>
              <span>{state.parentProfile.role}</span>
              <em>
                账号 {state.parentProfile.accountName} · {state.parentProfile.phone}
              </em>
            </div>
          </div>
          <div className="parent-me-grid">
            <span>
              所在城市
              <strong>{state.parentProfile.city}</strong>
            </span>
            <span>
              家庭状态
              <strong>{state.parentProfile.relationLabel}</strong>
            </span>
            <span>
              开通时间
              <strong>{state.parentProfile.memberSince}</strong>
            </span>
            <span>
              当前学员
              <strong>{selectedStudent?.name ?? '未添加'}</strong>
            </span>
          </div>
        </section>

        <section className="parent-entry-list">
          <button type="button" className="parent-entry-card" onClick={() => router.push('/me/students')}>
            <div>
              <TeamOutlined />
              <div>
                <strong>学员管理</strong>
                <span>{state.students.length ? `${state.students.length} 位学员，含账号与绑定状态` : '创建学员并自动生成账号'}</span>
              </div>
            </div>
            <RightOutlined />
          </button>
          <button type="button" className="parent-entry-card" onClick={() => router.push('/me/device')}>
            <div>
              <MobileOutlined />
              <div>
                <strong>设备管理</strong>
                <span>{selectedStudent?.device ? `当前设备 ${selectedStudent.device.deviceCode}` : '扫码绑定研学宝设备'}</span>
              </div>
            </div>
            <RightOutlined />
          </button>
          <button type="button" className="parent-entry-card" onClick={() => router.push('/messages')}>
            <div>
              <MessageOutlined />
              <div>
                <strong>消息中心</strong>
                <span>{unreadMessageCount ? `当前有 ${unreadMessageCount} 条未读消息` : '查看团队、小组、家庭与系统消息'}</span>
              </div>
            </div>
            <RightOutlined />
          </button>
          <button type="button" className="parent-entry-card" onClick={() => router.push('/me/device')}>
            <div>
              <ShoppingOutlined />
              <div>
                <strong>订单与购买</strong>
                <span>{state.orders.length ? `已有 ${state.orders.length} 条演示订单` : '查看研学宝优惠订购入口'}</span>
              </div>
            </div>
            <RightOutlined />
          </button>
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>演示数据</strong>
            <span>便于反复验收流程</span>
          </div>
          <div className="parent-action-column">
            <Button block icon={<ReloadOutlined />} onClick={store.resetDemoData}>
              恢复演示数据
            </Button>
            <Button block icon={<LogoutOutlined />} onClick={() => {
              clearSession();
              router.push('/login');
            }}>
              退出登录
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const activeTitle = TAB_ITEMS.find((item) => item.key === activeTab)?.label ?? '首页';

  return (
    <ParentPhoneFrame>
      {messageHolder}
      <header className="parent-shell-header">
        <div>
          <span>研学宝家长端</span>
          <strong>{activeTitle}</strong>
        </div>
      </header>

      <div className="parent-shell-content">
        {shouldShowStudentContext && selectedStudent ? (
          <section className="parent-student-context-bar">
            <div className="parent-student-context-copy">
              <span>当前学员</span>
              <strong>{selectedStudent.name}</strong>
              <em>
                {selectedStudent.school} · {selectedStudent.grade} · 研学宝 ID {selectedStudent.yxbId}
              </em>
            </div>
            <ParentStudentSwitcher
              students={state.students}
              selectedStudentId={selectedStudent.id}
              onChange={store.selectStudent}
              variant="prominent"
            />
          </section>
        ) : null}
        {activeTab === 'home' ? renderHome() : null}
        {activeTab === 'growth' ? renderGrowth() : null}
        {activeTab === 'portfolio' ? renderPortfolio() : null}
        {activeTab === 'tasks' ? renderTasks() : null}
        {activeTab === 'me' ? renderMe() : null}
      </div>

      <nav className="parent-bottom-nav">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.key} type="button" className={activeTab === item.key ? 'active' : ''} onClick={() => navigate(item.key)}>
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <Drawer
        title="下发任务"
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        placement="bottom"
        height={320}
        getContainer={false}
        rootClassName="parent-detail-drawer"
      >
        <Form
          key={`publish-${selectedStudentId}-${selectedTaskIds.join('-') || 'empty'}`}
          layout="vertical"
          initialValues={{ studentIds: selectedStudentId ? [selectedStudentId] : [] }}
          onFinish={submitPublish}
        >
          <Form.Item label="已选任务">
            <div className="parent-selected-list">
              {selectedTaskIds.map((taskId) => (
                <Tag key={taskId}>{state.familyTasks.find((task) => task.id === taskId)?.title ?? taskId}</Tag>
              ))}
            </div>
          </Form.Item>
          <Form.Item name="studentIds" label="下发学员" rules={[{ required: true, message: '请选择学员' }]}>
            <Checkbox.Group options={state.students.map((student) => ({ label: student.name, value: student.id }))} />
          </Form.Item>
          <Button block type="primary" htmlType="submit">
            确认下发到研学宝
          </Button>
        </Form>
      </Drawer>

      <Drawer
        title="作品评分"
        open={Boolean(scoreWorkItem)}
        onClose={() => setScoreWorkItem(null)}
        placement="bottom"
        height={420}
        getContainer={false}
        rootClassName="parent-detail-drawer"
      >
        {scoreWorkItem ? (
          <div className="parent-modal-stack">
            <p>{scoreWorkItem.content}</p>
            <div className="parent-tag-row">
              {scoreWorkItem.attachments.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
            <Form
              key={scoreWorkItem.id}
              layout="vertical"
              onFinish={submitScore}
              initialValues={{
                rating: scoreWorkItem.rating ?? 4,
                score:
                  scoreWorkItem.parentScore ??
                  scoreWorkItem.aiScore ??
                  Math.round((state.familyTasks.find((task) => task.id === scoreWorkItem.taskId)?.points ?? 20) * 0.8),
                comment: scoreWorkItem.comment ?? '观察认真，表达清楚，可以继续补充更多自己的判断。',
              }}
            >
              <Form.Item name="rating" label="星级" rules={[{ required: true, message: '请选择星级' }]}>
                <Rate />
              </Form.Item>
              <Form.Item name="score" label="分数" rules={[{ required: true, message: '请输入分数' }]}>
                <InputNumber min={0} max={state.familyTasks.find((task) => task.id === scoreWorkItem.taskId)?.points ?? 50} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="comment" label="评价">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button block type="primary" htmlType="submit">
                保存评分
              </Button>
            </Form>
          </div>
        ) : null}
      </Drawer>
    </ParentPhoneFrame>
  );
}
