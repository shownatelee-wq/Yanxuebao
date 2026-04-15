'use client';

import { Button, Form, Input, Result, Slider, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getDeviceTaskWorkById, submitDevicePeerReview } from '../../../../../../lib/device-task-data';

const rubricRows = [
  {
    key: 'content',
    dimension: '内容完整度',
    standard: '这份作品是否把老师要求填写的内容说清楚了。',
  },
  {
    key: 'expression',
    dimension: '表达清晰度',
    standard: '作品里的文字、图片或视频是否容易理解。',
  },
  {
    key: 'teamwork',
    dimension: '协作表现',
    standard: '是否能看出这位组员在小组作品中的具体贡献。',
  },
  {
    key: 'evidence',
    dimension: '证据真实性',
    standard: '作品内容和附件是否能对应现场观察或创作过程。',
  },
];

function toLevel(score: number) {
  if (score >= 9) {
    return '优秀';
  }
  if (score >= 7) {
    return '良好';
  }
  if (score >= 5) {
    return '达标';
  }
  return '待提升';
}

export default function DeviceTaskWorkPeerReviewPage() {
  const params = useParams<{ workId: string }>();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const work = getDeviceTaskWorkById(params.workId);

  if (!work) {
    return <Result status="404" title="未找到作品" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  const latestReview = work.peerReviewDetails?.[0];
  const initialScores = latestReview?.items.reduce<Record<string, number>>((accumulator, item, index) => {
    const key = rubricRows[index]?.key;
    if (key) {
      accumulator[key] = Math.max(1, Math.min(10, item.score));
    }
    return accumulator;
  }, {});

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">组员互评</p>
          <p className="device-page-subtle">{work.title}</p>
          <Space wrap>
            <Tag color="purple">评价对象 {work.authorName}</Tag>
            <Tag color="blue">{work.groupName ?? '同组成员'}</Tag>
            <Tag color={work.peerReviewDetails?.length ? 'green' : 'default'}>{work.peerReviewDetails?.length ? '可重新评分' : '待评分'}</Tag>
          </Space>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">作品信息</p>
        <p className="device-mini-item-desc" style={{ margin: 0 }}>
          {work.workCategory} · {work.topicType} · 最近更新 {work.updatedAt}
        </p>
        <p className="device-mini-item-desc" style={{ marginTop: 8 }}>{work.summary}</p>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">互评表</p>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            ...initialScores,
            summary: latestReview?.summary ?? '',
          }}
          onFinish={(values) => {
            const scores = rubricRows.map((row) => Number(values[row.key] ?? 1));
            const totalScore = scores.reduce((sum, score) => sum + score, 0);
            submitDevicePeerReview({
              workId: work.id,
              reviewerName: '小明',
              totalScore,
              summary: String(values.summary ?? '').trim(),
              items: rubricRows.map((row, index) => ({
                dimension: row.dimension,
                score: scores[index] ?? 1,
                level: toLevel(scores[index] ?? 1),
                comment: row.standard,
              })),
            });
            messageApi.success('互评已提交');
            router.push(`/tasks/${work.taskId}/peer-works`);
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
                  label="评分"
                  rules={[{ required: true, message: `请完成${row.dimension}评分` }]}
                  style={{ marginTop: 8, marginBottom: 0 }}
                >
                  <Slider min={1} max={10} marks={{ 1: '1', 5: '5', 10: '10' }} />
                </Form.Item>
              </div>
            ))}
            <div className="device-rubric-item">
              <div className="device-mini-item-title">
                <span>互评总评</span>
                <Tag color="blue">填写</Tag>
              </div>
              <p className="device-mini-item-desc">写一句你想给这位组员的建议或肯定。</p>
              <Form.Item
                name="summary"
                label="互评内容"
                rules={[{ required: true, message: '请填写互评内容' }]}
                style={{ marginTop: 8, marginBottom: 0 }}
              >
                <Input.TextArea rows={4} placeholder="例如：你的讲解很清楚，如果能再补一张关键步骤图片就更完整了。" />
              </Form.Item>
            </div>
          </div>

          <div className="device-action-row" style={{ marginTop: 12 }}>
            <Button htmlType="submit" type="primary" block>
              提交互评
            </Button>
            <Link href={`/tasks/${work.taskId}/peer-works`}>
              <Button block>返回作品列表</Button>
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
