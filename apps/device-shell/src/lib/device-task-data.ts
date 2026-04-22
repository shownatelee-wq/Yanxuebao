'use client';

import { useEffect, useState } from 'react';
import {
  demoTaskWorks,
  demoTasks,
  type DemoTask,
  type DemoTaskWork,
  type DemoWorkAnswer,
  type DemoWorkFormField,
  type DemoWorkMedia,
} from './device-demo-data';
import { normalizeDeviceTimeValue } from './device-time';

const DEVICE_TASK_STATE_KEY = 'yanxuebao_device_task_state_v1';
const DEVICE_TASK_EVENT = 'yanxuebao:device-task-change';
const DEVICE_TASK_STATE_VERSION = 3;

export type DeviceTask = DemoTask;
export type DeviceTaskWork = DemoTaskWork;
export type DeviceTaskSheet = DemoTask['taskSheets'][number];
export type DeviceTaskCategoryFilter = 'all' | DemoTask['category'];
export type DeviceTaskSourceKind = NonNullable<DemoTask['taskSourceKind']>;

export type DeviceTaskDisplayMeta = {
  categoryLabel: string;
  categoryShortLabel: string;
  categoryColor: string;
  taskKindLabel: string;
  sourceKind: DeviceTaskSourceKind;
  sourceLabel: string;
  sourceName: string;
  sourceColor: string;
  publisherLabel: string;
};

export type DeviceLearningWorkItem = {
  taskId: string;
  sheetId: string;
  title: string;
  topicType: DeviceTaskSheet['topicType'];
  gameplayKind?: DeviceTaskSheet['gameplayKind'];
  workCategory: DeviceTaskSheet['workCategory'];
  workMode: DeviceTaskSheet['workMode'];
  requirement: string;
  displayStatus: '未完成' | '已提交';
  entryPath: string;
  workId?: string;
  updatedAt?: string;
  updatedAtValue?: string;
  summary?: string;
};

export type QuickTaskSubmissionPreview = {
  taskId: string;
  taskTitle: string;
  sheetId: string;
  sheetTitle: string;
  answer: string;
  matchedFieldId: string;
  matchedFieldLabel: string;
  questionOrderLabel: string;
};

type QuickSubmissionField = Extract<DemoWorkFormField, { kind: 'fill_blank' | 'single_choice' | 'multiple_choice' }>;

type DeviceTaskState = {
  version: number;
  tasks: DemoTask[];
  works: DemoTaskWork[];
};

const CURRENT_DEVICE_STUDENT_NAME = '小明';

const TASK_SOURCE_PRESETS: Record<
  string,
  Partial<Pick<DeviceTaskDisplayMeta, 'sourceKind' | 'sourceName' | 'sourceLabel' | 'publisherLabel'>>
> = {
  task_demo_01: { sourceKind: 'team_study', sourceName: '海洋馆研学团', publisherLabel: '导师发布' },
  task_demo_02: { sourceKind: 'expert_challenge', sourceName: '社会责任顾问', publisherLabel: '专家智能体创建' },
  task_demo_03: { sourceKind: 'daily_checkin', sourceName: '妈妈', publisherLabel: '家长创建' },
  task_demo_04: { sourceKind: 'team_study', sourceName: '海洋馆研学团', publisherLabel: '导师发布' },
  task_demo_05: { sourceKind: 'family_study', sourceName: '家庭研学', publisherLabel: '家长发布' },
  task_demo_06: { sourceKind: 'course_challenge', sourceName: '海洋馆难题挑战课程', publisherLabel: '课程挑战' },
  task_demo_07: { sourceKind: 'team_study', sourceName: '海洋馆研学团', publisherLabel: '导师发布' },
  task_demo_08: { sourceKind: 'daily_checkin', sourceName: '自主打卡', publisherLabel: '学生创建' },
};

const TASK_CATEGORY_META: Record<DemoTask['category'], Pick<DeviceTaskDisplayMeta, 'categoryLabel' | 'categoryShortLabel' | 'categoryColor'>> = {
  study: { categoryLabel: '研学任务', categoryShortLabel: '研学', categoryColor: 'blue' },
  daily: { categoryLabel: '日常任务', categoryShortLabel: '日常', categoryColor: 'green' },
  project: { categoryLabel: '项目任务', categoryShortLabel: '项目', categoryColor: 'purple' },
};

