"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const StreetRide = dynamic(() => import("./StreetRide"), {
  ssr: false,
  loading: () => <div className="h-[300vh] bg-slate-100" aria-hidden />
});

export default function DeferredStreetRide() {
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
      { rootMargin: "1200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={trigger} className="min-h-[300vh] bg-slate-100">
      {enabled ? <StreetRide /> : null}
    </div>
  );
}
