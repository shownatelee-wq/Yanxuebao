'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type TeamStatus = 'upcoming' | 'active' | 'ended';
export type TeamSource = 'system' | 'self-built';
export type TaskScope = 'student' | 'group';
export type TaskStatus = 'draft' | 'published' | 'ended';
export type WorkStatus = 'draft' | 'submitted' | 'ai_scored' | 'confirmed';
export type GroupRole =
  | 'leader'
  | 'vice_leader'
  | 'recorder'
  | 'researcher'
  | 'operator'
  | 'safety'
  | 'reporter'
  | 'photographer';
export type ScoreKind = 'reward' | 'penalty';
export type BroadcastScope = 'team' | 'group' | 'student';
export type BroadcastContentType = 'text' | 'voice' | 'image';
export type SosStatus = 'new' | 'tracking' | 'resolved';

export type AssistantTeacher = {
  id: string;
  name: string;
  phone: string;
};

export type TeamMaterial = {
  id: string;
  name: string;
  description: string;
  url: string;
};

export type Team = {
  id: string;
  name: string;
  organizationName: string;
  source: TeamSource;
  status: TeamStatus;
  startDate: string;
  days: number;
  destination: string;
  bases: string[];
  studentSource: string;
  joinCode: string;
  assistants: AssistantTeacher[];
  materials: TeamMaterial[];
  growthBaseValue: number;
};

export type ParentContact = {
  name: string;
  phone: string;
};

export type Student = {
  id: string;
  teamId: string;
  name: string;
  age: number;
  joined: boolean;
  online: boolean;
  joinedOrder: number;
  deviceId: string;
  parent: ParentContact;
  groupId?: string;
};

export type GroupMember = {
  studentId: string;
  role: GroupRole;
};

export type Group = {
  id: string;
  teamId: string;
  index: number;
  name: string;
  emblem: string;
  members: GroupMember[];
};

export type TaskAttachment = {
  id: string;
  name: string;
  kind: 'image' | 'pdf';
  url: string;
};

export type WorkRequirement = {
  id: string;
  type: 'text' | 'choice' | 'judge' | 'image';
  requirement: string;
};

export type TutorTask = {
  id: string;
  teamId: string;
  scope: TaskScope;
  source: 'manual' | 'history' | 'library';
  base: string;
  taskType: string;
  title: string;
  points: number;
  description: string;
  attachments: TaskAttachment[];
  requirements: WorkRequirement[];
  status: TaskStatus;
  order: number;
  createdAt: string;
};

export type TaskTemplate = {
  id: string;
  scope: TaskScope;
  base: string;
  taskType: string;
  title: string;
  points: number;
  description: string;
  attachments: TaskAttachment[];
  requirements: WorkRequirement[];
};

export type WorkItem = {
  id: string;
  taskId: string;
  teamId: string;
  ownerType: TaskScope;
  ownerId: string;
  submittedAt?: string;
  status: WorkStatus;
  aiScore?: number;
  tutorScore?: number;
  finalScore?: number;
  rating?: number;
  comment?: string;
  preview: string;
};

export type ScoreRecord = {
  id: string;
  workItemId: string;
  score: number;
  rating: number;
  comment?: string;
  source: 'ai' | 'tutor' | 'batch_ai_confirm' | 'batch_tutor';
  createdAt: string;
};

export type RewardPenaltyRecord = {
  id: string;
  teamId: string;
  targetType: TaskScope;
  targetId: string;
  kind: ScoreKind;
  points: number;
  reason: string;
  createdAt: string;
};

export type EvaluationItem = {
  id: string;
  dimension: '过程性评价' | '成果性评价' | '能力性评价' | '综合性评价';
  indicator: string;
  description: string;
  abilityElements: string[];
  allowSelf: boolean;
  allowGroup: boolean;
  allowTutor: boolean;
};

export type EvaluationEntry = {
  itemId: string;
  selfRating: number;
  groupRating: number;
  tutorRating: number;
};

export type EvaluationResult = {
  id: string;
  teamId: string;
  studentId: string;
  items: EvaluationEntry[];
  comment: string;
};

export type StudyReport = {
  id: string;
  teamId: string;
  studentId: string;
  title: string;
  status: 'draft' | 'ready' | 'pushed';
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  growthValue: number;
  summary: string;
  generatedAt: string;
  pushedAt?: string;
};

export type BroadcastMessage = {
  id: string;
  teamId: string;
  scope: BroadcastScope;
  targetId?: string;
  contentType: BroadcastContentType;
  content: string;
  createdAt: string;
};

export type PhotoAsset = {
  id: string;
  teamId: string;
  scope: 'team' | 'group' | 'student';
  targetId?: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
};

export type LocationSnapshot = {
  id: string;
  teamId: string;
  studentId: string;
  address: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  updatedAt: string;
};

export type SosAlert = {
  id: string;
  teamId: string;
  studentId: string;
  text: string;
  voiceNote: string;
  address: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  status: SosStatus;
  createdAt: string;
};

export type TutorMockState = {
  version: number;
  currentTeamId: string | null;
  teams: Team[];
  students: Student[];
  groups: Group[];
  tasks: TutorTask[];
  taskTemplates: TaskTemplate[];
  workItems: WorkItem[];
  scoreRecords: ScoreRecord[];
  rewardPenaltyRecords: RewardPenaltyRecord[];
  evaluationItems: EvaluationItem[];
  evaluationResults: EvaluationResult[];
  reports: StudyReport[];
  broadcasts: BroadcastMessage[];
  photos: PhotoAsset[];
  locations: LocationSnapshot[];
  sosAlerts: SosAlert[];
};

type TeamDraft = {
  name: string;
  source: TeamSource;
  status: TeamStatus;
  startDate: string;
  days: number;
  destination: string;
  bases: string[];
  studentSource: string;
};

type TaskDraft = {
  id?: string;
  scope: TaskScope;
  source: 'manual' | 'history' | 'library';
  base: string;
  taskType: string;
  title: string;
  points: number;
  description: string;
  attachments: TaskAttachment[];
  requirements: WorkRequirement[];
  status: TaskStatus;
};

