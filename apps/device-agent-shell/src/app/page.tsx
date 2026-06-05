'use client';

import type { TouchEvent } from 'react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

type AuthStage = 'device' | 'student' | 'account' | 'face' | 'main';
type InitMode = 'rental' | 'sale' | 'scan';
type FaceStatus = 'ready' | 'scanning' | 'success';
type ScreenKey = 'notice' | 'growth' | 'agent' | 'apps';
type AppPage = 'center' | 'detail' | 'workspace';
type AgentFlowPage = 'taskCardAgent' | 'cardBagAgent' | 'duelAgent' | 'abilityAgent' | 'talentAgent' | 'interestAgent' | 'profileAgent' | 'diaryAgent';
type AgentPage = 'home' | 'mainlineChat' | AgentFlowPage;
type AgentMode = 'task' | 'taskCard' | 'cards' | 'duel' | 'ability' | 'talent' | 'interest' | 'profile' | 'diary';
type HomeTriggerKey = 'mainline' | 'taskCards' | 'duel' | 'growthProfile';
type HomePushTarget = 'mainlineChat' | AgentFlowPage;
type NoticeFilter = '任务' | '消息' | '聊天' | '团队';
type SosStatus = 'idle' | 'confirming' | 'sent';

type MockApp = {
  key: string;
  title: string;
  short: string;
  group: string;
  accent: 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'red' | 'gray';
  asset: string;
  summary: string;
  states: string[];
  actions: string[];
  safety?: string;
};

type AppRuntime = {
  headline: string;
  metric: string;
  progress: number;
  primary: string;
  secondary: string;
  feed: {
    tag: string;
    title: string;
    desc: string;
  }[];
};

type FullAppPageProfile = {
  focus: string;
  tabs: {
    label: string;
    desc: string;
  }[];
  metrics: {
    label: string;
    value: string;
    desc: string;
  }[];
  records: {
    tag: string;
    title: string;
    desc: string;
  }[];
  agentTips: string[];
};

type AppActionResult = {
  title: string;
  desc: string;
};

type AppActionLog = {
  app: string;
  action: string;
  text: string;
};

type NoticeItem = {
  category: NoticeFilter;
  type: string;
  title: string;
  desc: string;
};

type MainlineChatStep = {
  id: string;
  phase: string;
  title: string;
  body: string[];
  tags?: string[];
  visual?: string;
  studentReply?: string;
  progress?: string;
  actionLabel: string;
  secondaryActions?: string[];
  reward?: number;
  diaryReady?: boolean;
};

type AgentFlowWidget = 'task-choice' | 'task-photo' | 'task-voice' | 'task-form' | 'task-relation' | 'task-feedback' | 'settlement' | 'card-bag' | 'duel' | 'ability' | 'talent' | 'interest' | 'profile' | 'diary';

type AgentFlowStep = {
  id: string;
  phase: string;
  title: string;
  body: string[];
  actionLabel: string;
  tags?: string[];
  visual?: string;
  studentReply?: string;
  progress?: string;
  secondaryActions?: string[];
  reward?: number;
  widget?: AgentFlowWidget;
};

type AgentFlowDefinition = {
  page: AgentFlowPage;
  mode: AgentMode;
  navLabel: string;
  title: string;
  entryTitle: string;
  entryDesc: string;
  summaryLabel: string;
  journeyLabels: string[];
  steps: AgentFlowStep[];
};

type DuelStepId =
  | 'duel-invite'
  | 'duel-rules'
  | 'duel-q1-choice'
  | 'duel-r1-choice-result'
  | 'duel-q2-photo'
  | 'duel-r2-photo-result'
  | 'duel-q3-voice'
  | 'duel-r3-voice-result'
  | 'duel-q4-form'
  | 'duel-r4-form-result'
  | 'duel-q5-relation'
  | 'duel-r5-relation-result'
  | 'duel-q6-summary'
  | 'duel-r6-summary-result'
  | 'duel-result'
  | 'duel-rank';

type HomePushCard = {
  key: string;
  title: string;
  desc: string;
  meta: string;
  actionLabel: string;
  target: HomePushTarget;
};

type HomePushGroup = {
  trigger: HomeTriggerKey;
  title: string;
  agentText: string;
  cards: HomePushCard[];
};

type DuelRoundKind = 'choice' | 'photo' | 'voice' | 'form' | 'relation' | 'summary';

type DuelScore = {
  mine: number;
  opponent: number;
};

type DuelMetric = {
  label: string;
  mine: number;
  opponent: number;
};

type DuelBattleDraftState = {
  choice: string | null;
  photoMode: 'idle' | 'camera' | 'album';
  voiceMode: 'idle' | 'recorded';
  formMode: 'idle' | 'drafted' | 'manual';
  relationMode: 'idle' | 'voice' | 'text';
  summaryMode: 'idle' | 'drafted';
  summaryNote: string;
};

type DuelBattleRound = {
  step: number;
  questionId: DuelStepId;
  resultId: DuelStepId;
  kind: DuelRoundKind;
  questionTitle: string;
  prompt: string;
  actionLabel: string;
  controls: string[];
  resultActionLabel: string;
  answerSummary: string;
  resultTitle: string;
  feedback: string;
  score: DuelScore;
  questionScore: number;
  opponentQuestionScore: number;
  metrics: DuelMetric[];
};

type GrowthProbePage = 'abilityAgent' | 'talentAgent' | 'interestAgent';

type GrowthProbeDraftState = {
  abilityAnswers: Record<string, string>;
  talentAnswers: Record<string, string[]>;
  talentBehavior: 'idle' | 'drafted' | 'manual';
  interestTags: string[];
  interestEvidence: 'idle' | 'accepted' | 'ignored';
  interestRobot: 'idle' | 'accepted' | 'ignored' | 'later';
};

type SettingsToggles = {
  face: boolean;
  pay: boolean;
  location: boolean;
};

type AppWorkspaceProps = {
  activeAction: string;
  activeApp: MockApp;
  activeResult: AppActionResult;
  activeRuntime: AppRuntime;
  actionLog: AppActionLog[];
  settingsToggles: SettingsToggles;
  sosStatus: SosStatus;
  stage: number;
  walletCodeVisible: boolean;
  onBack: () => void;
  onRunAction: (action: string) => void;
  onToggleSetting: (key: keyof SettingsToggles) => void;
};

const screenOrder: ScreenKey[] = ['notice', 'growth', 'agent', 'apps'];
const noticeFilters: NoticeFilter[] = ['任务', '消息', '聊天', '团队'];

const demoAccounts = [
  { name: '小明同学', phone: '13800000001', role: '蓝翼观察队 · 记录员' },
  { name: '小鱼同学', phone: '13800000002', role: '蓝翼观察队 · 摄影员' },
  { name: '家长演示账号', phone: '13900000001', role: '家长授权视角' },
];

const initModeCopy: Record<InitMode, { title: string; desc: string; action: string }> = {
  rental: {
    title: '租赁模式',
    desc: '输入 6 位设备授权码后完成初始化，保留错误提示和体验码说明。',
    action: '验证授权码',
  },
  sale: {
    title: '销售模式',
    desc: '销售设备无需授权码，确认设备码后进入学员登录。',
    action: '确认销售设备',
  },
  scan: {
    title: '扫码授权',
    desc: '展示二维码和扫码状态，业务方可模拟授权成功。',
    action: '模拟扫码成功',
  },
};

const notifications: NoticeItem[] = [
  { category: '任务', type: '任务', title: '生态设施大搜索待完成', desc: '第 4 个锦囊已解锁，请拍摄生态设施并说明作用。' },
  { category: '任务', type: '任务', title: '小组方案草图待上传', desc: '请拍摄小组生态设施草图，Agent 会帮你整理关键词。' },
  { category: '任务', type: '任务', title: '研学日记素材待确认', desc: '今天的照片、语音和观察记录已聚合，可归档到主线日记素材。' },
  { category: '消息', type: '广播', title: '老师发布安全提醒', desc: '不触碰动植物，不离开小组活动范围。' },
  { category: '消息', type: '家庭', title: '家长留言', desc: '活动结束后把今天最有意思的发现讲给家里人听。' },
  { category: '聊天', type: '聊天', title: '小宇发来斗卡邀请', desc: '探访野朋友卡片已准备好，60 秒内可以进入斗卡。' },
  { category: '团队', type: '团队', title: '小组设计方案待补充', desc: '记录员需要补齐设施名称、目标物种和预期作用。' },
  { category: '团队', type: '团队', title: '队长分配了新角色', desc: '你被设置为本轮方案讲解员，需要补充一句展示文案。' },
];

const growthMetrics = [
  { label: '观察', value: 86, accent: 'green' },
  { label: '表达', value: 78, accent: 'blue' },
  { label: '协作', value: 72, accent: 'purple' },
  { label: '创造', value: 81, accent: 'orange' },
];

const mainlineChatSteps: MainlineChatStep[] = [
  {
    id: 'prepare',
    phase: '研学前准备',
    title: '你将参加《小小生态公园设计师》研学活动',
    body: ['活动地点：福田红树林生态公园。', '你的身份：生态公园设计师。', '核心任务：观察“野朋友”，调查生态设施，和小组一起设计一个更适合动物生活的生态设施。'],
    tags: ['活动说明', '安全提醒', '小组信息', 'K/W 表'],
    visual: '准备就绪',
    progress: '1/7',
    actionLabel: '查看安全提醒',
    secondaryActions: ['查看我的小组', '填写 K/W'],
  },
  {
    id: 'prepare-safety',
    phase: '研学前准备',
    title: '安全提醒已打开',
    body: ['跟随小组行动，不要单独离队。', '不触碰动植物，不进入生态敏感区。', '穿舒适运动鞋，带好水壶。'],
    studentReply: '我知道了，先看安全提醒。',
    tags: ['安全第一', '已阅读'],
    visual: '安全提醒',
    progress: '1/7',
    actionLabel: '查看我的小组',
  },
  {
    id: 'prepare-team',
    phase: '研学前准备',
    title: '你的小组信息',
    body: ['第 X 组，角色：记录员。', '队友：小宇、小鱼、小安。', '跟队老师和公园导览员已关联。'],
    studentReply: '我已经看完小组信息。',
    tags: ['第 X 组', '记录员', '队友 3 人'],
    visual: '小组集合',
    progress: '1/7',
    actionLabel: '填写 K：我已经知道的',
  },
  {
    id: 'prepare-kwl-k',
    phase: '研学前准备',
    title: '已保存 K：我已经知道的',
    body: ['你写的是：“我知道红树林里有很多鸟，也有很多植物。”', '接下来请说一说，这次活动中你最想知道什么。'],
    studentReply: '我知道红树林里有很多鸟，也有很多植物。',
    tags: ['K/W 表', 'K 已保存'],
    visual: 'K 已填写',
    progress: '1/7',
    actionLabel: '填写 W：我想知道的',
  },
  {
    id: 'prepare-done',
    phase: '研学前准备',
    title: '研学前准备已完成',
    body: ['你已经看了安全提醒、小组信息，并填写了 K/W。', '活动开始后，我会带你完成任务一。'],
    studentReply: '我想知道昆虫旅馆有什么用。',
    tags: ['准备完成', 'K/W 已保存'],
    visual: '出发吧',
    progress: '1/7',
    actionLabel: '开始任务一',
  },
  {
    id: 'wild-start',
    phase: '任务一',
    title: '任务一开始了：探访“野朋友”',
    body: ['请和小组同学一起寻找公园里的动物和植物。', '你需要拍摄发现、说出观察，并记录动物调查和植物调查。', '注意：不要触碰动植物，不要进入生态敏感区。'],
    studentReply: '准备好了，开始任务一。',
    tags: ['拍拍', '语音观察', '记录'],
    visual: '野朋友',
    progress: '2/7',
    actionLabel: '拍照记录',
    secondaryActions: ['我应该观察什么'],
  },
  {
    id: 'wild-photo',
    phase: '任务一',
    title: '照片已记录',
    body: ['请标记这条记录的类型。', '我会把照片和观察说明一起保存到任务一。'],
    studentReply: '我拍到一只停在树枝上的鸟。',
    tags: ['照片有效', '待分类'],
    visual: '鸟类照片',
    progress: '2/7',
    actionLabel: '标记为动物',
    secondaryActions: ['标记为植物', '重新拍照'],
  },
  {
    id: 'wild-voice',
    phase: '任务一',
    title: '已标记为动物记录',
    body: ['接下来请补充观察说明。', '你可以说：它在哪里？它有什么特点？它在做什么？'],
    studentReply: '这只鸟停在树枝上，羽毛是灰色的，正在看水面。',
    tags: ['动物记录 1 条', '语音转文字'],
    visual: '观察说明',
    progress: '2/7',
    actionLabel: '保存本条记录',
    secondaryActions: ['让 Agent 优化表达'],
  },
  {
    id: 'wild-submit',
    phase: '任务一',
    title: '任务一记录已完整',
    body: ['动物记录：2 条。', '植物记录：3 条。', '观察说明：已完成。', '任务一提交后，这些素材会进入研学日记。'],
    studentReply: '记录补充完成，提交任务一。',
    tags: ['任务一完成', '成长素材已沉淀'],
    visual: '任务一完成',
    progress: '2/7',
    actionLabel: '提交任务一',
  },
  {
    id: 'facility-start',
    phase: '任务二',
    title: '任务二开始了：生态设施大搜索',
    body: ['这个任务共有 10 个锦囊，需要按顺序完成。', '每个锦囊都需要根据线索找到生态设施、拍摄设施照片，并说出它有什么作用。'],
    studentReply: '任务一已提交，开始生态设施大搜索。',
    tags: ['10 个锦囊', '按顺序完成'],
    visual: '生态设施',
    progress: '3/7',
    actionLabel: '打开当前锦囊',
  },
  {
    id: 'facility-capsule',
    phase: '任务二',
    title: '锦囊 1 已打开',
    body: ['线索：请找到一个能为昆虫提供栖息空间的设施。', '完成要求：拍摄设施照片，说出它可能帮助哪些生物，并说明生态作用。'],
    studentReply: '我找到了昆虫旅馆。',
    tags: ['锦囊 1', '昆虫栖息空间'],
    visual: '昆虫旅馆',
    progress: '3/7',
    actionLabel: '拍照记录',
    secondaryActions: ['这个锦囊是什么意思'],
  },
  {
    id: 'facility-record',
    phase: '任务二',
    title: '设施照片已记录',
    body: ['接下来请说明这个设施有什么作用。', '我会把设施照片和作用说明保存为锦囊记录。'],
    studentReply: '这个设施可以给昆虫提供躲藏和栖息空间，也能帮助小动物生活。',
    tags: ['设施照片', '作用说明'],
    visual: '生态作用',
    progress: '3/7',
    actionLabel: '完成当前锦囊',
  },
  {
    id: 'facility-submit',
    phase: '任务二',
    title: '生态设施大搜索进度：10/10',
    body: ['10 个锦囊已经全部完成。', '你找到的生态设施记录，会作为任务三“生态设施创想”的参考。'],
    studentReply: '10 个锦囊都完成了，提交任务二。',
    tags: ['锦囊全完成', '任务二完成'],
    visual: '大搜索完成',
    progress: '3/7',
    actionLabel: '提交任务二',
  },
  {
    id: 'design-start',
    phase: '任务三',
    title: '任务三开始了：生态设施创想',
    body: ['现在请和小组一起设计一个生态设施，帮助“野朋友”生活得更舒服。', '你们需要完成设施名称、服务的目标物种、预期作用、设计图和方案说明。'],
    studentReply: '开始任务三，我们想做一个新设施。',
    tags: ['小组共创', 'AI 创作', '会议'],
    visual: '生态创想',
    progress: '4/7',
    actionLabel: '选择目标物种',
  },
  {
    id: 'design-spec',
    phase: '任务三',
    title: '方案信息已记录',
    body: ['目标物种：鸟类。', '问题发现：适合鸟类停留和休息的地方不够。', '设施名称：鸟类观察休息架。', '预期作用：为鸟类提供停留和休息空间，也方便观察周围环境。'],
    studentReply: '我们想帮助鸟类，做一个鸟类观察休息架。',
    tags: ['目标物种', '问题发现', '设施名称'],
    visual: '方案草稿',
    progress: '4/7',
    actionLabel: '生成设计图',
    secondaryActions: ['继续补充'],
  },
  {
    id: 'design-image',
    phase: '任务三',
    title: '设计图已生成',
    body: ['我根据你们的想法生成了设计图。', '设计包含自然材料、鸟类停留架、观察说明牌和安全路径。'],
    studentReply: '使用这张图。',
    tags: ['AI 设计图', '可重新生成'],
    visual: '设计图',
    progress: '4/7',
    actionLabel: '录制方案说明',
  },
  {
    id: 'design-submit',
    phase: '任务三',
    title: '小组方案已完整',
    body: ['设施名称：鸟类观察休息架。', '目标物种：鸟类。', '预期作用：提供停留和休息空间。', '方案说明：已完成。'],
    studentReply: '方案说明录好了，提交小组方案。',
    tags: ['小组方案完成', '任务三完成'],
    visual: '方案提交',
    progress: '4/7',
    actionLabel: '提交小组方案',
  },
  {
    id: 'summary-start',
    phase: '活动总结',
    title: '今天的研学任务已经完成',
    body: ['接下来请完成活动总结与评价。', '需要填写 L：我学到的、我的收获、我还想了解，并完成学生自评、同学互评和小组自评。'],
    studentReply: '小组方案已提交，开始活动总结。',
    tags: ['L 表', '自评互评', '小组评价'],
    visual: '活动总结',
    progress: '5/7',
    actionLabel: '填写 L：我学到的',
  },
  {
    id: 'summary-evaluation',
    phase: '活动总结',
    title: '活动总结已记录',
    body: ['L：我学到了生态设施可以帮助动物生活。', '我的收获：知道生态设施不是给人用的，也是在帮助野生动物。', '我还想了解：更多生态设施是怎么设计出来的。'],
    studentReply: '我学到了红树林里有很多不同的动物和植物。',
    tags: ['L 已完成', '收获已保存'],
    visual: '评价表',
    progress: '5/7',
    actionLabel: '提交评价',
  },
  {
    id: 'reward',
    phase: '成长奖励',
    title: '你完成了《小小生态公园设计师》研学活动',
    body: ['老师评价和研学报告已经生成。', '本次活动成长值奖励：+900。', '你的观察记录、记录表达、小组协作和方案创想能力数据已更新。'],
    studentReply: '评价完成，查看成长奖励。',
    tags: ['成长值 +900', '综合评价：良', '能力雷达更新'],
    visual: '成长奖励',
    progress: '6/7',
    actionLabel: '生成研学日记',
    secondaryActions: ['查看研学报告', '查看能力雷达'],
    reward: 900,
  },
  {
    id: 'diary-generate',
    phase: '研学日记',
    title: '研学日记素材已经整理好了',
    body: ['已收集：任务作品、观察照片和语音记录、小组生态设施设计方案、活动总结与评价、研学报告、成长值奖励和最新能力雷达。', '状态：可生成研学日记。'],
    studentReply: '生成研学日记。',
    tags: ['素材完整', '生成中 68%', '可保存'],
    visual: '日记素材',
    progress: '7/7',
    actionLabel: '保存研学日记',
    diaryReady: true,
  },
  {
    id: 'mainline-done',
    phase: '主线完成',
    title: '研学日记已保存，主线任务完成',
    body: ['标题：《我给“野朋友”设计了一个家》。', '日记包含观察照片、生态设施大搜索记录、小组方案、研学报告摘要、成长值奖励和能力雷达变化。', '这些内容已经整理到你的研学日记中。'],
    studentReply: '保存研学日记。',
    tags: ['主线完成', '研学日记已保存', '成长档案已更新'],
    visual: '任务闭环',
    progress: '7/7',
    actionLabel: '主线已完成',
  },
];

const duelInitialScore: DuelScore = { mine: 0, opponent: 0 };

const duelBattleRounds: DuelBattleRound[] = [
  {
    step: 1,
    questionId: 'duel-q1-choice',
    resultId: 'duel-r1-choice-result',
    kind: 'choice',
    questionTitle: '选择观察对象类型',
    prompt: '你这次想观察的是哪一类“野朋友”？',
    actionLabel: '选择动物',
    controls: ['选择动物', '选择植物', '不确定'],
    resultActionLabel: '进入 Step 2',
    answerSummary: '你选择了“动物”，系统已记录观察对象类型。',
    resultTitle: '观察对象已确认',
    feedback: '选择有效，能够明确本次任务观察方向。',
    score: { mine: 10, opponent: 9 },
    questionScore: 10,
    opponentQuestionScore: 9,
    metrics: [
      { label: '基础有效分', mine: 8, opponent: 8 },
      { label: '速度分', mine: 2, opponent: 1 },
      { label: '创意分', mine: 0, opponent: 0 },
      { label: '进步分', mine: 0, opponent: 0 },
    ],
  },
  {
    step: 2,
    questionId: 'duel-q2-photo',
    resultId: 'duel-r2-photo-result',
    kind: 'photo',
    questionTitle: '拍下野朋友',
    prompt: '请先拍下你发现的动物或植物，拍好后再提交照片。',
    actionLabel: '提交照片',
    controls: ['拍照', '从相册选择', '重新拍摄', '重新选择', '提交照片'],
    resultActionLabel: '进入 Step 3',
    answerSummary: '照片中有一只停在树枝上的小鸟，主体清晰。',
    resultTitle: '照片识别通过',
    feedback: '照片有效，可以作为本题答案。',
    score: { mine: 22, opponent: 24 },
    questionScore: 12,
    opponentQuestionScore: 15,
    metrics: [
      { label: '基础有效分', mine: 8, opponent: 8 },
      { label: '速度分', mine: 3, opponent: 5 },
      { label: '创意分', mine: 0, opponent: 1 },
      { label: '进步分', mine: 1, opponent: 1 },
    ],
  },
  {
    step: 3,
    questionId: 'duel-q3-voice',
    resultId: 'duel-r3-voice-result',
    kind: 'voice',
    questionTitle: '说出观察',
    prompt: '请先录音说说它在哪里、有什么特点，录好后再提交录音。',
    actionLabel: '提交录音',
    controls: ['录音', '重新录音', '提交录音'],
    resultActionLabel: '进入 Step 4',
    answerSummary: '语音 28 秒：它在水边的树枝上，周围有绿色叶子和水沟。',
    resultTitle: '语音观察已保存',
    feedback: '表达完整，能说清位置和观察到的特点。',
    score: { mine: 38, opponent: 42 },
    questionScore: 16,
    opponentQuestionScore: 18,
    metrics: [
      { label: '基础有效分', mine: 8, opponent: 8 },
      { label: '速度分', mine: 2, opponent: 4 },
      { label: '创意分', mine: 3, opponent: 3 },
      { label: '进步分', mine: 3, opponent: 3 },
    ],
  },
  {
    step: 4,
    questionId: 'duel-q4-form',
    resultId: 'duel-r4-form-result',
    kind: 'form',
    questionTitle: '确认关键信息',
    prompt: '请先整理物种、数量、地点、时间和语音摘要，再提交本题。',
    actionLabel: '提交本题',
    controls: ['AI 整理信息', '手动填写', '修改', '提交本题'],
    resultActionLabel: '进入 Step 5',
    answerSummary: '物种、地点、时间和语音摘要均已确认。',
    resultTitle: '任务记录已确认',
    feedback: '信息完整，记录可以进入任务卡档案。',
    score: { mine: 56, opponent: 58 },
    questionScore: 18,
    opponentQuestionScore: 16,
    metrics: [
      { label: '基础有效分', mine: 9, opponent: 8 },
      { label: '速度分', mine: 3, opponent: 4 },
      { label: '创意分', mine: 2, opponent: 1 },
      { label: '进步分', mine: 4, opponent: 3 },
    ],
  },
  {
    step: 5,
    questionId: 'duel-q5-relation',
    resultId: 'duel-r5-relation-result',
    kind: 'relation',
    questionTitle: '想一想生态关系',
    prompt: '它和周围环境有什么关系？可以先语音回答或文字输入，再提交回答。',
    actionLabel: '提交回答',
    controls: ['语音回答', '文字输入', '重新语音', '重新输入', '提交回答'],
    resultActionLabel: '进入 Step 6',
    answerSummary: '它在水沟附近停留，周围有水和植物，可能方便找食物和躲藏。',
    resultTitle: '生态关系回答通过',
    feedback: '你能把“野朋友”和环境联系起来，思考很棒。',
    score: { mine: 74, opponent: 72 },
    questionScore: 18,
    opponentQuestionScore: 14,
    metrics: [
      { label: '基础有效分', mine: 8, opponent: 7 },
      { label: '速度分', mine: 1, opponent: 2 },
      { label: '创意分', mine: 5, opponent: 3 },
      { label: '进步分', mine: 4, opponent: 2 },
    ],
  },
  {
    step: 6,
    questionId: 'duel-q6-summary',
    resultId: 'duel-r6-summary-result',
    kind: 'summary',
    questionTitle: '提交任务卡',
    prompt: '请先整理本次任务卡内容，确认后提交任务卡。',
    actionLabel: '提交任务卡',
    controls: ['整理任务卡', '补充一句', '重新整理', '提交任务卡'],
    resultActionLabel: '查看斗卡结果',
    answerSummary: '观察对象、照片、语音、信息和生态关系回答已全部提交。',
    resultTitle: '任务卡已提交',
    feedback: '任务完成度高，获得完成奖励分。',
    score: { mine: 92, opponent: 88 },
    questionScore: 18,
    opponentQuestionScore: 16,
    metrics: [
      { label: '基础有效分', mine: 7, opponent: 7 },
      { label: '速度分', mine: 1, opponent: 0 },
      { label: '创意分', mine: 4, opponent: 3 },
      { label: '进步分', mine: 6, opponent: 6 },
    ],
  },
];

