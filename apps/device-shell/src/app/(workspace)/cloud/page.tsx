'use client';

import { SoundOutlined, VideoCameraOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import Link from 'next/link';
import { demoCloudCategories, demoCloudFiles } from '../../../lib/device-demo-data';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph, Text } = Typography;

const categoryIcons = {
  image: <PictureOutlined />,
  video: <VideoCameraOutlined />,
  audio: <SoundOutlined />,
  document: <FileTextOutlined />,
};

export default function DeviceCloudPage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">网盘</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">{demoCloudCategories.length} 个分类</span>
            <span className="watch-status-pill">{demoCloudFiles.length} 个文件</span>
          </div>
        </div>
        <div className="watch-grid-panel">
          <div className="device-plaza-grid">
            {demoCloudCategories.map((category) => (
              <Link key={category.id} href={`/cloud/category/${category.id}`} className="device-plaza-tile">
                <div style={{ fontSize: 18, color: '#2f6bff' }}>{categoryIcons[category.icon]}</div>
                <Text strong style={{ fontSize: 12 }}>{category.title}</Text>
                <Text type="secondary" style={{ fontSize: 10 }}>{category.count} 个文件</Text>
              </Link>
            ))}
          </div>
        </div>
        <div className="watch-list-panel">
          <div className="device-mini-list">
            {demoCloudFiles.slice(0, 3).map((file) => (
              <Link key={file.id} href={`/cloud/files/${file.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{file.title}</span>
                    <Text type="secondary" style={{ fontSize: 10 }}>{file.type}</Text>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {file.source} · {file.updatedAt}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '相册', path: '/cloud/category/cloud_image' }} secondary={{ label: '广场', path: '/plaza' }} />
        </div>
      </div>
    </div>
  );
}
