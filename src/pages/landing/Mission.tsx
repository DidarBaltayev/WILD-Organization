"use client";

import React, { useMemo, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { Target, Users, ShieldCheck, Trophy, ArrowUpRight, Sparkles } from "lucide-react";

const fadeLeft = {
  hidden: { opacity: 0, x: -18 },
  show: { opacity: 1, x: 0 },
} as const;

const fadeRight = {
  hidden: { opacity: 0, x: 18 },
  show: { opacity: 1, x: 0 },
} as const;

type Pillar = {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export default function Mission() {
  const reduce = useReducedMotion() ?? false;

  const PILLARS: Pillar[] = useMemo(
    () => [
      { title: "Шанс", subtitle: "Войти в систему и стать частью состава", Icon: Target },
      { title: "Команда", subtitle: "Игрок не остаётся один — рост внутри ростера", Icon: Users },
      { title: "Поддержка", subtitle: "Капитаны, дисциплина, разборы, сопровождение", Icon: ShieldCheck },
      { title: "Сцена", subtitle: "Турниры, рейтинг, медийность — шаг за шагом", Icon: Trophy },
    ],
    []
  );

  return (
    // ✅ НИКАКИХ background-слоёв внутри секции
    <section id="mission" className="relative py-14 lg:py-20">
      <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[420px_1fr] lg:gap-10">
          {/* Left */}
          <GlowCard reduce={reduce} variant="left" className="lg:sticky lg:top-24">
            <motion.div
              variants={fadeLeft}
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
                  НАША МИССИЯ
                </span>

                <span className="relative inline-flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-60 bg-[color:var(--wild-accent)]" />
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full opacity-60 bg-[color:var(--wild-accent)]"
                    animate={reduce ? undefined : { scale: [1, 2.25], opacity: [0.6, 0] }}
                    transition={
                      reduce ? undefined : { duration: 1.35, repeat: Infinity, ease: "easeOut" }
                    }
                  />
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-extrabold leading-tight lg:text-4xl">
                Путь игрока
                <span className="block mt-3 text-xl font-semibold text-white/70 lg:text-2xl">
                  от любителя — до медийного профи
                </span>
              </h2>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span>Система роста</span>
                  <span className="inline-flex items-center gap-1 text-[color:var(--wild-accent)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    v1
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-xs">
                  <MiniStep reduce={reduce} label="Вход" desc="заявка → отбор" />
                  <MiniStep reduce={reduce} label="Ростер" desc="роль → дисциплина" />
                  <MiniStep reduce={reduce} label="Турниры" desc="праки → матчи" />
                  <MiniStep reduce={reduce} label="Медийность" desc="личный бренд" />
                </div>
              </div>

              <a
                href="#why-wild"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition"
              >
                Дальше: почему WILD
                <ArrowUpRight className="h-4 w-4 text-[color:var(--wild-accent)]" />
              </a>
            </motion.div>
          </GlowCard>

          {/* Right */}
          <GlowCard reduce={reduce} variant="right">
            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <div className="space-y-4 text-[15px] leading-relaxed text-neutral-300 lg:text-base">
                <p>
                  Наша миссия — дать каждому игроку реальный шанс стать частью состава WILD
                  и пройти путь от любителя до медийного профессионала.
                </p>
                <p>
                  WILD создаёт систему, в которой игрок не остаётся один. Здесь каждый развивается
                  вместе с составом, получает поддержку капитанов, играет в турнирах, растёт в рейтингах
                  и становится частью большой экосистемы.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {PILLARS.map((p) => (
                  <PillarCard key={p.title} {...p} reduce={reduce} />
                ))}
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
  className = "",
}: {
  children: React.ReactNode;
  reduce: boolean;
  variant: "left" | "right";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const glow = useMotionTemplate`radial-gradient(520px 320px at ${mx}px ${my}px, rgba(59,130,246,.22), transparent 55%)`;

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
        className,
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
      <span className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t" style={{ borderColor: c }} />
      <span className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t" style={{ borderColor: c }} />
      <span className="pointer-events-none absolute left-4 bottom-4 h-3 w-3 border-l border-b" style={{ borderColor: c }} />
      <span className="pointer-events-none absolute right-4 bottom-4 h-3 w-3 border-r border-b" style={{ borderColor: c }} />
    </>
  );
}

function MiniStep({ label, desc, reduce }: { label: string; desc: string; reduce: boolean }) {
  return (
    <motion.div
      whileHover={reduce ? undefined : { x: 2 }}
      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
    >
      <span className="text-white/85 font-semibold">{label}</span>
      <span className="text-white/55">{desc}</span>
    </motion.div>
  );
}

function PillarCard({
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
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
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
