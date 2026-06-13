(function () {
  const root = document.getElementById("monitor-root");
  const heroClock = document.getElementById("hero-clock");
  const taskbarClock = document.getElementById("taskbar-clock");
  const heroEnter = document.getElementById("hero-enter");
  const globeShell = document.getElementById("globe-shell");
  const globeFrame = document.getElementById("globe-frame");
  const desktopLayer = document.getElementById("desktop-layer");
  const windowsLayer = document.getElementById("windows-layer");
  const taskbarWindows = document.getElementById("taskbar-windows");
  const taskbarStart = document.querySelector(".taskbar-start");
  const startMenu = document.getElementById("taskbar-start-menu");

  const $ = window.jQuery || window.$;
  const WindowCtor = window.$Window;

  const openWindows = new Map();
  let globeWindow = null;
  let desktopBootstrapped = false;
  let currentMode = "hero";
  let startMenuOpen = false;
  let activeWindowKey = null;
  let lastSoundEnabled = null;
  let monitorContent = createDefaultMonitorContent();

  const CLICK_SOUND_SOURCE = "/sounds/left_mouse_down_2.mp3";
  const NOTES_STORAGE_KEY = "osdc-monitor-notes";
  const TERMINAL_FS_STORAGE_KEY = "osdc-monitor-terminal-fs";
  const TERMINAL_DEFAULT_CWD = "/Users/osdc/Desktop/";
  const ICON_POSITIONS_STORAGE_KEY = "osdc-monitor-icon-positions";

  const socialLinks = {
    discord: "https://discord.gg/osdc",
    instagram: "https://www.instagram.com/osdc.dev/",
    linkedin: "https://www.linkedin.com/company/osdcjiit/",
  };

  const projectGroups = [
    {
      title: "Live Projects",
      items: [
        {
          eyebrow: "PUBLIC",
          title: "Monitor Shell",
          status: "In Build",
          owner: "UI + Infra",
          nextShip: "Start menu pass + icon polish",
          artifact: "Landing directly on /osdc-monitor",
        },
        {
          eyebrow: "SIGNATURE",
          title: "Globe Widget",
          status: "Stable",
          owner: "Visual Systems",
          nextShip: "Context overlays for event mode",
          artifact: "Persistent particle globe in-window",
        },
      ],
    },
    {
      title: "Club Modules",
      items: [
        {
          eyebrow: "EVENTS",
          title: "OSDHack Launch Board",
          status: "Review",
          owner: "Events Crew",
          nextShip: "Poster v3 + registration sync",
          artifact: "hack.osdc.dev handoff checklist",
        },
        {
          eyebrow: "MEMBERS",
          title: "Roster + Onboarding",
          status: "In Build",
          owner: "Community",
          nextShip: "Contributor board import",
          artifact: "Discord roles -> monitor roster map",
        },
        {
          eyebrow: "ARCHIVE",
          title: "Season Archive",
          status: "Queued",
          owner: "Ops",
          nextShip: "2025 recap cards",
          artifact: "Screenshot + turnout timeline",
        },
      ],
    },
    {
      title: "Internal Surfaces",
      items: [
        {
          eyebrow: "OPS",
          title: "Community Ops",
          status: "Live",
          owner: "Maintainers",
          nextShip: "Volunteer shift board",
          artifact: "Run-of-show + moderation shortcuts",
        },
        {
          eyebrow: "DOCS",
          title: "Notes + Finder",
          status: "Live",
          owner: "Everyone",
          nextShip: "Pinned docs folder",
          artifact: "Local planning notes and docs browser",
        },
        {
          eyebrow: "PLAY",
          title: "Doom Breakglass",
          status: "Live",
          owner: "Tool Desk",
          nextShip: "Audio + fullscreen polish",
          artifact: "Pointer-lock ready js-dos mount",
        },
      ],
    },
  ];

  const clubStackSections = [
    {
      title: "Incoming",
      entries: [
        "Capture-the-flag poster copy review",
        "Freshers onboarding sheet cleanup",
        "Maintainer Night guest confirmations",
      ],
    },
    {
      title: "Building",
      entries: [
        "Monitor desktop icon pass",
        "Roster board data cards",
        "Finder document shortcuts",
      ],
    },
    {
      title: "Review",
      entries: [
        "OSDHack launch checklist",
        "Archive recap card design",
        "Terminal command set",
      ],
    },
    {
      title: "Live",
      entries: [
        "Globe widget",
        "Discord jump link",
        "Doom breakglass",
      ],
    },
  ];

  const monitorFiles = createMonitorFileSystem();
  const terminalFsState = loadTerminalFsState();
  const terminalFsDirectorySet = new Set(terminalFsState.directories || []);

  applyTerminalFsState();

  const windowDefinitions = {
    briefing: {
      title: "BRIEFING.TXT",
      width: 392,
      height: 286,
      x: 18,
      y: 18,
      render: renderBriefingWindow,
    },
    events: {
      title: "EVENTS.EXE",
      width: 430,
      height: 316,
      x: 68,
      y: 26,
      render: renderEventsWindow,
    },
    members: {
      title: "MEMBERS.DIR",
      width: 408,
      height: 312,
      x: 116,
      y: 70,
      render: renderMembersWindow,
    },
    alumni: {
      title: "ALUMNI.LOG",
      width: 416,
      height: 304,
      x: 34,
      y: 116,
      render: renderAlumniWindow,
    },
    pastEvents: {
      title: "ARCHIVE.SYS",
      width: 420,
      height: 316,
      x: 158,
      y: 44,
      render: renderArchiveWindow,
    },
  };

  function createDefaultMonitorContent() {
    return {
      briefing: {
        intro:
          "Saturday desk is live. The monitor is now the operating surface for launches, docs, review, and demos.",
        stats: [
          { label: "Season", value: "Monsoon Build Loop" },
          { label: "Open Issues", value: "14" },
          { label: "Active Builders", value: "28" },
          { label: "Next Drop", value: "OSDHack Poster v3" }
        ],
        agenda: [
          { time: "17:30", lane: "Design", task: "Poster review and social cutdowns" },
          { time: "18:15", lane: "Community", task: "New member onboarding desk" },
          { time: "19:00", lane: "Build", task: "Open sprint on issues 12-18" },
          { time: "20:30", lane: "Ops", task: "Demo capture and archive upload" }
        ],
        focus: [
          "Ship the monitor polish pass",
          "Lock OSDHack registration assets",
          "Prepare archive cards for the last sprint"
        ],
        links: [
          { label: "Discord", url: "https://discord.gg/osdc" },
          { label: "Instagram", url: "https://www.instagram.com/osdc.dev/" },
          { label: "LinkedIn", url: "https://www.linkedin.com/company/osdcjiit/" }
        ]
      },
      events: {
        intro:
          "Current launch board. These are the event surfaces being shipped, reviewed, or queued right now.",
        items: [
          {
            eyebrow: "FLAGSHIP",
            title: "OSDHack // Build Sprint",
            date: "21 Jun 2026",
            venue: "LT-3 + Discord Stage",
            state: "Registration Live",
            seats: "120 seats",
            description:
              "Club-wide shipping sprint with mentor tables, midnight demos, and fast feedback loops.",
            link: "https://hack.osdc.dev",
            cta: "Open registration",
          },
          {
            eyebrow: "SECURITY JAM",
            title: "CodeJam // Capture The Flag",
            date: "26 Jun 2026",
            venue: "Lab 2",
            state: "Poster Review",
            seats: "48 seats",
            description:
              "Timed challenge blocks, exploit walkthroughs, and writeup reviews for newer members.",
            link: "https://discord.gg/osdc",
            cta: "Join on Discord",
          },
          {
            eyebrow: "MAINTAINERS",
            title: "Maintainer Night",
            date: "04 Jul 2026",
            venue: "Seminar Hall",
            state: "Guest Lock Pending",
            seats: "80 seats",
            description:
              "Lightning talks, live triage, and advice on moving from contribution to stewardship.",
            link: "https://discord.gg/osdc",
            cta: "See schedule",
          },
        ],
      },
      members: {
        intro:
          "Active roster board. Squads rotate, but every lane has a visible focus and next handoff.",
        metrics: [
          { label: "Contributors", value: "28" },
          { label: "Mentor Pairs", value: "11" },
          { label: "Event Crew", value: "9" },
          { label: "Review Queue", value: "6 PRs" }
        ],
        squads: [
          {
            lane: "Build",
            count: "12 people",
            focus: "Desktop polish, launch pages, infra cleanup",
            next: "Merge monitor interaction pass",
          },
          {
            lane: "Design",
            count: "7 people",
            focus: "Poster system, icon cleanup, event cutdowns",
            next: "Approve OSDHack poster v3",
          },
          {
            lane: "Community",
            count: "5 people",
            focus: "Onboarding, review pairing, member spotlight loop",
            next: "Run Saturday onboarding desk",
          },
          {
            lane: "Ops",
            count: "4 people",
            focus: "Venue checklists, archive capture, stage logistics",
            next: "Lock demo recording workflow",
          },
        ],
        board: [
          "Pinned contributor board lives in Discord",
          "Each sprint picks one reviewer for onboarding PRs",
          "Members can rotate lanes between event cycles"
        ]
      },
      alumni: {
        intro:
          "Mentor routing, review help, and guest session slots currently live here.",
        officeHours: [
          {
            lane: "Mentor Desk",
            window: "Wed 20:00",
            focus: "Portfolio review, internship prep, contribution path",
            contact: "Discord office-hours room",
          },
          {
            lane: "Systems / Infra",
            window: "Fri 18:30",
            focus: "Platform engineering, Linux, tooling, OSS careers",
            contact: "Guest rotation every fortnight",
          },
          {
            lane: "Design / Product",
            window: "Sun 17:00",
            focus: "Poster critiques, storytelling, interface direction",
            contact: "Design review channel",
          },
        ],
        outcomes: [
          "Returning mentors review event pages before launch",
          "Guest maintainers help triage issues before build sprints",
          "Legacy repos stay documented so new teams can continue work"
        ]
      },
      pastEvents: {
        intro:
          "Archive log. Used to track what actually worked, what shipped, and what should repeat next season.",
        archive: [
          {
            date: "18 Apr 2026",
            title: "Spring Open Sprint",
            turnout: "41 attendees",
            shipped: "9 merged fixes",
            note: "Small teams + visible task board worked best",
          },
          {
            date: "02 Mar 2026",
            title: "Poster-led Demo Night",
            turnout: "63 attendees",
            shipped: "6 showcase decks",
            note: "Motion-heavy posters drove better turnout",
          },
          {
            date: "21 Jan 2026",
            title: "Maintainer Loop Session",
            turnout: "52 attendees",
            shipped: "3 follow-up issue threads",
            note: "Live triage made contribution paths clearer",
          },
        ],
        repeat: [
          "Keep poster-first promotion",
          "Always pair demos with issue follow-ups",
          "Archive screenshots on the same night as the event"
        ]
      },
    };
  }

  function createMonitorFileSystem() {
    const files = {
      "/Users/osdc/Desktop/readme.txt": {
        title: "README.TXT",
        content:
          "OSDC monitor desktop\n\nThis is the real club desk now.\n\nQuick use:\n- Finder -> docs and shortcuts\n- Notes -> planning pad\n- Terminal -> ls/cd/cat/open/status/events/projects\n- Projects -> live ship board\n- Doom -> breakglass morale tool",
      },
      "/Users/osdc/Documents/club-brief.txt": {
        title: "CLUB-BRIEF.TXT",
        content:
          "OSDC club brief\n\nToday:\n- OSDHack poster review\n- Onboarding desk prep\n- Open sprint on issues 12-18\n\nMain rule:\nThe monitor should feel useful, not decorative. Every window should either ship info, move work forward, or help tell the story of the club.",
      },
      "/Users/osdc/Documents/event-pipeline.txt": {
        title: "EVENT-PIPELINE.TXT",
        content:
          "Event pipeline\n\n1. Pick owner + ship date\n2. Lock poster copy\n3. Publish registration page\n4. Push Discord + socials cutdowns\n5. Capture screenshots same night\n6. Archive turnout, demos, follow-up tasks",
      },
      "/Users/osdc/Documents/member-onboarding.txt": {
        title: "MEMBER-ONBOARDING.TXT",
        content:
          "Member onboarding\n\n- Join Discord and read the pinned board.\n- Pick one lane: Build / Design / Community / Ops.\n- Shadow one review or sprint before claiming tasks.\n- First task should ship in under one week.\n- Ask for a reviewer before polishing in isolation.",
      },
      "/Users/osdc/Documents/libraries.txt": {
        title: "LIBRARIES.TXT",
        content:
          "Runtime stack\n\n- Three.js -> desk scene and camera\n- Next.js -> app shell\n- os-gui -> Win95/98 chrome\n- js-dos -> Doom mount\n- localStorage -> notes persistence\n- monitor-ui.js -> desktop behavior, windows, terminal data",
      },
    };

    const directories = {
      "/": [
        { kind: "directory", name: "Applications", path: "/Applications/", icon: "folder" },
        { kind: "directory", name: "Users", path: "/Users/osdc/", icon: "folder" },
      ],
      "/Applications/": [
        { kind: "app", name: "Finder.app", app: "finder", icon: "folder" },
        { kind: "app", name: "Notes.app", app: "notes", icon: "doc" },
        { kind: "app", name: "Terminal.app", app: "terminal", icon: "terminal" },
        { kind: "app", name: "Projects.app", app: "projects", icon: "projects" },
        { kind: "app", name: "ClubStack.app", app: "skills", icon: "toolbox" },
        { kind: "app", name: "Doom.app", app: "doom", icon: "game" },
      ],
      "/Users/osdc/": [
        { kind: "directory", name: "Desktop", path: "/Users/osdc/Desktop/", icon: "folder" },
        { kind: "directory", name: "Documents", path: "/Users/osdc/Documents/", icon: "folder" },
      ],
      "/Users/osdc/Desktop/": [
        { kind: "directory", name: "Applications", path: "/Applications/", icon: "folder" },
        { kind: "text", name: "readme.txt", path: "/Users/osdc/Desktop/readme.txt", icon: "doc" },
        { kind: "text", name: "club-brief.txt", path: "/Users/osdc/Documents/club-brief.txt", icon: "doc" },
        { kind: "app", name: "Notes.app", app: "notes", icon: "doc" },
        { kind: "app", name: "Projects.app", app: "projects", icon: "projects" },
        { kind: "app", name: "ClubStack.app", app: "skills", icon: "toolbox" },
        { kind: "app", name: "Doom.app", app: "doom", icon: "game" },
        { kind: "link", name: "Discord.url", url: socialLinks.discord, icon: "network" },
      ],
      "/Users/osdc/Documents/": [
        { kind: "text", name: "club-brief.txt", path: "/Users/osdc/Documents/club-brief.txt", icon: "doc" },
        { kind: "text", name: "event-pipeline.txt", path: "/Users/osdc/Documents/event-pipeline.txt", icon: "doc" },
        { kind: "text", name: "member-onboarding.txt", path: "/Users/osdc/Documents/member-onboarding.txt", icon: "doc" },
        { kind: "text", name: "libraries.txt", path: "/Users/osdc/Documents/libraries.txt", icon: "doc" },
      ],
    };

    return { directories, files };
  }

  function loadTerminalFsState() {
    try {
      const raw = window.localStorage.getItem(TERMINAL_FS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;

      if (!parsed || typeof parsed !== "object") {
        return { directories: [], files: {} };
      }

      const directories = Array.isArray(parsed.directories)
        ? parsed.directories.filter(function (entry) {
            return typeof entry === "string" && entry.startsWith("/");
          })
        : [];

      const files = parsed.files && typeof parsed.files === "object"
        ? Object.keys(parsed.files).reduce(function (accumulator, path) {
            if (typeof parsed.files[path] === "string" && path.startsWith("/")) {
              accumulator[path] = parsed.files[path];
            }
            return accumulator;
          }, {})
        : {};

      return { directories, files };
    } catch (error) {
      return { directories: [], files: {} };
    }
  }

  function persistTerminalFsState() {
    try {
      window.localStorage.setItem(
        TERMINAL_FS_STORAGE_KEY,
        JSON.stringify({
          directories: Array.from(terminalFsDirectorySet).sort(),
          files: terminalFsState.files,
        })
      );
    } catch (error) {
      console.error("Unable to save terminal file system state", error);
    }
  }

  function isUserShellDirectory(path) {
    return terminalFsDirectorySet.has(path);
  }

  function isUserShellFile(path) {
    return Object.prototype.hasOwnProperty.call(terminalFsState.files, path);
  }

  function buildTextFileTitle(fileName) {
    return fileName.toUpperCase();
  }

  function getPathBaseName(path) {
    if (!path || path === "/") {
      return "/";
    }

    const normalized = path.endsWith("/") ? path.slice(0, -1) : path;
    const lastSlash = normalized.lastIndexOf("/");

    return lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1);
  }

  function getParentDirectoryPath(path) {
    if (!path || path === "/") {
      return null;
    }

    const normalized = path.endsWith("/") ? path.slice(0, -1) : path;
    const lastSlash = normalized.lastIndexOf("/");

    if (lastSlash <= 0) {
      return "/";
    }

    return `${normalized.slice(0, lastSlash + 1)}`;
  }

  function sortDirectoryEntries(entries) {
    const kindRank = {
      directory: 0,
      app: 1,
      text: 2,
      link: 3,
    };

    entries.sort(function (left, right) {
      const leftRank = kindRank[left.kind] ?? 99;
      const rightRank = kindRank[right.kind] ?? 99;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
    });
  }

  function upsertDirectoryEntry(directoryPath, entry) {
    const entries = monitorFiles.directories[directoryPath] || (monitorFiles.directories[directoryPath] = []);
    const existingIndex = entries.findIndex(function (item) {
      return item.name.toLowerCase() === entry.name.toLowerCase();
    });

    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    sortDirectoryEntries(entries);
  }

  function removeDirectoryEntry(directoryPath, name) {
    const entries = monitorFiles.directories[directoryPath];

    if (!entries) {
      return;
    }

    monitorFiles.directories[directoryPath] = entries.filter(function (entry) {
      return entry.name.toLowerCase() !== name.toLowerCase();
    });
  }

  function isWritableShellDirectory(path) {
    return path.startsWith("/Users/osdc/Desktop/") || path.startsWith("/Users/osdc/Documents/");
  }

  function applyTerminalFsState() {
    Array.from(terminalFsDirectorySet)
      .sort(function (left, right) {
        return left.length - right.length;
      })
      .forEach(function (directoryPath) {
        const parentPath = getParentDirectoryPath(directoryPath);
        const name = getPathBaseName(directoryPath);

        if (!monitorFiles.directories[directoryPath]) {
          monitorFiles.directories[directoryPath] = [];
        }

        if (parentPath && monitorFiles.directories[parentPath]) {
          upsertDirectoryEntry(parentPath, {
            kind: "directory",
            name: name,
            path: directoryPath,
            icon: "folder",
          });
        }
      });

    Object.keys(terminalFsState.files).forEach(function (path) {
      const parentPath = getParentDirectoryPath(path);
      const name = getPathBaseName(path);

      monitorFiles.files[path] = {
        title: buildTextFileTitle(name),
        content: terminalFsState.files[path],
      };

      if (parentPath && monitorFiles.directories[parentPath]) {
        upsertDirectoryEntry(parentPath, {
          kind: "text",
          name: name,
          path: path,
          icon: "doc",
        });
      }
    });
  }

  function createShellDirectory(path) {
    const directoryPath = path.endsWith("/") ? path : `${path}/`;
    const parentPath = getParentDirectoryPath(directoryPath);
    const name = getPathBaseName(directoryPath);

    if (monitorFiles.files[path] || monitorFiles.directories[directoryPath]) {
      return { ok: false, error: `mkdir: ${path}: File exists` };
    }

    if (!parentPath || !monitorFiles.directories[parentPath]) {
      return { ok: false, error: `mkdir: ${path}: No such file or directory` };
    }

    if (!isWritableShellDirectory(parentPath)) {
      return { ok: false, error: `mkdir: ${path}: Read-only file system` };
    }

    monitorFiles.directories[directoryPath] = [];
    terminalFsDirectorySet.add(directoryPath);
    upsertDirectoryEntry(parentPath, {
      kind: "directory",
      name: name,
      path: directoryPath,
      icon: "folder",
    });
    persistTerminalFsState();

    return { ok: true };
  }

  function touchShellFile(path) {
    const parentPath = getParentDirectoryPath(path);
    const name = getPathBaseName(path);

    if (monitorFiles.directories[`${path}/`] || monitorFiles.directories[path]) {
      return { ok: false, error: `touch: ${path}: Is a directory` };
    }

    if (!parentPath || !monitorFiles.directories[parentPath]) {
      return { ok: false, error: `touch: ${path}: No such file or directory` };
    }

    if (!isWritableShellDirectory(parentPath)) {
      return { ok: false, error: `touch: ${path}: Read-only file system` };
    }

    if (!monitorFiles.files[path]) {
      terminalFsState.files[path] = "";
      monitorFiles.files[path] = {
        title: buildTextFileTitle(name),
        content: "",
      };

      upsertDirectoryEntry(parentPath, {
        kind: "text",
        name: name,
        path: path,
        icon: "doc",
      });
      persistTerminalFsState();
    }

    return { ok: true };
  }

  function writeShellFile(path, content, options) {
    const parentPath = getParentDirectoryPath(path);
    const name = getPathBaseName(path);
    const append = Boolean(options && options.append);
    const existing = monitorFiles.files[path];

    if (monitorFiles.directories[`${path}/`] || monitorFiles.directories[path]) {
      return { ok: false, error: `output redirection: ${path}: Is a directory` };
    }

    if (!parentPath || !monitorFiles.directories[parentPath]) {
      return { ok: false, error: `output redirection: ${parentPath || path}: No such file or directory` };
    }

    if (!isWritableShellDirectory(parentPath)) {
      return { ok: false, error: `output redirection: ${path}: Read-only file system` };
    }

    if (existing && !isUserShellFile(path)) {
      return { ok: false, error: `output redirection: ${path}: Read-only file system` };
    }

    const nextContent = append && isUserShellFile(path)
      ? `${terminalFsState.files[path]}${content}`
      : content;

    terminalFsState.files[path] = nextContent;
    monitorFiles.files[path] = {
      title: buildTextFileTitle(name),
      content: nextContent,
    };

    upsertDirectoryEntry(parentPath, {
      kind: "text",
      name: name,
      path: path,
      icon: "doc",
    });
    persistTerminalFsState();

    return { ok: true };
  }

  function removeShellPath(path, recursive) {
    const directoryPath = path.endsWith("/") ? path : `${path}/`;

    if (monitorFiles.files[path]) {
      if (!isUserShellFile(path)) {
        return { ok: false, error: `rm: ${path}: Read-only file system` };
      }

      delete terminalFsState.files[path];
      delete monitorFiles.files[path];
      removeDirectoryEntry(getParentDirectoryPath(path), getPathBaseName(path));
      persistTerminalFsState();
      return { ok: true };
    }

    if (monitorFiles.directories[directoryPath]) {
      if (!isUserShellDirectory(directoryPath)) {
        return { ok: false, error: `rm: ${path}: Read-only file system` };
      }

      const children = monitorFiles.directories[directoryPath] || [];

      if (children.length > 0 && !recursive) {
        return { ok: false, error: `rm: ${path}: Directory not empty` };
      }

      if (recursive) {
        children.slice().forEach(function (entry) {
          if (entry.kind === "directory") {
            removeShellPath(entry.path || `${directoryPath}${entry.name}/`, true);
            return;
          }

          if (entry.kind === "text") {
            removeShellPath(entry.path, true);
          }
        });
      }

      delete monitorFiles.directories[directoryPath];
      terminalFsDirectorySet.delete(directoryPath);
      removeDirectoryEntry(getParentDirectoryPath(directoryPath), getPathBaseName(directoryPath));
      persistTerminalFsState();
      return { ok: true };
    }

    return { ok: false, error: `rm: ${path}: No such file or directory` };
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatTime(now) {
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function syncClock() {
    const display = formatTime(new Date());

    if (heroClock) {
      heroClock.textContent = display;
    }

    if (taskbarClock) {
      taskbarClock.textContent = display;
    }
  }

  function playClickSound() {
    if (lastSoundEnabled === false) {
      return;
    }

    try {
      const audio = new Audio(CLICK_SOUND_SOURCE);
      audio.volume = 0.28;
      audio.play().catch(function () {});
    } catch (error) {
      console.error("Unable to play click sound", error);
    }
  }

  function bindActivator(element, action) {
    if (!element) {
      return;
    }

    element.addEventListener("click", function (event) {
      const suppressUntil = Number(element.dataset.dragSuppressUntil || 0);

      if (suppressUntil && Date.now() < suppressUntil) {
        event.preventDefault();
        return;
      }

      action();
    });
    element.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    });
  }

  function setStartMenuOpen(nextValue) {
    startMenuOpen = nextValue;

    if (startMenu) {
      startMenu.hidden = !nextValue;
    }

    if (taskbarStart) {
      taskbarStart.classList.toggle("is-active", nextValue);
      taskbarStart.setAttribute("aria-expanded", String(nextValue));
    }
  }

  function clampPosition(width, height, left, top) {
    const desktopWorkspace = windowsLayer ? windowsLayer.parentElement : null;

    if (!desktopWorkspace) {
      return { left, top };
    }

    const maxLeft = Math.max(0, desktopWorkspace.clientWidth - width);
    const maxTop = Math.max(0, desktopWorkspace.clientHeight - height);

    return {
      left: Math.min(Math.max(0, left), maxLeft),
      top: Math.min(Math.max(0, top), maxTop),
    };
  }

  function setActiveTask(key) {
    activeWindowKey = key || null;

    openWindows.forEach(function (record, recordKey) {
      if (record.taskButton) {
        record.taskButton.classList.toggle("is-active", recordKey === key && !isWindowMinimized(record.$win) && record.$win.is(":visible"));
      }
    });
  }

  function isWindowMinimized($win) {
    return $win.is(".minimized, .minimized-without-taskbar");
  }

  function createTaskButton(title) {
    if (!taskbarWindows) {
      return null;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "taskbar-window";
    button.textContent = title;
    taskbarWindows.appendChild(button);
    return button;
  }

  function registerWindow(key, $win, taskButton) {
    const record = { $win, taskButton };

    function syncTaskButtonState() {
      if (!taskButton) {
        return;
      }

      const visible = $win.is(":visible");
      const minimized = isWindowMinimized($win) || !visible;
      const isActiveWindow = activeWindowKey === key && !minimized;

      taskButton.classList.toggle("is-minimized", minimized);
      taskButton.classList.toggle("is-active", isActiveWindow);
    }

    openWindows.set(key, record);

    if (taskButton) {
      bindActivator(taskButton, function () {
        if (isWindowMinimized($win) || !$win.is(":visible")) {
          $win.restore();
          $win.bringToFront();
          setActiveTask(key);
          window.setTimeout(syncTaskButtonState, 0);
          return;
        }

        if ($win.is(":visible")) {
          $win.minimize();
          taskButton.classList.remove("is-active");
          window.setTimeout(syncTaskButtonState, 0);
          return;
        }

        $win.restore();
        $win.bringToFront();
        setActiveTask(key);
        window.setTimeout(syncTaskButtonState, 0);
      });

      $win.setMinimizeTarget(taskButton);
    }

    $win.on("focus", function () {
      setActiveTask(key);
    });

    $win.on("closed", function () {
      if (taskButton) {
        taskButton.remove();
      }

      openWindows.delete(key);
    });

    $win.on("pointerdown mousedown", function () {
      setActiveTask(key);
      window.setTimeout(syncTaskButtonState, 0);
    });

    $win.$minimize?.on("click", function () {
      window.setTimeout(syncTaskButtonState, 0);
    });

    $win.$maximize?.on("click", function () {
      window.setTimeout(syncTaskButtonState, 0);
    });

    const observer = new MutationObserver(function () {
      syncTaskButtonState();
    });

    observer.observe($win[0], {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    $win.on("closed", function () {
      observer.disconnect();
    });

    syncTaskButtonState();

    return record;
  }

  function loadSavedIconPositions() {
    try {
      const raw = window.localStorage.getItem(ICON_POSITIONS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function saveIconPositions(positions) {
    try {
      window.localStorage.setItem(ICON_POSITIONS_STORAGE_KEY, JSON.stringify(positions));
    } catch (error) {
      console.error("Unable to save icon positions", error);
    }
  }

  function applyIconPosition(icon, x, y) {
    icon.style.setProperty("--icon-x", `${Math.round(x)}px`);
    icon.style.setProperty("--icon-y", `${Math.round(y)}px`);
    icon.dataset.iconX = String(Math.round(x));
    icon.dataset.iconY = String(Math.round(y));
  }

  function setupDraggableIcons() {
    const icons = Array.from(document.querySelectorAll(".desktop-icon[data-icon-id]"));

    if (icons.length === 0) {
      return;
    }

    const positions = loadSavedIconPositions();

    icons.forEach(function (icon) {
      const iconId = icon.dataset.iconId;
      const saved = positions[iconId];

      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        applyIconPosition(icon, saved.x, saved.y);
      }

      let pointerId = null;
      let startPointerX = 0;
      let startPointerY = 0;
      let startIconX = Number(icon.dataset.iconX || 0);
      let startIconY = Number(icon.dataset.iconY || 0);
      let dragging = false;

      icon.addEventListener("pointerdown", function (event) {
        if (event.button !== 0) {
          return;
        }

        pointerId = event.pointerId;
        startPointerX = event.clientX;
        startPointerY = event.clientY;
        startIconX = Number(icon.dataset.iconX || 0);
        startIconY = Number(icon.dataset.iconY || 0);
        dragging = false;
        icon.setPointerCapture(pointerId);
      });

      icon.addEventListener("pointermove", function (event) {
        if (pointerId !== event.pointerId) {
          return;
        }

        const deltaX = event.clientX - startPointerX;
        const deltaY = event.clientY - startPointerY;

        if (!dragging && Math.hypot(deltaX, deltaY) > 6) {
          dragging = true;
          icon.classList.add("is-dragging");
        }

        if (!dragging) {
          return;
        }

        event.preventDefault();
        applyIconPosition(icon, startIconX + deltaX, startIconY + deltaY);
      });

      function finishDrag(event) {
        if (pointerId !== event.pointerId) {
          return;
        }

        if (icon.hasPointerCapture(pointerId)) {
          icon.releasePointerCapture(pointerId);
        }

        pointerId = null;

        if (!dragging) {
          return;
        }

        dragging = false;
        icon.classList.remove("is-dragging");
        icon.dataset.dragSuppressUntil = String(Date.now() + 250);

        positions[iconId] = {
          x: Number(icon.dataset.iconX || 0),
          y: Number(icon.dataset.iconY || 0),
        };

        saveIconPositions(positions);
      }

      icon.addEventListener("pointerup", finishDrag);
      icon.addEventListener("pointercancel", finishDrag);
    });
  }

  function moveWindowIntoWorkspace($win, x, y) {
    if (!windowsLayer) {
      return;
    }

    $win.appendTo(windowsLayer);
    const position = clampPosition($win.outerWidth(), $win.outerHeight(), x, y);
    $win.css({
      left: `${position.left}px`,
      top: `${position.top}px`,
    });
  }

  function ensurePublicDesktopRuntime() {
    if (desktopBootstrapped) {
      return true;
    }

    if (!$ || !WindowCtor || !windowsLayer) {
      console.error("os-gui failed to load before monitor-ui.js");
      return false;
    }

    const $globeWindow = new WindowCtor({
      title: "GLOBE.MON",
      resizable: false,
      maximizeButton: false,
      minimizeButton: false,
      closeButton: false,
      innerWidth: 236,
      innerHeight: 204,
    });

    $globeWindow.addClass("is-globe-window");
    $globeWindow.$content.append(globeShell);
    globeShell.classList.add("is-windowed");

    moveWindowIntoWorkspace(
      $globeWindow,
      Math.max(0, windowsLayer.parentElement.clientWidth - 256),
      14
    );

    globeWindow = $globeWindow;
    desktopBootstrapped = true;

    return true;
  }

  function setMode(mode) {
    currentMode = mode;
    root.classList.remove("mode-hero", "mode-desktop");
    root.classList.add(`mode-${mode}`);

    if (desktopLayer) {
      desktopLayer.setAttribute("aria-hidden", String(mode !== "desktop"));
    }

    if (mode !== "desktop") {
      setStartMenuOpen(false);
    }
  }

  function pulseGlobeWidget() {
    root.classList.add("globe-pulse");
    window.setTimeout(function () {
      root.classList.remove("globe-pulse");
    }, 520);
  }

  function enterDesktop() {
    if (currentMode === "desktop") {
      return;
    }

    root.classList.add("is-entering");

    window.setTimeout(function () {
      setMode("desktop");

      if (ensurePublicDesktopRuntime()) {
        if (globeWindow) {
          globeWindow.bringToFront();
        }

        pulseGlobeWidget();
      }
    }, 170);

    window.setTimeout(function () {
      root.classList.remove("is-entering");
    }, 470);
  }

  function focusExistingWindow(key) {
    const existing = openWindows.get(key);

    if (!existing) {
      return false;
    }

    if (!existing.$win.is(":visible")) {
      existing.$win.restore();
    }

    existing.$win.bringToFront();
    setActiveTask(key);
    return true;
  }

  function createMonitorWindow(key, options) {
    const $win = new WindowCtor({
      title: options.title,
      resizable: options.resizable !== false,
      maximizeButton: options.maximizeButton !== false,
      minimizeButton: options.minimizeButton !== false,
      closeButton: options.closeButton !== false,
      innerWidth: options.width,
      innerHeight: options.height,
    });

    if (options.className) {
      $win.addClass(options.className);
    }

    $win.$content.css("padding", "0");
    $win.$content.html(options.html || "");

    moveWindowIntoWorkspace($win, options.x, options.y);

    const taskButton = createTaskButton(options.taskTitle || options.title);
    const record = registerWindow(key, $win, taskButton);

    if (typeof options.onReady === "function") {
      options.onReady($win, record);
    }

    $win.bringToFront();
    setActiveTask(key);
    return $win;
  }

  function openOrCreateWindow(key, createWindow) {
    if (currentMode !== "desktop") {
      enterDesktop();
    }

    setStartMenuOpen(false);

    if (focusExistingWindow(key)) {
      return;
    }

    createWindow();
  }

  function renderActionLink(item) {
    if (!item.link) {
      return "";
    }

    const href = escapeHtml(item.link);
    const label = escapeHtml(item.cta || "Open");

    return `<p class="window-note"><a class="window-link" href="${href}" target="_blank" rel="noreferrer">${label}</a></p>`;
  }

  function renderBriefingWindow(content) {
    const intro = escapeHtml(content && content.intro);
    const stats = ((content && content.stats) || [])
      .map(function (item) {
        return (
          `<div class="metric-card">` +
          `<span class="metric-card__label">${escapeHtml(item.label)}</span>` +
          `<strong class="metric-card__value">${escapeHtml(item.value)}</strong>` +
          `</div>`
        );
      })
      .join("");
    const agenda = ((content && content.agenda) || [])
      .map(function (item) {
        return `<tr><td>${escapeHtml(item.time)}</td><td>${escapeHtml(item.lane)}</td><td>${escapeHtml(item.task)}</td></tr>`;
      })
      .join("");
    const focus = ((content && content.focus) || [])
      .map(function (item) {
        return `<li>${escapeHtml(item)}</li>`;
      })
      .join("");
    const links = ((content && content.links) || [])
      .map(function (item) {
        return `<a class="window-chip window-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`;
      })
      .join("");

    return (
      `<div class="window-scroll-area"><div class="window-stack window-stack--tight">` +
      `<div class="window-card"><div class="window-card__eyebrow">LIVE DESK</div><h3>Club Brief</h3><p>${intro}</p></div>` +
      `<div class="metric-grid">${stats}</div>` +
      `<div class="window-card"><div class="window-card__eyebrow">TODAY</div><table class="window-table"><thead><tr><th>Time</th><th>Lane</th><th>Task</th></tr></thead><tbody>${agenda}</tbody></table></div>` +
      `<div class="window-columns">` +
      `<div class="window-card"><div class="window-card__eyebrow">FOCUS</div><ul class="window-list">${focus}</ul></div>` +
      `<div class="window-card"><div class="window-card__eyebrow">JUMPS</div><div class="chip-row">${links}</div></div>` +
      `</div>` +
      `</div></div>`
    );
  }

  function renderEventsWindow(content) {
    const items = (content && content.items) || [];
    const intro = escapeHtml(content && content.intro);

    return (
      `<div class="window-scroll-area"><div class="window-stack window-stack--tight">` +
      `<div class="window-card"><div class="window-card__eyebrow">CURRENT SEASON</div><h3>Event Board</h3><p>${intro}</p></div>` +
      items
        .map(function (item) {
          return (
            `<div class="window-card">` +
            `<div class="window-card__eyebrow">${escapeHtml(item.eyebrow)}</div>` +
            `<h3>${escapeHtml(item.title)}</h3>` +
            `<div class="meta-row">` +
            `<span class="window-chip">${escapeHtml(item.date)}</span>` +
            `<span class="window-chip">${escapeHtml(item.venue)}</span>` +
            `<span class="window-chip">${escapeHtml(item.seats)}</span>` +
            `<span class="window-chip">${escapeHtml(item.state)}</span>` +
            `</div>` +
            `<p>${escapeHtml(item.description)}</p>` +
            `${renderActionLink(item)}` +
            `</div>`
          );
        })
        .join("") +
      `</div></div>`
    );
  }

  function renderMembersWindow(content) {
    const metrics = (content && content.metrics) || [];
    const squads = (content && content.squads) || [];
    const intro = escapeHtml(content && content.intro);
    const board = (content && content.board) || [];

    return (
      `<div class="window-scroll-area"><div class="window-stack window-stack--tight">` +
      `<div class="window-card"><div class="window-card__eyebrow">ACTIVE ROSTER</div><h3>Member Board</h3><p>${intro}</p></div>` +
      `<div class="metric-grid">` +
      metrics
        .map(function (item) {
          return (
            `<div class="metric-card">` +
            `<span class="metric-card__label">${escapeHtml(item.label)}</span>` +
            `<strong class="metric-card__value">${escapeHtml(item.value)}</strong>` +
            `</div>`
          );
        })
        .join("") +
      `</div>` +
      `<div class="window-card"><div class="window-card__eyebrow">SQUADS</div><table class="window-table"><thead><tr><th>Lane</th><th>Count</th><th>Current Focus</th><th>Next</th></tr></thead><tbody>` +
      squads.map(function (item) {
        return `<tr><td>${escapeHtml(item.lane)}</td><td>${escapeHtml(item.count)}</td><td>${escapeHtml(item.focus)}</td><td>${escapeHtml(item.next)}</td></tr>`;
      }).join("") +
      `</tbody></table></div>` +
      `<div class="window-card"><div class="window-card__eyebrow">BOARD RULES</div><ul class="window-list">${board.map(function (item) { return `<li>${escapeHtml(item)}</li>`; }).join("")}</ul></div>` +
      `</div></div>`
    );
  }

  function renderAlumniWindow(content) {
    const officeHours = (content && content.officeHours) || [];
    const intro = escapeHtml(content && content.intro);
    const outcomes = (content && content.outcomes) || [];

    return (
      `<div class="window-scroll-area"><div class="window-stack window-stack--tight">` +
      `<div class="window-card"><div class="window-card__eyebrow">ALUMNI NETWORK</div><h3>Mentor Board</h3><p>${intro}</p></div>` +
      `<div class="window-columns">` +
      officeHours
        .map(function (item) {
          return (
            `<div class="window-card">` +
            `<div class="window-card__eyebrow">${escapeHtml(item.lane)}</div>` +
            `<h3>${escapeHtml(item.window)}</h3>` +
            `<p>${escapeHtml(item.focus)}</p>` +
            `<p class="window-note">${escapeHtml(item.contact)}</p>` +
            `</div>`
          );
        })
        .join("") +
      `</div>` +
      `<div class="window-card"><div class="window-card__eyebrow">WHAT THIS BOARD DOES</div><ul class="window-list">${outcomes.map(function (item) { return `<li>${escapeHtml(item)}</li>`; }).join("")}</ul></div>` +
      `</div></div>`
    );
  }

  function renderArchiveWindow(content) {
    const archive = (content && content.archive) || [];
    const intro = escapeHtml(content && content.intro);
    const repeat = (content && content.repeat) || [];

    return (
      `<div class="window-scroll-area"><div class="window-stack window-stack--tight">` +
      `<div class="window-card"><div class="window-card__eyebrow">MEMORY WALL</div><h3>Archive Log</h3><p>${intro}</p></div>` +
      `<div class="window-card"><table class="window-table"><thead><tr><th>Date</th><th>Session</th><th>Turnout</th><th>Shipped</th><th>Takeaway</th></tr></thead><tbody>` +
      archive.map(function (item) {
        return `<tr><td>${escapeHtml(item.date)}</td><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.turnout)}</td><td>${escapeHtml(item.shipped)}</td><td>${escapeHtml(item.note)}</td></tr>`;
      }).join("") +
      `</tbody></table></div>` +
      `<div class="window-card"><div class="window-card__eyebrow">REPEAT NEXT SEASON</div><ul class="window-list">${repeat.map(function (item) { return `<li>${escapeHtml(item)}</li>`; }).join("")}</ul></div>` +
      `</div></div>`
    );
  }

  function createContentWindow(windowKey) {
    const definition = windowDefinitions[windowKey];

    if (!definition || !$ || !WindowCtor) {
      return null;
    }

    const content = definition.render(monitorContent[windowKey] || {});

    return createMonitorWindow(windowKey, {
      title: definition.title,
      width: definition.width,
      height: definition.height,
      x: definition.x,
      y: definition.y,
      html: content,
    });
  }

  function openContentWindow(windowKey) {
    openOrCreateWindow(windowKey, function () {
      createContentWindow(windowKey);
    });
  }

  function getDirectoryEntries(path) {
    return monitorFiles.directories[path] || null;
  }

  function getTextFile(path) {
    return monitorFiles.files[path] || null;
  }

  function normalizeFsPath(input, cwd) {
    if (!input) {
      return cwd;
    }

    const startsAbsolute = input.startsWith("/");
    const wantsDirectory = input.endsWith("/");
    const raw = startsAbsolute ? input : `${cwd}${input}`;
    const segments = [];

    raw.split("/").forEach(function (segment) {
      if (!segment || segment === ".") {
        return;
      }

      if (segment === "..") {
        segments.pop();
        return;
      }

      segments.push(segment);
    });

    const joined = `/${segments.join("/")}`;
    const directoryCandidate = joined === "/" ? "/" : `${joined}/`;

    if (getDirectoryEntries(directoryCandidate)) {
      return directoryCandidate;
    }

    if (getTextFile(joined)) {
      return joined;
    }

    if (!joined.toLowerCase().endsWith(".txt") && getTextFile(`${joined}.txt`)) {
      return `${joined}.txt`;
    }

    return wantsDirectory ? directoryCandidate : joined;
  }

  function renderFinderEntry(entry) {
    if (entry.kind === "directory") {
      return (
        `<button class="finder-entry" type="button" data-entry-type="directory" data-entry-target="${escapeHtml(entry.path)}">` +
        `<span class="finder-entry__icon desktop-icon__art desktop-icon__art--folder" aria-hidden="true"></span>` +
        `<span class="finder-entry__label">${escapeHtml(entry.name)}</span>` +
        `</button>`
      );
    }

    if (entry.kind === "text") {
      return (
        `<button class="finder-entry" type="button" data-entry-type="text" data-entry-target="${escapeHtml(entry.path)}">` +
        `<span class="finder-entry__icon desktop-icon__art desktop-icon__art--doc" aria-hidden="true"></span>` +
        `<span class="finder-entry__label">${escapeHtml(entry.name)}</span>` +
        `</button>`
      );
    }

    if (entry.kind === "link") {
      return (
        `<button class="finder-entry" type="button" data-entry-type="link" data-entry-target="${escapeHtml(entry.url)}">` +
        `<span class="finder-entry__icon desktop-icon__art desktop-icon__art--network" aria-hidden="true"></span>` +
        `<span class="finder-entry__label">${escapeHtml(entry.name)}</span>` +
        `</button>`
      );
    }

    const iconClass = entry.icon === "projects"
      ? "desktop-icon__art--projects"
      : entry.icon === "terminal"
      ? "desktop-icon__art--terminal"
      : entry.icon === "game"
      ? "desktop-icon__art--game"
      : entry.icon === "doc"
      ? "desktop-icon__art--doc"
      : "desktop-icon__art--toolbox";

    return (
      `<button class="finder-entry" type="button" data-entry-type="app" data-entry-target="${escapeHtml(entry.app)}">` +
      `<span class="finder-entry__icon desktop-icon__art ${iconClass}" aria-hidden="true"></span>` +
      `<span class="finder-entry__label">${escapeHtml(entry.name)}</span>` +
      `</button>`
    );
  }

  function renderFinderWindow(path) {
    const entries = getDirectoryEntries(path) || [];

    return (
      `<div class="finder-shell">` +
      `<aside class="finder-sidebar">` +
      `<div class="finder-sidebar__label">Favorites</div>` +
      `<button class="system-button finder-sidebar__button" type="button" data-finder-path="/Applications/">Applications</button>` +
      `<button class="system-button finder-sidebar__button" type="button" data-finder-path="/Users/osdc/">Home</button>` +
      `<button class="system-button finder-sidebar__button" type="button" data-finder-path="/Users/osdc/Desktop/">Desktop</button>` +
      `<button class="system-button finder-sidebar__button" type="button" data-finder-path="/Users/osdc/Documents/">Documents</button>` +
      `</aside>` +
      `<section class="finder-body">` +
      `<div class="finder-toolbar">` +
      `<span class="finder-toolbar__label">Location</span>` +
      `<span class="finder-path">${escapeHtml(path)}</span>` +
      `</div>` +
      `<div class="finder-grid">${entries.map(renderFinderEntry).join("")}</div>` +
      `</section>` +
      `</div>`
    );
  }

  function openTextDocument(path) {
    const file = getTextFile(path);

    if (!file) {
      return;
    }

    const key = `doc:${path}`;

    openOrCreateWindow(key, function () {
      createMonitorWindow(key, {
        title: file.title,
        taskTitle: file.title,
        width: 404,
        height: 308,
        x: 132,
        y: 84,
        html:
          `<div class="window-scroll-area document-shell">` +
          `<pre class="document-text">${escapeHtml(file.content)}</pre>` +
          `</div>`,
      });
    });
  }

  function openFinderWindow(initialPath) {
    const key = "finder";

    openOrCreateWindow(key, function () {
      createMonitorWindow(key, {
        title: "FINDER.EXE",
        taskTitle: "Finder",
        width: 510,
        height: 340,
        x: 64,
        y: 62,
        html: "",
        onReady: function ($win) {
          let currentPath = initialPath || TERMINAL_DEFAULT_CWD;

          function mount(path) {
            currentPath = path;
            $win.$content.html(renderFinderWindow(path));
            const content = $win.$content[0];

            content.querySelectorAll("[data-finder-path]").forEach(function (button) {
              bindActivator(button, function () {
                mount(button.getAttribute("data-finder-path"));
              });
            });

            content.querySelectorAll("[data-entry-type]").forEach(function (button) {
              bindActivator(button, function () {
                const type = button.getAttribute("data-entry-type");
                const target = button.getAttribute("data-entry-target");

                if (type === "directory") {
                  mount(target);
                  return;
                }

                if (type === "text") {
                  openTextDocument(target);
                  return;
                }

                if (type === "link") {
                  window.open(target, "_blank", "noopener,noreferrer");
                  return;
                }

                openTool(target);
              });
            });
          }

          mount(currentPath);
        },
      });
    });
  }

  function getSavedNotes() {
    try {
      return window.localStorage.getItem(NOTES_STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function saveNotes(value) {
    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, value);
    } catch (error) {
      console.error("Unable to save notes", error);
    }
  }

  function openNotesWindow() {
    const key = "notes";

    openOrCreateWindow(key, function () {
      createMonitorWindow(key, {
        title: "NOTES.EXE",
        taskTitle: "Notes",
        width: 412,
        height: 320,
        x: 152,
        y: 96,
        html:
          `<div class="notes-shell">` +
          `<div class="notes-toolbar">` +
          `<button class="system-button notes-save" type="button">Save</button>` +
          `<span class="notes-status">Saved locally in this browser.</span>` +
          `</div>` +
          `<textarea class="notes-textarea system-text-input" spellcheck="false"></textarea>` +
          `</div>`,
        onReady: function ($win) {
          const content = $win.$content[0];
          const textarea = content.querySelector(".notes-textarea");
          const saveButton = content.querySelector(".notes-save");
          const status = content.querySelector(".notes-status");

          textarea.value = getSavedNotes();

          bindActivator(saveButton, function () {
            saveNotes(textarea.value);
            status.textContent = `Saved at ${formatTime(new Date())}.`;
          });

          textarea.addEventListener("input", function () {
            status.textContent = "Unsaved changes.";
          });

          $win.on("focus", function () {
            textarea.focus();
          });
        },
      });
    });
  }

  function renderProjectsWindow() {
    return (
      `<div class="window-scroll-area"><div class="window-stack window-stack--tight">` +
      projectGroups
        .map(function (group) {
          return (
            `<section class="window-card">` +
            `<div class="window-card__eyebrow">${escapeHtml(group.title)}</div>` +
            `<div class="window-grid">` +
            group.items
              .map(function (item) {
                return (
                  `<article class="window-card">` +
                  `<div class="window-card__eyebrow">${escapeHtml(item.eyebrow)}</div>` +
                  `<h3>${escapeHtml(item.title)}</h3>` +
                  `<div class="meta-row">` +
                  `<span class="window-chip">${escapeHtml(item.status)}</span>` +
                  `<span class="window-chip">${escapeHtml(item.owner)}</span>` +
                  `</div>` +
                  `<p>${escapeHtml(item.nextShip)}</p>` +
                  `<p class="window-note">${escapeHtml(item.artifact)}</p>` +
                  `</article>`
                );
              })
              .join("") +
            `</div>` +
            `</section>`
          );
        })
        .join("") +
      `</div></div>`
    );
  }

  function openProjectsWindow() {
    const key = "projects";

    openOrCreateWindow(key, function () {
      createMonitorWindow(key, {
        title: "PROJECTS.EXE",
        taskTitle: "Projects",
        width: 516,
        height: 354,
        x: 116,
        y: 36,
        html: renderProjectsWindow(),
      });
    });
  }

  function renderClubStackWindow() {
    return (
      `<div class="window-scroll-area"><div class="window-stack window-stack--tight">` +
      `<div class="window-card"><div class="window-card__eyebrow">CLUB STACK</div><h3>Ship Board</h3><p>Lane view of what is incoming, building, under review, and already live on the desk.</p></div>` +
      `<div class="stack-grid">` +
      clubStackSections
        .map(function (section) {
          return (
            `<section class="window-card">` +
            `<div class="window-card__eyebrow">${escapeHtml(section.title)}</div>` +
            `<ul class="window-list">` +
            section.entries
              .map(function (entry) {
                return `<li>${escapeHtml(entry)}</li>`;
              })
              .join("") +
            `</ul>` +
            `</section>`
          );
        })
        .join("") +
      `</div></div></div>`
    );
  }

  function openClubStackWindow() {
    const key = "skills";

    openOrCreateWindow(key, function () {
      createMonitorWindow(key, {
        title: "CLUBSTACK.EXE",
        taskTitle: "Club Stack",
        width: 470,
        height: 332,
        x: 98,
        y: 72,
        html: renderClubStackWindow(),
      });
    });
  }

  function openTerminalWindow() {
    const key = "terminal";

    openOrCreateWindow(key, function () {
      createMonitorWindow(key, {
        title: "TERMINAL.EXE",
        taskTitle: "Terminal",
        width: 560,
        height: 344,
        x: 88,
        y: 92,
        html:
          `<div class="terminal-shell">` +
          `<div class="terminal-toolbar">` +
          `<span class="terminal-toolbar__title">OSDC Monitor Shell</span>` +
          `<span class="terminal-toolbar__hint">HELP  TAB complete  CTRL+L clear  CTRL+C cancel</span>` +
          `</div>` +
          `<div class="terminal-screen" data-interactive-window="true" tabindex="-1">` +
          `<textarea class="terminal-proxy-input" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Terminal input"></textarea>` +
          `<div class="terminal-output"></div>` +
          `</div>` +
          `</div>`,
        onReady: function ($win) {
          const content = $win.$content[0];
          const terminalHost = content.querySelector(".terminal-screen");
          const proxyInput = content.querySelector(".terminal-proxy-input");
          const output = content.querySelector(".terminal-output");
          const homeDirectory = "/Users/osdc/";
          const commandNames = [
            "help",
            "motd",
            "status",
            "events",
            "members",
            "projects",
            "links",
            "ls",
            "cd",
            "pwd",
            "cat",
            "open",
            "mkdir",
            "touch",
            "rm",
            "ps",
            "clear",
            "neofetch",
          ];

          if (!terminalHost || !proxyInput || !output) {
            return;
          }

          const state = {
            cwd: TERMINAL_DEFAULT_CWD,
            hostname: "osdc-os",
            promptTemplate: "{hostname} :: {path} %",
            input: "",
            history: [],
            historyIndex: 0,
            historyDraft: "",
          };

          function resolvePath(input, cwd, forceDirectory) {
            if (!input) {
              return cwd;
            }

            const startsAbsolute = input.startsWith("/");
            const raw = startsAbsolute ? input : `${cwd}${input}`;
            const segments = [];

            raw.split("/").forEach(function (segment) {
              if (!segment || segment === ".") {
                return;
              }

              if (segment === "..") {
                segments.pop();
                return;
              }

              segments.push(segment);
            });

            const joined = `/${segments.join("/")}`;

            if (joined === "/") {
              return "/";
            }

            return forceDirectory ? `${joined}/` : joined;
          }

          function buildRelativePath(path) {
            const pathItems = path.split("/").filter(Boolean);

            if (pathItems.length === 0) {
              return "/";
            }

            const topItems = pathItems.slice(-3);
            const isHomeDirectory =
              pathItems.length >= 2 &&
              pathItems[0] === "Users" &&
              pathItems[1] === "osdc";
            const pathItemsDelta = pathItems.length - topItems.length;

            if (isHomeDirectory && pathItemsDelta <= 1) {
              const itemsToRemove = 2 - pathItemsDelta;

              for (let index = 0; index < itemsToRemove; index += 1) {
                topItems.shift();
              }

              topItems.unshift("~");
            }

            if (isHomeDirectory) {
              if (topItems.length === 1) {
                return "~";
              }

              return `${topItems.join("/")}/`;
            }

            return `/${topItems.join("/")}/`;
          }

          function promptText() {
            return `${state.promptTemplate
              .replace("{hostname}", state.hostname)
              .replace("{path}", buildRelativePath(state.cwd))} `;
          }

          function scrollToBottom() {
            terminalHost.scrollTop = terminalHost.scrollHeight;
          }

          function appendLine(line, tone) {
            const row = document.createElement("div");
            row.className = `terminal-line${tone ? ` ${tone}` : ""}`;
            row.textContent = line;
            output.appendChild(row);
          }

          function writeLine(line, tone) {
            appendLine(line, tone);
            scrollToBottom();
          }

          function writeLines(lines, tone) {
            lines.forEach(function (line) {
              appendLine(line, tone);
            });
            scrollToBottom();
          }

          function focusTerminal() {
            try {
              proxyInput.focus({ preventScroll: true });
            } catch (error) {
              proxyInput.focus();
            }
            terminalHost.classList.add("is-focused");
            scrollToBottom();
          }

          function blurTerminal() {
            terminalHost.classList.remove("is-focused");
          }

          let promptLine = null;
          let promptLabel = null;
          let promptInput = null;
          let promptCursor = null;

          function ensurePromptLine() {
            if (promptLine && promptLine.isConnected) {
              return;
            }

            promptLine = document.createElement("div");
            promptLine.className = "terminal-line terminal-prompt-line";

            promptLabel = document.createElement("span");
            promptLabel.className = "terminal-prompt";

            promptInput = document.createElement("span");
            promptInput.className = "terminal-input-text";

            promptCursor = document.createElement("span");
            promptCursor.className = "terminal-cursor";
            promptCursor.setAttribute("aria-hidden", "true");

            promptLine.appendChild(promptLabel);
            promptLine.appendChild(promptInput);
            promptLine.appendChild(promptCursor);
            output.appendChild(promptLine);
          }

          function redrawPrompt() {
            ensurePromptLine();
            promptLabel.textContent = promptText();
            promptInput.textContent = state.input;
            scrollToBottom();
          }

          function resetPrompt() {
            state.input = "";
            state.historyIndex = state.history.length;
            state.historyDraft = "";
            redrawPrompt();
          }

          function listDirectory(path) {
            const entries = getDirectoryEntries(path);

            if (!entries) {
              return null;
            }

            return entries.map(function (entry) {
              if (entry.kind === "directory") {
                return `${entry.name}/`;
              }

              return entry.name;
            });
          }

          function parseArgs(input) {
            const args = [];
            let current = "";
            let quote = null;
            let escaping = false;

            for (let index = 0; index < input.length; index += 1) {
              const character = input[index];

              if (escaping) {
                current += character;
                escaping = false;
                continue;
              }

              if (character === "\\") {
                escaping = true;
                continue;
              }

              if (quote) {
                if (character === quote) {
                  quote = null;
                } else {
                  current += character;
                }
                continue;
              }

              if (character === "\"" || character === "'") {
                quote = character;
                continue;
              }

              if (/\s/.test(character)) {
                if (current) {
                  args.push(current);
                  current = "";
                }
                continue;
              }

              current += character;
            }

            if (current) {
              args.push(current);
            }

            return args;
          }

          function parseCommandChain(fullCommand) {
            let index = 0;
            let last = 0;

            function getNextSlice() {
              if (last === fullCommand.length) {
                return null;
              }

              let quote = null;
              let escaping = false;
              let marker = null;

              while (index < fullCommand.length) {
                const character = fullCommand[index];

                if (escaping) {
                  escaping = false;
                  index += 1;
                  continue;
                }

                if (character === "\\") {
                  escaping = true;
                  index += 1;
                  continue;
                }

                if (quote) {
                  if (character === quote) {
                    quote = null;
                  }
                  index += 1;
                  continue;
                }

                if (character === "\"" || character === "'") {
                  quote = character;
                  index += 1;
                  continue;
                }

                if (character === "|" || character === ">") {
                  marker = character;
                  index += 1;
                  break;
                }

                index += 1;
              }

              const isAtEnd = index === fullCommand.length && marker === null;
              const slice = fullCommand.slice(last, isAtEnd ? index : index - 1).trim();

              if (marker === "|") {
                last = index;
                return { slice: slice, output: { type: "pipe" } };
              }

              if (marker === ">") {
                last = index;
                const nextSlice = getNextSlice();

                if (!nextSlice) {
                  return { slice: slice, output: { type: "stdout" } };
                }

                const filename = parseArgs(nextSlice.slice)[0] || "";
                return {
                  slice: slice,
                  output: { type: "output_redirection", filename: filename },
                };
              }

              last = index;
              return { slice: slice, output: { type: "stdout" } };
            }

            const slices = [];
            let slice = null;

            while ((slice = getNextSlice())) {
              if (slice.slice) {
                slices.push(slice);
              }
            }

            return slices;
          }

          function findEntryInDirectory(directoryPath, name) {
            const entries = getDirectoryEntries(directoryPath) || [];
            return entries.find(function (entry) {
              return entry.name.toLowerCase() === name.toLowerCase();
            }) || null;
          }

          function resolveOpenTarget(target) {
            const lowerTarget = target.toLowerCase();
            const appAliases = {
              finder: "finder",
              notes: "notes",
              terminal: "terminal",
              projects: "projects",
              doom: "doom",
              "club-stack": "skills",
              clubstack: "skills",
              skills: "skills",
              brief: "briefing",
              briefing: "briefing",
              events: "events",
              members: "members",
              alumni: "alumni",
              archive: "pastEvents",
              pastevents: "pastEvents",
            };

            if (appAliases[lowerTarget]) {
              const mapped = appAliases[lowerTarget];

              if (windowDefinitions[mapped]) {
                openContentWindow(mapped);
              } else {
                openTool(mapped);
              }

              return { ok: true, message: `Opening ${target}...` };
            }

            const normalized = normalizeFsPath(target, state.cwd);
            const directoryEntry = getDirectoryEntries(normalized);

            if (directoryEntry) {
              openFinderWindow(normalized);
              return { ok: true, message: `Opening ${normalized}` };
            }

            const file = getTextFile(normalized);

            if (file) {
              openTextDocument(normalized);
              return { ok: true, message: `Opening ${normalized}` };
            }

            const currentDirectoryEntry = findEntryInDirectory(state.cwd, target.replace(/\/$/, ""));

            if (currentDirectoryEntry && currentDirectoryEntry.kind === "link") {
              window.open(currentDirectoryEntry.url, "_blank", "noopener,noreferrer");
              return { ok: true, message: `Opening ${currentDirectoryEntry.url}` };
            }

            if (currentDirectoryEntry && currentDirectoryEntry.kind === "app") {
              openTool(currentDirectoryEntry.app);
              return { ok: true, message: `Opening ${currentDirectoryEntry.name}...` };
            }

            return { ok: false, message: `Target not found: ${target}` };
          }

          function loadHistory(direction) {
            if (state.history.length === 0) {
              return;
            }

            if (direction === "up") {
              if (state.historyIndex === state.history.length) {
                state.historyDraft = state.input;
              }

              state.historyIndex = Math.max(0, state.historyIndex - 1);
              state.input = state.history[state.historyIndex] || "";
            } else {
              state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
              state.input = state.historyIndex === state.history.length
                ? state.historyDraft
                : state.history[state.historyIndex] || "";
            }

            redrawPrompt();
          }

          function autocompleteInput() {
            const source = state.input;
            const hasTrailingSpace = /\s$/.test(source);
            const parts = source.trim().split(/\s+/).filter(Boolean);

            if (parts.length === 0) {
              return;
            }

            if (parts.length === 1 && !hasTrailingSpace) {
              const matches = commandNames.filter(function (entry) {
                return entry.startsWith(parts[0].toLowerCase());
              });

              if (matches.length === 1) {
                state.input = matches[0];
                if (state.historyIndex === state.history.length) {
                  state.historyDraft = state.input;
                }
                redrawPrompt();
              } else if (matches.length > 1) {
                writeLine("");
                writeLines(matches, "terminal-line--muted");
                redrawPrompt();
              }

              return;
            }

            const last = hasTrailingSpace ? "" : parts[parts.length - 1];
            const base = hasTrailingSpace ? source : source.slice(0, source.length - last.length);
            const pathSeed = last || ".";
            const normalized = normalizeFsPath(pathSeed, state.cwd);
            const directoryPath = normalized.endsWith("/")
              ? normalized
              : normalized.slice(0, normalized.lastIndexOf("/") + 1);
            const entries = getDirectoryEntries(directoryPath);

            if (!entries) {
              return;
            }

            const matches = entries
              .filter(function (entry) {
                return entry.name.toLowerCase().startsWith(last.toLowerCase());
              })
              .map(function (entry) {
                return `${entry.name}${entry.kind === "directory" ? "/" : ""}`;
              });

            if (matches.length === 1) {
              state.input = base + matches[0];
              if (state.historyIndex === state.history.length) {
                state.historyDraft = state.input;
              }
              redrawPrompt();
            } else if (matches.length > 1) {
              writeLine("");
              writeLines(matches, "terminal-line--muted");
              redrawPrompt();
            }
          }

          function formatHelpCommand(name, description) {
            return `  ${name.padEnd(12, " ")}${description}`;
          }

          function formatNeofetchLine(key, value) {
            return `${`${key}:`.padEnd(13, " ")}${value}`;
          }

          function runSingleCommand(args) {
            const name = (args[0] || "").toLowerCase();
            const value = args.slice(1).join(" ");

            switch (name) {
              case "help":
                return {
                  lines: [
                    "Available commands:",
                    formatHelpCommand("help", "Display this menu."),
                    formatHelpCommand("motd", "Display message of the day."),
                    formatHelpCommand("status", "Show current desk status."),
                    formatHelpCommand("events", "List live event board items."),
                    formatHelpCommand("members", "Show active roster lanes."),
                    formatHelpCommand("projects", "Show current ship board."),
                    formatHelpCommand("links", "Show club jump links."),
                    formatHelpCommand("cat", "Print file content."),
                    formatHelpCommand("open", "Open files or applications."),
                    formatHelpCommand("cd", "Change the current directory."),
                    formatHelpCommand("ls", "List directory content."),
                    formatHelpCommand("mkdir", "Create a new directory."),
                    formatHelpCommand("touch", "Create a new text file."),
                    formatHelpCommand("rm", "Remove user-created files or directories."),
                    formatHelpCommand("pwd", "Print current directory."),
                    formatHelpCommand("clear", "Clear the terminal screen."),
                    formatHelpCommand("ps", "Set prompt string."),
                    formatHelpCommand("neofetch", "Display system information."),
                    "This shell supports pipes (|) and output redirection (>).",
                  ],
                  tone: "terminal-line--muted",
                };

              case "motd":
                return {
                  lines: [
                    "OSDC monitor shell alpha build, (C)2026 OSDC.",
                    "Authorized club workspace.",
                    "The monitor is the desk. Ship from here.",
                    "",
                  ],
                  tone: "terminal-line--muted",
                };

              case "clear":
                output.innerHTML = "";
                promptLine = null;
                promptLabel = null;
                promptInput = null;
                promptCursor = null;
                return { lines: [], tone: "" };

              case "ps":
                if (!value) {
                  return {
                    lines: [
                      "jsh: ps requires a value to be set",
                      "possible variables: {hostname}, {path}",
                    ],
                    tone: "terminal-line--error",
                  };
                }

                state.promptTemplate = value;
                return { lines: [], tone: "" };

              case "status": {
                const stats = (monitorContent.briefing && monitorContent.briefing.stats) || [];
                const focus = (monitorContent.briefing && monitorContent.briefing.focus) || [];
                return {
                  lines: [
                    "Desk status",
                    ...stats.map(function (item) {
                      return `${item.label}: ${item.value}`;
                    }),
                    "",
                    "Current focus",
                    ...focus.map(function (item) {
                      return `- ${item}`;
                    }),
                  ],
                  tone: "terminal-line--muted",
                };
              }

              case "events": {
                const items = (monitorContent.events && monitorContent.events.items) || [];
                return {
                  lines: items.flatMap(function (item) {
                    return [
                      `${item.date} :: ${item.title}`,
                      `  ${item.state} | ${item.venue} | ${item.seats}`,
                    ];
                  }),
                  tone: "",
                };
              }

              case "members": {
                const squads = (monitorContent.members && monitorContent.members.squads) || [];
                return {
                  lines: squads.map(function (item) {
                    return `${item.lane.padEnd(10, " ")} ${item.count} :: ${item.next}`;
                  }),
                  tone: "",
                };
              }

              case "projects":
                return {
                  lines: projectGroups.flatMap(function (group) {
                    return [
                      `[${group.title}]`,
                      ...group.items.map(function (item) {
                        return `  ${item.title} :: ${item.status} :: ${item.nextShip}`;
                      }),
                      "",
                    ];
                  }),
                  tone: "",
                };

              case "links":
                return {
                  lines: [
                    `discord   ${socialLinks.discord}`,
                    `instagram ${socialLinks.instagram}`,
                    `linkedin  ${socialLinks.linkedin}`,
                  ],
                  tone: "",
                };

              case "pwd":
                return { lines: [state.cwd], tone: "" };

              case "ls":
              case "dir": {
                const path = normalizeFsPath(value || state.cwd, state.cwd);
                const entries = listDirectory(path);

                if (!entries) {
                  return {
                    lines: [`ls: ${value || path}: No such file or directory`],
                    tone: "terminal-line--error",
                  };
                }

                return { lines: entries, tone: "" };
              }

              case "cd": {
                const nextPath = normalizeFsPath(value || homeDirectory, state.cwd);

                if (!getDirectoryEntries(nextPath)) {
                  return {
                    lines: [`cd: no such file or directory: ${value || homeDirectory}`],
                    tone: "terminal-line--error",
                  };
                }

                state.cwd = nextPath;
                return { lines: [], tone: "" };
              }

              case "cat": {
                if (!value) {
                  return {
                    lines: ["cat: missing file operand"],
                    tone: "terminal-line--error",
                  };
                }

                const path = normalizeFsPath(value, state.cwd);

                if (getDirectoryEntries(path)) {
                  return {
                    lines: [`cat: ${path}: Is a directory`],
                    tone: "terminal-line--error",
                  };
                }

                const file = getTextFile(path);

                if (file) {
                  return { lines: file.content.split("\n"), tone: "" };
                }

                const currentEntry = findEntryInDirectory(state.cwd, value);

                if (currentEntry && currentEntry.kind === "link") {
                  return { lines: [currentEntry.url], tone: "" };
                }

                if (currentEntry && currentEntry.kind === "app") {
                  return {
                    lines: [`cat: ${value}: Is an application`],
                    tone: "terminal-line--error",
                  };
                }

                return {
                  lines: [`cat: no such file or directory: ${value}`],
                  tone: "terminal-line--error",
                };
              }

              case "open": {
                if (!value) {
                  return {
                    lines: [
                      "Usage: open filename",
                      "Help: Open opens files from a shell.",
                      "By default, opens each file using the default application for that file.",
                    ],
                    tone: "terminal-line--muted",
                  };
                }

                const result = resolveOpenTarget(value);
                return {
                  lines: [result.message],
                  tone: result.ok ? "terminal-line--muted" : "terminal-line--error",
                };
              }

              case "mkdir": {
                if (!value) {
                  return {
                    lines: ["mkdir: missing operand"],
                    tone: "terminal-line--error",
                  };
                }

                const result = createShellDirectory(resolvePath(value, state.cwd, true));
                return result.ok
                  ? { lines: [], tone: "" }
                  : { lines: [result.error], tone: "terminal-line--error" };
              }

              case "touch": {
                if (!value) {
                  return {
                    lines: ["touch: missing file operand"],
                    tone: "terminal-line--error",
                  };
                }

                const result = touchShellFile(resolvePath(value, state.cwd, false));
                return result.ok
                  ? { lines: [], tone: "" }
                  : { lines: [result.error], tone: "terminal-line--error" };
              }

              case "rm": {
                if (!value) {
                  return {
                    lines: ["rm: missing operand"],
                    tone: "terminal-line--error",
                  };
                }

                const parts = args.slice(1);
                const recursive = parts.includes("-r") || parts.includes("-rf") || parts.includes("-fr");
                const target = parts.filter(function (part) {
                  return !part.startsWith("-");
                })[0];

                if (!target) {
                  return {
                    lines: ["rm: missing operand"],
                    tone: "terminal-line--error",
                  };
                }

                const result = removeShellPath(resolvePath(target, state.cwd, false), recursive);
                return result.ok
                  ? { lines: [], tone: "" }
                  : { lines: [result.error], tone: "terminal-line--error" };
              }

              case "neofetch":
                return {
                  lines: [
                    "  ______   _____  _____   _____ ",
                    " / __/ _ \\ / __/ / ___/  / ___/",
                    "/ _// // /\\ \\   / /__   / /__  ",
                    "\\__/\\___//___/  \\___/   \\___/  ",
                    "",
                    formatNeofetchLine("OS", "OSDC Monitor Desktop 95.2"),
                    formatNeofetchLine("Host", state.hostname),
                    formatNeofetchLine("Shell", "jsh monitor build"),
                    formatNeofetchLine("Resolution", `${window.innerWidth}x${window.innerHeight}`),
                    formatNeofetchLine("Directory", state.cwd),
                    formatNeofetchLine("Open windows", String(openWindows.size)),
                    formatNeofetchLine("Season", "Monsoon Build Loop"),
                    formatNeofetchLine("Apps", "Finder Notes Terminal Projects ClubStack Doom"),
                  ],
                  tone: "terminal-line--muted",
                };

              default:
                return {
                  lines: [`jsh: command not found: ${name}`],
                  tone: "terminal-line--error",
                };
            }
          }

          function executeCommand(raw) {
            const chain = parseCommandChain(raw);
            let previousResult = [];

            chain.forEach(function (part, index) {
              const previous = index > 0 ? chain[index - 1] : null;
              const previousWasPipe = previous && previous.output.type === "pipe";
              const pipedSuffix = previousWasPipe && previousResult.length
                ? ` "${previousResult.join("\n").replace(/"/g, '\\"')}"`
                : "";
              const args = parseArgs(`${part.slice}${pipedSuffix}`);

              if (args.length === 0) {
                previousResult = [];
                return;
              }

              const result = runSingleCommand(args);
              previousResult = result.lines || [];

              if (part.output.type === "stdout") {
                if (result.lines && result.lines.length > 0) {
                  writeLines(result.lines, result.tone);
                }
                return;
              }

              if (part.output.type === "output_redirection") {
                const outputTarget = resolvePath(part.output.filename, state.cwd, false);
                const writeResult = writeShellFile(
                  outputTarget,
                  `${previousResult.join("\r\n")}${previousResult.length ? "\r\n" : ""}`,
                  { append: true }
                );

                if (!writeResult.ok) {
                  writeLines([writeResult.error], "terminal-line--error");
                }
              }
            });
          }

          function submitCurrentInput() {
            const command = state.input;

            if (promptLine && promptLine.isConnected) {
              promptLine.remove();
            }

            if (command.trim()) {
              state.history.push(command);
            }

            writeLine(`${promptText()}${command}`, "terminal-line--command");
            executeCommand(command);
            resetPrompt();
            redrawPrompt();
            focusTerminal();
          }

          proxyInput.addEventListener("keydown", function (event) {
            event.stopPropagation();

            if (event.ctrlKey && event.key.toLowerCase() === "l") {
              event.preventDefault();
              output.innerHTML = "";
              promptLine = null;
              promptLabel = null;
              promptInput = null;
              promptCursor = null;
              resetPrompt();
              redrawPrompt();
              return;
            }

            if (event.ctrlKey && event.key.toLowerCase() === "c") {
              event.preventDefault();
              if (promptLine && promptLine.isConnected) {
                promptLine.remove();
              }
              writeLine(`${promptText()}${state.input}`, "terminal-line--command");
              writeLine("^C", "terminal-line--muted");
              resetPrompt();
              redrawPrompt();
              return;
            }

            if (event.key === "Enter") {
              event.preventDefault();
              submitCurrentInput();
              return;
            }

            if (event.key === "Backspace") {
              event.preventDefault();
              if (state.input) {
                state.input = state.input.slice(0, -1);
                if (state.historyIndex === state.history.length) {
                  state.historyDraft = state.input;
                }
                redrawPrompt();
              }
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              loadHistory("up");
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              loadHistory("down");
              return;
            }

            if (event.key === "Tab") {
              event.preventDefault();
              autocompleteInput();
              return;
            }

            if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
              event.preventDefault();
              state.input += event.key;
              if (state.historyIndex === state.history.length) {
                state.historyDraft = state.input;
              }
              redrawPrompt();
            }
          });

          proxyInput.addEventListener("paste", function (event) {
            event.preventDefault();

            const pastedText = event.clipboardData ? event.clipboardData.getData("text") : "";

            if (!pastedText) {
              return;
            }

            state.input += pastedText.replace(/\r?\n/g, " ");
            if (state.historyIndex === state.history.length) {
              state.historyDraft = state.input;
            }
            redrawPrompt();
          });

          proxyInput.addEventListener("focus", focusTerminal);
          proxyInput.addEventListener("blur", blurTerminal);

          writeLines(
            [
              "OSDC Monitor Terminal v95.2",
              "Club shell online. Type HELP for commands or MOTD for desk status.",
              "Try: neofetch, ls, cat club-brief.txt, open projects",
              "",
            ],
            "terminal-line--muted"
          );
          redrawPrompt();
          window.setTimeout(function () {
            focusTerminal();
          }, 0);

          terminalHost.addEventListener("pointerdown", function () {
            window.setTimeout(function () {
              focusTerminal();
            }, 0);
          });

          $win.on("focus", function () {
            focusTerminal();
          });
        },
      });
    });
  }

  function openDoomWindow() {
    const key = "doom";

    openOrCreateWindow(key, function () {
      createMonitorWindow(key, {
        title: "DOOM.EXE",
        taskTitle: "Doom",
        width: 612,
        height: 430,
        x: 92,
        y: 24,
        html:
          `<div class="doom-shell">` +
          `<iframe class="doom-frame" src="/doom.html" title="Doom"></iframe>` +
          `<p class="doom-hint">Click inside Doom to capture input. Use Escape to release pointer lock.</p>` +
          `</div>`,
      });
    });
  }

  function openTool(tool) {
    const normalizedTool = tool === "algorithms" ? "projects" : tool;

    if (normalizedTool === "finder") {
      openFinderWindow(TERMINAL_DEFAULT_CWD);
      return;
    }

    if (normalizedTool === "notes") {
      openNotesWindow();
      return;
    }

    if (normalizedTool === "terminal") {
      openTerminalWindow();
      return;
    }

    if (normalizedTool === "projects") {
      openProjectsWindow();
      return;
    }

    if (normalizedTool === "skills") {
      openClubStackWindow();
      return;
    }

    if (normalizedTool === "doom") {
      openDoomWindow();
      return;
    }

    if (windowDefinitions[normalizedTool]) {
      openContentWindow(normalizedTool);
    }
  }

  function forwardGlobeMessage(message) {
    if (!globeFrame || !globeFrame.contentWindow) {
      return;
    }

    globeFrame.contentWindow.postMessage(message, window.location.origin);
  }

  function loadMonitorContent() {
    fetch("/monitor-content.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error(`Failed to load monitor content (${response.status})`);
        }

        return response.json();
      })
      .then(function (content) {
        monitorContent = content;
      })
      .catch(function () {
        monitorContent = createDefaultMonitorContent();
      });
  }

  bindActivator(heroEnter, enterDesktop);
  bindActivator(taskbarStart, function () {
    if (currentMode !== "desktop") {
      enterDesktop();
    }

    setStartMenuOpen(!startMenuOpen);
  });

  document.querySelectorAll("[data-window]").forEach(function (icon) {
    bindActivator(icon, function () {
      openContentWindow(icon.dataset.window);
    });
  });

  document.querySelectorAll("[data-tool]").forEach(function (icon) {
    bindActivator(icon, function () {
      openTool(icon.dataset.tool);
    });
  });

  document.querySelectorAll("[data-link]").forEach(function (element) {
    bindActivator(element, function () {
      const platform = element.dataset.link;
      const href = socialLinks[platform];

      if (!href) {
        return;
      }

      window.open(href, "_blank", "noopener,noreferrer");
    });
  });

  document.addEventListener("pointerdown", function (event) {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest(".desktop-layer") || target.closest("#hero-enter")) {
      playClickSound();
    }

    if (!startMenuOpen || !startMenu || !taskbarStart) {
      return;
    }

    if (startMenu.contains(target) || taskbarStart.contains(target)) {
      return;
    }

    setStartMenuOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setStartMenuOpen(false);
    }
  });

  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "osdc-globe-control") {
      forwardGlobeMessage(event.data);
      return;
    }

    if (
      event.source === window.parent &&
      event.data &&
      typeof event.data.method === "string" &&
      event.data.method === "enable_sound_message"
    ) {
      lastSoundEnabled = Boolean(event.data.enabled);
    }
  });

  document.addEventListener("visibilitychange", function () {
    forwardGlobeMessage({
      type: "osdc-globe-control",
      paused: document.hidden,
    });
  });

  window.addEventListener("resize", function () {
    if (globeWindow) {
      const position = clampPosition(
        globeWindow.outerWidth(),
        globeWindow.outerHeight(),
        parseFloat(globeWindow.css("left")) || 0,
        parseFloat(globeWindow.css("top")) || 0
      );

      globeWindow.css({
        left: `${position.left}px`,
        top: `${position.top}px`,
      });
    }
  });

  loadMonitorContent();
  setupDraggableIcons();
  syncClock();
  window.setInterval(syncClock, 1000);
  setMode("hero");
})();
