import { JSX } from "react";
import { SubViewNavigation, SubViewParams } from "./AboutView";
import styles from './AboutView.module.css';

type ProjectCopy = {
  title: string,
  english: string[],
  dutch: string[],
  techEnglish: string,
  techDutch: string
}

function Paragraphs(props: { lines: string[] }) {
  return (
    <>
      {props.lines.map((line, index) => <p key={index}>{line}</p>)}
    </>
  );
}

function ProjectPage(props: { params: SubViewParams, copy: ProjectCopy }) {
  const { params, copy } = props;

  function openContactApp() {
    params.manager.open('/Applications/Contact.app');
  }

  const isDutch = params.language === 'nl';
  const backToProjects = isDutch ? 'Terug naar modules' : 'Back to modules';
  const contactHeading = isDutch ? 'Contact' : 'Contact';
  const technologyHeading = isDutch ? 'Technologie' : 'Technology';

  return (
    <>
      <div data-subpage className={styles['subpage']}>
        {SubViewNavigation(params)}
        <div data-subpage-content className={styles['subpage-content']}>
          <h1>{copy.title}</h1>
          <button onClick={() => params.changeParent('projects')} className={styles['button-link']}>{backToProjects}</button>

          <Paragraphs lines={isDutch ? copy.dutch : copy.english} />

          <h3>{technologyHeading}</h3>
          <p>{isDutch ? copy.techDutch : copy.techEnglish}</p>

          <h3>{contactHeading}</h3>
          <p>
            {isDutch ? 'Voor feedback of nieuwe ideeën, open de ' : 'For feedback or new ideas, open the '}
            <a onClick={() => openContactApp()} href="#contact">{isDutch ? 'contact applicatie' : 'contact application'}</a>
            {isDutch ? ' binnen deze desktoplaag.' : ' inside this desktop layer.'}
          </p>

          <button onClick={() => params.changeParent('projects')} className={styles['button-link']}>{backToProjects}</button>
        </div>
      </div>
    </>
  );
}

function renderProject(params: SubViewParams, copy: ProjectCopy) {
  return ProjectPage({ params, copy });
}

export function ProjectRedisClone(params: SubViewParams) {
  return renderProject(params, {
    title: 'Globe Engine',
    english: [
      'This module tracks the OSDC particle globe and the rules around reusing it without changing its authored design.',
      'The focus is preserving the original globe source while wiring it into alternate shells such as the CRT monitor and future feature panels.'
    ],
    dutch: [
      'Deze module volgt de OSDC particle globe en de regels voor hergebruik zonder het originele ontwerp aan te passen.',
      'De focus ligt op het behouden van de originele globe-bron terwijl deze wordt gekoppeld aan alternatieve shells zoals de CRT-monitor en toekomstige featurepanelen.'
    ],
    techEnglish: 'Canvas 2D, iframe embeds, static assets and monitor integration.',
    techDutch: 'Canvas 2D, iframe-embeds, statische assets en monitorintegratie.'
  });
}

export function ProjectPortfolio2024(params: SubViewParams) {
  return renderProject(params, {
    title: 'CRT Hub',
    english: [
      'This module adapts the desk-and-monitor scene into an OSDC entry experience instead of a personal portfolio.',
      'It centers the monitor as the hero surface, layering CRT glass, screen UI, and the live globe inside the same physical scene.'
    ],
    dutch: [
      'Deze module past de bureau-en-monitor scene aan naar een OSDC entree-ervaring in plaats van een persoonlijk portfolio.',
      'De monitor staat centraal als hoofdscherm, met CRT-glas, screen UI en de live globe in dezelfde fysieke scene.'
    ],
    techEnglish: 'Next.js, Three.js, CSS3D and cutout compositing.',
    techDutch: 'Next.js, Three.js, CSS3D en cutout-compositing.'
  });
}

export function ProjectJScript(params: SubViewParams) {
  return renderProject(params, {
    title: 'Events Console',
    english: [
      'The events console is the staging area for poster-driven launches, registrations, and countdown surfaces.',
      'It is meant to hold the louder visual language of the hub while staying coherent with the retro screen framing.'
    ],
    dutch: [
      'De events console is de staging-area voor poster-gedreven lanceringen, registraties en countdown-oppervlakken.',
      'Deze module moet de luidere visuele taal van de hub dragen en tegelijk coherent blijven met de retro screen framing.'
    ],
    techEnglish: 'Structured content panels, overlays and modular event states.',
    techDutch: 'Gestructureerde contentpanelen, overlays en modulaire event-states.'
  });
}

export function ProjectAdventOfCode(params: SubViewParams) {
  return renderProject(params, {
    title: 'Members Index',
    english: [
      'The members index is where roster information, contributor highlights, and future member cards can live.',
      'This module is intentionally simple so it can evolve into richer navigation or profile states later on.'
    ],
    dutch: [
      'De members index is de plek waar rosterinformatie, contributor highlights en toekomstige member cards kunnen leven.',
      'Deze module is bewust eenvoudig zodat hij later kan doorgroeien naar rijkere navigatie of profielstaten.'
    ],
    techEnglish: 'Data-driven panels, navigation states and profile placeholders.',
    techDutch: 'Data-gedreven panelen, navigatiestaten en profielplaceholders.'
  });
}

