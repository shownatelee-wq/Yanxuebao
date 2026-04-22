'use client';

import { useEffect, useState } from 'react';
import { demoAlbumItems } from './device-demo-data';
import { formatDeviceDisplayTime, normalizeDeviceTimeValue } from './device-time';

const DEVICE_MEDIA_LIBRARY_KEY = 'yanxuebao_device_media_library_v2';
const DEVICE_MEDIA_LIBRARY_EVENT = 'yanxuebao:device-media-library-change';

export type DeviceMediaAccent = 'blue' | 'green' | 'orange' | 'purple';
export type DeviceMediaSourceApp =
  | 'capture'
  | 'ask'
  | 'identify'
  | 'ai-create'
  | 'meeting'
  | 'tasks'
  | 'flash-note'
  | 'diary'
  | 'album';
export type DeviceMediaType = '照片' | '视频' | '截图' | 'AI图片' | 'AI视频';
export type DeviceAlbumTab = 'photo' | 'video' | 'screenshot';
export type DeviceMediaLinkedEntityType =
  | 'identify'
  | 'ask'
  | 'task-work'
  | 'meeting'
  | 'flash-note'
  | 'diary'
  | 'ai-create';

export type DeviceMediaLinkedEntity = {
  type: DeviceMediaLinkedEntityType;
  id: string;
  title: string;
};

export type DeviceMediaAsset = {
  id: string;
  title: string;
  type: DeviceMediaType;
  albumTab: DeviceAlbumTab;
  createdAt: string;
  createdAtValue: string;
  previewLabel?: string;
  accent?: DeviceMediaAccent;
  primaryLabel?: string;
  recognizedNames?: string[];
  identifySummary?: string;
  identifySource?: '拍照识别' | '关键帧识别' | '截图分析';
  confidence?: number;
  summary: string;
  sourceApp: DeviceMediaSourceApp;
  canShareToTask: boolean;
  duration?: string;
  coverImage?: string;
  detailPath?: string;
  linkedEntity?: DeviceMediaLinkedEntity;
};

export type DeviceIdentifyConversationMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

export type DeviceIdentifyRecord = {
  id: string;
  assetId: string;
  title: string;
  createdAt: string;
  createdAtValue: string;
  source: 'capture' | 'album' | 'app';
  primaryLabel: string;
  recognizedNames: string[];
  summary: string;
  narration: string;
  conversation: DeviceIdentifyConversationMessage[];
  shareTargets: string[];
};

export type DeviceAiCreationRecord = {
  id: string;
  prompt: string;
  mode: 'image' | 'video';
  assetId: string;
  createdAt: string;
  createdAtValue: string;
  sourceLabel: string;
};

export type DeviceForwardTarget = {
  assetId: string;
  target: 'expert' | 'model';
  agentId?: string;
  source?: string;
  createdAt: string;
  createdAtValue: string;
};

