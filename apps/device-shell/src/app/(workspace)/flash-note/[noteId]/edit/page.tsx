'use client';

import { Button, Form, Input, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getFlashNoteById, updateFlashNote } from '../../../../../lib/flash-notes';

export default function DeviceFlashNoteEditPage() {
  const params = useParams<{ noteId: string }>();
  const router = useRouter();
  const [form] = Form.useForm<{ content: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const note = getFlashNoteById(params.noteId);

  async function submit(values: { content: string }) {
    const updated = updateFlashNote(params.noteId, values.content);
    if (!updated) {
      messageApi.error('保存失败，请返回后重试');
      return;
    }
    messageApi.success('闪记已更新');
    router.push(`/flash-note/${params.noteId}`);
  }

  if (!note) {
    return (
      <div className="device-page-stack">
        {contextHolder}
        <div className="device-compact-card">
          <p className="device-page-title">未找到闪记</p>
        </div>
        <div className="device-action-row single">
          <Link href="/flash-note">
            <Button block>闪记</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="gold">编辑</Tag>
            <Tag color="green">闪记</Tag>
          </Space>
          <p className="device-page-title">编辑闪记</p>
          <p className="device-page-subtle">修改后直接保存到详情页。</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <Form form={form} layout="vertical" initialValues={{ content: note.content }} onFinish={submit}>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入闪记内容' }]}>
            <Input.TextArea rows={5} placeholder="补充你的观察记录" />
          </Form.Item>
          <div className="device-action-row">
            <Button htmlType="submit" type="primary" block>
              保存
            </Button>
            <Link href={`/flash-note/${params.noteId}`}>
              <Button block>取消</Button>
            </Link>
          </div>
        </Form>
      </div>

    </div>
  );
}
