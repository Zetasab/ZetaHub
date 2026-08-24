import { PROJECTS } from "./projects.js";

function row() {
  const r = document.createElement("span");
  r.className = "row";
  r.appendChild(document.createElement("span"));
  r.appendChild(document.createElement("span"));
  return r;
}

function buildMetaBox(side) {
  const box = document.createElement("div");
  box.className = "meta-box";
  box.dataset.side = side;
  box.setAttribute("aria-hidden", "true");

  const goo = document.createElement("span");
  goo.className = "meta-goo";

  const layers = [0, 1].map(() => {
    const layer = document.createElement("span");
    layer.className = "meta-layer";
    layer.appendChild(row());
    goo.appendChild(layer);
    return layer;
  });

  const plain = document.createElement("span");
  plain.className = "meta-plain";
  plain.appendChild(row());

  box.appendChild(goo);
  box.appendChild(plain);

  return { box, goo, layers, plain };
}

export function buildOverlay(root) {
  const container = document.createElement("div");
  container.className = "ring-container";
  root.appendChild(container);

  const list = document.createElement("ul");
  list.className = "ring-list";
  list.setAttribute("aria-label", "Proyectos");
  const items = PROJECTS.map((p) => {
    const li = document.createElement("li");
    li.textContent = p.name;
    li.style.opacity = "0.2";
    list.appendChild(li);
    return li;
  });
  root.appendChild(list);

  const metaLeft = buildMetaBox("left");
  const metaRight = buildMetaBox("right");
  root.appendChild(metaLeft.box);
  root.appendChild(metaRight.box);

  const video = document.createElement("video");
  video.className = "ring-video";
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "none";
  root.appendChild(video);

  const videoTag = document.createElement("div");
  videoTag.className = "video-tag";
  videoTag.setAttribute("aria-hidden", "true");
  const videoTagIcon = document.createElement("img");
  videoTagIcon.src = "assets/arrow-top-right-svgrepo-com.svg";
  videoTagIcon.alt = "";
  const videoTagLabel = document.createElement("span");
  videoTagLabel.textContent = "Ver";
  videoTag.appendChild(videoTagIcon);
  videoTag.appendChild(videoTagLabel);
  root.appendChild(videoTag);

  const loader = document.createElement("div");
  loader.className = "ring-loader";
  loader.setAttribute("aria-hidden", "true");
  root.appendChild(loader);

  const live = document.createElement("div");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  root.appendChild(live);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.classList.add("ring-goo-svg");
  const defs = document.createElementNS(svgNS, "defs");
  const filter = document.createElementNS(svgNS, "filter");
  filter.setAttribute("id", "name-goo");
  filter.setAttribute("x", "-20%");
  filter.setAttribute("y", "-100%");
  filter.setAttribute("width", "140%");
  filter.setAttribute("height", "300%");
  filter.setAttribute("color-interpolation-filters", "sRGB");
  const cut = document.createElementNS(svgNS, "feColorMatrix");
  cut.setAttribute("in", "SourceGraphic");
  cut.setAttribute("type", "matrix");
  cut.setAttribute(
    "values",
    "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140",
  );
  filter.appendChild(cut);
  defs.appendChild(filter);
  svg.appendChild(defs);
  root.appendChild(svg);

  return {
    container,
    list,
    items,
    video,
    videoTag,
    loader,
    live,
    cut,
    groups: {
      left: metaLeft,
      right: metaRight,
    },
  };
}
