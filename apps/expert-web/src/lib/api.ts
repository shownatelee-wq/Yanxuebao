'use client';

export const EXPERT_SESSION_KEY = 'yanxuebao_expert_h5_session';
export const EXPERT_ACCOUNT_REGISTRY_KEY = 'yanxuebao_expert_h5_accounts';
export const EXPERT_SESSION_EVENT = 'yanxuebao_expert_h5_session_changed';

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

export type ExpertAccountProfile = ExpertSession['user'] & {
  phone: string;
  password: string;
  initializedAt: string;
};

export const EXPERT_LOGIN_DEFAULTS = {
  account: 'expert_partner',
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
]);

const SEEDED_PHONE_ACCOUNTS = new Map<string, ExpertAccountProfile>([
  [
    '13800000000',
    {
      id: 'expert_user_001',
      account: 'expert_partner',
      phone: '13800000000',
      password: EXPERT_LOGIN_DEFAULTS.password,
      displayName: '张知远',
      role: 'expert',
      title: '海洋科学专家',
      organization: '研学宝专家合作中心',
      field: '海洋生态与创新教育',
      initializedAt: '2026-05-01T08:00:00.000Z',
    },
  ],
]);

function readAccountRegistry() {
  if (typeof window === 'undefined') {
    return [] as ExpertAccountProfile[];
  }

  const raw = window.localStorage.getItem(EXPERT_ACCOUNT_REGISTRY_KEY);
  if (!raw) {
    return [] as ExpertAccountProfile[];
  }

  try {
    return JSON.parse(raw) as ExpertAccountProfile[];
  } catch {
    return [] as ExpertAccountProfile[];
  }
}

function writeAccountRegistry(accounts: ExpertAccountProfile[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(EXPERT_ACCOUNT_REGISTRY_KEY, JSON.stringify(accounts));
  }
}

function notifySessionChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EXPERT_SESSION_EVENT));
  }
}

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

export function getExpertAccountByPhone(phone: string) {
  const normalizedPhone = phone.trim();
  const localAccount = readAccountRegistry().find((account) => account.phone === normalizedPhone);
  return localAccount ?? SEEDED_PHONE_ACCOUNTS.get(normalizedPhone) ?? null;
}

export function saveExpertAccount(input: {
  phone: string;
  account: string;
  password: string;
  displayName: string;
}) {
  const timestamp = new Date().toISOString();
  const profile: ExpertAccountProfile = {
    id: `expert_user_${input.phone}`,
    account: input.account.trim() || `expert_${input.phone.slice(-4)}`,
    phone: input.phone,
    password: input.password,
    displayName: input.displayName.trim() || `专家${input.phone.slice(-4)}`,
    role: 'expert',
    title: '待完善专家资料',
    organization: '研学宝专家合作中心',
    field: '待选择专业领域',
    initializedAt: timestamp,
  };
  const accounts = readAccountRegistry().filter((account) => account.phone !== profile.phone);
  writeAccountRegistry([profile, ...accounts]);
  return profile;
}

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(EXPERT_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ExpertSession;
  } catch {
    window.sessionStorage.removeItem(EXPERT_SESSION_KEY);
    return null;
  }
}

export function storeSession(session: ExpertSession) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(EXPERT_SESSION_KEY, JSON.stringify(session));
    notifySessionChanged();
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(EXPERT_SESSION_KEY);
    notifySessionChanged();
  }
}
