'use client';

import { Button, Form, Input, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getFlashNoteById, getFlashNoteTypeLabel, updateFlashNote } from '../../../../../lib/flash-notes';

export default function DeviceFlashNoteEditPage() {
  const params = useParams<{ noteId: string }>();
  const router = useRouter();
  const [form] = Form.useForm<{ title: string; transcript: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const note = getFlashNoteById(params.noteId);

  async function submit(values: { title: string; transcript: string }) {
    const updated = updateFlashNote(params.noteId, values);
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
          <Space wrap>
            <Tag color="gold">编辑</Tag>
            <Tag color={note.type === 'voice_note' ? 'green' : 'purple'}>{getFlashNoteTypeLabel(note)}</Tag>
          </Space>
          <p className="device-page-title">编辑闪记</p>
          <p className="device-page-subtle">可修改标题和转写摘要，保存后回到详情页。</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ title: note.title, transcript: note.transcript ?? '' }}
          onFinish={submit}
        >
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入闪记标题' }]}>
            <Input placeholder="输入闪记标题" />
          </Form.Item>
          <Form.Item name="transcript" label={note.type === 'voice_note' ? '转写文字' : '视频摘要'}>
            <Input.TextArea rows={5} placeholder="补充这条闪记的要点" />
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