type TutorStoreValue = {
  state: TutorMockState;
  hydrated: boolean;
  actions: {
    resetSeed: () => void;
    setCurrentTeam: (teamId: string) => void;
    saveTeam: (draft: TeamDraft, teamId?: string) => void;
    addStudent: (payload: {
      teamId: string;
      name: string;
      age: number;
      parentName: string;
      parentPhone: string;
      joined: boolean;
    }) => void;
    importStudents: (payload: { teamId: string; rawText: string }) => { added: number };
    addAssistant: (teamId: string, payload: { name: string; phone: string }) => void;
    removeAssistant: (teamId: string, assistantId: string) => void;
    addMaterial: (teamId: string, payload: { name: string; description: string; url: string }) => void;
    removeMaterial: (teamId: string, materialId: string) => void;
    createGroups: (teamId: string, count: number) => void;
    updateGroup: (groupId: string, payload: { name: string; emblem: string }) => void;
    assignStudentToGroup: (teamId: string, studentId: string, groupId: string, role: GroupRole) => void;
    saveTask: (teamId: string, draft: TaskDraft) => void;
    reorderTask: (taskId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
    copyTasksFromHistory: (teamId: string, sourceTeamId: string, taskIds: string[]) => void;
    copyTasksFromLibrary: (teamId: string, templateIds: string[]) => void;
    scoreWork: (workItemId: string, payload: { rating: number; comment?: string }) => void;
    confirmAiScores: (workItemIds: string[]) => void;
    addRewardPenalty: (payload: {
      teamId: string;
      targetType: TaskScope;
      targetId: string;
      kind: ScoreKind;
      points: number;
      reason: string;
    }) => void;
    updateEvaluation: (studentId: string, items: EvaluationEntry[], comment: string) => void;
    generateReports: (teamId: string, studentIds: string[]) => void;
    pushReport: (reportId: string) => void;
    sendBroadcast: (payload: {
      teamId: string;
      scope: BroadcastScope;
      targetId?: string;
      contentType: BroadcastContentType;
      content: string;
    }) => void;
    addPhoto: (payload: {
      teamId: string;
      scope: 'team' | 'group' | 'student';
      targetId?: string;
      title: string;
      description: string;
      imageUrl?: string;
    }) => void;
    updateSosStatus: (alertId: string, status: SosStatus) => void;
  };
};

const STORE_KEY = 'yanxuebao_tutor_mock_v1';
const TutorStoreContext = createContext<TutorStoreValue | null>(null);

const PHOTO_POOL = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80',
];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function cloneState<T>(value: T) {
  return structuredClone(value);
}

function nowPlus(hours = 0) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function scoreFromRating(points: number, rating: number) {
  return Number(((points * rating) / 5).toFixed(1));
}

function gradeFromScore(score: number): StudyReport['grade'] {
  if (score >= 95) return 'A';
  if (score >= 85) return 'B';
  if (score >= 70) return 'C';
  if (score >= 50) return 'D';
  return 'E';
}

function growthMultiplier(grade: StudyReport['grade']) {
  if (grade === 'A') return 1;
  if (grade === 'B') return 0.9;
  if (grade === 'C') return 0.8;
  if (grade === 'D') return 0.6;
  return 0;
}

function buildEvaluationItems(): EvaluationItem[] {
  return [
    {
      id: 'eval_process',
      dimension: '过程性评价',
      indicator: '任务参与度',
      description: '过程参与积极，能持续完成导师分配任务',
      abilityElements: ['执行力', '责任感'],
      allowSelf: false,
      allowGroup: true,
      allowTutor: true,
    },
    {
      id: 'eval_outcome',
      dimension: '成果性评价',
      indicator: '作品完成质量',
      description: '作品内容完整，有事实记录与明确表达',
      abilityElements: ['表达力', '观察力'],
      allowSelf: false,
      allowGroup: true,
      allowTutor: true,
    },
    {
      id: 'eval_ability',
      dimension: '能力性评价',
      indicator: '合作与沟通',
      description: '在小组中承担角色并完成沟通协作',
      abilityElements: ['协作力', '沟通力'],
      allowSelf: false,
      allowGroup: true,
      allowTutor: true,
    },
    {
      id: 'eval_summary',
      dimension: '综合性评价',
      indicator: '研学综合表现',
      description: '结合过程、成果与现场表现进行综合判断',
      abilityElements: ['领导力', '创造力'],
      allowSelf: false,
      allowGroup: false,
      allowTutor: true,
    },
  ];
}

