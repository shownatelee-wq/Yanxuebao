'use client';

import { PauseCircleFilled, PlayCircleFilled, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Result, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { demoCloudCategories } from '../../../../../lib/device-demo-data';
import { useDeviceWorkspaceSnapshot } from '../../../../../lib/device-workspace-state';
import { WatchHero, WatchNextSteps, WatchSection } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceCloudCategoryPage() {
  const params = useParams<{ categoryId: string }>();
  const { cloudFiles } = useDeviceWorkspaceSnapshot();
  const [playingId, setPlayingId] = useState('');
  const [playAll, setPlayAll] = useState(false);
  const category = demoCloudCategories.find((item) => item.id === params.categoryId);
  const files = useMemo(() => cloudFiles.filter((item) => item.categoryId === params.categoryId), [cloudFiles, params.categoryId]);
  const isMediaList = category?.icon === 'image' || category?.icon === 'video';
  const isAudioList = category?.icon === 'audio';

  useEffect(() => {
    if (!playAll || !files.length) {
      return undefined;
    }
    const currentIndex = Math.max(0, files.findIndex((file) => file.id === playingId));
    const timer = window.setTimeout(() => {
      const next = files[(currentIndex + 1) % files.length];
      setPlayingId(next.id);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [files, playAll, playingId]);

  if (!category) {
    return <Result status="404" title="未找到分类" extra={<Link href="/cloud"><Button>网盘</Button></Link>} />;
  }

  function startPlayAll() {
    setPlayAll(true);
    setPlayingId((current) => current || files[0]?.id || '');
  }

  return (
    <div className="device-page-stack">
      <WatchHero title={category.title} subtitle={`共 ${files.length} 个文件`} />
      <WatchSection title="文件列表">
        {isMediaList ? (
          <div className="device-photo-wall compact">
            {files.map((file, index) => (
              <Link
                key={file.id}
                href={`/cloud/files/${file.id}`}
                className={`device-photo-wall-tile tone-${index % 6} ${index % 5 === 0 ? 'wide' : ''}`}
              >
                {category.icon === 'video' ? <PlayCircleFilled /> : null}
                <span>{file.title}</span>
              </Link>
            ))}
          </div>
        ) : isAudioList ? (
          <>
            <Button type="primary" block icon={<PlayCircleOutlined />} onClick={startPlayAll} disabled={!files.length}>
              播放全部
            </Button>
            <div className="device-cloud-audio-list">
              {files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className={`device-cloud-audio-row${playingId === file.id ? ' active' : ''}`}
                  onClick={() => {
                    setPlayAll(false);
                    setPlayingId(file.id);
                  }}
                >
                  <span className="device-cloud-audio-cover">{playingId === file.id ? <PauseCircleFilled /> : <PlayCircleFilled />}</span>
                  <span className="device-cloud-audio-main">
                    <strong>{file.title}</strong>
                    <em>{file.preview}</em>
                  </span>
                  <span className="device-cloud-audio-tags">
                    <b>VIP</b>
                    <i>{file.duration ?? '00:12'}</i>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="device-mini-list">
            {files.map((file) => (
              <Link key={file.id} href={`/cloud/files/${file.id}`} className="device-card-link">
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{file.title}</span>
                    <span>{file.size}</span>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {file.source} · {file.updatedAt}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        )}
      </WatchSection>
      <WatchNextSteps text={isAudioList ? '音频支持单条播放和播放全部，播放状态为本地模拟。' : '文件都保存在这里，可进入详情查看或下载。'} />
    </div>
  );
}
