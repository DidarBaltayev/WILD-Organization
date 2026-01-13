"use client";

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Crown, TrendingUp, ChevronDown } from "lucide-react";

type Player = {
  name: string;
  role?: string; // rifler / awper etc (мок)
  elo?: number;
  flag?: string; // "🇹🇷"
};

type RosterRow = {
  roster: string; // W1 / W2 ...
  points: number;
  matches: number;
  winrate: number;
  trophies: number;
  trend: number;
  status: "core" | "rising" | "open";
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatTrend(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}%`;
}

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

/** Лого без белой подложки. Цвет (red/blue) — разные файлы. */
function WildLogo({
  variant,
  size = 42,
  icon = 30,
}: {
  variant: "blue" | "red";
  size?: number;
  icon?: number;
}) {
  const src = variant === "red" ? "/logoW_red.png" : "/logoW_blue.svg";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0",
        "rounded-xl border border-white/10",
        "bg-transparent overflow-hidden"
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt="WILD"
        width={icon}
        height={icon}
        className="object-contain"
        style={{ width: icon, height: icon }}
        priority={false}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-60"
        style={{
          boxShadow:
            variant === "red"
              ? "inset 0 0 0 1px rgba(255,70,70,0.18)"
              : "inset 0 0 0 1px rgba(59,130,246,0.14)",
        }}
      />
    </div>
  );
}

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const onFirstTouch = () => setIsTouch(true);
    window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });
    return () => window.removeEventListener("touchstart", onFirstTouch);
  }, []);
  return isTouch;
}

function RosterPopover({
  open,
  anchorEl,
  roster,
  players,
  accent,
  onClose,
}: {
  open: boolean;
  anchorEl: HTMLDivElement | null;
  roster: string;
  players: Player[];
  accent: "red" | "blue";
  onClose: () => void;
}) {
  const popRef = useRef<HTMLDivElement | null>(null);

  // клик снаружи — закрыть
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (anchorEl?.contains(t)) return;
      onClose();
    };

    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("touchstart", onDown, { passive: true });

    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, [open, onClose, anchorEl]);

  const anchor = anchorEl?.getBoundingClientRect();

  const top = anchor ? anchor.bottom + 10 + window.scrollY : 0;

  // чтобы не улетало за правый край
  const maxLeft = Math.max(12, window.innerWidth - 360 - 12);
  const left = anchor ? Math.min(anchor.left + window.scrollX, maxLeft) : 12;

  return (
    <motion.div
      ref={popRef}
      initial={false}
      animate={
        open
          ? { opacity: 1, y: 0, pointerEvents: "auto" }
          : { opacity: 0, y: 8, pointerEvents: "none" }
      }
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed z-[70]"
      style={{ top, left }}
    >
      <div
        className={cn(
          "w-[340px] max-w-[calc(100vw-24px)]",
          "rounded-2xl border border-white/10",
          "bg-black/60 backdrop-blur-xl",
          "shadow-[0_30px_80px_rgba(0,0,0,.55)]",
          "overflow-hidden"
        )}
      >
        <div
          className="px-4 py-3 border-b border-white/10"
          style={{
            background:
              accent === "red"
                ? "linear-gradient(90deg, rgba(255,70,70,.18), rgba(255,70,70,0))"
                : "linear-gradient(90deg, rgba(59,130,246,.18), rgba(59,130,246,0))",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-white">{roster}</div>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-white/55 hover:text-white transition"
              aria-label="Close"
            >
              Close
            </button>
          </div>
          <div className="text-[11px] text-white/55 mt-0.5">Players (5–7)</div>
        </div>

        <div className="px-4 py-3">
          <div className="space-y-2">
            {players.slice(0, 7).map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-extrabold text-white/45 w-6">#{i + 1}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {p.flag ? <span className="mr-2">{p.flag}</span> : null}
                      {p.name}
                    </div>
                    {p.role ? <div className="text-[11px] text-white/55">{p.role}</div> : null}
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  {typeof p.elo === "number" ? (
                    <div className="text-sm font-extrabold text-white">{p.elo}</div>
                  ) : (
                    <div className="text-sm font-extrabold text-white/60">—</div>
                  )}
                  <div className="text-[11px] text-white/45">ELO</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-[11px] text-white/45">
            Наведи/кликни по составу в таблице — карточка открывается.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function RankShowcase() {
  const reduce = useReducedMotion() ?? false;
  const isTouch = useIsTouchDevice();

  const [season, setSeason] = useState<"S1" | "S2" | "S3">("S1");

  // открытый поповер
  const [activeRoster, setActiveRoster] = useState<string | null>(null);
  const [activeAnchorEl, setActiveAnchorEl] = useState<HTMLDivElement | null>(null);

  const playersByRoster = useMemo<Record<string, Player[]>>(
    () => ({
      W1: [
        { name: "Rex", role: "AWP", elo: 3450, flag: "🇹🇷" },
        { name: "Khan", role: "Entry", elo: 3320, flag: "🇰🇿" },
        { name: "Viper", role: "Rifler", elo: 3250, flag: "🇷🇺" },
        { name: "Sonic", role: "IGL", elo: 3180, flag: "🇺🇦" },
        { name: "Nova", role: "Support", elo: 3100, flag: "🇹🇲" },
      ],
      W2: [
        { name: "Blade", role: "IGL", elo: 3120, flag: "🇹🇷" },
        { name: "Ash", role: "Rifler", elo: 3050, flag: "🇰🇿" },
        { name: "Orbit", role: "AWP", elo: 2980, flag: "🇷🇺" },
        { name: "Ghost", role: "Entry", elo: 2920, flag: "🇺🇿" },
        { name: "Pulse", role: "Support", elo: 2890, flag: "🇺🇦" },
        { name: "Mako", role: "Rifler", elo: 2840, flag: "🇹🇲" },
      ],
      W3: [
        { name: "Lynx", role: "Entry", elo: 3010, flag: "🇹🇷" },
        { name: "Frost", role: "AWP", elo: 2960, flag: "🇷🇺" },
        { name: "Raven", role: "Rifler", elo: 2910, flag: "🇰🇿" },
        { name: "Bishop", role: "IGL", elo: 2870, flag: "🇺🇦" },
        { name: "Iris", role: "Support", elo: 2810, flag: "🇹🇲" },
      ],
      W4: [
        { name: "Kite", role: "Rifler", elo: 2750 },
        { name: "Zero", role: "Entry", elo: 2690 },
        { name: "Aero", role: "AWP", elo: 2620 },
        { name: "Mint", role: "Support", elo: 2580 },
        { name: "Omen", role: "IGL", elo: 2540 },
      ],
      W5: [
        { name: "Hex", role: "IGL", elo: 2480 },
        { name: "Nix", role: "Entry", elo: 2430 },
        { name: "Sage", role: "Support", elo: 2390 },
        { name: "Rook", role: "Rifler", elo: 2360 },
        { name: "Wave", role: "AWP", elo: 2310 },
      ],
      W6: [
        { name: "Volt", role: "Rifler", elo: 2280 },
        { name: "Gale", role: "Support", elo: 2240 },
        { name: "Claw", role: "Entry", elo: 2210 },
        { name: "Mono", role: "IGL", elo: 2180 },
        { name: "Zed", role: "AWP", elo: 2150 },
      ],
      W7: [
        { name: "Kuro", role: "Entry", elo: 2100 },
        { name: "Echo", role: "Rifler", elo: 2070 },
        { name: "Lux", role: "Support", elo: 2040 },
        { name: "Grim", role: "IGL", elo: 2010 },
        { name: "Snipe", role: "AWP", elo: 1980 },
      ],
      W8: [
        { name: "Fox", role: "Rifler", elo: 1940 },
        { name: "Rin", role: "Support", elo: 1910 },
        { name: "Kai", role: "Entry", elo: 1890 },
        { name: "Moss", role: "IGL", elo: 1860 },
        { name: "Ivy", role: "AWP", elo: 1830 },
      ],
      W9: [
        { name: "Tao", role: "IGL", elo: 1800 },
        { name: "Neo", role: "Rifler", elo: 1770 },
        { name: "Rio", role: "Support", elo: 1740 },
        { name: "Jett", role: "Entry", elo: 1710 },
        { name: "Keen", role: "AWP", elo: 1680 },
      ],
      W10: [
        { name: "Sol", role: "Support", elo: 1650 },
        { name: "Rune", role: "Entry", elo: 1620 },
        { name: "Spar", role: "Rifler", elo: 1590 },
        { name: "Nash", role: "IGL", elo: 1560 },
        { name: "Quill", role: "AWP", elo: 1530 },
      ],
    }),
    []
  );

  const rows = useMemo<RosterRow[]>(() => {
    const base: RosterRow[] = Array.from({ length: 10 }, (_, i) => {
      const idx = i + 1;
      const basePoints = [256, 192, 160, 128, 96, 64, 48, 32, 16, 8][i] ?? 0;

      const mult = season === "S1" ? 1 : season === "S2" ? 1.12 : 1.22;
      const points = Math.round(basePoints * mult - i * 2);

      const matches = clamp(28 - i * 2 + (season === "S3" ? 4 : 0), 6, 40);
      const winrate = clamp(72 - i * 3 + (season === "S2" ? 2 : 0), 35, 90);
      const trophies = clamp(5 - Math.floor(i / 2), 0, 5);
      const trend = clamp((i % 2 === 0 ? 1 : -1) * (8 - i), -12, 12);

      const status: RosterRow["status"] = i === 0 ? "core" : i <= 3 ? "rising" : "open";

      return {
        roster: `W${idx}`,
        points,
        matches,
        winrate,
        trophies,
        trend,
        status,
      };
    });

    return base.sort((a, b) => b.points - a.points);
  }, [season]);

  const maxPoints = Math.max(...rows.map((r) => r.points), 1);
  const podium = rows.slice(0, 3);

  const closePopover = useCallback(() => {
    setActiveRoster(null);
    setActiveAnchorEl(null);
  }, []);

  return (
    <section id="rank" className="relative overflow-hidden py-14 lg:py-20">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-28 left-1/2 h-[520px] w-[980px] -translate-x-1/2 blur-3xl opacity-55"
          style={{
            background: "radial-gradient(60% 60% at 50% 50%, rgba(59,130,246,.52), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-44 left-1/3 h-[520px] w-[980px] -translate-x-1/2 blur-3xl opacity-35"
          style={{
            background: "radial-gradient(60% 60% at 50% 50%, rgba(34,211,238,.26), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(90% 75% at 50% 30%, rgba(0,0,0,0), rgba(0,0,0,.62) 70%, rgba(0,0,0,.90) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 left-0 h-[140px] w-[520px] blur-3xl opacity-70"
              style={{
                background: "radial-gradient(65% 65% at 30% 50%, rgba(59,130,246,.62), transparent 70%)",
              }}
            />
            <div className="relative inline-flex items-center gap-3">
              <div className="text-[13px] font-extrabold tracking-[0.22em] text-white/70">
                WILD ROSTERS
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--wild-accent)] shadow-[0_0_18px_rgba(59,130,246,.7)]" />
              <div className="text-[11px] font-semibold text-white/45">Live ranking</div>
            </div>
            <h3 className="relative mt-2 text-3xl font-extrabold lg:text-4xl">
              Roster Leaderboard
            </h3>
          </div>

          {/* Season */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-[11px] font-semibold text-white/55">Season</div>
              <div className="relative mt-1">
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as any)}
                  className="appearance-none bg-transparent pr-10 text-sm font-semibold text-white outline-none"
                >
                  <option value="S1">Season 1</option>
                  <option value="S2">Season 2</option>
                  <option value="S3">Season 3</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
              </div>
            </div>
          </div>
        </div>

        {/* TOP 3 */}
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {podium.map((p, i) => (
            <motion.div
              key={p.roster}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6"
              style={{
                boxShadow: i === 0 ? "0 28px 90px rgba(0,0,0,.52)" : "0 18px 62px rgba(0,0,0,.34)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[520px] -translate-x-1/2 blur-3xl opacity-60"
                style={{
                  background: "radial-gradient(60% 60% at 50% 50%, rgba(255,70,70,.22), transparent 70%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,70,70,0.12)]" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <WildLogo variant="red" size={48} icon={36} />
                  <div>
                    <div className="text-xl font-extrabold">{p.roster}</div>
                    <div className="mt-1 text-xs text-white/55">
                      {p.matches} матчей · {p.winrate}% WR · {p.trophies} троф.
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {i === 0 ? <Crown className="h-4 w-4 text-[color:var(--wild-accent)]" /> : null}
                    <div className="text-2xl font-extrabold text-[color:var(--wild-accent)]">{p.points}</div>
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-xs">
                    <TrendingUp
                      className="h-4 w-4"
                      style={{
                        color: p.trend >= 0 ? "var(--wild-accent)" : "rgba(255,255,255,.45)",
                        transform: p.trend >= 0 ? "none" : "rotate(180deg)",
                      }}
                    />
                    <span className={p.trend >= 0 ? "text-white/80" : "text-white/45"}>
                      {formatTrend(p.trend)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative mt-5">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg,var(--wild-accent),var(--wild-accent-2))",
                      boxShadow: "0 0 14px rgba(59,130,246,.24)",
                    }}
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${(p.points / maxPoints) * 100}%` }}
                    viewport={{ once: true }}
                    transition={reduce ? { duration: 0 } : { duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TABLE */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl relative">
          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(59,130,246,0.12)]" />

          <div className="grid grid-cols-[220px_1fr_120px] gap-3 border-b border-white/10 px-5 py-4 text-[12px] font-semibold text-white/60">
            <div>Roster</div>
            <div>Stats</div>
            <div className="text-right">Points</div>
          </div>

          <div>
            {rows.map((r, idx) => {
              const isTop3 = idx < 3;

              const openForRow = activeRoster === r.roster;

              const onOpen = (el: HTMLDivElement) => {
                setActiveRoster(r.roster);
                setActiveAnchorEl(el);
              };

              return (
                <motion.div
                  key={r.roster}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: Math.min(idx * 0.02, 0.25) }}
                  className={cn(
                    "grid grid-cols-[220px_1fr_120px] gap-3 px-5 py-4 border-b border-white/10 last:border-b-0 transition",
                    isTop3 ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                  )}
                >
                  {/* LEFT */}
                  <div
                    className={cn("flex items-center gap-3 rounded-xl", "cursor-pointer select-none")}
                    onMouseEnter={!isTouch ? (e) => onOpen(e.currentTarget) : undefined}
                    onMouseLeave={!isTouch ? closePopover : undefined}
                    onClick={(e) => {
                      if (openForRow) closePopover();
                      else onOpen(e.currentTarget);
                    }}
                    role="button"
                    aria-label={`Open roster ${r.roster}`}
                    title="Show players"
                  >
                    <WildLogo variant={isTop3 ? "red" : "blue"} size={44} icon={32} />
                    <div className="text-sm font-extrabold text-white">{r.roster}</div>
                    <div className="ml-auto text-[11px] font-semibold text-white/45">
                      {isTouch ? "tap" : "hover"}
                    </div>
                  </div>

                  {/* MID */}
                  <div className="flex flex-col justify-center gap-2">
                    <div className="flex items-center justify-between text-[11px] text-white/60">
                      <span>
                        {r.matches} матчей · {r.winrate}% WR · {r.trophies} троф.
                      </span>
                      <span className={r.trend >= 0 ? "text-white/80" : "text-white/45"}>
                        {formatTrend(r.trend)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(r.points / maxPoints) * 100}%`,
                          background: "linear-gradient(90deg,var(--wild-accent),var(--wild-accent-2))",
                          boxShadow: isTop3 ? "0 0 14px rgba(59,130,246,.25)" : "0 0 10px rgba(59,130,246,.16)",
                        }}
                      />
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-lg font-extrabold",
                        isTop3 ? "text-[color:var(--wild-accent)]" : "text-white"
                      )}
                    >
                      {r.points}
                    </div>
                  </div>

                  {/* POPOVER */}
                  <RosterPopover
                    open={openForRow}
                    anchorEl={openForRow ? activeAnchorEl : null}
                    roster={r.roster}
                    players={playersByRoster[r.roster] ?? []}
                    accent={isTop3 ? "red" : "blue"}
                    onClose={closePopover}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
