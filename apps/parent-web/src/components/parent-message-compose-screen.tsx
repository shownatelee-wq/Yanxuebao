'use client';

import '@ant-design/v5-patch-for-react-19';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ParentRouteFallback } from './parent-route-fallback';
import { ParentPhoneFrame, ParentSubpageShell, useParentSessionReady } from './parent-mobile-shell';
import { useParentStore, type MessageInput } from '../lib/parent-store';

export function ParentMessageComposeScreen() {
  const router = useRouter();
  const sessionReady = useParentSessionReady();
  const store = useParentStore();
  const [form] = Form.useForm<MessageInput>();
  const [sent, setSent] = useState(false);

  function submitMessage(values: MessageInput) {
    store.addMessage({
      ...values,
      studentId: values.scope === 'student' ? store.selectedStudent?.id : undefined,
    });
    setSent(true);
  }

  if (!sessionReady || !store.hydrated) {
    return <ParentRouteFallback label="正在进入消息发送" />;
  }

  if (sent) {
    return (
      <ParentPhoneFrame>
        <ParentSubpageShell
          title="发送完成"
          subtitle="我的"
          onBack={() => router.push('/messages')}
          footer={
            <div className="parent-split-footer">
              <Button block onClick={() => setSent(false)}>
                再发一条
              </Button>
              <Button block type="primary" onClick={() => router.push('/messages')}>
                查看消息
              </Button>
            </div>
          }
        >
          <section className="parent-success-panel">
            <CheckCircleOutlined />
            <strong>消息已发送</strong>
            <span>本地演示消息已经写入消息中心，可在首页提醒区或消息中心页面查看。</span>
          </section>
        </ParentSubpageShell>
      </ParentPhoneFrame>
    );
  }

  return (
    <ParentPhoneFrame>
      <ParentSubpageShell
        title="发送消息"
        subtitle="我的"
        onBack={() => router.push('/messages')}
        footer={
          <Button block type="primary" onClick={() => form.submit()}>
            发送消息
          </Button>
        }
      >
        <section className="parent-editor-intro">
          <strong>发送一条演示消息</strong>
          <span>支持团队广播、小组广播、学员消息和系统消息，都会写入本地 mock 数据。</span>
        </section>

        <Form form={form} layout="vertical" onFinish={submitMessage} initialValues={{ type: 'direct', scope: 'student' }} className="parent-editor-form">
          <Form.Item name="type" label="消息类型">
            <Select
              options={[
                { label: '团队广播', value: 'team_broadcast' },
                { label: '小组广播', value: 'group_broadcast' },
                { label: '学员消息', value: 'direct' },
                { label: '系统消息', value: 'system' },
              ]}
            />
          </Form.Item>
          <Form.Item name="scope" label="发送范围">
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value="team">团队</Radio.Button>
              <Radio.Button value="group">小组</Radio.Button>
              <Radio.Button value="student">学员</Radio.Button>
              <Radio.Button value="system">系统</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="例如 家庭研学集合提醒" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={5} placeholder="例如 18:30 前上传作品，家长端会同步收到。" />
          </Form.Item>
        </Form>
      </ParentSubpageShell>
    </ParentPhoneFrame>
  );
}
