'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CapabilityPlaneKey = 'self' | 'learning' | 'future' | 'social';
export type GrowthDiaryType = 'report' | 'work' | 'ai_qa' | 'ai_creation' | 'growth_value' | 'assessment';
export type FamilyTaskStatus = 'draft' | 'published' | 'submitted' | 'scored';
export type RequirementType = 'text' | 'choice' | 'judge' | 'image';
export type MessageType = 'system' | 'team_broadcast' | 'group_broadcast' | 'direct' | 'sos';
export type CapabilityLevel = '优秀' | '良好' | '待提升' | '待改进';
export type CapabilitySourceBreakdown = Array<{ label: string; value: number }>;
export type CapabilityIndicatorDimension = { label: string; score: number; average: number };

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
  paymentCard?: {
    account: string;
    balance: number;
    records: Array<{ id: string; title: string; amount: number; createdAt: string }>;
  };
  netDisk?: {
    provider: '百度网盘';
    account: string;
    status: '已绑定' | '未绑定';
  };
  contacts: Array<{ id: string; name: string; relation: string; phone: string; allowed: boolean }>;
  quietTimes: Array<{ id: string; label: string; start: string; end: string; enabled: boolean }>;
  tracks: Array<{ id: string; time: string; address: string; distanceMeters: number }>;
};

export type ParentStudent = {
  id: string;
  yxbId: string;
  name: string;
  birthday: string;
  age: number;
  city: string;
  school: string;
  grade: string;
  avatar: string;
  growthValue: number;
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
  planeTitle: string;
  summary: string;
  rows: Array<{ elementKey: string; score: number; latestIndex: number; average: number }>;
};

export type PortfolioTimelineEntryType =
  | 'report'
  | 'work_submitted'
  | 'work_scored'
  | 'ai_qa'
  | 'ai_creation'
  | 'photo'
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
  photoType: '团队照片' | '小组照片' | '学员照片' | '作品附件';
  sourceLabel: string;
  summary: string;
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
  rating?: number;
  comment?: string;
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
  type: '研学宝';
  title: string;
  amount: number;
  status: '待支付' | '已支付' | '已发货';
  createdAt: string;
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
  students: ParentStudent[];
  reports: CapabilityReport[];
  portfolioWorks: ParentStudyWork[];
  portfolioAiRecords: ParentAiRecord[];
  portfolioGrowthRecords: ParentGrowthRecord[];
  portfolioPhotos: ParentPhotoRecord[];
  portfolioDeviceDiaries: ParentDeviceDiary[];
  messageCenterItems: ParentMessageCenterItem[];
  diaryItems: GrowthDiaryItem[];
  familyTasks: FamilyTask[];
  works: TaskWork[];
  messages: ParentMessage[];
  orders: ParentOrder[];
  scanDevices: DemoScanDevice[];
};

type ParentContextValue = {
  hydrated: boolean;
  state: ParentState;
  selectedStudent: ParentStudent | null;
  capabilityAverage: number;
  selectStudent: (studentId: string) => void;
  resetDemoData: () => void;
  addStudent: (input: StudentInput) => string;
  updateStudent: (studentId: string, input: StudentInput) => void;
  bindDevice: (studentId: string, input: DeviceInput) => void;
  savePaymentCard: (studentId: string, account: string) => void;
  saveNetDisk: (studentId: string, account: string) => void;
  addContact: (studentId: string, input: ContactInput) => void;
  toggleQuietTime: (studentId: string, quietTimeId: string) => void;
  completeAssessment: (studentId: string, planeKey: CapabilityPlaneKey | 'all', answers: Record<string, number>) => void;
  createTasksFromTemplates: (input: QuickTaskInput) => string[];
  createCustomTask: (input: CustomTaskInput) => string;
  updateTask: (taskId: string, input: CustomTaskInput) => void;
  publishTasks: (taskIds: string[], studentIds: string[]) => void;
  syncDeviceWork: (taskId: string, studentId: string) => void;
  scoreWork: (workId: string, input: ScoreInput) => void;
  addMessage: (input: MessageInput) => void;
  createOrder: () => void;
};

export type StudentInput = {
  name: string;
  birthday: string;
  city: string;
  school: string;
  grade: string;
  avatar?: string;
};

export type DeviceInput = {
  deviceCode: string;
  mode: 'sale' | 'rental';
};

export type ContactInput = {
  name: string;
  relation: string;
  phone: string;
};

export type QuickTaskInput = {
  studyDate: string;
  destination: string;
  taskTypes: string[];
  capabilityTags: string[];
  templateIds: string[];
};

