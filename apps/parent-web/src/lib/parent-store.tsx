'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CapabilityPlaneKey = 'self' | 'learning' | 'future' | 'social';
export type GrowthDiaryType =
  | 'timeline'
  | 'report'
  | 'work'
  | 'task'
  | 'ai_qa'
  | 'ai_creation'
  | 'flash_note'
  | 'photo'
  | 'achievement'
  | 'expert_course'
  | 'challenge'
  | 'review'
  | 'study_diary'
  | 'assessment';
export type FamilyTaskStatus = 'draft' | 'published' | 'submitted' | 'scored';
export type RequirementType = 'text' | 'choice' | 'judge' | 'image';
export type MessageType = 'system' | 'team_broadcast' | 'group_broadcast' | 'direct' | 'sos';
export type CapabilityLevel = '优秀' | '良好' | '待提升' | '待改进';
export type CapabilitySourceBreakdown = Array<{ label: string; value: number }>;
export type CapabilityIndicatorDimension = { label: string; score: number; average: number };
export type TalentSource = 'student_test' | 'parent_review';
export type OrderType = '研学宝' | '团队报名' | '专家课程' | '难题挑战' | '增值服务';
export type OrderStatus = '未查看' | '未处理' | '待缴费' | '已缴费' | '待支付' | '已支付';

export type CapabilityElement = {
  id: string;
  elementKey: string;
  planeKey: CapabilityPlaneKey;
  planeTitle: string;
  score: number;
  averageScore: number;
  source: 'self_test' | 'parent_review' | 'team_task' | 'family_task' | 'teacher_review';
  level: CapabilityLevel;
  recordedAt: string;
  sourceBreakdown: CapabilitySourceBreakdown;
  indicatorDimensions: CapabilityIndicatorDimension[];
};

export type StudentAccount = {
  username: string;
  initialPassword: string;
  createdAt: string;
  status: '待激活' | '已激活';
};

export type ParentProfile = {
  id: string;
  name: string;
  role: string;
  phone: string;
  accountName: string;
  city: string;
  relationLabel: string;
  avatar: string;
  memberSince: string;
};

export type DemoScanDevice = {
  id: string;
  deviceCode: string;
  name: string;
  model: string;
  serialNumber: string;
  batteryPercent: number;
  lastOnlineAt: string;
  mode: 'sale' | 'rental';
};

export type PaymentRecord = {
  id: string;
  title: string;
  amount: number;
  createdAt: string;
  type: '充值' | '消费' | '退款';
  status: '成功' | '处理中';
};

export type ParentPaymentCard = {
  id: string;
  provider: '支付宝亲子卡';
  alias: string;
  account: string;
  accountTail: string;
  status: '已绑定' | '未绑定' | '授权中';
  bindType: 'alipay_family_pay';
  authStatus: '待授权' | '授权中' | '已授权';
  limitAmount: number;
  boundAt: string;
  updatedAt: string;
  balance: number;
  records: PaymentRecord[];
};

export type NetDiskSyncRecord = {
  id: string;
  title: string;
  fileType: '照片' | '作品' | '报告';
  syncedAt: string;
  status: '已同步' | '同步中';
};

export type ParentNetDisk = {
  provider: '百度网盘';
  alias: string;
  account: string;
  status: '已绑定' | '未绑定' | '授权中';
  bindMethod: 'mock_qr';
  authStatus: '待扫码' | '授权中' | '已授权';
  qrSessionId: string;
  boundAt: string;
  capacityUsed: number;
  capacityTotal: number;
  lastSyncAt: string;
  syncRecords: NetDiskSyncRecord[];
};

export type DeviceContactCategory = '家长' | '导师' | '紧急联系人' | '其他';

export type DeviceContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  allowed: boolean;
  category: DeviceContactCategory;
  isEmergency: boolean;
  updatedAt: string;
};

export type DeviceQuietTime = {
  id: string;
  label: string;
  start: string;
  end: string;
  weekdays: number[];
  enabled: boolean;
  updatedAt: string;
  syncStatus: '已同步' | '待同步';
};

export type DeviceTrackType = 'home' | 'school' | 'training' | 'current' | 'study';

export type DeviceTrack = {
  id: string;
  time: string;
  title: string;
  address: string;
  distanceMeters: number;
  x: number;
  y: number;
  type: DeviceTrackType;
  stayDuration: string;
  status: string;
};

export type ParentDevice = {
  id: string;
  name: string;
  deviceCode: string;
  model: string;
  serialNumber: string;
  batteryPercent: number;
  lastOnlineAt: string;
  mode: 'sale' | 'rental';
  boundAt: string;
  paymentCard?: ParentPaymentCard;
  netDisk?: ParentNetDisk;
  contacts: DeviceContact[];
  quietTimes: DeviceQuietTime[];
  latestLocation?: {
    address: string;
    receivedAt: string;
    mapProvider: '高德地图' | '百度地图';
    navigationText: string;
  };
  tracks: DeviceTrack[];
};

export type StudentTalentProfile = {
  strongestTalent: string;
  source: TalentSource;
  parentTalent: string;
  testCompleted: boolean;
  updatedAt: string;
};

export type StudentInterestProfile = {
  studentTags: string[];
  parentTags: string[];
  updatedAt: string;
};

export type GrowthValueLedgerRecord = {
  id: string;
  studentId: string;
  title: string;
  type: 'earn' | 'spend';
  value: number;
  availableAfter: number;
  occurredAt: string;
  source: string;
  relatedId?: string;
};

export type CapabilityAdjustmentRecord = {
  id: string;
  studentId: string;
  recordType: '家庭研学' | '日常任务' | '难题挑战' | '家长评测';
  sourceTitle: string;
  organizationName: string;
  teamOrTaskName: string;
  reportTitle: string;
  reportId?: string;
  evaluator: string;
  evaluatedAt: string;
  sourceType: '导师' | '家长' | '专家' | '系统';
  elementRecords: Array<{
    elementKey: string;
    beforeIndex: number;
    assessmentValue: number;
    afterIndex: number;
  }>;
};

export type ParentFamilyTeam = {
  id: string;
  name: string;
  type: 'long_term' | 'activity';
  theme: string;
  location: string;
  studyDate: string;
  goal: string;
  studentIds: string[];
  inviteCode: string;
  createdAt: string;
};

export type ParentDeviceAd = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  features: string[];
  imageTone: 'ability' | 'safety' | 'ai';
};

export type ParentStudent = {
  id: string;
  yxbId: string;
  name: string;
  idNumber: string;
  birthday: string;
  age: number;
  city: string;
  school: string;
  grade: string;
  avatar: string;
  avatarImage?: string;
  growthValue: number;
  growthWallet: {
    total: number;
    available: number;
  };
  talentProfile: StudentTalentProfile;
  interestProfile: StudentInterestProfile;
  account: StudentAccount;
  setupState: 'pending_device' | 'ready';
  device?: ParentDevice;
  capabilities: CapabilityElement[];
};

export type CapabilityReport = {
  id: string;
  studentId: string;
  type: 'student_self_test' | 'parent_review' | 'study_report';
  title: string;
  date: string;
  organizationName?: string;
  teamOrTaskName?: string;
  evaluator?: string;
  evaluatedAt?: string;
  sourceType?: '导师' | '家长' | '专家' | '系统';
  recordType?: CapabilityAdjustmentRecord['recordType'];
  planeTitle: string;
  summary: string;
  rows: Array<{ elementKey: string; score: number; latestIndex: number; average: number }>;
};

export type PortfolioTimelineEntryType =
  | 'report'
  | 'task'
  | 'work_submitted'
  | 'work_scored'
  | 'ai_qa'
  | 'ai_creation'
  | 'photo'
  | 'achievement'
  | 'expert_course'
  | 'challenge'
  | 'review'
  | 'study_diary'
  | 'flash_note'
  | 'device_diary'
  | 'growth_value'
  | 'capability_update'
  | 'assessment';

export type PortfolioAttachment = {
  id: string;
  type: '照片' | '视频' | '音频' | '文档' | 'AI绘图' | 'AI视频' | 'AI回答' | '闪记引用' | '打卡证明';
  title: string;
  summary?: string;
  duration?: string;
  locationLabel?: string;
  capturedAt?: string;
  fileUrl?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedBy?: string;
};

export type PortfolioWorkAnswer = {
  fieldId: string;
  kind: 'text' | 'single_choice' | 'multiple_choice' | 'image_upload' | 'video_upload' | 'audio_upload' | 'link';
  label: string;
  value?: string | string[];
  files?: PortfolioAttachment[];
};

export type PortfolioFlashNoteLink = {
  id: string;
  title: string;
  type: 'voice_note' | 'video_note';
  transcript?: string;
  photoCount?: number;
  duration?: string;
};

export type ParentStudyWork = {
  id: string;
  taskId?: string;
  studentId: string;
  taskTitle: string;
  title: string;
  studyDate: string;
  studyType: string;
  submittedAt: string;
  updatedAt: string;
  status: 'synced' | 'scored';
  workCategory: string;
  topicType: string;
  workKind: string;
  workMode: string;
  completionMode: string;
  summary: string;
  currentContent: string;
  textContent?: string;
  rating?: string;
  mentorComment?: string;
  parentComment?: string;
  aiScore?: number;
  parentScore?: number;
  formAnswers: PortfolioWorkAnswer[];
  attachments: PortfolioAttachment[];
  linkedFlashNotes: PortfolioFlashNoteLink[];
};

export type ParentAiRecordBlock = {
  type: 'text' | 'image' | 'answer' | 'attachment';
  content: string;
};

export type ParentAiRecord = {
  id: string;
  studentId: string;
  kind: 'qa' | 'creation';
  scene: 'ask' | 'identify' | 'ai_draw' | 'ai_video';
  agentName: string;
  title: string;
  summary: string;
  createdAt: string;
  questionCount?: number;
  workType?: string;
  prompt?: string;
  relatedWorkId?: string;
  blocks: ParentAiRecordBlock[];
};

export type ParentPhotoRecord = {
  id: string;
  studentId: string;
  title: string;
  createdAt: string;
  content: string;
  photoType: '团队照片' | '小组照片' | '学员照片' | '作品附件';
  sourceLabel: string;
  summary: string;
  relatedWorkId?: string;
  uploadedBy?: string;
  attachments: PortfolioAttachment[];
};

export type ParentDeviceDiary = {
  id: string;
  studentId: string;
  title: string;
  summary: string;
  createdAt: string;
  content: string;
  sourceLabel: string;
  relatedWorkId?: string;
  attachments: PortfolioAttachment[];
};

export type ParentAchievementRecord = {
  id: string;
  studentId: string;
  title: string;
  summary: string;
  createdAt: string;
  content: string;
  sourceLabel: string;
  relatedWorkId?: string;
  achievementType: '证书' | '奖状' | '徽章' | '作品入选';
  uploadedBy: '老师' | '家长' | '学生' | '系统';
  attachments: PortfolioAttachment[];
};

export type ParentGrowthRecord = {
  id: string;
  studentId: string;
  type: 'growth_value' | 'capability_update';
  category: string;
  sourceType: 'task' | 'self_review' | 'parent_review' | 'teacher_review' | 'self_test';
  title: string;
  value: number;
  delta: number;
  occurredAt: string;
  summary: string;
  displaySource: string;
  relatedId?: string;
};

export type ParentMessageCenterItem = {
  id: string;
  type: MessageType;
  scope: 'team' | 'group' | 'student' | 'system';
  studentId?: string;
  from: string;
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
  relatedKind?: 'work' | 'record' | 'report' | 'ai';
  relatedId?: string;
  locationText?: string;
};

export type PortfolioTimelineEntry = {
  id: string;
  studentId: string;
  entryType: PortfolioTimelineEntryType;
  sourceLabel: string;
  occurredAt: string;
  title: string;
  summary: string;
  relatedId?: string;
  relatedKind?: 'work' | 'record' | 'report' | 'ai';
  rating?: string;
};

export type GrowthDiaryItem = {
  id: string;
  studentId: string;
  type: GrowthDiaryType;
  title: string;
  date: string;
  source: string;
  summary: string;
  rating?: string;
  relatedId?: string;
  content?: string;
  media?: string[];
};

export type TaskRequirement = {
  id: string;
  type: RequirementType;
  requirement: string;
};

export type FamilyTask = {
  id: string;
  familyTeamId: string;
  title: string;
  base: string;
  taskType: string;
  studyDate: string;
  points: number;
  description: string;
  capabilityTags: string[];
  requirements: TaskRequirement[];
  status: FamilyTaskStatus;
  assignedStudentIds: string[];
  createdAt: string;
  publishedAt?: string;
};

export type TaskWork = {
  id: string;
  taskId: string;
  studentId: string;
  submittedAt: string;
  status: 'synced' | 'scored';
  contentType: 'text' | 'image' | 'audio' | 'mixed';
  content: string;
  attachments: string[];
  aiScore?: number;
  parentScore?: number;
  actualScore?: number;
  rating?: number;
  comment?: string;
  scoredAt?: string;
};

export type ParentMessage = {
  id: string;
  type: MessageType;
  scope: 'team' | 'group' | 'student' | 'system';
  studentId?: string;
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
};

export type ParentOrder = {
  id: string;
  type: OrderType;
  title: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  studentId?: string;
  productName?: string;
  sourceLabel?: string;
  description?: string;
  receiver?: string;
  address?: string;
  phone?: string;
  paidAt?: string;
};

export type TaskTemplate = {
  id: string;
  base: string;
  taskType: string;
  title: string;
  points: number;
  description: string;
  capabilityTags: string[];
  requirements: TaskRequirement[];
};

export type ParentState = {
  version: number;
  parentProfile: ParentProfile;
  selectedStudentId: string | null;
  selectedFamilyTeamId: string | null;
  students: ParentStudent[];
  familyTeams: ParentFamilyTeam[];
  reports: CapabilityReport[];
  portfolioWorks: ParentStudyWork[];
  portfolioAiRecords: ParentAiRecord[];
  portfolioGrowthRecords: ParentGrowthRecord[];
  portfolioPhotos: ParentPhotoRecord[];
  portfolioAchievements: ParentAchievementRecord[];
  portfolioDeviceDiaries: ParentDeviceDiary[];
  messageCenterItems: ParentMessageCenterItem[];
  growthValueLedger: GrowthValueLedgerRecord[];
  capabilityAdjustmentRecords: CapabilityAdjustmentRecord[];
  diaryItems: GrowthDiaryItem[];
  familyTasks: FamilyTask[];
  works: TaskWork[];
  messages: ParentMessage[];
  orders: ParentOrder[];
  deviceAds: ParentDeviceAd[];
  scanDevices: DemoScanDevice[];
};

type ParentContextValue = {
  hydrated: boolean;
  state: ParentState;
  selectedStudent: ParentStudent | null;
  capabilityAverage: number;
  selectStudent: (studentId: string) => void;
  selectFamilyTeam: (teamId: string) => void;
  resetDemoData: () => void;
  addStudent: (input: StudentInput) => string;
  updateStudent: (studentId: string, input: StudentInput) => void;
  updateTalentInterest: (studentId: string, input: TalentInterestInput) => void;
  bindDevice: (studentId: string, input: DeviceInput) => void;
  startAlipayFamilyPayBind: (studentId: string, input: PaymentCardInput) => void;
  confirmAlipayFamilyPayBind: (studentId: string, input: PaymentCardInput) => void;
  savePaymentCard: (studentId: string, input: PaymentCardInput | string) => void;
  removePaymentCard: (studentId: string) => void;
  addPaymentRecord: (studentId: string, input: PaymentRecordInput) => void;
  startNetDiskQrBind: (studentId: string) => void;
  confirmNetDiskQrBind: (studentId: string) => void;
  saveNetDisk: (studentId: string, input: NetDiskInput | string) => void;
  removeNetDisk: (studentId: string) => void;
  syncNetDisk: (studentId: string) => void;
  addContact: (studentId: string, input: ContactInput) => void;
  updateContact: (studentId: string, contactId: string, input: ContactInput) => void;
  toggleContact: (studentId: string, contactId: string) => void;
  deleteContact: (studentId: string, contactId: string) => void;
  addQuietTime: (studentId: string, input: QuietTimeInput) => void;
  updateQuietTime: (studentId: string, quietTimeId: string, input: QuietTimeInput) => void;
  toggleQuietTime: (studentId: string, quietTimeId: string) => void;
  deleteQuietTime: (studentId: string, quietTimeId: string) => void;
  completeAssessment: (studentId: string, planeKey: CapabilityPlaneKey | 'all', answers: Record<string, number>) => void;
  createTasksFromTemplates: (input: QuickTaskInput) => string[];
  createCustomTask: (input: CustomTaskInput) => string;
  updateTask: (taskId: string, input: CustomTaskInput) => void;
  createFamilyTeam: (input: FamilyTeamInput) => string;
  joinFamilyTeamFromInvite: (input: InviteJoinInput) => string;
  publishTasks: (taskIds: string[], studentIds: string[]) => void;
  syncDeviceWork: (taskId: string, studentId: string) => void;
  scoreWork: (workId: string, input: ScoreInput) => void;
  addMessage: (input: MessageInput) => void;
  uploadPortfolioPhoto: (input: PortfolioMediaInput) => string;
  uploadPortfolioAchievement: (input: PortfolioAchievementInput) => string;
  updatePortfolioPhoto: (recordId: string, input: PortfolioMediaUpdateInput) => void;
  updatePortfolioAchievement: (recordId: string, input: PortfolioMediaUpdateInput) => void;
  deletePortfolioPhoto: (recordId: string) => void;
  deletePortfolioAchievement: (recordId: string) => void;
  createOrder: (input?: Partial<ParentOrder>) => string;
  payOrder: (orderId: string, submitInfo?: Pick<ParentOrder, 'receiver' | 'address' | 'phone'>) => void;
  markOrderViewed: (orderId: string) => void;
};

export type StudentInput = {
  name: string;
  idNumber: string;
  birthday: string;
  city: string;
  school: string;
  grade: string;
  avatar?: string;
  avatarImage?: string;
};

export type TalentInterestInput = {
  strongestTalent: string;
  parentTalent: string;
  studentTags: string[];
  parentTags: string[];
  testCompleted?: boolean;
};

export type DeviceInput = {
  deviceCode: string;
  mode: 'sale' | 'rental';
};

export type PaymentCardInput = {
  account: string;
  alias?: string;
  limitAmount?: number;
};

export type PaymentRecordInput = {
  title: string;
  amount: number;
  type: PaymentRecord['type'];
};

export type NetDiskInput = {
  account: string;
  alias?: string;
};

