"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LogIn, X, Menu } from "lucide-react";

type Item = { label: string; href: string };

const ITEMS: Item[] = [
  { label: "О нас", href: "#about" },
  { label: "Платформа", href: "#platform" },
  { label: "Составы", href: "#rosters" },
  { label: "Масштаб", href: "#scale" },
  { label: "Преимущества", href: "#why-players" },
  { label: "Сотрудничество", href: "#why-wild" },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function FloatingNav() {
  const pillRef = useRef<HTMLDivElement>(null);
  const linksWrapRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [line, setLine] = useState({ left: 0, width: 0, opacity: 0 });

  const [scrolled, setScrolled] = useState(false);
  const [scrollGlow, setScrollGlow] = useState(0); // 0..1

  // ---------- MAGIC LINE ----------
  function setLineToIdx(idx: number) {
    const link = linkRefs.current[idx];
    const wrap = linksWrapRef.current;
    if (!link || !wrap) return;

    const l = link.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const left = l.left - w.left;

    setLine({ left, width: l.width, opacity: 1 });
  }

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

  useEffect(() => {
    setLineToIdx(activeIdx);
  }, [activeIdx]);

  // ---------- ACTIVE SECTION ON SCROLL ----------
  useEffect(() => {
    const sections = ITEMS.map((i) => document.querySelector<HTMLElement>(i.href)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const onScroll = () => {
      const y = window.scrollY;

      // shrink + glow power
      setScrolled(y > 16);
      setScrollGlow(clamp(y / 420, 0, 1));

      // active section
      let curr = 0;
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop;
        if (y >= top - 220) curr = i;
      }
      setActiveIdx(curr);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------- MOBILE UX ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    // lock body scroll when mobile open
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

  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.querySelector(href) as HTMLElement | null;
    if (!target) return;
    e.preventDefault();
    setOpen(false);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pillScale = scrolled ? 0.98 : 1;
  const pillY = scrolled ? -2 : 0;

  const glowAlpha = 0.22 + scrollGlow * 0.22; // 0.22..0.44
  const blurPx = scrolled ? 14 : 12;

  const steamStyle = useMemo(
    () => ({
      background: "linear-gradient(90deg,var(--wild-accent),var(--wild-accent-2))",
      color: "#0b1020",
    }),
    []
  );

  return (
    <>
      {/* PILL */}
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-[80]">
        {/* Desktop */}
        <motion.div
          ref={pillRef}
          initial={false}
          animate={{ scale: pillScale, y: pillY }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={[
            "hidden sm:flex items-center gap-6 rounded-full",
            "border border-[color:var(--wild-stroke)]",
            "bg-[color:var(--wild-bg)]/85",
            "px-6 py-2",
            "shadow-[0_8px_32px_rgba(0,0,0,.35)]",
            "relative overflow-hidden",
          ].join(" ")}
          style={{ backdropFilter: `blur(${blurPx}px)` }}
        >
          {/* NEON RIM + GLOW */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: `inset 0 0 0 1px rgba(59,130,246,${0.18 + scrollGlow * 0.12})`,
            }}
          />
          <div
            className="pointer-events-none absolute -inset-10 opacity-70"
            style={{
              background: `radial-gradient(600px 180px at 50% 0%, rgba(59,130,246,${glowAlpha}), transparent 60%)`,
              filter: "blur(10px)",
            }}
          />

          {/* SHIMMER SWEEP */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(110deg, transparent, rgba(255,255,255,.35), transparent)",
            }}
            animate={{ x: ["-120%", "120%"] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "linear" }}
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
            <ul className="flex items-center gap-6 text-[0.95rem]">
              {ITEMS.map((i, idx) => {
                const isActive = idx === activeIdx;
                const isHover = hoverIdx === idx;

                return (
                  <li key={i.href} className="relative">
                    {/* hover halo */}
                    <AnimatePresence>
                      {(isHover || isActive) && (
                        <motion.span
                          layoutId="navHalo"
                          className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-full"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: isActive ? 0.28 : 0.18, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          style={{
                            background:
                              "radial-gradient(70% 70% at 50% 50%, rgba(59,130,246,.35), transparent 65%)",
                          }}
                        />
                      )}
                    </AnimatePresence>

                    <a
                      href={i.href}
                      ref={(el) => {
                        linkRefs.current[idx] = el;
                      }}
                      onClick={(e) => onLinkClick(e, i.href)}
                      onMouseEnter={() => setHoverIdx(idx)}
                      onMouseLeave={() => setHoverIdx(null)}
                      className={[
                        "relative transition-colors",
                        isActive ? "text-white" : "text-neutral-300 hover:text-white",
                      ].join(" ")}
                    >
                      {i.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* MAGIC LINE (glow + smooth) */}
            <span
              className="pointer-events-none absolute left-0 bottom-[-7px] h-[2px] rounded-full"
              style={{
                width: line.width,
                transform: `translate3d(${line.left}px,0,0)`,
                opacity: line.opacity,
                background: "linear-gradient(90deg,var(--wild-accent),var(--wild-accent-2))",
                boxShadow: "0 0 16px rgba(59,130,246,.55)",
                transition: "transform 220ms cubic-bezier(.2,.9,.2,1), width 220ms cubic-bezier(.2,.9,.2,1), opacity 140ms",
              }}
            />
          </div>

          {/* STEAM BUTTON */}
          <motion.a
            href="/api/auth/steam"
            className="relative rounded-full px-4 py-1.5 text-sm font-semibold overflow-hidden"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={steamStyle}
          >
            {/* button shine */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-35"
              style={{
                background:
                  "linear-gradient(120deg, transparent, rgba(255,255,255,.65), transparent)",
              }}
              animate={{ x: ["-120%", "120%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign in via Steam
              <ArrowRight className="h-4 w-4" />
            </span>
          </motion.a>
        </motion.div>

        {/* Mobile */}
        <div className="sm:hidden">
          <motion.div
            initial={false}
            animate={{ scale: scrolled ? 0.98 : 1, y: scrolled ? -2 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative flex items-center justify-between rounded-full border border-[color:var(--wild-stroke)]
                       bg-[color:var(--wild-bg)]/85 backdrop-blur px-4 py-2
                       w-[calc(100vw-24px)] max-w-[520px] overflow-hidden"
            style={{ backdropFilter: `blur(${blurPx}px)` }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: `inset 0 0 0 1px rgba(59,130,246,${0.18 + scrollGlow * 0.12})` }}
            />
            <a href="/landing" className="flex items-center gap-2">
              <span className="font-extrabold tracking-[0.18em] text-white">WILD</span>
            </a>

            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white"
              aria-label="Toggle menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </motion.div>
        </div>
      </nav>

      {/* MOBILE SHEET */}
      <AnimatePresence>
        {open && (
          <>
            {/* backdrop */}
            <motion.div
              className="fixed inset-0 z-[70] bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              ref={mobilePanelRef}
              className="sm:hidden fixed left-1/2 -translate-x-1/2 top-[74px] z-[80]
                       w-[calc(100vw-24px)] max-w-[520px]"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div
                className="relative rounded-2xl border border-[color:var(--wild-stroke)]
                           bg-[color:var(--wild-bg)]/92 backdrop-blur-xl p-4 overflow-hidden"
                style={{ boxShadow: "0 22px 70px rgba(0,0,0,.55)" }}
              >
                {/* neon wash */}
                <div
                  className="pointer-events-none absolute -inset-12 opacity-70"
                  style={{
                    background:
                      "radial-gradient(600px 260px at 50% 0%, rgba(59,130,246,.38), transparent 65%)",
                    filter: "blur(12px)",
                  }}
                />

                <ul className="relative flex flex-col gap-2">
                  {ITEMS.map((i, idx) => {
                    const isActive = idx === activeIdx;

                    return (
                      <li key={i.href}>
                        <a
                          href={i.href}
                          className={[
                            "group flex items-center justify-between rounded-xl px-3 py-3",
                            "border border-white/10 bg-white/[0.03]",
                            isActive ? "text-white" : "text-neutral-300",
                          ].join(" ")}
                          onClick={(e) => onLinkClick(e, i.href)}
                        >
                          <span className="font-medium">{i.label}</span>
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              background: isActive ? "var(--wild-accent)" : "rgba(255,255,255,.18)",
                              boxShadow: isActive ? "0 0 14px rgba(59,130,246,.55)" : "none",
                            }}
                          />
                        </a>
                      </li>
                    );
                  })}

                  <li className="pt-2">
                    <motion.a
                      href="/api/auth/steam"
                      whileTap={{ scale: 0.985 }}
                      className="relative block text-center rounded-xl px-4 py-3 font-semibold overflow-hidden"
                      style={steamStyle}
                    >
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-35"
                        style={{
                          background:
                            "linear-gradient(120deg, transparent, rgba(255,255,255,.65), transparent)",
                        }}
                        animate={{ x: ["-120%", "120%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="relative inline-flex items-center justify-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign in via Steam
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </motion.a>
                  </li>
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
