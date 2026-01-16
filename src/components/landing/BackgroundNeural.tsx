"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  intensity?: number; // 0.6..2
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type Dust = { x: number; y: number; vx: number; vy: number; a: number; s: number };
type Glow = { x: number; y: number; r: number; hue: number; a: number; drift: number };
type TrailPoint = { x: number; y: number; v: number };

export default function BackgroundNeural({ intensity = 1.15 }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = ref.current;
    if (canvasEl === null) return;
    const canvas: HTMLCanvasElement = canvasEl;

    const ctx2d = canvas.getContext("2d", { alpha: true });
    if (ctx2d === null) return;
    const ctx: CanvasRenderingContext2D = ctx2d;

    const I = clamp(intensity, 0.6, 2);

    const isTouch =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints ?? 0) > 1;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const saveData =
      typeof navigator !== "undefined" &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).connection &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).connection.saveData === true;

    // На телефоне/тач — максимально лёгкий режим
    const allowPointerFX = !isTouch && !prefersReduced && !saveData;

    let w = 0;
    let h = 0;
    let dpr = 1;

    let running = true;
    let raf = 0;

    // Auto-quality: рендер в меньшем внутреннем разрешении, если FPS падает
    let quality = 1; // 1 / 0.85 / 0.7
    let fpsSMA = 60;

    // Time
    let t = 0;
    let last = performance.now();

    // Mouse
    const mouse = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      vx: 0,
      vy: 0,
      inited: false,
    };

    const onMove = (e: PointerEvent) => {
      if (!allowPointerFX) return;
      if (!mouse.inited) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.tx = e.clientX;
        mouse.ty = e.clientY;
        mouse.inited = true;
      } else {
        mouse.tx = e.clientX;
        mouse.ty = e.clientY;
      }
    };

    // Visibility pause (важно для батареи/лагов)
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      } else {
        if (!running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      }
    };

    // Scene
    let dust: Dust[] = [];
    let glows: Glow[] = [];
    const sweeps = [
      { phase: rand(0, Math.PI * 2), speed: rand(0.08, 0.14) },
      { phase: rand(0, Math.PI * 2), speed: rand(0.05, 0.11) },
    ];

    // Pointer trail
    const trailLen = allowPointerFX ? Math.floor(clamp(14 * I, 10, 18)) : 0;
    let trail: TrailPoint[] = [];

    // ======= Fast sprites (самое важное для плавности) =======
    // Спрайт точки-пыли
    const dustSprite = document.createElement("canvas");
    const dustCtx = dustSprite.getContext("2d");
    // Спрайт glow для хвоста
    const glowSprite = document.createElement("canvas");
    const glowCtx = glowSprite.getContext("2d");
    // Спрайт ядра курсора
    const coreSprite = document.createElement("canvas");
    const coreCtx = coreSprite.getContext("2d");

    function buildSprites() {
      // Dust sprite (маленький мягкий круг)
      if (dustCtx) {
        const s = 16;
        dustSprite.width = s;
        dustSprite.height = s;
        dustCtx.clearRect(0, 0, s, s);
        const g = dustCtx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, "rgba(255,255,255,0.9)");
        g.addColorStop(0.35, "rgba(255,255,255,0.25)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        dustCtx.fillStyle = g;
        dustCtx.fillRect(0, 0, s, s);
      }

      // Glow sprite (большой мягкий круг для хвоста)
      if (glowCtx) {
        const s = 128;
        glowSprite.width = s;
        glowSprite.height = s;
        glowCtx.clearRect(0, 0, s, s);
        const g = glowCtx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, "rgba(34,211,238,0.95)");
        g.addColorStop(0.35, "rgba(59,130,246,0.40)");
        g.addColorStop(0.75, "rgba(59,130,246,0.12)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        glowCtx.fillStyle = g;
        glowCtx.fillRect(0, 0, s, s);
      }

      // Core sprite (чуть ярче центр)
      if (coreCtx) {
        const s = 160;
        coreSprite.width = s;
        coreSprite.height = s;
        coreCtx.clearRect(0, 0, s, s);
        const g = coreCtx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, "rgba(255,255,255,0.12)");
        g.addColorStop(0.18, "rgba(34,211,238,0.95)");
        g.addColorStop(0.45, "rgba(59,130,246,0.45)");
        g.addColorStop(0.75, "rgba(59,130,246,0.18)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        coreCtx.fillStyle = g;
        coreCtx.fillRect(0, 0, s, s);
      }
    }

    function setCanvasSize() {
      const dprCap = isTouch ? 1.5 : 2;
      dpr = clamp(window.devicePixelRatio || 1, 1, dprCap);

      w = window.innerWidth;
      h = window.innerHeight;

      const scale = quality;

      canvas.width = Math.floor(w * dpr * scale);
      canvas.height = Math.floor(h * dpr * scale);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    }

    function resetScene() {
      // меньше пыли на телефоне
      const baseDust = isTouch ? 60 : 110;
      const dustCount = Math.floor(clamp(baseDust * I, isTouch ? 45 : 70, isTouch ? 95 : 170));

      dust = Array.from({ length: dustCount }).map(() => ({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.03, 0.03),
        vy: rand(-0.02, 0.02),
        a: rand(isTouch ? 0.035 : 0.03, isTouch ? 0.10 : 0.12),
        s: rand(0.6, 1.5),
      }));

      const R = Math.max(w, h);
      // Новый фон (та же ассоциация: deep blue neon)
      glows = [
        { x: 0.22, y: 0.34, r: R * 0.62, hue: 210, a: 0.12, drift: 0.08 },
        { x: 0.75, y: 0.28, r: R * 0.70, hue: 200, a: 0.10, drift: 0.06 },
        { x: 0.55, y: 0.72, r: R * 0.78, hue: 222, a: 0.09, drift: 0.05 },
        { x: 0.86, y: 0.78, r: R * 0.58, hue: 262, a: 0.05, drift: 0.04 }, // лёгкий фиолет (очень мало)
      ];

      if (allowPointerFX) {
        const cx = w * 0.5;
        const cy = h * 0.5;
        trail = Array.from({ length: trailLen }).map(() => ({ x: cx, y: cy, v: 0 }));
        mouse.inited = false;
      } else {
        trail = [];
        mouse.inited = false;
      }
    }

    function resize() {
      setCanvasSize();
      resetScene();
    }

    function drawBackground() {
      // База: deep black
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillRect(0, 0, w, h);

      // Параллакс только если есть курсор FX, иначе static (меньше расчётов)
      const mx = allowPointerFX ? (mouse.x - w / 2) / w : 0;
      const my = allowPointerFX ? (mouse.y - h / 2) / h : 0;

      // Туманности (очень дешево, всего 4 радиальных градиента)
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < glows.length; i++) {
        const g0 = glows[i];
        const drift = Math.sin(t * g0.drift + i * 2.1) * 0.02;

        const px = (g0.x + drift) * w + mx * 80 * (0.6 + i * 0.12);
        const py = (g0.y - drift) * h + my * 60 * (0.6 + i * 0.12);

        const rr = g0.r * (0.95 + 0.06 * Math.sin(t * 0.22 + i));
        const grad = ctx.createRadialGradient(px, py, 0, px, py, rr);

        grad.addColorStop(0, `hsla(${g0.hue}, 95%, 58%, ${g0.a * (0.9 + 0.18 * I)})`);
        grad.addColorStop(0.35, `hsla(${g0.hue + 10}, 95%, 52%, ${g0.a * 0.55})`);
        grad.addColorStop(0.78, `hsla(${g0.hue + 20}, 90%, 42%, ${g0.a * 0.18})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();

      // Редкие световые “sweep” — 2 штуки, без blur
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (let k = 0; k < sweeps.length; k++) {
        const s = sweeps[k];
        const p = (t * s.speed + s.phase) % (Math.PI * 2);
        const a = 0.035 + 0.05 * (0.5 + 0.5 * Math.sin(p));
        const alpha = a * (0.75 + 0.25 * I);

        const cx = w * (0.15 + 0.7 * (0.5 + 0.5 * Math.sin(p * 0.7)));
        const cy = h * (0.25 + 0.5 * (0.5 + 0.5 * Math.cos(p * 0.6)));

        ctx.translate(cx, cy);
        ctx.rotate(-0.35);

        const lg = ctx.createLinearGradient(-w, 0, w, 0);
        lg.addColorStop(0, "rgba(0,0,0,0)");
        lg.addColorStop(0.45, `rgba(59,130,246,${alpha})`);
        lg.addColorStop(0.55, `rgba(34,211,238,${alpha * 0.95})`);
        lg.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = lg;
        ctx.fillRect(-w, -h * 0.11, w * 2, h * 0.22);

        ctx.setTransform(dpr * quality, 0, 0, dpr * quality, 0, 0);
      }

      ctx.restore();

      // Dust — рисуем через спрайт (быстро)
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const ds = 16;
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];

        d.x += d.vx * (0.6 + 0.7 * I);
        d.y += d.vy * (0.6 + 0.7 * I);

        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10;
        if (d.y > h + 10) d.y = -10;

        const tw = 0.7 + 0.3 * Math.sin(t * 1.1 + d.x * 0.01);
        const aa = d.a * tw;

        ctx.globalAlpha = aa;
        const size = ds * d.s;
        ctx.drawImage(dustSprite, d.x - size / 2, d.y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.restore();

      // Vignette
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      const vg = ctx.createRadialGradient(
        w * 0.5,
        h * 0.45,
        0,
        w * 0.5,
        h * 0.45,
        Math.max(w, h) * 0.9
      );
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(0.7, "rgba(0,0,0,0.45)");
      vg.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    function drawPointerFX() {
      if (!allowPointerFX) return;

      // Обновление мыши и скорости
      const dx = mouse.tx - mouse.x;
      const dy = mouse.ty - mouse.y;

      mouse.vx = lerp(mouse.vx, dx, 0.22);
      mouse.vy = lerp(mouse.vy, dy, 0.22);

      mouse.x = lerp(mouse.x, mouse.tx || w / 2, 0.12);
      mouse.y = lerp(mouse.y, mouse.ty || h / 2, 0.12);

      const speed = Math.min(90, Math.abs(mouse.vx) + Math.abs(mouse.vy));
      const v = clamp(speed / 90, 0, 1);

      // Обновляем хвост (маленький массив)
      if (!mouse.inited) return;
      trail.unshift({ x: mouse.x, y: mouse.y, v });
      if (trail.length > trailLen) trail.pop();

      // Рисуем хвост спрайтами (очень быстро)
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // тонкая линия
      ctx.beginPath();
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = `rgba(59,130,246,${0.08 + 0.20 * v})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // свечения вдоль хвоста
      const gs = 128;
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const k = 1 - i / trail.length;

        const size = (24 + 44 * k) * (0.85 + 0.35 * I);
        const a = (0.05 + 0.16 * k) * (0.55 + 0.85 * p.v);

        ctx.globalAlpha = a;
        ctx.drawImage(glowSprite, p.x - size / 2, p.y - size / 2, size, size);
      }

      // ядро под курсором
      const cs = 160;
      const coreSize = 44 * (0.9 + 0.25 * I);
      ctx.globalAlpha = 0.08 + 0.32 * v;
      ctx.drawImage(coreSprite, mouse.x - coreSize / 2, mouse.y - coreSize / 2, coreSize, coreSize);

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function tick(now: number) {
      if (!running) return;

      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      t += dt;

      // FPS monitoring → авто качество
      const fps = 1 / Math.max(dt, 1e-4);
      fpsSMA = fpsSMA * 0.92 + fps * 0.08;

      if (!isTouch) {
        if (fpsSMA < 45 && quality > 0.85) {
          quality = 0.85;
          setCanvasSize();
        } else if (fpsSMA < 35 && quality > 0.7) {
          quality = 0.7;
          setCanvasSize();
        } else if (fpsSMA > 57 && quality < 1) {
          quality = 1;
          setCanvasSize();
        }
      } else {
        // на телефоне держим качество стабильно ниже (чтобы не было “рывков”)
        if (quality !== 0.85) {
          quality = 0.85;
          setCanvasSize();
        }
      }

      drawBackground();
      drawPointerFX();

      raf = requestAnimationFrame(tick);
    }

    // init
    buildSprites();
    resize();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    // Если нет курсора (desktop) — инициализируем в центр
    if (allowPointerFX) {
      mouse.inited = true;
      mouse.x = w / 2;
      mouse.y = h / 2;
      mouse.tx = w / 2;
      mouse.ty = h / 2;
      trail = Array.from({ length: trailLen }).map(() => ({ x: mouse.x, y: mouse.y, v: 0 }));
    }

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [intensity]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={ref} className="h-full w-full" />
    </div>
  );
}
