import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (target) => {
    if (target === "dashboard") {
      return currentPath === "/" || currentPath.toLowerCase() === "/dashboard";
    }
    return currentPath.toLowerCase() === `/${target.toLowerCase()}`;
  };

  const menuSections = [
    {
      title: null,
      items: [
        { id: "dashboard", name: "Dashboard", icon: "🏠" },
        { id: "aiChat", name: "AI Chatbot", icon: "💬" }
      ]
    },
    {
      title: "Cognitive Services",
      items: [
        { id: "voiceRecognition", name: "Voice Control", icon: "🎤" },
        { id: "speechRecognition", name: "Dictation", icon: "🔊" },
        { id: "translator", name: "Translator", icon: "🌐" },
        { id: "ocr", name: "OCR Text Extractor", icon: "🔍" },
        { id: "faceDetection", name: "Face Recognition", icon: "👤" }
      ]
    },
    {
      title: "Productivity",
      items: [
        { id: "todoList", name: "Tasks & To-dos", icon: "✅" },
        { id: "notes", name: "Notes Workspace", icon: "📝" },
        { id: "expenseTracker", name: "Expenses & Budget", icon: "💰" },
        { id: "calendar", name: "Calendar Events", icon: "📅" },
        { id: "reminder", name: "Alarms & Reminders", icon: "🔔" }
      ]
    },
    {
      title: "Utilities & Media",
      items: [
        { id: "weather", name: "Weather Center", icon: "🌦️" },
        { id: "pdfReader", name: "Document Reader", icon: "📄" },
        { id: "calculator", name: "Advanced Calculator", icon: "➗" },
        { id: "qrGenerator", name: "QR & Barcodes", icon: "📱" },
        { id: "camera", name: "Camera Hub", icon: "📷" },
        { id: "musicPlayer", name: "Media Player", icon: "🎵" }
      ]
    }
  ];

  return (
    <aside id="sidebar" className={`app-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">🤖</div>
        <div className="sidebar-logo">Alpha AI</div>
      </div>

      <div className="sidebar-menu-wrapper">
        {menuSections.map((sec, secIdx) => (
          <React.Fragment key={secIdx}>
            {sec.title && <div className="sidebar-section-title">{sec.title}</div>}
            <ul className="sidebar-menu-list">
              {sec.items.map((item) => {
                const active = isActive(item.id);
                const path = item.id === "dashboard" ? "/" : `/${item.id}`;
                return (
                  <li key={item.id}>
                    <Link
                      to={path}
                      className={`sidebar-link ${active ? "active" : ""}`}
                      onClick={onClose}
                    >
                      <span>{item.icon}</span> {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        ))}
      </div>

      {/* Profile Info Footer */}
      <div className="sidebar-footer">
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
          alt="User avatar"
          className="user-avatar"
        />
        <div className="user-info">
          <div className="user-name">Terminal Commander</div>
          <div className="user-role">Lead Architect</div>
        </div>
      </div>
    </aside>
  );
}
