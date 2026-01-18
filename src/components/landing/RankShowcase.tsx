"use client";

import React, { memo, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type Player = {
  name: string;
  role?: string;
  elo?: number;
  flag?: string;
};

type RosterStats = {
  roster: string;
  points: number;
  matches: number;
  wins: number;
  losses: number;
  winrate: number;
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

/**
 * ✅ Desktop/tablet grid
 * FIX: чтобы не было “пустоты” справа — вторая колонка = 1fr и Points вправо
 */
const GRID = "grid-cols-[108px_1fr_96px_120px_96px_200px_132px_176px]";

/**
 * ✅ 4 SVG:
 *  - /public/top1.svg
 *  - /public/top2.svg
 *  - /public/top3.svg
 *  - /public/top4.svg  (дефолт для 4–10)
 */
const AVATAR_BY_RANK: Record<number, string> = {
  1: "/top1.svg",
  2: "/top2.svg",
  3: "/top3.svg",
};

// ❗️ДЕФОЛТ ДЛЯ 4–10: ты говорил, что будет 4 svg.
// Если у тебя дефолт реально top4.svg — поменяй на "/top4.svg".
const DEFAULT_AVATAR = "/logoW_blue.svg";

function TopPillarBadge({ rank }: { rank: number }) {
  const cfg =
    rank === 1
      ? {
          label: "TOP 1",
          ring: "rgba(255,215,128,0.55)",
          glow: "0 0 22px rgba(255,215,128,0.18)",
          bg: "linear-gradient(180deg, rgba(255,215,128,0.26), rgba(0,0,0,0.06))",
          text: "rgba(255,245,220,0.98)",
        }
      : rank === 2
      ? {
          label: "TOP 2",
          ring: "rgba(210,225,255,0.55)",
          glow: "0 0 20px rgba(210,225,255,0.16)",
          bg: "linear-gradient(180deg, rgba(210,225,255,0.22), rgba(0,0,0,0.06))",
          text: "rgba(245,250,255,0.96)",
        }
      : {
          label: "TOP 3",
          ring: "rgba(255,170,120,0.55)",
          glow: "0 0 18px rgba(255,170,120,0.14)",
          bg: "linear-gradient(180deg, rgba(255,170,120,0.18), rgba(0,0,0,0.06))",
          text: "rgba(255,240,230,0.96)",
        };

  return (
    <div
      className="inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5"
      style={{
        borderColor: cfg.ring,
        background: cfg.bg,
        boxShadow: cfg.glow,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: cfg.ring, boxShadow: cfg.glow }}
        aria-hidden
      />
      <span
        className="text-[11px] font-extrabold tracking-[0.18em]"
        style={{ color: cfg.text }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

/**
 * ✅ Аватар состава:
 * - топ-1..3 → отдельные SVG
 * - остальные → DEFAULT_AVATAR
 *
 * Топ-3 делаем крупнее и "премиальнее".
 */
function RosterAvatar({
  rank,
  isTop3,
  size,
}: {
  rank: number;
  isTop3: boolean;
  size?: number;
}) {
  const src = AVATAR_BY_RANK[rank] ?? DEFAULT_AVATAR;

  const box = typeof size === "number" ? size : isTop3 ? 64 : 48;
  const border = isTop3 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)";

  const premiumGlow =
    rank === 1
      ? "0 0 26px rgba(255,215,128,0.18)"
      : rank === 2
      ? "0 0 22px rgba(210,225,255,0.16)"
      : rank === 3
      ? "0 0 20px rgba(255,170,120,0.14)"
      : "none";

  const premiumRing =
    rank === 1
      ? "inset 0 0 0 1px rgba(255,215,128,0.35)"
      : rank === 2
      ? "inset 0 0 0 1px rgba(210,225,255,0.32)"
      : rank === 3
      ? "inset 0 0 0 1px rgba(255,170,120,0.28)"
      : "inset 0 0 0 1px rgba(59,130,246,0.10)";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0",
        "rounded-2xl overflow-hidden",
        isTop3 ? "bg-white/[0.06]" : "bg-white/[0.035]"
      )}
      style={{
        width: box,
        height: box,
        border: `1px solid ${border}`,
        boxShadow: isTop3 ? premiumGlow : "none",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            isTop3
              ? "radial-gradient(80% 70% at 30% 20%, rgba(255,255,255,0.18), transparent 55%)"
              : "radial-gradient(70% 60% at 30% 20%, rgba(255,255,255,0.12), transparent 55%)",
        }}
      />

      <Image
        src={src}
        alt={`Roster avatar rank ${rank}`}
        width={box}
        height={box}
        className="object-contain"
        style={{ width: box, height: box }}
        priority={isTop3}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: premiumRing }}
      />
    </div>
  );
}

