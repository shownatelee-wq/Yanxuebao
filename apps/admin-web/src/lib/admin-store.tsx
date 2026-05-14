'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AdminRole } from './admin-auth';

export type EntityStatus = '启用' | '停用';
export type TeamAssignmentStatus = '未安排' | '已安排' | '执行中' | '已结束';
export type TaskExecutionStatus = '创建中' | '已下发' | '进行中' | '已结束';
export type PhotoRecognitionStatus = '识别中' | '已关联' | '待修正';
export type AuditStatus = '录入中' | '待审核' | '退回修改' | '已确认';
export type DeviceStatus = '库存' | '库存-租赁' | '已销售' | '租赁中' | '已回收' | '故障' | '保修中' | '报废' | '遗失' | '丢失';
export type RentalOrderStatus = '意向' | '已预订' | '已交付' | '已回收' | '已取消';
export type SaleOrderStatus = '待发货' | '已发货' | '已完成' | '退款中' | '已退款';
export type DemoRole = 'operator' | 'sales' | 'finance' | 'warehouse';
export type PaymentConfirmationStatus = '待确认' | '已确认' | '已退回';

export type Organization = {
  id: string;
  type: string;
  name: string;
  contactName: string;
  contactPhone: string;
  city: string;
  registeredAt: string;
  cooperationMode?: '销售' | '租赁' | '销售+租赁';
  customType?: boolean;
};

export type Mentor = {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  status: EntityStatus | '未激活';
  registeredAt: string;
  teamsLed: number;
  taskCount: number;
  participantCount: number;
};

export type Team = {
  id: string;
  lineName: string;
  name: string;
  organizationId: string;
  mentorId?: string;
  assistantPhones: string[];
  startDate: string;
  days: number;
  studentCount: number;
  taskCount: number;
  rentalDeviceCount: number;
  assignmentStatus: TeamAssignmentStatus;
  manualOps: number;
};

export type TaskSource = 'manual' | 'history' | 'library' | 'ai' | 'document';

export type TaskAttachment = {
  id: string;
  name: string;
  kind: 'pdf' | 'image' | 'doc' | 'video' | 'link';
  url: string;
};

export type WorkRequirement = {
  id: string;
  type: 'text' | 'choice' | 'judge' | 'image' | 'video' | 'audio' | 'link';
  requirement: string;
};

export type TeamTask = {
  id: string;
  teamId: string;
  name: string;
  status: TaskExecutionStatus;
  scope: '个人任务' | '小组任务';
  source: TaskSource;
  base: string;
  taskType: string;
  points: number;
  description: string;
  attachments: TaskAttachment[];
  requirements: WorkRequirement[];
  submittedCount: number;
  totalCount: number;
  mentorId?: string;
  updatedAt: string;
};

export type TeamTaskWork = {
  id: string;
  taskId: string;
  teamId: string;
  ownerType: '学员' | '小组';
  ownerName: string;
  title: string;
  submittedAt: string;
  status: '草稿' | '已提交' | 'AI评分' | '导师已评分';
  aiScore?: number;
  tutorScore?: number;
  preview: string;
  attachments: TaskAttachment[];
};

export type TeamPhoto = {
  id: string;
  teamId: string;
  title: string;
  uploadedAt: string;
  status: PhotoRecognitionStatus;
  linkedStudentIds: string[];
  note: string;
  hidden?: boolean;
};

export type PointOfInterest = {
  id: string;
  name: string;
  location: string;
  gps: string;
};

export type StudyBase = {
  id: string;
  city: string;
  name: string;
  type: string;
  address: string;
  servicePhone?: string;
  groupReservationNeeded?: boolean;
  bestStages?: string[];
  heat: number;
  chargeType: '免费' | '收费';
  reservationNeeded: boolean;
  audience: string;
  openingHours: string;
  approvalStatus: AuditStatus;
  createdBy: string;
  createdByRole: AdminRole;
  pois: PointOfInterest[];
};

export type TaskType = {
  id: string;
  name: string;
  defaultRequirement: string;
  defaultRule: string;
};

export type TaskLibraryItem = {
  id: string;
  city: string;
  baseId?: string;
  name: string;
  typeId: string;
  description: string;
  abilityTags: string[];
  subjectTags: string[];
  stageTags: string[];
  applyTo: string[];
  approvalStatus: AuditStatus;
  createdBy: string;
  createdByRole: AdminRole;
  teamUseCount?: number;
  completionCount?: number;
  workRequirements?: string[];
};

export type PartTimer = {
  id: string;
  name: string;
  account: string;
  phone: string;
  cityIds: string[];
  status: EntityStatus;
  baseCount: number;
  taskCount: number;
  passedCount: number;
};

export type AuditRecord = {
  id: string;
  targetType: '基地' | '任务';
  targetId: string;
  city: string;
  title: string;
  maintainerId: string;
  maintainerName: string;
  submittedAt: string;
  status: AuditStatus;
  note: string;
};

export type Device = {
  id: string;
  serialNumber: string;
  batch: string;
  model: string;
  status: DeviceStatus;
  lastAction: string;
  warehouseId?: string;
  lastMovementDate?: string;
  rentalTimes?: number;
  rentalDays?: number;
};

export type PaymentRecord = {
  id: string;
  amount: number;
  method: '转账' | '扫码' | '现金';
  note: string;
  createdAt: string;
  confirmationStatus: PaymentConfirmationStatus;
  voucherFile?: string;
  recordedBy: string;
  confirmedBy?: string;
  confirmedAt?: string;
  returnedReason?: string;
};

export type PaymentInput = Omit<
  PaymentRecord,
  'id' | 'createdAt' | 'confirmationStatus' | 'recordedBy' | 'confirmedBy' | 'confirmedAt' | 'returnedReason'
> & Partial<Pick<PaymentRecord, 'confirmationStatus' | 'recordedBy'>>;

export type RentalDeviceBatch = {
  id: string;
  orderId: string;
  batchNo: string;
  fileName: string;
  quantity: number;
  failedCount: number;
  deviceSerials: string[];
  importedAt: string;
  status: '待出库' | '已出库' | '已回收';
};

export type UploadResultRecord = {
  id: string;
  feature: string;
  target: string;
  fileName: string;
  batchNo: string;
  successCount: number;
  failedCount: number;
  failedFields: string[];
  createdAt: string;
  operatorRole: string;
};

export type RentalOrder = {
  id: string;
  organizationId: string;
  contactName: string;
  contactPhone: string;
  saleOwner: string;
  createdAt: string;
  rentalDate: string;
  teamName: string;
  quantity: number;
  days: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  status: RentalOrderStatus;
  deviceSerials: string[];
  payments: PaymentRecord[];
  note: string;
};

export type OnlineSaleOrder = {
  id: string;
  buyerName: string;
  phone: string;
  orderDate: string;
  shippedAt?: string;
  quantity: number;
  paidAmount: number;
  status: SaleOrderStatus;
  deviceSerials: string[];
  receiver: string;
  address: string;
  expressCompany?: string;
  expressNo?: string;
};

export type EnterpriseSaleOrder = {
  id: string;
  customerType: '合作机构' | '代理商' | '企业客户';
  customerName: string;
  saleDate: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  contactName: string;
  contactPhone: string;
  saleOwner: string;
  status: '洽谈' | '已签约' | '意向' | '已预订' | '已交付' | '已取消';
  deviceSerials: string[];
  payments: PaymentRecord[];
};

export type InventoryDaily = {
  id: string;
  date: string;
  openingStock: number;
  inbound: number;
  onlineOutbound: number;
  enterpriseOutbound: number;
  rentalOutbound: number;
  rentalInbound: number;
  closingStock: number;
};

export type StudentStudyRecord = {
  id: string;
  date: string;
  type: '团体研学' | '家庭研学' | 'PBL研学';
  teamName: string;
  completedTasks: number;
  score: number;
  rating: string;
};

export type StudentTaskRecord = {
  id: string;
  taskName: string;
  date: string;
  score: number;
  rating: string;
};

export type GrowthValueRecord = {
  id: string;
  date: string;
  type: '收入' | '支出';
  source: string;
  delta: number;
  balance: number;
};

export type CapabilityRecord = {
  id: string;
  changedAt: string;
  element: string;
  source: string;
  oldValue: number;
  newValue: number;
};

export type AssessmentRecord = {
  id: string;
  type: '学员自测' | '家长评测' | '研学评价';
  createdAt: string;
  score: number;
  summary: string;
};

export type StudentProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  school: string;
  className: string;
  parentName: string;
  parentPhone: string;
  registeredAt: string;
  boundDevice: boolean;
  boundAt?: string;
  studyCount: number;
  capabilityScore: number;
  growthValue: number;
  diaryCount: number;
  capabilityPlaneScores: Record<string, number>;
  studyRecords: StudentStudyRecord[];
  taskRecords: StudentTaskRecord[];
  growthRecords: GrowthValueRecord[];
  capabilityRecords: CapabilityRecord[];
  assessments: AssessmentRecord[];
};

export type SosAlert = {
  id: string;
  studentId: string;
  studentName: string;
  raisedAt: string;
  location: string;
  audioSummary: string;
  status: '未处理' | '已联系';
  note: string;
};

export type CourseRecord = {
  id: string;
  title: string;
  expertName: string;
  type: '线上课程' | '线下课程';
  price: number;
  status: '创建中' | '审核中' | '已审核' | '已上架' | '下架中' | '已下架' | '已结束';
  sales: number;
  views: number;
  studentCount?: number;
};

export type QaRecord = {
  id: string;
  askedAt: string;
  studentName: string;
  agentName: string;
  summary: string;
  matchedKnowledge: boolean;
  status: '待补充' | '已补充';
};

export type KnowledgeItem = {
  id: string;
  title: string;
  category: '知识条目' | '资讯' | '难题挑战';
  updatedAt: string;
  status: '草稿' | '已发布';
};

export type AgentRecord = {
  id: string;
  name: string;
  expertName?: string;
  organizationName?: string;
  phone?: string;
  category?: string;
  bailianAccount?: string;
  firstOnlineAt?: string;
  style: '严谨' | '活泼' | '鼓励型';
  onlineStatus: '创建中' | '审核中' | '已上架' | '已下架';
  users: number;
  questions: number;
  orders?: number;
  pendingWorks?: number;
  knowledgeIds: string[];
};

