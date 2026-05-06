'use client';

import '@ant-design/v5-patch-for-react-19';
import { RightOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { getCapabilityLevelColor, type CapabilityElement, type CapabilityLevel, type CapabilitySourceBreakdown } from '../lib/parent-store';

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
}: {
  title: string;
  labels: string[];
  values: number[];
  compareValues: number[];
}) {
  const rings = [0.2, 0.4, 0.6, 0.8, 1];
  const stageRadius = labels.length <= 4 ? 68 : 62;
  const labelRadius = labels.length <= 4 ? 80 : 74;
  return (
    <section className="parent-section parent-radar-card">
      <div className="parent-section-head">
        <strong>{title}</strong>
        <span>我的指数 / 同龄平均</span>
      </div>
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
              我的指数
            </span>
            <span>
              <i className="compare" />
              同龄平均
            </span>
          </div>
        </div>
      </div>
    </section>
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
