import { useSyncExternalStore } from "react";

const STORAGE_KEY = "app-theme";
const LEGACY_KEYS = ["admin-theme"];
const isBrowser = typeof window !== "undefined";
const listeners = new Set();

const clampTheme = (value) => (value === "dark" ? "dark" : "light");

const readStoredTheme = () => {
  if (!isBrowser) return "light";
  const stored =
    localStorage.getItem(STORAGE_KEY) ??
    LEGACY_KEYS.reduce((acc, key) => acc ?? localStorage.getItem(key), null);
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

let themeState = clampTheme(readStoredTheme());

const applyTheme = (value) => {
  if (!isBrowser) return;
  const next = clampTheme(value);
  document.documentElement.classList.toggle("dark", next === "dark");
  document.documentElement.setAttribute("data-theme", next);
};

const notify = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error("Theme listener error", error);
    }
  });
};

const setThemeInternal = (value, { persist = true } = {}) => {
  const next = clampTheme(value);
  if (themeState === next) {
    applyTheme(next);
    return;
  }
  themeState = next;
  applyTheme(next);
  if (isBrowser && persist) {
    localStorage.setItem(STORAGE_KEY, next);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  }
  notify();
};

if (isBrowser) {
  applyTheme(themeState);
  localStorage.setItem(STORAGE_KEY, themeState);
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      setThemeInternal(event.newValue, { persist: false });
    }
  });
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => themeState;
const getServerSnapshot = () => "light";

const toggleThemeInternal = () => {
  setThemeInternal(themeState === "dark" ? "light" : "dark");
};

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    theme,
    isDark: theme === "dark",
    setTheme: (value) => setThemeInternal(value),
    toggleTheme: toggleThemeInternal,
  };
}

export const ThemeUtils = {
  get theme() {
    return themeState;
  },
  setTheme: (value) => setThemeInternal(value),
  toggleTheme: toggleThemeInternal,
};
