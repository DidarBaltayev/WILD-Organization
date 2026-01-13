"use client";

import React, { useEffect, useRef } from "react";

// ✅ Один файл: Engine + Systems + Passes внутри.
// ✅ Синий неон, прожектора, осколки, bloom, виньетка.
// ✅ Без сеток/радаров.
// ✅ pointer-events-none, fixed inset-0.

type Props = {
  intensity?: number; // 0.5..2
};

type System = {
  onResize(w: number, h: number): void;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  destroy(): void;
};

type Pass = {
  onResize(w: number, h: number): void;
  apply(main: HTMLCanvasElement, ctxMain: CanvasRenderingContext2D): void;
  destroy(): void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export default function BackgroundNeural({ intensity = 1.15 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, {
      dprCap: 2,
      background: "rgba(0,0,0,1)",
      intensity: clamp(intensity, 0.5, 2),
    });

    engine.addSystem(new StageBeamsSystem(engine));
    engine.addSystem(new ShardsSystem(engine));

    engine.addPass(new BloomPass({ strength: 0.95 * engine.intensity, radius: 12 }));
    engine.addPass(new VignettePass({ strength: 0.78 }));

    engine.start();

    return () => engine.destroy();
  }, [intensity]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

/* ------------------------------ ENGINE ------------------------------ */

class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private running = false;
  private raf: number | null = null;
  private lastT = 0;

  private w = 0;
  private h = 0;
  private dpr = 1;

  private systems: System[] = [];
  private passes: Pass[] = [];

  public mouse = { x: 0, y: 0, vx: 0, vy: 0 };
  public intensity: number;

  private dprCap: number;
  private background: string;

  constructor(
    canvas: HTMLCanvasElement,
    config: { dprCap: number; background: string; intensity: number }
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2D context not available");
    this.ctx = ctx;

    this.dprCap = config.dprCap;
    this.background = config.background;
    this.intensity = config.intensity;

    this.handleResize = this.handleResize.bind(this);
    this.handleMove = this.handleMove.bind(this);

    window.addEventListener("resize", this.handleResize, { passive: true });
    window.addEventListener("pointermove", this.handleMove, { passive: true });

    this.handleResize();
  }

  addSystem(s: System) {
    this.systems.push(s);
    s.onResize(this.w, this.h);
  }

  addPass(p: Pass) {
    this.passes.push(p);
    p.onResize(this.w, this.h);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastT = performance.now();
    this.loop(this.lastT);
  }

  destroy() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);

    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("pointermove", this.handleMove);

    for (const s of this.systems) s.destroy();
    for (const p of this.passes) p.destroy();
    this.systems = [];
    this.passes = [];
  }

  get size() {
    return { w: this.w, h: this.h, dpr: this.dpr };
  }

  private handleResize() {
    const dpr = clamp(window.devicePixelRatio || 1, 1, this.dprCap);
    this.dpr = dpr;

   this.w = window.innerWidth;

// ✅ вместо window.innerHeight:
this.h = Math.max(
  document.documentElement.scrollHeight,
  document.body.scrollHeight,
  window.innerHeight
);


    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (const s of this.systems) s.onResize(this.w, this.h);
    for (const p of this.passes) p.onResize(this.w, this.h);
  }

  private handleMove(e: PointerEvent) {
    const m = this.mouse;
    const nx = e.clientX;
    const ny = e.clientY;
    m.vx = nx - m.x;
    m.vy = ny - m.y;
    m.x = nx;
    m.y = ny;
  }

  private loop(now: number) {
    if (!this.running) return;

    const dt = clamp((now - this.lastT) / 1000, 0, 0.05);
    this.lastT = now;

    for (const s of this.systems) s.update(dt);

    const ctx = this.ctx;
    const { w, h } = this.size;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, w, h);

    for (const s of this.systems) s.draw(ctx);

    for (const p of this.passes) p.apply(this.canvas, ctx);

    this.raf = requestAnimationFrame((t) => this.loop(t));
  }
}

/* --------------------------- SYSTEM: BEAMS -------------------------- */

type Beam = {
  x: number;
  w: number;
  speed: number;
  phase: number;
  alpha: number;
  hue: number; // blue/cyan
};

class StageBeamsSystem implements System {
  private beams: Beam[] = [];
  private w = 0;
  private h = 0;
  private t = 0;

  constructor(private engine: Engine) {}

