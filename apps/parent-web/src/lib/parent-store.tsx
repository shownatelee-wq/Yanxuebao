'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CapabilityPlaneKey = 'self' | 'learning' | 'future' | 'social';
export type GrowthDiaryType = 'report' | 'work' | 'ai_qa' | 'ai_creation' | 'growth_value' | 'assessment';
export type FamilyTaskStatus = 'draft' | 'published' | 'submitted' | 'scored';
export type RequirementType = 'text' | 'choice' | 'judge' | 'image';
export type MessageType = 'system' | 'team_broadcast' | 'group_broadcast' | 'direct' | 'sos';

export type CapabilityElement = {
  id: string;
  elementKey: string;
  planeKey: CapabilityPlaneKey;
  planeTitle: string;
  score: number;
  averageScore: number;
  source: 'self_test' | 'parent_review' | 'team_task' | 'family_task' | 'teacher_review';
  updatedAt: string;
};

export type ParentDevice = {
  id: string;
  name: string;
  deviceCode: string;
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
  selectedStudentId: string;
  students: ParentStudent[];
  reports: CapabilityReport[];
  diaryItems: GrowthDiaryItem[];
  familyTasks: FamilyTask[];
  works: TaskWork[];
  messages: ParentMessage[];
  orders: ParentOrder[];
};

