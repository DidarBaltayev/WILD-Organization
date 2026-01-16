"use client";

import React, { useMemo } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { Target, ShieldCheck, Trophy, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
} as const;

type Pillar = {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export default function Mission() {
  const reduce = useReducedMotion() ?? false;

  const allowHover =
    !reduce &&
    typeof window !== "undefined" &&
    !window.matchMedia?.("(pointer: coarse)")?.matches;

  const PILLARS: Pillar[] = useMemo(
    () => [
      {
        title: "Требования",
        subtitle: "понятные правила входа и поведения",
        Icon: Target,
      },
      {
        title: "Дисциплина",
        subtitle: "фокус, режим, ответственность внутри состава",
        Icon: ShieldCheck,
      },
      {
        title: "Отборы",
        subtitle: "решают действия и стабильность, а не слова",
        Icon: Sparkles,
      },
      {
        title: "Результат",
        subtitle: "ценится игра и прогресс в матчах",
        Icon: Trophy,
      },
    ],
    []
  );

  return (
    <LazyMotion features={domAnimation}>
      <section id="mission" className="wild-section">
        <div className="wild-container">
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="
              relative overflow-hidden rounded-[30px]
              border border-white/10 bg-white/[0.04] backdrop-blur-xl
              shadow-[0_40px_140px_rgba(0,0,0,0.6)]
            "
          >
            {/* atmosphere */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(1200px 680px at 18% 0%, rgba(59,130,246,.22), transparent 62%), radial-gradient(1100px 700px at 90% 100%, rgba(6,182,212,.14), transparent 60%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.12)" }}
            />

            {/* ✅ mobile-safe padding (desktop unchanged) */}
            <div className="relative p-5 sm:p-6 lg:p-14">
              {/* HEADER CENTER (как WhatIsWild) */}
              <div className="flex flex-col items-center text-center">
                <h2
                  className="
                    font-[var(--font-teko)] font-semibold uppercase
                    tracking-[0.12em]
                    text-[38px] leading-[0.95]
                    sm:text-[52px]
                    lg:text-[76px]
                    xl:text-[86px]
                    bg-clip-text text-transparent
                  "
                  style={{
                    backgroundImage: `
                      linear-gradient(
                        180deg,
                        rgba(200,220,255,1) 0%,
                        rgba(130,170,255,0.95) 45%,
                        rgba(90,130,210,0.90) 100%
                      )
                    `,
                    textShadow: "0 14px 64px rgba(40,80,160,0.55)",
                  }}
                >
                  НАША МИССИЯ
                </h2>

                <span
                  aria-hidden
                  className="mt-5 h-px w-40 sm:w-56"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(59,130,246,.65), rgba(6,182,212,.45), transparent)",
                    boxShadow: "0 0 18px rgba(59,130,246,.18)",
                  }}
                />
              </div>

              {/* TEXT CENTER (mobile-safe sizes) */}
              <div className="mt-7 mx-auto max-w-[1200px] text-center space-y-4 sm:space-y-5 text-[16px] leading-relaxed text-white/85 sm:text-[19px] lg:text-[22px]">
                <p>
                  Наша миссия — дать каждому игроку реальный шанс стать частью
                  состава WILD и пройти путь от любителя до медийного
                  профессионала.
                </p>
                <p>WILD создаёт систему, в которой игрок не остаётся один.</p>
                <p>
                  Здесь каждый развивается вместе с составом, получает поддержку
                  капитанов, играет в турнирах, растёт в рейтингах и становится
                  частью большой экосистемы.
                </p>
              </div>

              {/* PILLARS (tight gaps + mobile padding) */}
              <div className="mt-10 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PILLARS.map((p) => (
                  <PillarStrip key={p.title} {...p} allowHover={allowHover} />
                ))}
              </div>
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

function PillarStrip({
  title,
  subtitle,
  Icon,
  allowHover,
}: {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
  allowHover: boolean;
}) {
  return (
    <m.div
      whileHover={allowHover ? { y: -2 } : undefined}
      transition={{ duration: 0.18 }}
      className="
        relative overflow-hidden rounded-2xl
        border border-white/10 bg-white/[0.04]
        p-4 sm:p-6
      "
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(59,130,246,0.10)]" />

      {/* ✅ FIX: было h-36ingle (опечатка) -> нормальные размеры */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rotate-12 opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,.36), transparent 70%)",
        }}
      />

      <div className="relative flex items-start gap-4">
        <div className="mt-0.5 inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] shrink-0">
          <Icon className="h-5 w-5 text-[color:var(--wild-accent)]" />
        </div>

        <div className="min-w-0">
          <div className="text-[15px] sm:text-base font-semibold text-white">
            {title}
          </div>
          <div className="mt-1 text-[13px] sm:text-sm text-white/65 leading-relaxed">
            {subtitle}
          </div>
        </div>
      </div>
    </m.div>
  );
}
