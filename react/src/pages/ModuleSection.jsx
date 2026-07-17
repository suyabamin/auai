import React, { useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { modulesMap } from "../js/main.js";

export default function ModuleSection() {
  const { sectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const activeId = sectionId || "dashboard";
    const mod = modulesMap[activeId];

    if (!mod) {
      console.warn(`Module #${activeId} not found in modules config.`);
      return;
    }

    // Handle Quick Ask Redirect buffer to Chat Core
    let tempInput = null;
    if (activeId === "aiChat" && location.state?.initialPrompt) {
      // Create a temporary hidden input with id "chat-input" 
      // which the legacy aiChat.js will read and process
      tempInput = document.createElement("input");
      tempInput.id = "chat-input";
      tempInput.type = "hidden";
      tempInput.value = location.state.initialPrompt;
      document.body.appendChild(tempInput);
    }

    // Run module init
    try {
      if (typeof mod.init === "function") {
        mod.init();
      }
    } catch (err) {
      console.error(`Failed to execute init() on module ${activeId}:`, err);
    }

    // Clean up temporary buffer if created
    return () => {
      if (tempInput) {
        tempInput.remove();
      }
    };
  }, [sectionId, location.state]);

  return (
    <div 
      ref={containerRef} 
      id={sectionId} 
      className="app-section active"
      key={sectionId}
    >
      <div className="card-glass">
        <div className="placeholder-body">
          <p>Initialising modular interface systems...</p>
        </div>
      </div>
    </div>
  );
}
