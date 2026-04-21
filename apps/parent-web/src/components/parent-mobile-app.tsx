'use client';

import '@ant-design/v5-patch-for-react-19';
import {
  BookOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  CompassOutlined,
  CreditCardOutlined,
  EditOutlined,
  HomeOutlined,
  MessageOutlined,
  MobileOutlined,
  PlusOutlined,
  RadarChartOutlined,
  ReadOutlined,
  RocketOutlined,
  SendOutlined,
  ShoppingOutlined,
  StarOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Radio,
  Rate,
  Segmented,
  Select,
  Spin,
  Switch,
  Tag,
  message,
} from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearSession, getStoredSession } from '../lib/api';
import {
  CAPABILITY_PLANES,
  TASK_LIBRARY,
  getAssessmentQuestions,
  getCapabilityLevel,
  useParentStore,
  type CapabilityElement,
  type CapabilityPlaneKey,
  type FamilyTask,
  type GrowthDiaryItem,
  type MessageInput,
  type ParentOrder,
  type ParentStudent,
  type StudentInput,
  type TaskWork,
} from '../lib/parent-store';

export type ParentTabKey = 'home' | 'growth' | 'diary' | 'tasks' | 'device';

const TAB_ITEMS: Array<{ key: ParentTabKey; label: string; icon: React.ComponentType; href: string }> = [
  { key: 'home', label: '首页', icon: HomeOutlined, href: '/home' },
  { key: 'growth', label: '成长', icon: RadarChartOutlined, href: '/growth' },
  { key: 'diary', label: '日记', icon: BookOutlined, href: '/diary' },
  { key: 'tasks', label: '任务', icon: CheckCircleOutlined, href: '/family-tasks' },
  { key: 'device', label: '设备', icon: MobileOutlined, href: '/device' },
];

const TASK_TYPES = ['观察记录', '问答任务', '调查任务', '创作任务', '商业体验'];
const CAPABILITY_OPTIONS = CAPABILITY_PLANES.flatMap((plane) => plane.elements);
const ASSESSMENT_OPTIONS = [
  { label: '非常符合', value: 10 },
  { label: '比较符合', value: 8 },
  { label: '一般', value: 6 },
  { label: '不太符合', value: 4 },
];

function formatDate(value: string) {
  return value.length > 10 ? value.slice(0, 16).replace('T', ' ') : value;
}

function calcAverage(items: CapabilityElement[]) {
  return Number((items.reduce((sum, item) => sum + item.score, 0) / Math.max(items.length, 1)).toFixed(1));
}

function polarPoint(index: number, total: number, radius: number, valueRatio: number) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: 86 + Math.cos(angle) * radius * valueRatio,
    y: 86 + Math.sin(angle) * radius * valueRatio,
  };
}

function buildPolygon(labels: string[], values: number[], radius: number) {
  return labels
    .map((_, index) => {
      const point = polarPoint(index, labels.length, radius, Math.max(0, Math.min(1, values[index] / 10)));
      return `${point.x},${point.y}`;
    })
    .join(' ');
}

function getTone(score: number) {
  if (score >= 9) {
    return 'excellent';
  }
  if (score >= 8) {
    return 'good';
  }
  if (score >= 6) {
    return 'watch';
  }
  return 'risk';
}

