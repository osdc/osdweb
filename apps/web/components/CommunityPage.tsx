import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import styles from './CommunityPage.module.css';

const events = [
  { title: 'Git Gud — Git & GitHub Workshop', date: '17 Sep 2026', place: 'JIIT, CL2', url: 'https://github.com/osdc' },
  { title: 'HOW_TO_CODE?', date: '18 Aug 2026', place: 'JIIT, Sector 62', url: 'https://fossunited.org/c/jiit/how-to-code' },
  { title: 'Intro to GSoC & other Open Source Contribution Programs', date: '27 Jan 2026', place: 'JIIT, Sector 62', url: 'https://fossunited.org/c/jiit/intro-to-gsoc' },
  { title: 'CodeJam v6', date: '26–30 Dec 2025', place: 'Online', url: 'https://fossunited.org/c/jiit/codejam-v6' },
  { title: 'Linux Installfest', date: '4 Nov 2025', place: 'JIIT, Sector 62', url: 'https://fossunited.org/c/jiit' },
  { title: 'OpenVerse — Hack Night', date: '1–2 Nov 2025', place: 'Online', url: 'https://fossunited.org/c/jiit/openverse' },
];
const projects = [
  { title: 'TabuRei', group: 'OSDC', description: 'A cross browser extension for managing tabs.', url: 'https://github.com/osdc/TabuRei' },
  { title: 'Mercurius', group: 'OSDC', description: 'The community newsletter initiative.', url: 'https://github.com/osdc/Mercurius' },
  { title: 'Bots', group: 'OSDC', description: 'Bots for OSDC community channels.', url: 'https://github.com/osdc/bots' },
  { title: 'pawbar', group: 'Member project', description: 'A configurable desktop panel built with kitty and Go.', url: 'https://github.com/codelif/pawbar' },
  { title: 'jpoop.in', group: 'Member project', description: 'An open source web project for JIIT students.', url: 'https://github.com/codelif/jpoop.in' },
  { title: 'jiit-marks', group: 'Member project', description: 'Extract marks from JIIT web portal report PDFs.', url: 'https://github.com/codelif/jiit-marks' },
  { title: 'OpenSourceMagicAcademy', group: 'Member project', description: 'A Unity project from the community.', url: 'https://github.com/kartinul/OpenSourceMagicAcademy' },
  { title: 'OSdc-wa', group: 'Member project', description: 'A bridge between the OSDC Discord and WhatsApp communities.', url: 'https://github.com/Karvy-Singh/OSdc-wa' },
];

export default function CommunityPage() {
  useEffect(() => {
    document.documentElement.classList.add('osdc-scroll-page');
    document.body.classList.add('osdc-scroll-page');
    return () => {
      document.documentElement.classList.remove('osdc-scroll-page');
      document.body.classList.remove('osdc-scroll-page');
    };
  }, []);
  return <div className={styles.page}>
    <Head><title>OSDC — Build with us</title><meta name="description" content="Events and open source projects from the OSDC community at JIIT." /></Head>
    <header className={styles.header}><a href="#top" className={styles.brand}>OSDC<span className={styles.brandMark}>✳</span></a><nav aria-label="Main navigation"><a href="#events">Events</a><a href="#projects">Projects</a><Link href="/tshirt">T-shirt</Link></nav></header>
    <main id="top">
      <section className={styles.hero}><p className={styles.eyebrow}>Open Source Developers Community · JIIT</p><h1>Find your people.<br /><em>Build something real.</em></h1><p>Workshops, hack nights, projects, and a community that learns by shipping together.</p><div className={styles.heroActions}><a href="#events" className={styles.primary}>Explore events <span>↗</span></a><a href="https://discord.gg/osdc" target="_blank" rel="noreferrer" className={styles.secondary}>Join Discord ↗</a></div></section>
      <section id="events" className={styles.section}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>01 / Gather</p><h2>Events</h2></div><a href="https://fossunited.org/c/jiit" target="_blank" rel="noreferrer">All events on FOSS United ↗</a></div><p className={styles.sectionNote}>Recent past events from our JIIT FOSS club page.</p><div className={styles.eventList}>{events.map(event => <a className={styles.event} href={event.url} key={event.title} target="_blank" rel="noreferrer"><span className={styles.eventDate}>{event.date}</span><span className={styles.eventName}>{event.title}<small>{event.place}</small></span><span aria-hidden="true">↗</span></a>)}</div></section>
      <section id="projects" className={styles.section}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>02 / Make</p><h2>Projects</h2></div><a href="https://github.com/osdc" target="_blank" rel="noreferrer">OSDC on GitHub ↗</a></div><p className={styles.sectionNote}>Open work from the club and its members. Pick a repo and start exploring.</p><div className={styles.projectList}>{projects.map(project => <a className={styles.project} href={project.url} key={project.title} target="_blank" rel="noreferrer"><span className={styles.projectGroup}>{project.group}</span><strong>{project.title}</strong><span>{project.description}</span><span className={styles.projectArrow}>View project ↗</span></a>)}</div></section>
      <section className={styles.shirtCallout}><div><p className={styles.eyebrow}>03 / Rep the club</p><h2>Get an OSDC T-shirt</h2><p>Choose your size and send us your registration.</p></div><Link href="/tshirt" className={styles.primary}>Register for a T-shirt ↗</Link></section>
    </main><footer className={styles.footer}><span>OSDC · JIIT, Noida</span><a href="/pocket">Open the clubbook ↗</a></footer>
  </div>;
}
