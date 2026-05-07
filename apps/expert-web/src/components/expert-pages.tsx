'use client';

import {
  AppstoreOutlined,
  BankOutlined,
  BookOutlined,
  ClockCircleOutlined,
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
import { Avatar, Button, Empty, Input, InputNumber, Progress, Segmented, Select, Switch, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { clearSession } from '../lib/api';
import {
  type AccountType,
  type AgentInput,
  type AgentLifecycleStatus,
  type BankAccountInput,
  type BankAccountStatus,
  type ChallengeInput,
  type ChallengeStatus,
  type CollectionRuleInput,
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

type AgentFilterKey = 'all' | AgentLifecycleStatus;
type ContentEntranceKey = 'qa' | 'knowledge' | 'news' | 'challenges' | 'submissions' | 'evaluations';

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
  offline_course: { label: '线下课程', short: '线下' },
  pbl: { label: 'PBL 活动', short: 'PBL' },
  face_to_face: { label: '大咖面对面', short: '大咖' },
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
      ? '待选择账号类型'
      : state.application.accountType === 'organization'
        ? '机构账号'
        : '专家个人';

  return {
    accountTypeText,
    subjectName: state.application.organization || state.application.expertName || '待填写主体名称',
    field: state.application.field || '待选择专业领域',
    title:
      state.accountStatus === 'under_review'
        ? '资料审核中'
        : state.accountStatus === 'rejected'
          ? '资料需补充'
          : '完成专家入驻',
    subtitle:
      state.accountStatus === 'under_review'
        ? '运营审核通过后，将开放智能体、课程和内容运营能力'
        : state.accountStatus === 'rejected'
          ? '请根据审核意见补充资料后重新提交'
          : '提交主体资料、资质材料和联系人信息后开启合作能力',
    avatar: state.accountStatus === 'under_review' ? '审' : state.accountStatus === 'rejected' ? '补' : '入',
  };
}

function parseTags(value: string) {
  return value
    .split(/[,\n、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function useRouteId() {
  const params = useParams();
  const value = params?.id;
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function statusTag(meta: { label: string; color: string }) {
  return <Tag color={meta.color}>{meta.label}</Tag>;
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
  const { state } = useExpertStore();
  const identity = displayIdentity(state);
  const onboardingSummary = displayOnboardingSummary(state);
  const approved = state.accountStatus === 'approved';
  const publishedAgents = state.agents.filter((agent) => agent.status === 'published').length;
  const unmatchedQa = state.qaRecords.filter((record) => record.status === 'unmatched').length;
  const pendingSubmissions = state.challengeSubmissions.filter((submission) => submission.status === 'pending').length;
  const pendingProducts = state.products.filter((product) => product.status === 'draft' || product.status === 'pending_review').length;
  const pendingEvaluations = state.evaluationBatches.filter((batch) => batch.reportStatus !== 'synced').length;
  const criticalWarnings = [
    state.bankAccount.status !== 'active' ? '收款银行卡未生效，暂不能提交提现' : '',
    state.invoiceProfile.status !== 'approved' ? '发票资料未通过，暂不能提交提现' : '',
    state.products.some((product) => product.status === 'rejected') ? '有课程审核驳回，请补充资料后重新提交' : '',
    unmatchedQa ? `${unmatchedQa} 条问答未匹配知识库` : '',
    pendingSubmissions ? `${pendingSubmissions} 份挑战作品待审核` : '',
  ].filter(Boolean);
  const todoItems = [
    { label: '待创建/测试智能体', value: state.agents.length ? state.agents.filter((agent) => agent.status !== 'published').length : 1 },
    { label: '待上架课程产品', value: pendingProducts },
    { label: '待补答问答', value: unmatchedQa },
    { label: '待同步评价批次', value: pendingEvaluations },
  ];
  const recentLogs = state.logs.slice(0, 4);
  const onboardingActionText =
    state.accountStatus === 'under_review'
      ? '查看审核进度'
      : state.accountStatus === 'rejected'
        ? '修改并重新提交'
        : '提交入驻资料';

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

      {!approved ? (
        <SectionCard title="入驻进度" note="开通前只展示入驻状态，不展示运营工作台功能">
          <div className="expert-confirm-list">
            <div><span>当前状态</span><strong>{ACCOUNT_STATUS_META[state.accountStatus].label}</strong></div>
            <div><span>账号类型</span><strong>{onboardingSummary.accountTypeText}</strong></div>
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
        <section className="expert-mobile-kpi-row">
          <div>
            <strong>{publishedAgents}</strong>
            <span>已上架智能体</span>
          </div>
          <div>
            <strong>{pendingProducts}</strong>
            <span>待上架课程</span>
          </div>
          <div>
            <strong>{pendingSubmissions}</strong>
            <span>待审作品</span>
          </div>
        </section>
      ) : null}

      {approved ? (
        <SectionCard title="今日待办" note="首页只放最关键的行动提醒">
          <div className="expert-todo-list">
            {todoItems.map((item) => (
              <div className="expert-todo-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {approved ? (
        <SectionCard title="常用操作" note="最多六个入口，全部进入移动端二级页">
          <div className="expert-shortcut-grid">
            <>
              <Link href="/agents/new"><RobotOutlined /><span>创建智能体</span></Link>
              <Link href="/courses/new"><BookOutlined /><span>上架课程</span></Link>
              <Link href="/content/qa"><FormOutlined /><span>补充问答</span></Link>
              <Link href="/content/news"><FileTextOutlined /><span>发布资讯</span></Link>
              <Link href="/content/challenges"><FireOutlined /><span>发布挑战</span></Link>
              <Link href="/content/submissions"><StarOutlined /><span>审核作品</span></Link>
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

const ONBOARDING_STEPS = ['账号类型', '主体资料', '资质材料', '联系人', '提交审核'];

export function ExpertOnboardingPage() {
  const { state, submitApplication, reviewApplication } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ExpertApplicationInput>(() => ({
    accountType: state.application.accountType || 'expert',
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

  function updateDraft<K extends keyof ExpertApplicationInput>(key: K, value: ExpertApplicationInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (!draft.expertName.trim() || !draft.field.trim() || !draft.contactPhone.trim()) {
      messageApi.warning('请补充姓名、领域和联系人电话');
      return;
    }
    submitApplication(draft);
    messageApi.success('入驻资料已提交');
  }

  if (state.accountStatus === 'under_review') {
    return (
      <div className="expert-page">
        {contextHolder}
        <SectionCard title="运营审核中" note="专家端展示当前审核进度，运营后台完成审核后账号开通">
          <div className="expert-confirm-list">
            <div><span>账号类型</span><strong>{state.application.accountType === 'expert' ? '专家个人' : '机构账号'}</strong></div>
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
            <H5ListLink href="/agents/new" icon={<RobotOutlined />} title="创建智能体" text="配置学员问答和知识库绑定" />
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

      {step === 0 ? (
        <SectionCard title="选择账号类型" note="专家个人和机构账号都会进入运营审核">
          <Segmented
            block
            value={draft.accountType}
            onChange={(value) => updateDraft('accountType', value as AccountType)}
            options={[
              { label: '专家个人', value: 'expert' },
              { label: '机构账号', value: 'organization' },
            ]}
          />
          <p className="expert-note-box">{draft.accountType === 'expert' ? '适合专家本人入驻并独立管理课程、智能体和内容。' : '适合机构主体入驻，由负责人维护专家资料和经营结算。'}</p>
        </SectionCard>
      ) : null}

      {step === 1 ? (
        <SectionCard title="主体资料" note="这些信息会展示在专家端首页和我的资料中">
          <div className="expert-form-stack">
            <label>专家姓名<Input value={draft.expertName} onChange={(event) => updateDraft('expertName', event.target.value)} /></label>
            <label>专家头衔<Input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} /></label>
            <label>机构/工作室<Input value={draft.organization} onChange={(event) => updateDraft('organization', event.target.value)} /></label>
            <label>专业领域<Input.TextArea rows={3} value={draft.field} onChange={(event) => updateDraft('field', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard title="资质材料" note="提交身份证明、营业执照、授权资料或专业资质文件名称">
          <div className="expert-form-stack">
            <label>资质名称<Input value={draft.credentialName} onChange={(event) => updateDraft('credentialName', event.target.value)} /></label>
            <label>身份证明/营业执照<Input prefix={<UploadOutlined />} value={draft.credentialFileName} onChange={(event) => updateDraft('credentialFileName', event.target.value)} /></label>
            <label>授权资料<Input prefix={<UploadOutlined />} value={draft.authorizationFileName} onChange={(event) => updateDraft('authorizationFileName', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard title="联系人信息" note="运营审核、课程审核和结算异常会联系此联系人">
          <div className="expert-form-stack">
            <label>联系人<Input value={draft.contactName} onChange={(event) => updateDraft('contactName', event.target.value)} /></label>
            <label>联系电话<Input value={draft.contactPhone} onChange={(event) => updateDraft('contactPhone', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 4 ? (
        <SectionCard title="提交审核" note="提交后进入运营审核中，审核通过后解锁专家端完整能力">
          <div className="expert-confirm-list">
            <div><span>账号类型</span><strong>{draft.accountType === 'expert' ? '专家个人' : '机构账号'}</strong></div>
            <div><span>专家姓名</span><strong>{draft.expertName}</strong></div>
            <div><span>合作机构</span><strong>{draft.organization}</strong></div>
            <div><span>专业领域</span><strong>{draft.field}</strong></div>
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
  const [filter, setFilter] = useState<AgentFilterKey>('all');
  const filteredAgents = filter === 'all' ? state.agents : state.agents.filter((agent) => agent.status === filter);
  const totalConversations = state.agents.reduce((sum, agent) => sum + agent.operations.conversations, 0);

  return (
    <div className="expert-page">
      <SectionCard
        title="智能体"
        note="管理专家陪伴学习入口，复杂配置进入二级页面"
        extra={<Link className="expert-primary-link" href="/agents/new">创建</Link>}
      >
        <section className="expert-mobile-kpi-row">
          <div><strong>{state.agents.length}</strong><span>智能体</span></div>
          <div><strong>{state.agents.filter((agent) => agent.status === 'published').length}</strong><span>已上架</span></div>
          <div><strong>{totalConversations}</strong><span>问答次数</span></div>
        </section>
      </SectionCard>

      <SectionCard title="智能体列表">
        {state.agents.length === 0 ? (
          <MobileEmpty text="还没有智能体，请先创建一个专家陪伴入口。" action={<Button type="primary" href="/agents/new">创建智能体</Button>} />
        ) : (
          <div className="expert-stack">
            <Segmented
              block
              value={filter}
              onChange={(value) => setFilter(value as AgentFilterKey)}
              options={[
                { label: '全部', value: 'all' },
                { label: '草稿', value: 'draft' },
                { label: '测试', value: 'testing' },
                { label: '上架', value: 'published' },
                { label: '下架', value: 'unpublished' },
              ]}
            />
            <div className="expert-list">
              {filteredAgents.map((agent) => (
                <Link className="expert-agent-list-card" href={`/agents/${agent.id}`} key={agent.id}>
                  <Avatar size={42}>{agent.avatarText}</Avatar>
                  <span>
                    <strong>{agent.name}</strong>
                    <small>{agent.field} · {agent.replyStyle}</small>
                  </span>
                  {statusTag(AGENT_STATUS_META[agent.status])}
                  <RightOutlined />
                </Link>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

type AgentWizardDraft = AgentInput & {
  testQuestion: string;
};

const AGENT_WIZARD_TITLES = ['基础信息', '角色定位', '知识绑定', '回复策略', '测试预览', '上架确认'];

export function ExpertAgentCreatePage() {
  const { state, createAgent, addAgentTestRecord, setAgentStatus } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<AgentWizardDraft>({
    name: '海洋探索导师',
    avatarText: '海',
    field: '海洋生态',
    rolePositioning: '面向 8-14 岁学员，用儿童可理解的语言解释海洋科学问题。',
    welcomeMessage: '你好，我会结合课程、知识库和现场观察，陪你继续深挖海洋里的问题。',
    promptTemplate: '请先讲清事实，再引导学员继续观察和表达；回答不超过 180 字。',
    replyStyle: '启发提问',
    knowledgeIds: state.knowledgeEntries.filter((item) => !item.archivedAt).slice(0, 2).map((item) => item.id),
    testQuestion: '为什么海边退潮后会留下小水坑？',
  });

  function updateDraft<K extends keyof AgentWizardDraft>(key: K, value: AgentWizardDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function finish(publish: boolean) {
    if (!draft.name.trim()) {
      messageApi.warning('请填写智能体名称');
      setStep(0);
      return;
    }
    const agentId = createAgent(draft);
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
        <span>第 {step + 1} 步 / 6</span>
        <Progress percent={Math.round(((step + 1) / 6) * 100)} showInfo={false} size="small" />
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
          </div>
        </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard title="知识绑定" note="选择一个或多个知识库条目，顺序越靠前优先级越高">
          <Select
            mode="multiple"
            value={draft.knowledgeIds}
            onChange={(value) => updateDraft('knowledgeIds', value)}
            style={{ width: '100%' }}
            options={state.knowledgeEntries.filter((entry) => !entry.archivedAt).map((entry) => ({ label: entry.title, value: entry.id }))}
          />
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard title="回复策略" note="控制回答风格、长度和引导方式">
          <div className="expert-form-stack">
            <label>
              回复风格
              <Select
                value={draft.replyStyle}
                onChange={(value) => updateDraft('replyStyle', value)}
                options={['鼓励型', '专业严谨', '启发提问', '陪伴观察'].map((style) => ({ label: style, value: style as ReplyStyle }))}
              />
            </label>
            <label>提示词模板<Input.TextArea rows={6} value={draft.promptTemplate} onChange={(event) => updateDraft('promptTemplate', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 4 ? (
        <SectionCard title="测试预览" note="保存时会生成一条测试记录，草稿自动进入测试中">
          <div className="expert-form-stack">
            <label>测试问题<Input.TextArea rows={4} value={draft.testQuestion} onChange={(event) => updateDraft('testQuestion', event.target.value)} /></label>
            <p className="expert-note-box">预览回复：我会先把问题拆成可观察现象，再结合课程和知识库给出适合孩子理解的回答。</p>
          </div>
        </SectionCard>
      ) : null}

      {step === 5 ? (
        <SectionCard title="上架确认" note="可先保存草稿，也可以直接上架到学员侧">
          <div className="expert-confirm-list">
            <div><span>名称</span><strong>{draft.name}</strong></div>
            <div><span>领域</span><strong>{draft.field}</strong></div>
            <div><span>知识绑定</span><strong>{draft.knowledgeIds.length} 个</strong></div>
            <div><span>回复风格</span><strong>{draft.replyStyle}</strong></div>
          </div>
        </SectionCard>
      ) : null}

      <PageActionBar>
        {step > 0 ? <Button onClick={() => setStep((current) => current - 1)}>上一步</Button> : <Button onClick={() => router.back()}>取消</Button>}
        {step < 5 ? (
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
  const { state, setAgentStatus, updateAgentBindings, addAgentTestRecord } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [question, setQuestion] = useState('这个问题可以怎样继续观察？');
  const agent = state.agents.find((item) => item.id === agentId);

  if (!agent) {
    return <MobileEmpty text="没有找到该智能体" action={<Button href="/agents">返回列表</Button>} />;
  }

  const tests = state.agentTestRecords.filter((record) => record.agentId === agent.id);

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title="基础资料" extra={statusTag(AGENT_STATUS_META[agent.status])}>
        <div className="expert-agent-profile">
          <Avatar size={52}>{agent.avatarText}</Avatar>
          <div>
            <strong>{agent.name}</strong>
            <span>{agent.field} · {agent.replyStyle}</span>
          </div>
        </div>
        <p className="expert-note-box">{agent.rolePositioning}</p>
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
        <div className="expert-form-stack">
          <Input.TextArea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} />
          <Button
            type="primary"
            onClick={() => {
              addAgentTestRecord(agent.id, question);
              messageApi.success('已生成测试记录');
            }}
          >
            生成测试记录
          </Button>
        </div>
        <div className="expert-list">
          {tests.slice(0, 3).map((record) => (
            <EntityCard key={record.id} title={record.question} subtitle={formatDate(record.testedAt)} meta={<Tag color={record.result === 'passed' ? 'success' : 'warning'}>{record.result === 'passed' ? '通过' : '需优化'}</Tag>}>
              <p>{record.answer}</p>
            </EntityCard>
          ))}
        </div>
      </SectionCard>

      <PageActionBar>
        {agent.status === 'published' ? (
          <Button block onClick={() => setAgentStatus(agent.id, 'unpublished')}>下架智能体</Button>
        ) : (
          <Button block type="primary" onClick={() => setAgentStatus(agent.id, 'published')}>上架智能体</Button>
        )}
      </PageActionBar>
    </div>
  );
}

export function ExpertCoursesPage() {
  const { state } = useExpertStore();
  const groupedProducts = Object.entries(PRODUCT_TYPE_META).map(([type, meta]) => ({
    type: type as ProductType,
    meta,
    products: state.products.filter((product) => product.productType === type),
  }));

  return (
    <div className="expert-page">
      <SectionCard title="课程" note="课程一级页只做产品总览和经营入口" extra={<Link className="expert-primary-link" href="/courses/new">新建</Link>}>
        <div className="expert-mobile-kpi-row">
          <div><strong>{state.products.length}</strong><span>产品</span></div>
          <div><strong>{state.orders.length}</strong><span>订单</span></div>
          <div><strong>{formatMoney(state.products.reduce((sum, item) => sum + item.payAmount - item.refundAmount, 0))}</strong><span>收入</span></div>
        </div>
      </SectionCard>

      <SectionCard title="经营入口">
        <div className="expert-h5-list">
          <H5ListLink href="/courses/orders" icon={<DollarOutlined />} title="销售与订单" text="查看预约、支付、退款和新增预约" />
          <H5ListLink href="/courses/writeoff" icon={<ScanOutlined />} title="课程核销" text="扫码占位或输入预约码完成核销" />
          <H5ListLink href="/courses/distribution" icon={<StarOutlined />} title="分销配置" text="按课程设置佣金比例和推广状态" />
        </div>
      </SectionCard>

      {groupedProducts.map((group) => (
        <SectionCard key={group.type} title={group.meta.label} note={`${group.products.length} 个产品`}>
          {group.products.length ? (
            <div className="expert-list">
              {group.products.map((product) => (
                <Link className="expert-product-list-card" key={product.id} href={`/courses/${product.id}`}>
                  <span>
                    <strong>{product.title}</strong>
                    <small>{product.targetAge} · {formatMoney(product.price)} · {product.reservations}/{product.capacity} 预约</small>
                  </span>
                  {statusTag(PRODUCT_STATUS_META[product.status])}
                  <RightOutlined />
                </Link>
              ))}
            </div>
          ) : (
            <MobileEmpty text={`暂无${group.meta.label}`} />
          )}
        </SectionCard>
      ))}
    </div>
  );
}

type ProductWizardDraft = ProductInput & {
  coverFileName: string;
  materialFileName: string;
  courseFormat: string;
  trialSetting: string;
  discountPrice: number;
  publishAt: string;
  routePlan: string;
  meetingPoint: string;
  safetyNotice: string;
  mentorName: string;
  projectStages: string;
  outcomeRequirement: string;
  growthRule: string;
  liveTime: string;
  guestName: string;
  tagsText: string;
};

const COURSE_WIZARD_STEPS = ['课程类型', '基础信息', '售卖信息', '内容/行程', '场次/库存', '封面资料', '提交审核'];

function buildProductInput(productType: ProductType): ProductWizardDraft {
  const meta = PRODUCT_TYPE_META[productType];
  return {
    title: `新的${meta.label}`,
    productType,
    summary: '围绕专家领域设计完整学习目标、交付过程和成果反馈。',
    targetAge: '8-14岁',
    price: productType === 'pbl' ? 699 : 199,
    capacity: productType === 'online_course' ? 500 : 30,
    location: productType === 'online_course' || productType === 'face_to_face' ? '线上学习' : '待定研学点',
    schedule: productType === 'pbl' ? '4 周项目制' : '待安排',
    bookingDeadline: '待设置',
    deliveryPlan: productType === 'pbl' ? '项目启动、现场探究、成果路演' : '课程学习、互动答疑、成果任务',
    chapters: [{ title: '课程导入', duration: '30分钟', summary: '介绍课程目标、学习方法和成果要求' }],
    tags: [meta.label],
    coverFileName: `${meta.label}封面图.png`,
    materialFileName: `${meta.label}课程资料.pdf`,
    courseFormat: productType === 'online_course' ? '录播课 + 线上答疑' : productType === 'face_to_face' ? '直播分享 + 互动问答' : '线下带队 + 任务单',
    trialSetting: productType === 'online_course' ? '开放第一节试听' : '不开放试听',
    discountPrice: productType === 'pbl' ? 599 : 159,
    publishAt: '审核通过后立即上架',
    routePlan: '集合签到、专家导入、现场观察、成果分享、返程总结',
    meetingPoint: '研学基地入口服务台',
    safetyNotice: '需确认学生健康信息，现场按导师指引行动，避免脱离队伍。',
    mentorName: '张知远',
    projectStages: '启动课、问题定义、资料研究、现场探究、成果路演',
    outcomeRequirement: '提交观察记录、研究海报或小组路演作品',
    growthRule: '完成任务获得 30-80 成长值，优秀作品追加奖励',
    liveTime: '2026-06-08 19:30',
    guestName: '特邀科学家',
    tagsText: meta.label,
  };
}

export function ExpertCourseCreatePage() {
  const { saveProduct, setProductStatus } = useExpertStore();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<ProductWizardDraft>(() => buildProductInput('online_course'));

  function update<K extends keyof ProductWizardDraft>(key: K, value: ProductWizardDraft[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function save() {
    const chapters: ProductInput['chapters'] = [
      {
        title: input.productType === 'online_course' ? '核心课程内容' : input.productType === 'offline_course' ? '现场研学流程' : input.productType === 'pbl' ? '项目交付阶段' : '大咖分享环节',
        duration: input.productType === 'pbl' ? input.schedule : '90分钟',
        summary:
          input.productType === 'offline_course'
            ? input.routePlan
            : input.productType === 'pbl'
              ? input.projectStages
              : input.deliveryPlan,
      },
    ];
    const deliveryPlan = [
      input.deliveryPlan,
      input.productType === 'online_course' ? `试听设置：${input.trialSetting}` : '',
      input.productType === 'offline_course' ? `集合信息：${input.meetingPoint}；安全须知：${input.safetyNotice}` : '',
      input.productType === 'pbl' ? `成果要求：${input.outcomeRequirement}；成长值规则：${input.growthRule}` : '',
      input.productType === 'face_to_face' ? `嘉宾：${input.guestName}；直播时间：${input.liveTime}` : '',
      `课程资料：${input.materialFileName}`,
    ]
      .filter(Boolean)
      .join('\n');
    const productId = saveProduct({
      title: input.title,
      productType: input.productType,
      summary: input.summary,
      targetAge: input.targetAge,
      price: input.price,
      capacity: input.capacity,
      location: input.location,
      schedule: input.schedule,
      bookingDeadline: input.bookingDeadline,
      deliveryPlan,
      chapters,
      tags: parseTags(input.tagsText),
    });
    setProductStatus(productId, 'pending_review');
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
        <SectionCard title="选择课程类型" note="PBL 和大咖面对面作为课程产品类型统一管理">
          <Segmented
            block
            value={input.productType}
            onChange={(value) => setInput(buildProductInput(value as ProductType))}
            options={Object.entries(PRODUCT_TYPE_META).map(([value, meta]) => ({ label: meta.short, value }))}
          />
          <p className="expert-note-box">{PRODUCT_TYPE_META[input.productType].label}会进入课程中心，审核通过后才能上架、预约、核销和分销。</p>
        </SectionCard>
      ) : null}

      {step === 1 ? (
        <SectionCard title="基础信息" note="用于学员侧课程卡片和详情页首屏">
        <div className="expert-form-stack">
          <label>产品名称<Input value={input.title} onChange={(event) => update('title', event.target.value)} /></label>
          <label>简介<Input.TextArea rows={4} value={input.summary} onChange={(event) => update('summary', event.target.value)} /></label>
          <label>适龄范围<Input value={input.targetAge} onChange={(event) => update('targetAge', event.target.value)} /></label>
          <label>标签<Input value={input.tagsText} onChange={(event) => update('tagsText', event.target.value)} /></label>
        </div>
      </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard title="售卖信息" note="价格、折扣、预约截止和上架时间共同影响销售">
          <div className="expert-form-grid">
            <label>标准价<InputNumber value={input.price} min={0} onChange={(value) => update('price', Number(value ?? 0))} /></label>
            <label>限时价<InputNumber value={input.discountPrice} min={0} onChange={(value) => update('discountPrice', Number(value ?? 0))} /></label>
          </div>
          <div className="expert-form-stack">
            <label>预约截止<Input value={input.bookingDeadline} onChange={(event) => update('bookingDeadline', event.target.value)} /></label>
            <label>上架时间<Input value={input.publishAt} onChange={(event) => update('publishAt', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard title={input.productType === 'online_course' ? '课程内容' : input.productType === 'offline_course' ? '线下行程' : input.productType === 'pbl' ? '项目交付' : '分享设置'} note="不同课程类型需要补充不同交付信息">
          <div className="expert-form-stack">
            {input.productType === 'online_course' ? (
              <>
                <label>课程形式<Input value={input.courseFormat} onChange={(event) => update('courseFormat', event.target.value)} /></label>
                <label>章节/课时<Input.TextArea rows={4} value={input.deliveryPlan} onChange={(event) => update('deliveryPlan', event.target.value)} /></label>
                <label>试听设置<Input value={input.trialSetting} onChange={(event) => update('trialSetting', event.target.value)} /></label>
              </>
            ) : null}
            {input.productType === 'offline_course' ? (
              <>
                <label>行程安排<Input.TextArea rows={4} value={input.routePlan} onChange={(event) => update('routePlan', event.target.value)} /></label>
                <label>集合信息<Input value={input.meetingPoint} onChange={(event) => update('meetingPoint', event.target.value)} /></label>
                <label>安全须知<Input.TextArea rows={3} value={input.safetyNotice} onChange={(event) => update('safetyNotice', event.target.value)} /></label>
              </>
            ) : null}
            {input.productType === 'pbl' ? (
              <>
                <label>交付周期<Input value={input.schedule} onChange={(event) => update('schedule', event.target.value)} /></label>
                <label>项目阶段<Input.TextArea rows={4} value={input.projectStages} onChange={(event) => update('projectStages', event.target.value)} /></label>
                <label>成果要求<Input.TextArea rows={3} value={input.outcomeRequirement} onChange={(event) => update('outcomeRequirement', event.target.value)} /></label>
                <label>成长值规则<Input value={input.growthRule} onChange={(event) => update('growthRule', event.target.value)} /></label>
              </>
            ) : null}
            {input.productType === 'face_to_face' ? (
              <>
                <label>嘉宾信息<Input value={input.guestName} onChange={(event) => update('guestName', event.target.value)} /></label>
                <label>直播/预约时间<Input value={input.liveTime} onChange={(event) => update('liveTime', event.target.value)} /></label>
                <label>分享提纲<Input.TextArea rows={4} value={input.deliveryPlan} onChange={(event) => update('deliveryPlan', event.target.value)} /></label>
              </>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      {step === 4 ? (
        <SectionCard title="场次与库存" note="线上课可设置长期库存，线下/PBL/大咖需明确场次和招募人数">
          <div className="expert-form-stack">
            <label>地点/形式<Input value={input.location} onChange={(event) => update('location', event.target.value)} /></label>
            <label>排期/场次<Input value={input.schedule} onChange={(event) => update('schedule', event.target.value)} /></label>
            <label>招募人数<InputNumber value={input.capacity} min={1} onChange={(value) => update('capacity', Number(value ?? 1))} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 5 ? (
        <SectionCard title="封面与资料" note="保存课程封面、课程资料、任务单或安全说明文件名称">
          <div className="expert-form-stack">
            <label>封面图<Input prefix={<UploadOutlined />} value={input.coverFileName} onChange={(event) => update('coverFileName', event.target.value)} /></label>
            <label>课程资料<Input prefix={<UploadOutlined />} value={input.materialFileName} onChange={(event) => update('materialFileName', event.target.value)} /></label>
            <label>导师/负责人<Input value={input.mentorName} onChange={(event) => update('mentorName', event.target.value)} /></label>
          </div>
        </SectionCard>
      ) : null}

      {step === 6 ? (
        <SectionCard title="提交运营审核" note="审核通过后才允许上架、销售、预约、核销和分销">
          <div className="expert-confirm-list">
            <div><span>课程类型</span><strong>{PRODUCT_TYPE_META[input.productType].label}</strong></div>
            <div><span>课程名称</span><strong>{input.title}</strong></div>
            <div><span>价格</span><strong>{formatMoney(input.price)} / 限时 {formatMoney(input.discountPrice)}</strong></div>
            <div><span>适龄</span><strong>{input.targetAge}</strong></div>
            <div><span>场次库存</span><strong>{input.schedule} · {input.capacity} 人</strong></div>
            <div><span>封面资料</span><strong>{input.coverFileName} · {input.materialFileName}</strong></div>
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

export function ExpertCourseDetailPage() {
  const productId = useRouteId();
  const { state, setProductStatus, createOrder } = useExpertStore();
  const [messageApi, contextHolder] = message.useMessage();
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    return <MobileEmpty text="没有找到该课程产品" action={<Button href="/courses">返回课程</Button>} />;
  }

  const productOrders = state.orders.filter((order) => order.productId === product.id);

  return (
    <div className="expert-page">
      {contextHolder}
      <SectionCard title={product.title} note={PRODUCT_TYPE_META[product.productType].label} extra={statusTag(PRODUCT_STATUS_META[product.status])}>
        <p className="expert-note-box">{product.summary}</p>
        <div className="expert-mobile-kpi-row">
          <div><strong>{product.views}</strong><span>浏览</span></div>
          <div><strong>{product.reservations}</strong><span>预约</span></div>
          <div><strong>{formatMoney(product.payAmount - product.refundAmount)}</strong><span>收入</span></div>
        </div>
      </SectionCard>
      <SectionCard title="交付信息">
        <div className="expert-confirm-list">
          <div><span>年龄段</span><strong>{product.targetAge}</strong></div>
          <div><span>地点/形式</span><strong>{product.location}</strong></div>
          <div><span>排期</span><strong>{product.schedule}</strong></div>
          <div><span>预约截止</span><strong>{product.bookingDeadline}</strong></div>
          <div><span>交付节奏</span><strong>{product.deliveryPlan}</strong></div>
        </div>
      </SectionCard>
      <SectionCard
        title="订单概况"
        extra={
          <Button
            size="small"
            disabled={product.status !== 'published'}
            onClick={() => {
              createOrder(product.id);
              messageApi.success('已新增预约订单');
            }}
          >
            新增预约
          </Button>
        }
      >
        <div className="expert-list">
          {productOrders.slice(0, 4).map((order) => (
            <EntityCard key={order.id} title={order.studentName} subtitle={`${order.reservationCode} · ${order.channel}`} meta={<Tag>{formatMoney(order.amount)}</Tag>} />
          ))}
          {productOrders.length === 0 ? <MobileEmpty text={product.status === 'published' ? '还没有预约订单' : '课程审核通过并上架后才会产生订单'} /> : null}
        </div>
      </SectionCard>
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
        {product.status === 'published' ? (
          <>
            <Button onClick={() => setProductStatus(product.id, 'unpublished')}>下架</Button>
            <Button type="primary" onClick={() => { createOrder(product.id); messageApi.success('已新增预约订单'); }}>新增预约</Button>
          </>
        ) : null}
        {product.status === 'unpublished' || product.status === 'ended' ? (
          <Button block type="primary" onClick={() => setProductStatus(product.id, 'published')}>重新上架</Button>
        ) : null}
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

export function ExpertContentPage() {
  const { state } = useExpertStore();
  const approved = state.accountStatus === 'approved';
  const entries: Array<{ key: ContentEntranceKey; href: string; icon: React.ReactNode; title: string; text: string; count: number }> = [
    { key: 'qa', href: '/content/qa', icon: <FormOutlined />, title: '问答记录', text: '优先处理未匹配知识库的问题', count: state.qaRecords.filter((item) => item.status === 'unmatched').length },
    { key: 'knowledge', href: '/content/knowledge', icon: <BookOutlined />, title: '知识库管理', text: '维护智能体可调用的专家知识', count: state.knowledgeEntries.filter((item) => !item.archivedAt && item.status === 'enabled').length },
    { key: 'news', href: '/content/news', icon: <FileTextOutlined />, title: '资讯管理', text: '配置采集规则、编辑并定时下发', count: state.newsItems.filter((item) => item.status !== 'published').length },
    { key: 'challenges', href: '/content/challenges', icon: <FireOutlined />, title: '难题挑战', text: '创建挑战、提交审核并发布上线', count: state.challenges.filter((item) => item.status !== 'ended').length },
    { key: 'submissions', href: '/content/submissions', icon: <StarOutlined />, title: '作品审核', text: '确认评分并发放成长值', count: state.challengeSubmissions.filter((item) => item.status === 'pending').length },
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
    .filter((record) => `${record.studentName}${record.question}${record.keywords?.join('') ?? ''}`.includes(keyword.trim()))
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
            <EntityCard key={record.id} title={record.question} subtitle={`${record.studentName} · ${formatDate(record.askedAt)}`} meta={<Tag color={record.status === 'unmatched' ? 'warning' : 'success'}>{record.status === 'unmatched' ? '未匹配' : '已处理'}</Tag>} tags={<AgentName agentId={record.agentId} agents={state.agents} />}>
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
    if (!draft.agentId || !draft.studentName.trim() || !draft.question.trim() || keywords.length === 0) {
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
      <SectionCard title="难题挑战" note="创建后先形成草稿，提交审核通过后再发布上线" extra={<Link className="expert-primary-link" href="/content/challenges/new">创建</Link>}>
        <section className="expert-mobile-kpi-row">
          <div><strong>{state.challenges.length}</strong><span>挑战</span></div>
          <div><strong>{state.challenges.filter((item) => item.status === 'published').length}</strong><span>已发布</span></div>
          <div><strong>{state.challenges.reduce((sum, item) => sum + item.submissionCount, 0)}</strong><span>作品</span></div>
        </section>
      </SectionCard>

      <SectionCard title="挑战列表">
        {state.challenges.length === 0 ? (
          <MobileEmpty text="暂无难题挑战。" action={<Button type="primary" href="/content/challenges/new">创建挑战</Button>} />
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
                {submission.status === 'pending' ? (
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
  const { state, resetData, updateSettings } = useExpertStore();
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
