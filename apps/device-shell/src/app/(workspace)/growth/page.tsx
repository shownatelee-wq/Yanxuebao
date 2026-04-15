'use client';

import { Space, Tag } from 'antd';
import Link from 'next/link';
import { DeviceGrowthStatCard, DeviceLevelBadge } from '../../../lib/device-growth-ui';
import { useGrowthOverview } from '../../../lib/device-growth-data';

export default function DeviceGrowthPage() {
  const { currentIndex, currentLevel, availableGrowthValue, latestSelfTest, latestGrowthRecord } = useGrowthOverview();

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">成长</p>
              <DeviceLevelBadge level={currentLevel} />
            </Space>
            <p className="device-page-subtle">围绕能力指数、能力自测、成长值和成长商城查看你的成长进度。</p>
            <div className="device-growth-summary-grid">
              <DeviceGrowthStatCard label="当前能力指数" value={currentIndex.toFixed(1)} helper="16 个能力指标平均值" />
              <DeviceGrowthStatCard label="可用成长值" value={String(availableGrowthValue)} tone="green" helper="可用于兑换奖励商品" />
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>最近一次自测</span>
                <Tag color="blue">{latestSelfTest?.planeTitle ?? '暂无'}</Tag>
              </div>
              <p className="device-mini-item-desc">
                {latestSelfTest
                  ? `${latestSelfTest.completedAt} · 总分 ${latestSelfTest.totalScore.toFixed(1)} · ${latestSelfTest.elementCount} 个能力元素`
                  : '完成能力自测后，这里会显示最新报告摘要。'}
              </p>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>最近成长值更新</span>
                <Tag color="green">{latestGrowthRecord ? `+${latestGrowthRecord.delta}` : '暂无'}</Tag>
              </div>
              <p className="device-mini-item-desc">
                {latestGrowthRecord ? `${latestGrowthRecord.displaySource} · ${latestGrowthRecord.summary}` : '最近没有成长值更新。'}
              </p>
            </div>
          </div>
        </div>

        <div className="watch-grid-panel">
          <div className="device-plaza-grid">
            <Link href="/growth/index" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>能力指数</strong>
              <span className="device-mini-item-desc">看能力水平图、雷达图和 16 项能力元素</span>
            </Link>
            <Link href="/growth/self-test" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>能力自测</strong>
              <span className="device-mini-item-desc">选平面或全面测试，生成自测报告</span>
            </Link>
            <Link href="/growth/value" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>成长值</strong>
              <span className="device-mini-item-desc">看累计、可用、规则和明细</span>
            </Link>
            <Link href="/growth/mall" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>成长商城</strong>
              <span className="device-mini-item-desc">兑换皮肤、道具、课程和体验商品</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
