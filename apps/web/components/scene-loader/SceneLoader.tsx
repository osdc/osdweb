import { useEffect, useRef, useState } from 'react';
import { LoadingManager } from 'three';
import { osdcFastfetchLogo } from 'osdc-content';
import { Renderer, RendererScenes } from '../renderer/Renderer';
import { AssetManager, LoadingProgress, UpdateAction } from './AssetManager';
import { LightsLoader, NoopLoader, OfficeDisplayLoader, OfficeEnvironmentLoader, PhoneLoader, SceneAssetRevision, createRenderScenes } from './AssetLoaders';
import { detectWebGL, isDebug } from './util';
import styles from './SceneLoader.module.css';

type BootPhase = 'boot' | 'ready';

const bootMessages = [
  'OSDC GNU/Community bootloader 1.0',
  'Mounting /home/osdc...',
  'Starting community desktop...',
  'Starting graphics and input services...',
];

function BootLine({ message, index, elapsed }: { message: string; index: number; elapsed: number }) {
  const characters = Math.max(0, Math.min(message.length, Math.floor((elapsed - index * 330) / 16)));
  if (characters === 0) return null;
  return <p className={styles.bootLine}><span className={styles.time}>[{(index * 0.33).toFixed(6).padStart(11)}]</span> {message.slice(0, characters)}{characters < message.length && <span className={styles.lineCursor}>▌</span>}</p>;
}

function BootScreen({ progress, elapsed, error }: {
  progress: LoadingProgress | null;
  elapsed: number;
  error: string | null;
}) {
  const resourceEntries = progress?.listAllEntries() ?? [];
  const showResources = elapsed >= 1400;

  return <div className={styles.bootScreen} role="status" aria-live="polite">
    <div className={styles.bootLog}>
      <pre className={styles.bootLogo} aria-label="OSDC logo">{osdcFastfetchLogo.join('\n')}</pre>
      <p className={styles.bootTitle}>osdc@community:~$ systemctl start osdc-desktop</p>
      {bootMessages.map((message, index) => <BootLine key={message} message={message} index={index} elapsed={elapsed} />)}
      {showResources && resourceEntries.map((entry) => <p className={styles.bootLine} key={entry.name}><span className={entry.processed ? styles.ok : styles.wait}>[{entry.processed ? '  OK  ' : '  ..  '}]</span> {entry.name.replace(/^Loading /, 'Started ').replace(/^Linked to /, 'Linked ')}</p>)}
      {error ? <div className={styles.bootError}><p>[FAILED] {error}</p><button type="button" onClick={() => window.location.reload()}>Retry boot</button> <a href="/community">Open the community page</a></div> : <p className={styles.bootCursor} aria-hidden="true">_</p>}
    </div>
  </div>;
}

export function SceneLoader() {
  const [phase, setPhase] = useState<BootPhase>('boot');
  const [elapsed, setElapsed] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sceneActions, setSceneActions] = useState<UpdateAction[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const [supportsWebGL, setSupportsWebGL] = useState<boolean | null>(null);
  const scenesRef = useRef<RendererScenes>(createRenderScenes());

  useEffect(() => {
    const startedAt = performance.now();
    const timer = window.setInterval(() => setElapsed(performance.now() - startedAt), 150);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const hasWebGL = detectWebGL();
    setSupportsWebGL(hasWebGL);
    if (!hasWebGL) return;

    scenesRef.current = createRenderScenes();
    setSceneActions([]);
    setAssetsReady(false);
    setPhase('boot');
    setLoadError(null);

    const manager = new AssetManager(scenesRef.current, new LoadingManager());
    manager.init(isDebug());
    manager.reset();
    manager.add('Linked to Magi-1', NoopLoader());
    manager.add('Linked to Magi-2', NoopLoader());
    manager.add('Linked to Magi-3', NoopLoader());
    manager.add('Loading office', OfficeEnvironmentLoader());
    manager.add('Loading lights', LightsLoader());
    manager.add('Loading pocket computer', PhoneLoader());
    manager.add('Loading monitor', OfficeDisplayLoader());
    setLoadingProgress(manager.loadingProgress());

    const abortController = new AbortController();
    manager.load(abortController.signal, () => setLoadingProgress(manager.loadingProgress()))
      .then(({ updateActions }) => {
        if (abortController.signal.aborted) return;
        setSceneActions(updateActions);
        setLoadingProgress(manager.loadingProgress());
        setAssetsReady(true);
      })
      .catch((error) => {
        if (!abortController.signal.aborted) setLoadError(error instanceof Error ? error.message : 'Unknown asset loading error');
      });

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (!assetsReady) return;
    const readyTimer = window.setTimeout(() => setPhase('ready'), Math.max(0, 2700 - elapsed));
    return () => window.clearTimeout(readyTimer);
  }, [assetsReady]);

  if (supportsWebGL === false) return <BootScreen progress={null} elapsed={elapsed} error="WebGL is unavailable. Use a browser with WebGL or open the community page." />;

  return <>
    {phase !== 'ready' && <BootScreen progress={loadingProgress} elapsed={elapsed} error={loadError} />}
    {supportsWebGL && <Renderer key={SceneAssetRevision} loading={phase !== 'ready'} showMessage={false} scenes={scenesRef.current} actions={sceneActions} />}
  </>;
}