type DeviceMediaLibraryState = {
  assets: DeviceMediaAsset[];
  identifyRecords: DeviceIdentifyRecord[];
  aiCreations: DeviceAiCreationRecord[];
  pendingForward: DeviceForwardTarget | null;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function mapAlbumTypeToTab(type: DeviceMediaType): DeviceAlbumTab {
  if (type === '视频' || type === 'AI视频') {
    return 'video';
  }
  if (type === '截图') {
    return 'screenshot';
  }
  return 'photo';
}

function withTimeValue<T extends { createdAt: string; createdAtValue?: string }>(item: T): T {
  const createdAtValue = item.createdAtValue ?? normalizeDeviceTimeValue(item.createdAt);
  return {
    ...item,
    createdAtValue,
    createdAt: item.createdAt === '刚刚' || item.createdAt.includes('今天') || item.createdAt.includes('昨天')
      ? item.createdAt
      : formatDeviceDisplayTime(createdAtValue),
  };
}

function normalizeMediaAsset(asset: DeviceMediaAsset): DeviceMediaAsset {
  return withTimeValue(asset);
}

function normalizeIdentifyRecord(record: DeviceIdentifyRecord): DeviceIdentifyRecord {
  return withTimeValue(record);
}

function normalizeAiCreationRecord(record: DeviceAiCreationRecord): DeviceAiCreationRecord {
  return withTimeValue(record);
}

function normalizeForwardTarget(target: DeviceForwardTarget): DeviceForwardTarget {
  return withTimeValue(target);
}

function buildSeedAssets(): DeviceMediaAsset[] {
  const extraAlbumAssets: DeviceMediaAsset[] = [
    {
      id: 'album_04',
      title: '海洋馆入口合影',
      type: '照片',
      albumTab: 'photo',
      createdAt: '今天 09:12',
      createdAtValue: normalizeDeviceTimeValue('今天 09:12'),
      previewLabel: '入口合影',
      accent: 'green',
      primaryLabel: '合影',
      recognizedNames: ['研学入口', '团队合影'],
      identifySummary: '识别到研学入口合影，适合记录集合地点和小组成员。',
      identifySource: '拍照识别',
      confidence: 0.88,
      summary: '海洋馆入口合影，可用于研学日记封面。',
      sourceApp: 'capture',
      canShareToTask: true,
      detailPath: '/album/album_04',
    },
    {
      id: 'album_05',
      title: '水母展区照片',
      type: '照片',
      albumTab: 'photo',
      createdAt: '今天 10:05',
      createdAtValue: normalizeDeviceTimeValue('今天 10:05'),
      previewLabel: '水母展区',
      accent: 'purple',
      primaryLabel: '水母',
      recognizedNames: ['水母', '透明伞体', '展区灯光'],
      identifySummary: '识别到水母展区，建议观察伞体形态和游动方式。',
      identifySource: '拍照识别',
      confidence: 0.91,
      summary: '水母展区照片，可继续问问它的身体结构。',
      sourceApp: 'capture',
      canShareToTask: true,
      detailPath: '/album/album_05',
    },
    {
      id: 'album_06',
      title: '触摸池观察',
      type: '照片',
      albumTab: 'photo',
      createdAt: '今天 10:32',
      createdAtValue: normalizeDeviceTimeValue('今天 10:32'),
      previewLabel: '触摸池',
      accent: 'orange',
      primaryLabel: '海星',
      recognizedNames: ['海星', '触摸池', '观察记录'],
      identifySummary: '识别到触摸池观察场景，适合记录触感和保护规则。',
      identifySource: '拍照识别',
      confidence: 0.84,
      summary: '触摸池观察照片，可加入体验任务。',
      sourceApp: 'capture',
      canShareToTask: true,
      detailPath: '/album/album_06',
    },
    {
      id: 'album_07',
      title: '企鹅行走视频',
      type: '视频',
      albumTab: 'video',
      createdAt: '今天 11:20',
      createdAtValue: normalizeDeviceTimeValue('今天 11:20'),
      previewLabel: '企鹅行走',
      accent: 'blue',
      primaryLabel: '企鹅',
      recognizedNames: ['企鹅', '步态', '群体行为'],
      identifySummary: '根据关键帧识别到企鹅行走，建议记录它的步态和群体行动。',
      identifySource: '关键帧识别',
      confidence: 0.87,
      summary: '企鹅行走视频，适合做行为观察。',
      sourceApp: 'capture',
      canShareToTask: true,
      duration: '00:21',
      detailPath: '/album/album_07',
    },
    {
      id: 'album_08',
      title: '珊瑚礁鱼群视频',
      type: '视频',
      albumTab: 'video',
      createdAt: '今天 11:48',
      createdAtValue: normalizeDeviceTimeValue('今天 11:48'),
      previewLabel: '鱼群游动',
      accent: 'green',
      primaryLabel: '鱼群',
      recognizedNames: ['鱼群', '珊瑚礁', '群体游动'],
      identifySummary: '根据关键帧识别到鱼群，建议记录队形变化和栖息环境。',
      identifySource: '关键帧识别',
      confidence: 0.89,
      summary: '珊瑚礁鱼群视频，可用于生态设施观察。',
      sourceApp: 'capture',
      canShareToTask: true,
      duration: '00:18',
      detailPath: '/album/album_08',
    },
  ];

  const seedScreenshots: DeviceMediaAsset[] = [
    {
      id: 'album_screenshot_ask_01',
      title: '问问对话截图',
      type: '截图',
      albumTab: 'screenshot',
      createdAt: '今天 14:10',
      createdAtValue: normalizeDeviceTimeValue('今天 14:10'),
      previewLabel: '问问截图',
      accent: 'blue',
      summary: '记录了“为什么海豚会结队活动”的对话过程，可继续发送给老师或加入任务作品。',
      sourceApp: 'ask',
      canShareToTask: true,
      linkedEntity: { type: 'ask', id: 'ask_shot_01', title: '问问对话截图' },
      detailPath: '/album/album_screenshot_ask_01',
    },
    {
      id: 'album_screenshot_identify_01',
      title: 'AI识物讲解截图',
      type: '截图',
      albumTab: 'screenshot',
      createdAt: '今天 14:18',
      createdAtValue: normalizeDeviceTimeValue('今天 14:18'),
      previewLabel: 'AI识物截图',
      accent: 'green',
      summary: '保存了 AI识物自动讲解和多轮追问结果，可加入 AI 探究记录。',
      sourceApp: 'identify',
      canShareToTask: true,
      linkedEntity: { type: 'identify', id: 'identify_record_seed_01', title: '海豚识物记录' },
      detailPath: '/album/album_screenshot_identify_01',
    },
    {
      id: 'album_screenshot_meeting_01',
      title: '会议纪要截图',
      type: '截图',
      albumTab: 'screenshot',
      createdAt: '今天 16:12',
      createdAtValue: normalizeDeviceTimeValue('今天 16:12'),
      previewLabel: '会议纪要截图',
      accent: 'purple',
      summary: '用于快速保存会议纪要重点，并转发到微聊或加入任务。',
      sourceApp: 'meeting',
      canShareToTask: true,
      linkedEntity: { type: 'meeting', id: 'meeting_01', title: '海豚观察碰头会纪要' },
      detailPath: '/album/album_screenshot_meeting_01',
    },
  ];

  return [
    ...demoAlbumItems.map<DeviceMediaAsset>((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      albumTab: mapAlbumTypeToTab(item.type),
      createdAt: item.capturedAt,
      createdAtValue: normalizeDeviceTimeValue(item.capturedAt),
      previewLabel: item.previewLabel,
      accent: item.accent,
      primaryLabel: item.primaryLabel,
      recognizedNames: item.recognizedNames,
      identifySummary: item.identifySummary,
      identifySource: item.identifySource,
      confidence: item.confidence,
      summary: item.identifySummary ?? `${item.title} 可继续发送给问问或 AI识物。`,
      sourceApp: 'capture',
      canShareToTask: true,
      detailPath: `/album/${item.id}`,
    })),
    ...extraAlbumAssets,
    ...seedScreenshots,
  ];
}

