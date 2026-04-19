'use client';

import type { DeviceMode } from '@yanxuebao/types';

export const DEVICE_STORAGE_KEY = 'yanxuebao_device_session';
export const DEVICE_LOGIN_MODE_KEY = 'yanxuebao_device_login_mode';
export const DEVICE_INITIALIZED_KEY = 'yanxuebao_device_initialized';
export const DEVICE_ACCOUNT_HISTORY_KEY = 'yanxuebao_device_account_history';
export const DEVICE_SESSION_EVENT = 'yanxuebao:device-session-change';

export type DeviceSession = {
  accessToken: string;
  refreshToken: string;
  role: string;
  user: {
    id: string;
    account: string;
    displayName: string;
    role: string;
    studentId?: string;
  };
};

export type DeviceLoginMode = DeviceMode;
export type DeviceInitMode = DeviceLoginMode | 'scan';
export type DeviceAccountHistoryItem = {
  id: string;
  account: string;
  displayName: string;
  role: string;
  studentId?: string;
  gradeLabel: string;
  orgLabel: string;
  avatarTone: 'blue' | 'green' | 'purple' | 'orange';
  lastLoginAt: string;
};

type MockDeviceAccountProfile = DeviceAccountHistoryItem & {
  password: string;
};

const MOCK_STUDENT_NAME = '小明';
const DEFAULT_ACCOUNT_HISTORY_IDS = ['device-account-01', 'device-account-02', 'device-account-03'] as const;
const MOCK_DEVICE_ACCOUNT_PROFILES: MockDeviceAccountProfile[] = [
  {
    id: 'device-account-01',
    account: '13800138000',
    displayName: '小明同学',
    role: 'student',
    studentId: 'student_demo_01',
    gradeLabel: '六年级 1 班',
    orgLabel: '深圳南山实验学校',
    avatarTone: 'blue',
    lastLoginAt: '今天 17:20',
    password: '123456',
  },
  {
    id: 'device-account-02',
    account: '13800138001',
    displayName: '李雨桐',
    role: 'student',
    studentId: 'student_demo_01',
    gradeLabel: '五年级 3 班',
    orgLabel: '深圳海湾小学',
    avatarTone: 'green',
    lastLoginAt: '昨天 18:05',
    password: '123456',
  },
  {
    id: 'device-account-03',
    account: '13800138002',
    displayName: '陈星宇',
    role: 'student',
    studentId: 'student_demo_01',
    gradeLabel: '六年级 2 班',
    orgLabel: '福田实验学校',
    avatarTone: 'purple',
    lastLoginAt: '04-16 19:12',
    password: '123456',
  },
  {
    id: 'device-account-04',
    account: '13800138003',
    displayName: '王可心',
    role: 'student',
    studentId: 'student_demo_01',
    gradeLabel: '四年级 2 班',
    orgLabel: '南山外国语学校',
    avatarTone: 'orange',
    lastLoginAt: '未在本机登录',
    password: '123456',
  },
];

function normalizeDemoDisplayName(name?: string) {
  return name === '张三' ? MOCK_STUDENT_NAME : name;
}

function getMockDeviceAccountProfile(identifier?: string) {
  if (!identifier) {
    return MOCK_DEVICE_ACCOUNT_PROFILES[0];
  }

  return (
    MOCK_DEVICE_ACCOUNT_PROFILES.find(
      (item) => item.id === identifier || item.account === identifier || item.displayName === identifier,
    ) ?? MOCK_DEVICE_ACCOUNT_PROFILES[0]
  );
}

function toHistoryItem(profile: MockDeviceAccountProfile): DeviceAccountHistoryItem {
  return {
    id: profile.id,
    account: profile.account,
    displayName: profile.displayName,
    role: profile.role,
    studentId: profile.studentId,
    gradeLabel: profile.gradeLabel,
    orgLabel: profile.orgLabel,
    avatarTone: profile.avatarTone,
    lastLoginAt: profile.lastLoginAt,
  };
}

function createHistoryItemFromSession(session: DeviceSession): DeviceAccountHistoryItem {
  const matchedProfile = getMockDeviceAccountProfile(session.user.id) ?? getMockDeviceAccountProfile(session.user.account);

  if (matchedProfile) {
    return {
      ...toHistoryItem(matchedProfile),
      account: session.user.account,
      displayName: session.user.displayName,
      role: session.user.role,
      studentId: session.user.studentId,
      lastLoginAt: '当前登录',
    };
  }

  return {
    id: session.user.id,
    account: session.user.account,
    displayName: session.user.displayName,
    role: session.user.role,
    studentId: session.user.studentId,
    gradeLabel: '研学学员',
    orgLabel: '当前设备',
    avatarTone: 'blue',
    lastLoginAt: '当前登录',
  };
}

