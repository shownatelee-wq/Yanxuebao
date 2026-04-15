'use client';

import { Button, Result, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceTeamHandbookScopedPage() {
  const params = useParams<{ teamId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到研学手册" extra={<Link href="/team"><span>团队列表</span></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <WatchHero title="研学手册" subtitle={detail.handbookTitle} tags={[{ label: team.name }, { label: team.studyDate, color: 'cyan' }]} />
      <WatchSection title="今日守则">
        <div className="device-mini-list">
          {['集合提前 5 分钟到位', '观察时先拍照再记录', '组内发言先举手再轮流表达'].map((item) => (
            <div key={item} className="device-mini-item">
              <Paragraph style={{ margin: 0, fontSize: 12 }}>{item}</Paragraph>
            </div>
          ))}
        </div>
      </WatchSection>
      <WatchSection title="团队资料">
        <div className="device-mini-list">
          {detail.handbookMaterials.map((item) => (
            <Link key={item.id} href={`/team/${team.id}/handbook/materials/${item.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{item.title}</span>
                  <span>{item.type === 'pdf' ? 'PDF' : '图文'}</span>
                </div>
                <Paragraph style={{ margin: 0, fontSize: 11 }} type="secondary">
                  {item.summary}
                </Paragraph>
              </div>
            </Link>
          ))}
        </div>
      </WatchSection>

      <div className="device-action-row">
        <Link href={`/team/${team.id}/rankings`}>
          <Button type="primary" block>团队排行</Button>
        </Link>
        <Link href={`/team/${team.id}`}>
          <Button block>团队详情</Button>
        </Link>
      </div>
    </div>
  );
}
