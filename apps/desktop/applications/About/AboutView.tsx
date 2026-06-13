import { WindowProps } from '@/components/WindowManagement/WindowCompositor';
import { JSX, useEffect, useRef, useState } from 'react';
import styles from './AboutView.module.css';
import { BaseApplicationManager } from '../ApplicationManager';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ProjectAdventOfCode, ProjectAlbert, ProjectJScript, ProjectPCParts, ProjectPaintboy, ProjectPortfolio2021, ProjectPortfolio2024, ProjectRedisClone, ProjectTBot, ProjectYoui } from './Projects';
import { ScreenResolution } from '@/apis/Screen/ScreenService';

type SubView = (
  'home' |
  'about' |
  'experience' |
  'projects' |
  'project-redis' |
  'project-portfolio-2024' |
  'project-j-script' |
  'project-advent-of-code' |
  'project-portfolio-2021' |
  'project-t-bot' |
  'project-youi' |
  'project-pcparts' |
  'project-albert' |
  'project-paintboy' |
  'contact'
);

export type SubViewParams = {
  needsMobileView: boolean,
  manager: BaseApplicationManager,
  changeParent: (view: SubView) => void,
  translate: TFunction,
  language: string
}

function Contact(props: { manager: BaseApplicationManager, language: string }) {
  function openContactApp() {
    props.manager.open('/Applications/Contact.app');
  }

  if (props.language === 'nl') {
    return (
      <>
        <p>
          Gebruik de <a onClick={() => openContactApp()} href="#contact">contact applicatie</a> om feedback, bugs of nieuwe ideeën voor deze OSDC desktoplaag door te sturen.
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        Use the <a onClick={() => openContactApp()} href="#contact">contact application</a> to send feedback, bugs, or new ideas for this OSDC desktop layer.
      </p>
    </>
  );
}

function InfoPanel(props: { language: string }) {
  const title = props.language === 'nl' ? 'Status van deze laag' : 'Layer status';
  const text = props.language === 'nl'
    ? 'Deze desktopzijde wordt omgebouwd tot een OSDC control room. Gebruik hem als interne laag voor modules, notities en experimenten terwijl de monitorervaring wordt uitgewerkt.'
    : 'This desktop side is being repurposed into an OSDC control room. Use it as an internal layer for modules, notes, and experiments while the monitor experience is refined.';

  return (
    <>
      <div className={styles['download-cv']}>
        <hr className={styles['about-hr']}/>
        <div className={styles['download-content']}>
          <img src="/icons/printer.png" alt="Printer" draggable={false} />
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </div>
        <hr className={styles['about-hr']}/>
      </div>
    </>
  );
}

function HomeSubView(params: SubViewParams) {
  const t = params.translate;
  const mobileClass = params.needsMobileView ? styles['mobile'] : '';

  return (
    <>
      <div className={styles['subpage-home']}>
        <h1 className={styles['home-title']}>OSDC</h1>
        <h3 className={styles['home-subtitle']}>Workroom Brief</h3>

        <div className={styles['home-button-container']}>
          <button className={`${styles['home-button']} system-button ${mobileClass}`} onClick={() => params.changeParent('about')}>{t("about.navigation.about")}</button>
          <button className={`${styles['home-button']} system-button ${mobileClass}`} onClick={() => params.changeParent('experience')}>{t("about.navigation.experience")}</button>
          <button className={`${styles['home-button']} system-button ${mobileClass}`} onClick={() => params.changeParent('projects')}>{t("about.navigation.projects")}</button>
          <button className={`${styles['home-button']} system-button ${mobileClass}`} onClick={() => params.changeParent('contact')}>{t("about.navigation.contact")}</button>
        </div>
      </div>
    </>
  );
}

export function SubViewNavigation(params: SubViewParams) {
  const t = params.translate;
  const mobileClass = params.needsMobileView ? styles['mobile'] : '';

  return (
    <>
      <div className={styles['navigation']}>
        <div>
          <span className={styles['logo-part']}>OSDC</span>
          <span className={styles['logo-part']}>Briefing</span>
        </div>

        <div className={`${styles['navigation-button-container']} ${mobileClass}`}>
          <button className='system-button' onClick={() => params.changeParent('home')}>{t("about.navigation.home")}</button>
          <button className='system-button' onClick={() => params.changeParent('about')}>{t("about.navigation.about")}</button>
          <button className='system-button' onClick={() => params.changeParent('experience')}>{t("about.navigation.experience")}</button>
          <button className='system-button' onClick={() => params.changeParent('projects')}>{t("about.navigation.projects")}</button>
          <button className='system-button' onClick={() => params.changeParent('contact')}>{t("about.navigation.contact")}</button>
        </div>
      </div>
    </>
  );
}

function AboutSubView(params: SubViewParams) {
  function RenderDutchContent() {
    return (
      <div>
        <h1 className={styles['page-h1']}>Welkom</h1>

        <p>Deze desktoplaag is nu een OSDC werkruimte in plaats van een persoonlijk portfolio. De focus ligt op de monitor, de globe-integratie en de retro CRT-ervaring eromheen.</p>
        <p>Gebruik deze pagina als plek voor context, interne uitleg en toekomstige modules die niet direct op het grote scherm hoeven te staan.</p>

        <InfoPanel language='nl' />

        <h2>Wat deze build nu doet</h2>
        <p>De 3D desk scene blijft intact, maar de inhoud is omgebogen naar OSDC. De monitor laadt de originele globe in een CRT-shell, terwijl de rest van de desktop als interne laag kan dienen.</p>
        <p>De nadruk ligt nog niet op feature-volledigheid, maar op visuele richting, consistente thematiek en een heldere scheiding tussen publiek scherm en toolachtige panelen.</p>

        <h2>Waar dit heen kan</h2>
        <p>De volgende stappen kunnen bestaan uit member tooling, event scheduling, poster-achtige views en interne control surfaces die dezelfde schermtaal delen.</p>

        <Contact manager={params.manager} language={params.language} />
      </div>
    );
  }

  function RenderEnglishContent() {
    return (
      <div>
        <h1 className={styles['page-h1']}>Welcome</h1>

        <p>This desktop layer is now an OSDC workspace instead of a personal portfolio. The focus is the monitor, the globe integration, and the retro CRT shell around it.</p>
        <p>Use this page as a place for context, internal notes, and future modules that do not need to live directly on the main screen.</p>

        <InfoPanel language='en' />

        <h2>What this build does right now</h2>
        <p>The 3D desk scene stays intact, but the content is redirected toward OSDC. The monitor loads the original globe inside a CRT wrapper, while the rest of the desktop can act as an internal layer.</p>
        <p>The emphasis is not full feature parity yet, but visual direction, thematic consistency, and a clear split between the public monitor and tool-like panels.</p>

        <h2>Where this can go next</h2>
        <p>Next steps can branch into member tooling, event scheduling, poster-driven views, and internal control surfaces that share the same screen language.</p>

        <Contact manager={params.manager} language={params.language} />
      </div>
    );
  }

  return (
    <>
      <div data-subpage className={styles['subpage']}>
        {SubViewNavigation(params)}
        <div data-subpage-content className={styles['subpage-content']}>
          {params.language === 'nl' ? RenderDutchContent() : RenderEnglishContent()}
        </div>
      </div>
    </>
  );
}

function ExperienceSubView(params: SubViewParams) {
  const t = params.translate;

  function dutchContent() {
    return (
      <>
        <h2>2026 - Repurposing pass</h2>
        <p>In deze fase wordt de originele desk scene opnieuw ingericht rondom OSDC. Het belangrijkste doel is een overtuigende entree-ervaring bouwen zonder de handgemaakte globe of CRT-feel te verliezen.</p>

        <h2>Huidige focus</h2>
        <p>De monitorervaring krijgt prioriteit: juiste bulge, scanlines, overlay UI en een duidelijke relatie tussen de publieke hero en de interne desktoplaag.</p>

        <h2>Volgende modules</h2>
        <p>Na de monitor volgen event-oppervlakken, member tooling, statuspanelen en andere schermen die meer utility kunnen toevoegen zonder de visuele lijn te breken.</p>
      </>
    );
  }

  function englishContent() {
    return (
      <>
        <h2>2026 - Repurposing pass</h2>
        <p>In this phase the original desk scene is being redirected around OSDC. The primary goal is to build a convincing entry experience without losing the handcrafted globe or CRT feel.</p>

        <h2>Current focus</h2>
        <p>The monitor experience comes first: correct bulge, scanlines, overlay UI, and a clear relationship between the public hero and the internal desktop layer.</p>

        <h2>Next modules</h2>
        <p>After the monitor, the next surfaces can include event panels, member tooling, status boards, and other screens that add utility without breaking the visual line.</p>
      </>
    );
  }

  return (
    <>
      <div data-subpage className={styles['subpage']}>
        {SubViewNavigation(params)}
        <div data-subpage-content className={styles['subpage-content']}>
          <h1 className={styles['page-h1']}>{t("about.navigation.experience")}</h1>
          {params.language === 'nl' ? dutchContent() : englishContent()}
          <InfoPanel language={params.language} />
          <Contact manager={params.manager} language={params.language} />
        </div>
      </div>
    </>
  );
}

function ProjectsSubView(params: SubViewParams) {
  const t = params.translate;

  function ProjectButton(name: string, target: SubView, imageUrl: string) {
    return (
      <>
        <button className={styles['project-button']} onClick={() => params.changeParent(target)}>
          <div>
            <img src={imageUrl} alt={`${target} thumbnail`} width={25} height={25} />
          </div>
          <span>{name}</span>
        </button>
      </>
    );
  }

  return (
    <>
      <div data-subpage className={styles['subpage']}>
        {SubViewNavigation(params)}
        <div data-subpage-content className={styles['subpage-content']}>
          <h1 className={styles['page-h1']}>{t("about.navigation.projects")}</h1>

          <h2>Core screen</h2>
          <ul>
            <li>{ProjectButton('Globe Engine', 'project-redis', '/icons/project-redis.png')}</li>
            <li>{ProjectButton('CRT Hub', 'project-portfolio-2024', '/icons/project-portfolio-2024.png')}</li>
          </ul>

          <h2>Community modules</h2>
          <ul>
            <li>{ProjectButton('Events Console', 'project-j-script', '/icons/project-j-script.png')}</li>
            <li>{ProjectButton('Members Index', 'project-advent-of-code', '/icons/project-advent-of-code.png')}</li>
            <li>{ProjectButton('Archive Mode', 'project-portfolio-2021', '/icons/project-portfolio-2021.png')}</li>
          </ul>

          <h2>Internal tools</h2>
          <ul>
            <li>{ProjectButton('Community Ops', 'project-t-bot', '/icons/project-t-bot.png')}</li>
            <li>{ProjectButton('Messaging Flow', 'project-youi', '/icons/project-youi.png')}</li>
            <li>{ProjectButton('Resource Board', 'project-pcparts', '/icons/project-pcparts.png')}</li>
            <li>{ProjectButton('Maintainer Desk', 'project-albert', '/icons/project-albert.png')}</li>
            <li>{ProjectButton('Poster Lab', 'project-paintboy', '/icons/project-paintboy.png')}</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function RenderSubView(view: SubView, params: SubViewParams): JSX.Element {
  switch (view) {
    case 'home': return HomeSubView(params);
    case 'about': return AboutSubView(params);
    case 'experience': return ExperienceSubView(params);
    case 'projects': return ProjectsSubView(params);
    case 'project-redis': return ProjectRedisClone(params);
    case 'project-portfolio-2024': return ProjectPortfolio2024(params);
    case 'project-j-script': return ProjectJScript(params);
    case 'project-advent-of-code': return ProjectAdventOfCode(params);
    case 'project-portfolio-2021': return ProjectPortfolio2021(params);
    case 'project-t-bot': return ProjectTBot(params);
    case 'project-youi': return ProjectYoui(params);
    case 'project-pcparts': return ProjectPCParts(params);
    case 'project-albert': return ProjectAlbert(params);
    case 'project-paintboy': return ProjectPaintboy(params);
  }

  return <></>;
}

export default function AboutApplicationView(props: WindowProps) {
  const { application, windowContext } = props;

  const [subView, setSubView] = useState<SubView>('home');
  const [needsMobileView, setNeedsMobileView] = useState<boolean>(false);
  const { t, i18n } = useTranslation("common");

  const apis = application.apis;
  const contentParent = useRef<HTMLDivElement>(null);

  function resetSubPageScroll() {
    if (!contentParent.current) { return; }

    const subViewParent = contentParent.current;
    const subViewParentChildren = Array.from(subViewParent.children);

    const subView = subViewParentChildren.find(x => x.hasAttribute('data-subpage'));
    if (!subView) { return; }

    const subViewChildren = Array.from(subView.children);
    const contentView = subViewChildren.find(x => x.hasAttribute('data-subpage-content'));

    if (!contentView) { return; }
    contentView.scrollTop = 0;
  }

  function onScreenChangeListener(resolution: ScreenResolution): void {
    setNeedsMobileView(resolution.isMobileDevice());
  }

  useEffect(() => {
    const unsubscribe = apis.screen.subscribe(onScreenChangeListener);
    const resolution = apis.screen.getResolution();
    if (resolution) { onScreenChangeListener(resolution); }

    return () => {
      unsubscribe();
    }
  }, []);

  useEffect(() => {
    resetSubPageScroll();
  }, [subView]);

  function changeParent(view: SubView) {
    if (view === 'contact') {
      application.on({ kind: 'about-open-contact-event' }, windowContext);
      return;
    }

    setSubView(view);
  }

  return (
    <div className="content-outer">
      <div className="content">
        <div className='content-inner' ref={contentParent}>
          {RenderSubView(subView, {
            needsMobileView,
            manager: application.manager,
            changeParent,
            translate: t,
            language: i18n.language
          })}
        </div>
      </div>
    </div>
  )
}
