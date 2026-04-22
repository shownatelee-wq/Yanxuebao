'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  demoCapabilities,
  demoGrowthMallItems,
  demoGrowthRecords,
  demoGrowthRules,
  demoGrowthValueSummary,
  demoSelfTestHistory,
  type DemoCapability,
  type DemoCapabilityLevel,
  type DemoCapabilityOverview,
  type DemoCapabilityPlaneSummary,
  type DemoGrowthMallItem,
  type DemoGrowthRecord,
  type DemoGrowthRule,
  type DemoGrowthValueSummary,
  type DemoSelfTestHistory,
  type DemoSelfTestReport,
  type DemoSelfTestSessionResult,
} from './device-demo-data';

const DEVICE_GROWTH_STATE_KEY = 'yanxuebao_device_growth_state';
const DEVICE_GROWTH_EVENT = 'yanxuebao:device-growth-change';
const DEVICE_GROWTH_STATE_VERSION = 3;

type DeviceGrowthState = {
  version: number;
  capabilities: DemoCapability[];
  growthRecords: DemoGrowthRecord[];
  growthValueSummary: DemoGrowthValueSummary;
  mallItems: DemoGrowthMallItem[];
  selfTestReports: DemoSelfTestReport[];
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getCapabilityLevel(score: number): DemoCapabilityLevel {
  if (score >= 9) {
    return '优秀';
  }
  if (score >= 8) {
    return '良好';
  }
  if (score >= 6) {
    return '待提升';
  }
  return '待改进';
}

export function getCapabilityLevelColor(level: DemoCapabilityLevel) {
  if (level === '优秀') {
    return '#20bf6b';
  }
  if (level === '良好') {
    return '#2f6bff';
  }
  if (level === '待提升') {
    return '#f5a623';
  }
  return '#ff6b6b';
}

function normalizeCapability(capability: DemoCapability): DemoCapability {
  return {
    ...capability,
    score: round1(capability.score),
    averageScore: round1(capability.averageScore),
    level: getCapabilityLevel(capability.score),
  };
}

function historyToReport(history: DemoSelfTestHistory): DemoSelfTestReport {
  return {
    id: history.id,
    reportType: history.reportType,
    planeId: history.planeKey === 'all' ? 'all' : `plane_${history.planeKey}`,
    planeTitle: history.planeTitle,
    totalScore: history.totalScore,
    completedAt: history.testedAt,
    elementCount: history.elementCount,
    rows: [
      {
        elementKey: history.element,
        score: history.score,
        latestIndex: history.latestIndex,
        average: history.average,
      },
    ],
  };
}

function buildInitialState(): DeviceGrowthState {
  return {
    version: DEVICE_GROWTH_STATE_VERSION,
    capabilities: demoCapabilities.map(normalizeCapability),
    growthRecords: clone(demoGrowthRecords),
    growthValueSummary: clone(demoGrowthValueSummary),
    mallItems: clone(demoGrowthMallItems),
    selfTestReports: demoSelfTestHistory.map(historyToReport),
  };
}

function readState(): DeviceGrowthState {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }

  const raw = window.sessionStorage.getItem(DEVICE_GROWTH_STATE_KEY);
  if (!raw) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_GROWTH_STATE_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = JSON.parse(raw) as DeviceGrowthState;
  if (parsed.version !== DEVICE_GROWTH_STATE_VERSION || !parsed.capabilities[0]?.indicatorDimensions?.length) {
    const initial = buildInitialState();
    window.sessionStorage.setItem(DEVICE_GROWTH_STATE_KEY, JSON.stringify(initial));
    return initial;
  }
  return {
    ...parsed,
    capabilities: parsed.capabilities.map(normalizeCapability),
  };
}

function writeState(nextState: DeviceGrowthState) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized: DeviceGrowthState = {
    ...nextState,
    capabilities: nextState.capabilities.map(normalizeCapability),
  };
  window.sessionStorage.setItem(DEVICE_GROWTH_STATE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(DEVICE_GROWTH_EVENT));
}

export function getGrowthState() {
  return clone(readState());
}

export function useGrowthState() {
  const [state, setState] = useState<DeviceGrowthState>(() => getGrowthState());

  useEffect(() => {
    function sync() {
      setState(getGrowthState());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_GROWTH_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_GROWTH_EVENT, sync);
    };
  }, []);

  return state;
}

export function getGrowthOverview(state: DeviceGrowthState = readState()) {
  const currentIndex = round1(
    state.capabilities.reduce((total, item) => total + item.score, 0) / (state.capabilities.length || 1),
  );
  const currentLevel = getCapabilityLevel(currentIndex);
  const planes = getCapabilityPlaneSummaries(state);
  const strongest = [...state.capabilities].sort((left, right) => right.score - left.score).slice(0, 6);
  const weakest = [...state.capabilities].sort((left, right) => left.score - right.score).slice(0, 6);
  const latestSelfTest = [...state.selfTestReports].sort((left, right) => (left.completedAt < right.completedAt ? 1 : -1))[0] ?? null;
  const latestGrowthRecord = [...state.growthRecords].sort((left, right) => (left.occurredAt < right.occurredAt ? 1 : -1))[0] ?? null;

  return {
    currentIndex,
    currentLevel,
    availableGrowthValue: state.growthValueSummary.available,
    latestSelfTest,
    latestGrowthRecord,
    overview: {
      currentIndex,
      currentLevel,
      planes,
      strongest,
      weakest,
    } satisfies DemoCapabilityOverview,
  };
}

