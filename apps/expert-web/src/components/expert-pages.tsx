'use client';

import {
  AppstoreOutlined,
  BankOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DollarOutlined,
  FileTextOutlined,
  FireOutlined,
  FormOutlined,
  LogoutOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  ScanOutlined,
  SearchOutlined,
  SettingOutlined,
  StarOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Drawer, Empty, Input, InputNumber, Progress, QRCode, Segmented, Select, Switch, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession } from '../lib/api';
import {
  type AccountType,
  type AgentQuestionInput,
  type AgentInput,
  type AgentLifecycleStatus,
  type BankAccountInput,
  type BankAccountStatus,
  type ChallengeInput,
  type ChallengeSubmission,
  type ChallengeStatus,
  type CollectionRuleInput,
  type CourseChapter,
  type EvaluationBatchInput,
  type EvaluationReportStatus,
  type ExpertAgent,
  type ExpertApplicationInput,
  type ExpertAccountStatus,
  type ExpertProduct,
  type ExpertState,
  type InvoiceProfileInput,
  type InvoiceProfileStatus,
  type KnowledgeLibraryInput,
  type KnowledgeUploadInput,
  type NewsFormat,
  type NewsInput,
  type NewsStatus,
  type OrderRecord,
  type ProductInput,
  type ProductStatus,
  type ProductType,
  type QaImportInput,
  type ReplyStyle,
  type StoredFileMeta,
  type SubmissionImportInput,
  type SubmissionReviewStatus,
  type WithdrawalStatus,
  useExpertStore,
} from '../lib/expert-store';

type ContentEntranceKey = 'qa' | 'knowledge' | 'news' | 'challenges' | 'submissions' | 'evaluations';
type OrdersPanelKey = 'orders' | 'refunds' | 'verify';
type ChallengePanelKey = 'teams' | 'students' | 'works';

const AGENT_STATUS_META: Record<AgentLifecycleStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  testing: { label: '测试中', color: 'processing' },
  published: { label: '已上架', color: 'success' },
  unpublished: { label: '已下架', color: 'warning' },
};

const PRODUCT_STATUS_META: Record<ProductStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  pending_review: { label: '运营审核中', color: 'processing' },
  published: { label: '已上架', color: 'success' },
  rejected: { label: '审核驳回', color: 'error' },
  unpublished: { label: '已下架', color: 'warning' },
  ended: { label: '已结束', color: 'default' },
};

const PRODUCT_TYPE_META: Record<ProductType, { label: string; short: string }> = {
  online_course: { label: '线上课程', short: '线上' },
  live_course: { label: '直播', short: '直播' },
  activity: { label: '活动', short: '活动' },
  offline_course: { label: '活动', short: '活动' },
  pbl: { label: '直播', short: '直播' },
  face_to_face: { label: '活动', short: '活动' },
};

const COURSE_TYPE_OPTIONS: Array<{ value: ProductType; label: string }> = [
  { value: 'online_course', label: '线上课程' },
  { value: 'live_course', label: '直播' },
  { value: 'activity', label: '活动' },
];

const ORDER_STATUS_META: Record<OrderRecord['status'], { label: string; color: string }> = {
  pending_payment: { label: '待支付', color: 'warning' },
  reserved: { label: '已预约', color: 'processing' },
  paid: { label: '已支付', color: 'success' },
  refund_requested: { label: '申请退款', color: 'warning' },
  partial_refunded: { label: '部分退款', color: 'orange' },
  refunded: { label: '已退款', color: 'default' },
  written_off: { label: '已核销', color: 'success' },
  cancelled: { label: '已取消', color: 'default' },
};

const NEWS_STATUS_META: Record<NewsStatus, { label: string; color: string }> = {
  collected: { label: '采集池', color: 'default' },
  editing: { label: '编辑中', color: 'processing' },
  published: { label: '已发布', color: 'success' },
};

const CHALLENGE_STATUS_META: Record<ChallengeStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  ready: { label: '待发布', color: 'processing' },
  published: { label: '已发布', color: 'success' },
  ended: { label: '已结束', color: 'default' },
};

const SUBMISSION_STATUS_META: Record<SubmissionReviewStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'processing' },
  ai_scored: { label: 'AI 已评分', color: 'warning' },
  reviewed: { label: '已审核', color: 'success' },
  returned: { label: '已退回', color: 'warning' },
};

