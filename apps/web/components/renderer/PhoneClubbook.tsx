import {
  startTransition,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./PhoneOverlay.module.css";
import {
  clubbookSectionOrder,
  clubbookSections,
  ClubbookSectionId,
  resolveSlideMediaProfile,
  SlideMediaDimensions,
} from "osdc-content";

type OverlayPhoneClubbookProps = {
  mode: 'overlay',
  open: boolean,
  onClose: () => void,
  immersive?: boolean,
};

type EmbeddedPhoneClubbookProps = {
  mode: 'embedded',
  onEnterDesk?: () => void,
  showDeskReturn?: boolean,
};

export type PhoneClubbookProps = OverlayPhoneClubbookProps | EmbeddedPhoneClubbookProps;

type VariableStyle = CSSProperties & Record<`--${string}`, string>;

const SocialLinks = [
  { label: 'Discord', href: 'https://discord.gg/osdc' },
  { label: 'Instagram', href: 'https://www.instagram.com/osdc.dev/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/osdcjiit/' },
  { label: 'GitHub', href: 'https://github.com/Open-Source-Developers-Community' },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function createClubbookViewerStyles(
  activeSlide: (typeof clubbookSections)[ClubbookSectionId]['slides'][number],
  dimensions: SlideMediaDimensions | null,
  embedded: boolean
): {
  shell: VariableStyle,
  imageFrame: CSSProperties,
  image: CSSProperties,
  card: VariableStyle,
} {
  const profile = resolveSlideMediaProfile(activeSlide, dimensions);
  const frameMaxWidth = profile.kind === 'poster'
    ? '16rem'
    : profile.kind === 'portrait'
      ? '16.5rem'
      : profile.kind === 'square'
        ? '18rem'
        : '100%';
  const cardDensity = profile.mobileStage.contentDensity === 'compact'
    ? '0.72rem'
    : profile.mobileStage.contentDensity === 'spacious'
      ? '1rem'
      : '0.86rem';

  return {
    shell: {
      ['--clubbook-content-gap' as const]: cardDensity,
    },
    imageFrame: {
      aspectRatio: embedded ? 'auto' : `${profile.mobileStage.aspectRatio}`,
      maxHeight: embedded ? 'none' : `${profile.mobileStage.maxMediaHeightRem}rem`,
      paddingInline: embedded ? '0' : `${profile.mobileStage.paddingXRem}rem`,
    },
    image: {
      width: embedded ? 'auto' : profile.fitMode === 'cover' ? '100%' : 'auto',
      height: embedded ? 'auto' : profile.fitMode === 'cover' ? '100%' : 'auto',
      maxWidth: embedded ? '100%' : profile.fitMode === 'cover' ? 'none' : frameMaxWidth,
      maxHeight: embedded ? 'min(42dvh, 320px)' : profile.fitMode === 'cover' ? 'none' : '100%',
      objectFit: embedded ? 'contain' : profile.fitMode,
      objectPosition: profile.objectPosition,
    },
    card: {
      ['--clubbook-meta-columns' as const]: profile.viewerFocus === 'content' ? '1fr' : 'repeat(3, minmax(0, 1fr))',
    },
  };
}

export function PhoneClubbook(props: PhoneClubbookProps) {
  const isOverlayMode = props.mode === 'overlay';
  const embeddedOnEnterDesk = !isOverlayMode ? props.onEnterDesk : undefined;
  const showDeskReturn = !isOverlayMode ? props.showDeskReturn ?? true : false;
  const isOpen = isOverlayMode ? props.open : true;
  const immersive = isOverlayMode ? props.immersive ?? false : false;
  const onClose = isOverlayMode ? props.onClose : null;
  const [time, setTime] = useState('--:--');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<SlideMediaDimensions | null>(null);
  const [expandedImageSrc, setExpandedImageSrc] = useState<string | null>(null);
  const swipeStateRef = useRef<{ pointerId: number, startX: number, startY: number } | null>(null);
  const suppressImageTapRef = useRef(false);

  const activeSectionId = clubbookSectionOrder[sectionIndex];
  const activeSection = clubbookSections[activeSectionId];
  const activeSlide = activeSection.slides[slideIndex];
  const viewerStyles = createClubbookViewerStyles(activeSlide, imageDimensions, !isOverlayMode);
  const registrationUrl = process.env.NEXT_PUBLIC_OSDHACK_REGISTER_URL?.trim() || '';
  const hasRegistrationUrl = registrationUrl.length > 0;

  function goToPreviousSlide() {
    startTransition(() => {
      setSlideIndex((current) => (current - 1 + activeSection.slides.length) % activeSection.slides.length);
    });
  }

  function goToNextSlide() {
    startTransition(() => {
      setSlideIndex((current) => (current + 1) % activeSection.slides.length);
    });
  }

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    setImageDimensions({
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  }

  function handleImageActivate() {
    if (suppressImageTapRef.current) {
      suppressImageTapRef.current = false;
      return;
    }

    setExpandedImageSrc(activeSlide.imageSrc);
  }

  function handleSlidePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    suppressImageTapRef.current = false;
    swipeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function clearSlidePointer() {
    swipeStateRef.current = null;
  }

  function handleSlidePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const swipeState = swipeStateRef.current;

    if (!swipeState || swipeState.pointerId !== event.pointerId) {
      return;
    }

    swipeStateRef.current = null;

    const deltaX = event.clientX - swipeState.startX;
    const deltaY = event.clientY - swipeState.startY;

    if (Math.abs(deltaX) <= 45 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.3) {
      return;
    }

    suppressImageTapRef.current = true;

    if (deltaX < 0) {
      goToNextSlide();
    } else {
      goToPreviousSlide();
    }

    window.setTimeout(() => {
      suppressImageTapRef.current = false;
    }, 0);
  }

  function openSocialLink(href: string) {
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  function handleEnterDesk() {
    if (embeddedOnEnterDesk) {
      embeddedOnEnterDesk();
      return;
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ method: 'return_to_desk_message' }, window.location.origin);
      return;
    }

    window.location.assign('/');
  }

  function handleRegisterForOsdhack() {
    if (!hasRegistrationUrl) {
      return;
    }

    openSocialLink(registrationUrl);
  }

  useEffect(() => {
    if (props.mode !== 'embedded') { return; }

    document.documentElement.classList.add('osdc-scroll-page');
    document.body.classList.add('osdc-scroll-page');

    return () => {
      document.documentElement.classList.remove('osdc-scroll-page');
      document.body.classList.remove('osdc-scroll-page');
    };
  }, [props.mode]);

  useEffect(() => {
    const updateTime = () => {
      setTime(formatTime(new Date()));
    };

    updateTime();
    const interval = window.setInterval(() => {
      updateTime();
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setSlideIndex(0);
  }, [sectionIndex]);

  useEffect(() => {
    setImageDimensions(null);
  }, [activeSlide.id]);

  useEffect(() => {
    setExpandedImageSrc(null);
  }, [activeSlide.id, sectionIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) { return; }

    setSectionIndex(0);
    setSlideIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) { return; }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (expandedImageSrc) {
          event.preventDefault();
          setExpandedImageSrc(null);
          return;
        }

        if (onClose) {
          event.preventDefault();
          onClose();
        }
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousSlide();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextSlide();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection.slides.length, expandedImageSrc, isOpen, onClose]);

  if (!isOpen) { return null; }

  const rootClassName = isOverlayMode
    ? `${styles.overlay} ${immersive ? styles.overlayImmersive : ''}`
    : styles.embeddedRoot;
  const shellClassName = isOverlayMode
    ? `${styles.shell} ${immersive ? styles.shellImmersive : ''}`
    : `${styles.shell} ${styles.embeddedShell}`;
  const frameClassName = isOverlayMode
    ? styles.frame
    : `${styles.frame} ${styles.embeddedFrame}`;
  const screenClassName = isOverlayMode
    ? styles.screen
    : `${styles.screen} ${styles.embeddedScreen}`;
  const windowBarClassName = isOverlayMode
    ? styles.windowBar
    : `${styles.windowBar} ${styles.embeddedWindowBar}`;
  const windowTitleClassName = isOverlayMode
    ? styles.windowTitle
    : `${styles.windowTitle} ${styles.embeddedWindowTitle}`;
  const windowControlClassName = isOverlayMode
    ? styles.windowControl
    : `${styles.windowControl} ${styles.embeddedWindowControl}`;
  const windowActionClassName = isOverlayMode
    ? styles.windowControls
    : `${styles.windowControls} ${styles.embeddedWindowControls}`;
  const windowBodyClassName = isOverlayMode
    ? styles.windowBody
    : `${styles.windowBody} ${styles.embeddedWindowBody}`;
  const headerClassName = isOverlayMode
    ? styles.header
    : `${styles.header} ${styles.embeddedHeader}`;
  const fileHintClassName = isOverlayMode
    ? styles.fileHint
    : `${styles.fileHint} ${styles.embeddedFileHint}`;
  const titleClassName = isOverlayMode
    ? styles.title
    : `${styles.title} ${styles.embeddedTitle}`;
  const subtitleClassName = isOverlayMode
    ? styles.subtitle
    : `${styles.subtitle} ${styles.embeddedSubtitle}`;
  const tabRowClassName = isOverlayMode
    ? styles.tabRow
    : `${styles.tabRow} ${styles.embeddedTabRow}`;
  const tabClassName = isOverlayMode
    ? styles.tab
    : `${styles.tab} ${styles.embeddedTab}`;
  const socialBarClassName = isOverlayMode
    ? styles.socialBar
    : `${styles.socialBar} ${styles.embeddedCardSurface}`;
  const sectionLeadClassName = isOverlayMode
    ? styles.sectionLead
    : `${styles.sectionLead} ${styles.embeddedCardSurface}`;
  const sectionActionsClassName = isOverlayMode
    ? styles.sectionActions
    : `${styles.sectionActions} ${styles.embeddedSectionActions}`;
  const viewerClassName = isOverlayMode
    ? styles.viewer
    : `${styles.viewer} ${styles.embeddedViewer}`;
  const imageFrameClassName = isOverlayMode
    ? styles.imageFrame
    : `${styles.imageFrame} ${styles.embeddedImageFrame}`;
  const imageViewportClassName = isOverlayMode
    ? styles.imageViewport
    : `${styles.imageViewport} ${styles.embeddedImageViewport}`;
  const imageButtonClassName = isOverlayMode
    ? styles.imageButton
    : `${styles.imageButton} ${styles.embeddedImageButton}`;
  const imageClassName = isOverlayMode
    ? styles.image
    : `${styles.image} ${styles.embeddedImage}`;
  const cardClassName = isOverlayMode
    ? styles.card
    : `${styles.card} ${styles.embeddedCardSurface}`;
  const footerClassName = isOverlayMode
    ? styles.footer
    : `${styles.footer} ${styles.embeddedFooter}`;
  const paginationRowClassName = isOverlayMode
    ? styles.paginationRow
    : `${styles.paginationRow} ${styles.embeddedPaginationRow}`;
  const dotsClassName = isOverlayMode
    ? styles.dots
    : `${styles.dots} ${styles.embeddedDots}`;
  const controlsClassName = isOverlayMode
    ? styles.controls
    : `${styles.controls} ${styles.embeddedControls}`;
  const navButtonClassName = isOverlayMode
    ? styles.navButton
    : `${styles.navButton} ${styles.embeddedNavButton}`;
  const footerNoteClassName = isOverlayMode
    ? styles.footerNote
    : `${styles.footerNote} ${styles.embeddedCardSurface}`;
  const rootProps = isOverlayMode ? { 'data-pocket-overlay': 'true' } : {};

  return (
    <div className={rootClassName} {...rootProps}>
      <div
        className={shellClassName}
        style={viewerStyles.shell}
        role={isOverlayMode ? 'dialog' : undefined}
        aria-modal={isOverlayMode ? 'true' : undefined}
        aria-label="OSDC Clubbook"
      >
        <div className={frameClassName}>
          <div className={screenClassName}>
            <div className={`${styles.statusBar} ${isOverlayMode ? '' : styles.embeddedStatusBar}`}>
              {isOverlayMode ? (
                <button type="button" className={styles.statusButton} onClick={onClose ?? undefined}>
                  Back to desk
                </button>
              ) : (
                <span className={styles.statusBadge}>Pocket mode</span>
              )}
              <span>{time}</span>
            </div>

            <div className={windowBarClassName}>
              <div className={windowTitleClassName}>OSDC Clubbook</div>
              <div className={windowActionClassName} aria-hidden={isOverlayMode ? 'true' : undefined}>
                {isOverlayMode ? (
                  <>
                    <span className={windowControlClassName}></span>
                    <span className={windowControlClassName}></span>
                    <span className={windowControlClassName}></span>
                  </>
                ) : showDeskReturn ? (
                  <button
                    type="button"
                    className={styles.embeddedWindowAction}
                    onClick={handleEnterDesk}
                  >
                    Return to desk
                  </button>
                ) : null}
              </div>
            </div>

            <div className={windowBodyClassName}>
              <div className={headerClassName}>
                <div className={styles.headerCopy}>
                  <div className={fileHintClassName}>{activeSection.fileHint}</div>
                  <h2 className={titleClassName}>OSDC Clubbook</h2>
                  <p className={subtitleClassName}>
                    Student-run open-source club.
                    <br />
                    No filler.
                    <br />
                    Click around.
                  </p>
                </div>
              </div>

              <div className={tabRowClassName} aria-label="Clubbook sections">
                {clubbookSectionOrder.map((sectionId, index) => {
                  const section = clubbookSections[sectionId];

                  return (
                    <button
                      key={section.id}
                      type="button"
                      className={[
                        tabClassName,
                        index === sectionIndex ? styles.tabActive : '',
                      ].join(' ')}
                      onClick={() => setSectionIndex(index)}
                    >
                      {section.label}
                    </button>
                  );
                })}
              </div>

              <div className={socialBarClassName}>
                <div className={styles.socialLabel}>Socials</div>
                <div className={styles.socialLinks}>
                  {SocialLinks.map((link) => (
                    <button
                      key={link.label}
                      type="button"
                      className={styles.socialButton}
                      onClick={() => openSocialLink(link.href)}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={sectionLeadClassName}>
                <p className={styles.sectionEyebrow}>{activeSection.title}</p>
                <p className={styles.sectionIntro}>{activeSection.intro}</p>
                {activeSectionId === 'events' ? (
                  <div className={sectionActionsClassName}>
                    <button
                      type="button"
                      className={styles.eventRegisterButton}
                      onClick={handleRegisterForOsdhack}
                      disabled={!hasRegistrationUrl}
                    >
                      {hasRegistrationUrl ? "Register for OSDHACK '26" : 'Registration opening soon'}
                    </button>
                  </div>
                ) : null}
              </div>

              <div className={viewerClassName}>
                <div className={imageFrameClassName} style={viewerStyles.imageFrame}>
                  <div className={styles.imageHeader}>
                    <span>{activeSlide.kicker}</span>
                    <span>{slideIndex + 1} / {activeSection.slides.length}</span>
                  </div>
                  <div
                    className={imageViewportClassName}
                    onPointerDown={handleSlidePointerDown}
                    onPointerUp={handleSlidePointerUp}
                    onPointerCancel={clearSlidePointer}
                  >
                    <button
                      type="button"
                      className={imageButtonClassName}
                      onClick={handleImageActivate}
                      aria-label={`Expand ${activeSlide.imageAlt}`}
                    >
                      <img
                        className={imageClassName}
                        style={viewerStyles.image}
                        src={activeSlide.imageSrc}
                        alt={activeSlide.imageAlt}
                        draggable={false}
                        onLoad={handleImageLoad}
                      />
                    </button>
                  </div>
                </div>

                <div className={cardClassName} style={viewerStyles.card}>
                  <div className={styles.cardPath}>{activeSlide.mobileStatus ?? activeSlide.kicker}</div>
                  <div className={styles.cardTitle}>{activeSlide.mobileTitle ?? activeSlide.title}</div>
                  <p className={styles.cardDescription}>{activeSlide.description}</p>
                  {(activeSlide.profileLinks?.length || activeSlide.credits?.length) ? (
                    <div className={styles.cardCallouts}>
                      {activeSlide.profileLinks?.length ? (
                        <div className={styles.cardLinks}>
                          {activeSlide.profileLinks.map((link) => (
                            <button
                              key={`${activeSlide.id}-${link.href}`}
                              type="button"
                              className={styles.cardLink}
                              onClick={() => openSocialLink(link.href)}
                            >
                              {link.label}
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {activeSlide.credits?.length ? (
                        <p className={styles.cardCredits}>
                          Creds: {activeSlide.credits.join(' // ')}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className={styles.metaGrid}>
                    {activeSlide.meta.map((item) => (
                      <div key={`${activeSlide.id}-${item.label}`} className={styles.metaCard}>
                        <div className={styles.metaLabel}>{item.label}</div>
                        <div className={styles.metaValue}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={footerClassName}>
                <div className={paginationRowClassName}>
                  <div className={dotsClassName} aria-hidden="true">
                    {activeSection.slides.map((slide, index) => (
                      <span
                        key={slide.id}
                        className={[
                          styles.dot,
                          index === slideIndex ? styles.dotActive : '',
                        ].join(' ')}
                      ></span>
                    ))}
                  </div>
                  {!isOverlayMode ? <span className={styles.swipeHint}>Swipe to browse</span> : null}
                </div>

                <div className={controlsClassName}>
                  <button type="button" className={navButtonClassName} onClick={goToPreviousSlide}>
                    Previous
                  </button>
                  <button type="button" className={navButtonClassName} onClick={goToNextSlide}>
                    Next
                  </button>
                </div>

                <p className={footerNoteClassName}>{activeSection.footer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {expandedImageSrc && (
        <div className={styles.lightbox} onClick={() => setExpandedImageSrc(null)}>
          <div className={styles.lightboxFrame} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setExpandedImageSrc(null)}
            >
              Close
            </button>
            <img
              className={styles.lightboxImage}
              src={expandedImageSrc}
              alt={activeSlide.imageAlt}
              draggable={false}
            />
            <div className={styles.lightboxCaption}>{activeSlide.caption ?? activeSlide.title}</div>
          </div>
        </div>
      )}
    </div>
  );
}
