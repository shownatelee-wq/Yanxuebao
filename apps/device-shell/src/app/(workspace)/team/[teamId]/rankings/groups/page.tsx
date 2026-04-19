'use client';

import { Space, Tag, Typography, Result, Button } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDeviceTeamSnapshot } from '../../../../../../lib/device-team-data';
import { WatchHero, WatchSection, WatchInfoRow } from '../../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceTeamGroupRankingsScopedPage() {
  const params = useParams<{ teamId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到小组排行" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <WatchHero title="小组排行" subtitle="顶部显示当前所在小组总得分和名次，下方查看所有小组排行。" />
      <WatchSection title="我的小组排行">
        <div className="device-detail-grid">
          <WatchInfoRow label="当前小组" value={detail.groupName} />
          <WatchInfoRow label="小组总得分" value={`${detail.myGroupRank.score} 分`} />
          <WatchInfoRow label="小组名次" value={`第 ${detail.myGroupRank.rank} 名 / ${detail.myGroupRank.total} 组`} />
        </div>
      </WatchSection>
      <WatchSection title="所有小组排行">
        <div className="device-mini-list">
          {detail.groupRankings.map((item, index) => (
            <div key={item.id} className="device-mini-item">
              <div className="device-mini-item-title">
                <span>{index + 1}. {item.name}</span>
                <Space size={6}>
                  <Tag color={item.name === detail.groupName ? 'green' : 'blue'}>{item.score} 分</Tag>
                  <Tag color={item.trend === 'up' ? 'green' : 'default'}>{item.trend === 'up' ? '上升' : '稳定'}</Tag>
                </Space>
              </div>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                小组积分会跟随作品质量、团队评价和协作表现更新。
              </Paragraph>
            </div>
          ))}
        </div>
      </WatchSection>
      <div className="device-action-row">
        <Link href={`/team/${team.id}/rankings/personal`}>
          <Button type="primary" block>看个人排行</Button>
        </Link>
        <Link href={`/team/${team.id}/rankings`}>
          <Button block>返回排行</Button>
        </Link>
      </div>
    </div>
  );
}
