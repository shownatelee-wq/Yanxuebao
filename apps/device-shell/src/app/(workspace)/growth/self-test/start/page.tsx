'use client';

import { AudioOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Button, Progress, Radio, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { demoCapabilities, demoSelfTestPlanes, demoSelfTestQuestions } from '../../../../../lib/device-demo-data';
import { saveSelfTestSessionResult } from '../../../../../lib/device-growth-data';
import { WatchHero } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

const optionValueMap = [10, 8, 6, 4];

export default function DeviceGrowthSelfTestStartPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planeId = searchParams.get('plane') ?? 'all';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const selectedPlane = useMemo(
    () => (planeId === 'all' ? null : demoSelfTestPlanes.find((item) => item.id === planeId) ?? null),
    [planeId],
  );

  const selectedElements = useMemo(() => {
    if (planeId !== 'all' && selectedPlane) {
      const randomIndex = Math.abs(planeId.length + selectedPlane.title.length) % selectedPlane.elements.length;
      return [selectedPlane.elements[randomIndex] ?? selectedPlane.elements[0]];
    }

    return demoSelfTestPlanes.map((plane, index) => plane.elements[(index + plane.title.length) % plane.elements.length] ?? plane.elements[0]);
  }, [planeId, selectedPlane]);

  const selectedQuestions = useMemo(() => {
    const elementSet = new Set(selectedElements);
    return selectedElements.flatMap((elementKey) =>
      demoSelfTestQuestions
        .filter((item) => elementSet.has(item.elementKey) && item.elementKey === elementKey)
        .slice(0, 4),
    );
  }, [selectedElements]);

  const currentQuestion = selectedQuestions[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setRemainingSeconds(60);
    setAnswers({});
  }, [planeId]);

  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    setRemainingSeconds(60);
    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          handleAnswer(currentQuestion.id, 6);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentIndex, currentQuestion]);

  function handleAnswer(questionId: string, value: number) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));

    if (currentIndex >= selectedQuestions.length - 1) {
      const completedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '.');
      const elementResults = selectedElements.map((elementKey) => {
        const elementQuestions = selectedQuestions.filter((item) => item.elementKey === elementKey);
        const total = elementQuestions.reduce((sum, item) => sum + (item.id === questionId ? value : answers[item.id] ?? 6), 0);
        const score = Number((total / elementQuestions.length).toFixed(1));
        const capability = demoCapabilities.find((item) => item.elementKey === elementKey);
        return {
          elementKey,
          score,
          latestIndex: capability?.score ?? score,
          average: capability?.averageScore ?? 7.5,
        };
      });

      const report = saveSelfTestSessionResult({
        planeId,
        planeTitle: planeId === 'all' ? '全面测试' : selectedPlane?.title ?? '单平面测试',
        elements: elementResults,
        totalScore: Number((elementResults.reduce((sum, item) => sum + item.score, 0) / elementResults.length).toFixed(1)),
        completedAt,
      });
      router.push(`/growth/self-test/result?reportId=${report.id}`);
      return;
    }

    setCurrentIndex((value) => value + 1);
  }

  if (!currentQuestion) {
    return (
      <div className="device-page-stack">
        <WatchHero title="开始自测" subtitle="没有找到可用题目，请返回重新选择。" />
        <div className="device-action-row">
          <Link href="/growth/self-test">
            <Button type="primary" block>返回选择</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="device-page-stack">
      <WatchHero title="开始自测" subtitle={`${planeId === 'all' ? '全面测试' : selectedPlane?.title ?? '单平面测试'} · ${selectedElements.length} 个能力元素`}>
        <Space wrap>
          <Tag color="blue">第 {currentIndex + 1} / {selectedQuestions.length} 题</Tag>
          <Tag color="orange" icon={<ClockCircleOutlined />}>{remainingSeconds}s</Tag>
          <Tag color="green">{currentQuestion.elementKey}</Tag>
        </Space>
      </WatchHero>

      <div className="device-compact-card">
        <p className="device-section-label">答题进度</p>
        <Progress percent={Math.round((currentIndex / selectedQuestions.length) * 100)} showInfo={false} strokeColor="#2f6bff" />
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">当前题目</p>
        <div className="device-mini-item">
          <div className="device-mini-item-title">
            <span>{currentQuestion.title}</span>
          </div>
          <Radio.Group value={answers[currentQuestion.id]} style={{ width: '100%' }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {currentQuestion.options.map((option, index) => (
                <Button key={option} block onClick={() => handleAnswer(currentQuestion.id, optionValueMap[index] ?? 6)}>
                  {option}
                </Button>
              ))}
            </Space>
          </Radio.Group>
          <Paragraph type="secondary" style={{ margin: '10px 0 0', fontSize: 11 }}>
            如果 60 秒内没有作答，系统会自动选择默认答案并进入下一题。
          </Paragraph>
        </div>
      </div>

      <div className="device-action-row">
        <Button icon={<AudioOutlined />} disabled block>语音作答（即将支持）</Button>
        <Link href="/growth/self-test">
          <Button block>返回选择</Button>
        </Link>
      </div>
    </div>
  );
}
