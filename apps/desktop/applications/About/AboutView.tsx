import { WindowProps } from '@/components/WindowManagement/WindowCompositor';
import { startTransition, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AboutView.module.css';
import { ScreenResolution } from '@/apis/Screen/ScreenService';
import {
  clubbookSectionOrder,
  clubbookSections,
  ClubbookSectionId,
  ClubbookSlide,
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

function usesEmbeddedPosterCrop(slide: ClubbookSlide): boolean {
  return slide.imageSrc.endsWith('/linux-installfest.jpeg');
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
  const [loadedImageSrc, setLoadedImageSrc] = useState<string | null>(null);
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const imageReady = loadedImageSrc === slide.imageSrc;
  const imageFailed = failedImageSrc === slide.imageSrc;
  const cropEmbeddedPoster = usesEmbeddedPosterCrop(slide);

  return (
    <div className={styles.viewerShell}>
      <div className={styles.viewerStage}>
        <div className={styles.viewerToolbar}>
          <span className={styles.viewerPath}>/Users/osdc/Desktop/{slide.id}.img</span>
          <span className={styles.viewerCounter}>
            {slideIndex + 1} / {slideCount}
          </span>
        </div>

        <div className={styles.viewerImageWrap}>
          <div key={slide.id} className={styles.viewerImageStage}>
            <button
              type="button"
              className={styles.viewerImageButton}
              onClick={() => onExpand(slide)}
              aria-label={`Expand ${slide.imageAlt}`}
            >
              <span className={`${styles.viewerImageCanvas} ${cropEmbeddedPoster ? styles.viewerImageCanvasCropped : ''}`}>
                <img
                  className={`${styles.viewerImage} ${cropEmbeddedPoster ? styles.viewerImageCropped : ''} ${imageReady ? styles.viewerImageReady : ''}`}
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  draggable={false}
                  onLoad={() => {
                    setLoadedImageSrc(slide.imageSrc);
                    setFailedImageSrc(null);
                  }}
                  onError={() => setFailedImageSrc(slide.imageSrc)}
                />
              </span>
            </button>
            {!imageReady && !imageFailed ? <div className={styles.viewerImageStatus}>Loading image…</div> : null}
            {imageFailed ? <div className={styles.viewerImageStatus}>This image could not be loaded.</div> : null}
          </div>
        </div>

        {slide.caption ? <div className={styles.viewerCaption}>{slide.caption}</div> : <div className={styles.viewerCaption}>Ready.</div>}
      </div>

      <div key={`${slide.id}-info`} className={styles.viewerInfo}>
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

function ProjectList({ projects }: { projects: ClubbookSlide[] }) {
  return (
    <div className={styles.projectList} aria-label="OSDC projects">
      {projects.map((project, index) => (
        <article className={styles.projectRow} key={project.id} tabIndex={0}>
          <span className={styles.projectNumber}>{String(index + 1).padStart(2, '0')}</span>
          <div className={styles.projectSummary}>
            <span className={styles.projectKicker}>{project.kicker}</span>
            <h2>{project.title}</h2>
          </div>
          <span className={styles.projectHint}>Hover for info</span>
          <div className={styles.projectDetails}>
            <p>{project.description}</p>
            <div className={styles.projectLinks}>
              {project.profileLinks?.map((link) => (
                <a key={`${project.id}-${link.href}`} href={link.href} target="_blank" rel="noreferrer">
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function AboutApplicationView(props: WindowProps) {
  const { application } = props;
  const [sectionId, setSectionId] = useState<ClubbookSectionId>('club');
  const [slideIndex, setSlideIndex] = useState(0);
  const [needsMobileView, setNeedsMobileView] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxLoadedSrc, setLightboxLoadedSrc] = useState<string | null>(null);
  const [lightboxFailedSrc, setLightboxFailedSrc] = useState<string | null>(null);
  const contentParent = useRef<HTMLDivElement>(null);
  const lightboxFrame = useRef<HTMLDivElement>(null);
  const lightboxClose = useRef<HTMLButtonElement>(null);
  const lightboxTrigger = useRef<HTMLElement | null>(null);

  const apis = application.apis;
  const section = clubbookSections[sectionId];
  const slides = section.slides;
  const activeSlide = slides[slideIndex];
  const expandedSlide = lightboxOpen ? activeSlide : null;
  const lightboxImageReady = expandedSlide?.imageSrc === lightboxLoadedSrc;
  const lightboxImageFailed = expandedSlide?.imageSrc === lightboxFailedSrc;

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

  function openLightbox() {
    lightboxTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
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
        closeLightbox();
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
        return;
      }

      if (event.key === 'Tab') {
        const controls = lightboxFrame.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])');

        if (!controls?.length) { return; }
        const first = controls[0];
        const last = controls[controls.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleLightboxKeyDown);

    return () => {
      window.removeEventListener('keydown', handleLightboxKeyDown);
    };
  }, [lightboxOpen, slides.length]);

  useEffect(() => {
    if (!lightboxOpen) { return; }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lightboxClose.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      lightboxTrigger.current?.focus();
    };
  }, [lightboxOpen]);

  useEffect(() => {
    const previous = slides[(slideIndex - 1 + slides.length) % slides.length];
    const next = slides[(slideIndex + 1) % slides.length];

    [previous, next].forEach((slide) => {
      const image = new window.Image();
      image.src = slide.imageSrc;
    });
  }, [slideIndex, slides]);

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
              <a className={styles.tshirtAlert} href="/tshirt" target="_top">
                <span className={styles.tshirtAlertBadge}>NEW!</span>
                <span className={styles.tshirtAlertCopy}>
                  <strong>OSDC T-SHIRTS ARE LIVE</strong>
                  <small>Two designs · ₹699 · click to register</small>
                </span>
                <span className={styles.tshirtAlertCta}>GET YOURS →</span>
              </a>
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

              {sectionId === 'projects' ? (
                <ProjectList projects={slides} />
              ) : (
                <>
                  <SlideViewer
                    slide={activeSlide}
                    slideIndex={slideIndex}
                    slideCount={slides.length}
                    onPrev={goToPreviousSlide}
                    onNext={goToNextSlide}
                    onExpand={openLightbox}
                  />
                  <ThumbnailRail activeIndex={slideIndex} slides={slides} onSelect={setSlideIndex} />
                </>
              )}

              <p className={styles.footerNote}>{section.footer}</p>
            </div>
          </div>
        </div>
      </div>

      {expandedSlide ? createPortal((
        <div className={styles.viewerLightbox} onClick={closeLightbox}>
          <div
            ref={lightboxFrame}
            className={styles.viewerLightboxFrame}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`lightbox-title-${expandedSlide.id}`}
          >
            <div className={styles.viewerLightboxHeader}>
              <div className={styles.viewerLightboxHeading}>
                <span className={styles.viewerLightboxCounter}>{slideIndex + 1} / {slides.length}</span>
                <h2 id={`lightbox-title-${expandedSlide.id}`}>{expandedSlide.title}</h2>
              </div>
              <button
                ref={lightboxClose}
                type="button"
                className={`system-button ${styles.viewerLightboxClose}`}
                onClick={closeLightbox}
                aria-label="Close photo viewer"
              >
                Close
              </button>
            </div>
            <div className={styles.viewerLightboxMedia}>
              <span className={`${styles.viewerLightboxImageCanvas} ${usesEmbeddedPosterCrop(expandedSlide) ? styles.viewerLightboxImageCanvasCropped : ''}`}>
                <img
                  className={`${styles.viewerLightboxImage} ${usesEmbeddedPosterCrop(expandedSlide) ? styles.viewerLightboxImageCropped : ''} ${lightboxImageReady ? styles.viewerLightboxImageReady : ''}`}
                  src={expandedSlide.imageSrc}
                  alt={expandedSlide.imageAlt}
                  draggable={false}
                  onLoad={() => {
                    setLightboxLoadedSrc(expandedSlide.imageSrc);
                    setLightboxFailedSrc(null);
                  }}
                  onError={() => setLightboxFailedSrc(expandedSlide.imageSrc)}
                />
              </span>
              {!lightboxImageReady && !lightboxImageFailed ? <span className={styles.viewerLightboxStatus}>Loading full image…</span> : null}
              {lightboxImageFailed ? <span className={styles.viewerLightboxStatus}>This image could not be loaded.</span> : null}
            </div>
            <div className={styles.viewerLightboxFooter}>
              <button type="button" className={`system-button ${styles.viewerLightboxNav}`} onClick={goToPreviousSlide}>
                Previous
              </button>
              <p className={styles.viewerLightboxCaption}>{expandedSlide.caption ?? expandedSlide.title}</p>
              <button type="button" className={`system-button ${styles.viewerLightboxNav}`} onClick={goToNextSlide}>
                Next
              </button>
            </div>
          </div>
        </div>
      ), document.body) : null}
    </div>
  );
}
