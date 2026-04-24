'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CourseStatus = 'draft' | 'pending_review' | 'published' | 'unpublished' | 'ended';
export type CourseType = 'online' | 'offline';
export type NewsStatus = 'collected' | 'editing' | 'published';
export type ChallengeStatus = 'draft' | 'ready' | 'published' | 'ended';
export type SubmissionStatus = 'pending' | 'reviewed';
export type AgentStatus = 'published' | 'paused';
export type AgentStyle = '严谨' | '活泼' | '鼓励型';

export type DashboardMetric = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  tone: 'brand' | 'gold' | 'green' | 'orange' | 'ink';
};

export type CourseChapter = {
  id: string;
  title: string;
  duration: string;
  summary: string;
};

export type CourseTrend = {
  label: string;
  value: number;
};

export type ExpertCourse = {
  id: string;
  title: string;
  type: CourseType;
  format: string;
  summary: string;
  ageRange: string;
  price: number;
  discountPrice?: number;
  status: CourseStatus;
  cover: string;
  chapters: CourseChapter[];
  views: number;
  sales: number;
  revenue: number;
  trends: CourseTrend[];
  location?: string;
  sessionSchedule?: string[];
  enrollmentLimit?: number;
  publishedAt?: string;
  updatedAt: string;
};

export type QaRecord = {
  id: string;
  askedAt: string;
  studentName: string;
  studentId: string;
  agentName: string;
  question: string;
  replySummary: string;
  matched: boolean;
  status: 'unresolved' | 'resolved';
  tags: string[];
  linkedKnowledgeId?: string;
};

export type StoredFileMeta = {
  id: string;
  name: string;
  sizeLabel: string;
  type: string;
  uploadedAt: string;
};

export type KnowledgeRevision = {
  id: string;
  question: string;
  answer: string;
  updatedAt: string;
  note: string;
};

export type KnowledgeEntry = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  source: 'manual' | 'qa' | 'document';
  updatedAt: string;
  status: 'active' | 'archived';
  revisions: KnowledgeRevision[];
  assets: StoredFileMeta[];
};

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  content: string;
  keywords: string[];
  featured: boolean;
  status: NewsStatus;
  publishAt: string;
  updatedAt: string;
};

export type Challenge = {
  id: string;
  title: string;
  summary: string;
  description: string;
  difficulty: '初级' | '中级' | '高级';
  tags: string[];
  references: string[];
  attachments: StoredFileMeta[];
  status: ChallengeStatus;
  participants: number;
  publishedAt?: string;
  updatedAt: string;
};

export type ChallengeSubmission = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  studentName: string;
  studentId: string;
  submittedAt: string;
  summary: string;
  attachments: string[];
  aiScore: number;
  finalScore?: number;
  growthReward?: number;
  comment?: string;
  status: SubmissionStatus;
};

export type KnowledgeBinding = {
  id: string;
  knowledgeId: string;
  knowledgeTitle: string;
  priority: number;
};

export type AgentProfile = {
  id: string;
  name: string;
  avatar: string;
  greeting: string;
  promptTemplate: string;
  style: AgentStyle;
  status: AgentStatus;
  totalUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  totalQaCount: number;
  averageDailyQa: number;
  hotTopics: string[];
  bindings: KnowledgeBinding[];
};

export type ChangeLogEntry = {
  id: string;
  targetType: 'course' | 'qa' | 'knowledge' | 'news' | 'challenge' | 'submission' | 'agent';
  targetId: string;
  action: string;
  detail: string;
  createdAt: string;
};

export type ExpertState = {
  version: number;
  courses: ExpertCourse[];
  qaRecords: QaRecord[];
  knowledgeEntries: KnowledgeEntry[];
  newsItems: NewsItem[];
  challenges: Challenge[];
  submissions: ChallengeSubmission[];
  agent: AgentProfile;
  logs: ChangeLogEntry[];
};

export type CourseInput = {
  id?: string;
  title: string;
  type: CourseType;
  format: string;
  summary: string;
  ageRange: string;
  price: number;
  discountPrice?: number;
  cover: string;
  chapters: Array<{ title: string; duration: string; summary: string }>;
  location?: string;
  sessionSchedule?: string[];
  enrollmentLimit?: number;
};

export type KnowledgeInput = {
  id?: string;
  question: string;
  answer: string;
  tags: string[];
  source: KnowledgeEntry['source'];
  assets: StoredFileMeta[];
};

export type NewsInput = {
  id?: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  content: string;
  keywords: string[];
  featured: boolean;
  publishAt: string;
};

export type ChallengeInput = {
  id?: string;
  title: string;
  summary: string;
  description: string;
  difficulty: Challenge['difficulty'];
  tags: string[];
  references: string[];
  attachments: StoredFileMeta[];
};

