/**
 * sockjs-client expects Node's `global`; set before any module imports it.
 */
window.global = window.global || globalThis;

/**
 * Apply theme before React renders to avoid flash of incorrect theme.
 */
(() => {
  const key = 'educycle.theme';
  const storedTheme = localStorage.getItem(key);
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const theme = storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : prefersDark
      ? 'dark'
      : 'light';

  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
})();