function buildIdentifyRecord(asset: DeviceMediaAsset, source: DeviceIdentifyRecord['source']): DeviceIdentifyRecord {
  const primaryLabel = asset.primaryLabel ?? asset.title;
  const recognizedNames = asset.recognizedNames?.length ? asset.recognizedNames : [primaryLabel];
  return {
    id: `identify_record_${asset.id}`,
    assetId: asset.id,
    title: `${primaryLabel}识物记录`,
    createdAt: asset.createdAt,
    createdAtValue: asset.createdAtValue,
    source,
    primaryLabel,
    recognizedNames,
    summary:
      asset.identifySummary ??
      `识别到 ${primaryLabel}，建议继续围绕“它是什么、它在做什么、为什么会这样”三个角度追问。`,
    narration:
      asset.identifySummary ??
      `${primaryLabel} 已识别完成，我正在为你讲解这个对象的主要特征和适合继续提问的方向。`,
    conversation: [
      {
        id: `identify_message_${asset.id}_1`,
        role: 'assistant',
        content:
          asset.identifySummary ??
          `这是一次关于 ${primaryLabel} 的识物结果。你可以继续问我它的结构、行为或和当前研学任务的关系。`,
      },
    ],
    shareTargets: ['任务作品', '老师', '家长', '微聊'],
  };
}

