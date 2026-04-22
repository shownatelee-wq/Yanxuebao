'use client';

import { AudioOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Result, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { appendMicrochatMessage, useDeviceSocialSnapshot, type DeviceChatMessage } from '../../../../lib/device-social-state';

const { Text } = Typography;

function renderMessageContent(item: DeviceChatMessage) {
  if (item.cardTitle) {
    return (
      <Link href={item.path ?? '#'} className="device-card-link">
        <div className="device-chat-card-message">
          <strong>{item.cardTitle}</strong>
          <span>{item.cardSummary ?? item.content}</span>
        </div>
      </Link>
    );
  }
  return <Text style={{ fontSize: 12 }}>{item.content}</Text>;
}

export default function DeviceMicrochatDetailPage() {
  const params = useParams<{ threadId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const { friends, microchatThreads } = useDeviceSocialSnapshot();
  const thread = microchatThreads.find((item) => item.id === params.threadId);
  const friend = thread ? friends.find((item) => item.id === thread.friendId) : null;
  const [inputValue, setInputValue] = useState('我把今天的观察整理好了。');

  if (!thread) {
    return <Result status="404" title="未找到微聊" extra={<Link href="/microchat"><Button>返回微聊</Button></Link>} />;
  }

  const safeThread = thread;
  const disabled = friend?.isBlocked || friend?.verificationStatus !== 'verified';

  function sendMessage(type: 'text' | 'voice') {
    if (disabled) {
      messageApi.warning('该好友未验证或已拉黑，暂不可发送');
      return;
    }
    const content = type === 'voice' ? '已发送 8 秒语音' : inputValue.trim();
    if (!content) {
      messageApi.warning('先输入想说的话');
      return;
    }
    appendMicrochatMessage(safeThread.id, {
      type,
      content,
      author: '我',
      self: true,
    });
    if (type === 'text') {
      setInputValue('');
    }
  }

  return (
    <div className="device-assistant-chat-page microchat-chat-mode">
      {contextHolder}
      <div className="device-assistant-chat-header">
        <Link href="/microchat" className="device-assistant-header-icon" aria-label="返回">
          ‹
        </Link>
        <div className="device-assistant-header-title">
          <strong>{safeThread.title}</strong>
          <span>{disabled ? '不可发送' : '微聊中'}</span>
        </div>
        <Tag color={disabled ? 'red' : 'green'}>{disabled ? '受限' : '在线'}</Tag>
      </div>

      <div className="device-assistant-chat-scroll">
        <div className="device-chat-thread microchat-thread">
          {safeThread.messages.map((item) => (
            <div key={item.id} className={`device-chat-bubble${item.self ? ' self' : ''}`}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>{item.author}</Text>
              {renderMessageContent(item)}
              <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 10 }}>{item.time}</Text>
            </div>
          ))}
        </div>
      </div>

      <div className="device-assistant-chat-footer">
        <div className="device-assistant-compose-bar ask-compose-bar">
          <Button shape="circle" icon={<AudioOutlined />} onClick={() => sendMessage('voice')} />
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="输入消息"
            variant="borderless"
            onPressEnter={() => sendMessage('text')}
          />
          <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={() => sendMessage('text')} />
        </div>
      </div>
    </div>
  );
}
