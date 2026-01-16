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
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
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
  {
    title: "Масштаб",
    subtitle: "Рост экосистемы и расширение платформы",
    Icon: Crown,
  },
];

export default function WhatIsWild() {
  const reduce = useReducedMotion() ?? false;

  const allowHover =
    !reduce &&
    typeof window !== "undefined" &&
    !window.matchMedia?.("(pointer: coarse)")?.matches;

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
    <LazyMotion features={domAnimation}>
      <section id="whatiswild" className="wild-section">
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
                  "radial-gradient(1200px 680px at 20% 0%, rgba(59,130,246,.22), transparent 62%), radial-gradient(1100px 700px at 90% 100%, rgba(6,182,212,.14), transparent 60%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.12)" }}
            />

            <div className="relative p-5 sm:p-6 lg:p-14">
              {/* TITLE CENTER */}
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
                  ЧТО ТАКОЕ WILD?
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

              {/* TEXT CENTER */}
              <div className="mt-7 mx-auto max-w-[1200px] text-center">
                <p className="text-[16px] leading-relaxed text-white/85 sm:text-[19px] lg:text-[22px]">
                  Киберспортивная организация, построенная как система множества
                  составов с собственной рейтинговой платформой и внутренней
                  логикой роста.
                </p>

                <p className="mt-4 text-[13px] leading-relaxed text-neutral-300 sm:text-[15px] lg:text-[18px]">
                  Проект находится на этапе официальной регистрации под компанию{" "}
                  <span className="font-semibold text-white">
                    Rexior Limited Liability Company (США)
                  </span>
                  , с долгосрочной стратегией масштабирования.
                </p>
              </div>

              {/* STATS (mobile-safe: tighter paddings, 2 cols on small) */}
              <div className="mt-10 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((s) => (
                  <MiniStat key={s.title} {...s} allowHover={allowHover} />
                ))}
              </div>

              {/* STATUS + ROADMAP + CTA */}
              <div className="mt-9 mx-auto max-w-[980px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
                  <div className="px-5 sm:px-6 py-5 border-b border-white/10">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="text-base font-semibold text-white">
                        Статус проекта
                      </div>

                      <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold border border-white/15 bg-white/[0.04] text-white/75">
                        активная разработка
                      </span>

                      {/* mobile-safe: stack labels, no long inline row */}
                      <div className="mt-1 w-full max-w-[740px] grid gap-1.5 text-sm text-white/70">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-white/55">Организация</span>
                          <span className="text-white font-semibold">WILD</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-white/55">Юридическая база</span>
                          <span className="text-white/85">Rexior LLC (США)</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-white/55">Платформа</span>
                          <span className="text-[color:var(--wild-accent)] font-semibold">
                            Wild v1
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                      <ShieldCheck className="h-4 w-4 text-[color:var(--wild-accent)]" />
                      <span>Этапы разработки платформы</span>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                      <ul className="space-y-2.5">
                        {steps.map((s) => (
                          <li
                            key={s.label}
                            className="flex items-center justify-between gap-4 text-sm"
                          >
                            <span className="text-white/85">{s.label}</span>
                            <span className="text-white/45 shrink-0">
                              в разработке
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <m.a
                      href="/landing"
                      whileTap={reduce ? undefined : { scale: 0.985 }}
                      whileHover={
                        allowHover ? { y: -1 } : undefined
                      }
                      className="
                        mt-6 inline-flex w-full items-center justify-center gap-2
                        rounded-xl px-6 py-4 text-base font-semibold
                        text-[#0b1020] relative overflow-hidden
                      "
                      style={{
                        background:
                          "linear-gradient(90deg,var(--wild-accent),var(--wild-accent-2))",
                        boxShadow: "0 0 22px rgba(59,130,246,.45)",
                      }}
                    >
                      <span className="relative">Перейти к платформе</span>
                      <ArrowRight className="relative h-5 w-5" />
                    </m.a>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60">
                      <Sparkles className="h-4 w-4 text-[color:var(--wild-accent)]" />
                      <span>Функциональность строится поэтапно.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ничего лишнего: no extra layers */}
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

/* ===== UI ===== */

function MiniStat({
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
      className="relative rounded-2xl p-4 sm:p-5 border border-white/10 bg-white/[0.04] overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(59,130,246,0.10)]" />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rotate-12 opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,.36), transparent 70%)",
        }}
      />

      <div className="relative flex items-start gap-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] shrink-0">
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
