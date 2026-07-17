import React from "react";

export default function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh",
        gap: "1.5rem",
      }}
    >
      <div
        className="anim-pulse"
        style={{
          fontSize: "2.5rem",
          filter: "drop-shadow(0 0 15px var(--primary-glow))",
        }}
      >
        🤖
      </div>
      <div 
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255, 255, 255, 0.1)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spinnerRotation 1s linear infinite"
        }}
      ></div>
      <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>
        Loading modules...
      </div>
    </div>
  );
}
