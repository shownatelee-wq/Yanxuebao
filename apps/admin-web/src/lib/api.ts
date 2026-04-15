'use client';

export const ADMIN_STORAGE_KEY = 'yanxuebao_admin_session';

export type WebSession = {
  accessToken: string;
  refreshToken: string;
  role: string;
  user: {
    id: string;
    account: string;
    displayName: string;
    role: string;
  };
};

export function getApiBaseUrl() {
  return `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'}/api`;
}

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(ADMIN_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as WebSession) : null;
}

export function storeSession(session: WebSession) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
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

async function refreshSession(current: WebSession) {
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
    throw new Error('登录已失效，请重新登录');
  }

  const nextSession = (await response.json()) as WebSession;
  storeSession(nextSession);
  return nextSession;
}

export async function apiFetch<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
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
