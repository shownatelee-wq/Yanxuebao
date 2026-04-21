'use client';

import { Card } from 'antd';
import { useParams } from 'next/navigation';
import { TaskTemplatePreview } from '../../../../components/admin-pages';
import { useAdminStore } from '../../../../lib/admin-store';

export default function PreviewTaskTemplatePage() {
  const { selectors } = useAdminStore();
  const params = useParams<{ templateId: string }>();

  return (
    <main className="preview-page">
      <Card className="preview-card">
        <TaskTemplatePreview template={selectors.getBuilderTemplateById(params.templateId)} />
      </Card>
    </main>
  );
}
