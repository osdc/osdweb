export { osdcFastfetchLogo } from './fastfetch';

export type ClubbookSectionId = 'club' | 'community' | 'events' | 'projects' | 'team' | 'orbit';
export type PocketSectionId = 'about' | 'events' | 'coordinators' | 'alumni';
export type MediaKind = 'poster' | 'banner' | 'photo' | 'portrait' | 'square' | 'auto';
export type ViewerFocus = 'image' | 'balanced' | 'content';
export type MediaOrientation = 'portrait' | 'landscape' | 'square';
export type MediaFit = 'contain' | 'cover';

export type ClubbookMetaItem = {
  label: string,
  value: string,
};

export type ClubbookProfileLink = {
  label: string,
  href: string,
};

export type ClubbookSlide = {
  id: string,
  kicker: string,
  title: string,
  description: string,
  imageSrc: string,
  imageAlt: string,
  meta: ClubbookMetaItem[],
  thumbLabel?: string,
  caption?: string,
  mediaKind?: MediaKind,
  preferredAspectRatio?: number,
  viewerFocus?: ViewerFocus,
  mediaFit?: MediaFit,
  mediaPosition?: string,
  mobileTitle?: string,
  mobileStatus?: string,
  profileLinks?: ClubbookProfileLink[],
  credits?: string[],
};

export type ClubbookSection = {
  id: ClubbookSectionId,
  label: string,
  fileHint: string,
  title: string,
  intro: string,
  footer: string,
  slides: ClubbookSlide[],
};

export type PocketSection = {
  id: PocketSectionId,
  label: string,
  status: string,
  fileHint: string,
  slides: ClubbookSlide[],
};

export type SlideMediaDimensions = {
  width: number,
  height: number,
};

export type MediaPresentationProfile = {
  orientation: MediaOrientation,
  kind: Exclude<MediaKind, 'auto'>,
  effectiveAspectRatio: number,
  viewerFocus: ViewerFocus,
  fitMode: MediaFit,
  objectPosition: string,
  desktopStage: {
    aspectRatio: number,
    minHeightRem: number,
    maxMediaWidthRem: number,
    maxMediaHeightRem: number,
    framePaddingRem: number,
    imagePaneWeight: number,
    contentPaneWeight: number,
  },
  mobileStage: {
    aspectRatio: number,
    maxMediaHeightRem: number,
    paddingXRem: number,
    contentDensity: 'compact' | 'balanced' | 'spacious',
  },
};

function teamSlideMeta(role: 'Core coordinator' | 'Senior advisor'): ClubbookMetaItem[] {
  return [
    { label: 'Layer', value: 'Current team' },
    { label: 'Role', value: role },
    { label: 'Mode', value: role === 'Core coordinator' ? 'Builds, ops, community, and chaos control' : 'Context, review, and emergency adulting' },
  ];
}

function createCoordinatorSlide(
  id: string,
  title: string,
  imageSrc: string,
  imageAlt: string,
  thumbLabel: string,
  description: string,
  profileLinks: ClubbookProfileLink[] | null,
  meta: ClubbookMetaItem[]
): ClubbookSlide {
  return {
    id,
    kicker: 'Current lineup',
    title,
    description,
    imageSrc,
    imageAlt,
    thumbLabel,
    mediaKind: 'portrait',
    preferredAspectRatio: 0.84,
    viewerFocus: 'content',
    meta,
    profileLinks: profileLinks ?? undefined,
  };
}