type ParentContextValue = {
  hydrated: boolean;
  state: ParentState;
  selectedStudent: ParentStudent;
  capabilityAverage: number;
  selectStudent: (studentId: string) => void;
  resetDemoData: () => void;
  addStudent: (input: StudentInput) => void;
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

const STORE_KEY = 'yanxuebao_parent_h5_state_v1';
const STORE_VERSION = 1;

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

const ParentContext = createContext<ParentContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
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

function levelText(score: number) {
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

export function getCapabilityLevel(score: number) {
  return levelText(score);
}

export function getAssessmentQuestions() {
  return ASSESSMENT_QUESTIONS;
}

function capabilitySeed(index: number, offset: number) {
  const values = [8.4, 8.1, 8.7, 7.6, 8.2, 7.9, 8.3, 8, 8.9, 8.5, 7.8, 8.2, 9.1, 7.8, 8.4, 7.6];
  return round1(Math.max(5.4, Math.min(9.5, values[index] + offset)));
}

function buildCapabilities(offset = 0): CapabilityElement[] {
  let index = 0;
  return CAPABILITY_PLANES.flatMap((plane) =>
    plane.elements.map((element) => {
      const score = capabilitySeed(index, offset);
      const item: CapabilityElement = {
        id: `cap_${plane.key}_${index + 1}`,
        elementKey: element,
        planeKey: plane.key,
        planeTitle: plane.title,
        score,
        averageScore: round1(7.2 + (index % 4) * 0.18),
        source: index % 3 === 0 ? 'teacher_review' : index % 3 === 1 ? 'team_task' : 'parent_review',
        updatedAt: '2026-04-16',
      };
      index += 1;
      return item;
    }),
  );
}

function makeDevice(deviceCode: string): ParentDevice {
  return {
    id: makeId('device'),
    name: '研学宝智能硬件',
    deviceCode,
    mode: 'sale',
    boundAt: '2026-04-16 09:30',
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

function buildInitialState(): ParentState {
  const studentA: ParentStudent = {
    id: 'student_01',
    yxbId: '80001',
    name: '林一诺',
    birthday: '2015-09-18',
    age: calcAge('2015-09-18'),
    city: '深圳',
    school: '南山实验学校',
    grade: '五年级',
    avatar: '一诺',
    growthValue: 2860,
    device: makeDevice('YXB-DEV-0001'),
    capabilities: buildCapabilities(0),
  };
  const studentB: ParentStudent = {
    id: 'student_02',
    yxbId: '80002',
    name: '陈沐阳',
    birthday: '2018-05-06',
    age: calcAge('2018-05-06'),
    city: '深圳',
    school: '前海小学',
    grade: '二年级',
    avatar: '沐阳',
    growthValue: 1320,
    capabilities: buildCapabilities(-0.4),
  };

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
    requirements: TASK_LIBRARY[0].requirements,
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
    requirements: TASK_LIBRARY[3].requirements,
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

  return {
    version: STORE_VERSION,
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
        title: '海洋动物行为观察作品',
        date: '2026-04-16 15:35',
        source: '家庭研学',
        summary: workA.content,
        rating: '待评分',
        relatedId: workA.id,
        media: ['海豚观察照片'],
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
      },
      {
        id: 'diary_04',
        studentId: studentA.id,
        type: 'ai_creation',
        title: '海洋保护主题海报',
        date: '2026-04-15 19:40',
        source: 'AI 创作',
        summary: '生成了一张“保护海洋朋友”的宣传海报。',
        media: ['AI 海报作品'],
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
    messages: [
      { id: 'msg_01', type: 'team_broadcast', scope: 'team', studentId: studentA.id, title: '集合提醒', content: '16:30 在海洋馆出口集合，请注意设备电量。', createdAt: '2026-04-16 16:05', read: false },
      { id: 'msg_02', type: 'sos', scope: 'student', studentId: studentA.id, title: 'SoS 演示记录', content: '设备端发出 SoS，定位在海洋馆科普教室附近，已解除。', createdAt: '2026-04-16 13:10', read: true },
      { id: 'msg_03', type: 'system', scope: 'system', title: '研学宝绑定成功', content: '设备 YXB-DEV-0001 已绑定到林一诺。', createdAt: '2026-04-16 09:30', read: true },
    ],
    orders: [
      { id: 'order_01', type: '研学宝', title: '研学宝智能硬件优惠订购', amount: 1299, status: '待支付', createdAt: '2026-04-16 20:30' },
    ],
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeState(state: ParentState): ParentState {
  if (state.version !== STORE_VERSION || !state.students?.length) {
    return buildInitialState();
  }
  return state;
}

function readStoredState() {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }
  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    return buildInitialState();
  }
  try {
    return normalizeState(JSON.parse(raw) as ParentState);
  } catch {
    return buildInitialState();
  }
}

function averageCapability(student: ParentStudent) {
  return round1(student.capabilities.reduce((sum, item) => sum + item.score, 0) / Math.max(student.capabilities.length, 1));
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

function nextYxbId(students: ParentStudent[]) {
  const maxId = students.reduce((max, student) => Math.max(max, Number(student.yxbId) || 80000), 80000);
  return String(maxId + 1);
}

function withStudent(state: ParentState, studentId: string, updater: (student: ParentStudent) => ParentStudent) {
  return {
    ...state,
    students: state.students.map((student) => (student.id === studentId ? updater(student) : student)),
  };
}

function familyTeamId(studentId: string, studyDate: string) {
  return `family_${studentId}_${studyDate.replaceAll('-', '')}`;
}

export function ParentStoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<ParentState>(() => buildInitialState());

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
    const selectedStudent = state.students.find((student) => student.id === state.selectedStudentId) ?? state.students[0];

    return {
      hydrated,
      state,
      selectedStudent,
      capabilityAverage: averageCapability(selectedStudent),
      selectStudent(studentId) {
        setState((current) => ({ ...current, selectedStudentId: studentId }));
      },
      resetDemoData() {
        setState(buildInitialState());
      },
      addStudent(input) {
        setState((current) => {
          const id = makeId('student');
          const nextStudent: ParentStudent = {
            id,
            yxbId: nextYxbId(current.students),
            name: input.name,
            birthday: input.birthday,
            age: calcAge(input.birthday),
            city: input.city,
            school: input.school,
            grade: input.grade,
            avatar: input.avatar || input.name.slice(-2),
            growthValue: 0,
            capabilities: buildCapabilities(-0.2),
          };
          return { ...current, selectedStudentId: id, students: [...current.students, nextStudent] };
        });
      },
      updateStudent(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => ({
            ...student,
            ...input,
            age: calcAge(input.birthday),
            avatar: input.avatar || input.name.slice(-2),
          })),
        );
      },
      bindDevice(studentId, input) {
        setState((current) =>
          withStudent(current, studentId, (student) => ({
            ...student,
            device: {
              ...(student.device ?? makeDevice(input.deviceCode)),
              id: student.device?.id ?? makeId('device'),
              name: '研学宝智能硬件',
              deviceCode: input.deviceCode,
              mode: input.mode,
              boundAt: nowText(),
            },
          })),
        );
      },
      savePaymentCard(studentId, account) {
        setState((current) =>
          withStudent(current, studentId, (student) => {
            const device = student.device ?? makeDevice('YXB-DEV-NEW');
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
            const device = student.device ?? makeDevice('YXB-DEV-NEW');
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
            const device = student.device ?? makeDevice('YXB-DEV-NEW');
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
              return {
                ...capability,
                score: latestIndex,
                source: 'parent_review' as const,
                updatedAt: today(),
              };
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
        setState((current) => ({
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
          messages: [
            ...taskIds.map((taskId): ParentMessage => {
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
            }),
            ...current.messages,
          ],
        }));
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
          return {
            ...current,
            familyTasks: current.familyTasks.map((item) => (item.id === taskId ? { ...item, status: 'submitted' } : item)),
            works: [work, ...current.works],
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
              return {
                ...capability,
                score: round1(capability.score * 0.82 + (input.score / Math.max(task.points, 1)) * 10 * 0.18),
                source: 'family_task' as const,
                updatedAt: today(),
              };
            });
            return {
              ...student,
              growthValue: student.growthValue + growthDelta,
              capabilities: nextCapabilities,
            };
          });
          return {
            ...nextState,
            familyTasks: nextState.familyTasks.map((item) => (item.id === task.id ? { ...item, status: 'scored' } : item)),
            works: nextState.works.map((item) => (item.id === workId ? scoredWork : item)),
            diaryItems: [
              {
                id: makeId('diary'),
                studentId: work.studentId,
                type: 'growth_value',
                title: `${task.title}评分完成`,
                date: nowText(),
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
        setState((current) => ({
          ...current,
          messages: [
            {
              id: makeId('msg'),
              ...input,
              createdAt: nowText(),
              read: false,
            },
            ...current.messages,
          ],
        }));
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
