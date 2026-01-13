"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Player = {
  name: string;
  role?: string;
  elo?: number;
  flag?: string;
};

type RosterStats = {
  roster: string; // W1..W10
  points: number;
  matches: number;
  wins: number;
  losses: number;
  winrate: number; // %
  last5: Array<"W" | "L">;
  avgElo: number;
  mvp: string;
};

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/** ✅ ОДИН общий grid-template для header и row (строгое выравнивание) */
const GRID =
  "grid-cols-[280px_84px_96px_84px_176px_110px_160px]"; // Roster / M / W-L / WR / Last5 / AvgELO / Points

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
        "bg-white/[0.03] overflow-hidden"
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

function PointsChip({ points, hot }: { points: number; hot: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-2xl border px-3 py-2",
        "w-[132px] select-none",
        hot
          ? "border-[rgba(255,70,70,0.35)] bg-[rgba(255,70,70,0.14)]"
          : "border-[rgba(59,130,246,0.22)] bg-[rgba(59,130,246,0.10)]"
      )}
    >
      <div className="text-center">
        <div
          className={cn(
            "text-lg font-extrabold leading-none tabular-nums",
            hot
              ? "text-[rgba(255,160,160,0.95)]"
              : "text-[rgba(160,210,255,0.95)]"
          )}
        >
          {points}
        </div>
        <div className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-white/45">
          POINTS
        </div>
      </div>
    </div>
  );
}

function Last5({ arr }: { arr: Array<"W" | "L"> }) {
  return (
    <div className="flex items-center justify-center gap-1 w-full">
      {arr.slice(0, 5).map((v, i) => {
        const win = v === "W";
        return (
          <span
            key={`${v}-${i}`}
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center",
              "rounded-md border",
              "text-[11px] font-extrabold leading-none tabular-nums",
              win
                ? "border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.16)] text-[rgba(220,255,235,0.98)]"
                : "border-[rgba(239,68,68,0.40)] bg-[rgba(239,68,68,0.18)] text-[rgba(255,225,225,0.98)]"
            )}
          >
            {v}
          </span>
        );
      })}
    </div>
  );
}

