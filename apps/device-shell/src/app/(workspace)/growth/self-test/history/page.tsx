'use client';

import Link from 'next/link';
import { Space, Tag } from 'antd';
import { getSelfTestHistoryItems, useGrowthState } from '../../../../../lib/device-growth-data';
import { WatchActionButtons, WatchHero, WatchSection } from '../../../../../lib/watch-ui';

export default function DeviceGrowthSelfTestHistoryPage() {
  const state = useGrowthState();
  const history = getSelfTestHistoryItems(state);

  return (
    <div className="device-page-stack">
      <WatchHero title="自测历史" subtitle="查看最近完成过的学员自测报告。" />
      <WatchSection title="报告列表">
        <div className="device-mini-list">
          {history.map((item) => (
            <Link key={item.id} href={`/growth/self-test/history/${item.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{item.reportType}</span>
                  <Space size={6}>
                    <Tag color="blue">{item.totalScore.toFixed(1)} 分</Tag>
                    <Tag color="green">{item.testedAt}</Tag>
                  </Space>
                </div>
                <p className="device-mini-item-desc">{item.planeTitle} · {item.elementCount} 个能力元素 · {item.element}</p>
              </div>
            </Link>
          ))}
        </div>
      </WatchSection>
      <WatchActionButtons primary={{ label: '能力自测', path: '/growth/self-test' }} secondary={{ label: '成长', path: '/growth' }} />
    </div>
  );
}