function storeDeviceAccountHistory(items: DeviceAccountHistoryItem[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DEVICE_ACCOUNT_HISTORY_KEY, JSON.stringify(items));
  }
}

function ensureDeviceAccountHistory() {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCOUNT_HISTORY_IDS.map((id) => toHistoryItem(getMockDeviceAccountProfile(id)));
  }

  const raw = window.localStorage.getItem(DEVICE_ACCOUNT_HISTORY_KEY);
  if (raw) {
    return JSON.parse(raw) as DeviceAccountHistoryItem[];
  }

  const seeded = DEFAULT_ACCOUNT_HISTORY_IDS.map((id) => toHistoryItem(getMockDeviceAccountProfile(id)));
  storeDeviceAccountHistory(seeded);
  return seeded;
}

function upsertDeviceAccountHistory(session: DeviceSession) {
  const currentItem = createHistoryItemFromSession(session);
  const existing = ensureDeviceAccountHistory().filter((item) => item.id !== currentItem.id);
  storeDeviceAccountHistory([currentItem, ...existing]);
}

function getSessionModeFromStorage(): DeviceLoginMode {
  const initMode = getDeviceInitialized();
  if (initMode === 'sale' || initMode === 'rental') {
    return initMode;
  }
  return getStoredLoginMode();
}

function buildMockSession(mode: DeviceLoginMode, accountIdentifier?: string): DeviceSession {
  const profile = getMockDeviceAccountProfile(accountIdentifier);
  return {
    accessToken: `device-demo-access-token-${profile.id}-${mode}`,
    refreshToken: `device-demo-refresh-token-${profile.id}-${mode}`,
    role: 'student',
    user: {
      id: profile.id,
      account: profile.account,
      displayName: profile.displayName,
      role: 'student',
      studentId: profile.studentId,
    },
  };
}

export function getApiBaseUrl() {
  return `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'}/api`;
}

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(DEVICE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw) as DeviceSession;
  const isLegacyDemoSession =
    parsed.user.id === 'device-user-demo' ||
    parsed.user.account === 'device_sale_demo' ||
    parsed.user.account === 'device_rental_demo';

  if (isLegacyDemoSession) {
    const upgradedSession = buildMockSession(getSessionModeFromStorage(), 'device-account-01');
    window.sessionStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(upgradedSession));
    return upgradedSession;
  }

  const normalizedDisplayName = normalizeDemoDisplayName(parsed.user.displayName);

  if (normalizedDisplayName !== parsed.user.displayName) {
    const normalizedSession = {
      ...parsed,
      user: {
        ...parsed.user,
        displayName: normalizedDisplayName ?? MOCK_STUDENT_NAME,
      },
    };
    window.sessionStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(normalizedSession));
    return normalizedSession;
  }

  return parsed;
}

export function storeSession(session: DeviceSession) {
  if (typeof window !== 'undefined') {
    const normalizedSession = {
      ...session,
      user: {
        ...session.user,
        displayName: normalizeDemoDisplayName(session.user.displayName) ?? MOCK_STUDENT_NAME,
      },
    };
    window.sessionStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(normalizedSession));
    upsertDeviceAccountHistory(normalizedSession);
    window.dispatchEvent(new Event(DEVICE_SESSION_EVENT));
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(DEVICE_STORAGE_KEY);
    window.dispatchEvent(new Event(DEVICE_SESSION_EVENT));
  }
}

export function getDeviceInitialized(): DeviceInitMode | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(DEVICE_INITIALIZED_KEY) as DeviceInitMode | null;
}

export function storeDeviceInitialized(mode: DeviceInitMode) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DEVICE_INITIALIZED_KEY, mode);
  }
}

export function clearDeviceInitialized() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(DEVICE_INITIALIZED_KEY);
  }
}

export function getStoredLoginMode(): DeviceLoginMode {
  if (typeof window === 'undefined') {
    return 'rental';
  }

  return (window.localStorage.getItem(DEVICE_LOGIN_MODE_KEY) as DeviceLoginMode | null) ?? 'rental';
}

