'use client';

import { AudioOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Result, Select, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { getDeviceTaskById, getDeviceTaskWorkById } from '../../../../../../lib/device-task-data';

export default function DeviceTaskWorkEditPage() {
  const params = useParams<{ workId: string }>();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const work = getDeviceTaskWorkById(params.workId);
  const task = work ? getDeviceTaskById(work.taskId) : undefined;

  if (!work || !task) {
    return <Result status="404" title="未找到作品" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  if (searchParams.get('readonly') === '1') {
    const teamId = searchParams.get('teamId') ?? '';
    return (
      <Result
        status="info"
        title="历史团队作品仅支持查看"
        subTitle="该团队已结束，不能继续修改或提交作品。"
        extra={
          <Link href={`/tasks/works/${work.id}?teamId=${teamId}&readonly=1`}>
            <Button type="primary">返回作品详情</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">修改作品</p>
          <p className="device-page-subtle">{task.title}</p>
          <Space>
            <Tag color="blue">{work.type}</Tag>
            <Tag color={work.status === '已提交' ? 'green' : 'orange'}>{work.status}</Tag>
          </Space>
        </Space>
      </div>

      <div className="device-compact-card">
        <Form
          layout="vertical"
          initialValues={{
            title: work.title,
            type: work.type,
            topicType: work.topicType,
            workMode: work.workMode,
            content: work.textContent ?? work.summary,
            transcript: work.voiceTranscript,
          }}
          onFinish={() => messageApi.success('作品修改已保存')}
        >
          <Form.Item name="title" label="作品名称" rules={[{ required: true, message: '请输入作品名称' }]}>
            <Input placeholder="请输入作品名称" />
          </Form.Item>
          <Form.Item name="topicType" label="题目类型">
            <Select
              options={[
                { label: '感想', value: '感想' },
                { label: '创作地图', value: '创作地图' },
                { label: '画作', value: '画作' },
              ]}
            />
          </Form.Item>
          <Form.Item name="workMode" label="完成方式">
            <Radio.Group
              options={[
                { label: '独立完成', value: '独立完成' },
                { label: '小组协作', value: '小组协作' },
              ]}
            />
          </Form.Item>
          <Form.Item name="type" label="内容类型">
            <Select
              options={[
                { label: '文字', value: '文字' },
                { label: '图片', value: '图片' },
                { label: '音频', value: '音频' },
                { label: '视频', value: '视频' },
              ]}
            />
          </Form.Item>
          <Form.Item name="content" label="作品内容">
            <Input.TextArea rows={4} placeholder="补充作品说明或观察内容" />
          </Form.Item>
          <Form.Item name="transcript" label="语音转文字">
            <Input.TextArea rows={2} placeholder="可补充语音转文字内容" />
          </Form.Item>
          <div className="device-action-row" style={{ marginBottom: 12 }}>
            <Button
              icon={<AudioOutlined />}
              block
              onClick={() => {
                messageApi.success('已补充新的语音转文字');
              }}
            >
              语音输入
            </Button>
          </div>
          {work.workMode === '小组协作' ? (
            <div className="device-mini-item" style={{ marginBottom: 12 }}>
              <div className="device-mini-item-title">
                <span>共同填写信息</span>
                <Tag color="purple">小组协作</Tag>
              </div>
              {(work.sharedInputs ?? []).map((item) => (
                <p key={item.id} className="device-mini-item-desc">
                  {item.member}：{item.content}
                </p>
              ))}
            </div>
          ) : null}
          <div className="device-action-row">
            <Button htmlType="submit" type="primary" block>
              保存修改
            </Button>
            <Link href={`/tasks/${task.id}`}>
              <Button block>返回任务详情</Button>
            </Link>
          </div>
        </Form>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">相关操作</p>
        <p className="device-mini-item-desc" style={{ margin: 0 }}>
          保存后会更新当前作品内容与评价进度。
        </p>
      </div>
    </div>
  );
}
