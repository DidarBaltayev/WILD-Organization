"use client";

import React, { useMemo } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { Target, ShieldCheck, Trophy, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
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

  // ✅ НЕ ДУБЛИРУЕМ: карточки = не “шанс/поддержка/турниры/рейтинг”,
  // а короткие обещания-качества (без повторения текста миссии и WhatIsWild)
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
      <section id="mission" className="relative py-16 lg:py-24">
        <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8">
          {/* ONE BIG BLOCK */}
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="
              relative overflow-hidden rounded-[28px]
              border border-white/10 bg-white/[0.035] backdrop-blur-xl
              shadow-[0_30px_110px_rgba(0,0,0,0.55)]
            "
          >
            {/* cheap inner atmosphere */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(900px 520px at 18% 0%, rgba(59,130,246,.20), transparent 60%), radial-gradient(820px 520px at 95% 90%, rgba(6,182,212,.12), transparent 58%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.12)" }}
            />

            <div className="relative p-7 lg:p-12">
              {/* ✅ НАША МИССИЯ — градиент + выделение */}
              <div className="flex items-center gap-3">
                <span
                  className="
                    font-[var(--font-teko)] font-semibold uppercase
                    tracking-[0.18em]
                    text-[28px] leading-none
                    lg:text-[40px]
                    bg-clip-text text-transparent
                  "
                  style={{
                    backgroundImage: `
                      linear-gradient(
                        90deg,
                        rgba(190,210,255,0.98) 0%,
                        rgba(110,170,255,0.92) 45%,
                        rgba(6,182,212,0.88) 100%
                      )
                    `,
                    textShadow: "0 12px 54px rgba(40,80,160,0.45)",
                  }}
                >
                  НАША МИССИЯ
                </span>

                <span
                  aria-hidden
                  className="hidden sm:block h-px flex-1"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(59,130,246,.55), rgba(6,182,212,.35), transparent)",
                    boxShadow: "0 0 18px rgba(59,130,246,.18)",
                  }}
                />
              </div>

              {/* ✅ ТВОЙ КОНТЕКСТ — НЕ МЕНЯЮ НИ СЛОВА */}
              <div className="mt-6 max-w-[920px] space-y-3 text-[15px] leading-relaxed text-white/80 lg:text-[18px] lg:leading-relaxed">
                <p>
                  Наша миссия — дать каждому игроку реальный шанс стать частью состава WILD
                  и пройти путь от любителя до медийного профессионала.
                </p>
                <p>WILD создаёт систему, в которой игрок не остаётся один.</p>
                <p>
                  Здесь каждый развивается вместе с составом, получает поддержку капитанов,
                  играет в турнирах, растёт в рейтингах и становится частью большой
                  экосистемы
                </p>
              </div>

              {/* ✅ карточки без дубля смысла + “состав” вместо “ростер/команда” */}
              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      className="
        relative overflow-hidden rounded-2xl
        border border-white/10 bg-white/[0.03]
        px-5 py-5
      "
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(59,130,246,0.08)]" />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-12 opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,.35), transparent 70%)",
        }}
      />

      <div className="relative flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Icon className="h-4 w-4 text-[color:var(--wild-accent)]" />
        </div>

        <div>
          <div className="text-[13px] font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-white/60 leading-relaxed">{subtitle}</div>
        </div>
      </div>
    </m.div>
  );
}