const PointsChip = memo(function PointsChip({
  points,
  isTop3,
  rank,
  compact,
}: {
  points: number;
  isTop3: boolean;
  rank: number;
  compact?: boolean;
}) {
  const cfg =
    rank === 1
      ? {
          border: "rgba(255,215,128,0.40)",
          bg: "rgba(255,215,128,0.14)",
          text: "rgba(255,245,220,0.98)",
          glow: "0 0 18px rgba(255,215,128,0.14)",
        }
      : rank === 2
      ? {
          border: "rgba(210,225,255,0.38)",
          bg: "rgba(210,225,255,0.12)",
          text: "rgba(245,250,255,0.96)",
          glow: "0 0 16px rgba(210,225,255,0.12)",
        }
      : rank === 3
      ? {
          border: "rgba(255,170,120,0.38)",
          bg: "rgba(255,170,120,0.10)",
          text: "rgba(255,240,230,0.96)",
          glow: "0 0 14px rgba(255,170,120,0.10)",
        }
      : {
          border: "rgba(59,130,246,0.22)",
          bg: "rgba(59,130,246,0.10)",
          text: "rgba(190,220,255,0.95)",
          glow: "none",
        };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border select-none",
        compact ? "px-3 py-2 w-[120px]" : "px-3.5 py-2.5 w-[150px]"
      )}
      style={{
        borderColor: cfg.border,
        background: cfg.bg,
        boxShadow: isTop3 ? cfg.glow : "none",
      }}
    >
      <div className="text-center">
        <div
          className={cn(
            "font-extrabold leading-none tabular-nums",
            compact ? "text-[16px]" : "text-[20px]"
          )}
          style={{ color: cfg.text }}
        >
          {points}
        </div>
        <div className={cn("font-semibold tracking-[0.18em] text-white/45", compact ? "mt-1 text-[10px]" : "mt-1 text-[11px]")}>
          POINTS
        </div>
      </div>
    </div>
  );
});