function buildInitialState(): DeviceMediaLibraryState {
  const assets = buildSeedAssets();
  const identifyAssets = assets.filter((item) => item.type !== '截图').slice(0, 2);
  return {
    assets,
    identifyRecords: identifyAssets.map((item, index) =>
      buildIdentifyRecord(item, index === 0 ? 'capture' : 'album'),
    ),
    aiCreations: [],
    pendingForward: null,
  };
}

function readState(): DeviceMediaLibraryState {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_MEDIA_LIBRARY_KEY);
  if (!raw) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_MEDIA_LIBRARY_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = JSON.parse(raw) as DeviceMediaLibraryState;
  return {
    ...parsed,
    assets: parsed.assets.map((item) => normalizeMediaAsset(item)),
    identifyRecords: parsed.identifyRecords.map((item) => normalizeIdentifyRecord(item)),
    aiCreations: parsed.aiCreations.map((item) => normalizeAiCreationRecord(item)),
    pendingForward: parsed.pendingForward ? normalizeForwardTarget(parsed.pendingForward) : null,
  };
}

function writeState(nextState: DeviceMediaLibraryState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(DEVICE_MEDIA_LIBRARY_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event(DEVICE_MEDIA_LIBRARY_EVENT));
}

function updateState(updater: (state: DeviceMediaLibraryState) => DeviceMediaLibraryState) {
  const nextState = updater(readState());
  writeState(nextState);
  return nextState;
}

export function getDeviceMediaLibrarySnapshot() {
  return clone(readState());
}

export function useDeviceMediaLibrary() {
  const [snapshot, setSnapshot] = useState<DeviceMediaLibraryState>(() => getDeviceMediaLibrarySnapshot());

  useEffect(() => {
    function sync() {
      setSnapshot(getDeviceMediaLibrarySnapshot());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_MEDIA_LIBRARY_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_MEDIA_LIBRARY_EVENT, sync);
    };
  }, []);

  return snapshot;
}

export function getMediaAssetById(assetId: string) {
  return getDeviceMediaLibrarySnapshot().assets.find((item) => item.id === assetId) ?? null;
}

export function getAlbumAssets(tab?: DeviceAlbumTab) {
  const assets = getDeviceMediaLibrarySnapshot().assets;
  if (!tab) {
    return assets;
  }
  return assets.filter((item) => item.albumTab === tab);
}

export function saveMediaAsset(asset: DeviceMediaAsset) {
  const normalizedAsset = normalizeMediaAsset({
    ...asset,
    detailPath: asset.detailPath ?? `/album/${asset.id}`,
  });
  updateState((state) => ({
    ...state,
    assets: [normalizedAsset, ...state.assets.filter((item) => item.id !== asset.id)],
  }));
  return normalizedAsset;
}