export const clubbookSections: Record<ClubbookSectionId, ClubbookSection> = {
  club: {
    id: 'club',
    label: 'Club',
    fileHint: '/Users/osdc/Desktop/OSDC.app',
    title: 'What OSDC is',
    intro:
      'We are not trying to look polished for the sake of it. This is the version of the club we actually recognize: student-run, open-source first, welcoming, weird, and busy making things.',
    footer:
      'If this is your first pass, start here, then hit Events and Current Team.',
    slides: [
      {
        id: 'club-open',
        kicker: 'Student-run build room',
        title: 'We are OSDC.',
        description:
          'We are a student-run open-source club. We learn by building, ship real things together, and treat docs, demos, late-night fixes, and side quests as part of the fun instead of bonus work.',
        imageSrc: '/images/osdc-clubbook/club/banner.jpeg',
        imageAlt: 'OSDC club banner',
        thumbLabel: 'Who we are',
        caption: 'Club banner. Still goes hard.',
        mediaKind: 'photo',
        preferredAspectRatio: 1.48,
        viewerFocus: 'image',
        meta: [
          { label: 'Base', value: 'Open-source internet, locally assembled' },
          { label: 'Default mode', value: 'Build first, explain while building' },
          { label: 'House rule', value: 'Spectator mode is temporary' },
        ],
      },
      {
        id: 'club-shell',
        kicker: 'No society-page energy',
        title: 'Not a brochure. A workroom.',
        description:
          'We are here for people who want to make things, break them, fix them, and then explain the fix to the next batch. That means workshops, hackathons, installfests, CTFs, poster chaos, review loops, and the occasional 11:57 PM save.',
        imageSrc: '/images/osdc-clubbook/club/logo.jpg',
        imageAlt: 'OSDC logo',
        thumbLabel: 'Why this exists',
        caption: 'Yes, the logo still gets to look like it belongs on a sticker-covered laptop.',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'balanced',
        meta: [
          { label: 'Friendly to', value: 'Beginners, builders, and curious lurkers' },
          { label: 'Not friendly to', value: 'Passive membership theatre' },
          { label: 'Aesthetic bias', value: 'Retro shells and internet-brained details' },
        ],
      },
    ],
  },
  community: {
    id: 'community',
    label: 'Community',
    fileHint: '/Users/osdc/Desktop/OSDC.app --community',
    title: 'How the place feels',
    intro:
      'When the club is working properly, new people are not stuck guessing, experienced people are not bored, and nobody is pretending that filler professionalism is the same thing as substance.',
    footer:
      'Discord is part helpdesk, part build lab, part meme archive. That is not an accident.',
    slides: [
      {
        id: 'community-onboarding',
        kicker: 'Beginner-friendly, not watered down',
        title: 'We get people shipping early.',
        description:
          'If you are new, we do not leave you staring at a blank repo and pretending that counts as onboarding. We pull people into real tasks quickly, pair up, and make sure the first contribution is small enough to ship but real enough to matter.',
        imageSrc: '/images/osdc-clubbook/events/linux-installfest.jpeg',
        imageAlt: 'Linux Installfest event banner',
        thumbLabel: 'Onboarding',
        mediaKind: 'poster',
        preferredAspectRatio: 0.72,
        viewerFocus: 'image',
        mediaFit: 'contain',
        meta: [
          { label: 'First move', value: 'Pick one small real task' },
          { label: 'Good habit', value: 'Ask early; mysterious competence is fake' },
          { label: 'Expected outcome', value: 'Ship, then help the next person ship' },
        ],
      },
      {
        id: 'community-vibe',
        kicker: 'Internet-native by choice',
        title: 'We like the club to feel alive.',
        description:
          'We like memes, retro desktops, stupidly specific references, game-night energy, and shitposts that somehow still lead to working software. The humour is real. So is the work. One does not cancel out the other.',
        imageSrc: '/images/osdc-clubbook/events/weirdmageddon.jpeg',
        imageAlt: 'Weirdmageddon event banner',
        thumbLabel: 'Culture',
        mediaKind: 'poster',
        preferredAspectRatio: 0.72,
        viewerFocus: 'image',
        mediaFit: 'contain',
        meta: [
          { label: 'Tone', value: 'Self-aware, direct, and occasionally cursed' },
          { label: 'What matters', value: 'Useful work, not performative polish' },
          { label: 'Running joke', value: 'Every weird visual choice is somehow on purpose' },
        ],
      },
      {
        id: 'community-ops',
        kicker: 'Club work is more than coding',
        title: 'Ops, design, docs, and logistics count here.',
        description:
          'Posters, registrations, judging rubrics, room setup, writeups, follow-up notes, and that one cable fix five minutes before start time all count as club work. Around here, helping the club function is part of building.',
        imageSrc: '/images/osdc-clubbook/events/openverse-hack-night.jpeg',
        imageAlt: 'OpenVerse Hack Night event banner',
        thumbLabel: 'Ops',
        mediaKind: 'banner',
        preferredAspectRatio: 1.95,
        viewerFocus: 'balanced',
        meta: [
          { label: 'Valid lanes', value: 'Build, design, community, ops, docs' },
          { label: 'Best outcome', value: 'People leave with context and working things' },
          { label: 'Truth', value: 'Somebody still has to carry the event' },
        ],
      },
    ],
  },
  events: {
    id: 'events',
    label: 'Events',
    fileHint: '/Users/osdc/Desktop/OSDC.app --events',
    title: 'What we run',
    intro:
      'These are the kinds of events we keep throwing ourselves into. We like themes, we like people making things, and we like the end result to be more than a room full of attendance.',
    footer:
      'Fun themes are welcome. Working output is still the point.',
    slides: [
      {
        id: 'event-how-to-code',
        kicker: 'Workshop',
        title: 'HOW_TO_CODE?',
        description: 'A hands-on introduction to coding and why it matters, held at JIIT on 18 August 2026.',
        imageSrc: '/images/osdc-clubbook/events/how-to-code.png',
        imageAlt: 'How to Code event poster',
        thumbLabel: 'HOW_TO_CODE?',
        mediaKind: 'banner',
        meta: [
          { label: 'Date', value: '18 August 2026' },
          { label: 'Place', value: 'CL-2, JIIT, Sector 62' },
          { label: 'Details', value: 'fossunited.org/c/jiit/how-to-code' },
        ],
        profileLinks: [{ label: 'Event page', href: 'https://fossunited.org/c/jiit/how-to-code' }],
      },
      {
        id: 'event-gsoc-intro',
        kicker: 'Open source programs',
        title: 'Intro to GSoC & other contribution programs',
        description: 'A practical introduction to Google Summer of Code and other open source contribution programs, held on 27 January 2026.',
        imageSrc: '/images/osdc-clubbook/events/gsoc-talks.png',
        imageAlt: 'Google Summer of Code Talks event poster',
        thumbLabel: 'GSoC intro',
        mediaKind: 'banner',
        meta: [
          { label: 'Date', value: '27 January 2026' },
          { label: 'Place', value: 'CL01, ABB-3, JIIT' },
          { label: 'Details', value: 'FOSS United JIIT' },
        ],
        profileLinks: [{ label: 'Event page', href: 'https://fossunited.org/c/jiit/intro-to-gsoc' }],
      },
      {
        id: 'event-osdhack',
        kicker: 'Git and GitHub workshop',
        title: 'Git Gud',
        description:
          'A hands-on Git and GitHub workshop with a meme-making collaboration, built for first contributions and shared learning.',
        imageSrc: '/images/osdc-clubbook/events/git-gud.png',
        imageAlt: 'Git Gud workshop poster',
        thumbLabel: 'Git Gud',
        mediaKind: 'poster',
        preferredAspectRatio: 0.66,
        viewerFocus: 'image',
        mediaFit: 'contain',
        meta: [
          { label: 'Date', value: '17 September' },
          { label: 'Place', value: 'CL2, JIIT' },
          { label: 'Format', value: 'Git, GitHub, memes, and first contributions' },
        ],
      },
      {
        id: 'event-codejam',
        kicker: 'Team build sprint',
        title: 'CodeJam v6',
        description:
          'CodeJam is where we put people into teams, force ideas into motion, and make the room care about complete working submissions instead of half-finished concept slides. Very healthy. Slightly cruel. Effective.',
        imageSrc: '/images/osdc-clubbook/events/codejam-v6.jpeg',
        imageAlt: 'CodeJam v6 banner',
        thumbLabel: 'CodeJam v6',
        mediaKind: 'banner',
        preferredAspectRatio: 2.25,
        viewerFocus: 'image',
        meta: [
          { label: 'Date', value: 'December 26-30, 2025' },
          { label: 'Format', value: 'Casual but serious team build sprint' },
          { label: 'Club value', value: 'Ship something complete, not theoretical' },
        ],
      },
      {
        id: 'event-installfest',
        kicker: 'Systems day',
        title: 'Linux Installfest',
        description:
          'Installfests are one of the cleanest ways we introduce people to tinkering without dumbing anything down. Bring the machine, break the fear barrier, fix what fails, and leave with fewer excuses.',
        imageSrc: '/images/osdc-clubbook/events/linux-installfest.jpeg',
        imageAlt: 'Linux Installfest banner',
        thumbLabel: 'Installfest',
        mediaKind: 'poster',
        preferredAspectRatio: 0.72,
        viewerFocus: 'image',
        mediaFit: 'contain',
        meta: [
          { label: 'Date', value: 'November 4, 2025' },
          { label: 'Format', value: 'Setup, rescue, and guided debugging' },
          { label: 'Club value', value: 'Hands-on beats passive watching' },
        ],
      },
      {
        id: 'event-openverse',
        kicker: 'Build-night energy',
        title: 'OpenVerse - Hack Night',
        description:
          'Hack nights are where the club feels most natural: people pairing up, poking at ideas, asking for help in the middle of the work, and actually making progress instead of collecting inspiration tabs forever.',
        imageSrc: '/images/osdc-clubbook/events/openverse-hack-night.jpeg',
        imageAlt: 'OpenVerse Hack Night banner',
        thumbLabel: 'OpenVerse',
        mediaKind: 'banner',
        preferredAspectRatio: 2.1,
        viewerFocus: 'balanced',
        meta: [
          { label: 'Date', value: 'November 1-2, 2025' },
          { label: 'Format', value: 'Late-night build session' },
          { label: 'Club value', value: 'Work in public and ask questions while building' },
        ],
      },
      {
        id: 'event-weirdmageddon',
        kicker: 'Theme-heavy chaos',
        title: 'Weirdmageddon',
        description:
          'This is the kind of event title that tells you exactly what sort of club we are. We enjoy playful themes as long as the work is still real, the outputs still exist, and the whole thing remains fun to join.',
        imageSrc: '/images/osdc-clubbook/events/weirdmageddon.jpeg',
        imageAlt: 'Weirdmageddon banner',
        thumbLabel: 'Weirdmageddon',
        mediaKind: 'poster',
        preferredAspectRatio: 0.72,
        viewerFocus: 'image',
        mediaFit: 'contain',
        meta: [
          { label: 'Date', value: 'September 23, 2025' },
          { label: 'Format', value: 'Creative themed event' },
          { label: 'Club value', value: 'Playful does not mean shallow' },
        ],
      },
    ],
  },
  projects: {
    id: 'projects',
    label: 'Projects',
    fileHint: '/Users/osdc/Desktop/OSDC.app --projects',
    title: 'Build board',
    intro:
      'Projects are the clearest record of what the community does with its time: useful tools, playful experiments, and repositories that give the next contributor somewhere to start.',
    footer: 'Pick a repo, read the README, and make the next commit useful.',
    slides: [
      {
        id: 'project-taburei', kicker: 'OSDC project', title: 'TabuRei',
        description: 'A cross browser extension for managing tabs and keeping browser workspaces under control.',
        imageSrc: '/images/osdc-clubbook/club/logo.jpg', imageAlt: 'OSDC logo for the TabuRei project', thumbLabel: 'TabuRei', mediaKind: 'square', viewerFocus: 'balanced',
        meta: [{ label: 'Maintainer', value: 'OSDC' }, { label: 'Type', value: 'Browser extension' }], profileLinks: [{ label: 'GitHub', href: 'https://github.com/osdc/TabuRei' }],
      },
      {
        id: 'project-mercurius', kicker: 'OSDC project', title: 'Mercurius',
        description: 'The community newsletter initiative: a place to collect updates, writing, and useful things from the club.',
        imageSrc: '/images/osdc-clubbook/club/logo.jpg', imageAlt: 'OSDC logo for the Mercurius project', thumbLabel: 'Mercurius', mediaKind: 'square', viewerFocus: 'balanced',
        meta: [{ label: 'Maintainer', value: 'OSDC' }, { label: 'Type', value: 'Community newsletter' }], profileLinks: [{ label: 'GitHub', href: 'https://github.com/osdc/Mercurius' }],
      },
      {
        id: 'project-bots', kicker: 'OSDC project', title: 'Bots',
        description: 'Bots for OSDC community channels and the small pieces of automation that keep community work moving.',
        imageSrc: '/images/osdc-clubbook/club/logo.jpg', imageAlt: 'OSDC logo for the Bots project', thumbLabel: 'Bots', mediaKind: 'square', viewerFocus: 'balanced',
        meta: [{ label: 'Maintainer', value: 'OSDC' }, { label: 'Type', value: 'Community automation' }], profileLinks: [{ label: 'GitHub', href: 'https://github.com/osdc/bots' }],
      },
      {
        id: 'project-pawbar', kicker: 'Member project', title: 'pawbar',
        description: 'A configurable desktop panel built with kitty and Go, made for a personal Linux workflow.',
        imageSrc: '/images/osdc-clubbook/club/logo.jpg', imageAlt: 'OSDC logo for the pawbar project', thumbLabel: 'pawbar', mediaKind: 'square', viewerFocus: 'balanced',
        meta: [{ label: 'Builder', value: 'codelif' }, { label: 'Type', value: 'Linux desktop panel' }], profileLinks: [{ label: 'GitHub', href: 'https://github.com/codelif/pawbar' }],
      },
      {
        id: 'project-jpoop', kicker: 'Member project', title: 'jpoop.in ecosystem',
        description: 'Open tools and services for JIIT students, shaped around the everyday friction of campus life.',
        imageSrc: '/images/osdc-clubbook/club/logo.jpg', imageAlt: 'OSDC logo for the jpoop.in ecosystem', thumbLabel: 'jpoop.in', mediaKind: 'square', viewerFocus: 'balanced',
        meta: [{ label: 'Builder', value: 'OSDC members' }, { label: 'Type', value: 'Student tools' }], profileLinks: [{ label: 'GitHub', href: 'https://github.com/codelif/jpoop.in' }],
      },
      {
        id: 'project-magic-academy', kicker: 'Member project', title: 'OpenSourceMagicAcademy',
        description: 'A community Unity project that turns open-source ideas into a playful world to explore and build on.',
        imageSrc: '/images/osdc-clubbook/club/logo.jpg', imageAlt: 'OSDC logo for OpenSourceMagicAcademy', thumbLabel: 'Magic Academy', mediaKind: 'square', viewerFocus: 'balanced',
        meta: [{ label: 'Builder', value: 'kartinul' }, { label: 'Type', value: 'Unity project' }], profileLinks: [{ label: 'GitHub', href: 'https://github.com/kartinul/OpenSourceMagicAcademy' }],
      },
      {
        id: 'project-jiit-marks', kicker: 'Member project', title: 'jiit-marks',
        description: 'A utility for extracting marks from JIIT web portal report PDFs.',
        imageSrc: '/images/osdc-clubbook/club/logo.jpg', imageAlt: 'OSDC logo for the jiit-marks project', thumbLabel: 'jiit-marks', mediaKind: 'square', viewerFocus: 'balanced',
        meta: [{ label: 'Builder', value: 'codelif' }, { label: 'Type', value: 'Student utility' }], profileLinks: [{ label: 'GitHub', href: 'https://github.com/codelif/jiit-marks' }],
      },
      {
        id: 'project-osdc-wa', kicker: 'Member project', title: 'OSdc-wa',
        description: 'A bridge between the OSDC Discord and WhatsApp communities, helping conversations travel with the people.',
        imageSrc: '/images/osdc-clubbook/club/logo.jpg', imageAlt: 'OSDC logo for the OSdc-wa project', thumbLabel: 'OSdc-wa', mediaKind: 'square', viewerFocus: 'balanced',
        meta: [{ label: 'Builder', value: 'Karvy Singh' }, { label: 'Type', value: 'Community bridge' }], profileLinks: [{ label: 'GitHub', href: 'https://github.com/Karvy-Singh/OSdc-wa' }],
      },
    ],
  },
  team: {
    id: 'team',
    label: 'Current Team',
    fileHint: '/Users/osdc/Desktop/OSDC.app --team',
    title: 'Coordinators and advisors',
    intro:
      'The people currently keeping the builds, events, design files, side quests, and institutional memory moving. The titles help with sorting; the biographies explain the actual situation.',
    footer:
      'Titles are the least interesting part anyway. What matters is who is actually carrying the work when the clock gets rude.',
    slides: [
      createCoordinatorSlide(
        'team-harsh-jha',
        'Harsh Jha',
        '/images/osdc-clubbook/team/harsh-jha.jpg',
        'Portrait of Harsh Jha',
        'Harsh J.',
        `Harsh (life2harsh), The Admin. No introductions needed, but he still writes one because he loves himself. Other than that, bro is mad obsessed about how to make himself even more busy by stacking yet another project on to his portfolio. Passionate, for sure, he knows how to get stuff done.

"Geology is the study of pressure and time. That's all it takes, really. Pressure and time. That and a big goddamn ADHD mind." said Ellis Redding Boyd about Harsh when he finishes his big ahh projects under less time and a hell lot of pressure.`,
        [
          { label: 'GitHub // @life2harsh', href: 'https://github.com/life2harsh' },
        ],
        [
          ...teamSlideMeta('Core coordinator'),
          { label: 'Their jam', value: 'Shipping the thing before the deadline eats us alive' },
        ]
      ),
      createCoordinatorSlide(
        'team-karvy',
        'Karvy Singh',
        '/images/osdc-clubbook/team/karvy-singh.jpg',
        'Portrait of Karvy Singh',
        'Karvy',
        `Karvy Singh is practically the Mother Teresa of Linux, atleast for OSDC. Dabbling in Al/ML and Arch Wiki, all she does now is stare at the bleakness of her terminal and think "Let's rice that shall we?" and goes on to preach how Microslop Windows could never touch Linux. NEVER.

Wanted to see the Serpent of Slytherin, now all she can is Python and Kaggle. Funny moments in her life include debunking Linux Larpers and haters, while converting them into a true follower of our holy God Linus Torvalds. Fangirls Professor Lupin the hardest, followed by(or maybe its the reverse) The Messsiah, Linus Torvalds himself.`,
        [
          { label: 'GitHub // @Karvy-Singh', href: 'https://github.com/Karvy-Singh' },
        ],
        [
          ...teamSlideMeta('Core coordinator'),
          { label: 'Their jam', value: 'Linux, AI/ML, Python, and converting the unconvinced' },
        ]
      ),
      createCoordinatorSlide(
        'team-harsh-sharma',
        'Harsh Sharma',
        '/images/osdc-clubbook/team/harsh-sharma.jpg',
        'Portrait of Harsh Sharma',
        'Harsh S.',
        `Our friendly neighbourhood "i read wiki btw" is here.

Meet Harsh Sharma(codelif). What can we see, there is a blurred line between a nerd and arch autism. And he has both of them. His favourite passtimes include- staring at Linux, explaining how molecules in his system were responsible for his Kernel Panic, and playing the Keyboard like he's the next Stevie Wonder.

"WHAT DO THE NUMBERS MEAN MASON" is prolly what Harsh said to him when Mason wasn't able to recite his Kernel Checksum by heart. I hope he's ok now, Mason obviously. We all know Harsh Sharma is that one guy even Ghost is scared of, because what if codelif asks him to write the drivers for the next Jensen Huang product?`,
        [
          { label: 'GitHub // @codelif', href: 'https://github.com/codelif' },
        ],
        [
          ...teamSlideMeta('Core coordinator'),
          { label: 'Their jam', value: 'Linux internals, keyboard detours, and impossible driver questions' },
        ]
      ),
      createCoordinatorSlide(
        'team-saksham-gupta',
        'Saksham Gupta',
        '/images/osdc-clubbook/team/saksham.jpg',
        'Portrait of Saksham Gupta',
        'Saksham',
        `Saksham, our resident "wait, let me redesign it first" specimen. If you've ever seen an OSDC poster, social media post, website, certificate, stream thumbnail, or basically anything that looked way cooler than it had any right to, chances are he had his hands all over it. A rare species that spends half his day arguing with Figma over a 2-pixel alignment and the other half convincing Git to cooperate. The phrase "good enough" has never existed in his vocabulary.

Being just a designer apparently wasn't enough, so he also became a developer. He'll debate kerning one minute and API architecture the next, all while saying "just one small change" before accidentally redesigning the entire project. Rumour has it GitHub counts his commits while Canva counts his war crimes. His only real merge conflict is between his developer brain saying "it works" and his designer brain replying, "yeah... but it looks ugly."`,
        [
          { label: 'GitHub // @Sakshamcozykun', href: 'https://github.com/Sakshamcozykun' },
          { label: 'Behance // Design portfolio', href: 'https://www.behance.net/gallery/246504151/Saksham-Gupta-Design-Portfolio-2025/modules/1424867425' },
        ],
        [
          ...teamSlideMeta('Core coordinator'),
          { label: 'Their jam', value: 'Design systems, development, and one more tiny redesign' },
        ]
      ),
      createCoordinatorSlide(
        'team-bhavya',
        'Bhavya Khatri',
        '/images/osdc-clubbook/team/bhavya-khatri.png',
        'Profile card for Bhavya Khatri',
        'Bhavya',
        `Bhavya, our Senior Advisor and suspiciously efficient undercover agent. Bro operates between chess boards, badminton courts, and GeoGuessr maps like every day is a classified mission. Calm, precise, and equipped with an unreasonable memory for locations, he keeps his secrets close and his game sharp. If there's a challenge to crack or a place to pinpoint, he's probably already three moves ahead.`,
        [
          { label: 'GitHub // @bhavyaKhatri2703', href: 'https://github.com/bhavyaKhatri2703' },
        ],
        [
          ...teamSlideMeta('Senior advisor'),
          { label: 'Their jam', value: 'Chess, badminton, GeoGuessr, and being three moves ahead' },
        ]
      ),
      createCoordinatorSlide(
        'team-risha',
        'Risha Gupta',
        '/images/osdc-clubbook/team/risha-gupta.webp',
        'Portrait of Risha Gupta',
        'Risha',
        `Risha, our Senior Advisor and the human embodiment of a 90s mixtape. When she isn't singing or experimenting with recipes, she's probably watching movies or adding yet another pair to her dangerously impressive earring collection. Grounded yet vibrant, she somehow curates chaos and still makes it look aesthetic.`,
        null,
        [
          ...teamSlideMeta('Senior advisor'),
          { label: 'Their jam', value: 'Music, recipes, movies, and aesthetically curated chaos' },
        ]
      ),
      createCoordinatorSlide(
        'team-arnav-sharma',
        'Arnav Sharma',
        '/images/osdc-clubbook/team/arnav-sharma.jpg',
        'Profile card for Arnav Sharma',
        'Arnav',
        `Arnav, our Senior Advisor and resident Pokémon Master. Bro brings boundless enthusiasm, playful wit, and enough curiosity to turn every task into a side quest. Always ready for an adventure, he somehow makes even the most boring work feel less painful and a lot more fun.`,
        [
          { label: 'GitHub // @ItsArnavSh', href: 'https://github.com/ItsArnavSh' },
        ],
        [
          ...teamSlideMeta('Senior advisor'),
          { label: 'Their jam', value: 'Pokémon, side quests, and making dull work survivable' },
        ]
      ),
      createCoordinatorSlide(
        'team-mrigank',
        'Mrigank',
        '/images/osdc-clubbook/team/mrigank.png',
        'Portrait of Mrigank',
        'Mrigank',
        `Mrigank, our Senior Advisor and OSDC's ex-design survivor. Having escaped the endless cycle of "can you make it pop more?", bro now spends his time watching anime, hitting the gym, and curating playlists that deal more emotional damage than the design team ever could.

Now he watches the OSDC chaos from the advisor's seat, but the words "just one small design change" are still enough to trigger his fight-or-flight response.`,
        null,
        [
          ...teamSlideMeta('Senior advisor'),
          { label: 'Their jam', value: 'Anime, the gym, playlists, and surviving design feedback' },
        ]
      ),
      createCoordinatorSlide(
        'team-ritika-jain',
        'Ritika Jain',
        '/images/osdc-clubbook/team/ritika-jain.png',
        'Portrait of Ritika Jain',
        'Ritika',
        `Ritika, our Senior Advisor and certified collector of stories, songs, and fictional emotional damage. Her world runs on mystery novels, Harry Potter, Friends, dogs, cats, and enough warmth to make even the most chaotic room feel comfortable. Creative, curious, and always carrying main-character energy, she's the kind of person who somehow makes every conversation feel like the start of a comfort movie.`,
        [
          { label: 'GitHub // @jainritikaa', href: 'https://github.com/jainritikaa' },
        ],
        [
          ...teamSlideMeta('Senior advisor'),
          { label: 'Their jam', value: 'Stories, songs, pets, and comfort-movie energy' },
        ]
      ),
    ],
  },
  orbit: {
    id: 'orbit',
    label: 'Alumni Orbit',
    fileHint: '/Users/osdc/Desktop/OSDC.app --orbit',
    title: 'Alumni orbit',
    intro:
      'Before the titles, teams, and production incidents, they were here: breaking Linux installations, shipping ambitious ideas, and turning late-night curiosity into a community. Meet the alumni who carried OSDC’s open-source spirit into research, infrastructure, startups, and engineering teams around the world.',
    footer:
      'OSDC tradition: people do not really leave, they just get pinged in stranger contexts.',
    slides: [
      {
        id: 'orbit-lakshita-arora', kicker: 'OSDHack community', title: 'Lex // Lakshita Arora',
        description: 'Lakshita is part of the OSDC community featured in the OSDHack ’26 brochure.',
        imageSrc: '/images/osdc-clubbook/alumni/lakshita-arora.png', imageAlt: 'Portrait of Lakshita Arora',
        thumbLabel: 'Lex', mediaKind: 'portrait', viewerFocus: 'content',
        meta: [{ label: 'Community', value: 'OSDC' }, { label: 'Featured in', value: 'OSDHack ’26 brochure' }],
      },
      {
        id: 'orbit-yash-malik', kicker: 'OSDHack community', title: 'Yash Malik',
        description: 'Yash is part of the OSDC community featured in the OSDHack ’26 brochure.',
        imageSrc: '/images/osdc-clubbook/alumni/yash-malik.png', imageAlt: 'Portrait of Yash Malik',
        thumbLabel: 'Yash', mediaKind: 'square', viewerFocus: 'content',
        meta: [{ label: 'Community', value: 'OSDC' }, { label: 'Featured in', value: 'OSDHack ’26 brochure' }],
      },
      {
        id: 'orbit-sanvi-sharma', kicker: 'OSDHack community', title: 'Sanvi Sharma',
        description: 'Sanvi is part of the OSDC community featured in the OSDHack ’26 brochure.',
        imageSrc: '/images/osdc-clubbook/alumni/sanvi-sharma.png', imageAlt: 'Portrait of Sanvi Sharma',
        thumbLabel: 'Sanvi', mediaKind: 'portrait', viewerFocus: 'content',
        meta: [{ label: 'Community', value: 'OSDC' }, { label: 'Featured in', value: 'OSDHack ’26 brochure' }],
      },
      {
        id: 'orbit-soham-kukreti', kicker: 'OSDHack community', title: 'Soham Kukreti',
        description: 'Soham is part of the OSDC community featured in the OSDHack ’26 brochure.',
        imageSrc: '/images/osdc-clubbook/alumni/soham-kukreti.png', imageAlt: 'Portrait of Soham Kukreti',
        thumbLabel: 'Soham', mediaKind: 'portrait', viewerFocus: 'content',
        meta: [{ label: 'Community', value: 'OSDC' }, { label: 'Featured in', value: 'OSDHack ’26 brochure' }],
      },
      {
        id: 'orbit-yuvraj-rathi', kicker: 'Builder and OSDHack alumnus', title: 'Yuvraj Rathi',
        description: 'Yuvraj builds full-stack software and was part of the OSDHack ’23 winning team behind Omilia, an educational game made with Pygame.',
        imageSrc: '/images/osdc-clubbook/alumni/yuvraj-rathi.png', imageAlt: 'Yuvraj Rathi speaking at PyDelhi Conf',
        thumbLabel: 'Yuvraj', mediaKind: 'square', viewerFocus: 'content',
        meta: [{ label: 'Community', value: 'OSDHack ’23 winner' }, { label: 'Focus', value: 'Full-stack development' }],
        profileLinks: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/yuvraj-rathi/' }, { label: 'GitHub', href: 'https://github.com/yryuvraj' }],
      },
      {
        id: 'orbit-satyam-rathi', kicker: 'Open source and AI', title: 'Satyam Rathi',
        description: 'Satyam was an OSDC core team member and part of the OSDHack ’23 winning team behind Omilia. His public work explores deep learning, generative AI, and custom ROMs.',
        imageSrc: '/images/osdc-clubbook/alumni/satyam-rathi.png', imageAlt: 'Portrait of Satyam Rathi',
        thumbLabel: 'Satyam', mediaKind: 'square', viewerFocus: 'content',
        meta: [{ label: 'Community', value: 'OSDC core team and OSDHack ’23 winner' }, { label: 'Interests', value: 'AI and open source' }],
        profileLinks: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/satyam-rathi/' }, { label: 'GitHub', href: 'https://github.com/satyamrathirar' }],
      },
      {
        id: 'orbit-arvind-pj',
        kicker: 'Backend and open source',
        title: 'Arvind PJ',
        description:
          'A JIIT alumnus and backend developer, Arvind returned to share his experience at OSDHack 2022. His public work spans infrastructure, developer tooling, and open source.',
        imageSrc: '/images/osdc-clubbook/alumni/arvind-pj.jpeg',
        imageAlt: 'Portrait of Arvind PJ outdoors',
        thumbLabel: 'Arvind',
        caption: 'Arvind PJ, JIIT alumnus and backend developer.',
        mediaKind: 'portrait',
        preferredAspectRatio: 0.98,
        viewerFocus: 'content',
        meta: [
          { label: 'Focus', value: 'Backend and infrastructure' },
          { label: 'Community', value: 'OSDHack 2022 speaker' },
          { label: 'Open source', value: 'Developer tools and infrastructure' },
        ],
        profileLinks: [
          { label: 'GitHub', href: 'https://github.com/arvindpunk' },
        ],
      },
      {
        id: 'orbit-vaidik',
        kicker: 'Early community builder',
        title: 'Vaidik Kapoor',
        description:
          'One of OSDC’s early community builders, Vaidik turned an open-source-first beginning into a career building products, platforms, and engineering teams. His path spans Mozilla, Plivo, Wingify, Blinkit, and now the CTO role at Sportsfam.',
        imageSrc: '/images/osdc-clubbook/alumni/vaidik-kapoor.jpeg',
        imageAlt: 'Portrait of Vaidik Kapoor',
        thumbLabel: 'Vaidik',
        caption: 'Vaidik Kapoor, builder of products and engineering teams.',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'content',
        meta: [
          { label: 'Now', value: 'CTO at Sportsfam' },
          { label: 'Previously', value: 'VP Engineering at Blinkit' },
          { label: 'Open source', value: 'Google Summer of Code 2011' },
        ],
        profileLinks: [
          { label: 'Website', href: 'https://vaidik.in/' },
          { label: 'About', href: 'https://vaidik.in/about/' },
        ],
        credits: ['Sportsfam', 'Blinkit', 'Google Summer of Code'],
      },
      {
        id: 'orbit-siddhant',
        kicker: 'Contributor turned mentor',
        title: 'Siddhant N. Trivedi',
        description:
          'Siddhant grew from an OSDC core-team contributor into an engineer at Aerospike and a repeat open-source mentor. After participating in Google Summer of Code, he returned to help new contributors through Google Code-in and GSoC with Public Lab.',
        imageSrc: '/images/osdc-clubbook/alumni/siddhant-trivedi.jpeg',
        imageAlt: 'Portrait of Siddhant N. Trivedi',
        thumbLabel: 'Siddhant',
        caption: 'Siddhant N. Trivedi, open-source contributor and mentor.',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'content',
        meta: [
          { label: 'Now', value: 'Engineer at Aerospike' },
          { label: 'Open source', value: 'Google Summer of Code alumnus' },
          { label: 'Mentoring', value: 'Public Lab contributor mentor' },
        ],
        credits: ['Aerospike', 'Google Summer of Code', 'Public Lab'],
      },
      {
        id: 'orbit-kanchan',
        kicker: 'Public-interest open source',
        title: 'Kanchan Joshi',
        description:
          'Kanchan brought OSDC’s open-source ethos to the Internet Archive through Google Summer of Code 2019. Her journey is a reminder that meaningful contributions are not only about shipping code; they also strengthen the public digital infrastructure people rely on.',
        imageSrc: '/images/osdc-clubbook/alumni/kanchan-joshi.png',
        imageAlt: 'Portrait of Kanchan Joshi',
        thumbLabel: 'Kanchan',
        caption: 'Kanchan Joshi, open-source contributor to the Internet Archive.',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'content',
        meta: [
          { label: 'Program', value: 'Google Summer of Code 2019' },
          { label: 'Organization', value: 'Internet Archive' },
          { label: 'Focus', value: 'Public digital infrastructure' },
        ],
        credits: ['Google Summer of Code', 'Internet Archive'],
      },
      {
        id: 'orbit-ankesh',
        kicker: 'Independent technologist',
        title: 'Ankesh Bharti',
        description:
          'An independent researcher and technologist building thoughtful, privacy-minded tools. Ankesh founded Tiles, co-founded User & Agents, and carries the OSDC habit of turning ambitious ideas into open, usable systems.',
        imageSrc: '/images/osdc-clubbook/alumni/ankesh-bharti.jpeg',
        imageAlt: 'Portrait of Ankesh Bharti',
        thumbLabel: 'Ankesh',
        caption: 'Ankesh Bharti, independent researcher and builder.',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'content',
        meta: [
          { label: 'Builds', value: 'Founder of Tiles' },
          { label: 'Research', value: 'Independent technologist' },
          { label: 'Also', value: 'Co-founder of User & Agents' },
        ],
        profileLinks: [
          { label: 'Website', href: 'https://ankeshbharti.com/' },
        ],
        credits: ['Tiles', 'User & Agents'],
      },
      {
        id: 'orbit-pimtron',
        kicker: 'Systems-minded open source',
        title: 'Prashant // Pimtron',
        description:
          'A systems-minded open-source developer whose work spans cloud security, distributed systems, graphics, and AI. Prashant previously maintained KubeArmor at AccuKnox and brings the kind of curiosity that keeps expanding the definition of “the stack.”',
        imageSrc: '/images/osdc-clubbook/alumni/pimtron.png',
        imageAlt: 'Illustrated profile portrait used by Pimtron',
        thumbLabel: 'Pimtron',
        caption: 'Pimtron, systems-minded open-source developer.',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'content',
        meta: [
          { label: 'Open source', value: 'CNCF contributor' },
          { label: 'Previously', value: 'KubeArmor maintainer at AccuKnox' },
          { label: 'Interests', value: 'Cloud security, graphics, distributed systems, and AI' },
        ],
        profileLinks: [
          { label: 'Website', href: 'https://pimtron.dev/' },
          { label: 'About', href: 'https://pimtron.dev/about' },
        ],
        credits: ['CNCF', 'KubeArmor', 'AccuKnox'],
      },
      {
        id: 'orbit-barun',
        kicker: 'Cloud-native systems',
        title: 'Barun Acharya',
        description:
          'Barun works where cloud-native observability meets low-level systems engineering. At Odigos, he helps simplify OpenTelemetry auto-instrumentation; beyond the day job, he maintains KubeArmor, mentors open-source contributors, and speaks about Linux, eBPF, security, and everything happening beneath the abstraction layer.',
        imageSrc: '/images/osdc-clubbook/alumni/barun-acharya.jpeg',
        imageAlt: 'Portrait of Barun Acharya',
        thumbLabel: 'Barun',
        caption: 'Barun Acharya, cloud-native engineer and open-source maintainer.',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'content',
        meta: [
          { label: 'Now', value: 'Senior Software Engineer at Odigos' },
          { label: 'Community', value: 'CNCF Ambassador' },
          { label: 'Open source', value: 'KubeArmor Maintainer' },
        ],
        profileLinks: [
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/barun-acharya' },
          { label: 'Website', href: 'https://barun.cc/about/' },
        ],
        credits: ['Odigos', 'CNCF', 'KubeArmor'],
      },
      {
        id: 'orbit-akshit',
        kicker: 'Older club voice',
        title: 'Akshit Tyagi',
        description:
          'Akshit is one of the people who reminds us that open source is not just about showing up for the big event poster. The deeper work matters too: process memory, mentoring, sustainable tooling, and making sure the next batch inherits context instead of rubble.',
        imageSrc: '/images/osdc-clubbook/orbit/akshit-tyagi.jpeg',
        imageAlt: 'Portrait of Akshit Tyagi',
        thumbLabel: 'Akshit',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'content',
        meta: [
          { label: 'Creds', value: "ML-Ops Engineer at Aftershoot" },
          { label: 'Also', value: "PAP Fellow at YLAC // GSoC '23 with SunPy" },
          { label: 'Why we mention him', value: 'He represents the alumni habit of leaving behind useful context, not just nostalgia' },
        ],
        credits: [
          'Aftershoot',
          'YLAC PAP Fellow',
          "GSoC '23 // SunPy",
        ],
      },
      {
        id: 'orbit-pranshu',
        kicker: 'Systems, mentorship, and biryani monies',
        title: 'Pranshu Srivastava',
        description:
          'Pranshu is exactly the kind of alumni presence OSDC cares about: deeply technical, generous with context, and still relevant to people currently building. His work across Red Hat, Kubernetes SIG Instrumentation, and Node.js shows how serious systems work can keep the instinct to teach back. He also owns the biryani monies lore, proof that some alumni contributions are best measured in working systems, useful context, and properly funded food.',
        imageSrc: '/images/osdc-clubbook/alumni/pranshu-srivastava.jpeg',
        imageAlt: 'Portrait of Pranshu Srivastava',
        thumbLabel: 'Pranshu',
        caption: 'Pranshu Srivastava, systems engineer and open-source community leader.',
        mediaKind: 'portrait',
        preferredAspectRatio: 1,
        viewerFocus: 'content',
        meta: [
          { label: 'Creds', value: 'Senior Software Engineer at Red Hat' },
          { label: 'Also', value: 'Kubernetes SIG Instrumentation co-chair' },
          { label: 'Legacy stat', value: 'Node.js Emeritus // biryani monies benefactor' },
        ],
        credits: [
          'Red Hat',
          'Kubernetes SIG Instrumentation',
          'Node.js Emeritus',
        ],
      },
      {
        id: 'orbit-karanjot',
        kicker: 'Distributed systems and security',
        title: 'Karanjot Singh // 0x1729',
        description:
          'Karanjot brings the kind of technically curious brain that follows difficult systems problems all the way down. His work spans distributed systems, security, and open source, carrying the club habit of treating strange technical side quests as ideas worth taking seriously.',
        imageSrc: '/images/osdc-clubbook/orbit/karanjot-singh.png',
        imageAlt: 'Karanjot Singh speaker portrait',
        thumbLabel: '0x1729',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'balanced',
        meta: [
          { label: 'Creds', value: 'Software Engineer at CERN' },
          { label: 'Interests', value: 'Distributed systems, security, and open source' },
          { label: 'Club thread', value: 'Deep systems work with open-source instincts' },
        ],
        credits: [
          'CERN',
          'Distributed systems',
          'Security',
          'Open source',
        ],
      },
    ],
  },
};

