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
  const rating = currentStudentWorks.some((work) => work.teacherReview?.score != null) ? task.rating ?? 'B' : task.rating;

  return {
    ...task,
    worksSubmitted: Math.max(task.worksSubmitted, submittedSheetCount),
    rating,
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
      const reviewStatus =
        currentWork?.teacherReview?.status === '已评价'
          ? '已完成'
          : currentWork?.peerReviews?.length
            ? '待教师评价'
            : currentWork?.selfReview
              ? currentWork.workMode === '小组协作'
                ? '待互评'
                : '待教师评价'
              : sheet.reviewStatus;

      return {
        ...sheet,
        submissionStatus,
        reviewStatus,
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

  return task.taskSheets
    .map((sheet) => {
      const work = getCurrentStudentWorkBySheetId(sheet.id);
      const displayStatus: DeviceLearningWorkItem['displayStatus'] = work?.status === '已提交' ? '已提交' : '未完成';

      return {
        taskId: task.id,
        sheetId: sheet.id,
        title: sheet.title,
        topicType: sheet.topicType,
        workCategory: sheet.workCategory,
        workMode: sheet.workMode,
        requirement: sheet.requirement,
        displayStatus,
        entryPath: work?.status === '已提交' ? `/tasks/works/${work.id}` : `/tasks/new?taskId=${task.id}&sheetId=${sheet.id}`,
        workId: work?.id,
        updatedAt: work?.updatedAt,
        summary: work?.summary,
      };
    })
    .sort((left, right) => {
      if (left.displayStatus !== right.displayStatus) {
        return left.displayStatus === '未完成' ? -1 : 1;
      }
      return left.title.localeCompare(right.title, 'zh-CN');
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
}) {
  const existing = getCurrentStudentWorkBySheetId(input.sheet.id);
  const nextType: DemoTaskWork['type'] = input.media.some((item) => item.type === '视频')
    ? '视频'
    : input.media.some((item) => item.type === '照片')
      ? '图片'
      : '文字';

  if (existing) {
    existing.title = input.sheet.title;
    existing.workCategory = input.sheet.workCategory;
    existing.topicType = input.sheet.topicType;
    existing.workMode = input.sheet.workMode;
    existing.type = nextType;
    existing.summary = input.summary;
    existing.textContent = input.textContent;
    existing.media = input.media;
    existing.formAnswers = input.formAnswers;
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
    summary: input.summary,
    textContent: input.textContent,
    media: input.media,
    formAnswers: input.formAnswers,
    updatedAt: '刚刚',
    status: '已提交',
    teacherReview: { status: '待评价' },
  };

  demoTaskWorks.unshift(nextWork);
  return nextWork;
}

export function submitDevicePeerReview(input: {
  workId: string;
  reviewerName: string;
  totalScore: number;
  summary: string;
  items: Array<{
    dimension: string;
    score: number;
    level: string;
    comment: string;
  }>;
}) {
  const work = demoTaskWorks.find((item) => item.id === input.workId);
  if (!work) {
    return undefined;
  }

  const completedAt = '刚刚';
  const peerReview = {
    reviewer: input.reviewerName,
    score: input.totalScore,
    comment: input.summary,
    completedAt,
  };
  const peerReviewDetail = {
    role: '互评' as const,
    targetName: work.authorName,
    totalScore: input.totalScore,
    summary: input.summary,
    completedAt,
    items: input.items,
  };

  work.peerReviews = [peerReview, ...(work.peerReviews ?? []).filter((item) => item.reviewer !== input.reviewerName)];
  work.peerReviewDetails = [
    peerReviewDetail,
    ...(work.peerReviewDetails ?? []).filter((item) => !(item.targetName === work.authorName && item.summary === input.summary)),
  ];
  work.updatedAt = '刚刚';

  return work;
}
