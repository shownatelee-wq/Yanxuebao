'use client';

import { Button, Input, Result, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getTeamBadges, updateTeamGroupProfile, useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../lib/watch-ui';

export default function DeviceTeamBadgeScopedPage() {
  const params = useParams<{ teamId: string }>();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;
  const groupId = searchParams.get('groupId') ?? detail?.myGroupId;
  const currentGroup = detail?.groups.find((group) => group.id === groupId);
  const currentMember = currentGroup?.members.find((member) => member.isCurrentStudent);
  const canManage = Boolean(currentMember?.canManageGroupProfile);
  const badgeOptions = useMemo(
    () =>
      getTeamBadges(params.teamId).map((badge) => ({
        ...badge,
        active: badge.title === currentGroup?.badgeTitle,
      })),
    [params.teamId, currentGroup?.badgeTitle],
  );
  const [groupName, setGroupName] = useState(currentGroup?.customName ?? currentGroup?.name ?? detail?.groupName ?? '');

  useEffect(() => {
    setGroupName(currentGroup?.customName ?? currentGroup?.name ?? detail?.groupName ?? '');
  }, [currentGroup?.customName, currentGroup?.name, detail?.groupName]);

  if (!team || !detail) {
    return <Result status="404" title="未找到团队" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero
        title="队名队徽"
        subtitle={canManage ? '组长或副组长可以修改队名和小组徽章。' : '当前仅支持查看小组名称和徽章。'}
        tags={[{ label: currentGroup?.displayName ?? detail.groupName }, { label: currentGroup?.badgeTitle ?? detail.badge, color: 'cyan' }]}
      />

      <WatchSection title="小组名称">
        <p className="device-mini-item-desc" style={{ marginBottom: 8 }}>
          展示规则固定为“{currentGroup?.serialNo ?? 1}组：自定义名称”
        </p>
        <Input value={groupName} onChange={(event) => setGroupName(event.target.value)} maxLength={10} disabled={!canManage} />
        {canManage && currentGroup ? (
          <div className="device-action-chip-row" style={{ marginTop: 10 }}>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                updateTeamGroupProfile(team.id, currentGroup.id, {
                  customName: groupName.trim() || currentGroup.customName || currentGroup.name,
                  badgeTitle: currentGroup.badgeTitle,
                  badgeEmoji: currentGroup.badgeEmoji,
                  badgeImage: currentGroup.badgeImage,
                });
                messageApi.success(`已保存队名：${currentGroup.serialNo}组：${groupName.trim() || currentGroup.name}`);
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
                        customName: groupName.trim() || currentGroup.customName || currentGroup.name,
                        badgeTitle: badge.title,
                        badgeEmoji: badge.emoji,
                        badgeImage: `${badge.id}.png`,
                      });
                      messageApi.success(`已切换为${badge.title}`);
                    }}
                  >
                    设为勋章
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </WatchSection>

      <div className="device-action-row">
        {currentGroup ? (
          <Link href={`/team/${team.id}/badge/upload?groupId=${currentGroup.id}&mode=photo`}>
            <Button type="primary" block>上传徽章</Button>
          </Link>
        ) : null}
        {currentGroup ? (
          <Link href={`/team/${team.id}/badge/upload?groupId=${currentGroup.id}&mode=ai`}>
            <Button block>AI创建勋章</Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