const TASK_SOURCE_KIND_META: Record<
  DeviceTaskSourceKind,
  Pick<DeviceTaskDisplayMeta, 'taskKindLabel' | 'sourceColor' | 'publisherLabel'> & { defaultSourceName: string }
> = {
  team_study: {
    taskKindLabel: '团体研学',
    sourceColor: 'blue',
    publisherLabel: '导师发布',
    defaultSourceName: '研学团队',
  },
  family_study: {
    taskKindLabel: '家庭研学',
    sourceColor: 'green',
    publisherLabel: '家长发布',
    defaultSourceName: '家庭研学',
  },
  self_study: {
    taskKindLabel: '自主研学',
    sourceColor: 'geekblue',
    publisherLabel: '学生自主创建',
    defaultSourceName: '自主任务',
  },
  daily_checkin: {
    taskKindLabel: '日常打卡',
    sourceColor: 'orange',
    publisherLabel: '家长/学生创建',
    defaultSourceName: '日常打卡',
  },
  expert_challenge: {
    taskKindLabel: '难题挑战',
    sourceColor: 'magenta',
    publisherLabel: '专家智能体创建',
    defaultSourceName: '专家智能体',
  },
  course_challenge: {
    taskKindLabel: '课程挑战',
    sourceColor: 'volcano',
    publisherLabel: '课程挑战',
    defaultSourceName: '课程难题',
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function inferTaskSourceKind(task: DemoTask): DeviceTaskSourceKind {
  if (task.source === 'assistant_ai') {
    return 'self_study';
  }

  if (task.category === 'daily') {
    return 'daily_checkin';
  }

  if (task.category === 'project') {
    const lookupText = `${task.title}${task.taskType}${task.taskDescription}${task.infoSummary}`;
    return lookupText.includes('课程') || lookupText.includes('导览') ? 'course_challenge' : 'expert_challenge';
  }

  if (task.taskType.includes('家庭') || task.title.includes('家庭')) {
    return 'family_study';
  }

  return 'team_study';
}

export function getDeviceTaskDisplayMeta(task: DemoTask): DeviceTaskDisplayMeta {
  const preset = TASK_SOURCE_PRESETS[task.id];
  const sourceKind = task.taskSourceKind ?? preset?.sourceKind ?? inferTaskSourceKind(task);
  const kindMeta = TASK_SOURCE_KIND_META[sourceKind];
  const categoryMeta = TASK_CATEGORY_META[task.category];
  const sourceName = task.taskSourceName ?? preset?.sourceName ?? kindMeta.defaultSourceName;
  const sourceLabel = task.taskSourceLabel ?? preset?.sourceLabel ?? (sourceKind === 'self_study' ? '自主任务' : sourceName);

  return {
    ...categoryMeta,
    taskKindLabel: kindMeta.taskKindLabel,
    sourceKind,
    sourceName,
    sourceLabel,
    sourceColor: kindMeta.sourceColor,
    publisherLabel: task.publisherLabel ?? preset?.publisherLabel ?? kindMeta.publisherLabel,
  };
}

function normalizeLookupText(value: string) {
  return value
    .toLowerCase()
    .replace(/[“”"'`《》【】（）()、，,。.!！?？:：\s]/g, '')
    .trim();
}

function parseQuestionOrderToken(value?: string) {
  if (!value) {
    return undefined;
  }

  const directNumber = Number(value);
  if (Number.isFinite(directNumber) && directNumber > 0) {
    return directNumber;
  }

  const digitMap: Record<string, number> = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };

  if (value === '十') {
    return 10;
  }

  if (value.startsWith('十') && digitMap[value[1] ?? '']) {
    return 10 + digitMap[value[1] ?? ''];
  }

  if (value.endsWith('十') && digitMap[value[0] ?? '']) {
    return digitMap[value[0] ?? ''] * 10;
  }

  if (value.length === 2 && digitMap[value[0] ?? ''] && value[1] === '十') {
    return digitMap[value[0] ?? ''] * 10;
  }

  if (value.length === 2 && digitMap[value[0] ?? ''] && value[0] === '十') {
    return 10 + digitMap[value[1] ?? ''];
  }

  return digitMap[value];
}

function cleanQuickAnswer(raw: string) {
  const quotedAnswer = raw.match(/[“"'`《【]([^”"'`》】]+)[”"'`》】]/)?.[1];
  const source = quotedAnswer ?? raw;

  return source
    .replace(/^(答案是|答案为|答案|回答是|回答为|回答|提交|帮我提交|请提交|自动提交|作业提交|内容是|内容为)/, '')
    .replace(/^[：:\s]+/, '')
    .replace(/[“”"'`《》【】]/g, '')
    .trim();
}

function findQuickSubmissionField(sheet: DeviceTaskSheet) {
  return sheet.workForm.find(
    (field) => field.kind === 'fill_blank' || field.kind === 'single_choice' || field.kind === 'multiple_choice',
  ) as QuickSubmissionField | undefined;
}

function resolveQuickSubmissionFieldValue(field: QuickSubmissionField, answer: string): DemoWorkAnswer {
  if (field.kind === 'fill_blank') {
    return {
      fieldId: field.id,
      kind: 'fill_blank',
      label: field.label,
      value: answer,
    };
  }

  if (field.kind === 'single_choice') {
    const matchedOption =
      field.options.find((option) => normalizeLookupText(answer).includes(normalizeLookupText(option))) ??
      field.options.find((option) => normalizeLookupText(option).includes(normalizeLookupText(answer))) ??
      answer;

    return {
      fieldId: field.id,
      kind: 'single_choice',
      label: field.label,
      value: [matchedOption],
    };
  }

  const matchedOptions = field.options.filter((option) => {
    const normalizedOption = normalizeLookupText(option);
    return normalizeLookupText(answer).includes(normalizedOption) || normalizedOption.includes(normalizeLookupText(answer));
  });

  return {
    fieldId: field.id,
    kind: 'multiple_choice',
    label: field.label,
    value: matchedOptions.length ? matchedOptions : [answer],
  };
}

function normalizeTasks(tasks: DemoTask[]): DemoTask[] {
  return tasks.map((task) => {
    const normalizedSource = task.source ?? 'seed';
    const meta = getDeviceTaskDisplayMeta({
      ...task,
      source: normalizedSource,
    });

    return {
      ...task,
      source: normalizedSource,
      taskSourceKind: task.taskSourceKind ?? meta.sourceKind,
      taskSourceName: task.taskSourceName ?? meta.sourceName,
      taskSourceLabel: task.taskSourceLabel ?? meta.sourceLabel,
      publisherLabel: task.publisherLabel ?? meta.publisherLabel,
    };
  });
}

function createInitialTaskState(): DeviceTaskState {
  return {
    version: DEVICE_TASK_STATE_VERSION,
    tasks: normalizeTasks(clone(demoTasks)),
    works: clone(demoTaskWorks),
  };
}

function migrateTaskState(parsed: DeviceTaskState): DeviceTaskState {
  const existingTaskIds = new Set(parsed.tasks.map((task) => task.id));
  const missingSeedTasks = clone(demoTasks).filter((task) => !existingTaskIds.has(task.id));

  return {
    version: DEVICE_TASK_STATE_VERSION,
    tasks: normalizeTasks([...parsed.tasks, ...missingSeedTasks]),
    works: clone(parsed.works),
  };
}

function readState(): DeviceTaskState {
  if (typeof window === 'undefined') {
    return createInitialTaskState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_TASK_STATE_KEY);
  if (!raw) {
    const initial = createInitialTaskState();
    window.sessionStorage.setItem(DEVICE_TASK_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = JSON.parse(raw) as DeviceTaskState;
  if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.works)) {
    const initial = createInitialTaskState();
    window.sessionStorage.setItem(DEVICE_TASK_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  if (parsed.version !== DEVICE_TASK_STATE_VERSION) {
    const migrated = migrateTaskState(parsed);
    window.sessionStorage.setItem(DEVICE_TASK_STATE_KEY, JSON.stringify(migrated));
    return migrated;
  }

  return {
    ...parsed,
    tasks: normalizeTasks(parsed.tasks),
  };
}

function writeState(nextState: DeviceTaskState) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized: DeviceTaskState = {
    ...nextState,
    version: DEVICE_TASK_STATE_VERSION,
    tasks: normalizeTasks(nextState.tasks),
  };

  window.sessionStorage.setItem(DEVICE_TASK_STATE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(DEVICE_TASK_EVENT));
}

function updateTaskState(mutator: (draft: DeviceTaskState) => void) {
  const draft = readState();
  mutator(draft);
  writeState(draft);
  return clone(draft);
}

function getTaskWorks(taskId: string, works: DemoTaskWork[]) {
  return works.filter((work) => work.taskId === taskId);
}

function getCurrentStudentWorkBySheetId(sheetId: string, works: DemoTaskWork[]) {
  return works.find((work) => work.taskSheetId === sheetId && work.authorName === CURRENT_DEVICE_STUDENT_NAME);
}

function withDerivedTask(task: DemoTask, works: DemoTaskWork[]): DemoTask {
  const relatedWorks = getTaskWorks(task.id, works);
  const currentStudentWorks = relatedWorks.filter((work) => work.authorName === CURRENT_DEVICE_STUDENT_NAME);
  const submittedSheetCount = new Set(
    currentStudentWorks.filter((work) => work.status === '已提交' && work.taskSheetId).map((work) => work.taskSheetId),
  ).size;
  const nextWorksSubmitted = Math.max(task.worksSubmitted, submittedSheetCount);
  const nextStatus: DemoTask['status'] =
    nextWorksSubmitted >= task.worksRequired
      ? 'submitted'
      : nextWorksSubmitted > 0 || currentStudentWorks.some((work) => work.status === '草稿')
        ? 'in_progress'
        : task.status;

  return {
    ...task,
    worksSubmitted: nextWorksSubmitted,
    status: nextStatus,
    taskSheets: task.taskSheets.map((sheet) => {
      const currentWork = relatedWorks.find(
        (work) => work.taskSheetId === sheet.id && work.authorName === CURRENT_DEVICE_STUDENT_NAME,
      );
      const submissionStatus =
        currentWork?.status === '已提交'
          ? '已提交'
          : currentWork?.status === '草稿'
            ? '待提交'
            : sheet.submissionStatus;

      return {
        ...sheet,
        submissionStatus,
        status:
          currentWork?.status === '已提交'
            ? '已完成'
            : currentWork?.status === '草稿'
              ? '进行中'
              : sheet.status,
      };
    }),
  };
}

export function getTaskState() {
  return clone(readState());
}

export function useDeviceTaskSnapshot() {
  const [snapshot, setSnapshot] = useState<DeviceTaskState>(() => getTaskState());

  useEffect(() => {
    function sync() {
      setSnapshot(getTaskState());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_TASK_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_TASK_EVENT, sync);
    };
  }, []);

  return snapshot;
}

export function getDeviceTaskList(): DemoTask[] {
  const state = readState();
  return state.tasks.map((task) => withDerivedTask(task, state.works));
}

export function buildQuickTaskSubmissionPreview(transcript: string, providedTasks?: DemoTask[]) {
  const normalizedTranscript = normalizeLookupText(transcript);
  if (!normalizedTranscript) {
    return null;
  }

  const tasks = (providedTasks ?? getDeviceTaskList()).filter((task) => task.target === '个人');
  const matchedTask =
    [...tasks]
      .sort((left, right) => right.title.length - left.title.length)
      .find((task) => normalizedTranscript.includes(normalizeLookupText(task.title))) ?? null;

  if (!matchedTask) {
    return null;
  }

  const questionOrderMatch = transcript.match(/第\s*([一二三四五六七八九十0-9]+)\s*题/);
  const questionIndex = parseQuestionOrderToken(questionOrderMatch?.[1]);
  const firstPendingItem = getDeviceLearningWorkItems(matchedTask.id).find((item) => item.displayStatus !== '已提交');
  const matchedSheet =
    (typeof questionIndex === 'number' && questionIndex > 0 ? matchedTask.taskSheets[questionIndex - 1] : undefined) ??
    (firstPendingItem ? matchedTask.taskSheets.find((sheet) => sheet.id === firstPendingItem.sheetId) : undefined) ??
    matchedTask.taskSheets[0];

  if (!matchedSheet) {
    return null;
  }

  const quickField = findQuickSubmissionField(matchedSheet);
  if (!quickField) {
    return null;
  }

  const taskTitleIndex = transcript.indexOf(matchedTask.title);
  const answerSource =
    taskTitleIndex >= 0
      ? transcript.slice(taskTitleIndex + matchedTask.title.length)
      : transcript;
  const answerRaw =
    questionOrderMatch && questionOrderMatch.index !== undefined
      ? answerSource.slice(answerSource.indexOf(questionOrderMatch[0]) + questionOrderMatch[0].length)
      : answerSource;
  const answer = cleanQuickAnswer(answerRaw);

  if (!answer) {
    return null;
  }

  const effectiveQuestionOrder =
    typeof questionIndex === 'number' && questionIndex > 0
      ? questionIndex
      : matchedTask.taskSheets.findIndex((sheet) => sheet.id === matchedSheet.id) + 1;

  return {
    taskId: matchedTask.id,
    taskTitle: matchedTask.title,
    sheetId: matchedSheet.id,
    sheetTitle: matchedSheet.title,
    answer,
    matchedFieldId: quickField.id,
    matchedFieldLabel: quickField.label,
    questionOrderLabel: `第${effectiveQuestionOrder}题`,
  } satisfies QuickTaskSubmissionPreview;
}

export function getDeviceTaskById(taskId: string): DemoTask | undefined {
  return getDeviceTaskList().find((task) => task.id === taskId);
}

export function getDeviceTaskSheetById(sheetId: string): { task: DemoTask; sheet: DeviceTaskSheet } | undefined {
  const task = getDeviceTaskList().find((item) => item.taskSheets.some((sheet) => sheet.id === sheetId));
  const sheet = task?.taskSheets.find((item) => item.id === sheetId);
  if (!task || !sheet) {
    return undefined;
  }
  return { task, sheet };
}

export function getDeviceTaskWorksByTaskId(taskId: string): DemoTaskWork[] {
  const state = readState();
  return getTaskWorks(taskId, state.works);
}

export function getDeviceTaskWorksBySheetId(sheetId: string): DemoTaskWork[] {
  return readState().works.filter((work) => work.taskSheetId === sheetId);
}

export function getDeviceTaskWorkById(workId: string): DemoTaskWork | undefined {
  return readState().works.find((work) => work.id === workId);
}

export function getDeviceTaskWorkBySheetId(sheetId: string) {
  return getCurrentStudentWorkBySheetId(sheetId, readState().works);
}

export function getDeviceLearningWorkItems(taskId: string): DeviceLearningWorkItem[] {
  const state = readState();
  const task = state.tasks.map((item) => withDerivedTask(item, state.works)).find((item) => item.id === taskId);
  if (!task) {
    return [];
  }

  return task.taskSheets.map((sheet) => {
    const work = getCurrentStudentWorkBySheetId(sheet.id, state.works);
    const displayStatus: DeviceLearningWorkItem['displayStatus'] = work?.status === '已提交' ? '已提交' : '未完成';

    return {
      taskId: task.id,
      sheetId: sheet.id,
      title: sheet.title,
      topicType: sheet.topicType,
      gameplayKind: sheet.gameplayKind,
      workCategory: sheet.workCategory,
      workMode: sheet.workMode,
      requirement: sheet.requirement,
      displayStatus,
      entryPath: work?.status === '已提交' ? `/tasks/works/${work.id}` : `/tasks/new?taskId=${task.id}&sheetId=${sheet.id}`,
      workId: work?.id,
      updatedAt: work?.updatedAt,
      updatedAtValue: work?.updatedAt ? normalizeDeviceTimeValue(work.updatedAt) : undefined,
      summary: work?.summary,
    };
  });
}

export function getDevicePeerWorksByTaskId(taskId: string, currentWorkId?: string) {
  return getDeviceTaskWorksByTaskId(taskId)
    .filter((work) => work.status === '已提交' && work.authorName !== CURRENT_DEVICE_STUDENT_NAME && work.id !== currentWorkId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt, 'zh-CN'));
}

export function getSuggestedTaskSheet(taskId?: string, sheetId?: string) {
  const task = taskId ? getDeviceTaskById(taskId) : getDeviceTaskList()[0];
  if (!task) {
    return undefined;
  }

  const firstPendingSheetId = getDeviceLearningWorkItems(task.id).find((item) => item.displayStatus !== '已提交')?.sheetId;
  const sheet =
    (sheetId ? task.taskSheets.find((item) => item.id === sheetId) : undefined) ??
    (firstPendingSheetId ? task.taskSheets.find((item) => item.id === firstPendingSheetId) : undefined) ??
    task.taskSheets[0];

  if (!sheet) {
    return undefined;
  }

  return { task, sheet };
}

export function upsertAssistantTask(task: DemoTask) {
  updateTaskState((draft) => {
    const normalizedTask: DemoTask = {
      ...clone(task),
      source: 'assistant_ai',
      taskSourceKind: 'self_study',
      taskSourceName: '自主任务',
      taskSourceLabel: '自主任务',
      publisherLabel: '学生自主创建',
    };
    const currentIndex = draft.tasks.findIndex((item) => item.id === normalizedTask.id);
    if (currentIndex >= 0) {
      draft.tasks[currentIndex] = normalizedTask;
      return;
    }
    draft.tasks.unshift(normalizedTask);
  });

  return getDeviceTaskById(task.id);
}

export function upsertDeviceTaskWorkSubmission(input: {
  task: DemoTask;
  sheet: DeviceTaskSheet;
  formAnswers: DemoWorkAnswer[];
  media: DemoWorkMedia[];
  summary: string;
  textContent: string;
  linkedFlashNotes?: Array<{
    id: string;
    title: string;
    type?: 'voice_note' | 'video_note';
    transcript?: string;
    photoCount?: number;
    duration?: string;
  }>;
  audioPreview?: { title: string; duration?: string };
}) {
  let resultWork: DemoTaskWork | undefined;

  updateTaskState((draft) => {
    const existing = getCurrentStudentWorkBySheetId(input.sheet.id, draft.works);
    const nextType: DemoTaskWork['type'] = input.media.some((item) => item.type === '视频')
      ? '视频'
      : input.media.some((item) => item.type === '照片')
        ? '图片'
        : input.media.some((item) => item.type === '音频')
          ? '音频'
          : '文字';

    if (existing) {
      existing.title = input.sheet.title;
      existing.workCategory = input.sheet.workCategory;
      existing.topicType = input.sheet.topicType;
      existing.workMode = input.sheet.workMode;
      existing.type = nextType;
      existing.workKind = input.sheet.workKind;
      existing.summary = input.summary;
      existing.textContent = input.textContent;
      existing.media = input.media;
      existing.attachments = input.media;
      existing.formAnswers = input.formAnswers;
      existing.capabilityTags = input.task.capabilityTags;
      existing.linkedFlashNotes = input.linkedFlashNotes;
      existing.audioPreview = input.audioPreview;
      existing.canResubmit = true;
      existing.updatedAt = '刚刚';
      existing.status = '已提交';
      resultWork = clone(existing);
      return;
    }

    const nextWork: DemoTaskWork = {
      id: `work_demo_local_${Date.now()}`,
      taskId: input.task.id,
      taskSheetId: input.sheet.id,
      authorName: CURRENT_DEVICE_STUDENT_NAME,
      groupName: input.task.target === '小组' ? '海豚探索队' : undefined,
      title: input.sheet.title,
      workCategory: input.sheet.workCategory,
      topicType: input.sheet.topicType,
      workMode: input.sheet.workMode,
      type: nextType,
      workKind: input.sheet.workKind,
      summary: input.summary,
      textContent: input.textContent,
      media: input.media,
      attachments: input.media,
      formAnswers: input.formAnswers,
      capabilityTags: input.task.capabilityTags,
      linkedFlashNotes: input.linkedFlashNotes,
      audioPreview: input.audioPreview,
      canResubmit: true,
      updatedAt: '刚刚',
      status: '已提交',
    };

    draft.works.unshift(nextWork);
    resultWork = clone(nextWork);
  });

  return resultWork;
}

export function submitQuickTaskAnswer(preview: QuickTaskSubmissionPreview) {
  const matched = getDeviceTaskSheetById(preview.sheetId);
  if (!matched) {
    return null;
  }

  const primaryField =
    matched.sheet.workForm.find(
      (field): field is QuickSubmissionField =>
        field.id === preview.matchedFieldId &&
        (field.kind === 'fill_blank' || field.kind === 'single_choice' || field.kind === 'multiple_choice'),
    ) ?? findQuickSubmissionField(matched.sheet);
  if (!primaryField) {
    return null;
  }

  const primaryAnswer = resolveQuickSubmissionFieldValue(primaryField, preview.answer);
  const result = upsertDeviceTaskWorkSubmission({
    task: matched.task,
    sheet: matched.sheet,
    formAnswers: [primaryAnswer],
    media: [],
    summary: `AI语音助手已快速提交：${preview.answer}`,
    textContent: `${preview.taskTitle} · ${preview.sheetTitle}\n${preview.matchedFieldLabel}：${preview.answer}`,
  });

  return result;
}
