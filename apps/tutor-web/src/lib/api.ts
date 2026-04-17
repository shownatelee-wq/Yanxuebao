'use client';

export const TUTOR_STORAGE_KEY = 'yanxuebao_tutor_session';

export type TutorSession = {
  id: string;
  account: string;
  displayName: string;
  role: 'tutor';
  organizationName: string;
  avatar: string;
};

export const tutorDemoSession: TutorSession = {
  id: 'tutor_demo_user',
  account: 'tutor_demo',
  displayName: '李老师',
  role: 'tutor',
  organizationName: '南山实验学校研学中心',
  avatar:
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80',
};

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(TUTOR_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as TutorSession) : null;
}

export function storeSession(session: TutorSession) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(session));
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(TUTOR_STORAGE_KEY);
  }
}

export async function mockLogin(account: string, password: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (account !== 'tutor_demo' || password !== 'Yanxuebao@2026') {
    throw new Error('账号或密码错误，请使用演示账号登录');
  }

  storeSession(tutorDemoSession);
  return tutorDemoSession;
}
