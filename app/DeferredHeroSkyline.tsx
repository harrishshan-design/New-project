"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HeroSkyline = dynamic(() => import("./HeroSkyline"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[linear-gradient(145deg,#0f172a,#0b2930)]" aria-hidden />
});

export default function DeferredHeroSkyline() {
  const trigger = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const node = trigger.current;
    if (!node || !("IntersectionObserver" in window)) {
      setEnabled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setEnabled(true);
        observer.disconnect();
      },
      { rootMargin: "120px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={trigger} className="h-full w-full">
      {enabled ? <HeroSkyline /> : <div className="h-full w-full bg-[linear-gradient(145deg,#0f172a,#0b2930)]" aria-hidden />}
    </div>
  );
}
