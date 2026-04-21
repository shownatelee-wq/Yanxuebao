'use client';

export type AdminRole = 'operator' | 'city_maintainer';

export type AdminSession = {
  role: AdminRole;
  user: {
    id: string;
    account: string;
    displayName: string;
    cityIds?: string[];
    organizationScope?: string[];
  };
};

const SESSION_KEY = 'yanxuebao_admin_console_session';

const accounts: Record<
  string,
  {
    password: string;
    session: AdminSession;
  }
> = {
  operator_console: {
    password: 'Yanxuebao@2026',
    session: {
      role: 'operator',
      user: {
        id: 'operator-001',
        account: 'operator_console',
        displayName: '运营总控台',
      },
    },
  },
  city_nanshan: {
    password: 'Yanxuebao@2026',
    session: {
      role: 'city_maintainer',
      user: {
        id: 'maintainer-001',
        account: 'city_nanshan',
        displayName: '南山区数据维护员',
        cityIds: ['深圳市-南山区'],
      },
    },
  },
};

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as AdminSession) : null;
}

export function storeSession(session: AdminSession) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
}

export function loginWithCredentials(account: string, password: string, expectedRole?: AdminRole) {
  const record = accounts[account];
  if (!record || record.password !== password) {
    throw new Error('账号或密码不正确');
  }

  if (expectedRole && record.session.role !== expectedRole) {
    throw new Error(expectedRole === 'operator' ? '请使用运营管理员账号登录' : '请使用兼职维护员账号登录');
  }

  storeSession(record.session);
  return record.session;
}

export function getDefaultCredentials(role: AdminRole) {
  return role === 'operator'
    ? { account: 'operator_console', password: 'Yanxuebao@2026' }
    : { account: 'city_nanshan', password: 'Yanxuebao@2026' };
}

export function getRoleHome(role: AdminRole) {
  return role === 'operator' ? '/dashboard' : '/city-workbench/bases';
}