export function ProjectPortfolio2021(params: SubViewParams) {
  return renderProject(params, {
    title: 'Archive Mode',
    english: [
      'Archive mode is reserved for older posters, screenshots, and community snapshots that should remain accessible without dominating the hub.',
      'It can also serve as the fallback layer for experiments that are not ready for the main screen.'
    ],
    dutch: [
      'Archive mode is gereserveerd voor oudere posters, screenshots en community snapshots die toegankelijk moeten blijven zonder de hub te domineren.',
      'Deze laag kan ook dienen als fallback voor experimenten die nog niet klaar zijn voor het hoofdscherm.'
    ],
    techEnglish: 'Static media panels, archival navigation and low-priority content surfaces.',
    techDutch: 'Statische mediapanelen, archiefnavigatie en contentoppervlakken met lagere prioriteit.'
  });
}

export function ProjectTBot(params: SubViewParams) {
  return renderProject(params, {
    title: 'Community Ops',
    english: [
      'Community ops groups together utility views for volunteers, organizers, and maintainers who need quick operational context.',
      'Think schedules, quick notes, moderation links, and lightweight control surfaces rather than a public-facing splash page.'
    ],
    dutch: [
      'Community ops bundelt utility-views voor vrijwilligers, organisatoren en maintainers die snelle operationele context nodig hebben.',
      'Denk aan schema’s, korte notities, moderatielinks en lichte controleschermen in plaats van een publieke splashpagina.'
    ],
    techEnglish: 'Utility windows, compact controls and operational status panels.',
    techDutch: 'Utility-vensters, compacte controls en operationele statuspanelen.'
  });
}

export function ProjectYoui(params: SubViewParams) {
  return renderProject(params, {
    title: 'Messaging Flow',
    english: [
      'Messaging flow is a placeholder for announcements, prompts, and future in-hub communication patterns.',
      'Its purpose is to test how OSDC updates can feel embedded into the world instead of bolted on as plain alerts.'
    ],
    dutch: [
      'Messaging flow is een placeholder voor aankondigingen, prompts en toekomstige communicatiepatronen binnen de hub.',
      'Het doel is te testen hoe OSDC-updates ingebed kunnen aanvoelen in de wereld, in plaats van als losse meldingen.'
    ],
    techEnglish: 'Inline notifications, modal surfaces and experimental interaction prompts.',
    techDutch: 'Inline notificaties, modale oppervlakken en experimentele interactie-prompts.'
  });
}

export function ProjectPCParts(params: SubViewParams) {
  return renderProject(params, {
    title: 'Resource Board',
    english: [
      'The resource board is a quiet module for references, setup notes, and shared links that support the rest of the experience.',
      'It is intentionally understated so the louder hero and event surfaces stay visually dominant.'
    ],
    dutch: [
      'De resource board is een rustige module voor referenties, setupnotities en gedeelde links die de rest van de ervaring ondersteunen.',
      'Deze laag is bewust ingetogen zodat de luidere hero- en event-oppervlakken visueel dominant blijven.'
    ],
    techEnglish: 'Static lists, document stubs and lightweight navigation.',
    techDutch: 'Statische lijsten, documentstubs en lichte navigatie.'
  });
}

export function ProjectAlbert(params: SubViewParams) {
  return renderProject(params, {
    title: 'Maintainer Desk',
    english: [
      'The maintainer desk is where ownership, shipping notes, and future workflow tooling can live once the hub expands.',
      'It gives the desktop side a place for internal-facing tooling without mixing it into the public-facing monitor experience.'
    ],
    dutch: [
      'De maintainer desk is de plek voor ownership, shipping-notities en toekomstige workflow-tooling zodra de hub verder uitbreidt.',
      'Zo krijgt de desktopkant ruimte voor intern gerichte tooling zonder dit te mengen met de publieke monitorervaring.'
    ],
    techEnglish: 'Workflow panels, maintenance notes and internal tooling surfaces.',
    techDutch: 'Workflowpanelen, maintenance-notities en intern gerichte tooling.'
  });
}

export function ProjectPaintboy(params: SubViewParams) {
  return renderProject(params, {
    title: 'Poster Lab',
    english: [
      'Poster lab is reserved for visual experiments that borrow from the OSDC poster language: type-heavy, bold, and screen-native.',
      'It acts as a sandbox for future event art, section treatments, and UI accents before they move into the main hub.'
    ],
    dutch: [
      'Poster lab is gereserveerd voor visuele experimenten die lenen uit de OSDC-posterstijl: typografisch, uitgesproken en screen-native.',
      'Het werkt als een sandbox voor toekomstige event-art, sectiebehandelingen en UI-accenten voordat ze naar de hoofd-hub gaan.'
    ],
    techEnglish: 'Visual studies, UI treatments and poster-inspired interface experiments.',
    techDutch: 'Visuele studies, UI-behandelingen en poster-geïnspireerde interface-experimenten.'
  });
}
