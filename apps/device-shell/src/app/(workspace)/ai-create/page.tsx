'use client';

import Link from 'next/link';
import { demoAlbumItems } from '../../../lib/device-demo-data';
import { WatchHero, WatchSection, WatchActionButtons, WatchNextSteps } from '../../../lib/watch-ui';

export default function DeviceAiCreatePage() {
  return (
    <div className="device-page-stack">
      <WatchHero title="AI 创作" subtitle="在这里选择 AI 绘画或 AI 视频。" />
      <WatchSection title="创作入口">
        <div className="device-plaza-grid">
          <Link href="/ai-draw" className="device-plaza-tile">
            <strong style={{ fontSize: 12 }}>AI 绘画</strong>
            <span className="device-mini-item-desc">提示词 + 图片生成海报</span>
          </Link>
          <Link href="/ai-video" className="device-plaza-tile">
            <strong style={{ fontSize: 12 }}>AI 视频</strong>
            <span className="device-mini-item-desc">从图片生成 15 秒视频</span>
          </Link>
        </div>
      </WatchSection>
      <WatchSection title="最近素材">
        <div className="device-mini-list">
          {demoAlbumItems.slice(0, 2).map((item) => (
            <div key={item.id} className="device-mini-item">
              <div className="device-mini-item-title">
                <span>{item.title}</span>
                <span>{item.type}</span>
              </div>
              <p className="device-mini-item-desc">{item.capturedAt}</p>
            </div>
          ))}
        </div>
      </WatchSection>
      <WatchNextSteps text="先选绘画或视频，再把新素材保存到相册或任务作品。" />
      <WatchActionButtons primary={{ label: 'AI 绘画', path: '/ai-draw' }} secondary={{ label: 'AI 视频', path: '/ai-video' }} />
    </div>
  );
}
