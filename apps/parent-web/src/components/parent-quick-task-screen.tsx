'use client';

import '@ant-design/v5-patch-for-react-19';
import { CheckCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { CAPABILITY_PLANES, TASK_LIBRARY, useParentStore } from '../lib/parent-store';

const TASK_TYPES = ['观察记录', '问答任务', '调查任务', '创作任务', '商业体验'];
const CAPABILITY_OPTIONS = CAPABILITY_PLANES.flatMap((plane) => plane.elements);

export function ParentQuickTaskScreen() {
  const router = useRouter();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const [form] = Form.useForm();
  const [createdTaskIds, setCreatedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    if (!store.hydrated) {
      return;
    }
    form.setFieldsValue({
      studyDate: new Date().toISOString().slice(0, 10),
      destination: '深圳海洋馆',
      taskTypes: ['观察记录'],
      capabilityTags: ['问题解决', '科技应用'],
      templateIds: TASK_LIBRARY.slice(0, 2).map((item) => item.id),
    });
  }, [form, store.hydrated]);

  function submitQuickTask(values: {
    studyDate: string;
    destination: string;
    taskTypes?: string[];
    capabilityTags?: string[];
    templateIds?: string[];
  }) {
    const taskIds = store.createTasksFromTemplates({
      studyDate: values.studyDate,
      destination: values.destination,
      taskTypes: values.taskTypes ?? [],
      capabilityTags: values.capabilityTags ?? [],
      templateIds: values.templateIds ?? [],
    });
    setCreatedTaskIds(taskIds);
  }

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入 AI 创建任务" />;
  }

  if (!store.selectedStudent) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell title="AI 创建任务" subtitle="任务" onBack={() => router.push('/family-tasks')}>
          <section className="parent-empty-guide onboarding">
            <RocketOutlined />
            <strong>先添加学员再创建任务</strong>
            <p>家庭研学任务会绑定到学员成长记录里，没有学员时无法完成创建和下发。</p>
            <Button type="primary" onClick={() => router.push('/me/students/editor')}>
              去添加学员
            </Button>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  if (createdTaskIds.length) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell
          title="创建完成"
          subtitle="任务"
          onBack={() => router.push('/family-tasks')}
          footer={
            <div className="parent-split-footer">
              <Button block onClick={() => setCreatedTaskIds([])}>
                继续创建
              </Button>
              <Button block type="primary" onClick={() => router.push(`/family-tasks?selectTaskId=${createdTaskIds[0]}`)}>
                查看任务
              </Button>
            </div>
          }
        >
          <section className="parent-success-panel">
            <CheckCircleOutlined />
            <strong>AI 已生成家庭任务</strong>
            <span>本次共创建 {createdTaskIds.length} 个任务草稿，回到任务页后可继续编辑并下发给学员。</span>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title="AI 创建任务"
        subtitle="任务"
        onBack={() => router.push('/family-tasks')}
        footer={
          <Button block type="primary" onClick={() => form.submit()}>
            生成家庭任务
          </Button>
        }
      >
        <section className="parent-editor-intro">
          <strong>快速匹配家庭研学任务</strong>
          <span>根据日期、目的地、任务类型和能力元素，从本地任务库里匹配可直接使用的任务模板。</span>
        </section>

        <Form form={form} layout="vertical" onFinish={submitQuickTask} className="parent-editor-form">
          <Form.Item name="studyDate" label="研学日期" rules={[{ required: true, message: '请选择日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="destination" label="研学目的地" rules={[{ required: true, message: '请输入目的地' }]}>
            <Input placeholder="例如 深圳海洋馆 / 社区公园" />
          </Form.Item>
          <Form.Item name="taskTypes" label="任务类型">
            <Checkbox.Group options={TASK_TYPES} />
          </Form.Item>
          <Form.Item name="capabilityTags" label="能力元素">
            <Select mode="multiple" options={CAPABILITY_OPTIONS.map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item name="templateIds" label="匹配任务" rules={[{ required: true, message: '请至少选择一个任务' }]}>
            <Checkbox.Group className="parent-template-checks">
              {TASK_LIBRARY.map((template) => (
                <Checkbox key={template.id} value={template.id}>
                  <span>{template.title}</span>
                  <em>
                    {template.base} · {template.taskType}
                  </em>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