  onResize(w: number, h: number) {
    this.w = w;
    this.h = h;

    const count = Math.floor(clamp(10 * this.engine.intensity, 8, 18));
    this.beams = Array.from({ length: count }).map((_, i) => ({
      x: (i / count) * w + rand(-50, 50),
      w: rand(44, 160),
      speed: rand(0.035, 0.13),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.05, 0.14),
      hue: rand(195, 214),
    }));
  }

  update(dt: number) {
    this.t += dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { w, h } = this.engine.size;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    // “Арена” — мягкое синее свечение
    const arena = ctx.createRadialGradient(w * 0.58, h * 0.38, 0, w * 0.58, h * 0.38, Math.max(w, h) * 0.85);
    arena.addColorStop(0, "rgba(59,130,246,0.18)");
    arena.addColorStop(0.4, "rgba(34,211,238,0.10)");
    arena.addColorStop(0.75, "rgba(168,85,247,0.05)");
    arena.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = arena;
    ctx.fillRect(0, 0, w, h);

    // Прожектора
    for (const b of this.beams) {
      const y = (this.t * 120 * b.speed) % (h + 320) - 220;
      const pulse = 0.6 + 0.4 * Math.sin(this.t * 2.2 + b.phase);
      const a = b.alpha * pulse;

      const grad = ctx.createLinearGradient(b.x - b.w, y, b.x + b.w, y + h * 0.92);
      grad.addColorStop(0, `hsla(${b.hue}, 98%, 62%, 0)`);
      grad.addColorStop(0.42, `hsla(${b.hue}, 98%, 62%, ${a})`);
      grad.addColorStop(1, `hsla(${b.hue}, 98%, 62%, 0)`);
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(b.x, y);
      ctx.lineTo(b.x - b.w * 1.3, y + h * 0.98);
      ctx.lineTo(b.x + b.w * 1.3, y + h * 0.98);
      ctx.closePath();
      ctx.fill();

      // ядро прожектора
      const core = ctx.createRadialGradient(b.x, y + h * 0.56, 0, b.x, y + h * 0.56, b.w);
      core.addColorStop(0, `hsla(${b.hue}, 100%, 70%, ${a * 0.55})`);
      core.addColorStop(1, `hsla(${b.hue}, 100%, 70%, 0)`);
      ctx.fillStyle = core;
      ctx.fillRect(b.x - b.w * 1.35, y + h * 0.18, b.w * 2.7, h * 0.86);
    }

    // тонкая “линия мощности” внизу (как HUD-полоска, без сеток)
    const lineAlpha = smoothstep(0, 1, 0.5 + 0.5 * Math.sin(this.t * 1.15));
    ctx.globalAlpha = 0.10 + lineAlpha * 0.10;
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, h * 0.80, w, 1);

    ctx.restore();
  }

  destroy() {}
}

/* --------------------------- SYSTEM: SHARDS ------------------------- */

type Shard = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  life: number;
  maxLife: number;
  hue: number;
};

class ShardsSystem implements System {
  private shards: Shard[] = [];
  private w = 0;
  private h = 0;
  private t = 0;

  constructor(private engine: Engine) {}

  onResize(w: number, h: number) {
    this.w = w;
    this.h = h;

    const base = Math.floor(clamp(78 * this.engine.intensity, 55, 130));
    this.shards = Array.from({ length: base }).map(() => this.makeShard(true));
  }

  update(dt: number) {
    this.t += dt;

    // микровзаимодействие с мышью (энергия)
    const m = this.engine.mouse;
    const speed = Math.abs(m.vx) + Math.abs(m.vy);
    if (speed > 30 && Math.random() < 0.12 * this.engine.intensity) {
      for (let i = 0; i < 2; i++) this.shards.push(this.makeShard(false, true, m.x, m.y));
    }

    // периодический “глич-всплеск”
    if (Math.random() < 0.02 * this.engine.intensity) {
      for (let i = 0; i < 6; i++) this.shards.push(this.makeShard(false, true));
    }

    // update shards
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.life += dt;

      s.x += s.vx;
      s.y += s.vy;
      s.rot += s.vr;

      s.vx *= 0.995;
      s.vy *= 0.995;

      const out = s.x < -260 || s.x > this.w + 260 || s.y < -260 || s.y > this.h + 260;
      if (s.life > s.maxLife || out) this.shards.splice(i, 1);
    }

