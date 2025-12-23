"use client";

import { useEffect, useState } from "react";

const videos = [
  "/hero/donutVid1.mp4",
  "/hero/donutvid2.mp4",
  "/hero/donutvid3.mp4",
  "/hero/donutvid4.mp4",
];

export default function HeroVideoBG() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setActiveIndex(0);
      return;
    }

    const timeout = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % videos.length);
    }, 2000 + Math.random() * 2000);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, reduceMotion]);

  return (
    <div className="hero-video-bg" aria-hidden="true">
      {videos.map((src, index) => (
        <video
          key={src}
          className={`hero-video ${index === activeIndex ? "is-active" : ""}`}
          autoPlay={!reduceMotion}
          muted
          loop={!reduceMotion}
          playsInline
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}
      <div className="hero-video-overlay" />
    </div>
  );
}
