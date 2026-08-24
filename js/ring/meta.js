import gsap from "gsap";
import { PROJECTS } from "./projects.js";
import { TECH_ICONS } from "./techIcons.js";

const SIDES = ["left", "right"];
const SLOTS = 2;

const slotsOf = (row) => row?.firstElementChild?.children;

function fade(el, f, blur) {
  if (!el) return;
  if (f >= 1) {
    el.style.filter = "none";
    el.style.opacity = "1";
  } else if (f <= 0) {
    el.style.filter = "none";
    el.style.opacity = "0";
  } else {
    el.style.filter = `blur(${Math.min(blur / f - blur, 100)}px)`;
    el.style.opacity = `${Math.pow(f, 0.4)}`;
  }
}

function createGroup(side, groups, params) {
  const m = { t: 1 };
  let prev = ["", ""];
  let moving = [false, false];

  const draw = () => {
    const g = groups[side];
    if (!g) return;
    const out = slotsOf(g.layers[0]);
    const into = slotsOf(g.layers[1]);
    const held = slotsOf(g.plain);
    const t = m.t;

    for (let j = 0; j < SLOTS; j++) {
      if (moving[j]) {
        fade(out?.[j], 1 - t, params.nameBlur);
        fade(into?.[j], t, params.nameBlur);
        if (held?.[j]) held[j].style.opacity = "0";
      } else {
        if (out?.[j]) out[j].style.opacity = "0";
        if (into?.[j]) into[j].style.opacity = "0";
        if (held?.[j]) held[j].style.opacity = "1";
      }
    }

    if (g.goo) {
      g.goo.style.filter =
        t >= 1 ? "none" : `url(#name-goo) blur(${params.nameSoften}px)`;
    }
  };

  const set = (parts) => {
    const g = groups[side];
    if (!g?.layers[0] || !g.layers[1] || !g.plain) return;
    gsap.killTweensOf(m);

    m.t = 1;
    draw();

    const next = [parts[0] ?? "", parts[1] ?? ""];
    moving = [next[0] !== prev[0], next[1] !== prev[1]];

    const out = slotsOf(g.layers[0]);
    const into = slotsOf(g.layers[1]);
    const held = slotsOf(g.plain);
    for (let j = 0; j < SLOTS; j++) {
      if (out?.[j]) out[j].textContent = prev[j];
      if (into?.[j]) into[j].textContent = next[j];
      if (held?.[j]) held[j].textContent = next[j];
    }
    prev = next;

    if (!moving[0] && !moving[1]) {
      m.t = 1;
      draw();
      return;
    }

    m.t = 0;
    draw();
    gsap.to(m, {
      t: 1,
      duration: params.nameMorphTime,
      ease: params.nameEase,
      onUpdate: draw,
    });
  };

  return { m, set };
}

// Same crossfade as createGroup, just one word instead of a lead/trail pair —
// the description sits outside the name/type rows entirely (see dom.js), so
// it gets its own small morph rather than a third slot bolted onto theirs.
function createDescGroup(groups, params) {
  const m = { t: 1 };
  let prev = "";
  let moving = false;

  const draw = () => {
    const g = groups.right;
    if (!g?.descLayers) return;
    const out = g.descLayers[0]?.firstElementChild;
    const into = g.descLayers[1]?.firstElementChild;
    const held = g.descPlain?.firstElementChild;
    const t = m.t;

    if (moving) {
      fade(out, 1 - t, params.nameBlur);
      fade(into, t, params.nameBlur);
      if (held) held.style.opacity = "0";
    } else {
      if (out) out.style.opacity = "0";
      if (into) into.style.opacity = "0";
      if (held) held.style.opacity = "1";
    }

    if (g.descGoo) {
      g.descGoo.style.filter =
        t >= 1 ? "none" : `url(#name-goo) blur(${params.nameSoften}px)`;
    }
  };

  const set = (text) => {
    const g = groups.right;
    if (!g?.descLayers?.[0] || !g.descLayers?.[1] || !g.descPlain) return;
    gsap.killTweensOf(m);

    m.t = 1;
    draw();

    const next = text ?? "";
    moving = next !== prev;

    const out = g.descLayers[0].firstElementChild;
    const into = g.descLayers[1].firstElementChild;
    const held = g.descPlain.firstElementChild;
    if (out) out.textContent = prev;
    if (into) into.textContent = next;
    if (held) held.textContent = next;
    prev = next;

    if (!moving) {
      m.t = 1;
      draw();
      return;
    }

    m.t = 0;
    draw();
    gsap.to(m, {
      t: 1,
      duration: params.nameMorphTime,
      ease: params.nameEase,
      onUpdate: draw,
    });
  };

  return { m, set };
}

