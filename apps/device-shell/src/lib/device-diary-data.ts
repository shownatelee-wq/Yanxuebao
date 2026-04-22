'use client';

import { useEffect, useState } from 'react';
import { demoDiaries } from './device-demo-data';
import { getFlashNotes, type FlashNoteItem } from './flash-notes';
import { getAlbumAssets, getMediaAssetById, type DeviceMediaAsset } from './device-media-library';
import {
  getDeviceLearningWorkItems,
  getDeviceTaskById,
  getDeviceTaskList,
  getDeviceTaskWorkById,
  useDeviceTaskSnapshot,
} from './device-task-data';
import {
  formatDeviceDateTimeRange,
  formatDeviceDisplayTime,
  getDeviceNow,
  normalizeDeviceTimeValue,
} from './device-time';

const DEVICE_DIARY_STATE_KEY = 'yanxuebao_device_diary_state_v2';
const DEVICE_DIARY_EVENT = 'yanxuebao:device-diary-state-change';
const DEVICE_DIARY_STATE_VERSION = 3;

export type DeviceDiaryRangePreset = 'today' | 'yesterday' | 'team' | 'custom';
export type DeviceDiarySelectionSource = 'flash-notes' | 'task-works' | 'images' | 'videos';

export type DeviceDiarySourceRange = {
  preset: DeviceDiaryRangePreset;
  label: string;
  startAt: string;
  endAt: string;
};

export type DeviceDiarySelectionState = {
  sourceRange: DeviceDiarySourceRange;
  prompt: string;
  selectedFlashNoteIds: string[];
  selectedTaskWorkIds: string[];
  selectedImageIds: string[];
  selectedVideoIds: string[];
};

export type DeviceDiaryAgentMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  diaryId?: string;
};

export type DeviceDiaryAgentSession = {
  id: string;
  diaryId: string | null;
  status: 'generating' | 'done';
  createdAt: string;
  createdAtValue: string;
  updatedAt: string;
  updatedAtValue: string;
  sourceRange: DeviceDiarySourceRange;
  prompt: string;
  lastInstruction?: string;
  selectedAssetIds: string[];
  selectedFlashNoteIds: string[];
  selectedTaskWorkIds: string[];
  messages: DeviceDiaryAgentMessage[];
};

export type DeviceDiaryEntry = {
  id: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  createdAtValue: string;
  updatedAt: string;
  updatedAtValue: string;
  sourceRange: DeviceDiarySourceRange;
  linkedAssets: string[];
  linkedFlashNotes: string[];
  linkedTaskWorks: string[];
  linkedAiCreations: string[];
  lastAgentInstruction?: string;
  draftStatus: 'draft' | 'final';
};

type DeviceDiaryState = {
  version: number;
  diaries: DeviceDiaryEntry[];
  selection: DeviceDiarySelectionState;
  sessions: DeviceDiaryAgentSession[];
};

