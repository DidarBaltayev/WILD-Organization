"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";

type TelegramStats = {
  count: number;
  updatedAt: number;
};

type Point = {
  t: number; // timestamp (ms)
  users: number; // participants
  live?: boolean; // last point highlight
};

type Anchor = { date: string; users: number }; // YYYY-MM-DD

// ✅ ЯКОРЯ (месячные), график строится ПО ДНЯМ
// ✅ Старт: 24.03.2025
const ANCHORS: Anchor[] = [
  { date: "2025-03-24", users: 80 },
  { date: "2025-04-01", users: 170 },
  { date: "2025-05-01", users: 240 },
  { date: "2025-06-01", users: 360 },
  { date: "2025-07-01", users: 490 },
  { date: "2025-08-01", users: 540 },
  { date: "2025-09-01", users: 500 },
  { date: "2025-10-01", users: 570 },
  { date: "2025-11-01", users: 630 },
  { date: "2025-12-01", users: 700 },
];

function toDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function parseISODate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function dayDiff(a: Date, b: Date) {
  const A = toDateOnly(a).getTime();
  const B = toDateOnly(b).getTime();
  return Math.round((B - A) / 86_400_000);
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function formatRU(n: number) {
  return n.toLocaleString("ru-RU");
}
function fmtDM(ts: number) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}
function fmtFull(ts: number) {
  return new Date(ts).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function isoToday() {
  const d = toDateOnly(new Date());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

/**
 * ✅ Дневной ряд между якорями:
 * - без random
 * - детерминированные "волны"
 * - значение НЕ падает
 */
function buildDailySegment(start: Anchor, end: Anchor, prevValue: number) {
  const sDate = parseISODate(start.date);
  const eDate = parseISODate(end.date);
  const total = Math.max(1, dayDiff(sDate, eDate));

  const points: Point[] = [];
  let prev = prevValue;

  for (let i = 0; i <= total; i++) {
    const t = total === 0 ? 1 : i / total;
    const base = start.users + (end.users - start.users) * easeInOutCubic(t);

    const dayIndex = i + Math.floor(sDate.getTime() / 86_400_000);
    const wave =
      Math.sin(dayIndex * 0.17) * 1.6 +
      Math.sin(dayIndex * 0.041) * 1.2 +
      Math.sin(dayIndex * 0.011) * 0.8;

    let val = Math.round(base + wave);

    // ✅ не падаем
    val = Math.max(prev, val);

    // последняя точка сегмента = end.users (и тоже не падаем)
    if (i === total) val = Math.max(prev, end.users);

    prev = val;

    points.push({
      t: addDays(sDate, i).getTime(),
      users: val,
    });
  }

  return { points, last: prev };
}

function buildFullSeries(liveCount: number): Point[] {
  const anchors = [...ANCHORS];

  // ✅ сегодня = реальный Telegram count
  anchors.push({ date: isoToday(), users: liveCount });

  anchors.sort(
    (a, b) => parseISODate(a.date).getTime() - parseISODate(b.date).getTime()
  );

  const out: Point[] = [];
  let prev = anchors[0]?.users ?? 0;

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];

    const seg = buildDailySegment(a, b, prev);
    const slice = i === 0 ? seg.points : seg.points.slice(1);
    out.push(...slice);
    prev = seg.last;
  }

  if (out.length) out[out.length - 1].live = true;
  return out;
}

