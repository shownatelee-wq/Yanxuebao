'use client';

import { useEffect, useState } from 'react';
import { createGeneratedMediaAsset } from './device-media-library';

const DEVICE_AI_CREATE_STATE_KEY = 'yanxuebao_device_ai_create_state_v1';
const DEVICE_AI_CREATE_STATE_EVENT = 'yanxuebao:device-ai-create-state-change';

export type DeviceAiCreateMode = 'image' | 'video';

export type DeviceAiCreateMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  assetId?: string | null;
  resultAssetId?: string | null;
};

export type DeviceAiCreateSession = {
  id: string;
  mode: DeviceAiCreateMode;
  sourceAssetId: string | null;
  status: 'generating' | 'done';
  pendingPrompt: string | null;
  createdAt: string;
  messages: DeviceAiCreateMessage[];
  resultAssetIds: string[];
};

type DeviceAiCreateState = {
  sessions: DeviceAiCreateSession[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildInitialState(): DeviceAiCreateState {
  return { sessions: [] };
}

function readState(): DeviceAiCreateState {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_AI_CREATE_STATE_KEY);
  if (!raw) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_AI_CREATE_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  return JSON.parse(raw) as DeviceAiCreateState;
}

function writeState(nextState: DeviceAiCreateState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(DEVICE_AI_CREATE_STATE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event(DEVICE_AI_CREATE_STATE_EVENT));
}

function updateState(updater: (state: DeviceAiCreateState) => DeviceAiCreateState) {
  const nextState = updater(readState());
  writeState(nextState);
  return nextState;
}

export function getDeviceAiCreateSnapshot() {
  return clone(readState());
}

export function useDeviceAiCreateSnapshot() {
  const [snapshot, setSnapshot] = useState<DeviceAiCreateState>(() => getDeviceAiCreateSnapshot());

  useEffect(() => {
    function sync() {
      setSnapshot(getDeviceAiCreateSnapshot());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_AI_CREATE_STATE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_AI_CREATE_STATE_EVENT, sync);
    };
  }, []);

  return snapshot;
}

export function getAiCreateSessionById(sessionId: string) {
  return getDeviceAiCreateSnapshot().sessions.find((session) => session.id === sessionId) ?? null;
}

export function createAiCreateSession(input: {
  mode: DeviceAiCreateMode;
  assetId: string;
  prompt: string;
}) {
  const sessionId = `ai_create_session_${Date.now()}`;
  const prompt = input.prompt.trim();
  const modeLabel = input.mode === 'image' ? 'AI生图' : 'AI视频';
  const assetLabel = input.mode === 'image' ? '图片' : '视频';
  const generatingText =
    input.mode === 'image'
      ? `正在根据你上传的图片和提示词生成新图片，请稍等一下。`
      : `正在根据你上传的视频和提示词生成新视频，请稍等一下。`;

  const session: DeviceAiCreateSession = {
    id: sessionId,
    mode: input.mode,
    sourceAssetId: input.assetId,
    status: 'generating',
    pendingPrompt: prompt,
    createdAt: '刚刚',
    resultAssetIds: [],
    messages: [
      {
        id: `${sessionId}_assistant_intro`,
        role: 'assistant',
        content: `${modeLabel}已收到你的${assetLabel}和提示词，我会先理解素材，再为你生成结果。`,
      },
      {
        id: `${sessionId}_user_prompt`,
        role: 'user',
        content: prompt,
        assetId: input.assetId,
      },
      {
        id: `${sessionId}_assistant_generating`,
        role: 'assistant',
        content: generatingText,
      },
    ],
  };

  updateState((state) => ({
    ...state,
    sessions: [session, ...state.sessions.filter((item) => item.id !== session.id)],
  }));

  return session;
}

export function appendAiCreatePrompt(sessionId: string, prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return null;
  }

  const session = getAiCreateSessionById(sessionId);
  if (!session) {
    return null;
  }

  const nextMessages: DeviceAiCreateMessage[] = [
    ...session.messages,
    {
      id: `${sessionId}_user_${Date.now()}`,
      role: 'user',
      content: trimmed,
      assetId: session.sourceAssetId,
    },
    {
      id: `${sessionId}_assistant_${Date.now()}`,
      role: 'assistant',
      content:
        session.mode === 'image'
          ? '收到新的修改要求，我正在继续生成图片。'
          : '收到新的修改要求，我正在继续生成视频。',
    },
  ];

  const nextSession: DeviceAiCreateSession = {
    ...session,
    status: 'generating',
    pendingPrompt: trimmed,
    messages: nextMessages,
  };

  updateState((state) => ({
    ...state,
    sessions: [nextSession, ...state.sessions.filter((item) => item.id !== sessionId)],
  }));

  return nextSession;
}

export function completeAiCreateSession(sessionId: string) {
  const session = getAiCreateSessionById(sessionId);
  if (!session || !session.pendingPrompt) {
    return session;
  }

  const prompt = session.pendingPrompt;
  const sourceLabel = session.mode === 'image' ? 'AI生图' : 'AI视频';
  const { asset } = createGeneratedMediaAsset({
    prompt,
    mode: session.mode,
    sourceApp: 'ai-create',
    sourceLabel,
    linkedEntity: {
      type: 'ai-create',
      id: session.id,
      title: prompt.slice(0, 14) || sourceLabel,
    },
  });

  const nextSession: DeviceAiCreateSession = {
    ...session,
    status: 'done',
    pendingPrompt: null,
    resultAssetIds: [asset.id, ...session.resultAssetIds],
    messages: [
      ...session.messages,
      {
        id: `${session.id}_result_${Date.now()}`,
        role: 'assistant',
        content:
          session.mode === 'image'
            ? '图片已经生成完成，我把结果返回给你了，也同步保存到相册。'
            : '视频已经生成完成，我把结果返回给你了，也同步保存到相册。',
        resultAssetId: asset.id,
      },
    ],
  };

  updateState((state) => ({
    ...state,
    sessions: [nextSession, ...state.sessions.filter((item) => item.id !== sessionId)],
  }));

  return nextSession;
}
