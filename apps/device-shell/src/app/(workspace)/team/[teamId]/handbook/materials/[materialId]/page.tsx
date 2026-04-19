'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDeviceTeamSnapshot } from '../../../../../../../lib/device-team-data';

const { Paragraph } = Typography;

export default function DeviceHandbookMaterialScopedDetailPage() {
  const params = useParams<{ teamId: string; materialId: string }>();
  const { teams, details } = useDeviceTeamSnapshot();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;
  const material = detail?.handbookMaterials.find((item) => item.id === params.materialId);

  if (!team || !detail || !material) {
    return <Result status="404" title="未找到资料" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="blue">研学资料</Tag>
            <Tag color={material.type === 'pdf' ? 'purple' : material.type === 'video' ? 'gold' : material.type === 'ai_reference' ? 'cyan' : 'green'}>
              {material.type === 'pdf' ? 'PDF 预览' : material.type === 'video' ? '视频资料' : material.type === 'ai_reference' ? 'AI 参考资料' : '图文资料'}
            </Tag>
          </Space>
          <p className="device-page-title">{material.title}</p>
          <p className="device-page-subtle">{team.name}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">资料说明</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{material.summary}</Paragraph>
      </div>

      {material.previewMode === 'doc' ? (
        <div className="device-compact-card">
          <p className="device-section-label">图文内容</p>
          <div className="device-resource-doc-list">
            {(material.docSections ?? []).map((section) => (
              <div key={section.title} className="device-resource-doc-card accent-blue">
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
      ) : material.previewMode === 'pdf' ? (
        <div className="device-compact-card">
          <p className="device-section-label">PDF 预览</p>
          <div className="device-resource-pdf-list">
            {(material.pdfPages ?? []).map((page) => (
              <div key={page.pageTitle} className="device-resource-pdf-page">
                <div className="device-mini-item-title">
                  <span>{page.pageTitle}</span>
                  <Tag color="purple">预览页</Tag>
                </div>
                <div className="device-resource-pdf-blocks">
                  {page.blocks.map((block) => (
                    <div key={`${page.pageTitle}-${block.title}`} className={`device-resource-pdf-block tone-${block.tone ?? 'default'}`}>
                      <p className="device-resource-pdf-block-title">{block.title}</p>
                      <p className="device-mini-item-desc">{block.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : material.previewMode === 'video' ? (
        <div className="device-compact-card">
          <p className="device-section-label">视频预览</p>
          <div className="device-mini-item">
            <div className="device-mini-item-title">
              <span>{material.coverImage ?? '视频封面'}</span>
              <Tag color="gold">{material.duration ?? '时长待定'}</Tag>
            </div>
            <p className="device-mini-item-desc">本轮为纯前端演示，点击播放按钮展示视频已就绪状态。</p>
            <Button size="small" type="primary" style={{ marginTop: 8 }}>播放视频</Button>
          </div>
        </div>
      ) : (
        <div className="device-compact-card">
          <p className="device-section-label">AI 参考资料</p>
          <div className="device-mini-item">
            <p className="device-mini-item-desc">{material.aiSummary}</p>
            <div className="device-action-chip-row" style={{ marginTop: 8 }}>
              {(material.questions ?? []).map((question) => (
                <Tag key={question} color="cyan">{question}</Tag>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="device-action-row">
        <Link href={`/team/${team.id}/handbook`}>
          <Button type="primary" block>研学手册</Button>
        </Link>
        <Link href={`/team/${team.id}`}>
          <Button block>团队详情</Button>
        </Link>
      </div>
    </div>
  );
}
