'use client';

import '@ant-design/v5-patch-for-react-19';
import { BookOutlined, CompassOutlined, ReadOutlined, RocketOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Empty, Progress, Tag, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { getCapabilityOverview, TASK_LIBRARY, useParentStore } from '../lib/parent-store';

function talentMission(talent: string) {
  if (talent.includes('自然')) return '把观察力转化为持续探究和环保表达';
  if (talent.includes('逻辑')) return '把推理优势转化为问题解决和项目规划';
  if (talent.includes('语言')) return '把表达优势转化为研学讲述和观点输出';
  if (talent.includes('空间')) return '把空间想象转化为模型设计和创意表达';
  return '把优势天赋转化为可持续的研学任务成果';
}

export function ParentGrowthPathScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const [messageApi, contextHolder] = message.useMessage();
  const fromTalentTest = searchParams.get('from') === 'talent-test';

  const path = useMemo(() => {
    const student = store.selectedStudent;
    const overview = getCapabilityOverview(student);
    const primaryWeakness = overview.weakest[0];
    const secondaryWeakness = overview.weakest[1] ?? primaryWeakness;
    const strongest = overview.strongest[0];
    const interests = student?.interestProfile.studentTags.slice(0, 4) ?? [];
    const matchedTask =
      TASK_LIBRARY.find((task) => task.capabilityTags.some((tag) => tag === primaryWeakness?.elementKey || interests.includes(tag))) ??
      TASK_LIBRARY[0];
    return {
      overview,
      primaryWeakness,
      secondaryWeakness,
      strongest,
      interests,
      matchedTask,
      phaseGoal: primaryWeakness
        ? `未来 30 天优先提升「${primaryWeakness.elementKey}」，同时保持「${strongest?.elementKey ?? '优势能力'}」稳定输出。`
        : '未来 30 天完成一次天赋测试和一次家庭研学任务。',
    };
  }, [store.selectedStudent]);

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在生成成长路径" />;
  }

  if (!store.selectedStudent) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="个性化成长路径" subtitle="能力智能体" onBack={() => router.push('/growth')}>
          {contextHolder}
          <section className="parent-empty-guide onboarding">
            <Empty description="请先添加学员后再生成成长路径" />
            <Button type="primary" onClick={() => router.push('/me/students/editor')}>
              添加学员
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  function createRecommendedTask() {
    const task = path.matchedTask;
    const createdTaskId = store.createCustomTask({
      title: `${task.title}（成长路径推荐）`,
      base: task.base,
      taskType: task.taskType,
      studyDate: new Date().toISOString().slice(0, 10),
      points: task.points,
      description: `${task.description} 本任务由个性化能力成长智能体推荐，用于提升 ${path.primaryWeakness?.elementKey ?? task.capabilityTags[0]}。`,
      capabilityTags: Array.from(new Set([path.primaryWeakness?.elementKey, path.secondaryWeakness?.elementKey, ...task.capabilityTags].filter(Boolean))) as string[],
      requirements: task.requirements.map((item) => ({ type: item.type, requirement: item.requirement })),
    });
    messageApi.success('已生成家庭任务草稿');
    router.push(`/family-tasks?flash=task_created&selectTaskId=${createdTaskId}`);
  }

  function createOrder(type: '团队报名' | '专家课程') {
    const orderId = store.createOrder({
      type,
      title: type === '团队报名' ? '个性化推荐团体研学旅行报名' : '个性化推荐专家课程',
      amount: type === '团队报名' ? 398 : 99,
      status: type === '团队报名' ? '待缴费' : '待支付',
      productName: type === '团队报名' ? '团体研学旅行' : '专家课程',
      sourceLabel: '个性化能力成长智能体',
      description:
        type === '团队报名'
          ? `围绕 ${path.primaryWeakness?.elementKey ?? '能力提升'} 推荐的线下团体研学旅行，可选择学员后模拟报名缴费。`
          : `围绕 ${store.selectedStudent?.talentProfile.strongestTalent ?? '天赋优势'} 推荐的专家课程，可核实学员信息后模拟购买。`,
      studentId: store.selectedStudent?.id,
      enrollmentStudentId: store.selectedStudent?.id,
      receiver: store.state.parentProfile.name,
      phone: store.state.parentProfile.phone,
    });
    router.push(`/home?orderId=${orderId}`);
  }

  return (
    <ParentPhoneFrame>
      {contextHolder}
      <ParentSubpageShell
        title="个性化成长路径"
        subtitle={store.selectedStudent.name}
        onBack={() => router.push('/growth')}
        rightSlot={
          <Button size="small" onClick={() => router.push('/growth/talent-test')}>
            天赋测试
          </Button>
        }
      >
        {fromTalentTest ? (
          <section className="parent-success-panel compact">
            <RocketOutlined />
            <strong>天赋测试已接入成长路径</strong>
            <span>智能体已根据最新天赋与兴趣重新生成建议。</span>
          </section>
        ) : null}

        <section className="parent-growth-agent-hero">
          <span>个性化能力成长智能体</span>
          <strong>{talentMission(store.selectedStudent.talentProfile.strongestTalent)}</strong>
          <p>{path.phaseGoal}</p>
          <div className="parent-tag-row">
            <Tag color="green">{store.selectedStudent.talentProfile.strongestTalent}</Tag>
            {path.interests.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </section>

        <section className="parent-section">
          <div className="parent-section-head">
            <strong>成长诊断</strong>
            <span>{path.overview.currentIndex.toFixed(1)} / 10</span>
          </div>
          <Progress percent={Math.round(path.overview.currentIndex * 10)} strokeColor="#167c80" trailColor="#dce7e2" />
          <div className="parent-path-diagnosis-grid">
            <div>
              <span>优势保持</span>
              <strong>{path.strongest?.elementKey ?? '待评测'}</strong>
              <em>{path.strongest?.score.toFixed(1) ?? '-'}</em>
            </div>
            <div>
              <span>优先提升</span>
              <strong>{path.primaryWeakness?.elementKey ?? '待评测'}</strong>
              <em>{path.primaryWeakness?.score.toFixed(1) ?? '-'}</em>
            </div>
          </div>
        </section>

        <section className="parent-section parent-path-stage">
          <div className="parent-section-head">
            <strong>阶段路径</strong>
            <CompassOutlined />
          </div>
          {['第 1 周：完成一次家庭观察任务', '第 2-3 周：参加团体研学或专家课', '第 4 周：提交作品并查看能力提升雷达'].map((item) => (
            <div key={item} className="parent-path-step">
              <span />
              <strong>{item}</strong>
            </div>
          ))}
        </section>

        <section className="parent-card-list">
          <article className="parent-recommend-card">
            <RocketOutlined />
            <div>
              <strong>{path.matchedTask.title}</strong>
              <span>{path.matchedTask.description}</span>
              <em>{path.matchedTask.base} · {path.matchedTask.capabilityTags.join('、')}</em>
            </div>
            <Button type="primary" onClick={createRecommendedTask}>
              生成任务
            </Button>
          </article>

          <article className="parent-recommend-card">
            <TeamOutlined />
            <div>
              <strong>团体研学旅行推荐</strong>
              <span>选择与能力短板匹配的真实场景，完成同伴协作和导师评价。</span>
              <em>推荐方向：{path.primaryWeakness?.elementKey ?? '综合能力'} · 398 元</em>
            </div>
            <Button onClick={() => createOrder('团队报名')}>报名</Button>
          </article>

          <article className="parent-recommend-card">
            <BookOutlined />
            <div>
              <strong>专家课程推荐</strong>
              <span>用专家课程补充知识框架，再把课程内容转化为家庭任务。</span>
              <em>推荐方向：{store.selectedStudent.talentProfile.strongestTalent} · 99 元</em>
            </div>
            <Button onClick={() => createOrder('专家课程')} icon={<ReadOutlined />}>
              购买
            </Button>
          </article>
        </section>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
