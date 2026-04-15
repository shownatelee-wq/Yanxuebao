'use client';

import { InboxOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Radio, Result, Space, Tag, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch, getStoredSession, uploadFile } from '../../../../lib/api';
import { type DemoWorkAnswer, type DemoWorkFormField, type DemoWorkMedia } from '../../../../lib/device-demo-data';
import { clearDemoDraft, getDemoDraft } from '../../../../lib/demo-draft';
import { getDeviceTaskWorkBySheetId, getSuggestedTaskSheet, upsertDeviceTaskWorkSubmission } from '../../../../lib/device-task-data';

type UploadResult = { file: { publicUrl: string; originalName: string; mimeType: string } };
type FormValues = Record<string, string | string[] | undefined>;

const { Dragger } = Upload;

function buildInitialValues(fields: DemoWorkFormField[], answers: DemoWorkAnswer[] | undefined, draftContent?: string | null) {
  const initialValues: FormValues = {};
  let draftFilled = false;

  fields.forEach((field) => {
    const answer = answers?.find((item) => item.fieldId === field.id);

    if (!answer && field.kind === 'fill_blank' && draftContent && !draftFilled) {
      initialValues[field.id] = draftContent;
      draftFilled = true;
      return;
    }

    if (answer && 'value' in answer) {
      initialValues[field.id] = answer.kind === 'single_choice' ? answer.value[0] : answer.value;
    }
  });

  return initialValues;
}

function buildUploadMap(fields: DemoWorkFormField[], answers: DemoWorkAnswer[] | undefined) {
  const nextMap: Record<string, UploadFile[]> = {};

  fields.forEach((field) => {
    if (!field.kind.includes('upload')) {
      return;
    }

    const answer = answers?.find((item) => item.fieldId === field.id && 'files' in item);
    nextMap[field.id] =
      answer && 'files' in answer
        ? answer.files.map((file) => ({
            uid: file.id,
            name: file.title,
            status: 'done',
            url: file.url,
          }))
        : [];
  });

  return nextMap;
}

