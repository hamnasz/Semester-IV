import { prefs } from './store.js';

const media = () => window.matchMedia('(prefers-color-scheme: dark)');
export const storedTheme = () => prefs.get('theme');            // 'light' | 'dark' | null (light)
export const currentTheme = () => document.documentElement.dataset.theme || 'light';

export function applyTheme(theme, { animate = false } = {}) {
  const root = document.documentElement;
  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-shift');
    setTimeout(() => root.classList.remove('theme-shift'), 320);
  }
  root.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"][data-dynamic]');
  if (meta) meta.content = theme === 'dark' ? '#141114' : '#ffffff';
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  prefs.set('theme', next);
  applyTheme(next, { animate: true });
  return next;
}

/** The portal is white by default. Dark mode only applies once the visitor chooses it. */
export function initTheme() {
  applyTheme(storedTheme() === 'dark' ? 'dark' : 'light');
}
