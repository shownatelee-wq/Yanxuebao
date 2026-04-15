'use client';

import Link from 'next/link';
import { Space, Tag } from 'antd';
import { getGrowthValueRecords, useGrowthState } from '../../../../../lib/device-growth-data';
import { WatchActionButtons, WatchHero, WatchSection } from '../../../../../lib/watch-ui';

export default function DeviceGrowthValueDetailsPage() {
  const state = useGrowthState();
  const records = getGrowthValueRecords(state);

  return (
    <div className="device-page-stack">
      <WatchHero title="成长值明细" subtitle="按时间倒序查看成长值变化记录。" />
      <WatchSection title="最近明细">
        <div className="device-mini-list">
          {records.map((record) => (
            <Link key={record.id} href={`/growth/records/${record.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{record.title}</span>
                  <Space size={6}>
                    <Tag color="blue">+{record.delta}</Tag>
                    <Tag color="default">{record.occurredAt}</Tag>
                  </Space>
                </div>
                <p className="device-mini-item-desc">{record.displaySource} · {record.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </WatchSection>
      <WatchActionButtons primary={{ label: '规则', path: '/growth/value/rules' }} secondary={{ label: '成长值', path: '/growth/value' }} />
    </div>
  );
}
