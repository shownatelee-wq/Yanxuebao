'use client';

import { AudioOutlined, PauseCircleOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getPlazaAgentById, usePlazaState } from '../../../lib/device-plaza-data';

const { Paragraph, Text } = Typography;

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function DeviceCourseQaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = usePlazaState();
  const [messageApi, contextHolder] = message.useMessage();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [phase, setPhase] = useState<'recording' | 'sending'>('recording');

  const agentId = searchParams.get('agentId') ?? 'plaza_agent_03';
  const courseId = searchParams.get('courseId') ?? '';
  const courseTitle = searchParams.get('courseTitle') ?? '当前课程';
  const courseSummary = searchParams.get('courseSummary') ?? '这节课程的重点内容';
  const agent = getPlazaAgentById(agentId, state) ?? state.agents[0];

  const transcript = useMemo(
    () => `我刚学到《${courseTitle}》，想知道这个知识点在研学任务里怎么用？`,
    [courseTitle],
  );

  useEffect(() => {
    if (phase !== 'recording') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase]);

  function finishRecording() {
    setPhase('sending');
    messageApi.success('录音完成，正在发送给 AI');

    const nextParams = new URLSearchParams({
      mode: 'course_qa',
      agentId,
      courseId,
      courseTitle,
      courseSummary,
      question: transcript,
    });

    window.setTimeout(() => {
      router.push(`/ask?${nextParams.toString()}`);
    }, 700);
  }

  return (
    <div className="device-page-stack">
      {contextHolder}

      <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="orange">专家问答</Tag>
            <Tag color="blue">语音提问</Tag>
            <Tag color="green">{agent?.shortTitle ?? '专家'}</Tag>
          </Space>
          <p className="device-page-title">专家问答</p>
          <p className="device-page-subtle">先录下你对课程的疑问，录音结束后会模拟转文字并发送给 AI。</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">当前课程</p>
        <div className="device-mini-item watch-list-card">
          <div className="device-mini-item-title">
            <span>{courseTitle}</span>
            <Tag color="blue">{agent?.title ?? '课程专家'}</Tag>
          </div>
          <p className="device-mini-item-desc">{courseSummary}</p>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">语音提问</p>
        <div className={`device-capture-stage ${phase === 'recording' ? 'capturing' : 'done'}`} style={{ minHeight: 150, marginBottom: 10 }}>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
            <AudioOutlined style={{ fontSize: 28 }} />
            <strong style={{ fontSize: 20 }}>{formatDuration(Math.max(elapsedSeconds, phase === 'sending' ? 8 : 0))}</strong>
            <span style={{ fontSize: 12, color: 'rgba(31, 41, 55, 0.72)' }}>
              {phase === 'recording' ? '正在录音，点击下方按钮结束并提问' : '录音已转写，正在发送给 AI'}
            </span>
          </div>
        </div>

        <div className="device-review-summary-item">
          <div className="device-mini-item-title">
            <span>模拟转写内容</span>
            <Tag color={phase === 'recording' ? 'default' : 'green'}>{phase === 'recording' ? '录音中' : '已生成'}</Tag>
          </div>
          <Paragraph style={{ margin: '6px 0 0', fontSize: 12 }}>{transcript}</Paragraph>
        </div>

        <div className="device-action-row" style={{ marginTop: 10 }}>
          <Button
            type="primary"
            block
            icon={<SendOutlined />}
            loading={phase === 'sending'}
            onClick={finishRecording}
          >
            结束录音并提问
          </Button>
          <Button
            block
            icon={<PauseCircleOutlined />}
            disabled={phase === 'sending'}
            onClick={finishRecording}
          >
            停止
          </Button>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">问答说明</p>
        <Text style={{ fontSize: 12 }}>本轮为前端演示效果，不调用真实麦克风、语音识别或大模型接口。</Text>
      </div>

      <div className="device-action-row">
        <Link href={courseId ? `/plaza/agents/${agentId}/courses/${courseId}` : '/plaza'}>
          <Button block>返回课程</Button>
        </Link>
        <Link href="/plaza">
          <Button block>广场</Button>
        </Link>
      </div>
    </div>
  );
}
