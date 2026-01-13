"use client";

import React, { useMemo, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
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
    subtitle: "Матчи → очки → ранг → сезон",
    Icon: Crown,
  },
  {
    title: "Контроль",
    subtitle: "История, фиксация, прозрачность данных",
    Icon: Radar,
  },
];

export default function WhatIsWild() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section className="relative py-14 lg:py-20">
      <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_420px] lg:gap-10">
          {/* ЛЕВАЯ: “ЧТО ТАКОЕ WILD?” */}
          <GlowCard reduce={reduce} variant="left">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.22em]
                  border border-white/10 bg-white/[0.03] text-[color:var(--wild-accent)]"
                >
                  ЧТО ТАКОЕ WILD?
                </span>

                <span className="relative inline-flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-60 bg-[color:var(--wild-accent)]" />
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full opacity-60 bg-[color:var(--wild-accent)]"
                    animate={
                      reduce ? undefined : { scale: [1, 2.25], opacity: [0.6, 0] }
                    }
                    transition={
                      reduce
                        ? undefined
                        : { duration: 1.35, repeat: Infinity, ease: "easeOut" }
                    }
                  />
                </span>
              </div>

              {/* ✅ БОЛЬШОЙ “ударный” заголовок */}
              <div className="relative mt-6">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-10 left-0 h-[180px] w-[520px] blur-3xl opacity-70"
                  style={{
                    background:
                      "radial-gradient(60% 60% at 20% 50%, rgba(59,130,246,.55), transparent 70%)",
                  }}
                />

                <h2 className="relative text-[38px] font-extrabold leading-[1.05] tracking-tight lg:text-[52px]">
                  WILD —
                  <span className="block mt-3 text-[22px] font-semibold text-white/85 lg:text-[28px]">
                    киберспортивная организация на системе множества составов
                  </span>
                  <span className="block mt-3 text-[16px] font-semibold text-white/70 lg:text-[18px]">
                    с собственной рейтинговой системой и платформой
                  </span>
                </h2>
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-neutral-300 lg:text-base">
                Проект находится на этапе официальной регистрации под компанию{" "}
                <span className="font-semibold text-white">
                  Rexior Limited Liability Company (США)
                </span>
                .
              </p>

              {/* stats */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {STATS.map((s) => (
                  <MiniStat key={s.title} {...s} reduce={reduce} />
                ))}
              </div>

              {/* маленькая “формула” */}
              <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-white/70">
                  <span className="text-white/55">Формула:</span>
                  <span className="text-white">матчи</span>
                  <span className="text-white/30">→</span>
                  <span className="text-white">очки</span>
                  <span className="text-white/30">→</span>
                  <span className="text-white">ранг</span>
                  <span className="text-white/30">→</span>
                  <span className="text-white">сезон</span>
                </div>
              </div>
            </motion.div>
          </GlowCard>

          {/* ПРАВАЯ: “СТАТУС ПРОЕКТА + ROADMAP” */}
          <GlowCard reduce={reduce} variant="right">
            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              className="relative"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-white">Статус проекта</h3>

                <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold border border-white/10 bg-white/[0.03] text-white/70">
                  сборка платформы
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
                  <span>Следующие этапы разработки платформы</span>
                </div>

                <Roadmap reduce={reduce} />
              </div>

              <motion.a
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
                <Shine reduce={reduce} />
                <span className="relative">Перейти к платформе</span>
                <ArrowRight className="relative h-4 w-4" />
              </motion.a>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-white/55">
                <Sparkles className="h-3.5 w-3.5 text-[color:var(--wild-accent)]" />
                <span>Всё строится под реальные данные и масштабирование.</span>
              </div>
            </motion.div>
          </GlowCard>
        </div>
      </div>
    </section>
  );
}

function GlowCard({
  children,
  reduce,
  variant,
}: {
  children: React.ReactNode;
  reduce: boolean;
  variant: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const glow =
    useMotionTemplate`radial-gradient(520px 320px at ${mx}px ${my}px, rgba(59,130,246,.22), transparent 55%)`;

  const base =
    variant === "left"
      ? "shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
      : "shadow-[0_18px_52px_rgba(0,0,0,0.28)]";

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      whileHover={reduce ? undefined : { y: -4 }}
      className={[
        "relative rounded-2xl p-6 lg:p-10",
        "border border-white/10 bg-white/[0.04] backdrop-blur-xl",
        base,
      ].join(" ")}
    >
      <CornerHUD />

      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(59,130,246,0.16)]" />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-80"
        style={{ background: glow }}
      />

      {children}
    </motion.div>
  );
}

function CornerHUD() {
  const c = "rgba(59,130,246,0.55)";
  return (
    <>
      <span
        className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t"
        style={{ borderColor: c }}
      />
      <span
        className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t"
        style={{ borderColor: c }}
      />
      <span
        className="pointer-events-none absolute left-4 bottom-4 h-3 w-3 border-l border-b"
        style={{ borderColor: c }}
      />
      <span
        className="pointer-events-none absolute right-4 bottom-4 h-3 w-3 border-r border-b"
        style={{ borderColor: c }}
      />
    </>
  );
}

function Shine({ reduce }: { reduce: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="absolute inset-0 opacity-40"
      style={{
        background:
          "linear-gradient(120deg, transparent, rgba(255,255,255,.65), transparent)",
      }}
      animate={reduce ? undefined : { x: ["-120%", "120%"] }}
      transition={
        reduce ? undefined : { duration: 2.2, repeat: Infinity, ease: "linear" }
      }
    />
  );
}

function MiniStat({
  title,
  subtitle,
  Icon,
  reduce,
}: {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
  reduce: boolean;
}) {
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -3 }}
      className="relative rounded-xl p-4 border border-white/10 bg-white/[0.03]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-60 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.10)]" />

      <div className="relative flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
          <Icon className="h-4 w-4 text-[color:var(--wild-accent)]" />
        </div>

        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-white/60">{subtitle}</div>
        </div>
      </div>
    </motion.div>
  );
}

function Roadmap({ reduce }: { reduce: boolean }) {
  const steps = useMemo(
    () => [
      { label: "Авторизация игроков через Steam", done: true },
      { label: "Профиль и страница игрока", done: false },
      { label: "Поисковая система игроков и составов", done: false },
      { label: "Подписка и дополнительные возможности", done: false },
      { label: "Рейтинговая система: разработка и оптимизация", done: false },
    ],
    []
  );

  const doneCount = steps.filter((s) => s.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between text-[11px] text-white/60">
        <span>План разработки</span>
        <span>
          {doneCount}/{steps.length}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg,var(--wild-accent),var(--wild-accent-2))",
          }}
          initial={{ width: "0%" }}
          whileInView={{ width: `${progress}%` }}
          viewport={{ once: true }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, ease: "easeOut" }}
        />
      </div>

      <ul className="mt-3 space-y-2">
        {steps.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="text-white/80">{s.label}</span>
            <span
              className={
                s.done
                  ? "text-[color:var(--wild-accent)] font-semibold"
                  : "text-white/35"
              }
            >
              {s.done ? "готово" : "в работе"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
