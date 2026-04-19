import {
  demoTaskWorks,
  demoTasks,
  type DemoTask,
  type DemoTaskWork,
  type DemoWorkAnswer,
  type DemoWorkMedia,
} from './device-demo-data';

export type DeviceTask = DemoTask;
export type DeviceTaskWork = DemoTaskWork;
export type DeviceTaskSheet = DemoTask['taskSheets'][number];

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
  summary?: string;
};

const CURRENT_DEVICE_STUDENT_NAME = '小明';

function getTaskWorks(taskId: string) {
  return demoTaskWorks.filter((work) => work.taskId === taskId);
}

function getCurrentStudentWorkBySheetId(sheetId: string) {
  return demoTaskWorks.find((work) => work.taskSheetId === sheetId && work.authorName === CURRENT_DEVICE_STUDENT_NAME);
}

function withDerivedTask(task: DemoTask): DemoTask {
  const relatedWorks = getTaskWorks(task.id);
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

export function getDeviceTaskList(): DemoTask[] {
  return demoTasks.map(withDerivedTask);
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
  return getTaskWorks(taskId);
}

export function getDeviceTaskWorksBySheetId(sheetId: string): DemoTaskWork[] {
  return demoTaskWorks.filter((work) => work.taskSheetId === sheetId);
}

export function getDeviceTaskWorkById(workId: string): DemoTaskWork | undefined {
  return demoTaskWorks.find((work) => work.id === workId);
}

export function getDeviceTaskWorkBySheetId(sheetId: string) {
  return getCurrentStudentWorkBySheetId(sheetId);
}

export function getDeviceLearningWorkItems(taskId: string): DeviceLearningWorkItem[] {
  const task = getDeviceTaskById(taskId);
  if (!task) {
    return [];
  }

  return task.taskSheets.map((sheet) => {
    const work = getCurrentStudentWorkBySheetId(sheet.id);
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
      summary: work?.summary,
    };
  });
}

export function getDevicePeerWorksByTaskId(taskId: string, currentWorkId?: string) {
  return getTaskWorks(taskId)
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
  const existing = getCurrentStudentWorkBySheetId(input.sheet.id);
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
    return existing;
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

  demoTaskWorks.unshift(nextWork);
  return nextWork;
}