const agentFlowDefinitions: Record<AgentFlowPage, AgentFlowDefinition> = {
  taskCardAgent: {
    page: 'taskCardAgent',
    mode: 'taskCard',
    navLabel: '任务卡',
    title: '任务卡执行',
    entryTitle: '任务卡执行',
    entryDesc: '按选项、拍照、语音、确认信息和关系问答一步步完成任务。',
    summaryLabel: '任务奖励',
    journeyLabels: ['选择', '拍照', '语音', '确认', '问答', '总结'],
    steps: [
      {
        id: 'task-question-type',
        phase: 'Step 1/6',
        title: '你这次想观察的是哪一类“野朋友”？',
        body: ['请先选择观察对象类型，我会根据你的选择安排下一步任务。'],
        tags: ['任务一：探访野朋友', '观察力', '科学思维'],
        actionLabel: '选择动物',
        secondaryActions: ['选择植物', '不确定'],
        progress: '1/6',
        widget: 'task-choice',
      },
      {
        id: 'task-choice-feedback',
        phase: 'Step 1/6',
        title: '已选择观察对象，下一步请拍下它',
        body: ['AI 小助手：我已经记录你的观察对象类型，接下来请拍下你发现的“野朋友”。', '选择观察对象已完成，获得 +5 成长值，观察力 +1。'],
        studentReply: '我已完成选择。',
        tags: ['AI 小助手', '+5 成长值', '观察力 +1'],
        actionLabel: '继续下一题',
        progress: '1/6',
        reward: 5,
        widget: 'task-feedback',
      },
      {
        id: 'task-photo-submit',
        phase: 'Step 2/6',
        title: '请拍下你发现的动物或植物',
        body: ['把观察对象放在画面中央，尽量拍清楚它的外形和周围环境。'],
        visual: '模拟取景',
        actionLabel: '提交本题',
        secondaryActions: ['拍照', '从相册选择', '重新拍摄'],
        progress: '2/6',
        widget: 'task-photo',
      },
      {
        id: 'task-photo-reject',
        phase: 'Step 2/6',
        title: '这看起来不像我们要找的“野朋友”哦',
        body: ['AI 小助手：照片里主要是石头和路面，没有清楚出现动物或植物。', '请仔细观察四周，重新拍摄一张符合任务要求的照片。'],
        tags: ['校验未通过', '请重拍'],
        actionLabel: '重新拍摄',
        progress: '2/6',
        widget: 'task-photo',
      },
      {
        id: 'task-photo-pass',
        phase: 'Step 2/6',
        title: '识别成功！这张照片可以作为本题答案',
        body: ['照片中有一只停在树枝上的小鸟，主体清晰，符合“探访野朋友”的任务要求。', '获得 +5 成长值。如果能说出它在哪里、有什么特点，还能获得更多加分。'],
        visual: '小鸟照片',
        tags: ['AI 检查通过', '+5 成长值'],
        actionLabel: '继续语音描述',
        progress: '2/6',
        reward: 5,
        widget: 'task-photo',
      },
      {
        id: 'task-voice-answer',
        phase: 'Step 3/6',
        title: '请说说它在哪里、有什么特点',
        body: ['你可以按住语音键描述观察结果，也可以修改转写文字后再提交。'],
        studentReply: '我看到它在水边的树枝上，叶子是绿色的，长在靠近水沟的地方。',
        actionLabel: '接受回答',
        secondaryActions: ['重新录音'],
        progress: '3/6',
        widget: 'task-voice',
      },
      {
        id: 'task-info-confirm',
        phase: 'Step 4/6',
        title: '请确认这次观察的关键信息',
        body: ['我已经根据照片和语音帮你整理好了记录，确认无误后提交本题。'],
        tags: ['可修改', '任务记录'],
        actionLabel: '提交本题',
        secondaryActions: ['修改文字'],
        progress: '4/6',
        widget: 'task-form',
      },
      {
        id: 'task-relation-question',
        phase: 'Step 5/6',
        title: '它和周围环境有什么关系？',
        body: ['可以从食物、水源、树木、躲藏、人类活动几个方向思考。'],
        studentReply: '它在水沟附近的树枝上停留，周围有水和植物，可能方便找食物和躲藏。',
        actionLabel: '提交回答',
        secondaryActions: ['语音回答', '文字输入'],
        progress: '5/6',
        widget: 'task-relation',
      },
      {
        id: 'task-ai-summary',
        phase: 'Step 6/6',
        title: '你把“野朋友”和环境联系起来了',
        body: ['AI 小助手：你能说出观察对象、地点、特点和环境关系，回答更完整了。', '本题获得 +8 成长值，科学思维 +1。'],
        tags: ['记录已保存', '+8 成长值', '科学思维 +1'],
        actionLabel: '查看任务结算',
        progress: '6/6',
        reward: 8,
        widget: 'task-feedback',
      },
      {
        id: 'task-settlement',
        phase: '完成',
        title: '太棒了，你完成了这张任务卡',
        body: ['综合评分：A+，超过同年级 82% 的同学。', '你提交了 1 张动物照片、录制了 28 秒观察语音，并能把动物和周围环境联系起来。'],
        tags: ['A+', '+50 成长值', '卡包已点亮'],
        actionLabel: '查看卡包',
        secondaryActions: ['发起斗卡'],
        progress: '完成',
        reward: 50,
        widget: 'settlement',
      },
    ],
  },
  cardBagAgent: {
    page: 'cardBagAgent',
    mode: 'cards',
    navLabel: '卡包',
    title: '任务卡包',
    entryTitle: '任务卡包与我的卡包',
    entryDesc: '查看全部任务、已完成、待补充、斗卡挑战和卡片图鉴。',
    summaryLabel: '卡包状态',
    journeyLabels: ['任务列表', '筛选', '卡包', '图鉴'],
    steps: [
      {
        id: 'cardbag-list',
        phase: '任务列表',
        title: '这里是你所有的任务卡',
        body: ['任务分为全部任务、已完成、待补充和斗卡挑战。', '每张任务卡都会提示状态和还可以获得多少成长值。'],
        tags: ['全部任务', '待补充', '斗卡挑战'],
        actionLabel: '筛选待补充',
        widget: 'card-bag',
      },
      {
        id: 'cardbag-filter',
        phase: '筛选',
        title: '待补充任务已筛出',
        body: ['昆虫旅馆线索需要补一段语音说明。', '补充后可以进入我的卡包点亮更完整的卡面。'],
        studentReply: '我想先看看我的卡包。',
        tags: ['待补充 1', '可得 +15'],
        actionLabel: '进入我的卡包',
        widget: 'card-bag',
      },
      {
        id: 'cardbag-mine',
        phase: '卡包',
        title: '每一张卡，都是你探索世界的足迹',
        body: ['累计获得 36 张卡片，A+ 高分卡 5 张，完成任务 12 次，斗卡胜利 8 次。', '最近获得：探访“野朋友”卡。'],
        tags: ['累计 36', 'A+ 5', '斗卡胜利 8'],
        actionLabel: '查看生态探索系列',
        widget: 'card-bag',
      },
      {
        id: 'cardbag-series',
        phase: '图鉴',
        title: '生态探索系列 3/5',
        body: ['已点亮：探访野朋友、昆虫旅馆线索、生态设施大搜索。', '未点亮：生态设施创想、环保讲解员。'],
        tags: ['系列 3/5', '图鉴点亮'],
        actionLabel: '卡包已完成',
        widget: 'card-bag',
      },
    ],
  },
  duelAgent: {
    page: 'duelAgent',
    mode: 'duel',
    navLabel: '斗卡',
    title: '斗卡挑战',
    entryTitle: '斗卡挑战',
    entryDesc: '从邀请、规则到 6 道任务逐题答题、单题结果、总结果和排行榜。',
    summaryLabel: '斗卡分数',
    journeyLabels: ['邀请', '规则', '答题', '结果', '排名'],
    steps: [
      {
        id: 'duel-invite',
        phase: '邀请',
        title: '小宇向你发起了任务斗卡邀请',
        body: ['小宇邀请你挑战【任务一：探访“野朋友”】。', '你们会完成同一套 6 个问题，然后系统计算综合 PK 分。'],
        tags: ['发起人 A', '成长值 1280', '累计卡片 36'],
        actionLabel: '接受斗卡',
        secondaryActions: ['稍后'],
        widget: 'duel',
      },
      {
        id: 'duel-rules',
        phase: '规则',
        title: '综合斗卡规则',
        body: ['斗卡不是只比谁快，而是根据每道题的特点计算综合表现。', '单题得分 = 基础有效分 + 速度分 + 创意分 + 进步分。'],
        tags: ['基础有效分', '速度分', '创意分', '进步分'],
        actionLabel: '开始斗卡',
        widget: 'duel',
      },
      ...duelBattleRounds.flatMap((round): AgentFlowStep[] => [
        {
          id: round.questionId,
          phase: `Step ${round.step}/6`,
          title: round.questionTitle,
          body: [round.prompt],
          tags: ['任务一：探访野朋友', '实时斗卡', '未出结果'],
          actionLabel: round.actionLabel,
          secondaryActions: round.controls.filter((action) => action !== round.actionLabel),
          progress: `Step ${round.step}/6`,
          widget: 'duel',
        },
        {
          id: round.resultId,
          phase: `Step ${round.step} 结果`,
          title: round.resultTitle,
          body: [round.feedback, round.answerSummary],
          tags: [`本题 ${round.questionScore}/20`, `你 ${round.score.mine}`, `小宇 ${round.score.opponent}`],
          actionLabel: round.resultActionLabel,
          progress: `Step ${round.step} 结果`,
          widget: 'duel',
        },
      ]),
      {
        id: 'duel-result',
        phase: '斗卡完成',
        title: '你赢了',
        body: ['任务一：探访“野朋友”已完成 6/6 步。', '你的综合 PK 分 92 分，小宇 88 分，本次获得 +50 成长值。'],
        tags: ['92 分', 'A 评级', '+50 成长值'],
        actionLabel: '查看完整排行榜',
        secondaryActions: ['再挑战一次', '邀请其他好友', '查看完成态任务卡', '返回任务卡组'],
        reward: 50,
        widget: 'duel',
      },
      {
        id: 'duel-rank',
        phase: '排名',
        title: '斗卡排行榜',
        body: ['任务一：探访“野朋友”当前参与 8 人。', '你当前排名第 2 名，综合 PK 分 92 分，评级 A，累计成长值 980。'],
        actionLabel: '再挑战一次',
        secondaryActions: ['邀请好友', '查看我的累计卡片', '返回任务主相'],
        widget: 'duel',
      },
    ],
  },
  abilityAgent: {
    page: 'abilityAgent',
    mode: 'ability',
    navLabel: '能力',
    title: '能力测试',
    entryTitle: '能力测试',
    entryDesc: '用 3 道情境题补充观察、表达、思考和协作能力。',
    summaryLabel: '能力画像',
    journeyLabels: ['邀请', '题目', '评分', '建议'],
    steps: [
      {
        id: 'ability-intro',
        phase: '邀请',
        title: '我还不太了解你的能力特点',
        body: ['要不要和我做一个 3 分钟小测试？', '这不是考试，只是帮我更懂你。'],
        tags: ['3 分钟', '不是考试'],
        actionLabel: '开始能力测试',
        widget: 'ability',
      },
      {
        id: 'ability-q1',
        phase: '题目',
        title: '题目 1：看到陌生植物时你会怎么做？',
        body: ['请先选择最像自己的做法，我会把你的选择整理成回答。', '提交后进入下一题。'],
        actionLabel: '提交第 1 题',
        widget: 'ability',
      },
      {
        id: 'ability-q2',
        phase: '题目',
        title: '题目 2：小组意见不同时你会怎么做？',
        body: ['请选择你会怎么处理小组意见分歧。', '提交后会记录协作和表达维度。'],
        actionLabel: '提交第 2 题',
        widget: 'ability',
      },
      {
        id: 'ability-q3',
        phase: '题目',
        title: '题目 3：你发现答案不确定时会怎么做？',
        body: ['请选择你面对不确定答案时的做法。', '提交后我会生成能力雷达。'],
        actionLabel: '提交第 3 题',
        widget: 'ability',
      },
      {
        id: 'ability-result',
        phase: '评分',
        title: '能力雷达已生成',
        body: ['观察 92，表达 84，协作 88，科学思维 86。', '你很适合担任记录员和观察员。'],
        tags: ['观察强项', '表达提升'],
        actionLabel: '查看成长建议',
        widget: 'ability',
      },
      {
        id: 'ability-advice',
        phase: '建议',
        title: '给你的成长建议',
        body: ['继续练习把观察说完整：在哪里、看到了什么、为什么重要。', '我会推荐更适合你的自然观察任务。'],
        actionLabel: '能力测试完成',
        widget: 'ability',
      },
    ],
  },
  talentAgent: {
    page: 'talentAgent',
    mode: 'talent',
    navLabel: '天赋',
    title: '天赋探索',
    entryTitle: '天赋测试',
    entryDesc: '通过情境问答和行为观察，发现潜在优势方向。',
    summaryLabel: '潜力方向',
    journeyLabels: ['邀请', '情境', '偏好', '潜力'],
    steps: [
      {
        id: 'talent-intro',
        phase: '邀请',
        title: '我还不知道你可能擅长什么',
        body: ['要不要做一个有趣的小探索？', '我会通过几个情境问题，帮你发现自己的潜力方向。'],
        actionLabel: '开始天赋探索',
        widget: 'talent',
      },
      {
        id: 'talent-scene',
        phase: '情境',
        title: '如果小组要做生态展板，你最想负责什么？',
        body: ['你可以选择一个或两个最想负责的部分。', '提交后我会继续结合任务表现判断。'],
        actionLabel: '提交情境题',
        widget: 'talent',
      },
      {
        id: 'talent-behavior',
        phase: '偏好',
        title: '我结合你的任务行为一起判断',
        body: ['请先让我整理你在任务里的表现，确认后再生成潜力方向。', '这些内容会影响天赋判断。'],
        actionLabel: '提交偏好',
        widget: 'talent',
      },
      {
        id: 'talent-result',
        phase: '潜力',
        title: '你的潜力方向：自然观察讲解员',
        body: ['优势：细节观察、证据整理、愿意表达。', '建议：多练习把发现讲给别人听。'],
        tags: ['自然观察', '讲解表达', '证据整理'],
        actionLabel: '推荐智能体',
        widget: 'talent',
      },
      {
        id: 'talent-agent',
        phase: '潜力',
        title: '推荐智能体：生态讲解员',
        body: ['它会陪你练习把观察讲清楚。', '也会推荐“环保讲解员”挑战任务。'],
        actionLabel: '天赋探索完成',
        widget: 'talent',
      },
    ],
  },
  interestAgent: {
    page: 'interestAgent',
    mode: 'interest',
    navLabel: '兴趣',
    title: '兴趣确认',
    entryTitle: '兴趣爱好',
    entryDesc: '根据拍摄、提问和选择确认兴趣标签，并推荐任务。',
    summaryLabel: '兴趣标签',
    journeyLabels: ['选择', '确认', '推荐'],
    steps: [
      {
        id: 'interest-select',
        phase: '选择',
        title: '我还不知道你喜欢探索什么',
        body: ['请先选几个方向，我会根据你的选择推荐任务和智能体。'],
        actionLabel: '提交兴趣选择',
        widget: 'interest',
      },
      {
        id: 'interest-evidence',
        phase: '确认',
        title: '我发现你最近拍了很多植物和昆虫',
        body: ['你也问了很多“生态设施有什么用”的问题。', '你是不是对自然观察感兴趣？'],
        actionLabel: '提交自然观察确认',
        secondaryActions: ['忽略推荐'],
        widget: 'interest',
      },
      {
        id: 'interest-robot',
        phase: '确认',
        title: '你也问过几个机器人问题',
        body: ['如果你愿意，我也可以把“机器人”加入兴趣。', '后续会推荐 AI 创作和科学课程。'],
        actionLabel: '提交机器人确认',
        secondaryActions: ['暂不加入', '稍后再说'],
        widget: 'interest',
      },
      {
        id: 'interest-result',
        phase: '推荐',
        title: '兴趣标签已更新',
        body: ['已加入：自然观察、机器人、绘画创作。', '我会优先推荐自然观察任务、生态讲解员和机器人课程。'],
        tags: ['自然观察', '机器人', '绘画创作'],
        actionLabel: '兴趣确认完成',
        widget: 'interest',
      },
    ],
  },
  profileAgent: {
    page: 'profileAgent',
    mode: 'profile',
    navLabel: '画像',
    title: '成长画像',
    entryTitle: '成长画像',
    entryDesc: '聚合能力、天赋和兴趣，形成儿童友好的成长画像。',
    summaryLabel: '画像完成度',
    journeyLabels: ['聚合', '画像', '推荐'],
    steps: [
      {
        id: 'profile-collect',
        phase: '聚合',
        title: '我正在整理你的成长画像',
        body: ['画像会聚合能力测试、天赋探索、兴趣标签和研学任务表现。', '我会根据这些结果推荐更适合你的任务和智能体。'],
        tags: ['能力', '天赋', '兴趣', '任务表现'],
        actionLabel: '查看画像摘要',
        widget: 'profile',
      },
      {
        id: 'profile-summary',
        phase: '画像',
        title: '成长画像摘要',
        body: ['你是偏自然观察和证据整理型的探索者。', '强项：观察、协作。成长建议：继续提升公开表达。'],
        tags: ['观察强', '协作强', '表达提升'],
        actionLabel: '生成推荐',
        widget: 'profile',
      },
      {
        id: 'profile-recommend',
        phase: '推荐',
        title: '给你的下一步推荐',
        body: ['推荐任务：环保讲解员挑战。', '推荐智能体：生态讲解员、AI 识物专家、自然日记助手。'],
        actionLabel: '成长画像完成',
        widget: 'profile',
      },
    ],
  },
  diaryAgent: {
    page: 'diaryAgent',
    mode: 'diary',
    navLabel: '日记',
    title: '研学日记',
    entryTitle: '研学日记',
    entryDesc: '从素材清单到 AI 初稿、补充感受和保存日记。',
    summaryLabel: '日记状态',
    journeyLabels: ['素材', '初稿', '补充', '保存'],
    steps: [
      {
        id: 'diary-material',
        phase: '素材',
        title: '本次研学素材已经整理好了',
        body: ['素材包含任务作品、观察照片、语音记录、小组生态设施方案、研学报告摘要、成长值和能力雷达。'],
        tags: ['照片', '语音', '小组方案', '研学报告'],
        actionLabel: '生成日记初稿',
        widget: 'diary',
      },
      {
        id: 'diary-draft',
        phase: '初稿',
        title: 'AI 初稿已生成',
        body: ['标题：《我给“野朋友”设计了一个家》。', '正文已经包含观察发现、生态设施大搜索、小组设计方案和成长收获。'],
        actionLabel: '补充我的感受',
        widget: 'diary',
      },
      {
        id: 'diary-feeling',
        phase: '补充',
        title: '补充感受已加入',
        body: ['你补充：我发现城市里也有很多给动物生活的空间。', '这句话会放在日记结尾。'],
        studentReply: '保存这篇日记。',
        actionLabel: '保存研学日记',
        widget: 'diary',
      },
      {
        id: 'diary-save',
        phase: '保存',
        title: '研学日记已保存',
        body: ['日记已同步到成长档案。', '后续可在“我的”和“研学日记”应用中查看。'],
        tags: ['已保存', '成长档案'],
        actionLabel: '日记流程完成',
        widget: 'diary',
      },
    ],
  },
};

const agentFlowPages = Object.keys(agentFlowDefinitions) as AgentFlowPage[];

function createInitialAgentFlowIndexes() {
  return Object.fromEntries(agentFlowPages.map((page) => [page, 0])) as Record<AgentFlowPage, number>;
}

function createInitialAgentFlowMessages() {
  return Object.fromEntries(agentFlowPages.map((page) => [page, [agentFlowDefinitions[page].steps[0]]])) as Record<AgentFlowPage, AgentFlowStep[]>;
}

function createInitialAgentFlowCompleted() {
  return Object.fromEntries(agentFlowPages.map((page) => [page, false])) as Record<AgentFlowPage, boolean>;
}

function createInitialDuelBattleDraftState(): DuelBattleDraftState {
  return {
    choice: null,
    photoMode: 'idle',
    voiceMode: 'idle',
    formMode: 'idle',
    relationMode: 'idle',
    summaryMode: 'idle',
    summaryNote: '',
  };
}

function isAgentFlowPage(page: AgentPage): page is AgentFlowPage {
  return page !== 'home' && page !== 'mainlineChat';
}

