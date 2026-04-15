'use client';

import { Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDeviceTaskList } from '../../../../../lib/device-task-data';

const { Paragraph } = Typography;

export default function DeviceTaskResourceDetailPage() {
  const params = useParams<{ resourceId: string }>();
  const task = getDeviceTaskList().find((item) => item.resourcePacks.some((resource) => resource.id === params.resourceId));
  const resource = task?.resourcePacks.find((item) => item.id === params.resourceId);

  if (!task || !resource) {
    return <Result status="404" title="未找到资源包" extra={<Link href="/tasks"><span>返回任务</span></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="blue">活动资源包</Tag>
            <Tag color={resource.previewMode === 'pdf' ? 'purple' : 'green'}>
              {resource.previewMode === 'pdf' ? 'PDF 预览' : '图文资料'}
            </Tag>
          </Space>
          <p className="device-page-title">{resource.title}</p>
          <p className="device-page-subtle">{task.title}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">资源说明</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{resource.summary}</Paragraph>
      </div>

      {resource.previewMode === 'doc' ? (
        <div className="device-compact-card">
          <p className="device-section-label">图文内容</p>
          <div className="device-resource-doc-list">
            {(resource.docSections ?? []).map((section) => (
              <div key={section.title} className={`device-resource-doc-card accent-${section.accent}`}>
                <div className="device-resource-doc-thumb">{section.imageLabel}</div>
                <div>
                  <div className="device-mini-item-title" style={{ marginBottom: 6 }}>
                    <span>{section.title}</span>
                  </div>
                  <p className="device-mini-item-desc">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="device-compact-card">
          <p className="device-section-label">PDF 预览</p>
          <div className="device-resource-pdf-list">
            {(resource.pdfPages ?? []).map((page) => (
              <div key={page.pageTitle} className="device-resource-pdf-page">
                <div className="device-mini-item-title">
                  <span>{page.pageTitle}</span>
                  <Tag color="purple">预览页</Tag>
                </div>
                <p className="device-mini-item-desc" style={{ marginBottom: 8 }}>{page.pageHint}</p>
                <div className="device-resource-pdf-blocks">
                  {page.blocks.map((block) => (
                    <div key={`${page.pageTitle}-${block.title ?? block.content}`} className={`device-resource-pdf-block tone-${block.tone ?? 'paragraph'}`}>
                      {block.title ? <p className="device-resource-pdf-block-title">{block.title}</p> : null}
                      <p className="device-mini-item-desc">{block.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