function PlayersPanel({
  roster,
  players,
  reduce,
  accent,
}: {
  roster: string;
  players: Player[];
  reduce: boolean;
  accent: "red" | "blue";
}) {
  return (
    <motion.div
      initial={reduce ? false : { height: 0, opacity: 0 }}
      animate={reduce ? undefined : { height: "auto", opacity: 1 }}
      exit={reduce ? undefined : { height: 0, opacity: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div
        className={cn(
          "mx-5 mb-4 rounded-2xl border border-white/10",
          "bg-black/35 backdrop-blur-xl overflow-hidden"
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
            <div className="text-sm font-extrabold text-white">
              {roster} · Игроки
            </div>
            <div className="text-[11px] text-white/55">5–7</div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {players.slice(0, 7).map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">
                    {p.flag ? <span className="mr-2">{p.flag}</span> : null}
                    {p.name}
                  </div>
                  {p.role ? (
                    <div className="text-[11px] text-white/55">{p.role}</div>
                  ) : null}
                </div>

                <div className="text-right pl-3 shrink-0">
                  <div className="text-sm font-extrabold text-white tabular-nums">
                    {typeof p.elo === "number" ? p.elo : "—"}
                  </div>
                  <div className="text-[11px] text-white/45">ELO</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function RankShowcase() {
  const reduce = useReducedMotion() ?? false;
  const [activeRoster, setActiveRoster] = useState<string | null>(null);

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

  const rows = useMemo<RosterStats[]>(() => {
    const last5Pool: Array<Array<"W" | "L">> = [
      ["W", "W", "W", "W", "W"],
      ["W", "W", "W", "W", "L"],
      ["W", "W", "W", "L", "W"],
      ["W", "W", "L", "W", "W"],
      ["W", "W", "L", "L", "W"],
      ["W", "L", "W", "W", "L"],
      ["W", "L", "W", "L", "W"],
      ["L", "W", "W", "L", "L"],
      ["L", "W", "L", "W", "L"],
      ["L", "L", "W", "L", "L"],
    ];

    const basePoints = [256, 210, 180, 150, 124, 100, 76, 52, 28, 4];

    const mk = (roster: string, idx: number): RosterStats => {
      const players = playersByRoster[roster] ?? [];

      const elos = players
        .map((p) => (typeof p.elo === "number" ? p.elo : 0))
        .filter((v) => v > 0);

      const avgElo = elos.length
        ? Math.round(elos.reduce((a, b) => a + b, 0) / elos.length)
        : 0;

      const best = players.reduce<{ name: string; elo: number }>(
        (acc, p) => {
          const e = typeof p.elo === "number" ? p.elo : -1;
          return e > acc.elo ? { name: p.name, elo: e } : acc;
        },
        { name: "—", elo: -1 }
      );

      const matches = clamp(34 - idx * 2, 18, 38);
      const wrBase = clamp(79 - idx * 3, 35, 88);
      const wins = Math.round((matches * wrBase) / 100);
      const losses = Math.max(0, matches - wins);
      const winrate = matches ? Math.round((wins / matches) * 100) : 0;

      return {
        roster,
        points: basePoints[idx] ?? 0,
        matches,
        wins,
        losses,
        winrate,
        last5: last5Pool[idx] ?? ["W", "L", "W", "L", "W"],
        avgElo,
        mvp: best.name,
      };
    };

    return Array.from({ length: 10 }, (_, i) => mk(`W${i + 1}`, i)).sort(
      (a, b) => b.points - a.points
    );
  }, [playersByRoster]);

  return (
    // ✅ УБРАЛ overflow-hidden, чтобы ничего не рубилось
    <section className="relative py-14 lg:py-20">
      <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8">
        {/* title */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 left-0 h-[140px] w-[560px] blur-3xl opacity-70"
            style={{
              background:
                "radial-gradient(65% 65% at 30% 50%, rgba(59,130,246,.62), transparent 70%)",
            }}
          />
          <h3 className="relative text-4xl font-extrabold tracking-tight lg:text-5xl">
            ТОП-10 СОСТАВОВ
          </h3>
          <div className="mt-2 h-px w-full bg-gradient-to-r from-white/15 via-white/10 to-transparent" />
        </div>

        {/* table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl relative">
          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(59,130,246,0.12)]" />

          {/* HEAD */}
          <div
            className={cn(
              "px-5 py-4 border-b border-white/10",
              "grid items-center gap-3",
              GRID
            )}
          >
            <div className="text-[12px] font-semibold text-white/60">Roster</div>
            <div className="text-[12px] font-semibold text-white/60 text-center">
              M
            </div>
            <div className="text-[12px] font-semibold text-white/60 text-center">
              W-L
            </div>
            <div className="text-[12px] font-semibold text-white/60 text-center">
              WR
            </div>
            <div className="text-[12px] font-semibold text-white/60 text-center">
              Last 5
            </div>
            <div className="text-[12px] font-semibold text-white/60 text-center">
              Avg ELO
            </div>
            <div className="text-[12px] font-semibold text-white/60 text-center">
              Points
            </div>
          </div>

          <div>
            {rows.map((r, idx) => {
              const isTop3 = idx < 3;
              const isOpen = activeRoster === r.roster;

              return (
                <React.Fragment key={r.roster}>
                  {/* ROW */}
                  <div
                    className={cn(
                      "px-5 py-4 border-b border-white/10 transition",
                      "grid items-center gap-3",
                      GRID,
                      isTop3
                        ? "bg-white/[0.06] hover:bg-white/[0.08]"
                        : "hover:bg-white/[0.04]",
                      "cursor-pointer select-none"
                    )}
                    onClick={() => setActiveRoster(isOpen ? null : r.roster)}
                    role="button"
                    aria-label={`Open roster ${r.roster}`}
                    title="Открыть игроков"
                  >
                    {/* roster */}
                    <div className="flex items-center gap-3 min-w-0">
                      <WildLogo variant={isTop3 ? "red" : "blue"} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-extrabold text-white">
                            {r.roster}
                          </div>
                          <div className="text-[11px] text-white/45">
                            MVP:{" "}
                            <span className="text-white/70 font-semibold">
                              {r.mvp}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* M */}
                    <div className="text-center text-[13px] font-semibold text-white/80 tabular-nums">
                      {r.matches}
                    </div>

                    {/* W-L */}
                    <div className="text-center text-[13px] font-semibold text-white/80 tabular-nums">
                      {r.wins}-{r.losses}
                    </div>

                    {/* WR */}
                    <div className="text-center text-[13px] font-semibold text-white/80 tabular-nums">
                      {r.winrate}%
                    </div>

                    {/* Last 5 */}
                    <div className="flex items-center justify-center">
                      <Last5 arr={r.last5} />
                    </div>

                    {/* Avg ELO */}
                    <div className="text-center text-[13px] font-semibold text-white/80 tabular-nums">
                      {r.avgElo}
                    </div>

                    {/* Points */}
                    <div className="flex items-center justify-center">
                      <PointsChip points={r.points} hot={isTop3} />
                    </div>
                  </div>

                  {/* EXPAND */}
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <div className="border-b border-white/10">
                        <PlayersPanel
                          roster={r.roster}
                          players={playersByRoster[r.roster] ?? []}
                          reduce={reduce}
                          accent={isTop3 ? "red" : "blue"}
                        />
                      </div>
                    ) : null}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