export default function Scale() {
  const reduce = useReducedMotion() ?? false;

  const [data, setData] = useState<TelegramStats | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ чтобы не было 0: по умолчанию держим 700
  const FALLBACK_COUNT = ANCHORS[ANCHORS.length - 1].users;

  // ✅ анимируем число аккуратно + без лишних ререндеров (через ref)
  const [displayCount, setDisplayCount] = useState<number>(FALLBACK_COUNT);
  const displayCountRef = useRef<number>(FALLBACK_COUNT);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    displayCountRef.current = displayCount;
  }, [displayCount]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/telegram/members", { cache: "no-store" });
        if (!res.ok) throw new Error("Telegram API failed");

        const json: TelegramStats = await res.json();
        if (!alive) return;

        setData(json);

        const to = json.count > 0 ? json.count : FALLBACK_COUNT;

        // ✅ mobile-safe: если reduceMotion — без анимации
        if (reduce) {
          setDisplayCount(to);
          return;
        }

        // ✅ отменяем прошлую анимацию, если она шла
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        const from = displayCountRef.current;
        const start = performance.now();
        const dur = 520;

        function step(now: number) {
          const p = clamp((now - start) / dur, 0, 1);
          const eased = easeInOutCubic(p);
          const v = Math.round(from + (to - from) * eased);
          setDisplayCount(v);
          if (p < 1) rafRef.current = requestAnimationFrame(step);
        }

        rafRef.current = requestAnimationFrame(step);
      } catch (e) {
        console.error("Telegram stats error", e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60_000);

    return () => {
      alive = false;
      clearInterval(interval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ⚠️ оставляем как у тебя: не гоняем лишнее

  const liveCount = data?.count && data.count > 0 ? data.count : FALLBACK_COUNT;

  const series = useMemo<Point[]>(() => buildFullSeries(liveCount), [liveCount]);

  const activity = useMemo(() => {
    if (!data?.updatedAt)
      return {
        label: "нет данных",
        dot: "rgba(255,255,255,0.35)",
        glow: "none",
        text: "text-white/60",
      };

    const ageMs = Date.now() - data.updatedAt;
    const mins = Math.floor(ageMs / 60000);

    if (mins <= 5)
      return {
        label: "высокая",
        dot: "rgba(34,197,94,0.95)",
        glow: "0 0 14px rgba(34,197,94,.45)",
        text: "text-[rgba(34,197,94,0.95)]",
      };
    if (mins <= 30)
      return {
        label: "средняя",
        dot: "rgba(234,179,8,0.95)",
        glow: "0 0 14px rgba(234,179,8,.35)",
        text: "text-[rgba(234,179,8,0.95)]",
      };

    return {
      label: "низкая",
      dot: "rgba(239,68,68,0.95)",
      glow: "0 0 14px rgba(239,68,68,.35)",
      text: "text-[rgba(239,68,68,0.95)]",
    };
  }, [data?.updatedAt]);

  // ✅ один фокус блока: заголовок + live число + график (без повторов смысла)
  const subtitle = useMemo(() => {
    const start = "24.03.2025";
    const end = new Date().toLocaleDateString("ru-RU");
    return `${start} → ${end}`;
  }, []);

  return (
    <section id="scale" className="section">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 lg:p-8 relative overflow-hidden">
          {/* glow (статичный, без анимаций) */}
          <div
            className="pointer-events-none absolute -inset-24 opacity-60"
            style={{
              background:
                "radial-gradient(760px 340px at 20% 0%, rgba(59,130,246,.35), transparent 60%)",
              filter: "blur(14px)",
            }}
          />

          {/* TITLE (gradient) */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={reduce ? undefined : { duration: 0.5 }}
            className="relative"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 left-0 h-[140px] w-[680px] blur-3xl opacity-60"
              style={{
                background:
                  "radial-gradient(60% 60% at 22% 50%, rgba(59,130,246,.55), transparent 70%)",
              }}
            />

            <h2
              className="text-4xl lg:text-5xl font-extrabold tracking-tight"
              style={{
                background:
                  "linear-gradient(90deg, rgba(160,214,255,0.98), rgba(59,130,246,0.98), rgba(6,182,212,0.98))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 0 22px rgba(59,130,246,.16)",
              }}
            >
              График участников WILD
            </h2>

            <div className="mt-2 text-sm text-white/60">
              Период: <span className="text-white/80 font-semibold">{subtitle}</span>
            </div>
          </motion.div>

          {/* BIG NUMBER + activity */}
          <div className="mt-7 flex flex-wrap items-end gap-6">
            <div className="min-w-[280px]">
              <div className="text-xs text-white/55">Участников сейчас</div>

              <div className="mt-1 text-6xl lg:text-7xl font-black tracking-tight tabular-nums">
                {loading ? "—" : formatRU(displayCount)}
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: activity.dot, boxShadow: activity.glow }}
                />
                <span className="text-white/60">Активность:</span>
                <span className={activity.text}>{activity.label}</span>
              </div>

              <div className="mt-2 text-xs text-white/45">
                Обновлено:{" "}
                {data?.updatedAt
                  ? new Date(data.updatedAt).toLocaleString("ru-RU")
                  : "—"}
              </div>
            </div>
          </div>

          {/* CHART */}
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="h-[320px] sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={series}
                  margin={{ top: 10, right: 14, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="wildStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="wildFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(59,130,246,0.28)" />
                      <stop offset="100%" stopColor="rgba(6,182,212,0.02)" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />

                  <XAxis
                    dataKey="t"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    stroke="rgba(255,255,255,0.35)"
                    tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                    tickFormatter={(v: number) => fmtDM(v)}
                    interval="preserveStartEnd"
                    minTickGap={26}
                  />

                  <YAxis
                    dataKey="users"
                    stroke="rgba(255,255,255,0.35)"
                    tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                    tickFormatter={(v: number) => formatRU(v)}
                    width={70}
                    domain={["dataMin - 10", "dataMax + 10"]}
                  />

                  <Tooltip
                    formatter={(value: unknown) => {
                      const v = typeof value === "number" ? value : 0;
                      return [formatRU(v), "Участники"];
                    }}
                    labelFormatter={(label: unknown) => {
                      const t = typeof label === "number" ? label : Number(label);
                      return Number.isFinite(t) ? fmtFull(t) : "";
                    }}
                    contentStyle={{
                      background: "#0b1020",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      boxShadow: "0 18px 50px rgba(0,0,0,.45)",
                    }}
                    itemStyle={{ color: "rgba(255,255,255,.92)" }}
                    labelStyle={{ color: "rgba(255,255,255,.70)" }}
                    cursor={{
                      stroke: "rgba(59,130,246,0.25)",
                      strokeWidth: 1,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="url(#wildStroke)"
                    fill="url(#wildFill)"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={!reduce}
                    animationDuration={900}
                    animationEasing="ease-out"
                    activeDot={(p) => {
                      const live = p?.payload?.live;
                      return live ? (
                        <circle
                          cx={p.cx}
                          cy={p.cy}
                          r={6}
                          fill="#3b82f6"
                          stroke="rgba(255,255,255,0.95)"
                          strokeWidth={2}
                        />
                      ) : (
                        <circle
                          cx={p.cx}
                          cy={p.cy}
                          r={4}
                          fill="rgba(6,182,212,0.65)"
                        />
                      );
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 text-xs text-white/45">
              Наведи на график — увидишь значение за день.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
