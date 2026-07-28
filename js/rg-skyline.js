/* rg-skyline v2 — scroll-driven SOLID 3D night city (canvas, painter's algorithm, lit faces, glowing windows).
   Wow beats: unboxing rise-in on load; twin towers SPLIT apart while the camera flies through the gap. */
(function () {
  if (customElements.get('rg-skyline')) return;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const easeOutBack = (t) => { const c = 1.5; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const BG = [12, 22, 36];
  const C_DARK = [15, 29, 45], C_LIT = [86, 126, 168], C_TOP = [122, 162, 204];
  const LIGHT = (() => { const l = [-0.45, 0.78, -0.55], m = Math.hypot(...l); return l.map(v => v / m); })();

  function windowsFor(box, rand, dense) {
    const pts = [], { x, y0, z, w, d, h } = box;
    if (h < 11) return pts;
    const rows = Math.min(dense ? 7 : 5, Math.floor(h / 2.6));
    const cols = dense ? 3 : 2;
    const faces = [[0, -1, w, (u) => [x - w / 2 + u * w, z - d / 2 - 0.06]], [0, 1, w, (u) => [x - w / 2 + u * w, z + d / 2 + 0.06]], [-1, 0, d, (u) => [x - w / 2 - 0.06, z - d / 2 + u * d]], [1, 0, d, (u) => [x + w / 2 + 0.06, z - d / 2 + u * d]]];
    for (const [nx, nz, , posFn] of faces) {
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (rand() > 0.62) continue;
        const [px, pz] = posFn((c + 0.5 + (rand() - 0.5) * 0.3) / cols);
        pts.push({ x: px, y: y0 + ((r + 0.8) / (rows + 1)) * h, z: pz, nx, nz, warm: rand() < 0.3, seed: rand() * 100, fl: rand() < 0.12 });
      }
    }
    return pts;
  }

  function buildCity(density) {
    const buildings = [];
    const rand = mulberry(20260728);
    const add = (boxes, group, strong, dense) => {
      let cx = 0, cz = 0, mh = 0;
      for (const b of boxes) { cx += b.x; cz += b.z; mh = Math.max(mh, b.y0 + b.h); }
      cx /= boxes.length; cz /= boxes.length;
      const wins = [];
      for (const b of boxes) wins.push(...windowsFor(b, rand, dense));
      buildings.push({ boxes, group, strong, cx, cz, mh, wins });
    };
    // Petronas-style twin towers: faceted star prisms with setbacks + pinnacle (split groups L / R)
    for (const [sx, g] of [[-1, 'L'], [1, 'R']]) {
      buildings.push({
        type: 'prism', x: sx * 7, z: 0, group: g, strong: true, cx: sx * 7, cz: 0, mh: 48.5, wins: [], boxes: [],
        tiers: [
          { y0: 0, h: 16, r: 4.6 }, { y0: 16, h: 10, r: 4.0 }, { y0: 26, h: 7, r: 3.3 },
          { y0: 33, h: 5, r: 2.5 }, { y0: 38, h: 3.5, r: 1.6 }, { y0: 41.5, h: 2.5, r: 0.7 }, { y0: 44, h: 4.5, r: 0.18 },
        ],
      });
    }
    add([{ x: 0, y0: 15.2, z: 0, w: 5.6, d: 1.5, h: 1.8 }], 'B', true, false); // skybridge
    // observation tower
    add([
      { x: -22, y0: 0, z: 14, w: 2.0, d: 2.0, h: 24 },
      { x: -22, y0: 24, z: 14, w: 5.4, d: 5.4, h: 4.2 },
      { x: -22, y0: 28.2, z: 14, w: 2.4, d: 2.4, h: 2.2 },
      { x: -22, y0: 30.4, z: 14, w: 0.5, d: 0.5, h: 9 },
    ], '', true, true);
    // city grid
    const step = 9;
    for (let gx = -6; gx <= 6; gx++) for (let gz = -5; gz <= 5; gz++) {
      const x = gx * step + (rand() - 0.5) * 3.5;
      const z = gz * step + (rand() - 0.5) * 3.5;
      if (Math.abs(x) < 14 && Math.abs(z) < 10) continue;
      if (Math.hypot(x + 22, z - 14) < 7) continue;
      if (rand() > 0.62 * density) continue;
      const fall = Math.exp(-Math.hypot(x, z) / 42);
      const h = 2.5 + rand() * 5 + fall * (10 + rand() * 16);
      const w = 3.6 + rand() * 3.4, d = 3.6 + rand() * 3.4;
      add([{ x, y0: 0, z, w, d, h }], '', false, false);
    }
    const grid = [];
    const E = 58;
    for (let i = -E; i <= E; i += step) { grid.push([i, 0, -E, i, 0, E]); grid.push([-E, 0, i, E, 0, i]); }
    return { buildings, grid };
  }

  // camera keyframes — approach, fly THROUGH the split, orbit, aerial, return
  const KEYS = [
    { p: 0.00, pos: [0, 9, -74], tgt: [0, 26, 0] },
    { p: 0.13, pos: [0, 15, -40], tgt: [0, 22, 4] },
    { p: 0.30, pos: [0, 19, 4], tgt: [0, 15, 60] },
    { p: 0.46, pos: [32, 26, 28], tgt: [0, 14, 0] },
    { p: 0.64, pos: [46, 38, -8], tgt: [0, 10, 0] },
    { p: 0.80, pos: [4, 86, 44], tgt: [0, 0, 6] },
    { p: 1.00, pos: [-36, 24, -62], tgt: [0, 18, 0] },
  ];
  function camAt(p) {
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    const t = smooth(clamp((p - a.p) / (b.p - a.p), 0, 1));
    return { pos: a.pos.map((v, k) => lerp(v, b.pos[k], t)), tgt: a.tgt.map((v, k) => lerp(v, b.tgt[k], t)) };
  }
  const splitAt = (p) => smooth(clamp((p - 0.05) / 0.2, 0, 1)) * (1 - smooth(clamp((p - 0.34) / 0.14, 0, 1)));

  class RGSkyline extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const cv = document.createElement('canvas');
      cv.style.cssText = 'display:block;width:100%;height:100%';
      this.style.display = 'block';
      this.appendChild(cv);
      this._cv = cv; this._ctx = cv.getContext('2d');
      this._density = parseFloat(this.getAttribute('density') || '1') || 1;
      this._motion = this.getAttribute('motion') || 'cinematic';
      this._city = buildCity(this._density);
      this._t0 = performance.now();
      this._cam = { pos: [0, 9, -74], tgt: [0, 26, 0] };
      this._mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      this._reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._onResize = () => this._resize();
      this._onMouse = (e) => { this._mouse.tx = (e.clientX / innerWidth) * 2 - 1; this._mouse.ty = (e.clientY / innerHeight) * 2 - 1; };
      addEventListener('resize', this._onResize);
      if (!this._reduced && this._motion !== 'off') addEventListener('mousemove', this._onMouse, { passive: true });
      this._resize();
      const loop = () => { this._raf = requestAnimationFrame(loop); this._draw(); };
      loop();
    }
    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      removeEventListener('resize', this._onResize);
      removeEventListener('mousemove', this._onMouse);
    }
    static get observedAttributes() { return ['density', 'motion']; }
    attributeChangedCallback(n, _o, v) {
      if (!this._done) return;
      if (n === 'density') { this._density = parseFloat(v || '1') || 1; this._city = buildCity(this._density); }
      if (n === 'motion') this._motion = v || 'cinematic';
    }
    _resize() {
      const r = this.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this._w = Math.max(r.width, 2); this._h = Math.max(r.height, 2);
      this._cv.width = this._w * dpr; this._cv.height = this._h * dpr;
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    _draw() {
      const ctx = this._ctx, W = this._w, H = this._h;
      ctx.clearRect(0, 0, W, H);
      const se = document.scrollingElement || document.documentElement;
      const max = Math.max(se.scrollHeight - innerHeight, 1);
      const p = clamp(se.scrollTop / max, 0, 1);
      const key = camAt(p);
      const split = splitAt(p) * 10;
      const now = performance.now();
      const el = (now - this._t0) / 1000;
      const sway = (this._reduced || this._motion === 'off') ? 0 : (this._motion === 'subtle' ? 0.4 : 1);
      this._mouse.x = lerp(this._mouse.x, this._mouse.tx, 0.04);
      this._mouse.y = lerp(this._mouse.y, this._mouse.ty, 0.04);
      const px = key.pos[0] + Math.sin(el * 0.22) * 0.9 * sway + this._mouse.x * 1.6 * sway;
      const py = key.pos[1] + Math.sin(el * 0.17 + 2) * 0.5 * sway - this._mouse.y * 1.0 * sway;
      const c = this._cam, damp = this._reduced ? 1 : 0.075;
      c.pos[0] = lerp(c.pos[0], px, damp); c.pos[1] = lerp(c.pos[1], py, damp); c.pos[2] = lerp(c.pos[2], key.pos[2], damp);
      c.tgt[0] = lerp(c.tgt[0], key.tgt[0], damp); c.tgt[1] = lerp(c.tgt[1], key.tgt[1], damp); c.tgt[2] = lerp(c.tgt[2], key.tgt[2], damp);
      let fx = c.tgt[0] - c.pos[0], fy = c.tgt[1] - c.pos[1], fz = c.tgt[2] - c.pos[2];
      const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
      let rx = fz, rz = -fx;
      const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
      const ux = fy * rz, uy = fz * rx - fx * rz, uz = -fy * rx;
      const focal = (H / 2) / Math.tan(52 * Math.PI / 360);
      const cx2 = W / 2, cy2 = H / 2, NEAR = 1.1;
      const P = (x, y, z) => {
        const dx = x - c.pos[0], dy = y - c.pos[1], dz = z - c.pos[2];
        const vz = dx * fx + dy * fy + dz * fz;
        if (vz < NEAR) return null;
        return [cx2 + ((dx * rx + dz * rz) * focal) / vz, cy2 - ((dx * ux + dy * uy + dz * uz) * focal) / vz, vz];
      };
      // ground grid
      ctx.lineWidth = 1;
      for (const g of this._city.grid) {
        const a = P(g[0], g[1], g[2]), b = P(g[3], g[4], g[5]);
        if (!a || !b) continue;
        ctx.globalAlpha = clamp(0.1 - ((a[2] + b[2]) / 2) / 1400, 0.015, 0.1);
        ctx.strokeStyle = '#74a0c8';
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      // buildings + photo billboards, far-to-near
      const B = this._city.buildings;
      const items = B.map((b, i) => {
        const dx = b.group === 'L' ? -split : b.group === 'R' ? split : 0;
        const ddx = b.cx + dx - c.pos[0], ddy = b.mh / 2 - c.pos[1], ddz = b.cz - c.pos[2];
        return { d: Math.hypot(ddx, ddy, ddz), type: 'b', bi: i, dx };
      });
      for (const cd of []) void cd;
      items.sort((a, b2) => b2.d - a.d);
      const shadeOf = (n) => 0.22 + 0.78 * Math.max(n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2], 0);
      const SIDES = 16, GLOW = [168, 205, 240];
      for (const it of items) {
        const bi = it.bi, dx = it.dx;
        const b = B[bi];
        const riseP = this._reduced ? 1 : easeOutBack(clamp((el - 0.1 - bi * 0.04) / 1.1, 0, 1));
        if (b.type === 'prism') {
          if (riseP <= 0.01) continue;
          const faces = [];
          for (const tier of b.tiers) {
            const y0 = tier.y0 * riseP, y1 = (tier.y0 + tier.h) * riseP;
            const pts = [];
            for (let i = 0; i < SIDES; i++) {
              const a2 = (i / SIDES) * Math.PI * 2;
              const rr = tier.r * (i % 2 ? 0.9 : 1);
              pts.push([b.x + dx + Math.cos(a2) * rr, b.z + Math.sin(a2) * rr]);
            }
            for (let i = 0; i < SIDES; i++) {
              const p0 = pts[i], p1 = pts[(i + 1) % SIDES];
              const am = ((i + 0.5) / SIDES) * Math.PI * 2;
              const n = [Math.cos(am), 0, Math.sin(am)];
              const fcx = (p0[0] + p1[0]) / 2, fcz = (p0[1] + p1[1]) / 2;
              if (n[0] * (c.pos[0] - fcx) + n[2] * (c.pos[2] - fcz) <= 0) continue;
              const q = [P(p0[0], y0, p0[1]), P(p1[0], y0, p1[1]), P(p1[0], y1, p1[1]), P(p0[0], y1, p0[1])];
              if (q.some(v => !v)) continue;
              faces.push({ q, n, depth: (q[0][2] + q[2][2]) / 2, top: false });
            }
            // tier cap
            const cap = pts.map(pt => P(pt[0], y1, pt[1]));
            if (!cap.some(v => !v) && c.pos[1] > y1) faces.push({ q: cap, n: [0, 1, 0], depth: cap.reduce((s2, v) => s2 + v[2], 0) / cap.length, top: true });
          }
          faces.sort((a2, b2) => b2.depth - a2.depth);
          for (const f of faces) {
            const fog = clamp(f.depth / 150, 0, 0.82);
            let col;
            if (f.top) col = C_TOP.map((v, k) => Math.round(lerp(v, BG[k], fog)));
            else {
              const sh = shadeOf(f.n);
              col = [0, 1, 2].map(k => {
                const v = lerp(lerp(C_DARK[k], C_LIT[k], sh), GLOW[k], 0.28); // night-lit facade
                return Math.round(lerp(v, BG[k], fog));
              });
            }
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            ctx.beginPath();
            ctx.moveTo(f.q[0][0], f.q[0][1]);
            for (let k = 1; k < f.q.length; k++) ctx.lineTo(f.q[k][0], f.q[k][1]);
            ctx.closePath(); ctx.fill();
          }
          // horizontal steel banding rings
          ctx.strokeStyle = 'rgba(10,18,30,0.55)';
          ctx.lineWidth = 1;
          for (let yy = 2.2; yy < 43; yy += 2.2) {
            const tier = b.tiers.find(t => yy >= t.y0 && yy < t.y0 + t.h);
            if (!tier || tier.r < 0.5) continue;
            const yw = yy * riseP;
            ctx.beginPath();
            let started = false;
            for (let i = 0; i <= SIDES; i++) {
              const a2 = ((i % SIDES) / SIDES) * Math.PI * 2;
              const rr = tier.r * (i % 2 ? 0.9 : 1);
              const wx = b.x + dx + Math.cos(a2) * rr, wz = b.z + Math.sin(a2) * rr;
              if (Math.cos(a2) * (c.pos[0] - wx) + Math.sin(a2) * (c.pos[2] - wz) <= 0) { started = false; continue; }
              const q = P(wx, yw, wz);
              if (!q) { started = false; continue; }
              ctx.globalAlpha = clamp(0.5 - q[2] / 240, 0.05, 0.5);
              if (!started) { ctx.moveTo(q[0], q[1]); started = true; } else ctx.lineTo(q[0], q[1]);
            }
            ctx.stroke();
          }
          continue;
        }
        const rise = this._reduced ? 1 : easeOutBack(clamp((el - 0.1 - bi * 0.04) / 1.1, 0, 1));
        if (rise <= 0.01) continue;
        const bridgeA = b.group === 'B' ? 1 - clamp(split / 3, 0, 1) : 1;
        if (bridgeA <= 0.02) continue;
        // faces of each box
        const faces = [];
        for (const bx of b.boxes) {
          const x0 = bx.x - bx.w / 2 + dx, x1 = bx.x + bx.w / 2 + dx;
          const z0 = bx.z - bx.d / 2, z1 = bx.z + bx.d / 2;
          const y0 = bx.y0 * rise, y1 = (bx.y0 + bx.h) * rise;
          const quads = [
            [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0]],
            [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [0, 0, -1]],
            [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [0, 0, 1]],
            [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [-1, 0, 0]],
            [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [1, 0, 0]],
          ];
          for (const q of quads) {
            const n = q[4];
            const fcx = (q[0][0] + q[2][0]) / 2, fcy = (q[0][1] + q[2][1]) / 2, fcz = (q[0][2] + q[2][2]) / 2;
            if (n[0] * (c.pos[0] - fcx) + n[1] * (c.pos[1] - fcy) + n[2] * (c.pos[2] - fcz) <= 0) continue;
            const pr = [P(...q[0]), P(...q[1]), P(...q[2]), P(...q[3])];
            if (pr.some(v => !v)) continue;
            const depth = (pr[0][2] + pr[2][2]) / 2;
            faces.push({ pr, n, depth });
          }
        }
        faces.sort((a, b2) => b2.depth - a.depth);
        for (const f of faces) {
          const sh = f.n[1] === 1 ? 1 : shadeOf(f.n);
          const base = f.n[1] === 1 ? C_TOP : null;
          const fog = clamp(f.depth / 150, 0, 0.82);
          const col = [0, 1, 2].map(k => {
            const v = base ? base[k] : lerp(C_DARK[k], C_LIT[k], sh);
            return Math.round(lerp(v, BG[k], fog));
          });
          ctx.globalAlpha = bridgeA;
          ctx.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
          ctx.beginPath();
          ctx.moveTo(f.pr[0][0], f.pr[0][1]);
          for (let k = 1; k < 4; k++) ctx.lineTo(f.pr[k][0], f.pr[k][1]);
          ctx.closePath(); ctx.fill();
          if (b.strong) { ctx.globalAlpha = bridgeA * 0.25 * (1 - fog); ctx.strokeStyle = '#9fc6ec'; ctx.lineWidth = 0.75; ctx.stroke(); }
        }
        if (b.group === 'B') { // skybridge support legs
          ctx.strokeStyle = '#7ba3cc';
          for (const L2 of [[-2.6, 15.6, -0.4, 8.8], [2.6, 15.6, 0.4, 8.8]]) {
            const a2 = P(L2[0], L2[1] * rise, 0), b2 = P(L2[2], L2[3] * rise, 0);
            if (!a2 || !b2) continue;
            ctx.globalAlpha = bridgeA * 0.9;
            ctx.lineWidth = clamp(120 / a2[2], 1, 4);
            ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
          }
        }
        // glowing windows
        for (const wn of b.wins) {
          if (wn.nx * (c.pos[0] - wn.x - dx) + wn.nz * (c.pos[2] - wn.z) <= 0) continue;
          const q = P(wn.x + dx, wn.y * rise, wn.z);
          if (!q) continue;
          let a = 0.85 - clamp(q[2] / 160, 0, 0.7);
          if (wn.fl) a *= Math.sin(el * 2.5 + wn.seed) > -0.2 ? 1 : 0.15;
          const s = clamp(110 / q[2], 0.6, 2.4);
          ctx.globalAlpha = a * bridgeA;
          ctx.fillStyle = wn.warm ? '#ffd9a6' : '#bcd9f5';
          ctx.fillRect(q[0] - s / 2, q[1] - s / 2, s, s * 1.3);
        }
      }
      void 0;
      // beacons on spires
      if (el > 1.4) {
        const pulse = (Math.sin(el * 2.4) + 1) / 2;
        const fade = clamp((el - 1.4) / 0.8, 0, 1);
        for (const bc of [[-7 - split, 48.5, 0], [7 + split, 48.5, 0], [-22, 39.4, 14]]) {
          const q = P(bc[0], bc[1], bc[2]);
          if (!q) continue;
          ctx.fillStyle = '#cfe6ff';
          ctx.globalAlpha = fade * (0.6 + 0.4 * pulse);
          ctx.beginPath(); ctx.arc(q[0], q[1], 2.2, 0, 6.3); ctx.fill();
          ctx.fillStyle = '#8fc0ee';
          ctx.globalAlpha = fade * 0.25 * (1 - pulse * 0.6);
          ctx.beginPath(); ctx.arc(q[0], q[1], 7 + pulse * 6, 0, 6.3); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
  }
  customElements.define('rg-skyline', RGSkyline);
})();