const Last5 = memo(function Last5({
  arr,
  compact,
}: {
  arr: Array<"W" | "L">;
  compact?: boolean;
}) {
  const box = compact ? "h-[18px] w-[18px] text-[10px]" : "h-6 w-6 text-[12px]";
  return (
    <div className="flex items-center justify-center gap-1.5 w-full">
      {arr.slice(0, 5).map((v, i) => {
        const win = v === "W";
        return (
          <span
            key={`${v}-${i}`}
            className={cn(
              "inline-flex items-center justify-center rounded-md border font-extrabold leading-none tabular-nums",
              box,
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
});

function getRankBadgeStyle(rank: number) {
  if (rank === 1) {
    return {
      bg: "linear-gradient(180deg, rgba(255,215,128,0.38), rgba(255,215,128,0.10))",
      border: "rgba(255,215,128,0.42)",
      glow: "0 0 18px rgba(255,215,128,0.18)",
      text: "rgba(255,245,220,0.98)",
      label: "#1",
    };
  }
  if (rank === 2) {
    return {
      bg: "linear-gradient(180deg, rgba(210,225,255,0.34), rgba(210,225,255,0.10))",
      border: "rgba(210,225,255,0.40)",
      glow: "0 0 16px rgba(210,225,255,0.14)",
      text: "rgba(245,250,255,0.96)",
      label: "#2",
    };
  }
  if (rank === 3) {
    return {
      bg: "linear-gradient(180deg, rgba(255,170,120,0.30), rgba(255,170,120,0.10))",
      border: "rgba(255,170,120,0.40)",
      glow: "0 0 14px rgba(255,170,120,0.12)",
      text: "rgba(255,240,230,0.96)",
      label: "#3",
    };
  }

  return {
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.10)",
    glow: "none",
    text: "rgba(255,255,255,0.78)",
    label: `#${rank}`,
  };
}

const RankBadge = memo(function RankBadge({ rank }: { rank: number }) {
  const s = getRankBadgeStyle(rank);

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative inline-flex items-center justify-center h-12 w-[78px] rounded-2xl border font-extrabold tabular-nums text-[16px]"
        style={{
          background: s.bg,
          borderColor: s.border,
          boxShadow: s.glow,
          color: s.text,
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-70"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 20%, rgba(255,255,255,0.18), transparent 60%)",
          }}
        />
        <span className="relative">{s.label}</span>
      </div>
    </div>
  );
});

const PlayersPanel = memo(function PlayersPanel({
  roster,
  players,
  accent,
  reduce,
}: {
  roster: string;
  players: Player[];
  reduce: boolean;
  accent: "gold" | "silver" | "bronze" | "blue";
}) {
  const bg =
    accent === "gold"
      ? "linear-gradient(90deg, rgba(255,215,128,.18), rgba(255,215,128,0))"
      : accent === "silver"
      ? "linear-gradient(90deg, rgba(210,225,255,.18), rgba(210,225,255,0))"
      : accent === "bronze"
      ? "linear-gradient(90deg, rgba(255,170,120,.16), rgba(255,170,120,0))"
      : "linear-gradient(90deg, rgba(59,130,246,.18), rgba(59,130,246,0))";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
      className="px-4 sm:px-6 pb-5"
    >
      <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10" style={{ background: bg }}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[15px] font-extrabold text-white">
              {roster} · Игроки
            </div>
            <div className="text-[12px] text-white/55">5–7</div>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {players.slice(0, 7).map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-[15px] font-bold text-white truncate">
                    {p.flag ? <span className="mr-2">{p.flag}</span> : null}
                    {p.name}
                  </div>
                  {p.role ? <div className="text-[12px] text-white/55">{p.role}</div> : null}
                </div>

                <div className="text-right pl-3 shrink-0">
                  <div className="text-[15px] font-extrabold text-white tabular-nums">
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
});

const Row = memo(function Row({
  r,
  idx,
  isOpen,
  reduce,
  onToggle,
  players,
}: {
  r: RosterStats;
  idx: number;
  isOpen: boolean;
  reduce: boolean;
  onToggle: (roster: string) => void;
  players: Player[];
}) {
  const rank = idx + 1;
  const isTop3 = rank <= 3;

  const allowHover =
    !reduce &&
    typeof window !== "undefined" &&
    !window.matchMedia?.("(pointer: coarse)")?.matches;

  const topBg =
    rank === 1
      ? "linear-gradient(90deg, rgba(255,215,128,0.14), rgba(255,215,128,0) 55%)"
      : rank === 2
      ? "linear-gradient(90deg, rgba(210,225,255,0.12), rgba(210,225,255,0) 55%)"
      : "linear-gradient(90deg, rgba(255,170,120,0.10), rgba(255,170,120,0) 55%)";

  const topGlow =
    rank === 1
      ? "0 0 40px rgba(255,215,128,0.10)"
      : rank === 2
      ? "0 0 36px rgba(210,225,255,0.08)"
      : "0 0 32px rgba(255,170,120,0.08)";

  return (
    <div className="border-b border-white/10">
      <motion.div
        onClick={() => onToggle(r.roster)}
        role="button"
        title="Открыть игроков"
        aria-label={`Open roster ${r.roster}`}
        className={cn(
          "px-6 py-5 transition",
          "grid items-center gap-4 w-full",
          GRID,
          "cursor-pointer select-none"
        )}
        style={{
          background: isTop3 ? topBg : undefined,
          boxShadow: isTop3 ? topGlow : undefined,
        }}
        whileHover={
          allowHover
            ? isTop3
              ? { transform: "translateY(-1px)" }
              : { transform: "translateY(-1px)" }
            : undefined
        }
        transition={reduce ? { duration: 0 } : { duration: 0.14, ease: "easeOut" }}
      >
        <div className="flex items-center justify-center">
          <RankBadge rank={rank} />
        </div>

        <div className="flex items-start gap-4 min-w-0">
          <RosterAvatar rank={rank} isTop3={isTop3} />

          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-[16px] font-extrabold text-white">{r.roster}</div>

              {isTop3 ? <TopPillarBadge rank={rank} /> : null}

              <div className="text-[12px] text-white/45">
                MVP: <span className="text-white/75 font-semibold">{r.mvp}</span>
              </div>
            </div>

            <div className="mt-2">
              <span
                className={cn(
                  "inline-flex items-center justify-center",
                  "rounded-lg border px-3 py-1.5",
                  "text-[12px] font-extrabold tracking-[0.14em] uppercase",
                  "border-white/15 bg-white/[0.05] text-white/85"
                )}
              >
                {isOpen ? "СКРЫТЬ ИГРОКОВ" : "ПОКАЗАТЬ ИГРОКОВ"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-[15px] font-semibold text-white/85 tabular-nums">
          {r.matches}
        </div>

        <div className="text-center text-[15px] font-semibold text-white/85 tabular-nums">
          {r.wins}-{r.losses}
        </div>

        <div className="text-center text-[15px] font-semibold text-white/85 tabular-nums">
          {r.winrate}%
        </div>

        <div className="flex items-center justify-center">
          <Last5 arr={r.last5} />
        </div>

        <div className="text-center text-[15px] font-semibold text-white/85 tabular-nums">
          {r.avgElo}
        </div>

        <div className="flex items-center justify-end">
          <PointsChip points={r.points} isTop3={isTop3} rank={rank} />
        </div>
      </motion.div>

      {isOpen ? (
        <div className="pb-3">
          <PlayersPanel
            roster={r.roster}
            players={players}
            reduce={reduce}
            accent={rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "blue"}
          />
        </div>
      ) : null}
    </div>
  );
});

/* =========================
   ✅ MOBILE CARD VIEW (КОРОТКО + 1 ЛИНИЯ СТАТЫ)
========================= */

const MobileCard = memo(function MobileCard({
  r,
  idx,
  isOpen,
  reduce,
  onToggle,
  players,
}: {
  r: RosterStats;
  idx: number;
  isOpen: boolean;
  reduce: boolean;
  onToggle: (roster: string) => void;
  players: Player[];
}) {
  const rank = idx + 1;
  const isTop3 = rank <= 3;

  // ✅ На мобиле анимации вырубаем жёстко (только мобайл оптимизация)
  const mobileReduce = true;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden",
        isTop3 ? "bg-white/[0.06]" : "bg-white/[0.045]"
      )}
      style={{
        boxShadow:
          rank === 1
            ? "0 0 30px rgba(255,215,128,0.10)"
            : rank === 2
            ? "0 0 26px rgba(210,225,255,0.08)"
            : rank === 3
            ? "0 0 24px rgba(255,170,120,0.08)"
            : "none",
      }}
    >
      {/* ✅ без motion.button чтобы не грузило телефон */}
      <button
        type="button"
        onClick={() => onToggle(r.roster)}
        className={cn("w-full text-left", "p-3")} // ✅ меньше высота
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* HEADER: rank + avatar + name */}
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <RankBadge rank={rank} />
          </div>

          <RosterAvatar rank={rank} isTop3={isTop3} size={isTop3 ? 54 : 44} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[15px] font-extrabold text-white truncate">
                {r.roster}
              </div>
              {isTop3 ? <TopPillarBadge rank={rank} /> : null}
            </div>

            <div className="text-[12px] text-white/45 truncate">
              MVP: <span className="text-white/75 font-semibold">{r.mvp}</span>
            </div>
          </div>
        </div>

        {/* ✅ ОДНА ЛИНИЯ: Points + M + W-L + WR + Last5 + Avg */}
        <div
          className={cn(
            "mt-3",
            "flex items-center gap-2",
            "overflow-x-auto whitespace-nowrap",
            "pb-1"
          )}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {/* скрыть скроллбар в webkit */}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <PointsChip points={r.points} isTop3={isTop3} rank={rank} compact />

          <MiniStatCompact label="M" value={r.matches} />
          <MiniStatCompact label="W-L" value={`${r.wins}-${r.losses}`} />
          <MiniStatCompact label="WR" value={`${r.winrate}%`} />

          <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-2">
            <div className="mr-2 text-[9px] font-semibold tracking-[0.18em] text-white/45 uppercase">
              L5
            </div>
            <Last5 arr={r.last5} compact />
          </div>

          <MiniStatCompact label="AVG" value={r.avgElo} />
        </div>

        {/* CTA */}
        <div className="mt-3">
          <span
            className={cn(
              "inline-flex items-center justify-center",
              "rounded-lg border px-3 py-1.5",
              "text-[11px] font-extrabold tracking-[0.14em] uppercase",
              "border-white/15 bg-white/[0.05] text-white/85"
            )}
          >
            {isOpen ? "СКРЫТЬ ИГРОКОВ" : "ПОКАЗАТЬ ИГРОКОВ"}
          </span>
        </div>
      </button>

      {isOpen ? (
        <div className="pb-2">
          <PlayersPanel
            roster={r.roster}
            players={players}
            reduce={mobileReduce || reduce}
            accent={rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "blue"}
          />
        </div>
      ) : null}
    </div>
  );
});

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
      <div className="text-[10px] font-semibold tracking-[0.18em] text-white/45 uppercase">
        {label}
      </div>
      <div className="mt-0.5 text-[13px] font-extrabold text-white tabular-nums">
        {value}
      </div>
    </div>
  );
}

function MiniStatCompact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-2">
      <div className="text-[9px] font-semibold tracking-[0.18em] text-white/45 uppercase">
        {label}
      </div>
      <div className="ml-2 text-[12px] font-extrabold text-white tabular-nums">
        {value}
      </div>
    </div>
  );
}