export type DeviceDiaryTaskWorkOption = {
  id: string;
  title: string;
  summary: string;
  taskTitle: string;
  updatedAt: string;
  updatedAtValue: string;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildPresetRange(preset: DeviceDiaryRangePreset): DeviceDiarySourceRange {
  const now = getDeviceNow();
  const start = new Date(now);
  const end = new Date(now);

  if (preset === 'yesterday') {
    start.setDate(now.getDate() - 1);
    end.setDate(now.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return {
      preset,
      label: '昨天',
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    };
  }

  if (preset === 'team') {
    start.setHours(8, 30, 0, 0);
    end.setHours(18, 30, 0, 0);
    return {
      preset,
      label: '本次团队活动',
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    };
  }

  if (preset === 'custom') {
    start.setHours(9, 0, 0, 0);
    end.setHours(16, 30, 0, 0);
    return {
      preset,
      label: formatDeviceDateTimeRange(start.toISOString(), end.toISOString()),
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    };
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return {
    preset: 'today',
    label: '今天',
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
}

function buildCustomRange(startAt: string, endAt: string): DeviceDiarySourceRange {
  return {
    preset: 'custom',
    label: formatDeviceDateTimeRange(startAt, endAt),
    startAt,
    endAt,
  };
}

function normalizeSourceRange(value?: unknown): DeviceDiarySourceRange {
  if (value && typeof value === 'object') {
    const candidate = value as Partial<DeviceDiarySourceRange>;
    if (candidate.startAt && candidate.endAt) {
      return {
        preset: candidate.preset ?? 'custom',
        label: candidate.label ?? formatDeviceDateTimeRange(candidate.startAt, candidate.endAt),
        startAt: candidate.startAt,
        endAt: candidate.endAt,
      };
    }
  }

  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    if (trimmed === '本次团队活动') {
      return buildPresetRange('team');
    }
    if (trimmed === '昨天全天') {
      return buildPresetRange('yesterday');
    }
    if (trimmed === '今天') {
      return buildPresetRange('today');
    }

    const match = trimmed.match(/^(今天|昨天)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    if (match) {
      const dayPreset = match[1] === '昨天' ? 'yesterday' : 'today';
      const startAt = normalizeDeviceTimeValue(`${match[1]} ${match[2]}`);
      const endAt = normalizeDeviceTimeValue(`${match[1]} ${match[3]}`);
      return {
        preset: dayPreset,
        label: trimmed,
        startAt,
        endAt,
      };
    }
  }

  return buildPresetRange('today');
}

function getDefaultDiarySelection(): DeviceDiarySelectionState {
  return {
    sourceRange: buildPresetRange('today'),
    prompt: '请把今天的研学收获整理成一篇有观察、有发现、有感受的研学日记。',
    selectedFlashNoteIds: [],
    selectedTaskWorkIds: [],
    selectedImageIds: [],
    selectedVideoIds: [],
  };
}

function buildSeedDiaryEntry(item: (typeof demoDiaries)[number], index: number): DeviceDiaryEntry {
  const createdAtValue = normalizeDeviceTimeValue(item.createdAt);
  const sourceRange = index === 0
    ? {
        preset: 'today' as const,
        label: '今天 13:00 - 14:30',
        startAt: normalizeDeviceTimeValue('今天 13:00'),
        endAt: normalizeDeviceTimeValue('今天 14:30'),
      }
    : {
        preset: 'yesterday' as const,
        label: '昨天 16:30 - 18:10',
        startAt: normalizeDeviceTimeValue('昨天 16:30'),
        endAt: normalizeDeviceTimeValue('昨天 18:10'),
      };

  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    content:
      index === 0
        ? '今天我在海豚馆观察到了三次跃出水面的动作，还记录了海豚群体配合的过程，并把问问和 AI识物的结果一起整理进来了。'
        : '今天我先整理了倡议主题和口号，还计划把新的现场照片和语音闪记继续补到这篇日记里。',
    createdAt: item.createdAt,
    createdAtValue,
    updatedAt: item.createdAt,
    updatedAtValue: createdAtValue,
    sourceRange,
    linkedAssets: index === 0 ? ['album_01', 'album_07'] : [],
    linkedFlashNotes: index === 0 ? ['flash_note_voice_01'] : [],
    linkedTaskWorks: [],
    linkedAiCreations: [],
    lastAgentInstruction: index === 0 ? '把海豚协作观察写得更完整一些。' : undefined,
    draftStatus: 'draft',
  };
}

function buildInitialState(): DeviceDiaryState {
  return {
    version: DEVICE_DIARY_STATE_VERSION,
    diaries: demoDiaries.map((item, index) => buildSeedDiaryEntry(item, index)),
    selection: getDefaultDiarySelection(),
    sessions: [],
  };
}

function normalizeDiaryEntry(input: Partial<DeviceDiaryEntry>, index: number): DeviceDiaryEntry {
  const createdAtValue = input.createdAtValue ?? normalizeDeviceTimeValue(input.createdAt);
  const updatedAtValue = input.updatedAtValue ?? normalizeDeviceTimeValue(input.updatedAt ?? input.createdAt);

  return {
    id: input.id ?? `diary_seed_${index}`,
    title: input.title ?? `研学日记 ${index + 1}`,
    summary: input.summary ?? '已生成新的研学日记草稿。',
    content: input.content ?? '',
    createdAt: input.createdAt ?? formatDeviceDisplayTime(createdAtValue),
    createdAtValue,
    updatedAt: input.updatedAt ?? formatDeviceDisplayTime(updatedAtValue),
    updatedAtValue,
    sourceRange: normalizeSourceRange(input.sourceRange),
    linkedAssets: input.linkedAssets ?? [],
    linkedFlashNotes: input.linkedFlashNotes ?? [],
    linkedTaskWorks: input.linkedTaskWorks ?? [],
    linkedAiCreations: input.linkedAiCreations ?? [],
    lastAgentInstruction: input.lastAgentInstruction,
    draftStatus: input.draftStatus ?? 'draft',
  };
}

function normalizeDiarySelection(
  selection?: Partial<DeviceDiarySelectionState> & {
    selectedAiCreationIds?: string[];
  },
): DeviceDiarySelectionState {
  const fallback = getDefaultDiarySelection();
  const legacyAiCreationIds = selection?.selectedAiCreationIds ?? [];
  const legacyAiAssets = legacyAiCreationIds
    .map((assetId) => getMediaAssetById(assetId))
    .filter((item): item is DeviceMediaAsset => Boolean(item));
  return {
    sourceRange: normalizeSourceRange(selection?.sourceRange ?? fallback.sourceRange),
    prompt: selection?.prompt ?? fallback.prompt,
    selectedFlashNoteIds: selection?.selectedFlashNoteIds ?? [],
    selectedTaskWorkIds: selection?.selectedTaskWorkIds ?? [],
    selectedImageIds: uniqueIds(
      selection?.selectedImageIds
      ?? legacyAiAssets.filter((item) => item.albumTab === 'photo').map((item) => item.id),
    ),
    selectedVideoIds: uniqueIds(
      selection?.selectedVideoIds
      ?? legacyAiAssets.filter((item) => item.albumTab === 'video').map((item) => item.id),
    ),
  };
}

function normalizeDiarySession(
  session: Partial<DeviceDiaryAgentSession> & {
    autoAssetIds?: string[];
    selectedAiCreationIds?: string[];
  },
  index: number,
): DeviceDiaryAgentSession {
  const createdAtValue = session.createdAtValue ?? normalizeDeviceTimeValue(session.createdAt);
  const updatedAtValue = session.updatedAtValue ?? normalizeDeviceTimeValue(session.updatedAt ?? session.createdAt);

  return {
    id: session.id ?? `diary_session_${index}`,
    diaryId: session.diaryId ?? null,
    status: session.status ?? 'done',
    createdAt: session.createdAt ?? formatDeviceDisplayTime(createdAtValue),
    createdAtValue,
    updatedAt: session.updatedAt ?? formatDeviceDisplayTime(updatedAtValue),
    updatedAtValue,
    sourceRange: normalizeSourceRange(session.sourceRange),
    prompt: session.prompt ?? '',
    lastInstruction: session.lastInstruction,
    selectedAssetIds: uniqueIds(session.selectedAssetIds ?? [...(session.autoAssetIds ?? []), ...(session.selectedAiCreationIds ?? [])]),
    selectedFlashNoteIds: session.selectedFlashNoteIds ?? [],
    selectedTaskWorkIds: session.selectedTaskWorkIds ?? [],
    messages: session.messages ?? [],
  };
}

function readState(): DeviceDiaryState {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_DIARY_STATE_KEY);
  if (!raw) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_DIARY_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DeviceDiaryState> & { diaries?: Partial<DeviceDiaryEntry>[] };
    return {
      version: DEVICE_DIARY_STATE_VERSION,
      diaries: Array.isArray(parsed.diaries)
        ? parsed.diaries.map((item, index) => normalizeDiaryEntry(item, index))
        : buildInitialState().diaries,
      selection: normalizeDiarySelection(parsed.selection),
      sessions: Array.isArray(parsed.sessions)
        ? parsed.sessions.map((item, index) => normalizeDiarySession(item, index))
        : [],
    };
  } catch {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_DIARY_STATE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function writeState(nextState: DeviceDiaryState) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized: DeviceDiaryState = {
    version: DEVICE_DIARY_STATE_VERSION,
    diaries: nextState.diaries.map((item, index) => normalizeDiaryEntry(item, index)),
    selection: normalizeDiarySelection(nextState.selection),
    sessions: nextState.sessions.map((item, index) => normalizeDiarySession(item, index)),
  };

  window.sessionStorage.setItem(DEVICE_DIARY_STATE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(DEVICE_DIARY_EVENT));
}

function updateState(mutator: (draft: DeviceDiaryState) => void) {
  const draft = clone(readState());
  mutator(draft);
  writeState(draft);
  return draft;
}

function uniqueIds(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildCountLabel(label: string, count: number) {
  return count > 0 ? `${count}${label}` : '';
}

function buildAssetSentence(asset: DeviceMediaAsset) {
  return `${asset.title}${asset.primaryLabel ? `（${asset.primaryLabel}）` : ''}`;
}

function getDiarySourceAssets(session: {
  selectedAssetIds: string[];
}) {
  return session.selectedAssetIds
    .map((assetId) => getMediaAssetById(assetId))
    .filter((item): item is DeviceMediaAsset => Boolean(item));
}

function getDiarySourceFlashNotes(flashNoteIds: string[]) {
  const notes = getFlashNotes();
  return flashNoteIds
    .map((noteId) => notes.find((item) => item.id === noteId))
    .filter((item): item is FlashNoteItem => Boolean(item));
}

function getDiarySourceTaskWorks(taskWorkIds: string[]) {
  return taskWorkIds
    .map((workId) => getDeviceTaskWorkById(workId))
    .filter((item): item is NonNullable<ReturnType<typeof getDeviceTaskWorkById>> => Boolean(item));
}

function buildDiaryTitle(selectedAssets: DeviceMediaAsset[], taskWorks: ReturnType<typeof getDiarySourceTaskWorks>) {
  const firstAsset = selectedAssets[0];
  if (firstAsset?.primaryLabel) {
    return `${firstAsset.primaryLabel}研学日记`;
  }
  if (firstAsset) {
    return `${firstAsset.title}研学日记`;
  }
  if (taskWorks[0]) {
    const task = getDeviceTaskById(taskWorks[0].taskId);
    return `${task?.title ?? '研学任务'}日记`;
  }
  return 'AI生成研学日记';
}

function buildDiaryDraft(session: DeviceDiaryAgentSession, prompt: string, instruction?: string) {
  const selectedAssets = getDiarySourceAssets(session);
  const flashNotes = getDiarySourceFlashNotes(session.selectedFlashNoteIds);
  const taskWorks = getDiarySourceTaskWorks(session.selectedTaskWorkIds);

  const counts = [
    buildCountLabel('张图片', selectedAssets.filter((item) => item.albumTab === 'photo').length),
    buildCountLabel('段视频', selectedAssets.filter((item) => item.albumTab === 'video').length),
    buildCountLabel('条闪记', flashNotes.length),
    buildCountLabel('份任务作品', taskWorks.length),
  ].filter(Boolean);

  const paragraphs = [
    `这篇日记的记录日期是${session.sourceRange.label}，我围绕${selectedAssets.length ? selectedAssets.map((item) => item.primaryLabel ?? item.title).slice(0, 2).join('、') : '本次研学活动'}进行了观察和记录。`,
    selectedAssets.length
      ? `我先整理了手动补充进来的图片和视频，包括${selectedAssets.map(buildAssetSentence).join('、')}，这些现场素材帮我回看了关键变化、动作和最值得记下来的细节。`
      : '这次我没有补充图片或视频素材，准备重点围绕闪记和任务作品来整理日记。',
    flashNotes.length
      ? `我还补充了${flashNotes.length}条闪记，像${flashNotes.map((note) => note.title).join('、')}，这些即时记录把我当时听到的声音、想到的问题和现场发现都补得更完整。`
      : '',
    taskWorks.length
      ? `和这次经历相关的任务作品也一起带进来了，例如${taskWorks
          .map((work) => `${work.title}（${getDeviceTaskById(work.taskId)?.title ?? '任务'}）`)
          .join('、')}，让我能把任务里的观察结果直接写进日记。`
      : '',
    `结合“${prompt}”这个要求，我把今天最重要的发现整理成一篇更完整的研学日记，既记录看到的现象，也写下自己的判断和感受。`,
    instruction
      ? `我又根据新的修改要求“${instruction}”继续调整了这篇日记，让内容更贴近我真正想表达的重点。`
      : '接下来我还可以继续用语音或文字指令，补充新的发现、调整语气，或者把某一段观察写得更详细。',
  ].filter(Boolean);

  const content = paragraphs.join('\n\n');

  return {
    title: buildDiaryTitle(selectedAssets, taskWorks),
    summary: counts.length ? `已整理 ${counts.join('、')}，生成了一篇研学日记草稿。` : '已生成新的研学日记草稿。',
    content,
  };
}

export function getDefaultDiaryPrompt() {
  return getDefaultDiarySelection().prompt;
}

export function getDiaryRangePresetOptions() {
  return [
    buildPresetRange('today'),
    buildPresetRange('yesterday'),
    buildPresetRange('team'),
    buildPresetRange('custom'),
  ];
}

export function getDeviceDiaries() {
  return clone(readState().diaries);
}

export function getDeviceDiaryById(diaryId: string) {
  return getDeviceDiaries().find((item) => item.id === diaryId) ?? null;
}

export function getDiarySelectionState() {
  return clone(readState().selection);
}

export function getDiaryAgentSessionById(sessionId: string) {
  return readState().sessions.find((item) => item.id === sessionId) ?? null;
}

export function useDeviceDiarySnapshot() {
  const [diaries, setDiaries] = useState<DeviceDiaryEntry[]>(() => getDeviceDiaries());
  const taskSnapshot = useDeviceTaskSnapshot();

  useEffect(() => {
    function sync() {
      setDiaries(getDeviceDiaries());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_DIARY_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_DIARY_EVENT, sync);
    };
  }, [taskSnapshot.tasks, taskSnapshot.works]);

  return diaries;
}

export function useDeviceDiaryStore() {
  const [snapshot, setSnapshot] = useState<DeviceDiaryState>(() => readState());
  const taskSnapshot = useDeviceTaskSnapshot();

  useEffect(() => {
    function sync() {
      setSnapshot(readState());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_DIARY_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_DIARY_EVENT, sync);
    };
  }, [taskSnapshot.tasks, taskSnapshot.works]);

  return snapshot;
}

export function getDiarySelectableMediaAssets(tab: 'photo' | 'video') {
  return getAlbumAssets(tab)
    .filter(
      (asset) =>
        asset.albumTab === tab
        && asset.type === (tab === 'photo' ? '照片' : '视频'),
    )
    .sort((left, right) => right.createdAtValue.localeCompare(left.createdAtValue, 'zh-CN'));
}

export function getDiarySelectableFlashNotes() {
  return getFlashNotes().sort((left, right) => right.createdAtValue.localeCompare(left.createdAtValue, 'zh-CN'));
}

export function getDiarySelectableTaskWorks(): DeviceDiaryTaskWorkOption[] {
  const tasks = getDeviceTaskList();
  const items = tasks.flatMap((task) =>
    getDeviceLearningWorkItems(task.id)
      .filter((item) => item.workId)
      .map((item) => ({
        id: item.workId as string,
        title: item.title,
        summary: item.summary ?? item.requirement,
        taskTitle: task.title,
        updatedAt: item.updatedAt ?? '刚刚',
        updatedAtValue: item.updatedAtValue ?? normalizeDeviceTimeValue(item.updatedAt),
      })),
  );

  return items.sort((left, right) => right.updatedAtValue.localeCompare(left.updatedAtValue, 'zh-CN'));
}

export function updateDiarySelection(input: Partial<DeviceDiarySelectionState>) {
  updateState((draft) => {
    draft.selection = normalizeDiarySelection({
      ...draft.selection,
      ...input,
    });
  });
  return getDiarySelectionState();
}

export function updateDiarySelectionRange(range: DeviceDiarySourceRange) {
  return updateDiarySelection({ sourceRange: range });
}

export function createCustomDiaryRange(startAt: string, endAt: string) {
  const safeStart = new Date(startAt).getTime() <= new Date(endAt).getTime() ? startAt : endAt;
  const safeEnd = new Date(startAt).getTime() <= new Date(endAt).getTime() ? endAt : startAt;
  return buildCustomRange(safeStart, safeEnd);
}

export function setDiarySelectionIds(source: DeviceDiarySelectionSource, ids: string[]) {
  updateState((draft) => {
    if (source === 'flash-notes') {
      draft.selection.selectedFlashNoteIds = uniqueIds(ids);
      return;
    }
    if (source === 'task-works') {
      draft.selection.selectedTaskWorkIds = uniqueIds(ids);
      return;
    }
    if (source === 'images') {
      draft.selection.selectedImageIds = uniqueIds(ids);
      return;
    }
    draft.selection.selectedVideoIds = uniqueIds(ids);
  });

  return getDiarySelectionState();
}

export function removeDiarySelectionId(source: DeviceDiarySelectionSource, id: string) {
  const selection = getDiarySelectionState();
  if (source === 'flash-notes') {
    return setDiarySelectionIds(source, selection.selectedFlashNoteIds.filter((item) => item !== id));
  }
  if (source === 'task-works') {
    return setDiarySelectionIds(source, selection.selectedTaskWorkIds.filter((item) => item !== id));
  }
  if (source === 'images') {
    return setDiarySelectionIds(source, selection.selectedImageIds.filter((item) => item !== id));
  }
  return setDiarySelectionIds(source, selection.selectedVideoIds.filter((item) => item !== id));
}

export function createDiaryAgentSessionFromSelection(input?: {
  prompt?: string;
  sourceRange?: DeviceDiarySourceRange;
}) {
  const state = readState();
  const selection = normalizeDiarySelection({
    ...state.selection,
    ...input,
  });
  const selectedAssetIds = uniqueIds([...selection.selectedImageIds, ...selection.selectedVideoIds]);
  const selectedAssets = selectedAssetIds
    .map((assetId) => getMediaAssetById(assetId))
    .filter((item): item is DeviceMediaAsset => Boolean(item));
  const assetSummary = [
    buildCountLabel('张图片', selectedAssets.filter((item) => item.albumTab === 'photo').length),
    buildCountLabel('段视频', selectedAssets.filter((item) => item.albumTab === 'video').length),
    buildCountLabel('条闪记', selection.selectedFlashNoteIds.length),
    buildCountLabel('份任务作品', selection.selectedTaskWorkIds.length),
  ].filter(Boolean).join('、');
  const timestamp = new Date().toISOString();
  const sessionId = `diary_session_${Date.now()}`;

  const session: DeviceDiaryAgentSession = {
    id: sessionId,
    diaryId: null,
    status: 'generating',
    createdAt: formatDeviceDisplayTime(timestamp),
    createdAtValue: timestamp,
    updatedAt: formatDeviceDisplayTime(timestamp),
    updatedAtValue: timestamp,
    sourceRange: selection.sourceRange,
    prompt: selection.prompt,
    selectedAssetIds,
    selectedFlashNoteIds: selection.selectedFlashNoteIds,
    selectedTaskWorkIds: selection.selectedTaskWorkIds,
    messages: [
      {
        id: `${sessionId}_assistant_intro`,
        role: 'assistant',
        content: `研学日记智能体已收到这篇日记的记录日期“${selection.sourceRange.label}”和你补充的内容。${assetSummary ? `我会先整理 ${assetSummary}。` : '我会先根据你补充的素材和要求来生成日记。'}`,
      },
      {
        id: `${sessionId}_user_prompt`,
        role: 'user',
        content: selection.prompt,
      },
      {
        id: `${sessionId}_assistant_generating`,
        role: 'assistant',
        content: '我正在根据这些素材生成研学日记草稿，请稍等一下。',
      },
    ],
  };

  updateState((draft) => {
    draft.selection = selection;
    draft.sessions = [session, ...draft.sessions.filter((item) => item.id !== session.id)];
  });

  return session;
}

export function appendDiaryAgentInstruction(sessionId: string, instruction: string) {
  const session = getDiaryAgentSessionById(sessionId);
  const trimmed = instruction.trim();
  if (!session || !trimmed) {
    return null;
  }

  const nextTimestamp = new Date().toISOString();
  const nextSession: DeviceDiaryAgentSession = {
    ...session,
    status: 'generating',
    updatedAt: formatDeviceDisplayTime(nextTimestamp),
    updatedAtValue: nextTimestamp,
    lastInstruction: trimmed,
    messages: [
      ...session.messages,
      {
        id: `${sessionId}_user_${Date.now()}`,
        role: 'user',
        content: trimmed,
      },
      {
        id: `${sessionId}_assistant_${Date.now()}`,
        role: 'assistant',
        content: '收到新的修改要求，我正在继续改写这篇研学日记。',
      },
    ],
  };

  updateState((draft) => {
    draft.sessions = [nextSession, ...draft.sessions.filter((item) => item.id !== sessionId)];
  });

  return nextSession;
}

export function completeDiaryAgentSession(sessionId: string) {
  const session = getDiaryAgentSessionById(sessionId);
  if (!session || session.status !== 'generating') {
    return session;
  }

  const nextTimestamp = new Date().toISOString();
  const draft = buildDiaryDraft(session, session.prompt, session.lastInstruction);
  const diaryId = session.diaryId ?? `diary_${Date.now()}`;
  const existingDiary = session.diaryId ? getDeviceDiaryById(diaryId) : null;
  const nextDiary: DeviceDiaryEntry = normalizeDiaryEntry(
    {
      id: diaryId,
      title: draft.title,
      summary: draft.summary,
      content: draft.content,
      createdAt: existingDiary?.createdAt ?? formatDeviceDisplayTime(nextTimestamp),
      createdAtValue: existingDiary?.createdAtValue ?? nextTimestamp,
      updatedAt: formatDeviceDisplayTime(nextTimestamp),
      updatedAtValue: nextTimestamp,
      sourceRange: session.sourceRange,
      linkedAssets: session.selectedAssetIds,
      linkedFlashNotes: session.selectedFlashNoteIds,
      linkedTaskWorks: session.selectedTaskWorkIds,
      linkedAiCreations: [],
      lastAgentInstruction: session.lastInstruction ?? session.prompt,
      draftStatus: 'draft',
    },
    0,
  );

  const nextSession: DeviceDiaryAgentSession = {
    ...session,
    diaryId,
    status: 'done',
    updatedAt: formatDeviceDisplayTime(nextTimestamp),
    updatedAtValue: nextTimestamp,
    messages: [
      ...session.messages,
      {
        id: `${sessionId}_result_${Date.now()}`,
        role: 'assistant',
        content: '研学日记草稿已经生成好了，我也已经把最新内容同步保存到归档里。',
        diaryId,
      },
    ],
  };

  updateState((draftState) => {
    draftState.diaries = [nextDiary, ...draftState.diaries.filter((item) => item.id !== diaryId)];
    draftState.sessions = [nextSession, ...draftState.sessions.filter((item) => item.id !== sessionId)];
  });

  return nextSession;
}

export function updateDeviceDiary(
  diaryId: string,
  input: Partial<Pick<DeviceDiaryEntry, 'title' | 'summary' | 'content' | 'sourceRange' | 'lastAgentInstruction' | 'draftStatus'>>,
) {
  const nextTimestamp = new Date().toISOString();

  updateState((draft) => {
    draft.diaries = draft.diaries.map((item) =>
      item.id === diaryId
        ? normalizeDiaryEntry(
            {
              ...item,
              ...input,
              updatedAt: formatDeviceDisplayTime(nextTimestamp),
              updatedAtValue: nextTimestamp,
            },
            0,
          )
        : item,
    );
  });
}
