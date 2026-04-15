'use client';

import type { DeviceMode } from '@yanxuebao/types';

export const DEVICE_STORAGE_KEY = 'yanxuebao_device_session';
export const DEVICE_LOGIN_MODE_KEY = 'yanxuebao_device_login_mode';
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

const MOCK_STUDENT_NAME = '小明';

function normalizeDemoDisplayName(name?: string) {
  return name === '张三' ? MOCK_STUDENT_NAME : name;
}

function buildMockSession(mode: DeviceLoginMode): DeviceSession {
  return {
    accessToken: 'device-demo-access-token',
    refreshToken: 'device-demo-refresh-token',
    role: 'student',
    user: {
      id: 'device-user-demo',
      account: mode === 'sale' ? 'device_sale_demo' : 'device_rental_demo',
      displayName: MOCK_STUDENT_NAME,
      role: 'student',
      studentId: 'student_demo_01',
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
    window.dispatchEvent(new Event(DEVICE_SESSION_EVENT));
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(DEVICE_STORAGE_KEY);
    window.dispatchEvent(new Event(DEVICE_SESSION_EVENT));
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
