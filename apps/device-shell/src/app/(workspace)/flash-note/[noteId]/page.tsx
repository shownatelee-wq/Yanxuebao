'use client';

import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { saveDemoDraft } from '../../../../lib/demo-draft';
import { getFlashNoteById } from '../../../../lib/flash-notes';

const { Paragraph } = Typography;

export default function DeviceFlashNoteDetailPage() {
  const params = useParams<{ noteId: string }>();
  const note = getFlashNoteById(params.noteId);
  const [messageApi, contextHolder] = message.useMessage();

  if (!note) {
    return <Result status="404" title="未找到闪记" extra={<Link href="/flash-note"><Button>返回闪记列表</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="green">闪记详情</Tag>
            <Tag color="blue">已保存</Tag>
          </Space>
          <p className="device-page-title">观察记录</p>
          <p className="device-page-subtle">{note.createdAt}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">内容</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{note.content}</Paragraph>
      </div>
      <div className="device-action-row">
        <Button
          type="primary"
          block
          onClick={() => {
            saveDemoDraft({
              type: 'text',
              title: '闪记观察记录',
              content: note.content,
              source: 'flash-note',
              updatedAt: new Date().toISOString(),
            });
            messageApi.success('已加入任务草稿');
          }}
        >
          加入任务
        </Button>
        <Link href={`/flash-note/${note.id}/edit`}>
          <Button block>编辑</Button>
        </Link>
      </div>

      <div className="device-action-row single">
        <Link href="/flash-note">
          <Button block>闪记</Button>
        </Link>
      </div>
    </div>
  );
}