export type CustomTaskInput = {
  title: string;
  base: string;
  taskType: string;
  studyDate: string;
  points: number;
  description: string;
  capabilityTags: string[];
  requirements: Array<{ type: RequirementType; requirement: string }>;
};

export type ScoreInput = {
  rating: number;
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

const STORE_KEY = 'yanxuebao_parent_h5_state_v4';
const LEGACY_STORE_KEYS = ['yanxuebao_parent_h5_state_v3', 'yanxuebao_parent_h5_state_v2'];
const STORE_VERSION = 4;

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
      account: '支付宝亲子卡 6228',
      balance: 128.5,
      records: [
        { id: 'pay_01', title: '海洋馆纪念章', amount: -18, createdAt: '2026-04-16 15:20' },
        { id: 'pay_02', title: '家长充值', amount: 100, createdAt: '2026-04-15 20:10' },
      ],
    },
    netDisk: { provider: '百度网盘', account: 'yxb-family-demo', status: '已绑定' },
    contacts: [
      { id: 'contact_01', name: '妈妈', relation: '家长', phone: '13800000001', allowed: true },
      { id: 'contact_02', name: '爸爸', relation: '家长', phone: '13800000002', allowed: true },
      { id: 'contact_03', name: '研学导师王老师', relation: '导师', phone: '13900000003', allowed: true },
    ],
    quietTimes: [
      { id: 'quiet_01', label: '上课时间', start: '08:00', end: '12:00', enabled: true },
      { id: 'quiet_02', label: '晚间休息', start: '21:30', end: '07:00', enabled: true },
    ],
    tracks: [
      { id: 'track_01', time: '09:10', address: '深圳海洋馆入口', distanceMeters: 0 },
      { id: 'track_02', time: '10:40', address: '海豚展区', distanceMeters: 160 },
      { id: 'track_03', time: '13:20', address: '科普教室', distanceMeters: 240 },
      { id: 'track_04', time: '16:05', address: '集合广场', distanceMeters: 80 },
    ],
  };
}

