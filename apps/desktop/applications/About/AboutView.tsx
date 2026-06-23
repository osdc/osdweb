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

function createDesktopViewerStyles(slide: ClubbookSlide, dimensions: SlideMediaDimensions | null): {
  shell: CSSProperties,
  imageWrap: CSSProperties,
  imageFrame: CSSProperties,
  image: CSSProperties,
  info: VariableStyle,
} {
  const profile = resolveSlideMediaProfile(slide, dimensions);
  const densityGap = profile.viewerFocus === 'content' ? '0.82rem' : profile.viewerFocus === 'image' ? '1.05rem' : '0.94rem';
  const protectedImageKinds = profile.kind === 'poster' || profile.kind === 'portrait';
  const displayFitMode = protectedImageKinds ? 'contain' : profile.fitMode;
  const allowFrameToWrapImage = displayFitMode === 'contain' && (protectedImageKinds || profile.kind === 'square');
  const relaxedMaxHeight = displayFitMode === 'contain' && profile.orientation === 'portrait'
    ? profile.desktopStage.maxMediaHeightRem + 3.5
    : profile.desktopStage.maxMediaHeightRem;

  return {
    shell: {
      gridTemplateColumns: `minmax(0, ${profile.desktopStage.imagePaneWeight}fr) minmax(18rem, ${profile.desktopStage.contentPaneWeight}fr)`,
    },
    imageWrap: {
      minHeight: `${allowFrameToWrapImage ? profile.desktopStage.minHeightRem + 1.5 : profile.desktopStage.minHeightRem}rem`,
    },
    imageFrame: {
      width: allowFrameToWrapImage ? 'fit-content' : `min(100%, ${profile.desktopStage.maxMediaWidthRem}rem)`,
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
              className={styles.viewerImageButton}
              onClick={() => onExpand(slide)}
              aria-label={`Expand ${slide.imageAlt}`}
            >
              <div className={styles.viewerImageFrame} style={viewerStyles.imageFrame}>
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
  const [expandedSlide, setExpandedSlide] = useState<ClubbookSlide | null>(null);
  const contentParent = useRef<HTMLDivElement>(null);

  const apis = application.apis;
  const section = clubbookSections[sectionId];
  const slides = section.slides;
  const activeSlide = slides[slideIndex];

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
    setExpandedSlide(null);
  }, [sectionId]);

  useEffect(() => {
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

      if (event.key === 'Escape') {
        setExpandedSlide(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [slides.length]);

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
                onExpand={setExpandedSlide}
              />

              <ThumbnailRail activeIndex={slideIndex} slides={slides} onSelect={setSlideIndex} />

              <p className={styles.footerNote}>{section.footer}</p>
            </div>
          </div>
        </div>
      </div>

      {expandedSlide && (
        <div className={styles.viewerLightbox} onClick={() => setExpandedSlide(null)}>
          <div className={styles.viewerLightboxFrame} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={`system-button ${styles.viewerLightboxClose}`}
              onClick={() => setExpandedSlide(null)}
            >
              Close
            </button>
            <img
              className={styles.viewerLightboxImage}
              src={expandedSlide.imageSrc}
              alt={expandedSlide.imageAlt}
              draggable={false}
            />
            <p className={styles.viewerLightboxCaption}>
              {expandedSlide.caption ?? expandedSlide.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
