import { WindowProps } from '@/components/WindowManagement/WindowCompositor';
import { startTransition, type CSSProperties, type SyntheticEvent, useEffect, useRef, useState } from 'react';
import styles from './AboutView.module.css';
import { ScreenResolution } from '@/apis/Screen/ScreenService';
import {
  clubbookSectionOrder,
  clubbookSections,
  ClubbookSectionId,
  ClubbookSlide,
  resolveSlideMediaProfile,
  SlideMediaDimensions,
} from 'osdc-content';

type SectionNavigationProps = {
  activeSection: ClubbookSectionId,
  needsMobileView: boolean,
  onSectionChange: (section: ClubbookSectionId) => void,
  onOpenContact: () => void,
  onOpenSocials: () => void,
};

type ViewerProps = {
  slide: ClubbookSlide,
  slideIndex: number,
  slideCount: number,
  onPrev: () => void,
  onNext: () => void,
  onExpand: (slide: ClubbookSlide) => void,
};

type ThumbnailRailProps = {
  activeIndex: number,
  slides: ClubbookSlide[],
  onSelect: (index: number) => void,
};

type VariableStyle = CSSProperties & Record<`--${string}`, string>;

function isPortraitLike(slide: ClubbookSlide, dimensions: SlideMediaDimensions | null): boolean {
  if (slide.mediaKind === 'poster' || slide.mediaKind === 'portrait') {
    return true;
  }

  if (dimensions) {
    return dimensions.height > dimensions.width;
  }

  return (slide.preferredAspectRatio ?? 1.45) < 1;
}

function createDesktopViewerStyles(slide: ClubbookSlide, dimensions: SlideMediaDimensions | null): {
  shell: CSSProperties,
  imageWrap: CSSProperties,
  imageFrame: CSSProperties,
  image: CSSProperties,
  info: VariableStyle,
  isPortraitLike: boolean,
} {
  const profile = resolveSlideMediaProfile(slide, dimensions);
  const portraitLike = isPortraitLike(slide, dimensions);
  const runtimeAspectRatio = dimensions
    ? dimensions.width / Math.max(dimensions.height, 1)
    : profile.effectiveAspectRatio;
  const densityGap = profile.viewerFocus === 'content' ? '0.82rem' : profile.viewerFocus === 'image' ? '1.05rem' : '0.94rem';
  const protectedImageKinds = portraitLike || profile.kind === 'poster' || profile.kind === 'portrait';
  const displayFitMode = protectedImageKinds ? 'contain' : profile.fitMode;
  const allowFrameToWrapImage = displayFitMode === 'contain' && (protectedImageKinds || profile.kind === 'square');
  const relaxedMaxHeight = displayFitMode === 'contain' && profile.orientation === 'portrait'
    ? profile.desktopStage.maxMediaHeightRem + 3.5
    : profile.desktopStage.maxMediaHeightRem;
  const frameMaxWidthRem = allowFrameToWrapImage
    ? Math.min(
        profile.desktopStage.maxMediaWidthRem,
        relaxedMaxHeight * Math.max(runtimeAspectRatio, 0.62) + (profile.desktopStage.framePaddingRem * 2) + 1.4
      )
    : profile.desktopStage.maxMediaWidthRem;

  return {
    shell: {
      gridTemplateColumns: `minmax(0, ${profile.desktopStage.imagePaneWeight}fr) minmax(18rem, ${profile.desktopStage.contentPaneWeight}fr)`,
    },
    imageWrap: {
      minHeight: `${allowFrameToWrapImage ? Math.max(profile.desktopStage.minHeightRem - 2, 16) : profile.desktopStage.minHeightRem}rem`,
    },
    imageFrame: {
      width: allowFrameToWrapImage ? 'fit-content' : `min(100%, ${frameMaxWidthRem}rem)`,
      maxWidth: `min(100%, ${frameMaxWidthRem}rem)`,
      minHeight: allowFrameToWrapImage ? '0' : `${profile.desktopStage.minHeightRem}rem`,
      maxHeight: `${relaxedMaxHeight + 1.5}rem`,
      aspectRatio: allowFrameToWrapImage ? 'auto' : `${profile.desktopStage.aspectRatio}`,
      padding: `${profile.desktopStage.framePaddingRem}rem`,
    },
    image: {
      width: displayFitMode === 'cover' ? '100%' : 'auto',
      height: displayFitMode === 'cover' ? '100%' : 'auto',
      maxHeight: displayFitMode === 'cover' ? 'none' : `${relaxedMaxHeight}rem`,
      maxWidth: displayFitMode === 'cover' ? 'none' : '100%',
      objectFit: displayFitMode,
      objectPosition: profile.objectPosition,
    },
    info: {
      '--viewer-card-gap': densityGap,
      '--viewer-meta-columns': profile.viewerFocus === 'content' ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
    },
    isPortraitLike: portraitLike,
  };
}

