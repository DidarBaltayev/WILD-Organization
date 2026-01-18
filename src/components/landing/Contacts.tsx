"use client";

import React, { memo } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { Mail, Send, Linkedin, Youtube, Twitch, ArrowUpRight } from "lucide-react";

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
} as const;

// ✅ Поменяй ссылки под себя
const CONTACTS = {
  email: "wildorganization@gmail.com", // позже заменишь на нужный
  telegram: "https://t.me/SeniorRemi",
  linkedin: "https://uk.linkedin.com/company/wild-organisation", // поставь точный линк
  youtube: "https://youtube.com/@wild_organization?si=FAaQE6WrpG9Rsly8",
  twitch: "https://www.twitch.tv/w_r3m1",
  kick: "https://kick.com/wild-organization",
  tiktok: "https://www.tiktok.com/@wild_organization",
  discord: "https://discord.gg/6us2SUFFZj", // ✅ Discord (вставь свой инвайт)
};

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

function KickIcon({ className }: { className?: string }) {
  // минимальный “Kick-like” знак (не бренд-лого 1в1, чтобы не заезжать в копипасту)
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 4h7c2.6 0 5 2.1 5 4.7 0 2.2-1.4 4.1-3.4 4.6L18 20h-4l-3-6H10v6H6V4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  // стилизованная нота (не официальный логотип)
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 4v9.2a4.2 4.2 0 1 1-2.4-3.8V7.2c1.2 1.8 3 3 5.4 3.1V8.1C15.6 7.9 14.6 6.3 14 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  // минимальный “discord-like” знак (не официальный логотип 1в1)
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.6 7.8c2.7-1.2 6.1-1.2 8.8 0l.7 1.4c-1-.4-2.1-.6-3.2-.7l-.2.4a8.8 8.8 0 0 1 3.9 1.7c-.6 3.1-2.8 4.9-5.2 4.9l-.5-.6h-1l-.5.6c-2.4 0-4.6-1.8-5.2-4.9a8.8 8.8 0 0 1 3.9-1.7l-.2-.4c-1.1.1-2.2.3-3.2.7l.7-1.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9.6" cy="12" r="1" fill="currentColor" />
      <circle cx="14.4" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[12px] font-extrabold tracking-[0.18em] uppercase text-white/60"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </div>
  );
}

function BigTitle() {
  const reduce = useReducedMotion() ?? false;

  const allowHover =
    !reduce &&
    typeof window !== "undefined" &&
    !window.matchMedia?.("(pointer: coarse)")?.matches;

  return (
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
  КОНТАКТЫ{" "}
  <span
    className="bg-clip-text text-transparent"
    style={{
      backgroundImage:
        "linear-gradient(90deg, #3b82f6 0%, #22d3ee 50%, #60a5fa 100%)",
      textShadow: "0 0 24px rgba(59,130,246,0.45)",
    }}
  >
    WILD
  </span>
  ?
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

     

      {/* ❌ УБРАНО: “Быстрые каналы → Primary • Business • Media” */}
      <m.div
        initial={false}
        whileHover={allowHover ? { y: -1 } : undefined}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="hidden"
      />
    </div>
  );
}

function LinkCard({
  title,
  subtitle,
  href,
  icon,
  variant,
}: {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  variant: "primary" | "ghost";
}) {
  const reduce = useReducedMotion() ?? false;

  const allowHover =
    !reduce &&
    typeof window !== "undefined" &&
    !window.matchMedia?.("(pointer: coarse)")?.matches;

  const isExternal = href.startsWith("http");
  const common =
    "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl";

  const primaryGlow =
    "radial-gradient(80% 70% at 18% 22%, rgba(59,130,246,.30), transparent 62%), radial-gradient(80% 70% at 85% 80%, rgba(6,182,212,.18), transparent 64%)";

  return (
    <m.a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      whileHover={allowHover ? { y: -2 } : undefined}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      className={cn(common, "p-4 sm:p-5 block")}
      style={{
        boxShadow:
          variant === "primary"
            ? "0 24px 90px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06)"
            : "0 18px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)",
      }}
    >
      <Glow
        className="opacity-90"
        style={{
          background:
            variant === "primary"
              ? primaryGlow
              : "radial-gradient(70% 60% at 15% 22%, rgba(255,255,255,.10), transparent 62%)",
        }}
      />
      <Glow className="shadow-[inset_0_0_0_1px_rgba(59,130,246,0.10)] rounded-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10",
              variant === "primary" ? "bg-white/[0.06]" : "bg-white/[0.04]"
            )}
          >
            <span className="text-[color:var(--wild-accent)]">{icon}</span>
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

        <div className="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-white/70">
          <span>Открыть</span>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </m.a>
  );
}

