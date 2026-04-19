'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  demoPlazaAgents,
  type DemoPlazaAgent,
  type DemoPlazaCategory,
  type DemoPlazaChallenge,
  type DemoPlazaCourse,
  type DemoPlazaNewsItem,
} from './device-demo-data';

const DEVICE_PLAZA_STATE_KEY = 'yanxuebao_device_plaza_state';
const DEVICE_PLAZA_EVENT = 'yanxuebao:device-plaza-change';
const DEVICE_PLAZA_STATE_VERSION = 4;

type DevicePlazaState = {
  version: number;
  agents: DemoPlazaAgent[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildInitialState(): DevicePlazaState {
  return {
    version: DEVICE_PLAZA_STATE_VERSION,
    agents: clone(demoPlazaAgents),
  };
}

function readState(): DevicePlazaState {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_PLAZA_STATE_KEY);
  if (!raw) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_PLAZA_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = JSON.parse(raw) as DevicePlazaState;
  if (parsed.version !== DEVICE_PLAZA_STATE_VERSION) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_PLAZA_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  return parsed;
}

function writeState(nextState: DevicePlazaState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(DEVICE_PLAZA_STATE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event(DEVICE_PLAZA_EVENT));
}

function updateState(updater: (state: DevicePlazaState) => DevicePlazaState) {
  const nextState = updater(readState());
  writeState(nextState);
  return nextState;
}

export function getPlazaState() {
  return clone(readState());
}

export function usePlazaState() {
  const [state, setState] = useState<DevicePlazaState>(() => getPlazaState());

  useEffect(() => {
    function sync() {
      setState(getPlazaState());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_PLAZA_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_PLAZA_EVENT, sync);
    };
  }, []);

  return state;
}

export function getPlazaAgents(state: DevicePlazaState = readState()) {
  return [...state.agents];
}

export function getPlazaAgentById(agentId: string, state: DevicePlazaState = readState()) {
  return state.agents.find((item) => item.id === agentId) ?? null;
}

export function getPlazaCategories(state: DevicePlazaState = readState()) {
  const categoryOrder: DemoPlazaCategory[] = ['科技', '文艺', '健康', '商业', '成长', '创作'];
  return categoryOrder
    .map((category) => {
      const count = state.agents.filter((item) => item.category === category).length;
      return { category, count };
    })
    .filter((item) => item.count > 0);
}

export function getRecentPlazaAgents(state: DevicePlazaState = readState()) {
  return state.agents.filter((item) => item.recent);
}

export function getDesktopPlazaAgents(state: DevicePlazaState = readState()) {
  return state.agents.filter((item) => item.desk);
}

export function markPlazaAgentVisited(agentId: string) {
  updateState((state) => ({
    ...state,
    agents: state.agents.map((item) => (item.id === agentId ? { ...item, recent: true } : item)),
  }));
}

export function togglePlazaAgentDesktop(agentId: string) {
  return updateState((state) => ({
    ...state,
    agents: state.agents.map((item) => (item.id === agentId ? { ...item, desk: !item.desk } : item)),
  })).agents.find((item) => item.id === agentId);
}

export function togglePlazaSubscription(agentId: string) {
  return updateState((state) => ({
    ...state,
    agents: state.agents.map((item) => (item.id === agentId ? { ...item, subscribed: !item.subscribed } : item)),
  })).agents.find((item) => item.id === agentId);
}

export function getPlazaCourse(agentId: string, courseId: string, state: DevicePlazaState = readState()): DemoPlazaCourse | null {
  const agent = getPlazaAgentById(agentId, state);
  return agent?.courses.find((item) => item.id === courseId) ?? null;
}

export function getPlazaNewsItem(agentId: string, newsId: string, state: DevicePlazaState = readState()): DemoPlazaNewsItem | null {
  const agent = getPlazaAgentById(agentId, state);
  return agent?.news.find((item) => item.id === newsId) ?? null;
}

export function getPlazaChallenges(agentId: string, state: DevicePlazaState = readState()): DemoPlazaChallenge[] {
  return getPlazaAgentById(agentId, state)?.challenges ?? [];
}

export function continuePlazaCourse(agentId: string, courseId: string) {
  return updateState((state) => ({
    ...state,
    agents: state.agents.map((agent) =>
      agent.id !== agentId
        ? agent
        : {
            ...agent,
            courses: agent.courses.map((course) =>
              course.id !== courseId
                ? course
                : {
                    ...course,
                    progress: Math.min(100, course.progress + 12),
                  },
            ),
          },
    ),
  })).agents.find((item) => item.id === agentId)?.courses.find((course) => course.id === courseId);
}

export function togglePlazaCourseFavorite(agentId: string, courseId: string) {
  return updateState((state) => ({
    ...state,
    agents: state.agents.map((agent) =>
      agent.id !== agentId
        ? agent
        : {
            ...agent,
            courses: agent.courses.map((course) =>
              course.id !== courseId
                ? course
                : {
                    ...course,
                    favorite: !course.favorite,
                  },
            ),
          },
    ),
  })).agents.find((item) => item.id === agentId)?.courses.find((course) => course.id === courseId);
}

export function sharePlazaCourse(agentId: string, courseId: string) {
  return updateState((state) => ({
    ...state,
    agents: state.agents.map((agent) =>
      agent.id !== agentId
        ? agent
        : {
            ...agent,
            courses: agent.courses.map((course) =>
              course.id !== courseId
                ? course
                : {
                    ...course,
                    shared: true,
                  },
            ),
          },
    ),
  })).agents.find((item) => item.id === agentId)?.courses.find((course) => course.id === courseId);
}

export function addPlazaCourseFlashNote(agentId: string, courseId: string) {
  return updateState((state) => ({
    ...state,
    agents: state.agents.map((agent) =>
      agent.id !== agentId
        ? agent
        : {
            ...agent,
            courses: agent.courses.map((course) =>
              course.id !== courseId
                ? course
                : {
                    ...course,
                    notes: [
                      {
                        id: `${course.id}_note_${course.notes.length + 1}`,
                        title: `${course.title} 闪记 ${course.notes.length + 1}`,
                        content: `已从《${course.title}》记录一条新的闪记，方便后续整理成作品或复习。`,
                        createdAt: '刚刚',
                      },
                      ...course.notes,
                    ],
                  },
            ),
          },
    ),
  })).agents.find((item) => item.id === agentId)?.courses.find((course) => course.id === courseId);
}

export function useFilteredPlazaAgents(category: DemoPlazaCategory | '全部') {
  const state = usePlazaState();

  return useMemo(() => {
    if (category === '全部') {
      return getPlazaAgents(state);
    }
    return getPlazaAgents(state).filter((item) => item.category === category);
  }, [category, state]);
}