export function createGeneratedMediaAsset({
  prompt,
  mode,
  sourceApp,
  sourceLabel,
  linkedEntity,
}: {
  prompt: string;
  mode: 'image' | 'video';
  sourceApp: DeviceMediaSourceApp;
  sourceLabel: string;
  linkedEntity?: DeviceMediaLinkedEntity;
}) {
  const timestamp = Date.now();
  const asset: DeviceMediaAsset = {
    id: `ai_creation_asset_${timestamp}`,
    title: mode === 'image' ? 'AI生成图片' : 'AI生成视频',
    type: mode === 'image' ? 'AI图片' : 'AI视频',
    albumTab: mode === 'image' ? 'photo' : 'video',
    createdAt: '刚刚',
    createdAtValue: new Date(timestamp).toISOString(),
    previewLabel: prompt.slice(0, 12) || (mode === 'image' ? 'AI图片' : 'AI视频'),
    accent: mode === 'image' ? 'orange' : 'purple',
    summary: `来自${sourceLabel}的 ${mode === 'image' ? 'AI图片' : 'AI视频'} 结果，可继续发送给问问、加入任务或写入研学日记。`,
    sourceApp,
    canShareToTask: true,
    duration: mode === 'video' ? '00:15' : undefined,
    linkedEntity,
  };

  const record: DeviceAiCreationRecord = {
    id: `ai_creation_${timestamp}`,
    prompt,
    mode,
    assetId: asset.id,
    createdAt: formatDeviceDisplayTime(asset.createdAtValue),
    createdAtValue: asset.createdAtValue,
    sourceLabel,
  };

  updateState((state) => ({
    ...state,
    assets: [asset, ...state.assets.filter((item) => item.id !== asset.id)],
    aiCreations: [record, ...state.aiCreations.filter((item) => item.id !== record.id)],
  }));

  return { asset, record };
}

export function saveScreenshotAsset({
  title,
  previewLabel,
  summary,
  sourceApp,
  linkedEntity,
}: {
  title: string;
  previewLabel?: string;
  summary: string;
  sourceApp: DeviceMediaSourceApp;
  linkedEntity?: DeviceMediaLinkedEntity;
}) {
  const assetId = `screenshot_${Date.now()}`;
  const asset: DeviceMediaAsset = {
    id: assetId,
    title,
    type: '截图',
    albumTab: 'screenshot',
    createdAt: '刚刚',
    createdAtValue: new Date().toISOString(),
    previewLabel,
    accent: 'blue',
    summary,
    sourceApp,
    canShareToTask: true,
    linkedEntity,
    detailPath: `/album/${assetId}`,
  };

  saveMediaAsset(asset);
  return asset;
}

export function getIdentifyRecords() {
  return getDeviceMediaLibrarySnapshot().identifyRecords;
}

export function getIdentifyRecordById(recordId: string) {
  return getIdentifyRecords().find((item) => item.id === recordId) ?? null;
}

export function getIdentifyRecordByAssetId(assetId: string) {
  return getIdentifyRecords().find((item) => item.assetId === assetId) ?? null;
}

export function createIdentifyRecordForAsset(assetId: string, source: DeviceIdentifyRecord['source']) {
  const asset = getMediaAssetById(assetId);
  if (!asset) {
    return null;
  }

  const existing = getIdentifyRecordByAssetId(assetId);
  if (existing) {
    return existing;
  }

  const record = buildIdentifyRecord(asset, source);
  updateState((state) => ({
    ...state,
    identifyRecords: [record, ...state.identifyRecords.filter((item) => item.id !== record.id)],
  }));
  return record;
}

export function appendIdentifyConversation(recordId: string, userPrompt: string) {
  const record = getIdentifyRecordById(recordId);
  if (!record) {
    return null;
  }

  const assistantReply = `围绕“${record.primaryLabel}”，我建议你继续从“行为特征、现场证据、和任务主题的关系”三个方向整理观察。`;

  updateState((state) => ({
    ...state,
    identifyRecords: state.identifyRecords.map((item) =>
      item.id !== recordId
        ? item
        : {
            ...item,
            conversation: [
              ...item.conversation,
              { id: `${recordId}_user_${Date.now()}`, role: 'user', content: userPrompt },
              { id: `${recordId}_assistant_${Date.now()}`, role: 'assistant', content: assistantReply },
            ],
          },
    ),
  }));

  return assistantReply;
}

export function savePendingForward(payload: DeviceForwardTarget | null) {
  updateState((state) => ({
    ...state,
    pendingForward: payload,
  }));
}

export function getPendingForward() {
  return getDeviceMediaLibrarySnapshot().pendingForward;
}

export function clearPendingForward() {
  savePendingForward(null);
}

export function usePendingForward() {
  const { pendingForward } = useDeviceMediaLibrary();
  return pendingForward;
}
