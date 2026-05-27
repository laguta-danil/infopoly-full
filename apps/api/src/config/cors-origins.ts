function normalizeOriginUrl(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

export function parseCorsOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => normalizeOriginUrl(s))
    .filter(Boolean);
}

/** Browsers may send localhost or 127.0.0.1 depending on how the app was opened. */
export function expandLocalhostMirror(origins: string[]): string[] {
  const out = new Set(origins);
  for (const o of origins) {
    try {
      const u = new URL(o);
      if (u.hostname === 'localhost') {
        u.hostname = '127.0.0.1';
        out.add(u.toString());
      } else if (u.hostname === '127.0.0.1') {
        u.hostname = 'localhost';
        out.add(u.toString());
      }
    } catch {
      // ignore invalid URL
    }
  }
  return [...out];
}

export function resolveCorsOrigins(raw: string): string[] {
  return expandLocalhostMirror(parseCorsOrigins(raw));
}
