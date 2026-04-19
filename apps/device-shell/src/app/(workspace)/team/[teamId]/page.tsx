'use client';

import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoReports } from '../../../../lib/device-demo-data';
import { useDeviceTeamSnapshot } from '../../../../lib/device-team-data';
import { WatchInfoRow } from '../../../../lib/watch-ui';

function toLifecycleTag(status: string) {
  if (status === '已结束') {
    return { text: status, color: 'default' as const };
  }
  if (status === '待出行') {
    return { text: status, color: 'gold' as const };
  }
  if (status === '招募中') {
    return { text: status, color: 'blue' as const };
  }
  return { text: status, color: 'green' as const };
}

export default function DeviceTeamDetailPage() {
  const params = useParams<{ teamId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到团队" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  const lifecycleTag = toLifecycleTag(team.lifecycleStatus);
  const isJoined = team.membershipStatus === '已加入';
  const isTravelTeam = team.sourceType === '研学旅行推荐';
  const teamReport = demoReports.find((item) => item.teamId === team.id);

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space wrap>
              <Tag color={lifecycleTag.color}>{lifecycleTag.text}</Tag>
              <Tag color="cyan">{team.membershipStatus}</Tag>
              <Tag color="blue">{team.studyDate}</Tag>
              <Tag color="cyan">{team.destination}</Tag>
            </Space>
            <p className="device-page-title">{team.name}</p>
            <p className="device-page-subtle">{detail.teamSummary}</p>
          </Space>
        </div>

        <div className="device-compact-card">
          <p className="device-section-label">{isTravelTeam ? '研学旅行团队信息' : '团队基础信息'}</p>
            <div className="device-detail-grid">
              <WatchInfoRow label="机构" value={team.organizationName ?? '未分配机构'} />
              <WatchInfoRow label="研学时长" value={`${team.days} 天`} />
              <WatchInfoRow label="人数" value={`${team.studentCount} 人`} />
              <WatchInfoRow label="入队方式" value={detail.joinMode} />
              <WatchInfoRow label="团队类型" value={team.sourceType} />
              <WatchInfoRow label="参与状态" value={team.membershipStatus} />
            </div>
          </div>

        {isTravelTeam ? (
          <div className="device-compact-card">
            <p className="device-section-label">推荐说明</p>
            <p className="device-mini-item-desc" style={{ margin: 0 }}>
              {team.shareSummary ?? '可发送给家长，由家长在小程序中查看详情并完成报名。'}
            </p>
          </div>
        ) : null}

        {isJoined && !isTravelTeam ? (
          <>
            <div className="device-compact-card">
              <p className="device-section-label">我的团队状态</p>
              <div className="device-detail-grid">
                <WatchInfoRow label="当前小组" value={detail.groupName} />
                <WatchInfoRow label="个人排行" value={`第 ${detail.myRank.rank} 名 / ${detail.myRank.total} 人`} />
              </div>
            </div>

            <div className="watch-grid-panel">
              <div className="device-plaza-grid">
                <Link href={`/team/${team.id}/groups`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>小组</strong>
                  <span className="device-mini-item-desc">查看小组列表与小组详情</span>
                </Link>
                <Link href={`/team/${team.id}/handbook`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>研学手册</strong>
                  <span className="device-mini-item-desc">查看图文、PDF、视频和 AI 资料</span>
                </Link>
                <Link href={`/team/${team.id}/tasks`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>任务</strong>
                  <span className="device-mini-item-desc">进入本次团队任务</span>
                </Link>
                <Link href={`/team/${team.id}/rankings`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>团队排行</strong>
                  <span className="device-mini-item-desc">看个人和小组排名</span>
                </Link>
                <Link href={`/team/${team.id}/reviews`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>研学评价</strong>
                  <span className="device-mini-item-desc">查看团队评价得分</span>
                </Link>
                <Link href={`/team/${team.id}/reports`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>研学报告</strong>
                  <span className="device-mini-item-desc">{teamReport?.title ?? '查看本次团队报告'}</span>
                </Link>
                <Link href={`/team/${team.id}/certificate`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>研学证书</strong>
                  <span className="device-mini-item-desc">{teamReport?.certificateTitle ?? '查看本次团队证书'}</span>
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
                <WatchInfoRow label="参与状态" value={team.membershipStatus} />
              </div>
            </div>

            <div className="watch-grid-panel">
              <div className="device-plaza-grid">
                <Link href={`/team/${team.id}/handbook`} className="device-plaza-tile">
                  <strong style={{ fontSize: 12 }}>研学手册</strong>
                  <span className="device-mini-item-desc">提前查看行程和资料</span>
                </Link>
                {isTravelTeam ? (
                  <Link href={`/team/${team.id}/certificate`} className="device-plaza-tile">
                    <strong style={{ fontSize: 12 }}>发送给家长</strong>
                    <span className="device-mini-item-desc">仅展示推荐信息，不在设备端购买</span>
                  </Link>
                ) : null}
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
            {isTravelTeam ? (
              <Link href={`/team/${team.id}/certificate`}>
                <Button type="primary" block>发送给家长</Button>
              </Link>
            ) : team.membershipStatus === '未加入' || team.membershipStatus === '待审批' ? (
              <Link href="/team/join">
                <Button type="primary" block>{team.membershipStatus === '待审批' ? '查看审批进度' : '扫码入团'}</Button>
              </Link>
            ) : (
              <Link href={`/team/${team.id}/tasks`}>
                <Button type="primary" block>任务</Button>
              </Link>
            )}
            <Link href={isTravelTeam ? '/team/travel' : '/team'}>
              <Button block>{isTravelTeam ? '研学旅行团队' : '返回团队'}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
