// TAKE ACTION //
// web/src/data/posts.js

export const POSTS = [
  {
    id: "member-portal",
    title: "OPSEU Local 279 is building a Member Portal for its members",
    date: "2026-01-21",
    author: "Tristan Britt",
    pinned: true,
    thumbnailSrc: "blog/l279-logo-blue.png",
    heroSrc: "blog/blogPost01.jpeg",
    tags: [
      "Member Portal",
      "Collective Agreements",
      "AI Q and A",
      "Wages and Benefits",
      "Mobile First",
    ],
    summary:
      "We are building a mobile first member portal so Local 279 members can find key resources fast: a collective agreement library, local documents, wage comparison tools, and an AI assisted Q and A for the current Norfolk County Paramedics collective agreement.",

    content: [
      {
        type: "p",
        text: "Most of our members are doing union things at terrible hours, in terrible lighting, on a phone, between calls. That is not the ideal time to be hunting through old emails, PDF threads, or trying to remember which link was the right one.",
      },
      {
        type: "p",
        text: "So Local 279 is building a simple, secure Member Portal: one place to access the current collective agreement, local resources, and tools that make information easier to use at 3 a.m. without needing a laptop and a prayer.",
      },
      {
        type: "h2",
        text: "What it includes (and what is coming)",
      },
      {
        type: "ul",
        items: [
          "A protected members area (invite only while we test)",
          "A collective agreement library with quick access to key PDFs",
          "Collective Agreement AI Q and A (currently limited to the Norfolk County Paramedics Collective Agreement)",
          "Interactive charts to compare wages across services and ranks",
          "Public documents and standards, plus links to Ontario E Laws and other official sources",
          "Action resources such as petitions and MPP lookup",
        ],
      },
      {
        type: "h2",
        text: "About the AI tool",
      },
      {
        type: "p",
        text: "The Collective Agreement AI tool is meant to speed up searching and reduce page flipping. It is not a replacement for reading the agreement, and it is not legal advice. Treat it like a fast helper: useful for direction, but always confirm the exact wording in the actual document.",
      },
    ],
  },
  {
    id: "cancer-presumptive",
    title: "Presumptive Cancer Coverage for Paramedics",
    date: "2026-01-08",
    pinned: true,
    summary:
      "OPSEU is asking paramedics to engage with their MPP and request support for presumptive legislation for paramedics diagnosed with cancer.",
    links: [
      {
        label: "Open Lobby Sheet PDF",
        href: "/campaigns/cancer/lobby-sheet-cancer-in-paramedics.pdf",
      },
      {
        label: "Find your MPP",
        href: "https://www.elections.on.ca/en/voting-in-ontario/electoral-districts.html",
        external: true,
      },
    ],
  },
  {
    id: "corw-election-summit-2026",
    title: "CoRW Election Summit: Feb 20 to 22, 2026 (Toronto)",
    date: "2026-01-20",
    author: "Tristan Britt",
    pinned: false,
    thumbnailSrc: "/l279-logo-blue.png",
    heroSrc: "/blog/CORW_Eng-1024x680.jpg",
    tags: ["OPSEU/SEFPO", "CoRW", "Equity", "Election Summit", "Leadership"],
    summary:
      "OPSEU/SEFPO’s Coalition of Racialized Workers (CoRW) is holding an Election Summit in Toronto to mobilize members, do political education, and elect regional representatives to the Provincial CoRW Committee.",
    content: [
      {
        type: "p",
        text: "OPSEU/SEFPO’s Coalition of Racialized Workers (CoRW) is hosting an Election Summit in Toronto this February. The focus is political education, organizing, and electing regional reps to the Provincial CoRW Committee.",
      },
      { type: "h2", text: "Dates, time, location" },
      {
        type: "ul",
        items: [
          "Friday Feb 20, 2026 to Sunday Feb 22, 2026",
          "Runs 5:00 PM Friday to 12:00 PM Sunday",
          "Sheraton Centre Toronto Hotel",
        ],
      },
      { type: "h2", text: "Who can attend" },
      {
        type: "p",
        text: "This event is open to Black and or racialized OPSEU/SEFPO members only. Space is limited (about 160 participants), selected by the CoRW Committee to build a diverse group across regions and experiences.",
      },
      {
        type: "p",
        text: "Application deadline is end of day January 22, 2026. Incomplete applications are not considered, so do not leave it to the last minute and then get mad at the internet.",
      },
      { type: "h2", text: "What the summit is for" },
      {
        type: "ul",
        items: [
          "Mobilize Black and racialized OPSEU/SEFPO members",
          "Elect representatives to the Provincial CoRW Committee",
          "Build leadership capacity among racialized members",
          "Strengthen union work on dismantling anti Black racism and systemic racism",
          "Advance diversity, equity, and inclusion across OPSEU/SEFPO",
        ],
      },
      { type: "h2", text: "Elections" },
      {
        type: "p",
        text: "There are 14 elected positions across OPSEU/SEFPO’s 7 regions. Members can attend even if they are not running, and still vote for candidates from their region. Successful candidates serve a 3 year term effective following Convention 2026.",
      },
    ],
    links: [
      {
        label: "Event details and application",
        href: "https://opseu.org/event/opseu-sefpo-corw-election-summit-feb-20-22-2026/",
        external: true,
      },
    ],
  },
];
