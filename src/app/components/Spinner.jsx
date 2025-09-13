"use client";
import React from "react";

export default function Spinner({
  size = 32,      // tamanho do spinner
  color = "#69717d", // cor das blades
  className = "",    // classes extras add se precisar
}) {
  const blades = Array.from({ length: 12 });

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Carregando"
    >
      {blades.map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            width: size * 0.07,
            height: size * 0.28,
            borderRadius: size * 0.055,
            backgroundColor: color,
            transformOrigin: `center -${size * 0.22}px`,
            transform: `rotate(${i * 30}deg)`,
            animation: "spinner-fade 1s infinite linear",
            animationDelay: `${i * 0.083}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes spinner-fade {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