export type CapabilityElement = {
  id: string;
  plane: string;
  indicator?: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type CapabilityMapping = {
  id: string;
  organizationIds: string[];
  indicator: string;
  formulaItems: Array<{ elementId: string; weight: number }>;
};

export type QuestionBankItem = {
  id: string;
  category: '学员自测' | '家长评测' | '天赋测试';
  type: '单选' | '判断' | '问答' | 'AI问答';
  title: string;
  element: string;
  answer?: string;
  scoringStandard?: string;
  status: '创建中' | '启用' | '草稿' | '停用';
};

export type GrowthRule = {
  id: string;
  scene: string;
  value: number;
};

export type GrowthGood = {
  id: string;
  name: string;
  type: '实物' | '虚拟';
  cost: number;
  stock: number;
  exchanged: number;
  status: '上架' | '下架';
};

export type AssessmentSetting = {
  id: string;
  label: string;
  durationMinutes: number;
  limitMode?: '每题限时' | '整场限时' | '双限时';
  perQuestionSeconds?: number;
};

export type OperationTrendPoint = {
  date: string;
  newStudents: number;
  rentalDevices: number;
  soldDevices: number;
  courseOrders: number;
  visitors: number;
  visitorRatio: number;
  orderAmount: number;
  orderCount: number;
  registrations: number;
};

export type OperationDailyRecord = OperationTrendPoint & {
  id: string;
  pageViews: number;
  uniqueVisitors: number;
  newParents: number;
  saleAmount: number;
  courseAmount: number;
};

export type WarehouseRecord = {
  id: string;
  name: string;
  province: string;
  city: string;
  manager: string;
  stock: number;
  rentalStock: number;
};

export type ContractRecord = {
  id: string;
  organizationId: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  status: '生效中' | '即将到期' | '已到期';
};

export type AttachmentRecord = {
  id: string;
  ownerType: '机构' | '租赁订单' | '企业销售' | '在线销售' | '课程' | '任务';
  ownerId: string;
  fileName: string;
  uploadedAt: string;
  note: string;
};

export type OperationLog = {
  id: string;
  role: string;
  operatorName: string;
  feature: string;
  target: string;
  content: string;
  result: '成功' | '待确认' | '失败' | '退回修改';
  operatedAt: string;
};

export type MasterAgentSettings = {
  id: string;
  agentName: string;
  knowledgeIds: string[];
  pushTaskRule: string;
  onboardingTaskRule: string;
  updatedAt: string;
};

export type ImportTaskJob = {
  id: string;
  title: string;
  sourceType: 'Excel导入' | '文档解析';
  status: '上传完成' | '解析中' | '待确认' | '已入库';
  createdAt: string;
  result: string;
  successTasks?: Array<{ name: string; baseName: string; status: AuditStatus }>;
  failedTasks?: Array<{ name: string; missingFields: string[]; status: '待补充' }>;
};

export type TaskBuilderBlock = {
  id: string;
  type: '封面' | '任务说明' | '作品要求' | '能力标签' | '评分规则';
  content: string;
};

export type TaskBuilderTemplate = {
  id: string;
  title: string;
  taskTypeId: string;
  blocks: TaskBuilderBlock[];
  abilityTags: string[];
};

export type ErasureRecord = {
  id: string;
  orderId: string;
  serialNumber: string;
  createdAt: string;
  status: '待执行' | '已完成';
};

export type AdminConsoleState = {
  version: number;
  demoRole: DemoRole;
  operationDailyRecords: OperationDailyRecord[];
  warehouses: WarehouseRecord[];
  contracts: ContractRecord[];
  attachments: AttachmentRecord[];
  uploadResults: UploadResultRecord[];
  rentalDeviceBatches: RentalDeviceBatch[];
  operationLogs: OperationLog[];
  masterAgentSettings: MasterAgentSettings;
  organizations: Organization[];
  mentors: Mentor[];
  teams: Team[];
  teamTasks: TeamTask[];
  teamTaskWorks: TeamTaskWork[];
  teamPhotos: TeamPhoto[];
  bases: StudyBase[];
  taskTypes: TaskType[];
  taskLibrary: TaskLibraryItem[];
  partTimers: PartTimer[];
  audits: AuditRecord[];
  devices: Device[];
  rentalOrders: RentalOrder[];
  onlineSales: OnlineSaleOrder[];
  enterpriseSales: EnterpriseSaleOrder[];
  inventoryDaily: InventoryDaily[];
  students: StudentProfile[];
  sosAlerts: SosAlert[];
  courses: CourseRecord[];
  qaRecords: QaRecord[];
  knowledge: KnowledgeItem[];
  agents: AgentRecord[];
  capabilityElements: CapabilityElement[];
  capabilityMappings: CapabilityMapping[];
  questionBank: QuestionBankItem[];
  growthRules: GrowthRule[];
  growthGoods: GrowthGood[];
  assessmentSettings: AssessmentSetting[];
  importJobs: ImportTaskJob[];
  builderTemplates: TaskBuilderTemplate[];
  erasureRecords: ErasureRecord[];
};

type AdminStoreActions = {
  resetSeed: () => void;
  setDemoRole: (role: DemoRole) => void;
  saveOrganization: (payload: Omit<Organization, 'id' | 'registeredAt'>, organizationId?: string) => void;
  saveMentor: (payload: Omit<Mentor, 'id' | 'registeredAt'>, mentorId?: string) => void;
  batchImportMentors: (organizationId: string, fileName: string) => void;
  assignMentor: (teamId: string, mentorId: string, assistantPhones: string[]) => void;
  saveTeamTask: (payload: Omit<TeamTask, 'id' | 'updatedAt'>, taskId?: string) => void;
  copyTeamTasksFromHistory: (targetTeamId: string, sourceTeamId: string, taskIds: string[]) => void;
  createAiTeamTasks: (targetTeamId: string) => void;
  importTeamTasksFromDocument: (targetTeamId: string, fileName: string) => void;
  savePhotoLinks: (photoId: string, linkedStudentIds: string[], status: PhotoRecognitionStatus, note: string) => void;
  batchUploadTeamPhotos: (teamId: string, fileNames: string[]) => void;
  toggleTeamPhotoHidden: (photoId: string) => void;
  saveBase: (payload: Omit<StudyBase, 'id' | 'heat' | 'approvalStatus'>, role: AdminRole, editorId: string, baseId?: string) => void;
  saveTaskLibrary: (
    payload: Omit<TaskLibraryItem, 'id' | 'approvalStatus'>,
    role: AdminRole,
    editorId: string,
    taskId?: string,
  ) => void;
  reviewAudit: (auditId: string, status: Extract<AuditStatus, '退回修改' | '已确认'>, note: string) => void;
  savePartTimer: (payload: Omit<PartTimer, 'id' | 'baseCount' | 'taskCount' | 'passedCount'>, partTimerId?: string) => void;
  createRentalOrder: (payload: Omit<RentalOrder, 'id' | 'createdAt' | 'payments'>) => void;
  updateRentalOrderStatus: (orderId: string, status: RentalOrderStatus, deviceSerials: string[], note: string) => void;
  addRentalPayment: (orderId: string, payment: PaymentInput) => void;
  confirmPayment: (sourceType: '租赁订单' | '企业销售', orderId: string, paymentId: string) => void;
  returnPayment: (sourceType: '租赁订单' | '企业销售', orderId: string, paymentId: string, reason: string) => void;
  supplementPaymentVoucher: (sourceType: '租赁订单' | '企业销售', orderId: string, paymentId: string, fileName: string) => void;
  adjustRentalOrder: (orderId: string, quantity: number, unitPrice: number, discount: number, note: string) => void;
  createRentalDamageBill: (orderId: string, amount: number, note: string) => void;
  attachRentalOrderFile: (orderId: string, fileName: string, note: string) => void;
  importRentalDeviceBatch: (orderId: string, fileName: string) => void;
  importInventoryDevices: (fileName?: string) => void;
  transferWarehouseStock: (fileName?: string) => void;
  importOnlineLogistics: (fileName?: string) => void;
  shipOnlineSale: (orderId: string, deviceSerials: string[], expressCompany: string, expressNo: string) => void;
  createEnterpriseSaleDraft: () => void;
  attachEnterpriseAgreement: (orderId?: string, fileName?: string) => void;
  confirmEnterprisePayment: () => void;
  updateEnterpriseSale: (orderId: string, deviceSerials: string[], status: EnterpriseSaleOrder['status']) => void;
  addEnterprisePayment: (orderId: string, payment: PaymentInput) => void;
  uploadOrganizationContract: (organizationId: string, fileName: string) => void;
  saveCapabilityMapping: (payload: Omit<CapabilityMapping, 'id'>, mappingId?: string) => void;
  saveGrowthRule: (payload: Omit<GrowthRule, 'id'>, ruleId?: string) => void;
  saveGrowthGood: (payload: Omit<GrowthGood, 'id' | 'exchanged'>, goodId?: string) => void;
  saveAssessmentSetting: (payload: Omit<AssessmentSetting, 'id'>, settingId?: string) => void;
  saveQuestionBankItem: (payload: Omit<QuestionBankItem, 'id'>, itemId?: string) => void;
  saveTaskType: (payload: Omit<TaskType, 'id'>, typeId?: string) => void;
  saveBuilderTemplate: (payload: Omit<TaskBuilderTemplate, 'id'>, templateId?: string) => void;
  moveBuilderBlock: (templateId: string, fromIndex: number, toIndex: number) => void;
  advanceImportJob: (jobId: string) => void;
  applyImportJob: (jobId: string) => void;
  updateSosStatus: (alertId: string, status: SosAlert['status'], note: string) => void;
  reviewExpertEntry: () => void;
  reviewCourseOrders: () => void;
  createCourseUploadDraft: () => void;
  toggleCourseStatus: (courseId: string) => void;
  submitQaAnswer: (qaId: string) => void;
  uploadAgentKnowledge: (agentId: string) => void;
  toggleKnowledgeStatus: (knowledgeId: string) => void;
  toggleAgentStatus: (agentId: string) => void;
  writeOperationLog: (payload: Omit<OperationLog, 'id' | 'operatedAt'>) => void;
  saveMasterAgentSettings: (payload: Omit<MasterAgentSettings, 'id' | 'updatedAt'>) => void;
};

type AdminStoreSelectors = {
  dashboard: {
    totalDevices: number;
    onlineDevices: number;
    studentCount: number;
    parentCount: number;
    todayActiveStudents: number;
    totalTasks: number;
    finishedTasks: number;
    teamCount: number;
    baseCount: number;
    taskLibraryCount: number;
    organizationCount: number;
    mentorCount: number;
    pendingTodos: Array<{ key: string; title: string; value: number; href: string }>;
    operationStats: Array<{ label: string; value: number }>;
    terminalStats: Array<{ label: string; value: number; color: string }>;
    funnel: { visitors: number; orders: number; customers: number };
    trends: OperationTrendPoint[];
    dailyRecords: OperationDailyRecord[];
  };
  pendingAudits: AuditRecord[];
  getOrganizationById: (organizationId?: string) => Organization | undefined;
  getMentorById: (mentorId?: string) => Mentor | undefined;
  getStudentById: (studentId: string) => StudentProfile | undefined;
  getTaskTypeById: (taskTypeId: string) => TaskType | undefined;
  getBaseById: (baseId?: string) => StudyBase | undefined;
  getTeamById: (teamId: string) => Team | undefined;
  getBuilderTemplateById: (templateId: string) => TaskBuilderTemplate | undefined;
};

export type AdminStoreValue = {
  state: AdminConsoleState;
  hydrated: boolean;
  actions: AdminStoreActions;
  selectors: AdminStoreSelectors;
};

const STORE_KEY = 'yanxuebao_admin_console_state_v3';
const STORE_VERSION = 4;

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

function cloneState(state: AdminConsoleState) {
  return JSON.parse(JSON.stringify(state)) as AdminConsoleState;
}

function getInventorySummary(devices: Device[]) {
  return devices.reduce(
    (acc, device) => {
      if (device.status === '库存' || device.status === '库存-租赁') acc.stock += 1;
      if (device.status === '已销售') acc.onlineOrEnterprise += 1;
      if (device.status === '租赁中') acc.rental += 1;
      return acc;
    },
    { stock: 0, onlineOrEnterprise: 0, rental: 0 },
  );
}

function rebuildInventoryDaily(state: AdminConsoleState) {
  const summary = getInventorySummary(state.devices);
  const last = state.inventoryDaily[state.inventoryDaily.length - 1];
  const next: InventoryDaily = {
    id: uid('inventory-day'),
    date: nowDate(),
    openingStock: last?.closingStock ?? 120,
    inbound: 0,
    onlineOutbound: state.onlineSales.filter((item) => item.status !== '待发货').reduce((sum, item) => sum + item.quantity, 0),
    enterpriseOutbound: state.enterpriseSales.filter((item) => item.status === '已交付').reduce((sum, item) => sum + item.quantity, 0),
    rentalOutbound: state.rentalOrders.filter((item) => item.status === '已交付').reduce((sum, item) => sum + item.quantity, 0),
    rentalInbound: state.rentalOrders.filter((item) => item.status === '已回收').reduce((sum, item) => sum + item.quantity, 0),
    closingStock: summary.stock,
  };
  state.inventoryDaily = [...state.inventoryDaily.filter((item) => item.date !== next.date), next];
}

function addOperationLog(draft: AdminConsoleState, payload: Omit<OperationLog, 'id' | 'operatedAt'>) {
  draft.operationLogs.unshift({
    id: uid('oplog'),
    operatedAt: nowTime(),
    ...payload,
  });
}

function addUploadResult(
  draft: AdminConsoleState,
  payload: Omit<UploadResultRecord, 'id' | 'createdAt'>,
) {
  draft.uploadResults.unshift({
    id: uid('upload'),
    createdAt: nowTime(),
    ...payload,
  });
}

function findPaymentTarget(
  draft: AdminConsoleState,
  sourceType: '租赁订单' | '企业销售',
  orderId: string,
  paymentId: string,
) {
  const order =
    sourceType === '租赁订单'
      ? draft.rentalOrders.find((item) => item.id === orderId)
      : draft.enterpriseSales.find((item) => item.id === orderId);
  const payment = order?.payments.find((item) => item.id === paymentId);
  return { order, payment };
}

function seedOperationDailyRecords(): OperationDailyRecord[] {
  const rows = [
    ['2026-05-07', 88, 18, 2, 8, 2, 1, 1, 2280, 3, 398],
    ['2026-05-08', 126, 24, 4, 10, 3, 1, 2, 3490, 4, 796],
    ['2026-05-09', 270, 46, 6, 14, 4, 2, 1, 6280, 6, 199],
    ['2026-05-10', 248, 38, 5, 12, 2, 1, 2, 4198, 3, 598],
    ['2026-05-11', 92, 18, 3, 9, 1, 1, 1, 2198, 2, 199],
    ['2026-05-12', 66, 12, 2, 7, 1, 0, 1, 1099, 1, 199],
    ['2026-05-13', 38, 11, 3, 8, 1, 1, 0, 1998, 2, 0],
  ] as const;

  return rows.map(([date, pageViews, uniqueVisitors, newStudents, newParents, rentalDevices, soldDevices, courseOrders, saleAmount, orderCount, courseAmount]) => ({
    id: `daily-${date}`,
    date,
    pageViews,
    uniqueVisitors,
    newStudents,
    newParents,
    rentalDevices,
    soldDevices,
    courseOrders,
    saleAmount,
    courseAmount,
    visitors: uniqueVisitors,
    visitorRatio: Number(((uniqueVisitors / Math.max(pageViews, 1)) * 100).toFixed(2)),
    orderAmount: saleAmount + courseAmount,
    orderCount,
    registrations: newStudents + newParents,
  }));
}

function seedCapabilityElements(): CapabilityElement[] {
  const groups = [
    ['自主发展', '身心健康', ['身体运动', '心理健康', '人际交往']],
    ['自主发展', '自我管理', ['自主学习', '独立自主', '情绪管理']],
    ['自主发展', '问题解决', ['发现问题', '动手能力', '问题解决']],
    ['自主发展', '批判思维', ['批判性思维', '自我认知', '逻辑推理']],
    ['科技素养', '审美鉴赏', ['人文修养', '审美能力', '艺术鉴赏']],
    ['科技素养', '阅读表达', ['语言基础', '阅读理解', '表达能力']],
    ['科技素养', '科技素养', ['科学素养', '好奇心', '探究能力']],
    ['科技素养', '智能素养', ['数字素养', '提问能力', 'AI协同']],
    ['创新发展', '创新能力', ['创新思维', '想象力', '创新创业']],
    ['创新发展', '规划能力', ['跨学科融合', '资源整合', '生涯规划']],
    ['创新发展', '领导协作', ['领导能力', '协作能力', '适应能力']],
    ['创新发展', '商业思维', ['商业思维', '财商思维', '法律意识']],
    ['社会参与', '公民道德', ['尊重生命', '同理心', '诚信守信']],
    ['社会参与', '社会责任', ['劳动意识', '集体意识', '环境意识']],
    ['社会参与', '国家认同', ['民族精神', '政治觉悟', '家国情怀']],
    ['社会参与', '国际理解', ['国际视野', '发展共存', '尊重包容']],
  ] as const;

  return groups.flatMap(([plane, indicator, names]) =>
    names.map((name) => ({
      plane,
      indicator,
      name,
      description: `${indicator}下的${name}能力元素`,
    })),
  ).map((item, index) => ({
    id: `ce-${index + 1}`,
    ...item,
    enabled: true,
  }));
}

function buildSeedState(): AdminConsoleState {
  const capabilityElements = seedCapabilityElements();
  const organizations: Organization[] = [
    {
      id: 'org-1',
      type: '学校',
      name: '南山实验学校',
      contactName: '林主任',
      contactPhone: '13800138001',
      city: '深圳市-南山区',
      registeredAt: '2026-03-02',
      cooperationMode: '销售+租赁',
    },
    {
      id: 'org-2',
      type: '旅行社',
      name: '前海未来研学旅行社',
      contactName: '周经理',
      contactPhone: '13800138002',
      city: '深圳市-前海区',
      registeredAt: '2026-03-08',
      cooperationMode: '租赁',
    },
    {
      id: 'org-3',
      type: '景区',
      name: '华侨城生态探索基地',
      contactName: '郑老师',
      contactPhone: '13800138003',
      city: '深圳市-南山区',
      registeredAt: '2026-03-15',
      cooperationMode: '销售',
    },
  ];

  const mentors: Mentor[] = [
    {
      id: 'mentor-1',
      organizationId: 'org-1',
      name: '陈卓',
      phone: '13910020001',
      status: '启用',
      registeredAt: '2026-03-10',
      teamsLed: 4,
      taskCount: 27,
      participantCount: 186,
    },
    {
      id: 'mentor-2',
      organizationId: 'org-2',
      name: '王岚',
      phone: '13910020002',
      status: '启用',
      registeredAt: '2026-03-13',
      teamsLed: 6,
      taskCount: 41,
      participantCount: 268,
    },
    {
      id: 'mentor-3',
      organizationId: 'org-3',
      name: '刘洋',
      phone: '13910020003',
      status: '停用',
      registeredAt: '2026-03-18',
      teamsLed: 2,
      taskCount: 11,
      participantCount: 92,
    },
  ];

  const teams: Team[] = [
    {
      id: 'team-1',
      lineName: '海洋生态探索线',
      name: '南山七年级春季海洋研学',
      organizationId: 'org-1',
      mentorId: 'mentor-1',
      assistantPhones: ['13600000001', '13600000002'],
      startDate: '2026-04-18',
      days: 2,
      studentCount: 36,
      taskCount: 6,
      rentalDeviceCount: 40,
      assignmentStatus: '执行中',
      manualOps: 2,
    },
    {
      id: 'team-2',
      lineName: '城市科技发现线',
      name: '前海未来科技探索营',
      organizationId: 'org-2',
      mentorId: 'mentor-2',
      assistantPhones: ['13600000003'],
      startDate: '2026-04-22',
      days: 3,
      studentCount: 48,
      taskCount: 8,
      rentalDeviceCount: 50,
      assignmentStatus: '已安排',
      manualOps: 1,
    },
    {
      id: 'team-3',
      lineName: '城市公园自然线',
      name: '蛇口社区周末自然观察营',
      organizationId: 'org-3',
      startDate: '2026-04-30',
      days: 1,
      studentCount: 24,
      taskCount: 4,
      rentalDeviceCount: 0,
      assistantPhones: [],
      assignmentStatus: '未安排',
      manualOps: 0,
    },
  ];

  const teamTasks: TeamTask[] = [
    {
      id: 'task-1',
      teamId: 'team-1',
      name: '潮汐样本记录',
      status: '进行中',
      scope: '个人任务',
      source: 'manual',
      base: '深圳湾红树林生态观测站',
      taskType: '观察记录',
      points: 20,
      description: '沿潮间带样本区观察潮汐变化，记录不同时间点的水位、动植物活动和现场证据。',
      attachments: [{ id: 'task-1-attachment-1', name: '潮汐观察示例.pdf', kind: 'pdf', url: '#' }],
      requirements: [
        { id: 'task-1-req-1', type: 'image', requirement: '上传 3 张不同时间点的现场照片' },
        { id: 'task-1-req-2', type: 'text', requirement: '提交不少于 100 字的观察结论' },
      ],
      submittedCount: 31,
      totalCount: 36,
      mentorId: 'mentor-1',
      updatedAt: nowTime(),
    },
    {
      id: 'task-2',
      teamId: 'team-1',
      name: '贝类栖息点地图绘制',
      status: '已下发',
      scope: '小组任务',
      source: 'history',
      base: '深圳湾红树林生态观测站',
      taskType: '创作任务',
      points: 25,
      description: '小组协作绘制贝类栖息点分布图，标注位置、环境特征和观察证据。',
      attachments: [{ id: 'task-2-attachment-1', name: '分布图模板.jpg', kind: 'image', url: '#' }],
      requirements: [
        { id: 'task-2-req-1', type: 'image', requirement: '上传 1 张小组绘制的栖息点地图' },
        { id: 'task-2-req-2', type: 'text', requirement: '说明至少 3 个判断依据' },
      ],
      submittedCount: 5,
      totalCount: 6,
      mentorId: 'mentor-1',
      updatedAt: nowTime(),
    },
    {
      id: 'task-3',
      teamId: 'team-2',
      name: '城市科技设施调查',
      status: '创建中',
      scope: '个人任务',
      source: 'ai',
      base: '前海未来科技馆',
      taskType: '调查',
      points: 20,
      description: '调查场馆中的科技设施，记录其功能、使用场景和对城市生活的影响。',
      attachments: [],
      requirements: [
        { id: 'task-3-req-1', type: 'choice', requirement: '完成 8 道科技设施观察题' },
        { id: 'task-3-req-2', type: 'image', requirement: '上传 1 张设施照片' },
      ],
      submittedCount: 0,
      totalCount: 48,
      mentorId: 'mentor-2',
      updatedAt: nowTime(),
    },
  ];

  const teamTaskWorks: TeamTaskWork[] = [
    {
      id: 'work-1',
      taskId: 'task-1',
      teamId: 'team-1',
      ownerType: '学员',
      ownerName: '林知夏',
      title: '潮汐样本记录作品',
      submittedAt: '2026-04-19 15:20',
      status: '导师已评分',
      aiScore: 18,
      tutorScore: 19,
      preview: '记录了三个时间点的潮位变化，并补充贝类活动照片。',
      attachments: [
        { id: 'work-1-attachment-1', name: '潮汐照片-1.jpg', kind: 'image', url: '#' },
        { id: 'work-1-attachment-2', name: '观察结论.txt', kind: 'doc', url: '#' },
      ],
    },
    {
      id: 'work-2',
      taskId: 'task-1',
      teamId: 'team-1',
      ownerType: '学员',
      ownerName: '周沐辰',
      title: '潮间带观察记录',
      submittedAt: '2026-04-19 15:36',
      status: 'AI评分',
      aiScore: 17,
      preview: '照片完整，文字结论需要补充潮汐原因分析。',
      attachments: [{ id: 'work-2-attachment-1', name: '潮间带观察.jpg', kind: 'image', url: '#' }],
    },
    {
      id: 'work-3',
      taskId: 'task-2',
      teamId: 'team-1',
      ownerType: '小组',
      ownerName: '海风小队',
      title: '贝类栖息点地图',
      submittedAt: '2026-04-19 16:10',
      status: '已提交',
      preview: '小组提交了栖息点分布图和 3 条判断依据。',
      attachments: [{ id: 'work-3-attachment-1', name: '海风小队分布图.jpg', kind: 'image', url: '#' }],
    },
  ];

  const teamPhotos: TeamPhoto[] = [
    {
      id: 'photo-1',
      teamId: 'team-1',
      title: '博物馆入口合影',
      uploadedAt: '2026-04-19 10:20',
      status: '已关联',
      linkedStudentIds: ['student-1', 'student-2', 'student-3'],
      note: '入口合影已关联至 3 名学员成长日记',
      hidden: false,
    },
    {
      id: 'photo-2',
      teamId: 'team-1',
      title: '潮汐观察现场',
      uploadedAt: '2026-04-19 13:05',
      status: '待修正',
      linkedStudentIds: ['student-1'],
      note: '仍有 2 名学员待人工确认',
      hidden: false,
    },
  ];

  const bases: StudyBase[] = [
    {
      id: 'base-1',
      city: '深圳市-南山区',
      name: '深圳湾红树林生态观测站',
      type: '公园',
      address: '深圳市南山区滨海大道东段',
      servicePhone: '0755-26660001',
      groupReservationNeeded: true,
      bestStages: ['小学高段', '初中'],
      heat: 96,
      chargeType: '免费',
      reservationNeeded: true,
      audience: '四年级-九年级',
      openingHours: '09:00-18:00',
      approvalStatus: '已确认',
      createdBy: 'operator-001',
      createdByRole: 'operator',
      pois: [
        { id: 'poi-1', name: '候鸟观察台', location: '北门步道尽头', gps: '22.507,113.936' },
        { id: 'poi-2', name: '潮间带样本区', location: '生态观测站东侧', gps: '22.509,113.939' },
      ],
    },
    {
      id: 'base-2',
      city: '深圳市-南山区',
      name: '南山海洋文明展馆',
      type: '景区',
      address: '深圳市南山区后海大道 88 号',
      servicePhone: '0755-26660002',
      groupReservationNeeded: true,
      bestStages: ['小学低段', '小学高段', '初中'],
      heat: 84,
      chargeType: '收费',
      reservationNeeded: true,
      audience: '一年级-九年级',
      openingHours: '10:00-20:00',
      approvalStatus: '待审核',
      createdBy: 'maintainer-001',
      createdByRole: 'city_maintainer',
      pois: [{ id: 'poi-3', name: '航海历史长廊', location: '一层东厅', gps: '22.523,113.947' }],
    },
  ];

  const taskTypes: TaskType[] = [
    { id: 'type-1', name: '打卡', defaultRequirement: '完成指定点位记录与照片上传', defaultRule: '完成度 40% + 过程记录 60%' },
    { id: 'type-2', name: '问答', defaultRequirement: '回答问题并提交个人观点', defaultRule: '答案质量 70% + 表达清晰度 30%' },
    { id: 'type-3', name: '调查', defaultRequirement: '完成现场调查表与结论', defaultRule: '证据完整度 50% + 分析逻辑 50%' },
    { id: 'type-4', name: '创作', defaultRequirement: '提交图文或视频作品', defaultRule: '创意表现 60% + 主题贴合度 40%' },
  ];

  const taskLibrary: TaskLibraryItem[] = [
    {
      id: 'library-1',
      city: '深圳市-南山区',
      baseId: 'base-1',
      name: '潮汐变化观察日志',
      typeId: 'type-3',
      description: '结合潮汐时段观察生物活动，完成记录日志。',
      abilityTags: ['信息检索', '逻辑分析'],
      subjectTags: ['科学', '地理'],
      stageTags: ['小学高段', '初中'],
      applyTo: ['团体研学', '家庭研学'],
      approvalStatus: '已确认',
      createdBy: 'operator-001',
      createdByRole: 'operator',
      teamUseCount: 126,
      completionCount: 4380,
      workRequirements: ['观察日志', '样本照片'],
    },
    {
      id: 'library-2',
      city: '深圳市-南山区',
      baseId: 'base-2',
      name: '海洋文明主题导览采访',
      typeId: 'type-2',
      description: '围绕海洋文明主题设计问题并采访讲解员。',
      abilityTags: ['沟通表达', '问题发现'],
      subjectTags: ['历史', '语文'],
      stageTags: ['小学高段', '初中'],
      applyTo: ['团体研学'],
      approvalStatus: '待审核',
      createdBy: 'maintainer-001',
      createdByRole: 'city_maintainer',
      teamUseCount: 42,
      completionCount: 860,
      workRequirements: ['采访记录', '导览心得'],
    },
  ];

  const partTimers: PartTimer[] = [
    {
      id: 'maintainer-001',
      name: '李溪',
      account: 'city_nanshan',
      phone: '13700137001',
      cityIds: ['深圳市-南山区'],
      status: '启用',
      baseCount: 12,
      taskCount: 18,
      passedCount: 24,
    },
  ];

  const audits: AuditRecord[] = [
    {
      id: 'audit-1',
      targetType: '基地',
      targetId: 'base-2',
      city: '深圳市-南山区',
      title: '南山海洋文明展馆',
      maintainerId: 'maintainer-001',
      maintainerName: '李溪',
      submittedAt: '2026-04-18 18:00',
      status: '待审核',
      note: '已补充开放时间与预约说明',
    },
    {
      id: 'audit-2',
      targetType: '任务',
      targetId: 'library-2',
      city: '深圳市-南山区',
      title: '海洋文明主题导览采访',
      maintainerId: 'maintainer-001',
      maintainerName: '李溪',
      submittedAt: '2026-04-18 18:15',
      status: '待审核',
      note: '已新增适合学段标签',
    },
  ];

  const devices: Device[] = Array.from({ length: 30 }, (_, index) => ({
    id: `device-${index + 1}`,
    serialNumber: `YXB-SZ-2026-${String(index + 1).padStart(4, '0')}`,
    batch: index < 20 ? '2026A' : '2026B',
    model: 'YXB-A1',
    status: index < 8 ? '租赁中' : index < 12 ? '已销售' : index < 18 ? '库存-租赁' : '库存',
    lastAction: index < 8 ? '已绑定租赁订单' : index < 12 ? '已完成商城发货' : '待分配',
    warehouseId: index < 18 ? 'warehouse-1' : 'warehouse-2',
    lastMovementDate: index < 12 ? '2026-04-18' : '2026-05-08',
    rentalTimes: index < 8 ? 2 : 0,
    rentalDays: index < 8 ? 6 : 0,
  }));

  const rentalOrders: RentalOrder[] = [
    {
      id: 'rent-1',
      organizationId: 'org-1',
      contactName: '林主任',
      contactPhone: '13800138001',
      saleOwner: '唐瑞',
      createdAt: '2026-04-10 09:00',
      rentalDate: '2026-04-18',
      teamName: '南山七年级春季海洋研学',
      quantity: 40,
      days: 2,
      unitPrice: 69,
      totalAmount: 2760,
      paidAmount: 2200,
      status: '已交付',
      deviceSerials: devices.slice(0, 8).map((item) => item.serialNumber),
      payments: [
        {
          id: 'payment-1',
          amount: 2200,
          method: '转账',
          note: '首笔到账',
          createdAt: '2026-04-11 16:20',
          confirmationStatus: '已确认',
          voucherFile: '南山实验学校租赁首付款截图.png',
          recordedBy: '唐瑞',
          confirmedBy: '财务确认岗',
          confirmedAt: '2026-04-11 17:05',
        },
      ],
      note: '4 月 18 日上午完成现场交接',
    },
    {
      id: 'rent-2',
      organizationId: 'org-2',
      contactName: '周经理',
      contactPhone: '13800138002',
      saleOwner: '黄琛',
      createdAt: '2026-04-16 14:00',
      rentalDate: '2026-04-22',
      teamName: '前海未来科技探索营',
      quantity: 50,
      days: 3,
      unitPrice: 79,
      totalAmount: 3950,
      paidAmount: 3950,
      status: '已预订',
      deviceSerials: [],
      payments: [{
        id: 'payment-2',
        amount: 3950,
        method: '扫码',
        note: '全款预订',
        createdAt: '2026-04-16 14:30',
        confirmationStatus: '已确认',
        voucherFile: '前海探索营租赁收款凭证.png',
        recordedBy: '黄琛',
        confirmedBy: '财务确认岗',
        confirmedAt: '2026-04-16 15:10',
      }],
      note: '待出库并录入设备序列号',
    },
  ];

  const onlineSales: OnlineSaleOrder[] = [
    {
      id: 'sale-online-1',
      buyerName: '张女士',
      phone: '13800138011',
      orderDate: '2026-04-12',
      quantity: 2,
      paidAmount: 2198,
      status: '已发货',
      shippedAt: '2026-04-13 10:20',
      deviceSerials: devices.slice(8, 10).map((item) => item.serialNumber),
      receiver: '张女士',
      address: '深圳市南山区科技南十二路 8 号',
      expressCompany: '顺丰',
      expressNo: 'SF1234567890',
    },
    {
      id: 'sale-online-2',
      buyerName: '陈先生',
      phone: '13800138012',
      orderDate: '2026-04-19',
      quantity: 1,
      paidAmount: 1099,
      status: '待发货',
      deviceSerials: [],
      receiver: '陈先生',
      address: '深圳市宝安区新安一路 58 号',
    },
  ];

  const enterpriseSales: EnterpriseSaleOrder[] = [
    {
      id: 'sale-enterprise-1',
      customerType: '合作机构',
      customerName: '华侨城生态探索基地',
      saleDate: '2026-04-09',
      quantity: 3,
      unitPrice: 999,
      totalAmount: 2997,
      paidAmount: 0,
      contactName: '郑老师',
      contactPhone: '13800138003',
      saleOwner: '唐瑞',
      status: '已交付',
      deviceSerials: devices.slice(10, 12).map((item) => item.serialNumber),
      payments: [{
        id: 'payment-3',
        amount: 1997,
        method: '转账',
        note: '首付款',
        createdAt: '2026-04-09 11:20',
        confirmationStatus: '待确认',
        voucherFile: '企业转账截图.png',
        recordedBy: '唐瑞',
      }],
    },
  ];

  const inventoryDaily: InventoryDaily[] = [
    {
      id: 'inventory-day-1',
      date: '2026-04-18',
      openingStock: 24,
      inbound: 0,
      onlineOutbound: 2,
      enterpriseOutbound: 2,
      rentalOutbound: 8,
      rentalInbound: 0,
      closingStock: 18,
    },
  ];

  const students: StudentProfile[] = [
    {
      id: 'student-1',
      name: '林知夏',
      age: 13,
      city: '深圳市',
      school: '南山实验学校',
      className: '七年级 2 班',
      parentName: '林女士',
      parentPhone: '13800138111',
      registeredAt: '2026-03-22',
      boundDevice: true,
      boundAt: '2026-03-23',
      studyCount: 6,
      capabilityScore: 8.7,
      growthValue: 2160,
      diaryCount: 18,
      capabilityPlaneScores: {
        领导执行: 8.8,
        创新创造: 9.1,
        认知成长: 8.5,
        社会适应: 8.4,
      },
      studyRecords: [
        { id: 'study-1', date: '2026-04-19', type: '团体研学', teamName: '南山七年级春季海洋研学', completedTasks: 5, score: 92, rating: 'A' },
        { id: 'study-2', date: '2026-04-03', type: '家庭研学', teamName: '周末海边观察计划', completedTasks: 3, score: 88, rating: 'A-' },
      ],
      taskRecords: [
        { id: 'st-task-1', taskName: '潮汐变化观察日志', date: '2026-04-19', score: 91, rating: '五星' },
        { id: 'st-task-2', taskName: '海洋文明采访卡', date: '2026-04-08', score: 85, rating: '四星' },
      ],
      growthRecords: [
        { id: 'growth-1', date: '2026-04-19', type: '收入', source: '团体研学任务', delta: 100, balance: 2160 },
        { id: 'growth-2', date: '2026-04-10', type: '收入', source: 'AI 创作', delta: 10, balance: 2060 },
      ],
      capabilityRecords: [
        { id: 'cap-1', changedAt: '2026-04-19 18:20', element: '问题发现', source: '研学评价', oldValue: 8.4, newValue: 8.9 },
        { id: 'cap-2', changedAt: '2026-04-05 20:00', element: '沟通表达', source: '家长评测', oldValue: 8.0, newValue: 8.4 },
      ],
      assessments: [
        { id: 'assessment-1', type: '学员自测', createdAt: '2026-03-25 19:00', score: 84, summary: '对问题发现与成果表达表现较强' },
        { id: 'assessment-2', type: '家长评测', createdAt: '2026-04-05 20:00', score: 86, summary: '社交表达有明显提升' },
      ],
    },
    {
      id: 'student-2',
      name: '周沐辰',
      age: 12,
      city: '深圳市',
      school: '南山实验学校',
      className: '六年级 4 班',
      parentName: '周先生',
      parentPhone: '13800138112',
      registeredAt: '2026-03-28',
      boundDevice: true,
      boundAt: '2026-03-30',
      studyCount: 4,
      capabilityScore: 8.1,
      growthValue: 1740,
      diaryCount: 12,
      capabilityPlaneScores: {
        领导执行: 8.2,
        创新创造: 8.0,
        认知成长: 8.4,
        社会适应: 7.9,
      },
      studyRecords: [
        { id: 'study-3', date: '2026-04-19', type: '团体研学', teamName: '南山七年级春季海洋研学', completedTasks: 4, score: 86, rating: 'A-' },
      ],
      taskRecords: [{ id: 'st-task-3', taskName: '潮汐变化观察日志', date: '2026-04-19', score: 86, rating: '四星' }],
      growthRecords: [{ id: 'growth-3', date: '2026-04-19', type: '收入', source: '团体研学任务', delta: 100, balance: 1740 }],
      capabilityRecords: [{ id: 'cap-3', changedAt: '2026-04-19 18:20', element: '逻辑分析', source: '研学评价', oldValue: 7.9, newValue: 8.4 }],
      assessments: [{ id: 'assessment-3', type: '学员自测', createdAt: '2026-03-30 20:00', score: 80, summary: '认知成长维度表现稳定' }],
    },
  ];

  const sosAlerts: SosAlert[] = [
    {
      id: 'sos-1',
      studentId: 'student-1',
      studentName: '林知夏',
      raisedAt: '2026-04-19 16:35',
      location: '深圳湾红树林生态观测站东侧样本区',
      audioSummary: '现场环境嘈杂，学员请求导师协助集合',
      status: '已联系',
      note: '助理老师已抵达现场处理',
    },
    {
      id: 'sos-2',
      studentId: 'student-2',
      studentName: '周沐辰',
      raisedAt: '2026-04-20 10:15',
      location: '南山海洋文明展馆出口',
      audioSummary: '学员与小组暂时走散，已发送位置',
      status: '未处理',
      note: '',
    },
  ];

  const courses: CourseRecord[] = [
    { id: 'course-1', title: '海洋文明启蒙课', expertName: '杨舟教授', type: '线上课程', price: 199, status: '已上架', sales: 128, views: 1520, studentCount: 96 },
    { id: 'course-2', title: '城市观察营实地工作坊', expertName: '杜老师', type: '线下课程', price: 499, status: '审核中', sales: 0, views: 266, studentCount: 0 },
  ];

  const qaRecords: QaRecord[] = [
    { id: 'qa-1', askedAt: '2026-04-18 20:10', studentName: '林知夏', agentName: '海洋探索助手', summary: '潮汐对红树林生物分布的影响', matchedKnowledge: false, status: '待补充' },
    { id: 'qa-2', askedAt: '2026-04-19 18:45', studentName: '周沐辰', agentName: '科技发现助手', summary: '城市桥梁抗风结构原理', matchedKnowledge: true, status: '已补充' },
  ];

  const knowledge: KnowledgeItem[] = [
    { id: 'knowledge-1', title: '红树林生态观察指南', category: '知识条目', updatedAt: '2026-04-16 09:00', status: '已发布' },
    { id: 'knowledge-2', title: '深圳湾候鸟迁徙资讯周报', category: '资讯', updatedAt: '2026-04-18 08:00', status: '已发布' },
    { id: 'knowledge-3', title: '海平面变化对沿海城市的挑战', category: '难题挑战', updatedAt: '2026-04-14 11:00', status: '草稿' },
  ];

  const agents: AgentRecord[] = [
    { id: 'agent-1', name: '海洋探索助手', expertName: '杨舟教授', organizationName: '海洋文明研究社', phone: '13920030001', category: '生态', bailianAccount: 'bailian-ocean-001', firstOnlineAt: '2026-04-12', style: '鼓励型', onlineStatus: '已上架', users: 1380, questions: 5280, orders: 68, pendingWorks: 5, knowledgeIds: ['knowledge-1', 'knowledge-2'] },
    { id: 'agent-2', name: '科技发现助手', expertName: '杜老师', organizationName: '城市科技实验室', phone: '13920030002', category: '科技', bailianAccount: 'bailian-tech-002', firstOnlineAt: '2026-04-20', style: '严谨', onlineStatus: '审核中', users: 620, questions: 2110, orders: 22, pendingWorks: 2, knowledgeIds: ['knowledge-3'] },
  ];

  const capabilityMappings: CapabilityMapping[] = [
    {
      id: 'mapping-1',
      organizationIds: ['org-1'],
      indicator: '课堂汇报表现',
      formulaItems: [
        { elementId: 'ce-6', weight: 40 },
        { elementId: 'ce-18', weight: 35 },
        { elementId: 'ce-33', weight: 25 },
      ],
    },
    {
      id: 'mapping-2',
      organizationIds: ['org-3'],
      indicator: '现场观察记录',
      formulaItems: [
        { elementId: 'ce-7', weight: 45 },
        { elementId: 'ce-21', weight: 35 },
        { elementId: 'ce-22', weight: 20 },
      ],
    },
  ];

  const questionBank: QuestionBankItem[] = [
    { id: 'question-1', category: '学员自测', type: '单选', title: '遇到陌生任务时你通常如何开始？', element: '自主学习', answer: '先观察目标并拆解步骤', scoringStandard: '能说明目标拆解和行动顺序得高分', status: '启用' },
    { id: 'question-2', category: '家长评测', type: '判断', title: '孩子愿意在活动后主动复盘自己的完成情况。', element: '自我认知', answer: '是', scoringStandard: '结合频次和主动性评分', status: '启用' },
    { id: 'question-3', category: '天赋测试', type: 'AI问答', title: '请描述一次你主动解决复杂问题的经历。', element: '问题解决', answer: '开放式回答', scoringStandard: '从问题识别、行动策略、复盘表达三个维度评分', status: '创建中' },
  ];

  const growthRules: GrowthRule[] = [
    { id: 'rule-1', scene: '团体研学任务', value: 100 },
    { id: 'rule-2', scene: '家庭研学任务', value: 50 },
    { id: 'rule-3', scene: 'AI 创作', value: 10 },
  ];

  const growthGoods: GrowthGood[] = [
    { id: 'good-1', name: '海洋探索徽章套装', type: '实物', cost: 320, stock: 80, exchanged: 26, status: '上架' },
    { id: 'good-2', name: '线上专家答疑券', type: '虚拟', cost: 680, stock: 999, exchanged: 42, status: '上架' },
  ];

  const assessmentSettings: AssessmentSetting[] = [
    { id: 'setting-1', label: '6 岁以下学员自测', durationMinutes: 10, limitMode: '双限时', perQuestionSeconds: 90 },
    { id: 'setting-2', label: '6-9 岁学员自测', durationMinutes: 15, limitMode: '每题限时', perQuestionSeconds: 120 },
    { id: 'setting-3', label: '10-12 岁学员自测', durationMinutes: 20, limitMode: '双限时', perQuestionSeconds: 150 },
    { id: 'setting-4', label: '13-15 岁学员自测', durationMinutes: 25, limitMode: '整场限时', perQuestionSeconds: 180 },
    { id: 'setting-5', label: '家长评测', durationMinutes: 20, limitMode: '整场限时', perQuestionSeconds: 0 },
  ];

  const importJobs: ImportTaskJob[] = [
    {
      id: 'job-1',
      title: '南山区生态基地批量导入',
      sourceType: 'Excel导入',
      status: '待确认',
      createdAt: '2026-04-17 15:10',
      result: '识别到 18 条基地记录，待确认 2 条地址异常',
      successTasks: [
        { name: '潮汐变化观察日志', baseName: '深圳湾红树林生态观测站', status: '待审核' },
        { name: '候鸟迁徙记录卡', baseName: '深圳湾红树林生态观测站', status: '待审核' },
      ],
      failedTasks: [
        { name: '海岸垃圾分类调查', missingFields: ['任务分值', '作品要求'], status: '待补充' },
        { name: '航海文明访谈', missingFields: ['适合学段'], status: '待补充' },
      ],
    },
    {
      id: 'job-2',
      title: '海洋主题任务文档解析',
      sourceType: '文档解析',
      status: '解析中',
      createdAt: '2026-04-20 09:25',
      result: '正在提取任务说明、能力标签与评分规则',
      successTasks: [{ name: '海洋文明导览采访', baseName: '南山海洋文明展馆', status: '待审核' }],
      failedTasks: [{ name: '海洋文物速写', missingFields: ['评分规则'], status: '待补充' }],
    },
  ];

  const builderTemplates: TaskBuilderTemplate[] = [
    {
      id: 'builder-1',
      title: '海洋生态现场观察任务卡',
      taskTypeId: 'type-3',
      abilityTags: ['问题发现', '逻辑分析'],
      blocks: [
        { id: 'block-1', type: '封面', content: '海洋生态现场观察任务卡' },
        { id: 'block-2', type: '任务说明', content: '沿指定路线完成样本观察，并记录关键发现。' },
        { id: 'block-3', type: '作品要求', content: '上传 3 张样本照片和 1 段观察结论。' },
        { id: 'block-4', type: '能力标签', content: '问题发现、逻辑分析' },
        { id: 'block-5', type: '评分规则', content: '证据完整度 50%，观察结论 50%。' },
      ],
    },
  ];

  const erasureRecords: ErasureRecord[] = [
    { id: 'erase-1', orderId: 'rent-1', serialNumber: 'YXB-SZ-2026-0001', createdAt: '2026-04-20 19:00', status: '待执行' },
  ];

  const operationDailyRecords = seedOperationDailyRecords();

  const warehouses: WarehouseRecord[] = [
    { id: 'warehouse-1', name: '深圳南山分仓', province: '广东省', city: '深圳市', manager: '库管-许晴', stock: 18, rentalStock: 12 },
    { id: 'warehouse-2', name: '广州天河分仓', province: '广东省', city: '广州市', manager: '库管-陈立', stock: 12, rentalStock: 8 },
  ];

  const contracts: ContractRecord[] = [
    { id: 'contract-1', organizationId: 'org-1', title: '南山实验学校研学合作协议', fileName: '南山实验学校研学合作协议.pdf', uploadedAt: '2026-03-05 10:20', status: '生效中' },
    { id: 'contract-2', organizationId: 'org-2', title: '前海未来研学旅行社租赁协议', fileName: '前海未来研学旅行社租赁协议.pdf', uploadedAt: '2026-03-10 14:30', status: '即将到期' },
  ];

  const attachments: AttachmentRecord[] = [
    { id: 'attachment-1', ownerType: '租赁订单', ownerId: 'rent-1', fileName: '租赁交付设备清单.xlsx', uploadedAt: '2026-04-18 09:40', note: '库管上传交付清单' },
    { id: 'attachment-2', ownerType: '企业销售', ownerId: 'sale-enterprise-1', fileName: '企业转账截图.png', uploadedAt: '2026-04-09 11:30', note: '销售上传收款凭证' },
  ];

  const uploadResults: UploadResultRecord[] = [
    { id: 'upload-1', feature: '租赁设备批次', target: 'rent-1', fileName: '租赁交付设备清单.xlsx', batchNo: 'CK-20260418-001', successCount: 8, failedCount: 0, failedFields: [], createdAt: '2026-04-18 09:40', operatorRole: '库管人员' },
    { id: 'upload-2', feature: '企业收款凭证', target: 'sale-enterprise-1', fileName: '企业转账截图.png', batchNo: 'VOUCHER-20260409-001', successCount: 1, failedCount: 0, failedFields: [], createdAt: '2026-04-09 11:30', operatorRole: '销售人员' },
  ];

  const rentalDeviceBatches: RentalDeviceBatch[] = [
    { id: 'rental-batch-1', orderId: 'rent-1', batchNo: 'CK-20260418-001', fileName: '租赁交付设备清单.xlsx', quantity: 8, failedCount: 0, deviceSerials: devices.slice(0, 8).map((item) => item.serialNumber), importedAt: '2026-04-18 09:40', status: '已出库' },
  ];

  const operationLogs: OperationLog[] = [
    { id: 'oplog-1', role: '运营管理员', operatorName: '运营总控台', feature: '数据审核', target: '南山海洋文明展馆', content: '查看基地审核资料', result: '成功', operatedAt: '2026-05-13 10:20' },
    { id: 'oplog-2', role: '财务人员', operatorName: '财务确认岗', feature: '到账确认', target: '企业销售 sale-enterprise-1', content: '核对企业转账凭证', result: '待确认', operatedAt: '2026-05-13 11:05' },
    { id: 'oplog-3', role: '库管人员', operatorName: '深圳南山分仓', feature: '设备出库', target: '租赁订单 rent-1', content: '导入设备交付清单', result: '成功', operatedAt: '2026-05-13 14:30' },
  ];

  const masterAgentSettings: MasterAgentSettings = {
    id: 'master-agent-1',
    agentName: '研学宝主控智能体',
    knowledgeIds: ['knowledge-1', 'knowledge-2'],
    pushTaskRule: '根据学员最近一次研学主题，在活动后 24 小时内推送 1 个复盘小任务。',
    onboardingTaskRule: '新学员首次登录后推送设备绑定、能力自测、家庭观察任务三步引导。',
    updatedAt: '2026-05-13 15:00',
  };

  return {
    version: STORE_VERSION,
    demoRole: 'operator',
    operationDailyRecords,
    warehouses,
    contracts,
    attachments,
    uploadResults,
    rentalDeviceBatches,
    operationLogs,
    masterAgentSettings,
    organizations,
    mentors,
    teams,
    teamTasks,
    teamTaskWorks,
    teamPhotos,
    bases,
    taskTypes,
    taskLibrary,
    partTimers,
    audits,
    devices,
    rentalOrders,
    onlineSales,
    enterpriseSales,
    inventoryDaily,
    students,
    sosAlerts,
    courses,
    qaRecords,
    knowledge,
    agents,
    capabilityElements,
    capabilityMappings,
    questionBank,
    growthRules,
    growthGoods,
    assessmentSettings,
    importJobs,
    builderTemplates,
    erasureRecords,
  };
}

export function useAdminStore() {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error('AdminStoreProvider is missing');
  }
  return context;
}

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AdminConsoleState>(buildSeedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AdminConsoleState;
        if (parsed.version === STORE_VERSION) {
          setState(parsed);
        } else {
          setState(buildSeedState());
        }
      }
    } catch {
      setState(buildSeedState());
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    }
  }, [hydrated, state]);

  function mutate(recipe: (draft: AdminConsoleState) => void) {
    setState((current) => {
      const draft = cloneState(current);
      recipe(draft);
      rebuildInventoryDaily(draft);
      return draft;
    });
  }

  const value = useMemo<AdminStoreValue>(() => {
    const pendingTaskAudits = state.taskLibrary.filter((item) => item.approvalStatus === '待审核').length;
    const pendingTeamAssignments = state.teams.filter((item) => item.assignmentStatus === '未安排').length;
    const pendingShipments = state.onlineSales.filter((item) => item.status === '待发货').length;
    const refundOrders = state.onlineSales.filter((item) => item.status === '退款中' || item.status === '已退款').length;
    const pendingRentalDeliveries = state.rentalOrders.filter((item) => item.status === '已预订').length;
    const pendingPayments =
      state.enterpriseSales.reduce((sum, item) => sum + item.payments.filter((payment) => payment.confirmationStatus === '待确认').length, 0) +
      state.rentalOrders.reduce((sum, item) => sum + item.payments.filter((payment) => payment.confirmationStatus === '待确认').length, 0);
    const pendingWorks = state.agents.reduce((sum, item) => sum + (item.pendingWorks ?? 0), 0);
    const totalOrderCount = state.onlineSales.length + state.enterpriseSales.length + state.rentalOrders.length;
    const totalOrderAmount =
      state.onlineSales.reduce((sum, item) => sum + item.paidAmount, 0) +
      state.enterpriseSales.reduce((sum, item) => sum + item.paidAmount, 0) +
      state.rentalOrders.reduce((sum, item) => sum + item.paidAmount, 0);

    const selectors: AdminStoreSelectors = {
      dashboard: {
        totalDevices: state.devices.length,
        onlineDevices: state.devices.filter((item) => item.status === '租赁中' || item.status === '已销售').length,
        studentCount: state.students.length,
        parentCount: new Set(state.students.map((item) => item.parentPhone)).size,
        todayActiveStudents: state.teamTasks.reduce((sum, item) => sum + Math.min(item.submittedCount, item.totalCount), 0),
        totalTasks: state.teamTasks.length,
        finishedTasks: state.teamTasks.filter((item) => item.status === '已结束').length,
        teamCount: state.teams.length,
        baseCount: state.bases.length,
        taskLibraryCount: state.taskLibrary.length,
        organizationCount: state.organizations.length,
        mentorCount: state.mentors.length,
        pendingTodos: [
          { key: 'pending-task', title: '待审核任务', value: pendingTaskAudits, href: '/task-library?approvalStatus=待审核' },
          { key: 'pending-team', title: '待安排团队', value: pendingTeamAssignments, href: '/team-assignments?assignmentStatus=未安排' },
          { key: 'pending-shipment', title: '待发货订单', value: pendingShipments, href: '/sales-online?status=待发货' },
          { key: 'pending-refund', title: '待退款申请', value: refundOrders, href: '/sales-online?status=退款中' },
          { key: 'pending-delivery', title: '待配送订单', value: pendingRentalDeliveries, href: '/rental-orders?status=已预订' },
          { key: 'pending-payment', title: '待到账确认', value: pendingPayments, href: '/finance-confirmations' },
          { key: 'pending-audit', title: '待审核数据', value: state.audits.filter((item) => item.status === '待审核').length, href: '/audits?status=待审核' },
          { key: 'pending-work', title: '待审核作品', value: pendingWorks, href: '/agents?onlineStatus=审核中' },
        ],
        operationStats: [
          { label: '销售中线路', value: state.taskLibrary.filter((item) => item.approvalStatus === '已确认').length },
          { label: '销售中团队', value: state.teams.filter((item) => item.assignmentStatus !== '已结束').length },
          { label: '退款中订单', value: refundOrders },
          { label: '候补中订单', value: state.rentalOrders.filter((item) => item.status === '意向').length },
          { label: '线路待审核', value: pendingTaskAudits },
          { label: '达人待审核', value: state.agents.filter((item) => item.onlineStatus === '审核中').length },
          { label: '提现待审核', value: pendingPayments },
          { label: '达人总数量', value: state.agents.length },
        ],
        terminalStats: [
          { label: '微信小程序', value: 48, color: '#5470c6' },
          { label: '微信公众号', value: 18, color: '#91cc75' },
          { label: 'H5 网页', value: 16, color: '#fac858' },
          { label: '苹果 App', value: 10, color: '#ee6666' },
          { label: '安卓 App', value: 8, color: '#73c0de' },
        ],
        funnel: {
          visitors: state.operationDailyRecords.reduce((sum, item) => sum + item.uniqueVisitors, 0),
          orders: totalOrderCount,
          customers: state.onlineSales.filter((item) => item.status !== '退款中' && item.status !== '已退款').length + state.enterpriseSales.length,
        },
        trends: state.operationDailyRecords.map((item) => ({
          date: item.date,
          newStudents: item.newStudents,
          rentalDevices: item.rentalDevices,
          soldDevices: item.soldDevices,
          courseOrders: item.courseOrders,
          visitors: item.visitors,
          visitorRatio: item.visitorRatio,
          orderAmount: item.orderAmount || totalOrderAmount / Math.max(state.operationDailyRecords.length, 1),
          orderCount: item.orderCount,
          registrations: item.registrations,
        })),
        dailyRecords: state.operationDailyRecords,
      },
      pendingAudits: state.audits.filter((item) => item.status === '待审核'),
      getOrganizationById: (organizationId) => state.organizations.find((item) => item.id === organizationId),
      getMentorById: (mentorId) => state.mentors.find((item) => item.id === mentorId),
      getStudentById: (studentId) => state.students.find((item) => item.id === studentId),
      getTaskTypeById: (taskTypeId) => state.taskTypes.find((item) => item.id === taskTypeId),
      getBaseById: (baseId) => state.bases.find((item) => item.id === baseId),
      getTeamById: (teamId) => state.teams.find((item) => item.id === teamId),
      getBuilderTemplateById: (templateId) => state.builderTemplates.find((item) => item.id === templateId),
    };

    const actions: AdminStoreActions = {
      resetSeed: () => setState(buildSeedState()),
      setDemoRole: (role) =>
        mutate((draft) => {
          draft.demoRole = role;
        }),
      saveOrganization: (payload, organizationId) =>
        mutate((draft) => {
          if (organizationId) {
            const found = draft.organizations.find((item) => item.id === organizationId);
            if (found) {
              Object.assign(found, payload);
            }
            return;
          }

          draft.organizations.unshift({
            id: uid('org'),
            registeredAt: nowDate(),
            ...payload,
          });
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '合作机构',
            target: payload.name,
            content: organizationId ? '更新机构台账' : '新增机构台账',
            result: '成功',
          });
        }),
      saveMentor: (payload, mentorId) =>
        mutate((draft) => {
          if (mentorId) {
            const found = draft.mentors.find((item) => item.id === mentorId);
            if (found) {
              Object.assign(found, payload);
            }
            return;
          }

          draft.mentors.unshift({
            id: uid('mentor'),
            registeredAt: nowDate(),
            ...payload,
          });
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '研学导师',
            target: payload.name,
            content: mentorId ? '更新导师账号' : '新增导师账号',
            result: '成功',
          });
        }),
      batchImportMentors: (organizationId, fileName) =>
        mutate((draft) => {
          const organization = draft.organizations.find((item) => item.id === organizationId);
          const names = ['赵一鸣', '孙若溪', '吴晨曦', '何嘉禾'];
          names.forEach((name, index) => {
            draft.mentors.unshift({
              id: uid('mentor'),
              organizationId,
              name,
              phone: `13988${String(draft.mentors.length + index + 1).padStart(6, '0')}`,
              status: '未激活',
              registeredAt: nowDate(),
              teamsLed: 0,
              taskCount: 0,
              participantCount: 0,
            });
          });
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '研学导师',
            target: organization?.name ?? organizationId,
            content: `上传 ${fileName} 并批量开通 ${names.length} 个未激活导师账号`,
            result: '成功',
          });
        }),
      assignMentor: (teamId, mentorId, assistantPhones) =>
        mutate((draft) => {
          const team = draft.teams.find((item) => item.id === teamId);
          if (!team) return;
          team.mentorId = mentorId;
          team.assistantPhones = assistantPhones;
          team.assignmentStatus = team.assignmentStatus === '未安排' ? '已安排' : team.assignmentStatus;
          draft.teamTasks.forEach((task) => {
            if (task.teamId === teamId) {
              task.mentorId = mentorId;
            }
          });
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '团队安排',
            target: team.name,
            content: '变更团队负责人导师',
            result: '成功',
          });
        }),
      saveTeamTask: (payload, taskId) =>
        mutate((draft) => {
          const team = draft.teams.find((item) => item.id === payload.teamId);
          if (!team) return;

          if (taskId) {
            const found = draft.teamTasks.find((item) => item.id === taskId);
            if (found) {
              Object.assign(found, payload, { updatedAt: nowTime() });
            }
          } else {
            draft.teamTasks.unshift({
              id: uid('task'),
              updatedAt: nowTime(),
              ...payload,
            });
            team.taskCount += 1;
          }
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '团队任务',
            target: payload.name,
            content: taskId ? '编辑团队任务' : '新增团队任务',
            result: '成功',
          });
        }),
      copyTeamTasksFromHistory: (targetTeamId, sourceTeamId, taskIds) =>
        mutate((draft) => {
          const targetTeam = draft.teams.find((item) => item.id === targetTeamId);
          const sourceTeam = draft.teams.find((item) => item.id === sourceTeamId);
          if (!targetTeam || !sourceTeam) return;
          const sourceTasks = draft.teamTasks.filter((item) => taskIds.includes(item.id));
          sourceTasks.forEach((task) => {
            draft.teamTasks.unshift({
              ...task,
              id: uid('task'),
              teamId: targetTeamId,
              mentorId: targetTeam.mentorId,
              source: 'history',
              status: '创建中',
              submittedCount: 0,
              totalCount: targetTeam.studentCount,
              updatedAt: nowTime(),
            });
          });
          targetTeam.taskCount += sourceTasks.length;
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '团队任务',
            target: targetTeam.name,
            content: `从 ${sourceTeam.name} 复制 ${sourceTasks.length} 个任务`,
            result: sourceTasks.length > 0 ? '成功' : '待确认',
          });
        }),
      createAiTeamTasks: (targetTeamId) =>
        mutate((draft) => {
          const team = draft.teams.find((item) => item.id === targetTeamId);
          if (!team) return;
          const baseName = draft.bases[0]?.name ?? '研学基地';
          const task: TeamTask = {
            id: uid('task'),
            teamId: targetTeamId,
            name: `${team.lineName}AI观察挑战`,
            status: '创建中',
            scope: '个人任务',
            source: 'ai',
            base: baseName,
            taskType: 'AI探究',
            points: 20,
            description: 'AI 根据团队线路自动生成的任务草稿，请运营确认任务说明、作品要求与能力标签后下发。',
            attachments: [{ id: uid('attachment'), name: 'AI任务生成说明.docx', kind: 'doc', url: '#' }],
            requirements: [
              { id: uid('req'), type: 'text', requirement: '回答 AI 追问并提交 80 字观察说明' },
              { id: uid('req'), type: 'image', requirement: '上传 1 张现场证据照片' },
            ],
            submittedCount: 0,
            totalCount: team.studentCount,
            mentorId: team.mentorId,
            updatedAt: nowTime(),
          };
          draft.teamTasks.unshift(task);
          team.taskCount += 1;
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '团队任务',
            target: team.name,
            content: 'AI 创建团队任务草稿',
            result: '待确认',
          });
        }),
      importTeamTasksFromDocument: (targetTeamId, fileName) =>
        mutate((draft) => {
          const team = draft.teams.find((item) => item.id === targetTeamId);
          if (!team) return;
          const importedTasks: TeamTask[] = [
            {
              id: uid('task'),
              teamId: targetTeamId,
              name: `${team.lineName}文档导入任务`,
              status: '创建中',
              scope: '小组任务',
              source: 'document',
              base: draft.bases[1]?.name ?? draft.bases[0]?.name ?? '研学基地',
              taskType: '文档导入',
              points: 25,
              description: `从 ${fileName} 解析生成，需人工确认字段完整性后下发。`,
              attachments: [{ id: uid('attachment'), name: fileName, kind: fileName.endsWith('.pdf') ? 'pdf' : 'doc', url: '#' }],
              requirements: [
                { id: uid('req'), type: 'image', requirement: '上传小组成果图片' },
                { id: uid('req'), type: 'text', requirement: '补充 120 字任务总结' },
              ],
              submittedCount: 0,
              totalCount: Math.max(1, Math.ceil(team.studentCount / 6)),
              mentorId: team.mentorId,
              updatedAt: nowTime(),
            },
          ];
          draft.teamTasks.unshift(...importedTasks);
          team.taskCount += importedTasks.length;
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '团队任务',
            target: team.name,
            content: `从 ${fileName} 导入 ${importedTasks.length} 个任务`,
            result: '待确认',
          });
        }),
      savePhotoLinks: (photoId, linkedStudentIds, status, note) =>
        mutate((draft) => {
          const photo = draft.teamPhotos.find((item) => item.id === photoId);
          if (!photo) return;
          photo.linkedStudentIds = linkedStudentIds;
          photo.status = status;
          photo.note = note;
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '团队照片',
            target: photo.title,
            content: `修正照片关联结果为${status}`,
            result: '成功',
          });
        }),
      batchUploadTeamPhotos: (teamId, fileNames) =>
        mutate((draft) => {
          const team = draft.teams.find((item) => item.id === teamId);
          if (!team) return;
          const existingCount = draft.teamPhotos.filter((item) => item.teamId === teamId).length;
          fileNames.forEach((fileName, index) => {
            draft.teamPhotos.unshift({
              id: uid('photo'),
              teamId,
              title: `${team.id}-${String(existingCount + index + 1).padStart(3, '0')}`,
              uploadedAt: nowTime(),
              status: '识别中',
              linkedStudentIds: [],
              note: `源文件：${fileName}`,
              hidden: false,
            });
          });
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '团队照片',
            target: team.name,
            content: `批量上传 ${fileNames.length} 张照片并自动生成照片名`,
            result: fileNames.length > 0 ? '成功' : '待确认',
          });
        }),
      toggleTeamPhotoHidden: (photoId) =>
        mutate((draft) => {
          const photo = draft.teamPhotos.find((item) => item.id === photoId);
          if (!photo) return;
          photo.hidden = !photo.hidden;
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '团队照片',
            target: photo.title,
            content: photo.hidden ? '屏蔽团队照片' : '取消屏蔽团队照片',
            result: '成功',
          });
        }),
      saveBase: (payload, role, editorId, baseId) =>
        mutate((draft) => {
          let base = baseId ? draft.bases.find((item) => item.id === baseId) : undefined;
          const approvalStatus: AuditStatus = role === 'city_maintainer' ? '待审核' : '已确认';
          if (base) {
            Object.assign(base, payload, { approvalStatus });
          } else {
            base = {
              id: uid('base'),
              heat: 60,
              approvalStatus,
              ...payload,
            };
            draft.bases.unshift(base);
          }

          if (role === 'city_maintainer') {
            const existing = draft.audits.find((item) => item.targetType === '基地' && item.targetId === base!.id);
            const maintainer = draft.partTimers.find((item) => item.id === editorId);
            if (maintainer && !baseId) {
              maintainer.baseCount += 1;
            }
            if (existing) {
              existing.status = '待审核';
              existing.note = '维护信息已更新，等待审核';
              existing.submittedAt = nowTime();
            } else if (maintainer) {
              draft.audits.unshift({
                id: uid('audit'),
                targetType: '基地',
                targetId: base!.id,
                city: payload.city,
                title: payload.name,
                maintainerId: editorId,
                maintainerName: maintainer.name,
                submittedAt: nowTime(),
                status: '待审核',
                note: '提交基地维护数据',
              });
            }
          }
          addOperationLog(draft, {
            role: role === 'city_maintainer' ? '兼职维护员' : '运营管理员',
            operatorName: role === 'city_maintainer' ? editorId : '运营总控台',
            feature: '研学基地',
            target: payload.name,
            content: role === 'city_maintainer' ? '提交基地数据审核' : '保存基地台账',
            result: role === 'city_maintainer' ? '待确认' : '成功',
          });
        }),
      saveTaskLibrary: (payload, role, editorId, taskId) =>
        mutate((draft) => {
          let record = taskId ? draft.taskLibrary.find((item) => item.id === taskId) : undefined;
          const approvalStatus: AuditStatus = role === 'city_maintainer' ? '待审核' : '已确认';
          if (record) {
            Object.assign(record, payload, { approvalStatus });
          } else {
            record = {
              id: uid('task-library'),
              approvalStatus,
              ...payload,
            };
            draft.taskLibrary.unshift(record);
          }

          if (role === 'city_maintainer') {
            const existing = draft.audits.find((item) => item.targetType === '任务' && item.targetId === record!.id);
            const maintainer = draft.partTimers.find((item) => item.id === editorId);
            if (maintainer && !taskId) {
              maintainer.taskCount += 1;
            }
            if (existing) {
              existing.status = '待审核';
              existing.note = '任务内容已更新，等待审核';
              existing.submittedAt = nowTime();
            } else if (maintainer) {
              draft.audits.unshift({
                id: uid('audit'),
                targetType: '任务',
                targetId: record!.id,
                city: payload.city,
                title: payload.name,
                maintainerId: editorId,
                maintainerName: maintainer.name,
                submittedAt: nowTime(),
                status: '待审核',
                note: '提交任务维护数据',
              });
            }
          }
          addOperationLog(draft, {
            role: role === 'city_maintainer' ? '兼职维护员' : '运营管理员',
            operatorName: role === 'city_maintainer' ? editorId : '运营总控台',
            feature: '任务库',
            target: payload.name,
            content: role === 'city_maintainer' ? '提交任务数据审核' : '保存任务库记录',
            result: role === 'city_maintainer' ? '待确认' : '成功',
          });
        }),
      reviewAudit: (auditId, status, note) =>
        mutate((draft) => {
          const audit = draft.audits.find((item) => item.id === auditId);
          if (!audit) return;
          audit.status = status;
          audit.note = note;
          const nextStatus: AuditStatus = status === '已确认' ? '已确认' : '退回修改';

          if (audit.targetType === '基地') {
            const base = draft.bases.find((item) => item.id === audit.targetId);
            if (base) {
              base.approvalStatus = nextStatus;
            }
          } else {
            const task = draft.taskLibrary.find((item) => item.id === audit.targetId);
            if (task) {
              task.approvalStatus = nextStatus;
            }
          }

          const maintainer = draft.partTimers.find((item) => item.id === audit.maintainerId);
          if (maintainer && status === '已确认') {
            maintainer.passedCount += 1;
          }
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '数据审核',
            target: audit.title,
            content: `审核结果：${status}`,
            result: '成功',
          });
        }),
      savePartTimer: (payload, partTimerId) =>
        mutate((draft) => {
          if (partTimerId) {
            const found = draft.partTimers.find((item) => item.id === partTimerId);
            if (found) {
              Object.assign(found, payload);
            }
            return;
          }
          draft.partTimers.unshift({
            id: uid('maintainer'),
            baseCount: 0,
            taskCount: 0,
            passedCount: 0,
            ...payload,
          });
        }),
      createRentalOrder: (payload) =>
        mutate((draft) => {
          draft.rentalOrders.unshift({
            id: uid('rent'),
            createdAt: nowTime(),
            payments: [],
            ...payload,
          });
          addOperationLog(draft, {
            role: '销售人员',
            operatorName: payload.saleOwner,
            feature: '租赁订单',
            target: payload.teamName,
            content: '创建租赁订单',
            result: '成功',
          });
        }),
      updateRentalOrderStatus: (orderId, status, deviceSerials, note) =>
        mutate((draft) => {
          const order = draft.rentalOrders.find((item) => item.id === orderId);
          if (!order) return;
          order.status = status;
          order.deviceSerials = deviceSerials;
          order.note = note;
          draft.devices.forEach((device) => {
            if (deviceSerials.includes(device.serialNumber)) {
              device.status = status === '已回收' ? '已回收' : '租赁中';
              device.lastAction = status === '已回收' ? '已完成租赁回收' : `已绑定租赁订单 ${order.teamName}`;
            }
          });
          if (status === '已回收') {
            deviceSerials.forEach((serialNumber) => {
              draft.erasureRecords.unshift({
                id: uid('erase'),
                orderId,
                serialNumber,
                createdAt: nowTime(),
                status: '待执行',
              });
            });
          }
          rebuildInventoryDaily(draft);
          addOperationLog(draft, {
            role: status === '已回收' ? '库管人员' : '销售人员',
            operatorName: status === '已回收' ? '分仓库管' : order.saleOwner,
            feature: '租赁订单',
            target: order.id,
            content: `订单状态更新为${status}`,
            result: '成功',
          });
        }),
      addRentalPayment: (orderId, payment) =>
        mutate((draft) => {
          const order = draft.rentalOrders.find((item) => item.id === orderId);
          if (!order) return;
          order.payments.unshift({
            id: uid('payment'),
            createdAt: nowTime(),
            confirmationStatus: '待确认',
            recordedBy: order.saleOwner,
            ...payment,
          });
          addOperationLog(draft, {
            role: '销售人员',
            operatorName: order.saleOwner,
            feature: '租赁收款',
            target: order.id,
            content: `录入收款${payment.amount}元`,
            result: '待确认',
          });
        }),
      confirmPayment: (sourceType, orderId, paymentId) =>
        mutate((draft) => {
          const { order, payment } = findPaymentTarget(draft, sourceType, orderId, paymentId);
          if (!order || !payment) return;
          if (payment.confirmationStatus !== '已确认') {
            order.paidAmount += payment.amount;
          }
          payment.confirmationStatus = '已确认';
          payment.confirmedBy = '财务确认岗';
          payment.confirmedAt = nowTime();
          payment.returnedReason = undefined;
          addOperationLog(draft, {
            role: '财务人员',
            operatorName: '财务确认岗',
            feature: '财务到账确认',
            target: `${sourceType} ${order.id}`,
            content: `确认到账 ${payment.amount} 元`,
            result: '成功',
          });
        }),
      returnPayment: (sourceType, orderId, paymentId, reason) =>
        mutate((draft) => {
          const { order, payment } = findPaymentTarget(draft, sourceType, orderId, paymentId);
          if (!order || !payment) return;
          if (payment.confirmationStatus === '已确认') {
            order.paidAmount = Math.max(0, order.paidAmount - payment.amount);
          }
          payment.confirmationStatus = '已退回';
          payment.confirmedBy = '财务确认岗';
          payment.confirmedAt = nowTime();
          payment.returnedReason = reason;
          addOperationLog(draft, {
            role: '财务人员',
            operatorName: '财务确认岗',
            feature: '财务到账确认',
            target: `${sourceType} ${order.id}`,
            content: `退回收款记录：${reason}`,
            result: '退回修改',
          });
        }),
      supplementPaymentVoucher: (sourceType, orderId, paymentId, fileName) =>
        mutate((draft) => {
          const { order, payment } = findPaymentTarget(draft, sourceType, orderId, paymentId);
          if (!order || !payment) return;
          payment.voucherFile = fileName;
          payment.confirmationStatus = '待确认';
          payment.returnedReason = undefined;
          draft.attachments.unshift({
            id: uid('attachment'),
            ownerType: sourceType,
            ownerId: order.id,
            fileName,
            uploadedAt: nowTime(),
            note: '补传收款凭证',
          });
          addUploadResult(draft, {
            feature: '收款凭证',
            target: order.id,
            fileName,
            batchNo: `VOUCHER-${nowDate().replace(/-/g, '')}`,
            successCount: 1,
            failedCount: 0,
            failedFields: [],
            operatorRole: '销售人员',
          });
          addOperationLog(draft, {
            role: '销售人员',
            operatorName: payment.recordedBy,
            feature: '收款凭证',
            target: `${sourceType} ${order.id}`,
            content: `补传收款凭证 ${fileName}`,
            result: '待确认',
          });
        }),
      adjustRentalOrder: (orderId, quantity, unitPrice, discount, note) =>
        mutate((draft) => {
          const order = draft.rentalOrders.find((item) => item.id === orderId);
          if (!order) return;
          order.quantity = quantity;
          order.unitPrice = unitPrice;
          order.totalAmount = Math.max(0, quantity * order.days * unitPrice - discount);
          order.note = `${order.note}\n数量价格调整：${note || '按实际执行数量重新计费'}，优惠 ${discount} 元`;
          addOperationLog(draft, {
            role: '销售人员',
            operatorName: order.saleOwner,
            feature: '租赁订单',
            target: order.id,
            content: `调整数量为${quantity}、单价${unitPrice}、优惠${discount}`,
            result: '成功',
          });
        }),
      createRentalDamageBill: (orderId, amount, note) =>
        mutate((draft) => {
          const order = draft.rentalOrders.find((item) => item.id === orderId);
          if (!order) return;
          order.totalAmount += amount;
          order.note = `${order.note}\n报失报修账单：${note}，加收 ${amount} 元`;
          addOperationLog(draft, {
            role: '库管人员',
            operatorName: '分仓库管',
            feature: '报失报修',
            target: order.id,
            content: `生成遗失/维修费用账单 ${amount} 元`,
            result: '待确认',
          });
        }),
      attachRentalOrderFile: (orderId, fileName, note) =>
        mutate((draft) => {
          draft.attachments.unshift({
            id: uid('attachment'),
            ownerType: '租赁订单',
            ownerId: orderId,
            fileName,
            uploadedAt: nowTime(),
            note,
          });
          addOperationLog(draft, {
            role: '销售人员',
            operatorName: '租赁销售岗',
            feature: '租赁附件',
            target: orderId,
            content: `上传租赁订单附件：${fileName}`,
            result: '成功',
          });
        }),
      importRentalDeviceBatch: (orderId, fileName) =>
        mutate((draft) => {
          const order = draft.rentalOrders.find((item) => item.id === orderId);
          if (!order) return;
          const freeDevices = draft.devices.filter((item) => item.status === '库存' || item.status === '库存-租赁');
          const assigned = freeDevices.slice(0, Math.min(order.quantity, Math.max(1, freeDevices.length))).map((item) => item.serialNumber);
          const batchNo = `CK-${nowDate().replace(/-/g, '')}-${String(draft.rentalDeviceBatches.length + 1).padStart(3, '0')}`;
          draft.rentalDeviceBatches.unshift({
            id: uid('rental-batch'),
            orderId,
            batchNo,
            fileName,
            quantity: assigned.length,
            failedCount: order.quantity > assigned.length ? order.quantity - assigned.length : 0,
            deviceSerials: assigned,
            importedAt: nowTime(),
            status: '待出库',
          });
          order.deviceSerials = Array.from(new Set([...order.deviceSerials, ...assigned]));
          order.note = `${order.note}\n设备批次导入：${batchNo}，成功 ${assigned.length} 台`;
          draft.attachments.unshift({
            id: uid('attachment'),
            ownerType: '租赁订单',
            ownerId: orderId,
            fileName,
            uploadedAt: nowTime(),
            note: `设备 ID 批次 ${batchNo}`,
          });
          addUploadResult(draft, {
            feature: '租赁设备批次',
            target: order.id,
            fileName,
            batchNo,
            successCount: assigned.length,
            failedCount: order.quantity > assigned.length ? order.quantity - assigned.length : 0,
            failedFields: order.quantity > assigned.length ? ['设备ID', '分仓库存'] : [],
            operatorRole: '库管人员',
          });
          addOperationLog(draft, {
            role: '库管人员',
            operatorName: '分仓库管',
            feature: '租赁设备批次',
            target: order.id,
            content: `导入设备 ID Excel，生成批次 ${batchNo}`,
            result: assigned.length > 0 ? '成功' : '待确认',
          });
        }),
      importInventoryDevices: (fileName = '设备入库导入.xlsx') =>
        mutate((draft) => {
          const warehouse = draft.warehouses[0];
          const batch = `RK-${nowDate().replace(/-/g, '')}`;
          const startIndex = draft.devices.length + 1;
          const newDevices: Device[] = Array.from({ length: 8 }, (_, index) => ({
            id: uid('device'),
            serialNumber: `YX-${batch}-${String(startIndex + index).padStart(4, '0')}`,
            batch,
            model: index % 2 === 0 ? 'YX-Guardian S2' : 'YX-Guardian Lite',
            status: index < 5 ? '库存' : '库存-租赁',
            lastAction: `设备入库 ${warehouse?.name ?? '中心仓'}`,
            warehouseId: warehouse?.id,
            lastMovementDate: nowDate(),
            rentalTimes: 0,
            rentalDays: 0,
          }));
          draft.devices.unshift(...newDevices);
          if (warehouse) {
            warehouse.stock += 5;
            warehouse.rentalStock += 3;
          }
          rebuildInventoryDaily(draft);
          const today = draft.inventoryDaily.find((item) => item.date === nowDate());
          if (today) {
            today.inbound += newDevices.length;
          }
          addOperationLog(draft, {
            role: '库管人员',
            operatorName: warehouse?.manager ?? '中心仓库管',
            feature: '设备入库',
            target: batch,
            content: `导入 Excel 入库 ${newDevices.length} 台设备`,
            result: '成功',
          });
          addUploadResult(draft, {
            feature: '设备入库',
            target: batch,
            fileName,
            batchNo: batch,
            successCount: newDevices.length,
            failedCount: 1,
            failedFields: ['设备型号'],
            operatorRole: '库管人员',
          });
        }),
      transferWarehouseStock: (fileName = '分仓调拨单.xlsx') =>
        mutate((draft) => {
          const [fromWarehouse, toWarehouse] = draft.warehouses;
          if (!fromWarehouse || !toWarehouse) return;
          const transferCount = Math.min(3, fromWarehouse.stock);
          const movingDevices = draft.devices
            .filter((device) => device.warehouseId === fromWarehouse.id && device.status === '库存')
            .slice(0, transferCount);
          movingDevices.forEach((device) => {
            device.warehouseId = toWarehouse.id;
            device.lastMovementDate = nowDate();
            device.lastAction = `${fromWarehouse.name} 调拨至 ${toWarehouse.name}`;
          });
          fromWarehouse.stock -= movingDevices.length;
          toWarehouse.stock += movingDevices.length;
          addOperationLog(draft, {
            role: '库管人员',
            operatorName: fromWarehouse.manager,
            feature: '分仓调拨',
            target: `${fromWarehouse.name} -> ${toWarehouse.name}`,
            content: `创建调拨单并移动 ${movingDevices.length} 台可售设备`,
            result: movingDevices.length > 0 ? '成功' : '失败',
          });
          addUploadResult(draft, {
            feature: '分仓调拨',
            target: `${fromWarehouse.name} -> ${toWarehouse.name}`,
            fileName,
            batchNo: `DB-${nowDate().replace(/-/g, '')}`,
            successCount: movingDevices.length,
            failedCount: transferCount - movingDevices.length,
            failedFields: movingDevices.length < transferCount ? ['设备状态', '分仓库存'] : [],
            operatorRole: '库管人员',
          });
        }),
      importOnlineLogistics: (fileName = '物流信息导入.xlsx') =>
        mutate((draft) => {
          const pendingOrders = draft.onlineSales.filter((item) => item.status === '待发货').slice(0, 2);
          const freeDevices = draft.devices.filter((item) => item.status === '库存');
          let cursor = 0;
          pendingOrders.forEach((order, index) => {
            const assigned = freeDevices.slice(cursor, cursor + order.quantity).map((item) => item.serialNumber);
            cursor += order.quantity;
            if (assigned.length === 0) return;
            order.deviceSerials = assigned;
            order.expressCompany = index % 2 === 0 ? '顺丰速运' : '京东物流';
            order.expressNo = `SF${Date.now().toString().slice(-8)}${index}`;
            order.status = '已发货';
            order.shippedAt = nowTime();
            draft.devices.forEach((device) => {
              if (assigned.includes(device.serialNumber)) {
                device.status = '已销售';
                device.lastAction = `商城物流导入 ${order.expressCompany} ${order.expressNo}`;
                device.lastMovementDate = nowDate();
              }
            });
          });
          rebuildInventoryDaily(draft);
          addOperationLog(draft, {
            role: '物流人员',
            operatorName: '商城发货岗',
            feature: '物流信息导入',
            target: '在线销售订单',
            content: `导入物流 Excel 并更新 ${pendingOrders.length} 笔订单`,
            result: pendingOrders.length > 0 ? '成功' : '待确认',
          });
          addUploadResult(draft, {
            feature: '物流信息导入',
            target: '在线销售订单',
            fileName,
            batchNo: `WL-${nowDate().replace(/-/g, '')}`,
            successCount: pendingOrders.length,
            failedCount: pendingOrders.length > 0 ? 1 : 0,
            failedFields: pendingOrders.length > 0 ? ['快递单号'] : [],
            operatorRole: '物流人员',
          });
        }),
      shipOnlineSale: (orderId, deviceSerials, expressCompany, expressNo) =>
        mutate((draft) => {
          const order = draft.onlineSales.find((item) => item.id === orderId);
          if (!order) return;
          order.deviceSerials = deviceSerials;
          order.expressCompany = expressCompany;
          order.expressNo = expressNo;
          order.status = '已发货';
          order.shippedAt = nowTime();
          draft.devices.forEach((device) => {
            if (deviceSerials.includes(device.serialNumber)) {
              device.status = '已销售';
              device.lastAction = `商城发货 ${expressCompany} ${expressNo}`;
              device.lastMovementDate = nowDate();
            }
          });
          rebuildInventoryDaily(draft);
          addOperationLog(draft, {
            role: '物流人员',
            operatorName: '商城发货岗',
            feature: '在线销售',
            target: order.id,
            content: `发货并录入${expressCompany} ${expressNo}`,
            result: '成功',
          });
        }),
      createEnterpriseSaleDraft: () =>
        mutate((draft) => {
          const order: EnterpriseSaleOrder = {
            id: uid('sale-enterprise'),
            customerType: '企业客户',
            customerName: '深圳未来研学集团',
            saleDate: nowDate(),
            quantity: 20,
            unitPrice: 1280,
            totalAmount: 25600,
            paidAmount: 0,
            contactName: '赵经理',
            contactPhone: '13800009999',
            saleOwner: '企业销售岗',
            status: '洽谈',
            deviceSerials: [],
            payments: [],
          };
          draft.enterpriseSales.unshift(order);
          addOperationLog(draft, {
            role: '销售人员',
            operatorName: order.saleOwner,
            feature: '企业销售',
            target: order.id,
            content: '新增企业销售订单并进入洽谈状态',
            result: '成功',
          });
        }),
      attachEnterpriseAgreement: (orderId, fileName) =>
        mutate((draft) => {
          const order = orderId ? draft.enterpriseSales.find((item) => item.id === orderId) : draft.enterpriseSales[0];
          if (!order) return;
          const attachmentName = fileName ?? `${order.customerName}设备采购协议.pdf`;
          draft.attachments.unshift({
            id: uid('attachment'),
            ownerType: '企业销售',
            ownerId: order.id,
            fileName: attachmentName,
            uploadedAt: nowTime(),
            note: '企业销售协议附件',
          });
          addUploadResult(draft, {
            feature: '企业协议附件',
            target: order.id,
            fileName: attachmentName,
            batchNo: `AG-${nowDate().replace(/-/g, '')}`,
            successCount: 1,
            failedCount: 0,
            failedFields: [],
            operatorRole: '销售人员',
          });
          addOperationLog(draft, {
            role: '销售人员',
            operatorName: order.saleOwner,
            feature: '协议上传',
            target: order.id,
            content: `上传企业销售协议附件 ${attachmentName}`,
            result: '成功',
          });
        }),
      confirmEnterprisePayment: () =>
        mutate((draft) => {
          const order = draft.enterpriseSales.find((item) => item.payments.some((payment) => payment.confirmationStatus === '待确认')) ?? draft.enterpriseSales[0];
          const payment = order?.payments.find((item) => item.confirmationStatus === '待确认');
          if (!order || !payment) return;
          order.paidAmount += payment.amount;
          payment.confirmationStatus = '已确认';
          payment.confirmedBy = '财务确认岗';
          payment.confirmedAt = nowTime();
          addOperationLog(draft, {
            role: '财务人员',
            operatorName: '财务确认岗',
            feature: '财务收款确认',
            target: order.id,
            content: `确认到账${payment.amount}元`,
            result: '成功',
          });
        }),
      updateEnterpriseSale: (orderId, deviceSerials, status) =>
        mutate((draft) => {
          const order = draft.enterpriseSales.find((item) => item.id === orderId);
          if (!order) return;
          order.deviceSerials = deviceSerials;
          order.status = status;
          if (status === '已交付') {
            draft.devices.forEach((device) => {
              if (deviceSerials.includes(device.serialNumber)) {
                device.status = '已销售';
                device.lastAction = `企业销售出库 ${order.customerName}`;
              }
            });
          }
          rebuildInventoryDaily(draft);
          addOperationLog(draft, {
            role: '销售人员',
            operatorName: order.saleOwner,
            feature: '企业销售',
            target: order.id,
            content: `订单状态更新为${status}`,
            result: '成功',
          });
        }),
      addEnterprisePayment: (orderId, payment) =>
        mutate((draft) => {
          const order = draft.enterpriseSales.find((item) => item.id === orderId);
          if (!order) return;
          order.payments.unshift({
            id: uid('payment'),
            createdAt: nowTime(),
            confirmationStatus: '待确认',
            recordedBy: order.saleOwner,
            ...payment,
          });
          addOperationLog(draft, {
            role: '销售人员',
            operatorName: order.saleOwner,
            feature: '企业收款',
            target: order.id,
            content: `录入收款${payment.amount}元`,
            result: '待确认',
          });
        }),
      uploadOrganizationContract: (organizationId, fileName) =>
        mutate((draft) => {
          const organization = draft.organizations.find((item) => item.id === organizationId);
          draft.contracts.unshift({
            id: uid('contract'),
            organizationId,
            title: `${organization?.name ?? '合作机构'}合作协议`,
            fileName,
            uploadedAt: nowTime(),
            status: '生效中',
          });
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '合同管理',
            target: organization?.name ?? organizationId,
            content: `上传合作协议 ${fileName}`,
            result: '成功',
          });
        }),
      saveCapabilityMapping: (payload, mappingId) =>
        mutate((draft) => {
          if (mappingId) {
            const found = draft.capabilityMappings.find((item) => item.id === mappingId);
            if (found) {
              Object.assign(found, payload);
            }
          } else {
            draft.capabilityMappings.unshift({ id: uid('mapping'), ...payload });
          }

          const boost = payload.formulaItems.reduce((sum, item) => sum + item.weight, 0) / 1000;
          draft.students.forEach((student) => {
            student.capabilityScore = Number(Math.min(9.9, student.capabilityScore + boost).toFixed(1));
            student.capabilityRecords.unshift({
              id: uid('cap'),
              changedAt: nowTime(),
              element: payload.indicator,
              source: '映射规则调整',
              oldValue: Number((student.capabilityScore - boost).toFixed(1)),
              newValue: student.capabilityScore,
            });
          });
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '能力映射',
            target: payload.indicator,
            content: '保存合作机构能力映射公式',
            result: '成功',
          });
        }),
      saveGrowthRule: (payload, ruleId) =>
        mutate((draft) => {
          if (ruleId) {
            const found = draft.growthRules.find((item) => item.id === ruleId);
            if (found) {
              Object.assign(found, payload);
            }
          } else {
            draft.growthRules.unshift({ id: uid('rule'), ...payload });
          }
        }),
      saveGrowthGood: (payload, goodId) =>
        mutate((draft) => {
          if (goodId) {
            const found = draft.growthGoods.find((item) => item.id === goodId);
            if (found) {
              Object.assign(found, payload);
            }
          } else {
            draft.growthGoods.unshift({ id: uid('good'), exchanged: 0, ...payload });
          }
        }),
      saveAssessmentSetting: (payload, settingId) =>
        mutate((draft) => {
          if (settingId) {
            const found = draft.assessmentSettings.find((item) => item.id === settingId);
            if (found) {
              Object.assign(found, payload);
            }
          } else {
            draft.assessmentSettings.push({ id: uid('setting'), ...payload });
          }
        }),
      saveQuestionBankItem: (payload, itemId) =>
        mutate((draft) => {
          if (itemId) {
            const found = draft.questionBank.find((item) => item.id === itemId);
            if (found) {
              Object.assign(found, payload);
            }
          } else {
            draft.questionBank.unshift({ id: uid('question'), ...payload });
          }
        }),
      saveTaskType: (payload, typeId) =>
        mutate((draft) => {
          if (typeId) {
            const found = draft.taskTypes.find((item) => item.id === typeId);
            if (found) {
              Object.assign(found, payload);
            }
          } else {
            draft.taskTypes.unshift({ id: uid('task-type'), ...payload });
          }
        }),
      saveBuilderTemplate: (payload, templateId) =>
        mutate((draft) => {
          if (templateId) {
            const found = draft.builderTemplates.find((item) => item.id === templateId);
            if (found) {
              Object.assign(found, payload);
            }
          } else {
            draft.builderTemplates.unshift({ id: uid('builder'), ...payload });
          }
        }),
      moveBuilderBlock: (templateId, fromIndex, toIndex) =>
        mutate((draft) => {
          const template = draft.builderTemplates.find((item) => item.id === templateId);
          if (!template) return;
          const nextBlocks = [...template.blocks];
          const [moved] = nextBlocks.splice(fromIndex, 1);
          nextBlocks.splice(toIndex, 0, moved);
          template.blocks = nextBlocks;
        }),
      advanceImportJob: (jobId) =>
        mutate((draft) => {
          const job = draft.importJobs.find((item) => item.id === jobId);
          if (!job) return;
          job.status = job.status === '上传完成' ? '解析中' : job.status === '解析中' ? '待确认' : job.status;
          if (job.status === '解析中') {
            job.result = '已提取任务说明、能力标签与评分规则，等待确认。';
          }
        }),
      applyImportJob: (jobId) =>
        mutate((draft) => {
          const job = draft.importJobs.find((item) => item.id === jobId);
          if (!job) return;
          job.status = '已入库';
          job.result = '已生成 1 条任务库记录并完成入库。';
          draft.taskLibrary.unshift({
            id: uid('library'),
            city: '深圳市-南山区',
            baseId: 'base-1',
            name: `${job.title}入库结果`,
            typeId: 'type-3',
            description: '由智能录入流程生成的任务库记录。',
            abilityTags: ['问题发现'],
            subjectTags: ['科学'],
            stageTags: ['初中'],
            applyTo: ['团体研学'],
            approvalStatus: '已确认',
            createdBy: 'operator-001',
            createdByRole: 'operator',
          });
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '智能录入',
            target: job.title,
            content: '确认导入任务入库',
            result: '成功',
          });
        }),
      updateSosStatus: (alertId, status, note) =>
        mutate((draft) => {
          const alert = draft.sosAlerts.find((item) => item.id === alertId);
          if (!alert) return;
          alert.status = status;
          alert.note = note;
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: 'SOS 报警',
            target: alert.studentName,
            content: `处理状态更新为${status}`,
            result: '成功',
          });
        }),
      reviewExpertEntry: () =>
        mutate((draft) => {
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '专家入驻审核',
            target: '专家入驻申请',
            content: '审核专家资质与课程运营资料',
            result: '成功',
          });
        }),
      reviewCourseOrders: () =>
        mutate((draft) => {
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '课程订单',
            target: '课程订单明细',
            content: '查看课程订单并处理退款申请',
            result: '成功',
          });
        }),
      createCourseUploadDraft: () =>
        mutate((draft) => {
          const course: CourseRecord = {
            id: uid('course'),
            title: '湾区科技馆探究课程',
            expertName: '运营代上传',
            type: '线上课程',
            price: 199,
            status: '创建中',
            sales: 0,
            views: 0,
            studentCount: 0,
          };
          draft.courses.unshift(course);
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '课程管理',
            target: course.title,
            content: '代专家上传课程图文、视频与售卖信息',
            result: '待确认',
          });
        }),
      toggleCourseStatus: (courseId) =>
        mutate((draft) => {
          const course = draft.courses.find((item) => item.id === courseId);
          if (!course) return;
          course.status = course.status === '已上架' ? '已下架' : '已上架';
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '课程管理',
            target: course.title,
            content: `课程状态更新为${course.status}`,
            result: '成功',
          });
        }),
      submitQaAnswer: (qaId) =>
        mutate((draft) => {
          const qa = draft.qaRecords.find((item) => item.id === qaId);
          if (!qa) return;
          qa.status = '已补充';
          qa.matchedKnowledge = true;
          draft.knowledge.unshift({
            id: uid('knowledge'),
            title: `${qa.summary}补充答案`,
            category: '知识条目',
            updatedAt: nowTime(),
            status: '已发布',
          });
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '问答记录',
            target: qa.agentName,
            content: '补充未命中问答答案',
            result: '成功',
          });
        }),
      uploadAgentKnowledge: (agentId) =>
        mutate((draft) => {
          const agent = draft.agents.find((item) => item.id === agentId);
          if (!agent) return;
          const knowledge: KnowledgeItem = {
            id: uid('knowledge'),
            title: `${agent.name}代运营资料`,
            category: '知识条目',
            updatedAt: nowTime(),
            status: '草稿',
          };
          draft.knowledge.unshift(knowledge);
          agent.knowledgeIds.unshift(knowledge.id);
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '知识库代运营',
            target: agent.name,
            content: '帮助专家上传并解析知识库资料',
            result: '待确认',
          });
        }),
      toggleKnowledgeStatus: (knowledgeId) =>
        mutate((draft) => {
          const record = draft.knowledge.find((item) => item.id === knowledgeId);
          if (!record) return;
          record.status = record.status === '已发布' ? '草稿' : '已发布';
          record.updatedAt = nowTime();
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '知识库',
            target: record.title,
            content: `知识状态更新为${record.status}`,
            result: '成功',
          });
        }),
      toggleAgentStatus: (agentId) =>
        mutate((draft) => {
          const agent = draft.agents.find((item) => item.id === agentId);
          if (!agent) return;
          agent.onlineStatus = agent.onlineStatus === '已上架' ? '已下架' : '已上架';
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '智能体管理',
            target: agent.name,
            content: `智能体状态更新为${agent.onlineStatus}`,
            result: '成功',
          });
        }),
      writeOperationLog: (payload) =>
        mutate((draft) => {
          addOperationLog(draft, payload);
        }),
      saveMasterAgentSettings: (payload) =>
        mutate((draft) => {
          draft.masterAgentSettings = {
            id: draft.masterAgentSettings.id,
            updatedAt: nowTime(),
            ...payload,
          };
          addOperationLog(draft, {
            role: '运营管理员',
            operatorName: '运营总控台',
            feature: '主控智能体设置',
            target: payload.agentName,
            content: '保存知识库、主动推送与新手引导规则',
            result: '成功',
          });
        }),
    };

    return {
      state,
      hydrated,
      actions,
      selectors,
    };
  }, [hydrated, state]);

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}
