/** Translate with fallback: `t` returns the key itself when it is missing. */
export function tf(t: (key: string, params?: Record<string, string | number>) => string, key: string, fallback: string, params?: Record<string, string | number>): string {
  const v = t(key, params);
  return v && v !== key ? v : fallback;
}
