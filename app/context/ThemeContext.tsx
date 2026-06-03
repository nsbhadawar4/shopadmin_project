"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
  themeToggleEnabled: boolean;
  setThemeToggleEnabled: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggleTheme: () => {},
  themeToggleEnabled: false,
  setThemeToggleEnabled: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("userTheme") as Theme | null;
    const settings = JSON.parse(localStorage.getItem("adminSettings") || "{}");
    if (stored === "light" || stored === "dark") setTheme(stored);
    setEnabledState(!!settings.themeToggleEnabled);

    const onUpdate = () => {
      const s = JSON.parse(localStorage.getItem("adminSettings") || "{}");
      setEnabledState(!!s.themeToggleEnabled);
    };
    window.addEventListener("adminSettingsUpdated", onUpdate);
    return () => window.removeEventListener("adminSettingsUpdated", onUpdate);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("userTheme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const setThemeToggleEnabled = (v: boolean) => {
    setEnabledState(v);
    const s = JSON.parse(localStorage.getItem("adminSettings") || "{}");
    s.themeToggleEnabled = v;
    localStorage.setItem("adminSettings", JSON.stringify(s));
    window.dispatchEvent(new Event("adminSettingsUpdated"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, themeToggleEnabled: enabled, setThemeToggleEnabled }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
