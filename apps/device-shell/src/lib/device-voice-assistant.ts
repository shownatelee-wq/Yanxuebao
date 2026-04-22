'use client';

import { useEffect, useState } from 'react';
import { demoSelfTestPlanes, type DemoCapability, type DemoTask, type DemoTeam } from './device-demo-data';
import { type QuickTaskSubmissionPreview } from './device-task-data';

const DEVICE_VOICE_ASSISTANT_KEY = 'yanxuebao_device_voice_assistant_v1';
const DEVICE_VOICE_ASSISTANT_EVENT = 'yanxuebao:device-voice-assistant-change';
const DEVICE_VOICE_ASSISTANT_VERSION = 2;

export type VoiceAssistantScene = 'free' | 'help' | 'team' | 'task' | 'self-test' | 'sos' | 'image' | 'quick-submit';
export type VoiceAssistantResolvedScene = Exclude<VoiceAssistantScene, 'free'>;
export type VoiceAssistantFlowStep = 'wake' | 'understand' | 'plan' | 'confirm' | 'execute';

export type VoiceAssistantImageVariant = {
  id: string;
  title: string;
  styleLabel: string;
  description: string;
  previewLabel: string;
  accent: 'blue' | 'green' | 'orange' | 'purple';
  prompt: string;
  revisedPrompt?: string;
};

export type VoiceAssistantPlan = {
  scene: VoiceAssistantResolvedScene;
  title: string;
  understanding: string;
  planningSummary: string;
  rationale: string[];
  executionQuestion: string;
  appName: string;
  appPath?: string;
  capabilityFocus?: string[];
  helpTips?: string[];
  generatedTask?: DemoTask;
  recommendedTeamIds?: string[];
  selfTestRecommendation?: {
    planeId: string;
    planeTitle: string;
    reason: string;
  };
  imagePrompt?: string;
  quickSubmission?: QuickTaskSubmissionPreview;
  dangerNotice?: string;
};

export type VoiceAssistantExecutionResult = {
  scene: VoiceAssistantResolvedScene;
  title: string;
  detail: string;
  appName: string;
  targetPath?: string;
  targetLabel?: string;
  assistantTaskId?: string;
  teamId?: string;
  autoNavigate?: boolean;
  tone?: 'default' | 'danger' | 'success';
  completedAt: string;
};

export type VoiceAssistantSession = {
  scene: VoiceAssistantScene;
  step: VoiceAssistantFlowStep;
  transcript: string;
  resolvedScene?: VoiceAssistantResolvedScene;
  selectedTeamId?: string;
  selectedSelfTestMode?: 'recommended' | 'all';
  selectedImageId?: string;
  imageEditPrompt?: string;
  generatedImages?: VoiceAssistantImageVariant[];
  plan?: VoiceAssistantPlan | null;
  result?: VoiceAssistantExecutionResult | null;
  updatedAt: string;
};

type VoiceAssistantStore = {
  version: number;
  activeSession: VoiceAssistantSession;
  lastExecutionResult?: VoiceAssistantExecutionResult | null;
};

type TeamKeywordConfig = {
  ids: string[];
  keywords: string[];
};

const TEAM_KEYWORD_MAP: TeamKeywordConfig[] = [
  { ids: ['team_demo_06'], keywords: ['自然', '植物', '雨林', '动物', '观察', '生态'] },
  { ids: ['team_demo_07'], keywords: ['历史', '艺术', '敦煌', '文化', '壁画', '美术'] },
  { ids: ['team_demo_08'], keywords: ['航天', '科技', '太空', '火箭', '卫星', '科学'] },
  { ids: ['team_demo_05', 'team_demo_08'], keywords: ['科创', '实验', '探索', '机器人'] },
];