function SectionNavigation(props: SectionNavigationProps) {
  const { activeSection, needsMobileView, onSectionChange, onOpenContact, onOpenSocials } = props;
  const mobileClass = needsMobileView ? styles.navigationMobile : '';

  return (
    <aside className={`${styles.navigation} ${mobileClass}`}>
      <div className={styles.navigationBrand}>
        <span className={styles.logoPart}>OSDC</span>
        <span className={styles.logoPart}>CLUBBOOK</span>
      </div>

      <p className={styles.navigationIntro}>
        Student-run open-source club.
        <br />
        No filler.
        <br />
        Click around.
      </p>

      <div className={styles.navigationButtonContainer}>
        {clubbookSectionOrder.map((sectionId) => {
          const section = clubbookSections[sectionId];
          const activeClass = activeSection === sectionId ? styles.navigationButtonActive : '';

          return (
            <button
              key={sectionId}
              className={`system-button ${styles.navigationButton} ${activeClass}`}
              onClick={() => onSectionChange(sectionId)}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      <div className={styles.navigationFooter}>
        <button className={`system-button ${styles.navigationAction}`} onClick={onOpenContact}>
          Contact
        </button>
        <button className={`system-button ${styles.navigationAction}`} onClick={onOpenSocials}>
          Socials
        </button>
      </div>
    </aside>
  );
}

function SlideViewer(props: ViewerProps) {
  const { slide, slideIndex, slideCount, onPrev, onNext, onExpand } = props;
  const viewerBackdropStyle = { backgroundImage: `url("${slide.imageSrc}")` };
  const [imageDimensions, setImageDimensions] = useState<SlideMediaDimensions | null>(null);
  const viewerStyles = createDesktopViewerStyles(slide, imageDimensions);
  const imageFrameClassName = viewerStyles.isPortraitLike
    ? `${styles.viewerImageFrame} ${styles.viewerImageFramePortrait}`
    : `${styles.viewerImageFrame} ${styles.viewerImageFrameLandscape}`;
  const imageButtonClassName = viewerStyles.isPortraitLike
    ? `${styles.viewerImageButton} ${styles.viewerImageButtonPortrait}`
    : `${styles.viewerImageButton} ${styles.viewerImageButtonLandscape}`;

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    setImageDimensions({
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  }

  useEffect(() => {
    setImageDimensions(null);
  }, [slide.id]);

  return (
    <div className={styles.viewerShell} style={viewerStyles.shell}>
      <div className={styles.viewerStage}>
        <div className={styles.viewerToolbar}>
          <span className={styles.viewerPath}>/Users/osdc/Desktop/{slide.id}.img</span>
          <span className={styles.viewerCounter}>
            {slideIndex + 1} / {slideCount}
          </span>
        </div>

        <div className={styles.viewerImageWrap} style={viewerStyles.imageWrap}>
          <div className={styles.viewerImageBackdrop} style={viewerBackdropStyle} aria-hidden="true"></div>
          <div className={styles.viewerImageGlow} aria-hidden="true"></div>

          <div key={slide.id} className={styles.viewerImageStage}>
            <div className={styles.viewerImageBadge}>Mounted</div>
            <button
              type="button"
              className={imageButtonClassName}
              onClick={() => onExpand(slide)}
              aria-label={`Expand ${slide.imageAlt}`}
            >
              <div className={imageFrameClassName} style={viewerStyles.imageFrame}>
                <img
                  className={styles.viewerImage}
                  style={viewerStyles.image}
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  draggable={false}
                  onLoad={handleImageLoad}
                />
              </div>
            </button>
            <div className={styles.viewerImageMeta}>{slide.thumbLabel}</div>
          </div>
        </div>

        {slide.caption ? <div className={styles.viewerCaption}>{slide.caption}</div> : <div className={styles.viewerCaption}>Ready.</div>}
      </div>

      <div key={`${slide.id}-info`} className={styles.viewerInfo} style={viewerStyles.info}>
        <p className={styles.slideKicker}>{slide.kicker}</p>
        <h2 className={styles.slideTitle}>{slide.title}</h2>
        <p className={styles.slideDescription}>{slide.description}</p>
        {(slide.profileLinks?.length || slide.credits?.length) ? (
          <div className={styles.viewerCallouts}>
            {slide.profileLinks?.length ? (
              <div className={styles.viewerProfileLinks}>
                {slide.profileLinks.map((link) => (
                  <a
                    key={`${slide.id}-${link.href}`}
                    className={styles.viewerProfileLink}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}

            {slide.credits?.length ? (
              <p className={styles.viewerCredits}>
                Creds: {slide.credits.join(' // ')}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className={styles.metaGrid}>
          {slide.meta.map((item) => (
            <div key={`${slide.id}-${item.label}`} className={styles.metaCard}>
              <span className={styles.metaLabel}>{item.label}</span>
              <span className={styles.metaValue}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.viewerControls}>
          <button className={`system-button ${styles.viewerControlButton}`} onClick={onPrev}>
            Previous
          </button>
          <button className={`system-button ${styles.viewerControlButton}`} onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function ThumbnailRail(props: ThumbnailRailProps) {
  const { activeIndex, slides, onSelect } = props;

  return (
    <div className={styles.thumbnailRail}>
      {slides.map((slide, index) => {
        const activeClass = index === activeIndex ? styles.thumbnailButtonActive : '';

        return (
          <button
            key={slide.id}
            className={`${styles.thumbnailButton} ${activeClass}`}
            onClick={() => onSelect(index)}
          >
            <div className={styles.thumbnailImageWrap}>
              <img className={styles.thumbnailImage} src={slide.imageSrc} alt={slide.imageAlt} draggable={false} />
            </div>
            <span className={styles.thumbnailLabel}>{slide.thumbLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AboutApplicationView(props: WindowProps) {
  const { application } = props;
  const [sectionId, setSectionId] = useState<ClubbookSectionId>('club');
  const [slideIndex, setSlideIndex] = useState(0);
  const [needsMobileView, setNeedsMobileView] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageDimensions, setLightboxImageDimensions] = useState<SlideMediaDimensions | null>(null);
  const contentParent = useRef<HTMLDivElement>(null);

  const apis = application.apis;
  const section = clubbookSections[sectionId];
  const slides = section.slides;
  const activeSlide = slides[slideIndex];
  const expandedSlide = lightboxOpen ? activeSlide : null;
  const lightboxPortrait = expandedSlide ? isPortraitLike(expandedSlide, lightboxImageDimensions) : false;

  function openContact() {
    application.manager.open('/Applications/Contact.app');
  }

  function openSocials() {
    application.manager.open('/Applications/Contact.app socials');
  }

  function resetSubPageScroll() {
    const content = contentParent.current?.querySelector('[data-subpage-content]') as HTMLDivElement | null;
    if (content) {
      content.scrollTop = 0;
    }
  }

  function onScreenChangeListener(resolution: ScreenResolution): void {
    setNeedsMobileView(resolution.isMobileDevice());
  }

  function goToPreviousSlide() {
    startTransition(() => {
      setSlideIndex((currentIndex) => (currentIndex - 1 + slides.length) % slides.length);
    });
  }

  function goToNextSlide() {
    startTransition(() => {
      setSlideIndex((currentIndex) => (currentIndex + 1) % slides.length);
    });
  }

  function changeSection(nextSection: ClubbookSectionId) {
    setSectionId(nextSection);
    setSlideIndex(0);
  }

  useEffect(() => {
    const unsubscribe = apis.screen.subscribe(onScreenChangeListener);
    const resolution = apis.screen.getResolution();

    if (resolution) {
      onScreenChangeListener(resolution);
    }

    return () => {
      unsubscribe();
    };
  }, [apis.screen]);

  useEffect(() => {
    resetSubPageScroll();
    setLightboxOpen(false);
    setLightboxImageDimensions(null);
  }, [sectionId]);

  useEffect(() => {
    if (lightboxOpen) { return; }

    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSlideIndex((currentIndex) => (currentIndex - 1 + slides.length) % slides.length);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSlideIndex((currentIndex) => (currentIndex + 1) % slides.length);
      }

    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, slides.length]);

  useEffect(() => {
    if (!lightboxOpen) { return; }

    function handleLightboxKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setLightboxOpen(false);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousSlide();
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextSlide();
      }
    }

    window.addEventListener('keydown', handleLightboxKeyDown);

    return () => {
      window.removeEventListener('keydown', handleLightboxKeyDown);
    };
  }, [lightboxOpen, slides.length]);

  useEffect(() => {
    if (!lightboxOpen) {
      setLightboxImageDimensions(null);
    }
  }, [lightboxOpen, activeSlide.id]);

  return (
    <div className="content-outer">
      <div className="content">
        <div className="content-inner" ref={contentParent}>
          <div data-subpage className={styles.subpage}>
            <SectionNavigation
              activeSection={sectionId}
              needsMobileView={needsMobileView}
              onSectionChange={changeSection}
              onOpenContact={openContact}
              onOpenSocials={openSocials}
            />

            <div data-subpage-content className={styles.subpageContent}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderText}>
                  <p className={styles.sectionEyebrow}>{section.fileHint}</p>
                  <h1 className={styles.sectionTitle}>{section.title}</h1>
                  <p className={styles.sectionIntro}>{section.intro}</p>
                </div>

                <div className={styles.headerActions}>
                  <button className={`system-button ${styles.headerActionButton}`} onClick={openContact}>
                    Contact us
                  </button>
                  <button className={`system-button ${styles.headerActionButton}`} onClick={openSocials}>
                    Socials
                  </button>
                </div>
              </div>

              <SlideViewer
                slide={activeSlide}
                slideIndex={slideIndex}
                slideCount={slides.length}
                onPrev={goToPreviousSlide}
                onNext={goToNextSlide}
                onExpand={() => setLightboxOpen(true)}
              />

              <ThumbnailRail activeIndex={slideIndex} slides={slides} onSelect={setSlideIndex} />

              <p className={styles.footerNote}>{section.footer}</p>
            </div>
          </div>
        </div>
      </div>

      {expandedSlide && (
        <div className={styles.viewerLightbox} onClick={() => setLightboxOpen(false)}>
          <div
            className={[
              styles.viewerLightboxFrame,
              lightboxPortrait ? styles.viewerLightboxFramePortrait : styles.viewerLightboxFrameLandscape,
            ].join(' ')}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={`system-button ${styles.viewerLightboxClose}`}
              onClick={() => setLightboxOpen(false)}
            >
              Close
            </button>
            <div
              className={[
                styles.viewerLightboxMedia,
                lightboxPortrait ? styles.viewerLightboxMediaPortrait : styles.viewerLightboxMediaLandscape,
              ].join(' ')}
            >
              <img
                className={[
                  styles.viewerLightboxImage,
                  lightboxPortrait ? styles.viewerLightboxImagePortrait : styles.viewerLightboxImageLandscape,
                ].join(' ')}
                src={expandedSlide.imageSrc}
                alt={expandedSlide.imageAlt}
                draggable={false}
                onLoad={(event) => {
                  const image = event.currentTarget;
                  setLightboxImageDimensions({
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                  });
                }}
              />
            </div>
            <p className={styles.viewerLightboxCaption}>
              {expandedSlide.caption ?? expandedSlide.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
