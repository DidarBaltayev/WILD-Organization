"use client";

import React, { useMemo } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { BarChart3, UserRound, CalendarClock, Users } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
} as const;

type NodeItem = {
  title: string;
  text: React.ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
};

export default function Platform() {
  const reduce = useReducedMotion() ?? false;

  const allowHover =
    !reduce &&
    typeof window !== "undefined" &&
    !window.matchMedia?.("(pointer: coarse)")?.matches;

  const NODES: NodeItem[] = useMemo(
    () => [
      {
        title: "Единая рейтинговая система",
        text: (
          <>
            Игроки будут подниматься или опускаться в рейтинге вместе со своим{" "}
            <span className="font-semibold text-white">составом</span>. Победы —
            рост вверх. Поражения — падение. Всё честно, прозрачно и командно.
          </>
        ),
        Icon: BarChart3,
      },
      {
        title: "Профили для всех участников",
        text: (
          <>
            Каждый игрок, капитан, тренер и администратор получит личный кабинет
            со статистикой, историей матчей, достижениями, прогрессом и
            возможностями.
          </>
        ),
        Icon: UserRound,
      },
      {
        title: "Сезоны рейтинга (2–3 месяца)",
        text: (
          <>
            Система будет работать сезонами. По окончанию каждого сезона топ
            составы рейтинговой системы автоматически проходят в турнир{" "}
            <span
              className="font-[var(--font-teko)] font-semibold uppercase tracking-[0.14em] bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(190,210,255,0.98), rgba(110,170,255,0.92), rgba(6,182,212,0.92))",
                textShadow: "0 18px 70px rgba(6,182,212,0.18)",
              }}
            >
              BlueZone
            </span>
            , который проводит сама платформа.
          </>
        ),
        Icon: CalendarClock,
      },
      {
        title: "Управление составами",
        text: (
          <>
            Капитаны смогут управлять своими составами: заявки игроков, матчи,
            расписания, внутренняя дисциплина.
          </>
        ),
        Icon: Users,
      },
    ],
    []
  );

  return (
    <LazyMotion features={domAnimation}>
      <section id="platform" className="relative py-16 lg:py-24">
        <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8">
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="
              relative overflow-hidden rounded-[28px]
              border border-white/10 bg-white/[0.03] backdrop-blur-xl
              shadow-[0_30px_110px_rgba(0,0,0,0.55)]
            "
          >
            {/* background */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(900px 520px at 14% 10%, rgba(59,130,246,.18), transparent 62%), radial-gradient(860px 560px at 90% 86%, rgba(6,182,212,.12), transparent 58%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.10)" }}
            />

            <div className="relative p-7 lg:p-12">
              {/* HEADER — CENTERED */}
              <div className="flex flex-col items-center text-center">
                <span
                  className="
                    font-[var(--font-teko)] font-semibold uppercase
                    tracking-[0.18em]
                    text-[30px] leading-none
                    lg:text-[44px]
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
                  ПЛАТФОРМА WILD
                </span>

                <span
                  aria-hidden
                  className="mt-4 h-px w-40"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(59,130,246,.65), rgba(6,182,212,.45), transparent)",
                    boxShadow: "0 0 18px rgba(59,130,246,.18)",
                  }}
                />
              </div>

              {/* TEXT */}
              <div className="mt-6 mx-auto max-w-[920px] space-y-3 text-center text-[15px] leading-relaxed text-white/80 lg:text-[18px] lg:leading-relaxed">
                <p>
                  Платформа WILD — это будущая цифровая система организации,
                  рейтинга и развития игроков WILD.
                </p>
                <p>
                  Сейчас она находится в стадии разработки и станет фундаментом
                  всей экосистемы.
                </p>
              </div>

              {/* NODES */}
              <div className="mt-12">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[12px] font-semibold tracking-[0.26em] uppercase text-white/60">
                    ЧТО БУДЕТ ВНУТРИ ПЛАТФОРМЫ
                  </span>
                  <span
                    aria-hidden
                    className="h-px flex-1"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,.14), rgba(255,255,255,.06), transparent)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {NODES.map((n) => (
                    <NodeCard key={n.title} {...n} allowHover={allowHover} />
                  ))}
                </div>
              </div>
            </div>

            {reduce ? null : (
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0" />
            )}
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

function NodeCard({
  title,
  text,
  Icon,
  allowHover,
}: {
  title: string;
  text: React.ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  allowHover: boolean;
}) {
  return (
    <m.div
      whileHover={allowHover ? { y: -2 } : undefined}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="
        relative overflow-hidden rounded-2xl
        border border-white/10 bg-white/[0.03]
        p-5
      "
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(59,130,246,0.08)]" />

      <div className="relative flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Icon className="h-4 w-4 text-[color:var(--wild-accent)]" />
        </div>

        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-white">{title}</div>
          <div className="mt-2 text-xs leading-relaxed text-white/60">
            {text}
          </div>
        </div>
      </div>
    </m.div>
  );
}
