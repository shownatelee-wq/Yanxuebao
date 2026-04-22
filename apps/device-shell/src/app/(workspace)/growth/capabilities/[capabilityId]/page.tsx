'use client';

import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCapabilityById, getCapabilityLevelColor, useGrowthState } from '../../../../../lib/device-growth-data';
import { DeviceGrowthSourceBreakdown, DeviceRadarCard } from '../../../../../lib/device-growth-ui';

export default function DeviceCapabilityDetailPage() {
  const params = useParams<{ capabilityId: string }>();
  const state = useGrowthState();
  const capability = getCapabilityById(params.capabilityId, state);

  if (!capability) {
    return <Result status="404" title="未找到能力项" extra={<Link href="/growth"><Button>成长</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <p className="device-page-title">{capability.elementKey}</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{capability.planeTitle}</span>
              <span className="watch-status-pill">{capability.score.toFixed(1)} 分</span>
              <span className="watch-status-pill" style={{ color: getCapabilityLevelColor(capability.level) }}>{capability.level}</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>当前指数</span>
                <Tag color="blue">{capability.score.toFixed(1)}</Tag>
              </div>
              <p className="device-mini-item-desc">同龄平均 {capability.averageScore.toFixed(1)} · 最近更新 {capability.recordedAt}</p>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>最近来源</span>
                <Tag color="cyan">{capability.source}</Tag>
              </div>
              <p className="device-mini-item-desc">该能力指标的当前指数会根据最近来源持续更新。</p>
            </div>
            <DeviceGrowthSourceBreakdown level={capability.level} items={capability.sourceBreakdown} />
          </div>
        </div>

        <DeviceRadarCard
          title={`${capability.elementKey}指标能力图`}
          labels={capability.indicatorDimensions.map((item) => item.label)}
          primaryValues={capability.indicatorDimensions.map((item) => item.score)}
          compareValues={capability.indicatorDimensions.map((item) => item.average)}
        />

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href="/growth/index">
              <Button type="primary" block>能力雷达</Button>
            </Link>
            <Link href="/growth/self-test">
              <Button block>能力自测</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
