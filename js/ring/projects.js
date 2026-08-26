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
  // zetahub
  {
    file: "assets/proyects/front/zetahub.png",
    icon: "assets/proyects/icons/zetahub.png",
    video: "assets/proyects/back/zetahub.mp4",
    name: "ZetaHub",
    type: "Static website",
    stack: ["html", "css", "js", "threejs"],
    year: "2026",
    url: "#",
    githubUrl: "https://github.com/Zetasab/ZetaHub",
    description: "Portal WebGL con todos mis proyectos, renderizado en un único shader Three.js.",
  },
  // portfolio
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
  // ztemplates
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
  // zgaming
  {
    file: "assets/proyects/front/zgaming.png",
    icon: "assets/proyects/icons/zgaming.png",
    video: "assets/proyects/back/zgaming.mp4",
    name: "ZGaming",
    type: "Static website (SSG)",
    stack: ["react", "nextjs", "ts"],
    year: "2025",
    url: "https://zgaming.vercel.app/",
    githubUrl: "https://github.com/Zetasab/Zgaming",
    description: "Catálogo de videojuegos con favoritos locales, Next.js y funciones serverless a MongoDB.",
  },
  // zocorn
  {
    file: "assets/proyects/front/zocorn.png",
    icon: "assets/proyects/icons/zocorn.png",
    video: "assets/proyects/back/zocorn.mp4",
    name: "Zocorn",
    type: "SPA",
    stack: ["vue"],
    year: "2025",
    url: "https://zocorn.vercel.app/",
    githubUrl: "https://github.com/Zetasab/Zocorn",
    description: "Explorador de películas y series con datos de TMDB, filtros avanzados y favoritos.",
  },
  // galleryz
  {
    file: "assets/proyects/front/galleryz.png",
    icon: "assets/proyects/icons/galleryz.png",
    video: "assets/proyects/back/galleryz.mp4",
    name: "GalleryZ",
    type: "Static website (SSG)",
    stack: ["react", "nextjs", "ts"],
    year: "2026",
    url: "https://galleryz.vercel.app",
    githubUrl: "https://github.com/Zetasab/Galleryz",
    description: "Galería de imágenes y videos minimalista con búsqueda, colecciones y favoritos, impulsada por la API de Pexels.",
  },
  // chaztia
  {
    file: "assets/proyects/front/chaztia.png",
    icon: "assets/proyects/icons/chaztia.png",
    video: "assets/proyects/back/chaztia.mp4",
    name: "Chaztia",
    type: "SPA",
    stack: ["react", "ts"],
    year: "2026",
    url: "https://chaztia.vercel.app",
    githubUrl: "https://github.com/Zetasab/Chaztia",
    description: "Chatbot con IA que renderiza Markdown en sus respuestas, con proxy serverless a la API de Groq.",
  },
  // notizias
  {
    file: "assets/proyects/front/notizias.png",
    icon: "assets/proyects/icons/notizias.png",
    video: "assets/proyects/back/notizias.mp4",
    name: "Notizias",
    type: "Static website (SSG)",
    stack: ["react", "nextjs", "ts"],
    year: "2026",
    url: "https://notizias.vercel.app",
    githubUrl: "https://github.com/Zetasab/Notizias",
    description: "Agregador de noticias con titulares destacados, búsqueda avanzada, guardados e histórico, alimentado por NewsAPI.",
  },
  // zood
  {
    file: "assets/proyects/front/zood.png",
    icon: "assets/proyects/icons/zood.png",
    video: "assets/proyects/back/zood.mp4",
    name: "Zood",
    type: "SPA",
    stack: ["react", "ts"],
    year: "2026",
    url: "https://zoodvercel.vercel.app",
    githubUrl: "https://github.com/Zetasab/Zood",
    description: "Explorador de recetas por categorías, ingredientes y países, con datos de TheMealDB.",
  },
  // zcalcu
  {
    file: "assets/proyects/front/zcalcu.png",
    icon: "assets/proyects/icons/zcalcu.png",
    video: "assets/proyects/back/zcalcu.mp4",
    name: "Zcalcu",
    type: "Static simple website",
    stack: ["html", "css", "js"],
    year: "2026",
    url: "https://zcalcu.vercel.app",
    githubUrl: "https://github.com/Zetasab/Zcalcu",
    description: "Calculadora estilo iPhone con las operaciones básicas, hecha en HTML, CSS y JavaScript puro.",
  },
  // bemysanvalentin
  {
    file: "assets/proyects/front/bemysanvalentin.png",
    icon: "assets/proyects/icons/bemysanvalentin.png",
    video: "assets/proyects/back/bemysanvalentin.mp4",
    name: "Be my San Valentin",
    type: "Static simple website",
    stack: ["html", "css", "js"],
    year: "2026",
    url: "https://bemysanvalentin.vercel.app/",
    githubUrl: "https://github.com/Zetasab/BeSanValentin",
    description: "Página interactiva para pedir San Valentín: un botón huye del cursor y el otro crece hasta celebrar con un GIF.",
  },
  // portofolio angular
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
  }
];

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