export const clubbookSectionOrder: ClubbookSectionId[] = [
  'club',
  'community',
  'events',
  'projects',
  'team',
  'orbit',
];

const orbitSlidePriority = [
  'orbit-vaidik',
  'orbit-ankesh',
  'orbit-arvind-pj',
  'orbit-kanchan',
  'orbit-pranshu',
  'orbit-barun',
  'orbit-pimtron',
  'orbit-karanjot',
  'orbit-akshit',
  'orbit-lakshita-arora',
  'orbit-yash-malik',
  'orbit-sanvi-sharma',
  'orbit-soham-kukreti',
  'orbit-yuvraj-rathi',
  'orbit-satyam-rathi',
  'orbit-siddhant',
] as const;
const orbitSlidesById = new Map(clubbookSections.orbit.slides.map((slide) => [slide.id, slide]));
clubbookSections.orbit.slides = orbitSlidePriority.flatMap((id) => {
  const slide = orbitSlidesById.get(id);
  return slide ? [slide] : [];
});

export const pocketDeckSections: PocketSection[] = [
  {
    id: 'about',
    label: 'About',
    status: 'Club briefing',
    fileHint: '/Pocket/OSDC/About',
    slides: [
      clubbookSections.club.slides[0],
      clubbookSections.club.slides[1],
      clubbookSections.community.slides[0],
      clubbookSections.community.slides[1],
    ],
  },
  {
    id: 'events',
    label: 'Events',
    status: 'Build logs',
    fileHint: '/Pocket/OSDC/Events',
    slides: clubbookSections.events.slides,
  },
  {
    id: 'coordinators',
    label: 'Coords',
    status: 'Current lineup',
    fileHint: '/Pocket/OSDC/Coords',
    slides: clubbookSections.team.slides,
  },
  {
    id: 'alumni',
    label: 'Alumni',
    status: 'Orbit remains active',
    fileHint: '/Pocket/OSDC/Alumni',
    slides: clubbookSections.orbit.slides,
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function inferMediaKind(aspectRatio: number): Exclude<MediaKind, 'auto'> {
  if (aspectRatio < 0.8) { return 'poster'; }
  if (aspectRatio < 0.95) { return 'portrait'; }
  if (aspectRatio <= 1.12) { return 'square'; }
  if (aspectRatio > 1.92) { return 'banner'; }
  return 'photo';
}

function orientationFromKind(kind: Exclude<MediaKind, 'auto'>): MediaOrientation {
  if (kind === 'poster' || kind === 'portrait') { return 'portrait'; }
  if (kind === 'square') { return 'square'; }
  return 'landscape';
}

function profileFromKind(
  kind: Exclude<MediaKind, 'auto'>,
  ratio: number,
  focus: ViewerFocus,
  fitMode: MediaFit,
  objectPosition: string
): MediaPresentationProfile {
  switch (kind) {
    case 'poster':
      return {
        orientation: 'portrait',
        kind,
        effectiveAspectRatio: clamp(ratio, 0.62, 0.84),
        viewerFocus: focus,
        fitMode,
        objectPosition,
        desktopStage: {
          aspectRatio: clamp(ratio, 0.62, 0.84),
          minHeightRem: 25.5,
          maxMediaWidthRem: 22.5,
          maxMediaHeightRem: 27.5,
          framePaddingRem: 0.55,
          imagePaneWeight: 1.12,
          contentPaneWeight: 0.96,
        },
        mobileStage: {
          aspectRatio: clamp(ratio, 0.62, 0.84),
          maxMediaHeightRem: 24,
          paddingXRem: 0.9,
          contentDensity: 'compact',
        },
      };
    case 'portrait':
      return {
        orientation: 'portrait',
        kind,
        effectiveAspectRatio: clamp(ratio, 0.78, 0.98),
        viewerFocus: focus,
        fitMode,
        objectPosition,
        desktopStage: {
          aspectRatio: clamp(ratio, 0.78, 0.98),
          minHeightRem: 23.5,
          maxMediaWidthRem: 24.5,
          maxMediaHeightRem: 25.5,
          framePaddingRem: 0.58,
          imagePaneWeight: 1.08,
          contentPaneWeight: 1,
        },
        mobileStage: {
          aspectRatio: clamp(ratio, 0.78, 0.98),
          maxMediaHeightRem: 21.5,
          paddingXRem: 0.9,
          contentDensity: 'balanced',
        },
      };
    case 'square':
      return {
        orientation: 'square',
        kind,
        effectiveAspectRatio: clamp(ratio, 0.95, 1.05),
        viewerFocus: focus,
        fitMode,
        objectPosition,
        desktopStage: {
          aspectRatio: 1,
          minHeightRem: 18.5,
          maxMediaWidthRem: 24.5,
          maxMediaHeightRem: 22.5,
          framePaddingRem: 0.7,
          imagePaneWeight: 1.12,
          contentPaneWeight: 0.98,
        },
        mobileStage: {
          aspectRatio: 1,
          maxMediaHeightRem: 16,
          paddingXRem: 1.1,
          contentDensity: 'balanced',
        },
      };
    case 'banner':
      return {
        orientation: 'landscape',
        kind,
        effectiveAspectRatio: clamp(ratio, 1.55, 2.4),
        viewerFocus: focus,
        fitMode,
        objectPosition,
        desktopStage: {
          aspectRatio: clamp(ratio, 1.55, 2.4),
          minHeightRem: 15.5,
          maxMediaWidthRem: 36,
          maxMediaHeightRem: 18.5,
          framePaddingRem: 0.5,
          imagePaneWeight: 1.48,
          contentPaneWeight: 0.92,
        },
        mobileStage: {
          aspectRatio: clamp(ratio, 1.4, 2.15),
          maxMediaHeightRem: 11.5,
          paddingXRem: 0.9,
          contentDensity: 'spacious',
        },
      };
    case 'photo':
    default:
      return {
        orientation: orientationFromKind(kind),
        kind,
        effectiveAspectRatio: clamp(ratio, 1.2, 1.75),
        viewerFocus: focus,
        fitMode,
        objectPosition,
        desktopStage: {
          aspectRatio: clamp(ratio, 1.2, 1.75),
          minHeightRem: 18.75,
          maxMediaWidthRem: 34,
          maxMediaHeightRem: 22.5,
          framePaddingRem: 0.58,
          imagePaneWeight: 1.34,
          contentPaneWeight: 0.96,
        },
        mobileStage: {
          aspectRatio: clamp(ratio, 1.12, 1.55),
          maxMediaHeightRem: 14.75,
          paddingXRem: 0.9,
          contentDensity: 'balanced',
        },
      };
  }
}

export function resolveSlideMediaProfile(
  slide: ClubbookSlide,
  dimensions?: SlideMediaDimensions | null
): MediaPresentationProfile {
  const runtimeAspectRatio = dimensions
    ? dimensions.width / Math.max(dimensions.height, 1)
    : null;
  const fallbackKind = slide.mediaKind && slide.mediaKind !== 'auto'
    ? slide.mediaKind
    : runtimeAspectRatio
      ? inferMediaKind(runtimeAspectRatio)
      : 'photo';
  const focus = slide.viewerFocus ?? 'balanced';
  const defaultAspectRatio = fallbackKind === 'poster'
    ? 0.72
    : fallbackKind === 'portrait'
      ? 0.84
      : fallbackKind === 'square'
        ? 1
      : fallbackKind === 'banner'
          ? 1.9
          : 1.45;
  const effectiveAspectRatio = slide.preferredAspectRatio ?? runtimeAspectRatio ?? defaultAspectRatio;
  const inferredFitMode = slide.mediaFit
    ?? (runtimeAspectRatio && runtimeAspectRatio > effectiveAspectRatio * 1.85 ? 'cover' : 'contain');
  const objectPosition = slide.mediaPosition ?? 'center center';

  return profileFromKind(fallbackKind, effectiveAspectRatio, focus, inferredFitMode, objectPosition);
}
