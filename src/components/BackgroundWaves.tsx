import React from "react";

const BackgroundWaves: React.FC = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: -1,
      pointerEvents: "none",
      overflow: "hidden",
    }}
  >
    <svg
      width="4000"
      height="1600"
      viewBox="0 0 4000 1600"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        minWidth: "200vw",
        minHeight: "100vh",
        animation: "waveMove 80s linear infinite",
      }}
    >
      <path
        d="M0,1000 Q1000,1600 2000,1000 T4000,1000 V1600 H0 Z"
        fill="#aeefff"
        fillOpacity="0.32"
      />
      <path
        d="M0,1200 Q1000,1800 2000,1200 T4000,1200 V1600 H0 Z"
        fill="#f7bfff"
        fillOpacity="0.22"
      />
      <path
        d="M0,1400 Q1000,2000 2000,1400 T4000,1400 V1600 H0 Z"
        fill="#e0e7ff"
        fillOpacity="0.15"
      />
    </svg>
    {/* Дублируем svg для бесшовности */}
    <svg
      width="4000"
      height="1600"
      viewBox="0 0 4000 1600"
      style={{
        position: "absolute",
        top: 0,
        left: "2000px",
        minWidth: "200vw",
        minHeight: "100vh",
        animation: "waveMove 80s linear infinite",
      }}
    >
      <path
        d="M0,1000 Q1000,1600 2000,1000 T4000,1000 V1600 H0 Z"
        fill="#aeefff"
        fillOpacity="0.32"
      />
      <path
        d="M0,1200 Q1000,1800 2000,1200 T4000,1200 V1600 H0 Z"
        fill="#f7bfff"
        fillOpacity="0.22"
      />
      <path
        d="M0,1400 Q1000,2000 2000,1400 T4000,1400 V1600 H0 Z"
        fill="#e0e7ff"
        fillOpacity="0.15"
      />
    </svg>
    <style>
      {`
        @keyframes waveMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-2000px); }
        }
      `}
    </style>
  </div>
);

export default BackgroundWaves;