const WITHDRAWAL_STATUS_META: Record<WithdrawalStatus, { label: string; color: string }> = {
  submitted: { label: '已提交', color: 'processing' },
  reviewing: { label: '审核中', color: 'warning' },
  paid: { label: '已打款', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
};

const EVALUATION_STATUS_META: Record<EvaluationReportStatus, { label: string; color: string }> = {
  collecting: { label: '资料收集', color: 'default' },
  generating: { label: '报告生成中', color: 'processing' },
  completed: { label: '报告已完成', color: 'success' },
  synced: { label: '已同步成长日记', color: 'success' },
};

const ACCOUNT_STATUS_META: Record<ExpertAccountStatus, { label: string; color: string }> = {
  not_started: { label: '未入驻', color: 'default' },
  draft: { label: '资料待提交', color: 'warning' },
  under_review: { label: '运营审核中', color: 'processing' },
  rejected: { label: '审核驳回', color: 'error' },
  approved: { label: '已开通', color: 'success' },
};

const BANK_STATUS_META: Record<BankAccountStatus, { label: string; color: string }> = {
  not_set: { label: '未设置', color: 'default' },
  pending: { label: '待校验', color: 'processing' },
  active: { label: '已生效', color: 'success' },
  rejected: { label: '校验未通过', color: 'error' },
};

const INVOICE_STATUS_META: Record<InvoiceProfileStatus, { label: string; color: string }> = {
  not_set: { label: '未设置', color: 'default' },
  pending: { label: '待审核', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
};

function formatMoney(value: number) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`;
}

function formatDate(value?: string) {
  if (!value) {
    return '待安排';
  }
  return value.replace('T', ' ').slice(0, 16);
}

function maskedCard(cardNo: string) {
  if (!cardNo.trim()) {
    return '待填写';
  }
  const clean = cardNo.replace(/\s/g, '');
  return clean.length > 4 ? `**** **** **** ${clean.slice(-4)}` : clean;
}

function displayIdentity(state: ExpertState) {
  return {
    name: state.expert.name || state.application.expertName || '待提交资料',
    title: state.expert.title || state.application.title || '专家/机构账号',
    organization: state.expert.organization || state.application.organization || '研学宝专家合作中心',
    field: state.expert.field || state.application.field || '待选择领域',
  };
}

function displayOnboardingSummary(state: ExpertState) {
  const accountTypeText =
    state.accountStatus === 'not_started'
      ? '待选择入驻类型'
      : state.application.accountType === 'organization'
        ? '机构入驻'
        : '行业专家';

  return {
    accountTypeText,
    subjectName: state.application.organization || state.application.expertName || '待填写主体名称',
    field: state.application.field || '待选择专业领域',
    title:
      state.accountStatus === 'not_started'
        ? '选择入驻类型'
        : state.accountStatus === 'draft'
          ? '资料待提交'
          : state.accountStatus === 'under_review'
            ? '资料审核中'
            : state.accountStatus === 'rejected'
              ? '资料需补充'
              : '完成专家入驻',
    subtitle:
      state.accountStatus === 'not_started'
        ? '选择行业专家或机构入驻后，再提交资料进入运营审核'
        : state.accountStatus === 'draft'
          ? '继续完善主体资料、资质材料和联系人信息'
          : state.accountStatus === 'under_review'
            ? '运营审核通过后，将开放智能体、课程和内容运营能力'
            : state.accountStatus === 'rejected'
              ? '请根据审核意见补充资料后重新提交'
              : '提交主体资料、资质材料和联系人信息后开启合作能力',
    avatar: state.accountStatus === 'under_review' ? '审' : state.accountStatus === 'rejected' ? '补' : state.accountStatus === 'draft' ? '填' : '入',
  };
}

function onboardingAccountTypeLabel(type: AccountType) {
  return type === 'organization' ? '机构入驻' : '行业专家';
}

function onboardingAccountTypeDescription(type: AccountType) {
  return type === 'organization'
    ? '适合机构主体统一运营专家资料、经营结算和课程交付。'
    : '适合专家本人维护智能体、课程和挑战评价。';
}

function getOnboardingTypeFromUrl(): AccountType | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const type = new URLSearchParams(window.location.search).get('type');
  return type === 'organization' || type === 'expert' ? type : null;
}

function parseTags(value: string) {
  return value
    .split(/[,\n、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function useRouteParam(key = 'id') {
  const params = useParams();
  const value = params?.[key];
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function useRouteId() {
  return useRouteParam('id');
}

function statusTag(meta: { label: string; color: string }) {
  return <Tag color={meta.color}>{meta.label}</Tag>;
}

function needsExpertReview(status: SubmissionReviewStatus) {
  return status === 'pending' || status === 'ai_scored';
}

function qaSourceLabel(sourceType: string) {
  if (sourceType === 'expert_question') return '专家新增';
  if (sourceType === 'batch_import' || sourceType === 'manual_import') return '批量导入';
  return '学员提问';
}

function qaStatusTag(status: 'unmatched' | 'resolved') {
  return <Tag color={status === 'resolved' ? 'success' : 'warning'}>{status === 'resolved' ? '已沉淀' : '待完善'}</Tag>;
}

const DEFAULT_VOICE_PROMPT = '请长按下方按钮，用自然清晰的语气朗读：你好，我是你的研学专家。我们先观察现象，再一起找到证据。';

function ExpertVoiceRecorder({
  promptText = DEFAULT_VOICE_PROMPT,
  recognizedText,
  duration,
  recording,
  onStart,
  onFinish,
}: {
  promptText?: string;
  recognizedText: string;
  duration: string;
  recording: boolean;
  onStart: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="expert-voice-recorder">
      <div className="expert-voice-prompt">
        <span>朗读文案</span>
        <strong>{promptText}</strong>
      </div>
      <button
        className={`expert-record-button${recording ? ' recording' : ''}`}
        type="button"
        onPointerDown={onStart}
        onPointerUp={onFinish}
        onPointerLeave={() => {
          if (recording) onFinish();
        }}
        onTouchStart={(event) => {
          event.preventDefault();
          onStart();
        }}
        onTouchEnd={(event) => {
          event.preventDefault();
          onFinish();
        }}
      >
        <UploadOutlined />
        <strong>{recording ? '正在录音，松开保存' : '长按录入语音'}</strong>
        <span>{recording ? '系统正在识别专家语音' : '按住按钮朗读上方文案'}</span>
      </button>
      {recognizedText ? (
        <div className="expert-voice-result">
          <span>识别结果 · {duration}</span>
          <p>{recognizedText}</p>
        </div>
      ) : null}
    </div>
  );
}

function normalizedProductType(type: ProductType): ProductType {
  if (type === 'pbl') {
    return 'live_course';
  }
  if (type === 'face_to_face' || type === 'offline_course') {
    return 'activity';
  }
  return type;
}

function isOnlineCourse(type: ProductType) {
  return normalizedProductType(type) === 'online_course';
}

function formatCoursePrice(product: Pick<ExpertProduct, 'pricingType' | 'price'>) {
  return product.pricingType === 'free' || product.price <= 0 ? '免费' : formatMoney(product.price);
}

function getCoursePreviewIssues(product: ProductInput) {
  const issues: string[] = [];
  const productType = normalizedProductType(product.productType);
  if (!product.title.trim()) issues.push('课程名称不能为空');
  if (!product.coverFileName?.trim()) issues.push('需上传课程封面图');
  if (!product.detailImageFileNames?.length) issues.push('需上传至少一张课程详情图');
  if (product.capacity <= 0) issues.push('库存必须大于 0');
  if (product.pricingType === 'paid' && product.price <= 0) issues.push('付费课程需设置价格');
  if (productType === 'live_course' && !product.liveQrCode?.trim()) issues.push('直播课程需上传直播二维码');
  product.chapters.forEach((chapter, index) => {
    if (!chapter.title.trim()) {
      issues.push(`第 ${index + 1} 节缺少章节标题`);
    }
    if (!chapter.contentType || !chapter.contentUrl?.trim()) {
      issues.push(`第 ${index + 1} 节缺少内容类型或内容文件`);
    }
  });
  return issues;
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
        {extra ? <div className="expert-section-extra">{extra}</div> : null}
      </div>
      {children}
    </section>
  );
}

function H5ListLink({
  href,
  icon,
  title,
  text,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  badge?: React.ReactNode;
}) {
  return (
    <Link href={href} className="expert-h5-list-link">
      <span className="expert-h5-list-icon">{icon}</span>
      <span className="expert-h5-list-main">
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      {badge ? <span className="expert-h5-list-badge">{badge}</span> : null}
      <RightOutlined className="expert-h5-chevron" />
    </Link>
  );
}

function EntityCard({
  title,
  subtitle,
  meta,
  tags,
  actions,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  tags?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <article className="expert-entity-card">
      <div className="expert-entity-head">
        <div className="expert-entity-main">
          <strong>{title}</strong>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        {meta ? <div className="expert-entity-meta">{meta}</div> : null}
      </div>
      {tags ? <div className="expert-inline expert-wrap">{tags}</div> : null}
      {children ? <div className="expert-entity-body">{children}</div> : null}
      {actions ? <div className="expert-entity-actions">{actions}</div> : null}
    </article>
  );
}

function MobileEmpty({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="expert-empty-panel">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text} />
      {action}
    </div>
  );
}

function PageActionBar({ children }: { children: React.ReactNode }) {
  return <div className="expert-page-action-bar">{children}</div>;
}

function ProductName({ productId, products }: { productId: string | null; products: ExpertProduct[] }) {
  if (!productId) {
    return <span>未关联产品</span>;
  }
  return <span>{products.find((product) => product.id === productId)?.title ?? '未知产品'}</span>;
}

function AgentName({ agentId, agents }: { agentId: string | null; agents: ExpertAgent[] }) {
  if (!agentId) {
    return <span>公共知识</span>;
  }
  return <span>{agents.find((agent) => agent.id === agentId)?.name ?? '未关联智能体'}</span>;
}

export function ExpertDashboardPage() {
  const { state, startApplication } = useExpertStore();
  const router = useRouter();
  const identity = displayIdentity(state);
  const onboardingSummary = displayOnboardingSummary(state);
  const approved = state.accountStatus === 'approved';
  const showApplicationChoice = state.accountStatus === 'not_started';
  const showApplicationProgress = !approved && !showApplicationChoice;
  const unmatchedQa = state.qaRecords.filter((record) => record.status === 'unmatched').length;
  const pendingSubmissions = state.challengeSubmissions.filter((submission) => needsExpertReview(submission.status)).length;
  const pendingRefunds = state.refundRequests.filter((refund) => refund.status === 'pending').length;
  const pendingProducts = state.products.filter((product) => product.status === 'draft' || product.status === 'pending_review').length;
  const publishedCourses = state.products.filter((product) => product.status === 'published').length;
  const challengeStudents = new Set(state.challengeSubmissions.map((submission) => submission.studentName)).size;
  const challengeTeams = new Set(state.challengeSubmissions.map((submission) => submission.teamName)).size;
  const totalWorks = state.challengeSubmissions.length;
  const criticalWarnings = [
    state.bankAccount.status !== 'active' ? '收款银行卡未生效，暂不能提交提现' : '',
    state.invoiceProfile.status !== 'approved' ? '发票资料未通过，暂不能提交提现' : '',
    state.products.some((product) => product.status === 'rejected') ? '有课程审核驳回，请补充资料后重新提交' : '',
    unmatchedQa ? `${unmatchedQa} 条问答未匹配知识库` : '',
    pendingSubmissions ? `${pendingSubmissions} 份挑战作品待审核` : '',
    pendingRefunds ? `${pendingRefunds} 笔退款申请待处理` : '',
  ].filter(Boolean);
  const todoItems = [
    { label: '待审作品', value: pendingSubmissions, href: '/challenges' },
    { label: '待退款订单', value: pendingRefunds, href: '/me/orders?tab=refunds' },
    { label: '待补答问答', value: unmatchedQa, href: '/agents' },
    { label: '待上架课程', value: pendingProducts, href: '/courses' },
  ];
  const recentLogs = state.logs.slice(0, 4);
  const onboardingActionText =
    state.accountStatus === 'under_review'
      ? '查看审核进度'
      : state.accountStatus === 'rejected'
        ? '修改并重新提交'
        : '继续填写资料';

  function beginApplication(accountType: AccountType) {
    startApplication(accountType);
    router.push('/onboarding');
  }

  return (
    <div className="expert-page">
      {approved ? (
        <section className="expert-hero expert-hero-standard">
          <div className="expert-hero-head">
            <Avatar size={48} className="expert-hero-avatar">
              {identity.name.slice(0, 1)}
            </Avatar>
            <div>
              <p className="expert-hero-eyebrow">{identity.organization}</p>
              <h2>{identity.name}</h2>
              <span>
                {identity.title} · {identity.field}
              </span>
            </div>
          </div>
          <div className="expert-hero-side">
            <span className="expert-hero-chip">{ACCOUNT_STATUS_META[state.accountStatus].label}</span>
            {state.expert.accountNo ? <span className="expert-hero-chip">{state.expert.accountNo}</span> : null}
          </div>
        </section>
      ) : (
        <section className="expert-hero expert-hero-standard expert-onboarding-hero">
          <div className="expert-hero-head">
            <Avatar size={48} className="expert-hero-avatar">
              {onboardingSummary.avatar}
            </Avatar>
            <div>
              <p className="expert-hero-eyebrow">研学宝专家合作中心</p>
              <h2>{onboardingSummary.title}</h2>
              <span>{onboardingSummary.subtitle}</span>
            </div>
          </div>
          <div className="expert-hero-side">
            <span className="expert-hero-chip">{ACCOUNT_STATUS_META[state.accountStatus].label}</span>
            <span className="expert-hero-chip">{onboardingSummary.accountTypeText}</span>
          </div>
        </section>
      )}

      {showApplicationChoice ? (
        <SectionCard title="选择入驻类型" note="选择一次后进入资料填写，资料审核通过前不开放运营工作台">
          <div className="expert-stack">
            <button className="expert-application-entry" type="button" onClick={() => beginApplication('expert')}>
              <SafetyCertificateOutlined />
              <span><strong>行业专家入驻申请</strong><small>适合专家本人维护智能体、课程和挑战评价</small></span>
            </button>
            <button className="expert-application-entry" type="button" onClick={() => beginApplication('organization')}>
              <SafetyCertificateOutlined />
              <span><strong>机构入驻申请</strong><small>适合机构主体统一运营专家资料、经营结算和课程交付</small></span>
            </button>
            <p className="expert-note-box">入驻流程：选择类型、提交资料、运营审核、开通专家工作台。</p>
          </div>
        </SectionCard>
      ) : null}

      {showApplicationProgress ? (
        <SectionCard title="入驻进度" note="开通前只展示入驻状态，不展示运营工作台功能">
          <div className="expert-confirm-list">
            <div><span>当前状态</span><strong>{ACCOUNT_STATUS_META[state.accountStatus].label}</strong></div>
            <div><span>入驻类型</span><strong>{onboardingSummary.accountTypeText}</strong></div>
            <div><span>主体名称</span><strong>{onboardingSummary.subjectName}</strong></div>
            <div><span>专业领域</span><strong>{onboardingSummary.field}</strong></div>
            <div><span>审核意见</span><strong>{state.application.reviewOpinion || '暂无'}</strong></div>
          </div>
          <div className="expert-top-gap">
            <Button block type="primary" href="/onboarding">{onboardingActionText}</Button>
          </div>
        </SectionCard>
      ) : null}

      {approved && criticalWarnings.length ? (
        <SectionCard title="关键提醒" note="只展示会阻塞业务流转的事项">
          <div className="expert-stack">
            {criticalWarnings.map((item) => (
              <div className="expert-alert-row" key={item}>
                <ClockCircleOutlined />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {approved ? (
        <SectionCard title="经营总览" note="课程、挑战、作品和待办集中展示">
          <div className="expert-dashboard-overview">
            <div className="expert-dashboard-metric-grid">
              <div className="expert-dashboard-metric">
                <strong>{publishedCourses}</strong>
                <span>上架课程</span>
              </div>
              <div className="expert-dashboard-metric">
                <strong>{challengeStudents}</strong>
                <span>参与学员</span>
              </div>
              <div className="expert-dashboard-metric">
                <strong>{challengeTeams}</strong>
                <span>挑战团队</span>
              </div>
              <div className="expert-dashboard-metric">
                <strong>{totalWorks}</strong>
                <span>累计作品</span>
              </div>
            </div>
            <div className="expert-dashboard-subhead">
              <strong>今日待办</strong>
              <span>只保留会影响运营流转的动作</span>
            </div>
            {todoItems.map((item) => (
              <Link className="expert-dashboard-todo" href={item.href} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </Link>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {approved ? (
        <SectionCard title="常用操作" note="最多六个入口，全部进入移动端二级页">
          <div className="expert-shortcut-grid">
            <>
              <Link href="/agents"><RobotOutlined /><span>运营智能体</span></Link>
              <Link href="/courses/new"><BookOutlined /><span>上架课程</span></Link>
              <Link href="/agents"><FormOutlined /><span>补充问答</span></Link>
              <Link href="/agents"><FileTextOutlined /><span>发布资讯</span></Link>
              <Link href="/challenges/new"><FireOutlined /><span>发布挑战</span></Link>
              <Link href="/challenges"><StarOutlined /><span>审核作品</span></Link>
            </>
          </div>
        </SectionCard>
      ) : null}

      {approved && recentLogs.length ? (
        <SectionCard title="近期动态">
          <div className="expert-stack">
            {recentLogs.map((log) => (
              <div className="expert-log-row" key={log.id}>
                <span>{log.module} · {log.message}</span>
                <small>{formatDate(log.createdAt)}</small>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}

const ONBOARDING_STEPS = ['主体资料', '资质材料', '联系人', '提交审核'];

export function ExpertOnboardingPage() {
  const { state, startApplication, submitApplication, reviewApplication } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const urlAccountType = getOnboardingTypeFromUrl();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ExpertApplicationInput>(() => ({
    accountType: getOnboardingTypeFromUrl() ?? state.application.accountType,
    expertName: state.application.expertName || '张知远',
    title: state.application.title || '海洋科学专家',
    organization: state.application.organization || '上海知远科普咨询中心',
    field: state.application.field || '海洋生态与研学课程',
    credentialName: state.application.credentialName || '海洋科学研学导师资质',
    credentialFileName: state.application.credentialFileName || '专业资质证明.pdf',
    authorizationFileName: state.application.authorizationFileName || '课程合作授权书.pdf',
    contactName: state.application.contactName || '张知远',
    contactPhone: state.application.contactPhone || '13800000000',
  }));
  const isOrganization = draft.accountType === 'organization';

  useEffect(() => {
    if (state.accountStatus === 'not_started' && urlAccountType) {
      startApplication(urlAccountType);
      setDraft((current) => ({ ...current, accountType: urlAccountType }));
    }
  }, [startApplication, state.accountStatus, urlAccountType]);

  function beginApplication(accountType: AccountType) {
    startApplication(accountType);
    setDraft((current) => ({ ...current, accountType }));
    setStep(0);
  }

  function updateDraft<K extends keyof ExpertApplicationInput>(key: K, value: ExpertApplicationInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (!draft.expertName.trim() || !draft.field.trim() || !draft.contactPhone.trim()) {
      messageApi.warning('请补充展示名称、领域和联系人电话');
      return;
    }
    submitApplication(draft);
    messageApi.success('入驻资料已提交');
  }

  if (state.accountStatus === 'not_started' && !urlAccountType) {
    return (
      <div className="expert-page">
        {contextHolder}
        <SectionCard title="选择入驻类型" note="登录后先选择合作类型，再提交资料进入运营审核">
          <div className="expert-stack">
            <button className="expert-application-entry" type="button" onClick={() => beginApplication('expert')}>
              <SafetyCertificateOutlined />
              <span><strong>行业专家入驻申请</strong><small>{onboardingAccountTypeDescription('expert')}</small></span>
            </button>
            <button className="expert-application-entry" type="button" onClick={() => beginApplication('organization')}>
              <SafetyCertificateOutlined />
              <span><strong>机构入驻申请</strong><small>{onboardingAccountTypeDescription('organization')}</small></span>
            </button>
            <p className="expert-note-box">入驻类型选择后，资料填写页会锁定类型，避免主体资料和结算资料混用。</p>
          </div>
        </SectionCard>
        <SectionCard title="入驻流程">
          <div className="expert-confirm-list">
            <div><span>第 1 步</span><strong>选择入驻类型</strong></div>
            <div><span>第 2 步</span><strong>提交主体资料与资质材料</strong></div>
            <div><span>第 3 步</span><strong>运营审核</strong></div>
            <div><span>第 4 步</span><strong>开通专家工作台</strong></div>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (state.accountStatus === 'under_review') {
    return (
      <div className="expert-page">
        {contextHolder}
        <SectionCard title="运营审核中" note="专家端展示当前审核进度，运营后台完成审核后账号开通">
          <div className="expert-confirm-list">
            <div><span>入驻类型</span><strong>{onboardingAccountTypeLabel(state.application.accountType)}</strong></div>
            <div><span>主体名称</span><strong>{state.application.organization || state.application.expertName}</strong></div>
            <div><span>专业领域</span><strong>{state.application.field}</strong></div>
            <div><span>提交时间</span><strong>{formatDate(state.application.submittedAt)}</strong></div>
          </div>
        </SectionCard>
        <SectionCard title="审核处理">
          <div className="expert-form-stack">
            <Button type="primary" onClick={() => { reviewApplication('approved', '资料完整，准予开通专家端能力'); messageApi.success('专家账户已开通'); router.replace('/dashboard'); }}>运营审核通过</Button>
            <Button danger onClick={() => { reviewApplication('rejected', '请补充资质材料和授权文件后重新提交'); messageApi.warning('入驻资料已驳回'); }}>审核驳回并填写原因</Button>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (state.accountStatus === 'approved') {
    return (
      <div className="expert-page">
        <SectionCard title="账户已开通" note="现在可以创建智能体、课程产品并开展内容运营">
          <div className="expert-confirm-list">
            <div><span>专家账号</span><strong>{state.expert.accountNo}</strong></div>
            <div><span>专家姓名</span><strong>{state.expert.name}</strong></div>
            <div><span>合作机构</span><strong>{state.expert.organization}</strong></div>
            <div><span>专业领域</span><strong>{state.expert.field}</strong></div>
          </div>
        </SectionCard>
        <SectionCard title="下一步">
          <div className="expert-h5-list">
            <H5ListLink href="/me/bank-card" icon={<BankOutlined />} title="设置收款银行卡" text="提现前必须完成银行卡校验" />
            <H5ListLink href="/me/invoice" icon={<FileTextOutlined />} title="维护发票资料" text="发票资料通过后才可提现" />
            <H5ListLink href="/agents/new" icon={<RobotOutlined />} title="创建智能体" text="配置知识库、专家语音和测试上架" />
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      {state.accountStatus === 'rejected' ? (
        <div className="expert-alert-row">
          <ClockCircleOutlined />
          <span>{state.application.reviewOpinion ?? '入驻资料需要补充，请调整后重新提交。'}</span>
        </div>
      ) : null}

      <section className="expert-flow-progress">
        <span>第 {step + 1} 步 / {ONBOARDING_STEPS.length}</span>
        <Progress percent={Math.round(((step + 1) / ONBOARDING_STEPS.length) * 100)} showInfo={false} size="small" />
        <strong>{ONBOARDING_STEPS[step]}</strong>
      </section>
      <p className="expert-note-box">当前入驻类型：{onboardingAccountTypeLabel(draft.accountType)}。类型已锁定，资料会按该主体进入运营审核。</p>

      {step === 0 ? (
        <SectionCard title={isOrganization ? '机构主体资料' : '专家主体资料'} note="这些信息会展示在专家端首页和我的资料中">
          <div className="expert-form-stack">
            <label>{isOrganization ? '机构展示名' : '专家姓名'}<Input value={draft.expertName} onChange={(event) => updateDraft('expertName', event.target.value)} /></label>
            <label>{isOrganization ? '机构定位' : '专家头衔'}<Input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} /></label>
            <label>{isOrganization ? '主体公司名称' : '所属机构/工作室'}<Input value={draft.organization} onChange={(event) => updateDraft('organization', event.target.value)} /></label>
            <label>{isOrganization ? '服务领域' : '专业领域'}<Input.TextArea rows={3} value={draft.field} onChange={(event) => updateDraft('field', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 1 ? (
        <SectionCard title="资质材料" note="提交身份证明、营业执照、授权资料或专业资质文件名称">
          <div className="expert-form-stack">
            <label>资质名称<Input value={draft.credentialName} onChange={(event) => updateDraft('credentialName', event.target.value)} /></label>
            <label>身份证明/营业执照<Input prefix={<UploadOutlined />} value={draft.credentialFileName} onChange={(event) => updateDraft('credentialFileName', event.target.value)} /></label>
            <label>授权资料<Input prefix={<UploadOutlined />} value={draft.authorizationFileName} onChange={(event) => updateDraft('authorizationFileName', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard title="联系人信息" note="运营审核、课程审核和结算异常会联系此联系人">
          <div className="expert-form-stack">
            <label>联系人<Input value={draft.contactName} onChange={(event) => updateDraft('contactName', event.target.value)} /></label>
            <label>联系电话<Input value={draft.contactPhone} onChange={(event) => updateDraft('contactPhone', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard title="提交审核" note="提交后进入运营审核中，审核通过后解锁专家端完整能力">
          <div className="expert-confirm-list">
            <div><span>入驻类型</span><strong>{onboardingAccountTypeLabel(draft.accountType)}</strong></div>
            <div><span>{isOrganization ? '机构展示名' : '专家姓名'}</span><strong>{draft.expertName}</strong></div>
            <div><span>{isOrganization ? '主体公司名称' : '合作机构'}</span><strong>{draft.organization}</strong></div>
            <div><span>{isOrganization ? '服务领域' : '专业领域'}</span><strong>{draft.field}</strong></div>
            <div><span>资质材料</span><strong>{draft.credentialFileName}</strong></div>
            <div><span>联系人</span><strong>{draft.contactName} · {draft.contactPhone}</strong></div>
          </div>
        </SectionCard>
      ) : null}

      <PageActionBar>
        {step > 0 ? <Button onClick={() => setStep((current) => current - 1)}>上一步</Button> : <Button onClick={() => router.replace('/dashboard')}>返回首页</Button>}
        {step < ONBOARDING_STEPS.length - 1 ? (
          <Button type="primary" onClick={() => setStep((current) => current + 1)}>下一步</Button>
        ) : (
          <Button type="primary" onClick={submit}>提交运营审核</Button>
        )}
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentsPage() {
  const { state } = useExpertStore();
  const agent = state.agents[0] ?? null;
  const agentId = agent?.id ?? null;
  const agentKnowledge = state.knowledgeEntries.filter((entry) => !entry.archivedAt && (!agentId || entry.agentId === agentId || entry.agentId === null));
  const agentQa = state.qaRecords.filter((record) => !agentId || record.agentId === agentId || record.agentId === null);
  const agentNews = state.newsItems.filter((item) => !agentId || item.agentId === agentId || item.agentId === null);
  const agentSkills = state.agentSkills.filter((skill) => !agentId || skill.agentId === agentId || skill.agentId === null);
  const voiceSamples = state.agentVoiceSamples.filter((sample) => !agentId || sample.agentId === agentId || sample.agentId === null);
  const agentTests = state.agentTestRecords.filter((record) => record.agentId === agentId);
  const unmatchedQa = agentQa.filter((record) => record.status === 'unmatched').length;

  if (!agent) {
    return (
      <div className="expert-page">
        <SectionCard title="创建智能体" note="智能体创建并测试后才能上架，一个专家账号只运营一个智能体">
          <MobileEmpty text="当前还没有可运营的智能体。" action={<Button type="primary" href="/agents/new">开始创建智能体</Button>} />
        </SectionCard>
        <SectionCard title="创建路径" note="创建流程只保留上架必需配置，问题库创建后单独维护">
          <div className="expert-confirm-list">
            <div><span>1 基础资料</span><strong>名称、头像、领域</strong></div>
            <div><span>2 角色设定</span><strong>欢迎语、回复策略</strong></div>
            <div><span>3 知识库初始化</span><strong>至少 1 条标准问答</strong></div>
            <div><span>4 专家语音</span><strong>长按录入语音样本</strong></div>
            <div><span>5 测试上架</span><strong>测试通过后发布</strong></div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="expert-page">
      <SectionCard title="智能体档案" note="一个账号只运营一个智能体，一级页只展示总览和模块入口" extra={statusTag(AGENT_STATUS_META[agent.status])}>
        <div className="expert-agent-profile">
          <Avatar size={52}>{agent.avatarText}</Avatar>
          <div>
            <strong>{agent.name}</strong>
            <span>{agent.field} · {agent.replyStyle}</span>
          </div>
        </div>
        <p className="expert-note-box">{agent.rolePositioning}</p>
        <section className="expert-agent-content-overview" aria-label="智能体内容概览">
          <div><span>知识库</span><strong>{agentKnowledge.length}</strong><em>标准问答</em></div>
          <div><span>问题库</span><strong>{agentQa.length}</strong><em>{unmatchedQa ? `${unmatchedQa} 条待完善` : '已沉淀'}</em></div>
          <div><span>资讯</span><strong>{agentNews.length}</strong><em>内容运营</em></div>
        </section>
      </SectionCard>

      <SectionCard title="运营模块" note="先进入模块列表，再从列表底部新增、导入或录音">
        <div className="expert-h5-list">
          <H5ListLink href={`/agents/${agent.id}`} icon={<RobotOutlined />} title="智能体档案" text="资料、知识绑定和上架状态" badge={statusTag(AGENT_STATUS_META[agent.status])} />
          <H5ListLink href="/agents/knowledge" icon={<BookOutlined />} title="知识库" text="标准问答、资料沉淀和绑定状态" badge={<Tag>{agentKnowledge.length}</Tag>} />
          <H5ListLink href="/agents/questions" icon={<FormOutlined />} title="问题库" text="专家维护智能体常见问题" badge={<Tag color={unmatchedQa ? 'warning' : 'default'}>{unmatchedQa}</Tag>} />
          <H5ListLink href="/agents/news" icon={<FileTextOutlined />} title="资讯" text="设置采集规则，查看图文资讯" badge={<Tag>{agentNews.length}</Tag>} />
          <H5ListLink href="/agents/skills" icon={<AppstoreOutlined />} title="技能" text="skill 文件和生效状态" badge={<Tag>{agentSkills.length}</Tag>} />
          <H5ListLink href="/agents/voice" icon={<UploadOutlined />} title="专家语音" text="录音样本和试听状态" badge={<Tag>{voiceSamples.length}</Tag>} />
          <H5ListLink href="/agents/tests" icon={<SettingOutlined />} title="测试记录" text="提问测试和调优结果" badge={<Tag>{agentTests.length}</Tag>} />
        </div>
      </SectionCard>
    </div>
  );
}

type AgentWizardDraft = AgentInput & {
  testQuestion: string;
  knowledgeTitle: string;
  knowledgeQuestion: string;
  knowledgeAnswer: string;
  knowledgeKeywordsText: string;
};

const AGENT_WIZARD_TITLES = ['基础信息', '角色设定', '知识库初始化', '专家语音录入', '测试上架'];
const AGENT_WIZARD_STEP_COUNT = AGENT_WIZARD_TITLES.length;

export function ExpertAgentCreatePage() {
  const {
    state,
    createAgent,
    updateAgentBindings,
    addAgentTestRecord,
    setAgentStatus,
    saveKnowledgeLibrary,
    saveKnowledgeEntry,
    recordAgentVoiceSample,
  } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [step, setStep] = useState(0);
  const existingAgent = state.agents[0] ?? null;
  const [draft, setDraft] = useState<AgentWizardDraft>({
    name: '海洋探索导师',
    avatarText: '海',
    field: '海洋生态',
    rolePositioning: '面向 8-14 岁学员，用儿童可理解的语言解释海洋科学问题。',
    welcomeMessage: '你好，我会结合课程、知识库和现场观察，陪你继续深挖海洋里的问题。',
    promptTemplate: '请先讲清事实，再引导学员继续观察和表达；回答不超过 180 字。',
    replyStyle: '启发提问',
    knowledgeIds: state.knowledgeEntries.filter((item) => !item.archivedAt).slice(0, 2).map((item) => item.id),
    knowledgeTitle: '潮汐观察基础问题',
    knowledgeQuestion: '为什么海边退潮后会留下小水坑？',
    knowledgeAnswer: '退潮时海水回到更低的位置，沙滩或礁石凹陷处来不及排走的海水会暂时留下，形成小水坑。',
    knowledgeKeywordsText: '潮汐,海岸观察,研学安全',
    testQuestion: '为什么海边退潮后会留下小水坑？',
  });
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceDuration, setVoiceDuration] = useState('');

  if (existingAgent) {
    return (
      <div className="expert-page">
        {contextHolder}
        <SectionCard title="已初始化智能体" note="一个专家账号只运营一个智能体，不允许创建第二个智能体">
          <EntityCard title={existingAgent.name} subtitle={`${existingAgent.field} · ${existingAgent.replyStyle}`} meta={statusTag(AGENT_STATUS_META[existingAgent.status])}>
            <p>{existingAgent.rolePositioning}</p>
          </EntityCard>
        </SectionCard>
        <SectionCard title="继续运营">
          <div className="expert-h5-list">
            <H5ListLink href="/agents" icon={<RobotOutlined />} title="返回智能体首页" text="查看内容、技能、语音和问答概览" />
            <H5ListLink href={`/agents/${existingAgent.id}`} icon={<SettingOutlined />} title="查看智能体详情" text="维护知识绑定、测试记录和上架状态" />
          </div>
        </SectionCard>
      </div>
    );
  }

  function updateDraft<K extends keyof AgentWizardDraft>(key: K, value: AgentWizardDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function finishVoiceRecording() {
    if (!voiceRecording && voiceText) {
      return;
    }
    setVoiceRecording(false);
    setVoiceText('你好，我是你的研学专家。我们先观察现象，再一起找到证据。');
    setVoiceDuration('00:18');
    messageApi.success('语音已识别，可继续下一步');
  }

  function finish(publish: boolean) {
    if (!draft.name.trim()) {
      messageApi.warning('请填写智能体名称');
      setStep(0);
      return;
    }
    const hasNewKnowledge = Boolean(draft.knowledgeTitle.trim() && draft.knowledgeQuestion.trim() && draft.knowledgeAnswer.trim());
    const hasKnowledge = draft.knowledgeIds.length > 0 || hasNewKnowledge;
    if (publish && !hasKnowledge) {
      messageApi.warning('上架前请至少沉淀或绑定一条知识');
      setStep(2);
      return;
    }
    if (publish && !voiceText.trim()) {
      messageApi.warning('上架前请长按录入专家语音');
      setStep(3);
      return;
    }

    const agentInput: AgentInput = {
      name: draft.name,
      avatarText: draft.avatarText,
      field: draft.field,
      rolePositioning: draft.rolePositioning,
      welcomeMessage: draft.welcomeMessage,
      promptTemplate: draft.promptTemplate,
      replyStyle: draft.replyStyle,
      knowledgeIds: draft.knowledgeIds,
    };
    const agentId = createAgent(agentInput);
    const nextKnowledgeIds = [...draft.knowledgeIds];
    const knowledgeKeywords = parseTags(draft.knowledgeKeywordsText);
    if (hasNewKnowledge) {
      const libraryId = saveKnowledgeLibrary({
        agentId,
        name: `${draft.name}知识库`,
        description: '智能体创建流程中沉淀的基础知识',
        bindingPriority: 1,
      });
      const knowledgeId = saveKnowledgeEntry({
        agentId,
        libraryId,
        title: draft.knowledgeTitle.trim(),
        question: draft.knowledgeQuestion.trim(),
        answer: draft.knowledgeAnswer.trim(),
        keywords: knowledgeKeywords.length ? knowledgeKeywords : ['智能体知识'],
        source: 'manual',
        status: 'enabled',
        bindingPriority: 1,
      });
      nextKnowledgeIds.push(knowledgeId);
    }
    if (nextKnowledgeIds.length) {
      updateAgentBindings(agentId, nextKnowledgeIds);
    }
    if (voiceText.trim()) {
      recordAgentVoiceSample({
        agentId,
        title: '创建流程语音样本',
        text: voiceText.trim(),
        duration: voiceDuration || '00:18',
      });
    }
    if (draft.testQuestion.trim()) {
      addAgentTestRecord(agentId, draft.testQuestion.trim());
    }
    if (publish) {
      setAgentStatus(agentId, 'published');
    }
    messageApi.success(publish ? '智能体已上架' : '智能体草稿已保存');
    router.replace(`/agents/${agentId}`);
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <section className="expert-flow-progress">
        <span>第 {step + 1} 步 / {AGENT_WIZARD_STEP_COUNT}</span>
        <Progress percent={Math.round(((step + 1) / AGENT_WIZARD_STEP_COUNT) * 100)} showInfo={false} size="small" />
        <strong>{AGENT_WIZARD_TITLES[step]}</strong>
      </section>

      {step === 0 ? (
        <SectionCard title="基础信息" note="用于学员端广场和专家陪伴入口展示">
          <div className="expert-form-stack">
            <label>智能体名称<Input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} /></label>
            <label>头像文字<Input maxLength={2} value={draft.avatarText} onChange={(event) => updateDraft('avatarText', event.target.value)} /></label>
            <label>负责领域<Input value={draft.field} onChange={(event) => updateDraft('field', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 1 ? (
        <SectionCard title="角色定位" note="明确这个智能体面向谁、用什么方式陪伴学习">
          <div className="expert-form-stack">
            <label>角色定位<Input.TextArea rows={5} value={draft.rolePositioning} onChange={(event) => updateDraft('rolePositioning', event.target.value)} /></label>
            <label>欢迎语<Input.TextArea rows={4} value={draft.welcomeMessage} onChange={(event) => updateDraft('welcomeMessage', event.target.value)} /></label>
            <label>
              回复风格
              <Select
                value={draft.replyStyle}
                onChange={(value) => updateDraft('replyStyle', value)}
                options={['鼓励型', '专业严谨', '启发提问', '陪伴观察'].map((style) => ({ label: style, value: style as ReplyStyle }))}
              />
            </label>
            <label>提示词模板<Input.TextArea rows={5} value={draft.promptTemplate} onChange={(event) => updateDraft('promptTemplate', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard title="知识沉淀" note="上架前至少沉淀或绑定一条知识，后续仍可在智能体内继续新增">
          <div className="expert-form-stack">
            <label>绑定已有知识
              <Select
                mode="multiple"
                value={draft.knowledgeIds}
                onChange={(value) => updateDraft('knowledgeIds', value)}
                style={{ width: '100%' }}
                options={state.knowledgeEntries.filter((entry) => !entry.archivedAt).map((entry) => ({ label: entry.title, value: entry.id }))}
              />
            </label>
            <label>新增知识标题<Input value={draft.knowledgeTitle} onChange={(event) => updateDraft('knowledgeTitle', event.target.value)} /></label>
            <label>标准问题<Input.TextArea rows={3} value={draft.knowledgeQuestion} onChange={(event) => updateDraft('knowledgeQuestion', event.target.value)} /></label>
            <label>标准回答<Input.TextArea rows={5} value={draft.knowledgeAnswer} onChange={(event) => updateDraft('knowledgeAnswer', event.target.value)} /></label>
            <label>关键词<Input value={draft.knowledgeKeywordsText} onChange={(event) => updateDraft('knowledgeKeywordsText', event.target.value)} placeholder="用顿号、逗号或换行分隔" /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard title="专家语音" note="长按录入专家语音，系统识别后生成一条语音样本">
          <ExpertVoiceRecorder
            recognizedText={voiceText}
            duration={voiceDuration}
            recording={voiceRecording}
            onStart={() => setVoiceRecording(true)}
            onFinish={finishVoiceRecording}
          />
        </SectionCard>
      ) : null}

      {step === 4 ? (
        <SectionCard title="测试上架" note="生成测试记录后可先保存草稿，也可以直接上架到学员侧">
          <div className="expert-form-stack">
            <label>测试问题<Input.TextArea rows={4} value={draft.testQuestion} onChange={(event) => updateDraft('testQuestion', event.target.value)} /></label>
            <p className="expert-note-box">预览回复：我会先把问题拆成可观察现象，再结合课程和知识库给出适合孩子理解的回答。</p>
          </div>
          <div className="expert-confirm-list">
            <div><span>名称</span><strong>{draft.name}</strong></div>
            <div><span>领域</span><strong>{draft.field}</strong></div>
            <div><span>知识准备</span><strong>{draft.knowledgeIds.length + (draft.knowledgeTitle.trim() && draft.knowledgeQuestion.trim() && draft.knowledgeAnswer.trim() ? 1 : 0)} 条</strong></div>
            <div><span>专家语音</span><strong>{voiceText.trim() ? '已录入' : '待录入'}</strong></div>
            <div><span>回复风格</span><strong>{draft.replyStyle}</strong></div>
          </div>
        </SectionCard>
      ) : null}

      <PageActionBar>
        {step > 0 ? <Button onClick={() => setStep((current) => current - 1)}>上一步</Button> : <Button onClick={() => router.back()}>取消</Button>}
        {step < AGENT_WIZARD_STEP_COUNT - 1 ? (
          <>
            <Button onClick={() => finish(false)}>保存草稿</Button>
            <Button type="primary" onClick={() => setStep((current) => current + 1)}>下一步</Button>
          </>
        ) : (
          <>
            <Button onClick={() => finish(false)}>保存草稿</Button>
            <Button type="primary" onClick={() => finish(true)}>上架</Button>
          </>
        )}
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentDetailPage() {
  const agentId = useRouteId();
  const { state, setAgentStatus, updateAgent, updateAgentBindings } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents.find((item) => item.id === agentId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: agent?.name ?? '',
    avatarText: agent?.avatarText ?? '',
    field: agent?.field ?? '',
    rolePositioning: agent?.rolePositioning ?? '',
    welcomeMessage: agent?.welcomeMessage ?? '',
    replyStyle: (agent?.replyStyle ?? '启发提问') as ReplyStyle,
    promptTemplate: agent?.promptTemplate ?? '',
  });

  useEffect(() => {
    if (agent) {
      setDraft({
        name: agent.name,
        avatarText: agent.avatarText,
        field: agent.field,
        rolePositioning: agent.rolePositioning,
        welcomeMessage: agent.welcomeMessage,
        replyStyle: agent.replyStyle,
        promptTemplate: agent.promptTemplate,
      });
    }
  }, [agent?.id]);

  if (!agent) {
    return <MobileEmpty text="没有找到该智能体" action={<Button href="/agents">返回列表</Button>} />;
  }

  const tests = state.agentTestRecords.filter((record) => record.agentId === agent.id);
  const updateDraft = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const saveProfile = () => {
    if (!draft.name.trim() || !draft.field.trim() || !draft.rolePositioning.trim()) {
      messageApi.warning('请完善智能体名称、领域和角色定位');
      return;
    }
    updateAgent(agent.id, {
      name: draft.name.trim(),
      avatarText: (draft.avatarText.trim() || draft.name.trim().slice(0, 1)).slice(0, 2),
      field: draft.field.trim(),
      rolePositioning: draft.rolePositioning.trim(),
      welcomeMessage: draft.welcomeMessage.trim(),
      replyStyle: draft.replyStyle,
      promptTemplate: draft.promptTemplate.trim(),
    });
    setEditing(false);
    messageApi.success('智能体档案已更新');
  };

  return (
    <div className="expert-page expert-page-with-action-bar">
      {contextHolder}
      <SectionCard title="智能体档案" note="维护智能体基础资料、角色设定和上架状态" extra={statusTag(AGENT_STATUS_META[agent.status])}>
        {editing ? (
          <div className="expert-form-stack">
            <label>智能体名称<Input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} /></label>
            <div className="expert-form-grid">
              <label>头像文字<Input maxLength={2} value={draft.avatarText} onChange={(event) => updateDraft('avatarText', event.target.value)} /></label>
              <label>领域<Input value={draft.field} onChange={(event) => updateDraft('field', event.target.value)} /></label>
            </div>
            <label>
              回复风格
              <Select
                value={draft.replyStyle}
                onChange={(value) => updateDraft('replyStyle', value)}
                options={['鼓励型', '专业严谨', '启发提问', '陪伴观察'].map((item) => ({ label: item, value: item }))}
              />
            </label>
            <label>角色定位<Input.TextArea rows={4} value={draft.rolePositioning} onChange={(event) => updateDraft('rolePositioning', event.target.value)} /></label>
            <label>欢迎语<Input.TextArea rows={3} value={draft.welcomeMessage} onChange={(event) => updateDraft('welcomeMessage', event.target.value)} /></label>
            <label>提示词模板<Input.TextArea rows={4} value={draft.promptTemplate} onChange={(event) => updateDraft('promptTemplate', event.target.value)} /></label>
          </div>
        ) : (
          <>
            <div className="expert-agent-profile">
              <Avatar size={52}>{agent.avatarText}</Avatar>
              <div>
                <strong>{agent.name}</strong>
                <span>{agent.field} · {agent.replyStyle}</span>
              </div>
            </div>
            <p className="expert-note-box">{agent.rolePositioning}</p>
            <div className="expert-confirm-list">
              <div><span>欢迎语</span><strong>{agent.welcomeMessage || '未设置'}</strong></div>
              <div><span>提示词</span><strong>{agent.promptTemplate || '未设置'}</strong></div>
              <div><span>更新时间</span><strong>{formatDate(agent.updatedAt)}</strong></div>
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="运营数据">
        <div className="expert-mobile-kpi-row">
          <div><strong>{agent.operations.conversations}</strong><span>会话</span></div>
          <div><strong>{agent.operations.resolvedRate}%</strong><span>解决率</span></div>
          <div><strong>{agent.operations.satisfaction}%</strong><span>满意度</span></div>
        </div>
      </SectionCard>

      <SectionCard title="知识库绑定" note="这里是二级详情页，适合承载配置操作">
        <Select
          mode="multiple"
          value={agent.knowledgeBindings.map((binding) => binding.knowledgeId)}
          onChange={(ids) => updateAgentBindings(agent.id, ids)}
          style={{ width: '100%' }}
          options={state.knowledgeEntries.filter((entry) => !entry.archivedAt).map((entry) => ({ label: entry.title, value: entry.id }))}
        />
      </SectionCard>

      <SectionCard title="测试记录">
        <div className="expert-list">
          {tests.slice(0, 3).map((record) => (
            <EntityCard key={record.id} title={record.question} subtitle={formatDate(record.testedAt)} meta={<Tag color={record.result === 'passed' ? 'success' : 'warning'}>{record.result === 'passed' ? '通过' : '需优化'}</Tag>}>
              <p>{record.answer}</p>
            </EntityCard>
          ))}
          {!tests.length ? <MobileEmpty text="暂无测试记录。" action={<Button href="/agents/tests/new">新增测试</Button>} /> : null}
        </div>
      </SectionCard>

      <PageActionBar>
        {editing ? (
          <>
            <Button onClick={() => setEditing(false)}>取消</Button>
            <Button type="primary" onClick={saveProfile}>保存档案</Button>
          </>
        ) : (
          <>
            <Button onClick={() => setEditing(true)}>编辑基础信息</Button>
            {agent.status === 'published' ? (
              <Button onClick={() => setAgentStatus(agent.id, 'unpublished')}>下架智能体</Button>
            ) : (
              <Button type="primary" onClick={() => setAgentStatus(agent.id, 'published')}>上架智能体</Button>
            )}
          </>
        )}
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentKnowledgeListPage() {
  const { state } = useExpertStore();
  const agent = state.agents[0] ?? null;
  const entries = state.knowledgeEntries.filter((entry) => !entry.archivedAt && (!agent || entry.agentId === agent.id || entry.agentId === null));

  if (!agent) {
    return <MobileEmpty text="请先初始化智能体。" action={<Button type="primary" href="/agents/new">初始化智能体</Button>} />;
  }

  return (
    <div className="expert-page">
      <SectionCard title="知识库" note="先查看知识列表，再从底部新增标准问答">
        <div className="expert-list">
          {entries.map((entry) => (
            <EntityCard key={entry.id} title={entry.title} subtitle={entry.question} meta={<Tag color={entry.status === 'enabled' ? 'success' : 'default'}>{entry.status === 'enabled' ? '启用' : '停用'}</Tag>} tags={<>{entry.keywords.map((tag) => <Tag key={tag}>{tag}</Tag>)}</>}>
              <p>{entry.answer}</p>
            </EntityCard>
          ))}
          {!entries.length ? <MobileEmpty text="暂无知识条目。" /> : null}
        </div>
      </SectionCard>
      <PageActionBar>
        <Button block type="primary" href="/agents/knowledge/new">新增知识</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentQuestionsPage() {
  const { state } = useExpertStore();
  const agent = state.agents[0] ?? null;
  const records = state.qaRecords.filter((record) => !agent || record.agentId === agent.id || record.agentId === null);

  if (!agent) {
    return <MobileEmpty text="请先初始化智能体。" action={<Button type="primary" href="/agents/new">初始化智能体</Button>} />;
  }

  return (
    <div className="expert-page">
      <SectionCard title="问题库" note="专家维护智能体常见问题，不作为学员管理入口">
        <div className="expert-list">
          {records.map((record) => (
            <EntityCard key={record.id} title={record.title || record.question} subtitle={`${qaSourceLabel(record.sourceType)} · ${formatDate(record.askedAt)}`} meta={qaStatusTag(record.status)} tags={<>{record.keywords?.map((tag) => <Tag key={tag}>{tag}</Tag>)}</>}>
              <p>{record.question}</p>
              {record.answer ? <p>{record.answer}</p> : null}
            </EntityCard>
          ))}
          {!records.length ? <MobileEmpty text="暂无问题。" /> : null}
        </div>
      </SectionCard>
      <PageActionBar>
        <Button block type="primary" href="/agents/questions/new">新增问题</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentQuestionCreatePage() {
  const { state, saveAgentQuestion } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents[0] ?? null;
  const [draft, setDraft] = useState({
    title: '',
    question: '',
    answer: '',
    keywordsText: '',
    status: 'resolved' as AgentQuestionInput['status'],
  });

  function submit() {
    if (!agent) {
      messageApi.warning('请先初始化智能体');
      return;
    }
    const keywords = parseTags(draft.keywordsText);
    if (!draft.title.trim() || !draft.question.trim() || keywords.length === 0) {
      messageApi.warning('请补充标题、问题内容和关键词');
      return;
    }
    if (draft.status === 'resolved' && !draft.answer.trim()) {
      messageApi.warning('已沉淀问题需要填写标准答案');
      return;
    }
    saveAgentQuestion({
      agentId: agent.id,
      title: draft.title.trim(),
      question: draft.question.trim(),
      answer: draft.answer.trim(),
      keywords,
      status: draft.status,
    });
    messageApi.success('问题已保存');
    router.replace('/agents/questions');
  }

  if (!agent) {
    return <MobileEmpty text="请先初始化智能体。" action={<Button type="primary" href="/agents/new">初始化智能体</Button>} />;
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="新增问题" note="维护专家问题库，用标准答案训练智能体">
        <div className="expert-form-stack">
          <label>问题标题<Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>问题内容<Input.TextArea rows={5} value={draft.question} onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))} /></label>
          <label>标准答案<Input.TextArea rows={5} value={draft.answer} onChange={(event) => setDraft((current) => ({ ...current, answer: event.target.value }))} /></label>
          <label>关键词<Input value={draft.keywordsText} onChange={(event) => setDraft((current) => ({ ...current, keywordsText: event.target.value }))} placeholder="潮汐、观察、安全" /></label>
          <label>
            状态
            <Select
              value={draft.status}
              onChange={(value) => setDraft((current) => ({ ...current, status: value }))}
              options={[
                { label: '已沉淀', value: 'resolved' },
                { label: '待完善', value: 'unmatched' },
              ]}
            />
          </label>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>保存问题</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentKnowledgeCreatePage() {
  const { state, saveKnowledgeLibrary, saveKnowledgeEntry } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents[0] ?? null;
  const [draft, setDraft] = useState({ title: '', question: '', answer: '', keywordsText: '', libraryName: '智能体运营知识库' });

  function submit() {
    if (!agent) {
      messageApi.warning('请先初始化智能体');
      return;
    }
    const keywords = parseTags(draft.keywordsText);
    if (!draft.title.trim() || !draft.question.trim() || !draft.answer.trim() || keywords.length === 0) {
      messageApi.warning('请补充标题、问题、答案和关键词');
      return;
    }
    const libraryId =
      state.knowledgeLibraries.find((library) => library.agentId === agent.id)?.id ??
      saveKnowledgeLibrary({
        name: draft.libraryName || `${agent.name}知识库`,
        agentId: agent.id,
        description: '从智能体频道沉淀的专家标准问答。',
        bindingPriority: 1,
      });
    saveKnowledgeEntry({
      agentId: agent.id,
      libraryId,
      title: draft.title,
      question: draft.question,
      answer: draft.answer,
      keywords,
      source: 'manual',
      status: 'enabled',
      bindingPriority: 1,
    });
    messageApi.success('知识已沉淀到智能体');
    router.replace('/agents/knowledge');
  }

  if (!agent) {
    return <MobileEmpty text="请先初始化智能体。" action={<Button type="primary" href="/agents/new">初始化智能体</Button>} />;
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="新增知识" note="原知识库能力迁入智能体频道，录入后自动绑定当前智能体">
        <div className="expert-form-stack">
          <label>知识库分组<Input value={draft.libraryName} onChange={(event) => setDraft((current) => ({ ...current, libraryName: event.target.value }))} /></label>
          <label>知识标题<Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>标准问题<Input.TextArea rows={3} value={draft.question} onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))} /></label>
          <label>标准答案<Input.TextArea rows={5} value={draft.answer} onChange={(event) => setDraft((current) => ({ ...current, answer: event.target.value }))} /></label>
          <label>关键词<Input value={draft.keywordsText} onChange={(event) => setDraft((current) => ({ ...current, keywordsText: event.target.value }))} placeholder="海洋、潮汐、观察任务" /></label>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>保存知识</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentQaImportPage() {
  return <ExpertAgentQuestionCreatePage />;
}

export function ExpertAgentNewsListPage() {
  const { state, runCollectionRule, deleteNewsItem } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents[0] ?? null;
  const rules = state.contentCollectionRules.filter((rule) => !agent || rule.agentId === agent.id || rule.agentId === null);
  const items = state.newsItems.filter((item) => !agent || item.agentId === agent.id || item.agentId === null);

  if (!agent) {
    return <MobileEmpty text="请先初始化智能体。" action={<Button type="primary" href="/agents/new">初始化智能体</Button>} />;
  }

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="资讯采集规则" note="专家配置关键词、来源和频率，系统按规则模拟采集图文资讯">
        <div className="expert-list">
          {rules.map((rule) => (
            <EntityCard
              key={rule.id}
              title={rule.name}
              subtitle={`${rule.frequency} · ${rule.sourceScope} · ${rule.updateWindow}`}
              meta={<Tag color={rule.enabled ? 'success' : 'default'}>{rule.enabled ? '启用' : '停用'}</Tag>}
              tags={<>{rule.keywords.slice(0, 3).map((keyword) => <Tag key={keyword}>{keyword}</Tag>)}</>}
              actions={<Button size="small" type="primary" onClick={() => { runCollectionRule(rule.id); messageApi.success('已生成 mock 采集资讯'); }}>模拟采集</Button>}
            >
              <p>来源：{rule.sourceRules.map((source) => source.name).join('、')}</p>
              <small>每次最多采集 {rule.maxItems} 条；上次采集：{formatDate(rule.lastCollectedAt)}</small>
            </EntityCard>
          ))}
          {!rules.length ? <MobileEmpty text="暂无采集规则，请先设置规则。" /> : null}
        </div>
      </SectionCard>

      <SectionCard title="采集资讯列表" note="采集到的图文富文本资讯可查看详情，也可以从列表删除">
        <div className="expert-list">
          {items.map((item) => (
            <EntityCard
              key={item.id}
              title={item.title}
              subtitle={`${item.source} · ${formatDate(item.collectedAt ?? item.createdAt)} · ${item.readingTime ?? '图文'}`}
              meta={statusTag(NEWS_STATUS_META[item.status])}
              tags={<>{item.featured ? <Tag color="gold">精选</Tag> : null}<Tag>{item.sourceType === 'collection' ? '采集' : '历史内容'}</Tag></>}
              actions={<><Button size="small" href={`/agents/news/${item.id}`}>查看详情</Button><Button size="small" danger onClick={() => { deleteNewsItem(item.id); messageApi.success('采集资讯已删除'); }}>删除</Button></>}
            >
              <p>{item.summary}</p>
            </EntityCard>
          ))}
          {!items.length ? <MobileEmpty text="暂无采集资讯，执行一次模拟采集后会展示在这里。" /> : null}
        </div>
      </SectionCard>
      <PageActionBar>
        <Button block type="primary" href="/agents/news/new">设置采集规则</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentNewsCreatePage() {
  const { state, saveCollectionRule } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents[0] ?? null;
  const [draft, setDraft] = useState<CollectionRuleInput>({
    name: '',
    agentId: agent?.id ?? null,
    keywords: [],
    excludeKeywords: [],
    sourceNames: [],
    formats: ['图文'],
    frequency: '每日',
    sourceScope: '权威科普',
    updateWindow: '近7天',
    maxItems: 3,
  });
  const [keywordsText, setKeywordsText] = useState('');
  const [excludeText, setExcludeText] = useState('');
  const [sourcesText, setSourcesText] = useState('科普机构公众号\n博物馆/科技馆资讯\n研学基地动态');

  function submit() {
    if (!agent) {
      messageApi.warning('请先初始化智能体');
      return;
    }
    const keywords = parseTags(keywordsText);
    const excludeKeywords = parseTags(excludeText);
    const sourceNames = parseTags(sourcesText);
    if (!draft.name.trim() || keywords.length === 0 || sourceNames.length === 0) {
      messageApi.warning('请补充规则名称、采集关键词和采集来源');
      return;
    }
    saveCollectionRule({
      ...draft,
      agentId: agent.id,
      keywords,
      excludeKeywords,
      sourceNames,
      formats: ['图文'],
      maxItems: draft.maxItems ?? 3,
    });
    messageApi.success('资讯采集规则已保存');
    router.replace('/agents/news');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="设置资讯采集规则" note="本页为前端 mock：保存规则后，列表页可模拟生成网上图文富文本资讯">
        <div className="expert-form-stack">
          <label>规则名称<Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="如：海洋生态资讯采集" /></label>
          <label>采集关键词<Input value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} placeholder="海洋生态、潮汐、研学安全" /></label>
          <label>屏蔽关键词<Input value={excludeText} onChange={(event) => setExcludeText(event.target.value)} placeholder="商业广告、无关旅游" /></label>
          <label>采集来源<Input.TextArea rows={4} value={sourcesText} onChange={(event) => setSourcesText(event.target.value)} placeholder="每行一个来源，如科普公众号、博物馆资讯" /></label>
          <div className="expert-form-grid">
            <label>来源范围<Select value={draft.sourceScope} onChange={(value) => setDraft((current) => ({ ...current, sourceScope: value }))} options={['权威科普', '教育媒体', '研学机构', '综合网络'].map((item) => ({ label: item, value: item }))} /></label>
            <label>内容时效<Select value={draft.updateWindow} onChange={(value) => setDraft((current) => ({ ...current, updateWindow: value }))} options={['近24小时', '近7天', '近30天'].map((item) => ({ label: item, value: item }))} /></label>
            <label>采集频率<Select value={draft.frequency} onChange={(value) => setDraft((current) => ({ ...current, frequency: value }))} options={['每日', '每周', '手动'].map((item) => ({ label: item, value: item }))} /></label>
            <label>每次数量<InputNumber min={1} max={5} value={draft.maxItems} onChange={(value) => setDraft((current) => ({ ...current, maxItems: value ?? 3 }))} /></label>
          </div>
          <p className="expert-note-box">采集结果统一为图文富文本信息，点击列表项可查看封面、来源、摘要和正文详情。</p>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>保存规则</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentNewsDetailPage() {
  const newsId = useRouteId();
  const router = useRouter();
  const { state, deleteNewsItem } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const item = state.newsItems.find((news) => news.id === newsId);

  if (!item) {
    return <MobileEmpty text="没有找到该资讯" action={<Button href="/agents/news">返回资讯列表</Button>} />;
  }

  const paragraphs = item.content.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <div className="expert-page">
      {contextHolder}
      <article className="expert-news-article">
        <header className="expert-news-header">
          <span className="expert-news-kicker">智能体资讯 · {NEWS_STATUS_META[item.status].label}</span>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
        </header>

        <figure className="expert-news-figure">
          <div className="expert-news-cover" aria-label={item.coverImage ?? item.title}>
            <span>{item.coverImage ?? '图文封面'}</span>
          </div>
          <figcaption>
            <strong>{item.source.toUpperCase()}</strong>
            <span>{item.coverImage ?? '采集图文封面'}，前端 mock 演示图文素材。</span>
          </figcaption>
        </figure>

        <section className="expert-news-byline">
          <strong>{item.source}</strong>
          <span>{item.sourceType === 'collection' ? '资讯采集来源，系统模拟采集' : '专家内容来源'}</span>
        </section>

        <div className="expert-news-meta">
          <span>{formatDate(item.collectedAt ?? item.createdAt)}</span>
          <span>阅读时间：{item.readingTime ?? '4 分钟'}</span>
        </div>

        <div className="expert-news-richtext">
          {paragraphs.map((paragraph, index) => (
            <p key={`${item.id}_${index}`}>{paragraph}</p>
          ))}
        </div>

        {item.sourceUrl ? <p className="expert-source-url">模拟来源：{item.sourceUrl}</p> : null}
      </article>
      <PageActionBar>
        <Button danger onClick={() => { deleteNewsItem(item.id); messageApi.success('采集资讯已删除'); router.replace('/agents/news'); }}>删除</Button>
        <Button type="primary" onClick={() => router.back()}>返回列表</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentSkillsListPage() {
  const { state, activateAgentSkill } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents[0] ?? null;
  const skills = state.agentSkills.filter((skill) => !agent || skill.agentId === agent.id || skill.agentId === null);

  if (!agent) {
    return <MobileEmpty text="请先初始化智能体。" action={<Button type="primary" href="/agents/new">初始化智能体</Button>} />;
  }

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="技能" note="先查看技能列表，再从底部导入 skill 文件">
        <div className="expert-list">
          {skills.map((skill) => (
            <EntityCard key={skill.id} title={skill.name} subtitle={skill.description} meta={<Tag color={skill.status === 'active' ? 'success' : 'processing'}>{skill.status === 'active' ? '已生效' : '待生效'}</Tag>} actions={skill.status === 'pending' ? <Button size="small" onClick={() => { activateAgentSkill(skill.id); messageApi.success('技能已生效'); }}>设为生效</Button> : null}>
              <p>{skill.fileName}</p>
            </EntityCard>
          ))}
          {!skills.length ? <MobileEmpty text="暂无技能。" /> : null}
        </div>
      </SectionCard>
      <PageActionBar>
        <Button block type="primary" href="/agents/skills/import">导入技能</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentSkillImportPage() {
  const { state, importAgentSkill } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents[0] ?? null;
  const [draft, setDraft] = useState({ name: '', description: '', fileName: '' });

  function submit() {
    if (!agent) {
      messageApi.warning('请先初始化智能体');
      return;
    }
    if (!draft.name.trim() || !draft.description.trim()) {
      messageApi.warning('请补充技能名称和说明');
      return;
    }
    importAgentSkill({ agentId: agent.id, name: draft.name, description: draft.description, fileName: draft.fileName || `${draft.name}.skill` });
    messageApi.success('技能已导入，待生效');
    router.replace('/agents/skills');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="导入技能" note="本轮只保存 skill 名称、说明、文件名和状态，不接真实 skill 运行环境">
        <div className="expert-form-stack">
          <label>技能名称<Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
          <label>技能说明<Input.TextArea rows={4} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
          <label>文件名<Input value={draft.fileName} onChange={(event) => setDraft((current) => ({ ...current, fileName: event.target.value }))} placeholder="analysis.skill" /></label>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>导入技能</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentVoiceListPage() {
  const { state, testAgentVoice } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents[0] ?? null;
  const samples = state.agentVoiceSamples.filter((sample) => !agent || sample.agentId === agent.id || sample.agentId === null);

  if (!agent) {
    return <MobileEmpty text="请先初始化智能体。" action={<Button type="primary" href="/agents/new">初始化智能体</Button>} />;
  }

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="专家语音" note="先查看语音样本，再从底部录入新语音">
        <div className="expert-list">
          {samples.map((sample) => (
            <EntityCard key={sample.id} title={sample.title} subtitle={`${sample.duration} · ${formatDate(sample.createdAt)}`} meta={<Tag color={sample.status === 'tested' ? 'success' : 'processing'}>{sample.status === 'tested' ? '已试听' : '已录入'}</Tag>} actions={<Button size="small" onClick={() => { testAgentVoice(sample.id); messageApi.success('已生成试听结果'); }}>试听</Button>}>
              <p>{sample.text}</p>
            </EntityCard>
          ))}
          {!samples.length ? <MobileEmpty text="暂无语音样本。" /> : null}
        </div>
      </SectionCard>
      <PageActionBar>
        <Button block type="primary" href="/agents/voice/new">录入语音</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentVoiceCreatePage() {
  const { state, recordAgentVoiceSample } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents[0] ?? null;
  const [recording, setRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [duration, setDuration] = useState('');

  function finishRecording() {
    if (!recording && recognizedText) {
      return;
    }
    setRecording(false);
    setRecognizedText('你好，我是你的研学专家。我们先观察现象，再一起找到证据。');
    setDuration('00:18');
    messageApi.success('语音已识别');
  }

  function submit() {
    if (!agent) {
      messageApi.warning('请先初始化智能体');
      return;
    }
    if (!recognizedText.trim()) {
      messageApi.warning('请长按录入专家语音');
      return;
    }
    recordAgentVoiceSample({ agentId: agent.id, title: `专家语音样本 ${state.agentVoiceSamples.length + 1}`, text: recognizedText, duration: duration || '00:18' });
    messageApi.success('专家语音样本已录入');
    router.replace('/agents/voice');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="录入专家语音" note="移动端长按录音，系统识别后保存语音样本">
        <ExpertVoiceRecorder
          recognizedText={recognizedText}
          duration={duration}
          recording={recording}
          onStart={() => setRecording(true)}
          onFinish={finishRecording}
        />
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>保存样本</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentTestsPage() {
  const { state } = useExpertStore();
  const agent = state.agents[0] ?? null;
  const tests = state.agentTestRecords.filter((record) => !agent || record.agentId === agent.id);

  if (!agent) {
    return <MobileEmpty text="请先初始化智能体。" action={<Button type="primary" href="/agents/new">初始化智能体</Button>} />;
  }

  return (
    <div className="expert-page">
      <SectionCard title="测试记录" note="先查看测试结果，再从底部新增测试问题">
        <div className="expert-list">
          {tests.map((record) => (
            <EntityCard key={record.id} title={record.question} subtitle={formatDate(record.testedAt)} meta={<Tag color={record.result === 'passed' ? 'success' : 'warning'}>{record.result === 'passed' ? '通过' : '需优化'}</Tag>}>
              <p>{record.answer}</p>
            </EntityCard>
          ))}
          {!tests.length ? <MobileEmpty text="暂无测试记录。" /> : null}
        </div>
      </SectionCard>
      <PageActionBar>
        <Button block type="primary" href="/agents/tests/new">新增测试</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertAgentTestCreatePage() {
  const { state, addAgentTestRecord } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const agent = state.agents[0] ?? null;
  const [question, setQuestion] = useState('这个问题可以怎样继续观察？');

  function submit() {
    if (!agent) {
      messageApi.warning('请先初始化智能体');
      return;
    }
    if (!question.trim()) {
      messageApi.warning('请填写测试问题');
      return;
    }
    addAgentTestRecord(agent.id, question.trim());
    messageApi.success('已生成测试记录');
    router.replace('/agents/tests');
  }

  if (!agent) {
    return <MobileEmpty text="请先初始化智能体。" action={<Button type="primary" href="/agents/new">初始化智能体</Button>} />;
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="新增测试" note="输入一个真实问题，检查智能体回复是否可上架">
        <div className="expert-form-stack">
          <label>测试问题<Input.TextArea rows={5} value={question} onChange={(event) => setQuestion(event.target.value)} /></label>
          <p className="expert-note-box">系统会基于当前角色设定和知识库生成模拟回复，并记录测试结果。</p>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>生成测试记录</Button>
      </PageActionBar>
    </div>
  );
}

const COURSE_DRAFT_STORAGE_KEY = 'yanxuebao_expert_course_draft_v1';
const COURSE_WIZARD_STEPS = ['课程类型', '基础信息', '封面与详情图', '价格库存', '交付与章节', '预览提交'];
const COURSE_CONTENT_TYPE_OPTIONS: Array<{ value: NonNullable<CourseChapter['contentType']>; label: string }> = [
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'pdf', label: 'PDF' },
  { value: 'link', label: '外链' },
];

type ProductWizardDraft = ProductInput & {
  draftId: string;
  courseFormat: string;
  discountPrice: number;
  publishAt: string;
  routePlan: string;
  meetingPoint: string;
  safetyNotice: string;
  mentorName: string;
  liveTime: string;
  guestName: string;
  tagsText: string;
};

function createClientId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

function courseContentTypeLabel(type?: CourseChapter['contentType']) {
  return COURSE_CONTENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? '外链';
}

function normalizeCourseChapters(chapters: CourseChapter[]) {
  return [...chapters]
    .map((chapter, index) => ({
      ...chapter,
      id: chapter.id ?? createClientId('chapter'),
      title: chapter.title || `第 ${index + 1} 节`,
      duration: chapter.duration || '30分钟',
      summary: chapter.summary || '待补充章节简介',
      contentType: chapter.contentType ?? 'link',
      contentUrl: chapter.contentUrl ?? chapter.fileName ?? '',
      sortOrder: chapter.sortOrder ?? index + 1,
      isTrial: Boolean(chapter.isTrial),
    }))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((chapter, index) => ({ ...chapter, sortOrder: index + 1 }));
}

function mockCourseImageName(title: string, label: string) {
  const cleanTitle = title.trim() || '课程';
  return `${cleanTitle}${label}_${String(Date.now()).slice(-5)}.png`;
}

function mockChapterFileName(chapter: CourseChapter) {
  if (chapter.contentType === 'link') {
    return `https://yanxuebao.local/course/${createClientId('content')}`;
  }
  const ext = chapter.contentType === 'audio' ? 'mp3' : chapter.contentType === 'pdf' ? 'pdf' : 'mp4';
  return `${chapter.title || '课程章节'}内容_${String(Date.now()).slice(-5)}.${ext}`;
}

