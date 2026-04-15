'use client';

import { Button, Space, Tag, Typography, Result } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTeamReviewTasks, useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceTeamReviewsScopedPage() {
  const params = useParams<{ teamId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到研学评价" extra={<Link href="/team"><Button>团队列表</Button></Link>} />;
  }

  const tasks = getTeamReviewTasks(team.id);

  return (
    <div className="device-page-stack">
      <WatchHero title="研学评价" subtitle="根据团队设置完成自评和组内互评。" />
      <WatchSection title="评价任务">
        <div className="device-mini-list">
          {tasks.length === 0 ? (
            <div className="device-mini-item">
              <p className="device-mini-item-desc" style={{ margin: 0 }}>当前团队暂未开放学员自评或组内互评。</p>
            </div>
          ) : (
            tasks.map((item) => (
              <Link key={item.id} href={item.role === '自评' ? `/team/${team.id}/reviews/self` : `/team/${team.id}/reviews/peer`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{item.title}</span>
                    <Space size={6}>
                      <Tag color="blue">{item.role}</Tag>
                      <Tag color={item.status === '已完成' ? 'green' : 'orange'}>{item.status}</Tag>
                    </Space>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {item.summary}
                  </Paragraph>
                </div>
              </Link>
            ))
          )}
        </div>
      </WatchSection>

      <div className="device-action-row">
        {detail.reviewConfig.allowSelfReview ? (
          <Link href={`/team/${team.id}/reviews/self`}>
            <Button type="primary" block>去自评</Button>
          </Link>
        ) : (
          <Button type="primary" block disabled>未开放自评</Button>
        )}
        {detail.reviewConfig.allowPeerReview ? (
          <Link href={`/team/${team.id}/reviews/peer`}>
            <Button block>去互评</Button>
          </Link>
        ) : (
          <Button block disabled>未开放互评</Button>
        )}
      </div>
    </div>
  );
}
