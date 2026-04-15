'use client';

import { AudioOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { saveDemoDraft } from '../../../lib/demo-draft';
import { useCaptureShare } from '../../../lib/device-capture-share';

const { Paragraph, Text } = Typography;

export default function DeviceAskPage() {
  const [question, setQuestion] = useState('海豚为什么喜欢结队活动？');
  const [submittedQuestion, setSubmittedQuestion] = useState(question);
  const [messageApi, contextHolder] = message.useMessage();
  const sharedAsset = useCaptureShare();

  const answer = useMemo(
    () => ({
      summary:
        sharedAsset && sharedAsset.target === 'model'
          ? `我已经收到这${sharedAsset.type === '照片' ? '张照片' : '段视频'}，当前识别的主要对象是“${sharedAsset.primaryLabel ?? '待确认对象'}”。你可以先从“它是什么、它在做什么、为什么会这样”三个角度来分析，再补一句你的现场判断。`
          : '海豚结队更容易找到食物，也能一起保护幼崽，遇到危险时更安全。',
      tags: sharedAsset && sharedAsset.target === 'model' ? ['已接收素材', '已同步识物', '可继续追问'] : ['儿童回答', '知识卡已同步'],
    }),
    [sharedAsset, submittedQuestion],
  );

  return (
    <div className="device-page-stack">
      {contextHolder}

      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="orange">问问</Tag>
            <Tag color="blue">一键提问</Tag>
          </Space>
          <p className="device-page-title">问问</p>
          <p className="device-page-subtle">说一句，立刻得到回答。</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">我的问题</p>
        <Input.TextArea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} />
        <div className="device-action-row" style={{ marginTop: 10 }}>
          <Button type="primary" icon={<SendOutlined />} onClick={() => setSubmittedQuestion(question)} block>
            提交
          </Button>
          <Button icon={<AudioOutlined />} block>
            语音提问
          </Button>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">回答结果</p>
        {sharedAsset && sharedAsset.target === 'model' ? (
          <div className={`device-capture-chat-card accent-${sharedAsset.accent ?? 'blue'}`}>
            <div className="device-capture-chat-thumb">
              <span>{sharedAsset.previewLabel ?? sharedAsset.title}</span>
              <em>{sharedAsset.type}</em>
            </div>
            <div>
              <Text strong style={{ fontSize: 12 }}>我刚拍的{sharedAsset.type === '照片' ? '照片' : '视频'}</Text>
              <Paragraph style={{ margin: '6px 0 0', fontSize: 11 }}>{sharedAsset.summary}</Paragraph>
              {sharedAsset.recognizedNames?.length ? (
                <div className="watch-status-pills" style={{ marginTop: 8 }}>
                  {sharedAsset.recognizedNames.map((item) => (
                    <span key={item} className="watch-status-pill">{item}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        <Text strong style={{ fontSize: 12 }}>{submittedQuestion}</Text>
        <Paragraph style={{ margin: '6px 0 0', fontSize: 12 }}>{answer.summary}</Paragraph>
        <Space wrap style={{ marginTop: 8 }}>
          {answer.tags.map((tag) => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </Space>
      </div>

      <div className="device-action-row">
        <Button
          block
          onClick={() => {
            saveDemoDraft({
              type: 'text',
              title: `问问结果：${submittedQuestion}`,
              content: answer.summary,
              source: 'ask',
              updatedAt: new Date().toISOString(),
            });
            messageApi.success('已加入任务草稿');
          }}
        >
          加入任务
        </Button>
        <Link href="/tasks">
          <Button type="primary" block>任务</Button>
        </Link>
      </div>
    </div>
  );
}