function buildEmptyChapter(productType: ProductType, index: number): CourseChapter {
  const normalizedType = normalizedProductType(productType);
  const contentType: CourseChapter['contentType'] = normalizedType === 'online_course' ? 'video' : normalizedType === 'live_course' ? 'link' : 'pdf';
  const titlePrefix = normalizedType === 'online_course' ? '第' : normalizedType === 'live_course' ? '直播环节' : '活动环节';
  return {
    id: createClientId('chapter'),
    title: normalizedType === 'online_course' ? `${titlePrefix} ${index + 1} 课` : `${titlePrefix} ${index + 1}`,
    duration: normalizedType === 'activity' ? '30分钟' : '20分钟',
    summary: '',
    contentType,
    contentUrl: '',
    fileName: '',
    isTrial: normalizedType === 'online_course' && index === 0,
    sortOrder: index + 1,
  };
}

function buildProductInput(productType: ProductType): ProductWizardDraft {
  const normalizedType = normalizedProductType(productType);
  const meta = PRODUCT_TYPE_META[normalizedType];
  return {
    draftId: createClientId('course_draft'),
    title: '',
    productType: normalizedType,
    summary: '',
    targetAge: '8-14岁',
    pricingType: normalizedType === 'activity' ? 'free' : 'paid',
    price: normalizedType === 'activity' ? 0 : normalizedType === 'live_course' ? 99 : 199,
    capacity: normalizedType === 'online_course' ? 500 : 30,
    location: normalizedType === 'online_course' || normalizedType === 'live_course' ? '线上学习' : '待定活动地点',
    schedule: normalizedType === 'live_course' ? '2026-06-08 19:30' : '待安排',
    bookingDeadline: '待设置',
    deliveryPlan: normalizedType === 'activity' ? '报名预约、现场签到、专家导入、互动体验、成果反馈' : '课程学习、互动答疑、成果任务',
    chapters: [],
    liveQrCode: '',
    tags: [],
    coverFileName: '',
    detailImageFileNames: [],
    materialFileName: `${meta.label}课程资料.pdf`,
    courseFormat: normalizedType === 'online_course' ? '录播课 + 线上答疑' : normalizedType === 'live_course' ? '直播分享 + 互动问答' : '预约活动 + 现场核销',
    discountPrice: normalizedType === 'activity' ? 0 : 159,
    publishAt: '审核通过后立即上架',
    routePlan: '集合签到、专家导入、现场观察、成果分享、返程总结',
    meetingPoint: '研学基地入口服务台',
    safetyNotice: '需确认学生健康信息，现场按导师指引行动，避免脱离队伍。',
    mentorName: '张知远',
    liveTime: '2026-06-08 19:30',
    guestName: '特邀科学家',
    tagsText: '',
  };
}

function readCourseDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COURSE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductWizardDraft;
    return {
      ...buildProductInput(parsed.productType),
      ...parsed,
      chapters: normalizeCourseChapters(parsed.chapters ?? []),
      detailImageFileNames: parsed.detailImageFileNames ?? [],
    };
  } catch {
    return null;
  }
}

function writeCourseDraft(draft: ProductWizardDraft) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(COURSE_DRAFT_STORAGE_KEY, JSON.stringify({ ...draft, chapters: normalizeCourseChapters(draft.chapters) }));
  }
}

function clearCourseDraft() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(COURSE_DRAFT_STORAGE_KEY);
  }
}

function resolveInitialCourseDraft() {
  if (typeof window === 'undefined') return buildProductInput('online_course');
  const params = new URLSearchParams(window.location.search);
  const typeParam = params.get('type') as ProductType | null;
  const stepParam = params.get('step');
  const normalizedType = typeParam ? normalizedProductType(typeParam) : 'online_course';
  const saved = readCourseDraft();
  if (saved && (stepParam || !typeParam || saved.productType === normalizedType)) {
    return saved;
  }
  return buildProductInput(normalizedType);
}

function resolveInitialCourseStep() {
  if (typeof window === 'undefined') return 0;
  const stepParam = new URLSearchParams(window.location.search).get('step');
  return stepParam === 'chapters' ? 4 : 0;
}

function productToInput(product: ExpertProduct, chapters = product.chapters): ProductInput {
  const productType = normalizedProductType(product.productType);
  return {
    title: product.title,
    productType,
    summary: product.summary,
    targetAge: product.targetAge,
    pricingType: product.pricingType,
    price: product.pricingType === 'free' ? 0 : product.price,
    capacity: product.capacity,
    location: product.location,
    schedule: product.schedule,
    bookingDeadline: product.bookingDeadline,
    deliveryPlan: product.deliveryPlan,
    chapters: normalizeCourseChapters(chapters),
    liveQrCode: productType === 'live_course' ? product.liveQrCode : undefined,
    coverFileName: product.coverFileName,
    detailImageFileNames: product.detailImageFileNames ?? [],
    materialFileName: product.materialFileName,
    tags: product.tags,
  };
}

function courseDeliverySummary(product: ExpertProduct) {
  const productType = normalizedProductType(product.productType);
  if (productType === 'online_course') return `${product.location} · ${product.chapters.length} 个章节 · ${formatCoursePrice(product)}`;
  if (productType === 'live_course') return `${product.schedule} · ${product.location} · ${formatCoursePrice(product)}`;
  return `${product.schedule} · ${product.location} · 库存 ${product.capacity}`;
}