function buildDemoStudent(
  input: Omit<ParentStudent, 'age' | 'account' | 'setupState'> & {
    accountActive?: boolean;
    setupState?: ParentStudent['setupState'];
  },
): ParentStudent {
  return {
    ...input,
    age: calcAge(input.birthday),
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
    rating: typeof work.rating === 'number' ? `${work.rating} 星` : undefined,
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
    students: [],
    reports: [],
    portfolioWorks: [],
    portfolioAiRecords: [],
    portfolioGrowthRecords: [],
    portfolioPhotos: [],
    portfolioDeviceDiaries: [],
    messageCenterItems: [buildMessageCenterItemFromMessage(welcomeMessage)],
    diaryItems: [],
    familyTasks: [],
    works: [],
    messages: [welcomeMessage],
    orders: [],
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

  const familyTaskA: FamilyTask = {
    id: 'task_family_01',
    familyTeamId: 'family_parent_demo_20260416',
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
    familyTeamId: 'family_parent_demo_20260417',
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
    aiScore: 17,
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
      photoType: '学员照片',
      sourceLabel: '设备相册同步',
      summary: '设备端上传了 2 张现场观察照片，已关联到海洋动物行为观察任务。',
      attachments: [
        buildAttachment('海豚观察照片', {
          id: 'photo_01_attachment_01',
          capturedAt: '2026-04-16 15:18',
          locationLabel: '深圳海洋馆海豚展区',
        }),
        buildAttachment('海洋馆环境照片', {
          id: 'photo_01_attachment_02',
          capturedAt: '2026-04-16 14:55',
          locationLabel: '深圳海洋馆主展厅',
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
    students: [studentA, studentB],
    reports: [
      {
        id: 'report_01',
        studentId: studentA.id,
        type: 'study_report',
        title: '深圳海洋馆研学报告',
        date: '2026-04-16',
        planeTitle: '综合研学',
        summary: '在观察记录、表达分享和团队协作中表现稳定，问题解决与科技应用能力提升明显。',
        rows: [
          { elementKey: '问题解决', score: 9.1, latestIndex: 8.7, average: 7.9 },
          { elementKey: '科技应用', score: 8.8, latestIndex: 8.3, average: 7.6 },
          { elementKey: '语言沟通', score: 8.4, latestIndex: 7.9, average: 7.3 },
        ],
      },
      {
        id: 'report_02',
        studentId: studentA.id,
        type: 'student_self_test',
        title: '学员能力自测报告',
        date: '2026-04-10',
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
        type: 'work',
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
        id: 'diary_05',
        studentId: studentA.id,
        type: 'growth_value',
        title: '团体研学成长值奖励',
        date: '2026-04-16 18:05',
        source: '成长值',
        summary: '综合评级 A，获得 1000 成长值。',
      },
    ],
    familyTasks: [familyTaskA, familyTaskB],
    works: [workA],
    messages,
    orders: [
      { id: 'order_01', type: '研学宝', title: '研学宝智能硬件优惠订购', amount: 1299, status: '待支付', createdAt: '2026-04-16 20:30' },
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
    students: Array.isArray(state.students)
      ? state.students.map((student) => ({
          ...student,
          capabilities: Array.isArray(student.capabilities)
            ? student.capabilities.map((capability) => normalizeCapability(capability as CapabilityElement & Partial<{ updatedAt: string }>))
            : [],
        }))
      : base.students,
    reports: Array.isArray(state.reports) ? state.reports : base.reports,
    portfolioWorks: Array.isArray(state.portfolioWorks)
      ? state.portfolioWorks
      : Array.isArray(state.works)
        ? state.works.map((work) => buildPortfolioWorkFromTaskWork(work, state.familyTasks?.find((task) => task.id === work.taskId)))
        : base.portfolioWorks,
    portfolioAiRecords: Array.isArray(state.portfolioAiRecords) ? state.portfolioAiRecords : base.portfolioAiRecords,
    portfolioGrowthRecords: Array.isArray(state.portfolioGrowthRecords) ? state.portfolioGrowthRecords : base.portfolioGrowthRecords,
    portfolioPhotos: Array.isArray(state.portfolioPhotos) ? state.portfolioPhotos : base.portfolioPhotos,
    portfolioDeviceDiaries: Array.isArray(state.portfolioDeviceDiaries) ? state.portfolioDeviceDiaries : base.portfolioDeviceDiaries,
    messageCenterItems: Array.isArray(state.messageCenterItems)
      ? state.messageCenterItems
      : Array.isArray(state.messages)
        ? state.messages.map(buildMessageCenterItemFromMessage)
        : base.messageCenterItems,
    diaryItems: Array.isArray(state.diaryItems) ? state.diaryItems : base.diaryItems,
    familyTasks: Array.isArray(state.familyTasks) ? state.familyTasks : base.familyTasks,
    works: Array.isArray(state.works) ? state.works : base.works,
    messages: Array.isArray(state.messages) ? state.messages : base.messages,
    orders: Array.isArray(state.orders) ? state.orders : base.orders,
    scanDevices: Array.isArray(state.scanDevices) && state.scanDevices.length ? state.scanDevices : clone(SCAN_DEVICE_POOL),
  };

  if (nextState.selectedStudentId && !nextState.students.some((student) => student.id === nextState.selectedStudentId)) {
    nextState.selectedStudentId = nextState.students[0]?.id ?? null;
  }

  if (!nextState.selectedStudentId && nextState.students.length) {
    nextState.selectedStudentId = nextState.students[0].id;
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
    work_submitted: '作品提交',
    work_scored: '作品评分',
    ai_qa: 'AI问答',
    ai_creation: 'AI创作',
    photo: '现场照片',
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
    report: '研学报告',
    work: '学习作品',
    ai_qa: 'AI问答',
    ai_creation: 'AI创作',
    growth_value: '成长值',
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
      rating: `${photo.attachments.length} 项素材`,
    }));

  const diaryEntries = state.portfolioDeviceDiaries
    .filter((item) => item.studentId === studentId)
    .map<PortfolioTimelineEntry>((item) => ({
      id: `timeline_diary_${item.id}`,
      studentId,
      entryType: 'device_diary',
      sourceLabel: item.sourceLabel,
      occurredAt: item.createdAt,
      title: item.title,
      summary: item.summary,
      relatedId: item.id,
      relatedKind: 'record',
    }));

  const growthEntries = state.portfolioGrowthRecords
    .filter((record) => record.studentId === studentId)
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

  return [...reportEntries, ...workEntries, ...aiEntries, ...photoEntries, ...diaryEntries, ...growthEntries].sort((left, right) =>
    compareByDateDesc(left.occurredAt, right.occurredAt),
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
  return {
    id: makeId('student'),
    yxbId,
    name: input.name,
    birthday: input.birthday,
    age: calcAge(input.birthday),
    city: input.city,
    school: input.school,
    grade: input.grade,
    avatar: input.avatar || input.name.slice(-2),
    growthValue: 0,
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
      resetDemoData() {
        setState(buildDemoState());
      },
      addStudent(input) {
        const nextStudent = createStudent(state.students, input);
        setState((current) =>
          refreshRelationLabel({
            ...current,
            selectedStudentId: nextStudent.id,
            students: [...current.students, nextStudent],
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
            })),
          ),
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
      savePaymentCard(studentId, account) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            return {
              ...student,
              device: {
                ...device,
                paymentCard: {
                  account,
                  balance: device.paymentCard?.balance ?? 0,
                  records: device.paymentCard?.records ?? [],
                },
              },
            };
          }),
        );
      },
      saveNetDisk(studentId, account) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? buildDevice('YXB-DEV-NEW');
            return {
              ...student,
              device: {
                ...device,
                netDisk: { provider: '百度网盘', account, status: '已绑定' },
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
                contacts: [...device.contacts, { id: makeId('contact'), ...input, allowed: true }],
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
                  item.id === quietTimeId ? { ...item, enabled: !item.enabled } : item,
                ),
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
          return {
            ...nextState,
            reports: [report, ...nextState.reports],
            portfolioGrowthRecords: [capabilityUpdateRecord, ...nextState.portfolioGrowthRecords],
            diaryItems: [diaryItem, ...nextState.diaryItems],
          };
        });
      },
      createTasksFromTemplates(input) {
        const templates = TASK_LIBRARY.filter((template) => input.templateIds.includes(template.id));
        const taskIds = templates.map(() => makeId('task'));
        setState((current) => {
          const tasks = templates.map((template, index): FamilyTask => ({
            id: taskIds[index],
            familyTeamId: familyTeamId(current.selectedStudentId, input.studyDate),
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
          return { ...current, familyTasks: [...tasks, ...current.familyTasks] };
        });
        return taskIds;
      },
      createCustomTask(input) {
        const taskId = makeId('task');
        setState((current) => {
          const task: FamilyTask = {
            id: taskId,
            familyTeamId: familyTeamId(current.selectedStudentId, input.studyDate),
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
          return { ...current, familyTasks: [task, ...current.familyTasks] };
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
            aiScore: Math.min(task.points, Math.max(8, Math.round(task.points * 0.82))),
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
          const growthDelta = Math.round((input.score / Math.max(task.points, 1)) * 100);
          const scoreRecordedAt = nowText();
          const scoredWork: TaskWork = {
            ...work,
            status: 'scored',
            parentScore: input.score,
            rating: input.rating,
            comment: input.comment,
          };
          const nextState = withStudent(current, work.studentId, (student) => {
            const nextCapabilities = student.capabilities.map((capability) => {
              if (!task.capabilityTags.includes(capability.elementKey)) {
                return capability;
              }
              return normalizeCapability({
                ...capability,
                score: round1(capability.score * 0.82 + (input.score / Math.max(task.points, 1)) * 10 * 0.18),
                source: 'family_task' as const,
                recordedAt: nowIso(),
              });
            });
            return {
              ...student,
              growthValue: student.growthValue + growthDelta,
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
            summary: `家长评分 ${input.score}/${task.points}，获得 ${growthDelta} 成长值。${input.comment}`,
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
            value: round1((input.score / Math.max(task.points, 1)) * 10),
            delta: round1((input.score / Math.max(task.points, 1)) * 2),
            occurredAt: scoreRecordedAt,
            summary: `作品评分已同步到 ${task.capabilityTags.join('、')} 等相关能力元素。`,
            displaySource: '能力更新',
            relatedId: workId,
          };
          return {
            ...nextState,
            familyTasks: nextState.familyTasks.map((item) => (item.id === task.id ? { ...item, status: 'scored' } : item)),
            works: nextState.works.map((item) => (item.id === workId ? scoredWork : item)),
            portfolioWorks: nextState.portfolioWorks.map((item) => (item.id === workId ? scoredPortfolioWork : item)),
            portfolioGrowthRecords: [capabilityUpdateRecord, growthValueRecord, ...nextState.portfolioGrowthRecords],
            diaryItems: [
              {
                id: makeId('diary'),
                studentId: work.studentId,
                type: 'growth_value',
                title: `${task.title}评分完成`,
                date: scoreRecordedAt,
                source: '家庭研学评分',
                summary: `家长评分 ${input.score}/${task.points}，获得 ${growthDelta} 成长值。${input.comment}`,
                rating: `${input.rating} 星`,
                relatedId: workId,
              },
              ...nextState.diaryItems.map((item) =>
                item.relatedId === workId ? { ...item, rating: `${input.rating} 星`, summary: input.comment || item.summary } : item,
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
      createOrder() {
        setState((current) => ({
          ...current,
          orders: [
            {
              id: makeId('order'),
              type: '研学宝',
              title: '研学宝智能硬件优惠订购',
              amount: 1299,
              status: '待支付',
              createdAt: nowText(),
            },
            ...current.orders,
          ],
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
