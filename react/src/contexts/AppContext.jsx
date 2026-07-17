import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [accentHue, setAccentHue] = useState(() => localStorage.getItem("accent-hue") || "228");
  const [unreadNotifications, setUnreadNotifications] = useState(true);

  // Sync theme to documentElement
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync accent hue to style property
  useEffect(() => {
    document.documentElement.style.setProperty("--accent-hue", accentHue);
    localStorage.setItem("accent-hue", accentHue);
  }, [accentHue]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        accentHue,
        setAccentHue,
        unreadNotifications,
        setUnreadNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