function buildSeedState(): TutorMockState {
  const teams: Team[] = [
    {
      id: 'team_active',
      name: '南山海洋探索研学营',
      organizationName: '南山实验学校研学中心',
      source: 'system',
      status: 'active',
      startDate: '2026-04-15',
      days: 2,
      destination: '深圳海洋馆 + 大鹏地质公园',
      bases: ['深圳海洋馆', '大鹏地质公园'],
      studentSource: '学校五年级 5 班',
      joinCode: 'YXB-TUTOR-0415',
      assistants: [
        { id: 'assistant_1', name: '周助教', phone: '13800000021' },
        { id: 'assistant_2', name: '黄助教', phone: '13800000022' },
      ],
      materials: [
        {
          id: 'material_1',
          name: '海洋馆观察任务说明',
          description: '活动前发给家长和学员的任务须知',
          url: 'https://example.com/ocean.pdf',
        },
      ],
      growthBaseValue: 1000,
    },
    {
      id: 'team_self',
      name: '红树林生态自建团',
      organizationName: '南山实验学校研学中心',
      source: 'self-built',
      status: 'upcoming',
      startDate: '2026-04-21',
      days: 1,
      destination: '福田红树林',
      bases: ['红树林自然保护区'],
      studentSource: '家校联合招募',
      joinCode: 'YXB-SELF-0421',
      assistants: [{ id: 'assistant_3', name: '陆助教', phone: '13800000023' }],
      materials: [],
      growthBaseValue: 800,
    },
    {
      id: 'team_history',
      name: '地质探秘历史团队',
      organizationName: '南山实验学校研学中心',
      source: 'system',
      status: 'ended',
      startDate: '2026-03-20',
      days: 2,
      destination: '大鹏古火山遗址',
      bases: ['大鹏古火山遗址'],
      studentSource: '学校四年级 2 班',
      joinCode: 'YXB-HIS-0320',
      assistants: [],
      materials: [],
      growthBaseValue: 900,
    },
  ];

  const students: Student[] = [
    {
      id: 'student_1',
      teamId: 'team_active',
      name: '陈一诺',
      age: 11,
      joined: true,
      online: true,
      joinedOrder: 1,
      deviceId: 'YXB-DEV-0101',
      parent: { name: '陈妈妈', phone: '13910000001' },
      groupId: 'group_1',
    },
    {
      id: 'student_2',
      teamId: 'team_active',
      name: '林子安',
      age: 11,
      joined: true,
      online: true,
      joinedOrder: 2,
      deviceId: 'YXB-DEV-0102',
      parent: { name: '林爸爸', phone: '13910000002' },
      groupId: 'group_1',
    },
    {
      id: 'student_3',
      teamId: 'team_active',
      name: '赵知夏',
      age: 10,
      joined: true,
      online: false,
      joinedOrder: 3,
      deviceId: 'YXB-DEV-0103',
      parent: { name: '赵妈妈', phone: '13910000003' },
      groupId: 'group_2',
    },
    {
      id: 'student_4',
      teamId: 'team_active',
      name: '韩嘉树',
      age: 10,
      joined: true,
      online: true,
      joinedOrder: 4,
      deviceId: 'YXB-DEV-0104',
      parent: { name: '韩爸爸', phone: '13910000004' },
      groupId: 'group_2',
    },
    {
      id: 'student_5',
      teamId: 'team_active',
      name: '苏听澜',
      age: 11,
      joined: false,
      online: false,
      joinedOrder: 5,
      deviceId: 'YXB-DEV-0105',
      parent: { name: '苏妈妈', phone: '13910000005' },
    },
    {
      id: 'student_6',
      teamId: 'team_active',
      name: '顾星河',
      age: 10,
      joined: true,
      online: false,
      joinedOrder: 6,
      deviceId: 'YXB-DEV-0106',
      parent: { name: '顾妈妈', phone: '13910000006' },
      groupId: 'group_2',
    },
    {
      id: 'student_7',
      teamId: 'team_history',
      name: '徐之遥',
      age: 10,
      joined: true,
      online: false,
      joinedOrder: 1,
      deviceId: 'YXB-DEV-0201',
      parent: { name: '徐爸爸', phone: '13910000011' },
    },
    {
      id: 'student_8',
      teamId: 'team_history',
      name: '许沐言',
      age: 10,
      joined: true,
      online: false,
      joinedOrder: 2,
      deviceId: 'YXB-DEV-0202',
      parent: { name: '许妈妈', phone: '13910000012' },
    },
  ];

  const groups: Group[] = [
    {
      id: 'group_1',
      teamId: 'team_active',
      index: 1,
      name: '鲸跃先锋队',
      emblem: '鲸',
      members: [
        { studentId: 'student_1', role: 'leader' },
        { studentId: 'student_2', role: 'photographer' },
      ],
    },
    {
      id: 'group_2',
      teamId: 'team_active',
      index: 2,
      name: '深蓝观察组',
      emblem: '浪',
      members: [
        { studentId: 'student_3', role: 'researcher' },
        { studentId: 'student_4', role: 'vice_leader' },
        { studentId: 'student_6', role: 'reporter' },
      ],
    },
  ];

  const tasks: TutorTask[] = [
    {
      id: 'task_s1',
      teamId: 'team_active',
      scope: 'student',
      source: 'manual',
      base: '深圳海洋馆',
      taskType: '观察记录',
      title: '海洋生物观察卡',
      points: 20,
      description: '观察两种海洋生物的特征并完成记录。',
      attachments: [],
      requirements: [
        { id: 'req_1', type: 'text', requirement: '完成 100 字观察记录' },
        { id: 'req_2', type: 'image', requirement: '上传 1 张拍摄图片' },
      ],
      status: 'published',
      order: 1,
      createdAt: nowPlus(-18),
    },
    {
      id: 'task_s2',
      teamId: 'team_active',
      scope: 'student',
      source: 'library',
      base: '深圳海洋馆',
      taskType: '问答任务',
      title: '海洋馆十问',
      points: 15,
      description: '根据讲解完成海洋馆十问答题。',
      attachments: [],
      requirements: [{ id: 'req_3', type: 'choice', requirement: '完成 10 道选择题' }],
      status: 'published',
      order: 2,
      createdAt: nowPlus(-17),
    },
    {
      id: 'task_s3',
      teamId: 'team_active',
      scope: 'student',
      source: 'manual',
      base: '大鹏地质公园',
      taskType: '反思任务',
      title: '今日研学反思',
      points: 15,
      description: '记录今天最有收获的一件事。',
      attachments: [],
      requirements: [{ id: 'req_4', type: 'text', requirement: '完成 150 字反思' }],
      status: 'draft',
      order: 3,
      createdAt: nowPlus(-8),
    },
    {
      id: 'task_g1',
      teamId: 'team_active',
      scope: 'group',
      source: 'history',
      base: '深圳海洋馆',
      taskType: '创作任务',
      title: '海洋馆路线海报',
      points: 25,
      description: '小组整理参观路线并完成一张路线海报。',
      attachments: [],
      requirements: [
        { id: 'req_5', type: 'image', requirement: '上传 1 张海报' },
        { id: 'req_6', type: 'text', requirement: '附 80 字说明' },
      ],
      status: 'published',
      order: 1,
      createdAt: nowPlus(-16),
    },
    {
      id: 'task_g2',
      teamId: 'team_active',
      scope: 'group',
      source: 'manual',
      base: '大鹏地质公园',
      taskType: '研究任务',
      title: '火山岩样本汇报',
      points: 30,
      description: '小组汇总火山岩样本观察结论。',
      attachments: [],
      requirements: [{ id: 'req_7', type: 'image', requirement: '上传 3 张样本图与 1 段总结' }],
      status: 'published',
      order: 2,
      createdAt: nowPlus(-6),
    },
    {
      id: 'task_h1',
      teamId: 'team_history',
      scope: 'student',
      source: 'manual',
      base: '大鹏古火山遗址',
      taskType: '观察记录',
      title: '岩石纹理采样',
      points: 20,
      description: '记录岩石纹理并写出判断依据。',
      attachments: [],
      requirements: [{ id: 'req_h1', type: 'text', requirement: '图文结合完成采样记录' }],
      status: 'ended',
      order: 1,
      createdAt: nowPlus(-300),
    },
    {
      id: 'task_h2',
      teamId: 'team_history',
      scope: 'group',
      source: 'manual',
      base: '大鹏古火山遗址',
      taskType: '展示任务',
      title: '地质结构展示板',
      points: 25,
      description: '完成地质结构展示板并汇报。',
      attachments: [],
      requirements: [{ id: 'req_h2', type: 'image', requirement: '上传 1 张展示板照片' }],
      status: 'ended',
      order: 2,
      createdAt: nowPlus(-299),
    },
  ];

  const taskTemplates: TaskTemplate[] = [
    {
      id: 'tpl_1',
      scope: 'student',
      base: '深圳海洋馆',
      taskType: '观察记录',
      title: '海洋动物特征卡',
      points: 20,
      description: '观察 2 种海洋动物并记录外观、习性。',
      attachments: [],
      requirements: [
        { id: 'tpl_req_1', type: 'text', requirement: '完成一段观察文字' },
        { id: 'tpl_req_2', type: 'image', requirement: '上传 1 张现场图片' },
      ],
    },
    {
      id: 'tpl_2',
      scope: 'student',
      base: '福田红树林',
      taskType: '问答任务',
      title: '红树林生态问答',
      points: 15,
      description: '完成红树林生态知识问答。',
      attachments: [],
      requirements: [{ id: 'tpl_req_3', type: 'choice', requirement: '完成 8 道选择题' }],
    },
    {
      id: 'tpl_3',
      scope: 'group',
      base: '深圳海洋馆',
      taskType: '创作任务',
      title: '深海主题海报',
      points: 25,
      description: '小组完成深海主题海报并说明创意。',
      attachments: [],
      requirements: [{ id: 'tpl_req_4', type: 'image', requirement: '上传 1 张海报与 1 段说明' }],
    },
    {
      id: 'tpl_4',
      scope: 'group',
      base: '大鹏地质公园',
      taskType: '研究任务',
      title: '地质观察结论板',
      points: 30,
      description: '小组梳理地质观察结论并汇报。',
      attachments: [],
      requirements: [{ id: 'tpl_req_5', type: 'text', requirement: '输出 3 条结论与 1 张示意图' }],
    },
  ];

  const workItems: WorkItem[] = [
    {
      id: 'work_1',
      taskId: 'task_s1',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_1',
      submittedAt: nowPlus(-14),
      status: 'confirmed',
      aiScore: 16,
      tutorScore: 18,
      finalScore: 18,
      rating: 4.5,
      comment: '观察细致，记录完整。',
      preview: '海豚呼吸孔与鳍部动作记录完成较好。',
    },
    {
      id: 'work_2',
      taskId: 'task_s1',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_2',
      submittedAt: nowPlus(-12),
      status: 'ai_scored',
      aiScore: 15,
      finalScore: 15,
      preview: '已上传海豹与海龟观察图片。',
    },
    {
      id: 'work_3',
      taskId: 'task_s1',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_3',
      submittedAt: nowPlus(-12),
      status: 'submitted',
      preview: '待导师评分的观察卡。',
    },
    {
      id: 'work_4',
      taskId: 'task_s1',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_4',
      status: 'draft',
      preview: '尚未提交。',
    },
    {
      id: 'work_5',
      taskId: 'task_s1',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_5',
      status: 'draft',
      preview: '尚未加入设备端。',
    },
    {
      id: 'work_6',
      taskId: 'task_s1',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_6',
      submittedAt: nowPlus(-9),
      status: 'confirmed',
      aiScore: 14,
      tutorScore: 16,
      finalScore: 16,
      rating: 4,
      comment: '事实准确，但表达可更完整。',
      preview: '完成海狮观察卡。',
    },
    {
      id: 'work_7',
      taskId: 'task_s2',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_1',
      submittedAt: nowPlus(-10),
      status: 'confirmed',
      aiScore: 12,
      tutorScore: 13,
      finalScore: 13,
      rating: 4.5,
      preview: '答题正确率较高。',
    },
    {
      id: 'work_8',
      taskId: 'task_s2',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_2',
      submittedAt: nowPlus(-10),
      status: 'confirmed',
      aiScore: 14,
      tutorScore: 14,
      finalScore: 14,
      rating: 5,
      preview: '十问全部完成。',
    },
    {
      id: 'work_9',
      taskId: 'task_s2',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_3',
      submittedAt: nowPlus(-8),
      status: 'ai_scored',
      aiScore: 11,
      finalScore: 11,
      preview: 'AI 已完成初评分。',
    },
    {
      id: 'work_10',
      taskId: 'task_s2',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_4',
      status: 'draft',
      preview: '尚未提交。',
    },
    {
      id: 'work_11',
      taskId: 'task_s2',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_5',
      status: 'draft',
      preview: '尚未提交。',
    },
    {
      id: 'work_12',
      taskId: 'task_s2',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_6',
      submittedAt: nowPlus(-7),
      status: 'submitted',
      preview: '答题已提交，待评分。',
    },
    {
      id: 'work_13',
      taskId: 'task_s3',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_1',
      status: 'draft',
      preview: '待任务发布后开始提交。',
    },
    {
      id: 'work_14',
      taskId: 'task_s3',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_2',
      status: 'draft',
      preview: '待任务发布后开始提交。',
    },
    {
      id: 'work_15',
      taskId: 'task_s3',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_3',
      status: 'draft',
      preview: '待任务发布后开始提交。',
    },
    {
      id: 'work_16',
      taskId: 'task_s3',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_4',
      status: 'draft',
      preview: '待任务发布后开始提交。',
    },
    {
      id: 'work_17',
      taskId: 'task_s3',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_5',
      status: 'draft',
      preview: '待任务发布后开始提交。',
    },
    {
      id: 'work_18',
      taskId: 'task_s3',
      teamId: 'team_active',
      ownerType: 'student',
      ownerId: 'student_6',
      status: 'draft',
      preview: '待任务发布后开始提交。',
    },
    {
      id: 'work_19',
      taskId: 'task_g1',
      teamId: 'team_active',
      ownerType: 'group',
      ownerId: 'group_1',
      submittedAt: nowPlus(-8),
      status: 'confirmed',
      aiScore: 20,
      tutorScore: 22,
      finalScore: 22,
      rating: 4.5,
      preview: '海报结构清晰，路线表达完整。',
    },
    {
      id: 'work_20',
      taskId: 'task_g1',
      teamId: 'team_active',
      ownerType: 'group',
      ownerId: 'group_2',
      submittedAt: nowPlus(-7),
      status: 'ai_scored',
      aiScore: 18,
      finalScore: 18,
      preview: 'AI 已初评分，等待导师确认。',
    },
    {
      id: 'work_21',
      taskId: 'task_g2',
      teamId: 'team_active',
      ownerType: 'group',
      ownerId: 'group_1',
      submittedAt: nowPlus(-4),
      status: 'submitted',
      preview: '等待导师评分。',
    },
    {
      id: 'work_22',
      taskId: 'task_g2',
      teamId: 'team_active',
      ownerType: 'group',
      ownerId: 'group_2',
      status: 'draft',
      preview: '小组仍在整理样本结论。',
    },
  ];

  const scoreRecords: ScoreRecord[] = [
    {
      id: 'score_1',
      workItemId: 'work_1',
      score: 18,
      rating: 4.5,
      comment: '观察细致，记录完整。',
      source: 'tutor',
      createdAt: nowPlus(-13),
    },
    {
      id: 'score_2',
      workItemId: 'work_19',
      score: 22,
      rating: 4.5,
      source: 'tutor',
      createdAt: nowPlus(-7),
    },
  ];

  const rewardPenaltyRecords: RewardPenaltyRecord[] = [
    {
      id: 'rp_1',
      teamId: 'team_active',
      targetType: 'student',
      targetId: 'student_1',
      kind: 'reward',
      points: 3,
      reason: '主动帮助同伴完成观察记录',
      createdAt: nowPlus(-5),
    },
    {
      id: 'rp_2',
      teamId: 'team_active',
      targetType: 'group',
      targetId: 'group_2',
      kind: 'penalty',
      points: 2,
      reason: '集合迟到',
      createdAt: nowPlus(-3),
    },
  ];

  const evaluationItems = buildEvaluationItems();
  const evaluationResults: EvaluationResult[] = [
    {
      id: 'eval_result_1',
      teamId: 'team_active',
      studentId: 'student_1',
      items: evaluationItems.map((item, index) => ({
        itemId: item.id,
        selfRating: 4 + (index % 2) * 0.5,
        groupRating: 4,
        tutorRating: 4.5,
      })),
      comment: '主动承担记录与分享任务，表现稳定。',
    },
    {
      id: 'eval_result_2',
      teamId: 'team_active',
      studentId: 'student_2',
      items: evaluationItems.map((item, index) => ({
        itemId: item.id,
        selfRating: 4,
        groupRating: 4,
        tutorRating: index === 0 ? 5 : 4,
      })),
      comment: '执行效率高，作品完成质量好。',
    },
  ];

  const reports: StudyReport[] = [
    {
      id: 'report_1',
      teamId: 'team_active',
      studentId: 'student_1',
      title: '南山海洋探索研学营阶段报告',
      status: 'ready',
      score: 90,
      grade: 'B',
      growthValue: 900,
      summary: '完成任务积极，观察和表达能力较突出。',
      generatedAt: nowPlus(-2),
    },
  ];

  const broadcasts: BroadcastMessage[] = [
    {
      id: 'broadcast_1',
      teamId: 'team_active',
      scope: 'team',
      contentType: 'text',
      content: '15 分钟后在海洋馆出口集合，准备前往下一站。',
      createdAt: nowPlus(-1),
    },
  ];

  const photos: PhotoAsset[] = [
    {
      id: 'photo_1',
      teamId: 'team_active',
      scope: 'team',
      title: '团队海洋馆合影',
      description: '上午场海洋馆主馆门口合影',
      imageUrl: PHOTO_POOL[0],
      createdAt: nowPlus(-11),
    },
    {
      id: 'photo_2',
      teamId: 'team_active',
      scope: 'group',
      targetId: 'group_1',
      title: '鲸跃先锋队任务讨论',
      description: '小组在馆内完成路线海报讨论',
      imageUrl: PHOTO_POOL[1],
      createdAt: nowPlus(-9),
    },
  ];

  const locations: LocationSnapshot[] = [
    {
      id: 'location_1',
      teamId: 'team_active',
      studentId: 'student_1',
      address: '深圳海洋馆 A 馆 2 层入口',
      lat: 22.482,
      lng: 113.925,
      distanceMeters: 36,
      updatedAt: nowPlus(0),
    },
    {
      id: 'location_2',
      teamId: 'team_active',
      studentId: 'student_3',
      address: '深圳海洋馆 海底隧道出口',
      lat: 22.4823,
      lng: 113.9259,
      distanceMeters: 84,
      updatedAt: nowPlus(0),
    },
    {
      id: 'location_3',
      teamId: 'team_active',
      studentId: 'student_4',
      address: '深圳海洋馆 科普教室',
      lat: 22.4818,
      lng: 113.9248,
      distanceMeters: 55,
      updatedAt: nowPlus(0),
    },
  ];

  const sosAlerts: SosAlert[] = [
    {
      id: 'sos_1',
      teamId: 'team_active',
      studentId: 'student_3',
      text: '与小组短暂走散，请求定位协助。',
      voiceNote: '语音 8 秒',
      address: '深圳海洋馆 海底隧道出口',
      lat: 22.4823,
      lng: 113.9259,
      distanceMeters: 84,
      status: 'tracking',
      createdAt: nowPlus(-1),
    },
  ];

  return {
    version: 1,
    currentTeamId: 'team_active',
    teams,
    students,
    groups,
    tasks,
    taskTemplates,
    workItems,
    scoreRecords,
    rewardPenaltyRecords,
    evaluationItems,
    evaluationResults,
    reports,
    broadcasts,
    photos,
    locations,
    sosAlerts,
  };
}

