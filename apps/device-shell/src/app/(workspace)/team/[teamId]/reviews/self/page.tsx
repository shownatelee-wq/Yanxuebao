'use client';

import { Button, Form, Input, Result, Slider, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { submitTeamSelfReview, useDeviceTeamSnapshot } from '../../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../../lib/watch-ui';

export default function DeviceTeamSelfReviewScopedPage() {
  const params = useParams<{ teamId: string }>();
  const router = useRouter();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;

  if (!team || !detail) {
    return <Result status="404" title="未找到自评页面" extra={<Link href="/team"><Button>团队列表</Button></Link>} />;
  }

  if (!detail.reviewConfig.allowSelfReview) {
    return <Result status="403" title="当前团队未开放自评" extra={<Link href={`/team/${team.id}/reviews`}><Button>返回评价</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="团队自评" subtitle="根据评价项目逐项填写今天在团队中的表现。" tags={[{ label: detail.myMember.name }, { label: detail.myRole, color: 'cyan' }]} />
      <Form
        form={form}
        layout="vertical"
        initialValues={Object.fromEntries(detail.reviewConfig.rubricItems.map((item) => [item.id, 8]))}
        onFinish={(values) => {
          submitTeamSelfReview(team.id, {
            summary: String(values.summary ?? '').trim(),
            values: detail.reviewConfig.rubricItems.map((item) => ({
              dimension: item.dimension,
              score: Number(values[item.id] ?? 8),
              comment: item.standard,
            })),
          });
          messageApi.success('已提交团队自评');
          router.push(`/team/${team.id}/reviews`);
        }}
      >
        <WatchSection title="自评项目">
          <div className="device-rubric-list">
            {detail.reviewConfig.rubricItems.map((item) => (
              <div key={item.id} className="device-rubric-item">
                <div className="device-mini-item-title">
                  <span>{item.dimension}</span>
                  <Tag color="purple">1-10 分</Tag>
                </div>
                <p className="device-mini-item-desc">{item.standard}</p>
                <Form.Item name={item.id} style={{ marginBottom: 0 }}>
                  <Slider min={1} max={10} step={1} />
                </Form.Item>
              </div>
            ))}
          </div>
        </WatchSection>
        <WatchSection title="自评总结">
          <Form.Item name="summary" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={4} maxLength={80} placeholder="写一句今天团队协作中的收获或反思" />
          </Form.Item>
        </WatchSection>
        <div className="device-action-row">
          <Button type="primary" htmlType="submit" block>提交自评</Button>
          <Link href={`/team/${team.id}/reviews`}>
            <Button block>返回评价</Button>
          </Link>
        </div>
      </Form>
    </div>
  );
}
