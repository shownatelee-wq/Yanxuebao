'use client';

import { Typography } from 'antd';
import Link from 'next/link';
import { demoFlashWorks } from '../../../../lib/device-demo-data';
import { WatchHero, WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceFlashWorksPage() {
  return (
    <div className="device-page-stack">
      <WatchHero title="闪记作品" subtitle="查看语音闪记和视频闪记。" />
      <WatchSection title="作品列表">
        <div className="device-mini-list">
          {demoFlashWorks.map((item) => (
            <Link key={item.id} href="/flash-note" className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{item.title}</span>
                  <span>{item.duration}</span>
                </div>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                  {item.type} · {item.status}
                </Paragraph>
              </div>
            </Link>
          ))}
        </div>
      </WatchSection>
      <WatchNextSteps text="可回看、编辑，也可加入作品。" />
      <WatchActionButtons primary={{ label: '闪记', path: '/flash-note' }} secondary={{ label: '任务', path: '/tasks/new' }} />
    </div>
  );
}
