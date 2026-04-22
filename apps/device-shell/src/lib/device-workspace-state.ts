'use client';

import { useEffect, useState } from 'react';
import { demoCloudFiles, demoMeetings } from './device-demo-data';

const DEVICE_WORKSPACE_STATE_KEY = 'yanxuebao_device_workspace_state_v2';
const DEVICE_WORKSPACE_STATE_EVENT = 'yanxuebao:device-workspace-state-change';

export type DeviceMeeting = {
  id: string;
  title: string;
  status: '进行中' | '待开始' | '已结束';
  startedAt: string;
  participants: string[];
  summary: string;
  shareLink: string;
};

export type DeviceCloudFile = {
  id: string;
  categoryId: string;
  title: string;
  size: string;
  updatedAt: string;
  type: '图片' | '视频' | '音频' | '文档';
  source: '夸克网盘' | '百度网盘' | '本地上传';
  preview: string;
  duration?: string;
  downloaded?: boolean;
};

export type DeviceIdentityProfile = {
  studentName: string;
  yxbId: string;
  mobile: string;
  deviceId: string;
  parentName: string;
  parentBound: boolean;
};

type DeviceWorkspaceState = {
  meetings: DeviceMeeting[];
  cloudFiles: DeviceCloudFile[];
};

export const deviceIdentityProfile: DeviceIdentityProfile = {
  studentName: '小明同学',
  yxbId: '80001',
  mobile: '13800000001',
  deviceId: 'YXB-DEV-0001',
  parentName: '妈妈',
  parentBound: true,
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildInitialState(): DeviceWorkspaceState {
  return {
    meetings: demoMeetings.map((meeting) => ({
      ...meeting,
      shareLink: `https://demo.yanxuebao.local/meeting/${meeting.id}`,
    })),
    cloudFiles: demoCloudFiles.map((file) => ({
      ...file,
      duration: file.type === '视频' ? '00:15' : file.type === '音频' ? '00:18' : undefined,
      downloaded: false,
    })),
  };
}

function readState(): DeviceWorkspaceState {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_WORKSPACE_STATE_KEY);
  if (!raw) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_WORKSPACE_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  return JSON.parse(raw) as DeviceWorkspaceState;
}

function writeState(nextState: DeviceWorkspaceState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(DEVICE_WORKSPACE_STATE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event(DEVICE_WORKSPACE_STATE_EVENT));
}

function updateState(updater: (state: DeviceWorkspaceState) => DeviceWorkspaceState) {
  const nextState = updater(readState());
  writeState(nextState);
  return nextState;
}

export function getDeviceWorkspaceSnapshot() {
  return clone(readState());
}

export function useDeviceWorkspaceSnapshot() {
  const [snapshot, setSnapshot] = useState<DeviceWorkspaceState>(() => getDeviceWorkspaceSnapshot());

  useEffect(() => {
    function sync() {
      setSnapshot(getDeviceWorkspaceSnapshot());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_WORKSPACE_STATE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_WORKSPACE_STATE_EVENT, sync);
    };
  }, []);

  return snapshot;
}

export function createMeeting(input: { title: string; participants: string[] }) {
  const meeting: DeviceMeeting = {
    id: `meeting_${Date.now()}`,
    title: input.title || '新会议',
    status: '待开始',
    startedAt: '刚刚',
    participants: input.participants.length ? input.participants : ['我'],
    summary: '会议刚创建，开始后会自动生成本地 mock 纪要。',
    shareLink: `https://demo.yanxuebao.local/meeting/new-${Date.now()}`,
  };

  updateState((state) => ({
    ...state,
    meetings: [meeting, ...state.meetings],
  }));

  return meeting;
}

export function getMeetingById(meetingId: string) {
  return getDeviceWorkspaceSnapshot().meetings.find((item) => item.id === meetingId) ?? null;
}

export function uploadMeetingSummaryToCloud(meetingId: string) {
  const meeting = getMeetingById(meetingId);
  if (!meeting) {
    return null;
  }

  const file: DeviceCloudFile = {
    id: `cloud_meeting_${meetingId}_${Date.now()}`,
    categoryId: 'cloud_doc',
    title: `${meeting.title} 会议纪要`,
    size: '168 KB',
    updatedAt: '刚刚',
    type: '文档',
    source: '本地上传',
    preview: `${meeting.summary} · 已从会议纪要页上传到网盘。`,
  };

  updateState((state) => ({
    ...state,
    cloudFiles: [file, ...state.cloudFiles],
  }));

  return file;
}

export function uploadLocalCloudFile(input: {
  title: string;
  type: DeviceCloudFile['type'];
  categoryId: string;
  preview: string;
}) {
  const file: DeviceCloudFile = {
    id: `cloud_local_${Date.now()}`,
    categoryId: input.categoryId,
    title: input.title,
    size: input.type === '视频' ? '16.5 MB' : input.type === '音频' ? '720 KB' : '1.2 MB',
    updatedAt: '刚刚',
    type: input.type,
    source: '本地上传',
    preview: input.preview,
    duration: input.type === '视频' ? '00:18' : input.type === '音频' ? '00:12' : undefined,
    downloaded: false,
  };

  updateState((state) => ({
    ...state,
    cloudFiles: [file, ...state.cloudFiles],
  }));

  return file;
}

export function markCloudFileDownloaded(fileId: string) {
  updateState((state) => ({
    ...state,
    cloudFiles: state.cloudFiles.map((file) => (file.id === fileId ? { ...file, downloaded: true } : file)),
  }));
}
