'use client';

import '@ant-design/v5-patch-for-react-19';
import { RightOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import type { ReactNode } from 'react';
import {
  getCapabilityLevelColor,
  type CapabilityAdjustmentRecord,
  type CapabilityElement,
  type CapabilityLevel,
  type CapabilitySourceBreakdown,
} from '../lib/parent-store';

function polarPoint(index: number, total: number, radius: number, valueRatio: number) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: 96 + Math.cos(angle) * radius * valueRatio,
    y: 96 + Math.sin(angle) * radius * valueRatio,
  };
}

function buildPolygon(labels: string[], values: number[], radius: number) {
  return labels
    .map((_, index) => {
      const point = polarPoint(index, labels.length, radius, Math.max(0, Math.min(1, values[index] / 10)));
      return `${point.x},${point.y}`;
    })
    .join(' ');
}

function roundRadarValue(value: number) {
  return Math.round(value * 10) / 10;
}

export type CapabilityImprovementRadarItem = {
  elementKey: string;
  beforeIndex: number;
  afterIndex: number;
  assessmentValue?: number;
  delta: number;
  source: 'growth' | 'supplement';
};

export function buildCapabilityImprovementRadarItems(
  capabilities: CapabilityElement[],
  record?: CapabilityAdjustmentRecord | null,
  limit = 6,
): CapabilityImprovementRadarItem[] {
  const capabilityMap = new Map(capabilities.map((capability) => [capability.elementKey, capability]));
  const records = (record?.elementRecords ?? [])
    .map((item) => {
      const beforeIndex = roundRadarValue(item.beforeIndex);
      const afterIndex = roundRadarValue(item.afterIndex);
      return {
        elementKey: item.elementKey,
        beforeIndex,
        afterIndex,
        assessmentValue: roundRadarValue(item.assessmentValue),
        delta: roundRadarValue(afterIndex - beforeIndex),
        source: 'growth' as const,
      };
    })
    .sort((left, right) => right.delta - left.delta || right.afterIndex - left.afterIndex);

  const selected: CapabilityImprovementRadarItem[] = [];
  const selectedKeys = new Set<string>();
  const addItem = (item: CapabilityImprovementRadarItem) => {
    if (selected.length >= limit || selectedKeys.has(item.elementKey)) {
      return;
    }
    selected.push(item);
    selectedKeys.add(item.elementKey);
  };

  records.filter((item) => item.delta > 0).forEach(addItem);

  capabilities
    .filter((capability) => !selectedKeys.has(capability.elementKey))
    .sort((left, right) => right.score - left.score)
    .forEach((capability) => {
      const score = roundRadarValue(capability.score);
      addItem({
        elementKey: capability.elementKey,
        beforeIndex: score,
        afterIndex: score,
        assessmentValue: score,
        delta: 0,
        source: capabilityMap.has(capability.elementKey) ? 'supplement' : 'growth',
      });
    });

  return selected.slice(0, limit);
}

export function getCapabilitySourceLabel(source: CapabilityElement['source']) {
  const labelMap: Record<CapabilityElement['source'], string> = {
    self_test: '学员自测',
    parent_review: '家长评测',
    team_task: '团队任务',
    family_task: '家庭任务',
    teacher_review: '研学评价',
  };
  return labelMap[source];
}

export function getCapabilitySourceDescription(source: CapabilityElement['source']) {
  const descriptionMap: Record<CapabilityElement['source'], string> = {
    self_test: '当前指数最近一次由学员自测结果触发更新，适合结合家长观察交叉判断。',
    parent_review: '当前指数最近一次由家长评测更新，更贴近日常家庭场景下的表现。',
    team_task: '当前指数最近一次由团队研学任务更新，能反映协作与现场完成情况。',
    family_task: '当前指数最近一次由家庭任务评分更新，体现家庭研学中的真实表现。',
    teacher_review: '当前指数最近一次由导师或研学评价更新，适合与同龄平均一起看趋势。',
  };
  return descriptionMap[source];
}

export function formatParentDateTime(value: string) {
  return value.length > 10 ? value.slice(0, 16).replace('T', ' ') : value;
}

