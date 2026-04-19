'use client';

import { Button, Space, Tag, Typography, Result } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTeamReviewTasks, useDeviceTeamSnapshot } from '../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;
const phaseOrder = ['过程性评价', '总结性评价'] as const;
const phaseRoles = {
  过程性评价: ['学生自评', '同学互评', '老师评价'],
  总结性评价: ['小组自评', '同学互评', '专家评价'],
} as const;

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatScore(value: number) {
  return value ? value.toFixed(1) : '待评分';
}

export default function DeviceTeamReviewsScopedPage() {
  const params = useParams<{ teamId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到研学评价" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  const tasks = getTeamReviewTasks(team.id);
  const evaluationItems = detail.reviewConfig.evaluationItems ?? [];
  const totalAverage = evaluationItems.length
    ? average(evaluationItems.flatMap((item) => item.scores.map((score) => score.score)))
    : 0;
  const phaseAverages = phaseOrder.map((phase) => {
    const phaseItems = evaluationItems.filter((item) => item.phase === phase);
    return {
      phase,
      score: average(phaseItems.flatMap((item) => item.scores.map((score) => score.score))),
      count: phaseItems.length,
    };
  });

  return (
    <div className="device-page-stack">
      <WatchHero
        title="研学评价"
        subtitle="参考教学评价表，按过程性评价和总结性评价展示每项分值及平均总分。"
        tags={[{ label: '中等复杂度' }, { label: '平均分制', color: 'green' }]}
      />
      <WatchSection title="评分总览">
        <div className="device-mini-list">
          <div className="device-mini-item">
            <div className="device-mini-item-title">
              <span>总得分</span>
              <Tag color="green">{totalAverage ? `${formatScore(totalAverage)} 分` : '待评分'}</Tag>
            </div>
            <p className="device-mini-item-desc" style={{ margin: 0 }}>
              {totalAverage ? '按所有评价角色给出的分值平均计算。' : '完成一次团队评价后，这里会显示每项分值和平均总分。'}
            </p>
          </div>
          {phaseAverages.map((item) => (
            <div key={item.phase} className="device-mini-item">
              <div className="device-mini-item-title">
                <span>{item.phase}</span>
                <Tag color={item.score ? 'blue' : 'default'}>{item.score ? `${formatScore(item.score)} 分` : '待评分'}</Tag>
              </div>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                {item.count} 个核心指标，按本阶段所有角色评分平均计算。
              </Paragraph>
            </div>
          ))}
        </div>
      </WatchSection>
      {phaseOrder.map((phase) => {
        const phaseItems = evaluationItems.filter((item) => item.phase === phase);
        const roles = phaseRoles[phase];
        if (!phaseItems.length) {
          return null;
        }

        return (
          <WatchSection key={phase} title={phase}>
            <div className="device-evaluation-table-wrap">
              <div className="device-evaluation-table" style={{ gridTemplateColumns: `76px minmax(150px, 1.6fr) repeat(${roles.length}, 74px) 62px` }}>
                <div className="device-evaluation-cell header">评价维度</div>
                <div className="device-evaluation-cell header">核心指标</div>
                {roles.map((role) => (
                  <div key={role} className="device-evaluation-cell header">{role}</div>
                ))}
                <div className="device-evaluation-cell header">均分</div>
                {phaseItems.map((item) => {
                  const itemAverage = average(item.scores.map((score) => score.score));
                  return (
                    <div key={item.id} style={{ display: 'contents' }}>
                      <div className="device-evaluation-cell dimension">{item.dimension}</div>
                      <div className="device-evaluation-cell indicator">
                        <span>{item.coreIndicator}</span>
                        {item.note ? <small>{item.note}</small> : null}
                      </div>
                      {roles.map((role) => {
                        const score = item.scores.find((entry) => entry.role === role)?.score ?? 0;
                        return (
                          <div key={`${item.id}-${role}`} className="device-evaluation-cell score">
                            {formatScore(score)}
                          </div>
                        );
                      })}
                      <div className="device-evaluation-cell average">{formatScore(itemAverage)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </WatchSection>
        );
      })}
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
