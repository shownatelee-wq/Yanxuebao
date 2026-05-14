'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { EXPERT_SESSION_EVENT, getStoredSession } from './api';

const LEGACY_STORE_KEY = 'yanxuebao_expert_h5_state_v4';
const STORE_KEY_PREFIX = 'yanxuebao_expert_h5_state_v5';
const STORE_VERSION = 5;

export type ExpertAccountStatus = 'not_started' | 'draft' | 'under_review' | 'rejected' | 'approved';
export type AccountType = 'expert' | 'organization';
export type AuditStatus = 'pending' | 'approved' | 'rejected';
export type BankAccountStatus = 'not_set' | 'pending' | 'active' | 'rejected';
export type InvoiceProfileStatus = 'not_set' | 'pending' | 'approved' | 'rejected';
export type AgentLifecycleStatus = 'draft' | 'testing' | 'published' | 'unpublished';
export type AgentCreationStep = 'basic' | 'role' | 'knowledge' | 'strategy' | 'testing' | 'publish';
export type ReplyStyle = '鼓励型' | '专业严谨' | '启发提问' | '陪伴观察';
export type ProductType = 'online_course' | 'live_course' | 'activity' | 'offline_course' | 'pbl' | 'face_to_face';
export type ProductStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'unpublished' | 'ended';
export type OrderStatus = 'pending_payment' | 'reserved' | 'paid' | 'refund_requested' | 'partial_refunded' | 'refunded' | 'written_off' | 'cancelled';
export type WriteOffStatus = 'success' | 'duplicate' | 'exception';
export type RefundStatus = 'pending' | 'approved' | 'rejected';
export type NewsStatus = 'collected' | 'editing' | 'published';
export type ChallengeStatus = 'draft' | 'ready' | 'published' | 'ended';
export type SubmissionReviewStatus = 'pending' | 'ai_scored' | 'reviewed' | 'returned';
export type WithdrawalStatus = 'submitted' | 'reviewing' | 'paid' | 'rejected';
export type EvaluationReportStatus = 'collecting' | 'generating' | 'completed' | 'synced';
export type NewsFormat = '图文' | '短视频';
export type KnowledgeEntryStatus = 'enabled' | 'disabled';
export type KnowledgeImportStatus = 'uploaded' | 'parsing' | 'completed' | 'failed';
export type ContentWorkflowStatus = 'draft' | 'pending' | 'active' | 'archived';

export type ExpertApplication = {
  accountType: AccountType;
  status: ExpertAccountStatus;
  expertName: string;
  title: string;
  organization: string;
  field: string;
  credentialName: string;
  credentialFileName: string;
  authorizationFileName: string;
  contactName: string;
  contactPhone: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewOpinion?: string;
};

export type ExpertApplicationInput = Omit<ExpertApplication, 'status' | 'submittedAt' | 'reviewedAt' | 'reviewOpinion'>;

export type BankAccount = {
  accountName: string;
  cardNo: string;
  bankName: string;
  reservedPhone: string;
  isDefault: boolean;
  status: BankAccountStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewOpinion?: string;
};

export type BankAccountInput = Omit<BankAccount, 'status' | 'submittedAt' | 'reviewedAt' | 'reviewOpinion'>;

export type InvoiceProfile = {
  invoiceType: '个人' | '企业';
  title: string;
  taxNo: string;
  registeredAddress: string;
  registeredPhone: string;
  bankName: string;
  bankAccount: string;
  email: string;
  status: InvoiceProfileStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewOpinion?: string;
};

export type InvoiceProfileInput = Omit<InvoiceProfile, 'status' | 'submittedAt' | 'reviewedAt' | 'reviewOpinion'>;

export type AuditRecord = {
  id: string;
  targetType: '入驻申请' | '银行卡' | '发票资料' | '课程';
  targetId: string;
  status: AuditStatus;
  opinion: string;
  createdAt: string;
};

export type KnowledgeBinding = {
  knowledgeId: string;
  priority: number;
  enabled: boolean;
};

export type AgentTestRecord = {
  id: string;
  agentId: string;
  question: string;
  answer: string;
  result: 'passed' | 'needs_tuning';
  testedAt: string;
};

export type AgentSkill = {
  id: string;
  agentId: string | null;
  name: string;
  description: string;
  fileName: string;
  status: 'pending' | 'active';
  importedAt: string;
};

export type AgentVoiceSample = {
  id: string;
  agentId: string | null;
  title: string;
  text: string;
  duration: string;
  status: 'recorded' | 'tested';
  createdAt: string;
  testedAt?: string;
};

export type ExpertAgent = {
  id: string;
  name: string;
  avatarText: string;
  field: string;
  status: AgentLifecycleStatus;
  rolePositioning: string;
  welcomeMessage: string;
  promptTemplate: string;
  replyStyle: ReplyStyle;
  knowledgeBindings: KnowledgeBinding[];
  createdAt: string;
  updatedAt: string;
  operations: {
    conversations: number;
    resolvedRate: number;
    satisfaction: number;
    dailyActiveUsers: number;
  };
};

export type StoredFileMeta = {
  id: string;
  name: string;
  sizeLabel: string;
  type: string;
  uploadedAt: string;
};

export type NewsSourceRule = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
};