export function ParentRadarCard({
  title,
  labels,
  values,
  compareValues,
  valueLabel = '我的指数',
  compareLabel = '同龄平均',
  summary,
  children,
}: {
  title: string;
  labels: string[];
  values: number[];
  compareValues: number[];
  valueLabel?: string;
  compareLabel?: string;
  summary?: string;
  children?: ReactNode;
}) {
  const rings = [0.2, 0.4, 0.6, 0.8, 1];
  const stageRadius = labels.length <= 4 ? 68 : 62;
  const labelRadius = labels.length <= 4 ? 80 : 74;
  return (
    <section className="parent-section parent-radar-card">
      <div className="parent-section-head">
        <strong>{title}</strong>
        <span>{valueLabel} / {compareLabel}</span>
      </div>
      {summary ? <p className="parent-radar-summary">{summary}</p> : null}
      <div className="parent-radar-stage">
        <div className="parent-radar-stage-glow" aria-hidden />
        <div className="parent-radar-wrap">
          <svg viewBox="0 0 192 192" className="parent-radar-svg" aria-hidden>
          {rings.map((ring) => (
            <polygon
              key={ring}
              points={labels
                .map((_, index) => {
                  const point = polarPoint(index, labels.length, stageRadius, ring);
                  return `${point.x},${point.y}`;
                })
                .join(' ')}
              className="parent-radar-ring"
            />
          ))}
          {labels.map((label, index) => {
            const point = polarPoint(index, labels.length, labelRadius, 1);
            return (
              <text key={label} x={point.x} y={point.y} className="parent-radar-label">
                {label.length > 4 ? label.slice(0, 4) : label}
              </text>
            );
          })}
          <polygon points={buildPolygon(labels, compareValues, stageRadius)} className="parent-radar-polygon compare" />
          <polygon points={buildPolygon(labels, values, stageRadius)} className="parent-radar-polygon mine" />
        </svg>
          <div className="parent-radar-legend">
            <span>
              <i className="mine" />
              {valueLabel}
            </span>
            <span>
              <i className="compare" />
              {compareLabel}
            </span>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

export function ParentCapabilityImprovementList({ items }: { items: CapabilityImprovementRadarItem[] }) {
  return (
    <div className="parent-improvement-list">
      {items.map((item, index) => (
        <div key={`${item.elementKey}_${index}`} className="parent-improvement-item">
          <span>{item.elementKey}</span>
          <strong>{item.afterIndex.toFixed(1)}</strong>
          <em className={item.delta > 0 ? 'up' : ''}>
            {item.delta > 0 ? `提升 +${item.delta.toFixed(1)}` : '无变化'}
          </em>
          <small>更新前 {item.beforeIndex.toFixed(1)}</small>
        </div>
      ))}
    </div>
  );
}

function getAdjustmentTone(recordType: CapabilityAdjustmentRecord['recordType']) {
  const toneMap: Record<CapabilityAdjustmentRecord['recordType'], string> = {
    家庭研学: 'study',
    日常任务: 'daily',
    难题挑战: 'challenge',
    家长评测: 'review',
  };
  return toneMap[recordType];
}

export function ParentAssessmentRecordCard({
  record,
  elementRecords,
  onOpenReport,
}: {
  record: CapabilityAdjustmentRecord;
  elementRecords?: CapabilityAdjustmentRecord['elementRecords'];
  onOpenReport?: (record: CapabilityAdjustmentRecord) => void;
}) {
  const records = elementRecords ?? record.elementRecords;
  const canOpenReport = Boolean(record.reportId && onOpenReport);
  return (
    <article className={`parent-assessment-record-card ${getAdjustmentTone(record.recordType)}`}>
      <div className="parent-assessment-record-top">
        <span>{record.recordType}</span>
        <em>{record.sourceType}评测</em>
      </div>
      <button
        type="button"
        className="parent-assessment-report-link"
        disabled={!canOpenReport}
        onClick={() => {
          if (canOpenReport) {
            onOpenReport?.(record);
          }
        }}
      >
        {record.reportTitle}
        {canOpenReport ? <RightOutlined /> : null}
      </button>
      <div className="parent-assessment-record-meta">
        <div>
          <span>研学机构</span>
          <strong>{record.organizationName}</strong>
        </div>
        <div>
          <span>团队/任务</span>
          <strong>{record.teamOrTaskName}</strong>
        </div>
        <div>
          <span>本次评测</span>
          <strong>{formatParentDateTime(record.evaluatedAt)}</strong>
        </div>
        <div>
          <span>评测人</span>
          <strong>{record.evaluator}</strong>
        </div>
      </div>
      <div className="parent-assessment-element-list">
        {records.map((item) => (
          <span key={item.elementKey}>
            {item.elementKey}
            <em>
              {item.beforeIndex.toFixed(1)} → {item.afterIndex.toFixed(1)}
            </em>
          </span>
        ))}
      </div>
    </article>
  );
}

export function ParentGrowthLevelLegend() {
  const items: Array<{ label: string; tone: CapabilityLevel; helper: string }> = [
    { label: '优秀', tone: '优秀', helper: '9.0+' },
    { label: '良好', tone: '良好', helper: '8.0+' },
    { label: '待提升', tone: '待提升', helper: '6.0+' },
    { label: '待改进', tone: '待改进', helper: '<6.0' },
  ];

  return (
    <div className="parent-growth-level-legend">
      {items.map((item) => (
        <span
          key={item.label}
          className="parent-growth-level-pill"
          style={{
            backgroundColor: `${getCapabilityLevelColor(item.tone)}16`,
            color: getCapabilityLevelColor(item.tone),
          }}
        >
          <strong>{item.label}</strong>
          <em>{item.helper}</em>
        </span>
      ))}
    </div>
  );
}

export function ParentGrowthFrameworkChart({
  capabilities,
  onOpenCapability,
}: {
  capabilities: CapabilityElement[];
  onOpenCapability: (capabilityId: string) => void;
}) {
  const planeOrder: Array<CapabilityElement['planeKey']> = ['self', 'learning', 'future', 'social'];
  const planeGroups = planeOrder.map((planeKey) => ({
    planeKey,
    title: capabilities.find((item) => item.planeKey === planeKey)?.planeTitle ?? '',
    items: capabilities.filter((item) => item.planeKey === planeKey),
  }));

  return (
    <section className="parent-section parent-framework-card">
      <div className="parent-section-head">
        <strong>能力框架图</strong>
        <span>点击能力元素查看详情</span>
      </div>
      <ParentGrowthLevelLegend />
      <div className="parent-growth-framework-grid">
        {planeGroups.map((group) => (
          <div key={group.planeKey} className="parent-growth-framework-panel">
            <div className="parent-growth-framework-lines" aria-hidden />
            <div className="parent-growth-framework-nodes">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="parent-growth-framework-node"
                  style={{
                    backgroundColor: `${getCapabilityLevelColor(item.level)}18`,
                    color: getCapabilityLevelColor(item.level),
                  }}
                  onClick={() => onOpenCapability(item.id)}
                >
                  <strong>{item.elementKey}</strong>
                  <span>{item.score.toFixed(1)}</span>
                </button>
              ))}
            </div>
            <div className="parent-growth-framework-label">{group.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ParentCapabilityPlaneOverview({
  planes,
}: {
  planes: Array<{ planeKey: string; planeTitle: string; score: number; averageScore: number }>;
}) {
  return (
    <section className="parent-section">
      <div className="parent-section-head">
        <strong>能力平面概览</strong>
        <span>4 个平面综合观察</span>
      </div>
      <div className="parent-growth-plane-grid">
        {planes.map((plane) => (
          <div key={plane.planeKey} className="parent-growth-plane-card">
            <strong>{plane.planeTitle}</strong>
            <span>我的指数 {plane.score.toFixed(1)}</span>
            <em>同龄平均 {plane.averageScore.toFixed(1)}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ParentGrowthSourceBreakdown({
  level,
  items,
}: {
  level: CapabilityLevel;
  items: CapabilitySourceBreakdown;
}) {
  return (
    <section className="parent-section">
      <div className="parent-source-card">
        <div className="parent-source-card-head">
          <div>
            <strong>指数来源说明</strong>
            <span>能力指数由多种评价共同生成，并会持续动态更新。</span>
          </div>
          <Tag
            color="blue"
            style={{
              marginInlineEnd: 0,
              color: getCapabilityLevelColor(level),
              borderColor: `${getCapabilityLevelColor(level)}55`,
              backgroundColor: `${getCapabilityLevelColor(level)}14`,
            }}
          >
            {level}
          </Tag>
        </div>
        <div className="parent-source-pill-row">
          {items.map((item) => (
            <span key={item.label} className="parent-source-pill">
              <strong>{item.label}</strong>
              <em>{item.value}%</em>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ParentCapabilityList({
  capabilities,
  onOpenCapability,
}: {
  capabilities: CapabilityElement[];
  onOpenCapability: (capabilityId: string) => void;
}) {
  return (
    <section className="parent-section">
      <div className="parent-section-head">
        <strong>16 项能力指标</strong>
        <span>查看单项能力详情</span>
      </div>
      <div className="parent-card-list">
        {capabilities.map((item) => (
          <button key={item.id} type="button" className="parent-capability-card" onClick={() => onOpenCapability(item.id)}>
            <div className="parent-capability-card-main">
              <div className="parent-capability-card-top">
                <strong>{item.elementKey}</strong>
                <Tag
                  color="blue"
                  style={{
                    marginInlineEnd: 0,
                    color: getCapabilityLevelColor(item.level),
                    borderColor: `${getCapabilityLevelColor(item.level)}55`,
                    backgroundColor: `${getCapabilityLevelColor(item.level)}14`,
                  }}
                >
                  {item.score.toFixed(1)}
                </Tag>
              </div>
              <span>
                {item.planeTitle} · 同龄平均 {item.averageScore.toFixed(1)}
              </span>
              <em>最近来源 {getCapabilitySourceLabel(item.source)}</em>
            </div>
            <RightOutlined />
          </button>
        ))}
      </div>
    </section>
  );
}
