'use client';

import { useEffect, useState } from 'react';
import { formatDeviceDisplayTime, normalizeDeviceTimeValue } from './device-time';

export type FlashNoteType = 'voice_note' | 'video_note';
export type FlashNoteStatus = 'draft' | 'saved' | 'synced';

export type FlashNotePhoto = {
  id: string;
  title: string;
  url?: string;
};

export type FlashNoteSourceContext = {
  source: 'flash-note-app' | 'task';
  taskId?: string;
  taskSheetId?: string;
  fieldId?: string;
};

export type FlashNoteItem = {
  id: string;
  title: string;
  type: FlashNoteType;
  status: FlashNoteStatus;
  createdAt: string;
  createdAtValue: string;
  duration: string;
  transcript?: string;
  audio?: { url?: string; duration?: string; title?: string };
  video?: { url?: string; duration?: string; title?: string; coverImage?: string };
  photos?: FlashNotePhoto[];
  sourceContext?: FlashNoteSourceContext;
};

type LegacyFlashNote = Partial<FlashNoteItem> & {
  content?: string;
  kind?: 'text' | 'voice' | 'photo' | 'video' | 'mixed';
  videos?: Array<{ title: string; duration?: string; url?: string }>;
};

export type FlashNoteInput = {
  id?: string;
  title?: string;
  type: FlashNoteType;
  status?: FlashNoteStatus;
  duration?: string;
  transcript?: string;
  audio?: FlashNoteItem['audio'];
  video?: FlashNoteItem['video'];
  photos?: FlashNotePhoto[];
  sourceContext?: FlashNoteSourceContext;
};

const FLASH_NOTE_KEY = 'yanxuebao_device_flash_notes';
const FLASH_NOTE_EVENT = 'yanxuebao:flash-note-change';

const defaultNotes: FlashNoteItem[] = [
  {
    id: 'flash_note_voice_01',
    title: '海豚表演观察闪记',
    type: 'voice_note',
    status: 'saved',
    createdAt: formatDeviceDisplayTime(new Date().toISOString()),
    createdAtValue: new Date().toISOString(),
    duration: '00:18',
    transcript: '海豚表演前会先绕场一圈，像在熟悉环境，我还看到饲养员提前做了手势提示。',
    audio: { title: '海豚表演口述', duration: '00:18', url: '/mock/flash-note-audio.mp3' },
    photos: [
      { id: 'flash-photo-01', title: '海豚绕场照片', url: '/mock/dolphin-photo.jpg' },
      { id: 'flash-photo-02', title: '表演台观察照片', url: '/mock/task-photo.jpg' },
    ],
    sourceContext: { source: 'flash-note-app' },
  },
  {
    id: 'flash_note_video_01',
    title: '海狮互动视频闪记',
    type: 'video_note',
    status: 'saved',
    createdAt: formatDeviceDisplayTime(new Date().toISOString()),
    createdAtValue: new Date().toISOString(),
    duration: '00:24',
    transcript: '记录了海狮跟随口令完成动作的关键片段。',
    video: { title: '海狮互动视频', duration: '00:24', url: '/mock/explain-video.mp4', coverImage: '/mock/task-photo.jpg' },
    sourceContext: { source: 'flash-note-app' },
  },
];

function padTime(value: number) {
  return String(value).padStart(2, '0');
}

function normalizeDuration(value?: string) {
  if (!value) {
    return '00:12';
  }

  const parts = value.split(':').map((item) => Number(item));
  if (parts.length === 2 && parts.every((item) => Number.isFinite(item))) {
    return `${padTime(parts[0] ?? 0)}:${padTime(parts[1] ?? 0)}`;
  }

  if (parts.length === 3 && parts.every((item) => Number.isFinite(item))) {
    return `${padTime(parts[0] ?? 0)}:${padTime(parts[1] ?? 0)}:${padTime(parts[2] ?? 0)}`;
  }

  return '00:12';
}

function normalizeFlashNote(item: LegacyFlashNote, index: number): FlashNoteItem {
  const type: FlashNoteType =
    item.type ??
    (item.kind === 'video' || item.video || item.videos?.length ? 'video_note' : 'voice_note');
  const transcript = item.transcript ?? item.content ?? '';
  const video = item.video ?? item.videos?.[0];

  return {
    id: item.id ?? `flash_note_fallback_${index}`,
    title: item.title ?? (transcript.slice(0, 12) || `闪记 ${index + 1}`),
    type,
    status: item.status ?? 'saved',
    createdAt: item.createdAt ? formatDeviceDisplayTime(normalizeDeviceTimeValue(item.createdAt)) : formatDeviceDisplayTime(new Date().toISOString()),
    createdAtValue: item.createdAt ? normalizeDeviceTimeValue(item.createdAt) : new Date().toISOString(),
    duration: normalizeDuration(item.duration ?? item.audio?.duration ?? video?.duration),
    transcript,
    audio: type === 'voice_note' ? item.audio : undefined,
    video: type === 'video_note' && video
      ? {
          title: video.title,
          duration: normalizeDuration(video.duration),
          url: video.url,
          coverImage: item.video?.coverImage,
        }
      : undefined,
    photos: (item.photos ?? []).map((photo, photoIndex) => ({
      id: photo.id ?? `${item.id ?? `flash_note_fallback_${index}`}-photo-${photoIndex}`,
      title: photo.title,
      url: photo.url,
    })),
    sourceContext: item.sourceContext ?? { source: 'flash-note-app' },
  };
}