type ExpertStoreValue = {
  hydrated: boolean;
  state: ExpertState;
  metrics: DashboardMetric[];
  resetDemoData: () => void;
  saveCourse: (input: CourseInput) => void;
  setCourseStatus: (courseId: string, status: CourseStatus) => void;
  supplementQa: (recordId: string, answer: string, tags: string[]) => void;
  saveKnowledgeEntry: (input: KnowledgeInput) => void;
  archiveKnowledgeEntry: (entryId: string) => void;
  restoreKnowledgeRevision: (entryId: string, revisionId: string) => void;
  saveNewsItem: (input: NewsInput) => void;
  setNewsStatus: (newsId: string, status: NewsStatus) => void;
  saveChallenge: (input: ChallengeInput) => void;
  setChallengeStatus: (challengeId: string, status: ChallengeStatus) => void;
  reviewSubmission: (submissionId: string, finalScore: number, growthReward: number, comment: string) => void;
  updateAgentProfile: (input: Pick<AgentProfile, 'name' | 'avatar' | 'greeting' | 'promptTemplate' | 'style'>) => void;
  setAgentStatus: (status: AgentStatus) => void;
  updateAgentBindings: (knowledgeIds: string[]) => void;
};

const STORE_KEY = 'yanxuebao_expert_h5_state_v1';
const STORE_VERSION = 1;

const ExpertStoreContext = createContext<ExpertStoreValue | null>(null);

function nextId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function formatMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function uniqueTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

function createLog(
  targetType: ChangeLogEntry['targetType'],
  targetId: string,
  action: string,
  detail: string,
): ChangeLogEntry {
  return {
    id: nextId('log'),
    targetType,
    targetId,
    action,
    detail,
    createdAt: new Date().toISOString(),
  };
}