export type ContactInput = {
  name: string;
  relation: string;
  phone: string;
  category?: DeviceContactCategory;
  isEmergency?: boolean;
  allowed?: boolean;
};

export type QuietTimeInput = {
  label: string;
  start: string;
  end: string;
  weekdays: number[];
  enabled?: boolean;
};

export type QuickTaskInput = {
  familyTeamId?: string;
  studyDate: string;
  destination: string;
  taskTypes: string[];
  capabilityTags: string[];
  templateIds: string[];
};

export type CustomTaskInput = {
  familyTeamId?: string;
  title: string;
  base: string;
  taskType: string;
  studyDate: string;
  points: number;
  description: string;
  capabilityTags: string[];
  requirements: Array<{ type: RequirementType; requirement: string }>;
};

export type FamilyTeamInput = {
  name: string;
  theme: string;
  location: string;
  studyDate: string;
  goal: string;
  studentIds: string[];
};

export type InviteJoinInput = {
  teamId: string;
  childName: string;
  grade: string;
  phone: string;
};

export type ScoreInput = {
  score: number;
  comment: string;
};

export type MessageInput = {
  type: MessageType;
  scope: 'team' | 'group' | 'student' | 'system';
  studentId?: string;
  title: string;
  content: string;
};

export type PortfolioMediaInput = {
  studentId: string;
  title: string;
  summary: string;
  content?: string;
  sourceLabel?: string;
  relatedWorkId?: string;
  uploadedBy?: string;
  attachments: PortfolioAttachment[];
};

export type PortfolioAchievementInput = PortfolioMediaInput & {
  achievementType?: ParentAchievementRecord['achievementType'];
  uploadedBy?: ParentAchievementRecord['uploadedBy'];
};

export type PortfolioMediaUpdateInput = {
  title: string;
  summary: string;
  content?: string;
};

const STORE_KEY = 'yanxuebao_parent_h5_state_v9';
const LEGACY_STORE_KEYS = [
  'yanxuebao_parent_h5_state_v8',
  'yanxuebao_parent_h5_state_v7',
  'yanxuebao_parent_h5_state_v6',
  'yanxuebao_parent_h5_state_v5',
  'yanxuebao_parent_h5_state_v4',
  'yanxuebao_parent_h5_state_v3',
  'yanxuebao_parent_h5_state_v2',
];
const STORE_VERSION = 9;

export const CAPABILITY_PLANES: Array<{
  key: CapabilityPlaneKey;
  title: string;
  summary: string;
  elements: string[];
}> = [
  { key: 'self', title: '自主发展', summary: '身心、自我、问题与批判思维', elements: ['身心健康', '自我管理', '问题解决', '批判思维'] },
  { key: 'learning', title: '科技素养', summary: '人文、沟通、科技与数字素养', elements: ['人文审美', '语言沟通', '科技应用', '数字素养'] },
  { key: 'future', title: '创新发展', summary: '创新、融合、领导与商业思维', elements: ['创新思维', '跨学科融合', '领导能力', '商业思维'] },
  { key: 'social', title: '社会参与', summary: '道德、责任、国家与国际理解', elements: ['公民道德', '社会责任', '国家认同', '国际理解'] },
];

export const TALENT_OPTIONS = ['语言智能', '逻辑-数理智能', '音乐智能', '空间智能', '身体-动觉智能', '自我认识智能', '人际交往智能', '自然观察智能'];

export const INTEREST_GROUPS: Array<{ group: string; tags: string[] }> = [
  { group: '前沿科技', tags: ['AI 智能', '3D 打印', '编程', '机器人', '无人机', 'VR 创作', '智能硬件', '网络安全'] },
  { group: '科创发明', tags: ['小发明', '小制作', '科学实验', '创客造物', '装置设计', '手工创意', '创意改良'] },
  { group: '商业创业', tags: ['创业', '经营', '理财', '运营', '品牌设计', '市场调研'] },
  { group: '文学创作', tags: ['阅读', '写作', '演讲', '朗诵', '辩论', '外语交际'] },
  { group: '艺术表演', tags: ['书法', '绘画', '演奏', '歌唱', '戏曲', '舞蹈', '主持', 'Cosplay'] },
  { group: '体育运动', tags: ['球类', '棋类', '田径', '武术', '格斗', '游泳', '攀岩', '轮滑', '骑行'] },
  { group: '自然研学', tags: ['生态观察', '园艺种植', '天文观测', '地理探究', '环保实践'] },
  { group: '模型手作', tags: ['积木', '航模', '木工', '陶艺', '泥塑', '编织', '布艺', '折纸'] },
  { group: '新媒体', tags: ['摄影', '剪辑', '动漫', '配音', '二次元'] },
  { group: '逻辑益智', tags: ['数独', '魔方', '桌游', '速记'] },
];

export const INTEREST_OPTIONS = INTEREST_GROUPS.flatMap((group) => group.tags);

export const TASK_LIBRARY: TaskTemplate[] = [
  {
    id: 'tpl_museum_01',
    base: '深圳海洋馆',
    taskType: '观察记录',
    title: '海洋动物行为观察',
    points: 20,
    description: '观察一种海洋动物的行为，用照片和文字说明它的生活习性。',
    capabilityTags: ['问题解决', '科技应用', '语言沟通'],
    requirements: [
      { id: 'req_tpl_museum_01_1', type: 'image', requirement: '拍摄 1 张观察对象照片' },
      { id: 'req_tpl_museum_01_2', type: 'text', requirement: '写下 80 字以上观察记录' },
    ],
  },
  {
    id: 'tpl_museum_02',
    base: '城市博物馆',
    taskType: '问答任务',
    title: '一件文物的故事',
    points: 18,
    description: '选择一件展品，说明它来自哪里、有什么用途、今天还能给我们什么启发。',
    capabilityTags: ['人文审美', '语言沟通', '批判思维'],
    requirements: [
      { id: 'req_tpl_museum_02_1', type: 'image', requirement: '拍摄展品或展牌照片' },
      { id: 'req_tpl_museum_02_2', type: 'text', requirement: '用自己的话讲述展品故事' },
    ],
  },
  {
    id: 'tpl_park_01',
    base: '社区公园',
    taskType: '调查任务',
    title: '公园友好度调查',
    points: 16,
    description: '观察公园里儿童、老人和游客的使用情况，提出一个小改进建议。',
    capabilityTags: ['社会责任', '问题解决', '创新思维'],
    requirements: [
      { id: 'req_tpl_park_01_1', type: 'choice', requirement: '选择你观察到的主要使用人群' },
      { id: 'req_tpl_park_01_2', type: 'text', requirement: '写下一个改进建议' },
    ],
  },
  {
    id: 'tpl_home_01',
    base: '家庭厨房',
    taskType: '创作任务',
    title: '设计一份健康早餐',
    points: 15,
    description: '用身边食材设计一份早餐，说明营养搭配和制作步骤。',
    capabilityTags: ['身心健康', '自我管理', '创新思维'],
    requirements: [
      { id: 'req_tpl_home_01_1', type: 'image', requirement: '拍摄早餐设计草图或成品照片' },
      { id: 'req_tpl_home_01_2', type: 'text', requirement: '写下营养搭配说明' },
    ],
  },
  {
    id: 'tpl_business_01',
    base: '社区商店',
    taskType: '商业体验',
    title: '一个小店如何运转',
    points: 20,
    description: '观察一家小店的商品、顾客和服务，画出它的简单商业模式。',
    capabilityTags: ['商业思维', '语言沟通', '跨学科融合'],
    requirements: [
      { id: 'req_tpl_business_01_1', type: 'text', requirement: '写下小店的顾客和主要商品' },
      { id: 'req_tpl_business_01_2', type: 'image', requirement: '上传一张观察记录或手绘图' },
    ],
  },
];

const ASSESSMENT_QUESTIONS = [
  '孩子在相关活动中能主动观察并说出自己的发现。',
  '遇到困难时，孩子愿意尝试不同方法继续完成任务。',
  '完成任务后，孩子会复盘哪里做得好、哪里还能改进。',
  '与家人或同伴合作时，孩子能清楚表达自己的想法。',
];

const SCAN_DEVICE_POOL: DemoScanDevice[] = [
  {
    id: 'scan_01',
    deviceCode: 'YXB-DEV-0001',
    name: '研学宝智能硬件',
    model: 'YXB Explorer S1',
    serialNumber: 'SN-YXB-20260416-0001',
    batteryPercent: 86,
    lastOnlineAt: '2026-04-30 09:42',
    mode: 'sale',
  },
  {
    id: 'scan_02',
    deviceCode: 'YXB-DEV-0002',
    name: '研学宝智能硬件',
    model: 'YXB Explorer S1',
    serialNumber: 'SN-YXB-20260416-0002',
    batteryPercent: 72,
    lastOnlineAt: '2026-04-30 08:10',
    mode: 'sale',
  },
  {
    id: 'scan_03',
    deviceCode: 'YXB-DEV-1008',
    name: '研学宝智能硬件',
    model: 'YXB Voyage R1',
    serialNumber: 'SN-YXB-20260418-1008',
    batteryPercent: 58,
    lastOnlineAt: '2026-04-30 07:36',
    mode: 'rental',
  },
];

const ParentContext = createContext<ParentContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function nowText() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function calcAge(birthday: string) {
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) {
    return 10;
  }
  const date = new Date();
  let age = date.getFullYear() - birth.getFullYear();
  const monthDiff = date.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && date.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(3, age);
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function levelText(score: number): CapabilityLevel {
  if (score >= 9) {
    return '优秀';
  }
  if (score >= 8) {
    return '良好';
  }
  if (score >= 6) {
    return '待提升';
  }
  return '待改进';
}

export function getCapabilityLevel(score: number): CapabilityLevel {
  return levelText(score);
}

export function getCapabilityLevelColor(level: CapabilityLevel) {
  if (level === '优秀') {
    return '#20bf6b';
  }
  if (level === '良好') {
    return '#2f6bff';
  }
  if (level === '待提升') {
    return '#f5a623';
  }
  return '#ff6b6b';
}

export function getAssessmentQuestions() {
  return ASSESSMENT_QUESTIONS;
}

function capabilitySeed(index: number, offset: number) {
  const values = [8.4, 8.1, 8.7, 7.6, 8.2, 7.9, 8.3, 8, 8.9, 8.5, 7.8, 8.2, 9.1, 7.8, 8.4, 7.6];
  return round1(Math.max(5.4, Math.min(9.5, values[index] + offset)));
}

const DEFAULT_CAPABILITY_SOURCE_BREAKDOWN: CapabilitySourceBreakdown = [
  { label: '学员自测', value: 20 },
  { label: '家长评测', value: 20 },
  { label: '研学评价', value: 60 },
];

const CAPABILITY_DIMENSION_TEMPLATES: Record<
  string,
  {
    baseScore: number;
    dimensions: Array<{ label: string; score: number; average: number }>;
  }
> = {
  身心健康: {
    baseScore: 8.4,
    dimensions: [
      { label: '身体健康', score: 8.8, average: 7.9 },
      { label: '心理健康', score: 8.1, average: 7.6 },
      { label: '合作能力', score: 8.3, average: 7.8 },
      { label: '适应能力', score: 8.4, average: 7.7 },
    ],
  },
  自我管理: {
    baseScore: 8.1,
    dimensions: [
      { label: '自主学习', score: 8.3, average: 7.5 },
      { label: '独立自主', score: 8.0, average: 7.4 },
      { label: '勤于反思', score: 8.1, average: 7.6 },
      { label: '情绪管理', score: 7.9, average: 7.3 },
      { label: '生涯规划', score: 8.2, average: 7.7 },
    ],
  },
  问题解决: {
    baseScore: 8.7,
    dimensions: [
      { label: '发现问题', score: 8.9, average: 8.0 },
      { label: '解决问题', score: 8.6, average: 7.8 },
      { label: '实践能力', score: 8.5, average: 7.9 },
    ],
  },
  批判思维: {
    baseScore: 7.6,
    dimensions: [{ label: '判断能力', score: 7.6, average: 7.2 }],
  },
  人文审美: {
    baseScore: 8.2,
    dimensions: [
      { label: '人文修养', score: 8.1, average: 7.5 },
      { label: '审美能力', score: 8.3, average: 7.7 },
    ],
  },
  语言沟通: {
    baseScore: 7.9,
    dimensions: [
      { label: '语言基础', score: 7.8, average: 7.2 },
      { label: '阅读理解', score: 7.9, average: 7.4 },
      { label: '表达能力', score: 8.0, average: 7.3 },
    ],
  },
  科技应用: {
    baseScore: 8.3,
    dimensions: [
      { label: '科学素养', score: 8.4, average: 7.6 },
      { label: '探究能力', score: 8.2, average: 7.5 },
    ],
  },
  数字素养: {
    baseScore: 8.0,
    dimensions: [
      { label: '数字表达', score: 8.1, average: 7.4 },
      { label: '信息素养', score: 7.9, average: 7.3 },
    ],
  },
  创新思维: {
    baseScore: 8.9,
    dimensions: [{ label: '创新能力', score: 8.9, average: 7.8 }],
  },
  跨学科融合: {
    baseScore: 8.5,
    dimensions: [{ label: '跨学科融合', score: 8.5, average: 7.7 }],
  },
  领导能力: {
    baseScore: 7.8,
    dimensions: [
      { label: '领导能力', score: 7.7, average: 7.2 },
      { label: '协作能力', score: 8.0, average: 7.4 },
      { label: '资源整合', score: 7.8, average: 7.3 },
    ],
  },
  商业思维: {
    baseScore: 8.2,
    dimensions: [
      { label: '商业思维', score: 8.1, average: 7.6 },
      { label: '财商思维', score: 8.3, average: 7.5 },
      { label: '创业思维', score: 8.2, average: 7.7 },
    ],
  },
  公民道德: {
    baseScore: 9.1,
    dimensions: [
      { label: '尊重生命', score: 9.2, average: 8.0 },
      { label: '公平正义', score: 8.9, average: 7.7 },
      { label: '孝亲仁爱', score: 9.3, average: 8.1 },
      { label: '诚信守信', score: 9.0, average: 7.8 },
    ],
  },
  社会责任: {
    baseScore: 7.8,
    dimensions: [
      { label: '劳动意识', score: 7.7, average: 7.0 },
      { label: '集体意识', score: 8.0, average: 7.2 },
      { label: '环境意识', score: 7.8, average: 6.9 },
      { label: '法律意识', score: 7.6, average: 6.8 },
    ],
  },
  国家认同: {
    baseScore: 8.4,
    dimensions: [
      { label: '民族精神', score: 8.5, average: 7.6 },
      { label: '政治觉悟', score: 8.2, average: 7.3 },
      { label: '家国情怀', score: 8.6, average: 7.6 },
    ],
  },
  国际理解: {
    baseScore: 7.6,
    dimensions: [
      { label: '国际视野', score: 7.5, average: 6.9 },
      { label: '发展共存', score: 7.7, average: 7.0 },
      { label: '尊重包容', score: 7.6, average: 7.1 },
    ],
  },
};

function clampCapabilityScore(score: number) {
  return round1(Math.max(5.4, Math.min(9.6, score)));
}

function buildIndicatorDimensions(elementKey: string, score: number): CapabilityIndicatorDimension[] {
  const template = CAPABILITY_DIMENSION_TEMPLATES[elementKey];
  if (!template) {
    return [
      { label: elementKey, score: clampCapabilityScore(score), average: round1(Math.max(6, score - 0.6)) },
    ];
  }

  const shift = score - template.baseScore;
  return template.dimensions.map((dimension) => ({
    label: dimension.label,
    score: clampCapabilityScore(dimension.score + shift),
    average: dimension.average,
  }));
}

function normalizeCapability(
  capability: Omit<CapabilityElement, 'level' | 'recordedAt' | 'sourceBreakdown' | 'indicatorDimensions'> &
    Partial<Pick<CapabilityElement, 'level' | 'recordedAt' | 'sourceBreakdown' | 'indicatorDimensions'>> &
    Partial<{ updatedAt: string }>,
): CapabilityElement {
  return {
    id: capability.id,
    elementKey: capability.elementKey,
    planeKey: capability.planeKey,
    planeTitle: capability.planeTitle,
    score: round1(capability.score),
    averageScore: round1(capability.averageScore),
    source: capability.source,
    level: capability.level ?? getCapabilityLevel(capability.score),
    recordedAt: capability.recordedAt ?? capability.updatedAt ?? nowIso(),
    sourceBreakdown:
      capability.sourceBreakdown?.length
        ? clone(capability.sourceBreakdown)
        : clone(DEFAULT_CAPABILITY_SOURCE_BREAKDOWN),
    indicatorDimensions:
      capability.indicatorDimensions?.length
        ? capability.indicatorDimensions.map((item) => ({
            label: item.label,
            score: round1(item.score),
            average: round1(item.average),
          }))
        : buildIndicatorDimensions(capability.elementKey, capability.score),
  };
}

