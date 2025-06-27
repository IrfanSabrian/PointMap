import React from "react";

export default function ParticlesCustom({ isDark }: { isDark: boolean }) {
  // Generate partikel hanya sekali
  const polkadotBigList = React.useRef(
    Array.from({ length: 4 }).map(() => {
      const size = Math.random() * 30 + 40; // 40-70px
      const opacity = Math.random() * 0.2 + 0.3; // 0.3-0.5
      return {
        size,
        opacity,
        left: Math.random() * 100,
        top: Math.random() * 100,
        isBig: true,
      };
    })
  );
  const polkadotList = React.useRef(
    Array.from({ length: 30 }).map(() => {
      const size = Math.random() * 20 + 8;
      const opacity = Math.random() * 0.5 + 0.5;
      return {
        size,
        opacity,
        left: Math.random() * 100,
        top: Math.random() * 100,
        isBig: false,
      };
    })
  );
  const allPolkadot = [...polkadotBigList.current, ...polkadotList.current];

  const starList = React.useRef(
    Array.from({ length: 80 }).map(() => {
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.4 + 0.6;
      return {
        size,
        opacity,
        left: Math.random() * 100,
        top: Math.random() * 100,
      };
    })
  );

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
      {!isDark &&
        allPolkadot.map((dot, i) => (
          <div
            key={i}
            className={`rounded-full bg-primary/20 animate-floating-particle`}
            style={{
              position: "absolute",
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              width: dot.size,
              height: dot.size,
              opacity: dot.opacity,
              filter: dot.isBig ? "blur(1px)" : "none",
              background: dot.isBig ? "#3a86ff22" : "#3a86ff44",
              transition: "opacity 0.5s",
            }}
          />
        ))}
      {isDark &&
        starList.current.map((star, i) => (
          <div
            key={i}
            className="rounded-full bg-white animate-twinkle-particle"
            style={{
              position: "absolute",
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              boxShadow: `0 0 6px 1px #fff8`,
              transition: "opacity 0.5s",
            }}
          />
        ))}
    </div>
  );
}
