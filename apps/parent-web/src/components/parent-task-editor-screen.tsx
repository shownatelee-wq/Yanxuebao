'use client';

import '@ant-design/v5-patch-for-react-19';
import { ArrowLeftOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Form, Input, InputNumber, Select, Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getStoredSession } from '../lib/api';
import {
  CAPABILITY_PLANES,
  useParentStore,
  type CustomTaskInput,
  type RequirementType,
} from '../lib/parent-store';

const TASK_TYPES = ['观察记录', '问答任务', '调查任务', '创作任务', '商业体验'];

const REQUIREMENT_OPTIONS: Array<{ label: string; value: RequirementType }> = [
  { label: '文本', value: 'text' },
  { label: '选择', value: 'choice' },
  { label: '判断', value: 'judge' },
  { label: '图片', value: 'image' },
];

const CAPABILITY_OPTIONS = CAPABILITY_PLANES.flatMap((plane) => plane.elements);

export function ParentTaskEditorScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useParentStore();
  const [sessionReady, setSessionReady] = useState(false);
  const [form] = Form.useForm<CustomTaskInput>();

  const taskId = searchParams.get('taskId');
  const editingTask = useMemo(
    () => (taskId ? store.state.familyTasks.find((task) => task.id === taskId) ?? null : null),
    [store.state.familyTasks, taskId],
  );

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    setSessionReady(true);
  }, [router]);

  useEffect(() => {
    if (!store.hydrated) {
      return;
    }

    if (editingTask) {
      form.setFieldsValue({
        title: editingTask.title,
        base: editingTask.base,
        taskType: editingTask.taskType,
        studyDate: editingTask.studyDate,
        points: editingTask.points,
        description: editingTask.description,
        capabilityTags: editingTask.capabilityTags,
        requirements: editingTask.requirements.map((item) => ({ type: item.type, requirement: item.requirement })),
      });
      return;
    }

    form.setFieldsValue({
      title: '',
      base: '',
      taskType: '观察记录',
      studyDate: new Date().toISOString().slice(0, 10),
      points: 15,
      description: '',
      capabilityTags: ['问题解决'],
      requirements: [{ type: 'text', requirement: '' }],
    });
  }, [editingTask, form, store.hydrated]);

  function goBack() {
    router.push('/family-tasks');
  }

  function saveTask(values: CustomTaskInput) {
    const normalized = {
      ...values,
      points: Number(values.points),
      capabilityTags: values.capabilityTags ?? [],
      requirements: values.requirements ?? [],
    };

    if (editingTask) {
      store.updateTask(editingTask.id, normalized);
      router.push('/family-tasks?flash=task_updated');
      return;
    }

    const createdTaskId = store.createCustomTask(normalized);
    router.push(`/family-tasks?flash=task_created&selectTaskId=${createdTaskId}`);
  }

  if (!sessionReady || !store.hydrated) {
    return (
      <main className="parent-app-bg">
        <div className="parent-phone">
          <div className="parent-loading">
            <Spin />
            <span>正在进入任务编辑页</span>
          </div>
        </div>
      </main>
    );
  }

  if (taskId && !editingTask) {
    return (
      <main className="parent-app-bg">
        <div className="parent-phone">
          <div className="parent-subpage-shell">
            <header className="parent-subpage-header">
              <Button aria-label="返回任务列表" icon={<ArrowLeftOutlined />} shape="circle" onClick={goBack} />
              <div className="parent-subpage-title">
                <span>家庭研学任务</span>
                <strong>编辑任务</strong>
              </div>
              <span className="parent-subpage-spacer" aria-hidden />
            </header>
            <div className="parent-subpage-content">
              <section className="parent-empty-guide">
                <Empty description="没有找到要编辑的任务" />
                <Button type="primary" onClick={goBack}>返回任务列表</Button>
              </section>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="parent-app-bg">
      <div className="parent-phone">
        <div className="parent-subpage-shell">
          <header className="parent-subpage-header">
            <Button aria-label="返回任务列表" icon={<ArrowLeftOutlined />} shape="circle" onClick={goBack} />
            <div className="parent-subpage-title">
              <span>家庭研学任务</span>
              <strong>{editingTask ? '编辑任务' : '自定义创建'}</strong>
            </div>
            <span className="parent-subpage-spacer" aria-hidden />
          </header>

          <div className="parent-subpage-content">
            <section className="parent-editor-intro">
              <strong>{editingTask ? '修改任务内容' : '创建新的家庭任务'}</strong>
              <span>完整填写后可以返回任务页继续下发给学员。</span>
            </section>

            <Form form={form} layout="vertical" onFinish={saveTask} className="parent-editor-form">
              <Form.Item name="title" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
                <Input placeholder="例如 海洋动物观察记录" />
              </Form.Item>

              <Form.Item name="base" label="研学基地" rules={[{ required: true, message: '请输入研学基地' }]}>
                <Input placeholder="例如 深圳海洋馆 / 家庭厨房" />
              </Form.Item>

              <Form.Item name="taskType" label="任务类型" rules={[{ required: true, message: '请选择任务类型' }]}>
                <Select options={TASK_TYPES.map((item) => ({ label: item, value: item }))} />
              </Form.Item>

              <div className="parent-editor-grid">
                <Form.Item name="studyDate" label="研学日期" rules={[{ required: true, message: '请选择日期' }]}>
                  <Input type="date" />
                </Form.Item>

                <Form.Item name="points" label="任务分值" rules={[{ required: true, message: '请输入分值' }]}>
                  <InputNumber min={1} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </div>

              <Form.Item name="capabilityTags" label="关联能力元素">
                <Select mode="multiple" options={CAPABILITY_OPTIONS.map((item) => ({ label: item, value: item }))} />
              </Form.Item>

              <Form.Item name="description" label="任务说明" rules={[{ required: true, message: '请输入任务说明' }]}>
                <Input.TextArea rows={5} maxLength={500} placeholder="说明任务目的、步骤和作品要求。" />
              </Form.Item>

              <section className="parent-editor-requirements">
                <div className="parent-section-head">
                  <strong>作品项</strong>
                  <span>按 PDF 模型补充作品要求</span>
                </div>
                <Form.List name="requirements">
                  {(fields, { add, remove }) => (
                    <div className="parent-requirement-list editor">
                      {fields.map((field) => (
                        <div key={field.key} className="parent-requirement-row editor">
                          <Form.Item name={[field.name, 'type']} rules={[{ required: true, message: '请选择类型' }]}>
                            <Select options={REQUIREMENT_OPTIONS} />
                          </Form.Item>
                          <Form.Item name={[field.name, 'requirement']} rules={[{ required: true, message: '请输入作品要求' }]}>
                            <Input placeholder="例如 上传 1 张观察照片并写 80 字记录" />
                          </Form.Item>
                          <Button
                            aria-label="删除作品项"
                            icon={<CloseOutlined />}
                            shape="circle"
                            htmlType="button"
                            onClick={() => remove(field.name)}
                          />
                        </div>
                      ))}
                      <Button block icon={<PlusOutlined />} htmlType="button" onClick={() => add({ type: 'text', requirement: '' })}>
                        添加作品项
                      </Button>
                    </div>
                  )}
                </Form.List>
              </section>
            </Form>
          </div>

          <div className="parent-editor-footer">
            <Button block type="primary" onClick={() => form.submit()}>
              保存任务
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
