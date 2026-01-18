"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, LogIn, X, Menu } from "lucide-react";

type Item = { label: string; href: string };

// ✅ ДОБАВЛЕНО: "Контакты" -> #contacts
// ✅ "Сотрудничество" -> #partnership (реальный id секции)
const ITEMS: Item[] = [
  { label: "О нас", href: "#about" },
  { label: "Платформа", href: "#platform" },
  { label: "Топ-10 составов", href: "#rosters" },
  { label: "Масштаб", href: "#scale" },
  { label: "Сотрудничество", href: "#partnership" },
  { label: "Контакты", href: "#contacts" },
];

// ✅ Эти пункты должны работать ВСЕГДА (даже если секция появляется позже)
const ALWAYS_ENABLED = new Set<string>([
  "#about",
  "#rosters",
  "#partnership",
  "#contacts",
]);

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function isCoarsePointer() {
  if (typeof window === "undefined") return true;
  return !!window.matchMedia?.("(pointer: coarse)")?.matches;
}

function getScrollOffset() {
  return 96;
}

export default function FloatingNav() {
  const reduce = useReducedMotion() ?? false;

  const linksWrapRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [line, setLine] = useState({ left: 0, width: 0, opacity: 0 });

  const [scrolled, setScrolled] = useState(false);
  const [scrollGlow, setScrollGlow] = useState(0);

  const allowHover =
    !reduce && typeof window !== "undefined" && !isCoarsePointer();

  const [enabled, setEnabled] = useState<boolean[]>(
    () => new Array(ITEMS.length).fill(false)
  );

  // ✅ Проверка секций: сразу + повтор (если секции подгружаются/рендерятся позже)
  useEffect(() => {
    const compute = () => {
      setEnabled(
        ITEMS.map((i) => {
          if (ALWAYS_ENABLED.has(i.href)) return true;
          return !!document.querySelector<HTMLElement>(i.href);
        })
      );
    };

    compute();

    // повторные прогоны — решают кейс "секция появилась позже"
    const t1 = window.setTimeout(compute, 200);
    const t2 = window.setTimeout(compute, 800);
    const t3 = window.setTimeout(compute, 1600);

    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  // ---------- MAGIC LINE ----------
  const setLineToIdx = (idx: number) => {
    const link = linkRefs.current[idx];
    const wrap = linksWrapRef.current;
    if (!link || !wrap) return;

    const l = link.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const left = l.left - w.left;

    setLine({ left, width: l.width, opacity: 1 });
  };

  useEffect(() => {
    let raf = 0;
    const update = () => setLineToIdx(hoverIdx ?? activeIdx);

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [activeIdx, hoverIdx]);

  // ---------- ACTIVE SECTION ON SCROLL ----------
  useEffect(() => {
    let raf = 0;

    const compute = () => {
      raf = 0;
      const y = window.scrollY;

      setScrolled(y > 12);
      setScrollGlow(clamp(y / 520, 0, 1));

      const offset = getScrollOffset();

      let curr = 0;
      for (let i = 0; i < ITEMS.length; i++) {
        if (!enabled[i]) continue;
        const el = document.querySelector<HTMLElement>(ITEMS[i].href);
        if (!el) continue;
        if (y + offset >= el.offsetTop) curr = i;
      }
      setActiveIdx(curr);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  // ---------- MOBILE UX ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      const panel = mobilePanelRef.current;
      if (!panel) return;
      if (!panel.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const trySmoothScroll = (href: string) => {
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return false;

    const top =
      window.scrollY + target.getBoundingClientRect().top - getScrollOffset();

    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduce ? "auto" : "smooth",
    });

    return true;
  };

  const onNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    idx: number,
    ok: boolean
  ) => {
    if (!ok) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const did = trySmoothScroll(href);
    if (did) {
      e.preventDefault();
      setOpen(false);
      setActiveIdx(idx);
      setHoverIdx(null);
      requestAnimationFrame(() => setLineToIdx(idx));
    }
  };

  const pillScale = scrolled ? 0.99 : 1;
  const pillY = scrolled ? -2 : 0;

  const blurPx = scrolled ? 16 : 14;
  const rimAlpha = 0.14 + scrollGlow * 0.14;
  const washAlpha = 0.12 + scrollGlow * 0.14;

  // ✅ FIX: кнопка Steam теперь СИНЯЯ (текст/бордер), не заливка
  const steamStyle = useMemo(
    () => ({
      background: "rgba(59,130,246,0.10)",
      border: "1px solid rgba(59,130,246,0.35)",
      color: "rgb(180,220,255)",
      boxShadow: "0 0 22px rgba(59,130,246,.28)",
    }),
    []
  );

  return (
    <LazyMotion features={domAnimation}>
      <>
        <nav className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-[80]">
          {/* DESKTOP */}
          <m.div
            initial={false}
            animate={reduce ? undefined : { scale: pillScale, y: pillY }}
            transition={
              reduce ? undefined : { type: "spring", stiffness: 260, damping: 22 }
            }
            className={[
              "hidden sm:flex items-center gap-6 rounded-full",
              "border border-white/10",
              "bg-[color:var(--wild-bg)]/72",
              "px-6 py-2",
              "relative overflow-hidden",
            ].join(" ")}
            style={{
              backdropFilter: `blur(${blurPx}px)`,
              boxShadow:
                "0 18px 60px rgba(0,0,0,.50), inset 0 1px 0 rgba(255,255,255,.06)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                boxShadow: `inset 0 0 0 1px rgba(59,130,246,${rimAlpha})`,
              }}
            />
            <div
              className="pointer-events-none absolute -inset-10 opacity-70"
              style={{
                background: `radial-gradient(740px 220px at 50% 0%, rgba(59,130,246,${washAlpha}), transparent 62%)`,
                filter: "blur(12px)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.20]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.18), transparent 48%, transparent)",
              }}
            />

            {/* LOGO */}
            <a href="/landing" className="flex items-center gap-2 relative">
              <Image
                src="/logoW.png"
                alt="WILD"
                width={96}
                height={24}
                priority
                className="h-6 w-auto"
              />
            </a>

            {/* LINKS */}
            <div ref={linksWrapRef} className="relative">
              <ul className="flex items-center gap-6">
                {ITEMS.map((i, idx) => {
                  const ok = enabled[idx];
                  const isActive = idx === activeIdx && ok;
                  const isHover = hoverIdx === idx;

                  return (
                    <li key={i.href} className="relative">
                      {allowHover && ok ? (
                        <AnimatePresence>
                          {(isHover || isActive) && (
                            <m.span
                              layoutId="navHalo"
                              className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-full"
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{
                                opacity: isActive ? 0.18 : 0.12,
                                scale: 1,
                              }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.14, ease: "easeOut" }}
                              style={{
                                background:
                                  "radial-gradient(70% 70% at 50% 50%, rgba(59,130,246,.30), transparent 68%)",
                              }}
                            />
                          )}
                        </AnimatePresence>
                      ) : null}

                      <a
                        href={i.href}
                        ref={(el) => {
                          linkRefs.current[idx] = el;
                        }}
                        onClick={(e) => onNavClick(e, i.href, idx, ok)}
                        onMouseEnter={
                          allowHover && ok ? () => setHoverIdx(idx) : undefined
                        }
                        onMouseLeave={
                          allowHover && ok ? () => setHoverIdx(null) : undefined
                        }
                        className={[
                          "relative select-none transition-colors",
                          "text-[13.5px] tracking-[0.02em]",
                          ok
                            ? isActive
                              ? "text-white"
                              : "text-white/70 hover:text-white"
                            : "text-white/35 cursor-not-allowed",
                        ].join(" ")}
                        aria-disabled={!ok}
                      >
                        {i.label}
                      </a>
                    </li>
                  );
                })}
              </ul>

              {/* MAGIC LINE */}
              <span
                className="pointer-events-none absolute left-0 bottom-[-7px] h-[2px] rounded-full"
                style={{
                  width: line.width,
                  transform: `translate3d(${line.left}px,0,0)`,
                  opacity: enabled[hoverIdx ?? activeIdx] ? line.opacity : 0,
                  background:
                    "linear-gradient(90deg,var(--wild-accent),var(--wild-accent-2))",
                  boxShadow: "0 0 18px rgba(59,130,246,.55)",
                  transition:
                    "transform 220ms cubic-bezier(.2,.9,.2,1), width 220ms cubic-bezier(.2,.9,.2,1), opacity 140ms",
                }}
              />
            </div>

            {/* STEAM */}
            <m.a
              href="/api/auth/steam"
              className="relative rounded-full px-4 py-1.5 text-sm font-semibold overflow-hidden"
              whileHover={allowHover ? { y: -1 } : undefined}
              whileTap={reduce ? undefined : { scale: 0.985 }}
              style={steamStyle}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "linear-gradient(110deg, transparent, rgba(59,130,246,.22), transparent)",
                }}
              />
              <span className="relative inline-flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign in via Steam
                <ArrowRight className="h-4 w-4" />
              </span>
            </m.a>
          </m.div>

          {/* MOBILE */}
          <div className="sm:hidden">
            <m.div
              initial={false}
              animate={
                reduce
                  ? undefined
                  : { scale: scrolled ? 0.99 : 1, y: scrolled ? -2 : 0 }
              }
              transition={
                reduce
                  ? undefined
                  : { type: "spring", stiffness: 260, damping: 22 }
              }
              className="relative flex items-center justify-between rounded-full border border-white/10
                         bg-[color:var(--wild-bg)]/72 backdrop-blur
                         px-3.5 py-1.5
                         w-[calc(100vw-20px)] max-w-[520px] overflow-hidden"
              style={{
                backdropFilter: `blur(${blurPx}px)`,
                boxShadow:
                  "0 18px 60px rgba(0,0,0,.50), inset 0 1px 0 rgba(255,255,255,.06)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow: `inset 0 0 0 1px rgba(59,130,246,${rimAlpha})`,
                }}
              />
              <div
                className="pointer-events-none absolute -inset-10 opacity-70"
                style={{
                  background: `radial-gradient(520px 170px at 50% 0%, rgba(59,130,246,${washAlpha}), transparent 62%)`,
                  filter: "blur(12px)",
                }}
              />

              <a href="/landing" className="flex items-center gap-2">
                <span className="font-extrabold tracking-[0.18em] text-[13px] text-white">
                  WILD
                </span>
              </a>

              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white"
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </m.div>
          </div>
        </nav>

        {/* MOBILE SHEET */}
        <AnimatePresence>
          {open && (
            <>
              <m.div
                className="fixed inset-0 z-[70] bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <m.div
                ref={mobilePanelRef}
                className="sm:hidden fixed left-1/2 -translate-x-1/2 top-[62px] z-[80]
                         w-[calc(100vw-20px)] max-w-[520px]"
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: -10, scale: 0.98 }
                }
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: -10, scale: 0.98 }
                }
                transition={
                  reduce
                    ? { duration: 0.14 }
                    : { type: "spring", stiffness: 260, damping: 22 }
                }
              >
                <div
                  className="relative rounded-2xl border border-white/10
                             bg-[color:var(--wild-bg)]/86 backdrop-blur-xl
                             p-3 overflow-hidden"
                  style={{
                    boxShadow:
                      "0 26px 80px rgba(0,0,0,.60), inset 0 1px 0 rgba(255,255,255,.06)",
                  }}
                >
                  <div
                    className="pointer-events-none absolute -inset-12 opacity-70"
                    style={{
                      background:
                        "radial-gradient(620px 280px at 50% 0%, rgba(59,130,246,.28), transparent 68%)",
                      filter: "blur(14px)",
                    }}
                  />

                  <ul className="relative flex flex-col gap-2 max-h-[60vh] overflow-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
                    {ITEMS.map((i, idx) => {
                      const ok = enabled[idx];
                      const isActive = idx === activeIdx && ok;

                      return (
                        <li key={i.href}>
                          <a
                            href={i.href}
                            className={[
                              "flex items-center justify-between rounded-xl",
                              "px-3 py-2.5",
                              "border border-white/10 bg-white/[0.03]",
                              ok
                                ? isActive
                                  ? "text-white"
                                  : "text-white/70"
                                : "text-white/35 cursor-not-allowed",
                            ].join(" ")}
                            onClick={(e) => {
                              onNavClick(e, i.href, idx, ok);
                              if (ok) setOpen(false);
                            }}
                            aria-disabled={!ok}
                          >
                            <span className="font-medium text-[14px]">
                              {i.label}
                            </span>
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                background: ok
                                  ? isActive
                                    ? "var(--wild-accent)"
                                    : "rgba(255,255,255,.18)"
                                  : "rgba(255,255,255,.12)",
                                boxShadow: isActive
                                  ? "0 0 14px rgba(59,130,246,.55)"
                                  : "none",
                              }}
                            />
                          </a>
                        </li>
                      );
                    })}

                    <li className="pt-2">
                      <m.a
                        href="/api/auth/steam"
                        whileTap={reduce ? undefined : { scale: 0.985 }}
                        className="relative block text-center rounded-xl px-4 py-2.5 font-semibold overflow-hidden"
                        style={steamStyle}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                          style={{
                            background:
                              "linear-gradient(110deg, transparent, rgba(59,130,246,.22), transparent)",
                          }}
                        />
                        <span className="relative inline-flex items-center justify-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Sign in via Steam
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </m.a>
                    </li>
                  </ul>
                </div>
              </m.div>
            </>
          )}
        </AnimatePresence>
      </>
    </LazyMotion>
  );
}
