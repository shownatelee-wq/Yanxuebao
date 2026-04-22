'use client';

import { AudioOutlined, CameraOutlined, PlusOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

export function DeviceGlobalAssistantFab() {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [dockOffset, setDockOffset] = useState(0);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setExpanded(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    const fabRoot = rootRef.current;
    const workspaceRoot = fabRoot?.closest('.device-workspace') as HTMLElement | null;
    if (!workspaceRoot) {
      return;
    }
    const resolvedWorkspaceRoot = workspaceRoot;

    let resizeObserver: ResizeObserver | null = null;
    let observedDock: HTMLElement | null = null;

    function syncDockState() {
      const dock = resolvedWorkspaceRoot.querySelector('.watch-bottom-dock') as HTMLElement | null;
      const nextOffset = dock ? Math.ceil(dock.getBoundingClientRect().height) + 10 : 0;
      const isHomeRoute = pathname === '/home';

      resolvedWorkspaceRoot.classList.toggle('device-workspace-has-bottom-dock', Boolean(dock));
      resolvedWorkspaceRoot.classList.toggle('device-workspace-home-overlay-fab', isHomeRoute);
      setDockOffset((current) => (current === nextOffset ? current : nextOffset));

      if (dock !== observedDock) {
        resizeObserver?.disconnect();
        observedDock = dock;
        if (dock) {
          resizeObserver = new ResizeObserver(syncDockState);
          resizeObserver.observe(dock);
        }
      }
    }

    syncDockState();

    const mutationObserver = new MutationObserver(syncDockState);
    mutationObserver.observe(resolvedWorkspaceRoot, { childList: true, subtree: true });
    window.addEventListener('resize', syncDockState);

    return () => {
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', syncDockState);
      resolvedWorkspaceRoot.classList.remove('device-workspace-has-bottom-dock');
      resolvedWorkspaceRoot.classList.remove('device-workspace-home-overlay-fab');
      setDockOffset(0);
    };
  }, [pathname]);

  function navigateTo(path: string) {
    setExpanded(false);
    router.push(path);
  }

  const fabStyle = {
    '--device-fab-dock-offset': `${dockOffset}px`,
  } as CSSProperties;

  return (
    <div ref={rootRef} style={fabStyle} className={`device-global-fab${expanded ? ' expanded' : ''}`}>
      <div className="device-global-fab-actions" aria-hidden={!expanded}>
        <button
          type="button"
          className="device-global-fab-action voice"
          onClick={() => navigateTo('/assistant/voice?source=fab')}
        >
          <AudioOutlined />
          <span>语音</span>
        </button>
        <button
          type="button"
          className="device-global-fab-action camera"
          onClick={() => navigateTo('/capture?source=fab')}
        >
          <CameraOutlined />
          <span>拍照</span>
        </button>
      </div>
      <button
        type="button"
        className="device-global-fab-trigger"
        aria-expanded={expanded}
        aria-label={expanded ? '关闭全局助手' : '打开全局助手'}
        onClick={() => setExpanded((value) => !value)}
      >
        <PlusOutlined />
      </button>
    </div>
  );
}