export const VOICE_ASSISTANT_SCENE_OPTIONS: Array<{
  scene: VoiceAssistantResolvedScene;
  title: string;
  description: string;
  prompt: string;
}> = [
  {
    scene: 'help',
    title: '不知道如何使用',
    description: '先告诉我设备能做什么，再帮我生成一个体验任务。',
    prompt: '我不太会用这个设备，你可以先教我怎么用，再帮我安排一个体验任务吗？',
  },
  {
    scene: 'team',
    title: '想报名研学团',
    description: '结合兴趣和能力推荐合适的研学旅行团队，并发给家长查看报名。',
    prompt: '我想报名一个偏自然观察的研学团，帮我推荐合适的团队吧。',
  },
  {
    scene: 'task',
    title: '帮我生成任务',
    description: '根据我的能力和目标自动生成一个适合现在完成的研学任务。',
    prompt: '请根据我现在的能力情况，帮我生成一个能提升表达能力的研学任务。',
  },
  {
    scene: 'image',
    title: 'AI生图',
    description: '输入一句提示词，生成 4 张候选图片，支持修改和下载到相册。',
    prompt: '请帮我生成一组海洋馆主题的科普插画，适合小学生研学手册使用。',
  },
  {
    scene: 'quick-submit',
    title: '快速提交任务',
    description: '输入任务名称和答案，自动识别题目并完成本地任务提交。',
    prompt: '生态设施大搜索任务 第一题“青蛙”',
  },
  {
    scene: 'self-test',
    title: '开启能力自测',
    description: '推荐最值得先测的能力平面，或直接切到全面测试。',
    prompt: '帮我开启能力自测，先推荐一个最需要做的测试。',
  },
  {
    scene: 'sos',
    title: '走丢了需要求助',
    description: '发起紧急求助流程，联系老师和家长。',
    prompt: '我好像走丢了，帮我赶紧联系老师和家长。',
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createEmptyVoiceAssistantSession(scene: VoiceAssistantScene = 'free'): VoiceAssistantSession {
  return {
    scene,
    step: 'wake',
    transcript: '',
    selectedSelfTestMode: 'recommended',
    updatedAt: new Date().toISOString(),
  };
}

function createInitialStore(): VoiceAssistantStore {
  return {
    version: DEVICE_VOICE_ASSISTANT_VERSION,
    activeSession: createEmptyVoiceAssistantSession(),
    lastExecutionResult: null,
  };
}

function readStore(): VoiceAssistantStore {
  if (typeof window === 'undefined') {
    return createInitialStore();
  }

  const raw = window.sessionStorage.getItem(DEVICE_VOICE_ASSISTANT_KEY);
  if (!raw) {
    const initial = createInitialStore();
    window.sessionStorage.setItem(DEVICE_VOICE_ASSISTANT_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = JSON.parse(raw) as VoiceAssistantStore;
  if (parsed.version !== DEVICE_VOICE_ASSISTANT_VERSION || !parsed.activeSession) {
    const initial = createInitialStore();
    window.sessionStorage.setItem(DEVICE_VOICE_ASSISTANT_KEY, JSON.stringify(initial));
    return initial;
  }

  return parsed;
}

function writeStore(nextStore: VoiceAssistantStore) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized: VoiceAssistantStore = {
    ...nextStore,
    version: DEVICE_VOICE_ASSISTANT_VERSION,
  };

  window.sessionStorage.setItem(DEVICE_VOICE_ASSISTANT_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(DEVICE_VOICE_ASSISTANT_EVENT));
}

export function getVoiceAssistantStore() {
  return clone(readStore());
}

export function useVoiceAssistantStore() {
  const [store, setStore] = useState<VoiceAssistantStore>(() => getVoiceAssistantStore());

  useEffect(() => {
    function sync() {
      setStore(getVoiceAssistantStore());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_VOICE_ASSISTANT_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_VOICE_ASSISTANT_EVENT, sync);
    };
  }, []);

  function updateSession(updater: (session: VoiceAssistantSession) => VoiceAssistantSession) {
    const nextStore = getVoiceAssistantStore();
    nextStore.activeSession = updater(nextStore.activeSession);
    writeStore(nextStore);
  }

  function setSession(session: VoiceAssistantSession) {
    const nextStore = getVoiceAssistantStore();
    nextStore.activeSession = session;
    writeStore(nextStore);
  }

  function rememberResult(result: VoiceAssistantExecutionResult, sessionPatch?: Partial<VoiceAssistantSession>) {
    const nextStore = getVoiceAssistantStore();
    nextStore.activeSession = {
      ...nextStore.activeSession,
      ...sessionPatch,
      result,
      step: 'execute',
      updatedAt: new Date().toISOString(),
    };
    nextStore.lastExecutionResult = result;
    writeStore(nextStore);
  }

  function resetSession(scene: VoiceAssistantScene = 'free') {
    const nextStore = getVoiceAssistantStore();
    nextStore.activeSession = createEmptyVoiceAssistantSession(scene);
    writeStore(nextStore);
  }

  return {
    store,
    setSession,
    updateSession,
    rememberResult,
    resetSession,
  };
}

export function detectVoiceAssistantScene(transcript: string): VoiceAssistantResolvedScene | null {
  const normalized = transcript.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (
    ['生图', '画图', '画一张', '生成图片', '生成四张', '海报', '插画', '配图'].some((keyword) => normalized.includes(keyword))
  ) {
    return 'image';
  }

  if (
    ['提交任务', '提交作业', '快速提交', '自动提交', '第一题', '第二题', '第三题', '答案是'].some((keyword) => normalized.includes(keyword))
  ) {
    return 'quick-submit';
  }

  if (['走丢', '联系家长', '联系老师', '求助', '紧急', '报警', 'sos'].some((keyword) => normalized.includes(keyword))) {
    return 'sos';
  }

  if (['自测', '测试', '能力', '评估'].some((keyword) => normalized.includes(keyword))) {
    return 'self-test';
  }

  if (['报名', '研学团', '团队', '旅行', '营'].some((keyword) => normalized.includes(keyword))) {
    return 'team';
  }

  if (['生成任务', '创建任务', '安排任务', '帮我做个任务', '研学任务'].some((keyword) => normalized.includes(keyword))) {
    return 'task';
  }

  if (['不会用', '怎么用', '如何使用', '不会操作', '不知道怎么'].some((keyword) => normalized.includes(keyword))) {
    return 'help';
  }

  return null;
}

export function getVoiceAssistantPrompt(scene: VoiceAssistantScene) {
  const option = VOICE_ASSISTANT_SCENE_OPTIONS.find((item) => item.scene === scene);
  return option?.prompt ?? '你想让我帮你做什么？';
}

const IMAGE_STYLE_PRESETS: Array<{
  styleLabel: string;
  description: string;
  previewLabel: string;
  accent: VoiceAssistantImageVariant['accent'];
}> = [
  { styleLabel: '清新插画', description: '颜色明亮，适合研学手册封面。', previewLabel: '手册插画', accent: 'blue' },
  { styleLabel: '自然写实', description: '突出生态细节，适合观察记录。', previewLabel: '观察配图', accent: 'green' },
  { styleLabel: '海报拼贴', description: '信息感更强，适合任务展示。', previewLabel: '海报构图', accent: 'orange' },
  { styleLabel: '柔和彩绘', description: '氛围更柔和，适合成长记录。', previewLabel: '成长画面', accent: 'purple' },
];

export function buildVoiceAssistantImageVariants(prompt: string, editPrompt?: string) {
  const safePrompt = prompt.trim() || '研学主题插画';
  const focusTitle = safePrompt.replace(/[。！？.!?]/g, '').slice(0, 14) || '研学主题';
  const revisedLabel = editPrompt?.trim();

  return IMAGE_STYLE_PRESETS.map((item, index) => ({
    id: `voice_image_${Date.now()}_${index}`,
    title: focusTitle,
    styleLabel: revisedLabel ? `${item.styleLabel} · 已修改` : item.styleLabel,
    description: revisedLabel ? `已融入修改意见：${revisedLabel}` : item.description,
    previewLabel: item.previewLabel,
    accent: item.accent,
    prompt: safePrompt,
    revisedPrompt: revisedLabel,
  })) satisfies VoiceAssistantImageVariant[];
}

function resolveTaskTheme(transcript: string) {
  if (transcript.includes('创作') || transcript.includes('画')) {
    return {
      label: '创作表达',
      topicType: '画作' as const,
      gameplayKind: 'creative_research' as const,
      workCategory: '创作型' as const,
    };
  }

  if (transcript.includes('问') || transcript.includes('解释') || transcript.includes('答案')) {
    return {
      label: '问答探究',
      topicType: '问答' as const,
      gameplayKind: 'qa_research' as const,
      workCategory: '探究型' as const,
    };
  }

  if (transcript.includes('拍照') || transcript.includes('观察') || transcript.includes('记录')) {
    return {
      label: '观察记录',
      topicType: '调查' as const,
      gameplayKind: 'survey' as const,
      workCategory: '观察型' as const,
    };
  }

  return {
    label: '体验挑战',
    topicType: '调查' as const,
    gameplayKind: 'survey' as const,
    workCategory: '体验型' as const,
  };
}

export function buildAssistantGeneratedTask(input: {
  mode: 'help' | 'task';
  transcript: string;
  weakestCapability: DemoCapability | null;
  sequence: number;
}) {
  const capability = input.weakestCapability?.elementKey ?? '表达能力';
  const planeTitle = input.weakestCapability?.planeTitle ?? '综合成长';
  const theme = resolveTaskTheme(input.transcript);
  const taskId = `assistant_task_${Date.now()}`;
  const sheetId = `assistant_sheet_${Date.now()}`;
  const resourceId = `assistant_resource_${Date.now()}`;
  const title =
    input.mode === 'help'
      ? `AI体验任务：提升${capability}`
      : `AI生成任务：${theme.label}`;

  return {
    id: taskId,
    source: 'assistant_ai',
    title,
    description: '由语音助手根据当前诉求生成的前端演示任务。',
    intro:
      input.mode === 'help'
        ? `先用设备完成一次 ${theme.label} 体验，帮助你熟悉设备能力，并重点提升${capability}。`
        : `根据你的目标，先完成一项 ${theme.label} 任务，并重点观察自己在${capability}上的表现。`,
    taskType: 'AI 体验任务',
    taskDescription: `围绕${theme.label}完成一项练习，重点提升${capability}。`,
    status: 'todo' as const,
    dueAt: new Date().toISOString(),
    category: 'study' as const,
    target: '个人' as const,
    requirement: `完成 1 项${theme.label}作品，记录你的发现、判断和下一步改进。`,
    infoSummary: `语音助手生成 · ${planeTitle}`,
    worksSubmitted: 0,
    worksRequired: 1,
    sequence: input.sequence,
    timeLimit: '今天内完成即可',
    capabilityTags: [capability, theme.label, '智能素养'],
    capabilityTagSource: 'ai' as const,
    taskSheets: [
      {
        id: sheetId,
        title: `${theme.label}体验记录`,
        topicType: theme.topicType,
        workCategory: theme.workCategory,
        workMode: '独立完成' as const,
        workKind: 'rich_text' as const,
        sheetTemplateKind: theme.gameplayKind,
        gameplayKind: theme.gameplayKind,
        requirement: `按提示完成${theme.label}，并写出你最重要的一个发现。`,
        mediaTypes: ['文字', '照片'],
        status: '待开始' as const,
        submissionStatus: '待填写' as const,
        workForm: [
          {
            id: `${sheetId}_goal`,
            kind: 'fill_blank',
            label: '这次你想完成什么',
            placeholder: '例如：我想练习更清楚地表达自己的观察结果',
            tools: ['ask', 'flash_note', 'voice_text'],
          },
          {
            id: `${sheetId}_finding`,
            kind: 'fill_blank',
            label: '你完成后最大的发现',
            placeholder: '写出你观察到的现象、判断或收获',
            tools: ['ask', 'flash_note', 'voice_text'],
          },
          {
            id: `${sheetId}_photo`,
            kind: 'image_upload',
            label: '上传一张现场照片',
            helper: '没有照片也可以先提交文字内容',
            limitText: '最多上传 1 张',
            required: false,
            tools: ['camera', 'identify'],
          },
        ],
      },
    ],
    resourcePacks: [
      {
        id: resourceId,
        title: 'AI 任务提示',
        type: 'ai',
        summary: `这份提示会告诉你怎么完成${theme.label}，并把结果写进作品。`,
        previewMode: 'ai',
        aiSummary: `先说清目标，再记录一个关键发现，最后补一张照片或一句总结。`,
        defaultPrompt: `请帮我围绕“${theme.label}”完成一项练习，并重点提升${capability}。`,
        allowEditPrompt: true,
        questions: ['我应该先做什么？', '怎么判断自己有没有进步？', '完成后要写什么？'],
      },
    ],
  } satisfies DemoTask;
}

export function getRecommendedTravelTeams(teams: DemoTeam[], transcript: string, weakestCapability: DemoCapability | null) {
  const travelTeams = teams.filter((team) => team.sourceType === '研学旅行推荐');
  const matchedIds: string[] = [];

  TEAM_KEYWORD_MAP.forEach((config) => {
    if (config.keywords.some((keyword) => transcript.includes(keyword))) {
      matchedIds.push(...config.ids);
    }
  });

  if (!matchedIds.length && weakestCapability) {
    if (weakestCapability.elementKey.includes('科技') || weakestCapability.elementKey.includes('数字')) {
      matchedIds.push('team_demo_08');
    } else if (weakestCapability.elementKey.includes('审美') || weakestCapability.elementKey.includes('语言')) {
      matchedIds.push('team_demo_07');
    } else {
      matchedIds.push('team_demo_06');
    }
  }

  if (!matchedIds.length) {
    matchedIds.push('team_demo_06');
  }

  const ordered = matchedIds
    .map((id) => travelTeams.find((team) => team.id === id))
    .filter((team): team is DemoTeam => Boolean(team));
  const remained = travelTeams.filter((team) => !ordered.some((item) => item.id === team.id));

  return [...ordered, ...remained].slice(0, 3);
}

export function getRecommendedSelfTest(weakestCapability: DemoCapability | null) {
  const planeId =
    weakestCapability?.planeKey === 'self'
      ? 'plane_self'
      : weakestCapability?.planeKey === 'learning'
        ? 'plane_learning'
        : weakestCapability?.planeKey === 'social'
          ? 'plane_social'
          : 'plane_future';
  const plane = demoSelfTestPlanes.find((item) => item.id === planeId) ?? demoSelfTestPlanes[0];

  return {
    planeId: plane.id,
    planeTitle: plane.title,
    reason: weakestCapability
      ? `${weakestCapability.elementKey} 当前相对更需要关注，建议先从“${plane.title}”开始。`
      : `建议先从“${plane.title}”开始，再决定是否做全面测试。`,
  };
}

export function buildVoiceAssistantPlan(input: {
  scene: VoiceAssistantResolvedScene;
  transcript: string;
  weakestCapability: DemoCapability | null;
  teams: DemoTeam[];
  nextTaskSequence: number;
  quickSubmission?: QuickTaskSubmissionPreview | null;
}) {
  const safeTranscript = input.transcript.trim() || getVoiceAssistantPrompt(input.scene);

  if (input.scene === 'help') {
    const generatedTask = buildAssistantGeneratedTask({
      mode: 'help',
      transcript: safeTranscript,
      weakestCapability: input.weakestCapability,
      sequence: input.nextTaskSequence,
    });

    return {
      scene: 'help',
      title: '先教你怎么用，再帮你安排一个体验任务',
      understanding: `我理解为：你想先知道设备能做什么，再快速开始一个能提升 ${input.weakestCapability?.elementKey ?? '表达能力'} 的体验任务。`,
      planningSummary: `我会先告诉你设备最常用的 4 类能力，然后用任务应用帮你创建一条可立即开始的体验任务。`,
      rationale: [
        `你当前最值得优先提升的是 ${input.weakestCapability?.elementKey ?? '表达能力'}。`,
        '设备端可以直接完成拍照、语音提问、任务记录和能力自测。',
        '先做一条短任务，能比单纯看说明更快熟悉设备。',
      ],
      executionQuestion: '我已经整理好设备使用方法，并准备为你创建体验任务，现在就执行吗？',
      appName: '任务应用',
      capabilityFocus: generatedTask.capabilityTags,
      helpTips: [
        '想记录现场观察，可以直接用“拍照”和“闪记”。',
        '想问问题，可以用“语音助手”或“问问”。',
        '想看自己哪里还需要提升，可以打开“能力自测”。',
        '遇到紧急情况，可以直接发起 SoS 求助。',
      ],
      generatedTask,
    } satisfies VoiceAssistantPlan;
  }

  if (input.scene === 'team') {
    const teams = getRecommendedTravelTeams(input.teams, safeTranscript, input.weakestCapability);
    return {
      scene: 'team',
      title: '已为你匹配适合的研学旅行推荐团',
      understanding: `我理解为：你想报名一个更适合当前兴趣和能力方向的研学团。`,
      planningSummary: '我会先推荐 1-3 个匹配的研学旅行团队，再用团队应用生成“发送给家长查看报名”的结果。',
      rationale: [
        `我会优先参考你的兴趣描述，以及当前更适合补强的 ${input.weakestCapability?.elementKey ?? '综合能力'}。`,
        '推荐团只在设备端展示，不在设备端直接购买。',
        '确认后我会生成发送给家长的报名查看入口。',
      ],
      executionQuestion: '我已经匹配好推荐团，是否现在发送给家长查看报名？',
      appName: '团队应用',
      capabilityFocus: input.weakestCapability ? [input.weakestCapability.elementKey] : undefined,
      recommendedTeamIds: teams.map((team) => team.id),
    } satisfies VoiceAssistantPlan;
  }

  if (input.scene === 'task') {
    const generatedTask = buildAssistantGeneratedTask({
      mode: 'task',
      transcript: safeTranscript,
      weakestCapability: input.weakestCapability,
      sequence: input.nextTaskSequence,
    });

    return {
      scene: 'task',
      title: '已生成适合当前能力的研学任务',
      understanding: `我理解为：你想要一条可以马上开始、并且能帮助自己提升的研学任务。`,
      planningSummary: '我会根据你的表达目标和当前能力情况，生成一条本地 mock 任务，并写入任务列表。',
      rationale: [
        `任务会重点围绕 ${input.weakestCapability?.elementKey ?? '表达能力'} 设计。`,
        '任务写入后，你可以直接从任务页进入并提交作品。',
        '本轮仅做前端静态交互，不调用真实大模型接口。',
      ],
      executionQuestion: '任务已经规划好了，是否现在写入任务列表？',
      appName: '任务应用',
      capabilityFocus: generatedTask.capabilityTags,
      generatedTask,
    } satisfies VoiceAssistantPlan;
  }

  if (input.scene === 'image') {
    return {
      scene: 'image',
      title: '我来先帮你生成 4 张候选图片',
      understanding: `我理解为：你想根据“${safeTranscript}”生成一组可选图片，再挑一张继续修改或下载。`,
      planningSummary: '我会先根据你的提示词生成 4 种不同风格的图片候选，再保留单张修改和下载入口。',
      rationale: [
        '4 宫格候选能更快比较画面风格，减少来回试错。',
        '每张图都支持继续修改，修改时会带上你选中的那张图片。',
        '下载后的图片会保存到本地相册 mock，方便后续继续使用。',
      ],
      executionQuestion: '提示词已经收到，我现在就开始为你生成 4 张图片吗？',
      appName: 'AI创作',
      capabilityFocus: ['创意表达', '审美表达', 'AI应用'],
      imagePrompt: safeTranscript,
    } satisfies VoiceAssistantPlan;
  }

  if (input.scene === 'quick-submit') {
    return {
      scene: 'quick-submit',
      title: '已识别到你要快速提交的任务',
      understanding: input.quickSubmission
        ? `我理解为：你想把答案“${input.quickSubmission.answer}”快速提交到《${input.quickSubmission.taskTitle}》的 ${input.quickSubmission.questionOrderLabel}。`
        : '我理解为：你想通过一句话快速完成任务提交。',
      planningSummary: input.quickSubmission
        ? '我会先确认匹配到的任务、题目和答案，再直接写入本地任务作品并返回提交结果。'
        : '我需要先识别到任务名称和答案，再帮你自动完成提交。',
      rationale: input.quickSubmission
        ? [
            `已匹配任务：《${input.quickSubmission.taskTitle}》。`,
            `已匹配题目：${input.quickSubmission.sheetTitle}。`,
            `将写入字段：${input.quickSubmission.matchedFieldLabel}。`,
          ]
        : [
            '请尽量按“任务名称 + 题目 + 答案”的格式输入。',
            '例如：生态设施大搜索任务 第一题“青蛙”。',
          ],
      executionQuestion: input.quickSubmission
        ? '识别结果已经准备好了，现在就帮你自动提交吗？'
        : '还没有识别到完整内容，你要再补充一次任务名称和答案吗？',
      appName: '任务应用',
      capabilityFocus: ['任务执行', '表达能力'],
      quickSubmission: input.quickSubmission ?? undefined,
    } satisfies VoiceAssistantPlan;
  }

  if (input.scene === 'self-test') {
    const recommendation = getRecommendedSelfTest(input.weakestCapability);
    return {
      scene: 'self-test',
      title: '我来帮你打开最合适的能力自测',
      understanding: '我理解为：你想尽快进入能力自测，并希望我先推荐最值得做的测试范围。',
      planningSummary: '我会先推荐当前最该优先测试的能力平面，你也可以切到全面测试，然后直接打开能力应用。',
      rationale: [
        recommendation.reason,
        '单平面测试更快，适合先定位问题；全面测试更适合完整回看当前能力结构。',
      ],
      executionQuestion: '已经选好能力自测入口，现在就帮你打开吗？',
      appName: '能力应用',
      selfTestRecommendation: recommendation,
      capabilityFocus: input.weakestCapability ? [input.weakestCapability.elementKey] : undefined,
    } satisfies VoiceAssistantPlan;
  }

  return {
    scene: 'sos',
    title: '检测到紧急求助诉求',
    understanding: '我理解为：你现在需要尽快联系老师和家长，发起紧急求助。',
    planningSummary: '我会用 SoS 应用发起求助流程，并自动进入定位、录音和发送确认步骤。',
    rationale: [
      '这是紧急场景，我会优先帮你打开 SoS。',
      '为避免误触，我会在执行前再确认一次。',
      '进入 SoS 后会自动走现有的本地 mock 求助流程。',
    ],
    executionQuestion: '这是紧急操作。确认后我会立刻发起 SoS，是否继续？',
    appName: 'SoS 应用',
    dangerNotice: '紧急求助会自动整理定位与录音，并同步给家长和导师。',
  } satisfies VoiceAssistantPlan;
}
