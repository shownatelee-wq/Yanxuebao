'use client';

import '@ant-design/v5-patch-for-react-19';
import {
  BookOutlined,
  CheckCircleOutlined,
  CloudOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
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
import { Badge, Button, Carousel, Checkbox, Drawer, Empty, Form, Input, Progress, Segmented, Select, Spin, Tag, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { type CSSProperties, type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { clearSession } from '../lib/api';
import {
  getCapabilityOverview,
  getCapabilityLevel,
  getEnrollmentMissingFields,
  getMessageTypeLabel,
  getPortfolioAiRecordsByStudent,
  getPortfolioTimelineEntries,
  getPortfolioWorksByStudent,
  getSortedMessageCenterItems,
  getTimelineEntryLabel,
  INTEREST_OPTIONS,
  TALENT_OPTIONS,
  useParentStore,
  type FamilyTask,
  type ParentFamilyTeam,
  type ParentOrder,
  type ParentPhotoRecord,
  type ParentStudent,
  type PortfolioAttachment,
  type PortfolioTimelineEntry,
  type TaskWork,
} from '../lib/parent-store';
import {
  ParentAssessmentRecordCard,
  ParentCapabilityImprovementList,
  ParentCapabilityList,
  ParentCapabilityPlaneOverview,
  ParentGrowthFrameworkChart,
  ParentGrowthSourceBreakdown,
  ParentRadarCard,
  buildCapabilityImprovementRadarItems,
} from './parent-growth-ui';
import { ParentPhoneFrame, ParentStudentSwitcher, useParentSessionReady } from './parent-mobile-shell';

export type ParentTabKey = 'home' | 'tasks' | 'growth' | 'portfolio' | 'device' | 'me';
type PortfolioPanelKey = 'timeline' | 'tasks' | 'qa' | 'photos' | 'achievements' | 'flash' | 'reviews';
type HomeOrderTab = '全部' | '报名缴费' | '专家课程' | '难题挑战';

const TAB_ITEMS: Array<{ key: ParentTabKey; label: string; icon: React.ComponentType; href: string }> = [
  { key: 'home', label: '首页', icon: HomeOutlined, href: '/home' },
  { key: 'tasks', label: '任务', icon: CheckCircleOutlined, href: '/family-tasks' },
  { key: 'growth', label: '能力', icon: RadarChartOutlined, href: '/growth' },
  { key: 'portfolio', label: '日记', icon: BookOutlined, href: '/portfolio' },
  { key: 'device', label: '设备', icon: MobileOutlined, href: '/device' },
];
const HOME_ORDER_TABS: HomeOrderTab[] = ['全部', '报名缴费', '专家课程', '难题挑战'];
const SCORE_OPTIONS = Array.from({ length: 11 }, (_, index) => index);

function formatDate(value: string) {
  return value.length > 10 ? value.slice(0, 16).replace('T', ' ') : value;
}

function formatDay(value: string) {
  return value.slice(0, 10);
}

function getPortfolioEntryRoute(entry: PortfolioTimelineEntry) {
  if (entry.relatedKind === 'work' && entry.relatedId) {
    return `/portfolio/works/${entry.relatedId}`;
  }
  if (entry.relatedKind === 'report' && entry.relatedId) {
    return `/portfolio/reports/${entry.relatedId}`;
  }
  if (entry.relatedKind === 'ai' && entry.relatedId) {
    return `/portfolio/ai/${entry.relatedId}`;
  }
  if (entry.id.startsWith('timeline_manual_')) {
    return `/portfolio/diaries/${entry.id.replace('timeline_manual_', '')}`;
  }
  return `/portfolio/records/${entry.id}`;
}

function getTimelineTagColor(type: PortfolioTimelineEntry['entryType']) {
  if (type === 'photo' || type === 'achievement') return 'purple';
  if (type === 'review' || type === 'assessment') return 'green';
  if (type === 'challenge') return 'orange';
  if (type === 'ai_qa' || type === 'ai_creation') return 'blue';
  return 'gold';
}

function getTaskWork(task: FamilyTask, works: TaskWork[], studentId: string) {
  return works.find((work) => work.taskId === task.id && work.studentId === studentId) ?? null;
}

const QR_GRID_SIZE = 25;

function createInviteQrCells(value: string) {
  return Array.from({ length: QR_GRID_SIZE * QR_GRID_SIZE }, (_, index) => {
    const row = Math.floor(index / QR_GRID_SIZE);
    const column = index % QR_GRID_SIZE;
    return shouldRenderQrModule(value, row, column) ? { row, column } : null;
  }).filter((cell): cell is { row: number; column: number } => Boolean(cell));
}

function shouldRenderQrModule(value: string, row: number, column: number) {
  const inFinder =
    (row < 8 && column < 8) ||
    (row < 8 && column >= QR_GRID_SIZE - 8) ||
    (row >= QR_GRID_SIZE - 8 && column < 8);

  if (inFinder || (row >= 10 && row <= 14 && column >= 10 && column <= 14)) {
    return false;
  }

  const seed = value || 'yanxuebao-invite';
  const code = seed.charCodeAt((row * 7 + column * 11) % seed.length);
  const pattern = (code + row * row * 3 + column * column * 5 + row * column * 7) % 13;
  return pattern === 0 || pattern === 2 || pattern === 5 || ((row + column) % 7 === 0 && pattern < 10);
}

function ParentInviteQrCode({ value }: { value: string }) {
  return (
    <div className="parent-invite-qr-card" aria-label="研学邀伴二维码">
      <div className="parent-invite-qr">
        {createInviteQrCells(value).map(({ row, column }) => (
          <i
            key={`${row}-${column}`}
            style={{ gridColumnStart: column + 1, gridRowStart: row + 1 } as CSSProperties}
          />
        ))}
        <span className="parent-invite-qr-finder top-left" />
        <span className="parent-invite-qr-finder top-right" />
        <span className="parent-invite-qr-finder bottom-left" />
        <strong>研</strong>
      </div>
    </div>
  );
}

function escapeSvgText(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrapSvgText(value: string, maxLength: number) {
  const chars = Array.from(value);
  const lines: string[] = [];
  for (let index = 0; index < chars.length; index += maxLength) {
    lines.push(chars.slice(index, index + maxLength).join(''));
  }
  return lines.slice(0, 3);
}

function renderInvitePosterQr(value: string, x: number, y: number, size: number) {
  const moduleSize = size / QR_GRID_SIZE;
  const modules = createInviteQrCells(value)
    .map(({ row, column }) => `<rect x="${x + column * moduleSize}" y="${y + row * moduleSize}" width="${moduleSize * 0.82}" height="${moduleSize * 0.82}" rx="1.5" fill="#101828" />`)
    .join('');
  const finderSize = moduleSize * 7;
  const finderInner = finderSize * 0.36;
  const finders = [
    [x, y],
    [x + size - finderSize, y],
    [x, y + size - finderSize],
  ]
    .map(
      ([left, top]) => `
        <rect x="${left}" y="${top}" width="${finderSize}" height="${finderSize}" rx="8" fill="#fff" stroke="#101828" stroke-width="12" />
        <rect x="${left + finderSize / 2 - finderInner / 2}" y="${top + finderSize / 2 - finderInner / 2}" width="${finderInner}" height="${finderInner}" rx="4" fill="#101828" />
      `,
    )
    .join('');

  return `
    <rect x="${x - 20}" y="${y - 20}" width="${size + 40}" height="${size + 40}" rx="26" fill="#fff" stroke="#dbe7e6" />
    ${modules}
    ${finders}
    <circle cx="${x + size / 2}" cy="${y + size / 2}" r="32" fill="#0f8f88" stroke="#fff" stroke-width="8" />
    <text x="${x + size / 2}" y="${y + size / 2 + 11}" text-anchor="middle" font-size="30" font-weight="900" fill="#fff">研</text>
  `;
}

function buildInvitePosterImage(input: { team: ParentFamilyTeam; parentName: string; inviteUrl: string }) {
  const goalLines = wrapSvgText(input.team.goal, 18);
  const goalTspans = goalLines
    .map((line, index) => `<tspan x="72" dy="${index === 0 ? 0 : 34}">${escapeSvgText(line)}</tspan>`)
    .join('');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1060" viewBox="0 0 720 1060">
      <defs>
        <linearGradient id="inviteBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0f8f88" />
          <stop offset="1" stop-color="#315f9b" />
        </linearGradient>
      </defs>
      <rect width="720" height="1060" rx="44" fill="#f6fbfa" />
      <rect x="40" y="40" width="640" height="410" rx="34" fill="url(#inviteBg)" />
      <text x="72" y="116" font-size="28" font-weight="800" fill="rgba(255,255,255,0.82)">研学宝邀伴</text>
      <text x="72" y="184" font-size="46" font-weight="900" fill="#fff">${escapeSvgText(input.team.name)}</text>
      <text x="72" y="242" font-size="28" font-weight="700" fill="rgba(255,255,255,0.9)">${escapeSvgText(input.parentName)} 邀请你加入</text>
      <text x="72" y="314" font-size="30" font-weight="850" fill="#fff">${escapeSvgText(input.team.theme)}</text>
      <text x="72" y="374" font-size="24" fill="rgba(255,255,255,0.9)">${escapeSvgText(input.team.location)} · ${escapeSvgText(input.team.studyDate)}</text>
      <rect x="72" y="480" width="576" height="188" rx="28" fill="#fff" />
      <text x="72" y="532" font-size="24" font-weight="850" fill="#0f766e">研学目标</text>
      <text y="585" font-size="26" font-weight="700" fill="#344054">${goalTspans}</text>
      ${renderInvitePosterQr(input.inviteUrl, 250, 710, 220)}
      <text x="360" y="976" text-anchor="middle" font-size="26" font-weight="850" fill="#101828">扫码查看团队信息并为孩子报名</text>
      <text x="360" y="1018" text-anchor="middle" font-size="22" fill="#667085">${escapeSvgText(input.inviteUrl)}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
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

function StudentAvatar({ student, size = 'default' }: { student: ParentStudent; size?: 'default' | 'small' }) {
  return (
    <div className={`parent-avatar${size === 'small' ? ' small' : ''}`}>
      {student.avatarImage ? (
        <span
          className="parent-avatar-photo"
          role="img"
          aria-label={`${student.name}头像`}
          style={{ backgroundImage: `url(${student.avatarImage})` }}
        />
      ) : (
        student.avatar
      )}
    </div>
  );
}

function ScorePicker({ value, onChange }: { value?: number; onChange?: (value: number) => void }) {
  return (
    <div className="parent-score-picker">
      {SCORE_OPTIONS.map((score) => (
        <button
          key={score}
          type="button"
          className={value === score ? 'active' : ''}
          onClick={() => onChange?.(score)}
        >
          {score}
        </button>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon,
  onClick,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="parent-metric-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <em>{note}</em>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className="parent-metric clickable" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <div className="parent-metric">
      {content}
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
  const [portfolioPanel, setPortfolioPanel] = useState<PortfolioPanelKey>('timeline');
  const [growthLedgerOpen, setGrowthLedgerOpen] = useState(false);
  const [talentOpen, setTalentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ParentOrder | null>(null);
  const [homeOrderTab, setHomeOrderTab] = useState<HomeOrderTab>('全部');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitePosterUrl, setInvitePosterUrl] = useState('');
  const [teamOpen, setTeamOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<FamilyTask | null>(null);
  const [editingMedia, setEditingMedia] = useState<{ kind: 'photo' | 'achievement'; id: string } | null>(null);
  const handledTaskQuery = useRef('');
  const growthReportsRef = useRef<HTMLElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const achievementInputRef = useRef<HTMLInputElement | null>(null);

  const flash = searchParams.get('flash');
  const studentIdParam = searchParams.get('studentId');
  const selectTaskId = searchParams.get('selectTaskId');
  const orderIdParam = searchParams.get('orderId');
  const portfolioPanelParam = searchParams.get('panel');
  const growthFocusParam = searchParams.get('focus');

  const { state, selectedStudent, capabilityAverage } = store;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!studentIdParam || state.selectedStudentId === studentIdParam) {
      return;
    }
    if (state.students.some((student) => student.id === studentIdParam)) {
      store.selectStudent(studentIdParam);
    }
  }, [state.selectedStudentId, state.students, store, studentIdParam]);

  useEffect(() => {
    if (!portfolioPanelParam) {
      return;
    }
    if (portfolioPanelParam === 'timeline' || portfolioPanelParam === 'tasks' || portfolioPanelParam === 'qa' || portfolioPanelParam === 'photos' || portfolioPanelParam === 'achievements' || portfolioPanelParam === 'flash' || portfolioPanelParam === 'reviews') {
      setPortfolioPanel(portfolioPanelParam);
      return;
    }
    setPortfolioPanel(portfolioPanelParam === 'works' || portfolioPanelParam === 'diary' || portfolioPanelParam === 'creation' ? 'timeline' : 'timeline');
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

  useEffect(() => {
    if (!orderIdParam) {
      return;
    }
    const order = state.orders.find((item) => item.id === orderIdParam);
    if (order) {
      setSelectedOrder(order);
      router.replace('/home');
    }
  }, [orderIdParam, router, state.orders]);

  const selectedStudentId = selectedStudent?.id ?? '';
  const selectedFamilyTeam = useMemo(
    () => state.familyTeams.find((team) => team.id === state.selectedFamilyTeamId) ?? state.familyTeams[0] ?? null,
    [state.familyTeams, state.selectedFamilyTeamId],
  );

  useEffect(() => {
    setInvitePosterUrl('');
  }, [selectedFamilyTeam?.id]);

  const tasksForStudent = useMemo(() => {
    const activeTeamId = selectedFamilyTeam?.id;
    if (!selectedStudentId) {
      return state.familyTasks.filter((task) => task.status === 'draft' && (!activeTeamId || task.familyTeamId === activeTeamId));
    }
    return state.familyTasks.filter(
      (task) =>
        (!activeTeamId || task.familyTeamId === activeTeamId) &&
        (task.status === 'draft' || task.assignedStudentIds.includes(selectedStudentId)),
    );
  }, [selectedFamilyTeam?.id, selectedStudentId, state.familyTasks]);

  const worksForStudent = useMemo(
    () => (selectedStudentId ? state.works.filter((work) => work.studentId === selectedStudentId) : []),
    [selectedStudentId, state.works],
  );

  const reportsForStudent = useMemo(
    () => (selectedStudentId ? state.reports.filter((report) => report.studentId === selectedStudentId) : []),
    [selectedStudentId, state.reports],
  );
  const portfolioWorksForStudent = useMemo(() => getPortfolioWorksByStudent(state, selectedStudentId || null), [selectedStudentId, state]);
  const aiQaRecords = useMemo(() => getPortfolioAiRecordsByStudent(state, selectedStudentId || null, 'qa'), [selectedStudentId, state]);
  const aiCreationRecords = useMemo(
    () => getPortfolioAiRecordsByStudent(state, selectedStudentId || null, 'creation'),
    [selectedStudentId, state],
  );
  const portfolioTimelineEntries = useMemo(
    () => getPortfolioTimelineEntries(state, selectedStudentId || null),
    [selectedStudentId, state],
  );
  const messageCenterItems = useMemo(() => getSortedMessageCenterItems(state, selectedStudentId || null), [selectedStudentId, state]);
  const ordersForStudent = useMemo(
    () => state.orders.filter((order) => !order.studentId || !selectedStudentId || order.studentId === selectedStudentId),
    [selectedStudentId, state.orders],
  );
  const filteredHomeOrders = useMemo(() => {
    if (homeOrderTab === '全部') {
      return ordersForStudent;
    }
    if (homeOrderTab === '报名缴费') {
      return ordersForStudent.filter((order) => order.type === '团队报名');
    }
    return ordersForStudent.filter((order) => order.type === homeOrderTab);
  }, [homeOrderTab, ordersForStudent]);
  const growthLedger = useMemo(
    () => state.growthValueLedger.filter((item) => item.studentId === selectedStudentId),
    [selectedStudentId, state.growthValueLedger],
  );
  const capabilityAdjustments = useMemo(
    () =>
      state.capabilityAdjustmentRecords
        .filter((item) => item.studentId === selectedStudentId)
        .sort((left, right) => right.evaluatedAt.localeCompare(left.evaluatedAt)),
    [selectedStudentId, state.capabilityAdjustmentRecords],
  );
  const latestCapabilityAdjustment = capabilityAdjustments[0] ?? null;
  const improvementRadarItems = useMemo(
    () => buildCapabilityImprovementRadarItems(selectedStudent?.capabilities ?? [], latestCapabilityAdjustment),
    [latestCapabilityAdjustment, selectedStudent?.capabilities],
  );

  const pendingWorks = worksForStudent.filter((work) => work.status === 'synced');
  const publishedTasks = tasksForStudent.filter((task) => task.status !== 'draft');
  const scoredTasks = tasksForStudent.filter((task) => task.status === 'scored');
  const progressPercent = publishedTasks.length ? Math.round((scoredTasks.length / publishedTasks.length) * 100) : 0;
  const growthOverview = useMemo(() => getCapabilityOverview(selectedStudent), [selectedStudent]);
  const unreadMessageCount = messageCenterItems.filter((item) => !item.read).length;
  const recentMessages = messageCenterItems.slice(0, 3);
  const shouldShowStudentContext = activeTab !== 'me' && Boolean(selectedStudent);

  function openDeviceOrder() {
    router.push('/device/ad');
  }

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

  function submitScore(values: { score: number; comment: string }) {
    if (!scoreWorkItem) {
      return;
    }
    store.scoreWork(scoreWorkItem.id, values);
    setScoreWorkItem(null);
    messageApi.success('评分已保存，成长记录已更新');
  }

  function filesToAttachments(files: FileList, uploadedBy: string): Promise<PortfolioAttachment[]> {
    return Promise.all(
      Array.from(files).map(
        (file, index) =>
          new Promise<PortfolioAttachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: `local_${Date.now()}_${index}`,
                type: file.type.includes('pdf') ? '文档' : file.type.startsWith('image/') ? '照片' : '文档',
                title: file.name,
                summary: file.type.includes('pdf') ? 'PDF 成就文件' : '家长上传图片',
                capturedAt: formatDate(new Date().toISOString()),
                fileUrl: typeof reader.result === 'string' ? reader.result : undefined,
                mimeType: file.type,
                fileSize: file.size,
                uploadedBy,
              });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
  }

  async function handlePortfolioUpload(kind: 'photo' | 'achievement', event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length || !selectedStudent) {
      return;
    }
    const uploadedBy = state.parentProfile.name;
    const attachments = await filesToAttachments(files, uploadedBy);
    if (kind === 'photo') {
      store.uploadPortfolioPhoto({
        studentId: selectedStudent.id,
        title: `${formatDay(new Date().toISOString())} 家长上传照片`,
        summary: `家长上传 ${attachments.length} 张照片，已归档到成长日记。`,
        content: '家长从手机相册上传的研学照片，可继续编辑标题、摘要并分享到朋友圈。',
        uploadedBy,
        attachments,
      });
      setPortfolioPanel('photos');
      messageApi.success('照片已上传并归档');
    } else {
      store.uploadPortfolioAchievement({
        studentId: selectedStudent.id,
        title: attachments[0]?.title.includes('.pdf') ? '家长上传成就证明' : '家长上传荣誉成就',
        summary: `家长上传 ${attachments.length} 个成就文件，支持图片或 PDF。`,
        content: '家长上传的研学证书、奖状或证明文件，可在成就中管理。',
        uploadedBy: '家长',
        achievementType: attachments.some((item) => item.mimeType?.includes('pdf')) ? '证书' : '奖状',
        attachments,
      });
      setPortfolioPanel('achievements');
      messageApi.success('成就已上传并归档');
    }
    event.target.value = '';
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
              <br />
              证件号 {selectedStudent.idNumber || '待补充'}
            </p>
            <div className="parent-hero-actions">
              <Button size="small" onClick={() => router.push('/me/students')}>
                学员管理
              </Button>
              <Button size="small" onClick={() => router.push('/growth/talent-test')}>
                天赋测试
              </Button>
              <Button size="small" type="primary" icon={<RadarChartOutlined />} onClick={() => router.push('/growth/assessment')}>
                家长评测
              </Button>
            </div>
          </div>
          <StudentAvatar student={selectedStudent} />
        </section>

        <section className="parent-section parent-talent-card">
          <div className="parent-section-head">
            <strong>天赋特长与兴趣热爱</strong>
            <button type="button" onClick={() => setTalentOpen(true)}>
              修改
            </button>
          </div>
          <div className="parent-two-column">
            <button type="button" onClick={() => navigate('growth')}>
              <span>最强天赋</span>
              <strong>{selectedStudent.talentProfile.strongestTalent}</strong>
              <em>{selectedStudent.talentProfile.source === 'student_test' ? '来自天赋测试' : '来自家长评估'}</em>
            </button>
            <button type="button" onClick={() => navigate('growth')}>
              <span>兴趣热爱</span>
              <strong>{selectedStudent.interestProfile.studentTags.slice(0, 2).join('、') || '待选择'}</strong>
              <em>孩子选择，可由家长补充</em>
            </button>
          </div>
        </section>

        <div className="parent-metric-grid">
          <MetricCard
            label="能力指数"
            value={capabilityAverage.toFixed(1)}
            note={getCapabilityLevel(capabilityAverage)}
            icon={<RadarChartOutlined />}
            onClick={() => navigate('growth')}
          />
          <MetricCard
            label="成长值"
            value={selectedStudent.growthWallet.total}
            note={`可用 ${selectedStudent.growthWallet.available}`}
            icon={<StarOutlined />}
            onClick={() => setGrowthLedgerOpen(true)}
          />
        </div>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>报名缴费</strong>
            <span>{filteredHomeOrders.length} 条</span>
          </div>
          <div className="parent-scroll-tabs parent-order-tabs">
            {HOME_ORDER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={homeOrderTab === tab ? 'active' : ''}
                onClick={() => setHomeOrderTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="parent-card-list">
            {filteredHomeOrders.slice(0, 4).map((order) => (
              <button
                key={order.id}
                type="button"
                className="parent-list-card"
                onClick={() => {
                  store.markOrderViewed(order.id);
                  setSelectedOrder(order);
                }}
              >
                <span>{order.title}</span>
                <em>
                  {order.type === '团队报名' ? '报名缴费' : order.type} · {order.status} · {order.amount} 元
                </em>
              </button>
            ))}
            {!filteredHomeOrders.length ? (
              <div className="parent-empty-line">当前分类暂无待处理订单</div>
            ) : null}
          </div>
        </section>

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

        <section
          className="parent-shop-banner"
          onClick={openDeviceOrder}
        >
          <div>
            <span>研学宝智能硬件</span>
            <strong>立即订购家庭套装</strong>
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
            <button type="button" onClick={() => router.push('/growth/path')}>
              <RadarChartOutlined />
              成长路径
            </button>
            <button type="button" onClick={() => navigate('portfolio')}>
              <ReadOutlined />
              成长日记
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
            <Button icon={<RocketOutlined />} onClick={() => router.push('/growth/path')}>
              个性化成长路径
            </Button>
            <Button icon={<StarOutlined />} onClick={() => router.push('/growth/talent-test')}>
              免费天赋测试
            </Button>
            <Button type="primary" icon={<RadarChartOutlined />} onClick={() => router.push('/growth/assessment')}>
              家长评测
            </Button>
          </div>
        </section>

        <section className="parent-section parent-talent-card">
          <div className="parent-section-head">
            <strong>天赋兴趣</strong>
            <button type="button" onClick={() => setTalentOpen(true)}>
              编辑
            </button>
          </div>
          <div className="parent-detail-stack">
            <div className="parent-note-card">
              <strong>天赋特长</strong>
              <p>
                学员：{selectedStudent.talentProfile.strongestTalent}；家长：{selectedStudent.talentProfile.parentTalent}。
                {selectedStudent.talentProfile.testCompleted ? ' 已完成多元智能天赋测试。' : ' 当前为家长观察评估，可继续做天赋测试。'}
              </p>
            </div>
            <div className="parent-note-card">
              <strong>兴趣热爱</strong>
              <p>
                学员选择：{selectedStudent.interestProfile.studentTags.join('、') || '待选择'}；家长补充：
                {selectedStudent.interestProfile.parentTags.join('、') || '待补充'}。
              </p>
            </div>
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
        <ParentRadarCard
          title="能力提升雷达图"
          labels={improvementRadarItems.map((item) => item.elementKey)}
          values={improvementRadarItems.map((item) => item.afterIndex)}
          compareValues={improvementRadarItems.map((item) => item.beforeIndex)}
          valueLabel="最新指数"
          compareLabel="更新前指数"
          summary={
            latestCapabilityAdjustment
              ? `${latestCapabilityAdjustment.reportTitle}：展示本次增长最多的 6 项能力元素，不足 6 项时补充当前高分且无变化的能力元素。`
              : '暂无本次调整记录，先展示当前分值最高的 6 项能力元素作为待观察基线。'
          }
        >
          <ParentCapabilityImprovementList items={improvementRadarItems} />
        </ParentRadarCard>
        <ParentGrowthSourceBreakdown level={growthOverview.currentLevel} items={growthOverview.sourceBreakdown} />
        <ParentCapabilityList
          capabilities={selectedStudent.capabilities}
          onOpenCapability={(capabilityId) => router.push(`/growth/capabilities/${capabilityId}`)}
        />

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>研学报告评分记录</strong>
            <span>{capabilityAdjustments.length} 条</span>
          </div>
          <div className="parent-card-list">
            {capabilityAdjustments.map((record) => (
              <ParentAssessmentRecordCard
                key={record.id}
                record={record}
                onOpenReport={(item) => item.reportId && router.push(`/portfolio/reports/${item.reportId}`)}
              />
            ))}
          </div>
        </section>

        <section ref={growthReportsRef} className="parent-section">
          <div className="parent-section-head">
            <strong>评测记录</strong>
            <span>{reportsForStudent.length} 份</span>
          </div>
          <div className="parent-card-list">
            {reportsForStudent.length ? (
              reportsForStudent.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  className={`parent-report-record-card ${report.recordType === '难题挑战' ? 'challenge' : report.recordType === '日常任务' ? 'daily' : report.recordType === '家庭研学' ? 'study' : 'review'}`}
                  onClick={() => router.push(`/portfolio/reports/${report.id}`)}
                >
                  <span>{report.title}</span>
                  <em>
                    {report.recordType ?? report.planeTitle} · {report.organizationName ?? '研学宝'} · {report.teamOrTaskName ?? report.planeTitle}
                  </em>
                  <small>
                    {formatDate(report.evaluatedAt ?? report.date)} · {report.evaluator ?? '系统'}
                  </small>
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
            title="成长日记还没有开始积累"
            description="学员创建、设备绑定、任务评分和家长评测之后，时间线、照片、成就和评价会自动沉淀在这里。"
            primaryLabel="去添加学员"
            onPrimary={() => router.push('/me/students/editor')}
          />
        </div>
      );
    }

    const latestDiaryDate = portfolioTimelineEntries[0]?.occurredAt ?? '--';
    const photoRecords = state.portfolioPhotos.filter((item) => item.studentId === selectedStudent.id);
    const achievementRecords = state.portfolioAchievements.filter((item) => item.studentId === selectedStudent.id);
    const visibleTimelineEntries = portfolioTimelineEntries.filter((item) => {
      if (portfolioPanel === 'timeline') return true;
      if (portfolioPanel === 'tasks') {
        return ['work_submitted', 'work_scored', 'task', 'report', 'expert_course', 'challenge', 'study_diary'].includes(item.entryType);
      }
      if (portfolioPanel === 'flash') return item.entryType === 'flash_note';
      if (portfolioPanel === 'reviews') return item.entryType === 'review' || item.entryType === 'assessment';
      return false;
    });
    const photoGroups = Object.entries(
      photoRecords.reduce<Record<string, ParentPhotoRecord[]>>((groups, record) => {
        const key = formatDay(record.createdAt);
        groups[key] = [...(groups[key] ?? []), record];
        return groups;
      }, {}),
    ).sort(([left], [right]) => right.localeCompare(left));

    return (
      <div className="parent-page">
        <section className="parent-portfolio-overview">
          <div>
            <span>时间线记录</span>
            <strong>{portfolioTimelineEntries.length} 条</strong>
            <em>最近 {formatDate(latestDiaryDate)}</em>
          </div>
          <div>
            <span>照片与成就</span>
            <strong>{photoRecords.length + achievementRecords.length} 组</strong>
            <em>家长可模拟上传管理</em>
          </div>
        </section>

        <div className="parent-scroll-tabs">
          {[
            { label: '时间线', value: 'timeline' },
            { label: '任务', value: 'tasks' },
            { label: 'AI', value: 'qa' },
            { label: '照片', value: 'photos' },
            { label: '成就', value: 'achievements' },
            { label: '闪记', value: 'flash' },
            { label: '评价', value: 'reviews' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={portfolioPanel === item.value ? 'active' : ''}
              onClick={() => setPortfolioPanel(item.value as PortfolioPanelKey)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {portfolioPanel === 'timeline' || portfolioPanel === 'tasks' || portfolioPanel === 'flash' || portfolioPanel === 'reviews' ? (
          <section className="parent-card-list">
            <div className="parent-stat-strip multi">
              <span>当前记录 {visibleTimelineEntries.length}</span>
              <span>关联作品 {portfolioWorksForStudent.length}</span>
              <span>最近日记 {formatDate(latestDiaryDate)}</span>
            </div>
            {visibleTimelineEntries.length ? (
              visibleTimelineEntries.map((item) => (
                <button key={item.id} type="button" className="parent-diary-card" onClick={() => router.push(getPortfolioEntryRoute(item))}>
                  <div className="parent-diary-card-meta">
                    <Tag color={getTimelineTagColor(item.entryType)}>{getTimelineEntryLabel(item.entryType)}</Tag>
                    <em>{formatDate(item.occurredAt)}</em>
                  </div>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                  <span>
                    {item.sourceLabel}
                    {item.rating ? ` · ${item.rating}` : ''}
                  </span>
                </button>
              ))
            ) : (
              <Empty description="当前分类暂无记录" />
            )}
          </section>
        ) : null}

        {portfolioPanel === 'qa' ? (
          <section className="parent-card-list">
            <div className="parent-stat-strip multi">
              <span>拍拍/问问 {aiQaRecords.length}</span>
              <span>AI创作 {aiCreationRecords.length}</span>
              <span>可分享朋友圈</span>
            </div>
            {[...aiQaRecords, ...aiCreationRecords].length ? (
              [...aiQaRecords, ...aiCreationRecords].map((item) => (
                <button key={item.id} type="button" className="parent-list-card" onClick={() => router.push(`/portfolio/ai/${item.id}`)}>
                  <span>{item.title}</span>
                  <em>
                    {item.agentName} · {formatDate(item.createdAt)} · {item.kind === 'qa' ? `${item.questionCount ?? 1} 问` : item.workType ?? 'AI 创作'}
                  </em>
                </button>
              ))
            ) : (
              <Empty description="暂无 AI 记录" />
            )}
          </section>
        ) : null}

        {portfolioPanel === 'photos' ? (
          <section className="parent-card-list">
            <div className="parent-action-row">
              <Button block type="primary" onClick={() => photoInputRef.current?.click()}>
                上传照片
              </Button>
              <Button block onClick={() => messageApi.success('已生成朋友圈分享卡片')}>
                分享朋友圈
              </Button>
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" multiple hidden onChange={(event) => void handlePortfolioUpload('photo', event)} />
            {photoGroups.length ? (
              photoGroups.map(([day, records]) => (
                <section key={day} className="parent-media-day-group">
                  <div className="parent-section-head compact">
                    <strong>{day}</strong>
                    <span>{records.reduce((sum, record) => sum + record.attachments.length, 0)} 张</span>
                  </div>
                  {records.map((item) => (
                    <div key={item.id} className="parent-media-manage-card">
                      <button type="button" onClick={() => router.push(`/portfolio/records/timeline_photo_${item.id}`)}>
                        <strong>{item.title}</strong>
                        <span>
                          {item.photoType} · {item.sourceLabel} · {item.attachments.length} 张
                        </span>
                        <em>{item.summary}</em>
                      </button>
                      <div className="parent-action-row compact">
                        <Button size="small" onClick={() => setEditingMedia({ kind: 'photo', id: item.id })}>
                          编辑
                        </Button>
                        <Button size="small" onClick={() => messageApi.success('已生成照片朋友圈分享卡片')}>
                          分享
                        </Button>
                        <Button size="small" danger onClick={() => store.deletePortfolioPhoto(item.id)}>
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </section>
              ))
            ) : (
              <section className="parent-empty-guide compact">
                <Empty description="暂无照片记录" />
                <Button type="primary" onClick={() => photoInputRef.current?.click()}>
                  上传第一组照片
                </Button>
              </section>
            )}
          </section>
        ) : null}

        {portfolioPanel === 'achievements' ? (
          <section className="parent-card-list">
            <div className="parent-action-row">
              <Button block type="primary" onClick={() => achievementInputRef.current?.click()}>
                上传成就
              </Button>
              <Button block onClick={() => messageApi.success('已生成成就朋友圈分享卡片')}>
                分享朋友圈
              </Button>
            </div>
            <input
              ref={achievementInputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              multiple
              hidden
              onChange={(event) => void handlePortfolioUpload('achievement', event)}
            />
            {achievementRecords.length ? (
              achievementRecords.map((item) => (
                <div key={item.id} className="parent-media-manage-card achievement">
                  <button type="button" onClick={() => router.push(`/portfolio/records/timeline_achievement_${item.id}`)}>
                    <strong>{item.title}</strong>
                    <span>
                      {item.achievementType} · {item.uploadedBy}上传 · {formatDate(item.createdAt)}
                    </span>
                    <em>{item.attachments.map((attachment) => attachment.mimeType?.includes('pdf') ? 'PDF' : attachment.type).join('、')}</em>
                  </button>
                  <div className="parent-action-row compact">
                    <Button size="small" onClick={() => setEditingMedia({ kind: 'achievement', id: item.id })}>
                      编辑
                    </Button>
                    <Button size="small" onClick={() => messageApi.success('已生成成就朋友圈分享卡片')}>
                      分享
                    </Button>
                    <Button size="small" danger onClick={() => store.deletePortfolioAchievement(item.id)}>
                      删除
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <section className="parent-empty-guide compact">
                <Empty description="暂无成就记录" />
                <Button type="primary" onClick={() => achievementInputRef.current?.click()}>
                  上传第一项成就
                </Button>
              </section>
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

        <section className="parent-section parent-family-team-panel">
          <div className="parent-section-head">
            <strong>家庭研学团队面板</strong>
            <button type="button" onClick={() => setTeamOpen(true)}>
              创建团队
            </button>
          </div>
          <div className="parent-filter-row">
            {state.familyTeams.map((team) => (
              <button
                key={team.id}
                type="button"
                className={team.id === selectedFamilyTeam?.id ? 'active' : ''}
                onClick={() => store.selectFamilyTeam(team.id)}
              >
                {team.name}
              </button>
            ))}
          </div>
          {selectedFamilyTeam ? (
            <div className="parent-team-summary">
              <strong>{selectedFamilyTeam.theme}</strong>
              <span>
                {selectedFamilyTeam.location} · {selectedFamilyTeam.studyDate} · {selectedFamilyTeam.studentIds.length} 位学员
              </span>
              <p>{selectedFamilyTeam.goal}</p>
              <div className="parent-action-row compact">
                <Button size="small" onClick={() => setInviteOpen(true)}>
                  研学邀伴
                </Button>
                <Button size="small" onClick={() => messageApi.success('已复用导师端团队资料能力的演示入口')}>
                  团队资料
                </Button>
                <Button size="small" onClick={() => messageApi.success('已进入团队消息广播演示')}>
                  团队消息
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="parent-task-overview">
          <div>
            <span>家庭研学团队面板</span>
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
                          <Tag>{task.studyDate}</Tag>
                          {task.publishedAt ? <Tag>下发 {formatDate(task.publishedAt)}</Tag> : null}
                          {task.version && task.version > 1 ? <Tag>v{task.version}</Tag> : null}
                          {task.syncStatus === '待同步更新' ? <Tag color="gold">待同步更新</Tag> : null}
                          <Tag>{task.points} 分</Tag>
                          {task.capabilityTags.slice(0, 2).map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                        <div className="parent-action-row compact">
                          <Button size="small" onClick={() => router.push(`/family-tasks/editor?taskId=${task.id}`)}>
                            编辑
                          </Button>
                          <Button size="small" onClick={() => setSelectedTaskDetail(task)}>
                            详情
                          </Button>
                          {task.syncStatus === '待同步更新' ? (
                            <Button
                              size="small"
                              type="primary"
                              onClick={() => {
                                store.syncTaskUpdates([task.id]);
                                messageApi.success('任务更新已同步到研学宝');
                              }}
                            >
                              同步更新
                            </Button>
                          ) : null}
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
                  <StudentAvatar student={student} size="small" />
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
                        {selectedStudent.name} · 提交 {formatDate(work.submittedAt)} · AI评分{' '}
                        {typeof work.aiScore === 'number' ? Math.round(work.aiScore) : '-'} /10
                        {work.scoredAt ? ` · 评分 ${formatDate(work.scoredAt)}` : ''}
                      </span>
                    </button>
                    {work.status === 'synced' ? (
                      <Button size="small" type="primary" onClick={() => setScoreWorkItem(work)}>
                        评分
                      </Button>
                    ) : (
                      <Tag color="green">{work.parentScore}/10</Tag>
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

  function renderDevice() {
    if (!selectedStudent) {
      return (
        <div className="parent-page">
          <OnboardingPanel
            title="先添加学员再管理设备"
            description="每台研学宝都会绑定到具体学员，之后才能查看支付、网盘、通讯录、停用时间和轨迹。"
            primaryLabel="去添加学员"
            onPrimary={() => router.push('/me/students/editor')}
          />
        </div>
      );
    }

    const device = selectedStudent.device;
    const deviceFeatures = [
      {
        key: 'payment-card',
        title: '支付卡',
        icon: CreditCardOutlined,
        summary: device?.paymentCard
          ? device.paymentCard.status === '已绑定'
            ? `余额 ${device.paymentCard.balance.toFixed(2)} 元`
            : device.paymentCard.status
          : '未添加支付卡',
      },
      {
        key: 'netdisk',
        title: '网盘',
        icon: CloudOutlined,
        summary: device?.netDisk
          ? device.netDisk.status === '已绑定'
            ? `${device.netDisk.status} · ${device.netDisk.capacityUsed}/${device.netDisk.capacityTotal}GB`
            : device.netDisk.status
          : '未绑定网盘',
      },
      {
        key: 'contacts',
        title: '通讯录',
        icon: TeamOutlined,
        summary: device ? `${device.contacts.length} 人` : '待绑定设备',
      },
      {
        key: 'quiet-times',
        title: '停用时间',
        icon: FieldTimeOutlined,
        summary: device ? `${device.quietTimes.filter((item) => item.enabled).length} 条启用` : '待绑定设备',
      },
      {
        key: 'location',
        title: '位置与轨迹',
        icon: EnvironmentOutlined,
        summary: device?.latestLocation ? formatDate(device.latestLocation.receivedAt) : '暂无定位',
      },
      {
        key: 'me',
        title: '我的',
        icon: UserOutlined,
        summary: '个人中心',
      },
    ];

    return (
      <div className="parent-page">
        <section className="parent-device-hero">
          <div>
            <span>{selectedStudent.name} 的研学宝</span>
            <strong>{device ? device.name : '未绑定设备'}</strong>
            <em>{device ? `${device.deviceCode} · 最后在线 ${formatDate(device.lastOnlineAt)}` : '绑定后开启设备管控功能'}</em>
          </div>
          <Button size="small" type="primary" icon={<MobileOutlined />} onClick={() => router.push(`/me/device/scan?studentId=${selectedStudent.id}`)}>
            {device ? '更换设备' : '扫码绑定'}
          </Button>
        </section>

        <section className="parent-section">
          {device ? (
            <div className="parent-device-status-card">
              <div>
                <strong>设备状态</strong>
                <span>序列号 {device.serialNumber}</span>
              </div>
              <div className="parent-device-chip-list">
                <Tag color="green">电量 {device.batteryPercent}%</Tag>
                <Tag>{device.mode === 'sale' ? '销售模式' : '租赁模式'}</Tag>
              </div>
            </div>
          ) : (
            <section className="parent-empty-guide compact">
                <MobileOutlined />
                <strong>这位学员还没有绑定设备</strong>
                <p>扫码后会自动激活学员账号并同步设备信息。</p>
                <Button type="primary" onClick={() => router.push(`/me/device/scan?studentId=${selectedStudent.id}`)}>
                  立即扫码绑定
                </Button>
              </section>
            )}
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>设备功能</strong>
            <span>点击进入二级功能</span>
          </div>
          <div className="parent-device-feature-grid">
            {deviceFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.key}
                  type="button"
                  className={`parent-device-feature-entry ${device || feature.key === 'me' ? '' : 'disabled'}`}
                  onClick={() => {
                    if (feature.key === 'me') {
                      router.push('/me');
                      return;
                    }
                    if (!device) {
                      messageApi.warning('请先绑定研学宝设备');
                      return;
                    }
                    router.push(`/me/device/${feature.key}?studentId=${selectedStudent.id}`);
                  }}
                >
                  <span className={`parent-device-feature-icon ${feature.key}`}>
                    <Icon />
                  </span>
                  <strong>{feature.title}</strong>
                  <em>{feature.summary}</em>
                </button>
              );
            })}
          </div>
        </section>

        <section className="parent-section parent-device-ad-section">
          <div className="parent-section-head">
            <strong>研学宝订购</strong>
            <button type="button" onClick={openDeviceOrder}>
              立即订购
            </button>
          </div>
          <Carousel className="parent-device-carousel" autoplay dots>
            {state.deviceAds.map((ad) => (
              <div key={ad.id}>
                <button type="button" className={`parent-device-ad-card ${ad.imageTone}`} onClick={openDeviceOrder}>
                  <span
                    className="parent-device-ad-image"
                    role="img"
                    aria-label={ad.title}
                    style={{ backgroundImage: `url(${ad.imageUrl})` }}
                  />
                  <span>{ad.title}</span>
                  <strong>{ad.subtitle}</strong>
                  <em>{ad.features.join(' · ')}</em>
                </button>
              </div>
            ))}
          </Carousel>
          <div className="parent-card-list">
            {ordersForStudent
              .filter((order) => order.type === '研学宝')
              .slice(0, 2)
              .map((order) => (
                <button key={order.id} type="button" className="parent-list-card" onClick={() => setSelectedOrder(order)}>
                  <span>{order.title}</span>
                  <em>
                    {order.status} · {order.amount} 元 · {formatDate(order.createdAt)}
                  </em>
                </button>
              ))}
          </div>
        </section>
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
          <button type="button" className="parent-entry-card" onClick={() => router.push('/device')}>
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
          <button type="button" className="parent-entry-card" onClick={() => router.push('/device')}>
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

  const activeTitle = TAB_ITEMS.find((item) => item.key === activeTab)?.label ?? (activeTab === 'me' ? '我的' : '首页');
  const persistedDrawerOrder = selectedOrder ? state.orders.find((order) => order.id === selectedOrder.id) ?? null : null;
  const drawerOrder = selectedOrder
    ? persistedDrawerOrder
      ? {
          ...persistedDrawerOrder,
          enrollmentStudentId: selectedOrder.enrollmentStudentId ?? persistedDrawerOrder.enrollmentStudentId,
        }
      : selectedOrder
    : null;
  const selectedInviteUrl = selectedFamilyTeam ? `/invite/${selectedFamilyTeam.id}` : '';
  const drawerOrderEnrollmentStudentId = drawerOrder?.enrollmentStudentId ?? drawerOrder?.studentId ?? selectedStudentId;
  const drawerOrderStudent = drawerOrderEnrollmentStudentId
    ? state.students.find((student) => student.id === drawerOrderEnrollmentStudentId) ?? null
    : null;
  const drawerOrderMissingFields = drawerOrder && drawerOrder.type !== '研学宝' ? getEnrollmentMissingFields(drawerOrderStudent) : [];
  const editingMediaRecord =
    editingMedia?.kind === 'photo'
      ? state.portfolioPhotos.find((record) => record.id === editingMedia.id)
      : editingMedia?.kind === 'achievement'
        ? state.portfolioAchievements.find((record) => record.id === editingMedia.id)
        : null;

  return (
    <ParentPhoneFrame>
      {messageHolder}
      <header className="parent-shell-header">
        <div>
          <span>研学宝家长端</span>
          <strong>{activeTitle}</strong>
        </div>
        <div className="parent-header-actions">
          <button type="button" className="parent-header-message" onClick={() => router.push('/messages')}>
            <MessageOutlined />
            <Badge count={unreadMessageCount} size="small" />
          </button>
          {activeTab === 'device' ? (
            <button type="button" className="parent-header-message" aria-label="我的" onClick={() => router.push('/me')}>
              <UserOutlined />
            </button>
          ) : null}
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
        {activeTab === 'device' ? renderDevice() : null}
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
        title={editingMedia?.kind === 'achievement' ? '编辑成就' : '编辑照片'}
        open={Boolean(editingMediaRecord)}
        onClose={() => setEditingMedia(null)}
        placement="bottom"
        height={420}
        getContainer={false}
        rootClassName="parent-detail-drawer"
      >
        {editingMediaRecord ? (
          <Form
            key={`${editingMedia?.kind}-${editingMediaRecord.id}`}
            layout="vertical"
            initialValues={{
              title: editingMediaRecord.title,
              summary: editingMediaRecord.summary,
              content: editingMediaRecord.content,
            }}
            onFinish={(values: { title: string; summary: string; content?: string }) => {
              if (editingMedia?.kind === 'photo') {
                store.updatePortfolioPhoto(editingMediaRecord.id, values);
              } else {
                store.updatePortfolioAchievement(editingMediaRecord.id, values);
              }
              setEditingMedia(null);
              messageApi.success('已保存');
            }}
          >
            <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="summary" label="摘要" rules={[{ required: true, message: '请输入摘要' }]}>
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="content" label="正文">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Button block type="primary" htmlType="submit">
              保存
            </Button>
          </Form>
        ) : null}
      </Drawer>

      <Drawer
        title="成长值详情"
        open={growthLedgerOpen}
        onClose={() => setGrowthLedgerOpen(false)}
        placement="bottom"
        height={460}
        getContainer={false}
        rootClassName="parent-detail-drawer"
      >
        {selectedStudent ? (
          <div className="parent-detail-stack">
            <div className="parent-mini-table">
              <div>
                <span>累计成长值</span>
                <strong>{selectedStudent.growthWallet.total}</strong>
                <em>研学宝等级标志</em>
              </div>
              <div>
                <span>可用成长值</span>
                <strong>{selectedStudent.growthWallet.available}</strong>
                <em>可用于后续消费兑换</em>
              </div>
            </div>
            <div className="parent-card-list">
              {growthLedger.map((record) => (
                <div key={record.id} className="parent-list-card static">
                  <span>{record.title}</span>
                  <em>
                    {record.type === 'earn' ? '+' : ''}
                    {record.value} · {record.source} · {formatDate(record.occurredAt)}
                  </em>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        title="天赋兴趣"
        open={talentOpen}
        onClose={() => setTalentOpen(false)}
        placement="bottom"
        height={560}
        getContainer={false}
        rootClassName="parent-detail-drawer"
      >
        {selectedStudent ? (
          <Form
            key={`talent-${selectedStudent.id}-${selectedStudent.talentProfile.updatedAt}`}
            layout="vertical"
            initialValues={{
              strongestTalent: selectedStudent.talentProfile.strongestTalent,
              parentTalent: selectedStudent.talentProfile.parentTalent,
              studentTags: selectedStudent.interestProfile.studentTags,
              parentTags: selectedStudent.interestProfile.parentTags,
              testCompleted: selectedStudent.talentProfile.testCompleted ? 'yes' : 'no',
            }}
            onFinish={(values: {
              strongestTalent: string;
              parentTalent: string;
              studentTags: string[];
              parentTags: string[];
              testCompleted: 'yes' | 'no';
            }) => {
              store.updateTalentInterest(selectedStudent.id, { ...values, testCompleted: values.testCompleted === 'yes' });
              setTalentOpen(false);
              messageApi.success('天赋兴趣已更新');
            }}
          >
            <Form.Item name="strongestTalent" label="学员天赋测试结果">
              <Select options={TALENT_OPTIONS.map((item) => ({ label: item, value: item }))} />
            </Form.Item>
            <Form.Item name="parentTalent" label="家长观察评估">
              <Select options={TALENT_OPTIONS.map((item) => ({ label: item, value: item }))} />
            </Form.Item>
            <Form.Item name="testCompleted" label="天赋测试状态">
              <Select
                options={[
                  { label: '已完成多元智能问卷测试', value: 'yes' },
                  { label: '暂由家长评估', value: 'no' },
                ]}
              />
            </Form.Item>
            <Form.Item name="studentTags" label="学员选择的兴趣">
              <Select mode="multiple" options={INTEREST_OPTIONS.map((item) => ({ label: item, value: item }))} />
            </Form.Item>
            <Form.Item name="parentTags" label="家长补充的兴趣">
              <Select mode="multiple" options={INTEREST_OPTIONS.map((item) => ({ label: item, value: item }))} />
            </Form.Item>
            <Button block type="primary" htmlType="submit">
              保存天赋兴趣
            </Button>
          </Form>
        ) : null}
      </Drawer>

      <Drawer
        title={drawerOrder?.type === '研学宝' ? '研学宝提单页' : '订单详情'}
        open={Boolean(drawerOrder)}
        onClose={() => setSelectedOrder(null)}
        placement="bottom"
        height={drawerOrder?.type === '研学宝' ? 680 : 720}
        getContainer={false}
        rootClassName="parent-detail-drawer"
      >
        {drawerOrder ? (
          <div className="parent-detail-stack">
            <section className="parent-detail-hero compact">
              <span className="parent-detail-eyebrow">{drawerOrder.type}</span>
              <strong>{drawerOrder.title}</strong>
              <p>{drawerOrder.description ?? '核实信息后可模拟拉起支付页面。'}</p>
              <div className="parent-detail-chip-row">
                <Tag color={drawerOrder.status.includes('已') ? 'green' : 'gold'}>{drawerOrder.status}</Tag>
                <Tag>{drawerOrder.amount} 元</Tag>
                <Tag>{formatDate(drawerOrder.createdAt)}</Tag>
              </div>
            </section>
            {drawerOrder.type === '研学宝' ? (
              <div className="parent-order-product">
                <span className="parent-order-product-image" role="img" aria-label="研学宝 Explorer S1" />
                <div>
                  <strong>Explorer S1 家庭套装</strong>
                  <span>含研学宝设备、亲子账号绑定、AI 问问、拍照识别、定位轨迹与成长报告。</span>
                </div>
              </div>
            ) : null}
            <div className="parent-mini-table">
              <div>
                <span>产品/服务</span>
                <strong>{drawerOrder.productName ?? drawerOrder.type}</strong>
                <em>{drawerOrder.sourceLabel ?? '研学宝'}</em>
              </div>
              <div>
                <span>收货/报名人</span>
                <strong>{drawerOrder.receiver ?? state.parentProfile.name}</strong>
                <em>{drawerOrder.phone ?? state.parentProfile.phone}</em>
              </div>
            </div>
            {drawerOrder.type !== '研学宝' ? (
              <section className="parent-order-student-panel">
                <div className="parent-section-head">
                  <strong>报名学员信息</strong>
                  <span>{drawerOrderMissingFields.length ? `缺 ${drawerOrderMissingFields.length} 项` : '资料完整'}</span>
                </div>
                {drawerOrderStudent ? (
                  <div className="parent-mini-table">
                    <div>
                      <span>学员</span>
                      <strong>{drawerOrderStudent.name}</strong>
                      <em>研学宝 ID {drawerOrderStudent.yxbId}</em>
                    </div>
                    <div>
                      <span>证件/生日</span>
                      <strong>{drawerOrderStudent.idNumber || '待补充'}</strong>
                      <em>{drawerOrderStudent.birthday || '生日待补充'} · {drawerOrderStudent.age} 岁</em>
                    </div>
                    <div>
                      <span>学校年级</span>
                      <strong>{drawerOrderStudent.school || '学校待补充'}</strong>
                      <em>{drawerOrderStudent.grade || '年级待补充'} · {drawerOrderStudent.city || '城市待补充'}</em>
                    </div>
                  </div>
                ) : (
                  <div className="parent-empty-line">请先选择报名学员</div>
                )}
                {drawerOrderMissingFields.length ? (
                  <div className="parent-warning-line">
                    <span>缺少：{drawerOrderMissingFields.join('、')}</span>
                    <Button size="small" onClick={() => router.push(drawerOrderStudent ? `/me/students/editor?studentId=${drawerOrderStudent.id}` : '/me/students/editor')}>
                      快捷编辑
                    </Button>
                  </div>
                ) : null}
              </section>
            ) : null}
            {drawerOrder.status === '待支付' || drawerOrder.status === '待缴费' || drawerOrder.status === '未查看' || drawerOrder.status === '未处理' ? (
              <Form
                key={`order-submit-${drawerOrder.id}-${drawerOrder.status}`}
                layout="vertical"
                className="parent-order-submit-form"
                initialValues={{
                  enrollmentStudentId: drawerOrderEnrollmentStudentId || undefined,
                  receiver: drawerOrder.receiver ?? state.parentProfile.name,
                  address: drawerOrder.address ?? '',
                  phone: drawerOrder.phone ?? state.parentProfile.phone,
                }}
                onFinish={(values: Pick<ParentOrder, 'receiver' | 'address' | 'phone' | 'enrollmentStudentId'>) => {
                  if (drawerOrder.type !== '研学宝' && drawerOrderMissingFields.length) {
                    messageApi.warning('请先补全报名学员信息');
                    return;
                  }
                  store.payOrder(drawerOrder.id, values);
                  messageApi.success(drawerOrder.type === '团队报名' ? '已完成报名缴费' : '已提交订单并模拟支付成功');
                }}
              >
                {drawerOrder.type !== '研学宝' ? (
                  <Form.Item name="enrollmentStudentId" label="选择报名学员" rules={[{ required: true, message: '请选择报名学员' }]}>
                    <Select
                      size="large"
                      options={state.students.map((student) => ({ label: `${student.name} · ${student.yxbId}`, value: student.id }))}
                      onChange={(value) => setSelectedOrder({ ...drawerOrder, enrollmentStudentId: value })}
                    />
                  </Form.Item>
                ) : null}
                <Form.Item
                  name="receiver"
                  label={drawerOrder.type === '研学宝' ? '收货人' : '联系人'}
                  rules={[{ required: true, message: drawerOrder.type === '研学宝' ? '请输入收货人' : '请输入联系人' }]}
                >
                  <Input size="large" placeholder="请输入姓名" />
                </Form.Item>
                {drawerOrder.type === '研学宝' ? (
                  <Form.Item name="address" label="收货地址" rules={[{ required: true, message: '请输入收货地址' }]}>
                    <Input.TextArea rows={2} placeholder="省市区、街道门牌号" />
                  </Form.Item>
                ) : null}
                <Form.Item
                  name="phone"
                  label="手机号码"
                  rules={[
                    { required: true, message: '请输入手机号码' },
                    { pattern: /^1\d{10}$/, message: '请输入 11 位手机号码' },
                  ]}
                >
                  <Input size="large" inputMode="tel" placeholder="用于支付与配送通知" />
                </Form.Item>
                <Button block type="primary" htmlType="submit" size="large">
                  {drawerOrder.type === '团队报名' ? '确认并缴费' : '提交订单并支付'}
                </Button>
              </Form>
            ) : (
              <div className="parent-paid-line">
                已完成支付{drawerOrder.paidAt ? ` · ${formatDate(drawerOrder.paidAt)}` : ''}
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      <Drawer
        title="任务详情"
        open={Boolean(selectedTaskDetail)}
        onClose={() => setSelectedTaskDetail(null)}
        placement="bottom"
        height={520}
        getContainer={false}
        rootClassName="parent-detail-drawer"
      >
        {selectedTaskDetail ? (
          <div className="parent-detail-stack">
            <section className="parent-detail-hero compact">
              <span className="parent-detail-eyebrow">{selectedTaskDetail.taskType}</span>
              <strong>{selectedTaskDetail.title}</strong>
              <p>{selectedTaskDetail.description}</p>
              <div className="parent-detail-chip-row">
                <Tag>{selectedTaskDetail.base}</Tag>
                <Tag>{selectedTaskDetail.studyDate}</Tag>
                <Tag>{selectedTaskDetail.points} 分</Tag>
                {selectedTaskDetail.version ? <Tag>版本 v{selectedTaskDetail.version}</Tag> : null}
                {selectedTaskDetail.syncStatus ? <Tag color={selectedTaskDetail.syncStatus === '已同步' ? 'green' : 'gold'}>{selectedTaskDetail.syncStatus}</Tag> : null}
              </div>
            </section>
            <div className="parent-card-list">
              {selectedTaskDetail.requirements.map((item) => (
                <div key={item.id} className="parent-list-card static">
                  <span>{item.requirement}</span>
                  <em>{item.type}</em>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        title="研学邀伴"
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        placement="bottom"
        height={520}
        getContainer={false}
        rootClassName="parent-detail-drawer"
        footer={
          selectedFamilyTeam ? (
            <div className="parent-invite-drawer-footer">
              <Button block type="primary" size="large" onClick={() => router.push(selectedInviteUrl)}>
                查看好友报名页
              </Button>
            </div>
          ) : null
        }
      >
        {selectedFamilyTeam ? (
          <div className="parent-detail-stack">
            <section className="parent-invite-card">
              <strong>{selectedFamilyTeam.name}</strong>
              <span>{state.parentProfile.name} 邀请好友加入 {selectedFamilyTeam.theme}</span>
              <em>邀伴码 {selectedFamilyTeam.inviteCode}</em>
            </section>
            <section className="parent-invite-poster-card">
              <div className="parent-invite-poster-copy">
                <span>邀请图片预览</span>
                <strong>加入 {selectedFamilyTeam.name} 研学活动</strong>
                <em>{selectedFamilyTeam.location} · {selectedFamilyTeam.studyDate}</em>
                <p>好友扫码或打开链接后，可查看团队信息、研学任务并为孩子报名。</p>
              </div>
              <ParentInviteQrCode value={selectedInviteUrl} />
            </section>
            <div className="parent-action-row compact">
              <Button
                size="small"
                onClick={() => {
                  setInvitePosterUrl(
                    buildInvitePosterImage({
                      team: selectedFamilyTeam,
                      parentName: state.parentProfile.name,
                      inviteUrl: selectedInviteUrl,
                    }),
                  );
                  messageApi.success('邀请图片已生成');
                }}
              >
                生成邀请图片
              </Button>
              <Button size="small" type="primary" onClick={() => messageApi.success(`已复制小程序链接 ${selectedInviteUrl}`)}>
                分享链接
              </Button>
            </div>
            {invitePosterUrl ? (
              <section className="parent-invite-generated-card">
                <div className="parent-section-head compact">
                  <strong>已生成邀请图片</strong>
                  <a href={invitePosterUrl} download={`${selectedFamilyTeam.inviteCode}-invite.svg`}>
                    保存图片
                  </a>
                </div>
                <object data={invitePosterUrl} type="image/svg+xml" aria-label={`${selectedFamilyTeam.name} 邀请图片`} />
              </section>
            ) : null}
            <section className="parent-invite-flow-card">
              <strong>邀伴查看及报名流程</strong>
              <span>好友点击分享链接后进入公开邀伴页，授权手机号后可查看研学主题、地点、日期、目标和任务，再提交孩子报名信息；报名暂不涉及费用支付。</span>
            </section>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        title="创建家庭研学团队"
        open={teamOpen}
        onClose={() => setTeamOpen(false)}
        placement="bottom"
        height={560}
        getContainer={false}
        rootClassName="parent-detail-drawer"
      >
        <Form
          layout="vertical"
          initialValues={{
            name: '周末自然观察队',
            theme: '社区自然观察',
            location: '社区公园',
            studyDate: new Date().toISOString().slice(0, 10),
            goal: '观察自然线索，提升问题解决和自然研学兴趣。',
            studentIds: selectedStudentId ? [selectedStudentId] : [],
          }}
          onFinish={(values: { name: string; theme: string; location: string; studyDate: string; goal: string; studentIds: string[] }) => {
            store.createFamilyTeam(values);
            setTeamOpen(false);
            messageApi.success('家庭研学团队已创建');
          }}
        >
          <Form.Item name="name" label="团队名称" rules={[{ required: true, message: '请输入团队名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="theme" label="研学主题">
            <Input />
          </Form.Item>
          <Form.Item name="location" label="地点">
            <Input />
          </Form.Item>
          <Form.Item name="studyDate" label="日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="goal" label="研学目标">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="studentIds" label="团队学员">
            <Checkbox.Group options={state.students.map((student) => ({ label: student.name, value: student.id }))} />
          </Form.Item>
          <Button block type="primary" htmlType="submit">
            创建团队
          </Button>
        </Form>
      </Drawer>

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
        height={500}
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
                score:
                  scoreWorkItem.parentScore ??
                  Math.round(scoreWorkItem.aiScore ?? 8),
                comment: scoreWorkItem.comment ?? '观察认真，表达清楚，可以继续补充更多自己的判断。',
              }}
            >
              <div className="parent-score-line">
                <span>任务分值</span>
                <strong>{state.familyTasks.find((task) => task.id === scoreWorkItem.taskId)?.points ?? 0} 分</strong>
              </div>
              <div className="parent-score-line">
                <span>AI评分</span>
                <strong>{typeof scoreWorkItem.aiScore === 'number' ? Math.round(scoreWorkItem.aiScore) : '-'} / 10</strong>
              </div>
              <Form.Item name="score" label="家长评分（点选 0-10 分）" rules={[{ required: true, message: '请选择评分' }]}>
                <ScorePicker />
              </Form.Item>
              <Form.Item name="comment" label="评价（支持语音识别模拟）">
                <Input.TextArea rows={3} placeholder="可输入文字，或点击下方按钮模拟语音转写。" />
              </Form.Item>
              <Button block onClick={() => messageApi.success('已模拟完成语音输入自动识别')}>
                模拟语音输入
              </Button>
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