export default function Contacts() {
  const reduce = useReducedMotion() ?? false;

  return (
    <LazyMotion features={domAnimation}>
      <section id="contacts" className="wild-section">
        <div className="wild-container">
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={cn(
              "relative overflow-hidden rounded-[30px] border border-white/10",
              "bg-white/[0.02] backdrop-blur-xl",
              "shadow-[0_40px_140px_rgba(0,0,0,0.6)]"
            )}
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

            <div className="relative p-5 sm:p-6 lg:p-14">
              <BigTitle />

              {/* GRID */}
              {/* ✅ mobile: меньше gaps, без ломки дизайна */}
              <div className="mt-9 sm:mt-10 grid gap-4 sm:gap-6 lg:gap-8">
                {/* PRIMARY */}
                <div className="grid gap-3 sm:gap-4">
                  {/* ✅ Перевёл на русский как ты просил */}
                  <SectionTitle>Основное</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* ✅ Партнёрство -> только Email (Gmail) */}
                    <LinkCard
                      variant="primary"
                      title="Email"
                      subtitle="Партнёрства и ключевые вопросы"
                      href={`mailto:${CONTACTS.email}`}
                      icon={<Mail className="h-5 w-5" />}
                    />
                    <LinkCard
                      variant="primary"
                      title="Telegram"
                      subtitle="Быстрая связь и вопросы"
                      href={CONTACTS.telegram}
                      icon={<Send className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* BUSINESS + MEDIA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                  {/* ✅ LinkedIn: убрал “Business”, сделал по-русски и смысл другой */}
                  <div className="grid gap-3 sm:gap-4">
                    <SectionTitle>ОФИЦИАЛЬНОЕ ПРЕДСТАВИТЕЛЬСТВО</SectionTitle>
                    <LinkCard
                      variant="ghost"
                      title="LinkedIn"
                      subtitle="Публичное представительство организации"
                      href={CONTACTS.linkedin}
                      icon={<Linkedin className="h-5 w-5" />}
                    />
                  </div>

                  {/* MEDIA */}
                  <div className="lg:col-span-2 grid gap-3 sm:gap-4">
                    <SectionTitle>Медиа</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <LinkCard
                        variant="ghost"
                        title="YouTube"
                        subtitle="Видео, хайлайты, выпуски"
                        href={CONTACTS.youtube}
                        icon={<Youtube className="h-5 w-5" />}
                      />

                      {/* ✅ Twitch = индивидуальные */}
                      <LinkCard
                        variant="ghost"
                        title="Twitch"
                        subtitle="Индивидуальные эфиры"
                        href={CONTACTS.twitch}
                        icon={<Twitch className="h-5 w-5" />}
                      />

                      {/* ✅ Kick = эфиры и турниры */}
                      <LinkCard
                        variant="ghost"
                        title="Kick"
                        subtitle="Эфиры и турниры"
                        href={CONTACTS.kick}
                        icon={<KickIcon className="h-5 w-5" />}
                      />

                      <LinkCard
                        variant="ghost"
                        title="TikTok"
                        subtitle="Короткие форматы и клипы"
                        href={CONTACTS.tiktok}
                        icon={<TikTokIcon className="h-5 w-5" />}
                      />

                      {/* ✅ ДОБАВЛЕНО: Discord */}
                      <LinkCard
                        variant="ghost"
                        title="Discord"
                        subtitle="Коммуникация составов"
                        href={CONTACTS.discord}
                        icon={<DiscordIcon className="h-5 w-5" />}
                      />
                    </div>
                  </div>
                </div>

                {/* BOTTOM NOTE */}
                <div className="pt-2">
                  <div className="h-px w-full bg-gradient-to-r from-white/18 via-white/10 to-transparent" />
                  <div className="mt-4 text-center text-[12px] sm:text-[13px] text-white/55">
                    WILD • Контакты обновляются по мере запуска функций платформы.
                    {reduce ? null : " "}
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
