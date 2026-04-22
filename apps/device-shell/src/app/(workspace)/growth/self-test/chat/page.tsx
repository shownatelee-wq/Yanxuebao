'use client';

import { AudioOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Tag, message } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { saveSelfTestSessionResult, useGrowthOverview, useGrowthState } from '../../../../../lib/device-growth-data';

type TestMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

export default function DeviceSelfTestChatPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { capabilities } = useGrowthState();
  const { overview } = useGrowthOverview();
  const focusElements = useMemo(
    () => [...capabilities].sort((left, right) => left.score - right.score).slice(0, 3),
    [capabilities],
  );
  const [inputValue, setInputValue] = useState('我遇到问题会先观察，再问同学或老师。');
  const [messages, setMessages] = useState<TestMessage[]>([
    {
      id: 'assistant_1',
      role: 'assistant',
      content: `我们用聊天方式做能力自测。我会围绕${focusElements.map((item) => item.elementKey).join('、')}持续追问，你可以语音或文字回答。`,
    },
    {
      id: 'assistant_2',
      role: 'assistant',
      content: '第一个问题：遇到一个不知道怎么解决的研学任务时，你通常会怎么开始？',
    },
  ]);

  function sendAnswer() {
    const value = inputValue.trim();
    if (!value) {
      messageApi.warning('先说一句你的回答');
      return;
    }

    const nextQuestion =
      messages.filter((item) => item.role === 'user').length >= 2
        ? '已经足够生成报告了，你可以点击结束测试。'
        : '我理解了。那如果同伴意见和你不一样，你会怎么判断谁的方案更合适？';

    setMessages((current) => [
      ...current,
      { id: `user_${Date.now()}`, role: 'user', content: value },
      { id: `assistant_${Date.now()}`, role: 'assistant', content: nextQuestion },
    ]);
    setInputValue('');
  }

  function finishTest() {
    const elements = focusElements.map((item, index) => ({
      elementKey: item.elementKey,
      score: Math.min(9.2, Math.max(7.2, item.score + 0.4 + index * 0.1)),
      latestIndex: item.score,
      average: item.averageScore,
    }));
    const report = saveSelfTestSessionResult({
      planeId: 'all',
      planeTitle: '互动聊天测试',
      elements,
      totalScore: elements.reduce((sum, item) => sum + item.score, 0) / (elements.length || 1),
      completedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    });
    messageApi.success('已生成互动聊天自测报告');
    window.setTimeout(() => {
      window.location.href = `/growth/self-test/report?reportId=${report.id}`;
    }, 500);
  }

  return (
    <div className="device-assistant-chat-page self-test-chat-mode">
      {contextHolder}
      <div className="device-assistant-chat-header">
        <Link href="/growth/self-test" className="device-assistant-header-icon" aria-label="返回">
          ‹
        </Link>
        <div className="device-assistant-header-title">
          <strong>互动聊天自测</strong>
          <span>不限制题数 · 本地生成报告</span>
        </div>
        <Tag color="blue">{overview.currentLevel}</Tag>
      </div>

      <div className="device-assistant-chat-scroll">
        <div className="device-assistant-chat-thread">
          {messages.map((item) => (
            <div key={item.id} className={`device-assistant-message${item.role === 'user' ? ' self without-avatar' : ''}`}>
              {item.role === 'assistant' ? <div className="device-assistant-avatar">测</div> : null}
              <div className={`device-assistant-message-main${item.role === 'user' ? ' self' : ''}`}>
                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="device-assistant-chat-footer ask-chat-footer">
        <div className="device-ask-tool-strip">
          <Button size="small" icon={<AudioOutlined />} onClick={() => setInputValue('我会先听不同意见，再结合现场证据做判断。')}>
            模拟语音
          </Button>
          <Button size="small" onClick={finishTest}>
            结束并生成报告
          </Button>
        </div>
        <div className="device-assistant-compose-bar ask-compose-bar">
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="用文字或语音回答"
            variant="borderless"
          />
          <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={sendAnswer} />
        </div>
      </div>
    </div>
  );
}
