'use client';

import { Button } from 'antd';
import Link from 'next/link';
import { demoSelfTestPlanes } from '../../../../lib/device-demo-data';
import { WatchActionButtons, WatchHero, WatchNextSteps, WatchSection } from '../../../../lib/watch-ui';

export default function DeviceGrowthSelfTestPage() {
  return (
    <div className="device-page-stack">
      <WatchHero title="能力自测" subtitle="选择一个能力平面进行自测，或直接开始全面测试。" />
      <WatchSection title="选择测试范围">
        <div className="device-mini-list">
          {demoSelfTestPlanes.map((plane) => (
            <Link key={plane.id} href={`/growth/self-test/start?plane=${plane.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{plane.title}</span>
                </div>
                <p className="device-mini-item-desc">{plane.summary} · 随机抽取 1 个能力元素，共 4 道题。</p>
              </div>
            </Link>
          ))}
        </div>
      </WatchSection>
      <WatchSection title="互动聊天测试模式">
        <div className="device-mini-item">
          <div className="device-mini-item-title">
            <span>AI 持续追问</span>
          </div>
          <p className="device-mini-item-desc">
            通过语音或文字和 AI 连续对话，不限制题数，结束后自动生成本地自测报告。
          </p>
          <Link href="/growth/self-test/chat">
            <Button type="primary" block style={{ marginTop: 10 }}>进入聊天测试</Button>
          </Link>
        </div>
      </WatchSection>
      <WatchSection title="快速开始">
        <div className="device-action-row">
          <Link href="/growth/self-test/start?plane=all">
            <Button type="primary" block>全面测试</Button>
          </Link>
          <Link href="/growth/self-test/history">
            <Button block>看历史</Button>
          </Link>
        </div>
      </WatchSection>
      <WatchNextSteps text="单平面测试 4 题，全面测试 16 题。每题限时 60 秒，超时会自动进入下一题。" />
      <WatchActionButtons primary={{ label: '成长', path: '/growth' }} />
    </div>
  );
}
