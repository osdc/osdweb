import { FileSystemImage } from "@/apis/FileSystem/FileSystem";
import { constructPath } from "@/apis/FileSystem/util";
import { WindowProps } from "@/components/WindowManagement/WindowCompositor";
import Image from 'next/image'
import { type SyntheticEvent, useEffect, useState } from "react";
import styles from './ImageViewerView.module.css';
import { useTranslation } from "react-i18next";
import { publicPath } from '@/util/publicPath';

function ErrorMessage(message: string) {
  return (
    <div className={styles.container}>
      <div className={['content', styles['text-content']].join(' ')}>
        {message}
      </div>
    </div>
  );
}

export default function ImageViewerView(props: WindowProps) {
  const { application, args, windowContext } = props;
  const [image, setImage] = useState<FileSystemImage>();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [dimensions, setDimensions] = useState<{ width: number, height: number } | null>(null);

  const { t } = useTranslation('common');

  const fs = application.apis.fileSystem;
  const path = args;

  function updateWindowTitle(image: FileSystemImage) {
    const window = application.compositor.getById(windowContext.id);
    if (!window) { return; }

    const path = constructPath(image);

    window.title = `${path} - Image`;

    application.compositor.update(window);
  }

  useEffect(() => {
    const imageNode = fs.getImage(path);
    if (!imageNode.ok) {
      setStatus('error');
      return;
    }
    const image = imageNode.value;
    
    const unsubscribe = fs.subscribe(image, (evt) => {
      updateWindowTitle(image);
    });

    setImage(image);
    updateWindowTitle(image);

    return () => { unsubscribe(); }
  }, []);

  if (!path) { return ErrorMessage(t('image.no_image_to_load')); }
  if (!image && status === 'error') { return ErrorMessage(t('image.no_image_to_load')); }
  if (!image) { return ErrorMessage(t('image.loading')); }

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const loadedImage = event.currentTarget;
    setDimensions({ width: loadedImage.naturalWidth, height: loadedImage.naturalHeight });
    setStatus('ready');
  }

  return (
    <div className={styles.container}>
      <div className={styles.viewer}>
        <div className={styles.toolbar}>
          <span className={styles.filename}>{image.name}{image.filenameExtension}</span>
          <span className={styles.imageMeta}>
            {dimensions ? `${dimensions.width} × ${dimensions.height}` : 'Reading image…'} · Fit
          </span>
        </div>
        <div className={styles.canvas}>
          {status === 'loading' ? <span className={styles.status}>Loading image…</span> : null}
          {status === 'error' ? <span className={styles.status}>This image could not be displayed.</span> : null}
          <Image
            className={`${styles.image} ${status === 'ready' ? styles.imageReady : ''}`}
            draggable={false}
            src={publicPath(image.source)}
            fill
            quality={90}
            sizes="(max-width: 720px) 100vw, 75vw"
            alt={image.description}
            onLoad={handleImageLoad}
            onError={() => setStatus('error')}
          />
        </div>
      </div>
    </div>
  )
}
