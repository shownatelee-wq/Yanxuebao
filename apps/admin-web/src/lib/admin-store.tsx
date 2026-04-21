'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AdminRole } from './admin-auth';

export type EntityStatus = '启用' | '停用';
export type TeamAssignmentStatus = '未安排' | '已安排' | '执行中' | '已结束';
export type TaskExecutionStatus = '创建中' | '已下发' | '进行中' | '已结束';
export type PhotoRecognitionStatus = '识别中' | '已关联' | '待修正';
export type AuditStatus = '录入中' | '待审核' | '退回修改' | '已确认';
export type DeviceStatus = '库存' | '已销售' | '租赁中' | '已回收' | '故障' | '报废' | '丢失';
export type RentalOrderStatus = '意向' | '已预订' | '已交付' | '已回收';
export type SaleOrderStatus = '待发货' | '已发货' | '已完成';

export type Organization = {
  id: string;
  type: string;
  name: string;
  contactName: string;
  contactPhone: string;
  city: string;
  registeredAt: string;
  customType?: boolean;
};

export type Mentor = {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  status: EntityStatus;
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

export type TeamTask = {
  id: string;
  teamId: string;
  name: string;
  status: TaskExecutionStatus;
  scope: '个人任务' | '小组任务';
  submittedCount: number;
  totalCount: number;
  mentorId?: string;
  updatedAt: string;
};

export type TeamPhoto = {
  id: string;
  teamId: string;
  title: string;
  uploadedAt: string;
  status: PhotoRecognitionStatus;
  linkedStudentIds: string[];
  note: string;
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
};

export type PaymentRecord = {
  id: string;
  amount: number;
  method: '转账' | '扫码' | '现金';
  note: string;
  createdAt: string;
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
  status: '意向' | '已预订' | '已交付';
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
  status: '审核中' | '已上架' | '已下架' | '已结束';
  sales: number;
  views: number;
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
  style: '严谨' | '活泼' | '鼓励型';
  onlineStatus: '已上架' | '已下架';
  users: number;
  questions: number;
  knowledgeIds: string[];
};

export type CapabilityElement = {
  id: string;
  plane: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type CapabilityMapping = {
  id: string;
  organizationType: string;
  indicator: string;
  elementIds: string[];
  weight: number;
};

export type QuestionBankItem = {
  id: string;
  category: '学员自测' | '家长评测';
  type: '单选' | '判断' | '问答';
  title: string;
  element: string;
  status: '启用' | '草稿';
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
};

export type ImportTaskJob = {
  id: string;
  title: string;
  sourceType: 'Excel导入' | '文档解析';
  status: '上传完成' | '解析中' | '待确认' | '已入库';
  createdAt: string;
  result: string;
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
  organizations: Organization[];
  mentors: Mentor[];
  teams: Team[];
  teamTasks: TeamTask[];
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
  saveOrganization: (payload: Omit<Organization, 'id' | 'registeredAt'>, organizationId?: string) => void;
  saveMentor: (payload: Omit<Mentor, 'id' | 'registeredAt'>, mentorId?: string) => void;
  assignMentor: (teamId: string, mentorId: string, assistantPhones: string[]) => void;
  saveTeamTask: (payload: Omit<TeamTask, 'id' | 'updatedAt'>, taskId?: string) => void;
  savePhotoLinks: (photoId: string, linkedStudentIds: string[], status: PhotoRecognitionStatus, note: string) => void;
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
  addRentalPayment: (orderId: string, payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  shipOnlineSale: (orderId: string, deviceSerials: string[], expressCompany: string, expressNo: string) => void;
  updateEnterpriseSale: (orderId: string, deviceSerials: string[], status: EnterpriseSaleOrder['status']) => void;
  addEnterprisePayment: (orderId: string, payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
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
  toggleCourseStatus: (courseId: string) => void;
  submitQaAnswer: (qaId: string) => void;
  toggleKnowledgeStatus: (knowledgeId: string) => void;
  toggleAgentStatus: (agentId: string) => void;
};

type AdminStoreSelectors = {
  dashboard: {
    totalDevices: number;
    onlineDevices: number;
    studentCount: number;
    todayActiveStudents: number;
    totalTasks: number;
    finishedTasks: number;
    organizationCount: number;
    mentorCount: number;
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

const STORE_KEY = 'yanxuebao_admin_console_state_v1';
const STORE_VERSION = 1;

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
      if (device.status === '库存') acc.stock += 1;
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

function seedCapabilityElements(): CapabilityElement[] {
  return [
    ['领导执行', '目标驱动', '能规划目标并推进执行'],
    ['领导执行', '责任担当', '愿意承担任务并兑现承诺'],
    ['领导执行', '协同组织', '能组织协作并统筹资源'],
    ['领导执行', '结果复盘', '能复盘过程并持续优化'],
    ['创新创造', '问题发现', '能从真实场景中发现问题'],
    ['创新创造', '创意生成', '能提出多个可行方案'],
    ['创新创造', '方案迭代', '能优化方案并快速试错'],
    ['创新创造', '成果表达', '能清晰呈现创作结果'],
    ['认知成长', '信息检索', '能主动搜集和筛选信息'],
    ['认知成长', '逻辑分析', '能从信息中提炼结论'],
    ['认知成长', '迁移应用', '能把知识迁移到新场景'],
    ['认知成长', '持续学习', '对新知识保持好奇与投入'],
    ['社会适应', '沟通表达', '能准确传递观点和需求'],
    ['社会适应', '同理合作', '能理解他人并进行协作'],
    ['社会适应', '环境适应', '能快速适应陌生环境'],
    ['社会适应', '安全判断', '能识别风险并及时应对'],
  ].map(([plane, name, description], index) => ({
    id: `ce-${index + 1}`,
    plane,
    name,
    description,
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
    },
    {
      id: 'org-2',
      type: '旅行社',
      name: '前海未来研学旅行社',
      contactName: '周经理',
      contactPhone: '13800138002',
      city: '深圳市-前海区',
      registeredAt: '2026-03-08',
    },
    {
      id: 'org-3',
      type: '景区',
      name: '华侨城生态探索基地',
      contactName: '郑老师',
      contactPhone: '13800138003',
      city: '深圳市-南山区',
      registeredAt: '2026-03-15',
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
      submittedCount: 0,
      totalCount: 48,
      mentorId: 'mentor-2',
      updatedAt: nowTime(),
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
    },
    {
      id: 'photo-2',
      teamId: 'team-1',
      title: '潮汐观察现场',
      uploadedAt: '2026-04-19 13:05',
      status: '待修正',
      linkedStudentIds: ['student-1'],
      note: '仍有 2 名学员待人工确认',
    },
  ];

  const bases: StudyBase[] = [
    {
      id: 'base-1',
      city: '深圳市-南山区',
      name: '深圳湾红树林生态观测站',
      type: '公园',
      address: '深圳市南山区滨海大道东段',
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
    status: index < 8 ? '租赁中' : index < 12 ? '已销售' : '库存',
    lastAction: index < 8 ? '已绑定租赁订单' : index < 12 ? '已完成商城发货' : '待分配',
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
        { id: 'payment-1', amount: 2200, method: '转账', note: '首笔到账', createdAt: '2026-04-11 16:20' },
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
      payments: [{ id: 'payment-2', amount: 3950, method: '扫码', note: '全款预订', createdAt: '2026-04-16 14:30' }],
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
      paidAmount: 1997,
      contactName: '郑老师',
      contactPhone: '13800138003',
      saleOwner: '唐瑞',
      status: '已交付',
      deviceSerials: devices.slice(10, 12).map((item) => item.serialNumber),
      payments: [{ id: 'payment-3', amount: 1997, method: '转账', note: '首付款', createdAt: '2026-04-09 11:20' }],
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
    { id: 'course-1', title: '海洋文明启蒙课', expertName: '杨舟教授', type: '线上课程', price: 199, status: '已上架', sales: 128, views: 1520 },
    { id: 'course-2', title: '城市观察营实地工作坊', expertName: '杜老师', type: '线下课程', price: 499, status: '审核中', sales: 0, views: 266 },
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
    { id: 'agent-1', name: '海洋探索助手', style: '鼓励型', onlineStatus: '已上架', users: 1380, questions: 5280, knowledgeIds: ['knowledge-1', 'knowledge-2'] },
    { id: 'agent-2', name: '科技发现助手', style: '严谨', onlineStatus: '已下架', users: 620, questions: 2110, knowledgeIds: ['knowledge-3'] },
  ];

  const capabilityMappings: CapabilityMapping[] = [
    { id: 'mapping-1', organizationType: '学校', indicator: '课堂汇报表现', elementIds: ['ce-4', 'ce-13'], weight: 0.35 },
    { id: 'mapping-2', organizationType: '景区', indicator: '现场观察记录', elementIds: ['ce-5', 'ce-9'], weight: 0.45 },
  ];

  const questionBank: QuestionBankItem[] = [
    { id: 'question-1', category: '学员自测', type: '单选', title: '遇到陌生任务时你通常如何开始？', element: '目标驱动', status: '启用' },
    { id: 'question-2', category: '家长评测', type: '判断', title: '孩子愿意在活动后主动复盘自己的完成情况。', element: '结果复盘', status: '启用' },
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
    { id: 'setting-1', label: '6 岁以下学员自测', durationMinutes: 10 },
    { id: 'setting-2', label: '6-9 岁学员自测', durationMinutes: 15 },
    { id: 'setting-3', label: '10-12 岁学员自测', durationMinutes: 20 },
    { id: 'setting-4', label: '13-15 岁学员自测', durationMinutes: 25 },
    { id: 'setting-5', label: '家长评测', durationMinutes: 20 },
  ];

  const importJobs: ImportTaskJob[] = [
    { id: 'job-1', title: '南山区生态基地批量导入', sourceType: 'Excel导入', status: '待确认', createdAt: '2026-04-17 15:10', result: '识别到 18 条基地记录，待确认 2 条地址异常' },
    { id: 'job-2', title: '海洋主题任务文档解析', sourceType: '文档解析', status: '解析中', createdAt: '2026-04-20 09:25', result: '正在提取任务说明、能力标签与评分规则' },
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

  return {
    version: STORE_VERSION,
    organizations,
    mentors,
    teams,
    teamTasks,
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
    const selectors: AdminStoreSelectors = {
      dashboard: {
        totalDevices: state.devices.length,
        onlineDevices: state.devices.filter((item) => item.status === '租赁中' || item.status === '已销售').length,
        studentCount: state.students.length,
        todayActiveStudents: state.teamTasks.reduce((sum, item) => sum + Math.min(item.submittedCount, item.totalCount), 0),
        totalTasks: state.teamTasks.length,
        finishedTasks: state.teamTasks.filter((item) => item.status === '已结束').length,
        organizationCount: state.organizations.length,
        mentorCount: state.mentors.length,
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
        }),
      savePhotoLinks: (photoId, linkedStudentIds, status, note) =>
        mutate((draft) => {
          const photo = draft.teamPhotos.find((item) => item.id === photoId);
          if (!photo) return;
          photo.linkedStudentIds = linkedStudentIds;
          photo.status = status;
          photo.note = note;
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
        }),
      addRentalPayment: (orderId, payment) =>
        mutate((draft) => {
          const order = draft.rentalOrders.find((item) => item.id === orderId);
          if (!order) return;
          order.payments.unshift({ id: uid('payment'), createdAt: nowTime(), ...payment });
          order.paidAmount += payment.amount;
        }),
      shipOnlineSale: (orderId, deviceSerials, expressCompany, expressNo) =>
        mutate((draft) => {
          const order = draft.onlineSales.find((item) => item.id === orderId);
          if (!order) return;
          order.deviceSerials = deviceSerials;
          order.expressCompany = expressCompany;
          order.expressNo = expressNo;
          order.status = '已发货';
          draft.devices.forEach((device) => {
            if (deviceSerials.includes(device.serialNumber)) {
              device.status = '已销售';
              device.lastAction = `商城发货 ${expressCompany} ${expressNo}`;
            }
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
        }),
      addEnterprisePayment: (orderId, payment) =>
        mutate((draft) => {
          const order = draft.enterpriseSales.find((item) => item.id === orderId);
          if (!order) return;
          order.payments.unshift({ id: uid('payment'), createdAt: nowTime(), ...payment });
          order.paidAmount += payment.amount;
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

          const boost = payload.weight * 0.1;
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
        }),
      updateSosStatus: (alertId, status, note) =>
        mutate((draft) => {
          const alert = draft.sosAlerts.find((item) => item.id === alertId);
          if (!alert) return;
          alert.status = status;
          alert.note = note;
        }),
      toggleCourseStatus: (courseId) =>
        mutate((draft) => {
          const course = draft.courses.find((item) => item.id === courseId);
          if (!course) return;
          course.status = course.status === '已上架' ? '已下架' : '已上架';
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
        }),
      toggleKnowledgeStatus: (knowledgeId) =>
        mutate((draft) => {
          const record = draft.knowledge.find((item) => item.id === knowledgeId);
          if (!record) return;
          record.status = record.status === '已发布' ? '草稿' : '已发布';
          record.updatedAt = nowTime();
        }),
      toggleAgentStatus: (agentId) =>
        mutate((draft) => {
          const agent = draft.agents.find((item) => item.id === agentId);
          if (!agent) return;
          agent.onlineStatus = agent.onlineStatus === '已上架' ? '已下架' : '已上架';
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
