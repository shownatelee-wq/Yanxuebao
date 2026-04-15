'use client';

import Link from 'next/link';
import { demoFriends, demoGroupChats, demoMicrochatThreads } from '../../../lib/device-demo-data';
import { WatchHero, WatchSection, WatchActionButtons } from '../../../lib/watch-ui';

export default function DeviceSocialCenterPage() {
  return (
    <div className="device-page-stack">
      <WatchHero
        title="社交中心"
        subtitle="好友、微聊、群聊和会议都在这里。"
        tags={[
          { label: `${demoFriends.length} 位好友`, color: 'blue' },
          { label: `${demoMicrochatThreads.length} 个微聊`, color: 'green' },
          { label: `${demoGroupChats.length} 个群聊`, color: 'purple' },
        ]}
      />
      <WatchSection title="快捷入口">
        <div className="device-plaza-grid">
          <Link href="/friends" className="device-plaza-tile">
            <strong style={{ fontSize: 12 }}>好友</strong>
            <span className="device-mini-item-desc">加好友、看联系人</span>
          </Link>
          <Link href="/microchat" className="device-plaza-tile">
            <strong style={{ fontSize: 12 }}>微聊</strong>
            <span className="device-mini-item-desc">一对一聊天</span>
          </Link>
          <Link href="/group-chat" className="device-plaza-tile">
            <strong style={{ fontSize: 12 }}>群聊</strong>
            <span className="device-mini-item-desc">班级群、小组群</span>
          </Link>
          <Link href="/meeting" className="device-plaza-tile">
            <strong style={{ fontSize: 12 }}>会议</strong>
            <span className="device-mini-item-desc">会议、对讲、纪要</span>
          </Link>
        </div>
      </WatchSection>
      <WatchActionButtons primary={{ label: '好友', path: '/friends' }} secondary={{ label: '广场', path: '/plaza' }} />
    </div>
  );
}