function buildCapabilities(offset = 0): CapabilityElement[] {
  let index = 0;
  return CAPABILITY_PLANES.flatMap((plane) =>
    plane.elements.map((element) => {
      const score = capabilitySeed(index, offset);
      const item = normalizeCapability({
        id: `cap_${plane.key}_${index + 1}`,
        elementKey: element,
        planeKey: plane.key,
        planeTitle: plane.title,
        score,
        averageScore: round1(7.2 + (index % 4) * 0.18),
        source: index % 3 === 0 ? 'teacher_review' : index % 3 === 1 ? 'team_task' : 'parent_review',
        recordedAt: '2026-04-30T04:36:44.294Z',
      });
      index += 1;
      return item;
    }),
  );
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildParentProfile(): ParentProfile {
  return {
    id: 'parent_demo',
    name: '林女士',
    role: '学员家长',
    phone: '138****0001',
    accountName: 'parent_demo',
    city: '深圳',
    relationLabel: '已绑定 2 位学员',
    avatar: '林',
    memberSince: '2026-04-01',
  };
}

function nextYxbId(students: ParentStudent[]) {
  const maxId = students.reduce((max, student) => Math.max(max, Number(student.yxbId) || 80000), 80000);
  return String(maxId + 1);
}

function buildStudentAccount(yxbId: string, activated = false): StudentAccount {
  return {
    username: `stu${yxbId}`,
    initialPassword: `Yxb${new Date().getFullYear()}!`,
    createdAt: nowText(),
    status: activated ? '已激活' : '待激活',
  };
}

function buildDefaultTalentProfile(offset = 0): StudentTalentProfile {
  const talent = TALENT_OPTIONS[Math.abs(offset) % TALENT_OPTIONS.length] ?? TALENT_OPTIONS[0];
  return {
    strongestTalent: talent,
    source: offset % 2 === 0 ? 'student_test' : 'parent_review',
    parentTalent: talent,
    testCompleted: offset % 2 === 0,
    updatedAt: nowText(),
  };
}

function buildDefaultInterestProfile(offset = 0): StudentInterestProfile {
  const start = Math.abs(offset) % Math.max(INTEREST_OPTIONS.length - 4, 1);
  return {
    studentTags: INTEREST_OPTIONS.slice(start, start + 4),
    parentTags: INTEREST_OPTIONS.slice(start + 2, start + 6),
    updatedAt: nowText(),
  };
}

function buildGrowthWallet(growthValue: number) {
  return {
    total: growthValue,
    available: Math.max(0, Math.round(growthValue * 0.72)),
  };
}

function buildDevice(deviceCode: string, mode?: 'sale' | 'rental'): ParentDevice {
  const scanDevice = SCAN_DEVICE_POOL.find((item) => item.deviceCode === deviceCode);
  const resolvedMode = mode ?? scanDevice?.mode ?? 'sale';

  return {
    id: makeId('device'),
    name: scanDevice?.name ?? '研学宝智能硬件',
    deviceCode,
    model: scanDevice?.model ?? 'YXB Explorer S1',
    serialNumber: scanDevice?.serialNumber ?? `SN-${deviceCode.replaceAll('-', '')}`,
    batteryPercent: scanDevice?.batteryPercent ?? 80,
    lastOnlineAt: scanDevice?.lastOnlineAt ?? nowText(),
    mode: resolvedMode,
    boundAt: nowText(),
    paymentCard: {
      id: 'payment_card_01',
      provider: '支付宝亲子卡',
      alias: '小宇日常支付卡',
      account: '支付宝亲子卡 6228',
      accountTail: '6228',
      status: '已绑定',
      bindType: 'alipay_family_pay',
      authStatus: '已授权',
      limitAmount: 300,
      boundAt: '2026-04-15 20:10',
      updatedAt: '2026-04-15 20:10',
      balance: 128.5,
      records: [
        { id: 'pay_01', title: '海洋馆纪念章', amount: -18, createdAt: '2026-04-16 15:20', type: '消费', status: '成功' },
        { id: 'pay_02', title: '家长充值', amount: 100, createdAt: '2026-04-15 20:10', type: '充值', status: '成功' },
      ],
    },
    netDisk: {
      provider: '百度网盘',
      alias: '家庭研学资料库',
      account: 'yxb-family-demo',
      status: '已绑定',
      bindMethod: 'mock_qr',
      authStatus: '已授权',
      qrSessionId: 'qr_netdisk_demo_01',
      boundAt: '2026-04-15 20:18',
      capacityUsed: 6.8,
      capacityTotal: 20,
      lastSyncAt: '2026-04-16 18:20',
      syncRecords: [
        { id: 'sync_01', title: '海洋馆研学照片 18 张', fileType: '照片', syncedAt: '2026-04-16 18:20', status: '已同步' },
        { id: 'sync_02', title: '海洋生态观察报告', fileType: '报告', syncedAt: '2026-04-16 17:50', status: '已同步' },
      ],
    },
    contacts: [
      { id: 'contact_01', name: '妈妈', relation: '家长', phone: '13800000001', allowed: true, category: '家长', isEmergency: true, updatedAt: '2026-04-15 20:12' },
      { id: 'contact_02', name: '爸爸', relation: '家长', phone: '13800000002', allowed: true, category: '家长', isEmergency: false, updatedAt: '2026-04-15 20:12' },
      { id: 'contact_03', name: '研学导师王老师', relation: '导师', phone: '13900000003', allowed: true, category: '导师', isEmergency: false, updatedAt: '2026-04-16 09:00' },
    ],
    quietTimes: [
      { id: 'quiet_01', label: '上课时间', start: '08:00', end: '12:00', weekdays: [1, 2, 3, 4, 5], enabled: true, updatedAt: '2026-04-15 20:15', syncStatus: '已同步' },
      { id: 'quiet_02', label: '晚间休息', start: '21:30', end: '07:00', weekdays: [1, 2, 3, 4, 5], enabled: true, updatedAt: '2026-04-15 20:15', syncStatus: '已同步' },
      { id: 'quiet_03', label: '周末开放前休息', start: '23:00', end: '08:00', weekdays: [6, 0], enabled: false, updatedAt: '2026-04-15 20:15', syncStatus: '已同步' },
    ],
    latestLocation: {
      address: '深圳市南山区科技园高新南一道附近',
      receivedAt: '2026-04-16 20:10',
      mapProvider: '高德地图',
      navigationText: '已模拟拉起地图导航',
    },
    tracks: [
      { id: 'track_01', time: '08:12', title: '到达学校', address: '深圳市南山区科技园文华学校', distanceMeters: 0, x: 11, y: 54, type: 'home', stayDuration: '停留 7小时24分', status: '已到达' },
      { id: 'track_02', time: '11:45', title: '校内活动', address: '深圳市南山区科技园文华学校', distanceMeters: 40, x: 30, y: 51, type: 'school', stayDuration: '校内研学', status: '已记录' },
      { id: 'track_03', time: '14:20', title: '到达培训班', address: '深圳市南山区科技园培训中心', distanceMeters: 220, x: 52, y: 53, type: 'training', stayDuration: '停留 2小时34分', status: '已到达' },
      { id: 'track_04', time: '17:36', title: '离开学校', address: '深圳市南山区科技园文华学校', distanceMeters: 120, x: 74, y: 55, type: 'school', stayDuration: '停留 2小时34分', status: '已离开' },
      { id: 'track_05', time: '20:10', title: '到达当前位置', address: '深圳市南山区科技园高新南一道附近', distanceMeters: 80, x: 92, y: 62, type: 'current', stayDuration: '持续更新中', status: '当前位置' },
    ],
  };
}

function buildDemoStudent(
  input: Omit<ParentStudent, 'age' | 'account' | 'setupState' | 'idNumber' | 'growthWallet' | 'talentProfile' | 'interestProfile'> &
    Partial<Pick<ParentStudent, 'idNumber' | 'growthWallet' | 'talentProfile' | 'interestProfile'>> & {
    accountActive?: boolean;
    setupState?: ParentStudent['setupState'];
  },
): ParentStudent {
  return {
    ...input,
    idNumber: input.idNumber ?? `ID${input.yxbId}20150918`,
    age: calcAge(input.birthday),
    growthWallet: input.growthWallet ?? buildGrowthWallet(input.growthValue),
    talentProfile: input.talentProfile ?? buildDefaultTalentProfile(Number(input.yxbId.slice(-1))),
    interestProfile: input.interestProfile ?? buildDefaultInterestProfile(Number(input.yxbId.slice(-1))),
    account: buildStudentAccount(input.yxbId, input.accountActive ?? false),
    setupState: input.setupState ?? (input.device ? 'ready' : 'pending_device'),
  };
}

function toTimestamp(value: string) {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const timestamp = new Date(normalized).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function compareByDateDesc(left: string, right: string) {
  return toTimestamp(right) - toTimestamp(left);
}

function inferStudyType(base?: string) {
  if (!base) {
    return '家庭研学';
  }
  if (base.includes('家庭') || base.includes('社区')) {
    return '家庭研学';
  }
  return '团体研学';
}

function inferAttachmentType(title: string): PortfolioAttachment['type'] {
  if (title.includes('视频')) {
    return '视频';
  }
  if (title.includes('语音') || title.includes('音频')) {
    return '音频';
  }
  if (title.includes('文档') || title.includes('记录')) {
    return '文档';
  }
  if (title.includes('闪记')) {
    return '闪记引用';
  }
  if (title.includes('AI 海报') || title.includes('AI 绘图')) {
    return 'AI绘图';
  }
  if (title.includes('AI 视频')) {
    return 'AI视频';
  }
  if (title.includes('AI 答复')) {
    return 'AI回答';
  }
  return '照片';
}

function buildAttachment(title: string, overrides: Partial<PortfolioAttachment> = {}): PortfolioAttachment {
  return {
    id: overrides.id ?? makeId('attachment'),
    type: overrides.type ?? inferAttachmentType(title),
    title,
    summary: overrides.summary,
    duration: overrides.duration,
    locationLabel: overrides.locationLabel,
    capturedAt: overrides.capturedAt,
    fileUrl: overrides.fileUrl,
    mimeType: overrides.mimeType,
    fileSize: overrides.fileSize,
    uploadedBy: overrides.uploadedBy,
  };
}

function buildWorkAnswers(task: FamilyTask | undefined, work: TaskWork): PortfolioWorkAnswer[] {
  if (!task) {
    return [
      {
        fieldId: makeId('answer'),
        kind: 'text',
        label: '作品说明',
        value: work.content,
      },
    ];
  }

  return task.requirements.map((requirement, index) => {
    if (requirement.type === 'image') {
      return {
        fieldId: requirement.id,
        kind: 'image_upload',
        label: requirement.requirement,
        files: work.attachments.map((attachment, attachmentIndex) =>
          buildAttachment(attachment, {
            id: `${requirement.id}_${attachmentIndex}`,
            capturedAt: work.submittedAt,
            locationLabel: task.base,
          }),
        ),
      };
    }

    if (requirement.type === 'choice') {
      return {
        fieldId: requirement.id,
        kind: 'single_choice',
        label: requirement.requirement,
        value: '已完成观察并提交建议',
      };
    }

    if (requirement.type === 'judge') {
      return {
        fieldId: requirement.id,
        kind: 'single_choice',
        label: requirement.requirement,
        value: '是',
      };
    }

    return {
      fieldId: requirement.id,
      kind: 'text',
      label: requirement.requirement,
      value: index === 0 ? work.content : '已按要求完成并同步到家长端。',
    };
  });
}

function buildFlashNoteLinks(work: TaskWork): PortfolioFlashNoteLink[] {
  if (!work.attachments.some((item) => item.includes('语音'))) {
    return [];
  }

  return [
    {
      id: `${work.id}_flash_01`,
      title: '语音闪记摘录',
      type: 'voice_note',
      transcript: '现场用语音补充了海豚协作和回声定位的观察结论。',
      duration: '00:36',
    },
  ];
}

function buildPortfolioWorkFromTaskWork(work: TaskWork, task?: FamilyTask): ParentStudyWork {
  const parentComment = work.comment ?? (work.status === 'scored' ? '家长已完成评分并给出点评。' : undefined);
  return {
    id: work.id,
    taskId: work.taskId,
    studentId: work.studentId,
    taskTitle: task?.title ?? '家庭研学任务',
    title: `${task?.title ?? '家庭研学任务'}作品`,
    studyDate: task?.studyDate ?? work.submittedAt.slice(0, 10),
    studyType: inferStudyType(task?.base),
    submittedAt: work.submittedAt,
    updatedAt: work.submittedAt,
    status: work.status,
    workCategory: task?.taskType ?? '综合记录',
    topicType: task?.base ?? '现场研学',
    workKind: work.contentType === 'image' ? '图片作品' : work.contentType === 'audio' ? '语音作品' : '图文作品',
    workMode: work.contentType,
    completionMode: '独立完成',
    summary: work.content,
    currentContent: work.content,
    textContent: work.content,
    rating: typeof work.rating === 'number' ? `${work.rating}/10` : undefined,
    mentorComment: '设备端 AI 与导师已根据任务目标给出初评建议。',
    parentComment,
    aiScore: work.aiScore,
    parentScore: work.parentScore,
    formAnswers: buildWorkAnswers(task, work),
    attachments: work.attachments.map((attachment, index) =>
      buildAttachment(attachment, {
        id: `${work.id}_attachment_${index}`,
        capturedAt: work.submittedAt,
        locationLabel: task?.base,
      }),
    ),
    linkedFlashNotes: buildFlashNoteLinks(work),
  };
}

function buildStudyWork(input: {
  id: string;
  studentId: string;
  taskTitle: string;
  title?: string;
  studyDate: string;
  studyType: string;
  submittedAt: string;
  updatedAt: string;
  status?: ParentStudyWork['status'];
  workCategory: string;
  topicType: string;
  workKind: string;
  workMode?: string;
  completionMode?: string;
  summary: string;
  currentContent: string;
  attachments?: PortfolioAttachment[];
  linkedFlashNotes?: PortfolioFlashNoteLink[];
  aiScore?: number;
  parentScore?: number;
  rating?: string;
  mentorComment?: string;
  parentComment?: string;
}): ParentStudyWork {
  return {
    id: input.id,
    studentId: input.studentId,
    taskTitle: input.taskTitle,
    title: input.title ?? `${input.taskTitle}作品`,
    studyDate: input.studyDate,
    studyType: input.studyType,
    submittedAt: input.submittedAt,
    updatedAt: input.updatedAt,
    status: input.status ?? 'synced',
    workCategory: input.workCategory,
    topicType: input.topicType,
    workKind: input.workKind,
    workMode: input.workMode ?? 'mixed',
    completionMode: input.completionMode ?? '独立完成',
    summary: input.summary,
    currentContent: input.currentContent,
    textContent: input.currentContent,
    rating: input.rating,
    mentorComment: input.mentorComment ?? '设备端已完成内容同步，等待家长或导师查看。',
    parentComment: input.parentComment,
    aiScore: input.aiScore,
    parentScore: input.parentScore,
    formAnswers: [
      {
        fieldId: `${input.id}_answer_01`,
        kind: 'text',
        label: '作品说明',
        value: input.currentContent,
      },
    ],
    attachments: input.attachments ?? [],
    linkedFlashNotes: input.linkedFlashNotes ?? [],
  };
}

function buildMessageCenterItemFromMessage(message: ParentMessage): ParentMessageCenterItem {
  return {
    id: message.id,
    type: message.type,
    scope: message.scope,
    studentId: message.studentId,
    from:
      message.type === 'system'
        ? '系统中心'
        : message.type === 'sos'
          ? 'SoS 安全提醒'
          : message.scope === 'team'
            ? '团队广播'
            : message.scope === 'group'
              ? '小组广播'
              : '家庭消息',
    title: message.title,
    content: message.content,
    createdAt: message.createdAt,
    read: message.read,
  };
}

function buildEmptyState(): ParentState {
  const welcomeMessage: ParentMessage = {
    id: 'msg_welcome_01',
    type: 'system',
    scope: 'system',
    title: '欢迎使用研学宝家长端',
    content: '先添加学员，再为学员创建账号并绑定研学宝设备。',
    createdAt: '2026-04-30 08:00',
    read: false,
  };
  return {
    version: STORE_VERSION,
    parentProfile: {
      ...buildParentProfile(),
      relationLabel: '已绑定 0 位学员',
    },
    selectedStudentId: null,
    selectedFamilyTeamId: null,
    students: [],
    familyTeams: [],
    reports: [],
    portfolioWorks: [],
    portfolioAiRecords: [],
    portfolioGrowthRecords: [],
    portfolioPhotos: [],
    portfolioAchievements: [],
    portfolioDeviceDiaries: [],
    messageCenterItems: [buildMessageCenterItemFromMessage(welcomeMessage)],
    growthValueLedger: [],
    capabilityAdjustmentRecords: [],
    diaryItems: [],
    familyTasks: [],
    works: [],
    messages: [welcomeMessage],
    orders: [],
    deviceAds: [
      {
        id: 'ad_device_01',
        title: 'AI 问问与拍拍',
        subtitle: '把孩子现场问题、照片和语音沉淀成研学记录',
        imageUrl: '/parent-device-ai.svg',
        features: ['语音问答', '拍照识别', '自动成册'],
        imageTone: 'ai',
      },
      {
        id: 'ad_device_02',
        title: '能力成长看得见',
        subtitle: '任务评分后自动回写能力元素和成长值',
        imageUrl: '/parent-device-growth.svg',
        features: ['能力雷达', '成长值', '报告回写'],
        imageTone: 'ability',
      },
      {
        id: 'ad_device_03',
        title: '定位与安全守护',
        subtitle: '查看当前位置、24 小时轨迹和 SoS 消息',
        imageUrl: '/parent-device-safety.svg',
        features: ['实时定位', '轨迹回放', 'SoS 提醒'],
        imageTone: 'safety',
      },
    ],
    scanDevices: clone(SCAN_DEVICE_POOL),
  };
}

function buildDemoState(): ParentState {
  const studentA = buildDemoStudent({
    id: 'student_01',
    yxbId: '80001',
    name: '林一诺',
    birthday: '2015-09-18',
    city: '深圳',
    school: '南山实验学校',
    grade: '五年级',
    avatar: '一诺',
    growthValue: 2860,
    device: buildDevice('YXB-DEV-0001', 'sale'),
    capabilities: buildCapabilities(0),
    accountActive: true,
    setupState: 'ready',
  });

  const studentB = buildDemoStudent({
    id: 'student_02',
    yxbId: '80002',
    name: '陈沐阳',
    birthday: '2018-05-06',
    city: '深圳',
    school: '前海小学',
    grade: '二年级',
    avatar: '沐阳',
    growthValue: 1320,
    capabilities: buildCapabilities(-0.4),
    accountActive: false,
    setupState: 'pending_device',
  });

  const familyTeamA = buildLongTermFamilyTeam(studentA);
  const familyTeamB = buildLongTermFamilyTeam(studentB);
  const weekendTeam: ParentFamilyTeam = {
    id: 'family_team_weekend_01',
    name: '深圳海洋馆亲子研学队',
    type: 'activity',
    theme: '海洋生命与环保观察',
    location: '深圳海洋馆',
    studyDate: '2026-04-16',
    goal: '通过观察、提问和作品表达，提升问题解决、科技应用和语言沟通。',
    studentIds: [studentA.id],
    inviteCode: 'OCEAN0416',
    createdAt: '2026-04-15 20:00',
  };

  const familyTaskA: FamilyTask = {
    id: 'task_family_01',
    familyTeamId: weekendTeam.id,
    title: '海洋动物行为观察',
    base: '深圳海洋馆',
    taskType: '观察记录',
    studyDate: '2026-04-16',
    points: 20,
    description: '观察一种海洋动物的行为，用照片和文字说明它的生活习性。',
    capabilityTags: ['问题解决', '科技应用', '语言沟通'],
    requirements: clone(TASK_LIBRARY[0].requirements),
    status: 'submitted',
    assignedStudentIds: [studentA.id],
    createdAt: '2026-04-15 20:18',
    publishedAt: '2026-04-16 08:00',
  };

  const familyTaskB: FamilyTask = {
    id: 'task_family_02',
    familyTeamId: familyTeamA.id,
    title: '设计一份健康早餐',
    base: '家庭厨房',
    taskType: '创作任务',
    studyDate: '2026-04-17',
    points: 15,
    description: '用身边食材设计一份早餐，说明营养搭配和制作步骤。',
    capabilityTags: ['身心健康', '自我管理', '创新思维'],
    requirements: clone(TASK_LIBRARY[3].requirements),
    status: 'draft',
    assignedStudentIds: [],
    createdAt: '2026-04-16 21:10',
  };

  const workA: TaskWork = {
    id: 'work_family_01',
    taskId: familyTaskA.id,
    studentId: studentA.id,
    submittedAt: '2026-04-16 15:35',
    status: 'synced',
    contentType: 'mixed',
    content: '我观察到海豚会跟随饲养员手势转圈，还会用声音和同伴交流。它们需要清洁的水域和团队配合。',
    attachments: ['海豚观察照片', '语音转文字记录'],
    aiScore: 9,
  };

  const portfolioWorkA = buildPortfolioWorkFromTaskWork(workA, familyTaskA);
  const flashDiaryWork = buildStudyWork({
    id: 'work_learning_01',
    studentId: studentA.id,
    taskTitle: '闪记日记：家庭观察感想',
    studyDate: '2026-04-30',
    studyType: '家庭研学',
    submittedAt: '2026-04-30 19:02',
    updatedAt: '2026-04-30 19:02',
    status: 'scored',
    workCategory: '闪记日记',
    topicType: '观察型',
    workKind: '感想',
    workMode: 'voice_note',
    summary: '用闪记和问问整理本次家庭观察最深的 3 个发现。',
    currentContent: '已完成家庭观察中的三个发现整理并提交。',
    attachments: [
      buildAttachment('家庭观察闪记', {
        id: 'work_learning_01_attachment_01',
        type: '闪记引用',
        duration: '00:42',
        capturedAt: '2026-04-30 18:54',
      }),
    ],
    linkedFlashNotes: [
      {
        id: 'work_learning_01_flash_01',
        title: '家庭观察语音闪记',
        type: 'voice_note',
        transcript: '我发现家里不同时间的光线、声音和植物变化都不一样。',
        duration: '00:42',
      },
    ],
    rating: '已提交',
    mentorComment: '闪记内容已同步，可继续沉淀为研学日记。',
  });
  const treasureWork = buildStudyWork({
    id: 'work_learning_02',
    studentId: studentA.id,
    taskTitle: '寻宝收集：找到 3 个自然线索',
    studyDate: '2026-04-30',
    studyType: '家庭研学',
    submittedAt: '2026-04-30 19:06',
    updatedAt: '2026-04-30 19:06',
    status: 'scored',
    workCategory: '寻宝收集',
    topicType: '探究型',
    workKind: '寻宝收集',
    workMode: 'image_upload',
    summary: '在社区或家庭研学点寻找 3 个自然线索，拍照上传并写出收集进度。',
    currentContent: '已收集 3 个自然线索并上传关键照片。',
    attachments: [
      buildAttachment('树叶纹理照片', {
        id: 'work_learning_02_attachment_01',
        capturedAt: '2026-04-30 18:45',
        locationLabel: '社区花园',
      }),
      buildAttachment('昆虫活动痕迹', {
        id: 'work_learning_02_attachment_02',
        capturedAt: '2026-04-30 18:50',
        locationLabel: '社区花园',
      }),
    ],
    rating: '已提交',
    mentorComment: '自然线索数量达标，图片证据完整。',
  });
  const surveyWork = buildStudyWork({
    id: 'work_learning_03',
    studentId: studentA.id,
    taskTitle: '现场调查：哪种观察方式最有效',
    studyDate: '2026-04-30',
    studyType: '家庭研学',
    submittedAt: '2026-04-30 19:08',
    updatedAt: '2026-04-30 19:08',
    status: 'scored',
    workCategory: '现场调查',
    topicType: '论证型',
    workKind: '调查',
    workMode: 'choice_text',
    summary: '家庭研学后选择你认为最有效的观察方式，并补充理由。',
    currentContent: '已完成观察方式选择并补充理由。',
    attachments: [
      buildAttachment('观察方式记录表', {
        id: 'work_learning_03_attachment_01',
        type: '文档',
        capturedAt: '2026-04-30 19:07',
      }),
    ],
    rating: '已提交',
    mentorComment: '调查理由清楚，能说明观察方式和结果之间的关系。',
  });
  const creationWork = buildStudyWork({
    id: 'work_learning_04',
    studentId: studentA.id,
    taskTitle: '创作研究：家庭观察画作',
    studyDate: '2026-04-30',
    studyType: '家庭研学',
    submittedAt: '2026-04-30 19:10',
    updatedAt: '2026-04-30 19:10',
    status: 'scored',
    workCategory: '创作研究',
    topicType: '创作型',
    workKind: '画作',
    workMode: 'ai_draw',
    summary: '根据家庭观察完成一张创作，可以用 AI 绘图或拍照上传作品。',
    currentContent: '已上传家庭观察画作并写出作品说明。',
    attachments: [
      buildAttachment('家庭观察画作', {
        id: 'work_learning_04_attachment_01',
        type: '照片',
        capturedAt: '2026-04-30 19:09',
      }),
      buildAttachment('AI 绘图参考稿', {
        id: 'work_learning_04_attachment_02',
        type: 'AI绘图',
        capturedAt: '2026-04-30 19:04',
      }),
    ],
    rating: '已提交',
    mentorComment: '创作能把观察结果转化为画面表达。',
  });

  const aiRecords: ParentAiRecord[] = [
    {
      id: 'ai_record_qa_01',
      studentId: studentA.id,
      kind: 'qa',
      scene: 'ask',
      agentName: '海洋科学智能体',
      title: '为什么海豚会发出声音',
      summary: 'AI 解释了海豚如何用声音定位、交流和协作捕食。',
      createdAt: '2026-04-16 14:12',
      questionCount: 3,
      relatedWorkId: portfolioWorkA.id,
      blocks: [
        { type: 'text', content: '提问：为什么海豚会发出声音？' },
        { type: 'answer', content: '答复：海豚会利用声音进行回声定位，也会用声音与同伴交流协作。' },
        { type: 'text', content: '追问：不同声音会对应不同的场景吗？' },
        { type: 'answer', content: '答复：会，短促的点击音更偏向定位，连续哨音更常用于社交沟通。' },
      ],
    },
    {
      id: 'ai_record_identify_01',
      studentId: studentA.id,
      kind: 'qa',
      scene: 'identify',
      agentName: '拍拍识别助手',
      title: '拍拍识别：贝壳纹理从哪里来',
      summary: '孩子连续拍摄贝壳纹理并追问成因，AI 给出观察线索和记录建议。',
      createdAt: '2026-04-16 14:36',
      questionCount: 2,
      relatedWorkId: portfolioWorkA.id,
      blocks: [
        { type: 'image', content: '贝壳纹理照片' },
        { type: 'text', content: '提问：这些纹理是天然形成的吗？' },
        { type: 'answer', content: '答复：多数纹理和贝壳生长周期、矿物沉积有关，可以记录颜色、方向和重复规律。' },
        { type: 'answer', content: '记录建议：把同类纹理放在一起对比，尝试画出你的分类标准。' },
      ],
    },
    {
      id: 'ai_record_creation_01',
      studentId: studentA.id,
      kind: 'creation',
      scene: 'ai_draw',
      agentName: 'AI 创作助手',
      title: '海洋保护主题海报',
      summary: '根据“保护海洋朋友”主题生成了一张宣传海报，并关联到作品素材。',
      createdAt: '2026-04-15 19:40',
      workType: 'AI 海报',
      prompt: '请生成一张适合小学生表达海洋保护主题的宣传海报，突出减少塑料污染。',
      relatedWorkId: creationWork.id,
      blocks: [
        { type: 'text', content: '创作主题：保护海洋朋友' },
        { type: 'text', content: '提示词：蓝色海洋、海豚、减少塑料污染、儿童倡议口号。' },
        { type: 'attachment', content: 'AI 海报作品' },
        { type: 'answer', content: '生成建议：可把海报里的口号提炼到任务作品正文中，强化表达。' },
      ],
    },
  ];

  const photoRecords: ParentPhotoRecord[] = [
    {
      id: 'photo_01',
      studentId: studentA.id,
      title: '海洋馆现场观察照片',
      createdAt: '2026-04-16 15:20',
      content: '海洋馆现场拍摄的观察照片，包含海豚展区和主展厅环境，用于支撑本次研学任务作品。',
      photoType: '学员照片',
      sourceLabel: '设备相册同步',
      summary: '设备端上传了 2 张现场观察照片，已关联到海洋动物行为观察任务。',
      relatedWorkId: portfolioWorkA.id,
      uploadedBy: '林一诺',
      attachments: [
        buildAttachment('海豚观察照片', {
          id: 'photo_01_attachment_01',
          capturedAt: '2026-04-16 15:18',
          locationLabel: '深圳海洋馆海豚展区',
          uploadedBy: '林一诺',
        }),
        buildAttachment('海洋馆环境照片', {
          id: 'photo_01_attachment_02',
          capturedAt: '2026-04-16 14:55',
          locationLabel: '深圳海洋馆主展厅',
          uploadedBy: '林一诺',
        }),
      ],
    },
    {
      id: 'photo_02',
      studentId: studentA.id,
      title: '海洋馆团队合影',
      createdAt: '2026-04-16 16:40',
      content: '研学导师上传的团队合影，记录亲子研学队完成海洋馆任务后的集合瞬间。',
      photoType: '团队照片',
      sourceLabel: '研学导师上传',
      summary: '导师上传 3 张团队研学照片，已按 2026-04-16 统一归档。',
      uploadedBy: '导师王老师',
      attachments: [
        buildAttachment('团队合影', {
          id: 'photo_02_attachment_01',
          capturedAt: '2026-04-16 16:32',
          locationLabel: '深圳海洋馆出口',
          uploadedBy: '导师王老师',
        }),
        buildAttachment('小组分享现场', {
          id: 'photo_02_attachment_02',
          capturedAt: '2026-04-16 16:10',
          locationLabel: '深圳海洋馆科普教室',
          uploadedBy: '导师王老师',
        }),
        buildAttachment('亲子任务打卡', {
          id: 'photo_02_attachment_03',
          capturedAt: '2026-04-16 15:58',
          locationLabel: '深圳海洋馆主展厅',
          uploadedBy: '导师王老师',
        }),
      ],
    },
  ];

  const achievementRecords: ParentAchievementRecord[] = [
    {
      id: 'achievement_01',
      studentId: studentA.id,
      title: '海洋观察小达人证书',
      createdAt: '2026-04-16 18:20',
      content: '导师根据本次海洋馆研学表现上传证书，鼓励孩子继续保持观察和表达。',
      sourceLabel: '研学导师上传',
      summary: '完成海洋馆亲子研学队任务后获得的电子证书。',
      relatedWorkId: portfolioWorkA.id,
      achievementType: '证书',
      uploadedBy: '老师',
      attachments: [
        buildAttachment('海洋观察小达人证书', {
          id: 'achievement_01_attachment_01',
          type: '照片',
          capturedAt: '2026-04-16 18:20',
          uploadedBy: '导师王老师',
          mimeType: 'image/png',
        }),
      ],
    },
    {
      id: 'achievement_02',
      studentId: studentA.id,
      title: '难题挑战入选证明',
      createdAt: '2026-04-28 20:30',
      content: '海洋污染治理方案入选难题挑战优秀方案，专家上传 PDF 证明。',
      sourceLabel: '专家上传',
      summary: '难题挑战优秀方案入选证明，附件为 PDF。',
      achievementType: '作品入选',
      uploadedBy: '老师',
      attachments: [
        buildAttachment('难题挑战入选证明.pdf', {
          id: 'achievement_02_attachment_01',
          type: '文档',
          capturedAt: '2026-04-28 20:30',
          uploadedBy: '专家陈老师',
          mimeType: 'application/pdf',
          fileSize: 842000,
        }),
      ],
    },
  ];

  const deviceDiaries: ParentDeviceDiary[] = [
    {
      id: 'device_diary_01',
      studentId: studentA.id,
      title: '设备端语音闪记已同步',
      summary: '孩子在现场用语音补充了海豚协作和回声定位的观察结论。',
      createdAt: '2026-04-16 15:28',
      content: '我发现海豚会跟着训练员一起配合动作，而且它们发出的声音不只是叫声，还像在互相提醒。',
      sourceLabel: '设备端闪记',
      relatedWorkId: portfolioWorkA.id,
      attachments: [
        buildAttachment('海豚协作语音闪记', {
          id: 'device_diary_01_attachment_01',
          type: '音频',
          duration: '00:36',
          capturedAt: '2026-04-16 15:28',
          uploadedBy: '林一诺',
        }),
      ],
    },
    {
      id: 'device_diary_02',
      studentId: studentA.id,
      title: '家庭观察闪记已同步',
      summary: '孩子用语音记录家庭观察中的光线和植物变化。',
      createdAt: '2026-04-30 18:54',
      content: '我发现阳台植物在傍晚会向窗边倾斜，房间里声音也比白天更安静。',
      sourceLabel: '设备端闪记',
      relatedWorkId: flashDiaryWork.id,
      attachments: [
        buildAttachment('家庭观察语音闪记', {
          id: 'device_diary_02_attachment_01',
          type: '音频',
          duration: '00:42',
          capturedAt: '2026-04-30 18:54',
          uploadedBy: '林一诺',
        }),
      ],
    },
  ];

  const growthRecords: ParentGrowthRecord[] = [
    {
      id: 'growth_record_01',
      studentId: studentA.id,
      type: 'growth_value',
      category: '团体研学',
      sourceType: 'teacher_review',
      title: '团体研学成长值奖励',
      value: 1000,
      delta: 1000,
      occurredAt: '2026-04-16 18:05',
      summary: '深圳海洋馆研学报告评级 A，系统发放成长值 1000。',
      displaySource: '成长值',
      relatedId: 'report_01',
    },
    {
      id: 'growth_record_02',
      studentId: studentA.id,
      type: 'capability_update',
      category: '问题解决',
      sourceType: 'teacher_review',
      title: '问题解决能力指数更新',
      value: 8.7,
      delta: 0.6,
      occurredAt: '2026-04-16 18:02',
      summary: '研学评价回写后，问题解决能力由 8.1 提升到 8.7。',
      displaySource: '能力更新',
      relatedId: 'report_01',
    },
  ];

  const growthValueLedger: GrowthValueLedgerRecord[] = [
    {
      id: 'ledger_01',
      studentId: studentA.id,
      title: '深圳海洋馆研学报告奖励',
      type: 'earn',
      value: 1000,
      availableAfter: studentA.growthWallet.available,
      occurredAt: '2026-04-16 18:05',
      source: '研学报告',
      relatedId: 'report_01',
    },
    {
      id: 'ledger_02',
      studentId: studentA.id,
      title: '兑换海洋主题徽章',
      type: 'spend',
      value: -120,
      availableAfter: studentA.growthWallet.available - 120,
      occurredAt: '2026-04-17 12:20',
      source: '消费兑换',
    },
    {
      id: 'ledger_03',
      studentId: studentA.id,
      title: '家庭观察任务奖励',
      type: 'earn',
      value: 80,
      availableAfter: studentA.growthWallet.available - 40,
      occurredAt: '2026-04-30 19:20',
      source: '家庭任务',
      relatedId: 'work_learning_01',
    },
  ];

  const capabilityAdjustmentRecords: CapabilityAdjustmentRecord[] = [
    {
      id: 'adjust_01',
      studentId: studentA.id,
      recordType: '家庭研学',
      sourceTitle: '深圳海洋馆研学评分',
      organizationName: '南山实验学校',
      teamOrTaskName: '深圳海洋馆亲子研学队',
      reportTitle: '深圳海洋馆研学报告',
      reportId: 'report_01',
      evaluator: '导师王老师',
      evaluatedAt: '2026-04-16 18:02',
      sourceType: '导师',
      elementRecords: [
        { elementKey: '问题解决', beforeIndex: 8.1, assessmentValue: 9.1, afterIndex: 8.7 },
        { elementKey: '科技应用', beforeIndex: 7.6, assessmentValue: 8.8, afterIndex: 8.3 },
        { elementKey: '语言沟通', beforeIndex: 7.3, assessmentValue: 8.4, afterIndex: 7.9 },
      ],
    },
    {
      id: 'adjust_02',
      studentId: studentA.id,
      recordType: '日常任务',
      sourceTitle: '家庭观察日常任务评分',
      organizationName: '家庭研学',
      teamOrTaskName: '日常任务：家庭观察闪记',
      reportTitle: '家庭观察日常任务评测报告',
      reportId: 'report_03',
      evaluator: '林一诺妈妈',
      evaluatedAt: '2026-04-30 19:18',
      sourceType: '家长',
      elementRecords: [
        { elementKey: '自我管理', beforeIndex: 8.0, assessmentValue: 8.8, afterIndex: 8.4 },
        { elementKey: '创新思维', beforeIndex: 8.5, assessmentValue: 9.0, afterIndex: 8.8 },
        { elementKey: '语言沟通', beforeIndex: 7.7, assessmentValue: 8.6, afterIndex: 8.1 },
      ],
    },
    {
      id: 'adjust_03',
      studentId: studentA.id,
      recordType: '难题挑战',
      sourceTitle: '海洋污染治理难题挑战评分',
      organizationName: '深圳青少年科创营',
      teamOrTaskName: '难题挑战：海洋污染治理方案',
      reportTitle: '海洋污染治理难题挑战评测报告',
      reportId: 'report_04',
      evaluator: '专家陈老师',
      evaluatedAt: '2026-04-28 20:10',
      sourceType: '专家',
      elementRecords: [
        { elementKey: '问题解决', beforeIndex: 8.4, assessmentValue: 9.3, afterIndex: 8.9 },
        { elementKey: '社会责任', beforeIndex: 8.0, assessmentValue: 9.1, afterIndex: 8.6 },
        { elementKey: '跨学科融合', beforeIndex: 8.1, assessmentValue: 8.9, afterIndex: 8.5 },
      ],
    },
  ];

  const messages: ParentMessage[] = [
    { id: 'msg_01', type: 'team_broadcast', scope: 'team', studentId: studentA.id, title: '集合提醒', content: '16:30 在海洋馆出口集合，请注意设备电量。', createdAt: '2026-04-16 16:05', read: false },
    { id: 'msg_02', type: 'sos', scope: 'student', studentId: studentA.id, title: 'SoS 演示记录', content: '设备端发出 SoS，定位在海洋馆科普教室附近，已解除。', createdAt: '2026-04-16 13:10', read: true },
    { id: 'msg_03', type: 'system', scope: 'system', title: '研学宝绑定成功', content: '设备 YXB-DEV-0001 已绑定到林一诺。', createdAt: '2026-04-16 09:30', read: true },
  ];

  return {
    version: STORE_VERSION,
    parentProfile: {
      ...buildParentProfile(),
      relationLabel: '已绑定 2 位学员',
    },
    selectedStudentId: studentA.id,
    selectedFamilyTeamId: weekendTeam.id,
    students: [studentA, studentB],
    familyTeams: [weekendTeam, familyTeamA, familyTeamB],
    reports: [
      {
        id: 'report_01',
        studentId: studentA.id,
        type: 'study_report',
        title: '深圳海洋馆研学报告',
        date: '2026-04-16',
        organizationName: '南山实验学校',
        teamOrTaskName: '深圳海洋馆亲子研学队',
        evaluator: '导师王老师',
        evaluatedAt: '2026-04-16 18:02',
        sourceType: '导师',
        recordType: '家庭研学',
        planeTitle: '综合研学',
        summary: '在观察记录、表达分享和团队协作中表现稳定，问题解决与科技应用能力提升明显。',
        rows: [
          { elementKey: '问题解决', score: 9.1, latestIndex: 8.7, average: 7.9 },
          { elementKey: '科技应用', score: 8.8, latestIndex: 8.3, average: 7.6 },
          { elementKey: '语言沟通', score: 8.4, latestIndex: 7.9, average: 7.3 },
        ],
      },
      {
        id: 'report_03',
        studentId: studentA.id,
        type: 'study_report',
        title: '家庭观察日常任务评测报告',
        date: '2026-04-30',
        organizationName: '家庭研学',
        teamOrTaskName: '日常任务：家庭观察闪记',
        evaluator: '林一诺妈妈',
        evaluatedAt: '2026-04-30 19:18',
        sourceType: '家长',
        recordType: '日常任务',
        planeTitle: '日常任务',
        summary: '孩子能在家庭观察中主动记录现象，并用闪记复盘自己的判断，日常任务完成度较高。',
        rows: [
          { elementKey: '自我管理', score: 8.8, latestIndex: 8.4, average: 7.6 },
          { elementKey: '创新思维', score: 9.0, latestIndex: 8.8, average: 7.7 },
          { elementKey: '语言沟通', score: 8.6, latestIndex: 8.1, average: 7.3 },
        ],
      },
      {
        id: 'report_04',
        studentId: studentA.id,
        type: 'study_report',
        title: '海洋污染治理难题挑战评测报告',
        date: '2026-04-28',
        organizationName: '深圳青少年科创营',
        teamOrTaskName: '难题挑战：海洋污染治理方案',
        evaluator: '专家陈老师',
        evaluatedAt: '2026-04-28 20:10',
        sourceType: '专家',
        recordType: '难题挑战',
        planeTitle: '难题挑战',
        summary: '孩子能从污染来源、治理成本和公众参与三个角度提出方案，问题解决与社会责任表现突出。',
        rows: [
          { elementKey: '问题解决', score: 9.3, latestIndex: 8.9, average: 7.9 },
          { elementKey: '社会责任', score: 9.1, latestIndex: 8.6, average: 7.8 },
          { elementKey: '跨学科融合', score: 8.9, latestIndex: 8.5, average: 7.5 },
        ],
      },
      {
        id: 'report_02',
        studentId: studentA.id,
        type: 'student_self_test',
        title: '学员能力自测报告',
        date: '2026-04-10',
        organizationName: '研学宝系统',
        teamOrTaskName: '学员能力自测',
        evaluator: '系统',
        evaluatedAt: '2026-04-10 20:00',
        sourceType: '系统',
        recordType: '家长评测',
        planeTitle: '自主发展',
        summary: '自测显示孩子在问题解决上有较强主动性，自我管理仍有提升空间。',
        rows: [
          { elementKey: '身心健康', score: 8.2, latestIndex: 8.4, average: 7.8 },
          { elementKey: '自我管理', score: 7.5, latestIndex: 8.1, average: 7.5 },
          { elementKey: '问题解决', score: 8.9, latestIndex: 8.7, average: 7.9 },
          { elementKey: '批判思维', score: 7.2, latestIndex: 7.6, average: 7.2 },
        ],
      },
    ],
    portfolioWorks: [creationWork, surveyWork, treasureWork, flashDiaryWork, portfolioWorkA],
    portfolioAiRecords: aiRecords,
    portfolioGrowthRecords: growthRecords,
    portfolioPhotos: photoRecords,
    portfolioAchievements: achievementRecords,
    portfolioDeviceDiaries: deviceDiaries,
    messageCenterItems: [
      {
        ...buildMessageCenterItemFromMessage(messages[0]),
        relatedKind: 'work',
        relatedId: portfolioWorkA.id,
      },
      {
        ...buildMessageCenterItemFromMessage(messages[1]),
        relatedKind: 'report',
        relatedId: 'report_01',
      },
      buildMessageCenterItemFromMessage(messages[2]),
    ],
    growthValueLedger,
    capabilityAdjustmentRecords,
    diaryItems: [
      {
        id: 'diary_01',
        studentId: studentA.id,
        type: 'report',
        title: '深圳海洋馆研学报告已生成',
        date: '2026-04-16 18:00',
        source: '团体研学',
        summary: '综合评级 A，获得成长值 1000，报告已推送到家长端。',
        rating: 'A',
        relatedId: 'report_01',
      },
      {
        id: 'diary_02',
        studentId: studentA.id,
        type: 'study_diary',
        title: '闪记日记：家庭观察感想',
        date: '2026-04-30 19:02',
        source: '家庭研学',
        summary: flashDiaryWork.currentContent,
        rating: '已提交',
        relatedId: flashDiaryWork.id,
        content: '今天我在家里做观察，发现光线、声音和植物状态都会随时间变化。用闪记整理后，我能更清楚地说出三个发现。',
        media: ['家庭观察闪记'],
      },
      {
        id: 'diary_03',
        studentId: studentA.id,
        type: 'ai_qa',
        title: '为什么海豚会发出声音',
        date: '2026-04-16 14:12',
        source: '海洋科学智能体',
        summary: 'AI 答复：海豚通过不同频率的声音进行定位、交流和协作捕食。',
        content: '提问：为什么海豚会发出声音？\n答复：海豚会利用声音完成回声定位，也会用声音与同伴交流。',
        relatedId: 'ai_record_qa_01',
      },
      {
        id: 'diary_04',
        studentId: studentA.id,
        type: 'ai_creation',
        title: '海洋保护主题海报',
        date: '2026-04-15 19:40',
        source: 'AI 创作',
        summary: '生成了一张“保护海洋朋友”的宣传海报。',
        relatedId: 'ai_record_creation_01',
        media: ['AI 海报作品'],
      },
      {
        id: 'diary_06',
        studentId: studentA.id,
        type: 'work',
        title: '现场调查：哪种观察方式最有效',
        date: '2026-04-30 19:08',
        source: '家庭研学',
        summary: surveyWork.currentContent,
        rating: '已提交',
        relatedId: surveyWork.id,
        content: '我比较了拍照、录音和画图三种方式，觉得画图加文字最能帮助我记住细节，因为它会让我重新观察一次。',
        media: ['观察方式记录表'],
      },
      {
        id: 'diary_07',
        studentId: studentA.id,
        type: 'flash_note',
        title: '家庭观察语音闪记',
        date: '2026-04-30 18:54',
        source: '设备端闪记',
        summary: '孩子用 42 秒语音记录了家庭观察中的光线、声音和植物变化。',
        rating: '00:42',
        relatedId: 'device_diary_02',
        content: '我发现阳台植物在傍晚会向窗边倾斜，房间里声音也比白天更安静。',
        media: ['语音闪记'],
      },
      {
        id: 'diary_08',
        studentId: studentA.id,
        type: 'review',
        title: '导师个性化评价',
        date: '2026-04-16 18:12',
        source: '导师王老师',
        summary: '观察很细致，能把海豚行为和环境保护联系起来，建议下次继续补充更多对比证据。',
        rating: '导师评价',
        relatedId: 'report_01',
        content: '一诺在海洋馆研学中能主动提问，也能用照片和文字表达观察结果。后续可继续训练“证据-观点”的表达结构。',
        media: ['研学报告评价'],
      },
      {
        id: 'diary_09',
        studentId: studentA.id,
        type: 'expert_course',
        title: '海洋生物专家直播课',
        date: '2026-04-18 20:30',
        source: '专家课程',
        summary: '学习专家课程 45 分钟，了解海豚回声定位和海洋生态保护。',
        rating: '45 分钟',
        content: '课程重点：回声定位、海洋动物协作、塑料污染对海洋生态的影响。',
        media: ['课程回放', '学习时长'],
      },
      {
        id: 'diary_10',
        studentId: studentA.id,
        type: 'challenge',
        title: '接受海洋污染治理难题挑战',
        date: '2026-04-28 18:00',
        source: '难题挑战',
        summary: '孩子接受“海洋污染治理方案”挑战，并提交了治理设想。',
        rating: '已接受',
        relatedId: 'report_04',
        content: '挑战要求：从污染来源、治理成本和公众参与三个角度提出可执行方案。',
        media: ['挑战任务书'],
      },
      {
        id: 'diary_11',
        studentId: studentA.id,
        type: 'achievement',
        title: '海洋观察小达人证书',
        date: '2026-04-16 18:20',
        source: '研学导师上传',
        summary: '完成海洋馆亲子研学队任务后获得电子证书。',
        rating: '证书',
        relatedId: 'achievement_01',
        content: '导师上传了“海洋观察小达人”电子证书，可在成就中查看和分享。',
        media: ['电子证书'],
      },
    ],
    familyTasks: [familyTaskA, familyTaskB],
    works: [workA],
    messages,
    orders: [
      {
        id: 'order_01',
        type: '研学宝',
        title: '研学宝智能硬件优惠订购',
        amount: 1299,
        status: '待支付',
        createdAt: '2026-04-16 20:30',
        productName: '研学宝 Explorer S1 家庭套装',
        sourceLabel: '研学宝订购',
        description: '待支付订单，点击后可继续填写收货信息并模拟支付。',
        receiver: '林一诺妈妈',
        address: '深圳市南山区科技园演示地址',
        phone: '13800000001',
      },
      {
        id: 'order_02',
        type: '团队报名',
        title: '深圳海洋馆亲子研学队报名',
        amount: 398,
        status: '待缴费',
        createdAt: '2026-04-16 09:10',
        studentId: studentA.id,
        productName: '团队研学报名',
        sourceLabel: '导师分享报名二维码',
        description: '家长扫码后自动关联待报名研学团队，可选择学员并完成模拟缴费。',
      },
      {
        id: 'order_03',
        type: '专家课程',
        title: '海洋生物专家直播课',
        amount: 99,
        status: '未查看',
        createdAt: '2026-04-15 18:30',
        studentId: studentA.id,
        productName: '专家课程',
        sourceLabel: '学员看中后请家长购买',
        description: '查看课程和费用信息后，可核实学员信息并模拟支付。',
      },
      {
        id: 'order_04',
        type: '难题挑战',
        title: '海洋污染治理难题挑战',
        amount: 49,
        status: '未处理',
        createdAt: '2026-04-15 12:20',
        studentId: studentA.id,
        productName: '难题挑战',
        sourceLabel: '学员发起挑战',
        description: '学员希望报名难题挑战，家长确认后可模拟支付并开通挑战任务。',
      },
    ],
    deviceAds: [
      {
        id: 'ad_device_01',
        title: 'AI 问问与拍拍',
        subtitle: '把孩子现场问题、照片和语音沉淀成研学记录',
        imageUrl: '/parent-device-ai.svg',
        features: ['语音问答', '拍照识别', '自动成册'],
        imageTone: 'ai',
      },
      {
        id: 'ad_device_02',
        title: '能力成长看得见',
        subtitle: '任务评分后自动回写能力元素和成长值',
        imageUrl: '/parent-device-growth.svg',
        features: ['能力雷达', '成长值', '报告回写'],
        imageTone: 'ability',
      },
      {
        id: 'ad_device_03',
        title: '定位与安全守护',
        subtitle: '查看当前位置、24 小时轨迹和 SoS 消息',
        imageUrl: '/parent-device-safety.svg',
        features: ['实时定位', '轨迹回放', 'SoS 提醒'],
        imageTone: 'safety',
      },
    ],
    scanDevices: clone(SCAN_DEVICE_POOL),
  };
}

function normalizeState(state: ParentState): ParentState {
  if (state.version !== STORE_VERSION) {
    return buildDemoState();
  }

  const base = buildEmptyState();
  const nextState: ParentState = {
    ...base,
    ...state,
    parentProfile: state.parentProfile ?? base.parentProfile,
    selectedStudentId: state.selectedStudentId ?? null,
    selectedFamilyTeamId: state.selectedFamilyTeamId ?? null,
    students: Array.isArray(state.students)
      ? state.students.map((student, index) => {
          const growthValue = Number(student.growthValue) || 0;
          return {
            ...student,
            idNumber: student.idNumber ?? `ID${student.yxbId}${student.birthday?.replaceAll('-', '') ?? ''}`,
            avatarImage: student.avatarImage,
            growthWallet: student.growthWallet ?? buildGrowthWallet(growthValue),
            talentProfile: student.talentProfile ?? buildDefaultTalentProfile(index),
            interestProfile: student.interestProfile ?? buildDefaultInterestProfile(index),
            device: student.device
              ? {
                  ...student.device,
                  paymentCard: student.device.paymentCard
                    ? {
                        id: student.device.paymentCard.id ?? 'payment_card_01',
                        provider: student.device.paymentCard.provider ?? '支付宝亲子卡',
                        alias: student.device.paymentCard.alias ?? '亲子支付卡',
                        account: student.device.paymentCard.account,
                        accountTail:
                          student.device.paymentCard.accountTail ??
                          student.device.paymentCard.account.replace(/\D/g, '').slice(-4) ??
                          '----',
                        status: student.device.paymentCard.status ?? '已绑定',
                        bindType: student.device.paymentCard.bindType ?? 'alipay_family_pay',
                        authStatus: student.device.paymentCard.authStatus ?? '已授权',
                        limitAmount: student.device.paymentCard.limitAmount ?? 300,
                        boundAt: student.device.paymentCard.boundAt ?? student.device.boundAt,
                        updatedAt: student.device.paymentCard.updatedAt ?? student.device.boundAt,
                        balance: student.device.paymentCard.balance ?? 0,
                        records: Array.isArray(student.device.paymentCard.records)
                          ? student.device.paymentCard.records.map((record) => ({
                              ...record,
                              type: record.type ?? (record.amount >= 0 ? '充值' : '消费'),
                              status: record.status ?? '成功',
                            }))
                          : [],
                      }
                    : undefined,
                  netDisk: student.device.netDisk
                    ? {
                        provider: '百度网盘',
                        alias: student.device.netDisk.alias ?? '家庭研学资料库',
                        account: student.device.netDisk.account,
                        status: student.device.netDisk.status ?? '已绑定',
                        bindMethod: student.device.netDisk.bindMethod ?? 'mock_qr',
                        authStatus: student.device.netDisk.authStatus ?? '已授权',
                        qrSessionId: student.device.netDisk.qrSessionId ?? makeId('netdisk_qr'),
                        boundAt: student.device.netDisk.boundAt ?? student.device.boundAt,
                        capacityUsed: student.device.netDisk.capacityUsed ?? 0,
                        capacityTotal: student.device.netDisk.capacityTotal ?? 20,
                        lastSyncAt: student.device.netDisk.lastSyncAt ?? student.device.boundAt,
                        syncRecords: Array.isArray(student.device.netDisk.syncRecords) ? student.device.netDisk.syncRecords : [],
                      }
                    : undefined,
                  contacts: (student.device.contacts ?? []).map((contact) => ({
                    ...contact,
                    category: contact.category ?? (contact.relation.includes('导师') ? '导师' : '家长'),
                    isEmergency: contact.isEmergency ?? contact.relation.includes('家长'),
                    updatedAt: contact.updatedAt ?? student.device?.boundAt ?? nowText(),
                  })),
                  quietTimes: (student.device.quietTimes ?? []).map((item, quietIndex) => ({
                    ...item,
                    weekdays: item.weekdays ?? (quietIndex === 2 ? [6, 0] : [1, 2, 3, 4, 5]),
                    updatedAt: item.updatedAt ?? student.device?.boundAt ?? nowText(),
                    syncStatus: item.syncStatus ?? '已同步',
                  })),
                  latestLocation:
                    student.device.latestLocation ?? {
                      address: student.device.tracks.at(-1)?.address ?? '暂无位置',
                      receivedAt: student.device.lastOnlineAt,
                      mapProvider: '高德地图',
                      navigationText: '已模拟拉起地图导航',
                    },
                  tracks: (student.device.tracks ?? []).map((track, trackIndex) => ({
                    ...track,
                    title: track.title ?? (trackIndex === 0 ? '到达学校' : trackIndex === (student.device?.tracks ?? []).length - 1 ? '到达当前位置' : '位置更新'),
                    type: track.type ?? (trackIndex === (student.device?.tracks ?? []).length - 1 ? 'current' : 'study'),
                    stayDuration: track.stayDuration ?? (trackIndex === (student.device?.tracks ?? []).length - 1 ? '持续更新中' : '已记录'),
                    status: track.status ?? '已记录',
                    x: track.x ?? 18 + trackIndex * 18,
                    y: track.y ?? 72 - trackIndex * 12,
                  })),
                }
              : undefined,
            capabilities: Array.isArray(student.capabilities)
              ? student.capabilities.map((capability) => normalizeCapability(capability as CapabilityElement & Partial<{ updatedAt: string }>))
              : [],
          };
        })
      : base.students,
    familyTeams: Array.isArray(state.familyTeams) ? state.familyTeams : base.familyTeams,
    reports: Array.isArray(state.reports)
      ? state.reports.map((report) => ({
          ...report,
          organizationName: report.organizationName ?? '研学宝',
          teamOrTaskName: report.teamOrTaskName ?? report.planeTitle,
          evaluator: report.evaluator ?? (report.type === 'parent_review' ? state.parentProfile?.name ?? '家长' : '系统'),
          evaluatedAt: report.evaluatedAt ?? report.date,
          sourceType: report.sourceType ?? (report.type === 'parent_review' ? '家长' : report.type === 'student_self_test' ? '系统' : '导师'),
          recordType: report.recordType ?? (report.type === 'parent_review' ? '家长评测' : '家庭研学'),
        }))
      : base.reports,
    portfolioWorks: Array.isArray(state.portfolioWorks)
      ? state.portfolioWorks
      : Array.isArray(state.works)
        ? state.works.map((work) => buildPortfolioWorkFromTaskWork(work, state.familyTasks?.find((task) => task.id === work.taskId)))
        : base.portfolioWorks,
    portfolioAiRecords: Array.isArray(state.portfolioAiRecords) ? state.portfolioAiRecords : base.portfolioAiRecords,
    portfolioGrowthRecords: Array.isArray(state.portfolioGrowthRecords) ? state.portfolioGrowthRecords : base.portfolioGrowthRecords,
    portfolioPhotos: Array.isArray(state.portfolioPhotos) ? state.portfolioPhotos : base.portfolioPhotos,
    portfolioAchievements: Array.isArray(state.portfolioAchievements) ? state.portfolioAchievements : base.portfolioAchievements,
    portfolioDeviceDiaries: Array.isArray(state.portfolioDeviceDiaries) ? state.portfolioDeviceDiaries : base.portfolioDeviceDiaries,
    messageCenterItems: Array.isArray(state.messageCenterItems)
      ? state.messageCenterItems
      : Array.isArray(state.messages)
        ? state.messages.map(buildMessageCenterItemFromMessage)
        : base.messageCenterItems,
    growthValueLedger: Array.isArray(state.growthValueLedger) ? state.growthValueLedger : base.growthValueLedger,
    capabilityAdjustmentRecords: Array.isArray(state.capabilityAdjustmentRecords)
      ? state.capabilityAdjustmentRecords.map((record) => ({
          ...record,
          recordType: record.recordType ?? '家庭研学',
          reportId:
            record.reportId ??
            (Array.isArray(state.reports)
              ? state.reports.find((report) => report.title === record.reportTitle || report.title === record.sourceTitle)?.id
              : undefined),
        }))
      : base.capabilityAdjustmentRecords,
    diaryItems: Array.isArray(state.diaryItems) ? state.diaryItems : base.diaryItems,
    familyTasks: Array.isArray(state.familyTasks) ? state.familyTasks : base.familyTasks,
    works: Array.isArray(state.works) ? state.works : base.works,
    messages: Array.isArray(state.messages) ? state.messages : base.messages,
    orders: Array.isArray(state.orders) ? state.orders : base.orders,
    deviceAds: Array.isArray(state.deviceAds)
      ? state.deviceAds.map((ad, index) => ({
          ...base.deviceAds[index % base.deviceAds.length],
          ...ad,
          imageUrl: ad.imageUrl ?? base.deviceAds[index % base.deviceAds.length]?.imageUrl ?? '/parent-device-ai.svg',
          features: Array.isArray(ad.features) ? ad.features : base.deviceAds[index % base.deviceAds.length]?.features ?? [],
        }))
      : base.deviceAds,
    scanDevices: Array.isArray(state.scanDevices) && state.scanDevices.length ? state.scanDevices : clone(SCAN_DEVICE_POOL),
  };

  if (nextState.selectedStudentId && !nextState.students.some((student) => student.id === nextState.selectedStudentId)) {
    nextState.selectedStudentId = nextState.students[0]?.id ?? null;
  }

  if (!nextState.selectedStudentId && nextState.students.length) {
    nextState.selectedStudentId = nextState.students[0].id;
  }

  if (!nextState.familyTeams.length && nextState.students.length) {
    nextState.familyTeams = nextState.students.map(buildLongTermFamilyTeam);
  }

  if (nextState.selectedFamilyTeamId && !nextState.familyTeams.some((team) => team.id === nextState.selectedFamilyTeamId)) {
    nextState.selectedFamilyTeamId = nextState.familyTeams[0]?.id ?? null;
  }

  if (!nextState.selectedFamilyTeamId && nextState.familyTeams.length) {
    nextState.selectedFamilyTeamId = nextState.familyTeams[0].id;
  }

  nextState.parentProfile = {
    ...nextState.parentProfile,
    relationLabel: `已绑定 ${nextState.students.length} 位学员`,
  };

  return nextState;
}

function readStoredState() {
  if (typeof window === 'undefined') {
    return buildEmptyState();
  }
  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    for (const legacyKey of LEGACY_STORE_KEYS) {
      const legacyRaw = window.localStorage.getItem(legacyKey);
      if (legacyRaw) {
        try {
          return normalizeState(JSON.parse(legacyRaw) as ParentState);
        } catch {
          return buildDemoState();
        }
      }
    }
    return buildEmptyState();
  }
  try {
    return normalizeState(JSON.parse(raw) as ParentState);
  } catch {
    return buildEmptyState();
  }
}

function averageCapability(student: ParentStudent | null) {
  if (!student) {
    return 0;
  }
  return round1(student.capabilities.reduce((sum, item) => sum + item.score, 0) / Math.max(student.capabilities.length, 1));
}

export function getCapabilityById(student: ParentStudent | null, capabilityId: string) {
  if (!student) {
    return null;
  }
  return student.capabilities.find((item) => item.id === capabilityId) ?? null;
}

export function getCapabilityPlaneSummaries(student: ParentStudent | null) {
  if (!student) {
    return [];
  }

  return CAPABILITY_PLANES.map((plane) => {
    const items = student.capabilities.filter((item) => item.planeKey === plane.key);
    return {
      planeKey: plane.key,
      planeTitle: plane.title,
      score: round1(items.reduce((sum, item) => sum + item.score, 0) / Math.max(items.length, 1)),
      averageScore: round1(items.reduce((sum, item) => sum + item.averageScore, 0) / Math.max(items.length, 1)),
    };
  });
}

export function getCapabilityOverview(student: ParentStudent | null) {
  const planes = getCapabilityPlaneSummaries(student);
  const strongest = student ? [...student.capabilities].sort((left, right) => right.score - left.score).slice(0, 6) : [];
  const weakest = student ? [...student.capabilities].sort((left, right) => left.score - right.score).slice(0, 6) : [];
  const currentIndex = averageCapability(student);
  const currentLevel = getCapabilityLevel(currentIndex);

  return {
    currentIndex,
    currentLevel,
    planes,
    strongest,
    weakest,
    sourceBreakdown: student?.capabilities[0]?.sourceBreakdown ?? clone(DEFAULT_CAPABILITY_SOURCE_BREAKDOWN),
  };
}

export function getTimelineEntryLabel(entryType: PortfolioTimelineEntryType) {
  const labels: Record<PortfolioTimelineEntryType, string> = {
    report: '研学报告',
    task: '任务',
    work_submitted: '作品提交',
    work_scored: '作品评分',
    ai_qa: '拍拍/问问',
    ai_creation: 'AI创作',
    photo: '现场照片',
    achievement: '成就',
    expert_course: '专家课程',
    challenge: '难题挑战',
    review: '评价',
    study_diary: '研学日记',
    flash_note: '闪记',
    device_diary: '设备日记',
    growth_value: '成长值',
    capability_update: '能力更新',
    assessment: '家长评测',
  };
  return labels[entryType];
}

export function getMessageTypeLabel(type: MessageType) {
  const labels: Record<MessageType, string> = {
    system: '系统',
    team_broadcast: '团队',
    group_broadcast: '小组',
    direct: '家庭',
    sos: 'SoS',
  };
  return labels[type];
}

export function getMessageScopeLabel(scope: ParentMessageCenterItem['scope']) {
  const labels: Record<ParentMessageCenterItem['scope'], string> = {
    team: '团队',
    group: '小组',
    student: '家庭',
    system: '系统',
  };
  return labels[scope];
}

export function getPortfolioWorksByStudent(state: ParentState, studentId: string | null) {
  if (!studentId) {
    return [];
  }
  return [...state.portfolioWorks]
    .filter((work) => work.studentId === studentId)
    .sort((left, right) => compareByDateDesc(left.submittedAt, right.submittedAt));
}

export function getStudyDiaryItemsByStudent(state: ParentState, studentId: string | null) {
  if (!studentId) {
    return [];
  }
  return [...state.diaryItems]
    .filter((item) => item.studentId === studentId)
    .sort((left, right) => compareByDateDesc(left.date, right.date));
}

export function getStudyDiaryTypeLabel(type: GrowthDiaryType) {
  const labels: Record<GrowthDiaryType, string> = {
    timeline: '时间线',
    report: '研学报告',
    work: '学习作品',
    task: '任务',
    ai_qa: '拍拍/问问',
    ai_creation: 'AI创作',
    flash_note: '闪记',
    photo: '照片',
    achievement: '成就',
    expert_course: '专家课程',
    challenge: '难题挑战',
    review: '评价',
    study_diary: '研学日记',
    assessment: '家长评测',
  };
  return labels[type];
}

export function getPortfolioAiRecordsByStudent(
  state: ParentState,
  studentId: string | null,
  kind?: ParentAiRecord['kind'],
) {
  if (!studentId) {
    return [];
  }
  return [...state.portfolioAiRecords]
    .filter((record) => record.studentId === studentId && (!kind || record.kind === kind))
    .sort((left, right) => compareByDateDesc(left.createdAt, right.createdAt));
}

export function getSortedMessageCenterItems(state: ParentState, studentId: string | null) {
  return [...state.messageCenterItems]
    .filter((item) => !item.studentId || !studentId || item.studentId === studentId)
    .sort((left, right) => {
      const leftPriority = left.type === 'sos' ? 0 : left.type === 'system' ? 1 : left.read ? 3 : 2;
      const rightPriority = right.type === 'sos' ? 0 : right.type === 'system' ? 1 : right.read ? 3 : 2;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
      return compareByDateDesc(left.createdAt, right.createdAt);
    });
}

export function getPortfolioTimelineEntries(state: ParentState, studentId: string | null): PortfolioTimelineEntry[] {
  if (!studentId) {
    return [];
  }

  const reportEntries = state.reports
    .filter((report) => report.studentId === studentId)
    .map<PortfolioTimelineEntry>((report) => ({
      id: `timeline_report_${report.id}`,
      studentId,
      entryType: report.type === 'parent_review' ? 'assessment' : 'report',
      sourceLabel: report.type === 'parent_review' ? '家长评测' : report.planeTitle,
      occurredAt: report.date.length > 10 ? report.date : `${report.date} 18:00`,
      title: report.title,
      summary: report.summary,
      relatedId: report.id,
      relatedKind: 'report',
      rating: report.type === 'study_report' ? '综合报告' : undefined,
    }));

  const workEntries = getPortfolioWorksByStudent(state, studentId).flatMap<PortfolioTimelineEntry>((work) => {
    const taskLabel = `${work.studyType} · ${work.taskTitle}`;
    const entries: PortfolioTimelineEntry[] = [
      {
        id: `timeline_work_submit_${work.id}`,
        studentId,
        entryType: 'work_submitted',
        sourceLabel: '设备端同步',
        occurredAt: work.submittedAt,
        title: `${work.taskTitle}作品已同步`,
        summary: work.summary,
        relatedId: work.id,
        relatedKind: 'work',
        rating: taskLabel,
      },
    ];

    if (work.status === 'scored' || work.parentScore) {
      entries.push({
        id: `timeline_work_scored_${work.id}`,
        studentId,
        entryType: 'work_scored',
        sourceLabel: '家长评分',
        occurredAt: work.updatedAt,
        title: `${work.taskTitle}评分完成`,
        summary: work.parentComment ?? '家长已完成评分与评价。',
        relatedId: work.id,
        relatedKind: 'work',
        rating: work.rating,
      });
    }

    return entries;
  });

  const aiEntries = getPortfolioAiRecordsByStudent(state, studentId).map<PortfolioTimelineEntry>((record) => ({
    id: `timeline_ai_${record.id}`,
    studentId,
    entryType: record.kind === 'qa' ? 'ai_qa' : 'ai_creation',
    sourceLabel: record.agentName,
    occurredAt: record.createdAt,
    title: record.title,
    summary: record.summary,
    relatedId: record.id,
    relatedKind: 'ai',
    rating: record.workType,
  }));

  const photoEntries = state.portfolioPhotos
    .filter((photo) => photo.studentId === studentId)
    .map<PortfolioTimelineEntry>((photo) => ({
      id: `timeline_photo_${photo.id}`,
      studentId,
      entryType: 'photo',
      sourceLabel: photo.sourceLabel,
      occurredAt: photo.createdAt,
      title: photo.title,
      summary: photo.summary,
      relatedId: photo.id,
      relatedKind: 'record',
      rating: `${photo.attachments.length} 张照片`,
    }));

  const achievementEntries = state.portfolioAchievements
    .filter((achievement) => achievement.studentId === studentId)
    .map<PortfolioTimelineEntry>((achievement) => ({
      id: `timeline_achievement_${achievement.id}`,
      studentId,
      entryType: 'achievement',
      sourceLabel: achievement.sourceLabel,
      occurredAt: achievement.createdAt,
      title: achievement.title,
      summary: achievement.summary,
      relatedId: achievement.id,
      relatedKind: 'record',
      rating: `${achievement.achievementType} · ${achievement.uploadedBy}`,
    }));

  const diaryEntries = state.portfolioDeviceDiaries
    .filter((item) => item.studentId === studentId)
    .map<PortfolioTimelineEntry>((item) => ({
      id: `timeline_diary_${item.id}`,
      studentId,
      entryType: 'flash_note',
      sourceLabel: item.sourceLabel,
      occurredAt: item.createdAt,
      title: item.title,
      summary: item.summary,
      relatedId: item.id,
      relatedKind: 'record',
      rating: `${item.attachments.length} 项素材`,
    }));

  const manualDiaryEntries = state.diaryItems
    .filter((item) => item.studentId === studentId && !['timeline', 'report', 'work', 'ai_qa', 'ai_creation', 'photo', 'achievement', 'flash_note'].includes(item.type))
    .map<PortfolioTimelineEntry>((item) => ({
      id: `timeline_manual_${item.id}`,
      studentId,
      entryType: (item.type === 'assessment' ? 'assessment' : item.type) as PortfolioTimelineEntryType,
      sourceLabel: item.source,
      occurredAt: item.date,
      title: item.title,
      summary: item.summary,
      relatedId: item.relatedId,
      relatedKind:
        item.type === 'challenge'
          ? 'report'
          : item.type === 'achievement' || item.type === 'flash_note'
            ? 'record'
            : undefined,
      rating: item.rating,
    }));

  const growthEntries = state.portfolioGrowthRecords
    .filter((record) => record.studentId === studentId && record.type !== 'growth_value')
    .map<PortfolioTimelineEntry>((record) => ({
      id: `timeline_growth_${record.id}`,
      studentId,
      entryType: record.type,
      sourceLabel: record.displaySource,
      occurredAt: record.occurredAt,
      title: record.title,
      summary: record.summary,
      relatedId: record.id,
      relatedKind: 'record',
      rating: record.type === 'growth_value' ? `${record.delta > 0 ? '+' : ''}${record.delta}` : `${record.value.toFixed(1)}`,
    }));

  return [...reportEntries, ...workEntries, ...aiEntries, ...photoEntries, ...achievementEntries, ...diaryEntries, ...manualDiaryEntries, ...growthEntries].sort(
    (left, right) => compareByDateDesc(left.occurredAt, right.occurredAt),
  );
}

function getPlaneElements(planeKey: CapabilityPlaneKey | 'all') {
  if (planeKey === 'all') {
    return CAPABILITY_PLANES.flatMap((plane) => plane.elements);
  }
  return CAPABILITY_PLANES.find((plane) => plane.key === planeKey)?.elements ?? [];
}

function getPlaneTitle(planeKey: CapabilityPlaneKey | 'all') {
  if (planeKey === 'all') {
    return '全面测试';
  }
  return CAPABILITY_PLANES.find((plane) => plane.key === planeKey)?.title ?? '能力评测';
}

function withStudent(state: ParentState, studentId: string, updater: (student: ParentStudent) => ParentStudent) {
  return {
    ...state,
    students: state.students.map((student) => (student.id === studentId ? updater(student) : student)),
  };
}

function familyTeamId(studentId: string | null, studyDate: string) {
  return `family_${studentId ?? 'parent'}_${studyDate.replaceAll('-', '')}`;
}

function getTaskAdjustmentRecordType(task: Pick<FamilyTask, 'base' | 'taskType' | 'title'>): CapabilityAdjustmentRecord['recordType'] {
  if (task.taskType.includes('难题') || task.title.includes('挑战')) {
    return '难题挑战';
  }
  if (task.base.includes('家庭') || task.taskType.includes('日常')) {
    return '日常任务';
  }
  return '家庭研学';
}

function buildLongTermFamilyTeam(student: ParentStudent): ParentFamilyTeam {
  return {
    id: `family_team_${student.id}`,
    name: `${student.name}家庭研学长期`,
    type: 'long_term',
    theme: '家庭长期研学',
    location: student.city || '家庭研学',
    studyDate: today(),
    goal: '围绕日常观察、家庭任务和亲子研学持续沉淀能力成长。',
    studentIds: [student.id],
    inviteCode: `YXB${student.yxbId}`,
    createdAt: nowText(),
  };
}

function getSelectedFamilyTeamId(state: ParentState) {
  return state.selectedFamilyTeamId ?? state.familyTeams[0]?.id ?? null;
}

function refreshRelationLabel(state: ParentState): ParentState {
  return {
    ...state,
    parentProfile: {
      ...state.parentProfile,
      relationLabel: `已绑定 ${state.students.length} 位学员`,
    },
  };
}

function createStudent(students: ParentStudent[], input: StudentInput): ParentStudent {
  const yxbId = nextYxbId(students);
  const growthValue = 0;
  return {
    id: makeId('student'),
    yxbId,
    name: input.name,
    idNumber: input.idNumber,
    birthday: input.birthday,
    age: calcAge(input.birthday),
    city: input.city,
    school: input.school,
    grade: input.grade,
    avatar: input.avatar || input.name.slice(-2),
    avatarImage: input.avatarImage,
    growthValue,
    growthWallet: buildGrowthWallet(growthValue),
    talentProfile: buildDefaultTalentProfile(students.length + 1),
    interestProfile: buildDefaultInterestProfile(students.length + 1),
    account: buildStudentAccount(yxbId, false),
    setupState: 'pending_device',
    capabilities: buildCapabilities(-0.2),
  };
}

export function ParentStoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<ParentState>(() => buildEmptyState());

  useEffect(() => {
    setState(readStoredState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    }
  }, [hydrated, state]);

  const value = useMemo<ParentContextValue>(() => {
    const selectedStudent = state.students.find((student) => student.id === state.selectedStudentId) ?? state.students[0] ?? null;

    return {
      hydrated,
      state,
      selectedStudent,
      capabilityAverage: averageCapability(selectedStudent),
      selectStudent(studentId) {
        setState((current) => ({ ...current, selectedStudentId: studentId }));
      },
      selectFamilyTeam(teamId) {
        setState((current) => ({ ...current, selectedFamilyTeamId: teamId }));
      },
      resetDemoData() {
        setState(buildDemoState());
      },
      addStudent(input) {
        const nextStudent = createStudent(state.students, input);
        const nextTeam = buildLongTermFamilyTeam(nextStudent);
        setState((current) =>
          refreshRelationLabel({
            ...current,
            selectedStudentId: nextStudent.id,
            selectedFamilyTeamId: nextTeam.id,
            students: [...current.students, nextStudent],
            familyTeams: [nextTeam, ...current.familyTeams],
          }),
        );
        return nextStudent.id;
      },
      updateStudent(studentId, input) {
        setState((current) =>
          refreshRelationLabel(
            withStudent(current, studentId, (student) => ({
              ...student,
              ...input,
              age: calcAge(input.birthday),
              avatar: input.avatar || input.name.slice(-2),
              avatarImage: input.avatarImage,
            })),
          ),
        );
      },
      updateTalentInterest(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => ({
            ...student,
            talentProfile: {
              ...student.talentProfile,
              strongestTalent: input.strongestTalent,
              parentTalent: input.parentTalent,
              source: input.testCompleted ? 'student_test' : 'parent_review',
              testCompleted: input.testCompleted ?? student.talentProfile.testCompleted,
              updatedAt: nowText(),
            },
            interestProfile: {
              studentTags: input.studentTags,
              parentTags: input.parentTags,
              updatedAt: nowText(),
            },
          })),
        );
      },
      bindDevice(studentId, input) {
        setState((current) => {
          const nextMessage: ParentMessage = {
            id: makeId('msg'),
            type: 'system',
            scope: 'system',
            title: '研学宝绑定成功',
            content: `设备 ${input.deviceCode} 已绑定到 ${current.students.find((student) => student.id === studentId)?.name ?? '当前学员'}。`,
            createdAt: nowText(),
            read: false,
          };

          return refreshRelationLabel({
            ...withStudent(current, studentId, (student) => ({
              ...student,
              setupState: 'ready',
              account: {
                ...student.account,
                status: '已激活',
              },
              device: (() => {
                const nextDevice = buildDevice(input.deviceCode, input.mode);
                return {
                  ...nextDevice,
                  id: student.device?.id ?? nextDevice.id,
                  boundAt: nowText(),
                  mode: input.mode,
                };
              })(),
            })),
            messages: [nextMessage, ...current.messages],
            messageCenterItems: [buildMessageCenterItemFromMessage(nextMessage), ...current.messageCenterItems],
          });
        });
      },
      startAlipayFamilyPayBind(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            const accountTail = input.account.replace(/\D/g, '').slice(-4) || input.account.slice(-4) || '----';
            return {
              ...student,
              device: {
                ...device,
                paymentCard: {
                  id: device.paymentCard?.id ?? makeId('payment_card'),
                  provider: '支付宝亲子卡',
                  alias: input.alias?.trim() || '支付宝亲密付',
                  account: input.account,
                  accountTail,
                  status: '授权中',
                  bindType: 'alipay_family_pay',
                  authStatus: '授权中',
                  limitAmount: input.limitAmount ?? 300,
                  boundAt: device.paymentCard?.boundAt ?? nowText(),
                  updatedAt: nowText(),
                  balance: device.paymentCard?.balance ?? 0,
                  records: device.paymentCard?.records ?? [],
                },
              },
            };
          }),
        );
      },
      confirmAlipayFamilyPayBind(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            const accountTail = input.account.replace(/\D/g, '').slice(-4) || input.account.slice(-4) || '----';
            return {
              ...student,
              device: {
                ...device,
                paymentCard: {
                  id: device.paymentCard?.id ?? makeId('payment_card'),
                  provider: '支付宝亲子卡',
                  alias: input.alias?.trim() || device.paymentCard?.alias || '支付宝亲密付',
                  account: input.account,
                  accountTail,
                  status: '已绑定',
                  bindType: 'alipay_family_pay',
                  authStatus: '已授权',
                  limitAmount: input.limitAmount ?? device.paymentCard?.limitAmount ?? 300,
                  boundAt: nowText(),
                  updatedAt: nowText(),
                  balance: device.paymentCard?.balance ?? 0,
                  records: device.paymentCard?.records ?? [],
                },
              },
            };
          }),
        );
      },
      savePaymentCard(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            const cardInput = typeof input === 'string' ? { account: input } : input;
            const accountTail = cardInput.account.replace(/\D/g, '').slice(-4) || cardInput.account.slice(-4);
            return {
              ...student,
              device: {
                ...device,
                paymentCard: {
                  id: device.paymentCard?.id ?? makeId('payment_card'),
                  provider: '支付宝亲子卡',
                  alias: cardInput.alias?.trim() || device.paymentCard?.alias || '亲子支付卡',
                  account: cardInput.account,
                  accountTail,
                  status: '已绑定',
                  bindType: 'alipay_family_pay',
                  authStatus: '已授权',
                  limitAmount: cardInput.limitAmount ?? device.paymentCard?.limitAmount ?? 300,
                  boundAt: device.paymentCard?.boundAt ?? nowText(),
                  updatedAt: nowText(),
                  balance: device.paymentCard?.balance ?? 0,
                  records: device.paymentCard?.records ?? [],
                },
              },
            };
          }),
        );
      },
      removePaymentCard(studentId) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            if (!student.device) {
              return student;
            }
            return {
              ...student,
              device: {
                ...student.device,
                paymentCard: undefined,
              },
            };
          }),
        );
      },
      addPaymentRecord(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            const currentCard = device.paymentCard ?? {
              id: makeId('payment_card'),
              provider: '支付宝亲子卡' as const,
              alias: '亲子支付卡',
              account: '待绑定账号',
              accountTail: '----',
              status: '已绑定' as const,
              bindType: 'alipay_family_pay' as const,
              authStatus: '已授权' as const,
              limitAmount: 300,
              boundAt: nowText(),
              updatedAt: nowText(),
              balance: 0,
              records: [],
            };
            const record: PaymentRecord = {
              id: makeId('pay'),
              title: input.title,
              amount: input.amount,
              type: input.type,
              status: '成功',
              createdAt: nowText(),
            };
            return {
              ...student,
              device: {
                ...device,
                paymentCard: {
                  ...currentCard,
                  balance: Math.max(0, Number((currentCard.balance + input.amount).toFixed(2))),
                  updatedAt: nowText(),
                  records: [record, ...currentCard.records],
                },
              },
            };
          }),
        );
      },
      startNetDiskQrBind(studentId) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            return {
              ...student,
              device: {
                ...device,
                netDisk: {
                  provider: '百度网盘',
                  alias: '百度网盘扫码授权',
                  account: '等待扫码授权',
                  status: '授权中',
                  bindMethod: 'mock_qr',
                  authStatus: '授权中',
                  qrSessionId: makeId('netdisk_qr'),
                  boundAt: device.netDisk?.boundAt ?? nowText(),
                  capacityUsed: device.netDisk?.capacityUsed ?? 0,
                  capacityTotal: device.netDisk?.capacityTotal ?? 20,
                  lastSyncAt: device.netDisk?.lastSyncAt ?? nowText(),
                  syncRecords: device.netDisk?.syncRecords ?? [],
                },
              },
            };
          }),
        );
      },
      confirmNetDiskQrBind(studentId) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            return {
              ...student,
              device: {
                ...device,
                netDisk: {
                  provider: '百度网盘',
                  alias: '家庭研学资料库',
                  account: 'yxb-family-demo',
                  status: '已绑定',
                  bindMethod: 'mock_qr',
                  authStatus: '已授权',
                  qrSessionId: device.netDisk?.qrSessionId ?? makeId('netdisk_qr'),
                  boundAt: nowText(),
                  capacityUsed: device.netDisk?.capacityUsed ?? 6.8,
                  capacityTotal: device.netDisk?.capacityTotal ?? 20,
                  lastSyncAt: nowText(),
                  syncRecords: device.netDisk?.syncRecords?.length
                    ? device.netDisk.syncRecords
                    : [
                        {
                          id: makeId('sync'),
                          title: '扫码绑定后同步研学资料',
                          fileType: '照片',
                          syncedAt: nowText(),
                          status: '已同步',
                        },
                      ],
                },
              },
            };
          }),
        );
      },
      saveNetDisk(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            const diskInput = typeof input === 'string' ? { account: input } : input;
            return {
              ...student,
              device: {
                ...device,
                netDisk: {
                  provider: '百度网盘',
                  alias: diskInput.alias?.trim() || device.netDisk?.alias || '家庭研学资料库',
                  account: diskInput.account,
                  status: '已绑定',
                  bindMethod: 'mock_qr',
                  authStatus: '已授权',
                  qrSessionId: device.netDisk?.qrSessionId ?? makeId('netdisk_qr'),
                  boundAt: device.netDisk?.boundAt ?? nowText(),
                  capacityUsed: device.netDisk?.capacityUsed ?? 0,
                  capacityTotal: device.netDisk?.capacityTotal ?? 20,
                  lastSyncAt: device.netDisk?.lastSyncAt ?? nowText(),
                  syncRecords: device.netDisk?.syncRecords ?? [],
                },
              },
            };
          }),
        );
      },
      removeNetDisk(studentId) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            if (!student.device) {
              return student;
            }
            return {
              ...student,
              device: {
                ...student.device,
                netDisk: undefined,
              },
            };
          }),
        );
      },
      syncNetDisk(studentId) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            const currentDisk = device.netDisk ?? {
              provider: '百度网盘' as const,
              alias: '家庭研学资料库',
              account: '待绑定账号',
              status: '已绑定' as const,
              bindMethod: 'mock_qr' as const,
              authStatus: '已授权' as const,
              qrSessionId: makeId('netdisk_qr'),
              boundAt: nowText(),
              capacityUsed: 0,
              capacityTotal: 20,
              lastSyncAt: nowText(),
              syncRecords: [],
            };
            const record: NetDiskSyncRecord = {
              id: makeId('sync'),
              title: '家庭研学照片与作品同步',
              fileType: '照片',
              syncedAt: nowText(),
              status: '已同步',
            };
            return {
              ...student,
              device: {
                ...device,
                netDisk: {
                  ...currentDisk,
                  status: '已绑定',
                  lastSyncAt: nowText(),
                  capacityUsed: Math.min(currentDisk.capacityTotal, Number((currentDisk.capacityUsed + 0.3).toFixed(1))),
                  syncRecords: [record, ...currentDisk.syncRecords],
                },
              },
            };
          }),
        );
      },
      addContact(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            return {
              ...student,
              device: {
                ...device,
                contacts: [
                  ...device.contacts,
                  {
                    id: makeId('contact'),
                    name: input.name,
                    relation: input.relation,
                    phone: input.phone,
                    allowed: input.allowed ?? true,
                    category: input.category ?? '其他',
                    isEmergency: input.isEmergency ?? false,
                    updatedAt: nowText(),
                  },
                ],
              },
            };
          }),
        );
      },
      updateContact(studentId, contactId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            if (!student.device) {
              return student;
            }
            return {
              ...student,
              device: {
                ...student.device,
                contacts: student.device.contacts.map((contact) =>
                  contact.id === contactId
                    ? {
                        ...contact,
                        name: input.name,
                        relation: input.relation,
                        phone: input.phone,
                        category: input.category ?? contact.category,
                        isEmergency: input.isEmergency ?? contact.isEmergency,
                        allowed: input.allowed ?? contact.allowed,
                        updatedAt: nowText(),
                      }
                    : contact,
                ),
              },
            };
          }),
        );
      },
      toggleContact(studentId, contactId) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            if (!student.device) {
              return student;
            }
            return {
              ...student,
              device: {
                ...student.device,
                contacts: student.device.contacts.map((contact) =>
                  contact.id === contactId ? { ...contact, allowed: !contact.allowed, updatedAt: nowText() } : contact,
                ),
              },
            };
          }),
        );
      },
      deleteContact(studentId, contactId) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            if (!student.device) {
              return student;
            }
            return {
              ...student,
              device: {
                ...student.device,
                contacts: student.device.contacts.filter((contact) => contact.id !== contactId),
              },
            };
          }),
        );
      },
      addQuietTime(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            return {
              ...student,
              device: {
                ...device,
                quietTimes: [
                  ...device.quietTimes,
                  {
                    id: makeId('quiet'),
                    label: input.label,
                    start: input.start,
                    end: input.end,
                    weekdays: input.weekdays,
                    enabled: input.enabled ?? true,
                    updatedAt: nowText(),
                    syncStatus: '已同步',
                  },
                ],
              },
            };
          }),
        );
      },
      updateQuietTime(studentId, quietTimeId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            if (!student.device) {
              return student;
            }
            return {
              ...student,
              device: {
                ...student.device,
                quietTimes: student.device.quietTimes.map((item) =>
                  item.id === quietTimeId
                    ? {
                        ...item,
                        label: input.label,
                        start: input.start,
                        end: input.end,
                        weekdays: input.weekdays,
                        enabled: input.enabled ?? item.enabled,
                        updatedAt: nowText(),
                        syncStatus: '已同步',
                      }
                    : item,
                ),
              },
            };
          }),
        );
      },
      toggleQuietTime(studentId, quietTimeId) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            if (!student.device) {
              return student;
            }
            return {
              ...student,
              device: {
                ...student.device,
                quietTimes: student.device.quietTimes.map((item) =>
                  item.id === quietTimeId ? { ...item, enabled: !item.enabled, updatedAt: nowText(), syncStatus: '已同步' } : item,
                ),
              },
            };
          }),
        );
      },
      deleteQuietTime(studentId, quietTimeId) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            if (!student.device) {
              return student;
            }
            return {
              ...student,
              device: {
                ...student.device,
                quietTimes: student.device.quietTimes.filter((item) => item.id !== quietTimeId),
              },
            };
          }),
        );
      },
      completeAssessment(studentId, planeKey, answers) {
        setState((current) => {
          const elementKeys = getPlaneElements(planeKey);
          let reportRows: CapabilityReport['rows'] = [];
          const nextState = withStudent(current, studentId, (student) => {
            const nextCapabilities = student.capabilities.map((capability) => {
              if (!elementKeys.includes(capability.elementKey)) {
                return capability;
              }
              const values = ASSESSMENT_QUESTIONS.map((_, questionIndex) => answers[`${capability.elementKey}_${questionIndex}`] ?? 6);
              const reviewScore = round1(values.reduce((sum, value) => sum + value, 0) / values.length);
              const latestIndex = round1(capability.score * 0.7 + reviewScore * 0.3);
              reportRows = [
                ...reportRows,
                {
                  elementKey: capability.elementKey,
                  score: reviewScore,
                  latestIndex,
                  average: capability.averageScore,
                },
              ];
              return normalizeCapability({
                ...capability,
                score: latestIndex,
                source: 'parent_review' as const,
                recordedAt: nowIso(),
              });
            });
            return { ...student, capabilities: nextCapabilities };
          });
          const report: CapabilityReport = {
            id: makeId('report'),
            studentId,
            type: 'parent_review',
            title: `${getPlaneTitle(planeKey)}家长能力评测报告`,
            date: today(),
            organizationName: '家庭研学',
            teamOrTaskName: getPlaneTitle(planeKey),
            evaluator: current.parentProfile.name,
            evaluatedAt: nowText(),
            sourceType: '家长',
            recordType: '家长评测',
            planeTitle: getPlaneTitle(planeKey),
            summary: `本次完成 ${reportRows.length} 个能力元素评测，已更新能力指数。`,
            rows: reportRows,
          };
          const capabilityUpdateRecord: ParentGrowthRecord = {
            id: makeId('growth'),
            studentId,
            type: 'capability_update',
            category: getPlaneTitle(planeKey),
            sourceType: 'parent_review',
            title: `${getPlaneTitle(planeKey)}能力指数更新`,
            value: round1(reportRows.reduce((sum, row) => sum + row.latestIndex, 0) / Math.max(reportRows.length, 1)),
            delta: round1(reportRows.reduce((sum, row) => sum + (row.latestIndex - row.average), 0)),
            occurredAt: nowText(),
            summary: `已完成 ${reportRows.length} 个能力元素评测，能力指数与评测记录已同步更新。`,
            displaySource: '能力更新',
            relatedId: report.id,
          };
          const diaryItem: GrowthDiaryItem = {
            id: makeId('diary'),
            studentId,
            type: 'assessment',
            title: report.title,
            date: nowText(),
            source: '家长评测',
            summary: report.summary,
            relatedId: report.id,
          };
          const adjustmentRecord: CapabilityAdjustmentRecord = {
            id: makeId('adjust'),
            studentId,
            recordType: '家长评测',
            sourceTitle: report.title,
            organizationName: '家庭研学',
            teamOrTaskName: getPlaneTitle(planeKey),
            reportTitle: report.title,
            reportId: report.id,
            evaluator: current.parentProfile.name,
            evaluatedAt: nowText(),
            sourceType: '家长',
            elementRecords: reportRows.map((row) => ({
              elementKey: row.elementKey,
              beforeIndex: round1((row.latestIndex - row.score * 0.3) / 0.7),
              assessmentValue: row.score,
              afterIndex: row.latestIndex,
            })),
          };
          return {
            ...nextState,
            reports: [report, ...nextState.reports],
            portfolioGrowthRecords: [capabilityUpdateRecord, ...nextState.portfolioGrowthRecords],
            capabilityAdjustmentRecords: [adjustmentRecord, ...nextState.capabilityAdjustmentRecords],
            diaryItems: [diaryItem, ...nextState.diaryItems],
          };
        });
      },
      createTasksFromTemplates(input) {
        const templates = TASK_LIBRARY.filter((template) => input.templateIds.includes(template.id));
        const taskIds = templates.map(() => makeId('task'));
        setState((current) => {
          const targetTeamId = input.familyTeamId ?? getSelectedFamilyTeamId(current) ?? familyTeamId(current.selectedStudentId, input.studyDate);
          const tasks = templates.map((template, index): FamilyTask => ({
            id: taskIds[index],
            familyTeamId: targetTeamId,
            title: template.title,
            base: input.destination || template.base,
            taskType: template.taskType,
            studyDate: input.studyDate,
            points: template.points,
            description: template.description,
            capabilityTags: input.capabilityTags.length > 0 ? input.capabilityTags : template.capabilityTags,
            requirements: clone(template.requirements).map((requirement) => ({ ...requirement, id: makeId('req') })),
            status: 'draft',
            assignedStudentIds: [],
            createdAt: nowText(),
          }));
          return { ...current, selectedFamilyTeamId: targetTeamId, familyTasks: [...tasks, ...current.familyTasks] };
        });
        return taskIds;
      },
      createCustomTask(input) {
        const taskId = makeId('task');
        setState((current) => {
          const targetTeamId = input.familyTeamId ?? getSelectedFamilyTeamId(current) ?? familyTeamId(current.selectedStudentId, input.studyDate);
          const task: FamilyTask = {
            id: taskId,
            familyTeamId: targetTeamId,
            title: input.title,
            base: input.base,
            taskType: input.taskType,
            studyDate: input.studyDate,
            points: Number(input.points) || 10,
            description: input.description,
            capabilityTags: input.capabilityTags,
            requirements: input.requirements
              .filter((requirement) => requirement.requirement)
              .map((requirement) => ({ id: makeId('req'), ...requirement })),
            status: 'draft',
            assignedStudentIds: [],
            createdAt: nowText(),
          };
          return { ...current, selectedFamilyTeamId: targetTeamId, familyTasks: [task, ...current.familyTasks] };
        });
        return taskId;
      },
      updateTask(taskId, input) {
        setState((current) => ({
          ...current,
          familyTasks: current.familyTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  title: input.title,
                  base: input.base,
                  taskType: input.taskType,
                  studyDate: input.studyDate,
                  points: Number(input.points) || task.points,
                  description: input.description,
                  capabilityTags: input.capabilityTags,
                  requirements: input.requirements
                    .filter((requirement) => requirement.requirement)
                    .map((requirement) => ({ id: makeId('req'), ...requirement })),
                }
              : task,
          ),
        }));
      },
      createFamilyTeam(input) {
        const teamId = makeId('family_team');
        setState((current) => {
          const team: ParentFamilyTeam = {
            id: teamId,
            name: input.name,
            type: 'activity',
            theme: input.theme,
            location: input.location,
            studyDate: input.studyDate,
            goal: input.goal,
            studentIds: input.studentIds,
            inviteCode: `INV${Date.now().toString(36).slice(-6).toUpperCase()}`,
            createdAt: nowText(),
          };
          return {
            ...current,
            selectedFamilyTeamId: teamId,
            familyTeams: [team, ...current.familyTeams],
          };
        });
        return teamId;
      },
      joinFamilyTeamFromInvite(input) {
        let joinedStudentId = '';
        setState((current) => {
          const existingStudent = current.students.find((student) => student.name === input.childName);
          const nextStudent =
            existingStudent ??
            createStudent(current.students, {
              name: input.childName,
              idNumber: `INVITE${Date.now().toString().slice(-8)}`,
              birthday: '2016-09-01',
              city: '深圳',
              school: '好友家庭',
              grade: input.grade,
              avatar: input.childName.slice(-2),
            });
          joinedStudentId = nextStudent.id;
          const nextTeam = existingStudent ? null : buildLongTermFamilyTeam(nextStudent);
          const now = today();
          return refreshRelationLabel({
            ...current,
            selectedStudentId: nextStudent.id,
            selectedFamilyTeamId: input.teamId,
            students: existingStudent ? current.students : [...current.students, nextStudent],
            familyTeams: [
              ...(nextTeam ? [nextTeam] : []),
              ...current.familyTeams.map((team) =>
                team.id === input.teamId && !team.studentIds.includes(nextStudent.id)
                  ? { ...team, studentIds: [...team.studentIds, nextStudent.id] }
                  : team,
              ),
            ],
            familyTasks: current.familyTasks.map((task) =>
              task.familyTeamId === input.teamId &&
              task.status !== 'draft' &&
              task.studyDate >= now &&
              !task.assignedStudentIds.includes(nextStudent.id)
                ? { ...task, assignedStudentIds: [...task.assignedStudentIds, nextStudent.id] }
                : task,
            ),
            messages: [
              {
                id: makeId('msg'),
                type: 'system',
                scope: 'system',
                title: '研学邀伴报名成功',
                content: `${input.childName} 已通过邀伴链接加入家庭研学团队，未来任务会自动下发。`,
                createdAt: nowText(),
                read: false,
              },
              ...current.messages,
            ],
          });
        });
        return joinedStudentId;
      },
      publishTasks(taskIds, studentIds) {
        setState((current) => {
          const publishMessages = taskIds.map((taskId): ParentMessage => {
            const task = current.familyTasks.find((item) => item.id === taskId);
            return {
              id: makeId('msg'),
              type: 'system',
              scope: 'system',
              title: '家庭任务已下发',
              content: `${task?.title ?? '家庭任务'} 已下发到 ${studentIds.length} 位学员研学宝。`,
              createdAt: nowText(),
              read: false,
            };
          });

          return {
            ...current,
            familyTasks: current.familyTasks.map((task) =>
              taskIds.includes(task.id)
                ? {
                    ...task,
                    status: task.status === 'draft' ? 'published' : task.status,
                    assignedStudentIds: studentIds,
                    publishedAt: task.publishedAt ?? nowText(),
                  }
                : task,
            ),
            messages: [...publishMessages, ...current.messages],
            messageCenterItems: [...publishMessages.map(buildMessageCenterItemFromMessage), ...current.messageCenterItems],
          };
        });
      },
      syncDeviceWork(taskId, studentId) {
        setState((current) => {
          const task = current.familyTasks.find((item) => item.id === taskId);
          if (!task || current.works.some((work) => work.taskId === taskId && work.studentId === studentId)) {
            return current;
          }
          const work: TaskWork = {
            id: makeId('work'),
            taskId,
            studentId,
            submittedAt: nowText(),
            status: 'synced',
            contentType: 'mixed',
            content: `设备端已同步作品：完成《${task.title}》，提交了文字记录和现场照片。孩子能够围绕任务目标描述观察过程，并提出自己的发现。`,
            attachments: ['设备端照片', '语音转文字'],
            aiScore: 9,
          };
          const portfolioWork = buildPortfolioWorkFromTaskWork(work, task);
          return {
            ...current,
            familyTasks: current.familyTasks.map((item) => (item.id === taskId ? { ...item, status: 'submitted' } : item)),
            works: [work, ...current.works],
            portfolioWorks: [portfolioWork, ...current.portfolioWorks],
            diaryItems: [
              {
                id: makeId('diary'),
                studentId,
                type: 'work',
                title: `${task.title}作品已同步`,
                date: nowText(),
                source: '设备端同步',
                summary: work.content,
                rating: '待评分',
                relatedId: work.id,
                media: work.attachments,
              },
              ...current.diaryItems,
            ],
          };
        });
      },
      scoreWork(workId, input) {
        setState((current) => {
          const work = current.works.find((item) => item.id === workId);
          const task = work ? current.familyTasks.find((item) => item.id === work.taskId) : null;
          if (!work || !task) {
            return current;
          }
          const normalizedScore = Math.round(Math.max(0, Math.min(10, input.score)));
          const actualScore = round1((task.points * normalizedScore) / 10);
          const growthDelta = Math.round(actualScore * 5);
          const scoreRecordedAt = nowText();
          const scoredWork: TaskWork = {
            ...work,
            status: 'scored',
            parentScore: normalizedScore,
            actualScore,
            rating: normalizedScore,
            comment: input.comment,
            scoredAt: scoreRecordedAt,
          };
          const nextState = withStudent(current, work.studentId, (student) => {
            const nextCapabilities = student.capabilities.map((capability) => {
              if (!task.capabilityTags.includes(capability.elementKey)) {
                return capability;
              }
              return normalizeCapability({
                ...capability,
                score: round1(capability.score * 0.82 + normalizedScore * 0.18),
                source: 'family_task' as const,
                recordedAt: nowIso(),
              });
            });
            return {
              ...student,
              growthValue: student.growthValue + growthDelta,
              growthWallet: {
                total: student.growthWallet.total + growthDelta,
                available: student.growthWallet.available + growthDelta,
              },
              capabilities: nextCapabilities,
            };
          });
          const scoredPortfolioWork = {
            ...buildPortfolioWorkFromTaskWork(scoredWork, task),
            updatedAt: scoreRecordedAt,
            parentComment: input.comment,
          };
          const growthValueRecord: ParentGrowthRecord = {
            id: makeId('growth'),
            studentId: work.studentId,
            type: 'growth_value',
            category: task.taskType,
            sourceType: 'task',
            title: `${task.title}成长值奖励`,
            value: growthDelta,
            delta: growthDelta,
            occurredAt: scoreRecordedAt,
            summary: `家长评分 ${normalizedScore}/10，实际得分 ${actualScore}/${task.points}，获得 ${growthDelta} 成长值。${input.comment}`,
            displaySource: '成长值',
            relatedId: workId,
          };
          const capabilityUpdateRecord: ParentGrowthRecord = {
            id: makeId('growth'),
            studentId: work.studentId,
            type: 'capability_update',
            category: task.capabilityTags[0] ?? task.taskType,
            sourceType: 'task',
            title: `${task.title}能力指数回写`,
            value: normalizedScore,
            delta: round1(normalizedScore * 0.2),
            occurredAt: scoreRecordedAt,
            summary: `作品评分已同步到 ${task.capabilityTags.join('、')} 等相关能力元素。`,
            displaySource: '能力更新',
            relatedId: workId,
          };
          const ledgerRecord: GrowthValueLedgerRecord = {
            id: makeId('ledger'),
            studentId: work.studentId,
            title: `${task.title}成长值奖励`,
            type: 'earn',
            value: growthDelta,
            availableAfter:
              nextState.students.find((student) => student.id === work.studentId)?.growthWallet.available ?? growthDelta,
            occurredAt: scoreRecordedAt,
            source: '家庭任务评分',
            relatedId: workId,
          };
          const scoreReportId = makeId('report');
          const recordType = getTaskAdjustmentRecordType(task);
          const adjustmentRecord: CapabilityAdjustmentRecord = {
            id: makeId('adjust'),
            studentId: work.studentId,
            recordType,
            sourceTitle: `${task.title}作品评分`,
            organizationName: recordType === '难题挑战' ? '家庭研学专家挑战' : '家庭研学',
            teamOrTaskName: task.title,
            reportTitle: `${task.title}评测报告`,
            reportId: scoreReportId,
            evaluator: current.parentProfile.name,
            evaluatedAt: scoreRecordedAt,
            sourceType: '家长',
            elementRecords: task.capabilityTags.map((elementKey) => {
              const before = current.students.find((student) => student.id === work.studentId)?.capabilities.find((item) => item.elementKey === elementKey)?.score ?? normalizedScore;
              const after = nextState.students.find((student) => student.id === work.studentId)?.capabilities.find((item) => item.elementKey === elementKey)?.score ?? normalizedScore;
              return {
                elementKey,
                beforeIndex: before,
                assessmentValue: normalizedScore,
                afterIndex: after,
              };
            }),
          };
          const scoreReport: CapabilityReport = {
            id: scoreReportId,
            studentId: work.studentId,
            type: 'study_report',
            title: adjustmentRecord.reportTitle,
            date: scoreRecordedAt.slice(0, 10),
            organizationName: adjustmentRecord.organizationName,
            teamOrTaskName: adjustmentRecord.teamOrTaskName,
            evaluator: adjustmentRecord.evaluator,
            evaluatedAt: adjustmentRecord.evaluatedAt,
            sourceType: adjustmentRecord.sourceType,
            recordType,
            planeTitle: recordType,
            summary: `家长完成《${task.title}》作品评分，评分 ${normalizedScore}/10，实际得分 ${actualScore}/${task.points}，相关能力指数已同步回写。`,
            rows: adjustmentRecord.elementRecords.map((item) => {
              const capability = nextState.students
                .find((student) => student.id === work.studentId)
                ?.capabilities.find((capabilityItem) => capabilityItem.elementKey === item.elementKey);
              return {
                elementKey: item.elementKey,
                score: item.assessmentValue,
                latestIndex: item.afterIndex,
                average: capability?.averageScore ?? round1((item.beforeIndex + item.afterIndex) / 2),
              };
            }),
          };
          return {
            ...nextState,
            familyTasks: nextState.familyTasks.map((item) => (item.id === task.id ? { ...item, status: 'scored' } : item)),
            works: nextState.works.map((item) => (item.id === workId ? scoredWork : item)),
            portfolioWorks: nextState.portfolioWorks.map((item) => (item.id === workId ? scoredPortfolioWork : item)),
            reports: [scoreReport, ...nextState.reports],
            portfolioGrowthRecords: [capabilityUpdateRecord, growthValueRecord, ...nextState.portfolioGrowthRecords],
            growthValueLedger: [ledgerRecord, ...nextState.growthValueLedger],
            capabilityAdjustmentRecords: [adjustmentRecord, ...nextState.capabilityAdjustmentRecords],
            diaryItems: [
              {
                id: makeId('diary'),
                studentId: work.studentId,
                type: 'review',
                title: `${task.title}评分完成`,
                date: scoreRecordedAt,
                source: '家庭研学评分',
                summary: `家长评分 ${normalizedScore}/10，实际得分 ${actualScore}/${task.points}。${input.comment}`,
                rating: `${normalizedScore}/10`,
                relatedId: workId,
              },
              ...nextState.diaryItems.map((item) =>
                item.relatedId === workId ? { ...item, rating: `${normalizedScore}/10`, summary: input.comment || item.summary } : item,
              ),
            ],
          };
        });
      },
      addMessage(input) {
        setState((current) => {
          const nextMessage: ParentMessage = {
            id: makeId('msg'),
            ...input,
            createdAt: nowText(),
            read: false,
          };

          return {
            ...current,
            messages: [nextMessage, ...current.messages],
            messageCenterItems: [
              {
                ...buildMessageCenterItemFromMessage(nextMessage),
                from: input.scope === 'system' ? '系统中心' : '家长端发送',
              },
              ...current.messageCenterItems,
            ],
          };
        });
      },
      uploadPortfolioPhoto(input) {
        const recordId = makeId('photo');
        setState((current) => ({
          ...current,
          portfolioPhotos: [
            {
              id: recordId,
              studentId: input.studentId,
              title: input.title,
              createdAt: nowText(),
              content: input.content ?? input.summary,
              photoType: '学员照片',
              sourceLabel: input.sourceLabel ?? '家长上传',
              summary: input.summary,
              relatedWorkId: input.relatedWorkId,
              uploadedBy: input.uploadedBy ?? current.parentProfile.name,
              attachments: input.attachments,
            },
            ...current.portfolioPhotos,
          ],
        }));
        return recordId;
      },
      uploadPortfolioAchievement(input) {
        const recordId = makeId('achievement');
        setState((current) => ({
          ...current,
          portfolioAchievements: [
            {
              id: recordId,
              studentId: input.studentId,
              title: input.title,
              createdAt: nowText(),
              content: input.content ?? input.summary,
              sourceLabel: input.sourceLabel ?? '家长上传',
              summary: input.summary,
              relatedWorkId: input.relatedWorkId,
              achievementType: input.achievementType ?? '证书',
              uploadedBy: input.uploadedBy ?? '家长',
              attachments: input.attachments,
            },
            ...current.portfolioAchievements,
          ],
        }));
        return recordId;
      },
      updatePortfolioPhoto(recordId, input) {
        setState((current) => ({
          ...current,
          portfolioPhotos: current.portfolioPhotos.map((record) =>
            record.id === recordId ? { ...record, title: input.title, summary: input.summary, content: input.content ?? input.summary } : record,
          ),
        }));
      },
      updatePortfolioAchievement(recordId, input) {
        setState((current) => ({
          ...current,
          portfolioAchievements: current.portfolioAchievements.map((record) =>
            record.id === recordId ? { ...record, title: input.title, summary: input.summary, content: input.content ?? input.summary } : record,
          ),
        }));
      },
      deletePortfolioPhoto(recordId) {
        setState((current) => ({
          ...current,
          portfolioPhotos: current.portfolioPhotos.filter((record) => record.id !== recordId),
        }));
      },
      deletePortfolioAchievement(recordId) {
        setState((current) => ({
          ...current,
          portfolioAchievements: current.portfolioAchievements.filter((record) => record.id !== recordId),
        }));
      },
      createOrder(input) {
        const orderId = makeId('order');
        setState((current) => ({
          ...current,
          orders: [
            {
              id: orderId,
              type: input?.type ?? '研学宝',
              title: input?.title ?? '研学宝智能硬件优惠订购',
              amount: input?.amount ?? 1299,
              status: input?.status ?? '待支付',
              createdAt: input?.createdAt ?? nowText(),
              studentId: input?.studentId ?? current.selectedStudentId ?? undefined,
              productName: input?.productName ?? '研学宝 Explorer S1 家庭套装',
              sourceLabel: input?.sourceLabel ?? '研学宝订购',
              description: input?.description ?? '请填写收货人、收货地址和手机号码后模拟拉起支付。',
              receiver: input?.receiver ?? current.parentProfile.name,
              address: input?.address ?? '深圳市南山区科技园演示地址',
              phone: input?.phone ?? current.parentProfile.phone,
            },
            ...current.orders,
          ],
        }));
        return orderId;
      },
      payOrder(orderId, submitInfo) {
        setState((current) => ({
          ...current,
          orders: current.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  receiver: submitInfo?.receiver ?? order.receiver,
                  address: submitInfo?.address ?? order.address,
                  phone: submitInfo?.phone ?? order.phone,
                  status: order.type === '团队报名' ? '已缴费' : '已支付',
                  paidAt: nowText(),
                }
              : order,
          ),
        }));
      },
      markOrderViewed(orderId) {
        setState((current) => ({
          ...current,
          orders: current.orders.map((order) =>
            order.id === orderId && (order.status === '未查看' || order.status === '未处理')
              ? { ...order, status: order.type === '团队报名' ? '待缴费' : '待支付' }
              : order,
          ),
        }));
      },
    };
  }, [hydrated, state]);

  return <ParentContext.Provider value={value}>{children}</ParentContext.Provider>;
}

export function useParentStore() {
  const value = useContext(ParentContext);
  if (!value) {
    throw new Error('useParentStore must be used inside ParentStoreProvider');
  }
  return value;
}
