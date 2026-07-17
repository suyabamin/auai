import React, { useEffect, useRef } from "react";
import { useApp } from "../contexts/AppContext";

export default function Topbar({ onToggleSidebar }) {
  const {
    theme,
    toggleTheme,
    accentHue,
    setAccentHue,
    unreadNotifications,
    setUnreadNotifications,
  } = useApp();

  const searchInputRef = useRef(null);

  const colors = [
    { name: "blue", hue: "228", background: "hsl(228, 85%, 60%)" },
    { name: "purple", hue: "270", background: "hsl(270, 80%, 65%)" },
    { name: "green", hue: "145", background: "hsl(145, 80%, 40%)" },
    { name: "yellow", hue: "38", background: "hsl(38, 95%, 50%)" },
    { name: "red", hue: "355", background: "hsl(355, 85%, 55%)" },
  ];

  // Global short-key combinations (Ctrl+K focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="top-nav">
      <div className="topbar-left">
        <button
          id="sidebar-toggle"
          className="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation menu"
        >
          ☰
        </button>
        {/* Global Search Palette */}
        <div className="topbar-search">
          <span className="topbar-search-icon">🔍</span>
          <input
            ref={searchInputRef}
            id="global-search"
            type="text"
            className="topbar-search-input"
            placeholder="Search files, tasks, settings... (Ctrl+K)"
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Accent Color customizer dots */}
        <div
          style={{ display: "flex", gap: "8px", alignItems: "center", marginRight: "10px" }}
          id="accent-selector"
        >
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Accent:
          </span>
          {colors.map((color) => (
            <span
              key={color.hue}
              className={`color-dot ${accentHue === color.hue ? "active" : ""}`}
              style={{ background: color.background }}
              data-hue={color.hue}
              onClick={() => setAccentHue(color.hue)}
            ></span>
          ))}
        </div>

        {/* Theme toggle button */}
        <button
          id="theme-toggle"
          className="topbar-action-btn"
          title="Toggle Light/Dark Theme"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          🌓
        </button>

        {/* Notification Bell */}
        <button
          id="notification-btn"
          className="topbar-action-btn"
          title="Notifications"
          aria-label="View notifications"
          onClick={() => setUnreadNotifications(false)}
        >
          <span>🔔</span>
          {unreadNotifications && <span className="badge-dot" id="unread-dot"></span>}
        </button>
      </div>
    </header>
  );
}
