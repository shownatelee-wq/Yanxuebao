'use client';

import '@ant-design/v5-patch-for-react-19';
import { CheckCircleOutlined, RadarChartOutlined } from '@ant-design/icons';
import { Button, Empty, Form, Radio, Select } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { CAPABILITY_PLANES, getAssessmentQuestions, useParentStore, type CapabilityPlaneKey } from '../lib/parent-store';

const ASSESSMENT_OPTIONS = [
  { label: '非常符合', value: 10 },
  { label: '比较符合', value: 8 },
  { label: '一般', value: 6 },
  { label: '不太符合', value: 4 },
];

function getPlaneTitle(planeKey: CapabilityPlaneKey | 'all') {
  if (planeKey === 'all') {
    return '全面测试';
  }
  return CAPABILITY_PLANES.find((plane) => plane.key === planeKey)?.title ?? '家长评测';
}

export function ParentAssessmentScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const [form] = Form.useForm<Record<string, number>>();
  const [assessmentPlane, setAssessmentPlane] = useState<CapabilityPlaneKey | 'all'>('all');
  const [submittedPlane, setSubmittedPlane] = useState<CapabilityPlaneKey | 'all' | null>(null);

  const selectedStudent = store.selectedStudent;
  const planeKeyParam = searchParams.get('planeKey');
  const capabilityIdParam = searchParams.get('capabilityId');
  const preselectedPlane = useMemo(
    () => (CAPABILITY_PLANES.some((plane) => plane.key === planeKeyParam) ? (planeKeyParam as CapabilityPlaneKey) : 'all'),
    [planeKeyParam],
  );

  useEffect(() => {
    setAssessmentPlane(preselectedPlane);
  }, [preselectedPlane]);

  const backTarget = capabilityIdParam ? `/growth/capabilities/${capabilityIdParam}` : '/growth';

  function submitAssessment(values: Record<string, number>) {
    if (!selectedStudent) {
      return;
    }
    store.completeAssessment(selectedStudent.id, assessmentPlane, values);
    setSubmittedPlane(assessmentPlane);
  }

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入家长评测" />;
  }

  if (!selectedStudent) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="家长评测" subtitle="成长" onBack={() => router.push('/growth')}>
          <section className="parent-empty-guide onboarding">
            <RadarChartOutlined />
            <strong>先添加学员再做评测</strong>
            <p>家长评测会把结果归档到具体学员的成长记录与能力指数里。</p>
            <Button type="primary" onClick={() => router.push('/me/students/editor')}>
              去添加学员
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  if (submittedPlane) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell
          title="评测完成"
          subtitle="成长"
          onBack={() => router.push(backTarget)}
          footer={
            <div className="parent-split-footer">
              {capabilityIdParam ? (
                <>
                  <Button block onClick={() => router.push(backTarget)}>
                    返回能力详情
                  </Button>
                  <Button block type="primary" onClick={() => router.push('/growth?focus=reports')}>
                    查看评测记录
                  </Button>
                </>
              ) : (
                <>
                  <Button block onClick={() => router.push('/portfolio')}>
                    去看作品档案
                  </Button>
                  <Button block type="primary" onClick={() => router.push('/growth')}>
                    返回成长页
                  </Button>
                </>
              )}
            </div>
          }
        >
          <section className="parent-success-panel">
            <CheckCircleOutlined />
            <strong>评测报告已生成</strong>
            <span>
              {selectedStudent.name} 的 {getPlaneTitle(submittedPlane)} 家长评测已经写入能力档案。
            </span>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  const elementOptions =
    assessmentPlane === 'all'
      ? CAPABILITY_PLANES.flatMap((plane) => plane.elements)
      : CAPABILITY_PLANES.find((plane) => plane.key === assessmentPlane)?.elements ?? [];

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title="家长评测"
        subtitle="成长"
        onBack={() => router.push(backTarget)}
        footer={
          <Button block type="primary" onClick={() => form.submit()}>
            生成评测报告
          </Button>
        }
      >
        <section className="parent-editor-intro">
          <strong>为 {selectedStudent.name} 完成一次家长评测</strong>
          <span>可选择单个能力平面，也可以直接完成一轮全面测试。</span>
        </section>

        <div className="parent-card-list">
          <section className="parent-section">
            <div className="parent-section-head">
              <strong>评测范围</strong>
              <span>{elementOptions.length} 个能力元素</span>
            </div>
            <Select
              value={assessmentPlane}
              onChange={setAssessmentPlane}
              options={[
                { label: '全面测试', value: 'all' },
                ...CAPABILITY_PLANES.map((plane) => ({ label: plane.title, value: plane.key })),
              ]}
            />
          </section>

          <Form form={form} layout="vertical" onFinish={submitAssessment} className="parent-editor-form">
            {elementOptions.length ? (
              elementOptions.map((element) => (
                <section key={element} className="parent-assessment-group page">
                  <strong>{element}</strong>
                  {getAssessmentQuestions().map((question, index) => (
                    <Form.Item
                      key={`${element}_${index}`}
                      name={`${element}_${index}`}
                      label={question}
                      initialValue={index % 2 === 0 ? 8 : 10}
                      rules={[{ required: true, message: '请选择' }]}
                    >
                      <Radio.Group options={ASSESSMENT_OPTIONS} />
                    </Form.Item>
                  ))}
                </section>
              ))
            ) : (
              <section className="parent-empty-guide compact">
                <Empty description="当前没有可评测的能力元素" />
              </section>
            )}
          </Form>
        </div>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
