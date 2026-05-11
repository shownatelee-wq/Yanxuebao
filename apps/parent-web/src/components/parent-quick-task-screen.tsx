'use client';

import '@ant-design/v5-patch-for-react-19';
import { CheckCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select, message } from 'antd';
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
  const [aiPrompt, setAiPrompt] = useState('我想带孩子去深圳海洋馆做一次亲子研学，希望提升问题解决、科技应用和语言沟通。');
  const [analysisText, setAnalysisText] = useState('已识别：地点/场景=深圳海洋馆；主题=海洋动物观察；能力目标=问题解决、科技应用、语言沟通。');

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

  function analyzePrompt() {
    const nextDestination = aiPrompt.includes('公园') ? '社区公园' : aiPrompt.includes('厨房') ? '家庭厨房' : '深圳海洋馆';
    const nextCapabilities = aiPrompt.includes('表达') ? ['语言沟通', '人文审美'] : ['问题解决', '科技应用', '语言沟通'];
    form.setFieldsValue({
      destination: nextDestination,
      capabilityTags: nextCapabilities,
      templateIds: TASK_LIBRARY.filter((template) => template.base === nextDestination || nextCapabilities.some((tag) => template.capabilityTags.includes(tag)))
        .slice(0, 5)
        .map((template) => template.id),
    });
    setAnalysisText(`已识别：地点/场景=${nextDestination}；检索关键字=${nextCapabilities.join('、')}；最多展示 30 条，本地任务库当前命中 ${
      TASK_LIBRARY.length
    } 条。`);
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
          <strong>AI 对话式创建任务</strong>
          <span>用语音或文字描述研学地点、主题、目标和能力方向，智能体会提取条件并检索任务库。</span>
        </section>

        <section className="parent-section parent-ai-task-chat">
          <div className="parent-chat-bubble user">
            <Input.TextArea rows={4} value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} />
          </div>
          <div className="parent-action-row">
            <Button onClick={() => message.success('已模拟语音输入并转写到对话框')}>语音输入</Button>
            <Button type="primary" onClick={analyzePrompt}>
              分析并检索
            </Button>
          </div>
          <div className="parent-chat-bubble ai">{analysisText}</div>
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
