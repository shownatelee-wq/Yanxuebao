'use client';

import { AudioOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { saveDemoDraft } from '../../../lib/demo-draft';
import { useCaptureShare } from '../../../lib/device-capture-share';
import { getPlazaAgentById, usePlazaState } from '../../../lib/device-plaza-data';

const { Paragraph, Text } = Typography;

export default function DeviceAskPage() {
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const sharedAsset = useCaptureShare();
  const state = usePlazaState();
  const agentId = searchParams.get('agentId') ?? 'plaza_agent_03';
  const mode = searchParams.get('mode');
  const isCourseQa = mode === 'course_qa';
  const courseId = searchParams.get('courseId') ?? '';
  const courseTitle = searchParams.get('courseTitle') ?? '当前课程';
  const courseSummary = searchParams.get('courseSummary') ?? '';
  const incomingQuestion = searchParams.get('question');
  const activeAgent = getPlazaAgentById(agentId, state) ?? state.agents[0];
  const defaultQuestion = incomingQuestion ?? '海豚为什么喜欢结队活动？';
  const [question, setQuestion] = useState(defaultQuestion);
  const [submittedQuestion, setSubmittedQuestion] = useState(defaultQuestion);
  const [aiThinking, setAiThinking] = useState(isCourseQa);

  useEffect(() => {
    if (!isCourseQa) {
      setAiThinking(false);
      return undefined;
    }

    const nextQuestion = incomingQuestion ?? `我刚学到《${courseTitle}》，想知道这个知识点在研学任务里怎么用？`;
    setQuestion(nextQuestion);
    setSubmittedQuestion(nextQuestion);
    setAiThinking(true);

    const timer = window.setTimeout(() => {
      setAiThinking(false);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [courseTitle, incomingQuestion, isCourseQa]);

  const courseQaHref = `/course-qa?${new URLSearchParams({
    agentId,
    courseId,
    courseTitle,
    courseSummary,
  }).toString()}`;

  const answer = useMemo(
    () => ({
      summary:
        sharedAsset && sharedAsset.target === 'model'
          ? `我已经收到这${sharedAsset.type === '照片' ? '张照片' : '段视频'}，当前识别的主要对象是“${sharedAsset.primaryLabel ?? '待确认对象'}”。你可以先从“它是什么、它在做什么、为什么会这样”三个角度来分析，再补一句你的现场判断。`
          : isCourseQa
            ? `我先把你的语音问题和《${courseTitle}》连起来看。${courseSummary ? `这节课的重点是：${courseSummary}。` : ''}建议你在研学任务里按“三步”使用：第一步说清课程里的核心概念，第二步找一个现场证据，第三步用自己的话解释它和任务的关系。你现在可以先补充一张现场照片或一个具体例子，我再帮你把答案整理成作品表达。`
          : `${activeAgent?.expertName ?? '专家'}建议你先说清现场证据，再补你的判断。海豚结队更容易找到食物，也能一起保护幼崽，遇到危险时更安全。`,
      tags:
        sharedAsset && sharedAsset.target === 'model'
          ? ['已接收素材', '已同步识物', '可继续追问']
          : isCourseQa
            ? ['课程问答', '语音提问', activeAgent?.title ?? '当前专家']
            : [activeAgent?.category ?? '成长', activeAgent?.expertName ?? '专家', '可发图片继续问'],
    }),
    [activeAgent?.category, activeAgent?.expertName, activeAgent?.title, courseSummary, courseTitle, isCourseQa, sharedAsset, submittedQuestion],
  );

  return (
    <div className="device-page-stack">
      {contextHolder}

      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="orange">{isCourseQa ? '课程问答' : '专家伴学'}</Tag>
            <Tag color="blue">{isCourseQa ? '语音提问' : activeAgent?.category ?? '成长'}</Tag>
            {isCourseQa ? <Tag color="green">{activeAgent?.shortTitle ?? '当前专家'}</Tag> : null}
          </Space>
          <p className="device-page-title">{isCourseQa ? '专家问答' : '专家伴学'}</p>
          <p className="device-page-subtle">
            {isCourseQa
              ? `围绕《${courseTitle}》回答你的语音问题。`
              : activeAgent
                ? `${activeAgent.expertName} · ${activeAgent.oneLineIntro}`
                : '文字、语音、图片都可以继续问。'}
          </p>
        </Space>
      </div>

      {isCourseQa ? (
        <div className="device-compact-card">
          <p className="device-section-label">课程上下文</p>
          <div className="device-mini-item">
            <div className="device-mini-item-title">
              <span>{courseTitle}</span>
              <Tag color="blue">{activeAgent?.title ?? '课程专家'}</Tag>
            </div>
            <p className="device-mini-item-desc">{courseSummary || 'AI 会结合当前课程内容回答。'}</p>
          </div>
        </div>
      ) : null}

      <div className="device-compact-card">
        <p className="device-section-label">当前专家</p>
        {activeAgent ? (
          <div className="device-mini-item">
            <div className="device-mini-item-title">
              <span>{activeAgent.title}</span>
              <Tag color="blue">{activeAgent.operatorName ?? '专家团队'}</Tag>
            </div>
            <p className="device-mini-item-desc">{activeAgent.oneLineIntro}</p>
          </div>
        ) : null}
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">{isCourseQa ? '继续追问' : '我的问题'}</p>
        <Input.TextArea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} />
        <div className="device-action-row" style={{ marginTop: 10 }}>
          <Button type="primary" icon={<SendOutlined />} onClick={() => setSubmittedQuestion(question)} block>
            {isCourseQa ? '继续追问' : '提交'}
          </Button>
          {isCourseQa ? (
            <Link href={courseQaHref}>
              <Button icon={<AudioOutlined />} block>重新语音提问</Button>
            </Link>
          ) : (
            <Button icon={<AudioOutlined />} block>
              语音提问
            </Button>
          )}
        </div>
        <div className="device-action-row" style={{ marginTop: 10 }}>
          <Button
            block
            onClick={() => {
              setSubmittedQuestion('我上传了一张现场照片，帮我看看最值得追问什么？');
              messageApi.success('已附带图片/截图提问');
            }}
          >
            发送图片/截图
          </Button>
          <Link href="/plaza">
            <Button block>切换专家</Button>
          </Link>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">{isCourseQa ? 'AI 回答' : '回答结果'}</p>
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
        {aiThinking ? (
          <div className="device-review-summary-item" style={{ marginTop: 8 }}>
            <div className="device-mini-item-title">
              <span>AI 正在整理语音问题</span>
              <Tag color="blue">处理中</Tag>
            </div>
            <Paragraph style={{ margin: '6px 0 0', fontSize: 12 }}>正在结合课程内容、专家知识和你的语音转写生成回答。</Paragraph>
          </div>
        ) : (
          <>
            <Paragraph style={{ margin: '6px 0 0', fontSize: 12 }}>{answer.summary}</Paragraph>
            <Space wrap style={{ marginTop: 8 }}>
              {answer.tags.map((tag) => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </Space>
          </>
        )}
      </div>

      <div className="device-action-row">
        <Button
          block
          onClick={() => {
            saveDemoDraft({
              type: 'text',
              title: `${isCourseQa ? '专家问答' : '专家伴学'}结果：${submittedQuestion}`,
              content: answer.summary,
              source: 'ask',
              updatedAt: new Date().toISOString(),
            });
            messageApi.success('已加入任务草稿');
          }}
        >
          加入任务
        </Button>
        <Link href={isCourseQa && courseId ? `/plaza/agents/${agentId}/courses/${courseId}` : '/tasks'}>
          <Button type="primary" block>{isCourseQa ? '返回课程' : '任务'}</Button>
        </Link>
      </div>
    </div>
  );
}
