// app/api/metrics/members/store.ts
export type Point = { t: number; v: number };

// ✅ заглушка "живого" роста. Потом заменим на Telegram/DB.
let current = 12840;
let lastUpdate = Date.now();

function tick() {
  const now = Date.now();
  // раз в ~12 секунд слегка растём
  if (now - lastUpdate > 12_000) {
    current += Math.floor(Math.random() * 4); // +0..3
    lastUpdate = now;
  }
}

export function getLatest() {
  tick();
  return { value: current, updatedAt: Date.now() };
}

export function getSeries24h(): Point[] {
  tick();
  const now = Date.now();
  const points: Point[] = [];
  const steps = 24; // по часу
  const base = current - 180;

  for (let i = steps; i >= 0; i--) {
    const t = now - i * 60 * 60 * 1000;
    const noise = Math.floor(Math.random() * 12);
    const v = base + (steps - i) * 8 + noise;
    points.push({ t, v });
  }

  // последняя точка = текущее значение
  points[points.length - 1] = { t: now, v: current };
  return points;
}
