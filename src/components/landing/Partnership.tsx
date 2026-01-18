"use client";

import React, { memo, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

type Card = {
  n: string;
  title: string;
  desc: string;
  bullets?: string[];
  tone?: "neutral" | "blue" | "red";
};

const TG_LINK = "https://t.me/SeniorRemi";

const Glow = memo(function Glow({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={style}
    />
  );
});

const GridNoise = memo(function GridNoise() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage:
            "radial-gradient(70% 55% at 50% 25%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(70% 55% at 50% 25%, black 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background:
            "radial-gradient(110% 80% at 50% 15%, rgba(255,255,255,0.16), transparent 65%)",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
});

const Chip = memo(function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "neutral" | "blue" | "red";
}) {
  const cls =
    tone === "red"
      ? "border-[rgba(255,70,70,0.22)] bg-[rgba(255,70,70,0.10)] text-[rgba(255,220,220,0.95)]"
      : tone === "blue"
        ? "border-[rgba(59,130,246,0.22)] bg-[rgba(59,130,246,0.10)] text-[rgba(210,235,255,0.95)]"
        : "border-white/12 bg-white/[0.06] text-white/85";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        "h-9 px-3.5 rounded-2xl border",
        "text-[12px] font-extrabold tracking-[0.16em] uppercase",
        "select-none",
        cls
      )}
    >
      {children}
    </span>
  );
});

const CardItem = memo(function CardItem({
  card,
  reduce,
}: {
  card: Card;
  reduce: boolean;
}) {
  const isBlue = card.tone === "blue";
  const isRed = card.tone === "red";

  const border =
    isRed
      ? "border-[rgba(255,70,70,0.16)]"
      : isBlue
        ? "border-[rgba(59,130,246,0.16)]"
        : "border-white/10";

  const bg =
    isRed
      ? "bg-[rgba(255,70,70,0.045)]"
      : isBlue
        ? "bg-[rgba(59,130,246,0.045)]"
        : "bg-white/[0.032]";

  const accent = isRed
    ? "rgba(255,70,70,.55)"
    : isBlue
      ? "rgba(59,130,246,.55)"
      : "rgba(255,255,255,.22)";

  const tone: "neutral" | "blue" | "red" = card.tone ?? "neutral";

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-16% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.32, ease: "easeOut" }}
      className={cn("relative")}
    >
      <div
        aria-hidden
        className={cn(
          "absolute -inset-1 rounded-[30px] opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100"
        )}
        style={{
          background: `radial-gradient(55% 60% at 30% 20%, ${accent}, transparent 62%)`,
          filter: "blur(22px)",
        }}
      />

      <div
        className={cn(
          "group relative overflow-hidden rounded-[28px] border backdrop-blur-xl",
          "p-5 sm:p-7",
          border,
          bg,
          "transition-transform duration-200 will-change-transform",
          reduce ? "" : "hover:-translate-y-[2px]"
        )}
      >
        <Glow className="rounded-[28px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

        <Glow
          className="rounded-[28px] opacity-85"
          style={{
            background: isRed
              ? "radial-gradient(70% 60% at 14% 18%, rgba(255,70,70,.24), transparent 62%)"
              : isBlue
                ? "radial-gradient(70% 60% at 14% 18%, rgba(59,130,246,.24), transparent 62%)"
                : "radial-gradient(70% 60% at 14% 18%, rgba(255,255,255,.10), transparent 62%)",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.0] group-hover:opacity-[0.12] transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 75%)",
            transform: "translateX(-24%)",
            maskImage:
              "radial-gradient(70% 55% at 30% 25%, black 0%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(70% 55% at 30% 25%, black 0%, transparent 78%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <Chip tone={tone}>
              <span className="tabular-nums">{card.n}</span>
            </Chip>

            <div className="relative h-0 w-0 rounded-2x1 border border-white/1 bg-white/[0.00] overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(80% 60% at 30% 25%, rgba(255,255,255,.18), transparent 65%)",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.10), transparent)",
                }}
              />
            </div>
          </div>

          <h4 className="mt-5 text-[18px] sm:text-[19px] font-extrabold text-white leading-snug">
            {card.title}
          </h4>

          <p className="mt-2.5 text-[13px] sm:text-[14px] leading-relaxed text-white/74">
            {card.desc}
          </p>

          {card.bullets?.length ? (
            <ul className="mt-5 space-y-2.5">
              {card.bullets.map((b, i) => (
                <li key={`${card.n}-${i}`} className="flex gap-2.5">
                  <span
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background:
                        card.tone === "red"
                          ? "rgba(255,90,90,0.55)"
                          : card.tone === "blue"
                            ? "rgba(90,150,255,0.55)"
                            : "rgba(255,255,255,0.30)",
                    }}
                  />
                  <span className="text-[13px] leading-relaxed text-white/74">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 h-px w-full bg-gradient-to-r from-white/14 via-white/8 to-transparent" />
        </div>
      </div>
    </motion.article>
  );
});