export function createMeta(refs, params) {
  const { groups, list, loader, cut, live } = refs;
  const left = createGroup("left", groups, params);
  const right = createGroup("right", groups, params);
  const desc = createDescGroup(groups, params);

  const setThreshold = () => {
    cut?.setAttribute(
      "values",
      `1 0 0 0 0
       0 1 0 0 0
       0 0 1 0 0
       0 0 0 ${params.nameEdge} ${-params.nameEdge * params.nameCut}`,
    );
  };

  const style = ({ textK, tight, viewW }) => {
    const bigVw = params.nameSize * textK * (tight ? params.tightName : 1);
    const big = `${bigVw}vw`;
    const small = `${params.idxSize * textK}vw`;
    const bigFace = `"${params.nameFont}", ui-sans-serif, system-ui, sans-serif`;
    const smallFace = `"${params.idxFont}", ui-sans-serif, system-ui, sans-serif`;
    const bigWeight = `${params.nameWeight}`;
    const smallWeight = `${params.idxWeight}`;
    const h = bigVw * 3;

    for (const side of SIDES) {
      const g = groups[side];
      if (!g?.box) continue;
      const isRight = side === "right";

      const corner = tight && !isRight;
      if (tight && isRight) {
        g.box.style.display = "none";
        continue;
      }
      g.box.style.display = "";

      g.box.style.width = `${corner ? params.tightMetaWidth : params.metaWidth}vw`; // prettier-ignore
      g.box.style.height = `${h}vw`;

      if (corner) {
        const boxPx = (h * viewW) / 100;
        const emPx = (bigVw * viewW) / 100;
        g.box.style.top = "auto";
        g.box.style.left = "auto";
        g.box.style.right = `${params.tightNameRight}px`;
        g.box.style.bottom = `${params.tightNameBottom + emPx * 0.5 - boxPx * 0.5}px`;
        g.box.style.transform = "none";
      } else {
        g.box.style.top = "";
        g.box.style.bottom = "";
        g.box.style.transform = "";
        g.box.style.left = isRight ? "auto" : `${params.metaLeft}vw`;
        g.box.style.right = isRight ? `${params.metaRight}vw` : "auto";
      }

      for (const layer of [...g.layers, g.plain]) {
        if (!layer) continue;
        layer.style.justifyContent =
          corner || isRight ? "flex-end" : "flex-start";
        const row = layer.firstElementChild;
        row.style.gap = `${isRight ? params.metaGapR : params.metaGapL}vw`;
        const [lead, trail] = row.children;
        lead.style.display = corner ? "none" : "";
        lead.style.fontFamily = isRight ? bigFace : smallFace;
        lead.style.fontSize = isRight ? big : small;
        lead.style.fontWeight = isRight ? bigWeight : smallWeight;
        trail.style.fontFamily = isRight ? smallFace : bigFace;
        trail.style.fontSize = isRight ? small : big;
        trail.style.fontWeight = isRight ? smallWeight : bigWeight;
      }
    }

    if (list) list.style.fontSize = `${params.listSize * textK}vw`;
    if (loader) {
      loader.style.bottom = `${params.loaderBottom}vh`;
      loader.style.fontFamily = smallFace;
      loader.style.fontSize = small;
      loader.style.fontWeight = smallWeight;
    }

    setThreshold();
  };

  const show = (i) => {
    const p = PROJECTS[i];
    if (!p) return;
    left.set([String(i + 1).padStart(2, "0"), p.name]);
    right.set([p.type, ""]);
    if (groups.left?.icon && p.icon) {
      const icon = groups.left.icon;
      icon.src = p.icon;
      gsap.killTweensOf(icon);
      gsap.fromTo(
        icon,
        { opacity: 0, filter: `blur(${params.nameBlur}px)` },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: params.nameMorphTime,
          ease: params.nameEase,
        },
      );
    }
    if (groups.right?.github) {
      const hasRepo = p.githubUrl && p.githubUrl !== "#";
      groups.right.github.href = hasRepo ? p.githubUrl : "";
      groups.right.github.classList.toggle("visible", hasRepo);
    }
    if (groups.right?.stackRow) {
      const row = groups.right.stackRow;
      row.innerHTML = "";
      for (const key of p.stack ?? []) {
        const entry = TECH_ICONS[key];
        if (!entry) continue;
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", entry.color);
        svg.setAttribute("aria-hidden", "true");
        svg.innerHTML = entry.svg;
        const label = document.createElement("span");
        label.className = "meta-stack-label";
        label.textContent = entry.label;
        const wrap = document.createElement("span");
        wrap.className = "meta-stack-icon";
        wrap.appendChild(svg);
        wrap.appendChild(label);
        row.appendChild(wrap);
      }
      gsap.killTweensOf(row);
      gsap.fromTo(
        row,
        { opacity: 0, filter: `blur(${params.nameBlur}px)` },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: params.nameMorphTime,
          ease: params.nameEase,
        },
      );
    }
    desc.set(p.description);
    if (live) live.textContent = `${p.name}. ${p.type}, ${p.year}.`;
  };

  const dispose = () => {
    gsap.killTweensOf(left.m);
    gsap.killTweensOf(right.m);
    gsap.killTweensOf(desc.m);
    if (groups.left?.icon) gsap.killTweensOf(groups.left.icon);
    if (groups.right?.stackRow) gsap.killTweensOf(groups.right.stackRow);
  };

  return { show, style, setThreshold, dispose };
}
