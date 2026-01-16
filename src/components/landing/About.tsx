"use client";

import React, { useMemo } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import {
  Crown,
  Layers,
  Radar,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type Stat = {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
} as const;

const fadeRight = {
  hidden: { opacity: 0, x: 18 },
  show: { opacity: 1, x: 0 },
} as const;

const STATS: Stat[] = [
  {
    title: "Структура",
    subtitle: "Иерархия составов, роли, внутренняя логика",
    Icon: Layers,
  },
  {
    title: "Прогресс",
    subtitle: "Рост игроков и составов внутри системы",
    Icon: Crown,
  },
  {
    title: "Контроль",
    subtitle: "История, фиксация и прозрачность данных",
    Icon: Radar,
  },
];

export default function WhatIsWild() {
  const reduce = useReducedMotion() ?? false;

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative py-14 lg:py-20">
        <div className="relative mx-auto max-w-[1220px] px-6 lg:px-8">
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_420px] lg:gap-10">
            {/* LEFT */}
            <GlassCard emphasis>
              <m.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2
                  className="
                    font-[var(--font-teko)]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-[40px] leading-[0.95]
                    lg:text-[60px] lg:leading-[0.92]
                    bg-clip-text text-transparent
                  "
                  style={{
                    backgroundImage: `
                      linear-gradient(
                        180deg,
                        rgba(190,210,255,0.98) 0%,
                        rgba(130,170,255,0.9) 45%,
                        rgba(90,130,210,0.8) 100%
                      )
                    `,
                    textShadow: "0 10px 44px rgba(40,80,160,0.45)",
                  }}
                >
                  ЧТО ТАКОЕ WILD?
                </h2>

                <p className="mt-5 max-w-[720px] text-[16px] leading-relaxed text-white/80 lg:text-[18px]">
                  Киберспортивная организация, построенная как система множества
                  составов с собственной рейтинговой платформой.
                </p>

                <p className="mt-4 text-[14px] leading-relaxed text-neutral-300 lg:text-[15px]">
                  Проект находится на этапе официальной регистрации под компанию{" "}
                  <span className="font-semibold text-white">
                    Rexior Limited Liability Company (США)
                  </span>
                  .
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {STATS.map((s) => (
                    <MiniStat key={s.title} {...s} />
                  ))}
                </div>
              </m.div>
            </GlassCard>

            {/* RIGHT */}
            <GlassCard>
              <m.div
                variants={fadeRight}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-white">
                    Статус проекта
                  </h3>

                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold border border-white/10 bg-white/[0.03] text-white/70">
                    активная разработка
                  </span>
                </div>

                <ul className="mt-5 space-y-3 text-sm text-neutral-300">
                  <li className="flex items-center justify-between gap-4">
                    <span>Организация</span>
                    <span className="text-white/85 font-semibold">WILD</span>
                  </li>
                  <li className="flex items-center justify-between gap-4">
                    <span>Юридическая база</span>
                    <span className="text-white/80">Rexior LLC (США)</span>
                  </li>
                  <li className="flex items-center justify-between gap-4">
                    <span>Платформа</span>
                    <span className="text-[color:var(--wild-accent)] font-semibold">
                      Wild v1
                    </span>
                  </li>
                </ul>

                <div className="mt-6 h-px bg-white/10" />

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-white/75">
                    <ShieldCheck className="h-4 w-4 text-[color:var(--wild-accent)]" />
                    <span>Этапы разработки платформы</span>
                  </div>

                  <Roadmap />
                </div>

                <m.a
                  href="/landing"
                  whileTap={reduce ? undefined : { scale: 0.985 }}
                  whileHover={reduce ? undefined : { y: -1 }}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[#0b1020] relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg,var(--wild-accent),var(--wild-accent-2))",
                    boxShadow: "0 0 18px rgba(59,130,246,.35)",
                  }}
                >
                  <span className="relative">Перейти к платформе</span>
                  <ArrowRight className="relative h-4 w-4" />
                </m.a>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-white/55">
                  <Sparkles className="h-3.5 w-3.5 text-[color:var(--wild-accent)]" />
                  <span>Функциональность строится поэтапно.</span>
                </div>
              </m.div>
            </GlassCard>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

/* ===== Roadmap ===== */

function Roadmap() {
  const steps = useMemo(
    () => [
      { label: "Авторизация через Steam" },
      { label: "Профиль и страница игрока" },
      { label: "Поисковая система игроков и составов" },
      { label: "Подписка и расширенные возможности" },
      { label: "Рейтинговая система и сезоны" },
    ],
    []
  );

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <ul className="space-y-2">
        {steps.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="text-white/80">{s.label}</span>
            <span className="text-white/40">в разработке</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ===== UI ===== */

function GlassCard({
  children,
  emphasis = false,
}: {
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl p-6 lg:p-10 border border-white/10 bg-white/[0.04] backdrop-blur-xl",
        emphasis ? "shadow-[0_30px_110px_rgba(0,0,0,0.55)]" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function MiniStat({
  title,
  subtitle,
  Icon,
}: {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative rounded-xl p-4 border border-white/10 bg-white/[0.03]">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
          <Icon className="h-4 w-4 text-[color:var(--wild-accent)]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-white/60">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}
