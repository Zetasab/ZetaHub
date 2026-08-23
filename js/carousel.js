import * as THREE from "three";
import gsap from "gsap";

import {
  vertexShader,
  fragmentShader,
  MAX_PLANES,
  MAX_LINKS,
} from "./shaders/planeShaders.js";
import { buildAtlas } from "./ring/atlas.js";
import { createMeta } from "./ring/meta.js";
import { createSplitText } from "./ring/splitText.js";
import { createTag, TAG_W, TAG_H } from "./ring/tag.js";
import { defaultParams } from "./ring/params.js";
import { IMAGE_FILES, PROJECTS } from "./ring/projects.js";
import { buildOverlay } from "./ring/dom.js";
import {
  TAU,
  HALF_PI,
  DEG,
  chase,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  signedOffset,
  smoothstep,
} from "./ring/utils.js";

const FAN_START = 0.06;

const blankTexture = () => {
  const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  t.needsUpdate = true;
  return t;
};

export function initCarousel(root) {
  const overlay = buildOverlay(root);
  const container = overlay.container;
  const listEl = overlay.list;
  const itemEls = overlay.items;
  const loaderEl = overlay.loader;
  const liveEl = overlay.live;
  const cutEl = overlay.cut;
  const metaGroups = overlay.groups;

  const params = defaultParams();
  const state = { progress: 0, launch: 0, spread: 0, spin: 0, shift: 0 };
  const info = { restingGap: 0, window: "", scale: 1, band: "wide" };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    console.error("[ring] could not create a WebGL context:", err);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);

  const uniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uSize: { value: new THREE.Vector2(150, 100) },
    uRadius: { value: params.radius },
    uCount: { value: params.count },
    uPos: {
      value: Array.from({ length: MAX_PLANES }, () => new THREE.Vector2()),
    },
    uRot: { value: new Float32Array(MAX_PLANES) },
    uScale: {
      value: Array.from(
        { length: MAX_PLANES },
        () => new THREE.Vector4(0, 0, 1, 0),
      ),
    },
    uLinkCount: { value: 0 },
    uLinkA: {
      value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()),
    },
    uLinkB: {
      value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()),
    },
    uLinkPar: {
      value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector4()),
    },
    uK: { value: params.goo },
    uWobble: { value: params.wobble },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#0a0a0a") },
    uAtlas: { value: blankTexture() },
    uGrid: { value: new THREE.Vector2(1, 1) },
    uBlend: { value: params.blend },
    uTextured: { value: 0 },
    uBandTop: { value: 0 },
    uBandBottom: { value: 0 },
    uGlass: { value: new THREE.Vector4() },
    uFringe: { value: 0 },
    uSheen: { value: 0 },
    uMouse: { value: new THREE.Vector4() },
    uMelt: { value: new THREE.Vector4() },
    uTagTex: {
      value: new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1),
    },
    uTag: { value: new THREE.Vector4() },
    uTagP: { value: new THREE.Vector4() },
    uTagQ: { value: new THREE.Vector4() },
    uPage: { value: new THREE.Color("#fbfbfa") },
  };

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    }),
  );
  mesh.renderOrder = 10;
  scene.add(mesh);

  const textGroup = new THREE.Group();
  scene.add(textGroup);

  const splitText = createSplitText(textGroup, params);
  const tag = createTag(params, uniforms);
  const meta = createMeta(
    {
      groups: metaGroups,
      list: listEl,
      loader: loaderEl,
      cut: cutEl,
      live: liveEl,
    },
    params,
  );

  /* ---------------------------------------------------------------- art */
  let firstIn = false;
  let loadProg = 0;
  let launchReady = false;
  const readyWaiters = [];
  const whenReady = (fn) => (launchReady ? fn() : readyWaiters.push(fn));

  const atlas = buildAtlas(IMAGE_FILES, (p) => {
    loadProg = p;
  });

  uniforms.uAtlas.value.dispose();
  atlas.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  uniforms.uAtlas.value = atlas.texture;
  uniforms.uGrid.value.set(atlas.grid[0], atlas.grid[1]);
  const imageCount = atlas.count;

  atlas.first.then(() => {
    firstIn = true;
  });
  atlas.ready.then(() => {
    loadProg = 1;
  });

  /* --------------------------------------------------------------- size */
  let viewW = 1;
  let viewH = 1;
  const bounds = { left: 0, top: 0 };

  let fit = 1;
  let planeK = 1;
  let radiusK = 1;
  let textK = 1;
  let narrowNow = false;
  let tightNow = false;

  const refit = () => {
    const byW = viewW / Math.max(1, params.refWidth);
    const byH = viewH / Math.max(1, params.refHeight);
    const s =
      byW * (1 - params.fitHeight) + Math.min(byW, byH) * params.fitHeight;
    fit = Math.min(params.maxScale, Math.max(params.minScale, s));

    const narrow = viewW <= params.narrowAt;
    const tight = viewW <= params.tightAt;
    narrowNow = narrow;
    tightNow = tight;
    planeK = narrow ? params.narrowPlane : 1;
    radiusK =
      (narrow ? params.narrowRadius : 1) * (tight ? params.tightRadius : 1);
    textK = narrow ? params.narrowText : 1;

    info.window = `${Math.round(viewW)} x ${Math.round(viewH)}`;
    info.scale = Math.round(fit * 1000) / 1000;
    info.band = tight ? "tight" : narrow ? "narrow" : "wide";

    const k = fit * textK * (tight ? params.tightSplit : 1);
    textGroup.scale.set(k, k, 1);
  };

  const styleMeta = () =>
    meta.style({ textK, tight: tightNow, viewW: viewW });

  const resize = () => {
    viewW = container.clientWidth;
    viewH = container.clientHeight;
    refit();
    renderer.setSize(viewW, viewH);
    camera.left = -viewW / 2;
    camera.right = viewW / 2;
    camera.top = viewH / 2;
    camera.bottom = -viewH / 2;
    camera.updateProjectionMatrix();
    mesh.scale.set(viewW, viewH, 1);
    uniforms.uResolution.value.set(viewW, viewH);

    const rect = renderer.domElement.getBoundingClientRect();
    bounds.left = rect.left;
    bounds.top = rect.top;
  };

  const onResize = () => {
    resize();
    styleMeta();
  };

  resize();
  requestAnimationFrame(onResize);
  window.addEventListener("resize", onResize);

  /* ------------------------------------------------------- spin & input */
  const ringCentre = { x: 0, y: 0 };
  let frontAngle = 0;
  let interactive = false;
  let spinVel = 0;
  let dragging = false;
  let dragPrevAngle = 0;
  let dragPrevTime = 0;

  let settling = false;
  let snapTo = 0;
  let snapCap = 0;

  let picking = false;

  let pointerTravel = 0;
  let travelX = 0;
  let travelY = 0;

  const pointerAngle = (e) => {
    const dx = e.clientX - bounds.left - ringCentre.x;
    const dy = e.clientY - bounds.top - ringCentre.y;
    return Math.atan2(-dy, dx);
  };

  const stopPick = () => {
    if (!picking) return;
    gsap.killTweensOf(state);
    picking = false;
  };

  const pick = (i) => {
    const slot = TAU / Math.round(params.count);
    const base = frontAngle - params.seed * DEG - signedOffset(i) * slot;
    const target = base + Math.round((state.spin - base) / TAU) * TAU;

    const slots = Math.abs(target - state.spin) / slot;
    if (slots < 0.01) return;

    spinVel = 0;
    settling = false;
    picking = true;
    gsap.killTweensOf(state);
    gsap.to(state, {
      spin: target,
      duration: params.pickTime * Math.sqrt(Math.max(1, slots)),
      ease: params.pickEase,
      onComplete: () => {
        picking = false;
      },
    });
  };

  /* ------------------------------------------------------------ pointer */
  const pointer = { x: 0, y: 0, inside: false, seeded: false };
  const cursor = { x: 0, y: 0, amt: 0, wake: 0 };

  let coarse = false;
  let held = false;
  let holdTimer = 0;

  const endHold = () => {
    clearTimeout(holdTimer);
    holdTimer = 0;
    held = false;
  };

  const beginHold = () => {
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      held = true;
    }, params.touchHold * 1000);
  };

  const engaged = () => (coarse ? held : pointer.inside);

  const trackPointer = (e) => {
    coarse = e.pointerType === "touch";
    pointer.x = e.clientX - bounds.left - viewW * 0.5;
    pointer.y = viewH * 0.5 - (e.clientY - bounds.top);
    pointer.inside = true;
    if (!pointer.seeded) {
      pointer.seeded = true;
      cursor.x = pointer.x;
      cursor.y = pointer.y;
    }
  };

  const onPointerLeave = () => {
    pointer.inside = false;
  };

  // scrollSpeed (and the snap engage threshold below) were tuned against an
  // 18-card ring, where one slot is a small 20deg wedge. A ring with only a
  // handful of cards has much wider slots, so the same raw wheel delta is no
  // longer enough to clear the snap's engage speed and a gentle scroll just
  // falls back into the card it started on. Scaling by how much wider this
  // ring's slot is than that reference keeps a normal scroll gesture landing
  // one card over, whatever the project count.
  const REF_SLOT = TAU / 18;
  const onWheel = (e) => {
    if (!interactive) return;
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    stopPick();
    settling = false;
    const slot = TAU / Math.round(params.count);
    const slotScale = Math.max(1, slot / REF_SLOT);
    spinVel += d * params.scrollSpeed * slotScale;
    spinVel = Math.max(-params.maxSpeed, Math.min(params.maxSpeed, spinVel));
  };

  const onPointerDown = (e) => {
    pointerTravel = 0;
    travelX = e.clientX;
    travelY = e.clientY;
    trackPointer(e);
    if (!interactive) return;
    stopPick();
    if (coarse) beginHold();
    dragging = true;
    settling = false;
    spinVel = 0;
    dragPrevAngle = pointerAngle(e);
    dragPrevTime = performance.now();
    renderer.domElement.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    trackPointer(e);

    pointerTravel +=
      Math.abs(e.clientX - travelX) + Math.abs(e.clientY - travelY);
    travelX = e.clientX;
    travelY = e.clientY;
    if (coarse && !held && pointerTravel > params.touchSlop) endHold();

    if (!dragging) return;

    const a = pointerAngle(e);
    let delta = a - dragPrevAngle;
    if (delta > Math.PI) delta -= TAU;
    if (delta < -Math.PI) delta += TAU;

    const turn = delta * params.dragSpeed;
    state.spin += turn;

    const now = performance.now();
    spinVel = turn / (Math.max(8, now - dragPrevTime) / 1000);
    dragPrevAngle = a;
    dragPrevTime = now;
  };

  const onPointerUp = (e) => {
    trackPointer(e);
    endHold();
    if (!dragging) return;
    dragging = false;
    renderer.domElement.releasePointerCapture?.(e.pointerId);
  };

  const onClick = () => {
    if (!interactive || pointerTravel >= 5 || over < 0) return;
    if (over === shown) {
      const url = PROJECTS[shown]?.url;
      if (url && url !== "#") window.open(url, "_blank");
      return;
    }
    pick(over);
  };

  container.addEventListener("wheel", onWheel, { passive: false });
  container.addEventListener("pointerdown", onPointerDown);
  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("pointerup", onPointerUp);
  container.addEventListener("pointercancel", onPointerUp);
  container.addEventListener("pointerleave", onPointerLeave);
  container.addEventListener("click", onClick);

  const updatePointer = (dt) => {
    const live = params.hover && engaged() && pointer.seeded && interactive;
    cursor.amt += ((live ? 1 : 0) - cursor.amt) * chase(dt, 0.12);

    const k = chase(dt, params.lag);
    cursor.x += (pointer.x - cursor.x) * k;
    cursor.y += (pointer.y - cursor.y) * k;

    const trail = Math.hypot(pointer.x - cursor.x, pointer.y - cursor.y);
    cursor.wake = Math.max(
      cursor.wake * Math.pow(0.94, dt * 60),
      clamp01(trail / (Math.max(dt, 0.001) * 2600)),
    );

    uniforms.uMouse.value.set(
      cursor.x,
      cursor.y,
      cursor.amt,
      params.melt * fit,
    );
    uniforms.uMelt.value.set(
      params.meltReach * fit,
      params.wave * fit * cursor.wake * cursor.amt,
      params.waveFreq,
      params.waveSpeed,
    );
  };

  /* ------------------------------------------------------- load counter */
  const loading = { shown: 0 };

  const tickLoader = (dt) => {
    const target = Math.min(loadProg, clamp01(state.progress));
    loading.shown += (target - loading.shown) * chase(dt, params.loaderChase);

    const n = Math.min(100, Math.max(1, Math.round(loading.shown * 100)));
    if (loaderEl) loaderEl.textContent = String(n).padStart(3, "0");

    if (!launchReady && n >= 100) {
      launchReady = true;
      for (const fn of readyWaiters) fn();
      readyWaiters.length = 0;
    }
  };

  /* ------------------------------------------------------- the carousel */
  const travel = new Float32Array(MAX_PLANES);
  const cum = new Float32Array(MAX_PLANES);
  const order = [];
  const rest = Array.from({ length: MAX_PLANES }, () => new THREE.Vector2());

  const hoverF = new Float32Array(MAX_PLANES);
  const leanX = new Float32Array(MAX_PLANES);
  const leanY = new Float32Array(MAX_PLANES);
  const webF = new Float32Array(MAX_LINKS);
  const sideF = new Float32Array(MAX_PLANES);
  const focusPos = new THREE.Vector2();

  const swellOf = (i) =>
    Math.max(
      0.05,
      1 + params.swell * hoverF[i] - params.sideScale * sideF[i],
    );

  let shown = -1;
  let announced = -1;
  let over = -1;
  let tagUp = false;

  const paintList = () => {
    for (let i = 0; i < itemEls.length; i++) {
      const el = itemEls[i];
      if (!el) continue;
      const on = i === shown;
      el.style.opacity = on ? "1" : "0.2";
      if (on) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    }
  };

  const layout = (dt) => {
    const count = Math.round(params.count);
    uniforms.uCount.value = count;

    const step = TAU / count;
    const spread = clamp01(state.spread);

    const endScale = narrowNow ? params.narrowEndScale : params.endScale;
    const posX = tightNow
      ? params.tightPosX
      : narrowNow
        ? params.narrowPosX
        : params.posX;

    const shift = clamp01(state.shift);
    const g = (1 + (endScale - 1) * shift) * fit;
    const cx = posX * viewW * 0.5 * shift;
    const cy = params.posY * viewH * 0.5 * shift;

    ringCentre.x = viewW * 0.5 + cx;
    ringCentre.y = viewH * 0.5 - cy;
    frontAngle = cx !== 0 || cy !== 0 ? Math.atan2(-cy, -cx) : 0;

    const W = params.planeSize * planeK * g;
    const H = W / 1.5;
    uniforms.uSize.value.set(W, H);
    uniforms.uRadius.value = params.radius * planeK * g;

    const sepExtent = params.radial ? H : W;
    const faceEdge = params.radial ? W : H;

    const R = params.ringRadius * radiusK * g;
    const restingGap = 2 * R * Math.sin(step / 2) - sepExtent;
    info.restingGap = Math.round((restingGap / g) * 10) / 10;
    const finalSep = Math.max(1, restingGap);

    const maxN = Math.max(1, Math.abs(signedOffset(count - 1)));
    const dur = Math.max(0.1, 1 - FAN_START - params.stagger);

    cum[0] = 0;
    for (let n = 1; n <= maxN; n++) {
      const start = FAN_START + ((n - 1) / maxN) * params.stagger;
      const t = clamp01((spread - start) / dur);
      const e = t * t * (3 - 2 * t);
      travel[n] = e;
      cum[n] = cum[n - 1] + e;
    }

    const seedAngle = params.seed * DEG;
    const launch = easeInOutCubic(clamp01(state.launch));
    const Rnow = R * launch;

    order.length = 0;

    const track = cursor.amt > 0.001;
    const reach = Math.max(1, params.reach * W);
    const sideReach = Math.max(1, params.sideReach * W);
    const kRise = chase(dt, params.grab);
    const kFall = chase(dt, params.release);

    let frontI = -1;
    let frontD = 1e9;
    let frontCell = 0;

    const imgOff = Math.round(params.imageOffset);
    const cellOf = (slot) =>
      imageCount > 0
        ? (((imgOff - slot) % imageCount) + imageCount) % imageCount
        : 0;

    const probe = pointer.inside && pointer.seeded && interactive;
    let overI = -1;
    const focusI = track ? over : -1;

    for (let i = 0; i < count; i++) {
      const sIdx = signedOffset(i);
      const n = Math.abs(sIdx);
      const u = i === 0 ? clamp01(state.progress) : travel[n];
      const cell = cellOf(sIdx);

      const angle = seedAngle + Math.sign(sIdx) * step * cum[n] + state.spin;
      const px = Math.cos(angle) * Rnow + cx;
      const py = Math.sin(angle) * Rnow + cy;
      rest[i].set(px, py);

      const da = angle - frontAngle;
      const toFront = Math.abs(Math.atan2(Math.sin(da), Math.cos(da)));
      if (toFront < frontD) {
        frontD = toFront;
        frontI = i;
        frontCell = cell;
      }

      let f = 0;
      let toX = 0;
      let toY = 0;
      if (track) {
        const dx = cursor.x - px;
        const dy = cursor.y - py;
        const dist = Math.hypot(dx, dy);
        f = smoothstep(reach, reach * 0.22, dist) * cursor.amt * u;
        if (f > 0.0001 && dist > 0.0001) {
          const lean = (params.pull * fit * f) / dist;
          toX = dx * lean;
          toY = dy * lean;
        }
      }

      const k = f > hoverF[i] ? kRise : kFall;
      hoverF[i] += (f - hoverF[i]) * k;
      leanX[i] += (toX - leanX[i]) * k;
      leanY[i] += (toY - leanY[i]) * k;

      let sf = 0;
      if (focusI >= 0 && i !== focusI) {
        const d = Math.hypot(focusPos.x - px, focusPos.y - py);
        sf = smoothstep(sideReach, sideReach * 0.2, d) * u;
      }
      sideF[i] += (sf - sideF[i]) * (sf > sideF[i] ? kRise : kFall);

      let pushX = 0;
      let pushY = 0;
      if (sideF[i] > 0.0001) {
        const dx = px - focusPos.x;
        const dy = py - focusPos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.0001) {
          const away = (params.sidePush * fit * sideF[i]) / dist;
          pushX = dx * away;
          pushY = dy * away;
        }
      }

      uniforms.uPos.value[i].set(
        px + leanX[i] + pushX,
        py + leanY[i] + pushY,
      );
      uniforms.uRot.value[i] =
        (params.radial ? angle : angle + HALF_PI) * launch;

      const sx =
        i === 0
          ? easeOutCubic(clamp01(u / 0.7))
          : easeOutCubic(clamp01(u / 0.34));
      const sy =
        i === 0
          ? easeOutCubic(clamp01((u - 0.18) / 0.74))
          : easeOutCubic(clamp01((u - 0.06) / 0.36));
      const sw = swellOf(i);
      uniforms.uScale.value[i].set(
        sx * sw,
        sy * sw,
        1 - params.sideDim * sideF[i],
        cell,
      );

      if (probe && overI < 0) {
        const rot = uniforms.uRot.value[i];
        const qx = cursor.x - (px + leanX[i] + pushX);
        const qy = cursor.y - (py + leanY[i] + pushY);
        const cr = Math.cos(rot);
        const sr = Math.sin(rot);
        if (
          Math.abs(qx * cr + qy * sr) <= W * 0.5 * sx * sw &&
          Math.abs(-qx * sr + qy * cr) <= H * 0.5 * sy * sw
        ) {
          overI = i;
        }
      }

      order.push(i);
    }

    for (let i = count; i < MAX_PLANES; i++) {
      uniforms.uScale.value[i].set(0, 0, 1, 0);
      hoverF[i] = 0;
      leanX[i] = 0;
      leanY[i] = 0;
      sideF[i] = 0;
    }

    over = overI;
    const wantTag = over >= 0 && !coarse && viewW > params.tagFrom;
    if (wantTag !== tagUp) {
      tagUp = wantTag;
      tag.show(wantTag);
    }
    if (over >= 0) focusPos.copy(rest[over]);

    uniforms.uTag.value.set(
      cursor.x + params.tagX,
      cursor.y + params.tagY,
      tag.box.sx,
      tag.box.sy,
    );
    uniforms.uTagP.value.set(
      TAG_W * 0.5,
      TAG_H * 0.5,
      TAG_H * 0.5,
      params.tagRefract,
    );
    uniforms.uTagQ.value.set(params.tagFrost, params.tagRim, 0, 0);

    if (frontI >= 0 && imageCount > 0 && frontCell !== shown) {
      shown = frontCell;
      paintList();
    }

    /* ---- honey ---- */
    order.sort((a, b) => signedOffset(a) - signedOffset(b));

    const edgeHalf = faceEdge * 0.5 * params.thread;
    const closed = spread > 0.995 && count > 2;
    const linkCount = Math.min(closed ? count : count - 1, MAX_LINKS);

    for (let l = 0; l < linkCount; l++) {
      const ia = order[l];
      const ib = order[(l + 1) % count];

      const ca = uniforms.uPos.value[ia];
      const cb = uniforms.uPos.value[ib];
      const scA = uniforms.uScale.value[ia];
      const scB = uniforms.uScale.value[ib];

      const shrinkA = (params.radial ? scA.y : scA.x) / swellOf(ia);
      const shrinkB = (params.radial ? scB.y : scB.x) / swellOf(ib);
      const sep =
        rest[ia].distanceTo(rest[ib]) - sepExtent * 0.5 * (shrinkA + shrinkB);

      const v = clamp01(sep / finalSep);

      let fl = 0;
      if (track && params.web > 0.0001) {
        const mx = (ca.x + cb.x) * 0.5;
        const my = (ca.y + cb.y) * 0.5;
        const webReach = Math.max(1, params.webReach * W);
        const d = Math.hypot(cursor.x - mx, cursor.y - my);
        fl = smoothstep(webReach, webReach * 0.15, d) * cursor.amt;
      }
      webF[l] += (fl - webF[l]) * (fl > webF[l] ? kRise : kFall);

      const w = Math.max(Math.pow(1 - v, params.thin), params.web * webF[l]);
      const rEnd = edgeHalf * w - params.dissolve;
      const rMid = rEnd * (1 - (1 - params.pinch) * smoothstep(0, 0.7, v));

      uniforms.uLinkA.value[l].copy(ca);
      uniforms.uLinkB.value[l].copy(cb);
      uniforms.uLinkPar.value[l].set(
        rEnd,
        rMid,
        params.sag * g * Math.pow(v, 1.5),
        Math.min(
          params.fillet * g * smoothstep(0, 0.35, v),
          Math.max(rMid, 0) * 1.5,
        ),
      );
    }
    for (let l = linkCount; l < MAX_LINKS; l++) {
      uniforms.uLinkPar.value[l].set(-100, -100, 0, 0);
    }
    uniforms.uLinkCount.value = linkCount;

    uniforms.uK.value = params.goo * planeK * fit;
    uniforms.uWobble.value =
      params.wobble * fit * (1 - smoothstep(0.2, 0.95, state.progress));

    uniforms.uTextured.value = params.textured && firstIn ? 1 : 0;
    uniforms.uBlend.value = Math.max(0.5, params.blend * planeK * g);

    const on = params.glass;
    uniforms.uBandTop.value = on ? params.bandTop * viewH : 0;
    uniforms.uBandBottom.value = on ? params.bandBottom * viewH : 0;
    uniforms.uGlass.value.set(
      params.refract,
      params.squeeze,
      params.ripple,
      params.rippleFreq,
    );
    uniforms.uFringe.value = on ? params.fringe : 0;
    uniforms.uSheen.value = on ? params.sheen : 0;
  };

  /* ------------------------------------------------------- entry timeline */
  let entryGen = 0;

  const build = () => {
    interactive = false;
    announced = -1;
    spinVel = 0;
    dragging = false;
    settling = false;
    stopPick();

    const gen = ++entryGen;
    if (loaderEl) gsap.set(loaderEl, { opacity: launchReady ? 0 : 1 });

    const tl = gsap.timeline({
      delay: 0.25,
      onComplete: () => {
        interactive = true;
      },
    });

    tl.fromTo(
      state,
      { progress: 0, launch: 0, spread: 0, spin: 0, shift: 0 },
      { progress: 1, duration: 1.2, ease: "power2.out" },
    );

    tl.addPause(">", () => {
      whenReady(() => {
        gsap.delayedCall(params.holdAfter, () => {
          if (gen !== entryGen) return;
          tl.resume();
          if (loaderEl) {
            gsap.to(loaderEl, {
              opacity: 0,
              duration: params.loaderOut,
              ease: "power2.in",
            });
          }
        });
      });
    });

    tl.to(state, {
      launch: 1,
      duration: params.launchTime,
      ease: "power2.inOut",
    });

    const spreadStart = tl.duration() - 0.15;
    tl.to(
      state,
      { spread: 1, duration: params.spreadTime, ease: params.spreadEase },
      spreadStart,
    );

    const stageStart = spreadStart + params.stageAt * params.spreadTime;
    tl.to(
      state,
      {
        spin: params.spinTurns * TAU,
        duration: params.spinTime,
        ease: params.spinEase,
      },
      stageStart + params.spinDelay,
    );
    tl.to(
      state,
      { shift: 1, duration: params.moveTime, ease: params.moveEase },
      stageStart + params.moveDelay,
    );

    const textStart = spreadStart + params.textAt * params.spreadTime;

    if (splitText.chars.length) {
      tl.fromTo(
        splitText.chars,
        { value: 0 },
        {
          value: 1,
          duration: params.textTime,
          ease: params.textEase,
          stagger: params.textStagger,
        },
        textStart,
      );
    }

    if (params.textOut && splitText.fades.length) {
      const landed = Math.max(
        stageStart + params.spinDelay + params.spinTime,
        stageStart + params.moveDelay + params.moveTime,
      );
      tl.fromTo(
        splitText.fades,
        { value: 1 },
        {
          value: 0,
          duration: params.textOutTime,
          ease: params.textOutEase,
          stagger: params.textStagger,
        },
        Math.max(0, landed + params.textOutAt),
      );
    }

    if (listEl) {
      tl.fromTo(
        listEl,
        { opacity: 0 },
        { opacity: 1, duration: params.textTime, ease: params.textEase },
        textStart,
      );
    }

    return tl;
  };

  tag.build();
  tag.load(() => {
    tag.build();
  });
  styleMeta();

  let tl = null;
  const replay = () => {
    tl?.kill();
    tl = build();
  };

  const startEntry = () => {
    if (tl) return;
    splitText.build();
    tag.build();
    styleMeta();
    replay();
  };

  setTimeout(startEntry, 3000);
  (document.fonts?.ready ?? Promise.resolve()).then(startEntry).catch(startEntry);

  /* ---------------------------------------------------------------- loop */
  const start = performance.now();
  let prevT = start;

  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - prevT) / 1000);
    prevT = now;
    uniforms.uTime.value = (now - start) * 0.001;

    if (interactive && !dragging && !picking) {
      state.spin += spinVel * dt;
      spinVel *= Math.pow(params.damping, dt * 60);

      let off = 0;

      if (params.snap) {
        const slot = TAU / Math.round(params.count);
        const decay = Math.max(0.01, -Math.log(params.damping) * 60);

        const engage = Math.max(params.snapFrom, decay * slot * 0.5);
        const rate = 4.8 / Math.max(0.05, params.snapTime);

        if (!settling && Math.abs(spinVel) < engage) {
          const coast = state.spin + spinVel / decay;
          const phase = params.seed * DEG - frontAngle;
          snapTo = Math.round((coast + phase) / slot) * slot - phase;
          snapCap = Math.max(Math.abs(spinVel), slot * 0.5 * rate);
          settling = true;
        }

        if (settling) {
          off = snapTo - state.spin;
          const aim = Math.max(-snapCap, Math.min(snapCap, off * rate));
          spinVel += (aim - spinVel) * clamp01(rate * dt);
        }
      } else {
        settling = false;
      }

      if (Math.abs(spinVel) < 0.0015 && Math.abs(off) < 0.0008) {
        spinVel = 0;
        state.spin += off;
      }
    }

    tickLoader(dt);
    updatePointer(dt);
    layout(dt);

    if (
      interactive &&
      !dragging &&
      !picking &&
      spinVel === 0 &&
      shown >= 0 &&
      shown !== announced
    ) {
      announced = shown;
      meta.show(shown);
    }

    renderer.render(scene, camera);
  });
}
