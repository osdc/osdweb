export type ClubbookSectionId = 'club' | 'community' | 'events' | 'team' | 'orbit';
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

const teamSlideMeta = [
  { label: 'Layer', value: 'Current coordinator roster' },
  { label: 'Role', value: 'Core team member' },
  { label: 'Mode', value: 'Events, ops, community, and chaos control' },
];

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
          'We are a student-run open-source club from JIIT. We learn by building, ship real things together, and treat docs, demos, late-night fixes, and side quests as part of the fun instead of bonus work.',
        imageSrc: '/images/osdc-clubbook/club/banner.jpeg',
        imageAlt: 'OSDC club banner',
        thumbLabel: 'Who we are',
        caption: 'Club banner. Still goes hard.',
        mediaKind: 'photo',
        preferredAspectRatio: 1.48,
        viewerFocus: 'image',
        meta: [
          { label: 'Base', value: 'JIIT Noida' },
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
        id: 'event-osdhack',
        kicker: 'Flagship event',
        title: "OSDHACK '26",
        description:
          'This year the big one is a five-day hackathon built around on-device AI: faster, more private, more local-first, and much harder to fake with API glitter. It is the exact kind of technically serious chaos we enjoy organising.',
        imageSrc: '/images/osdc-clubbook/events/osdhack-25.jpg',
        imageAlt: "OSDHACK '26 banner",
        thumbLabel: "OSDHACK '26",
        mediaKind: 'banner',
        preferredAspectRatio: 1.82,
        viewerFocus: 'image',
        mediaFit: 'contain',
        meta: [
          { label: 'Date', value: 'July 10-14, 2026' },
          { label: 'Theme', value: 'On Device AI' },
          { label: 'Why it matters', value: 'Five straight days of building, side quests, and full-club energy' },
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
  team: {
    id: 'team',
    label: 'Current Team',
    fileHint: '/Users/osdc/Desktop/OSDC.app --team',
    title: 'Current core team',
    intro:
      'This is the batch currently keeping the club moving. Different people carry different lanes, but the shared job is the same: keep OSDC useful, welcoming, funny, and difficult to ignore.',
    footer:
      'Titles are the least interesting part anyway. What matters is who is actually carrying the work when the clock gets rude.',
    slides: [
      createCoordinatorSlide(
        'team-harsh-jha',
        'Harsh Jha',
        '/images/osdc-clubbook/team/harsh-jha.jpg',
        'Portrait of Harsh Jha',
        'Harsh J.',
        'Harsh is one of the people we trust with the difficult bits: shipping ideas, fixing things under pressure, and keeping the weird retro shell from becoming empty theatre. If something needs to work end-to-end, he is usually somewhere in the blast radius.',
        [
          { label: 'GitHub // @life2harsh', href: 'https://github.com/life2harsh' },
        ],
        [
          ...teamSlideMeta,
          { label: 'Their jam', value: 'Shipping the thing before the deadline eats us alive' },
        ]
      ),
      createCoordinatorSlide(
        'team-karvy',
        'Karvy Singh',
        '/images/osdc-clubbook/team/karvy-singh.jpg',
        'Portrait of Karvy Singh',
        'Karvy',
        'Karvy helps keep the club sharp when it comes to execution. Fast context pickup, practical problem-solving, and not freezing when the plan mutates halfway through are very much part of the package.',
        [
          { label: 'GitHub // @Karvy-Singh', href: 'https://github.com/Karvy-Singh' },
        ],
        [
          ...teamSlideMeta,
          { label: 'Their jam', value: 'Turning loose ideas into a proper build path' },
        ]
      ),
      createCoordinatorSlide(
        'team-harsh-sharma',
        'Harsh Sharma',
        '/images/osdc-clubbook/team/harsh-sharma.jpg',
        'Portrait of Harsh Sharma',
        'Harsh S.',
        'Harsh shows up in the layer where club ideas stop being vibes and become deliverables. He is part of the reason our events, build work, and post-event follow-through do not just disappear into attendance fog.',
        [
          { label: 'GitHub // @codelif', href: 'https://github.com/codelif' },
        ],
        [
          ...teamSlideMeta,
          { label: 'Their jam', value: 'Build momentum, cleanup passes, and making outputs stick' },
        ]
      ),
      createCoordinatorSlide(
        'team-saksham-gupta',
        'Saksham Gupta',
        '/images/osdc-clubbook/team/saksham.jpg',
        'Portrait of Saksham Gupta',
        'Saksham',
        'Saksham is part of the reason the club can stay beginner-friendly without becoming watered down. He sits in that useful zone between helping people get unstuck and keeping the work technically honest.',
        [
          { label: 'GitHub // @Sakshamcozykun', href: 'https://github.com/Sakshamcozykun' },
          {
            label: 'Behance // Design Portfolio',
            href: 'https://www.behance.net/gallery/246504151/Saksham-Gupta-Design-Portfolio-2025/modules/1424867425',
          },
        ],
        [
          { label: 'Layer', value: 'Current coordinator roster' },
          { label: 'Role', value: 'Design coordinator' },
          { label: 'Mode', value: 'Visual systems, identity, and event-facing polish' },
          { label: 'Their jam', value: 'Unblocking people without flattening the challenge' },
        ]
      ),
      createCoordinatorSlide(
        'team-bhavya',
        'Bhavya Khatri',
        '/images/osdc-clubbook/team/bhavya-khatri.png',
        'Profile card for Bhavya Khatri',
        'Bhavya',
        'Bhavya helps hold together the communication, presentation, and event-facing side of the club without letting it slip into generic society-page nonsense. Clean visuals, real context, and enough personality to still feel like us.',
        [
          { label: 'GitHub // @bhavyaKhatri2703', href: 'https://github.com/bhavyaKhatri2703' },
        ],
        [
          ...teamSlideMeta,
          { label: 'Their jam', value: 'Posters, visual polish, and keeping the vibe recognisably ours' },
        ]
      ),
      createCoordinatorSlide(
        'team-risha',
        'Risha Gupta',
        '/images/osdc-clubbook/team/risha-gupta.webp',
        'Portrait of Risha Gupta',
        'Risha',
        'Risha is part of the community glue. She helps keep the club readable to new people, survivable during event chaos, and a lot less intimidating than tech spaces usually try to be for no reason.',
        null,
        [
          ...teamSlideMeta,
          { label: 'Their jam', value: 'Community flow, coordination, and making people feel they can start' },
        ]
      ),
      createCoordinatorSlide(
        'team-arnav-sharma',
        'Arnav Sharma',
        '/images/osdc-clubbook/team/arnav-sharma.jpg',
        'Profile card for Arnav Sharma',
        'Arnav',
        'Arnav belongs to the coordinator layer that quietly absorbs the messy work: follow-ups, logistics, internal context, and all the things people only notice when they are missing. That kind of reliability keeps the club alive.',
        [
          { label: 'GitHub // @ItsArnavSh', href: 'https://github.com/ItsArnavSh' },
        ],
        [
          ...teamSlideMeta,
          { label: 'Their jam', value: 'Ops reliability and handling the unglamorous but essential parts' },
        ]
      ),
      createCoordinatorSlide(
        'team-ritika-jain',
        'Ritika Jain',
        '/images/osdc-clubbook/team/default-user.png',
        'Profile card for Ritika Jain',
        'Ritika',
        'Ritika is part of the batch that makes the club feel organised without sanding off the weirdness. She helps hold together people, planning, and follow-through so the fun does not come at the cost of actual execution.',
        [
          { label: 'GitHub // @jainritikaa', href: 'https://github.com/jainritikaa' },
        ],
        [
          ...teamSlideMeta,
          { label: 'Their jam', value: 'Coordination, planning, and keeping the build energy usable' },
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
      'People do not really leave this club. They graduate, get jobs, ship stranger things, and then still reappear as speakers, reviewers, judges, mentors, and the occasional emergency adult in the room.',
    footer:
      'OSDC tradition: people do not really leave, they just get pinged in stranger contexts.',
    slides: [
      {
        id: 'orbit-akshit',
        kicker: 'Older club voice',
        title: 'Akshit Tyagi',
        description:
          'Akshit is one of the people who reminds us that open source is not just about showing up for the big event poster. The deeper work matters too: process memory, mentoring, sustainable tooling, and making sure the next batch inherits context instead of rubble.',
        imageSrc: '/images/osdc-clubbook/orbit/akshit-tyagi.png',
        imageAlt: 'Akshit Tyagi forum avatar',
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
        kicker: 'Talks and mentor loops',
        title: 'Pranshu Srivastava',
        description:
          'Pranshu is exactly the kind of alumni presence we care about: deeply technical, generous with context, and still relevant to the people currently building. He is proof that the club pipeline can grow into serious systems work without losing the instinct to teach back.',
        imageSrc: '/images/osdc-clubbook/orbit/pranshu-srivastava.jpg',
        imageAlt: 'Pranshu Srivastava speaker portrait',
        thumbLabel: 'Pranshu',
        mediaKind: 'portrait',
        preferredAspectRatio: 0.92,
        viewerFocus: 'content',
        meta: [
          { label: 'Creds', value: 'Senior Software Engineer at Red Hat' },
          { label: 'Also', value: 'Kubernetes SIG Instrumentation co-chair' },
          { label: 'Legacy stat', value: 'Node.js Emeritus // still absurdly useful as club memory' },
        ],
        credits: [
          'Red Hat',
          'Kubernetes SIG Instrumentation',
          'Node.js Emeritus',
        ],
      },
      {
        id: 'orbit-biryani',
        kicker: 'Side-quest economics',
        title: 'Karanjot Singh // 0x1729',
        description:
          'Yes, this is still the biryani monies section. Karanjot stands in for the alumni energy that keeps side quests alive: practical support, open-source instincts, and the kind of technically curious brain that makes weird club ideas feel worth backing.',
        imageSrc: '/images/osdc-clubbook/orbit/karanjot-singh.png',
        imageAlt: 'Karanjot Singh speaker portrait',
        thumbLabel: '0x1729',
        mediaKind: 'square',
        preferredAspectRatio: 1,
        viewerFocus: 'balanced',
        meta: [
          { label: 'Creds', value: 'Software Engineer at CERN' },
          { label: 'Interests', value: 'Distributed systems, security, and open source' },
          { label: 'Club mythos', value: 'Proof that our side-quest economy has actual protagonists' },
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
  'team',
  'orbit',
];

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