    const target = Math.floor(clamp(78 * this.engine.intensity, 55, 150));
    while (this.shards.length < target) this.shards.push(this.makeShard(false));
    if (this.shards.length > target + 80) this.shards.splice(0, this.shards.length - (target + 80));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const s of this.shards) {
      const k = clamp(1 - s.life / s.maxLife, 0, 1);
      const alpha = 0.05 + 0.22 * k;

      const stroke = `hsla(${s.hue}, 96%, 62%, ${alpha})`;
      const glow = `hsla(${s.hue + 8}, 96%, 72%, ${alpha * 0.55})`;

      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);

      // glow
      ctx.fillStyle = glow;
      roundRect(ctx, -s.w * 0.62, -s.h * 0.62, s.w * 1.24, s.h * 1.24, Math.min(s.w, s.h) * 0.45);
      ctx.fill();

      // core
      ctx.fillStyle = stroke;
      roundRect(ctx, -s.w / 2, -s.h / 2, s.w, s.h, Math.min(s.w, s.h) * 0.35);
      ctx.fill();

      // highlight
      ctx.fillStyle = `rgba(255,255,255,${0.04 * k})`;
      ctx.fillRect(-s.w * 0.18, -s.h * 0.08, s.w * 0.36, s.h * 0.16);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    ctx.restore();
  }

  destroy() {}

  private makeShard(initial: boolean, burst = false, ox?: number, oy?: number): Shard {
    const spawnAtMouse = typeof ox === "number" && typeof oy === "number";
    const fromEdge = !initial && !spawnAtMouse && Math.random() < 0.65;

    let x = spawnAtMouse ? ox! : rand(0, this.w);
    let y = spawnAtMouse ? oy! : rand(0, this.h);

    if (fromEdge) {
      const edge = Math.floor(rand(0, 4));
      if (edge === 0) { x = -120; y = rand(0, this.h); }
      if (edge === 1) { x = this.w + 120; y = rand(0, this.h); }
      if (edge === 2) { x = rand(0, this.w); y = -120; }
      if (edge === 3) { x = rand(0, this.w); y = this.h + 120; }
    }

    const sp = burst ? rand(1.3, 3.0) : rand(0.22, 1.15);
    const ang = rand(0, Math.PI * 2);

    const hueBase = rand(190, 206); // blue/cyan
    const hue = hueBase + (Math.random() < 0.18 ? 38 : 0); // иногда фиолет

    const w = rand(8, 30);
    const h = rand(2.6, 11);

    return {
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.022, 0.022),
      w,
      h,
      life: 0,
      maxLife: burst ? rand(2.0, 3.2) : rand(3.0, 7.2),
      hue,
    };
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/* ------------------------------ PASS: BLOOM ------------------------------ */

class BloomPass implements Pass {
  private offA!: HTMLCanvasElement;
  private offB!: HTMLCanvasElement;
  private ctxA!: CanvasRenderingContext2D;
  private ctxB!: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;

  constructor(private opts: { strength: number; radius: number }) {}

  onResize(w: number, h: number) {
    this.w = w;
    this.h = h;

    this.offA = document.createElement("canvas");
    this.offB = document.createElement("canvas");

    const a = this.offA.getContext("2d");
    const b = this.offB.getContext("2d");
    if (!a || !b) throw new Error("Offscreen ctx not available");
    this.ctxA = a;
    this.ctxB = b;

    this.offA.width = w;
    this.offA.height = h;
    this.offB.width = w;
    this.offB.height = h;
  }

  apply(main: HTMLCanvasElement, ctxMain: CanvasRenderingContext2D) {
    const strength = clamp(this.opts.strength, 0, 2);
    const r = clamp(this.opts.radius, 6, 26);

    this.ctxA.clearRect(0, 0, this.w, this.h);
    this.ctxA.drawImage(main, 0, 0, this.w, this.h);

    this.ctxB.clearRect(0, 0, this.w, this.h);
    this.ctxB.filter = `blur(${r}px)`;
    this.ctxB.globalAlpha = 1;
    this.ctxB.drawImage(this.offA, 0, 0);
    this.ctxB.filter = "none";

    ctxMain.save();
    ctxMain.globalCompositeOperation = "screen";
    ctxMain.globalAlpha = 0.18 + 0.22 * strength;
    ctxMain.drawImage(this.offB, 0, 0, this.w, this.h);
    ctxMain.globalAlpha = 0.10 + 0.10 * strength;
    ctxMain.drawImage(this.offB, 0, 0, this.w, this.h);
    ctxMain.restore();
  }

  destroy() {}
}

/* ---------------------------- PASS: VIGNETTE ---------------------------- */

class VignettePass implements Pass {
  private w = 0;
  private h = 0;

  constructor(private opts: { strength: number }) {}

  onResize(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  apply(_main: HTMLCanvasElement, ctxMain: CanvasRenderingContext2D) {
    const s = clamp(this.opts.strength, 0, 1);

    const g = ctxMain.createRadialGradient(
      this.w * 0.5,
      this.h * 0.42,
      0,
      this.w * 0.5,
      this.h * 0.42,
      Math.max(this.w, this.h) * 0.88
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.68, `rgba(0,0,0,${0.46 * s})`);
    g.addColorStop(1, `rgba(0,0,0,${0.92 * s})`);

    ctxMain.save();
    ctxMain.globalCompositeOperation = "source-over";
    ctxMain.fillStyle = g;
    ctxMain.fillRect(0, 0, this.w, this.h);
    ctxMain.restore();
  }

  destroy() {}
}
