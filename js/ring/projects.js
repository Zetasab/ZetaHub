// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..06 as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
//
// `file` is the atlas still shown by the shader. `video`, when set, plays in
// an overlaid <video> while that card sits at the front and the cursor is
// over it — see hover handling in carousel.js.
export const PROJECTS = [
  {
    file: "assets/proyects/front/zetahub.png",
    video: null,
    name: "ZetaHub",
    type: "Web Design",
    year: "2026",
    url: "#",
  },
  {
    file: "assets/proyects/front/portfolio.png",
    video: "assets/proyects/back/portfolio.mp4",
    name: "Portfolio",
    type: "Web Design",
    year: "2026",
    url: "https://gemini.google.com/app?hl=es-ES",
  },
  {
    file: "assets/proyects/front/ztemplates.png",
    video: "assets/proyects/back/ztemplates.mp4",
    name: "ZTemplates",
    type: "Frontend",
    year: "2025",
    url: "#",
  },
  {
    file: "assets/proyects/front/zgaming.png",
    video: "assets/proyects/back/zgaming.mp4",
    name: "ZGaming",
    type: "Node.js",
    year: "2025",
    url: "#",
  },
  {
    file: "assets/proyects/front/zocorn.png",
    video: "assets/proyects/back/zocorn.mp4",
    name: "Zocorn",
    type: "Vue",
    year: "2025",
    url: "#",
  },
  {
    file: "assets/proyects/front/ngcesarsobrino.png",
    video: "assets/proyects/back/ngcesarsobrino.mp4",
    name: "Portfolio Secundario",
    type: "Angular",
    year: "2026",
    url: "#",
  },
];

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
