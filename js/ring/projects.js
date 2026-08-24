// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..06 as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
//
// `file` is the atlas still shown by the shader. `video`, when set, plays in
// an overlaid <video> while that card sits at the front and the cursor is
// over it — see hover handling in carousel.js. `githubUrl` and `description`
// aren't wired into the UI yet, just carried here ready to use.
export const PROJECTS = [
  {
    file: "assets/proyects/front/zetahub.png",
    icon: "assets/proyects/icons/zetahub.png",
    video: "assets/proyects/back/zetahub.mp4",
    name: "ZetaHub",
    type: "Static website",
    stack: ["html", "css", "js", "threejs"],
    year: "2026",
    url: "https://zetahubvercel.vercel.app",
    githubUrl: "https://github.com/Zetasab/ZetaHub",
    description: "Portal WebGL con todos mis proyectos, renderizado en un único shader Three.js.",
  },
  {
    file: "assets/proyects/front/portfolio.png",
    icon: "assets/proyects/icons/portfolio.png",
    video: "assets/proyects/back/portfolio.mp4",
    name: "Portfolio",
    type: "Static website",
    stack: ["html", "css", "js"],
    year: "2026",
    url: "https://portfolio.cesarsobrino.es",
    githubUrl: "https://github.com/Zetasab/cesarsobrino",
    description: "Portfolio personal Full Stack con animaciones avanzadas y presentación del stack.",
  },
  {
    file: "assets/proyects/front/ztemplates.png",
    icon: "assets/proyects/icons/ztemplates.png",
    video: "assets/proyects/back/ztemplates.mp4",
    name: "ZTemplates",
    type: "SPA",
    stack: ["angular"],
    year: "2025",
    url: "https://templates.cesarsobrino.es",
    githubUrl: "https://github.com/Zetasab/ZTemplates",
    description: "Galería Angular para explorar, previsualizar y descargar plantillas frontend.",
  },
  {
    file: "assets/proyects/front/zgaming.png",
    icon: "assets/proyects/icons/zgaming.png",
    video: "assets/proyects/back/zgaming.mp4",
    name: "ZGaming",
    type: "Static website (SSG)",
    stack: ["react", "nextjs", "ts"],
    year: "2025",
    url: "https://zgaming.vercel.app/",
    githubUrl: "https://github.com/Zetasab/Node-Zgaming-fe",
    description: "Catálogo de videojuegos con favoritos locales, Next.js y funciones serverless a MongoDB.",
  },
  {
    file: "assets/proyects/front/zocorn.png",
    icon: "assets/proyects/icons/zocorn.png",
    video: "assets/proyects/back/zocorn.mp4",
    name: "Zocorn",
    type: "SPA",
    stack: ["vue"],
    year: "2025",
    url: "https://zocorn.vercel.app/",
    githubUrl: "https://github.com/Zetasab/Vue-Zocorn-Fe",
    description: "Explorador de películas y series con datos de TMDB, filtros avanzados y favoritos.",
  },
  {
    file: "assets/proyects/front/ngcesarsobrino.png",
    icon: "assets/proyects/icons/portfoliong.png",
    video: "assets/proyects/back/ngcesarsobrino.mp4",
    name: "Portfolio Angular",
    type: "SPA",
    stack: ["angular", "ts"],
    year: "2026",
    url: "https://portfoliong.cesarsobrino.es/",
    githubUrl: "https://github.com/Zetasab/NgCesarsobrino",
    description: "Portfolio en Angular con navegación por secciones, timeline y proyectos con preview en vídeo.",
  },
];

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
