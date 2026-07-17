import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-wrapper">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Sidebar overlay backdrop (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        style={{
          display: sidebarOpen ? "block" : "none",
          opacity: sidebarOpen ? 1 : 0,
        }}
        onClick={closeSidebar}
      ></div>

      <main className="main-viewport">
        <Topbar onToggleSidebar={toggleSidebar} />

        <div id="sections-viewport" className="sections-viewport">
          {children}
        </div>

        {/* System Status Footer */}
        <footer className="app-footer">
          <div>&copy; 2026 Alpha System Inc. All rights reserved.</div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span>Security: AES-256</span>
            <span>Database: Google Sheets (Active)</span>
            <span id="pwa-status">PWA: Ready Offline</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