function planeSummaries(student: ParentStudent) {
  return CAPABILITY_PLANES.map((plane) => {
    const items = student.capabilities.filter((item) => item.planeKey === plane.key);
    return {
      ...plane,
      score: calcAverage(items),
      averageScore: Number((items.reduce((sum, item) => sum + item.averageScore, 0) / Math.max(items.length, 1)).toFixed(1)),
    };
  });
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

function RadarChart({
  title,
  labels,
  values,
  compareValues,
}: {
  title: string;
  labels: string[];
  values: number[];
  compareValues: number[];
}) {
  const rings = [0.25, 0.5, 0.75, 1];
  return (
    <section className="parent-section">
      <div className="parent-section-head">
        <strong>{title}</strong>
        <span>我的指数 / 同龄平均</span>
      </div>
      <div className="parent-radar-wrap">
        <svg viewBox="0 0 172 172" className="parent-radar-svg" aria-hidden>
          {rings.map((ring) => (
            <polygon
              key={ring}
              points={labels
                .map((_, index) => {
                  const point = polarPoint(index, labels.length, 60, ring);
                  return `${point.x},${point.y}`;
                })
                .join(' ')}
              className="parent-radar-ring"
            />
          ))}
          {labels.map((label, index) => {
            const point = polarPoint(index, labels.length, 72, 1);
            return (
              <text key={label} x={point.x} y={point.y} className="parent-radar-label">
                {label.length > 4 ? label.slice(0, 4) : label}
              </text>
            );
          })}
          <polygon points={buildPolygon(labels, compareValues, 60)} className="parent-radar-polygon compare" />
          <polygon points={buildPolygon(labels, values, 60)} className="parent-radar-polygon mine" />
        </svg>
        <div className="parent-radar-legend">
          <span><i className="mine" />我的指数</span>
          <span><i className="compare" />同龄平均</span>
        </div>
      </div>
    </section>
  );
}

function StudentSelector({
  students,
  selectedStudent,
  onChange,
  onAdd,
}: {
  students: ParentStudent[];
  selectedStudent: ParentStudent;
  onChange: (studentId: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="parent-student-switch">
      <Select
        value={selectedStudent.id}
        onChange={onChange}
        options={students.map((student) => ({ label: `${student.name} · ${student.yxbId}`, value: student.id }))}
        variant="borderless"
        className="parent-student-select"
      />
      <Button aria-label="新增学员" icon={<UserAddOutlined />} shape="circle" onClick={onAdd} />
    </div>
  );
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

export function ParentMobileApp({ initialTab }: { initialTab: ParentTabKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useParentStore();
  const [messageApi, messageHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState<ParentTabKey>(initialTab);
  const [sessionReady, setSessionReady] = useState(false);
  const [studentModalMode, setStudentModalMode] = useState<'add' | 'edit' | null>(null);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [scoreWorkItem, setScoreWorkItem] = useState<TaskWork | null>(null);
  const [detailItem, setDetailItem] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskPanel, setTaskPanel] = useState<'tasks' | 'students' | 'works'>('tasks');
  const [diaryPanel, setDiaryPanel] = useState<'timeline' | 'works' | 'ai' | 'messages'>('timeline');
  const [assessmentPlane, setAssessmentPlane] = useState<CapabilityPlaneKey | 'all'>('all');

  const [studentForm] = Form.useForm<StudentInput>();
  const [deviceForm] = Form.useForm();
  const [assessmentForm] = Form.useForm();
  const [quickTaskForm] = Form.useForm();
  const [messageForm] = Form.useForm<MessageInput>();
  const handledTaskQuery = useRef('');

  const flash = searchParams.get('flash');
  const selectTaskId = searchParams.get('selectTaskId');

  const { state, selectedStudent, capabilityAverage } = store;

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    setSessionReady(true);
  }, [router]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (studentModalMode === 'edit') {
      studentForm.setFieldsValue({
        name: selectedStudent.name,
        birthday: selectedStudent.birthday,
        city: selectedStudent.city,
        school: selectedStudent.school,
        grade: selectedStudent.grade,
        avatar: selectedStudent.avatar,
      });
    }
    if (studentModalMode === 'add') {
      studentForm.setFieldsValue({
        birthday: '2016-09-01',
        city: selectedStudent.city,
        school: '',
        grade: '',
        avatar: '',
      });
    }
  }, [selectedStudent, studentForm, studentModalMode]);

  useEffect(() => {
    if (deviceModalOpen) {
      deviceForm.setFieldsValue({
        deviceCode: selectedStudent.device?.deviceCode ?? 'YXB-DEV-',
        mode: selectedStudent.device?.mode ?? 'sale',
      });
    }
  }, [deviceForm, deviceModalOpen, selectedStudent]);

  useEffect(() => {
    if (quickTaskOpen) {
      quickTaskForm.setFieldsValue({
        studyDate: new Date().toISOString().slice(0, 10),
        destination: '深圳海洋馆',
        taskTypes: ['观察记录'],
        capabilityTags: ['问题解决', '科技应用'],
        templateIds: TASK_LIBRARY.slice(0, 2).map((item) => item.id),
      });
    }
  }, [quickTaskForm, quickTaskOpen]);

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
      messageApi.success('自定义任务已创建');
    }
    if (flash === 'task_updated') {
      messageApi.success('任务已更新');
    }

    router.replace('/family-tasks');
  }, [flash, messageApi, router, selectTaskId]);

  const tasksForStudent = useMemo(
    () =>
      state.familyTasks.filter(
        (task) => task.status === 'draft' || task.assignedStudentIds.includes(selectedStudent.id),
      ),
    [selectedStudent.id, state.familyTasks],
  );

  const worksForStudent = useMemo(
    () => state.works.filter((work) => work.studentId === selectedStudent.id),
    [selectedStudent.id, state.works],
  );

  const diaryForStudent = useMemo(
    () => state.diaryItems.filter((item) => item.studentId === selectedStudent.id),
    [selectedStudent.id, state.diaryItems],
  );

  const reportsForStudent = useMemo(
    () => state.reports.filter((report) => report.studentId === selectedStudent.id),
    [selectedStudent.id, state.reports],
  );

  const messagesForStudent = useMemo(
    () => state.messages.filter((item) => !item.studentId || item.studentId === selectedStudent.id),
    [selectedStudent.id, state.messages],
  );

  const pendingWorks = worksForStudent.filter((work) => work.status === 'synced');
  const publishedTasks = tasksForStudent.filter((task) => task.status !== 'draft');
  const scoredTasks = tasksForStudent.filter((task) => task.status === 'scored');
  const progressPercent = publishedTasks.length ? Math.round((scoredTasks.length / publishedTasks.length) * 100) : 0;
  const latestReport = reportsForStudent[0];
  const strongest = [...selectedStudent.capabilities].sort((left, right) => right.score - left.score).slice(0, 6);
  const weakest = [...selectedStudent.capabilities].sort((left, right) => left.score - right.score).slice(0, 6);
  const planes = planeSummaries(selectedStudent);

  if (!sessionReady || !store.hydrated) {
    return (
      <main className="parent-app-bg">
        <div className="parent-phone">
          <div className="parent-loading">
            <Spin />
            <span>正在进入家长端</span>
          </div>
        </div>
      </main>
    );
  }

  function navigate(tab: ParentTabKey) {
    setActiveTab(tab);
    router.push(TAB_ITEMS.find((item) => item.key === tab)?.href ?? '/home');
  }

  function logout() {
    clearSession();
    router.push('/login');
  }

  function saveStudent(values: StudentInput) {
    if (studentModalMode === 'edit') {
      store.updateStudent(selectedStudent.id, values);
      messageApi.success('学员资料已更新');
    } else {
      store.addStudent(values);
      messageApi.success('学员已创建');
    }
    setStudentModalMode(null);
    studentForm.resetFields();
  }

  function saveDevice(values: { deviceCode: string; mode: 'sale' | 'rental' }) {
    store.bindDevice(selectedStudent.id, values);
    messageApi.success('设备已绑定到当前学员');
    setDeviceModalOpen(false);
  }

  function submitAssessment(values: Record<string, number>) {
    store.completeAssessment(selectedStudent.id, assessmentPlane, values);
    messageApi.success('家长能力评测报告已生成');
    setAssessmentOpen(false);
    assessmentForm.resetFields();
    navigate('growth');
  }

  function submitQuickTask(values: {
    studyDate: string;
    destination: string;
    taskTypes?: string[];
    capabilityTags?: string[];
    templateIds?: string[];
  }) {
    if (!values.templateIds?.length) {
      messageApi.warning('请选择至少一个任务');
      return;
    }
    const taskIds = store.createTasksFromTemplates({
      studyDate: values.studyDate,
      destination: values.destination,
      taskTypes: values.taskTypes ?? [],
      capabilityTags: values.capabilityTags ?? [],
      templateIds: values.templateIds,
    });
    setSelectedTaskIds(taskIds);
    setQuickTaskOpen(false);
    messageApi.success('家庭研学任务已创建');
    navigate('tasks');
  }

  function submitPublish(values: { studentIds: string[] }) {
    if (selectedTaskIds.length === 0) {
      messageApi.warning('请先勾选任务');
      return;
    }
    store.publishTasks(selectedTaskIds, values.studentIds?.length ? values.studentIds : [selectedStudent.id]);
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

  function savePayment(values: { account: string }) {
    store.savePaymentCard(selectedStudent.id, values.account);
    messageApi.success('支付卡已更新');
  }

  function saveNetDisk(values: { account: string }) {
    store.saveNetDisk(selectedStudent.id, values.account);
    messageApi.success('网盘已绑定');
  }

  function saveContact(values: { name: string; relation: string; phone: string }) {
    store.addContact(selectedStudent.id, values);
    messageApi.success('通讯录已更新');
  }

  function submitMessage(values: MessageInput) {
    store.addMessage({
      ...values,
      studentId: values.scope === 'student' ? selectedStudent.id : undefined,
    });
    setMessageOpen(false);
    messageForm.resetFields();
    messageApi.success('消息已发送');
  }

  function createOrder() {
    store.createOrder();
    messageApi.success('研学宝订单已创建');
  }

  function openTaskEditor(taskId?: string) {
    router.push(taskId ? `/family-tasks/editor?taskId=${taskId}` : '/family-tasks/editor');
  }

  function openReportDetail(reportId?: string) {
    const report = state.reports.find((item) => item.id === reportId) ?? latestReport;
    if (!report) {
      return;
    }
    setDetailItem({
      title: report.title,
      content: (
        <div className="parent-detail-stack">
          <p>{report.summary}</p>
          <div className="parent-mini-table">
            {report.rows.map((row) => (
              <div key={row.elementKey}>
                <span>{row.elementKey}</span>
                <strong>{row.latestIndex.toFixed(1)}</strong>
                <em>评测 {row.score.toFixed(1)} / 平均 {row.average.toFixed(1)}</em>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  function openWorkDetail(workId?: string) {
    const work = state.works.find((item) => item.id === workId);
    if (!work) {
      return;
    }
    const task = state.familyTasks.find((item) => item.id === work.taskId);
    setDetailItem({
      title: task?.title ?? '作品详情',
      content: (
        <div className="parent-detail-stack">
          <p>{work.content}</p>
          <div className="parent-tag-row">
            {work.attachments.map((item) => <Tag key={item}>{item}</Tag>)}
          </div>
          <div className="parent-score-line">
            <span>AI 建议</span>
            <strong>{work.aiScore ?? '-'} / {task?.points ?? '-'}</strong>
          </div>
          {work.parentScore ? (
            <div className="parent-score-line">
              <span>家长评分</span>
              <strong>{work.parentScore} / {task?.points ?? '-'}</strong>
            </div>
          ) : null}
          {work.comment ? <p>{work.comment}</p> : null}
        </div>
      ),
    });
  }

  function openDiaryDetail(item: GrowthDiaryItem) {
    if (item.type === 'report') {
      openReportDetail(item.relatedId);
      return;
    }
    if (item.type === 'work') {
      openWorkDetail(item.relatedId);
      return;
    }
    setDetailItem({
      title: item.title,
      content: (
        <div className="parent-detail-stack">
          <p>{item.content ?? item.summary}</p>
          {item.media?.length ? <div className="parent-tag-row">{item.media.map((media) => <Tag key={media}>{media}</Tag>)}</div> : null}
        </div>
      ),
    });
  }

  function renderHome() {
    return (
      <div className="parent-page">
        <section className="parent-hero">
          <div className="parent-hero-main">
            <span className="parent-eyebrow">当前学员</span>
            <h1>{selectedStudent.name}</h1>
            <p>{selectedStudent.school} · {selectedStudent.grade} · 研学宝 ID {selectedStudent.yxbId}</p>
            <div className="parent-hero-actions">
              <Button size="small" icon={<EditOutlined />} onClick={() => setStudentModalMode('edit')}>资料</Button>
              <Button size="small" type="primary" icon={<RadarChartOutlined />} onClick={() => setAssessmentOpen(true)}>评测</Button>
            </div>
          </div>
          <div className="parent-avatar">{selectedStudent.avatar}</div>
        </section>

        <div className="parent-metric-grid">
          <MetricCard label="能力指数" value={capabilityAverage.toFixed(1)} note={getCapabilityLevel(capabilityAverage)} icon={<RadarChartOutlined />} />
          <MetricCard label="成长值" value={selectedStudent.growthValue} note="可用成长值" icon={<StarOutlined />} />
        </div>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>家庭任务进度</strong>
            <button type="button" onClick={() => navigate('tasks')}>查看</button>
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

        <section className="parent-shop-banner" onClick={() => setPurchaseOpen(true)}>
          <div>
            <span>研学宝智能硬件</span>
            <strong>家庭研学套装优惠订购</strong>
          </div>
          <ShoppingOutlined />
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>常用入口</strong>
            <button type="button" onClick={store.resetDemoData}>恢复演示数据</button>
          </div>
          <div className="parent-shortcut-grid">
            <button type="button" onClick={() => setQuickTaskOpen(true)}><RocketOutlined />AI 创建</button>
            <button type="button" onClick={() => navigate('diary')}><ReadOutlined />成长日记</button>
            <button type="button" onClick={() => setDeviceModalOpen(true)}><MobileOutlined />绑定设备</button>
            <button type="button" onClick={() => setMessageOpen(true)}><MessageOutlined />消息广播</button>
          </div>
        </section>
      </div>
    );
  }

  function renderGrowth() {
    const planeLabels = planes.map((plane) => plane.title);
    return (
      <div className="parent-page">
        <section className="parent-index-card">
          <div>
            <span>当前能力指数</span>
            <strong>{capabilityAverage.toFixed(1)}</strong>
            <em>{getCapabilityLevel(capabilityAverage)} · 16 项能力元素平均值</em>
          </div>
          <Button type="primary" icon={<RadarChartOutlined />} onClick={() => setAssessmentOpen(true)}>家长评测</Button>
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>能力框架图</strong>
            <span>4 平面 16 元素</span>
          </div>
          <div className="parent-framework-grid">
            {planes.map((plane) => (
              <div key={plane.key} className="parent-framework-plane">
                <div>
                  <strong>{plane.title}</strong>
                  <span>{plane.score.toFixed(1)}</span>
                </div>
                <div className="parent-element-grid">
                  {selectedStudent.capabilities
                    .filter((item) => item.planeKey === plane.key)
                    .map((item) => (
                      <span key={item.id} className={`tone-${getTone(item.score)}`}>
                        {item.elementKey}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <RadarChart
          title="能力平面雷达图"
          labels={planeLabels}
          values={planes.map((plane) => plane.score)}
          compareValues={planes.map((plane) => plane.averageScore)}
        />
        <RadarChart
          title="优势能力图"
          labels={strongest.map((item) => item.elementKey)}
          values={strongest.map((item) => item.score)}
          compareValues={strongest.map((item) => item.averageScore)}
        />
        <RadarChart
          title="弱势能力图"
          labels={weakest.map((item) => item.elementKey)}
          values={weakest.map((item) => item.score)}
          compareValues={weakest.map((item) => item.averageScore)}
        />

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>评测记录</strong>
            <span>{reportsForStudent.length} 份</span>
          </div>
          <div className="parent-card-list">
            {reportsForStudent.map((report) => (
              <button key={report.id} type="button" className="parent-list-card" onClick={() => openReportDetail(report.id)}>
                <span>{report.title}</span>
                <em>{report.date} · {report.planeTitle}</em>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function renderDiary() {
    const workItems = worksForStudent.map((work) => ({
      work,
      task: state.familyTasks.find((task) => task.id === work.taskId),
    }));
    const aiItems = diaryForStudent.filter((item) => item.type === 'ai_qa' || item.type === 'ai_creation');
    return (
      <div className="parent-page">
        <Segmented
          block
          value={diaryPanel}
          onChange={(value) => setDiaryPanel(value as typeof diaryPanel)}
          options={[
            { label: '时间线', value: 'timeline' },
            { label: '作品', value: 'works' },
            { label: 'AI', value: 'ai' },
            { label: '消息', value: 'messages' },
          ]}
        />

        {diaryPanel === 'timeline' ? (
          <section className="parent-timeline">
            {diaryForStudent.map((item) => (
              <button key={item.id} type="button" className="parent-timeline-item" onClick={() => openDiaryDetail(item)}>
                <span className={`parent-dot type-${item.type}`} />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                  <em>{formatDate(item.date)} · {item.source}</em>
                </div>
              </button>
            ))}
          </section>
        ) : null}

        {diaryPanel === 'works' ? (
          <section className="parent-card-list">
            {workItems.length ? workItems.map(({ work, task }) => (
              <button key={work.id} type="button" className="parent-work-card" onClick={() => openWorkDetail(work.id)}>
                <div>
                  <strong>{task?.title ?? '任务作品'}</strong>
                  <span>{task?.taskType ?? '家庭研学'} · {formatDate(work.submittedAt)}</span>
                </div>
                <Tag color={work.status === 'scored' ? 'green' : 'gold'}>
                  {work.status === 'scored' ? `${work.rating} 星` : '待评分'}
                </Tag>
              </button>
            )) : <Empty description="暂无作品" />}
          </section>
        ) : null}

        {diaryPanel === 'ai' ? (
          <section className="parent-card-list">
            <div className="parent-stat-strip">
              <span>累计问答 {diaryForStudent.filter((item) => item.type === 'ai_qa').length}</span>
              <span>累计创作 {diaryForStudent.filter((item) => item.type === 'ai_creation').length}</span>
            </div>
            {aiItems.map((item) => (
              <button key={item.id} type="button" className="parent-list-card" onClick={() => openDiaryDetail(item)}>
                <span>{item.title}</span>
                <em>{item.source} · {formatDate(item.date)}</em>
              </button>
            ))}
          </section>
        ) : null}

        {diaryPanel === 'messages' ? (
          <section className="parent-card-list">
            <Button type="primary" icon={<SendOutlined />} onClick={() => setMessageOpen(true)}>发送消息广播</Button>
            {messagesForStudent.map((item) => (
              <div key={item.id} className="parent-message-card">
                <div>
                  <Tag color={item.type === 'sos' ? 'red' : item.type === 'system' ? 'blue' : 'green'}>{item.type}</Tag>
                  {!item.read ? <Badge status="processing" /> : null}
                </div>
                <strong>{item.title}</strong>
                <p>{item.content}</p>
                <em>{formatDate(item.createdAt)}</em>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    );
  }

  function renderTasks() {
    const canUseFamilyTask = Boolean(selectedStudent.device);
    return (
      <div className="parent-page">
        {!canUseFamilyTask ? (
          <section className="parent-empty-guide">
            <MobileOutlined />
            <strong>请先绑定研学宝</strong>
            <p>家庭研学任务需要下发到学员研学宝设备。</p>
            <Button type="primary" onClick={() => setDeviceModalOpen(true)}>绑定设备</Button>
          </section>
        ) : null}

        <section className="parent-task-overview">
          <div>
            <span>家庭研学任务面板</span>
            <strong>{progressPercent}%</strong>
            <em>已完成 {scoredTasks.length}/{publishedTasks.length || 0}</em>
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
              <Button icon={<RocketOutlined />} onClick={() => setQuickTaskOpen(true)}>AI 创建</Button>
              <Button icon={<PlusOutlined />} onClick={() => openTaskEditor()}>自定义</Button>
              <Button type="primary" icon={<SendOutlined />} onClick={() => setPublishOpen(true)} disabled={selectedTaskIds.length === 0}>下发</Button>
            </div>
            <Checkbox.Group value={selectedTaskIds} onChange={(values) => setSelectedTaskIds(values.map(String))} className="parent-task-check-group">
              {tasksForStudent.map((task) => {
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
                        {task.capabilityTags.slice(0, 2).map((tag) => <Tag key={tag}>{tag}</Tag>)}
                      </div>
                      <div className="parent-action-row compact">
                        <Button size="small" onClick={() => openTaskEditor(task.id)} disabled={task.status !== 'draft'}>编辑</Button>
                        {task.status === 'published' ? (
                          <Button size="small" type="primary" onClick={() => store.syncDeviceWork(task.id, selectedStudent.id)}>同步设备作品</Button>
                        ) : null}
                        {work && work.status === 'synced' ? <Button size="small" onClick={() => setScoreWorkItem(work)}>评分</Button> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    <span>任务进度 {completed}/{assigned.length}</span>
                    <Progress percent={assigned.length ? Math.round((completed / assigned.length) * 100) : 0} showInfo={false} />
                  </div>
                </div>
              );
            })}
          </section>
        ) : null}

        {taskPanel === 'works' ? (
          <section className="parent-card-list">
            {worksForStudent.length ? worksForStudent.map((work) => {
              const task = state.familyTasks.find((item) => item.id === work.taskId);
              return (
                <div key={work.id} className="parent-work-card">
                  <button type="button" onClick={() => openWorkDetail(work.id)}>
                    <strong>{task?.title ?? '作品详情'}</strong>
                    <span>{formatDate(work.submittedAt)} · AI {work.aiScore ?? '-'} 分</span>
                  </button>
                  {work.status === 'synced' ? <Button size="small" type="primary" onClick={() => setScoreWorkItem(work)}>评分</Button> : <Tag color="green">{work.rating} 星</Tag>}
                </div>
              );
            }) : <Empty description="暂无设备端同步作品" />}
          </section>
        ) : null}
      </div>
    );
  }

  function renderDevice() {
    const device = selectedStudent.device;
    return (
      <div className="parent-page">
        <section className="parent-section">
          <div className="parent-section-head">
            <strong>学员档案</strong>
            <Button size="small" icon={<EditOutlined />} onClick={() => setStudentModalMode('edit')}>编辑</Button>
          </div>
          <div className="parent-profile-grid">
            <span>姓名<strong>{selectedStudent.name}</strong></span>
            <span>年龄<strong>{selectedStudent.age} 岁</strong></span>
            <span>城市<strong>{selectedStudent.city}</strong></span>
            <span>学校<strong>{selectedStudent.school}</strong></span>
            <span>年级<strong>{selectedStudent.grade}</strong></span>
            <span>研学宝 ID<strong>{selectedStudent.yxbId}</strong></span>
          </div>
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>设备绑定</strong>
            <Button size="small" icon={<MobileOutlined />} onClick={() => setDeviceModalOpen(true)}>绑定</Button>
          </div>
          {device ? (
            <div className="parent-device-card">
              <MobileOutlined />
              <div>
                <strong>{device.name}</strong>
                <span>{device.deviceCode} · {device.mode === 'sale' ? '销售模式' : '租赁模式'}</span>
                <em>绑定时间 {device.boundAt}</em>
              </div>
            </div>
          ) : (
            <Empty description="当前学员还未绑定设备" />
          )}
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>支付卡与网盘</strong>
            <CreditCardOutlined />
          </div>
          <Form
            key={`payment-${selectedStudent.id}-${device?.paymentCard?.account ?? 'empty'}`}
            initialValues={{ account: device?.paymentCard?.account ?? '' }}
            onFinish={savePayment}
            className="parent-inline-form"
          >
            <Form.Item name="account">
              <Input placeholder="支付宝亲子卡账号" />
            </Form.Item>
            <Button htmlType="submit">保存</Button>
          </Form>
          <Form
            key={`netdisk-${selectedStudent.id}-${device?.netDisk?.account ?? 'empty'}`}
            initialValues={{ account: device?.netDisk?.account ?? '' }}
            onFinish={saveNetDisk}
            className="parent-inline-form"
          >
            <Form.Item name="account">
              <Input placeholder="百度网盘账号" />
            </Form.Item>
            <Button htmlType="submit">绑定</Button>
          </Form>
          {device?.paymentCard ? <p className="parent-device-note">余额 {device.paymentCard.balance.toFixed(2)} 元 · 消费记录 {device.paymentCard.records.length} 条</p> : null}
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>通讯录管理</strong>
            <TeamOutlined />
          </div>
          <Form key={`contact-${selectedStudent.id}-${device?.contacts.length ?? 0}`} onFinish={saveContact} className="parent-contact-form">
            <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="姓名" />
            </Form.Item>
            <Form.Item name="relation" rules={[{ required: true, message: '请输入关系' }]}>
              <Input placeholder="关系" />
            </Form.Item>
            <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
              <Input placeholder="手机号" />
            </Form.Item>
            <Button htmlType="submit" icon={<PlusOutlined />}>添加</Button>
          </Form>
          <div className="parent-compact-list">
            {(device?.contacts ?? []).map((contact) => (
              <div key={contact.id}>
                <span>{contact.name} · {contact.relation}</span>
                <em>{contact.phone}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>停用时间</strong>
            <CompassOutlined />
          </div>
          <div className="parent-compact-list">
            {(device?.quietTimes ?? []).map((item) => (
              <div key={item.id}>
                <span>{item.label} · {item.start}-{item.end}</span>
                <Switch size="small" checked={item.enabled} onChange={() => store.toggleQuietTime(selectedStudent.id, item.id)} />
              </div>
            ))}
          </div>
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>24 小时轨迹</strong>
            <span>{device?.tracks.length ?? 0} 个位置</span>
          </div>
          <div className="parent-track-list">
            {(device?.tracks ?? []).map((track) => (
              <div key={track.id}>
                <span>{track.time}</span>
                <strong>{track.address}</strong>
                <em>距离导师 {track.distanceMeters} 米</em>
              </div>
            ))}
          </div>
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>研学宝订购</strong>
            <ShoppingOutlined />
          </div>
          <Button block type="primary" icon={<ShoppingOutlined />} onClick={() => setPurchaseOpen(true)}>查看优惠订购</Button>
          <div className="parent-compact-list order-list">
            {state.orders.map((order) => (
              <div key={order.id}>
                <span>{order.title}</span>
                <em>{order.status} · {order.amount} 元</em>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const activeTitle = TAB_ITEMS.find((item) => item.key === activeTab)?.label ?? '首页';

  return (
    <main className="parent-app-bg">
      {messageHolder}
      <div className="parent-phone">
        <header className="parent-shell-header">
          <div>
            <span>研学宝家长端</span>
            <strong>{activeTitle}</strong>
          </div>
          <StudentSelector
            students={state.students}
            selectedStudent={selectedStudent}
            onChange={store.selectStudent}
            onAdd={() => setStudentModalMode('add')}
          />
          <Button aria-label="退出" icon={<CloseOutlined />} shape="circle" onClick={logout} />
        </header>

        <div className="parent-shell-content">
          {activeTab === 'home' ? renderHome() : null}
          {activeTab === 'growth' ? renderGrowth() : null}
          {activeTab === 'diary' ? renderDiary() : null}
          {activeTab === 'tasks' ? renderTasks() : null}
          {activeTab === 'device' ? renderDevice() : null}
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
          title={detailItem?.title}
          open={Boolean(detailItem)}
          onClose={() => setDetailItem(null)}
          placement="bottom"
          height={430}
          getContainer={false}
          rootClassName="parent-detail-drawer"
        >
          {detailItem?.content}
        </Drawer>
      </div>

      <Modal
        title={studentModalMode === 'edit' ? '编辑学员' : '新增学员'}
        open={studentModalMode !== null}
        onCancel={() => setStudentModalMode(null)}
        footer={null}
        width={340}
        forceRender
      >
        <Form form={studentForm} layout="vertical" onFinish={saveStudent}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="学员姓名" />
          </Form.Item>
          <Form.Item name="birthday" label="出生日期" rules={[{ required: true, message: '请输入出生日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="city" label="城市" rules={[{ required: true, message: '请输入城市' }]}>
            <Input placeholder="所在城市" />
          </Form.Item>
          <Form.Item name="school" label="学校" rules={[{ required: true, message: '请输入学校' }]}>
            <Input placeholder="所在学校" />
          </Form.Item>
          <Form.Item name="grade" label="年级" rules={[{ required: true, message: '请输入年级' }]}>
            <Input placeholder="当前年级" />
          </Form.Item>
          <Form.Item name="avatar" label="头像文字">
            <Input placeholder="例如 一诺" maxLength={4} />
          </Form.Item>
          <Button block type="primary" htmlType="submit">保存学员</Button>
        </Form>
      </Modal>

      <Modal title="绑定研学宝" open={deviceModalOpen} onCancel={() => setDeviceModalOpen(false)} footer={null} width={340} forceRender>
        <Form form={deviceForm} layout="vertical" onFinish={saveDevice}>
          <Form.Item name="deviceCode" label="设备码" rules={[{ required: true, message: '请输入设备码' }]}>
            <Input placeholder="扫码或输入设备码" />
          </Form.Item>
          <Form.Item name="mode" label="设备模式" rules={[{ required: true, message: '请选择设备模式' }]}>
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value="sale">销售模式</Radio.Button>
              <Radio.Button value="rental">租赁模式</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Button block type="primary" htmlType="submit">确认绑定</Button>
        </Form>
      </Modal>

      <Modal title="家长能力评测" open={assessmentOpen} onCancel={() => setAssessmentOpen(false)} footer={null} width={350} forceRender>
        <div className="parent-modal-stack">
          <Select
            value={assessmentPlane}
            onChange={setAssessmentPlane}
            options={[
              { label: '全面测试', value: 'all' },
              ...CAPABILITY_PLANES.map((plane) => ({ label: plane.title, value: plane.key })),
            ]}
          />
          <Form form={assessmentForm} layout="vertical" onFinish={submitAssessment}>
            {(assessmentPlane === 'all' ? CAPABILITY_PLANES.flatMap((plane) => plane.elements) : CAPABILITY_PLANES.find((plane) => plane.key === assessmentPlane)?.elements ?? []).map((element) => (
              <section key={element} className="parent-assessment-group">
                <strong>{element}</strong>
                {getAssessmentQuestions().map((question, index) => (
                  <Form.Item
                    key={`${element}_${index}`}
                    name={`${element}_${index}`}
                    label={question}
                    initialValue={index % 2 === 0 ? 8 : 10}
                    rules={[{ required: true, message: '请选择' }]}
                  >
                    <Radio.Group options={ASSESSMENT_OPTIONS} />
                  </Form.Item>
                ))}
              </section>
            ))}
            <Button block type="primary" htmlType="submit">生成评测报告</Button>
          </Form>
        </div>
      </Modal>

      <Modal title="AI 快速创建任务" open={quickTaskOpen} onCancel={() => setQuickTaskOpen(false)} footer={null} width={350} forceRender>
        <Form form={quickTaskForm} layout="vertical" onFinish={submitQuickTask}>
          <Form.Item name="studyDate" label="研学日期" rules={[{ required: true, message: '请选择日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="destination" label="研学目的地" rules={[{ required: true, message: '请输入目的地' }]}>
            <Input placeholder="例如 深圳海洋馆" />
          </Form.Item>
          <Form.Item name="taskTypes" label="任务类型">
            <Checkbox.Group options={TASK_TYPES} />
          </Form.Item>
          <Form.Item name="capabilityTags" label="能力元素">
            <Select mode="multiple" options={CAPABILITY_OPTIONS.map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item name="templateIds" label="匹配任务">
            <Checkbox.Group className="parent-template-checks">
              {TASK_LIBRARY.map((template) => (
                <Checkbox key={template.id} value={template.id}>
                  <span>{template.title}</span>
                  <em>{template.base} · {template.taskType}</em>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
          <Button block type="primary" htmlType="submit">创建研学任务</Button>
        </Form>
      </Modal>

      <Modal title="下发任务" open={publishOpen} onCancel={() => setPublishOpen(false)} footer={null} width={340} forceRender>
        <Form
          key={`publish-${selectedStudent.id}-${selectedTaskIds.join('-') || 'empty'}`}
          layout="vertical"
          initialValues={{ studentIds: [selectedStudent.id] }}
          onFinish={submitPublish}
        >
          <Form.Item label="已选任务">
            <div className="parent-selected-list">
              {selectedTaskIds.map((taskId) => <Tag key={taskId}>{state.familyTasks.find((task) => task.id === taskId)?.title ?? taskId}</Tag>)}
            </div>
          </Form.Item>
          <Form.Item name="studentIds" label="下发学员" rules={[{ required: true, message: '请选择学员' }]}>
            <Checkbox.Group options={state.students.map((student) => ({ label: student.name, value: student.id }))} />
          </Form.Item>
          <Button block type="primary" htmlType="submit">确认下发到研学宝</Button>
        </Form>
      </Modal>

      <Modal title="作品评分" open={Boolean(scoreWorkItem)} onCancel={() => setScoreWorkItem(null)} footer={null} width={350} forceRender>
        {scoreWorkItem ? (
          <div className="parent-modal-stack">
            <p>{scoreWorkItem.content}</p>
            <div className="parent-tag-row">{scoreWorkItem.attachments.map((item) => <Tag key={item}>{item}</Tag>)}</div>
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
              <Button block type="primary" htmlType="submit">保存评分</Button>
            </Form>
          </div>
        ) : null}
      </Modal>

      <Modal title="消息广播" open={messageOpen} onCancel={() => setMessageOpen(false)} footer={null} width={340} forceRender>
        <Form form={messageForm} layout="vertical" onFinish={submitMessage} initialValues={{ type: 'direct', scope: 'student' }}>
          <Form.Item name="type" label="消息类型">
            <Select
              options={[
                { label: '团队广播', value: 'team_broadcast' },
                { label: '小组广播', value: 'group_broadcast' },
                { label: '学员消息', value: 'direct' },
                { label: '系统消息', value: 'system' },
              ]}
            />
          </Form.Item>
          <Form.Item name="scope" label="发送范围">
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value="team">团队</Radio.Button>
              <Radio.Button value="group">小组</Radio.Button>
              <Radio.Button value="student">学员</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="消息标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button block type="primary" htmlType="submit">发送</Button>
        </Form>
      </Modal>

      <Modal title="研学宝优惠订购" open={purchaseOpen} onCancel={() => setPurchaseOpen(false)} footer={null} width={350}>
        <div className="parent-purchase-panel">
          <MobileOutlined />
          <strong>研学宝智能硬件家庭套装</strong>
          <p>含研学宝设备、家庭研学任务服务、能力评测与成长档案。</p>
          <div className="parent-price">1299 元</div>
          <Button block type="primary" icon={<ShoppingOutlined />} onClick={createOrder}>生成研学宝订单</Button>
          <div className="parent-compact-list order-list">
            {state.orders.map((order: ParentOrder) => (
              <div key={order.id}>
                <span>{order.title}</span>
                <em>{order.status} · {formatDate(order.createdAt)}</em>
              </div>
            ))}
          </div>
        </div>
      </Modal>

    </main>
  );
}