export function storeLoginMode(mode: DeviceLoginMode) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DEVICE_LOGIN_MODE_KEY, mode);
  }
}

export function getDeviceDataMode() {
  // Device shell is currently a pure front-end demo and should not depend on
  // backend availability for its main experience.
  return 'mock';
}

export function createMockDeviceSession(mode: DeviceLoginMode) {
  return buildMockSession(mode);
}

export function createMockDeviceSessionForAccount(mode: DeviceLoginMode, accountIdentifier: string) {
  return buildMockSession(mode, accountIdentifier);
}

export function getMockStudentAccounts() {
  return MOCK_DEVICE_ACCOUNT_PROFILES.map((item) => ({
    id: item.id,
    account: item.account,
    displayName: item.displayName,
    gradeLabel: item.gradeLabel,
    orgLabel: item.orgLabel,
    avatarTone: item.avatarTone,
  }));
}

export function validateMockStudentAccount(account: string, password: string) {
  return MOCK_DEVICE_ACCOUNT_PROFILES.find((item) => item.account === account && item.password === password) ?? null;
}

export function getStoredDeviceAccountHistory() {
  return ensureDeviceAccountHistory();
}

export function switchStoredDeviceAccount(accountId: string) {
  const nextSession = buildMockSession(getSessionModeFromStorage(), accountId);
  storeSession(nextSession);
  return nextSession;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const raw = await response.text();

    try {
      const parsed = JSON.parse(raw) as { message?: string | string[]; error?: string };
      const normalizedMessage = Array.isArray(parsed.message) ? parsed.message.join('，') : parsed.message;
      throw new Error(normalizedMessage || parsed.error || raw || 'Request failed');
    } catch {
      throw new Error(raw || 'Request failed');
    }
  }

  const payload = (await response.json()) as T | { items: T[] };

  if (
    payload &&
    typeof payload === 'object' &&
    'items' in payload &&
    Array.isArray((payload as { items: unknown[] }).items)
  ) {
    return (payload as { items: T }).items;
  }

  return payload as T;
}

async function refreshSession(current: DeviceSession) {
  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: current.refreshToken,
    }),
  });

  if (!response.ok) {
    clearSession();
    throw new Error('登录已失效，请重新授权');
  }

  const nextSession = (await response.json()) as DeviceSession;
  storeSession(nextSession);
  return nextSession;
}

export async function apiFetch<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  if (getDeviceDataMode() === 'mock') {
    if (path === '/auth/me') {
      return (getStoredSession()?.user ?? buildMockSession('rental').user) as T;
    }

    if (path === '/works' && init?.method === 'POST') {
      return ({ success: true } as unknown) as T;
    }
  }

  const session = getStoredSession();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 401 && session?.refreshToken && !retried) {
    const nextSession = await refreshSession(session);
    return apiFetch<T>(
      path,
      {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${nextSession.accessToken}`,
        },
      },
      true,
    );
  }

  return parseResponse<T>(response);
}

export async function uploadFile<T = { file: { publicUrl: string; originalName: string; mimeType: string } }>(
  file: File,
  extra?: Record<string, string>,
  retried = false,
): Promise<T> {
  if (getDeviceDataMode() === 'mock') {
    return ({
      file: {
        publicUrl: `/mock-upload/${Date.now()}-${file.name}`,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
      },
    } as unknown) as T;
  }

  const session = getStoredSession();
  const formData = new FormData();
  formData.append('file', file);

  Object.entries(extra ?? {}).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch(`${getApiBaseUrl()}/files/upload`, {
    method: 'POST',
    headers: {
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
    body: formData,
  });

  if (response.status === 401 && session?.refreshToken && !retried) {
    await refreshSession(session);
    return uploadFile<T>(file, extra, true);
  }

  return parseResponse<T>(response);
}

export async function fetchWithMode<T>(path: string, mockData: T, init?: RequestInit): Promise<T> {
  if (getDeviceDataMode() === 'mock' && (!init?.method || init.method === 'GET')) {
    return mockData;
  }

  try {
    return await apiFetch<T>(path, init);
  } catch (error) {
    const isReadRequest = !init?.method || init.method === 'GET';
    const message = error instanceof Error ? error.message : String(error);

    if (isReadRequest && /(Insufficient role|Unauthorized|Forbidden|Not Found|404)/i.test(message)) {
      return mockData;
    }

    throw error;
  }
}
