'use client';

import { InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Form, Input, InputNumber, Select, Space, Table, Tag, Typography, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch, uploadFile } from '../../../lib/api';

type Student = { id: string; name: string };
type Task = { id: string; title: string; status: string; dueAt?: string; taskType: string };
type Score = { id: string; taskTitle?: string; status: string; aiScore?: number; tutorScore?: number };
type UploadResult = { file: { publicUrl: string; originalName: string } };

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

export default function ParentFamilyTasksPage() {
  const [createForm] = Form.useForm();
  const [submitForm] = Form.useForm();
  const [scoreForm] = Form.useForm();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [uploadList, setUploadList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [confirmingScore, setConfirmingScore] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const selectedStudent = useMemo(
    () => students.find((item) => item.id === selectedStudentId) ?? students[0],
    [selectedStudentId, students],
  );

  async function loadStudents() {
    setLoading(true);
    try {
      const list = await apiFetch<Student[]>('/students');
      setStudents(list);
      if (!selectedStudentId && list[0]) {
        setSelectedStudentId(list[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadTaskData(studentId: string) {
    const [taskList, scoreList] = await Promise.all([
      apiFetch<Task[]>(`/tasks?studentId=${studentId}`),
      apiFetch<Score[]>(`/scores?studentId=${studentId}`),
    ]);
    setTasks(taskList);
    setScores(scoreList);
  }

  async function createTask(values: { title: string; description: string; taskType: string }) {
    if (!selectedStudent) {
      messageApi.warning('请先选择学员');
      return;
    }

    try {
      setCreatingTask(true);
      await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          studentId: selectedStudent.id,
        }),
      });
      messageApi.success('家庭任务已创建');
      createForm.resetFields();
      await loadTaskData(selectedStudent.id);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '创建家庭任务失败');
    } finally {
      setCreatingTask(false);
    }
  }

  async function submitWork(values: { taskId: string; content?: string; type: string }) {
    if (!selectedStudent) {
      messageApi.warning('请先选择学员');
      return;
    }

    try {
      setSubmittingWork(true);
      let content = values.content ?? '';
      if (uploadList[0]?.originFileObj) {
        const uploaded = await uploadFile<UploadResult>(uploadList[0].originFileObj as File, {
          studentId: selectedStudent.id,
        });
        content = content
          ? `${content}\n附件：${uploaded.file.originalName} (${uploaded.file.publicUrl})`
          : `${uploaded.file.originalName} (${uploaded.file.publicUrl})`;
      }
      await apiFetch('/works', {
        method: 'POST',
        body: JSON.stringify({
          taskId: values.taskId,
          studentId: selectedStudent.id,
          type: values.type,
          content,
        }),
      });
      messageApi.success('家庭作品已提交');
      submitForm.resetFields();
      setUploadList([]);
      await loadTaskData(selectedStudent.id);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '提交作品失败');
    } finally {
      setSubmittingWork(false);
    }
  }

  async function confirmScore(values: { scoreId: string; tutorScore: number; comment?: string }) {
    if (!selectedStudent) {
      return;
    }

    try {
      setConfirmingScore(true);
      await apiFetch('/scores/confirm', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      messageApi.success('已完成家长评分确认');
      scoreForm.resetFields();
      await loadTaskData(selectedStudent.id);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '评分失败');
    } finally {
      setConfirmingScore(false);
    }
  }

  useEffect(() => {
    loadStudents().catch((error) => {
      messageApi.error(error instanceof Error ? error.message : '加载学员失败');
    });
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadTaskData(selectedStudentId).catch((error) => {
        messageApi.error(error instanceof Error ? error.message : '加载家庭任务失败');
      });
    }
  }, [selectedStudentId]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Title level={3} style={{ margin: 0 }}>
        家庭研学任务
      </Title>
      <Paragraph type="secondary" style={{ margin: 0 }}>
        支持家长创建任务、模拟作品提交与确认评分，完成家庭研学闭环。
      </Paragraph>
      <Card loading={loading} extra={<Button type="link" icon={<ReloadOutlined />} onClick={() => void loadStudents()}>刷新</Button>}>
        {students.length > 0 ? (
          <Select
            style={{ width: 320 }}
            placeholder="请选择学员"
            value={selectedStudent?.id}
            onChange={setSelectedStudentId}
            options={students.map((student) => ({ label: student.name, value: student.id }))}
          />
        ) : (
          <Empty description="请先创建学员后再发起家庭任务" />
        )}
      </Card>
      <Card title="创建家庭任务">
        <Form form={createForm} layout="inline" onFinish={createTask}>
          <Form.Item name="title" rules={[{ required: true, message: '请输入任务标题' }]}>
            <Input placeholder="任务标题" />
          </Form.Item>
          <Form.Item name="description" rules={[{ required: true, message: '请输入任务说明' }]}>
            <Input placeholder="任务说明" />
          </Form.Item>
          <Form.Item name="taskType" initialValue="check_in">
            <Select
              style={{ width: 160 }}
              options={[
                { label: '打卡任务', value: 'check_in' },
                { label: '问答任务', value: 'qa' },
                { label: '创作任务', value: 'creation' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={creatingTask}>
            创建任务
          </Button>
        </Form>
      </Card>
      <Card title="模拟提交作品">
        <Form form={submitForm} layout="vertical" onFinish={submitWork}>
          <Form.Item name="taskId" rules={[{ required: true, message: '请选择任务' }]}>
            <Select
              placeholder="选择任务"
              options={tasks.map((task) => ({ label: task.title, value: task.id }))}
            />
          </Form.Item>
          <Form.Item name="type" initialValue="text">
            <Select
              options={[
                { label: '文本', value: 'text' },
                { label: '图片', value: 'image' },
                { label: '音频', value: 'audio' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="content"
            rules={[
              {
                validator: async (_, value) => {
                  if (value || uploadList.length > 0) {
                    return;
                  }
                  throw new Error('请输入作品内容或上传附件');
                },
              },
            ]}
          >
            <Input.TextArea placeholder="作品内容" rows={3} />
          </Form.Item>
          <Form.Item label="附件上传">
            <Dragger
              beforeUpload={() => false}
              multiple={false}
              fileList={uploadList}
              onChange={({ fileList }) => setUploadList(fileList.slice(-1))}
              accept="image/*,audio/*"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">可上传图片或音频作为家庭任务作品</p>
            </Dragger>
          </Form.Item>
          <Button htmlType="submit" loading={submittingWork}>
            提交作品
          </Button>
        </Form>
      </Card>
      <Card title="家庭任务列表">
        {tasks.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={tasks}
            pagination={false}
            columns={[
              { title: '任务标题', dataIndex: 'title' },
              { title: '类型', dataIndex: 'taskType' },
              { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color="blue">{value}</Tag> },
              { title: '截止时间', dataIndex: 'dueAt', render: (value?: string) => value ?? '-' },
            ]}
          />
        ) : (
          <Empty description="当前学员暂无家庭任务" />
        )}
      </Card>
      <Card title="评分确认">
        <Form form={scoreForm} layout="inline" onFinish={confirmScore}>
          <Form.Item name="scoreId" rules={[{ required: true, message: '请选择评分项' }]}>
            <Select
              style={{ width: 320 }}
              placeholder="选择评分项"
              options={scores.map((score) => ({
                label: `${score.taskTitle ?? score.id} · ${score.status}`,
                value: score.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="tutorScore" rules={[{ required: true, message: '请输入评分' }]}>
            <InputNumber min={0} max={10} step={0.5} placeholder="分数" />
          </Form.Item>
          <Form.Item name="comment">
            <Input placeholder="评价意见" style={{ width: 280 }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={confirmingScore}>
            确认评分
          </Button>
        </Form>
        {scores.length === 0 ? <Empty description="暂无待确认评分" style={{ marginTop: 24 }} /> : null}
      </Card>
    </Space>
  );
}
