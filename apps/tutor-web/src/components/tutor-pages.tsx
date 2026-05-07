'use client';

import {
  BellOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  LogoutOutlined,
  PlusOutlined,
  RightOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SafetyOutlined,
  SendOutlined,
  TeamOutlined,
  PicCenterOutlined,
  ScheduleOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Progress,
  Rate,
  Segmented,
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearSession, getStoredSession } from '../lib/api';
import {
  type BroadcastContentType,
  type BroadcastScope,
  type EvaluationMode,
  type EvaluationEntry,
  type GroupRole,
  type ReportTemplate,
  type ScoreKind,
  type TaskAttachment,
  type TaskScope,
  type TaskStatus,
  type Team,
  type TeamSource,
  type TeamStatus,
  type WorkRequirement,
  computeGroupTotalScore,
  computeStudentTotalScore,
  getCurrentTeam,
  getEvaluationForStudent,
  getGroupProgressSummary,
  getGroupsByTeam,
  getLocationForStudent,
  getOwnerName,
  getRewardPenaltyTotal,
  getSosForTeam,
  getStudentEvaluationSummary,
  getStudentProgressSummary,
  getTrackForStudent,
  getStudentsByTeam,
  getTasksByTeam,
  getTeamById,
  getWorksByTeam,
  getWorksForOwner,
  useTutorStore,
} from '../lib/mock-store';
import { QuickMenuLinks } from './tutor-shell';

function SectionCard({
  title,
  extra,
  children,
  note,
}: {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
  note?: string;
}) {
  return (
    <section className="tutor-card">
      <div className="tutor-section-head">
        <div>
          <div className="tutor-section-title">{title}</div>
          {note ? <div className="tutor-section-note">{note}</div> : null}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return <div className="tutor-empty">{text}</div>;
}

function formatDate(value?: string) {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 16);
}

function formatTeamStatus(status: TeamStatus) {
  if (status === 'creating') return { color: 'default', label: '创建中' };
  if (status === 'recruiting') return { color: 'cyan', label: '招募中' };
  if (status === 'pending_trip') return { color: 'gold', label: '待出行' };
  if (status === 'active') return { color: 'green', label: '活动中' };
  return { color: 'default', label: '已出行' };
}

function formatSource(source: TeamSource) {
  return source === 'system' ? '系统团队' : '自建团队';
}

function formatTaskStatus(status: TaskStatus) {
  if (status === 'ai_created') return { color: 'purple', label: 'AI创建' };
  if (status === 'pending_publish') return { color: 'gold', label: '待下发' };
  if (status === 'published') return { color: 'blue', label: '已下发' };
  if (status === 'withdrawn') return { color: 'red', label: '已撤回' };
  if (status === 'ended') return { color: 'default', label: '已结束' };
  return { color: 'default', label: '未知' };
}

function formatWorkStatus(status: string) {
  if (status === 'confirmed') return { color: 'green', label: '评分确认' };
  if (status === 'ai_scored') return { color: 'processing', label: 'AI 评分' };
  if (status === 'submitted') return { color: 'gold', label: '已提交' };
  return { color: 'default', label: '未提交' };
}

function formatBroadcastScope(scope: BroadcastScope) {
  if (scope === 'team') return '团队广播';
  if (scope === 'group') return '小组广播';
  return '学员消息';
}

function formatContentType(type: BroadcastContentType) {
  if (type === 'lecture') return '语音讲解';
  if (type === 'voice') return '语音';
  if (type === 'image') return '图片';
  return '文字';
}

function groupRoleLabel(role: GroupRole) {
  const map: Record<GroupRole, string> = {
    leader: '组长',
    vice_leader: '副组长',
    recorder: '记录员',
    researcher: '研究员',
    operator: '操作员',
    safety: '安全员',
    reporter: '汇报员',
    photographer: '摄影师',
    custom: '自定义岗位',
  };
  return map[role];
}

function evaluationModeLabel(mode: EvaluationMode) {
  if (mode === 'tutor_only') return '仅导师评价';
  if (mode === 'self_tutor') return '自评 + 师评';
  return '自评 + 互评 + 师评';
}

function requirementTypeLabel(type: WorkRequirement['type']) {
  const map: Record<WorkRequirement['type'], string> = {
    text: '文本',
    choice: '选择',
    judge: '判断',
    image: '图片',
    checkin: '打卡',
    audio: '录音',
    video: '视频',
    observation: '观察记录表',
    ai_inquiry: 'AI 探究',
    ai_work_link: 'AI 作品链接',
  };
  return map[type];
}

function scoreKindLabel(kind: ScoreKind) {
  return kind === 'reward' ? '奖励分' : '处罚分';
}

function teamSourceOptions() {
  return [
    { label: '系统', value: 'system' },
    { label: '自建', value: 'self-built' },
  ];
}

function teamStatusOptions() {
  return [
    { label: '创建中', value: 'creating' },
    { label: '招募中', value: 'recruiting' },
    { label: '待出行', value: 'pending_trip' },
    { label: '出行中', value: 'active' },
    { label: '已出行', value: 'ended' },
  ];
}

function taskScopeLabel(scope: TaskScope) {
  return scope === 'student' ? '学员任务' : '小组任务';
}

function MobileSummaryGrid({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <div className="tutor-metric-grid">
      {items.map((item) => (
        <div key={item.label} className="tutor-metric">
          <div className="tutor-metric-label">{item.label}</div>
          <div className="tutor-metric-value" style={{ fontSize: 20 }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskEditor({
  open,
  initialValue,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  initialValue?: {
    id?: string;
    scope: TaskScope;
    source: 'manual' | 'history' | 'library' | 'ai';
    base: string;
    taskType: string;
    title: string;
    points: number;
    description: string;
    abilityTags: string[];
    subjects: string[];
    attachments: TaskAttachment[];
    requirements: WorkRequirement[];
    status: TaskStatus;
  } | null;
  onCancel: () => void;
  onSubmit: (value: {
    id?: string;
    scope: TaskScope;
    source: 'manual' | 'history' | 'library' | 'ai';
    base: string;
    taskType: string;
    title: string;
    points: number;
    description: string;
    abilityTags: string[];
    subjects: string[];
    attachments: TaskAttachment[];
    requirements: WorkRequirement[];
    status: TaskStatus;
  }) => void;
}) {
  const [form] = Form.useForm();

  return (
    <Modal
      forceRender
      open={open}
      title={initialValue?.id ? '编辑任务' : '新建任务'}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="保存任务"
      cancelText="取消"
      width={420}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          scope: initialValue?.scope ?? 'student',
          source: initialValue?.source ?? 'manual',
          base: initialValue?.base ?? '深圳海洋馆',
          taskType: initialValue?.taskType ?? '观察记录',
          title: initialValue?.title ?? '',
          points: initialValue?.points ?? 20,
          description: initialValue?.description ?? '',
          abilityTags: initialValue?.abilityTags.join('、') ?? '观察力、表达力、科学探究',
          subjects: initialValue?.subjects.join('、') ?? '科学、语文',
          attachmentText: initialValue?.attachments.map((attachment) => attachment.name).join('\n') ?? '',
          requirements:
            initialValue?.requirements ?? [{ id: 'req_form_1', type: 'text', requirement: '完成 100 字观察记录' }],
          status: initialValue?.status ?? 'pending_publish',
        }}
        onFinish={(values) => {
          onSubmit({
            id: initialValue?.id,
            scope: values.scope,
            source: values.source,
            base: values.base,
            taskType: values.taskType,
            title: values.title,
            points: values.points,
            description: values.description,
            abilityTags: String(values.abilityTags)
              .split(/[、,，]/)
              .map((item) => item.trim())
              .filter(Boolean),
            subjects: String(values.subjects)
              .split(/[、,，]/)
              .map((item) => item.trim())
              .filter(Boolean),
            attachments: (values.attachmentText as string)
              .split('\n')
              .map((line: string) => line.trim())
              .filter(Boolean)
              .map((line: string, index: number) => ({
                id: `attachment_${index}`,
                name: line,
                kind: (line.includes('AI') || line.includes('关键字') ? 'ai_link' : line.endsWith('.pdf') ? 'pdf' : line.match(/\.(png|jpg|jpeg|webp)$/i) ? 'image' : 'file') as TaskAttachment['kind'],
                url: '#',
                keyword: line.includes('AI') || line.includes('关键字') ? line.replace(/^AI[:：]?/, '') : undefined,
              })),
            requirements: (values.requirements as Array<{ type: WorkRequirement['type']; requirement: string }>).map(
              (item, index) => ({
                id: `req_form_${index}`,
                type: item.type,
                requirement: item.requirement,
              }),
            ),
            status: values.status,
          });
        }}
      >
        <Form.Item name="scope" label="任务范围" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '学员任务', value: 'student' },
              { label: '小组任务', value: 'group' },
            ]}
          />
        </Form.Item>
        <Form.Item name="source" label="任务来源" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '手动创建', value: 'manual' },
              { label: '历史复制', value: 'history' },
              { label: '任务库', value: 'library' },
              { label: 'AI 创建', value: 'ai' },
            ]}
          />
        </Form.Item>
        <Form.Item name="base" label="研学基地" rules={[{ required: true }]}>
          <Input placeholder="例如：深圳海洋馆" />
        </Form.Item>
        <Form.Item name="taskType" label="任务类型" rules={[{ required: true }]}>
          <Input placeholder="例如：观察记录 / 问答任务 / 创作任务" />
        </Form.Item>
        <Form.Item name="title" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
          <Input placeholder="请输入正式任务名称" />
        </Form.Item>
        <Form.Item name="points" label="任务分值" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} max={50} />
        </Form.Item>
        <Form.Item name="description" label="任务说明" rules={[{ required: true }]}>
          <Input.TextArea rows={3} maxLength={500} />
        </Form.Item>
        <Form.Item name="abilityTags" label="能力标签">
          <Input placeholder="多个标签用 、 分隔，例如：观察力、表达力" />
        </Form.Item>
        <Form.Item name="subjects" label="关联学科">
          <Input placeholder="1-5 门学科，用 、 分隔，例如：科学、语文" />
        </Form.Item>
        <Form.Item name="attachmentText" label="任务参考资料">
          <Input.TextArea rows={3} placeholder="每行一个资料，例如：任务说明.pdf&#10;观察示例图.jpg&#10;AI关键字：海洋馆 海龟 科普" />
        </Form.Item>
        <Form.List name="requirements">
          {(fields, { add, remove }) => (
            <div className="tutor-stack">
              <div className="tutor-section-note">作品要求</div>
              {fields.map((field, index) => {
                const { key, ...fieldProps } = field;
                return (
                  <div key={key} className="tutor-card tutor-card-soft">
                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                      <Form.Item
                        {...fieldProps}
                        name={[field.name, 'type']}
                        label={`作品 ${index + 1} 类型`}
                        rules={[{ required: true }]}
                      >
                        <Select
                          options={[
                            { label: '文本', value: 'text' },
                            { label: '选择', value: 'choice' },
                            { label: '判断', value: 'judge' },
                            { label: '图片', value: 'image' },
                            { label: '打卡', value: 'checkin' },
                            { label: '录音', value: 'audio' },
                            { label: '视频', value: 'video' },
                            { label: '观察记录表', value: 'observation' },
                            { label: 'AI 探究', value: 'ai_inquiry' },
                            { label: 'AI 作品链接', value: 'ai_work_link' },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item
                        {...fieldProps}
                        name={[field.name, 'requirement']}
                        label="作品要求"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="例如：上传 1 张图片并说明 50 字" />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <Button danger onClick={() => remove(field.name)}>
                          删除该作品要求
                        </Button>
                      ) : null}
                    </Space>
                  </div>
                );
              })}
              <Button icon={<PlusOutlined />} onClick={() => add({ type: 'text', requirement: '' })}>
                添加作品要求
              </Button>
            </div>
          )}
        </Form.List>
        <Form.Item name="status" label="任务状态">
          <Select
            options={[
              { label: 'AI创建', value: 'ai_created' },
              { label: '待下发', value: 'pending_publish' },
              { label: '已下发', value: 'published' },
              { label: '已撤回', value: 'withdrawn' },
              { label: '已结束', value: 'ended' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function buildTeamContext(state: ReturnType<typeof useTutorStore>['state'], teamId?: string) {
  const team = teamId ? getTeamById(state, teamId) : getCurrentTeam(state);
  const students = team ? getStudentsByTeam(state, team.id) : [];
  const groups = team ? getGroupsByTeam(state, team.id) : [];
  const studentTasks = team ? getTasksByTeam(state, team.id, 'student') : [];
  const groupTasks = team ? getTasksByTeam(state, team.id, 'group') : [];
  const works = team ? getWorksByTeam(state, team.id) : [];
  const studentWorks = works.filter((item) => item.ownerType === 'student');
  const groupWorks = works.filter((item) => item.ownerType === 'group');
  const teamStats = team
    ? {
        joined: students.filter((student) => student.joined).length,
        total: students.length,
        online: students.filter((student) => student.online).length,
      }
    : null;

  return { team, students, groups, studentTasks, groupTasks, works, studentWorks, groupWorks, teamStats };
}

function TeamEditorModal({
  open,
  team,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  team?: Team | null;
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    source: TeamSource;
    status: TeamStatus;
    maxStudents: number;
    startDate: string;
    days: number;
    destination: string;
    bases: string[];
    studentSource: string;
    organizationName: string;
    reportTemplateId: string;
    evaluationMode: EvaluationMode;
  }) => void;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: team?.name ?? '',
        source: team?.source ?? 'system',
        status: team?.status ?? 'creating',
        maxStudents: team?.maxStudents ?? 30,
        startDate: team?.startDate ?? '2026-04-20',
        days: team?.days ?? 1,
        destination: team?.destination ?? '',
        bases: team?.bases.join('、') ?? '',
        studentSource: team?.studentSource ?? '',
        organizationName: team?.organizationName ?? '南山实验学校研学中心',
        reportTemplateId: team?.reportTemplateId ?? 'tpl_report_ocean',
        evaluationMode: team?.evaluationMode ?? 'self_peer_tutor',
      });
    } else {
      form.resetFields();
    }
  }, [form, open, team]);

  return (
    <Modal forceRender open={open} title={team ? '编辑团队' : '新建团队'} onCancel={onCancel} onOk={() => form.submit()} okText="保存" width={420}>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) =>
          onSubmit({
            name: values.name,
            source: values.source,
            status: values.status,
            maxStudents: values.maxStudents,
            startDate: values.startDate,
            days: values.days,
            destination: values.destination,
            bases: String(values.bases)
              .split(/[、,，]/)
              .map((item) => item.trim())
              .filter(Boolean),
            studentSource: values.studentSource,
            organizationName: values.organizationName,
            reportTemplateId: values.reportTemplateId,
            evaluationMode: values.evaluationMode,
          })
        }
      >
        <Form.Item name="name" label="团队名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="source" label="团队类型" rules={[{ required: true }]}>
          <Select options={teamSourceOptions()} />
        </Form.Item>
        <Form.Item name="status" label="团队状态" rules={[{ required: true }]}>
          <Select options={teamStatusOptions()} />
        </Form.Item>
        <Form.Item name="maxStudents" label="最大人数" rules={[{ required: true }]}>
          <InputNumber min={1} max={200} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="organizationName" label="所属机构" rules={[{ required: true }]}>
          <Input placeholder="例如：南山实验学校" />
        </Form.Item>
        <Form.Item name="reportTemplateId" label="研学报告模版" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '海洋探索综合成长报告', value: 'tpl_report_ocean' },
              { label: '生态实践观察报告', value: 'tpl_report_green' },
              { label: '李老师常用个性化报告', value: 'tpl_report_tutor_custom' },
            ]}
          />
        </Form.Item>
        <Form.Item name="evaluationMode" label="评价方式" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '仅导师评价', value: 'tutor_only' },
              { label: '自评 + 师评', value: 'self_tutor' },
              { label: '自评 + 互评 + 师评', value: 'self_peer_tutor' },
            ]}
          />
        </Form.Item>
        <Form.Item name="startDate" label="出发日期" rules={[{ required: true }]}>
          <Input placeholder="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="days" label="研学天数" rules={[{ required: true }]}>
          <InputNumber min={1} max={10} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="destination" label="目的地" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="bases" label="研学基地">
          <Input placeholder="多个基地用 、 分隔" />
        </Form.Item>
        <Form.Item name="studentSource" label="学员来源">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function AssistantEditorModal({
  open,
  title,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: (values: { name: string; phone: string }) => void;
}) {
  const [form] = Form.useForm();

  return (
    <Modal
      forceRender
      open={open}
      title={title}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      okText="添加"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit(values);
          form.resetFields();
        }}
      >
        <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function MaterialEditorModal({
  open,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { name: string; description: string; url: string }) => void;
}) {
  const [form] = Form.useForm();

  return (
    <Modal
      forceRender
      open={open}
      title="添加资料"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      okText="添加"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit(values);
          form.resetFields();
        }}
      >
        <Form.Item name="name" label="资料名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="资料说明" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="url" label="资料链接" rules={[{ required: true }]}>
          <Input placeholder="请输入资料链接" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function StudentEditorModal({
  open,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    age: number;
    idNumber: string;
    parentName: string;
    parentPhone: string;
    joined: boolean;
  }) => void;
}) {
  const [form] = Form.useForm();

  return (
    <Modal
      forceRender
      open={open}
      title="添加学员"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      okText="保存"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ age: 10, joined: false }}
        onFinish={(values) => {
          onSubmit(values);
          form.resetFields();
        }}
      >
        <Form.Item name="name" label="学员姓名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="age" label="年龄" rules={[{ required: true }]}>
          <InputNumber min={6} max={18} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="idNumber" label="学生证件号" rules={[{ required: true }]}>
          <Input placeholder="用于匹配已有研学宝 ID" />
        </Form.Item>
        <Form.Item name="parentName" label="家长姓名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="parentPhone" label="家长手机号" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="joined" label="加入状态" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '已加入研学宝', value: true },
              { label: '未加入研学宝', value: false },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function StudentImportModal({
  open,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  onCancel: () => void;
  onSubmit: (rawText: string) => void;
}) {
  const [rawImport, setRawImport] = useState('');

  return (
    <Modal
      open={open}
      title="导入学生名单"
      onCancel={() => {
        setRawImport('');
        onCancel();
      }}
      onOk={() => {
        onSubmit(rawImport);
        setRawImport('');
      }}
      okText="导入"
    >
      <div className="tutor-stack">
        <div className="tutor-section-note">每行 1 个学员，格式：学员姓名,年龄,证件号,家长姓名,家长手机号</div>
        <Input.TextArea
          rows={6}
          value={rawImport}
          onChange={(event) => setRawImport(event.target.value)}
          placeholder="张小海,10,440305201512120001,张妈妈,13800000001"
        />
      </div>
    </Modal>
  );
}

