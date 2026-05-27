'use client';

import '@ant-design/v5-patch-for-react-19';
import { CheckCircleOutlined, RadarChartOutlined } from '@ant-design/icons';
import { Button, Empty, Slider, Tag, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { TALENT_TEST_QUESTIONS, useParentStore } from '../lib/parent-store';

const INITIAL_ANSWERS = TALENT_TEST_QUESTIONS.reduce<Record<string, number>>((result, question) => {
  result[question.id] = 3;
  return result;
}, {});

export function ParentTalentTestScreen() {
  const router = useRouter();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [answers, setAnswers] = useState<Record<string, number>>(INITIAL_ANSWERS);

  const result = useMemo(() => {
    const ranked = [...TALENT_TEST_QUESTIONS].sort((left, right) => (answers[right.id] ?? 0) - (answers[left.id] ?? 0));
    const primary = ranked[0];
    const secondary = ranked[1] ?? ranked[0];
    const interestTags = ranked
      .filter((question) => (answers[question.id] ?? 0) >= 4)
      .flatMap((question) => question.interestTags);
    return {
      primaryTalent: primary?.talent ?? '自然观察智能',
      secondaryTalent: secondary?.talent ?? '逻辑-数理智能',
      interestTags: Array.from(new Set(interestTags.length ? interestTags : ranked.slice(0, 2).flatMap((question) => question.interestTags))),
    };
  }, [answers]);

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入天赋测试" />;
  }

  if (!store.selectedStudent) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="免费天赋测试" subtitle="能力" onBack={() => router.push('/growth')}>
          {contextHolder}
          <section className="parent-empty-guide onboarding">
            <Empty description="请先添加学员后再进行天赋测试" />
            <Button type="primary" onClick={() => router.push('/me/students/editor')}>
              添加学员
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  function submitTest() {
    if (!store.selectedStudent) {
      return;
    }
    store.completeTalentTest(store.selectedStudent.id, {
      strongestTalent: result.primaryTalent,
      secondaryTalent: result.secondaryTalent,
      interestTags: result.interestTags,
      answers,
    });
    messageApi.success('天赋测试结果已生成');
    router.push('/growth/path?from=talent-test');
  }

  return (
    <ParentPhoneFrame>
      {contextHolder}
      <ParentSubpageShell
        title="免费天赋测试"
        subtitle={store.selectedStudent.name}
        onBack={() => router.push('/growth')}
        footer={
          <Button block type="primary" icon={<CheckCircleOutlined />} onClick={submitTest}>
            生成天赋报告
          </Button>
        }
      >
        <section className="parent-editor-intro">
          <strong>多元智能天赋测试</strong>
          <span>请根据孩子日常表现打分，结果会同步到个性化成长路径。</span>
        </section>

        <section className="parent-section parent-talent-result-panel">
          <div className="parent-section-head">
            <strong>实时预测</strong>
            <RadarChartOutlined />
          </div>
          <div className="parent-result-grid">
            <div>
              <span>优势天赋</span>
              <strong>{result.primaryTalent}</strong>
            </div>
            <div>
              <span>辅助天赋</span>
              <strong>{result.secondaryTalent}</strong>
            </div>
          </div>
          <div className="parent-tag-row">
            {result.interestTags.slice(0, 6).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </section>

        <section className="parent-card-list">
          {TALENT_TEST_QUESTIONS.map((question) => (
            <article key={question.id} className="parent-test-question-card">
              <div className="parent-test-question-head">
                <strong>{question.title}</strong>
                <Tag color={(answers[question.id] ?? 3) >= 4 ? 'green' : 'default'}>{answers[question.id] ?? 3} 分</Tag>
              </div>
              <p>{question.description}</p>
              <Slider
                min={1}
                max={5}
                marks={{ 1: '弱', 3: '中', 5: '强' }}
                value={answers[question.id] ?? 3}
                onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
              />
            </article>
          ))}
        </section>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
