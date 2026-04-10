import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

const THEME_STORAGE_KEY = 'educycle.theme';
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

const ThemeContext = createContext(null);

function getStoredTheme() {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
}

function getSystemTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia(DARK_MODE_QUERY).matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#0e1929' : '#16a374');
  }
}

function resolveTheme(mode, systemTheme) {
  return mode === 'system' ? systemTheme : mode;
}

function getInitialMode() {
  const storedTheme = getStoredTheme();
  return storedTheme ?? 'light';
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => getInitialMode());
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    const media = window.matchMedia(DARK_MODE_QUERY);
    const onMediaChange = (event) => setSystemTheme(event.matches ? 'dark' : 'light');

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onMediaChange);
      return () => media.removeEventListener('change', onMediaChange);
    }

    media.addListener(onMediaChange);
    return () => media.removeListener(onMediaChange);
  }, []);

  const theme = useMemo(() => resolveTheme(mode, systemTheme), [mode, systemTheme]);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (mode === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const setTheme = useCallback((nextMode) => {
    if (nextMode === 'light' || nextMode === 'dark' || nextMode === 'system') {
      setMode(nextMode);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((currentMode) => {
      const currentTheme = resolveTheme(currentMode, getSystemTheme());
      return currentTheme === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [mode, theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
