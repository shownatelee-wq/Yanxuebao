'use client';

import { Button, Result, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { exitTeamGroup, joinTeamGroup, useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../lib/watch-ui';

export default function DeviceTeamGroupsScopedPage() {
  const params = useParams<{ teamId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到团队" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  const canOperate = team.membershipStatus === '已加入';

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="小组" subtitle={canOperate ? '先看所有小组，再加入或退出当前小组。' : '当前团队只开放小组信息查看。'} />
      <WatchSection title="小组列表">
        <div className="device-mini-list">
          {detail.groups.map((group) => (
            <div key={group.id} className="device-mini-item">
              <Link href={`/team/${team.id}/groups/${group.id}`} className="device-card-link">
                <div className="device-mini-item-title">
                  <span>{group.displayName}</span>
                  <Space size={6}>
                    <Tag color="blue">{group.members.length} 人</Tag>
                    {group.joined ? <Tag color="green">当前小组</Tag> : null}
                  </Space>
                </div>
                <p className="device-mini-item-desc">{group.topic}</p>
              </Link>
              {canOperate ? (
                <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                  {group.joined ? (
                    <Button
                      size="small"
                      onClick={() => {
                        exitTeamGroup(team.id, group.id);
                        messageApi.success(`已退出 ${group.displayName}`);
                      }}
                    >
                      退出小组
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        joinTeamGroup(team.id, group.id);
                        messageApi.success(`已加入 ${group.displayName}`);
                      }}
                    >
                      加入小组
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </WatchSection>

      <div className="device-action-row">
        <Link href={`/team/${team.id}`}>
          <Button block>团队详情</Button>
        </Link>
      </div>
    </div>
  );
}