export function getCurrentTeam(state: TutorMockState) {
  return state.teams.find((team) => team.id === state.currentTeamId) ?? null;
}

export function getTeamById(state: TutorMockState, teamId: string) {
  return state.teams.find((team) => team.id === teamId) ?? null;
}

export function getStudentsByTeam(state: TutorMockState, teamId: string) {
  return state.students
    .filter((student) => student.teamId === teamId)
    .sort((left, right) => left.joinedOrder - right.joinedOrder);
}

export function getGroupsByTeam(state: TutorMockState, teamId: string) {
  return state.groups
    .filter((group) => group.teamId === teamId)
    .sort((left, right) => left.index - right.index);
}

export function getTasksByTeam(state: TutorMockState, teamId: string, scope?: TaskScope) {
  return state.tasks
    .filter((task) => task.teamId === teamId && (!scope || task.scope === scope))
    .sort((left, right) => left.order - right.order);
}

export function getWorksByTeam(state: TutorMockState, teamId: string) {
  return state.workItems
    .filter((workItem) => workItem.teamId === teamId)
    .sort((left, right) => (right.submittedAt ?? '').localeCompare(left.submittedAt ?? ''));
}

export function getWorksForOwner(
  state: TutorMockState,
  ownerType: TaskScope,
  ownerId: string,
) {
  return state.workItems.filter((workItem) => workItem.ownerType === ownerType && workItem.ownerId === ownerId);
}

