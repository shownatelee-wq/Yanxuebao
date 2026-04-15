'use client';

import { useEffect, useMemo, useState } from 'react';
import { demoCourses, type DemoCourse } from './device-demo-data';

const DEVICE_COURSE_STATE_KEY = 'yanxuebao_device_course_state';
const DEVICE_COURSE_EVENT = 'yanxuebao:device-course-change';
const DEVICE_COURSE_STATE_VERSION = 1;

type DeviceCourseState = {
  version: number;
  courses: DemoCourse[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildInitialState(): DeviceCourseState {
  return {
    version: DEVICE_COURSE_STATE_VERSION,
    courses: clone(demoCourses),
  };
}

function readState(): DeviceCourseState {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_COURSE_STATE_KEY);
  if (!raw) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_COURSE_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = JSON.parse(raw) as DeviceCourseState;
  if (parsed.version !== DEVICE_COURSE_STATE_VERSION) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_COURSE_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  return parsed;
}

function writeState(nextState: DeviceCourseState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(DEVICE_COURSE_STATE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event(DEVICE_COURSE_EVENT));
}

function updateState(updater: (state: DeviceCourseState) => DeviceCourseState) {
  const nextState = updater(readState());
  writeState(nextState);
  return nextState;
}

export function getCourseState() {
  return clone(readState());
}

export function useCourseState() {
  const [state, setState] = useState<DeviceCourseState>(() => getCourseState());

  useEffect(() => {
    function sync() {
      setState(getCourseState());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_COURSE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_COURSE_EVENT, sync);
    };
  }, []);

  return state;
}

export function getPurchasedCourses(state: DeviceCourseState = readState()) {
  return state.courses.filter((course) => course.purchased);
}

export function getCourseById(courseId: string, state: DeviceCourseState = readState()) {
  return state.courses.find((item) => item.id === courseId) ?? null;
}

export function getLatestResumableCourse(state: DeviceCourseState = readState()) {
  return [...getPurchasedCourses(state)].sort((left, right) => right.progress - left.progress)[0] ?? null;
}

export function toggleCourseFavorite(courseId: string) {
  return updateState((state) => ({
    ...state,
    courses: state.courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            favorite: !course.favorite,
          }
        : course,
    ),
  })).courses.find((course) => course.id === courseId);
}

export function shareCourse(courseId: string) {
  return updateState((state) => ({
    ...state,
    courses: state.courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            shared: true,
          }
        : course,
    ),
  })).courses.find((course) => course.id === courseId);
}

export function continueCourse(courseId: string) {
  return updateState((state) => ({
    ...state,
    courses: state.courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            progress: Math.min(100, course.progress + (course.type === '难题挑战' ? 18 : 12)),
          }
        : course,
    ),
  })).courses.find((course) => course.id === courseId);
}

export function addCourseNote(courseId: string) {
  return updateState((state) => ({
    ...state,
    courses: state.courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            notes: [
              {
                id: `${course.id}_note_${course.notes.length + 1}`,
                title: `${course.title} 闪记 ${course.notes.length + 1}`,
                createdAt: '刚刚',
                linkedChapterTitle: course.chapters.find((chapter) => chapter.progress > 0)?.title ?? course.chapters[0]?.title ?? '当前章节',
                linkedPositionLabel: course.lastPositionLabel,
                content: `已在 ${course.lastPositionLabel} 记录一条新的课程闪记，方便后续复习和整理作品。`,
              },
              ...course.notes,
            ],
          }
        : course,
    ),
  })).courses.find((course) => course.id === courseId);
}

export function useFilteredPurchasedCourses(filter: 'all' | '视频' | '音频' | '难题挑战') {
  const state = useCourseState();

  return useMemo(() => {
    const purchased = getPurchasedCourses(state);
    return filter === 'all' ? purchased : purchased.filter((course) => course.type === filter);
  }, [filter, state]);
}