export default function DeviceTaskNewPage() {
  const [form] = Form.useForm<FormValues>();
  const [uploadMap, setUploadMap] = useState<Record<string, UploadFile[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskIdFromQuery = searchParams.get('taskId') ?? undefined;
  const sheetIdFromQuery = searchParams.get('sheetId') ?? undefined;
  const draft = getDemoDraft();
  const session = getStoredSession();

  const suggested = useMemo(() => getSuggestedTaskSheet(taskIdFromQuery, sheetIdFromQuery), [taskIdFromQuery, sheetIdFromQuery]);
  const task = suggested?.task;
  const sheet = suggested?.sheet;
  const currentWork = useMemo(() => (sheet ? getDeviceTaskWorkBySheetId(sheet.id) : undefined), [sheet?.id]);

  useEffect(() => {
    if (!sheet) {
      return;
    }

    form.setFieldsValue(buildInitialValues(sheet.workForm, currentWork?.formAnswers, currentWork ? null : draft?.content ?? null));
    setUploadMap(buildUploadMap(sheet.workForm, currentWork?.formAnswers));
  }, [currentWork?.id, currentWork?.updatedAt, draft?.content, form, sheet?.id]);

  if (!task || !sheet) {
    return <Result status="404" title="未找到学习作品" extra={<Link href="/tasks"><Button>返回任务</Button></Link>} />;
  }

  const activeTask = task;
  const activeSheet = sheet;

  async function submitWork(values: FormValues) {
    if (!session?.user.studentId) {
      messageApi.error('当前缺少学员信息，请重新登录');
      return;
    }

    for (const field of activeSheet.workForm) {
      const required = field.required ?? true;
      if (required && field.kind.includes('upload') && !(uploadMap[field.id]?.length)) {
        messageApi.error(`请先完成“${field.label}”`);
        return;
      }
    }

    try {
      setSubmitting(true);

      const serializedParts: string[] = [];
      const formAnswers: DemoWorkAnswer[] = [];
      const collectedMedia: DemoWorkMedia[] = [];

      for (const field of activeSheet.workForm) {
        if (field.kind === 'fill_blank') {
          const value = String(values[field.id] ?? '').trim();
          serializedParts.push(`${field.label}：${value}`);
          formAnswers.push({ fieldId: field.id, kind: 'fill_blank', label: field.label, value });
          continue;
        }

        if (field.kind === 'single_choice') {
          const value = String(values[field.id] ?? '').trim();
          serializedParts.push(`${field.label}：${value}`);
          formAnswers.push({ fieldId: field.id, kind: 'single_choice', label: field.label, value: value ? [value] : [] });
          continue;
        }

        if (field.kind === 'multiple_choice') {
          const rawValue = values[field.id];
          const value = Array.isArray(rawValue) ? rawValue : [];
          serializedParts.push(`${field.label}：${value.join('、')}`);
          formAnswers.push({ fieldId: field.id, kind: 'multiple_choice', label: field.label, value });
          continue;
        }

        const uploadedFiles: DemoWorkMedia[] = [];
        for (const file of uploadMap[field.id] ?? []) {
          if (file.originFileObj) {
            const uploaded = await uploadFile<UploadResult>(file.originFileObj as File, { studentId: session.user.studentId! });
            uploadedFiles.push({
              id: `${field.id}-${file.uid}`,
              type: field.kind === 'image_upload' ? '照片' : '视频',
              title: uploaded.file.originalName,
              url: uploaded.file.publicUrl,
            });
          } else {
            uploadedFiles.push({
              id: `${field.id}-${file.uid}`,
              type: field.kind === 'image_upload' ? '照片' : '视频',
              title: file.name,
              url: file.url ?? '',
            });
          }
        }

        if (uploadedFiles.length) {
          serializedParts.push(`${field.label}：${uploadedFiles.map((item) => `${item.title} (${item.url})`).join('、')}`);
          formAnswers.push({ fieldId: field.id, kind: field.kind, label: field.label, files: uploadedFiles });
          collectedMedia.push(...uploadedFiles);
        }
      }

      const textAnswers = formAnswers
        .filter((item) => 'value' in item)
        .map((item) => `${item.label}：${Array.isArray(item.value) ? item.value.join('、') : item.value}`);
      const summary = textAnswers[0] ?? activeSheet.requirement;
      const textContent = textAnswers.join('\n');

      await apiFetch('/works', {
        method: 'POST',
        body: JSON.stringify({
          taskId: activeTask.id,
          studentId: session.user.studentId,
          type: activeSheet.mediaTypes.includes('视频') ? 'video' : activeSheet.mediaTypes.includes('照片') ? 'image' : 'text',
          content: serializedParts.join('\n'),
        }),
      });

      const nextWork = upsertDeviceTaskWorkSubmission({
        task: activeTask,
        sheet: activeSheet,
        formAnswers,
        media: collectedMedia,
        summary,
        textContent,
      });

      clearDemoDraft();
      messageApi.success('学习作品已提交');
      router.push(`/tasks/works/${nextWork.id}/self-review`);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '提交作品失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <p className="device-page-title">填写学习作品</p>
          <p className="device-page-subtle">{activeSheet.title}</p>
          <Space wrap>
            <Tag color="blue">{activeSheet.workCategory}</Tag>
            <Tag color="cyan">{activeSheet.workMode}</Tag>
            <Tag color="green">{activeTask.title}</Tag>
          </Space>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">填写要求</p>
        <p className="device-mini-item-desc" style={{ margin: 0 }}>{activeSheet.requirement}</p>
        {draft && !currentWork ? (
          <p className="device-mini-item-desc" style={{ marginTop: 8 }}>已自动导入最近草稿内容，可直接修改后提交。</p>
        ) : null}
      </div>

      <div className="device-compact-card">
        <Form form={form} layout="vertical" onFinish={submitWork}>
          {activeSheet.workForm.map((field) => {
            const required = field.required ?? true;

            if (field.kind === 'fill_blank') {
              return (
                <Form.Item
                  key={field.id}
                  name={field.id}
                  label={field.label}
                  rules={required ? [{ required: true, message: `请填写${field.label}` }] : []}
                  extra={field.helper}
                >
                  <Input.TextArea rows={3} placeholder={field.placeholder} />
                </Form.Item>
              );
            }

            if (field.kind === 'single_choice') {
              return (
                <Form.Item
                  key={field.id}
                  name={field.id}
                  label={field.label}
                  rules={required ? [{ required: true, message: `请选择${field.label}` }] : []}
                  extra={field.helper}
                >
                  <Radio.Group options={field.options.map((option) => ({ label: option, value: option }))} />
                </Form.Item>
              );
            }

            if (field.kind === 'multiple_choice') {
              return (
                <Form.Item
                  key={field.id}
                  name={field.id}
                  label={field.label}
                  rules={required ? [{ required: true, message: `请选择${field.label}` }] : []}
                  extra={field.helper}
                >
                  <Checkbox.Group options={field.options} />
                </Form.Item>
              );
            }

            if (field.kind === 'image_upload' || field.kind === 'video_upload') {
              return (
                <Form.Item
                  key={field.id}
                  label={field.label}
                  extra={`${field.helper ?? ''}${field.limitText ? `${field.helper ? ' · ' : ''}${field.limitText}` : ''}${required ? '' : ' · 选填'}`}
                >
                  <Dragger
                    beforeUpload={() => false}
                    multiple={field.kind === 'image_upload'}
                    fileList={uploadMap[field.id] ?? []}
                    onChange={({ fileList }) => {
                      setUploadMap((current) => ({
                        ...current,
                        [field.id]: fileList.slice(0, field.kind === 'image_upload' ? 3 : 1),
                      }));
                    }}
                    accept={field.kind === 'image_upload' ? 'image/*' : 'video/*'}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{field.kind === 'image_upload' ? '上传图片附件' : '上传视频附件'}</p>
                  </Dragger>
                </Form.Item>
              );
            }

            return null;
          })}

          <div className="device-action-row">
            <Button htmlType="submit" type="primary" loading={submitting} block>
              提交学习作品
            </Button>
            <Link href={`/tasks/${activeTask.id}`}>
              <Button block>返回研学活动</Button>
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
