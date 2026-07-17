import React, { Suspense, useEffect } from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import AppLayout from "./layouts/AppLayout";
import LoadingScreen from "./components/LoadingScreen";
import { registerReactNavigate } from "./js/main.js";

// Lazy-loaded pages
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const ModuleSection = React.lazy(() => import("./pages/ModuleSection"));
const WeatherPage = React.lazy(() => import("./pages/Weather"));

// Navigation bridge to allow old javascript files to routing commands in React Router
function NavigationBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    registerReactNavigate((targetId) => {
      if (targetId === "dashboard" || !targetId) {
        navigate("/");
      } else {
        navigate(`/${targetId}`);
      }
    });
  }, [navigate]);

  // Global click event delegation for data-target and btn-back-dash nodes
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const navigationEl = e.target.closest("[data-target]");
      if (navigationEl) {
        // check if it's already a react link route representation
        if (!navigationEl.closest('a[href^="#/"]')) {
          e.preventDefault();
          const targetId = navigationEl.getAttribute("data-target");
          navigate(targetId === "dashboard" ? "/" : `/${targetId}`);
        }
      }

      if (e.target.closest(".btn-back-dash")) {
        e.preventDefault();
        navigate("/");
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [navigate]);

  // Global keydown listeners (Escape redirect home)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        const path = window.location.hash;
        if (path !== "#/" && path !== "") {
          navigate("/");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <NavigationBridge />
        <AppLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/:sectionId" element={<ModuleSection />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </Router>
    </AppProvider>
  );
}