export default function Partnership() {
  const reduce = useReducedMotion() ?? false;

  const cards = useMemo<Card[]>(
    () => [
      {
        n: "01",
        title: "Действующая система людей.",
        desc: "WILD — это структура, где каждый участник не «смотрит», а действует внутри экосистемы: составы, роли, матчи и прогресс.",
        bullets: [
          "Вовлечённость создаётся участием, а не охватами.",
          "Сообщество растёт за счёт смысла внутри системы.",
        ],
        tone: "blue",
      },
      {
        n: "02",
        title: "Модель масштабируется без ломки основы.",
        desc: "WILD — это логика управления и удержания, которую можно переносить на новые дисциплины, регионы и форматы.",
        bullets: [
          "Меньше зависимости от одного тайтла.",
          "Долгий жизненный цикл и управляемая экспансия.",
        ],
        tone: "neutral",
      },
      {
        n: "03",
        title: "Качество подтверждено уровнем игроков.",
        desc: "Сильные игроки выбирают сильные системы. Когда внутри высокий уровень — это сигнал конкурентоспособности и доверия.",
        bullets: [
          "Бренд партнёра ассоциируется с уровнем.",
          "Эффективность интеграций выше на качественной аудитории.",
        ],
        tone: "red",
      },
      {
        n: "04",
        title: "Медиа — актив.",
        desc: "Контент строится как система: эфиры → клипы → короткие форматы. Это естественно монетизируется через интеграции и партнёрства.",
        bullets: [
          "Интеграции органично встраиваются в события и матчи.",
          "Контент масштабируется вместе с активностью.",
        ],
        tone: "blue",
      },
      {
        n: "05",
        title: "Платформа уже работает, не «в планах».",
        desc: "Сайт и платформа запущены и используются. Это живой продукт, который можно усиливать функциями и монетизацией.",
        bullets: [
          "Партнёр заходит в работающий механизм.",
          "Есть база для масштабирования и пакетов.",
        ],
        tone: "neutral",
      },
      {
        n: "06",
        title: "Удержание встроено в ДНК системы.",
        desc: "Прогресс, статус, конкуренция и понятные правила роста — удерживают людей внутри организации и создают накопительную ценность.",
        bullets: [
          "Ретеншн и лояльность растут со временем.",
          "Сообщество становится сильнее с каждым циклом.",
        ],
        tone: "red",
      },
    ],
    []
  );

  return (
    <section className="relative py-10 sm:py-14 lg:py-22">
      <div className="relative mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 2xl:max-w-[2200px]">
        <Glow
          className="absolute -top-16 left-0 h-[220px] w-[760px] blur-3xl opacity-45"
          style={{
            background:
              "radial-gradient(65% 65% at 28% 50%, rgba(59,130,246,.52), transparent 72%)",
          }}
        />
        <Glow
          className="absolute -top-12 right-0 h-[210px] w-[720px] blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(65% 65% at 65% 45%, rgba(255,70,70,.26), transparent 74%)",
          }}
        />
        <Glow
          className="absolute -bottom-12 left-1/2 h-[210px] w-[860px] -translate-x-1/2 blur-3xl opacity-25"
          style={{
            background:
              "radial-gradient(70% 65% at 50% 50%, rgba(255,255,255,.18), transparent 75%)",
          }}
        />

        <div
          className={cn(
            "relative overflow-hidden rounded-[34px] border border-white/10",
            "bg-white/[0.02] backdrop-blur-xl",
            "px-4 sm:px-7 lg:px-10 py-5 sm:py-8"
          )}
        >
          <GridNoise />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
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
                  ПАРТНЕРСТВО И СОТРУДНИЧЕСТВО
                </h2>

              <a
                href={TG_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center justify-center",
                  "w-full sm:w-auto",
                  "rounded-2xl border border-white/10",
                  "bg-white/[0.06] hover:bg-white/[0.10]",
                  "px-5 sm:px-6",
                  "py-3 sm:py-3.5",
                  "text-[12px] font-extrabold tracking-[0.18em] uppercase",
                  "text-white/92 transition"
                )}
              >
                Обсудить
              </a>
            </div>

            <div className="mt-4 sm:mt-6 h-px w-full bg-gradient-to-r from-white/18 via-white/10 to-transparent" />
          </div>
        </div>

        <div className="mt-6 sm:mt-10 grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <CardItem key={c.n} card={c} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  );
}
