"use client";

import React, { useMemo } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { BarChart3, UserRound, CalendarClock, Users } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
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
            Игроки поднимаются или опускаются в рейтинге вместе со своим{" "}
            <span className="font-semibold text-white">составом</span>. Победы —
            рост. Поражения — падение. Всё прозрачно и командно.
          </>
        ),
        Icon: BarChart3,
      },
      {
        title: "Профили участников",
        text: (
          <>
            Каждый игрок, капитан, тренер и администратор получит профиль со
            статистикой, историей матчей и прогрессом.
          </>
        ),
        Icon: UserRound,
      },
      {
        title: "Сезоны (2–3 месяца)",
        text: (
          <>
            По итогам сезона топ составы автоматически проходят в турнир{" "}
            <span
              className="font-[var(--font-display)] font-semibold uppercase tracking-[0.14em] bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(190,210,255,0.98), rgba(110,170,255,0.92), rgba(6,182,212,0.92))",
                textShadow: "0 18px 70px rgba(6,182,212,0.18)",
              }}
            >
              BlueZone
            </span>
            .
          </>
        ),
        Icon: CalendarClock,
      },
      {
        title: "Управление составами",
        text: (
          <>
            Капитаны управляют заявками, матчами, расписаниями и дисциплиной
            внутри состава.
          </>
        ),
        Icon: Users,
      },
    ],
    []
  );

  return (
    <LazyMotion features={domAnimation}>
      <section id="platform" className="wild-section">
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
                  "radial-gradient(1200px 680px at 18% 0%, rgba(59,130,246,.22), transparent 62%), radial-gradient(1100px 720px at 92% 90%, rgba(6,182,212,.14), transparent 60%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.12)" }}
            />

            {/* padding */}
            <div className="relative p-5 sm:p-6 lg:p-14">
              {/* HEADER CENTER */}
              <div className="flex flex-col items-center text-center">
    <h2
                  style={{
                    fontFamily:
                      'var(--font-dewi), "RFDewiExpanded", var(--font-teko), var(--font-inter)',
                    color: "#ffffff",
                    letterSpacing: "0.08em",
                    textShadow: "0 8px 40px rgba(0,0,0,0.6)",
                  }}
                  className="
                    font-semibold uppercase
                    text-[38px] leading-[0.95]
                    sm:text-[52px]
                    lg:text-[76px]
                    xl:text-[86px]
                  "
                >
                  ПЛАТФОРМА
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
              <div className="mt-7 mx-auto max-w-[1200px] space-y-4 sm:space-y-5 text-center text-[16px] leading-relaxed text-white/85 sm:text-[19px] lg:text-[22px]">
                <p>
                  Платформа WILD — цифровая основа всей организации, объединяющая
                  игроков, составы и рейтинги.
                </p>
                <p>
                  Она формирует правила роста, отбора и продвижения внутри
                  экосистемы.
                </p>
              </div>

              {/* NODES */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {NODES.map((n) => (
                  <NodeCard key={n.title} {...n} allowHover={allowHover} />
                ))}
              </div>
            </div>
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
        border border-white/10 bg-white/[0.04]
        p-4 sm:p-6
      "
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(59,130,246,0.10)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rotate-12 opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(59,130,246,.34), transparent 70%)",
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
          <div className="mt-2 text-[13px] sm:text-sm leading-relaxed text-white/70">
            {text}
          </div>
        </div>
      </div>
    </m.div>
  );
}
