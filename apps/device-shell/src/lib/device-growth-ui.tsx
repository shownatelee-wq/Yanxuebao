'use client';

import { Tag, Typography } from 'antd';
import Link from 'next/link';
import { getCapabilityLevelColor } from './device-growth-data';
import type { DemoCapability, DemoCapabilityLevel, DemoCapabilityPlaneSummary } from './device-demo-data';

const { Paragraph, Text } = Typography;

function polarPoint(index: number, total: number, radius: number, valueRatio: number) {
  const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / total;
  return {
    x: 76 + Math.cos(angle) * radius * valueRatio,
    y: 76 + Math.sin(angle) * radius * valueRatio,
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

function displayCapabilityName(name: string) {
  return name === '跨学科融合' ? '学科融合' : name;
}

function getFrameworkLevel(score: number) {
  if (score >= 9) {
    return 'excellent';
  }
  if (score >= 8) {
    return 'great';
  }
  if (score >= 7) {
    return 'good';
  }
  if (score >= 6) {
    return 'improving';
  }
  return 'risk';
}

export function DeviceRadarCard({
  title,
  labels,
  primaryValues,
  compareValues,
}: {
  title: string;
  labels: string[];
  primaryValues: number[];
  compareValues: number[];
}) {
  const rings = [0.2, 0.4, 0.6, 0.8, 1];
  return (
    <div className="device-compact-card">
      <p className="device-section-label">{title}</p>
      <div className="device-growth-radar">
        <svg viewBox="0 0 152 152" className="device-growth-radar-svg" aria-hidden>
          {rings.map((ring) => (
            <polygon
              key={ring}
              points={labels.map((_, index) => {
                const point = polarPoint(index, labels.length, 54, ring);
                return `${point.x},${point.y}`;
              }).join(' ')}
              className="device-growth-radar-ring"
            />
          ))}
          {labels.map((label, index) => {
            const point = polarPoint(index, labels.length, 62, 1);
            return (
              <text key={label} x={point.x} y={point.y} className="device-growth-radar-label">
                {label}
              </text>
            );
          })}
          <polygon points={buildPolygon(labels, compareValues, 54)} className="device-growth-radar-polygon compare" />
          <polygon points={buildPolygon(labels, primaryValues, 54)} className="device-growth-radar-polygon primary" />
        </svg>
        <div className="device-growth-radar-legend">
          <span><i className="primary" />我的指数</span>
          <span><i className="compare" />同龄平均</span>
        </div>
      </div>
    </div>
  );
}

export function DeviceCapabilityLevelGrid({ capabilities }: { capabilities: DemoCapability[] }) {
  return (
    <div className="device-compact-card">
      <p className="device-section-label">能力水平图</p>
      <div className="device-growth-level-grid">
        {capabilities.map((item) => (
          <div key={item.id} className={`device-growth-level-tile level-${item.level}`}>
            <strong>{item.elementKey}</strong>
            <span>{item.score.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeviceCapabilityPlaneCards({ planes }: { planes: DemoCapabilityPlaneSummary[] }) {
  return (
    <div className="device-compact-card">
      <p className="device-section-label">能力平面概览</p>
      <div className="device-growth-plane-grid">
        {planes.map((plane) => (
          <div key={plane.planeKey} className="device-growth-plane-card">
            <strong>{plane.planeTitle}</strong>
            <span>我的指数 {plane.score.toFixed(1)}</span>
            <span>平均值 {plane.averageScore.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeviceGrowthFrameworkChart({
  capabilities,
}: {
  capabilities: DemoCapability[];
}) {
  const planeOrder: Array<DemoCapability['planeKey']> = ['self', 'learning', 'future', 'social'];
  const planeGroups = planeOrder.map((planeKey) => ({
    planeKey,
    title: capabilities.find((item) => item.planeKey === planeKey)?.planeTitle ?? '',
    items: capabilities.filter((item) => item.planeKey === planeKey),
  }));

  return (
    <div className="device-compact-card">
      <div className="watch-inline-head">
        <p className="device-section-label" style={{ margin: 0 }}>能力框架图</p>
        <span>五色分层</span>
      </div>
      <div className="device-growth-framework-legend">
        <span className="level-excellent">绿色卓越</span>
        <span className="level-great">蓝色优秀</span>
        <span className="level-good">黄色良好</span>
        <span className="level-improving">橙色待提升</span>
        <span className="level-risk">红色待改进</span>
      </div>
      <div className="device-growth-framework-grid">
        {planeGroups.map((group) => (
          <div key={group.planeKey} className="device-growth-framework-panel">
            <div className="device-growth-framework-lines" aria-hidden />
            <div className="device-growth-framework-nodes">
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/growth/capabilities/${item.id}`}
                  className={`device-growth-framework-node level-${getFrameworkLevel(item.score)}`}
                >
                  <span>{displayCapabilityName(item.elementKey)}</span>
                  <em>{item.score.toFixed(1)}</em>
                </Link>
              ))}
            </div>
            <div className="device-growth-framework-label">{group.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeviceCapabilityList({ capabilities }: { capabilities: DemoCapability[] }) {
  return (
    <div className="device-mini-list">
      {capabilities.map((item) => (
        <div key={item.id} className="device-mini-item watch-list-card">
          <div className="device-mini-item-title">
            <span>{displayCapabilityName(item.elementKey)}</span>
            <Tag color={item.level === '优秀' ? 'green' : item.level === '良好' ? 'blue' : item.level === '待提升' ? 'gold' : 'red'}>
              {item.score.toFixed(1)}
            </Tag>
          </div>
          <Paragraph style={{ margin: 0, fontSize: 11 }}>
            {item.planeTitle} · 同龄平均 {item.averageScore.toFixed(1)} · 最近来源 {item.source}
          </Paragraph>
        </div>
      ))}
    </div>
  );
}

export function DeviceGrowthSourceBreakdown({ level, items }: { level: DemoCapabilityLevel; items: Array<{ label: string; value: number }> }) {
  return (
    <div className="device-mini-item watch-list-card">
      <div className="device-mini-item-title">
        <span>指数来源说明</span>
        <Tag color="blue">{level}</Tag>
      </div>
      <div className="watch-status-pills">
        {items.map((item) => (
          <span key={item.label} className="watch-status-pill">{item.label} {item.value}%</span>
        ))}
      </div>
    </div>
  );
}

export function DeviceGrowthStatCard({
  label,
  value,
  tone,
  helper,
}: {
  label: string;
  value: string;
  tone?: 'blue' | 'green' | 'orange' | 'red';
  helper?: string;
}) {
  return (
    <div className={`device-growth-stat-card tone-${tone ?? 'blue'}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <em>{helper}</em> : null}
    </div>
  );
}

export function DeviceLevelBadge({ level }: { level: DemoCapabilityLevel }) {
  return (
    <span className="device-level-badge" style={{ backgroundColor: `${getCapabilityLevelColor(level)}18`, color: getCapabilityLevelColor(level) }}>
      {level}
    </span>
  );
}

export function DeviceSelfTestTable({
  rows,
}: {
  rows: Array<{ elementKey: string; score: number; latestIndex: number; average: number }>;
}) {
  return (
    <div className="device-growth-table">
      {rows.map((row) => (
        <div key={row.elementKey} className="device-growth-table-row">
          <div>
            <Text strong style={{ fontSize: 12 }}>{row.elementKey}</Text>
            <Paragraph style={{ margin: '4px 0 0', fontSize: 11 }}>同龄平均 {row.average.toFixed(1)}</Paragraph>
          </div>
          <div className="device-growth-table-metrics">
            <span>自测 {row.score.toFixed(1)}</span>
            <span>指数 {row.latestIndex.toFixed(1)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