function createInitialState(): ExpertState {
  return {
    version: STORE_VERSION,
    courses: [
      {
        id: 'course_ocean_01',
        title: '海洋生态观察课',
        type: 'online',
        format: '视频课程',
        summary: '围绕海豚行为、潮汐变化和海洋保护实践展开的连续学习课程。',
        ageRange: '8-14岁',
        price: 199,
        discountPrice: 149,
        status: 'published',
        cover: '海洋馆观察主题课程',
        chapters: [
          { id: 'chapter_1', title: '认识海洋生态链', duration: '08:30', summary: '理解海洋生物之间的关系。' },
          { id: 'chapter_2', title: '海豚观察方法', duration: '12:10', summary: '学会记录行为与证据。' },
          { id: 'chapter_3', title: '保护行动设计', duration: '10:40', summary: '把观察结果转成实践方案。' },
        ],
        views: 4280,
        sales: 356,
        revenue: 53044,
        trends: [
          { label: '周一', value: 23 },
          { label: '周二', value: 31 },
          { label: '周三', value: 28 },
          { label: '周四', value: 35 },
          { label: '周五', value: 44 },
          { label: '周六', value: 52 },
          { label: '周日', value: 48 },
        ],
        publishedAt: '2026-04-02T09:00:00.000Z',
        updatedAt: '2026-04-18T11:00:00.000Z',
      },
      {
        id: 'course_city_01',
        title: '城市考古研学营',
        type: 'offline',
        format: '线下活动',
        summary: '结合城市博物馆和街区观察，带孩子完成一次城市历史研究任务。',
        ageRange: '10-15岁',
        price: 699,
        status: 'pending_review',
        cover: '城市考古线下研学',
        chapters: [],
        views: 860,
        sales: 18,
        revenue: 12582,
        trends: [
          { label: '周一', value: 8 },
          { label: '周二', value: 11 },
          { label: '周三', value: 13 },
          { label: '周四', value: 10 },
          { label: '周五', value: 14 },
          { label: '周六', value: 19 },
          { label: '周日', value: 16 },
        ],
        location: '深圳南山博物馆与海上世界片区',
        sessionSchedule: ['2026-05-01 09:30', '2026-05-03 14:00'],
        enrollmentLimit: 40,
        updatedAt: '2026-04-19T16:20:00.000Z',
      },
      {
        id: 'course_business_01',
        title: '少年商业表达直播课',
        type: 'online',
        format: '直播课程',
        summary: '训练孩子在真实商业议题中提出观点、组织证据并完成表达。',
        ageRange: '11-16岁',
        price: 129,
        status: 'unpublished',
        cover: '商业表达直播课',
        chapters: [
          { id: 'chapter_4', title: '观点搭建', duration: '45分钟直播', summary: '用事实、案例和结构讲清观点。' },
          { id: 'chapter_5', title: '提案展示', duration: '45分钟直播', summary: '在有限时间内完成小组提案。' },
        ],
        views: 1130,
        sales: 72,
        revenue: 9288,
        trends: [
          { label: '周一', value: 7 },
          { label: '周二', value: 12 },
          { label: '周三', value: 10 },
          { label: '周四', value: 15 },
          { label: '周五', value: 18 },
          { label: '周六', value: 16 },
          { label: '周日', value: 13 },
        ],
        updatedAt: '2026-04-17T10:00:00.000Z',
      },
      {
        id: 'course_create_01',
        title: 'AI 创意绘图工作坊',
        type: 'online',
        format: '图文课程',
        summary: '通过底图、提示词与手绘标注，让孩子建立图像表达与创作意识。',
        ageRange: '7-12岁',
        price: 89,
        status: 'ended',
        cover: 'AI 创意绘图工作坊',
        chapters: [
          { id: 'chapter_6', title: '观察与构图', duration: '06:20', summary: '从观察对象中提炼画面重点。' },
          { id: 'chapter_7', title: '创意表达', duration: '07:50', summary: '用提示词和标注扩展创作。' },
        ],
        views: 2510,
        sales: 214,
        revenue: 19046,
        trends: [
          { label: '周一', value: 10 },
          { label: '周二', value: 10 },
          { label: '周三', value: 9 },
          { label: '周四', value: 11 },
          { label: '周五', value: 8 },
          { label: '周六', value: 6 },
          { label: '周日', value: 5 },
        ],
        publishedAt: '2026-02-08T09:00:00.000Z',
        updatedAt: '2026-03-21T18:00:00.000Z',
      },
    ],
    qaRecords: [
      {
        id: 'qa_001',
        askedAt: '2026-04-19T09:18:00.000Z',
        studentName: '林可可',
        studentId: 'YXB-1023',
        agentName: '海洋探索导师',
        question: '海豚为什么会一起追逐鱼群？',
        replySummary: '当前知识库中还缺少针对群体协作捕食的完整解释。',
        matched: false,
        status: 'unresolved',
        tags: ['海豚', '协作行为'],
      },
      {
        id: 'qa_002',
        askedAt: '2026-04-19T11:45:00.000Z',
        studentName: '周子航',
        studentId: 'YXB-1177',
        agentName: '海洋探索导师',
        question: '珊瑚白化后还能恢复吗？',
        replySummary: '在温度回落且压力降低的情况下，部分珊瑚可以逐步恢复共生藻。',
        matched: true,
        status: 'resolved',
        tags: ['珊瑚', '生态保护'],
        linkedKnowledgeId: 'knowledge_001',
      },
      {
        id: 'qa_003',
        askedAt: '2026-04-18T16:05:00.000Z',
        studentName: '陈雨禾',
        studentId: 'YXB-1088',
        agentName: '海洋探索导师',
        question: '海洋垃圾清理机器人最关键的设计点是什么？',
        replySummary: '目前知识库匹配到的是设备分类，还缺少面向儿童可理解的设计说明。',
        matched: false,
        status: 'unresolved',
        tags: ['机器人', '环保设计'],
      },
      {
        id: 'qa_004',
        askedAt: '2026-04-17T13:20:00.000Z',
        studentName: '唐一宁',
        studentId: 'YXB-1201',
        agentName: '海洋探索导师',
        question: '潮汐和月亮为什么会有关系？',
        replySummary: '潮汐主要受月球和太阳引力影响，月球作用更明显。',
        matched: true,
        status: 'resolved',
        tags: ['潮汐', '引力'],
        linkedKnowledgeId: 'knowledge_002',
      },
    ],
    knowledgeEntries: [
      {
        id: 'knowledge_001',
        question: '珊瑚白化后还能恢复吗？',
        answer:
          '如果海水温度下降、污染减轻，珊瑚有机会重新获得共生藻并慢慢恢复，但恢复时间通常较长，也并不是所有珊瑚都能完全恢复。',
        tags: ['珊瑚', '生态保护', '海水温度'],
        source: 'qa',
        updatedAt: '2026-04-19T12:10:00.000Z',
        status: 'active',
        revisions: [
          {
            id: 'rev_001',
            question: '珊瑚白化后还能恢复吗？',
            answer: '珊瑚白化意味着珊瑚失去共生藻，短期内会非常脆弱。',
            updatedAt: '2026-04-15T09:00:00.000Z',
            note: '补充恢复条件前版本',
          },
        ],
        assets: [],
      },
      {
        id: 'knowledge_002',
        question: '潮汐和月亮为什么会有关系？',
        answer:
          '月球的引力会拉动地球上的海水，形成海面鼓起的区域。地球自转时，不同海岸会轮流经过这些区域，因此看到涨潮和退潮。',
        tags: ['潮汐', '引力', '月球'],
        source: 'manual',
        updatedAt: '2026-04-17T13:30:00.000Z',
        status: 'active',
        revisions: [],
        assets: [],
      },
      {
        id: 'knowledge_003',
        question: '海洋馆观察海豚时，应该重点记录什么？',
        answer: '建议从行为、环境、互动对象和时间顺序四个角度做记录，先看到事实，再给出自己的判断。',
        tags: ['观察方法', '海豚', '任务指导'],
        source: 'manual',
        updatedAt: '2026-04-16T15:00:00.000Z',
        status: 'active',
        revisions: [],
        assets: [
          {
            id: 'asset_001',
            name: '海豚观察记录模板.pdf',
            sizeLabel: '2.4 MB',
            type: 'application/pdf',
            uploadedAt: '2026-04-16T14:40:00.000Z',
          },
        ],
      },
      {
        id: 'knowledge_004',
        question: '海洋垃圾清理设备有哪些常见类型？',
        answer:
          '常见类型包括表层打捞装置、漂浮拦截设施、岸线清洁设备和识别分类机器人。给孩子讲解时可以从“它解决什么问题、怎么发现垃圾、如何回收”三个问题入手。',
        tags: ['环保设计', '机器人', '设备分类'],
        source: 'document',
        updatedAt: '2026-04-14T11:00:00.000Z',
        status: 'active',
        revisions: [],
        assets: [
          {
            id: 'asset_002',
            name: '海洋清洁设备资料.docx',
            sizeLabel: '1.1 MB',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            uploadedAt: '2026-04-14T10:20:00.000Z',
          },
        ],
      },
    ],
    newsItems: [
      {
        id: 'news_001',
        title: '深圳海洋馆推出夜宿观察计划',
        summary: '围绕夜间行为观察与声音记录，开放亲子和团体两种参与方式。',
        source: '海洋教育观察',
        category: '海洋教育',
        content: '项目将夜间海豚、海狮和鱼群活动设计成连续观察任务，适合结合课程进行二次学习。',
        keywords: ['海洋馆', '夜宿', '观察任务'],
        featured: true,
        status: 'published',
        publishAt: '2026-04-20 08:30',
        updatedAt: '2026-04-19T18:30:00.000Z',
      },
      {
        id: 'news_002',
        title: '海岸带修复案例适合做哪些儿童项目研究？',
        summary: '正在整理为适合 10-14 岁学员的观察与表达任务。',
        source: '海洋科普资讯源',
        category: '项目研究',
        content: '计划补充案例照片、修复前后对比和适龄讨论题，再安排定时发布。',
        keywords: ['海岸带', '修复', '项目研究'],
        featured: false,
        status: 'editing',
        publishAt: '2026-04-22 09:00',
        updatedAt: '2026-04-19T10:00:00.000Z',
      },
      {
        id: 'news_003',
        title: '水下机器人竞赛最新观察',
        summary: '来自行业媒体的初步采集内容，待专家筛选后下发。',
        source: '前沿科技采集池',
        category: '科技动态',
        content: '本条内容待补充学员可理解的背景说明和适合追问的问题。',
        keywords: ['机器人', '科技动态'],
        featured: false,
        status: 'collected',
        publishAt: '2026-04-25 10:00',
        updatedAt: '2026-04-18T09:00:00.000Z',
      },
    ],
    challenges: [
      {
        id: 'challenge_001',
        title: '如果你来设计海洋垃圾回收机器人',
        summary: '结合真实海洋垃圾场景，设计机器人识别、收集和分类方案。',
        description:
          '请围绕“在哪里工作、如何发现垃圾、如何把垃圾安全带回”三个问题提出方案，并用图文说明你的设计理由。',
        difficulty: '中级',
        tags: ['机器人', '环保设计', '项目研究'],
        references: ['深圳海洋馆现场观察', '海洋清洁设备案例'],
        attachments: [],
        status: 'published',
        participants: 42,
        publishedAt: '2026-04-10T09:00:00.000Z',
        updatedAt: '2026-04-18T17:00:00.000Z',
      },
      {
        id: 'challenge_002',
        title: '一张图讲清楚珊瑚为什么重要',
        summary: '把珊瑚礁对海洋生物和人类生活的作用做成一页讲解图。',
        description: '支持图文、手绘和拼贴表达，重点考察信息组织与逻辑清晰度。',
        difficulty: '初级',
        tags: ['珊瑚', '表达', '观察转化'],
        references: ['珊瑚保护科普材料'],
        attachments: [],
        status: 'ready',
        participants: 0,
        updatedAt: '2026-04-19T09:40:00.000Z',
      },
      {
        id: 'challenge_003',
        title: '潮汐如何影响港口生活',
        summary: '从运输、渔业和城市安全角度研究潮汐的影响。',
        description: '已完成一轮发布，当前保留为历史项目供回看。',
        difficulty: '高级',
        tags: ['潮汐', '城市观察', '系统思维'],
        references: ['港口观察记录'],
        attachments: [],
        status: 'ended',
        participants: 16,
        publishedAt: '2026-03-15T09:00:00.000Z',
        updatedAt: '2026-04-02T12:00:00.000Z',
      },
    ],
    submissions: [
      {
        id: 'submission_001',
        challengeId: 'challenge_001',
        challengeTitle: '如果你来设计海洋垃圾回收机器人',
        studentName: '林可可',
        studentId: 'YXB-1023',
        submittedAt: '2026-04-19T20:12:00.000Z',
        summary: '提交了设备草图、识别流程和回收路径说明。',
        attachments: ['机器人草图.png', '流程说明.docx'],
        aiScore: 86,
        status: 'pending',
      },
      {
        id: 'submission_002',
        challengeId: 'challenge_001',
        challengeTitle: '如果你来设计海洋垃圾回收机器人',
        studentName: '周子航',
        studentId: 'YXB-1177',
        submittedAt: '2026-04-18T21:03:00.000Z',
        summary: '重点补充了识别漂浮垃圾和分类投递的步骤。',
        attachments: ['观察记录.pdf'],
        aiScore: 91,
        finalScore: 94,
        growthReward: 80,
        comment: '方案完整，建议再补一段面对暴风浪时的安全策略。',
        status: 'reviewed',
      },
      {
        id: 'submission_003',
        challengeId: 'challenge_001',
        challengeTitle: '如果你来设计海洋垃圾回收机器人',
        studentName: '陈雨禾',
        studentId: 'YXB-1088',
        submittedAt: '2026-04-19T18:32:00.000Z',
        summary: '从岸线清洁场景切入，设计了模块化回收车。',
        attachments: ['设计说明.md', '结构图.jpg'],
        aiScore: 84,
        status: 'pending',
      },
    ],
    agent: {
      id: 'agent_main_001',
      name: '海洋探索导师',
      avatar: '海',
      greeting: '你好，我会结合课程、知识库和现场观察，陪你继续深挖海洋里的问题。',
      promptTemplate: '请用儿童可理解的语言回答问题，先讲清事实，再引导学员继续观察和表达。',
      style: '鼓励型',
      status: 'published',
      totalUsers: 3180,
      dailyActiveUsers: 486,
      weeklyActiveUsers: 1312,
      totalQaCount: 16840,
      averageDailyQa: 172,
      hotTopics: ['海豚行为', '潮汐变化', '珊瑚保护', '海洋机器人'],
      bindings: [
        { id: 'binding_001', knowledgeId: 'knowledge_003', knowledgeTitle: '海洋馆观察海豚时，应该重点记录什么？', priority: 1 },
        { id: 'binding_002', knowledgeId: 'knowledge_001', knowledgeTitle: '珊瑚白化后还能恢复吗？', priority: 2 },
        { id: 'binding_003', knowledgeId: 'knowledge_004', knowledgeTitle: '海洋垃圾清理设备有哪些常见类型？', priority: 3 },
      ],
    },
    logs: [
      {
        id: 'log_seed_001',
        targetType: 'news',
        targetId: 'news_001',
        action: '发布资讯',
        detail: '夜宿观察计划已进入学员资讯列表。',
        createdAt: '2026-04-19T18:30:00.000Z',
      },
      {
        id: 'log_seed_002',
        targetType: 'qa',
        targetId: 'qa_001',
        action: '待补充问答',
        detail: '海豚协作捕食问题等待补充标准答案。',
        createdAt: '2026-04-19T09:18:00.000Z',
      },
      {
        id: 'log_seed_003',
        targetType: 'submission',
        targetId: 'submission_001',
        action: '收到作品',
        detail: '林可可提交了海洋垃圾回收机器人设计稿。',
        createdAt: '2026-04-19T20:12:00.000Z',
      },
    ],
  };
}