export default function RankShowcase() {
  const reduce = useReducedMotion() ?? false;
  const [activeRoster, setActiveRoster] = useState<string | null>(null);

  const onToggle = useCallback((roster: string) => {
    setActiveRoster((prev) => (prev === roster ? null : roster));
  }, []);

  const playersByRoster = useMemo<Record<string, Player[]>>(
    () => ({
      W1: [
        { name: "Unknown", role: "AWP", elo: 0, flag: "🇹🇷" },
        { name: "Unknown", role: "Entry", elo: 0, flag: "🇰🇿" },
        { name: "Unknown", role: "Rifler", elo: 0, flag: "🇷🇺" },
        { name: "Unknown", role: "IGL", elo: 0, flag: "🇺🇦" },
        { name: "Unknown", role: "Support", elo: 0, flag: "🇹🇲" },
      ],
      W2: [
        { name: "Unknown", role: "IGL", elo: 0, flag: "🇹🇷" },
        { name: "Unknown", role: "Rifler", elo: 0, flag: "🇰🇿" },
        { name: "Unknown", role: "AWP", elo: 0, flag: "🇷🇺" },
        { name: "Unknown", role: "Entry", elo: 0, flag: "🇺🇿" },
        { name: "Unknown", role: "Support", elo: 0, flag: "🇺🇦" },
        { name: "Unknown", role: "Rifler", elo: 0, flag: "🇹🇲" },
      ],
      W3: [
        { name: "Unknown", role: "Entry", elo: 0, flag: "🇹🇷" },
        { name: "Unknown", role: "AWP", elo: 0, flag: "🇷🇺" },
        { name: "Unknown", role: "Rifler", elo: 0, flag: "🇰🇿" },
        { name: "Unknown", role: "IGL", elo: 0, flag: "🇺🇦" },
        { name: "Unknown", role: "Support", elo: 0, flag: "🇹🇲" },
      ],
      W4: [
        { name: "Unknown", role: "Rifler", elo: 2750 },
        { name: "Unknown", role: "Entry", elo: 2690 },
        { name: "Unknown", role: "AWP", elo: 2620 },
        { name: "Unknown", role: "Support", elo: 2580 },
        { name: "Unknown", role: "IGL", elo: 2540 },
      ],
      W5: [
        { name: "Unknown", role: "IGL", elo: 0 },
        { name: "Unknown", role: "Entry", elo: 0 },
        { name: "Unknown", role: "Support", elo: 0 },
        { name: "Unknown", role: "Rifler", elo: 0 },
        { name: "Unknown", role: "AWP", elo: 0 },
      ],
      W6: [
        { name: "Unknown", role: "Rifler", elo: 0 },
        { name: "Unknown", role: "Support", elo: 0 },
        { name: "Unknown", role: "Entry", elo: 0 },
        { name: "Unknown", role: "IGL", elo: 0 },
        { name: "Unknown", role: "AWP", elo: 0 },
      ],
      W7: [
        { name: "Unknown", role: "Entry", elo: 0 },
        { name: "Unknown", role: "Rifler", elo: 0 },
        { name: "Unknown", role: "Support", elo: 0 },
        { name: "Unknown", role: "IGL", elo: 0 },
        { name: "Unknown", role: "AWP", elo: 0 },
      ],
      W8: [
        { name: "Unknown", role: "Rifler", elo: 0 },
        { name: "Unknown", role: "Support", elo: 0 },
        { name: "Unknown", role: "Entry", elo: 0 },
        { name: "Unknown", role: "IGL", elo: 0 },
        { name: "Unknown", role: "AWP", elo: 0 },
      ],
      W9: [
        { name: "Unknown", role: "IGL", elo: 0 },
        { name: "Unknown", role: "Rifler", elo: 0 },
        { name: "Unknown", role: "Support", elo: 0 },
        { name: "Unknown", role: "Entry", elo: 0 },
        { name: "Unknown", role: "AWP", elo: 0 },
      ],
      W10: [
        { name: "Unknown", role: "Support", elo: 0 },
        { name: "Unknown", role: "Entry", elo: 0 },
        { name: "Unknown", role: "Rifler", elo: 0 },
        { name: "Unknown", role: "IGL", elo: 0 },
        { name: "Unknown", role: "AWP", elo: 0 },
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

    const basePoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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

      // Статистика (заглушки)
      const matches = clamp(0 - idx * 0, 0, 0);
      const wrBase = clamp(0 - idx * 0, 0, 0);
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
    <section className="relative py-20 lg:py-32">
      <div
        className="
          relative mx-auto w-full
          max-w-[1800px]
          px-4 sm:px-6
          lg:px-10
          2xl:max-w-[2200px]
        "
      >
        {/* title */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-14 left-0 h-[180px] w-[720px] blur-3xl opacity-70"
            style={{
              background:
                "radial-gradient(65% 65% at 30% 50%, rgba(59,130,246,.62), transparent 70%)",
            }}
          />

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
                  ТОП-10 СОСТАВОВ
                </h2>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-white/15 via-white/10 to-transparent" />
        </div>

        {/* ✅ MOBILE (cards) */}
        <div className="mt-8 grid gap-4 md:hidden">
          {rows.map((r, idx) => (
            <MobileCard
              key={r.roster}
              r={r}
              idx={idx}
              isOpen={activeRoster === r.roster}
              reduce={reduce}
              onToggle={onToggle}
              players={playersByRoster[r.roster] ?? []}
            />
          ))}
        </div>

        {/* ✅ DESKTOP/TABLET (table) */}
        <div className="mt-10 hidden md:block overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] backdrop-blur-xl relative">
          <div className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.12)]" />

          {/* HEAD */}
          <div
            className={cn(
              "px-6 py-5 border-b border-white/10",
              "grid items-center gap-4 w-full",
              GRID
            )}
          >
            <div className="text-[14px] font-semibold tracking-[0.14em] uppercase text-white/60 text-center">
              #
            </div>
            <div className="text-[14px] font-semibold tracking-[0.14em] uppercase text-white/60">
              Состав
            </div>
            <div className="text-[14px] font-semibold tracking-[0.14em] uppercase text-white/60 text-center">
              M
            </div>
            <div className="text-[14px] font-semibold tracking-[0.14em] uppercase text-white/60 text-center">
              W-L
            </div>
            <div className="text-[14px] font-semibold tracking-[0.14em] uppercase text-white/60 text-center">
              WR
            </div>
            <div className="text-[14px] font-semibold tracking-[0.14em] uppercase text-white/60 text-center">
              Last 5
            </div>
            <div className="text-[14px] font-semibold tracking-[0.14em] uppercase text-white/60 text-center">
              Avg ELO
            </div>
            <div className="text-[14px] font-semibold tracking-[0.14em] uppercase text-white/60 text-right pr-1">
              Points
            </div>
          </div>

          <div>
            {rows.map((r, idx) => (
              <Row
                key={r.roster}
                r={r}
                idx={idx}
                isOpen={activeRoster === r.roster}
                reduce={reduce}
                onToggle={onToggle}
                players={playersByRoster[r.roster] ?? []}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
