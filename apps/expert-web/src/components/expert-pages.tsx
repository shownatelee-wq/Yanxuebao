'use client';

import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  ExperimentOutlined,
  FireOutlined,
  FolderOpenOutlined,
  NotificationOutlined,
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  StopOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Segmented,
  Select,
  Space,
  Switch,
  Tag,
  Upload,
  message,
} from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { clearSession, getStoredSession } from '../lib/api';
import {
  type Challenge,
  type ChallengeInput,
  type ChallengeStatus,
  type CourseInput,
  type CourseStatus,
  type CourseType,
  type KnowledgeEntry,
  type KnowledgeInput,
  type NewsInput,
  type NewsItem,
  type NewsStatus,
  type StoredFileMeta,
  useExpertStore,
} from '../lib/expert-store';

type ContentTabKey = 'qa' | 'knowledge' | 'news' | 'challenges' | 'reviews';

const CONTENT_TABS: Array<{ label: string; value: ContentTabKey }> = [
  { label: '问答记录', value: 'qa' },
  { label: '知识库', value: 'knowledge' },
  { label: '资讯', value: 'news' },
  { label: '难题挑战', value: 'challenges' },
  { label: '作品审核', value: 'reviews' },
];

function sectionTitleWithCount(title: string, count: number) {
  return (
    <span>
      {title}
      <small style={{ marginLeft: 8, color: 'var(--expert-text-subtle)' }}>{count}</small>
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return '待安排';
  }
  return value.replace('T', ' ').slice(0, 16);
}

function formatPrice(price: number) {
  return `¥${price.toFixed(0)}`;
}

function joinLines(lines?: string[]) {
  return lines?.filter(Boolean).join('\n') ?? '';
}

