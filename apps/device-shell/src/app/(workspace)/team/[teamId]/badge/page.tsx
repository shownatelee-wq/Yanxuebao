'use client';

import { Button, Input, Result, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getTeamBadges, updateTeamGroupProfile, useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../lib/watch-ui';

export default function DeviceTeamBadgeScopedPage() {
  const params = useParams<{ teamId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;
  const currentGroup = detail?.groups.find((group) => group.id === detail.myGroupId);
  const currentMember = currentGroup?.members.find((member) => member.isCurrentStudent);
  const canManage = Boolean(currentMember?.canManageGroupProfile);
  const badgeOptions = useMemo(() => getTeamBadges(params.teamId), [params.teamId, detail?.badge]);
  const [groupName, setGroupName] = useState(currentGroup?.name ?? detail?.groupName ?? '');

  if (!team || !detail) {
    return <Result status="404" title="未找到团队" extra={<Link href="/team"><Button>团队列表</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero
        title="队名队徽"
        subtitle={canManage ? '组长或副组长可以修改队名和队徽。' : '当前仅支持查看小组名称和徽章。'}
        tags={[{ label: detail.groupName }, { label: detail.badge, color: 'cyan' }]}
      />

      <WatchSection title="小组名称">
        <Input value={groupName} onChange={(event) => setGroupName(event.target.value)} maxLength={10} disabled={!canManage} />
        {canManage && currentGroup ? (
          <div className="device-action-chip-row" style={{ marginTop: 10 }}>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                updateTeamGroupProfile(team.id, currentGroup.id, {
                  name: groupName.trim() || currentGroup.name,
                  badgeTitle: currentGroup.badgeTitle,
                  badgeEmoji: currentGroup.badgeEmoji,
                });
                messageApi.success(`已保存队名：${groupName.trim() || currentGroup.name}`);
              }}
            >
              保存名称
            </Button>
          </div>
        ) : null}
      </WatchSection>

      <WatchSection title="小组徽章">
        <div className="device-mini-list">
          {badgeOptions.map((badge) => (
            <div key={badge.id} className="device-mini-item">
              <div className="device-mini-item-title">
                <span>{badge.emoji} {badge.title}</span>
                {badge.active ? <Tag color="green">当前徽章</Tag> : <Tag color="blue">可选择</Tag>}
              </div>
              {canManage && currentGroup && !badge.active ? (
                <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      updateTeamGroupProfile(team.id, currentGroup.id, {
                        name: groupName.trim() || currentGroup.name,
                        badgeTitle: badge.title,
                        badgeEmoji: badge.emoji,
                      });
                      messageApi.success(`已切换为${badge.title}`);
                    }}
                  >
                    设为徽章
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </WatchSection>

      <div className="device-action-row">
        <Link href={`/team/${team.id}/handbook`}>
          <Button type="primary" block>研学手册</Button>
        </Link>
        <Link href={`/team/${team.id}`}>
          <Button block>团队详情</Button>
        </Link>
      </div>
    </div>
  );
}