export function ExpertCoursesPage() {
  const { state } = useExpertStore();
  const [activeType, setActiveType] = useState<ProductType>('online_course');
  const activeProducts = state.products.filter((product) => normalizedProductType(product.productType) === activeType);
  const publishedCount = state.products.filter((product) => product.status === 'published').length;
  const pendingCount = state.products.filter((product) => product.status === 'pending_review').length;
  const draftCount = state.products.filter((product) => product.status === 'draft' || product.status === 'rejected' || product.status === 'unpublished').length;

  return (
    <div className="expert-page">
      <SectionCard title="课程" note="课程只管理产品、交付、预览和上架；订单统一在我的里处理">
        <div className="expert-mobile-kpi-row">
          <div><strong>{state.products.length}</strong><span>课程总数</span></div>
          <div><strong>{publishedCount}</strong><span>已上架</span></div>
          <div><strong>{pendingCount}</strong><span>待审核</span></div>
          <div><strong>{draftCount}</strong><span>待完善</span></div>
        </div>
      </SectionCard>

      <Segmented
        block
        value={activeType}
        onChange={(value) => setActiveType(value as ProductType)}
        options={COURSE_TYPE_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
      />

      <SectionCard
        title={PRODUCT_TYPE_META[activeType].label}
        note={`${activeProducts.length} 个课程产品`}
        extra={<Link className="expert-primary-link" href={`/courses/new?type=${activeType}`}>新建</Link>}
      >
        {activeProducts.length ? (
          <div className="expert-list">
            {activeProducts.map((product) => (
              <Link className="expert-course-list-card" key={product.id} href={`/courses/${product.id}`}>
                <div className="expert-course-thumb"><span>{product.coverFileName ? '封面' : PRODUCT_TYPE_META[normalizedProductType(product.productType)].short}</span></div>
                <span>
                  <strong>{product.title}</strong>
                  <small>{formatCoursePrice(product)} · {product.chapters.length} 章 · 库存 {product.capacity} · 浏览 {product.views}</small>
                </span>
                {statusTag(PRODUCT_STATUS_META[product.status])}
                <RightOutlined />
              </Link>
            ))}
          </div>
        ) : (
          <MobileEmpty text={`暂无${PRODUCT_TYPE_META[activeType].label}`} action={<Button type="primary" href={`/courses/new?type=${activeType}`}>新建{PRODUCT_TYPE_META[activeType].label}</Button>} />
        )}
      </SectionCard>
    </div>
  );
}

export function ExpertCourseCreatePage() {
  const { saveProduct, setProductStatus } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [step, setStep] = useState(resolveInitialCourseStep);
  const [input, setInput] = useState<ProductWizardDraft>(resolveInitialCourseDraft);
  const [draftReady, setDraftReady] = useState(false);
  const previewIssues = getCoursePreviewIssues({ ...input, chapters: normalizeCourseChapters(input.chapters) });

  useEffect(() => {
    setInput(resolveInitialCourseDraft());
    setStep(resolveInitialCourseStep());
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (draftReady) {
      writeCourseDraft(input);
    }
  }, [draftReady, input]);

  function update<K extends keyof ProductWizardDraft>(key: K, value: ProductWizardDraft[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function changeType(type: ProductType) {
    setInput(buildProductInput(type));
  }

  function addCoverImage() {
    update('coverFileName', mockCourseImageName(input.title, '封面图'));
  }

  function addDetailImage() {
    update('detailImageFileNames', [...(input.detailImageFileNames ?? []), mockCourseImageName(input.title, `详情图${(input.detailImageFileNames?.length ?? 0) + 1}`)]);
  }

  function removeDetailImage(fileName: string) {
    update('detailImageFileNames', (input.detailImageFileNames ?? []).filter((item) => item !== fileName));
  }

  function removeChapter(chapterId?: string) {
    update('chapters', normalizeCourseChapters(input.chapters.filter((chapter) => chapter.id !== chapterId)));
  }

  function moveChapter(chapterId: string | undefined, direction: -1 | 1) {
    const chapters = normalizeCourseChapters(input.chapters);
    const index = chapters.findIndex((chapter) => chapter.id === chapterId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= chapters.length) return;
    const next = [...chapters];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    update('chapters', normalizeCourseChapters(next.map((chapter, itemIndex) => ({ ...chapter, sortOrder: itemIndex + 1 }))));
  }

  function save() {
    const chapters = normalizeCourseChapters(input.chapters);
    const deliveryPlan = [
      input.deliveryPlan,
      input.productType === 'online_course' ? `课程形式：${input.courseFormat}` : '',
      input.productType === 'activity' ? `集合信息：${input.meetingPoint}；安全须知：${input.safetyNotice}` : '',
      input.productType === 'live_course' ? `直播时间：${input.liveTime}；嘉宾：${input.guestName}` : '',
      `课程资料：${input.materialFileName}`,
    ]
      .filter(Boolean)
      .join('\n');
    const productInput: ProductInput = {
      title: input.title,
      productType: input.productType,
      summary: input.summary,
      targetAge: input.targetAge,
      pricingType: input.pricingType,
      price: input.pricingType === 'free' ? 0 : input.price,
      capacity: input.capacity,
      location: input.location,
      schedule: input.schedule,
      bookingDeadline: input.bookingDeadline,
      deliveryPlan,
      chapters,
      liveQrCode: input.productType === 'live_course' ? input.liveQrCode : undefined,
      coverFileName: input.coverFileName,
      detailImageFileNames: input.detailImageFileNames,
      materialFileName: input.materialFileName,
      tags: parseTags(input.tagsText),
    };
    const issues = getCoursePreviewIssues(productInput);
    if (issues.length) {
      messageApi.warning(`请先补齐：${issues[0]}`);
      setStep(COURSE_WIZARD_STEPS.length - 1);
      return;
    }
    const productId = saveProduct(productInput);
    setProductStatus(productId, 'pending_review');
    clearCourseDraft();
    messageApi.success('课程已提交运营审核');
    router.replace(`/courses/${productId}`);
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <section className="expert-flow-progress">
        <span>第 {step + 1} 步 / {COURSE_WIZARD_STEPS.length}</span>
        <Progress percent={Math.round(((step + 1) / COURSE_WIZARD_STEPS.length) * 100)} showInfo={false} size="small" />
        <strong>{COURSE_WIZARD_STEPS[step]}</strong>
      </section>

      {step === 0 ? (
        <SectionCard title="选择课程类型" note="创建后类型锁定，订单、退款和核销统一到我的里处理">
          <Segmented
            block
            value={input.productType}
            onChange={(value) => changeType(value as ProductType)}
            options={COURSE_TYPE_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
          />
          <p className="expert-note-box">{PRODUCT_TYPE_META[input.productType].label}会进入课程中心，审核通过后才能上架。</p>
        </SectionCard>
      ) : null}

      {step === 1 ? (
        <SectionCard title="基础信息" note="用于课程卡片、详情页顶部和学员侧介绍">
          <div className="expert-form-stack">
            <label>课程名称<Input value={input.title} placeholder="请输入课程名称" onChange={(event) => update('title', event.target.value)} /></label>
            <label>课程简介<Input.TextArea rows={4} value={input.summary} placeholder="请输入课程介绍、学习目标和交付成果" onChange={(event) => update('summary', event.target.value)} /></label>
            <label>适龄范围<Input value={input.targetAge} onChange={(event) => update('targetAge', event.target.value)} /></label>
            <label>标签<Input value={input.tagsText} onChange={(event) => update('tagsText', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard title="封面与详情图" note="点击选择图片生成前端 mock 图片，不接真实上传">
          <div className="expert-upload-stack">
            <div className={input.coverFileName ? 'expert-course-image-preview' : 'expert-course-upload-empty'}>
              <span>{input.coverFileName || '课程封面图'}</span>
            </div>
            <Button block icon={<UploadOutlined />} onClick={addCoverImage}>选择封面图</Button>
            <div className="expert-course-image-grid">
              {(input.detailImageFileNames ?? []).map((fileName, index) => (
                <div className="expert-course-detail-image" key={fileName}>
                  <span>详情图 {index + 1}</span>
                  <strong>{fileName}</strong>
                  <Button size="small" onClick={() => removeDetailImage(fileName)}>删除</Button>
                </div>
              ))}
            </div>
            <Button block icon={<UploadOutlined />} onClick={addDetailImage}>选择课程详情图</Button>
          </div>
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard title="价格库存" note="免费活动会生成预约型订单，付费课程/直播/活动生成支付型订单">
          <Segmented
            block
            value={input.pricingType}
            onChange={(value) => update('pricingType', value as ProductWizardDraft['pricingType'])}
            options={[{ label: '免费', value: 'free' }, { label: '付费', value: 'paid' }]}
          />
          <div className="expert-form-grid">
            <label>标准价<InputNumber disabled={input.pricingType === 'free'} value={input.pricingType === 'free' ? 0 : input.price} min={0} onChange={(value) => update('price', Number(value ?? 0))} /></label>
            <label>库存<InputNumber value={input.capacity} min={1} onChange={(value) => update('capacity', Number(value ?? 1))} /></label>
          </div>
          <div className="expert-form-stack">
            <label>预约截止<Input value={input.bookingDeadline} onChange={(event) => update('bookingDeadline', event.target.value)} /></label>
            <label>上架时间<Input value={input.publishAt} onChange={(event) => update('publishAt', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 4 ? (
        <SectionCard title="交付与章节" note="章节进入独立二级页维护，列表只展示目录和顺序">
          <div className="expert-form-stack">
            <label>地点/形式<Input value={input.location} onChange={(event) => update('location', event.target.value)} /></label>
            <label>排期/场次<Input value={input.schedule} onChange={(event) => update('schedule', event.target.value)} /></label>
            <label>交付说明<Input.TextArea rows={3} value={input.deliveryPlan} onChange={(event) => update('deliveryPlan', event.target.value)} /></label>
            {input.productType === 'online_course' ? <label>课程形式<Input value={input.courseFormat} onChange={(event) => update('courseFormat', event.target.value)} /></label> : null}
            {input.productType === 'live_course' ? (
              <>
                <label>直播嘉宾<Input value={input.guestName} onChange={(event) => update('guestName', event.target.value)} /></label>
                <label>直播时间<Input value={input.liveTime} onChange={(event) => update('liveTime', event.target.value)} /></label>
                <Button block icon={<UploadOutlined />} onClick={() => update('liveQrCode', mockCourseImageName(input.title, '直播二维码'))}>{input.liveQrCode ? `已选择：${input.liveQrCode}` : '选择直播二维码'}</Button>
              </>
            ) : null}
            {input.productType === 'activity' ? (
              <>
                <label>集合信息<Input value={input.meetingPoint} onChange={(event) => update('meetingPoint', event.target.value)} /></label>
                <label>安全须知<Input.TextArea rows={3} value={input.safetyNotice} onChange={(event) => update('safetyNotice', event.target.value)} /></label>
              </>
            ) : null}
          </div>
          <div className="expert-course-chapter-tools">
            <strong>课程目录</strong>
            <Button size="small" type="primary" href="/courses/new/chapters/new">新增章节</Button>
          </div>
          <div className="expert-list">
            {normalizeCourseChapters(input.chapters).map((chapter, index) => (
              <div className="expert-chapter-manage-card" key={chapter.id}>
                <Link href={`/courses/new/chapters/${chapter.id}`}>
                  <em>{String(index + 1).padStart(2, '0')}</em>
                  <span>
                    <strong>{chapter.title}</strong>
                    <small>{courseContentTypeLabel(chapter.contentType)} · {chapter.duration}{input.productType === 'online_course' && chapter.isTrial ? ' · 可试听' : ''}</small>
                  </span>
                  <RightOutlined />
                </Link>
                <div>
                  <Button size="small" disabled={index === 0} onClick={() => moveChapter(chapter.id, -1)}>上移</Button>
                  <Button size="small" disabled={index === input.chapters.length - 1} onClick={() => moveChapter(chapter.id, 1)}>下移</Button>
                  <Button size="small" danger onClick={() => removeChapter(chapter.id)}>删除</Button>
                </div>
              </div>
            ))}
            {input.chapters.length === 0 ? <MobileEmpty text="还没有章节，请新增课程目录" action={<Button type="primary" href="/courses/new/chapters/new">新增章节</Button>} /> : null}
          </div>
        </SectionCard>
      ) : null}

      {step === 5 ? (
        <SectionCard title="预览与提交" note="提交前检查图片、二维码、库存和价格，章节可创建后继续维护">
          <div className="expert-confirm-list">
            <div><span>课程类型</span><strong>{PRODUCT_TYPE_META[input.productType].label}</strong></div>
            <div><span>课程名称</span><strong>{input.title || '待填写课程名称'}</strong></div>
            <div><span>价格库存</span><strong>{formatCoursePrice(input)} · 库存 {input.capacity}</strong></div>
            <div><span>封面图</span><strong>{input.coverFileName || '待上传'}</strong></div>
            <div><span>详情图</span><strong>{input.detailImageFileNames?.length ?? 0} 张</strong></div>
            <div><span>课程目录</span><strong>{input.chapters.length} 个章节</strong></div>
          </div>
          <div className="expert-top-gap">
            {previewIssues.length ? previewIssues.map((issue) => <div className="expert-alert-row" key={issue}><ClockCircleOutlined /><span>{issue}</span></div>) : <div className="expert-alert-row expert-alert-success"><SafetyCertificateOutlined /><span>预览检查通过，可以提交运营审核。</span></div>}
          </div>
        </SectionCard>
      ) : null}

      <PageActionBar>
        {step > 0 ? <Button onClick={() => setStep((current) => current - 1)}>上一步</Button> : <Button onClick={() => router.back()}>取消</Button>}
        {step < COURSE_WIZARD_STEPS.length - 1 ? (
          <Button type="primary" onClick={() => setStep((current) => current + 1)}>下一步</Button>
        ) : (
          <Button type="primary" onClick={save}>提交审核</Button>
        )}
      </PageActionBar>
    </div>
  );
}

export function ExpertCourseDraftChapterPage() {
  const chapterId = useRouteParam('draftChapterId');
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [draft] = useState(() => readCourseDraft());
  const [chapter, setChapter] = useState<CourseChapter>(() => {
    const currentDraft = readCourseDraft();
    const found = currentDraft?.chapters.find((item) => item.id === chapterId);
    return found ?? buildEmptyChapter(currentDraft?.productType ?? 'online_course', currentDraft?.chapters.length ?? 0);
  });

  if (!draft) {
    return <MobileEmpty text="课程草稿不存在，请重新进入新建课程" action={<Button href="/courses/new">返回新建课程</Button>} />;
  }
  const courseDraft = draft;

  function update<K extends keyof CourseChapter>(key: K, value: CourseChapter[K]) {
    setChapter((current) => ({ ...current, [key]: value }));
  }

  function chooseContent() {
    const fileName = mockChapterFileName(chapter);
    setChapter((current) => ({ ...current, fileName, contentUrl: fileName }));
  }

  function saveChapter() {
    const nextChapter = { ...chapter, id: chapter.id ?? createClientId('chapter') };
    if (!nextChapter.title.trim()) {
      messageApi.warning('请填写章节标题');
      return;
    }
    if (!nextChapter.contentUrl?.trim()) {
      messageApi.warning('请选择章节内容文件或链接');
      return;
    }
    const exists = courseDraft.chapters.some((item) => item.id === chapterId);
    const nextChapters = exists
      ? courseDraft.chapters.map((item) => (item.id === chapterId ? nextChapter : item))
      : [...courseDraft.chapters, { ...nextChapter, sortOrder: courseDraft.chapters.length + 1 }];
    writeCourseDraft({ ...courseDraft, chapters: normalizeCourseChapters(nextChapters) });
    messageApi.success('章节已保存');
    router.replace(`/courses/new?type=${courseDraft.productType}&step=chapters`);
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title={chapterId === 'new' ? '新增章节' : '编辑章节'} note="章节内容上传为前端 mock，适配移动端点击选择">
        <div className="expert-form-stack">
          <label>章节标题<Input value={chapter.title} onChange={(event) => update('title', event.target.value)} /></label>
          <label>章节简介<Input.TextArea rows={3} value={chapter.summary} onChange={(event) => update('summary', event.target.value)} /></label>
          <label>内容类型<Select value={chapter.contentType} onChange={(value) => update('contentType', value as CourseChapter['contentType'])} options={COURSE_CONTENT_TYPE_OPTIONS} /></label>
          <label>时长<Input value={chapter.duration} onChange={(event) => update('duration', event.target.value)} /></label>
          <Button block icon={<UploadOutlined />} onClick={chooseContent}>{chapter.contentUrl ? `已选择：${chapter.contentUrl}` : chapter.contentType === 'link' ? '生成模拟课程链接' : '选择内容文件'}</Button>
          {courseDraft.productType === 'online_course' ? <label className="expert-switch-line">是否试听<Switch checked={Boolean(chapter.isTrial)} onChange={(checked) => update('isTrial', checked)} /></label> : null}
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={saveChapter}>保存章节</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertCourseDetailPage() {
  const productId = useRouteId();
  const { state, setProductStatus } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState<'intro' | 'catalog'>('intro');
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    return <MobileEmpty text="没有找到该课程产品" action={<Button href="/courses">返回课程</Button>} />;
  }

  const productType = normalizedProductType(product.productType);
  const chapters = normalizeCourseChapters(product.chapters);
  const visibleTags = product.tags.filter((tag, index, list) => tag !== PRODUCT_TYPE_META[productType].label && list.indexOf(tag) === index);
  const productOrders = state.orders.filter((order) => order.productId === product.id);
  const orderAmount = productOrders.reduce((sum, order) => sum + order.amount - (order.refundAmount ?? 0), 0);
  const productRefunds = state.refundRequests.filter((refund) => refund.productId === product.id);
  const previewIssues = getCoursePreviewIssues(productToInput(product, chapters));

  return (
    <div className="expert-page expert-page-with-action-bar">
      {contextHolder}
      <section className="expert-course-hero-card">
        <div className="expert-course-hero-cover"><span>{product.coverFileName || '课程封面'}</span></div>
        <div className="expert-course-hero-body">
          <div className="expert-inline expert-space-between">
            {statusTag(PRODUCT_STATUS_META[product.status])}
            <Button size="small" href={`/courses/${product.id}/edit`}>修改课程信息</Button>
          </div>
          <h2>{product.title}</h2>
          <p>{courseDeliverySummary(product)}</p>
          <div className="expert-course-tags">
            <Tag>{PRODUCT_TYPE_META[productType].label}</Tag>
            {visibleTags.slice(0, 3).map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </div>
        </div>
      </section>

      <SectionCard title="订单概况" note="点击数据进入销售与订单，并按当前课程筛选">
        <div className="expert-mobile-kpi-row">
          <div><strong>{product.views}</strong><span>累计浏览</span></div>
          <Link href={`/me/orders?tab=orders&productId=${product.id}`}><strong>{productOrders.length}</strong><span>订单数</span></Link>
          <Link href={`/me/orders?tab=orders&productId=${product.id}`}><strong>{formatMoney(orderAmount)}</strong><span>订单金额</span></Link>
          <Link href={`/me/orders?tab=refunds&productId=${product.id}`}><strong>{productRefunds.length}</strong><span>退款申请</span></Link>
        </div>
      </SectionCard>

      <Segmented
        block
        value={activeTab}
        onChange={(value) => setActiveTab(value as 'intro' | 'catalog')}
        options={[
          { label: '课程介绍', value: 'intro' },
          { label: `课程目录（${chapters.length}）`, value: 'catalog' },
        ]}
      />

      {activeTab === 'intro' ? (
        <section className="expert-course-intro">
          <div className="expert-course-intro-meta">
            <div><span>适龄</span><strong>{product.targetAge}</strong></div>
            <div><span>价格</span><strong>{formatCoursePrice(product)}</strong></div>
            <div><span>排期</span><strong>{product.schedule}</strong></div>
            <div><span>交付</span><strong>{product.deliveryPlan}</strong></div>
          </div>
          <div className="expert-course-detail-images">
            {(product.detailImageFileNames ?? []).map((fileName, index) => (
              <figure key={fileName}>
                <div><span>课程详情图 {index + 1}</span></div>
                <figcaption>{fileName}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : (
        <SectionCard
          title="课程目录"
          note={productType === 'online_course' ? '点击章节查看内容详情，试听章节会在目录中标记' : productType === 'live_course' ? '直播大纲与资料目录' : '活动流程与资料目录'}
          extra={<Link className="expert-primary-link" href={`/courses/${product.id}/chapters/new`}>新增章节</Link>}
        >
          <div className="expert-course-catalog">
            {chapters.map((chapter, index) => (
              <Link href={`/courses/${product.id}/chapters/${chapter.id}`} key={chapter.id} className="expert-course-catalog-row">
                <em>{String(index + 1).padStart(2, '0')}</em>
                <span>
                  <strong>{chapter.title}</strong>
                  <small>{courseContentTypeLabel(chapter.contentType)} · {chapter.duration}</small>
                </span>
                {productType === 'online_course' && chapter.isTrial ? <Tag color="orange">试听</Tag> : null}
                <RightOutlined />
              </Link>
            ))}
            {chapters.length === 0 ? <MobileEmpty text="还没有课程目录，可创建后继续新增章节" action={<Button href={`/courses/${product.id}/chapters/new`}>新增章节</Button>} /> : null}
          </div>
          {productType === 'live_course' ? (
            <div className="expert-qr-card">
              <QRCode value={product.liveQrCode || '未配置直播二维码'} size={132} />
              <span>{product.liveQrCode || '直播二维码未配置'}</span>
            </div>
          ) : null}
          <div className="expert-top-gap">
            {previewIssues.length ? previewIssues.map((issue) => <div className="expert-alert-row" key={issue}><ClockCircleOutlined /><span>{issue}</span></div>) : <div className="expert-alert-row expert-alert-success"><SafetyCertificateOutlined /><span>预览检查通过。</span></div>}
          </div>
          <Button block className="expert-top-gap" href={`/courses/${product.id}/chapters/new`}>新增章节</Button>
        </SectionCard>
      )}

      <PageActionBar>
        {product.status === 'pending_review' ? (
          <>
            <Button danger onClick={() => { setProductStatus(product.id, 'rejected'); messageApi.warning('课程审核已驳回'); }}>审核驳回</Button>
            <Button type="primary" onClick={() => { setProductStatus(product.id, 'published'); messageApi.success('课程审核通过并上架'); }}>运营审核通过</Button>
          </>
        ) : null}
        {product.status === 'rejected' || product.status === 'draft' ? (
          <Button block type="primary" onClick={() => { setProductStatus(product.id, 'pending_review'); messageApi.success('课程已重新提交审核'); }}>提交运营审核</Button>
        ) : null}
        {product.status === 'published' ? <Button block onClick={() => setProductStatus(product.id, 'unpublished')}>下架</Button> : null}
        {product.status === 'unpublished' || product.status === 'ended' ? <Button block type="primary" onClick={() => setProductStatus(product.id, 'published')}>重新上架</Button> : null}
      </PageActionBar>
    </div>
  );
}

export function ExpertCourseEditPage() {
  const productId = useRouteId();
  const { state, saveProduct } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const product = state.products.find((item) => item.id === productId);
  const [draft, setDraft] = useState(() =>
    product
      ? {
          title: product.title,
          summary: product.summary,
          targetAge: product.targetAge,
          pricingType: product.pricingType,
          price: product.price,
          capacity: product.capacity,
          location: product.location,
          schedule: product.schedule,
          bookingDeadline: product.bookingDeadline,
          deliveryPlan: product.deliveryPlan,
          liveQrCode: product.liveQrCode ?? '',
          coverFileName: product.coverFileName ?? '',
          detailImageFileNames: product.detailImageFileNames ?? [],
          materialFileName: product.materialFileName ?? '',
          tagsText: product.tags.join('、'),
        }
      : null,
  );

  if (!product || !draft) {
    return <MobileEmpty text="没有找到该课程产品" action={<Button href="/courses">返回课程</Button>} />;
  }

  const course = product;
  const editDraft = draft;
  const productType = normalizedProductType(course.productType);

  function update<K extends keyof NonNullable<typeof draft>>(key: K, value: NonNullable<typeof draft>[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function submit() {
    const input: ProductInput = {
      ...productToInput(course),
      title: editDraft.title,
      summary: editDraft.summary,
      targetAge: editDraft.targetAge,
      pricingType: editDraft.pricingType,
      price: editDraft.pricingType === 'free' ? 0 : editDraft.price,
      capacity: editDraft.capacity,
      location: editDraft.location,
      schedule: editDraft.schedule,
      bookingDeadline: editDraft.bookingDeadline,
      deliveryPlan: editDraft.deliveryPlan,
      liveQrCode: productType === 'live_course' ? editDraft.liveQrCode : undefined,
      coverFileName: editDraft.coverFileName,
      detailImageFileNames: editDraft.detailImageFileNames,
      materialFileName: editDraft.materialFileName,
      tags: parseTags(editDraft.tagsText),
    };
    const issues = getCoursePreviewIssues(input);
    if (issues.length) {
      messageApi.warning(`请先补齐：${issues[0]}`);
      return;
    }
    saveProduct(input, course.id);
    messageApi.success('课程信息已保存');
    router.replace(`/courses/${course.id}`);
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="编辑课程信息" note="课程详情页负责预览，字段编辑集中在这个二级页">
        <div className="expert-form-stack">
          <label>课程类型<Input disabled value={PRODUCT_TYPE_META[productType].label} /></label>
          <label>课程名称<Input value={editDraft.title} onChange={(event) => update('title', event.target.value)} /></label>
          <label>简介<Input.TextArea rows={4} value={editDraft.summary} onChange={(event) => update('summary', event.target.value)} /></label>
          <label>适龄范围<Input value={editDraft.targetAge} onChange={(event) => update('targetAge', event.target.value)} /></label>
          <Segmented block value={editDraft.pricingType} onChange={(value) => update('pricingType', value as ProductWizardDraft['pricingType'])} options={[{ label: '免费', value: 'free' }, { label: '付费', value: 'paid' }]} />
          <div className="expert-form-grid">
            <label>价格<InputNumber disabled={editDraft.pricingType === 'free'} min={0} value={editDraft.pricingType === 'free' ? 0 : editDraft.price} onChange={(value) => update('price', Number(value ?? 0))} /></label>
            <label>库存<InputNumber min={1} value={editDraft.capacity} onChange={(value) => update('capacity', Number(value ?? 1))} /></label>
          </div>
          <label>地点/形式<Input value={editDraft.location} onChange={(event) => update('location', event.target.value)} /></label>
          <label>排期<Input value={editDraft.schedule} onChange={(event) => update('schedule', event.target.value)} /></label>
          <label>预约截止<Input value={editDraft.bookingDeadline} onChange={(event) => update('bookingDeadline', event.target.value)} /></label>
          <label>交付计划<Input.TextArea rows={4} value={editDraft.deliveryPlan} onChange={(event) => update('deliveryPlan', event.target.value)} /></label>
          {productType === 'live_course' ? <Button block icon={<UploadOutlined />} onClick={() => update('liveQrCode', mockCourseImageName(editDraft.title, '直播二维码'))}>{editDraft.liveQrCode ? `已选择：${editDraft.liveQrCode}` : '选择直播二维码'}</Button> : null}
          <Button block icon={<UploadOutlined />} onClick={() => update('coverFileName', mockCourseImageName(editDraft.title, '封面图'))}>{editDraft.coverFileName ? `封面：${editDraft.coverFileName}` : '选择封面图'}</Button>
          <div className="expert-course-image-grid">
            {editDraft.detailImageFileNames.map((fileName, index) => (
              <div className="expert-course-detail-image" key={fileName}>
                <span>详情图 {index + 1}</span>
                <strong>{fileName}</strong>
                <Button size="small" onClick={() => update('detailImageFileNames', editDraft.detailImageFileNames.filter((item) => item !== fileName))}>删除</Button>
              </div>
            ))}
          </div>
          <Button block icon={<UploadOutlined />} onClick={() => update('detailImageFileNames', [...editDraft.detailImageFileNames, mockCourseImageName(editDraft.title, `详情图${editDraft.detailImageFileNames.length + 1}`)])}>选择课程详情图</Button>
          <label>课程资料<Input prefix={<UploadOutlined />} value={editDraft.materialFileName} onChange={(event) => update('materialFileName', event.target.value)} /></label>
          <label>标签<Input value={editDraft.tagsText} onChange={(event) => update('tagsText', event.target.value)} /></label>
        </div>
      </SectionCard>
      <SectionCard title="课程目录" note="章节新增、查看与编辑在课程目录二级页完成">
        <div className="expert-list">
          {normalizeCourseChapters(course.chapters).map((chapter, index) => (
            <Link className="expert-course-catalog-row" href={`/courses/${course.id}/chapters/${chapter.id}`} key={chapter.id}>
              <em>{String(index + 1).padStart(2, '0')}</em>
              <span><strong>{chapter.title}</strong><small>{courseContentTypeLabel(chapter.contentType)} · {chapter.duration}</small></span>
              <RightOutlined />
            </Link>
          ))}
        </div>
        <Button block className="expert-top-gap" href={`/courses/${course.id}/chapters/new`}>新增章节</Button>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>保存</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertCourseChapterDetailPage() {
  const productId = useRouteId();
  const chapterId = useRouteParam('chapterId');
  const { state, saveProduct } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const product = state.products.find((item) => item.id === productId);
  const chapters = normalizeCourseChapters(product?.chapters ?? []);
  const existingChapter = chapters.find((item) => item.id === chapterId);
  const [editing, setEditing] = useState(chapterId === 'new');
  const [draft, setDraft] = useState<CourseChapter>(() => existingChapter ?? buildEmptyChapter(product?.productType ?? 'online_course', chapters.length));

  if (!product) {
    return <MobileEmpty text="没有找到该课程产品" action={<Button href="/courses">返回课程</Button>} />;
  }
  const course = product;

  function update<K extends keyof CourseChapter>(key: K, value: CourseChapter[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function chooseContent() {
    const fileName = mockChapterFileName(draft);
    setDraft((current) => ({ ...current, fileName, contentUrl: fileName }));
  }

  function saveChapter() {
    if (!draft.title.trim()) {
      messageApi.warning('请填写章节标题');
      return;
    }
    if (!draft.contentUrl?.trim()) {
      messageApi.warning('请选择章节内容文件或链接');
      return;
    }
    const nextChapter = { ...draft, id: draft.id ?? createClientId('chapter') };
    const exists = chapters.some((chapter) => chapter.id === chapterId);
    const nextChapters = exists ? chapters.map((chapter) => (chapter.id === chapterId ? nextChapter : chapter)) : [...chapters, { ...nextChapter, sortOrder: chapters.length + 1 }];
    saveProduct(productToInput(course, nextChapters), course.id);
    messageApi.success('章节已保存');
    router.replace(`/courses/${course.id}/chapters/${nextChapter.id}`);
  }

  if (!existingChapter && chapterId !== 'new') {
    return <MobileEmpty text="没有找到该章节" action={<Button href={`/courses/${course.id}`}>返回课程详情</Button>} />;
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title={editing ? '编辑章节' : draft.title} note={editing ? '章节内容上传为前端 mock' : `${courseContentTypeLabel(draft.contentType)} · ${draft.duration}`}>
        {editing ? (
          <div className="expert-form-stack">
            <label>章节标题<Input value={draft.title} onChange={(event) => update('title', event.target.value)} /></label>
            <label>章节简介<Input.TextArea rows={3} value={draft.summary} onChange={(event) => update('summary', event.target.value)} /></label>
            <label>内容类型<Select value={draft.contentType} onChange={(value) => update('contentType', value as CourseChapter['contentType'])} options={COURSE_CONTENT_TYPE_OPTIONS} /></label>
            <label>时长<Input value={draft.duration} onChange={(event) => update('duration', event.target.value)} /></label>
            <Button block icon={<UploadOutlined />} onClick={chooseContent}>{draft.contentUrl ? `已选择：${draft.contentUrl}` : draft.contentType === 'link' ? '生成模拟课程链接' : '选择内容文件'}</Button>
            {normalizedProductType(course.productType) === 'online_course' ? <label className="expert-switch-line">是否试听<Switch checked={Boolean(draft.isTrial)} onChange={(checked) => update('isTrial', checked)} /></label> : null}
          </div>
        ) : (
          <div className="expert-course-chapter-detail">
            <p>{draft.summary}</p>
            <div className="expert-confirm-list">
              <div><span>内容类型</span><strong>{courseContentTypeLabel(draft.contentType)}</strong></div>
              <div><span>内容文件</span><strong>{draft.contentUrl || draft.fileName || '待配置'}</strong></div>
              <div><span>时长</span><strong>{draft.duration}</strong></div>
              {normalizedProductType(course.productType) === 'online_course' ? <div><span>试听</span><strong>{draft.isTrial ? '允许试听' : '不试听'}</strong></div> : null}
            </div>
          </div>
        )}
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => (editing ? setEditing(false) : router.back())}>{editing ? '取消' : '返回'}</Button>
        {editing ? <Button type="primary" onClick={saveChapter}>保存章节</Button> : <Button type="primary" onClick={() => setEditing(true)}>编辑章节</Button>}
      </PageActionBar>
    </div>
  );
}

export function ExpertCourseOrdersPage() {
  const { state, createOrder } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="销售与订单" note="课程经营能力放在课程二级页">
        <div className="expert-mobile-kpi-row">
          <div><strong>{state.orders.length}</strong><span>订单</span></div>
          <div><strong>{formatMoney(state.products.reduce((sum, item) => sum + item.payAmount, 0))}</strong><span>支付</span></div>
          <div><strong>{formatMoney(state.products.reduce((sum, item) => sum + item.refundAmount, 0))}</strong><span>退款</span></div>
        </div>
      </SectionCard>
      <SectionCard title="产品销售">
        <div className="expert-list">
          {state.products.map((product) => (
            <EntityCard
              key={product.id}
              title={product.title}
              subtitle={`${product.views} 浏览 · ${product.reservations} 预约`}
              meta={<Tag color="success">{formatMoney(product.payAmount - product.refundAmount)}</Tag>}
              actions={<Button size="small" disabled={product.status !== 'published'} onClick={() => { createOrder(product.id); messageApi.success('已新增预约订单'); }}>新增预约</Button>}
            >
              <Progress percent={Math.min(100, Math.round((product.reservations / Math.max(product.capacity, 1)) * 100))} size="small" />
            </EntityCard>
          ))}
          {state.products.length === 0 ? <MobileEmpty text="请先创建课程产品并通过运营审核" action={<Button type="primary" href="/courses/new">新建课程</Button>} /> : null}
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertCourseWriteOffPage() {
  const { state, writeOffOrder } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [code, setCode] = useState('YX0518A6');

  function submit() {
    const result = writeOffOrder(code);
    if (result.status === 'success') {
      messageApi.success(result.message);
    } else {
      messageApi.warning(result.message);
    }
  }

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="课程核销" note="线下课程、大咖面对面和 PBL 活动的履约入口">
        <div className="expert-form-stack">
          <label>预约码<Input prefix={<ScanOutlined />} value={code} onChange={(event) => setCode(event.target.value)} /></label>
          <Button type="primary" onClick={submit}>确认核销</Button>
        </div>
      </SectionCard>
      <SectionCard title="核销记录">
        <div className="expert-list">
          {state.writeOffRecords.map((record) => (
            <EntityCard key={record.id} title={record.reservationCode} subtitle={`${record.productTitle} · ${formatDate(record.createdAt)}`} meta={<Tag color={record.status === 'success' ? 'success' : record.status === 'duplicate' ? 'warning' : 'error'}>{record.message}</Tag>} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertCourseDistributionPage() {
  const { state, updateDistributionPlan } = useExpertStore();

  return (
    <div className="expert-page">
      <SectionCard title="分销配置" note="按课程设置佣金比例，不占用我的页">
        <div className="expert-list">
          {state.products.map((product) => {
            const plan = state.distributionPlans.find((item) => item.productId === product.id);
            return (
              <EntityCard key={product.id} title={product.title} subtitle={PRODUCT_TYPE_META[product.productType].label} meta={<Switch checked={Boolean(plan?.enabled)} onChange={(enabled) => updateDistributionPlan(product.id, { enabled })} />}>
                <div className="expert-form-grid">
                  <label>佣金比例<InputNumber min={0} max={60} value={plan?.commissionRate ?? 0} addonAfter="%" onChange={(value) => updateDistributionPlan(product.id, { commissionRate: Number(value ?? 0) })} /></label>
                  <div className="expert-mini-stat"><span>分销表现</span><strong>{plan?.orderCount ?? 0} 单 / {formatMoney(plan?.commissionAmount ?? 0)}</strong></div>
                </div>
              </EntityCard>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertMeOrdersPage() {
  const { state, createOrder, createRefundRequest, approveRefund, rejectRefund, writeOffOrder } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [panel, setPanel] = useState<OrdersPanelKey>('orders');
  const [filters, setFilters] = useState({ keyword: '', status: 'all', productId: 'all', startDate: '', endDate: '' });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refundDraft, setRefundDraft] = useState({ amount: 0, reason: '客户申请退款' });
  const [verifyCode, setVerifyCode] = useState('');
  const selectedOrder = state.orders.find((order) => order.id === selectedOrderId) ?? null;
  const selectedOrderProduct = selectedOrder ? state.products.find((item) => item.id === selectedOrder.productId) : undefined;
  const productOptions = [
    { label: '全部产品', value: 'all' },
    ...state.products.map((product) => ({ label: product.title, value: product.id })),
  ];
  const filteredOrders = state.orders.filter((order) => {
    const product = state.products.find((item) => item.id === order.productId);
    const text = `${order.id}${product?.title ?? ''}${order.customerName}${order.customerPhone}${order.reservationCode}${order.verificationCode ?? ''}`;
    if (filters.productId !== 'all' && order.productId !== filters.productId) {
      return false;
    }
    if (filters.keyword.trim() && !text.includes(filters.keyword.trim())) {
      return false;
    }
    if (filters.status !== 'all' && order.status !== filters.status) {
      return false;
    }
    if (filters.startDate && order.createdAt.slice(0, 10) < filters.startDate) {
      return false;
    }
    if (filters.endDate && order.createdAt.slice(0, 10) > filters.endDate) {
      return false;
    }
    return true;
  });
  const pendingRefunds = state.refundRequests.filter((refund) => refund.status === 'pending');
  const filteredRefunds = state.refundRequests.filter((refund) => filters.productId === 'all' || refund.productId === filters.productId);
  const verifiableOrder = state.orders.find((order) => {
    const product = state.products.find((item) => item.id === order.productId);
    return product && !isOnlineCourse(product.productType) && order.verificationCode && order.status !== 'written_off' && order.status !== 'refunded' && order.status !== 'cancelled';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const productId = params.get('productId');
    if (tab === 'refunds' || tab === 'verify' || tab === 'orders') {
      setPanel(tab);
    }
    if (productId && state.products.some((product) => product.id === productId)) {
      setFilters((current) => ({ ...current, productId }));
    }
  }, [state.products]);

  function exportCsv() {
    const headers = ['订单号', '课程产品名称', '客户姓名', '客户手机号', '订单时间', '订单金额', '订单状态'];
    const rows = filteredOrders.map((order) => {
      const product = state.products.find((item) => item.id === order.productId);
      return [
        order.id,
        product?.title ?? '未知产品',
        order.customerName,
        order.customerPhone,
        formatDate(order.createdAt),
        String(order.amount),
        ORDER_STATUS_META[order.status].label,
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `专家端订单_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    messageApi.success('订单 CSV 已导出');
  }

  function requestRefund(order: OrderRecord) {
    const amount = refundDraft.amount || Math.max(1, order.amount - (order.refundAmount ?? 0));
    const id = createRefundRequest(order.id, amount, refundDraft.reason);
    if (!id) {
      messageApi.warning('该订单暂不支持退款申请');
      return;
    }
    setPanel('refunds');
    setSelectedOrderId(null);
    messageApi.success('退款申请已生成');
  }

  function openOrderDrawer(order: OrderRecord) {
    setSelectedOrderId(order.id);
    setRefundDraft({
      amount: Math.max(0, order.amount - (order.refundAmount ?? 0)),
      reason: '客户申请退款',
    });
  }

  function submitVerify() {
    const result = writeOffOrder(verifyCode);
    if (result.status === 'success') {
      messageApi.success(result.message);
      setVerifyCode('');
    } else {
      messageApi.warning(result.message);
    }
  }

  function generateDemoOrder(options?: { verifiableOnly?: boolean }) {
    const publishedProducts = state.products.filter((product) => product.status === 'published');
    const scopedProduct = filters.productId !== 'all' ? publishedProducts.find((product) => product.id === filters.productId) : undefined;
    const product = options?.verifiableOnly
      ? publishedProducts.find((item) => !isOnlineCourse(item.productType))
      : scopedProduct ?? publishedProducts[0];

    if (!product) {
      messageApi.warning(options?.verifiableOnly ? '请先上架直播或活动课程' : '请先上架课程产品');
      return;
    }

    const order = createOrder(product.id);
    if (!order) {
      messageApi.warning('暂未生成演示订单');
      return;
    }
    if (options?.verifiableOnly && order.verificationCode) {
      setVerifyCode(order.verificationCode);
    }
    messageApi.success('演示订单已生成');
  }

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="销售与订单" note="作为我的二级功能入口，不占用底部导航">
        <div className="expert-mobile-kpi-row">
          <div><strong>{state.orders.length}</strong><span>订单</span></div>
          <div><strong>{formatMoney(state.orders.reduce((sum, order) => sum + order.amount, 0))}</strong><span>订单金额</span></div>
          <div><strong>{pendingRefunds.length}</strong><span>待退款</span></div>
          <div><strong>{state.writeOffRecords.filter((item) => item.status === 'success').length}</strong><span>已核销</span></div>
        </div>
      </SectionCard>

      <Segmented
        block
        value={panel}
        onChange={(value) => setPanel(value as OrdersPanelKey)}
        options={[
          { label: '订单', value: 'orders' },
          { label: '退款', value: 'refunds' },
          { label: '核销', value: 'verify' },
        ]}
      />

      {panel === 'orders' ? (
        <>
          <SectionCard title="订单查询" note="可按日期、产品、客户姓名、手机号、订单状态搜索">
            <div className="expert-form-stack">
              <Input prefix={<SearchOutlined />} placeholder="产品/客户/手机号/订单号" value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} />
              <div className="expert-form-grid">
                <label>开始日期<Input value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} placeholder="2026-05-01" /></label>
                <label>结束日期<Input value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} placeholder="2026-05-31" /></label>
              </div>
              <Select value={filters.productId} onChange={(value) => setFilters((current) => ({ ...current, productId: value }))} options={productOptions} />
              <Select value={filters.status} onChange={(value) => setFilters((current) => ({ ...current, status: value }))} options={[{ label: '全部状态', value: 'all' }, ...Object.entries(ORDER_STATUS_META).map(([value, meta]) => ({ label: meta.label, value }))]} />
              <Button onClick={exportCsv}>导出 CSV</Button>
            </div>
          </SectionCard>

          <SectionCard title="订单列表" note="字段包含产品、客户、手机号、时间、金额和状态">
            {filteredOrders.length ? (
              <div className="expert-list">
                {filteredOrders.map((order) => {
                  const product = state.products.find((item) => item.id === order.productId);
                  return (
                    <EntityCard key={order.id} title={product?.title ?? '未知产品'} subtitle={`${order.customerName} · ${order.customerPhone} · ${formatDate(order.createdAt)}`} meta={statusTag(ORDER_STATUS_META[order.status])} tags={<><Tag>{formatMoney(order.amount)}</Tag>{order.verificationCode ? <Tag>核销码</Tag> : null}</>} actions={<Button size="small" onClick={() => openOrderDrawer(order)}>详情</Button>}>
                      <p>订单号：{order.id}</p>
                      <small>{order.channel} · {order.verificationCode ? '需核销' : '无需核销'}</small>
                    </EntityCard>
                  );
                })}
              </div>
            ) : <MobileEmpty text="没有符合条件的订单。" />}
            <div className="expert-top-gap">
              <Button block onClick={() => generateDemoOrder()}>生成演示数据</Button>
            </div>
          </SectionCard>

        </>
      ) : null}

      <Drawer
        title={
          <div className="expert-drawer-title">
            <strong>订单详情</strong>
            <Button aria-label="关闭订单详情" icon={<CloseOutlined />} shape="circle" type="text" onClick={() => setSelectedOrderId(null)} />
          </div>
        }
        placement="bottom"
        height="72%"
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
        closable={false}
        getContainer={false}
        rootClassName="expert-order-drawer-root"
        className="expert-order-drawer"
        rootStyle={{ position: 'absolute' }}
      >
        {selectedOrder ? (
          <div className="expert-drawer-content">
            <div className="expert-confirm-list">
              <div><span>产品</span><strong>{selectedOrderProduct?.title ?? '未知产品'}</strong></div>
              <div><span>课程类型</span><strong>{selectedOrderProduct ? PRODUCT_TYPE_META[selectedOrderProduct.productType].label : '未知'}</strong></div>
              <div><span>客户</span><strong>{selectedOrder.customerName} · {selectedOrder.customerPhone}</strong></div>
              <div><span>订单号</span><strong>{selectedOrder.id}</strong></div>
              <div><span>订单时间</span><strong>{formatDate(selectedOrder.createdAt)}</strong></div>
              <div><span>订单金额</span><strong>{formatMoney(selectedOrder.amount)}</strong></div>
              <div><span>已退金额</span><strong>{formatMoney(selectedOrder.refundAmount ?? 0)}</strong></div>
              <div><span>订单状态</span><strong>{ORDER_STATUS_META[selectedOrder.status].label}</strong></div>
              <div><span>支付时间</span><strong>{formatDate(selectedOrder.paidAt)}</strong></div>
              <div><span>退款申请</span><strong>{formatDate(selectedOrder.refundRequestedAt)}</strong></div>
              <div><span>退款时间</span><strong>{formatDate(selectedOrder.refundedAt)}</strong></div>
              <div><span>交付渠道</span><strong>{selectedOrder.channel}</strong></div>
              <div><span>预约码</span><strong>{selectedOrder.reservationCode}</strong></div>
              <div><span>核销时间</span><strong>{formatDate(selectedOrder.writtenOffAt)}</strong></div>
            </div>

            {selectedOrderProduct && !isOnlineCourse(selectedOrderProduct.productType) && selectedOrder.verificationCode ? (
              <div className="expert-qr-card">
                <QRCode value={selectedOrder.verificationCode} size={132} />
                <span>{selectedOrder.verificationCode}</span>
              </div>
            ) : (
              <p className="expert-note-box">线上课程无需核销码，学员购买后直接进入课程学习。</p>
            )}

            {selectedOrder.status === 'paid' || selectedOrder.status === 'partial_refunded' ? (
              <div className="expert-drawer-action-card">
                <strong>退款申请</strong>
                <InputNumber min={1} max={Math.max(1, selectedOrder.amount - (selectedOrder.refundAmount ?? 0))} value={refundDraft.amount || selectedOrder.amount - (selectedOrder.refundAmount ?? 0)} onChange={(value) => setRefundDraft((current) => ({ ...current, amount: Number(value ?? 0) }))} />
                <Input value={refundDraft.reason} onChange={(event) => setRefundDraft((current) => ({ ...current, reason: event.target.value }))} />
                <Button type="primary" onClick={() => requestRefund(selectedOrder)}>提交退款申请</Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      {panel === 'refunds' ? (
        <SectionCard title="退款申请" note="支持全额和部分退款处理">
          <div className="expert-form-stack">
            <Select value={filters.productId} onChange={(value) => setFilters((current) => ({ ...current, productId: value }))} options={productOptions} />
          </div>
          {filteredRefunds.length ? (
            <div className="expert-list expert-top-gap">
              {filteredRefunds.map((refund) => {
                const order = state.orders.find((item) => item.id === refund.orderId);
                const product = state.products.find((item) => item.id === refund.productId);
                return (
                  <EntityCard key={refund.id} title={product?.title ?? '未知产品'} subtitle={`${refund.customerName} · ${formatDate(refund.requestedAt)}`} meta={<Tag color={refund.status === 'pending' ? 'warning' : refund.status === 'approved' ? 'success' : 'error'}>{refund.status === 'pending' ? '待处理' : refund.status === 'approved' ? '已退款' : '已驳回'}</Tag>} tags={<Tag>{formatMoney(refund.amount)}</Tag>}>
                    <p>{refund.reason}</p>
                    {refund.handlerNote ? <small>处理说明：{refund.handlerNote}</small> : null}
                    {refund.status === 'pending' && order ? (
                      <div className="expert-form-grid">
                        <Button size="small" type="primary" onClick={() => { approveRefund(refund.id, refund.amount, '专家端确认退款'); messageApi.success('退款已处理'); }}>确认退款</Button>
                        <Button size="small" danger onClick={() => { rejectRefund(refund.id, '资料不完整，暂不退款'); messageApi.warning('退款已驳回'); }}>驳回</Button>
                      </div>
                    ) : null}
                  </EntityCard>
                );
              })}
            </div>
          ) : <MobileEmpty text="暂无退款申请。" />}
        </SectionCard>
      ) : null}

      {panel === 'verify' ? (
        <SectionCard title="订单核销" note="直播和活动订单使用 12 位数字字母核销码">
          <div className="expert-form-stack">
            <Input prefix={<ScanOutlined />} placeholder="输入核销码" value={verifyCode} onChange={(event) => setVerifyCode(event.target.value.toUpperCase())} />
            <div className="expert-form-grid">
              <Button onClick={() => { if (verifiableOrder?.verificationCode) { setVerifyCode(verifiableOrder.verificationCode); messageApi.success('已模拟扫码读取核销码'); } else { messageApi.warning('暂无可核销订单'); } }}>模拟扫码</Button>
              <Button type="primary" onClick={submitVerify}>确认核销</Button>
            </div>
          </div>
          <div className="expert-list expert-top-gap">
            {state.writeOffRecords.map((record) => (
              <EntityCard key={record.id} title={record.reservationCode} subtitle={`${record.productTitle} · ${formatDate(record.createdAt)}`} meta={<Tag color={record.status === 'success' ? 'success' : record.status === 'duplicate' ? 'warning' : 'error'}>{record.message}</Tag>} />
            ))}
          </div>
          <div className="expert-top-gap">
            <Button block onClick={() => generateDemoOrder({ verifiableOnly: true })}>生成演示数据</Button>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}

const CHALLENGE_TEMPLATE_LIBRARY = [
  {
    key: 'basic-shape',
    title: '基础形状打印挑战',
    difficulty: '入门' as ChallengeInput['difficulty'],
    objective: '掌握基础建模或 3D 打印笔操作，理解三维空间概念。',
    description: '使用 3D 打印笔或基础建模软件制作立方体、球体等简单几何体，并说明结构特点。',
    workRequirement: '提交作品照片、建模过程截图和 100 字结构说明。',
    dimensionsText: '空间结构、操作规范、表达完整度',
    rewardGrowth: 30,
    targetAge: '10-13岁',
    tagsText: '3D打印、空间想象',
  },
  {
    key: 'daily-tool',
    title: '实用小物件设计',
    difficulty: '入门' as ChallengeInput['difficulty'],
    objective: '学习功能导向设计，解决壁厚和结构稳定性问题。',
    description: '设计并打印手机支架或笔筒，说明使用场景和结构方案。',
    workRequirement: '提交设计草图、打印作品照片和稳定性测试记录。',
    dimensionsText: '功能设计、结构稳定、场景表达',
    rewardGrowth: 35,
    targetAge: '10-14岁',
    tagsText: '3D打印、功能设计',
  },
  {
    key: 'joint-model',
    title: '可动关节模型',
    difficulty: '进阶' as ChallengeInput['difficulty'],
    objective: '掌握活动结构设计原理，理解一体成型 PIP 技术。',
    description: '制作一体成型的可动章鱼或恐龙模型，观察关节活动效果。',
    workRequirement: '提交模型照片、关节活动短视频和结构说明。',
    dimensionsText: '关节设计、活动效果、结构解释',
    rewardGrowth: 40,
    targetAge: '11-15岁',
    tagsText: 'PIP技术、可动结构',
  },
  {
    key: 'module-puzzle',
    title: '模块化拼装挑战',
    difficulty: '进阶' as ChallengeInput['difficulty'],
    objective: '培养空间想象力和模块化设计思维。',
    description: '设计齿轮积木或立体拼图组件，并验证拼装逻辑。',
    workRequirement: '提交组件清单、拼装说明和完成作品图。',
    dimensionsText: '模块设计、拼装逻辑、迭代优化',
    rewardGrowth: 40,
    targetAge: '11-16岁',
    tagsText: '模块化、空间思维',
  },
  {
    key: 'tower',
    title: '力学结构挑战',
    difficulty: '进阶' as ChallengeInput['difficulty'],
    objective: '理解重心分布和承重结构设计。',
    description: '打印一座能稳定托举网球的高塔结构，记录测试结果。',
    workRequirement: '提交高塔照片、承重测试视频说明和结构优化记录。',
    dimensionsText: '结构稳定性、测试证据、迭代过程',
    rewardGrowth: 45,
    targetAge: '12-16岁',
    tagsText: '力学结构、承重测试',
  },
  {
    key: 'gear-machine',
    title: '机械传动装置',
    difficulty: '进阶' as ChallengeInput['difficulty'],
    objective: '学习基础机械原理和运动部件配合。',
    description: '制作带曲柄和齿轮的旋转机器，说明动力传递过程。',
    workRequirement: '提交装置视频、齿轮结构图和问题修复记录。',
    dimensionsText: '传动原理、部件配合、运行稳定',
    rewardGrowth: 50,
    targetAge: '12-17岁',
    tagsText: '机械传动、齿轮',
  },
  {
    key: 'launcher',
    title: '投射装置工程赛',
    difficulty: '高阶' as ChallengeInput['difficulty'],
    objective: '综合应用动力传递和弹道计算知识。',
    description: '设计纯电机驱动的球体投射器，并记录投射距离和准确度。',
    workRequirement: '提交装置说明、测试视频、数据表和安全说明。',
    dimensionsText: '工程安全、数据记录、综合应用',
    rewardGrowth: 60,
    targetAge: '14-18岁',
    tagsText: '工程赛、弹道计算',
  },
  {
    key: 'bionic-hand',
    title: '仿生机器人部件',
    difficulty: '高阶' as ChallengeInput['difficulty'],
    objective: '掌握肌腱传动系统和生物力学模拟。',
    description: '制作可抓握的机械手或仿生关节，观察运动方式。',
    workRequirement: '提交结构图、抓握演示视频和仿生原理说明。',
    dimensionsText: '仿生原理、结构设计、演示效果',
    rewardGrowth: 65,
    targetAge: '14-18岁',
    tagsText: '仿生机器人、生物力学',
  },
  {
    key: 'complex-assembly',
    title: '多部件组装挑战',
    difficulty: '高阶' as ChallengeInput['difficulty'],
    objective: '训练精密配合公差控制和系统工程思维。',
    description: '完成复杂模型的部件打印与组装，并说明装配顺序。',
    workRequirement: '提交部件清单、组装视频和装配问题复盘。',
    dimensionsText: '公差控制、系统拆解、装配复盘',
    rewardGrowth: 70,
    targetAge: '14-18岁',
    tagsText: '系统工程、复杂组装',
  },
  {
    key: 'innovation',
    title: '创新应用设计',
    difficulty: '高阶' as ChallengeInput['difficulty'],
    objective: '完整经历从需求分析到产品迭代的全流程。',
    description: '自主设计一个解决生活问题的功能性工具，并完成用户反馈迭代。',
    workRequirement: '提交需求分析、设计方案、成品照片和迭代记录。',
    dimensionsText: '需求洞察、解决方案、迭代证据',
    rewardGrowth: 80,
    targetAge: '15-18岁',
    tagsText: '创新设计、产品迭代',
  },
];

function buildChallengeTeams(submissions: ChallengeSubmission[]) {
  return Array.from(
    submissions.reduce((map, submission) => {
      const key = `${submission.challengeId}::${submission.teamName}`;
      const current = map.get(key) ?? { key, name: submission.teamName, challengeId: submission.challengeId, members: new Set<string>(), works: [] as ChallengeSubmission[], createdAt: submission.submittedAt, updatedAt: submission.updatedAt };
      submission.teamMembers.forEach((member) => current.members.add(member));
      current.works.push(submission);
      if (submission.submittedAt < current.createdAt) current.createdAt = submission.submittedAt;
      if (submission.updatedAt > current.updatedAt) current.updatedAt = submission.updatedAt;
      map.set(key, current);
      return map;
    }, new Map<string, { key: string; name: string; challengeId: string; members: Set<string>; works: ChallengeSubmission[]; createdAt: string; updatedAt: string }>()),
  ).map(([, team]) => team);
}

function buildChallengeStudents(submissions: ChallengeSubmission[]) {
  return Array.from(
    submissions.reduce((map, submission) => {
      const current = map.get(submission.studentName) ?? { name: submission.studentName, works: [] as ChallengeSubmission[], firstAt: submission.submittedAt, updatedAt: submission.updatedAt, profile: submission.studentProfile };
      current.works.push(submission);
      if (submission.submittedAt < current.firstAt) current.firstAt = submission.submittedAt;
      if (submission.updatedAt > current.updatedAt) current.updatedAt = submission.updatedAt;
      if (submission.studentProfile) current.profile = submission.studentProfile;
      map.set(submission.studentName, current);
      return map;
    }, new Map<string, { name: string; works: ChallengeSubmission[]; firstAt: string; updatedAt: string; profile?: ChallengeSubmission['studentProfile'] }>()),
  ).map(([, student]) => student);
}

export function ExpertChallengesPage() {
  const { state, batchConfirmAiReviews, generateChallengeDemoData } = useExpertStore();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const requestedTab = searchParams.get('tab');
  const [panel, setPanel] = useState<ChallengePanelKey>(requestedTab === 'teams' || requestedTab === 'students' || requestedTab === 'works' ? requestedTab : 'teams');
  const [studentFilter, setStudentFilter] = useState({ keyword: '', challenge: '', count: '' });
  const [workFilter, setWorkFilter] = useState({ challenge: '', status: '' });
  const teams = buildChallengeTeams(state.challengeSubmissions);
  const allStudents = buildChallengeStudents(state.challengeSubmissions);
  const reviewableWorks = state.challengeSubmissions.filter((submission) => needsExpertReview(submission.status));
  const aiScoredWorks = state.challengeSubmissions.filter((submission) => submission.status === 'ai_scored');
  const students = allStudents.filter((student) => {
    if (studentFilter.keyword.trim() && !student.name.includes(studentFilter.keyword.trim())) return false;
    if (studentFilter.challenge && !student.works.some((work) => work.challengeId === studentFilter.challenge)) return false;
    if (studentFilter.count && student.works.length < Number(studentFilter.count)) return false;
    return true;
  });
  const works = [...state.challengeSubmissions]
    .filter((submission) => {
      if (workFilter.challenge && submission.challengeId !== workFilter.challenge) return false;
      if (workFilter.status && submission.status !== workFilter.status) return false;
      return true;
    })
    .sort((a, b) => {
      if (needsExpertReview(a.status) !== needsExpertReview(b.status)) {
        return needsExpertReview(a.status) ? -1 : 1;
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="挑战运营" note="集中处理 PBL 难题挑战、团队进展、学员作品和专家评价">
        <div className="expert-mobile-kpi-row">
          <div><strong>{state.challenges.length}</strong><span>挑战</span></div>
          <div><strong>{teams.length}</strong><span>团队</span></div>
          <div><strong>{allStudents.length}</strong><span>学员</span></div>
          <div><strong>{reviewableWorks.length}</strong><span>待审作品</span></div>
        </div>
      </SectionCard>

      <SectionCard title="难题挑战任务" note="发布、编辑和结束任务进入二级页">
        <H5ListLink href="/challenges/tasks" icon={<FireOutlined />} title="挑战任务管理" text="查看任务列表，发布或编辑 PBL 难题挑战" badge={<Tag>{state.challenges.filter((challenge) => challenge.status === 'published').length} 个发布中</Tag>} />
      </SectionCard>

      <Segmented
        block
        value={panel}
        onChange={(value) => setPanel(value as ChallengePanelKey)}
        options={[
          { label: '团队', value: 'teams' },
          { label: '学员', value: 'students' },
          { label: '作品', value: 'works' },
        ]}
      />

      {panel === 'teams' ? (
        <SectionCard title="团队列表" note="按挑战与团队聚合，展示成员、挑战和更新时间">
          <div className="expert-list">
            {teams.map((team) => {
              const challenge = state.challenges.find((item) => item.id === team.challengeId);
              return (
                <EntityCard key={team.key} title={team.name} subtitle={`${team.members.size} 名成员 · ${challenge?.title ?? '未关联挑战'}`} meta={<Tag>{formatDate(team.updatedAt)}</Tag>} actions={<Button size="small" href={`/challenges/teams/${encodeURIComponent(team.name)}`}>详情</Button>}>
                  <p>创建：{formatDate(team.createdAt)} · 最新更新：{formatDate(team.updatedAt)}</p>
                  <p>作品：{team.works.length} 份，其中 {team.works.filter((work) => needsExpertReview(work.status)).length} 份待专家确认。</p>
                </EntityCard>
              );
            })}
            {!teams.length ? <MobileEmpty text="暂无挑战团队。" action={<Button onClick={() => { generateChallengeDemoData(); messageApi.success('已生成挑战演示数据'); }}>生成演示数据</Button>} /> : null}
          </div>
        </SectionCard>
      ) : null}

      {panel === 'students' ? (
        <SectionCard title="学员列表" note="支持按学员姓名、挑战名称和挑战数量筛选">
          <div className="expert-form-stack">
            <Input prefix={<SearchOutlined />} placeholder="学员姓名" value={studentFilter.keyword} onChange={(event) => setStudentFilter((current) => ({ ...current, keyword: event.target.value }))} />
            <Select allowClear placeholder="挑战名称" value={studentFilter.challenge || undefined} onChange={(value) => setStudentFilter((current) => ({ ...current, challenge: value ?? '' }))} options={state.challenges.map((challenge) => ({ label: challenge.title, value: challenge.id }))} />
            <Input placeholder="最少挑战数量" value={studentFilter.count} onChange={(event) => setStudentFilter((current) => ({ ...current, count: event.target.value.replace(/\D/g, '') }))} />
          </div>
          <div className="expert-list expert-top-gap">
            {students.map((student) => {
              const latestWork = [...student.works].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
              const currentChallenge = state.challenges.find((challenge) => challenge.id === latestWork?.challengeId);
              return (
                <EntityCard key={student.name} title={student.name} subtitle={`${student.works.length} 个挑战 · 当前 ${currentChallenge?.title ?? '暂无'}`} meta={<Tag>{formatDate(student.updatedAt)}</Tag>} actions={<Button size="small" href={`/challenges/students/${encodeURIComponent(student.name)}`}>详情</Button>}>
                  <p>最早参与：{formatDate(student.firstAt)} · 最新时间：{formatDate(student.updatedAt)}</p>
                  {student.profile ? <p>{[student.profile.school, student.profile.grade, student.profile.city].filter(Boolean).join(' · ')}</p> : null}
                </EntityCard>
              );
            })}
            {!students.length ? <MobileEmpty text="暂无符合条件的学员。" /> : null}
          </div>
        </SectionCard>
      ) : null}

      {panel === 'works' ? (
        <SectionCard
          title="作品列表"
          note="默认优先显示待审核与 AI 已评分作品，评分进入作品详情页"
          extra={<Button size="small" disabled={!aiScoredWorks.length} onClick={() => { batchConfirmAiReviews(aiScoredWorks.map((work) => work.id)); messageApi.success('已批量确认 AI 评分'); }}>批量确认</Button>}
        >
          <div className="expert-form-stack">
            <Select allowClear placeholder="按挑战筛选" value={workFilter.challenge || undefined} onChange={(value) => setWorkFilter((current) => ({ ...current, challenge: value ?? '' }))} options={state.challenges.map((challenge) => ({ label: challenge.title, value: challenge.id }))} />
            <Select allowClear placeholder="按状态筛选" value={workFilter.status || undefined} onChange={(value) => setWorkFilter((current) => ({ ...current, status: value ?? '' }))} options={Object.entries(SUBMISSION_STATUS_META).map(([value, meta]) => ({ label: meta.label, value }))} />
          </div>
          <div className="expert-list expert-top-gap">
            {works.map((submission) => {
              const challenge = state.challenges.find((item) => item.id === submission.challengeId);
              return (
                <EntityCard
                  key={submission.id}
                  title={submission.workTitle}
                  subtitle={`${submission.studentName} · ${submission.teamName} · ${challenge?.title ?? '未关联挑战'}`}
                  meta={statusTag(SUBMISSION_STATUS_META[submission.status])}
                  tags={<><Tag>AI {submission.aiScore}</Tag>{submission.expertScore ? <Tag color="success">专家 {submission.expertScore}</Tag> : null}</>}
                  actions={<Button size="small" href={`/challenges/works/${submission.id}`}>{needsExpertReview(submission.status) ? '评分' : '详情'}</Button>}
                >
                  <p>{submission.workSummary || submission.comment || '作品等待专家确认评分与个性化评价。'}</p>
                </EntityCard>
              );
            })}
            {!works.length ? <MobileEmpty text="暂无作品。" action={<Button onClick={() => { generateChallengeDemoData(); messageApi.success('已生成挑战演示数据'); }}>生成演示数据</Button>} /> : null}
          </div>
          <div className="expert-top-gap">
            <Button block onClick={() => { generateChallengeDemoData(); messageApi.success('已生成挑战演示数据'); }}>生成演示数据</Button>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}

export function ExpertChallengeTasksPage() {
  const { state, setChallengeStatus, generateChallengeDemoData } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="挑战任务" note="专家自审发布，创建和编辑均进入二级页面" extra={<Link className="expert-primary-link" href="/challenges/new">发布</Link>}>
        <div className="expert-mobile-kpi-row">
          <div><strong>{state.challenges.length}</strong><span>任务</span></div>
          <div><strong>{state.challenges.filter((challenge) => challenge.status === 'published').length}</strong><span>发布中</span></div>
          <div><strong>{state.challenges.filter((challenge) => challenge.status === 'draft').length}</strong><span>草稿</span></div>
          <div><strong>{state.challenges.filter((challenge) => challenge.status === 'ended').length}</strong><span>已结束</span></div>
        </div>
      </SectionCard>
      <SectionCard title="任务列表">
        <div className="expert-list">
          {state.challenges.map((challenge) => (
            <EntityCard
              key={challenge.id}
              title={challenge.title}
              subtitle={`${challenge.difficulty} · ${challenge.targetAge || '10-18岁'} · ${challenge.workType || '个人/团队'}`}
              meta={statusTag(CHALLENGE_STATUS_META[challenge.status])}
              tags={<>{challenge.tags.slice(0, 3).map((tag) => <Tag key={tag}>{tag}</Tag>)}</>}
              actions={
                <>
                  <Button size="small" href={`/challenges/${challenge.id}/edit`}>编辑</Button>
                  {challenge.status !== 'published' ? <Button size="small" type="primary" onClick={() => { setChallengeStatus(challenge.id, 'published'); messageApi.success('挑战已发布'); }}>发布</Button> : null}
                  {challenge.status !== 'ended' ? <Button size="small" onClick={() => { setChallengeStatus(challenge.id, 'ended'); messageApi.success('挑战已结束'); }}>结束</Button> : null}
                </>
              }
            >
              <p>{challenge.objective || challenge.description}</p>
              <small>作品 {challenge.submissionCount} 份 · 已审 {challenge.reviewedCount} 份 · 成长值 {challenge.rubric.rewardGrowth}</small>
            </EntityCard>
          ))}
          {!state.challenges.length ? <MobileEmpty text="暂无挑战任务。" action={<Button type="primary" href="/challenges/new">发布挑战</Button>} /> : null}
        </div>
        <div className="expert-top-gap">
          <Button block onClick={() => { generateChallengeDemoData(); messageApi.success('已生成挑战演示数据'); }}>生成演示数据</Button>
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertChallengeCreatePage() {
  const challengeId = useRouteId();
  const { state, saveChallenge, setChallengeStatus } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const editingChallenge = state.challenges.find((challenge) => challenge.id === challengeId);
  const [step, setStep] = useState(editingChallenge ? 1 : 0);
  const [draft, setDraft] = useState({
    agentId: editingChallenge?.agentId ?? state.activeAgentId,
    productId: editingChallenge?.productId ?? state.products[0]?.id ?? null,
    title: editingChallenge?.title ?? '',
    difficulty: editingChallenge?.difficulty ?? '进阶' as ChallengeInput['difficulty'],
    objective: editingChallenge?.objective ?? '',
    targetAge: editingChallenge?.targetAge ?? '10-18岁',
    workType: editingChallenge?.workType ?? '团队挑战' as ChallengeInput['workType'],
    templateSource: editingChallenge?.templateSource ?? '',
    description: editingChallenge?.description ?? '',
    workRequirement: editingChallenge?.workRequirement ?? '',
    references: editingChallenge?.references ?? '',
    attachmentsText: editingChallenge?.attachments.map((file) => file.name).join('、') ?? '',
    tagsText: editingChallenge?.tags.join('、') ?? '',
    dimensionsText: editingChallenge?.rubric.dimensions.join('、') ?? '问题意识、证据收集、表达完整度',
    totalScore: editingChallenge?.rubric.totalScore ?? 100,
    passScore: editingChallenge?.rubric.passScore ?? 60,
    rewardGrowth: editingChallenge?.rubric.rewardGrowth ?? 30,
  });
  const steps = ['选择模板', '基础信息', '任务内容', '作品要求', '评分成长值', '预览发布'];
  const currentStepTitle = steps[step] ?? steps[0];

  function updateDraft<Key extends keyof typeof draft>(key: Key, value: (typeof draft)[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applyTemplate(template: (typeof CHALLENGE_TEMPLATE_LIBRARY)[number]) {
    setDraft((current) => ({
      ...current,
      title: template.title,
      difficulty: template.difficulty,
      objective: template.objective,
      description: template.description,
      workRequirement: template.workRequirement,
      dimensionsText: template.dimensionsText,
      rewardGrowth: template.rewardGrowth,
      targetAge: template.targetAge,
      tagsText: template.tagsText,
      templateSource: template.title,
      references: current.references || `${template.title}任务单.pdf`,
      attachmentsText: current.attachmentsText || `${template.title}任务单.pdf`,
    }));
    setStep(1);
  }

  function buildFiles(): StoredFileMeta[] {
    return parseTags(draft.attachmentsText).map((name, index) => ({
      id: `${editingChallenge?.id ?? 'challenge'}_file_${index}`,
      name,
      sizeLabel: '1.2 MB',
      type: name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
    }));
  }

  function validateStep(currentStep = step) {
    if (currentStep >= 1 && !draft.title.trim()) {
      messageApi.warning('请先补充挑战标题');
      return false;
    }
    if (currentStep >= 2 && (!draft.objective.trim() || !draft.description.trim())) {
      messageApi.warning('请补充任务目标和任务描述');
      return false;
    }
    if (currentStep >= 3 && !draft.workRequirement.trim()) {
      messageApi.warning('请补充作品要求');
      return false;
    }
    if (currentStep >= 4 && parseTags(draft.dimensionsText).length === 0) {
      messageApi.warning('请至少设置一个评分维度');
      return false;
    }
    return true;
  }

  function submit(status: ChallengeStatus) {
    if (!validateStep(4)) {
      return;
    }
    const tags = parseTags(draft.tagsText);
    const dimensions = parseTags(draft.dimensionsText);
    const id = saveChallenge({
      agentId: draft.agentId,
      productId: draft.productId,
      title: draft.title,
      difficulty: draft.difficulty,
      objective: draft.objective,
      targetAge: draft.targetAge,
      workType: draft.workType,
      templateSource: draft.templateSource || undefined,
      description: draft.description,
      workRequirement: draft.workRequirement,
      references: draft.references,
      attachments: buildFiles(),
      tags,
      rubric: {
        dimensions,
        totalScore: draft.totalScore,
        passScore: draft.passScore,
        rewardGrowth: draft.rewardGrowth,
      },
    }, editingChallenge?.id);
    setChallengeStatus(id, status);
    messageApi.success(status === 'published' ? '挑战已发布' : status === 'ready' ? '挑战已保存待发布' : '挑战草稿已保存');
    router.replace('/challenges/tasks');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title={`第 ${step + 1} 步 / ${steps.length}`} note={currentStepTitle}>
        <Progress percent={Math.round(((step + 1) / steps.length) * 100)} showInfo={false} />
      </SectionCard>

      {step === 0 ? (
        <SectionCard title="选择挑战模板" note="可直接套用 3D 打印挑战任务，也可以跳过后手动填写">
          <div className="expert-list">
            {CHALLENGE_TEMPLATE_LIBRARY.map((template, index) => (
              <EntityCard key={template.key} title={`${index + 1}. ${template.title}`} subtitle={`${template.difficulty} · ${template.targetAge}`} meta={<Tag>{template.rewardGrowth} 成长值</Tag>} tags={<>{parseTags(template.tagsText).map((tag) => <Tag key={tag}>{tag}</Tag>)}</>} actions={<Button size="small" type="primary" onClick={() => applyTemplate(template)}>使用</Button>}>
                <p>{template.objective}</p>
              </EntityCard>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {step === 1 ? (
        <SectionCard title="基础信息" note="明确任务名称、适龄范围和挑战形式">
          <div className="expert-form-stack">
            <label>挑战标题<Input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} /></label>
            <label>适龄范围<Input value={draft.targetAge} onChange={(event) => updateDraft('targetAge', event.target.value)} /></label>
            <label>难度<Select value={draft.difficulty} onChange={(value) => updateDraft('difficulty', value)} options={['入门', '进阶', '高阶'].map((item) => ({ label: item, value: item as ChallengeInput['difficulty'] }))} /></label>
            <label>作品类型<Select value={draft.workType} onChange={(value) => updateDraft('workType', value)} options={['个人挑战', '团队挑战', '个人/团队'].map((item) => ({ label: item, value: item as ChallengeInput['workType'] }))} /></label>
            <label>关联智能体<Select allowClear value={draft.agentId ?? undefined} onChange={(value) => updateDraft('agentId', value ?? null)} options={state.agents.map((agent) => ({ label: agent.name, value: agent.id }))} /></label>
            <label>关联课程/活动<Select allowClear value={draft.productId ?? undefined} onChange={(value) => updateDraft('productId', value ?? null)} options={state.products.map((product) => ({ label: product.title, value: product.id }))} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard title="任务内容" note="说明挑战目标、任务描述和参考资料">
          <div className="expert-form-stack">
            <label>任务目标<Input.TextArea rows={3} value={draft.objective} onChange={(event) => updateDraft('objective', event.target.value)} /></label>
            <label>任务描述<Input.TextArea rows={5} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} /></label>
            <label>参考资料<Input.TextArea rows={3} value={draft.references} onChange={(event) => updateDraft('references', event.target.value)} /></label>
            <label>附件名称<Input value={draft.attachmentsText} onChange={(event) => updateDraft('attachmentsText', event.target.value)} placeholder="任务单.pdf、观察表.xlsx" /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard title="作品要求" note="明确学员或团队需要提交的内容">
          <div className="expert-form-stack">
            <label>作品要求<Input.TextArea rows={6} value={draft.workRequirement} onChange={(event) => updateDraft('workRequirement', event.target.value)} /></label>
            <label>标签<Input value={draft.tagsText} onChange={(event) => updateDraft('tagsText', event.target.value)} placeholder="3D打印、结构设计" /></label>
            <p className="expert-note-box">专家端只负责发布任务和审核作品，学员组队和作品上传由学员端产生后进入这里审核。</p>
          </div>
        </SectionCard>
      ) : null}

      {step === 4 ? (
        <SectionCard title="评分与成长值" note="AI 初评后，专家可确认评分或补充个性化评价">
          <div className="expert-form-stack">
            <label>评分维度<Input value={draft.dimensionsText} onChange={(event) => updateDraft('dimensionsText', event.target.value)} /></label>
            <div className="expert-form-grid">
              <label>总分<InputNumber min={1} max={100} value={draft.totalScore} onChange={(value) => updateDraft('totalScore', Number(value ?? 100))} /></label>
              <label>通过分<InputNumber min={1} max={100} value={draft.passScore} onChange={(value) => updateDraft('passScore', Number(value ?? 60))} /></label>
              <label>成长值<InputNumber min={0} max={300} value={draft.rewardGrowth} onChange={(value) => updateDraft('rewardGrowth', Number(value ?? 0))} /></label>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {step === 5 ? (
        <SectionCard title="预览发布" note="确认任务内容后可保存草稿或直接发布">
          <div className="expert-confirm-list">
            <div><span>标题</span><strong>{draft.title || '未填写'}</strong></div>
            <div><span>目标</span><strong>{draft.objective || '未填写'}</strong></div>
            <div><span>难度</span><strong>{draft.difficulty}</strong></div>
            <div><span>适龄</span><strong>{draft.targetAge}</strong></div>
            <div><span>形式</span><strong>{draft.workType}</strong></div>
            <div><span>作品要求</span><strong>{draft.workRequirement || '未填写'}</strong></div>
            <div><span>评分维度</span><strong>{parseTags(draft.dimensionsText).join('、') || '未设置'}</strong></div>
            <div><span>成长值</span><strong>{draft.rewardGrowth}</strong></div>
          </div>
        </SectionCard>
      ) : null}

      <PageActionBar>
        {step === 0 ? <Button onClick={() => router.replace('/challenges/tasks')}>取消</Button> : <Button onClick={() => setStep((current) => Math.max(0, current - 1))}>上一步</Button>}
        {step < steps.length - 1 ? (
          <Button type="primary" onClick={() => { if (validateStep(step)) setStep((current) => Math.min(steps.length - 1, current + 1)); }}>下一步</Button>
        ) : (
          <>
            <Button onClick={() => submit('draft')}>保存草稿</Button>
            <Button type="primary" onClick={() => submit('published')}>发布</Button>
          </>
        )}
      </PageActionBar>
    </div>
  );
}

export function ExpertChallengeWorkImportPage() {
  const { generateChallengeDemoData } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="作品入口已迁移" note="作品由学员端提交后进入作品列表，专家端不再手动导入作品">
        <MobileEmpty text="请回到挑战作品列表查看待审作品，或生成一组演示数据用于验收。" />
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.replace('/challenges?tab=works')}>返回作品列表</Button>
        <Button type="primary" onClick={() => { generateChallengeDemoData(); messageApi.success('已生成挑战演示数据'); router.replace('/challenges?tab=works'); }}>生成演示数据</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertChallengeWorkDetailPage() {
  const submissionId = useRouteId();
  const { state, reviewSubmission } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const submission = state.challengeSubmissions.find((item) => item.id === submissionId);
  const challenge = submission ? state.challenges.find((item) => item.id === submission.challengeId) : undefined;
  const [review, setReview] = useState({
    score: submission?.expertScore ?? submission?.aiScore ?? 80,
    growth: submission?.rewardGrowth ?? challenge?.rubric.rewardGrowth ?? 30,
    comment: submission?.comment ?? submission?.aiComment ?? '',
  });

  if (!submission) {
    return <MobileEmpty text="没有找到该作品" action={<Button href="/challenges?tab=works">返回作品列表</Button>} />;
  }
  const currentSubmission = submission;

  function submitReview() {
    if (!review.comment.trim()) {
      messageApi.warning('请填写个性化评价');
      return;
    }
    reviewSubmission(currentSubmission.id, review.score, review.growth, review.comment);
    messageApi.success('作品已审核');
    router.replace('/challenges?tab=works');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="作品详情" note="展示作品内容、AI 初评和专家评价">
        <div className="expert-confirm-list">
          <div><span>作品标题</span><strong>{submission.workTitle}</strong></div>
          <div><span>挑战名称</span><strong>{challenge?.title ?? '未关联挑战'}</strong></div>
          <div><span>团队</span><strong>{submission.teamName}</strong></div>
          <div><span>学员</span><strong>{submission.studentName}</strong></div>
          <div><span>当前状态</span><strong>{SUBMISSION_STATUS_META[submission.status].label}</strong></div>
          <div><span>最新时间</span><strong>{formatDate(submission.updatedAt)}</strong></div>
        </div>
        {submission.workSummary ? <p className="expert-note-box">{submission.workSummary}</p> : null}
        {submission.workAttachments?.length ? (
          <div className="expert-inline expert-wrap expert-top-gap">
            {submission.workAttachments.map((file) => <Tag key={file.id}>{file.name}</Tag>)}
          </div>
        ) : null}
      </SectionCard>
      <SectionCard title="学员资料">
        <div className="expert-confirm-list">
          <div><span>姓名</span><strong>{submission.studentName}</strong></div>
          <div><span>年龄</span><strong>{submission.studentProfile?.age ?? '待补充'}</strong></div>
          <div><span>学校</span><strong>{submission.studentProfile?.school ?? '待补充'}</strong></div>
          <div><span>年级</span><strong>{submission.studentProfile?.grade ?? '待补充'}</strong></div>
        </div>
      </SectionCard>
      <SectionCard title="AI 初评">
        <div className="expert-mobile-kpi-row">
          <div><strong>{submission.aiScore}</strong><span>AI 分</span></div>
          <div><strong>{challenge?.rubric.passScore ?? 60}</strong><span>通过分</span></div>
          <div><strong>{challenge?.rubric.rewardGrowth ?? 30}</strong><span>建议成长值</span></div>
        </div>
        <p className="expert-note-box">{submission.aiComment || 'AI 已完成初评，等待专家确认评分。'}</p>
        <div className="expert-inline expert-wrap">
          {(challenge?.rubric.dimensions ?? []).map((dimension) => <Tag key={dimension}>{dimension}</Tag>)}
        </div>
      </SectionCard>
      <SectionCard title={needsExpertReview(submission.status) ? '专家评分' : '审核结果'}>
        {needsExpertReview(submission.status) ? (
          <div className="expert-form-stack">
            <div className="expert-form-grid">
              <label>专家评分<InputNumber min={0} max={100} value={review.score} onChange={(value) => setReview((current) => ({ ...current, score: Number(value ?? 0) }))} /></label>
              <label>成长值<InputNumber min={0} max={300} value={review.growth} onChange={(value) => setReview((current) => ({ ...current, growth: Number(value ?? 0) }))} /></label>
            </div>
            <label>个性化评价<Input.TextArea rows={5} value={review.comment} onChange={(event) => setReview((current) => ({ ...current, comment: event.target.value }))} /></label>
          </div>
        ) : (
          <div className="expert-confirm-list">
            <div><span>专家评分</span><strong>{submission.expertScore}</strong></div>
            <div><span>成长值</span><strong>{submission.rewardGrowth}</strong></div>
            <div><span>评价</span><strong>{submission.comment}</strong></div>
            <div><span>审核时间</span><strong>{formatDate(submission.reviewedAt)}</strong></div>
          </div>
        )}
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.replace('/challenges?tab=works')}>返回列表</Button>
        {needsExpertReview(submission.status) ? <Button type="primary" onClick={submitReview}>保存评分</Button> : null}
      </PageActionBar>
    </div>
  );
}

export function ExpertChallengeTeamDetailPage() {
  const teamName = decodeURIComponent(useRouteParam('name'));
  const { state } = useExpertStore();
  const works = state.challengeSubmissions.filter((submission) => submission.teamName === teamName);
  const members = Array.from(new Set(works.flatMap((work) => work.teamMembers)));
  const latestAt = works.reduce((latest, work) => (work.updatedAt > latest ? work.updatedAt : latest), works[0]?.updatedAt ?? '');
  const challengeNames = Array.from(new Set(works.map((work) => state.challenges.find((challenge) => challenge.id === work.challengeId)?.title).filter(Boolean)));

  if (!works.length) {
    return <MobileEmpty text="没有找到该团队" action={<Button href="/challenges?tab=teams">返回团队列表</Button>} />;
  }

  return (
    <div className="expert-page">
      <SectionCard title={teamName} note="团队信息、成员信息和作品列表">
        <div className="expert-mobile-kpi-row">
          <div><strong>{members.length}</strong><span>成员</span></div>
          <div><strong>{works.length}</strong><span>作品</span></div>
          <div><strong>{works.filter((work) => needsExpertReview(work.status)).length}</strong><span>待审</span></div>
        </div>
        <p className="expert-note-box">挑战：{challengeNames.join('、') || '未关联挑战'}；最近更新：{formatDate(latestAt)}</p>
        <div className="expert-inline expert-wrap">
          {members.map((member) => <Tag key={member}>{member}</Tag>)}
        </div>
      </SectionCard>
      <SectionCard title="作品列表">
        <div className="expert-list">
          {works.map((work) => {
            const challenge = state.challenges.find((item) => item.id === work.challengeId);
            return (
              <EntityCard key={work.id} title={work.workTitle} subtitle={`${work.studentName} · ${challenge?.title ?? '未关联挑战'}`} meta={statusTag(SUBMISSION_STATUS_META[work.status])} actions={<Button size="small" href={`/challenges/works/${work.id}`}>{needsExpertReview(work.status) ? '评分' : '详情'}</Button>}>
                <p>{work.workSummary || work.comment || '暂无作品摘要。'}</p>
              </EntityCard>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertChallengeStudentDetailPage() {
  const studentName = decodeURIComponent(useRouteParam('name'));
  const { state } = useExpertStore();
  const works = state.challengeSubmissions.filter((submission) => submission.studentName === studentName);
  const challengeIds = Array.from(new Set(works.map((work) => work.challengeId)));
  const latestProfile = [...works].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.studentProfile;
  const reviews = works.filter((work) => work.status === 'reviewed' && work.comment);

  if (!works.length) {
    return <MobileEmpty text="没有找到该学员" action={<Button href="/challenges?tab=students">返回学员列表</Button>} />;
  }

  return (
    <div className="expert-page">
      <SectionCard title={studentName} note="学员资料、挑战经历和作品评价">
        <div className="expert-mobile-kpi-row">
          <div><strong>{challengeIds.length}</strong><span>挑战数</span></div>
          <div><strong>{works.length}</strong><span>作品</span></div>
          <div><strong>{works.filter((work) => work.status === 'reviewed').length}</strong><span>已审</span></div>
        </div>
        <div className="expert-confirm-list expert-top-gap">
          <div><span>年龄</span><strong>{latestProfile?.age ?? '待补充'}</strong></div>
          <div><span>学校</span><strong>{latestProfile?.school ?? '待补充'}</strong></div>
          <div><span>年级</span><strong>{latestProfile?.grade ?? '待补充'}</strong></div>
          <div><span>城市</span><strong>{latestProfile?.city ?? '待补充'}</strong></div>
        </div>
      </SectionCard>
      {reviews.length ? (
        <SectionCard title="专家评价沉淀">
          <div className="expert-list">
            {reviews.map((work) => (
              <EntityCard key={work.id} title={work.workTitle} subtitle={formatDate(work.reviewedAt)} tags={<><Tag>专家 {work.expertScore}</Tag><Tag>{work.rewardGrowth} 成长值</Tag></>}>
                <p>{work.comment}</p>
              </EntityCard>
            ))}
          </div>
        </SectionCard>
      ) : null}
      <SectionCard title="作品列表">
        <div className="expert-list">
          {works.map((work) => {
            const challenge = state.challenges.find((item) => item.id === work.challengeId);
            return (
              <EntityCard key={work.id} title={work.workTitle} subtitle={`${work.teamName} · ${challenge?.title ?? '未关联挑战'}`} meta={statusTag(SUBMISSION_STATUS_META[work.status])} tags={<><Tag>AI {work.aiScore}</Tag>{work.expertScore ? <Tag color="success">专家 {work.expertScore}</Tag> : null}</>} actions={<Button size="small" href={`/challenges/works/${work.id}`}>{needsExpertReview(work.status) ? '评分' : '详情'}</Button>}>
                <p>{work.workSummary || work.comment || '等待专家评分与个性化评价。'}</p>
              </EntityCard>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertContentPage() {
  const { state } = useExpertStore();
  const approved = state.accountStatus === 'approved';
  const entries: Array<{ key: ContentEntranceKey; href: string; icon: React.ReactNode; title: string; text: string; count: number }> = [
    { key: 'qa', href: '/content/qa', icon: <FormOutlined />, title: '问答记录', text: '优先处理未匹配知识库的问题', count: state.qaRecords.filter((item) => item.status === 'unmatched').length },
    { key: 'knowledge', href: '/content/knowledge', icon: <BookOutlined />, title: '知识库管理', text: '维护智能体可调用的专家知识', count: state.knowledgeEntries.filter((item) => !item.archivedAt && item.status === 'enabled').length },
    { key: 'news', href: '/content/news', icon: <FileTextOutlined />, title: '资讯管理', text: '配置采集规则、编辑并定时下发', count: state.newsItems.filter((item) => item.status !== 'published').length },
    { key: 'challenges', href: '/content/challenges', icon: <FireOutlined />, title: '难题挑战', text: '创建挑战、提交审核并发布上线', count: state.challenges.filter((item) => item.status !== 'ended').length },
    { key: 'submissions', href: '/content/submissions', icon: <StarOutlined />, title: '作品审核', text: '确认评分并发放成长值', count: state.challengeSubmissions.filter((item) => needsExpertReview(item.status)).length },
    { key: 'evaluations', href: '/content/evaluations', icon: <UploadOutlined />, title: '学生评价', text: '上传活动资料并同步成长日记', count: state.evaluationBatches.filter((item) => !item.diarySynced).length },
  ];
  const assets = [
    { label: '知识库分组', value: state.knowledgeLibraries.length },
    { label: '采集规则', value: state.contentCollectionRules.length },
    { label: '已发布资讯', value: state.newsItems.filter((item) => item.status === 'published').length },
  ];

  return (
    <div className="expert-page">
      {!approved ? (
        <SectionCard title="内容运营未开通" note="入驻通过后才能维护问答、知识库、资讯、挑战和评价内容">
          <MobileEmpty text="请先完成专家/机构入驻审核。" action={<Button type="primary" href="/onboarding">去提交入驻资料</Button>} />
        </SectionCard>
      ) : null}

      {approved ? (
        <SectionCard title="内容资产" note="内容一级页只做总览和入口，具体操作进入二级页">
          <section className="expert-mobile-kpi-row">
            {assets.map((item) => (
              <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
            ))}
          </section>
        </SectionCard>
      ) : null}

      {approved ? (
        <SectionCard title="运营规则" note="规则前置，避免把重要提醒放到页面底部">
        <div className="expert-alert-row">
          <ClockCircleOutlined />
          <span>问答补答会回写知识库，资讯发布后学员可见，挑战作品审核后发放成长值。</span>
        </div>
        </SectionCard>
      ) : null}

      {approved ? (
        <SectionCard title="内容入口">
        <div className="expert-h5-list">
          {entries.map((entry) => (
            <H5ListLink key={entry.key} href={entry.href} icon={entry.icon} title={entry.title} text={entry.text} badge={<Tag>{entry.count}</Tag>} />
          ))}
        </div>
        </SectionCard>
      ) : null}
    </div>
  );
}

type QaFilterKey = 'unmatched' | 'all' | 'resolved';

export function ExpertContentQaPage() {
  const { state, supplementQa } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [filter, setFilter] = useState<QaFilterKey>('unmatched');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [answerById, setAnswerById] = useState<Record<string, string>>({});
  const [targetAgentById, setTargetAgentById] = useState<Record<string, string>>({});
  const [targetLibraryById, setTargetLibraryById] = useState<Record<string, string>>({});
  const [targetKnowledgeById, setTargetKnowledgeById] = useState<Record<string, string>>({});
  const [keywordsById, setKeywordsById] = useState<Record<string, string>>({});
  const records = [...state.qaRecords]
    .filter((record) => (filter === 'all' ? true : record.status === filter))
    .filter((record) => (agentFilter === 'all' ? true : record.agentId === agentFilter))
    .filter((record) => `${record.studentName ?? qaSourceLabel(record.sourceType)}${record.question}${record.keywords?.join('') ?? ''}`.includes(keyword.trim()))
    .sort((a, b) => (a.status === b.status ? b.askedAt.localeCompare(a.askedAt) : a.status === 'unmatched' ? -1 : 1));
  const agentOptions = state.agents.map((agent) => ({ label: agent.name, value: agent.id }));
  const libraryOptions = state.knowledgeLibraries
    .filter((library) => library.enabled)
    .map((library) => ({ label: library.name, value: library.id }));

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard
        title="问答记录"
        note="默认优先展示未匹配知识库的问题，补答后必须回写知识库"
        extra={<Link className="expert-primary-link" href="/content/qa/import">导入</Link>}
      >
        <div className="expert-form-stack">
          <Segmented
            block
            value={filter}
            onChange={(value) => setFilter(value as QaFilterKey)}
            options={[
              { label: '未匹配', value: 'unmatched' },
              { label: '全部', value: 'all' },
              { label: '已处理', value: 'resolved' },
            ]}
          />
          <Select
            value={agentFilter}
            onChange={setAgentFilter}
            options={[{ label: '全部智能体', value: 'all' }, ...agentOptions]}
          />
          <Input prefix={<SearchOutlined />} placeholder="搜索学员、问题或关键词" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </div>
      </SectionCard>

      {state.agents.length === 0 || state.knowledgeLibraries.length === 0 ? (
        <SectionCard title="补答前准备" note="补答需要明确所属智能体和回写知识库">
          <div className="expert-h5-list">
            {state.agents.length === 0 ? <H5ListLink href="/agents/new" icon={<RobotOutlined />} title="创建智能体" text="用于归属问答和知识回写" /> : null}
            {state.knowledgeLibraries.length === 0 ? <H5ListLink href="/content/knowledge/new" icon={<BookOutlined />} title="创建知识库分组" text="用于承接补答后的标准知识" /> : null}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="问题列表">
        {records.length === 0 ? (
          <MobileEmpty text="暂无符合条件的问答记录。" action={<Button href="/content/qa/import">导入学员提问</Button>} />
        ) : (
        <div className="expert-list">
          {records.map((record) => (
            <EntityCard key={record.id} title={record.question} subtitle={`${record.studentName ?? qaSourceLabel(record.sourceType)} · ${formatDate(record.askedAt)}`} meta={<Tag color={record.status === 'unmatched' ? 'warning' : 'success'}>{record.status === 'unmatched' ? '未匹配' : '已处理'}</Tag>} tags={<AgentName agentId={record.agentId} agents={state.agents} />}>
              {record.keywords?.length ? <div className="expert-inline expert-wrap">{record.keywords.map((item) => <Tag key={item}>{item}</Tag>)}</div> : null}
              {record.answer ? <p>{record.answer}</p> : null}
              {record.status === 'unmatched' ? (
                <div className="expert-form-stack">
                  <Select
                    placeholder="选择所属智能体"
                    value={targetAgentById[record.id] ?? record.agentId ?? undefined}
                    onChange={(value) => setTargetAgentById((current) => ({ ...current, [record.id]: value }))}
                    options={agentOptions}
                  />
                  <Select
                    placeholder="选择回写知识库"
                    value={targetLibraryById[record.id]}
                    onChange={(value) => setTargetLibraryById((current) => ({ ...current, [record.id]: value }))}
                    options={libraryOptions}
                  />
                  <Select
                    placeholder="新增知识条目"
                    value={targetKnowledgeById[record.id] ?? '__new'}
                    onChange={(value) => setTargetKnowledgeById((current) => ({ ...current, [record.id]: value }))}
                    options={[
                      { label: '新增知识条目', value: '__new' },
                      ...state.knowledgeEntries
                        .filter((entry) => !entry.archivedAt && entry.status === 'enabled')
                        .map((entry) => ({ label: entry.title, value: entry.id })),
                    ]}
                  />
                  <Input placeholder="关键词，用顿号、逗号或换行分隔" value={keywordsById[record.id] ?? record.keywords?.join('、') ?? ''} onChange={(event) => setKeywordsById((current) => ({ ...current, [record.id]: event.target.value }))} />
                  <Input.TextArea rows={3} placeholder="补充标准答案" value={answerById[record.id] ?? ''} onChange={(event) => setAnswerById((current) => ({ ...current, [record.id]: event.target.value }))} />
                  <Button
                    type="primary"
                    onClick={() => {
                      const answer = answerById[record.id]?.trim();
                      const targetAgentId = targetAgentById[record.id] ?? record.agentId ?? '';
                      const targetLibraryId = targetLibraryById[record.id] ?? '';
                      const keywords = parseTags(keywordsById[record.id] ?? record.keywords?.join('、') ?? '');
                      if (!answer) {
                        messageApi.warning('请先填写答案');
                        return;
                      }
                      if (!targetAgentId) {
                        messageApi.warning('请选择所属智能体');
                        return;
                      }
                      if (!targetLibraryId) {
                        messageApi.warning('请选择回写知识库');
                        return;
                      }
                      if (keywords.length === 0) {
                        messageApi.warning('请填写关键词');
                        return;
                      }
                      supplementQa(
                        record.id,
                        answer,
                        targetAgentId,
                        targetKnowledgeById[record.id] === '__new' ? undefined : targetKnowledgeById[record.id],
                        targetLibraryId,
                        keywords,
                      );
                      messageApi.success('已补答并回写知识库');
                    }}
                  >
                    补答并回写
                  </Button>
                </div>
              ) : null}
            </EntityCard>
          ))}
        </div>
        )}
      </SectionCard>
    </div>
  );
}

export function ExpertContentQaImportPage() {
  const { state, importQaRecord } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [draft, setDraft] = useState<QaImportInput>({
    agentId: state.activeAgentId,
    productId: state.products[0]?.id ?? null,
    studentName: '',
    question: '',
    keywords: [],
  });
  const [keywordsText, setKeywordsText] = useState('');

  function submit() {
    const keywords = parseTags(keywordsText);
    if (!draft.agentId || !draft.studentName?.trim() || !draft.question.trim() || keywords.length === 0) {
      messageApi.warning('请补充智能体、学员、问题和关键词');
      return;
    }
    importQaRecord({ ...draft, keywords });
    messageApi.success('学员提问已进入待补答列表');
    router.replace('/content/qa');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="导入学员提问" note="用于处理线下沟通、社群反馈或学员端未匹配问题">
        <div className="expert-form-stack">
          <label>所属智能体<Select value={draft.agentId ?? undefined} onChange={(value) => setDraft((current) => ({ ...current, agentId: value }))} options={state.agents.map((agent) => ({ label: agent.name, value: agent.id }))} /></label>
          <label>关联课程/活动<Select value={draft.productId ?? undefined} allowClear onChange={(value) => setDraft((current) => ({ ...current, productId: value ?? null }))} options={state.products.map((product) => ({ label: product.title, value: product.id }))} /></label>
          <label>学员姓名<Input value={draft.studentName} onChange={(event) => setDraft((current) => ({ ...current, studentName: event.target.value }))} /></label>
          <label>学员问题<Input.TextArea rows={5} value={draft.question} onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))} /></label>
          <label>关键词<Input value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} placeholder="海洋、潮汐、观察任务" /></label>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>导入待补答</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertContentKnowledgePage() {
  const { state, saveKnowledgeEntry, archiveKnowledgeEntry, restoreKnowledgeRevision, setKnowledgeEntryStatus, setKnowledgeLibraryEnabled, completeKnowledgeImport } = useExpertStore();
  const [keyword, setKeyword] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [revisionById, setRevisionById] = useState<Record<string, string>>({});
  const [messageApi, contextHolder] = message.useMessage();
  const entries = state.knowledgeEntries.filter((entry) => {
    if (entry.archivedAt) {
      return false;
    }
    if (libraryFilter !== 'all' && entry.libraryId !== libraryFilter) {
      return false;
    }
    return `${entry.title}${entry.question}${entry.answer}${entry.keywords.join('')}`.includes(keyword);
  });
  const importStatusMeta = {
    uploaded: { label: '待解析', color: 'processing' },
    parsing: { label: '解析中', color: 'processing' },
    completed: { label: '已完成', color: 'success' },
    failed: { label: '解析失败', color: 'error' },
  };

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard
        title="知识库管理"
        note="按智能体建立知识库分组，再通过手动录入或资料上传沉淀条目"
      >
        <div className="expert-h5-list">
          <H5ListLink href="/content/knowledge/new" icon={<PlusOutlined />} title="手动录入知识" text="创建分组、录入标准问答和关键词" />
          <H5ListLink href="/content/knowledge/import" icon={<UploadOutlined />} title="上传资料" text="保存文件信息并进入解析状态" />
        </div>
      </SectionCard>

      <SectionCard title="知识库分组" note="分组可绑定智能体，并控制启用状态与优先级">
        {state.knowledgeLibraries.length === 0 ? (
          <MobileEmpty text="暂无知识库分组。" action={<Button href="/content/knowledge/new">创建分组并录入知识</Button>} />
        ) : (
          <div className="expert-list">
            {state.knowledgeLibraries.map((library) => (
              <EntityCard
                key={library.id}
                title={library.name}
                subtitle={library.description}
                meta={<Switch checked={library.enabled} onChange={(checked) => setKnowledgeLibraryEnabled(library.id, checked)} />}
                tags={<><AgentName agentId={library.agentId} agents={state.agents} /><Tag>优先级 {library.bindingPriority}</Tag></>}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="知识条目" note="支持搜索、修订、停用和最近版本回溯">
        <div className="expert-form-stack">
          <Select
            value={libraryFilter}
            onChange={setLibraryFilter}
            options={[{ label: '全部分组', value: 'all' }, ...state.knowledgeLibraries.map((library) => ({ label: library.name, value: library.id }))]}
          />
          <Input prefix={<SearchOutlined />} placeholder="搜索知识条目" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </div>
        {entries.length === 0 ? (
          <MobileEmpty text="暂无知识条目。" action={<Button href="/content/knowledge/new">录入第一条知识</Button>} />
        ) : (
          <div className="expert-list">
        {entries.map((entry) => (
          <EntityCard key={entry.id} title={entry.title} subtitle={entry.question} meta={<AgentName agentId={entry.agentId} agents={state.agents} />} tags={<>{entry.keywords.map((tag) => <Tag key={tag}>{tag}</Tag>)}<Tag color={entry.status === 'enabled' ? 'success' : 'default'}>{entry.status === 'enabled' ? '启用' : '停用'}</Tag></>} actions={<><Button size="small" onClick={() => setKnowledgeEntryStatus(entry.id, entry.status === 'enabled' ? 'disabled' : 'enabled')}>{entry.status === 'enabled' ? '停用' : '启用'}</Button><Button size="small" danger onClick={() => archiveKnowledgeEntry(entry.id)}>删除</Button></>}>
            <p>{entry.answer}</p>
            <div className="expert-form-stack">
              <Input.TextArea rows={3} placeholder="填写修订后的答案" value={revisionById[entry.id] ?? ''} onChange={(event) => setRevisionById((current) => ({ ...current, [entry.id]: event.target.value }))} />
              <Button
                size="small"
                onClick={() => {
                  const answer = revisionById[entry.id]?.trim();
                  if (!answer) {
                    messageApi.warning('请先填写修订内容');
                    return;
                  }
                  saveKnowledgeEntry({ agentId: entry.agentId, libraryId: entry.libraryId, title: entry.title, question: entry.question, answer, keywords: entry.keywords, source: entry.source, file: entry.file, status: entry.status, bindingPriority: entry.bindingPriority }, entry.id);
                  setRevisionById((current) => ({ ...current, [entry.id]: '' }));
                  messageApi.success('知识条目已修订');
                }}
              >
                保存修订
              </Button>
            </div>
            {entry.revisions.slice(0, 2).map((revision) => (
              <button className="expert-revision-item" type="button" key={revision.id} onClick={() => restoreKnowledgeRevision(entry.id, revision.id)}>
                <strong>{revision.note}</strong>
                <small>{formatDate(revision.changedAt)}</small>
              </button>
            ))}
          </EntityCard>
        ))}
          </div>
        )}
      </SectionCard>

      {state.knowledgeImportJobs.length ? (
        <SectionCard title="资料解析记录">
          <div className="expert-list">
            {state.knowledgeImportJobs.map((job) => (
              <EntityCard key={job.id} title={job.file.name} subtitle={formatDate(job.createdAt)} meta={statusTag(importStatusMeta[job.status])} actions={job.status !== 'completed' ? <Button size="small" type="primary" onClick={() => completeKnowledgeImport(job.id)}>完成解析</Button> : null}>
                <p>{job.previewText}</p>
              </EntityCard>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}

export function ExpertContentKnowledgeCreatePage() {
  const { state, saveKnowledgeLibrary, saveKnowledgeEntry } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [libraryId, setLibraryId] = useState(state.knowledgeLibraries[0]?.id ?? '__new');
  const [libraryDraft, setLibraryDraft] = useState<KnowledgeLibraryInput>({
    name: '研学通用知识库',
    agentId: state.activeAgentId,
    description: '沉淀专家常见问答、课程知识和现场观察指引。',
    bindingPriority: 1,
  });
  const [entryDraft, setEntryDraft] = useState({
    title: '',
    question: '',
    answer: '',
    keywordsText: '',
    bindingPriority: 1,
  });

  function submit() {
    const keywords = parseTags(entryDraft.keywordsText);
    if (!entryDraft.title.trim() || !entryDraft.question.trim() || !entryDraft.answer.trim() || keywords.length === 0) {
      messageApi.warning('请补充标题、问题、答案和关键词');
      return;
    }
    const targetLibraryId = libraryId === '__new' ? saveKnowledgeLibrary(libraryDraft) : libraryId;
    const targetLibrary = state.knowledgeLibraries.find((library) => library.id === targetLibraryId);
    saveKnowledgeEntry({
      agentId: targetLibrary?.agentId ?? libraryDraft.agentId,
      libraryId: targetLibraryId,
      title: entryDraft.title,
      question: entryDraft.question,
      answer: entryDraft.answer,
      keywords,
      bindingPriority: entryDraft.bindingPriority,
      status: 'enabled',
      source: 'manual',
    });
    messageApi.success('知识条目已保存');
    router.replace('/content/knowledge');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="手动录入知识" note="用于构建智能体可调用的标准问答">
        <div className="expert-form-stack">
          <label>知识库分组<Select value={libraryId} onChange={setLibraryId} options={[{ label: '新建知识库分组', value: '__new' }, ...state.knowledgeLibraries.map((library) => ({ label: library.name, value: library.id }))]} /></label>
          {libraryId === '__new' ? (
            <>
              <label>分组名称<Input value={libraryDraft.name} onChange={(event) => setLibraryDraft((current) => ({ ...current, name: event.target.value }))} /></label>
              <label>绑定智能体<Select allowClear value={libraryDraft.agentId ?? undefined} onChange={(value) => setLibraryDraft((current) => ({ ...current, agentId: value ?? null }))} options={state.agents.map((agent) => ({ label: agent.name, value: agent.id }))} /></label>
              <label>分组说明<Input.TextArea rows={3} value={libraryDraft.description} onChange={(event) => setLibraryDraft((current) => ({ ...current, description: event.target.value }))} /></label>
              <label>绑定优先级<InputNumber min={1} max={20} value={libraryDraft.bindingPriority} onChange={(value) => setLibraryDraft((current) => ({ ...current, bindingPriority: Number(value ?? 1) }))} /></label>
            </>
          ) : null}
          <label>知识标题<Input value={entryDraft.title} onChange={(event) => setEntryDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>标准问题<Input.TextArea rows={3} value={entryDraft.question} onChange={(event) => setEntryDraft((current) => ({ ...current, question: event.target.value }))} /></label>
          <label>标准答案<Input.TextArea rows={5} value={entryDraft.answer} onChange={(event) => setEntryDraft((current) => ({ ...current, answer: event.target.value }))} /></label>
          <label>关键词<Input value={entryDraft.keywordsText} onChange={(event) => setEntryDraft((current) => ({ ...current, keywordsText: event.target.value }))} /></label>
          <label>条目优先级<InputNumber min={1} max={20} value={entryDraft.bindingPriority} onChange={(value) => setEntryDraft((current) => ({ ...current, bindingPriority: Number(value ?? 1) }))} /></label>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>保存知识</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertContentKnowledgeImportPage() {
  const { state, saveKnowledgeLibrary, uploadKnowledgeFile } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [libraryId, setLibraryId] = useState(state.knowledgeLibraries[0]?.id ?? '__new');
  const [libraryDraft, setLibraryDraft] = useState<KnowledgeLibraryInput>({
    name: '资料导入知识库',
    agentId: state.activeAgentId,
    description: '用于承接专家资料、课程资料和研学手册。',
    bindingPriority: 1,
  });
  const [uploadDraft, setUploadDraft] = useState<KnowledgeUploadInput>({
    libraryId: '',
    agentId: state.activeAgentId,
    fileName: '',
    previewText: '',
  });

  function submit() {
    if (!uploadDraft.fileName.trim() || !uploadDraft.previewText.trim()) {
      messageApi.warning('请填写文件名称和资料摘要');
      return;
    }
    const targetLibraryId = libraryId === '__new' ? saveKnowledgeLibrary(libraryDraft) : libraryId;
    const targetLibrary = state.knowledgeLibraries.find((library) => library.id === targetLibraryId);
    uploadKnowledgeFile({
      ...uploadDraft,
      libraryId: targetLibraryId,
      agentId: targetLibrary?.agentId ?? libraryDraft.agentId,
    });
    messageApi.success('资料已提交解析');
    router.replace('/content/knowledge');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="上传知识资料" note="保存文件信息、资料摘要和解析状态，解析完成后生成知识条目">
        <div className="expert-form-stack">
          <label>知识库分组<Select value={libraryId} onChange={setLibraryId} options={[{ label: '新建知识库分组', value: '__new' }, ...state.knowledgeLibraries.map((library) => ({ label: library.name, value: library.id }))]} /></label>
          {libraryId === '__new' ? (
            <>
              <label>分组名称<Input value={libraryDraft.name} onChange={(event) => setLibraryDraft((current) => ({ ...current, name: event.target.value }))} /></label>
              <label>绑定智能体<Select allowClear value={libraryDraft.agentId ?? undefined} onChange={(value) => setLibraryDraft((current) => ({ ...current, agentId: value ?? null }))} options={state.agents.map((agent) => ({ label: agent.name, value: agent.id }))} /></label>
              <label>分组说明<Input.TextArea rows={3} value={libraryDraft.description} onChange={(event) => setLibraryDraft((current) => ({ ...current, description: event.target.value }))} /></label>
            </>
          ) : null}
          <label>文件名称<Input prefix={<UploadOutlined />} value={uploadDraft.fileName} onChange={(event) => setUploadDraft((current) => ({ ...current, fileName: event.target.value }))} placeholder="课程手册.pdf" /></label>
          <label>资料摘要<Input.TextArea rows={5} value={uploadDraft.previewText} onChange={(event) => setUploadDraft((current) => ({ ...current, previewText: event.target.value }))} placeholder="简要说明资料覆盖的知识主题、适用课程和问答场景" /></label>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>提交解析</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertContentNewsPage() {
  const { state, setNewsStatus, runCollectionRule } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="资讯管理" note="采集规则先配置，采集池内容编辑后才能发布或定时下发">
        <div className="expert-h5-list">
          <H5ListLink href="/content/news/collection" icon={<SearchOutlined />} title="采集设置" text="配置关键词、来源、格式和频率" />
          <H5ListLink href="/content/news/new" icon={<PlusOutlined />} title="手动新增资讯" text="新增图文或短视频资讯" />
        </div>
      </SectionCard>

      <SectionCard title="采集规则">
        {state.contentCollectionRules.length === 0 ? (
          <MobileEmpty text="暂无资讯采集规则。" action={<Button href="/content/news/collection">创建采集规则</Button>} />
        ) : (
          <div className="expert-list">
            {state.contentCollectionRules.map((rule) => (
              <EntityCard key={rule.id} title={rule.name} subtitle={`${rule.frequency} · ${rule.keywords.join('、')}`} meta={<Tag color={rule.enabled ? 'success' : 'default'}>{rule.enabled ? '启用' : '停用'}</Tag>} tags={<AgentName agentId={rule.agentId} agents={state.agents} />} actions={<Button size="small" type="primary" onClick={() => { runCollectionRule(rule.id); messageApi.success('已执行一次采集'); }}>执行采集</Button>}>
                <p>来源：{rule.sourceRules.map((source) => source.name).join('、')}；格式：{rule.formats.join('、')}；上次采集：{formatDate(rule.lastCollectedAt)}</p>
              </EntityCard>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="资讯列表" note="采集池 → 编辑 → 精选/定时下发 → 发布记录">
        {state.newsItems.length === 0 ? (
          <MobileEmpty text="暂无资讯内容。" action={<Button href="/content/news/new">新增资讯</Button>} />
        ) : (
          <div className="expert-list">
        {state.newsItems.map((item) => (
          <EntityCard key={item.id} title={item.title} subtitle={`${item.source} · ${item.format} · 推送 ${item.pushCount}`} meta={statusTag(NEWS_STATUS_META[item.status])} tags={<>{item.featured ? <Tag color="gold">精选</Tag> : <Tag>普通</Tag>}<Tag>{item.sourceType === 'collection' ? '采集' : '手动'}</Tag></>} actions={<><Button size="small" onClick={() => setNewsStatus(item.id, 'editing')}>进入编辑</Button><Button size="small" type="primary" onClick={() => setNewsStatus(item.id, 'published')}>发布</Button></>}>
            <p>{item.summary}</p>
            {item.scheduledAt ? <small>下发时间：{formatDate(item.scheduledAt)}</small> : null}
          </EntityCard>
        ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function ExpertContentNewsCollectionPage() {
  const { state, saveCollectionRule } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [draft, setDraft] = useState<CollectionRuleInput>({
    name: '',
    agentId: state.activeAgentId,
    keywords: [],
    sourceNames: [],
    formats: ['图文'],
    frequency: '每日',
  });
  const [keywordsText, setKeywordsText] = useState('');
  const [sourcesText, setSourcesText] = useState('');

  function submit() {
    const keywords = parseTags(keywordsText);
    const sourceNames = parseTags(sourcesText);
    if (!draft.name.trim() || keywords.length === 0 || sourceNames.length === 0 || draft.formats.length === 0) {
      messageApi.warning('请补充规则名称、关键词、来源和格式');
      return;
    }
    saveCollectionRule({ ...draft, keywords, sourceNames });
    messageApi.success('采集规则已保存');
    router.replace('/content/news');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="资讯采集设置" note="围绕专家领域配置关键词、来源、内容格式和采集频率">
        <div className="expert-form-stack">
          <label>规则名称<Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
          <label>关联智能体<Select allowClear value={draft.agentId ?? undefined} onChange={(value) => setDraft((current) => ({ ...current, agentId: value ?? null }))} options={state.agents.map((agent) => ({ label: agent.name, value: agent.id }))} /></label>
          <label>采集关键词<Input value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} placeholder="海洋生态、潮汐、研学安全" /></label>
          <label>来源名称<Input.TextArea rows={3} value={sourcesText} onChange={(event) => setSourcesText(event.target.value)} placeholder="科普机构公众号、博物馆资讯、研学基地动态" /></label>
          <label>内容格式<Select mode="multiple" value={draft.formats} onChange={(value) => setDraft((current) => ({ ...current, formats: value as NewsFormat[] }))} options={['图文', '短视频'].map((format) => ({ label: format, value: format }))} /></label>
          <label>采集频率<Select value={draft.frequency} onChange={(value) => setDraft((current) => ({ ...current, frequency: value }))} options={['每日', '每周', '手动'].map((item) => ({ label: item, value: item }))} /></label>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit}>保存规则</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertContentNewsCreatePage() {
  const { state, saveNewsItem } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [draft, setDraft] = useState<NewsInput>({
    agentId: state.activeAgentId,
    title: '',
    status: 'editing',
    sourceType: 'manual',
    format: '图文',
    source: '专家原创',
    summary: '',
    content: '',
    scheduledAt: '',
    featured: false,
  });

  function submit(status: NewsStatus) {
    if (!draft.title.trim() || !draft.summary.trim() || !draft.content.trim()) {
      messageApi.warning('请补充标题、摘要和正文');
      return;
    }
    saveNewsItem({ ...draft, status });
    messageApi.success(status === 'published' ? '资讯已发布' : '资讯已保存');
    router.replace('/content/news');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="新增资讯" note="支持图文或短视频资讯，发布后进入学员侧可见状态">
        <div className="expert-form-stack">
          <label>标题<Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>关联智能体<Select allowClear value={draft.agentId ?? undefined} onChange={(value) => setDraft((current) => ({ ...current, agentId: value ?? null }))} options={state.agents.map((agent) => ({ label: agent.name, value: agent.id }))} /></label>
          <label>内容格式<Select value={draft.format} onChange={(value) => setDraft((current) => ({ ...current, format: value }))} options={['图文', '短视频'].map((format) => ({ label: format, value: format as NewsFormat }))} /></label>
          <label>来源<Input value={draft.source} onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))} /></label>
          <label>摘要<Input.TextArea rows={3} value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} /></label>
          <label>正文/脚本<Input.TextArea rows={6} value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} /></label>
          <label>定时下发<Input value={draft.scheduledAt} onChange={(event) => setDraft((current) => ({ ...current, scheduledAt: event.target.value }))} placeholder="2026-06-01 09:00" /></label>
          <label className="expert-switch-row">设为精选<Switch checked={draft.featured} onChange={(checked) => setDraft((current) => ({ ...current, featured: checked }))} /></label>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button onClick={() => submit('editing')}>保存编辑</Button>
        <Button type="primary" onClick={() => submit('published')}>发布</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertContentChallengesPage() {
  const { state, setChallengeStatus } = useExpertStore();

  return (
    <div className="expert-page">
      <SectionCard title="难题挑战" note="创建后先形成草稿，提交审核通过后再发布上线" extra={<Link className="expert-primary-link" href="/challenges/new">创建</Link>}>
        <section className="expert-mobile-kpi-row">
          <div><strong>{state.challenges.length}</strong><span>挑战</span></div>
          <div><strong>{state.challenges.filter((item) => item.status === 'published').length}</strong><span>已发布</span></div>
          <div><strong>{state.challenges.reduce((sum, item) => sum + item.submissionCount, 0)}</strong><span>作品</span></div>
        </section>
      </SectionCard>

      <SectionCard title="挑战列表">
        {state.challenges.length === 0 ? (
          <MobileEmpty text="暂无难题挑战。" action={<Button type="primary" href="/challenges/new">创建挑战</Button>} />
        ) : (
          <div className="expert-list">
        {state.challenges.map((challenge) => (
          <EntityCard key={challenge.id} title={challenge.title} subtitle={`${challenge.difficulty} · ${challenge.submissionCount} 份作品 · 已审 ${challenge.reviewedCount}`} meta={statusTag(CHALLENGE_STATUS_META[challenge.status])} tags={<ProductName productId={challenge.productId} products={state.products} />} actions={<><Button size="small" onClick={() => setChallengeStatus(challenge.id, 'ready')}>提交审核</Button><Button size="small" type="primary" onClick={() => setChallengeStatus(challenge.id, 'published')}>发布上线</Button><Button size="small" onClick={() => setChallengeStatus(challenge.id, 'ended')}>结束</Button></>}>
            <p>{challenge.description}</p>
            <p>作品要求：{challenge.workRequirement}</p>
            <small>评分：{challenge.rubric.dimensions.join('、')}；通过 {challenge.rubric.passScore}/{challenge.rubric.totalScore}；成长值 {challenge.rubric.rewardGrowth}</small>
          </EntityCard>
        ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function ExpertContentChallengeCreatePage() {
  const { state, saveChallenge, setChallengeStatus } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [draft, setDraft] = useState({
    agentId: state.activeAgentId,
    productId: state.products[0]?.id ?? null,
    title: '',
    difficulty: '进阶' as ChallengeInput['difficulty'],
    description: '',
    workRequirement: '',
    references: '',
    attachmentsText: '',
    tagsText: '',
    dimensionsText: '问题意识、证据收集、表达完整度',
    totalScore: 100,
    passScore: 60,
    rewardGrowth: 30,
  });

  function buildFiles(): StoredFileMeta[] {
    return parseTags(draft.attachmentsText).map((name, index) => ({
      id: `challenge_file_${Date.now()}_${index}`,
      name,
      sizeLabel: '1.2 MB',
      type: name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
    }));
  }

  function submit(status: 'draft' | 'ready') {
    const tags = parseTags(draft.tagsText);
    const dimensions = parseTags(draft.dimensionsText);
    if (!draft.title.trim() || !draft.description.trim() || !draft.workRequirement.trim() || dimensions.length === 0) {
      messageApi.warning('请补充标题、描述、作品要求和评分维度');
      return;
    }
    const id = saveChallenge({
      agentId: draft.agentId,
      productId: draft.productId,
      title: draft.title,
      difficulty: draft.difficulty,
      description: draft.description,
      workRequirement: draft.workRequirement,
      references: draft.references,
      attachments: buildFiles(),
      tags,
      rubric: {
        dimensions,
        totalScore: draft.totalScore,
        passScore: draft.passScore,
        rewardGrowth: draft.rewardGrowth,
      },
    });
    if (status === 'ready') {
      setChallengeStatus(id, 'ready');
    }
    messageApi.success(status === 'ready' ? '挑战已提交审核' : '挑战草稿已保存');
    router.replace('/content/challenges');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="创建难题挑战" note="覆盖基础信息、参考资料、作品要求和评分规则">
        <div className="expert-form-stack">
          <label>挑战标题<Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>关联智能体<Select allowClear value={draft.agentId ?? undefined} onChange={(value) => setDraft((current) => ({ ...current, agentId: value ?? null }))} options={state.agents.map((agent) => ({ label: agent.name, value: agent.id }))} /></label>
          <label>关联课程/活动<Select allowClear value={draft.productId ?? undefined} onChange={(value) => setDraft((current) => ({ ...current, productId: value ?? null }))} options={state.products.map((product) => ({ label: product.title, value: product.id }))} /></label>
          <label>难度<Select value={draft.difficulty} onChange={(value) => setDraft((current) => ({ ...current, difficulty: value }))} options={['入门', '进阶', '高阶'].map((item) => ({ label: item, value: item as ChallengeInput['difficulty'] }))} /></label>
          <label>详细描述<Input.TextArea rows={5} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
          <label>作品要求<Input.TextArea rows={4} value={draft.workRequirement} onChange={(event) => setDraft((current) => ({ ...current, workRequirement: event.target.value }))} /></label>
          <label>参考资料<Input.TextArea rows={3} value={draft.references} onChange={(event) => setDraft((current) => ({ ...current, references: event.target.value }))} /></label>
          <label>附件名称<Input value={draft.attachmentsText} onChange={(event) => setDraft((current) => ({ ...current, attachmentsText: event.target.value }))} placeholder="任务单.pdf、观察表.xlsx" /></label>
          <label>标签<Input value={draft.tagsText} onChange={(event) => setDraft((current) => ({ ...current, tagsText: event.target.value }))} /></label>
          <label>评分维度<Input value={draft.dimensionsText} onChange={(event) => setDraft((current) => ({ ...current, dimensionsText: event.target.value }))} /></label>
          <div className="expert-form-grid">
            <label>总分<InputNumber min={1} max={100} value={draft.totalScore} onChange={(value) => setDraft((current) => ({ ...current, totalScore: Number(value ?? 100) }))} /></label>
            <label>通过分<InputNumber min={1} max={100} value={draft.passScore} onChange={(value) => setDraft((current) => ({ ...current, passScore: Number(value ?? 60) }))} /></label>
            <label>成长值<InputNumber min={0} max={300} value={draft.rewardGrowth} onChange={(value) => setDraft((current) => ({ ...current, rewardGrowth: Number(value ?? 0) }))} /></label>
          </div>
        </div>
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button onClick={() => submit('draft')}>保存草稿</Button>
        <Button type="primary" onClick={() => submit('ready')}>提交审核</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertContentSubmissionsPage() {
  const { state, importChallengeSubmission, reviewSubmission } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const publishedChallenges = state.challenges.filter((challenge) => challenge.status === 'published');
  const [submissionDraft, setSubmissionDraft] = useState<SubmissionImportInput>({
    challengeId: publishedChallenges[0]?.id ?? '',
    studentName: '',
    workTitle: '',
    aiScore: 80,
  });
  const [reviewById, setReviewById] = useState<Record<string, { score: number; growth: number; comment: string }>>({});

  function importSubmission() {
    if (!submissionDraft.challengeId || !submissionDraft.studentName.trim() || !submissionDraft.workTitle.trim()) {
      messageApi.warning('请补充挑战、学员和作品标题');
      return;
    }
    importChallengeSubmission(submissionDraft);
    setSubmissionDraft((current) => ({ ...current, studentName: '', workTitle: '' }));
    messageApi.success('作品已进入待审列表');
  }

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="作品导入" note="作品来自已发布挑战，导入后进入专家审核列表">
        {publishedChallenges.length === 0 ? (
          <MobileEmpty text="暂无已发布挑战，先发布挑战后再导入作品。" action={<Button href="/content/challenges/new">创建挑战</Button>} />
        ) : (
          <div className="expert-form-stack">
            <label>选择挑战<Select value={submissionDraft.challengeId} onChange={(value) => setSubmissionDraft((current) => ({ ...current, challengeId: value }))} options={publishedChallenges.map((challenge) => ({ label: challenge.title, value: challenge.id }))} /></label>
            <label>学员姓名<Input value={submissionDraft.studentName} onChange={(event) => setSubmissionDraft((current) => ({ ...current, studentName: event.target.value }))} /></label>
            <label>作品标题<Input value={submissionDraft.workTitle} onChange={(event) => setSubmissionDraft((current) => ({ ...current, workTitle: event.target.value }))} /></label>
            <label>AI 建议分<InputNumber min={0} max={100} value={submissionDraft.aiScore} onChange={(value) => setSubmissionDraft((current) => ({ ...current, aiScore: Number(value ?? 0) }))} /></label>
            <Button type="primary" onClick={importSubmission}>导入待审作品</Button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="作品审核" note="确认专家分、成长值和评语后，挑战统计即时回写">
        {state.challengeSubmissions.length === 0 ? (
          <MobileEmpty text="暂无挑战作品。" />
        ) : (
        <div className="expert-list">
          {state.challengeSubmissions.map((submission) => {
            const challenge = state.challenges.find((item) => item.id === submission.challengeId);
            const review = reviewById[submission.id] ?? {
              score: Math.min(100, submission.aiScore + 3),
              growth: challenge?.rubric.rewardGrowth ?? 30,
              comment: '',
            };
            return (
              <EntityCard key={submission.id} title={submission.workTitle} subtitle={`${submission.studentName} · ${challenge?.title ?? '未关联挑战'}`} meta={statusTag(SUBMISSION_STATUS_META[submission.status])} tags={<><Tag>AI {submission.aiScore}</Tag>{submission.expertScore ? <Tag color="success">专家 {submission.expertScore}</Tag> : null}</>} actions={null}>
                <p>{submission.comment ?? '等待专家确认分数、奖励成长值与评语。'}</p>
                {needsExpertReview(submission.status) ? (
                  <div className="expert-form-stack">
                    <div className="expert-form-grid">
                      <label>专家确认分<InputNumber min={0} max={100} value={review.score} onChange={(value) => setReviewById((current) => ({ ...current, [submission.id]: { ...review, score: Number(value ?? 0) } }))} /></label>
                      <label>奖励成长值<InputNumber min={0} max={300} value={review.growth} onChange={(value) => setReviewById((current) => ({ ...current, [submission.id]: { ...review, growth: Number(value ?? 0) } }))} /></label>
                    </div>
                    <Input.TextArea rows={3} placeholder="填写专家评语" value={review.comment} onChange={(event) => setReviewById((current) => ({ ...current, [submission.id]: { ...review, comment: event.target.value } }))} />
                    <Button
                      type="primary"
                      onClick={() => {
                        if (!review.comment.trim()) {
                          messageApi.warning('请填写专家评语');
                          return;
                        }
                        reviewSubmission(submission.id, review.score, review.growth, review.comment);
                        messageApi.success('作品已审核并回写成长值');
                      }}
                    >
                      完成审核
                    </Button>
                  </div>
                ) : null}
              </EntityCard>
            );
          })}
        </div>
        )}
      </SectionCard>
    </div>
  );
}

export function ExpertContentEvaluationsPage() {
  const { state, advanceEvaluationBatch } = useExpertStore();

  return (
    <div className="expert-page">
      <SectionCard title="学生评价" note="选择课程/活动场次，上传照片与评价表后生成报告" extra={<Link className="expert-primary-link" href="/content/evaluations/new">新建</Link>}>
        <section className="expert-mobile-kpi-row">
          <div><strong>{state.evaluationBatches.length}</strong><span>批次</span></div>
          <div><strong>{state.evaluationBatches.filter((item) => item.reportStatus === 'completed').length}</strong><span>待同步</span></div>
          <div><strong>{state.evaluationBatches.filter((item) => item.diarySynced).length}</strong><span>已同步</span></div>
        </section>
      </SectionCard>

      <SectionCard title="评价批次">
        {state.evaluationBatches.length === 0 ? (
          <MobileEmpty text="暂无学生评价批次。" action={<Button href="/content/evaluations/new">创建评价批次</Button>} />
        ) : (
          <div className="expert-list">
        {state.evaluationBatches.map((batch) => (
          <EntityCard key={batch.id} title={batch.title} subtitle={`${batch.studentCount} 名学员 · ${formatDate(batch.updatedAt)}`} meta={statusTag(EVALUATION_STATUS_META[batch.reportStatus])} tags={<ProductName productId={batch.productId} products={state.products} />} actions={<Button size="small" type="primary" onClick={() => advanceEvaluationBatch(batch.id)}>推进状态</Button>}>
            <p>{batch.attachments.map((item) => item.name).join('、')}</p>
          </EntityCard>
        ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function ExpertContentEvaluationCreatePage() {
  const { state, createEvaluationBatch } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [draft, setDraft] = useState<EvaluationBatchInput>({
    productId: state.products[0]?.id ?? '',
    sessionId: state.sessions.find((session) => session.productId === state.products[0]?.id)?.id,
    title: '',
    studentCount: 20,
    photoCount: 20,
    formName: '',
  });
  const sessions = state.sessions.filter((session) => session.productId === draft.productId);

  function submit() {
    if (!draft.productId || !draft.title.trim() || !draft.formName.trim()) {
      messageApi.warning('请补充课程、批次名称和评价表文件');
      return;
    }
    createEvaluationBatch(draft);
    messageApi.success('评价批次已创建');
    router.replace('/content/evaluations');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="创建评价批次" note="上传活动照片和评价表后，报告状态会进入生成流程">
        {state.products.length === 0 ? (
          <MobileEmpty text="请先创建课程或活动产品。" action={<Button href="/courses/new">创建课程</Button>} />
        ) : (
          <div className="expert-form-stack">
            <label>选择课程/活动<Select value={draft.productId} onChange={(value) => setDraft((current) => ({ ...current, productId: value, sessionId: state.sessions.find((session) => session.productId === value)?.id }))} options={state.products.map((product) => ({ label: product.title, value: product.id }))} /></label>
            <label>选择场次<Select allowClear value={draft.sessionId} onChange={(value) => setDraft((current) => ({ ...current, sessionId: value }))} options={sessions.map((session) => ({ label: session.title, value: session.id }))} /></label>
            <label>批次名称<Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
            <label>学员人数<InputNumber min={1} max={300} value={draft.studentCount} onChange={(value) => setDraft((current) => ({ ...current, studentCount: Number(value ?? 1) }))} /></label>
            <label>活动照片数量<InputNumber min={0} max={500} value={draft.photoCount} onChange={(value) => setDraft((current) => ({ ...current, photoCount: Number(value ?? 0) }))} /></label>
            <label>评价表文件<Input prefix={<UploadOutlined />} value={draft.formName} onChange={(event) => setDraft((current) => ({ ...current, formName: event.target.value }))} placeholder="学生评价表.xlsx" /></label>
          </div>
        )}
      </SectionCard>
      <PageActionBar>
        <Button onClick={() => router.back()}>取消</Button>
        <Button type="primary" onClick={submit} disabled={state.products.length === 0}>创建批次</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertMePage() {
  const { state } = useExpertStore();
  const identity = displayIdentity(state);

  return (
    <div className="expert-page">
      <SectionCard title="我的" note="一级页只展示身份和二级入口">
        <div className="expert-profile-card">
          <Avatar size={52} icon={<UserOutlined />}>{identity.name.slice(0, 1)}</Avatar>
          <div className="expert-profile-main">
            <strong>{identity.name}</strong>
            <span>{identity.title} · {identity.field}</span>
            <small>{identity.organization} {statusTag(ACCOUNT_STATUS_META[state.accountStatus])}</small>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="账户">
        <div className="expert-h5-list">
          <H5ListLink href="/onboarding" icon={<SafetyCertificateOutlined />} title="入驻进度" text="查看资料提交、运营审核和开通状态" badge={statusTag(ACCOUNT_STATUS_META[state.accountStatus])} />
          <H5ListLink href="/me/profile" icon={<UserOutlined />} title="专家资料" text="姓名、头衔和专业领域" />
          <H5ListLink href="/me/organization" icon={<SafetyCertificateOutlined />} title="机构资料" text="合作机构和资质信息" />
          <H5ListLink href="/me/orders" icon={<DollarOutlined />} title="销售与订单" text="订单查询、退款处理、导出与核销" badge={<Tag>{state.refundRequests.filter((refund) => refund.status === 'pending').length}</Tag>} />
          <H5ListLink href="/me/account" icon={<BankOutlined />} title="账户与资质" text="收款账户、发票抬头和认证资料" />
          <H5ListLink href="/me/bank-card" icon={<BankOutlined />} title="收款银行卡" text="设置提现收款账户" badge={statusTag(BANK_STATUS_META[state.bankAccount.status])} />
          <H5ListLink href="/me/invoice" icon={<FileTextOutlined />} title="发票资料" text="维护结算开票资料" badge={statusTag(INVOICE_STATUS_META[state.invoiceProfile.status])} />
          <H5ListLink href="/me/settlement" icon={<DollarOutlined />} title="结算中心" text="提现申请、提现记录和账户余额" />
          <H5ListLink href="/me/settings" icon={<SettingOutlined />} title="系统设置" text="通知、显示和数据恢复" />
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertMeSettlementPage() {
  const { state, createWithdrawal } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [amount, setAmount] = useState(2000);
  const blockers = [
    state.accountStatus !== 'approved' ? { text: '入驻审核通过后才能提现', href: '/onboarding' } : null,
    state.bankAccount.status !== 'active' ? { text: '收款银行卡生效后才能提现', href: '/me/bank-card' } : null,
    state.invoiceProfile.status !== 'approved' ? { text: '发票资料通过后才能提现', href: '/me/invoice' } : null,
    state.settlement.availableAmount <= 0 ? { text: '当前没有可提现金额，请先完成课程销售结算', href: '/courses' } : null,
  ].filter(Boolean) as Array<{ text: string; href: string }>;

  function submit() {
    if (blockers.length) {
      messageApi.warning('请先处理提现前置事项');
      return;
    }
    if (amount <= 0 || amount > state.settlement.availableAmount) {
      messageApi.warning('请输入可提现范围内的金额');
      return;
    }
    createWithdrawal(amount);
    messageApi.success('提现申请已提交');
  }

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="结算中心" note="作为我的二级页展示，不占用一级页">
        <div className="expert-mobile-kpi-row">
          <div><strong>{formatMoney(state.settlement.availableAmount)}</strong><span>可提现</span></div>
          <div><strong>{formatMoney(state.settlement.frozenAmount)}</strong><span>冻结中</span></div>
          <div><strong>{formatMoney(state.settlement.withdrawnAmount)}</strong><span>累计提现</span></div>
        </div>
      </SectionCard>
      <SectionCard title="结算资料">
        <div className="expert-h5-list">
          <H5ListLink href="/me/bank-card" icon={<BankOutlined />} title="收款银行卡" text={`${state.bankAccount.accountName || '待设置'} · ${state.bankAccount.bankName || '开户行待设置'} · ${maskedCard(state.bankAccount.cardNo)}`} badge={statusTag(BANK_STATUS_META[state.bankAccount.status])} />
          <H5ListLink href="/me/invoice" icon={<FileTextOutlined />} title="发票资料" text={`${state.invoiceProfile.title || '发票抬头待设置'} · ${state.invoiceProfile.email || '邮箱待设置'}`} badge={statusTag(INVOICE_STATUS_META[state.invoiceProfile.status])} />
        </div>
      </SectionCard>
      <SectionCard title="提现申请">
        <div className="expert-form-stack">
          {blockers.length ? (
            <div className="expert-stack">
              {blockers.map((blocker) => (
                <Link className="expert-alert-row" href={blocker.href} key={blocker.text}>
                  <ClockCircleOutlined />
                  <span>{blocker.text}</span>
                </Link>
              ))}
            </div>
          ) : null}
          <label>提现金额<InputNumber min={1} max={state.settlement.availableAmount} value={amount} onChange={(value) => setAmount(Number(value ?? 0))} /></label>
          <Button type="primary" disabled={Boolean(blockers.length)} onClick={submit}>提交提现</Button>
        </div>
      </SectionCard>
      <SectionCard title="提现记录">
        <div className="expert-list">
          {state.withdrawalRequests.map((request) => (
            <EntityCard key={request.id} title={formatMoney(request.amount)} subtitle={`${request.accountName} · ${formatDate(request.requestedAt)}`} meta={statusTag(WITHDRAWAL_STATUS_META[request.status])} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertMeBankCardPage() {
  const { state, saveBankAccount, reviewBankAccount } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [input, setInput] = useState<BankAccountInput>(() => ({
    accountName: state.bankAccount.accountName || state.expert.name || state.application.expertName,
    cardNo: state.bankAccount.cardNo || '6222 0200 0000 8888',
    bankName: state.bankAccount.bankName || '招商银行上海分行',
    reservedPhone: state.bankAccount.reservedPhone || state.application.contactPhone || '13800000000',
    isDefault: state.bankAccount.isDefault,
  }));

  function update<K extends keyof BankAccountInput>(key: K, value: BankAccountInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (!input.accountName.trim() || !input.cardNo.trim() || !input.bankName.trim()) {
      messageApi.warning('请补充开户人、银行卡号和开户行');
      return;
    }
    saveBankAccount(input);
    messageApi.success('收款银行卡已提交校验');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="收款银行卡" note="提现前必须设置并完成银行卡校验" extra={statusTag(BANK_STATUS_META[state.bankAccount.status])}>
        <div className="expert-form-stack">
          <label>开户人/机构名<Input value={input.accountName} onChange={(event) => update('accountName', event.target.value)} /></label>
          <label>银行卡号<Input value={input.cardNo} onChange={(event) => update('cardNo', event.target.value)} /></label>
          <label>开户行<Input value={input.bankName} onChange={(event) => update('bankName', event.target.value)} /></label>
          <label>预留手机号<Input value={input.reservedPhone} onChange={(event) => update('reservedPhone', event.target.value)} /></label>
          <div className="expert-setting-row"><span>设为默认收款账户</span><Switch checked={input.isDefault} onChange={(checked) => update('isDefault', checked)} /></div>
        </div>
      </SectionCard>
      {state.bankAccount.status === 'pending' ? (
        <SectionCard title="银行卡校验">
          <div className="expert-form-stack">
            <Button type="primary" onClick={() => { reviewBankAccount('approved', '银行卡信息校验通过'); messageApi.success('收款银行卡已生效'); }}>运营校验通过</Button>
            <Button danger onClick={() => { reviewBankAccount('rejected', '银行卡号或开户行信息需核对'); messageApi.warning('银行卡校验未通过'); }}>校验驳回并填写原因</Button>
          </div>
        </SectionCard>
      ) : null}
      {state.bankAccount.reviewOpinion ? <p className="expert-note-box">审核意见：{state.bankAccount.reviewOpinion}</p> : null}
      <PageActionBar>
        <Button onClick={() => window.history.back()}>返回</Button>
        <Button type="primary" onClick={submit}>提交校验</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertMeInvoicePage() {
  const { state, saveInvoiceProfile, reviewInvoiceProfile } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [input, setInput] = useState<InvoiceProfileInput>(() => ({
    invoiceType: state.invoiceProfile.invoiceType || '企业',
    title: state.invoiceProfile.title || state.expert.organization || state.application.organization || '上海知远科普咨询中心',
    taxNo: state.invoiceProfile.taxNo || '91310000MA1YXB2605',
    registeredAddress: state.invoiceProfile.registeredAddress || '上海市浦东新区研学路 88 号',
    registeredPhone: state.invoiceProfile.registeredPhone || '021-66000000',
    bankName: state.invoiceProfile.bankName || '招商银行上海分行',
    bankAccount: state.invoiceProfile.bankAccount || '6222020000008888',
    email: state.invoiceProfile.email || 'finance@yanxuebao.cn',
  }));

  function update<K extends keyof InvoiceProfileInput>(key: K, value: InvoiceProfileInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (!input.title.trim() || !input.email.trim()) {
      messageApi.warning('请补充发票抬头和接收邮箱');
      return;
    }
    saveInvoiceProfile(input);
    messageApi.success('发票资料已提交审核');
  }

  return (
    <div className="expert-page expert-flow-page">
      {contextHolder}
      <SectionCard title="发票资料" note="提现结算前需通过发票资料审核" extra={statusTag(INVOICE_STATUS_META[state.invoiceProfile.status])}>
        <div className="expert-form-stack">
          <label>
            发票类型
            <Select
              value={input.invoiceType}
              onChange={(value) => update('invoiceType', value)}
              options={[
                { label: '企业', value: '企业' },
                { label: '个人', value: '个人' },
              ]}
            />
          </label>
          <label>发票抬头<Input value={input.title} onChange={(event) => update('title', event.target.value)} /></label>
          <label>税号<Input value={input.taxNo} onChange={(event) => update('taxNo', event.target.value)} /></label>
          <label>注册地址<Input.TextArea rows={2} value={input.registeredAddress} onChange={(event) => update('registeredAddress', event.target.value)} /></label>
          <label>注册电话<Input value={input.registeredPhone} onChange={(event) => update('registeredPhone', event.target.value)} /></label>
          <label>开户行<Input value={input.bankName} onChange={(event) => update('bankName', event.target.value)} /></label>
          <label>开户行账号<Input value={input.bankAccount} onChange={(event) => update('bankAccount', event.target.value)} /></label>
          <label>电子发票邮箱<Input value={input.email} onChange={(event) => update('email', event.target.value)} /></label>
        </div>
      </SectionCard>
      {state.invoiceProfile.status === 'pending' ? (
        <SectionCard title="发票审核">
          <div className="expert-form-stack">
            <Button type="primary" onClick={() => { reviewInvoiceProfile('approved', '发票资料完整，审核通过'); messageApi.success('发票资料已通过'); }}>运营审核通过</Button>
            <Button danger onClick={() => { reviewInvoiceProfile('rejected', '发票税号或开户地址需核对'); messageApi.warning('发票资料已驳回'); }}>审核驳回并填写原因</Button>
          </div>
        </SectionCard>
      ) : null}
      {state.invoiceProfile.reviewOpinion ? <p className="expert-note-box">审核意见：{state.invoiceProfile.reviewOpinion}</p> : null}
      <PageActionBar>
        <Button onClick={() => window.history.back()}>返回</Button>
        <Button type="primary" onClick={submit}>提交审核</Button>
      </PageActionBar>
    </div>
  );
}

export function ExpertMeSettingsPage() {
  const { state, resetData, restoreDemoData, updateSettings } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  function logout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="系统设置" note="设置项作为我的二级页面展示">
        <div className="expert-setting-list">
          <div className="expert-setting-row"><span><SettingOutlined /> 接收工作提醒</span><Switch checked={state.settings.notificationEnabled} onChange={(checked) => updateSettings({ notificationEnabled: checked })} /></div>
          <div className="expert-setting-row"><span><AppstoreOutlined /> 紧凑列表</span><Switch checked={state.settings.compactList} onChange={(checked) => updateSettings({ compactList: checked })} /></div>
          <div className="expert-setting-row"><span><SafetyCertificateOutlined /> 数据水印</span><Switch checked={state.settings.dataWatermark} onChange={(checked) => updateSettings({ dataWatermark: checked })} /></div>
        </div>
      </SectionCard>
      <SectionCard title="账号与数据" note="低频操作放在系统设置，避免占用我的一级页">
        <div className="expert-form-stack">
          <Button block icon={<ReloadOutlined />} onClick={() => { restoreDemoData(); messageApi.success('演示数据已恢复'); }}>恢复演示数据</Button>
          <Button block icon={<ReloadOutlined />} onClick={() => { resetData(); messageApi.success('初始数据已恢复'); }}>恢复初始数据</Button>
          <Button block danger icon={<LogoutOutlined />} onClick={logout}>退出登录</Button>
        </div>
      </SectionCard>
    </div>
  );
}

export function ExpertMeSimpleInfoPage({ type }: { type: 'profile' | 'organization' | 'account' }) {
  const { state } = useExpertStore();
  const identity = displayIdentity(state);
  const title = type === 'profile' ? '专家资料' : type === 'organization' ? '机构资料' : '账户与资质';
  const rows =
    type === 'profile'
      ? [
          ['姓名', identity.name],
          ['头衔', identity.title],
          ['领域', identity.field],
          ['账号编号', state.expert.accountNo || '审核通过后生成'],
        ]
      : type === 'organization'
        ? [
            ['合作机构', identity.organization],
            ['机构角色', '专家合作方'],
            ['当前智能体', state.agents.find((agent) => agent.id === state.activeAgentId)?.name ?? '暂未选择'],
          ]
        : [
            ['入驻状态', ACCOUNT_STATUS_META[state.accountStatus].label],
            ['收款账户', `${state.bankAccount.accountName || '待设置'} · ${state.bankAccount.bankName || '开户行待设置'} · ${BANK_STATUS_META[state.bankAccount.status].label}`],
            ['发票抬头', `${state.invoiceProfile.title || '待设置'} · ${INVOICE_STATUS_META[state.invoiceProfile.status].label}`],
            ['可提现余额', formatMoney(state.settlement.availableAmount)],
          ];

  return (
    <div className="expert-page">
      <SectionCard title={title}>
        <div className="expert-confirm-list">
          {rows.map(([label, value]) => (
            <div key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
      </SectionCard>
      {type === 'account' ? (
        <SectionCard title="资料入口">
          <div className="expert-h5-list">
            <H5ListLink href="/onboarding" icon={<SafetyCertificateOutlined />} title="入驻资料" text="补充资料并重新提交运营审核" />
            <H5ListLink href="/me/bank-card" icon={<BankOutlined />} title="收款银行卡" text="设置提现收款账户" />
            <H5ListLink href="/me/invoice" icon={<FileTextOutlined />} title="发票资料" text="维护结算开票信息" />
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
