'use client';

import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDeviceTeamSnapshot } from '../../../../lib/device-team-data';
import { WatchInfoRow } from '../../../../lib/watch-ui';

function toJoinStatusLabel(status: 'joined' | 'joinable' | 'ended') {
  if (status === 'joined') {
    return { text: '已加入', color: 'green' as const };
  }
  if (status === 'joinable') {
    return { text: '可加入', color: 'blue' as const };
  }
  return { text: '已结束', color: 'default' as const };
}

export default function DeviceTeamDetailPage() {
  const params = useParams<{ teamId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到团队" extra={<Link href="/team"><Button>团队列表</Button></Link>} />;
  }

  const joinStatus = toJoinStatusLabel(team.joinStatus);
  const currentGroup = detail.groups.find((group) => group.id === detail.myGroupId);
  const isJoined = team.joinStatus === 'joined';

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space wrap>
              <Tag color={joinStatus.color}>{joinStatus.text}</Tag>
              <Tag color="blue">{team.studyDate}</Tag>
              <Tag color="cyan">{team.destination}</Tag>
            </Space>
            <p className="device-page-title">{team.name}</p>
            <p className="device-page-subtle">{detail.teamSummary}</p>
          </Space>
        </div>

        <div className="device-compact-card">
          <p className="device-section-label">团队基础信息</p>
          <div className="device-detail-grid">
            <WatchInfoRow label="机构" value={team.organizationName ?? '未分配机构'} />
            <WatchInfoRow label="研学时长" value={`${team.days} 天`} />
            <WatchInfoRow label="人数" value={`${team.studentCount} 人`} />
            <WatchInfoRow label="入队方式" value={detail.joinMode} />
          </div>
        </div>

        {isJoined ? (
          <>
            <div className="device-compact-card">
              <p className="device-section-label">我的团队状态</p>
              <div className="device-detail-grid">
                <WatchInfoRow label="当前小组" value={detail.groupName} />
                <WatchInfoRow label="我的岗位" value={detail.myRole} />
                <WatchInfoRow label="队名/徽章" value={`${detail.groupName} · ${detail.badge}`} />
                <WatchInfoRow label="个人排行" value={`第 ${detail.myRank.rank} 名 / ${detail.myRank.total} 人`} />
              </div>
            </div>

            <div className="watch-home-shortcuts">
              <Link href={`/team/${team.id}/groups`} className="device-card-link">
                <div className="watch-shortcut-card">
                  <span>当前小组</span>
                  <p className="device-mini-item-desc" style={{ marginTop: 6 }}>{currentGroup?.name ?? '待分组'}</p>
                </div>
              </Link>
              <Link href={`/team/${team.id}/roles`} className="device-card-link">
                <div className="watch-shortcut-card">
                  <span>我的岗位</span>
                  <p className="device-mini-item-desc" style={{ marginTop: 6 }}>{detail.myRole}</p>
                </div>
              </Link>
              <Link href={`/team/${team.id}/handbook`} className="device-card-link">
                <div className="watch-shortcut-card">
                  <span>研学手册</span>
                  <p className="device-mini-item-desc" style={{ marginTop: 6 }}>{detail.handbookMaterials.length} 份资料</p>
                </div>
              </Link>
            </div>

            <div className="watch-grid-panel">
              <div className="device-plaza-grid">
                <Link href={`/team/${team.id}/groups`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>小组</strong>
                  <span className="device-mini-item-desc">加入或退出小组</span>
                </Link>
                <Link href={`/team/${team.id}/roles`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>岗位</strong>
                  <span className="device-mini-item-desc">查看岗位与成员分工</span>
                </Link>
                <Link href={`/team/${team.id}/badge`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>队名队徽</strong>
                  <span className="device-mini-item-desc">查看或调整小组形象</span>
                </Link>
                <Link href={`/team/${team.id}/handbook`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>研学手册</strong>
                  <span className="device-mini-item-desc">查看图文和 PDF 资料</span>
                </Link>
                <Link href={`/team/${team.id}/rankings`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>团队排行</strong>
                  <span className="device-mini-item-desc">看个人和小组排名</span>
                </Link>
                <Link href={`/team/${team.id}/reviews`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>研学评价</strong>
                  <span className="device-mini-item-desc">完成自评和组内互评</span>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="device-compact-card">
              <p className="device-section-label">团队预览</p>
              <div className="device-detail-grid">
                <WatchInfoRow label="研学手册" value={`${detail.handbookMaterials.length} 份资料`} />
                <WatchInfoRow label="小组数量" value={`${detail.groups.length} 个`} />
                <WatchInfoRow label="是否开放评价" value={detail.reviewConfig.allowSelfReview || detail.reviewConfig.allowPeerReview ? '已开放' : '未开放'} />
                <WatchInfoRow label="授权码" value={team.joinStatus === 'joinable' ? '输入后加入' : '历史团队不可加入'} />
              </div>
            </div>

            <div className="watch-grid-panel">
              <div className="device-plaza-grid">
                <Link href={`/team/${team.id}/handbook`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>研学手册</strong>
                  <span className="device-mini-item-desc">提前查看行程和资料</span>
                </Link>
                <Link href={`/team/${team.id}/rankings`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>团队排行</strong>
                  <span className="device-mini-item-desc">查看历史得分和排名</span>
                </Link>
              </div>
            </div>
          </>
        )}

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            {team.joinStatus === 'joinable' ? (
              <Link href="/team/join">
                <Button type="primary" block>输入授权码加入</Button>
              </Link>
            ) : (
              <Link href={`/team/${team.id}/handbook`}>
                <Button type="primary" block>研学手册</Button>
              </Link>
            )}
            <Link href="/team">
              <Button block>团队列表</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
