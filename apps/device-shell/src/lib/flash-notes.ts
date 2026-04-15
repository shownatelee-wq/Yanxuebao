'use client';

export type FlashNoteItem = {
  id: string;
  content: string;
  createdAt: string;
};

const FLASH_NOTE_KEY = 'yanxuebao_device_flash_notes';

const defaultNotes: FlashNoteItem[] = [
  {
    id: 'flash_note_01',
    content: '海豚表演前会先绕场一圈，像在熟悉环境。',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'flash_note_02',
    content: '饲养员通过手势与哨音控制节奏。',
    createdAt: new Date().toISOString(),
  },
];

export function getFlashNotes(): FlashNoteItem[] {
  if (typeof window === 'undefined') {
    return defaultNotes;
  }

  const raw = window.localStorage.getItem(FLASH_NOTE_KEY);
  if (!raw) {
    window.localStorage.setItem(FLASH_NOTE_KEY, JSON.stringify(defaultNotes));
    return defaultNotes;
  }

  try {
    return JSON.parse(raw) as FlashNoteItem[];
  } catch {
    window.localStorage.setItem(FLASH_NOTE_KEY, JSON.stringify(defaultNotes));
    return defaultNotes;
  }
}

export function saveFlashNote(content: string) {
  const next: FlashNoteItem = {
    id: `flash_note_${Date.now()}`,
    content,
    createdAt: new Date().toISOString(),
  };

  if (typeof window === 'undefined') {
    return next;
  }

  const notes = getFlashNotes();
  window.localStorage.setItem(FLASH_NOTE_KEY, JSON.stringify([next, ...notes].slice(0, 10)));
  return next;
}

export function updateFlashNote(id: string, content: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  const notes = getFlashNotes();
  const next = notes.map((item) =>
    item.id === id
      ? {
          ...item,
          content,
          createdAt: new Date().toISOString(),
        }
      : item,
  );
  window.localStorage.setItem(FLASH_NOTE_KEY, JSON.stringify(next));
  return next.find((item) => item.id === id) ?? null;
}

export function getFlashNoteById(id: string) {
  return getFlashNotes().find((item) => item.id === id) ?? null;
}