export function DashboardPageContent() {
  const { state, actions } = useTutorStore();
  const router = useRouter();
  const currentTeam = getCurrentTeam(state);
  const [messageApi, contextHolder] = message.useMessage();
  const [tab, setTab] = useState<'students' | 'studentWorks' | 'groupWorks'>('students');
  const [qrOpen, setQrOpen] = useState(false);
  const [studentDetailId, setStudentDetailId] = useState<string | null>(null);
  const [locationStudentId, setLocationStudentId] = useState<string | null>(null);
  const [scoringWorkId, setScoringWorkId] = useState<string | null>(null);
  const [detailWorkId, setDetailWorkId] = useState<string | null>(null);
  const [batchSelection, setBatchSelection] = useState<string[]>([]);
  const [rewardTarget, setRewardTarget] = useState<{ targetType: TaskScope; targetId: string } | null>(null);
  const [evaluationStudentId, setEvaluationStudentId] = useState<string | null>(null);
  const [evaluationDraft, setEvaluationDraft] = useState<EvaluationEntry[]>([]);
  const [evaluationComment, setEvaluationComment] = useState('');
  const [scoreForm] = Form.useForm();

  const students = currentTeam ? getStudentsByTeam(state, currentTeam.id) : [];
  const groups = currentTeam ? getGroupsByTeam(state, currentTeam.id) : [];
  const studentTasks = currentTeam ? getTasksByTeam(state, currentTeam.id, 'student') : [];
  const groupTasks = currentTeam ? getTasksByTeam(state, currentTeam.id, 'group') : [];
  const works = currentTeam ? getWorksByTeam(state, currentTeam.id) : [];
  const studentWorks = works.filter((item) => item.ownerType === 'student');
  const groupWorks = works.filter((item) => item.ownerType === 'group');
  const studentDetail = studentDetailId ? students.find((student) => student.id === studentDetailId) : null;
  const locationStudent = locationStudentId ? students.find((student) => student.id === locationStudentId) : null;
  const scoringWork = scoringWorkId ? works.find((work) => work.id === scoringWorkId) : null;
  const detailWork = detailWorkId ? works.find((work) => work.id === detailWorkId) : null;
  const selectedPendingAi = works.filter((work) => batchSelection.includes(work.id) && work.aiScore !== undefined);

  const teamStats = currentTeam
    ? {
        joined: students.filter((student) => student.joined).length,
        total: students.length,
        online: students.filter((student) => student.online).length,
      }
    : null;

  const studentProgressPercent =
    studentTasks.length === 0 || students.length === 0
      ? 0
      : Math.round(
          (studentWorks.filter((item) => item.status !== 'draft').length / (studentTasks.length * students.length)) * 100,
        );

  const groupProgressPercent =
    groupTasks.length === 0 || groups.length === 0
      ? 0
      : Math.round(
          (groupWorks.filter((item) => item.status !== 'draft').length / (groupTasks.length * groups.length)) * 100,
        );

  function openEvaluation(studentId: string) {
    const existing = getEvaluationForStudent(state, studentId);
    if (existing) {
      setEvaluationDraft(existing.items);
      setEvaluationComment(existing.comment);
    } else {
      setEvaluationDraft(
        state.evaluationItems.map((item) => ({
          itemId: item.id,
          selfRating: 0,
          groupRating: 0,
          tutorRating: 4,
        })),
      );
      setEvaluationComment('');
    }
    setEvaluationStudentId(studentId);
  }

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard
        title={currentTeam?.name ?? '请选择研学团队'}
        note={currentTeam ? `${formatSource(currentTeam.source)} · ${currentTeam.organizationName}` : '当前没有执行中的研学团队'}
        extra={
          <Space>
            <Button size="small" onClick={() => router.push('/team-switch')}>
              切换团队
            </Button>
            {currentTeam ? (
              <Button
                size="small"
                type="primary"
                icon={<QrcodeOutlined />}
                onClick={(event) => {
                  event.stopPropagation();
                  setQrOpen(true);
                }}
              >
                团队码
              </Button>
            ) : null}
          </Space>
        }
      >
        {currentTeam ? (
          <div
            className="tutor-stack tutor-card-clickable"
            role="button"
            tabIndex={0}
            onClick={() => currentTeam && router.push(`/teams/${currentTeam.id}`)}
          >
            <div className="tutor-list-subtitle">
              {currentTeam.startDate} · {currentTeam.days} 天 · {currentTeam.destination}
            </div>
            <div className="tutor-inline-list">
              {currentTeam.bases.map((base) => (
                <span key={base} className="tutor-pill">
                  {base}
                </span>
              ))}
              <Tag color={formatTeamStatus(currentTeam.status).color}>{formatTeamStatus(currentTeam.status).label}</Tag>
            </div>
            <MobileSummaryGrid
              items={[
                { label: '团队人数/最大人数', value: `${teamStats?.total ?? 0}/${currentTeam.maxStudents}` },
                { label: '在线人数', value: teamStats?.online ?? 0 },
                { label: '学员任务进度', value: `${studentProgressPercent}%` },
                { label: '小组任务进度', value: `${groupProgressPercent}%` },
              ]}
            />
          </div>
        ) : (
          <EmptyBlock text="当前没有执行中的研学团队，请先切换团队后再进入工作台。" />
        )}
      </SectionCard>

      <SectionCard title="快捷菜单" note="任务进度、消息、报告模版与现场工具">
        <QuickMenuLinks />
      </SectionCard>

      <SectionCard
        title="学员任务信息"
        note="查看学员加入情况、任务总量、总进度，并进入学员任务管理"
        extra={
          <Link href="/tasks">
            <Button size="small" type="link">
              学员任务管理
            </Button>
          </Link>
        }
      >
        {currentTeam ? (
          <div className="tutor-stack">
            <div className="tutor-metric-grid">
              <div className="tutor-metric">
                <div className="tutor-metric-label">已加入学员 / 总学员</div>
                <div className="tutor-metric-value" style={{ fontSize: 20 }}>
                  {teamStats?.joined ?? 0}/{teamStats?.total ?? 0}
                </div>
              </div>
              <div className="tutor-metric">
                <div className="tutor-metric-label">学员任务数</div>
                <div className="tutor-metric-value" style={{ fontSize: 20 }}>
                  {studentTasks.length}
                </div>
              </div>
              <div className="tutor-metric">
                <div className="tutor-metric-label">已提交作品</div>
                <div className="tutor-metric-value" style={{ fontSize: 20 }}>
                  {studentWorks.filter((item) => item.status !== 'draft').length}
                </div>
              </div>
              <div className="tutor-metric tutor-metric-progress">
                <div className="tutor-metric-label">总进度</div>
                <div className="tutor-metric-value" style={{ fontSize: 20 }}>
                  {studentProgressPercent}%
                </div>
                <div className="tutor-progress-track" aria-hidden="true">
                  <div className="tutor-progress-fill" style={{ width: `${studentProgressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyBlock text="选择团队后，这里会展示学员任务执行信息。" />
        )}
      </SectionCard>

      <SectionCard
        title="小组任务信息"
        note="查看小组数、小组在线情况与逐组任务进度，并进入小组管理"
        extra={
          <Link href={currentTeam ? `/teams/${currentTeam.id}/groups` : '/groups'}>
            <Button size="small" type="link">
              小组管理
            </Button>
          </Link>
        }
      >
        {!currentTeam ? (
          <EmptyBlock text="选择团队后，这里会展示小组任务信息。" />
        ) : (
          <div className="tutor-stack">
            <div className="tutor-metric-grid">
              <div className="tutor-metric">
                <div className="tutor-metric-label">小组数</div>
                <div className="tutor-metric-value" style={{ fontSize: 20 }}>
                  {groups.length}
                </div>
              </div>
              <div className="tutor-metric">
                <div className="tutor-metric-label">小组任务数</div>
                <div className="tutor-metric-value" style={{ fontSize: 20 }}>
                  {groupTasks.length}
                </div>
              </div>
              <div className="tutor-metric">
                <div className="tutor-metric-label">在线学员</div>
                <div className="tutor-metric-value" style={{ fontSize: 20 }}>
                  {students.filter((student) => student.online).length}
                </div>
              </div>
              <div className="tutor-metric tutor-metric-progress">
                <div className="tutor-metric-label">总进度</div>
                <div className="tutor-metric-value" style={{ fontSize: 20 }}>
                  {groupProgressPercent}%
                </div>
                <div className="tutor-progress-track" aria-hidden="true">
                  <div className="tutor-progress-fill" style={{ width: `${groupProgressPercent}%` }} />
                </div>
              </div>
            </div>
            <div className="tutor-list">
              {groups.length === 0 ? (
                <EmptyBlock text="当前团队还没有小组，请先进入小组管理创建小组。" />
              ) : (
                groups.map((group) => {
                  const summary = getGroupProgressSummary(state, group.id);
                  const onlineCount = group.members.filter((member) => {
                    const student = state.students.find((item) => item.id === member.studentId);
                    return student?.online;
                  }).length;
                  return (
                    <div key={group.id} className="tutor-list-card">
                      <div className="tutor-section-head">
                        <div>
                          <div className="tutor-list-title">
                            {group.emblem} {group.name}
                          </div>
                          <div className="tutor-list-subtitle">
                            组人数 {group.members.length} / 在线 {onlineCount}
                          </div>
                        </div>
                        <Tag color="blue">{summary.score} 分</Tag>
                      </div>
                      <div className="tutor-progress-note">
                        <span>任务进度 {summary.progress}%</span>
                        <span>
                          已提交 {summary.submitted}/{summary.total}
                        </span>
                      </div>
                      <Progress percent={summary.progress} strokeColor="#2563eb" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )} 
      </SectionCard>

      <SectionCard
        title="TAB 工作列表区"
        note="学员列表、学员任务作品、小组任务作品"
        extra={
          currentTeam && (tab === 'studentWorks' || tab === 'groupWorks') ? (
            <Button
              disabled={batchSelection.length === 0}
              size="small"
              onClick={() => {
                const targetIds = selectedPendingAi.map((item) => item.id);
                if (targetIds.length === 0) {
                  messageApi.warning('当前选中的作品里没有 AI 可确认记录');
                  return;
                }
                actions.confirmAiScores(targetIds);
                messageApi.success(`已批量确认 ${targetIds.length} 条 AI 评分`);
                setBatchSelection([]);
              }}
            >
              批量确认 AI 分
            </Button>
          ) : undefined
        }
      >
        <Segmented
          block
          value={tab}
          options={[
            { label: '学员列表', value: 'students' },
            { label: '学员任务作品', value: 'studentWorks' },
            { label: '小组任务作品', value: 'groupWorks' },
          ]}
          onChange={(value) => setTab(value as 'students' | 'studentWorks' | 'groupWorks')}
        />
        <div style={{ marginTop: 12 }} className="tutor-list">
          {!currentTeam ? <EmptyBlock text="暂无当前团队" /> : null}
          {currentTeam && tab === 'students'
            ? students.slice(0, 4).map((student) => {
                const summary = getStudentProgressSummary(state, student.id);
                const evaluation = getStudentEvaluationSummary(state, student.id);
                return (
                  <div key={student.id} className="tutor-list-card">
                    <div className="tutor-section-head">
                      <div>
                        <div className="tutor-list-title">{student.name}</div>
                        <div className="tutor-list-subtitle">
                          {student.groupId ? getOwnerName(state, 'group', student.groupId) : '未分组'}
                        </div>
                      </div>
                      <Tag color={student.online ? 'green' : 'default'}>{student.online ? '在线' : '离线'}</Tag>
                    </div>
                    <div className="tutor-progress-note">
                      <span>已完成 {summary.completed}/{summary.total}</span>
                      <strong>{summary.score} 分</strong>
                    </div>
                    <Progress percent={summary.progress} strokeColor="#16a34a" />
                    <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                      <span className="tutor-pill">综合评级 {evaluation.grade}</span>
                      <span className="tutor-pill">家长 {student.parent.name}</span>
                    </div>
                    <div className="tutor-actions" style={{ marginTop: 12 }}>
                      <Button icon={<EyeOutlined />} onClick={() => setStudentDetailId(student.id)}>
                        任务详情
                      </Button>
                      <Button icon={<EnvironmentOutlined />} onClick={() => setLocationStudentId(student.id)}>
                        学员位置
                      </Button>
                      <Button onClick={() => setRewardTarget({ targetType: 'student', targetId: student.id })}>
                        奖惩分（{getRewardPenaltyTotal(state, 'student', student.id)}）
                      </Button>
                      <Button onClick={() => openEvaluation(student.id)}>导师评价</Button>
                    </div>
                  </div>
                );
              })
            : null}
          {currentTeam && tab === 'studentWorks'
            ? studentWorks.slice(0, 6).map((work) => {
                const task = state.tasks.find((item) => item.id === work.taskId);
                return (
                  <label key={work.id} className="tutor-list-card" style={{ cursor: 'pointer' }}>
                    <div className="tutor-section-head">
                      <div>
                        <div className="tutor-list-title">{task?.title ?? '未知任务'}</div>
                        <div className="tutor-list-subtitle">
                          {getOwnerName(state, 'student', work.ownerId)} · 学员任务作品
                        </div>
                      </div>
                      <input
                        checked={batchSelection.includes(work.id)}
                        type="checkbox"
                        onChange={(event) => {
                          setBatchSelection((current) =>
                            event.target.checked ? [...current, work.id] : current.filter((id) => id !== work.id),
                          );
                        }}
                      />
                    </div>
                    <div className="tutor-progress-note">
                      <span>提交时间 {formatDate(work.submittedAt)}</span>
                      <Tag color={formatWorkStatus(work.status).color}>{formatWorkStatus(work.status).label}</Tag>
                    </div>
                    <div className="tutor-kv-row">
                      <div>
                        <div className="tutor-kv-label">AI 分</div>
                        <div className="tutor-info-value">{work.aiScore ?? '-'}</div>
                      </div>
                      <div>
                        <div className="tutor-kv-label">导师分</div>
                        <div className="tutor-kv-value">{work.tutorScore ?? '-'}</div>
                      </div>
                    </div>
                    <div className="tutor-section-note" style={{ marginTop: 8 }}>
                      {work.preview}
                    </div>
                    <div className="tutor-actions" style={{ marginTop: 12 }}>
                      <Button icon={<EyeOutlined />} onClick={() => setDetailWorkId(work.id)}>
                        作品详情
                      </Button>
                      <Button icon={<EditOutlined />} onClick={() => setScoringWorkId(work.id)}>
                        评分
                      </Button>
                      {work.aiScore !== undefined ? (
                        <Button
                          icon={<CheckCircleOutlined />}
                          onClick={() => {
                            actions.confirmAiScores([work.id]);
                            messageApi.success('已确认该作品的 AI 分');
                            setBatchSelection((current) => current.filter((id) => id !== work.id));
                          }}
                        >
                          确认 AI 分
                        </Button>
                      ) : null}
                    </div>
                  </label>
                );
              })
            : null}
          {currentTeam && tab === 'groupWorks'
            ? groupWorks.slice(0, 6).map((work) => {
                const task = state.tasks.find((item) => item.id === work.taskId);
                return (
                  <label key={work.id} className="tutor-list-card" style={{ cursor: 'pointer' }}>
                    <div className="tutor-section-head">
                      <div>
                        <div className="tutor-list-title">{task?.title ?? '未知任务'}</div>
                        <div className="tutor-list-subtitle">
                          {getOwnerName(state, 'group', work.ownerId)} · 小组任务作品
                        </div>
                      </div>
                      <input
                        checked={batchSelection.includes(work.id)}
                        type="checkbox"
                        onChange={(event) => {
                          setBatchSelection((current) =>
                            event.target.checked ? [...current, work.id] : current.filter((id) => id !== work.id),
                          );
                        }}
                      />
                    </div>
                    <div className="tutor-progress-note">
                      <span>提交时间 {formatDate(work.submittedAt)}</span>
                      <Tag color={formatWorkStatus(work.status).color}>{formatWorkStatus(work.status).label}</Tag>
                    </div>
                    <div className="tutor-kv-row">
                      <div>
                        <div className="tutor-kv-label">AI 分</div>
                        <div className="tutor-info-value">{work.aiScore ?? '-'}</div>
                      </div>
                      <div>
                        <div className="tutor-kv-label">导师分</div>
                        <div className="tutor-kv-value">{work.tutorScore ?? '-'}</div>
                      </div>
                    </div>
                    <div className="tutor-section-note" style={{ marginTop: 8 }}>
                      {work.preview}
                    </div>
                    <div className="tutor-actions" style={{ marginTop: 12 }}>
                      <Button icon={<EyeOutlined />} onClick={() => setDetailWorkId(work.id)}>
                        作品详情
                      </Button>
                      <Button icon={<EditOutlined />} onClick={() => setScoringWorkId(work.id)}>
                        评分
                      </Button>
                      {work.aiScore !== undefined ? (
                        <Button
                          icon={<CheckCircleOutlined />}
                          onClick={() => {
                            actions.confirmAiScores([work.id]);
                            messageApi.success('已确认该作品的 AI 分');
                            setBatchSelection((current) => current.filter((id) => id !== work.id));
                          }}
                        >
                          确认 AI 分
                        </Button>
                      ) : null}
                    </div>
                  </label>
                );
              })
            : null}
          {currentTeam ? (
            <Link href={`/teams/${currentTeam.id}/works?tab=${tab === 'students' ? 'students' : tab === 'studentWorks' ? 'student-works' : 'group-works'}`}>
              <Button block>查看全部</Button>
            </Link>
          ) : null}
        </div>
      </SectionCard>

      <Modal
        open={Boolean(studentDetail)}
        title={studentDetail ? `${studentDetail.name} · 任务详情` : '学员详情'}
        onCancel={() => setStudentDetailId(null)}
        footer={null}
        width={420}
      >
        {studentDetail ? (
          <div className="tutor-stack">
            <div className="tutor-card tutor-card-soft">
              <div className="tutor-kv-row">
                <div>
                  <div className="tutor-kv-label">家长</div>
                  <div className="tutor-info-value">{studentDetail.parent.name}</div>
                </div>
                <div className="tutor-kv-value">{studentDetail.parent.phone}</div>
              </div>
              <div className="tutor-kv-row">
                <div>
                  <div className="tutor-kv-label">研学宝 ID</div>
                  <div className="tutor-info-value">{studentDetail.deviceId}</div>
                </div>
                <div className="tutor-kv-value">{studentDetail.online ? '在线' : '离线'}</div>
              </div>
            </div>
            {getWorksForOwner(state, 'student', studentDetail.id).map((work) => {
              const task = state.tasks.find((item) => item.id === work.taskId);
              return (
                <div key={work.id} className="tutor-list-card">
                  <div className="tutor-section-head">
                    <div>
                      <div className="tutor-list-title">{task?.title ?? '未知任务'}</div>
                      <div className="tutor-list-subtitle">
                        {task?.points ?? 0} 分 · {formatDate(work.submittedAt)}
                      </div>
                    </div>
                    <Tag color={formatWorkStatus(work.status).color}>{formatWorkStatus(work.status).label}</Tag>
                  </div>
                  <div className="tutor-progress-note">
                    <span>{work.preview}</span>
                    <strong>{work.finalScore ?? work.aiScore ?? '-'}</strong>
                  </div>
                  <Button style={{ marginTop: 10 }} onClick={() => setScoringWorkId(work.id)}>
                    评分该任务
                  </Button>
                </div>
              );
            })}
            {(() => {
              const location = getLocationForStudent(state, studentDetail.id);
              return location ? (
                <div className="tutor-card tutor-card-soft">
                  <div className="tutor-section-title">学员位置</div>
                  <div className="tutor-list-subtitle">{location.address}</div>
                  <div className="tutor-inline-list" style={{ marginTop: 8 }}>
                    <span className="tutor-pill">{location.distanceMeters} 米</span>
                    <span className="tutor-pill">更新于 {formatDate(location.updatedAt)}</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(locationStudent)}
        title={locationStudent ? `${locationStudent.name} · 学员位置` : '学员位置'}
        onCancel={() => setLocationStudentId(null)}
        footer={null}
        width={420}
      >
        {locationStudent ? (
          <div className="tutor-stack">
            {(() => {
              const location = getLocationForStudent(state, locationStudent.id);
              const track = getTrackForStudent(state, locationStudent.id);
              return (
                <>
                  <div className="tutor-card tutor-card-soft">
                    <div className="tutor-list-title">{location?.address ?? '暂无位置上报'}</div>
                    <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                      {location ? (
                        <>
                          <span className="tutor-pill">{location.distanceMeters} 米</span>
                          <span className="tutor-pill">更新于 {formatDate(location.updatedAt)}</span>
                          <span className="tutor-pill">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <div className="tutor-actions" style={{ marginTop: 12 }}>
                      <Button disabled={!location}>高德导航</Button>
                      <Button disabled={!location}>百度导航</Button>
                    </div>
                  </div>
                  <div className="tutor-list">
                    <div className="tutor-section-title">当日轨迹</div>
                    {track.length === 0 ? (
                      <EmptyBlock text="暂无当日轨迹" />
                    ) : (
                      track.map((point) => (
                        <div key={point.id} className="tutor-list-card">
                          <div className="tutor-list-title">{point.address}</div>
                          <div className="tutor-list-subtitle">
                            {formatDate(point.recordedAt)} · {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(detailWork)}
        title="作品详情"
        onCancel={() => setDetailWorkId(null)}
        footer={null}
        width={420}
      >
        {detailWork ? (
          <div className="tutor-stack">
            {(() => {
              const task = state.tasks.find((item) => item.id === detailWork.taskId);
              return (
                <>
                  <div className="tutor-card tutor-card-soft">
                    <div className="tutor-list-title">{task?.title ?? '未知任务'}</div>
                    <div className="tutor-list-subtitle">
                      {getOwnerName(state, detailWork.ownerType, detailWork.ownerId)} · {formatDate(detailWork.submittedAt)}
                    </div>
                    <div className="tutor-section-note" style={{ marginTop: 10 }}>
                      {detailWork.preview}
                    </div>
                  </div>
                  <MobileSummaryGrid
                    items={[
                      { label: 'AI 分', value: detailWork.aiScore ?? '-' },
                      { label: '导师分', value: detailWork.tutorScore ?? '-' },
                      { label: '最终分', value: detailWork.finalScore ?? '-' },
                      { label: '星级', value: detailWork.rating ?? '-' },
                    ]}
                  />
                  {task ? (
                    <div className="tutor-list">
                      <div className="tutor-section-title">作品要求</div>
                      {task.requirements.map((requirement) => (
                        <div key={requirement.id} className="tutor-list-card">
                          <Tag>{requirementTypeLabel(requirement.type)}</Tag>
                          <div className="tutor-section-note" style={{ marginTop: 8 }}>
                            {requirement.requirement}
                          </div>
                        </div>
                      ))}
                      <div className="tutor-section-title">参考资料</div>
                      {task.attachments.length === 0 ? (
                        <EmptyBlock text="暂无参考资料" />
                      ) : (
                        task.attachments.map((attachment) => (
                          <div key={attachment.id} className="tutor-list-card">
                            <div className="tutor-list-title">{attachment.name}</div>
                            {attachment.keyword ? <div className="tutor-list-subtitle">关键字：{attachment.keyword}</div> : null}
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                  {detailWork.comment ? (
                    <div className="tutor-card tutor-card-soft">
                      <div className="tutor-section-title">导师评语</div>
                      <div className="tutor-section-note" style={{ marginTop: 8 }}>
                        {detailWork.comment}
                      </div>
                    </div>
                  ) : null}
                  <Button type="primary" icon={<EditOutlined />} onClick={() => setScoringWorkId(detailWork.id)}>
                    进入评分
                  </Button>
                </>
              );
            })()}
          </div>
        ) : null}
      </Modal>

      <Modal
        forceRender
        open={Boolean(scoringWork)}
        title="任务评分"
        onCancel={() => setScoringWorkId(null)}
        onOk={() => scoreForm.submit()}
      >
        {scoringWork ? (
          <Form
            form={scoreForm}
            layout="vertical"
            initialValues={{
              rating: Number((scoringWork.rating ?? 4).toFixed(1)),
              comment: scoringWork.comment ?? '',
            }}
            onFinish={(values) => {
              actions.scoreWork(scoringWork.id, values);
              messageApi.success('评分已完成');
              setScoringWorkId(null);
            }}
          >
            <div className="tutor-card tutor-card-soft" style={{ marginBottom: 12 }}>
              <div className="tutor-list-title">
                {state.tasks.find((item) => item.id === scoringWork.taskId)?.title}
              </div>
              <div className="tutor-list-subtitle">{scoringWork.preview}</div>
              <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                <span className="tutor-pill">AI 分：{scoringWork.aiScore ?? '-'}</span>
                <span className="tutor-pill">当前导师分：{scoringWork.tutorScore ?? '-'}</span>
              </div>
              <Button size="small" style={{ marginTop: 10 }} onClick={() => setDetailWorkId(scoringWork.id)}>
                查看作品详情
              </Button>
            </div>
            <Form.Item name="rating" label="星级评分">
              <Rate allowHalf />
            </Form.Item>
            <Form.Item name="comment" label="导师评语">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        ) : null}
      </Modal>

      <RewardPenaltyModal
        open={Boolean(rewardTarget)}
        title={rewardTarget ? `${rewardTarget.targetType === 'student' ? '学员' : '小组'}奖惩分` : '奖惩分'}
        total={rewardTarget ? getRewardPenaltyTotal(state, rewardTarget.targetType, rewardTarget.targetId) : 0}
        records={
          rewardTarget
            ? state.rewardPenaltyRecords.filter(
                (record) => record.targetType === rewardTarget.targetType && record.targetId === rewardTarget.targetId,
              )
            : []
        }
        onCancel={() => setRewardTarget(null)}
        onSubmit={(values) => {
          if (!currentTeam || !rewardTarget) return;
          actions.addRewardPenalty({
            teamId: currentTeam.id,
            targetType: rewardTarget.targetType,
            targetId: rewardTarget.targetId,
            kind: values.kind,
            points: values.points,
            reason: values.reason,
          });
          messageApi.success(`${scoreKindLabel(values.kind)}已记录`);
          setRewardTarget(null);
        }}
      />

      <Modal
        open={Boolean(evaluationStudentId)}
        title="导师评价与综合评级"
        onCancel={() => setEvaluationStudentId(null)}
        onOk={() => {
          if (!evaluationStudentId) return;
          actions.updateEvaluation(evaluationStudentId, evaluationDraft, evaluationComment);
          messageApi.success('导师评价已保存');
          setEvaluationStudentId(null);
        }}
      >
        <div className="tutor-stack">
          {state.evaluationItems.map((item, index) => (
            <div key={item.id} className="tutor-list-card">
              <div className="tutor-list-title">{item.indicator}</div>
              <div className="tutor-list-subtitle">
                {item.dimension} · {item.description}
              </div>
              <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                <span className="tutor-pill">
                  自评：
                  {item.allowSelf
                    ? evaluationDraft[index]?.selfRating
                      ? `${evaluationDraft[index].selfRating} 星`
                      : '未自评'
                    : '无自评'}
                </span>
                <span className="tutor-pill">
                  互评：
                  {item.allowGroup
                    ? evaluationDraft[index]?.groupRating
                      ? `${evaluationDraft[index].groupRating} 星`
                      : '未互评'
                    : '无互评'}
                </span>
              </div>
              <Rate
                allowHalf
                style={{ marginTop: 10 }}
                value={evaluationDraft[index]?.tutorRating ?? 0}
                onChange={(value) =>
                  setEvaluationDraft((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, tutorRating: value } : entry,
                    ),
                  )
                }
              />
            </div>
          ))}
          <Input.TextArea
            rows={3}
            value={evaluationComment}
            onChange={(event) => setEvaluationComment(event.target.value)}
            placeholder="请输入导师综合评价"
          />
        </div>
      </Modal>

      <Modal
        open={qrOpen}
        title="团队二维码与加入码"
        onCancel={() => setQrOpen(false)}
        footer={null}
      >
        {currentTeam ? (
          <div className="tutor-stack">
            <div className="tutor-card tutor-card-soft" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 180,
                  height: 180,
                  margin: '0 auto 16px',
                  borderRadius: 8,
                  background:
                    'linear-gradient(90deg, #0f766e 0%, #0f766e 8%, #ffffff 8%, #ffffff 16%, #0f766e 16%, #0f766e 24%, #ffffff 24%, #ffffff 32%, #0f766e 32%, #0f766e 40%, #ffffff 40%, #ffffff 48%, #0f766e 48%, #0f766e 56%, #ffffff 56%, #ffffff 64%, #0f766e 64%, #0f766e 72%, #ffffff 72%, #ffffff 80%, #0f766e 80%, #0f766e 88%, #ffffff 88%, #ffffff 100%)',
                }}
              />
              <div className="tutor-list-title">{currentTeam.joinCode}</div>
              <div className="tutor-list-subtitle">团队加入码</div>
            </div>
            <Button
              block
              icon={<CheckCircleOutlined />}
              onClick={() => {
                messageApi.success('已保存团队二维码');
                setQrOpen(false);
              }}
            >
              保存到相册
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function TeamDetailPageContent({ teamId }: { teamId?: string }) {
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [editorOpen, setEditorOpen] = useState(false);
  const currentTeam = getCurrentTeam(state);
  const { team, students, groups } = buildTeamContext(state, teamId);
  const reportTemplate = team ? state.reportTemplates.find((template) => template.id === team.reportTemplateId) : null;

  if (!team) {
    return (
      <div className="tutor-page">
        {contextHolder}
        <SectionCard title="团队详情" note="当前没有可查看的研学团队">
          <EmptyBlock text={teamId ? '未找到该研学团队。' : '请先切换团队后，再查看团队详情。'} />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard
        title={team.name}
        note={`${formatSource(team.source)} · ${team.organizationName}`}
        extra={
          <Button icon={<EditOutlined />} size="small" onClick={() => setEditorOpen(true)}>
            编辑团队
          </Button>
        }
      >
        <div className="tutor-stack">
          <MobileSummaryGrid
            items={[
              { label: '出发日期', value: team.startDate },
              { label: '研学天数', value: `${team.days} 天` },
              { label: '团队人数/最大人数', value: `${students.length}/${team.maxStudents}` },
              { label: '小组数', value: groups.length },
              { label: '团队状态', value: formatTeamStatus(team.status).label },
              { label: '评价方式', value: evaluationModeLabel(team.evaluationMode) },
            ]}
          />
          <div className="tutor-info-grid">
            <div>
              <div className="tutor-info-label">目的地</div>
              <div className="tutor-info-value">{team.destination}</div>
            </div>
            <div>
              <div className="tutor-info-label">学员来源</div>
              <div className="tutor-info-value">{team.studentSource || '未填写'}</div>
            </div>
            <div>
              <div className="tutor-info-label">研学报告模版</div>
              <div className="tutor-info-value">{reportTemplate?.name ?? '未设置'}</div>
            </div>
            <div>
              <div className="tutor-info-label">加入授权码</div>
              <div className="tutor-info-value">{team.joinCode}</div>
            </div>
          </div>
          <div className="tutor-inline-list">
            {team.id === currentTeam?.id ? <span className="tutor-pill tutor-tag-success">当前团队</span> : null}
            {team.bases.map((base) => (
              <span key={base} className="tutor-pill">
                {base}
              </span>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="团队状态与招生" note="招募、名单导入、出行授权码等现场准备入口">
        <div className="tutor-list">
          <div className="tutor-list-card">
            <div className="tutor-list-title">创建中</div>
            <div className="tutor-list-subtitle">仅导师可见，用于设置团队参数、研学任务和评价表。</div>
          </div>
          <div className="tutor-list-card">
            <div className="tutor-list-title">招募中 & 名单导入</div>
            <div className="tutor-list-subtitle">支持在线报名缴费、团队二维码报名、Excel 名单导入和常用班级添加。</div>
          </div>
          <div className="tutor-list-card">
            <div className="tutor-section-head">
              <div>
                <div className="tutor-list-title">待出行 & 授权码</div>
                <div className="tutor-list-subtitle">出行计划确定后，可导出团队授权码表格供租赁设备登录。</div>
              </div>
              <Button size="small" onClick={() => messageApi.success('已生成授权码导出任务（原型）')}>
                导出授权码
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="团队管理" note="进入学生、小组、助理和资料管理">
        <div className="tutor-entry-grid">
          <Link href={`/teams/${team.id}/students`} className="tutor-entry-card">
            <div className="tutor-list-title">学生管理</div>
            <div className="tutor-list-subtitle">{students.length} 名学员</div>
          </Link>
          <Link href={`/teams/${team.id}/groups`} className="tutor-entry-card">
            <div className="tutor-list-title">小组管理</div>
            <div className="tutor-list-subtitle">{groups.length} 个小组</div>
          </Link>
          <Link href={`/teams/${team.id}/assistants`} className="tutor-entry-card">
            <div className="tutor-list-title">助理管理</div>
            <div className="tutor-list-subtitle">{team.assistants.length} 名助理</div>
          </Link>
          <Link href={`/teams/${team.id}/materials`} className="tutor-entry-card">
            <div className="tutor-list-title">资料管理</div>
            <div className="tutor-list-subtitle">{team.materials.length} 份资料</div>
          </Link>
          <Link href="/reports" className="tutor-entry-card">
            <div className="tutor-list-title">报告模版</div>
            <div className="tutor-list-subtitle">{reportTemplate?.name ?? '选择团队报告模版'}</div>
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="任务作品" note="统一进入该团队的学员列表与任务作品查看">
        <div className="tutor-entry-grid">
          <Link href={`/teams/${team.id}/works?tab=students`} className="tutor-entry-card" style={{ gridColumn: '1 / -1' }}>
            <div className="tutor-list-title">任务作品</div>
            <div className="tutor-list-subtitle">进入后可切换查看学员列表、学员任务作品、小组任务作品</div>
          </Link>
        </div>
      </SectionCard>

      <TeamEditorModal
        open={editorOpen}
        team={team}
        onCancel={() => setEditorOpen(false)}
        onSubmit={(values) => {
          actions.saveTeam(values, team.id);
          messageApi.success('团队已更新');
          setEditorOpen(false);
        }}
      />
    </div>
  );
}

export function TeamSwitchPageContent() {
  const router = useRouter();
  const { state, actions } = useTutorStore();
  const currentTeam = getCurrentTeam(state);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedTeamId, setSelectedTeamId] = useState(currentTeam?.id ?? state.teams[0]?.id ?? '');

  const teamList = [...state.teams].sort((left, right) => left.startDate.localeCompare(right.startDate) * -1);

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard title="研学团队列表" note="选择一个团队后点击确定，切换回工作台">
        <div className="tutor-list">
          {teamList.map((team) => {
            const students = getStudentsByTeam(state, team.id);
            const selected = selectedTeamId === team.id;
            return (
              <button
                key={team.id}
                type="button"
                className={`tutor-list-card tutor-card-clickable tutor-select-card${selected ? ' active' : ''}`}
                onClick={() => setSelectedTeamId(team.id)}
              >
                <div className="tutor-section-head">
                  <div>
                    <div className="tutor-list-title">{team.name}</div>
                    <div className="tutor-list-subtitle">
                      {team.startDate} · {team.destination}
                    </div>
                  </div>
                  <Tag color={formatTeamStatus(team.status).color}>{formatTeamStatus(team.status).label}</Tag>
                </div>
                <div className="tutor-progress-note">
                  <span>{team.organizationName}</span>
                  <span>{students.length} 名学员</span>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <div className="tutor-sticky-footer">
        <Button
          block
          type="primary"
          disabled={!selectedTeamId}
          onClick={() => {
            if (!selectedTeamId) return;
            actions.setCurrentTeam(selectedTeamId);
            messageApi.success('已切换团队');
            router.replace('/dashboard');
          }}
        >
          确定
        </Button>
      </div>
    </div>
  );
}

export function TeamsPageContent() {
  const router = useRouter();
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [keyword, setKeyword] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | TeamSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TeamStatus>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name'>('date_desc');
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const currentTeam = getCurrentTeam(state);

  const filteredTeams = useMemo(() => {
    const list = [...state.teams].filter((team) => {
      if (keyword && !team.name.includes(keyword)) return false;
      if (sourceFilter !== 'all' && team.source !== sourceFilter) return false;
      if (statusFilter !== 'all' && team.status !== statusFilter) return false;
      return true;
    });

    if (sortBy === 'date_desc') {
      list.sort((left, right) => right.startDate.localeCompare(left.startDate));
    } else if (sortBy === 'date_asc') {
      list.sort((left, right) => left.startDate.localeCompare(right.startDate));
    } else {
      list.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));
    }

    return list;
  }, [keyword, sortBy, sourceFilter, state.teams, statusFilter]);

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard
        title="筛选与排序"
        note="支持按团队类型、名称、状态和出发日期筛选"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setTeamModalOpen(true)}>
            新建团队
          </Button>
        }
      >
        <div className="tutor-stack">
          <Input placeholder="搜索团队名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          <div className="tutor-metric-grid">
            <Select
              value={sourceFilter}
              onChange={(value) => setSourceFilter(value as 'all' | TeamSource)}
              options={[{ label: '全部类型', value: 'all' }, ...teamSourceOptions()]}
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as 'all' | TeamStatus)}
              options={[{ label: '全部状态', value: 'all' }, ...teamStatusOptions()]}
            />
          </div>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value as 'date_desc' | 'date_asc' | 'name')}
            options={[
              { label: '按出发日期倒序', value: 'date_desc' },
              { label: '按出发日期正序', value: 'date_asc' },
              { label: '按团队名称排序', value: 'name' },
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="团队列表" note={`当前共有 ${filteredTeams.length} 个团队`}>
        {filteredTeams.length === 0 ? (
          <EmptyBlock text="暂无符合条件的团队" />
        ) : (
          <div className="tutor-list">
            {filteredTeams.map((team) => {
              const students = getStudentsByTeam(state, team.id);
              const groups = getGroupsByTeam(state, team.id);
              const statusMeta = formatTeamStatus(team.status);
              return (
                <button
                  key={team.id}
                  type="button"
                  className="tutor-list-card tutor-select-card tutor-card-clickable"
                  onClick={() => router.push(`/teams/${team.id}`)}
                >
                  <div className="tutor-section-head">
                    <div>
                      <div className="tutor-list-title">{team.name}</div>
                      <div className="tutor-list-subtitle">
                        {team.organizationName} · {formatSource(team.source)}
                      </div>
                    </div>
                    <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
                  </div>
                  <div className="tutor-info-grid">
                    <div>
                      <div className="tutor-info-label">出发日期</div>
                      <div className="tutor-info-value">{team.startDate}</div>
                    </div>
                    <div>
                      <div className="tutor-info-label">研学天数</div>
                      <div className="tutor-info-value">{team.days} 天</div>
                    </div>
                    <div>
                      <div className="tutor-info-label">目的地</div>
                      <div className="tutor-info-value">{team.destination}</div>
                    </div>
                    <div>
                      <div className="tutor-info-label">团队人数 / 最大人数</div>
                      <div className="tutor-info-value">
                        {students.length}/{team.maxStudents}
                      </div>
                    </div>
                    <div>
                      <div className="tutor-info-label">小组数</div>
                      <div className="tutor-info-value">{groups.length}</div>
                    </div>
                  </div>
                  <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                    {team.id === currentTeam?.id ? <span className="tutor-pill tutor-tag-success">当前团队</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      <TeamEditorModal
        open={teamModalOpen}
        onCancel={() => setTeamModalOpen(false)}
        onSubmit={(values) => {
          actions.saveTeam(values);
          messageApi.success('团队已创建');
          setTeamModalOpen(false);
        }}
      />
    </div>
  );
}

export function GroupsPageContent({ teamId }: { teamId?: string }) {
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const { team, students, groups } = buildTeamContext(state, teamId);
  const [count, setCount] = useState(1);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingEmblem, setEditingEmblem] = useState('星');
  const [assignGroupId, setAssignGroupId] = useState<string | null>(null);
  const [assignStudentId, setAssignStudentId] = useState<string | undefined>();
  const [assignRole, setAssignRole] = useState<GroupRole>('leader');
  const [customRole, setCustomRole] = useState('');

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard title="小组列表" note={team ? `当前共有 ${groups.length} 个小组` : '当前没有可查看的团队'}>
        {!team ? (
          <EmptyBlock text={teamId ? '未找到该团队，无法查看小组。' : '请先在团队管理中选择当前团队。'} />
        ) : groups.length === 0 ? (
          <EmptyBlock text="当前团队还没有小组，可先新增小组。" />
        ) : (
          <div className="tutor-list">
            {groups.map((group) => (
              <div key={group.id} className="tutor-list-card">
                <div className="tutor-section-head">
                  <div>
                    <div className="tutor-list-title">
                      {group.emblem} {group.name}
                    </div>
                    <div className="tutor-list-subtitle">{group.members.length} 人</div>
                  </div>
                  <Tag color="blue">{computeGroupTotalScore(state, group.id)} 分</Tag>
                </div>
                {group.members.length > 0 ? (
                  <div className="tutor-inline-list">
                    {group.members.map((member) => (
                      <span key={member.studentId} className="tutor-pill">
                        {getOwnerName(state, 'student', member.studentId)} · {groupRoleLabel(member.role)}
                        {member.role === 'custom' && member.customRole ? `：${member.customRole}` : ''}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="tutor-section-note">暂无组员，建议先把学员加入小组并设置岗位。</div>
                )}
                <div className="tutor-actions" style={{ marginTop: 12 }}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingGroupId(group.id);
                      setEditingName(group.name);
                      setEditingEmblem(group.emblem);
                    }}
                  >
                    编辑队名队徽
                  </Button>
                  <Button
                    icon={<TeamOutlined />}
                    onClick={() => {
                      setAssignGroupId(group.id);
                      setAssignStudentId(undefined);
                      setAssignRole('leader');
                      setCustomRole('');
                    }}
                  >
                    配置成员岗位
                  </Button>
                  {group.members.length === 0 ? (
                    <Button
                      danger
                      onClick={() => {
                        actions.deleteEmptyGroup(group.id);
                        messageApi.success('已删除空小组');
                      }}
                    >
                      删除小组
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="未分组学员" note="可优先将未分组学员加入对应小组">
        {students.filter((student) => !student.groupId).length === 0 ? (
          <EmptyBlock text="当前团队学员已全部分组。" />
        ) : (
          <div className="tutor-inline-list">
            {students
              .filter((student) => !student.groupId)
              .map((student) => (
                <span key={student.id} className="tutor-pill">
                  {student.name}
                </span>
              ))}
          </div>
        )}
      </SectionCard>

      <div className="tutor-sticky-footer">
        <Button block type="primary" icon={<PlusOutlined />} disabled={!team} onClick={() => setCreatorOpen(true)}>
          新增小组
        </Button>
      </div>

      <Modal
        open={creatorOpen}
        title="新增小组"
        onCancel={() => setCreatorOpen(false)}
        onOk={() => {
          if (!team) return;
          actions.createGroups(team.id, count);
          messageApi.success(`已创建 ${count} 个小组`);
          setCreatorOpen(false);
        }}
      >
        <div className="tutor-stack">
          <div className="tutor-section-note">输入需要新增的小组数量，系统会批量创建。</div>
          <InputNumber min={1} max={8} style={{ width: '100%' }} value={count} onChange={(value) => setCount(value ?? 1)} />
        </div>
      </Modal>

      <Modal
        open={Boolean(editingGroupId)}
        title="编辑队名与队徽"
        onCancel={() => setEditingGroupId(null)}
        onOk={() => {
          if (!editingGroupId) return;
          actions.updateGroup(editingGroupId, { name: editingName, emblem: editingEmblem });
          setEditingGroupId(null);
        }}
      >
        <div className="tutor-stack">
          <Input value={editingName} onChange={(event) => setEditingName(event.target.value)} placeholder="小组名称" />
          <Input value={editingEmblem} onChange={(event) => setEditingEmblem(event.target.value)} placeholder="队徽字符，如：鲸、浪、星" />
        </div>
      </Modal>

      <Modal
        open={Boolean(assignGroupId)}
        title="配置成员岗位"
        onCancel={() => setAssignGroupId(null)}
        onOk={() => {
          if (!team || !assignGroupId || !assignStudentId) return;
          actions.assignStudentToGroup(team.id, assignStudentId, assignGroupId, assignRole, customRole);
          messageApi.success('成员岗位已更新');
          setAssignGroupId(null);
        }}
      >
        <div className="tutor-stack">
          <Select
            placeholder="选择学员"
            value={assignStudentId}
            onChange={setAssignStudentId}
            options={students.map((student) => ({
              label: `${student.name}${student.groupId ? ` · 当前在 ${getOwnerName(state, 'group', student.groupId)}` : ''}`,
              value: student.id,
            }))}
          />
          <Select
            value={assignRole}
            onChange={(value) => setAssignRole(value)}
            options={[
              { label: '组长', value: 'leader' },
              { label: '副组长', value: 'vice_leader' },
              { label: '记录员', value: 'recorder' },
              { label: '研究员', value: 'researcher' },
              { label: '操作员', value: 'operator' },
              { label: '安全员', value: 'safety' },
              { label: '汇报员', value: 'reporter' },
              { label: '摄影师', value: 'photographer' },
              { label: '自定义岗位', value: 'custom' },
            ]}
          />
          {assignRole === 'custom' ? (
            <Input value={customRole} onChange={(event) => setCustomRole(event.target.value)} placeholder="请输入自定义岗位名称" />
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

export function TeamStudentsPageContent({ teamId }: { teamId: string }) {
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const { team, students } = buildTeamContext(state, teamId);
  const [actionOpen, setActionOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [selectedCommonClassId, setSelectedCommonClassId] = useState(state.commonClasses[0]?.id ?? '');
  const [selectedCommonStudentIds, setSelectedCommonStudentIds] = useState<string[]>([]);
  const selectedCommonClass = state.commonClasses.find((item) => item.id === selectedCommonClassId) ?? null;

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard title="学员列表" note={team ? `当前共有 ${students.length} 名学员` : '当前没有可查看的团队'}>
        {!team ? (
          <EmptyBlock text="未找到该团队，无法查看学员。" />
        ) : students.length === 0 ? (
          <EmptyBlock text="当前团队暂无学员，可先添加学员或导入学生名单。" />
        ) : (
          <div className="tutor-list">
            {students.map((student) => (
              <div key={student.id} className="tutor-list-card">
                <div className="tutor-section-head">
                  <div>
                    <div className="tutor-list-title">{student.name}</div>
                    <div className="tutor-list-subtitle">
                      {student.groupId ? getOwnerName(state, 'group', student.groupId) : '未分组'}
                    </div>
                  </div>
                  <Tag color={student.joined ? 'green' : 'default'}>{student.joined ? '已加入' : '未加入'}</Tag>
                </div>
                <div className="tutor-info-grid">
                  <div>
                    <div className="tutor-info-label">年龄</div>
                    <div className="tutor-info-value">{student.age} 岁</div>
                  </div>
                  <div>
                    <div className="tutor-info-label">学生证件号</div>
                    <div className="tutor-info-value">{student.idNumber}</div>
                  </div>
                  <div>
                    <div className="tutor-info-label">家长</div>
                    <div className="tutor-info-value">{student.parent.name}</div>
                  </div>
                  <div>
                    <div className="tutor-info-label">家长手机号</div>
                    <div className="tutor-info-value">{student.parent.phone}</div>
                  </div>
                  <div>
                    <div className="tutor-info-label">在线状态</div>
                    <div className="tutor-info-value">{student.online ? '在线' : '离线'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="tutor-sticky-footer">
        <Button block type="primary" icon={<PlusOutlined />} disabled={!team} onClick={() => setActionOpen(true)}>
          添加学员
        </Button>
      </div>

      <Modal open={actionOpen} title="添加学员" onCancel={() => setActionOpen(false)} footer={null}>
        <div className="tutor-actions" style={{ flexDirection: 'column' }}>
          <Button
            block
            type="primary"
            onClick={() => {
              setActionOpen(false);
              setCreateOpen(true);
            }}
          >
            手动添加学员
          </Button>
          <Button
            block
            onClick={() => {
              setActionOpen(false);
              setImportOpen(true);
            }}
          >
            表格导入
          </Button>
          <Button
            block
            onClick={() => {
              setActionOpen(false);
              setClassOpen(true);
              setSelectedCommonStudentIds([]);
            }}
          >
            从常用班级添加
          </Button>
        </div>
      </Modal>

      <StudentEditorModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onSubmit={(values) => {
          actions.addStudent({ teamId, ...values });
          messageApi.success('学员已添加');
          setCreateOpen(false);
        }}
      />

      <StudentImportModal
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onSubmit={(rawText) => {
          const result = actions.importStudents({ teamId, rawText });
          messageApi.success(`已导入 ${result.added} 名学员`);
          setImportOpen(false);
        }}
      />

      <Modal
        open={classOpen}
        title="从常用班级添加"
        onCancel={() => setClassOpen(false)}
        onOk={() => {
          if (!selectedCommonClassId || selectedCommonStudentIds.length === 0) return;
          const result = actions.addStudentsFromCommonClass(teamId, selectedCommonClassId, selectedCommonStudentIds);
          messageApi.success(`已从常用班级添加 ${result.added} 名学员`);
          setClassOpen(false);
        }}
        okText="添加所选"
      >
        <div className="tutor-stack">
          <Select
            value={selectedCommonClassId}
            onChange={(value) => {
              setSelectedCommonClassId(value);
              setSelectedCommonStudentIds([]);
            }}
            options={state.commonClasses.map((item) => ({
              label: `${item.organizationName} · ${item.name}`,
              value: item.id,
            }))}
          />
          {selectedCommonClass ? (
            <div className="tutor-list">
              <Button
                onClick={() => setSelectedCommonStudentIds(selectedCommonClass.students.map((student) => student.id))}
              >
                全选班级学生
              </Button>
              {selectedCommonClass.students.map((student) => (
                <label key={student.id} className="tutor-list-card" style={{ cursor: 'pointer' }}>
                  <div className="tutor-section-head">
                    <div>
                      <div className="tutor-list-title">{student.name}</div>
                      <div className="tutor-list-subtitle">
                        {student.idNumber} · {student.parentName} {student.parentPhone}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedCommonStudentIds.includes(student.id)}
                      onChange={(event) =>
                        setSelectedCommonStudentIds((current) =>
                          event.target.checked ? [...current, student.id] : current.filter((id) => id !== student.id),
                        )
                      }
                    />
                  </div>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

export function TeamAssistantsPageContent({ teamId }: { teamId: string }) {
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const team = getTeamById(state, teamId);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard title="助理列表" note={team ? `当前共有 ${team.assistants.length} 名助理` : '当前没有可查看的团队'}>
        {!team ? (
          <EmptyBlock text="未找到该团队，无法查看助理列表。" />
        ) : team.assistants.length === 0 ? (
          <EmptyBlock text="当前团队暂无助理老师，可先添加助理。" />
        ) : (
          <div className="tutor-list">
            {team.assistants.map((assistant) => (
              <div key={assistant.id} className="tutor-kv-row tutor-card">
                <div>
                  <div className="tutor-kv-label">助理老师</div>
                  <div className="tutor-info-value">{assistant.name}</div>
                </div>
                <Space direction="vertical" style={{ alignItems: 'flex-end' }}>
                  <div className="tutor-kv-value">{assistant.phone}</div>
                  <Button danger size="small" onClick={() => actions.removeAssistant(teamId, assistant.id)}>
                    删除
                  </Button>
                </Space>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="tutor-sticky-footer">
        <Button block type="primary" icon={<PlusOutlined />} disabled={!team} onClick={() => setCreateOpen(true)}>
          添加助理
        </Button>
      </div>

      <AssistantEditorModal
        open={createOpen}
        title="添加助理"
        onCancel={() => setCreateOpen(false)}
        onSubmit={(values) => {
          actions.addAssistant(teamId, values);
          messageApi.success('助理已添加');
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

export function TeamMaterialsPageContent({ teamId }: { teamId: string }) {
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const team = getTeamById(state, teamId);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard title="资料列表" note={team ? `当前共有 ${team.materials.length} 份资料` : '当前没有可查看的团队'}>
        {!team ? (
          <EmptyBlock text="未找到该团队，无法查看资料。" />
        ) : team.materials.length === 0 ? (
          <EmptyBlock text="当前团队暂无资料，可先添加资料。" />
        ) : (
          <div className="tutor-list">
            {team.materials.map((material) => (
              <div key={material.id} className="tutor-list-card">
                <div className="tutor-section-head">
                  <div>
                    <div className="tutor-list-title">{material.name}</div>
                    <div className="tutor-list-subtitle">{material.description}</div>
                  </div>
                  <Button danger size="small" onClick={() => actions.removeMaterial(teamId, material.id)}>
                    删除
                  </Button>
                </div>
                <div className="tutor-section-note">{material.url}</div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="tutor-sticky-footer">
        <Button block type="primary" icon={<PlusOutlined />} disabled={!team} onClick={() => setCreateOpen(true)}>
          添加资料
        </Button>
      </div>

      <MaterialEditorModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onSubmit={(values) => {
          actions.addMaterial(teamId, values);
          messageApi.success('资料已添加');
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

export function TeamWorksPageContent({ teamId }: { teamId: string }) {
  return <WorksPageContent teamId={teamId} />;
}

export function TasksPageContent() {
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const currentTeam = getCurrentTeam(state);
  const [scope, setScope] = useState<TaskScope>('student');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySource, setCopySource] = useState<'history' | 'library' | 'ai'>('history');
  const [sourceTeamId, setSourceTeamId] = useState('team_history');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskKeyword, setTaskKeyword] = useState('');
  const [taskCity, setTaskCity] = useState('深圳');
  const [taskObjective, setTaskObjective] = useState('观察海洋生物，形成事实记录与表达');
  const tasks = currentTeam ? getTasksByTeam(state, currentTeam.id, scope) : [];
  const historyTeams = state.teams.filter((team) => team.status === 'ended');
  const editingTask = currentTeam ? state.tasks.find((task) => task.id === editingTaskId) : null;

  const copyCandidates =
    copySource === 'history'
      ? state.tasks.filter((task) => task.teamId === sourceTeamId && task.scope === scope)
      : state.taskTemplates.filter(
          (template) =>
            template.scope === scope &&
            (!taskKeyword ||
              template.title.includes(taskKeyword) ||
              template.base.includes(taskKeyword) ||
              template.abilityTags.some((tag) => tag.includes(taskKeyword))),
        );

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard
        title="任务类型切换"
        note="分别管理学员任务和小组任务"
        extra={
          <Space>
            <Button icon={<CopyOutlined />} onClick={() => setCopyOpen(true)} disabled={!currentTeam}>
              任务库 / AI
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!currentTeam}
              onClick={() => {
                setEditingTaskId(null);
                setEditorOpen(true);
              }}
            >
              新建任务
            </Button>
          </Space>
        }
      >
        <Segmented
          block
          value={scope}
          options={[
            { label: '学员任务', value: 'student' },
            { label: '小组任务', value: 'group' },
          ]}
          onChange={(value) => setScope(value as TaskScope)}
        />
      </SectionCard>

      <SectionCard title={`${taskScopeLabel(scope)}列表`} note={`当前共有 ${tasks.length} 个任务`}>
        {!currentTeam ? (
          <EmptyBlock text="请先设置当前团队后再创建任务。" />
        ) : tasks.length === 0 ? (
          <EmptyBlock text={`当前团队暂无${taskScopeLabel(scope)}，可手动新建或从历史/任务库复制。`} />
        ) : (
          <div className="tutor-list">
            {tasks.map((task) => (
              <div key={task.id} className="tutor-list-card">
                <div className="tutor-section-head">
                  <div>
                    <div className="tutor-list-title">
                      {task.order}. {task.title}
                    </div>
                    <div className="tutor-list-subtitle">
                      {task.taskType} · {task.base} · {task.points} 分
                    </div>
                  </div>
                  <Tag color={formatTaskStatus(task.status).color}>{formatTaskStatus(task.status).label}</Tag>
                </div>
                <div className="tutor-section-note">{task.description}</div>
                <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                  {task.abilityTags.map((tag) => (
                    <span key={tag} className="tutor-pill">
                      能力：{tag}
                    </span>
                  ))}
                  {task.subjects.map((subject) => (
                    <span key={subject} className="tutor-pill">
                      学科：{subject}
                    </span>
                  ))}
                  {task.requirements.map((requirement) => (
                    <span key={requirement.id} className="tutor-pill">
                      {requirementTypeLabel(requirement.type)} · {requirement.requirement}
                    </span>
                  ))}
                </div>
                <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                  {task.attachments.map((attachment) => (
                    <span key={attachment.id} className="tutor-pill">
                      {attachment.kind === 'pdf' ? <FilePdfOutlined /> : attachment.kind === 'image' ? <FileImageOutlined /> : <FileTextOutlined />} {attachment.name}
                      {attachment.keyword ? ` · ${attachment.keyword}` : ''}
                    </span>
                  ))}
                  <span className="tutor-pill">来源：{task.source === 'manual' ? '手动创建' : task.source === 'history' ? '历史复制' : task.source === 'ai' ? 'AI 创建' : '任务库'}</span>
                </div>
                <div className="tutor-actions" style={{ marginTop: 12 }}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setEditorOpen(true);
                    }}
                  >
                    编辑
                  </Button>
                  <Button onClick={() => actions.reorderTask(task.id, 'up')}>上移</Button>
                  <Button onClick={() => actions.reorderTask(task.id, 'down')}>下移</Button>
                  <Button onClick={() => actions.reorderTask(task.id, 'top')}>置顶</Button>
                  <Button onClick={() => actions.reorderTask(task.id, 'bottom')}>置底</Button>
                  {task.status === 'ai_created' ? (
                    <Button type="primary" onClick={() => actions.updateTaskStatus(task.id, 'pending_publish')}>
                      审核通过
                    </Button>
                  ) : null}
                  {(task.status === 'pending_publish' || task.status === 'withdrawn') ? (
                    <Button type="primary" onClick={() => actions.updateTaskStatus(task.id, 'published')}>
                      下发
                    </Button>
                  ) : null}
                  {task.status === 'published' ? (
                    <Button danger onClick={() => actions.updateTaskStatus(task.id, 'withdrawn')}>
                      撤回
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="评价表设置" note="可用常见评价模版、历史团队或表格导入快速生成项目评价表">
        <div className="tutor-stack">
          <div className="tutor-actions">
            <Button onClick={() => messageApi.success('已选择常见评价模版（原型）')}>选择评价模版</Button>
            <Button onClick={() => messageApi.success('已从历史团队复制评价表（原型）')}>从历史团队导入</Button>
            <Button onClick={() => messageApi.success('已下载导入表格模版（原型）')}>表格导入</Button>
          </div>
          <div className="tutor-inline-list">
            {state.evaluationItems.map((item) => (
              <span key={item.id} className="tutor-pill">
                {item.dimension} · {item.indicator}
              </span>
            ))}
          </div>
        </div>
      </SectionCard>

      <TaskEditor
        open={editorOpen}
        initialValue={
          editingTask
            ? {
                id: editingTask.id,
                scope: editingTask.scope,
                source: editingTask.source,
                base: editingTask.base,
                taskType: editingTask.taskType,
                title: editingTask.title,
                points: editingTask.points,
                description: editingTask.description,
                abilityTags: editingTask.abilityTags,
                subjects: editingTask.subjects,
                attachments: editingTask.attachments,
                requirements: editingTask.requirements,
                status: editingTask.status,
              }
            : {
                scope,
                source: 'manual',
                base: currentTeam?.bases[0] ?? '深圳海洋馆',
                taskType: scope === 'student' ? '观察记录' : '创作任务',
                title: '',
                points: 20,
                description: '',
                abilityTags: ['观察力', '表达力'],
                subjects: ['科学', '语文'],
                attachments: [],
                requirements: [{ id: 'req_new', type: 'text', requirement: '完成 100 字说明' }],
                status: 'pending_publish',
              }
        }
        onCancel={() => setEditorOpen(false)}
        onSubmit={(value) => {
          if (!currentTeam) return;
          actions.saveTask(currentTeam.id, value);
          messageApi.success(value.id ? '任务已更新' : '任务已创建');
          setEditorOpen(false);
        }}
      />

      <Modal
        open={copyOpen}
        title="快速创建研学任务"
        onCancel={() => setCopyOpen(false)}
        onOk={() => {
          if (!currentTeam) return;
          if (copySource === 'ai') {
            actions.createAiTasks(currentTeam.id, {
              scope,
              base: taskCity,
              keyword: taskKeyword || '研学任务',
              objective: taskObjective,
            });
            messageApi.success('AI 已生成 5 个任务草案并加入任务库');
            setCopyOpen(false);
            return;
          }
          if (selectedTaskIds.length === 0) return;
          if (copySource === 'history') {
            actions.copyTasksFromHistory(currentTeam.id, sourceTeamId, selectedTaskIds);
          } else {
            actions.copyTasksFromLibrary(currentTeam.id, selectedTaskIds);
          }
          messageApi.success(`已复制 ${selectedTaskIds.length} 个任务`);
          setSelectedTaskIds([]);
          setCopyOpen(false);
        }}
      >
        <div className="tutor-stack">
          <Segmented
            block
            value={copySource}
            options={[
              { label: '从历史团队复制', value: 'history' },
              { label: '从任务库复制', value: 'library' },
              { label: 'AI 搜索/创建', value: 'ai' },
            ]}
            onChange={(value) => {
              setCopySource(value as 'history' | 'library' | 'ai');
              setSelectedTaskIds([]);
            }}
          />
          {copySource === 'history' ? (
            <Select
              value={sourceTeamId}
              onChange={(value) => {
                setSourceTeamId(value);
                setSelectedTaskIds([]);
              }}
              options={historyTeams.map((team) => ({ label: team.name, value: team.id }))}
            />
          ) : null}
          {copySource !== 'history' ? (
            <div className="tutor-stack">
              <Input placeholder="城市名称" value={taskCity} onChange={(event) => setTaskCity(event.target.value)} />
              <Input placeholder="任务名称 / 基地 / 能力元素模糊搜索" value={taskKeyword} onChange={(event) => setTaskKeyword(event.target.value)} />
              <Input.TextArea rows={3} placeholder="课程目标或 AI 创建口述要求" value={taskObjective} onChange={(event) => setTaskObjective(event.target.value)} />
            </div>
          ) : null}
          {copySource === 'ai' ? (
            <div className="tutor-card tutor-card-soft">
              <div className="tutor-list-title">AI 创建说明</div>
              <div className="tutor-section-note" style={{ marginTop: 8 }}>
                点击确认后，系统会模拟语音识别与任务智能体生成，默认返回 5 个研学任务并自动加入当前团队与任务库。
              </div>
            </div>
          ) : null}
          <div className="tutor-list">
            {copySource === 'ai' ? null : copyCandidates.length === 0 ? (
              <EmptyBlock text="当前没有可复制的任务" />
            ) : (
              copyCandidates.map((item) => {
                const id = 'teamId' in item ? item.id : item.id;
                const checked = selectedTaskIds.includes(id);
                return (
                  <label key={id} className="tutor-list-card" style={{ cursor: 'pointer' }}>
                    <div className="tutor-section-head">
                      <div>
                        <div className="tutor-list-title">{item.title}</div>
                        <div className="tutor-list-subtitle">
                          {item.base} · {item.taskType} · {item.points} 分
                        </div>
                      </div>
                      <input
                        checked={checked}
                        type="checkbox"
                        onChange={(event) => {
                          setSelectedTaskIds((current) =>
                            event.target.checked ? [...current, id] : current.filter((taskId) => taskId !== id),
                          );
                        }}
                      />
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RewardPenaltyModal({
  open,
  onCancel,
  onSubmit,
  title,
  total = 0,
  records = [],
}: {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { kind: ScoreKind; points: number; reason: string }) => void;
  title: string;
  total?: number;
  records?: Array<{ id: string; kind: ScoreKind; points: number; reason: string; createdAt: string }>;
}) {
  const [form] = Form.useForm();

  return (
    <Modal forceRender open={open} title={title} onCancel={onCancel} onOk={() => form.submit()} okText="确认">
      <div className="tutor-card tutor-card-soft" style={{ marginBottom: 12 }}>
        <div className="tutor-section-head" style={{ marginBottom: 6 }}>
          <div className="tutor-section-title">累计奖惩分</div>
          <strong>{total}</strong>
        </div>
        {records.length === 0 ? (
          <div className="tutor-section-note">暂无奖惩记录</div>
        ) : (
          <div className="tutor-list" style={{ gap: 8 }}>
            {records.slice(0, 3).map((record) => (
              <div key={record.id} className="tutor-progress-note">
                <span>{scoreKindLabel(record.kind)} {record.points} 分 · {record.reason}</span>
                <span>{formatDate(record.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Form form={form} layout="vertical" initialValues={{ kind: 'reward', points: 2 }} onFinish={onSubmit}>
        <Form.Item name="kind" label="类型" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '奖励分', value: 'reward' },
              { label: '处罚分', value: 'penalty' },
            ]}
          />
        </Form.Item>
        <Form.Item name="points" label="分值" rules={[{ required: true }]}>
          <InputNumber min={1} max={20} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="reason" label="原因" rules={[{ required: true }]}>
          <Input.TextArea rows={3} placeholder="请输入奖惩原因" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function WorksPageContent({ teamId }: { teamId?: string }) {
  const searchParams = useSearchParams();
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const { team, students, groups, works } = buildTeamContext(state, teamId);
  const teamLabel = teamId ? '该团队' : '当前团队';
  const missingTeamText = teamId ? '未找到该团队' : '请先选择当前团队';
  const [tab, setTab] = useState<'students' | 'studentWorks' | 'groupWorks'>('students');
  const [studentDetailId, setStudentDetailId] = useState<string | null>(null);
  const [locationStudentId, setLocationStudentId] = useState<string | null>(null);
  const [groupDetailId, setGroupDetailId] = useState<string | null>(null);
  const [scoringWorkId, setScoringWorkId] = useState<string | null>(null);
  const [detailWorkId, setDetailWorkId] = useState<string | null>(null);
  const [batchSelection, setBatchSelection] = useState<string[]>([]);
  const [rewardTarget, setRewardTarget] = useState<{ targetType: TaskScope; targetId: string } | null>(null);
  const [evaluationStudentId, setEvaluationStudentId] = useState<string | null>(null);
  const [evaluationDraft, setEvaluationDraft] = useState<EvaluationEntry[]>([]);
  const [evaluationComment, setEvaluationComment] = useState('');
  const [scoreForm] = Form.useForm();

  const studentDetail = studentDetailId ? students.find((student) => student.id === studentDetailId) : null;
  const locationStudent = locationStudentId ? students.find((student) => student.id === locationStudentId) : null;
  const groupDetail = groupDetailId ? groups.find((group) => group.id === groupDetailId) : null;
  const scoringWork = scoringWorkId ? works.find((work) => work.id === scoringWorkId) : null;
  const detailWork = detailWorkId ? works.find((work) => work.id === detailWorkId) : null;
  const selectedPendingAi = works.filter((work) => batchSelection.includes(work.id) && work.aiScore !== undefined);
  const studentWorks = works.filter((work) => work.ownerType === 'student');
  const groupWorks = works.filter((work) => work.ownerType === 'group');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'students') {
      setTab('students');
    } else if (tabParam === 'student-works') {
      setTab('studentWorks');
    } else if (tabParam === 'group-works') {
      setTab('groupWorks');
    }
  }, [searchParams]);

  function openEvaluation(studentId: string) {
    const existing = getEvaluationForStudent(state, studentId);
    if (existing) {
      setEvaluationDraft(existing.items);
      setEvaluationComment(existing.comment);
    } else {
      setEvaluationDraft(
        state.evaluationItems.map((item) => ({
          itemId: item.id,
          selfRating: 0,
          groupRating: 0,
          tutorRating: 4,
        })),
      );
      setEvaluationComment('');
    }
    setEvaluationStudentId(studentId);
  }

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard
        title="团队执行查看"
        note={`查看${teamLabel}的学员列表、学员任务作品和小组任务作品`}
        extra={
          <Space>
            <Button
              disabled={batchSelection.length === 0}
              onClick={() => {
                const targetIds = selectedPendingAi.map((item) => item.id);
                if (targetIds.length === 0) {
                  messageApi.warning('当前选中的作品里没有 AI 可确认记录');
                  return;
                }
                actions.confirmAiScores(targetIds);
                messageApi.success(`已批量确认 ${targetIds.length} 条 AI 评分`);
                setBatchSelection([]);
              }}
            >
              批量确认 AI 分
            </Button>
          </Space>
        }
      >
        <Segmented
          block
          value={tab}
          options={[
            { label: '学员列表', value: 'students' },
            { label: '学员任务作品', value: 'studentWorks' },
            { label: '小组任务作品', value: 'groupWorks' },
          ]}
          onChange={(value) => setTab(value as 'students' | 'studentWorks' | 'groupWorks')}
        />
      </SectionCard>

      {tab === 'students' ? (
        <SectionCard title="学员列表" note="查看学员任务进度、得分、评价与位置">
          {!team ? (
            <EmptyBlock text={missingTeamText} />
          ) : (
            <div className="tutor-list">
              {students.map((student) => {
                const summary = getStudentProgressSummary(state, student.id);
                const evaluation = getStudentEvaluationSummary(state, student.id);
                return (
                  <div key={student.id} className="tutor-list-card">
                    <div className="tutor-section-head">
                      <div>
                        <div className="tutor-list-title">{student.name}</div>
                        <div className="tutor-list-subtitle">
                          {student.groupId ? getOwnerName(state, 'group', student.groupId) : '未分组'}
                        </div>
                      </div>
                      <Tag color={student.online ? 'green' : 'default'}>{student.online ? '在线' : '离线'}</Tag>
                    </div>
                    <div className="tutor-progress-note">
                      <span>
                        已完成 {summary.completed}/{summary.total} · 未完成 {Math.max(summary.total - summary.submitted, 0)}
                      </span>
                      <strong>{computeStudentTotalScore(state, student.id)} 分</strong>
                    </div>
                    <Progress percent={summary.progress} strokeColor={summary.progress >= 100 ? '#16a34a' : '#0f766e'} />
                    <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                      <span className="tutor-pill">综合评级 {evaluation.grade}</span>
                      <span className="tutor-pill">家长 {student.parent.name}</span>
                    </div>
                    <div className="tutor-actions" style={{ marginTop: 12 }}>
                      <Button icon={<EyeOutlined />} onClick={() => setStudentDetailId(student.id)}>
                        任务详情
                      </Button>
                      <Button icon={<EnvironmentOutlined />} onClick={() => setLocationStudentId(student.id)}>
                        学员位置
                      </Button>
                      <Button onClick={() => setRewardTarget({ targetType: 'student', targetId: student.id })}>
                        奖惩分（{getRewardPenaltyTotal(state, 'student', student.id)}）
                      </Button>
                      <Button onClick={() => openEvaluation(student.id)}>导师评价</Button>
                      <Button
                        onClick={() => {
                          if (!team) return;
                          actions.generateReports(team.id, [student.id]);
                          messageApi.success(`已为 ${student.name} 生成研学报告`);
                        }}
                      >
                        生成报告
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      ) : null}

      {tab === 'studentWorks' ? (
        <SectionCard title="学员任务作品" note={`查看${teamLabel}所有学员提交的任务作品`}>
          {!team ? (
            <EmptyBlock text={missingTeamText} />
          ) : (
            <div className="tutor-list">
              {studentWorks.map((work) => {
                const task = state.tasks.find((item) => item.id === work.taskId);
                return (
                  <div key={work.id} className="tutor-list-card">
                    <div className="tutor-section-head">
                      <div>
                        <div className="tutor-list-title">{task?.title ?? '未知任务'}</div>
                        <div className="tutor-list-subtitle">{getOwnerName(state, 'student', work.ownerId)} · 学员任务作品</div>
                      </div>
                      <Tag color={formatWorkStatus(work.status).color}>{formatWorkStatus(work.status).label}</Tag>
                    </div>
                    <div className="tutor-progress-note">
                      <span>提交时间 {formatDate(work.submittedAt)}</span>
                      <strong>{work.finalScore ?? work.aiScore ?? '-'} 分</strong>
                    </div>
                    <div className="tutor-section-note" style={{ marginTop: 8 }}>
                      {work.preview}
                    </div>
                    <div className="tutor-actions" style={{ marginTop: 12 }}>
                      <Button icon={<EyeOutlined />} onClick={() => setDetailWorkId(work.id)}>
                        作品详情
                      </Button>
                      <Button icon={<EditOutlined />} onClick={() => setScoringWorkId(work.id)}>
                        评分
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      ) : null}

      {tab === 'groupWorks' ? (
        <SectionCard title="小组任务作品" note={`查看${teamLabel}所有小组提交的任务作品`}>
          {!team ? (
            <EmptyBlock text={missingTeamText} />
          ) : (
            <div className="tutor-list">
              {groupWorks.map((work) => {
                const task = state.tasks.find((item) => item.id === work.taskId);
                return (
                  <label key={work.id} className="tutor-list-card" style={{ cursor: 'pointer' }}>
                    <div className="tutor-section-head">
                      <div>
                        <div className="tutor-list-title">{task?.title ?? '未知任务'}</div>
                        <div className="tutor-list-subtitle">
                          {getOwnerName(state, 'group', work.ownerId)} · 小组任务作品
                        </div>
                      </div>
                      <input
                        checked={batchSelection.includes(work.id)}
                        type="checkbox"
                        onChange={(event) => {
                          setBatchSelection((current) =>
                            event.target.checked ? [...current, work.id] : current.filter((id) => id !== work.id),
                          );
                        }}
                      />
                    </div>
                    <div className="tutor-progress-note">
                      <span>提交时间 {formatDate(work.submittedAt)}</span>
                      <Tag color={formatWorkStatus(work.status).color}>{formatWorkStatus(work.status).label}</Tag>
                    </div>
                    <div className="tutor-kv-row">
                      <div>
                        <div className="tutor-kv-label">AI 分</div>
                        <div className="tutor-info-value">{work.aiScore ?? '-'}</div>
                      </div>
                      <div>
                        <div className="tutor-kv-label">导师分</div>
                        <div className="tutor-kv-value">{work.tutorScore ?? '-'}</div>
                      </div>
                    </div>
                    <div className="tutor-section-note" style={{ marginTop: 8 }}>
                      {work.preview}
                    </div>
                    <div className="tutor-actions" style={{ marginTop: 12 }}>
                      <Button icon={<EyeOutlined />} onClick={() => setDetailWorkId(work.id)}>
                        作品详情
                      </Button>
                      <Button icon={<EditOutlined />} onClick={() => setScoringWorkId(work.id)}>
                        评分
                      </Button>
                      {work.aiScore !== undefined ? (
                        <Button
                          icon={<CheckCircleOutlined />}
                          onClick={() => {
                            actions.confirmAiScores([work.id]);
                            messageApi.success('已确认该作品的 AI 分');
                          }}
                        >
                          确认 AI 分
                        </Button>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </SectionCard>
      ) : null}

      <Modal
        open={Boolean(studentDetail)}
        title={studentDetail ? `${studentDetail.name} · 任务详情` : '学员详情'}
        onCancel={() => setStudentDetailId(null)}
        footer={null}
        width={420}
      >
        {studentDetail ? (
          <div className="tutor-stack">
            <div className="tutor-card tutor-card-soft">
              <div className="tutor-kv-row">
                <div>
                  <div className="tutor-kv-label">家长</div>
                  <div className="tutor-info-value">{studentDetail.parent.name}</div>
                </div>
                <div className="tutor-kv-value">{studentDetail.parent.phone}</div>
              </div>
              <div className="tutor-kv-row">
                <div>
                  <div className="tutor-kv-label">研学宝 ID</div>
                  <div className="tutor-info-value">{studentDetail.deviceId}</div>
                </div>
                <div className="tutor-kv-value">{studentDetail.online ? '在线' : '离线'}</div>
              </div>
            </div>
            {getWorksForOwner(state, 'student', studentDetail.id).map((work) => {
              const task = state.tasks.find((item) => item.id === work.taskId);
              return (
                <div key={work.id} className="tutor-list-card">
                  <div className="tutor-section-head">
                    <div>
                      <div className="tutor-list-title">{task?.title ?? '未知任务'}</div>
                      <div className="tutor-list-subtitle">
                        {task?.points ?? 0} 分 · {formatDate(work.submittedAt)}
                      </div>
                    </div>
                    <Tag color={formatWorkStatus(work.status).color}>{formatWorkStatus(work.status).label}</Tag>
                  </div>
                  <div className="tutor-progress-note">
                    <span>{work.preview}</span>
                    <strong>{work.finalScore ?? work.aiScore ?? '-'} 分</strong>
                  </div>
                  <Button style={{ marginTop: 10 }} onClick={() => setScoringWorkId(work.id)}>
                    评分该任务
                  </Button>
                </div>
              );
            })}
            {(() => {
              const location = getLocationForStudent(state, studentDetail.id);
              return location ? (
                <div className="tutor-card tutor-card-soft">
                  <div className="tutor-section-title">学员位置</div>
                  <div className="tutor-list-subtitle">{location.address}</div>
                  <div className="tutor-inline-list" style={{ marginTop: 8 }}>
                    <span className="tutor-pill">{location.distanceMeters} 米</span>
                    <span className="tutor-pill">更新于 {formatDate(location.updatedAt)}</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(locationStudent)}
        title={locationStudent ? `${locationStudent.name} · 学员位置` : '学员位置'}
        onCancel={() => setLocationStudentId(null)}
        footer={null}
      >
        {locationStudent ? (
          <div className="tutor-stack">
            {(() => {
              const location = getLocationForStudent(state, locationStudent.id);
              const track = getTrackForStudent(state, locationStudent.id);
              return (
                <>
                  <div className="tutor-card tutor-card-soft">
                    <div className="tutor-list-title">{location?.address ?? '暂无位置上报'}</div>
                    {location ? (
                      <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                        <span className="tutor-pill">{location.distanceMeters} 米</span>
                        <span className="tutor-pill">更新于 {formatDate(location.updatedAt)}</span>
                        <span className="tutor-pill">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </span>
                      </div>
                    ) : null}
                    <div className="tutor-actions" style={{ marginTop: 12 }}>
                      <Button disabled={!location}>高德导航</Button>
                      <Button disabled={!location}>百度导航</Button>
                    </div>
                  </div>
                  <div className="tutor-list">
                    <div className="tutor-section-title">当日轨迹</div>
                    {track.length === 0 ? (
                      <EmptyBlock text="暂无当日轨迹" />
                    ) : (
                      track.map((point) => (
                        <div key={point.id} className="tutor-list-card">
                          <div className="tutor-list-title">{point.address}</div>
                          <div className="tutor-list-subtitle">{formatDate(point.recordedAt)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(detailWork)}
        title="作品详情"
        onCancel={() => setDetailWorkId(null)}
        footer={null}
      >
        {detailWork ? (
          <div className="tutor-stack">
            {(() => {
              const task = state.tasks.find((item) => item.id === detailWork.taskId);
              return (
                <>
                  <div className="tutor-card tutor-card-soft">
                    <div className="tutor-list-title">{task?.title ?? '未知任务'}</div>
                    <div className="tutor-list-subtitle">
                      {getOwnerName(state, detailWork.ownerType, detailWork.ownerId)} · {formatDate(detailWork.submittedAt)}
                    </div>
                    <div className="tutor-section-note" style={{ marginTop: 10 }}>
                      {detailWork.preview}
                    </div>
                  </div>
                  {task ? (
                    <div className="tutor-list">
                      {task.requirements.map((requirement) => (
                        <div key={requirement.id} className="tutor-list-card">
                          <Tag>{requirementTypeLabel(requirement.type)}</Tag>
                          <div className="tutor-section-note" style={{ marginTop: 8 }}>
                            {requirement.requirement}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <MobileSummaryGrid
                    items={[
                      { label: 'AI 分', value: detailWork.aiScore ?? '-' },
                      { label: '导师分', value: detailWork.tutorScore ?? '-' },
                      { label: '最终分', value: detailWork.finalScore ?? '-' },
                      { label: '状态', value: formatWorkStatus(detailWork.status).label },
                    ]}
                  />
                  <Button type="primary" onClick={() => setScoringWorkId(detailWork.id)}>
                    进入评分
                  </Button>
                </>
              );
            })()}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(groupDetail)}
        title={groupDetail ? `${groupDetail.name} · 任务详情` : '小组详情'}
        onCancel={() => setGroupDetailId(null)}
        footer={null}
      >
        {groupDetail ? (
          <div className="tutor-stack">
            {getWorksForOwner(state, 'group', groupDetail.id).map((work) => {
              const task = state.tasks.find((item) => item.id === work.taskId);
              return (
                <div key={work.id} className="tutor-list-card">
                  <div className="tutor-section-head">
                    <div>
                      <div className="tutor-list-title">{task?.title ?? '未知任务'}</div>
                      <div className="tutor-list-subtitle">{task?.points ?? 0} 分</div>
                    </div>
                    <Tag color={formatWorkStatus(work.status).color}>{formatWorkStatus(work.status).label}</Tag>
                  </div>
                  <div className="tutor-progress-note">
                    <span>{work.preview}</span>
                    <strong>{work.finalScore ?? work.aiScore ?? '-'} 分</strong>
                  </div>
                  <Button style={{ marginTop: 10 }} onClick={() => setScoringWorkId(work.id)}>
                    评分该小组任务
                  </Button>
                </div>
              );
            })}
          </div>
        ) : null}
      </Modal>

      <Modal
        forceRender
        open={Boolean(scoringWork)}
        title="任务评分"
        onCancel={() => setScoringWorkId(null)}
        onOk={() => scoreForm.submit()}
      >
        {scoringWork ? (
          <Form
            form={scoreForm}
            layout="vertical"
            initialValues={{
              rating: Number((scoringWork.rating ?? 4).toFixed(1)),
              comment: scoringWork.comment ?? '',
            }}
            onFinish={(values) => {
              actions.scoreWork(scoringWork.id, values);
              messageApi.success('评分已完成');
              setScoringWorkId(null);
            }}
          >
            <div className="tutor-card tutor-card-soft" style={{ marginBottom: 12 }}>
              <div className="tutor-list-title">
                {state.tasks.find((item) => item.id === scoringWork.taskId)?.title}
              </div>
              <div className="tutor-list-subtitle">{scoringWork.preview}</div>
              <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                <span className="tutor-pill">AI 分：{scoringWork.aiScore ?? '-'}</span>
                <span className="tutor-pill">当前导师分：{scoringWork.tutorScore ?? '-'}</span>
              </div>
              <Button size="small" style={{ marginTop: 10 }} onClick={() => setDetailWorkId(scoringWork.id)}>
                查看作品详情
              </Button>
            </div>
            <Form.Item name="rating" label="星级评分">
              <Rate allowHalf />
            </Form.Item>
            <Form.Item name="comment" label="导师评语">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        ) : null}
      </Modal>

      <RewardPenaltyModal
        open={Boolean(rewardTarget)}
        title={rewardTarget ? `${rewardTarget.targetType === 'student' ? '学员' : '小组'}奖惩分` : '奖惩分'}
        total={rewardTarget ? getRewardPenaltyTotal(state, rewardTarget.targetType, rewardTarget.targetId) : 0}
        records={
          rewardTarget
            ? state.rewardPenaltyRecords.filter(
                (record) => record.targetType === rewardTarget.targetType && record.targetId === rewardTarget.targetId,
              )
            : []
        }
        onCancel={() => setRewardTarget(null)}
        onSubmit={(values) => {
          if (!team || !rewardTarget) return;
          actions.addRewardPenalty({
            teamId: team.id,
            targetType: rewardTarget.targetType,
            targetId: rewardTarget.targetId,
            kind: values.kind,
            points: values.points,
            reason: values.reason,
          });
          messageApi.success(`${scoreKindLabel(values.kind)}已记录`);
          setRewardTarget(null);
        }}
      />

      <Modal
        open={Boolean(evaluationStudentId)}
        title="导师评价与综合评级"
        onCancel={() => setEvaluationStudentId(null)}
        onOk={() => {
          if (!evaluationStudentId) return;
          actions.updateEvaluation(evaluationStudentId, evaluationDraft, evaluationComment);
          messageApi.success('导师评价已保存');
          setEvaluationStudentId(null);
        }}
      >
        <div className="tutor-stack">
          {state.evaluationItems.map((item, index) => (
            <div key={item.id} className="tutor-list-card">
              <div className="tutor-list-title">{item.indicator}</div>
              <div className="tutor-list-subtitle">
                {item.dimension} · {item.description}
              </div>
              <div className="tutor-inline-list" style={{ marginTop: 10 }}>
                <span className="tutor-pill">
                  自评：
                  {item.allowSelf
                    ? evaluationDraft[index]?.selfRating
                      ? `${evaluationDraft[index].selfRating} 星`
                      : '未自评'
                    : '无自评'}
                </span>
                <span className="tutor-pill">
                  互评：
                  {item.allowGroup
                    ? evaluationDraft[index]?.groupRating
                      ? `${evaluationDraft[index].groupRating} 星`
                      : '未互评'
                    : '无互评'}
                </span>
              </div>
              <Rate
                allowHalf
                style={{ marginTop: 10 }}
                value={evaluationDraft[index]?.tutorRating ?? 0}
                onChange={(value) =>
                  setEvaluationDraft((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, tutorRating: value } : entry,
                    ),
                  )
                }
              />
            </div>
          ))}
          <Input.TextArea
            rows={3}
            value={evaluationComment}
            onChange={(event) => setEvaluationComment(event.target.value)}
            placeholder="请输入导师综合评价"
          />
        </div>
      </Modal>
    </div>
  );
}

export function RankingPageContent() {
  const { state } = useTutorStore();
  const currentTeam = getCurrentTeam(state);
  const students = currentTeam ? getStudentsByTeam(state, currentTeam.id) : [];
  const groups = currentTeam ? getGroupsByTeam(state, currentTeam.id) : [];
  const studentRanking = [...students].sort(
    (left, right) => computeStudentTotalScore(state, right.id) - computeStudentTotalScore(state, left.id),
  );
  const groupRanking = [...groups].sort(
    (left, right) => computeGroupTotalScore(state, right.id) - computeGroupTotalScore(state, left.id),
  );

  return (
    <div className="tutor-page">
      <SectionCard title="学员得分排行榜" note="可点击进入评分工作区继续调整">
        {studentRanking.length === 0 ? (
          <EmptyBlock text="当前团队暂无学员数据" />
        ) : (
          <div className="tutor-list">
            {studentRanking.map((student, index) => {
              const summary = getStudentProgressSummary(state, student.id);
              return (
                <div key={student.id} className="tutor-list-card">
                  <div className="tutor-section-head">
                    <div>
                      <div className="tutor-list-title">
                        #{index + 1} {student.name}
                      </div>
                      <div className="tutor-list-subtitle">
                        已完成 {summary.completed}/{summary.total} 个任务
                      </div>
                    </div>
                    <Tag color="green">{computeStudentTotalScore(state, student.id)} 分</Tag>
                  </div>
                  <Link href="/works">
                    <Button type="link" style={{ paddingInline: 0 }}>
                      去调整评分
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="小组得分排行榜" note="支持跳回作品页进行快速调整">
        {groupRanking.length === 0 ? (
          <EmptyBlock text="当前团队暂无小组数据" />
        ) : (
          <div className="tutor-list">
            {groupRanking.map((group, index) => {
              const summary = getGroupProgressSummary(state, group.id);
              return (
                <div key={group.id} className="tutor-list-card">
                  <div className="tutor-section-head">
                    <div>
                      <div className="tutor-list-title">
                        #{index + 1} {group.name}
                      </div>
                      <div className="tutor-list-subtitle">
                        已完成 {summary.completed}/{summary.total} 个任务
                      </div>
                    </div>
                    <Tag color="blue">{computeGroupTotalScore(state, group.id)} 分</Tag>
                  </div>
                  <Link href="/works">
                    <Button type="link" style={{ paddingInline: 0 }}>
                      去查看小组任务
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function ReportsPageContent() {
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const currentTeam = getCurrentTeam(state);
  const students = currentTeam ? getStudentsByTeam(state, currentTeam.id) : [];
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [previewReportId, setPreviewReportId] = useState<string | null>(null);
  const [templateEditor, setTemplateEditor] = useState<ReportTemplate | null>(null);
  const [templateForm] = Form.useForm();
  const reports = currentTeam
    ? state.reports
        .filter((report) => report.teamId === currentTeam.id)
        .sort((left, right) => right.generatedAt.localeCompare(left.generatedAt))
    : [];
  const previewReport = previewReportId ? reports.find((report) => report.id === previewReportId) : null;

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard
        title="报告生成与成长值"
        note="基于导师评价与综合评级生成报告，并按等级发放成长值"
        extra={
          <Space>
            <Button
              onClick={() => {
                if (!currentTeam) return;
                actions.generateReports(currentTeam.id, students.map((student) => student.id));
                messageApi.success('已为当前团队重新生成全部研学报告');
              }}
            >
              重新生成
            </Button>
            <Button
              type="primary"
              disabled={selectedReportIds.length === 0}
              onClick={() => {
                actions.pushReports(selectedReportIds);
                messageApi.success(`已批量推送 ${selectedReportIds.length} 份报告`);
                setSelectedReportIds([]);
              }}
            >
              批量推送
            </Button>
          </Space>
        }
      >
        {currentTeam ? (
          <MobileSummaryGrid
            items={[
              { label: '当前团队', value: currentTeam.name },
              { label: '报告数量', value: reports.length },
              { label: '成长值基准', value: currentTeam.growthBaseValue },
              { label: '已推送', value: reports.filter((report) => report.status === 'pushed').length },
            ]}
          />
        ) : (
          <EmptyBlock text="请先选择当前团队" />
        )}
      </SectionCard>

      <SectionCard
        title="报告列表"
        note="需查看确认无误后再发给学生与家长，支持全选和批量推送"
        extra={
          reports.length > 0 ? (
            <Button
              size="small"
              onClick={() =>
                setSelectedReportIds((current) =>
                  current.length === reports.length ? [] : reports.map((report) => report.id),
                )
              }
            >
              {selectedReportIds.length === reports.length ? '取消全选' : '全选'}
            </Button>
          ) : undefined
        }
      >
        {reports.length === 0 ? (
          <EmptyBlock text="当前团队还没有生成报告，可先点击上方按钮批量生成。" />
        ) : (
          <div className="tutor-list">
            {reports.map((report) => {
              const student = state.students.find((item) => item.id === report.studentId);
              return (
                <div key={report.id} className="tutor-list-card">
                  <div className="tutor-section-head">
                    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 0 }}>
                      <input
                        checked={selectedReportIds.includes(report.id)}
                        type="checkbox"
                        onChange={(event) =>
                          setSelectedReportIds((current) =>
                            event.target.checked ? [...current, report.id] : current.filter((id) => id !== report.id),
                          )
                        }
                      />
                      <span style={{ minWidth: 0 }}>
                      <div className="tutor-list-title">{student?.name ?? '未知学员'}</div>
                      <div className="tutor-list-subtitle">{report.title}</div>
                      </span>
                    </label>
                    <Tag color={report.status === 'pushed' ? 'green' : 'gold'}>
                      {report.status === 'pushed' ? '已推送' : '待推送'}
                    </Tag>
                  </div>
                  <div className="tutor-info-grid">
                    <div>
                      <div className="tutor-info-label">综合评级</div>
                      <div className="tutor-info-value">{report.grade}</div>
                    </div>
                    <div>
                      <div className="tutor-info-label">综合分</div>
                      <div className="tutor-info-value">{report.score}</div>
                    </div>
                    <div>
                      <div className="tutor-info-label">成长值</div>
                      <div className="tutor-info-value">{report.growthValue}</div>
                    </div>
                    <div>
                      <div className="tutor-info-label">生成时间</div>
                      <div className="tutor-info-value">{formatDate(report.generatedAt)}</div>
                    </div>
                    <div>
                      <div className="tutor-info-label">报告模版</div>
                      <div className="tutor-info-value">
                        {state.reportTemplates.find((template) => template.id === report.templateId)?.name ?? '默认模版'}
                      </div>
                    </div>
                  </div>
                  <div className="tutor-section-note" style={{ marginTop: 10 }}>
                    {report.summary}
                  </div>
                  <div className="tutor-actions" style={{ marginTop: 12 }}>
                    <Button icon={<EyeOutlined />} onClick={() => setPreviewReportId(report.id)}>
                      查看确认
                    </Button>
                    <Button
                      onClick={() => {
                        actions.generateReports(report.teamId, [report.studentId]);
                        messageApi.success('已重新生成该学员报告');
                      }}
                    >
                      重新生成
                    </Button>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      disabled={report.status === 'pushed'}
                      onClick={() => {
                        actions.pushReport(report.id);
                        messageApi.success('已推送报告给家长端');
                      }}
                    >
                      {report.status === 'pushed' ? '已推送' : '推送报告'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="研学报告模版管理" note="机构模版可复制为导师个人模版并编辑图形化配置项">
        <div className="tutor-list">
          {state.reportTemplates.map((template) => (
            <div key={template.id} className="tutor-list-card">
              <div className="tutor-section-head">
                <div>
                  <div className="tutor-list-title">{template.name}</div>
                  <div className="tutor-list-subtitle">
                    {template.owner === 'organization' ? template.organizationName : '导师个人'} · 更新于 {formatDate(template.updatedAt)}
                  </div>
                </div>
                <Tag>{template.owner === 'organization' ? '机构模版' : '个人模版'}</Tag>
              </div>
              <div className="tutor-inline-list">
                {template.enabledSections.map((section) => (
                  <span key={section} className="tutor-pill">
                    {section}
                  </span>
                ))}
              </div>
              <div className="tutor-actions" style={{ marginTop: 12 }}>
                <Button
                  onClick={() => {
                    actions.duplicateReportTemplate(template.id, `${template.name} 副本`);
                    messageApi.success('已复制为个人报告模版');
                  }}
                >
                  复制编辑
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setTemplateEditor(template);
                    templateForm.setFieldsValue({
                      name: template.name,
                      content: template.content,
                      enabledSections: template.enabledSections.join('、'),
                    });
                  }}
                >
                  图形化配置
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <Modal open={Boolean(previewReport)} title="报告确认" onCancel={() => setPreviewReportId(null)} footer={null}>
        {previewReport ? (
          <div className="tutor-stack">
            <div className="tutor-card tutor-card-soft">
              <div className="tutor-list-title">{previewReport.title}</div>
              <div className="tutor-list-subtitle">
                致 {state.students.find((student) => student.id === previewReport.studentId)?.name ?? '学员'} 同学
              </div>
              <div className="tutor-section-note" style={{ marginTop: 10 }}>
                {previewReport.summary}
              </div>
            </div>
            <MobileSummaryGrid
              items={[
                { label: '综合评级', value: previewReport.grade },
                { label: '综合分', value: previewReport.score },
                { label: '成长值', value: previewReport.growthValue },
                { label: '状态', value: previewReport.status === 'pushed' ? '已推送' : '待推送' },
              ]}
            />
          </div>
        ) : null}
      </Modal>

      <Modal
        forceRender
        open={Boolean(templateEditor)}
        title="报告模版配置"
        onCancel={() => setTemplateEditor(null)}
        onOk={() => templateForm.submit()}
      >
        <Form
          form={templateForm}
          layout="vertical"
          onFinish={(values) => {
            if (!templateEditor) return;
            actions.saveReportTemplate({
              id: templateEditor.id,
              name: values.name,
              owner: templateEditor.owner,
              organizationName: templateEditor.organizationName,
              content: values.content,
              enabledSections: String(values.enabledSections)
                .split(/[、,，]/)
                .map((item) => item.trim())
                .filter(Boolean),
            });
            messageApi.success('报告模版已保存');
            setTemplateEditor(null);
          }}
        >
          <Form.Item name="name" label="模版名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="enabledSections" label="报告模块">
            <Input placeholder="身份信息、个性化评语、能力雷达图" />
          </Form.Item>
          <Form.Item name="content" label="模版正文" rules={[{ required: true }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export function MessagesPageContent() {
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const currentTeam = getCurrentTeam(state);
  const students = currentTeam ? getStudentsByTeam(state, currentTeam.id) : [];
  const groups = currentTeam ? getGroupsByTeam(state, currentTeam.id) : [];
  const [form] = Form.useForm();
  const [lectureActive, setLectureActive] = useState(false);
  const records = currentTeam
    ? state.broadcasts.filter((broadcast) => broadcast.teamId === currentTeam.id)
    : [];
  const messages = currentTeam
    ? state.tutorMessages
        .filter((item) => item.teamId === currentTeam.id)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    : [];

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard title="消息中心" note="SoS、学员问询、系统通知、团队/小组消息统一处理">
        {!currentTeam ? (
          <EmptyBlock text="请先选择当前团队" />
        ) : (
          <div className="tutor-list">
            {messages.map((item) => (
              <div key={item.id} className="tutor-list-card">
                <div className="tutor-section-head">
                  <div>
                    <div className="tutor-list-title">{item.title}</div>
                    <div className="tutor-list-subtitle">
                      {item.category === 'sos'
                        ? 'SoS'
                        : item.category === 'question'
                          ? '学员问询'
                          : item.category === 'system'
                            ? '系统通知'
                            : item.category === 'lecture'
                              ? '语音讲解'
                              : item.category === 'group_chat'
                                ? '小组消息'
                                : '团队消息'}{' '}
                      · {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <Tag color={item.read ? 'default' : 'green'}>{item.read ? '已读' : '未读'}</Tag>
                </div>
                <div className="tutor-section-note">{item.content}</div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="语音讲解" note="仅导师可发言，学员研学宝同步自动播放，优先级最高">
        {!currentTeam ? (
          <EmptyBlock text="请先选择当前团队" />
        ) : (
          <div className="tutor-stack">
            <div className="tutor-card tutor-card-soft">
              <div className="tutor-section-head">
                <div>
                  <div className="tutor-list-title">{lectureActive ? '讲解中' : '待开始讲解'}</div>
                  <div className="tutor-list-subtitle">面向当前团队全员自动播放，可连续讲解。</div>
                </div>
                <Tag color={lectureActive ? 'green' : 'default'}>{lectureActive ? '最高优先级' : '空闲'}</Tag>
              </div>
              <Button
                type={lectureActive ? 'default' : 'primary'}
                icon={<SoundOutlined />}
                onClick={() => {
                  if (!currentTeam) return;
                  if (lectureActive) {
                    actions.sendBroadcast({
                      teamId: currentTeam.id,
                      scope: 'team',
                      contentType: 'lecture',
                      content: '语音讲解已结束，学员端恢复原任务音频。',
                    });
                    setLectureActive(false);
                    messageApi.success('语音讲解已结束');
                  } else {
                    actions.sendBroadcast({
                      teamId: currentTeam.id,
                      scope: 'team',
                      contentType: 'lecture',
                      content: '导师开始语音讲解，学员端自动暂停其他音频并播放导师讲解。',
                    });
                    setLectureActive(true);
                    messageApi.success('语音讲解已开始');
                  }
                }}
              >
                {lectureActive ? '结束讲解' : '开始讲解'}
              </Button>
            </div>
            <div className="tutor-inline-list">
              {records
                .filter((record) => record.contentType === 'lecture' || record.contentType === 'voice')
                .slice(0, 3)
                .map((record) => (
                  <span key={record.id} className="tutor-pill">
                    {formatContentType(record.contentType)} · {formatDate(record.createdAt)}
                  </span>
                ))}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="发送广播与消息" note="支持团队、小组、学员三个范围">
        {!currentTeam ? (
          <EmptyBlock text="请先选择当前团队" />
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{ scope: 'team', contentType: 'text' }}
            onValuesChange={(changed) => {
              if ('scope' in changed) {
                form.setFieldValue('targetId', undefined);
              }
            }}
            onFinish={(values) => {
              actions.sendBroadcast({
                teamId: currentTeam.id,
                scope: values.scope,
                targetId: values.targetId,
                contentType: values.contentType,
                content: values.content,
              });
              form.resetFields(['content', 'targetId']);
              messageApi.success('广播已写入本地消息记录');
            }}
          >
            <Form.Item name="scope" label="广播范围" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: '团队广播', value: 'team' },
                  { label: '小组广播', value: 'group' },
                  { label: '学员消息', value: 'student' },
                ]}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const scope = getFieldValue('scope') as BroadcastScope;
                if (scope === 'team') return null;
                return (
                  <Form.Item name="targetId" label={scope === 'group' ? '目标小组' : '目标学员'} rules={[{ required: true }]}>
                    <Select
                      options={
                        scope === 'group'
                          ? groups.map((group) => ({ label: group.name, value: group.id }))
                          : students.map((student) => ({ label: student.name, value: student.id }))
                      }
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item name="contentType" label="内容类型" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: '文字', value: 'text' },
                  { label: '语音', value: 'voice' },
                  { label: '图片', value: 'image' },
                  { label: '语音讲解', value: 'lecture' },
                ]}
              />
            </Form.Item>
            <Form.Item name="content" label="广播内容" rules={[{ required: true }]}>
              <Input.TextArea rows={4} placeholder="请输入广播内容或上传说明" />
            </Form.Item>
            <Button htmlType="submit" type="primary" icon={<SendOutlined />}>
              发送
            </Button>
          </Form>
        )}
      </SectionCard>

      <SectionCard title="消息记录" note="按时间倒序展示">
        {records.length === 0 ? (
          <EmptyBlock text="当前团队还没有广播消息" />
        ) : (
          <div className="tutor-list">
            {records.map((record) => (
              <div key={record.id} className="tutor-list-card">
                <div className="tutor-section-head">
                  <div>
                    <div className="tutor-list-title">{formatBroadcastScope(record.scope)}</div>
                    <div className="tutor-list-subtitle">
                      {record.targetId ? getOwnerName(state, record.scope === 'student' ? 'student' : 'group', record.targetId) : '面向整个团队'}
                    </div>
                  </div>
                  <Tag color="blue">{formatContentType(record.contentType)}</Tag>
                </div>
                <div className="tutor-section-note">{record.content}</div>
                <div className="tutor-list-subtitle" style={{ marginTop: 8 }}>
                  {formatDate(record.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function BroadcastsPageContent() {
  return <MessagesPageContent />;
}

export function PhotosPageContent() {
  const { state, actions } = useTutorStore();
  const [messageApi, contextHolder] = message.useMessage();
  const currentTeam = getCurrentTeam(state);
  const students = currentTeam ? getStudentsByTeam(state, currentTeam.id) : [];
  const groups = currentTeam ? getGroupsByTeam(state, currentTeam.id) : [];
  const [form] = Form.useForm();
  const photos = currentTeam
    ? state.photos.filter((photo) => photo.teamId === currentTeam.id)
    : [];

  return (
    <div className="tutor-page">
      {contextHolder}
      <SectionCard title="照片上传" note="团队、小组、学员三种归类方式">
        {!currentTeam ? (
          <EmptyBlock text="请先选择当前团队" />
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{ scope: 'team' }}
            onFinish={(values) => {
              const batchTitles = String(values.batchTitles ?? '')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);
              if (batchTitles.length > 0) {
                actions.addPhotosBatch({
                  teamId: currentTeam.id,
                  scope: values.scope,
                  targetId: values.targetId,
                  titles: batchTitles,
                  description: values.description,
                });
                form.resetFields(['title', 'batchTitles', 'description', 'imageUrl', 'targetId']);
                messageApi.success(`已批量添加 ${batchTitles.length} 张团队照片`);
                return;
              }
              if (!values.title) {
                messageApi.warning('请输入照片标题，或在批量照片标题中每行填写一个标题');
                return;
              }
              actions.addPhoto({
                teamId: currentTeam.id,
                scope: values.scope,
                targetId: values.targetId,
                title: values.title,
                description: values.description,
                imageUrl: values.imageUrl,
              });
              form.resetFields(['title', 'description', 'imageUrl', 'targetId']);
              messageApi.success('已添加团队照片记录');
            }}
          >
            <Form.Item name="scope" label="归属范围" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: '团队照片', value: 'team' },
                  { label: '小组照片', value: 'group' },
                  { label: '学员照片', value: 'student' },
                ]}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const scope = getFieldValue('scope');
                if (scope === 'team') return null;
                return (
                  <Form.Item name="targetId" label={scope === 'group' ? '关联小组' : '关联学员'} rules={[{ required: true }]}>
                    <Select
                      options={
                        scope === 'group'
                          ? groups.map((group) => ({ label: group.name, value: group.id }))
                          : students.map((student) => ({ label: student.name, value: student.id }))
                      }
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item name="title" label="照片标题">
              <Input />
            </Form.Item>
            <Form.Item name="batchTitles" label="批量照片标题（可选）">
              <Input.TextArea rows={3} placeholder="每行一个照片标题；填写后将批量上传生成多张照片记录" />
            </Form.Item>
            <Form.Item name="description" label="照片说明" rules={[{ required: true }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="imageUrl" label="图片地址（可选）">
              <Input placeholder="为空则自动使用示例图片" />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              添加照片
            </Button>
          </Form>
        )}
      </SectionCard>

      <SectionCard title="照片流" note="团队照片将作为研学回顾素材">
        {photos.length === 0 ? (
          <EmptyBlock text="还没有照片，可先上传示例图。" />
        ) : (
          <div className="tutor-photo-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="tutor-list-card tutor-photo-card">
                <Image alt={photo.title} src={photo.imageUrl} />
                <div className="tutor-list-title" style={{ marginTop: 10 }}>
                  {photo.title}
                </div>
                <div className="tutor-list-subtitle">{photo.description}</div>
                <div className="tutor-inline-list" style={{ marginTop: 8 }}>
                  <span className="tutor-pill">{photo.scope === 'team' ? '团队' : photo.scope === 'group' ? '小组' : '学员'}</span>
                  {photo.targetId ? (
                    <span className="tutor-pill">
                      {photo.scope === 'student'
                        ? getOwnerName(state, 'student', photo.targetId)
                        : getOwnerName(state, 'group', photo.targetId)}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function SafetyPageContent() {
  const { state, actions } = useTutorStore();
  const currentTeam = getCurrentTeam(state);
  const students = currentTeam ? getStudentsByTeam(state, currentTeam.id) : [];
  const sosAlerts = currentTeam ? getSosForTeam(state, currentTeam.id) : [];

  return (
    <div className="tutor-page">
      <SectionCard title="学员位置" note="集中查看距离、地址与最近更新时间">
        {!currentTeam ? (
          <EmptyBlock text="请先选择当前团队" />
        ) : (
          <div className="tutor-list">
            {students.map((student) => {
              const location = getLocationForStudent(state, student.id);
              return (
                <div key={student.id} className="tutor-list-card">
                  <div className="tutor-section-head">
                    <div>
                      <div className="tutor-list-title">{student.name}</div>
                      <div className="tutor-list-subtitle">{student.groupId ? getOwnerName(state, 'group', student.groupId) : '未分组'}</div>
                    </div>
                    <Tag color={student.online ? 'green' : 'default'}>{student.online ? '在线' : '离线'}</Tag>
                  </div>
                  {location ? (
                    <div className="tutor-stack">
                      <div className="tutor-section-note">{location.address}</div>
                      <div className="tutor-inline-list">
                        <span className="tutor-pill">{location.distanceMeters} 米</span>
                        <span className="tutor-pill">{formatDate(location.updatedAt)}</span>
                        <span className="tutor-pill">
                          坐标 {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
                        </span>
                      </div>
                      <Button icon={<SafetyOutlined />}>打开导航</Button>
                    </div>
                  ) : (
                    <div className="tutor-section-note">暂无位置上报</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="SoS 列表" note="支持查看告警详情并更新处理状态">
        {sosAlerts.length === 0 ? (
          <EmptyBlock text="当前团队暂无 SoS 告警" />
        ) : (
          <div className="tutor-list">
            {sosAlerts.map((alert) => (
              <div key={alert.id} className="tutor-list-card">
                <div className="tutor-section-head">
                  <div>
                    <div className="tutor-list-title">{getOwnerName(state, 'student', alert.studentId)}</div>
                    <div className="tutor-list-subtitle">{formatDate(alert.createdAt)}</div>
                  </div>
                  <Tag color={alert.status === 'resolved' ? 'green' : alert.status === 'tracking' ? 'gold' : 'red'}>
                    {alert.status === 'resolved' ? '已解决' : alert.status === 'tracking' ? '跟进中' : '待处理'}
                  </Tag>
                </div>
                <div className="tutor-stack">
                  <div className="tutor-section-note">{alert.text}</div>
                  <div className="tutor-inline-list">
                    <span className="tutor-pill">{alert.voiceNote}</span>
                    <span className="tutor-pill">{alert.distanceMeters} 米</span>
                  </div>
                  <div className="tutor-section-note">{alert.address}</div>
                  <div className="tutor-actions">
                    <Button onClick={() => actions.updateSosStatus(alert.id, 'new')}>待处理</Button>
                    <Button onClick={() => actions.updateSosStatus(alert.id, 'tracking')}>跟进中</Button>
                    <Button type="primary" onClick={() => actions.updateSosStatus(alert.id, 'resolved')}>
                      标记已解决
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function MePageContent() {
  const { state, actions } = useTutorStore();
  const session = getStoredSession();
  const [messageApi, contextHolder] = message.useMessage();
  const currentTeam = getCurrentTeam(state);
  const reportsCount = state.reports.length;
  const broadcastCount = state.broadcasts.length;
  const photoCount = state.photos.length;
  const sosCount = state.sosAlerts.length;
  const [newEvaluation, setNewEvaluation] = useState('');
  const [newOrganization, setNewOrganization] = useState('');

  const menuGroups = [
    {
      title: '团队协同',
      items: [
        {
          href: '/teams',
          icon: <TeamOutlined />,
          label: '团队管理',
          note: '查看团队列表并进入团队详情',
          value: `${state.teams.length} 个团队`,
        },
        {
          href: currentTeam ? `/teams/${currentTeam.id}/groups` : '/teams',
          icon: <TeamOutlined />,
          label: '小组管理',
          note: '进入当前团队小组配置',
          value: currentTeam ? `${getGroupsByTeam(state, currentTeam.id).length} 个小组` : '选择团队',
        },
      ],
    },
    {
      title: '任务执行',
      items: [
        {
          href: '/tasks',
          icon: <ScheduleOutlined />,
          label: '任务管理',
          note: '学员任务、小组任务、历史复制',
          value: `${state.tasks.length} 个任务`,
        },
        {
          href: '/works',
          icon: <PicCenterOutlined />,
          label: '学员 / 小组 / 作品',
          note: '评分、评价、奖惩分与报告联动',
          value: `${state.workItems.length} 条作品`,
        },
        {
          href: '/ranking',
          icon: <FileTextOutlined />,
          label: '学员排行',
          note: '查看个人任务完成度与得分',
          value: `${state.students.length} 名学员`,
        },
        {
          href: '/ranking',
          icon: <FileTextOutlined />,
          label: '小组排行',
          note: '查看小组进度与小组得分',
          value: `${state.groups.length} 个小组`,
        },
      ],
    },
    {
      title: '内容沟通',
      items: [
        {
          href: '/messages',
          icon: <BellOutlined />,
          label: '消息',
          note: 'SoS、学员问询、系统通知、群组消息',
          value: `${broadcastCount} 条记录`,
        },
        {
          href: '/photos',
          icon: <PicCenterOutlined />,
          label: '照片管理',
          note: '整理团队、小组、学员照片素材',
          value: `${photoCount} 张照片`,
        },
        {
          href: '/reports',
          icon: <FileTextOutlined />,
          label: '研学报告',
          note: '报告生成、模版管理、批量推送',
          value: `${reportsCount} 份报告`,
        },
      ],
    },
    {
      title: '安全与设置',
      items: [
        {
          href: '/safety',
          icon: <SafetyOutlined />,
          label: '安全中心',
          note: '学员位置、SoS 告警与处理状态',
          value: `${sosCount} 条告警`,
        },
      ],
    },
    {
      title: '常用信息',
      items: [
        {
          href: '/reports',
          icon: <FileTextOutlined />,
          label: '研学报告模版管理',
          note: '设置个人模版与图形化配置项',
          value: `${state.reportTemplates.filter((template) => template.owner === 'tutor').length} 个个人模版`,
        },
        {
          href: '/works',
          icon: <FileTextOutlined />,
          label: '个性化评价管理',
          note: '维护常用评语，评价学生时可复用',
          value: `${state.commonEvaluations.length} 条`,
        },
        {
          href: '/teams',
          icon: <TeamOutlined />,
          label: '合作研学机构',
          note: '创建团队时优先展示合作机构',
          value: `${state.partnerOrganizations.length} 个`,
        },
        {
          href: currentTeam ? `/teams/${currentTeam.id}/students` : '/teams',
          icon: <TeamOutlined />,
          label: '常用班级',
          note: '维护班级和学生名单，创建团队时快速带入',
          value: `${state.commonClasses.length} 个班级`,
        },
      ],
    },
  ];

  return (
    <div className="tutor-page">
      {contextHolder}
      <section className="tutor-me-profile">
        <div className="tutor-me-avatar">
          {session?.avatar ? <img alt={session.displayName} src={session.avatar} /> : null}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="tutor-me-name">{session?.displayName ?? '导师'}</div>
          <div className="tutor-me-meta">研学宝 ID：{session?.id ?? 'tutor_demo_user'}</div>
          <div className="tutor-me-meta">所属研学机构：{session?.organizationName ?? '南山实验学校研学中心'}</div>
          <div className="tutor-me-meta">带队导师 · {session?.account ?? 'tutor_demo'}</div>
        </div>
      </section>

      <SectionCard title="导师常用配置" note="常用评语与合作机构会在评价、创建团队时优先复用">
        <div className="tutor-stack">
          <Input.TextArea
            rows={2}
            value={newEvaluation}
            onChange={(event) => setNewEvaluation(event.target.value)}
            placeholder="新增常用个性化评价"
          />
          <Button
            onClick={() => {
              actions.saveCommonEvaluation(newEvaluation);
              setNewEvaluation('');
              messageApi.success('已保存常用个性化评价');
            }}
          >
            保存常用评价
          </Button>
          <Input
            value={newOrganization}
            onChange={(event) => setNewOrganization(event.target.value)}
            placeholder="新增合作研学机构"
          />
          <Button
            onClick={() => {
              actions.addPartnerOrganization(newOrganization);
              setNewOrganization('');
              messageApi.success('已保存合作研学机构');
            }}
          >
            保存合作机构
          </Button>
        </div>
      </SectionCard>

      {menuGroups.map((group) => (
        <section key={group.title} className="tutor-stack" style={{ gap: 10 }}>
          <div className="tutor-me-group-title">{group.title}</div>
          <div className="tutor-menu-group">
            {group.items.map((item) => (
              <Link key={`${group.title}-${item.label}`} href={item.href} className="tutor-menu-item">
                <span className="tutor-menu-item-icon">{item.icon}</span>
                <span className="tutor-menu-item-body">
                  <span className="tutor-menu-item-title">{item.label}</span>
                  <span className="tutor-menu-item-note">{item.note}</span>
                </span>
                {item.value ? <span className="tutor-menu-item-value">{item.value}</span> : null}
                <RightOutlined className="tutor-menu-item-arrow" />
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="tutor-stack" style={{ gap: 10 }}>
        <div className="tutor-me-group-title">账号与设置</div>
        <div className="tutor-menu-group">
          <button
            className="tutor-menu-item tutor-menu-item-button"
            onClick={() => {
              actions.resetSeed();
              messageApi.success('已恢复初始数据');
            }}
          >
            <span className="tutor-menu-item-icon">
              <ReloadOutlined />
            </span>
            <span className="tutor-menu-item-body">
              <span className="tutor-menu-item-title">重置数据</span>
              <span className="tutor-menu-item-note">恢复导师端初始演示数据</span>
            </span>
          </button>
          <button
            className="tutor-menu-item tutor-menu-item-button tutor-menu-item-danger"
            onClick={() => {
              clearSession();
              window.location.href = '/login';
            }}
          >
            <span className="tutor-menu-item-icon tutor-menu-item-icon-danger">
              <LogoutOutlined />
            </span>
            <span className="tutor-menu-item-body">
              <span className="tutor-menu-item-title">退出登录</span>
              <span className="tutor-menu-item-note">退出当前导师账号</span>
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