function parseListText(value?: string) {
  return (value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTagText(value?: string) {
  return (value ?? '')
    .split(/[,\n、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseChapterText(value?: string) {
  return parseListText(value).map((line) => {
    const [title, duration, summary] = line.split('|').map((part) => part.trim());
    return {
      title: title || '未命名章节',
      duration: duration || '待定',
      summary: summary || '待补充章节说明',
    };
  });
}

function bytesToSizeLabel(size?: number) {
  if (!size) {
    return '未记录';
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function storedFilesToUploadFiles(files: StoredFileMeta[]): UploadFile[] {
  return files.map((file) => ({
    uid: file.id,
    name: file.name,
    status: 'done',
    type: file.type,
  }));
}

function uploadFilesToStoredFiles(fileList: UploadFile[], existingFiles: StoredFileMeta[]) {
  return fileList.map((file) => {
    const matched = existingFiles.find((item) => item.id === file.uid);
    if (matched) {
      return matched;
    }
    return {
      id: `file_${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      sizeLabel: bytesToSizeLabel(file.originFileObj?.size ?? file.size),
      type: file.type ?? file.originFileObj?.type ?? 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
    } satisfies StoredFileMeta;
  });
}

function getCourseStatusMeta(status: CourseStatus) {
  switch (status) {
    case 'draft':
      return { label: '草稿', color: 'default' as const };
    case 'pending_review':
      return { label: '待审核', color: 'processing' as const };
    case 'published':
      return { label: '已上架', color: 'success' as const };
    case 'unpublished':
      return { label: '已下架', color: 'warning' as const };
    case 'ended':
      return { label: '已结束', color: 'default' as const };
  }
}

function getNewsStatusMeta(status: NewsStatus) {
  switch (status) {
    case 'collected':
      return { label: '采集池', color: 'default' as const };
    case 'editing':
      return { label: '编辑中', color: 'processing' as const };
    case 'published':
      return { label: '已发布', color: 'success' as const };
  }
}

function getChallengeStatusMeta(status: ChallengeStatus) {
  switch (status) {
    case 'draft':
      return { label: '草稿', color: 'default' as const };
    case 'ready':
      return { label: '待发布', color: 'processing' as const };
    case 'published':
      return { label: '已发布', color: 'success' as const };
    case 'ended':
      return { label: '已结束', color: 'default' as const };
  }
}

function SectionCard({
  title,
  note,
  extra,
  children,
}: {
  title: React.ReactNode;
  note?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="expert-card">
      <div className="expert-section-head">
        <div>
          <div className="expert-section-title">{title}</div>
          {note ? <div className="expert-section-note">{note}</div> : null}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ description }: { description: string }) {
  return (
    <div className="expert-empty-state">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
    </div>
  );
}

function CourseEditorModal({
  open,
  editingCourse,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  editingCourse?: CourseInput | null;
  onCancel: () => void;
  onSubmit: (input: CourseInput) => void;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      return;
    }
    form.setFieldsValue({
      title: editingCourse?.title ?? '',
      type: editingCourse?.type ?? 'online',
      format: editingCourse?.format ?? '视频课程',
      summary: editingCourse?.summary ?? '',
      ageRange: editingCourse?.ageRange ?? '8-14岁',
      price: editingCourse?.price ?? 199,
      discountPrice: editingCourse?.discountPrice,
      cover: editingCourse?.cover ?? '',
      chaptersText:
        editingCourse?.chapters.map((item) => `${item.title} | ${item.duration} | ${item.summary}`).join('\n') ?? '',
      location: editingCourse?.location,
      scheduleText: joinLines(editingCourse?.sessionSchedule),
      enrollmentLimit: editingCourse?.enrollmentLimit,
    });
  }, [editingCourse, form, open]);

  return (
    <Modal
      destroyOnClose
      open={open}
      title={editingCourse?.id ? '编辑课程' : '新建课程'}
      okText="保存课程"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={420}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit({
            id: editingCourse?.id,
            title: values.title.trim(),
            type: values.type,
            format: values.format.trim(),
            summary: values.summary.trim(),
            ageRange: values.ageRange.trim(),
            price: Number(values.price),
            discountPrice: values.discountPrice ? Number(values.discountPrice) : undefined,
            cover: values.cover.trim(),
            chapters: parseChapterText(values.chaptersText),
            location: values.location?.trim(),
            sessionSchedule: parseListText(values.scheduleText),
            enrollmentLimit: values.enrollmentLimit ? Number(values.enrollmentLimit) : undefined,
          });
          form.resetFields();
        }}
      >
        <Form.Item label="课程名称" name="title" rules={[{ required: true, message: '请输入课程名称' }]}>
          <Input placeholder="输入课程名称" />
        </Form.Item>
        <div className="expert-form-grid">
          <Form.Item label="课程类型" name="type" rules={[{ required: true, message: '请选择课程类型' }]}>
            <Select
              options={[
                { label: '线上课程', value: 'online' },
                { label: '线下课程', value: 'offline' },
              ]}
            />
          </Form.Item>
          <Form.Item label="课程形式" name="format" rules={[{ required: true, message: '请输入课程形式' }]}>
            <Input placeholder="例如 视频课程 / 线下活动" />
          </Form.Item>
        </div>
        <Form.Item label="课程简介" name="summary" rules={[{ required: true, message: '请输入课程简介' }]}>
          <Input.TextArea rows={3} placeholder="输入课程简介" />
        </Form.Item>
        <div className="expert-form-grid">
          <Form.Item label="适用年龄" name="ageRange" rules={[{ required: true, message: '请输入适用年龄' }]}>
            <Input placeholder="例如 8-14岁" />
          </Form.Item>
          <Form.Item label="课程封面说明" name="cover" rules={[{ required: true, message: '请输入封面描述' }]}>
            <Input placeholder="输入课程封面主题" />
          </Form.Item>
        </div>
        <div className="expert-form-grid">
          <Form.Item label="定价" name="price" rules={[{ required: true, message: '请输入课程价格' }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={0} />
          </Form.Item>
          <Form.Item label="折扣价" name="discountPrice">
            <InputNumber style={{ width: '100%' }} min={0} precision={0} />
          </Form.Item>
        </div>
        <Form.Item label="章节 / 场次" name="chaptersText">
          <Input.TextArea rows={4} placeholder="每行一个章节，格式：标题 | 时长 | 摘要" />
        </Form.Item>
        <Form.Item label="活动地点" name="location">
          <Input placeholder="线下课程可填写地点" />
        </Form.Item>
        <div className="expert-form-grid">
          <Form.Item label="活动排期" name="scheduleText">
            <Input.TextArea rows={3} placeholder="每行一个场次，例如 2026-05-01 09:30" />
          </Form.Item>
          <Form.Item label="人数上限" name="enrollmentLimit">
            <InputNumber style={{ width: '100%' }} min={1} precision={0} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

function KnowledgeEditorModal({
  open,
  editingEntry,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  editingEntry?: KnowledgeEntry | null;
  onCancel: () => void;
  onSubmit: (input: KnowledgeInput) => void;
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    form.setFieldsValue({
      question: editingEntry?.question ?? '',
      answer: editingEntry?.answer ?? '',
      tagsText: editingEntry?.tags.join('、') ?? '',
      source: editingEntry?.source ?? 'manual',
    });
    setFileList(storedFilesToUploadFiles(editingEntry?.assets ?? []));
  }, [editingEntry, form, open]);

  return (
    <Modal
      destroyOnClose
      open={open}
      title={editingEntry?.id ? '编辑知识条目' : '新增知识条目'}
      okText="保存条目"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={420}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit({
            id: editingEntry?.id,
            question: values.question.trim(),
            answer: values.answer.trim(),
            tags: parseTagText(values.tagsText),
            source: values.source,
            assets: uploadFilesToStoredFiles(fileList, editingEntry?.assets ?? []),
          });
          form.resetFields();
          setFileList([]);
        }}
      >
        <Form.Item label="问题" name="question" rules={[{ required: true, message: '请输入问题' }]}>
          <Input placeholder="输入问题" />
        </Form.Item>
        <Form.Item label="标准答案" name="answer" rules={[{ required: true, message: '请输入标准答案' }]}>
          <Input.TextArea rows={5} placeholder="输入标准答案" />
        </Form.Item>
        <div className="expert-form-grid">
          <Form.Item label="知识标签" name="tagsText">
            <Input placeholder="多个标签请用顿号或换行分隔" />
          </Form.Item>
          <Form.Item label="来源" name="source">
            <Select
              options={[
                { label: '手动录入', value: 'manual' },
                { label: '问答沉淀', value: 'qa' },
                { label: '文档解析', value: 'document' },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item label="资料附件">
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            multiple
            onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
          >
            <Button icon={<UploadOutlined />}>添加文档资料</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

function NewsEditorModal({
  open,
  editingItem,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  editingItem?: NewsItem | null;
  onCancel: () => void;
  onSubmit: (input: NewsInput) => void;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      return;
    }
    form.setFieldsValue({
      title: editingItem?.title ?? '',
      summary: editingItem?.summary ?? '',
      source: editingItem?.source ?? '',
      category: editingItem?.category ?? '',
      content: editingItem?.content ?? '',
      keywordsText: editingItem?.keywords.join('、') ?? '',
      publishAt: editingItem?.publishAt ?? '',
      featured: editingItem?.featured ?? false,
    });
  }, [editingItem, form, open]);

  return (
    <Modal
      destroyOnClose
      open={open}
      title={editingItem?.id ? '编辑资讯' : '新增资讯'}
      okText="保存资讯"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={420}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit({
            id: editingItem?.id,
            title: values.title.trim(),
            summary: values.summary.trim(),
            source: values.source.trim(),
            category: values.category.trim(),
            content: values.content.trim(),
            keywords: parseTagText(values.keywordsText),
            publishAt: values.publishAt.trim(),
            featured: Boolean(values.featured),
          });
          form.resetFields();
        }}
      >
        <Form.Item label="资讯标题" name="title" rules={[{ required: true, message: '请输入资讯标题' }]}>
          <Input placeholder="输入资讯标题" />
        </Form.Item>
        <Form.Item label="摘要" name="summary" rules={[{ required: true, message: '请输入资讯摘要' }]}>
          <Input.TextArea rows={3} placeholder="输入资讯摘要" />
        </Form.Item>
        <div className="expert-form-grid">
          <Form.Item label="来源" name="source" rules={[{ required: true, message: '请输入资讯来源' }]}>
            <Input placeholder="输入资讯来源" />
          </Form.Item>
          <Form.Item label="分类" name="category" rules={[{ required: true, message: '请输入资讯分类' }]}>
            <Input placeholder="输入资讯分类" />
          </Form.Item>
        </div>
        <Form.Item label="正文" name="content" rules={[{ required: true, message: '请输入资讯正文' }]}>
          <Input.TextArea rows={5} placeholder="输入资讯正文" />
        </Form.Item>
        <Form.Item label="关键词" name="keywordsText">
          <Input placeholder="多个关键词请用顿号或换行分隔" />
        </Form.Item>
        <div className="expert-form-grid">
          <Form.Item label="发布时间" name="publishAt" rules={[{ required: true, message: '请输入发布时间' }]}>
            <Input placeholder="例如 2026-04-22 09:00" />
          </Form.Item>
          <Form.Item label="精选资讯" name="featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

function ChallengeEditorModal({
  open,
  editingItem,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  editingItem?: Challenge | null;
  onCancel: () => void;
  onSubmit: (input: ChallengeInput) => void;
}) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    form.setFieldsValue({
      title: editingItem?.title ?? '',
      summary: editingItem?.summary ?? '',
      description: editingItem?.description ?? '',
      difficulty: editingItem?.difficulty ?? '中级',
      tagsText: editingItem?.tags.join('、') ?? '',
      referencesText: editingItem?.references.join('\n') ?? '',
    });
    setFileList(storedFilesToUploadFiles(editingItem?.attachments ?? []));
  }, [editingItem, form, open]);

  return (
    <Modal
      destroyOnClose
      open={open}
      title={editingItem?.id ? '编辑难题挑战' : '新增难题挑战'}
      okText="保存挑战"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={420}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit({
            id: editingItem?.id,
            title: values.title.trim(),
            summary: values.summary.trim(),
            description: values.description.trim(),
            difficulty: values.difficulty,
            tags: parseTagText(values.tagsText),
            references: parseListText(values.referencesText),
            attachments: uploadFilesToStoredFiles(fileList, editingItem?.attachments ?? []),
          });
          form.resetFields();
          setFileList([]);
        }}
      >
        <Form.Item label="挑战标题" name="title" rules={[{ required: true, message: '请输入挑战标题' }]}>
          <Input placeholder="输入挑战标题" />
        </Form.Item>
        <Form.Item label="挑战摘要" name="summary" rules={[{ required: true, message: '请输入挑战摘要' }]}>
          <Input.TextArea rows={3} placeholder="输入挑战摘要" />
        </Form.Item>
        <Form.Item label="详细描述" name="description" rules={[{ required: true, message: '请输入详细描述' }]}>
          <Input.TextArea rows={5} placeholder="输入详细描述" />
        </Form.Item>
        <div className="expert-form-grid">
          <Form.Item label="难度等级" name="difficulty">
            <Select
              options={[
                { label: '初级', value: '初级' },
                { label: '中级', value: '中级' },
                { label: '高级', value: '高级' },
              ]}
            />
          </Form.Item>
          <Form.Item label="挑战标签" name="tagsText">
            <Input placeholder="多个标签请用顿号或换行分隔" />
          </Form.Item>
        </div>
        <Form.Item label="参考资料 / 链接" name="referencesText">
          <Input.TextArea rows={3} placeholder="每行填写一条参考资料" />
        </Form.Item>
        <Form.Item label="附件资料">
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            multiple
            onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
          >
            <Button icon={<UploadOutlined />}>添加参考附件</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

function ReviewEditorModal({
  open,
  initialScore,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  initialScore: number;
  onCancel: () => void;
  onSubmit: (values: { finalScore: number; growthReward: number; comment: string }) => void;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      return;
    }
    form.setFieldsValue({
      finalScore: initialScore,
      growthReward: 60,
      comment: '',
    });
  }, [form, initialScore, open]);

  return (
    <Modal
      destroyOnClose
      open={open}
      title="审核挑战作品"
      okText="完成审核"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={420}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit({
            finalScore: Number(values.finalScore),
            growthReward: Number(values.growthReward),
            comment: values.comment.trim(),
          });
          form.resetFields();
        }}
      >
        <div className="expert-form-grid">
          <Form.Item label="专家确认分" name="finalScore" rules={[{ required: true, message: '请输入确认分' }]}>
            <InputNumber style={{ width: '100%' }} min={0} max={100} precision={0} />
          </Form.Item>
          <Form.Item label="成长值奖励" name="growthReward" rules={[{ required: true, message: '请输入成长值奖励' }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={0} />
          </Form.Item>
        </div>
        <Form.Item label="审核意见" name="comment" rules={[{ required: true, message: '请输入审核意见' }]}>
          <Input.TextArea rows={4} placeholder="输入审核意见" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function ExpertDashboardPage() {
  const { state, metrics } = useExpertStore();
  const unresolvedQaCount = state.qaRecords.filter((item) => item.status === 'unresolved').length;
  const pendingSubmissions = state.submissions.filter((item) => item.status === 'pending').length;
  const editingNewsCount = state.newsItems.filter((item) => item.status !== 'published').length;
  const readyChallenges = state.challenges.filter((item) => item.status === 'ready').length;

  const todos = [
    { id: 'todo_qa', label: '补充未匹配问答', count: unresolvedQaCount, href: '/content?tab=qa', icon: SearchOutlined },
    { id: 'todo_review', label: '审核挑战作品', count: pendingSubmissions, href: '/content?tab=reviews', icon: CheckCircleOutlined },
    { id: 'todo_news', label: '处理待发布资讯', count: editingNewsCount, href: '/content?tab=news', icon: NotificationOutlined },
    { id: 'todo_challenge', label: '安排挑战上线', count: readyChallenges, href: '/content?tab=challenges', icon: FireOutlined },
  ].filter((item) => item.count > 0);

  return (
    <div className="expert-page">
      <section className="expert-hero">
        <div className="expert-hero-main">
          <div className="expert-hero-head">
            <Avatar size={54} className="expert-hero-avatar">
              {state.agent.avatar}
            </Avatar>
            <div>
              <p className="expert-hero-eyebrow">当前负责领域</p>
              <h2>{state.agent.name}</h2>
              <span>海洋生态与创新教育 · 主智能体已{state.agent.status === 'published' ? '上线' : '暂停'}</span>
            </div>
          </div>
          <p className="expert-hero-text">
            课程、问答、知识库、资讯和难题挑战都在同一条业务链路中联动，重点问题处理后会立即回写工作台。
          </p>
        </div>
        <div className="expert-hero-side">
          <div className="expert-hero-chip">
            <RobotOutlined />
            <span>累计问答 {state.agent.totalQaCount}</span>
          </div>
          <div className="expert-hero-chip">
            <BookOutlined />
            <span>课程销售额 ¥{state.courses.reduce((sum, item) => sum + item.revenue, 0).toFixed(0)}</span>
          </div>
        </div>
      </section>

      <section className="expert-metric-grid">
        {metrics.map((metric) => (
          <div key={metric.id} className={`expert-metric expert-metric-${metric.tone}`}>
            <span>{metric.label}</span>
            <strong>
              {metric.value}
              {metric.suffix ?? ''}
            </strong>
          </div>
        ))}
      </section>

      <SectionCard
        title="待处理事项"
        note="高频事务会根据问答、资讯、挑战和作品状态自动联动更新。"
        extra={<Tag color="processing">{todos.length} 项进行中</Tag>}
      >
        {todos.length ? (
          <div className="expert-list">
            {todos.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.id} href={item.href} className="expert-list-card expert-list-link">
                  <span className="expert-list-icon">
                    <Icon />
                  </span>
                  <div className="expert-list-main">
                    <strong>{item.label}</strong>
                    <span>当前有 {item.count} 项待处理</span>
                  </div>
                  <Tag color="warning">{item.count}</Tag>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState description="当前没有待处理事项" />
        )}
      </SectionCard>

      <SectionCard title="快捷入口" note="围绕专家端 V1 核心业务的高频操作">
        <div className="expert-actions-grid">
          <Link href="/courses" className="expert-action-tile">
            <BookOutlined />
            <strong>课程管理</strong>
            <span>新增课程、调整上架和查看数据</span>
          </Link>
          <Link href="/content?tab=qa" className="expert-action-tile">
            <SearchOutlined />
            <strong>补充问答</strong>
            <span>快速处理未匹配问题并沉淀知识</span>
          </Link>
          <Link href="/content?tab=knowledge" className="expert-action-tile">
            <FolderOpenOutlined />
            <strong>知识库维护</strong>
            <span>录入资料、修订条目和回退版本</span>
          </Link>
          <Link href="/content?tab=reviews" className="expert-action-tile">
            <CheckCircleOutlined />
            <strong>作品审核</strong>
            <span>确认挑战作品分值与成长值</span>
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="最近动态" note="展示最新的业务动作，方便快速回看链路变化。">
        <div className="expert-list">
          {state.logs.slice(0, 5).map((item) => (
            <div key={item.id} className="expert-list-card">
              <div className="expert-inline">
                <Tag color="blue">{item.action}</Tag>
                <span className="expert-list-time">{formatDate(item.createdAt)}</span>
              </div>
              <strong>{item.detail}</strong>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertCoursesPage() {
  const { state, saveCourse, setCourseStatus } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CourseType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CourseStatus>('all');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(state.courses[0]?.id ?? null);

  const editingCourse = useMemo(() => {
    const target = state.courses.find((item) => item.id === editingCourseId);
    if (!target) {
      return null;
    }
    return {
      id: target.id,
      title: target.title,
      type: target.type,
      format: target.format,
      summary: target.summary,
      ageRange: target.ageRange,
      price: target.price,
      discountPrice: target.discountPrice,
      cover: target.cover,
      chapters: target.chapters,
      location: target.location,
      sessionSchedule: target.sessionSchedule,
      enrollmentLimit: target.enrollmentLimit,
    } satisfies CourseInput;
  }, [editingCourseId, state.courses]);

  const filteredCourses = useMemo(
    () =>
      state.courses.filter((course) => {
        if (typeFilter !== 'all' && course.type !== typeFilter) {
          return false;
        }
        if (statusFilter !== 'all' && course.status !== statusFilter) {
          return false;
        }
        if (!searchValue.trim()) {
          return true;
        }
        const keyword = searchValue.trim();
        return course.title.includes(keyword) || course.summary.includes(keyword);
      }),
    [searchValue, state.courses, statusFilter, typeFilter],
  );

  function handleCourseSave(input: CourseInput) {
    saveCourse(input);
    setEditingCourseId(null);
    messageApi.success(input.id ? '课程已更新' : '课程已加入列表');
  }

  function renderCourseActions(courseId: string, status: CourseStatus) {
    if (status === 'draft') {
      return (
        <Button size="small" icon={<SendOutlined />} onClick={() => setCourseStatus(courseId, 'pending_review')}>
          提交审核
        </Button>
      );
    }
    if (status === 'pending_review') {
      return (
        <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => setCourseStatus(courseId, 'published')}>
          确认上架
        </Button>
      );
    }
    if (status === 'published') {
      return (
        <Space size={8}>
          <Button size="small" icon={<StopOutlined />} onClick={() => setCourseStatus(courseId, 'unpublished')}>
            下架
          </Button>
          <Button size="small" icon={<ClockCircleOutlined />} onClick={() => setCourseStatus(courseId, 'ended')}>
            结束
          </Button>
        </Space>
      );
    }
    if (status === 'unpublished') {
      return (
        <Button size="small" type="primary" icon={<SyncOutlined />} onClick={() => setCourseStatus(courseId, 'published')}>
          重新上架
        </Button>
      );
    }
    return (
      <Button size="small" icon={<ReloadOutlined />} onClick={() => setCourseStatus(courseId, 'draft')}>
        回到草稿
      </Button>
    );
  }

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard
        title="课程筛选"
        note="支持线上 / 线下课程统筹管理，详情卡片里直接查看经营数据看板。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditingCourseId('')}>
            新建课程
          </Button>
        }
      >
        <div className="expert-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索课程名称或摘要"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Segmented
            value={typeFilter}
            options={[
              { label: '全部课程', value: 'all' },
              { label: '线上课程', value: 'online' },
              { label: '线下课程', value: 'offline' },
            ]}
            onChange={(value) => setTypeFilter(value as 'all' | CourseType)}
          />
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { label: '全部状态', value: 'all' },
              { label: '草稿', value: 'draft' },
              { label: '待审核', value: 'pending_review' },
              { label: '已上架', value: 'published' },
              { label: '已下架', value: 'unpublished' },
              { label: '已结束', value: 'ended' },
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title={sectionTitleWithCount('课程列表', filteredCourses.length)} note="点击课程卡片可以展开经营数据、章节与场次信息。">
        {filteredCourses.length ? (
          <div className="expert-list">
            {filteredCourses.map((course) => {
              const meta = getCourseStatusMeta(course.status);
              const expanded = expandedCourseId === course.id;
              const averageCompletion = course.views ? Math.min(100, Math.round((course.sales / course.views) * 1000)) / 10 : 0;
              return (
                <div key={course.id} className="expert-list-card expert-surface-card">
                  <div className="expert-inline expert-space-between">
                    <div>
                      <strong>{course.title}</strong>
                      <div className="expert-list-subtle">{course.summary}</div>
                    </div>
                    <Tag color={meta.color}>{meta.label}</Tag>
                  </div>
                  <div className="expert-inline expert-wrap">
                    <Tag>{course.type === 'online' ? '线上课程' : '线下课程'}</Tag>
                    <Tag>{course.format}</Tag>
                    <Tag>{course.ageRange}</Tag>
                    <Tag color="gold">{formatPrice(course.price)}</Tag>
                    {course.discountPrice ? <Tag color="green">{`活动价 ${formatPrice(course.discountPrice)}`}</Tag> : null}
                  </div>
                  <div className="expert-inline expert-space-between">
                    <span className="expert-list-subtle">更新时间 {formatDate(course.updatedAt)}</span>
                    <Space size={8}>
                      <Button size="small" icon={<EditOutlined />} onClick={() => setEditingCourseId(course.id)}>
                        编辑
                      </Button>
                      <Button size="small" onClick={() => setExpandedCourseId(expanded ? null : course.id)}>
                        {expanded ? '收起看板' : '查看看板'}
                      </Button>
                    </Space>
                  </div>
                  <div className="expert-inline expert-space-between expert-top-gap">
                    {renderCourseActions(course.id, course.status)}
                    <span className="expert-list-subtle">{course.cover}</span>
                  </div>

                  {expanded ? (
                    <div className="expert-detail-panel">
                      <div className="expert-stats-grid">
                        <div className="expert-stat-card">
                          <span>累计浏览</span>
                          <strong>{course.views}</strong>
                        </div>
                        <div className="expert-stat-card">
                          <span>累计销售</span>
                          <strong>{course.sales}</strong>
                        </div>
                        <div className="expert-stat-card">
                          <span>累计销售额</span>
                          <strong>{`¥${course.revenue.toFixed(0)}`}</strong>
                        </div>
                      </div>
                      <div className="expert-progress-panel">
                        <div className="expert-inline expert-space-between">
                          <span>浏览转化指数</span>
                          <strong>{averageCompletion}%</strong>
                        </div>
                        <Progress percent={averageCompletion} showInfo={false} strokeColor="#0f766e" />
                      </div>
                      <div className="expert-trend-chart">
                        {course.trends.map((trend) => (
                          <div key={trend.label} className="expert-trend-item">
                            <div
                              className="expert-trend-bar"
                              style={{ height: `${Math.max(18, trend.value * 1.6)}px` }}
                            />
                            <span>{trend.label}</span>
                          </div>
                        ))}
                      </div>
                      {course.chapters.length ? (
                        <div className="expert-stack expert-top-gap">
                          <span className="expert-list-subtle">章节 / 课时</span>
                          {course.chapters.map((chapter) => (
                            <div key={chapter.id} className="expert-chip-card">
                              <strong>{chapter.title}</strong>
                              <span>{chapter.duration}</span>
                              <small>{chapter.summary}</small>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {course.type === 'offline' ? (
                        <div className="expert-detail-meta">
                          <div>
                            <span>活动地点</span>
                            <strong>{course.location ?? '待补充'}</strong>
                          </div>
                          <div>
                            <span>人数上限</span>
                            <strong>{course.enrollmentLimit ?? '待补充'}</strong>
                          </div>
                          <div>
                            <span>活动排期</span>
                            <strong>{course.sessionSchedule?.join(' / ') || '待补充'}</strong>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState description="没有符合筛选条件的课程" />
        )}
      </SectionCard>

      <CourseEditorModal
        open={editingCourseId !== null}
        editingCourse={editingCourse}
        onCancel={() => setEditingCourseId(null)}
        onSubmit={handleCourseSave}
      />
    </div>
  );
}

function QaTab() {
  const { state, supplementQa } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchValue, setSearchValue] = useState('');
  const [matchFilter, setMatchFilter] = useState<'unresolved' | 'all'>('unresolved');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const editingRecord = state.qaRecords.find((item) => item.id === editingRecordId) ?? null;
  const filteredRecords = state.qaRecords.filter((record) => {
    if (matchFilter === 'unresolved' && record.status !== 'unresolved') {
      return false;
    }
    if (!searchValue.trim()) {
      return true;
    }
    const keyword = searchValue.trim();
    return (
      record.studentName.includes(keyword) ||
      record.studentId.includes(keyword) ||
      record.question.includes(keyword) ||
      record.agentName.includes(keyword)
    );
  });

  useEffect(() => {
    if (!editingRecord) {
      return;
    }
    form.setFieldsValue({
      answer: editingRecord.replySummary,
      tagsText: editingRecord.tags.join('、'),
    });
  }, [editingRecord, form]);

  return (
    <>
      {contextHolder}
      <SectionCard
        title={sectionTitleWithCount('问答记录', filteredRecords.length)}
        note="默认优先处理未匹配知识库的问题，补充答案后会自动沉淀到知识库。"
      >
        <div className="expert-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="按学员、学员 ID、问题或智能体搜索"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Segmented
            value={matchFilter}
            options={[
              { label: '优先未匹配', value: 'unresolved' },
              { label: '全部问答', value: 'all' },
            ]}
            onChange={(value) => setMatchFilter(value as 'unresolved' | 'all')}
          />
        </div>
        {filteredRecords.length ? (
          <div className="expert-list">
            {filteredRecords.map((record) => (
              <div key={record.id} className="expert-list-card expert-surface-card">
                <div className="expert-inline expert-space-between">
                  <div>
                    <strong>{record.studentName}</strong>
                    <span className="expert-list-subtle">
                      {record.studentId} · {record.agentName}
                    </span>
                  </div>
                  <Tag color={record.status === 'unresolved' ? 'warning' : 'success'}>
                    {record.status === 'unresolved' ? '待补充' : '已处理'}
                  </Tag>
                </div>
                <p className="expert-paragraph">{record.question}</p>
                <p className="expert-note-box">{record.replySummary}</p>
                <div className="expert-inline expert-wrap">
                  {record.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
                <div className="expert-inline expert-space-between expert-top-gap">
                  <span className="expert-list-subtle">{formatDate(record.askedAt)}</span>
                  <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => setEditingRecordId(record.id)}>
                    补充答案
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState description="当前没有匹配到的问答记录" />
        )}
      </SectionCard>

      <Modal
        destroyOnClose
        open={Boolean(editingRecord)}
        title="补充标准答案"
        okText="同步知识库"
        cancelText="取消"
        onCancel={() => setEditingRecordId(null)}
        onOk={() => form.submit()}
        width={420}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (!editingRecord) {
              return;
            }
            supplementQa(editingRecord.id, values.answer.trim(), parseTagText(values.tagsText));
            setEditingRecordId(null);
            messageApi.success('答案已同步到知识库');
          }}
        >
          <Form.Item label="问题">
            <div className="expert-static-box">{editingRecord?.question}</div>
          </Form.Item>
          <Form.Item label="标准答案" name="answer" rules={[{ required: true, message: '请输入标准答案' }]}>
            <Input.TextArea rows={5} placeholder="输入面向学员的标准答案" />
          </Form.Item>
          <Form.Item label="知识标签" name="tagsText">
            <Input placeholder="多个标签请用顿号或换行分隔" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function KnowledgeTab() {
  const { state, archiveKnowledgeEntry, restoreKnowledgeRevision, saveKnowledgeEntry } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchValue, setSearchValue] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const editingEntry = state.knowledgeEntries.find((item) => item.id === editingEntryId) ?? null;
  const filteredEntries = state.knowledgeEntries.filter((entry) => {
    if (!searchValue.trim()) {
      return true;
    }
    const keyword = searchValue.trim();
    return entry.question.includes(keyword) || entry.answer.includes(keyword) || entry.tags.some((tag) => tag.includes(keyword));
  });

  return (
    <>
      {contextHolder}
      <SectionCard
        title={sectionTitleWithCount('知识库条目', filteredEntries.length)}
        note="支持手动录入、资料上传、修订和版本回退，停用条目后会从当前绑定范围移出。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditingEntryId('')}>
            新增条目
          </Button>
        }
      >
        <div className="expert-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索问题、答案或标签"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
        {filteredEntries.length ? (
          <div className="expert-list">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="expert-list-card expert-surface-card">
                <div className="expert-inline expert-space-between">
                  <strong>{entry.question}</strong>
                  <Tag color={entry.status === 'active' ? 'success' : 'default'}>
                    {entry.status === 'active' ? '生效中' : '已停用'}
                  </Tag>
                </div>
                <p className="expert-paragraph">{entry.answer}</p>
                <div className="expert-inline expert-wrap">
                  {entry.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                  <Tag color="blue">{entry.source === 'manual' ? '手动录入' : entry.source === 'qa' ? '问答沉淀' : '资料解析'}</Tag>
                </div>
                {entry.assets.length ? (
                  <div className="expert-chip-grid">
                    {entry.assets.map((asset) => (
                      <div key={asset.id} className="expert-chip-card">
                        <strong>{asset.name}</strong>
                        <span>{asset.sizeLabel}</span>
                        <small>{asset.type}</small>
                      </div>
                    ))}
                  </div>
                ) : null}
                {entry.revisions.length ? (
                  <div className="expert-revision-list">
                    {entry.revisions.slice(0, 2).map((revision) => (
                      <button
                        key={revision.id}
                        type="button"
                        className="expert-revision-item"
                        onClick={() => {
                          restoreKnowledgeRevision(entry.id, revision.id);
                          messageApi.success('已回退到所选版本');
                        }}
                      >
                        <span>{revision.note}</span>
                        <small>{formatDate(revision.updatedAt)}</small>
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="expert-inline expert-space-between expert-top-gap">
                  <span className="expert-list-subtle">{formatDate(entry.updatedAt)}</span>
                  <Space size={8}>
                    <Button size="small" icon={<EditOutlined />} onClick={() => setEditingEntryId(entry.id)}>
                      编辑
                    </Button>
                    {entry.status === 'active' ? (
                      <Button
                        size="small"
                        icon={<StopOutlined />}
                        onClick={() => {
                          archiveKnowledgeEntry(entry.id);
                          messageApi.success('条目已停用');
                        }}
                      >
                        停用
                      </Button>
                    ) : null}
                  </Space>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState description="当前没有符合筛选条件的知识条目" />
        )}
      </SectionCard>

      <KnowledgeEditorModal
        open={editingEntryId !== null}
        editingEntry={editingEntry}
        onCancel={() => setEditingEntryId(null)}
        onSubmit={(input) => {
          saveKnowledgeEntry(input);
          setEditingEntryId(null);
          messageApi.success(input.id ? '知识条目已更新' : '知识条目已新增');
        }}
      />
    </>
  );
}

function NewsTab() {
  const { state, saveNewsItem, setNewsStatus } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [statusFilter, setStatusFilter] = useState<'all' | NewsStatus>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const editingItem = state.newsItems.find((item) => item.id === editingItemId) ?? null;
  const filteredItems = state.newsItems.filter((item) => statusFilter === 'all' || item.status === statusFilter);

  return (
    <>
      {contextHolder}
      <SectionCard
        title={sectionTitleWithCount('资讯列表', filteredItems.length)}
        note="资讯按采集池、编辑中和已发布三段状态流转，只有已发布资讯会进入学员侧。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditingItemId('')}>
            新增资讯
          </Button>
        }
      >
        <div className="expert-toolbar">
          <Segmented
            value={statusFilter}
            options={[
              { label: '全部资讯', value: 'all' },
              { label: '采集池', value: 'collected' },
              { label: '编辑中', value: 'editing' },
              { label: '已发布', value: 'published' },
            ]}
            onChange={(value) => setStatusFilter(value as 'all' | NewsStatus)}
          />
        </div>
        {filteredItems.length ? (
          <div className="expert-list">
            {filteredItems.map((item) => {
              const meta = getNewsStatusMeta(item.status);
              return (
                <div key={item.id} className="expert-list-card expert-surface-card">
                  <div className="expert-inline expert-space-between">
                    <div>
                      <strong>{item.title}</strong>
                      <span className="expert-list-subtle">
                        {item.source} · {item.category}
                      </span>
                    </div>
                    <Tag color={meta.color}>{meta.label}</Tag>
                  </div>
                  <p className="expert-paragraph">{item.summary}</p>
                  <p className="expert-note-box">{item.content}</p>
                  <div className="expert-inline expert-wrap">
                    {item.keywords.map((keyword) => (
                      <Tag key={keyword}>{keyword}</Tag>
                    ))}
                    {item.featured ? <Tag color="gold">精选资讯</Tag> : null}
                  </div>
                  <div className="expert-inline expert-space-between expert-top-gap">
                    <span className="expert-list-subtle">计划下发 {item.publishAt}</span>
                    <Space size={8}>
                      <Button size="small" icon={<EditOutlined />} onClick={() => setEditingItemId(item.id)}>
                        编辑
                      </Button>
                      {item.status !== 'editing' ? (
                        <Button size="small" onClick={() => setNewsStatus(item.id, 'editing')}>
                          进入编辑
                        </Button>
                      ) : null}
                      {item.status !== 'published' ? (
                        <Button size="small" type="primary" onClick={() => setNewsStatus(item.id, 'published')}>
                          发布
                        </Button>
                      ) : (
                        <Button size="small" icon={<ReloadOutlined />} onClick={() => setNewsStatus(item.id, 'editing')}>
                          撤回
                        </Button>
                      )}
                    </Space>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState description="当前没有该状态的资讯" />
        )}
      </SectionCard>

      <NewsEditorModal
        open={editingItemId !== null}
        editingItem={editingItem}
        onCancel={() => setEditingItemId(null)}
        onSubmit={(input) => {
          saveNewsItem(input);
          setEditingItemId(null);
          messageApi.success(input.id ? '资讯已更新' : '资讯已加入采集池');
        }}
      />
    </>
  );
}

function ChallengesTab() {
  const { state, saveChallenge, setChallengeStatus } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const editingItem = state.challenges.find((item) => item.id === editingItemId) ?? null;

  return (
    <>
      {contextHolder}
      <SectionCard
        title={sectionTitleWithCount('难题挑战', state.challenges.length)}
        note="挑战采用草稿、待发布、已发布和已结束四段状态，发布后会进入学员挑战入口。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditingItemId('')}>
            新增挑战
          </Button>
        }
      >
        {state.challenges.length ? (
          <div className="expert-list">
            {state.challenges.map((item) => {
              const meta = getChallengeStatusMeta(item.status);
              const pendingCount = state.submissions.filter(
                (submission) => submission.challengeId === item.id && submission.status === 'pending',
              ).length;
              return (
                <div key={item.id} className="expert-list-card expert-surface-card">
                  <div className="expert-inline expert-space-between">
                    <div>
                      <strong>{item.title}</strong>
                      <span className="expert-list-subtle">{item.summary}</span>
                    </div>
                    <Tag color={meta.color}>{meta.label}</Tag>
                  </div>
                  <p className="expert-paragraph">{item.description}</p>
                  <div className="expert-inline expert-wrap">
                    <Tag>{item.difficulty}</Tag>
                    <Tag color="blue">{`${item.participants} 人参与`}</Tag>
                    <Tag color={pendingCount ? 'warning' : 'default'}>{`待审核 ${pendingCount}`}</Tag>
                    {item.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  {item.references.length ? (
                    <div className="expert-chip-grid">
                      {item.references.map((reference) => (
                        <div key={reference} className="expert-chip-card">
                          <strong>参考资料</strong>
                          <span>{reference}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="expert-inline expert-space-between expert-top-gap">
                    <span className="expert-list-subtle">{formatDate(item.updatedAt)}</span>
                    <Space size={8}>
                      <Button size="small" icon={<EditOutlined />} onClick={() => setEditingItemId(item.id)}>
                        编辑
                      </Button>
                      {item.status === 'draft' ? (
                        <Button size="small" onClick={() => setChallengeStatus(item.id, 'ready')}>
                          提交待发布
                        </Button>
                      ) : null}
                      {item.status === 'ready' ? (
                        <Button size="small" type="primary" onClick={() => setChallengeStatus(item.id, 'published')}>
                          发布上线
                        </Button>
                      ) : null}
                      {item.status === 'published' ? (
                        <Button size="small" icon={<StopOutlined />} onClick={() => setChallengeStatus(item.id, 'ended')}>
                          结束
                        </Button>
                      ) : null}
                    </Space>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState description="当前还没有难题挑战" />
        )}
      </SectionCard>

      <ChallengeEditorModal
        open={editingItemId !== null}
        editingItem={editingItem}
        onCancel={() => setEditingItemId(null)}
        onSubmit={(input) => {
          saveChallenge(input);
          setEditingItemId(null);
          messageApi.success(input.id ? '难题挑战已更新' : '难题挑战已创建');
        }}
      />
    </>
  );
}

function ReviewsTab() {
  const { reviewSubmission, state } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);

  const editingSubmission = state.submissions.find((item) => item.id === editingSubmissionId) ?? null;

  return (
    <>
      {contextHolder}
      <SectionCard
        title={sectionTitleWithCount('挑战作品审核', state.submissions.length)}
        note="审核确认后会同步回写挑战状态和工作台待办数量。"
      >
        {state.submissions.length ? (
          <div className="expert-list">
            {state.submissions.map((item) => (
              <div key={item.id} className="expert-list-card expert-surface-card">
                <div className="expert-inline expert-space-between">
                  <div>
                    <strong>{item.studentName}</strong>
                    <span className="expert-list-subtle">
                      {item.studentId} · {item.challengeTitle}
                    </span>
                  </div>
                  <Tag color={item.status === 'pending' ? 'warning' : 'success'}>
                    {item.status === 'pending' ? '待审核' : '已完成'}
                  </Tag>
                </div>
                <p className="expert-paragraph">{item.summary}</p>
                <div className="expert-inline expert-wrap">
                  <Tag color="processing">{`AI 建议分 ${item.aiScore}`}</Tag>
                  {item.finalScore ? <Tag color="success">{`专家确认分 ${item.finalScore}`}</Tag> : null}
                  {item.growthReward ? <Tag color="gold">{`成长值 ${item.growthReward}`}</Tag> : null}
                </div>
                <div className="expert-chip-grid">
                  {item.attachments.map((attachment) => (
                    <div key={attachment} className="expert-chip-card">
                      <strong>附件</strong>
                      <span>{attachment}</span>
                    </div>
                  ))}
                </div>
                {item.comment ? <p className="expert-note-box">{item.comment}</p> : null}
                <div className="expert-inline expert-space-between expert-top-gap">
                  <span className="expert-list-subtle">{formatDate(item.submittedAt)}</span>
                  {item.status === 'pending' ? (
                    <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => setEditingSubmissionId(item.id)}>
                      审核作品
                    </Button>
                  ) : (
                    <Tag color="success">已同步评分与成长值</Tag>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState description="当前还没有作品提交" />
        )}
      </SectionCard>

      <ReviewEditorModal
        open={editingSubmissionId !== null}
        initialScore={editingSubmission?.aiScore ?? 80}
        onCancel={() => setEditingSubmissionId(null)}
        onSubmit={(values) => {
          if (!editingSubmissionId) {
            return;
          }
          reviewSubmission(editingSubmissionId, values.finalScore, values.growthReward, values.comment);
          setEditingSubmissionId(null);
          messageApi.success('作品审核已完成');
        }}
      />
    </>
  );
}

export function ExpertContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = useMemo<ContentTabKey>(() => {
    const tab = searchParams.get('tab');
    return CONTENT_TABS.some((item) => item.value === tab) ? (tab as ContentTabKey) : 'qa';
  }, [searchParams]);

  return (
    <div className="expert-page">
      <SectionCard title="内容工作区" note="在同一个工作区里完成问答沉淀、知识修订、资讯发布、难题挑战与作品审核。">
        <Segmented
          block
          value={activeTab}
          options={CONTENT_TABS}
          onChange={(value) => router.replace(`/content?tab=${value}`)}
        />
      </SectionCard>

      {activeTab === 'qa' ? <QaTab /> : null}
      {activeTab === 'knowledge' ? <KnowledgeTab /> : null}
      {activeTab === 'news' ? <NewsTab /> : null}
      {activeTab === 'challenges' ? <ChallengesTab /> : null}
      {activeTab === 'reviews' ? <ReviewsTab /> : null}
    </div>
  );
}

export function ExpertAgentsPage() {
  const { setAgentStatus, state, updateAgentBindings, updateAgentProfile } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      name: state.agent.name,
      avatar: state.agent.avatar,
      greeting: state.agent.greeting,
      promptTemplate: state.agent.promptTemplate,
      style: state.agent.style,
      bindings: state.agent.bindings.map((item) => item.knowledgeId),
    });
  }, [form, state.agent]);

  const activeKnowledgeOptions = state.knowledgeEntries
    .filter((entry) => entry.status === 'active')
    .map((entry) => ({ label: entry.question, value: entry.id }));
  const selectedBindingIds =
    (Form.useWatch('bindings', form) as string[] | undefined) ?? state.agent.bindings.map((item) => item.knowledgeId);
  const selectedBindingEntries = selectedBindingIds
    .map((knowledgeId) => state.knowledgeEntries.find((entry) => entry.id === knowledgeId))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard
        title="主智能体概览"
        note="先看当前智能体状态、服务范围和基础运营概况，再进入配置编辑。"
        extra={
          <Tag color={state.agent.status === 'published' ? 'success' : 'default'}>
            {state.agent.status === 'published' ? '已上架' : '已暂停'}
          </Tag>
        }
      >
        <div className="expert-agent-overview">
          <div className="expert-agent-summary">
            <Avatar size={60} className="expert-hero-avatar">
              {state.agent.avatar}
            </Avatar>
            <div className="expert-agent-summary-main">
              <div className="expert-agent-summary-head">
                <strong>{state.agent.name}</strong>
                <Tag color="blue">{state.agent.style}</Tag>
              </div>
              <p>{state.agent.greeting}</p>
              <div className="expert-inline expert-wrap">
                <Tag>1 个主智能体</Tag>
                <Tag>{`${activeKnowledgeOptions.length} 条可用知识`}</Tag>
                <Tag>{`${state.agent.bindings.length} 条已绑定`}</Tag>
                <Tag color="gold">{`日均问答 ${state.agent.averageDailyQa}`}</Tag>
              </div>
            </div>
          </div>
          <div className="expert-agent-kpis">
            <div className="expert-mini-stat">
              <span>累计用户</span>
              <strong>{state.agent.totalUsers}</strong>
            </div>
            <div className="expert-mini-stat">
              <span>日活用户</span>
              <strong>{state.agent.dailyActiveUsers}</strong>
            </div>
            <div className="expert-mini-stat">
              <span>累计问答</span>
              <strong>{state.agent.totalQaCount}</strong>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="主智能体配置"
        note="按标准表单顺序维护基础信息、回复策略和知识绑定，避免配置项混在一起。"
      >
        <Form
          className="expert-form-shell"
          form={form}
          layout="vertical"
          onFinish={(values) => {
            updateAgentProfile({
              name: values.name.trim(),
              avatar: values.avatar.trim(),
              greeting: values.greeting.trim(),
              promptTemplate: values.promptTemplate.trim(),
              style: values.style,
            });
            updateAgentBindings(values.bindings ?? []);
            messageApi.success('智能体配置已更新');
          }}
        >
          <div className="expert-form-section">
            <div className="expert-form-section-head">
              <strong>基础信息</strong>
              <span>统一维护名称、头像和欢迎语，保证学员端看到的入口信息一致。</span>
            </div>
            <div className="expert-form-grid">
              <Form.Item label="智能体名称" name="name" rules={[{ required: true, message: '请输入智能体名称' }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item label="头像文字" name="avatar" rules={[{ required: true, message: '请输入头像文字' }]}>
                <Input size="large" maxLength={2} />
              </Form.Item>
            </div>
            <Form.Item label="欢迎语" name="greeting" rules={[{ required: true, message: '请输入欢迎语' }]}>
              <Input.TextArea rows={4} showCount maxLength={120} />
            </Form.Item>
          </div>

          <div className="expert-form-section">
            <div className="expert-form-section-head">
              <strong>回复策略</strong>
              <span>先确定回答风格，再补充系统提示词模板，整体语气会更稳定。</span>
            </div>
            <div className="expert-form-grid expert-form-grid-narrow">
              <Form.Item label="回复风格" name="style">
                <Select
                  size="large"
                  options={[
                    { label: '严谨', value: '严谨' },
                    { label: '活泼', value: '活泼' },
                    { label: '鼓励型', value: '鼓励型' },
                  ]}
                />
              </Form.Item>
            </div>
            <Form.Item
              label="提示词模板"
              name="promptTemplate"
              rules={[{ required: true, message: '请输入提示词模板' }]}
            >
              <Input.TextArea rows={6} showCount maxLength={240} />
            </Form.Item>
          </div>

          <div className="expert-form-section">
            <div className="expert-form-section-head">
              <strong>知识库绑定</strong>
              <span>全宽选择知识条目，下面会实时展示当前生效顺序，避免在选择框里堆叠组件。</span>
            </div>
            <Form.Item label="知识库绑定顺序" name="bindings">
              <Select
                mode="multiple"
                size="large"
                showSearch
                optionFilterProp="label"
                maxTagCount="responsive"
                options={activeKnowledgeOptions}
                placeholder="选择要绑定的知识条目"
              />
            </Form.Item>
            <div className="expert-binding-preview">
              <div className="expert-binding-preview-head">
                <strong>当前绑定顺序</strong>
                <span>第 1 位优先命中</span>
              </div>
              {selectedBindingEntries.length ? (
                <div className="expert-binding-list">
                  {selectedBindingEntries.map((entry, index) => (
                    <div key={entry.id} className="expert-binding-item">
                      <div className="expert-binding-rank">{index + 1}</div>
                      <div className="expert-binding-content">
                        <strong>{entry.question}</strong>
                        <span>{entry.tags.join(' · ') || '未设置标签'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="expert-empty-inline">暂未选择知识条目</div>
              )}
            </div>
          </div>

          <div className="expert-form-actions">
            <Button size="large" type="primary" htmlType="submit" icon={<SettingOutlined />}>
              保存配置
            </Button>
            {state.agent.status === 'published' ? (
              <Button size="large" icon={<StopOutlined />} onClick={() => setAgentStatus('paused')}>
                暂停上架
              </Button>
            ) : (
              <Button size="large" type="default" icon={<SendOutlined />} onClick={() => setAgentStatus('published')}>
                重新上架
              </Button>
            )}
          </div>
        </Form>
      </SectionCard>

      <SectionCard title="运营数据" note="展示主智能体当前的核心使用表现。">
        <div className="expert-stats-grid">
          <div className="expert-stat-card">
            <span>累计用户量</span>
            <strong>{state.agent.totalUsers}</strong>
          </div>
          <div className="expert-stat-card">
            <span>日活用户</span>
            <strong>{state.agent.dailyActiveUsers}</strong>
          </div>
          <div className="expert-stat-card">
            <span>周活用户</span>
            <strong>{state.agent.weeklyActiveUsers}</strong>
          </div>
          <div className="expert-stat-card">
            <span>累计问答次数</span>
            <strong>{state.agent.totalQaCount}</strong>
          </div>
          <div className="expert-stat-card">
            <span>日均问答</span>
            <strong>{state.agent.averageDailyQa}</strong>
          </div>
        </div>
        <div className="expert-inline expert-wrap expert-top-gap">
          {state.agent.hotTopics.map((topic) => (
            <Tag key={topic} color="blue">
              {topic}
            </Tag>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="知识库绑定结果" note="展示当前主智能体已生效的知识条目优先级。">
        {state.agent.bindings.length ? (
          <div className="expert-list">
            {state.agent.bindings.map((binding) => (
              <div key={binding.id} className="expert-list-card">
                <div className="expert-inline expert-space-between">
                  <strong>{binding.knowledgeTitle}</strong>
                  <Tag color="processing">{`优先级 ${binding.priority}`}</Tag>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState description="当前还没有绑定知识条目" />
        )}
      </SectionCard>
    </div>
  );
}

export function ExpertMePage() {
  const { metrics, resetDemoData, state } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const session = getStoredSession();

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="专家资料" note="专家身份、机构信息和主智能体状态。">
        <div className="expert-profile-card">
          <Avatar size={58} className="expert-hero-avatar">
            {state.agent.avatar}
          </Avatar>
          <div className="expert-profile-main">
            <strong>{session?.user.displayName ?? '未登录专家'}</strong>
            <span>{session?.user.title ?? '专家身份'}</span>
            <small>
              {session?.user.organization} · {session?.user.field}
            </small>
          </div>
          <Tag color={state.agent.status === 'published' ? 'success' : 'default'}>
            {state.agent.status === 'published' ? '主智能体已上架' : '主智能体已暂停'}
          </Tag>
        </div>
      </SectionCard>

      <SectionCard title="当前概览" note="这里展示专家端当前的核心工作量与内容规模。">
        <div className="expert-metric-grid">
          {metrics.map((metric) => (
            <div key={metric.id} className={`expert-metric expert-metric-${metric.tone}`}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="常用设置" note="所有数据均在当前浏览器本地保存，可按需恢复初始内容。">
        <div className="expert-list">
          <div className="expert-list-card">
            <div className="expert-inline expert-space-between">
              <div>
                <strong>恢复初始数据</strong>
                <span className="expert-list-subtle">将课程、问答、知识库、资讯和挑战恢复到初始状态。</span>
              </div>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  resetDemoData();
                  messageApi.success('已恢复初始数据');
                }}
              >
                恢复
              </Button>
            </div>
          </div>
          <div className="expert-list-card">
            <div className="expert-inline expert-space-between">
              <div>
                <strong>主智能体状态</strong>
                <span className="expert-list-subtle">{state.agent.status === 'published' ? '当前面向学员可见。' : '当前仅保留配置，不对外展示。'}</span>
              </div>
              <Tag color={state.agent.status === 'published' ? 'success' : 'default'}>
                {state.agent.status === 'published' ? '已上架' : '已暂停'}
              </Tag>
            </div>
          </div>
          <div className="expert-list-card">
            <div className="expert-inline expert-space-between">
              <div>
                <strong>账号与退出</strong>
                <span className="expert-list-subtle">当前账号：{session?.user.account ?? '未登录'}</span>
              </div>
              <Button
                danger
                onClick={() => {
                  clearSession();
                  router.push('/login');
                }}
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="推荐操作" note="从工作台可以继续完成知识沉淀、挑战审核和智能体维护。">
        <div className="expert-actions-grid">
          <Link href="/dashboard" className="expert-action-tile">
            <ExperimentOutlined />
            <strong>返回工作台</strong>
            <span>查看待办、指标和最近动态</span>
          </Link>
          <Link href="/content?tab=knowledge" className="expert-action-tile">
            <FolderOpenOutlined />
            <strong>继续维护知识库</strong>
            <span>补全条目、资料与版本记录</span>
          </Link>
          <Link href="/agents" className="expert-action-tile">
            <RobotOutlined />
            <strong>调整主智能体</strong>
            <span>更新回复风格和知识绑定</span>
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
