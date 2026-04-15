'use client';

import Link from 'next/link';
import { useGrowthState } from '../../../../lib/device-growth-data';
import { DeviceGrowthStatCard } from '../../../../lib/device-growth-ui';
import { WatchActionButtons, WatchHero, WatchSection } from '../../../../lib/watch-ui';

export default function DeviceGrowthValuePage() {
  const state = useGrowthState();

  return (
    <div className="device-page-stack">
      <WatchHero title="成长值" subtitle="查看累计成长值、可用成长值，以及规则和明细。" />
      <div className="device-growth-summary-grid">
        <DeviceGrowthStatCard label="累计成长值" value={String(state.growthValueSummary.total)} helper="用于记录整体成长总量" />
        <DeviceGrowthStatCard label="可用成长值" value={String(state.growthValueSummary.available)} tone="green" helper="可用于兑换奖励商品" />
      </div>
      <WatchSection title="成长值管理">
        <div className="device-plaza-grid">
          <Link href="/growth/value/rules" className="device-plaza-tile">
            <strong style={{ fontSize: 12 }}>成长值规则</strong>
            <span className="device-mini-item-desc">按 PDF 查看成长值获得口径</span>
          </Link>
          <Link href="/growth/value/details" className="device-plaza-tile">
            <strong style={{ fontSize: 12 }}>成长值明细</strong>
            <span className="device-mini-item-desc">按时间倒序查看每一笔变化</span>
          </Link>
        </div>
      </WatchSection>
      <WatchActionButtons primary={{ label: '成长商城', path: '/growth/mall' }} secondary={{ label: '成长', path: '/growth' }} />
    </div>
  );
}
