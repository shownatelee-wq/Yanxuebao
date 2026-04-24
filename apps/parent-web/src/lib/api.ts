'use client';

export const PARENT_STORAGE_KEY = 'yanxuebao_parent_session';

export type ParentSession = {
  user: {
    id: string;
    account: string;
    displayName: string;
    role: 'parent';
    familyName: string;
  };
  loginAt: string;
};

export const PARENT_LOGIN_DEFAULTS = {
  account: 'parent_demo',
  password: 'Yanxuebao@2026',
};

const ACCEPTED_ACCOUNTS = new Map<string, ParentSession['user']>([
  [
    'parent_demo',
    {
      id: 'parent_demo',
      account: 'parent_demo',
      displayName: '演示家长',
      role: 'parent',
      familyName: '林一诺家庭',
    },
  ],
]);

export function authenticateParent(account: string, password: string) {
  const normalizedAccount = account.trim();
  const user = ACCEPTED_ACCOUNTS.get(normalizedAccount);

  if (!user || password !== PARENT_LOGIN_DEFAULTS.password) {
    throw new Error('账号或密码不正确');
  }

  return {
    user,
    loginAt: new Date().toISOString(),
  } satisfies ParentSession;
}

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(PARENT_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ParentSession) : null;
}

export function storeSession(session: ParentSession) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(PARENT_STORAGE_KEY, JSON.stringify(session));
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(PARENT_STORAGE_KEY);
  }
}
