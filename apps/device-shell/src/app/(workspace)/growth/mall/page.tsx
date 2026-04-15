'use client';

import { Space, Tag } from 'antd';
import Link from 'next/link';
import { getMallItems, useGrowthState } from '../../../../lib/device-growth-data';
import { WatchActionButtons, WatchHero, WatchSection } from '../../../../lib/watch-ui';

export default function DeviceGrowthMallPage() {
  const state = useGrowthState();
  const mallItems = getMallItems(state);

  return (
    <div className="device-page-stack">
      <WatchHero title="成长商城" subtitle="使用成长值兑换皮肤、道具、课程、优惠券和品牌体验商品。">
        <Space>
          <Tag color="blue">可用成长值 {state.growthValueSummary.available}</Tag>
        </Space>
      </WatchHero>
      <WatchSection title="奖励商品">
        <div className="device-mini-list">
          {mallItems.map((item) => (
            <Link key={item.id} href={`/growth/mall/${item.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{item.title}</span>
                  <Space size={6}>
                    <Tag color="cyan">{item.type}</Tag>
                    <Tag color={item.status === '可兑换' ? 'green' : 'default'}>{item.status}</Tag>
                  </Space>
                </div>
                <p className="device-mini-item-desc">需要 {item.cost} 成长值 · {item.exchangeNote}</p>
              </div>
            </Link>
          ))}
        </div>
      </WatchSection>
      <WatchActionButtons primary={{ label: '成长值', path: '/growth/value' }} secondary={{ label: '成长', path: '/growth' }} />
    </div>
  );
}
