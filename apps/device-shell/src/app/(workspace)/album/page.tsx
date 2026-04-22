'use client';

import { PlayCircleFilled, SearchOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useDeviceMediaLibrary, type DeviceAlbumTab } from '../../../lib/device-media-library';

const tabLabels: Record<DeviceAlbumTab, string> = {
  photo: '照片',
  video: '视频',
  screenshot: '截图',
};

function toTab(value: string | null): DeviceAlbumTab {
  if (value === 'video' || value === 'screenshot' || value === 'photo') {
    return value;
  }
  return 'photo';
}

export default function DeviceAlbumPage() {
  const searchParams = useSearchParams();
  const { assets } = useDeviceMediaLibrary();
  const [activeTab, setActiveTab] = useState<DeviceAlbumTab>(toTab(searchParams.get('tab')));
  const filteredAssets = useMemo(
    () => assets.filter((item) => item.albumTab === activeTab),
    [activeTab, assets],
  );

  return (
    <div className="device-page-stack">
      <div className="device-photos-app">
        <div className="device-photos-hero">
          <div>
            <p className="device-photos-title">相册</p>
            <p className="device-photos-count">{filteredAssets.length} Items</p>
          </div>
          <button type="button" className="device-photos-search">
            <SearchOutlined />
            搜索
          </button>
        </div>

        <Segmented
          block
          className="device-photos-tabs"
          value={activeTab}
          onChange={(value) => setActiveTab(value as DeviceAlbumTab)}
          options={[
            { label: '照片', value: 'photo' },
            { label: '视频', value: 'video' },
            { label: '截图', value: 'screenshot' },
          ]}
        />

        <div className="device-photo-wall">
          {filteredAssets.map((item, index) => (
            <Link
              key={item.id}
              href={`/album/${item.id}`}
              className={`device-photo-wall-tile tone-${index % 6} ${index % 7 === 0 ? 'wide' : ''}`}
            >
              {item.albumTab === 'video' ? <PlayCircleFilled /> : null}
              <span>{item.previewLabel ?? item.primaryLabel ?? item.title}</span>
            </Link>
          ))}
          {!filteredAssets.length ? <p className="device-mini-item-desc">暂无{tabLabels[activeTab]}。</p> : null}
        </div>

        <div className="device-photo-days">
          <div className="device-photo-days-head">
            <strong>最近几天</strong>
            <span>›</span>
          </div>
          <div className="device-photo-day-strip">
            {['今天', '昨天'].map((day, dayIndex) => {
              const dayAssets = filteredAssets.filter((item) => (day === '昨天' ? item.createdAt.startsWith('昨天') : !item.createdAt.startsWith('昨天')));
              if (!dayAssets.length) {
                return null;
              }
              return (
                <Link key={day} href={`/album/${dayAssets[0].id}`} className={`device-photo-day-card tone-${dayIndex + 2}`}>
                  <strong>{day}</strong>
                  <div>
                    {dayAssets.slice(0, 3).map((item, index) => (
                      <span key={item.id} className={`tone-${(index + dayIndex) % 6}`} />
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