export function getCapabilityPlaneSummaries(state: DeviceGrowthState = readState()): DemoCapabilityPlaneSummary[] {
  const order: Array<DemoCapabilityPlaneSummary['planeKey']> = ['self', 'learning', 'future', 'social'];
  return order.map((planeKey) => {
    const items = state.capabilities.filter((item) => item.planeKey === planeKey);
    return {
      planeKey,
      planeTitle: items[0]?.planeTitle ?? '',
      score: round1(items.reduce((total, item) => total + item.score, 0) / (items.length || 1)),
      averageScore: round1(items.reduce((total, item) => total + item.averageScore, 0) / (items.length || 1)),
    };
  });
}

export function getCapabilityById(capabilityId: string, state: DeviceGrowthState = readState()) {
  return state.capabilities.find((item) => item.id === capabilityId) ?? null;
}

export function getSelfTestReports(state: DeviceGrowthState = readState()) {
  return [...state.selfTestReports].sort((left, right) => (left.completedAt < right.completedAt ? 1 : -1));
}

export function getSelfTestHistoryItems(state: DeviceGrowthState = readState()): DemoSelfTestHistory[] {
  return getSelfTestReports(state).map((report) => ({
    id: report.id,
    reportType: report.reportType,
    planeTitle: report.planeTitle,
    planeKey:
      report.planeId === 'all'
        ? 'all'
        : report.planeId === 'plane_self'
          ? 'self'
          : report.planeId === 'plane_learning'
            ? 'learning'
            : report.planeId === 'plane_social'
              ? 'social'
              : 'future',
    element: report.rows.map((row) => row.elementKey).join(' / '),
    score: report.totalScore,
    latestIndex: round1(report.rows.reduce((total, row) => total + row.latestIndex, 0) / (report.rows.length || 1)),
    average: round1(report.rows.reduce((total, row) => total + row.average, 0) / (report.rows.length || 1)),
    totalScore: report.totalScore,
    elementCount: report.elementCount,
    testedAt: report.completedAt,
  }));
}

export function getSelfTestReportById(reportId: string, state: DeviceGrowthState = readState()) {
  return getSelfTestReports(state).find((item) => item.id === reportId) ?? null;
}

export function saveSelfTestSessionResult(result: DemoSelfTestSessionResult) {
  const current = readState();
  const capabilityMap = new Map(current.capabilities.map((item) => [item.elementKey, item]));
  const rows = result.elements.map((entry) => {
    const capability = capabilityMap.get(entry.elementKey);
    const latestIndex = round1(((capability?.score ?? entry.score) * 0.7) + entry.score * 0.3);
    if (capability) {
      capability.score = latestIndex;
      capability.recordedAt = result.completedAt;
      capability.source = 'self_test';
      capability.level = getCapabilityLevel(latestIndex);
    }
    return {
      elementKey: entry.elementKey,
      score: round1(entry.score),
      latestIndex,
      average: entry.average,
    };
  });

  const report: DemoSelfTestReport = {
    id: `self_test_report_${Date.now()}`,
    reportType: '学员自测报告',
    planeId: result.planeId,
    planeTitle: result.planeTitle,
    totalScore: round1(result.totalScore),
    completedAt: result.completedAt,
    elementCount: result.elements.length,
    rows,
  };

  writeState({
    ...current,
    capabilities: [...current.capabilities],
    selfTestReports: [report, ...current.selfTestReports],
  });

  return report;
}

export function getGrowthRulesGrouped(): Array<{ group: DemoGrowthRule['group']; items: DemoGrowthRule[] }> {
  const order: DemoGrowthRule['group'][] = ['研学任务成长值', '专家课程成长值', '日常使用成长值'];
  return order.map((group) => ({
    group,
    items: demoGrowthRules.filter((item) => item.group === group),
  }));
}

export function getGrowthValueRecords(state: DeviceGrowthState = readState()) {
  return [...state.growthRecords].sort((left, right) => (left.occurredAt < right.occurredAt ? 1 : -1));
}

export function getGrowthRecordById(recordId: string, state: DeviceGrowthState = readState()) {
  return state.growthRecords.find((item) => item.id === recordId) ?? null;
}

export function getMallItems(state: DeviceGrowthState = readState()) {
  return [...state.mallItems];
}

export function getMallItemById(itemId: string, state: DeviceGrowthState = readState()) {
  return state.mallItems.find((item) => item.id === itemId) ?? null;
}

export function redeemGrowthMallItem(itemId: string) {
  const current = readState();
  const item = current.mallItems.find((entry) => entry.id === itemId);
  if (!item) {
    return { ok: false as const, reason: 'not_found' as const };
  }
  if (item.status === '已兑换') {
    return { ok: false as const, reason: 'redeemed' as const };
  }
  if (current.growthValueSummary.available < item.cost) {
    return { ok: false as const, reason: 'insufficient' as const };
  }

  item.status = '已兑换';
  current.growthValueSummary.available -= item.cost;
  current.growthValueSummary.used += item.cost;
  writeState(current);
  return { ok: true as const, item: clone(item), summary: clone(current.growthValueSummary) };
}

export function useGrowthOverview() {
  const state = useGrowthState();
  return useMemo(() => getGrowthOverview(state), [state]);
}