function createDashboardMetrics(state: ExpertState): DashboardMetric[] {
  return [
    {
      id: 'metric_courses',
      label: '课程总数',
      value: state.courses.length,
      tone: 'brand',
    },
    {
      id: 'metric_qa',
      label: '未匹配问答',
      value: state.qaRecords.filter((item) => item.status === 'unresolved').length,
      tone: 'orange',
    },
    {
      id: 'metric_news',
      label: '已发布资讯',
      value: state.newsItems.filter((item) => item.status === 'published').length,
      tone: 'green',
    },
    {
      id: 'metric_challenges',
      label: '进行中挑战',
      value: state.challenges.filter((item) => item.status === 'published').length,
      tone: 'gold',
    },
    {
      id: 'metric_reviews',
      label: '待审核作品',
      value: state.submissions.filter((item) => item.status === 'pending').length,
      tone: 'ink',
    },
  ];
}

export function ExpertStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExpertState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) {
      setHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ExpertState;
      if (parsed.version === STORE_VERSION) {
        setState(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  function updateState(updater: (current: ExpertState) => ExpertState) {
    setState((current) => updater(current));
  }

  function pushLog(current: ExpertState, entry: ChangeLogEntry) {
    return {
      ...current,
      logs: [entry, ...current.logs].slice(0, 24),
    };
  }

  function resetDemoData() {
    const nextState = createInitialState();
    setState(nextState);
  }

  function saveCourse(input: CourseInput) {
    updateState((current) => {
      const chapters = input.chapters
        .filter((item) => item.title.trim())
        .map((item, index) => ({
          id: input.id ? `${input.id}_chapter_${index + 1}` : nextId('chapter'),
          title: item.title.trim(),
          duration: item.duration.trim() || '待定',
          summary: item.summary.trim() || '待补充课程说明',
        }));

      if (input.id) {
        const nextState = {
          ...current,
          courses: current.courses.map((course) =>
            course.id === input.id
              ? {
                  ...course,
                  ...input,
                  chapters,
                  updatedAt: new Date().toISOString(),
                }
              : course,
          ),
        };
        return pushLog(nextState, createLog('course', input.id, '更新课程', `${input.title} 已更新内容与排期。`));
      }

      const newCourse: ExpertCourse = {
        id: nextId('course'),
        title: input.title,
        type: input.type,
        format: input.format,
        summary: input.summary,
        ageRange: input.ageRange,
        price: formatMoney(input.price),
        discountPrice: input.discountPrice ? formatMoney(input.discountPrice) : undefined,
        status: 'draft',
        cover: input.cover,
        chapters,
        views: 0,
        sales: 0,
        revenue: 0,
        trends: [
          { label: '周一', value: 0 },
          { label: '周二', value: 0 },
          { label: '周三', value: 0 },
          { label: '周四', value: 0 },
          { label: '周五', value: 0 },
          { label: '周六', value: 0 },
          { label: '周日', value: 0 },
        ],
        location: input.location,
        sessionSchedule: input.sessionSchedule?.filter(Boolean),
        enrollmentLimit: input.enrollmentLimit,
        updatedAt: new Date().toISOString(),
      };
      const nextState = {
        ...current,
        courses: [newCourse, ...current.courses],
      };
      return pushLog(nextState, createLog('course', newCourse.id, '创建课程', `${newCourse.title} 已进入课程列表。`));
    });
  }

  function setCourseStatus(courseId: string, status: CourseStatus) {
    updateState((current) => {
      const target = current.courses.find((course) => course.id === courseId);
      if (!target) {
        return current;
      }

      const nextState = {
        ...current,
        courses: current.courses.map((course) =>
          course.id === courseId
            ? {
                ...course,
                status,
                publishedAt: status === 'published' ? course.publishedAt ?? new Date().toISOString() : course.publishedAt,
                updatedAt: new Date().toISOString(),
              }
            : course,
        ),
      };
      const labels: Record<CourseStatus, string> = {
        draft: '回到草稿',
        pending_review: '提交审核',
        published: '上架课程',
        unpublished: '下架课程',
        ended: '结束课程',
      };
      return pushLog(nextState, createLog('course', courseId, labels[status], `${target.title} 已更新为${labels[status]}状态。`));
    });
  }

  function supplementQa(recordId: string, answer: string, tags: string[]) {
    updateState((current) => {
      const record = current.qaRecords.find((item) => item.id === recordId);
      if (!record) {
        return current;
      }

      const now = new Date().toISOString();
      let nextKnowledgeEntries = [...current.knowledgeEntries];
      let linkedKnowledgeId = record.linkedKnowledgeId;

      if (linkedKnowledgeId) {
        nextKnowledgeEntries = nextKnowledgeEntries.map((entry) => {
          if (entry.id !== linkedKnowledgeId) {
            return entry;
          }
          return {
            ...entry,
            answer,
            tags: uniqueTags([...entry.tags, ...tags]),
            updatedAt: now,
            revisions: [
              {
                id: nextId('revision'),
                question: entry.question,
                answer: entry.answer,
                updatedAt: now,
                note: '补充问答前版本',
              },
              ...entry.revisions,
            ].slice(0, 6),
          };
        });
      } else {
        const matchedEntry = nextKnowledgeEntries.find((entry) => entry.question === record.question);
        if (matchedEntry) {
          linkedKnowledgeId = matchedEntry.id;
          nextKnowledgeEntries = nextKnowledgeEntries.map((entry) => {
            if (entry.id !== matchedEntry.id) {
              return entry;
            }
            return {
              ...entry,
              answer,
              tags: uniqueTags([...entry.tags, ...tags]),
              updatedAt: now,
              revisions: [
                {
                  id: nextId('revision'),
                  question: entry.question,
                  answer: entry.answer,
                  updatedAt: now,
                  note: '补充问答前版本',
                },
                ...entry.revisions,
              ].slice(0, 6),
            };
          });
        } else {
          const newEntry: KnowledgeEntry = {
            id: nextId('knowledge'),
            question: record.question,
            answer,
            tags: uniqueTags(tags),
            source: 'qa',
            updatedAt: now,
            status: 'active',
            revisions: [],
            assets: [],
          };
          linkedKnowledgeId = newEntry.id;
          nextKnowledgeEntries = [newEntry, ...nextKnowledgeEntries];
        }
      }

      const nextState = {
        ...current,
        knowledgeEntries: nextKnowledgeEntries,
        qaRecords: current.qaRecords.map<QaRecord>((item) =>
          item.id === recordId
            ? {
                ...item,
                replySummary: answer,
                matched: true,
                status: 'resolved',
                tags: uniqueTags([...item.tags, ...tags]),
                linkedKnowledgeId,
              }
            : item,
        ),
      };

      return pushLog(
        nextState,
        createLog('qa', recordId, '补充答案', `${record.studentName} 的问题已补充标准答案并同步到知识库。`),
      );
    });
  }

  function saveKnowledgeEntry(input: KnowledgeInput) {
    updateState((current) => {
      const now = new Date().toISOString();
      if (input.id) {
        const target = current.knowledgeEntries.find((entry) => entry.id === input.id);
        if (!target) {
          return current;
        }

        const nextState = {
          ...current,
          knowledgeEntries: current.knowledgeEntries.map<KnowledgeEntry>((entry) =>
            entry.id === input.id
              ? {
                  ...entry,
                  question: input.question,
                  answer: input.answer,
                  tags: uniqueTags(input.tags),
                  assets: input.assets,
                  source: input.source,
                  updatedAt: now,
                  revisions: [
                    {
                      id: nextId('revision'),
                      question: entry.question,
                      answer: entry.answer,
                      updatedAt: now,
                      note: '编辑知识条目前版本',
                    },
                    ...entry.revisions,
                  ].slice(0, 6),
                }
              : entry,
          ),
        };
        return pushLog(nextState, createLog('knowledge', input.id, '更新知识条目', `${input.question} 已更新。`));
      }

      const entry: KnowledgeEntry = {
        id: nextId('knowledge'),
        question: input.question,
        answer: input.answer,
        tags: uniqueTags(input.tags),
        source: input.source,
        updatedAt: now,
        status: 'active',
        revisions: [],
        assets: input.assets,
      };
      const nextState = {
        ...current,
        knowledgeEntries: [entry, ...current.knowledgeEntries],
      };
      return pushLog(nextState, createLog('knowledge', entry.id, '新增知识条目', `${entry.question} 已写入知识库。`));
    });
  }

  function archiveKnowledgeEntry(entryId: string) {
    updateState((current) => {
      const target = current.knowledgeEntries.find((entry) => entry.id === entryId);
      if (!target) {
        return current;
      }

      const nextState = {
        ...current,
        knowledgeEntries: current.knowledgeEntries.map<KnowledgeEntry>((entry) =>
          entry.id === entryId ? { ...entry, status: 'archived', updatedAt: new Date().toISOString() } : entry,
        ),
      };
      return pushLog(nextState, createLog('knowledge', entryId, '停用条目', `${target.question} 已移出当前知识库。`));
    });
  }

  function restoreKnowledgeRevision(entryId: string, revisionId: string) {
    updateState((current) => {
      const target = current.knowledgeEntries.find((entry) => entry.id === entryId);
      if (!target) {
        return current;
      }
      const revision = target.revisions.find((item) => item.id === revisionId);
      if (!revision) {
        return current;
      }

      const now = new Date().toISOString();
      const nextState = {
        ...current,
        knowledgeEntries: current.knowledgeEntries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                question: revision.question,
                answer: revision.answer,
                updatedAt: now,
                revisions: [
                  {
                    id: nextId('revision'),
                    question: entry.question,
                    answer: entry.answer,
                    updatedAt: now,
                    note: '版本回退前内容',
                  },
                  ...entry.revisions.filter((item) => item.id !== revisionId),
                ].slice(0, 6),
              }
            : entry,
        ),
      };

      return pushLog(nextState, createLog('knowledge', entryId, '回退版本', `${revision.question} 已回退到较早版本。`));
    });
  }

  function saveNewsItem(input: NewsInput) {
    updateState((current) => {
      const now = new Date().toISOString();
      if (input.id) {
        const nextState = {
          ...current,
          newsItems: current.newsItems.map((item) =>
            item.id === input.id
              ? {
                  ...item,
                  ...input,
                  keywords: uniqueTags(input.keywords),
                  updatedAt: now,
                }
              : item,
          ),
        };
        return pushLog(nextState, createLog('news', input.id, '更新资讯', `${input.title} 已更新内容。`));
      }

      const entry: NewsItem = {
        id: nextId('news'),
        ...input,
        keywords: uniqueTags(input.keywords),
        status: 'collected',
        updatedAt: now,
      };
      const nextState = {
        ...current,
        newsItems: [entry, ...current.newsItems],
      };
      return pushLog(nextState, createLog('news', entry.id, '新增资讯', `${entry.title} 已进入采集池。`));
    });
  }

  function setNewsStatus(newsId: string, status: NewsStatus) {
    updateState((current) => {
      const target = current.newsItems.find((item) => item.id === newsId);
      if (!target) {
        return current;
      }
      const nextState = {
        ...current,
        newsItems: current.newsItems.map((item) =>
          item.id === newsId
            ? {
                ...item,
                status,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      };
      const labels: Record<NewsStatus, string> = {
        collected: '归入采集池',
        editing: '进入编辑',
        published: '发布资讯',
      };
      return pushLog(nextState, createLog('news', newsId, labels[status], `${target.title} 已更新为${labels[status]}状态。`));
    });
  }

  function saveChallenge(input: ChallengeInput) {
    updateState((current) => {
      const now = new Date().toISOString();
      if (input.id) {
        const nextState = {
          ...current,
          challenges: current.challenges.map((item) =>
            item.id === input.id
              ? {
                  ...item,
                  ...input,
                  tags: uniqueTags(input.tags),
                  references: input.references.filter(Boolean),
                  updatedAt: now,
                }
              : item,
          ),
        };
        return pushLog(nextState, createLog('challenge', input.id, '更新挑战', `${input.title} 已更新内容。`));
      }

      const challenge: Challenge = {
        id: nextId('challenge'),
        ...input,
        tags: uniqueTags(input.tags),
        references: input.references.filter(Boolean),
        status: 'draft',
        participants: 0,
        updatedAt: now,
      };
      const nextState = {
        ...current,
        challenges: [challenge, ...current.challenges],
      };
      return pushLog(nextState, createLog('challenge', challenge.id, '新增挑战', `${challenge.title} 已创建。`));
    });
  }

  function setChallengeStatus(challengeId: string, status: ChallengeStatus) {
    updateState((current) => {
      const target = current.challenges.find((item) => item.id === challengeId);
      if (!target) {
        return current;
      }
      const nextState = {
        ...current,
        challenges: current.challenges.map((item) =>
          item.id === challengeId
            ? {
                ...item,
                status,
                publishedAt: status === 'published' ? item.publishedAt ?? new Date().toISOString() : item.publishedAt,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      };
      const labels: Record<ChallengeStatus, string> = {
        draft: '回到草稿',
        ready: '待发布',
        published: '发布挑战',
        ended: '结束挑战',
      };
      return pushLog(nextState, createLog('challenge', challengeId, labels[status], `${target.title} 已更新为${labels[status]}状态。`));
    });
  }

  function reviewSubmission(submissionId: string, finalScore: number, growthReward: number, comment: string) {
    updateState((current) => {
      const target = current.submissions.find((item) => item.id === submissionId);
      if (!target) {
        return current;
      }
      const nextState = {
        ...current,
        submissions: current.submissions.map<ChallengeSubmission>((item) =>
          item.id === submissionId
            ? {
                ...item,
                finalScore,
                growthReward,
                comment,
                status: 'reviewed',
              }
            : item,
        ),
      };

      return pushLog(
        nextState,
        createLog('submission', submissionId, '完成审核', `${target.studentName} 的挑战作品已完成审核并发放成长值。`),
      );
    });
  }

  function updateAgentProfile(input: Pick<AgentProfile, 'name' | 'avatar' | 'greeting' | 'promptTemplate' | 'style'>) {
    updateState((current) => {
      const nextState = {
        ...current,
        agent: {
          ...current.agent,
          ...input,
        },
      };
      return pushLog(nextState, createLog('agent', current.agent.id, '更新智能体', `${input.name} 的基础配置已更新。`));
    });
  }

  function setAgentStatus(status: AgentStatus) {
    updateState((current) => {
      const nextState = {
        ...current,
        agent: {
          ...current.agent,
          status,
        },
      };
      const label = status === 'published' ? '上架智能体' : '暂停智能体';
      return pushLog(nextState, createLog('agent', current.agent.id, label, `${current.agent.name} 已更新状态。`));
    });
  }

  function updateAgentBindings(knowledgeIds: string[]) {
    updateState((current) => {
      const bindings = knowledgeIds
        .map((knowledgeId, index) => {
          const matched = current.knowledgeEntries.find((entry) => entry.id === knowledgeId);
          if (!matched) {
            return null;
          }
          return {
            id: `binding_${knowledgeId}`,
            knowledgeId,
            knowledgeTitle: matched.question,
            priority: index + 1,
          } satisfies KnowledgeBinding;
        })
        .filter((item): item is KnowledgeBinding => Boolean(item));

      const nextState = {
        ...current,
        agent: {
          ...current.agent,
          bindings,
        },
      };
      return pushLog(nextState, createLog('agent', current.agent.id, '更新知识库绑定', `已调整 ${bindings.length} 个知识条目的优先级。`));
    });
  }

  const value = useMemo<ExpertStoreValue>(
    () => ({
      hydrated,
      state,
      metrics: createDashboardMetrics(state),
      resetDemoData,
      saveCourse,
      setCourseStatus,
      supplementQa,
      saveKnowledgeEntry,
      archiveKnowledgeEntry,
      restoreKnowledgeRevision,
      saveNewsItem,
      setNewsStatus,
      saveChallenge,
      setChallengeStatus,
      reviewSubmission,
      updateAgentProfile,
      setAgentStatus,
      updateAgentBindings,
    }),
    [hydrated, state],
  );

  return <ExpertStoreContext.Provider value={value}>{children}</ExpertStoreContext.Provider>;
}

export function useExpertStore() {
  const context = useContext(ExpertStoreContext);
  if (!context) {
    throw new Error('useExpertStore must be used within ExpertStoreProvider');
  }
  return context;
}
