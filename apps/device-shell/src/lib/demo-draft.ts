'use client';

const DRAFT_STORAGE_KEY = 'yanxuebao_device_demo_draft';

export type DemoDraft = {
  type: 'text' | 'image' | 'audio' | 'video';
  title: string;
  content: string;
  source: 'ask' | 'flash-note' | 'identify' | 'capture';
  updatedAt: string;
};

export function getDemoDraft() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as DemoDraft) : null;
}

export function saveDemoDraft(draft: DemoDraft) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearDemoDraft() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
}
