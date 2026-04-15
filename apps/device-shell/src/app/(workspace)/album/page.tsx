'use client';

import { PlayCircleOutlined } from '@ant-design/icons';
import { Space, Tag } from 'antd';
import { useCaptureAssets } from '../../../lib/device-capture-share';

export default function DeviceAlbumPage() {
  const assets = useCaptureAssets();

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <p className="device-page-title">相册</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">照片 {assets.filter((item) => item.type === '照片').length}</span>
              <span className="watch-status-pill">视频 {assets.filter((item) => item.type === '视频').length}</span>
            </div>
          </Space>
        </div>

        <div className="device-compact-card">
          <p className="device-section-label">图片与视频</p>
          <div className="device-album-grid">
            {assets.map((item) => (
              <div key={item.id} className={`device-album-tile accent-${item.accent ?? 'blue'}`}>
                <div className="device-album-thumb">
                  {item.type === '视频' ? <PlayCircleOutlined /> : null}
                  {item.primaryLabel ? <span className="device-album-badge">{item.primaryLabel}</span> : null}
                  <span>{item.previewLabel ?? item.title}</span>
                </div>
                <div className="device-mini-item-title" style={{ marginTop: 8 }}>
                  <span>{item.title}</span>
                  <Tag color={item.type === '视频' ? 'purple' : 'green'}>{item.type}</Tag>
                </div>
                {item.recognizedNames?.length ? (
                  <div className="watch-status-pills" style={{ marginTop: 8 }}>
                    {item.recognizedNames.slice(0, 2).map((name) => (
                      <span key={name} className="watch-status-pill">{name}</span>
                    ))}
                  </div>
                ) : null}
                <p className="device-mini-item-desc">{item.capturedAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
