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

  // The left lockup (index + name) reads as a "title" and gets the project
  // icon. The right one (discipline + year) gets the GitHub link instead,
  // appended after the text stack below so it sits right next to "year".
  // Both kept out of the goo-morph rows below on purpose: those rows are
  // text-only, indexed by child position for the crossfade, and a sibling
  // there would throw that off.
  let icon = null;
  if (side === "left") {
    icon = document.createElement("img");
    icon.className = "meta-icon";
    icon.alt = "";
    box.appendChild(icon);
  }

  const textStack = document.createElement("span");
  textStack.className = "meta-textstack";

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

  textStack.appendChild(goo);
  textStack.appendChild(plain);
  box.appendChild(textStack);

  let github = null;
  if (side === "right") {
    github = document.createElement("a");
    github.className = "meta-github";
    github.target = "_blank";
    github.rel = "noopener noreferrer";
    github.setAttribute("aria-label", "Repositorio en GitHub");
    github.innerHTML =
      '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
    box.appendChild(github);
  }

  // The tech-stack row, one small icon per entry. Rebuilt from scratch on
  // every card change (see meta.js) rather than kept in sync incrementally —
  // there are at most a handful of icons and diffing them isn't worth it.
  let stackRow = null;
  if (side === "right") {
    stackRow = document.createElement("span");
    stackRow.className = "meta-stack";
    box.appendChild(stackRow);
  }

  // Sits below "type", positioned off the box's own vertical centre rather
  // than nested in the goo-morph stack above — that stack is oversized on
  // purpose (room for the text's blur), so anchoring to its edges would land
  // this well clear of the visible words. Carries its own single-slot goo
  // morph (same technique as the name/type rows, just one word instead of a
  // pair) so it crossfades the same way when the card changes.
  let desc = null;
  let descGoo = null;
  let descLayers = null;
  let descPlain = null;
  if (side === "right") {
    desc = document.createElement("span");
    desc.className = "meta-desc";

    descGoo = document.createElement("span");
    descGoo.className = "meta-desc-goo";
    descLayers = [0, 1].map(() => {
      const layer = document.createElement("span");
      layer.className = "meta-desc-layer";
      layer.appendChild(document.createElement("span"));
      descGoo.appendChild(layer);
      return layer;
    });

    descPlain = document.createElement("span");
    descPlain.className = "meta-desc-plain";
    descPlain.appendChild(document.createElement("span"));

    desc.appendChild(descGoo);
    desc.appendChild(descPlain);
    box.appendChild(desc);
  }

  return {
    box,
    goo,
    layers,
    plain,
    icon,
    github,
    stackRow,
    desc,
    descGoo,
    descLayers,
    descPlain,
  };
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
