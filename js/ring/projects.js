// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..05 as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
export const PROJECTS = [
  {
    file: "assets/proyects/portfolio.png",
    name: "Portfolio",
    type: "Web Design",
    year: "2026",
    url: "#",
  },
  {
    file: "assets/proyects/ztemplates.png",
    name: "ZTemplates",
    type: "Frontend",
    year: "2025",
    url: "#",
  },
  {
    file: "assets/proyects/zgaming.png",
    name: "ZGaming",
    type: "Node.js",
    year: "2025",
    url: "#",
  },
  {
    file: "assets/proyects/zocorn.png",
    name: "Zocorn",
    type: "Vue",
    year: "2025",
    url: "#",
  },
  {
    file: "assets/proyects/ngcesarsobrino.png",
    name: "CesarSob Dashboard",
    type: "Angular",
    year: "2026",
    url: "#",
  },
];

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
