'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORE_KEY = 'yanxuebao_expert_h5_state_v4';
const STORE_VERSION = 4;

export type ExpertAccountStatus = 'not_started' | 'draft' | 'under_review' | 'rejected' | 'approved';
export type AccountType = 'expert' | 'organization';
export type AuditStatus = 'pending' | 'approved' | 'rejected';
export type BankAccountStatus = 'not_set' | 'pending' | 'active' | 'rejected';
export type InvoiceProfileStatus = 'not_set' | 'pending' | 'approved' | 'rejected';
export type AgentLifecycleStatus = 'draft' | 'testing' | 'published' | 'unpublished';
export type AgentCreationStep = 'basic' | 'role' | 'knowledge' | 'strategy' | 'testing' | 'publish';
export type ReplyStyle = '鼓励型' | '专业严谨' | '启发提问' | '陪伴观察';
export type ProductType = 'online_course' | 'offline_course' | 'pbl' | 'face_to_face';
export type ProductStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'unpublished' | 'ended';
export type OrderStatus = 'reserved' | 'paid' | 'written_off' | 'refunded' | 'cancelled';
export type WriteOffStatus = 'success' | 'duplicate' | 'exception';
export type NewsStatus = 'collected' | 'editing' | 'published';
export type ChallengeStatus = 'draft' | 'ready' | 'published' | 'ended';
export type SubmissionReviewStatus = 'pending' | 'reviewed' | 'returned';
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
  sourceRules: NewsSourceRule[];
  formats: NewsFormat[];
  frequency: '每日' | '每周' | '手动';
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
  title: string;
  duration: string;
  summary: string;
};

export type ExpertProduct = {
  id: string;
  title: string;
  productType: ProductType;
  status: ProductStatus;
  summary: string;
  targetAge: string;
  price: number;
  capacity: number;
  location: string;
  schedule: string;
  bookingDeadline: string;
  deliveryPlan: string;
  chapters: CourseChapter[];
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
  phoneTail: string;
  reservationCode: string;
  amount: number;
  status: OrderStatus;
  channel: '自然预约' | '专家推荐' | '分销推广';
  createdAt: string;
  paidAt?: string;
  writtenOffAt?: string;
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
  studentName: string;
  question: string;
  answer?: string;
  keywords?: string[];
  sourceType: 'student_question' | 'manual_import';
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
  summary: string;
  content: string;
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
  studentName: string;
  workTitle: string;
  aiScore: number;
  expertScore?: number;
  rewardGrowth?: number;
  reviewResult?: SubmissionReviewResult;
  status: SubmissionReviewStatus;
  comment?: string;
  submittedAt: string;
  reviewedAt?: string;
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
  products: ExpertProduct[];
  sessions: ProductSession[];
  orders: OrderRecord[];
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
  price: number;
  capacity: number;
  location: string;
  schedule: string;
  bookingDeadline: string;
  deliveryPlan: string;
  chapters: CourseChapter[];
  tags: string[];
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
  summary: string;
  content: string;
  scheduledAt?: string;
  featured: boolean;
};

export type ChallengeInput = {
  agentId: string | null;
  productId: string | null;
  title: string;
  difficulty: Challenge['difficulty'];
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
  studentName: string;
  question: string;
  keywords: string[];
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
  sourceNames: string[];
  formats: NewsFormat[];
  frequency: ContentCollectionRule['frequency'];
};

export type SubmissionImportInput = {
  challengeId: string;
  studentName: string;
  workTitle: string;
  aiScore: number;
};

type WriteOffResult = {
  status: WriteOffStatus;
  message: string;
};