function persistFlashNotes(notes: FlashNoteItem[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(FLASH_NOTE_KEY, JSON.stringify(notes));
  window.dispatchEvent(new Event(FLASH_NOTE_EVENT));
}

export function getFlashNotes(): FlashNoteItem[] {
  if (typeof window === 'undefined') {
    return defaultNotes;
  }

  const raw = window.localStorage.getItem(FLASH_NOTE_KEY);
  if (!raw) {
    persistFlashNotes(defaultNotes);
    return defaultNotes;
  }

  try {
    const normalized = (JSON.parse(raw) as LegacyFlashNote[]).map(normalizeFlashNote);
    persistFlashNotes(normalized);
    return normalized;
  } catch {
    persistFlashNotes(defaultNotes);
    return defaultNotes;
  }
}

export function getFlashNoteTypeLabel(note: FlashNoteItem) {
  return note.type === 'voice_note' ? '语音闪记' : '视频闪记';
}

export function getFlashNoteSummary(note: FlashNoteItem) {
  if (note.transcript?.trim()) {
    return note.transcript.trim();
  }
  return note.type === 'voice_note' ? '已录制语音闪记，待补充转写文字。' : '已录制视频闪记，可用于作品证明。';
}

export function getFlashNoteMeta(note: FlashNoteItem) {
  const meta = [getFlashNoteTypeLabel(note), note.duration];
  if (note.type === 'voice_note' && note.photos?.length) {
    meta.push(`${note.photos.length}张照片`);
  }
  if (note.type === 'video_note') {
    meta.push('1段视频');
  }
  return meta;
}

export function saveFlashNote(input: FlashNoteInput) {
  const next: FlashNoteItem = {
    id: input.id ?? `flash_note_${Date.now()}`,
    title: input.title ?? (input.transcript?.slice(0, 12) || (input.type === 'voice_note' ? '语音闪记' : '视频闪记')),
    type: input.type,
    status: input.status ?? 'saved',
    createdAt: formatDeviceDisplayTime(new Date().toISOString()),
    createdAtValue: new Date().toISOString(),
    duration: normalizeDuration(input.duration ?? input.audio?.duration ?? input.video?.duration),
    transcript: input.transcript?.trim() || undefined,
    audio: input.type === 'voice_note' ? input.audio : undefined,
    video: input.type === 'video_note' ? input.video : undefined,
    photos: input.type === 'voice_note' ? (input.photos ?? []) : [],
    sourceContext: input.sourceContext,
  };

  if (typeof window === 'undefined') {
    return next;
  }

  const notes = getFlashNotes();
  persistFlashNotes([next, ...notes.filter((item) => item.id !== next.id)].slice(0, 20));
  return next;
}

export function updateFlashNote(
  id: string,
  input: {
    title?: string;
    transcript?: string;
    duration?: string;
    status?: FlashNoteStatus;
    audio?: FlashNoteItem['audio'];
    video?: FlashNoteItem['video'];
    photos?: FlashNotePhoto[];
  },
) {
  if (typeof window === 'undefined') {
    return null;
  }

  const notes = getFlashNotes();
  const next = notes.map((item) =>
        item.id === id
          ? {
              ...item,
              title: input.title?.trim() || item.title,
              transcript: input.transcript?.trim() ?? item.transcript,
              duration: input.duration ? normalizeDuration(input.duration) : item.duration,
              status: input.status ?? item.status,
              audio: input.audio ?? item.audio,
              video: input.video ?? item.video,
              photos: input.photos ?? item.photos,
              createdAt: formatDeviceDisplayTime(new Date().toISOString()),
              createdAtValue: new Date().toISOString(),
            }
          : item,
  );
  persistFlashNotes(next);
  return next.find((item) => item.id === id) ?? null;
}

export function getFlashNoteById(id: string) {
  return getFlashNotes().find((item) => item.id === id) ?? null;
}

export function createDraftFlashNote(input: FlashNoteInput) {
  return saveFlashNote({
    ...input,
    status: input.status ?? 'draft',
  });
}

export function deleteFlashNote(id: string) {
  if (typeof window === 'undefined') {
    return;
  }

  persistFlashNotes(getFlashNotes().filter((item) => item.id !== id));
}

export function useFlashNotes() {
  const [notes, setNotes] = useState<FlashNoteItem[]>(() => getFlashNotes());

  useEffect(() => {
    function sync() {
      setNotes(getFlashNotes());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(FLASH_NOTE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(FLASH_NOTE_EVENT, sync);
    };
  }, []);

  return notes;
}