function renderMainlineStepWidget(step: MainlineChatStep, growthValue: number) {
  switch (step.id) {
    case 'prepare':
    case 'prepare-safety':
    case 'prepare-team':
    case 'prepare-kwl-k':
    case 'prepare-done':
      return (
        <div className="mainline-widget mainline-widget-prep">
          {['活动说明', '安全提醒', '小组信息', 'K/W 表'].map((label, index) => (
            <div key={label} className={`mainline-mini-tile ${index <= 2 || step.id === 'prepare-done' ? 'done' : ''}`}>
              <strong>{label}</strong>
              <span>{index === 0 ? '确认活动目标' : index === 1 ? '遵守行动边界' : index === 2 ? '明确分工' : '记录想知道的内容'}</span>
            </div>
          ))}
        </div>
      );
    case 'wild-start':
    case 'wild-photo':
    case 'wild-voice':
    case 'wild-submit':
      return (
        <div className="mainline-widget mainline-widget-observe">
          <div className="mainline-observe-hero">
            <strong>野朋友观察包</strong>
            <span>照片 · 语音 · 地点 · 时间</span>
          </div>
          <div className="mainline-mini-grid">
            <div className="mainline-mini-tile done">
              <strong>拍照</strong>
              <span>记录动物或植物</span>
            </div>
            <div className="mainline-mini-tile">
              <strong>语音</strong>
              <span>补充观察说明</span>
            </div>
            <div className="mainline-mini-tile">
              <strong>地点</strong>
              <span>公园路径与区域</span>
            </div>
          </div>
        </div>
      );
    case 'facility-start':
    case 'facility-capsule':
    case 'facility-record':
    case 'facility-submit': {
      const completedCapsules = step.id === 'facility-submit' ? 10 : step.id === 'facility-record' ? 4 : step.id === 'facility-capsule' ? 1 : 0;
      const facilityRecords = [
        { label: '昆虫旅馆', desc: '帮助昆虫躲藏和栖息' },
        { label: '生态路灯', desc: '减少对夜行动物干扰' },
        { label: '本杰士堆', desc: '给小动物提供庇护' },
      ];
      return (
        <div className="mainline-widget mainline-widget-capsules">
          <div className="mainline-observe-hero">
            <strong>10 个锦囊</strong>
            <span>{completedCapsules}/10 已记录</span>
          </div>
          <div className="capsule-strip" aria-label="锦囊进度">
            {Array.from({ length: 10 }, (_, index) => (
              <i key={index} className={index < completedCapsules ? 'done' : index === completedCapsules ? 'current' : ''}>
                {index + 1}
              </i>
            ))}
          </div>
          <div className="facility-clue-card">
            <span>当前线索</span>
            <strong>{step.id === 'facility-submit' ? '10 个锦囊全部完成' : '找到能服务动物生活的生态设施'}</strong>
            <p>{step.id === 'facility-submit' ? '这些设施记录会作为任务三创想的素材。' : '拍摄设施照片，并用一句话说明它帮助了哪些生物。'}</p>
          </div>
          <div className="facility-record-list">
            {facilityRecords.map((item, index) => (
              <div key={item.label} className={index < Math.max(1, Math.min(completedCapsules, 3)) ? 'done' : ''}>
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'design-start':
    case 'design-spec':
    case 'design-image':
    case 'design-submit': {
      const designDoneCount = step.id === 'design-submit' ? 4 : step.id === 'design-image' ? 3 : step.id === 'design-spec' ? 2 : 1;
      return (
        <div className="mainline-widget mainline-widget-design">
          <div className="design-flow-line" aria-label="方案进度">
            {['物种', '问题', '设计图', '说明'].map((label, index) => (
              <span key={label} className={index < designDoneCount ? 'done' : index === designDoneCount ? 'current' : ''}>
                {label}
              </span>
            ))}
          </div>
          <div className="mainline-design-board">
            <div>
              <span>目标物种</span>
              <strong>鸟类</strong>
            </div>
            <div>
              <span>设施名称</span>
              <strong>鸟类观察休息架</strong>
            </div>
            <div>
              <span>预期作用</span>
              <strong>停留、休息、观察</strong>
            </div>
          </div>
          <div className={`design-blueprint ${step.id === 'design-image' || step.id === 'design-submit' ? 'ready' : ''}`}>
            <i className="perch" />
            <i className="sign" />
            <i className="path" />
            <span>{step.id === 'design-image' || step.id === 'design-submit' ? 'AI 设计图' : '方案草图'}</span>
          </div>
          <div className="mainline-design-note">{step.id === 'design-image' ? 'AI 设计图已生成，支持重新生成和补充方案说明。' : step.id === 'design-submit' ? '设计图、目标物种、设施作用和方案说明都已整理。' : '小组合作填写问题发现、设施名称、目标物种和预期作用。'}</div>
        </div>
      );
    }
    case 'summary-start':
    case 'summary-evaluation':
      return (
        <div className="mainline-widget mainline-widget-summary">
          <div className="mainline-checklist">
            {['我的收获', '我还想了解', '学生自评', '同学互评', '小组自评'].map((label, index) => (
              <div key={label} className={`mainline-checkitem ${index < (step.id === 'summary-evaluation' ? 5 : 2) ? 'done' : ''}`}>
                <strong>{label}</strong>
                <span>{index < 2 ? '已填写' : '待确认'}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'reward':
      return (
        <div className="mainline-widget mainline-widget-reward">
          <div className="mainline-reward-score">
            <span>成长值奖励</span>
            <strong>+900</strong>
            <p>老师评价和研学报告已生成，能力雷达也已经更新。</p>
          </div>
          <div className="reward-report-card">
            <strong>研学报告摘要</strong>
            <span>综合评价：良</span>
            <p>能完整记录观察证据，并能和小组一起把发现转化成设计方案。</p>
          </div>
          <div className="reward-radar-mini">
            {[
              ['观察', 92],
              ['表达', 84],
              ['协作', 88],
              ['创造', 86],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <i>
                  <b style={{ width: `${value}%` }} />
                </i>
                <em>{value}</em>
              </div>
            ))}
          </div>
          <div className="mainline-reward-tags">
            <span>观察 +8</span>
            <span>表达 +6</span>
            <span>协作 +7</span>
            <span>创造 +5</span>
            <span>总成长值 {growthValue}</span>
          </div>
        </div>
      );
    case 'diary-generate':
    case 'mainline-done':
      return (
        <div className="mainline-widget mainline-widget-diary">
          <div className="mainline-diary-card">
            <span>{step.id === 'mainline-done' ? '已保存' : '生成中 68%'}</span>
            <strong>《我给“野朋友”设计了一个家》</strong>
            <p>已整理任务作品、观察照片、语音记录、小组方案、成长值和能力雷达变化。</p>
          </div>
          <div className="diary-material-grid">
            {['观察照片', '设施锦囊', '小组方案', '研学报告'].map((item, index) => (
              <span key={item} className={step.id === 'mainline-done' || index < 3 ? 'done' : ''}>
                {item}
              </span>
            ))}
          </div>
          <div className="mainline-diary-lines">
            <i className={step.id === 'mainline-done' ? 'done' : 'current'}>素材</i>
            <i className={step.id === 'mainline-done' ? 'done' : 'current'}>生成</i>
            <i className={step.id === 'mainline-done' ? 'done' : ''}>保存</i>
          </div>
        </div>
      );
    default:
      return null;
  }
}

const cardCollection = [
  { title: '探访野朋友', series: '生态探索', grade: 'A', status: '已点亮' },
  { title: '昆虫旅馆线索', series: '生态设施', grade: 'A+', status: '待补充语音' },
  { title: '生态设施创想', series: '小组设计', grade: 'B+', status: '小组共创中' },
  { title: '环保讲解员', series: '表达挑战', grade: '未点亮', status: '完成日记后推荐' },
];

const apps: MockApp[] = [
  {
    key: 'tasks',
    title: '任务',
    short: '任',
    group: '研学主线',
    accent: 'orange',
    asset: '/design/apps/01_任务_任务卡列表与执行.png',
    summary: '承接老师、家长、专家或位置触发的任务卡，按 Agent 步骤完成采集、校验和提交。',
    states: ['全部 / 待完成 / 待补充 / 斗卡挑战', '任务执行工作台：选项、拍照、语音、信息确认、关系问答', '完成页：评分、成长值、卡包、日记、斗卡'],
    actions: ['开始任务', '查看卡包', '发起斗卡'],
  },
  {
    key: 'capture',
    title: '拍拍',
    short: '拍',
    group: '观察采集',
    accent: 'orange',
    asset: '/design/apps/02_拍拍_拍照采集与转发.png',
    summary: '拍照键单击进入，完成照片采集后可交给任务、识物、问问或日记。',
    states: ['拍照 / 预览 / 重拍 / 保存', '照片可转发到当前任务和 AI 识物', 'AI 模拟判断照片是否符合任务要求'],
    actions: ['拍照', '重拍', '提交任务'],
  },
  {
    key: 'ask',
    title: '问问',
    short: '问',
    group: 'AI 提问',
    accent: 'blue',
    asset: '/design/apps/03_问问_上下文提问.png',
    summary: '基于当前页面、任务、课程或照片上下文回答孩子的问题，并支持多轮追问。',
    states: ['语音键单击或长按进入', '任务上下文问答', '关键回答可转为闪记或日记素材'],
    actions: ['语音提问', '继续追问', '保存答案'],
  },
  {
    key: 'flash',
    title: '闪记',
    short: '记',
    group: '快速记录',
    accent: 'green',
    asset: '/design/apps/04_闪记_语音与视频记录.png',
    summary: '双击语音键做语音闪记，双击拍照键做视频闪记，保存现场灵感。',
    states: ['语音闪记自动转文字', '视频闪记保留预览和删除', '闪记可关联任务、课程和研学日记'],
    actions: ['语音闪记', '视频闪记', '关联日记'],
  },
  {
    key: 'messages',
    title: '消息',
    short: '消',
    group: '通知',
    accent: 'blue',
    asset: '/design/apps/05_消息_通知与广播.png',
    summary: '聚合团队广播、小组广播、系统、家庭和订阅消息，并可直达对应业务。',
    states: ['高优先级广播自动语音播报一次', '未读数量同步到顶部状态栏', '消息可跳转任务、团队、课程或广场'],
    actions: ['查看消息', '重听广播', '跳转处理'],
  },
  {
    key: 'growth',
    title: '成长',
    short: '长',
    group: '成长画像',
    accent: 'orange',
    asset: '/design/apps/06_成长_能力指数与成长值.png',
    summary: '展示成长值、能力指数、最近成长记录、能力/天赋/兴趣轻测试。',
    states: ['成长值累计、可用和明细', '能力雷达与成长建议', '画像测试完成后推荐任务和智能体'],
    actions: ['看成长', '做测试', '领徽章'],
  },
  {
    key: 'team',
    title: '团队',
    short: '队',
    group: '研学组织',
    accent: 'purple',
    asset: '/design/apps/07_团队_小组与手册.png',
    summary: '查看当前团队、小组、岗位、研学手册、排行和评价。',
    states: ['当前团队与小组角色', '研学手册、安全规则、集合提醒', '团队成果汇总和小组提交'],
    actions: ['看小组', '打开手册', '提交成果'],
  },
  {
    key: 'diary',
    title: '研学日记',
    short: '日',
    group: '成长资产',
    accent: 'blue',
    asset: '/design/apps/08_研学日记_AI生成日记.png',
    summary: '查看主线生成的研学日记、素材归档、草稿和成长档案同步状态。',
    states: ['素材归档范围', '主线日记草稿与补充记录', '保存后沉淀到个人成长档案'],
    actions: ['查看归档', '整理素材', '同步档案'],
  },
  {
    key: 'identify',
    title: 'AI识物',
    short: '识',
    group: 'AI 能力',
    accent: 'green',
    asset: '/design/apps/09_AI识物_照片识别.png',
    summary: '识别照片中的动植物、设施或物品，并支持继续追问和任务回填。',
    states: ['拍照后可自动送入识物', '识别结果展示名称、特征和观察建议', '回填任务题目作为过程证据'],
    actions: ['拍照识别', '继续追问', '加入作品'],
  },
  {
    key: 'create',
    title: 'AI创作',
    short: '创',
    group: 'AI 能力',
    accent: 'purple',
    asset: '/design/apps/10_AI创作_绘画与视频.png',
    summary: '承载 AI 绘画和 AI 视频，支持从照片、草图或语音提示生成作品。',
    states: ['AI 绘画支持模板、底图和语音提示词', 'AI 视频支持图片转短视频', '作品可保存、分享、提交任务'],
    actions: ['AI绘画', 'AI视频', '提交作品'],
  },
  {
    key: 'courses',
    title: '课程',
    short: '课',
    group: '学习',
    accent: 'blue',
    asset: '/design/apps/11_课程_断点续播与课程闪记.png',
    summary: '查看课程并支持断点续播、课程闪记、专家伴学和课后任务。',
    states: ['音频/视频课程播放', '课程中可问专家', '闪记自动关联课程章节位置'],
    actions: ['继续播放', '课程闪记', '课后任务'],
  },
  {
    key: 'plaza',
    title: '广场',
    short: '广',
    group: 'Agent 广场',
    accent: 'purple',
    asset: '/design/apps/12_广场_专家智能体广场.png',
    summary: '专家智能体广场，提供专家伴学、课程、资讯和难题挑战。',
    states: ['专家分类：科技、文艺、健康、成长、创作', '近期使用和添加到桌面', '专家智能体可进入课程或挑战'],
    actions: ['找专家', '参加活动', '看成果'],
  },
  {
    key: 'chat',
    title: '聊天',
    short: '聊',
    group: '社交',
    accent: 'cyan',
    asset: '/design/apps/13_聊天_微聊与群聊.png',
    summary: '微聊和群聊统一入口，支持文字、语音、图片和任务卡分享。',
    states: ['同学好友可微聊', '小组群聊共享任务进度', 'AI 安全提醒敏感词和陌生人边界'],
    actions: ['微聊', '群聊', '分享任务'],
    safety: '好友和群聊能力需遵循家长或老师授权边界。',
  },
  {
    key: 'friends',
    title: '好友',
    short: '友',
    group: '社交',
    accent: 'blue',
    asset: '/design/apps/14_好友_添加好友与斗卡.png',
    summary: '查看好友、添加好友、发起电话、微聊、对讲或斗卡。',
    states: ['研学宝 ID、手机号、碰一碰加好友演示', '好友确认后才建立关系', '从好友发起斗卡挑战'],
    actions: ['添加好友', '查看好友', '发起斗卡'],
    safety: '加好友需对方确认，并可配置家长授权。',
  },
  {
    key: 'moments',
    title: '朋友圈',
    short: '圈',
    group: '社交',
    accent: 'purple',
    asset: '/design/apps/15_朋友圈_研学动态发布.png',
    summary: '发布和查看研学动态，支持点赞、收藏、评论和转发演示。',
    states: ['从相册、任务作品和日记选择素材', '发布前展示可见范围', '支持老师或家长审核口径'],
    actions: ['发动态', '看评论', '设权限'],
    safety: '公开发布需标注审核或授权状态。',
  },
  {
    key: 'wallet',
    title: '支付',
    short: '¥',
    group: '生活',
    accent: 'orange',
    asset: '/design/apps/16_支付_亲子卡付款码.png',
    summary: '展示家长授权的亲子卡付款码、余额和消费记录。',
    states: ['付款码默认遮罩，确认后展示模拟码', '余额和交易记录本地 mock', '不在设备端绑定真实支付卡'],
    actions: ['付款码', '余额', '消费记录'],
    safety: '支付必须由家长授权，原型只做受控演示。',
  },
  {
    key: 'cloud',
    title: '网盘',
    short: '云',
    group: '资料',
    accent: 'blue',
    asset: '/design/apps/17_网盘_文件分类与预览.png',
    summary: '查看研学宝 ID 自动关联的云端文件和家庭授权网盘内容。',
    states: ['图片、音频、视频、PDF 和电子书分类', '素材可转发任务或日记', '原型展示本地 mock 分类浏览'],
    actions: ['看文件', '搜索', '转发'],
  },
  {
    key: 'meeting',
    title: '会议',
    short: '会',
    group: '协作',
    accent: 'cyan',
    asset: '/design/apps/18_会议_对讲与AI纪要.png',
    summary: '创建会议或对讲，适合小组讨论和远程协作。',
    states: ['会议内长按语音键对讲', '结束后生成 AI 纪要演示', '纪要可发送群聊或加入任务'],
    actions: ['发起对讲', '生成纪要', '同步任务'],
  },
  {
    key: 'me',
    title: '我的',
    short: '我',
    group: '个人中心',
    accent: 'blue',
    asset: '/design/apps/19_我的_个人中心.png',
    summary: '个人主页，聚合账号、课程、报告、证书、日记和收藏。',
    states: ['沿用旧版个人中心业务能力', '课程、报告、证书、日记、收藏入口保留', '支持切换账号和进入设置'],
    actions: ['看资料', '成长档案', '设备信息'],
  },
  {
    key: 'sos',
    title: 'SOS',
    short: '!',
    group: '安全',
    accent: 'red',
    asset: '/design/apps/20_SOS_安全报警.png',
    summary: '拍照键 + 语音键长按触发 SOS，发送位置、录音和报警文字。',
    states: ['高优先级红色入口', '同时通知导师和家长', '原型展示确认态、倒计时和已发送态'],
    actions: ['长按报警', '上报定位', '联系老师'],
    safety: '安全功能不做游戏化奖励，触发前保留二次确认。',
  },
  {
    key: 'settings',
    title: '设置',
    short: '设',
    group: '系统',
    accent: 'gray',
    asset: '/design/apps/21_设置_设备绑定与权限.png',
    summary: '设备绑定、锁屏密码、人脸识别、支付卡授权和账号切换。',
    states: ['保留租赁和销售模式配置', '展示设备码和家长扫码绑定', '权限、网络、电量、存储和版本诊断'],
    actions: ['设备绑定', '权限设置', '系统检测'],
    safety: '敏感设置需要确认、返回和异常提示。',
  },
];

const runtimeProfiles: Record<string, Partial<AppRuntime>> = {
  tasks: {
    headline: '任务卡执行工作台',
    metric: '5 步主线',
    progress: 64,
    primary: '当前任务卡已关联地点、队伍、工具和成长值。',
    secondary: '每一步都能把拍拍、问问、闪记和 AI 校验串起来，完成后沉淀到卡包和日记。',
    feed: [
      { tag: '待完成', title: '生态设施大搜索', desc: '拍摄一个生态设施，说明它服务的动物或植物。' },
      { tag: '待补充', title: '昆虫旅馆线索', desc: '需要补一段语音，解释设施作用。' },
      { tag: '已完成', title: '研学前准备', desc: '地点、分组、安全告知和 KWL 表已确认。' },
    ],
  },
  capture: {
    headline: '拍拍采集台',
    metric: '3 张照片',
    progress: 55,
    primary: '相机预览、重拍、保存和提交任务都用本地状态模拟。',
    secondary: '照片不会上传，只会在当前原型内进入任务、识物或日记素材池。',
    feed: [
      { tag: '预览', title: '红树林栈道照片', desc: 'AI 模拟判断：画面清晰，设施主体完整。' },
      { tag: '任务', title: '生态设施大搜索', desc: '可作为第 4 个锦囊的过程证据。' },
      { tag: '日记', title: '今日最佳观察图', desc: '已加入日记候选素材。' },
    ],
  },
  ask: {
    headline: '上下文问问',
    metric: '多轮追问',
    progress: 66,
    primary: '围绕当前任务、照片、课程和团队上下文做多轮追问演示。',
    secondary: '回答可以一键保存到闪记、日记或任务记录。',
    feed: [
      { tag: '孩子', title: '为什么这里要放昆虫旅馆？', desc: '来自当前生态设施任务。' },
      { tag: '研小宝', title: '它能给小动物提供休息空间', desc: '独居蜂、瓢虫等小动物可以在孔洞里休息或繁殖。' },
      { tag: '追问', title: '我可以怎样改良它？', desc: '建议补充遮雨结构、分层孔洞和观察说明牌。' },
    ],
  },
  flash: {
    headline: '闪记收纳盒',
    metric: '12 条素材',
    progress: 62,
    primary: '用语音和视频快速保存现场灵感，自动转成日记素材。',
    secondary: '每条闪记都能关联任务、课程章节或小组讨论。',
  },
  messages: {
    headline: '消息处理中心',
    metric: '2 未读',
    progress: 72,
    primary: '团队广播、小组广播、系统、家庭和订阅消息按优先级聚合。',
    secondary: '高优先级广播只模拟播报，不做真实推送。',
  },
  growth: {
    headline: '成长画像中心',
    metric: '成长值 320',
    progress: 76,
    primary: '成长值、能力指数、测试结果和徽章都来自本地任务状态。',
    secondary: '画像结果会反向影响 Agent 的推荐话术和任务建议。',
  },
  team: {
    headline: '蓝翼观察队',
    metric: '6 人小组',
    progress: 68,
    primary: '展示小组角色、集合提醒、安全手册和成果提交进度。',
    secondary: '团队数据全部本地 mock，适合业务方演示组织协同流程。',
  },
  diary: {
    headline: '研学日记归档台',
    metric: '12 条素材',
    progress: 74,
    primary: '查看主线沉淀的任务作品、照片、语音、老师评价和成长值变化。',
    secondary: '应用中心只做素材归档、草稿查看和成长档案同步，不单独发起生成流程。',
  },
  identify: {
    headline: '照片识物台',
    metric: '89% 可信',
    progress: 82,
    primary: '模拟识别动植物、设施和物品，输出名称、特征和观察建议。',
    secondary: '识别结果可回填任务或加入作品，不会调用真实模型。',
  },
  create: {
    headline: 'AI 创作工作室',
    metric: '3 秒 生成',
    progress: 58,
    primary: '从照片、草图或语音提示词生成绘画和短视频作品。',
    secondary: '所有生成结果是预置 mock，不调用图片或视频生成接口。',
  },
  courses: {
    headline: '课程伴学播放器',
    metric: '12:35 / 32:00',
    progress: 46,
    primary: '支持断点续播、课程闪记、专家伴学和课后任务。',
    secondary: '播放进度和章节记录只存在当前浏览器状态里。',
  },
  plaza: {
    headline: '专家 Agent 广场',
    metric: '5 类专家',
    progress: 52,
    primary: '按科技、文艺、健康、成长、创作展示专家智能体。',
    secondary: '添加桌面和参加活动都是前端演示状态。',
  },
  chat: {
    headline: '微聊与群聊',
    metric: '4 条新消息',
    progress: 56,
    primary: '文字、语音、图片和任务卡分享都在本地模拟。',
    secondary: '社交能力默认展示老师/家长授权边界和安全提醒。',
  },
  friends: {
    headline: '好友与斗卡',
    metric: '8 好友',
    progress: 64,
    primary: '支持添加好友、查看好友、电话、微聊、对讲和斗卡入口。',
    secondary: '加好友流程保留确认态，不自动建立关系。',
  },
  moments: {
    headline: '研学朋友圈',
    metric: '3 待审核',
    progress: 44,
    primary: '发布研学动态、查看评论、设置可见范围。',
    secondary: '公开发布前保留审核或授权标识。',
  },
  wallet: {
    headline: '亲子卡支付演示',
    metric: '余额 128.80',
    progress: 38,
    primary: '付款码默认遮罩，点击付款码后只展示模拟码。',
    secondary: '不绑定真实支付卡，不创建交易，不离开前端。',
  },
  cloud: {
    headline: '研学资料网盘',
    metric: '42 文件',
    progress: 58,
    primary: '图片、音频、视频、PDF 和电子书分类浏览演示。',
    secondary: '文件记录是本地数组，不上传、不下载。',
  },
  meeting: {
    headline: '对讲会议室',
    metric: '3 人在线',
    progress: 50,
    primary: '小组对讲、会议记录和 AI 纪要生成演示。',
    secondary: '纪要可同步任务或群聊，但只更新本地反馈。',
  },
  me: {
    headline: '个人中心',
    metric: '资料 100%',
    progress: 78,
    primary: '聚合账号、课程、报告、证书、日记、收藏和设备信息。',
    secondary: '继续沿用旧版个人中心能力，但用手表化布局呈现。',
  },
  sos: {
    headline: 'SOS 安全报警',
    metric: '未触发',
    progress: 0,
    primary: '长按报警后进入二次确认，再模拟发送位置、录音和报警文字。',
    secondary: '安全功能不做游戏化奖励，不做真实外呼或上报。',
  },
  settings: {
    headline: '设备与权限设置',
    metric: '3 项配置',
    progress: 70,
    primary: '设备绑定、锁屏密码、人脸识别、支付授权和账号切换。',
    secondary: '所有开关只改变本地 UI 状态，不写入系统设置。',
  },
};

const actionResultProfiles: Record<string, Record<string, AppActionResult>> = {
  wallet: {
    付款码: { title: '模拟付款码已展示', desc: '码值 YXB-PAY-260323，仅用于演示，不可支付。' },
    余额: { title: '余额明细已展开', desc: '亲子卡余额 128.80，今日消费 16.00。' },
    消费记录: { title: '消费记录已筛选', desc: '展示最近 3 天的餐饮、文创店、课程材料三条 mock 记录。' },
  },
  sos: {
    长按报警: { title: '进入 SOS 二次确认', desc: '防误触确认已打开，再次点击可模拟发送。' },
    上报定位: { title: '位置包已生成', desc: '深圳福田红树林生态公园 · 北区栈道，等待确认发送。' },
    联系老师: { title: '老师联系卡已打开', desc: '展示带队老师、生活老师和家长联系人。' },
  },
  settings: {
    设备绑定: { title: '设备绑定信息', desc: 'YXB-DEV-0001，租赁设备，家长扫码绑定已模拟通过。' },
    权限设置: { title: '权限开关已更新', desc: '人脸、支付、定位权限均为本地开关演示。' },
    系统检测: { title: '系统检测完成', desc: '网络、电量、存储、版本和按键状态均为正常 mock。' },
  },
};

const fullAppPageProfiles: Record<string, FullAppPageProfile> = {
  tasks: {
    focus: '任务从领取到结算全流程',
    tabs: [
      { label: '任务卡', desc: '查看当前、待补充和已完成任务' },
      { label: '执行', desc: '串联拍拍、问问、闪记和 AI 校验' },
      { label: '结算', desc: '查看评分、成长值、卡包和斗卡入口' },
    ],
    metrics: [
      { label: '主线进度', value: '3/5', desc: '小小生态公园设计师' },
      { label: '待补充', value: '1', desc: '昆虫旅馆语音说明' },
      { label: '成长值', value: '+160', desc: '完成任务后本地累加' },
    ],
    records: [
      { tag: '进行中', title: '生态设施大搜索', desc: '第 4 个锦囊已通过照片校验，等待补充用途说明。' },
      { tag: '待补充', title: '昆虫旅馆线索', desc: '需要 15 秒语音说明目标物种和设施作用。' },
      { tag: '已完成', title: '研学前准备', desc: '地点、队伍、安全规则和 KWL 表已确认。' },
    ],
    agentTips: ['优先完成当前任务卡，不建议孩子在任务中频繁跳应用。', '任务完成后自动推荐卡包、日记和斗卡，不做真实接口提交。'],
  },
  capture: {
    focus: '照片采集与任务转发',
    tabs: [
      { label: '拍照', desc: '模拟取景、主体提示和按键触发' },
      { label: '预览', desc: '支持重拍、保存和清晰度提示' },
      { label: '转发', desc: '送入任务、AI识物或研学日记' },
    ],
    metrics: [
      { label: '照片', value: '3', desc: '当前活动素材' },
      { label: '清晰度', value: '92', desc: '本地 mock 评分' },
      { label: '关联', value: '2', desc: '任务与日记' },
    ],
    records: [
      { tag: '最新', title: '红树林栈道照片', desc: '主体完整，可作为生态设施大搜索证据。' },
      { tag: '重拍', title: '水鸟观察图', desc: '距离过远，Agent 建议靠近后重新拍摄。' },
      { tag: '已转发', title: '昆虫旅馆照片', desc: '已加入 AI 识物和研学日记候选素材。' },
    ],
    agentTips: ['拍照后先展示预览，再让孩子选择用途。', '原型只展示本地预览图，不上传真实照片。'],
  },
  ask: {
    focus: '基于上下文的多轮问答',
    tabs: [
      { label: '语音问', desc: '单击或长按语音键进入' },
      { label: '追问', desc: '围绕任务、照片和课程继续追问' },
      { label: '保存', desc: '把答案转为闪记或日记素材' },
    ],
    metrics: [
      { label: '对话', value: '6', desc: '当前任务上下文' },
      { label: '保存', value: '2', desc: '可沉淀为素材' },
      { label: '安全', value: '已开', desc: '儿童问答边界提示' },
    ],
    records: [
      { tag: '孩子', title: '为什么要有昆虫旅馆？', desc: '来自生态设施任务上下文。' },
      { tag: '研小宝', title: '给小动物提供休息和繁殖空间', desc: '回答会提示孩子继续观察孔洞、材质和位置。' },
      { tag: '保存', title: '改良建议已存入闪记', desc: '可在日记生成时作为想法素材。' },
    ],
    agentTips: ['问问默认带任务上下文，不需要孩子重复描述背景。', '所有答案为预置 mock 文案，不调用真实大模型。'],
  },
  flash: {
    focus: '语音与视频灵感速记',
    tabs: [
      { label: '语音', desc: '双击语音键创建语音闪记' },
      { label: '视频', desc: '双击拍照键创建视频闪记' },
      { label: '整理', desc: '关联任务、课程和日记' },
    ],
    metrics: [
      { label: '素材', value: '12', desc: '本地闪记总数' },
      { label: '转写', value: '9', desc: '语音已转文字' },
      { label: '待整理', value: '3', desc: '需确认归属' },
    ],
    records: [
      { tag: '语音', title: '我想给昆虫旅馆加遮雨棚', desc: '已转文字，可加入创想任务。' },
      { tag: '视频', title: '小组讨论 18 秒', desc: '可生成会议纪要或日记素材。' },
      { tag: '课程', title: '红树林小课堂摘记', desc: '关联课程第 2 章 12:35。' },
    ],
    agentTips: ['闪记是低打断记录方式，适合户外移动中使用。', '演示里只保存到前端状态，不写入云端。'],
  },
  messages: {
    focus: '广播、家庭和系统通知处理',
    tabs: [
      { label: '未读', desc: '按优先级展示待处理消息' },
      { label: '广播', desc: '老师和团队消息可重听' },
      { label: '跳转', desc: '直达任务、团队、课程或广场' },
    ],
    metrics: [
      { label: '未读', value: '2', desc: '任务与家庭留言' },
      { label: '广播', value: '1', desc: '安全提醒' },
      { label: '高优先级', value: '1', desc: '集合提醒' },
    ],
    records: [
      { tag: '老师', title: '集合时间提前 5 分钟', desc: '已模拟语音播报一次。' },
      { tag: '任务', title: '生态设施大搜索待完成', desc: '点击可进入任务卡执行。' },
      { tag: '家庭', title: '家长留言', desc: '活动结束后讲一件最有趣的发现。' },
    ],
    agentTips: ['通知中心解决“现在该做什么”，不是普通消息列表。', '高优先级广播只在本地模拟播报，不做真实推送。'],
  },
  growth: {
    focus: '成长值、能力画像与轻测试',
    tabs: [
      { label: '成长值', desc: '累计、可用和明细' },
      { label: '能力', desc: '观察、表达、协作、创造' },
      { label: '测试', desc: '能力、天赋、兴趣轻测试' },
    ],
    metrics: [
      { label: '成长值', value: '320', desc: '完成任务后变化' },
      { label: '最高能力', value: '观察', desc: '86 分' },
      { label: '画像', value: '72%', desc: '待完成兴趣题' },
    ],
    records: [
      { tag: '能力', title: '观察能力 +8', desc: '来自探访野朋友任务。' },
      { tag: '徽章', title: '生态观察员', desc: '完成 3 次有效观察后点亮。' },
      { tag: '测试', title: '兴趣轻测试待完成', desc: '完成后推荐智能体和任务。' },
    ],
    agentTips: ['成长反馈要短、正向、可行动。', '成长数据来自当前原型本地任务进度。'],
  },
  team: {
    focus: '小组组织、手册与成果协作',
    tabs: [
      { label: '小组', desc: '成员、岗位和集合状态' },
      { label: '手册', desc: '研学手册和安全规则' },
      { label: '成果', desc: '小组提交与互评' },
    ],
    metrics: [
      { label: '成员', value: '6', desc: '蓝翼观察队' },
      { label: '岗位', value: '记录员', desc: '当前学生角色' },
      { label: '成果', value: '2/3', desc: '待提交设计图' },
    ],
    records: [
      { tag: '岗位', title: '小明同学 · 记录员', desc: '负责语音闪记和最终方案说明。' },
      { tag: '安全', title: '不离开小组活动范围', desc: '已在手册中置顶。' },
      { tag: '成果', title: '昆虫旅馆方案待补图', desc: '提醒摄影员补充草图照片。' },
    ],
    agentTips: ['团队页要让孩子知道自己的岗位和下一步。', '小组成果提交是本地 mock 状态，不联动真实课堂。'],
  },
  diary: {
    focus: '研学日记素材归档与成长资产沉淀',
    tabs: [
      { label: '素材', desc: '照片、语音、任务和评价' },
      { label: '草稿', desc: '主线生成稿和补充记录' },
      { label: '归档', desc: '保存到成长档案' },
    ],
    metrics: [
      { label: '素材', value: '12', desc: '候选记录' },
      { label: '草稿', value: '1', desc: '来自主线流程' },
      { label: '字数', value: '286', desc: '儿童短文长度' },
    ],
    records: [
      { tag: '照片', title: '红树林栈道照片', desc: '作为日记开头观察图。' },
      { tag: '语音', title: '昆虫旅馆改良想法', desc: '已转写为创意段落。' },
      { tag: '评价', title: '老师评价：观察认真', desc: '可放在成长反思中。' },
    ],
    agentTips: ['日记生成入口收回到主线最后一步。', '这里仅展示素材、草稿和成长档案同步状态。'],
  },
  identify: {
    focus: '照片识别、解释与任务回填',
    tabs: [
      { label: '识别', desc: '动植物、设施和物品' },
      { label: '解释', desc: '名称、特征和观察建议' },
      { label: '回填', desc: '加入任务证据或作品' },
    ],
    metrics: [
      { label: '可信度', value: '89%', desc: '预置识别结果' },
      { label: '建议', value: '3', desc: '继续观察方向' },
      { label: '回填', value: '1', desc: '任务证据' },
    ],
    records: [
      { tag: '识别', title: '昆虫旅馆', desc: '生态设施，常用于提供昆虫栖息空间。' },
      { tag: '特征', title: '木质结构和多层孔洞', desc: '适合引导孩子观察材质和位置。' },
      { tag: '任务', title: '已回填生态设施大搜索', desc: '成为第 4 个锦囊证据。' },
    ],
    agentTips: ['识物结果要提示“可能是”，避免绝对化。', '本页不调用图片识别接口，只展示 mock 识别链路。'],
  },
  create: {
    focus: 'AI 绘画、视频与作品提交',
    tabs: [
      { label: '绘画', desc: '从照片、草图或语音生成' },
      { label: '视频', desc: '图片转短视频预览' },
      { label: '作品', desc: '保存、分享和提交任务' },
    ],
    metrics: [
      { label: '作品', value: '4', desc: '当前创作草稿' },
      { label: '模板', value: '6', desc: '生态主题模板' },
      { label: '提交', value: '1', desc: '小组方案候选' },
    ],
    records: [
      { tag: '绘画', title: '未来昆虫旅馆', desc: '由语音提示词生成的示意图。' },
      { tag: '视频', title: '生态公园一分钟介绍', desc: '使用照片序列模拟生成短视频。' },
      { tag: '提交', title: '小组设计方案', desc: '可作为生态设施创想任务作品。' },
    ],
    agentTips: ['创作页强调孩子表达意图，而不是炫技。', '生成图和视频均为预置演示，不请求生成接口。'],
  },
  courses: {
    focus: '课程续播、专家伴学与课后任务',
    tabs: [
      { label: '播放', desc: '音视频课程断点续播' },
      { label: '伴学', desc: '课程中向专家提问' },
      { label: '任务', desc: '课后任务与课程闪记' },
    ],
    metrics: [
      { label: '进度', value: '39%', desc: '12:35 / 32:00' },
      { label: '闪记', value: '2', desc: '课程内记录' },
      { label: '任务', value: '1', desc: '课后待完成' },
    ],
    records: [
      { tag: '续播', title: '红树林为什么重要', desc: '从 12:35 继续播放。' },
      { tag: '专家', title: '生态导师回答已保存', desc: '解释潮间带和候鸟关系。' },
      { tag: '任务', title: '课后观察题', desc: '拍摄一种生态设施并说明作用。' },
    ],
    agentTips: ['课程页应允许孩子边听边记。', '播放器、进度和闪记均为本地模拟。'],
  },
  plaza: {
    focus: '专家智能体广场与活动挑战',
    tabs: [
      { label: '专家', desc: '科技、文艺、健康、成长、创作' },
      { label: '活动', desc: '主题挑战和任务推荐' },
      { label: '桌面', desc: '近期使用和添加入口' },
    ],
    metrics: [
      { label: '专家', value: '5 类', desc: '主题分类' },
      { label: '最近', value: '3', desc: '常用智能体' },
      { label: '挑战', value: '2', desc: '可参加活动' },
    ],
    records: [
      { tag: '生态', title: '红树林小导师', desc: '推荐给当前研学任务。' },
      { tag: '创作', title: '自然绘本助手', desc: '可辅助 AI 创作作品。' },
      { tag: '挑战', title: '一日生态讲解员', desc: '完成后可获得表达徽章。' },
    ],
    agentTips: ['广场是能力扩展入口，主屏仍负责主动调度。', '添加桌面只改变前端展示状态。'],
  },
  chat: {
    focus: '微聊、群聊与任务卡分享',
    tabs: [
      { label: '微聊', desc: '好友一对一消息' },
      { label: '群聊', desc: '小组进度和任务讨论' },
      { label: '安全', desc: '授权边界和敏感提醒' },
    ],
    metrics: [
      { label: '新消息', value: '4', desc: '群聊 3 条，好友 1 条' },
      { label: '群组', value: '2', desc: '小组与课程' },
      { label: '授权', value: '老师', desc: '群聊可用' },
    ],
    records: [
      { tag: '群聊', title: '蓝翼观察队', desc: '队友提醒补拍设施说明牌。' },
      { tag: '微聊', title: '小鱼同学', desc: '分享了一张水鸟观察图。' },
      { tag: '任务卡', title: '生态设施大搜索', desc: '可发送到小组群讨论。' },
    ],
    agentTips: ['社交能力必须展示老师或家长授权边界。', '聊天演示仅本地消息气泡，不建立真实通信。'],
  },
  friends: {
    focus: '好友、添加确认与斗卡挑战',
    tabs: [
      { label: '好友', desc: '列表、电话、微聊和对讲' },
      { label: '添加', desc: 'ID、手机号、碰一碰' },
      { label: '斗卡', desc: '从好友发起挑战' },
    ],
    metrics: [
      { label: '好友', value: '8', desc: '已确认关系' },
      { label: '申请', value: '1', desc: '等待对方确认' },
      { label: '斗卡', value: '2', desc: '今日挑战' },
    ],
    records: [
      { tag: '好友', title: '小鱼同学', desc: '可微聊、对讲或发起斗卡。' },
      { tag: '申请', title: '碰一碰添加小竹', desc: '等待对方确认。' },
      { tag: '挑战', title: '环保讲解员斗卡', desc: '胜负取决于任务作品评分。' },
    ],
    agentTips: ['添加好友不能自动成功，需要确认态。', '斗卡是任务成果延展，不鼓励无意义刷分。'],
  },
  moments: {
    focus: '研学动态发布与可见范围',
    tabs: [
      { label: '动态', desc: '查看点赞、收藏和评论' },
      { label: '发布', desc: '选择照片、任务作品和日记' },
      { label: '权限', desc: '审核、可见范围和授权标识' },
    ],
    metrics: [
      { label: '动态', value: '5', desc: '本次研学' },
      { label: '评论', value: '3', desc: '老师与同学' },
      { label: '待审核', value: '1', desc: '公开可见前' },
    ],
    records: [
      { tag: '发布', title: '我的昆虫旅馆发现', desc: '素材来自任务照片和闪记。' },
      { tag: '评论', title: '老师：说明很清楚', desc: '可沉淀为成长反馈。' },
      { tag: '权限', title: '仅小组和家长可见', desc: '公开发布需审核。' },
    ],
    agentTips: ['发布前必须让孩子看到可见范围。', '朋友圈数据为本地 mock，不上传真实动态。'],
  },
  wallet: {
    focus: '家长授权亲子卡支付',
    tabs: [
      { label: '付款码', desc: '默认遮罩，确认后展示模拟码' },
      { label: '余额', desc: '查看亲子卡余额和限额' },
      { label: '记录', desc: '展示本地消费记录' },
    ],
    metrics: [
      { label: '余额', value: '128.80', desc: '家长授权额度' },
      { label: '今日消费', value: '16.00', desc: '文创店 mock' },
      { label: '限额', value: '30.00', desc: '单日可用' },
    ],
    records: [
      { tag: '消费', title: '生态明信片', desc: '8.00，已计入今日消费。' },
      { tag: '消费', title: '研学贴纸', desc: '8.00，家长授权范围内。' },
      { tag: '安全', title: '付款码遮罩', desc: '点击按钮后才展示 YXB-PAY-260323。' },
    ],
    agentTips: ['支付演示必须明确“不可真实支付”。', '不绑定卡、不扣费、不创建交易。'],
  },
  cloud: {
    focus: '资料分类浏览与素材转发',
    tabs: [
      { label: '分类', desc: '图片、音频、视频、PDF 和电子书' },
      { label: '搜索', desc: '按课程、任务和日期筛选' },
      { label: '转发', desc: '送入任务、日记或聊天' },
    ],
    metrics: [
      { label: '文件', value: '42', desc: '本地资料库' },
      { label: '图片', value: '18', desc: '研学照片' },
      { label: '可转发', value: '6', desc: '任务素材' },
    ],
    records: [
      { tag: '图片', title: '红树林照片集', desc: '18 张，按时间排序。' },
      { tag: 'PDF', title: '生态设施观察手册', desc: '可从团队手册跳转。' },
      { tag: '音频', title: '课程闪记合集', desc: '可生成研学日记素材。' },
    ],
    agentTips: ['网盘页重点是分类、预览、转发三件事。', '文件列表为本地数组，不上传下载。'],
  },
  meeting: {
    focus: '小组对讲、会议记录与 AI 纪要',
    tabs: [
      { label: '对讲', desc: '长按语音键说话' },
      { label: '纪要', desc: '结束后生成本地 mock 纪要' },
      { label: '同步', desc: '发送群聊或加入任务' },
    ],
    metrics: [
      { label: '在线', value: '3', desc: '小组成员' },
      { label: '时长', value: '04:20', desc: '本次讨论' },
      { label: '行动项', value: '2', desc: '补图与说明' },
    ],
    records: [
      { tag: '对讲', title: '昆虫旅馆方案讨论', desc: '记录员已发言 2 次。' },
      { tag: '纪要', title: '需要补充遮雨结构', desc: '已整理为行动项。' },
      { tag: '同步', title: '发送到蓝翼观察队群聊', desc: '本地状态已模拟完成。' },
    ],
    agentTips: ['会议页适合展示“讨论变行动项”。', '不创建真实音视频会议。'],
  },
  me: {
    focus: '个人资料、成长档案与设备信息',
    tabs: [
      { label: '资料', desc: '头像、昵称、研学宝 ID' },
      { label: '档案', desc: '课程、报告、证书、日记、收藏' },
      { label: '设备', desc: '设备码、模式和设置入口' },
    ],
    metrics: [
      { label: '资料', value: '100%', desc: '演示账号完整' },
      { label: '日记', value: '8', desc: '成长资产' },
      { label: '证书', value: '3', desc: '活动成果' },
    ],
    records: [
      { tag: '账号', title: '小明同学', desc: '蓝翼观察队 · 记录员。' },
      { tag: '报告', title: '生态研学成长报告', desc: '可从成长页进入。' },
      { tag: '设备', title: 'YXB-DEV-0001', desc: '租赁模式，家长已扫码绑定。' },
    ],
    agentTips: ['个人中心保留旧版能力，用手表化布局重排。', '账号切换和设备信息只做本地演示。'],
  },
  sos: {
    focus: '组合键安全报警与二次确认',
    tabs: [
      { label: '触发', desc: '拍照键 + 语音键长按' },
      { label: '确认', desc: '防误触倒计时确认' },
      { label: '通知', desc: '老师、生活老师和家长' },
    ],
    metrics: [
      { label: '状态', value: '未触发', desc: '点击后变更本地状态' },
      { label: '联系人', value: '3', desc: '通知路由' },
      { label: '位置包', value: '就绪', desc: '模拟定位文本' },
    ],
    records: [
      { tag: '路由', title: '带队老师', desc: '第一通知对象。' },
      { tag: '路由', title: '生活老师', desc: '第二通知对象。' },
      { tag: '路由', title: '家长', desc: '同步接收本地 mock 报警文字。' },
    ],
    agentTips: ['安全功能不做游戏化，不给奖励。', 'SOS 不外呼、不发短信、不上报真实位置。'],
  },
  settings: {
    focus: '设备绑定、权限和系统检测',
    tabs: [
      { label: '绑定', desc: '设备码、家长扫码和设备模式' },
      { label: '权限', desc: '人脸、支付、定位开关' },
      { label: '检测', desc: '网络、电量、存储和版本' },
    ],
    metrics: [
      { label: '设备码', value: '0001', desc: 'YXB-DEV-0001' },
      { label: '权限', value: '3 项', desc: '本地开关' },
      { label: '检测', value: '正常', desc: '模拟结果' },
    ],
    records: [
      { tag: '绑定', title: '家长扫码已通过', desc: '租赁模式初始化完成。' },
      { tag: '权限', title: '定位权限已开启', desc: '支付授权可单独关闭。' },
      { tag: '系统', title: '版本 2.0.0-agent', desc: '网络、电量和存储均正常。' },
    ],
    agentTips: ['敏感设置必须有确认、返回和异常提示。', '设置开关只影响当前前端状态。'],
  },
};

const defaultActionResult: AppActionResult = {
  title: '本地流程已推进',
  desc: '当前应用状态、记录和底部语音反馈已在前端 mock 中更新。',
};

function getFullAppPageProfile(app: MockApp): FullAppPageProfile {
  return (
    fullAppPageProfiles[app.key] ?? {
      focus: `${app.title}完整本地演示页面`,
      tabs: app.states.map((state) => ({ label: state.slice(0, 4), desc: state })),
      metrics: [
        { label: '状态', value: `${app.states.length}`, desc: '本地页面分区' },
        { label: '操作', value: `${app.actions.length}`, desc: '可点击动作' },
        { label: '模式', value: 'Mock', desc: '前端演示' },
      ],
      records: app.states.map((state, index) => ({
        tag: index === 0 ? '入口' : index === 1 ? '流程' : '结果',
        title: state,
        desc: `${app.title}的本地业务记录。`,
      })),
      agentTips: ['此页面只使用本地 mock 数据。', '后续接口联调另行输出技术方案。'],
    }
  );
}

function getAppRuntime(app: MockApp): AppRuntime {
  const profile = runtimeProfiles[app.key] ?? {};
  return {
    headline: profile.headline ?? `${app.title}工作台`,
    metric: profile.metric ?? `${app.states.length} 个状态 · ${app.actions.length} 个操作`,
    progress: profile.progress ?? 52,
    primary: profile.primary ?? app.summary,
    secondary: profile.secondary ?? '这里展示入口、状态、操作结果和 Agent 提醒，全程不调用接口。',
    feed:
      profile.feed ??
      app.states.map((state, index) => ({
        tag: index === 0 ? '状态' : index === 1 ? '流程' : '结果',
        title: state,
        desc: `${app.title}的第 ${index + 1} 个本地 mock 节点，可通过操作按钮继续推进。`,
      })),
  };
}

function getActionResult(app: MockApp, action: string, sosStatus?: SosStatus): AppActionResult {
  if (app.key === 'sos' && action === '长按报警' && sosStatus === 'sent') {
    return { title: 'SOS 已模拟发送', desc: '位置、录音片段和报警文字已写入本地 mock 状态。' };
  }
  return actionResultProfiles[app.key]?.[action] ?? { ...defaultActionResult, title: `${app.title} · ${action}` };
}

const screenLabels: Record<ScreenKey, string> = {
  notice: '通知',
  growth: '成长',
  agent: '主屏',
  apps: '应用',
};

function nextScreen(current: ScreenKey, direction: 1 | -1) {
  const index = screenOrder.indexOf(current);
  return screenOrder[Math.max(0, Math.min(screenOrder.length - 1, index + direction))];
}

function formatStep(index: number, total: number) {
  return `${index + 1}/${total}`;
}

export default function DeviceAgentShellPage() {
  const [authStage, setAuthStage] = useState<AuthStage>('device');
  const [initMode, setInitMode] = useState<InitMode>('rental');
  const [authCode, setAuthCode] = useState('');
  const [scanAuthed, setScanAuthed] = useState(false);
  const [loginIntent, setLoginIntent] = useState<'login' | 'add-account'>('login');
  const [selectedAccount, setSelectedAccount] = useState(demoAccounts[0]);
  const [phone, setPhone] = useState(demoAccounts[0].phone);
  const [password, setPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');
  const [faceStatus, setFaceStatus] = useState<FaceStatus>('ready');
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('agent');
  const [activeMode, setActiveMode] = useState<AgentMode>('task');
  const [agentPage, setAgentPage] = useState<AgentPage>('home');
  const [homePushTrigger, setHomePushTrigger] = useState<HomeTriggerKey>('mainline');
  const [mainlineStepIndex, setMainlineStepIndex] = useState(0);
  const [mainlineMessages, setMainlineMessages] = useState<MainlineChatStep[]>([mainlineChatSteps[0]]);
  const [mainlineGrowthReward, setMainlineGrowthReward] = useState(0);
  const [mainlineCompleted, setMainlineCompleted] = useState(false);
  const [agentFlowStepIndexes, setAgentFlowStepIndexes] = useState<Record<AgentFlowPage, number>>(() => createInitialAgentFlowIndexes());
  const [agentFlowMessages, setAgentFlowMessages] = useState<Record<AgentFlowPage, AgentFlowStep[]>>(() => createInitialAgentFlowMessages());
  const [agentFlowCompleted, setAgentFlowCompleted] = useState<Record<AgentFlowPage, boolean>>(() => createInitialAgentFlowCompleted());
  const [agentFlowGrowthReward, setAgentFlowGrowthReward] = useState(0);
  const [activeAppKey, setActiveAppKey] = useState('tasks');
  const [appPage, setAppPage] = useState<AppPage>('center');
  const [activeAppAction, setActiveAppAction] = useState('打开应用');
  const [appStages, setAppStages] = useState<Record<string, number>>({});
  const [appActionLog, setAppActionLog] = useState<AppActionLog[]>([]);
  const [walletCodeVisible, setWalletCodeVisible] = useState(false);
  const [sosStatus, setSosStatus] = useState<SosStatus>('idle');
  const [settingsToggles, setSettingsToggles] = useState<SettingsToggles>({ face: true, pay: false, location: true });
  const [profileDone, setProfileDone] = useState(false);
  const [lastAction, setLastAction] = useState('研小宝已就绪，可点击任务卡开始探索。');
  const touchStartX = useRef<number | null>(null);

  const activeApp = useMemo(() => apps.find((app) => app.key === activeAppKey) ?? apps[0], [activeAppKey]);
  const activeRuntime = useMemo(() => getAppRuntime(activeApp), [activeApp]);
  const activeActionResult = useMemo(() => getActionResult(activeApp, activeAppAction, sosStatus), [activeApp, activeAppAction, sosStatus]);
  const profileCompletion = Math.min(
    92,
    68 +
      (agentFlowCompleted.abilityAgent ? 6 : 0) +
      (agentFlowCompleted.talentAgent ? 6 : 0) +
      (agentFlowCompleted.interestAgent ? 6 : 0) +
      (agentFlowCompleted.profileAgent || profileDone ? 8 : 0),
  );
  const growthValue = 320 + mainlineGrowthReward + agentFlowGrowthReward;

  function finishDeviceInit() {
    if (initMode === 'rental' && authCode !== '260323') {
      setLoginError('请输入 6 位体验授权码 260323。');
      return;
    }
    if (initMode === 'scan' && !scanAuthed) {
      setScanAuthed(true);
      setLoginError('扫码授权已通过，请再次确认进入学员登录。');
      return;
    }
    setLoginError('');
    setAuthStage('student');
  }

  function selectDemoAccount(account: (typeof demoAccounts)[number]) {
    setSelectedAccount(account);
    setPhone(account.phone);
    setPassword('123456');
    setLoginError('');
  }

  function submitAccountLogin() {
    if (!/^1\d{10}$/.test(phone) || password !== '123456') {
      setLoginError('手机号或密码错误。演示密码为 123456。');
      return;
    }
    setLoginError('');
    setSelectedAccount(demoAccounts.find((item) => item.phone === phone) ?? demoAccounts[0]);
    setAuthStage('main');
  }

  function startFaceLogin() {
    if (faceStatus === 'success') {
      setAuthStage('main');
      return;
    }
    setFaceStatus('scanning');
    window.setTimeout(() => setFaceStatus('success'), 620);
  }

  function openMainlineChat() {
    setAgentPage('mainlineChat');
    setActiveScreen('agent');
    setActiveMode('task');
    setLastAction('已进入主线对话页。');
  }

  function selectHomePush(trigger: HomeTriggerKey) {
    const modeMap: Record<HomeTriggerKey, AgentMode> = {
      mainline: 'task',
      taskCards: 'taskCard',
      duel: 'duel',
      growthProfile: 'ability',
    };
    const copy: Record<HomeTriggerKey, string> = {
      mainline: '主线',
      taskCards: '任务卡片',
      duel: '斗卡',
      growthProfile: '能力',
    };
    setHomePushTrigger(trigger);
    setAgentPage('home');
    setActiveScreen('agent');
    setActiveMode(modeMap[trigger]);
    setLastAction(`研小宝已推送「${copy[trigger]}」相关任务卡。`);
  }

  function closeMainlineChat() {
    setAgentPage('home');
    setLastAction('已返回主屏。');
  }

  function openAgentFlow(page: AgentFlowPage) {
    const definition = agentFlowDefinitions[page];
    setAgentPage(page);
    setActiveScreen('agent');
    setActiveMode(definition.mode);
    setLastAction(`已进入「${definition.navLabel}」流程。`);
  }

  function restartAgentFlow(page: AgentFlowPage) {
    const definition = agentFlowDefinitions[page];
    setAgentFlowCompleted((current) => ({ ...current, [page]: false }));
    setAgentFlowStepIndexes((current) => ({ ...current, [page]: 0 }));
    setAgentFlowMessages((current) => ({ ...current, [page]: [definition.steps[0]] }));
    setAgentPage(page);
    setActiveScreen('agent');
    setActiveMode(definition.mode);
    setLastAction(`已重新开始「${definition.navLabel}」流程。`);
  }

  function closeAgentFlow() {
    setAgentPage('home');
    setLastAction('已返回主屏。');
  }

  function completeAgentFlowSideEffects(page: AgentFlowPage) {
    if (page === 'abilityAgent' || page === 'talentAgent' || page === 'interestAgent' || page === 'profileAgent') {
      setProfileDone(true);
    }
  }

  function advanceAgentFlow(page: AgentFlowPage, actionLabel: string) {
    const definition = agentFlowDefinitions[page];
    if (agentFlowCompleted[page]) {
      if (page === 'taskCardAgent') {
        if (actionLabel === '查看卡包') {
          openAgentFlow('cardBagAgent');
          setLastAction('已从任务卡进入卡包。');
          return;
        }

        if (actionLabel === '发起斗卡') {
          openAgentFlow('duelAgent');
          setLastAction('已从任务卡发起斗卡。');
          return;
        }
      }

      setLastAction(`${definition.navLabel}流程已完成，可以返回主屏继续探索。`);
      return;
    }

    const currentIndex = agentFlowStepIndexes[page];
    const currentStep = agentFlowMessages[page][currentIndex] ?? definition.steps[0];
    setLastAction(`${definition.navLabel} · ${currentStep.phase}：${actionLabel}`);

    if (currentIndex >= definition.steps.length - 1) {
      setAgentFlowCompleted((current) => ({ ...current, [page]: true }));
      completeAgentFlowSideEffects(page);
      return;
    }

    const nextIndex = Math.min(currentIndex + 1, definition.steps.length - 1);
    const nextStep = definition.steps[nextIndex];
    if (nextStep.reward) {
      setAgentFlowGrowthReward((current) => current + nextStep.reward!);
    }
    setAgentFlowStepIndexes((current) => ({ ...current, [page]: nextIndex }));
    setAgentFlowMessages((current) => ({
      ...current,
      [page]: current[page][nextIndex] ? current[page] : [...current[page], nextStep],
    }));
    if (nextIndex === definition.steps.length - 1) {
      setAgentFlowCompleted((current) => ({ ...current, [page]: true }));
      completeAgentFlowSideEffects(page);
    }
  }

  function advanceMainline(actionLabel: string) {
    if (mainlineCompleted) {
      setLastAction('主线已完成，可以返回主页查看成长和日记。');
      return;
    }

    const currentStep = mainlineMessages[mainlineStepIndex] ?? mainlineChatSteps[0];

    setLastAction(`主线 · ${currentStep.phase}：${actionLabel}`);

    if (mainlineStepIndex >= mainlineChatSteps.length - 1) {
      setMainlineCompleted(true);
      return;
    }

    const nextStepIndex = Math.min(mainlineStepIndex + 1, mainlineChatSteps.length - 1);
    const nextStep = mainlineChatSteps[nextStepIndex];
    if (nextStep.reward) {
      setMainlineGrowthReward((current) => current + nextStep.reward!);
    }
    setMainlineStepIndex(nextStepIndex);
    setMainlineMessages((current) => (current[nextStepIndex] ? current : [...current, nextStep]));
    setMainlineCompleted(nextStepIndex === mainlineChatSteps.length - 1);
  }

  function runAppAction(action: string) {
    const nextSosStatus = activeApp.key === 'sos' && action === '长按报警' ? (sosStatus === 'idle' ? 'confirming' : 'sent') : sosStatus;
    const result = getActionResult(activeApp, action, nextSosStatus);
    setAppPage('workspace');
    setActiveAppAction(action);
    setAppStages((current) => ({ ...current, [activeApp.key]: ((current[activeApp.key] ?? 0) + 1) % Math.max(1, activeRuntime.feed.length) }));
    setAppActionLog((current) => [{ app: activeApp.title, action, text: result.title }, ...current].slice(0, 5));
    if (activeApp.key === 'wallet' && action === '付款码') {
      setWalletCodeVisible(true);
    }
    if (activeApp.key === 'sos') {
      setSosStatus(nextSosStatus);
    }
    if (activeApp.key === 'tasks') {
      if (action.includes('卡包')) {
        openAgentFlow('cardBagAgent');
      } else if (action.includes('斗卡')) {
        openAgentFlow('duelAgent');
      } else {
        openAgentFlow('taskCardAgent');
      }
    }
    if (activeApp.key === 'growth') {
      if (action.includes('测试')) {
        openAgentFlow('abilityAgent');
      } else {
        openAgentFlow('profileAgent');
      }
    }
    if (activeApp.key === 'friends' && action.includes('斗卡')) {
      openAgentFlow('duelAgent');
    }
    setLastAction(`${activeApp.title} · ${action}：${result.desc}`);
  }

  function switchScreen(screen: ScreenKey) {
    setActiveScreen(screen);
    if (screen === 'apps') {
      setAppPage('center');
    }
  }

  function openAppDetail(appKey = activeApp.key) {
    const app = apps.find((item) => item.key === appKey) ?? activeApp;
    setActiveAppKey(app.key);
    setActiveScreen('apps');
    setAppPage('detail');
    setActiveAppAction('打开应用');
    setLastAction(`已打开「${app.title}」应用详情页。`);
  }

  function openAppWorkspace(appKey = activeApp.key) {
    const app = apps.find((item) => item.key === appKey) ?? activeApp;
    if (app.key === 'tasks') {
      setActiveAppKey(app.key);
      openAgentFlow('taskCardAgent');
      setLastAction('已进入「任务卡」流程。');
      return;
    }
    if (app.key === 'growth') {
      setActiveAppKey(app.key);
      openAgentFlow('profileAgent');
      setLastAction('已进入「成长画像」流程。');
      return;
    }
    setActiveAppKey(app.key);
    setActiveScreen('apps');
    setAppPage('workspace');
    setActiveAppAction('打开应用');
    setLastAction(`已进入「${app.title}」工作台。`);
  }

  function toggleSetting(key: keyof SettingsToggles) {
    setSettingsToggles((current) => {
      const next = { ...current, [key]: !current[key] };
      setLastAction(`设置 · ${key === 'face' ? '人脸识别' : key === 'pay' ? '支付授权' : '定位权限'}：${next[key] ? '已开启' : '已关闭'}。`);
      return next;
    });
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (start == null || end == null || Math.abs(end - start) < 44) {
      return;
    }
    const next = nextScreen(activeScreen, end < start ? 1 : -1);
    switchScreen(next);
  }

  const isAgentFullPage = activeScreen === 'agent' && agentPage !== 'home';
  const showHomeQuickApps = authStage === 'main' && activeScreen === 'agent' && agentPage === 'home';

  const watch = (
    <section className="watch-shell">
      <div className="watch-crown" />
      <div className="watch-key upper" />
      <div className="watch-key lower" />
      <div className="watch-screen" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <StatusBar />
        {authStage === 'device' ? (
          <DeviceInit
            authCode={authCode}
            initMode={initMode}
            loginError={loginError}
            scanAuthed={scanAuthed}
            setAuthCode={setAuthCode}
            setInitMode={(mode) => {
              setInitMode(mode);
              setLoginError('');
            }}
            onNext={finishDeviceInit}
          />
        ) : null}
        {authStage === 'student' ? (
          <StudentLogin
            loginIntent={loginIntent}
            selectedAccount={selectedAccount}
            setAuthStage={setAuthStage}
            setLoginIntent={setLoginIntent}
          />
        ) : null}
        {authStage === 'account' ? (
          <AccountLogin
            loginError={loginError}
            loginIntent={loginIntent}
            password={password}
            phone={phone}
            selectedAccount={selectedAccount}
            setAuthStage={setAuthStage}
            setPassword={setPassword}
            setPhone={setPhone}
            onSelectAccount={selectDemoAccount}
            onSubmit={submitAccountLogin}
          />
        ) : null}
        {authStage === 'face' ? (
          <FaceLogin
            faceStatus={faceStatus}
            loginIntent={loginIntent}
            setAuthStage={setAuthStage}
            setFaceStatus={setFaceStatus}
            onStart={startFaceLogin}
          />
        ) : null}
        {authStage === 'main' ? (
          <>
            {!isAgentFullPage ? <ScreenNav activeScreen={activeScreen} setActiveScreen={switchScreen} /> : null}
            <div className={`screen-scroll ${isAgentFullPage ? 'mainline-flow' : ''}`}>
              {activeScreen === 'notice' ? <NoticeScreen onOpenApp={openAppDetail} /> : null}
              {activeScreen === 'growth' ? (
                <GrowthScreen growthValue={growthValue} profileCompletion={profileCompletion} setActiveMode={setActiveMode} setActiveScreen={switchScreen} setAgentPage={setAgentPage} onOpenAgentFlow={openAgentFlow} />
              ) : null}
              {activeScreen === 'agent' ? (
                <AgentScreen
                  activeMode={activeMode}
                  agentPage={agentPage}
                  agentFlowCompleted={agentFlowCompleted}
                  agentFlowMessages={agentFlowMessages}
                  agentFlowStepIndexes={agentFlowStepIndexes}
                  growthValue={growthValue}
                  homePushTrigger={homePushTrigger}
                  mainlineCompleted={mainlineCompleted}
                  mainlineMessages={mainlineMessages}
                  mainlineStepIndex={mainlineStepIndex}
                  mainlineStepsTotal={mainlineChatSteps.length}
                  lastAction={lastAction}
                  profileCompletion={profileCompletion}
                  selectedAccount={selectedAccount}
                  setActiveMode={setActiveMode}
                  setActiveScreen={switchScreen}
                  setAgentPage={setAgentPage}
                  setLastAction={setLastAction}
                  onAdvanceAgentFlow={advanceAgentFlow}
                  onAdvanceMainline={advanceMainline}
                  onCloseAgentFlow={closeAgentFlow}
                  onOpenAgentFlow={openAgentFlow}
                  onRestartAgentFlow={restartAgentFlow}
                  onOpenMainlineChat={openMainlineChat}
                  onCloseMainlineChat={closeMainlineChat}
                  onSelectHomePush={selectHomePush}
                />
              ) : null}
              {activeScreen === 'apps' ? (
                <AppsScreen
                  activeAction={activeAppAction}
                  activeApp={activeApp}
                  activeAppKey={activeAppKey}
                  activeResult={activeActionResult}
                  activeRuntime={activeRuntime}
                  actionLog={appActionLog}
                  appPage={appPage}
                  settingsToggles={settingsToggles}
                  sosStatus={sosStatus}
                  stage={appStages[activeApp.key] ?? 0}
                  walletCodeVisible={walletCodeVisible}
                  onBack={() => setAppPage('center')}
                  onOpenApp={openAppDetail}
                  onOpenWorkspace={() => openAppWorkspace()}
                  onRunAction={runAppAction}
                  onToggleSetting={toggleSetting}
                />
              ) : null}
            </div>
            {showHomeQuickApps ? <HomeQuickApps onOpenApp={openAppDetail} setLastAction={setLastAction} /> : null}
            <VoiceDock lastAction={lastAction} />
          </>
        ) : null}
      </div>
    </section>
  );

  return (
    <main className="device-agent-page">
      {watch}
    </main>
  );
}

function StatusBar() {
  return (
    <div className="status-bar">
      <strong>09:30</strong>
      <span className="status-center">
        <i>2</i>消息 <i>3</i>任务
      </span>
      <span className="battery">100%</span>
    </div>
  );
}

function DeviceInit(props: {
  authCode: string;
  initMode: InitMode;
  loginError: string;
  scanAuthed: boolean;
  setAuthCode: (value: string) => void;
  setInitMode: (mode: InitMode) => void;
  onNext: () => void;
}) {
  const copy = initModeCopy[props.initMode];

  return (
    <section className="auth-screen">
      <HeroBlock eyebrow="DEVICE INIT" title="设备初始化" desc="旧版设备码、租赁、销售、扫码授权完整保留，只升级为 AI 手表视觉。" />
      <div className="glass-card">
        <div className="hero-row">
          <DeviceIcon label="码" accent="orange" />
          <div>
            <strong>设备码</strong>
            <p>YXB-DEV-0001 · 福田红树林研学设备</p>
          </div>
        </div>
        <Segmented<InitMode>
          items={[
            ['rental', '租赁'],
            ['sale', '销售'],
            ['scan', '扫码'],
          ]}
          value={props.initMode}
          onChange={props.setInitMode}
        />
        <div className="mode-card">
          <strong>{copy.title}</strong>
          <p>{copy.desc}</p>
          {props.initMode === 'rental' ? (
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="输入 6 位授权码"
              value={props.authCode}
              onChange={(event) => props.setAuthCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          ) : null}
          {props.initMode === 'scan' ? (
            <div className="qr-box">
              <span />
              <strong>{props.scanAuthed ? '扫码授权已通过' : '等待家长或老师扫码'}</strong>
            </div>
          ) : null}
        </div>
        {props.loginError ? <p className="form-error">{props.loginError}</p> : null}
      </div>
      <button className="primary-action" type="button" onClick={props.onNext}>
        {copy.action}
      </button>
    </section>
  );
}

function StudentLogin(props: {
  loginIntent: 'login' | 'add-account';
  selectedAccount: (typeof demoAccounts)[number];
  setAuthStage: (stage: AuthStage) => void;
  setLoginIntent: (intent: 'login' | 'add-account') => void;
}) {
  return (
    <section className="auth-screen">
      <HeroBlock eyebrow="LOGIN" title="学员登录" desc="账号登录、人脸登录、添加账号入口继续保留，不合并成单个登录按钮。" />
      <div className="glass-card">
        <div className="hero-row">
          <DeviceIcon label="学" accent="green" />
          <div>
            <strong>设备已初始化</strong>
            <p>当前账号：{props.selectedAccount.name} · {props.selectedAccount.role}</p>
          </div>
        </div>
        <div className="login-choice-grid">
          <button type="button" onClick={() => props.setAuthStage('account')}>
            <DeviceIcon label="账" accent="blue" />
            <strong>账号登陆</strong>
            <span>手机号 / 密码 / 演示账号</span>
          </button>
          <button type="button" onClick={() => props.setAuthStage('face')}>
            <DeviceIcon label="脸" accent="green" />
            <strong>人脸登陆</strong>
            <span>等待 / 识别中 / 成功三态</span>
          </button>
        </div>
        <button
          className="ghost-action"
          type="button"
          onClick={() => {
            props.setLoginIntent(props.loginIntent === 'login' ? 'add-account' : 'login');
          }}
        >
          {props.loginIntent === 'login' ? '进入添加账号流' : '返回普通登录流'}
        </button>
        <p className="hint-line">学员账号注册不在设备端进行，设备端只使用已分配账号登录或添加绑定。</p>
      </div>
    </section>
  );
}

function AccountLogin(props: {
  loginError: string;
  loginIntent: 'login' | 'add-account';
  password: string;
  phone: string;
  selectedAccount: (typeof demoAccounts)[number];
  setAuthStage: (stage: AuthStage) => void;
  setPassword: (value: string) => void;
  setPhone: (value: string) => void;
  onSelectAccount: (account: (typeof demoAccounts)[number]) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="auth-screen">
      <HeroBlock eyebrow="ACCOUNT" title="账号登陆" desc="手机号、密码、演示账号、主按钮和返回登录方式全部保留。" />
      <div className="glass-card form-stack">
        <label>
          手机号
          <input value={props.phone} inputMode="tel" onChange={(event) => props.setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))} />
        </label>
        <label>
          密码
          <input value={props.password} type="password" onChange={(event) => props.setPassword(event.target.value)} />
        </label>
        <div className="account-strip">
          {demoAccounts.map((account) => (
            <button key={account.phone} type="button" className={account.phone === props.selectedAccount.phone ? 'active' : ''} onClick={() => props.onSelectAccount(account)}>
              <strong>{account.name}</strong>
              <span>{account.phone}</span>
            </button>
          ))}
        </div>
        <p className="hint-line">演示密码：123456</p>
        {props.loginError ? <p className="form-error">{props.loginError}</p> : null}
      </div>
      <div className="auth-actions">
        <button type="button" className="secondary-action" onClick={() => props.setAuthStage('student')}>
          返回登录方式
        </button>
        <button type="button" className="primary-action" onClick={props.onSubmit}>
          {props.loginIntent === 'add-account' ? '添加并登录账号' : '登录账号'}
        </button>
      </div>
    </section>
  );
}

function FaceLogin(props: {
  faceStatus: FaceStatus;
  loginIntent: 'login' | 'add-account';
  setAuthStage: (stage: AuthStage) => void;
  setFaceStatus: (status: FaceStatus) => void;
  onStart: () => void;
}) {
  const copy =
    props.faceStatus === 'ready'
      ? '请站稳并看向屏幕，点击开始识别。'
      : props.faceStatus === 'scanning'
        ? '正在进行前端模拟识别，保持光线充足。'
        : props.loginIntent === 'add-account'
          ? '识别成功，将新增账号并进入 AI 主屏。'
          : '识别成功，点击进入 AI 主屏。';

  return (
    <section className="auth-screen">
      <HeroBlock eyebrow="FACE ID" title="人脸登陆" desc="等待识别、正在识别、识别成功三种状态和返回路径均保留。" />
      <div className="glass-card face-card">
        <div className={`face-window ${props.faceStatus}`}>
          <DeviceIcon label="脸" accent="green" />
          <span>{props.faceStatus === 'ready' ? '等待识别' : props.faceStatus === 'scanning' ? '识别中' : '识别成功'}</span>
        </div>
        <p>{copy}</p>
        <div className="interest-tags">
          <span>身份校验</span>
          <span>前端模拟</span>
          <span>添加账号流</span>
        </div>
      </div>
      <div className="auth-actions">
        <button
          type="button"
          className="secondary-action"
          onClick={() => {
            props.setFaceStatus('ready');
            props.setAuthStage('student');
          }}
        >
          返回登录方式
        </button>
        <button type="button" className="primary-action" onClick={props.onStart}>
          {props.faceStatus === 'success' ? '进入主屏' : '开始识别'}
        </button>
      </div>
    </section>
  );
}

function ScreenNav(props: { activeScreen: ScreenKey; setActiveScreen: (screen: ScreenKey) => void }) {
  return (
    <nav className="screen-nav" aria-label="四屏切换">
      {screenOrder.map((screen) => (
        <button key={screen} type="button" className={screen === props.activeScreen ? 'active' : ''} onClick={() => props.setActiveScreen(screen)}>
          {screenLabels[screen]}
        </button>
      ))}
    </nav>
  );
}

function NoticeScreen(props: { onOpenApp: (appKey: string) => void }) {
  const [activeNoticeFilter, setActiveNoticeFilter] = useState<NoticeFilter>('任务');
  const filteredNotifications = notifications.filter((item) => item.category === activeNoticeFilter);

  function getNoticeTargetApp(category: NoticeFilter) {
    return category === '任务' ? 'tasks' : category === '团队' ? 'team' : category === '聊天' ? 'chat' : 'messages';
  }

  return (
    <section className="panel notice-panel">
      <SectionHeader eyebrow="上滑进入" title="通知中心" desc="聚合任务、团队广播、聊天、家庭和系统通知，每条都能跳转处理。" />
      <div className="notice-summary">
        {noticeFilters.map((filter) => {
          const count = notifications.filter((item) => item.category === filter).length;
          return (
            <button key={filter} type="button" className={filter === activeNoticeFilter ? 'active' : ''} aria-pressed={filter === activeNoticeFilter} onClick={() => setActiveNoticeFilter(filter)}>
              {filter} {count}
            </button>
          );
        })}
      </div>
      <div className="card-stack">
        {filteredNotifications.map((item) => (
          <article key={item.title} className="info-card">
            <div className="card-head">
              <span>{item.type}</span>
              <strong>{item.title}</strong>
            </div>
            <p>{item.desc}</p>
            <button
              type="button"
              onClick={() => {
                props.onOpenApp(getNoticeTargetApp(item.category));
              }}
            >
              去处理
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function GrowthScreen(props: {
  growthValue: number;
  profileCompletion: number;
  setActiveMode: (mode: AgentMode) => void;
  setActiveScreen: (screen: ScreenKey) => void;
  setAgentPage: (page: AgentPage) => void;
  onOpenAgentFlow: (page: AgentFlowPage) => void;
}) {
  return (
    <section className="panel growth-panel">
      <SectionHeader eyebrow="左滑进入" title="成长中心" desc="成长值、能力指数、成长记录、团队状态和画像完成度集中展示。" />
      <div className="growth-score">
        <div>
          <span>当前成长值</span>
          <strong>{props.growthValue}</strong>
        </div>
        <div>
          <span>画像完成度</span>
          <strong>{props.profileCompletion}%</strong>
        </div>
      </div>
      <div className="radar-card">
        {growthMetrics.map((item) => (
          <div key={item.label} className="metric-row">
            <span>{item.label}</span>
            <i>
              <b className={item.accent} style={{ width: `${item.value}%` }} />
            </i>
            <em>{item.value}</em>
          </div>
        ))}
      </div>
      <article className="info-card">
        <div className="card-head">
          <span>天赋 · 兴趣 · 能力</span>
          <strong>{props.profileCompletion >= 92 ? '画像已更新' : '进入 Agent 测试'}</strong>
        </div>
        <p>能力、天赋、兴趣和成长画像都在独立流程页逐步完成，不在成长中心一键切状态。</p>
        <div className="action-grid">
          <button type="button" onClick={() => props.onOpenAgentFlow('abilityAgent')}>
            能力测试
          </button>
          <button type="button" onClick={() => props.onOpenAgentFlow('talentAgent')}>
            天赋探索
          </button>
          <button type="button" onClick={() => props.onOpenAgentFlow('interestAgent')}>
            兴趣确认
          </button>
          <button type="button" onClick={() => props.onOpenAgentFlow('profileAgent')}>
            成长画像
          </button>
        </div>
      </article>
      <button
        className="full-action"
        type="button"
        onClick={() => {
          props.setActiveMode('task');
          props.setActiveScreen('agent');
          props.setAgentPage('home');
        }}
      >
        返回 Agent 继续任务
      </button>
    </section>
  );
}

function AgentScreen(props: {
  activeMode: AgentMode;
  agentPage: AgentPage;
  agentFlowCompleted: Record<AgentFlowPage, boolean>;
  agentFlowMessages: Record<AgentFlowPage, AgentFlowStep[]>;
  agentFlowStepIndexes: Record<AgentFlowPage, number>;
  growthValue: number;
  homePushTrigger: HomeTriggerKey;
  lastAction: string;
  mainlineCompleted: boolean;
  mainlineMessages: MainlineChatStep[];
  mainlineStepIndex: number;
  mainlineStepsTotal: number;
  profileCompletion: number;
  selectedAccount: (typeof demoAccounts)[number];
  setActiveMode: (mode: AgentMode) => void;
  setAgentPage: (page: AgentPage) => void;
  setActiveScreen: (screen: ScreenKey) => void;
  setLastAction: (action: string) => void;
  onAdvanceAgentFlow: (page: AgentFlowPage, actionLabel: string) => void;
  onAdvanceMainline: (actionLabel: string) => void;
  onCloseAgentFlow: () => void;
  onCloseMainlineChat: () => void;
  onOpenAgentFlow: (page: AgentFlowPage) => void;
  onOpenMainlineChat: () => void;
  onRestartAgentFlow: (page: AgentFlowPage) => void;
  onSelectHomePush: (trigger: HomeTriggerKey) => void;
}) {
  const currentMainlineStep = props.mainlineMessages[props.mainlineStepIndex] ?? mainlineChatSteps[0];

  if (props.agentPage === 'mainlineChat') {
    return (
      <section className="panel agent-panel">
        <MainlineChatPage
          currentStep={currentMainlineStep}
          growthValue={props.growthValue}
          mainlineCompleted={props.mainlineCompleted}
          mainlineMessages={props.mainlineMessages}
          mainlineStepIndex={props.mainlineStepIndex}
          mainlineStepsTotal={props.mainlineStepsTotal}
          onAdvanceMainline={props.onAdvanceMainline}
          onCloseMainlineChat={props.onCloseMainlineChat}
        />
      </section>
    );
  }

  if (isAgentFlowPage(props.agentPage)) {
    const definition = agentFlowDefinitions[props.agentPage];
    const stepIndex = props.agentFlowStepIndexes[props.agentPage];
    const messages = props.agentFlowMessages[props.agentPage];
    const currentStep = messages[stepIndex] ?? definition.steps[0];

    if (isGrowthProbePage(props.agentPage)) {
      return (
        <section className="panel agent-panel">
          <GrowthProbeAgentPage
            completed={props.agentFlowCompleted[props.agentPage]}
            currentStep={currentStep}
            definition={definition}
            page={props.agentPage}
            stepIndex={stepIndex}
            onAdvance={(actionLabel) => props.onAdvanceAgentFlow(props.agentPage as GrowthProbePage, actionLabel)}
            onClose={props.onCloseAgentFlow}
            setLastAction={props.setLastAction}
          />
        </section>
      );
    }

    if (props.agentPage === 'duelAgent') {
      return (
        <section className="panel agent-panel">
          <DuelAgentPage
            completed={props.agentFlowCompleted.duelAgent}
            currentStep={currentStep}
            stepIndex={stepIndex}
            stepsTotal={definition.steps.length}
            onAdvance={(actionLabel) => props.onAdvanceAgentFlow('duelAgent', actionLabel)}
            onClose={props.onCloseAgentFlow}
            onOpenAgentFlow={props.onOpenAgentFlow}
            onRestartAgentFlow={props.onRestartAgentFlow}
            setLastAction={props.setLastAction}
          />
        </section>
      );
    }

    return (
      <section className="panel agent-panel">
        <AgentFlowChatPage
          completed={props.agentFlowCompleted[props.agentPage]}
          currentStep={currentStep}
          definition={definition}
          messages={messages}
          profileCompletion={props.profileCompletion}
          stepIndex={stepIndex}
          onAdvance={(actionLabel) => props.onAdvanceAgentFlow(props.agentPage as AgentFlowPage, actionLabel)}
          onClose={props.onCloseAgentFlow}
        />
      </section>
    );
  }

  return (
    <section className="panel agent-panel agent-home-panel">
      <AgentHomeScreen
        agentFlowCompleted={props.agentFlowCompleted}
        agentFlowStepIndexes={props.agentFlowStepIndexes}
        currentStep={currentMainlineStep}
        growthValue={props.growthValue}
        homePushTrigger={props.homePushTrigger}
        mainlineCompleted={props.mainlineCompleted}
        mainlineStepIndex={props.mainlineStepIndex}
        mainlineStepsTotal={props.mainlineStepsTotal}
        profileCompletion={props.profileCompletion}
        onOpenAgentFlow={props.onOpenAgentFlow}
        onOpenMainlineChat={props.onOpenMainlineChat}
        onSelectHomePush={props.onSelectHomePush}
      />
    </section>
  );
}

function AgentHomeScreen(props: {
  agentFlowCompleted: Record<AgentFlowPage, boolean>;
  agentFlowStepIndexes: Record<AgentFlowPage, number>;
  currentStep: MainlineChatStep;
  growthValue: number;
  homePushTrigger: HomeTriggerKey;
  mainlineCompleted: boolean;
  mainlineStepIndex: number;
  mainlineStepsTotal: number;
  profileCompletion: number;
  onOpenAgentFlow: (page: AgentFlowPage) => void;
  onOpenMainlineChat: () => void;
  onSelectHomePush: (trigger: HomeTriggerKey) => void;
}) {
  const flowStatus = (page: AgentFlowPage) => {
    const definition = agentFlowDefinitions[page];
    return props.agentFlowCompleted[page] ? '已完成' : formatStep(props.agentFlowStepIndexes[page], definition.steps.length);
  };
  const triggerLabels: { key: HomeTriggerKey; label: string }[] = [
    { key: 'mainline', label: '主线' },
    { key: 'taskCards', label: '任务卡片' },
    { key: 'duel', label: '斗卡' },
    { key: 'growthProfile', label: '能力' },
  ];
  const pushGroups: Record<HomeTriggerKey, HomePushGroup> = {
    mainline: {
      trigger: 'mainline',
      title: '当前任务',
      agentText: '我已经帮你准备好今天的研学主线，点开后我会一步一步带你完成。',
      cards: [
        {
          key: 'mainline',
          title: '小小生态公园设计师',
          desc: props.currentStep.title,
          meta: props.mainlineCompleted ? '主线已完成' : formatStep(props.mainlineStepIndex, props.mainlineStepsTotal),
          actionLabel: props.mainlineCompleted ? '查看结果' : '去查看',
          target: 'mainlineChat',
        },
      ],
    },
    taskCards: {
      trigger: 'taskCards',
      title: '任务卡片',
      agentText: '我给你推送了任务卡片和卡包入口，先完成任务，再看看卡片图鉴。',
      cards: [
        {
          key: 'task-card',
          title: '探访“野朋友”任务卡',
          desc: '选择、拍照、语音、确认信息和关系问答。',
          meta: flowStatus('taskCardAgent'),
          actionLabel: '开始任务',
          target: 'taskCardAgent',
        },
        {
          key: 'card-bag',
          title: '任务卡包与图鉴',
          desc: '查看全部任务、待补充和生态探索系列。',
          meta: flowStatus('cardBagAgent'),
          actionLabel: '打开卡包',
          target: 'cardBagAgent',
        },
      ],
    },
    duel: {
      trigger: 'duel',
      title: '斗卡挑战',
      agentText: '小宇发来了斗卡邀请，我会先讲规则，再带你同步答题和看排行榜。',
      cards: [
        {
          key: 'duel',
          title: '探访野朋友斗卡',
          desc: '邀请、规则、同步 PK、结算和排行榜。',
          meta: flowStatus('duelAgent'),
          actionLabel: '去应战',
          target: 'duelAgent',
        },
      ],
    },
    growthProfile: {
      trigger: 'growthProfile',
      title: '能力画像',
      agentText: '我可以通过能力、天赋和兴趣测试更懂你，最后生成成长画像。',
      cards: [
        {
          key: 'ability',
          title: '能力测试',
          desc: '3 道情境题生成能力雷达。',
          meta: flowStatus('abilityAgent'),
          actionLabel: '开始测试',
          target: 'abilityAgent',
        },
        {
          key: 'talent',
          title: '天赋测试',
          desc: '情境问答发现潜力方向。',
          meta: flowStatus('talentAgent'),
          actionLabel: '探索天赋',
          target: 'talentAgent',
        },
        {
          key: 'interest',
          title: '兴趣爱好',
          desc: '确认兴趣标签并推荐任务。',
          meta: flowStatus('interestAgent'),
          actionLabel: '确认兴趣',
          target: 'interestAgent',
        },
      ],
    },
  };
  const activePush = pushGroups[props.homePushTrigger];

  return (
    <div className="agent-home-screen">
      <HomeTriggerBar activeTrigger={props.homePushTrigger} triggers={triggerLabels} onSelect={props.onSelectHomePush} />
      <AgentVisualStage growthValue={props.growthValue} profileCompletion={props.profileCompletion} pushGroup={activePush} onOpenAgentFlow={props.onOpenAgentFlow} onOpenMainlineChat={props.onOpenMainlineChat} />
    </div>
  );
}

function HomeTriggerBar(props: {
  activeTrigger: HomeTriggerKey;
  triggers: { key: HomeTriggerKey; label: string }[];
  onSelect: (trigger: HomeTriggerKey) => void;
}) {
  return (
    <div className="home-trigger-bar" aria-label="Agent 推送触发">
      {props.triggers.map((trigger) => (
        <button key={trigger.key} type="button" className={props.activeTrigger === trigger.key ? 'active' : ''} onClick={() => props.onSelect(trigger.key)}>
          {trigger.label}
        </button>
      ))}
    </div>
  );
}

function AgentVisualStage(props: {
  growthValue: number;
  profileCompletion: number;
  pushGroup: HomePushGroup;
  onOpenAgentFlow: (page: AgentFlowPage) => void;
  onOpenMainlineChat: () => void;
}) {
  function openTarget(target: HomePushTarget) {
    if (target === 'mainlineChat') {
      props.onOpenMainlineChat();
      return;
    }
    props.onOpenAgentFlow(target);
  }

  return (
    <section className="agent-visual-stage">
      <Image className="agent-home-bg" src="/design/home-agent-prototype.png" alt="" fill priority sizes="420px" />
      <div className="home-stat-row" aria-label="成长状态">
        <div className="home-mini-stat">
          <span>Lv.3</span>
          <strong>能量 {props.profileCompletion}%</strong>
          <i>
            <b style={{ width: `${Math.min(100, props.profileCompletion)}%` }} />
          </i>
        </div>
        <div className="home-mini-stat score">
          <span>成长值</span>
          <strong>{props.growthValue}</strong>
        </div>
      </div>
      <article className="home-agent-bubble">
        <span>嗨！我是研小宝</span>
        <p>{props.pushGroup.agentText}</p>
      </article>
      <HomePushPanel pushGroup={props.pushGroup} onOpenTarget={openTarget} />
    </section>
  );
}

function HomePushPanel(props: { pushGroup: HomePushGroup; onOpenTarget: (target: HomePushTarget) => void }) {
  return (
    <section className={`home-push-panel cards-${props.pushGroup.cards.length}`} aria-label="Agent 当前推送">
      <div className="home-push-head">
        <span>{props.pushGroup.title}</span>
        <strong>研小宝推送</strong>
      </div>
      <div className="home-push-card-list">
        {props.pushGroup.cards.map((card) => (
          <button key={card.key} type="button" className="home-push-card" data-home-push-card={card.key} onClick={() => props.onOpenTarget(card.target)}>
            <i>{card.meta}</i>
            <strong>{card.title}</strong>
            <span>{card.desc}</span>
            <em>{card.actionLabel}</em>
          </button>
        ))}
      </div>
    </section>
  );
}

function HomeQuickApps(props: {
  onOpenApp: (appKey: string) => void;
  setLastAction: (action: string) => void;
}) {
  const items = [
    { key: 'task', icon: '任', label: '任务', onClick: () => props.onOpenApp('tasks') },
    { key: 'capture', icon: '拍', label: '拍拍', onClick: () => props.onOpenApp('capture') },
    { key: 'ask', icon: '?', label: '问问', onClick: () => props.onOpenApp('ask') },
    { key: 'flash', icon: '记', label: '闪记', onClick: () => props.onOpenApp('flash') },
    { key: 'plaza', icon: '广', label: '广场', onClick: () => props.onOpenApp('plaza') },
  ];

  return (
    <div className="home-quick-apps" aria-label="主屏常用入口">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => {
            item.onClick();
            props.setLastAction(item.key === 'task' ? '已打开「任务」应用模块。' : `已打开「${item.label}」入口。`);
          }}
        >
          <span>{item.icon}</span>
          <strong>{item.label}</strong>
        </button>
      ))}
    </div>
  );
}

function isGrowthProbePage(page: AgentPage): page is GrowthProbePage {
  return page === 'abilityAgent' || page === 'talentAgent' || page === 'interestAgent';
}

function createInitialGrowthProbeDraftState(): GrowthProbeDraftState {
  return {
    abilityAnswers: {},
    talentAnswers: {},
    talentBehavior: 'idle',
    interestTags: [],
    interestEvidence: 'idle',
    interestRobot: 'idle',
  };
}

const abilityQuestionOptions: Record<string, { label: string; desc: string; answer: string }[]> = {
  'ability-q1': [
    { label: '拍照观察', desc: '先记录叶子、形状和位置', answer: '我会先拍照观察细节，再记录它在哪里、长什么样。' },
    { label: '记录位置', desc: '先把地点和形状写下来', answer: '我会先记录它的位置和形状，再继续观察细节。' },
    { label: '请教老师', desc: '先确认安全和名称', answer: '我会先请老师确认它是否可以观察，再补充记录。' },
  ],
  'ability-q2': [
    { label: '听理由', desc: '请大家说清楚原因', answer: '我会请大家先说理由，再一起选最能完成任务的方法。' },
    { label: '做分工', desc: '每个人负责一部分', answer: '我会把任务拆开，让大家各自负责一部分再合并。' },
    { label: '问队长', desc: '让队长帮忙决定', answer: '我会请队长帮忙判断，也会把自己的理由说出来。' },
  ],
  'ability-q3': [
    { label: '继续查证', desc: '再观察、再提问', answer: '我会继续观察、提问和查证，不会马上下结论。' },
    { label: '标记不确定', desc: '先保存疑问', answer: '我会把不确定的地方标记出来，等有证据后再确认。' },
    { label: '找同伴讨论', desc: '一起验证想法', answer: '我会找同伴一起讨论，用更多证据验证答案。' },
  ],
};

const talentSceneOptions = [
  { label: '找证据', answer: '我想负责找资料和证据。' },
  { label: '画图设计', answer: '我想把观察结果画成展板。' },
  { label: '上台讲解', answer: '我想试试把发现讲给别人听。' },
  { label: '组织分工', answer: '我想帮小组安排谁先做什么。' },
];

const interestTagOptions = ['自然观察', '机器人', '绘画创作', '历史故事', '宇宙探索'];

function GrowthProbeAgentPage(props: {
  completed: boolean;
  currentStep: AgentFlowStep;
  definition: AgentFlowDefinition;
  page: GrowthProbePage;
  stepIndex: number;
  onAdvance: (actionLabel: string) => void;
  onClose: () => void;
  setLastAction: (action: string) => void;
}) {
  const [draft, setDraft] = useState<GrowthProbeDraftState>(() => createInitialGrowthProbeDraftState());

  useEffect(() => {
    setDraft(createInitialGrowthProbeDraftState());
  }, [props.page]);

  const stepId = props.currentStep.id;
  const submit = (action: string) => props.onAdvance(action);

  const selectAbilityAnswer = (answer: string) => {
    setDraft((current) => ({
      ...current,
      abilityAnswers: { ...current.abilityAnswers, [stepId]: answer },
    }));
    props.setLastAction(`${props.definition.navLabel} · ${props.currentStep.phase}：已填充回答。`);
  };

  const resetAbilityAnswer = () => {
    setDraft((current) => {
      const nextAnswers = { ...current.abilityAnswers };
      delete nextAnswers[stepId];
      return { ...current, abilityAnswers: nextAnswers };
    });
    props.setLastAction(`${props.definition.navLabel} · ${props.currentStep.phase}：已清空回答。`);
  };

  const toggleTalentAnswer = (label: string) => {
    setDraft((current) => {
      const selected = current.talentAnswers[stepId] ?? [];
      const exists = selected.includes(label);
      const next = exists ? selected.filter((item) => item !== label) : [...selected, label].slice(0, 2);
      return { ...current, talentAnswers: { ...current.talentAnswers, [stepId]: next } };
    });
    props.setLastAction(`${props.definition.navLabel} · ${props.currentStep.phase}：已更新回答。`);
  };

  const resetTalentScene = () => {
    setDraft((current) => ({ ...current, talentAnswers: { ...current.talentAnswers, [stepId]: [] } }));
    props.setLastAction('天赋 · 情境：已重新选择。');
  };

  const updateTalentBehavior = (mode: 'drafted' | 'manual' | 'idle') => {
    setDraft((current) => ({ ...current, talentBehavior: mode }));
    props.setLastAction(mode === 'idle' ? '天赋 · 偏好：已清空整理内容。' : '天赋 · 偏好：已填充任务表现。');
  };

  const toggleInterestTag = (tag: string) => {
    setDraft((current) => {
      const exists = current.interestTags.includes(tag);
      const next = exists ? current.interestTags.filter((item) => item !== tag) : [...current.interestTags, tag].slice(0, 3);
      return { ...current, interestTags: next };
    });
    props.setLastAction('兴趣 · 选择：已更新兴趣标签。');
  };

  const resetInterestTags = () => {
    setDraft((current) => ({ ...current, interestTags: [] }));
    props.setLastAction('兴趣 · 选择：已重新选择。');
  };

  const updateInterestEvidence = (mode: 'accepted' | 'ignored' | 'idle') => {
    setDraft((current) => ({ ...current, interestEvidence: mode }));
    props.setLastAction(mode === 'accepted' ? '兴趣 · 确认：已加入自然观察。' : mode === 'ignored' ? '兴趣 · 确认：已忽略自然观察推荐。' : '兴趣 · 确认：已重新确认。');
  };

  const updateInterestRobot = (mode: 'accepted' | 'ignored' | 'later' | 'idle') => {
    setDraft((current) => ({ ...current, interestRobot: mode }));
    props.setLastAction(mode === 'accepted' ? '兴趣 · 确认：已加入机器人。' : mode === 'ignored' ? '兴趣 · 确认：暂不加入机器人。' : mode === 'later' ? '兴趣 · 确认：机器人兴趣稍后再说。' : '兴趣 · 确认：已重新确认机器人兴趣。');
  };

  const handleAction = (action: string) => {
    if (stepId.startsWith('ability-q')) {
      if (action === '重新选择') {
        resetAbilityAnswer();
        return;
      }
      if (action === props.currentStep.actionLabel && draft.abilityAnswers[stepId]) {
        submit(action);
        return;
      }
      props.setLastAction('能力 · 题目：请先选择一个答案。');
      return;
    }

    if (stepId === 'talent-scene') {
      if (action === '重新选择') {
        resetTalentScene();
        return;
      }
      if (action === props.currentStep.actionLabel && (draft.talentAnswers[stepId]?.length ?? 0) > 0) {
        submit(action);
        return;
      }
      props.setLastAction('天赋 · 情境：请先选择一个或两个方向。');
      return;
    }

    if (stepId === 'talent-behavior') {
      if (action === '整理任务表现') {
        updateTalentBehavior('drafted');
        return;
      }
      if (action === '手动补充') {
        updateTalentBehavior('manual');
        return;
      }
      if (action === '重新整理') {
        updateTalentBehavior('idle');
        return;
      }
      if (action === props.currentStep.actionLabel && draft.talentBehavior !== 'idle') {
        submit(action);
        return;
      }
      props.setLastAction('天赋 · 偏好：请先整理或补充任务表现。');
      return;
    }

    if (stepId === 'interest-select') {
      if (action === '重新选择') {
        resetInterestTags();
        return;
      }
      if (action === props.currentStep.actionLabel && draft.interestTags.length > 0) {
        submit(action);
        return;
      }
      props.setLastAction('兴趣 · 选择：请先选择至少一个兴趣。');
      return;
    }

    if (stepId === 'interest-evidence') {
      if (action === '加入自然观察') {
        updateInterestEvidence('accepted');
        return;
      }
      if (action === '忽略推荐') {
        updateInterestEvidence('ignored');
        return;
      }
      if (action === '重新确认') {
        updateInterestEvidence('idle');
        return;
      }
      if (action === props.currentStep.actionLabel && draft.interestEvidence !== 'idle') {
        submit(action);
        return;
      }
      props.setLastAction('兴趣 · 确认：请先加入或忽略推荐。');
      return;
    }

    if (stepId === 'interest-robot') {
      if (action === '加入机器人') {
        updateInterestRobot('accepted');
        return;
      }
      if (action === '暂不加入') {
        updateInterestRobot('ignored');
        return;
      }
      if (action === '稍后再说') {
        updateInterestRobot('later');
        return;
      }
      if (action === '重新确认') {
        updateInterestRobot('idle');
        return;
      }
      if (action === props.currentStep.actionLabel && draft.interestRobot !== 'idle') {
        submit(action);
        return;
      }
      props.setLastAction('兴趣 · 确认：请先选择机器人兴趣状态。');
      return;
    }

    submit(action);
  };

  return (
    <div className="demo-stack mainline-chat-stack growth-probe-stack">
      <div className="mainline-page-bar">
        <button type="button" onClick={props.onClose} aria-label="返回主屏">
          ←
        </button>
        <div>
          <span>{props.definition.title}</span>
          <strong>{props.completed ? `${props.definition.navLabel}已完成` : props.currentStep.phase}</strong>
          <p>{props.currentStep.title}</p>
        </div>
        <div className="mainline-progress-pill" aria-label={`${props.definition.navLabel}进度`}>
          <span>{formatStep(props.stepIndex, props.definition.steps.length)}</span>
        </div>
      </div>

      <div className="growth-probe-scroll">
        <section className={`growth-probe-card ${props.page}`}>
          <div className="growth-probe-head">
            <span>{props.currentStep.phase}</span>
            <strong>{props.currentStep.title}</strong>
          </div>
          <div className="mainline-body">
            {props.currentStep.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {props.currentStep.tags?.length ? (
            <div className="task-meta">
              {props.currentStep.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
          {renderGrowthProbeWidget(props.page, props.currentStep, draft, {
            selectAbilityAnswer,
            toggleTalentAnswer,
            updateTalentBehavior,
            toggleInterestTag,
            updateInterestEvidence,
            updateInterestRobot,
          })}
          {renderGrowthProbeActions(props.page, props.currentStep, draft, handleAction)}
        </section>
      </div>
    </div>
  );
}

function renderGrowthProbeWidget(
  page: GrowthProbePage,
  step: AgentFlowStep,
  draft: GrowthProbeDraftState,
  handlers: {
    selectAbilityAnswer: (answer: string) => void;
    toggleTalentAnswer: (label: string) => void;
    updateTalentBehavior: (mode: 'drafted' | 'manual' | 'idle') => void;
    toggleInterestTag: (tag: string) => void;
    updateInterestEvidence: (mode: 'accepted' | 'ignored' | 'idle') => void;
    updateInterestRobot: (mode: 'accepted' | 'ignored' | 'later' | 'idle') => void;
  },
) {
  if (page === 'abilityAgent') {
    return renderAbilityProbeWidget(step, draft, handlers.selectAbilityAnswer);
  }
  if (page === 'talentAgent') {
    return renderTalentProbeWidget(step, draft, handlers.toggleTalentAnswer, handlers.updateTalentBehavior);
  }
  return renderInterestProbeWidget(step, draft, handlers.toggleInterestTag, handlers.updateInterestEvidence, handlers.updateInterestRobot);
}

function renderAbilityProbeWidget(step: AgentFlowStep, draft: GrowthProbeDraftState, onSelect: (answer: string) => void) {
  if (step.id.startsWith('ability-q')) {
    const options = abilityQuestionOptions[step.id] ?? [];
    const selected = draft.abilityAnswers[step.id];

    return (
      <div className="growth-question-widget">
        <div className="task-choice-list growth-choice-list">
          {options.map((option, index) => (
            <button key={option.label} type="button" className={selected === option.answer ? 'selected' : ''} onClick={() => onSelect(option.answer)}>
              <b>{index + 1}</b>
              <strong>{option.label}</strong>
              <em>{option.desc}</em>
            </button>
          ))}
        </div>
        <div className={`growth-answer-box ${selected ? 'filled' : ''}`}>
          <span>我的回答</span>
          <p>{selected ?? '请先从上方选择一个答案。'}</p>
        </div>
      </div>
    );
  }

  if (step.id === 'ability-result' || step.id === 'ability-advice') {
    return (
      <div className="agent-widget agent-widget-radar growth-result-widget">
        {[
          ['观察', 92],
          ['表达', 84],
          ['协作', 88],
          ['思考', 86],
        ].map(([label, value]) => (
          <div key={label} className="metric-row">
            <span>{label}</span>
            <i>
              <b className="blue" style={{ width: `${value}%` }} />
            </i>
            <em>{value}</em>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="growth-intro-widget">
      <span>3 分钟</span>
      <strong>3 道情境题</strong>
      <p>先回答，再生成能力雷达。</p>
    </div>
  );
}

function renderTalentProbeWidget(
  step: AgentFlowStep,
  draft: GrowthProbeDraftState,
  onToggleScene: (label: string) => void,
  onUpdateBehavior: (mode: 'drafted' | 'manual' | 'idle') => void,
) {
  if (step.id === 'talent-scene') {
    const selected = draft.talentAnswers[step.id] ?? [];
    const answer = talentSceneOptions
      .filter((option) => selected.includes(option.label))
      .map((option) => option.answer)
      .join(' ');

    return (
      <div className="growth-question-widget">
        <div className="growth-tag-options">
          {talentSceneOptions.map((option) => (
            <button key={option.label} type="button" className={selected.includes(option.label) ? 'selected' : ''} onClick={() => onToggleScene(option.label)}>
              {option.label}
            </button>
          ))}
        </div>
        <div className={`growth-answer-box ${answer ? 'filled' : ''}`}>
          <span>我的回答</span>
          <p>{answer || '请先选择你最想负责的部分。'}</p>
        </div>
      </div>
    );
  }

  if (step.id === 'talent-behavior') {
    const filled = draft.talentBehavior !== 'idle';
    const behaviorText = draft.talentBehavior === 'manual'
      ? '我补充：我喜欢先把观察证据整理好，再讲给同学听。'
      : '我整理到：你在任务中主动补充地点、数量和作用，对证据收集和结构化表达很敏感。';

    return (
      <div className="growth-question-widget">
        <div className="growth-tag-options">
          <button type="button" className={draft.talentBehavior === 'drafted' ? 'selected' : ''} onClick={() => onUpdateBehavior('drafted')}>
            整理任务表现
          </button>
          <button type="button" className={draft.talentBehavior === 'manual' ? 'selected' : ''} onClick={() => onUpdateBehavior('manual')}>
            手动补充
          </button>
        </div>
        <div className={`growth-answer-box ${filled ? 'filled' : ''}`}>
          <span>任务表现</span>
          <p>{filled ? behaviorText : '请先整理或补充任务表现。'}</p>
        </div>
      </div>
    );
  }

  if (step.id === 'talent-result' || step.id === 'talent-agent') {
    return (
      <div className="agent-widget agent-widget-tags growth-result-widget">
        {['自然观察讲解员', '证据整理', '结构化表达', '生态讲解员'].map((label) => (
          <span key={label} className="done">{label}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="growth-intro-widget talent">
      <span>潜力探索</span>
      <strong>情境问答</strong>
      <p>先选择偏好，再生成潜力方向。</p>
    </div>
  );
}

function renderInterestProbeWidget(
  step: AgentFlowStep,
  draft: GrowthProbeDraftState,
  onToggleTag: (tag: string) => void,
  onUpdateEvidence: (mode: 'accepted' | 'ignored' | 'idle') => void,
  onUpdateRobot: (mode: 'accepted' | 'ignored' | 'later' | 'idle') => void,
) {
  if (step.id === 'interest-select') {
    return (
      <div className="growth-question-widget">
        <div className="growth-tag-options">
          {interestTagOptions.map((tag) => (
            <button key={tag} type="button" className={draft.interestTags.includes(tag) ? 'selected' : ''} onClick={() => onToggleTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
        <div className={`growth-answer-box ${draft.interestTags.length ? 'filled' : ''}`}>
          <span>我的兴趣</span>
          <p>{draft.interestTags.length ? draft.interestTags.join('、') : '请先选择至少一个兴趣方向。'}</p>
        </div>
      </div>
    );
  }

  if (step.id === 'interest-evidence') {
    const text = draft.interestEvidence === 'accepted'
      ? '是的，把自然观察加入我的兴趣。'
      : draft.interestEvidence === 'ignored'
        ? '这次先不加入自然观察推荐。'
        : '请先确认是否加入自然观察。';

    return (
      <div className="growth-question-widget">
        <div className="growth-tag-options">
          <button type="button" className={draft.interestEvidence === 'accepted' ? 'selected' : ''} onClick={() => onUpdateEvidence('accepted')}>
            加入自然观察
          </button>
          <button type="button" className={draft.interestEvidence === 'ignored' ? 'selected' : ''} onClick={() => onUpdateEvidence('ignored')}>
            忽略推荐
          </button>
        </div>
        <div className={`growth-answer-box ${draft.interestEvidence !== 'idle' ? 'filled' : ''}`}>
          <span>我的确认</span>
          <p>{text}</p>
        </div>
      </div>
    );
  }

  if (step.id === 'interest-robot') {
    const text = draft.interestRobot === 'accepted'
      ? '把机器人也加入我的兴趣，后面可以推荐科学课程。'
      : draft.interestRobot === 'ignored'
        ? '这次暂不加入机器人。'
        : draft.interestRobot === 'later'
          ? '机器人兴趣稍后再确认。'
          : '请先确认机器人是否加入兴趣。';

    return (
      <div className="growth-question-widget">
        <div className="growth-tag-options">
          <button type="button" className={draft.interestRobot === 'accepted' ? 'selected' : ''} onClick={() => onUpdateRobot('accepted')}>
            加入机器人
          </button>
          <button type="button" className={draft.interestRobot === 'ignored' ? 'selected' : ''} onClick={() => onUpdateRobot('ignored')}>
            暂不加入
          </button>
          <button type="button" className={draft.interestRobot === 'later' ? 'selected' : ''} onClick={() => onUpdateRobot('later')}>
            稍后再说
          </button>
        </div>
        <div className={`growth-answer-box ${draft.interestRobot !== 'idle' ? 'filled' : ''}`}>
          <span>我的确认</span>
          <p>{text}</p>
        </div>
      </div>
    );
  }

  const finalTags = [
    ...draft.interestTags,
    ...(draft.interestEvidence === 'accepted' && !draft.interestTags.includes('自然观察') ? ['自然观察'] : []),
    ...(draft.interestRobot === 'accepted' && !draft.interestTags.includes('机器人') ? ['机器人'] : []),
  ];

  return (
    <div className="agent-widget agent-widget-tags growth-result-widget">
      {(finalTags.length ? finalTags : ['自然观察', '机器人', '绘画创作']).map((label) => (
        <span key={label} className="done">{label}</span>
      ))}
    </div>
  );
}

function renderGrowthProbeActions(page: GrowthProbePage, step: AgentFlowStep, draft: GrowthProbeDraftState, onAction: (action: string) => void) {
  let actions: string[] = [step.actionLabel, ...(step.secondaryActions ?? [])];

  if (page === 'abilityAgent' && step.id.startsWith('ability-q')) {
    actions = draft.abilityAnswers[step.id] ? ['重新选择', step.actionLabel] : [];
  }

  if (page === 'talentAgent' && step.id === 'talent-scene') {
    actions = (draft.talentAnswers[step.id]?.length ?? 0) > 0 ? ['重新选择', step.actionLabel] : [];
  }

  if (page === 'talentAgent' && step.id === 'talent-behavior') {
    actions = draft.talentBehavior === 'idle' ? [] : ['重新整理', step.actionLabel];
  }

  if (page === 'interestAgent' && step.id === 'interest-select') {
    actions = draft.interestTags.length ? ['重新选择', step.actionLabel] : [];
  }

  if (page === 'interestAgent' && step.id === 'interest-evidence') {
    actions = draft.interestEvidence === 'idle' ? [] : ['重新确认', step.actionLabel];
  }

  if (page === 'interestAgent' && step.id === 'interest-robot') {
    actions = draft.interestRobot === 'idle' ? [] : ['重新确认', step.actionLabel];
  }

  if (!actions.length) {
    return null;
  }

  return (
    <div className={`growth-action-row ${actions.length > 2 ? 'three' : ''}`}>
      {actions.map((action) => (
        <button key={action} type="button" className={action === step.actionLabel ? 'primary' : ''} onClick={() => onAction(action)}>
          {action}
        </button>
      ))}
    </div>
  );
}

function getDuelRoundByStepId(stepId: DuelStepId) {
  return duelBattleRounds.find((round) => round.questionId === stepId || round.resultId === stepId);
}

function getDuelScoreBefore(round: DuelBattleRound): DuelScore {
  return duelBattleRounds[round.step - 2]?.score ?? duelInitialScore;
}

function isDuelQuestionStep(stepId: DuelStepId) {
  return stepId.startsWith('duel-q');
}

function isDuelRoundResultStep(stepId: DuelStepId) {
  return stepId.startsWith('duel-r') && stepId !== 'duel-result' && stepId !== 'duel-rank';
}

function DuelAgentPage(props: {
  completed: boolean;
  currentStep: AgentFlowStep;
  stepIndex: number;
  stepsTotal: number;
  onAdvance: (actionLabel: string) => void;
  onClose: () => void;
  onOpenAgentFlow: (page: AgentFlowPage) => void;
  onRestartAgentFlow: (page: AgentFlowPage) => void;
  setLastAction: (action: string) => void;
}) {
  const stepId = props.currentStep.id as DuelStepId;
  const battleRound = getDuelRoundByStepId(stepId);
  const [battleDraft, setBattleDraft] = useState<DuelBattleDraftState>(() => createInitialDuelBattleDraftState());

  useEffect(() => {
    if (stepId === 'duel-invite') {
      setBattleDraft(createInitialDuelBattleDraftState());
    }
  }, [stepId]);

  const submitAction = (action: string) => {
    props.onAdvance(action);
  };

  const toggleFormMode = () => {
    setBattleDraft((current) => ({
      ...current,
      formMode: current.formMode === 'manual' ? 'drafted' : 'manual',
    }));
  };

  const handleAction = (action: string) => {
    if (battleRound && isDuelQuestionStep(stepId)) {
      if (battleRound.kind === 'choice') {
        if (battleRound.controls.includes(action)) {
          setBattleDraft((current) => ({
            ...current,
            choice: action === '选择动物' ? '动物' : action === '选择植物' ? '植物' : '不确定',
          }));
          submitAction(action);
          return;
        }
      } else if (battleRound.kind === 'photo') {
        if (action === '拍照' || action === '重新拍摄') {
          setBattleDraft((current) => ({ ...current, photoMode: 'camera' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已模拟拍照并填充回答。`);
          return;
        }

        if (action === '从相册选择' || action === '重新选择') {
          setBattleDraft((current) => ({ ...current, photoMode: 'album' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已从相册选图并填充回答。`);
          return;
        }

        if (action === battleRound.actionLabel) {
          submitAction(action);
          return;
        }
      } else if (battleRound.kind === 'voice') {
        if (action === '录音') {
          setBattleDraft((current) => ({ ...current, voiceMode: 'recorded' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已模拟录音并生成转写。`);
          return;
        }

        if (action === '重新录音') {
          setBattleDraft((current) => ({ ...current, voiceMode: 'idle' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已重录，等待再次录音。`);
          return;
        }

        if (action === battleRound.actionLabel) {
          submitAction(action);
          return;
        }
      } else if (battleRound.kind === 'form') {
        if (action === 'AI 整理信息' || action === '手动填写') {
          setBattleDraft((current) => ({ ...current, formMode: action === '手动填写' ? 'manual' : 'drafted' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已整理关键信息，等待提交。`);
          return;
        }

        if (action === '修改') {
          toggleFormMode();
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已修改关键信息。`);
          return;
        }

        if (action === battleRound.actionLabel && battleDraft.formMode !== 'idle') {
          submitAction(action);
          return;
        }
      } else if (battleRound.kind === 'relation') {
        if (action === '语音回答') {
          setBattleDraft((current) => ({ ...current, relationMode: 'voice' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已生成语音回答草稿。`);
          return;
        }

        if (action === '文字输入') {
          setBattleDraft((current) => ({ ...current, relationMode: 'text' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已生成文字回答草稿。`);
          return;
        }

        if (action === '重新语音' || action === '重新输入') {
          setBattleDraft((current) => ({ ...current, relationMode: 'idle' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已清空回答，等待重新输入。`);
          return;
        }

        if (action === battleRound.actionLabel && battleDraft.relationMode !== 'idle') {
          submitAction(action);
          return;
        }
      } else if (battleRound.kind === 'summary') {
        if (action === '整理任务卡') {
          setBattleDraft((current) => ({ ...current, summaryMode: 'drafted', summaryNote: '已把前面 5 步的记录整理好。' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已整理任务卡。`);
          return;
        }

        if (action === '补充一句') {
          setBattleDraft((current) => ({ ...current, summaryMode: 'drafted', summaryNote: '补充：它在树枝上停留的样子让我想到“家”也需要观察环境。' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已补充一句。`);
          return;
        }

        if (action === '重新整理') {
          setBattleDraft((current) => ({ ...current, summaryMode: 'idle', summaryNote: '' }));
          props.setLastAction(`斗卡 · Step ${battleRound.step}/6：已重新整理任务卡。`);
          return;
        }

        if (action === battleRound.actionLabel && battleDraft.summaryMode !== 'idle') {
          submitAction(action);
          return;
        }
      }

      if (battleRound.controls.includes(action)) {
        props.setLastAction(`斗卡 · Step ${battleRound.step}/6：${action}`);
        return;
      }
    }

    if (battleRound && isDuelRoundResultStep(stepId) && action === battleRound.resultActionLabel) {
      props.onAdvance(action);
      return;
    }

    const primaryAdvance: Partial<Record<DuelStepId, string>> = {
      'duel-invite': '接受斗卡',
      'duel-rules': '开始斗卡',
      'duel-result': '查看完整排行榜',
    };

    if (primaryAdvance[stepId] === action) {
      props.onAdvance(action);
      return;
    }

    if (action === '再挑战一次') {
      props.onRestartAgentFlow('duelAgent');
      return;
    }

    if (action === '查看完成态任务卡') {
      props.onOpenAgentFlow('taskCardAgent');
      props.setLastAction('已打开完成态任务卡。');
      return;
    }

    if (action === '返回任务卡组' || action === '查看我的累计卡片') {
      props.onOpenAgentFlow('cardBagAgent');
      props.setLastAction(action === '返回任务卡组' ? '已返回任务卡组。' : '已打开我的累计卡片。');
      return;
    }

    if (action === '返回任务主相') {
      props.onClose();
      props.setLastAction('已返回任务主屏。');
      return;
    }

    props.setLastAction(`斗卡 · ${props.currentStep.phase}：${action}`);
  };

  return (
    <div className="demo-stack mainline-chat-stack duel-agent-stack">
      <div className="mainline-page-bar duel-page-bar">
        <button type="button" onClick={props.onClose} aria-label="返回主屏">
          ←
        </button>
        <div>
          <span>{props.currentStep.phase}</span>
          <strong>{props.currentStep.title}</strong>
          <p>任务一：探访“野朋友”</p>
        </div>
        <div className="mainline-progress-pill" aria-label="斗卡进度">
          <span>{props.currentStep.progress ?? formatStep(props.stepIndex, props.stepsTotal)}</span>
        </div>
      </div>

      <div className="duel-page-scroll">
        {stepId === 'duel-invite' ? <DuelInviteStep onAction={handleAction} /> : null}
        {stepId === 'duel-rules' ? <DuelRulesStep onAction={handleAction} /> : null}
        {battleRound && isDuelQuestionStep(stepId) ? <DuelBattleQuestionStep round={battleRound} draft={battleDraft} onAction={handleAction} /> : null}
        {battleRound && isDuelRoundResultStep(stepId) ? <DuelBattleResultStep round={battleRound} draft={battleDraft} onAction={handleAction} /> : null}
        {stepId === 'duel-result' ? <DuelResultStep onAction={handleAction} /> : null}
        {stepId === 'duel-rank' ? <DuelRankStep completed={props.completed} onAction={handleAction} /> : null}
      </div>
    </div>
  );
}

function DuelInviteStep(props: { onAction: (action: string) => void }) {
  return (
    <div className="duel-step duel-invite-step">
      <div className="duel-bubble-row">
        <span className="duel-bot-face">AI</span>
        <p>小宇向你发起了任务斗卡邀请，快来看看吧！</p>
      </div>

      <section className="duel-card duel-invite-card">
        <div className="duel-card-title">
          <span>任务斗卡邀请</span>
          <strong>小宇邀请你挑战【任务一：探访“野朋友”】</strong>
        </div>
        <div className="duel-challenger-card">
          <span className="duel-avatar">宇</span>
          <div>
            <strong>小宇</strong>
            <p>发起人评级 A</p>
          </div>
          <em>任务一：探访“野朋友”</em>
        </div>
        <div className="duel-challenger-stats">
          <span><b>1280</b>成长值</span>
          <span><b>36</b>累计卡片</span>
          <span><b>6</b>同套问题</span>
        </div>
        <div className="duel-note">
          <strong>斗卡说明</strong>
          <p>完成同一套 6 个问题，系统会根据基础有效分、速度分、创意分和进步分计算综合 PK 分。</p>
        </div>
        <div className="duel-preview-strip">
          {['选择观察对象', '拍下野朋友', '说出观察', '确认信息', '生态关系', '完成结算'].map((item, index) => (
            <span key={item}>
              <b>{index + 1}</b>
              {item}
            </span>
          ))}
        </div>
        <div className="duel-action-row">
          {['接受斗卡', '稍后'].map((action) => (
            <button key={action} type="button" onClick={() => props.onAction(action)}>
              {action}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function DuelRulesStep(props: { onAction: (action: string) => void }) {
  return (
    <div className="duel-step duel-rules-step">
      <section className="duel-rule-hero">
        <strong>综合斗卡规则</strong>
        <p>斗卡不是只比谁快，而是根据每道题的特点计算综合表现。</p>
      </section>

      <section className="duel-card">
        <div className="duel-rule-formula">
          {[
            ['基础有效分', '是否完成本题，是否符合题意，内容是否有效。'],
            ['速度分', '在保证质量的前提下，完成越快得分越高。'],
            ['创意分', '开放题中想法是否具体、有新意、有思考。'],
            ['进步分', '本次表现相比历史同类题是否进步。'],
          ].map(([title, desc]) => (
            <article key={title}>
              <span>{title.slice(0, 1)}</span>
              <div>
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="duel-equations">
          <p>单题得分 = 基础有效分 + 速度分 + 创意分 + 进步分</p>
          <p>任务 PK 总分 = 各题得分累计 + 完成奖励分</p>
        </div>
      </section>

      <section className="duel-card duel-question-types">
        <strong>题型差异说明</strong>
        <div>
          <span>单选题<br />重点看有效性和速度</span>
          <span>拍照题<br />看是否有效、是否清晰、完成速度</span>
          <span>语音/思考题<br />看表达完整度、创意和进步</span>
        </div>
      </section>

      <button type="button" className="duel-primary-action" onClick={() => props.onAction('开始斗卡')}>
        开始斗卡
      </button>
    </div>
  );
}

function DuelScoreBoard(props: {
  mine: number;
  opponent: number;
  mineProgress: number;
  opponentProgress: number;
}) {
  const mineWidth = `${Math.max(4, Math.min(100, (props.mineProgress / 6) * 100))}%`;
  const opponentWidth = `${Math.max(4, Math.min(100, (props.opponentProgress / 6) * 100))}%`;

  return (
    <section className="duel-pk-board">
      <div className="duel-player blue">
        <span>你</span>
        <strong>{props.mine}</strong>
        <em>当前进度 {props.mineProgress}/6</em>
      </div>
      <div className="duel-vs-mark">VS</div>
      <div className="duel-player red">
        <span>小宇</span>
        <strong>{props.opponent}</strong>
        <em>{props.opponentProgress}/6</em>
      </div>
      <div className="duel-progress-line">
        <i style={{ width: mineWidth }} />
        <b style={{ width: opponentWidth }} />
      </div>
      <p>综合 PK 分 = 各题得分累计 + 完成奖励分</p>
    </section>
  );
}

function DuelBattleQuestionStep(props: {
  round: DuelBattleRound;
  draft: DuelBattleDraftState;
  onAction: (action: string) => void;
}) {
  const score = getDuelScoreBefore(props.round);
  const actions = getDuelBattleQuestionActions(props.round, props.draft);
  const actionColumns = Math.max(1, Math.min(3, actions.length));

  return (
    <div className="duel-step duel-battle-step">
      <DuelScoreBoard mine={score.mine} opponent={score.opponent} mineProgress={props.round.step - 1} opponentProgress={props.round.step - 1} />

      <section className={`duel-card duel-battle-card ${props.round.kind}`}>
        <div className="duel-question-head">
          <span>Step {props.round.step}</span>
          <strong>{props.round.questionTitle}</strong>
          <em>答题中</em>
        </div>
        <p className="duel-question-prompt">{props.round.prompt}</p>
        {renderDuelQuestionInput(props.round, props.draft, props.onAction)}
        {props.round.kind === 'choice' ? null : (
          <div className="duel-action-row duel-action-row-dynamic" style={{ gridTemplateColumns: `repeat(${actionColumns}, minmax(0, 1fr))` }}>
            {actions.map((action) => (
              <button key={action} type="button" className={action === props.round.actionLabel ? 'primary' : ''} onClick={() => props.onAction(action)}>
                {action}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function getDuelBattleQuestionActions(round: DuelBattleRound, draft: DuelBattleDraftState) {
  switch (round.kind) {
    case 'choice':
      return round.controls;
    case 'photo':
      if (draft.photoMode === 'camera') {
        return ['重新拍摄', '从相册选择', '提交照片'];
      }
      if (draft.photoMode === 'album') {
        return ['拍照', '重新选择', '提交照片'];
      }
      return ['拍照', '从相册选择'];
    case 'voice':
      return draft.voiceMode === 'recorded' ? ['重新录音', '提交录音'] : ['录音'];
    case 'form':
      return draft.formMode === 'idle' ? ['AI 整理信息', '手动填写'] : ['修改', '提交本题'];
    case 'relation':
      if (draft.relationMode === 'voice') {
        return ['重新语音', '提交回答'];
      }
      if (draft.relationMode === 'text') {
        return ['重新输入', '提交回答'];
      }
      return ['语音回答', '文字输入'];
    case 'summary':
      return draft.summaryMode === 'drafted' ? ['重新整理', '提交任务卡'] : ['整理任务卡', '补充一句'];
    default:
      return round.controls;
  }
}

function renderDuelQuestionInput(round: DuelBattleRound, draft: DuelBattleDraftState, onAction: (action: string) => void) {
  switch (round.kind) {
    case 'choice':
      return (
        <div className="task-choice-list duel-choice-list">
          {[
            ['1', '动物', '本次示例选择', '选择动物'],
            ['2', '植物', '也可以选择植物', '选择植物'],
            ['3', '不确定', '让 AI 帮你判断', '不确定'],
          ].map(([index, label, desc, action]) => (
            <button key={label} type="button" className={draft.choice === label ? 'selected' : ''} onClick={() => onAction(action)} aria-label={action}>
              <b>{index}</b>
              <strong>{label}</strong>
              <em>{desc}</em>
            </button>
          ))}
        </div>
      );
    case 'photo':
      return (
        <div className={`agent-widget task-photo-widget duel-task-widget ${draft.photoMode === 'idle' ? 'idle' : 'pass'}`}>
          <div className="task-photo-frame">
            <span>{draft.photoMode === 'idle' ? '等待拍照' : draft.photoMode === 'camera' ? '已模拟拍照' : '已从相册选择'}</span>
            <strong>{draft.photoMode === 'idle' ? '先拍照或从相册选择图片' : draft.photoMode === 'camera' ? '小鸟停在树枝上' : '同一只小鸟照片'}</strong>
          </div>
          <div className="task-ai-check">
            <b>{draft.photoMode === 'idle' ? '等待提交' : '照片已填充'}</b>
            <span>{draft.photoMode === 'idle' ? '先拍照或从相册选择，我会帮你判断是否符合任务要求。' : '提交照片后，我会判断是否符合“探访野朋友”。'}</span>
          </div>
        </div>
      );
    case 'voice':
      return (
        <div className={`agent-widget task-voice-widget duel-task-widget ${draft.voiceMode === 'idle' ? 'idle' : 'pass'}`}>
          <div className="task-photo-thumb">{draft.voiceMode === 'idle' ? '录音' : '完成'}</div>
          <div className="task-record-panel">
            <span>{draft.voiceMode === 'idle' ? '等待录音' : '语音已录入'}</span>
            <strong>{draft.voiceMode === 'idle' ? '点击录音' : '00:28'}</strong>
            <i />
          </div>
          <div className="task-transcript">
            <b>语音转文字</b>
            <p>{draft.voiceMode === 'idle' ? '录完后会自动生成转写文本。' : '我看到它在水边的树枝上，周围有绿色叶子和水沟。'}</p>
          </div>
        </div>
      );
    case 'form':
      return (
        <div className={`agent-widget task-form-widget duel-task-widget ${draft.formMode === 'idle' ? 'idle' : 'pass'}`}>
          {(
            draft.formMode === 'idle'
              ? [
                  ['物种名称', '待整理', 'AI 建议'],
                  ['数量', '待整理', '可修改'],
                  ['地点', '待整理', '自动定位'],
                  ['时间', '待整理', '自动填入'],
                ]
              : draft.formMode === 'manual'
                ? [
                    ['物种名称', '红树林小鸟', '手动确认'],
                    ['数量', '1 只', '已修改'],
                    ['地点', '福田红树林生态公园水边步道', '手动填写'],
                    ['时间', '09:46', '已更新'],
                  ]
                : [
                    ['物种名称', '红树林小鸟', 'AI 建议'],
                    ['数量', '1 只', '可修改'],
                    ['地点', '福田红树林生态公园步道附近', '自动定位'],
                    ['时间', '09:45', '自动填入'],
                  ]
          ).map(([label, value, tag]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <em>{tag}</em>
            </div>
          ))}
          <p>
            {draft.formMode === 'idle'
              ? '先整理信息，再提交本题。'
              : draft.formMode === 'manual'
                ? '已根据你的修改更新了信息，确认后提交。'
                : '语音摘要：它在水沟附近的树枝上停留，周围有水和植物。'}
          </p>
        </div>
      );
    case 'relation':
      return (
        <div className={`agent-widget task-relation-widget duel-task-widget ${draft.relationMode === 'idle' ? 'idle' : 'pass'}`}>
          <div className="relation-hints">
            {['食物', '水源', '树木', '躲藏'].map((hint) => (
              <span key={hint}>{hint}</span>
            ))}
          </div>
          <div className="relation-answer-box">
            <b>{draft.relationMode === 'idle' ? '等待回答' : draft.relationMode === 'voice' ? '语音回答' : '文字输入'}</b>
            <p>
              {draft.relationMode === 'idle'
                ? '先语音回答或者文字输入，我会把你的想法整理出来。'
                : '它在水沟附近停留，周围有水和植物，可能方便找食物和躲藏。'}
            </p>
          </div>
        </div>
      );
    case 'summary':
      return (
        <div className="duel-summary-confirm">
          {(
            draft.summaryMode === 'drafted'
              ? [
                  `观察对象：${draft.choice ?? '动物'}`,
                  `照片：${draft.photoMode === 'album' ? '从相册选择' : draft.photoMode === 'camera' ? '已模拟拍照' : '待补充'}`,
                  `语音：${draft.voiceMode === 'recorded' ? '28 秒' : '待录音'}`,
                  `生态关系：${draft.relationMode === 'voice' ? '语音回答' : draft.relationMode === 'text' ? '文字输入' : '待补充'}`,
                  draft.summaryNote || '已整理完成，可以提交任务卡。',
                ]
              : ['观察对象：待整理', '照片：待整理', '语音：待整理', '生态关系：待整理']
          ).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function DuelBattleResultStep(props: {
  round: DuelBattleRound;
  draft: DuelBattleDraftState;
  onAction: (action: string) => void;
}) {
  const answerSummary = (() => {
    switch (props.round.step) {
      case 1:
        return `你选择了“${props.draft.choice ?? '动物'}”，系统已记录观察对象类型。`;
      case 2:
        return props.draft.photoMode === 'album'
          ? '你从相册选择了一张小鸟照片，主体清晰。'
          : '你模拟拍了一张小鸟停在树枝上的照片，主体清晰。';
      case 3:
        return '语音 28 秒：它在水边的树枝上，周围有绿色叶子和水沟。';
      case 4:
        return props.draft.formMode === 'manual'
          ? '你手动微调了物种、地点和时间，信息已经确认。'
          : '物种、地点、时间和语音摘要均已确认。';
      case 5:
        return props.draft.relationMode === 'text'
          ? '文字输入：它在水沟附近停留，周围有水和植物，可能方便找食物和躲藏。'
          : '语音回答：它在水沟附近停留，周围有水和植物，可能方便找食物和躲藏。';
      case 6:
        return props.draft.summaryNote || '观察对象、照片、语音、信息和生态关系回答已全部提交。';
      default:
        return props.round.answerSummary;
    }
  })();

  return (
    <div className="duel-step duel-battle-step">
      <DuelScoreBoard mine={props.round.score.mine} opponent={props.round.score.opponent} mineProgress={props.round.step} opponentProgress={props.round.step} />

      <section className="duel-card duel-single-result-card">
        <div className="duel-question-head">
          <span>Step {props.round.step}</span>
          <strong>{props.round.resultTitle}</strong>
          <em>本题 {props.round.questionScore}/20</em>
        </div>
        <div className="duel-answer-summary">
          <span>你的答案</span>
          <p>{answerSummary}</p>
        </div>
        <div className="duel-ai-result">
          <strong>{props.round.feedback}</strong>
          <span>通过</span>
        </div>
        <div className="duel-round-score">
          <div>
            <span>你</span>
            <strong>+{props.round.questionScore}</strong>
          </div>
          <b>VS</b>
          <div>
            <span>小宇</span>
            <strong>+{props.round.opponentQuestionScore}</strong>
          </div>
        </div>
        <div className="duel-metric-row">
          {props.round.metrics.map((metric) => (
            <span key={metric.label}>
              <b>+{metric.mine}</b>
              {metric.label}
            </span>
          ))}
        </div>
        <button type="button" className="duel-primary-action" onClick={() => props.onAction(props.round.resultActionLabel)}>
          {props.round.resultActionLabel}
        </button>
      </section>
    </div>
  );
}

function DuelResultStep(props: { onAction: (action: string) => void }) {
  const comparison = [
    ['基础有效分', 48, 46],
    ['速度分', 12, 15],
    ['创意分', 18, 14],
    ['进步分', 10, 6],
    ['完成奖励分', 4, 7],
  ] as const;

  return (
    <div className="duel-step duel-result-step">
      <section className="duel-result-hero">
        <span>斗卡完成</span>
        <strong>你赢了</strong>
        <p>太棒了！继续保持观察力！</p>
      </section>

      <section className="duel-result-vs">
        <div className="blue">
          <span>你</span>
          <strong>92</strong>
          <em>A 评级 · +50 成长值</em>
        </div>
        <b>VS</b>
        <div className="red">
          <span>小宇</span>
          <strong>88</strong>
          <em>A 评级 · +35 成长值</em>
        </div>
      </section>

      <section className="duel-card duel-breakdown-card">
        <div className="duel-card-title">
          <span>分项表现对比</span>
          <strong>你 / 小宇</strong>
        </div>
        {comparison.map(([label, mine, opponent]) => (
          <div key={label} className="duel-compare-row">
            <span>{label}</span>
            <b>{mine}</b>
            <i>
              <em style={{ width: `${Math.min(100, mine + 28)}%` }} />
              <strong style={{ width: `${Math.min(100, opponent + 28)}%` }} />
            </i>
            <b>{opponent}</b>
          </div>
        ))}
      </section>

      <section className="duel-card duel-rank-digest">
        <strong>排行榜摘要</strong>
        <div>
          <span>参与人数 <b>8 人</b></span>
          <span>当前排名 <b>第 2 名</b></span>
        </div>
        <button type="button" onClick={() => props.onAction('查看完整排行榜')}>
          查看完整排行榜
        </button>
      </section>

      <div className="duel-action-row four">
        {['再挑战一次', '邀请其他好友', '查看完成态任务卡', '返回任务卡组'].map((action) => (
          <button key={action} type="button" onClick={() => props.onAction(action)}>
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

function DuelRankStep(props: { completed: boolean; onAction: (action: string) => void }) {
  const rows = [
    ['1', '小宇', '95', 'A+', '1280', '36'],
    ['2', '我', '92', 'A', '980', '28'],
    ['3', '小林', '88', 'A', '860', '24'],
    ['4', '小雨', '82', 'B', '720', '21'],
    ['5', '阿杰', '78', 'B', '640', '18'],
    ['6', '晨晨', '72', 'B', '540', '16'],
    ['7', '乐乐', '65', 'C', '420', '12'],
    ['8', '可可', '58', 'C', '360', '10'],
  ];

  return (
    <div className="duel-step duel-rank-step">
      <section className="duel-card duel-rank-task-card">
        <div className="duel-task-thumb" />
        <div>
          <strong>任务一：探访“野朋友”</strong>
          <p>观察力 · 表达力 · 科学思维</p>
          <span>参与人数：8 人</span>
          <span>当前排名：第 2 名</span>
        </div>
      </section>

      <section className="duel-card duel-my-rank">
        <span>我的排名</span>
        <div>
          <strong>92</strong>
          <em>综合 PK 分</em>
        </div>
        <div>
          <strong>A</strong>
          <em>评级</em>
        </div>
        <div>
          <strong>+50</strong>
          <em>成长值</em>
        </div>
        {props.completed ? <p>排行榜每 10 分钟更新一次。</p> : null}
      </section>

      <section className="duel-card duel-rank-table">
        <div className="duel-table-head">
          <span>名次</span>
          <span>昵称</span>
          <span>PK 分</span>
          <span>评级</span>
          <span>成长值</span>
          <span>卡片</span>
        </div>
        {rows.map(([rank, name, score, grade, growth, cards]) => (
          <div key={rank} className={name === '我' ? 'mine' : ''}>
            <span>{rank}</span>
            <strong>{name}</strong>
            <b>{score}</b>
            <em>{grade}</em>
            <span>{growth}</span>
            <span>{cards}</span>
          </div>
        ))}
      </section>

      <div className="duel-action-row four">
        {['再挑战一次', '邀请好友', '查看我的累计卡片', '返回任务主相'].map((action) => (
          <button key={action} type="button" onClick={() => props.onAction(action)}>
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

function MainlineChatPage(props: {
  currentStep: MainlineChatStep;
  growthValue: number;
  mainlineCompleted: boolean;
  mainlineMessages: MainlineChatStep[];
  mainlineStepIndex: number;
  mainlineStepsTotal: number;
  onAdvanceMainline: (actionLabel: string) => void;
  onCloseMainlineChat: () => void;
}) {
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = streamRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [props.mainlineMessages, props.mainlineStepIndex, props.mainlineCompleted]);

  return (
    <div className="demo-stack mainline-chat-stack">
      <div className="mainline-page-bar">
        <button type="button" onClick={props.onCloseMainlineChat} aria-label="返回主屏">
          ←
        </button>
        <div>
          <span>研小宝主线对话</span>
          <strong>{props.mainlineCompleted ? '主线已完成' : props.currentStep.phase}</strong>
          <p>{props.currentStep.title}</p>
        </div>
        <div className="mainline-progress-pill" aria-label="主线进度">
          <span>{formatStep(props.mainlineStepIndex, props.mainlineStepsTotal)}</span>
        </div>
      </div>

      <div ref={streamRef} className="mainline-stream">
        {props.mainlineMessages.map((step, index) => {
          const isCurrent = index === props.mainlineStepIndex;

          return (
            <article key={step.id} className={`mainline-turn ${isCurrent ? 'current' : ''} ${index % 2 === 0 ? 'agent-turn' : 'student-turn'}`}>
              <div className="card-head">
                <span>{step.phase}</span>
                <strong>{step.progress ?? formatStep(index, props.mainlineStepsTotal)}</strong>
              </div>
              <h3>{step.title}</h3>
              <div className="mainline-body">
                {step.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              {step.tags?.length ? (
                <div className="task-meta">
                  {step.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
              {step.visual ? <div className="mainline-visual">{step.visual}</div> : null}
              {step.studentReply ? (
                <div className="mainline-student-reply">
                  <strong>你</strong>
                  <p>{step.studentReply}</p>
                </div>
              ) : null}
              {isCurrent ? renderMainlineStepWidget(step, props.growthValue) : null}
              {isCurrent && !props.mainlineCompleted ? (
                <div className="action-grid">
                  <button type="button" onClick={() => props.onAdvanceMainline(step.actionLabel)}>
                    {step.actionLabel}
                  </button>
                  {step.secondaryActions?.map((action) => (
                    <button key={action} type="button" onClick={() => props.onAdvanceMainline(action)}>
                      {action}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function AgentFlowChatPage(props: {
  completed: boolean;
  currentStep: AgentFlowStep;
  definition: AgentFlowDefinition;
  messages: AgentFlowStep[];
  profileCompletion: number;
  stepIndex: number;
  onAdvance: (actionLabel: string) => void;
  onClose: () => void;
}) {
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = streamRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [props.messages, props.stepIndex, props.completed]);

  return (
    <div className="demo-stack mainline-chat-stack agent-flow-chat-stack">
      <div className="mainline-page-bar">
        <button type="button" onClick={props.onClose} aria-label="返回主屏">
          ←
        </button>
        <div>
          <span>{props.definition.title}</span>
          <strong>{props.completed ? `${props.definition.navLabel}已完成` : props.currentStep.phase}</strong>
          <p>{props.currentStep.title}</p>
        </div>
        <div className="mainline-progress-pill" aria-label={`${props.definition.navLabel}进度`}>
          <span>{props.currentStep.progress ?? formatStep(props.stepIndex, props.definition.steps.length)}</span>
        </div>
      </div>

      <div ref={streamRef} className="mainline-stream">
        {props.messages.map((step, index) => {
          const isCurrent = index === props.stepIndex;
          const hasInlineActions = step.widget === 'task-choice';

          return (
            <article key={step.id} className={`mainline-turn ${isCurrent ? 'current' : ''} ${index % 2 === 0 ? 'agent-turn' : 'student-turn'}`}>
              <div className="card-head">
                <span>{step.phase}</span>
                <strong>{step.progress ?? formatStep(index, props.definition.steps.length)}</strong>
              </div>
              <h3>{step.title}</h3>
              <div className="mainline-body">
                {step.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              {step.tags?.length ? (
                <div className="task-meta">
                  {step.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
              {step.visual ? <div className="mainline-visual">{step.visual}</div> : null}
              {step.studentReply ? (
                <div className="mainline-student-reply">
                  <strong>你</strong>
                  <p>{step.studentReply}</p>
                </div>
              ) : null}
              {isCurrent ? renderAgentFlowWidget(step, props.definition.page, props.profileCompletion, props.onAdvance) : null}
              {isCurrent && !hasInlineActions && (!props.completed || (props.definition.page === 'taskCardAgent' && step.id === 'task-settlement')) ? (
                <div className="action-grid">
                  <button type="button" onClick={() => props.onAdvance(step.actionLabel)}>
                    {step.actionLabel}
                  </button>
                  {step.secondaryActions?.map((action) => (
                    <button key={action} type="button" onClick={() => props.onAdvance(action)}>
                      {action}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function renderAgentFlowWidget(step: AgentFlowStep, page: AgentFlowPage, profileCompletion: number, onAdvance?: (actionLabel: string) => void) {
  switch (step.widget) {
    case 'task-choice':
      return (
        <div className="agent-widget task-question-widget">
          <div className="task-question-title">
            <span>请选择一项</span>
            <strong>观察对象类型</strong>
          </div>
          <div className="task-choice-list">
            {[
              ['1', '动物', '本次示例选择', '选择动物'],
              ['2', '植物', '也可以选择植物', '选择植物'],
              ['3', '不确定', '让 AI 帮你判断', '不确定'],
            ].map(([index, label, desc, action]) => (
              <button key={label} type="button" onClick={() => onAdvance?.(action)} aria-label={action}>
                <b>{index}</b>
                <strong>{label}</strong>
                <em>{desc}</em>
              </button>
            ))}
          </div>
        </div>
      );
    case 'task-photo': {
      const isReject = step.id === 'task-photo-reject';
      const isPass = step.id === 'task-photo-pass';

      return (
        <div className={`agent-widget task-photo-widget ${isReject ? 'reject' : isPass ? 'pass' : ''}`}>
          <div className="task-photo-frame">
            <span>{isReject ? '待重拍照片' : '野朋友照片'}</span>
            <strong>{isReject ? '未识别到动物/植物主体' : '小鸟停在树枝上'}</strong>
          </div>
          <div className="task-ai-check">
            <b>{isReject ? 'AI 检查未通过' : isPass ? 'AI 检查通过' : 'AI 检查中'}</b>
            <span>{isReject ? '请重新拍摄清晰的观察对象。' : isPass ? '照片主体清晰，可作为本题答案。' : '请提交照片后，我会判断是否符合任务。'}</span>
          </div>
          <div className="task-tool-row">
            {['拍照', '从相册选择', '重新拍摄'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      );
    }
    case 'task-voice':
      return (
        <div className="agent-widget task-voice-widget">
          <div className="task-photo-thumb">照片</div>
          <div className="task-record-panel">
            <span>正在转写</span>
            <strong>00:18</strong>
            <i />
          </div>
          <div className="task-transcript">
            <b>语音转文字</b>
            <p>我看到它在水边的树枝上，叶子是绿色的，长在靠近水沟的地方。</p>
          </div>
        </div>
      );
    case 'task-form':
      return (
        <div className="agent-widget task-form-widget">
          {[
            ['物种名称', '红树林植物', 'AI 建议'],
            ['数量', '约 3 株 / 1 只', '可修改'],
            ['地点', '福田红树林生态公园步道附近', '自动定位'],
            ['时间', '09:45', '自动填入'],
          ].map(([label, value, tag]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <em>{tag}</em>
            </div>
          ))}
          <p>语音转写：它在靠近水沟的地方，周围有泥土，也可能给昆虫和鸟类提供生活环境。</p>
        </div>
      );
    case 'task-relation':
      return (
        <div className="agent-widget task-relation-widget">
          <div className="relation-hints">
            {['食物', '水源', '树木', '躲藏'].map((hint) => (
              <span key={hint}>{hint}</span>
            ))}
          </div>
          <div className="relation-answer-box">
            <b>我的回答</b>
            <p>它在水沟附近的树枝上停留，周围有水和植物，可能方便找食物和躲藏。</p>
          </div>
        </div>
      );
    case 'task-feedback':
      return (
        <div className="agent-widget task-feedback-widget">
          <div className="task-feedback-avatar">AI 小助手</div>
          <div>
            <strong>{step.id === 'task-choice-feedback' ? '已选择观察对象' : '观察记录已保存'}</strong>
            <p>{step.id === 'task-choice-feedback' ? '下一步请拍下它，我会继续帮你判断照片是否符合任务。' : '你能把野朋友和环境联系起来，回答更完整了。'}</p>
          </div>
          <span>{step.id === 'task-choice-feedback' ? '+5 成长值' : '+8 成长值'}</span>
        </div>
      );
    case 'settlement':
      return (
        <div className="agent-widget agent-widget-settlement">
          <div className="reward-report-card">
            <strong>任务综合评价</strong>
            <span>A+ · 超过同年级 82%</span>
            <p>1 张动物照片、28 秒观察语音、能把动物和周围环境联系起来。</p>
          </div>
          <div className="mainline-reward-tags">
            <span>成长值 +50</span>
            <span>卡包点亮</span>
            <span>可斗卡</span>
          </div>
        </div>
      );
    case 'card-bag':
      return (
        <div className="agent-widget agent-widget-cardbag">
          <div className="summary-grid">
            <div>
              <strong>36</strong>
              <span>累计卡片</span>
            </div>
            <div>
              <strong>5</strong>
              <span>A+ 高分卡</span>
            </div>
            <div>
              <strong>8</strong>
              <span>斗卡胜利</span>
            </div>
          </div>
          {cardCollection.slice(0, 3).map((card) => (
            <article key={card.title} className="cardbag-card compact">
              <span>{card.grade}</span>
              <div>
                <strong>{card.title}</strong>
                <p>{card.series} · {card.status}</p>
              </div>
            </article>
          ))}
        </div>
      );
    case 'duel': {
      const showScore = step.id.startsWith('duel-r') || step.id === 'duel-result';
      const ruleItems = step.id === 'duel-rule'
        ? [
            ['基础', '题意正确'],
            ['速度', '限时完成'],
            ['创意', '观察新颖'],
            ['进步', '比上次更好'],
          ]
        : [
            ['我方', '小明同学'],
            ['对方', step.id === 'duel-timeout' ? '等待应战' : '小宇同学'],
            ['任务', '探访野朋友'],
            ['模式', step.id === 'duel-timeout' ? '邀请保留' : '同步答题'],
          ];

      return (
        <div className="agent-widget agent-widget-duel">
          {showScore ? (
            <>
              <div className="score-line">
                <span>我方 92</span>
                <i />
                <span>对方 88</span>
              </div>
              <div className="duel-score-breakdown">
                {[
                  ['基础', 40],
                  ['速度', 18],
                  ['创意', 20],
                  ['进步', 14],
                ].map(([label, value]) => (
                  <span key={label}>
                    {label} {value}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="duel-info-grid">
              {ruleItems.map(([label, value]) => (
                <span key={label}>
                  <b>{label}</b>
                  <em>{value}</em>
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }
    case 'ability':
      return (
        <div className="agent-widget agent-widget-radar">
          {[
            ['观察', 92],
            ['表达', 84],
            ['协作', 88],
            ['思考', 86],
          ].map(([label, value]) => (
            <div key={label} className="metric-row">
              <span>{label}</span>
              <i>
                <b className="blue" style={{ width: `${value}%` }} />
              </i>
              <em>{value}</em>
            </div>
          ))}
        </div>
      );
    case 'talent':
      return (
        <div className="agent-widget agent-widget-tags">
          {['自然观察讲解员', '证据整理', '结构化表达', '生态讲解员'].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      );
    case 'interest':
      return (
        <div className="agent-widget agent-widget-tags">
          {['自然观察', '机器人', '绘画创作', '生态设施', 'AI 创作'].map((label) => (
            <span key={label} className={step.body.join('').includes(label) || step.tags?.includes(label) ? 'done' : ''}>
              {label}
            </span>
          ))}
        </div>
      );
    case 'profile':
      return (
        <div className="agent-widget agent-widget-profile">
          <div className="profile-ring">
            <strong>{profileCompletion}%</strong>
            <span>画像完成度</span>
          </div>
          <div className="profile-cards">
            <span>观察强</span>
            <span>协作强</span>
            <span>表达提升</span>
          </div>
        </div>
      );
    case 'diary':
      return (
        <div className="agent-widget agent-widget-diary">
          <div className="mainline-diary-card">
            <span>{step.id === 'diary-save' ? '已保存' : '生成中'}</span>
            <strong>《我给“野朋友”设计了一个家》</strong>
            <p>包含观察照片、语音记录、小组方案、研学报告摘要和成长变化。</p>
          </div>
          <div className="diary-material-grid">
            {['任务作品', '观察照片', '语音记录', '成长档案'].map((item) => (
              <span key={item} className={step.id === 'diary-save' ? 'done' : ''}>
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    default:
      return page === 'diaryAgent' ? <div className="agent-widget agent-widget-diary" /> : null;
  }
}

function AppsScreen(props: {
  activeAction: string;
  activeApp: MockApp;
  activeAppKey: string;
  activeResult: AppActionResult;
  activeRuntime: AppRuntime;
  actionLog: AppActionLog[];
  appPage: AppPage;
  settingsToggles: SettingsToggles;
  sosStatus: SosStatus;
  stage: number;
  walletCodeVisible: boolean;
  onBack: () => void;
  onOpenApp: (appKey: string) => void;
  onOpenWorkspace: () => void;
  onRunAction: (action: string) => void;
  onToggleSetting: (key: keyof SettingsToggles) => void;
}) {
  if (props.appPage === 'workspace') {
    return (
      <AppWorkspace
        activeAction={props.activeAction}
        activeApp={props.activeApp}
        activeResult={props.activeResult}
        activeRuntime={props.activeRuntime}
        actionLog={props.actionLog}
        settingsToggles={props.settingsToggles}
        sosStatus={props.sosStatus}
        stage={props.stage}
        walletCodeVisible={props.walletCodeVisible}
        onBack={props.onBack}
        onRunAction={props.onRunAction}
        onToggleSetting={props.onToggleSetting}
      />
    );
  }

  if (props.appPage === 'detail') {
    return (
      <AppDetailPage
        activeApp={props.activeApp}
        onBack={props.onBack}
        onOpenWorkspace={props.onOpenWorkspace}
        onRunAction={props.onRunAction}
      />
    );
  }

  return (
    <section className="panel apps-panel">
      <SectionHeader eyebrow="右滑进入" title="应用中心" desc="21 个旧版应用入口完整保留，全部使用本地 mock 主流程演示。" />
      <div className="app-grid">
        {apps.map((app) => (
          <button key={app.key} type="button" className={`${app.accent} ${props.activeAppKey === app.key ? 'active' : ''}`} onClick={() => props.onOpenApp(app.key)}>
            <span>{app.short}</span>
            <strong>{app.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function AppDetailPage(props: {
  activeApp: MockApp;
  onBack: () => void;
  onOpenWorkspace: () => void;
  onRunAction: (action: string) => void;
}) {
  return (
    <section className="panel app-detail-page">
      <div className="app-page-bar">
        <button type="button" onClick={props.onBack} aria-label="返回应用中心">
          ←
        </button>
        <div>
          <span>{props.activeApp.group}</span>
          <strong>{props.activeApp.title}</strong>
        </div>
      </div>
      <AppDetailCard activeApp={props.activeApp} onOpenWorkspace={props.onOpenWorkspace} onRunAction={props.onRunAction} />
    </section>
  );
}

function AppDetailCard(props: {
  activeApp: MockApp;
  onOpenWorkspace: () => void;
  onRunAction: (action: string) => void;
}) {
  return (
    <article className={`app-detail ${props.activeApp.accent}`}>
      <div className="app-preview">
        <Image
          src={props.activeApp.asset}
          alt={`${props.activeApp.title}优化版设计稿`}
          width={853}
          height={1844}
          sizes="360px"
          priority={props.activeApp.key === 'tasks'}
        />
      </div>
      <div className="card-head">
        <span>{props.activeApp.group}</span>
        <strong>{props.activeApp.title}</strong>
      </div>
      <p>{props.activeApp.summary}</p>
      <ul>
        {props.activeApp.states.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {props.activeApp.safety ? <p className="safety-note">{props.activeApp.safety}</p> : null}
      <div className="app-detail-actions">
        <button type="button" className="open-app-action" onClick={props.onOpenWorkspace}>
          进入{props.activeApp.title}
        </button>
      </div>
      <div className="action-grid three">
        {props.activeApp.actions.map((action) => (
          <button key={action} type="button" onClick={() => props.onRunAction(action)}>
            {action}
          </button>
        ))}
      </div>
    </article>
  );
}

function AppWorkspace(props: AppWorkspaceProps) {
  const runtimeItem = props.activeRuntime.feed[props.stage % props.activeRuntime.feed.length];
  const progress = props.activeApp.key === 'sos' && props.sosStatus === 'sent' ? 100 : props.activeApp.key === 'sos' && props.sosStatus === 'confirming' ? 62 : props.activeRuntime.progress;
  const metric = props.activeApp.key === 'sos' ? ({ idle: '未触发', confirming: '等待确认', sent: '已发送' } satisfies Record<SosStatus, string>)[props.sosStatus] : props.activeRuntime.metric;
  const result = props.activeAction === '打开应用' ? { title: props.activeRuntime.headline, desc: props.activeRuntime.primary } : props.activeResult;
  const workspaceLog = props.actionLog.filter((item) => item.app === props.activeApp.title);

  return (
    <section className={`panel app-workspace ${props.activeApp.accent}`}>
      <div className="workspace-titlebar">
        <button type="button" onClick={props.onBack} aria-label="返回应用中心">
          ←
        </button>
        <DeviceIcon label={props.activeApp.short} accent={props.activeApp.accent} />
        <div>
          <span>{props.activeApp.group}</span>
          <h2>{props.activeApp.title}</h2>
          <p>{metric}</p>
        </div>
      </div>

      <article className="workspace-hero">
        <div className="card-head">
          <span>{props.activeAction}</span>
          <strong>{progress}%</strong>
        </div>
        <h3>{props.activeRuntime.headline}</h3>
        <p>{props.activeRuntime.secondary}</p>
        <div className="runtime-progress" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
      </article>

      <article className="runtime-card">
        <span>{runtimeItem.tag}</span>
        <strong>{runtimeItem.title}</strong>
        <p>{runtimeItem.desc}</p>
      </article>

      <SpecialAppSurface {...props} />

      <div className="action-grid three workspace-actions">
        {props.activeApp.actions.map((action) => (
          <button key={action} type="button" onClick={() => props.onRunAction(action)}>
            {action}
          </button>
        ))}
      </div>

      <article className="mock-output">
        <span>本地结果</span>
        <strong>{result.title}</strong>
        <p>{result.desc}</p>
      </article>

      <article className="app-log">
        <span>最近操作</span>
        {(workspaceLog.length ? workspaceLog : [{ app: props.activeApp.title, action: '打开应用', text: '等待本地操作' }]).map((item, index) => (
          <p key={`${item.app}-${item.action}-${index}`}>
            {item.app} · {item.action} · {item.text}
          </p>
        ))}
      </article>
    </section>
  );
}

function SpecialAppSurface(props: AppWorkspaceProps) {
  const pageProfile = getFullAppPageProfile(props.activeApp);

  if (props.activeApp.key === 'wallet') {
    return (
      <>
        <article className="special-surface wallet-surface">
          <div className={props.walletCodeVisible ? 'wallet-code visible' : 'wallet-code'}>
            <span>{props.walletCodeVisible ? 'YXB-PAY-260323' : '点击“付款码”后展示模拟码'}</span>
            <i />
          </div>
          <div className="mini-ledger">
            <p>
              <strong>余额</strong>
              <span>128.80</span>
            </p>
            <p>
              <strong>今日消费</strong>
              <span>16.00</span>
            </p>
            <p>
              <strong>授权</strong>
              <span>家长已授权</span>
            </p>
          </div>
        </article>
        <FullAppMockPage key={props.activeApp.key} activeApp={props.activeApp} profile={pageProfile} />
      </>
    );
  }

  if (props.activeApp.key === 'sos') {
    const statusCopy: Record<SosStatus, { title: string; desc: string }> = {
      idle: { title: '未触发', desc: '长按组合键后先进入防误触确认。' },
      confirming: { title: '等待确认', desc: '5 秒确认窗口已打开，再次点击“长按报警”可模拟发送。' },
      sent: { title: '已模拟发送', desc: '位置、录音片段和报警文字已写入本地状态。' },
    };
    return (
      <>
        <article className={`special-surface sos-surface ${props.sosStatus}`}>
          <strong>{statusCopy[props.sosStatus].title}</strong>
          <p>{statusCopy[props.sosStatus].desc}</p>
          <div className="sos-route">
            <span>带队老师</span>
            <span>生活老师</span>
            <span>家长</span>
          </div>
        </article>
        <FullAppMockPage key={props.activeApp.key} activeApp={props.activeApp} profile={pageProfile} />
      </>
    );
  }

  if (props.activeApp.key === 'settings') {
    return (
      <>
        <article className="special-surface setting-switches">
          {[
            ['face', '人脸识别'],
            ['pay', '支付授权'],
            ['location', '定位权限'],
          ].map(([key, label]) => (
            <button key={key} type="button" className={props.settingsToggles[key as keyof SettingsToggles] ? 'on' : ''} onClick={() => props.onToggleSetting(key as keyof SettingsToggles)}>
              <span>{label}</span>
              <strong>{props.settingsToggles[key as keyof SettingsToggles] ? '开' : '关'}</strong>
            </button>
          ))}
        </article>
        <FullAppMockPage key={props.activeApp.key} activeApp={props.activeApp} profile={pageProfile} />
      </>
    );
  }

  if (props.activeApp.key === 'ask') {
    return (
      <>
        <article className="special-surface chat-surface">
          {props.activeRuntime.feed.map((item) => (
            <p key={item.title} className={item.tag === '研小宝' ? 'agent' : ''}>
              <strong>{item.tag}</strong>
              <span>{item.title}</span>
            </p>
          ))}
        </article>
        <FullAppMockPage key={props.activeApp.key} activeApp={props.activeApp} profile={pageProfile} />
      </>
    );
  }

  if (props.activeApp.key === 'capture') {
    return (
      <>
        <article className="special-surface camera-surface">
          <div>
            <span />
            <strong>红树林生态设施</strong>
          </div>
          <p>画面清晰 · 任务主体完整 · 可提交</p>
        </article>
        <FullAppMockPage key={props.activeApp.key} activeApp={props.activeApp} profile={pageProfile} />
      </>
    );
  }

  return <FullAppMockPage key={props.activeApp.key} activeApp={props.activeApp} profile={pageProfile} />;
}

function FullAppMockPage(props: { activeApp: MockApp; profile: FullAppPageProfile }) {
  const [activeTab, setActiveTab] = useState(props.profile.tabs[0]?.label ?? '概览');
  const activeTabItem = props.profile.tabs.find((item) => item.label === activeTab) ?? props.profile.tabs[0];

  return (
    <article className={`full-app-page ${props.activeApp.accent}`}>
      <div className="full-page-head">
        <span>{props.activeApp.title}页面</span>
        <strong>{props.profile.focus}</strong>
      </div>
      <div className="mock-tab-row">
        {props.profile.tabs.map((tab) => (
          <button key={tab.label} type="button" className={tab.label === activeTabItem?.label ? 'active' : ''} onClick={() => setActiveTab(tab.label)}>
            <strong>{tab.label}</strong>
            <span>{tab.desc}</span>
          </button>
        ))}
      </div>
      <p className="active-tab-copy">{activeTabItem?.desc ?? props.profile.focus}</p>
      <div className="mock-stat-grid">
        {props.profile.metrics.map((metric) => (
          <p key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.desc}</small>
          </p>
        ))}
      </div>
      <div className="mock-record-list">
        <span>业务记录</span>
        {props.profile.records.map((record) => (
          <p key={`${record.tag}-${record.title}`}>
            <strong>
              <b>{record.tag}</b>
              {record.title}
            </strong>
            <span>{record.desc}</span>
          </p>
        ))}
      </div>
      <div className="agent-tip-list">
        <span>Agent 提醒</span>
        {props.profile.agentTips.map((tip) => (
          <p key={tip}>{tip}</p>
        ))}
      </div>
    </article>
  );
}

function VoiceDock(props: { lastAction: string }) {
  return (
    <div className="voice-dock">
      <RobotAvatar mini />
      <div>
        <strong>按住说话</strong>
        <span>{props.lastAction}</span>
      </div>
      <button type="button" aria-label="按住说话">
        <span />
      </button>
    </div>
  );
}

function HeroBlock(props: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="hero-block">
      <span>{props.eyebrow}</span>
      <h2>{props.title}</h2>
      <p>{props.desc}</p>
      <RobotAvatar />
    </div>
  );
}

function SectionHeader(props: { eyebrow: string; title: string; desc: string }) {
  return (
    <header className="section-header">
      <span>{props.eyebrow}</span>
      <h2>{props.title}</h2>
      <p>{props.desc}</p>
    </header>
  );
}

function RobotAvatar(props: { mini?: boolean }) {
  return (
    <div className={props.mini ? 'robot-avatar mini' : 'robot-avatar'} aria-hidden="true">
      <i />
      <b />
      <span />
    </div>
  );
}

function DeviceIcon(props: { label: string; accent: MockApp['accent'] }) {
  return (
    <span className={`device-icon ${props.accent}`}>
      <b>{props.label}</b>
    </span>
  );
}

function Segmented<T extends string>(props: { items: [T, string][]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="segmented">
      {props.items.map(([value, label]) => (
        <button key={value} type="button" className={props.value === value ? 'active' : ''} onClick={() => props.onChange(value)}>
          {label}
        </button>
      ))}
    </div>
  );
}
