'use client';

import { Button, Form, Input, Result, Slider, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getDeviceTaskWorkById } from '../../../../../../lib/device-task-data';

const rubricRows = [
  {
    key: 'knowledge',
    dimension: '知识应用',
    standard: '我能把本次研学中学到的知识应用到这份学习作品里。',
  },
  {
    key: 'research',
    dimension: '探究能力',
    standard: '我能整理观察或资料信息，并主动分析它们之间的关系。',
  },
  {
    key: 'teamwork',
    dimension: '合作表现',
    standard: '小组任务中我能主动承担角色，积极沟通解决问题。',
  },
  {
    key: 'discipline',
    dimension: '规范意识',
    standard: '我能遵守安全准则和礼仪规范，按要求完成活动。',
  },
];

export default function DeviceTaskWorkSelfReviewPage() {
  const params = useParams<{ workId: string }>();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const work = getDeviceTaskWorkById(params.workId);

  if (!work) {
    return <Result status="404" title="未找到作品" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  const initialScores = work.selfReviewDetail?.items.reduce<Record<string, number>>((accumulator, item, index) => {
    const key = rubricRows[index]?.key;
    if (key) {
      accumulator[key] = Math.max(1, Math.min(10, item.score * 2));
    }
    return accumulator;
  }, {});

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">学生自评</p>
          <p className="device-page-subtle">{work.title}</p>
          <Space wrap>
            <Tag color="blue">{work.authorName}</Tag>
            <Tag color={work.selfReviewDetail ? 'green' : 'default'}>{work.selfReviewDetail ? '已填写，可调整' : '待填写'}</Tag>
          </Space>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">自评表</p>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            ...initialScores,
            reflection: work.selfReviewDetail?.summary ?? work.selfReview?.comment ?? '',
          }}
          onFinish={() => {
            messageApi.success('自评已提交');
            router.push(`/tasks/works/${work.id}`);
          }}
        >
          <div className="device-rubric-list">
            {rubricRows.map((row) => (
              <div key={row.key} className="device-rubric-item">
                <div className="device-mini-item-title">
                  <span>{row.dimension}</span>
                  <Tag color="purple">1-10 分</Tag>
                </div>
                <p className="device-mini-item-desc">{row.standard}</p>
                <Form.Item
                  name={row.key}
                  label="自评分"
                  rules={[{ required: true, message: `请完成${row.dimension}评分` }]}
                  style={{ marginTop: 8, marginBottom: 0 }}
                >
                  <Slider min={1} max={10} marks={{ 1: '1', 5: '5', 10: '10' }} />
                </Form.Item>
              </div>
            ))}
            <div className="device-rubric-item">
              <div className="device-mini-item-title">
                <span>反思提升</span>
                <Tag color="blue">填写</Tag>
              </div>
              <p className="device-mini-item-desc">本次活动让我最惊讶的发现是什么？我还想继续改进什么？</p>
              <Form.Item
                name="reflection"
                label="反思内容"
                rules={[{ required: true, message: '请填写反思内容' }]}
                style={{ marginTop: 8, marginBottom: 0 }}
              >
                <Input.TextArea rows={4} placeholder="写下你的发现、收获和接下来还想改进的地方" />
              </Form.Item>
            </div>
          </div>

          <div className="device-action-row" style={{ marginTop: 12 }}>
            <Button htmlType="submit" type="primary" block>
              提交自评
            </Button>
            <Link href={`/tasks/works/${work.id}`}>
              <Button block>作品详情</Button>
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