export type ContentCollectionRule = {
  id: string;
  name: string;
  agentId: string | null;
  keywords: string[];
  excludeKeywords: string[];
  sourceRules: NewsSourceRule[];
  formats: NewsFormat[];
  frequency: '每日' | '每周' | '手动';
  sourceScope: '权威科普' | '教育媒体' | '研学机构' | '综合网络';
  updateWindow: '近24小时' | '近7天' | '近30天';
  maxItems: number;
  enabled: boolean;
  lastCollectedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeLibrary = {
  id: string;
  name: string;
  agentId: string | null;
  description: string;
  enabled: boolean;
  bindingPriority: number;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeImportJob = {
  id: string;
  libraryId: string;
  agentId: string | null;
  file: StoredFileMeta;
  status: KnowledgeImportStatus;
  entryCount: number;
  previewText: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseChapter = {
  id?: string;
  title: string;
  duration: string;
  summary: string;
  contentType?: 'video' | 'audio' | 'pdf' | 'link';
  contentUrl?: string;
  fileName?: string;
  isTrial?: boolean;
  sortOrder?: number;
};

export type ExpertProduct = {
  id: string;
  title: string;
  productType: ProductType;
  status: ProductStatus;
  summary: string;
  targetAge: string;
  pricingType: 'free' | 'paid';
  price: number;
  capacity: number;
  location: string;
  schedule: string;
  bookingDeadline: string;
  deliveryPlan: string;
  chapters: CourseChapter[];
  liveQrCode?: string;
  coverFileName?: string;
  detailImageFileNames?: string[];
  materialFileName?: string;
  tags: string[];
  views: number;
  reservations: number;
  payAmount: number;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductSession = {
  id: string;
  productId: string;
  title: string;
  startsAt: string;
  location: string;
  capacity: number;
  reserved: number;
};

export type OrderRecord = {
  id: string;
  productId: string;
  sessionId?: string;
  studentName: string;
  customerName: string;
  customerPhone: string;
  phoneTail: string;
  reservationCode: string;
  verificationCode?: string;
  amount: number;
  refundAmount?: number;
  status: OrderStatus;
  channel: '自然预约' | '专家推荐' | '分销推广';
  createdAt: string;
  paidAt?: string;
  refundRequestedAt?: string;
  refundedAt?: string;
  writtenOffAt?: string;
};

export type RefundRequest = {
  id: string;
  orderId: string;
  productId: string;
  customerName: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  handledAt?: string;
  handlerNote?: string;
};

export type WriteOffRecord = {
  id: string;
  orderId?: string;
  reservationCode: string;
  productTitle: string;
  status: WriteOffStatus;
  message: string;
  createdAt: string;
};

export type DistributionPlan = {
  id: string;
  productId: string;
  enabled: boolean;
  commissionRate: number;
  promoterCount: number;
  orderCount: number;
  commissionAmount: number;
};

export type DistributionOrder = {
  id: string;
  productId: string;
  orderId: string;
  promoterName: string;
  amount: number;
  commission: number;
  status: 'pending' | 'settled';
  createdAt: string;
};

export type WithdrawalRequest = {
  id: string;
  amount: number;
  accountName: string;
  bankName: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
};

export type QaRecord = {
  id: string;
  agentId: string | null;
  productId?: string | null;
  title?: string;
  studentName?: string;
  question: string;
  answer?: string;
  keywords?: string[];
  sourceType: 'student_question' | 'manual_import' | 'expert_question' | 'batch_import';
  status: 'unmatched' | 'resolved';
  matchedKnowledgeId?: string;
  askedAt: string;
};

export type KnowledgeRevision = {
  id: string;
  answer: string;
  changedAt: string;
  note: string;
};

export type KnowledgeEntry = {
  id: string;
  agentId: string | null;
  libraryId: string | null;
  title: string;
  question: string;
  answer: string;
  keywords: string[];
  source: 'manual' | 'upload' | 'qa_followup';
  status: KnowledgeEntryStatus;
  bindingPriority: number;
  file?: StoredFileMeta;
  revisions: KnowledgeRevision[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};

export type NewsItem = {
  id: string;
  agentId: string | null;
  collectionRuleId?: string;
  title: string;
  status: NewsStatus;
  sourceType: 'collection' | 'manual';
  format: NewsFormat;
  source: string;
  sourceUrl?: string;
  summary: string;
  content: string;
  coverImage?: string;
  readingTime?: string;
  collectedAt?: string;
  scheduledAt?: string;
  publishedAt?: string;
  featured: boolean;
  pushCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ChallengeRubric = {
  dimensions: string[];
  totalScore: number;
  passScore: number;
  rewardGrowth: number;
};

export type Challenge = {
  id: string;
  agentId: string | null;
  productId: string | null;
  title: string;
  difficulty: '入门' | '进阶' | '高阶';
  objective: string;
  targetAge: string;
  workType: '个人挑战' | '团队挑战' | '个人/团队';
  templateSource?: string;
  description: string;
  workRequirement: string;
  references: string;
  attachments: StoredFileMeta[];
  tags: string[];
  rubric: ChallengeRubric;
  workflowStatus: ContentWorkflowStatus;
  status: ChallengeStatus;
  submissionCount: number;
  reviewedCount: number;
  rewardGrowth: number;
  createdAt: string;
  updatedAt: string;
};

export type SubmissionReviewResult = {
  expertScore: number;
  rewardGrowth: number;
  comment: string;
  reviewedAt: string;
};

export type ChallengeSubmission = {
  id: string;
  challengeId: string;
  teamName: string;
  teamMembers: string[];
  studentName: string;
  studentProfile?: {
    age?: string;
    school?: string;
    city?: string;
    grade?: string;
  };
  workTitle: string;
  workSummary?: string;
  workAttachments?: StoredFileMeta[];
  aiScore: number;
  aiComment?: string;
  expertScore?: number;
  rewardGrowth?: number;
  reviewResult?: SubmissionReviewResult;
  status: SubmissionReviewStatus;
  comment?: string;
  submittedAt: string;
  reviewedAt?: string;
  updatedAt: string;
};

export type EvaluationAttachment = {
  id: string;
  name: string;
  type: 'photo' | 'form';
  uploadedAt: string;
};

export type StudentEvaluationBatch = {
  id: string;
  productId: string;
  sessionId?: string;
  title: string;
  studentCount: number;
  attachments: EvaluationAttachment[];
  reportStatus: EvaluationReportStatus;
  workflowStatus: ContentWorkflowStatus;
  diarySynced: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChangeLogEntry = {
  id: string;
  module: string;
  message: string;
  createdAt: string;
};

export type ExpertState = {
  version: number;
  ownerUserId?: string | null;
  accountStatus: ExpertAccountStatus;
  application: ExpertApplication;
  bankAccount: BankAccount;
  invoiceProfile: InvoiceProfile;
  auditRecords: AuditRecord[];
  expert: {
    name: string;
    title: string;
    organization: string;
    field: string;
    accountNo: string;
  };
  settlement: {
    availableAmount: number;
    frozenAmount: number;
    withdrawnAmount: number;
    accountName: string;
    bankName: string;
    invoiceTitle: string;
  };
  settings: {
    notificationEnabled: boolean;
    compactList: boolean;
    dataWatermark: boolean;
  };
  agents: ExpertAgent[];
  activeAgentId: string | null;
  agentTestRecords: AgentTestRecord[];
  agentSkills: AgentSkill[];
  agentVoiceSamples: AgentVoiceSample[];
  products: ExpertProduct[];
  sessions: ProductSession[];
  orders: OrderRecord[];
  refundRequests: RefundRequest[];
  writeOffRecords: WriteOffRecord[];
  distributionPlans: DistributionPlan[];
  distributionOrders: DistributionOrder[];
  withdrawalRequests: WithdrawalRequest[];
  contentCollectionRules: ContentCollectionRule[];
  knowledgeLibraries: KnowledgeLibrary[];
  knowledgeImportJobs: KnowledgeImportJob[];
  qaRecords: QaRecord[];
  knowledgeEntries: KnowledgeEntry[];
  newsItems: NewsItem[];
  challenges: Challenge[];
  challengeSubmissions: ChallengeSubmission[];
  evaluationBatches: StudentEvaluationBatch[];
  logs: ChangeLogEntry[];
};

export type AgentInput = {
  name: string;
  avatarText: string;
  field: string;
  rolePositioning: string;
  welcomeMessage: string;
  promptTemplate: string;
  replyStyle: ReplyStyle;
  knowledgeIds: string[];
};

export type ProductInput = {
  title: string;
  productType: ProductType;
  summary: string;
  targetAge: string;
  pricingType: 'free' | 'paid';
  price: number;
  capacity: number;
  location: string;
  schedule: string;
  bookingDeadline: string;
  deliveryPlan: string;
  chapters: CourseChapter[];
  liveQrCode?: string;
  coverFileName?: string;
  detailImageFileNames?: string[];
  materialFileName?: string;
  tags: string[];
};

export type AgentSkillInput = {
  agentId: string | null;
  name: string;
  description: string;
  fileName: string;
};

export type AgentVoiceInput = {
  agentId: string | null;
  title: string;
  text: string;
  duration: string;
};

export type KnowledgeInput = {
  agentId: string | null;
  libraryId?: string | null;
  title: string;
  question: string;
  answer: string;
  keywords: string[];
  source?: KnowledgeEntry['source'];
  status?: KnowledgeEntryStatus;
  bindingPriority?: number;
  file?: StoredFileMeta;
};

export type NewsInput = {
  agentId?: string | null;
  collectionRuleId?: string;
  title: string;
  status: NewsStatus;
  sourceType?: NewsItem['sourceType'];
  format?: NewsFormat;
  source: string;
  sourceUrl?: string;
  summary: string;
  content: string;
  coverImage?: string;
  readingTime?: string;
  collectedAt?: string;
  scheduledAt?: string;
  featured: boolean;
};

export type ChallengeInput = {
  agentId: string | null;
  productId: string | null;
  title: string;
  difficulty: Challenge['difficulty'];
  objective?: string;
  targetAge?: string;
  workType?: Challenge['workType'];
  templateSource?: string;
  description: string;
  workRequirement?: string;
  references: string;
  attachments?: StoredFileMeta[];
  tags: string[];
  rubric?: ChallengeRubric;
};

export type EvaluationBatchInput = {
  productId: string;
  sessionId?: string;
  title: string;
  studentCount: number;
  photoCount: number;
  formName: string;
};

export type QaImportInput = {
  agentId: string | null;
  productId?: string | null;
  studentName?: string;
  question: string;
  keywords: string[];
};

export type AgentQuestionInput = {
  agentId: string | null;
  productId?: string | null;
  title: string;
  question: string;
  answer?: string;
  keywords: string[];
  status: QaRecord['status'];
};

export type KnowledgeLibraryInput = {
  name: string;
  agentId: string | null;
  description: string;
  bindingPriority: number;
};

export type KnowledgeUploadInput = {
  libraryId: string;
  agentId: string | null;
  fileName: string;
  previewText: string;
};

export type CollectionRuleInput = {
  name: string;
  agentId: string | null;
  keywords: string[];
  excludeKeywords?: string[];
  sourceNames: string[];
  formats: NewsFormat[];
  frequency: ContentCollectionRule['frequency'];
  sourceScope?: ContentCollectionRule['sourceScope'];
  updateWindow?: ContentCollectionRule['updateWindow'];
  maxItems?: number;
};

export type SubmissionImportInput = {
  challengeId: string;
  teamName?: string;
  teamMembers?: string[];
  studentName: string;
  studentProfile?: ChallengeSubmission['studentProfile'];
  workTitle: string;
  workSummary?: string;
  workAttachments?: StoredFileMeta[];
  aiScore: number;
  aiComment?: string;
  status?: SubmissionReviewStatus;
};

type WriteOffResult = {
  status: WriteOffStatus;
  message: string;
};

type ExpertStoreValue = {
  state: ExpertState;
  hydrated: boolean;
  resetData: () => void;
  restoreDemoData: () => void;
  startApplication: (accountType: AccountType) => void;
  submitApplication: (input: ExpertApplicationInput) => void;
  reviewApplication: (status: Extract<AuditStatus, 'approved' | 'rejected'>, opinion: string) => void;
  saveBankAccount: (input: BankAccountInput) => void;
  reviewBankAccount: (status: Extract<AuditStatus, 'approved' | 'rejected'>, opinion: string) => void;
  saveInvoiceProfile: (input: InvoiceProfileInput) => void;
  reviewInvoiceProfile: (status: Extract<AuditStatus, 'approved' | 'rejected'>, opinion: string) => void;
  setActiveAgent: (agentId: string | null) => void;
  createAgent: (input: AgentInput) => string;
  updateAgent: (agentId: string, patch: Partial<Omit<ExpertAgent, 'id' | 'createdAt'>>) => void;
  setAgentStatus: (agentId: string, status: AgentLifecycleStatus) => void;
  updateAgentBindings: (agentId: string, knowledgeIds: string[]) => void;
  addAgentTestRecord: (agentId: string, question: string) => AgentTestRecord;
  importAgentSkill: (input: AgentSkillInput) => string;
  activateAgentSkill: (skillId: string) => void;
  recordAgentVoiceSample: (input: AgentVoiceInput) => string;
  testAgentVoice: (sampleId: string) => void;
  saveProduct: (input: ProductInput, productId?: string) => string;
  setProductStatus: (productId: string, status: ProductStatus) => void;
  createOrder: (productId: string) => OrderRecord | null;
  createRefundRequest: (orderId: string, amount: number, reason: string) => string | null;
  approveRefund: (refundId: string, amount: number, note: string) => void;
  rejectRefund: (refundId: string, note: string) => void;
  writeOffOrder: (reservationCode: string) => WriteOffResult;
  updateDistributionPlan: (productId: string, patch: Partial<Pick<DistributionPlan, 'enabled' | 'commissionRate'>>) => void;
  createWithdrawal: (amount: number) => void;
  importQaRecord: (input: QaImportInput) => string;
  saveAgentQuestion: (input: AgentQuestionInput, recordId?: string) => string;
  supplementQa: (
    recordId: string,
    answer: string,
    targetAgentId: string | null,
    knowledgeId?: string,
    libraryId?: string,
    keywords?: string[],
  ) => void;
  saveKnowledgeLibrary: (input: KnowledgeLibraryInput, libraryId?: string) => string;
  setKnowledgeLibraryEnabled: (libraryId: string, enabled: boolean) => void;
  uploadKnowledgeFile: (input: KnowledgeUploadInput) => string;
  completeKnowledgeImport: (jobId: string) => void;
  saveKnowledgeEntry: (input: KnowledgeInput, entryId?: string) => string;
  setKnowledgeEntryStatus: (entryId: string, status: KnowledgeEntryStatus) => void;
  archiveKnowledgeEntry: (entryId: string) => void;
  restoreKnowledgeRevision: (entryId: string, revisionId: string) => void;
  saveCollectionRule: (input: CollectionRuleInput, ruleId?: string) => string;
  runCollectionRule: (ruleId: string) => string | null;
  saveNewsItem: (input: NewsInput, newsId?: string) => string;
  setNewsStatus: (newsId: string, status: NewsStatus) => void;
  deleteNewsItem: (newsId: string) => void;
  saveChallenge: (input: ChallengeInput, challengeId?: string) => string;
  setChallengeStatus: (challengeId: string, status: ChallengeStatus) => void;
  importChallengeSubmission: (input: SubmissionImportInput) => string;
  reviewSubmission: (submissionId: string, expertScore: number, rewardGrowth: number, comment: string) => void;
  batchConfirmAiReviews: (submissionIds: string[]) => void;
  generateChallengeDemoData: () => void;
  createEvaluationBatch: (input: EvaluationBatchInput) => void;
  advanceEvaluationBatch: (batchId: string) => void;
  updateSettings: (patch: Partial<ExpertState['settings']>) => void;
};

const ExpertStoreContext = createContext<ExpertStoreValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

function normalizeProductType(type?: ProductType): ProductType {
  if (type === 'pbl') {
    return 'live_course';
  }
  if (type === 'face_to_face' || type === 'offline_course') {
    return 'activity';
  }
  return type ?? 'online_course';
}

function isOnlineProduct(productType: ProductType) {
  return normalizeProductType(productType) === 'online_course';
}

function normalizeCourseChapter(chapter: CourseChapter, productTitle: string, index: number, productType: ProductType): CourseChapter {
  const normalizedType = normalizeProductType(productType);
  const defaultContentType: CourseChapter['contentType'] = normalizedType === 'online_course' ? 'video' : normalizedType === 'live_course' ? 'link' : 'pdf';
  const contentType = chapter.contentType ?? defaultContentType;
  const fallbackFile = contentType === 'link' ? `${productTitle}-第${index + 1}节链接` : `${productTitle}-第${index + 1}节.${contentType === 'audio' ? 'mp3' : contentType === 'pdf' ? 'pdf' : 'mp4'}`;

  return {
    ...chapter,
    id: chapter.id ?? uid('chapter'),
    title: chapter.title || `第 ${index + 1} 节`,
    duration: chapter.duration || '30分钟',
    summary: chapter.summary || '待补充章节简介',
    contentType,
    contentUrl: chapter.contentUrl || fallbackFile,
    fileName: chapter.fileName ?? (contentType === 'link' ? undefined : chapter.contentUrl || fallbackFile),
    isTrial: Boolean(chapter.isTrial),
    sortOrder: chapter.sortOrder ?? index + 1,
  };
}

function generateVerificationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function buildCustomerPhone(tail?: string) {
  return `138${Math.floor(1000 + Math.random() * 9000)}${tail || String(Math.floor(1000 + Math.random() * 9000))}`;
}

function emptyApplication(): ExpertApplication {
  return {
    accountType: 'expert',
    status: 'not_started',
    expertName: '',
    title: '',
    organization: '',
    field: '',
    credentialName: '',
    credentialFileName: '',
    authorizationFileName: '',
    contactName: '',
    contactPhone: '',
  };
}

function emptyBankAccount(): BankAccount {
  return {
    accountName: '',
    cardNo: '',
    bankName: '',
    reservedPhone: '',
    isDefault: true,
    status: 'not_set',
  };
}

function emptyInvoiceProfile(): InvoiceProfile {
  return {
    invoiceType: '企业',
    title: '',
    taxNo: '',
    registeredAddress: '',
    registeredPhone: '',
    bankName: '',
    bankAccount: '',
    email: '',
    status: 'not_set',
  };
}

function addLog(state: ExpertState, module: string, message: string): ExpertState {
  return {
    ...state,
    logs: [
      {
        id: uid('log'),
        module,
        message,
        createdAt: nowIso(),
      },
      ...state.logs,
    ].slice(0, 30),
  };
}

function addAudit(
  state: ExpertState,
  targetType: AuditRecord['targetType'],
  targetId: string,
  status: AuditStatus,
  opinion: string,
): ExpertState {
  return {
    ...state,
    auditRecords: [
      {
        id: uid('audit'),
        targetType,
        targetId,
        status,
        opinion,
        createdAt: nowIso(),
      },
      ...state.auditRecords,
    ].slice(0, 40),
  };
}

function cloneState(state: ExpertState): ExpertState {
  return JSON.parse(JSON.stringify(state)) as ExpertState;
}

function getAccountStoreKey() {
  const session = getStoredSession();
  return session?.user.id ? `${STORE_KEY_PREFIX}:${session.user.id}` : STORE_KEY_PREFIX;
}

function getLegacyStoreKeyForCurrentAccount() {
  const session = getStoredSession();
  return session?.user.id === 'expert_user_001' ? LEGACY_STORE_KEY : null;
}

function getCurrentOwnerId() {
  return getStoredSession()?.user.id ?? null;
}

function withCurrentOwner(state: ExpertState): ExpertState {
  return {
    ...state,
    ownerUserId: getCurrentOwnerId(),
  };
}

function stateLooksLikeSeededDemo(state: ExpertState) {
  return (
    state.activeAgentId === 'demo_agent_ocean' ||
    state.agents.some((agent) => agent.id.startsWith('demo_') || agent.name === '海洋探索导师') ||
    state.products.some((product) => product.id.startsWith('demo_')) ||
    (state.expert.name === '张知远' && state.expert.accountNo === 'YXZJ-2026-0001')
  );
}

function sanitizeLoadedStateForCurrentAccount(state: ExpertState): ExpertState {
  const ownerUserId = getCurrentOwnerId();
  if (!ownerUserId || ownerUserId === 'expert_user_001') {
    return withCurrentOwner(state);
  }

  if (state.ownerUserId && state.ownerUserId !== ownerUserId) {
    return withCurrentOwner(initialState());
  }

  if (!state.ownerUserId && stateLooksLikeSeededDemo(state)) {
    return withCurrentOwner(initialState());
  }

  return withCurrentOwner(state);
}

function loadStateForCurrentAccount() {
  const nextStorageKey = getAccountStoreKey();

  if (typeof window === 'undefined') {
    return { storageKey: nextStorageKey, state: initialState() };
  }

  try {
    const legacyStorageKey = getLegacyStoreKeyForCurrentAccount();
    const raw = window.localStorage.getItem(nextStorageKey);
    const legacyRaw = legacyStorageKey ? window.localStorage.getItem(legacyStorageKey) : null;
    const state = raw ? normalizeState(JSON.parse(raw)) : legacyRaw ? normalizeState(JSON.parse(legacyRaw)) : initialState();
    const sanitizedState = sanitizeLoadedStateForCurrentAccount(state);
    return { storageKey: nextStorageKey, state: sanitizedState };
  } catch {
    return { storageKey: nextStorageKey, state: withCurrentOwner(initialState()) };
  }
}

function initialState(): ExpertState {
  return {
    version: STORE_VERSION,
    ownerUserId: getCurrentOwnerId(),
    accountStatus: 'not_started',
    application: emptyApplication(),
    bankAccount: emptyBankAccount(),
    invoiceProfile: emptyInvoiceProfile(),
    auditRecords: [],
    expert: {
      name: '',
      title: '',
      organization: '',
      field: '',
      accountNo: '',
    },
    settlement: {
      availableAmount: 0,
      frozenAmount: 0,
      withdrawnAmount: 0,
      accountName: '',
      bankName: '',
      invoiceTitle: '',
    },
    settings: {
      notificationEnabled: true,
      compactList: false,
      dataWatermark: true,
    },
    agents: [],
    activeAgentId: null,
    agentTestRecords: [],
    agentSkills: [],
    agentVoiceSamples: [],
    products: [],
    sessions: [],
    orders: [],
    refundRequests: [],
    writeOffRecords: [],
    distributionPlans: [],
    distributionOrders: [],
    withdrawalRequests: [],
    contentCollectionRules: [],
    knowledgeLibraries: [],
    knowledgeImportJobs: [],
    qaRecords: [],
    knowledgeEntries: [],
    newsItems: [],
    challenges: [],
    challengeSubmissions: [],
    evaluationBatches: [],
    logs: [],
  };
}

function buildDemoState(current?: ExpertState): ExpertState {
  const base = current ?? initialState();
  const timestamp = nowIso();
  const accountType = base.application.accountType ?? 'expert';
  const agentId = 'demo_agent_ocean';
  const libraryId = 'demo_library_ocean';
  const onlineProductId = 'demo_product_online';
  const liveProductId = 'demo_product_live';
  const activityProductId = 'demo_product_activity';
  const challengeOneId = 'demo_challenge_ocean';
  const challengeTwoId = 'demo_challenge_city';
  const liveOrderCode = 'A7K9M2P4Q8R6';
  const activityOrderCode = 'B8N3C6D9E2F5';
  const application: ExpertApplication = {
    ...base.application,
    accountType,
    status: 'approved',
    expertName: base.application.expertName || '张知远',
    title: base.application.title || '海洋科学研学导师',
    organization: base.application.organization || '上海知远科普咨询中心',
    field: base.application.field || '海洋生态、城市自然观察与研学课程',
    credentialName: base.application.credentialName || '海洋科学研学导师资质',
    credentialFileName: base.application.credentialFileName || '专业资质证明.pdf',
    authorizationFileName: base.application.authorizationFileName || '课程合作授权书.pdf',
    contactName: base.application.contactName || '张知远',
    contactPhone: base.application.contactPhone || '13800000000',
    submittedAt: base.application.submittedAt ?? '2026-05-09T09:30:00.000Z',
    reviewedAt: timestamp,
    reviewOpinion: base.application.reviewOpinion || '资料完整，已开通专家端演示工作台',
  };
  const expert = {
    name: application.expertName,
    title: application.title,
    organization: application.organization,
    field: application.field,
    accountNo: base.expert.accountNo || 'YXZJ-2026-0001',
  };
  const bankAccount: BankAccount =
    base.bankAccount.status === 'not_set'
      ? {
          accountName: application.expertName,
          cardNo: '6222 0200 1234 5678',
          bankName: '招商银行上海分行',
          reservedPhone: application.contactPhone,
          isDefault: true,
          status: 'active',
          submittedAt: '2026-05-09T10:00:00.000Z',
          reviewedAt: '2026-05-09T10:20:00.000Z',
          reviewOpinion: '银行卡信息校验通过',
        }
      : base.bankAccount;
  const invoiceProfile: InvoiceProfile =
    base.invoiceProfile.status === 'not_set'
      ? {
          invoiceType: '企业',
          title: application.organization,
          taxNo: '91310000MA1DEMO26',
          registeredAddress: '上海市浦东新区研学路 88 号',
          registeredPhone: '021-88888888',
          bankName: '招商银行上海分行',
          bankAccount: '6222020012345678',
          email: 'finance@yanxuebao.local',
          status: 'approved',
          submittedAt: '2026-05-09T10:30:00.000Z',
          reviewedAt: '2026-05-09T11:00:00.000Z',
          reviewOpinion: '发票资料审核通过',
        }
      : base.invoiceProfile;
  const knowledgeEntries: KnowledgeEntry[] = [
    {
      id: 'demo_knowledge_tide',
      agentId,
      libraryId,
      title: '潮汐观察标准问答',
      question: '为什么海边会有涨潮和退潮？',
      answer: '可以从月球引力、地形和时间规律三个角度解释，并引导学员记录同一地点不同时段的水位变化。',
      keywords: ['潮汐', '海洋观察', '月球引力'],
      source: 'manual',
      status: 'enabled',
      bindingPriority: 1,
      revisions: [],
      createdAt: '2026-05-09T12:00:00.000Z',
      updatedAt: timestamp,
    },
    {
      id: 'demo_knowledge_shell',
      agentId,
      libraryId,
      title: '贝壳采集安全规范',
      question: '研学时可以随意捡贝壳吗？',
      answer: '先确认地点规则，再区分活体与空壳；不带走活体，不破坏栖息地，采集后用照片和记录替代大量带走。',
      keywords: ['贝壳', '安全规范', '生态保护'],
      source: 'manual',
      status: 'enabled',
      bindingPriority: 2,
      revisions: [],
      createdAt: '2026-05-09T12:10:00.000Z',
      updatedAt: timestamp,
    },
    {
      id: 'demo_knowledge_report',
      agentId,
      libraryId,
      title: '观察报告写作模板',
      question: '学员观察报告应该怎么写？',
      answer: '建议按观察对象、证据记录、初步解释、待验证问题和下一步行动五段组织，保留照片或测量数据作为证据。',
      keywords: ['观察报告', '表达', '证据'],
      source: 'qa_followup',
      status: 'enabled',
      bindingPriority: 3,
      revisions: [],
      createdAt: '2026-05-09T12:20:00.000Z',
      updatedAt: timestamp,
    },
  ];
  const products: ExpertProduct[] = [
    {
      id: onlineProductId,
      title: '海岸生态线上观察课',
      productType: 'online_course',
      status: 'published',
      summary: '通过视频、资料和任务单完成一次完整的海岸生态观察训练。',
      targetAge: '8-14岁',
      pricingType: 'paid',
      price: 199,
      capacity: 500,
      location: '线上学习',
      schedule: '长期有效',
      bookingDeadline: '开课前均可报名',
      deliveryPlan: '录播课程、章节任务、问答辅导、作品反馈',
      chapters: [
        { id: 'demo_chapter_online_1', title: '认识潮间带', duration: '30分钟', summary: '认识潮间带的生物和环境特征', contentType: 'video', contentUrl: 'https://yanxuebao.local/course/tide.mp4', fileName: '潮间带观察导入.mp4', isTrial: true, sortOrder: 1 },
        { id: 'demo_chapter_online_2', title: '观察记录方法', duration: '42分钟', summary: '学习证据记录与问题表达', contentType: 'pdf', contentUrl: '海岸观察记录手册.pdf', fileName: '海岸观察记录手册.pdf', isTrial: false, sortOrder: 2 },
        { id: 'demo_chapter_online_3', title: '完成一次证据汇报', duration: '36分钟', summary: '把观察证据整理成课程成果反馈', contentType: 'video', contentUrl: 'https://yanxuebao.local/course/report.mp4', fileName: '成果汇报示范.mp4', isTrial: false, sortOrder: 3 },
      ],
      coverFileName: '海岸生态线上课封面.png',
      detailImageFileNames: ['海岸生态课程详情长图-目标.png', '海岸生态课程详情长图-目录.png', '海岸生态课程详情长图-成果.png'],
      materialFileName: '海岸生态观察手册.pdf',
      tags: ['线上课程', '海洋生态'],
      views: 326,
      reservations: 3,
      payAmount: 597,
      refundAmount: 0,
      createdAt: '2026-05-09T14:00:00.000Z',
      updatedAt: timestamp,
    },
    {
      id: liveProductId,
      title: '海洋科学家直播答疑',
      productType: 'live_course',
      status: 'published',
      summary: '围绕孩子提交的海洋问题进行直播讲解和互动答疑。',
      targetAge: '9-15岁',
      pricingType: 'paid',
      price: 99,
      capacity: 120,
      location: '线上直播',
      schedule: '2026-06-08 19:30',
      bookingDeadline: '2026-06-07 22:00',
      deliveryPlan: '直播二维码入场、互动问答、回放资料',
      chapters: [
        { id: 'demo_chapter_live_1', title: '直播入场与提问说明', duration: '10分钟', summary: '确认直播入口、提问格式和互动规则', contentType: 'link', contentUrl: 'https://yanxuebao.local/live/ocean', isTrial: false, sortOrder: 1 },
        { id: 'demo_chapter_live_2', title: '海洋问题答疑大纲', duration: '80分钟', summary: '围绕学员高频问题讲解海洋生态现象', contentType: 'pdf', contentUrl: '海洋问题答疑大纲.pdf', fileName: '海洋问题答疑大纲.pdf', isTrial: false, sortOrder: 2 },
      ],
      liveQrCode: 'https://yanxuebao.local/live/ocean-qrcode',
      coverFileName: '直播答疑封面.png',
      detailImageFileNames: ['直播答疑详情图-嘉宾.png', '直播答疑详情图-流程.png'],
      materialFileName: '直播提问清单.pdf',
      tags: ['直播', '专家答疑'],
      views: 218,
      reservations: 2,
      payAmount: 198,
      refundAmount: 99,
      createdAt: '2026-05-09T14:20:00.000Z',
      updatedAt: timestamp,
    },
    {
      id: activityProductId,
      title: '城市湿地亲子观察活动',
      productType: 'activity',
      status: 'published',
      summary: '线下湿地观察、任务打卡和小组作品分享。',
      targetAge: '7-12岁',
      pricingType: 'free',
      price: 0,
      capacity: 30,
      location: '上海滨江湿地公园',
      schedule: '2026-06-15 09:00',
      bookingDeadline: '2026-06-12 18:00',
      deliveryPlan: '预约报名、现场签到核销、专家导入、观察任务、成果分享',
      chapters: [
        { id: 'demo_chapter_activity_1', title: '活动流程说明', duration: '10分钟', summary: '集合、签到、分组和安全须知', contentType: 'pdf', contentUrl: '湿地观察活动说明.pdf', fileName: '湿地观察活动说明.pdf', isTrial: false, sortOrder: 1 },
        { id: 'demo_chapter_activity_2', title: '现场观察任务', duration: '90分钟', summary: '湿地观察、记录和小组讨论任务', contentType: 'pdf', contentUrl: '湿地观察任务单.pdf', fileName: '湿地观察任务单.pdf', isTrial: false, sortOrder: 2 },
      ],
      coverFileName: '湿地观察活动封面.png',
      detailImageFileNames: ['湿地观察活动详情图-路线.png', '湿地观察活动详情图-任务.png'],
      materialFileName: '湿地观察任务单.pdf',
      tags: ['活动', '湿地观察'],
      views: 156,
      reservations: 1,
      payAmount: 0,
      refundAmount: 0,
      createdAt: '2026-05-09T14:40:00.000Z',
      updatedAt: timestamp,
    },
  ];
  const orders: OrderRecord[] = [
    {
      id: 'demo_order_online_1',
      productId: onlineProductId,
      sessionId: 'demo_session_online',
      studentName: '林知禾',
      customerName: '林知禾家长',
      customerPhone: '13812345678',
      phoneTail: '5678',
      reservationCode: 'YX260501',
      amount: 199,
      refundAmount: 0,
      status: 'paid',
      channel: '专家推荐',
      createdAt: '2026-05-10T09:00:00.000Z',
      paidAt: '2026-05-10T09:02:00.000Z',
    },
    {
      id: 'demo_order_live_refund',
      productId: liveProductId,
      sessionId: 'demo_session_live',
      studentName: '沈思远',
      customerName: '沈思远家长',
      customerPhone: '13887654321',
      phoneTail: '4321',
      reservationCode: liveOrderCode,
      verificationCode: liveOrderCode,
      amount: 99,
      refundAmount: 0,
      status: 'refund_requested',
      channel: '自然预约',
      createdAt: '2026-05-10T13:30:00.000Z',
      paidAt: '2026-05-10T13:32:00.000Z',
      refundRequestedAt: '2026-05-11T10:00:00.000Z',
    },
    {
      id: 'demo_order_activity_1',
      productId: activityProductId,
      sessionId: 'demo_session_activity',
      studentName: '叶一晨',
      customerName: '叶一晨家长',
      customerPhone: '13866778899',
      phoneTail: '8899',
      reservationCode: activityOrderCode,
      verificationCode: activityOrderCode,
      amount: 0,
      refundAmount: 0,
      status: 'reserved',
      channel: '自然预约',
      createdAt: '2026-05-11T15:20:00.000Z',
    },
    {
      id: 'demo_order_live_written',
      productId: liveProductId,
      sessionId: 'demo_session_live',
      studentName: '陆安然',
      customerName: '陆安然家长',
      customerPhone: '13877889900',
      phoneTail: '9900',
      reservationCode: 'C4D7E9F2G5H8',
      verificationCode: 'C4D7E9F2G5H8',
      amount: 99,
      refundAmount: 99,
      status: 'refunded',
      channel: '分销推广',
      createdAt: '2026-05-09T16:00:00.000Z',
      paidAt: '2026-05-09T16:03:00.000Z',
      refundedAt: '2026-05-10T10:00:00.000Z',
    },
  ];
  const submissions: ChallengeSubmission[] = [
    {
      id: 'demo_submission_1',
      challengeId: challengeOneId,
      teamName: '潮汐观察一队',
      teamMembers: ['林知禾', '沈思远', '叶一晨'],
      studentName: '林知禾',
      studentProfile: { age: '10岁', school: '上海实验小学', city: '上海', grade: '四年级' },
      workTitle: '退潮后的小水坑观察记录',
      workSummary: '记录了退潮后小水坑的水位、温度和小型生物变化，并提出继续观察的问题。',
      workAttachments: [{ id: 'demo_submission_file_1', name: '小水坑观察照片组.zip', sizeLabel: '4.8 MB', type: 'application/zip', uploadedAt: '2026-05-11T09:20:00.000Z' }],
      aiScore: 86,
      aiComment: 'AI 初评认为证据较完整，问题意识明确，表达结构还可以继续优化。',
      status: 'ai_scored',
      submittedAt: '2026-05-11T09:20:00.000Z',
      updatedAt: '2026-05-11T09:22:00.000Z',
    },
    {
      id: 'demo_submission_2',
      challengeId: challengeOneId,
      teamName: '潮汐观察一队',
      teamMembers: ['林知禾', '沈思远', '叶一晨'],
      studentName: '沈思远',
      studentProfile: { age: '11岁', school: '上海实验小学', city: '上海', grade: '五年级' },
      workTitle: '贝壳分布与潮位关系',
      workSummary: '用表格整理不同潮位下贝壳分布位置，尝试解释潮位变化带来的影响。',
      workAttachments: [{ id: 'demo_submission_file_2', name: '贝壳分布记录表.pdf', sizeLabel: '1.1 MB', type: 'application/pdf', uploadedAt: '2026-05-10T15:20:00.000Z' }],
      aiScore: 82,
      aiComment: 'AI 初评认为观察维度完整，但原因解释还可以补充对照证据。',
      expertScore: 88,
      rewardGrowth: 40,
      reviewResult: {
        expertScore: 88,
        rewardGrowth: 40,
        comment: '证据记录完整，能把观察现象和潮位变化联系起来。',
        reviewedAt: '2026-05-11T11:00:00.000Z',
      },
      status: 'reviewed',
      comment: '证据记录完整，能把观察现象和潮位变化联系起来。',
      submittedAt: '2026-05-10T15:20:00.000Z',
      reviewedAt: '2026-05-11T11:00:00.000Z',
      updatedAt: '2026-05-11T11:00:00.000Z',
    },
    {
      id: 'demo_submission_3',
      challengeId: challengeTwoId,
      teamName: '湿地侦探队',
      teamMembers: ['叶一晨', '陆安然'],
      studentName: '叶一晨',
      studentProfile: { age: '9岁', school: '浦东新区第一小学', city: '上海', grade: '三年级' },
      workTitle: '湿地鸟类观察海报',
      workSummary: '用海报形式展示湿地鸟类观察结果，包含观察点位、鸟类特征和保护建议。',
      workAttachments: [{ id: 'demo_submission_file_3', name: '湿地鸟类观察海报.png', sizeLabel: '2.4 MB', type: 'image/png', uploadedAt: '2026-05-11T16:40:00.000Z' }],
      aiScore: 90,
      aiComment: 'AI 初评认为作品表达清晰，图文结构完整，行动建议可继续具体化。',
      status: 'ai_scored',
      submittedAt: '2026-05-11T16:40:00.000Z',
      updatedAt: '2026-05-11T16:42:00.000Z',
    },
    {
      id: 'demo_submission_4',
      challengeId: challengeTwoId,
      teamName: '湿地侦探队',
      teamMembers: ['叶一晨', '陆安然'],
      studentName: '陆安然',
      studentProfile: { age: '10岁', school: '浦东新区第一小学', city: '上海', grade: '四年级' },
      workTitle: '湿地保护行动建议',
      workSummary: '提出减少垃圾、设置观察路线和提醒牌的湿地保护建议。',
      workAttachments: [{ id: 'demo_submission_file_4', name: '湿地保护建议书.pdf', sizeLabel: '1.6 MB', type: 'application/pdf', uploadedAt: '2026-05-10T17:40:00.000Z' }],
      aiScore: 78,
      aiComment: 'AI 初评认为建议方向明确，但对执行步骤和证据说明不足。',
      expertScore: 80,
      rewardGrowth: 35,
      reviewResult: {
        expertScore: 80,
        rewardGrowth: 35,
        comment: '建议清晰，下一步可以补充更多实地证据。',
        reviewedAt: '2026-05-11T17:30:00.000Z',
      },
      status: 'reviewed',
      comment: '建议清晰，下一步可以补充更多实地证据。',
      submittedAt: '2026-05-10T17:40:00.000Z',
      reviewedAt: '2026-05-11T17:30:00.000Z',
      updatedAt: '2026-05-11T17:30:00.000Z',
    },
  ];

  return {
    ...base,
    version: STORE_VERSION,
    accountStatus: 'approved',
    application,
    expert,
    bankAccount,
    invoiceProfile,
    settlement: {
      availableAmount: 796,
      frozenAmount: 0,
      withdrawnAmount: base.settlement.withdrawnAmount,
      accountName: bankAccount.accountName,
      bankName: bankAccount.bankName,
      invoiceTitle: invoiceProfile.title,
    },
    agents: [
      {
        id: agentId,
        name: '海洋探索导师',
        avatarText: '海',
        field: '海洋生态',
        status: 'published',
        rolePositioning: '面向 8-14 岁学员，用儿童可理解的语言解释海洋科学与现场观察问题。',
        welcomeMessage: '你好，我会结合课程、知识库和现场观察，陪你继续深挖问题。',
        promptTemplate: '请先讲清事实，再引导学员继续观察和表达；回答不超过 180 字。',
        replyStyle: '启发提问',
        knowledgeBindings: knowledgeEntries.map((entry, index) => ({ knowledgeId: entry.id, priority: index + 1, enabled: true })),
        createdAt: '2026-05-09T11:30:00.000Z',
        updatedAt: timestamp,
        operations: {
          conversations: 248,
          resolvedRate: 91,
          satisfaction: 96,
          dailyActiveUsers: 38,
        },
      },
    ],
    activeAgentId: agentId,
    agentTestRecords: [
      {
        id: 'demo_agent_test_1',
        agentId,
        question: '为什么退潮后岩石上会留下小水坑？',
        answer: '这些小水坑是潮水退去后被岩石凹陷留下的微型栖息地，可以观察温度、盐度和小生物变化。',
        result: 'passed',
        testedAt: '2026-05-10T10:00:00.000Z',
      },
    ],
    agentSkills: [
      { id: 'demo_skill_rubric', agentId, name: '作品评分辅助', description: '按挑战维度生成初步评分建议。', fileName: 'challenge-rubric.skill', status: 'active', importedAt: '2026-05-10T12:00:00.000Z' },
      { id: 'demo_skill_report', agentId, name: '观察报告结构化', description: '把学员描述整理成观察记录框架。', fileName: 'field-report.skill', status: 'pending', importedAt: '2026-05-11T12:00:00.000Z' },
    ],
    agentVoiceSamples: [
      { id: 'demo_voice_1', agentId, title: '温和引导语', text: '我们先记录看到的事实，再一起猜想背后的原因。', duration: '00:28', status: 'tested', createdAt: '2026-05-10T13:00:00.000Z', testedAt: '2026-05-10T13:10:00.000Z' },
      { id: 'demo_voice_2', agentId, title: '任务提醒语', text: '请小组成员分工记录照片、位置和时间。', duration: '00:20', status: 'recorded', createdAt: '2026-05-11T13:00:00.000Z' },
    ],
    knowledgeLibraries: [
      {
        id: libraryId,
        name: '海洋研学知识库',
        agentId,
        description: '沉淀海洋生态、现场安全和观察报告相关标准问答。',
        enabled: true,
        bindingPriority: 1,
        createdAt: '2026-05-09T11:40:00.000Z',
        updatedAt: timestamp,
      },
    ],
    knowledgeImportJobs: [
      {
        id: 'demo_knowledge_job_1',
        libraryId,
        agentId,
        file: { id: 'demo_file_knowledge', name: '海岸观察手册.pdf', sizeLabel: '2.4 MB', type: 'application/pdf', uploadedAt: '2026-05-10T08:00:00.000Z' },
        status: 'completed',
        entryCount: 1,
        previewText: '包含潮间带观察步骤、安全注意事项和成果表达模板。',
        createdAt: '2026-05-10T08:00:00.000Z',
        updatedAt: '2026-05-10T08:20:00.000Z',
      },
    ],
    knowledgeEntries,
    qaRecords: [
      {
        id: 'demo_qa_1',
        agentId,
        productId: onlineProductId,
        studentName: '林知禾',
        question: '海星为什么能贴在石头上？',
        answer: '海星的管足可以帮助它吸附和移动，观察时不要把活体从岩石上强行拿下。',
        keywords: ['海星', '管足', '潮间带'],
        sourceType: 'student_question',
        status: 'resolved',
        matchedKnowledgeId: 'demo_knowledge_tide',
        askedAt: '2026-05-10T18:00:00.000Z',
      },
      {
        id: 'demo_qa_2',
        agentId,
        productId: liveProductId,
        studentName: '沈思远',
        question: '为什么同一片海滩的贝壳颜色不一样？',
        keywords: ['贝壳', '颜色', '观察'],
        sourceType: 'manual_import',
        status: 'unmatched',
        askedAt: '2026-05-11T18:00:00.000Z',
      },
    ],
    contentCollectionRules: [
      {
        id: 'demo_collection_ocean',
        name: '海洋生态资讯采集',
        agentId,
        keywords: ['潮间带', '海洋生态', '研学安全'],
        excludeKeywords: ['商业广告', '无关旅游'],
        sourceRules: [
          { id: 'demo_collection_ocean_source_1', name: '科普机构公众号', url: 'https://mock.yanxuebao.local/source/science', enabled: true },
          { id: 'demo_collection_ocean_source_2', name: '海洋博物馆资讯', url: 'https://mock.yanxuebao.local/source/museum', enabled: true },
        ],
        formats: ['图文'],
        frequency: '每日',
        sourceScope: '权威科普',
        updateWindow: '近7天',
        maxItems: 3,
        enabled: true,
        lastCollectedAt: '2026-05-11T19:00:00.000Z',
        createdAt: '2026-05-10T18:30:00.000Z',
        updatedAt: timestamp,
      },
    ],
    newsItems: [
      {
        id: 'demo_news_1',
        agentId,
        title: '本周海岸观察提示',
        status: 'collected',
        sourceType: 'collection',
        collectionRuleId: 'demo_collection_ocean',
        format: '图文',
        source: '科普机构公众号',
        sourceUrl: 'https://mock.yanxuebao.local/news/tide-pool',
        summary: '退潮后一小时适合观察潮间带小水坑，请注意防滑和生态保护。',
        content: '导读：潮间带小水坑是退潮后留在岩石凹陷中的微型生态空间。\n\n观察重点：记录水温、盐度、光照和小型生物的变化，不要移动活体生物。\n\n研学建议：让学员先画出观察点位，再写下一个可以验证的问题。',
        coverImage: '潮间带观察封面',
        readingTime: '4 分钟',
        collectedAt: '2026-05-10T19:00:00.000Z',
        featured: true,
        pushCount: 0,
        createdAt: '2026-05-10T19:00:00.000Z',
        updatedAt: timestamp,
      },
      {
        id: 'demo_news_2',
        agentId,
        title: '湿地观察任务预告',
        status: 'collected',
        sourceType: 'collection',
        collectionRuleId: 'demo_collection_ocean',
        format: '图文',
        source: '海洋博物馆资讯',
        sourceUrl: 'https://mock.yanxuebao.local/news/wetland-task',
        summary: '下次活动将关注城市湿地的鸟类、植物和水质线索。',
        content: '导读：城市湿地观察适合从鸟类活动、水生植物和水质线索切入。\n\n图文要点：采集内容包含观察记录模板、常见鸟类线索和安全边界提醒。\n\n研学建议：专家可将这条资讯转化为活动前导读。',
        coverImage: '湿地图文封面',
        readingTime: '5 分钟',
        collectedAt: '2026-05-11T19:00:00.000Z',
        featured: false,
        pushCount: 0,
        createdAt: '2026-05-11T19:00:00.000Z',
        updatedAt: timestamp,
      },
    ],
    products,
    sessions: [
      { id: 'demo_session_online', productId: onlineProductId, title: '线上长期班', startsAt: '2026-05-12T09:00:00.000Z', location: '线上学习', capacity: 500, reserved: 3 },
      { id: 'demo_session_live', productId: liveProductId, title: '6月直播场', startsAt: '2026-06-08T11:30:00.000Z', location: '线上直播', capacity: 120, reserved: 2 },
      { id: 'demo_session_activity', productId: activityProductId, title: '6月湿地活动', startsAt: '2026-06-15T01:00:00.000Z', location: '上海滨江湿地公园', capacity: 30, reserved: 1 },
    ],
    orders,
    refundRequests: [
      {
        id: 'demo_refund_1',
        orderId: 'demo_order_live_refund',
        productId: liveProductId,
        customerName: '沈思远家长',
        amount: 99,
        reason: '直播时间冲突，申请全额退款',
        status: 'pending',
        requestedAt: '2026-05-11T10:00:00.000Z',
      },
    ],
    writeOffRecords: [
      {
        id: 'demo_writeoff_1',
        orderId: 'demo_order_activity_1',
        reservationCode: activityOrderCode,
        productTitle: '城市湿地亲子观察活动',
        status: 'exception',
        message: '演示记录：待现场核销',
        createdAt: '2026-05-11T15:30:00.000Z',
      },
    ],
    distributionPlans: [
      { id: 'demo_dist_online', productId: onlineProductId, enabled: true, commissionRate: 8, promoterCount: 2, orderCount: 1, commissionAmount: 16 },
      { id: 'demo_dist_live', productId: liveProductId, enabled: false, commissionRate: 8, promoterCount: 0, orderCount: 0, commissionAmount: 0 },
      { id: 'demo_dist_activity', productId: activityProductId, enabled: false, commissionRate: 0, promoterCount: 0, orderCount: 0, commissionAmount: 0 },
    ],
    distributionOrders: [
      { id: 'demo_dist_order_1', productId: onlineProductId, orderId: 'demo_order_online_1', promoterName: '研学推广伙伴', amount: 199, commission: 16, status: 'pending', createdAt: '2026-05-10T09:05:00.000Z' },
    ],
    challenges: [
      {
        id: challengeOneId,
        agentId,
        productId: onlineProductId,
        title: '潮间带小水坑观察挑战',
        difficulty: '入门',
        objective: '掌握真实观察、证据记录和可验证问题提出方法。',
        targetAge: '8-14岁',
        workType: '团队挑战',
        templateSource: '专家自定义',
        description: '记录退潮后小水坑里的生物、温度和位置变化，提出一个可验证问题。',
        workRequirement: '提交照片、观察表和 150 字解释。',
        references: '潮间带观察任务单.pdf',
        attachments: [{ id: 'demo_challenge_file_1', name: '潮间带观察任务单.pdf', sizeLabel: '1.2 MB', type: 'application/pdf', uploadedAt: '2026-05-10T14:00:00.000Z' }],
        tags: ['海洋生态', '观察记录'],
        rubric: { dimensions: ['证据记录', '问题意识', '表达完整度'], totalScore: 100, passScore: 60, rewardGrowth: 40 },
        workflowStatus: 'active',
        status: 'published',
        submissionCount: 2,
        reviewedCount: 1,
        rewardGrowth: 40,
        createdAt: '2026-05-10T14:00:00.000Z',
        updatedAt: timestamp,
      },
      {
        id: challengeTwoId,
        agentId,
        productId: activityProductId,
        title: '城市湿地保护提案',
        difficulty: '进阶',
        objective: '围绕城市湿地问题完成观察、证据整理和可执行行动设计。',
        targetAge: '9-15岁',
        workType: '团队挑战',
        templateSource: '专家自定义',
        description: '围绕湿地现场观察，提出一个可以被家庭或学校执行的保护行动。',
        workRequirement: '提交海报、行动建议和证据说明。',
        references: '湿地鸟类图鉴、行动建议模板',
        attachments: [],
        tags: ['湿地观察', '行动方案'],
        rubric: { dimensions: ['问题定义', '证据收集', '行动可行性'], totalScore: 100, passScore: 65, rewardGrowth: 35 },
        workflowStatus: 'active',
        status: 'published',
        submissionCount: 2,
        reviewedCount: 1,
        rewardGrowth: 35,
        createdAt: '2026-05-10T16:00:00.000Z',
        updatedAt: timestamp,
      },
    ],
    challengeSubmissions: submissions,
    logs: [
      { id: 'demo_log_1', module: '演示数据', message: '已恢复专家端 H5 可验收数据', createdAt: timestamp },
      { id: 'demo_log_2', module: '作品审核', message: '当前有 2 份作品待专家评分', createdAt: '2026-05-11T18:10:00.000Z' },
      { id: 'demo_log_3', module: '订单', message: '当前有 1 笔退款申请待处理', createdAt: '2026-05-11T10:00:00.000Z' },
      ...base.logs,
    ].slice(0, 30),
  };
}

function normalizeState(value: unknown): ExpertState {
  if (!value || typeof value !== 'object') {
    return initialState();
  }

  const parsed = value as Partial<ExpertState>;
  if (typeof parsed.version !== 'number') {
    return initialState();
  }
  const base = initialState();
  const products = (parsed.products ?? []).map((product) => {
    const normalizedType = normalizeProductType(product.productType);
    return {
      ...product,
      productType: normalizedType,
      pricingType: product.pricingType ?? (product.price > 0 ? 'paid' : 'free'),
      price: product.pricingType === 'free' ? 0 : product.price,
      liveQrCode: product.liveQrCode ?? (normalizedType === 'live_course' ? 'https://yanxuebao.local/live/demo-qrcode' : undefined),
      coverFileName: product.coverFileName ?? `${product.title}封面图.png`,
      detailImageFileNames:
        product.detailImageFileNames && product.detailImageFileNames.length > 0
          ? product.detailImageFileNames
          : [`${product.title}详情图-课程亮点.png`, `${product.title}详情图-交付说明.png`],
      materialFileName: product.materialFileName ?? `${product.title}资料.pdf`,
      chapters: (product.chapters ?? []).map((chapter, index) => normalizeCourseChapter(chapter, product.title, index, normalizedType)),
    };
  });
  const orders = (parsed.orders ?? []).map((order) => {
    const product = products.find((item) => item.id === order.productId);
    const verificationCode = order.verificationCode ?? (!product || isOnlineProduct(product.productType) ? undefined : generateVerificationCode());
    const customerName = order.customerName ?? order.studentName;
    const customerPhone = order.customerPhone ?? buildCustomerPhone(order.phoneTail);
    return {
      ...order,
      customerName,
      customerPhone,
      studentName: order.studentName ?? customerName,
      phoneTail: order.phoneTail ?? customerPhone.slice(-4),
      verificationCode,
      reservationCode: order.reservationCode?.length === 12 ? order.reservationCode : verificationCode ?? order.reservationCode,
      refundAmount: order.refundAmount ?? 0,
    };
  });
  const contentCollectionRules = (parsed.contentCollectionRules ?? []).map((rule) => ({
    ...rule,
    excludeKeywords: rule.excludeKeywords ?? [],
    sourceScope: rule.sourceScope ?? '权威科普',
    updateWindow: rule.updateWindow ?? '近7天',
    maxItems: rule.maxItems ?? 3,
  }));
  const newsItems = (parsed.newsItems ?? []).map((item) => ({
    ...item,
    sourceUrl: item.sourceUrl ?? (item.sourceType === 'collection' ? `https://mock.yanxuebao.local/news/${item.id}` : undefined),
    coverImage: item.coverImage ?? (item.format === '图文' ? `${item.title}封面` : undefined),
    readingTime: item.readingTime ?? (item.format === '图文' ? '4 分钟' : undefined),
    collectedAt: item.collectedAt ?? (item.sourceType === 'collection' ? item.createdAt : undefined),
  }));
  const challenges = (parsed.challenges ?? []).map((challenge) => ({
    ...challenge,
    objective: challenge.objective ?? '围绕真实问题完成探究、建模、表达和迭代。',
    targetAge: challenge.targetAge ?? '10-18岁',
    workType: challenge.workType ?? '团队挑战',
    templateSource: challenge.templateSource ?? '专家自定义',
    workRequirement: challenge.workRequirement ?? '提交作品说明、过程证据和成果照片。',
    references: challenge.references ?? '',
    attachments: challenge.attachments ?? [],
    tags: challenge.tags ?? [],
    rubric: challenge.rubric ?? {
      dimensions: ['问题意识', '方案设计', '作品完成度'],
      totalScore: 100,
      passScore: 60,
      rewardGrowth: 30,
    },
  }));
  const challengeSubmissions = (parsed.challengeSubmissions ?? []).map((submission) => {
    const status = submission.status === 'pending' && typeof submission.aiScore === 'number' ? 'ai_scored' : submission.status ?? 'pending';
    return {
      ...submission,
      teamName: submission.teamName ?? `${submission.studentName}小队`,
      teamMembers: submission.teamMembers ?? [submission.studentName],
      workSummary: submission.workSummary ?? '学员已提交作品，等待专家查看详情并确认评分。',
      workAttachments: submission.workAttachments ?? [
        {
          id: `${submission.id}_mock_file`,
          name: `${submission.workTitle || '挑战作品'}附件.pdf`,
          sizeLabel: '1.0 MB',
          type: 'application/pdf',
          uploadedAt: submission.submittedAt,
        },
      ],
      aiComment: submission.aiComment ?? `AI 初评建议分 ${submission.aiScore}，请专家结合评分维度确认。`,
      status,
      updatedAt: submission.updatedAt ?? submission.reviewedAt ?? submission.submittedAt,
    };
  });

  return {
    ...base,
    ...parsed,
    application: { ...emptyApplication(), ...parsed.application },
    bankAccount: { ...emptyBankAccount(), ...parsed.bankAccount },
    invoiceProfile: { ...emptyInvoiceProfile(), ...parsed.invoiceProfile },
    products,
    orders,
    contentCollectionRules,
    newsItems,
    challenges,
    agentSkills: parsed.agentSkills ?? [],
    agentVoiceSamples: parsed.agentVoiceSamples ?? [],
    refundRequests: parsed.refundRequests ?? [],
    challengeSubmissions,
    version: STORE_VERSION,
  };
}

export function ExpertStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExpertState>(() => initialState());
  const [hydrated, setHydrated] = useState(false);
  const [storageKey, setStorageKey] = useState(STORE_KEY_PREFIX);

  useEffect(() => {
    function hydrateCurrentAccount() {
      const next = loadStateForCurrentAccount();
      setStorageKey(next.storageKey);
      setState(next.state);
      setHydrated(true);
    }

    hydrateCurrentAccount();
    window.addEventListener(EXPERT_SESSION_EVENT, hydrateCurrentAccount);

    return () => window.removeEventListener(EXPERT_SESSION_EVENT, hydrateCurrentAccount);
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(withCurrentOwner(state)));
    }
  }, [hydrated, state, storageKey]);

  const value = useMemo<ExpertStoreValue>(() => {
    function resetData() {
      setState(initialState());
    }

    function restoreDemoData() {
      setState((current) => buildDemoState(current));
    }

    function startApplication(accountType: AccountType) {
      setState((current) => {
        const next: ExpertState = {
          ...current,
          accountStatus: 'draft',
          application: {
            ...current.application,
            accountType,
            status: 'draft',
            submittedAt: undefined,
            reviewedAt: undefined,
            reviewOpinion: undefined,
          },
        };
        return addLog(next, '入驻', `${accountType === 'organization' ? '机构' : '行业专家'}入驻资料开始填写`);
      });
    }

    function submitApplication(input: ExpertApplicationInput) {
      const timestamp = nowIso();
      setState((current) => {
        const next: ExpertState = {
          ...current,
          accountStatus: 'under_review',
          application: {
            ...input,
            status: 'under_review',
            submittedAt: timestamp,
            reviewedAt: undefined,
            reviewOpinion: undefined,
          },
          expert: {
            name: input.expertName,
            title: input.title,
            organization: input.organization || (input.accountType === 'expert' ? '个人专家' : ''),
            field: input.field,
            accountNo: current.expert.accountNo,
          },
        };
        return addLog(addAudit(next, '入驻申请', 'application', 'pending', '入驻资料已提交'), '入驻', '入驻资料已提交运营审核');
      });
    }

    function reviewApplication(status: Extract<AuditStatus, 'approved' | 'rejected'>, opinion: string) {
      const timestamp = nowIso();
      setState((current) => {
        const approved = status === 'approved';
        const next: ExpertState = {
          ...current,
          accountStatus: approved ? 'approved' : 'rejected',
          application: {
            ...current.application,
            status: approved ? 'approved' : 'rejected',
            reviewedAt: timestamp,
            reviewOpinion: opinion,
          },
          expert: {
            ...current.expert,
            accountNo: approved && !current.expert.accountNo ? `YXZJ-${new Date().getFullYear()}-${String(current.auditRecords.length + 1).padStart(4, '0')}` : current.expert.accountNo,
          },
        };
        const audited = addLog(addAudit(next, '入驻申请', 'application', status, opinion), '入驻', approved ? '专家账户已开通' : '入驻资料已驳回');
        return audited;
      });
    }

    function saveBankAccount(input: BankAccountInput) {
      setState((current) => {
        const next: ExpertState = {
          ...current,
          bankAccount: {
            ...input,
            status: 'pending',
            submittedAt: nowIso(),
            reviewedAt: undefined,
            reviewOpinion: undefined,
          },
        };
        return addLog(addAudit(next, '银行卡', 'bank_account', 'pending', '收款银行卡已提交校验'), '结算', '收款银行卡已提交校验');
      });
    }

    function reviewBankAccount(status: Extract<AuditStatus, 'approved' | 'rejected'>, opinion: string) {
      const timestamp = nowIso();
      setState((current) => {
        const approved = status === 'approved';
        const next: ExpertState = {
          ...current,
          bankAccount: {
            ...current.bankAccount,
            status: approved ? 'active' : 'rejected',
            reviewedAt: timestamp,
            reviewOpinion: opinion,
          },
          settlement: approved
            ? {
                ...current.settlement,
                accountName: current.bankAccount.accountName,
                bankName: current.bankAccount.bankName,
              }
            : current.settlement,
        };
        return addLog(addAudit(next, '银行卡', 'bank_account', status, opinion), '结算', approved ? '收款银行卡已生效' : '收款银行卡校验未通过');
      });
    }

    function saveInvoiceProfile(input: InvoiceProfileInput) {
      setState((current) => {
        const next: ExpertState = {
          ...current,
          invoiceProfile: {
            ...input,
            status: 'pending',
            submittedAt: nowIso(),
            reviewedAt: undefined,
            reviewOpinion: undefined,
          },
        };
        return addLog(addAudit(next, '发票资料', 'invoice_profile', 'pending', '发票资料已提交审核'), '发票', '发票资料已提交审核');
      });
    }

    function reviewInvoiceProfile(status: Extract<AuditStatus, 'approved' | 'rejected'>, opinion: string) {
      const timestamp = nowIso();
      setState((current) => {
        const approved = status === 'approved';
        const next: ExpertState = {
          ...current,
          invoiceProfile: {
            ...current.invoiceProfile,
            status: approved ? 'approved' : 'rejected',
            reviewedAt: timestamp,
            reviewOpinion: opinion,
          },
          settlement: approved
            ? {
                ...current.settlement,
                invoiceTitle: current.invoiceProfile.title,
              }
            : current.settlement,
        };
        return addLog(addAudit(next, '发票资料', 'invoice_profile', status, opinion), '发票', approved ? '发票资料已通过' : '发票资料已驳回');
      });
    }

    function setActiveAgent(agentId: string | null) {
      setState((current) => ({ ...current, activeAgentId: agentId }));
    }

    function createAgent(input: AgentInput) {
      const id = uid('agent');
      const timestamp = nowIso();
      setState((current) => {
        const existing = current.agents[0];
        const agent: ExpertAgent = {
          id: existing?.id ?? id,
          name: input.name,
          avatarText: input.avatarText.slice(0, 2) || '智',
          field: input.field,
          status: 'draft',
          rolePositioning: input.rolePositioning,
          welcomeMessage: input.welcomeMessage,
          promptTemplate: input.promptTemplate,
          replyStyle: input.replyStyle,
          knowledgeBindings: input.knowledgeIds.map((knowledgeId, index) => ({
            knowledgeId,
            priority: index + 1,
            enabled: true,
          })),
          createdAt: existing?.createdAt ?? timestamp,
          updatedAt: timestamp,
          operations: {
            conversations: existing?.operations.conversations ?? 0,
            resolvedRate: existing?.operations.resolvedRate ?? 0,
            satisfaction: existing?.operations.satisfaction ?? 0,
            dailyActiveUsers: existing?.operations.dailyActiveUsers ?? 0,
          },
        };
        return addLog(
          {
            ...current,
            agents: [agent],
            activeAgentId: agent.id,
          },
          '智能体',
          existing ? `${agent.name} 已更新` : `${agent.name} 已创建为草稿`,
        );
      });
      return state.agents[0]?.id ?? id;
    }

    function updateAgent(agentId: string, patch: Partial<Omit<ExpertAgent, 'id' | 'createdAt'>>) {
      setState((current) =>
        addLog(
          {
            ...current,
            agents: current.agents.map((agent) => (agent.id === agentId ? { ...agent, ...patch, updatedAt: nowIso() } : agent)),
          },
          '智能体',
          '智能体配置已更新',
        ),
      );
    }

    function setAgentStatus(agentId: string, status: AgentLifecycleStatus) {
      const statusLabel: Record<AgentLifecycleStatus, string> = {
        draft: '草稿',
        testing: '测试中',
        published: '已上架',
        unpublished: '已下架',
      };
      setState((current) =>
        addLog(
          {
            ...current,
            agents: current.agents.map((agent) => (agent.id === agentId ? { ...agent, status, updatedAt: nowIso() } : agent)),
          },
          '智能体',
          `智能体状态已更新为${statusLabel[status]}`,
        ),
      );
    }

    function updateAgentBindings(agentId: string, knowledgeIds: string[]) {
      setState((current) =>
        addLog(
          {
            ...current,
            agents: current.agents.map((agent) =>
              agent.id === agentId
                ? {
                    ...agent,
                    knowledgeBindings: knowledgeIds.map((knowledgeId, index) => ({
                      knowledgeId,
                      priority: index + 1,
                      enabled: true,
                    })),
                    updatedAt: nowIso(),
                  }
                : agent,
            ),
          },
          '智能体',
          '知识库绑定顺序已保存',
        ),
      );
    }

    function addAgentTestRecord(agentId: string, question: string) {
      const timestamp = nowIso();
      const record: AgentTestRecord = {
        id: uid('test'),
        agentId,
        question,
        answer: `我会先把问题拆成可观察的现象，再结合课程和知识库给出适合孩子理解的回答：${question}`,
        result: question.length > 8 ? 'passed' : 'needs_tuning',
        testedAt: timestamp,
      };
      setState((current) =>
        addLog(
          {
            ...current,
            agentTestRecords: [record, ...current.agentTestRecords],
            agents: current.agents.map((agent) =>
              agent.id === agentId
                ? {
                    ...agent,
                    status: agent.status === 'draft' ? 'testing' : agent.status,
                    updatedAt: timestamp,
                    operations: {
                      ...agent.operations,
                      conversations: agent.operations.conversations + 1,
                      resolvedRate: Math.max(agent.operations.resolvedRate, 72),
                      satisfaction: Math.max(agent.operations.satisfaction, 88),
                      dailyActiveUsers: Math.max(agent.operations.dailyActiveUsers, 1),
                    },
                  }
                : agent,
            ),
          },
          '智能体',
          '已生成一条测试记录',
        ),
      );
      return record;
    }

    function importAgentSkill(input: AgentSkillInput) {
      const id = uid('skill');
      setState((current) =>
        addLog(
          {
            ...current,
            agentSkills: [
              {
                id,
                ...input,
                status: 'pending',
                importedAt: nowIso(),
              },
              ...current.agentSkills,
            ],
          },
          '智能体',
          '智能体技能已导入，待生效',
        ),
      );
      return id;
    }

    function activateAgentSkill(skillId: string) {
      setState((current) =>
        addLog(
          {
            ...current,
            agentSkills: current.agentSkills.map((skill) => (skill.id === skillId ? { ...skill, status: 'active' } : skill)),
          },
          '智能体',
          '智能体技能已生效',
        ),
      );
    }

    function recordAgentVoiceSample(input: AgentVoiceInput) {
      const id = uid('voice');
      setState((current) =>
        addLog(
          {
            ...current,
            agentVoiceSamples: [
              {
                id,
                ...input,
                status: 'recorded',
                createdAt: nowIso(),
              },
              ...current.agentVoiceSamples,
            ],
          },
          '智能体',
          '专家语音样本已录入',
        ),
      );
      return id;
    }

    function testAgentVoice(sampleId: string) {
      setState((current) =>
        addLog(
          {
            ...current,
            agentVoiceSamples: current.agentVoiceSamples.map((sample) =>
              sample.id === sampleId ? { ...sample, status: 'tested', testedAt: nowIso() } : sample,
            ),
          },
          '智能体',
          '智能体语音试听已生成',
        ),
      );
    }

    function saveProduct(input: ProductInput, productId?: string) {
      const id = productId ?? uid('product');
      const timestamp = nowIso();
      const normalizedType = normalizeProductType(input.productType);
      const normalizedInput: ProductInput = {
        ...input,
        productType: normalizedType,
        pricingType: input.pricingType,
        price: input.pricingType === 'free' ? 0 : input.price,
        liveQrCode: normalizedType === 'live_course' ? input.liveQrCode : undefined,
        coverFileName: input.coverFileName || `${input.title}封面图.png`,
        detailImageFileNames:
          input.detailImageFileNames && input.detailImageFileNames.length > 0
            ? input.detailImageFileNames
            : [`${input.title}详情图-课程介绍.png`],
        chapters: input.chapters.map((chapter, index) => normalizeCourseChapter(chapter, input.title, index, normalizedType)),
      };
      setState((current) => {
        const exists = current.products.some((product) => product.id === id);
        const nextProducts = exists
          ? current.products.map((product) =>
              product.id === id
                ? {
                    ...product,
                    ...normalizedInput,
                    updatedAt: timestamp,
                  }
                : product,
            )
          : [
              {
                id,
                ...normalizedInput,
                status: 'draft' as ProductStatus,
                views: 0,
                reservations: 0,
                payAmount: 0,
                refundAmount: 0,
                createdAt: timestamp,
                updatedAt: timestamp,
              },
              ...current.products,
            ];

        const nextSessions = exists
          ? current.sessions
          : [
              {
                id: uid('session'),
                productId: id,
                title: `${normalizedInput.title} 首期场次`,
                startsAt: timestamp,
                location: normalizedInput.location,
                capacity: normalizedInput.capacity,
                reserved: 0,
              },
              ...current.sessions,
            ];

        const nextPlans = current.distributionPlans.some((plan) => plan.productId === id)
          ? current.distributionPlans
          : [
              {
                id: uid('dist_plan'),
                productId: id,
                enabled: false,
                commissionRate: 8,
                promoterCount: 0,
                orderCount: 0,
                commissionAmount: 0,
              },
              ...current.distributionPlans,
            ];

        return addLog(
          {
            ...current,
            products: nextProducts,
            sessions: nextSessions,
            distributionPlans: nextPlans,
          },
          '课程',
          exists ? '课程产品已更新' : '课程产品已创建',
        );
      });
      return id;
    }

    function setProductStatus(productId: string, status: ProductStatus) {
      const label: Record<ProductStatus, string> = {
        draft: '草稿',
        pending_review: '运营审核中',
        published: '已上架',
        rejected: '审核驳回',
        unpublished: '已下架',
        ended: '已结束',
      };
      setState((current) => {
        const next = addAudit(current, '课程', productId, status === 'published' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending', `课程状态更新为${label[status]}`);
        return addLog(
          {
            ...next,
            products: next.products.map((product) =>
              product.id === productId ? { ...product, status, updatedAt: nowIso() } : product,
            ),
          },
          '课程',
          `课程状态更新为${label[status]}`,
        );
      });
    }

    function createOrder(productId: string) {
      const product = state.products.find((item) => item.id === productId);
      if (!product) {
        return null;
      }
      const customerName = ['林知禾', '沈思远', '叶一晨', '陆安然'][Math.floor(Math.random() * 4)];
      const customerPhone = buildCustomerPhone();
      const amount = product.pricingType === 'free' ? 0 : product.price;
      const verificationCode = isOnlineProduct(product.productType) ? undefined : generateVerificationCode();
      const order: OrderRecord = {
        id: uid('order'),
        productId,
        sessionId: state.sessions.find((session) => session.productId === productId)?.id,
        studentName: customerName,
        customerName,
        customerPhone,
        phoneTail: customerPhone.slice(-4),
        reservationCode: verificationCode ?? `YX${Math.floor(100000 + Math.random() * 900000)}`,
        verificationCode,
        amount,
        refundAmount: 0,
        status: amount > 0 ? 'paid' : 'reserved',
        channel: product.productType === 'online_course' ? '分销推广' : '自然预约',
        createdAt: nowIso(),
        paidAt: amount > 0 ? nowIso() : undefined,
      };
      setState((current) => {
        const plan = current.distributionPlans.find((item) => item.productId === productId);
        const commission = plan?.enabled ? Math.round(amount * plan.commissionRate) / 100 : 0;
        const distributionOrder: DistributionOrder | null =
          plan?.enabled && commission > 0
            ? {
                id: uid('dist_order'),
                productId,
                orderId: order.id,
                promoterName: '研学推广伙伴',
                amount,
                commission,
                status: 'pending',
                createdAt: nowIso(),
              }
            : null;

        return addLog(
          {
            ...current,
            settlement: {
              ...current.settlement,
              availableAmount: current.settlement.availableAmount + Math.max(0, amount - commission),
            },
            orders: [order, ...current.orders],
            distributionOrders: distributionOrder ? [distributionOrder, ...current.distributionOrders] : current.distributionOrders,
            distributionPlans: current.distributionPlans.map((item) =>
              item.productId === productId && distributionOrder
                ? {
                    ...item,
                    promoterCount: Math.max(item.promoterCount, 1),
                    orderCount: item.orderCount + 1,
                    commissionAmount: item.commissionAmount + commission,
                  }
                : item,
            ),
            products: current.products.map((item) =>
              item.id === productId
                ? {
                    ...item,
                    reservations: item.reservations + 1,
                    payAmount: item.payAmount + amount,
                    views: item.views + 8,
                    updatedAt: nowIso(),
                  }
                : item,
            ),
            sessions: current.sessions.map((session) =>
              session.productId === productId ? { ...session, reserved: session.reserved + 1 } : session,
            ),
          },
          '课程',
          `已生成预约订单 ${order.reservationCode}`,
        );
      });
      return order;
    }

    function createRefundRequest(orderId: string, amount: number, reason: string) {
      const order = state.orders.find((item) => item.id === orderId);
      if (!order || order.status === 'refunded' || order.status === 'cancelled' || order.amount <= 0) {
        return null;
      }
      const normalizedAmount = Math.min(Math.max(1, amount), order.amount - (order.refundAmount ?? 0));
      const id = uid('refund');
      setState((current) => {
        const currentOrder = current.orders.find((item) => item.id === orderId);
        if (!currentOrder) {
          return current;
        }
        const request: RefundRequest = {
          id,
          orderId,
          productId: currentOrder.productId,
          customerName: currentOrder.customerName,
          amount: normalizedAmount,
          reason: reason || '客户申请退款',
          status: 'pending',
          requestedAt: nowIso(),
        };
        return addLog(
          {
            ...current,
            orders: current.orders.map((item) =>
              item.id === orderId ? { ...item, status: 'refund_requested', refundRequestedAt: nowIso() } : item,
            ),
            refundRequests: [request, ...current.refundRequests],
          },
          '订单',
          '退款申请已提交',
        );
      });
      return id;
    }

    function approveRefund(refundId: string, amount: number, note: string) {
      setState((current) => {
        const refund = current.refundRequests.find((item) => item.id === refundId);
        const order = refund ? current.orders.find((item) => item.id === refund.orderId) : undefined;
        if (!refund || !order || refund.status !== 'pending') {
          return current;
        }
        const previousRefund = order.refundAmount ?? 0;
        const normalizedAmount = Math.min(Math.max(1, amount), order.amount - previousRefund);
        const nextRefundAmount = previousRefund + normalizedAmount;
        const nextOrderStatus: OrderStatus = nextRefundAmount >= order.amount ? 'refunded' : 'partial_refunded';
        return addLog(
          {
            ...current,
            settlement: {
              ...current.settlement,
              availableAmount: Math.max(0, current.settlement.availableAmount - normalizedAmount),
            },
            refundRequests: current.refundRequests.map((item) =>
              item.id === refundId
                ? {
                    ...item,
                    amount: normalizedAmount,
                    status: 'approved',
                    handledAt: nowIso(),
                    handlerNote: note || (nextOrderStatus === 'refunded' ? '已全额退款' : '已部分退款'),
                  }
                : item,
            ),
            orders: current.orders.map((item) =>
              item.id === order.id
                ? {
                    ...item,
                    status: nextOrderStatus,
                    refundAmount: nextRefundAmount,
                    refundedAt: nowIso(),
                  }
                : item,
            ),
            products: current.products.map((product) =>
              product.id === order.productId
                ? {
                    ...product,
                    refundAmount: product.refundAmount + normalizedAmount,
                    updatedAt: nowIso(),
                  }
                : product,
            ),
          },
          '订单',
          nextOrderStatus === 'refunded' ? '订单已全额退款' : '订单已部分退款',
        );
      });
    }

    function rejectRefund(refundId: string, note: string) {
      setState((current) => {
        const refund = current.refundRequests.find((item) => item.id === refundId);
        if (!refund || refund.status !== 'pending') {
          return current;
        }
        return addLog(
          {
            ...current,
            refundRequests: current.refundRequests.map((item) =>
              item.id === refundId
                ? {
                    ...item,
                    status: 'rejected',
                    handledAt: nowIso(),
                    handlerNote: note || '退款申请已驳回',
                  }
                : item,
            ),
            orders: current.orders.map((item) =>
              item.id === refund.orderId && item.status === 'refund_requested' ? { ...item, status: 'paid' } : item,
            ),
          },
          '订单',
          '退款申请已驳回',
        );
      });
    }

    function writeOffOrder(reservationCode: string) {
      const code = reservationCode.trim().toUpperCase();
      const order = state.orders.find((item) => (item.verificationCode ?? item.reservationCode).toUpperCase() === code);
      const product = order ? state.products.find((item) => item.id === order.productId) : undefined;

      let result: WriteOffResult;
      if (!order) {
        result = { status: 'exception', message: '未找到预约码，请核对后重试' };
      } else if (product && isOnlineProduct(product.productType)) {
        result = { status: 'exception', message: '线上课程无需核销' };
      } else if (order.status === 'written_off') {
        result = { status: 'duplicate', message: '该预约码已核销，已记录重复核销' };
      } else if (order.status === 'refunded' || order.status === 'cancelled' || order.status === 'refund_requested') {
        result = { status: 'exception', message: '订单状态异常，无法核销' };
      } else {
        result = { status: 'success', message: '核销成功，履约状态已更新' };
      }

      setState((current) =>
        addLog(
          {
            ...current,
            orders:
              result.status === 'success'
                ? current.orders.map((item) =>
                    item.id === order?.id ? { ...item, status: 'written_off', writtenOffAt: nowIso() } : item,
                  )
                : current.orders,
            writeOffRecords: [
              {
                id: uid('writeoff'),
                orderId: order?.id,
                reservationCode: code,
                productTitle: product?.title ?? '未匹配产品',
                status: result.status,
                message: result.message,
                createdAt: nowIso(),
              },
              ...current.writeOffRecords,
            ],
          },
          '核销',
          result.message,
        ),
      );

      return result;
    }

    function updateDistributionPlan(
      productId: string,
      patch: Partial<Pick<DistributionPlan, 'enabled' | 'commissionRate'>>,
    ) {
      setState((current) => {
        const hasPlan = current.distributionPlans.some((plan) => plan.productId === productId);
        const plan: DistributionPlan = {
          id: uid('dist_plan'),
          productId,
          enabled: false,
          commissionRate: 8,
          promoterCount: 0,
          orderCount: 0,
          commissionAmount: 0,
          ...patch,
        };
        return addLog(
          {
            ...current,
            distributionPlans: hasPlan
              ? current.distributionPlans.map((item) => (item.productId === productId ? { ...item, ...patch } : item))
              : [plan, ...current.distributionPlans],
          },
          '分销',
          '分销配置已保存',
        );
      });
    }

    function createWithdrawal(amount: number) {
      setState((current) => {
        const request: WithdrawalRequest = {
          id: uid('withdraw'),
          amount,
          accountName: current.settlement.accountName,
          bankName: current.settlement.bankName,
          status: 'submitted',
          requestedAt: nowIso(),
        };

        return addLog(
          {
            ...current,
            settlement: {
              ...current.settlement,
              availableAmount: Math.max(0, current.settlement.availableAmount - amount),
              frozenAmount: current.settlement.frozenAmount + amount,
            },
            withdrawalRequests: [request, ...current.withdrawalRequests],
          },
          '结算',
          '提现申请已提交',
        );
      });
    }

    function importQaRecord(input: QaImportInput) {
      const id = uid('qa');
      setState((current) =>
        addLog(
          {
            ...current,
            qaRecords: [
              {
                id,
                agentId: input.agentId,
                productId: input.productId ?? null,
                studentName: input.studentName,
                question: input.question,
                keywords: input.keywords,
                sourceType: 'manual_import',
                status: 'unmatched',
                askedAt: nowIso(),
              },
              ...current.qaRecords,
            ],
          },
          '问答',
          '学员提问已导入待补答列表',
        ),
      );
      return id;
    }

    function saveAgentQuestion(input: AgentQuestionInput, recordId?: string) {
      const id = recordId ?? uid('qa');
      const timestamp = nowIso();
      setState((current) => {
        const exists = current.qaRecords.some((record) => record.id === id);
        const record: QaRecord = {
          id,
          agentId: input.agentId,
          productId: input.productId ?? null,
          title: input.title,
          question: input.question,
          answer: input.answer,
          keywords: input.keywords,
          sourceType: 'expert_question',
          status: input.status,
          askedAt: timestamp,
        };
        return addLog(
          {
            ...current,
            qaRecords: exists
              ? current.qaRecords.map((item) => (item.id === id ? { ...item, ...record, askedAt: item.askedAt } : item))
              : [record, ...current.qaRecords],
          },
          '问题库',
          exists ? '专家问题已更新' : '专家问题已新增',
        );
      });
      return id;
    }

    function saveKnowledgeLibrary(input: KnowledgeLibraryInput, libraryId?: string) {
      const id = libraryId ?? uid('library');
      const timestamp = nowIso();
      setState((current) => {
        const exists = current.knowledgeLibraries.some((library) => library.id === id);
        return addLog(
          {
            ...current,
            knowledgeLibraries: exists
              ? current.knowledgeLibraries.map((library) =>
                  library.id === id ? { ...library, ...input, updatedAt: timestamp } : library,
                )
              : [
                  {
                    id,
                    ...input,
                    enabled: true,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                  },
                  ...current.knowledgeLibraries,
                ],
          },
          '知识库',
          exists ? '知识库分组已更新' : '知识库分组已创建',
        );
      });
      return id;
    }

    function setKnowledgeLibraryEnabled(libraryId: string, enabled: boolean) {
      setState((current) =>
        addLog(
          {
            ...current,
            knowledgeLibraries: current.knowledgeLibraries.map((library) =>
              library.id === libraryId ? { ...library, enabled, updatedAt: nowIso() } : library,
            ),
          },
          '知识库',
          enabled ? '知识库分组已启用' : '知识库分组已停用',
        ),
      );
    }

    function uploadKnowledgeFile(input: KnowledgeUploadInput) {
      const id = uid('knowledge_job');
      const timestamp = nowIso();
      setState((current) =>
        addLog(
          {
            ...current,
            knowledgeImportJobs: [
              {
                id,
                libraryId: input.libraryId,
                agentId: input.agentId,
                file: {
                  id: uid('file'),
                  name: input.fileName,
                  sizeLabel: '2.4 MB',
                  type: input.fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
                  uploadedAt: timestamp,
                },
                status: 'uploaded',
                entryCount: 0,
                previewText: input.previewText,
                createdAt: timestamp,
                updatedAt: timestamp,
              },
              ...current.knowledgeImportJobs,
            ],
          },
          '知识库',
          '知识库文件已上传',
        ),
      );
      return id;
    }

    function completeKnowledgeImport(jobId: string) {
      setState((current) => {
        const job = current.knowledgeImportJobs.find((item) => item.id === jobId);
        if (!job) {
          return current;
        }
        const timestamp = nowIso();
        const entry: KnowledgeEntry = {
          id: uid('knowledge'),
          agentId: job.agentId,
          libraryId: job.libraryId,
          title: job.file.name.replace(/\.[^.]+$/, ''),
          question: '这份资料主要回答哪些研学问题？',
          answer: job.previewText || '已上传资料，后续可继续修订为标准问答。',
          keywords: ['资料导入'],
          source: 'upload',
          status: 'enabled',
          bindingPriority: 1,
          file: job.file,
          revisions: [],
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        return addLog(
          {
            ...current,
            knowledgeImportJobs: current.knowledgeImportJobs.map((item) =>
              item.id === jobId ? { ...item, status: 'completed', entryCount: 1, updatedAt: timestamp } : item,
            ),
            knowledgeEntries: [entry, ...current.knowledgeEntries],
          },
          '知识库',
          '知识库文件解析完成并生成条目',
        );
      });
    }

    function supplementQa(
      recordId: string,
      answer: string,
      targetAgentId: string | null,
      knowledgeId?: string,
      libraryId?: string,
      keywords?: string[],
    ) {
      setState((current) => {
        const qa = current.qaRecords.find((record) => record.id === recordId);
        if (!qa) {
          return current;
        }
        const timestamp = nowIso();
        const nextKnowledgeId = knowledgeId || uid('knowledge');
        const existing = current.knowledgeEntries.find((entry) => entry.id === nextKnowledgeId);
        const targetLibrary = libraryId
          ? current.knowledgeLibraries.find((library) => library.id === libraryId)
          : current.knowledgeLibraries.find((library) => library.agentId === targetAgentId) ?? current.knowledgeLibraries[0];
        const nextKeywords = keywords?.length
          ? keywords
          : qa.keywords?.length
            ? qa.keywords
            : ['问答补充', targetAgentId ? '智能体知识' : '公共知识'];
        const nextKnowledge = existing
          ? current.knowledgeEntries.map((entry) =>
              entry.id === nextKnowledgeId
                ? {
                    ...entry,
                    agentId: targetAgentId,
                    libraryId: entry.libraryId ?? targetLibrary?.id ?? null,
                    answer,
                    keywords: nextKeywords,
                    revisions: [
                      {
                        id: uid('rev'),
                        answer: entry.answer,
                        changedAt: timestamp,
                        note: '由问答补充产生的上一版本',
                      },
                      ...entry.revisions,
                    ],
                    updatedAt: timestamp,
                  }
                : entry,
            )
          : [
              {
                id: nextKnowledgeId,
                agentId: targetAgentId,
                libraryId: targetLibrary?.id ?? null,
                title: qa.question.slice(0, 18),
                question: qa.question,
                answer,
                keywords: nextKeywords,
                source: 'qa_followup' as const,
                status: 'enabled' as const,
                bindingPriority: 1,
                revisions: [],
                createdAt: timestamp,
                updatedAt: timestamp,
              },
              ...current.knowledgeEntries,
            ];

        return addLog(
          {
            ...current,
            qaRecords: current.qaRecords.map((record) =>
              record.id === recordId
                ? {
                    ...record,
                    agentId: targetAgentId,
                    answer,
                    keywords: nextKeywords,
                    status: 'resolved',
                    matchedKnowledgeId: nextKnowledgeId,
                  }
                : record,
            ),
            knowledgeEntries: nextKnowledge,
          },
          '问答',
          '问答已补答并回写知识库',
        );
      });
    }

    function saveKnowledgeEntry(input: KnowledgeInput, entryId?: string) {
      const id = entryId ?? uid('knowledge');
      const timestamp = nowIso();
      setState((current) => {
        const existing = current.knowledgeEntries.find((entry) => entry.id === id);
        const targetLibrary = input.libraryId
          ? current.knowledgeLibraries.find((library) => library.id === input.libraryId)
          : current.knowledgeLibraries.find((library) => library.agentId === input.agentId) ?? current.knowledgeLibraries[0];
        const entries = existing
          ? current.knowledgeEntries.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    ...input,
                    libraryId: input.libraryId ?? entry.libraryId,
                    status: input.status ?? entry.status,
                    bindingPriority: input.bindingPriority ?? entry.bindingPriority,
                    revisions:
                      entry.answer === input.answer
                        ? entry.revisions
                        : [
                            {
                              id: uid('rev'),
                              answer: entry.answer,
                              changedAt: timestamp,
                              note: '手动修订前版本',
                            },
                            ...entry.revisions,
                          ],
                    updatedAt: timestamp,
                    archivedAt: undefined,
                  }
                : entry,
            )
          : [
              {
                id,
                ...input,
                libraryId: input.libraryId ?? targetLibrary?.id ?? null,
                source: input.source ?? 'manual',
                status: input.status ?? 'enabled',
                bindingPriority: input.bindingPriority ?? 1,
                revisions: [],
                createdAt: timestamp,
                updatedAt: timestamp,
              },
              ...current.knowledgeEntries,
            ];

        return addLog({ ...current, knowledgeEntries: entries }, '知识库', existing ? '知识条目已修订' : '知识条目已新增');
      });
      return id;
    }

    function setKnowledgeEntryStatus(entryId: string, status: KnowledgeEntryStatus) {
      setState((current) =>
        addLog(
          {
            ...current,
            knowledgeEntries: current.knowledgeEntries.map((entry) =>
              entry.id === entryId ? { ...entry, status, updatedAt: nowIso() } : entry,
            ),
          },
          '知识库',
          status === 'enabled' ? '知识条目已启用' : '知识条目已停用',
        ),
      );
    }

    function archiveKnowledgeEntry(entryId: string) {
      setState((current) =>
        addLog(
          {
            ...current,
            knowledgeEntries: current.knowledgeEntries.map((entry) =>
              entry.id === entryId ? { ...entry, archivedAt: nowIso() } : entry,
            ),
          },
          '知识库',
          '知识条目已删除',
        ),
      );
    }

    function restoreKnowledgeRevision(entryId: string, revisionId: string) {
      setState((current) => {
        const entry = current.knowledgeEntries.find((item) => item.id === entryId);
        const revision = entry?.revisions.find((item) => item.id === revisionId);
        if (!entry || !revision) {
          return current;
        }
        return addLog(
          {
            ...current,
            knowledgeEntries: current.knowledgeEntries.map((item) =>
              item.id === entryId
                ? {
                    ...item,
                    answer: revision.answer,
                    revisions: [
                      {
                        id: uid('rev'),
                        answer: item.answer,
                        changedAt: nowIso(),
                        note: '恢复版本前内容',
                      },
                      ...item.revisions,
                    ],
                    updatedAt: nowIso(),
                  }
                : item,
            ),
          },
          '知识库',
          '已恢复历史版本',
        );
      });
    }

    function saveCollectionRule(input: CollectionRuleInput, ruleId?: string) {
      const id = ruleId ?? uid('collection_rule');
      const timestamp = nowIso();
      setState((current) => {
        const exists = current.contentCollectionRules.some((rule) => rule.id === id);
        const sourceRules = input.sourceNames.map((name, index) => ({
          id: `${id}_source_${index}`,
          name,
          url: `https://source.yanxuebao.local/${encodeURIComponent(name)}`,
          enabled: true,
        }));
        const normalizedInput = {
          ...input,
          excludeKeywords: input.excludeKeywords ?? [],
          sourceScope: input.sourceScope ?? '权威科普',
          updateWindow: input.updateWindow ?? '近7天',
          maxItems: input.maxItems ?? 3,
        };
        return addLog(
          {
            ...current,
            contentCollectionRules: exists
              ? current.contentCollectionRules.map((rule) =>
                  rule.id === id
                    ? {
                        ...rule,
                        ...normalizedInput,
                        sourceRules,
                        updatedAt: timestamp,
                      }
                    : rule,
                )
              : [
                  {
                    id,
                    ...normalizedInput,
                    sourceRules,
                    enabled: true,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                  },
                  ...current.contentCollectionRules,
                ],
          },
          '资讯',
          exists ? '资讯采集规则已更新' : '资讯采集规则已创建',
        );
      });
      return id;
    }

    function runCollectionRule(ruleId: string) {
      const rule = state.contentCollectionRules.find((item) => item.id === ruleId);
      if (!rule) {
        return null;
      }
      const id = uid('news');
      const timestamp = nowIso();
      const enabledSources = rule.sourceRules.filter((item) => item.enabled);
      const source = enabledSources[0]?.name ?? '领域来源';
      const keyword = rule.keywords[0] ?? '研学';
      const count = Math.min(Math.max(rule.maxItems ?? 3, 1), 3);
      const generatedItems: NewsItem[] = Array.from({ length: count }).map((_, index) => {
        const currentKeyword = rule.keywords[index % Math.max(rule.keywords.length, 1)] ?? keyword;
        const currentSource = enabledSources[index % Math.max(enabledSources.length, 1)]?.name ?? source;
        const itemId = index === 0 ? id : uid('news');
        const title = `${currentKeyword}观察：一线科普机构发布新的研学素材`;
        return {
          id: itemId,
          agentId: rule.agentId,
          collectionRuleId: rule.id,
          title,
          status: 'collected',
          sourceType: 'collection',
          format: '图文',
          source: currentSource,
          sourceUrl: `https://mock.yanxuebao.local/news/${encodeURIComponent(currentKeyword)}/${itemId}`,
          summary: `系统按“${rule.name}”规则采集到${currentKeyword}相关图文资讯，可进入详情查看富文本内容。`,
          content: [
            `导读：${currentSource}近期围绕${currentKeyword}发布了适合研学场景转化的图文内容。`,
            `要点一：内容包含现象解释、观察任务和安全提示，适合沉淀到智能体资讯流。`,
            `要点二：建议专家结合自己的课程主题补充一句专业点评，再决定是否下发给学员。`,
            `延伸任务：让学员记录一个与${currentKeyword}有关的真实观察，并提出可验证问题。`,
          ].join('\n\n'),
          coverImage: `${currentKeyword}图文封面`,
          readingTime: `${3 + index} 分钟`,
          collectedAt: timestamp,
          featured: false,
          pushCount: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
      });
      setState((current) =>
        addLog(
          {
            ...current,
            contentCollectionRules: current.contentCollectionRules.map((item) =>
              item.id === ruleId ? { ...item, lastCollectedAt: timestamp, updatedAt: timestamp } : item,
            ),
            newsItems: [
              ...generatedItems,
              ...current.newsItems,
            ],
          },
          '资讯',
          '已按采集规则生成采集池资讯',
        ),
      );
      return id;
    }

    function saveNewsItem(input: NewsInput, newsId?: string) {
      const id = newsId ?? uid('news');
      const timestamp = nowIso();
      setState((current) => {
        const exists = current.newsItems.some((item) => item.id === id);
        return addLog(
          {
            ...current,
            newsItems: exists
              ? current.newsItems.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        ...input,
                        agentId: input.agentId ?? item.agentId,
                        sourceType: input.sourceType ?? item.sourceType,
                        format: input.format ?? item.format,
                        publishedAt: input.status === 'published' ? item.publishedAt ?? timestamp : item.publishedAt,
                        updatedAt: timestamp,
                      }
                    : item,
                )
              : [
                  {
                    id,
                    ...input,
                    agentId: input.agentId ?? null,
                    sourceType: input.sourceType ?? 'manual',
                    format: input.format ?? '图文',
                    publishedAt: input.status === 'published' ? timestamp : undefined,
                    pushCount: input.status === 'published' ? 1 : 0,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                  },
                  ...current.newsItems,
                ],
          },
          '资讯',
          exists ? '资讯已更新' : '资讯已新增',
        );
      });
      return id;
    }

    function setNewsStatus(newsId: string, status: NewsStatus) {
      setState((current) =>
        addLog(
          {
            ...current,
            newsItems: current.newsItems.map((item) =>
              item.id === newsId
                ? {
                    ...item,
                    status,
                    publishedAt: status === 'published' ? nowIso() : item.publishedAt,
                    pushCount: status === 'published' ? Math.max(1, item.pushCount) : item.pushCount,
                    updatedAt: nowIso(),
                  }
                : item,
            ),
          },
          '资讯',
          status === 'published' ? '资讯已发布' : '资讯状态已更新',
        ),
      );
    }

    function deleteNewsItem(newsId: string) {
      setState((current) =>
        addLog(
          {
            ...current,
            newsItems: current.newsItems.filter((item) => item.id !== newsId),
          },
          '资讯',
          '采集资讯已删除',
        ),
      );
    }

    function saveChallenge(input: ChallengeInput, challengeId?: string) {
      const id = challengeId ?? uid('challenge');
      const timestamp = nowIso();
      setState((current) => {
        const exists = current.challenges.some((item) => item.id === id);
        const defaultRubric: ChallengeRubric = {
          dimensions: ['问题意识', '证据收集', '表达完整度'],
          totalScore: 100,
          passScore: 60,
          rewardGrowth: 30,
        };
        return addLog(
          {
            ...current,
            challenges: exists
              ? current.challenges.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        ...input,
                        objective: input.objective ?? item.objective,
                        targetAge: input.targetAge ?? item.targetAge,
                        workType: input.workType ?? item.workType,
                        templateSource: input.templateSource ?? item.templateSource,
                        workRequirement: input.workRequirement ?? item.workRequirement,
                        attachments: input.attachments ?? item.attachments,
                        rubric: input.rubric ?? item.rubric,
                        updatedAt: timestamp,
                      }
                    : item,
                )
              : [
                  {
                    id,
                    ...input,
                    objective: input.objective ?? '围绕真实问题完成探究、设计、制作和表达。',
                    targetAge: input.targetAge ?? '10-18岁',
                    workType: input.workType ?? '团队挑战',
                    templateSource: input.templateSource ?? '专家自定义',
                    workRequirement: input.workRequirement ?? '提交观察记录、证据说明和解决建议。',
                    attachments: input.attachments ?? [],
                    rubric: input.rubric ?? defaultRubric,
                    workflowStatus: 'draft',
                    status: 'draft',
                    submissionCount: 0,
                    reviewedCount: 0,
                    rewardGrowth: 0,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                  },
                  ...current.challenges,
                ],
          },
          '难题挑战',
          exists ? '挑战已更新' : '挑战已创建',
        );
      });
      return id;
    }

    function setChallengeStatus(challengeId: string, status: ChallengeStatus) {
      const workflowStatus: Record<ChallengeStatus, ContentWorkflowStatus> = {
        draft: 'draft',
        ready: 'pending',
        published: 'active',
        ended: 'archived',
      };
      setState((current) =>
        addLog(
          {
            ...current,
            challenges: current.challenges.map((item) =>
              item.id === challengeId
                ? {
                    ...item,
                    status,
                    workflowStatus: workflowStatus[status],
                    updatedAt: nowIso(),
                  }
                : item,
            ),
          },
          '难题挑战',
          '挑战状态已更新',
        ),
      );
    }

    function importChallengeSubmission(input: SubmissionImportInput) {
      const id = uid('submission');
      const timestamp = nowIso();
      setState((current) =>
        addLog(
          {
            ...current,
            challengeSubmissions: [
              {
                id,
                challengeId: input.challengeId,
                teamName: input.teamName?.trim() || `${input.studentName}小队`,
                teamMembers: input.teamMembers?.length ? input.teamMembers : [input.studentName],
                studentName: input.studentName,
                studentProfile: input.studentProfile,
                workTitle: input.workTitle,
                workSummary: input.workSummary ?? '学员已提交挑战作品，等待专家确认 AI 评分或补充个性化评价。',
                workAttachments: input.workAttachments ?? [
                  {
                    id: `${id}_file_1`,
                    name: `${input.workTitle}作品附件.pdf`,
                    sizeLabel: '1.0 MB',
                    type: 'application/pdf',
                    uploadedAt: timestamp,
                  },
                ],
                aiScore: input.aiScore,
                aiComment: input.aiComment ?? `AI 初评为 ${input.aiScore} 分，建议专家结合评分维度确认。`,
                status: input.status ?? 'ai_scored',
                submittedAt: timestamp,
                updatedAt: timestamp,
              },
              ...current.challengeSubmissions,
            ],
            challenges: current.challenges.map((challenge) =>
              challenge.id === input.challengeId
                ? {
                    ...challenge,
                    submissionCount: challenge.submissionCount + 1,
                    updatedAt: timestamp,
                  }
                : challenge,
            ),
          },
          '作品审核',
          '挑战作品已导入待审列表',
        ),
      );
      return id;
    }

    function reviewSubmission(submissionId: string, expertScore: number, rewardGrowth: number, comment: string) {
      setState((current) => {
        const submission = current.challengeSubmissions.find((item) => item.id === submissionId);
        if (!submission) {
          return current;
        }
        const wasReviewed = submission.status === 'reviewed';
        return addLog(
          {
            ...current,
            challengeSubmissions: current.challengeSubmissions.map((item) =>
              item.id === submissionId
                ? {
                    ...item,
                    expertScore,
                    rewardGrowth,
                    reviewResult: {
                      expertScore,
                      rewardGrowth,
                      comment,
                      reviewedAt: nowIso(),
                    },
                    comment,
                    status: 'reviewed',
                    reviewedAt: nowIso(),
                    updatedAt: nowIso(),
                  }
                : item,
            ),
            challenges: current.challenges.map((challenge) =>
              challenge.id === submission.challengeId
                ? {
                    ...challenge,
                    reviewedCount: wasReviewed ? challenge.reviewedCount : challenge.reviewedCount + 1,
                    rewardGrowth: challenge.rewardGrowth + rewardGrowth,
                    updatedAt: nowIso(),
                  }
                : challenge,
            ),
          },
          '作品审核',
          '作品评分与成长值已回写',
        );
      });
    }

    function batchConfirmAiReviews(submissionIds: string[]) {
      setState((current) => {
        const timestamp = nowIso();
        const targets = current.challengeSubmissions.filter((submission) => submissionIds.includes(submission.id) && submission.status === 'ai_scored');
        if (!targets.length) {
          return current;
        }
        const growthByChallenge = targets.reduce<Record<string, { count: number; growth: number }>>((acc, submission) => {
          const challenge = current.challenges.find((item) => item.id === submission.challengeId);
          const rewardGrowth = challenge?.rubric.rewardGrowth ?? 30;
          acc[submission.challengeId] = {
            count: (acc[submission.challengeId]?.count ?? 0) + 1,
            growth: (acc[submission.challengeId]?.growth ?? 0) + rewardGrowth,
          };
          return acc;
        }, {});
        return addLog(
          {
            ...current,
            challengeSubmissions: current.challengeSubmissions.map((submission) => {
              if (!submissionIds.includes(submission.id) || submission.status !== 'ai_scored') {
                return submission;
              }
              const challenge = current.challenges.find((item) => item.id === submission.challengeId);
              const rewardGrowth = challenge?.rubric.rewardGrowth ?? 30;
              return {
                ...submission,
                expertScore: submission.aiScore,
                rewardGrowth,
                reviewResult: {
                  expertScore: submission.aiScore,
                  rewardGrowth,
                  comment: '已批量确认 AI 评分，作品达到挑战要求。',
                  reviewedAt: timestamp,
                },
                comment: '已批量确认 AI 评分，作品达到挑战要求。',
                status: 'reviewed',
                reviewedAt: timestamp,
                updatedAt: timestamp,
              };
            }),
            challenges: current.challenges.map((challenge) => {
              const summary = growthByChallenge[challenge.id];
              if (!summary) {
                return challenge;
              }
              return {
                ...challenge,
                reviewedCount: challenge.reviewedCount + summary.count,
                rewardGrowth: challenge.rewardGrowth + summary.growth,
                updatedAt: timestamp,
              };
            }),
          },
          '作品审核',
          `已批量确认 ${targets.length} 份 AI 评分作品`,
        );
      });
    }

    function generateChallengeDemoData() {
      const timestamp = nowIso();
      setState((current) => {
        const agentId = current.activeAgentId ?? current.agents[0]?.id ?? null;
        const productId = current.products[0]?.id ?? null;
        const challengeAId = 'demo_3d_challenge_basic';
        const challengeBId = 'demo_3d_challenge_tower';
        const demoChallenges: Challenge[] = [
          {
            id: challengeAId,
            agentId,
            productId,
            title: '基础形状打印挑战',
            difficulty: '入门',
            objective: '掌握基础建模或 3D 打印笔操作，理解三维空间概念。',
            targetAge: '10-13岁',
            workType: '团队挑战',
            templateSource: '3D打印挑战模板',
            description: '使用 3D 打印笔或基础建模软件制作立方体、球体等简单几何体，并说明结构特点。',
            workRequirement: '提交作品照片、建模过程截图和 100 字结构说明。',
            references: '基础形状建模任务单.pdf',
            attachments: [{ id: 'demo_3d_file_basic', name: '基础形状建模任务单.pdf', sizeLabel: '1.0 MB', type: 'application/pdf', uploadedAt: timestamp }],
            tags: ['3D打印', '空间想象'],
            rubric: { dimensions: ['空间结构', '操作规范', '表达完整度'], totalScore: 100, passScore: 60, rewardGrowth: 30 },
            workflowStatus: 'active',
            status: 'published',
            submissionCount: 2,
            reviewedCount: 1,
            rewardGrowth: 30,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
          {
            id: challengeBId,
            agentId,
            productId,
            title: '力学结构挑战',
            difficulty: '进阶',
            objective: '理解重心分布和承重结构设计，完成可测试的高塔结构。',
            targetAge: '12-16岁',
            workType: '团队挑战',
            templateSource: '3D打印挑战模板',
            description: '设计并打印一座能够稳定托举网球的高塔结构，记录失败和迭代过程。',
            workRequirement: '提交高塔作品照片、承重测试视频说明和结构优化记录。',
            references: '高塔承重结构参考图.pdf',
            attachments: [{ id: 'demo_3d_file_tower', name: '高塔承重结构参考图.pdf', sizeLabel: '1.4 MB', type: 'application/pdf', uploadedAt: timestamp }],
            tags: ['3D打印', '力学结构'],
            rubric: { dimensions: ['结构稳定性', '迭代过程', '测试证据'], totalScore: 100, passScore: 65, rewardGrowth: 40 },
            workflowStatus: 'active',
            status: 'published',
            submissionCount: 2,
            reviewedCount: 1,
            rewardGrowth: 40,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ];
        const demoSubmissions: ChallengeSubmission[] = [
          {
            id: 'demo_3d_submission_1',
            challengeId: challengeAId,
            teamName: '几何探索队',
            teamMembers: ['周一诺', '陈小满', '吴星河'],
            studentName: '周一诺',
            studentProfile: { age: '11岁', school: '上海未来学校', city: '上海', grade: '五年级' },
            workTitle: '立方体和球体组合模型',
            workSummary: '团队完成基础几何体打印，并说明了支撑面、圆角和材料使用差异。',
            workAttachments: [{ id: 'demo_3d_submission_1_file', name: '组合模型照片.png', sizeLabel: '2.1 MB', type: 'image/png', uploadedAt: timestamp }],
            aiScore: 84,
            aiComment: 'AI 初评认为模型完整，空间表达清晰，过程记录可再细化。',
            status: 'ai_scored',
            submittedAt: timestamp,
            updatedAt: timestamp,
          },
          {
            id: 'demo_3d_submission_2',
            challengeId: challengeAId,
            teamName: '几何探索队',
            teamMembers: ['周一诺', '陈小满', '吴星河'],
            studentName: '陈小满',
            studentProfile: { age: '10岁', school: '上海未来学校', city: '上海', grade: '四年级' },
            workTitle: '几何体结构说明卡',
            workSummary: '用图文卡片解释立方体、球体和圆柱体的形状差异。',
            workAttachments: [{ id: 'demo_3d_submission_2_file', name: '结构说明卡.pdf', sizeLabel: '1.2 MB', type: 'application/pdf', uploadedAt: timestamp }],
            aiScore: 88,
            aiComment: 'AI 初评认为表达完整，能解释主要结构差异。',
            expertScore: 90,
            rewardGrowth: 30,
            reviewResult: { expertScore: 90, rewardGrowth: 30, comment: '说明清楚，能把形状和空间结构联系起来。', reviewedAt: timestamp },
            status: 'reviewed',
            comment: '说明清楚，能把形状和空间结构联系起来。',
            submittedAt: timestamp,
            reviewedAt: timestamp,
            updatedAt: timestamp,
          },
          {
            id: 'demo_3d_submission_3',
            challengeId: challengeBId,
            teamName: '结构工程队',
            teamMembers: ['李予辰', '赵以晴'],
            studentName: '李予辰',
            studentProfile: { age: '13岁', school: '上海科创中学', city: '上海', grade: '初一' },
            workTitle: '网球承重高塔',
            workSummary: '完成三角支撑高塔并记录两次倒塌后的结构加固方案。',
            workAttachments: [{ id: 'demo_3d_submission_3_file', name: '高塔承重测试.mp4', sizeLabel: '8.4 MB', type: 'video/mp4', uploadedAt: timestamp }],
            aiScore: 91,
            aiComment: 'AI 初评认为测试证据充分，迭代记录完整，建议专家重点查看结构稳定性。',
            status: 'ai_scored',
            submittedAt: timestamp,
            updatedAt: timestamp,
          },
          {
            id: 'demo_3d_submission_4',
            challengeId: challengeBId,
            teamName: '结构工程队',
            teamMembers: ['李予辰', '赵以晴'],
            studentName: '赵以晴',
            studentProfile: { age: '13岁', school: '上海科创中学', city: '上海', grade: '初一' },
            workTitle: '高塔结构优化记录',
            workSummary: '用表格记录底座宽度、支撑杆数量和承重表现之间的关系。',
            workAttachments: [{ id: 'demo_3d_submission_4_file', name: '结构优化记录表.pdf', sizeLabel: '1.5 MB', type: 'application/pdf', uploadedAt: timestamp }],
            aiScore: 79,
            aiComment: 'AI 初评认为记录较完整，但结论表达还可以更清晰。',
            expertScore: 82,
            rewardGrowth: 40,
            reviewResult: { expertScore: 82, rewardGrowth: 40, comment: '记录认真，下一步可以把测试数据转成更明确的设计结论。', reviewedAt: timestamp },
            status: 'reviewed',
            comment: '记录认真，下一步可以把测试数据转成更明确的设计结论。',
            submittedAt: timestamp,
            reviewedAt: timestamp,
            updatedAt: timestamp,
          },
        ];
        const challengeIds = new Set(demoChallenges.map((challenge) => challenge.id));
        const submissionIds = new Set(demoSubmissions.map((submission) => submission.id));
        return addLog(
          {
            ...current,
            challenges: [...demoChallenges, ...current.challenges.filter((challenge) => !challengeIds.has(challenge.id))],
            challengeSubmissions: [...demoSubmissions, ...current.challengeSubmissions.filter((submission) => !submissionIds.has(submission.id))],
          },
          '挑战演示数据',
          '已生成 3D 打印挑战、团队、学员和作品数据',
        );
      });
    }

    function createEvaluationBatch(input: EvaluationBatchInput) {
      const timestamp = nowIso();
      const attachments: EvaluationAttachment[] = [
        {
          id: uid('eval_photo'),
          name: `活动照片 ${input.photoCount} 张`,
          type: 'photo',
          uploadedAt: timestamp,
        },
        {
          id: uid('eval_form'),
          name: input.formName,
          type: 'form',
          uploadedAt: timestamp,
        },
      ];
      setState((current) =>
        addLog(
          {
            ...current,
            evaluationBatches: [
              {
                id: uid('eval'),
                productId: input.productId,
                sessionId: input.sessionId,
                title: input.title,
                studentCount: input.studentCount,
                attachments,
                reportStatus: 'generating',
                workflowStatus: 'pending',
                diarySynced: false,
                createdAt: timestamp,
                updatedAt: timestamp,
              },
              ...current.evaluationBatches,
            ],
          },
          '学生评价',
          '评价批次已生成',
        ),
      );
    }

    function advanceEvaluationBatch(batchId: string) {
      const nextStatus: Record<EvaluationReportStatus, EvaluationReportStatus> = {
        collecting: 'generating',
        generating: 'completed',
        completed: 'synced',
        synced: 'synced',
      };
      const nextWorkflowStatus: Record<EvaluationReportStatus, ContentWorkflowStatus> = {
        collecting: 'pending',
        generating: 'pending',
        completed: 'active',
        synced: 'archived',
      };
      setState((current) =>
        addLog(
          {
            ...current,
            evaluationBatches: current.evaluationBatches.map((batch) =>
              batch.id === batchId
                ? {
                    ...batch,
                    reportStatus: nextStatus[batch.reportStatus],
                    workflowStatus: nextWorkflowStatus[nextStatus[batch.reportStatus]],
                    diarySynced: nextStatus[batch.reportStatus] === 'synced',
                    updatedAt: nowIso(),
                  }
                : batch,
            ),
          },
          '学生评价',
          '评价批次状态已推进',
        ),
      );
    }

    function updateSettings(patch: Partial<ExpertState['settings']>) {
      setState((current) => ({
        ...current,
        settings: {
          ...current.settings,
          ...patch,
        },
      }));
    }

    return {
      state,
      hydrated,
      resetData,
      restoreDemoData,
      startApplication,
      submitApplication,
      reviewApplication,
      saveBankAccount,
      reviewBankAccount,
      saveInvoiceProfile,
      reviewInvoiceProfile,
      setActiveAgent,
      createAgent,
      updateAgent,
      setAgentStatus,
      updateAgentBindings,
      addAgentTestRecord,
      importAgentSkill,
      activateAgentSkill,
      recordAgentVoiceSample,
      testAgentVoice,
      saveProduct,
      setProductStatus,
      createOrder,
      createRefundRequest,
      approveRefund,
      rejectRefund,
      writeOffOrder,
      updateDistributionPlan,
      createWithdrawal,
      importQaRecord,
      saveAgentQuestion,
      supplementQa,
      saveKnowledgeLibrary,
      setKnowledgeLibraryEnabled,
      uploadKnowledgeFile,
      completeKnowledgeImport,
      saveKnowledgeEntry,
      setKnowledgeEntryStatus,
      archiveKnowledgeEntry,
      restoreKnowledgeRevision,
      saveCollectionRule,
      runCollectionRule,
      saveNewsItem,
      setNewsStatus,
      deleteNewsItem,
      saveChallenge,
      setChallengeStatus,
      importChallengeSubmission,
      reviewSubmission,
      batchConfirmAiReviews,
      generateChallengeDemoData,
      createEvaluationBatch,
      advanceEvaluationBatch,
      updateSettings,
    };
  }, [hydrated, state]);

  return <ExpertStoreContext.Provider value={value}>{children}</ExpertStoreContext.Provider>;
}

export function useExpertStore() {
  const context = useContext(ExpertStoreContext);
  if (!context) {
    throw new Error('useExpertStore must be used within ExpertStoreProvider');
  }
  return context;
}

export function getInitialExpertState() {
  return cloneState(initialState());
}
