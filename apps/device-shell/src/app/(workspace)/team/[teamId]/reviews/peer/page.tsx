'use client';

import { Button, Form, Input, Result, Select, Slider, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { submitTeamPeerReview, useDeviceTeamSnapshot } from '../../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../../lib/watch-ui';

export default function DeviceTeamPeerReviewScopedPage() {
  const params = useParams<{ teamId: string }>();
  const router = useRouter();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;
  const currentGroup = detail?.groups.find((group) => group.id === detail.myGroupId);
  const peerCandidates = (currentGroup?.members ?? []).filter((member) => !member.isCurrentStudent);

  if (!team || !detail) {
    return <Result status="404" title="未找到互评页面" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  if (!detail.reviewConfig.allowPeerReview) {
    return <Result status="403" title="当前团队未开放互评" extra={<Link href={`/team/${team.id}/reviews`}><Button>返回评价</Button></Link>} />;
  }

  const reviewItems = detail.reviewConfig.evaluationItems?.length
    ? detail.reviewConfig.evaluationItems.map((item) => ({
      id: item.id,
      phase: item.phase,
      dimension: item.coreIndicator,
      standard: `同学互评 · ${item.dimension}`,
      defaultScore: item.scores.find((score) => score.role === '同学互评')?.score ?? 8,
    }))
    : detail.reviewConfig.rubricItems.map((item) => ({
      id: item.id,
      phase: '团队评价',
      dimension: item.dimension,
      standard: item.standard,
      defaultScore: 8,
    }));

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="团队互评" subtitle="先选择一名同组组员，再根据评价项目逐项评分。" />
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          memberId: peerCandidates[0]?.id,
          ...Object.fromEntries(reviewItems.map((item) => [item.id, item.defaultScore])),
        }}
        onFinish={(values) => {
          if (!values.memberId) {
            messageApi.error('请先选择互评对象');
            return;
          }
          submitTeamPeerReview(team.id, {
            memberId: String(values.memberId),
            summary: String(values.summary ?? '').trim(),
            values: reviewItems.map((item) => ({
              dimension: item.dimension,
              score: Number(values[item.id] ?? item.defaultScore),
              comment: item.standard,
            })),
          });
          messageApi.success('已提交组内互评');
          router.push(`/team/${team.id}/reviews`);
        }}
      >
        <WatchSection title="互评对象">
          <Form.Item name="memberId" style={{ marginBottom: 0 }}>
            <Select
              placeholder="请选择组员"
              options={peerCandidates.map((member) => ({
                label: `${member.name} · ${member.roleName}`,
                value: member.id,
              }))}
            />
          </Form.Item>
        </WatchSection>
        <WatchSection title="互评项目">
          <div className="device-rubric-list">
            {reviewItems.map((item) => (
              <div key={item.id} className="device-rubric-item">
                <div className="device-mini-item-title">
                  <span>{item.dimension}</span>
                  <Tag color="purple">{item.phase}</Tag>
                </div>
                <p className="device-mini-item-desc">{item.standard}</p>
                <Form.Item name={item.id} style={{ marginBottom: 0 }}>
                  <Slider min={1} max={10} step={1} />
                </Form.Item>
              </div>
            ))}
          </div>
        </WatchSection>
        <WatchSection title="互评总结">
          <Form.Item name="summary" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={4} maxLength={80} placeholder="补一句你对这位组员的评价或建议" />
          </Form.Item>
        </WatchSection>
        <div className="device-action-row">
          <Button type="primary" htmlType="submit" block>提交互评</Button>
          <Link href={`/team/${team.id}/reviews`}>
            <Button block>返回评价</Button>
          </Link>
        </div>
      </Form>
    </div>
  );
}
