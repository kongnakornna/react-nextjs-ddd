'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

/**
 * Theme / layout settings — port of icmonangular `core/services/layout.service.ts`.
 *
 * One module-level store shared by every component (header dark-mode toggle,
 * layout-mode dropdown, Theme Settings off-canvas), so they never drift apart.
 * Persisted per key as `tabler-<key>` in localStorage; app/layout.tsx applies the
 * same keys in an inline script before hydration to avoid a flash.
 */
export interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
  themeBase: string;
  themeFont: string;
  themePrimary: string;
  themeRadius: string;
  layout: 'fluid' | 'boxed' | 'boxed-2';
}

export type ThemeKey = keyof ThemeSettings;

const STORAGE_PREFIX = 'tabler-';
export const THEME_DEFAULTS: ThemeSettings = {
  theme: 'dark',
  themeBase: 'gray',
  themeFont: 'sans-serif',
  themePrimary: 'blue',
  themeRadius: '1',
  layout: 'fluid',
};

// ── store ────────────────────────────────────────────────────────────────
let state: ThemeSettings = THEME_DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => THEME_DEFAULTS;
const getLoaded = () => loaded;
const getServerLoaded = () => false;

function readStorage(): ThemeSettings {
  const next = { ...THEME_DEFAULTS };
  try {
    for (const key of Object.keys(THEME_DEFAULTS) as ThemeKey[]) {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      if (stored) (next as Record<string, string>)[key] = stored;
    }
  } catch {
    // storage blocked — keep defaults
  }
  return next;
}

function ensureLoaded() {
  if (loaded || typeof window === 'undefined') return;
  state = readStorage();
  loaded = true;
  applySettings(state);
  emit();
}

function setState(next: ThemeSettings) {
  state = next;
  applySettings(state);
  emit();
}

// ── public hook ──────────────────────────────────────────────────────────
export function useTheme() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isLoaded = useSyncExternalStore(subscribe, getLoaded, getServerLoaded);

  // Read localStorage after mount — the first client render matches the server.
  useEffect(() => {
    ensureLoaded();
  }, []);

  const update = useCallback((key: ThemeKey, value: string) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch {
      // ignore
    }
    setState({ ...state, [key]: value } as ThemeSettings);
  }, []);

  const reset = useCallback(() => {
    try {
      for (const key of Object.keys(THEME_DEFAULTS)) {
        localStorage.removeItem(STORAGE_PREFIX + key);
      }
    } catch {
      // ignore
    }
    setState(THEME_DEFAULTS);
  }, []);

  const toggleTheme = useCallback(() => {
    update('theme', resolveTheme(state.theme) === 'dark' ? 'light' : 'dark');
  }, [update]);

  return {
    settings,
    isLoaded,
    isDarkMode: resolveTheme(settings.theme) === 'dark',
    update,
    reset,
    toggleTheme,
  };
}

function resolveTheme(theme: ThemeSettings['theme']): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

/** Toggle browser full screen (port of HeaderComponent.openFullscreen). */
export function toggleFullscreen(): void {
  if (typeof document === 'undefined') return;
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => void;
    msRequestFullscreen?: () => void;
    mozRequestFullScreen?: () => void;
  };
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else if (el.requestFullscreen) {
    void el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  }
}

function applySettings(s: ThemeSettings) {
  if (typeof document === 'undefined') return;

  const el = document.documentElement;

  const resolved = resolveTheme(s.theme);
  el.setAttribute('data-bs-theme', resolved);
  el.setAttribute('data-bs-theme-base', s.themeBase);
  el.setAttribute('data-bs-theme-font', s.themeFont);
  el.setAttribute('data-bs-theme-primary', s.themePrimary);
  el.setAttribute('data-bs-theme-radius', s.themeRadius);

  // Sync dark class for Tailwind
  el.classList.toggle('dark', resolved === 'dark');

  el.classList.remove('theme-slate', 'theme-gray', 'theme-zinc', 'theme-neutral', 'theme-stone');
  el.classList.add('theme-' + s.themeBase);

  // Layout mode — Tabler reads .layout-boxed on <body>
  const body = document.body;
  body.classList.remove('layout-fluid', 'layout-boxed', 'layout-boxed-2');
  if (s.layout === 'boxed' || s.layout === 'boxed-2') {
    body.classList.add('layout-boxed');
    if (s.layout === 'boxed-2') body.classList.add('layout-boxed-2');
  }
}