export function getEvaluationForStudent(state: TutorMockState, studentId: string) {
  return state.evaluationResults.find((result) => result.studentId === studentId) ?? null;
}

export function getReportForStudent(state: TutorMockState, studentId: string) {
  return state.reports.find((report) => report.studentId === studentId) ?? null;
}

export function getLocationForStudent(state: TutorMockState, studentId: string) {
  return state.locations.find((location) => location.studentId === studentId) ?? null;
}

export function getSosForTeam(state: TutorMockState, teamId: string) {
  return state.sosAlerts
    .filter((alert) => alert.teamId === teamId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getStudentProgressSummary(state: TutorMockState, studentId: string) {
  const student = state.students.find((item) => item.id === studentId);
  if (!student) {
    return { completed: 0, submitted: 0, total: 0, progress: 0, score: 0 };
  }

  const studentTasks = getTasksByTeam(state, student.teamId, 'student');
  const works = getWorksForOwner(state, 'student', studentId);
  const completed = works.filter((work) => work.status === 'confirmed').length;
  const submitted = works.filter((work) => work.status !== 'draft').length;
  const score = computeStudentTotalScore(state, studentId);

  return {
    completed,
    submitted,
    total: studentTasks.length,
    progress: studentTasks.length === 0 ? 0 : Math.round((submitted / studentTasks.length) * 100),
    score,
  };
}

export function getGroupProgressSummary(state: TutorMockState, groupId: string) {
  const group = state.groups.find((item) => item.id === groupId);
  if (!group) {
    return { completed: 0, submitted: 0, total: 0, progress: 0, score: 0 };
  }

  const groupTasks = getTasksByTeam(state, group.teamId, 'group');
  const works = getWorksForOwner(state, 'group', groupId);
  const completed = works.filter((work) => work.status === 'confirmed').length;
  const submitted = works.filter((work) => work.status !== 'draft').length;
  const score = computeGroupTotalScore(state, groupId);

  return {
    completed,
    submitted,
    total: groupTasks.length,
    progress: groupTasks.length === 0 ? 0 : Math.round((submitted / groupTasks.length) * 100),
    score,
  };
}

export function getStudentEvaluationSummary(state: TutorMockState, studentId: string) {
  const evaluation = getEvaluationForStudent(state, studentId);
  if (!evaluation) {
    return { score: 0, grade: 'E' as StudyReport['grade'] };
  }

  const tutorRatings = evaluation.items.map((item) => item.tutorRating).filter(Boolean);
  const average = tutorRatings.length === 0 ? 0 : (tutorRatings.reduce((sum, value) => sum + value, 0) / tutorRatings.length) * 20;
  const score = Number(average.toFixed(1));
  return { score, grade: gradeFromScore(score) };
}

export function computeStudentTotalScore(state: TutorMockState, studentId: string) {
  const student = state.students.find((item) => item.id === studentId);
  if (!student) {
    return 0;
  }

  const directScore = getWorksForOwner(state, 'student', studentId).reduce(
    (sum, work) => sum + (work.finalScore ?? 0),
    0,
  );
  const groupScore = student.groupId
    ? getWorksForOwner(state, 'group', student.groupId).reduce((sum, work) => sum + (work.finalScore ?? 0), 0)
    : 0;
  const adjustments = state.rewardPenaltyRecords
    .filter((record) => record.targetType === 'student' && record.targetId === studentId)
    .reduce((sum, record) => sum + (record.kind === 'reward' ? record.points : -record.points), 0);

  return Number((directScore + groupScore + adjustments).toFixed(1));
}

export function computeGroupTotalScore(state: TutorMockState, groupId: string) {
  const baseScore = getWorksForOwner(state, 'group', groupId).reduce((sum, work) => sum + (work.finalScore ?? 0), 0);
  const adjustments = state.rewardPenaltyRecords
    .filter((record) => record.targetType === 'group' && record.targetId === groupId)
    .reduce((sum, record) => sum + (record.kind === 'reward' ? record.points : -record.points), 0);

  return Number((baseScore + adjustments).toFixed(1));
}

export function getOwnerName(state: TutorMockState, ownerType: TaskScope, ownerId: string) {
  if (ownerType === 'student') {
    return state.students.find((student) => student.id === ownerId)?.name ?? '未知学员';
  }

  return state.groups.find((group) => group.id === ownerId)?.name ?? '未知小组';
}

function createWorksForTask(
  teamId: string,
  task: TutorTask,
  state: TutorMockState,
) {
  if (task.scope === 'student') {
    return getStudentsByTeam(state, teamId).map<WorkItem>((student) => ({
      id: uid('work'),
      taskId: task.id,
      teamId,
      ownerType: 'student',
      ownerId: student.id,
      status: 'draft',
      preview: '等待学员提交作品',
    }));
  }

  return getGroupsByTeam(state, teamId).map<WorkItem>((group) => ({
    id: uid('work'),
    taskId: task.id,
    teamId,
    ownerType: 'group',
    ownerId: group.id,
    status: 'draft',
    preview: '等待小组提交作品',
  }));
}

export function useTutorStore() {
  const value = useContext(TutorStoreContext);
  if (!value) {
    throw new Error('TutorStoreProvider is missing');
  }
  return value;
}

export function TutorStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TutorMockState>(buildSeedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TutorMockState;
        if (parsed.version === 1) {
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

  function mutate(recipe: (draft: TutorMockState) => void) {
    setState((current) => {
      const draft = cloneState(current);
      recipe(draft);
      return draft;
    });
  }

  const value = useMemo<TutorStoreValue>(
    () => ({
      state,
      hydrated,
      actions: {
        resetSeed: () => setState(buildSeedState()),
        setCurrentTeam: (teamId) =>
          mutate((draft) => {
            draft.currentTeamId = teamId;
          }),
        saveTeam: (payload, teamId) =>
          mutate((draft) => {
            if (teamId) {
              const team = draft.teams.find((item) => item.id === teamId);
              if (!team) return;
              Object.assign(team, payload);
              return;
            }

            const nextTeamId = uid('team');
            draft.teams.unshift({
              id: nextTeamId,
              name: payload.name,
              organizationName: '南山实验学校研学中心',
              source: payload.source,
              status: payload.status,
              startDate: payload.startDate,
              days: payload.days,
              destination: payload.destination,
              bases: payload.bases,
              studentSource: payload.studentSource,
              joinCode: `YXB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
              assistants: [],
              materials: [],
              growthBaseValue: 1000,
            });
            draft.currentTeamId = nextTeamId;
          }),
        addStudent: ({ teamId, name, age, parentName, parentPhone, joined }) =>
          mutate((draft) => {
            const joinedOrder = draft.students.filter((student) => student.teamId === teamId).length + 1;
            const studentId = uid('student');
            draft.students.push({
              id: studentId,
              teamId,
              name,
              age,
              joined,
              online: false,
              joinedOrder,
              deviceId: `YXB-DEV-${Math.floor(Math.random() * 9000 + 1000)}`,
              parent: { name: parentName, phone: parentPhone },
            });

            draft.tasks
              .filter((task) => task.teamId === teamId && task.scope === 'student')
              .forEach((task) => {
                draft.workItems.push({
                  id: uid('work'),
                  taskId: task.id,
                  teamId,
                  ownerType: 'student',
                  ownerId: studentId,
                  status: 'draft',
                  preview: '等待学员提交作品',
                });
              });
          }),
        importStudents: ({ teamId, rawText }) => {
          let added = 0;
          mutate((draft) => {
            const currentTeamStudents = draft.students.filter((student) => student.teamId === teamId);
            const studentTasks = draft.tasks.filter((task) => task.teamId === teamId && task.scope === 'student');
            rawText
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .forEach((line, index) => {
                const [name, ageText, parentName, parentPhone] = line.split(/[，,]/).map((item) => item.trim());
                if (!name || !parentName || !parentPhone) {
                  return;
                }
                added += 1;
                draft.students.push({
                  id: uid('student'),
                  teamId,
                  name,
                  age: Number(ageText) || 10,
                  joined: index % 3 !== 0,
                  online: index % 2 === 0,
                  joinedOrder: currentTeamStudents.length + added,
                  deviceId: `YXB-DEV-${Math.floor(Math.random() * 9000 + 1000)}`,
                  parent: { name: parentName, phone: parentPhone },
                });

                const studentId = draft.students[draft.students.length - 1]?.id;
                if (studentId) {
                  studentTasks.forEach((task) => {
                    draft.workItems.push({
                      id: uid('work'),
                      taskId: task.id,
                      teamId,
                      ownerType: 'student',
                      ownerId: studentId,
                      status: 'draft',
                      preview: '等待学员提交作品',
                    });
                  });
                }
              });
          });
          return { added };
        },
        addAssistant: (teamId, payload) =>
          mutate((draft) => {
            const team = draft.teams.find((item) => item.id === teamId);
            if (!team) return;
            team.assistants.unshift({ id: uid('assistant'), ...payload });
          }),
        removeAssistant: (teamId, assistantId) =>
          mutate((draft) => {
            const team = draft.teams.find((item) => item.id === teamId);
            if (!team) return;
            team.assistants = team.assistants.filter((assistant) => assistant.id !== assistantId);
          }),
        addMaterial: (teamId, payload) =>
          mutate((draft) => {
            const team = draft.teams.find((item) => item.id === teamId);
            if (!team) return;
            team.materials.unshift({ id: uid('material'), ...payload });
          }),
        removeMaterial: (teamId, materialId) =>
          mutate((draft) => {
            const team = draft.teams.find((item) => item.id === teamId);
            if (!team) return;
            team.materials = team.materials.filter((material) => material.id !== materialId);
          }),
        createGroups: (teamId, count) =>
          mutate((draft) => {
            const currentCount = draft.groups.filter((group) => group.teamId === teamId).length;
            const createdGroups: Group[] = [];
            for (let index = 0; index < count; index += 1) {
              const group: Group = {
                id: uid('group'),
                teamId,
                index: currentCount + index + 1,
                name: `第 ${currentCount + index + 1} 小组`,
                emblem: '星',
                members: [],
              };
              draft.groups.push(group);
              createdGroups.push(group);
            }
            draft.tasks
              .filter((task) => task.teamId === teamId && task.scope === 'group')
              .forEach((task) => {
                createdGroups.forEach((group) => {
                  draft.workItems.push({
                    id: uid('work'),
                    taskId: task.id,
                    teamId,
                    ownerType: 'group',
                    ownerId: group.id,
                    status: 'draft',
                    preview: '等待小组提交作品',
                  });
                });
              });
          }),
        updateGroup: (groupId, payload) =>
          mutate((draft) => {
            const group = draft.groups.find((item) => item.id === groupId);
            if (!group) return;
            group.name = payload.name;
            group.emblem = payload.emblem;
          }),
        assignStudentToGroup: (teamId, studentId, groupId, role) =>
          mutate((draft) => {
            const student = draft.students.find((item) => item.id === studentId && item.teamId === teamId);
            const group = draft.groups.find((item) => item.id === groupId && item.teamId === teamId);
            if (!student || !group) return;

            draft.groups
              .filter((item) => item.teamId === teamId)
              .forEach((item) => {
                item.members = item.members.filter((member) => member.studentId !== studentId);
              });

            student.groupId = groupId;
            group.members.push({ studentId, role });
          }),
        saveTask: (teamId, payload) =>
          mutate((draft) => {
            if (payload.id) {
              const task = draft.tasks.find((item) => item.id === payload.id);
              if (!task) return;
              Object.assign(task, payload);
              return;
            }

            const order = draft.tasks.filter((task) => task.teamId === teamId && task.scope === payload.scope).length + 1;
            const task: TutorTask = {
              id: uid('task'),
              teamId,
              source: payload.source,
              scope: payload.scope,
              base: payload.base,
              taskType: payload.taskType,
              title: payload.title,
              points: payload.points,
              description: payload.description,
              attachments: payload.attachments,
              requirements: payload.requirements,
              status: payload.status,
              order,
              createdAt: nowPlus(0),
            };
            draft.tasks.push(task);
            draft.workItems.push(...createWorksForTask(teamId, task, draft));
          }),
        reorderTask: (taskId, direction) =>
          mutate((draft) => {
            const task = draft.tasks.find((item) => item.id === taskId);
            if (!task) return;
            const siblings = draft.tasks
              .filter((item) => item.teamId === task.teamId && item.scope === task.scope)
              .sort((left, right) => left.order - right.order);
            const index = siblings.findIndex((item) => item.id === taskId);
            if (index === -1) return;
            let targetIndex = index;
            if (direction === 'up') targetIndex = Math.max(0, index - 1);
            if (direction === 'down') targetIndex = Math.min(siblings.length - 1, index + 1);
            if (direction === 'top') targetIndex = 0;
            if (direction === 'bottom') targetIndex = siblings.length - 1;
            const [moved] = siblings.splice(index, 1);
            siblings.splice(targetIndex, 0, moved);
            siblings.forEach((item, orderIndex) => {
              const target = draft.tasks.find((taskItem) => taskItem.id === item.id);
              if (target) {
                target.order = orderIndex + 1;
              }
            });
          }),
        copyTasksFromHistory: (teamId, sourceTeamId, taskIds) =>
          mutate((draft) => {
            const sourceTasks = draft.tasks.filter((task) => task.teamId === sourceTeamId && taskIds.includes(task.id));
            sourceTasks.forEach((sourceTask) => {
              const nextTask: TutorTask = {
                ...sourceTask,
                id: uid('task'),
                teamId,
                source: 'history',
                status: 'draft',
                order: draft.tasks.filter((task) => task.teamId === teamId && task.scope === sourceTask.scope).length + 1,
                createdAt: nowPlus(0),
              };
              draft.tasks.push(nextTask);
              draft.workItems.push(...createWorksForTask(teamId, nextTask, draft));
            });
          }),
        copyTasksFromLibrary: (teamId, templateIds) =>
          mutate((draft) => {
            draft.taskTemplates
              .filter((template) => templateIds.includes(template.id))
              .forEach((template) => {
                const nextTask: TutorTask = {
                  id: uid('task'),
                  teamId,
                  scope: template.scope,
                  source: 'library',
                  base: template.base,
                  taskType: template.taskType,
                  title: template.title,
                  points: template.points,
                  description: template.description,
                  attachments: template.attachments,
                  requirements: template.requirements,
                  status: 'draft',
                  order: draft.tasks.filter((task) => task.teamId === teamId && task.scope === template.scope).length + 1,
                  createdAt: nowPlus(0),
                };
                draft.tasks.push(nextTask);
                draft.workItems.push(...createWorksForTask(teamId, nextTask, draft));
              });
          }),
        scoreWork: (workItemId, payload) =>
          mutate((draft) => {
            const workItem = draft.workItems.find((item) => item.id === workItemId);
            if (!workItem) return;
            const task = draft.tasks.find((item) => item.id === workItem.taskId);
            if (!task) return;
            const score = scoreFromRating(task.points, payload.rating);
            workItem.rating = payload.rating;
            workItem.tutorScore = score;
            workItem.finalScore = score;
            workItem.comment = payload.comment;
            workItem.status = 'confirmed';
            workItem.submittedAt = workItem.submittedAt ?? nowPlus(0);
            draft.scoreRecords.unshift({
              id: uid('score'),
              workItemId,
              score,
              rating: payload.rating,
              comment: payload.comment,
              source: 'tutor',
              createdAt: nowPlus(0),
            });
          }),
        confirmAiScores: (workItemIds) =>
          mutate((draft) => {
            draft.workItems
              .filter((item) => workItemIds.includes(item.id) && item.aiScore !== undefined)
              .forEach((workItem) => {
                workItem.status = 'confirmed';
                workItem.finalScore = workItem.aiScore;
                workItem.tutorScore = workItem.aiScore;
                workItem.rating = 5 * ((workItem.aiScore ?? 0) / (draft.tasks.find((task) => task.id === workItem.taskId)?.points ?? 1));
                draft.scoreRecords.unshift({
                  id: uid('score'),
                  workItemId: workItem.id,
                  score: workItem.aiScore ?? 0,
                  rating: Number((workItem.rating ?? 0).toFixed(1)),
                  source: 'batch_ai_confirm',
                  createdAt: nowPlus(0),
                });
              });
          }),
        addRewardPenalty: (payload) =>
          mutate((draft) => {
            draft.rewardPenaltyRecords.unshift({
              id: uid('rp'),
              teamId: payload.teamId,
              targetType: payload.targetType,
              targetId: payload.targetId,
              kind: payload.kind,
              points: payload.points,
              reason: payload.reason,
              createdAt: nowPlus(0),
            });
          }),
        updateEvaluation: (studentId, items, comment) =>
          mutate((draft) => {
            const student = draft.students.find((item) => item.id === studentId);
            if (!student) return;
            const result = draft.evaluationResults.find((item) => item.studentId === studentId);
            if (result) {
              result.items = items;
              result.comment = comment;
              return;
            }
            draft.evaluationResults.push({
              id: uid('evaluation'),
              teamId: student.teamId,
              studentId,
              items,
              comment,
            });
          }),
        generateReports: (teamId, studentIds) =>
          mutate((draft) => {
            const team = draft.teams.find((item) => item.id === teamId);
            if (!team) return;
            studentIds.forEach((studentId) => {
              const student = draft.students.find((item) => item.id === studentId);
              if (!student) return;
              const evaluation = getStudentEvaluationSummary(draft, studentId);
              const grade = evaluation.grade;
              const score = evaluation.score || Math.min(98, Math.max(60, computeStudentTotalScore(draft, studentId)));
              const summary = `${student.name}在本次研学中完成任务表现稳定，综合评级为 ${grade}。`;
              const growthValue = Math.round(team.growthBaseValue * growthMultiplier(grade));
              const existing = draft.reports.find((item) => item.studentId === studentId && item.teamId === teamId);
              if (existing) {
                existing.score = score;
                existing.grade = gradeFromScore(score);
                existing.summary = summary;
                existing.growthValue = Math.round(team.growthBaseValue * growthMultiplier(existing.grade));
                existing.status = 'ready';
                existing.generatedAt = nowPlus(0);
                return;
              }
              draft.reports.unshift({
                id: uid('report'),
                teamId,
                studentId,
                title: `${team.name}研学报告`,
                status: 'ready',
                score,
                grade: gradeFromScore(score),
                growthValue,
                summary,
                generatedAt: nowPlus(0),
              });
            });
          }),
        pushReport: (reportId) =>
          mutate((draft) => {
            const report = draft.reports.find((item) => item.id === reportId);
            if (!report) return;
            report.status = 'pushed';
            report.pushedAt = nowPlus(0);
          }),
        sendBroadcast: (payload) =>
          mutate((draft) => {
            draft.broadcasts.unshift({
              id: uid('broadcast'),
              ...payload,
              createdAt: nowPlus(0),
            });
          }),
        addPhoto: (payload) =>
          mutate((draft) => {
            draft.photos.unshift({
              id: uid('photo'),
              teamId: payload.teamId,
              scope: payload.scope,
              targetId: payload.targetId,
              title: payload.title,
              description: payload.description,
              imageUrl: payload.imageUrl || PHOTO_POOL[Math.floor(Math.random() * PHOTO_POOL.length)],
              createdAt: nowPlus(0),
            });
          }),
        updateSosStatus: (alertId, status) =>
          mutate((draft) => {
            const alert = draft.sosAlerts.find((item) => item.id === alertId);
            if (!alert) return;
            alert.status = status;
          }),
      },
    }),
    [hydrated, state],
  );

  return <TutorStoreContext.Provider value={value}>{children}</TutorStoreContext.Provider>;
}
