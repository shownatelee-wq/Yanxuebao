'use client';

export const EXPERT_SESSION_KEY = 'yanxuebao_expert_h5_session';

export type ExpertSession = {
  user: {
    id: string;
    account: string;
    displayName: string;
    role: 'expert';
    title: string;
    organization: string;
    field: string;
  };
  loginAt: string;
};

export const EXPERT_LOGIN_DEFAULTS = {
  account: 'expert_demo',
  password: 'Yanxuebao@2026',
};

const ACCEPTED_ACCOUNTS = new Map<string, ExpertSession['user']>([
  [
    'expert_partner',
    {
      id: 'expert_user_001',
      account: 'expert_partner',
      displayName: '张知远',
      role: 'expert',
      title: '海洋科学专家',
      organization: '研学宝专家合作中心',
      field: '海洋生态与创新教育',
    },
  ],
  [
    'expert_demo',
    {
      id: 'expert_user_001',
      account: 'expert_partner',
      displayName: '张知远',
      role: 'expert',
      title: '海洋科学专家',
      organization: '研学宝专家合作中心',
      field: '海洋生态与创新教育',
    },
  ],
]);

export function createExpertSession(user: ExpertSession['user']): ExpertSession {
  return {
    user,
    loginAt: new Date().toISOString(),
  };
}

export function authenticateExpert(account: string, password: string) {
  const normalizedAccount = account.trim();
  const user = ACCEPTED_ACCOUNTS.get(normalizedAccount);

  if (!user || password !== EXPERT_LOGIN_DEFAULTS.password) {
    throw new Error('账号或密码不正确');
  }

  return createExpertSession(user);
}

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(EXPERT_SESSION_KEY);
  return raw ? (JSON.parse(raw) as ExpertSession) : null;
}

export function storeSession(session: ExpertSession) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(EXPERT_SESSION_KEY, JSON.stringify(session));
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(EXPERT_SESSION_KEY);
  }
}