type ExpertStoreValue = {
  state: ExpertState;
  hydrated: boolean;
  resetData: () => void;
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
  saveProduct: (input: ProductInput, productId?: string) => string;
  setProductStatus: (productId: string, status: ProductStatus) => void;
  createOrder: (productId: string) => OrderRecord | null;
  writeOffOrder: (reservationCode: string) => WriteOffResult;
  updateDistributionPlan: (productId: string, patch: Partial<Pick<DistributionPlan, 'enabled' | 'commissionRate'>>) => void;
  createWithdrawal: (amount: number) => void;
  importQaRecord: (input: QaImportInput) => string;
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
  saveChallenge: (input: ChallengeInput, challengeId?: string) => string;
  setChallengeStatus: (challengeId: string, status: ChallengeStatus) => void;
  importChallengeSubmission: (input: SubmissionImportInput) => string;
  reviewSubmission: (submissionId: string, expertScore: number, rewardGrowth: number, comment: string) => void;
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

function initialState(): ExpertState {
  return {
    version: STORE_VERSION,
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
    products: [],
    sessions: [],
    orders: [],
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

function normalizeState(value: unknown): ExpertState {
  if (!value || typeof value !== 'object') {
    return initialState();
  }

  const parsed = value as Partial<ExpertState>;
  if (parsed.version !== STORE_VERSION) {
    return initialState();
  }

  return {
    ...initialState(),
    ...parsed,
    application: { ...emptyApplication(), ...parsed.application },
    bankAccount: { ...emptyBankAccount(), ...parsed.bankAccount },
    invoiceProfile: { ...emptyInvoiceProfile(), ...parsed.invoiceProfile },
    version: STORE_VERSION,
  };
}

export function ExpertStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExpertState>(() => initialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      setState(raw ? normalizeState(JSON.parse(raw)) : initialState());
    } catch {
      setState(initialState());
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    }
  }, [hydrated, state]);

  const value = useMemo<ExpertStoreValue>(() => {
    function resetData() {
      setState(initialState());
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
        return addLog(addAudit(next, '入驻申请', 'application', status, opinion), '入驻', approved ? '专家账户已开通' : '入驻资料已驳回');
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
        const agent: ExpertAgent = {
          id,
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
          createdAt: timestamp,
          updatedAt: timestamp,
          operations: {
            conversations: 0,
            resolvedRate: 0,
            satisfaction: 0,
            dailyActiveUsers: 0,
          },
        };
        return addLog(
          {
            ...current,
            agents: [agent, ...current.agents],
            activeAgentId: id,
          },
          '智能体',
          `${agent.name} 已创建为草稿`,
        );
      });
      return id;
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

    function saveProduct(input: ProductInput, productId?: string) {
      const id = productId ?? uid('product');
      const timestamp = nowIso();
      setState((current) => {
        const exists = current.products.some((product) => product.id === id);
        const nextProducts = exists
          ? current.products.map((product) =>
              product.id === id
                ? {
                    ...product,
                    ...input,
                    updatedAt: timestamp,
                  }
                : product,
            )
          : [
              {
                id,
                ...input,
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
                title: `${input.title} 首期场次`,
                startsAt: timestamp,
                location: input.location,
                capacity: input.capacity,
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
      const order: OrderRecord = {
        id: uid('order'),
        productId,
        sessionId: state.sessions.find((session) => session.productId === productId)?.id,
        studentName: ['林知禾', '沈思远', '叶一晨', '陆安然'][Math.floor(Math.random() * 4)],
        phoneTail: String(Math.floor(1000 + Math.random() * 9000)),
        reservationCode: `YX${Math.floor(100000 + Math.random() * 900000)}`,
        amount: product.price,
        status: 'paid',
        channel: product.productType === 'online_course' ? '分销推广' : '自然预约',
        createdAt: nowIso(),
        paidAt: nowIso(),
      };
      setState((current) => {
        const plan = current.distributionPlans.find((item) => item.productId === productId);
        const commission = plan?.enabled ? Math.round(product.price * plan.commissionRate) / 100 : 0;
        const distributionOrder: DistributionOrder | null =
          plan?.enabled && commission > 0
            ? {
                id: uid('dist_order'),
                productId,
                orderId: order.id,
                promoterName: '研学推广伙伴',
                amount: product.price,
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
              availableAmount: current.settlement.availableAmount + Math.max(0, product.price - commission),
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
                    payAmount: item.payAmount + product.price,
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

    function writeOffOrder(reservationCode: string) {
      const code = reservationCode.trim().toUpperCase();
      const order = state.orders.find((item) => item.reservationCode.toUpperCase() === code);
      const product = order ? state.products.find((item) => item.id === order.productId) : undefined;

      let result: WriteOffResult;
      if (!order) {
        result = { status: 'exception', message: '未找到预约码，请核对后重试' };
      } else if (order.status === 'written_off') {
        result = { status: 'duplicate', message: '该预约码已核销，已记录重复核销' };
      } else if (order.status === 'refunded' || order.status === 'cancelled') {
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
        return addLog(
          {
            ...current,
            contentCollectionRules: exists
              ? current.contentCollectionRules.map((rule) =>
                  rule.id === id
                    ? {
                        ...rule,
                        ...input,
                        sourceRules,
                        updatedAt: timestamp,
                      }
                    : rule,
                )
              : [
                  {
                    id,
                    ...input,
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
      const source = rule.sourceRules.find((item) => item.enabled)?.name ?? '领域来源';
      const keyword = rule.keywords[0] ?? '研学';
      setState((current) =>
        addLog(
          {
            ...current,
            contentCollectionRules: current.contentCollectionRules.map((item) =>
              item.id === ruleId ? { ...item, lastCollectedAt: timestamp, updatedAt: timestamp } : item,
            ),
            newsItems: [
              {
                id,
                agentId: rule.agentId,
                collectionRuleId: rule.id,
                title: `${keyword}领域精选资讯`,
                status: 'collected',
                sourceType: 'collection',
                format: rule.formats[0] ?? '图文',
                source,
                summary: `围绕${keyword}自动采集到的领域资讯，待专家编辑后下发。`,
                content: `请补充专家导读、适合学员收听的摘要和行动建议。`,
                featured: false,
                pushCount: 0,
                createdAt: timestamp,
                updatedAt: timestamp,
              },
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
                studentName: input.studentName,
                workTitle: input.workTitle,
                aiScore: input.aiScore,
                status: 'pending',
                submittedAt: timestamp,
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
      saveProduct,
      setProductStatus,
      createOrder,
      writeOffOrder,
      updateDistributionPlan,
      createWithdrawal,
      importQaRecord,
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
      saveChallenge,
      setChallengeStatus,
      importChallengeSubmission,
      reviewSubmission,
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
