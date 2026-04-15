'use client';

import { Tag } from 'antd';
import Link from 'next/link';
import { DeviceCapabilityLevelGrid, DeviceCapabilityPlaneCards, DeviceGrowthFrameworkChart, DeviceGrowthSourceBreakdown, DeviceRadarCard, DeviceGrowthStatCard } from '../../../../lib/device-growth-ui';
import { useGrowthOverview, useGrowthState } from '../../../../lib/device-growth-data';
import { WatchActionButtons } from '../../../../lib/watch-ui';

export default function DeviceGrowthIndexPage() {
  const state = useGrowthState();
  const { overview } = useGrowthOverview();
  const planeRadarLabels = overview.planes.map((item) => item.planeTitle);
  const planeRadarMine = overview.planes.map((item) => item.score);
  const planeRadarAverage = overview.planes.map((item) => item.averageScore);

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">能力指数</p>
          <p className="device-page-subtle">能力指数由学员自测、家长评测和研学评价共同生成，并持续动态更新。</p>
          <div className="device-growth-summary-grid" style={{ marginTop: 8 }}>
            <DeviceGrowthStatCard label="当前总指数" value={overview.currentIndex.toFixed(1)} helper="16 项能力指标平均值" />
            <DeviceGrowthStatCard label="当前能力水平" value={overview.currentLevel} tone="green" helper="根据 9/8/6 分阈值分级" />
          </div>
        </div>

        <DeviceCapabilityLevelGrid capabilities={state.capabilities} />
        <DeviceGrowthFrameworkChart capabilities={state.capabilities} />
        <DeviceCapabilityPlaneCards planes={overview.planes} />

        <DeviceRadarCard title="能力平面雷达图" labels={planeRadarLabels} primaryValues={planeRadarMine} compareValues={planeRadarAverage} />
        <DeviceRadarCard
          title="优势能力雷达图"
          labels={overview.strongest.map((item) => item.elementKey)}
          primaryValues={overview.strongest.map((item) => item.score)}
          compareValues={overview.strongest.map((item) => item.averageScore)}
        />
        <DeviceRadarCard
          title="弱势能力雷达图"
          labels={overview.weakest.map((item) => item.elementKey)}
          primaryValues={overview.weakest.map((item) => item.score)}
          compareValues={overview.weakest.map((item) => item.averageScore)}
        />

        <div className="watch-list-panel">
          <div className="device-mini-list">
            <DeviceGrowthSourceBreakdown level={overview.currentLevel} items={state.capabilities[0]?.sourceBreakdown ?? []} />
          </div>
        </div>

        <div className="watch-list-panel">
          <div className="device-page-toolbar">
            <p className="device-section-label" style={{ marginBottom: 0 }}>16 个能力指标</p>
          </div>
          <div className="device-mini-list">
            {state.capabilities.map((item) => (
              <Link key={item.id} href={`/growth/capabilities/${item.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{item.elementKey}</span>
                    <Tag color={item.level === '优秀' ? 'green' : item.level === '良好' ? 'blue' : item.level === '待提升' ? 'gold' : 'red'}>
                      {item.score.toFixed(1)}
                    </Tag>
                  </div>
                  <p className="device-mini-item-desc">{item.planeTitle} · 同龄平均 {item.averageScore.toFixed(1)} · 最近来源 {item.source}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '能力自测', path: '/growth/self-test' }} secondary={{ label: '成长', path: '/growth' }} />
        </div>
      </div>
    </div>
  );
}
